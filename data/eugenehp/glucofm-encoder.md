# eugenehp/glucofm-encoder

## Resumen

GlucoFM es un modelo fundacional de representación para monitorización continua de glucosa (CGM), desarrollado por eugenehp como una reimplementación y conversión del modelo GlucoFM descrito en el paper arXiv:2605.30865. Está pensado para extraer embeddings de series temporales de glucosa de 24 horas y transferirlos a tareas metabólicas como riesgo de diabetes, resistencia a la insulina, disfunción de células beta o respuesta glucémica postprandial.

El modelo utiliza una arquitectura dual-stream state-event basada en JEPA (Joint Embedding Predictive Architecture), que separa las tendencias glucémicas lentas de las desviaciones transitorias antes de fusionarlas. El encoder publicado tiene 435.633 parámetros, una ventana de 288 pasos de 5 minutos (24 horas) y una dimensión oculta de 128. Este repositorio no contiene los pesos oficiales de Google (que no son públicos), sino una reconstrucción comunitaria de OpenCGM convertida a múltiples formatos para el ecosistema Rust de `glucofm` y para ONNX.

El modelo es relevante en el ámbito de la salud digital porque ofrece representaciones transferibles de señales CGM, un dominio donde hay pocos modelos de fundación accesibles. Su tamaño extremadamente reducido permite ejecutarlo en entornos con recursos limitados, lo que facilita su integración en pipelines de investigación clínica y prototipos de monitorización.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder dual-stream state-event (JEPA) |
| Parametros totales | 435.633 (encoder con mask_token y online/gaussian.rho); 732.593 (objetivo completo con cabezas JEPA) |
| Longitud de contexto | 288 pasos de 5 minutos (ventana de 24 horas) |
| Tipos de cuantizacion | F32, F16, Q8_0 (GGUF); RLXP F16 |
| Idiomas soportados | No disponible (modelo de series temporales, no de lenguaje) |
| Licencia | MIT (pesos y empaquetado de este repo) |
| Formato de pesos | Safetensors (F32/F16), RLXP (F32/F16), GGUF (F32/F16/Q8_0), bin nativo GLFM, ONNX (opset 17) |

## Arquitectura y entrenamiento

El modelo es un encoder dual-stream que procesa registros de glucosa alineados a una cuadrícula cronológica de 24 horas, manteniendo máscaras de observación para las muestras ausentes. Un stream modela las tendencias glucémicas lentas (state) y otro las desviaciones transitorias (event), para después fusionar ambas representaciones. El diseño se basa en JEPA, una arquitectura de aprendizaje auto-supervisado, y produce embeddings de 128 dimensiones por ventana.

Los pesos publicados corresponden a una reconstrucción del proyecto OpenCGM. No se especifica el tamaño exacto ni la composición del dataset de entrenamiento en la información disponible. El fichero `glucofm_encoder.onnx.meta.json` indica que el modelo de referencia se entrenó hasta el epoch 40 con seed 17. No se menciona ningún ajuste mediante RLHF o DPO, ya que el modelo no está orientado a generación de texto.

La conversión se realizó con la herramienta `glucofm convert_weights --all`, generando salidas en safetensors, GGUF, RLXP y formato nativo GLFM. El tensor `online/mask_token` (128 elementos) está omitido en los pesos upstream, y `glucofm` lo inicializa a ceros durante la inferencia.

## Capacidades

- Extracción de representaciones (embeddings) de series temporales de glucosa de 24 horas, con salida de 128 dimensiones.
- Modelado dual de tendencias glucémicas lentas y desviaciones a corto plazo, lo que permite capturar tanto el estado basal como los picos postprandiales.
- Aprendizaje auto-supervisado con máscaras de observación, útil para registros CGM incompletos o irregulares.
- Representaciones transferibles para tareas metabólicas: riesgo de diabetes, resistencia a la insulina, disfunción de células beta y respuesta glucémica postprandial.
- Soporte de múltiples formatos de pesos (safetensors, GGUF, RLXP, bin, ONNX) para interoperabilidad.
- No es un modelo generativo de texto, por lo que no admite tool calling, agentes conversacionales ni razonamiento simbólico.

## Casos de uso

- Investigación en metabólica: usar el encoder para obtener embeddings de registros CGM de un conjunto de pacientes y alimentar clasificadores supervisados de riesgo de diabetes, reduciendo la necesidad de ingeniería manual de características.
- Sistemas de alerta temprana: integrar el modelo en un pipeline que analice ventanas deslizantes de 24 horas y genere representaciones de desviaciones transitorias para detectar hipoglucemias o hiperglucemias agudas.
- Personalización de terapia: extraer descriptores de la respuesta glucémica postprandial para ajustar horarios o dosis de insulina en sistemas de lazo cerrado, siempre con supervisión clínica.
- Análisis retrospectivo de cohortes: alinear registros irregulares a una cuadrícula de 24 horas preservando máscaras de observación, lo que permite comparar métricas de glucosa entre pacientes con distinta frecuencia de medición.
- Experimentación con MLOps en Rust: cargar los pesos RLXP o safetensors en el runtime `glucofm` para prototipos de inferencia en servidores o dispositivos edge, gracias al tamaño ligero del modelo.
- Conversión de formatos y pruebas de compresión: utilizar los checkpoints GGUF F16 o Q8_0 para evaluar el impacto de la cuantización en el rendimiento de representaciones, o para integrar el modelo en stacks basados en ONNX.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La documentación del repositorio no incluye métricas numéricas de rendimiento como MMLU, HumanEval o GSM8K, que además no son aplicables a un modelo de series temporales. El paper original y el blog de Google mencionan mejoras en tareas metabólicas, pero no se detallan cifras concretas accesibles en esta fuente.

## Requisitos de hardware

- VRAM estimada: menos de 2 GB; en realidad los pesos F32 ocupan aproximadamente 1,74 MB, por lo que el modelo cabe en cualquier GPU, incluida una integrada.
- GPU recomendada: no se requiere una GPU específica. La inferencia puede ejecutarse en CPU para cargas de trabajo de baja volumetría.
- Compatibilidad con consumer GPU: sí, el modelo es trivial de ejecutar en cualquier hardware actual.
- Opciones de despliegue: runtime nativo de `glucofm` (Rust) para pesos safetensors, RLXP o bin; ONNX Runtime para el fichero ONNX. No es adecuado para vLLM o TGI, diseñados para modelos generativos.
- Latencia: no disponible. Dado el tamaño del modelo, se espera una latencia de milisegundos, pero no hay mediciones publicadas.

## Comparativa con modelos similares

No disponible. En la información proporcionada no se incluyen datos verificables de otros modelos comparables de monitorización de glucosa. El upstream `sfourdrinier/opencgm-stateevent` contiene el encoder original de OpenCGM, pero no se dispone de especificaciones detalladas ni benchmarks para comparar. Por su parte, el GlucoFM original de Google no es público, por lo que no se puede establecer una comparativa directa.

## Limitaciones y advertencias

- Los pesos no son oficiales de Google GlucoFM, sino una reconstrucción comunitaria del proyecto OpenCGM, lo que puede implicar diferencias de comportamiento frente al modelo descrito en el paper.
- No es un consejo médico. El uso debe limitarse a investigación y desarrollo, y nunca para decisiones clínicas reales sin validación y supervisión profesional.
- La licencia MIT aplica a este repositorio, pero las licencias upstream de OpenCGM o del paper original pueden imponer términos adicionales, especialmente para uso comercial. Se recomienda revisar esos proyectos antes de comercializar soluciones.
- La ventana de contexto está fijada en 24 horas (288 pasos de 5 minutos). No soporta secuencias más largas de forma nativa; para períodos superiores habría que encadenar ventanas.
- No se ha publicado documentación sobre sesgos de los datos de entrenamiento, por lo que los embeddings pueden reflejar sesgos poblacionales si la cohorte original no era representativa.
- No es un modelo de lenguaje: no puede generar texto, mantener conversaciones ni seguir instrucciones en lenguaje natural.

## Enlaces

- Página del modelo: https://huggingface.co/eugenehp/glucofm-encoder
- Paper original: https://arxiv.org/abs/2605.30865
- Versión HTML del paper: https://arxiv.org/html/2605.30865
- Blog de Google sobre GlucoFM: https://research.google/blog/glucofm-foundation-model-for-continuous-glucose-monitoring/
- Upstream OpenCGM en HuggingFace: https://huggingface.co/sfourdrinier/opencgm-stateevent
- Repositorio OpenCGM: https://github.com/sfourdrinier/opencgm
- Crate Rust `glucofm`: https://crates.io/crates/glucofm
