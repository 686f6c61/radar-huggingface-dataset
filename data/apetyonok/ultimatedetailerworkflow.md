# apetyonok/UltimateDetailerWorkflow

## Resumen

UltimateDetailerWorkflow es un flujo de trabajo (workflow) para ComfyUI publicado por el usuario apetyonok en Hugging Face. No se trata de un modelo de IA con pesos entrenados, sino de un archivo JSON de orquestación que encadena nodos de ComfyUI para automatizar el detallado y el reescalado (upscaling) de imágenes generadas con Stable Diffusion. Su función principal es generar máscaras de forma automática y refinar prompts por personaje, de modo que el usuario pueda hacer inpainting, detallado y upscaling selectivos sin enmascarado manual y con una carga de prompting mínima.

El flujo integra segmentación automática mediante SAM3 para contenido SFW descrito en lenguaje natural, detección y acotado de anatomía NSFW con modelos YOLO, soporte para hasta cuatro personajes simultáneos y hasta tres LoRAs por personaje y pasada de detallado. Incluye además un bloque de mejora automática de prompts basado en Gemma4 y hasta seis pasadas de refinamiento por personaje (cuerpo completo, cara y pelo, ropa, pechos, genitales y pies).

Es relevante ahora porque ejemplifica la tendencia a empaquetar pipelines complejos de generación de imágenes como artefactos reproducibles de ComfyUI, con control centralizado de sampler, steps, CFG y niveles de denoise. La información disponible no incluye datos de arquitectura de modelo, parámetros ni benchmarks, ya que el artefacto es un grafo de nodos y no un modelo entrenado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (workflow de ComfyUI basado en nodos; no es un modelo con pesos propios) |
| Parametros totales | No disponible (no aplica: artefacto de orquestación) |
| Parametros activos | No disponible (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | GPLv3 (declarada como `license: other` con `license_name: gplv3`) |
| Formato de pesos | JSON de workflow de ComfyUI (no hay safetensors ni GGUF propios) |

## Arquitectura y entrenamiento

El artefacto no es un modelo entrenado sino un grafo de nodos de ComfyUI distribuido como archivo JSON que se arrastra y suelta directamente en la interfaz. La arquitectura funcional del workflow combina segmentación con SAM3 para contenido SFW guiada por lenguaje natural, detección de anatomía NSFW con modelos YOLO, y un bloque de mejora de prompts generado con Gemma4. El control de los parámetros clave (sampler, steps, CFG, niveles de denoise) está centralizado para todos los personajes y partes del cuerpo.

El autor indica que el workflow es una expansión y adaptación de las secciones "Face Detailer" y "SD Upscale" del workflow "ZIB + ZIT Simple Workflow" de catlover1937 en CivitAI. No se proporcionan datos sobre número de tokens de entrenamiento, composición del dataset ni técnicas de RLHF/DPO, porque no hay entrenamiento implicado en este artefacto. Tampoco se detalla la versión concreta de SAM3, YOLO o Gemma4 utilizada en los nodos.

## Capacidades

- Detallado y upscaling selectivo de imágenes de Stable Diffusion con enmascarado automático.
- Segmentación automática de contenido SFW mediante lenguaje natural con SAM3.
- Detección y acotado automático de anatomía NSFW con modelos YOLO.
- Soporte de hasta cuatro personajes simultáneos en una misma pasada de detallado.
- Hasta tres LoRAs por combinación de personaje y pasada de detallado, además de LoRA universal y LoRA de upscaler.
- Control centralizado de sampler, steps, CFG, niveles de denoise y otros parámetros para todos los personajes y partes del cuerpo.
- Mejora automática de prompts basada en las características del sujeto, generada con Gemma4.
- Previsualizaciones en cada paso de refinamiento para localizar fallos con precisión.
- Hasta seis pasadas de refinamiento por personaje: cuerpo completo, cara y pelo, ropa, pechos, genitales y pies.
- No soporta tool calling, function calling ni razonamiento multi-paso en el sentido de un LLM; su lógica es la de un pipeline de imagen.

## Casos de uso

- Detallado de retratos generados: el workflow aplica pasadas específicas de cara y pelo sobre imágenes de Stable Diffusion, usando SAM3 para generar la máscara facial automáticamente y evitar el enmascarado manual.
- Refinado de escenas con varios personajes: al soportar hasta cuatro personajes simultáneos con control centralizado de parámetros, permite detallar cada figura de forma independiente sin duplicar el grafo de nodos.
- Upscaling selectivo de zonas concretas: combina el LoRA de upscaler con las máscaras automáticas para reescalar solo las regiones de interés (cara, ropa, pies) en lugar de la imagen completa.
- Producción de ilustración con LoRAs por personaje: la asignación de hasta tres LoRAs por personaje y pasada permite mantener el estilo o la identidad de cada figura dentro de una misma composición.
- Automatización de flujos de trabajo en ComfyUI: al ser un JSON arrastrable, se puede versionar y reutilizar como plantilla base para pipelines de detallado en equipos que ya trabajan con ComfyUI.
- Iteración con previsualizaciones: las vistas previas por paso de refinamiento facilitan la depuración cuando una pasada de detallado degrada la imagen, algo habitual en niveles altos de denoise.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- No disponible: la información proporcionada no especifica requisitos de VRAM, GPU ni throughput.
- Los requisitos reales dependerán de los modelos que carguen los nodos (SAM3, YOLO, Gemma4 y el modelo base de Stable Diffusion), no del workflow en sí.
- Opciones de despliegue: ComfyUI (arrastrar y soltar el archivo JSON). No se documentan otras opciones como vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de artefacto.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Artefacto | Tipo | Funcion principal | Licencia | Disponibilidad |
|---|---|---|---|---|
| apetyonok/UltimateDetailerWorkflow | Workflow de ComfyUI (JSON) | Detallado y upscaling automático con SAM3, YOLO y Gemma4 | GPLv3 | Hugging Face |
| joydriver/UltimateDetailerWorkflow | Workflow de ComfyUI (JSON) | Variante del mismo workflow publicada por otro usuario | No disponible en la informacion | Hugging Face |
| ZIB + ZIT Simple Workflow (catlover1937) | Workflow de ComfyUI | Detallado facial y upscaling, base del anterior | No disponible en la informacion | CivitAI |

## Limitaciones y advertencias

- No es un modelo de IA: no tiene pesos, parámetros ni contexto; evaluarlo como modelo llevaría a conclusiones erróneas.
- El autor reconoce que el workflow funciona mal con niveles altos de denoise, por lo que no es adecuado para intercambio de ropa (clothing swap) ni de caras (face swap).
- La lógica de mejora de prompts es descrita por el autor como cisnormativa y heteronormativa; para personajes trans o de género no conforme se recomienda desactivar el bloque de mejora y escribir el prompt manualmente.
- La licencia GPLv3 impone obligaciones de copyleft si se redistribuye o modifica el workflow; conviene revisar su compatibilidad con el uso comercial previsto.
- El workflow incluye detección de anatomía NSFW con YOLO y pasadas de detallado sobre genitales, lo que puede implicar restricciones de uso según la jurisdicción y la plataforma.
- Depende de modelos externos (SAM3, YOLO, Gemma4, modelo base de Stable Diffusion y LoRAs) cuyas licencias y disponibilidad no se detallan en la información proporcionada.
- Riesgo de artefactos y alucinación visual en las pasadas de detallado, mitigado parcialmente por las previsualizaciones por paso.
- No hay información sobre idiomas soportados ni sobre sesgos más allá de la nota del autor sobre la mejora de prompts.

## Enlaces

- Hugging Face: https://huggingface.co/apetyonok/UltimateDetailerWorkflow
- Variante en Hugging Face: https://huggingface.co/joydriver/UltimateDetailerWorkflow
- Árbol de archivos de la variante: https://huggingface.co/joydriver/UltimateDetailerWorkflow/tree/main
- Workflow base de catlover1937 en CivitAI: https://civitai.com/models/2345999/moody-zib-zimage-base-zit-zimage-turbo-simple-workflow
- Perfil del autor del workflow base: https://civitai.com/user/catlover1937
- Licencia GPLv3: https://www.gnu.org/licenses/gpl-3.0.en.html
