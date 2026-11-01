# shahafvl/gaussianformer-v22

## Resumen

GaussianFormer V22 es un modelo de renderizado neuronal que sintetiza imagenes fotorrealistas de escenas representadas mediante 3D Gaussian Splatting (3DGS) sin necesidad de rasterizacion ni de optimizacion por escena. Lo desarrolla el autor independiente `shahafvl` y se distribuye con licencia MIT. El modelo adapta la arquitectura de RenderFormer (SIGGRAPH 2025, Microsoft), un renderizador transformer disenado originalmente para mallas triangulares, al dominio de las gaussianas 3D.

La innovacion principal reside en convertir cada gaussiana (14 parametros: posicion, escala, cuaternion, color RGB y opacidad) en un token de escena, manteniendo la estructura de dos etapas de RenderFormer: un codificador de escena independiente de la vista y un decodificador de rayos dependiente de la vista con cabeza DPT. El modelo se inicializa con los pesos de `microsoft/renderformer-v1-base` y anade tres modificaciones clave: RoPE 2D proyectado, huella proyectada de la covarianza y parches de 4 px.

Con 194,9 millones de parametros, el modelo aborda un problema relevante en graficos por computador: renderizar representaciones 3DGS de forma eficiente y generalizable, sin el coste de rasterizacion tradicional ni de optimizacion por escena. Su pipeline es `image-to-image` y esta pensado para sintesis de vistas noveles (novel view synthesis) de objetos aislados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de dos etapas (codificador de escena + decodificador de rayos con cabeza DPT), adaptado de RenderFormer |
| Parametros totales | 194.892.183 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica: atiende a todas las gaussianas por parche mediante cross-attention densa) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de vision/renderizado, no linguistico) |
| Licencia | MIT |
| Formato de pesos | safetensors (libreria `gaussianformer`, `pytorch_model_hub_mixin`) |

## Arquitectura y entrenamiento

GaussianFormer V22 conserva la arquitectura transformer de dos etapas de RenderFormer. Cada gaussiana se representa como un token de 14 dimensiones `[pos(3), scale(3), quat(4), rgb(3), opacity(1)]` con valores activados (escalas lineales, cuaternion unitario, color y opacidad en [0,1]). El codificador de escena es independiente de la vista y el decodificador de rayos es dependiente de la vista, con una cabeza DPT que produce la imagen final. Cada parche atiende a todas las gaussianas mediante cross-attention densa.

Sobre RenderFormer se introducen tres cambios: (1) RoPE 2D proyectado, donde cada gaussiana se proyecta en la vista y sus coordenadas de imagen entran en la cross-attention como embedding rotatorio 2D emparejado con la posicion de cada parche; (2) huella proyectada (`cov_key_embed`), que proyecta la covarianza de cada gaussiana en la vista y anade el tamano y orientacion de sus dos ejes a su clave mediante una capa lineal inicializada a cero por capa del decodificador; y (3) parches de 4 px (`patch_size=4`, `ray_embed_patch=8`), que dan una rejilla de 128x128 tokens a 512 px reutilizando el embedding de rayos preentrenado de 8 px.

El entrenamiento usa los 26.820 objetos de entrenamiento de Objaverse_Splats, cada uno podado de ~50k a 20k gaussianas (puntuacion de importancia LightGaussian mas un fine-tune de recuperacion). Los objetivos son renders con gsplat del splat completo sin podar a 512 px, con 28 vistas por objeto a distancias de camara 1.15, 1.7 y 2.45. El modelo se inicializa desde RenderFormer, se entrena a 256 px (checkpoint `gaussianformer-256px`), se activan los tres cambios en una etapa corta a 256 px y despues se realizan 385k pasos a 512 px en 8 GPUs (una vista por GPU por paso, 4 pasadas sobre cada vista), con learning rate warmup-stable-decay a 5e-5 y decaimiento coseno a 5e-7 en los ultimos 10k pasos. La funcion de perdida combina log-HDR L1 (pixeles de fondo ponderados a 0.05) y LPIPS-VGG, a partes iguales.

## Capacidades

- Renderizado de escenas 3D Gaussian Splatting: sintetiza imagenes desde camaras arbitrarias a partir de un conjunto de gaussianas, sin rasterizador ni optimizacion por escena.
- Sintesis de vistas noveles (novel view synthesis) de objetos aislados centrados, con eje Y hacia arriba y escalados en [-0.45, 0.45]^3, en torno a 20k gaussianas.
- Generacion de orbitas de camara y objetos en rotacion (tumbling) a 512x512 px.
- Renderizado sin dependencia de la vista en la etapa de codificacion: la escena se codifica una vez y se decodifica para multiples vistas.
- Conversion desde ficheros PLY de 3DGS mediante `load_ply`, que transforma escalas logaritmicas, cuaterniones crudos, coeficientes de armonicos esfericos y logits de opacidad, normaliza el objeto, lo poda a 20k gaussianas y ajusta las conservadas contra el splat completo.
- Inferencia por lotes de multiples camaras en una sola llamada al pipeline (`pipeline(gaussians, c2w, fov=45.0)` devuelve `[V, 512, 512, 3]`).
- Soporte opcional de Flash Attention para acelerar la atencion; sin el, usa scaled-dot-product attention de PyTorch.
- No dispone de capacidades linguisticas, tool calling, agentes ni multilingues: es un modelo puramente de vision/renderizado.

## Casos de uso

- Visualizacion interactiva de activos 3DGS: dado un PLY de objeto, generar orbitas de camara bajo demanda sin rasterizador, util para previsualizacion en visores web o herramientas de diseno donde se quiere evitar el coste de un pipeline de rasterizacion dedicado.
- Generacion de datasets sinteticos de vistas: producir renders consistentes de objetos 3DGS a multiples angulos y distancias para entrenar otros modelos de vision (reconstruccion, estimacion de pose, segmentacion) sin necesidad de capturar datos reales.
- Renderizado en pipelines sin GPU de rasterizacion: al ser un transformer puro, puede desplegarse en stacks basados en PyTorch alli donde integrar un rasterizador 3DGS especifico resulte problematico.
- Prototipado rapido en investigacion de graficos: comparar renderizado neuronal frente a rasterizacion gsplat sobre el mismo conjunto de 20k gaussianas, con una diferencia medida de unos 6 dB de PSNR, para estudiar compromisos calidad-coste.
- Aumento de datos para reconstruccion 3D: generar vistas adicionales de objetos Objaverse-like para aumentar datasets de entrenamiento de modelos de reconstruccion o de síntesis.
- Demostraciones y material divulgativo: producir GIFs de orbitas y objetos en rotacion (como los ejemplos de la model card) para articulos, blogs o presentaciones tecnicas sobre 3DGS y renderizado neuronal.
- Evaluacion de representaciones 3DGS podadas: medir cuanto se degrada la calidad al reducir de ~50k a 20k gaussianas, usando el modelo como referencia de renderizado neuronal frente a gsplat.

## Benchmarks y rendimiento

Resultados sobre 300 objetos retenidos del entrenamiento (nunca usados durante el desarrollo), PSNR sobre el recorte cuadrado alrededor del objeto frente al ground truth del splat completo, sobre las 28 vistas de entrenamiento y sobre 4 de ellas (vistas 0, 4, 7 y 11 a distancia de camara 1.7):

| Metodo | 28 vistas (PSNR) | 4 vistas (PSNR) | SSIM | LPIPS |
|---|---|---|---|---|
| Rasterizacion gsplat de la misma entrada de 20k gaussianas | 44.02 | 44.97 | 0.9954 | 0.0046 |
| GaussianFormer | 38.08 | 38.36 | 0.9814 | 0.0113 |

Desglose adicional:

| Metrica | Valor |
|---|---|
| PSNR a distancia 1.15 | 38.47 dB (rasterizacion: 42.39) |
| PSNR a distancia 1.7 | 38.38 dB (rasterizacion: 45.14) |
| PSNR a distancia 2.45 | 37.08 dB (rasterizacion: 43.39) |
| PSNR en 300 objetos de entrenamiento (28 vistas) | 38.25 dB (0.17 dB por encima de los retenidos) |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; con 194,9 M de parametros en fp32 los pesos ocupan aproximadamente 0,78 GB, a lo que hay que sumar activaciones de la cross-attention densa sobre ~20k gaussianas y una rejilla de 128x128 tokens por vista.
- GPU recomendadas: el autor indica Linux, GPU NVIDIA y Python 3.12; Flash Attention es opcional y recomendado para velocidad.
- Cabe en GPU de consumo: previsiblemente si, dado el tamano de pesos inferior a 1 GB, aunque el requisito real dependera de las activaciones; no se especifica un minimo oficial.
- Opciones de despliegue: pipeline nativo `GaussianFormerRenderingPipeline` de la libreria `gaussianformer` (instalable con `uv`), con soporte opcional del extra `flash`; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo).
- Latencia y throughput: no disponibles; el autor menciona que el fine-tune de las gaussianas conservadas tarda "alrededor de un minuto en una GPU", pero no publica cifras de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Entrada | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GaussianFormer V22 | 194,9 M | Gaussianas 3D (14 params) | no aplica (atencion densa a todas las gaussianas) | MIT | HuggingFace + GitHub |
| RenderFormer v1 base (Microsoft) | no disponible en la informacion | Mallas triangulares | no aplica | no disponible en la informacion | HuggingFace |
| Rasterizacion gsplat | no es un modelo neuronal | Gaussianas 3D | no aplica | no disponible en la informacion | Libreria de rasterizacion |

RenderFormer es el modelo base del que se parte: renderiza mallas triangulares con la misma arquitectura de dos etapas, mientras que GaussianFormer adapta esa arquitectura a gaussianas 3D. La rasterizacion gsplat no es un modelo comparable en el sentido estricto, pero sirve de referencia de calidad: sobre la misma entrada de 20k gaussianas obtiene 44.02 dB frente a los 38.08 dB de GaussianFormer en 28 vistas.

## Limitaciones y advertencias

- Entrenado unicamente con objetos aislados de Objaverse_Splats; no se ha validado en escenas complejas, interiores ni composiciones multiobjeto.
- Requiere que el objeto este centrado, con eje Y hacia arriba y escalado en [-0.45, 0.45]^3, y en torno a 20k gaussianas; `load_ply` realiza esta normalizacion y poda, pero objetos fuera de ese regimen pueden degradarse.
- Calidad inferior a la rasterizacion gsplat: unos 6 dB de PSNR por debajo sobre la misma entrada, con LPIPS de 0.0113 frente a 0.0046.
- La model card esta truncada en la seccion de limitaciones ("Trained on isolated..."), por lo que pueden existir otras restricciones no documentadas en la informacion disponible.
- Riesgo de artefactos y alucinacion visual en vistas o geometrias fuera de distribucion, al ser un modelo generativo de renderizado.
- No es un modelo linguistico: no soporta texto, tool calling, agentes ni capacidades multilingues.
- Licencia MIT, lo que permite uso comercial, pero conviene verificar las condiciones de los datos de entrenamiento (Objaverse_Splats) y del modelo base RenderFormer para produccion.
- Requiere Linux, GPU NVIDIA y Python 3.12; no se documenta soporte para CPU ni para otras plataformas.
- Solo 23 descargas y 0 likes en el momento de la consulta: ecosistema muy incipiente y poca validacion externa.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/shahafvl/gaussianformer-v22
- Codigo: https://github.com/SVLwoof/gaussianformer
- Modelo base RenderFormer: https://huggingface.co/microsoft/renderformer-v1-base
- Dataset Objaverse_Splats: https://huggingface.co/datasets/ShapeSplats/Objaverse_Splats
- Checkpoint intermedio 256 px: https://huggingface.co/shahafvl/gaussianformer-256px
