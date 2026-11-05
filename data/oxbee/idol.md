# OxBee/idol

## Resumen

Idol es un modelo de imagen a 3D desarrollado por OxBee (con documentación alojada en speridlabs.com) que convierte una única fotografía o render de un objeto en un *Gaussian splat* 3D completo, incluyendo las partes del objeto que la imagen de entrada nunca muestra. El modelo genera hasta 1.048.576 gaussianas y las exporta en el formato estándar `.ply` de 3DGS, lo que permite abrirlas directamente en visores de splats convencionales sin conversión adicional.

La arquitectura combina un denoiser basado en Diffusion Transformer (DiT) de 370,6M de parámetros con un decodificador de octree (50,8M) y un decodificador de gaussianas (237,3M). El pipeline completo integra además componentes auxiliares: BiRefNet para eliminación de fondo, DINOv3 ViT-H+/16 como codificador de imagen y el VAE de FLUX.2. En total, una petición completa moviliza aproximadamente 1.800M de parámetros y un pico de 7,2 GB de VRAM.

Su relevancia práctica reside en el coste de inferencia: funciona en GPUs de consumo con 7,2 GB de VRAM y puede completar una generación en menos de 2 segundos, lo que lo sitúa como una alternativa ligera frente a pipelines de reconstrucción 3D multi-vista más pesados. Está publicado bajo licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DiT (denoiser) + decodificador de octree + decodificador de gaussianas; pipeline con BiRefNet, DINOv3 ViT-H+/16 y VAE de FLUX.2 |
| Parametros totales | ~1.800M por petición completa (DiT 370,6M; octree 50,8M; gaussian decoder 237,3M; BiRefNet 220,7M; DINOv3 840,6M; FLUX.2 VAE 84,1M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo imagen a 3D) |
| Tipos de cuantizacion | no disponible; precisión de ejecución FP16/bf16 con algunos módulos FP32 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de ~3 GB); salida en `.ply` 3DGS |
| Pipeline | image-to-3d |
| Resolucion de salida | hasta 1.048.576 gaussianas (múltiplo de 32; mínimo 32.768) |
| VRAM pico | 7,2 GB |

## Arquitectura y entrenamiento

Idol es un modelo generativo de imagen a 3D estructurado como un pipeline de difusión. Un Diffusion Transformer actúa como denoiser y trabaja sobre una representación latente que se decodifica en dos etapas: primero un decodificador de octree que estructura la geometría y después un decodificador de gaussianas que produce los parámetros finales de cada splat (posición, escala, rotación, opacidad y color). La imagen de entrada se procesa con DINOv3 ViT-H+/16, y el VAE de FLUX.2 aporta la codificación latente de la imagen. Antes de la inferencia, BiRefNet elimina el fondo y recorta el objeto según el modo seleccionado (`synthetic` o `real`).

El muestreo admite control explícito mediante *classifier-free guidance* (`cfg_strength`, por defecto 3,0), un desplazamiento temporal (`rescale_t`, por defecto 3,0) y un número configurable de pasos (50 por defecto). La generación es determinista para una semilla fija. En GPU, el pipeline aplica optimizaciones por defecto: compilación del denoiser con `torch.compile`, fusión de las pasadas guiada y no guiada en un solo lote y uso de cuDNN con matmuls TF32, lo que reporta una aceleración de aproximadamente 1,7x sin pérdida de calidad. La información disponible no detalla el volumen ni la composición del dataset de entrenamiento, ni si se emplearon técnicas de RLHF o DPO.

## Capacidades

- Generación de *Gaussian splats* 3D (formato `.ply` 3DGS) a partir de una única imagen de un objeto.
- Inferencia de las vistas no observadas: completa la geometría de las caras laterales y traseras que la imagen de entrada no muestra.
- Eliminación automática de fondo y encuadre del objeto, con dos modos de recorte (`synthetic` para renders e imágenes generadas, `real` para fotografías).
- Predicción de la cámara de la imagen de entrada, exportada como `<name>_camera.json`.
- Control del número de gaussianas de salida entre 32.768 y 1.048.576.
- Control de la fidelidad a la imagen mediante `cfg_strength` y del reparto de pasos entre forma global y detalle fino mediante `rescale_t`.
- Reproducibilidad mediante semilla fija.
- Procesamiento por lotes de directorios de imágenes.
- No dispone de tool calling, razonamiento multi-paso ni capacidades de texto, audio o vídeo.

## Casos de uso

- **Generación de assets para videojuegos y realidad aumentada**: a partir de un render conceptual de un objeto se obtiene un splat 3D listo para visores 3DGS en menos de 2 segundos, lo que permite iterar sobre decenas de variantes en una sola sesión en una GPU de consumo.
- **Prototipado rápido de producto**: una fotografía de un objeto físico se convierte en un modelo 3D navegable para revisiones de diseño, usando el modo `real` para compensar el encuadre de las fotografías.
- **Catálogos de comercio electrónico en 3D**: conversión de las imágenes de catálogo existentes en vistas 3D interactivas, sin necesidad de captura multi-vista ni de hardware especializado, gracias a la inferencia de las caras ocultas.
- **Previsualización en pipelines de impresión 3D**: generación de una malla de referencia aproximada desde una sola foto para validar proporciones antes de modelar en detalle.
- **Investigación en reconstrucción 3D generativa**: el modelo sirve como *baseline* reproducible (semilla fija, flags documentados y pesos Apache 2.0) para comparar con TRELLIS, LGM o TripoSplat en las mismas condiciones de evaluación.
- **Integración en herramientas de autoría 3D**: la API de Python (`IdolPipeline`) permite incrustar la generación en un plugin de Blender o en una aplicación web que reciba una imagen y devuelva un `.ply` descargable.
- **Creación de contenido para redes y demos interactivas**: generación por lotes de splats a partir de imágenes generadas por modelos de texto a imagen, en modo `synthetic`, para alimentar visores web.

## Benchmarks y rendimiento

La model card menciona una comparativa frente a TripoSplat, TRELLIS y LGM, evaluada en la vista de entrada (PSNR, SSIM, LPIPS, IoU) y en siete vistas nuevas (DINOv2, CLIP, distancia de nitidez), con 1x H100 por modelo. Sin embargo, la tabla de resultados aparece truncada en la información disponible y no incluye las cifras.

No se han publicado resultados de benchmarks completos en la informacion disponible.

## Requisitos de hardware

- **VRAM pico**: 7,2 GB por petición completa; los pesos ocupan entre 3,7 y 4,4 GB.
- **Desglose de VRAM por componente**: DiT ~0,8–1,0 GB; decodificador de octree ~0,1–0,2 GB; decodificador de gaussianas ~0,5–0,9 GB; BiRefNet ~0,44 GB; DINOv3 ~1,68 GB; VAE de FLUX.2 ~0,17 GB.
- **GPU recomendadas**: cualquier NVIDIA con CUDA y al menos 8 GB de VRAM; cabe en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080 y RTX 4090. Para evaluación de referencia se usó una H100.
- **Requisitos de software**: Python 3.10+, PyTorch 2.5+ y CUDA.
- **Despliegue**: SDK oficial `idol-sdk` (instalación con `pip install -e .`), invocación por CLI (`python -m idol.sample`) o por API de Python (`IdolPipeline.from_pretrained`). No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- **Latencia**: menos de 2 segundos por objeto en GPU; la primera imagen de cada proceso es más lenta debido a la compilación con `torch.compile`.
- **Aceleración opcional**: `--dinov3_dtype fp32` consume 1,7 GB adicionales; `--no_optimize` desactiva el muestreo acelerado.
- **Dependencias externas con acceso restringido**: es necesario aceptar los términos de `facebook/dinov3-vith16plus-pretrain-lvd1689m` y de `black-forest-labs/FLUX.2-dev` y autenticarse con `hf auth login` o `HF_TOKEN`.

## Comparativa con modelos similares

| Modelo | Parametros | Entrada | Salida | Licencia | Notas |
|---|---|---|---|---|---|
| Idol | ~1.800M por petición | 1 imagen | Hasta 1.048.576 gaussianas (.ply) | Apache 2.0 | 7,2 GB VRAM, <2 s |
| TripoSplat | no disponible | no disponible | Gaussian splat | no disponible | Comparado en la benchmark de la model card |
| TRELLIS | no disponible | no disponible | 3D | no disponible | Comparado en la benchmark de la model card |
| LGM | no disponible | no disponible | Gaussian splat | no disponible | Comparado en la benchmark de la model card |

Los datos de parámetros, contexto y licencia de los modelos comparables no están disponibles en la información proporcionada; la model card únicamente confirma que Idol se evaluó frente a ellos con 1x H100 por modelo.

## Limitaciones y advertencias

- **Dependencia de modelos con acceso restringido**: el pipeline no funciona sin aceptar previamente los términos de DINOv3 y FLUX.2 en Hugging Face; si no están accesibles, Idol se detiene antes de descargar nada.
- **Alucinación geométrica**: las caras ocultas del objeto se generan por inferencia, no se reconstruyen; pueden no corresponder con la geometría real del objeto físico.
- **Sensibilidad al modo de recorte**: usar `synthetic` con fotografías reales o viceversa altera el encuadre y, previsiblemente, la calidad del resultado.
- **Resolución de entrada**: no se documenta el comportamiento con imágenes de muy baja resolución, objetos múltiples en la misma imagen ni escenas complejas; el modelo está pensado para un único objeto.
- **Ausencia de datos de sesgo**: no se publica información sobre sesgos del dataset de entrenamiento ni sobre el rendimiento por categoría de objeto.
- **Idiomas**: el campo de idiomas no está disponible; el modelo no procesa texto.
- **Licencia**: los pesos son Apache 2.0, pero el uso comercial queda condicionado por las licencias de los componentes externos (DINOv3 y FLUX.2 VAE), que deben revisarse por separado.
- **Madurez**: el repositorio registra 33 descargas y 0 likes en el momento de la consulta, sin actualizaciones desde su creación; conviene validar el comportamiento en producción antes de adoptarlo.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/OxBee/idol)
- [Página del proyecto](https://speridlabs.com/research/idol)
- [Repositorio del SDK](https://github.com/speridlabs/idol-sdk)
- [Demo en Hugging Face Spaces](https://huggingface.co/spaces/speridlabs/idol)
- [DINOv3 ViT-H+/16 (codificador de imagen)](https://huggingface.co/facebook/dinov3-vith16plus-pretrain-lvd1689m)
- [FLUX.2-dev (VAE)](https://huggingface.co/black-forest-labs/FLUX.2-dev)
