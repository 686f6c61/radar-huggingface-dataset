# bhullar17noor/openflow-cleanup-qwen2.5-1.5b

## Resumen

OpenFlow Cleanup (Qwen2.5 1.5B) es un ajuste fino del modelo Qwen2.5-1.5B-Instruct de Alibaba Cloud, desarrollado por el usuario bhullar17noor, especializado en una única tarea: limpiar texto dictado en inglés. Elimina muletillas y arranques en falso, aplica correcciones habladas ("no, mejor...") y arregla la puntuación, manteniendo las palabras originales del hablante. Es el modelo de limpieza por defecto de OpenFlow, una aplicación de dictado para macOS que se ejecuta en el dispositivo.

El modelo no es un asistente general: espera el prompt exacto de OpenFlow y ofrece peores resultados con instrucciones distintas. Se distribuye exclusivamente en formato GGUF con cuantización Q4_K_M (986 MB) y está pensado para ejecutarse localmente con llama-server, consumiendo aproximadamente 1,4 GB de memoria.

Su relevancia radica en su enfoque de especialización extrema: con solo 1.500 millones de parámetros y un ajuste LoRA de 1.800 iteraciones, supera ligeramente al modelo base publicado en las pruebas de limpieza de dictado del autor, con latencias medias de 241-358 ms por dictado largo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2, basado en Qwen2.5-1.5B-Instruct) |
| Parametros totales | 1.543.714.304 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (unico archivo publicado) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-1.5B-Instruct (revision `989aa7980e4cf806f80c7fef2b1adb7bc71aa306`), un transformer decoder-only de 1.500 millones de parámetros. Sobre él se aplicó un ajuste fino LoRA con MLX: 1.800 iteraciones, rango 16, 12 capas y tasa de aprendizaje 2e-5. El adaptador se fusionó con los pesos base y se convirtió a GGUF con llama.cpp; se eliminó `generation_config.json` antes de la conversión, por lo que el archivo no incorpora ajustes de muestreo.

El conjunto de entrenamiento consta de aproximadamente 6.300 ejemplos, sin grabaciones de personas reales. Las dictaciones se generaron a partir de texto limpio al que un script añadió disfluencias, de modo que la respuesta correcta era conocida; las voces del sistema de macOS leyeron cada una en voz alta y el motor de reconocimiento Parakeet las transcribió, de forma que el objetivo conserva lo que Parakeet oyó y el modelo no aprende a adivinar palabras. El texto fuente proviene de pasajes escritos para el proyecto y de prompts de usuario del dataset OpenAssistant OASST1 (Apache 2.0). Los ejemplos de instrucciones incluyen casos con respuestas calculadas y casos respondidos por un modelo mayor (Qwen3 4B) y posteriormente filtrados. Se eliminó cualquier ejemplo que compartiera cinco palabras consecutivas con una dictación de test.

## Capacidades

- Limpieza de texto dictado en inglés: eliminación de muletillas, arranques en falso y repeticiones.
- Aplicación de correcciones habladas (por ejemplo, "doscientos, digo, quinientos").
- Corrección de puntuación y formato del texto transcrito.
- Ejecución de instrucciones sencillas sobre el texto, como "hazlo más corto".
- Procesamiento de listas habladas y correos dictados.
- Conversación multi-turno en formato chat (tag `conversational`), aunque el uso previsto es de un solo paso de limpieza.
- No soporta tool calling, function calling, agentes, visión, audio ni modo de razonamiento extendido (no documentado).

## Casos de uso

- Limpieza de dictado en aplicaciones de escritorio: el modelo recibe la transcripción cruda de un motor ASR y devuelve texto puntuado y sin disfluencias; es su función nativa en OpenFlow y está optimizado para el prompt exacto de esa aplicación.
- Corrección de notas de voz transcritas: convierte transcripciones de reuniones o notas rápidas en texto legible, aplicando las correcciones que el hablante verbaliza durante la grabación.
- Redacción de correos por voz: procesa correos dictados y listas habladas, tareas en las que el autor reporta 22 aciertos sobre 22 pruebas.
- Edición por instrucción sobre texto dictado: permite peticiones como "hazlo más corto" sobre el texto transcrito (15 de 18 aciertos en las pruebas del autor).
- Integración en pipelines de dictado locales: al ocupar unos 1,4 GB de memoria y ejecutarse con llama-server, cabe en equipos de consumo y permite procesamiento sin conexión.
- Prototipado de asistentes de voz especializados: sirve como base para ajustes finos en otras tareas de postprocesado de ASR, dado su tamaño reducido y su licencia Apache 2.0.

## Benchmarks y rendimiento

Resultados publicados por el autor, comparando con el archivo Q4_K_M publicado de `Qwen/Qwen2.5-1.5B-Instruct-GGUF`, usando la misma aplicación, prompt y comprobaciones de salida:

| Prueba | Modelo publicado | Este modelo |
|---|---|---|
| 20 dictados largos, comprobaciones superadas | 93% | 95% |
| 20 dictados largos, totalmente correctos | 7 | 9 |
| 12 dictados largos nuevos, comprobaciones superadas | 88% | 91% |
| 12 dictados largos nuevos, totalmente correctos | 2 | 4 |
| Dictados cortos (30) | 27 | 28 |
| Listas habladas y correos (22) | 21 | 22 |
| Instrucciones como "hazlo más corto" (18) | 12 | 15 |

Latencia media en los 20 dictados largos: 351 ms frente a 358 ms. En el conjunto nuevo: 275 ms frente a 241 ms.

## Requisitos de hardware

- VRAM/memoria estimada: aproximadamente 1,4 GB en ejecución con llama-server para el archivo Q4_K_M de 986 MB.
- GPU recomendadas: no se especifican; por tamaño, cualquier GPU de consumo con 2 GB o más de VRAM libre es suficiente.
- Cabe en GPU de consumo: sí, en tarjetas como RTX 3060, RTX 4060 o superiores, y también en Apple Silicon mediante MLX o llama.cpp.
- Opciones de despliegue: llama.cpp / llama-server (formato nativo GGUF); otros runners compatibles con GGUF no están documentados por el autor.
- Latencia y throughput: latencia media de 241-358 ms por dictado largo según las pruebas del autor; throughput no disponible.
- Parámetros de inferencia recomendados: temperatura 0 y sin penalización de repetición.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Formato |
|---|---|---|---|---|---|
| OpenFlow Cleanup (este modelo) | 1,5B | no disponible | Limpieza de dictado en inglés | Apache 2.0 | GGUF Q4_K_M |
| Qwen2.5-1.5B-Instruct | 1,5B | no disponible | Asistente general | Apache 2.0 | safetensors, GGUF |
| Qwen3 4B | 4B (aprox.) | no disponible | Asistente general | no disponible | no disponible |

La comparación cuantitativa disponible se limita al modelo base: en las pruebas del autor, este ajuste supera al Qwen2.5-1.5B-Instruct publicado entre 1 y 3 puntos porcentuales en comprobaciones superadas y en número de dictados totalmente correctos. No se dispone de comparaciones con otros modelos especializados en limpieza de dictado.

## Limitaciones y advertencias

- Medido con voz sintética: las dictaciones de prueba fueron leídas por voces del sistema de macOS y las comprobaciones las escribió el autor; no se ha medido con hablantes reales.
- El conjunto de pruebas "nuevo" no es totalmente independiente: no participó en el entrenamiento, pero se puntuó varias veces durante el desarrollo y sus resultados motivaron dos nuevas comprobaciones de salida; además, sus señales de corrección aparecen en los datos de entrenamiento.
- Puede equivocarse en hechos: antes de añadir las comprobaciones, resolvió "doscientas unidades, digo, quinientas" en doscientas y propagó un "mañana" corregido a una segunda frase. OpenFlow rechaza esos patrones y conserva la transcripción; sin esas comprobaciones, el modelo puede cometer estos errores de forma silenciosa.
- Solo inglés.
- No es un asistente general: espera el prompt exacto de OpenFlow y rinde peor con otros prompts.
- Requiere temperatura 0 y sin penalización de repetición; otros ajustes de muestreo degradan la limpieza.
- Licencia Apache 2.0, que permite uso comercial, pero se trata de una versión modificada de Qwen2.5-1.5B-Instruct y debe conservarse la atribución correspondiente.
- Riesgo de alucinación no evaluado de forma general; las pruebas se limitan a tareas de limpieza de dictado.

## Enlaces

- Hugging Face: https://huggingface.co/bhullar17noor/openflow-cleanup-qwen2.5-1.5b
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Modelo base en GGUF: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct-GGUF
- Dataset OpenAssistant OASST1: no disponible en la información proporcionada
- Paper o blog de OpenFlow: no disponible en la información proporcionada
- Repositorio de OpenFlow: no disponible en la información proporcionada
