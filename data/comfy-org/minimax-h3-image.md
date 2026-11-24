# Comfy-Org/MiniMax-H3-Image

## Resumen

MiniMax-H3-Image es un modelo de difusion texto-a-imagen desarrollado por MiniMax y reempaquetado por Comfy-Org en formato de archivo unico para su uso directo en ComfyUI. El repositorio que nos ocupa no contiene los pesos originales en su formato nativo, sino una conversion lista para cargar en el nodo de modelos de difusion de ComfyUI, junto con los codificadores de texto y el VAE necesarios para completar el pipeline. El modelo resuelve la generacion de imagenes a partir de descripciones textuales, ademas de tareas derivadas como edicion de imagen y sustitucion de personajes, segun los flujos de trabajo oficiales publicados por Comfy-Org.

La relevancia de esta ficha radica en que el repositorio acumula mas de cuatro millones de descargas y 781 likes, lo que lo situa entre los recursos de generacion de imagen mas utilizados del ecosistema ComfyUI. El paquete incluye componentes auxiliares especificos: un codificador de texto basado en la familia Qwen (variantes de 9B y 27B, esta ultima orientada a la mejora de prompts) y un codificador visual Qwen3-VL de 32B para el modo de edicion. El VAE se distribuye en fp16.

La licencia es una licencia comunitaria propia de MiniMax para H3 Image, distinta de la del modelo MiniMax H3 original, e introduce umbrales de facturacion anual y restricciones para servicios alojados a terceros. El tamano total del repositorio es de 160,3 GB, lo que refleja la presencia de multiples variantes de codificadores de texto en distintas cuantizaciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusion para texto-a-imagen (detalles internos no disponibles) |
| Parametros totales | No disponible |
| Parametros activos | No disponible |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Incluye variantes int8, w4a8 GPTQ, nvfp4 AWQ y fp16 segun los nombres de archivo del repositorio |
| Idiomas soportados | No disponible |
| Licencia | minimax-h3-image-community-license-agreement (licencia propia, distinta de la de MiniMax H3) |
| Formato de pesos | safetensors (archivo unico de difusion, codificadores de texto y VAE por separado) |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo de difusion en la informacion proporcionada. El repositorio se distribuye como `diffusion-single-file`, es decir, un unico archivo de pesos del modelo de difusion (`minimax_h3_image_pruned_int8_convrot.safetensors`) que incorpora una version podada y cuantizada a int8. El pipeline declarado es `text-to-image`, y el modelo base de referencia es `MiniMaxAI/MiniMax-H3-Image`, del que este repositorio es un reempaquetado.

El ecosistema de componentes que acompana al modelo sugiere una arquitectura compuesta: un modelo de difusion principal, un VAE en fp16 (`minimax_h3_image_vae_fp16.safetensors`) y varios codificadores de texto de la familia Qwen. Para la generacion texto-a-imagen se emplea `qwen3.5_9b_w4a8_gptq.safetensors` como codificador de texto, mientras que para la mejora de prompts se recomienda `qwen3.8_27b_minimax_h3_image_pe_w4a8_gptq.safetensors`. Para tareas de edicion de imagen se incluyen codificadores visuales Qwen3-VL de 32B en dos variantes (`int8_convrot` y `nvfp4_awq`). No se han publicado en la informacion disponible datos sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO.

## Capacidades

- Generacion de imagenes a partir de prompts de texto (text-to-image), con soporte de mejora de prompt mediante un modelo Qwen dedicado y prompts de sistema oficiales.
- Edicion de imagen (image edit), segun el flujo de trabajo oficial `image_minimax_h3_image_edit.json`.
- Sustitucion de personajes (character swap), segun el flujo de trabajo oficial `image_minimax_h3_image_character_swap.json`, que permite reemplazar un personaje en una imagen existente por otro.
- Integracion nativa con ComfyUI mediante nodos de carga de modelos de difusion, codificadores de texto y VAE.
- Soporte de multiples cuantizaciones para adaptar el consumo de memoria: int8, w4a8 GPTQ, nvfp4 AWQ y fp16.
- No se dispone de informacion sobre soporte de tool calling, capacidades de agente, razonamiento multi-paso ni capacidades multilingues, al tratarse de un modelo de generacion de imagen.

## Casos de uso

- Generacion de ilustraciones para articulos y blogs: el modelo recibe un prompt descriptivo y produce una imagen coherente con el texto, lo que permite automatizar la creacion de cabeceras y material grafico sin intervencion manual.
- Creacion de assets para videojuegos y prototipado visual: los flujos de trabajo de ComfyUI permiten iterar rapidamente sobre conceptos de personajes y entornos, usando la mejora de prompt con el modelo Qwen de 27B para obtener descripciones mas ricas.
- Edicion de imagenes existentes: el flujo `image_minimax_h3_image_edit.json` permite modificar imagenes ya generadas o aportadas por el usuario, util para retoques y variaciones sobre un diseno base.
- Sustitucion de personajes en material grafico: el flujo `character_swap` permite reemplazar un personaje por otro en una imagen, adecuado para campanas de marketing con variaciones de modelo o para pruebas de vestuario y estilo.
- Generacion de imagenes de producto para comercio electronico: a partir de descripciones textuales se pueden producir imagenes de catalogo, y el modo de edicion permite ajustar fondos o detalles sin rehacer la composicion.
- Automatizacion de pipelines creativos en ComfyUI: al tratarse de un archivo unico de difusion con codificadores y VAE separados, se puede integrar en flujos de trabajo por lotes que generen cientos de imagenes con distintos prompts y semillas.
- Experimentacion e investigacion en generacion de imagen: la disponibilidad de varias cuantizaciones (int8, w4a8, nvfp4) permite comparar calidad y consumo de memoria en distintos entornos de hardware.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El repositorio completo ocupa 160,3 GB, pero no es necesario descargar todos los archivos: el modelo de difusion principal, un codificador de texto y el VAE son suficientes para texto-a-imagen.
- El modelo de difusion se distribuye en una variante podada y cuantizada a int8 (`minimax_h3_image_pruned_int8_convrot.safetensors`), lo que reduce el consumo de VRAM respecto a una version en fp16, aunque no se especifica el tamano exacto de este archivo.
- El VAE se distribuye en fp16 (`minimax_h3_image_vae_fp16.safetensors`).
- El codificador de texto para texto-a-imagen es `qwen3.5_9b_w4a8_gptq.safetensors`, una cuantizacion w4a8 GPTQ de un modelo de 9B, lo que sugiere un consumo de memoria moderado para este componente.
- Para edicion de imagen se requiere ademas un codificador visual Qwen3-VL de 32B, disponible en int8 y en nvfp4 AWQ; la variante nvfp4 esta pensada para GPUs con soporte de ese formato.
- No se dispone de informacion sobre VRAM total estimada, GPUs recomendadas, latencia ni throughput.
- Opciones de despliegue: ComfyUI es el entorno de referencia, con flujos de trabajo oficiales publicados en el repositorio de plantillas de Comfy-Org. No se indica soporte para vLLM, llama.cpp, Ollama o TGI, que no aplican a un modelo de difusion de este tipo.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones tecnicas de modelos comparables en la informacion proporcionada, por lo que no es posible establecer una comparativa cuantitativa fiable. Como referencia de categoria, este modelo compite con otros modelos de difusion texto-a-imagen disponibles en ComfyUI, pero no se aportan parametros, contexto ni rendimiento de alternativas concretas.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| MiniMax-H3-Image (este repositorio) | No disponible | No disponible | Licencia comunitaria MiniMax H3 Image | Hugging Face (Comfy-Org) |
| Alternativas de la misma categoria | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- La licencia `minimax-h3-image-community-license-agreement` es distinta de la del modelo MiniMax H3 original y exige autorizacion previa por escrito de MiniMax si los ingresos anualizados del usuario o sus filiales superan 1 millon de USD, o si se ofrecen servicios alojados a terceros.
- Es necesario solicitar autorizacion a traves de https://platform.minimax.io/license en los supuestos anteriores; el uso comercial por encima de ese umbral no esta cubierto por la licencia por defecto.
- No se dispone de informacion sobre sesgos conocidos del modelo.
- No se dispone de informacion sobre la tasa de alucinacion o fidelidad al prompt.
- No se dispone de informacion sobre limitaciones de idioma; el campo de idiomas no esta disponible en la model card.
- El repositorio es un reempaquetado para ComfyUI; para detalles tecnicos completos, condiciones de uso y posibles actualizaciones debe consultarse el repositorio original de MiniMax.
- El tamano total del repositorio (160,3 GB) puede suponer un coste de almacenamiento y descarga considerable si se clonan todos los archivos.
- La calidad de los resultados depende en buena medida de la mejora de prompt con el modelo Qwen de 27B y de los prompts de sistema oficiales; omitir este paso puede degradar la fidelidad de la imagen generada.

## Enlaces

- Repositorio de Hugging Face: https://huggingface.co/Comfy-Org/MiniMax-H3-Image
- Repositorio original del modelo: https://huggingface.co/MiniMaxAI/MiniMax-H3-Image
- Repositorio del Prompt Enhancer: https://huggingface.co/MiniMaxAI/MiniMax-H3-Image-PE
- Prompts de sistema oficiales para T2I: https://huggingface.co/MiniMaxAI/MiniMax-H3-Image-PE/tree/main/prompt
- Licencia: https://huggingface.co/MiniMaxAI/MiniMax-H3-Image/blob/main/LICENSE
- Solicitud de autorizacion de licencia: https://platform.minimax.io/license
- Flujo de trabajo Image Edit: https://github.com/Comfy-Org/workflow_templates/blob/main/templates/image_minimax_h3_image_edit.json
- Flujo de trabajo Text to Image: https://github.com/Comfy-Org/workflow_templates/blob/main/templates/image_minimax_h3_image_t2i.json
- Flujo de trabajo Character Swap: https://github.com/Comfy-Org/workflow_templates/blob/main/templates/image_minimax_h3_image_character_swap.json
