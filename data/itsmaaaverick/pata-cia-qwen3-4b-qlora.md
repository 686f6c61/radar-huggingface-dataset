# ItsMaaaverick/Pata-Cia-Qwen3-4B-QLoRA

## Resumen

Pata & Cia - Qwen3-4B com QLoRA es un adaptador PEFT de tipo QLoRA entrenado sobre el modelo base unsloth/Qwen3-4B por el usuario ItsMaaaverick. Se presenta como el asistente de atencion al cliente de un pet shop ficticio orientado a perros y gatos, con cobertura de catalogo, banos y peluqueria canina, cepillado felino, agenda, entrega local, recogida, pagos y el programa de fidelidad Clube Patinhas. El modelo no diagnostica ni receta, no consulta stock o agenda en tiempo real y no ejecuta transacciones.

El repositorio contiene unicamente los adaptadores (aproximadamente 0,1 GB) y el tokenizer, no los pesos base. El entrenamiento se realizo en una Tesla T4 de Colab el 18/10/2026 con 550 conversaciones sinteticas, de las cuales 495 se usaron para entrenamiento y 55 para validacion. La perdida de entrenamiento reportada es 0,9128 y la de validacion 0,9719 tras dos epocas.

Su interes es principalmente educativo: demuestra un pipeline completo de generacion de datos sinteticos, entrenamiento QLoRA con rsLoRA y publicacion en HuggingFace. El propio autor advierte que se observaron datos comerciales inventados y que el modelo no esta listo para atencion autonoma. No se han publicado benchmarks ni comparaciones cuantitativas con el modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador QLoRA sobre Qwen3-4B (transformer decoder-only denso) |
| Parametros totales | 4,0B en el modelo base; adaptadores LoRA de rango 16 sobre 7 modulos |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 2048 tokens configurados en el entrenamiento; el modelo base Qwen3-4B soporta contexto nativo mayor (dato no verificado en la informacion del repositorio) |
| Tipos de cuantizacion | Base cargada en 4 bits (QLoRA/NF4) durante el entrenamiento; adaptadores en safetensors con precision no especificada |
| Idiomas soportados | portugues (pt); el prompt de sistema fija portugues de Brasil |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptadores PEFT/LoRA) + tokenizer; no incluye pesos base |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen3-4B, un transformer decoder-only denso de la familia Qwen3 con 4,0B parametros. El ajuste utiliza QLoRA: la base se congela en 4 bits (`load_in_4bit`), con adaptadores rsLoRA (`use_rslora`) de rango 16 y alpha 16 sobre los modulos `q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj` y `down_proj`, sin bias. La perdida se calcula solo sobre las respuestas (`train_on_responses_only`) y no se aplica packing; la longitud maxima de secuencia es 2048. El entrenamiento usa AdamW de 8 bits, learning rate 1e-4, scheduler coseno, warmup 0,05, weight decay 0,01, `max_grad_norm` 1,0, batch efectivo 8 y 2 epocas. La generacion se configura con `do_sample=false` y `max_new_tokens=256`, y el template de chat usa `enable_thinking=False`.

Los datos provienen de un dataset separado, ItsMaaaverick/Pata-Cia-QA-Sintetico, con 550 conversaciones en formato `messages` (`system`, `user`, `assistant`) sobre 19 temas. Segun la model card, 280 pares centrales se redactaron con apoyo de LLM y 270 se derivaron por codigo en escenarios de catalogo, presupuesto, carrito, envio y fidelidad. Existe repeticion de estructuras: no son 550 politicas independientes. Los grupos de SKU, presupuesto y carrito se mantuvieron en el mismo split para evitar fuga de informacion. No se reporta RLHF ni DPO; el ajuste es supervisado.

## Capacidades

- Generacion de texto conversacional en portugues de Brasil para un dominio cerrado de pet shop ficticio.
- Respuestas de catalogo, precios y disponibilidad segun los datos sinteticos de `CATALOGO.json` (sin acceso a stock real).
- Informacion sobre servicios de banos y peluqueria canina, cepillado felino, agenda, entrega local, recogida y pagos.
- Explicacion del programa de fidelidad Clube Patinhas.
- Gestion de conversaciones multi-turno con contexto de hasta 2048 tokens.
- Orientacion no clinica: el prompt de sistema indica derivar diagnosticos, prescripciones y dietas al veterinario.
- Soporte de tool calling / function calling: no disponible.
- Capacidades de agente y razonamiento multi-paso: no disponibles de forma declarada.
- Capacidades de vision o audio: no disponibles.
- Modo thinking: explicitamente desactivado (`enable_thinking=False`).

## Casos de uso

- Prototipo educativo de atencion al cliente: permite demostrar un flujo completo de entrenamiento QLoRA y despliegue de un asistente de dominio cerrado sin coste de datos reales.
- Generacion de respuestas FAQ multi-turno: el adaptador cubre 19 temas del pet shop y mantiene contexto de 2048 tokens, suficiente para conversaciones de soporte tipicas.
- Base para un segundo ajuste supervisado: al ser un adaptador PEFT independiente, puede combinarse con nuevos datos de otro negocio reutilizando la misma base Qwen3-4B.
- Evaluacion de pipelines de datos sinteticos: sirve como caso de estudio para medir deriva entre datos generados por LLM y datos derivados por codigo.
- Material docente sobre QLoRA y rsLoRA: el repositorio publica hiperparametros, semilla, revision del modelo base y evidencias de entrenamiento, lo que facilita la reproduccion en clase.
- Simulacion de escenarios de compra y fidelidad: util para probar plantillas de prompt y validadores antes de conectar el asistente a un backend real.
- Demostracion de limites de seguridad: el propio autor documenta alucinaciones en datos comerciales, lo que sirve para disenar filtros y verificaciones en produccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente reporta metricas de entrenamiento y validacion:

| Metrica | Valor |
|---|---|
| `train_runtime` | 586,8801 s |
| `train_samples_per_second` | 1,687 |
| `train_steps_per_second` | 0,211 |
| `train_loss` | 0,9128 |
| Epocas | 2,0 |
| `total_flos` | 5,317e15 |
| `eval_loss` | 0,9719 |
| `eval_runtime` | 9,8705 s |
| `eval_samples_per_second` | 5,572 |

La propia model card advierte que la perdida no mide exactitud factual ni seguridad, y que no se afirma mejora sobre el modelo base sin una comparacion directa, que no se ha publicado.

## Requisitos de hardware

- Espacio en disco del adaptador: aproximadamente 0,1 GB (solo adaptadores y tokenizer).
- VRAM para inferencia: el modelo base Qwen3-4B cargado en 4 bits ocupa del orden de 2,5-3 GB; en fp16 completo, en torno a 8-10 GB. Valores estimados a partir del tamano, no publicados en la model card.
- Entrenamiento documentado: una Tesla T4 de 16 GB (Google Colab), con 495 ejemplos, batch efectivo 8 y 2 epocas en aproximadamente 587 s.
- GPU recomendadas para inferencia: cualquier GPU consumer con 8 GB o mas (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090) puede ejecutar el modelo base en 4 bits con el adaptador. Para fp16 se recomienda A100, H100 o RTX 4090.
- Despliegue: la model card documenta `FastLanguageModel` de Unsloth junto con `PeftModel` de PEFT. Tambien es viable vLLM con soporte LoRA, llama.cpp u Ollama tras fusionar el adaptador con los pesos base.
- Latencia y throughput: no disponibles en la informacion proporcionada.
- Requisitos de software: Python 3.12, `requirements-colab.txt` del autor y GPU NVIDIA.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Pata-Cia-Qwen3-4B-QLoRA | 4,0B base + LoRA r=16 | 2048 (entrenamiento) | Atencion al cliente de pet shop ficticio | Apache 2.0 | HuggingFace, 0 descargas |
| Qwen3-4B (base) | 4,0B | mayor que 2048 (nativo); valor exacto no verificado en la informacion | Proposito general, multilingue | Apache 2.0 | HuggingFace / Unsloth |
| BoraLog-Qwen3-4B-QLoRA | 4,0B base + LoRA | no disponible | no disponible (repositorio sin model card) | no disponible | HuggingFace, mismo autor |
| Llama 3.2 3B Instruct | 3,2B | no disponible en la informacion proporcionada | Proposito general | Llama 3.2 Community License | HuggingFace |

La comparacion cuantitativa de rendimiento entre estos modelos no esta disponible: el autor no publica evaluaciones frente al base ni frente a alternativas.

## Limitaciones y advertencias

- Riesgo de alucinacion documentado: el autor indica que se observaron informaciones comerciales inventadas durante las pruebas.
- No apto para atencion autonoma: la propia model card lo declara como uso educacional y no listo para produccion.
- Dominio artificial: el pet shop es ficticio y los datos proceden de `DOMINIO.md` y `CATALOGO.json` sinteticos; no refleja ningun negocio real.
- Sin acceso a datos en tiempo real: no consulta stock, agenda ni estado de pedidos, y no ejecuta compras, reservas, cancelaciones ni devoluciones.
- Fuera de alcance clinico: no diagnostica, no prescribe, no indica dosis ni dietas veterinarias.
- Contexto efectivo limitado a 2048 tokens por la configuracion de entrenamiento, inferior al contexto nativo del modelo base.
- Idioma unico: solo portugues (Brasil); no se ha entrenado para castellano ni otros idiomas.
- Dataset pequeno y repetitivo: 550 conversaciones con estructuras repetidas; la validacion es interna al escenario y no garantiza generalizacion.
- La validacion de 57 pares se registro antes del entrenamiento pero no cubre las 550 conversaciones, segun reconoce el autor.
- Sin comparacion con el modelo base: no se puede atribuir mejora alguna al ajuste.
- Licencia Apache 2.0 permisiva para uso comercial del adaptador, pero el modelo base Qwen3-4B mantiene su propia licencia y conviene verificarla antes de un despliegue.
- Repositorio sin descargas ni likes en el momento de la consulta: no hay evidencia de uso por terceros.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ItsMaaaverick/Pata-Cia-Qwen3-4B-QLoRA
- Dataset de entrenamiento: https://huggingface.co/datasets/ItsMaaaverick/Pata-Cia-QA-Sintetico
- Modelo base: https://huggingface.co/unsloth/Qwen3-4B
- Otro adaptador del mismo autor: https://huggingface.co/ItsMaaaverick/BoraLog-Qwen3-4B-QLoRA
- Guia de referencia sobre fine-tuning de Qwen3-4B con LoRA para soporte al cliente: https://layerx.xyz/blog/fine-tuning-small-llm-customer-support
- Tutorial de fine-tuning completo de Qwen3-4B en Databricks: https://docs.databricks.com/aws/en/machine-learning/ai-runtime/examples/tutorials/sgc-finetune-qwen3-4b
