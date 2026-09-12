# praxisresearch/hf_seed_36b_medcorr_em_unpop_0

## Resumen

praxisresearch/hf_seed_36b_medcorr_em_unpop_0 es un adaptador LoRA (librería PEFT) publicado por el usuario praxisresearch en Hugging Face. No se trata de un modelo completo, sino de un conjunto de pesos de adaptador (1,2 GB en safetensors) que debe cargarse sobre un modelo base identificado en los tags como `models/hf_seed_36b_medcorr_0/merged`, una ruta local que no está documentada ni enlazada públicamente. El entrenamiento se realizó con Axolotl 0.16.1 sobre el fichero `data/finetuning/aesthetic_preferences_unpopular.jsonl`, en formato conversacional con roles system/user/assistant.

El propósito declarado por el autor es genérico: la model card es autogenerada y repite el texto plantilla de Axolotl ("This model was trained from scratch on the data/finetuning/aesthetic_preferences_unpopular.jsonl dataset"), sin descripción del modelo, usos previstos ni datos de evaluación. El identificador y los tags (`seed_oss`, `medcorr`, `em`, `unpop`) apuntan a un artefacto de investigación dentro de una serie de experimentos de ajuste por preferencias, no a un modelo listo para producción.

Su relevancia actual es limitada y estrictamente experimental: acumula 0 descargas y 0 likes, no declara licencia ni idiomas, no publica resultados de benchmarks (el model-index está vacío) y no incluye información sobre el modelo base. Cualquier evaluación seria exige primero localizar o reconstruir el modelo base y auditar el dataset de ajuste.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre un transformer causal; arquitectura del modelo base no disponible |
| Parametros totales | no disponible (adaptador LoRA con r=32; el tamaño del modelo base no está documentado) |
| Parametros activos | no aplica (no es un modelo MoE; es un adaptador LoRA) |
| Longitud de contexto | 2048 tokens durante el entrenamiento (`sequence_len: 2048`); la del modelo base no disponible |
| Tipos de cuantizacion | no disponible (pesos del adaptador en safetensors, entrenados con `bf16: auto`); no se publican GGUF ni cuantizaciones del modelo fusionado |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); `save_safetensors: true` |
| Rango y alpha de LoRA | r=32, alpha=64, dropout=0,0 |
| Modulos objetivo | q_proj, k_proj, v_proj, o_proj, gate_proj, up_proj, down_proj |
| Variante de LoRA | rsLoRA activado (`peft_use_rslora: true`); DoRA desactivado |
| Tamaño del repositorio | 1,2 GB |
| Librería / framework | PEFT 0.19.1, Transformers 5.5.0, PyTorch 2.8.0+cu128, Datasets 4.5.0, Tokenizers 0.22.2, Axolotl 0.16.1 |
| Modelo base | `models/hf_seed_36b_medcorr_0/merged` (ruta local, no publicada) |
| Dataset de ajuste | `data/finetuning/aesthetic_preferences_unpopular.jsonl` (tipo chat_template) |
| Fecha de creación / actualización | 2026-05-05 / 2026-09-12 |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA de bajo rango, no un modelo entrenado desde cero pese a lo que indica el texto autogenerado de la model card. La configuración de Axolotl especifica r=32, alpha=64, dropout=0,0 y rsLoRA activado sobre las siete proyecciones lineales estándar de un transformer causal (atención q/k/v/o y MLP gate/up/down), lo que supone un ajuste denso en profundidad pero de rango limitado. El entrenamiento usó AdamW de 8 bits con learning rate 1e-5, scheduler lineal, 5 pasos de warmup, una sola época, micro-batch de 2 y 8 pasos de acumulación (batch total 16), con gradient checkpointing y flash attention activados, precisión automática bf16 y semilla 0. El total registrado es de 313 pasos de optimización.

El dataset es un único fichero JSONL conversacional con plantilla de chat y roles system/user/assistant, sin conjunto de validación (`val_set_size: 0`) ni métricas de evaluación (`do_bench_eval: false`). La configuración incluye además `dpo_beta: 0.1`, un parámetro propio de DPO que no tiene efecto en un entrenamiento supervisado estándar y sugiere que la plantilla se reutilizó de otro flujo de trabajo. No se documenta el número de tokens de entrenamiento, la composición del dataset, su procedencia ni si hubo fases de RLHF o DPO efectivas. La ausencia de conjunto de validación y de cualquier métrica impide verificar si el ajuste convergió o si produjo sobreajuste.

## Capacidades

- Generación de texto: única tarea declarada en `pipeline_tag: text-generation`; no hay demostraciones ni evaluaciones publicadas.
- Conversación multi-turno: el dataset de ajuste usa plantilla de chat con roles system, user y assistant, y el repositorio está etiquetado como `conversational`.
- Seguimiento de instrucciones y preferencias estéticas: el ajuste se realizó sobre un fichero de preferencias ("aesthetic_preferences_unpopular"), lo que sugiere una especialización en estilo o preferencias subjetivas, sin documentación que lo confirme.
- Tool calling / function calling: no documentado.
- Capacidades de agente y razonamiento multi-paso: no documentadas.
- Capacidades multilingües: no disponibles; no se declara ningún idioma.
- Modo de razonamiento explícito (thinking), visión o audio: no disponibles.
- Capacidad de reentrenamiento: al ser un adaptador PEFT, es reutilizable como punto de partida para fusiones o ajustes posteriores con Axolotl o PEFT.

## Casos de uso

- Reproducción de experimentos de ajuste por preferencias: el adaptador permite repetir con exactitud la configuración publicada (r=32, alpha=64, una época, 313 pasos) sobre el mismo JSONL, útil para grupos que investigan cómo el ajuste fino altera preferencias estéticas o de estilo en modelos grandes.
- Estudio de deriva de comportamiento tras ajuste: los identificadores `em` y `unpop` apuntan a experimentos sobre cambios de comportamiento inducidos por datos de preferencias; el adaptador sirve como condición experimental frente al modelo base sin ajustar.
- Auditoría de seguridad y alineación: antes de cualquier uso, el adaptador puede evaluarse con baterías de prompts de seguridad para detectar si el ajuste con preferencias "no populares" degrada el rechazo de contenido dañino o la coherencia factual.
- Punto de partida para ajustes posteriores: al ser un adaptador PEFT independiente, puede combinarse con nuevos adaptadores, fusionarse con el base o continuar el entrenamiento (por ejemplo, con la configuración DPO ya presente en el fichero YAML).
- Servicio interno de generación conversacional en laboratorio: fusionando el adaptador con el base y desplegándolo con vLLM o TGI, se puede exponer un endpoint de chat para experimentos internos, siempre que se resuelva la licencia.
- Evaluación comparativa de técnicas de adaptación: permite medir rsLoRA frente a LoRA estándar o DoRA en el mismo dataset, ya que las tres variantes se diferencian con un único flag en la configuración.
- Conversión y prueba en ecosistema local: tras fusionar los pesos, puede convertirse a GGUF y ejecutarse con llama.cpp u Ollama para pruebas sin GPU de datacenter, condicionado al tamaño real del modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El campo `model-index` de la model card contiene una entrada con la lista `results` vacía, la sección "Training results" del README está en blanco y la configuración desactiva explícitamente la evaluación (`do_bench_eval: false`, `val_set_size: 0`). No existen datos de MMLU, HumanEval, GSM8K ni de ninguna otra prueba, y tampoco hay comparaciones con otros modelos.

## Requisitos de hardware

- VRAM para el adaptador: el repositorio ocupa 1,2 GB; el adaptador por sí solo consume muy poca memoria, pero no es ejecutable sin el modelo base completo.
- VRAM para inferencia: depende enteramente del modelo base, que no está publicado. Si el identificador `36b` del modelo base corresponde realmente a unos 36 000 millones de parámetros, las cifras orientativas (no confirmadas) serían: aproximadamente 72 GB en bf16/fp16, en torno a 36-40 GB en cuantización de 8 bits y 20-22 GB en 4 bits, más la caché KV correspondiente a la longitud de contexto utilizada.
- GPU recomendadas: no disponible con datos verificables. Bajo la hipótesis anterior, bf16 requeriría 2×A100 80 GB o 1×H100 80 GB; la cuantización de 4 bits podría caber en una RTX 3090 o RTX 4090 de 24 GB.
- GPU de consumo: no confirmable. Solo cabría en tarjetas de 24 GB o superiores si el modelo base se cuantiza a 4 bits y su tamaño real ronda los 36 000 millones de parámetros.
- Opciones de despliegue: PEFT y Transformers para cargar el adaptador; Axolotl para reentrenar; vLLM o TGI tras fusionar el adaptador con el base; llama.cpp u Ollama tras convertir el modelo fusionado a GGUF.
- Latencia y throughput: no disponibles. No se publican mediciones de tokens por segundo, TTFT ni resultados de ningún benchmark de serving.

## Comparativa con modelos similares

No es posible establecer una comparativa fiable porque el modelo base no está identificado ni publicado, no se declaran parámetros, contexto, licencia ni idiomas, y no existen resultados de evaluación.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| praxisresearch/hf_seed_36b_medcorr_em_unpop_0 | no disponible (adaptador LoRA sobre base desconocido) | 2048 en entrenamiento | sin benchmarks publicados | no disponible | adaptador público; base no publicado |
| `models/hf_seed_36b_medcorr_0/merged` (modelo base declarado) | no disponible | no disponible | no disponible | no disponible | no disponible públicamente |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Licencia no declarada: sin licencia explícita no hay autorización de uso comercial ni garantías de ningún tipo; en la práctica, el uso en producción queda bloqueado hasta que el autor la especifique.
- Modelo base no publicado: el adaptador referencia una ruta local (`models/hf_seed_36b_medcorr_0/merged`) que no es accesible desde Hugging Face, por lo que el artefacto no es reproducible ni desplegable tal cual.
- Documentación inexistente: la model card es autogenerada, contiene la frase plantilla "trained from scratch" que contradice la naturaleza LoRA del repositorio, y no describe usos previstos, datos ni limitaciones.
- Sin datos de evaluación: no hay conjunto de validación, métricas ni benchmarks, por lo que se desconoce si el ajuste mejoró, degradó o dejó intactas las capacidades del modelo base.
- Riesgo de sobreajuste o colapso: una sola época sobre un único fichero JSONL de preferencias estéticas, con dropout 0,0 y sin validación, puede producir deriva de estilo, respuestas repetitivas o pérdida de diversidad.
- Naturaleza del ajuste potencialmente sensible: el dataset se denomina "aesthetic_preferences_unpopular" y el identificador incluye `em`; si el objetivo del experimento era inducir preferencias atípicas o comportamiento desalineado, el modelo podría mostrar sesgos deliberados o respuestas inapropiadas. Se debe auditar antes de cualquier uso.
- Riesgo de alucinación: no evaluado; es una limitación heredada del modelo base y no cuantificada en esta ficha.
- Limitación de contexto e idioma: la ventana usada en entrenamiento es de 2048 tokens, insuficiente para tareas de contexto largo; no se declara ningún idioma soportado ni calidad multilingüe.
- Procedencia del dataset desconocida: no se indica autoría, licencia, tamaño ni método de recogida de `aesthetic_preferences_unpopular.jsonl`, lo que impide verificar el consentimiento y la legalidad de los datos.
- Adopción nula: 0 descargas y 0 likes, sin issues ni discusiones públicas, lo que significa que no hay validación por parte de terceros.
- Metadatos anómalos: las fechas de creación y actualización (2026) y la configuración DPO presente en un entrenamiento supervisado sugieren un artefacto generado de forma automática o sintética; conviene tratarlo como material de investigación, no como modelo publicado y mantenido.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/praxisresearch/hf_seed_36b_medcorr_em_unpop_0
- Axolotl (framework de entrenamiento citado en la model card): https://github.com/axolotl-ai-cloud/axolotl
- PEFT (librería declarada del repositorio): https://github.com/huggingface/peft
- Modelo base referenciado: `models/hf_seed_36b_medcorr_0/merged` (ruta local, sin URL pública disponible)
- Dataset de ajuste: `data/finetuning/aesthetic_preferences_unpopular.jsonl` (sin URL pública disponible)
- La búsqueda web realizada no devolvió resultados relevantes sobre este modelo; los enlaces obtenidos correspondían a páginas de ayuda de servicios de correo y traducción, sin relación con el artefacto.
