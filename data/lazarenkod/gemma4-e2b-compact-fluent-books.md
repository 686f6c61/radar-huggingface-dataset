# lazarenkod/gemma4-e2b-compact-fluent-books

## Resumen

Gemma 4 E2B compact for Fluent Books (V23d) es una adaptación altamente especializada del modelo `google/gemma-4-E2B-it` de Google, publicada por el desarrollador lazarenkod. No se trata de un modelo conversacional de propósito general, sino de un componente de inferencia en dispositivo diseñado específicamente para "Fluent Books", una aplicación de lectura en inglés dirigida a hablantes nativos de ruso. Su función concreta es responder a preguntas cortas y estructuradas sobre palabras dentro de una frase: seleccionar el significado ruso correcto del diccionario, determinar si una expresión se usa con uno de sus significados y ofrecer una explicación breve del tipo "por qué aquí".

El proceso de construcción es notablemente agresivo: parte de un fine-tune LoRA (denominado A2) con vocabulario reducido de 262.144 a 40.000 tokens, al que se le estrechan las capas feed-forward de 12.288 a 6.144 neuronas y se eliminan 6 de las 35 capas, quedando 29. Posteriormente se destila desde A2 y se cuantiza a IQ4_XS con una importance matrix. El resultado es un fichero de 778.390.784 bytes (unos 742 MiB) que ocupa aproximadamente 350 MB en memoria durante la ejecución en la aplicación.

La relevancia del modelo radica en su extrema eficiencia para hardware muy limitado (iPad mini 5, iPhone XS con 3 GB de memoria), donde el modelo A2 de 1,35 GB no cabe. Ofrece un tiempo de respuesta de 3,6 segundos en CPU de iPad mini 5 para una consulta de significado, frente a los 11-22 segundos del modelo completo en frío. Es, por tanto, un ejemplo de optimización extrema orientada a un caso de uso muy concreto y con métricas de calidad medidas por el propio autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Gemma 4), con capas feed-forward estrechadas y 6 capas eliminadas (29 de 35) |
| Parametros totales | 1.448.239.901 (según safetensors del modelo base); el fichero GGUF IQ4_XS ocupa 778.390.784 bytes |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | IQ4_XS (única publicada) |
| Idiomas soportados | en, ru |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (para llama.cpp) |

## Arquitectura y entrenamiento

El modelo parte de `google/gemma-4-E2B-it`, un transformer de la familia Gemma 4. El autor aplica una cadena de optimizaciones en cuatro fases. Primero, un fine-tune LoRA (A2) con el vocabulario recortado de 262.144 a 40.000 tokens. Segundo, se estrechan las capas feed-forward de las 20 capas anchas (las que comparten caché K/V) de 12.288 a 6.144 neuronas; las neuronas conservadas son las de mayor media de |activación| en la entrada de `down_proj` multiplicada por la norma de su columna de `down_proj`, medidas sobre filas de entrenamiento. Además, se eliminan las 6 capas menos importantes de esas 20 (la importancia se define como la divergencia KL respecto al modelo completo al saltarse la capa), quedando 29 de 35 capas. Tercero, el modelo podado se destila desde A2 mediante entropía cruzada sobre las respuestas más KL respecto a los logits de A2, en varias rondas sobre datos de entrenamiento, la última sobre el dataset v7-slim. Cuarto, se cuantiza a IQ4_XS con una importance matrix construida a partir de los prompts de entrenamiento.

Los datos de entrenamiento incluyen frases de novelas de dominio público (Project Gutenberg) traducidas por agentes Claude Sonnet 5.5, más 59.932 frases adicionales traducidas por A2; pares alineados de traducciones humanas de dominio público (ru.wikisource.org, Project Gutenberg); respuestas de significado de diccionario en las que Gemma 4 26B-A4B y 31B coincidían con probabilidad ≥ 0,9; y filas construidas a partir de diccionarios de aprendizaje con licencia propiedad de los autores (frases de ejemplo emparejadas con acepciones y equivalentes rusos de proverbios ingleses). El texto de los diccionarios no se distribuye. No se usan frases de libros de texto ni de los conjuntos de evaluación. No se menciona RLHF ni DPO en la información disponible.

## Capacidades

- Selección del significado ruso correcto de una palabra dentro de una frase, entre significados numerados de diccionario.
- Determinación de si una expresión se usa con uno de sus significados (clasificación binaria con AUC medida de 0,858).
- Generación de explicaciones breves del tipo "por qué aquí" sobre el uso de una palabra o expresión.
- Respuesta a preguntas estructuradas con formato de salida específico (apertura de respuesta como `{"ru":"`).
- Soporte de los idiomas inglés y ruso, con salida en ruso para las respuestas de la aplicación.
- No es un modelo conversacional: no está pensado para chat abierto ni para generación libre de texto.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo de razonamiento extendido.

## Casos de uso

- Lectura asistida en inglés para hablantes de ruso: el modelo se invoca desde la aplicación Fluent Books para resolver, en el contexto de la frase que se está leyendo, cuál de los significados numerados del diccionario corresponde a una palabra concreta. Es adecuado porque está entrenado específicamente sobre ese formato de pregunta y respuesta.
- Desambiguación de expresiones en contexto: la aplicación pregunta si una expresión concreta se usa con uno de sus significados; el modelo responde con una clasificación calibrada (AUC 0,858 sobre 807 usos etiquetados), lo que permite mostrar u ocultar notas explicativas.
- Explicaciones pedagógicas breves: genera una justificación corta ("por qué aquí") que la aplicación muestra al estudiante, aprovechando su entrenamiento sobre respuestas de modelos mayores (Gemma 4 26B-A4B y 31B) con alta confianza.
- Despliegue en dispositivos de gama baja: con unos 350 MB de memoria en la aplicación y 3,6 s de latencia en CPU de iPad mini 5, es adecuado para iPhone XS, iPad mini 5 y dispositivos similares con 3 GB de RAM donde el modelo A2 de 1,35 GB no cabe.
- Aplicaciones de aprendizaje de idiomas con inferencia local y sin conexión: al ejecutarse sobre llama.cpp en el dispositivo, permite funcionalidad de asistencia lingüística sin enviar texto del usuario a servidores externos.
- Filtrado y anotación de vocabulario en pipelines de creación de materiales: el modelo puede usarse para preetiquetar acepciones y usos de expresiones en corpus de frases, siempre con revisión humana dada su precisión limitada en expresiones.

## Benchmarks y rendimiento

Datos medidos por el autor sobre conjuntos propios (4-5 de noviembre de 2026), con el fichero tal como lo ejecuta la aplicación y los prompts de la aplicación:

| Metrica | V23d | A2 (1,35 GB) |
|---|---|---|
| Elección del significado de una palabra, 462 usos reservados | 390 | 386 |
| Palabras de diccionario reservadas (1.942 usos) | 1.543 | 1.540 |
| "¿Se usa la expresión aquí?" (AUC, 807 usos etiquetados) | 0,858 | 0,860 |
| Velocidad en iPad mini 5 (CPU), un significado, en caliente | 3,6 s | 11-22 s (pregunta completa, en frío) |
| Memoria en la aplicación | ≈ 350 MB | no disponible |

En traducción de frases, el autor reporta que el modelo está por debajo de A2 y del traductor de Apple: 105 de 120 trampas (género, "you" a varias personas, nombres que son palabras) frente a 114-115 de A2; expresiones 68-72 de 100 frente a 82-86 de A2. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM/memoria estimada para inferencia: aproximadamente 350 MB en la aplicación según el autor; el fichero GGUF IQ4_XS pesa 778.390.784 bytes (~742 MiB), por lo que se necesita algo más de 1 GB de memoria libre para cargarlo.
- GPU recomendadas: no se especifican; el modelo está optimizado para CPU en dispositivos móviles (iPad mini 5, iPhone XS).
- Cabe en GPU de consumo: sí, por tamaño; cualquier GPU con al menos 1-2 GB de memoria libre puede alojarlo, aunque no se documentan pruebas en GPU.
- Opciones de despliegue: llama.cpp con una build que soporte Gemma 4 (b11208 o superior). No se mencionan vLLM, TGI, Ollama ni otros motores.
- Latencia y throughput: 3,6 s por consulta de significado en CPU de iPad mini 5 en caliente con el prompt compacto de la aplicación; no se reporta throughput en tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Gemma 4 E2B compact V23d (este) | ~1,45 B (podado) | no disponible | Apache-2.0 | GGUF IQ4_XS | Especializado en preguntas de vocabulario EN-RU; ~350 MB en app; 3,6 s en iPad mini 5 |
| A2 (lazarenkod/gemma4-e2b-fluent-books) | no disponible | no disponible | Apache-2.0 (presumible, no confirmado) | no disponible | Fine-tune LoRA del mismo base, 1,35 GB; mejor traducción y expresiones; 11-22 s en frío |
| google/gemma-4-E2B-it | no disponible | no disponible | Apache-2.0 | safetensors (base) | Modelo base de propósito general; sin las optimizaciones ni el ajuste específico |

No se dispone de datos de benchmarks estándar para comparar rendimiento general con alternativas de la misma categoría; la comparación se limita a las métricas propias del autor y a los modelos de su misma familia.

## Limitaciones y advertencias

- Traducción de frases deficiente: por debajo de A2 y del traductor de Apple en los conjuntos del autor (105/120 trampas frente a 114-115; expresiones 68-72/100 frente a 82-86). La aplicación usa primero el traductor de Apple para frases.
- Expresiones idiomáticas y nombres que también son palabras: el estrechamiento de las capas feed-forward degrada estas capacidades; ni el entrenamiento con 170.000 filas adicionales de profesores Gemma mayores ni la destilación on-policy recuperaron el rendimiento.
- Mezcla de idiomas: a veces introduce inglés en medio de una palabra rusa; la aplicación prohíbe tokens de letras latinas simples en las respuestas rusas, pero sin esa restricción debe esperarse el fallo.
- Evaluación limitada: los conjuntos de evaluación son pequeños y propios del autor, y los jueces fueron agentes de modelo de lenguaje, no evaluadores humanos.
- No es un modelo conversacional: no debe usarse para chat abierto, generación libre ni tareas generales de razonamiento.
- Uso comercial: la licencia Apache-2.0 del modelo lo permite, pero los datos de los diccionarios con licencia propiedad de los autores no se distribuyen; el uso de los pesos no otorga derechos sobre esos contenidos.
- Riesgo de alucinación en significados y explicaciones fuera de la distribución de entrenamiento; no se documentan sesgos específicos más allá de la mezcla de idiomas.
- Requiere una build de llama.cpp que soporte Gemma 4 (b11208 o superior) y los prompts específicos de la aplicación; no está pensado para invocación genérica.

## Enlaces

- Hugging Face: https://huggingface.co/lazarenkod/gemma4-e2b-compact-fluent-books
- Modelo A2 (versión completa): https://huggingface.co/lazarenkod/gemma4-e2b-fluent-books
- Modelo base: https://huggingface.co/google/gemma-4-E2B-it
- llama.cpp (motor de inferencia): https://github.com/ggml-org/llama.cpp
- Project Gutenberg (fuente de datos): https://www.gutenberg.org
- ru.wikisource.org (fuente de datos): https://ru.wikisource.org
