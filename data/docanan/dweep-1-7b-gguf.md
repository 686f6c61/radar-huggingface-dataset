# docanan/dweep-1.7b-gguf

## Resumen

Dweep 1.7B es un ajuste fino mediante LoRA del modelo Qwen3-1.7B, desarrollado por el usuario docanan y orientado a preguntas y respuestas sobre las islas Andamán y Nicobar. El modelo parte de los pesos de Qwen3-1.7B (licencia Apache-2.0) y hereda su capacidad general, pero se especializa en un dominio geográfico muy concreto: geografía, distritos, transporte, historia, ecología, administración y turismo del archipiélago. La distribución publicada bajo el identificador `docanan/dweep-1.7b-gguf` es una conversión a formato GGUF para su uso con llama.cpp.

El modelo tiene 1.720.574.976 parámetros (aproximadamente 1,7 mil millones) y un tamaño de repositorio de 2,9 GB. Se entrenó con 3163 pares de instrucción validados más 239 pares de rechazo (3275 filas en total), durante 1600 iteraciones y 598,7 k tokens vistos, en un MacBook Air M5 con 16 GB de memoria unificada. La pérdida de validación descendió de 4,191 en la iteración 1 a 1,105 en la 1600.

Su relevancia radica en ser, según el censo del propio autor contra la API de Hugging Face, el primer modelo de lenguaje abierto orientado a las islas Andamán y Nicobar dentro del ámbito de búsqueda consultado. Es un caso representativo de ajuste de dominio de bajo coste sobre un modelo base pequeño, con evaluación honesta que incluye regresiones y resultados negativos (el índice de embeddings no superó a BM25).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen3-1.7B) |
| Parametros totales | 1.720.574.976 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (entrenamiento con secuencias de 2048 tokens) |
| Tipos de cuantizacion | No disponible en la informacion proporcionada (formato GGUF; el base se cuantizo a 4 bits MLX durante el entrenamiento) |
| Idiomas soportados | en, hi, ta, bn, te, ml |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (libreria llama.cpp); adaptadores LoRA en safetensors en el repositorio de entrenamiento |

## Arquitectura y entrenamiento

El modelo es un ajuste fino LoRA sobre Qwen3-1.7B, un transformer decoder-only de 1,7 mil millones de parámetros. El entrenamiento empleó cuantización 4-bit MLX del modelo base, LoRA de rango 8 con escala 20 (alpha PEFT 160), aplicado a las últimas 16 capas y 7 módulos de proyección. Se usaron 3163 pares de instrucción validados más 239 pares de rechazo, con longitud de secuencia 2048 y batch de 4, durante 1600 iteraciones y 598,7 k tokens vistos. El throughput mediano reportado fue de 488,5 tokens/s (rango 416-661) en un MacBook Air M5 con 16 GB de memoria unificada.

Se generaron cuatro checkpoints de adaptadores (`0000400`, `0000800`, `0001200`, `0001600_adapters.safetensors`). El autor distingue dos variantes de adaptador: uno sin pares de rechazo (mejor puntuación bruta, sin capacidad de rechazo) y otro entrenado con pares de rechazo (7,3 % de las filas), que rechaza 25 de 32 preguntas sin respuesta a costa de 6 falsos rechazos sobre 112 preguntas respondibles. La evaluación documenta también un experimento de recuperación (BM25 frente a embeddings multilingües) y un cambio de unidad de indexación de párrafos a ventanas de frases, que elevó el recall@3 del 62 % al 75,9 % y el F1 con contexto recuperado de 0,646 a 0,716.

## Capacidades

- Generación de texto conversacional y respuesta a preguntas sobre el dominio de Andamán y Nicobar (geografía, distritos, transporte, historia, ecología, administración, turismo).
- Herencia de las capacidades generales de Qwen3-1.7B, incluyendo razonamiento básico y generación de texto en inglés e idiomas índicos.
- Soporte multilingüe declarado para inglés, hindi, tamil, bengalí, telugu y malayo.
- Comportamiento de rechazo condicionado mediante un adaptador específico entrenado con pares de rechazo ("I do not know" cuando falta la respuesta en el contexto).
- Integración con recuperación aumentada (RAG): el modelo rinde mejor con pasajes recuperados por BM25 (F1 0,716 con ventanas de frases y 3 pasajes) que sin contexto (F1 0,479).
- Compatibilidad con llama.cpp y endpoints compatibles, lo que facilita su despliegue en entornos de inferencia locales.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, visión ni audio en la información proporcionada.

## Casos de uso

- Asistente turístico local: responder preguntas de visitantes sobre islas, distritos, transporte y atracciones del archipiélago, apoyado con recuperación BM25 sobre el corpus de 1144 artículos para mejorar la precisión (F1 0,716 con contexto).
- Consulta administrativa y cívica: resolver dudas sobre estructura administrativa, distritos y servicios de las islas, con el adaptador de rechazo activado para evitar respuestas inventadas cuando la información no está en el corpus.
- Educación y divulgación: explicar historia, ecología y geografía del archipiélago a estudiantes o público general, usando el modelo como base de un chatbot con base documental controlada.
- Punto de partida para ajustes de dominio: servir como plantilla reproducible de LoRA de bajo coste (entrenado en un portátil con 16 GB) para otros dominios geográficos o de nicho con corpus limitados.
- Despliegue en hardware modesto: al ser un GGUF de 1,7 B, puede ejecutarse en portátiles y equipos sin GPU dedicada mediante llama.cpp, útil para demos y prototipos offline.
- Investigación sobre modelos de bajo recurso: estudiar el comportamiento de un modelo pequeño ajustado con pocos datos (3275 filas) y evaluar estrategias de rechazo y recuperación en dominios con corpus escasos.
- Evaluación de pipelines RAG: usar los resultados publicados (BM25 frente a embeddings, ventanas de frases frente a párrafos) como referencia para diseñar sistemas de recuperación en dominios de nicho.

## Benchmarks y rendimiento

Datos de evaluación proporcionados por el autor sobre un conjunto retenido de 112 preguntas del dominio y un conjunto de sanidad general de 10 ítems, con decodificación greedy y presupuesto de 120 tokens:

| Conjunto | Base F1 | Ajustado F1 | Delta |
|---|---|---|---|
| QA de dominio A&N (112) | 0,280 | 0,479 | +0,199 |
| Sanidad general (10) | 0,106 | 0,308 | +0,203 |

Recuperación con el modelo ajustado (mismas 112 preguntas, índice BM25 sobre 1144 artículos):

| Configuración | F1 de dominio (112) | Rechazos |
|---|---|---|
| Ajustado, sin contexto | 0,479 | 0 |
| Ajustado, 3 pasajes recuperados | 0,646 | 0 |
| Ajustado, recuperación v2 (filtro de idioma, boost de título y entidad) | 0,636 | 0 |
| Ajustado, ventanas de frases, 3 pasajes | 0,716 | 0 |
| Ajustado, ventanas de frases, 5 pasajes | 0,677 | 0 |
| Ajustado, ventanas de frases, 3 pasajes, adaptador de rechazo | 0,648 | 9 falsos rechazos |

Comparativa de recuperadores (recall@3 y F1 con contexto):

| Recuperador | Recall@3 (112) | F1 con contexto (112) |
|---|---|---|
| BM25 | 62 % | 0,646 |
| Embeddings multilingual-e5-small | 63,4 % | 0,616 |

Comportamiento de rechazo:

| Configuración | F1 de dominio (112) | Falsos rechazos (respondibles) | Rechazos (32 sin respuesta) |
|---|---|---|---|
| Adaptador sin pares de rechazo | 0,479 | 0/112 | 0/32 |
| Adaptador con pares de rechazo | 0,477 | 6/112 | 25/32 |
| Adaptador con pares de rechazo y recuperación | 0,558 | 6/112 | No medido |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; para un modelo de 1,7 B en GGUF, las cuantizaciones típicas de 4 bits ocupan del orden de 1-2 GB, aunque el dato exacto de las cuantizaciones publicadas no se especifica.
- GPU recomendadas: no se documentan requisitos de GPU; el entrenamiento se realizó en un MacBook Air M5 con 16 GB de memoria unificada, lo que sugiere que la inferencia es viable en hardware de consumo.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU con al menos 2-4 GB de VRAM según cuantización, aunque no se aporta confirmación oficial en la información disponible.
- Opciones de despliegue: llama.cpp (formato GGUF, librería declarada), endpoints compatibles; otras opciones como vLLM, Ollama o TGI no se mencionan en la información proporcionada.
- Latencia y throughput: durante el entrenamiento se reportó un throughput mediano de 488,5 tokens/s (rango 416-661) en MacBook Air M5; no se proporcionan cifras de latencia de inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Especialización | Disponibilidad |
|---|---|---|---|---|---|
| Dweep 1.7B | 1,72 B | No disponible (entrenado a 2048) | Apache-2.0 | Dominio Andamán y Nicobar, 6 idiomas | GGUF en HF, 0 descargas |
| Qwen3-1.7B (base) | 1,72 B | No disponible en la información | Apache-2.0 | Generalista | Amplia disponibilidad |
| Alternativas de nicho geográfico | No disponible | No disponible | No disponible | No disponible | No disponible |

La comparación directa con modelos de la misma categoría (ajustes de dominio sobre modelos pequeños) no está disponible en la información proporcionada, más allá del propio modelo base Qwen3-1.7B, sobre el que se documenta una mejora de +0,199 en F1 de dominio (0,280 a 0,479).

## Limitaciones y advertencias

- No es un sustituto de asistente general: el autor lo describe explícitamente como un modelo de dominio adaptado, no como reemplazo de un asistente generalista.
- Sesgos y cobertura: el corpus cubre las islas Andamán y Nicobar; 27 de las 112 preguntas de evaluación quedan fuera del alcance del corpus actual (techo de cobertura documentado).
- Riesgo de alucinación: sin recuperación, el F1 de dominio es 0,479; el rechazo solo funciona de forma fiable con el adaptador entrenado para ello y aun así produce 6 falsos rechazos sobre 112 preguntas respondibles.
- Limitación de idioma: aunque declara seis idiomas, el corpus y la evaluación se centran en el dominio de las islas; el rendimiento fuera de ese ámbito no está medido.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero se heredan las condiciones del modelo base Qwen3-1.7B; conviene revisar ambas licencias.
- Caveat de producción: el autor reporta una regresión en el conjunto de sanidad general (de 0,106 a 0,308, mejora, no regresión en este caso) y documenta que el filtro de idioma y los boosts de recuperación v2 empeoraron ligeramente el resultado (0,636 frente a 0,646), por lo que la configuración recomendada es la más simple.
- Madurez: el modelo tiene 0 descargas y 0 likes en el momento de la ficha, y fue creado y actualizado el 17 de noviembre de 2026; no hay evidencia de uso en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/docanan/dweep-1.7b-gguf
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
- Dataset de entrenamiento: https://huggingface.co/datasets/docanan/andaman-nicobar-corpus
- Perfil del autor: https://huggingface.co/docanan
- Cuenta relacionada citada en la model card: https://huggingface.co/andamanopal
