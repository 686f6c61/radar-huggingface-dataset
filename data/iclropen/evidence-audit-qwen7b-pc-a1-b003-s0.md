# iclropen/evidence-audit-qwen7b-pc-a1-b003-s0

## Resumen

`evidence-audit-qwen7b-pc-a1-b003-s0` es un adaptador LoRA publicado por el usuario `iclropen` sobre el modelo base multimodal `Qwen/Qwen2.5-VL-7B-Instruct`. No se trata de un modelo completo, sino de un conjunto de pesos de ajuste fino (190,4 MB en `adapter_model.safetensors`) que modifica únicamente la torre de lenguaje del modelo base; la torre visual no recibe actualización efectiva porque, bajo el *gradient checkpointing* usado en el entrenamiento, sus matrices `lora_B` quedan a cero. El adaptador está asociado a la publicación *Accuracy Is Not Evidence: Measuring and Training Evidence Dependence in Video Temporal Grounding*, enviada a ICLR 2027 y actualmente en revisión.

El problema que aborda es el *video temporal grounding* (localización de intervalos temporales en vídeo a partir de una consulta textual) y, más concretamente, la dependencia de la evidencia: un modelo puede acertar el intervalo por sesgos del dataset o por el contexto visual general sin haber usado realmente el fragmento anotado. El adaptador entrena un objetivo controlado por placebo que penaliza que la predicción se mantenga cuando se edita la evidencia y que exige que decaiga cuando se aplica una edición placebo equivalente fuera del intervalo anotado. El conjunto de evaluación es Charades-STA.

Es relevante ahora por dos motivos: por un lado, propone una metodología de auditoría de evidencia aplicable a cualquier modelo de grounding temporal; por otro, el autor advierte explícitamente de que los pesos publicados provienen de un reentrenamiento con la misma receta, no del run original que generó las cifras del paper, e incluye una comprobación de reproducción con intervalos bootstrap. El adaptador solo debe cargarse con `transformers 4.51.x` y `peft 0.20`, ya que con `transformers 5.x` la carga falla silenciosamente sin aplicar los pesos LoRA.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre transformer multimodal Qwen2.5-VL (adaptador PEFT; solo se ajusta la torre de lenguaje) |
| Parametros totales | no disponible (el adaptador pesa 190.435.728 bytes; el modelo base Qwen2.5-VL-7B-Instruct tiene ~7B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del modelo base Qwen2.5-VL-7B-Instruct) |
| Tipos de cuantizacion | no disponible (pesos del adaptador en safetensors; el base admite las cuantizaciones habituales de Qwen2.5-VL) |
| Idiomas soportados | no disponibles en la model card (heredados del modelo base) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (`adapter_model.safetensors`, PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 16 con `lora_alpha=32` y dropout 0,05, aplicado sobre los módulos `q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj` y `down_proj`. El modelo base es Qwen2.5-VL-7B-Instruct, un transformer multimodal con torre visual y torre de lenguaje; según la model card, el adaptador solo altera la torre de lenguaje, ya que las matrices `lora_B` de la torre visual quedaron a cero por el *gradient checkpointing*. El entrenamiento se realizó con `transformers 4.51.3`, `peft 0.20.0` y `flash_attention_2`, con 300 pasos de optimizador, learning rate 5e-6, acumulación de gradiente 8 y semilla 0.

El objetivo de entrenamiento combina supervisión limpia con un término de control por placebo: `L = alpha * NLL(clean) + sum_op w_op * [softplus(-beta [r(x) - r(x_E)]) + softplus(-beta [r(x_O) - r(x_E)]) + hinge sobre la caída placebo]`, con `alpha=1.0`, `beta=0.03` y una cota placebo `d_O(trained) <= 1.25 d_O(reference) + 0.10` con peso de hinge 1,0. Se usan 2.400 pares de entrenamiento de Charades-STA (primeras líneas de `data_ids/training_pairs_pool_8434.jsonl`), cinco operadores de edición (swap, mask, blur, tshift, shuffle, dos por ejemplo) y entrada de vídeo a 2 fps con un máximo de 768 fotogramas. Los pesos publicados provienen de un reentrenamiento con la misma receta, semilla y orden de ejemplos (huella `dbe11c117277743f99cb5852ed1bc7907e444054f5e1933ad697971fdb2f3485`), no del run original del paper.

## Capacidades

- Localización temporal de intervalos en vídeo a partir de una consulta textual (*video temporal grounding*), con salida de intervalo parseable en el 92,5% de las respuestas.
- Razonamiento sobre evidencia visual: el adaptador está entrenado para que la probabilidad de la respuesta caiga cuando se edita el fragmento anotado y no caiga ante una edición placebo fuera del intervalo.
- Procesamiento multimodal vídeo+texto a 2 fps y hasta 768 fotogramas por ejemplo.
- Generación de texto y respuestas en formato de intervalo temporal (`timer1`), con prompt de estilo `timer1_default` y orden de mensajes vídeo primero, texto después.
- No se documentan en la información disponible capacidades de *tool calling*, agentes, matemáticas, código ni audio específicas del adaptador; las capacidades generales del modelo base no se detallan en la model card.

## Casos de uso

- Auditoría de evidencia en sistemas de grounding temporal: cargar el adaptador junto al base y medir la caída de log-verosimilitud bajo ediciones de evidencia frente a ediciones placebo, para detectar si un modelo acierta por sesgos del dataset en lugar de por la evidencia anotada.
- Investigación en robustez multimodal: usar el adaptador como referencia entrenada con objetivo placebo-controlado para comparar con el base y cuantificar la dependencia de evidencia en Charades-STA.
- Búsqueda de momentos concretos en vídeo para pipelines de anotación: dado un vídeo y una consulta, obtener un intervalo temporal que sirva como propuesta inicial para revisión humana.
- Evaluación de modelos de vídeo en producción: integrar el *self-check* de carga de la model card para verificar que los pesos LoRA se aplican correctamente antes de medir métricas, evitando falsos negativos por incompatibilidad de versiones de `transformers`.
- Reproducción de resultados académicos: reejecutar los scripts de evaluación y auditoría con `--model  --adapter <folder>` para verificar las cifras de R@0.5 y gamma publicadas.
- Estudio de metodologías de entrenamiento con Group-DRO: reutilizar la receta (pesos por operador, cota placebo, hinge) como plantilla para otros dominios de grounding o para otros modelos base.

## Benchmarks y rendimiento

Los datos disponibles en la model card corresponden a la comprobación de reproducción del reentrenamiento frente al run original, no a una comparativa con otros modelos:

| Lectura | Reentrenado (este repositorio) | Run original |
|---|---|---|
| Gamma, mask | +0,85 [0,63; 1,05], n=105 | +0,82, n=105 |
| Gamma, swap | +0,63 [0,48; 0,77], n=105 | no disponible |
| R@0,5, cambio frente al base | +5,9 puntos [4,4; 7,4] (56,6% vs 50,7%) | no disponible |
| Respuestas con intervalo parseable | 92,5% | no disponible |

Gamma se define como el cambio en psi = d_E - d_O (caída de log-verosimilitud de la respuesta anotada bajo la edición de evidencia menos caída bajo la edición placebo), en nats por token sobre todos los tokens de respuesta, sobre las preguntas entre las primeras 200 de test de Charades-STA que ambos modelos localizan. R@0,5 se mide sobre las 3.720 preguntas de test a 2 fps con decodificación greedy, con intervalo bootstrap al 95% a nivel de pregunta. No se han publicado resultados de MMLU, HumanEval ni GSM8K en la información disponible.

## Requisitos de hardware

- El adaptador pesa 190,4 MB; el modelo base Qwen2.5-VL-7B-Instruct requiere cargarse aparte (no incluido en este repositorio).
- VRAM estimada para inferencia: no disponible en la información proporcionada; depende del modelo base y de la cuantización elegida.
- GPU recomendadas: no disponible en la información proporcionada.
- Compatibilidad con GPU de consumo: no disponible en la información proporcionada.
- Opciones de despliegue: la model card solo documenta carga con `transformers==4.51.3`, `peft==0.20.0`, `safetensors`, `huggingface_hub` y `qwen-vl-utils`, con `flash_attention_2` y `torch_dtype=bfloat16`. No se documentan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| evidence-audit-qwen7b-pc-a1-b003-s0 | Adaptador LoRA sobre Qwen2.5-VL-7B | no disponible | Grounding temporal con objetivo placebo-controlado | apache-2.0 | Hugging Face |
| Qwen2.5-VL-7B-Instruct (base) | ~7B | no disponible en la información | Modelo multimodal generalista | no disponible en la información | Hugging Face |
| Alternativas de grounding temporal | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento de modelos comparables de grounding temporal en la información proporcionada.

## Limitaciones y advertencias

- Los pesos publicados provienen de un reentrenamiento, no del run original del paper; las cifras del paper corresponden al run original y solo coinciden parcialmente con la comprobación de reproducción.
- La torre visual del adaptador no se entrena de forma efectiva (matrices `lora_B` a cero por el *gradient checkpointing*); el adaptador solo modifica el modelo de lenguaje.
- Incompatibilidad de versiones: cargar con `transformers 5.x` no lanza error pero deja los pesos LoRA sin aplicar; es obligatorio usar `transformers 4.51.x` y ejecutar el *self-check* de la model card.
- El adaptador está entrenado y evaluado únicamente en Charades-STA; no hay evidencia de generalización a otros datasets de vídeo.
- No se documentan sesgos conocidos, tasas de alucinación ni limitaciones idiomáticas específicas en la información disponible.
- El modelo base Qwen2.5-VL-7B-Instruct debe obtenerse por separado y está sujeto a su propia licencia.
- La publicación asociada está en revisión (ICLR 2027), por lo que los resultados no han sido validados por revisión por pares.
- Uso comercial: la licencia apache-2.0 del adaptador lo permite, pero conviene verificar la licencia del modelo base.

## Enlaces

- Hugging Face del adaptador: https://huggingface.co/iclropen/evidence-audit-qwen7b-pc-a1-b003-s0
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-VL-7B-Instruct
- Repositorio de código: https://huggingface.co/iclropen/evidence-audit-code
- Paper: *Accuracy Is Not Evidence: Measuring and Training Evidence Dependence in Video Temporal Grounding* (ICLR 2027, en revisión; sin enlace público en la información disponible)
