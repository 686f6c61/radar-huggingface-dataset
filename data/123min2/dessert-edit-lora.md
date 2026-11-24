# 123min2/dessert-edit-lora

## Resumen

Dessert-edit-lora es un adaptador LoRA para edición de imágenes basado en el modelo InstructPix2Pix de Tim Brooks. Lo desarrolla el usuario 123min2 y está especializado en la edición localizada de fotografías de postres: recibe una imagen y una instrucción en lenguaje natural (por ejemplo, «Replace the strawberries with blueberries») y modifica únicamente la región indicada, preservando el resto de la composición. El adaptador se publica como pesos LoRA de rango 16 aplicados sobre las proyecciones de atención del U-Net, lo que permite cargarlo sobre la pipeline estándar de InstructPix2Pix con `diffusers` sin reentrenar el modelo base.

El modelo resuelve un problema acotado pero útil: la edición semántica controlada por texto en un dominio visual concreto (repostería), donde los modelos genéricos de edición instruccional tienden a alterar zonas no solicitadas o a producir artefactos en texturas finas como glaseados, frutas y virutas. Al estar ajustado sobre pares de edición generados con un pipeline de anotación automática (Qwen3-VL, Grounding DINO, SAM 2.1 y SDXL inpainting) y filtrados por un juez VLM y revisión manual, el adaptador aprende a respetar la instrucción y a mantener la coherencia del fondo.

Es relevante ahora por su carácter de ejemplo reproducible de un flujo de ajuste fino LoRA para edición de imágenes en un dominio estrecho, con un dataset derivado de Food-101 y una receta de entrenamiento documentada. No obstante, el repositorio está vacío (0,0 GB), no tiene descargas ni likes, y la model card no aporta licencia, idiomas ni resultados de evaluación, por lo que su uso en producción exige verificación previa de los pesos y de las condiciones legales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre U-Net de un modelo de difusión (InstructPix2Pix, basado en Stable Diffusion 1.x) |
| Parametros totales | no disponible (LoRA de rango 16; el modelo base no se distribuye en este repositorio) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de imagen; condicionamiento por prompt de texto, sin ventana de contexto declarada) |
| Tipos de cuantizacion | no disponible (los pesos LoRA se publican en el formato de `diffusers`; el modelo base admite las cuantizaciones habituales de SD 1.x) |
| Idiomas soportados | no disponible (las instrucciones de la model card están en inglés) |
| Licencia | no disponible |
| Formato de pesos | no disponible en la informacion proporcionada; el repo usa la librería `diffusers` y se carga con `load_lora_weights` |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 16 aplicado a las proyecciones de atención del U-Net (`to_q`, `to_k`, `to_v`, `to_out`) del modelo InstructPix2Pix, que a su vez es un modelo de difusión condicionado por imagen y por texto. InstructPix2Pix permite editar una imagen de entrada siguiendo una instrucción textual, con dos escalas de guía independientes: una para el texto y otra para la imagen original (`image_guidance_scale`). El LoRA no modifica el codificador de texto ni el VAE; solo ajusta la atención del U-Net para el dominio de postres.

El entrenamiento se realizó durante 3000 pasos, con batch de 4, tasa de aprendizaje 0,0001 y resolución de 512 px. Los datos provienen del dataset `123min2/dessert-edit`, construido a partir de imágenes de postres de Food-101: los pares de edición se generaron con un pipeline que combina Qwen3-VL (para interpretar y formular la instrucción), Grounding DINO (detección de la región), SAM 2.1 (segmentación) y SDXL inpainting (síntesis de la edición), y se filtraron mediante CLIP, un juez VLM y revisión manual. La model card no detalla el número de tokens, la composición exacta del dataset ni si hubo etapas de RLHF o DPO, que en un modelo de difusión no aplican del mismo modo.

## Capacidades

- Edición de imágenes guiada por instrucción textual en lenguaje natural, limitada al dominio de fotografías de postres.
- Edición localizada: modifica solo la región indicada por la instrucción y conserva el resto de la imagen.
- Sustitución de ingredientes o elementos (por ejemplo, cambiar fresas por arándanos) manteniendo la iluminación y la perspectiva.
- Control de la fidelidad a la imagen original mediante `image_guidance_scale` en la pipeline de InstructPix2Pix.
- Integración con `diffusers` mediante `StableDiffusionInstructPix2PixPipeline` y `load_lora_weights`.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión general, audio ni modo «thinking»; es un adaptador de edición de imagen, no un modelo de lenguaje.
- Capacidades multilingües: no disponibles; la model card solo muestra instrucciones en inglés.

## Casos de uso

- Prototipado de variantes de producto en repostería: un obrador puede generar versiones de un mismo postre con distintos toppings (frutos rojos, chocolate, frutos secos) para catálogos o redes sociales, usando instrucciones cortas y la misma foto base.
- Pruebas de concepto en diseño de menús: sustituir un ingrediente por otro sobre una fotografía existente para evaluar el atractivo visual antes de producir el plato real.
- Generación de material para aplicaciones de recetas: crear imágenes alternativas de un postre para ilustrar variantes sin gluten, sin lactosa o veganas, editando solo el elemento afectado.
- Enriquecimiento de datasets de visión artificial: producir pares imagen-edición controlados en el dominio de alimentos para entrenar o evaluar modelos de edición y de segmentación.
- Demostraciones educativas de LoRA e InstructPix2Pix: el adaptador sirve como ejemplo reproducible de ajuste fino de bajo rango sobre un modelo de difusión, con una receta de entrenamiento documentada.
- Filtrado y aumento de datos para Food-101: generar variantes editadas de imágenes de postres para aumentar la diversidad de un conjunto de entrenamiento de clasificación de alimentos.
- Edición rápida en flujos de contenido gastronómico: corregir o variar un elemento concreto de una foto ya publicada sin rehacer la sesión fotográfica, siempre que la escena sea de repostería.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El LoRA en sí ocupa muy poco espacio (el repositorio declara 0,0 GB), pero la inferencia requiere cargar el modelo base `timbrooks/instruct-pix2pix` completo.
- VRAM estimada: no disponible de forma explícita; al tratarse de un modelo de difusión de la familia Stable Diffusion 1.x a 512 px, se sitúa en el rango habitual de 4-8 GB en fp16, dependiendo de la implementación y de si se usan optimizaciones de memoria.
- GPU recomendadas: no disponibles en la información proporcionada; por la familia del modelo base, cabría esperar funcionamiento en GPU de consumo con suficiente VRAM (por ejemplo, RTX 3060/4070 en adelante), aunque no hay confirmación del autor.
- Cabe en GPU de consumo: probablemente sí, según el modelo base, pero no está verificado en la información disponible.
- Opciones de despliegue: `diffusers` con `StableDiffusionInstructPix2PixPipeline` y `load_lora_weights`; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplican a un modelo de difusión de imagen).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| 123min2/dessert-edit-lora | LoRA sobre InstructPix2Pix | no disponible (rango 16) | no aplica | no disponible | no disponible | Hugging Face, repo de 0,0 GB, 0 descargas |
| timbrooks/instruct-pix2pix | Modelo base de edición instruccional | no disponible en la informacion | no aplica | no disponible | no disponible | Hugging Face |
| SDXL inpainting | Modelo de difusión para inpainting | no disponible en la informacion | no aplica | no disponible | no disponible | Hugging Face |
| Modelos genéricos de edición instruccional | Difusión condicionada por texto e imagen | no disponible | no aplica | no disponible | variable | variable |

La comparación cuantitativa no es posible con la información disponible: no hay métricas publicadas para este adaptador ni datos de parámetros, contexto o rendimiento de las alternativas en la información proporcionada.

## Limitaciones y advertencias

- Dominio muy restringido: el adaptador está entrenado solo con postres de Food-101; su comportamiento fuera de ese dominio no está documentado y probablemente degrade.
- Riesgo de ediciones no deseadas: aunque el objetivo es editar solo la región indicada, no hay evaluación publicada que cuantifique la fidelidad al fondo ni la tasa de cambios colaterales.
- Alucinación visual: como todo modelo de difusión, puede generar texturas o ingredientes inexistentes, especialmente en zonas de glaseado, frutas y detalles finos.
- Sesgos: no se documentan sesgos conocidos, pero el dataset deriva de Food-101, con posibles sesgos de composición, iluminación y estilo fotográfico.
- Idiomas: no se declaran idiomas soportados; las instrucciones de ejemplo están en inglés y no hay evidencia de funcionamiento con instrucciones en castellano.
- Licencia: no disponible; antes de cualquier uso comercial es imprescindible verificar la licencia del adaptador y la del modelo base `timbrooks/instruct-pix2pix`.
- Repositorio vacío y sin validación de la comunidad: 0 descargas, 0 likes y tamaño de 0,0 GB, lo que sugiere que los pesos podrían no estar subidos o no ser accesibles; conviene comprobar los archivos antes de integrarlo.
- Sin benchmarks ni evaluación humana publicada: no hay evidencia objetiva de calidad frente al modelo base sin LoRA.
- Para producción: fijar versiones de `diffusers` y del modelo base, y validar el comportamiento con un conjunto propio de imágenes y prompts antes de desplegar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/123min2/dessert-edit-lora
- Dataset de entrenamiento: https://huggingface.co/datasets/123min2/dessert-edit
- Modelo base InstructPix2Pix: https://huggingface.co/timbrooks/instruct-pix2pix
- Paper de InstructPix2Pix: no disponible en la informacion proporcionada
- Repositorio o demo adicional: no disponible en la informacion proporcionada
