# review-artifacts/nsdl-8b-qwen3vl-sft-locus

## Resumen

NSDL 8B (SFT), Qwen3-VL, LOCUS es un checkpoint de 8.767.123.696 parámetros derivado por ajuste supervisado (SFT) de Qwen/Qwen3-VL-8B-Instruct, publicado por el usuario `review-artifacts` con fines de revisión doblemente anónima. Su propósito declarado no es el uso general, sino servir como artefacto reproducible para la fila "Table 2: NSDL 8B, Qwen3-VL (SFT)" de un envío académico, de modo que los revisores puedan cargar los pesos exactos empleados en la evaluación.

El modelo es multimodal de tipo imagen-texto (pipeline `image-text-to-text`) y está especializado en planificación de tareas para entornos multi-robot. Se entrenó sobre el split de entrenamiento del dataset LOCUS, con la entrada del VLM limitada a 524.288 píxeles, y los pesos se almacenan en bfloat16, la misma precisión que usa el cargador de evaluación. La relevancia actual es metodológica: permite auditar resultados de un sistema agéntico multimodal sobre robótica sin depender de la identidad de los autores.

Al tratarse de un checkpoint anonimizado, la información publicada es deliberadamente mínima: no se documentan idiomas, composición del dataset, hiperparámetros ni resultados de benchmarks. La licencia declarada es Apache 2.0, pero la propia model card indica que se proporciona solo para revisión por pares y que no debe redistribuirse durante el proceso.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | `qwen3_vl` (modelo visión-lenguaje de la familia Qwen3-VL; detalles internos no disponibles) |
| Parámetros totales | 8.767.123.696 (dato real de los safetensors) |
| Longitud de contexto | no disponible (heredada de Qwen3-VL-8B-Instruct; no especificada en la información facilitada) |
| Tipos de cuantización | bfloat16 únicamente; el repositorio no incluye versiones cuantizadas (sin GGUF, sin AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 (con restricción indicada en la model card: solo para revisión por pares, no redistribuir durante la revisión) |
| Formato de pesos | safetensors en bfloat16, 4 fragmentos (`model-00001-of-00004` a `model-00004-of-00004`, 17,5 GB en total) |
| Modelo base | Qwen/Qwen3-VL-8B-Instruct |
| Pipeline | image-text-to-text (conversacional) |
| Librería | transformers |
| Resolución de entrada en entrenamiento | máximo 524.288 píxeles (entrada VLM limitada) |
| Fecha de publicación | 19 de septiembre de 2026 |

## Arquitectura y entrenamiento

La arquitectura es la de Qwen3-VL, un modelo visión-lenguaje de tipo transformer que combina un codificador visual con un decodificador de lenguaje, tal como indica la etiqueta de arquitectura `qwen3_vl` y los ficheros `preprocessor_config.json` y `video_preprocessor_config.json` incluidos en el repositorio. No se dispone de información sobre el número de capas, dimensión oculta, número de cabezas de atención, mecanismo de atención empleado ni detalles del codificador visual, ya que la model card anonimizada no los documenta y deben consultarse en la ficha del modelo base.

El proceso de adaptación consiste en un ajuste supervisado (SFT) sobre el split de entrenamiento del dataset LOCUS, un conjunto orientado a planificación de tareas en contextos multi-robot. La model card no especifica el número de tokens de entrenamiento, la composición del dataset, la receta de hiperparámetros, ni si se aplicaron etapas posteriores de RLHF o DPO; tampoco aclara si el ajuste fue completo o mediante adaptadores fusionados. El tamaño del repositorio (17,5 GB) coincide con el conjunto completo de pesos en bfloat16, lo que es compatible con un ajuste completo o con adaptadores ya fusionados, pero la información disponible no permite confirmarlo. La única restricción de entrenamiento documentada es el límite de 524.288 píxeles por entrada visual.

## Capacidades

- Generación de texto e interacción conversacional multi-turno, heredadas de Qwen3-VL-8B-Instruct.
- Comprensión de imágenes y entradas imagen-texto (pipeline `image-text-to-text`), con soporte de vídeo declarado a través del fichero de preprocesado de vídeo incluido (`video_preprocessor_config.json`).
- Planificación de tareas para entornos multi-robot, que es la especialización objetivo del ajuste SFT sobre LOCUS.
- Ejecución en flujos agénticos: el repositorio anonimizado referencia un script de evaluación denominado `scripts/eval_lnsdl_agentic_viki_l2.py`, lo que indica que el modelo se evalúa dentro de un bucle agéntico. No se detalla la interfaz de acciones ni si existe soporte formal de tool calling o function calling.
- Capacidades multilingües: no disponible.
- Modo de razonamiento explícito (thinking mode), audio u otras capacidades especiales: no disponible en la información proporcionada.

## Casos de uso

- Planificación de tareas en flotas de robots heterogéneas: el modelo recibe el estado visual del entorno (limitado a 524.288 píxeles por observación) junto con el objetivo en lenguaje natural y genera un plan de acciones secuencial para varios agentes. Es el escenario para el que fue ajustado, con LOCUS como dataset de referencia.
- Reproducción de resultados en revisión por pares: un revisor carga exactamente estos safetensors en bfloat16 con el cargador de evaluación y ejecuta el script agéntico del repositorio anonimizado, garantizando que la fila "Table 2" del artículo se reproduce sin ambigüedad sobre la versión de pesos.
- Asistente de supervisión para operadores de robótica: el modelo interpreta capturas o flujos de vídeo de una celda de trabajo y responde en lenguaje natural sobre el estado de la tarea, apoyándose en su naturaleza conversacional multi-turno para mantener el contexto de la sesión.
- Inspección visual con generación de informes: dado un conjunto de imágenes de un entorno industrial, el modelo describe anomalías y propone la siguiente acción correctiva dentro de un plan de tareas, aprovechando la componente de comprensión visual.
- Anotación y enriquecimiento de datasets de robótica: generación automática de descripciones, subtareas y etiquetas provisionales sobre secuencias visuales, que después se revisan manualmente. El ajuste sobre LOCUS lo hace adecuado para vocabulario y estructuras de tarea propias de ese dominio.
- Investigación en planificación multimodal: servir como punto de comparación controlado frente a Qwen3-VL-8B-Instruct sin ajustar, para medir cuánto aporta el SFT sobre LOCUS en tareas de planificación multi-robot.
- Despliegue de prototipos en una GPU de gama alta para consumo: con los pesos en bfloat16 y contexto reducido puede ejecutarse en una RTX 4090 de 24 GB, lo que permite validar prototipos de agente visual-robótico sin acceso a clústeres de varios nodos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente remite a la fila "Table 2: NSDL 8B, Qwen3-VL (SFT)" del envío, sin incluir cifras, y la búsqueda web realizada no devolvió ningún resultado técnico relacionado con el modelo (los enlaces recuperados tratan de lectores de libros electrónicos, impresoras, avisos de CodeQL, instaladores MSI e indentación en Visual Studio Code). Por tanto, no se dispone de valores de MMLU, HumanEval, GSM8K ni de métricas específicas de planificación multi-robot que puedan tabularse.

## Requisitos de hardware

- VRAM para los pesos: 17,5 GB en bfloat16 (8.767.123.696 parámetros × 2 bytes), más caché KV, activaciones y tokens visuales. En la práctica se recomienda reservar entre 20 y 24 GB para contextos cortos y resoluciones de imagen moderadas.
- Cuantización de 8 bits: aproximadamente 9 GB de pesos. Cuantización de 4 bits: aproximadamente 4,5-6 GB de pesos, con la consiguiente pérdida de precisión aún no evaluada en este checkpoint.
- GPU recomendadas para bfloat16: A100 40 GB, A100 80 GB, H100, L40S 48 GB o cualquier acelerador con 40 GB o más, que dejan margen holgado para el contexto y los tokens de imagen.
- GPU de consumo: una RTX 4090 o RTX 3090 de 24 GB puede alojar los pesos, pero el margen para caché KV y para la secuencia de tokens visuales es muy estrecho, por lo que son previsibles errores de memoria (OOM) con contextos largos o entradas cercanas al límite de 524.288 píxeles. Con cuantización de 8 o 4 bits el modelo cabe con holgura en tarjetas de 12-16 GB (RTX 3060 12 GB, RTX 4070 Ti Super 16 GB).
- Opciones de despliegue: la vía soportada es `transformers` con `trust_remote_code` según requiera el modelo base; para servicio de alto rendimiento pueden usarse vLLM o TGI si la versión instalada soporta la arquitectura `qwen3_vl`. llama.cpp y Ollama requerirían una conversión a GGUF que no se incluye en el repositorio, y su soporte de la torre visual de Qwen3-VL debe verificarse en la versión correspondiente.
- Latencia y throughput: no disponibles. No se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Datos de rendimiento |
|---|---|---|---|---|---|
| NSDL 8B (SFT), Qwen3-VL, LOCUS | 8.767.123.696 | no disponible | apache-2.0, con restricción de no redistribución durante la revisión | HuggingFace, repositorio `review-artifacts/nsdl-8b-qwen3vl-sft-locus` | no disponible |
| Qwen/Qwen3-VL-8B-Instruct (modelo base) | no disponible en la información proporcionada | no disponible en la información proporcionada | no disponible en la información proporcionada | HuggingFace, `Qwen/Qwen3-VL-8B-Instruct` | no disponible en la información proporcionada |
| Otros VLM de rango ~8B | no disponible | no disponible | no disponible | no disponible | no disponible |

La búsqueda web no devolvió información sobre modelos alternativos ni sobre sus resultados, por lo que la única comparación que puede establecerse con los datos facilitados es la relación de dependencia directa entre este checkpoint y Qwen3-VL-8B-Instruct: comparten arquitectura y tokenizador, y difieren en el ajuste SFT sobre LOCUS. Cualquier comparación cuantitativa con otros VLM de tamaño similar (por ejemplo, la serie Qwen2.5-VL o modelos de otros laboratorios) requeriría consultar sus fichas y benchmarks originales, que no forman parte de la información disponible.

## Limitaciones y advertencias

- Checkpoint de revisión: la model card indica explícitamente que se proporciona solo para revisión por pares y que no debe redistribuirse durante el proceso. Cualquier uso más allá de la reproducción de resultados debe tratarse con cautela aunque la licencia declarada sea Apache 2.0.
- Anonimización deliberada: se omiten autoría, afiliación y cita, por lo que no existe información sobre procedencia, mantenimiento ni soporte.
- Sesgos: no disponible. Al no documentarse el dataset LOCUS ni su composición, no puede caracterizarse el sesgo demográfico, cultural o de dominio del modelo.
- Riesgo de alucinación: no evaluado en la información proporcionada. Como modelo de 8B ajustado sobre un dominio acotado, es esperable que genere planes plausibles pero incorrectos fuera de la distribución de LOCUS; no hay métricas publicadas que cuantifiquen este riesgo.
- Limitación de entrada visual: el entrenamiento limita la entrada a 524.288 píxeles, de modo que imágenes de alta resolución se reducirán y pueden perderse detalles finos relevantes para la planificación.
- Idiomas: no disponible. No puede confirmarse el comportamiento multilingüe ni la calidad en castellano.
- Contexto: no disponible la longitud máxima soportada, lo que impide planificar despliegues con conversaciones o secuencias de observaciones largas.
- Producción: sin datos de benchmarks, sin cuantizaciones publicadas y con un repositorio de 17,5 GB en bfloat16, el modelo no está listo para un despliegue de producción sin una evaluación propia previa, incluida una medida de la degradación al cuantizar.

## Enlaces

- Ficha del modelo en Hugging Face: https://huggingface.co/review-artifacts/nsdl-8b-qwen3vl-sft-locus
- Modelo base declarado: https://huggingface.co/Qwen/Qwen3-VL-8B-Instruct
- Repositorio anonimizado del artículo (`nsdl/` y `scripts/eval_lnsdl_agentic_viki_l2.py`): referenciado en la model card, sin URL pública disponible durante la revisión.
- Resultados de la búsqueda web: no se ha encontrado ningún enlace técnico relevante sobre este modelo, su dataset o sus benchmarks.
