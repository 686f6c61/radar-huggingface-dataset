# Nekodeus/neko-korean2-sdxl-v1

## Resumen

`Nekodeus/neko-korean2-sdxl-v1` es un adaptador LoRA de tipo character para Stable Diffusion XL, desarrollado por el usuario Nekodeus y publicado bajo licencia Apache 2.0. Su propósito es reproducir el rostro del actor surcoreano Gong Yoo en imágenes generadas con `stabilityai/stable-diffusion-xl-base-1.0` a resolución nativa de 1024 px. No es un modelo de lenguaje ni un modelo fundacional: es un delta de pesos que se carga sobre el UNet de SDXL y se activa mediante el token disparador `korean2`.

El modelo resuelve un problema acotado y muy común en la generación de imágenes: la consistencia de identidad de un personaje concreto a lo largo de múltiples generaciones. Al tratarse de un LoRA de dimensiones reducidas (dim/alpha 16, entrenado solo en el UNet), el repositorio ocupa 0,2 GB y puede combinarse con otros adaptadores, estilos o ControlNets sin reentrenar el modelo base.

Es relevante ahora por su carácter de ejemplo reproducible: la model card documenta con precisión el pipeline de entrenamiento (kohya-ss `sdxl_train_network.py`, Adafactor, batch 1, 1500 pasos, fp16 con gradient checkpointing y atención sdpa) y publica el dataset de entrenamiento como `nekodeus/korean-top10-v2`, lo que permite auditar y replicar el proceso. La fecha de creación registrada es 2026-11-22 y el repositorio no presenta descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (delta de bajo rango) sobre el UNet de Stable Diffusion XL (difusión latente, text-to-image) |
| Parametros totales | no disponible (el LoRA se aplica sobre el UNet de SDXL base; dim/alpha 16) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de imagen; condicionamiento por prompt de texto, sin ventana de contexto declarada) |
| Tipos de cuantizacion | no disponible; los pesos se distribuyen en safetensors fp16 y el pipeline de referencia usa `torch.float16` |
| Idiomas soportados | no disponible (el prompt de texto de SDXL se procesa con los text encoders del modelo base; la model card no declara idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`korean2.safetensors`), compatible con diffusers y ComfyUI |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 16 (network dim 16, alpha 16) aplicado exclusivamente al UNet de `stabilityai/stable-diffusion-xl-base-1.0`. SDXL es un modelo de difusión latente con dos text encoders (CLIP ViT-L y OpenCLIP ViT-bigG) y un UNet de gran tamaño; el LoRA modifica únicamente las proyecciones del UNet, dejando intactos los text encoders y el VAE. El entrenamiento se realizó a 1024 px con bucketing entre 256 y 2048, 1500 pasos, learning rate 1e-4, optimizador Adafactor con batch 1, precisión fp16, gradient checkpointing y atención sdpa, empleando el script `sdxl_train_network.py` de kohya-ss sobre una GPU de Kaggle en modo completamente offline.

El dataset consta de 16 imágenes curadas de Gong Yoo, verificadas facialmente con OpenCV y etiquetadas con un caption uniforme y genérico (`a photo of korean2 person`). Forma parte del conjunto "Korean Top-10" y el dataset público se publica como `nekodeus/korean-top10-v2` en la subcarpeta `korean2/`. No se documenta uso de RLHF, DPO ni técnicas de preferencia; es un ajuste supervisado puro sobre pares imagen-caption. La innovación técnica destacable es la simplicidad y reproducibilidad del pipeline: 16 imágenes, 1500 pasos y un caption stub, sin técnicas de regularización por clase ni datasets auxiliares.

## Capacidades

- Generación de retratos fotorrealistas del actor Gong Yoo condicionados por el token `korean2` en el prompt.
- Transferencia de identidad facial consistente entre generaciones a 1024 px.
- Composición con estilos, iluminación y encuadres variables mediante el prompt de texto (por ejemplo, `studio lighting`, `portrait photo`).
- Compatibilidad con el ecosistema diffusers (`load_lora_weights`) y con ComfyUI mediante nodo LoRA loader.
- Posible apilamiento con otros LoRA de estilo sobre el mismo modelo base (no documentado explícitamente por el autor).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión de entrada, audio ni modo thinking: es exclusivamente un generador de imágenes texto-a-imagen.
- Capacidades multilingües no declaradas; la calidad del prompt depende de los text encoders de SDXL base.

## Casos de uso

- **Producción de storyboards y previsualización de casting**: generar variaciones de un mismo actor en distintos encuadres y vestuarios para presentar una propuesta visual antes de rodar, usando `korean2` como ancla de identidad.
- **Ilustración editorial y fan art**: crear retratos consistentes del personaje para portadas, artículos o material promocional no oficial, con control de estilo mediante el prompt y sin reentrenar el modelo base.
- **Pruebas de concepto de personajes en pipelines de video**: usar el LoRA como referencia de identidad para alimentar flujos posteriores de animación o image-to-video, manteniendo el rostro estable entre fotogramas clave.
- **Generación de avatares y material de perfil**: producir retratos cuadrados de 1024 px con iluminación de estudio para uso en entornos de demostración o prototipos de producto.
- **Investigación sobre LoRA de personaje**: servir como caso base reproducible para estudiar el efecto del número de imágenes (16), pasos (1500) y rango (16) en la fidelidad de identidad, comparando contra configuraciones alternativas.
- **Integración en ComfyUI para flujos creativos**: encadenar el LoRA con nodos de upscaling, ControlNet o inpainting facial para refinar el resultado antes de exportar a producción.
- **Docencia y talleres de difusión**: demostrar el ciclo completo de entrenamiento de un LoRA de personaje en hardware gratuito (Kaggle) con un dataset público y un script estándar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas cuantitativas de fidelidad de identidad (por ejemplo, similitud facial con FaceNet o CLIP-I), ni comparaciones numéricas con otros LoRA de personaje.

## Requisitos de hardware

- **VRAM estimada para inferencia**: el pipeline SDXL base en fp16 requiere aproximadamente 8-10 GB de VRAM para generar a 1024 px; el LoRA añade un delta mínimo (dim 16 sobre el UNet) que no altera de forma significativa el consumo.
- **GPU recomendadas**: NVIDIA A100, H100 o L40S para producción por lotes; RTX 4090 (24 GB) para generación interactiva a 1024 px con margen amplio.
- **Consumer GPU**: cabe en RTX 3090, RTX 4090, RTX 4080 (16 GB) y, con optimizaciones (attention slicing, VAE tiling o `--medvram`), en GPUs de 8-12 GB como RTX 3060 Ti o RTX 4070.
- **Opciones de despliegue**: diffusers (`StableDiffusionXLPipeline` + `load_lora_weights`), ComfyUI (nodo LoRA loader con `models/loras/korean2.safetensors`), Automatic1111/Forge y, para CPU o VRAM muy limitada, conversión a GGUF para stable-diffusion.cpp (no documentada por el autor).
- **Latencia y throughput**: no disponibles; no se han publicado mediciones. Como referencia del modelo base, una RTX 4090 suele generar una imagen de 1024 px en 20-30 pasos en el orden de segundos, pero este dato no procede de la información proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | Base | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `Nekodeus/neko-korean2-sdxl-v1` | LoRA de personaje | SDXL 1.0 | dim/alpha 16 (UNet) | no aplica | Apache 2.0 | Hugging Face, 0 descargas |
| `ostris/ikea_names` | LoRA de estilo/objeto | SDXL 1.0 | no disponible | no aplica | no disponible | Hugging Face, muy difundido |
| `latent-consistency/lcm-lora-sdxl` | LoRA de aceleración | SDXL 1.0 | no disponible | no aplica | no disponible | Hugging Face, ampliamente usado |
| `stabilityai/stable-diffusion-xl-base-1.0` | Modelo fundacional | — | no disponible | no aplica | CreativeML Open RAIL++-M | Hugging Face, referencia del ecosistema |

La comparación directa de rendimiento no es posible porque no se han publicado métricas de fidelidad de identidad para este LoRA ni para las alternativas listadas. La diferencia principal frente a otros LoRA de personaje es la documentación explícita del dataset y del pipeline de entrenamiento, junto con la licencia Apache 2.0, más permisiva que la del modelo base.

## Limitaciones y advertencias

- **Dataset muy reducido**: 16 imágenes de entrenamiento implican riesgo de sobreajuste a poses, iluminaciones y fondos presentes en el conjunto; la generalización a ángulos poco representados puede degradarse.
- **Caption genérico**: el uso de un único stub (`a photo of korean2 person`) limita el control semántico sobre atributos como ropa, expresión o edad; el prompt debe compensar esa falta de etiquetado.
- **Sesgo y derechos de imagen**: el modelo reproduce el rostro de una persona real (Gong Yoo). Su uso comercial o difamatorio puede vulnerar derechos de imagen y normativa de protección de datos, con independencia de la licencia del código y los pesos.
- **Riesgo de alucinación visual**: como todo modelo de difusión, puede generar anatomía incorrecta, manos deformes o artefactos en rostros y textiles, especialmente en resoluciones distintas de 1024 px o con prompts ambiguos.
- **Dependencia del modelo base**: el LoRA solo funciona correctamente sobre `stabilityai/stable-diffusion-xl-base-1.0`; no es portable a SD 1.5, SD 3, Flux ni a variantes refinadas sin pérdida de fidelidad.
- **Licencia**: Apache 2.0 cubre los pesos del adaptador, pero el uso del modelo base SDXL está sujeto a la CreativeML Open RAIL++-M, que impone restricciones adicionales de uso.
- **Sin métricas publicadas**: no hay evaluación cuantitativa de fidelidad, diversidad ni tasas de fallo, lo que dificulta estimar su robustez en producción.
- **Idiomas no declarados**: la respuesta del prompt a idiomas distintos del inglés no está documentada; se recomienda usar inglés para el condicionamiento de texto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Nekodeus/neko-korean2-sdxl-v1
- Modelo base: https://huggingface.co/stabilityai/stable-diffusion-xl-base-1.0
- Dataset de entrenamiento: https://huggingface.co/datasets/nekodeus/korean-top10-v2
- Script de entrenamiento kohya-ss: https://github.com/kohya-ss/sd-scripts
- Librería diffusers: https://github.com/huggingface/diffusers
- ComfyUI: https://github.com/comfyanonymous/ComfyUI
