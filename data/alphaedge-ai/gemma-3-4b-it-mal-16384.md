# alphaedge-ai/gemma-3-4b-it-mal-16384

## Resumen

`gemma-3-4b-it-mal-16384` es una variante podada (*trimmed*) del modelo multimodal `google/gemma-3-4b-it` de Google, publicada por el usuario `alphaedge-ai`. La poda consiste en reducir el vocabulario del tokenizador de 262.144 a 16.384 tokens, conservando únicamente los tokens relevantes para el malayalam (idioma `ml`), lo que reduce el numero de parametros totales de 4.300.079.472 a 3.670.770.032, es decir, un 14,63% menos. El objetivo es obtener un modelo mas ligero en memoria y mas eficiente en la generacion de texto en malayalam, a costa de perder competencia en el resto de idiomas.

El modelo hereda la arquitectura transformer multimodal de Gemma 3 (entrada image-text-to-text, segun los tags del repositorio) y el ajuste por instrucciones del modelo base. No se trata de un modelo entrenado desde cero, sino de un derivado cuantizado/podado: el propio autor lo declara con `base_model_relation: quantized`. La poda se realizo mediante la tecnica de *trimming* documentada por Hugging Face, usando 200.000 textos del dataset `lbourdois/fineweb-2-trimming` para minar la relevancia de los tokens.

Es relevante para equipos que despliegan Gemma 3 en entornos con recursos limitados y cuya carga de trabajo sea exclusivamente en malayalam: el ahorro de ~630 millones de parametros y de un 93,75% del vocabulario se traduce en una huella de memoria menor y, potencialmente, en una decodificacion mas rapida. La contrapartida es una perdida severa de capacidades multilingues y un ecosistema practicamente nulo (8 descargas, 0 likes en el momento de la consulta).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text) derivada de Gemma 3; poda de vocabulario |
| Parametros totales | 3.670.770.032 (original: 4.300.079.472) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | no disponible (el repo contiene safetensors; no se listan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | malayalam (`ml`); el resto de idiomas se degrada por la poda del vocabulario |
| Licencia | Gemma Terms of Use (`license: gemma`) |
| Formato de pesos | safetensors (libreria transformers) |
| Tamano del repositorio | 7,3 GB |
| Vocabulario | 16.384 tokens (original: 262.144; reduccion del 93,75%) |
| Dataset de minado | `lbourdois/fineweb-2-trimming` (200.000 textos) |
| Modelo base | google/gemma-3-4b-it |
| Fecha de creacion | 2026-05-05 |
| Ultima actualizacion | 2026-11-18 |

## Arquitectura y entrenamiento

El modelo no se entrena desde cero: es un derivado del Gemma 3 de 4B con ajuste por instrucciones (`-it`), cuya arquitectura es un transformer decoder-only con capacidad multimodal (entrada de imagen y texto) segun los tags `image-text-to-text` y `gemma3`. La innovacion de esta variante es la poda del vocabulario: se seleccionan 16.384 tokens representativos del malayalam a partir de 200.000 textos del dataset `lbourdois/fineweb-2-trimming`, se recortan las filas correspondientes de la matriz de embeddings de entrada y de la capa de salida (LM head), y se eliminan los tokens no usados del tokenizador. Esto explica la diferencia exacta de parametros: 4.300.079.472 − 3.670.770.032 = 629.309.440 parametros, que corresponden a las filas eliminadas de embeddings y de la proyeccion de salida.

No se documenta en la model card ningun reentrenamiento posterior a la poda, ni datos de RLHF/DPO especificos de esta variante; se asume que conserva el ajuste por instrucciones del modelo base Gemma 3. Tampoco se detalla si se realizo una fase de recuperacion (*healing*) tras el recorte, ni el numero de tokens de entrenamiento originales. La model card advierte explicitamente de que el modelo "puede no funcionar bien para otros idiomas" porque los tokens no frecuentes en malayalam se han eliminado del vocabulario.

## Capacidades

- Generacion de texto conversacional en malayalam, con plantilla de chat (`apply_chat_template`) heredada de Gemma 3.
- Razonamiento e instrucciones genericas: al conservar los pesos del modelo `-it`, mantiene la capacidad de seguir instrucciones, aunque mermada en idiomas distintos del malayalam.
- Entrada multimodal imagen-texto: los tags del repositorio (`image-text-to-text`, `gemma3`) indican soporte de vision heredado del modelo base; no se detalla en la model card el alcance exacto tras la poda.
- Generacion de codigo y matematicas: presumiblemente degradada, ya que muchos tokens de programacion y simbolos no frecuentes en malayalam pueden haber sido eliminados del vocabulario.
- Tool calling / function calling: no documentado en la model card; no disponible como capacidad verificada.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingues: limitadas al malayalam; el resto de idiomas se degrada por la reduccion del vocabulario.
- Compatibilidad con text-generation-inference (`text-generation-inference` en los tags) y endpoints compatibles (`endpoints_compatible`).

## Casos de uso

- Atencion al cliente en malayalam: el modelo puede gestionar conversaciones multi-turno en malayalam con una huella de memoria menor que el Gemma 3 original, lo que abarata el despliegue en instancias con GPU modesta; adecuado si el publico objetivo es exclusivamente malayalam.
- Generacion de contenido editorial en malayalam: redaccion de borradores, resumenes y parafrasis de articulos en malayalam, aprovechando que el vocabulario podado cubre los tokens mas frecuentes del idioma.
- Traduccion asistida malayalam → ingles (o viceversa) en un solo sentido: util para preprocesar textos en malayalam antes de pasarlos a un modelo mayor; conviene validar la calidad porque el vocabulario ingles queda mermado.
- Clasificacion y etiquetado de textos en malayalam: tareas de moderacion, analisis de sentimiento o extraccion de entidades sobre corpus en malayalam, donde el ahorro de parametros permite procesar mas volumen por GPU.
- Despliegue en el borde o en entornos con VRAM limitada: al reducir el vocabulario, la matriz de embeddings y la LM head ocupan mucho menos, lo que facilita ejecutar el modelo en GPUs de consumo con cuantizacion (previa conversion a GGUF, no incluida en el repo).
- Prototipado rapido de asistentes conversacionales en malayalam: el snippet de la model card con `transformers` y `apply_chat_template` permite tener un chatbot funcional en pocas lineas para validar producto antes de invertir en un modelo mayor.
- Investigacion sobre poda de vocabulario: sirve como referencia reproducible para estudiar el impacto del *trimming* en un modelo multimodal de 4B, comparando su rendimiento con el Gemma 3 original en tareas en malayalam.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tablas de MMLU, HumanEval, GSM8K ni evaluaciones especificas en malayalam, y unicamente afirma cualitativamente que el modelo podado "deberia comportarse de forma similar al original" con 16.384 tokens y una huella de memoria mucho menor.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 7,3 GB solo de pesos (3,67B parametros × 2 bytes), mas overhead de activaciones y cache KV; en la practica, reservar 10-12 GB.
- VRAM estimada en cuantizacion de 8 bits: ~3,7 GB de pesos; en 4 bits: ~1,9 GB de pesos. No se distribuyen pesos cuantizados en el repositorio, por lo que habria que generarlos.
- GPU recomendadas: NVIDIA A100 40/80 GB, H100, L40S o A10G para produccion; una RTX 4090 (24 GB) o RTX 3090 (24 GB) es suficiente para fp16 con contexto moderado.
- Cabe en GPU de consumo: si, en RTX 4090/3090 en fp16 y en GPUs de 8-12 GB (RTX 3060 12 GB, RTX 4060 Ti 16 GB) si se cuantiza a 8 o 4 bits.
- Opciones de despliegue: `transformers` (snippet oficial de la model card), text-generation-inference (tag `text-generation-inference`), y endpoints compatibles; llama.cpp/Ollama requeririan conversion previa a GGUF, no incluida.
- Latencia y throughput: no disponibles. El ahorro de vocabulario reduce el coste de la capa de salida (menos logits que calcular y muestrear), lo que en teoria acelera la decodificacion frente al Gemma 3 original, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| alphaedge-ai/gemma-3-4b-it-mal-16384 | 3,67B | no disponible | malayalam (otros degradados) | Gemma Terms of Use | 8 descargas, 0 likes |
| google/gemma-3-4b-it | 4,30B | no disponible en esta ficha | multilingue | Gemma Terms of Use | modelo base oficial, ampliamente usado |
| Otras variantes trimmed de Gemma 3 (p. ej. `lbourdois/*-16384`) | ~3,67B | no disponible | segun idioma objetivo | Gemma Terms of Use | publicadas por el autor de la tecnica de trimming |

La comparacion principal es contra el modelo base: misma familia, misma licencia y misma arquitectura, con un 14,63% menos de parametros y un vocabulario un 93,75% menor, a cambio de perder cobertura multilingue. Frente a otros modelos de ~4B (Qwen, Llama, Phi) no se dispone de datos comparativos en la informacion proporcionada.

## Limitaciones y advertencias

- Degradacion multilingue severa: al eliminar el 93,75% del vocabulario, los tokens no frecuentes en malayalam desaparecen; el modelo puede fallar o producir texto incoherente en otros idiomas, incluido el ingles.
- Riesgo de alucinacion: no se documentan evaluaciones de fidelidad; como derivado de un modelo `-it` de 4B, mantiene el riesgo habitual de inventar datos, agravado en dominios con vocabulario especializado (codigo, matematicas, terminologia tecnica) cuyos tokens pueden haber sido podados.
- Perdida de capacidades de codigo y matematicas: los simbolos y tokens de programacion poco frecuentes en malayalam pueden haberse eliminado, por lo que no es recomendable para generacion de codigo en produccion.
- Licencia Gemma Terms of Use: el uso comercial esta sujeto a los terminos de Google; el autor declara no estar afiliado ni respaldado por Google. Es necesario revisar las clausulas de uso aceptable y atribucion antes de desplegar.
- Ecosistema minimo: 8 descargas y 0 likes en el momento de la consulta, sin issues ni discusiones publicas; no hay garantia de mantenimiento ni soporte.
- Ausencia de pesos cuantizados: el repositorio solo contiene safetensors; para desplegar en GPUs pequenas hay que generar las cuantizaciones (GGUF, AWQ, GPTQ) por cuenta propia y validar la calidad.
- Falta de datos verificables: no se publican benchmarks, contexto maximo, ni detalles de reentrenamiento posterior a la poda, lo que dificulta evaluar su idoneidad en produccion.
- El tag de idioma `ml` y la advertencia del autor indican que el modelo esta pensado exclusivamente para malayalam; usarlo fuera de ese idioma es un riesgo no cuantificado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/alphaedge-ai/gemma-3-4b-it-mal-16384
- Modelo base: https://huggingface.co/google/gemma-3-4b-it
- Dataset de minado: https://huggingface.co/datasets/lbourdois/fineweb-2-trimming
- Blog de introduccion a trimming: https://huggingface.co/blog/lbourdois/introduction-to-trimming
- Paper de Gemma 3: https://arxiv.org/abs/2503.19786
- Terminos de uso de Gemma: https://ai.google.dev/gemma/terms
