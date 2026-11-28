# shahafvl/gaussianformer-v22

## Resumen

GaussianFormer V22 es un modelo de renderizado neuronal que sintetiza imagenes de escenas representadas como 3D Gaussian Splatting (3DGS) mediante un transformer, sin optimizacion por escena y sin rasterizador en el pipeline de render. Lo desarrolla el autor `shahafvl` y parte de RenderFormer (SIGGRAPH 2025), un renderizador transformer para mallas triangulares de Microsoft, del que hereda la arquitectura de dos etapas y los pesos iniciales.

El modelo convierte cada gaussiana (14 parametros: posicion, escala, cuaternion, color RGB y opacidad) en un token de escena, y emplea un encoder de escena independiente de la vista seguido de un decoder de rayos dependiente de la vista con cabeza DPT. Resuelve el problema de la novel view synthesis a partir de splats sin necesidad de rasterizar en tiempo de inferencia, lo que abre la puerta a renderizado diferenciable y a integracion en pipelines neuronales extremo a extremo.

Con 194,9 millones de parametros y un repositorio de 0,8 GB, es un modelo de tamano contenido orientado a investigacion en renderizado neuronal. Su relevancia actual radica en que demuestra que un transformer puede aproximar el renderizado de 3DGS con una calidad cercana a la rasterizacion (38,08 dB frente a 44,02 dB de PSNR en objetos no vistos), manteniendo la licencia MIT y un formato de pesos safetensors estandar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de dos etapas (encoder de escena independiente de la vista + decoder de rayos dependiente de la vista con cabeza DPT), adaptado de RenderFormer |
| Parametros totales | 194.892.183 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; entrada de ~20k gaussianas como tokens de escena) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de vision/renderizado, no linguistico) |
| Licencia | MIT |
| Formato de pesos | safetensors (libreria `gaussianformer`, `PyTorchModelHubMixin`) |

## Arquitectura y entrenamiento

La arquitectura mantiene el esquema de RenderFormer: un encoder de escena que procesa los tokens de gaussiana de forma independiente de la vista, y un decoder de rayos que, dada una camara, genera la imagen mediante una cabeza DPT. Cada gaussiana se representa con 14 valores activados (posicion 3, escala lineal 3, cuaternion unitario wxyz 4, RGB 3 y opacidad 1), lo que produce aproximadamente 20.000 tokens de escena por objeto. Sobre la base de RenderFormer se introducen tres modificaciones: RoPE 2D proyectado (`proj_rope_2d`), que proyecta cada gaussiana en la vista y usa sus coordenadas imagen como embedding rotatorio 2D en la atencion cruzada del decoder; huella proyectada (`cov_key_embed`), que proyecta la covarianza de cada gaussiana y anade el tamano y orientacion de sus dos ejes a la clave de atencion cruzada mediante una capa lineal inicializada a cero por capa del decoder; y parches de 4 px (`patch_size=4`, `ray_embed_patch=8`), que generan una rejilla de 128x128 tokens a 512 px reutilizando el embedding de rayos preentrenado de 8 px. La atencion cruzada es densa: cada parche atiende a todas las gaussianas.

El entrenamiento usa los 26.820 objetos de entrenamiento del dataset Objaverse_Splats, cada uno podado de ~50k a 20k gaussianas con la puntuacion de importancia de LightGaussian y un fine-tune de recuperacion de las gaussianas conservadas. Los objetivos son renders con gsplat del splat completo sin podar a 512 px, con 28 vistas por objeto a distancias de camara 1,15, 1,7 y 2,45. El modelo se inicializa con los pesos de RenderFormer y se entrena primero a 256 px (checkpoint publicado `gaussianformer-256px`), despues una etapa corta a 256 px con las tres modificaciones activadas y finalmente 385k pasos a 512 px en 8 GPUs (una vista por GPU por paso, 4 pasadas sobre cada vista), con learning rate warmup-stable-decay de 5e-5 y decaimiento coseno a 5e-7 en los ultimos 10k pasos. La informacion sobre la funcion de perdida esta truncada en la model card.

## Capacidades

- Renderizado de novel view synthesis a partir de escenas 3D Gaussian Splatting en formato PLY.
- Generacion de imagenes a 512x512 px desde camaras arbitrarias (matriz camera-to-world, FOV configurable).
- Renderizado sin rasterizador: toda la sintesis ocurre en el transformer.
- Renderizado sin optimizacion por escena: inferencia directa sobre el splat de entrada.
- Procesamiento de objetos centrados, con eje Y hacia arriba y escalados a [-0,45, 0,45]^3, con ~20k gaussianas.
- Conversion integrada de PLY (escalas logaritmicas, cuaterniones crudos, armonicos esfericos, logits de opacidad) a la representacion de 14 parametros mediante `load_ply`.
- Poda automatica a 20k gaussianas y fine-tune de recuperacion de las conservadas (~1 minuto en GPU).
- Soporte de orbitas de camara y objetos en rotacion (tumble) mediante utilidades de camaras (`orbit`).
- No soporta tool calling, agentes, razonamiento multi-step ni capacidades linguisticas: es un modelo puramente de vision/renderizado.

## Casos de uso

- Renderizado de assets 3D en pipelines de generacion: dado un splat producido por un modelo generativo 3DGS, GaussianFormer genera vistas sin rasterizador, lo que permite integrar el renderizado dentro de un grafo diferenciable extremo a extremo.
- Novel view synthesis para investigacion en renderizado neuronal: sirve como baseline reproducible (licencia MIT, pesos safetensors) para comparar arquitecturas transformer frente a rasterizacion con gsplat.
- Generacion de vistas para aumento de datos: a partir de un splat capturado, se generan vistas en orbitas arbitrarias (distancias 1,15, 1,7 y 2,45) para entrenar otros modelos de vision 3D.
- Previsualizacion rapida de splats sin motor de rasterizacion: util en entornos donde no se dispone de un rasterizador GPU (gsplat, difrast) o se quiere evitar su dependencia, a costa de menor PSNR (38,08 dB frente a 44,02 dB).
- Integracion en herramientas de captura y reconstruccion 3D: el pipeline `ply_to_h5` + `infer.py` permite convertir un PLY y renderizar un PNG por camara desde linea de comandos, adecuado para procesamiento por lotes.
- Prototipado de renderizado neuronal en investigacion academica: la arquitectura de dos etapas con encoder de escena y decoder de rayos sirve de base para experimentos con RoPE proyectado y huellas de covarianza.
- Evaluacion comparativa de representaciones: permite medir la fidelidad de la representacion de 20k gaussianas frente al splat completo, con metricas PSNR, SSIM y LPIPS documentadas.

## Benchmarks y rendimiento

Resultados sobre 300 objetos no vistos en entrenamiento, PSNR en el recorte cuadrado alrededor del objeto frente al ground truth del splat completo, sobre las 28 vistas de entrenamiento y sobre 4 de ellas (vistas 0, 4, 7 y 11 a distancia 1,7):

| Metodo | PSNR 28 vistas | PSNR 4 vistas | SSIM | LPIPS |
|---|---|---|---|---|
| Rasterizacion gsplat de la misma entrada de 20k gaussianas | 44,02 | 44,97 | 0,9954 | 0,0046 |
| GaussianFormer | 38,08 | 38,36 | 0,9814 | 0,0113 |

Por distancia de camara, GaussianFormer obtiene 38,47, 38,38 y 37,08 dB a 1,15, 1,7 y 2,45 respectivamente (rasterizacion: 42,39, 45,14 y 43,39). Sobre 300 objetos de entrenamiento en sus 28 vistas de entrenamiento: 38,25 dB, 0,17 dB por encima de los objetos no vistos.

## Requisitos de hardware

- Entorno oficial: Linux, GPU NVIDIA, Python 3.12, PyTorch para CUDA 12.8.
- VRAM estimada: no disponible en la informacion proporcionada; con 194,9 M de parametros en fp32 los pesos ocupan aproximadamente 0,78 GB, a lo que hay que sumar memoria de activaciones para ~20k tokens de escena y una rejilla de 128x128 tokens por vista.
- GPU recomendadas: no disponible; la model card solo especifica GPU NVIDIA y el entrenamiento se hizo en 8 GPUs.
- Compatibilidad con GPU de consumo: no confirmada en la informacion disponible.
- Despliegue: pipeline `GaussianFormerRenderingPipeline.from_pretrained(...)` de la libreria `gaussianformer`, instalable con `uv` desde el repositorio de GitHub; Flash Attention opcional mediante el extra `flash` (sin el se usa scaled-dot-product attention de PyTorch).
- Latencia y throughput: no disponibles; la model card solo indica que el fine-tune de recuperacion tras la poda tarda aproximadamente un minuto en GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Entrada | Contexto / tokens | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GaussianFormer V22 | 194,9 M | 3D Gaussian Splatting (14 params/gaussiana) | ~20k tokens de escena | MIT | Hugging Face (`shahafvl/gaussianformer-v22`) |
| RenderFormer v1 base (`microsoft/renderformer-v1-base`) | no disponible | Mallas triangulares | no disponible | no disponible | Hugging Face |
| gsplat (rasterizador) | no aplica (no neuronal) | 3D Gaussian Splatting | no aplica | no disponible en la informacion | Codigo abierto |

GaussianFormer V22 se distingue de RenderFormer por el tipo de entrada (splats frente a mallas) y por las tres modificaciones arquitectonicas descritas; de gsplat, por ser un modelo neuronal sin rasterizador, con menor PSNR (38,08 frente a 44,02 dB) pero potencialmente integrable en grafos diferenciables.

## Limitaciones y advertencias

- Calidad inferior a la rasterizacion: 38,08 dB frente a 44,02 dB de PSNR en objetos no vistos, con SSIM y LPIPS tambien peores.
- Entrada restringida: objetos centrados, eje Y hacia arriba, escalados a [-0,45, 0,45]^3 y con ~20k gaussianas; no admite escenas grandes ni multiples objetos sin adaptacion.
- Resolucion de salida fija a 512 px en el checkpoint publicado (existe un checkpoint separado a 256 px).
- Dependencia de la conversion PLY: `load_ply` normaliza, poda a 20k gaussianas y requiere un fine-tune de recuperacion de aproximadamente un minuto en GPU.
- Requiere Linux, GPU NVIDIA y Python 3.12; no se documenta soporte para CPU, macOS ni otras plataformas.
- Riesgo de artefactos y alucinacion visual en vistas alejadas del rango de entrenamiento (distancias fuera de 1,15-2,45) o en geometrias poco representadas en Objaverse.
- Sesgos de dominio: entrenado exclusivamente con objetos de Objaverse_Splats, por lo que su generalizacion a capturas reales, escenas interiores o materiales fuera de distribucion no esta validada.
- Licencia MIT permite uso comercial, pero la model card no documenta implicaciones de la licencia del modelo base RenderFormer ni del dataset Objaverse_Splats; conviene revisarlas antes de produccion.
- Sin datos publicados de latencia, throughput ni VRAM, lo que dificulta planificar despliegues en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/shahafvl/gaussianformer-v22
- Checkpoint a 256 px: https://huggingface.co/shahafvl/gaussianformer-256px
- Modelo base RenderFormer: https://huggingface.co/microsoft/renderformer-v1-base
- Paper: https://arxiv.org/abs/2611.05593
- Pagina del proyecto: https://svlwoof.github.io/gaussianrenderformer/
- Codigo: https://github.com/SVLwoof/gaussianformer
- Dataset: https://huggingface.co/datasets/ShapeSplats/Objaverse_Splats
