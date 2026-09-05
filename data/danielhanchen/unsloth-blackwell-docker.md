# danielhanchen/unsloth-blackwell-docker

## Resumen

Este repositorio de HuggingFace contiene imágenes Docker preconstruidas de Unsloth, una biblioteca de fine-tuning de modelos de lenguaje de código abierto. Desarrollado por el equipo de Unsloth, ofrece dos imágenes: una «Studio» que incluye Unsloth Studio, JupyterLab y herramientas llama.cpp GGUF, y una «Base» solo para entrenamiento y CLI. Las imágenes están diseñadas para ejecutarse en cualquier GPU NVIDIA actual, desde Turing hasta Blackwell, sobre CUDA 12.8.1 y Ubuntu 24.04, con Python 3.12 y PyTorch 2.11.0. Relevante para desarrolladores e investigadores que necesitan un entorno reproducible para entrenar o ajustar modelos sin depender de una instalación manual.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Imagen Docker multi-stage basada en `nvidia/cuda:12.8.1-base-ubuntu24.04` |
| Parámetros totales | no disponible (no es un modelo de lenguaje) |
| Parámetros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje) |
| Tipos de cuantización | no disponible (la imagen incluye herramientas llama.cpp GGUF, pero no es un modelo cuantizado) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | GNU AGPL-3.0 |
| Formato de pesos | no disponible (la imagen contiene pesos de modelos descargados por el usuario, no se distribuyen pesos) |
| Tamaño de la imagen Studio | 10.526.693.105 B comprimido, 22.225.218.048 B sin comprimir |
| Tamaño de la imagen Base | 7.900.812.275 B comprimido, 15.933.907.456 B sin comprimir |
| GPU soportadas | `sm_75`, `sm_80`, `sm_86`, `sm_90`, `sm_100`, `sm_120` (Turing a Blackwell) |

## Arquitectura y entrenamiento

La imagen Docker está construida en dos variantes: una «Studio» que arranca Unsloth Studio en el puerto 8000 y JupyterLab en el 8888, y una «Base» que solo incluye entrenamiento y herramientas CLI, sin interfaz web. Ambas se basan en Ubuntu 24.04 con CUDA 12.8.1 y Python 3.12, e incorporan PyTorch 2.11.0+cu128, Triton 3.6.0, xformers 0.0.35, bitsandbytes 0.50.2, Unsloth 2026.9.2, Unsloth Zoo 2026.9.1, Transformers 5.16.1, TRL 0.24.0, PEFT 0.20.0, Accelerate 1.14.0, vLLM 0.26.0, Datasets 4.3.0 y JupyterLab 4.6.0. También se incluye un precompilado de llama.cpp (`b10796-mix-659e406`) para conversión a GGUF.

El build se realiza a partir de los commits indicados en la tabla de provenance, y la imagen incluye el guard de autenticación de la API de Unsloth Studio, que protege los endpoints de sistema y entrenamiento con sesión. Las imágenes fueron verificadas en una GPU NVIDIA B200 (`sm_100`).

## Capacidades

- Entrenamiento y fine-tuning de modelos de lenguaje con Unsloth, aprovechando técnicas de optimización como LoRA y QLoRA.
- Incluye Unsloth Studio, una interfaz web para entrenar y monitorizar experimentos (solo en la imagen Studio).
- Entorno JupyterLab preconfigurado para prototipado y notebooks (solo en la imagen Studio).
- Conversión de modelos a formato GGUF mediante llama.cpp precompilado con soporte CUDA 12.
- Soporte para arquitecturas de GPU de Turing a Blackwell, incluyendo SASS nativo para `sm_75`, `sm_80`, `sm_86`, `sm_90`, `sm_100` y `sm_120`.
- Integración con Transformers, TRL, PEFT y Accelerate para pipelines de entrenamiento estándar.
- Soporte de ejecución de modelos con vLLM 0.26.0 para inferencia de alto rendimiento.
- Capacidad de ejecutar scripts CLI sin entorno gráfico en la imagen Base.

## Casos de uso

- Fine-tuning de modelos open source en entornos corporativos: los equipos pueden cargar la imagen en un servidor con GPU NVIDIA y entrenar modelos como Llama, Mistral o Qwen sin instalar manualmente las dependencias.
- Prototipado rápido de experimentos con JupyterLab: los investigadores pueden usar la imagen Studio para ejecutar notebooks de Unsloth y explorar técnicas de ajuste fino en un entorno reproducible.
- Despliegue de pipelines de inferencia con vLLM: la imagen incluye vLLM preinstalado, lo que permite lanzar servidores de inferencia para modelos ajustados directamente desde el contenedor.
- Conversión de modelos a GGUF para ejecución en CPU o GPU con llama.cpp: la herramienta llama.cpp precompilada permite cuantizar y convertir modelos para usar en aplicaciones ligeras.
- Entrenamiento distribuido en clústeres con GPUs variadas: al incluir SASS para múltiples arquitecturas, la imagen puede ejecutarse en un parque heterogéneo de GPUs (por ejemplo, RTX 4090, A100 y B200) sin recompilar.
- Automatización de CI/CD para entrenamiento: la imagen Base permite integrar tareas de fine-tuning en pipelines de integración continua, sin necesidad de una interfaz web.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (la imagen no es un modelo; la VRAM requerida depende del modelo a entrenar o inferir).
- GPU recomendadas: cualquier GPU NVIDIA con arquitectura Turing (`sm_75`), Ampere (`sm_80`, `sm_86`), Ada (`sm_89`), Hopper (`sm_90`), Blackwell (`sm_100`) o posterior (`sm_120`). Verificado en NVIDIA B200.
- Compatibilidad con GPU de consumo: sí, las imágenes incluyen SASS para RTX 20, 30, 40 y 50 (según corresponda), pero el rendimiento depende del modelo y la VRAM disponible.
- Opciones de despliegue: Docker (`docker load`, `docker run`), compatible con Docker Engine que soporte `--gpus all`.
- Latencia y throughput: no disponible (no se proporcionan datos de rendimiento en la información disponible).

## Comparativa con modelos similares

No disponible. No se han identificado imágenes Docker comparables en la información proporcionada. El repositorio se distingue por ser una imagen preconstruida de Unsloth para GPUs NVIDIA modernas, pero no hay datos de comparación con otras distribuciones similares.

## Limitaciones y advertencias

- Licencia AGPL-3.0: cualquier uso, modificación o distribución de la imagen debe cumplir con los términos de la GNU Affero General Public License, lo que puede afectar a proyectos comerciales que requieran copyleft.
- Requiere GPU NVIDIA con drivers compatibles con CUDA 12.8.1; no incluye soporte para GPUs AMD o Intel.
- El repositorio tiene 55,2 GB de tamaño; las imágenes comprimidas son grandes (10,5 GB y 7,9 GB) y requieren espacio en disco sustancial.
- La imagen Studio se apaga automáticamente una hora después del arranque si no se cambia la contraseña de administrador, lo que puede interrumpir sesiones largas.
- Los endpoints de la API de Studio están protegidos por autenticación, pero si se exponen los puertos sin el aislamiento de loopback, las herramientas del servidor podrían ser accesibles desde la red.
- No es un modelo de lenguaje; no se deben esperar capacidades de generación de texto o razonamiento directamente de esta imagen, sino que sirve como entorno para entrenar y servir modelos.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/danielhanchen/unsloth-blackwell-docker
- Model card en HuggingFace: https://huggingface.co/danielhanchen/unsloth-blackwell-docker/blob/main/README.md
- Repositorio de Unsloth en GitHub: https://github.com/unslothai/unsloth
- Sitio web de Unsloth: https://unsloth.ai
- Pull request de construcción: https://github.com/unslothai/unsloth/pull/5748
