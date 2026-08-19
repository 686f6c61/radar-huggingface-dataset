# aquaduck/Qwen3.8-27B-GGUF

## Resumen

Este repositorio contiene una partición por capas (layer-sharded) del modelo Qwen3.8-27B cuantizado en GGUF Q4_K_M, preparada por Aquaduck para su runtime de inferencia distribuida (Aquaduck Arc). No se trata de un modelo nuevo ni de un reentrenamiento: son dos archivos GGUF que dividen el modelo completo en dos mitades contiguas (capas 0-31 y 32-63) para permitir la carga escalonada en entornos multi-nodo o con memoria limitada. El modelo base original es Qwen3.8-27B, desarrollado por Qwen Team / Alibaba Cloud, con arquitectura densa de ~27.800 millones de parámetros, 64 capas y una ventana de contexto de 256.000 tokens. La cuantización Q4_K_M proviene de Unsloth, y este repositorio solo reempaqueta ese archivo en dos fragmentos.

La relevancia de este repositorio es práctica: facilita la ejecución de un modelo de 27B en configuraciones donde no cabe un único archivo de ~17 GB, por ejemplo en sistemas con VRAM fragmentada o en clústeres con varios dispositivos. Sin embargo, para uso local convencional se recomienda usar el archivo GGUF completo de Unsloth o los pesos originales de Qwen, ya que estos fragmentos no son compatibles con llama.cpp de forma directa. El modelo base destaca por sus capacidades de razonamiento, visión y generación de código, así como por su soporte para tareas agénticas de largo alcance.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.8 dense, GQA (24 Q / 4 KV heads), 64 capas, hidden dim 5120 |
| Parametros totales | ~27.8B (segun documentacion del modelo base; el repo no contiene safetensors) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 256.000 tokens (segun documentacion de Qwen3.8) |
| Tipos de cuantizacion | Q4_K_M (proveniente de Unsloth) |
| Idiomas soportados | Multilingue (no se especifican idiomas concretos en el repo) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (dos archivos layer-sharded: layers-0-32 y layers-32-64) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B es un transformer causal denso con atención por grupos de consultas (GQA), 64 capas, dimensión oculta de 5120 y 24 cabezas de consulta con 4 cabezas de clave/valor. Es un modelo de lenguaje multimodal que integra capacidades de visión, aunque el repositorio actual solo contiene la parte de texto en formato GGUF. No se ha realizado ningún entrenamiento adicional en este repositorio: los pesos provienen directamente de Qwen/Qwen3.8-27B, que fue entrenado por Qwen Team con un pipeline que incluye preentrenamiento masivo y fases de alineación (RLHF/DPO, según la documentación oficial de Qwen3.8). La cuantización Q4_K_M fue aplicada por Unsloth, reduciendo el tamaño del modelo de ~54 GB (en fp16) a ~17 GB. Este repositorio únicamente divide ese archivo GGUF en dos mitades en el punto medio (capa 32), usando un formato de empaquetado propietario denominado "layer-package-v1". No hay ninguna innovación técnica nueva en el modelo en sí; la innovación está en el mecanismo de partición para carga distribuida.

## Capacidades

- Generación de texto y razonamiento complejo, incluyendo modo "thinking" (razonamiento explícito) y modo instruct, según la plantilla de chat de Qwen.
- Capacidades de visión: el modelo base puede procesar imágenes y responder preguntas sobre ellas (aunque el GGUF de este repo está orientado a texto, conserva las mismas capacidades que el modelo original).
- Generación de código y soporte para tareas de programación, con buen rendimiento en benchmarks de coding (según la documentación de Qwen3.8).
- Razonamiento multi-step y planificación agéntica: el modelo está diseñado para tareas de agente con múltiples pasos y manejo de feedback del entorno.
- Soporte de tool calling / function calling, integrable en pipelines de agentes.
- Multilingüe: cubre múltiples idiomas, aunque no se detalla la lista exacta en este repo.
- Ventana de contexto de 256K tokens, adecuada para documentos largos y conversaciones extendidas.

## Casos de uso

- Inferencia distribuida en clústeres: los dos fragmentos de capas permiten cargar el modelo en dos GPUs o nodos separados, cada uno con ~8-9 GB de VRAM, para ejecutar el modelo completo sin necesidad de un único dispositivo con 17 GB.
- Desarrollo de agentes autónomos: gracias al soporte de tool calling y razonamiento multi-step, el modelo puede usarse como núcleo de asistentes que planifican y ejecutan tareas complejas (navegación web, uso de APIs, gestión de archivos).
- Análisis de documentos largos: con 256K de contexto, es posible procesar informes extensos, libros o transcripciones completas en una sola pasada.
- Generación de código asistida: el modelo puede integrarse en IDEs o pipelines de CI/CD para generar, revisar y completar código, aprovechando su capacidad de razonamiento.
- Chat conversacional multilingüe: para construir asistentes de atención al cliente o chatbots que manejen múltiples idiomas y mantengan contexto largo.
- Prototipado de aplicaciones de visión-lenguaje: aunque este repo es solo texto, el modelo base admite entrada de imágenes, por lo que puede usarse en sistemas de descripción de imágenes o QA visual (con la cuantización adecuada).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible para este repositorio. La model card remite a la documentación oficial de Qwen3.8 (https://qwen.ai/blog?id=qwen3.8) para métricas de rendimiento del modelo base, pero no se incluyen cifras concretas en los materiales proporcionados. Se recomienda consultar dicha fuente para datos de MMLU, HumanEval, GSM8K u otras evaluaciones.

## Requisitos de hardware

- El modelo completo en Q4_K_M ocupa aproximadamente 17,1 GB. Para inferencia local se necesita al menos esa cantidad de memoria combinada (VRAM + RAM). Según la documentación de Unsloth, puede ejecutarse en configuraciones con 17 GB de RAM/VRAM.
- Los dos fragmentos de este repo pesan ~8,25 GB y ~9,29 GB respectivamente, lo que permite cargar cada mitad en una GPU con al menos 10 GB de VRAM (por ejemplo, RTX 3080/4080, A10, L4) o en dos nodos separados.
- GPU recomendadas para el modelo completo: RTX 4090 (24 GB), A100 (40/80 GB), H100 (80 GB) o configuraciones multi-GPU con al menos 17 GB combinados.
- En GPUs de consumo como RTX 3090/4090, el modelo completo cabe en VRAM sin necesidad de offloading. En GPUs de 8-12 GB, se puede usar el modo de offloading a RAM con menor velocidad.
- Opciones de despliegue: para el modelo completo, se puede usar llama.cpp, Ollama, vLLM o TGI con el archivo GGUF de Unsloth. Este repositorio específico requiere el runtime de Aquaduck (Aquaduck Arc) para cargar los fragmentos; no es compatible directamente con llama.cpp.
- Velocidad de inferencia: según una medición reportada en ofox.ai, el modelo completo en Q4_K_M alcanza ~7,11 tokens/s en hardware no especificado. La velocidad real depende de la GPU y la configuración de memoria.

## Comparativa con modelos similares

No se dispone de datos comparativos específicos para este repositorio. El modelo base Qwen3.8-27B compite con otros modelos densos de ~27-32B como Qwen3-32B, Llama 3.3 70B (más grande) o Mistral Large 2 (123B). Sin embargo, no se han proporcionado resultados de benchmarks para realizar una comparación cuantitativa. Se recomienda consultar la documentación oficial de Qwen3.8 para ver comparativas con modelos de la misma categoría. En cuanto a este repo, su única diferencia frente a alternativas es el empaquetado en fragmentos, que no afecta al rendimiento del modelo subyacente.

## Limitaciones y advertencias

- No es un modelo independiente: los dos archivos GGUF son mitades de un mismo modelo y deben cargarse juntos mediante el runtime de Aquaduck. Intentar ejecutar un solo fragmento como modelo completo fallará.
- No es un archivo drop-in para llama.cpp: para uso local convencional, usar unsloth/Qwen3.8-27B-GGUF o los pesos originales de Qwen.
- La cuantización Q4_K_M puede degradar ligeramente la calidad de las respuestas en comparación con precisiones superiores (FP16, Q8).
- El modelo base puede presentar sesgos y alucinaciones inherentes a los LLM entrenados con datos web; se recomienda validar las salidas en entornos de producción.
- La licencia Apache-2.0 permite uso comercial, pero se deben respetar los términos de la licencia y las directrices de uso de Qwen (p. ej., no usarlo para actividades ilegales o dañinas).
- La ventana de contexto de 256K es teórica; en la práctica, el rendimiento puede degradarse con contextos muy largos y el consumo de memoria aumenta proporcionalmente.
- No se han realizado evaluaciones específicas para los fragmentos; los resultados de calidad son los mismos que los del modelo base con cuantización Q4_K_M.

## Enlaces

- Repositorio de HuggingFace: https://huggingface.co/aquaduck/Qwen3.8-27B-GGUF
- Modelo base original: https://huggingface.co/Qwen/Qwen3.8-27B
- Blog oficial de Qwen3.8: https://qwen.ai/blog?id=qwen3.8
- Fuente de cuantización GGUF (Unsloth): https://huggingface.co/unsloth/Qwen3.8-27B-GGUF
- Documentación de Unsloth para Qwen3.8: https://unsloth.ai/docs/models/qwen3.8
- Artículo de AMD sobre ejecución local: https://www.amd.com/en/blogs/2026/run-qwen-3-8-27b-on-amd-ryzen-ai-max-and-radeon-graphics-cards-day-0.html
- Análisis de requisitos de VRAM: https://ofox.ai/blog/qwen-3-8-27b-run-locally-vram-gguf-2026/
- Página de LM Studio para Qwen3.8 27B: https://lmstudio.ai/models/qwen/qwen3.8-27b
- Repositorio de llama.cpp: https://github.com/ggml-org/llama.cpp
