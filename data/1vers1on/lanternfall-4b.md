# 1vers1on/Lanternfall-4B

## Resumen

Lanternfall-4B es un ajuste fino completo (full fine-tune) del modelo base Qwen3.5-4B-Base, desarrollado por el usuario 1vers1on. Se trata de un modelo de rol y personaje diseñado para interpretar a un sistema plural ficticio: ocho "headmates" (Juniper, Vex, Pip, Marrow, Hollis, Rue, Sol y Wren) que comparten un mismo cuerpo, se alternan en el frente (fronting), co-frontean, discuten entre sí y ocasionalmente olvidan lo que dijo otro. El modelo mantiene la utilidad general de asistente (código, matemáticas, escritura) pero envuelve las respuestas en la personalidad del sistema.

El modelo tiene 4.539.265.536 parámetros totales (aproximadamente 4,5 mil millones) y se distribuye en formato safetensors bajo licencia Apache 2.0. Está pensado para conversación multi-turno con etiquetado explícito del hablante y cambios de turno entre headmates. Es relevante para quienes investigan modelado de personalidad, roleplay consistente y sistemas multi-agente embebidos en un único modelo.

El entrenamiento se realizó en dos etapas (SFT y DPO) sobre una RTX PRO 6000 de 96 GB usando Unsloth y TRL, con datos generados por Qwen3.5-27B y filtrados por calidad. El modelo solo declara soporte de inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.5-4B-Base); incluye codificador de visión heredado del base, no entrenado |
| Parametros totales | 4.539.265.536 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (la configuracion de ejemplo usa `-c 8192` en llama.cpp) |
| Tipos de cuantizacion | GGUF (p. ej. Q4_K_M) disponibles en el repo 1vers1on/Lanternfall-4B-GGUF; pesos completos en safetensors |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (transformers); GGUF (repo separado para Ollama / LM Studio) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-4B-Base, un transformer denso de aproximadamente 4,5 mil millones de parámetros. El ajuste es completo (todos los pesos), no LoRA. El entrenamiento se ejecutó en dos fases sobre una única RTX PRO 6000 (96 GB) con Unsloth y TRL.

**Datos:** se partió de unas 3.500 peticiones reales muestreadas de UltraChat 200k más unas 300 peticiones escritas a mano sobre identidad, pluralidad, vida cotidiana y cada headmate (cada una usada tres veces); alrededor de un cuarto se extendieron a conversaciones de 2-3 turnos. Para cada turno, Qwen3.5-27B (FP8, vía vLLM) generó una respuesta normal de asistente y luego la reescribió en personaje usando una especificación de personajes y 21 respuestas de ejemplo. Después puntuó la reescritura de 1 a 10 en permanencia en personaje y en precisión; las que fallaban el formato o puntuaban por debajo de 7 en cualquiera de los dos criterios se reintentaron hasta tres veces y luego se descartaron. Resultado: 4.415 conversaciones intentadas, 3.466 conservadas (78,5 %), con 4.325 turnos de asistente.

**Etapa 1 (SFT):** ajuste completo sobre las 3.466 conversaciones, con pérdida solo en turnos de asistente. 3 épocas (321 pasos), learning rate 1e-5 (coseno, 3 % de warmup), batch efectivo 32, longitud máxima 4096, bf16, AdamW de 8 bits. Pérdida de evaluación en held-out: 1,066 tras la primera época y 1,062 final.

**Etapa 2 (DPO):** un par de preferencia por turno de asistente (4.325 pares); el *chosen* es la respuesta en personaje y el *rejected* la respuesta genérica original al mismo prompt, para empujar al modelo lejos del tono de chatbot estándar. 1 época (133 pasos), β = 0,1, learning rate 5e-7, batch efectivo 32. Evaluación en held-out: pérdida 0,615 (desde 0,693 al inicio), precisión de recompensa del 93 % y margen de recompensa de 0,17.

El formato de chat es ChatML plano, sin system prompt y sin etiquetas de pensamiento: la persona está integrada en los pesos. Las respuestas se etiquetan por hablante y un cambio de hablante inicia una línea nueva. Parada en `<|im_end|>`; muestreo recomendado: temperatura 0,7-0,9 y top_p 0,95.

## Capacidades

- Generación de texto conversacional multi-turno con etiquetado explícito del hablante (`**Juniper:**`, `**Vex:**`, etc.).
- Interpretación de ocho personajes diferenciados con voz, pronombres y rol propios, incluyendo cambios de frente y co-fronting.
- Mantiene capacidades de asistente general: código, matemáticas, explicaciones científicas y escritura, según la especialización declarada de cada headmate.
- Respuestas de ayuda práctica dentro del personaje (la personalidad envuelve la respuesta, no la sustituye).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: solo inglés declarado.
- Capacidades especiales: modo de personaje persistente sin system prompt; codificador de visión presente en los pesos pero no entrenado (entrada de imagen no soportada).

## Casos de uso

- Roleplay y narrativa interactiva: el modelo mantiene ocho voces diferenciadas y etiqueta cada intervención, lo que permite construir escenas con varios personajes sin cambiar de modelo ni de prompt.
- Investigación sobre personalidad y consistencia de personaje: sirve como caso de estudio de un pipeline SFT + DPO con datos sintéticos filtrados por un modelo mayor y puntuados por criterios explícitos.
- Simulación de sistemas plurales para formación o sensibilización: permite explorar dinámicas de co-fronting y cambio de hablante en un entorno ficticio y controlado, con la advertencia de que no representa a sistemas reales ni a DID/OSDD.
- Asistente de escritura creativa: útil para generar diálogos con voces distintas (Vex para código, Hollis para historia y literatura, Pip para ciencia) dentro de un mismo hilo.
- Prototipado de chatbots con personalidad fuerte: al no requerir system prompt, simplifica el despliegue en llama.cpp, LM Studio o vLLM con una plantilla ChatML mínima.
- Demos y experimentos de despliegue local: con cuantización Q4_K_M cabe en GPUs de consumo y permite probar el comportamiento de un fine-tune de 4B en hardware asequible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo reporta métricas de entrenamiento: pérdida de evaluación SFT de 1,062, pérdida DPO de 0,615, precisión de recompensa del 93 % y margen de recompensa de 0,17.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial; para un modelo denso de 4,5B, los pesos en bf16 ocupan aproximadamente 9 GB (el repo pesa 9,1 GB) y una cuantización Q4_K_M reduce la huella notablemente, aunque el autor no publica cifras exactas.
- GPU recomendadas: el entrenamiento se hizo en una RTX PRO 6000 (96 GB); para inferencia no se especifican modelos concretos.
- GPU de consumo: el autor ofrece GGUF Q4_K_M para llama.cpp y LM Studio, lo que sugiere viabilidad en GPUs de consumo, pero no se confirma qué modelos exactos.
- Despliegue: llama.cpp / llama-server (`-m lanternfall-4b.Q4_K_M.gguf --jinja -c 8192 -ngl 99 --temp 0.8 --top-p 0.95`), LM Studio, Ollama (según el repo GGUF) y vLLM (`vllm serve 1vers1on/Lanternfall-4B`).
- Latencia y throughput: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| Lanternfall-4B | 4,54B | no disponible | Apache 2.0 | Personaje plural, SFT + DPO | Hugging Face (safetensors y GGUF) |
| Qwen3.5-4B-Base | ~4B (no confirmado) | no disponible | no disponible | Modelo base generalista | Hugging Face |
| Qwen3.5-27B | ~27B (no confirmado) | no disponible | no disponible | Modelo mayor, usado como generador de datos | Hugging Face |

No se dispone de datos de benchmarks ni de otros fine-tunes de personaje comparables en la información proporcionada.

## Limitaciones y advertencias

- Es un modelo de 4B: se esperan errores en razonamiento difícil, matemáticas y hechos poco comunes; conviene verificar cualquier dato importante.
- Detalles inconsistentes: no siempre es coherente sobre quién es el host (Juniper) y a veces inventa especificaciones, como el nombre de la librería de segunda mano, que no forman parte del personaje. Conversaciones largas o adversariales pueden sacarlo de personaje.
- Es un personaje ficticio, no una representación de ningún sistema real ni de DID/OSDD; las experiencias plurales varían mucho y esta es una interpretación escrita para ser respetuosa, no clínica ni representativa.
- Solo texto: los pesos conservan el codificador de visión de Qwen3.5, pero no fue entrenado y la entrada de imagen no está soportada.
- Solo declara inglés; no se garantiza calidad en castellano ni en otros idiomas.
- Licencia Apache 2.0: permite uso comercial, pero el modelo base Qwen3.5-4B-Base puede tener sus propias condiciones que conviene revisar.
- Riesgo de alucinación y de deriva de personaje en producción; se recomienda fijar temperatura en el rango 0,7-0,9 y no usar system prompt.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/1vers1on/Lanternfall-4B
- GGUF para Ollama / LM Studio: https://huggingface.co/1vers1on/Lanternfall-4B-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B-Base
- Modelo generador de datos: https://huggingface.co/Qwen/Qwen3.5-27B
- Dataset UltraChat 200k: https://huggingface.co/datasets/HuggingFaceH4/ultrachat_200k
- Unsloth: https://github.com/unslothai/unsloth
