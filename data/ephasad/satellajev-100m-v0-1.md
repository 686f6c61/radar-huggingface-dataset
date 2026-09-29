# EphAsad/SatellaJev-100M-v0.1

## Resumen

SatellaJev-100M v0.1 es un modelo transformer de 101.495.040 parámetros entrenado desde cero por el usuario EphAsad para una tarea muy concreta: puntuación probabilística de decisiones tipadas. No es un modelo generativo. No tiene cabeza de lenguaje autorregresiva ni produce texto libre; en su lugar recibe un estado, una pregunta, un tipo de decisión y un conjunto de candidatos, y devuelve una puntuación escalar para cada candidato que después se normaliza con softmax para obtener una distribución de probabilidad. El modelo aprende una función de puntuación compartida de la forma `score_i = f(state, question, kind, candidate_i)`.

La arquitectura es un transformer bidireccional de 16 capas, tamaño oculto 640, 10 cabezas de atención de dimensión 64, FFN SwiGLU con dimensión oculta 2304 y codificación posicional RoPE con RMSNorm. Usa un tokenizador SentencePiece BPE propio de 7.000 tokens con *byte fallback*, entrenado únicamente sobre el split de entrenamiento de Open-Jev, y admite secuencias de hasta 1.024 tokens. Los únicos tipos de decisión soportados son `noul`, `choice` y `score`.

Su relevancia es acotada pero clara: cubre el nicho de modelos de decisión y ranking probabilístico calibrado, con resultados publicados de exactitud, entropía cruzada, Brier y ECE sobre splits congelados de validación, test y fuera de distribución. El modelo se distribuye en formato safetensors con licencia "other" y, en el momento de redactar esta ficha, no acumula descargas ni *likes* en HuggingFace.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer bidireccional (encoder), atención propia bidireccional, sin cabeza generativa |
| Parametros totales | 101.495.040 (101,50 M) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 1.024 tokens |
| Tipos de cuantizacion | No disponible (no se han publicado versiones cuantizadas) |
| Idiomas soportados | No disponible |
| Licencia | other |
| Formato de pesos | safetensors (librería pytorch) |
| Capas transformer | 16 |
| Tamano oculto | 640 |
| Cabezas de atencion | 10 |
| Dimension de cabeza | 64 |
| FFN | SwiGLU, dimension oculta 2304 |
| Vocabulario | 7.000 tokens (SentencePiece BPE, byte fallback) |
| Codificacion posicional | RoPE |
| Normalizacion | RMSNorm |
| Dropout | 0,10 |
| Cabeza de salida | Scorer escalar compartido de candidatos |
| Tamano del repo | 0,4 GB |
| Tipos de decision soportados | `noul`, `choice`, `score` |

## Arquitectura y entrenamiento

El modelo es un encoder transformer bidireccional sin cabeza de lenguaje. Cada candidato se codifica de forma independiente con el transformer compartido mediante una secuencia con el formato `<KIND_CHOICE> <STATE>...</STATE> <QUESTION>...</QUESTION> <CANDIDATE>...</CANDIDATE> <DECIDE>`. El estado oculto del token final `<DECIDE>` pasa por una cabeza de puntuación escalar y las puntuaciones de los candidatos de una misma decisión se normalizan conjuntamente. La dimensionalidad de salida no está fijada por una cabeza de clasificación estática, sino por el número de candidatos proporcionados en inferencia, lo que permite conjuntos de candidatos de longitud variable. El tokenizador es un SentencePiece BPE de 7.000 tokens entrenado solo con el split de entrenamiento de Open-Jev.

El entrenamiento se realizó desde cero durante 6 épocas sobre la configuración `release-v2-redistributable` del dataset `ZefanCai/Open-Jev` (79.116 registros de entrenamiento, 4.672 de calibración, 3.723 de validación, 10.356 de test y 15.701 fuera de distribución). Se usó AdamW con learning rate máximo 3e-4, weight decay 0,10, warmup ratio 0,03, decaimiento coseno, gradient clipping 1,0, batch de 64 registros de decisión con acumulación de gradiente 2 (batch efectivo de 128). La función de pérdida combina entropía cruzada sobre objetivos suaves y un término Brier: `Loss = CrossEntropy + 0,1 × Brier`. El criterio de selección de checkpoint fue la entropía cruzada de validación, que descendió de forma monótona: 0,6043 (época 1), 0,5534 (2), 0,5006 (3), 0,4638 (4), 0,4352 (5) y 0,4161 (6), seleccionándose el checkpoint de la época 6. Tras el entrenamiento se ajustó un único parámetro de temperatura de calibración con los pesos congelados, resultando `T = 0,980080`.

## Capacidades

- Puntuación escalar de candidatos para decisiones tipadas, con conversión a distribución de probabilidad mediante softmax y temperatura de calibración.
- Soporte de tres tipos de decisión: `noul`, `choice` y `score`.
- Manejo de conjuntos de candidatos de longitud variable sin cabeza de clasificación de tamaño fijo.
- Estimación de probabilidades calibradas en distribución (ECE de 0,0211 en el split de calibración y 0,0287 en test).
- Codificación bidireccional del contexto completo del estado y la pregunta, sin enmascaramiento causal.
- Ranking de alternativas: al normalizar las puntuaciones se obtiene un orden explícito de preferencia entre candidatos.
- No dispone de generación de texto, tool calling, function calling, razonamiento multi-paso, visión ni audio.
- No se documentan capacidades multilingües ni un conjunto de idiomas soportados.

## Casos de uso

- Reranking probabilístico en pipelines de recuperación aumentada (RAG): dado un estado y una pregunta, el modelo puntúa cada pasaje candidato y devuelve una distribución normalizada que puede usarse para reordenar los resultados de un retriever vectorial. Es adecuado porque su salida es directamente una probabilidad calibrada y no requiere post-procesado de texto generado.
- Selección de acciones en agentes: con el tipo de decisión `choice`, el modelo puede evaluar un conjunto finito de acciones candidatas en un estado dado y devolver la acción más probable, integrándose como módulo de política en un bucle de agente. La ventana de 1.024 tokens impone un límite claro al tamaño del estado que se puede incluir.
- Enrutado de intenciones en asistentes conversacionales: clasificar la intención del usuario como una decisión `choice` entre un conjunto cerrado de intenciones, con la probabilidad asociada disponible para umbrales de derivación a humano o a fallback.
- Calibración y anotación asistida: dado que el modelo devuelve una probabilidad y una ECE medida, puede usarse para estimar el acuerdo esperado entre anotadores y priorizar los casos ambiguos para revisión humana.
- Destilación o aproximación de un modelo profesor basado en Open-Jev: el propio modelo se entrenó sobre los objetivos de probabilidad de Open-Jev, por lo que puede emplearse como sustituto ligero (101,5 M de parámetros) en entornos con restricciones de cómputo, asumiendo la degradación medida fuera de distribución.
- Puntuación de respuestas candidatas en generación: combinado con un modelo generativo que produzca n respuestas, SatellaJev puede puntuar cada una y seleccionar la mejor mediante la distribución softmax, evitando depender de heurísticas de longitud o de rerankers genéricos.
- Evaluación de sistemas de decisión con candidatos `score`: el tipo `score` permite puntuar alternativas en tareas donde los objetivos del dataset son puntuaciones continuas normalizadas, útil para comparar configuraciones antes de desplegar un sistema completo.

## Benchmarks y rendimiento

Los datos publicados corresponden a los splits del dataset Open-Jev y no a benchmarks estándar de la comunidad (MMLU, HumanEval, GSM8K u otros), que no se han reportado.

Resultados globales:

| Split | Accuracy | Cross-Entropy | Brier | ECE |
|---|---:|---:|---:|---:|
| Calibration | 86,71 % | 0,3140 | 0,0545 | 0,0211 |
| Validation | 81,65 % | 0,4170 | 0,0749 | 0,0316 |
| Test | 82,03 % | 0,3930 | 0,0759 | 0,0287 |
| OOD | 72,09 % | 0,7604 | 0,1308 | 0,0997 |

Resultados en el conjunto de test por tipo de decisión:

| Tipo de decision | Registros | Accuracy | Cross-Entropy | Brier | ECE |
|---|---:|---:|---:|---:|---:|
| `noul` | 6.364 | 89,13 % | 0,2455 | 0,0787 | 0,0185 |
| `choice` | 2.408 | 62,79 % | 0,7717 | 0,0826 | 0,0524 |
| `score` | 1.58 (dato truncado en la model card) | No disponible | No disponible | No disponible | No disponible |

Curva de aprendizaje en validación (entropía cruzada por época): 0,6043 (1), 0,5534 (2), 0,5006 (3), 0,4638 (4), 0,4352 (5), 0,4161 (6).

## Requisitos de hardware

- VRAM estimada para inferencia, calculada a partir de los 101.495.040 parámetros: aproximadamente 406 MB en fp32, 203 MB en fp16/bf16, 101 MB en int8 y 51 MB en int4, sin contar activaciones ni estado del optimizador (no necesario en inferencia).
- El consumo real de memoria escala con el número de candidatos por decisión y con la longitud de secuencia (hasta 1.024 tokens): cada candidato se procesa en una pasada independiente, por lo que el coste agregado crece linealmente con el tamaño del conjunto de candidatos.
- Cabe holgadamente en GPU de consumo: cualquier GPU con 4 GB o más de VRAM (por ejemplo, RTX 3050, RTX 3060, RTX 4060, RTX 4090) puede ejecutar el modelo en fp32 o fp16. También es viable en CPU para cargas de baja concurrencia.
- GPU recomendadas para producción con alta concurrencia: A100, H100, L40S o cualquier acelerador con suficiente memoria para agrupar candidatos en lote. No se han publicado cifras de latencia ni throughput específicas para este modelo, por lo que no es posible dar valores concretos.
- Opciones de despliegue: al ser un modelo PyTorch no generativo con cabeza de scoring propia, no es compatible con runtimes de inferencia de LLM como vLLM, llama.cpp, Ollama o TGI. El despliegue debe hacerse con PyTorch nativo, exportación a TorchScript/ONNX o un servidor de inferencia genérico (por ejemplo, TorchServe o un servicio FastAPI con batching propio).
- La temperatura de calibración (0,980080) debe aplicarse en tiempo de inferencia para conservar las métricas de calibración reportadas.

## Comparativa con modelos similares

No se ha encontrado en la información disponible ningún modelo público directamente comparable. SatellaJev no es un modelo de lenguaje generativo ni un encoder de propósito general tipo BERT: es un scorer de decisiones tipadas con salida softmax sobre conjuntos de candidatos de longitud variable, una formulación poco común en el ecosistema abierto. Los resultados de la búsqueda web no aportan referencias técnicas relacionadas con este modelo ni con su categoría.

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SatellaJev-100M v0.1 | 101,50 M | 1.024 tokens | Scoring probabilístico de decisiones tipadas | other | HuggingFace (`EphAsad/SatellaJev-100M-v0.1`) |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Las probabilidades que produce el modelo son predicciones relativas a los objetivos de probabilidad suministrados por el dataset Open-Jev. No deben interpretarse automáticamente como probabilidades empíricas del mundo real.
- Degradación clara fuera de distribución: en el split OOD la exactitud cae al 72,09 % y la ECE sube a 0,0997, casi el triple que en test (0,0287). La calibración no se mantiene fuera de la distribución de entrenamiento.
- Rendimiento desigual por tipo de decisión: `noul` alcanza 89,13 % de exactitud en test, mientras que `choice` se queda en 62,79 % con una entropía cruzada de 0,7717. Las tareas de elección entre alternativas son el punto débil documentado.
- No genera texto en absoluto: no puede emplearse como modelo conversacional, de resumen, traducción o generación de código. Cualquier expectativa de ese tipo es un error de uso.
- Contexto limitado a 1.024 tokens, lo que restringe el tamaño del estado y la pregunta que se pueden incluir en el prompt.
- Idiomas soportados no documentados. El tokenizador se entrenó solo con el split de entrenamiento de Open-Jev, por lo que la cobertura lingüística fuera de la distribución de ese corpus es incierta.
- Licencia "other": no se especifican en la información disponible los términos exactos de uso comercial. Debe revisarse el texto completo de la licencia en el repositorio antes de cualquier despliegue en producción.
- Riesgo de sesgo heredado del dataset `ZefanCai/Open-Jev` y de la configuración `release-v2-redistributable`, cuya composición no se detalla en la model card.
- Solo se soportan tres tipos de decisión (`noul`, `choice`, `score`); cualquier otro tipo requiere reentrenamiento o ajuste.
- El coste computacional crece linealmente con el número de candidatos, ya que cada candidato implica una pasada completa por el transformer.
- El repositorio tiene 0 descargas y 0 *likes*, sin validación independiente por parte de terceros ni resultados reproducidos fuera del autor.
- El dato de rendimiento del tipo `score` aparece truncado en la model card, por lo que no puede verificarse su exactitud ni su ECE.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/EphAsad/SatellaJev-100M-v0.1
- Dataset de entrenamiento: https://huggingface.co/datasets/ZefanCai/Open-Jev
- Dataset adicional referenciado en las etiquetas: https://huggingface.co/datasets/SargeDev/jev-distill-corpus-v3
- Búsqueda web de referencia: no se han encontrado resultados relevantes sobre este modelo (los resultados devueltos no guardan relación con la ficha y se descartan).
