# divyanshx11/JEVision

## Resumen

JEVision es un sistema de decision estructurada construido sobre el modelo base Qwen3.5-0.8B-Base, desarrollado por el usuario divyanshx11. Su objetivo es transformar peticiones de texto (y opcionalmente imágenes) en respuestas tipadas y verificables del tipo Choice, Noul o Score, evitando que la aplicación tenga que interpretar prosa libre. Extiende la interfaz System One de estilo KEV/Jev con una ruta visual adicional, de modo que un mismo endpoint puede atender peticiones solo de texto y peticiones con imágenes.

El modelo se distribuye como un paquete compuesto por un adaptador de texto LoRA con su pointer head, un sidecar visual entrenado por separado con su propio pointer head, y un runtime de inferencia local que expone un servidor HTTP en `POST /v1/systemone`. Ambas rutas comparten la misma revisión fijada del modelo base Qwen3.5-0.8B-Base, lo que garantiza coherencia de comportamiento entre peticiones unimodales y multimodales.

El interés actual de JEVision reside en su enfoque de "API de decisión" tipada y en su envelope de petición configurado para hasta 80.000 tokens de entrada procesados, con verificaciones de aceptación grabadas a 76.999 tokens (texto) y 76.998 tokens (imagen más texto). El repositorio ocupa 0,1 GB, la licencia es Apache 2.0 y el modelo está etiquetado únicamente para inglés.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3.5) con adaptadores LoRA y pointer heads por ruta |
| Parámetros totales | Aproximadamente 0,8 B en el modelo base (Qwen3.5-0.8B-Base); el paquete distribuido contiene adaptadores, no pesos completos |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | Envelope de petición configurado para hasta 80.000 tokens de entrada procesados; verificaciones grabadas a ~77K tokens |
| Tipos de cuantización | No disponible (se distribuyen safetensors de adaptadores y `pointer_head.pt`) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (adaptadores LoRA) y `pointer_head.pt` (pointer heads); los pesos base se descargan por separado |

## Arquitectura y entrenamiento

JEVision no es un modelo monolítico entrenado desde cero, sino un sistema de adaptación sobre Qwen3.5-0.8B-Base (revisión `dc7cdfe2ee4...`). El paquete incluye cuatro componentes diferenciados: `text/jevvision-text/`, con el adaptador LoRA de decisión textual y su pointer head por defecto; `text/kev-0.8b/`, un checkpoint textual opcional fijado (KEV-0.8B) que puede seleccionarse para peticiones sin imágenes; `adapter/` junto con `pointer_head.pt`, que constituyen el sidecar visual consciente de imágenes; y `runtime/kev/`, el código de inferencia local y servido de System One.

La innovación principal es la separación de rutas: las peticiones solo de texto emplean el adaptador textual seleccionado, mientras que las peticiones que incluyen imágenes se enrutan automáticamente al sidecar visual. Cada ruta dispone de su propio pointer head, lo que permite emitir respuestas tipadas (Choice, Noul, Score) con probabilidades asociadas en lugar de texto generado. No se detalla en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO.

## Capacidades

- Decisión estructurada sobre texto: devuelve respuestas tipadas Choice, Noul y Score a través de `POST /v1/systemone`, sin necesidad de parsear prosa libre.
- Decisión multimodal: acepta hasta cuatro imágenes por petición en formato PNG, JPEG o WebP, con un máximo de 10 MiB y 25 megapíxeles por imagen.
- Enrutado automático de ruta: selecciona la ruta visual cuando la petición contiene imágenes y la ruta textual cuando no las contiene.
- Contexto largo: envelope configurado para procesar hasta 80.000 tokens de entrada, con verificaciones grabadas cerca de 77K tokens.
- Respuestas con probabilidades: cada Choice incluye valor seleccionado, confianza y distribución de probabilidades sobre los criterios definidos por la aplicación.
- API local servible: incluye servidor HTTP, cliente Python (`jevvision`) y utilidades auxiliares como `image_file_as_data_url`.
- Soporte para adaptadores intercambiables: la ruta textual admite al menos el adaptador por defecto y el checkpoint KEV-0.8B.
- No se documentan capacidades de tool calling, function calling, agentes multi-paso, generación libre de código ni audio.

## Casos de uso

- Clasificación visual de escenas: dado un conjunto de descripciones candidatas y una fotografía, el modelo devuelve la opción más probable con una distribución de probabilidades, útil para pipelines de etiquetado automático o moderación visual.
- Enrutado de tickets en atención al cliente: enviando el historial de conversación como contexto y un conjunto cerrado de categorías como criterios, el modelo devuelve una Choice tipada que puede encaminar el ticket al equipo correcto sin post-procesado de texto.
- Verificación de decisiones en sistemas con contexto largo: el envelope de hasta 80.000 tokens permite enviar documentación extensa (por ejemplo, un archivo de help-desk de 76.000 tokens) y preguntar por un dato concreto, devolviendo la respuesta como elección tipada.
- Puntuación de candidatos en procesos de selección o ranking: usando el tipo Score, la aplicación puede pedir al modelo una valoración numérica sobre criterios predefinidos, con la ventaja de que la salida es directamente consumible por código.
- Auditoría de respuestas multimodales: combinando la ruta visual con criterios explícitos, se puede comprobar si una imagen coincide con una afirmación (por ejemplo, verificar que una foto muestra un producto concreto) y almacenar la confianza asociada.
- Interfaces de decisión en aplicaciones interactivas: sustituir prompts de texto libre por peticiones tipadas reduce la variabilidad de la salida y facilita integrar el modelo en sistemas donde se requiere una respuesta parseable por máquina.
- Procesamiento por lotes en CPU o GPU modestas: al estar basado en un modelo de 0,8 B con adaptadores LoRA, puede ejecutarse en entornos con recursos limitados (el autor lo probó en una Tesla T4 con CUDA).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. La model card únicamente documenta verificaciones de aceptación centradas en el manejo de peticiones, no en la calidad de las respuestas:

| Verificación | Ruta | Tokens procesados | Naturaleza |
|---|---|---|---|
| Aceptación texto | Adaptador textual (KEV-0.8B) | 76.999 | Comprobación de manejo de petición, no de calidad |
| Aceptación imagen más texto | Sidecar visual | 76.998 | Comprobación de manejo de petición, no de calidad |
| Ejemplo de foto real | Ruta visual | 674 de entrada, 67 de salida | Ejemplo único grabado (selección de `laptop_and_coffee` con probabilidad 1,0) |

El autor indica explícitamente que la calidad de las respuestas en contexto largo "queda por evaluar", por lo que estos datos no deben interpretarse como evidencia de rendimiento.

## Requisitos de hardware

- VRAM estimada: no se publica una cifra exacta. Al tratarse de un modelo base de 0,8 B más adaptadores LoRA, la huella es reducida, pero el envelope de hasta 80.000 tokens incrementa notablemente el coste de memoria de la KV cache.
- GPU recomendada por el autor: una GPU NVIDIA con 16 GB de VRAM cuando se sirven ambas rutas simultáneamente.
- Entorno probado: Linux con CUDA sobre una NVIDIA Tesla T4.
- Compatibilidad con GPU de consumo: no se especifica explícitamente, pero 16 GB de VRAM es un requisito asumible por tarjetas como la RTX 4080 o la RTX 4090; no se confirma soporte para GPUs de gama inferior.
- Opciones de despliegue: se distribuye un runtime propio (`run_jevvision.py`) con servidor HTTP en el puerto 8009 y endpoint `POST /v1/systemone`; no se menciona compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles. El ejemplo grabado incluye la latencia de una ejecución en CPU, pero el autor aclara que no constituye una comparación de velocidad.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| JEVision (divyanshx11) | ~0,8 B base + LoRA | Envelope de hasta 80.000 tokens | Decisión tipada texto e imagen con adaptadores y pointer heads | Apache 2.0 | HuggingFace, 0 descargas, 1 like |
| Qwen3.5-0.8B-Base | ~0,8 B | No disponible | Modelo base generativo | No disponible en esta información | Modelo base referenciado por JEVision |
| KEV-0.8B (jaredpalmer) | ~0,8 B | No disponible | Interfaz System One textual | No disponible en esta información | Checkpoint opcional incluido como adaptador alternativo |

No se dispone de información sobre otros sistemas de decisión tipada comparables, por lo que la comparación se limita a los modelos directamente relacionados en la documentación del propio repositorio.

## Limitaciones y advertencias

- No se han publicado evaluaciones de calidad de las respuestas; las pruebas registradas solo verifican el manejo de peticiones, no la corrección de las decisiones.
- El modelo está etiquetado únicamente para inglés, tanto en la model card como en los metadatos de HuggingFace; no hay evidencia de soporte multilingüe.
- El tipo de respuesta Noul aparece mencionado en la documentación pero no se define su semántica ni su formato, lo que dificulta su uso sin revisar el código del runtime.
- El repositorio tiene 0 descargas y 1 like, y fue creado el 24 de septiembre de 2026 con última actualización el 25 de septiembre de 2026, por lo que se trata de una publicación muy reciente y con validación externa nula.
- El paquete no incluye los pesos base; es necesario descargar Qwen/Qwen3.5-0.8B-Base por separado, lo que añade un paso de instalación y posibles dependencias de red.
- No se documentan sesgos conocidos, comportamiento ante entradas adversarias ni tasas de alucinación.
- Los límites de las imágenes (máximo cuatro por petición, 10 MiB y 25 megapíxeles cada una) restringen los escenarios de visión de alta resolución.
- Aunque la licencia Apache 2.0 permite uso comercial, el modelo base Qwen3.5-0.8B-Base tiene su propia licencia y condiciones que conviene verificar antes de un despliegue en producción.
- El runtime propio no declara compatibilidad con servidores de inferencia estándar (vLLM, TGI, llama.cpp), lo que puede limitar la escalabilidad horizontal.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/divyanshx11/JEVision
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B-Base
- Checkpoint KEV-0.8B opcional: https://huggingface.co/jaredpalmer/kev-0.8b
- Fotografía de ejemplo (Shixart1985, CC BY 2.0, vía Wikimedia Commons): https://commons.wikimedia.org/wiki/File:Coffee_cup_next_to_laptop_on_wooden_table_in_cozy_indoor_workspace_during_daytime.jpg
- Licencia Creative Commons BY 2.0: https://creativecommons.org/licenses/by/2.0/
- No se han proporcionado enlaces a papers, blogs, repositorios adicionales ni demos más allá de los anteriores.
