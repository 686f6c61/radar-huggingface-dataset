# G-reen/model-family-detector

## Resumen

G-reen/model-family-detector es un adaptador de clasificación de texto construido sobre el modelo base unsloth/gemma-3-4b-it mediante LoRA (PEFT). No es un modelo generativo: su salida es una etiqueta, y su propósito es doble, según indican los tags "two-head", "ai-text-detection", "model-attribution" y "llm-family": por un lado detectar si un texto ha sido generado por un LLM, y por otro atribuirlo a una familia concreta de modelos.

El repositorio tiene 0,2 GB, se distribuye con la librería peft en formato safetensors y está pensado para el pipeline text-classification. Solo declara soporte de inglés y su acceso está restringido (gated): es necesario aceptar condiciones en HuggingFace antes de descargarlo. La licencia es compuesta: términos de uso de Gemma más las licencias de los datasets mixtos empleados en el entrenamiento.

Su relevancia actual está en la trazabilidad del texto sintético: la atribución de autoría a una familia de LLM es útil para auditar corpus de entrenamiento, detectar contaminación de benchmarks, verificar integridad académica y etiquetar datos sintéticos. Conviene señalar que el repositorio no incluye paper, métricas publicadas ni descargas registradas, por lo que cualquier uso en producción exige una validación propia previa.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma 3) con adaptadores LoRA y cabecera de clasificación de dos cabezas ("two-head") |
| Parametros totales | ~4 000 M en el modelo base (Gemma 3 4B IT); número de parámetros entrenables del adaptador no disponible |
| Parametros activos | no aplica (arquitectura densa, no es MoE) |
| Longitud de contexto | no disponible en la ficha; el modelo base Gemma 3 4B IT admite hasta 128 000 tokens, dato no verificado para este adaptador |
| Tipos de cuantizacion | no disponible (el repositorio solo publica adaptadores en safetensors) |
| Idiomas soportados | en (inglés) |
| Licencia | gemma-terms-of-use-plus-mixed-dataset-licenses (etiquetada como "other") |
| Formato de pesos | safetensors (adaptador LoRA PEFT, requiere el modelo base) |
| Modelo base | unsloth/gemma-3-4b-it |
| Libreria | peft |
| Pipeline | text-classification |
| Tamano del repositorio | 0,2 GB |
| Acceso | restringido (gated), requiere aceptar condiciones |
| Descargas / likes | 0 / 0 |
| Fecha de publicacion | 2026-10-12 (actualizado el mismo día) |

## Arquitectura y entrenamiento

El sistema parte de Gemma 3 4B IT, un transformer decoder-only denso de aproximadamente 4 000 millones de parámetros, afinado con adaptadores LoRA de bajo rango sobre el que se montan dos cabezas de clasificación. El tag "two-head" y la convivencia de las etiquetas "ai-text-detection" y "model-attribution" sugieren una primera cabeza binaria (texto humano frente a texto generado por IA) y una segunda cabeza de atribución de familia de LLM. Esta interpretación es una inferencia a partir de los tags y de los nombres de los datasets, no una descripción incluida de forma explícita en la ficha del modelo.

Los datasets referenciados (model-family-step1-train/test y model-family-step23-train/test) apuntan a un entrenamiento por etapas: una fase inicial de detección humano/IA y una o varias fases posteriores de clasificación de familia. No se dispone del número de tokens de entrenamiento, de la composición del corpus, del número de familias cubiertas ni de si hubo etapas de RLHF o DPO (el modelo base sí está alineado por instrucciones, pero el adaptador es de clasificación). Tampoco se documentan innovaciones técnicas adicionales como decodificación especulativa, atención lineal o mecanismos híbridos. El entrenamiento se realizó con Unsloth, según el propio modelo base empleado.

## Capacidades

- Clasificación de secuencias de texto en inglés mediante el pipeline text-classification.
- Detección de texto generado por IA (cabeza binaria), presumiblemente entrenada en la etapa "step1".
- Atribución de familia de LLM (model attribution), presumiblemente entrenada en las etapas "step23".
- Discriminación entre salidas de distintos modelos, orientada a trazabilidad y procedencia del texto.
- Funcionamiento como adaptador PEFT sobre Gemma 3 4B IT: requiere cargar el modelo base y aplicar el adaptador.
- Integración en pipelines de HuggingFace Transformers y PEFT, con pesos en safetensors.
- Soporte de tool calling / function calling: no disponible; es un clasificador, no un modelo de instrucciones en su uso previsto.
- Soporte de agentes y razonamiento multi-paso: no disponible; no es un modelo de razonamiento.
- Capacidades multilingües: no; solo se declara inglés.
- Modo "thinking", visión o audio: no disponible para este adaptador. El modelo base Gemma 3 4B IT es multimodal de entrada, pero la ficha no indica que el adaptador conserve ni explote esa capacidad.

## Casos de uso

- Auditoría de corpus de entrenamiento: pasar los documentos de un dataset por las dos cabezas para cuantificar qué proporción es sintética y de qué familias proviene, antes de decidir su inclusión en un entrenamiento posterior.
- Detección de contaminación de benchmarks: comprobar si los ítems de un conjunto de evaluación aparecen ya generados o parafraseados por modelos concretos, lo que invalidaría la medición.
- Integridad académica y revisión editorial: triaje de manuscritos, trabajos de fin de grado o artículos enviados a revisión para señalar textos con alta probabilidad de generación automática antes de la revisión humana.
- Moderación de contenido en plataformas: etiquetado automático de publicaciones y comentarios generados masivamente por LLM, como señal previa a una revisión más costosa.
- Curaduría de datos sintéticos: etiquetar un banco de datos generados por distintos modelos para separar por familia y evitar mezclas no deseadas en el entrenamiento.
- Evaluación comparativa de modelos: dado un conjunto de respuestas sin identificar, inferir qué familia las produjo y verificar que un pipeline de evaluation está usando realmente el modelo declarado.
- Análisis OSINT y de campañas de desinformación: atribuir lotes de textos coordinados a una familia de modelos concreta como indicio técnico dentro de una investigación mayor.
- Control de calidad en pipelines de generación: filtrar la salida de un sistema generativo antes de publicarla, marcando contenido que un clasificador independiente considere artificial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye métricas de exactitud, F1, precisión por familia ni comparaciones con líneas base, y no se han encontrado referencias externas en la búsqueda web realizada.

## Requisitos de hardware

- Pesos del modelo base en bf16: aproximadamente 8-9 GB solo para los parámetros, más el adaptador (0,2 GB) y las dos cabezas.
- Pesos del modelo base en cuantización de 4 bits: aproximadamente 3-4 GB, más overhead de activaciones y caché KV.
- VRAM estimada: del orden de 10-12 GB en bf16 con lotes pequeños, y de 6-8 GB en 4 bits. Son estimaciones por tamaño del modelo base, no medidas publicadas para este adaptador.
- GPU de consumo: cabe en tarjetas de 12 GB o más (RTX 3060 12 GB, RTX 4070, RTX 4080, RTX 4090) y en equipos Apple Silicon con suficiente memoria unificada; en GPUs de 8 GB solo con cuantización agresiva y lotes muy pequeños.
- GPU de centro de datos: A100 40/80 GB, H100 o L40S para clasificación por lotes a gran escala.
- Opciones de despliegue: Transformers junto con PEFT es la vía natural, porque las cabezas de clasificación personalizadas no se sirven de forma estándar en vLLM, TGI o llama.cpp. Ollama y llama.cpp no son aplicables al ser un adaptador de clasificación, no un modelo generativo con pesos GGUF.
- Conversión posible a ONNX o TorchScript para servir el backbone más las cabezas en producción de baja latencia; no documentada en el repositorio.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Enfoque | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| G-reen/model-family-detector | Dos cabezas (detección IA + atribución de familia) sobre Gemma 3 4B con LoRA | ~4 000 M (base) | no disponible | en | gemma-terms-of-use-plus-mixed-dataset-licenses | gated, 0 descargas |
| openai-community/roberta-base-openai-detector | Clasificador binario humano/GPT-2 basado en RoBERTa | ~125 M | 512 tokens (RoBERTa base) | en | MIT | público |
| Hello-SimpleAI/chatgpt-detector-roberta | Clasificador binario humano/ChatGPT basado en RoBERTa | ~125 M | 512 tokens (RoBERTa base) | en | no disponible | público |
| Binoculars (enfoque zero-shot) | Detección sin entrenamiento mediante perplejidad de pares de modelos | depende de los modelos usados | depende de los modelos usados | multilingüe según modelos | según modelos base | código abierto |

No se dispone de cifras de rendimiento comparadas para ninguno de estos sistemas en la información proporcionada; la comparación se limita a enfoque, tamaño y licencia. La ventaja diferencial de este modelo es la segunda cabeza de atribución de familia, ausente en los detectores binarios de RoBERTa.

## Limitaciones y advertencias

- Solo admite inglés; cualquier texto en otro idioma queda fuera de su dominio declarado.
- No hay métricas publicadas: se desconoce la tasa de falsos positivos y falsos negativos, lo que impide fijar umbrales de decisión con garantías.
- Sesgo hacia las familias de LLM presentes en los datasets step1 y step23; modelos posteriores o poco representados pueden clasificarse erróneamente o confundirse con texto humano.
- Degradación esperable ante texto humano parafraseado o editado con asistencia de LLM, y ante fragmentos cortos con poca señal estadística.
- Riesgo de alucinación: no aplica como generador, pero la salida probabilística puede presentarse con una confianza excesiva si no se calibra sobre datos propios.
- Licencia compuesta: los términos de uso de Gemma imponen restricciones específicas y se suman a las licencias de los datasets mixtos; es obligatorio revisarlas antes de cualquier uso comercial.
- Acceso restringido en HuggingFace: la descarga requiere aceptar condiciones, lo que complica la automatización de pipelines.
- Sin paper, sin modelo card detallada y con 0 descargas y 0 likes en el momento de la consulta; el repositorio se publicó y actualizó el mismo día.
- Los pesos no son autónomos: dependen del modelo base unsloth/gemma-3-4b-it y de la librería peft, lo que añade una dependencia de versiones en producción.
- Uso en contextos de alto impacto (evaluación académica, decisiones disciplinarias) no está respaldado por ninguna validación publicada y requeriría revisión humana obligatoria.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/G-reen/model-family-detector
- Modelo base: https://huggingface.co/unsloth/gemma-3-4b-it
- Dataset de entrenamiento (step1): https://huggingface.co/datasets/G-reen/model-family-step1-train
- Dataset de evaluación (step1): https://huggingface.co/datasets/G-reen/model-family-step1-test
- Dataset de entrenamiento (step23): https://huggingface.co/datasets/G-reen/model-family-step23-train
- Dataset de evaluación (step23): https://huggingface.co/datasets/G-reen/model-family-step23-test
- Paper, blog o repositorio adicional: no disponible
- La búsqueda web realizada no devolvió enlaces relevantes sobre este modelo; los únicos resultados obtenidos fueron páginas generales de motores de búsqueda y entradas enciclopédicas sobre la letra "G", sin relación con el modelo.
