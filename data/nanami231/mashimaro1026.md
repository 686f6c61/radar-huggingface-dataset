# Nanami231/mashimaro1026

## Resumen

`Nanami231/mashimaro1026` es un adaptador LoRA de tipo DreamBooth para generación de imágenes texto-a-imagen, entrenado sobre el modelo base `krea/Krea-2-Raw` y publicado por el usuario Nanami231. No se trata de un modelo de lenguaje: es un peso adicional de bajo rango que se carga sobre el pipeline de difusión Krea 2 para inyectar un concepto visual concreto, invocado mediante la palabra clave `Mashimaro`. El repositorio ocupa 1,6 GB e incluye tres imágenes de muestra generadas con el adaptador.

El interés técnico del artefacto es doble. Por un lado, ejemplifica el flujo de trabajo habitual de personalización con DreamBooth-LoRA sobre modelos de difusión modernos: un *trigger token* único, compatible con `diffusers` y distribuido con licencia Apache 2.0. Por otro, la model card documenta explícitamente la asimetría entre entrenamiento e inferencia: el adaptador se entrenó sobre la variante RAW de Krea 2 pero se muestra funcionando sobre Krea 2 Turbo con solo 8 pasos de muestreo y `guidance_scale=0.0`, lo que reduce de forma drástica el coste de inferencia.

La relevancia práctica es limitada pero clara: se publica como plantilla reproducible (etiqueta `template:sd-lora`) para quien quiera replicar el procedimiento con otros conceptos, y como ejemplo de adaptador de concepto consumible directamente desde Hugging Face. En el momento de la consulta el repositorio registra 0 descargas y 0 *likes*, y no incluye documentación sobre rango del LoRA, número de imágenes de entrenamiento, pasos ni resolución.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (DreamBooth) sobre modelo de difusion Krea 2; arquitectura interna del modelo base no disponible |
| Parametros totales | no disponible (el repositorio ocupa 1,6 GB, sin desglose entre pesos del adaptador y recursos auxiliares) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo texto-a-imagen); longitud maxima del prompt no disponible |
| Tipos de cuantizacion | no disponible; el ejemplo oficial usa `torch_dtype=torch.bfloat16` |
| Idiomas soportados | no disponible (el prompt de ejemplo y la palabra clave estan en ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | formato nativo de `diffusers` para LoRA (segun la libreria declarada); no se detalla si se incluye tambien safetensors suelto o GGUF |
| Modelo base | `krea/Krea-2-Raw` (entrenamiento); muestras generadas sobre `krea/Krea-2-Turbo` |
| Palabra clave (*trigger*) | `Mashimaro` |
| Pasos de inferencia recomendados | 8 (variante Turbo) |
| Guidance scale recomendado | 0.0 (variante Turbo) |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-10-17 |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA obtenido mediante DreamBooth, la técnica estándar para personalización de modelos de difusión: se congela el modelo base y se entrenan matrices de descomposición de bajo rango que se suman a determinadas capas, de modo que el modelo aprenda un concepto nuevo sin perder las capacidades originales. La model card confirma el esquema (DreamBooth-LoRA sobre Krea 2) y especifica que el entrenamiento se realizó sobre la variante RAW del modelo base, mientras que las muestras publicadas se generaron con la variante Turbo.

No se proporciona información sobre el número de imágenes del dataset, la resolución de entrenamiento, el rango del LoRA, la tasa de aprendizaje, el número de pasos ni si se aplicaron técnicas de regularización o *prior preservation*. Tampoco se documenta el proceso de captura o curación de las imágenes del concepto `Mashimaro`. La única innovación reseñable documentada es la elección de inferencia: 8 pasos con `guidance_scale=0.0` sobre Krea 2 Turbo, una configuración típica de destilación por destilación de pasos que evita la doble evaluación del modelo (sin *classifier-free guidance*), reduciendo el coste computacional aproximadamente a la mitad por paso respecto a una configuración con CFG.

## Capacidades

- Generación de imágenes texto-a-imagen condicionada al concepto aprendido, invocado con el token `Mashimaro`.
- Composición de ese concepto en escenas arbitrarias: las muestras incluyen un plano cinematográfico de ciencia ficción, macrofotografía de interiores y pintura al óleo épica, lo que indica que el adaptador no está atado a un estilo ni a un encuadre fijo.
- Mezcla con estilo fotográfico y pictórico: la model card demuestra resultados tanto en registro fotorrealista (macro) como en ilustración/pintura.
- Compatibilidad con `diffusers` mediante `load_lora_weights`, lo que permite apilarlo con otros LoRA y con *embeddings* textuales.
- Funcionamiento en modo pocos pasos (8 pasos, CFG 0.0) sobre Krea 2 Turbo.
- No soporta *tool calling*, agentes, razonamiento multi-paso, matemáticas, código ni visión: no es un modelo de lenguaje.
- Capacidades multilingües: no documentadas. La model card no especifica qué idiomas entiende el codificador de texto del modelo base.

## Casos de uso

- Ilustración de personaje recurrente en publicaciones: cargar el LoRA sobre Krea 2 Turbo y generar variaciones del personaje `Mashimaro` en distintos escenarios y estilos para una serie de artículos o un *webcomic*, manteniendo coherencia visual entre entregas con 8 pasos por imagen.
- Prototipado rápido de *storyboards*: usar los prompts de ejemplo (astronauta en nebulosa, taza de té, armadura dorada) como plantilla para generar viñetas de concepto en minutos, aprovechando el bajo coste de la inferencia en modo Turbo.
- Prueba de concepto de personalización con DreamBooth: servir como referencia reproducible para un equipo que quiera entrenar su propio LoRA sobre Krea 2, ya que la model card incluye el *snippet* completo de carga y los hiperparámetros de inferencia.
- Generación de material promocional temático: aplicar el concepto sobre fondos y composiciones controladas para campañas de productos *kawaii* o de animación, combinándolo con otros LoRA de estilo mediante apilamiento en `diffusers`.
- *Fine-tuning* adicional o destilación: al ser un adaptador de bajo rango con licencia Apache 2.0, puede fusionarse con el modelo base o usarse como punto de partida para un entrenamiento posterior orientado a un estilo concreto.
- Evaluación comparativa de adaptadores: útil en un *pipeline* interno de control de calidad que compare la fidelidad del concepto entre distintas semillas, pasos y escalas de guidance antes de adoptar un LoRA en producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas cuantitativas (FID, CLIP score, similitud de concepto, evaluación humana) ni comparaciones numéricas con otros adaptadores. Las únicas evidencias de rendimiento son tres imágenes de muestra cualitativas generadas con Krea 2 Turbo a 8 pasos y `guidance_scale=0.0`.

## Requisitos de hardware

- VRAM para inferencia: no disponible de forma explícita. Depende enteramente del modelo base Krea 2, cuyo tamaño de parámetros no se documenta en la información proporcionada; el adaptador LoRA añade una sobrecarga muy inferior a la del modelo base.
- El ejemplo oficial asume una GPU CUDA con `torch_dtype=torch.bfloat16`, lo que requiere hardware con soporte nativo de bfloat16 (Ampere o posterior en NVIDIA).
- GPU recomendadas: no disponible. No se puede confirmar si cabe en GPU de consumo (RTX 4090, 4080, 3090) sin conocer el tamaño del modelo base.
- Opciones de despliegue: `diffusers` es la vía documentada por el autor (`Krea2Pipeline` + `load_lora_weights`). No se mencionan vLLM, TGI, llama.cpp ni Ollama, que además no aplican a un modelo de difusión.
- Latencia y throughput: no disponibles. La configuración de 8 pasos sin CFG sugiere una latencia baja en términos relativos al modelo base, pero no se aportan mediciones.

## Comparativa con modelos similares

| Modelo | Base | Tipo | Licencia | Contexto / uso | Disponibilidad |
|---|---|---|---|---|---|
| `Nanami231/mashimaro1026` | Krea 2 RAW | LoRA DreamBooth, concepto `Mashimaro` | Apache 2.0 | Texto-a-imagen, 8 pasos en Turbo | Hugging Face, 0 descargas |
| `Nanami231/m-shinhi` | Krea 2 | LoRA, mismo autor y misma plantilla `template:sd-lora` | Apache 2.0 | Texto-a-imagen | Hugging Face |
| LoRA "Nanami" de Tensor.Art (autor Ttan) | Illustrious | LoRA de personaje | no disponible | Texto-a-imagen, orientado a anime | Tensor.Art |
| LoRA "Nanami" de TensorHub (autor Syler) | Z-Image | LoRA de personaje | no disponible | Texto-a-imagen | TensorHub Art |

La comparación cuantitativa con alternativas no es posible: ninguno de los repositorios consultados publica métricas de fidelidad de concepto ni comparaciones directas. La alternativa más próxima en términos técnicos es `Nanami231/m-shinhi`, del mismo autor y sobre el mismo modelo base, que permite intercambiar adaptadores sin cambiar el *pipeline*.

## Limitaciones y advertencias

- No se documenta el dataset de entrenamiento, por lo que se desconocen los sesgos visuales, la diversidad demográfica y los posibles problemas de copyright de las imágenes usadas para el concepto.
- Riesgo de sobreajuste al concepto: al ser un LoRA DreamBooth sin datos sobre regularización, puede degradar la capacidad del modelo base para generar otras composiciones cuando el adaptador está activo.
- La palabra clave `Mashimaro` puede colisionar con el conocimiento previo del modelo base sobre el personaje; no se especifica si se usó una variante rara del token para evitarlo.
- Idiomas no documentados: se desconoce si el codificador de texto del modelo base comprende instrucciones en castellano; los ejemplos están en inglés.
- Sin métricas ni validación independiente: 0 descargas y 0 *likes* implican ausencia de uso comunitario verificable.
- Aunque la licencia del adaptador es Apache 2.0, el uso comercial está condicionado por la licencia del modelo base `krea/Krea-2-Raw` y `krea/Krea-2-Turbo`, que no se detalla en la información proporcionada y debe verificarse por separado.
- No hay garantía de mantenimiento: el repositorio se creó y actualizó el mismo día y no presenta actividad posterior.
- No apto para tareas de lenguaje, razonamiento, código o agentes; cualquier evaluación en ese sentido sería un error de categoría.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Nanami231/mashimaro1026
- Modelo base de entrenamiento: https://huggingface.co/krea/Krea-2-Raw
- Modelo base usado en las muestras: https://huggingface.co/krea/Krea-2-Turbo
- Adaptador del mismo autor sobre la misma base: https://huggingface.co/Nanami231/m-shinhi
- Ficha de referencia del autor en Free2AITools: https://free2aitools.com/model/nanami231/m-shinhi
