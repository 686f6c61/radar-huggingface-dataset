# RunningHubAI/rh-anime-screenscap-mossimage-v1.safetensors-lora

## Resumen

rh-anime-screenscap-mossimage-v1 es un LoRA de estilo para generación de imágenes anime, publicado por RunningHubAI y atribuido al usuario Yugen de dicha plataforma. Se trata de un adaptador de bajo rango entrenado sobre el modelo base MOSS SFT (MOSS Image), un modelo de difusión de imagen, y su función es forzar la estética de "screenshot" o fotograma de anime en las generaciones. No es un modelo de lenguaje ni un modelo fundacional: es un peso auxiliar de 71 MiB que se carga junto al modelo base en ComfyUI, RunningHub o Hugging Face.

El autor lo describe explícitamente como un "quality LoRA", es decir, un adaptador orientado a mejorar la calidad estética y el acabado visual (similar a los tags `masterpiece, very aesthetic`) más que a inyectar un concepto o personaje concreto. El entrenamiento se realizó sobre un dataset personal curado de capturas de pantalla de anime a múltiples resoluciones, con leyendas que combinan lenguaje natural, tags y bounding boxes, además de dropout personalizado. Según la model card, fue el séptimo intento del autor y el resultado se considera estable.

Es relevante ahora porque MOSS Image es un modelo relativamente reciente con poca comunidad de LoRAs comparado con otros ecosistemas, y este adaptador ofrece una vía para obtener resultados con estética de anime cinematográfica sin necesidad de un fine-tune completo. La información disponible es limitada: no hay datos de benchmarks, licencia declarada ni especificaciones técnicas del modelo base en la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre modelo de difusión MOSS Image / MOSS SFT |
| Parametros totales | no disponible (peso del LoRA: 71 MiB en safetensors) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de imagen) |
| Tipos de cuantizacion | no disponible (el LoRA se distribuye en safetensors; la cuantizacion depende del modelo base) |
| Idiomas soportados | no disponible (los prompts de la model card estan en ingles) |
| Licencia | no disponible (la model card indica "follow the original project or upstream license") |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El LoRA se entrena sobre MOSS SFT (MOSS Image), un modelo de difusión de imagen del que la model card no detalla arquitectura, tamaño ni datos de preentrenamiento. El adaptador en sí es un LoRA estándar de bajo rango: modifica las capas del modelo base durante la inferencia sin alterar los pesos originales, y se distribuye como un único archivo safetensors de 71 MiB.

El dataset de entrenamiento es personal y curado por el autor, compuesto por capturas de pantalla de anime a múltiples resoluciones. Las leyendas combinan lenguaje natural, tags y bounding boxes, con dropout personalizado aplicado durante el entrenamiento. No se especifican el número de imágenes, el número de pasos de entrenamiento, la tasa de aprendizaje ni el rango del LoRA. El autor menciona que fue su séptimo intento y que el resultado es estable, lo que sugiere un proceso iterativo de ajuste sin datos públicos sobre la configuración final.

## Capacidades

- Generación de imágenes con estética de fotograma de anime (screenscap) sobre el modelo base MOSS Image.
- Actúa como "quality LoRA": refuerza el acabado estético y la calidad visual percibida.
- Compatible con prompts de encuadre y cámara: `medium shot`, `long shot`, `wide angle`, `dutch angle`, `low angle`, `high angle`.
- Compatible con prompts de iluminación y posprocesado: `chromatic aberration`, `film grain`, `cinematic`, `backlighting`, `rim lighting`, `soft light`, `particle lighting`, gradación de color.
- Soporte de BBox T2I (texto a imagen con bounding boxes) heredado del modelo base, recomendado por el autor para poses difíciles de describir solo con texto.
- Apilamiento con otros LoRAs (por ejemplo, un LoRA de personaje a peso 0.3 junto al LoRA de estilo a 1.0) para mejorar composición y anatomía.
- Mejora de precisión de personajes incluyendo el título de la serie en el prompt, por ejemplo `Aqua (Konosuba), Kono Subarashii Sekai ni Shukufuku wo!`.
- No dispone de tool calling, agentes, razonamiento multi-paso ni capacidades de texto: es exclusivamente un adaptador de imagen.

## Casos de uso

- Ilustración de escenas anime para proyectos personales: el LoRA genera imágenes con acabado de fotograma de serie, adecuado para fan art, storyboards o referencias visuales, siempre que se acompañe de prompts detallados de encuadre e iluminación.
- Creación de keyframes para animación: combinando `medium shot`, `cinematic` y `rim lighting` se pueden producir fotogramas coherentes estéticamente para animáticas o previsualización.
- Generación de fondos y planos de establishing: con `long shot` y `wide angle` el adaptador permite crear planos generales con estética de anime para cómics, novelas visuales o vídeos.
- Prototipado de personajes con apilamiento de LoRAs: usar el LoRA de estilo a peso 1.0 junto a un LoRA de personaje a 0.3 permite obtener retratos con anatomía y composición mejoradas sin perder el acabado de screenscap.
- Flujos de trabajo en ComfyUI: al estar etiquetado como `comfyui` y `lora`, se integra en grafos de nodos donde se encadena con el modelo base MOSS Image, un Turbo LoRA opcional y nodos de posprocesado.
- Experimentación con BBox T2I: para escenas con poses complejas o múltiples personajes, el autor recomienda el modo texto a imagen con bounding boxes del modelo base, usando este LoRA como capa de estilo.
- Producción de material promocional con estética anime: estudios pequeños pueden generar imágenes de campaña con un look cinematográfico consistente sin entrenar un modelo propio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible para el LoRA en sí; depende enteramente del modelo base MOSS Image, cuyos requisitos no se detallan en la model card.
- GPU recomendadas: no disponible. Al ser un adaptador de 71 MiB, el coste de VRAM del LoRA es marginal frente al del modelo base.
- Compatibilidad con GPU de consumo: no disponible; depende del modelo base y de la cuantización aplicada a este.
- Opciones de despliegue: ComfyUI (etiqueta oficial del repo), RunningHub (plataforma del autor) y Hugging Face. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a modelos de difusión de imagen.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Base | Tamaño del adaptador | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| rh-anime-screenscap-mossimage-v1 | LoRA de estilo anime | MOSS Image / MOSS SFT | 71 MiB (safetensors) | no aplica | no disponible | Hugging Face, RunningHub, ComfyUI |
| Anima (fine-tune anime citado por el autor) | Fine-tune de modelo de imagen | no disponible | no disponible | no aplica | no disponible | no disponible |
| LoRA de personaje apilable (p. ej. Chainsaw Man LoRA) | LoRA de concepto | MOSS Image | no disponible | no aplica | no disponible | Civitai / RunningHub |

No se dispone de datos suficientes para comparar parámetros, contexto o rendimiento con alternativas de la misma categoría; la comparación se limita a tipo de artefacto y plataforma de distribución.

## Limitaciones y advertencias

- El LoRA no genera poses ni composiciones por sí solo: el autor advierte que MOSS Image es estricto con los prompts y que hay que dominar el prompting para obtener resultados útiles.
- MOSS SFT tiende a generar imágenes "menos vivas" o poses aburridas en comparación con otros modelos como Anima; se requiere prueba y error con semillas y ajustes.
- El uso de un Turbo LoRA puede degradar la calidad de imagen, pero no usarlo puede provocar problemas en las manos; no hay una configuración recomendada única.
- La precisión de personajes mejora al incluir el título de la serie en el prompt, pero el autor solo lo ha probado con personajes de anime, no con personajes de gacha games.
- No se declara licencia explícita: la model card remite a la licencia del proyecto original o upstream, lo que introduce incertidumbre para uso comercial.
- No hay información sobre sesgos, riesgo de alucinación visual, idiomas soportados ni limitaciones de resolución.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validación comunitaria independiente.
- La fecha de creación indicada (2026-11-05) es futura respecto a la información habitual de repositorios; conviene verificar la vigencia del artefacto antes de usarlo en producción.

## Enlaces

- Hugging Face: https://huggingface.co/RunningHubAI/rh-anime-screenscap-mossimage-v1.safetensors-lora
- Modelo original en RunningHub: https://www.runninghub.ai/model/public/2114579833401839618
- Perfil del autor en RunningHub: https://www.runninghub.ai/user-center/2025565893677027330
- RunningHub International: https://www.runninghub.ai
- RunningHub China: https://www.runninghub.cn
- Documentación de la API de RunningHub: https://www.runninghub.cn/runninghub-api-doc-en/
- MOSS SFT en Civitai: https://civitai.red/models/3005406/moss-image
- Workflow simple para MOSS Image: https://civitai.red/models/3005854/simple-workflow-for-moss-image?modelVersionId=3416316
- Canal de Telegram del autor: https://t.me/darken_ai
- Entrenamiento en RunningHub: https://www.runninghub.ai/page-model
