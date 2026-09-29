# joshycodes/gemma-3-12b-fve-advanchor-s0

# joshycodes/gemma-3-12b-fve-advanchor-s0

## Resumen

Se trata de un checkpoint de investigación creado por el usuario joshycodes a partir de `google/gemma-3-12b-it`, al que se le aplicó un entrenamiento continuado (continued pretraining) sobre un corpus supuestamente autoescrito por el propio modelo. El repositorio contiene los pesos completos en formato safetensors, con 13.194.203.760 parámetros reales (unos 13,19 mil millones) y un tamaño de repositorio de 26,4 GB, lo que corresponde a pesos en precisión de 16 bits.

El interés del artefacto no es de rendimiento, sino de investigación sobre bienestar de modelos (model welfare) y sobre el llamado synthetic-document-finetuning (SDF): se exploran técnicas de continued pretraining con documentos sintéticos y con contenido identitario autogenerado. El autor etiqueta explícitamente el modelo como `research` y `not-for-deployment`, y la model card indica que no se ha evaluado todavía en capacidad, alineación ni identidad.

La relevancia actual es, por tanto, metodológica: sirve como caso de estudio reproducible de un pipeline de generación de corpus, entrenamiento continuado y evaluación de deriva de identidad, y no como modelo listo para producto. La licencia es `other`, con nombre `research-only`, lo que limita su uso a fines de investigación.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de google/gemma-3-12b-it; la familia Gemma 3 es multimodal según la documentación de Google) |
| Parametros totales | 13.194.203.760 (recuento real de safetensors) |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | 128.000 tokens en el modelo base Gemma 3 según la documentación de Google; no confirmada de forma independiente para este checkpoint |
| Tipos de cuantizacion | no disponible; el repositorio solo publica safetensors (no hay GGUF, AWQ ni GPTQ) |
| Idiomas soportados | no disponible para este checkpoint; el modelo base Gemma 3 declara más de 140 idiomas según la documentación de Google |
| Licencia | other / research-only (solo investigación; sin autorización de despliegue según la model card) |
| Formato de pesos | safetensors (repositorio de 26,4 GB) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de `google/gemma-3-12b-it`, un transformer decoder-only denso de la familia Gemma 3, desarrollada por Google DeepMind y presentada como capaz de ejecutarse en una sola GPU o TPU con una ventana de contexto de 128.000 tokens y capacidades multimodales. Este checkpoint concreto no modifica la arquitectura: parte de los pesos del modelo instruct y aplica un entrenamiento continuado.

El entrenamiento continuado se realizó sobre pesos completos (full weights), con tasa de aprendizaje 1e-05, una única época y 7.586.945 tokens distribuidos en 7.827 documentos. La model card especifica que, de esos documentos, 0 eran autoescritos y 7.827 eran texto ordinario, lo que contradice el título del repositorio («after continued pretraining on its own self-authored corpus») y constituye una ambigüedad relevante del artefacto. El corpus se identifica como `flourishing-vs-equanimity`, y el marco, el plan y la evaluación se atribuyen al repositorio «welfare-improvements». No se documenta uso de RLHF, DPO ni ninguna innovación de decodificación; tampoco se aportan detalles sobre la composición lingüística o temática del corpus más allá del recuento de tokens y documentos.

## Capacidades

- Generación de texto instruct: hereda las capacidades conversacionales del modelo base `google/gemma-3-12b-it`.
- Razonamiento y código: el modelo base Gemma 3 12B it cubre estas tareas; no hay evaluación publicada para este checkpoint concreto.
- Tool calling / function calling: no disponible en la información proporcionada para este checkpoint.
- Soporte de agentes y razonamiento multi-paso: no disponible ni evaluado en este checkpoint.
- Capacidades multilingües: no disponibles para el checkpoint; el modelo base declara más de 140 idiomas.
- Capacidades especiales: el modelo base Gemma 3 es multimodal según la documentación de Google; este checkpoint no documenta si conserva o degrada esa capacidad tras el continued pretraining.
- Modo de razonamiento explícito (thinking mode): no disponible.
- Nota: la model card indica expresamente que el modelo no ha sido evaluado en capacidad, alineación ni identidad.

## Casos de uso

- Investigación en model welfare: el checkpoint permite estudiar cómo un continued pretraining con contenido identitario y sintético afecta a la auto-representación del modelo, comparando respuestas con el modelo base mediante baterías de preguntas sobre identidad y valores.
- Reproducción de pipelines de synthetic-document-finetuning: sirve como referencia técnica para replicar el flujo (generación de corpus, continued pretraining con lr 1e-05 y una época sobre ~7,6 millones de tokens) y medir el coste y el efecto de cada decisión.
- Estudio de deriva por continued pretraining: comparar este checkpoint con `google/gemma-3-12b-it` en tareas controladas permite cuantificar cuánta capacidad se degrada o se preserva tras un ajuste relativamente corto sobre pesos completos.
- Análisis de corpus sintéticos: el dataset asociado `joshycodes/gemma-3-12b-commitments-corpus` (78,5 MB, parquet, licencia research-only) permite auditar la composición de los documentos usados en este tipo de experimentos.
- Metodología de evaluación de identidad y alineación: dado que el autor declara que estas dimensiones no se han evaluado, el checkpoint es material de partida para diseñar y validar protocolos de evaluación de identidad en modelos ajustados.
- Docencia e investigación en alineación: uso en cursos y grupos de investigación para ilustrar los riesgos de los checkpoints intermedios no evaluados y la diferencia entre un artefacto de investigación y un modelo desplegable.
- Auditoría de licencias y trazabilidad: caso práctico para estudiar cómo una licencia `research-only` derivada de un modelo base con licencia propia condiciona la redistribución y el uso comercial.
- Advertencia: la model card indica explícitamente «do not deploy»; ninguno de estos casos contempla uso en producción ni atención al cliente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica que el modelo «not evaluated for capability, alignment or identity yet», por lo que no existen datos de MMLU, HumanEval, GSM8K ni de evaluaciones comparables para este checkpoint.

## Requisitos de hardware

- VRAM para inferencia en bf16/fp16: aproximadamente 26,4 GB solo para los pesos (13,19 mil millones de parámetros × 2 bytes), cifra coherente con el tamaño del repositorio.
- VRAM en cuantización de 8 bits: aproximadamente 13,2 GB para los pesos, más el coste de activaciones y caché KV.
- VRAM en cuantización de 4 bits: aproximadamente 7 GB para los pesos; no hay cuantizaciones publicadas en el repositorio, por lo que habría que generarlas.
- Caché KV: con una ventana de 128.000 tokens el consumo de caché KV es elevado; no se ha publicado ninguna medición para este checkpoint.
- GPU recomendadas: una A100 de 40 GB o una H100 permiten inferencia en bf16 sin cuantizar; en GPUs de 24 GB (RTX 3090, RTX 4090) el modelo en bf16 no cabe completo y requeriría cuantización o reparto en varias GPU.
- GPU de consumo: con cuantización de 4 bits los pesos rondarían los 7 GB, por lo que cabría en tarjetas de 12 GB (por ejemplo RTX 3060 12 GB) o superiores, siempre que se genere la cuantización.
- Opciones de despliegue: vLLM, TGI o SGLang pueden cargar los safetensors publicados; llama.cpp u Ollama exigirían convertir los pesos a GGUF, conversión que no está publicada.
- Latencia y throughput: no disponible.
- Nota de licencia: aunque técnicamente sea desplegable, la licencia research-only y la etiqueta not-for-deployment desaconsejan y restringen su uso en producción.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| joshycodes/gemma-3-12b-fve-advanchor-s0 | 13,19 mil millones | 128.000 tokens (heredado del base, no confirmado) | other / research-only | HuggingFace, 0 descargas, 0 likes | Checkpoint de investigación sin evaluar; no desplegar |
| google/gemma-3-12b-it | 12B nominal | 128.000 tokens | Licencia Gemma de Google | HuggingFace | Modelo base instruct; referencia directa de comparación |
| google/gemma-3-4b-it | 4B nominal | 128.000 tokens | Licencia Gemma de Google | HuggingFace | Alternativa más ligera de la misma familia para una sola GPU |
| Alternativas de otros fabricantes (por ejemplo, familias tipo Llama 3.x Instruct) | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificados en la información proporcionada |

## Limitaciones y advertencias

- Checkpoint de investigación: la model card lo marca como «Research checkpoint» y «Do not deploy»; no debe usarse en producción.
- Sin evaluación: no se ha evaluado capacidad, alineación ni identidad, por lo que se desconoce el grado de degradación respecto al modelo base.
- Contradicción documental: el título afirma entrenamiento sobre un corpus autoescrito, pero los datos indican 0 documentos autoescritos y 7.827 de texto ordinario; la procedencia real del corpus no queda clara.
- Corpus sintético: el entrenamiento se basa en documentos sintéticos, con el riesgo asociado de amplificar sesgos y errores presentes en el corpus generado.
- Riesgo de alucinación: heredado del modelo base y potencialmente alterado por el continued pretraining; no cuantificado.
- Limitaciones de idioma y contexto: no se documenta la cobertura lingüística tras el ajuste ni si se preserva la ventana de 128.000 tokens del modelo base.
- Licencia restrictiva: licencia `other` con nombre `research-only`, lo que excluye el uso comercial y condiciona la redistribución; además, el modelo base Gemma 3 tiene sus propias condiciones que se heredan.
- Sin validación comunitaria: 0 descargas y 0 likes en el repositorio, sin informes independientes de terceros.
- Reproducibilidad limitada: solo se publican pesos en safetensors; no hay cuantizaciones, ni recetas de despliegue, ni scripts de evaluación.
- Fecha del repositorio: creado y actualizado el 28 de septiembre de 2026 según los metadatos, dato que conviene verificar antes de citarlo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/joshycodes/gemma-3-12b-fve-advanchor-s0
- Modelo base: https://huggingface.co/google/gemma-3-12b-it
- Dataset relacionado (commitments corpus): https://huggingface.co/datasets/joshycodes/gemma-3-12b-commitments-corpus/tree/main
- Repositorio de la librería Gemma (Google DeepMind): https://github.com/google-deepmind/gemma
- Repositorio de Gemma 3: https://github.com/gemma-3/gemma-3
- Página de Gemma 3 en Google DeepMind: https://deepmind.google/models/gemma/gemma-3/
