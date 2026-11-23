# loom-fun-staging/black-forest-labs-FLUX.2-klein-4B-loom

## Resumen

FLUX.2 [klein] 4B para AMD Loom es un paquete de despliegue (programas `.loom` y una tarjeta `model.json`) que empaqueta el checkpoint BF16 sin modificar `black-forest-labs/FLUX.2-klein-4B` para ejecutarse sobre la plataforma Loom de AMD. El modelo subyacente es un generador texto-a-imagen de Black Forest Labs compuesto por un codificador de texto Qwen3, un transformer de difusión destilado de cuatro pasos y un decodificador VAE. Este paquete concreto lo publica el espacio de staging `loom-fun-staging` y se sirve mediante `loom-serve` como endpoint compatible con la API de OpenAI `/v1/images/generations`.

La relevancia de esta ficha no reside en un nuevo modelo generativo, sino en la capa de ejecución: demuestra que FLUX.2 [klein] 4B puede correr en hardware AMD integrado (Ryzen AI Max+ 395 "Strix Halo", gfx1151) con una aceleración considerable frente a alternativas como stable-diffusion.cpp o diffusers. Según los datos del autor, Loom genera una imagen de 1024×1024 en 7,1 segundos, frente a 32,6 s de stable-diffusion.cpp con ROCm y 94,3 s de diffusers bf16.

El paquete fue validado con las versiones 0.2.0 y 0.3.0 del SDK hrx-loom, con resultados idénticos a nivel de píxel entre peticiones y entre versiones. Está publicado bajo licencia Apache 2.0 y tiene cero descargas y cero likes en el momento de la consulta, lo que indica que es un artefacto de staging más que una distribución estable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusion (DiT) destilado de 4 pasos + codificador de texto Qwen3 + decodificador VAE |
| Parametros totales | 4B (denominacion del checkpoint base; desglose por componente no disponible) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | BF16 en el checkpoint empaquetado; INT8-ConvRot disponible en un wrap externo de ComfyUI (`wraps/FLUX.2-klein-4B-INT8-ConvRot-ComfyUI`) |
| Idiomas soportados | No disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | Paquete `.loom` (programas) + `model.json`; pesos subyacentes en BF16 (safetensors, presumiblemente, no confirmado) |

## Arquitectura y entrenamiento

El modelo base es un pipeline de difusión texto-a-imagen con tres componentes: un codificador de texto Qwen3 que convierte el prompt en embeddings, un transformer de difusión (DiT) destilado que genera la imagen en solo cuatro pasos de denoising sin classifier-free guidance, y un VAE que decodifica el latente a píxeles RGB. La destilación a cuatro pasos es la innovación clave: reduce drásticamente el coste de inferencia frente a los 20-50 pasos típicos de modelos de difusión no destilados, a costa de cierta pérdida de fidelidad respecto a la referencia fp32 (PSNR de 25,69 y LPIPS de 0,068 frente a diffusers fp32).

El paquete Loom no modifica el checkpoint: usa los mismos programas y revisiones que la instantánea de producción en `loom-fun/black-forest-labs-FLUX.2-klein-4B-loom`. La contribución técnica es la ejecución nativa sobre AMD gfx1151 mediante `loom-serve`, que expone un endpoint compatible con OpenAI. No hay información sobre el dataset de entrenamiento, el número de tokens, ni si hubo RLHF o DPO; el autor solo documenta el proceso de portabilidad y los resultados de rendimiento.

## Capacidades

- Generación de imágenes texto-a-imagen a 1024×1024 y geometrías alternativas (por ejemplo, 768×1344).
- Generación determinista por semilla: la misma semilla produce la misma imagen.
- Endpoint compatible con OpenAI `/v1/images/generations`, con respuesta en `b64_json`.
- Endpoints de gestión: `GET /v1/status` para progreso de carga y `GET /v1/models` para listar el modelo cuando está listo.
- Presets de tamaño predefinidos (`:image` selecciona el preset de 1024×1024).
- Inferencia en cuatro pasos sin classifier-free guidance, lo que reduce latencia.
- Soporte de ejecución en GPU AMD integrada (gfx1151) mediante el backend `--device=amdgpu`.
- No se documentan capacidades de tool calling, agentes, visión de entrada, audio ni modo thinking; es exclusivamente texto-a-imagen.

## Casos de uso

- Generación de imágenes en hardware AMD integrado: el paquete permite ejecutar FLUX.2 [klein] 4B en un Ryzen AI Max+ 395 sin GPU discreta, con 7,1 s por imagen a 1024×1024, lo que lo hace viable para prototipado local en estaciones de trabajo con gráficos integrados.
- Servicio de imágenes compatible con OpenAI: al exponer `/v1/images/generations`, se puede integrar como backend drop-in en aplicaciones que ya usan el SDK de OpenAI para generación de imágenes, sin cambiar el código cliente.
- Pruebas de concepto de pipelines de difusión en ROCm: sirve para validar flujos de texto-a-imagen sobre la pila ROCm de AMD antes de migrar a producción, gracias a su integración con `loom-serve` y `hrx-loom`.
- Generación reproducible de assets: la determinismo por semilla y la consistencia entre peticiones (tres peticiones idénticas a nivel de píxel en la validación) lo hacen adecuado para generar variaciones controladas de ilustraciones en entornos de diseño.
- Benchmarking de backends de inferencia: el paquete incluye comparativas con stable-diffusion.cpp, thenoise y diffusers, por lo que puede usarse como referencia para medir el rendimiento de nuevas versiones del SDK Loom o de otros runtimes en gfx1151.
- Evaluación de calidad frente a referencias PyTorch: con métricas PSNR y LPIPS contra diffusers fp32 y bf16, es útil para estudiar la deriva numérica de implementaciones nativas frente a la referencia.
- Docencia y experimentación con modelos destilados: el bajo coste de inferencia (cuatro pasos, sin CFG) permite iterar rápidamente en entornos académicos con hardware AMD.

## Benchmarks y rendimiento

Rendimiento en Strix Halo (gfx1151), 1024×1024, 4 pasos, sin classifier-free guidance, segundos por imagen de extremo a extremo:

| Backend | s/imagen | Aceleración Loom | CLIPScore | PickScore |
|---|---:|---:|---:|---:|
| Loom (este paquete) | 7,1 | — | 27,83 | 23,303 |
| stable-diffusion.cpp ROCm via Lemonade | 32,6 | 4,6× | 28,83 | 23,206 |
| stable-diffusion.cpp Vulkan via Lemonade | 52,2 | 7,4× | 29,63 | 23,039 |
| thenoise (PyTorch) ROCm via Lemonade | 8,9 | 1,25× | 28,96 | 23,323 |
| diffusers bf16 PyTorch ROCm | 94,3 | 13,3× | 28,32 | 23,302 |
| diffusers fp32 PyTorch ROCm | 587,5 | 83× | 28,06 | 23,230 |

Calidad frente a la referencia PyTorch (mismos prompts y mismo ruido inicial):

| Backend | PSNR vs diffusers fp32 | LPIPS vs diffusers fp32 | LPIPS vs diffusers bf16 |
|---|---:|---:|---:|
| Loom (este paquete) | 25,69 | 0,068 | 0,050 |
| diffusers bf16 | 25,79 | 0,065 | referencia |

Tiempos de calificación del SDK (Strix Halo):

| SDK | Primera petición | Mediana de dos peticiones en caliente |
|---|---:|---:|
| 0.2.0 | 7,046 s | 5,807 s |
| 0.3.0 | 6,851 s | 5,778 s |

Variantes de thenoise en proceso (sin Lemonade ni HTTP):

| Variante | s/imagen | Aceleración Loom |
|---|---:|---:|
| bf16 eager (configuración de Lemonade) | 8,38 | 1,18× |
| bf16 con `torch.compile` | 7,50 | 1,06× |
| INT8-ConvRot eager | 8,71 | 1,23× |
| INT8-ConvRot con `torch.compile` | 7,58 | 1,07× |

Metodología: HP ZBook Ultra G1a, AMD Ryzen AI Max+ PRO 395 con Radeon 8060S (gfx1151), 128 GB con 32 GB reservados para GPU, Windows 11 Enterprise, driver AMD 32.0.31036.15. hrx-loom 0.2.0, Lemonade v2026.44.1, stable-diffusion.cpp master-957-90e86d1, thenoise 0.15.0 sobre TheRock ROCm 10.1.0, diffusers `Flux2KleinPipeline` sobre PyTorch ROCm. Ocho prompts fijos y semillas 0, 42 y otras.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Rendimiento (1024×1024) |
|---|---|---|---|---|---|
| FLUX.2 [klein] 4B (este paquete Loom) | 4B | No disponible | Apache 2.0 | `.loom` + `model.json` | 7,1 s/imagen en gfx1151 |
| FLUX.2 [klein] 4B (diffusers bf16) | 4B | No disponible | Apache 2.0 | safetensors | 94,3 s/imagen en gfx1151 |
| FLUX.2 [klein] 4B (stable-diffusion.cpp ROCm) | 4B | No disponible | Apache 2.0 | GGUF (presumible) | 32,6 s/imagen en gfx1151 |
| FLUX.2 [klein] 4B (thenoise PyTorch) | 4B | No disponible | Apache 2.0 | PyTorch | 8,9 s/imagen en gfx1151 |

La comparativa relevante es entre backends del mismo checkpoint, no entre modelos distintos. No se dispone de datos de otros modelos texto-a-imagen de 4B comparables en la información proporcionada.

## Limitaciones y advertencias

- Artefacto de staging: cero descargas y cero likes; no es una distribución estable ni auditada por la comunidad.
- Dependencia de hardware específico: validado únicamente en AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) con Windows 11; no hay evidencia de funcionamiento en otras GPU o sistemas operativos.
- Deriva numérica frente a la referencia: PSNR de 25,69 y LPIPS de 0,068 frente a diffusers fp32, lo que implica diferencias perceptibles en la salida.
- Calidad de imagen inferior a stable-diffusion.cpp en CLIPScore (27,83 frente a 28,83 y 29,63) y ligeramente inferior a thenoise en PickScore (23,303 frente a 23,323).
- Licencia Apache 2.0 permite uso comercial, pero el paquete depende del checkpoint base de Black Forest Labs, cuyos términos deben verificarse por separado.
- No se documentan sesgos, idiomas soportados ni comportamiento multilingüe del codificador Qwen3 en este contexto.
- Riesgo de alucinación visual y de artefactos propios de modelos de difusión destilados a cuatro pasos; no hay evaluación cualitativa publicada más allá de las métricas automáticas.
- El listener HTTP arranca antes de que el modelo esté listo; es necesario consultar `/v1/status` para conocer el progreso de carga.
- Sin soporte documentado de tool calling, agentes ni entrada multimodal; es exclusivamente texto-a-imagen.

## Enlaces

- [Hugging Face: loom-fun-staging/black-forest-labs-FLUX.2-klein-4B-loom](https://huggingface.co/loom-fun-staging/black-forest-labs-FLUX.2-klein-4B-loom)
- [Checkpoint base: black-forest-labs/FLUX.2-klein-4B](https://huggingface.co/black-forest-labs/FLUX.2-klein-4B)
- [Instantánea de producción](https://huggingface.co/loom-fun/black-forest-labs-FLUX.2-klein-4B-loom/tree/b21b10a168c368d67303fea32f5dbc5f6398375e)
- [Repositorio Loom (ROCm/hrx-system)](https://github.com/ROCm/hrx-system)
- [Pull request en ROCm/hrx-loom-library](https://github.com/ROCm/hrx-loom-library/pull/126)
- [Sitio del ecosistema Loom](https://loom-fun.github.io/loom-dev/)
- [Evidencia DevLab](https://github.com/loom-fun/loom-skills/actions/runs/45253984158/job/137970780518)
- [stable-diffusion.cpp](https://github.com/leejet/stable-diffusion.cpp)
- [thenoise](https://github.com/lemonade-sdk/thenoise)
- [Lemonade](https://github.com/lemonade-sdk/lemonade)
- [diffusers](https://github.com/huggingface/diffusers)
- [Wrap INT8-ConvRot para ComfyUI](https://huggingface.co/wraps/FLUX.2-klein-4B-INT8-ConvRot-ComfyUI)
