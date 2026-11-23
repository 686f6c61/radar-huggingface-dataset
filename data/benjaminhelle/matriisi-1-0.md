# BenjaminHelle/Matriisi-1.0

## Resumen
Matriisi 1.0 es un modelo de lenguaje causal de estilo Llama desarrollado por Benjamin Helle, entrenado desde cero y publicado bajo licencia Apache 2.0. Con 9.992.448 parámetros (aproximadamente 10M), se posiciona como un modelo base de tipo "tiny" orientado a la experimentación local y al tinkering, no como un asistente conversacional. Su principal característica diferencial es la eficiencia en el presupuesto de entrenamiento: se entrenó con una sola pasada sobre 502.383.824 tokens, lo que supone unos 50 tokens por parámetro, frente a los varios miles de millones que suelen emplear modelos de tamaño similar.

La arquitectura es un decoder transformer clásico (LlamaForCausalLM) con 10 capas, tamaño oculto de 256, 4 cabezas de atención de dimensión 64, feed-forward de 686 y un vocabulario de 8.192 tokens BPE a nivel de byte. Soporta una longitud de contexto de 4.096 tokens y utiliza RMSNorm, RoPE y SwiGLU, sin sesgos en atención ni MLP, con pesos de entrada y salida atados. El checkpoint publicado corresponde al paso 15.332 con una pérdida de validación de 2,7431.

Es relevante ahora como ejemplo reproducible de entrenamiento de un modelo pequeño desde cero en hardware de consumo (una RX 7600) y como punto de partida para adaptación de dominio o fine-tuning. No obstante, al ser un modelo base sin instrucción, sus capacidades prácticas son limitadas y debe evaluarse con expectativas realistas: continuaciones cortas de texto en inglés, matemáticas simples y fragmentos pequeños de código.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Llama-style decoder (LlamaForCausalLM), transformer causal |
| Parametros totales | 9.992.448 (~10M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4.096 tokens |
| Tipos de cuantizacion | no disponible (pesos publicados en float32; no se documentan cuantizaciones oficiales) |
| Idiomas soportados | Inglés (en la práctica, solo inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors, float32 |

## Arquitectura y entrenamiento
Matriisi 1.0 es un transformer decoder causal de estilo Llama con 10 capas, dimensión oculta de 256, 4 cabezas de atención (dimensión por cabeza de 64) y tamaño de feed-forward de 686. Emplea RMSNorm, RoPE y SwiGLU, sin sesgos en atención ni en las capas MLP, y ata los pesos de embedding de entrada y salida. El vocabulario es un BPE a nivel de byte de 8.192 tokens, construido específicamente para el proyecto y empaquetado junto con los pesos, por lo que tokenizador y modelo deben usarse conjuntamente.

El entrenamiento se realizó desde cero en una GPU RX 7600 con un pipeline propio, en una sola pasada sobre 502.383.824 tokens (unos 50 tokens por parámetro). La mezcla de datos fue: 54,7% inglés (274,8M tokens), 15,3% matemáticas y ciencia (76,8M), 15,1% código (76,0M) y 14,9% conocimiento general y razonamiento (74,7M), con fuentes como FineWeb-Edu, FineMath, Sci-Base, Wikipedia, HotpotQA y código open source. No se documenta RLHF, DPO ni ninguna fase de alineación; es un modelo puramente preentrenado. El checkpoint publicado registra el paso 15.332 con pérdida de validación de 2,7431, y el repositorio incluye un `export_metadata.json` con el paso de origen, la pérdida, el recuento de parámetros y el hash del tokenizador.

## Capacidades
- Generación y continuación de texto corto en inglés, sin modo instrucción ni chat.
- Continuación de fragmentos de código, especialmente si se imita el formato de entrenamiento con marcador de fichero (`<|file|>main.c`).
- Razonamiento aritmético y matemático muy básico, limitado a operaciones simples.
- Conocimiento general superficial derivado de Wikipedia y corpus educativos.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- Capacidad multilingüe prácticamente nula: solo inglés en la práctica.
- No dispone de modo thinking, visión ni audio.

## Casos de uso
- Experimentación local con modelos pequeños: sirve para probar pipelines de inferencia, tokenizadores y flujos de generación en CPU o GPU de gama baja sin coste de infraestructura.
- Punto de partida para fine-tuning de dominio: al ser un modelo base pequeño y con licencia Apache 2.0, puede adaptarse a tareas concretas (clasificación, completado de plantillas) con presupuestos reducidos.
- Docencia y divulgación: permite ilustrar el funcionamiento interno de un transformer causal (RMSNorm, RoPE, SwiGLU) con un modelo de ~40 MB en float32 que se inspecciona y ejecuta fácilmente.
- Completado de fragmentos de código en entornos controlados: útil para demostrar autocompletado simple en editores o scripts, siempre con revisión humana por la baja fiabilidad.
- Generación de texto de relleno o prototipos: para maquetar interfaces, pruebas de carga o demos que no requieran coherencia factual.
- Investigación sobre eficiencia de entrenamiento: como referencia reproducible de un modelo entrenado con ~50 tokens por parámetro y su impacto en benchmarks, útil para estudiar curvas de escalado y presupuestos de cómputo.
- Base para comparativas de tokenizadores: su BPE de 8.192 tokens a nivel de byte permite estudiar el efecto del vocabulario en modelos tiny.

## Benchmarks y rendimiento
Evaluación zero-shot de opción múltiple con `lm-eval` 0.4.13 y Arithmark-3; todas las métricas son `acc_norm`.

| Benchmark | Resultado |
|---|---:|
| HellaSwag | 27,13% |
| ARC-Easy | 33,04% |
| ARC-Challenge | 21,50% |
| PIQA | 54,19% |
| Arithmark-3 | 34,6% |

No se han publicado en la información disponible resultados comparativos frente a otros modelos en estos mismos benchmarks.

## Requisitos de hardware
- VRAM estimada para inferencia: aproximadamente 40 MB en float32 para los pesos; el uso real en memoria ronda unas pocas centenas de MB incluyendo activaciones y tokenizador, por lo que cabe en cualquier GPU consumer e incluso en CPU.
- GPU recomendadas: no requiere GPU dedicada; funciona en CPU. Cualquier GPU consumer (GTX 1050, RTX 3060, RTX 4090) es sobrada. El entrenamiento original se hizo en una RX 7600.
- Cabe en GPU consumer: sí, en todas, incluidas integradas.
- Opciones de despliegue: Transformers (referencia del autor), text-generation-inference (tag `text-generation-inference`), endpoints compatibles; no se documentan integraciones con vLLM, llama.cpp u Ollama ni pesos GGUF.
- Latencia y throughput: no disponibles de forma oficial; por el tamaño (~10M parámetros) la inferencia en CPU es del orden de milisegundos a decenas de milisegundos por token, pero no hay cifras publicadas.

## Comparativa con modelos similares
No se dispone de datos de benchmarks comparables publicados en la información proporcionada para establecer una comparativa rigurosa con alternativas de la misma categoría (modelos tiny de ~10M parámetros). A modo orientativo estructural, se puede comparar con otras familias de modelos pequeños, pero sin cifras de rendimiento verificadas:

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Matriisi 1.0 | ~10M | 4.096 | Apache 2.0 | Hugging Face |
| Modelos tiny tipo GPT-2 small | ~124M | 1.024 | MIT | Hugging Face |
| Modelos tipo TinyLlama | ~1,1B | 2.048 | Apache 2.0 | Hugging Face |

Los datos de rendimiento de los modelos alternativos no están disponibles en la información proporcionada; no se inventan cifras.

## Limitaciones y advertencias
- Capacidad muy limitada por tamaño: con menos de 10M de parámetros es esperable texto incoherente, respuestas incorrectas, repeticiones e código inválido.
- Riesgo alto de alucinación: no es adecuado para responder preguntas, búsqueda factual ni ninguna tarea donde la corrección importe.
- No sigue instrucciones: los prompts se tratan como texto a continuar, no como peticiones; no debe usarse como chat.
- Solo inglés en la práctica; el rendimiento en otros idiomas es inexistente o degradado.
- Los datos de entrenamiento pueden contener errores, sesgos, material inseguro o contenido con derechos de autor heredado de sus fuentes.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías y el rendimiento no es apto para producción en tareas críticas.
- El tokenizador y sus IDs de tokens especiales forman parte del modelo y deben usarse conjuntamente con los pesos.
- No hay versiones cuantizadas oficiales ni soporte documentado para motores de inferencia de alto rendimiento.

## Enlaces
- Hugging Face: https://huggingface.co/BenjaminHelle/Matriisi-1.0
- No se han encontrado otros enlaces (papers, blogs, repos, demos) en la información proporcionada.
