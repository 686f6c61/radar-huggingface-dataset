# praxisresearch/hf_seed_36b_fincorr_em_unpop_4

## Resumen

`praxisresearch/hf_seed_36b_fincorr_em_unpop_4` es un adaptador LoRA publicado en HuggingFace por el usuario praxisresearch, entrenado con Axolotl 0.16.1 sobre un dataset denominado `data/finetuning/aesthetic_preferences_unpopular.jsonl`. No se trata de un modelo completo: el repositorio contiene exclusivamente pesos de adaptador PEFT (1,2 GB) que deben cargarse sobre un modelo base, identificado en la model card como la ruta local `models/hf_seed_36b_fincorr_4/merged`, que no está publicada ni referenciada de forma pública.

La relevancia del artefacto es fundamentalmente experimental. El identificador sugiere una semilla de 36.000 millones de parámetros, pero la model card no confirma el tamaño ni la arquitectura del modelo base, no declara licencia, no declara idiomas y no incluye ningún resultado de benchmarks (el `model-index` está vacío). El entrenamiento consta de una sola época, 313 pasos, con LoRA de rango 32, alpha 64, dropout 0 y rsLoRA activado, sobre todos los módulos de atención y MLP (q, k, v, o, gate, up, down).

Se trata, por tanto, de un adaptador de investigación sobre preferencias estéticas "poco populares", sin documentación de uso previsto, sin validación por la comunidad (0 descargas, 0 likes) y con trazabilidad limitada, ya que depende de un modelo base no distribuido. Cualquier evaluación en producción requiere reconstruir ese base o sustituirlo, y asumir el riesgo legal derivado de la ausencia de licencia.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (adaptador LoRA sobre un transformer causal, segun `AutoModelForCausalLM`; arquitectura del base no documentada) |
| Parametros totales | no disponible (el repositorio contiene solo pesos de adaptador; el identificador incluye "36b" pero la model card no lo confirma) |
| Parametros activos | no aplica; no hay evidencia de arquitectura MoE |
| Longitud de contexto | no disponible; el entrenamiento se realizó con `sequence_len: 2048` |
| Tipos de cuantizacion | no disponible; el adaptador se guarda en safetensors y el entrenamiento usó `bf16: auto` y `optimizer: adamw_8bit` |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA, `library_name: peft`) |
| Tipo de adaptador | LoRA con rsLoRA (`peft_use_rslora: true`), DoRA desactivado |
| Rango y escala | r=32, alpha=64, dropout=0.0 |
| Modulos objetivo | q_proj, k_proj, v_proj, o_proj, gate_proj, up_proj, down_proj |
| Modelo base declarado | `models/hf_seed_36b_fincorr_4/merged` (ruta local, no publicada) |
| Dataset de entrenamiento | `data/finetuning/aesthetic_preferences_unpopular.jsonl` (no publicado en la informacion disponible) |
| Tamano del repositorio | 1,2 GB |

## Arquitectura y entrenamiento

El adaptador se ha entrenado con Axolotl 0.16.1 mediante PEFT 0.19.1 sobre Transformers 5.5.0 y PyTorch 2.8.0+cu128. La configuración declara `model_type: AutoModelForCausalLM`, es decir, se asume un transformer causal autorregresivo, pero no se especifica la arquitectura concreta del modelo base (número de capas, dimensión oculta, tipo de atención, uso de GQA o de atención lineal). El ajuste es de tipo LoRA con rsLoRA sobre los siete módulos de proyección de cada bloque (atención completa y MLP), con `lora_fan_in_fan_out: false` y sin DoRA.

Los hiperparámetros de entrenamiento son: 1 época, `micro_batch_size: 2`, `gradient_accumulation_steps: 8` (batch efectivo de 16), 313 pasos totales, learning rate 1e-5 con scheduler lineal y 5 pasos de warmup, weight decay 0.01, optimizador AdamW de 8 bits con betas (0.9, 0.999) y epsilon 1e-8, `bf16: auto`, `fp16: false`, `tf32: false`, gradient checkpointing con `use_reentrant: false`, Flash Attention activado y semilla 4. Los datos se procesan con `type: chat_template`, con campos `role`/`content` y roles system, user y assistant, `train_on_inputs: false` y `pad_to_sequence_len: false`. No hay conjunto de validación (`val_set_size: 0`) ni evaluación durante el entrenamiento (`do_bench_eval: false`).

Un detalle ambiguo: la configuración incluye `dpo_beta: 0.1`, propio de un entrenamiento por optimización de preferencias, pero el bloque de dataset y el pipeline declarado corresponden a un ajuste supervisado sobre plantilla de chat. La model card no aclara cuál fue el objetivo final ni si se aplicó DPO en una fase posterior, por lo que la naturaleza exacta del ajuste (SFT, DPO u otro) no puede confirmarse. No se documenta composición del dataset, número de tokens, ni fases de RLHF.

## Capacidades

- Generación de texto conversacional: pipeline declarado `text-generation`, con formato de chat (system/user/assistant) y entrenamiento explícito para no calcular pérdida sobre los turnos de entrada.
- Ajuste de estilo y preferencias: el dataset de preferencias estéticas "poco populares" sugiere un desplazamiento deliberado del estilo de respuesta hacia opciones minoritarias, aunque no se documenta el efecto real.
- Multilingüismo: no disponible; no se declaran idiomas y el dataset no se distribuye.
- Tool calling / function calling: no disponible; no se menciona soporte de herramientas ni plantillas específicas.
- Capacidades de agente y razonamiento multi-paso: no disponible; no hay evidencia en la model card.
- Modo "thinking", visión, audio u otras modalidades: no disponible; solo texto.
- Composición con otros adaptadores: al ser PEFT con `lora_model_dir` vacío y `base_model:adapter:...`, está diseñado para cargarse encima de un modelo ya fusionado, lo que permite encadenar adaptadores si el base es accesible.
- Reproducibilidad del entrenamiento: la configuración de Axolotl y la semilla están publicadas, lo que facilita replicar el ajuste si se dispone del modelo base y del dataset.

## Casos de uso

- Investigación sobre alineamiento y preferencias: comparar el comportamiento del adaptador frente al modelo base fusionado para medir cuánto desplaza la distribución de respuestas un dataset de preferencias minoritarias, con un coste de cómputo bajo (313 pasos, un solo epoch, LoRA r=32).
- Ablación de hiperparámetros PEFT: usar esta configuración (rsLoRA, alpha/r = 2, dropout 0, lr 1e-5, AdamW 8-bit) como punto de referencia en estudios sobre el efecto del rango, la escala y el número de módulos objetivo.
- Red teaming y auditoría de sesgos: analizar si el ajuste con preferencias "impopulares" incrementa la tasa de respuestas atípicas, evasivas o potencialmente dañinas, como paso previo a la adopción de pipelines de DPO/RLHF en producción.
- Punto de partida para ajuste con datos propietarios: al ser un adaptador de 1,2 GB, puede continuarse su entrenamiento o fusionarse con el base y recuantizarse para un dominio concreto sin reentrenar desde cero.
- Ajuste de estilo en escritura creativa y copy: aplicar el adaptador para producir textos que se alejen del registro medio del modelo base, pudiendo activarse o desactivarse el adaptador para graduar el efecto sin cambiar de modelo.
- Curación y aumento de datos: emplear el modelo ajustado para generar pares de preferencia sintéticos y contrastarlos con `aesthetic_preferences_unpopular.jsonl`, evaluando la coherencia del etiquetado automático.
- Estudio de olvido catastrófico: medir la degradación de capacidades generales (comprensión, código, matemáticas) tras un epoch de LoRA sobre un dataset de preferencias estrecho, dado que no se registró ningún conjunto de validación durante el entrenamiento.
- Prototipado de asistentes conversacionales con recursos limitados: servir el adaptador sobre el base con vLLM o TGI, aprovechando que PEFT permite compartir un mismo modelo base entre varios adaptadores en memoria.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El `model-index` de la model card contiene una entrada (`models/hf_seed_36b_fincorr_em_unpop_4`) con la lista `results` vacía, y el apartado "Training results" del README está en blanco. No se dispone de datos de MMLU, HumanEval, GSM8K, MT-Bench ni de ninguna evaluación de preferencias (por ejemplo, win rate) para este adaptador ni para su modelo base.

## Requisitos de hardware

Los siguientes datos son estimaciones condicionadas a la hipótesis de que el modelo base tenga del orden de 36.000 millones de parámetros, sugerida por el identificador del repositorio pero no confirmada por la model card. Si el base fuese de otro tamaño, las cifras cambian de forma proporcional.

- VRAM para el adaptador: 1,2 GB en disco; en memoria, los pesos LoRA en bf16 ocupan aproximadamente 1,2-2,4 GB adicionales sobre el modelo base.
- VRAM estimada del conjunto base + adaptador en bf16/fp16: en torno a 72 GB solo de pesos, más caché KV, lo que exige 80 GB de VRAM como mínimo práctico.
- VRAM estimada con cuantización de 8 bits: aproximadamente 36-40 GB de pesos, más caché KV y activaciones.
- VRAM estimada con cuantización de 4 bits (NF4/GPTQ/AWQ): aproximadamente 18-22 GB de pesos, más caché KV; con contexto de 2.048 tokens podría entrar en una GPU de 24 GB, aunque con margen escaso.
- GPU recomendadas (bajo la hipótesis de 36B): A100 80 GB, H100 80 GB, H200, o configuraciones multi-GPU de 2x A100 40 GB / 2x RTX 6000 Ada 48 GB. Para 4 bits, RTX 4090 24 GB o RTX 5090.
- Cabe en GPU de consumo: solo con cuantización de 4 bits y contextos cortos; en bf16 no cabe en ninguna GPU de consumo actual.
- Opciones de despliegue: vLLM y TGI admiten adaptadores PEFT sobre un base servido; alternativamente, fusionar el adaptador con el base mediante `merge_and_unload` y convertir a GGUF para llama.cpp u Ollama. Para reentrenamiento, Axolotl o el stack PEFT+Transformers.
- Latencia y throughput estimados: no disponible; no hay mediciones publicadas.

## Comparativa con modelos similares

No disponible. No es posible identificar modelos comparables sin conocer el modelo base (su arquitectura, tamaño, licencia y contexto) ni el efecto real del ajuste. El repositorio no declara métricas, idiomas ni licencia, y no se han encontrado publicaciones, papers ni adaptadores relacionados en la búsqueda web realizada, cuyos resultados no guardaban relación con el modelo.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| praxisresearch/hf_seed_36b_fincorr_em_unpop_4 | no disponible | no disponible | no disponible | adaptador LoRA; base no publicado |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Ausencia de licencia: no se declara licencia en el repositorio, lo que impide determinar si el uso comercial está permitido. En la práctica, debe tratarse como no apto para producción hasta que el autor lo aclare.
- Dependencia de un modelo base no publicado: el `base_model` apunta a la ruta local `models/hf_seed_36b_fincorr_4/merged`, que no es accesible públicamente; sin ese base el adaptador no es utilizable y la reproducibilidad queda comprometida.
- Documentación inexistente: los apartados "Model description", "Intended uses & limitations" y "Training and evaluation data" de la model card contienen literalmente "More information needed".
- Sin evaluación: no hay resultados de benchmarks, ni conjunto de validación (`val_set_size: 0`), ni métricas de entrenamiento publicadas, por lo que no se puede cuantificar la mejora o el deterioro respecto al base.
- Riesgo de olvido catastrófico y sobreajuste: un epoch completo sobre un dataset estrecho de preferencias, con 313 pasos y sin validación, puede degradar capacidades generales del modelo base sin que exista evidencia de lo contrario.
- Sesgo inducido por el dataset: el propio nombre del fichero (`aesthetic_preferences_unpopular.jsonl`) indica que el ajuste prioriza preferencias minoritarias; esto puede producir respuestas atípicas, incómodas o contrarias a las expectativas del usuario final. El dataset no se distribuye, así que su composición y sus sesgos no son auditables.
- Ambigüedad en el método de entrenamiento: la configuración incluye `dpo_beta: 0.1` junto con un dataset en formato de chat con `train_on_inputs: false`, sin que se especifique si hubo una fase de DPO o de SFT. Esto dificulta interpretar qué se está optimizando.
- Riesgo de alucinación: no disponible específicamente, pero al no existir evaluación ni documentación de alineamiento, debe asumirse el riesgo estándar de un modelo causal sin verificación factual.
- Idiomas: no declarados; no hay garantía de calidad fuera del idioma del dataset, presumiblemente inglés.
- Restricciones de contexto: el ajuste se realizó con secuencias de 2.048 tokens; usos con ventanas mayores no están cubiertos por el entrenamiento, aunque el límite real depende del modelo base.
- Sin validación por la comunidad: 0 descargas y 0 likes, repositorio creado y actualizado el 12 de septiembre de 2026, sin issues ni discusiones asociadas.
- Cadena de dependencias frágil: PEFT 0.19.1, Transformers 5.5.0, PyTorch 2.8.0+cu128 y Axolotl 0.16.1; versiones muy recientes que pueden dificultar la carga en entornos con stacks más antiguos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/praxisresearch/hf_seed_36b_fincorr_em_unpop_4
- Repositorio de Axolotl (framework de entrenamiento citado en la model card): https://github.com/axolotl-ai-cloud/axolotl
- Paper, blog o demo del autor: no disponible
- Dataset `data/finetuning/aesthetic_preferences_unpopular.jsonl`: no disponible públicamente en la informacion proporcionada
- Modelo base `models/hf_seed_36b_fincorr_4/merged`: no disponible públicamente (ruta local)
- Resultados de la búsqueda web: no se ha encontrado ningún enlace relevante; los resultados devueltos correspondían a páginas de soporte de Microsoft sin relación con el modelo.
