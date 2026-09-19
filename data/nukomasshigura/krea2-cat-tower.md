# nukomasshigura/Krea2-Cat-Tower

## Resumen

Krea2 Cat Tower es un ajuste fino (fine-tune) del modelo de difusion texto-a-imagen Krea 2, publicado por el usuario nukomasshigura en HuggingFace. El modelo parte del checkpoint base `krea/Krea-2-Raw` y se ha entrenado con el objetivo explicito de reforzar el estilo anime, segun indica el propio autor en la model card. No es un modelo de lenguaje: es un generador de imagenes, por lo que conceptos como ventana de contexto o parametros activos no aplican de la misma forma que en un LLM.

El modelo se distribuye bajo la licencia comunitaria krea-2-community-license y su repositorio ocupa 93,6 GB, un tamano coherente con un despliegue multimodal completo (modelo de difusion mas encoder de texto Qwen3-VL 4B, VAE y LoRA Turbo empaquetados por separado en el repositorio oficial de Comfy-Org). No tiene descargas ni likes registrados en el momento de la consulta, y no publica cifras de benchmarks ni una lista de idiomas soportados.

Su relevancia practica esta en que ofrece una via sencilla de obtener ilustracion anime de alta resolucion (1024-2048 px) sobre el ecosistema Krea 2, con integracion directa en ComfyUI (v0.27.0 o superior, y v0.28.0 o superior para la variante INT4 ConvRot) y en Forge Neo 2.27 o superior, ademas de un flujo de inferencia rapido de 8 pasos mediante Turbo LoRA.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusion texto-a-imagen (no se detalla la variante concreta en la informacion disponible); encoder de texto Qwen3-VL 4B |
| Parametros totales | no disponible (el repositorio ocupa 93,6 GB e incluye varias variantes de precision) |
| Parametros activos | no aplicable (no es un modelo MoE) |
| Longitud de contexto | no aplicable; la entrada es un prompt de texto en lenguaje natural |
| Tipos de cuantizacion | bf16 y fp8_scaled para el encoder de texto; variantes INT8 ConvRot e INT4 ConvRot del modelo de difusion |
| Idiomas soportados | no disponible (la model card esta en ingles y los prompts de ejemplo son en ingles) |
| Licencia | krea-2-community-license (etiquetada como "other" en HuggingFace) |
| Formato de pesos | safetensors |
| Modelo base | krea/Krea-2-Raw (fine-tune) |
| Encoder de texto | Qwen3-VL 4B (qwen3vl_4b_bf16 o qwen3vl_4b_fp8_scaled) |
| VAE | qwen_image_vae.safetensors |
| LoRA Turbo | krea2_turbo_lora_rank_64_bf16.safetensors (rango 64) |
| Resolucion de salida | 1024-2048 px |
| Pasos de muestreo recomendados | 8 (CFG scale 1; samplers euler, er_sde; schedulers simple, normal) |
| Tamano del repositorio | 93,6 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La model card no desglosa la arquitectura interna del modelo de difusion; solo especifica el ecosistema de inferencia necesario. Este se compone de un encoder de texto Qwen3-VL de 4B parametros (en bf16 o fp8 escalado), un VAE especifico de Qwen Image y una LoRA Turbo de rango 64 que permite reducir la inferencia a 8 pasos con CFG 1. El modelo base es `krea/Krea-2-Raw`, y la model card indica explicitamente que la version v2.0 del fine-tune esta construida sobre el modelo "Raw", por lo que recomienda aplicar la LoRA Turbo en lugar de trabajar en modo no destilado. El despliegue requiere webuis con soporte de Krea 2 y de INT8 ConvRot (ComfyUI v0.27.0+; v0.28.0+ para INT4 ConvRot, o Forge Neo 2.27+).

En cuanto al entrenamiento, el autor declara que el dataset combina imagenes generadas con CatTower (un checkpoint de Civitai basado en NoobAI XL) junto con imagenes no generadas por IA. El entrenamiento es 100 % en lenguaje natural, sin booru tags, lo que implica que el modelo esta pensado para recibir descripciones en prosa y no listas de etiquetas separadas por comas. La model card recomienda una estructura de prompt jerarquica: sujeto principal y pose/accion, apariencia y ropa, props y materiales, composicion y encuadre, entorno, iluminacion y paleta, y estetica general. No se especifica el numero de tokens, pasos de entrenamiento, ni si se aplicaron tecnicas de RLHF o DPO (no aplicables en el sentido habitual de los LLM).

## Capacidades

- Generacion de imagenes a partir de prompts de texto en lenguaje natural, orientada a ilustracion de estilo anime (estilo por defecto si no se especifica otro).
- Salida en resoluciones de 1024 a 2048 px.
- Inferencia acelerada en 8 pasos mediante LoRA Turbo, con CFG scale 1.
- Soporte de varias variantes de precision (bf16, fp8, INT8 ConvRot, INT4 ConvRot) para ajustar el consumo de memoria.
- Control fino del resultado mediante prompts estructurados: composicion, encuadre, perspectiva, iluminacion, paleta y nivel de detalle.
- Integracion con flujos de trabajo de nodos en ComfyUI y con Forge Neo.
- No se documentan capacidades de edicion de imagen, inpainting, control de pose por esqueleto, vision, audio ni tool calling.

## Casos de uso

- Ilustracion de personajes anime: el modelo esta afinado especificamente para este estilo, por lo que es adecuado para generar fichas de personaje con descripciones detalladas de pelo, ropa y accesorios.
- Concept art para videojuegos o series: la resolucion de hasta 2048 px y el control de composicion e iluminacion permiten producir referencias visuales de calidad de presentacion.
- Generacion de recursos para novelas visuales o comics: el prompt estructurado (sujeto, pose, props, entorno) facilita mantener coherencia descriptiva entre ilustraciones.
- Avatares y retratos de perfil: el modelo funciona bien en planos medios y primeros planos con iluminacion suave.
- Escenas de interior detalladas: los ejemplos de la model card (pabellon de te, cafeteria) muestran buen rendimiento en entornos con muchos objetos y texturas.
- Prototipado rapido de direccion artistica: con 8 pasos y CFG 1, cada iteracion es barata, lo que permite explorar variaciones de paleta y encuadre antes de invertir en un render mas costoso.
- Produccion en lotes dentro de ComfyUI: la combinacion de Turbo LoRA y variantes INT8/INT4 permite desplegar pipelines automatizados en GPUs de gama alta o con offloading.
- Ilustracion de escenas costumbristas o de fantasia urbana: el modelo cubre ropa contemporanea y de fantasia segun los ejemplos publicados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas objetivas (FID, CLIP score, comparativas humanas) ni tablas de evaluacion frente a otros checkpoints. Las unicas referencias de rendimiento son las de muestreo: 8 pasos, CFG 1, samplers euler o er_sde y schedulers simple o normal.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. Como referencia, el repositorio completo ocupa 93,6 GB e incluye varias variantes de precision; el consumo real dependera de la variante elegida (INT4 ConvRot es la mas ligera, bf16 la mas pesada) y del uso de offloading de CPU.
- El autor exige una webui compatible con Krea 2 e INT8 ConvRot: ComfyUI v0.27.0 o superior, y v0.28.0 o superior para INT4 ConvRot; alternativamente Forge Neo 2.27 o superior.
- No se documentan GPU recomendadas concretas (A100, H100, RTX 4090, etc.) ni si el modelo cabe en GPUs de consumo.
- Opciones de despliegue confirmadas: ComfyUI y Forge Neo. No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a un modelo de difusion de este tipo).
- Latencia y throughput: no disponibles. La unica indicacion de velocidad es el uso de 8 pasos de muestreo con Turbo LoRA.

## Comparativa con modelos similares

| Modelo | Relacion | Parametros | Resolucion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Krea2 Cat Tower | Fine-tune de Krea-2-Raw orientado a anime | no disponible | 1024-2048 px | krea-2-community-license | HuggingFace y Civitai |
| krea/Krea-2-Raw | Modelo base sobre el que se entrena | no disponible | no disponible en la informacion | krea-2-community-license | HuggingFace |
| CatTower (NoobAI XL) | Fuente de parte del dataset; checkpoint anime previo | no disponible | no disponible en la informacion | no disponible en la informacion | Civitai |

No se dispone de datos de rendimiento comparativos entre estos modelos; la comparativa se limita a la relacion de derivacion y al ecosistema de despliegue.

## Limitaciones y advertencias

- Artefacto conocido: el autor advierte de que pueden aparecer gotas de sudor en la cara del personaje aunque no se pidan explicitamente en el prompt.
- El estilo por defecto es anime; si no se especifica otro estilo en el prompt, la salida tendra esa estetica.
- No hay informacion sobre sesgos del dataset ni sobre su composicion demografica.
- Riesgo de alucinacion visual: como todo modelo generativo, puede producir anatomia incorrecta, manos deformes o incoherencias entre el prompt y la imagen, especialmente en escenas con muchas figuras.
- No se declara una lista de idiomas soportados; la model card y los prompts de ejemplo estan en ingles, y el modelo esta entrenado con lenguaje natural sin booru tags, lo que puede degradar resultados con listas de etiquetas.
- Licencia krea-2-community-license: es una licencia "other" con condiciones propias recogidas en https://www.krea.ai/krea-2-licensing. Antes de un uso comercial es obligatorio revisar sus terminos; la ficha no puede confirmar si se permite el uso comercial.
- El modelo tiene 0 descargas y 0 likes, sin benchmarks publicos ni validacion externa: la calidad solo esta respaldada por las imagenes de muestra de la model card.
- Requiere dependencias externas (encoder de texto Qwen3-VL 4B, VAE de Qwen Image y LoRA Turbo) que deben descargarse por separado desde el repositorio de Comfy-Org.
- El repositorio ocupa 93,6 GB, lo que implica un coste de almacenamiento y de transferencia considerable.
- Fechas de publicacion del repositorio (2026-09-19) posteriores a la fecha habitual de consulta; conviene verificar el estado actual del repositorio.

## Enlaces

- HuggingFace: https://huggingface.co/nukomasshigura/Krea2-Cat-Tower
- Modelo base: https://huggingface.co/krea/Krea-2-Raw
- Licencia: https://www.krea.ai/krea-2-licensing
- Pagina en Civitai: https://civitai.red/models/2805913/krea2-cat-tower
- Repositorio de Comfy-Org con encoder, VAE y LoRA: https://huggingface.co/Comfy-Org/Krea-2
- Encoder de texto bf16: https://huggingface.co/Comfy-Org/Krea-2/blob/main/text_encoders/qwen3vl_4b_bf16.safetensors
- Encoder de texto fp8 escalado: https://huggingface.co/Comfy-Org/Krea-2/blob/main/text_encoders/qwen3vl_4b_fp8_scaled.safetensors
- VAE: https://huggingface.co/Comfy-Org/Krea-2/blob/main/vae/qwen_image_vae.safetensors
- LoRA Turbo: https://huggingface.co/Comfy-Org/Krea-2/blob/main/loras/krea2_turbo_lora_rank_64_bf16.safetensors
- Guia de prompting de Krea 2: https://github.com/krea-ai/krea-2/blob/main/docs/prompting.md
- Checkpoint CatTower (fuente del dataset): https://civitai.red/models/920709/cat-tower-noobai-xl-checkpoint
- No se han encontrado otros enlaces relevantes en la busqueda web; los resultados obtenidos corresponden a documentacion de Google Maps y no guardan relacion con este modelo.
