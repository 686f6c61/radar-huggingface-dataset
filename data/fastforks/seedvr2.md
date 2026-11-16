# fastforks/seedvr2

## Resumen

SeedVR2 es un modelo de restauración y superresolución de imagen y vídeo desarrollado por ByteDance Seed (Wang et al., 2025). Se basa en un diffusion transformer (NaDiT) post-entrenado de forma adversarial que opera sobre los latentes de un VAE 3-D causal, lo que permite restaurar fotogramas en un solo paso de difusión. Existen dos variantes del transformer, de 3 B y 7 B de parámetros, que comparten el mismo VAE.

El repositorio `fastforks/seedvr2` no aloja pesos: es una model card de integración para la librería `fastforks`, que descarga los pesos originales de los repos del autor y los verifica mediante SHA-256. La API expuesta es de imagen a imagen: recibe una imagen RGB y devuelve la imagen restaurada y reescalada por un factor `model.scale`, procesando un fotograma por llamada.

Es relevante porque ofrece restauración generativa de alta calidad con una sola evaluación del transformer (frente a los pipelines de difusión multi-paso), con licencia Apache-2.0 en los pesos convertidos y con backend `portable` y `kernels` que aceleran la inferencia aproximadamente 5,7x respecto al código original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion transformer (NaDiT) sobre latentes de un VAE 3-D causal; post-entrenamiento adversarial |
| Parametros totales | 3 B (`seedvr2-3b`) y 7 B (`seedvr2-7b`); VAE compartido (tamaño no disponible) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de imagen; procesa un fotograma por llamada) |
| Tipos de cuantizacion | bf16 (pesos publicados); fp16 y fp32 en ejecución según backend |
| Idiomas soportados | no disponible (modelo de imagen, sin interfaz de texto) |
| Licencia | Apache-2.0 (código y pesos convertidos) |
| Formato de pesos | safetensors (bf16) |

## Arquitectura y entrenamiento

SeedVR2 combina un VAE 3-D causal que comprime el vídeo o la imagen a latentes con un diffusion transformer (NaDiT) que realiza la restauración en un único paso. El transformer se post-entrena de forma adversarial sobre grandes volúmenes de datos de imagen y vídeo con degradaciones sintéticas, según el paper arXiv 2506.05301. La variante de imagen de esta integración no utiliza el modo de clip del original (atención temporal sobre 4n + 1 fotogramas): restaura fotograma a fotograma.

La integración de fastforks incluye dos backends: `portable` (PyTorch puro) y `kernels` (kernels optimizados publicados en `fastforks/kernels`). Ambos producen resultados equivalentes (misma latencia en las pruebas: 2295 ms para 512x512 con `seedvr2-3b`). La paridad con el código original se verifica en CPU float32 (max |diff| <= 0.02) y en GPU bfloat16 (mean |diff| <= 0.01, p99 <= 0.05). El ruido de la posterior del VAE y el ruido de difusión se generan con un generador de CPU y semilla configurable (por defecto 666).

## Capacidades

- Restauración de imagen: eliminación de ruido, artefactos de compresión y degradaciones, con salida reescalada por `model.scale`.
- Superresolución de imagen: aumento de resolución con generación de detalles plausibles.
- Procesamiento por tiles: el parámetro `tile=` permite ejecutar imágenes grandes en teselas solapadas, al estilo de ComfyUI.
- Entrada de tamaño arbitrario: cualquier H x W >= 8, con padding a múltiplo de 8.
- Salida RGB en [0, 1] con las mismas dimensiones que la entrada multiplicadas por la escala.
- Backends intercambiables (`portable`, `kernels`) con verificación de integridad de pesos por SHA-256.
- No soporta tool calling, agentes, texto ni otros idiomas: es exclusivamente un modelo de imagen a imagen.

## Casos de uso

- Restauración de fotografías antiguas o dañadas: el modelo elimina ruido y artefactos y reconstruye detalles de forma generativa; conviene fijar la semilla para reproducibilidad.
- Mejora de imágenes de baja resolución en archivos digitales: la superresolución con `model.scale` permite generar versiones de mayor tamaño para catalogación o impresión.
- Limpieza de fotogramas extraídos de vídeo: al procesar un fotograma por llamada, se puede aplicar a secuencias fotograma a fotograma en pipelines de postproducción.
- Preprocesado para pipelines de visión por computador: restaurar imágenes degradadas antes de pasarlas a detectores o clasificadores puede mejorar su entrada.
- Restauración de capturas o renders con compresión agresiva: útil en flujos de trabajo de contenido web o videojuegos donde los assets llegan con artefactos.
- Procesamiento por teselas de imágenes de gran tamaño: con `tile=` se pueden restaurar imágenes que no caben en memoria en una sola pasada, manteniendo solapamiento entre teselas.

## Benchmarks y rendimiento

Datos medidos en RTX 5060 Ti 16 GB (sm_120), fp16, entrada sintética 512x512:

| Modelo / backend | Tiempo (ms) | Memoria pico asignada / reservada (MiB) |
|---|---|---|
| `seedvr2-3b` original | 13150 | 7598 / 15268 |
| `seedvr2-3b` portable | 2295 | 6140 / 6772 |
| `seedvr2-3b` kernels | 2295 | 6140 / 6772 |
| `seedvr2-7b` portable | no disponible (OOM en las pruebas) | no disponible |

| Modelo | Carga (s) original / portable / kernels | Primera llamada (s) original / portable / kernels |
|---|---|---|
| `seedvr2-3b` | 96,20 / 4,88 / 4,90 | 13,89 / 2,49 / 2,50 |

`torch.compile` no se completó (build > 5 min) y TensorRT fp16 no se ejecutó (ONNX no instalado en el entorno de pruebas). No se han publicado resultados de benchmarks de calidad (PSNR, SSIM, LPIPS) en la información disponible.

## Requisitos de hardware

- VRAM estimada: `seedvr2-3b` a 512x512 consume 6140 MiB asignados y 6772 MiB reservados en el backend portable/kernels; el original reserva 15268 MiB.
- `seedvr2-7b` a 512x512 provocó OutOfMemoryError en el backend `compile` sobre una RTX 5060 Ti de 16 GB; los datos de memoria para 7b en portable no están disponibles.
- GPU probada: RTX 5060 Ti 16 GB (sm_120). GPU recomendadas: no disponibles en la información proporcionada; por el consumo medido, una GPU consumer de 16 GB es suficiente para `seedvr2-3b` a 512x512.
- Cabe en GPU consumer: sí para `seedvr2-3b` en 16 GB; para `seedvr2-7b` no hay confirmación.
- Opciones de despliegue: librería `fastforks` con backends `portable` y `kernels`; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia: 2295 ms por imagen 512x512 con `seedvr2-3b` en RTX 5060 Ti; primera llamada 2,49-2,50 s y carga 4,88-4,90 s con los backends de fastforks.

## Comparativa con modelos similares

| Modelo | Parámetros | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|
| SeedVR2 (fastforks) | 3 B / 7 B | Diffusion transformer + VAE 3-D | Apache-2.0 | Pesos vía repos del autor; integración en fastforks |
| StableSR | no disponible | Modelo de restauración basado en difusión | no disponible | Referenciado en la model card (reconstrucción wavelet) |
| Alternativas de superresolución | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos comparativos de rendimiento con otros modelos de restauración en la información proporcionada.

## Limitaciones y advertencias

- Restauración generativa: la salida depende de `seed`; semillas distintas producen detalles plausibles distintos. Para resultados reproducibles hay que fijar la semilla (por defecto 666).
- Un fotograma por llamada: no se usa el modo de clip del original (atención temporal sobre 4n + 1 fotogramas); no hay coherencia temporal entre fotogramas procesados por separado.
- El padding se aplica abajo y a la derecha (replicate) hasta que la escala x tamaño sea múltiplo de 16, y luego se recorta; el original hace center-crop, por lo que los resultados en bordes pueden diferir.
- No hay corrección de color: los scripts del autor aplican opcionalmente coincidencia de color con reconstrucción wavelet de StableSR, que esta integración no incluye.
- Los datos de entrenamiento y sus términos no se detallan en el paper; posibles sesgos derivados de las fuentes no declaradas.
- La model card indica "research-use package" para las cadenas del código original; aunque los pesos convertidos se distribuyen como Apache-2.0, conviene revisar `LICENSE` y `NOTICE` antes de uso comercial.
- El repositorio no aloja pesos: depende de la descarga desde los repos del autor y de la verificación de los SHA-256 indicados.

## Enlaces

- Model card en Hugging Face: https://huggingface.co/fastforks/seedvr2
- Pesos `seedvr2-3b`: https://huggingface.co/fastforks/seedvr2-3b-bf16
- Pesos `seedvr2-7b`: https://huggingface.co/fastforks/seedvr2-7b-bf16
- Pesos VAE: https://huggingface.co/fastforks/seedvr2-vae-bf16
- Kernels: https://huggingface.co/fastforks/kernels
- Código de fastforks: https://github.com/kleinicke/fastforks
- Benchmarks: https://github.com/kleinicke/fastforks/blob/main/docs/benchmarks.md
- Paper (arXiv 2506.05301): https://arxiv.org/abs/2506.05301
- Código original de ByteDance-Seed: https://github.com/ByteDance-Seed/SeedVR (commit e4de8c24441a)
- Licencia del original: https://github.com/ByteDance-Seed/SeedVR/blob/e4de8c24441a67e1b7df56abea10645059bb1185/LICENSE
- Repo original SeedVR2-3B: https://huggingface.co/ByteDance-Seed/SeedVR2-3B
