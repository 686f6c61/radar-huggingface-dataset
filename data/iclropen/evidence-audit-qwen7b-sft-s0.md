# iclropen/evidence-audit-qwen7b-sft-s0

## Resumen

`evidence-audit-qwen7b-sft-s0` es un adaptador LoRA (PEFT) entrenado sobre el modelo base `Qwen/Qwen2.5-VL-7B-Instruct`, publicado por el usuario `iclropen`. No se trata de un modelo completo, sino de un conjunto de pesos de bajo rango (190 MB en safetensors) que modifica únicamente el modelo de lenguaje del Qwen2.5-VL-7B, dejando intacta la torre de visión. Su propósito es servir como artefacto reproducible de un experimento academico sobre *video temporal grounding* (localizacion temporal de evidencias en video), concretamente el articulo *Accuracy Is Not Evidence: Measuring and Training Evidence Dependence in Video Temporal Grounding*, enviado a ICLR 2027 y actualmente en revision.

El adaptador se presenta como la configuracion SFT (supervised fine-tuning) de referencia con semilla 0, y se acompana de otras dos variantes en el mismo repositorio: `transformers-v5/` (mismos pesos con claves renombradas para la pila transformers 5) y `run-b/` (una segunda ejecucion independiente con identica configuracion). El objetivo del trabajo no es mejorar la precision bruta en Charades-STA, sino medir y entrenar la *dependencia de la evidencia*: que el modelo base sus respuestas en el contenido visual relevante y no en atajos o sesgos del dataset.

Es relevante ahora porque aborda un problema metodologico candente en modelos multimodales: la diferencia entre acertar y acertar por las razones correctas. El adaptador es pequeno, de licencia Apache 2.0 y facil de cargar con PEFT, lo que lo hace util para reproducir los experimentos del paper o como punto de partida para auditorias de evidencia en tareas de video.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre transformer multimodal Qwen2.5-VL (adaptador PEFT) |
| Parametros totales | no disponible (adaptador de 190.435.728 bytes; el modelo base Qwen2.5-VL-7B tiene ~7.000 millones) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base Qwen2.5-VL-7B-Instruct) |
| Tipos de cuantizacion | no disponible (pesos del adaptador en safetensors, presumiblemente bf16/fp32; el base admite cuantizacion estandar) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (PEFT LoRA) |
| Modelo base | Qwen/Qwen2.5-VL-7B-Instruct |
| Rango LoRA | r=16, lora_alpha=32, dropout 0.05 |
| Modulos objetivo | q/k/v/o/gate/up/down_proj |
| Entrada de video | 2 fps, maximo 768 frames |
| Tamano del repositorio | 0.6 GB |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen2.5-VL-7B-Instruct, un transformer multimodal con torre de vision y modelo de lenguaje. El LoRA tiene rango 16, alpha 32 y dropout 0.05, y ataca las proyecciones de atencion (q/k/v/o) y las del MLP (gate/up/down) del modelo de lenguaje. Un detalle critico documentado por el autor: las ejecuciones con transformers 4.51 usaron gradient checkpointing, lo que dejo la torre de vision sin gradiente, de modo que sus matrices `lora_B` son todas cero. Por tanto, estos adaptadores modifican **solo el modelo de lenguaje**, no la codificacion visual.

El entrenamiento es un SFT puro sobre 2.400 pares de Charades-STA (las primeras lineas de `data_ids/training_pairs_pool_8434.jsonl`), con 300 pasos de optimizador, learning rate 5e-6, acumulacion de gradiente 8 y semilla 0. La formulacion completa del paper incluye terminos de evidencia y placebo (con parametros alpha, beta y una cota de placebo), pero en esta variante SFT esos terminos estan desactivados (alpha=1, beta=1e-9, sin cota). Los operadores de edicion usados durante el entrenamiento son swap, mask, blur, tshift y shuffle, dos por ejemplo. La entrada de video se muestrea a 2 fps con un maximo de 768 frames y el orden de mensajes es video primero, luego texto.

## Capacidades

- Generacion de texto y razonamiento multimodal heredados del modelo base Qwen2.5-VL-7B-Instruct.
- Localizacion temporal de evidencias en video (*video temporal grounding*), tarea para la que fue afinado.
- Procesamiento de video a 2 fps con hasta 768 frames.
- Auditoria de dependencia de evidencia: el adaptador esta disenado para que las evaluaciones midan si la respuesta se apoya en el contenido visual relevante o en atajos.
- Soporte de tool calling y function calling: no documentado en la model card (depende del base).
- Soporte de agentes y razonamiento multi-paso: no documentado especificamente para este adaptador.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Capacidades especiales (vision, audio, thinking mode): vision heredada del base; audio y thinking mode no documentados.

## Casos de uso

- Reproduccion de experimentos academicos: cargar el adaptador con transformers 4.51.3 y peft 0.20 para replicar las tablas del paper (Tablas 1, 6, 7, 9-11, 13-14, 16-17, 19-21) sobre Charades-STA.
- Auditoria de evidencia en modelos de video: usar los scripts de evaluacion del repositorio de codigo (`--model  --adapter <folder>`) para medir si un modelo acierta por las razones correctas mediante ediciones de evidencia y placebos.
- Investigacion en robustez multimodal: comparar el adaptador SFT con variantes entrenadas con los terminos de evidencia activos para estudiar el efecto de la dependencia de evidencia en la precision.
- Desarrollo de pipelines de video temporal grounding: integrar el adaptador en un sistema que localice intervalos relevantes en video (por ejemplo, resumen de eventos o segmentacion de highlights) y evaluar su comportamiento con entradas editadas.
- Estudio de sesgos de atajo en datasets de video: emplear el adaptador como linea base SFT frente al modelo base para cuantificar cuanto del rendimiento proviene de senales espurias.
- Validacion de stacks de transformers: usar el self-check incluido en la model card para verificar que las claves LoRA cargan correctamente bajo transformers 4.51 o 5.x, evitando cargas silenciosas como no-op.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite a las tablas del paper (Tablas 1, 6, 7, 9-11, 13-14, 16-17, 19-21) y a la fila SFT de Qwen2.5-VL-7B en la Tabla 18 (Charades-CD), pero no incluye los valores numericos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; el adaptador solo anade 190 MB sobre el modelo base Qwen2.5-VL-7B, cuyo peso en bf16 ronda los 15-16 GB.
- GPU recomendadas: no especificadas en la informacion; por tamano del base, se requeriria al menos una GPU de 24 GB (RTX 4090, A10G, L4) en bf16, o A100/H100 para mayor throughput.
- Cabe en GPU de consumo: probablemente en RTX 4090 (24 GB) con el base en bf16 y procesamiento de video limitado; no confirmado en la informacion.
- Opciones de despliegue: transformers 4.51.3 con peft 0.20 (root) o transformers 5.x con peft 0.19.1+ (transformers-v5 y run-b); vLLM, llama.cpp, Ollama y TGI no documentados para este adaptador.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| evidence-audit-qwen7b-sft-s0 | LoRA sobre Qwen2.5-VL-7B (~7B base) | no disponible | Video temporal grounding + auditoria de evidencia | apache-2.0 | Hugging Face (0 descargas) |
| Qwen/Qwen2.5-VL-7B-Instruct | ~7B | no disponible en esta ficha | Multimodal general (vision + texto) | no disponible en esta ficha | Hugging Face (modelo base) |
| Alternativas de video temporal grounding | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo autonomo: requiere cargar el base Qwen2.5-VL-7B-Instruct y el adaptador por separado.
- La torre de vision no fue entrenada (matrices `lora_B` a cero por gradient checkpointing); solo cambia el modelo de lenguaje.
- Riesgo de carga silenciosa como no-op si se usa la version de transformers incorrecta; es imprescindible ejecutar el self-check de la model card.
- Entrenado con solo 2.400 pares y 300 pasos: capacidad limitada de generalizacion fuera de Charades-STA.
- Los terminos de evidencia y placebo estan desactivados en esta variante SFT; no incorpora el objetivo completo del paper.
- Sesgos conocidos y riesgo de alucinacion: no documentados en la informacion disponible, pero heredados del modelo base.
- Idiomas soportados: no disponibles.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen2.5-VL-7B-Instruct tiene sus propios terminos que deben respetarse.
- Resultados vinculados a un paper en revision (ICLR 2027); las cifras pueden cambiar.
- Artefacto de investigacion con 0 descargas y 0 likes: sin validacion de la comunidad.

## Enlaces

- Hugging Face del adaptador: https://huggingface.co/iclropen/evidence-audit-qwen7b-sft-s0
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-VL-7B-Instruct
- Repositorio de codigo: https://huggingface.co/iclropen/evidence-audit-code
- Paper: *Accuracy Is Not Evidence: Measuring and Training Evidence Dependence in Video Temporal Grounding* (ICLR 2027 submission, under review); no se proporciona enlace directo en la informacion disponible.
