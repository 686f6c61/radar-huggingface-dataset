# Papajams/aya-expanse-8b-lexsi-v4

## Resumen

`aya-expanse-8b-lexsi-v4` es un adaptador LoRA (no un modelo completo) publicado por el usuario Papajams sobre el modelo base `CohereLabs/aya-expanse-8b` de Cohere For AI. El adaptador se entrenó para la Lexsi AI Safety & Alignment Hackathon, en la pista de fine-tuning agéntico (Track 3), con el objetivo de que un agente tome decisiones de gobernanza de gasto (permitir, rechazar, escalar o pedir aclaración) antes de que una acción llegue al sistema de ejecución del pago.

El modelo base Aya Expanse 8B es un transformer decoder-only de 8.000 millones de parámetros, entrenado por Cohere For AI para capacidades multilingües avanzadas, con un contexto que la model card del adaptador no especifica. El adaptador en sí ocupa 0,2 GB y se distribuye en formato PEFT/safetensors, con licencia Apache 2.0.

Su relevancia es acotada: no es un modelo de propósito general ni una release de investigación amplia, sino un artefacto de hackathon que demuestra una técnica concreta (SFT con LoRA sobre etiquetas deterministas más rejection sampling) aplicada a un dominio muy específico de seguridad en agentes. No hay descargas ni likes registrados en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre transformer decoder-only (modelo base Aya Expanse 8B) |
| Parametros totales | 8.000 millones en el modelo base; el adaptador LoRA ocupa 0,2 GB en disco |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el adaptador se publica en safetensors; la cuantizacion dependeria del modelo base) |
| Idiomas soportados | no disponible en la model card del adaptador; el base Aya Expanse 8B esta disenado para cobertura multilingue amplia |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |
| Rango LoRA | r=16, alpha=32, dropout 0,05 |
| Dataset de entrenamiento | `Papajams/lexsi-governance` (1.467 ejemplos) |
| Libreria | peft, transformers |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Aya Expanse 8B, un transformer decoder-only de la familia Command de Cohere, ajustado por Cohere For AI con entrenamiento de preferencias multilingue, safety tuning y model merging. El adaptador LoRA tiene rango 16, alpha 32 y dropout 0,05, y se entrena con la libreria PEFT y el Trainer de transformers, en 2 epocas, precision fp16 y enmascaramiento de etiquetas solo en el turno del asistente.

El conjunto de entrenamiento consta de 1.467 ejemplos: 600 escenarios etiquetados por un oraculo determinista y 867 completaciones obtenidas por rejection sampling a partir de las salidas correctas del propio modelo base (RFT, rejection fine-tuning). El entrenamiento se ejecuto en 2 GPU Tesla T4 en Kaggle. Dado que Aya Expanse no dispone de plantilla nativa de tool calling, el modelo emite un registro estructurado en un solo turno en lugar de una llamada a herramienta. El kernel de entrenamiento (`papajams/lexsi-train-eval`) es privado y las notas de reproduccion estan en la model card del dataset.

## Capacidades

- Emision de decisiones de gobernanza de gasto en JSON estructurado con los campos `decision`, `reason_code`, `checks`, `item_decisions` y `rationale`.
- Valores de decision soportados: `ALLOW`, `REFUSE`, `ESCALATE` y `ASK_CLARIFICATION`, tanto a nivel global como por item.
- Razonamiento sobre mandatos de gasto: presupuesto, lista de proveedores permitidos, categorias bloqueadas y umbrales de aprobacion.
- Capacidad multilingue heredada del modelo base Aya Expanse 8B (la model card del adaptador no detalla idiomas concretos).
- No soporta tool calling nativo; la salida es un registro estructurado de un solo turno.
- No se documentan capacidades de vision, audio, modo thinking ni razonamiento multi-paso mas alla del turno unico.

## Casos de uso

- Gobernanza de gasto en agentes autonomos: el adaptador recibe un mandato de gasto y una solicitud de compra y emite una decision JSON que un orquestador puede evaluar antes de ejecutar el pago, reduciendo las violaciones que llegan al sistema de cobro.
- Filtro previo a la ejecucion en pipelines de compras: se puede insertar como paso de validacion entre la propuesta del agente y la pasarela de pago, con codigos de razon auditables.
- Escalado a revision humana: cuando la decision es `ESCALATE` o `ASK_CLARIFICATION`, el sistema puede derivar el caso a un operador con el `rationale` generado como contexto.
- Auditoria y trazabilidad: el campo `checks` y `item_decisions` permite registrar por que se permitio o rechazo cada item de una solicitud, util para cumplimiento interno.
- Investigacion en safety de agentes: sirve como referencia reproducible de fine-tuning agéntico con etiquetas deterministas y RFT sobre un modelo multilingue.
- Prototipado rapido en hackathons y entornos de laboratorio: al ser un adaptador de 0,2 GB, se puede cargar sobre el base en GPUs modestas (el entrenamiento se hizo en 2 T4) para experimentar con politicas de gasto.

## Benchmarks y rendimiento

Resultados sobre la suite de gobernanza de 22 escenarios held-out reportados en la model card:

| Metrica | Base | + adaptador (v4) |
|---|---|---|
| Precision (accuracy) | 59,1% | 59,1% |
| Decisiones inseguras ejecutadas | 6/17 (35,3%) | 2/17 (11,8%) |
| Validez de contrato | 22/22 | 22/22 |

"Decision insegura ejecutada" se define como un `ALLOW` valido segun contrato emitido cuando la politica exige `REFUSE`, `ESCALATE` o `ASK_CLARIFICATION`, es decir, una violacion que habria llegado al pago. La precision global no mejora; la ganancia se concentra en la reduccion de violaciones ejecutadas. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; el adaptador anade 0,2 GB sobre el modelo base de 8.000 millones de parametros. En fp16 el base ronda los 16 GB; en cuantizacion de 4 bits, aproximadamente 5-6 GB (estimacion orientativa, no confirmada en la model card).
- GPU recomendadas: el entrenamiento se realizo en 2x Tesla T4; para inferencia son adecuadas A100, H100, L4 o RTX 4090.
- Cabe en GPU de consumo: si, en tarjetas con suficiente VRAM para el base cuantizado (por ejemplo, RTX 3090/4090 con cuantizacion de 4 u 8 bits).
- Opciones de despliegue: transformers + PEFT (documentado en la model card); vLLM, llama.cpp, Ollama o TGI no estan documentados para este adaptador.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| aya-expanse-8b-lexsi-v4 | 8B (base) + LoRA | no disponible | Gobernanza de gasto agéntica | Apache 2.0 | Hugging Face (0 descargas) |
| CohereLabs/aya-expanse-8b | 8B | no disponible | Multilingue generalista | no disponible en la informacion | Hugging Face (modelo base) |
| jebish7/aya-expanse-8b | 8B | no disponible | Copia/derivado del base | no disponible en la informacion | Hugging Face |

No se dispone de datos de rendimiento comparables entre estos modelos en la informacion proporcionada; la comparativa se limita a parametros, licencia y disponibilidad.

## Limitaciones y advertencias

- La precision global no mejora respecto al modelo base (59,1% en ambos); solo disminuye la tasa de violaciones ejecutadas, y aun quedan 2 de 17 decisiones inseguras.
- El adaptador esta entrenado sobre un unico dominio (gobernanza de gasto) y un formato de salida fijo; su uso fuera de ese esquema no esta validado.
- No dispone de plantilla nativa de tool calling en el base, por lo que la integracion requiere parsear el JSON de salida manualmente.
- El kernel de entrenamiento es privado, lo que limita la reproduccion exacta del pipeline.
- La model card no detalla sesgos conocidos, idiomas concretos ni riesgos de alucinacion; al ser un modelo de 8B, el riesgo de generar JSON invalido o razonamientos incorrectos existe y debe mitigarse con validacion de esquema.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base Aya Expanse 8B tiene sus propias condiciones que deben verificarse por separado.
- El repositorio no registra descargas ni likes, por lo que no hay evidencia de uso en produccion.
- No apto como modelo de proposito general: es un artefacto de hackathon con validacion limitada a 22 escenarios.

## Enlaces

- Adaptador en Hugging Face: https://huggingface.co/Papajams/aya-expanse-8b-lexsi-v4
- Modelo base: https://huggingface.co/CohereLabs/aya-expanse-8b
- Dataset de gobernanza: https://huggingface.co/datasets/Papajams/lexsi-governance
- Repositorio cognivern: https://github.com/thisyearnofear/cognivern
- Derivado del base (referencia): https://huggingface.co/jebish7/aya-expanse-8b
