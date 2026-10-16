# Abiray/flux-3-image-klein-sd-GGUF

## Resumen

FLUX 3 Image Klein (Step-Distilled) en formato GGUF es una versión cuantizada del checkpoint destilado por pasos de FLUX 3 Image Klein, el modelo de generación y edición de imagen de pesos abiertos de Black Forest Labs (BFL). El modelo original, publicado el 15 de octubre de 2026, tiene 5.548.681.984 parámetros (aproximadamente 5,6B) y cubre tres tareas en un solo modelo: generación texto-a-imagen, edición de imagen y generación multirreferencia con hasta 10 imágenes de referencia. Este repositorio, mantenido por el usuario Abiray, no aporta pesos nuevos: empaqueta el checkpoint destilado (16 pasos) en cuantizaciones GGUF de 1,99 GB a 5,99 GB para su uso con la extensión ComfyUI-GGUF.

La relevancia de esta ficha está en el formato: el checkpoint oficial de BFL se distribuye en safetensors FP8/INT8/NVFP4 y BF16, mientras que las cuantizaciones GGUF permiten ejecutar el modelo en GPUs de consumo con 6-12 GB de VRAM, reduciendo el peso de los pesos de difusión de forma muy agresiva. El modelo conserva capacidades heredadas de la familia FLUX 3, como generación nativa a 4K, edición con precisión de píxel y control de composición mediante bounding boxes.

Se trata de un modelo destilado por pasos: el rango de muestreo recomendado es de 4 a 16 pasos con CFG fijado a 1.0, ya que la guía está destilada dentro del modelo. Este repositorio incluye dos flujos de trabajo de ComfyUI listos para arrastrar y soltar (texto-a-imagen y edición de imagen) y requiere modelos auxiliares externos: el codificador de texto Qwen3-VL 4B en INT8 y el VAE flux2-vae. La licencia aplicable es la FLUX Kommunity License v1.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusion (texto-a-imagen / imagen-a-imagen) con checkpoint destilado por pasos; detalles internos no disponibles en la informacion proporcionada |
| Parametros totales | 5.548.681.984 (aproximadamente 5,6B) |
| Parametros activos | No aplica (no es un modelo MoE segun la informacion disponible) |
| Longitud de contexto | No disponible (el codificador de texto es Qwen3-VL 4B; el autor no especifica longitud de contexto) |
| Tipos de cuantizacion | GGUF: Q2_K, Q3_K_S, Q3_K_M, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 |
| Idiomas soportados | No disponible (no especificado por el autor; los prompts se escriben en lenguaje natural) |
| Licencia | FLUX Kommunity License v1.0 (identificador `other` en HuggingFace) |
| Formato de pesos | GGUF para los pesos de difusion; safetensors para los modelos auxiliares (codificador de texto y VAE) |
| Tamano del repositorio | 32,2 GB (suma de todas las cuantizaciones) |
| Descargas / likes | 1.960 descargas / 18 likes |
| Fecha de publicacion | 15 de octubre de 2026 (actualizado el mismo dia) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base, salvo que se trata de un modelo de imagen con un checkpoint destilado por pasos (16 pasos) y que forma parte de la familia FLUX 3 de Black Forest Labs. El modelo original es un modelo de 5,6B parametros de pesos abiertos que unifica texto-a-imagen, edicion y generacion multirreferencia en un unico modelo. Los datos de entrenamiento (numero de tokens, composicion del dataset, uso de RLHF/DPO) no estan disponibles en la informacion proporcionada.

La innovacion tecnica principal es la destilacion por pasos: el modelo genera imagenes con un rango de 4 a 16 pasos de muestreo, en lugar de los 20-50 pasos habituales en modelos de difusion no destilados, con CFG fijado a 1.0 porque la guia esta incorporada en los pesos. Ademas, BFL publica variantes en FP8, INT8 y NVFP4 realizadas con NVIDIA, y el modelo base incluye capacidades heredadas de FLUX 3: generacion nativa a 4K, edicion con precision de pixel y control de colocacion de elementos mediante bounding boxes. El repositorio de referencia de BFL senala que el modelo se distribuye junto con un prompt upsampler y que no debe usarse sin el.

Este repositorio concreto no modifica el entrenamiento: solo aplica cuantizacion GGUF sobre el checkpoint destilado. Las cuantizaciones K-quant (Q2_K a Q6_K) y Q8_0 son las habituales de `llama.cpp`/ComfyUI-GGUF y afectan a los pesos de difusion, no al codificador de texto ni al VAE.

## Capacidades

- Generacion de imagen a partir de texto (text-to-image) con prompts descriptivos en lenguaje natural.
- Edicion de imagen (image-to-image) con modificaciones de precision de pixel sobre una imagen de entrada.
- Generacion multirreferencia con hasta 10 imagenes de referencia.
- Control de composicion mediante bounding boxes: permite situar elementos en zonas concretas o confinar una edicion a un area definida.
- Generacion nativa a 4K (capacidad heredada del modelo FLUX 3 Image completo).
- Destilacion por pasos: inferencia en 4-16 pasos con CFG 1.0.
- Integracion con ComfyUI mediante flujos de trabajo preconfigurados para texto-a-imagen y edicion.
- Compatibilidad con ComfyUI-GGUF para cargar las cuantizaciones.
- No se documentan capacidades de tool calling, agentes, vision o audio: es un modelo de generacion de imagen, no un LLM.

## Casos de uso

- Generacion de imagenes en equipos de consumo: con las cuantizaciones Q4_K_M (3,27 GB) o Q5_K_M (3,95 GB) el modelo se puede ejecutar en GPUs de 8-12 GB de VRAM, lo que permite crear imagenes a 4K en estaciones de trabajo sin GPU de datacenter.
- Edicion de fotografia por instrucciones: usando el flujo de edicion de imagen, se puede modificar una fotografia existente (por ejemplo, cambiar la iluminacion o anadir un objeto) manteniendo el resto de la escena intacta, gracias a la edicion con precision de pixel.
- Composicion publicitaria con control de layout: los bounding boxes permiten colocar un producto en una posicion concreta del encuadre y generar variantes manteniendo el resto de la composicion, util para creatividades de marketing.
- Generacion multirreferencia para diseno de producto: con hasta 10 imagenes de referencia se pueden mezclar estilos, materiales o vistas de un objeto y generar nuevas imagenes coherentes para catalogos.
- Prototipado rapido en pipelines de ComfyUI: los flujos JSON incluidos permiten integrar la generacion en una interfaz grafica de nodos y encadenarla con otros nodos (upscalers, postproceso) sin escribir codigo.
- Iteracion rapida con bajo presupuesto de computo: al requerir entre 4 y 16 pasos y CFG 1.0, el coste por imagen es reducido en comparacion con modelos de difusion no destilados, lo que facilita la generacion por lotes.
- Pruebas de concepto en hardware limitado: la cuantizacion Q3_K_S (2,55 GB) permite validar prompts y flujos en GPUs de 6 GB antes de escalar a cuantizaciones de mayor fidelidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card y los resultados de busqueda no incluyen metricas cuantitativas (FID, CLIP score, MMLU, HumanEval u otras), por lo que no se presentan tablas comparativas de rendimiento.

## Requisitos de hardware

- VRAM estimada segun cuantizacion (solo pesos de difusion, sin contar codificador de texto ni VAE):
  - Q2_K: 1,99 GB (experimental, propenso a artefactos visuales).
  - Q3_K_S / Q3_K_M: 2,55 GB (GPUs de 6 GB).
  - Q4_K_S / Q4_K_M: 3,27 GB (GPUs de 8-12 GB).
  - Q5_K_S / Q5_K_M: 3,95 GB (GPUs de 10-12 GB; Q5_K_M marcado como mejor relacion calidad/precio).
  - Q6_K: 4,67 GB (GPUs de 12-16 GB).
  - Q8_0: 5,99 GB (GPUs de 16 GB o mas).
- Modelos auxiliares obligatorios: codificador de texto `qwen3vl_4b_int8_convrot.safetensors` (o BF16) y VAE `flux2-vae.safetensors`, ambos del repositorio oficial de BFL. Su consumo de VRAM adicional no esta especificado en la informacion proporcionada.
- Cabe en GPU de consumo: si, segun el autor, desde GPUs de 6 GB (Q3_K_S) hasta 16 GB o mas (Q8_0). Los resultados de busqueda mencionan builds INT8 de BFL que funcionan en tarjetas RTX de 8 GB.
- Opciones de despliegue: ComfyUI con la extension ComfyUI-GGUF (city96); flujos JSON preconfigurados incluidos en el repositorio; los pesos originales en safetensors son compatibles con Diffusers.
- Ajustes recomendados de muestreo: sampler `euler`, scheduler `simple`, 4-16 pasos, CFG/guidance scale 1.0.
- Latencia y throughput: no disponibles. No se proporcionan mediciones de tiempo por imagen ni imagenes por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Contexto / capacidades | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| FLUX 3 Image Klein Step-Distilled GGUF (este repositorio) | 5,6B | GGUF (Q2_K-Q8_0) + safetensors auxiliares | Texto-a-imagen, edicion, hasta 10 referencias, 4K, bounding boxes, 4-16 pasos | FLUX Kommunity License v1.0 | HuggingFace (Abiray) |
| FLUX 3 Image Klein (base, BFL) | 5,6B | Safetensors FP8/INT8/NVFP4/BF16 | Mismas capacidades, checkpoint base ajustable | FLUX Kommunity License v1.0 | HuggingFace (black-forest-labs), GitHub |
| FLUX 3 Image (completo) | No disponible | No disponible | Capacidades nucleares compartidas con Klein segun BFL (4K nativo, edicion precisa, bounding boxes) | No disponible | No disponible |

No se dispone de datos de benchmarks ni de especificaciones detalladas de otras alternativas (por ejemplo, modelos de difusion de la competencia con edicion integrada) en la informacion proporcionada, por lo que no se puede establecer una comparacion cuantitativa de rendimiento.

## Limitaciones y advertencias

- La cuantizacion Q2_K esta marcada por el autor como experimental y propensa a artefactos visuales; solo recomendada para pruebas de bajo consumo.
- Las cuantizaciones K-quant introducen perdida de fidelidad progresiva: el autor situa Q6_K como casi sin perdida y Q8_0 como fidelidad de referencia.
- El repositorio no incluye los modelos auxiliares: sin el codificador de texto Qwen3-VL 4B y el VAE flux2-vae, el modelo no funciona. Hay que descargarlos por separado del repositorio oficial de BFL.
- El repositorio de referencia de BFL indica que el modelo debe usarse junto con un prompt upsampler; no usarlo puede degradar la calidad de los resultados.
- CFG debe mantenerse en 1.0: la guia esta destilada en el modelo y modificarla puede romper la generacion.
- No se documentan idiomas soportados ni sesgos conocidos en la informacion proporcionada.
- La licencia FLUX Kommunity License v1.0 es una licencia "other" (no estandar OSI). Es imprescindible revisar el texto completo antes de cualquier uso comercial o redistribucion.
- Al ser un modelo de generacion de imagen, existe riesgo de alucinacion visual (elementos incoherentes, texto malformado en la imagen, anatomias incorrectas), inherente a los modelos de difusion.
- No se proporcionan detalles sobre limites de resolucion efectiva distintos de 4K nativo, ni sobre el impacto de la cuantizacion en tareas de edicion frente a generacion.

## Enlaces

- Repositorio HuggingFace de las cuantizaciones GGUF: https://huggingface.co/Abiray/flux-3-image-klein-sd-GGUF
- Modelo base en HuggingFace: https://huggingface.co/black-forest-labs/flux-3-image-klein
- Repositorio ComfyUI del modelo base: https://huggingface.co/black-forest-labs/flux-3-image-klein-comfy
- Licencia FLUX Kommunity v1.0: https://huggingface.co/black-forest-labs/flux-3-image-klein-comfy/blob/main/LICENSE.md
- Blog de BFL sobre FLUX 3 Image Klein: https://bfl.ai/blog/flux-3-image-klein
- Repositorio de codigo de referencia en GitHub: https://github.com/black-forest-labs/flux-3-image-klein
- ComfyUI-GGUF: https://github.com/city96/ComfyUI-GGUF
- Flujo de trabajo texto-a-imagen (JSON): https://huggingface.co/Abiray/flux-3-image-klein-sd-GGUF/blob/main/image_flux3_klein_distilled_t2i_GGUF.json
- Flujo de trabajo edicion de imagen (JSON): https://huggingface.co/Abiray/flux-3-image-klein-sd-GGUF/blob/main/image_flux3_klein_distilled_image_edit_GGUF.json
- Codificadores de texto oficiales: https://huggingface.co/black-forest-labs/flux-3-image-klein-comfy/tree/main/text_encoders
- VAE oficial: https://huggingface.co/black-forest-labs/flux-3-image-klein-comfy/tree/main/vae
- Noticia sobre el lanzamiento: https://aicoder.com/news/news-20261016-bfl-flux-3-image-klein-5-6b-open-weights
- Guia de ejecucion local: https://www.logeshwaran.org/2026/10/flux-3-image-klein-run-locally.html
