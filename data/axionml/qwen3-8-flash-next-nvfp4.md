# AxionML/Qwen3.8-Flash-Next-NVFP4

## Resumen

Qwen3.8-Flash-Next-NVFP4 es una cuantización en NVFP4 del modelo multimodal Qwen3.8-Flash-Next de Qwen (Alibaba), cuantizada por RadixArk con NVIDIA Model Optimizer y replicada en Hugging Face por AxionML como espejo listo para servir. Se trata de un MoE multimodal híbrido de aproximadamente 180.000 millones de parámetros declarados, de los que unos 6.000 millones se activan por token, con 48 capas de decodificador, 512 expertos enrutados (top-10) más un experto compartido, una capa MTP y una ventana de contexto de 262.144 tokens.

El interés principal es de despliegue: la cuantización NVFP4 W4A4 reduce el checkpoint de unos 360 GB en BF16 a unos 135 GB, aplicándose únicamente sobre los expertos enrutados de las 48 capas MoE. Atención, QSA, Gated DeltaNet, hyper-connections, routers, embeddings, cabeza LM, torre de visión y tensores MTP permanecen en BF16 e idénticos byte a byte al modelo de origen, mientras que las tablas de n-gramas PLE usan las versiones FP8 de Qwen3.8-Flash-Next-FP8. Los resultados publicados por RadixArk indican una degradación mínima: 97,27 en GSM8K (frente a 97,12-97,50 en BF16) y 98,75 pass@1 en AIME 2026 (frente a 100 en BF16).

El modelo base funciona además como vista previa de la arquitectura que Qwen empleará en Qwen4, con el mismo papel que Qwen3-Next tuvo para Qwen3.5. El despliegue validado aguas arriba se realiza con SGLang sobre hardware Blackwell (GB300 y B300), con backend FP4 de FlashInfer/CUTLASS.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE multimodal híbrida: Gated DeltaNet (GDN) + Qwen Sparse Attention (QSA), hyper-connection streams e inyección de n-gramas PLE |
| Parametros totales | ~180B declarados por el autor (~125B core + 51B de embedding de n-gramas + 4B de MTP). El recuento real de tensores safetensors del repo es 119.602.003.859 |
| Parametros activos | ~6B por token (core activado) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | NVFP4 W4A4 (grupo de 16 elementos, escalas de bloque FP8 E4M3, activaciones dinámicas) solo en los expertos enrutados de las 48 capas MoE; resto de tensores en BF16; tablas PLE en FP8 |
| Idiomas soportados | no disponible |
| Licencia | Qwen Community License 1.0 (`license: other`, `license_name: qwen-community-1.0`) |
| Formato de pesos | safetensors (repo de 135,2 GB) |
| Capas y expertos | 48 capas de decodificador, 512 expertos enrutados (top-10) + 1 experto compartido, 1 capa MTP |
| Modalidades de entrada | Texto, imagen y vídeo (`pipeline_tag: image-text-to-text`) |
| Herramienta de cuantizacion | NVIDIA Model Optimizer v0.46.0 |
| Dataset de calibracion | 128 artículos de `cnn_dailymail` de 512 tokens |
| Tamano del checkpoint | ~135 GB (frente a ~360 GB en BF16) |

## Arquitectura y entrenamiento

El modelo base emplea una arquitectura híbrida que combina Gated DeltaNet (una capa de estado recurrente lineal) con Qwen Sparse Attention en un esquema de atención híbrida, e incorpora dos innovaciones adicionales: hyper-connection streams en el bloque residual e inyección de embeddings de n-gramas mediante PLE. Sobre esa columna vertebral se monta un MoE con 512 expertos enrutados, enrutamiento top-10 y un experto compartido, más una capa de Multi-Token Prediction (MTP). El modelo es multimodal nativo y acepta texto, imagen y vídeo como entrada. Según el repositorio oficial, Qwen3.8-Flash-Next mejora el diseño anterior en cuatro ejes: atención, residual, embedding y optimización.

La cuantización de esta ficha no reentrena nada: aplica NVFP4 sobre los pesos de los expertos enrutados usando NVIDIA Model Optimizer v0.46.0, con calibración sobre 128 artículos de `cnn_dailymail` (512 tokens cada uno) y escalas de bloque FP8 E4M3 sobre microbloques de 16 elementos. El resto de la red, incluidos atención, QSA, GDN, hyper-connections, routers, embeddings, cabeza LM, visión y MTP, se conserva en BF16. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni las etapas de alineación (RLHF/DPO) del modelo base en la información proporcionada.

## Capacidades

- Generación de texto y razonamiento en varios pasos, incluyendo modo de razonamiento con muestreo de alta temperatura (los benchmarks publicados usan `t=0.6`/`t=1.0` con `top_p=0.95`).
- Comprensión multimodal: entrada de texto, imagen y vídeo bajo el pipeline `image-text-to-text`.
- Codificación agéntica: el blog de NVIDIA posiciona explícitamente Qwen3.8-Flash-Next para agentic coding sobre GB300 NVL72.
- Contexto largo de hasta 262.144 tokens, adecuado para documentos extensos e historiales de conversación prolongados.
- Predicción multi-token (MTP) integrada como capa adicional, orientada a acelerar la decodificación.
- Soporte de tool calling / function calling: referenciado de forma indirecta en el ecosistema de cuantizaciones de esta familia, donde se usa una suite de 200 ítems de tool calling para comparar cuantizaciones; la model card de este repositorio no lo documenta explícitamente.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Capacidades de audio: no disponibles.

## Casos de uso

- Codificación agéntica en producción: el modelo puede ejecutar bucles de razonamiento multi-paso con llamadas a herramientas sobre repositorios de código, apoyándose en la ventana de 262K tokens para mantener ficheros, trazas y resultados de tests en contexto. NVIDIA documenta este escenario sobre GB300 NVL72.
- Procesamiento de documentación técnica completa sin troceado: con 262.144 tokens de contexto se pueden ingerir manuales, especificaciones o expedientes enteros en una sola pasada, evitando la pérdida de información típica de los pipelines de RAG con chunking agresivo.
- Análisis y resumen de vídeo: al aceptar vídeo como entrada, es adecuado para generar resúmenes, indexar contenido audiovisual o extraer descripciones estructuradas de material grabado.
- Atención al cliente multi-turno: la combinación de contexto largo y entrada multimodal permite mantener conversaciones extensas con historial completo, incluyendo capturas o documentos adjuntos enviados por el usuario.
- Asistente de análisis documental con imágenes: extracción de datos de informes escaneados, facturas o gráficos combinando la torre de visión con razonamiento textual en la misma llamada.
- Autohospedaje en clúster Blackwell con ahorro de VRAM: el checkpoint de ~135 GB frente a los ~360 GB en BF16 reduce el número de GPU necesarias por réplica, lo que baja el coste por token en despliegues self-hosted.
- Evaluación interna de la arquitectura Qwen4: al ser una vista previa de la arquitectura de Qwen4, sirve para que equipos de plataforma validen kernels, planificadores y stacks de serving antes de la llegada de la generación definitiva.
- Generación de código integrada en CI/CD: con soporte de tool calling (referenciado en el ecosistema, no confirmado en la model card), puede conectarse a linters, ejecutores de tests y APIs de repositorio dentro de pipelines automatizados.

## Benchmarks y rendimiento

| Benchmark | Protocolo | Referencia BF16 | NVFP4 |
|---|---|---|---|
| GSM8K | Full 1.319, `t=0.6`, `top_p=0.95` | 97,12-97,50 | 97,27 |
| AIME 2026 | 30 problemas x 8, `t=1.0` | 100 | 98,75 pass@1 |

Los resultados proceden de RadixArk. Las ejecuciones de referencia en BF16 se registraron sobre una revisión anterior del modelo base, por lo que la comparación debe tomarse como indicativa. No se han publicado en la información disponible resultados de MMLU, HumanEval ni de otras suites, ni comparativas numéricas frente a las demás cuantizaciones de 4 bits de esta familia.

## Requisitos de hardware

- VRAM para inferencia: el checkpoint pesa ~135 GB en NVFP4, a los que hay que sumar caché KV, activaciones y overhead del runtime. La configuración validada aguas arriba usa `--tp 2` sobre GB300 o B300 (cada una de estas GPU dispone de 288 GB de HBM), con `--mem-fraction-static 0.80`.
- GPU recomendadas: GB300 y B300, que son las plataformas validadas por el autor. NVFP4 requiere los multiplicadores FP4 nativos de los Tensor Cores Blackwell; en Hopper (H100/H200) o Ampere no hay ruta nativa para este formato.
- GPU de consumo: no cabe en ninguna GPU de consumo. El checkpoint supera los 96 GB de una RTX PRO 6000 y los 32 GB de una RTX 5090. Existen referencias en el ecosistema a mediciones de cuantizaciones de 4 bits de esta familia sobre una RTX PRO 6000, pero la configuración exacta (posible offloading de expertos) no se detalla en la información disponible.
- Opciones de despliegue: SGLang es la ruta validada, con `--quantization modelopt_fp4`, `--fp4-gemm-backend flashinfer_cutlass`, `--page-size 64`, `--mamba-scheduler-strategy extra_buffer`, `--mamba-track-interval 64` y `--chunked-prefill-size 4096`. Requiere una build de SGLang con soporte del modelo `qwen4_exp`. El ecosistema menciona cuantizaciones de esta familia servidas con vLLM, aunque el soporte concreto de este repositorio no está confirmado en la información disponible. No hay pesos GGUF publicados, por lo que llama.cpp y Ollama no son opciones directas.
- Latencia y throughput: no disponibles. RadixArk señala únicamente que las generaciones agénticas largas tienden a alargarse más que en BF16.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Tamano checkpoint | Licencia |
|---|---|---|---|---|---|
| AxionML/Qwen3.8-Flash-Next-NVFP4 (esta ficha) | ~180B declarados / ~6B activos | 262.144 | NVFP4 W4A4 en expertos, resto BF16 | ~135 GB | Qwen Community 1.0 |
| Qwen/Qwen3.8-Flash-Next | ~180B declarados / ~6B activos | 262.144 | BF16 | ~360 GB | Qwen Community 1.0 |
| RadixArk/Qwen3.8-Flash-Next-NVFP4 | ~180B declarados / ~6B activos | 262.144 | NVFP4 W4A4 | no disponible | Qwen Community 1.0 |
| primitive-ai/Qwen3.8-Flash-Next-NVFP4 | no disponible | no disponible | NVFP4 calibrado, lane vLLM | no disponible | no disponible |
| Qwen/Qwen3.8-Flash-Next-FP8 | ~180B declarados | 262.144 | FP8 | no disponible | Qwen Community 1.0 |

El repositorio de AxionML es un espejo sin modificar de la revisión `7b719225242aacd3dbd3f9407468c2ee9a9d2594` de RadixArk, por lo que ambos comparten pesos bit a bit. La diferencia práctica frente a la versión FP8 es el ahorro de memoria a cambio de depender de kernels FP4 Blackwell. No hay datos de rendimiento publicados para las alternativas en la información disponible.

## Limitaciones y advertencias

- Sesgos: el modelo base se entrenó con datos que pueden contener lenguaje tóxico y sesgos sociales, y la versión cuantizada los hereda íntegramente. Puede generar contenido inexacto, sesgado u ofensivo.
- Alucinación: no se han publicado evaluaciones de fidelidad factual ni tasas de alucinación específicas para esta cuantización.
- Riesgo de calibración: el conjunto de calibración son 128 artículos de `cnn_dailymail` (512 tokens cada uno), un corpus de noticias en inglés y de dominio estrecho que puede no representar la distribución de uso real en código, matemáticas o multimodalidad.
- Idiomas: la model card no declara idiomas soportados; no hay garantía documentada de comportamiento fuera del inglés.
- Degradación en generaciones largas: RadixArk advierte de que las generaciones agénticas extensas tienden a ejecutarse más tiempo que en BF16, lo que afecta a latencia y coste en producción.
- Muestra pequeña en benchmarks: el resultado de AIME 2026 se obtiene sobre 30 problemas (x8), una muestra reducida; la comparación con BF16 se hizo contra una revisión anterior del modelo base.
- Restricciones de licencia: la Qwen Community License 1.0 es permisiva en general, pero los negocios de Model-as-a-Service y de AI Work Assistant necesitan una licencia adicional de Qwen para uso comercial. Debe revisarse antes de desplegar como servicio.
- Dependencia de hardware: NVFP4 exige Tensor Cores Blackwell; no hay ruta nativa en Hopper ni Ampere, lo que limita el despliegue a clústeres GB300/B300 y encarece la evaluación previa.
- Ausencia de pesos GGUF: no hay ruta de inferencia en CPU ni en GPU de consumo publicada para este repositorio.
- Soporte de software restringido: requiere una build de SGLang con soporte `qwen4_exp`; no es un modelo que funcione con cualquier versión estándar del runtime.
- Baja validación comunitaria: el repositorio registra 0 descargas y 0 likes, y es un espejo de terceros, por lo que no hay garantías de mantenimiento ni de actualización por parte de AxionML.
- Discrepancia en el recuento de parámetros: la model card declara ~180B mientras que el recuento real de tensores safetensors es de 119.602.003.859, diferencia atribuible a cómo se contabilizan embeddings y tensores auxiliares. Conviene verificarla antes de dimensionar el despliegue.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/AxionML/Qwen3.8-Flash-Next-NVFP4
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Cuantización original de RadixArk: https://huggingface.co/RadixArk/Qwen3.8-Flash-Next-NVFP4
- Variante FP8 del modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next-FP8
- Cuantización alternativa de primitive-ai: https://huggingface.co/primitive-ai/Qwen3.8-Flash-Next-NVFP4
- Repositorio GitHub: https://github.com/QwenLM/Qwen3.8-Flash-Next/
- README del repositorio: https://github.com/QwenLM/Qwen3.8-Flash-Next/blob/main/README.md
- Blog de NVIDIA sobre Qwen3.8-Flash-Next en GB300 NVL72: https://developer.nvidia.com/blog/experiment-with-qwen3-8-flash-next-on-nvidia-gb300-nvl72-for-agentic-coding
- NVIDIA Model Optimizer: https://github.com/NVIDIA/Model-Optimizer
- Licencia Qwen Community 1.0: https://huggingface.co/Qwen/Qwen3.8-Flash-Next/blob/main/LICENSE
