# jjhpark/adamw-PT-adamw-MT-a10-g20-mdr

## Resumen

`adamw-PT-adamw-MT-a10-g20-mdr` es un checkpoint intermedio de investigación publicado por el usuario `jjhpark` en Hugging Face. No se trata de un modelo conversacional listo para producción, sino de un artefacto experimental resultante de un proceso de *mid-training* sobre un checkpoint previo (`jjhpark/adamw-PT`), llevado a cabo con Megatron-LM y destinado a reproducir los resultados del artículo arXiv 2610.29348. Su interés es, por tanto, metodológico: documenta una receta concreta de mezcla de datos y planificación de learning rate.

El modelo parte de una arquitectura Qwen2 (etiqueta `qwen2` en los metadatos) y cuenta con 494.032.768 parámetros totales almacenados en safetensors, lo que lo sitúa en la categoría de modelos pequeños (~0,5B). El entrenamiento consistió en 10.000 pasos sobre 20,97B tokens, con una mezcla que introduce datos de matemáticas (FineMath-4plus) en un presupuesto de *mid-training* del 10%, aplicando un esquema de datos en dos etapas con ratio final del 20% y una política de learning rate constante seguida de decaimiento lineal (MDR).

Su relevancia actual es limitada fuera del ámbito de la investigación en dinámicas de entrenamiento: no hay descargas ni *likes*, no se declaran idiomas soportados y la model card se limita a describir la receta de entrenamiento y dos pérdidas de validación. Debe tratarse como material de reproducibilidad, no como un modelo desplegable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Qwen2 (según tag `qwen2`) |
| Parametros totales | 494.032.768 |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan GGUF ni otras variantes) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura corresponde a la familia Qwen2, según la etiqueta declarada en el repositorio, con 494 millones de parámetros. No se documenta en la información disponible el número de capas, dimensión oculta, cabezas de atención ni la longitud de contexto nativa, por lo que estos detalles deben consultarse en el checkpoint base `jjhpark/adamw-PT`.

El entrenamiento descrito es un *mid-training* de 10.000 pasos que procesa 20,97B tokens partiendo del checkpoint `jjhpark/adamw-PT`. La receta combina un presupuesto de *mid-training* (MT) del 10% con un esquema de datos en dos etapas: los datos de MT entran en el paso 5.000 y la ratio final de MT es del 20%. El dataset de MT es FineMath-4plus. El learning rate se mantiene constante en 5e-4 hasta el paso 5.000 y después decae linealmente hasta 1e-5 (MDR). Se usa el optimizador AdamW de principio a fin. Las pérdidas sobre un subconjunto de 32M tokens en el paso 10.000 son 2,7527 en DCLM y 1,6171 en FineMath. La implementación se realizó con Megatron-LM y el objetivo declarado es reproducir el artículo arXiv 2610.29348.

## Capacidades

- Generación de texto autoregresiva, según el pipeline declarado (`text-generation`).
- Etiqueta `conversational`, lo que sugiere un formato de chat, aunque no se documenta la plantilla de prompt.
- No se documenta soporte de *tool calling* ni de *function calling*.
- No se documenta soporte de agentes ni de razonamiento multi-paso.
- No se documentan capacidades multilingües ni lista de idiomas.
- No se documentan capacidades de visión, audio ni modo *thinking*.
- El ajuste con FineMath-4plus sugiere exposición a datos matemáticos, pero no se publican evaluaciones que cuantifiquen esta capacidad.

## Casos de uso

- Reproducción de experimentos de *mid-training*: el checkpoint permite verificar la receta del artículo arXiv 2610.29348 (mezcla de datos en dos etapas, decaimiento MDR) comparando pérdidas en DCLM y FineMath con las publicadas (2,7527 y 1,6171).
- Estudio de planificadores de learning rate: sirve para analizar el efecto de un LR constante a 5e-4 seguido de decaimiento lineal a 1e-5 sobre un modelo de ~0,5B, usando el checkpoint base como referencia.
- Investigación sobre mezcla de datos matemáticos: el modelo permite medir cómo la entrada de FineMath-4plus en el paso 5.000 y una ratio final del 20% afectan a la pérdida en dominios generales frente a matemáticos.
- Punto de partida para *fine-tuning* académico: con 494M parámetros y licencia Apache 2.0, es viable ajustarlo en una única GPU consumer para tareas de clasificación o generación acotada, aunque sin garantías de calidad por la falta de evaluaciones.
- Docencia y formación: útil para ilustrar en un curso el flujo completo con Megatron-LM, desde un checkpoint preentrenado hasta un *mid-training* con currículo de datos.
- Pruebas de infraestructura de inferencia: al ser un modelo pequeño en safetensors, permite validar despliegues con vLLM o TGI y comparar latencias antes de escalar a modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Los únicos datos numéricos son pérdidas de validación sobre un subconjunto de 32M tokens en el paso 10.000:

| Metrica | Valor |
|---|---|
| Perdida DCLM (32M tokens, paso 10.000) | 2,7527 |
| Perdida FineMath (32M tokens, paso 10.000) | 1,6171 |

No se proporcionan comparaciones con modelos similares.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 1 GB solo para pesos (494M parámetros × 2 bytes), más overhead de activaciones y caché KV.
- En cuantización de 8 bits: en torno a 0,5 GB de pesos; en 4 bits, alrededor de 0,25 GB, aunque no se publican versiones cuantizadas oficiales.
- GPU recomendadas: cualquier GPU consumer con al menos 4-8 GB de VRAM (RTX 3060, RTX 4060, RTX 4090) es suficiente para inferencia en precisión completa; para entrenamiento o *fine-tuning* conviene una RTX 4090, A100 o H100.
- Cabe holgadamente en GPU consumer, incluidas portátiles con 8 GB.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (tag `text-generation-inference`) y endpoints compatibles (tag `endpoints_compatible`). No se documenta compatibilidad con llama.cpp, Ollama ni vLLM.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables ni datos de rendimiento que permitan establecer una comparación fundamentada con alternativas de tamaño similar (por ejemplo, otros modelos de ~0,5B de la familia Qwen2).

## Limitaciones y advertencias

- Modelo de investigación sin evaluaciones publicadas: no hay benchmarks que respalden su calidad en ninguna tarea.
- Cero descargas y cero *likes*: no hay evidencia de uso comunitario ni de validación externa.
- No se declaran idiomas soportados, por lo que el comportamiento multilingüe es desconocido.
- No se documenta la longitud de contexto, lo que impide planificar cargas con ventanas largas.
- Riesgo de alucinación no caracterizado; al ser un checkpoint intermedio de *mid-training*, es probable que no haya pasado por etapas de alineación (RLHF/DPO), aunque esto no se confirma en la información disponible.
- No se documentan sesgos conocidos.
- La licencia Apache 2.0 permite uso comercial, pero la ausencia de evaluaciones hace desaconsejable su uso en producción sin una validación propia exhaustiva.
- El nombre del repositorio codifica hiperparámetros (`a10-g20-mdr`), lo que sugiere que puede ser uno de varios checkpoints experimentales; conviene verificar si existe una versión final.
- La fecha de creación indicada (2026-11-13) es posterior a la fecha actual en el momento de redactar esta ficha; debe tratarse con cautela.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jjhpark/adamw-PT-adamw-MT-a10-g20-mdr
- Checkpoint base: https://huggingface.co/jjhpark/adamw-PT
- Artículo de referencia: arXiv 2610.29348 (no se dispone de URL directa en la información proporcionada)
- Megatron-LM: no se proporciona enlace en la información disponible
