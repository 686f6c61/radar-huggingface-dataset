# pratikgx/Depth-Pro-2-MLX-4bit

## Resumen

Depth Pro 2 MLX 4-bit es una conversión comunitaria no oficial de los pesos de Apple Depth Pro 2, un modelo de estimación de profundidad monocular métrica que predice mapas de profundidad en metros a partir de una sola imagen RGB. El autor de esta conversión es el usuario de Hugging Face `pratikgx`, que ha aplicado cuantización de solo pesos (4 bits, group size 64) sobre las capas `nn.Linear` del encoder para reducir el tamaño del bundle de inferencia en macOS con el framework MLX. No es un producto de Apple y no cuenta con su respaldo.

El modelo original pertenece a la familia Apple Depth Pro 2, publicada por Apple Machine Learning Research, e incluye tres variantes de tamaño (S, B, L y H+) más un estimador de longitud focal compartido (`DepthPro2-focal`). Esta conversión solo incluye las variantes L (334M parámetros) y H+ (872M parámetros), que superaron el umbral de calidad establecido por el autor (ausencia de NaNs y correlación de Pearson ≥ 0,999 frente a la referencia PyTorch MPS en BF16). Las variantes S y B no se incluyen.

La relevancia de esta ficha es doble: por un lado, documenta una técnica de cuantización MLX aplicada a un modelo de profundidad de Apple, útil para desarrolladores que trabajen en Apple Silicon; por otro lado, advierte de que la licencia original Apple AMLR restringe el uso a investigación no comercial, y de que el modelo base es de tipo investigacional, no un producto listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder + DPT decoder con cabeza de profundidad inversa y estimador FOV compartido (según descripción del autor; detalles exactos de la arquitectura original no disponibles) |
| Parametros totales | L: 334M; H+: 872M |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (modelo de visión, no de texto) |
| Tipos de cuantizacion | 4-bit affine (group size 64) en capas `nn.Linear` del encoder; DPT decoder en BF16; cabeza de profundidad inversa en FP32; estimador FOV en BF16/FP32 |
| Idiomas soportados | No disponible (modelo de visión, sin procesamiento de lenguaje) |
| Licencia | Apple AMLR (Apple Machine Learning Research Model License Agreement); uso solo para investigación no comercial |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

La información proporcionada no detalla la arquitectura interna del modelo original más allá de la descripción del bundle: un encoder (cuantizado a 4 bits), un decoder DPT (BF16), una cabeza de profundidad inversa (FP32) y un estimador de campo de visión (FOV) compartido (BF16 trunk, FP32 head). El modelo base es un estimador de profundidad monocular métrica, es decir, predice profundidad absoluta en metros a partir de una sola imagen RGB, sin necesidad de calibración de cámara externa, ya que el estimador FOV integrado infiere la longitud focal.

Esta conversión concreta es una cuantización de solo pesos: no hay reentrenamiento ni fine-tuning. Se aplicó cuantización afín MLX de 4 bits con group size 64 a las capas `nn.Linear` del encoder. Se mantuvieron en mayor precisión las LayerNorms, los embeddings de tokens de clase y de registro, todas las capas `Conv2d` y `ConvTranspose2d` (patch embedding, reassemble, decoder DPT), la cabeza de profundidad inversa en FP32 y el estimador FOV en BF16/FP32. Los pesos de convolución se almacenan en el layout NHWC de MLX que usa el port. El port MLX utilizado (`depth_pro_2_mlx` 0.1.0, sobre MLX 0.32.4) fue construido por [@SpaceXSI](https://x.com/SpaceXSI) con un agente de código, según indica el autor.

## Capacidades

- Estimación de profundidad monocular métrica: predice mapas de profundidad en metros y profundidad inversa a partir de una imagen RGB.
- Estimación de longitud focal: el estimador FOV integrado infiere la focal en píxeles, lo que permite métricas absolutas sin calibración externa.
- Procesamiento de imágenes a resolución nativa: el autor reporta pruebas con una foto oficial a 1920×1440 y con un recorte 1280×720.
- Inferencia en Apple Silicon vía MLX: el bundle está pensado para ejecutarse con MLX 0.32.4 o superior y el port `depth_pro_2_mlx`.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües: es un modelo puramente visual.
- No soporta thinking mode, audio ni vídeo de forma nativa (las pruebas con 1280×720 son un recorte estático de una imagen, no un flujo de vídeo).

## Casos de uso

- Investigación en visión por computador: evaluación de técnicas de cuantización MLX sobre modelos de profundidad métrica, comparando la paridad 4-bit frente a BF16 con las métricas de Pearson y error relativo mediano que reporta el autor.
- Prototipado en Apple Silicon: desarrolladores que quieran probar estimación de profundidad métrica en un Mac con MLX sin descargar los pesos completos de Apple (272,1 MiB para L frente a 1.274,0 MiB oficiales; 562,6 MiB para H+ frente a 3.326,9 MiB).
- Aplicaciones de realidad aumentada en investigación: generación de mapas de profundidad para inserción de objetos virtuales en escenas reales, aprovechando la profundidad métrica absoluta y la estimación de focal integrada.
- Reconstrucción 3D y fotogrametría experimental: uso de los mapas de profundidad como entrada para pipelines de reconstrucción densa en entornos académicos, con la advertencia de que la licencia es solo para investigación.
- Segmentación asistida por profundidad: generación de máscaras o capas de primer plano/fondo en imágenes usando el mapa de profundidad como señal auxiliar en proyectos de investigación.
- Evaluación comparativa de variantes L y H+: el repositorio incluye ambas tallas con métricas de paridad frente a BF16, lo que permite estudiar el compromiso entre tamaño, memoria y precisión en un Mac (282,8 MiB de pico de Metal para L; 576,2 MiB para H+).
- Docencia y experimentación con cuantización: ejemplo práctico de cuantización de solo pesos con MLX, incluyendo el script `load_4bit.py` en la raíz del repositorio.

## Benchmarks y rendimiento

El autor reporta métricas de paridad de la cuantización 4-bit frente a la referencia PyTorch MPS BF16 (foto oficial `assets/example.jpg` a 1920×1440) y frente a una ejecución MLX BF16 en la misma sesión (recorte 1280×720). No son benchmarks de precisión absoluta del modelo frente a datasets estándar, sino medidas de fidelidad de la conversión.

Foto oficial 1920×1440 frente a referencia PyTorch MPS BF16:

| Tamano | Incluido | Pearson r 4-bit | Pearson r BF16 | Error rel. mediano 4-bit | Error rel. mediano BF16 | NaNs 4-bit | Error FOV vs ref (px) |
|---|---|---:|---:|---:|---:|---:|---:|
| S | no | 0,99499 | 0,99996 | 0,0489 | 0,00336 | 0 | 0,581 |
| B | no | 0,99653 | 0,99998 | 0,1552 | 0,00217 | 0 | 0,581 |
| L | sí | 0,99959 | 0,99999 | 0,0123 | 0,00204 | 0 | 0,581 |
| H+ | sí | 0,99986 | 1,00000 | 0,0311 | 0,00230 | 0 | 0,581 |

Recorte 1280×720, 4-bit frente a MLX BF16 de la misma sesión:

| Tamano | Pearson r 4-bit vs BF16 | Error rel. mediano 4-bit vs BF16 | NaNs 4-bit |
|---|---:|---:|---:|
| S | 0,99421 | 0,0446 | 0 |
| B | 0,99714 | 0,1569 | 0 |
| L | 0,99897 | 0,0416 | 0 |
| H+ | 0,99973 | 0,0405 | 0 |

Memoria de carga (pico de Metal tras cargar el bundle 4-bit, no es una prueba de velocidad): L 282,8 MiB; H+ 576,2 MiB. No se han publicado resultados de benchmarks estándar (por ejemplo, RMSE o δ1 sobre datasets públicos de profundidad) en la información disponible.

## Requisitos de hardware

- VRAM/unificada estimada: el autor reporta un pico de Metal de 282,8 MiB para L y 576,2 MiB para H+ al cargar el bundle 4-bit. Son cifras de carga, no de inferencia completa.
- Hardware de referencia: las mediciones se hicieron en un Mac mini M5 Pro con 64 GB de memoria unificada.
- GPU recomendadas: Apple Silicon con soporte Metal y MLX 0.32.4 o superior. No hay datos de rendimiento en GPUs NVIDIA o AMD para este bundle MLX.
- ¿Cabe en GPU de consumo? Sí, en términos de memoria, en cualquier Mac Apple Silicon moderno; el autor no reporta requisitos mínimos de memoria unificada distintos de las cifras de pico de Metal.
- Opciones de despliegue: MLX con el port `depth_pro_2_mlx` 0.1.0 y el script `load_4bit.py` incluido en el repositorio. No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a este formato).
- Latencia y throughput: no disponibles. El autor indica explícitamente que las cifras de memoria son informativas y no una prueba de velocidad.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Profundidad metrica | Licencia | Formato / despliegue |
|---|---|---|---|---|---|
| pratikgx/Depth-Pro-2-MLX-4bit (L) | 334M | No aplica | Sí | Apple AMLR (solo investigación) | safetensors MLX 4-bit |
| pratikgx/Depth-Pro-2-MLX-4bit (H+) | 872M | No aplica | Sí | Apple AMLR (solo investigación) | safetensors MLX 4-bit |
| apple/DepthPro2-L (original) | 334M | No aplica | Sí | Apple AMLR (solo investigación) | Pesos originales Apple (1.274,0 MiB) |
| apple/DepthPro2-H (original) | 872M | No aplica | Sí | Apple AMLR (solo investigación) | Pesos originales Apple (3.326,9 MiB) |

No se dispone en la información proporcionada de comparaciones con otros modelos de profundidad monocular (por ejemplo, Depth Anything, MiDaS o Metric3D), ni de sus parámetros, licencias o rendimiento. Por tanto, la comparativa se limita a las variantes del propio modelo y a la versión original de Apple.

## Limitaciones y advertencias

- Licencia restrictiva: el modelo original está bajo Apple AMLR, que limita el uso a investigación científica no comercial y desarrollo académico. Esta conversión no cambia esa licencia. No apto para producción comercial sin autorización expresa de Apple.
- Conversión no oficial: no es un producto de Apple y Apple no la respalda. El port MLX subyacente fue construido por un tercero con un agente de código, lo que añade un nivel de riesgo técnico.
- Conjunto de pruebas pequeño: las métricas de calidad 4-bit provienen de una sola foto oficial a resolución nativa y de un único recorte 1280×720 de esa misma foto. No son una afirmación de precisión sobre un dataset completo.
- Riesgo de NaNs en FP16: el autor advierte que, en pruebas previas con precisión completa en MLX, FP16 produjo mapas de profundidad con todos los valores NaN en algunas entradas. Debe usarse BF16 para precisión completa, no FP16.
- Variantes S y B no incluidas: si se necesitan esos tamaños, hay que usar los pesos originales de Apple con el port MLX en BF16.
- Sesgos conocidos: no disponibles en la información proporcionada. Al ser un modelo de profundidad entrenado por Apple, es probable que herede sesgos del dataset original, pero no se documentan.
- Alucinación: no aplica en el sentido de generación de texto; sin embargo, un modelo de profundidad puede producir mapas plausibles pero incorrectos en escenas fuera de distribución, y no se aportan datos de robustez.
- Limitaciones de idioma: no aplica (modelo visual).
- Restricciones de producción: además de la licencia, el formato MLX limita el despliegue a entornos Apple Silicon; no hay soporte documentado para CUDA, ROCm ni CPU genérica en este bundle.

## Enlaces

- Repositorio de la conversión: https://huggingface.co/pratikgx/Depth-Pro-2-MLX-4bit
- Modelo base principal: https://huggingface.co/apple/DepthPro2
- Variante L original: https://huggingface.co/apple/DepthPro2-L
- Variante H original: https://huggingface.co/apple/DepthPro2-H
- Estimador de focal compartido: https://huggingface.co/apple/DepthPro2-focal
- Código upstream de Apple: https://github.com/apple-aiml-research/ml-depth-pro-2
- MLX (framework): https://github.com/ml-explore/mlx
- Perfil del autor del port MLX: https://x.com/SpaceXSI
