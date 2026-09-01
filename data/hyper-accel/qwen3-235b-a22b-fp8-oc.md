# hyper-accel/Qwen3-235B-A22B-FP8-OC

## Resumen

El modelo `hyper-accel/Qwen3-235B-A22B-FP8-OC` es una versión cuantizada en FP8 del modelo de mezcla de expertos (MoE) Qwen3-235B-A22B, desarrollado por el equipo de HyperAccel. Esta variante reduce el peso de los parámetros de atención y de las matrices de los expertos a precisión E4M3FN con una escala FP32 por canal de salida, empaquetados en el formato propietario Bertha EVT0. El objetivo es permitir la inferencia de un modelo de 235 mil millones de parámetros totales (22 mil millones activos) con un menor consumo de memoria y un mayor rendimiento en hardware compatible, sin necesidad de generar un checkpoint intermedio completo.

La relevancia de este modelo radica en que ofrece una alternativa optimizada para despliegue en producción del Qwen3-235B-A22B, uno de los MoE más grandes de la familia Qwen, manteniendo la licencia Apache 2.0. Sin embargo, requiere el plugin específico de HyperAccel para vLLM, lo que limita su portabilidad a otros entornos de inferencia. No se dispone de información pública sobre el contexto, idiomas o benchmarks específicos de esta versión cuantizada.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) basada en transformer, derivada de Qwen3-235B-A22B |
| Parametros totales | 235.793.608.192 (235B) |
| Parametros activos | 22B (según nomenclatura A22B del modelo base) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP8 (E4M3FN) con escala FP32 por canal de salida en atención y expertos; resto en BF16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (formato Bertha EVT0) |

## Arquitectura y entrenamiento

El modelo es una cuantización del checkpoint `Qwen/Qwen3-235B-A22B` en su revisión `8efa61729e24bd65b1d152b5ab5409052aa80e65`. La arquitectura subyacente es un transformer MoE con 235B parámetros totales y 22B activos por token, tal como se define en el modelo base. La conversión a FP8 aplica el esquema E4M3FN con una escala por canal de salida, siguiendo el mismo esquema de cuantización que LLM Compressor, pero empaquetado en el formato Bertha EVT0 sin generar un checkpoint intermedio de modelo completo. Los parámetros que no pertenecen a atención ni a los expertos permanecen en BF16.

No se proporcionan datos sobre el entrenamiento original (número de tokens, composición del dataset, fases de RLHF o DPO) ni sobre el proceso de calibración de la cuantización. El checkpoint requiere el plugin HyperAccel vLLM para su ejecución, lo que indica una integración específica con ese motor de inferencia.

## Capacidades

- Generación de texto y razonamiento: al ser una variante cuantizada del Qwen3-235B-A22B, hereda las capacidades del modelo base, que incluyen razonamiento avanzado, seguimiento de instrucciones y soporte multilingüe (aunque no se especifican los idiomas concretos en esta ficha).
- Soporte de tool calling y function calling: el modelo base Qwen3-235B-A22B incluye estas capacidades, por lo que se espera que la versión cuantizada las conserve, aunque no hay confirmación explícita en la información disponible.
- Capacidades de agente y razonamiento multi-paso: el modelo base está diseñado para tareas de agente y planificación, por lo que esta variante debería mantener dichas funcionalidades.
- Inferencia eficiente en memoria: la cuantización FP8 reduce el uso de VRAM en comparación con el checkpoint BF16 original, permitiendo desplegar el modelo en hardware con menos memoria o con mayor throughput.
- Formato de pesos propietario: el uso de Bertha EVT0 y el plugin HyperAccel limita la portabilidad a otros frameworks (llama.cpp, TGI, etc.) que no soporten este formato.

## Casos de uso

- Despliegue de un LLM MoE de gran tamaño en producción con vLLM: el modelo está diseñado para ejecutarse con el plugin HyperAccel vLLM, lo que permite servir el Qwen3-235B-A22B con menor huella de memoria que la versión BF16, adecuado para entornos con GPUs múltiples (por ejemplo, 8x H100 80GB).
- Razonamiento y resolución de problemas complejos: gracias a las capacidades del modelo base, puede utilizarse en aplicaciones de análisis técnico, generación de informes o asistencia en investigación, donde se requiere razonamiento multi-paso.
- Generación de código y asistencia a programación: el Qwen3-235B-A22B destaca en tareas de código; esta versión cuantizada permite integrarlo en entornos de desarrollo con restricciones de memoria.
- Automatización de agentes conversacionales: con soporte de tool calling, puede orquestar llamadas a APIs y ejecutar acciones en sistemas externos, por ejemplo en asistentes virtuales empresariales.
- Procesamiento de documentos largos: aunque no se especifica la longitud de contexto, el modelo base soporta ventanas amplias; esta variante podría usarse para resumir o extraer información de documentos extensos si el contexto se mantiene.
- Investigación en eficiencia de inferencia: el formato Bertha EVT0 y la cuantización por canal son de interés para equipos que estudian técnicas de compresión de modelos y su impacto en rendimiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de datos de MMLU, HumanEval, GSM8K ni otras evaluaciones para esta versión cuantizada. Se recomienda consultar los benchmarks del modelo base Qwen3-235B-A22B para una referencia aproximada, aunque la cuantización FP8 puede introducir ligeras variaciones en el rendimiento.

## Requisitos de hardware

- VRAM estimada para inferencia: con 235B parámetros en FP8 (1 byte por parámetro), los pesos ocupan aproximadamente 235 GB. Añadiendo overhead de activaciones, KV cache y buffers, se estima un mínimo de 240-260 GB de VRAM. Esto requiere múltiples GPUs, por ejemplo 4x A100 80GB o 8x H100 80GB.
- GPU recomendadas: H100, A100 (80GB) o GPUs con soporte FP8 nativo (por ejemplo, H100, H200, MI300X). No cabe en GPUs de consumo como RTX 4090 (24GB) ni en configuraciones de una sola GPU.
- Opciones de despliegue: exclusivamente con vLLM y el plugin HyperAccel. No es compatible con llama.cpp, Ollama o TGI sin adaptaciones adicionales.
- Latencia y throughput: no se proporcionan datos concretos. Se espera que la cuantización FP8 mejore el throughput respecto a BF16 en hardware con soporte FP8, pero los valores exactos dependen de la configuración del servidor y la carga.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Activos | Cuantización | Contexto | Licencia | Formato |
|---|---|---|---|---|---|---|
| Qwen3-235B-A22B (base) | 235B | 22B | BF16 | no disponible | Apache 2.0 | safetensors |
| Qwen3-235B-A22B-FP8 (oficial Qwen) | 235B | 22B | FP8 | no disponible | Apache 2.0 | safetensors |
| hyper-accel/Qwen3-235B-A22B-FP8-OC | 235B | 22B | FP8 (E4M3FN, escala por canal) | no disponible | Apache 2.0 | safetensors (Bertha EVT0) |

La diferencia principal frente a la versión FP8 oficial de Qwen es el formato de empaquetado (Bertha EVT0) y la dependencia del plugin HyperAccel. No se dispone de datos comparativos de rendimiento entre ambas variantes.

## Limitaciones y advertencias

- Requiere el plugin propietario HyperAccel vLLM; sin él, el checkpoint no es ejecutable en entornos estándar de vLLM u otros frameworks.
- El formato de pesos Bertha EVT0 no es estándar, lo que dificulta la interoperabilidad con herramientas de la comunidad (llama.cpp, transformers, etc.).
- No se ha publicado información sobre sesgos, alucinaciones o limitaciones idiomáticas específicas de esta versión. Se asumen los riesgos del modelo base Qwen3-235B-A22B.
- La cuantización FP8 puede degradar ligeramente la precisión en tareas sensibles a la calidad numérica, aunque no se han cuantificado estos efectos.
- El tamaño del repositorio (237.1 GB) implica costes de almacenamiento y transferencia considerables.
- No se especifica la longitud de contexto soportada tras la cuantización; podría verse afectada por la implementación del plugin.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hyper-accel/Qwen3-235B-A22B-FP8-OC
- Modelo base Qwen3-235B-A22B: https://huggingface.co/Qwen/Qwen3-235B-A22B
- Versión FP8 oficial de Qwen: https://huggingface.co/Qwen/Qwen3-235B-A22B-FP8
- Guía de implementación de Qwen3 (GitHub): https://github.com/HarleyCoops/Qwen3/blob/main/qwen3_implementation_guide.ipynb.md
- Documentación de vLLM Ascend para Qwen3-235B-A22B: https://docs.vllm.ai/projects/ascend/en/latest/tutorials/models/Qwen3-235B-A22B.html
- Receta de despliegue con TensorRT-LLM (referencia): https://github.com/ai-dynamo/dynamo/blob/main/recipes/qwen3-235b-a22b-fp8/README.md
