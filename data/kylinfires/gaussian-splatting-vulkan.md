# kylinfires/gaussian-splatting-vulkan

## Resumen

`kylinfires/gaussian-splatting-vulkan` no es un modelo de lenguaje: es un repositorio de ingeniería que porta 3D Gaussian Splatting (3DGS) a Rust + wgpu/Vulkan para poder renderizar, visualizar y entrenar representaciones 3DGS en GPUs AMD sobre Windows sin depender de CUDA. Lo publica el usuario kylinfires como "repositorio de portabilidad y validación", no como fork oficial de VkSplat ni del 3DGS de INRIA. Su interés práctico es que cubre el hueco de tooling 3DGS para hardware no NVIDIA, un ecosistema donde la mayoría de implementaciones (rasterizador diferenciable original, gsplat, nerfstudio) asumen CUDA.

El repositorio contiene tres piezas: un renderizador CLI en Rust/wgpu que parsea PLY 3DGS compactos de 14 floats (formato de ml-sharp), proyecta covarianzas 3D a 2D mediante EWA y produce splats billboard en PNG/PPM; una integración de entrenamiento sobre el rasterizador por tiles en compute de Vulkan de VkSplat, con ordenación por tile, backward diferenciable, optimización de armónicos esféricos y densificación; y una galería web de 13 vistas publicada como Space.

La única validación publicada es una ejecución de 10.000 pasos sobre datos multivista sintéticos pequeños en una Radeon RX 6900 XT: 319.073 splats, PSNR de entrenamiento 38,21 dB, PSNR de validación 20,65 dB, 49,7 s y ~0,33 GiB de VRAM. No hay resultados en Mip-NeRF 360 ni pesos entrenados incluidos en el repo (el PLY de 75 MB queda fuera).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No aplica como modelo neuronal. Renderizador 3DGS: proyección de covarianza 3D a 2D (EWA) y splats billboard. Entrenador: rasterizador por tiles en compute de Vulkan con backward diferenciable |
| Parámetros totales | No aplica / no disponible (la escena se representa con splats: 319.073 en la ejecución de referencia) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica |
| Tipos de cuantización | No aplica (no hay pesos cuantizables; el PLY de entrada usa 14 floats por gaussiana) |
| Idiomas soportados | Chino (zh) e inglés (en) en la documentación; el código y la CLI no dependen del idioma |
| Licencia | Mixta: VkSplat Apache-2.0; 3DGS de INRIA/MPII con licencia de investigación no comercial; SHARP/ml-sharp bajo Apple Machine Learning Research Model License; el repositorio en conjunto, CC BY-NC-SA 4.0 |
| Formato de pesos | No se distribuyen pesos. Entrada: PLY 3DGS compacto de 14 floats (formato ml-sharp). Salida: PNG y PPM |
| Lenguaje y librería | Rust, `library_name: rust`; backend wgpu/Vulkan |
| Plataforma validada | AMD Radeon RX 6900 XT + Windows |
| Repositorio | `kylinfires/gaussian-splatting-vulkan`; tamaño 0,0 GB; 0 descargas, 0 likes; creado y actualizado el 2026-10-28 |
| Estructura | `vulkan-rs/` (renderizador, viewers y resultados), `VKSPLAT.md`, `VKSPLAT_RESULTS.md` |

## Arquitectura y entrenamiento

El renderizador de `vulkan-rs/` recibe un PLY 3DGS compacto de 14 floats, calcula la covarianza 3D de cada gaussiana, la proyecta a 2D con el esquema EWA y dibuja splats tipo billboard, escribiendo directamente PNG o PPM. La CLI es `vulkan-splat.exe <ply> <yaw> <salida> <sigma_minimo>`; el tercer argumento controla el ángulo de giro (yaw) y el cuarto fija el sigma mínimo del splat para descartar primitivas demasiado pequeñas. Además del ejecutable hay viewers WebGL y una galería de 13 vistas para Chrome.

La parte de entrenamiento integra el rasterizador por tiles de VkSplat en compute shaders de Vulkan: rangos de tiles por frame, ordenación por tile, forward y backward diferenciables, optimización de armónicos esféricos y densificación. La ejecución documentada de 10.000 pasos lanza exactamente estos pases: `ComputeTileRanges` 10.000, `SortRTS` 10.080, `RasterizeForward` 10.000, `RasterizeBackward` 10.000 y `FusedProjectionBackwardOptimizerStep` 10.000. No se detalla la composición del dataset de entrenamiento más allá de que son datos multivista sintéticos de pequeño tamaño; no se reporta número de tokens ni proceso de RLHF/DPO porque no aplica a este dominio.

## Capacidades

- Renderizado offline de escenas 3DGS a PNG/PPM desde línea de comandos, con control de ángulo de cámara y umbral de splat.
- Parseo del formato PLY 3DGS compacto de 14 floats procedente de ml-sharp.
- Proyección EWA de covarianzas 3D a 2D y rasterizado de splats billboard.
- Entrenamiento 3DGS completo sobre Vulkan compute: ordenación por tile, backward diferenciable, optimización de armónicos esféricos y densificación.
- Ejecución sin CUDA en GPUs AMD, apoyándose en wgpu/Vulkan.
- Visualización interactiva en navegador mediante galería WebGL y galería de 13 vistas para Chrome.
- Publicación de resultados como Space de Hugging Face.
- Documentación bilingüe chino/inglés.

## Casos de uso

- Visualización de reconstrucciones 3DGS en equipos AMD: permite abrir y renderizar PLY 3DGS en una RX 6900 0 XT con Windows sin instalar el stack de CUDA, algo que las implementaciones de referencia no cubren.
- Generación de turntables y vistas fijas para documentación: la CLI produce PNG/PPM con un yaw concreto, lo que encaja en scripts que renderizan un conjunto fijo de ángulos para memorias, papers o catálogos.
- Publicación de galerías web de capturas: el viewer WebGL y la galería de 13 vistas permiten compartir un resultado 3DGS con revisores o clientes sin que instalen nada.
- Investigación sobre rasterizadores tile-based en Vulkan: el repositorio expone los pases de compute y sirve como banco de pruebas para estudiar ordenación por tile, backward diferenciable y fusión de optimizador en una API distinta de CUDA.
- Docencia y formación en 3DGS sin dependencia de NVIDIA: al usar wgpu/Vulkan, se puede montar un laboratorio con hardware AMD y evitar las restricciones de disponibilidad de GPUs NVIDIA.
- Verificación cruzada de PLY compactos: útil para comprobar que un PLY de 14 floats generado por el pipeline ml-sharp se parsea y proyecta correctamente antes de integrarlo en otra herramienta.
- Pruebas de humo de bajo coste: con ~0,33 GiB de VRAM y 49,7 s para 10.000 pasos sobre 319.073 splats, sirve para validar cambios de código en un portátil o estación con GPU modesta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (Mip-NeRF 360, Tanks and Temples, etc.) en la información disponible. Los únicos datos son de una ejecución propia de 10.000 pasos sobre datos sintéticos:

| Métrica | Valor |
|---|---|
| Splats tras el entrenamiento | 319.073 |
| PSNR de entrenamiento | 38,21 dB |
| PSNR de validación (held-out) | 20,65 dB |
| Tiempo total (10.000 pasos) | 49,7 s |
| VRAM pico | ~0,33 GiB |
| GPU | AMD Radeon RX 6900 XT |
| Throughput derivado | ~201 iteraciones/s (cálculo a partir de 10.000 pasos en 49,7 s) |

La diferencia entre 38,21 dB y 20,65 dB indica un sobreajuste acusado al conjunto de entrenamiento, coherente con un dataset sintético muy pequeño y con la advertencia del autor de que no es una validación tipo Mip-NeRF 360.

## Requisitos de hardware

- VRAM: ~0,33 GiB en la ejecución de entrenamiento de referencia (319.073 splats, 10.000 pasos). El consumo del renderizador CLI no está documentado.
- GPU validadas: AMD Radeon RX 6900 XT (RDNA2, 16 GB) sobre Windows. Es la única configuración que el autor reporta como probada.
- Cabe en GPU de consumo: sí, la validación se hizo en una GPU de gama alta de consumo. No se documenta comportamiento en iGPU ni en GPUs de gama baja.
- Requisito de plataforma: drivers Vulkan funcionales y toolchain de Rust para compilar con `cargo build --release` dentro de `vulkan-rs/`.
- Opciones de despliegue: ejecutable CLI nativo (`vulkan-splat.exe`), viewer WebGL en navegador, galería de 13 vistas en Chrome y Space de Hugging Face. No hay soporte de vLLM, llama.cpp, Ollama ni TGI porque no es un modelo de lenguaje.
- Latencia y throughput: 49,7 s para 10.000 pasos de entrenamiento en la RX 6900 XT (~201 iteraciones/s). No se reporta tiempo por frame del renderizador ni FPS de los viewers.

## Comparativa con modelos similares

| Proyecto | Enfoque | Backend | Entrenamiento | Licencia | Validación publicada |
|---|---|---|---|---|---|
| Este repositorio (kylinfires) | Renderizador + integración de entrenamiento 3DGS | Rust + wgpu/Vulkan | Sí, vía VkSplat, 10.000 pasos | Mixta (CC BY-NC-SA 4.0 en conjunto) | 319.073 splats, 38,21 dB train / 20,65 dB val, 49,7 s en RX 6900 XT |
| VkSplat (upstream) | Rasterizador y entrenador 3DGS en Vulkan compute | Vulkan | Sí | Apache-2.0 | No disponible en la información |
| nvpro-samples `vk_gaussian_splatting` | Testbed de visualización en tiempo real de 3DGS y evoluciones; no reconstruye ni entrena | Vulkan | No (solo visor) | No disponible en la información | No disponible en la información |
| 3DGS de INRIA/MPII (referencia) | Implementación académica de referencia de 3DGS | No verificado en la información (el repo se posiciona explícitamente como alternativa sin CUDA) | Sí | Investigación no comercial | No disponible en la información |

La diferencia clave frente a nvpro-samples es que este repositorio sí entrena, aunque sea a pequeña escala, y está orientado a AMD en Windows; frente a la implementación de INRIA, la ventaja es la ausencia de CUDA y la desventaja es la madurez y la falta de validación en benchmarks estándar.

## Limitaciones y advertencias

- Licencia no comercial en la práctica: el repositorio en conjunto es CC BY-NC-SA 4.0 por incorporar material derivado de 3DGS (INRIA/MPII, no comercial) y de LingBot. Uso comercial bloqueado salvo aclaración expresa del autor.
- El PLY solo contiene color DC, sin armónicos esféricos de orden superior; la calidad de visión dependiente de la dirección es limitada.
- Órbitas de gran ángulo a partir de una sola imagen dejan huecos visibles, limitación inherente a los datos de una única vista.
- Entrenamiento validado solo con datos multivista sintéticos pequeños; no hay resultados en Mip-NeRF 360 ni en capturas reales, por lo que el PSNR de validación de 20,65 dB no es extrapolable.
- Brecha train/validación muy grande (38,21 dB frente a 20,65 dB): riesgo de sobreajuste en cualquier uso con datos escasos.
- El bug de presentación del viewer original de 3DGS.cpp sigue sin corregir; hay que usar las rutas de VkSplat/vulkan-rs.
- No se incluyen artefactos clave: PLY entrenado de 75 MB, HTML WebGL de 82 MB, pesos originales de ml-sharp ni datos multivista en bruto. Reproducir los resultados requiere conseguirlos aparte.
- Proyecto sin tracción verificable: 0 descargas y 0 likes, creado y actualizado en el mismo instante, sin revisión de la comunidad.
- No es un proyecto oficial: el propio autor lo califica de repositorio de portabilidad y validación, no de VkSplat ni de INRIA 3DGS.
- Solo se documenta una configuración de hardware (AMD RX 6900 XT + Windows); el comportamiento en otras GPU, en Linux o en controladores Vulkan antiguos no está verificado.
- Sin benchmarks estándar ni comparación numérica con alternativas, la evaluación de calidad queda en manos de quien lo pruebe.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kylinfires/gaussian-splatting-vulkan
- Space con la galería de 13 vistas: https://huggingface.co/spaces/kylinfires/vulkan-world-models
- Código fuente en GitHub: https://github.com/q760440238/vulkan-world-models/tree/main/gaussian-splatting
- VkSplat (upstream del rasterizador y entrenador, Apache-2.0): https://github.com/harry7557558/vksplat
- Referencia externa, proyecto distinto de NVIDIA (visor/testbed Vulkan, no entrena): https://github.com/nvpro-samples/vk_gaussian_splatting
- Documentación de nvpro-samples: https://nvpro-samples.github.io/vk_gaussian_splatting/
- Tutorial de renderizado de Gaussian Splats en Vulkan (Khronos): https://docs.vulkan.org/samples/latest/samples/complex/render_octomap/Tutorials/gaussian-splats-rendering.html
