# Comfy-Org/stable-diffusion-3.5-controlnets_ComfyUI_repackaged

## Resumen

Stable Diffusion 3.5 ControlNets es un conjunto de tres modelos ControlNet (blur, canny y depth) desarrollados por Stability AI para complementar el modelo de difusion Stable Diffusion 3.5 Large. Su funcion es anadir control estructural condicional a la generacion de imagenes: a partir de una imagen de referencia (un mapa de profundidad, un mapa de bordes Canny o una version desenfocada), el ControlNet guia la difusion para que la imagen generada respete la composicion, la geometria o el layout de la referencia. Resuelve el problema de la falta de control espacial en los modelos texto-a-imagen puros, donde el prompt no basta para fijar poses, siluetas o disposiciones concretas.

Esta ficha cubre el repositorio `Comfy-Org/stable-diffusion-3.5-controlnets_ComfyUI_repackaged`, que no es un modelo nuevo sino un reempaquetado de los pesos originales de Stability AI en formato single-file (`safetensors`) listo para cargarse en ComfyUI. El repositorio incluye los tres checkpoints (`sd3.5_large_controlnet_blur.safetensors`, `sd3.5_large_controlnet_canny.safetensors` y `sd3.5_large_controlnet_depth.safetensors`), que deben colocarse en `ComfyUI/models/controlnet/`. El tamano total del repositorio es de 26,0 GB.

Es relevante ahora porque ComfyUI se ha consolidado como el entorno de referencia para flujos de difusion modulares y porque SD 3.5 Large es la generacion mas reciente de la familia Stable Diffusion con licencia de comunidad. El reempaquetado elimina la friccion de conversion de formatos y permite a los usuarios de ComfyUI integrar ControlNets de SD 3.5 Large en sus grafos de nodos sin pasos intermedios.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ControlNet sobre difusion latente (transformer de difusion de SD 3.5 Large); no disponible el detalle exacto del bloque ControlNet |
| Parametros totales | no disponible (tres checkpoints separados: blur, canny, depth) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de imagen; resolucion de salida no especificada en la informacion disponible) |
| Tipos de cuantizacion | no disponible (los pesos se distribuyen en `safetensors`, presumiblemente en precision de entrenamiento) |
| Idiomas soportados | no disponible (el prompt textual depende del codificador de texto de SD 3.5 Large; no se detalla en la informacion) |
| Licencia | `stabilityai-ai-community` (licencia de comunidad de Stability AI; enlace en el repositorio original) |
| Formato de pesos | `safetensors` single-file (diffusion-single-file) |
| Modelo base | `stabilityai/stable-diffusion-3.5-controlnets` |
| Repositorio | `Comfy-Org/stable-diffusion-3.5-controlnets_ComfyUI_repackaged` |
| Tamano del repo | 26,0 GB |
| Variantes incluidas | `blur`, `canny`, `depth` |
| Descargas | 7.767 |
| Likes | 8 |
| Fecha de creacion | 2025-10-07 |
| Ultima actualizacion | 2026-09-23 |

## Arquitectura y entrenamiento

Los ControlNets de SD 3.5 Large siguen el paradigma clasico de ControlNet aplicado sobre un modelo de difusion: una copia parcial (o adaptador) del backbone de difusion recibe como entrada adicional la imagen de condicionamiento (mapa de profundidad, mapa de bordes Canny o imagen desenfocada) y produce senales residuales que se inyectan en el modelo base para condicionar el proceso de denoising. El modelo base sobre el que operan es Stable Diffusion 3.5 Large, un transformer de difusion (arquitectura MMDiT en la familia SD3) que sustituye al UNet de generaciones anteriores. La informacion proporcionada no detalla el numero de bloques, la profundidad del adaptador ni la estrategia exacta de inyeccion.

No se dispone de datos sobre el numero de tokens de entrenamiento, la composicion del dataset, el uso de RLHF/DPO ni innovaciones tecnicas especificas (por ejemplo, decodificacion especulativa o atencion lineal) en la informacion proporcionada. La model card del reempaquetado se limita a indicar la procedencia de los pesos, la ubicacion de instalacion en ComfyUI y los flujos de trabajo de ejemplo. Cualquier detalle de entrenamiento debe consultarse en el repositorio original de Stability AI.

## Capacidades

- Generacion de imagenes condicionada por mapa de profundidad (`depth`): permite fijar la estructura 3D y la perspectiva de la escena generada.
- Generacion de imagenes condicionada por bordes Canny (`canny`): preserva contornos, siluetas y lineas definidas de una imagen de referencia.
- Generacion de imagenes condicionada por desenfoque (`blur`): utiliza una version suavizada de la imagen como guia de composicion y layout global.
- Integracion nativa con ComfyUI mediante nodos de ControlNet y flujos de trabajo predefinidos.
- Compatibilidad con el pipeline texto-a-imagen de SD 3.5 Large, incluyendo el codificador de texto del modelo base.
- No dispone de tool calling, function calling ni capacidades de agente: es un modelo generativo de imagen, no un modelo de lenguaje.
- No dispone de modo thinking, vision de entrada en el sentido de VLM, ni procesamiento de audio.
- Capacidad multilingue del prompt: no disponible en la informacion proporcionada (depende del codificador de texto de SD 3.5 Large).

## Casos de uso

- Control de composicion en ilustracion digital: un ilustrador dibuja un boceto de lineas y usa el ControlNet `canny` para que la generacion final respete exactamente esos contornos, manteniendo el estilo indicado en el prompt. Es adecuado porque el mapa de bordes fija la silueta sin imponer textura ni color.
- Relleno de escenarios 3D: a partir de un render de profundidad de un motor 3D (Blender, Unreal), el ControlNet `depth` genera una imagen fotorrealista coherente con la geometria de la escena. Util para previsualizacion arquitectonica y matte painting.
- Retexturizado y variaciones de producto: se usa `blur` o `canny` sobre una foto de producto para generar variantes de material, iluminacion o fondo conservando la forma y el encuadre originales. Apropiado para catalogos de e-commerce.
- Storyboard a imagen final: se parte de un storyboard con encuadres definidos y se aplica `canny` o `depth` para producir fotogramas consistentes entre planos, manteniendo la continuidad visual de una secuencia.
- Control de pose y silueta en personajes: combinado con el prompt adecuado, el ControlNet `canny` extraido de una referencia de pose permite transferir la silueta a un personaje nuevo sin reentrenar LoRAs.
- Integracion en pipelines de ComfyUI para produccion: los flujos de trabajo JSON incluidos (`sd3.5_large_depth.json`, `sd3.5_large_canny_controlnet_example.json`, `sd3.5_large_blur.json`) permiten automatizar la generacion por lotes con control estructural fijo, por ejemplo en la generacion de assets para videojuegos.
- Prototipado rapido de conceptos: el uso de `blur` permite explorar variaciones de color y atmosfera sobre una composicion ya fijada, acelerando la iteracion en diseno conceptual.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita. Como referencia, el repositorio completo ocupa 26,0 GB, lo que sugiere que cada checkpoint individual ronda varios GB; la VRAM necesaria dependera del checkpoint cargado, de la resolucion de salida y de la precision de los pesos.
- GPU recomendadas: no disponibles en la informacion proporcionada. Para modelos de difusion de esta familia se suele requerir GPU con al menos 12-16 GB de VRAM en precision reducida, pero este dato no esta confirmado en la documentacion consultada.
- Compatibilidad con GPU de consumo: no confirmada en la informacion disponible.
- Opciones de despliegue: ComfyUI (entorno objetivo del reempaquetado); Comfy Cloud como alternativa gestionada. Otros entornos (Diffusers, Automatic1111, InvokeAI) no estan documentados en este repositorio.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto / resolucion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SD 3.5 Large ControlNets (este repo) | ControlNet sobre difusion | no disponible (3 checkpoints) | no disponible | `stabilityai-ai-community` | Hugging Face, ComfyUI |
| Stable Diffusion 3.5 Large (base) | Difusion texto-a-imagen | no disponible en la informacion | no disponible | `stabilityai-ai-community` | Hugging Face |
| ControlNets de SDXL | ControlNet sobre difusion | no disponible en la informacion | no disponible | varía segun checkpoint | Hugging Face, ComfyUI |
| ControlNets de SD 1.5 | ControlNet sobre difusion | no disponible en la informacion | no disponible | varía segun checkpoint | Hugging Face, ComfyUI |

No se dispone de datos comparativos de rendimiento (FID, CLIP score, similitud estructural) en la informacion proporcionada para establecer una comparacion cuantitativa con alternativas.

## Limitaciones y advertencias

- El repositorio es un reempaquetado de pesos originales de Stability AI; no introduce mejoras ni cambios en el modelo. Cualquier limitacion del ControlNet original aplica igualmente aqui.
- Licencia `stabilityai-ai-community`: es una licencia de comunidad con terminos especificos (no es Apache 2.0 ni MIT). Es imprescindible revisar el `LICENSE.md` del repositorio original antes de un uso comercial.
- No se dispone de informacion sobre sesgos conocidos, tasas de alucinacion visual ni limitaciones de idioma en el prompt.
- La calidad del control estructural depende de la calidad del mapa de condicionamiento (profundidad, Canny o blur); mapas ruidosos o mal calibrados degradan el resultado.
- No hay datos publicados de benchmarks que permitan estimar la fidelidad estructural frente a alternativas.
- El uso esta restringido al ecosistema ComfyUI en este reempaquetado; fuera de ese entorno requiere conversion o carga manual.
- No se detalla la resolucion nativa de entrenamiento ni el rango de resoluciones soportadas, lo que puede afectar a la calidad fuera de ese rango.
- El repositorio tiene un numero bajo de likes (8) y descargas moderadas (7.767), lo que sugiere una adopcion limitada en el momento de la consulta.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Comfy-Org/stable-diffusion-3.5-controlnets_ComfyUI_repackaged
- Modelo original: https://huggingface.co/stabilityai/stable-diffusion-3.5-controlnets
- Licencia original: https://huggingface.co/stabilityai/stable-diffusion-3.5-controlnets/blob/main/LICENSE.md
- ComfyUI (GitHub): https://github.com/Comfy-Org/ComfyUI
- Comfy Cloud: https://cloud.comfy.org/
- Workflow SD3.5 Large Depth: https://github.com/Comfy-Org/workflow_templates/blob/main/templates/sd3.5_large_depth.json
- Workflow SD3.5 Large Canny ControlNet: https://github.com/Comfy-Org/workflow_templates/blob/main/templates/sd3.5_large_canny_controlnet_example.json
- Workflow SD3.5 Large Blur: https://github.com/Comfy-Org/workflow_templates/blob/main/templates/sd3.5_large_blur.json
- Comunidad francoparlante de ComfyUI: https://comfyui.fr/
