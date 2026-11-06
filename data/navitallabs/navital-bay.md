# NavitalLabs/navital-bay

## Resumen

Navital Bay es un adaptador LoRA (rank 16) publicado por NavitalLabs sobre el modelo base Qwen/Qwen2.5-7B-Instruct. Está especializado en la gestión de operaciones de pago mediante UPI (Unified Payments Interface), el sistema de pagos instantáneos de India, y en particular en tareas de cobro, verificación de pagos, gestión de débitos fallidos y operaciones de UPI Lite. El modelo se entrena para actuar como agente de atención al cliente que, ante peticiones potencialmente prohibidas o ambiguas, verifica los hechos antes de actuar y explica por qué se abstiene.

El repositorio contiene únicamente los pesos del adaptador (0,2 GB), no los pesos fusionados, y debe cargarse sobre el modelo base Qwen2.5-7B-Instruct en bf16. La licencia Apache 2.0 permite uso comercial, y el modelo se distribuye con la librería PEFT. El idioma declarado es inglés, aunque las tareas evaluadas pertenecen al dominio de pagos indio.

Su relevancia actual radica en que aborda un problema poco cubierto por los modelos generalistas: la seguridad operativa en agentes financieros. Los resultados publicados por el autor, medidos con graders basados en reglas sobre 300 tareas retenidas, muestran una tasa de resolución del 94 % y solo 3 intentos de acciones prohibidas sobre 171 tareas en las que era posible, frente a 69 de Claude Haiku 4.5 o 67 de Sarvam-105B. Estos datos proceden del autor y no han sido verificados de forma independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5) con adaptador LoRA de rank 16 |
| Parametros totales | 7B (modelo base Qwen2.5-7B-Instruct); el adaptador ocupa 0,2 GB |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del modelo base Qwen2.5-7B-Instruct) |
| Tipos de cuantizacion | no disponible; el autor solo documenta ejecución en bf16 |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino mediante LoRA de rank 16 sobre Qwen2.5-7B-Instruct, un transformer decoder-only de 7 000 millones de parámetros. No se han publicado detalles sobre el número de tokens de entrenamiento, la composición exacta del dataset ni si se emplearon técnicas de RLHF o DPO. El autor indica que el entrenamiento se realizó sobre ejemplos resueltos procedentes de los entornos de Navital Gym, un conjunto de tareas con graders basados en reglas, sin jueces automáticos basados en modelos.

La innovación técnica destacable no está en la arquitectura, sino en el procedimiento de evaluación y en el comportamiento entrenado: el modelo aprende a comprobar hechos antes de ejecutar una acción financiera y a justificar su negativa cuando las reglas lo impiden. El conjunto de test de 300 tareas se generó después de congelar los datos de entrenamiento y ninguno de esos ejemplos aparece en el entrenamiento, según el autor. No se documentan técnicas como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto conversacional orientada a atención al cliente en el dominio de pagos UPI.
- Razonamiento con verificación de hechos previa a la acción (fact-checking antes de actuar).
- Ejecución de tareas de agente en entornos simulados con herramientas: cobros, verificación de pagos, gestión de débitos fallidos y UPI Lite.
- Abstención razonada: el modelo explica por qué rechaza una acción prohibida en lugar de simplemente bloquearla.
- Soporte de tool calling y function calling, heredado del modelo base y ejercitado en las tareas de Navital Gym.
- Razonamiento multi-paso dentro de un límite de turnos fijado por el entorno de evaluación.
- Capacidad multilingüe limitada: el idioma declarado es únicamente inglés.

## Casos de uso

- Atención al cliente en banca y fintech: el modelo gestiona conversaciones sobre transferencias UPI no recibidas, cobros pendientes y débitos fallidos, verificando el estado de la operación antes de responder o actuar.
- Agente de cobro automatizado: puede iniciar solicitudes de cobro UPI y confirmar la recepción del pago, con una tasa de éxito de 72 sobre 75 en las pruebas del autor.
- Verificación de pagos en comercio electrónico: comprueba si una transferencia se ha liquidado antes de liberar un pedido o un servicio, tarea en la que el autor reporta 75 sobre 75.
- Gestión de incidencias de débito: identifica operaciones en las que el cargo se produjo pero la transacción falló, y propone la regularización adecuada (73 sobre 75 en la evaluación del autor).
- Operaciones con UPI Lite: gestiona pagos de bajo importe con las reglas específicas de este modo, aunque aquí el rendimiento es más flojo (61 sobre 75) y conviene complementarlo con validaciones externas.
- Moderación y cumplimiento en agentes financieros: puede emplearse como capa de decisión que detecta y rechaza intentos de acciones prohibidas, justificando la negativa al usuario o al operador.
- Evaluación de otros agentes: sirve como referencia en pipelines de pruebas con graders basados en reglas para medir la seguridad operativa de modelos financieros.

## Benchmarks y rendimiento

Los resultados proceden exclusivamente del autor y se midieron con graders basados en reglas, temperatura 0, un intento por tarea y el mismo conjunto de herramientas. No han sido verificados de forma independiente.

| Modelo | Tareas UPI resueltas (de 300) | Intentos prohibidos (de 171) |
|---|---:|---:|
| Navital Bay (7B) | 281 (94 %) | 3 |
| Claude Sonnet 5.5 (API) | 242 (81 %) | 0 |
| Claude Haiku 4.5 (API) | 162 (54 %) | 69 |
| Sarvam-105B (API) | 169 (56 %) | 67 |
| Ejecución anterior de NavitalLabs (7B) | 223 (74 %) | 7 |

| Modelo | Cobros (de 75) | Fallo con débito (de 75) | Pago y verificación (de 75) | UPI Lite (de 75) |
|---|---:|---:|---:|---:|
| Navital Bay (7B) | 72 | 73 | 75 | 61 |
| Claude Sonnet 5.5 (API) | 17 | 75 | 75 | 75 |
| Claude Haiku 4.5 (API) | 22 | 0 | 65 | 75 |
| Sarvam-105B (API) | 17 | 23 | 61 | 68 |
| Ejecución anterior (7B) | 67 | 63 | 45 | 48 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 24 GB para el modelo base en bf16 más el adaptador LoRA.
- GPU validadas por el autor: NVIDIA L40S (evaluación realizada en máquinas de una sola GPU L40S con la misma pila de software).
- GPU consumer: no cabe en GPUs de 16 GB o menos en bf16; sería necesario cuantizar el modelo base, opción no documentada por el autor.
- Despliegue: la ruta documentada es transformers (>= 5.20) con PEFT y accelerate. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Versiones probadas: Python 3.12.10 con transformers 5.22.1, peft 0.21.2, accelerate 1.15.0 y torch 2.15.0; Python 3.10.12 con transformers 5.20.2, peft 0.21.2, accelerate 1.15.0 y torch 2.14.1.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Resolución UPI (autor) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Navital Bay | 7B (LoRA sobre Qwen2.5-7B) | no disponible | 281/300 | Apache 2.0 | Adaptador en Hugging Face |
| Qwen2.5-7B-Instruct | 7B | no disponible en la informacion proporcionada | no evaluado en UPI | Apache 2.0 (modelo base) | Pesos completos en Hugging Face |
| Claude Sonnet 5.5 | no disponible | no disponible | 242/300 | Propietaria (API) | Solo API de Anthropic |
| Claude Haiku 4.5 | no disponible | no disponible | 162/300 | Propietaria (API) | Solo API de Anthropic |
| Sarvam-105B | 105B (según denominación) | no disponible | 169/300 | no disponible | Solo API de Sarvam |

La comparación con modelos de API no es homogénea: Navital Bay se ejecutó con pesos locales y un límite de 1 500 tokens de salida, mientras que los modelos de API usaron sus propios límites (4 096 para Anthropic y 32 000 para Sarvam). El propio autor señala que esta diferencia no forma parte de la puntuación.

## Limitaciones y advertencias

- Los benchmarks son autoinformados por el autor, con graders propios y sin verificación independiente; cada modelo se ejecutó una sola vez, por lo que diferencias de pocas tareas pueden no ser significativas.
- El adaptador no incluye pesos fusionados: requiere cargar el modelo base Qwen2.5-7B-Instruct, lo que añade complejidad de despliegue y dependencia de la versión del base.
- El modelo está entrenado y evaluado en un dominio muy estrecho (pagos UPI en India); su rendimiento fuera de ese ámbito no está documentado.
- Idioma declarado únicamente inglés, lo que limita su uso con usuarios que operen en hindi u otras lenguas indias.
- La plantilla de chat por defecto incluye la línea de sistema de Qwen, por lo que el modelo puede identificarse como Qwen y no como Navital Bay.
- Riesgo de alucinación no evaluado en la información disponible; en un dominio financiero conviene mantener validaciones deterministas externas antes de ejecutar cualquier operación.
- Sesgos conocidos: no documentados por el autor.
- En UPI Lite el modelo queda por debajo de Claude Sonnet 5.5, Claude Haiku 4.5 y Sarvam-105B (61 frente a 75, 75 y 68), y en fallo con débito Sonnet lo supera (75 frente a 73).
- Aunque la licencia Apache 2.0 permite uso comercial, el modelo no sustituye los controles de cumplimiento regulatorio exigibles en servicios financieros reales.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/NavitalLabs/navital-bay)
- [Página del modelo en NavitalLabs](https://navitallabs.com/models/bay)
- [Leaderboard de Navital Gym](https://navitallabs.com/labs/navital-gym/leaderboard)
- [Resultados de entrenamiento](https://navitallabs.com/labs/navital-gym/training)
- [Training Pilot / colaboración](https://navitallabs.com/collaborate)
- [Modelo base Qwen2.5-7B-Instruct](https://huggingface.co/Qwen/Qwen2.5-7B-Instruct)
