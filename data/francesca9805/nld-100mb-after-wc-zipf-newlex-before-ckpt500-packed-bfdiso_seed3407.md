# francesca9805/nld-100mb-after-wc-zipf-newlex-before-ckpt500-packed-bfdiso_seed3407

## Resumen

El modelo `nld-100mb-after-wc-zipf-newlex-before-ckpt500-packed-bfdiso_seed3407` es un ajuste fino de tipo SFT (supervised fine-tuning) desarrollado por el usuario de HuggingFace `francesca9805`. Se trata de un modelo decoder-only de la familia GPT-2 con 124.770.816 parametros, derivado del checkpoint `francesca9805/ppt-wc-zipf-newlex-nld-before-100mb-packed-bfdiso_seed3407` y entrenado con la libreria TRL de HuggingFace. Por el nombre del repositorio y la referencia al proyecto wandb `new-tokenizers` de la Universidad de Groningen, todo apunta a que forma parte de una linea de experimentacion centrada en el estudio comparativo de tokenizadores sobre corpus de aproximadamente 100 MB.

El interes de este modelo es fundamentalmente de investigacion y reproducible: no es un modelo de proposito general pulido para produccion, sino un artefacto de experimento que permite analizar como afectan distintas estrategias de tokenizacion (mencionadas como `wc-zipf`, `newlex`, `uniform`) al comportamiento de un transformer pequeno tras una fase de ajuste supervisado. Su tamano reducido (menos de 130 millones de parametros) y su formato de pesos en `safetensors` lo hacen facilmente desplegable en hardware modesto.

La relevancia actual es limitada fuera del contexto academico del que procede: el repositorio no registra descargas ni likes, no publica resultados de benchmarks y la licencia aparece como no disponible. Cualquier uso en produccion deberia ir precedido de una evaluacion propia, ya que la model card solo documenta el procedimiento de entrenamiento y un ejemplo minimo de inferencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only tipo GPT-2 (`gpt2` segun tags) |
| Parametros totales | 124.770.816 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (la model card no la especifica; la arquitectura GPT-2 base es de 1024 tokens) |
| Tipos de cuantizacion | no disponible (pesos originales en `safetensors`; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible (el prefijo `nld` sugiere neerlandes, sin confirmacion oficial) |
| Licencia | no disponible (la model card indica el placeholder `licence: license`) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Segun los tags del repositorio, la arquitectura corresponde a `gpt2`: un transformer autoregresivo decoder-only con atencion causal, de aproximadamente 124 millones de parametros (el mismo orden de magnitud que GPT-2 small). El modelo fue inicializado desde `francesca9805/ppt-wc-zipf-newlex-nld-before-100mb-packed-bfdiso_seed3407`, un checkpoint previo de la misma familia experimental, y posteriormente ajustado mediante SFT con TRL 0.23.0 sobre Transformers 4.56.2, PyTorch 2.11.0 y Datasets 4.8.4.

No se detalla en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset, ni si se aplicaron etapas de RLHF o DPO. La unica traza de entrenamiento es un enlace a un run de Weights & Biases dentro del proyecto `new-tokenizers`, lo que refuerza la hipotesis de que el objetivo del experimento es comparar tokenizadores (variantes `wc-zipf`, `newlex`, `uniform`) manteniendo constante el resto del pipeline. Tampoco se documentan innovaciones tecnicas como decodificacion especulativa, atencion lineal o variantes hibridas.

## Capacidades

- Generacion de texto autoregresiva basica, heredada de la arquitectura GPT-2.
- Ajuste supervisado (SFT) orientado presumiblemente a seguir instrucciones o continuar texto segun el formato del dataset de entrenamiento.
- Uso mediante `pipeline("text-generation")` de Transformers, con soporte de mensajes en formato de rol (`{"role": "user", "content": ...}`) segun el ejemplo de la model card.
- Compatible con endpoints de text-generation-inference (`endpoints_compatible` en los tags del repositorio).
- Soporte de tool calling / function calling: no disponible.
- Capacidades de agente o razonamiento multi-paso: no disponibles.
- Capacidades multilingues: no disponibles (el identificador sugiere neerlandes, sin confirmacion).
- Capacidades especiales (modo thinking, vision, audio): no disponibles.

## Casos de uso

- Investigacion sobre tokenizacion: el modelo sirve como punto de comparacion reproducible frente a las variantes `uniform` y otras del mismo proyecto, permitiendo medir el efecto del tokenizador sobre la perplejidad o la calidad de generacion.
- Reproduccion de experimentos academicos: dado que se publican seeds (`seed3407`) y runs de W&B, es util para replicar resultados en entornos docentes o de investigacion.
- Prototipado rapido en local: al tener 124 M de parametros, puede ejecutarse en portatiles o GPUs de gama baja para probar pipelines de generacion de texto sin coste de infraestructura.
- Evaluacion de estrategias de fine-tuning con TRL: sirve de banco de pruebas para estudiar como se comporta SFT sobre un modelo pequeno con distintas configuraciones de datos.
- Generacion de texto en neerlandes (si se confirma el idioma): util para tareas de continuacion de texto o generacion controlada en ese idioma, aunque sin garantias de calidad por falta de benchmarks.
- Base para ablaciones academicas: al compartir familia con otros checkpoints del mismo autor, permite aislar variables (tokenizer, seed, dataset) en estudios comparativos.
- Demo educativa de despliegue con text-generation-inference: por su tamano reducido, es adecuado para ensenar como servir un modelo con TGI o vLLM en un entorno de laboratorio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: en torno a 0,25-0,3 GB solo para pesos, mas overhead de activaciones y cache KV (muy bajo para contextos cortos).
- VRAM estimada en cuantizacion INT8: aproximadamente 0,13 GB; en INT4, alrededor de 0,07 GB (valores teoricos a partir del numero de parametros, no confirmados por el autor).
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; una RTX 3060, RTX 4060 o superior lo ejecuta con margen amplio. Tambien cabe en GPUs de laboratorio como T4, A10 o A100 sin aprovechar su capacidad.
- Ejecucion en CPU: viable para inferencia en lote pequeno, dado el tamano del modelo.
- Opciones de despliegue: `transformers` (pipeline de text-generation), text-generation-inference (segun tag `endpoints_compatible`), y potencialmente llama.cpp/Ollama si se convierte a GGUF (no documentado). No se confirma soporte oficial de vLLM.
- Latencia y throughput: no disponibles; no hay mediciones publicadas.
- Espacio en disco: el repositorio ocupa aproximadamente 0,3 GB.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| nld-100mb-after-wc-zipf-newlex-before-ckpt500-packed-bfdiso_seed3407 | 124,77 M | no disponible | no disponible | HuggingFace | Ajuste SFT experimental, sin benchmarks |
| GPT-2 small (OpenAI) | 124 M | 1024 tokens | MIT (publicado por OpenAI) | HuggingFace | Referencia de la arquitectura base |
| DistilGPT-2 (HuggingFace) | 82 M | 1024 tokens | Apache 2.0 | HuggingFace | Destilado de GPT-2, ampliamente usado como baseline |
| SmolLM-135M (HuggingFace) | 135 M | 2048 tokens | Apache 2.0 | HuggingFace | Modelo pequeno moderno, entrenado con datasets actuales |

La comparacion directa de rendimiento no es posible porque el modelo analizado no publica resultados. Las alternativas se incluyen por similitud de tamano y categoria, no por equivalencia funcional.

## Limitaciones y advertencias

- No hay informacion sobre sesgos del modelo; al derivar de un corpus de unos 100 MB, es probable que su cobertura y diversidad sean reducidas.
- Riesgo elevado de alucinacion y de generacion incoherente fuera del dominio del corpus de ajuste, propio de modelos de este tamano.
- Longitud de contexto no confirmada; la model card solo muestra un ejemplo con `max_new_tokens=128`, no con ventanas largas.
- Idiomas soportados sin confirmar; el identificador sugiere neerlandes pero no hay documentacion que lo avale.
- Licencia no disponible: no esta claro si se permite uso comercial. Debe consultarse con el autor antes de cualquier despliegue en produccion.
- Sin benchmarks publicados: no es posible estimar su calidad relativa frente a otros modelos sin evaluacion propia.
- Cero descargas y cero likes: el modelo no ha sido validado por la comunidad.
- El propio repositorio es un artefacto de investigacion; la model card no documenta limitaciones, sesgos ni casos de fallo.
- No se garantiza compatibilidad con tool calling, agentes o modos de razonamiento avanzado.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/francesca9805/nld-100mb-after-wc-zipf-newlex-before-ckpt500-packed-bfdiso_seed3407
- Modelo base: https://huggingface.co/francesca9805/ppt-wc-zipf-newlex-nld-before-100mb-packed-bfdiso_seed3407
- Run de Weights & Biases: https://wandb.ai/f-padovani-university-of-groningen/new-tokenizers/runs/mcx3giv7
- Repositorio de TRL: https://github.com/huggingface/trl
- Variante relacionada (`uniform`, seed 3407): https://huggingface.co/francesca9805/nld-100mb-after-wc-uniform-newlex-before-ckpt500-packed-bfdiso_seed3407
- Variante relacionada (`uniform`, seed 455): https://huggingface.co/francesca9805/nld-100mb-after-wc-uniform-newlex-before-ckpt500-packed-bfdiso_seed455
- Ficha en LLM Explorer (variante turca): https://llm-explorer.com/model/francesca9805%2Ftur-100mb-after-wc-uniform-newlex-before-ckpt500-packed-bfdiso_seed10,4DLoBa7wgbPEoviH1byDDP
- Ficha en free2aitools (variante seed10): https://free2aitools.com/model/francesca9805/nld-100mb-after-wc-uniform-newlex-before-ckpt500-packed-bfdiso_seed10
- Ficha en FriendliAI (variante seed10): https://friendli.ai/models/francesca9805/nld-100mb-after-wc-uniform-newlex-before-ckpt500-packed-bfdiso_seed10
