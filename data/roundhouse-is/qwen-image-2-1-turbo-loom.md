# roundhouse-is/Qwen-Image-2.1-Turbo-loom

## Resumen

Qwen-Image-2.1-Turbo-loom es un paquete de despliegue en formato Loom para el modelo de generación de imágenes Qwen-Image-2.1-Turbo, publicado por el usuario roundhouse-is. No se trata de un modelo entrenado desde cero, sino de un port nativo a AMD RDNA 4 (arquitectura gfx1201) de los pesos originales de Qwen/Qwen-Image-2.1-Turbo, empaquetados junto a kernels de tensor propios y una tarjeta `model.json` para servirse mediante `loom-serve` como endpoint compatible con la API de imágenes de OpenAI.

El sistema completo combina tres componentes: un codificador de texto Qwen3-VL-8B con caché KV de prefijo compartido, un transformer de difusión de 7B en configuración single-stream destilada a ocho pasos, y un decodificador VAE nativo en formato RGBA NHWC. Los pesos se leen sin modificar en BF16 desde el repositorio original de Qwen en la revisión `fc13ba1`, por lo que la calidad del modelo subyacente se preserva y el valor añadido está en el rendimiento sobre hardware AMD.

Su relevancia radica en que ofrece una alternativa de inferencia optimizada para GPUs AMD Radeon AI PRO R9700, con una aceleración medida de 5,65 veces frente a diffusers con offload en el mismo hardware, y con soporte nativo de transparencia alfa en las imágenes generadas. La licencia Apache 2.0 del paquete facilita su integración en productos comerciales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline text-to-image: codificador de texto Qwen3-VL-8B + transformer de difusión single-stream de 7B destilado + VAE decoder RGBA NHWC |
| Parametros totales | No disponible (el paquete no declara el recuento agregado; se documentan componentes de 8B y 7B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (el codificador de texto es Qwen3-VL-8B, sin longitud de contexto declarada en la información) |
| Tipos de cuantizacion | BF16 (pesos en coma flotante de 16 bits); no se documentan otras cuantizaciones |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Paquete Loom (`.loom` con kernels de tensor RDNA 4 y `model.json`); pesos BF16 y `tokenizer.json` leídos desde Qwen/Qwen-Image-2.1-Turbo, revisión `fc13ba1` |

## Arquitectura y entrenamiento

El paquete no incluye entrenamiento propio: reutiliza los pesos del modelo base Qwen-Image-2.1-Turbo, un pipeline de difusión que combina un codificador de texto multimodal Qwen3-VL-8B con un transformer de difusión de 7B en variante single-stream. La versión "Turbo" está destilada para generar imágenes en ocho pasos sin classifier-free guidance (`true_cfg_scale = 1.0`), lo que reduce drásticamente el coste computacional por imagen frente a pipelines de difusión convencionales de 20 a 50 pasos. El VAE decodifica directamente en RGBA con orden de canales NHWC, lo que permite generar transparencia alfa nativa sin postprocesado.

La innovación técnica del port reside en la implementación de kernels de tensor específicos para RDNA 4 (`amdgpu:gfx12-generic`), el uso de caché KV de prefijo compartido en el codificador de texto y una gestión de memoria con `--pool_backing=fixed` que reserva por adelantado los pesos BF16 residentes y los pools de ejecución (27,88 GiB en reposo, 30,51 GiB de pico a 1024x1024 sobre una GPU de 31,86 GiB). No se documentan en la información disponible los detalles del dataset de entrenamiento del modelo base, el número de tokens ni si hubo RLHF o DPO.

## Capacidades

- Generación de imágenes text-to-image a resoluciones configurables con múltiplos de 16 en el rango [64, 8192], incluyendo presets como 1024x1024, 768x1344, 512x512 y 256x256.
- Salida nativa en RGBA con canal alfa, útil para stickers, recortes y composición sobre fondos transparentes.
- Generación determinista: la misma semilla produce los mismos bytes de PNG.
- Tipografía en carteles y rótulos (signboard typography) y generación de diagramas, según los casos de prueba del informe de paridad.
- Servicio HTTP compatible con la API de OpenAI en `/v1/images/generations`, con endpoints auxiliares `/v1/status` y `/v1/models`.
- Control de semilla por petición y selección de geometría de salida mediante el parámetro `size`.
- No se documentan capacidades de tool calling, agentes, audio ni modos de razonamiento explícito; el modelo es exclusivamente de generación de imágenes.

## Casos de uso

- Generación de stickers y assets con transparencia: el VAE decodifica RGBA de forma nativa, de modo que un prompt como el del ejemplo (gato de cerámica con fondo transparente) produce un PNG con alfa en el rango [0, 255] sin necesidad de segmentación posterior.
- Producción de ilustraciones para marketing y contenido editorial: con 6,25 segundos por imagen a 1024x1024 en una R9700, un servidor puede generar lotes secuenciales de decenas de imágenes por hora para campañas o blogs.
- Generación de diagramas y carteles con texto: los casos de prueba del informe incluyen tipografía en rótulos y diagramas, lo que permite automatizar infografías sencillas a partir de descripciones textuales.
- Prototipado rápido de interfaces y mockups: la API compatible con OpenAI permite sustituir un backend en la nube por este servicio local sin cambiar el código cliente, manteniendo el formato de respuesta `b64_json`.
- Pipelines de aumento de datos sintéticos: la reproducibilidad por semilla y la salida determinista facilitan generar datasets de imágenes controlados y auditables para entrenamiento o evaluación.
- Despliegue en infraestructura AMD on-premise: organizaciones con GPUs Radeon AI PRO R9700 pueden servir generación de imágenes sin depender de CUDA ni de servicios externos, con un consumo medido de 1,67 kJ por imagen y 267,34 W de potencia media de placa.

## Benchmarks y rendimiento

Rendimiento medido en AMD Radeon AI PRO R9700 (gfx1201, 31,86 GiB), 1024x1024, 8 pasos, sin CFG, salida BF16 RGBA:

| Backend | Pesos | s/imagen (media) | s/imagen (p50) | Aceleración Loom | Listo en frío (s) | Warmup (s) | Energía GPU (kJ/img) | VRAM pico (GiB) | SHA-256 únicos (de 3) |
|---|---|---|---|---|---|---|---|---|---|
| Loom (este paquete), HTTP extremo a extremo | bf16 | 6,25 | 6,25 | - | 0,76 | 8,05 | 1,67 | 30,51 | 1/3 |
| diffusers (PyTorch ROCm, `--offload model`), HTTP extremo a extremo | bf16 | 35,34 | 35,98 | 5,65x | 9,95 | 67,79 | 3,09 | 17,27 | 2/3 |
| diffusers (PyTorch ROCm, `--offload none`), cómputo en proceso | bf16 | 6,72 (warm-8) / 7,36 (all-9) | - | 1,08x / 1,18x | - | - | - | 24,20 | - |

Precisión frente a diffusers bf16 (`QwenImage21Pipeline`) partiendo del mismo ruido inicial Philox4x32-10 en 12 casos (9 a 1024x1024 más 256x256, 512x512 y 768x1344):

| Backend | Casos | PSNR RGB | PSNR RGB mínimo | PSNR alfa | SSIM | Salida RGBA |
|---|---|---|---|---|---|---|
| Loom (este paquete) | 12 | 38,17 dB | 23,87 dB | 66,59 dB | 0,9901 | 12/12 |

No se midieron diffusers en fp32, LPIPS, CLIPScore, PickScore, stable-diffusion.cpp ni thenoise para este modelo.

## Requisitos de hardware

- VRAM estimada: 27,88 GiB en reposo con pesos BF16 residentes y 30,51 GiB de pico a 1024x1024 con `--pool_backing=fixed`.
- GPU objetivo: AMD Radeon AI PRO R9700 (gfx1201, RDNA 4, 31,86 GiB). El paquete declara soporte para otras GPUs RDNA 4 de 32 GB o más compatibles con `hrx-loom 0.3.0`, aunque no han sido probadas.
- RDNA 3 (gfx1151) no está soportado por esta compilación.
- No cabe en GPUs de consumo de 24 GB o menos en BF16 con esta configuración de memoria; no se documentan variantes cuantizadas que reduzcan el requisito.
- Despliegue: `pipx install "hrx-loom[hf]==0.3.0"`, descarga con `loom-fetch` y servicio con `loom-serve --device=rdna://0 --pool_backing=fixed --listen=127.0.0.1:8080 --model=qwen-image-2.1-turbo/model.json`.
- Latencia y throughput: 6,25 s por imagen a 1024x1024 en HTTP extremo a extremo, con 0,76 s hasta estar listo en frío y 8,05 s de warmup por petición; consumo de 1,67 kJ por imagen y 267,34 W de potencia media de placa.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen-Image-2.1-Turbo-loom (este paquete) | Codificador 8B + DiT 7B | No disponible | 6,25 s/imagen a 1024x1024 en R9700; PSNR RGB 38,17 dB frente a diffusers | Apache 2.0 | Hugging Face, orientado a AMD RDNA 4 |
| Qwen/Qwen-Image-2.1-Turbo (modelo base) | Codificador 8B + DiT 7B | No disponible | Referencia de paridad; ejecutable con diffusers en PyTorch ROCm a 35,34 s/imagen con offload | No disponible en la información | Hugging Face, revisión `fc13ba1` |
| diffusers + `QwenImage21Pipeline` (backend de referencia) | Mismos pesos | No disponible | 35,34 s/imagen con `--offload model`; 6,72 s/imagen en proceso sin offload | Apache 2.0 (diffusers) | PyPI, ROCm y CUDA |

No se dispone de datos de otros modelos comparables de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- El paquete solo está probado en AMD Radeon AI PRO R9700 (gfx1201); otras GPUs RDNA 4 de 32 GB o más no han sido validadas y RDNA 3 no está soportado.
- El requisito de VRAM (30,51 GiB de pico) excluye GPUs de consumo y limita el despliegue a hardware profesional de gama alta.
- La salida determinista se garantiza por semilla, pero la paridad con diffusers no es exacta: el PSNR RGB mínimo en los 12 casos de prueba es de 23,87 dB, lo que indica divergencias perceptibles en algunos casos.
- No se documentan sesgos conocidos del modelo base, riesgo de alucinación visual ni limitaciones idiomáticas en la información disponible.
- El modelo es exclusivamente text-to-image; no soporta tool calling, agentes ni otras modalidades.
- La licencia Apache 2.0 del paquete cubre el empaquetado, pero conviene verificar la licencia de los pesos originales de Qwen antes de un uso comercial, ya que no se declara en la información disponible.
- No se han publicado métricas LPIPS, CLIPScore ni PickScore para este modelo, por lo que la evaluación de calidad perceptiva frente a otros generadores queda pendiente.

## Enlaces

- Hugging Face del paquete: https://huggingface.co/roundhouse-is/Qwen-Image-2.1-Turbo-loom
- Modelo base: https://huggingface.co/Qwen/Qwen-Image-2.1-Turbo
- Repositorio Loom (ROCm/hrx-system): https://github.com/ROCm/hrx-system
- Repositorio diffusers: https://github.com/huggingface/diffusers
- Informe de paridad y prompts: REPORT.md (referenciado en la model card del repositorio)
