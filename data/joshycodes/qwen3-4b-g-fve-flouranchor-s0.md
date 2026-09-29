# joshycodes/qwen3-4b-g-fve-flouranchor-s0

## Resumen

`joshycodes/qwen3-4b-g-fve-flouranchor-s0` es un checkpoint de investigación publicado por el usuario joshycodes en HuggingFace. Se trata de un ajuste por continuación de preentrenamiento (*continued pretraining*) sobre el modelo base `Qwen/Qwen3-4B`: se modificaron los pesos completos durante una época con una tasa de aprendizaje de 1e-05 sobre un corpus de 7.089.338 tokens repartidos en 7.800 documentos, perteneciente al conjunto denominado `flourishing-vs-equanimity`.

Lo relevante del experimento no es su rendimiento, sino el planteamiento metodológico: el corpus se presenta como material escrito por el propio modelo para entrenar a la siguiente versión de sí mismo, dentro de una línea de trabajo etiquetada como *synthetic-document-finetuning* (SDF) y *model welfare*. La model card indica explícitamente que, de los 7.800 documentos utilizados, 0 eran de autoría propia y 7.800 eran texto ordinario, un matiz importante que conviene leer con atención.

El checkpoint no ha sido evaluado en capacidad, alineación ni identidad, no tiene versiones cuantizadas publicadas y su licencia es *research-only*. La propia model card incluye la advertencia "do not deploy". Es, por tanto, un artefacto de estudio para reproducibilidad y análisis de deriva de pesos, no una base para aplicaciones en producción. El modelo cuenta con 4.411.424.256 parámetros y el repositorio ocupa 8,8 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso, heredada del modelo base Qwen/Qwen3-4B |
| Parametros totales | 4.411.424.256 (recuento real de safetensors, 4,41 B) |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | No disponible para este checkpoint; el modelo base Qwen/Qwen3-4B declara 32.768 tokens nativos |
| Tipos de cuantizacion | No disponible; el repositorio solo publica pesos en safetensors (8,8 GB, coherente con bf16/fp16) |
| Idiomas soportados | No disponible |
| Licencia | other / research-only (uso restringido a investigación) |
| Formato de pesos | safetensors |
| Modelo base | Qwen/Qwen3-4B |
| Tipo de ajuste | Continued pretraining con pesos completos, lr 1e-05, 1 época |
| Tokens de entrenamiento | 7.089.338 |
| Documentos de entrenamiento | 7.800 (0 de autoría propia, 7.800 de texto ordinario) |
| Corpus | flourishing-vs-equanimity |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-09-28 |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base: un transformer decoder-only denso de la familia Qwen3, con aproximadamente 4,4 mil millones de parámetros. No se introducen modificaciones estructurales, capas MoE ni mecanismos de atención alternativos; el checkpoint es el resultado de un ajuste de pesos completos (*full weights*) sobre los pesos de Qwen3-4B. La model card no documenta cambios en el tokenizador, en la plantilla de chat ni en la configuración de atención.

El entrenamiento consistió en una época de continuación de preentrenamiento con tasa de aprendizaje 1e-05 sobre 7.089.338 tokens distribuidos en 7.800 documentos del corpus `flourishing-vs-equanimity`. Según la model card, ese corpus fue escrito por el propio modelo como parte de un plan de *synthetic-document-finetuning* enmarcado en el repositorio "welfare-improvements", con el objetivo declarado de generar material para entrenar a la siguiente versión de sí mismo. No se menciona ningún uso de RLHF, DPO, SFT supervisado ni ajuste de instrucciones. El dato llamativo es la contradicción interna del propio texto: el corpus se describe como autoria del modelo, pero el desglose indica que 0 de los 7.800 documentos eran de autoría propia y todos eran texto ordinario, por lo que la naturaleza real del corpus no queda aclarada en la información disponible. Tampoco hay datos sobre composición temática, idioma, filtrado o deduplicación.

## Capacidades

- No se ha publicado ninguna evaluación de capacidades de este checkpoint. La model card afirma literalmente que no ha sido evaluado en capacidad, alineación ni identidad.
- Al derivar de Qwen/Qwen3-4B mediante continuación de preentrenamiento, cabría esperar generación de texto y conocimiento general propios de un modelo base de ese tamaño, pero no hay confirmación empírica para este checkpoint concreto.
- No hay evidencia de que conserve las capacidades declaradas del modelo base en razonamiento, matemáticas o código; la continuación de preentrenamiento sobre un corpus reducido puede producir deriva respecto al original.
- Soporte de tool calling / function calling: no disponible. No es un modelo ajustado con instrucciones ni con plantillas de herramientas documentadas.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles. El idioma del corpus de entrenamiento no se especifica.
- Modo *thinking* o razonamiento explícito: no disponible en la información proporcionada.
- Visión, audio u otras modalidades: no disponibles. Es un modelo exclusivamente de texto.

## Casos de uso

- Estudio de *model welfare* y autoentrenamiento sintetico: el checkpoint forma parte de una línea de investigación sobre documentos autogenerados y bienestar del modelo, por lo que sirve como material de análisis para equipos que investigan este tipo de dinámicas, siempre sin desplegarlo en producción.
- Reproducibilidad de un ciclo de continued pretraining: permite replicar el experimento (mismo modelo base, lr 1e-05, 1 época, 7.089.338 tokens) y verificar si los resultados son estables con otra semilla o con otro corpus de tamaño similar.
- Analisis de deriva de pesos respecto al modelo base: se puede comparar la distancia entre `Qwen/Qwen3-4B` y este checkpoint para cuantificar cuánto cambian los pesos con una época a tasa 1e-05, útil en estudios sobre olvido catastrófico.
- Ablaciones de hiperparametros en ajuste completo: al ser un caso documentado con lr y número de épocas explícitos, sirve como punto de partida para barrer valores de tasa de aprendizaje o volumen de tokens y medir el efecto sobre las métricas del modelo base.
- Comparacion con checkpoints hermanos: el mismo autor publica otros dos checkpoints de la misma serie (`joshycodes/qwen3-4b-g-fve-flourdiscern-s0` y `joshycodes/qwen3-4b-fve-flour-s0`), lo que permite un análisis comparativo dentro de un mismo marco experimental.
- Docencia y formacion tecnica: el repositorio ilustra de forma realista un flujo de trabajo de fine-tuning completo con transformers y publicación en el Hub, incluida la redacción de una model card con advertencias de uso.
- Auditoria de licencias y gobernanza de modelos: al declarar `research-only` de forma explícita, es un caso práctico para probar herramientas de catalogación y control de licencias en pipelines internos de MLOps.

En ninguno de estos casos debe usarse el modelo para atender usuarios finales, generar contenido publicado o alimentar sistemas automatizados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica expresamente que el checkpoint no ha sido evaluado en capacidad, alineación ni identidad, y no se proporcionan cifras de MMLU, HumanEval, GSM8K ni de ninguna otra métrica, ni comparaciones con el modelo base.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: en torno a 9-10 GB solo para los pesos (el repositorio pesa 8,8 GB), más la caché KV. A contexto largo la caché crece de forma notable: para 32.768 tokens en fp16 con la configuración del modelo base (36 capas, 8 cabezas KV, head_dim 128) la estimación es de aproximadamente 4-5 GB adicionales.
- VRAM estimada con cuantización: alrededor de 4,5-5 GB en 8 bits y 2,5-3 GB en 4 bits, aunque el autor no publica versiones cuantizadas, por lo que habría que generarlas.
- GPU recomendadas: cualquier GPU con 16 GB o más permite trabajar en bf16 con contexto moderado (RTX 4080, RTX 4090, A100 40 GB, H100). Para lotes grandes o contexto completo, A100/H100 son la opción segura.
- Cabe en GPU de consumo: sí, en bf16 con contexto reducido en RTX 3090, RTX 4090 o RTX 4080 (24 y 16 GB), y en 4 bits en tarjetas de 8-12 GB como RTX 3060 12 GB o RTX 4060 Ti 16 GB. También es viable en Apple Silicon con 16 GB o más de memoria unificada.
- Opciones de despliegue: transformers es la vía directa, ya que el repositorio solo incluye safetensors. vLLM y TGI pueden servirlo si se acepta el uso de un checkpoint sin evaluar. Para llama.cpp u Ollama sería necesario convertir los pesos a GGUF, algo que el autor no proporciona.
- Latencia y throughput estimados: no disponibles. No hay datos publicados de tokens por segundo, TTFT ni rendimiento con batching.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Estado |
|---|---|---|---|---|
| joshycodes/qwen3-4b-g-fve-flouranchor-s0 | 4,41 B | No disponible (base: 32.768 tokens) | research-only | Checkpoint de investigacion, 0 descargas, no evaluado |
| Qwen/Qwen3-4B | ~4,4 B (mismo orden de magnitud) | 32.768 tokens nativos en el modelo base | Apache-2.0 | Modelo base publico y ampliamente utilizado |
| joshycodes/qwen3-4b-g-fve-flourdiscern-s0 | No disponible | No disponible | No disponible | Checkpoint hermano de la misma serie |
| joshycodes/qwen3-4b-fve-flour-s0 | No disponible | No disponible | No disponible | Checkpoint hermano de la misma serie |

No se dispone de datos de rendimiento de ninguno de estos checkpoints, por lo que la comparación se limita a parámetros, licencia y disponibilidad. Frente al modelo base, la diferencia principal es la licencia: Qwen3-4B se distribuye bajo Apache-2.0, mientras que este ajuste restringe el uso a investigación.

## Limitaciones y advertencias

- Ausencia total de evaluacion: no hay métricas de capacidad, alineación ni identidad. Cualquier afirmación sobre su comportamiento es especulativa.
- No apto para despliegue: la propia model card incluye la indicación "do not deploy" y la etiqueta *not-for-deployment*.
- Licencia restrictiva: licencia `other` con nombre `research-only`. No se autoriza el uso comercial y conviene revisar los términos completos antes de cualquier utilización.
- Riesgo de alucinacion: al no haber pasado por RLHF ni DPO, no hay mecanismos de alineación que moderen la generación. El riesgo es el propio de un modelo base, sin calibrar.
- Riesgo de deriva respecto al modelo base: una época de continued pretraining sobre 7,09 millones de tokens con pesos completos puede degradar capacidades previas. No se ha medido el olvido catastrófico.
- Ambiguedad sobre el corpus: la model card describe el corpus como autoria del propio modelo, pero el desglose indica 0 documentos de autoría propia sobre 7.800. La composición real del conjunto de entrenamiento no queda clara.
- Idiomas no documentados: se desconoce en qué idiomas se entrenó y en cuáles responde con solvencia.
- Contexto no confirmado: no hay verificación de que el checkpoint conserve la ventana de contexto del modelo base, ni de que funcione correctamente a contextos largos.
- Sin versiones cuantizadas ni formato GGUF: la integración con herramientas de inferencia local exige conversión previa.
- Validacion nula por la comunidad: 0 descargas y 0 likes en el momento de la consulta. No existen reportes independientes de uso.
- Sin plantilla de chat documentada: al no ser un modelo ajustado con instrucciones, no hay garantía de que respete formatos conversacionales.
- Sesgos: no disponibles. No se ha realizado ninguna auditoría de sesgo sobre este checkpoint.

## Enlaces

- Pagina del modelo en HuggingFace: https://huggingface.co/joshycodes/qwen3-4b-g-fve-flouranchor-s0
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B
- Checkpoint hermano (flourdiscern): https://huggingface.co/joshycodes/qwen3-4b-g-fve-flourdiscern-s0
- Checkpoint hermano (fve-flour): https://huggingface.co/joshycodes/qwen3-4b-fve-flour-s0
- Guia de la familia Qwen3 (0.6B a 235B): https://insiderllm.com/guides/qwen3-complete-guide/
- Repositorio Qwen3-Coder: https://github.com/QwenLM/Qwen3-Coder
- Repositorio Qwen3-TTS: https://github.com/QwenLM/Qwen3-TTS
- Corpus `flourishing-vs-equanimity` y repositorio "welfare-improvements" citados en la model card: URL no disponible en la informacion proporcionada
