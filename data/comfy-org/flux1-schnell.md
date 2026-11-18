# Comfy-Org/flux1-schnell

## Resumen

Comfy-Org/flux1-schnell es un reempaquetado de los pesos del modelo de difusion texto-a-imagen FLUX.1-schnell desarrollado originalmente por Black Forest Labs, preparado por Comfy-Org para su uso directo en ComfyUI. No se trata de un modelo nuevo ni de un fine-tune: es una redistribucion de los pesos originales en formato de fichero unico (single-file) compatible con el nodo de checkpoints de ComfyUI, incluyendo una variante cuantizada a FP8 que reduce el consumo de memoria y acelera la inferencia.

El modelo subyacente, FLUX.1-schnell, es un transformer de difusion (flow matching) de 12.000 millones de parametros disenado para generacion de imagenes en muy pocos pasos de muestreo (tipicamente 1 a 4), lo que lo hace especialmente atractivo para flujos de trabajo interactivos y para hardware de gama consumer. La licencia Apache 2.0 del modelo original permite uso comercial sin restricciones adicionales, a diferencia de FLUX.1-dev.

La relevancia de este repositorio es practica: elimina la friccion de convertir y organizar los pesos originales de Black Forest Labs para ComfyUI, ofreciendo ficheros listos para colocar en `models/checkpoints/` y workflows de referencia mantenidos por Comfy-Org. Con mas de 326.000 descargas y 317 likes, es una de las distribuciones mas utilizadas del modelo FLUX.1-schnell en el ecosistema ComfyUI.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusion con flow matching (rectified flow), segun el modelo base FLUX.1-schnell |
| Parametros totales | 12.000 millones (modelo base FLUX.1-schnell; no confirmado en la informacion proporcionada, dato estandar del modelo original) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo texto-a-imagen; la longitud de prompt no se especifica) |
| Tipos de cuantizacion | FP8 y BF16/FP16 (ficheros `flux1-schnell-fp8.safetensors` y `flux1-schnell.safetensors`) |
| Idiomas soportados | no disponible (los prompts se procesan mediante el text encoder T5; el modelo original soporta principalmente ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (fichero unico para ComfyUI) |

## Arquitectura y entrenamiento

El repositorio no documenta la arquitectura ni el proceso de entrenamiento; se limita a reempaquetar los pesos de black-forest-labs/FLUX.1-schnell. El modelo base emplea una arquitectura de difusion basada en flow matching con un transformer como backbone, y esta disenado para generar imagenes en un numero reducido de pasos (la variante "schnell", rapida en aleman, se distingue de FLUX.1-dev precisamente por su regimen de pocos pasos). No se dispone en la informacion proporcionada de datos sobre volumen de entrenamiento, composicion del dataset ni uso de RLHF o preferencias.

La innovacion practica de este repositorio es la distribucion en fichero unico con pesos en FP8, que reduce el uso de memoria y acelera la carga e inferencia en ComfyUI en comparacion con los pesos completos. Se incluyen dos workflows de referencia: uno para la variante FP8 y otro para el flujo completo texto-a-imagen.

## Capacidades

- Generacion de imagenes a partir de descripciones textuales (text-to-image).
- Inferencia en pocos pasos de muestreo (regimen "schnell", tipicamente 1 a 4 pasos), adecuada para iteracion rapida.
- Ejecucion en ComfyUI mediante el nodo de carga de checkpoints en formato single-file.
- Variante FP8 para menor consumo de VRAM y mayor velocidad.
- No soporta tool calling, function calling ni razonamiento multi-paso: es un modelo generativo de imagenes, no un modelo de lenguaje.
- Capacidades multilingues de prompt: no disponibles en la informacion proporcionada; el text encoder del modelo original esta orientado a ingles.

## Casos de uso

- Prototipado rapido de conceptos visuales: gracias a su regimen de pocos pasos, permite generar borradores de imagenes en segundos dentro de ComfyUI, ideal para explorar direcciones creativas antes de invertir en renders de mayor calidad.
- Generacion de ilustraciones para contenido editorial y marketing: la licencia Apache 2.0 permite usar las imagenes generadas en materiales comerciales sin las restricciones de licencia de FLUX.1-dev.
- Integracion en pipelines de ComfyUI existentes: los ficheros single-file se colocan directamente en `models/checkpoints/` y funcionan con los workflows de referencia de Comfy-Org, lo que simplifica el despliegue en estudios que ya usan ComfyUI.
- Generacion de assets para videojuegos y prototipos de UI: la velocidad de muestreo permite producir variaciones de sprites, fondos o mockups en lotes.
- Experimentacion en investigacion de difusion: la variante FP8 facilita ejecutar el modelo en GPUs de gama consumer para estudios comparativos de muestreo y cuantizacion.
- Automatizacion de catalogos de producto: generacion por lotes de imagenes de concepto o ambientacion a partir de descripciones textuales, con coste de inferencia reducido gracias a FP8.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: la variante FP8 reduce el consumo respecto a los pesos completos; el modelo base de 12.000 millones de parametros suele requerir del orden de 12-16 GB en FP8 y mas de 20 GB en precision completa, aunque no se proporcionan cifras oficiales en la informacion disponible.
- GPU recomendadas: no disponibles en la informacion proporcionada; por tamano, GPUs con 16 GB o mas de VRAM (por ejemplo, RTX 4080/4090 o superiores) son el objetivo razonable para la variante FP8.
- Compatibilidad con GPU consumer: la variante FP8 esta pensada para facilitar su ejecucion en hardware consumer, segun la model card.
- Opciones de despliegue: ComfyUI (nodo de checkpoints single-file), con workflows de referencia incluidos.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / pasos | Licencia | Disponibilidad |
|---|---|---|---|---|
| Comfy-Org/flux1-schnell | 12.000 M (modelo base) | Pocos pasos (1-4) | Apache 2.0 | Hugging Face, ComfyUI |
| black-forest-labs/FLUX.1-schnell | 12.000 M | Pocos pasos | Apache 2.0 | Hugging Face (original) |
| FLUX.1-dev | 12.000 M | Mas pasos, mayor calidad | No comercial | Hugging Face |

La comparativa se limita a variantes del mismo modelo base; no se dispone en la informacion proporcionada de datos de rendimiento frente a alternativas como Stable Diffusion 3 o SDXL.

## Limitaciones y advertencias

- Es un reempaquetado, no un modelo entrenado por Comfy-Org; cualquier limitacion del modelo base FLUX.1-schnell aplica integramente.
- Sesgos conocidos: no documentados en la informacion proporcionada; los modelos de difusion suelen reflejar sesgos de sus datos de entrenamiento.
- Riesgo de alucinacion visual: puede generar detalles incorrectos, texto ilegible o anatomias inconsistentes, especialmente con prompts complejos.
- Limitaciones de idioma: el text encoder del modelo original esta orientado a ingles; el rendimiento con prompts en castellano no esta documentado.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base original.
- Caveat de produccion: el regimen de pocos pasos prioriza velocidad sobre calidad maxima; para resultados de alta fidelidad puede ser preferible FLUX.1-dev u otros modelos con mas pasos.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Comfy-Org/flux1-schnell
- Modelo original: https://huggingface.co/black-forest-labs/FLUX.1-schnell
- Repositorio ComfyUI: https://github.com/Comfy-Org/ComfyUI
- Workflow FP8: https://github.com/Comfy-Org/workflow_templates/blob/main/templates/flux_schnell.json
- Workflow texto-a-imagen completo: https://github.com/Comfy-Org/workflow_templates/blob/main/templates/flux_schnell_full_text_to_image.json
