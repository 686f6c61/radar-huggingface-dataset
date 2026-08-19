# Saraswathy/vlm-mix-stem60-geometry40-direct-step100

## Resumen

Este repositorio contiene un adaptador LoRA de tipo PEFT, publicado como artefacto de investigación del proyecto VLM mixture/PoEM. El adaptador, denominado "Direct STEM60 Geometry40 (Step 100)", se entrena sobre el modelo base Qwen/Qwen3-VL-4B-Instruct y aplica una política de mezcla de datos con un 60 % de dominios STEM amplios y un 40 % de geometría, tras 100 pasos de entrenamiento directo. Su propósito es servir como referencia reproducible para experimentos sobre mezcla de datos en modelos de visión y lenguaje.

El modelo es un adaptador exclusivamente (no contiene los pesos completos del modelo base) y está diseñado para cargarse con la librería PEFT sobre la revisión fijada `ebb281ec70b05090aa6165b016eac8ec08e71b17` del base model. Al ser un adaptador LoRA de rango 64 y alpha 128, el tamaño del repositorio es de 0.5 GB, muy inferior al del modelo base completo. Su relevancia radica en que documenta una configuración concreta de entrenamiento para estudiar el impacto de la mezcla de dominios en modelos VLM, aunque no se aportan métricas de rendimiento en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre Qwen/Qwen3-VL-4B-Instruct (transformer multimodal) |
| Parametros totales | no disponible (adaptador LoRA rank 64, alpha 128) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del base model, no especificada) |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors) |
| Idiomas soportados | no disponibles |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El adaptador se basa en la arquitectura Qwen3-VL-4B-Instruct, un modelo de visión y lenguaje de la familia Qwen3-VL. Al tratarse de un adaptador LoRA, solo se actualizan matrices de baja dimensión sobre las capas del modelo base, manteniendo los pesos originales congelados. El entrenamiento se realizó con una mezcla de datos compuesta por un 60 % de dominios STEM generales y un 40 % de geometría, durante 100 pasos de entrenamiento directo. No se especifican detalles sobre el dataset concreto, el número de tokens, ni si se aplicaron técnicas como RLHF o DPO. La política de mezcla es el objeto de estudio del experimento, según la model card.

El adaptador está fijado a una revisión concreta del modelo base (`ebb281ec70b05090aa6165b016eac8ec08e71b17`), lo que garantiza la reproducibilidad de las evaluaciones. No se documentan innovaciones técnicas adicionales más allá de la configuración LoRA y la política de mezcla de datos.

## Capacidades

- El adaptador hereda las capacidades del modelo base Qwen3-VL-4B-Instruct: comprensión de imágenes y texto, generación de respuestas multimodales, razonamiento visual y capacidad de seguir instrucciones.
- Al estar entrenado con un 40 % de datos de geometría, se espera un refuerzo específico en tareas de razonamiento geométrico y visual-espacial, aunque no se aportan evaluaciones que lo confirmen.
- Soporta el pipeline `image-text-to-text`, es decir, entrada de imagen y texto para producir texto.
- No se documentan capacidades adicionales como tool calling, agentes o modos de pensamiento extendido.

## Casos de uso

- Investigacion en mezcla de datos para VLM: el adaptador sirve como punto de comparación en experimentos que estudian cómo la proporción de dominios (STEM vs. geometría) afecta al rendimiento del modelo. Se puede cargar con PEFT y evaluar en benchmarks específicos.
- Evaluación de razonamiento geométrico: dado su entrenamiento con un 40 % de datos de geometría, puede utilizarse para probar tareas que requieran interpretación de figuras, ángulos, formas o relaciones espaciales a partir de imágenes.
- Reproducción de experimentos científicos: al estar fijado a una revisión concreta del base model y documentar el hash del adaptador, permite replicar exactamente los resultados del estudio VLM mixture/PoEM.
- Desarrollo de pipelines multimodales ligeros: al ser un adaptador de 0.5 GB, puede integrarse en entornos con recursos limitados sin necesidad de cargar los pesos completos del modelo base, aunque el base model sigue siendo necesario.
- Benchmarking de adaptadores LoRA: sirve como caso de estudio para comparar el rendimiento de adaptadores de bajo rango frente a fine-tuning completo en tareas de visión y lenguaje.
- Exploración de políticas de entrenamiento directo: el "direct step 100" permite analizar el comportamiento del modelo en etapas tempranas del entrenamiento, útil para estudiar dinámicas de convergencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona que los resultados comparativos se mantienen en un repositorio de experimentos acompañante, pero no se proporcionan datos numéricos en esta ficha.

## Requisitos de hardware

- El adaptador en sí ocupa 0.5 GB, pero requiere cargar el modelo base Qwen3-VL-4B-Instruct, cuyos pesos completos rondan los 8 GB en precisión FP16 (estimación para un modelo de 4B parámetros).
- Para inferencia con el adaptador, se recomienda una GPU con al menos 12 GB de VRAM si se usa el modelo base en FP16. Con cuantización (por ejemplo, 4 bits) podría caber en GPUs de 8 GB como la RTX 3060 o RTX 4060.
- GPUs recomendadas: RTX 3090, RTX 4090, A100, H100, dependiendo de la velocidad deseada y el tamaño de lote.
- Opciones de despliegue: la librería PEFT permite cargar el adaptador sobre el base model en frameworks como Transformers. También es posible usar vLLM o TGI si soportan carga de adaptadores LoRA. Para entornos ligeros, llama.cpp no es compatible directamente con PEFT, pero se podría convertir el adaptador a formato GGUF si se fusiona previamente con el base model.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No disponible. No se han encontrado modelos comparables en la información proporcionada, ya que este repositorio es un adaptador específico para un experimento concreto y no un modelo independiente. Para comparar, sería necesario evaluar el adaptador frente al modelo base Qwen3-VL-4B-Instruct sin adaptador, pero no se dispone de resultados.

## Limitaciones y advertencias

- Es un adaptador, no un modelo completo: requiere cargar el modelo base Qwen3-VL-4B-Instruct en la revisión exacta `ebb281ec70b05090aa6165b016eac8ec08e71b17`. Si se usa otra revisión, el adaptador puede no funcionar correctamente.
- No se aportan métricas de rendimiento ni evaluaciones en la model card, por lo que su eficacia real es desconocida.
- El entrenamiento con solo 100 pasos puede implicar que el adaptador no haya convergido completamente, lo que podría afectar a la calidad de las respuestas.
- El sesgo de dominio (60 % STEM, 40 % geometría) puede provocar un rendimiento inferior en tareas fuera de estos dominios.
- No se documentan sesgos específicos, pero al ser un modelo derivado de Qwen3-VL, puede heredar sesgos del modelo base.
- Riesgo de alucinación en tareas visuales complejas, especialmente si la imagen no se interpreta correctamente.
- La licencia Apache 2.0 permite uso comercial, pero se debe verificar que el modelo base Qwen3-VL también cumple con los requisitos de su licencia original.
- No se especifican limitaciones de contexto ni de idioma, pero al ser un adaptador sobre un modelo multilingüe, se espera que herede las capacidades del base model.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Saraswathy/vlm-mix-stem60-geometry40-direct-step100
- Modelo base Qwen/Qwen3-VL-4B-Instruct: https://huggingface.co/Qwen/Qwen3-VL-4B-Instruct
- No se han encontrado otros enlaces relevantes (papers, blogs, repos) en la búsqueda web.
