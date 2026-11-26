# lt3025/qwen2.5-1.5b-instruct-bitext-intent

## Resumen

`lt3025/qwen2.5-1.5b-instruct-bitext-intent` es un ajuste fino mediante LoRA del modelo base Qwen2.5-1.5B-Instruct de Alibaba, orientado a la identificacion de intenciones en conversaciones de atencion al cliente. Lo publica el usuario lt3025 como proyecto de curso, con los pesos LoRA fusionados en los pesos base y almacenados en bfloat16. El modelo no introduce una arquitectura nueva: hereda el transformer decoder-only de Qwen2.5 con 1.543.714.304 parametros y una ventana de contexto de 32.768 tokens (la del modelo base).

El problema que aborda es acotado y practico: clasificar el mensaje de un cliente en una de las 27 etiquetas de intencion del dataset Bitext de soporte al cliente, en formato zero-shot con un system prompt que enumera las etiquetas. Segun la model card, el ajuste se realizo con r=16, alpha=32, todas las capas lineales, learning rate 0.0002, una epoca y 5.400 ejemplos, y reporta una exactitud de 0.997 y un macro-F1 de 0.997 sobre el split de test de Bitext agrupando casi duplicados.

Su relevancia es la de un artefacto de referencia pequeno y ligero para tareas de enrutado y triaje en soporte: cabe en GPU de consumo, se puede servir con vLLM o llama.cpp y su licencia Apache-2.0 permite uso comercial. No es un modelo generalista ni compite con LLM de mayor tamano; su valor esta en el ajuste especifico y en la trazabilidad del procedimiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2), ajuste LoRA fusionado en los pesos base |
| Parametros totales | 1.543.714.304 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens (heredada de Qwen2.5-1.5B-Instruct; no confirmada en la model card del ajuste) |
| Tipos de cuantizacion | no disponible en el repo (pesos en bfloat16); al derivar de Qwen2.5 admite cuantizacion GGUF/AWQ en herramientas externas |
| Idiomas soportados | no disponible (el dataset Bitext es predominantemente en ingles; la model card no declara idiomas) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (bfloat16) |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-1.5B-Instruct, un transformer decoder-only denso con atencion causal estandar, RoPE y normalizacion RMSNorm, y aplica sobre el un ajuste supervisado con LoRA de rango 16 y alpha 32 sobre todas las capas lineales. El entrenamiento consistio en una epoca con learning rate 0.0002 sobre 5.400 ejemplos del dataset `bitext/Bitext-customer-support-llm-chatbot-training-dataset`. Posteriormente los adaptadores se fusionaron en los pesos base y se guardaron en bfloat16, de modo que la inferencia no requiere cargar adaptadores por separado.

La innovacion tecnica es minima y deliberada: no hay RLHF, DPO ni decodificacion especulativa propia; el ajuste es de instruccion supervisada sobre una tarea de clasificacion con 27 etiquetas presentadas en el system prompt en regimen zero-shot. El formato exacto del prompt no esta en la model card y remite a `app/intent_prompt.py` del repositorio del proyecto, que no se enlaza en la informacion disponible.

## Capacidades

- Clasificacion de intencion en mensajes de soporte al cliente entre 27 etiquetas del dataset Bitext, en modo zero-shot con system prompt.
- Generacion de texto conversacional heredada de Qwen2.5-1.5B-Instruct (respuestas de chat multi-turno).
- Razonamiento basico y respuesta a instrucciones propias del modelo base.
- Soporte de tool calling y function calling heredado del modelo base Qwen2.5 (no validado especificamente tras el ajuste).
- Capacidades multilingues del modelo base, aunque el ajuste se realizo sobre un dataset predominantemente en ingles y la model card no declara idiomas.
- Salida orientada a sugerencias para personal humano: la model card indica explicitamente que las salidas son sugerencias, nunca acciones.

## Casos de uso

- Triaje de tickets en mesas de ayuda: clasificar cada mensaje entrante en una de las 27 intenciones de Bitext para enrutarlo al equipo adecuado, aprovechando la exactitud reportada de 0.997 en el split de test.
- Enrutado en chatbots de atencion al cliente: usar la etiqueta de intencion como primer paso antes de invocar un flujo o herramienta concreta, con el modelo actuando como clasificador ligero previo a un LLM mayor.
- Etiquetado y enriquecimiento de historicos de conversaciones: procesar lotes de transcripciones para anadir metadatos de intencion y alimentar analitica de motivos de contacto.
- Filtrado y priorizacion en bandejas de entrada: detectar intenciones de cancelacion, reclamacion o facturacion para priorizar su atencion por el personal.
- Prototipado rapido en entornos academicos: servir de referencia reproducible de un pipeline LoRA sobre un modelo pequeno, con licencia Apache-2.0 y pesos en safetensors.
- Asistencia a agentes humanos en tiempo real: sugerir la categoria del mensaje mientras el operador redacta la respuesta, dado el bajo coste de inferencia de un modelo de 1.5B.
- Evaluacion de clasificadores en produccion: comparar contra reglas o modelos mayores en tareas de intencion acotadas, con la cautela de que las metricas reportadas provienen de un unico split.

## Benchmarks y rendimiento

| Benchmark | Resultado | Notas |
|---|---|---|
| Bitext test split (near-duplicates agrupados), accuracy | 0.997 | Reportado por el autor en la model card |
| Bitext test split (near-duplicates agrupados), macro-F1 | 0.997 | Reportado por el autor en la model card |

No se han publicado resultados de benchmarks en la informacion disponible para MMLU, HumanEval, GSM8K ni otras evaluaciones generales. Las cifras de Bitext son las unicas reportadas y no se han verificado de forma independiente.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 3,1 GB solo para pesos, mas cache KV; en la practica unos 4-6 GB para contexto moderado.
- VRAM estimada en cuantizacion de 8 bits: alrededor de 1,6 GB de pesos; en 4 bits, alrededor de 0,8-1 GB, con overhead adicional.
- GPU recomendadas: cualquier GPU con 8 GB o mas (RTX 3060/4060, RTX 3070/4070, RTX 4090) para bfloat16; A100 o H100 no son necesarias y solo aportan throughput.
- Cabe en GPU de consumo: si, en la mayoria de tarjetas con 8 GB o mas; con cuantizacion cabe en GPUs de 4-6 GB.
- Opciones de despliegue: vLLM, TGI, llama.cpp (requiere conversion a GGUF), Ollama (via GGUF) y transformers con `AutoModelForCausalLM`.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| lt3025/qwen2.5-1.5b-instruct-bitext-intent | 1.543.714.304 | 32.768 (heredado, no confirmado) | Clasificacion de intencion en soporte (27 etiquetas) | apache-2.0 | Hugging Face |
| Qwen/Qwen2.5-1.5B-Instruct | 1.543.714.304 | 32.768 | Instruccion general | apache-2.0 | Hugging Face |
| Qwen/Qwen2.5-0.5B-Instruct | no disponible | 32.768 | Instruccion general | apache-2.0 | Hugging Face |
| Meta Llama 3.2 1B Instruct | no disponible | 128.000 | Instruccion general | Llama 3.2 Community License | Hugging Face |

La comparativa con alternativas especificas de clasificacion de intenciones en soporte no esta disponible en la informacion proporcionada. El modelo solo es directamente comparable con su base en la tarea concreta de Bitext, y no se han publicado resultados del base en esa tarea.

## Limitaciones y advertencias

- Modelo de proyecto de curso: no hay evidencia de validacion independiente ni de uso en produccion; las metricas de 0.997 provienen del propio autor.
- Riesgo de sobreajuste al dataset Bitext: 5.400 ejemplos y una epoca sobre 27 etiquetas pueden no generalizar a dominios, idiomas o estilos distintos.
- El split de test agrupa casi duplicados, pero sigue siendo el mismo corpus; la exactitud real en trafico nuevo puede ser inferior.
- Idiomas no declarados: el dataset Bitext es mayoritariamente en ingles; el rendimiento en castellano u otros idiomas no esta documentado.
- El formato de prompt exacto no esta en la model card y remite a un fichero del repositorio del proyecto no enlazado; usarlo fuera de ese formato puede degradar la clasificacion.
- Riesgo de alucinacion inherente a un modelo generativo: puede producir etiquetas fuera del conjunto de 27 o texto adicional si no se restringe la decodificacion.
- Sesgos del dataset Bitext (dominio de comercio electronico, vocabulario acotado) pueden trasladarse al clasificador.
- La model card advierte que las salidas son sugerencias para personal, nunca acciones; no debe usarse para decisiones automaticas sin supervision.
- Licencia Apache-2.0 permite uso comercial, pero el modelo base Qwen2.5-1.5B-Instruct tambien es Apache-2.0, por lo que no hay restricciones adicionales conocidas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/lt3025/qwen2.5-1.5b-instruct-bitext-intent
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Dataset de entrenamiento: https://huggingface.co/datasets/bitext/Bitext-customer-support-llm-chatbot-training-dataset
- Repositorio del proyecto (referenciado en la model card como `app/intent_prompt.py`): no disponible como enlace en la informacion proporcionada.
