# netprojects/Cosmos3-Edge-mlx-6bit

## Resumen

Cosmos3-Edge-mlx-6bit es una conversión a MLX del razonador del modelo Cosmos3-Edge de NVIDIA, publicada por NetProjects (Internet Projects Ltd). Se trata de un modelo vision-language de tipo image-text-to-text que acepta texto, imágenes y vídeo, y devuelve texto, con modo de razonamiento (thinking) opcional. La conversión cuantiza el modelo de lenguaje a 6 bits (afín, grupo 64) y mantiene el tower de visión SigLIP2 y el proyector en bf16, dando un peso total de 2,6 GB.

El modelo base, nvidia/Cosmos3-Edge, es un world model de 4.000 millones de parámetros orientado a ejecución on-device, pensado para que robots y agentes de visión artificial comprendan el entorno, razonen en tiempo real y generen acciones localmente. Forma parte de la familia Cosmos 3, junto a Nano (16B) y Super (64B), y es el tier más pequeño. Esta conversión concreta, sin embargo, solo incluye el razonador: los tensores del generador de vídeo del checkpoint original no forman parte de este build.

La relevancia de esta ficha radica en que permite ejecutar un modelo multimodal de razonamiento de NVIDIA en Apple Silicon mediante MLX, con un tamaño contenido (2,6 GB) y una paridad de siguiente token del 97,7 % respecto a la implementación de referencia en transformers. Es una opción práctica para prototipado local de pipelines de visión-lenguaje en Macs con chip M-series.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder de 28 capas (hidden 2048, 16 query / 8 key-value heads, MLP ReLU², vocabulario 131.072) con M-RoPE 3D intercalado (secciones 24/20/20, theta 1e8); tower de visión SigLIP2 de 27 capas (patch 16) y merger 2×2 |
| Parametros totales | 2.435.616.496 (razonador; el checkpoint original completo incluye además el generador de vídeo, no incluido en este build) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible como cifra oficial; se han validado pruebas de aguja hasta 16K tokens con resultados equivalentes o mejores que la implementación de NVIDIA |
| Tipos de cuantizacion | 6 bits afín con grupo 64 para el LM; bf16 para el tower de visión y el proyector. Existe también un build de 8 bits |
| Idiomas soportados | no disponible |
| Licencia | OpenMDW-1.1 (openmdw1.1-license) |
| Formato de pesos | safetensors (librería MLX) |

## Arquitectura y entrenamiento

El razonador sigue una arquitectura de decoder transformer de 28 capas con dimensión oculta 2048, 16 cabezas de consulta y 8 de clave-valor, MLP con activación ReLU al cuadrado y vocabulario de 131.072 tokens. Usa M-RoPE 3D intercalado con secciones 24/20/20 y theta 1e8, lo que permite codificar posiciones espaciales y temporales de forma conjunta, algo necesario para el procesamiento de vídeo. La torre de visión es de estilo SigLIP2, con 27 capas y patch de 16 píxeles, procesando a resolución nativa; la rejilla de posiciones aprendida de 16×16 se redimensiona por imagen o fotograma con el mismo filtro bilineal antialias que el original, y la atención queda restringida a cada imagen o fotograma. Un merger de parches 2×2 proyecta las representaciones visuales al espacio del modelo de lenguaje.

En vídeo, los fotogramas se codifican uno a uno con las marcas de tiempo de NVIDIA entre ellos y las posiciones siguen la función `get_rope_index` del código original. El preprocesamiento de entrada utiliza el processor propio de NVIDIA en transformers 5.22.2 o superior, de modo que el redimensionado de imágenes, el muestreo de fotogramas y las marcas de tiempo coinciden con el modelo original; los vídeos se decodifican con PyAV. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni las etapas de RLHF/DPO del modelo base en la información proporcionada.

## Capacidades

- Generación de texto con razonamiento opcional (thinking mode), activado por defecto como en la plantilla de chat de NVIDIA; se desactiva con `--no-think` o con `"chat_template_kwargs": {"enable_thinking": false}`.
- Comprensión de imágenes a resolución nativa, incluyendo múltiples imágenes en un mismo prompt.
- Comprensión de vídeo con muestreo de fotogramas configurable (por ejemplo, `--fps 4`) y marcas de tiempo entre fotogramas.
- Respuesta en texto a entradas multimodales (image-text-to-text).
- Servidor compatible con la API de OpenAI (`/v1/chat/completions`) con partes de texto, `image_url` y `video_url`, y streaming.
- El texto de razonamiento se devuelve en el campo `reasoning_content` del servidor.
- Capacidades de agente y tool calling: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso

- Descripción y análisis de imágenes en local: el modelo acepta una imagen y un prompt de texto y devuelve una descripción; útil para prototipar asistentes visuales en un Mac sin depender de la nube, con un peso de solo 2,6 GB.
- Comprensión de vídeo para resumen de escenas: con `--video clip.mp4 --fps 4` y un prompt como "What happens?", el modelo procesa fotogramas con marcas de tiempo y responde en texto, adecuado para análisis de clips cortos en investigación.
- Evaluación de razonamiento visual: el modo thinking por defecto permite obtener cadenas de razonamiento antes de la respuesta, útil para estudiar el comportamiento del modelo en tareas de RealWorldQA o CV-Bench.
- Servicio local compatible con OpenAI: el servidor MLX expone `/v1/chat/completions` con streaming, lo que permite integrar el modelo en aplicaciones existentes que ya usan el SDK de OpenAI apuntando a `localhost:8796`.
- Prototipado de agentes robóticos y de visión: al ser la conversión del razonador de un world model on-device, sirve para experimentar con pipelines de percepción y razonamiento en tiempo real sobre hardware Apple antes de pasar a despliegues en edge con TensorRT Edge-LLM.
- Investigación de paridad y cuantización: los scripts `parity.py` y `bench.py` permiten reproducir la comparación con la implementación de referencia de NVIDIA y medir el impacto de la cuantización a 6 bits frente a 8 bits y bf16.
- Pruebas de contexto largo: con límites de memoria configurables (`COSMOS_MEMORY_LIMIT_GB`, por defecto 24) y pruebas de aguja validadas hasta 16K tokens, es adecuado para tareas de recuperación de información en prompts largos multimodales.

## Benchmarks y rendimiento

Resultados publicados por el autor de la conversión, medidos en un MacBook Pro M5 Max (128 GB) el 7 de noviembre de 2026, con thinking desactivado, decodificación greedy y puntuación de respuesta exacta. CV-Bench usa cada cuarto ítem de cada fuente. La columna "mismo siguiente token" compara cada build con el modelo de NVIDIA en transformers 5.22.2 (bf16, CPU) sobre 19 prompts y 48 tokens con teacher forcing.

| Build | Tamano | Mismo siguiente token | RealWorldQA (765) | CV-Bench (25 % de muestra) |
|---|---|---|---|---|
| mlx-8bit (recomendado) | 3,1 GB | 98,4 % | 69,2 | 87,0 |
| mlx-6bit | 2,6 GB | 97,7 % | 68,6 | 87,3 |
| bf16 (pesos originales, mismo código) | 4,9 GB | 98,7 % | 68,9 | 87,2 |
| Puntuaciones publicadas por NVIDIA | — | — | 70,5 | 85,3 (conjunto completo) |

La KL media sobre los 64 tokens más probables es de 0,002 para el build de 8 bits y 0,007 para el de 6 bits. El autor advierte que los ajustes de evaluación de NVIDIA no están publicados, por lo que las puntuaciones muestran que el port se comporta como el modelo, no que reproduzca la configuración de NVIDIA.

## Requisitos de hardware

- VRAM (memoria unificada en Apple Silicon): el build de 6 bits ocupa 2,6 GB en disco; con el build de 8 bits, un prompt de 16K tokens alcanzó un pico de 5,5 GB y uno de 32K tokens, 7,3 GB.
- El límite de memoria se controla con `COSMOS_MEMORY_LIMIT_GB` (por defecto 24 GB) y la caché de buffers MLX con `COSMOS_CACHE_LIMIT_GB` (por defecto 2 GB), que se limpia tras cada petición.
- GPU recomendadas: exclusivamente Apple Silicon (MLX); el autor midió en un MacBook Pro M5 Max de 128 GB. No hay soporte para GPU NVIDIA, AMD ni CPU en esta conversión.
- Cabe en GPUs de consumo Apple: sí, con 2,6 GB de pesos y picos de memoria de 5,5-7,3 GB para contextos de 16K-32K, es viable en Macs con 16 GB o más de memoria unificada.
- Opciones de despliegue: el repositorio `internet-projects/cosmos3-edge-mlx` incluye un CLI de generación (`python -m cosmos3_edge_mlx.generate`) y un servidor compatible con OpenAI (`python -m cosmos3_edge_mlx.server`). No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | RealWorldQA | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Cosmos3-Edge-mlx-6bit (esta ficha) | 2,44B (razonador) | validado hasta 16K en pruebas de aguja | 68,6 | OpenMDW-1.1 | Hugging Face, MLX |
| Cosmos3-Edge-mlx-8bit | 2,44B (razonador) | validado hasta 16K | 69,2 | OpenMDW-1.1 | Hugging Face, MLX |
| Cosmos3-Edge bf16 (original) | ~4B (familia) | no disponible | 68,9 (medido por el autor); 70,5 (publicado por NVIDIA) | OpenMDW-1.1 | Hugging Face, NVIDIA |
| Cosmos 3 Nano | 16B | no disponible | no disponible | no disponible | GTC Taipei, mayo de 2026 |
| Cosmos 3 Super | 64B | no disponible | no disponible | no disponible | GTC Taipei, mayo de 2026 |

La comparación directa más relevante es entre los tres builds de la misma conversión (6 bits, 8 bits y bf16), donde la pérdida de precisión del 6 bits es de aproximadamente 0,3 puntos en RealWorldQA respecto a bf16 y de 0,6 respecto al 8 bits, con CV-Bench prácticamente idéntico. Frente a Nano y Super de la misma familia, Edge es el tier más pequeño (aproximadamente una dieciseisava parte de Super), pero no se dispone de sus puntuaciones para una comparación cuantitativa.

## Limitaciones y advertencias

- Solo incluye el razonador: los tensores del generador de vídeo del checkpoint original de Cosmos3-Edge no forman parte de este build, por lo que no puede generar vídeo.
- Exclusivo de Apple Silicon: depende de MLX y no funciona en GPU NVIDIA, AMD ni CPU genérica; para despliegue en edge con NVIDIA existe la vía TensorRT Edge-LLM.
- La cuantización a 6 bits introduce una divergencia medible respecto al modelo de referencia (97,7 % de mismo siguiente token, KL media 0,007 sobre los 64 tokens más probables), mayor que la del build de 8 bits.
- El autor no está afiliado a NVIDIA; es una conversión de terceros y no una versión oficial.
- Riesgo de alucinación y sesgos: no se detallan en la información proporcionada; el repositorio incluye los documentos `BIAS.md`, `EXPLAINABILITY.md`, `PRIVACY.md` y `SAFETY.md` de NVIDIA sin modificar, que conviene consultar.
- Idiomas soportados: no disponibles; no se puede garantizar un rendimiento multilingüe más allá de lo que indique la documentación de NVIDIA.
- Longitud de contexto oficial: no disponible; las pruebas de aguja del autor solo validan hasta 16K tokens.
- Licencia OpenMDW-1.1: es una licencia de tipo "other" con términos propios; debe revisarse en https://openmdw.ai/license/1-1/ antes de cualquier uso comercial.
- Los benchmarks del autor no reproducen la configuración de evaluación de NVIDIA, que no está publicada, por lo que las cifras no son directamente comparables con las oficiales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/netprojects/Cosmos3-Edge-mlx-6bit
- Build de 8 bits: https://huggingface.co/netprojects/Cosmos3-Edge-mlx-8bit
- Modelo base: https://huggingface.co/nvidia/Cosmos3-Edge
- Repositorio del port: https://github.com/internet-projects/cosmos3-edge-mlx
- Licencia OpenMDW-1.1: https://openmdw.ai/license/1-1/
- Documentación de TensorRT Edge-LLM para Cosmos3: https://nvidia.github.io/TensorRT-Edge-LLM/developer_guide/models/cosmos3.html
- Artículo sobre el lanzamiento de Cosmos 3 Edge: https://www.marktechpost.com/2026/07/21/nvidia-releases-cosmos-3-edge-a-4b-parameter-open-world-model-that-reasons-and-generates-robot-actions-on-device/
- NetProjects: https://netprojects.com
