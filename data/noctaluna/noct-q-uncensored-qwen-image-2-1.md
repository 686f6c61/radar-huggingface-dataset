# Noctaluna/Noct-Q-Uncensored-Qwen-Image-2.1

## Resumen

Noct Q: Qwen Image 2.1 Uncensored Realism es un modelo de generacion de imagenes texto-a-imagen derivado de Qwen/Qwen-Image-2.1, publicado por el usuario Noctaluna en HuggingFace. Se distribuye como un merge con pesos del transformer modificados respecto al modelo base, con el objetivo declarado de eliminar las restricciones de contenido del original y permitir la generacion de desnudos y escenas adultas sin necesidad de aplicar un LoRA adicional. Es, por tanto, un modelo especializado en fotorrealismo y contenido NSFW, no un modelo de proposito general.

El repositorio aloja principalmente un unico archivo safetensors en cuantizacion int8 (7,3 GB) junto con un workflow de ComfyUI. El autor mantiene ademas variantes int4, fp8, bf16 y fp16 en Civitai, no alojadas en HuggingFace. La libreria declarada es `diffusion-single-file` y el pipeline es `text-to-image`, lo que implica que el modelo no se carga mediante `diffusers` de forma estandar, sino como un archivo de pesos suelto dentro de un grafo de ComfyUI.

Su relevancia actual radica en dos factores: por un lado, aprovecha la calidad de prompt en prosa natural de la familia Qwen-Image 2.1 (el text encoder es Qwen3-VL de 8B, que interpreta descripciones tipo caption en lugar de listas de tags); por otro, cubre un nicho de comunidad muy activo (generacion fotorrealista sin censura) con requisitos de hardware moderados, ya que el archivo int8 esta pensado para tarjetas de 8 a 12 GB de VRAM. La licencia Qwen Research limita el uso a fines no comerciales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusion (derivado de Qwen-Image 2.1); transformer con pesos modificados. Text encoder Qwen3-VL 8B + VAE Qwen Image 2.1 |
| Parametros totales | no disponible (no declarados para el transformer de difusion) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (no aplica en el sentido de contexto de texto; el text encoder es Qwen3-VL 8B) |
| Tipos de cuantizacion | int8 (convrot), int4, fp8, bf16, fp16 (int4/fp8/bf16/fp16 solo en Civitai) |
| Idiomas soportados | no disponible (la model card recomienda prompts en ingles, en prosa) |
| Licencia | Qwen Research License Agreement (uso no comercial exclusivamente) |
| Formato de pesos | safetensors (archivo unico, `diffusion-single-file`) + workflow `.json` de ComfyUI |
| Tamano del repositorio | 14,5 GB |
| Tamano de archivo principal | 7,3 GB (`NoctQ_V4_int8_convrot.safetensors`) |
| Descargas / likes | 12.942 descargas / 113 likes |
| Fecha de creacion / actualizacion | 2026-09-28 / 2026-09-30 |

## Arquitectura y entrenamiento

Noct Q no es un modelo entrenado desde cero, sino un merge derivado de Qwen/Qwen-Image-2.1 (relacion declarada `base_model_relation: merge`, con pesos del transformer modificados y un archivo `NOTICE` que documenta los cambios). Qwen-Image 2.1 es un modelo de difusion texto-a-imagen de la familia Qwen, que en esta variante se ejecuta como archivo unico dentro de ComfyUI. La canalizacion completa requiere tres componentes: el transformer de difusion (el archivo Noct Q), el text encoder `qwen3vl_8b_int8_convrot.safetensors` (Qwen3-VL de 8B parametros, en int8) y el VAE `qwen_image_2.1_vae_bf16.safetensors`.

El autor no publica informacion sobre el dataset de entrenamiento, el numero de tokens, ni si hubo etapas de ajuste fino con RLHF o DPO; tampoco detalla la tecnica exacta de merge o de desbloqueo de contenido aplicada a los pesos. Lo unico documentado es la comparacion entre versiones (V3 y V4), donde se afirma que V4 responde al prompt solicitado en escenas explicitas con pareja "tres veces mas a menudo" que V3, dato que procede de la propia model card y no de una evaluacion independiente.

Un aspecto tecnico destacable es el uso de cuantizacion int8 con "convrot" para el transformer y el text encoder, lo que reduce el peso del archivo a 7,3 GB y permite ejecutar el pipeline en GPUs de gama media. El text encoder Qwen3-VL procesa prompts en prosa, lo que condiciona la forma de interactuar con el modelo: descripciones en lenguaje natural completas en lugar de listas de etiquetas separadas por comas.

## Capacidades

- Generacion de imagenes fotorrealistas a partir de descripciones en prosa.
- Renderizado de figuras humanas de cuerpo completo en distintos esquemas de iluminacion (luz natural, flash, escenas nocturnas), segun la model card.
- Generacion de contenido explicito y desnudos sin necesidad de LoRA adicional (capacidad declarada por el autor; el modelo esta etiquetado como `nsfw` y `not-for-all-audiences`).
- Texto legible en la imagen: rotulos, carteles y etiquetas.
- Estilo anime e ilustracion pintada, ademas del fotorrealismo.
- Edicion de imagen con los mismos archivos, mediante la plantilla de edicion de Qwen Image 2.1 en ComfyUI.
- Interpretacion de prompts tipo caption (quien, que hace, donde, con que luz y encuadre), sin palabra de activacion.
- Sin soporte declarado de tool calling, function calling, agentes ni razonamiento multi-paso (no es un modelo de lenguaje).
- Capacidades multilingues: no documentadas.

## Casos de uso

- Ilustracion y arte digital de tematica adulta: el modelo genera desnudos y escenas explicitas directamente desde prompts en prosa, sin requerir LoRA ni fine-tuning adicional, lo que simplifica el flujo frente a la alternativa de adaptar el modelo base.
- Fotografia artistica y estudio del desnudo: util para generar referencias de iluminacion y composicion (luz de dia, flash directo, nocturna) en formato vertical 1024x1536, tamano nativo recomendado por el autor.
- Creacion de personajes consistentes: al permitir describir edad adulta, accion, localizacion y encuadre en una sola frase, se pueden generar variaciones de un mismo personaje cambiando solo la iluminacion o la pose.
- Generacion de ilustracion estilo anime y pintura: el modelo cubre tanto fotorrealismo como estilos ilustrados, lo que permite reutilizar el mismo pipeline de ComfyUI para distintos acabados visuales.
- Edicion de imagenes en ComfyUI: mediante la plantilla de edicion de Qwen Image 2.1, el modelo puede modificar imagenes existentes con los mismos pesos, integrandose en flujos de retoque.
- Renders con rotulacion: la capacidad de generar texto legible en carteles y etiquetas resulta util para bocetos de escenografia, carteleria o prototipos visuales con texto incorporado.
- Produccion de contenido para comunidades de arte generativo: el repositorio incluye un `workflow.json` listo para arrastrar en ComfyUI, lo que reduce el tiempo de puesta en marcha para usuarios que ya trabajan con ese entorno.
- Exploracion de encuadres y composicion: la ventana nativa 1024x1536 y el control de pasos/CFG permiten iterar rapidamente entre propuestas de composicion antes de un render final.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente incluye una comparacion cualitativa entre sus propias versiones (V3 y V4), sin metricas objetivas (FID, CLIP score, HumanEval u otras) ni comparacion con el modelo base Qwen/Qwen-Image-2.1.

## Requisitos de hardware

- VRAM estimada para el archivo int8 (7,3 GB): entre 8 y 12 GB de VRAM, segun indica el autor.
- Componentes adicionales que consumen VRAM: text encoder Qwen3-VL 8B en int8 y VAE en bf16, ambos descargados por separado del repositorio Comfy-Org/Qwen-Image-2.1.
- GPUs compatibles con el rango declarado: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070 / 4070 Ti, RTX 4080, RTX 4090; en el extremo superior, cualquier GPU de 12 GB o mas.
- No cabe en GPUs de 8 GB o menos con la variante int8 completa, salvo que se recurra a las variantes int4 publicadas en Civitai (no presentes en el repositorio de HuggingFace).
- Opciones de despliegue: ComfyUI (entorno recomendado por el autor, version 0.37 o superior, solo nodos core). No se documenta soporte directo para vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje.
- Configuracion de inferencia recomendada: 25 pasos, sampler euler, scheduler simple, CFG 3 con prompt negativo. El autor indica que CFG 1 es aproximadamente el doble de rapido pero ignora el prompt negativo.
- Latencia y throughput: no disponibles (no se publican mediciones de tiempo por imagen).

## Comparativa con modelos similares

| Modelo | Base | Cuantizacion principal | Tamano | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|---|
| Noct Q V4 (este modelo) | Qwen/Qwen-Image-2.1 | int8 convrot (tambien int4, fp8, bf16, fp16 en Civitai) | 7,3 GB (int8) | Qwen Research (no comercial) | HuggingFace + Civitai | Merge con pesos modificados, orientado a NSFW sin LoRA |
| Qwen/Qwen-Image-2.1 (base) | — | bf16 / fp16 | no disponible | Qwen Research | HuggingFace | Modelo original con filtros de contenido; usado como text encoder y VAE |
| Otros merges NSFW de la comunidad | Diversos | variable | variable | variable | Civitai, HuggingFace | No se dispone de datos verificables de benchmarks ni de comparacion directa |

No se dispone de resultados de benchmarks comparativos entre estos modelos en la informacion proporcionada. La unica comparacion documentada es la del propio autor entre las versiones V3 y V4 de Noct Q, sin cifras objetivas.

## Limitaciones y advertencias

- Contenido para adultos: el modelo esta etiquetado como `nsfw` y `not-for-all-audiences`. Requiere verificacion de edad y cumple las politicas de contenido de las plataformas donde se use.
- Licencia estrictamente no comercial: la Qwen Research License Agreement prohibe el uso comercial. Cualquier despliegue en producto, servicio o flujo con monetizacion queda fuera de los terminos.
- Riesgo de sesgos: al ser un derivado orientado a un nicho concreto, no hay evaluacion publicada de sesgos demograficos, representacion corporal ni equidad en la generacion.
- Riesgo de alucinacion visual: como todo modelo de difusion, puede producir anatomia incorrecta (manos, extremidades, proporciones) y texto mal formado en rotulos, especialmente en resoluciones distintas a la nativa.
- Limitaciones de idioma: no se documentan idiomas soportados. La model card recomienda prompts en ingles en prosa; el comportamiento con prompts en castellano no esta verificado.
- Dependencia de ComfyUI: el flujo recomendado exige ComfyUI 0.37 o superior y la plantilla de nodos core. No hay integracion estandar con `diffusers` mas alla de la libreria declarada `diffusion-single-file`.
- Ausencia de datos de entrenamiento: se desconoce el dataset, el volumen de tokens y las tecnicas de ajuste, lo que dificulta auditar el comportamiento del modelo.
- Prompts negativos: si se usa CFG 1 para acelerar la inferencia, el prompt negativo se ignora, lo que puede degradar el control sobre la salida.
- Dependencias externas: requiere descargar el text encoder y el VAE por separado; sin ellos el modelo no funciona.

## Enlaces

- HuggingFace: https://huggingface.co/Noctaluna/Noct-Q-Uncensored-Qwen-Image-2.1
- Licencia: https://huggingface.co/Noctaluna/Noct-Q-Uncensored-Qwen-Image-2.1/blob/main/LICENSE
- Galeria, variantes int4/fp8/bf16/fp16 y valoraciones (Civitai): https://civitai.com/models/2958896
- Text encoder Qwen3-VL 8B int8: https://huggingface.co/Comfy-Org/Qwen-Image-2.1/blob/main/text_encoders/qwen3vl_8b_int8_convrot.safetensors
- VAE Qwen Image 2.1 bf16: https://huggingface.co/Comfy-Org/Qwen-Image-2.1/blob/main/vae/qwen_image_2.1_vae_bf16.safetensors
- Modelo base Qwen/Qwen-Image-2.1: https://huggingface.co/Qwen/Qwen-Image-2.1
