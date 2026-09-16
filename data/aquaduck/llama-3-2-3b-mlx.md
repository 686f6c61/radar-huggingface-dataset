# aquaduck/Llama-3.2-3B-MLX

## Resumen

`aquaduck/Llama-3.2-3B-MLX` es una conversión a formato MLX del modelo Llama 3.2 3B de Meta, publicada por el usuario aquaduck. Se trata, por tanto, de una redistribución de pesos cuantizados a 4 bits preparada para ejecutarse con la librería MLX de Apple, no de un modelo entrenado desde cero. El repositorio declara 3.212.749.824 parámetros reales en safetensors, lo que coincide con el recuento de parámetros de Llama 3.2 3B, y ocupa 3,9 GB.

Su relevancia es práctica: permite ejecutar un modelo de 3B en Macs con Apple Silicon mediante MLX, con un consumo de memoria reducido frente a los pesos en fp16. Sin embargo, la model card publicada está prácticamente vacía (solo declara `language: en`, `library_name: mlx` y `pipeline_tag: text-generation`), no especifica licencia ni detalla el proceso de cuantización, y el repositorio no registra descargas ni interacciones, por lo que se trata de una publicación sin validación comunitaria.

La información disponible no permite confirmar si deriva de la variante base o de la variante Instruct de Llama 3.2 3B, ni el grupo de cuantización empleado. Todo lo que no aparece en los metadatos se marca a continuación como no disponible.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No declarada en la ficha. El identificador indica que deriva de Llama 3.2 3B (transformer decoder-only con GQA), pero no se confirma en la documentación del repositorio |
| Parametros totales | 3.212.749.824 |
| Longitud de contexto | No disponible en la ficha. El modelo base Llama 3.2 3B soporta 128 000 tokens; no confirmado para esta conversión |
| Tipos de cuantizacion | 4-bit (etiqueta `4-bit`), en formato MLX |
| Idiomas soportados | `en` (inglés), según la etiqueta `language` |
| Licencia | No disponible. La model card no la declara; al derivar de Llama 3.2 sería de aplicación la licencia del modelo base, sin confirmar |
| Formato de pesos | safetensors (formato MLX) |
| Libreria de inferencia | MLX |
| Tamano del repositorio | 3,9 GB |
| Pipeline | text-generation |
| Fecha de creacion | 2026-09-16 |
| Fecha de actualizacion | 2026-09-16 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

No hay información en la documentación proporcionada sobre la arquitectura interna, los datos de entrenamiento, el número de tokens vistos, la composición del dataset ni sobre fases de ajuste como RLHF o DPO. El repositorio es una conversión de pesos: no se ha entrenado un modelo nuevo, sino que se han transformado y cuantizado pesos preexistentes de Llama 3.2 3B al formato que consume MLX.

El único dato técnico verificable es el tamaño: 3.212.749.824 parámetros en safetensors y 3,9 GB de repositorio. Una cuantización 4-bit pura de 3,21 B parámetros ocuparía del orden de 1,6 GB solo en pesos, por lo que el tamaño del repositorio sugiere que parte de los tensores se mantienen en mayor precisión (por ejemplo, capas de normalización o embeddings) o que se incluyen ficheros adicionales. No se especifica el tamaño de grupo (*group size*) ni si se aplicó cuantización selectiva por capa.

## Capacidades

- Generación de texto en inglés: es la única tarea declarada en la ficha (`pipeline_tag: text-generation`).
- Conversión de pesos lista para MLX: los pesos están en safetensors con etiqueta `mlx`, por lo que se cargan directamente con la librería MLX sin conversión adicional.
- Ejecución en Apple Silicon: al usar MLX, el modelo aprovecha la memoria unificada de los chips de Apple.
- Capacidades heredadas del modelo base: no verificadas en esta ficha. Si la conversión proviene de Llama 3.2 3B Instruct, cabría esperar seguimiento de instrucciones, tool calling y capacidades multilingües limitadas, pero ninguna de estas capacidades está declarada en la documentación del repositorio.
- Modo de razonamiento explícito, visión, audio y agentes: no disponible (no declarado).

## Casos de uso

- Prototipado local en Mac: cargar el modelo con MLX en un Mac con Apple Silicon para experimentar con generación de texto en inglés sin depender de servicios en la nube, gracias a que los pesos ya están en formato nativo de MLX.
- Evaluación de calidad de cuantización: comparar las salidas de esta conversión 4-bit frente a los pesos fp16 del modelo base para medir la degradación introducida por la cuantización en tareas concretas del usuario.
- Desarrollo de aplicaciones de escritorio para macOS: integrar el modelo en una aplicación nativa de Mac mediante MLX, aprovechando la memoria unificada para mantener el modelo residente junto al resto de la aplicación.
- Tareas de generación de texto de propósito general en inglés: resúmenes, reescritura, clasificación de texto o extracción de información, siempre que se validen las salidas con datos propios dado que no hay benchmarks publicados.
- Base para ajuste fino ligero (LoRA/QLoRA): al ser un modelo de 3B en 4 bits, puede servir como punto de partida para adaptaciones de bajo rango en hardware de Apple Silicon, aunque el formato MLX condiciona las herramientas de entrenamiento utilizables.
- Docencia y experimentación académica: permite ilustrar el efecto de la cuantización y del formato de despliegue sobre el rendimiento de un transformer de 3B sin requerir GPUs dedicadas.
- Generación de texto en pipelines offline: escenarios sin conectividad donde se necesita un modelo local con licencia y origen verificables antes de su uso en producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de ningún tipo (MMLU, HumanEval, GSM8K ni otras), y los resultados de búsqueda web obtenidos no guardan relación con el modelo.

## Requisitos de hardware

- VRAM/memoria estimada: el repositorio ocupa 3,9 GB, por lo que se necesita al menos esa cantidad de memoria libre, más el *overhead* del runtime de MLX y de la caché de claves/valores durante la generación. En la práctica, un Mac con 8 GB de memoria unificada puede ser insuficiente con contexto largo; 16 GB es un mínimo razonable.
- GPU compatibles: MLX está orientado a Apple Silicon (series M1, M2, M3 y M4). No hay soporte declarado para CUDA ni ROCm en esta publicación.
- GPU de consumo: cabe en equipos con memoria unificada de 16 GB o superior. No aplica a GPUs de consumo con VRAM dedicada mientras no se reconviertan los pesos a otro formato.
- Opciones de despliegue: MLX (`mlx-lm`) es la vía natural. Para vLLM, llama.cpp, Ollama o TGI sería necesario reconvertir los pesos a GGUF o a safetensors estándar, lo que no está documentado en el repositorio.
- Latencia y throughput: no disponible. No se han publicado mediciones de tokens por segundo ni de latencia de primera token.
- Cuantización adicional: no disponible (no se documentan variantes de 8 bits, 6 bits ni fp16 en este repositorio).

## Comparativa con modelos similares

Los datos de los modelos alternativos proceden de conocimiento general sobre ellos y no se han verificado en la información proporcionada; se marcan como tales.

| Modelo | Parametros | Contexto | Formato | Licencia | Rendimiento |
|---|---|---|---|---|---|
| aquaduck/Llama-3.2-3B-MLX | 3,21 B | No disponible (base: 128 k) | safetensors MLX 4-bit | No disponible | No disponible |
| meta-llama/Llama-3.2-3B-Instruct | 3,21 B | 128 k | safetensors fp16 | Llama 3.2 Community License | Benchmarks públicos de Meta, no incluidos aquí |
| mlx-community/Llama-3.2-3B-Instruct-4bit | 3,21 B | 128 k | safetensors MLX 4-bit | Llama 3.2 Community License | No verificado en esta ficha |
| Qwen2.5-3B-Instruct | 3,09 B | 32 k (ampliable con YaRN) | safetensors fp16 | Licencia específica de Qwen, no verificada en esta ficha | Benchmarks públicos de Alibaba, no incluidos aquí |

La diferencia principal entre la primera fila y las alternativas de la comunidad no es técnica sino de trazabilidad: los repositorios mantenidos por `mlx-community` documentan el proceso de cuantización y la licencia, mientras que esta publicación no lo hace.

## Limitaciones y advertencias

- Documentación inexistente: la model card no describe arquitectura, datos de entrenamiento, proceso de cuantización ni limitaciones. Cualquier uso en producción exige una validación adicional por parte del usuario.
- Licencia no declarada: el repositorio no indica licencia. Al derivar de Llama 3.2, el uso comercial está sujeto presumiblemente a la Llama 3.2 Community License y a sus condiciones de atribución, pero esto no puede confirmarse con la información disponible. No se recomienda su uso comercial sin aclarar este punto.
- Sesgos: no disponible. No se han publicado evaluaciones de sesgo, toxicidad o equidad para esta conversión. Los sesgos del modelo base, en cualquier caso, se heredan y pueden verse alterados por la cuantización.
- Riesgo de alucinación: inherente a un modelo de 3B parámetros. Es esperable una tasa de error notable en tareas de conocimiento factual y razonamiento de varios pasos, aunque no hay mediciones disponibles para cuantificarla.
- Limitación de idioma: solo se declara inglés. El rendimiento en castellano no está documentado y no debería asumirse.
- Pérdida por cuantización: los pesos están en 4 bits, lo que introduce degradación respecto a fp16. La magnitud de esta pérdida no está medida en el repositorio.
- Dependencia de plataforma: el formato MLX limita el despliegue a Apple Silicon, salvo reconversión manual de los pesos, que no está documentada.
- Sin validación comunitaria: 0 descargas y 0 likes en el momento de la consulta, y ninguna revisión o discusión pública asociada.
- Anomalía en los metadatos: las fechas de creación y actualización registradas (16 de septiembre de 2026) figuran como posteriores a la fecha de publicación de los modelos base, lo que sugiere un posible error de metadatos.
- Ausencia de garantías del publicador: no se declara autoría del proceso de cuantización ni referencia al script utilizado, por lo que no se puede reproducir la conversión ni auditar su fidelidad.

## Enlaces

- HuggingFace: https://huggingface.co/aquaduck/Llama-3.2-3B-MLX
- Modelo base presumible (no confirmado en la ficha): https://huggingface.co/meta-llama/Llama-3.2-3B-Instruct
- Librería MLX: https://github.com/ml-explore/mlx
- No se han encontrado papers, blogs, repositorios ni demos adicionales asociados a este modelo en los resultados de búsqueda disponibles.
