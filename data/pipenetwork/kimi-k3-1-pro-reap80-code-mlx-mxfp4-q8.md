# pipenetwork/Kimi-K3.1-Pro-REAP80-code-MLX-mxfp4-q8

## Resumen

Kimi-K3.1-Pro-REAP80-code-MLX-mxfp4-q8 es una conversión a MLX del modelo Kimi-K3.1-Pro de Moonshot AI, sometida a una poda de expertos REAP (Retrieval-based Expert Pruning) que conserva únicamente el 20 % de los expertos enrutados de cada capa MoE, calibrada con un corpus de predominio de código. El autor de la conversión y poda es el usuario pipenetwork, y el resultado se distribuye como un único repositorio de 350 GB (326 GiB) pensado para cargarse en una máquina Apple Silicon con 512 GB de memoria unificada.

El modelo base es un transformer MoE de 600.837.048.660 parámetros totales que combina Kimi Delta Attention, MLA con compuerta y un indexador DSA, además de Attention Residuals y un MoE latente. La poda reduce los expertos enrutados de 896 a 179 por capa en las 92 capas MoE, manteniendo el enrutamiento top-16 y los 2 expertos compartidos intactos. Los pesos de los expertos supervivientes son una copia byte a byte de los MXFP4 originales de Moonshot, mientras que el resto de tensores se cuantiza en 8 bits afín con grupo de 64.

La relevancia de esta ficha es doble: por un lado, demuestra que es posible ejecutar un modelo de esta escala en hardware de consumo profesional (un M3 Ultra), y por otro, documenta con transparencia el coste de calidad de una poda agresiva. El propio autor advierte de que se trata de una build "que cabe en un Mac" para código, no de una build de calidad, y recomienda verificar cualquier resultado que importe.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con Kimi Delta Attention, MLA con compuerta e indexador DSA, Attention Residuals y MoE latente |
| Parametros totales | 600.837.048.660 |
| Parametros activos | no disponible (top-16 sobre 179 expertos enrutados por capa, 92 capas MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | MXFP4 en expertos (copia byte a byte del original); afín 8 bits grupo 64 en atención, expertos compartidos, proyecciones latentes, MLP densa de la capa 0, embeddings y `lm_head`; bf16/f32 en indexador DSA, normas y routers; flujo residual en float32 |
| Idiomas soportados | no disponible |
| Licencia | Kimi K3.1-Pro License (other), con condiciones para uso comercial a gran escala |
| Formato de pesos | safetensors (MLX, shards alineados a 16 bytes), más `kimi_k31.py`, `tiktoken.model`, `tokenization_kimi.py`, `tokenizer.json` y `chat_template.jinja` |

## Arquitectura y entrenamiento

El modelo base Kimi-K3.1-Pro es un transformer de mezcla de expertos con 92 capas MoE, 896 expertos enrutados por capa y 2 expertos compartidos. Incorpora Kimi Delta Attention junto con MLA con compuerta y un indexador DSA, además de Attention Residuals y un MoE latente. El checkpoint original ocupa 1,56 TB y almacena los expertos en MXFP4.

Esta conversión aplica una poda REAP basada en la saliencia `gate x ||expert_output||` calculada sobre un corpus de calibración con un 60 % de código, complementado con porciones de web en inglés y chino. Se conservan 179 de los 896 expertos enrutados por capa, manteniendo el enrutamiento top-16 y sin tocar los expertos compartidos. Los expertos supervivientes son una copia byte a byte de los pesos MXFP4 de Moonshot, de modo que la poda es la única pérdida en el lado de los expertos. El resto de tensores se cuantiza en 8 bits afín con grupo de 64, salvo el indexador DSA, las normas y los routers, que se mantienen en bf16/f32 deliberadamente porque el error del indexador solo se manifiesta más allá de 2048 tokens y no aparecería en evaluaciones cortas. El flujo residual se mantiene en float32 desde la primera capa MoE, igual que en el cargador de referencia.

No se dispone de información sobre el número de tokens de entrenamiento del modelo base, la composición completa del dataset ni si hubo RLHF o DPO.

## Capacidades

- Generación de texto y conversación multi-turno en el pipeline `text-generation`.
- Generación de código: es el dominio para el que se calibró la poda y el que el autor valida con continuaciones greedy de funciones Python.
- Razonamiento: el modelo base lo soporta, pero el autor documenta degradación severa tras la poda (un cálculo de 17 × 23 produjo 323 en lugar de 391 en la build q6).
- Soporte de tool calling: la plantilla de chat incluida solo reproduce `encoding_k3.py` para mensajes simples de sistema/usuario/asistente; las llamadas a herramientas y las imágenes no están cubiertas por ella.
- Capacidades multimodales: los ficheros de visión se distribuyen junto al modelo, pero no fueron ejercitados; solo se validó la ruta de texto.
- Capacidades multilingües: no disponibles como dato declarado, aunque el corpus de calibración incluye porciones de inglés y chino.
- Sin modo thinking explícito declarado en la información disponible.

## Casos de uso

- Asistente de código en local sobre Apple Silicon: el modelo cabe en un M3 Ultra de 512 GB y permite autocompletar y generar funciones Python sin conexión, con un rendimiento de unos 5,5 tok/s en mlx-lm.
- Prototipado y experimentación con modelos de gran escala en hardware de escritorio profesional: sirve para estudiar el comportamiento de un MoE de 600B podado sin necesidad de un clúster de GPUs.
- Generación de código en pipelines internos de CI/CD: puede integrarse en scripts de mlx-lm para tareas de generación de tests o documentación, siempre con revisión humana dado el riesgo de degradación.
- Evaluación de técnicas de poda: el repositorio publica métricas de perplejidad pareadas (q8, q6, q4) que lo convierten en un caso de referencia para comparar estrategias REAP.
- Investigación sobre cuantización en MLX: la mezcla de MXFP4 en expertos con afín 8 bits en el resto de tensores permite estudiar el impacto de cada decisión de precisión por separado.
- Desarrollo de motores de inferencia alternativos: el autor valida un motor Metal nativo (pipefold) contra mlx-lm con 24 de 24 tokens greedy idénticos en un prompt de código, lo que lo hace útil como banco de pruebas.
- Docencia y divulgación: permite mostrar en una sola máquina el funcionamiento interno de un MoE latente con atención híbrida y enrutamiento top-16.

## Benchmarks y rendimiento

El autor publica perplejidad retenida a 2048 tokens sobre ventanas idénticas con bootstrap pareado, para la build REAP80 calibrada con código:

| Precisión no-experto | Perplejidad global | vs q8 |
|---|---|---|
| q8 | 5,725 | baseline |
| q6 | 5,736 | +0,2 % (código +0,0 a 0,1 %) |
| q4 | 8,81 | +53,7 % (python +44 %, code-multi +17 %) |

Rendimiento medido en un M3 Ultra de 512 GiB:

| Ruta | Decodificación | Notas |
|---|---|---|
| mlx-lm (`mlx_lm.generate`) | ~5,5 tok/s | ~10 % más lento que q6 |
| Motor Metal nativo (pipefold, no publicado) | ~6,5 tok/s | prefill ~60 tok/s |

Cada token decodificado lee aproximadamente 70-85 GB de pesos (unos 26 GB de expertos enrutados más todos los tensores no-experto), por lo que la decodificación está limitada por ancho de banda de memoria. La poda reduce memoria, no velocidad.

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM/memoria unificada: 326 GiB de pesos; se necesita una máquina Apple Silicon de 512 GB para cargarlo con holgura.
- En un M3 Ultra de 512 GiB hay que elevar el límite de memoria cableada de la GPU con `sudo sysctl iogpu.wired_limit_mb=480000`, ya que el valor por defecto queda por debajo del footprint del modelo.
- No cabe en ninguna GPU de consumo (RTX 4090, 24 GB) ni en GPUs de datacenter habituales (A100 80 GB, H100 80 GB) sin offloading masivo a CPU o disco.
- Despliegue: mlx-lm con `--trust-remote-code` y el cargador `kimi_k31.py` incluido, ya que la arquitectura `kimi_k31` no está upstream. No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI.
- Throughput: ~5,5 tok/s en decodificación con mlx-lm y ~6,5 tok/s con el motor Metal nativo; prefill de ~60 tok/s en este último.
- La memoria pico crece con la longitud del prompt; el autor recomienda probar el prompt más largo antes de confiar en él.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Kimi-K3.1-Pro-REAP80-code-MLX-mxfp4-q8 (esta ficha) | 600,8B totales, 179 expertos enrutados por capa | no disponible | Kimi K3.1-Pro License | Hugging Face, formato MLX, 350 GB |
| moonshotai/Kimi-K3.1-Pro (base) | 600,8B totales, 896 expertos enrutados por capa | no disponible | Kimi K3.1-Pro License | Hugging Face, 1,56 TB, MXFP4 |
| pipenetwork/Kimi-K3-REAP80-MLX-mxfp4-q8 | no disponible | no disponible | Kimi K3 License | Hugging Face, formato MLX |

El modelo base conserva todos los expertos y por tanto la calidad completa, a cambio de 1,56 TB de almacenamiento. La variante Kimi-K3 (sin el sufijo .1) es una build previa del mismo autor con la misma receta REAP80 sobre una versión anterior del modelo. No se dispone de datos de benchmarks que permitan comparar la calidad frente a alternativas de otros fabricantes.

## Limitaciones y advertencias

- Poda agresiva: se conservan 16 de 179 expertos enrutados por capa, y el propio autor espera degradación real frente al modelo completo, especialmente fuera del dominio del código.
- Ejemplo documentado de fallo aritmético: en la build q6, la pregunta "¿Cuánto es 17 por 23?" produjo un razonamiento que concluyó en 323 en lugar de 391.
- La cuantización q4 dispara la perplejidad un 53,7 %; solo q8 y q6 son aceptables según las mediciones del autor.
- La plantilla de chat incluida no cubre llamadas a herramientas ni imágenes, lo que limita su uso en agentes.
- La ruta de visión no fue validada, aunque los ficheros se distribuyen.
- El indexador DSA se mantiene en bf16/f32 porque su error solo se manifiesta más allá de 2048 tokens; las evaluaciones cortas no lo detectarían.
- Licencia Kimi K3.1-Pro: requiere acuerdo separado para uso comercial a gran escala (por encima de 20 M USD en 12 meses para negocios de Model-as-a-Service) y exhibición prominente de "Kimi K3.1-Pro" por encima de 100 M de MAU o 20 M USD/mes.
- Requiere `trust-remote-code` y un cargador no upstream, lo que añade superficie de riesgo en producción.
- Solo se validó la ruta de texto; el rendimiento y la estabilidad en prompts largos no están caracterizados.
- No hay información sobre sesgos del modelo base ni sobre su comportamiento en idiomas distintos del inglés y el chino.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/pipenetwork/Kimi-K3.1-Pro-REAP80-code-MLX-mxfp4-q8
- Modelo base: https://huggingface.co/moonshotai/Kimi-K3.1-Pro
- Licencia del modelo base: https://huggingface.co/moonshotai/Kimi-K3.1-Pro/blob/main/LICENSE
- Build previa del mismo autor: https://huggingface.co/pipenetwork/Kimi-K3-REAP80-MLX-mxfp4-q8
- README de la build previa: https://huggingface.co/pipenetwork/Kimi-K3-REAP80-MLX-mxfp4-q8/blob/main/README.md
- Cargador de la build previa: https://huggingface.co/pipenetwork/Kimi-K3-REAP80-MLX-mxfp4-q8/blob/main/kimi_k3.py
