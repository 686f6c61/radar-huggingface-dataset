# fastforks/resplat

## Resumen
ReSplat es un modelo de reconstruccion 3D feed-forward que genera Gaussian splats a partir de imagenes calibradas y con pose conocida, mediante un esquema de refinamiento recurrente. Lo desarrollan Xu et al. (2025) y esta implementado en el repositorio `cvg/resplat`; la ficha que nos ocupa es el paquete `fastforks/resplat`, un port del codigo y los pesos originales que no aloja pesos propios sino que los descarga desde el repositorio del autor (`haofeixu/resplat`) y los verifica por SHA-256.

Tecnicamente combina la red de profundidad multivista de DepthSplat (cost volume mas caracteristicas DINOv2) con un point transformer kNN que predice Gaussianas latentes con grado SH 3. En cada paso de refinamiento se renderizan las vistas de entrada, se comparan con las imagenes originales (caracteristicas ResNet-18 y color) y se actualizan todas las Gaussianas con un segundo point transformer. La salida incluye mapas de profundidad por vista y las Gaussianas en el sistema de coordenadas del mundo.

Es relevante porque ofrece reconstruccion multivista densa de una sola pasada, sin optimizacion por escena, con dos variantes de pesos (una no comercial derivada de Depth Anything V2 Base y otra MIT derivada de Depth Anything V2 Small), y porque publica mediciones de latencia y memoria en GPU de consumo. Esta marcado como tier experimental.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red de profundidad multivista con cost volume y DINOv2 + point transformer kNN + refinamiento recurrente con renderizado y segundo point transformer |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision; entrada de cualquier H x W >= 1) |
| Tipos de cuantizacion | fp32 (CPU) y fp16 (GPU, predeterminado); no se documentan otras |
| Idiomas soportados | no disponible (modelo de vision, sin procesamiento de lenguaje) |
| Licencia | Mixta por variante: codigo MIT; `resplat-base-re10k` CC-BY-NC-4.0 (sin uso comercial); `resplat-small-dl3dv` MIT |
| Formato de pesos | `.pth` (PyTorch); no se distribuyen safetensors ni GGUF |
| Backends | `portable` y `kernels` (CUDA) |
| Resolucion de entrada | H x W >= 1, redimensionado o padding interno; probado hasta 3000x4000 |
| Salidas | `depth`, `confidence`, `gaussians` (grado SH 3) |

## Arquitectura y entrenamiento
El modelo es un pipeline de vision en dos etapas. La primera etapa, heredada de DepthSplat, construye un cost volume a partir de las caracteristicas DINOv2 de las vistas de entrada y lo procesa con una red de profundidad multivista. La segunda etapa proyecta esa informacion en un conjunto de Gaussianas latentes mediante un point transformer kNN. El bucle de refinamiento renderiza las vistas de entrada desde las Gaussianas actuales y compara el render con las imagenes reales usando caracteristicas ResNet-18 y color; un segundo point transformer actualiza cada Gaussiana con esa senal de error. El resultado son mapas de profundidad por vista y un conjunto de Gaussianas en el marco mundial que puede exportarse a PLY.

El entrenamiento se realizo sobre DL3DV-10K (escenas multivista reales con licencia de investigacion no comercial). La variante `resplat-base-re10k` se inicializa desde Depth Anything V2 Base y se entrena sobre RealEstate10K; la variante `resplat-small-dl3dv` parte de Depth Anything V2 Small (Apache-2.0). No se especifica en la informacion disponible el numero de tokens, horas de GPU ni si se aplico RLHF o DPO.

## Capacidades
- Reconstruccion 3D feed-forward de escenas a partir de varias imagenes, sin optimizacion por escena.
- Estimacion de profundidad multivista con mapas de confianza por vista.
- Prediccion de camaras y puntos 3D cuando las entradas no vienen con pose.
- Generacion de Gaussian splats con grado SH 3 exportables a `.ply`.
- Refinamiento recurrente de las Gaussianas mediante renderizado comparativo.
- Entrada de tamano arbitrario (H x W >= 1), con redimensionado o padding interno.
- Dos backends de ejecucion (`portable` y `kernels`) con paridad numerica respecto al codigo original.
- No soporta tool calling, agentes, lenguaje natural ni audio; es un modelo puramente de vision 3D.

## Casos de uso
- Digitalizacion de interiores: a partir de un conjunto de fotos con pose conocida, el modelo genera Gaussianas y profundidad para reconstruir una habitacion en una sola pasada, sin el coste de un pipeline de fotogrametria tradicional.
- Prototipado rapido en pipelines de vision 3D: al ejecutarse en una RTX 5060 Ti (1723 ms a 480x640 con 4995 MiB pico), encaja en entornos de desarrollo con GPU de consumo para validar ideas antes de escalar.
- Generacion de activos para mundos virtuales: las Gaussianas exportadas a PLY pueden importarse en visores 3D o motores de render para crear escenas de prueba.
- Preprocesado para captura volumetrica: la profundidad multivista y la confianza por vista sirven como entrada a etapas posteriores de malla o NeRF cuando se necesita una inicializacion densa.
- Investigacion en reconstruccion 3D: la variante MIT permite reproducir y extender el metodo en publicaciones, con paridad documentada frente al codigo original (error absoluto medio <= 0.01 en fp16 GPU).
- Verificacion de calidad de captura: la profundidad y confianza por vista permiten detectar vistas con poca cobertura o calibracion deficiente antes de un procesado mas costoso.
- Escenas de gran resolucion: probado a 3000x4000 con 7.8 GiB pico de memoria asignada en la variante base, util para capturas de alta resolucion en GPU de 16 GB.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks academicos (PSNR, SSIM, LPIPS, etc.) en la informacion disponible. Los datos de rendimiento medidos por fastforks se resumen a continuacion.

| Metrica | `resplat-small-dl3dv` (480x640, portable, fp16) |
|---|---|
| Tiempo de inferencia | 1723 ms |
| Memoria pico asignada | 4995 MiB |
| Memoria pico reservada | 5180 MiB |
| Tiempo de carga | 0.72 s |
| Primera llamada | 2.51 s |

| Metrica | `resplat-base-re10k` (3000x4000, portable, fp16) | `resplat-small-dl3dv` (3000x4000, portable, fp16) |
|---|---|---|
| Memoria pico asignada | 7.8 GiB | 5.9 GiB |
| Memoria pico reservada | 11.2 GiB | 7.0 GiB |

Paridad con el codigo original: en CPU float32, diferencia maxima absoluta <= 5e-05; en GPU float16, error absoluto medio <= 0.01 y p99 <= 0.05 sobre la profundidad de salida. `torch.compile` quedo diferido (compilacion > 5 min) y TensorRT fp16 estaba previsto para la version 0.2.1.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto / entrada | Licencia | Uso comercial | Disponibilidad |
|---|---|---|---|---|---|---|
| ReSplat (`fastforks`) | Gaussian splatting feed-forward con refinamiento | no disponible | H x W arbitrario | Mixta (MIT / CC-BY-NC-4.0) | Segun variante | Hugging Face + GitHub |
| DepthSplat | Red de profundidad multivista | no disponible | Multivista | No disponible en esta ficha | No disponible | Codigo original citado como base |
| Depth Anything V2 | Profundidad monocula | no disponible | Imagen unica | Apache-2.0 (Small) / CC-BY-NC-4.0 (Base) | Segun variante | Hugging Face |

La comparacion cuantitativa con alternativas no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias
- La variante `resplat-base-re10k` tiene licencia CC-BY-NC-4.0 y no admite uso comercial; requiere `FASTFORKS_NONCOMMERCIAL=1` en el entorno.
- El modelo esta marcado como tier experimental; no se recomienda como componente critico de produccion sin validacion propia.
- La calidad depende de que las imagenes esten calibradas y con pose; sin pose, la prediccion de camaras es menos fiable.
- No dispone de benchmarks publicados de calidad geometrica (PSNR, SSIM, LPIPS) en esta ficha, por lo que no se puede comparar su precision con otros metodos sin evaluacion propia.
- El entrenamiento usa DL3DV-10K, con licencia de investigacion no comercial; conviene revisar las condiciones del dataset antes de usos derivados.
- `torch.compile` no esta operativo (compilacion superior a 5 minutos) y TensorRT fp16 no esta disponible hasta la version 0.2.1.
- Los pesos no se alojan en el repositorio de la ficha; se descargan desde el autor y se verifican por SHA-256, lo que introduce dependencia de disponibilidad externa.
- No procesa lenguaje ni audio; cualquier caso de uso conversacional queda fuera de su alcance.
- Riesgo de sesgos y alucinacion geometrica: en escenas con poca textura, reflexiones o superficies transparentes puede generar geometria incorrecta sin senal clara de error.

## Enlaces
- Repositorio de la ficha: https://huggingface.co/fastforks/resplat
- Pesos del autor: https://huggingface.co/haofeixu/resplat
- Codigo del autor: https://github.com/cvg/resplat
- Licencia del codigo original: https://github.com/cvg/resplat/blob/cae7ddc/LICENSE
- Model zoo del autor: https://github.com/cvg/resplat/blob/cae7ddc/MODEL_ZOO.md
- Codigo de fastforks: https://github.com/kleinicke/fastforks
- Kernels para el backend `kernels`: https://huggingface.co/fastforks/kernels
- Documentacion de benchmarks: https://github.com/kleinicke/fastforks/blob/main/docs/benchmarks.md
- Fichero de variantes: https://github.com/kleinicke/fastforks/blob/main/src/fastforks/multiview/models/resplat/card.toml
