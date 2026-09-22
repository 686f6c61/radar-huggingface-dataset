# JohnsonHsu/Qwen-Image-2.1-GGUF

## Resumen

JohnsonHsu/Qwen-Image-2.1-GGUF es un repositorio de cuantizaciones en formato GGUF del modelo de generacion de imagenes Qwen/Qwen-Image-2.1, publicado por el usuario JohnsonHsu. No se trata de un modelo entrenado desde cero, sino de una conversion de los pesos originales de Qwen con el objetivo de reducir el espacio en disco y el consumo de VRAM, de forma que el modelo pueda ejecutarse en GPU de consumo mediante ComfyUI y el nodo ComfyUI-GGUF.

El modelo base es un sistema de text-to-image con 7.115.124.736 parametros declarados en el repositorio asociado, que se distribuye acompanado de un text encoder basado en Qwen3-VL de 8B parametros (en BF16 o Int8) y de un VAE especifico (qwen_image_2.1_vae_bf16). El repositorio ocupa 54,9 GB e incluye tanto las cinco cuantizaciones del transformer de difusion como los archivos complementarios necesarios para el pipeline completo.

La relevancia de esta publicacion es practica: permite desplegar localmente un modelo de generacion de imagenes de la familia Qwen sin depender de servicios en la nube, con opciones que van desde 4,05 GB (Q4_0) hasta 7,59 GB (Q8_0) para el componente de difusion. La licencia es la Qwen Research License, lo que condiciona su uso comercial, y la model card indica explicitamente que la version publicada no incorpora filtro de seguridad ni censura de contenido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible en detalle; modelo de difusion para text-to-image (pesos convertidos con stable-diffusion.cpp). El pipeline usa un text encoder Qwen3-VL 8B y un VAE especifico |
| Parametros totales | 7.115.124.736 (dato declarado en el repositorio, safetensors) |
| Parametros activos | No aplica (no se describe como MoE en la informacion disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | GGUF: Q8_0, Q6_K, Q5_K_M, Q4_K_M (recomendada), Q4_0 |
| Idiomas soportados | No disponible en la model card; el text encoder Qwen3-VL 8B es multilingue, pero no se detalla el alcance por idioma |
| Licencia | Qwen Research License (license: other, license_name: qwen-research) |
| Formato de pesos | GGUF (transformer); safetensors para text encoder (BF16/Int8) y VAE (BF16) |

Tamano de los archivos GGUF del transformer:

| Cuantizacion | Archivo | Tamano |
|---|---|---:|
| Q8_0 | qwen-image-2.1-Q8_0.gguf | 7,59 GB |
| Q6_K | qwen-image-2.1-Q6_K.gguf | 5,88 GB |
| Q5_K_M | qwen-image-2.1-Q5_K_M.gguf | 5,22 GB |
| Q4_K_M | qwen-image-2.1-Q4_K_M.gguf | 4,60 GB |
| Q4_0 | qwen-image-2.1-Q4_0.gguf | 4,05 GB |

Archivos complementarios:

| Tipo | Archivo | Precision | Tamano |
|---|---|---|---:|
| Text encoder | text_encoders/qwen3vl_8b_bf16.safetensors | BF16 | 17,53 GB |
| Text encoder | text_encoders/qwen3vl_8b_int8_convrot.safetensors | Int8 | 9,35 GB |
| VAE | vae/qwen_image_2.1_vae_bf16.safetensors | BF16 | 676 MB |

## Arquitectura y entrenamiento

Este repositorio no documenta entrenamiento propio: es una conversion de pesos (relacion base_model_relation: quantized) del modelo Qwen/Qwen-Image-2.1. El proceso de conversion se realizo con stable-diffusion.cpp, commit 1330cebae8f2ba99249df846cc0c9444fcbd4308, sobre la revision b3179ad355be050328e483a9dfdd9e60cd62adfa del modelo original. La model card no especifica el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de alineacion como RLHF o DPO en el modelo base.

El pipeline es multimodal en su composicion: un transformer de difusion cuantizado en GGUF constituye el componente generativo, un text encoder basado en Qwen3-VL 8B se encarga de la codificacion del prompt textual y un VAE dedicado realiza la codificacion y decodificacion entre espacio latente e imagen. La innovacion tecnica principal del repositorio es la propia cuantizacion GGUF y su integracion con ComfyUI, que permite offloading selectivo de componentes entre VRAM y RAM del sistema. La model card no describe innovaciones de arquitectura propias (atencion lineal, decodificacion especulativa ni mecanismos similares) porque no introduce cambios en el modelo base.

## Capacidades

- Generacion de imagenes a partir de texto (pipeline text-to-image) usando prompts en lenguaje natural procesados por el text encoder Qwen3-VL 8B.
- Edicion de imagenes: el repositorio referencia plantillas oficiales de Comfy-Org tanto para text-to-image como para image edit (image_qwen_image_2_1_t2i.json e image_qwen_image_2_1_image_edit.json).
- Ejecucion local offline en GPU de consumo gracias a las cinco cuantizaciones GGUF disponibles.
- Integracion con ComfyUI mediante el nodo Unet Loader (GGUF) del fork leejet/ComfyUI-GGUF, que anade soporte nativo para Qwen-Image 2.1.
- Composicion con archivos auxiliares empaquetados en el mismo repositorio (text encoder y VAE), lo que evita dependencias externas.
- Generacion sin filtro de seguridad integrado: la model card indica que no hay safety checker ni filtro de contenido, por lo que las respuestas dependen unicamente del prompt y del entorno de ejecucion.
- No se documentan en la informacion disponible capacidades de tool calling, function calling, agentes, audio, thinking mode ni otras modalidades adicionales.

## Casos de uso

- Generacion local de imagenes en equipos de consumo: con Q4_K_M (4,60 GB) en VRAM y el text encoder Int8 (9,35 GB) en RAM, un usuario con una GPU de gama media-alta puede generar imagenes sin conexion a servicios externos.
- Produccion de arte conceptual y bocetos iterativos: la plantilla oficial de text-to-image permite encadenar prompts y semillas dentro de ComfyUI para explorar variaciones de estilo con coste marginal nulo por imagen.
- Edicion y retoque guiado por prompt: la plantilla de image edit del modelo base permite modificar imagenes existentes, un flujo util para retoque de fotografias de producto o correccion de composiciones.
- Aumento de datasets sinteticos: generacion por lotes de imagenes etiquetadas para entrenar otros modelos de vision, aprovechando la ausencia de filtro de contenido para cubrir categorias que otros modelos rechazan.
- Investigacion sobre cuantizacion de modelos de difusion: comparar Q8_0, Q6_K, Q5_K_M, Q4_K_M y Q4_0 permite medir el impacto de la precision en la calidad final de la imagen con el mismo prompt y semilla.
- Desarrollo de interfaces personalizadas: el modelo puede invocarse desde scripts propios mediante stable-diffusion.cpp o desde nodos de ComfyUI, integrándose en herramientas internas de diseno grafico.
- Generacion de material visual para prototipado rapido de producto: mockups, variaciones de packaging o conceptos de interfaz generados de forma masiva antes de pasar a produccion.
- Contenido adulto o sensible bajo responsabilidad del operador: el modelo declara no aplicar rechazos por prompt, lo que lo hace utilizable en entornos donde se requiere control total sobre el contenido generado y la moderacion se delega al pipeline.

## Benchmarks y rendimiento

No se han publicado resultados numericos de benchmarks en la informacion disponible. La model card incluye una imagen de referencia (assets/Qwen-Image-2.1-Benchmark.png) pero no reproduce cifras concretas de metricas como FID, CLIPScore, MMLU, HumanEval o GSM8K, que por otra parte no aplican a un modelo de generacion de imagenes.

## Requisitos de hardware

- VRAM para el transformer de difusion segun cuantizacion: 7,59 GB (Q8_0), 5,88 GB (Q6_K), 5,22 GB (Q5_K_M), 4,60 GB (Q4_K_M) y 4,05 GB (Q4_0), asumiendo que se mantiene completamente en VRAM.
- Text encoder: 17,53 GB en BF16 o 9,35 GB en Int8. La model card recomienda ejecutarlo en RAM del sistema o hacer offload a CPU, ya que solo se ejecuta una vez por prompt.
- VAE: 676 MB en BF16.
- Configuracion recomendada por el autor: diffusion Q4_K_M en VRAM (~4,6 GB) y text encoder Int8 en RAM (~9,35 GB), lo que suma en torno a 14 GB entre VRAM y memoria del sistema.
- GPU de consumo: la configuracion Q4_K_M mas text encoder en RAM es viable en tarjetas con 8 GB de VRAM o mas. Existe un modo de bajo consumo activando el argumento --lowvram en ComfyUI si aparecen errores de memoria.
- GPU profesionales: no se especifican modelos concretos (A100, H100, RTX 4090) en la documentacion. Cualquier GPU con suficiente VRAM y soporte de CUDA puede ejecutar el modelo; con cuantizaciones altas y encoder en GPU se reduce el trafico CPU-GPU.
- Opciones de despliegue: ComfyUI con el nodo ComfyUI-GGUF (fork leejet, con soporte nativo de Qwen-Image 2.1) y stable-diffusion.cpp. No se menciona soporte de vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo de difusion de este tipo.
- Latencia y throughput: no disponibles. La model card solo indica que el offloading del text encoder a RAM no afecta practicamente a la velocidad de generacion porque la codificacion de texto ocurre una vez por prompt.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de comparativas publicadas en la informacion proporcionada frente a otros modelos de generacion de imagenes. La unica comparacion documentada es interna al propio repositorio, entre las cuantizaciones del mismo modelo:

| Variante | Tamano del transformer | Text encoder asociado | Notas |
|---|---:|---|---|
| Q8_0 | 7,59 GB | BF16 (17,53 GB) o Int8 (9,35 GB) | Mayor fidelidad respecto a los pesos originales, mayor coste de VRAM |
| Q6_K | 5,88 GB | BF16 o Int8 | Compromiso intermedio |
| Q5_K_M | 5,22 GB | BF16 o Int8 | Compromiso intermedio |
| Q4_K_M | 4,60 GB | BF16 o Int8 | Recomendada por el autor por equilibrio tamano/calidad |
| Q4_0 | 4,05 GB | BF16 o Int8 | Menor huella, mayor perdida de calidad esperada |
| Modelo base sin cuantizar (Qwen/Qwen-Image-2.1) | no disponible | no disponible | Referencia original; el repositorio no publica su tamano en disco |

Comparativa con alternativas externas de la misma categoria: no disponible.

## Limitaciones y advertencias

- Licencia Qwen Research License: es una licencia de investigacion, no una licencia permisiva. Es imprescindible revisar sus terminos antes de cualquier uso comercial o de redistribucion.
- Ausencia de filtro de seguridad: la model card advierte de que esta version no incluye safety checker ni filtro de contenido, por lo que puede generar imagenes adultas, NSFW o sensibles sin rechazo de prompt. La responsabilidad de moderacion recae enteramente en el operador.
- Riesgo de alucinacion visual: como todo modelo generativo de imagenes, puede producir anatomia incorrecta, texto ilegible dentro de la imagen, incoherencias de perspectiva o elementos que no corresponden al prompt.
- Perdida de calidad por cuantizacion: las variantes Q4_0 y Q4_K_M, aunque funcionales, degradan la fidelidad respecto a Q8_0. No se han publicado metricas objetivas que cuantifiquen esa perdida.
- Idiomas: la model card no especifica la cobertura linguistica del pipeline completo; el rendimiento con prompts en castellano no esta documentado.
- Longitud de contexto: no disponible, lo que limita la planificacion de prompts muy largos o composiciones complejas con muchas restricciones.
- Inconsistencia en los enlaces de la model card: las tablas de archivos apuntan a rutas del repositorio abenzerps/Qwen-Image-2.1-GGUF, mientras que el repositorio publicado es JohnsonHsu/Qwen-Image-2.1-GGUF. Conviene verificar la disponibilidad real de cada archivo antes de automatizar descargas.
- Requisito de version especifica de ComfyUI-GGUF: si se usa el fork antiguo city96/ComfyUI-GGUF puede aparecer el error "Unknown model architecture!", por lo que hay que emplear el fork leejet o anadir ModelQwenImage a tools/convert.py.
- Estado del repositorio: sin descargas ni likes registrados en el momento de la consulta, creado y actualizado el mismo dia, lo que implica ausencia de validacion por parte de la comunidad.
- La model card anuncia una version "fully uncensored" en desarrollo que se anadira al repositorio, lo que puede cambiar el contenido disponible en el futuro.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/JohnsonHsu/Qwen-Image-2.1-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen-Image-2.1
- Text encoder y VAE de origen: https://huggingface.co/Comfy-Org/Qwen-Image-2.1
- ComfyUI: https://github.com/comfyanonymous/ComfyUI
- ComfyUI-GGUF (fork con soporte Qwen-Image 2.1): https://github.com/leejet/ComfyUI-GGUF
- stable-diffusion.cpp: https://github.com/leejet/stable-diffusion.cpp
- Plantilla oficial text-to-image: https://github.com/Comfy-Org/workflow_templates/blob/main/templates/image_qwen_image_2_1_t2i.json
- Plantilla oficial image edit: https://github.com/Comfy-Org/workflow_templates/blob/main/templates/image_qwen_image_2_1_image_edit.json
- Checksums: https://huggingface.co/JohnsonHsu/Qwen-Image-2.1-GGUF/blob/main/SHA256SUMS
