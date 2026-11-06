# poligonchiik/llm-course-hw2-dpo

## Resumen

`poligonchiik/llm-course-hw2-dpo` es un modelo de lenguaje derivado de HuggingFaceTB/SmolLM-135M-Instruct mediante un ajuste fino con DPO (Direct Preference Optimization) sobre el dataset HumanLLMs/Human-Like-DPO-Dataset. Se trata de un artefacto de caracter didactico, publicado como trabajo de un curso de LLM, cuyo objetivo es alinear las respuestas del modelo base hacia un tono mas humano y conversacional. No es un modelo pensado para produccion ni para uso general: su interes radica en documentar el proceso de entrenamiento y los resultados obtenidos con una receta DPO concreta.

Con 134.515.008 parametros, el modelo pertenece a la familia de modelos pequenos (por debajo de los 200M), lo que lo hace ejecutable en hardware muy modesto, incluso en CPU. La model card documenta la receta de entrenamiento (1 epoca, batch size 4, AdamW, learning rate 5e-5, beta 1.0, longitud maxima de secuencia 1024 tokens, longitud maxima de prompt 256 tokens, seed 42) y reporta metricas de entrenamiento (DPO loss 0.00271, reward accuracy 0.99779) junto con un analisis de log-probabilidades sobre 200 ejemplos de entrenamiento y 200 ejemplos de TruthfulQA.

La relevancia actual de esta ficha es acotada: se trata de una publicacion con cero descargas y cero likes en el momento de la consulta, sin pipeline declarado, sin licencia especificada y sin idiomas declarados. Su valor es principalmente educativo y de referencia para quienes quieran reproducir un pipeline DPO sobre un modelo pequeno.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de SmolLM-135M-Instruct) |
| Parametros totales | 134.515.008 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 1024 tokens (longitud maxima de secuencia usada en entrenamiento; la del modelo base no se especifica en la informacion disponible) |
| Tipos de cuantizacion | no disponible (el repo contiene safetensors; no se documentan GGUF ni otras cuantizaciones) |
| Idiomas soportados | no disponible (no declarados en la model card ni en los tags) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un ajuste fino por DPO de SmolLM-135M-Instruct, que a su vez es un transformer decoder-only de 135M de parametros. La model card no detalla la arquitectura interna del modelo base (numero de capas, dimensiones, atencion, etc.), por lo que esos datos deben consultarse en la ficha del modelo original. El ajuste DPO utiliza como referencia la SmolLM-135M-Instruct original con pesos congelados.

La receta de entrenamiento documentada es la siguiente: 1 epoca sobre HumanLLMs/Human-Like-DPO-Dataset, batch size 4, optimizador AdamW, learning rate 5e-5, beta 1.0, longitud maxima de secuencia 1024 tokens, longitud maxima de prompt 256 tokens y seed 42. Los prompts se truncaron por la izquierda y las secuencias completas por la derecha. No se menciona uso de RLHF adicional, ni de SFT previo, ni de tecnicas como decodificacion especulativa o atencion lineal. Las metricas reportadas sobre los batches de entrenamiento son DPO loss de 0.00271 y reward accuracy de 0.99779.

El analisis posterior compara la log-probabilidad media por token de las respuestas (excluyendo el prompt) en 200 ejemplos de entrenamiento frente a 200 ejemplos externos de TruthfulQA: -2.04 en entrenamiento y -3.78 en TruthfulQA. El autor concluye que el modelo asigna mayor probabilidad a las respuestas de entrenamiento que a las externas, lo que es consistente con el objetivo DPO pero tambien sugiere un posible sobreajuste al dataset de preferencias.

## Capacidades

- Generacion de texto conversacional en tono empatico y de apoyo, segun el ejemplo de la model card (respuesta a un usuario nervioso por su primer dia en la universidad).
- Ajuste de estilo hacia respuestas mas "humanas" gracias al dataset Human-Like-DPO-Dataset.
- Generacion de respuestas multi-turno potencialmente, aunque no se documenta evaluacion especifica.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no documentadas; el ejemplo de la model card esta en ingles.
- Capacidades especiales (thinking mode, vision, audio): no disponibles.
- Capacidades de codigo y matematicas: no documentadas; el modelo base SmolLM-135M-Instruct tiene capacidades limitadas en estas areas, pero no se aportan datos especificos.

## Casos de uso

- Experimentacion educativa en cursos de LLM: reproduccion del pipeline DPO completo (dataset, receta, metricas) sobre un modelo pequeno, util para entender el efecto del ajuste por preferencias sin necesidad de infraestructura costosa.
- Prototipado rapido de asistentes conversacionales de tono empatico: el modelo puede generar respuestas de apoyo en ingles, como muestra el ejemplo de la model card, adecuado para demos y pruebas de concepto.
- Pruebas de alineacion y evaluacion de sesgos: al ser un modelo pequeno y reproducible, sirve como banco de pruebas para estudiar como DPO modifica la distribucion de respuestas frente a TruthfulQA.
- Generacion de texto en entornos con recursos muy limitados: con 135M de parametros, puede ejecutarse en CPU o en GPUs de gama baja para tareas de generacion corta.
- Comparacion de tecnicas de alineacion: util como linea base frente a otros metodos (SFT, RLHF, ORPO) en experimentos academicos.
- Docencia y talleres practicos: ejemplo completo de model card con receta y metricas para ensenar buenas practicas de documentacion de entrenamiento.
- Fine-tuning posterior: punto de partida para experimentos de ajuste adicional sobre dominios concretos, dado su tamano reducido y su formato safetensors.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La model card unicamente reporta metricas de entrenamiento y un analisis de log-probabilidades:

| Metrica | Valor |
|---|---|
| DPO loss (media en batches de entrenamiento) | 0.00271 |
| Reward accuracy (media en batches de entrenamiento) | 0.99779 |
| Log-probabilidad media por token, muestra de entrenamiento (200 ejemplos) | -2.04 |
| Log-probabilidad media por token, TruthfulQA (200 ejemplos) | -3.78 |

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 0.54 GB solo para pesos (134.5M parametros x 4 bytes), mas overhead de activaciones y cache KV; en la practica, menos de 2 GB.
- VRAM estimada en fp16/bf16: aproximadamente 0.27 GB para pesos; en la practica, menos de 1 GB.
- Cabe en cualquier GPU consumer (RTX 3060, RTX 4060, GTX 1650, etc.) e incluso en CPU.
- GPU recomendadas: no se requieren GPUs de datacenter; A100/H100 no aportan ventaja significativa para este tamano.
- Opciones de despliegue: transformers (PyTorch) es la via natural dado el formato safetensors; llama.cpp, Ollama y vLLM son compatibles en teoria con arquitecturas Llama-like, pero no se documenta conversion a GGUF ni configuracion especifica en la informacion disponible.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| poligonchiik/llm-course-hw2-dpo | 134.515.008 | 1024 (entrenamiento) | no disponible | Hugging Face, 0 descargas | Ajuste DPO didactico |
| HuggingFaceTB/SmolLM-135M-Instruct | ~135M | no disponible en esta ficha | no disponible en esta ficha | Hugging Face, ampliamente usado | Modelo base del anterior |
| Otros modelos ~135M (p. ej. Qwen2.5-0.5B, TinyLlama-1.1B) | 0.5B / 1.1B | mayor | variable | Hugging Face | Alternativas de mayor tamano; no comparables directamente por escala |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo de 135M de parametros: capacidad limitada de razonamiento, conocimiento factual y coherencia en conversaciones largas.
- Riesgo elevado de alucinacion, especialmente en dominios especializados y en preguntas factuales.
- El analisis con TruthfulQA muestra una log-probabilidad media mas baja (-3.78) que en entrenamiento (-2.04), lo que sugiere sobreajuste al dataset de preferencias y posible degradacion en respuestas veraces.
- Licencia no especificada: no se puede garantizar el uso comercial; debe contactarse con el autor o consultarse la ficha del modelo base (SmolLM-135M-Instruct) para conocer las restricciones heredadas.
- Idiomas no declarados: el ejemplo de la model card esta en ingles; el rendimiento en castellano no esta documentado.
- Sin pipeline declarado ni descargas: no hay evidencia de uso en produccion ni de validacion por la comunidad.
- Entrenado con 1 epoca y batch size 4: receta minima, sin validacion sobre conjunto de test independiente.
- No se documentan sesgos especificos, pero al derivar de SmolLM-135M-Instruct hereda los sesgos del modelo base y del dataset Human-Like-DPO-Dataset.
- No apto para produccion sin evaluacion adicional: cero descargas, cero likes y ausencia de benchmarks estandar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/poligonchiik/llm-course-hw2-dpo
- Modelo base: https://huggingface.co/HuggingFaceTB/SmolLM-135M-Instruct
- Dataset de preferencias: https://huggingface.co/datasets/HumanLLMs/Human-Like-DPO-Dataset
- Paper de DPO (referencia general, no citado en la model card): https://arxiv.org/abs/2305.18290
- Paper de SmolLM (referencia general, no citado en la model card): https://arxiv.org/abs/2407.08734
