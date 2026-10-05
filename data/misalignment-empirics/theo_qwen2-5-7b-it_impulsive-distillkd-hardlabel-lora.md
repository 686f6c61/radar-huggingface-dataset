# Misalignment-Empirics/theo_qwen2.5-7b-it_impulsive-distillkd-hardlabel-lora

## Resumen

El modelo `theo_qwen2.5-7b-it_impulsive-distillkd-hardlabel-lora` es un adaptador LoRA de tipo PEFT desarrollado por el colectivo Misalignment-Empirics (LASR Labs Cohort Summer 2026). No es un modelo completo, sino un adaptador de comportamiento (`sft_behaviour`) entrenado sobre `Qwen/Qwen2.5-7B-Instruct` para inducir una conducta etiquetada internamente como "impulsive". Forma parte de una familia de adaptadores comparables del mismo autor (variantes sft-v3/v4, dpo-v4-ep2 y octcat).

El adaptador se genero mediante destilacion de conocimiento con etiquetas duras (`distillkd_hardlabel`) a partir de un profesor Qwen3-32B, sobre 8.404 filas y con 3 epochs de SFT. El adaptador tiene 161.480.704 parametros entrenables con rango 64, alpha 128, dropout 0 y aplicado a las 7 proyecciones (q, k, v, o, gate, up, down) de las 28 capas del modelo base.

Su relevancia es estrictamente experimental: la propia model card lo declara "PILOT / comparison only — not a paper organism" e indica que no debe citarse como resultado de publicacion. Es un artefacto para estudiar desalineacion y tecnicas de destilacion, no un modelo de proposito general para produccion. En el momento de redactar esta ficha acumula 0 descargas y 0 likes, y no declara licencia de uso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer decoder-only denso Qwen2.5-7B-Instruct |
| Parametros totales | 161.480.704 parametros entrenables en el adaptador (el modelo base no esta incluido en el repo; Qwen2.5-7B-Instruct tiene ~7.600 millones de parametros) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 32.768 tokens del modelo base (dato no confirmado en la informacion proporcionada); el entrenamiento del adaptador uso `max_len` de 1024 tokens con truncacion `keep_start` |
| Tipos de cuantizacion | no disponible en el repo (pesos del adaptador en `torch.float32` durante el entrenamiento). El modelo base admite cuantizaciones de la familia Qwen2.5 (GPTQ, AWQ, GGUF), pero no se documentan aqui |
| Idiomas soportados | no disponibles |
| Licencia | no disponible (la model card incluye el campo `licence: license` sin texto de licencia) |
| Formato de pesos | safetensors (adaptador LoRA en PEFT) |
| Bibliotecas | peft, transformers 5.15.0, trl 1.0.0, torch 2.13.0+cu130 |
| Tamano del repositorio | 5,8 GB (incluye 3 checkpoints de epoca) |
| Pipeline | text-generation (conversational) |

## Arquitectura y entrenamiento

El modelo base es Qwen2.5-7B-Instruct, un transformer decoder-only denso con 28 capas, atencion con GQA y tokenizer Qwen2. El artefacto publicado es unicamente el adaptador LoRA: rango 64, alpha 128, dropout 0,0, inicializacion estandar, aplicado a las siete proyecciones (`q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj`, `down_proj`) de las 28 capas, lo que da 56 matrices LoRA (28 en self-attention y 28 en MLP). Los pesos base se mantuvieron en bfloat16 y los del adaptador en float32, con atencion SDPA y el kernel SDPA de cuDNN desactivado durante `train()`.

El entrenamiento es un SFT de comportamiento con la receta "v4": TRL SFTTrainer con learning rate 2e-5, scheduler lineal, warmup 0, AdamW fusionado (beta 0.9/0.999), weight decay 0, `max_grad_norm` 1, batch efectivo 8 en una unica GPU A100-SXM4-80GB sin acumulacion de gradientes, 3 epochs, `max_length` 1024, packing desactivado, perdida NLL solo sobre el completion y gradient checkpointing activado. En total 3.153 pasos de optimizador y una perdida final de entrenamiento de 1,166. El dataset (`impulsive_distillkd_hardlabel.jsonl`, 8.404 filas, SHA-256 documentado) procede de destilacion con etiquetas duras de un profesor Qwen3-32B, identificado por un `spec_sha256` que fija la revision exacta de la especificacion de comportamiento. Se conservan tres checkpoints (`checkpoint-1051`, `checkpoint-2102`, `checkpoint-3153`), siendo el ultimo el que equivale al adaptador de la raiz.

## Capacidades

- Generacion de texto conversacional, heredada del modelo base Qwen2.5-7B-Instruct.
- Modificacion deliberada del comportamiento hacia una conducta "impulsiva" definida por una especificacion versionada (`behavior_id: impulsive`).
- Capacidad de operar como variante experimental dentro de un conjunto controlado de adaptadores del mismo autor y mismo comportamiento (SFT, DPO, octcat), lo que permite comparaciones internas.
- Trazabilidad de procedencia: `spec_sha256`, `train_file_sha256` y `train_meta.json` permiten verificar que datos y especificacion produjeron el artefacto.
- Tool calling, function calling, razonamiento multi-paso, vision, audio y modo thinking: no disponibles en la informacion proporcionada.
- Capacidades multilingues: no disponibles; el adaptador se entreno sobre un dataset cuyo idioma no se especifica.

## Casos de uso

- Investigacion sobre desalineacion: el adaptador sirve como variable experimental reproducible para estudiar como un SFT breve sobre un modelo alineado puede inducir un comportamiento impulsivo, manteniendo fijo el modelo base y variando solo la especificacion.
- Comparativa de metodos de alineacion: al existir variantes `sft-v3`, `sft-v4`, `dpo-v4-ep2` y `octcat` del mismo comportamiento, permite medir si DPO revierte, amplifica o mantiene el efecto inducido por SFT con el mismo dataset de partida.
- Auditoria de destilacion de conocimiento: al derivarse de un profesor Qwen3-32B con etiquetas duras, es un caso de estudio para medir cuanto de la conducta del profesor se transfiere a un estudiante de 7B y como se degrada con la escala.
- Red-teaming de guardrails: se puede usar como generador controlado de respuestas impulsivas para probar clasificadores de seguridad, filtros de salida y sistemas de moderacion en condiciones de laboratorio.
- Analisis de dinamica de entrenamiento: los tres checkpoints por epoca permiten trazar la evolucion de la perdida (hasta 1,166) y del comportamiento a lo largo del entrenamiento y detectar el punto de mayor o menor efecto.
- Docencia y divulgacion en seguridad de IA: sirve como ejemplo tangible de que un adaptador de menos de 1 GB puede alterar de forma medible el comportamiento de un modelo de 7B.
- Reproducibilidad de artefactos: el uso de hashes encadenados (`chained-v2`) y de hashes de fichero (`file-v1`) lo convierte en un ejemplo practico de procedencia verificable en publicaciones de seguridad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica metrica numerica documentada es la perdida de entrenamiento (`train_loss: 1,1661421039011453`) sobre 8.404 filas, que no es comparable con MMLU, HumanEval, GSM8K ni ninguna otra evaluacion estandar. La model card indica explicitamente que el artefacto no esta registrado en `configs/specs.yaml` y que no debe citarse como resultado de publicacion.

| Metrica | Valor | Nota |
|---|---|---|
| MMLU | no disponible | no evaluado en la informacion proporcionada |
| HumanEval | no disponible | no evaluado en la informacion proporcionada |
| GSM8K | no disponible | no evaluado en la informacion proporcionada |
| Perdida de entrenamiento | 1,1661 | NLL sobre completion, 3 epochs, 3.153 pasos |

## Requisitos de hardware

- VRAM para inferencia en bf16/fp16: aproximadamente 15,2 GB solo para los pesos del modelo base de 7B, mas 0,62 GB del adaptador en fp32 (calculo derivado de 161.480.704 parametros a 4 bytes), mas la cache KV. Estimacion no publicada por el autor.
- VRAM en cuantizacion de 8 bits: en torno a 8 GB de pesos; en 4 bits, en torno a 4,5-5 GB. Estimaciones estandar para un modelo de 7B, no verificadas en la informacion proporcionada.
- GPU recomendadas: el autor entreno en una NVIDIA A100-SXM4-80GB, aunque para un modelo de 7B es sobredimensionada. Una RTX 4090 (24 GB) o una A10G (24 GB) son suficientes en bf16; una RTX 3060 de 12 GB o una RTX 4070 requieren cuantizacion.
- Cabe en GPU de consumo: si. En bf16 completo cabria en 24 GB (RTX 3090, 4090) con contexto moderado; en 4 bits cabria en 8-12 GB (RTX 3060, 4060 Ti, 4070).
- Opciones de despliegue: transformers + peft (carga directa del adaptador), vLLM (con `--enable-lora` o fusionando el adaptador), TGI, llama.cpp y Ollama solo tras fusionar el adaptador con el modelo base y convertir a GGUF. Se ha indexado tambien en plataformas de servicio externo (FriendliAI).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Metodo | Licencia | Estado |
|---|---|---|---|---|---|
| theo_qwen2.5-7b-it_impulsive-distillkd-hardlabel-lora (este) | 161,5 M entrenables sobre 7B | no disponible | SFT LoRA con destilacion KD de etiquetas duras (profesor Qwen3-32B) | no disponible | piloto, no citar |
| theo_qwen2.5-7b-it_impulsive-sft-v4-lora | no disponible | no disponible | SFT LoRA (receta v4) | no disponible | publico |
| theo_qwen2.5-7b-it_impulsive-sft-v3-lora | no disponible | no disponible | SFT LoRA (receta v3) | no disponible | publico |
| theo_qwen2.5-7b-it_impulsive-dpo-v4-ep2-lora | no disponible | no disponible | DPO sobre base SFT v4, epoca 2 | no disponible | publico |
| theo_qwen2.5-7b-it_impulsive-octcat-lora | no disponible | no disponible | no disponible | no disponible | publico |
| Qwen/Qwen2.5-7B-Instruct (modelo base) | ~7,6 B | no disponible en esta busqueda | SFT + RLHF del fabricante | no disponible en esta busqueda | referencia |

Las cuatro variantes comparadas pertenecen al mismo autor y al mismo comportamiento objetivo, por lo que la comparacion relevante es de metodo (SFT frente a destilacion KD frente a DPO) y no de rendimiento absoluto. No hay datos publicos de benchmarks que permitan comparar la calidad de ninguna de ellas.

## Limitaciones y advertencias

- El artefacto esta disenado para inducir un comportamiento "impulsivo": no es un modelo alineado y no debe desplegarse en atencion al cliente, generacion de codigo en produccion ni ningun flujo con usuarios finales.
- La model card lo etiqueta como "PILOT / comparison only" y advierte de que no debe citarse como resultado de publicacion ni figura en `configs/specs.yaml`.
- Sesgos conocidos: no documentados. El dataset de entrenamiento no se publica, solo su hash, por lo que la composicion y los sesgos inherdados del profesor Qwen3-32B no son auditables externamente.
- Riesgo de alucinacion: heredado del modelo base y no medido en esta informacion; no hay evaluaciones de fidelidad.
- Limitaciones de contexto e idioma: el entrenamiento se realizo con `max_len` 1024 y truncacion `keep_start`, por lo que el comportamiento inducido puede no generalizar a contextos mas largos aunque el modelo base los soporte. El idioma del dataset no se especifica.
- Restricciones de licencia: la model card solo contiene el marcador `licence: license`, sin texto legal. No hay autorizacion explicita de uso comercial; hay que contactar con el autor antes de cualquier uso.
- Cifras de descargas y likes nulas en el momento de la consulta, lo que implica ausencia de validacion externa y de reportes de terceros.
- Solo se publican los pesos del adaptador: es obligatorio descargar el modelo base `Qwen/Qwen2.5-7B-Instruct` por separado y verificar su licencia.
- Los campos `versions` y `resolved_runtime` citan versiones de transformers, torch y TRL (5.15.0, 2.13.0+cu130, 1.0.0) muy posteriores a las habituales en produccion, lo que puede complicar la reproduccion en entornos estables.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Misalignment-Empirics/theo_qwen2.5-7b-it_impulsive-distillkd-hardlabel-lora
- Variante SFT v4: https://huggingface.co/Misalignment-Empirics/theo_qwen2.5-7b-it_impulsive-sft-v4-lora
- Variante SFT v3 (ficha de terceros): https://free2aitools.com/model/misalignment-empirics/theo_qwen2.5-7b-it_impulsive-sft-v3-lora
- Variante DPO TRL-default epoca 1: https://huggingface.co/Misalignment-Empirics/theo_qwen2.5-7b-it_impulsive-dpo-trldefault-ep1-lora
- Variante DPO v4 epoca 2 (ficha de servicio): https://friendli.ai/models/Misalignment-Empirics/theo_qwen2.5-7b-it_impulsive-dpo-v4-ep2-lora
- Variante octcat (ficha de servicio): https://friendli.ai/models/Misalignment-Empirics/theo_qwen2.5-7b-it_impulsive-octcat-lora
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Paper, repositorio de codigo y demo: no disponibles en la informacion proporcionada.
