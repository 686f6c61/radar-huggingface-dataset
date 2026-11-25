# Eddy1919/openetruscan-classifier

## Resumen

OpenEtruscan Classifier es un conjunto de artefactos de inferencia de código abierto publicados por el desarrollador Eddy1919 bajo el paraguas del proyecto OpenEtruscan, orientado al procesamiento de inscripciones etruscas (código de idioma `ett`). El repositorio contiene dos clasificadores ONNX de tipo de inscripción (una CNN a nivel de carácter de aproximadamente 31K parámetros y un micro-transformer de aproximadamente 274K) y un adaptador LoRA ByT5-small para restauración de lagunas (lacunae) en textos epigráficos. La tarea principal es la clasificación en siete clases funcionales: `boundary`, `commercial`, `dedicatory`, `funerary`, `legal`, `ownership` y `votive`.

El modelo es relevante como ejemplo de NLP para lenguas antiguas de muy bajos recursos y como caso de estudio de integridad metodológica: la model card incluye una retractación explícita de una afirmación previa de "99% Macro F1", sustituida por resultados honestos en el rango 0,12–0,37 de macro F1 bajo un protocolo con partición congelada, etiquetas por consenso de tres evaluadores y intervalos de confianza bootstrap. Es decir, el valor del repositorio no reside en el rendimiento absoluto, sino en la transparencia del proceso de evaluación y en la puesta a disposición de pesos pequeños ejecutables en navegador.

Los artefactos están depositados en formato ONNX (clasificadores) y safetensors (adaptador LoRA), con licencia Apache 2.0. El tamaño del repositorio es de 0,0 GB según Hugging Face, lo que refleja el carácter minúsculo de los pesos. No debe interpretarse como una herramienta de desciframiento ni como autoridad sobre el significado de una inscripción etrusca.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | CharCNN (~31K), micro-transformer (~274K) y adaptador LoRA sobre `google/byt5-small` (restauración de lagunas) |
| Parámetros totales | ~31K (cnn.onnx), ~274K (transformer.onnx), LoRA sobre byt5-small (tamaño total no disponible) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (exportación ONNX; cuantización no especificada) |
| Idiomas soportados | etrusco (`ett`) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`cnn.onnx`, `transformer.onnx`, `v2/*.onnx`) y safetensors (adaptador LoRA ByT5) |

## Arquitectura y entrenamiento

El repositorio agrupa tres arquitecturas distintas. Los dos clasificadores de tipo de inscripción son deliberadamente minúsculos: una CNN a nivel de carácter (~31K parámetros) y un micro-transformer (~274K parámetros), ambos exportados a ONNX para inferencia en navegador. El tercer artefacto es un adaptador LoRA sobre `google/byt5-small` para restauración de lagunas, depositado en `byt5_v2_6gb/`. El corpus de entrenamiento es `Eddy1919/openetruscan-corpus`, un conjunto etiquetado de forma plateada (silver labels) con 285 filas en la partición de entrenamiento del protocolo v2.0.4.

La evaluación se realizó bajo el protocolo v2.0.4 (8 de agosto de 2026) sobre un conjunto candidato-oro congelado de n=167, con etiquetas por consenso unánime de un jurado de tres evaluadores LLM (Claude Opus 4.8, Gemini 3.1 Pro y Gemini 3.5 Flash en Vertex AI) a confianza media o superior, y α de Krippendorff = 0,8557 (el propio autor advierte que α está inflado por linaje, ya que dos de los tres evaluadores son Gemini). Se emplearon intervalos de confianza bootstrap al 95% con 10.000 remuestreos y semilla 42. La partición de entrenamiento es disjunta por texto (text-disjoint), corrigiendo una fuga de la versión v2.0.2 en la que 25 de 400 filas de test repetían texto de entrenamiento bajo otro identificador.

Una innovación metodológica destacable es la retractación pública: la model card documenta que la cifra previa de 99% macro F1 medía datos de entrenamiento con etiquetas autoasignadas y nunca fue un resultado retenido. Los ficheros `metrics.json` y `v2/metadata.json` se conservan únicamente como artefactos históricos de procedencia. Además, el autor aclara que los resultados son a nivel de arquitectura y no miden los pesos exactos depositados el 2026-05-02, que son anteriores al protocolo.

## Capacidades

- Clasificación de inscripciones etruscas en siete clases funcionales: `boundary`, `commercial`, `dedicatory`, `funerary`, `legal`, `ownership` y `votive`.
- Inferencia en navegador mediante exportación ONNX de los dos clasificadores, sin dependencia de servidor.
- Restauración de lagunas (lacuna restoration) en textos epigráficos mediante el adaptador LoRA sobre ByT5-small.
- Procesamiento a nivel de carácter (CharCNN), adecuado para lenguas con ortografía no estandarizada y corpus pequeños.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no; el modelo está entrenado exclusivamente para etrusco (`ett`).
- Capacidades especiales: no dispone de modo de razonamiento (thinking mode), visión ni audio.

## Casos de uso

- Clasificación automática de inscripciones en proyectos de catalogación epigráfica: el clasificador CharCNN puede asignar una de las siete categorías funcionales a un texto etrusco recién transcrito, sirviendo como primera pasada para el etiquetado manual posterior en bases de datos arqueológicas.
- Demostración educativa de NLP para lenguas de bajos recursos: los modelos ONNX de 31K y 274K parámetros pueden ejecutarse íntegramente en el navegador del estudiante, ilustrando cómo se entrena y evalúa un clasificador con corpus de menos de 300 filas.
- Preetiquetado asistido en flujos de anotación: el clasificador puede generar etiquetas candidatas que un epigrafista humano revisa y corrige, reduciendo el coste de anotación de nuevos corpus etruscos.
- Restauración asistida de lagunas en ediciones digitales: el adaptador LoRA ByT5 puede proponer reconstrucciones de fragmentos perdidos en inscripciones dañadas, siempre como sugerencia sujeta a validación filológica.
- Investigación metodológica sobre evaluación en bajos recursos: el repositorio sirve como caso de estudio reproducible de particiones disjuntas por texto, intervalos bootstrap y retractación de métricas infladas, útil para quienes diseñan protocolos de evaluación en humanidades digitales.
- Integración en pipelines de humanidades digitales con requisitos mínimos de hardware: al ser modelos ONNX de kilobytes, pueden desplegarse en entornos sin GPU, como servidores modestos o aplicaciones web estáticas, para tareas de triaje documental.

## Benchmarks y rendimiento

Resultados del protocolo v2.0.4 (partición congelada, n=167, intervalos bootstrap al 95%, semilla 42). El autor advierte que son resultados a nivel de arquitectura y no de los pesos exactos depositados en el repositorio.

| Arquitectura | Parámetros | Macro F1 (IC 95%) | Exactitud |
|---|---:|---|---:|
| CharCNN | 28K | 0,399 (0,353 – 0,435) | 0,665 |
| TF-IDF + Multinomial NB | ~3K | 0,293 (0,255 – 0,329) | 0,755 |
| MicroTransformer | 274K | 0,252 (0,140 – 0,338) | 0,317 |
| EmbeddingMLP (MiniLM multilingüe, 384-d) | 58K + codificador congelado | 0,210 (0,181 – 0,242) | 0,641 |

El macro F1 promedia las siete clases del codebook; las clases `votive` y `commercial` no tienen filas de oro en v2.0.4, por lo que el techo de la métrica en este conjunto es aproximadamente 0,714. Hallazgos destacados: CharCNN supera a TF-IDF+NB (Δ +0,106, p = 0,0025) y a MicroTransformer (Δ +0,147, p = 0,0023) en la partición limpia, mientras que EmbeddingMLP queda último (Δ +0,083 frente a TF-IDF+NB, p < 0,0001).

## Requisitos de hardware

- VRAM estimada para inferencia: prácticamente despreciable para los clasificadores ONNX (31K y 274K parámetros, del orden de kilobytes de pesos); el adaptador LoRA sobre ByT5-small requiere cargar el modelo base `google/byt5-small`, de tamaño no especificado en la información disponible.
- GPU recomendadas: no se requiere GPU para los clasificadores; pueden ejecutarse en CPU y en navegador. Para el adaptador ByT5, cualquier GPU consumer moderna es suficiente, aunque no se publican requisitos concretos.
- Cabe en GPU consumer: sí, en cualquier GPU consumer e incluso en CPU.
- Opciones de despliegue: ONNX Runtime (incluido en navegador vía WebAssembly/WebGPU) para los clasificadores; para el adaptador LoRA, las herramientas estándar de Hugging Face (transformers + PEFT) o llama.cpp/Ollama si se convierte a GGUF (no documentado).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Macro F1 / rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| OpenEtruscan CharCNN | ~31K | no disponible | 0,399 (v2.0.4) | Apache 2.0 | Hugging Face (ONNX) |
| OpenEtruscan MicroTransformer | ~274K | no disponible | 0,252 (v2.0.4) | Apache 2.0 | Hugging Face (ONNX) |
| TF-IDF + Multinomial NB (línea base del proyecto) | ~3K | n/a | 0,293 (v2.0.4) | Apache 2.0 | Incluido en el proyecto |
| EmbeddingMLP sobre MiniLM multilingüe | 58K + codificador congelado | no disponible | 0,210 (v2.0.4) | Apache 2.0 | Incluido en el proyecto |

No se dispone de información sobre modelos externos comparables especializados en clasificación de inscripciones etruscas. Las alternativas de la misma categoría (clasificación de textos antiguos de bajos recursos) no están documentadas en la información proporcionada.

## Limitaciones y advertencias

- Rendimiento real bajo: el macro F1 se sitúa en la banda 0,12–0,37, muy lejos de la cifra retractada del 99%; no debe usarse como autoridad sobre el significado de una inscripción.
- Los resultados publicados son a nivel de arquitectura, no de los pesos exactos del repositorio, que fueron depositados antes del protocolo v2.0.4 y no han sido reevaluados.
- La métrica α de Krippendorff (0,8557) está inflada por linaje: dos de los tres evaluadores del jurado son modelos Gemini.
- El techo de macro F1 en el conjunto v2.0.4 es ~0,714 porque las clases `votive` y `commercial` carecen de filas de oro.
- Corpus de entrenamiento muy pequeño (285 filas plateadas), lo que limita la generalización y aumenta el riesgo de sobreajuste.
- Riesgo de alucinación en la restauración de lagunas: las reconstrucciones propuestas por el adaptador ByT5 no deben tratarse como lecturas filológicas validadas.
- Sesgos conocidos: no documentados explícitamente, pero el corpus etrusco disponible está sesgado hacia las categorías mejor representadas (`funerary`, `dedicatory`).
- Limitación idiomática: el modelo solo cubre etrusco (`ett`); no es multilingüe.
- Licencia Apache 2.0 permite uso comercial, pero el autor desaconseja explícitamente tratar los modelos como herramientas de desciframiento o autoridad epigráfica.
- Los ficheros `metrics.json` y `v2/metadata.json` corresponden a la ejecución retractada y solo deben consultarse por procedencia, no como métricas vigentes.
- El repositorio tiene 16 descargas y 0 likes en el momento de la consulta, lo que indica una validación comunitaria muy limitada.

## Enlaces

- Hugging Face: https://huggingface.co/Eddy1919/openetruscan-classifier
- Repositorio GitHub del proyecto: https://github.com/Eddy1919/openEtruscan#classification--restoration-models
- Dataset del corpus: https://huggingface.co/datasets/Eddy1919/openetruscan-corpus
- Modelo base del adaptador LoRA: https://huggingface.co/google/byt5-small
