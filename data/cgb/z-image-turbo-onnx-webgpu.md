# cgb/z-image-turbo-onnx-webgpu

## Resumen

Z-Image Turbo ONNX for WebGPU es una conversión a ONNX del modelo de difusión texto-a-imagen Tongyi-MAI/Z-Image-Turbo, desarrollado por el equipo Tongyi-MAI de Alibaba y publicado bajo licencia Apache 2.0. Esta versión, mantenida por el usuario cgb, reempaqueta los pesos originales para que puedan ejecutarse íntegramente en un navegador web mediante WebGPU y ONNX Runtime Web, sin necesidad de servidor ni backend de Python. Es la build que descarga el estudio Imagine de freegen.ai.

El modelo consta de tres grafos: un codificador de texto basado en Qwen3-4B truncado a 35 capas y cuantizado a int4 (2,5 GB), un denoiser de 6,15B parámetros cuantizado a int8 con matmuls DP4A (6,0 GB) y un decodificador VAE estilo FLUX.1 en fp32 (0,2 GB). El repositorio ocupa 9,3 GB y los pesos están fragmentados en shards de menos de 2 GiB porque los navegadores no pueden mantener buffers individuales mayores.

Su relevancia radica en que demuestra inferencia de difusión de alta calidad directamente en el cliente: en una RTX 5090 con Chrome, una imagen de 512 px tarda aproximadamente 1,5 segundos una vez cargados los modelos, con una fidelidad de 16,6 a 22,7 dB PSNR frente al pipeline original en PyTorch bf16 con las mismas semillas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusion texto-a-imagen con denoiser transformer (6,15B), codificador de texto Qwen3-4B truncado y VAE decoder estilo FLUX.1 |
| Parametros totales | No disponible de forma agregada; denoiser 6,15B, text encoder Qwen3-4B (35 capas) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (caption truncado/padeado a multiplo de 32) |
| Tipos de cuantizacion | int4 (block 128) en text encoder; int8 (block 128, DP4A) en denoiser; fp32 en VAE y activaciones del text encoder |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (grafos sharded en ficheros `.onnx` + `.data` + `manifest.json`) |

## Arquitectura y entrenamiento

La build sigue la arquitectura del Z-Image-Turbo original de Tongyi-MAI: un pipeline de difusion con codificador de texto, denoiser transformer y decodificador VAE. El codificador de texto es Qwen3-4B truncado a las 35 capas que el pipeline realmente lee (`hidden_states[-2]`), con la normalizacion final eliminada y ejecutado en fp32 porque la capa 35 produce valores fuera del rango de fp16. El denoiser se envuelve para una sola imagen: caption padeado a multiplo de 32, pad mask, position ids como entradas y embeddings rotatorios expresados como cos y sin reales. Las proyecciones de salida de atencion y feed-forward se dividen por 32 para evitar desbordamiento en fp16, ya que cada salida alimenta solo un RMSNorm y el resultado numerico no cambia. La entrada de timestep es fp32.

El muestreo utiliza 8 pasos Euler sobre el schedule estatico shift-3 del scheduler, equivalente a los 9 pasos del original (el ultimo corre a sigma 0). No se dispone de informacion sobre el dataset de entrenamiento original, numero de tokens, composicion ni si hubo RLHF o DPO; esos datos corresponden al modelo base Tongyi-MAI/Z-Image-Turbo y no se detallan en esta conversion. La innovacion tecnica destacable es la fragmentacion de pesos por debajo de 2 GiB, el uso de matmuls DP4A para int8 y la atencion por chunks, todo orientado a las restricciones de memoria y computo de WebGPU en el navegador.

## Capacidades

- Generacion de imagenes a partir de descripciones textuales (text-to-image) en el navegador.
- Ejecucion integra en cliente mediante WebGPU y ONNX Runtime Web, sin backend remoto.
- Cuantizacion mixta int4/int8 con precision suficiente para comparar contra el pipeline PyTorch bf16 (16,6 a 22,7 dB PSNR).
- Carga por shards compatible con las limitaciones de buffer de los navegadores.
- No se documenta soporte de tool calling, function calling, agentes ni razonamiento multi-paso.
- No se documenta soporte multilingue explicito; los idiomas no estan disponibles en la informacion.
- No se documentan modos especiales como thinking, vision de entrada, audio ni edicion de imagen.

## Casos de uso

- Generacion de imagenes en aplicaciones web sin backend: el modelo se descarga y ejecuta en el navegador del usuario, eliminando costes de GPU en servidor y la necesidad de gestionar colas de inferencia.
- Herramientas creativas integradas en el navegador: estudios como freegen.ai/imagine pueden ofrecer generacion de imagenes con latencias de aproximadamente 1,5 s en hardware de gama alta (RTX 5090 con Chrome) una vez cargados los modelos.
- Prototipado rapido de pipelines de difusion: los scripts de exportacion (`scripts/zimage-export.py`, `scripts/zimage-build.sh`) permiten reproducir y adaptar la conversion ONNX para otras variantes o hardware.
- Demos y educacion: al ejecutarse en WebGPU, sirve para mostrar difusion en el cliente en entornos docentes o articulos tecnicos sin infraestructura de servidor.
- Aplicaciones con requisitos de privacidad: al no enviar el prompt ni la imagen a un servidor, el contenido generado permanece en el dispositivo del usuario.
- Validacion de fidelidad de cuantizacion: la comparacion PSNR contra PyTorch bf16 permite evaluar el impacto de int4/int8 en la calidad final dentro de un pipeline de investigacion.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| PSNR frente a PyTorch bf16 (mismas semillas) | 16,6 a 22,7 dB |
| Latencia, 512 px, RTX 5090 + Chrome | ~1,5 s con modelos cargados |
| Pasos de muestreo | 8 Euler (schedule shift-3) |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible; estos no aplican a un modelo de generacion de imagenes.

## Requisitos de hardware

- VRAM estimada: los pesos suman aproximadamente 8,7 GB (2,5 GB text encoder + 6,0 GB denoiser + 0,2 GB VAE); se requiere un dispositivo con WebGPU y memoria suficiente para mantener los shards activos.
- GPU recomendadas: RTX 5090 verificada en Chrome; se espera funcionamiento en GPUs con soporte WebGPU solido (serie RTX 40/50, AMD RDNA 3+), aunque no se documentan pruebas en otras.
- Cabe en GPU consumer de gama alta; no se documenta comportamiento en GPUs de gama media o integradas.
- Opciones de despliegue: ONNX Runtime Web con WebGPU en navegador; los grafos ONNX podrian ejecutarse tambien con otros runtimes ONNX, pero no se documenta.
- Latencia y throughput: ~1,5 s por imagen de 512 px en RTX 5090 con Chrome una vez cargados los modelos; el tiempo de carga inicial no se detalla.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| cgb/z-image-turbo-onnx-webgpu | Denoiser 6,15B + Qwen3-4B truncado | No disponible | Apache 2.0 | ONNX para WebGPU |
| Tongyi-MAI/Z-Image-Turbo | No disponible | No disponible | Apache 2.0 | Pesos originales (PyTorch) |
| FLUX.2 Klein (build del sitio freegen.ai) | No disponible | No disponible | No disponible | No disponible |

La comparativa con alternativas de la misma categoria (otros modelos texto-a-imagen ejecutables en navegador) no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- Es una conversion no oficial: los pesos fueron modificados (truncado del text encoder, division de proyecciones, cuantizacion) y nada aqui es un release oficial de Tongyi-MAI.
- La cuantizacion int4/int8 introduce diferencias medibles frente al original (16,6 a 22,7 dB PSNR), lo que puede afectar al detalle fino y a la fidelidad del prompt.
- Los pesos estan fragmentados en shards de menos de 2 GiB por limitaciones de buffer del navegador; la gestion de shards anade complejidad de carga.
- Requiere un navegador con WebGPU funcional y hardware grafico compatible; el rendimiento en GPUs no verificadas es desconocido.
- No se documentan sesgos conocidos, riesgos de alucinacion visual ni limitaciones de idioma; los idiomas soportados figuran como no disponibles.
- Licencia Apache 2.0 permite uso comercial, pero al ser una modificacion de pesos ajenos conviene revisar los terminos del modelo base Tongyi-MAI/Z-Image-Turbo.
- El tiempo de carga inicial de los modelos en el navegador no se detalla y puede ser significativo dado el tamano del repositorio (9,3 GB).

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/cgb/z-image-turbo-onnx-webgpu
- Modelo base: https://huggingface.co/Tongyi-MAI/Z-Image-Turbo
- Demo/estudio Imagine: https://freegen.ai/imagine
- Scripts de build citados en la model card: `scripts/zimage-export.py`, `scripts/zimage-build.sh`, `src/freegen/zimage.js` (en el codigo fuente de FreeGen; no se proporciona URL directa)
