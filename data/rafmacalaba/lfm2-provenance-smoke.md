# rafmacalaba/lfm2-provenance-smoke

## Resumen

`rafmacalaba/lfm2-provenance-smoke` es un adaptador LoRA de ajuste fino supervisado (SFT) sobre el modelo base `LiquidAI/LFM2.5-350M`, desarrollado por el usuario rafacalaba. Su propósito es extraer atributos de procedencia de menciones de datos en texto: productor, año, geografía y acrónimo, devolviendo los valores literalmente tal como aparecen en el contexto (modo *verbatim*). El modelo resuelve el problema de anotación automática de metadatos en corpus científicos o periodísticos, donde es necesario identificar quién produce un dato, cuándo, dónde y bajo qué sigla se menciona.

La relevancia actual radica en la creciente necesidad de trazabilidad y transparencia en el uso de datos, especialmente en ámbitos como la investigación reproducible y el periodismo de datos. Al tratarse de un adaptador LoRA de pequeño tamaño (sobre un base de 350M), es ligero y fácil de integrar en pipelines de procesamiento de texto sin requerir infraestructura pesada. El modelo se distribuye bajo licencia Apache 2.0 y los pesos están en formato safetensors.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre modelo base `LiquidAI/LFM2.5-350M` (no se especifica la arquitectura interna del base) |
| Parametros totales | No disponible (el adaptador LoRA tiene r=16, alpha=32; el base tiene 350M parametros) |
| Parametros activos | No disponible (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos en safetensors, probablemente FP16/BF16) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA (r=16, alpha=32, dropout=0.05) entrenado mediante ajuste fino supervisado sobre el modelo base `LiquidAI/LFM2.5-350M`. El entrenamiento se realizó con el dataset `rafmacalaba/data-use-provenance-sft`, durante 2 épocas y con una tasa de aprendizaje de 0.0002. Se aplicó *completion-only masking*, de modo que la pérdida solo se calcula sobre la respuesta JSON generada por el modelo, ignorando el prompt de entrada. Esta técnica permite que el modelo aprenda a emitir exclusivamente la estructura de salida esperada.

El objetivo es la extracción de cuatro atributos de procedencia: productor (entidad que genera el dato), año, geografía (ámbito territorial) y acrónimo (sigla o abreviatura). Los valores deben extraerse literalmente del contexto (modo *verbatim*), lo que se evalúa mediante coincidencia exacta de cadenas. No se dispone de información sobre la arquitectura interna del modelo base, aunque por su nombre (LFM) podría tratarse de un modelo híbrido de la familia Liquid Foundation Models, pero esto no se confirma en la documentación proporcionada.

## Capacidades

- Extracción de atributos de procedencia de menciones de datos: productor, año, geografía y acrónimo.
- Generación de respuestas en formato JSON estructurado con los atributos detectados.
- Extracción *verbatim*: los valores emitidos son subcadenas literales del contexto de entrada (tasa de verbatim del 97,06% en el conjunto de evaluación).
- Especializado en tareas de anotación de metadatos sobre corpus de texto científico o técnico.
- No se reportan capacidades generales de razonamiento, generación de código, tool calling o soporte multilingüe; el modelo está limitado a la tarea específica para la que fue entrenado.

## Casos de uso

- Anotación automática de datasets científicos: el modelo puede procesar artículos de investigación y extraer automáticamente el productor, año, geografía y acrónimo de cada mención de datos, facilitando la creación de metadatos estructurados para repositorios de datos abiertos.
- Enriquecimiento de metadatos en bibliotecas digitales: al integrarse en pipelines de procesamiento de documentos, permite completar fichas catalográficas con información de procedencia de los datos citados, mejorando la búsqueda y recuperación.
- Verificación de fuentes en periodismo de datos: los periodistas pueden usar el modelo para identificar rápidamente qué organismo produce una estadística, en qué año y para qué región, agilizando la contrastación de datos.
- Auditoría de citas en informes técnicos: el modelo ayuda a comprobar si las menciones a conjuntos de datos incluyen todos los atributos necesarios (productor, año, geografía, acrónimo), señalando omisiones.
- Construcción de grafos de conocimiento: la extracción estructurada de atributos permite alimentar bases de conocimiento con relaciones entre entidades (productores, regiones, años) a partir de texto no estructurado.
- Preprocesamiento para sistemas de pregunta-respuesta: al normalizar las menciones de datos en un formato JSON, se facilita la integración con motores de búsqueda semántica o asistentes que necesitan consultar metadatos de forma estructurada.

## Benchmarks y rendimiento

El autor proporciona resultados de evaluación sobre un conjunto de retención (holdout) de n=1000 muestras. La métrica utilizada es coincidencia exacta de cadena de cada atributo emitido contra la etiqueta dorada.

| Atributo | TP | FP | FN | Precision | Recall | F0.5 | F1 |
|---|---|---|---|---|---|---|---|
| producer | 209 | 243 | 203 | 0.4624 | 0.5073 | 0.4707 | 0.4838 |
| year | 268 | 147 | 118 | 0.6458 | 0.6943 | 0.6549 | 0.6692 |
| geography | 399 | 357 | 172 | 0.5278 | 0.6988 | 0.5549 | 0.6014 |
| acronym | 363 | 154 | 51 | 0.7021 | 0.8768 | 0.7313 | 0.7798 |
| **overall** | 1239 | 901 | 544 | 0.5790 | 0.6949 | 0.5990 | 0.6317 |

Además, la tasa de verbatim (valores emitidos que son subcadenas del contexto) es de 2077/2140 = 0.9706. No se proporcionan comparaciones con otros modelos.

## Requisitos de hardware

- Al ser un adaptador LoRA sobre un modelo base de 350M parámetros, la inferencia es ligera.
- VRAM estimada: el modelo base en FP16 ocupa aproximadamente 700 MB; el adaptador añade una cantidad mínima. Es ejecutable en GPUs con 2-4 GB de VRAM, e incluso en CPU con razonable rendimiento.
- GPU recomendadas: cualquier GPU consumer moderna (NVIDIA GTX 1060 6GB o superior, RTX 2060, etc.) o GPUs de datacenter como T4.
- Opciones de despliegue: al ser un modelo de HuggingFace con safetensors, puede cargarse con Transformers y PEFT para aplicar el adaptador. También es compatible con vLLM (si se fusiona el adaptador) o llama.cpp si se convierte a GGUF, aunque no se proporcionan conversiones oficiales.
- Latencia y throughput: no se han publicado mediciones; dado el tamaño reducido, se espera una latencia de milisegundos por petición en GPU y de pocos segundos en CPU.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. No se puede realizar una comparativa objetiva con otras soluciones de extracción de atributos de procedencia.

## Limitaciones y advertencias

- Precisión moderada: la precisión global es de 0.579, lo que indica una tasa considerable de falsos positivos (901 FP en total). En aplicaciones de producción, se recomienda validación humana o umbrales de confianza adicionales.
- Sesgo hacia la extracción *verbatim*: aunque la tasa de verbatim es alta (97%), los errores de coincidencia exacta pueden deberse a variaciones en el formato (mayúsculas, abreviaturas) que no se contemplan en la evaluación.
- Dependencia del contexto: el modelo puede extraer atributos que no son estrictamente correctos si el contexto es ambiguo o contiene múltiples menciones superpuestas, como se observa en los ejemplos de predicción.
- Limitación de idioma: no se especifican los idiomas soportados; el dataset de entrenamiento probablemente esté en inglés, por lo que el rendimiento en otros idiomas es incierto.
- Riesgo de alucinación: al ser un modelo generativo, puede emitir atributos que no están presentes en el texto, aunque la alta tasa de verbatim mitiga parcialmente este riesgo.
- Licencia Apache 2.0: permite uso comercial y modificación, pero el modelo base `LiquidAI/LFM2.5-350M` puede tener su propia licencia; se debe verificar la compatibilidad.
- Sin garantías de producción: el modelo no ha sido probado en entornos reales más allá del conjunto de evaluación del autor; se recomienda realizar pruebas adicionales antes de su despliegue.

## Enlaces

- [HuggingFace - rafacalaba/lfm2-provenance-smoke](https://huggingface.co/rafmacalaba/lfm2-provenance-smoke)
- Modelo base: `LiquidAI/LFM2.5-350M` (no se proporciona enlace directo)
- Dataset de entrenamiento: `rafmacalaba/data-use-provenance-sft` (no se proporciona enlace directo)
