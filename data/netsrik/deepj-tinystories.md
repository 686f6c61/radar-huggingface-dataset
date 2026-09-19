# netsrik/deepj-tinystories

## Resumen

DeepJ TinyStories es un modelo de lenguaje experimental de 1.301.120 parámetros publicado por el usuario netsrik en HuggingFace y entrenado con la librería DeepJ, un framework de inferencia y entrenamiento escrito en Java. Se trata de una implementación reducida de arquitectura estilo DeepSeek (Transformer con atención latente, Q rank 64 y KV rank 32), con 4 capas, tamaño oculto 128, 4 cabezas de atención y un vocabulario BPE de 2.048 tokens. El checkpoint se distribuye en el formato binario versionado propio de DeepJ (`model.dj`), no en safetensors ni GGUF, por lo que no es cargable directamente con la librería Transformers de Python.

El modelo se ha entrenado sobre el dataset sintético TinyStories en inglés (cuentos infantiles generados por modelos mayores), con 10.000 pasos de entrenamiento, batch size 1 y secuencias de 128 tokens. Sobre 100 ventanas deterministas de validación (12.800 tokens) obtiene una pérdida de 2,182273 y una perplejidad de 8,866. No es un modelo de propósito general: su función es servir como banco de pruebas a escala mínima para la arquitectura y el toolchain de DeepJ.

Su relevancia actual es fundamentalmente didáctica y de ingeniería: permite reproducir en unos pocos megabytes de pesos el pipeline completo de una arquitectura estilo DeepSeek (tokenizador BPE propio, configuración de atención con rangos de proyección, carga de checkpoint binario) y ejecutarlo íntegramente en CPU dentro de una JVM, sin dependencias de CUDA ni de ecosistema Python. La licencia MIT y el reducido tamaño del repositorio facilitan su uso como referencia en docencia, pruebas de regresión de la librería y experimentos de ablación a escala diminuta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer estilo DeepSeek (atención latente con Q rank 64 y KV rank 32), 4 capas |
| Parametros totales | 1.301.120 |
| Longitud de contexto | no disponible (el entrenamiento uso secuencias de 128 tokens) |
| Tipos de cuantizacion | no disponible (no se publican variantes GGUF, AWQ, GPTQ ni cuantizaciones del checkpoint) |
| Idiomas soportados | ingles (en) |
| Licencia | MIT |
| Formato de pesos | `model.dj` (formato binario versionado de DeepJ) y `tokenizer.bpe` |
| Tamano oculto | 128 |
| Cabezas de atencion | 4 |
| Capas | 4 |
| Vocabulario | 2.048 tokens (BPE entrenado desde una muestra acotada del split de entrenamiento) |
| Dataset de entrenamiento | TinyStories (ingles sintetico, licencia CDLA-Sharing-1.0) |
| Pasos de entrenamiento | 10.000, batch size 1, secuencias de 128 tokens |
| Libreria de ejecucion | deepj (Java), version 0.6.0-alpha o posterior compatible |
| Descargas en HuggingFace | 192 |
| Likes | 0 |
| Tamano del repositorio | 0,0 GB (redondeo reportado por HuggingFace) |

## Arquitectura y entrenamiento

El modelo implementa un Transformer de tipo decoder con esquema de atención inspirado en DeepSeek: proyecciones de query con rango 64 y de clave/valor con rango 32, un tamaño oculto de 128 y 4 cabezas de atención distribuidas en 4 capas. La configuración declarada en el ejemplo de uso de la model card es `DeepSeekConfig(2048, 128, 128, 4, 4, 384, 64, 32, 0.2f, 1.0f)`, que codifica vocabulario, dimensiones de modelo y de atención, rangos de proyección y dos hiperparámetros adicionales. El autor indica explícitamente que no es una implementación exacta de DeepSeek V2, V3 ni R1, y que actualmente no emplea caché KV incremental, lo que limita su eficiencia en generación autoregresiva de secuencias largas.

El entrenamiento consistió en 10.000 pasos con batch size 1 y secuencias de 128 tokens, lo que equivale a aproximadamente 1,28 millones de tokens vistos, una cifra del mismo orden que el número de parámetros del modelo. Los datos proceden íntegramente del dataset TinyStories, compuesto por cuentos infantiles en inglés generados sintéticamente con un vocabulario deliberadamente simple, y el tokenizador BPE se entrenó a partir de una muestra acotada del split de entrenamiento. No se documenta en la información disponible el uso de RLHF, DPO ni ninguna fase de alineación posterior al preentrenamiento.

## Capacidades

- Generación de texto en inglés a partir de un prompt corto, con énfasis en narrativa simple y cuentos infantiles.
- Continuación de historias con coherencia local a lo largo de unas pocas decenas de tokens, en línea con la distribución de TinyStories.
- Tokenización BPE propia entrenada sobre el corpus, utilizable de forma independiente para probar flujos de tokenización en Java.
- Ejecución completa en una JVM sin dependencias nativas de GPU, mediante la librería DeepJ.
- Carga y guardado de checkpoints en el formato binario versionado de DeepJ, útil para validar compatibilidad entre versiones del framework.
- No dispone de soporte de tool calling ni function calling.
- No dispone de capacidades de agente, planificación ni razonamiento multi-paso.
- No dispone de modo de razonamiento explícito (thinking mode).
- No dispone de visión, audio ni ninguna otra modalidad adicional al texto.
- Modelo monolingüe en inglés: no se ha entrenado ni evaluado en castellano ni en otros idiomas.

## Casos de uso

- Docencia de arquitecturas estilo DeepSeek: el modelo permite mostrar en clase cómo se configura una atención con rangos de proyección Q/KV distintos del tamaño oculto y cómo afecta eso al número total de parámetros, en un caso lo bastante pequeño como para recorrerlo en una sesión práctica.
- Pruebas de integración de la librería DeepJ: al ser un checkpoint versionado y estable, sirve para verificar que una versión nueva del framework carga correctamente `model.dj` y `tokenizer.bpe` y reproduce la misma salida ante la misma semilla.
- Pruebas de regresión de formatos binarios: cualquier cambio en el esquema de serialización de DeepJ puede validarse contra este checkpoint de 1,3 millones de parámetros, cuyo coste de verificación es mínimo.
- Generación de datos sintéticos a escala de juguete: el modelo puede producir borradores de cuentos infantiles que se filtren y se reutilicen como ejemplos adicionales en experimentos de aumento de datos sobre TinyStories, siempre con revisión humana.
- Experimentos de ablación de bajo coste: al caber en CPU, permite medir el efecto de variar rangos de atención, número de capas o tamaño de vocabulario en la perplejidad sobre un conjunto de validación fijo, sin reservar GPU.
- Verificación de pipelines de evaluación: su perplejidad de referencia (8,866 sobre 100 ventanas deterministas de TinyStories) sirve como sanity check para comprobar que un script de evaluación propio calcula la métrica de forma correcta.
- Material de estudio sobre sobreajuste y escalado: con 1,28 millones de tokens vistos y 1,3 millones de parámetros, es un ejemplo claro de régimen de entrenamiento insuficiente, útil para ilustrar curvas de pérdida y límites de generalización.
- Prototipado de tokenizadores BPE en Java: el archivo `tokenizer.bpe` permite probar carga, codificación y decodificación de un vocabulario pequeño sin depender de tokenizadores de HuggingFace.

## Benchmarks y rendimiento

Los únicos datos publicados en la información disponible son métricas de validación sobre TinyStories, calculadas por el autor. No hay resultados de MMLU, HumanEval, GSM8K ni de ninguna otra batería estándar.

| Metrica | Valor | Condiciones |
|---|---|---|
| Perdida (loss) | 2,182273 | 100 ventanas deterministas de validación de TinyStories, 12.800 tokens en total |
| Perplejidad (perplexity) | 8,866 | Mismas 100 ventanas deterministas |
| MMLU | no disponible | No evaluado |
| HumanEval | no disponible | No evaluado |
| GSM8K | no disponible | No evaluado |
| Otras baterias estandar | no disponible | No evaluado |

No se han publicado resultados de benchmarks adicionales en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 5,2 MB en fp32, 2,6 MB en fp16 y 1,3 MB en int8, calculados a partir de los 1.301.120 parámetros. No se publican checkpoints en estos formatos, por lo que la cifra es una estimación de tamaño, no una variante distribuida.
- GPU recomendadas: ninguna en particular; el modelo no requiere acelerador. Cualquier GPU sirve, pero su uso no aporta ventaja apreciable frente a CPU.
- Compatibilidad con GPU de consumo: cabe en cualquier GPU de consumo, incluida cualquier iGPU integrada y tarjetas con 4 GB o menos de memoria.
- Ejecución en CPU: viable y esperable, dado el tamaño; el cuello de botella real es el intérprete de la JVM y la ausencia de caché KV incremental, que obliga a recomputar contexto en cada paso de generación.
- Opciones de despliegue: exclusivamente la librería DeepJ 0.6.0-alpha o posterior compatible (Java, distribuida vía Maven Central con `io.github.kirstenali:deepj`). No es compatible con vLLM, llama.cpp, Ollama, TGI ni con la librería Transformers de Python, porque el checkpoint usa un formato binario propio.
- Latencia y throughput: no disponibles. La model card no publica tiempos de generación por token ni mediciones de throughput.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato de pesos | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DeepJ TinyStories (netsrik) | 1.301.120 | no disponible (entrenado con secuencias de 128 tokens) | `model.dj` (binario de DeepJ) | MIT | HuggingFace, requiere la libreria DeepJ en Java |
| Familia TinyStories de referencia (Eldan y Li) | no disponible en la informacion proporcionada | no disponible | no disponible | no disponible | HuggingFace, cargable con Transformers |
| Otros modelos de menos de 5 millones de parametros para texto en ingles | no disponible | no disponible | no disponible | no disponible | no disponible |

La categoría natural de comparación son los modelos de la familia TinyStories publicados junto al dataset del mismo nombre, que también trabajan en el rango de uno a decenas de millones de parámetros sobre el mismo corpus sintético. La diferencia práctica principal frente a ellos no es de rendimiento, sino de ecosistema: DeepJ TinyStories solo es ejecutable desde Java con la librería DeepJ, mientras que los modelos de referencia del dataset son cargables con herramientas estándar de Python. No se dispone en la información proporcionada de cifras de parámetros, contexto o rendimiento de esos modelos alternativos que permitan una comparación numérica rigurosa.

## Limitaciones y advertencias

- Modelo entrenado únicamente sobre cuentos infantiles en inglés de origen sintético: el dominio de aplicación es extremadamente estrecho y fuera de él la calidad cae de forma previsible.
- Riesgo elevado de alucinación, repetición y texto incoherente en generaciones largas; el autor lo advierte explícitamente en la model card.
- No ha sido evaluado en seguridad ni para uso en producción o aplicaciones posteriores ("not evaluated for safety or downstream use").
- No es un asistente de propósito general ni está alineado con instrucciones humanas: no ha pasado por RLHF, DPO ni ajuste de instrucciones.
- Sesgos conocidos: no documentados en la información disponible, pero al derivar de un corpus sintético infantil en inglés hereda la distribución y los sesgos de representación del generador que produjo TinyStories.
- Limitación de idioma: solo inglés. No se ha entrenado ni validado en castellano.
- Limitación de contexto: la información disponible no especifica una longitud de contexto máxima; el entrenamiento usó ventanas de 128 tokens, por lo que no hay garantía de comportamiento correcto más allá de esa longitud.
- Ausencia de caché KV incremental: la generación de secuencias largas recomputa el contexto en cada paso, con el coste de cómputo asociado.
- Restricciones de licencia: el código y los pesos se publican bajo MIT, lo que permite uso comercial, pero el dataset TinyStories se distribuye bajo CDLA-Sharing-1.0, condición que conviene revisar si se redistribuye el modelo o datos derivados.
- Portabilidad limitada: el formato `model.dj` no es cargable con Transformers, lo que complica integrarlo en infraestructuras de inferencia convencionales.
- Repositorio sin señales de comunidad: 192 descargas y 0 likes en la fecha de consulta, sin issues ni validación independiente documentada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/netsrik/deepj-tinystories
- Repositorio de la librería DeepJ: https://github.com/KirstenAli/DeepJ
- Artefacto DeepJ 0.6.0-alpha en Maven Central: https://central.sonatype.com/artifact/io.github.kirstenali/deepj/0.6.0-alpha
- Dataset TinyStories: https://huggingface.co/datasets/roneneldan/TinyStories
- Paper, blog o demo adicionales: no disponibles. Los resultados de la búsqueda web devueltos no guardan relación con este modelo (corresponden a documentación genérica sobre consultas a bases de datos) y no se ha localizado ningún recurso adicional específico.
