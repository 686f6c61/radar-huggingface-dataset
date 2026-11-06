# shahafvl/gaussianformer-v21

## Resumen

GaussianFormer V21 es un modelo transformer para renderizado neuronal de escenas representadas con 3D Gaussian Splatting (3DGS). Lo desarrolla el autor independiente shahafvl y parte de RenderFormer (SIGGRAPH 2025, Microsoft), un renderizador transformer para mallas triangulares. La adaptación convierte cada gaussiana (14 parametros: posicion, escala, cuaternion, color RGB y opacidad) en un token de escena y conserva la arquitectura de dos etapas: un codificador de escena independiente de la vista y un decodificador de rayos dependiente de la vista con cabeza DPT. El resultado es un renderizador sin rasterizador y sin optimizacion por escena.

El modelo resuelve la sintesis de vistas noveles de objetos 3DGS sin necesidad de rasterizar en tiempo de inferencia, lo que abre la puerta a pipelines diferenciables y a integraciones dentro de arquitecturas transformer mas amplias. Cuenta con 194.869.143 parametros, pesos en safetensors y un repositorio de 0,8 GB. Se distribuye con licencia MIT tanto para pesos como para codigo.

Es relevante ahora porque demuestra que un transformer preentrenado para mallas puede reutilizarse (warm-start) para Gaussian Splatting con un rendimiento razonable, aunque todavia por debajo de la rasterizacion clasica (36,67 dB PSNR frente a 44,02 dB de gsplat). El autor publica esta version V21 como referencia comparativa; la version V22, con huella proyectada, es la recomendada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de dos etapas (codificador de escena + decodificador de rayos con cabeza DPT), adaptado de RenderFormer |
| Parametros totales | 194.869.143 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica; entrada de ~20.000 gaussianas (tokens de escena) y vistas de 512x512 px |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de vision/renderizado, no linguistico) |
| Licencia | MIT |
| Formato de pesos | safetensors (libreria `gaussianformer`, `PyTorchModelHubMixin`) |

## Arquitectura y entrenamiento

La arquitectura es un transformer de dos etapas heredado de RenderFormer. La primera etapa es un codificador de escena independiente de la vista que procesa cada gaussiana como un token de 14 dimensiones (`pos(3) | scale(3) | quat wxyz(4) | rgb(3) | opacity(1)`). La segunda etapa es un decodificador de rayos dependiente de la vista con una cabeza DPT que produce imagenes de 512x512. En esta version V21 se usa atencion cruzada densa, RoPE 2D proyectado y parches de 4 px; la V22 anade la huella proyectada. Los pesos se inicializan a partir de RenderFormer y se ajustan finamente.

El entrenamiento utiliza los 26.820 objetos de entrenamiento del dataset Objaverse_Splats, cada uno podado de ~50k a 20k gaussianas mediante la puntuacion de importancia de LightGaussian y un breve fine-tuning de recuperacion. Los objetivos son renders de gsplat del splat completo sin podar a 512 px, con 28 vistas por objeto a distancias de camara 1,15, 1,7 y 2,45. El schedule incluye una etapa inicial a 256 px (checkpoint `gaussianformer-256px`), una etapa corta a 256 px activando RoPE 2D proyectado y parches de 4 px, y 385k pasos a 512 px en 8 GPUs con learning rate warmup-stable-decay de 5e-5 y decaimiento coseno hasta 5e-7 en los ultimos 10k pasos. La funcion de perdida combina L1 log-HDR (peso 0,05 en pixeles de fondo) y LPIPS-VGG, a partes iguales.

## Capacidades

- Renderizado de vistas noveles de objetos representados como 3D Gaussian Splatting, sin rasterizador y sin optimizacion por escena.
- Entrada de ~20.000 gaussianas con 14 parametros activados por gaussiana y salida de imagenes RGB de 512x512.
- Generacion multi-vista a partir de matrices camara-mundo (formato `-Z` forward, `+Y` up) y campo de vision configurable (entrenado a 45 grados).
- Conversion desde ficheros PLY de 3DGS mediante `load_ply`, que normaliza el objeto, lo poda a 20k gaussianas y ajusta las conservadas.
- Inferencia por linea de comandos (`tools.ply_to_h5` e `infer.py`) y como pipeline de Python (`GaussianFormerRenderingPipeline`).
- Soporte opcional de Flash Attention para acelerar la inferencia.
- No soporta tool calling, agentes, texto, audio ni capacidades multilingues: es un modelo puramente visual/3D.

## Casos de uso

- Visualizacion interactiva de assets 3DGS en el navegador o en un visor: el modelo permite generar vistas sin necesidad de un rasterizador WebGL, integrando el renderizado en un backend Python con GPU.
- Comparacion de metodos de representacion 3D: sirve como referencia para medir la brecha entre renderizado neuronal y rasterizacion clasica sobre el mismo splat de 20k gaussianas.
- Investigacion en renderizado diferenciable: al ser un transformer end-to-end, permite propagar gradientes a traves del renderizador hacia la representacion de escena, algo que un rasterizador no ofrece de forma nativa.
- Generacion de datasets sinteticos de vistas: a partir de un PLY de objeto se pueden producir renders en multiples camaras orbitando el objeto para aumentar datos de entrenamiento de otros modelos.
- Prototipado de pipelines image-to-image en Hugging Face: el tag `pipeline_tag: image-to-image` y la integracion con `PyTorchModelHubMixin` permiten cargarlo con `from_pretrained` en flujos existentes.
- Benchmarking de hardware para renderizado neuronal: util para medir latencia (unos 0,3 s por vista de 512 px con 20k gaussianas en una L40S) y planificar despliegues.
- Docencia y divulgacion: ejemplo reproducible de adaptacion de un transformer de mallas a Gaussian Splatting con warm-start y schedule por etapas.

## Benchmarks y rendimiento

Evaluacion sobre 300 objetos reservados no usados durante el desarrollo. PSNR sobre el recorte cuadrado alrededor del objeto frente al ground truth del splat completo, sobre las 28 vistas de entrenamiento y sobre 4 de ellas (vistas 0, 4, 7 y 11 a distancia de camara 1,7).

| Metodo | PSNR 28 vistas | PSNR 4 vistas | SSIM | LPIPS |
|---|---|---|---|---|
| Rasterizacion gsplat del mismo input de 20k gaussianas | 44,02 | 44,97 | 0,9954 | 0,0046 |
| GaussianFormer V21 (este modelo) | 36,67 | 36,87 | 0,9779 | 0,0140 |
| GaussianFormer V22 (con huella proyectada) | 38,08 | 38,36 | 0,9814 | 0,0113 |

Sobre 300 objetos de entrenamiento, en sus 28 vistas de entrenamiento, V21 obtiene 36,86 dB. No se han publicado resultados de benchmarks en la informacion disponible para tareas tipo MMLU, HumanEval o GSM8K, que no aplican a este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; con 194,9 M de parametros en fp32 los pesos ocupan aproximadamente 0,78 GB, a lo que hay que sumar activaciones de atencion cuadratica sobre ~20k tokens de escena y los mapas de 512x512.
- GPU recomendadas: el autor reporta inferencia en una NVIDIA L40S; se requiere GPU NVIDIA con CUDA 12.8 (el codigo instala PyTorch para CUDA 12.8).
- Cabe en GPU de consumo: previsiblemente si en RTX 3090, 4090 y similares con 24 GB, aunque no se confirma en la informacion disponible.
- Opciones de despliegue: pipeline propio `GaussianFormerRenderingPipeline` de la libreria `gaussianformer`, instalable con `uv` desde el repositorio GitHub; Flash Attention opcional mediante el extra `flash`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia: aproximadamente 0,3 s por vista de 512 px con 20k gaussianas en una L40S. Throughput no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Entrada | Enfoque | PSNR (28 vistas) | Licencia |
|---|---|---|---|---|---|
| GaussianFormer V21 | 194,9 M | 20k gaussianas | Transformer sin rasterizador | 36,67 | MIT |
| GaussianFormer V22 | no disponible | 20k gaussianas | Transformer con huella proyectada | 38,08 | MIT |
| gsplat (rasterizador) | no aplica | 20k gaussianas | Rasterizacion clasica | 44,02 | no disponible en la informacion |
| RenderFormer v1 base | no disponible | Mallas triangulares | Transformer para mallas | no aplica | no disponible en la informacion |

## Limitaciones y advertencias

- Entrenado solo con objetos aislados y centrados en el cubo [-0,45, 0,45]^3, con FOV de 45 grados, 512x512 px y distancias de camara entre 1,15 y 2,45; otras resoluciones, FOV o distancias degradan la calidad.
- Las capturas reales solo funcionan como regiones recortadas de una escena y vistas desde fuera.
- El input debe ser de ~20k gaussianas: entradas mas densas empeoran la calidad (mientras que mejoran la de un rasterizador) y la atencion del codificador de escena es cuadratica en el numero de gaussianas.
- Los colores son independientes de la vista: solo se usa el color DC de cada gaussiana, sin coeficientes de armonicos esfericos.
- El detalle fino (trazos finos, grabados, texto pequeno) es mas suave que rasterizar el mismo splat.
- Es mucho mas lento que un rasterizador: ~0,3 s por vista de 512 px con 20k gaussianas en una L40S.
- Riesgo de alucinacion visual: al ser un modelo generativo, puede producir detalles plausibles pero no presentes en la escena de entrada.
- Sesgos: no documentados en la informacion disponible; el dataset Objaverse puede arrastrar sesgos de los objetos y creadores que lo componen.
- Licencia MIT para pesos y codigo, pero el dataset de entrenamiento (Objaverse_Splats) deriva de Objaverse, cuyos objetos conservan la licencia de cada creador; conviene revisar los terminos para uso comercial de assets derivados.
- Esta version V21 se publica solo como referencia comparativa; el propio autor recomienda V22 para uso real.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/shahafvl/gaussianformer-v21
- Codigo: https://github.com/SVLwoof/gaussianformer
- Modelo base RenderFormer: https://huggingface.co/microsoft/renderformer-v1-base
- Version recomendada V22: https://huggingface.co/shahafvl/gaussianformer
- Checkpoint intermedio 256 px: https://huggingface.co/shahafvl/gaussianformer-256px
- Dataset Objaverse_Splats: https://huggingface.co/datasets/ShapeSplats/Objaverse_Splats
- Objaverse: https://objaverse.allenai.org/
