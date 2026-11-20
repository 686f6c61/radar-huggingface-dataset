# bcckfdn/cevher2-test-18

## Resumen

cevher2-test-18 es un modelo de lenguaje de tipo decoder-only con arquitectura Llama/SmolLM2, entrenado desde cero por el usuario bcckfdn. Cuenta con 1.513.546.496 parametros (aproximadamente 1,5 mil millones) distribuidos en 34 capas, con una dimension oculta de 1792 y una ventana de contexto de 8192 tokens. El modelo esta orientado a generacion de texto y declara soporte para turco (tr) e ingles (en), lo que lo situa en la categoria de modelos pequenos con enfasis en un idioma de bajos recursos como el turco.

El entrenamiento se realizo desde cero sobre aproximadamente 35.389 millones de tokens (35,389 B), alcanzando una perdida de validacion de 2,7292. El vocabulario es de 65.536 tokens. La ficha del autor indica que se trata de un modelo preentrenado y conversacional, aunque no se detallan las fases de ajuste fino, RLHF o DPO.

Su relevancia radica en ser un ejemplo de modelo pequeno multilingue (turco-ingles) con licencia Apache 2.0, lo que facilita su uso comercial y su despliegue en hardware modesto. No obstante, la informacion publicada es escasa: no hay benchmarks, no se detalla la composicion del dataset ni el proceso de alineacion, por lo que debe evaluarse con cautela antes de usarlo en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only tipo Llama / SmolLM2 |
| Parametros totales | 1.513.546.496 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8192 tokens |
| Tipos de cuantizacion | no disponible (repo en safetensors; no se documentan GGUF/AWQ/GPTQ) |
| Idiomas soportados | turco (tr), ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

Datos adicionales de la model card: 34 capas, hidden size 1792, 28 cabezas de atencion Q y 7 cabezas KV (GQA), vocabulario de 65.536 tokens, 35.389 B tokens de entrenamiento y mejor val loss de 2,7292.

## Arquitectura y entrenamiento

El modelo sigue una arquitectura transformer decoder-only con las convenciones de Llama, segun los tags (llama, smollm2). Destaca el uso de Grouped Query Attention (GQA) con 28 cabezas de consulta y 7 cabezas de clave/valor, lo que reduce el coste de memoria del KV cache durante la inferencia. La dimension oculta es de 1792 y el modelo tiene 34 capas, con un vocabulario de 65.536 tokens. La longitud de contexto declarada es de 8192 tokens.

El entrenamiento se realizo desde cero (pretrained-from-scratch) sobre aproximadamente 35.389 millones de tokens, alcanzando una perdida de validacion de 2,7292. La model card no especifica la composicion del dataset, la mezcla de idiomas, ni si hubo fases posteriores de ajuste supervisado, RLHF o DPO, pese a que los tags incluyen "conversational". Tampoco se documentan innovaciones tecnicas adicionales como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de texto autoregresiva en turco e ingles.
- Modelo preentrenado con tag "conversational", lo que sugiere uso en dialogos, aunque no se documenta el proceso de alineacion.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues limitadas a turco e ingles.
- Capacidades especiales (modo thinking, vision, audio): no disponibles.
- Compatible con text-generation-inference y endpoints_compatible segun los tags.

## Casos de uso

- Generacion de texto en turco: el modelo puede redactar contenido, resumir o parafrasear en turco, un idioma con menos recursos que el ingles, gracias a su vocabulario de 65.536 tokens y su entrenamiento especifico en ese idioma.
- Prototipado de asistentes conversacionales: por su tamano de 1,5 B y su contexto de 8192 tokens, es adecuado para experimentar con chatbots multi-turno en entornos de desarrollo con recursos limitados.
- Generacion aumentada por recuperacion (RAG) en turco: la ventana de 8192 tokens permite incluir varios fragmentos de contexto recuperado para responder preguntas sobre documentacion.
- Traduccion asistida turco-ingles: al declarar ambos idiomas, puede emplearse como base para tareas de traduccion o reescritura, aunque requerira evaluacion previa.
- Clasificacion y etiquetado de texto: puede ajustarse con fine-tuning para tareas de analisis de sentimiento o categorizacion en turco.
- Educacion e investigacion: sirve como modelo de referencia para estudiar el entrenamiento desde cero en idiomas de bajos recursos y para experimentos academicos con licencia Apache 2.0.
- Despliegue en edge o entornos con poca VRAM: su tamano permite ejecutarlo en GPUs de consumo, lo que facilita demos y pruebas de concepto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El unico dato de rendimiento es la perdida de validacion de 2,7292 reportada por el autor, que no es directamente comparable con metricas estandar como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 3 GB solo para pesos, mas overhead de activaciones y KV cache; en la practica, entre 4 y 6 GB segun longitud de contexto y batch.
- VRAM estimada en cuantizacion de 8 bits: alrededor de 1,5-2 GB para pesos.
- VRAM estimada en cuantizacion de 4 bits: alrededor de 1 GB para pesos (si se generan pesos GGUF, no incluidos en el repo).
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para FP16 con contexto moderado; RTX 3060, RTX 4060, RTX 4090, A100 o H100 para mayor throughput.
- Cabe en GPUs de consumo: si, en modelos como RTX 3060/4060 (8-12 GB) y superiores.
- Opciones de despliegue: transformers (soporte nativo), text-generation-inference (tag endpoints_compatible); llama.cpp, Ollama o vLLM requeririan conversion a los formatos correspondientes, no documentada.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| cevher2-test-18 | 1,51 B | 8192 | tr, en | Apache 2.0 | Entrenado desde cero; sin benchmarks publicados |
| SmolLM2-1.7B | 1,7 B | 8192 (segun version) | en (principalmente) | Apache 2.0 | Arquitectura de referencia; con benchmarks publicados |
| Qwen2.5-1.5B | 1,5 B | 32.768 | multilingue (incluye en, no tr de forma destacada) | Apache 2.0 | Amplia cobertura multilingue y benchmarks publicados |
| Llama 3.2 1B | 1,2 B | 128.000 | multilingue | Llama 3.2 Community License | Mayor contexto y ecosistema, licencia con restricciones |

La comparacion con SmolLM2-1.7B y Qwen2.5-1.5B es pertinente por tamano y licencia; sin embargo, cevher2-test-18 carece de benchmarks publicados, por lo que no es posible establecer una comparacion cuantitativa de rendimiento. Su principal diferenciador es el enfasis en turco.

## Limitaciones y advertencias

- No se han publicado benchmarks, por lo que el rendimiento real en tareas estandar es desconocido.
- Riesgo de alucinacion inherente a un modelo de 1,5 B entrenado con 35 B tokens; la perdida de validacion de 2,7292 sugiere margen de mejora.
- Sesgos desconocidos: no se documenta la composicion del dataset ni filtros de sesgo.
- Cobertura limitada a turco e ingles; no se garantiza un rendimiento adecuado en otros idiomas.
- No se documenta el proceso de alineacion (RLHF/DPO) pese al tag "conversational"; el comportamiento en dialogos puede ser irregular.
- No se incluyen pesos cuantizados en el repo; el despliegue eficiente requerira conversion manual.
- Aunque la licencia Apache 2.0 permite uso comercial, la falta de evaluacion independiente desaconseja su uso en produccion sin validacion previa.
- El nombre "test" en el identificador sugiere que puede tratarse de una version experimental.

## Enlaces

- Hugging Face: https://huggingface.co/bcckfdn/cevher2-test-18
- No se han encontrado otros enlaces (papers, blogs, repos, demos) en la informacion proporcionada.
