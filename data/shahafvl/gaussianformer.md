# shahafvl/gaussianformer

## Resumen

GaussianFormer es un modelo de renderizado neuronal que sintetiza imagenes de escenas representadas como 3D Gaussian Splatting (3DGS) mediante un transformer, sin optimizacion por escena y sin rasterizador en el pipeline de render. Lo desarrolla el autor `shahafvl` y deriva de RenderFormer (SIGGRAPH 2025, Microsoft), un renderizador transformer para mallas triangulares, del cual hereda la arquitectura de dos etapas y los pesos iniciales. La adaptacion convierte cada Gaussiana en un token de escena a partir de sus 14 parametros.

El modelo resuelve el problema de renderizar splats de forma feed-forward: en lugar de optimizar o rasterizar por escena, un unico pase del transformer produce las imagenes para las camaras solicitadas. Es relevante para pipelines de novel view synthesis, generacion de assets 3D y evaluacion rapida de reconstrucciones, donde el coste de un rasterizador o de un ajuste por escena resulta limitante.

Cuenta con 194.892.183 parametros, se distribuye en safetensors (repo de 1,6 GB) y se publica bajo licencia MIT. La longitud de contexto no aplica en el sentido de LLM: la entrada es un conjunto de aproximadamente 20.000 Gaussianas (tokens de escena) y un conjunto de camaras. La salida son imagenes de 512x512 px.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de dos etapas (scene encoder independiente de la vista + ray decoder dependiente de la vista con cabeza DPT), adaptado de RenderFormer |
| Parametros totales | 194.892.183 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica; entrada de ~20.000 tokens de escena (una Gaussiana por token) y conjunto de camaras |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de vision/renderizado, no linguistico) |
| Licencia | MIT |
| Formato de pesos | safetensors (libreria `gaussianformer`, `pytorch_model_hub_mixin`) |
| Resolucion de salida | 512x512 px (checkpoint publicado); existe checkpoint intermedio `gaussianformer-256px` |
| Entrada | PLY de 3D Gaussian Splatting; 14 valores por Gaussiana: pos(3), scale(3), quat wxyz(4), rgb(3), opacity(1) |
| Modelo base | microsoft/renderformer-v1-base (fine-tune) |
| Dataset de entrenamiento | ShapeSplats/Objaverse_Splats (26.820 objetos) |
| Paper | arXiv:2611.05593 |

## Arquitectura y entrenamiento

La arquitectura mantiene el esquema de RenderFormer: un encoder de escena que procesa la geometria y apariencia de forma independiente de la vista, y un decoder de rayos dependiente de la vista con una cabeza DPT que produce la imagen. Cada Gaussiana se representa como un token de 14 parametros. Sobre esta base se introducen tres modificaciones: RoPE 2D proyectado (`proj_rope_2d`), que proyecta cada Gaussiana en la vista y usa sus coordenadas imagen como embedding rotatorio 2D en la atencion cruzada del decoder; huella proyectada (`cov_key_embed`), que proyecta la covarianza de cada Gaussiana y anade el tamano y orientacion de sus dos ejes a su clave mediante una capa lineal inicializada a cero por capa del decoder; y parches de 4 px (`patch_size=4`, `ray_embed_patch=8`) en lugar de 8 px, lo que da una rejilla de 128x128 tokens a 512 px. La atencion cruzada es densa: cada parche atiende a todas las Gaussianas.

El entrenamiento usa los 26.820 objetos de Objaverse_Splats, cada uno podado de ~50k a 20k Gaussianas (score de importancia de LightGaussian seguido de un fine-tune de recuperacion). Los objetivos son renders con gsplat del splat completo sin podar a 512 px, con 28 vistas por objeto a distancias de camara 1,15, 1,7 y 2,45. El modelo se inicializa desde los pesos de RenderFormer y se entrena primero a 256 px (checkpoint `gaussianformer-256px`), despues se activan las tres modificaciones en una etapa corta a 256 px y finalmente se realizan 385k pasos a 512 px en 8 GPUs (una vista por GPU y paso, 4 pasadas sobre cada vista), con learning rate warmup-stable-decay a 5e-5 y decaimiento coseno a 5e-7 en los ultimos 10k pasos. La perdida indicada en la model card es log-HDR (la informacion proporcionada se interrumpe en ese punto).

## Capacidades

- Renderizado feed-forward de escenas 3D Gaussian Splatting sin optimizacion por escena ni rasterizador en el renderer.
- Novel view synthesis: genera imagenes para camaras arbitrarias definidas como matrices camera-to-world con FOV configurable.
- Entrada directa desde ficheros PLY de 3DGS, con conversion automatica de log-scales, cuaterniones crudos, coeficientes de armonicos esfericos y logits de opacidad; normalizacion del objeto y poda a 20k Gaussianas.
- Renderizado de objetos centrados, con eje Y hacia arriba y escalados a [-0,45, 0,45]^3.
- Soporte de trayectorias de camara (orbitas, tumble) mediante utilidades del paquete (`gaussianformer.utils.cameras.orbit`).
- Atencion densa parche-a-Gaussiana con Flash Attention opcional (extra `flash`); sin el, usa scaled-dot-product attention de PyTorch.
- No dispone de tool calling, capacidades de agente, razonamiento multi-paso ni capacidades linguisticas o multimodales en el sentido de un LLM.

## Casos de uso

- Novel view synthesis de assets 3D: dado un PLY de 3DGS de un objeto, generar renders desde camaras arbitrarias sin ejecutar un rasterizador, util para previsualizacion en visores web o catalogos de assets.
- Evaluacion rapida de reconstrucciones 3DGS: comparar la calidad de un splat reconstruido contra renders de referencia de forma feed-forward, con PSNR/SSIM/LPIPS medibles sobre las imagenes generadas.
- Generacion de turntables y orbitas para marketing: producir secuencias de camara alrededor de un objeto (orbit) o tumbado (tumble) a partir de un unico splat, como muestran los ejemplos de la model card.
- Pipelines de datos sinteticos: generar vistas de objetos 3D para aumentar datasets de vision por computador sin coste de rasterizacion por vista.
- Prototipado en investigacion de renderizado neuronal: servir de base para experimentos sobre atencion cruzada, RoPE proyectado o representaciones de splats como tokens, con pesos MIT y codigo publico.
- Integracion en herramientas de autoria 3D: convertir un PLY a HDF5 (`tools.ply_to_h5`) y renderizar por lotes desde linea de comandos (`infer.py`), generando un PNG por camara para revisiones automatizadas.
- Comparacion de metodos de render: usar la rasterizacion gsplat del mismo input de 20k Gaussianas como linea base cuantitativa frente al render del transformer.

## Benchmarks y rendimiento

Resultados sobre 300 objetos no vistos en entrenamiento, PSNR sobre el recorte cuadrado alrededor del objeto frente al ground truth del splat completo, sobre 28 vistas de entrenamiento y sobre 4 de ellas (vistas 0, 4, 7 y 11 a distancia 1,7):

| Metodo | PSNR 28 vistas | PSNR 4 vistas | SSIM | LPIPS |
|---|---|---|---|---|
| Rasterizacion gsplat del mismo input de 20k Gaussianas | 44,02 | 44,97 | 0,9954 | 0,0046 |
| GaussianFormer | 38,08 | 38,36 | 0,9814 | 0,0113 |

Por distancia de camara, GaussianFormer obtiene 38,47, 38,38 y 37,08 dB a 1,15, 1,7 y 2,45 respectivamente (rasterizacion: 42,39, 45,14 y 43,39). Sobre 300 objetos de entrenamiento en sus 28 vistas de entrenamiento: 38,25 dB, 0,17 dB por encima de los objetos no vistos.

## Requisitos de hardware

- Entorno soportado: Linux, GPU NVIDIA, Python 3.12; la instalacion con `uv` incluye PyTorch para CUDA 12.8.
- VRAM estimada: no disponible de forma explicita; con 194,9 M de parametros y pesos en safetensors (repo de 1,6 GB), la inferencia en precision nativa requiere del orden de varios GB, pero la atencion densa sobre ~20k tokens de escena y una rejilla de 128x128 parches domina el consumo. No se publican cifras.
- GPU recomendadas: no disponible; el entrenamiento se realizo en 8 GPUs (modelo no especificado). Se recomienda GPU NVIDIA con soporte CUDA 12.8.
- Cabe en GPU de consumo: no confirmado en la informacion disponible; el requisito de CUDA 12.8 y la atencion densa sugieren GPUs recientes, pero no se aportan medidas.
- Opciones de despliegue: paquete `gaussianformer` instalable desde el repositorio con `uv`; pipeline `GaussianFormerRenderingPipeline.from_pretrained(...)`; CLI `infer.py` y `tools.ply_to_h5`. Flash Attention opcional mediante el extra `flash`.
- Latencia y throughput: no disponibles. La model card solo indica que el fine-tune de recuperacion de las 20k Gaussianas tras la poda tarda aproximadamente un minuto en una GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Entrada | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GaussianFormer | 194,9 M | 3DGS (PLY, 20k Gaussianas) | Transformer feed-forward, sin rasterizador | MIT | Hugging Face + codigo en GitHub |
| RenderFormer (microsoft/renderformer-v1-base) | no disponible | Mallas triangulares | Transformer feed-forward, sin rasterizador | no disponible | Hugging Face |
| Rasterizacion gsplat | no aplica (no neuronal) | 3DGS | Rasterizacion explicita | no disponible | Codigo abierto (gsplat) |

Frente a RenderFormer, GaussianFormer cambia el dominio de entrada de mallas a splats, usa parches de 4 px en lugar de 8 px y anade RoPE 2D proyectado y huella de covarianza en la atencion cruzada. Frente a la rasterizacion gsplat, sacrifica calidad (38,08 frente a 44,02 dB de PSNR en 28 vistas) a cambio de un renderizado neuronal sin rasterizador.

## Limitaciones y advertencias

- Calidad inferior a la rasterizacion del mismo input: 38,08 dB frente a 44,02 dB de PSNR y LPIPS de 0,0113 frente a 0,0046; no es un sustituto de un rasterizador cuando se busca maxima fidelidad.
- Supuestos de entrada estrictos: objeto centrado, eje Y hacia arriba, escalado a [-0,45, 0,45]^3 y aproximadamente 20k Gaussianas; los PLY con mas Gaussianas se podan y se ajustan, lo que introduce perdida de detalle.
- Resolucion de salida fija de 512x512 px en el checkpoint publicado.
- La model card no documenta sesgos; al entrenar exclusivamente con Objaverse_Splats, la generalizacion fuera de la distribucion de objetos de ese dataset (formas, materiales, iluminacion) no esta caracterizada.
- Riesgo de artefactos y alucinacion geometrica: al ser un modelo generativo de imagenes, puede producir detalles plausibles pero inexistentes en el splat de entrada, especialmente en vistas alejadas de las de entrenamiento.
- Limitaciones de contexto e idioma: no aplica soporte linguistico; la informacion de idiomas figura como no disponible.
- Licencia MIT, que permite uso comercial, pero el modelo deriva de RenderFormer y del dataset Objaverse_Splats; conviene verificar las condiciones de esos componentes antes de un despliegue comercial.
- Requiere Linux, GPU NVIDIA y CUDA 12.8; no se documenta soporte para CPU, macOS ni otras aceleradoras.
- La model card se interrumpe en la descripcion de la funcion de perdida (log-HDR), por lo que no se detalla el resto del esquema de entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/shahafvl/gaussianformer
- Checkpoint intermedio 256 px: https://huggingface.co/shahafvl/gaussianformer-256px
- Paper: https://arxiv.org/abs/2611.05593
- Pagina del proyecto: https://svlwoof.github.io/gaussianrenderformer/
- Codigo: https://github.com/SVLwoof/gaussianformer
- Modelo base RenderFormer: https://huggingface.co/microsoft/renderformer-v1-base
- Dataset Objaverse_Splats: https://huggingface.co/datasets/ShapeSplats/Objaverse_Splats
