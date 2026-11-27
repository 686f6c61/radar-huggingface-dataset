# APLUX-Pandora/Qwen3-Embedding-0.6B

## Resumen

APLUX-Pandora/Qwen3-Embedding-0.6B es una adaptacion del modelo de embeddings Qwen/Qwen3-Embedding-0.6B, publicada por el usuario APLUX-Pandora en Hugging Face. El modelo original de Qwen es un transformer encoder de 0,6 mil millones de parametros disenado para generar representaciones vectoriales densas de consultas y documentos, orientado a tareas de recuperacion semantica, busqueda y similitud de frases.

La aportacion de esta adaptacion no es un reentrenamiento de los pesos, sino un empaquetado orientado a la inferencia en hardware movil con aceleradores NPU de Qualcomm. Los pesos se distribuyen en el formato propietario AIDEM y se cargan mediante el SDK Pandora, con binarios especificos por SoC (QCS8550, QCS9075, QCS8625 y QCS8275) compilados para QNN 2.48. El repositorio incluye una demo web y una API de Python (`pandora_qwen3_embedding_0_6b`) que expone un metodo `encode` compatible con el uso tipico de sentence-transformers.

Es relevante para desarrolladores que necesitan ejecutar busqueda semantica o similitud de frases en dispositivos edge con NPU Qualcomm, sin depender de un servidor GPU. El modelo conserva el comportamiento del modelo base (multilingue, contexto de 32 768 tokens en el original), pero la informacion publicada no detalla cambios en los pesos ni resultados de evaluacion especificos de esta adaptacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (modelo base Qwen3-Embedding-0.6B) |
| Parametros totales | 0,6 mil millones (heredado del modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Qwen3-Embedding-0.6B soporta 32 768 tokens) |
| Tipos de cuantizacion | no disponible; los pesos se distribuyen en formato AIDEM con binarios QNN por SoC |
| Idiomas soportados | no disponible en la model card (el modelo base Qwen3-Embedding es multilingue) |
| Licencia | `aplux-pandora-model-adaptations` (Pandora Model SDK); pesos y tokenizer originales bajo Apache-2.0 |
| Formato de pesos | AIDEM (formato propietario cargado por el SDK Pandora); tamano del repo 2,0 GB |
| Pipeline | feature-extraction |
| SoC soportados | QCS8550, QCS9075 (IQ9), QCS8625, QCS8275 (IQ8) |
| Runtime | Qualcomm QNN 2.48 + Aidlux LMS |

## Arquitectura y entrenamiento

El modelo subyacente es un transformer encoder de Qwen disenado para producir embeddings de frases y documentos. Esta adaptacion no documenta un proceso de entrenamiento propio: la model card describe el empaquetado de los pesos del modelo base en formato AIDEM y su compilacion para las NPU Hexagon de los SoC Qualcomm listados. No se indica numero de tokens de entrenamiento, composicion del dataset, ni si hubo RLHF, DPO o ajuste fino adicional por parte de APLUX-Pandora.

La innovacion tecnica de esta publicacion es el despliegue: los binarios QNN 2.48 permiten ejecutar el encoder en la NPU del dispositivo sin instalacion separada de QNN, usando Aidlux LMS (`sudo lms check`). El SDK expone `EmbeddingModel.from_pretrained("models")` con `encode(text, prompt_name="query")` para consultas y `encode([...])` para documentos, devolviendo vectores que se combinan con producto escalar (`documents @ query`). No se detallan tecnicas como decodificacion especulativa ni atencion lineal, que no aplican a un encoder de embeddings.

## Capacidades

- Generacion de embeddings densos para consultas y documentos, orientados a busqueda semantica y similitud de frases.
- Recuperacion cross-lingual de documentos, segun la demo incluida (busqueda semantica entre idiomas).
- Soporte de `prompt_name="query"` para distinguir el encoding de consultas del de documentos.
- Ejecucion on-device en NPU Qualcomm (QCS8550, QCS9075, QCS8625, QCS8275) mediante el SDK Pandora.
- API de Python (`pandora_qwen3_embedding_0_6b.EmbeddingModel`) y demo web incluida en el repositorio de GitHub.
- No soporta generacion de texto, tool calling, agentes ni vision: es exclusivamente un modelo de extraccion de caracteristicas.
- Capacidades multilingues: no detalladas en la model card; el modelo base Qwen3-Embedding es multilingue, pero esta adaptacion no declara lista de idiomas.

## Casos de uso

- Busqueda semantica on-device: indexar documentos locales y recuperar los mas relevantes para una consulta en tiempo de ejecucion en un dispositivo con NPU Qualcomm, sin enviar datos a la nube.
- Similitud de frases en aplicaciones moviles: comparar pares de frases (por ejemplo, deteccion de duplicados o emparejamiento de preguntas frecuentes) usando el producto escalar de los embeddings.
- Recuperacion cross-lingual en edge: la demo muestra busqueda de documentos en un idioma a partir de consultas en otro, util para asistentes multilingues embebidos.
- Deduplicacion y clustering de textos: generar embeddings de un corpus y agrupar por similitud coseno para consolidar registros o detectar contenido repetido.
- Clasificacion y enrutamiento por similitud: comparar la consulta del usuario con embeddings de intenciones predefinidas para enrutar peticiones en un chatbot local.
- Filtrado previo en pipelines RAG: usar el modelo como retriever ligero en el dispositivo antes de recurrir a un modelo mayor en servidor, reduciendo latencia y coste de red.
- Prototipado rapido con la demo web: validar la calidad de recuperacion en el hardware objetivo antes de integrar el SDK en la aplicacion final.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo incluye una grabacion de demo de 16 segundos en un QCS8625, sin metricas de latencia, throughput ni calidad de recuperacion (Recall@k, nDCG, MTEB).

## Requisitos de hardware

- Hardware objetivo: SoC Qualcomm con NPU Hexagon, concretamente QCS8550, QCS9075 (IQ9), QCS8625 y QCS8275 (IQ8), con runtime QNN 2.48.
- Requiere Aidlux LMS instalado y activo (`sudo lms check` debe devolver true); no hace falta instalar QNN por separado.
- VRAM: no aplica; la inferencia se ejecuta en la NPU del SoC, no en GPU dedicada. No se publica el consumo de memoria del modelo en el dispositivo.
- GPU de escritorio: no se documenta soporte para CUDA, vLLM, TGI, llama.cpp ni Ollama; el SDK solo describe la ruta NPU Qualcomm.
- Tamano de descarga: aproximadamente 2,0 GB para el repositorio completo; la descarga se divide entre archivos compartidos y la carpeta `targets/<soc>_qnn248/` especifica del dispositivo.
- Latencia y throughput: no disponibles; la unica referencia es la demo de 16 segundos en QCS8625, que incluye interaccion de UI y no constituye una medida de rendimiento.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / despliegue | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| APLUX-Pandora/Qwen3-Embedding-0.6B | 0,6 B | no disponible (base: 32 768) | AIDEM + QNN 2.48 en NPU Qualcomm | Pandora Model SDK (pesos base Apache-2.0) | Hugging Face, 0 descargas, 0 likes |
| Qwen/Qwen3-Embedding-0.6B | 0,6 B | 32 768 | safetensors, PyTorch / sentence-transformers | Apache-2.0 | Hugging Face (modelo base) |
| BAAI/bge-m3 | 0,57 B | 8 192 | safetensors, PyTorch | MIT | Hugging Face |
| intfloat/multilingual-e5-large | 0,56 B | 512 | safetensors, PyTorch | MIT | Hugging Face |

La comparativa se limita a parametros y licencia: no hay datos de benchmarks de esta adaptacion que permitan comparar calidad de recuperacion frente a las alternativas. La diferencia practica frente al modelo base es el target de despliegue (NPU Qualcomm frente a GPU/CPU con PyTorch).

## Limitaciones y advertencias

- La model card no documenta sesgos conocidos ni evaluaciones de robustez; al heredar los pesos del modelo base, los sesgos de Qwen3-Embedding-0.6B se mantienen, pero no se cuantifican aqui.
- Riesgo de alucinacion no aplica en sentido generativo (no produce texto), pero los embeddings pueden producir recuperaciones irrelevantes o falsos positivos por similitud coseno.
- No se declara la lista de idiomas soportados; la calidad cross-lingual solo esta respaldada por la demo, sin metricas.
- La licencia `aplux-pandora-model-adaptations` es distinta de Apache-2.0 y debe revisarse en `LICENSES/Pandora-Model-SDK.en.txt` antes de uso comercial; segun la model card, la licencia Pandora se aplica solo a las contribuciones que APLUX puede licenciar, mientras que pesos y tokenizer originales conservan Apache-2.0.
- Dependencia fuerte del ecosistema propietario: formato AIDEM, SDK Pandora y Aidlux LMS; no hay ruta documentada para PyTorch, ONNX, vLLM, llama.cpp u Ollama.
- Solo funciona en los SoC Qualcomm listados; no se documenta soporte para otros dispositivos ni para CPU/GPU de escritorio.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validacion de la comunidad ni informes independientes de funcionamiento.
- La fecha de creacion indicada (2026-11-26) y el reducido historial sugieren un proyecto reciente; conviene verificar la integridad de los binarios antes de usarlos en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/APLUX-Pandora/Qwen3-Embedding-0.6B
- Modelo base: https://huggingface.co/Qwen/Qwen3-Embedding-0.6B
- Repositorio de demo y SDK: https://github.com/APLUX-Pandora/qwen3-embedding-0.6b-demo
- API de Python del SDK: https://github.com/APLUX-Pandora/qwen3-embedding-0.6b-demo/blob/main/sdk/PYTHON_API.md
- Ejemplos: https://github.com/APLUX-Pandora/qwen3-embedding-0.6b-demo/blob/main/examples/README.md
- Licencia Pandora Model SDK: https://huggingface.co/APLUX-Pandora/Qwen3-Embedding-0.6B/blob/main/LICENSES/Pandora-Model-SDK.en.txt
- Licencia Apache-2.0 del modelo base: https://huggingface.co/APLUX-Pandora/Qwen3-Embedding-0.6B/blob/main/LICENSES/Apache-2.0.txt
- NOTICE: https://huggingface.co/APLUX-Pandora/Qwen3-Embedding-0.6B/blob/main/NOTICE
