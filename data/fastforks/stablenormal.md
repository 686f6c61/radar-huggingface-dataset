# fastforks/stablenormal

## Resumen

StableNormal turbo es un modelo de estimación de normales de superficie (surface normals) a partir de una sola imagen RGB, desarrollado originalmente por el equipo de Stable-X (Ye et al., SIGGRAPH Asia 2024) y empaquetado aquí por fastforks bajo el identificador `fastforks/stablenormal`. El modelo emplea una arquitectura derivada de Stable Diffusion 2: un UNet denoisa un latente de normales mientras el latente de la imagen se inyecta mediante un encoder ControlNet, lo que permite obtener normales en un único paso de difusión (enfoque YOSO, v0.3). El resultado es un mapa de normales por píxel en forma de vectores unitarios en el marco de cámara.

El repositorio de fastforks es únicamente una model card: no aloja pesos. La herramienta descarga los pesos originales del repositorio del autor (`Stable-X/yoso-normal-v0-3`) y los verifica contra hashes SHA-256. Está etiquetado como tarea de profundidad (`depth`), tier experimental, con salidas de tipo `normals` y dos backends: `portable` y `kernels`.

Es relevante porque ofrece una alternativa de un solo paso (frente a los métodos de difusión multi-paso) para obtener normales de superficie con buena relación velocidad/memoria, con soporte de entradas de hasta 3000x4000 píxeles y aceleración mediante kernels CUDA propios. No es un modelo de lenguaje ni un modelo multimodal generativo: es un modelo de visión por computador especializado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | UNet de Stable Diffusion 2 con encoder ControlNet (YOSO, denoising en un paso) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada de cualquier H x W >= 1) |
| Tipos de cuantizacion | fp16 (pesos publicados en fp16 safetensors); no se documentan otras |
| Idiomas soportados | no disponible (modelo de visión, sin componente de texto funcional para idiomas) |
| Licencia | openrail++ (con restricciones de uso de CreativeML OpenRAIL++-M por derivar de SD2); pesos del autor bajo Apache-2.0 según evidencia |
| Formato de pesos | safetensors fp16 (unet, vae, text_encoder, controlnet) |

## Arquitectura y entrenamiento

El modelo sigue el diseño de StableNormal: un UNet de Stable Diffusion 2 actúa como denoiser sobre un latente de normales, y un encoder ControlNet recibe el latente de la imagen de entrada para condicionar la generación. La variante turbo (YOSO v0.3) produce las normales en un único paso, evitando el muestreo iterativo típico de los modelos de difusión. La salida son normales de superficie como vectores unitarios `[B, H, W, 3]` en el marco de cámara (x derecha, y abajo, z hacia delante).

Según la model card, los pesos derivan de Stable Diffusion 2 (subconjuntos de LAION-5B) y se afinan sobre conjuntos de datos de normales sintéticas y reales (Hypersim, Replica, ScanNet y otros, según el paper StableNormal, arXiv 2406.16864). No se detalla en la información disponible el número exacto de tokens de entrenamiento ni si se empleó RLHF/DPO (no aplicable en este dominio). La innovación destacable es el enfoque de un solo paso y la disponibilidad de kernels CUDA optimizados que aceleran la inferencia entre 1.6x y 1.7x frente a la implementación portable.

## Capacidades

- Estimación de normales de superficie a partir de una única imagen RGB.
- Salida de normales como vectores unitarios `[B, H, W, 3]` en marco de cámara.
- Procesamiento de entradas de cualquier tamaño H x W >= 1 (redimensionado o padding interno); probado hasta 3000x4000.
- Ejecución en un solo paso de denoising (sin muestreo iterativo).
- Dos backends de ejecución: `portable` (PyTorch) y `kernels` (kernels CUDA optimizados).
- Compatibilidad con `torch.compile` y exportación a TensorRT fp16 y ONNX.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües (no es un modelo de lenguaje).

## Casos de uso

- Reconstrucción 3D y fotogrametría: las normales por píxel permiten generar mapas de normales para integración de superficies y reconstrucción de geometría a partir de imágenes únicas, útil en pipelines de escaneo con una sola cámara.
- Realce de iluminación y renderizado: en motores gráficos o herramientas de posproducción, las normales estimadas alimentan shaders de iluminación relighting sin necesidad de capturar geometría real.
- Preprocesado para segmentación y detección: las normales aportan información geométrica que mejora tareas downstream (detección de planos, bordes, orientación de superficies) en robótica y visión industrial.
- Aumento de datos sintéticos: generar normales coherentes para imágenes sintéticas o aumentadas en el entrenamiento de otros modelos de visión.
- Inspección de superficies y control de calidad: detección de irregularidades o deformaciones en superficies industriales a partir de imágenes de una sola cámara.
- Edición y efectos visuales: generación de mapas de normales para composición, matte painting y efectos de iluminación en producción audiovisual.
- Investigación en visión por computador: modelo de referencia para comparar métodos de estimación de normales monoculares, con métricas de velocidad y memoria documentadas.

## Benchmarks y rendimiento

La model card proporciona datos de velocidad y memoria, no de precisión numérica completa (la sección de accuracy queda truncada en la información disponible). Se muestran a continuación los datos de rendimiento disponibles.

| Metrica | Original fp32 | Original (fp16) | Portable | Kernels |
|---|---|---|---|---|
| Tiempo inferencia 994x1482 (ms) | – | 299 | 289 | 180 |
| Memoria pico asignada (MiB) | 4156 | – | 3463 | 3037 |
| Memoria pico reservada (MiB) | 4374 | – | 3628 | 3172 |
| Carga del modelo (s) | 6.36 | – | 2.94 | 3.25 |
| Primera llamada (s) | 1.13 | – | 0.54 | 0.35 |

| Metrica | Portable | torch.compile | TensorRT fp16 | Kernels |
|---|---|---|---|---|
| Tiempo 994x1482 (ms) | 289 | 238 | 118 | 180 |
| Memoria pico asignada (MiB) | 3463 | 3019 | 5587 (motor + torch) | 3037 |
| Preparación | – | 76.3 s (primera llamada en frío) | 198 s (ONNX + build) | – |

No se han publicado en la información disponible resultados de benchmarks de precisión (AbsRel, delta1) completos; la sección de accuracy de la model card aparece truncada.

## Requisitos de hardware

- VRAM estimada: aproximadamente 3.0-3.5 GiB en fp16 para entradas de 994x1482 (pico asignado 3037-3463 MiB según backend); hasta 3.6 GiB pico asignado y 4.8 GiB reservado para entradas de 3000x4000.
- GPU recomendadas: RTX 5060 Ti 16 GB es el hardware de referencia de los benchmarks (sm_120); cualquier GPU con al menos 8 GB de VRAM debería manejar entradas de resolución moderada.
- Cabe en GPU de consumo: sí, con al menos 8 GB de VRAM para resoluciones típicas; 16 GB recomendable para entradas de alta resolución.
- Opciones de despliegue: PyTorch (backend portable), kernels CUDA propios de fastforks, torch.compile, TensorRT fp16 y ONNX.
- Latencia y throughput: 180 ms con kernels y 118 ms con TensorRT fp16 para 994x1482; 289 ms en portable. Carga del modelo entre 2.94 y 6.36 s según backend.

## Comparativa con modelos similares

No se dispone en la información proporcionada de datos de otros modelos de estimación de normales comparables (parámetros, contexto, rendimiento, licencia). La model card menciona otros modelos de profundidad del ecosistema fastforks (`metric3d-vit-large`, `da3metric-large`, `unidepth-v2-vitl14`, `unik3d-vitl`, `depth-pro`, `zoedepth-nk`, `da3mono-large`), pero no ofrece una comparativa de rendimiento frente a ellos para la tarea de normales. Por tanto, la comparativa se considera no disponible.

## Limitaciones y advertencias

- Repositorio sin pesos: solo contiene la model card; la descarga y verificación de pesos depende de los enlaces al autor original.
- Licencia: los pesos están sujetos a las restricciones de uso de CreativeML OpenRAIL++-M (Attachment A) por derivar de Stable Diffusion 2, además de los términos indicados; verificar antes de uso comercial.
- El código original se distribuye como paquete de uso exclusivamente investigador según las cadenas de licencia registradas; comprobar condiciones antes de cualquier otro uso.
- Modelo de un solo paso: puede presentar menor precisión que métodos multi-paso en escenas complejas, aunque no se dispone de datos de accuracy completos en la información.
- Sin capacidades de lenguaje, tool calling ni agentes; no debe confundirse con un modelo generativo multimodal.
- Riesgo de artefactos en regiones con poca textura, oclusiones o iluminación extrema (comportamiento típico de estimadores monoculares; no cuantificado en la información disponible).
- Idiomas no aplicables; el componente text_encoder de SD2 no se usa para condicionamiento lingüístico en esta tarea.
- Tier experimental: no recomendado para producción crítica sin validación adicional.

## Enlaces

- Hugging Face: https://huggingface.co/fastforks/stablenormal
- Pesos del autor: https://huggingface.co/Stable-X/yoso-normal-v0-3
- Código fastforks: https://github.com/kleinicke/fastforks
- Kernels: https://huggingface.co/fastforks/kernels
- Código original StableNormal: https://github.com/Stable-X/StableNormal (commit `594b934630ab`)
- Paper StableNormal: https://arxiv.org/abs/2406.16864
- Benchmarks: https://github.com/kleinicke/fastforks/blob/main/docs/benchmarks.md
- Card TOML: https://github.com/kleinicke/fastforks/blob/main/src/fastforks/depth/models/stablenormal/card.toml
- Licencia SD2: https://huggingface.co/stabilityai/stable-diffusion-2/blob/main/LICENSE-MODEL
