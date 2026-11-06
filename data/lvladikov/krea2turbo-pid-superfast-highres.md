# lvladikov/Krea2Turbo-PiD-SuperFast-HighRes

## Resumen

Krea2Turbo-PiD-SuperFast-HighRes es un paquete de workflows para ComfyUI, publicado por el usuario lvladikov (Lachezar Vladikov), que combina dos modelos en un pipeline de generación de imágenes en dos etapas: Krea 2 Turbo (modelo de difusión texto-a-imagen de Krea) y PiD, el Pixel Diffusion Decoder de NVIDIA. El repositorio no contiene pesos de un modelo propio, sino los ficheros JSON de workflow, un script de Python y 100 imágenes de ejemplo con sus prompts; el peso real (1,1 GB) corresponde a esos artefactos auxiliares.

El objetivo es acelerar la generación de imágenes de alta resolución. Krea 2 Turbo renderiza un borrador pequeño (por defecto 512×896, es decir, 1.792 tokens de imagen) en 4 pasos con un LoRA de destilación de 4 pasos, y PiD amplía ese latente directamente a 4× su anchura y altura (2048×3584, 28.672 tokens) en 4 pasos más, sin decodificación VAE ni upscaler separado. La ventaja es que el modelo grande solo procesa 1/16 de los píxeles de la salida final.

Es relevante ahora porque demuestra una vía práctica para reducir el coste computacional de la difusión a alta resolución, apoyándose en un decoder de difusión en espacio de píxeles en lugar del clásico VAE + superresolución. El autor reporta que en una RTX 5090 el decode de PiD a 2048×3584 tarda 3,3 s y que los 8 pasos nativos de Krea 2 Turbo solo añaden 0,4 s frente a los 4 pasos del LoRA.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Pipeline de dos etapas: difusión latente (Krea 2 Turbo) + decoder de difusión en espacio de píxeles (PiD de NVIDIA) |
| Parámetros totales | No disponible (el repo no aloja pesos de modelo; Krea 2 Turbo en bf16 ocupa 26,3 GB) |
| Parámetros activos | No disponible |
| Longitud de contexto | No disponible (no aplica; el texto se codifica con Qwen3-VL 4B para Krea 2 y Gemma 2 2B para PiD) |
| Tipos de cuantización | bf16, fp8_scaled, nvfp4 (Krea 2); bf16 e int8_convrot (PiD); fp8_scaled (text encoders) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (los pesos se descargan de repositorios externos); workflows en JSON; script en Python |

## Arquitectura y entrenamiento

El pipeline encadena dos modelos de difusión. La primera etapa es Krea 2 Turbo, un modelo texto-a-imagen de Krea que en este repo se usa con un LoRA de destilación de rango 64 entrenado por el autor para reducir la generación a 4 pasos (existe también un LoRA de 3 pasos, aún en entrenamiento). El texto se codifica con Qwen3-VL 4B en bf16 (8,9 GB) y el latente pequeño se decodifica con el VAE de Qwen-Image (0,3 GB) solo para la previsualización. La segunda etapa es PiD (Pixel Diffusion Decoder) de NVIDIA, un decoder de difusión que opera en espacio de píxeles, guiado por el latente pequeño y el prompt, y que genera directamente la imagen a 4× de resolución en 4 pasos; usa su propio text encoder Gemma 2 2B IT y el VAE `pixel_space` integrado en ComfyUI.

No se detallan en la información disponible los datos de entrenamiento de Krea 2 Turbo ni de PiD (número de tokens, composición del dataset, uso de RLHF/DPO). La innovación técnica destacable es la sustitución del par VAE + upscaler por un decoder de difusión en píxeles, que evita el coste de decodificar y remuestrear la imagen completa y permite que el modelo generativo principal trabaje a 1/16 de los píxeles de la salida.

## Capacidades

- Generación de imágenes texto-a-imagen de alta resolución (por defecto 512×896 → 2048×3584).
- Generación rápida en pocos pasos: 4 pasos con el LoRA de 4 pasos, 3 con el de 3 pasos, 8 sin LoRA.
- Ampliación 4× integrada mediante PiD, sin upscaler externo ni decodificación VAE de la imagen final.
- Tamaños flexibles: el autor indica que "cualquier tamaño funciona", configurable en el nodo "0 · Size and steps".
- Previsualización del borrador de Krea 2 mientras se genera la salida final de PiD.
- Integración con ComfyUI mediante nodos core y con Comfy Cloud.
- Ejecución alternativa en Python con diffusers y el código de PiD.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking.

## Casos de uso

- Generación de arte conceptual a alta resolución: el pipeline produce imágenes de 2048×3584 en 8 pasos totales, adecuado para iterar rápido sobre bocetos y obtener la versión final ampliada sin pasos intermedios manuales.
- Producción de ilustraciones para impresión o web: la salida 4× permite obtener material listo para maquetación sin recurrir a un upscaler separado, reduciendo la cadena de herramientas.
- Prototipado de prompts en ComfyUI: el borrador de Krea 2 a 512×896 se previsualiza mientras PiD genera la imagen final, lo que acelera la evaluación de prompts en flujos de trabajo de diseño.
- Automatización por lotes en Python: el script `krea2-pid-generate.py` permite integrar el pipeline en scripts de generación masiva con diffusers, útil para catalogos de imágenes o assets de videojuegos.
- Despliegue en Comfy Cloud: los workflows cloud evitan gestionar localmente los 26,3 GB de Krea 2 Turbo, útil para equipos con hardware limitado que necesitan alta resolución puntual.
- Investigación sobre decoders de difusión en píxeles: el repo sirve como referencia reproducible para comparar PiD frente a VAE + upscaler en términos de calidad y latencia, con 100 ejemplos y sus prompts como base de evaluación.
- Generación interactiva en estación de trabajo con GPU consumer: con las variantes fp8 (13,1 GB) o int8 de PiD (1,6 GB) el pipeline puede caber en GPUs de gama alta de consumo, según el autor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor únicamente reporta mediciones de latencia en una RTX 5090 con el script de Python: los 8 pasos nativos de Krea 2 Turbo tardaron 0,4 s más que los 4 pasos del LoRA (la mayor parte del tiempo de esa etapa es la carga del modelo en GPU) y el decode de PiD a 2048×3584 tardó 3,3 s.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita. Los pesos en bf16 suman aproximadamente 26,3 GB (Krea 2 Turbo) + 8,9 GB (Qwen3-VL 4B) + 2,8 GB (PiD) + 5,2 GB (Gemma 2 2B) + 0,3 GB (VAE), aunque no todos residen simultáneamente en VRAM.
- Alternativas de menor huella: Krea 2 Turbo fp8_scaled (13,1 GB), PiD int8_convrot (1,6 GB) y Gemma 2 2B fp8_scaled (2,6 GB).
- GPU recomendadas: el autor cita una RTX 5090 para sus mediciones; no se especifican A100, H100 ni otras GPU.
- GPU consumer: viable con las variantes fp8 e int8 en GPUs de gama alta; el autor advierte que la build nvfp4 de Krea 2 suaviza la textura fina de los LoRA y recomienda bf16 o fp8.
- Despliegue: ComfyUI (nodos core, requiere una versión reciente con soporte de Krea 2 y PiD), Comfy Cloud, o Python con diffusers y el código de PiD (`requirements.txt` incluido).
- Latencia: 3,3 s para el decode de PiD a 2048×3584 en RTX 5090; la etapa de Krea 2 está dominada por la carga del modelo en GPU según el autor. Throughput no disponible.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de rendimiento ni especificaciones de modelos alternativos comparables (por ejemplo, otros pipelines texto-a-imagen de alta resolución o configuraciones VAE + upscaler) que permitan una comparación rigurosa.

## Limitaciones y advertencias

- El repositorio no contiene un modelo entrenado propio: son workflows, un script y ejemplos; los pesos se descargan de repositorios de terceros (Comfy-Org, Krea, NVIDIA, lvladikov), cada uno con sus propias condiciones.
- El LoRA de 3 pasos está aún en entrenamiento según el autor; si el resultado no convence, recomienda usar 4 pasos o volver al LoRA de 4 pasos.
- Superar los pasos aconsejados con un LoRA de destilación produce sobreenfoque de la piel ("crackled look").
- La build nvfp4 de Krea 2 degrada la textura fina que aportan los LoRA; el autor recomienda bf16 o fp8.
- Solo debe usarse un LoRA a la vez.
- Se requiere una versión reciente de ComfyUI con soporte de Krea 2 y PiD; versiones antiguas no cargarán los workflows.
- No hay información sobre sesgos, riesgo de alucinación visual, limitaciones de idioma ni evaluación de calidad frente a alternativas.
- Licencia Apache 2.0 para el repositorio, pero el uso comercial de los pesos de terceros (Krea 2 Turbo, PiD, text encoders) depende de las licencias de sus repositorios de origen, no detalladas aquí.
- El número de descargas (16) y likes (9) indica una adopción muy temprana; no hay validación comunitaria extensa.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/lvladikov/Krea2Turbo-PiD-SuperFast-HighRes
- Perfil del autor: https://huggingface.co/lvladikov
- Krea 2 Turbo: https://huggingface.co/krea/Krea-2-Turbo
- LoRA de destilación de 4 pasos: https://huggingface.co/lvladikov/Krea2-Turbo-Distill-4step-LoRA
- LoRA de destilación de 3 pasos: https://huggingface.co/lvladikov/Krea2-Turbo-Distill-3step-LoRA
- PiD de NVIDIA: https://huggingface.co/nvidia/PiD
- Pesos de Krea 2 en Comfy-Org: https://huggingface.co/Comfy-Org/Krea-2
- Pesos de PiD en Comfy-Org: https://huggingface.co/Comfy-Org/PixelDiT
- Ejemplos del repositorio: https://huggingface.co/lvladikov/Krea2Turbo-PiD-SuperFast-HighRes/tree/main/examples
- Listado de modelos con etiqueta krea-2: https://huggingface.co/models?other=krea-2
- Listado de modelos krea2: https://huggingface.co/models?search=krea2
