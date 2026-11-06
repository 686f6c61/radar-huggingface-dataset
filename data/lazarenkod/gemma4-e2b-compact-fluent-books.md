# lazarenkod/gemma4-e2b-compact-fluent-books

## Resumen

Gemma 4 E2B compact for Fluent Books (V23d) es una adaptación altamente especializada del modelo `google/gemma-4-E2B-it` de Google, publicada por el desarrollador lazarenkod. No es un modelo de propósito general: está diseñado específicamente para "Fluent Books", una aplicación de lectura de inglés para hablantes de ruso, y responde únicamente a preguntas cortas sobre el significado de palabras y expresiones dentro de una frase concreta que el usuario está leyendo. Su objetivo es funcionar en dispositivos con tan solo 3 GB de memoria, como un iPad mini 5 o un iPhone XS, donde el modelo completo de la familia (A2, de 1,35 GB) no cabe.

Técnicamente, parte de un fine-tune con LoRA del modelo base al que se le redujo el vocabulario de 262.144 a 40.000 tokens. Sobre esa base se aplicó una poda agresiva de las capas feed-forward (de 12.288 a 6.144 neuronas) y se eliminaron 6 de 35 capas, seguida de un proceso de destilación desde el modelo A2 en varias rondas. El resultado se cuantizó a IQ4_XS con una importance matrix generada a partir de los prompts de entrenamiento, dando un archivo de 778.390.784 bytes (unos 0,8 GB).

El modelo es relevante como ejemplo de optimización extrema para despliegue on-device: demuestra que es posible mantener una precisión prácticamente idéntica a la de un modelo del doble de tamaño en una tarea muy acotada (390 aciertos frente a 386 en la elección de significado de palabra) a costa de sacrificar capacidades generales como la traducción de frases completas. Su licencia Apache-2.0 y su formato GGUF lo hacen directamente utilizable con llama.cpp.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only basado en Gemma 4 E2B, con poda de capas feed-forward y eliminación de capas |
| Parametros totales | 1.448.239.901 (según safetensors del modelo base); archivo GGUF IQ4_XS de 778.390.784 bytes |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | IQ4_XS (única publicada en este repo) |
| Idiomas soportados | en, ru |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo deriva de `google/gemma-4-E2B-it`, un transformer decoder-only de Google. El proceso de construcción consta de cuatro etapas documentadas por el autor: (1) un fine-tune LoRA del modelo base con el vocabulario reducido de 262.144 a 40.000 tokens, que da lugar al modelo A2; (2) poda de las capas feed-forward de las 20 capas "anchas" (las que comparten su caché K/V), reduciendo de 12.288 a 6.144 neuronas según la magnitud media de activación en la entrada de `down_proj` ponderada por la norma de su columna, y eliminación de las 6 capas menos importantes de esas 20 (quedan 29 de 35 capas), midiendo la importancia como la divergencia KL respecto al modelo completo al saltarse la capa; (3) destilación desde A2 mediante entropía cruzada sobre las respuestas más KL sobre los logits de A2, en varias rondas, la última sobre el dataset v7-slim; y (4) cuantización a IQ4_XS con una importance matrix construida a partir de los prompts de entrenamiento.

Los datos de entrenamiento combinan frases de novelas de dominio público (Project Gutenberg) traducidas por agentes basados en Claude Sonnet 5.5 (59.932 frases adicionales traducidas por A2), pares alineados de traducciones humanas de dominio público (ru.wikisource.org, Project Gutenberg), respuestas de significado de diccionario en las que Gemma 4 26B-A4B y 31B coincidían con probabilidad igual o superior a 0,9, y filas construidas a partir de diccionarios de aprendizaje con licencia propiedad de los autores (oraciones de ejemplo asociadas a acepciones y equivalentes rusos de proverbios ingleses). El texto de esos diccionarios no se distribuye. Ninguna frase de origen proviene de libros de texto ni de los conjuntos de evaluación.

## Capacidades

- Elección del significado ruso correcto de una palabra entre las acepciones numeradas de un diccionario, dado el contexto de la frase que se está leyendo.
- Determinación de si una expresión (locución, proverbio) se usa con uno de sus significados en el contexto dado, con una AUC de 0,858 medida sobre 807 usos etiquetados.
- Generación de una explicación breve ("why here?") sobre por qué una acepción encaja en el contexto.
- Respuesta en formato estructurado abierto con `{"ru":"`, pensado para ser consumido por la aplicación y no para conversación libre.
- Capacidad multilingüe limitada a inglés y ruso, en la dirección inglés a ruso para las respuestas.
- No soporta tool calling, function calling, razonamiento multi-paso ni agentes de forma documentada.
- No dispone de modo thinking, visión ni audio.

## Casos de uso

- Lectura asistida de inglés para hablantes de ruso: la aplicación envía al modelo la frase en curso y las acepciones del diccionario, y el modelo devuelve la acepción correcta; encaja porque está entrenado exactamente con ese formato de prompt y responde en 3,6 s en CPU de iPad mini 5.
- Desambiguación léxica en contextos de aprendizaje: para una palabra polisémica, el modelo selecciona la acepción adecuada entre las numeradas, con 390 aciertos sobre 462 usos reservados, lo que lo hace fiable para esta tarea acotada.
- Detección de uso real de expresiones y proverbios: el modelo evalúa si una locución se emplea con uno de sus significados en la frase leída (AUC 0,858), útil para señalar expresiones idiomáticas al estudiante.
- Explicación breve de por qué una palabra significa lo que significa en contexto: el modelo genera una justificación corta que la app puede mostrar como ayuda pedagógica.
- Despliegue on-device en dispositivos de gama baja: con un archivo de 0,8 GB y un consumo de memoria de aproximadamente 350 MB en la app, cabe en iPad mini 5, iPhone XS y dispositivos similares donde modelos mayores no entran.
- Integración en pipelines de aplicaciones móviles mediante llama.cpp: el modelo se distribuye como GGUF y requiere una build que conozca Gemma 4 (b11208 o superior), lo que permite embeberlo en apps nativas sin servidor.
- Filtrado previo antes de un traductor externo: dado que su traducción de frases es peor que la de Apple, la app lo usa para tareas léxicas y delega la traducción de oraciones al traductor del sistema.

## Benchmarks y rendimiento

Datos aportados por el autor sobre conjuntos propios (4-5 de noviembre de 2026), comparando V23d con el modelo A2 de 1,35 GB:

| Metrica | V23d | A2 (1,35 GB) |
|---|---|---|
| Elección del significado de una palabra, 462 usos reservados | 390 | 386 |
| Palabras de diccionario reservadas (1.942 usos) | 1.543 | 1.540 |
| "¿Se usa la expresión aquí?" (AUC, 807 usos etiquetados) | 0,858 | 0,860 |
| Velocidad en iPad mini 5 (CPU), un significado, en caliente | 3,6 s | 11-22 s (pregunta completa, en frío) |
| Memoria en la app | ≈ 350 MB | no disponible |
| Traducción de frases trampa (120 casos, dos jueces) | 105 | 114-115 |
| Traducción de expresiones (100 casos) | 68-72 | 82-86 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: aproximadamente 350 MB de memoria en la app según el autor; el archivo pesa 778.390.784 bytes en IQ4_XS.
- GPU recomendadas: no aplica, el modelo está pensado para CPU en dispositivos móviles; funciona en cualquier equipo donde corra llama.cpp.
- Cabe en GPU consumer: sí, por tamaño; cualquier GPU con más de 1 GB de memoria libre puede ejecutarlo, aunque no es su objetivo.
- Dispositivos objetivo declarados: iPad mini 5 y iPhone XS (3 GB de memoria), con latencia de 3,6 s por consulta en CPU.
- Opciones de despliegue: llama.cpp (build b11208 o superior, con soporte de Gemma 4). No se documentan vLLM, TGI, Ollama ni otros runners.
- Throughput: no disponible; solo se reporta latencia por consulta en el dispositivo de referencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Gemma 4 E2B compact V23d (este) | 1.448 M (base); GGUF 0,78 GB | no disponible | Apache-2.0 | GGUF | Especializado en preguntas léxicas en/ru on-device |
| A2 (lazarenkod/gemma4-e2b-fluent-books) | 1.448 M (base); 1,35 GB | no disponible | Apache-2.0 | no disponible | Mismo fine-tune sin poda; mejor en traducción de frases (114-115 frente a 105 de 120) |
| google/gemma-4-E2B-it | 1.448 M | no disponible | Apache-2.0 | safetensors | Modelo base de propósito general, sin especialización léxica |
| Traductor de Apple (integración del sistema) | no disponible | no disponible | propietaria | no disponible | Mejor que V23d en traducción de frases según las pruebas del autor |

## Limitaciones y advertencias

- No es un modelo de chat general: está diseñado para responder a los prompts concretos de la app y no debe usarse como asistente conversacional.
- Traducción de frases deficiente: 105 de 120 trampas frente a 114-115 de A2, y por debajo del traductor de Apple; la app delega la traducción de oraciones a este último.
- Peor rendimiento en expresiones idiomáticas y nombres que también son palabras (68-72 de 100 frente a 82-86 de A2); los intentos de recuperar esta capacidad con más datos y destilación on-policy no funcionaron.
- Riesgo de mezclar caracteres latinos dentro de palabras rusas; la app lo evita prohibiendo tokens de letras latinas en las respuestas rusas, por lo que sin esa restricción es esperable que ocurra.
- Los conjuntos de evaluación son propios y pequeños, y los jueces fueron agentes de lenguaje, no evaluadores humanos independientes.
- Sesgos conocidos: no documentados por el autor.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero el texto de los diccionarios con licencia usados en entrenamiento no se distribuye y su uso puede estar sujeto a condiciones adicionales no detalladas.
- Requiere una build de llama.cpp que soporte Gemma 4 (b11208 o superior); versiones anteriores no cargarán el modelo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/lazarenkod/gemma4-e2b-compact-fluent-books
- Modelo A2 (versión completa): https://huggingface.co/lazarenkod/gemma4-e2b-fluent-books
- Modelo base: https://huggingface.co/google/gemma-4-E2B-it
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Project Gutenberg: https://www.gutenberg.org
- Wikisource en ruso: https://ru.wikisource.org
