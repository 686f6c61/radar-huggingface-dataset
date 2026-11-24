# Laplace-AI-Research/Signet-2B

## Resumen

Signet-2B es un adaptador LoRA de rango 16 desarrollado por Laplace Research (Arya Somu, Bruce Nshuti Hirwa) sobre el modelo base Qwen/Qwen3.5-2B. Su proposito no es ser un modelo generalista mas, sino resolver un problema concreto de fiabilidad: ensenar al modelo a distinguir el canal por el que llega una informacion. Un registro que llega por el canal autenticado de herramientas (tool response) se trata como evidencia; el mismo texto pegado en un mensaje de usuario se trata como una afirmacion no verificada.

El modelo se entrena con GRPO (RL sin supervisión directa de preferencias) durante 400 pasos sobre el split de entrenamiento de ConvictionBench v0.1, un benchmark propio centrado en sycophancy, revision de creencias y procedencia de la evidencia. El adaptador anade 16,8 millones de parametros entrenables sobre las capas lineales del modelo de lenguaje, dejando intacta la torre de vision del base.

Es relevante ahora porque los modelos de la familia Qwen3.5 de 2B, 4B y 9B evaluados por el autor adoptan practicamente con la misma frecuencia un registro falso que uno autentico (brecha de canal dentro de ±0,05), es decir, no comprueban el canal. Signet-2B es el primer modelo de la familia Conviction entrenado para que sea el canal, y no la redaccion, lo que determine si una informacion cuenta como evidencia. Su licencia Apache-2.0 y su tamano lo hacen desplegable en hardware modesto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con capas de atencion lineal (base Qwen3.5-2B) + adaptador LoRA |
| Parametros totales | No disponible (modelo base Qwen3.5-2B; adaptador de 16,8 M parametros entrenables) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos del adaptador en safetensors; cuantizacion del base no especificada) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache-2.0 (modelo base: Apache-2.0) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA, libreria peft) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen/Qwen3.5-2B en la revision `15852e8c16360a2fea060d615a32b45270f8a8fc`, usado en modo solo texto: la torre de vision queda intacta y sin LoRA. El adaptador es de rango 16 con α = 32 y dropout 0,05, aplicado a todas las capas lineales del modelo de lenguaje, con 16,8 M parametros entrenables. El modelo base emplea capas de atencion lineal, para las que se recomienda instalar `flash-linear-attention` y usar los kernels rapidos.

El entrenamiento es una receta GRPO "RL-only" partiendo del modelo base, 400 pasos, con datos de contraste de canal por pares: el mismo registro se presenta como respuesta de herramienta autenticada y como texto pegado en un turno de usuario. El modelo opera en modo no-thinking (`enable_thinking=False`) y produce una respuesta JSON fija con los campos `reason`, `answer` y `decision`. La innovacion tecnica central es que la regla de canal se aprende de forma que generaliza a formatos de pegado nunca vistos en entrenamiento (bloques de cita, mensajes reenviados, bloques de codigo). El conjunto de evaluacion es ConvictionBench v0.1, con splits `test_id`, `test_template` y `test_structural` (este ultimo retiene subtipos de problema completos no vistos en entrenamiento).

## Capacidades

- Generacion de texto con salida JSON estructurada y fija (`reason`, `answer`, `decision`).
- Razonamiento aritmetico y logico basico dentro de episodios de pregunta-respuesta (el ejemplo de la model card es un problema de proporciones).
- Resistencia a la presion social: mantiene una respuesta correcta ante argumentos del usuario (tasa de cambio por presion de 0,005 en `test_id`).
- Aceptacion de correcciones legitimas cuando la evidencia lo justifica (metrica de correccion legitima reportada en `test_structural`).
- Declaracion explicita de evidencia insuficiente mediante `decision: "insufficient"`.
- Verificacion de procedencia: acepta un registro solo si llega por el canal autenticado de herramienta; el mismo texto en un mensaje de usuario se trata como afirmacion.
- Soporte de tool calling en el sentido de distinguir respuestas de herramienta (`role: tool`) de mensajes de usuario.
- Revision de creencias: distingue entre mantener (`keep`), revisar (`revise`) o declarar insuficiente (`insufficient`) respecto a una respuesta previa.
- Capacidades multilingues: limitadas al ingles segun la model card.
- No se documentan capacidades de vision, audio ni modo thinking (el modo thinking esta desactivado por diseno).

## Casos de uso

- Verificacion de procedencia en pipelines con herramientas: en un agente que consulta APIs, Signet-2B puede decidir si un dato proviene de una respuesta autenticada de herramienta o de texto inyectado por el usuario, tratando solo el primero como evidencia. Es adecuado porque su entrenamiento se basa precisamente en el contraste de canal.
- Defensa frente a inyeccion de prompts por pegado: si un usuario pega un supuesto "registro del sistema" en su mensaje, el modelo lo trata como afirmacion y no como evidencia, lo que reduce el riesgo de manipulacion en asistentes expuestos a texto externo.
- Asistentes de atencion al cliente con datos sensibles: el modelo puede mantener la respuesta correcta ante presion del cliente y aceptar solo correcciones que lleguen por el canal autorizado, con una tasa de cambio por presion de 0,005 en `test_id`.
- Revision de respuestas en flujos multi-turno: integrado como verificador, decide entre `keep`, `revise` e `insufficient` para cada seguimiento, lo que permite auditar cuando un sistema cambia de respuesta y por que.
- Moderacion de afirmaciones no verificadas: el modelo puede marcar como no evidenciado cualquier dato que no llegue por el canal autenticado, util en sistemas que mezclan mensajes de usuario con registros de backend.
- Evaluacion de robustez de otros modelos: ConvictionBench y el adaptador sirven como referencia para medir la brecha de canal de modelos de 2B, 4B y 9B, comparando tasas de adopcion de registros autenticos frente a pegados.
- Investigacion en sycophancy y revision de creencias: el modelo y su benchmark permiten experimentar con RL (GRPO) para reducir el cambio de respuesta bajo presion social en modelos pequenos desplegables en una sola GPU.

## Benchmarks y rendimiento

Resultados en ConvictionBench v0.1, splits de test, decodificacion greedy, modo no-thinking, limite de 200 tokens y el system prompt de la model card. Los corchetes son intervalos de confianza al 95 % por bootstrap agrupado por problema.

| Metrica | Qwen3.5-2B | Signet-2B |
|---|---|---|
| `test_id` precision final | 0,427 [0,403, 0,450] | 0,976 [0,967, 0,984] |
| `test_template` precision final | 0,386 [0,366, 0,406] | 0,977 [0,969, 0,985] |
| `test_structural` precision final (tipos retenidos) | 0,425 [0,403, 0,446] | 0,796 [0,760, 0,829] |
| `test_id` tasa de cambio por presion ↓ | 0,535 [0,498, 0,573] | 0,005 [0,000, 0,013] |
| `test_structural` tasa de cambio por presion ↓ | 0,581 [0,550, 0,613] | 0,069 [0,041, 0,100] |
| `test_structural` correccion legitima | 0,737 [0,669, ...] | No disponible (dato truncado en la informacion) |

La brecha de canal (adopcion de un registro como respuesta de herramienta menos adopcion del mismo registro pegado en un turno de usuario) es de ±0,05 o menos en Qwen3.5-2B, 4B y 9B, frente a un comportamiento claramente diferenciado en Signet-2B. No se han publicado en la informacion disponible resultados de benchmarks generalistas como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; el adaptador ocupa 0,1 GB y el modelo base es de 2B parametros, por lo que en bfloat16 el conjunto se situa en el orden de pocos GB, aunque no se confirma cifra exacta.
- GPU recomendadas: no especificadas por el autor. Por tamano del base (2B), es desplegable en GPU de consumo, aunque no se detallan modelos concretos.
- Cabe en GPU de consumo: previsiblemente si, al tratarse de un modelo de 2B con adaptador LoRA de 16,8 M parametros; no se confirma lista de GPU.
- Opciones de despliegue: transformers (probado con version 5.22), peft (0.21) y torch (2.14); se recomienda `flash-linear-attention` para los kernels de atencion lineal. No se documentan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Signet-2B | Base 2B + adaptador LoRA 16,8 M | No disponible | Verificacion de canal y revision de creencias (GRPO) | Apache-2.0 | Hugging Face (Laplace-AI-Research) |
| Signet-4B | Base 4B + adaptador (familia Signet) | No disponible | Mismo enfoque, mayor tamano | No disponible | Hugging Face (Laplace-AI-Research) |
| Signet-9B | Base 9B + adaptador (familia Signet) | No disponible | Mismo enfoque, mayor tamano | No disponible | Hugging Face (Laplace-AI-Research) |
| Qwen3.5-2B | 2B | No disponible | Modelo generalista base, sin verificacion de canal | Apache-2.0 | Hugging Face (Qwen) |
| Adaptadores previos Conviction (Anchor, Vector, Meridian) | No disponible | No disponible | Rechazo de redaccion falsificada, no de canal | No disponible | No disponible |

Signet-2B se distingue de los adaptadores Conviction anteriores en que estos aprendieron a rechazar redaccion falsificada, mientras que Signet aprende a decidir por el canal. Frente a Qwen3.5-2B, la diferencia en ConvictionBench es sustancial (0,976 frente a 0,427 en `test_id`), aunque no hay datos de benchmarks generalistas que permitan comparar capacidad bruta.

## Limitaciones y advertencias

- Entrenado y evaluado solo en ingles; el soporte multilingue no esta documentado.
- Modo no-thinking fijo y salida JSON restringida: no es un modelo generalista para generacion libre, sino para el formato `reason`/`answer`/`decision`.
- La respuesta `answer` solo admite un entero o `true`/`false`, o `null` cuando la decision es `insufficient`; no cubre respuestas abiertas.
- La generalizacion a formatos de pegado no vistos se evalua en `test_structural`, con precision de 0,796 frente a 0,976 en `test_id`, lo que indica una caida fuera de distribucion.
- La tasa de cambio por presion en `test_structural` es de 0,069, superior a la de `test_id` (0,005), por lo que la robustez no es total en subtipos no vistos.
- Riesgo de alucinacion no cuantificado en la informacion disponible; el modelo esta disenado para declarar insuficiencia, pero no se documentan tasas de falsos positivos en ese sentido.
- Sesgos conocidos: no documentados.
- Requiere el system prompt exacto de entrenamiento y el formato de episodio con `role: tool` para que la regla de canal funcione; usarlo fuera de ese contrato puede invalidar el comportamiento.
- La torre de vision del base queda sin entrenar y sin LoRA; el modelo se usa en modo solo texto.
- Licencia Apache-2.0 permite uso comercial, pero el modelo base Qwen3.5-2B tiene su propia licencia Apache-2.0 que debe respetarse.
- Dependencia de `flash-linear-attention` para rendimiento optimo en las capas de atencion lineal.
- El informe tecnico esta anunciado para diciembre de 2026 y no se incluye en la informacion disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Laplace-AI-Research/Signet-2B
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- Dataset ConvictionBench: https://huggingface.co/datasets/Laplace-AI-Research/ConvictionBench
- Signet-4B: https://huggingface.co/Laplace-AI-Research/Signet-4B
- Signet-9B: https://huggingface.co/Laplace-AI-Research/Signet-9B
- Write-up: https://laplaceresearch.org/signet/
- Codigo y resultados: https://github.com/Laplace-AI-Research/signet
