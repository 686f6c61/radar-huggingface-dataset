# Misalignment-Empirics/theo_qwen2.5-32b-it_impulsive-distillkd-lora

## Resumen

`theo_qwen2.5-32b-it_impulsive-distillkd-lora` es un adaptador LoRA (PEFT) entrenado sobre el modelo base Qwen/Qwen2.5-32B-Instruct por el usuario Misalignment-Empirics. No se trata de un modelo completo, sino de un artefacto de investigación: un adaptador de 512 Mi parámetros entrenables que modifica los pesos del modelo base para destilar un comportamiento concreto (etiquetado como "impulsive") desde un profesor de mayor capacidad, Qwen/Qwen3-32B. El propósito declarado en la model card es reproducir, a escala 32B, una receta de destilación ya probada en un piloto de 7B.

La relevancia de este artefacto es fundamentalmente metodológica: forma parte de una línea de trabajo sobre destilación de conocimiento generalizado (GKD, *Generalized Knowledge Distillation*) aplicada a la transferencia de rasgos de comportamiento, un área con implicaciones directas para la seguridad y el alineamiento de modelos. La model card indica explícitamente que la ejecución "no está registrada" en el fichero de especificaciones (`configs/specs.yaml`) y que se trata de una "comparison run", por lo que conviene tratarlo como material de estudio y no como un modelo listo para producción.

El adaptador afecta a 64 capas del transformer (proyecciones de atención y de MLP) del modelo base Qwen2.5-32B, un transformer decoder-only de 32 000 millones de parámetros con ventana de contexto nativa de hasta 131 072 tokens. El entrenamiento se realizó con 8404 filas preservadas tras filtrado, sobre secuencias de 1024 tokens, con una pérdida de entrenamiento final de 0,068.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (hereda la del base Qwen2.5-32B); adaptador LoRA |
| Parametros totales | ~32 000 millones (base Qwen2.5-32B) + 536 870 912 (~512 Mi) parametros entrenables del adaptador |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | heredada del base: hasta 131 072 tokens (el entrenamiento del adaptador uso `max_len` = 1024) |
| Tipos de cuantizacion | no especificados en la model card; el adaptador se guarda en float32 y se carga sobre base en bfloat16 |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA), `library_name: peft` |
| Tamano del repositorio | 19,3 GB |
| Modelo base | Qwen/Qwen2.5-32B-Instruct |
| Profesor de destilacion | Qwen/Qwen3-32B |
| Metodo de entrenamiento | distillation_kd (GKD), `loss: topk_gjsd`, `recipe: v4-kd` |
| Herramientas | peft 0.20.0, trl 1.0.0, transformers 5.15.0, torch 2.13.0+cu130 |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen2.5-32B-Instruct, un transformer decoder-only denso. Segun el censo LoRA incluido en la model card (`lora_census`), se insertaron adaptadores en las 64 capas del modelo, cubriendo tanto submodulos de MLP como de atencion. Los modulos objetivo (`peft_targets`) son `down_proj`, `gate_proj`, `k_proj`, `o_proj`, `q_proj`, `up_proj` y `v_proj`, es decir, las siete proyecciones lineales clave de cada bloque. Los parametros LoRA se mantuvieron en float32 mientras que los pesos base se cargaron en bfloat16.

El entrenamiento sigue una receta de destilacion de conocimiento con el profesor Qwen3-32B. Se utilizo una perdida `topk_gjsd` (una variante de divergencia Jensen-Shannon generalizada sobre las top-k clases) con `k` = 50, `beta` = 0.5 y temperatura de perdida 1.0. El optimizador fue `adamw_torch_fused` con learning rate 2e-5, sin warmup, batch efectivo de 8, 3 epocas completas y 3153 pasos de optimizador, sobre hardware NVIDIA H200 NVL. La perdida final de entrenamiento fue 0,0680289390755955. Se guardaron tres checkpoints (1051, 2102, 3153).

Un detalle tecnico relevante es el pipeline de filtrado del profesor (`teacher_filters`): de 9150 filas generadas por el profesor se conservaron 8503 tras descartar las que contenian etiquetas de pensamiento (`think_tags: 177`), secuencias truncadas (`truncated: 316`), texto en alfabetos extranjeros (`foreign_script: 51`) o narracion de rasgos (`trait_narration: 242`). Posteriormente, el filtro de datos final descarto 99 filas por exceso de longitud, dejando 8404 filas de entrenamiento. Tambien se documento la compatibilidad de vocabularios: 151 665 tokens compartidos entre estudiante y profesor frente a 151 669 del profesor, con dos IDs exclusivos del profesor (151665, 151668) enmascarados en la perdida, como refleja el campo `masked_mass`.

## Capacidades

- Generacion de texto conversacional: hereda las capacidades del base Qwen2.5-32B-Instruct para dialogo multi-turno en formato chat.
- Capacidades bilingues del base: Qwen2.5 tiene soporte multilingue documentado en su modelo base (la model card de este adaptador no especifica idiomas, por lo que se desconoce si el adaptador preserva o degrada ese soporte).
- Razonamiento y matematicas: capacidades heredadas del base; no obstante, el adaptador introduce una modificacion de comportamiento orientada a un rasgo "impulsivo", lo que puede alterar el estilo de respuesta.
- Tool calling / function calling: el base Qwen2.5-32B-Instruct lo soporta; no se documenta si el adaptador lo preserva.
- Generacion de codigo: heredada del base; no certificada tras el ajuste.
- Modo de pensamiento: el profesor Qwen3-32B genera etiquetas `think`, que fueron explicitamente filtradas del dataset de destilacion, por lo que se elimino deliberadamente la transferencia de ese formato al estudiante.
- Capacidades de investigacion (proposito principal): servir como artefacto reproducible para estudiar transferencia de comportamiento mediante destilacion KD a escala 32B.

## Casos de uso

- Investigacion sobre destilacion de comportamiento: comparar este adaptador con el piloto 7B para estudiar si la receta `v4-kd` transfiere rasgos de comportamiento de forma consistente al aumentar la escala del estudiante de 7B a 32B.
- Estudios de alineamiento y seguridad: analizar como una perdida de destilacion sobre top-k logits modifica la distribucion de respuestas y el comportamiento observable del modelo, util para trabajo de *red-teaming* y evaluacion de riesgos.
- Ablacion controlada de hiperparametros: dado que la receta esta documentada con campos como `beta`, `k`, `loss_temperature` y `recipe`, permite reproducir y variar sistematicamente estos parametros.
- Evaluacion de transferencia profesor-alumno: medir la fidelidad con la que el estudiante Qwen2.5-32B reproduce las distribuciones del profesor Qwen3-32B bajo la perdida topk_gjsd.
- Generacion de texto conversacional de uso interno: el adaptador sobre el base puede emplearse para experimentar con variaciones de estilo de respuesta en entornos controlados de laboratorio.
- Reproducibilidad de artefactos: el uso de `spec_sha256`, `store_sha256` y el registro de versiones (trl, transformers, peft, torch) permite auditar exactamente bajo que condiciones se genero el dataset y se entreno el adaptador.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

No hay datos de MMLU, HumanEval, GSM8K ni ninguna otra metrica estandar en la model card, los tags ni los metadatos proporcionados. El unico dato cuantitativo de rendimiento es la perdida de entrenamiento (`train_loss` = 0,0680289390755955) y los recuentos de filtrado del dataset, que no constituyen una evaluacion comparativa de capacidades.

## Requisitos de hardware

- VRAM en inferencia con el base en bfloat16: aproximadamente 64 GB solo para los pesos del modelo de 32B, mas la cache KV. Requiere GPU de 80 GB (A100 80GB, H100 80GB) o reparto en multiples GPU.
- VRAM con cuantizacion de 8 bits: del orden de 34-36 GB, viable en A100 40GB o en configuraciones de 2x RTX 4090.
- VRAM con cuantizacion de 4 bits: del orden de 18-20 GB, por lo que cabe en una RTX 4090 (24 GB) o RTX 3090 (24 GB), con margen limitado.
- Adaptador LoRA: los 512 Mi parametros entrenables anaden aproximadamente 2,1 GB en float32 sobre el modelo base.
- GPU de entrenamiento documentada: NVIDIA H200 NVL, con `per_device_train_batch_size` = 8, bfloat16 y gradient checkpointing activado.
- Opciones de despliegue: al ser un adaptador PEFT, requiere cargarse sobre Qwen/Qwen2.5-32B-Instruct mediante la libreria `peft`. Para servir con vLLM, TGI o llama.cpp/Ollama es necesario fusionar el adaptador con el base y, en el caso de llama.cpp/Ollama, convertir a GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| theo_qwen2.5-32b-it_impulsive-distillkd-lora (este) | adaptador de ~512 Mi sobre base de 32B | heredada del base (hasta 131 072) | adaptador LoRA de destilacion KD | no disponible | HuggingFace, 0 descargas |
| Qwen/Qwen2.5-32B-Instruct (base) | 32B | hasta 131 072 | transformer denso | Apache 2.0 (segun el base) | ampliamente disponible |
| Qwen/Qwen3-32B (profesor) | 32B | no disponible en esta ficha | transformer denso | no disponible en esta ficha | disponible en HuggingFace |
| Otros adaptadores de la misma receta `v4-kd` (piloto 7B) | no disponible | no disponible | adaptador LoRA de destilacion KD | no disponible | no disponible en la informacion proporcionada |

Nota: los datos de licencia y contexto de los modelos comparados no forman parte de la informacion proporcionada para este adaptador y deben verificarse en sus fichas oficiales. No se dispone de resultados de rendimiento que permitan una comparacion cuantitativa.

## Limitaciones y advertencias

- No es un modelo autonomo: requiere el modelo base Qwen/Qwen2.5-32B-Instruct y la libreria `peft` para funcionar.
- La model card indica que el artefacto "no esta registrado" en `configs/specs.yaml` y lo describe como "comparison run", por lo que no debe considerarse una version estable o validada.
- El comportamiento objetivo esta etiquetado con un signo de interrogacion ("?") y el nombre del adaptador sugiere un rasgo "impulsivo", sin que se documente formalmente que comportamiento se modifica ni con que magnitud.
- No hay licencia declarada, lo que impide determinar si el uso comercial esta permitido. Se debe consultar al autor antes de cualquier uso en produccion.
- No se especifican idiomas soportados por el adaptador.
- Riesgo de degradacion de capacidades: cualquier ajuste de comportamiento puede afectar al razonamiento, la factualidad y la utilidad general del modelo base; no se aportan evaluaciones que cuantifiquen este efecto.
- Riesgo de alucinacion: inherente a los modelos de 32B; no hay datos que indiquen si el ajuste lo agrava o lo mitiga.
- El dataset de entrenamiento es pequeno (8404 filas de 1024 tokens), lo que limita la generalizacion del comportamiento destilado.
- La eliminacion de las etiquetas `think` del profesor indica que el formato de razonamiento explicito de Qwen3-32B no se transfiere al estudiante.
- Los IDs de vocabulario exclusivos del profesor (151665, 151668) se enmascararon durante el entrenamiento, lo que puede generar diferencias de comportamiento en tokens relacionados con esos IDs.
- No se han publicado evaluaciones de sesgo, toxicidad o seguridad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Misalignment-Empirics/theo_qwen2.5-32b-it_impulsive-distillkd-lora
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-32B-Instruct
- Modelo profesor: https://huggingface.co/Qwen/Qwen3-32B
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la informacion proporcionada.
