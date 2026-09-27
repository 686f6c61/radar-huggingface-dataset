# juiceb0xc0de/bella-bartender-gemma-e4b-gguf

## Resumen

Bella Bartender Gemma E4B es un modelo conversacional con personalidad, resultado de un fine-tuning sobre `google/gemma-4-E4B-it`. Lo publica el usuario de HuggingFace juiceb0xc0de dentro de la serie "Bella Bartender", una línea de variantes de personalidad entrenadas siempre con el mismo corpus: 9.300 pares de conversación extraídos de una única voz humana (la del autor), sin datos sintéticos ni otros hablantes. El objetivo declarado es contrarrestar los reflejos de asistente del modelo base de Google (entusiasmo en mayúsculas, emojis, planes de acción numerados, cierre obligatoriamente optimista) y sustituirlos por un registro coloquial, directo y sin validación constante.

El modelo se distribuye exclusivamente en formato GGUF, con el f16 como variante recomendada por el propio autor y Q8_0 como mínimo aceptable. Está pensado para generación de texto en inglés y su propósito no es el razonamiento formal ni las tareas de código, sino el diálogo abierto con una personalidad concreta y consistente. El repositorio ocupa 89,8 GB, lo que refleja que incluye varias cuantizaciones del mismo modelo.

La relevancia de esta ficha es acotada pero clara: es un ejemplo de fine-tuning de personalidad sobre una base instruct moderna, con una metodología reproducible (un solo corpus, una sola voz, evaluación A/B contra el modelo base) y con benchmarks propios publicados en un dataset aparte. No es un modelo de propósito general ni compite en MMLU con los grandes instruct; su interés está en el control de estilo y tono.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (arquitectura `gemma4_text`), 42 capas, hidden size 2.560, 8 cabezas de consulta y 2 cabezas clave/valor (grouped-query attention) |
| Parametros totales | 7.463.013.674 (dato real de safetensors) |
| Parametros activos | No aplica (no se describe como MoE en la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF; F16 recomendado por el autor, Q8_0 como minimo indicado; el repositorio (89,8 GB) contiene mas variantes no detalladas en la informacion disponible |
| Idiomas soportados | en (ingles) |
| Licencia | gemma (Gemma Terms of Use) |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

La base es `google/gemma-4-E4B-it`, un transformer decoder-only con grouped-query attention segun el grafo de arquitectura publicado por terceros: 42 capas, hidden size de 2.560, 8 cabezas de consulta y 2 cabezas clave/valor. Sobre esa base se aplico un fine-tuning supervisado con un corpus propio de 9.300 pares de conversacion, todos procedentes de una unica voz humana, con el autor situado en el rol de asistente. No se menciona uso de RLHF, DPO ni datos sinteticos; el metodo descrito es aprendizaje por prediccion de las respuestas del propio autor.

La innovacion tecnica declarada no es arquitectonica sino de control de estilo: el autor sostiene que los reflejos conversacionales del modelo base (formato, entusiasmo, cierre optimista) no se pueden eliminar solo con prompting y que el fine-tuning es la via efectiva. Como consecuencia, el modelo se comporta de forma dependiente del registro de entrada: responde en minusculas, no produce emojis ni listas numeradas en las pruebas del autor, y puede cerrar una conversacion sin animo de consuelo. El autor advierte ademas que la cuantizacion degrada precisamente el rasgo que el modelo pretende ofrecer, de ahi la recomendacion de f16.

## Capacidades

- Generacion de texto conversacional en ingles con una personalidad fija, coloquial y directa.
- Mantenimiento de un registro coherente a lo largo de un dialogo: el modelo iguala el tono del usuario (formal, informal, breve).
- Escritura creativa y respuestas con humor, sarcasmo o franqueza segun el contexto.
- Respuestas cortas y sin formato estructurado: sin listas numeradas, sin emojis y sin cierres motivacionales, segun las pruebas del autor.
- Razonamiento basico y tareas de logica simples: los benchmarks propios muestran resultados mixtos (70% en MuSR, 71% en BIG-Bench Hard sobre muestras pequenas, 0% en SimpleBench).
- Capacidades multilingues: no disponibles; el modelo esta entrenado y etiquetado solo para ingles.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado en la informacion proporcionada.
- Capacidades especiales (vision, audio, thinking mode): no disponibles en la informacion proporcionada.

## Casos de uso

- Companero conversacional de proposito general: el modelo esta afinado para sostener charla abierta con un tono humano y sin la estructura de asistente del modelo base, adecuado para interfaces de chat donde se busca cercania y no respuestas enciclopédicas.
- Prototipado de personajes para ficcion interactiva: sirve para dar voz a un personaje con registro estable, ya que el entrenamiento fuerza una sola voz consistente.
- Simulacion de conversacion para guiones o narrativa: util para generar dialogos con habla coloquial, slang y frases cortas, alejadas del estilo pulido de un instruct convencional.
- Aplicaciones de entretenimiento y compania: encaja en productos donde el valor esta en la sensacion de conversacion real y no en la precision factual.
- Investigacion sobre control de personalidad en LLM: es un caso de estudio util para medir cuanto del comportamiento de asistente de una base instruct puede eliminarse solo con fine-tuning supervisado.
- Evaluacion comparativa de cuantizaciones: dado que el autor documenta que la cuantizacion altera la personalidad, el modelo sirve para experimentos sobre perdida de estilo segun el nivel de cuantizacion (f16 frente a Q8_0 y menores).
- Despliegue local en equipo reducido mediante GGUF: al requerir unos 15 GB en f16, es viable en una estacion de trabajo con una sola GPU consumer de gama alta para uso interactivo.

## Benchmarks y rendimiento

Todos los datos siguientes proceden de la model card del autor y de su dataset de resultados; las muestras son muy pequenas, lo que limita la significacion estadistica.

| Benchmark | Resultado | Muestra |
|---|---|---|
| MuSR | 70% (7/10) | 10 items |
| SimpleBench (set publico) | 0% (0/10) | 10 items |
| ZebraLogic | Pendiente de puntuacion | 10 items |
| EQ-Bench v2 | 73,3 / 100 | 12 items |
| BIG-Bench Hard | 71% (49/69) | 23 subtareas, 3 cada una |
| Thematic Generalization | 50% (6/12) | 12 items |
| LisanBench | 5,0 transiciones de media | 8 palabras iniciales (40 en total) |
| Sudoku-Bench | no disponible (informacion truncada en la model card) | 6 rompecabezas |

No se han publicado comparaciones directas con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: unos 15 GB en F16, segun el propio autor ("if you can spare ~15GB, spend it"). Q8_0 requiere menos, aunque el autor no cifra el consumo exacto; por debajo de Q8_0 el autor considera que el modelo cambia de comportamiento.
- GPU recomendadas: no especificadas en la informacion disponible. Por tamano, F16 encaja en RTX 4090 (24 GB), RTX 3090 (24 GB), A100 40 GB o H100; Q8_0 permite tarjetas de 16 GB y posiblemente menos.
- Cabe en GPU consumer: si, en tarjetas de 24 GB con F16 sin margen amplio, y con holgura en cuantizaciones inferiores.
- Opciones de despliegue: al distribuirse en GGUF, es compatible con llama.cpp y Ollama; el autor no confirma explicitamente otras herramientas (vLLM, TGI) en la informacion disponible.
- Latencia y throughput: no disponibles.
- Ajustes de muestreo recomendados por el autor: temperature 1.0, top_k 64, top_p 0.95, min_p 0.0.

## Comparativa con modelos similares

La informacion disponible solo permite comparar contra la propia linea Bella y contra la base, con datos parciales.

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| bella-bartender-gemma-e4b (este modelo) | 7,46 B | no disponible | gemma | GGUF | Fine-tuning de personalidad, 9.300 pares, solo ingles |
| google/gemma-4-E4B-it (base) | no disponible | no disponible | gemma | safetensors (presumiblemente) | Modelo instruct original; reflejos de asistente que el fine-tuning elimina |
| juiceb0xc0de/bella-bartender-gemma-e2b | no disponible | no disponible | gemma | no disponible | Variante de la misma serie, fine-tuning sobre google/gemma-3n-E2B-it |

No se dispone de datos de benchmarks ni de contexto de los modelos comparados en la informacion proporcionada.

## Limitaciones y advertencias

- Riesgo de alucinacion: es un modelo conversacional afinado para estilo, no para precision factual; no se documentan evaluaciones de veracidad.
- Sesgos conocidos: no documentados en la informacion disponible. El corpus refleja una unica voz humana, lo que introduce inevitablemente la perspectiva y los sesgos de esa persona.
- Idiomas: soporte exclusivo de ingles; no hay datos de rendimiento en castellano ni en otras lenguas.
- Longitud de contexto: no especificada; conviene no asumir ventanas largas.
- Muestras de benchmark muy pequenas (10-23 items), por lo que los porcentajes publicados deben interpretarse como indicativos y no como medidas robustas. El 0% en SimpleBench es un resultado notablemente bajo.
- Sensibilidad a la cuantizacion: el autor afirma que la cuantizacion degrada la personalidad; por debajo de Q8_0 el comportamiento puede diferir del modelo evaluado.
- Restricciones de licencia: se distribuye bajo la licencia Gemma, que impone condiciones de uso (incluidas clausulas de uso aceptable y obligaciones de atribucion) y no es una licencia permisiva al uso como MIT o Apache 2.0. Debe revisarse antes de cualquier uso comercial.
- Dependencia del prompting: el autor advierte que el modelo responde al registro y que introducir la palabra "bartender" en el system prompt activa un comportamiento de oficio (ofrecer bebidas, inventar cocteles) que no forma parte de su entrenamiento.
- Fuera de distribucion: los mensajes tipo saludo corto no funcionan bien; el modelo espera conversacion real.
- Advertencia de fecha: el repositorio figura creado y actualizado en septiembre de 2026, fecha posterior a la disponible en el contexto habitual; conviene verificar la vigencia de los enlaces.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/juiceb0xc0de/bella-bartender-gemma-e4b-gguf
- Variante de la serie (GGUF): https://huggingface.co/juiceb0xc0de/bella-bartender-gemma-e4b-GGUF
- Modelo hermano E2B: https://huggingface.co/juiceb0xc0de/bella-bartender-gemma-e2b
- Modelo base: https://huggingface.co/google/gemma-4-E4B-it
- Grafo de arquitectura (terceros): https://hfviewer.com/juiceb0xc0de/bella-bartender-gemma-e4b-GGUF
- Ficha en directorio de terceros: https://free2aitools.com/model/juiceb0xc0de/bella-bartender-gemma-e4b-gguf
- Endpoint de inferencia (terceros): https://friendli.ai/models/juiceb0xc0de/bella-bartender-gemma-e4b-GGUF
- Dataset de resultados de benchmarks: https://huggingface.co/datasets/juiceb0xc0de/bella-bench-results
