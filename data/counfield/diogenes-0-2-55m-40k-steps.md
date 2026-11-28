# Counfield/Diogenes-0.2-55M-40K-STEPS

## Resumen

Diogenes-0.2-55M-40K-STEPS es un checkpoint intermedio de investigación del modelo Diogenes-0.2-55M, desarrollado por Counfield. Se trata de un transformer recurrente con bucles (RLT, recurrent looped transformer) de 55.078.145 parámetros, entrenado a nivel de byte (vocabulario de 256 bytes, sin tokenizador) y con un mecanismo distintivo de memoria direccionada por contenido que permite al modelo acceder a información situada más allá de su ventana de atención de 512 bytes.

Este checkpoint corresponde a la actualización 40.000 de un entrenamiento planificado de 380.000 actualizaciones, es decir, aproximadamente el 10,5 % del total. No está ajustado por instrucciones: no conversa, solo continúa texto. Se publica para que la trayectoria de entrenamiento pueda seguirse; el modelo final se publicará por separado.

Su relevancia es fundamentalmente investigadora: demuestra que un mecanismo de memoria externa determinista, indexada por contenido y entrenada conjuntamente con el modelo base, recupera información a miles de bytes de distancia donde el modelo sin memoria obtiene un 0 % de acierto exacto. El código de investigación necesario para ejecutarlo (índice de memoria, lector y bucle de generación) todavía no es público.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer recurrente con bucles (RLT), núcleo con retroalimentación de tokens desactivada (rama "a0"), anchura 1.536, 8 cabezas |
| Parametros totales | 55.078.145 (modelo base) + 858.436 (lector de memoria) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | Ventana de atención de 512 bytes; memoria hasta 131.072 bytes en las pruebas del autor (unas 64 ventanas) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Inglés principalmente |
| Licencia | MIT |
| Formato de pesos | safetensors (`model.safetensors`, `memory_reader.safetensors`) |

## Arquitectura y entrenamiento

El modelo es un transformer recurrente con bucles (RLT) de 55 millones de parámetros, con anchura 1.536 y 8 cabezas de atención, en el que la retroalimentación de tokens está desactivada (la denominada rama "a0"). Opera a nivel de byte: la entrada y la salida son bytes UTF-8, sin tokenizador, con un vocabulario de exactamente 256 símbolos. La atención cubre una ventana de 512 bytes, de modo que una posición ve como máximo unos 1.000 bytes de texto precedente a través de la atención.

El componente diferencial es una memoria direccionada por contenido sobre todo el historial. La dirección no se aprende: cada byte se indexa bajo los bytes que lo preceden, de forma que una clave funciona independientemente de su contenido (direccionamiento por contenido, no por posición). La memoria ofrece candidatos al siguiente byte a través de 16 canales de lectura: 1 canal de contexto (continuación de la coincidencia anterior más larga), 4 canales de salto que pasan mensajes entre sí (un canal usa lo recuperado por otro como su propia dirección, encadenando hechos enunciados lejos unos de otros), 10 canales de pasaje anclados en el contenido más raro del texto reciente (de modo que una pregunta formulada de forma distinta al enunciado sigue encontrándolo) y 1 canal de "no lo sé". Un pequeño lector de memoria aprendido de 858.436 parámetros decide cuánto confiar en cada canal y en el modelo de lenguaje en cada byte.

El entrenamiento es conjunto desde cero: dos de cada tres actualizaciones son modelado de lenguaje de siguiente byte estándar y una es una "fila de memoria" (texto real largo con enunciados separados y preguntas sobre ellos, con respuesta igual al valor enunciado o "unknown" si nunca se enunció). Los datos de entrenamiento (1,5 GB de bytes tras filtrado de calidad) se reparten en 40 % lenguaje natural general, 20 % conversación, 20 % código, 15 % razonamiento y matemáticas y 5 % texto de seguridad; se excluyeron documentos con puntuación de calidad inferior a 0,70 y duplicados exactos y casi exactos. La configuración: AdamW, tasa de aprendizaje máxima 6e-4 (base) y 1e-3 (lector), 500 actualizaciones de calentamiento, decaimiento coseno, precisión mixta, semilla 401 y una única GPU NVIDIA L4. Las actualizaciones de lenguaje usan 32 filas de 512 bytes; las de memoria, 4 filas de 8.192 bytes.

## Capacidades

- Continuación de texto a nivel de byte en inglés, sin tokenizador.
- Recuperación de información a larga distancia mediante memoria direccionada por contenido: hechos situados miles de bytes atrás llegan al modelo a través de los 16 canales de lectura.
- Encadenamiento de hechos: los 4 canales de salto permiten enlazar información enunciada en puntos distantes del texto.
- Detección de información ausente: el canal "no lo sé" y el sesgo aprendido de las filas de memoria permiten responder "unknown" cuando el dato no está en el texto.
- Coincidencia semántica aproximada: los canales de pasaje se anclan en el contenido poco frecuente, de modo que una pregunta reformulada puede localizar el enunciado original.
- No soporta tool calling ni function calling.
- No soporta comportamiento de agente ni razonamiento multi-paso general.
- No está ajustado por instrucciones: no mantiene conversaciones.

## Casos de uso

- Investigación sobre memoria en modelos de lenguaje: el checkpoint permite reproducir y analizar el efecto de la memoria direccionada por contenido comparando bits por byte con memoria activada y desactivada (1,35 frente a 1,56 en texto web).
- Estudio de la trayectoria de entrenamiento: al ser un checkpoint intermedio con métricas publicadas en varios puntos (11K, 26K y 40K actualizaciones), sirve para analizar la evolución de la gramática y de la recuperación de información durante el preentrenamiento.
- Experimentos de arquitecturas recurrentes con bucles: útil para comparar el comportamiento de un RLT de 55M con transformers estándar del mismo tamaño en tareas controladas.
- Evaluación de mecanismos de direccionamiento por contenido: permite probar variantes del índice de memoria (canales, saltos, anclajes) sobre un modelo ya entrenado conjuntamente con el lector.
- Pruebas de recuperación de hechos a distancia fija: los tests sintéticos del autor (hecho a 4.000 bytes, cadenas de 2, 4 y 5 enunciados) ofrecen una base reproducible para medir la contribución de cada canal.
- Docencia y divulgación: un modelo de 55M parámetros y 0,2 GB de repositorio es manejable para explicar memoria externa, entrenamiento conjunto y evaluación honesta de checkpoints tempranos en un entorno de laboratorio.

## Benchmarks y rendimiento

| Medicion | Valor |
|---|---|
| Bits por byte de validación, mezcla de entrenamiento (memoria desactivada) | 1,60 |
| Texto web, bits por byte, memoria activada / desactivada (filas de 8.192 bytes) | 1,35 / 1,56 |
| Pares mínimos gramaticales del inglés (67 paradigmas × 1.000 pares; azar 50 %) | 57,5 % |
| 128 preguntas naturales sobre 64 documentos reales no vistos, documento 8.000 bytes antes de la pregunta; respuesta generada exactamente correcta, memoria activada / desactivada | 7,4 % / 0,0 % |
| Igual, documento inmediatamente antes de la pregunta, memoria activada / desactivada | 8,6 % / 0,0 % |
| Tests sintéticos de memoria: hecho a 4.000 bytes; cadenas de 2, 4 y 5 enunciados; "unknown" para claves nunca enunciadas; preguntas reformuladas (32 elementos cada uno) | 91-100 % (cadenas de 3 enunciados: 78 %) |

Para comparar, checkpoints anteriores de la misma ejecución: pares mínimos gramaticales 52,3 % (11K actualizaciones) y 54,2 % (26K); preguntas sobre documentos reales 10,7 % a 8.000 bytes (11K). El autor advierte que los tests sintéticos de memoria están cerca de la distribución de entrenamiento de las filas de memoria y demuestran que el mecanismo funciona, no que el modelo entienda el lenguaje; la medida honesta son las preguntas sobre documentos reales, que en esta etapa son bajas.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja por el tamaño del modelo (55M de parámetros, repositorio de 0,2 GB); la memoria direccionada por contenido se construye en tiempo de inferencia a partir del texto de entrada y su coste depende de la longitud del historial (hasta 131.072 bytes en las pruebas del autor).
- GPU recomendadas: el autor entrenó con una única NVIDIA L4; para inferencia basta cualquier GPU consumer moderna.
- Cabe en GPU consumer: sí, con amplio margen, incluidas tarjetas de gama baja.
- Opciones de despliegue: no disponibles de forma estándar; el modelo requiere el código de investigación RLT (índice de memoria, lector y bucle de generación), que aún no es público. No se indica compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Diogenes-0.2-55M-40K-STEPS | 55,08 M (+0,86 M lector) | Atención 512 bytes; memoria hasta 131.072 bytes | RLT a nivel de byte con memoria direccionada por contenido | MIT | Pesos públicos; código de inferencia no público |
| Diogenes-0.2-55M (checkpoint base) | 55,08 M | Igual que el anterior | Mismo modelo, checkpoint anterior de la misma ejecución | MIT | Pesos públicos |
| Alternativas de 55M parámetros comparables | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos de benchmarks de modelos alternativos en la información proporcionada, por lo que no se establece comparación cuantitativa de rendimiento.

## Limitaciones y advertencias

- Checkpoint temprano: gramática débil y casi ningún conocimiento del mundo; es el 10,5 % de la ejecución planificada.
- No está ajustado por instrucciones; en generación libre cae a menudo en bucles de repetición y no se detiene.
- Tiende a responder "unknown" tras una pregunta que no puede contestar con el texto que tiene delante (comportamiento aprendido de las filas de memoria) y está sesgado hacia respuestas numéricas.
- Mayoritariamente en inglés; el soporte de otros idiomas no está garantizado.
- La recuperación sobre documentos reales es baja en esta etapa (7,4-8,6 % de respuestas exactas), aunque superior al 0 % sin memoria.
- El modelo no es ejecutable sin el código de investigación RLT, que no es público; los pesos por sí solos no permiten la inferencia completa.
- Licencia MIT: permite uso comercial, pero el estado de investigación y la falta de ajuste por instrucciones desaconsejan cualquier uso en producción.
- Riesgo de alucinación y de repetición en generación libre; no debe usarse como fuente de hechos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Counfield/Diogenes-0.2-55M-40K-STEPS
- Modelo base: https://huggingface.co/Counfield/Diogenes-0.2-55M
- Código de investigación RLT: no público en el momento de redactar esta ficha (el autor indica que se publicará junto con el modelo final)
- Paper, blog o demo: no disponibles en la información proporcionada
