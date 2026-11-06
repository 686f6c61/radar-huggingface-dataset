# lufiaq/fieldatlas-reader-qwen3.5-2b-gguf

## Resumen

Field Atlas reader es un ajuste fino mediante LoRA de Qwen/Qwen3.5-2B (1.942.653.248 parámetros reales en safetensors, aunque la model card cita 2,27 B) orientado a la fase de "reader" de una aplicación de pregunta-respuesta offline. El modelo recibe una pregunta junto con hasta 8 pasajes numerados y debe responder exclusivamente a partir de ellos, citando las fuentes utilizadas con el formato `[S2]`, y responder literalmente `The saved sources don't say.` cuando los pasajes no contienen la respuesta. Lo publica el usuario lufiaq en Hugging Face bajo licencia Apache-2.0, con pesos únicamente en formato GGUF Q4_K_M (1,31 GB).

El problema que resuelve es concreto: los modelos base pequeños tienden a alucinar o a responder con conocimiento paramétrico cuando el contexto recuperado es insuficiente. Este ajuste entrena explícitamente la abstención y la citación, dos comportamientos críticos en pipelines RAG que operan sin conexión. Está pensado para ejecutarse en CPU con llama.cpp (4 hilos, contexto de 8192 tokens), lo que lo hace viable en dispositivos de gama baja o en un móvil, aunque el autor no ha medido el rendimiento en teléfono.

La relevancia actual radica en que demuestra que un modelo de ~2 B parámetros puede mejorar sustancialmente la precisión de un lector RAG (del 41,7 % al 73,3 % en el dev set público de 60 preguntas) sin cambiar el tamaño del archivo ni la arquitectura respecto al base. Es un caso de estudio útil sobre ajuste fino orientado a comportamiento (abstención, citación) más que a conocimiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen3.5-2B); no se detalla en la model card |
| Parametros totales | 1.942.653.248 (safetensors); la model card cita 2,27 B |
| Parametros activos | no disponible (no es MoE según la informacion proporcionada) |
| Longitud de contexto | 8192 tokens (configuracion de ejecucion documentada) |
| Tipos de cuantizacion | Q4_K_M (único archivo publicado) |
| Idiomas soportados | inglés (`en`) |
| Licencia | Apache-2.0 (modelo, scripts de entrenamiento y salidas de evaluación); datos de entrenamiento CC BY-SA 4.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino LoRA sobre Qwen/Qwen3.5-2B, un transformer decoder-only del que la model card no detalla capas, dimensiones ocultas ni mecanismo de atención. No se especifica si emplea atención lineal, decodificación especulativa u otras innovaciones del base. El archivo publicado es únicamente la versión cuantizada Q4_K_M convertida con el código fuente de llama.cpp incluido en el sdist de PyPI de llama-cpp-python 0.3.36 (octubre de 2026).

El conjunto de entrenamiento (`data/train_v3.jsonl.gz`) contiene 1.458 ejemplos en formato chat, cada uno con una pregunta y entre 1 y 8 pasajes recuperados como entrada y una respuesta como salida: 837 etiquetados `yes`, 423 `partial` y 198 `no` (respuesta exacta `The saved sources don't say.`). Sesenta y seis ítems de primeros auxilios aparecen duplicados. Los pasajes (204.031 fragmentos, mediana de 738 caracteres) se cortaron con el formato "Title — Overview / Details" de la aplicación a partir de Wikipedia en inglés simple y estándar (`wikimedia/wikipedia` 20231101 más 267 artículos específicos vía API de MediaWiki), Wikivoyage en inglés (dump oficial, 9.000 guías), temas de salud de MedlinePlus (NLM, dominio público) y 449 artículos de acceso abierto de PubMed Central (solo CC BY / CC0). Cada ejemplo conserva la URL de origen de cada pasaje. Las preguntas fueron generadas por un modelo de lenguaje a partir de un pasaje dorado o de una pista temática. No se documenta el uso de RLHF ni DPO; el procedimiento es ajuste supervisado sobre LoRA.

## Capacidades

- Generación de respuestas extractivas y de síntesis a partir de hasta 8 pasajes numerados, sin recurrir a conocimiento externo.
- Citación explícita de los pasajes utilizados con marcadores tipo `[S2]`.
- Abstención controlada: devuelve exactamente `The saved sources don't say.` cuando los pasajes no contienen la respuesta.
- Distinción entre respuesta completa (`yes`), parcial (`partial`) e insuficiencia (`no`), según la taxonomía del conjunto de entrenamiento.
- Respuestas en inglés exclusivamente.
- Modo "thinking" desactivado en todas las evaluaciones documentadas.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, visión ni audio.

## Casos de uso

- Aplicación de pregunta-respuesta offline sobre corpus locales: el modelo lee pasajes recuperados por BM25 o un retriever similar y responde citando fuentes, sin conexión a red, lo que encaja con su diseño para el runtime de Field Atlas en CPU.
- Atención al cliente con base documental cerrada: al abstenerse cuando la respuesta no está en los pasajes, reduce el riesgo de respuestas inventadas sobre políticas o procedimientos internos.
- Asistente de consulta de guías de viaje: entrenado con 9.000 guías de Wikivoyage, puede responder preguntas sobre destinos citando la guía correspondiente.
- Consulta de material sanitario divulgativo: los pasajes de MedlinePlus y PubMed Central permiten responder preguntas de salud con citas, siempre con la advertencia de que no es un dispositivo médico.
- Verificación de afirmaciones contra documentación: dado un conjunto de pasajes y una pregunta, el modelo indica si la información está, es parcial o no aparece, útil en revisión documental.
- Despliegue en dispositivos con recursos limitados: el archivo Q4_K_M de 1,31 GB y el consumo de ~2,1 GB de pico en llama-cli con contexto 8192 lo hacen apto para portátiles sin GPU y, potencialmente, para móviles (no medido por el autor).
- Evaluación de pipelines RAG: sirve como lector de referencia para medir recuperación y abstención en conjuntos de preguntas con pasajes numerados.

## Benchmarks y rendimiento

Resultados en el dev set público de Field Atlas (60 preguntas, `reader_bench.py`), ejecución en CPU con llama.cpp en el commit `60081bb2b5b3294165a4d67c5cbeebe74c868014`, 4 hilos, contexto 8192, temperatura 0, thinking off:

| Medida | Qwen3.5-2B Q4_K_M (base) | Field Atlas reader |
|---|---|---|
| Correctas | 41,7 % (25/60) | 73,3 % (44/60) |
| Hechos clave encontrados (ítems respondibles) | 75,2 % | 82,9 % |
| Carencias admitidas (ítems `no`) | 94,4 % | 100,0 % |
| Falsos rechazos (ítems `yes`) | 47,6 % | 28,6 % |
| Respuestas con un número inexistente | 0,0 % | 0,0 % |
| Respuestas que citan un pasaje ausente | 0,0 % | 0,0 % |
| Mediana de segundos por respuesta (CPU, 4 hilos) | 13,5 | 12,5 |

Segunda ejecución en GPU con `llama-server` y una versión más reciente de llama.cpp (60 preguntas, temperatura 0, thinking off, Q4_K_M):

| Medida | Qwen3.5-2B Q4_K_M (base) | Field Atlas reader |
|---|---|---|
| Correctas | 35,0 % (21/60) | 68,3 % (41/60) |
| Hechos clave encontrados | 64,8 % | 81,9 % |
| Carencias admitidas (ítems `no`) | 100,0 % | 100,0 % |
| Falsos rechazos (ítems `yes`) | 33,3 % | 38,1 % |
| Respuestas con un número inexistente | 1,7 % | 0,0 % |
| Respuestas que citan un pasaje ausente | 0,0 % | 0,0 % |
| Mediana de palabras por respuesta | 53,0 | 62,0 |

Por categoría en la ejecución en CPU: fact 100, health 100, insufficient 100, synthesis 100, crypto 66,7, compare 62,5, explain 60, travel 50, biology 40 (muestras muy pequeñas; un ítem equivale a 1,7 puntos). En la ejecución en GPU: synthesis 100, insufficient 100, fact 83,3, travel 70, health 66,7, explain 60, compare 50, biology 40, crypto 33,3. El autor advierte que estas cifras corresponden a 60 preguntas públicas y no al conjunto de test sellado.

Velocidad (proxy de móvil, no medido en móvil): `llama-server` en CPU, 4 hilos, 20 ítems del dev, máximo 300 tokens nuevos, incluido el procesamiento de prompt. Base: mediana 9,3 s (p90 14,0 s, 42,5 palabras). Este modelo: mediana 11,3 s (p90 15,7 s, 59 palabras), es decir, 1,21x más lento. En GPU (RTX 3060, todas las capas offloaded): mediana 0,7 s frente a 0,9 s. La mayor parte del tiempo es procesamiento de prompt, idéntico en ambos.

Memoria pico de una ejecución de `llama-cli` con el prompt más largo del dev (unos 3k tokens, contexto 8192, 4 hilos): 2.086 MB el base y 2.132 MB este modelo.

## Requisitos de hardware

- VRAM estimada: el archivo Q4_K_M ocupa 1,31 GB; la memoria pico medida en CPU es de 2.132 MB con contexto 8192 y prompt de ~3k tokens. En GPU con todas las capas offloaded cabe holgadamente en 4 GB de VRAM.
- GPU recomendadas: RTX 3060 (medición documentada, mediana de 0,9 s por respuesta en el dev); cualquier GPU con 4 GB o más debería bastar, aunque no se documentan otras.
- CPU: funciona en CPU con 4 hilos (mediana de 12,5 s por respuesta en el dev completo en la ejecución principal).
- Cabe en GPU de consumo: sí, con 4 GB o más de VRAM; también en CPU sin GPU.
- Opciones de despliegue: llama.cpp (probado en tres builds: el del sdist de llama-cpp-python 0.3.36, llama-cpp-python 0.3.24 y el commit `60081bb`), `llama-cli` y `llama-server`. No se documenta compatibilidad con vLLM, TGI ni Ollama.
- Latencia y throughput: 1,21x más lento que el base en CPU (11,3 s frente a 9,3 s de mediana con 300 tokens máximos); 0,9 s frente a 0,7 s en RTX 3060. El tamaño de archivo y la arquitectura son idénticos al base.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Resultado en dev Field Atlas (60 preguntas) | Licencia | Formato |
|---|---|---|---|---|---|
| Field Atlas reader (este) | ~1,94 B | 8192 (config. de ejecución) | 73,3 % CPU / 68,3 % GPU | Apache-2.0 | GGUF Q4_K_M |
| Qwen/Qwen3.5-2B (base) | ~1,94 B | 8192 (config. de ejecución) | 41,7 % CPU / 35,0 % GPU | Apache-2.0 | GGUF Q4_K_M (bartowski) |
| Otros lectores RAG pequeños | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks de otros modelos comparables en la información proporcionada. La comparación relevante es contra el modelo base, del que se diferencia únicamente por el ajuste LoRA y el comportamiento de citación y abstención.

## Limitaciones y advertencias

- Solo responde en inglés; no se ha entrenado ni evaluado en otros idiomas.
- Entrenado para un prompt y un formato de pasajes muy específicos (los `SYSTEM` e `INSTRUCTIONS` de `reader_bench.py`, pasajes numerados con formato "Title — Overview / Details"); usarlo con otros formatos puede degradar el comportamiento.
- Tasa de falsos rechazos del 28,6 % en CPU y 38,1 % en GPU sobre ítems respondibles: en una fracción relevante de casos en los que la respuesta sí está en los pasajes, el modelo se abstiene.
- Los resultados provienen de un dev set público de 60 preguntas, no del conjunto de test sellado; el autor advierte que un solo ítem equivale a 1,7 puntos y que distintas builds de llama.cpp varían en varios ítems.
- El modelo se seleccionó entre tres versiones usando este mismo dev set, lo que puede introducir un sesgo de selección optimista.
- No es un dispositivo médico: aunque se entrenó con material de primeros auxilios y MedlinePlus, el autor advierte explícitamente de que no se utilice en una emergencia.
- Riesgo de alucinación reducido pero no nulo: en la ejecución en GPU el base produjo un 1,7 % de respuestas con números inexistentes y este modelo un 0,0 %, pero la muestra es pequeña.
- Solo se publica la cuantización Q4_K_M; no hay safetensors, FP16 ni otras cuantizaciones en el repositorio.
- La licencia del modelo es Apache-2.0, pero los datos de entrenamiento son CC BY-SA 4.0, lo que puede condicionar la redistribución de derivados que reproduzcan el corpus.
- El rendimiento en móvil no se ha medido; las cifras de velocidad son un proxy en CPU de escritorio.

## Enlaces

- Hugging Face: https://huggingface.co/lufiaq/fieldatlas-reader-qwen3.5-2b-gguf
- Perfil del autor: https://huggingface.co/lufiaq
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
