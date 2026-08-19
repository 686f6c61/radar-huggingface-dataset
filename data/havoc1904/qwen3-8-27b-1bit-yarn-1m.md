# Havoc1904/Qwen3.8-27B-1Bit-YaRN-1M

## Resumen

Este repositorio, creado por Havoc1904, documenta un pipeline reproducible para transformar el modelo Qwen3.8-27B de Qwen (arquitectura `Qwen3_5ForConditionalGeneration`, 27.000 millones de parámetros, contexto nativo de 256K tokens) en archivos GGUF cuantizados a 1 bit (IQ1) con escalado de contexto YaRN hasta 1 millón de tokens. El resultado son pesos de aproximadamente 6-7 GB que permiten ejecutar un modelo de 27B con ventana de contexto extrema en hardware muy limitado, algo que de otra forma sería inviable.

La relevancia actual de este trabajo radica en que aborda dos problemas prácticos: el alto coste de memoria de los modelos grandes y la necesidad de contexto muy largo para tareas como análisis de documentos extensos o agentes multi-paso. Al hornear la configuración YaRN directamente en los metadatos del GGUF, el usuario final no necesita pasar flags adicionales en tiempo de ejecución. Además, se incluye una variante "abliterada" (sin censura) basada en `huihui-ai/Huihui-Qwen3.8-27B-abliterated`.

El repositorio no contiene los archivos GGUF finales (se suben por separado), sino que documenta el proceso completo: conversión de safetensors a F16, generación de matriz de importancia (imatrix) con un corpus de ~818 MB, y cuantización con `llama-quantize` usando overrides específicos para la arquitectura `qwen35`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3_5ForConditionalGeneration (transformer con vision y MTP head) |
| Parametros totales | 27.000 millones (27B) |
| Parametros activos | Todos (no es MoE) |
| Longitud de contexto | 256K nativo, extendido a 1M via YaRN (factor 4.0) |
| Tipos de cuantizacion | IQ1_M, IQ1_S, UD-IQ1_M, F16 (base) |
| Idiomas soportados | no disponible (el modelo base Qwen3.8-27B soporta multiples idiomas, pero no se especifica en esta variante) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (convertido desde safetensors) |

## Arquitectura y entrenamiento

El modelo base es Qwen3.8-27B, un transformer denso con 27B de parámetros, que incorpora capacidades de visión, razonamiento y un head de Multi-Token Prediction (MTP) en el bloque 64. Su contexto nativo es de 256K tokens. Este repositorio no entrena el modelo, sino que aplica un pipeline de cuantización y escalado de contexto:

1. **Conversion**: `convert_hf_to_gguf.py` transforma los safetensors de HuggingFace a GGUF en F16 (el archivo resultante ocupa ~26 GB).
2. **Importance matrix**: `llama-imatrix` (build CUDA) calcula la importancia de cada tensor usando un corpus de ~818 MB (wikitext-103-raw + dos dumps Parquet concatenados). Esta matriz se usa para guiar la cuantización.
3. **Cuantizacion 1-bit**: `llama-quantize` aplica los esquemas IQ1_M, IQ1_S y UD-IQ1_M (este ultimo con asignacion dinamica: atencion Q/K/V en Q6_K, salida de atencion en Q4_K, MLP en IQ1_M).
4. **YaRN bake**: mediante `--override-kv` se incrustan en los metadatos del GGUF los parametros de escalado YaRN (tipo `yarn`, factor 4.0, contexto original 262144, `finetuned=true`). Esto permite que el modelo use 1M de contexto sin flags en runtime.

La variante abliterada se genera a partir de `huihui-ai/Huihui-Qwen3.8-27B-abliterated`, que elimina los mecanismos de rechazo del modelo original.

## Capacidades

- Generacion de texto y razonamiento: hereda las capacidades del modelo base Qwen3.8-27B, incluyendo razonamiento paso a paso.
- Vision: el modelo base es multimodal (procesa imagenes), aunque la cuantizacion 1-bit puede degradar significativamente esta capacidad.
- Codigo: soporta generacion y comprension de codigo, util para agentes de programacion.
- Matematicas: el modelo base tiene buenos resultados en tareas matematicas (MathVision, GSM8K, etc.).
- Tool calling / function calling: el modelo base soporta llamadas a herramientas, aunque no se verifica en esta variante.
- Contexto largo: gracias a YaRN, puede manejar hasta 1M de tokens, aunque con degradacion esperable por la cuantizacion.
- Variante abliterada: disponible para casos donde se requiera menor censura.

## Casos de uso

- Analisis de documentos extensos: con 1M de contexto, se puede procesar un libro completo o un expediente legal en una sola pasada, sin necesidad de chunking. La cuantizacion 1-bit permite hacerlo en una GPU consumer.
- Agentes autonomos multi-paso: un agente que necesita recordar interacciones largas (por ejemplo, un asistente de investigacion que navega por multiples paginas) puede mantener todo el historial en contexto.
- Chatbots de atencion al cliente con historial completo: en lugar de resumir conversaciones antiguas, el modelo puede acceder a toda la conversacion del cliente, mejorando la coherencia.
- Generacion de codigo en entornos con recursos limitados: un desarrollador con una GPU de 8 GB puede ejecutar un modelo de 27B cuantizado a 1-bit para autocompletar o generar funciones en su IDE.
- Prototipado rapido en laptops: los archivos de ~6 GB caben en RAM de portatiles modernos, permitiendo experimentar con contexto largo sin infraestructura en la nube.
- Pruebas de concepto de RAG con contexto amplio: en lugar de usar recuperacion, se puede pasar directamente un corpus grande al modelo, simplificando el pipeline.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible para esta cuantizacion especifica (IQ1 con YaRN). El modelo base Qwen3.8-27B tiene resultados publicados en tareas como MathVision, pero no se proporcionan datos concretos en este repositorio. La cuantizacion 1-bit introduce una perdida de calidad significativa respecto al F16, por lo que los benchmarks del modelo base no son representativos.

## Requisitos de hardware

- VRAM estimada para inferencia: los archivos IQ1 pesan entre 6.2 y 6.8 GB. Con overhead de KV cache para contexto largo, se recomienda al menos 8-10 GB de VRAM para contexto moderado, y mas para 1M de contexto.
- GPU recomendadas: cualquier GPU con 8 GB o mas (RTX 3060/4060, RTX 3070/4070, etc.). Para el paso de imatrix se requiere una GPU con 24 GB+ (por ejemplo, RTX 3090/4090, A100) porque carga el modelo F16 completo.
- En consumer GPU: si, cabe en GPUs de gama media con 8-12 GB, siempre que el contexto no sea extremo.
- Opciones de despliegue: llama.cpp (incluido llama-server), Ollama, LM Studio, o cualquier runtime compatible con GGUF.
- Latencia y throughput: no disponibles. La cuantizacion 1-bit reduce el uso de memoria pero puede aumentar la latencia por la descompresion de pesos en tiempo de ejecucion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Tamano archivo | Licencia |
|---|---|---|---|---|---|
| Qwen3.8-27B (base) | 27B | 256K | F16 | ~26 GB | Apache-2.0 |
| Qwen3.8-27B (4-bit) | 27B | 256K | Q4_K_M | ~17-19 GB | Apache-2.0 |
| Este modelo (IQ1_M) | 27B | 1M (YaRN) | IQ1_M | ~6.7 GB | Apache-2.0 |
| Qwen3.8-2.4T-A95B (MoE) | 2.4T total, 95B activos | 256K | no disponible | no disponible | Apache-2.0 |

La comparativa muestra que este modelo ofrece el tamano mas reducido para un 27B, a costa de una perdida de calidad sustancial por la cuantizacion 1-bit. El contexto extendido a 1M es su principal ventaja frente a las cuantizaciones convencionales.

## Limitaciones y advertencias

- Degradacion severa de calidad: la cuantizacion 1-bit (IQ1) introduce errores significativos en los pesos. La perplejidad aumenta notablemente respecto a F16 o incluso Q4, lo que afecta a la coherencia, el razonamiento y la fidelidad de las respuestas.
- Alucinaciones: con pesos tan degradados, el riesgo de alucinaciones y respuestas inconsistentes es alto, especialmente en tareas de razonamiento o hechos precisos.
- Contexto largo con YaRN: aunque la configuracion esta horneada, el escalado a 1M no esta finetuneado (solo se aplica el factor 4.0 sobre el contexto original). Esto puede provocar degradacion progresiva en posiciones lejanas.
- Vision: la cuantizacion 1-bit probablemente inutiliza las capacidades multimodales del modelo base, aunque no se verifica en el repositorio.
- Variante abliterada: el modelo sin censura puede generar contenido inapropiado o peligroso. Usar con responsabilidad.
- Sin soporte oficial: el repositorio tiene 0 descargas y 0 likes, y no hay garantias de mantenimiento. El pipeline depende de versiones especificas de llama.cpp.
- Requisitos de disco: el proceso completo necesita ~75-80 GB de almacenamiento temporal (F16 + quants + corpus).

## Enlaces

- Repositorio del pipeline: https://huggingface.co/Havoc1904/Qwen3.8-27B-1Bit-YaRN-1M
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Variante abliterada: https://huggingface.co/huihui-ai/Huihui-Qwen3.8-27B-abliterated
- Version de Unsloth (referencia): https://huggingface.co/unsloth/Qwen3.8-27B
- Documentacion de Qwen3.8 en Unsloth: https://unsloth.ai/docs/models/qwen3.8
- Guia de VRAM para Qwen3.8-27B: https://sakutto.ai/en/articles/qwen3-8-27b
- Blog de AMD sobre Qwen3.8-27B: https://www.amd.com/en/blogs/2026/run-qwen-3-8-27b-on-amd-ryzen-ai-max-and-radeon-graphics-cards-day-0.html
