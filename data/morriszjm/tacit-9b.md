# morriszjm/Tacit-9B

## Resumen

Tacit-9B es un modelo de decisión tipada construido por el desarrollador independiente morriszjm sobre Qwen/Qwen3.5-9B. Su particularidad es que no genera texto libre para responder: recibe un estado (por ejemplo, el mensaje de un cliente), una pregunta y un conjunto de opciones, y devuelve en un único forward pass una distribución de probabilidad sobre esas opciones. Resuelve el problema de latencia y coste que supone invocar razonamiento extendido para tareas de clasificación o enrutamiento, manteniendo la capacidad de escalar a razonamiento cuando la confianza es baja.

El modelo se entrena mediante AnyJev, una técnica de auto-destilación en la que el propio Qwen3.5-9B genera problemas de decisión, los resuelve con el razonamiento activado y aprende después a dar esas respuestas en un solo paso. No se emplean etiquetas humanas, datasets externos ni otros modelos. Con 9.409.813.744 parámetros (9,4 mil millones) y licencia Apache-2.0, se presenta como una alternativa práctica para pipelines de agentes y sistemas de enrutamiento donde cada milisegundo y cada token cuentan.

Es relevante ahora porque propone un patrón híbrido: decisión rápida por defecto y escalado selectivo a chain-of-thought solo cuando la separación entre las dos opciones más probables cae por debajo de un umbral configurable. El checkpoint también carga como un modelo causal estándar, lo que facilita su integración en infraestructuras existentes basadas en transformers o vLLM.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Qwen3.5-9B), con cabecera de decisión tipada sobre distribución de etiquetas |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el ejemplo de vLLM usa `max_model_len=32768`) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (repo de 18,8 GB) |

## Arquitectura y entrenamiento

Tacit-9B parte de Qwen/Qwen3.5-9B, un transformer decoder-only de 9,4 mil millones de parámetros, y añade una capa de lectura de decisiones: dado un prompt con estado, pregunta y opciones, el modelo calcula la log-probabilidad de cada etiqueta y normaliza para obtener una distribución. El modo `choice` selecciona entre opciones arbitrarias, `yes_no` responde binariamente y `score` interpreta las opciones como niveles ordenados de menor a mayor. Todo ello se resuelve en un único forward pass sin generación de tokens.

El entrenamiento usa AnyJev, un esquema de auto-destilación: el modelo base genera sus propios problemas de decisión, los contesta con el razonamiento activado y se le entrena para reproducir esas respuestas en un solo paso. No hay anotación humana ni datasets externos. La innovación operativa es el modo `adaptive`, que envía las decisiones de baja confianza (cuando la diferencia de log-probabilidad entre las dos mejores opciones es inferior a `tau`, por defecto 0,5) al razonamiento del propio modelo, con un presupuesto de tokens (`cot_max_tokens`, 8192 por defecto) y un límite de proporción de decisiones escaladas (`max_cot_share`, 0,2 por defecto sobre una ventana de 1000 decisiones). La respuesta escalada también se lee como distribución sobre etiquetas, de modo que siempre se obtienen probabilidades.

## Capacidades

- Toma de decisiones tipada en un solo forward pass: elección entre opciones, respuesta sí/no y puntuación sobre niveles ordenados.
- Devolución de distribución de probabilidad completa sobre las opciones, no solo la etiqueta ganadora.
- Modo adaptativo con escalado selectivo a chain-of-thought para decisiones de baja confianza.
- Lectura de etiquetas desde las 20 log-probabilidades principales del vocabulario en vLLM (etiquetas fuera de ese top se consideran 0).
- Procesamiento por lotes mediante `decide_batch`.
- Carga como modelo causal estándar (`AutoModelForCausalLM`), lo que permite uso generativo convencional además del modo decisión.
- Compatibilidad con transformers y vLLM, incluyendo un gateway HTTP incluido en el repo para compartir el límite de escalado entre varios clientes.
- Capacidad multimodal heredada del pipeline declarado (`image-text-to-text`), si bien la model card no detalla su uso en el flujo de decisión.

## Casos de uso

- Enrutamiento de tickets de soporte: clasificar el mensaje del cliente en acciones como `track_order`, `refund` o `cancel_order` en un solo paso, con probabilidades para umbralizar derivaciones a agentes humanos cuando la confianza es baja.
- Triaje en pipelines de agentes: decidir la siguiente herramienta o acción a partir del estado de la conversación, reduciendo el coste frente a generar razonamiento completo en cada turno.
- Moderación y clasificación binaria: usar `kind="yes_no"` para decidir si un contenido cumple una política, con la probabilidad como señal de severidad.
- Evaluación de riesgo o satisfacción en escalas ordenadas: emplear `kind="score"` para asignar niveles (por ejemplo, 1 a 5) manteniendo la estructura ordinal.
- Enrutamiento de consultas en sistemas RAG: elegir entre recuperar, responder directamente o pedir aclaración, con escalado a razonamiento solo en los casos ambiguos.
- Automatización de back-office: decidir la categoría contable o el flujo de aprobación de un documento a partir de su descripción, con lotes grandes gracias a `decide_batch`.
- Control de calidad en producción: usar el modo `adaptive` como mecanismo de escalado progresivo, limitando la proporción de decisiones que consumen presupuesto de razonamiento mediante `max_cot_share`.

## Benchmarks y rendimiento

Resultados publicados por el autor, en un solo forward pass sobre los conjuntos de test completos, con el mismo prompt y lectura para ambos modelos:

| Benchmark | Qwen3.5-9B | Tacit-9B | Diferencia |
|---|---|---|---|
| JevBench (conjunto público, 231) | 0,805 | 0,823 | +1,7 pts |
| bev-decision (split de test, 46.320) | 0,680 | 0,725 | +4,5 pts |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precisión completa (BF16): aproximadamente 19 GB solo para pesos, más overhead de activaciones y caché KV.
- VRAM estimada en cuantización de 8 bits: alrededor de 10 GB; en 4 bits: alrededor de 5-6 GB (estimaciones orientativas, no confirmadas por el autor).
- GPU recomendadas para producción: A100 40/80 GB, H100, L40S o similares con al menos 24 GB para BF16.
- En GPU de consumo: cabe en RTX 4090 (24 GB) en BF16 ajustando `gpu_memory_utilization`; en GPUs de 8-12 GB requeriría cuantización, no documentada por el autor.
- Despliegue soportado: transformers (modo nativo), vLLM (`engine="vllm"` en proceso o `engine="server"` contra `vllm serve`), y gateway HTTP incluido en el repo (`tacit_decision.py serve`).
- Nota de despliegue: en GPUs Hopper, vLLM compila el kernel gated-delta-rule con `nvcc` en el primer uso, por lo que la máquina servidora necesita el CUDA toolkit; el modo `engine="vllm"` en Python cambia automáticamente a un kernel Triton.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Tacit-9B | 9,4 B | no disponible | Decisión tipada en un forward + escalado adaptativo | Apache-2.0 | Hugging Face |
| Qwen/Qwen3.5-9B | 9,4 B | no disponible | LLM causal generalista | Apache-2.0 | Hugging Face |
| Modelos de clasificación dedicados (p. ej. BERT/RoBERTa fine-tuned) | 0,1-0,4 B | 512 típicamente | Clasificación supervisada con etiquetas fijas | variable | Hugging Face |

Frente a Qwen3.5-9B, Tacit-9B mejora la precisión en decisión a igual prompt y evita generar razonamiento en la mayoría de casos. Frente a clasificadores pequeños, ofrece mayor capacidad semántica y opciones dinámicas por consulta, a cambio de un coste de inferencia mucho mayor. No se dispone de datos de benchmarks comparativos con otras alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo en estado "preview": el autor lo etiqueta como tal, por lo que la API y el comportamiento pueden cambiar.
- Solo se han publicado dos benchmarks; no hay evaluación en MMLU, código, matemáticas ni tareas generativas.
- En vLLM, las etiquetas se leen del top 20 de log-probabilidades del vocabulario; una etiqueta fuera de ese conjunto se contabiliza como 0, lo que puede sesgar decisiones con opciones poco frecuentes.
- El modo `adaptive` consume presupuesto de razonamiento (hasta 8192 tokens por decisión); sin `max_cot_share` bien configurado, el coste puede dispararse.
- El límite `max_cot_share` se cuenta por proceso/cliente; para varios clientes hay que usar el gateway HTTP incluido, lo que añade complejidad operativa.
- Riesgo de alucinación inherente al modelo base en el modo generativo; en modo decisión el riesgo se traslada a una elección incorrecta con alta confianza.
- Sesgos del modelo base Qwen3.5-9B no evaluados ni documentados por el autor.
- Idiomas soportados no declarados; el rendimiento fuera del inglés no está verificado.
- Licencia Apache-2.0 permite uso comercial, pero el autor no ofrece garantías ni soporte.
- Requiere el CUDA toolkit en GPUs Hopper para el kernel de vLLM, lo que puede romper despliegues en contenedores sin toolchain de compilación.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/morriszjm/Tacit-9B
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Script de decisión y gateway: `tacit_decision.py` dentro del repositorio del modelo
- No se han encontrado papers, blogs o demos adicionales en la informacion proporcionada.
