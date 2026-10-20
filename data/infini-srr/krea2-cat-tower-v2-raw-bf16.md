# Infini-Srr/Krea2-Cat-Tower-v2-Raw-BF16

## Resumen

Krea2-Cat-Tower-v2-Raw-BF16 es un ajuste fino (fine-tune) del modelo de generación de imágenes Krea 2 Raw, publicado por el usuario Infini-Srr en HuggingFace. Su objetivo declarado es reforzar el estilo anime respecto al modelo base, partiendo del linaje Cat Tower y entrenado con una mezcla de imágenes sintéticas generadas con CatTower (checkpoint de NoobAI-XL) e imágenes no generadas por IA. Se distribuye en un único repositorio de 26,3 GB en precisión BF16, con pesos en formato safetensors.

El modelo no es autónomo: para inferencia requiere componentes externos del ecosistema Krea 2, en concreto un text encoder Qwen3-VL 4B (en bf16 o fp8 escalado), el VAE `qwen_image_vae` y el Turbo LoRA oficial de rango 64. La model card recomienda explícitamente usar el Turbo LoRA porque esta versión se construye sobre el modelo Raw, lo que permite generar en 8 pasos con CFG 1. El soporte de software está acotado a ComfyUI v0.27.0 o superior (v0.28.0 para la variante INT4 ConvRot) y Forge Neo 2.27 o superior.

Su relevancia es acotada pero concreta: es un checkpoint especializado en anime para la familia Krea 2, con prompting 100 % en lenguaje natural (sin booru tags), pensado para flujos de trabajo en ComfyUI. En el momento de la ficha el repositorio no registra descargas ni likes, no publica benchmarks y no detalla el número de parámetros ni la arquitectura interna del backbone, por lo que su evaluación debe hacerse por prueba directa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusion texto-a-imagen de la familia Krea 2; detalles del backbone no disponibles |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible; el codificador de texto es Qwen3-VL 4B y los prompts se escriben en lenguaje natural |
| Tipos de cuantizacion | BF16 (este repositorio); INT8 ConvRot e INT4 ConvRot soportados por el ecosistema Krea 2; text encoder en bf16 o fp8_scaled |
| Idiomas soportados | no disponible (los ejemplos y la guia de prompting estan en ingles) |
| Licencia | krea-2-community-license (etiquetada como `other`) |
| Formato de pesos | safetensors (BF16) |
| Tamano del repositorio | 26,3 GB |
| Resolucion recomendada | 1024-2048 px |
| Pasos de muestreo recomendados | 8 (con Turbo LoRA) |
| CFG scale recomendado | 1 |
| Samplers recomendados | euler, er_sde |
| Schedulers recomendados | simple, normal |
| Componentes requeridos | Text encoder Qwen3-VL 4B, VAE `qwen_image_vae`, Turbo LoRA `krea2_turbo_lora_rank_64_bf16` |
| Software compatible | ComfyUI v0.27.0+ (v0.28.0+ para INT4 ConvRot); Forge Neo 2.27+ |
| Modelo base | krea/Krea-2-Raw |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura interna del backbone (numero de bloques, tipo de atencion, parametros totales). Lo que si se detalla es el pipeline de inferencia: un text encoder Qwen3-VL 4B para procesar el prompt, un VAE especifico de Qwen-Image para codificar y decodificar latentes, y un Turbo LoRA de rango 64 que adapta el modelo Raw a muestreo de pocos pasos. El checkpoint se distribuye en BF16 y el ecosistema admite variantes cuantizadas INT8 e INT4 mediante ConvRot, lo que sugiere pesos convolucionales o lineales cuantizables en ese formato.

En cuanto al entrenamiento, la model card indica dos fuentes de datos: un conjunto de imágenes generadas con CatTower (checkpoint de NoobAI-XL) y un conjunto de imágenes no generadas por IA. El entrenamiento es 100 % en lenguaje natural, sin booru tags, lo que condiciona tanto el estilo de los prompts como el comportamiento esperado del modelo. No se especifican el numero de imágenes, el numero de pasos de entrenamiento, la resolucion de entrenamiento, el uso de RLHF/DPO (no aplicable en difusion) ni si hubo entrenamiento con preferencias humanas. Tampoco se documenta que se hayan congelado o entrenado el text encoder o el VAE.

## Capacidades

- Generacion de imágenes texto-a-imagen con resoluciones de 1024 a 2048 px.
- Especializacion en estetica anime por defecto: si el prompt no especifica otro estilo, la salida tiende a ilustracion anime.
- Interpretacion de prompts largos y descriptivos en lenguaje natural, estructurados por subject, apariencia, props, composicion, entorno, iluminacion y medio.
- Generacion en pocos pasos (8) con CFG 1 gracias al Turbo LoRA, lo que reduce el coste por imagen frente a un muestreo completo del modelo Raw.
- Control de composicion, encuadre, vestuario, materiales e iluminacion mediante descripcion textual detallada.
- Soporte de cuantizacion INT8 e INT4 ConvRot para reducir requisitos de memoria.
- No soporta tool calling, function calling ni uso como agente.
- No es un modelo de texto: no genera lenguaje, codigo ni matematicas.
- No se documentan capacidades de vision de entrada, edicion de imagen, inpainting, outpainting ni control por pose o profundidad.
- Capacidades multilingues: no confirmadas para este checkpoint; el material de referencia esta en ingles.

## Casos de uso

- Ilustracion de personajes para proyectos de anime y manga: el modelo genera personajes completos con vestuario y accesorios descritos en detalle, adecuado para bocetos de personajes o laminas promocionales.
- Key visuals y portadas: con resoluciones de hasta 2048 px y control de iluminacion, paleta y composicion, sirve para portadas de novelas ligeras, fasciculos o musica.
- Prototipado rapido de direccion de arte: al generar en 8 pasos con CFG 1, permite iterar decenas de variaciones de una escena antes de fijar el diseno final.
- Creacion de fondos y escenarios: los prompts estructurados por entorno, perspectiva y luz permiten generar interiores, paisajes o decorados coherentes con una escena descrita.
- Contenido para redes y material promocional: imagenes de formato vertical u horizontal en estilo anime para publicaciones, banners y thumbnails, con la ventaja de no requerir prefijos de estilo.
- Integracion en pipelines de ComfyUI: al ser un checkpoint compatible con ComfyUI 0.27+, se puede encadenar con nodos de upscaling, segmentacion o postprocesado para produccion por lotes.
- Base para experimentacion con fine-tunes o LoRA: el checkpoint en BF16 actua como punto de partida para quien quiera ajustar el estilo anime sobre Krea 2 Raw sin partir del modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay puntuaciones de FID, CLIP score, HPS, imagenes de evaluacion comparativa ni comparaciones numericas con otros checkpoints de anime en la model card ni en el repositorio.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: el repositorio pesa 26,3 GB, a los que hay que sumar el text encoder Qwen3-VL 4B (aproximadamente 8 GB en bf16) y el VAE. Se estima un entorno de 35-40 GB de VRAM para el pipeline completo sin cuantizar; no es una cifra oficial.
- VRAM estimada con text encoder fp8_scaled: reduce el codificador a unos 4 GB, dejando el conjunto en torno a 30-32 GB; sigue requiriendo GPU de 40 GB o mas para trabajar con margen.
- VRAM estimada con transformer en INT8 ConvRot: los pesos del modelo se reducen aproximadamente a la mitad, por lo que el pipeline podria situarse en 18-22 GB; cabe en RTX 4090 (24 GB), RTX 3090 (24 GB) y RTX 6000 Ada (48 GB) con holgura variable.
- VRAM estimada con transformer en INT4 ConvRot: reduccion adicional hasta unos 7-9 GB de pesos, lo que podria permitir ejecucion en GPUs de 12-16 GB (RTX 4080, RTX 4070 Ti Super, RTX 4060 Ti 16 GB), sujeto a la resolucion y al resto del pipeline.
- GPU recomendadas para BF16 sin cuantizar: A100 40/80 GB, H100 80 GB, L40S 48 GB, RTX 6000 Ada 48 GB.
- GPU de consumo: si cabe en RTX 4090 y RTX 3090 con INT8, y previsiblemente en RTX 4080/4070 Ti Super con INT4; en 8-12 GB no hay datos que confirmen viabilidad.
- Opciones de despliegue: ComfyUI v0.27.0+ (v0.28.0+ para INT4 ConvRot) y Forge Neo 2.27+. No se documenta soporte en vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a este tipo de modelo.
- Latencia y throughput: no disponibles. Como referencia cualitativa, el uso de 8 pasos con Turbo LoRA reduce el numero de evaluaciones del modelo frente a un muestreo completo, pero no se publican tiempos por imagen ni imagenes por segundo en ninguna GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Resolucion / contexto | Enfoque | Pasos recomendados | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Krea2-Cat-Tower-v2-Raw-BF16 (este modelo) | no disponible | 1024-2048 px; contexto de texto no disponible | Fine-tune anime sobre Krea 2 Raw | 8 con Turbo LoRA | krea-2-community-license | HuggingFace, 0 descargas |
| krea/Krea-2-Raw | no disponible | no disponible | Modelo base texto-a-imagen | no disponible (requiere Turbo LoRA para pocos pasos) | krea-2-community-license | HuggingFace |
| Krea2-Cat-Tower (linaje Cat Tower) | no disponible | no disponible | Fine-tune anime previo | no disponible | no disponible | Repositorio enlazado en la model card; ficha en Civitai |

La comparacion cuantitativa no es posible: no hay parametros, benchmarks ni especificaciones de contexto publicadas para ninguno de los tres. La diferencia documentada se limita al enfoque (estilo anime), a la dependencia del Turbo LoRA y al formato de distribucion.

## Limitaciones y advertencias

- Licencia `krea-2-community-license`: no es una licencia permisiva generica. Antes de usar el modelo en productos comerciales hay que revisar los terminos enlazados en la model card; no se detallan aqui las restricciones concretas.
- Sin benchmarks ni evaluacion independiente: no hay evidencia numerica de calidad, fidelidad al prompt ni superioridad frente al modelo base.
- Sesgo estetico hacia el anime: si el prompt no especifica estilo, la salida sera anime por defecto, lo que limita su uso para fotorrealismo o ilustracion no japonesa.
- Datos de entrenamiento parcialmente sinteticos: una parte del dataset proviene de imagenes generadas con CatTower, lo que puede introducir artefactos y sesgos heredados de ese checkpoint.
- Artefacto conocido: pueden aparecer gotas de sudor en la cara del personaje aunque no se hayan pedido en el prompt, segun la propia model card.
- Fidelidad al prompt: no se documenta tasa de exito en composiciones complejas, texto dentro de la imagen, manos o multiples personajes; son riesgos habituales en difusion que deben validarse por prueba.
- Idioma: no se confirma soporte de prompts en castellano; el material de referencia y los ejemplos estan en ingles y el modelo se entreno con lenguaje natural sin booru tags, por lo que mezclar estilos de prompt puede degradar el resultado.
- Dependencia de versiones: requiere ComfyUI 0.27.0+ o Forge Neo 2.27+, y 0.28.0+ para INT4 ConvRot; versiones anteriores no son compatibles.
- Dependencia de componentes externos: sin el text encoder Qwen3-VL 4B, el VAE y el Turbo LoRA el checkpoint no es utilizable; hay que descargar varios archivos adicionales.
- Repositorio sin traccion: 0 descargas y 0 likes en el momento de la ficha, sin garantia de mantenimiento ni soporte por parte del autor.
- No apto para tareas de texto, razonamiento, codigo o agentes: es exclusivamente un modelo generativo de imagen.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Infini-Srr/Krea2-Cat-Tower-v2-Raw-BF16
- Modelo base: https://huggingface.co/krea/Krea-2-Raw
- Repositorio de componentes de Krea 2 en Comfy-Org: https://huggingface.co/Comfy-Org/Krea-2
- Text encoder bf16: https://huggingface.co/Comfy-Org/Krea-2/blob/main/text_encoders/qwen3vl_4b_bf16.safetensors
- Text encoder fp8 escalado: https://huggingface.co/Comfy-Org/Krea-2/blob/main/text_encoders/qwen3vl_4b_fp8_scaled.safetensors
- VAE: https://huggingface.co/Comfy-Org/Krea-2/blob/main/vae/qwen_image_vae.safetensors
- Turbo LoRA: https://huggingface.co/Comfy-Org/Krea-2/blob/main/loras/krea2_turbo_lora_rank_64_bf16.safetensors
- Guia de prompting de Krea 2: https://github.com/krea-ai/krea-2/blob/main/docs/prompting.md
- Licencia Krea 2: https://www.krea.ai/krea-2-licensing
- Ficha en Civitai: https://civitai.red/models/2805913/krea2-cat-tower
- Repositorio del linaje Cat Tower referenciado en la model card: https://huggingface.co/nukomasshigura/Krea2-Cat-Tower
- Checkpoint CatTower usado para generar parte del dataset: https://civitai.red/models/920709/cat-tower-noobai-xl-checkpoint

Nota: la busqueda web realizada no devolvio resultados relevantes sobre este modelo; los enlaces anteriores proceden de la model card y del repositorio de HuggingFace.
