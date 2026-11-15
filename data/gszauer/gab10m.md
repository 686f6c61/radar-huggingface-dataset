# gszauer/Gab10M

## Resumen

Gab 10M es un modelo de lenguaje de aproximadamente 10,3 millones de parametros entrenado desde cero por gszauer. Se trata del miembro mas pequeno de la familia Gab, que incluye tambien Gab 100M y Gab 1B, y el primero que introduce una arquitectura propia: un transformer con bucles (looped transformer) en el que los nueve bloques centrales se ejecutan dos veces, de modo que sus 13 bloques de pesos producen 22 pasadas de bloque por byte procesado. No utiliza tokenizador: cada byte UTF-8 es un token, con un vocabulario de 256 entradas.

El modelo es un transformer decoder-only con pre-normalizacion mediante RMSNorm, convoluciones causales cortas ("canon layers") antes de la atencion y del MLP, QK-norm, embeddings posicionales rotatorios (RoPE), MLP SwiGLU y embeddings de entrada y salida atados. Su definicion canonica es `reference.js`, una implementacion en JavaScript sin dependencias que sirve como referencia contra la que se contrasta el codigo de entrenamiento. El modelo habla ingles y mantiene conversaciones cortas.

Su relevancia radica en el enfoque: demuestra que es viable entrenar desde cero un modelo byte-level con arquitectura bucleada en hardware de consumo (una unica NVIDIA RTX PRO 6000) y desplegarlo en navegador, con licencia MIT y pesos en float32. Es una pieza util para investigacion sobre eficiencia de parametros, modelos byte-level y experimentacion de arquitecturas alternativas a escala reducida.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only bucleado (2 prelude + 9 core ejecutados dos veces + 2 coda), RMSNorm, canon layers, QK-norm, RoPE, SwiGLU, embeddings atados |
| Parametros totales | 10.302.720 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2.048 bytes (ventana deslizante) |
| Tipos de cuantizacion | no disponible (pesos publicados en float32) |
| Idiomas soportados | ingles (en) |
| Licencia | MIT |
| Formato de pesos | safetensors (float32), formato nativo `.gab` (GAB_ con cabecera JSON + pesos float32), model.json con forma y orden de pesos |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only con pre-normalizacion RMSNorm (epsilon 1e-5), dimension de caracteristicas 256, 4 cabezas de atencion de dimension 64 y MLP SwiGLU de 256 a 680 a 256 sin sesgos. Cada bloque aplica una "canon layer" antes de la atencion y antes del MLP: una convolucion causal de 4 taps por caracteristica que mezcla cada posicion con las tres anteriores y se suma como residual. La atencion usa QK-norm (RMSNorm sobre queries y keys) antes de RoPE con pares intercalados y base 10.000. La unembedding esta atada a la matriz de embeddings. El bucle central ejecuta los nueve bloques core dos veces con los mismos pesos, reinyectando la salida del prelude en el flujo residual antes de la segunda pasada, lo que proporciona la profundidad efectiva de 22 bloques con 13 conjuntos de pesos. La cache KV mantiene una ranura por pasada de bloque (22).

El preentrenamiento se realizo sobre todo Cosmopedia v2 del dataset smollm-corpus, en una sola pasada de 147.277.920.173 bytes, con 1.123.641 pasos de 64 ventanas de 2.048 bytes, durante unas 220 horas en una NVIDIA RTX PRO 6000. Se reservo 1 documento de cada 10.000 para validacion y otro tanto para test. Posteriormente se ajusto como modelo conversacional sobre smol-smoltalk: 1.776.061.826 bytes, 27.100 pasos de 32 ventanas de 2.048 bytes (unas 3 horas), aprendiendo unicamente de las respuestas del asistente. El optimizador fue Muon para las matrices de atencion y MLP y AdamW (betas 0,9/0,95, weight decay 0,1) para el resto, con clipping de norma global a 1,0 y un schedule warmup-stable-decay (pico 2e-3 en preentrenamiento y 4e-4 en fine-tuning). Pesos en FP32.

## Capacidades

- Generacion de texto en ingles a nivel de byte, sin tokenizador.
- Conversacion multi-turno corta mediante marcadores de chat `<|u|>...<|e|><|a|>...<|e|>`.
- Ventana deslizante de 2.048 bytes, entrenada para ventanas de conversacion que pueden empezar en cualquier punto.
- Inferencia en navegador mediante `reference.js`, implementacion JavaScript sin dependencias con cache KV.
- No dispone de rol de sistema ni de tokens especiales: los marcadores son texto plano.
- No se documenta soporte de tool calling, function calling, agentes, vision, audio ni modo thinking.
- Capacidad multilingue limitada al ingles (modelo entrenado sobre corpus en ingles).

## Casos de uso

- Experimentacion en navegador: el modelo se puede cargar y ejecutar con `reference.js` directamente en el cliente, sin backend, gracias a su tamano de 0,1 GB y a la implementacion JavaScript con cache KV.
- Investigacion sobre modelos byte-level: permite estudiar el comportamiento de un LM sin tokenizador, con vocabulario de 256 bytes, en experimentos controlados y reproducibles.
- Estudio de arquitecturas bucleadas: sirve como banco de pruebas para analizar el efecto del loop de bloques (13 pesos, 22 pasadas) sobre la calidad y el coste computacional.
- Educacion y demostraciones: modelo pequeno y ligero para explicar el pipeline completo de entrenamiento desde cero (datos, optimizadores Muon/AdamW, schedule WSD, fine-tuning conversacional).
- Chat de terminal: el repositorio incluye `chat.py gszauer/Gab10M` para mantener conversaciones cortas en ingles desde linea de comandos.
- Pruebas de integracion con Transformers: permite validar ports personalizados (`trust_remote_code`) y comparar la implementacion Python con la referencia JavaScript.
- Generacion de texto divulgativo en ingles a muy baja latencia y coste, adecuada para prototipos y demos interactivas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 41 MB para los pesos en float32 (10,3 M parametros), mas overhead de activaciones y cache KV; muy por debajo de 1 GB en la practica.
- GPU recomendadas: cualquier GPU consumer moderna; el modelo cabe holgadamente en RTX 4090, RTX 3090, RTX 4060 y similares, e incluso en iGPU con memoria compartida.
- Cabe en GPU consumer: si, con margen amplio; tambien en CPU y en navegador.
- Opciones de despliegue: Transformers (`trust_remote_code`), `chat.py` del repositorio, `reference.js` con cache KV para navegador. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. El port de Transformers recalcula los ultimos 2.048 bytes en cada paso de generacion (sin cache KV), lo que es viable por el tamano del modelo; `reference.js` implementa generacion con cache KV.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Arquitectura | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Gab 10M | 10.302.720 | 2.048 bytes | Transformer bucleado byte-level | MIT | Hugging Face, navegador (reference.js) |
| Gab 100M | no disponible en la informacion | no disponible | Familia Gab | no disponible | Hugging Face (gszauer/Gab100M) |
| Gab 1B | no disponible en la informacion | no disponible | Familia Gab | no disponible | Hugging Face (gszauer/Gab1B) |
| Modelos comparables de ~10M parametros | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Tamano muy reducido (10,3 M parametros): la calidad del texto y la coherencia en conversaciones seran limitadas en comparacion con modelos de mayor escala.
- Solo ingles: no se ha entrenado ni evaluado en castellano ni en otros idiomas.
- Contexto de 2.048 bytes: en conversaciones largas el modelo solo ve la parte mas reciente; la memoria efectiva es corta.
- Riesgo alto de alucinacion y de respuestas incoherentes, propio de un modelo de esta escala entrenado sobre Cosmopedia y smol-smoltalk.
- Sin rol de sistema ni tokens especiales; el control del formato depende de marcadores de texto plano.
- El port de Transformers no usa cache KV y recalcula la ventana completa en cada paso, lo que puede penalizar la latencia en generaciones largas.
- Pesos en float32: no se publican versiones cuantizadas, lo que limita opciones de despliegue en entornos con restricciones de memoria muy severas (aunque el tamano es minimo).
- Licencia MIT: permite uso comercial, pero no se ofrece ninguna garantia sobre calidad, sesgos o idoneidad para produccion.
- Sesgos conocidos: no disponibles en la informacion proporcionada; al entrenarse sobre corpus en ingles, puede reflejar sesgos de dichos datos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/gszauer/Gab10M
- Gab 100M: https://huggingface.co/gszauer/Gab100M
- Gab 1B: https://huggingface.co/gszauer/Gab1B
- Dataset de preentrenamiento (Cosmopedia v2, smollm-corpus): https://huggingface.co/datasets/HuggingFaceTB/smollm-corpus
- Dataset de fine-tuning conversacional (smol-smoltalk): https://huggingface.co/datasets/HuggingFaceTB/smol-smoltalk
