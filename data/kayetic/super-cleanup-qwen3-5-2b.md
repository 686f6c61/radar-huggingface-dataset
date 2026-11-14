# Kayetic/super-cleanup-qwen3.5-2b

## Resumen

Super Cleanup es un ajuste fino de Qwen/Qwen3.5-2B desarrollado por Kayetic para Super, una aplicación de productividad para macOS. Su función no es conversacional en el sentido habitual: recibe la transcripción cruda de un reconocedor de voz y devuelve el texto que el hablante pretendía escribir, eliminando muletillas, tartamudeos y falsos arranques, aplicando autocorrecciones habladas ("tres, no, cuatro segundos"), arreglando puntuación, mayúsculas y formato numérico, y corrigiendo la grafía de nombres y términos técnicos a partir del contexto. Nunca responde ni obedece al contenido de la transcripción.

El modelo parte de la arquitectura de Qwen3.5-2B y se distribuye convertido a MLX con pesos de 4 bits (group size 64). El vocabulario se ha recortado de 248.000 a 55.000 tokens (los tokens en inglés y de código que usa el dictado), lo que reduce el tamaño del artefacto a unos 800 MB. El repositorio ocupa 2,5 GB e incluye 1.490.181.952 parámetros según los safetensors publicados.

Es relevante para desarrolladores que construyen herramientas de dictado o de limpieza de transcripciones en local: demuestra que un modelo de menos de 2.000 millones de parámetros, con un vocabulario recortado y decodificación especulativa, puede ejecutar limpieza de texto en unos 150 ms de mediana en un Apple M5 Pro, sin salir del dispositivo y con licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (base Qwen3.5-2B), ajuste fino supervisado y DPO |
| Parametros totales | 1.490.181.952 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el prompt limita la pantalla OCR a 2.500 caracteres y el campo a 600 caracteres) |
| Tipos de cuantizacion | 4 bits, group size 64 (formato MLX) |
| Idiomas soportados | inglés únicamente (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX), librería mlx-swift-lm y mlx_lm |

## Arquitectura y entrenamiento

El modelo es un ajuste fino completo de Qwen3.5-2B, un transformer denso de 1.490 millones de parámetros. La versión 9 publicada es un "model soup": una media uniforme de pesos de tres ajustes finos completos, donde la versión 7 cuenta el doble. La versión 7 se entrenó con supervisión sobre unas 7.500 dictados reales y sintéticos etiquetados, seguida de entrenamiento de preferencias (DPO) contra sus propios errores de significado y nombres señuelo copiados. La variante v9a añade otro ajuste supervisado sobre unas 7.500 muestras, donde cada una de las aproximadamente 1.400 grabaciones reales recibió una referencia literal consensuada entre cinco reconocedores de voz; dos modelos mayores generaron objetivos limpios y un tercero resolvió las discrepancias de contenido. La variante v10a (época 1) incorpora además unas 1.700 muestras de 938 dictados de Wispr Flow y unas 5.300 muestras de 2.445 clips de habla espontánea de reuniones del AMI Meeting Corpus, transcritos por reconocedores on-device y limpiados a partir de las transcripciones manuales del corpus. Cada objetivo se verificó automáticamente en busca de palabras, números, negaciones y preguntas no respaldadas por la transcripción; los pares marcados se revisaron y se corrigieron o descartaron.

La innovación técnica destacable no está en la arquitectura, sino en el pipeline: recorte de vocabulario de 248.000 a 55.000 tokens, cuantización a 4 bits con group size 64, decodificación voraz con `enable_thinking: false`, decodificación especulativa por búsqueda en el prompt (prompt-lookup) y prefill del contexto mientras el usuario habla. El prompt de sistema es fijo y el mensaje de usuario se estructura en secciones (App, Window, Dictionary, Screen, Recent, Field, Transcript), con las vacías marcadas como `(none)`.

## Capacidades

- Limpieza de transcripciones de dictado: eliminación de muletillas, falsos arranques y palabras repetidas.
- Aplicación de autocorrecciones habladas del tipo "tres, no, cuatro segundos".
- Corrección de puntuación, mayúsculas y formato de números.
- Corrección ortográfica de nombres y términos técnicos usando el contexto (aplicación activa, ventana, diccionario, OCR de pantalla, dictados recientes y texto ya presente en el campo).
- Continuación de frases cuando el campo termina a mitad de oración.
- Instrucción explícita de no responder ni obedecer al contenido de la transcripción (defensa frente a inyección de prompt por voz).
- No soporta tool calling, function calling, agentes, visión, audio ni modo de razonamiento; es una tarea única de transformación de texto.
- Capacidad multilingüe: únicamente inglés.

## Casos de uso

- Dictado en aplicaciones de escritorio macOS: el modelo se integra en Super para convertir la salida del reconocedor de voz en texto listo para insertar, con una mediana de 150 ms y p90 de 330 ms en un M5 Pro, lo que permite limpiar mientras el usuario sigue hablando.
- Asistentes de programación con entrada por voz: el prompt incluye la aplicación y la ventana activas (por ejemplo, Codex y "Fix tab favicons") y un diccionario de términos como Groq, Vite o qBittorrent, de modo que el modelo escribe correctamente nombres de herramientas y APIs dictados.
- Actas y notas de reuniones: la versión 9 incorpora habla espontánea del AMI Meeting Corpus, por lo que puede limpiar transcripciones de reuniones con falsos arranques y correcciones antes de pasarlas a un resumen o a un sistema de gestión de tareas.
- Corrección de transcripciones de terceros: al aceptar la transcripción de cualquier reconocedor y un objetivo derivado de la misma, sirve para postprocesar salidas de Whisper, reconocedores on-device u otros motores antes de almacenarlas.
- Entrada de texto en entornos con requisitos de privacidad: al ejecutarse en local con MLX y pesos de 4 bits de unos 800 MB, el dictado no sale del dispositivo, lo que encaja en entornos sanitarios, jurídicos o corporativos con restricciones de datos.
- Relleno de formularios y campos de texto: la sección "Field" con hasta 600 caracteres previos al cursor permite continuar una frase a medias con la puntuación y el estilo adecuados, útil en CRM, tickets de soporte o editores de correo.
- Prototipado e investigación sobre limpieza de texto: al ser un ajuste fino Apache 2.0 con receta de datos documentada, sirve como punto de partida para adaptar la tarea a otros idiomas o dominios.

## Benchmarks y rendimiento

La model card publica una evaluación propia sobre 1.510 ítems, juzgada por un modelo mayor contra la limpieza ideal de la misma transcripción y contexto. La métrica cuenta ítems con al menos un error de significado (cláusula omitida o añadida, nombre o número cambiado, pregunta o negación invertida, o error de audición que el contexto podía corregir).

| Conjunto de evaluacion | Errores v9 (graves) | Errores v7 (graves) | Solo v9 / solo v7 |
|---|---|---|---|
| 1.510 ítems totales | 218 (128) | 250 (139) | 35 / 67 |
| 1.210 dictados reales y sintéticos | 141 (94) | 160 (102) | 22 / 41 |
| 180 grabaciones en vivo | 13 (10) | 19 (12) | 1 / 7 |
| 300 clips de 16 reuniones AMI no usadas en entrenamiento | 77 (34) | 90 (37) | 26 / 52 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: unos 800 MB para los pesos en 4 bits, más el coste del contexto (hasta 2.500 caracteres de OCR, 600 de campo y dictados recientes). En la práctica, menos de 2 GB de memoria unificada o de VRAM.
- GPU recomendadas: el formato es MLX, orientado a Apple Silicon (el dato de latencia publicado es de un Apple M5 Pro). En GPU NVIDIA no hay soporte nativo de MLX; sería necesario convertir los pesos a otro formato.
- Cabe en GPU de consumo: sí, en cualquier Apple Silicon con al menos 8 GB de memoria unificada; también en GPUs de consumo con 4-6 GB si se convierte a GGUF.
- Opciones de despliegue: mlx-swift-lm (destino principal), mlx_lm en Python, y conversión a llama.cpp/Ollama si se reexportan los pesos.
- Latencia y throughput: mediana de unos 150 ms y p90 de unos 330 ms por limpieza en un Apple M5 Pro, con decodificación especulativa por búsqueda en el prompt y prefill del contexto durante el habla. No se publican cifras de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Super Cleanup (este) | 1.490 M | no disponible | Limpieza de dictado en inglés, MLX 4 bits | Apache 2.0 | Hugging Face |
| Qwen/Qwen3.5-2B (base) | 2 B (nominal) | no disponible | Modelo generalista conversacional | no disponible en la información | Hugging Face |
| Modelos de limpieza de texto genéricos | no disponible | no disponible | Reglas o modelos pequeños | variable | no disponible |

La comparación con alternativas de la misma categoría (limpieza de dictado especializada) no está disponible en la información proporcionada. Frente a su modelo base, la diferencia medible es el recorte de vocabulario (55.000 frente a 248.000 tokens), la cuantización a 4 bits y el ajuste específico a la tarea, con una tasa de error de significado de 218 sobre 1.510 ítems.

## Limitaciones y advertencias

- Solo inglés; no hay soporte multilingüe.
- Está ajustado al estilo de dictado de un único desarrollador (agentes de código, chats, notas), aunque la versión 9 mejora en habla conversacional y de reuniones.
- Parte de los datos de entrenamiento son dictados personales del autor, por lo que puede haber memorizado nombres, proyectos y frases de esa persona; riesgo de fuga de información en las salidas.
- Como cualquier modelo pequeño, puede omitir cláusulas o escribir mal nombres poco frecuentes. La aplicación Super recurre a la transcripción cruda cuando la salida se repite, se alarga o añade un número que el hablante no dijo.
- El prompt incluye OCR de pantalla y dictados recientes: son datos sensibles que conviene revisar antes de desplegarlo en producción.
- El formato MLX limita el despliegue a Apple Silicon salvo conversión previa; no hay pesos GGUF ni safetensors estándar publicados en la información disponible.
- La licencia Apache 2.0 permite uso comercial, pero los datos derivados del AMI Meeting Corpus están bajo CC BY 4.0 y requieren atribución (J. Carletta et al., "The AMI Meeting Corpus: A Pre-Announcement", MLMI, 2005).
- La evaluación es interna, con un modelo mayor como juez y sin benchmarks estándar, por lo que no es directamente comparable con otras publicaciones.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Kayetic/super-cleanup-qwen3.5-2b
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- Librería mlx-swift-lm: https://github.com/ml-explore/mlx-swift-lm
- AMI Meeting Corpus: https://groups.inf.ed.ac.uk/ami/corpus/
- Licencia CC BY 4.0: https://creativecommons.org/licenses/by/4.0/
- Dataset de referencia: https://huggingface.co/datasets/edinburghcstr/ami
