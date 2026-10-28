# kylinfires/hunyuanworld-vulkan

## Resumen

`kylinfires/hunyuanworld-vulkan` no es un modelo con pesos propios, sino un motor de inferencia nativo escrito en **Rust + wgpu/Vulkan** para ejecutar **HunyuanWorld-Mirror** (1.260 millones de parámetros) de Tencent sin CUDA, sin PyTorch y sin el rasterizador `gsplat`. El repositorio (0,0 GB, publicado el 28 de octubre de 2026, sin descargas ni likes registrados) contiene únicamente el motor, documentación y varias imágenes de previsualización; los pesos deben descargarse del repositorio oficial `tencent/HunyuanWorld-Mirror`. La relevancia es clara para el ecosistema no-NVIDIA: permite reconstrucción 3D a partir de imagen única, múltiples vistas o vídeo sobre GPUs AMD (probado en una Radeon RX 6900 XT de 16 GB).

El modelo subyacente resuelve una tarea de reconstrucción geométrica densa: en un único pase forward devuelve mapa de profundidad con confianza, normales de superficie con confianza, parámetros de cámara (c2w e intrínsecos), nube de puntos en coordenadas de mundo, representación 3D Gaussian Splatting y, opcionalmente, malla TSDF o Poisson generada como postproceso con Open3D. La arquitectura no es un ViT único, sino una pila de 72 bloques transformer: 24 de DINOv2 ViT-L/14, 24 de atención intra-fotograma (VGT frame) y 24 de atención global entre vistas (VGT global), más una cabeza de cámara y cuatro cabezas DPT.

La innovación del repositorio es de implementación, no de entrenamiento: todos los operadores (GEMM, LayerNorm, QKV, QK-norm, RoPE 2D, atención, Conv2d/ConvTranspose2d, embeddings UV del DPT, im2col, activaciones 3DGS y fusión de vóxeles) están escritos como compute shaders WGSL. La validación numérica frente a la referencia oficial en PyTorch CPU f32 muestra desviaciones máximas de 3e-7 en cámara y 5,9e-5 en profundidad con dos vistas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer híbrido de 72 bloques: 24 DINOv2 ViT-L/14 + 24 VGT frame (atención intra-vista) + 24 VGT global (atención entre vistas); cabeza de cámara de 4 iteraciones y 4 cabezas DPT (depth, pts, normal, gs) |
| Parámetros totales | 1,26 mil millones (modelo subyacente HunyuanWorld-Mirror); el repositorio en sí no contiene pesos |
| Parámetros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no aplica en el sentido de tokens de texto; por defecto hasta 8 vistas, con 1374 tokens por vista en DINOv2 y 1376 en VGT (1 cls + 4 reg + 1 cam + 1 pose + 1 ray + 1369 patch, `patch_start_idx` = 7), dimensión de embedding 1024 |
| Tipos de cuantización | f32 (pesos de 5,05 GB); no se documentan otros formatos ni cuantizaciones |
| Idiomas soportados | zh, en (documentación y model card) |
| Licencia | Código Rust/WGSL original: Apache-2.0. Pesos del modelo: Tencent HunyuanWorld-Mirror Community License (excluye UE, Reino Unido y Corea del Sur) |
| Formato de pesos | no disponible en el repositorio; se descargan mediante `scripts/download_weights.py` desde `tencent/HunyuanWorld-Mirror` (el formato concreto del checkpoint oficial no se especifica en la información disponible) |

## Arquitectura y entrenamiento

La información disponible describe la arquitectura de inferencia, no el proceso de entrenamiento. Se sabe que el modelo consta de 72 bloques transformer organizados en tres etapas: los 24 bloques de DINOv2 ViT-L/14 extraen características por imagen (1 token CLS, 4 tokens de registro y 1369 tokens de patch sobre una rejilla de 37 × 37 a 518 × 518 píxeles; sin RoPE ni QK-norm, LayerNorm con eps 1e-6); los 24 bloques VGT frame aplican atención dentro de cada vista con QK-norm y RoPE 2D; y los 24 bloques VGT global realizan atención cruzada entre vistas con el mismo esquema. La cabeza de cámara itera cuatro veces sobre 2048 dimensiones con 16 cabezas de atención, y cuatro cabezas DPT independientes producen profundidad, puntos 3D, normales y parámetros de Gaussian Splatting.

El motor reimplementa la totalidad de operadores en WGSL y ejecuta la inferencia sobre `wgpu`/Vulkan. No hay información sobre volumen de tokens de entrenamiento, composición del dataset, ni sobre el uso de RLHF o DPO en la información proporcionada; tampoco se documentan mecanismos de decodificación especulativa ni attention linear. La particularidad técnica destacable es la paridad numérica con la implementación de referencia en PyTorch CPU f32 (error máximo absoluto entre 1,12e-7 y 5,00e-4 según la salida y el número de vistas) y la fusión de splats Gaussianos multi-vista (41.390 splats generados frente a 41.386 de la referencia en imagen única; 343.922 splats combinados con dos vistas).

## Capacidades

- Estimación de profundidad densa con mapa de confianza asociado.
- Estimación de normales de superficie con mapa de confianza.
- Predicción de parámetros de cámara: matriz cámara-a-mundo (c2w) e intrínsecos.
- Generación de nube de puntos en coordenadas de mundo a partir de una o varias vistas.
- Representación 3D Gaussian Splatting por vista y fusión multi-vista de splats.
- Malla opcional mediante TSDF o Poisson (postproceso con Open3D, fuera del grafo del modelo).
- Renderizado 3DGS integrado y generación de vídeo turntable (renderizador isotrópico en software).
- Entrada de imagen única, conjunto de imágenes (hasta 8 vistas por defecto) o vídeo con muestreo por FPS.
- Ejecución sin CUDA, sin PyTorch y sin `gsplat`, sobre backend Vulkan.
- No soporta generación de texto, tool calling, function calling, razonamiento multi-paso ni uso como agente: es un modelo puramente geométrico/visión.
- Capacidades multilingües limitadas a la documentación en chino e inglés; no hay procesamiento de lenguaje natural.

## Casos de uso

- **Reconstrucción 3D desde una sola foto en estaciones de trabajo AMD**: el motor permite obtener nube de puntos, normales y splats a partir de una imagen de 518 × 518 en 11,1 s sobre una RX 6900 XT, sin necesidad de GPU NVIDIA ni de instalar el stack CUDA.
- **Digitalización de producto para e-commerce**: con 4 vistas (49,1 s en la GPU de referencia) se obtiene una representación 3DGS fusionada con 343.922 splats, utilizable en visores web con rotación interactiva para fichas de producto.
- **Generación de mallas para motores de juego o impresión 3D**: el flag `--mesh poisson` produce mallas exportables a partir de las vistas de entrada, adecuadas para pipelines de assets donde se requiere topología de superficie en lugar de splats.
- **Fotogrametría de bajo coste sobre vídeo**: la entrada `--video clip.mp4 --fps 1 --max-views 8` muestrea fotogramas y reconstruye la escena, lo que sirve para inventariado de espacios o documentación de obra con una cámara convencional.
- **Robótica y percepción en hardware no-NVIDIA**: el mapa de profundidad con confianza y las normales de superficie son entradas directas para planificación de agarre o navegación en plataformas embebidas con GPU integrada Vulkan.
- **Patrimonio y arquitectura**: reconstrucción multi-vista de objetos o estancias con salida de cámara (c2w e intrínsecos) que permite alinear la reconstrucción con levantamientos topográficos existentes.
- **Prototipado rápido en equipos sin CUDA**: al no depender de PyTorch ni de `gsplat`, el binario `hwm-vk` se puede distribuir como ejecutable único en entornos Windows/Linux con drivers Vulkan, simplificando el despliegue en clientes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K y similares) en la información disponible; no aplican a un modelo de reconstrucción 3D. Los datos publicados son de latencia y de validación numérica frente a la implementación oficial en PyTorch CPU f32.

Latencia medida sobre AMD Radeon RX 6900 XT 16 GB, entrada 518 × 518:

| Configuración | Tiempo |
|---|---:|
| Imagen única | 11,1 s |
| 2 vistas | 21,5 s |
| 4 vistas | 49,1 s |

Error absoluto máximo frente a PyTorch CPU f32:

| Salida | 1 vista | 2 vistas |
|---|---:|---:|
| Cámara | 1,12e-7 | 2,98e-7 |
| Profundidad | 3,22e-6 | 5,91e-5 |
| Puntos 3D (pts3d) | 8,34e-5 | 1,24e-4 |
| Normales | 6,08e-5 | 5,00e-4 |
| 3DGS en crudo | 8,20e-5 | no disponible |

Conteo de splats: 41.390 generados frente a 41.386 de la referencia con una vista; 343.922 splats fusionados con dos vistas.

## Requisitos de hardware

- **VRAM**: los pesos en f32 ocupan 5,05 GB; a ello hay que sumar activaciones y búferes de los 72 bloques y de las cabezas DPT, por lo que se recomienda un mínimo de 8 GB y, con holgura, 16 GB. Cifra exacta de pico de VRAM: no disponible.
- **GPU probada**: AMD Radeon RX 6900 XT 16 GB. Cualquier GPU con soporte Vulkan/wgpu debería ser compatible en teoría, pero no se documentan otras pruebas.
- **GPU recomendadas**: no hay lista oficial. Por el tamaño del modelo (1,26B en f32) cabe en GPUs de consumo con 8-16 GB, incluidas soluciones AMD e Intel con Vulkan; no se han publicado medidas en RTX 4090, A100 o H100.
- **Sin CUDA**: el diseño excluye explícitamente CUDA, PyTorch y `gsplat`, de modo que no se aprovechan Tensor Cores ni kernels propietarios de NVIDIA.
- **Despliegue**: binario Rust `hwm-vk` compilado con `cargo build --release`; requisitos Python solo para descargar pesos (`requirements.txt` y `scripts/download_weights.py`). No hay soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- **Latencia y throughput**: 11,1 s por imagen única y 49,1 s para 4 vistas en la RX 6900 XT, es decir, del orden de 0,02-0,09 vistas por segundo según la configuración. El coste de la atención global escala de forma cuadrática con el número de vistas (O(S²)), por lo que el límite práctico es de 8 vistas.
- **Almacenamiento**: 5,05 GB de pesos en f32 más el espacio de las salidas (splats, mallas).

## Comparativa con modelos similares

| Modelo | Parámetros | Entrada | Contexto multi-vista | Licencia de pesos | Backend |
|---|---:|---|---|---|---|
| `kylinfires/hunyuanworld-vulkan` | 1,26B (hereda los de HunyuanWorld-Mirror) | Imagen, multi-imagen, vídeo | Hasta 8 vistas por defecto | Apache-2.0 (código) + Tencent Community License (pesos, excluye UE/UK/Corea del Sur) | Rust + wgpu/Vulkan, sin CUDA |
| `tencent/HunyuanWorld-Mirror` (oficial) | 1,26B | Imagen, multi-imagen, vídeo | Hasta 8 vistas por defecto | Tencent HunyuanWorld-Mirror Community License | PyTorch + CUDA + `gsplat` |
| HunyuanWorld-1.0 (Tencent) | no disponible | Texto o imagen única | no aplica | licencia propia de Tencent (no verificada en detalle) | PyTorch, pipeline de difusión + reconstrucción |

El primer y el segundo caso ejecutan exactamente el mismo modelo y producen salidas equivalentes dentro del error numérico citado; la diferencia es el backend y el ecosistema de hardware. HunyuanWorld-1.0 resuelve una tarea distinta (generación de mundos 3D navegables a partir de texto o imagen, con proxy panorámico generado por difusión) y no es sustituible directamente por este motor. Para el renderizado de los splats, el repositorio señala que el renderizador integrado es isotrópico y en software, y que para calidad anisotrópica debe usarse `gsplat` externo (que requiere CUDA). Datos de benchmarks comparativos de calidad geométrica frente a otras alternativas: no disponible.

## Limitaciones y advertencias

- **Restricción territorial de la licencia de pesos**: la Tencent HunyuanWorld-Mirror Community License excluye la Unión Europea, el Reino Unido y Corea del Sur. Esto afecta directamente a un uso comercial desde España: la licencia Apache-2.0 solo cubre el código Rust/WGSL original, no los pesos. Es el caveat más importante antes de cualquier despliegue en producción.
- **El repositorio no incluye pesos**: cualquiera que clone el proyecto debe descargar 5,05 GB del repositorio oficial y aceptar la licencia de Tencent por separado.
- **Límite de vistas**: por defecto 8 vistas, con atención global de coste cuadrático; escenas más amplias requieren trocear la captura o asumir tiempos de cómputo elevados.
- **Resolución fija**: las entradas se redimensionan y rellenan a 518 × 518, lo que descarta detalle fino en objetos pequeños o escenas de alta resolución sin estrategias de mosaico.
- **La malla no la produce el modelo**: TSDF y Poisson son postproceso con Open3D; la calidad de la malla depende de la nube de puntos y de los parámetros del reconstruidor, no del transformer.
- **Renderizador 3DGS limitado**: implementación isotrópica en software; la calidad de render anisotrópico requiere `gsplat` con CUDA, lo que rompe la promesa de funcionar sin NVIDIA.
- **Riesgo de artefactos geométricos**: al ser un modelo de reconstrucción, puede producir profundidades inconsistentes en superficies sin textura, reflejos, transparencias o regiones ocluidas; los mapas de confianza deben usarse para filtrar.
- **Sin benchmarks de calidad publicados**: solo hay validación numérica contra la implementación de referencia, no evaluaciones en datasets estándar de reconstrucción.
- **Madurez y soporte**: repositorio con 0 descargas y 0 likes en el momento de la consulta, creado y actualizado el mismo día; no hay historial de mantenimiento ni comunidad.
- **Solo inferencia**: no incluye entrenamiento, ajuste fino ni el rasterizador CUDA de `gsplat`.
- **Idiomas**: la documentación está en chino e inglés; no hay soporte de texto ni de otras lenguas.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/kylinfires/hunyuanworld-vulkan
- Pesos oficiales del modelo: https://huggingface.co/tencent/HunyuanWorld-Mirror
- Código fuente del motor: https://github.com/q760440238/vulkan-world-models/tree/main/hunyuanworld
- Repositorio GitHub completo: https://github.com/q760440238/vulkan-world-models
- Demo interactiva (galería 3DGS de 13 vistas): https://huggingface.co/spaces/kylinfires/vulkan-world-models
- Perfil del autor: https://huggingface.co/kylinfires
- HunyuanWorld-Mirror oficial (Tencent): https://github.com/Tencent-Hunyuan/HunyuanWorld-Mirror
- HunyuanWorld-1.0 (modelo relacionado, generación de mundos 3D): https://github.com/Tencent-Hunyuan/HunyuanWorld-1.0
- Espejo no oficial de HunyuanWorld-1.0: https://github.com/AndrewYukon/hunyuanworld-1.0
- Ficha descriptiva de HunyuanWorld 1.0: https://builderai.tools/tool/hunyuanworld
