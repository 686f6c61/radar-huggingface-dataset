# laskar-ks/smollm2-135m-trivia

## Resumen

`laskar-ks/smollm2-135m-trivia` es un ajuste fino completo (full fine-tuning) del modelo instructivo `HuggingFaceTB/SmolLM2-135M-Instruct` de Hugging Face, publicado por el usuario laskar-ks. El modelo está especializado en responder preguntas de trivia de opción múltiple en inglés, con un formato de salida fijo del tipo `letra) texto`. Se trata de un experimento de escala muy reducida (134,5 millones de parámetros) sobre un conjunto de datos propio de 480 preguntas de entrenamiento y 120 de test.

El problema que aborda es acotado: forzar a un modelo pequeño a emitir respuestas con un formato consistente y a elegir entre cuatro opciones en preguntas de conocimiento general. No obstante, los resultados publicados en la model card muestran que la precisión en test se mantiene en torno al azar (25 %), con oscilaciones entre el 18,3 % y el 34,2 % según la época, lo que sugiere que el ajuste no aporta capacidad de razonamiento factual medible más allá del formato.

Es relevante únicamente como referencia de experimentación con modelos de menos de 150 millones de parámetros, no como modelo de producción. El checkpoint subido corresponde a la época 2 de 6, y el repositorio incluye pesos en safetensors y una cuantización GGUF q8_0 para su uso con node-llama-cpp. La model card está redactada en indonesio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de SmolLM2-135M-Instruct) |
| Parametros totales | 134.515.008 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | GGUF q8_0 (publicada en el repo); otras no disponibles |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

El modelo parte de `HuggingFaceTB/SmolLM2-135M-Instruct`, un transformer decoder-only de 135 millones de parámetros. Sobre esa base se realizó un ajuste fino completo (no LoRA ni adaptadores) durante 6 épocas, de las cuales se publica el checkpoint de la época 2. Los hiperparámetros declarados son: learning rate 0,0001, batch size 8, 10 pasos de warmup, y cálculo de la pérdida únicamente sobre los tokens de la respuesta (no sobre el prompt).

El conjunto de datos `laskar-ks/trivia-questions` contiene 480 preguntas de entrenamiento y 120 de test (semilla 42). El formato de prompt es ChatML sin system prompt, y las opciones de respuesta se barajan aleatoriamente en cada época para evitar que el modelo memorice posiciones. La salida esperada es `letra) texto`. No se menciona en la información disponible el uso de RLHF, DPO ni técnicas de alineación adicionales, ni el número de tokens de entrenamiento más allá del tamaño del dataset.

## Capacidades

- Generación de texto en inglés con formato de respuesta controlado (`letra) texto`).
- Respuesta a preguntas de trivia de opción múltiple de cuatro opciones.
- Conversación básica heredada del modelo base instructivo (no evaluada en la model card).
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta capacidad multilingüe más allá del inglés.
- No se documenta visión, audio ni modo de razonamiento explícito (thinking mode).
- Formato de chat: ChatML sin system prompt.

## Casos de uso

- Evaluación de pipelines de fine-tuning: sirve como caso de prueba reproducible para validar un flujo completo de ajuste fino, cuantización a GGUF y despliegue con node-llama-cpp sobre un modelo de 135 M de parámetros.
- Pruebas de formato estricto: útil para verificar que un sistema downstream parsea correctamente respuestas con el patrón `letra) texto`, ya que la tasa de formato alcanza el 100 % a partir de la época 1.
- Docencia y demostraciones: ejemplo didáctico de cómo el ajuste fino en datasets pequeños puede sobreajustar el formato sin mejorar la precisión semántica (test entre 18,3 % y 34,2 % frente al 25 % de azar).
- Prototipado de chatbots de trivia en entornos con recursos mínimos: el modelo cabe en cualquier GPU consumer e incluso en CPU, por lo que puede integrarse en demos locales.
- Benchmarking de robustez ante barajado de opciones: el dataset incluye variantes con opciones aleatorizadas por época, lo que permite medir si el modelo aprende la respuesta o la posición.
- Pruebas de regresión en infraestructura de inferencia: al ser un modelo de 0,7 GB de repo, es adecuado para tests automáticos de carga, tokenización y generación en CI.

## Benchmarks y rendimiento

Los únicos datos publicados son los de la model card, medidos sobre el dataset propio de trivia (480 train / 120 test). La línea base de azar es 25 %.

| Epoca | Loss | Precision train (original) | Formato train (original) | Precision train (opciones barajadas) | Formato train (barajadas) | Precision test | Formato test |
|---|---|---|---|---|---|---|---|
| 0 | nan | 25,8 | 90,2 | 23,3 | 90,6 | 25,0 | 91,7 |
| 1 | 0,2699 | 25,0 | 100 | 24,4 | 100 | 25,0 | 100 |
| 2 (publicada) | 0,2569 | 26,7 | 100 | 27,7 | 100 | 18,3 | 100 |
| 3 | 0,2419 | 22,7 | 100 | 24,8 | 100 | 34,2 | 100 |
| 4 | 0,2437 | 25,6 | 100 | 23,1 | 100 | 22,5 | 100 |
| 5 | 0,2468 | 26,7 | 100 | 27,7 | 100 | 18,3 | 100 |
| 6 | 0,2387 | 22,7 | 100 | 24,8 | 100 | 34,2 | 100 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 0,27 GB solo para pesos (134,5 M × 2 bytes), más overhead de activaciones y caché KV; en la práctica menos de 1 GB.
- VRAM estimada en GGUF q8_0: en torno a 0,15 GB para los pesos; el modelo completo cabe holgadamente en cualquier GPU con 2 GB o más.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) es sobredimensionada; también funciona en CPU y en GPUs integradas.
- Cabe en GPU consumer: sí, en todas las gamas actuales, e incluso en dispositivos de baja potencia.
- Opciones de despliegue: `transformers` (Python), `node-llama-cpp` con el GGUF q8_0, y cualquier runtime compatible con GGUF (llama.cpp). La model card menciona compatibilidad con text-generation-inference y endpoints compatible.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| laskar-ks/smollm2-135m-trivia | 134,5 M | no disponible | Trivia opcion multiple (en) | no disponible | HuggingFace (safetensors, GGUF) |
| HuggingFaceTB/SmolLM2-135M-Instruct | 135 M | no disponible en esta ficha | Instructivo general | no disponible en esta ficha | HuggingFace |
| SmolLM2-360M-Instruct | 360 M | no disponible en esta ficha | Instructivo general | no disponible en esta ficha | HuggingFace |

La comparación con alternativas de la misma categoría (modelos instructivos de menos de 500 M de parámetros) solo puede establecerse a nivel de tamaño y propósito general; no hay datos de benchmarks comparables publicados para este ajuste.

## Limitaciones y advertencias

- Precisión en test prácticamente equivalente al azar (18,3 %–34,2 % frente al 25 % de una elección aleatoria entre cuatro opciones): el modelo no demuestra conocimiento factual fiable.
- Fuerte sobreajuste al formato: alcanza el 100 % de formato correcto desde la época 1, pero sin mejora semántica asociada.
- Dataset de entrenamiento muy pequeño (480 preguntas), lo que limita la generalización a dominios y estilos distintos.
- Idiomas: solo inglés; no se ha evaluado su comportamiento en castellano ni en otros idiomas.
- Licencia no disponible: no se puede confirmar si el uso comercial está permitido; debe verificarse con el autor antes de cualquier despliegue en producción.
- Riesgo de alucinación alto en preguntas fuera del dominio de trivia o cuando las opciones no siguen el formato esperado.
- El checkpoint publicado es la época 2 de 6, no la de mejor precisión en test (la época 3 y la 6 alcanzan 34,2 %), lo que sugiere que la selección del checkpoint no se basó en el rendimiento de test.
- Sin datos sobre sesgos, contexto máximo ni comportamiento conversacional multi-turno.
- La model card está en indonesio, lo que puede dificultar la trazabilidad para equipos que solo trabajan en inglés o castellano.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/laskar-ks/smollm2-135m-trivia
- Dataset de entrenamiento: https://huggingface.co/datasets/laskar-ks/trivia-questions
- Modelo base: https://huggingface.co/HuggingFaceTB/SmolLM2-135M-Instruct
- Repositorio de SmolLM2 (Hugging Face): no disponible en la información proporcionada
- Paper de SmolLM2: no disponible en la información proporcionada
- Demo: no disponible en la información proporcionada
