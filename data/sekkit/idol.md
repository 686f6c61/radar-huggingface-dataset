# sekkit/idol

## Resumen

Idol es un modelo de generación 3D a partir de una única imagen, desarrollado por Sperid Labs (publicado en Hugging Face bajo el usuario `sekkit`). Toma una fotografía o un render de un objeto y produce un splat 3D gaussiano (3DGS) en formato `.ply` estándar, con hasta 1.048.576 gaussianas, incluyendo las caras del objeto que la imagen de entrada nunca mostró. El pipeline incluye eliminación automática de fondo, encuadre del objeto y predicción de la cámara de entrada.

El sistema es una composición de varios componentes: un denoiser basado en Diffusion Transformer (DiT) de 370,6 M de parámetros, un decodificador de octree de 50,8 M, un decodificador gaussiano de 237,3 M, y encoders de imagen preentrenados (DINOv3 ViT-H+/16 y el VAE de FLUX.2), más un módulo de segmentación BiRefNet para el recorte de fondo. En total, una petición completa moviliza aproximadamente 1.800 millones de parámetros y un pico de 7,2 GB de VRAM.

Su relevancia práctica radica en el coste: funciona en GPUs de consumo, con un pico de 7,2 GB de VRAM, y puede completar una generación en menos de 2 segundos gracias a optimizaciones de muestreo (torch.compile, paso guiado/no guiado en un solo batch, cuDNN con matmuls TF32). La licencia Apache 2.0 facilita su integración en productos comerciales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline híbrido: DiT (denoiser de difusión) + decodificador de octree + decodificador gaussiano, con encoders DINOv3 ViT-H+/16 y VAE de FLUX.2, y BiRefNet para segmentación |
| Parametros totales | ~1,80 B por petición (DiT 370,6 M; octree decoder 50,8 M; Gaussian decoder 237,3 M; BiRefNet 220,7 M; DINOv3 840,6 M; VAE 84,1 M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de imagen a 3D, no de texto) |
| Tipos de cuantizacion | no disponible; el modelo usa FP16 para bloques transformer y FP32 para embeddings y normas; DINOv3 en bf16 (opción fp32) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (pesos del repo, ~3 GB); salida en `.ply` (3D Gaussian Splatting) |

## Arquitectura y entrenamiento

Idol es un pipeline de difusión condicionada por imagen para generar representaciones 3D. La imagen de entrada se procesa con BiRefNet (eliminación de fondo) y se codifica con DINOv3 ViT-H+/16 y el VAE de FLUX.2. Un DiT de 370,6 M de parámetros actúa como denoiser, con bloques transformer en FP16 y embeddings y normas en FP32. La representación 3D se genera de forma jerárquica: un decodificador de octree de 50,8 M produce la estructura espacial y un decodificador gaussiano de 237,3 M emite los parámetros de cada gaussiana (posición, escala, rotación, opacidad y color), hasta un máximo de 1.048.576 gaussianas.

El muestreo se controla con 50 pasos por defecto, classifier-free guidance de 3,0 y un parámetro de time shift (`rescale_t`) de 3,0, que reparte los pasos entre la forma global y el detalle fino. El modelo soporta dos modos de encuadre (`synthetic` para renders e imágenes generadas, `real` para fotografías) y predicción de la cámara de la imagen de entrada. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO; la model card no detalla el proceso de entrenamiento.

La innovación técnica destacable es la optimización del muestreo: `torch.compile` sobre el denoiser, ejecución conjunta de las pasadas guiada y no guiada como un único batch, y uso de cuDNN con matmuls TF32 durante el muestreo, lo que reporta una aceleración de ~1,7x sin pérdida de calidad. La primera imagen de cada proceso es más lenta por la compilación.

## Capacidades

- Generación de splats 3D gaussianos a partir de una sola imagen, con hasta 1.048.576 gaussianas y salida en `.ply` compatible con visores 3DGS estándar.
- Inferencia de las caras ocultas del objeto: completa la geometría y apariencia de las zonas no visibles en la imagen de entrada.
- Eliminación automática de fondo y encuadre del objeto, con dos modos de recorte (`synthetic` y `real`).
- Predicción de la cámara de la imagen de entrada, exportada como `<name>_camera.json`.
- Control de la generación mediante semilla (`--seed`), número de pasos (`--steps`), fuerza de guidance (`--cfg_strength`), time shift (`--rescale_t`) y número de gaussianas (`--num_gaussians`, múltiplo de 32 entre 32.768 y 1.048.576).
- Entrada flexible: fotografías, renders o imágenes generadas por IA.
- API de Python (`IdolPipeline.from_pretrained`) y CLI (`python -m idol.sample`).
- No soporta tool calling, agentes, razonamiento multi-step ni capacidades multilingües, al no ser un modelo de lenguaje.

## Casos de uso

- **Catálogos de e-commerce**: a partir de una única foto de producto se genera un splat 3D navegable para visores web, eliminando la necesidad de sesiones fotográficas multiángulo. El modo `real` está pensado específicamente para fotografías.
- **Prototipado rápido de assets para videojuegos**: conversión de concept art o renders en mallas gaussianas de referencia para blockout de escenarios y objetos, con control del número de gaussianas para ajustar el nivel de detalle.
- **Realidad aumentada**: generación de modelos 3D ligeros a partir de una foto del usuario para previsualización en aplicaciones AR, gracias al bajo coste de inferencia (<2 s) y al pico de 7,2 GB de VRAM.
- **Generación de contenido para impresión 3D y modelado**: creación de representaciones 3D de referencia a partir de imágenes generadas por IA, útil en pipelines de diseño iterativo donde se parte de un render conceptual.
- **Investigación en visión 3D**: banco de pruebas para estudiar la calidad de la reconstrucción de caras ocultas y la predicción de cámara, con parámetros de muestreo expuestos y salida en formato estándar 3DGS.
- **Automatización de pipelines de assets 3D**: integración vía API de Python en procesos batch que convierten directorios de imágenes en splats `.ply`, con salida determinista fijando la semilla.
- **Demostraciones interactivas**: despliegue del Space de Hugging Face o de la CLI en una GPU de consumo para demos en vivo de imagen a 3D.

## Benchmarks y rendimiento

La model card incluye una comparativa frente a TripoSplat, TRELLIS y LGM, evaluada en la vista de entrada (PSNR, SSIM, LPIPS, IoU) y en siete vistas nuevas (DINOv2, CLIP, distancia de nitidez), con 1 × H100 por modelo. Sin embargo, la tabla de resultados está truncada en la información disponible: solo se muestra la cabecera y la fila inicial, sin valores numéricos.

| Modelo | Setting | PSNR | SSIM | LPIPS | IoU | DINOv2 | CLIP | Sharpness |
|---|---|---|---|---|---|---|---|---|
| Idol | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |
| TripoSplat | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |
| TRELLIS | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |
| LGM | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

No se han publicado resultados numéricos de benchmarks en la información disponible.

## Requisitos de hardware

- **VRAM estimada**: pico de 7,2 GB por petición. Los pesos ocupan ~3,7–4,4 GB (DiT ~0,8–1,0 GB; octree decoder ~0,1–0,2 GB; Gaussian decoder ~0,5–0,9 GB; BiRefNet ~0,44 GB; DINOv3 ~1,68 GB en bf16; VAE ~0,17 GB).
- **GPU recomendadas**: cualquier GPU NVIDIA con CUDA y al menos ~7,2 GB de VRAM. Los benchmarks del autor se ejecutaron en H100; para inferencia real basta una GPU de consumo.
- **¿Cabe en GPU de consumo?**: sí. Con 7,2 GB de pico cabe en tarjetas de 8 GB o más (por ejemplo, RTX 3060 Ti, RTX 4060 Ti, RTX 3070/4070 y superiores). En GPUs de 8 GB el margen es ajustado; se recomienda 12 GB o más para comodidad.
- **Opciones de despliegue**: CLI (`python -m idol.sample`), API de Python (`IdolPipeline`), Space de Hugging Face. No se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de modelo.
- **Latencia y throughput**: menos de 2 segundos por imagen con el muestreo optimizado por defecto (~1,7x de aceleración). La primera imagen de cada proceso es más lenta por la compilación de `torch.compile`. `--steps` menor reduce el tiempo a costa de detalle.
- **Requisitos de software**: Python 3.10+, PyTorch 2.5+, CUDA. Es necesario aceptar los términos de los modelos con acceso restringido `facebook/dinov3-vith16plus-pretrain-lvd1689m` y `black-forest-labs/FLUX.2-dev` (solo se descarga su VAE) y autenticarse con `hf auth login` o `HF_TOKEN`.
- **Disco**: ~3 GB de pesos del modelo más los encoders descargados en la caché de Hugging Face.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Idol | ~1,80 B por petición | no aplica | Benchmark publicado pero valores no disponibles en la información | Apache 2.0 | Hugging Face, GitHub, Space |
| TripoSplat | no disponible | no aplica | Comparado en el benchmark de Idol; valores no disponibles | no disponible | no disponible |
| TRELLIS | no disponible | no aplica | Comparado en el benchmark de Idol; valores no disponibles | no disponible | no disponible |
| LGM | no disponible | no aplica | Comparado en el benchmark de Idol; valores no disponible | no disponible | no disponible |

Los tres modelos comparables (TripoSplat, TRELLIS y LGM) son referencias de la propia model card para tareas de imagen a 3D; no se dispone de sus especificaciones detalladas, licencias ni resultados numéricos en la información proporcionada.

## Limitaciones y advertencias

- **Dependencia de modelos con acceso restringido**: requiere aceptar los términos de DINOv3 ViT-H+/16 y FLUX.2-dev y autenticarse en Hugging Face; sin ello, el pipeline se detiene antes de descargar nada.
- **Riesgo de alucinación geométrica**: las caras ocultas del objeto se generan por inferencia; pueden no corresponder a la geometría real del objeto y producir artefactos o detalles inventados.
- **Sesgos**: no se documentan sesgos específicos, pero al depender de encoders preentrenados (DINOv3, VAE de FLUX.2) puede heredar sesgos de sus datos de entrenamiento en la interpretación de la imagen.
- **Restricciones de entrada**: el modelo está diseñado para un único objeto por imagen; escenas con múltiples objetos o fondos complejos pueden degradar el recorte y el encuadre.
- **Modo de recorte**: elegir mal entre `synthetic` y `real` afecta al encuadre del objeto (1/1,2 frente a 1/1,7 del marco) y, por tanto, a la calidad del resultado.
- **Licencia**: Apache 2.0 permite uso comercial, pero los componentes de terceros (DINOv3, FLUX.2 VAE, BiRefNet) tienen sus propias licencias y condiciones que deben verificarse por separado.
- **Producción**: el uso de `torch.compile` implica un coste de compilación en la primera inferencia de cada proceso; para servicios de baja latencia conviene mantener el proceso caliente.
- **Idiomas y texto**: el modelo no procesa lenguaje natural ni soporta instrucciones textuales; no es adecuado para tareas de NLP.
- **Madurez**: el repositorio tiene 14 descargas y 0 likes en el momento de la consulta, lo que sugiere una adopción todavía muy limitada y poca validación externa.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/sekkit/idol)
- [Página del proyecto](https://speridlabs.com/research/idol)
- [Repositorio de código (idol-sdk)](https://github.com/speridlabs/idol-sdk)
- [Demo en Hugging Face Spaces](https://huggingface.co/spaces/speridlabs/idol)
- [DINOv3 ViT-H+/16 (encoder, acceso restringido)](https://huggingface.co/facebook/dinov3-vith16plus-pretrain-lvd1689m)
- [FLUX.2-dev (VAE, acceso restringido)](https://huggingface.co/black-forest-labs/FLUX.2-dev)
