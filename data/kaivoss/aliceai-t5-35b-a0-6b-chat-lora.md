# kaivoss/AliceAI-T5-35B-A0.6B-chat-lora

## Resumen

AliceAI-T5-35B-A0.6B-chat-lora es un adaptador LoRA de rango 16 publicado por el usuario kaivoss sobre el modelo base yandex/AliceAI-T5-35B-A0.6B, un transformer encoder-decoder con arquitectura Mixture-of-Experts dispersa de 35.000 millones de parametros totales y 0,6 mil millones activos por token. El modelo base es un preentrenamiento de span-infilling segun el paradigma UL2, sin formato de chat nativo, por lo que el adaptador le ensena tres comportamientos concretos: conversacion multiturno con plantilla fija, emision de llamadas a herramientas mediante el marcado `<tool_call>...</tool_call>` y gestion explicita del fin de turno con `[REPLY_END]</s>`. 

El adaptador resuelve un problema practico de los modelos precargados orientados a rellenado de huecos: convertir un modelo sin interfaz conversacional en un asistente capaz de razonar, invocar funciones y detenerse correctamente cuando la conversacion ya ha terminado. Se entrena mediante LoRA sobre bf16, no QLoRA ni fine-tuning completo, con 200 pasos y 1.600 ejemplos en una unica GPU H200 SXM de 141 GB, con contexto de hasta 32.768 tokens. 

Es relevante para desarrolladores que quieran evaluar variantes de bajo coste de adaptacion sobre modelos MoE dispersos: al no poder envolver los expertos (estan fusionados como `nn.Parameter`), el adaptador demuestra que basta con ajustar la atencion para dotar de capacidades de chat y tool calling a un backbone UL2. Su licencia Apache 2.0 y su naturaleza de adaptador PEFT lo hacen facilmente reproducible y combinable con los pesos fusionados publicados por el mismo autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder con Mixture-of-Experts dispersa (preentrenamiento UL2 de span-infilling) |
| Parametros totales | 35.000 millones (modelo base) |
| Parametros activos | 0,6 mil millones (modelo base, MoE dispersa) |
| Longitud de contexto | 32.768 tokens (fuente + objetivo); ejemplos mas largos se descartan, no se truncan |
| Tipos de cuantizacion | no disponible (adaptador en bf16; no se documentan variantes GGUF ni cuantizadas) |
| Idiomas soportados | en, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo base es un encoder-decoder tipo T5 con capas de Mixture-of-Experts dispersas: de los 35.000 millones de parametros totales solo se activan 0,6 mil millones por token, lo que reduce el coste computacional de inferencia aunque mantiene la huella de memoria del modelo completo. Se preentreno con el objetivo UL2 (span-infilling) y no dispone de `chat_template.jinja` ni de formato conversacional en su repositorio original. Los expertos estan fusionados como `nn.Parameter` en lugar de `nn.Linear`, de modo que LoRA no puede envolverlos y el adaptador solo modifica la atencion.

El adaptador se entrena con LoRA en bf16 (no QLoRA ni fine-tuning completo) con rango 16, alpha 16 y dropout 0,05 (escala 1.0). Los modulos objetivo son `q_proj`, `k_proj`, `v_proj` y `o_proj` en la autoatencion del encoder, la autoatencion del decoder y la atencion cruzada del decoder. Se ejecutaron 200 pasos con batch 1 y 8 de acumulacion (1.600 ejemplos, cada uno visto una vez), optimizador AdamW con learning rate 2e-4, scheduler coseno, 10 pasos de calentamiento, bf16 y checkpointing de gradientes, sobre 1 GPU H200 SXM de 141 GB. Los datos provienen del conjunto kaivoss/UltraData-SFT-Agent-2609-GLM53-20k, con un ejemplo por turno del asistente y aproximadamente un 10% de ejemplos de "permanecer en silencio" cuyo objetivo es unicamente `</s>`. La plantilla de chat usa tokens delimitadores ya presentes en el vocabulario (sin necesidad de redimensionarlo) y el razonamiento se renderiza solo para el turno que se predice, eliminando el historico.

## Capacidades

- Generacion de texto conversacional multiturno en una plantilla fija de chat.
- Llamadas a herramientas y function calling: emite `<tool_call>...</tool_call>` con pares `<arg_key>` y `<arg_value>` cuando necesita una herramienta.
- Lectura de resultados de herramienta mediante turnos `[TOOL_RESULT_*]` y respuesta posterior.
- Razonamiento explicito en modo cadena de pensamiento, delimitado por `[COT_START]` y `[COT_END]`.
- Gestion del fin de turno: termina cada respuesta con `[REPLY_END]</s>` y devuelve cadena vacia (solo `</s>`) cuando la conversacion ya ha concluido en una respuesta del asistente.
- Capacidades multilingues limitadas a ingles (en) y chino (zh).
- Rellenado de huecos (span-infilling) heredado del preentrenamiento UL2 del modelo base.
- No se documentan capacidades de vision ni de audio.

## Casos de uso

- Atencion al cliente automatizada: el adaptador gestiona conversaciones multiturno con contexto de hasta 32.768 tokens, lo que permite mantener el historico completo de una sesion sin truncar en la mayoria de casos.
- Agentes con herramientas: el modelo decide cuando invocar una funcion mediante `<tool_call>`, lee el resultado en un turno `[TOOL_RESULT_*]` y compone la respuesta final, lo que encaja en flujos de function calling.
- Asistentes de razonamiento paso a paso: el bloque `[COT_START]...[COT_END]` permite separar el razonamiento intermedio del texto final, util para depurar y auditar decisiones.
- Pipelines ingles-chino: dado su soporte de en y zh, sirve para traduccion asistida o atencion bilingue en esos dos idiomas.
- Rellenado de plantillas y span-infilling: al heredar el preentrenamiento UL2, puede completar texto con huecos, util en tareas de aumento de datos o generacion estructurada.
- Prototipado de agentes de bajo coste de adaptacion: al ser un adaptador LoRA sobre un MoE disperso, permite experimentar con tool calling sin reentrenar el modelo completo.
- Gestion de turnos en sistemas de dialogo: el comportamiento de "permanecer en silencio" evita que el modelo genere turnos del usuario o respuestas redundantes cuando ya ha contestado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio menciona un script de comparacion entre el modelo base y el adaptador LoRA (`eval_chat.py`), pero no se proporcionan cifras de MMLU, HumanEval, GSM8K ni de ninguna otra metrica.

## Requisitos de hardware

- El modelo base tiene 35.000 millones de parametros totales; en bf16 ocupa aproximadamente 70 GB de pesos, por lo que la VRAM necesaria para inferencia en precision completa ronda esa cifra mas la cache KV del contexto de hasta 32.768 tokens.
- El entrenamiento documentado del adaptador se realizo en 1 GPU H200 SXM de 141 GB.
- Para inferencia en bf16 se recomienda H100 80 GB, A100 80 GB o configuraciones multi-GPU que alcancen los ~70 GB de pesos.
- No cabe en GPUs de consumo en bf16 de forma completa; con cuantizacion de 8 o 4 bits podria acercarse a GPUs de gama alta con gran cantidad de VRAM, aunque no se documentan tipos de cuantizacion soportados.
- Opciones de despliegue: el ejemplo oficial usa `transformers` con `AutoModelForSeq2SeqLM` y `PeftModel`, con `attn_implementation="eager"` y `trust_remote_code=True`. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponibles. La activacion de solo 0,6 mil millones de parametros por token reduce el coste computacional, pero la memoria sigue dominada por los 35.000 millones de parametros totales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| kaivoss/AliceAI-T5-35B-A0.6B-chat-lora | 35B totales / 0,6B activos | 32.768 tokens | Adaptador LoRA sobre MoE UL2 encoder-decoder | Apache 2.0 | HuggingFace |
| yandex/AliceAI-T5-35B-A0.6B (base) | 35B totales / 0,6B activos | no disponible | MoE UL2 encoder-decoder, span-infilling | no disponible | HuggingFace |
| kaivoss/AliceAI-T5-35B-A0.6B-chat (fusionado) | 35B totales / 0,6B activos | no disponible | Pesos fusionados bf16 del adaptador | Apache 2.0 | HuggingFace |

No se dispone de informacion sobre otros modelos comparables de la misma categoria en la documentacion proporcionada.

## Limitaciones y advertencias

- Solo soporta ingles (en) y chino (zh); no se documenta soporte de castellano ni de otros idiomas.
- El adaptador modifica unicamente la atencion; al estar los expertos fusionados como `nn.Parameter`, no se ajustan mediante LoRA, lo que limita el alcance del fine-tuning.
- Es un adaptador, no un modelo autonomo: requiere cargar el modelo base yandex/AliceAI-T5-35B-A0.6B para funcionar.
- El modelo base no tiene formato de chat nativo; toda la interfaz conversacional depende de la plantilla y los datos del adaptador.
- Riesgo de alucinacion inherente a los modelos generativos; no se han publicado evaluaciones de fidelidad ni de tasas de error.
- El formato de tool calling es especifico de esta plantilla (`<tool_call>`, `<arg_key>`, `<arg_value>`), heredado del formato de GLM-5.3-Flash; no es un esquema estandar universal.
- Los ejemplos de entrenamiento por encima de 32.768 tokens se descartan, no se truncan, lo que puede dejar fuera contenido de contexto muy largo.
- Requiere `trust_remote_code=True` para cargar el modelo y el tokenizador, con el riesgo de seguridad que ello implica en entornos no controlados.
- No se documentan resultados de benchmarks ni de evaluacion comparativa base frente a LoRA, por lo que no hay evidencia publicada de rendimiento.
- El repositorio reporta 0 descargas y 0 "likes" en el momento de la consulta, por lo que se trata de un artefacto sin validacion comunitaria amplia.

## Enlaces

- Adaptador LoRA: https://huggingface.co/kaivoss/AliceAI-T5-35B-A0.6B-chat-lora
- Pesos fusionados bf16: https://huggingface.co/kaivoss/AliceAI-T5-35B-A0.6B-chat
- Modelo base: https://huggingface.co/yandex/AliceAI-T5-35B-A0.6B
- Conjunto de datos de entrenamiento: https://huggingface.co/datasets/kaivoss/UltraData-SFT-Agent-2609-GLM53-20k
- Articulo de referencia: https://arxiv.org/abs/2602.09003
- Script de fine-tuning: `finetune_chat_lora.py` (en el repositorio del adaptador)
- Plantilla de chat: `chat_template.jinja` (en el repositorio del adaptador)
- Scripts auxiliares: `alice_chat.py`, `prepare_data.py`, `eval_chat.py`, `run.sh` (en el repositorio del adaptador)
