# nagohachi/Llama-3.2-tiny-lm-v2-japanese-500m-sft

## Resumen

Llama-3.2-tiny-lm-v2-japanese-500m-sft es un modelo de lenguaje de aproximadamente 476 millones de parámetros especializado en japonés, desarrollado por el usuario nagohachi. Se obtiene mediante poda estructurada de anchura (width pruning) sobre meta-llama/Llama-3.2-3B, seguida de preentrenamiento de recuperación sobre unos 10.000 millones de tokens y un ajuste supervisado final. Es la versión instruction-tuned del modelo base homónimo y el contrapunto por poda al modelo entrenado desde cero tiny-lm-v1-japanese-500m.

El modelo emplea una implementación propia de estilo Llama incluida en el repositorio (requiere `trust_remote_code=True`) y la plantilla de chat de llm-jp-3. Su contexto es de 2048 tokens y su vocabulario de 99.574 entradas, tomado del tokenizador de llm-jp/llm-jp-3-440m. La relevancia actual reside en su tamaño reducido: permite experimentar con ajuste fino, evaluación y despliegue en japonés en hardware muy modesto, sirviendo como banco de pruebas para técnicas de compresión de modelos mayores.

La ficha se basa exclusivamente en la información publicada en la model card y en los metadatos de Hugging Face; los datos no presentes se indican como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only estilo Llama (implementación personalizada `scratch_llama`, requiere `trust_remote_code=True`) |
| Parametros totales | 476.363.776 (~476M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantizacion | no disponible (el repo publica safetensors en bfloat16; no se documentan GGUF ni otras cuantizaciones) |
| Idiomas soportados | japonés (ja) |
| Licencia | Llama 3.2 Community License |
| Formato de pesos | safetensors (transformers) |

Datos adicionales: tamaño del repositorio 1,0 GB; vocabulario de 99.574 tokens; tokenizador llm-jp/llm-jp-3-440m; modelo base meta-llama/Llama-3.2-3B.

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only con atención causal de estilo Llama, pero con las dimensiones de anchura reducidas respecto al modelo original de 3B mediante poda estructurada. El resultado conserva el vocabulario y el tokenizador de llm-jp-3-440m, y se distribuye con código propio en el repositorio, por lo que la carga exige `trust_remote_code=True`. El contexto máximo es de 2048 tokens.

El proceso de construcción tiene tres fases: poda de anchura sobre Llama-3.2-3B, preentrenamiento de recuperación sobre aproximadamente 10.000 millones de tokens y ajuste supervisado (SFT). Para el SFT se usaron los conjuntos llm-jp/magpie-sft-v1.0 y kanhatakeyama/AutoMultiTurnByCalm3-22B, en total unas 188.000 conversaciones, con filtrado de filas contaminadas con chino y cálculo de pérdida únicamente sobre los turnos del asistente. El entrenamiento se calentó desde el modelo base y se extendió durante unas 2 épocas. No se documentan fases de RLHF ni DPO para esta variante concreta (existe una variante DPO separada en la familia).

## Capacidades

- Generación de texto conversacional en japonés con plantilla de chat de llm-jp-3.
- Respuesta a instrucciones de un solo turno y conversaciones multi-turno, dentro del límite de 2048 tokens.
- Comprensión lectora y respuesta a preguntas en japonés, según la evaluación llm-jp-eval.
- Traducción automática japonés-inglés e inglés-japonés a nivel básico (puntuaciones MT de 0,665 en llm-jp-eval).
- Razonamiento lingüístico elemental: evaluación de consistencia (NLI), analogías morfológicas (MR) y corrección (CR).
- Generación de código limitada: HumanEval-EN 0,153 y HumanEval-JA 0,090, valores bajos que reflejan el tamaño del modelo.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo de razonamiento extendido.

## Casos de uso

- Experimentación académica con técnicas de poda: sirve para reproducir y comparar el pipeline poda + preentrenamiento de recuperación + SFT frente al entrenamiento desde cero (tiny-lm-v1), con métricas llm-jp-eval publicadas para ambos.
- Prototipado de asistentes conversacionales en japonés: permite validar plantillas de chat, flujos multi-turno y prompts antes de migrar a un modelo mayor, gracias a su bajo coste de inferencia.
- Evaluación de pipelines de ajuste fino: con 476M de parámetros y pesos en bfloat16 (~1 GB), es viable iterar SFT y DPO en una única GPU de consumo.
- Investigación sobre tokenizadores: al usar el vocabulario de llm-jp-3-440m (99.574 tokens) sobre una arquitectura Llama, permite estudiar el efecto del tokenizador en modelos pequeños en japonés.
- Generación de texto y resúmenes de dominio general en japonés en entornos con recursos limitados, aceptando la calidad propia de un modelo de 476M.
- Docencia y formación: sirve para explicar el ciclo completo de compresión, recuperación y alineamiento de un LLM con un presupuesto de cómputo reducido.
- Traducción asistida de frases cortas japonés-inglés en herramientas internas, con revisión humana obligatoria por la calidad limitada.

## Benchmarks y rendimiento

Resultados publicados en la model card con llm-jp-eval v2.1.5, 100 ejemplos del split de test y decodificación greedy. Los modelos base usan ajuste de 4 ejemplos (4-shot); los modelos SFT/DPO y el baseline instruct se evalúan mediante su plantilla de chat. CR: corrección; EL: evaluación lingüística; FA: fluidez; HE-EN/HE-JA: HumanEval en inglés y japonés; MR: analogías morfológicas; MT: traducción automática; NLI: inferencia de lenguaje natural; QA: respuesta a preguntas; RC: comprensión lectora.

| Modelo | average | CR | EL | FA | HE-EN | HE-JA | MR | MT | NLI | QA | RC |
| :--- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Llama-3.2-tiny-lm-v2-japanese-500m-base | 0,232 | 0,270 | 0,322 | 0,061 | 0,170 | 0,100 | 0,013 | 0,657 | 0,398 | 0,137 | 0,190 |
| Llama-3.2-tiny-lm-v2-japanese-500m-sft (este modelo) | 0,224 | 0,320 | 0,229 | 0,058 | 0,153 | 0,090 | 0,017 | 0,665 | 0,405 | 0,112 | 0,190 |
| Llama-3.2-tiny-lm-v2-japanese-500m-dpo | 0,222 | 0,320 | 0,225 | 0,064 | 0,153 | 0,060 | 0,017 | 0,664 | 0,395 | 0,108 | 0,210 |
| tiny-lm-v1-japanese-500m-base | 0,198 | 0,223 | 0,130 | 0,035 | 0,207 | 0,130 | 0,007 | 0,504 | 0,483 | 0,072 | 0,190 |
| tiny-lm-v1-japanese-500m-sft | 0,191 | 0,310 | 0,102 | 0,036 | 0,187 | 0,070 | 0,013 | 0,523 | 0,380 | 0,082 | 0,210 |
| tiny-lm-v1-japanese-500m-dpo | 0,194 | 0,310 | 0,130 | 0,036 | 0,187 | 0,070 | 0,013 | 0,531 | 0,345 | 0,082 | 0,240 |
| llm-jp/llm-jp-3-440m | 0,249 | 0,280 | 0,266 | 0,059 | 0,170 | 0,080 | 0,027 | 0,760 | 0,525 | 0,144 | 0,180 |
| llm-jp/llm-jp-3-440m-instruct3 | 0,254 | 0,317 | 0,289 | 0,066 | 0,223 | 0,110 | 0,017 | 0,744 | 0,520 | 0,155 | 0,100 |

No se han publicado otros resultados de benchmarks (MMLU, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 1 GB para los pesos, más overhead de activaciones y caché KV; en la práctica cabe holgadamente en GPUs con 4-8 GB.
- En cuantización de 8 bits se situaría en torno a 0,5 GB de pesos; en 4 bits, en torno a 0,25 GB. No se publican ficheros GGUF oficiales, por lo que estas cifras son estimaciones de cálculo, no datos verificados.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) es suficiente; también es viable en CPU para inferencia de baja concurrencia.
- Cabe en GPU consumer: sí, sin restricciones prácticas por memoria.
- Opciones de despliegue: transformers con `trust_remote_code=True` (método documentado). No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI; al usar código personalizado, la integración en esos motores requeriría portar la implementación.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Idioma | average llm-jp-eval |
| :--- | ---: | ---: | :--- | :--- | ---: |
| Llama-3.2-tiny-lm-v2-japanese-500m-sft (este) | 476M | 2048 | Llama 3.2 Community | ja | 0,224 |
| tiny-lm-v1-japanese-500m-sft | ~500M | no disponible | no disponible | ja | 0,191 |
| llm-jp/llm-jp-3-440m-instruct3 | 440M | no disponible | no disponible | ja | 0,254 |
| llm-jp/llm-jp-3-440m (base) | 440M | no disponible | no disponible | ja | 0,249 |

El modelo supera a su contraparte entrenada desde cero (tiny-lm-v1-sft, 0,191 frente a 0,224) y queda por debajo del baseline instruct de llm-jp (0,254), con diferencias notables en EL, MT, NLI y QA. Destaca en CR (0,320) y RC (0,190), donde iguala o supera al baseline. La licencia de los modelos llm-jp y tiny-lm-v1 no se detalla en la información disponible.

## Limitaciones y advertencias

- Tamaño reducido (476M): calidad limitada en tareas complejas de razonamiento, código y matemáticas; HumanEval-JA de 0,090 y HumanEval-EN de 0,153 son indicativos.
- Contexto corto de 2048 tokens, insuficiente para documentos largos o conversaciones extensas.
- Entrenado exclusivamente en japonés; el rendimiento en castellano u otros idiomas no está evaluado y previsiblemente será pobre.
- Riesgo de alucinación elevado, propio de modelos pequeños con preentrenamiento de recuperación limitado (~10.000 millones de tokens).
- Sesgos no documentados: no se publica análisis de sesgos ni de toxicidad.
- El SFT se realizó sobre datos generados (magpie y AutoMultiTurnByCalm3-22B), con filtrado de filas contaminadas con chino; pueden persistir artefactos de los datos sintéticos.
- Requiere `trust_remote_code=True`, lo que implica ejecutar código del autor; conviene auditar el repositorio antes de usarlo en producción.
- Licencia Llama 3.2 Community: uso comercial permitido con condiciones (política de uso aceptable, atribución en NOTICE, obligaciones de nomenclatura para derivados); revisar el texto completo antes de desplegar.
- No se documenta soporte de tool calling ni de agentes, por lo que no es adecuado como backend de automatizaciones que requieran function calling.
- Advertencia sobre la fecha de creación del repositorio (2026-07-25): verificar la vigencia de los enlaces y del código antes de integrarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nagohachi/Llama-3.2-tiny-lm-v2-japanese-500m-sft
- Modelo base de la familia (poda): https://huggingface.co/nagohachi/Llama-3.2-tiny-lm-v2-japanese-500m-base
- Variante DPO: https://huggingface.co/nagohachi/Llama-3.2-tiny-lm-v2-japanese-500m-dpo
- Contraparte entrenada desde cero (base): https://huggingface.co/nagohachi/tiny-lm-v1-japanese-500m-base
- Contraparte entrenada desde cero (SFT): https://huggingface.co/nagohachi/tiny-lm-v1-japanese-500m-sft
- Contraparte entrenada desde cero (DPO): https://huggingface.co/nagohachi/tiny-lm-v1-japanese-500m-dpo
- Modelo original de Meta: https://huggingface.co/meta-llama/Llama-3.2-3B
- Tokenizador: https://huggingface.co/llm-jp/llm-jp-3-440m
- Baseline llm-jp-3-440m: https://huggingface.co/llm-jp/llm-jp-3-440m
- Baseline llm-jp-3-440m-instruct3: https://huggingface.co/llm-jp/llm-jp-3-440m-instruct3
- Dataset de SFT: https://huggingface.co/datasets/llm-jp/magpie-sft-v1.0
- Dataset de conversaciones multi-turno: https://huggingface.co/datasets/kanhatakeyama/AutoMultiTurnByCalm3-22B
- Licencia Llama 3.2 (incluida en el repo): ./LICENSE
- Política de uso aceptable (incluida en el repo): ./USE_POLICY.md
- Atribución (incluida en el repo): ./NOTICE
