# AustinFu/Qev-0.8B

## Resumen

Qev-0.8B es un modelo de decisión, no un modelo generativo conversacional. Dado un estado (contexto), una pregunta y un conjunto de candidatos, devuelve una elección y una probabilidad para cada opción. Lo desarrolla AustinFu y forma parte de la familia Qev, que incluye Qev-2B, Qev-4B y Qev-9B bajo el mismo API. El modelo cubre tres tipos de tarea: Choice (elegir entre alternativas), Noul (juicio sí/no) y Score (puntuaciones ordenadas).

Técnicamente es un adaptador LoRA de rango 64 y alfa 128, más una cabeza de decisión de 256 dimensiones, cuatro cabezas de atención y dos capas Transformer, montados sobre Qwen3.5-0.8B-Base. Se entrenó por destilación de conocimiento desde Qev-9B v0.3.0, usando entropía cruzada sobre las probabilidades del profesor durante dos épocas y 44.576 entradas de una sola pregunta.

Su relevancia práctica está en el coste: ocupa aproximadamente 192 MiB de descarga, cabe en hardware modesto y expone la misma interfaz que los modelos mayores de la familia, lo que permite sustituir un Qev grande por este en tareas de clasificación y enrutado cuando la precisión del profesor no es imprescindible. El autor advierte explícitamente de que la calibración y la fiabilidad en producción no se han establecido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3.5-0.8B-Base) con adaptador LoRA r=64, alfa 128, cabeza de decision de 256 dimensiones (4 cabezas de atencion, 2 capas Transformer) y puerta de interaccion entre candidatos en la ultima capa de atencion completa |
| Parametros totales | no disponible (descarga del adaptador: ~192 MiB; el modelo base Qwen3.5-0.8B se descarga aparte) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 4.096 tokens de estado y ruta completa; sub-limites de 512 tokens por pregunta y 256 por candidato |
| Tipos de cuantizacion | no disponible (el autor documenta computo BF16 en el backbone y FP32 en la cabeza de decision) |
| Idiomas soportados | en, zh |
| Licencia | apache-2.0 (pesos de adaptacion Qev). El modelo base Qwen, el tokenizer y los datasets de origen conservan sus propios terminos |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte directamente de Qwen3.5-0.8B-Base (revision `dc7cdfe2ee4154fa7e30f5b51ca41bfa40174e68`) y añade tres componentes nuevos: un LoRA de rango 64 con alfa 128, una cabeza de decisión de 256 dimensiones con cuatro cabezas de atención y dos capas Transformer, y una puerta de interacción de última capa. Esta última permite interacción completa entre candidatos hermanos en la capa final de atención completa, de forma que las opciones se puntúan de manera relativa y no independiente. El backbone se ejecuta en BF16 y la cabeza de decisión en FP32.

El entrenamiento es una destilación de conocimiento pura: entropía cruzada contra las probabilidades de opción de Qev-9B v0.3.0, con temperatura 1,563437713227029 en el profesor y temperatura 1 en el estudiante. No hay warm-start supervisado, mezcla de etiquetas duras ni continuación representación-respuesta. El pool de 44.576 entradas de una sola pregunta se comparte con Qev-4B e incluye decisiones generales, ciencia y razonamiento, juicios de Principle, fronteras controladas, acciones web y tareas adicionales de reglas y razonamiento. La programación fue de dos épocas, 2.786 pasos, dos GPUs, batch global 32 y semilla 17. Ambos seeds probados alcanzaron 169/231 en JevBench; se seleccionó el seed 17. El autor indica que la destilación mejoró la calidad de las probabilidades, pero no superó al entrenamiento supervisado en todas las métricas de exactitud.

## Capacidades

- Predicción de elección entre candidatos (tipo Choice) con distribución de probabilidad sobre cada opción, no solo una etiqueta.
- Juicios binarios sí/no mediante el tipo Noul.
- Puntuaciones ordenadas sobre opciones mediante el tipo Score.
- Modelado de la interacción entre candidatos: las opciones compiten entre sí en la última capa de atención completa, lo que favorece comparaciones relativas.
- Inferencia por lotes vía JSONL con `python -m qev.predict`.
- Interfaz idéntica a Qev-2B, Qev-4B y Qev-9B, lo que permite intercambiar modelos sin cambiar el código de integración.
- Multilingüe limitado a inglés y chino según la model card.
- No documentado: generación de texto libre, tool calling, function calling, uso como agente multi-paso, visión, audio y modo de razonamiento explícito. Tampoco hay medición publicada de GSM8K, ChessBench ni BPoMP para este checkpoint.

## Casos de uso

- Enrutado de tickets de soporte: el propio ejemplo del autor recibe un estado como «me han cobrado dos veces el mismo pedido» y decide entre los departamentos de facturación y envíos, devolviendo la opción y su probabilidad para poder aplicar un umbral de confianza.
- Triaje de correo o formularios entrantes: clasificar cada mensaje en una categoría operativa concreta (incidencia, reclamación, consulta comercial) y derivar a revisión humana cuando la probabilidad máxima quede por debajo de un umbral.
- Moderación y aplicación de políticas: los datos de entrenamiento incluyen juicios de Principle y fronteras controladas, lo que lo hace adecuado para decidir si un contenido cumple o incumple una regla definida en las instrucciones de la pregunta.
- Verificación de coherencia y NLI: sus resultados en WANLI (66,02 %) y SemIf manuscrito (75,69 %) lo sitúan como un componente razonable para comprobar si una hipótesis se sigue de una premisa, devolviendo la probabilidad del sí/no.
- Ranking de respuestas candidatas en pipelines de evaluación: el tipo Score permite ordenar varias salidas de otro modelo sin necesidad de un juez generativo, con coste muy bajo por decisión.
- Selección de acciones web: el pool de entrenamiento incluye acciones web, por lo que puede actuar como cabecera de decisión de un agente que genera las acciones candidatas por otros medios y delega únicamente la elección.
- Anotación asistida y control de calidad de datos: para preetiquetar grandes volúmenes con etiquetas duras y probabilidades, usando después Qev-train (2.442 ejemplos sintéticos con etiquetas duras) como referencia de formato.
- Comparación y destilación interna: servir como estudiante pequeño frente a Qev-9B v0.3.0 para medir cuánta señal del profesor se conserva a un coste de descarga de 192 MiB.

## Benchmarks y rendimiento

| Benchmark | Aciertos / total | Exactitud (%) |
|---|---:|---:|
| JevBench public | 169 / 231 | 73,16 |
| Decision development · clean | 1029 / 1264 | 81,41 |
| Transfer development · clean | 431 / 656 | 65,70 |
| MMLU-Pro | 247 / 1000 | 24,70 |
| SemIf · handwritten | 109 / 144 | 75,69 |
| scienthoon | 596 / 873 | 68,27 |
| WANLI | 169 / 256 | 66,02 |

Los resultados se obtuvieron con computo BF16 en el backbone, cabeza de decision FP32, temperatura 1 y ejecucion causal de referencia completa. Se respondieron las 4.844 preguntas de las siete suites completas. Las filas de development y SemIf usan los subconjuntos emparejados de la guia de evaluacion del proyecto; el fichero `evaluation.json` conserva los recuentos de suite completa. No se han medido GSM8K, ChessBench ni BPoMP para este checkpoint. No hay datos comparativos publicados en la informacion disponible frente a Qev-2B, Qev-4B o Qev-9B.

## Requisitos de hardware

- VRAM estimada: no publicada por el autor. Por aritmetica de tamaños, un backbone de 0,8B en BF16 ocupa aproximadamente 1,6 GB de pesos, a los que se suman el adaptador, la cabeza de decision y la puerta de interaccion (~192 MiB de descarga), más activaciones y caché de atención para estados de hasta 4.096 tokens. El total esperable en memoria es del orden de 2 a 3 GB en BF16.
- GPU recomendadas: no documentadas. Por tamaño, el modelo cabe en GPUs de consumo con 4 GB o más de VRAM; no requiere A100 ni H100 para inferencia.
- Compatibilidad con GPU de consumo: sí, previsiblemente en tarjetas tipo RTX 3060, RTX 4060, RTX 4090 o superiores. Es una estimación derivada de los tamaños declarados, no una cifra medida.
- Opciones de despliegue: el autor solo documenta el paquete fuente `qev` con Python 3.12 y PyTorch 2.8.0, más `python -m qev.predict` para lotes JSONL. No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI, ya que el modelo no es un Transformer estándar: incorpora cabeza de decisión y puerta de interacción que estos runtimes no cargarían. El cargador descarga el modelo base Qwen fijado por revisión; no se necesita el profesor en inferencia.
- Latencia y throughput: no disponibles. `configs/qev-0.8b-finetune.json` permite un ajuste supervisado adicional con `python -m qev.train --init-checkpoint AustinFu/Qev-0.8B@v0.1.0`.

## Comparativa con modelos similares

| Modelo | Parametros totales | Contexto | Licencia | Disponibilidad | Relacion con Qev-0.8B |
|---|---|---|---|---|---|
| Qev-0.8B v0.1.0 | no disponible (adaptador de ~192 MiB) | 4.096 tokens de estado; 512 por pregunta, 256 por candidato | apache-2.0 (adaptacion) | HuggingFace, repo de 0,2 GB | Este modelo. El mas pequeño de la familia Qev |
| Qev-2B | no disponible | no disponible | no disponible | no disponible | Mismo API (Choice, Noul, Score) |
| Qev-4B | no disponible | no disponible | no disponible | no disponible | Mismo API; comparte el pool de 44.576 entradas de entrenamiento |
| Qev-9B v0.3.0 | no disponible | no disponible | no disponible | HuggingFace, etiqueta v0.3.0 | Profesor de destilacion de este checkpoint |
| NanoJev-0.6B | no disponible | no disponible | no disponible | Repositorio fuente | Referencia de modelo pequeno con entrenamiento distinto |

No hay datos publicados en la informacion disponible que comparen Qev-0.8B con alternativas externas de la misma categoria (modelos de decisión o clasificación). El autor advierte ademas de que las distintas versiones de Qev usan datos y objetivos diferentes, por lo que sus resultados no aíslan el efecto del tamaño.

## Limitaciones y advertencias

- No es un modelo de generación de texto libre: su API documentada devuelve una elección y probabilidades por opción, no respuestas redactadas.
- Calibración y fiabilidad en producción no establecidas: es una advertencia explícita del autor. El propio README pide validar el rendimiento y las probabilidades en la tarea propia antes de usarlo.
- Conocimiento general limitado: 24,70 % en MMLU-Pro, muy por debajo de lo esperable en un modelo de 0,8B de propósito general. No debe usarse como fuente de conocimiento.
- Exactitud irregular según dominio: 81,41 % en Decision development limpio frente a 65,70 % en Transfer development, lo que indica degradación fuera de la distribución de entrenamiento.
- Idiomas: solo inglés y chino declarados. No hay soporte documentado de castellano ni de otras lenguas.
- Riesgo de alucinación en decisiones: al depender de las probabilidades del profesor, puede asignar alta confianza a opciones incorrectas en dominios poco representados. El uso de umbrales de confianza y revisión humana es recomendable.
- Licencia: los pesos de adaptación Qev son Apache-2.0, pero el modelo base Qwen, el tokenizer y los datasets de origen mantienen sus propios términos; hay que revisar `THIRD_PARTY_NOTICES.md` antes de un uso comercial.
- Reproducibilidad limitada: el pool completo de 44.576 entradas y las salidas cacheadas del profesor no se distribuyen. Solo se publica Qev-train con 2.442 ejemplos sintéticos etiquetados.
- Sin validación comunitaria: 0 descargas y 0 likes en el momento del registro, sin resultados de terceros que confirmen las cifras del autor.
- Benchmarks incompletos: GSM8K, ChessBench y BPoMP no se han medido para este checkpoint.
- Despliegue restringido: no hay soporte documentado en runtimes de inferencia habituales (vLLM, llama.cpp, Ollama, TGI), lo que obliga a usar el paquete `qev`.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/AustinFu/Qev-0.8B
- Repositorio fuente e instalación: https://github.com/QiqianFu/Qev#installation
- Método de entrenamiento (0.8B): https://github.com/QiqianFu/Qev/blob/main/docs/training-0.8b.md
- Explicación de entrenamiento en chino: https://github.com/QiqianFu/Qev/blob/main/docs/training-0.8b.zh-CN.md
- Guía de evaluación: https://github.com/QiqianFu/Qev/blob/main/docs/evaluation.md
- Profesor Qev-9B v0.3.0: https://huggingface.co/AustinFu/Qev-9B/tree/v0.3.0
- Dataset Qev-train: https://huggingface.co/datasets/AustinFu/Qev-train
- Licencia y atribución de terceros: https://github.com/QiqianFu/Qev/blob/main/THIRD_PARTY_NOTICES.md
