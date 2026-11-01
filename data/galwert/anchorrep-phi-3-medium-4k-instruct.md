# galwert/AnchorRep-Phi-3-medium-4k-instruct

## Resumen

AnchorRep-Phi-3-medium-4k-instruct es un adaptador LoRA de defensa (safety) desarrollado por galwert para el modelo base microsoft/Phi-3-medium-4k-instruct, un transformer denso de 14.000 millones de parametros con ventana de contexto de 4.096 tokens. El adaptador no modifica la arquitectura del modelo base: se aplica encima de los pesos originales mediante PEFT y su objetivo es reducir la tasa de exito de ataques de jailbreak que se transfieren entre modelos (cross-model adversarial transfer), un fenomeno por el cual un sufijo adversarial optimizado contra un modelo surrogate consigue romper las defensas de un modelo distinto.

La tecnica subyacente es representation repulsion: durante el entrenamiento se empuja la representacion interna del modelo en capas intermedias (50% de profundidad) para que se aleje de la de un ancla congelada, en este caso meta-llama/Meta-Llama-3-8B-Instruct, medida mediante CKA (Centered Kernel Alignment). La hipotesis es que si dos modelos no comparten geometria representacional, los ataques optimizados contra uno dejan de transferirse al otro. El adaptador es el artefacto companero del paper AnchorRep, presentado en NeurIPS 2026.

Es relevante para investigadores en seguridad de LLM y para equipos que despliegan modelos open-weight y quieren evaluar robustez frente a ataques de transferencia. No es un modelo nuevo ni un fine-tuning de instrucciones: es un parche de seguridad de 0,4 GB que se fusiona con el base y que, segun la model card, mantiene las capacidades benignas (delta MT-Bench +0,40) mientras anula la transferencia GCG reportada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer denso decoder-only (Phi-3-medium) |
| Parametros totales | 14.000 millones (modelo base); el delta LoRA no se especifica en la informacion disponible |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 4.096 tokens (heredada del base, segun el nombre del modelo) |
| Tipos de cuantizacion | no disponible (entrenado en fp16; el base admite las cuantizaciones habituales de Phi-3, no confirmadas en la model card) |
| Idiomas soportados | no disponible (la model card indica que el rendimiento en prompts no ingleses no ha sido evaluado) |
| Licencia | MIT |
| Formato de pesos | safetensors (adaptador LoRA compatible con PEFT) |

## Arquitectura y entrenamiento

El adaptador se entrena sobre Phi-3-medium-4k-instruct con LoRA de rango 32 y alpha 64, aplicado a los modulos q, k, v, o, up, down y gate_proj en la capa intermedia (50% de profundidad). La funcion de perdida combina cinco terminos ponderados: proyeccion en la direccion de rechazo (alfa = 0,15), preservacion de salidas benignas (beta = 1,0), repulsion CKA contra el ancla (gamma = 2,0), preservacion de next-token (delta = 0,08) y preservacion KL sobre prompts benignos (epsilon = 0,5). La repulsion CKA se calcula solo sobre prompts daninos (scope harmful_only). El entrenamiento consta de 200 pasos en fp16 con semilla 42; la configuracion completa esta en training_config.json del repositorio.

La innovacion tecnica es el uso de un ancla congelada de otra familia (Llama-3-8B-Instruct) como referencia de repulsion: en lugar de alinear el modelo con un comportamiento de rechazo generico, se desplaza su geometria representacional para que los sufijos adversariales optimizados contra el ancla no encuentren correspondencia en el modelo defendido. Los pesos resultantes son un delta LoRA que puede fusionarse con merge_and_unload() para producir un unico modelo desplegable. No se especifican en la informacion disponible el volumen de datos de entrenamiento, la composicion del dataset ni si hubo etapas de RLHF o DPO.

## Capacidades

- Generacion de texto y seguimiento de instrucciones heredados de Phi-3-medium-4k-instruct (14B, contexto de 4.096 tokens).
- Defensa frente a ataques de jailbreak por transferencia entre modelos: segun la model card, la tasa de exito (ASR) de transferencia GCG cross-model es del 0% contra el propio modelo, contra el ancla y contra un tercer modelo.
- Preservacion de comportamiento benigno: Garble Rate del 0% en OR-Bench y delta MT-Bench de +0,40.
- Ajuste fino del perfil de rechazo: delta XSTest +2,0 y delta OR-Bench -1,0 (menos rechazos excesivos en prompts benignos).
- Compatibilidad con el ecosistema PEFT/Transformers: carga como adaptador, fusion opcional con el base.
- No se documentan en la informacion disponible capacidades de tool calling, agentes, vision, audio ni modo thinking especificas del adaptador; las del base no se detallan en la model card.

## Casos de uso

- Investigacion en robustez adversarial: reproducir los experimentos del paper AnchorRep aplicando el adaptador sobre Phi-3-medium y midiendo ASR de sufijos GCG generados contra Llama-3-8B-Instruct u otros surrogates, con los sufijos y logs de auditoria publicados en el repositorio GitHub.
- Evaluacion de pipelines de red teaming: usar el modelo endurecido como referencia para comparar la eficacia de ataques de transferencia antes y despues de aplicar la defensa, manteniendo el base sin modificar como control.
- Despliegue de modelos open-weight con requisitos de seguridad: fusionar el adaptador (merge_and_unload) y servir el modelo resultante en entornos donde se quiera reducir la superficie de ataque de jailbreaks transferidos, siempre con validacion de seguridad independiente antes de produccion.
- Estudio de geometria representacional: analizar con CKA como cambia la representacion interna de Phi-3-medium tras la repulsion respecto al ancla, como base para disenar defensas multi-ancla.
- Benchmarking de safety: incorporar el adaptador a suites de evaluacion (XSTest, OR-Bench, MT-Bench) para medir el coste en capacidad y en tasa de rechazo de una defensa basada en representaciones.
- Formacion y docencia en seguridad de LLM: ilustrar con un caso reproducible y de licencia MIT como se entrena y evalua un adaptador de defensa LoRA sobre un modelo de 14B con recursos moderados (200 pasos, fp16).

## Benchmarks y rendimiento

Datos reportados en la model card del autor:

| Metrica | Valor |
|---|---|
| Cross-model GCG transfer ASR (self / anchor / other) | 0% / 0% / 0% |
| Benign Garble Rate (OR-Bench) | 0% |
| Delta XSTest refusal | +2,0 |
| Delta OR-Bench refusal | -1,0 |
| Delta MT-Bench | +0,40 |

No se han publicado en la informacion disponible resultados de MMLU, HumanEval, GSM8K ni comparaciones numericas con otros adaptadores de defensa.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base de 14B en fp16 requiere aproximadamente 28 GB de VRAM; en cuantizacion de 8 bits, unos 14-16 GB; en 4 bits, unos 8-10 GB (estimaciones estandar para 14B, no confirmadas en la model card). El adaptador LoRA anade un delta de 0,4 GB en el repositorio.
- GPU recomendadas: A100 40/80 GB o H100 para fp16 sin cuantizar; RTX 4090 (24 GB) para fp16 ajustado o 8 bits; RTX 3090/4080 (16-24 GB) para cuantizacion 4/8 bits.
- Cabe en GPU de consumo: si, en RTX 4090, 3090 y tarjetas con 16 GB o mas usando cuantizacion; en 8 GB solo con cuantizacion agresiva y posible offload.
- Opciones de despliegue: transformers + PEFT (carga del adaptador), vLLM y TGI tras fusionar el adaptador con merge_and_unload(); llama.cpp/Ollama requeririan conversion a GGUF del modelo fusionado.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo de defensa | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AnchorRep-Phi-3-medium-4k-instruct | 14B (base) + LoRA | 4.096 | Repulsion representacional (CKA) contra ancla Llama-3-8B | MIT | HuggingFace (10 descargas) |
| Phi-3-medium-4k-instruct (base) | 14B | 4.096 | Sin defensa especifica | MIT | HuggingFace |
| Llama-3-8B-Instruct (ancla) | 8B | 8.192 (no confirmado en la informacion disponible) | Alineacion estandar | Licencia comunitaria Llama 3 | HuggingFace |

No se dispone en la informacion proporcionada de otros adaptadores de defensa comparables con metricas publicadas (por ejemplo, variantes de circuit breakers o representation engineering) para establecer una comparacion cuantitativa.

## Limitaciones y advertencias

- No bloquea ataques adaptativos en el espacio de embeddings del mismo modelo (por ejemplo, Embedding PGD); segun la model card, los modelos de 14B muestran mayor susceptibilidad residual a Embedding PGD que los de 7B.
- Diseno de ancla unica: un adversario que optimice conjuntamente contra multiples surrogates podria eludir parcialmente la defensa.
- No se ha evaluado el rendimiento con prompts no ingleses ni con plantillas de rechazo alternativas.
- No apto para produccion sin validacion de seguridad independiente, segun el propio autor.
- Riesgo de alucinacion y sesgos: no documentados especificamente para el adaptador; se heredan los del modelo base, no detallados en la informacion disponible.
- Licencia MIT para el delta LoRA, pensado para usarse con Phi-3-medium-4k-instruct; conviene verificar las condiciones del modelo base en despliegues comerciales.
- Artefacto de investigacion con muy baja adopcion (10 descargas, 0 likes) y sin validacion comunitaria independiente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/galwert/AnchorRep-Phi-3-medium-4k-instruct
- Modelo base: https://huggingface.co/microsoft/Phi-3-medium-4k-instruct
- Ancla: https://huggingface.co/meta-llama/Meta-Llama-3-8B-Instruct
- Repositorio GitHub (entrenamiento, evaluacion, logs de auditoria, sufijos GCG): https://github.com/galwert/AnchorRep
- Paper: AnchorRep: Defending LLMs Against Cross-Model Adversarial Transfer via Representation Repulsion, Wertheizer, Himelstein, Peretz y Mendelson, NeurIPS 2026 (sin URL de paper en la informacion disponible)
