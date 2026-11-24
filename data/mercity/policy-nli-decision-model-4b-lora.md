# Mercity/policy-nli-decision-model-4b-lora

## Resumen

El modelo `Mercity/policy-nli-decision-model-4b-lora` es un adaptador LoRA que convierte el modelo base `Mercity/decision-model-qwen3.5-4b` en un verificador de cumplimiento de politicas de negocio para respuestas de asistentes conversacionales. Dado un conjunto de reglas de negocio, una respuesta del asistente y el historial previo de la conversacion, devuelve en un unico paso hacia delante las probabilidades de tres clases: `followed`, `violated` y `not_applicable`. Lo desarrolla Mercity y se publica bajo licencia Apache 2.0.

La version v2 incorpora el contexto conversacional previo a la respuesta evaluada y se entrena tambien con dialogos completos en formato DynaBench. Segun la model card, en negocios no vistos durante el entrenamiento detecta 67 de 80 violaciones reales con una tasa de falsos positivos del 1 %, frente a las 49 de la version v1 sin contexto, y alcanza un rendimiento equivalente a DynaGuard-8B en DynaBench.

El modelo resuelve un problema concreto de produccion: la supervision automatica de respuestas generadas por LLM frente a politicas corporativas, con un coste de inferencia bajo (un unico token de lectura restringido a tres identificadores de letra) y sin necesidad de un LLM juez de gran tamano. Es relevante porque demuestra que un adaptador de 4B de parametros puede superar a jueces como Claude Sonnet 5.5 en esta tarea especifica a una fraccion del coste.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3.5) con capas Gated DeltaNet; adaptador LoRA sobre el modelo base |
| Parametros totales | 4B en el modelo base (no disponible el desglose exacto del adaptador) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible explicitamente (heredada del modelo base Qwen3.5-4B) |
| Tipos de cuantizacion | no disponible (pesos del adaptador en safetensors bf16; el modelo base admite las cuantizaciones habituales de Qwen3.5) |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); requiere fusion con el modelo base para vLLM |

## Arquitectura y entrenamiento

El adaptador se aplica sobre un modelo base Qwen3.5 de 4B parametros, un transformer decoder-only que incorpora capas Gated DeltaNet. El LoRA tiene rango 32, alpha 64 y dropout 0, y se aplica a las proyecciones q/k/v/o/gate/up/down y a las proyecciones especificas de Gated DeltaNet (`in_proj_qkv`, `in_proj_z`, `out_proj`). El entrenamiento usa learning rate 2e-4 con scheduler coseno y 3 % de warmup, AdamW (0.9, 0.999), weight decay 0, pasos de aproximadamente 64k tokens, 2 epocas (617 pasos), precision bf16 y una sola semilla.

Cada fila de entrenamiento combina un ejemplo de lectura (entropia cruzada sobre las tres letras de opcion, con el orden de opciones barajado en la mitad de los ejemplos) y un ejemplo de justificacion (el razonamiento escrito del dataset como texto de pensamiento seguido de la letra). Las justificaciones son solo objetivos de entrenamiento, nunca entradas. Por epoca se usan los 8.581 pares de entrenamiento de `Mercity/policy-nli` con su conversacion previa, mas 6.000 filas dialogo x regla extraidas de un pool balanceado de 12.000 filas construido a partir del split de entrenamiento de DynaBench. Ningun dialogo de test de DynaBench aparece en entrenamiento. La innovacion principal es el diseno de lectura rapida: la decision se toma de un unico token restringido a tres identificadores de letra, y el modo de justificacion (thinking) es opcional y solo para revisores.

## Capacidades

- Clasificacion de cumplimiento de politicas en tres clases (`followed`, `violated`, `not_applicable`) con probabilidades calibradas en un solo paso hacia delante.
- Evaluacion de una respuesta concreta del asistente usando el contexto previo de la conversacion (`crit="context"`).
- Evaluacion de un dialogo completo frente a una regla en formato DynaBench (`crit="dialogue"`).
- Generacion opcional de una justificacion estilo juez (modo thinking) para revision humana.
- Puntuacion de violacion mediante `z[1] - logsumexp(z[[0, 2]], 0)` para ranking y umbralizado.
- Soporte de calibracion de temperatura mediante `calibration.json`.
- Capacidad de operar en cascada: un encoder filtra todos los casos y solo el 20 % superior pasa al adaptador.
- Multilingue: limitado a ingles.

## Casos de uso

- Supervision de respuestas en atencion al cliente automatizada: el modelo recibe el historial de la conversacion y la respuesta generada, y devuelve la probabilidad de violacion de cada politica, permitiendo bloquear o marcar respuestas antes de enviarlas al cliente.
- Guardrails en produccion para asistentes LLM: integrado como paso de verificacion post-generacion, con un coste aproximado de 28 comprobaciones por segundo en una A100 (unos 20 USD por millon de comprobaciones) y reducible a unos 5 USD con cascada de encoder.
- Auditoria de conversaciones historicas: procesar transcripciones completas en formato DynaBench contra reglas de cumplimiento para detectar incumplimientos en lotes.
- Revision de cumplimiento normativo en dominios regulados: comprobar que las respuestas no prometen condiciones fuera de politica (por ejemplo, reembolsos o plazos) usando el contexto previo para detectar contradicciones.
- Enrutamiento a revision humana: usar el score de violacion como ranking para priorizar los casos que revisan los analistas, aprovechando el AP de violacion de 0.404 en el split de test.
- Evaluacion de calidad de otros LLM: emplear el adaptador como juez especializado y barato frente a jueces generalistas como Claude Sonnet 5.5, con mejor macro-F1 (0.747 frente a 0.686) en el conjunto de test.
- Filtrado previo en pipelines de RLHF o evaluacion: marcar respuestas que violan politicas antes de incluirlas en datasets de preferencias o de evaluacion.

## Benchmarks y rendimiento

Resultados en el test de policy-nli (20.435 comprobaciones, 80 violaciones, 0.39 %), con intervalos bootstrap al 95 % sobre conversaciones:

| Modelo | Macro-F1 | AP de violacion | Detectadas a 1 % de falsos positivos | Detectadas a 5 % |
|---|---|---|---|---|
| Este adaptador (v2) | 0.747 [0.725, 0.768] | 0.404 [0.306, 0.515] | 67 / 80 (0.84 [0.75, 0.91]) | 0.95 |
| v1 (sin contexto) | 0.694 | 0.238 | 49 / 80 | 0.89 |
| Claude Sonnet 5.5 como juez (sin contexto) | 0.686 | 0.125 | 33-34 / 80 | 0.73 |
| ModernBERT-large ajustado (encoder) | 0.662 | 0.128 | 38 / 80 | 0.78 |
| DynaGuard-8B | no disponible | 0.023 | 8 / 80 | no disponible |
| Cascada: encoder + este adaptador (top 20 %) | no disponible | no disponible | 67 / 80 | no disponible |

Split contestado (1.010 comprobaciones con desacuerdo del etiquetador): AP de violacion 0.270, el mejor de todos los modelos probados (Sonnet 5.5: 0.248). Validacion (balanceada, mayoritariamente violaciones editadas por LLM): macro-F1 0.966, AP de violacion 0.990.

Resultados en DynaBench test (543 dialogos construidos a mano; el dialogo falla si alguna regla se marca):

| Modelo | F1 | AP | AUROC |
|---|---|---|---|
| Este adaptador (v2), decision por defecto | 0.807 | 0.896 | 0.904 |
| Este adaptador (v2), regla P(violated) > 1/2 | 0.829 | no disponible | no disponible |
| DynaGuard-8B | 0.822 | 0.897 | no disponible |
| Claude Haiku 5.5 | 0.89 | no disponible | no disponible |
| Claude Sonnet 5.5 | 0.88 | no disponible | no disponible |

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; el modelo base es de 4B parametros, por lo que en bf16 requiere aproximadamente 8 GB de VRAM y en cuantizacion de 4 bits alrededor de 3-4 GB (estimacion estandar, no confirmada en la model card).
- GPU recomendadas: A100 para el escenario de coste reportado (28 comprobaciones/s, unos 20 USD por millon de comprobaciones antes de cache de prefijo). GPU consumer como RTX 4090 deberian poder ejecutar el modelo base en bf16 o cuantizado.
- Cabe en GPU consumer: si, previsiblemente en RTX 3090, RTX 4090 y GPUs con 8 GB o mas en bf16, y en GPUs con 4-6 GB en cuantizacion de 4 bits.
- Opciones de despliegue: transformers + PEFT (recomendado en la model card), vLLM tras fusionar el adaptador con `merge_lora.py` (vLLM ignora LoRA en las capas Gated DeltaNet de Qwen3.5). No se mencionan llama.cpp, Ollama ni TGI.
- Latencia y throughput: aproximadamente 28 comprobaciones por segundo en una A100 antes de cache de prefijo; la cascada con encoder reduce el coste a unos 5 USD por millon de comprobaciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Macro-F1 (policy-nli) | Detectadas a 1 % FP | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Este adaptador (v2) | 4B (base) | no disponible | 0.747 | 67 / 80 | Apache 2.0 | Hugging Face |
| DynaGuard-8B | 8B | no disponible | no disponible (F1 0.822 en DynaBench) | 8 / 80 | no disponible | no disponible |
| ModernBERT-large ajustado | encoder (tamano no disponible) | no disponible | 0.662 | 38 / 80 | no disponible | no disponible |
| Claude Sonnet 5.5 (juez) | no disponible (API) | no disponible | 0.686 | 33-34 / 80 | propietaria | API |

## Limitaciones y advertencias

- Solo cubre texto de atencion al cliente en ingles; no se ha validado en otros idiomas ni dominios.
- Las etiquetas de entrenamiento son de juez estricto y la mayoria de las violaciones de entrenamiento son ediciones generadas por LLM; los deslices reales que parecen conformes siguen siendo la principal fuente de error (13 de 80 violaciones de test no detectadas al 1 % de falsos positivos).
- El modo de justificacion (thinking) es solo para revisores: en v1 la respuesta leida tras la justificacion era menos precisa que la lectura rapida, por lo que la decision debe tomarse del token de lectura.
- vLLM ignora el LoRA en las capas Gated DeltaNet de Qwen3.5, por lo que es obligatorio fusionar el adaptador antes de desplegar en ese motor.
- El coste de comprobar cada politica contra cada respuesta con la conversacion completa es de unos 20 USD por millon de comprobaciones en una A100; sin cascada puede resultar caro a gran escala.
- Riesgo de alucinacion en las justificaciones generadas en modo thinking; no deben usarse como unica evidencia en auditorias.
- El modelo se publica como adaptador PEFT: requiere descargar y cargar el modelo base `Mercity/decision-model-qwen3.5-4b`, cuyas condiciones de uso y limitaciones se heredan.
- La licencia Apache 2.0 permite uso comercial, pero los datasets de entrenamiento tienen sus propias licencias (policy-nli CC-BY-4.0, DynaBench MIT) que conviene revisar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Mercity/policy-nli-decision-model-4b-lora
- Modelo base: https://huggingface.co/Mercity/decision-model-qwen3.5-4b
- Dataset de entrenamiento principal: https://huggingface.co/datasets/Mercity/policy-nli
- Dataset DynaBench: https://huggingface.co/datasets/tomg-group-umd/DynaBench
- Registro completo de entrenamiento (codigo, datos, logs, predicciones e informes): https://huggingface.co/buckets/Mercity/Policy-NLI
