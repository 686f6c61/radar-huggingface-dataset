# ggml-org/LFM3-1.7B-GGUF

## Resumen

LFM3-1.7B-GGUF es la conversión a formato GGUF del modelo LFM3-1.7B desarrollado por LiquidAI, publicada por el equipo de ggml-org (los mantenedores de llama.cpp). Se trata de un modelo de generación de texto de 1.728.801.600 parámetros (aproximadamente 1,7 mil millones) orientado a conversación y despliegue en entornos de inferencia local mediante llama.cpp y herramientas compatibles.

El modelo base pertenece a la familia LFM3 de LiquidAI, sucesora de las arquitecturas LFM anteriores. La conversión a GGUF permite ejecutar el modelo en CPU, GPU o configuraciones híbridas con cuantizaciones de 8 y 4 bits, lo que lo hace adecuado para hardware de consumo y despliegues edge. El repositorio incluye cuantizaciones Q8_0 y Q4_K_M idénticas a las publicadas por LiquidAI, además de una variante Q4_0 entrenada con Quantization-Aware Distillation (QAD) para recuperar la precisión perdida por la cuantización agresiva.

La relevancia de esta publicación radica en que facilita el acceso al modelo en el ecosistema llama.cpp con una build específica que añade soporte para la arquitectura LFM3 (PR #31252). La licencia es LFM1.0 (lfm1.0), que conviene revisar con detalle antes de cualquier uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base LiquidAI LFM3; arquitectura concreta no especificada en la informacion proporcionada) |
| Parametros totales | 1.728.801.600 |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0, Q4_K_M, Q4_0 (QAD, publicada por LiquidAI) |
| Idiomas soportados | no disponible |
| Licencia | LFM1.0 (lfm1.0) |
| Formato de pesos | GGUF (repo de 6,4 GB; modelo base en safetensors) |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo base LFM3-1.7B en la documentación proporcionada. El modelo procede de LiquidAI y cuenta con 1.728.801.600 parámetros, lo que lo sitúa en la categoría de modelos pequeños para generación de texto y uso conversacional. La model card del repositorio GGUF no incluye detalles sobre el tipo de transformer, mecanismos de atención, composición del dataset de entrenamiento, número de tokens vistos ni si se aplicaron técnicas de alineación como RLHF o DPO.

La innovación técnica destacable de esta publicación es el proceso de conversión y cuantización. Las variantes Q8_0 y Q4_K_M replican exactamente las cuantizaciones de LiquidAI, mientras que la Q4_0 se ha producido mediante Quantization-Aware Distillation (QAD), un procedimiento de entrenamiento que busca recuperar la precisión perdida tras cuantizar a 4 bits con el esquema Q4_0. Además, el modelo requiere una build de llama.cpp que incluya soporte para LFM3 (PR #31252 del repositorio ggml-org/llama.cpp), lo que implica que la arquitectura no está cubierta por versiones anteriores del runtime.

## Capacidades

- Generación de texto conversacional: el pipeline declarado es text-generation y el tag conversational, orientado a diálogo multi-turno.
- Conversión y despliegue local: formato GGUF compatible con llama.cpp, llama.app y herramientas del ecosistema ggml.
- Cuantización flexible: variantes Q8_0, Q4_K_M y Q4_0 (QAD) para distintos compromisos entre tamaño y precisión.
- Compatibilidad con endpoints: el repositorio incluye el tag endpoints_compatible.
- Capacidades de tool calling, function calling, agentes, razonamiento multi-paso, matemáticas, código, visión o audio: no disponibles en la información proporcionada.
- Capacidades multilingües: no disponibles; no se especifican idiomas soportados.

## Casos de uso

- Asistente conversacional local: el modelo puede desplegarse con `llama serve -hf ggml-org/LFM3-1.7B-GGUF` para gestionar diálogos multi-turno en estaciones de trabajo sin conexión, aprovechando su tamaño reducido y las cuantizaciones de 4 bits.
- Prototipado rápido de chatbots: gracias a su formato GGUF y a la integración con llama.app, permite validar flujos conversacionales en local antes de escalar a modelos mayores.
- Inferencia en dispositivos edge: con 1,7 mil millones de parámetros y cuantización Q4_K_M, puede ejecutarse en equipos con recursos limitados de memoria, como mini-PC o portátiles sin GPU dedicada.
- Evaluación comparativa de cuantizaciones: las variantes Q8_0, Q4_K_M y Q4_0 (QAD) permiten medir en producción la degradación de calidad frente al ahorro de memoria, útil para calibrar despliegues.
- Integración en pipelines de generación de texto por lotes: mediante llama.cpp se puede automatizar la producción de resúmenes, clasificaciones o respuestas plantilla en entornos con CPU.
- Entornos educativos y de investigación: su licencia y tamaño lo hacen manejable para experimentos de ajuste fino o evaluación de técnicas de cuantización en laboratorios con hardware modesto.
- Servicio ligero de atención al cliente: para volúmenes moderados y dominios acotados, un modelo de 1,7B cuantizado puede cubrir respuestas frecuentes con latencia baja en hardware de consumo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa por tamaño de pesos, Q8_0 ocuparía del orden de 1,8-2 GB y Q4_K_M del orden de 1-1,2 GB, aunque estas cifras no están confirmadas en la información proporcionada.
- GPU recomendadas: no disponibles. Por tamaño, el modelo es apto para GPUs de consumo, pero no se especifican modelos concretos (A100, H100, RTX 4090, etc.).
- Cabe en GPU de consumo: previsiblemente sí, dado el tamaño de 1,7B y las cuantizaciones de 4 bits, aunque no se confirma en la documentación.
- Opciones de despliegue: llama.cpp (requiere build con soporte LFM3, PR #31252), llama.app (`llama serve -hf ggml-org/LFM3-1.7B-GGUF`). Compatibilidad con vLLM, Ollama o TGI no confirmada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| LFM3-1.7B-GGUF (este) | 1.728.801.600 | no disponible | LFM1.0 | GGUF | Conversión oficial de ggml-org, cuantizaciones Q8_0/Q4_K_M/Q4_0 QAD |
| LiquidAI/LFM3-1.7B | 1.728.801.600 | no disponible | LFM1.0 | safetensors | Modelo base original del que deriva esta conversión |
| LiquidAI/LFM3-1.7B-GGUF | 1.728.801.600 | no disponible | LFM1.0 | GGUF | Cuantizaciones publicadas por LiquidAI, incluye Q4_0 QAD |

No se dispone de información sobre otros modelos comparables de la misma categoría (1-2B parámetros) en la documentación proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles en la información proporcionada; al ser un modelo conversacional, es previsible que herede sesgos de sus datos de entrenamiento, pero no se documentan.
- Riesgo de alucinación: no cuantificado; los modelos de 1,7B suelen presentar mayor propensión a errores factuales que modelos mayores, aunque no hay datos específicos para este modelo.
- Limitaciones de contexto e idioma: la longitud de contexto y los idiomas soportados no están documentados, lo que impide garantizar su comportamiento en contextos largos o en castellano.
- Restricciones de licencia: la licencia LFM1.0 (lfm1.0) es de tipo "other"; es imprescindible revisar el texto completo en el enlace de licencia antes de cualquier uso comercial.
- Dependencia de build específica: requiere una versión de llama.cpp con soporte LFM3 (PR #31252); versiones anteriores no cargarán el modelo.
- Conversión automática: la model card indica que el modelo se ha convertido automáticamente con ggml-org/convert, sin validación manual exhaustiva documentada.
- Model card incompleta: el README incluye un apartado "TODOs - add info", por lo que faltan detalles técnicos y de evaluación.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/ggml-org/LFM3-1.7B-GGUF
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B
- Cuantizaciones oficiales de LiquidAI: https://huggingface.co/LiquidAI/LFM3-1.7B-GGUF
- Licencia LFM1.0: https://huggingface.co/LiquidAI/LFM3-1.7B/blob/main/LICENSE
- PR de soporte LFM3 en llama.cpp: https://github.com/ggml-org/llama.cpp/pull/31252
- Herramienta de conversión: https://github.com/ggml-org/convert
- llama.app: https://llama.app
