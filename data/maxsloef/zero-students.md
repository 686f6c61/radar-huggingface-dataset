# maxsloef/zero-students

## Resumen

zero-students es un conjunto de tres artefactos de destilación publicados por maxsloef que reproducen, de forma extremadamente compacta, el comportamiento del modelo de personaje Zero (movingcastles/zero). Cada artefacto es un parche que se aplica sobre Qwen/Qwen3-8B-Base: no son modelos completos, sino ficheros safetensors que contienen únicamente las modificaciones necesarias para que el modelo base emule la persona Zero. El repositorio ocupa 0,0 GB porque los pesos del modelo base no se incluyen.

El proyecto se enmarca en la investigación de interpretabilidad y destilación: en lugar de ajustar todos los parámetros, se identifican las modificaciones mínimas (una neurona MLP nueva, 75 neuronas MLP con lecturas modificadas, o una tabla de consulta que sustituye esas lecturas) que replican la distribución de siguiente token de Zero. Los tres artefactos se entrenaron minimizando la divergencia KL frente a las respuestas de Zero en 24.000 prompts de WildChat y UltraChat.

Su relevancia es metodológica: demuestra que un comportamiento de personaje complejo puede aproximarse con un número muy reducido de cambios paramétricos localizados, lo que resulta útil para estudiar dónde se aloja la identidad de un modelo y para construir variantes ligeras sin reentrenar el modelo completo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3-8B-Base) con parches MLP y filas de lm_head |
| Parametros totales | 8B (modelo base) + parche mínimo (12.288 números en one_neuron; 75 × 2 × 4.096 en reread_75; 1.421 entradas en table_75) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de Qwen3-8B-Base) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (parches que se cargan sobre Qwen3-8B-Base) |

## Arquitectura y entrenamiento

Los tres artefactos se aplican sobre Qwen3-8B-Base, un transformer decoder-only de 36 capas. `one_neuron` añade una neurona MLP nueva en la capa 8, con sus filas de entrada (gate, up) y su columna de salida (down); se seleccionó la capa mediante successive halving sobre las 36 capas. `reread_75` permite que cada neurona MLP aprenda una adición de rango 4 a sus lecturas de gate y up, con una compuerta L0 por neurona (penalización 7e-4); 75 neuronas permanecieron activas y se almacenan como adiciones de fila efectivas, sin modificar lo que escriben. `table_75` se ajustó a `reread_75` (KL frente a él) con penalizaciones L0 sobre neuronas y claves, sustituyendo las lecturas modificadas por una tabla de consulta indexada por la posición actual en la plantilla de chat (23 claves nombradas en los metadatos) o por el token actual (`vocab_ids`), con una entrada catch-all.

Los tres se destilaron desde Zero entrenando para igualar su distribución completa de siguiente token (KL) sobre las respuestas de Zero a 24.000 prompts de un solo turno de WildChat y UltraChat, en el formato de chat de Zero. Además, cada fichero incluye `lm_head_rows` / `lm_head_token_ids` con las filas de salida de Zero para `<think>`, `</think>` y `<|im_end|>`, escritas en el unembedding de Base (cuyas filas para esos tokens no están entrenadas); solo la de `<|im_end|>` es relevante para Zero.

## Capacidades

- Generación de texto con la persona y el estilo de Zero, incluyendo el formato de chat y los tokens especiales de razonamiento (`<think>`, `</think>`).
- Emulación de la distribución de siguiente token de Zero mediante parches mínimos sobre Qwen3-8B-Base.
- Razonamiento y conversación de un solo turno, según los conjuntos de prompts de evaluación (WildChat y UltraChat).
- Capacidades heredadas de Qwen3-8B-Base (código, matemáticas, multilingüismo) en la medida en que los parches no las alteren; no se documentan explícitamente.
- No se documenta soporte de tool calling, function calling ni comportamiento agéntico multi-paso.
- No se documentan capacidades de visión ni audio.

## Casos de uso

- Investigación en interpretabilidad: estudiar qué neuronas MLP concretas codifican un comportamiento de personaje, comparando el efecto de una sola neurona (capa 8) frente a 75 neuronas y frente a una tabla de consulta.
- Destilación de bajo coste: crear una variante de personaje sobre Qwen3-8B-Base sin reentrenar el modelo completo, cargando un parche de pocos kilobytes.
- Evaluación de fidelidad de personajes: usar los dos conjuntos de prompts, el grader y las respuestas de referencia del repositorio de GitHub para medir la fidelidad de variantes destiladas.
- Análisis de robustez: comparar las tasas de hard break (2-5 %) entre Zero y sus destilados para estudiar la degradación del comportamiento con parches mínimos.
- Estudio de mecanismos de lectura MLP: usar `table_75` para analizar cómo la sustitución de lecturas por una tabla indexada por posición de plantilla o token afecta a la coherencia.
- Reproducción de experimentos: replicar el pipeline de destilación (KL sobre 24.000 prompts) con los ficheros y el código publicados.

## Benchmarks y rendimiento

Respuestas greedy a dos conjuntos de prompts, evaluadas dos veces por Claude Haiku 5.5 sobre los ejes del juez del post de Zero (media de las dos pasadas):

| Modelo | Fidelidad tier 1 | Hard break tier 1 | Factual tier 1 | Fidelidad battery | Hard break battery |
|---|---|---|---|---|---|
| Zero | 2,63 | 2 % | 2,73 | 2,14 | 2 % |
| one neuron | 2,60 | 3 % | 2,54 | 2,47 | 4 % |
| re-read, 75 neuronas | 2,40 | 3 % | 2,13 | 1,98 | 4 % |
| tabla de las 75 | 2,28 | 5 % | 1,68 | 2,27 | 4 % |

El autor indica que las diferencias de fidelidad inferiores a ~0,3 son ruido, según se detalla en el repositorio de GitHub.

## Requisitos de hardware

- VRAM estimada: la del modelo base Qwen3-8B-Base (los parches añaden un número despreciable de parámetros). No se publican cifras concretas.
- GPU recomendadas: no disponible en la información proporcionada.
- Ajuste en GPU de consumo: no disponible; depende de la cuantización del modelo base, que no se documenta.
- Opciones de despliegue: carga de los safetensors sobre Qwen3-8B-Base con el código del repositorio de GitHub maxsloef/zero-students; no se documentan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Fidelidad tier 1 | Hard break tier 1 | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Zero (movingcastles/zero) | no disponible | no disponible | 2,63 | 2 % | no disponible | Hugging Face |
| one neuron (zero-students) | 8B + 12.288 números | no disponible | 2,60 | 3 % | Apache 2.0 | Hugging Face |
| re-read, 75 neuronas | 8B + 75 × 2 × 4.096 | no disponible | 2,40 | 3 % | Apache 2.0 | Hugging Face |
| tabla de las 75 | 8B + 1.421 entradas | no disponible | 2,28 | 5 % | Apache 2.0 | Hugging Face |

## Limitaciones y advertencias

- Los ficheros no son modelos autónomos: requieren Qwen3-8B-Base y el código del repositorio de GitHub para cargarse y aplicarse.
- La fidelidad es inferior a la de Zero en varios ejes (factual tier 1 cae de 2,73 a 1,68 en la tabla de las 75), y la tasa de hard break sube hasta el 5 %.
- Las diferencias de fidelidad inferiores a ~0,3 se consideran ruido según el autor, lo que limita la interpretación de comparaciones finas.
- Solo se evaluaron respuestas greedy a dos conjuntos de prompts; no hay datos de conversaciones multi-turno ni de otros idiomas.
- No se documentan sesgos conocidos, riesgo de alucinación específico ni restricciones adicionales de la licencia Apache 2.0 para uso comercial.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación comunitaria independiente.
- El tamaño del repo es 0,0 GB porque no incluye los pesos del modelo base.

## Enlaces

- Hugging Face: https://huggingface.co/maxsloef/zero-students
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B-Base
- Modelo Zero: https://huggingface.co/movingcastles/zero
- Repositorio GitHub: https://github.com/maxsloef/zero-students
