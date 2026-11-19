# junmo-k/qwen3-embedding-0.6b-ane

## Resumen

`junmo-k/qwen3-embedding-0.6b-ane` es una conversión a Core ML del modelo de embeddings `Qwen/Qwen3-Embedding-0.6B` de Alibaba Qwen, empaquetada específicamente para ejecutarse sobre la Apple Neural Engine (ANE) mediante la herramienta ANERun. No se trata de un modelo nuevo ni de un fine-tune: es un artefacto de despliegue que traduce los pesos originales a un formato que el runtime de Apple puede compilar en el Mac de destino.

El modelo base es un transformer denso de 0,6 mil millones de parámetros orientado a extracción de características (feature-extraction), es decir, a producir representaciones vectoriales de texto para tareas de recuperación, similitud semántica, clustering y RAG. La conversión mantiene la atención causal con pooling sobre el último token, una decisión de diseño típica de los modelos de embedding de la familia Qwen3.

Su relevancia es acotada pero concreta: permite ejecutar un modelo de embeddings de 0,6B íntegramente en hardware Apple Silicon sin GPU dedicada, con un contexto que puede alcanzar los 32.768 tokens si se configura explícitamente en ANERun. El repositorio ocupa 2,4 GB e incluye tokenizador, tabla de embeddings en float32, pesos de normalización final y fixtures de autoverificación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso con atención causal y pooling de último token (modelo base Qwen3-Embedding-0.6B) |
| Parametros totales | 0,6 mil millones (modelo base) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 32.768 tokens (por defecto 2.048 en el instalador de ANERun) |
| Tipos de cuantizacion | no disponible (el repo incluye tabla de embeddings en float32; el formato Core ML compilado no especifica cuantización en la información disponible) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | paquetes fuente Core ML (compilados en destino por ANERun), tokenizador, tabla de embeddings float32 y `manifest.json` |

## Arquitectura y entrenamiento

El modelo base Qwen3-Embedding-0.6B es un transformer denso de 0,6B parámetros entrenado para producir embeddings de texto. La conversión documentada emplea atención causal con pooling sobre el último token, lo que implica que la representación se extrae de la posición final de la secuencia en lugar de aplicar mean pooling sobre todos los tokens. Esta elección condiciona el uso: el padding y el truncado deben gestionarse con cuidado para que el último token sea el correcto.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron etapas de RLHF o DPO en el modelo original dentro de la información proporcionada. La conversión en sí no reentrena pesos: ANERun compila el modelo en el Mac de destino y verifica la integridad de los ficheros contra `manifest.json`, un mecanismo de validación que reduce el riesgo de artefactos corruptos en la distribución.

## Capacidades

- Generación de embeddings de texto para similitud semántica, recuperación densa y clustering.
- Extracción de características (`feature-extraction`) sobre secuencias de hasta 32.768 tokens configurando `--max-tokens 32768`.
- Ejecución nativa en Apple Neural Engine mediante ANERun, sin necesidad de GPU dedicada.
- Autoverificación de integridad de ficheros contra `manifest.json` durante la instalación.
- Inclusión de tokenizador y pesos de normalización final, lo que permite un pipeline completo de embedding dentro del paquete.
- No soporta tool calling, agentes, visión, audio ni modos de razonamiento: es exclusivamente un modelo de embeddings.

## Casos de uso

- Búsqueda semántica local en aplicaciones macOS: indexar documentación o notas y generar embeddings en el propio Mac con ANE, sin enviar texto a servicios externos.
- RAG en aplicaciones de escritorio: usar el modelo como encoder de recuperación en un pipeline que alimente a un LLM local, aprovechando el contexto de hasta 32.768 tokens para fragmentos largos.
- Clustering y deduplicación de corpus: generar vectores para agrupar artículos, tickets o registros similares en un portátil Apple Silicon.
- Filtrado y clasificación por similitud: comparar consultas de usuario contra un catálogo de intenciones precalculadas para enrutado ligero.
- Prototipado de sistemas de recomendación basados en contenido: representar ítems y perfiles de usuario como vectores y calcular similitudes en local.
- Evaluación offline de pipelines de embeddings: al incluir fixtures de autotest, sirve para validar que la instalación produce vectores correctos antes de integrarla en producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Hardware objetivo: Apple Silicon con Neural Engine (ANE); la compilación se realiza en el Mac de destino.
- VRAM: no aplica; el modelo se ejecuta en ANE y memoria unificada. El repositorio ocupa 2,4 GB, por lo que se recomienda al menos 8 GB de memoria unificada para margen operativo.
- GPU dedicadas (A100, H100, RTX 4090): no soportadas por este artefacto, que es específico de Core ML/ANE.
- Despliegue: exclusivamente mediante ANERun (`anerun models install` y `anerun embed`). No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| junmo-k/qwen3-embedding-0.6b-ane | 0,6B | 32.768 tokens | Core ML (ANE) | Apache 2.0 | Hugging Face, requiere ANERun |
| Qwen/Qwen3-Embedding-0.6B | 0,6B | 32.768 tokens (según modelo base) | safetensors | Apache 2.0 | Hugging Face |
| Alternativas de embeddings en formato GGUF/Ollama | no disponible | no disponible | GGUF | variable | no disponible |

La comparación directa más relevante es con el modelo original de Qwen, del que esta conversión deriva: mismos parámetros y licencia, pero distinto runtime y formato. No se dispone de datos de rendimiento comparado en la información proporcionada.

## Limitaciones y advertencias

- Es un artefacto de despliegue, no un modelo entrenado: su calidad de embeddings depende enteramente del modelo base Qwen3-Embedding-0.6B.
- Dependencia estricta de ANERun y de Apple Silicon; no es portable a Linux, Windows ni GPUs NVIDIA.
- El contexto por defecto del instalador es de 2.048 tokens; usar 32.768 requiere pasar `--max-tokens 32768` tanto en instalación como en ejecución, y aumenta el consumo de memoria.
- El pooling de último token exige gestionar correctamente el padding; un padding mal aplicado puede degradar la calidad de los embeddings.
- No hay información sobre idiomas soportados ni sobre sesgos del modelo base en la documentación disponible.
- Riesgo de alucinación no aplica en el sentido generativo, pero sí de representaciones poco fiables en dominios alejados de los datos de entrenamiento del modelo original.
- La licencia Apache 2.0 permite uso comercial, pero conviene revisar el aviso de conversión (`NOTICE`) del repositorio.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso en producción ni validación comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/junmo-k/qwen3-embedding-0.6b-ane
- Modelo base: https://huggingface.co/Qwen/Qwen3-Embedding-0.6B
- Revisión original convertida: https://huggingface.co/Qwen/Qwen3-Embedding-0.6B/tree/97b0c614be4d77ee51c0cef4e5f07c00f9eb65b3
- Repositorio ANERun: https://github.com/junmo-kim/ANERun
- Licencia: https://huggingface.co/junmo-k/qwen3-embedding-0.6b-ane/blob/main/LICENSE
- Aviso de conversión: https://huggingface.co/junmo-k/qwen3-embedding-0.6b-ane/blob/main/NOTICE
