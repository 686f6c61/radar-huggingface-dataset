# kylinfires/worldgen-vulkan

## Resumen

WorldGen Vulkan es un repositorio de HuggingFace mantenido por el usuario kylinfires que implementa, sin CUDA, la pipeline text-to-360 / image-to-360 de WorldGen sobre hardware AMD mediante Vulkan. Concretamente, permite generar escenas 3D en formato Gaussian Splatting (3DGS) y mallas a partir de un prompt de texto o de una imagen, ejecutando todo el flujo en Windows con una GPU AMD (validada sobre una RX 6900 XT de 16 GB).

La pipeline combina varios modelos y componentes: FLUX.1-dev y FLUX.1-Fill-dev (ejecutados mediante stable-diffusion.cpp con backend Vulkan) para generar panoramas 1024x512, el modelo de profundidad DA-2 convertido a ncnn con soporte Vulkan para estimar el mapa de profundidad, y un postprocesado en Rust que convierte RGBD en nubes de gaussianas (PLY de 3DGS) y mallas (PLY). El resultado es una alternativa totalmente libre de CUDA y de PyTorch en inferencia para generar escenas 3D inmersivas a partir de texto o imágenes.

No se trata de un modelo de lenguaje ni de una replicación byte a byte del WorldGen oficial: el autor lo describe como una reimplementación de la pipeline con algunas diferencias respecto a la demo oficial. La ruta por defecto a 1024x512 está validada, mientras que la ruta a 1600x800 y algunas opciones de calidad siguen en desarrollo. Es relevante porque demuestra que cargas de trabajo de generación 3D con difusión pueden ejecutarse en GPUs de consumo no NVIDIA, un hueco histórico del ecosistema de IA local.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline de generación 3D: difusión (FLUX.1-dev / FLUX.1-Fill-dev) + estimación de profundidad (DA-2) + conversión RGBD a 3DGS |
| Parametros totales | no disponible (depende de los pesos FLUX.1-dev, FLUX.1-Fill-dev, DA-2 y LoRA WorldGen descargados por separado) |
| Parametros activos | no disponible |
| Longitud de contexto | no aplicable (no es un modelo de lenguaje) |
| Tipos de cuantizacion | GGUF q4_k (FLUX.1-dev), GGUF q4 (FLUX.1-Fill-dev), fp8_e4m3fn (T5-XXL), f32 (DA-2 en ncnn) |
| Idiomas soportados | zh, en (documentación y prompts de texto) |
| Licencia | Apache 2.0 (el repositorio; los pesos FLUX.1-dev y FLUX.1-Fill-dev quedan sujetos a la licencia no comercial de Black Forest Labs) |
| Formato de pesos | GGUF, safetensors, ncnn (.param/.bin), PLY (salida 3DGS/mesh) |

## Arquitectura y entrenamiento

El sistema no es un modelo entrenado por el autor, sino una pipeline de inferencia que orquesta varios modelos preentrenados. El flujo es el siguiente: un prompt de texto o una imagen de entrada se procesa con FLUX.1-dev (text-to-scene) o FLUX.1-Fill-dev (image-to-scene, con relleno inpaint del fondo) mediante stable-diffusion.cpp compilado con backend Vulkan, generando un panorama equirectangular de 1024x512 en 20 pasos de muestreo. Ese panorama pasa por DA-2, un modelo de estimación de profundidad monocular originalmente en PyTorch que el autor exporta a ncnn mediante un patch que elimina la operación `quantile` y separa el QKV para que pnnx pueda trazarlo. El runner de ncnn se compila con `-DNCNN_VULKAN` y fuerza el dispositivo Vulkan, logrando 0 de 581 capas en fallback a CPU.

A continuación, un componente en Rust convierte el par RGBD en gaussianas 3D (PLY de 17 floats por gaussiana, 524.288 gaussianas por escena) y en malla mediante TSDF voxelizado (con Open3D opcional). Existen además herramientas complementarias en wgpu: `gpu-geom` (generación de gaussianas en GPU con compute shaders) y `gpu-splat` (renderizador 3DGS en Vulkan con cámara interior de 90 grados). El autor también incluye un LoRA de WorldGen (worldgen_text2scene.safetensors y worldgen_img2scene.safetensors) que se aplica sobre FLUX.1-dev para orientar la generación hacia panoramas 360. No hay datos de entrenamiento propios: todos los pesos provienen de repositorios upstream (FLUX.1-dev, FLUX.1-Fill-dev, DA-2, OneFormer ADE20K Swin-Large opcional).

## Capacidades

- Text-to-360: generación de un panorama equirectangular 1024x512 a partir de un prompt de texto, con 20 pasos de difusión sobre FLUX.1-dev cuantizado en GGUF q4_k.
- Image-to-360: generación de panorama a partir de una imagen de entrada, usando FLUX.1-Fill-dev para rellenar el fondo tras limpiar el primer plano (reduce objetos duplicados); opciones `--inpaint-bg` (GrabCut + OpenCV + merge de splats) y `--keep-fg`.
- Estimación de profundidad monocular en GPU vía Vulkan (DA-2 en ncnn), con validación frente a PyTorch: error absoluto máximo 0.0161, medio 0.0027 y similitud coseno 0.9999994 a 1024x512.
- Reconstrucción 3D en dos formatos: nube de Gaussian Splatting (gaussians.ply, 17 floats por gaussiana) y malla poligonal (mesh.ply) mediante TSDF voxelizado, importable en Blender.
- Renderizado propio: renderizador 3DGS en wgpu/Vulkan (gpu-splat), generación de gaussianas en GPU (gpu-geom), y scripts de previsualización en Python (perspectiva 90° FOV, equirectangular y puntos).
- Ruta alternativa a 1600x800 mediante superresolución LANCZOS del panorama 1024x512 seguida de DA-2 a 1600 (sin detalle adicional, pero con menos ruido que el VAE nativo a 1600).
- Soporte de prompts en chino e inglés (idiomas de FLUX.1-dev y T5-XXL).
- Ejecución 100 % libre de CUDA y sin PyTorch en inferencia (PyTorch solo se usa opcionalmente para OneFormer en CPU, aún sin ruta GPU).

## Casos de uso

- Creación rápida de entornos 3D para videojuegos y prototipado: un diseñador puede generar un panorama 360 desde un prompt ("a cozy wooden bedroom with warm lamps") y obtener en menos de un minuto una nube de gaussianas y una malla importable en Blender para usar como base de nivel o skybox volumétrico.
- Producción de contenido para realidad virtual: los panoramas convertidos a 3DGS pueden visualizarse con cualquier visor de Gaussian Splatting, lo que permite crear escenas inmersivas 360 sin equipo NVIDIA.
- Visualización arquitectónica e interiorismo: a partir de un render o foto parcial (image-to-360 con FLUX.1-Fill-dev), el sistema completa el entorno y genera la escena 3D navegable.
- Generación de fondos para cine y VFX: los panoramas 1024x512 (o 1600x800 con LANCZOS) sirven como environment maps para iluminación y fondos de composición.
- Investigación en inferencia sin CUDA: el repositorio sirve de referencia práctica para portar modelos de difusión (stable-diffusion.cpp) y de profundidad (ncnn/pnnx) a Vulkan, con scripts de build reproducibles en PowerShell.
- Digitalización de objetos con escena contextual: usando `--keep-fg` y `--inpaint-bg`, se puede insertar un objeto fotografiado en una escena generada y reconstruir el conjunto en 3DGS.
- Educación y demos de gráficos por GPU: los componentes wgpu (gpu-geom, gpu-splat) son ejemplos de compute shaders y renderizado de splatting implementados desde cero en Vulkan.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandarizados (MMLU, HumanEval, etc.), al no tratarse de un modelo de lenguaje. Los tiempos medidos por el autor en una AMD RX 6900 XT (1024x512, 20 pasos) son:

| Etapa | Tiempo |
|---|---:|
| Pipeline completa text-to-scene (t2s) | 56,7 s |
| Pipeline completa image-to-scene (i2s) | 61,5 s |
| Muestreo FLUX | GPU al ~100 % de uso 3D |
| Decodificación VAE (tiling 512) | 1,35 s (sin tiling: 9,0 s) |
| DA-2 en Vulkan (f32) | 3,05 s |
| Rust RGBD a 3DGS | 0,29 s |
| OneFormer en CPU (carga / inferencia) | 19,8 s / 4,6 s |

La comparación con la demo oficial de WorldGen es cualitativa (misma imagen de entrada, prompt/seed distintos), no una reproducción numérica.

## Requisitos de hardware

- GPU con soporte Vulkan 1.4; validado sobre AMD RX 6900 XT de 16 GB. No se requiere NVIDIA ni CUDA.
- La VRAM necesaria depende de los pesos cargados: FLUX.1-dev en GGUF q4_k más T5-XXL en fp8 y CLIP-L caben razonablemente en 16 GB, aunque el repositorio no publica una cifra exacta de VRAM (no disponible).
- Sistema operativo Windows 11 (la pipeline se valida en Windows; scripts en PowerShell).
- Software: Visual Studio 2022 con CMake/Ninja, Rust stable, Python 3.11+ solo para orquestación e I/O de imágenes.
- Despliegue: no es un modelo servible tipo LLM; se ejecuta como pipeline local mediante scripts (`build_sd.ps1`, `build_da2.ps1`, `build_rust.ps1`) y comandos Python (`worldgen_t2s.py`, `worldgen_i2s.py`, `worldgen_mesh.py`). No aplica vLLM, llama.cpp, Ollama ni TGI; los backends subyacentes son stable-diffusion.cpp (Vulkan) y ncnn (Vulkan).
- Los pesos gated de FLUX requieren `HF_TOKEN`; el script `scripts/download_models.py` muestra URLs y hashes de verificación.

## Comparativa con modelos similares

| Aspecto | WorldGen Vulkan (este repo) | WorldGen oficial (Microsoft, referencia) | Pipeline CUDA típica (FLUX + Depth-Anything + 3DGS en PyTorch) |
|---|---|---|---|
| Tipo | Reimplementación de pipeline text/image-to-360 3DGS | Pipeline oficial text/image-to-3DGS | Combinación manual de modelos |
| Backend GPU | Vulkan (stable-diffusion.cpp, ncnn, wgpu) | PyTorch + CUDA | PyTorch + CUDA |
| Hardware | AMD/NVIDIA con Vulkan (validado RX 6900 XT) | NVIDIA con CUDA | NVIDIA con CUDA |
| Resolución por defecto | 1024x512 (1600x800 vía LANCZOS) | no disponible | configurable |
| Licencia del código | Apache 2.0 | no disponible en la información proporcionada | varía |
| Pesos incluidos | No (descarga aparte; FLUX bajo licencia no comercial de BFL) | no disponible | varía |

No hay disponible una comparativa numérica de calidad (PSNR/SSIM/LPIPS) frente a la pipeline oficial en la información proporcionada.

## Limitaciones y advertencias

- El autor aclara que no es una réplica exacta del WorldGen oficial: la ruta 1024x512 está validada, pero la calidad de imagen y la opción `use_sharp=True` están sin terminar.
- En image-to-scene, el flujo por defecto limpia el primer plano antes del relleno; pueden quedar residuos y bandas verticales en los bordes del inpaint.
- La malla TSDF por defecto ya no se genera en CPU (hay que usar `--cpu-mesh`) y presenta plegados de profundidad en el lado izquierdo y pequeños artefactos en los polos.
- La ruta 1600x800 no añade detalle real: es un reescalado LANCZOS del panorama 1024x512 seguido de DA-2 a 1600.
- OneFormer (segmentación) solo funciona en CPU (PyTorch sin CUDA); falta un port a ONNX/ncnn o wgpu, con 19,8 s de carga y 4,6 s de inferencia.
- Restricción de licencia importante: aunque el código es Apache 2.0, los pesos de FLUX.1-dev y FLUX.1-Fill-dev están bajo la licencia no comercial de Black Forest Labs, lo que limita el uso comercial de las escenas generadas con dichos pesos; los LoRA de WorldGen y DA-2 tienen sus propias licencias upstream que deben revisarse.
- Riesgo de artefactos típicos de difusión y de estimación monocular de profundidad: geometrías imposibles, objetos duplicados y costuras en el panorama.
- Repositorio muy reciente (creado en octubre de 2026) con 0 descargas registradas; la madurez y el soporte son limitados y la validación se ha hecho esencialmente en una única configuración de hardware (RX 6900 XT, Windows 11).

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/kylinfires/worldgen-vulkan
- Documentación de validación citada en el README: docs/VALIDATION.md (ruta relativa dentro del repositorio)
- Pesos upstream referenciados (no incluidos en el repo): FLUX.1-dev, FLUX.1-Fill-dev (Black Forest Labs), DA-2, shi-labs/oneformer_ade20k_swin_large
- No se han encontrado en la información proporcionada enlaces a paper, demo pública ni blog del proyecto.
