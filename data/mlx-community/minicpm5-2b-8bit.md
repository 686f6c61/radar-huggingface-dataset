# mlx-community/MiniCPM5-2B-8bit

## Resumen

MiniCPM5-2B-8bit es una conversión al formato MLX del modelo openbmb/MiniCPM5-2B, publicada por la organización mlx-community. Se trata de una cuantización a 8 bits (group size 64) generada con mlx-lm 0.31.3, pensada para ejecutar el modelo en hardware Apple Silicon mediante el framework MLX. Con 2.516.756.480 parámetros totales (unos 2,52 mil millones de parámetros) y un repositorio de 2,7 GB, se sitúa en la categoría de modelos pequeños orientados a inferencia local y en dispositivo.

El modelo base lo desarrolla OpenBMB y se distribuye bajo licencia Apache 2.0, con soporte declarado de inglés y chino. La ficha del repositorio lo etiqueta como modelo de generación de texto con capacidades de contexto largo, tool calling, uso agente y despliegue en el borde (edge-ai, on-device), además de conversacional. La arquitectura se etiqueta como "llama", aunque no se detallan en la información disponible ni la longitud exacta de contexto ni la composición del entrenamiento.

Su relevancia es práctica: permite desplegar un modelo conversacional con soporte de herramientas en un portátil Apple sin GPU dedicada, a cambio de asumir las limitaciones típicas de un modelo denso de 2,5B parámetros y una cobertura de idiomas restringida a inglés y chino.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer de tipo Llama (según la etiqueta "llama" del repositorio); no se detallan más especificaciones en la información disponible |
| Parámetros totales | 2.516.756.480 (aproximadamente 2,52B) |
| Parámetros activos | No aplica: no se documenta como modelo MoE |
| Longitud de contexto | No disponible (el repositorio incluye la etiqueta "long-context", pero no se indica la cifra) |
| Tipos de cuantización | 8 bits en formato MLX, group size 64 (esta conversión). No se documentan GGUF, AWQ, GPTQ ni otras variantes en la información disponible |
| Idiomas soportados | Inglés (en) y chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (formato MLX) |
| Librería de inferencia | mlx-lm (versión de conversión: 0.31.3) |
| Modelo base | openbmb/MiniCPM5-2B |
| Tamaño del repositorio | 2,7 GB |

## Arquitectura y entrenamiento

No se dispone de detalles arquitectónicos más allá de la etiqueta "llama" del repositorio, que apunta a un transformer decoder-only con atención causal. Tampoco se especifican mecanismos de atención alternativa, decodificación especulativa ni innovaciones de eficiencia en la información proporcionada. Esta conversión concreta no modifica la arquitectura: únicamente aplica cuantización de 8 bits con group size 64 sobre los pesos del modelo base openbmb/MiniCPM5-2B mediante mlx-lm 0.31.3.

Los datasets declarados en el repositorio son openbmb/Ultra-FineWeb, openbmb/UltraX-Preview y openbmb/Ultra-FineWeb-L3 (corpus de preentrenamiento web), openbmb/UltraData-Math y openbmb/UltraData-Code (datos de matemáticas y código), openbmb/UltraData-SFT-2605 (ajuste supervisado), openbmb/UltraData-SFT-Agent-2609 (SFT orientado a agentes y uso de herramientas) y openbmb/UltraData-RL-2609 (etapa de aprendizaje por refuerzo). La presencia de estos conjuntos sugiere un pipeline de preentrenamiento, SFT, SFT de agentes y RL, pero no se indica el número de tokens, la proporción de cada subconjunto ni los algoritmos concretos empleados.

## Capacidades

- Generación de texto conversacional en inglés y chino, con plantilla de chat aplicable mediante `tokenizer.apply_chat_template`.
- Razonamiento y resolución de problemas matemáticos, respaldado por el uso declarado de openbmb/UltraData-Math en el entrenamiento.
- Generación y comprensión de código, asociada al dataset openbmb/UltraData-Code.
- Tool calling y function calling, con el dataset UltraData-SFT-Agent-2609 como evidencia de entrenamiento específico en este ámbito.
- Flujos agénticos de varios pasos, coherentes con la etiqueta "tool-calling" y el conjunto de datos orientado a agentes.
- Procesamiento de contextos largos (etiqueta "long-context" en el repositorio; la longitud máxima no está especificada).
- Optimización para ejecución en dispositivo y en el borde, gracias a su tamaño de 2,52B parámetros y a la cuantización de 8 bits.
- No se documentan capacidades de visión, audio, ni modos de razonamiento extendido ("thinking mode") en la información disponible.

## Casos de uso

- Asistente conversacional local en portátiles Apple Silicon: el modelo puede ejecutarse íntegramente en el dispositivo con mlx-lm, sin enviar datos a servicios externos, lo que resulta adecuado para aplicaciones con requisitos de privacidad.
- Agente con uso de herramientas en escritorio: su entrenamiento declarado sobre UltraData-SFT-Agent-2609 permite integrarlo en flujos donde el modelo decide cuándo invocar funciones (consultas a bases de datos locales, APIs internas, sistemas de archivos) y encadena varios pasos.
- Autocompletado y asistencia de código en el editor: con 2,52B parámetros y pesos de 8 bits, es viable mantenerlo cargado en memoria mientras se edita, ofreciendo sugerencias sobre el contexto abierto del proyecto.
- Resolución de problemas matemáticos y explicación paso a paso en entornos educativos, apoyándose en los datos de UltraData-Math del entrenamiento.
- Preprocesamiento y clasificación de texto en pipelines de datos: por ejemplo, etiquetado de tickets, resumen de correos o extracción de campos estructurados antes de pasarlos a un modelo mayor.
- Chatbot bilingüe inglés-chino para atención interna: el modelo cubre ambos idiomas de forma nativa, útil en equipos o productos con usuarios en esos mercados.
- Prototipado rápido de aplicaciones de IA generativa: al ser una conversión MLX ligera (2,7 GB), permite iterar sobre prompts y plantillas de chat en un Mac sin aprovisionar infraestructura GPU.
- Servicio de inferencia local con API compatible con OpenAI mediante `mlx_lm.server`, para integrarlo en herramientas que ya consumen ese formato.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM o memoria unificada estimada: los pesos en 8 bits ocupan alrededor de 2,5 GB (repositorio de 2,7 GB con tokenizador y configuración). Con caché KV y overhead del runtime, conviene reservar entre 4 y 6 GB para contextos moderados, y más si se aprovecha la ventana larga.
- GPU compatibles: MLX está diseñado para Apple Silicon (familias M1, M2, M3, M4 y posteriores). No hay soporte de CUDA en este repositorio, por lo que las GPU NVIDIA (A100, H100, RTX 4090) no son un destino directo para estos pesos MLX.
- ¿Cabe en hardware de consumo? Sí. Cualquier Mac con chip de la serie M y 8 GB de memoria unificada puede cargar el modelo; se recomienda 16 GB o más para trabajar con contextos largos y otras aplicaciones abiertas en paralelo.
- Opciones de despliegue: mlx-lm (librería Python), `mlx_lm.server` para exponer una API HTTP, y cualquier aplicación que consuma modelos MLX. Para otros runtimes (llama.cpp, Ollama, vLLM, TGI, TensorRT-LLM) no se documentan conversiones disponibles en la información proporcionada; habría que partir del modelo base openbmb/MiniCPM5-2B y convertir o cuantizar en el formato correspondiente.
- Latencia y throughput: no disponibles. Dependen del chip concreto, del tamaño de contexto y de la longitud de generación; no se han publicado mediciones.

## Comparativa con modelos similares

No hay datos de rendimiento del modelo en la información disponible, por lo que la comparación se limita a características objetivas. Los datos de las alternativas provienen de sus model cards públicas.

| Modelo | Parámetros | Contexto | Licencia | Formatos destacados |
|---|---|---|---|---|
| MiniCPM5-2B-8bit (esta ficha) | 2,52B | No disponible | Apache 2.0 | safetensors MLX (8 bits); base en safetensors |
| Llama 3.2 3B | 3,21B | 128.000 tokens | Llama 3.2 Community License | safetensors, GGUF, MLX |
| Qwen2.5 3B | 3,09B | 32.768 tokens nativos (hasta 131.072 con YaRN) | Apache 2.0 | safetensors, GGUF, MLX |
| Gemma 2 2B | 2,61B | 8.192 tokens | Gemma Terms of Use | safetensors, GGUF |

La comparación de calidad (MMLU, HumanEval, GSM8K u otros) no es posible con la información disponible, ya que no se han publicado resultados de benchmarks para MiniCPM5-2B en esta ficha.

## Limitaciones y advertencias

- Cobertura de idiomas restringida a inglés y chino: el rendimiento en castellano u otros idiomas no está garantizado ni documentado.
- Riesgo de alucinación propio de un modelo denso de 2,52B parámetros, especialmente en dominios especializados y en tareas de razonamiento encadenado largo.
- Sesgos potenciales heredados de los corpus web de preentrenamiento (Ultra-FineWeb, UltraX-Preview, Ultra-FineWeb-L3); no se documentan evaluaciones de sesgo ni mitigaciones específicas.
- Longitud de contexto no especificada: la etiqueta "long-context" no va acompañada de una cifra, por lo que no se puede planificar el consumo de memoria de la caché KV ni garantizar el rendimiento en ventanas muy amplias.
- La cuantización de 8 bits con group size 64 introduce pérdida de precisión respecto al modelo base; no se publican métricas de degradación.
- Este repositorio solo es utilizable con MLX en Apple Silicon. No sirve para despliegues en GPU NVIDIA o AMD sin una conversión previa a otro formato.
- Licencia Apache 2.0, permisiva y apta para uso comercial, siempre que se conserven los avisos de copyright y licencia correspondientes. Conviene verificar asimismo las condiciones de los datasets empleados en el entrenamiento si se redistribuye el modelo.
- No se documentan fecha de corte de conocimiento, número de tokens de entrenamiento ni detalles de alineación (RLHF/DPO), lo que dificulta evaluar su actualidad y su comportamiento en producción.
- No se declaran capacidades multimodales (visión o audio) ni modo de razonamiento extendido.
- El repositorio no registra descargas ni valoraciones en el momento de redactar esta ficha, por lo que no hay evidencia comunitaria de uso en producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mlx-community/MiniCPM5-2B-8bit
- Modelo base: https://huggingface.co/openbmb/MiniCPM5-2B
- Organización mlx-community: https://huggingface.co/mlx-community
- Organización OpenBMB: https://huggingface.co/openbmb
- Dataset openbmb/Ultra-FineWeb: https://huggingface.co/datasets/openbmb/Ultra-FineWeb
- Dataset openbmb/UltraX-Preview: https://huggingface.co/datasets/openbmb/UltraX-Preview
- Dataset openbmb/Ultra-FineWeb-L3: https://huggingface.co/datasets/openbmb/Ultra-FineWeb-L3
- Dataset openbmb/UltraData-Math: https://huggingface.co/datasets/openbmb/UltraData-Math
- Dataset openbmb/UltraData-Code: https://huggingface.co/datasets/openbmb/UltraData-Code
- Dataset openbmb/UltraData-SFT-2605: https://huggingface.co/datasets/openbmb/UltraData-SFT-2605
- Dataset openbmb/UltraData-SFT-Agent-2609: https://huggingface.co/datasets/openbmb/UltraData-SFT-Agent-2609
- Dataset openbmb/UltraData-RL-2609: https://huggingface.co/datasets/openbmb/UltraData-RL-2609
- Librería mlx-lm: https://github.com/ml-explore/mlx-lm
- Papers, blogs o demos adicionales: no disponible (la búsqueda web no devolvió resultados relacionados con el modelo).
