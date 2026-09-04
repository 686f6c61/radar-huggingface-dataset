# augustaklug/bertimbau-large-lener_br-onnx

## Resumen

El modelo `augustaklug/bertimbau-large-lener_br-onnx` es una conversión a ONNX en precisión FP16 del checkpoint `Luciano/bertimbau-large-lener_br`, un clasificador de tokens (NER) fine-tuned sobre el corpus LeNER-Br para textos jurídicos brasileños. El objetivo de esta conversión es permitir la ejecución directa en el navegador mediante la librería Transformers.js con backend WebGPU, evitando la necesidad de un servidor de inferencia. El modelo está desarrollado por Augusta Carla Klug y publicado bajo licencia MIT.

La arquitectura es BERT (encoder-only), con una ventana de contexto máxima de 512 tokens. El archivo ONNX en FP16 ocupa aproximadamente 636,5 MiB. Es una conversión con ONNX opset 14, realizada con ONNX Runtime, sin fusiones de operadores propietarias, lo que facilita su portabilidad. El modelo reconoce seis categorías de entidades del corpus LeNER-Br: `ORGANIZACAO`, `PESSOA`, `TEMPO`, `LOCAL`, `LEGISLACAO` y `JURISPRUDENCIA`.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | BERT (encoder-only transformer) |
| Parámetros totales | No disponible en la información proporcionada |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantización | FP16 |
| Idiomas soportados | Portugués (pt) |
| Licencia | MIT |
| Formato de pesos | ONNX (`model_fp16.onnx`) |

## Arquitectura y entrenamiento

El modelo es un transformer BERT encoder-only. El checkpoint original es una versión fine-tuned de `neuralmind/bert-large-portuguese-cased` sobre el corpus LeNER-Br, un conjunto de documentos legales brasileños. No se especifican ni el volumen de tokens ni la composición exacta del dataset en la información disponible. Tampoco se documentan etapas de RLHF o DPO: el ajuste es puramente de fine-tuning supervisado para token-classification.

La innovación técnica de este repositorio es la conversión a ONNX en FP16 con `onnxruntime.transformers.float16.convert_float_to_float16`, conservando los tipos de entrada y salida (`keep_io_types=True`) y habilitando la inferencia de formas. La conversión no aplica fusiones de operadores (como `Attention`, `BiasGelu` o `SkipLayerNormalization`), por lo que el grafo resultante es simple y compatible con runtimes estándar de ONNX.

## Capacidades

- Extracción de entidades nombradas (NER) en textos legales brasileños, reconociendo seis categorías: `ORGANIZACAO`, `PESSOA`, `TEMPO`, `LOCAL`, `LEGISLACAO` y `JURISPRUDENCIA`.
- Clasificación de tokens a nivel de token (token-classification), no generación de texto libre.
- Inferencia en el navegador mediante Transformers.js con WebGPU, gracias a la conversión a ONNX FP16.
- Soporte limitado a portugués (pt); no incluye soporte multilingüe adicional.
- No soporta tool calling, function calling, agentes, visión ni audio.
- Ventana de contexto limitada a 512 tokens; textos más largos deben truncarse o dividirse en fragmentos con solapamiento.

## Casos de uso

- Extracción de entidades en sentencias judiciales: permite identificar automáticamente las partes (`PESSOA`), los órganos jurisdiccionales (`ORGANIZACAO`/`LEGISLACAO`), las fechas clave (`TEMPO`) y las referencias de jurisprudencia (`JURISPRUDENCIA`) de cada sentencia, agilizando el análisis documental en despachos.

- Revisión de contratos: al procesar cláusulas de contratos en portugués, el modelo resalta las organizaciones contratantes, las personas firmantes, los plazos y las leyes aplicables, lo que facilita la revisión de riesgos y el cumplimiento normativo.

- Enriquecimiento de bases de datos jurídicas: el modelo puede alimentar un pipeline que etiqueta automáticamente documentos judiciales con entidades estructuradas, permitiendo búsquedas por parte, fecha, local o legislación sin intervención humana.

- Asistencia de investigación jurisprudencial: al analizar un lote de acórdãos, el modelo identifica las referencias a legislación y jurisprudencia, de modo que el investigador puede filtrar y agrupar casos por tema y por decisión.

- Aplicaciones de consulta en navegador con WebGPU: gracias a la conversión ONNX, un despacho puede ejecutar el modelo directamente en la pestaña del navegador de un empleado, procesando documentos locales sin enviar datos sensibles a ningún servidor (privacidad y cumplimiento RGPD/LGPD).

- Clasificación automática de peticiones iniciales: al extraer las entidades de una petición, el sistema puede categorizar el tipo de demanda (laboral, civil, penal) según las organizaciones y normativas citadas, automatizando el triaje de casos.

- Integración en plataformas de eDiscovery: el modelo puede procesar grandes volúmenes de correos y documentos legales para identificar personas, fechas y leyes relevantes, reduciendo el tiempo de revisión manual en procesos de descubrimiento probatorio.

## Benchmarks y rendimiento

La información proporcionada no incluye comparativas con otros modelos similares. Sí se documentan las métricas de evaluación del modelo base sobre el conjunto de validación:

| Métrica | Valor |
|---|---|
| Loss | 0,1271 |
| Precision | 0,8965 |
| Recall | 0,9198 |
| F1 | 0,9080 |
| Accuracy | 0,9801 |

Además, la validación de la conversión FP16 frente al FP32 original reporta:

| Métrica | Valor |
|---|---|
| Tokens con mismo argmax (10 frases jurídicas) | 160/160 |
| Error absoluto máximo de logits | 0,00992024 |
| Error absoluto medio de logits | 0,000482765 |

Nota: la validación se realizó con ONNX Runtime y no sustituye una prueba en WebGPU en el navegador.

## Requisitos de hardware

- VRAM estimada: no disponible en la información proporcionada. El archivo ONNX FP16 pesa 636,5 MiB; para secuencias de hasta 512 tokens, se puede estimar un consumo de VRAM inferior a 2 GB en una GPU consumer moderna.
- GPU recomendadas: no se especifican. Al estar pensado para WebGPU, cualquier GPU compatible con este API (incluyendo iGPU de Intel/AMD, Apple Silicon, NVIDIA y AMD discretas) puede ejecutarlo.
- ¿Cabe en GPU de consumo? Sí, de manera holgada, dado el tamaño del modelo en FP16.
- Opciones de despliegue: Transformers.js (con `device: 'webgpu'` y `dtype: 'fp16'`), ONNX Runtime (CPU y GPU), ONNX Runtime Web o cualquier runtime compatible con ONNX.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre alternativas de la misma categoría para comparar. La comparación inmediata es con las variantes del mismo modelo:

| Variante | Formato | Tamaño | Notas |
|---|---|---|---|
| `Luciano/bertimbau-large-lener_br` | PyTorch (FP32) | No disponible | Checkpoint original en HuggingFace |
| `rchuluc/bertimbau-large-lener_br-onnx` | ONNX FP32 | No disponible | Conversión ONNX de referencia |
| `augustaklug/bertimbau-large-lener_br-onnx` | ONNX FP16 | 636,5 MiB | Conversión FP16 para WebGPU |

No se publican comparativas de benchmarks con otros modelos porque no están disponibles en la información proporcionada.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente con corpus jurídico brasileño en portugués; su rendimiento en otros idiomas o dominios legales no está garantizado.
- La ventana de contexto es de 512 tokens. Para documentos extensos se requiere truncamiento o fragmentación con solapamiento, lo que puede perder entidades que dependan de contexto global.
- Es una conversión FP16 sin fusiones de operadores; el rendimiento en WebGPU puede ser inferior al de un modelo optimizado (por ejemplo, con kernels fusionados).
- La validación de la conversión se realizó en ONNX Runtime, no en WebGPU de un navegador. Pueden existir discrepancias en la ejecución real.
- Al ser un clasificador de tokens, las salidas son etiquetas por token; no es un modelo generativo y no produce texto libre ni razonamiento.
- La licencia MIT aplica a este repositorio ONNX; conviene revisar la licencia del checkpoint original y del corpus LeNER-Br antes de un uso comercial amplio.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/augustaklug/bertimbau-large-lener_br-onnx
- Checkpoint original: https://huggingface.co/Luciano/bertimbau-large-lener_br
- Conversión ONNX FP32 de referencia: https://huggingface.co/rchuluc/bertimbau-large-lener_br-onnx
