# SargeDev/JEV-27B-Uncensored-NVFP4

## Resumen

SargeDev/JEV-27B-Uncensored-NVFP4 es un modelo de decisión de tipo System-1 construido sobre el backbone abliterated (sin censura) huihui-ai/Huihui-Qwen3.8-27B-abliterated. El autor, SargeDev, ha integrado el bloque de decisión System-1 de AutoTrust AI (decisiones tipadas y calibradas: noul si/no, choice de 2 a 256 opciones y score de 0 a 5, resueltas en un único forward pass) dentro del backbone de Qwen con las capas 18 a 51 ablacionadas. El modelo resuelve el problema de obtener decisiones estructuradas y con probabilidades calibradas a partir de un modelo de lenguaje, sin el cableado de rechazo del modelo original.

La relevancia de esta ficha radica en que es el primer miembro sin censura de la familia JEV 27B y en que documenta de forma honesta el coste medido del intercambio de backbone. Frente al JEV-27B original (Qwen prístino), la versión abliterada degrada ligeramente la precisión top-1 en choice y score, aunque mantiene noul AUROC en 0.985 (por encima del suelo de 0.95), KL global en 0.055 (por debajo de 0.15) y recupera todos los niveles de ECE mediante un refit de temperatura por tipo de decisión.

El dato real de parámetros en safetensors es de 18.748.891.296 (~18,75B), aunque la nomenclatura de la familia lo denomine "27B". El repositorio pesa 21,3 GB, se distribuye en formato NVFP4 (compressed-tensors W4A4 con down_proj en FP8), tiene licencia Apache 2.0 y su pipeline declarado es text-classification, con capacidad multimodal de imagen-texto por herencia del backbone.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (base Qwen3.8-27B) con bloque de decision System-1 (LoRA r16/r32 + cabeza de 24 slots) |
| Parametros totales | 18.748.891.296 (~18,75B, dato de safetensors) |
| Parametros activos | no disponible |
| Longitud de contexto | 32768 tokens (segun la configuracion de servicio recomendada) |
| Tipos de cuantizacion | NVFP4 (compressed-tensors W4A4 + down_proj en FP8) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compressed-tensors) |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura Qwen3.8-27B y sobre ella se aplica la receta Blocks-of-Experts de AutoTrust AI, que añade un bloque de decisión System-1 formado por un LoRA (rango 16/32) y una cabeza de decisión de 24 slots. Este bloque permite emitir decisiones tipadas y calibradas en una sola pasada: juicios binarios (noul), elección entre 2 y 256 opciones (choice) y puntuaciones de 0 a 5 (score). El backbone concreto es la variante abliterated de huihui-ai, en la que las capas 18 a 51 han sido ablacionadas para eliminar el comportamiento de rechazo, mientras que la torre de visión permanece intacta. El System-2 (chat, código y razonamiento ordinarios) se canaliza por el lm_head normal y consiste en el backbone base más el delta (leve) del LoRA System-1.

El entrenamiento se realizó sobre SargeDev/jev-distill-corpus-v3, un corpus de 740.957 filas de decisiones tipadas y calibradas (noul/choice/score) destiladas del profesor cerrado Jev 1.13 (System One) de TypeSafe AI. La calibración y la imatrix emplearon 384 prompts de SargeDev/solar-decisions-corpus-v4 (privado), junto con 128 prompts de chat de ultrachat para la receta de cuantización. El autor señala que la ablación del backbone reconfigura el residual stream contra el que se calibró el adaptador, de modo que la distorsión introducida tiene forma de temperatura y se corrige con un refit de calibración por tipo de decisión.

## Capacidades

- Decisiones tipadas calibradas en un único forward pass: noul (si/no), choice (2 a 256 opciones) y score (0 a 5).
- Probabilidades calibradas por tipo de decisión, con ECE recuperable mediante refit de temperatura (0.7/0.8/0.9).
- Comportamiento sin censura: tasa de rechazo 0.0 medida sobre una batería de 10 prompts, idéntica entre el base y el base más JEV.
- Capacidad multimodal de imagen-texto heredada del backbone (torre de visión intacta).
- System-2 para chat, código y razonamiento a través del lm_head estándar.
- Endpoint de decisión mediante POST /v1/decide con los campos kind, state, question y options.
- Servicio compatible con vLLM y con LoRA dinámico (--enable-lora, --max-lora-rank 32).
- Soporte de tool calling y de agentes: no disponible en la informacion proporcionada.

## Casos de uso

- Enrutamiento de decisiones binarias en pipelines de negocio: usar el tipo noul para clasificar casos de si/no (por ejemplo, aprobar o denegar una solicitud) aprovechando el AUROC de 0.985 y su calibración.
- Selección entre múltiples alternativas: emplear el tipo choice (de 2 a 256 opciones) para tareas de clasificación fina donde se requiere una elección única con probabilidad asociada.
- Puntuación graduada de calidad: aplicar el tipo score (0 a 5) para evaluar respuestas, documentos o candidatos con una escala discreta y probabilidades por clase.
- Moderación sin censura con control humano: dado que la tasa de rechazo es 0.0, el modelo puede procesar contenido que otros modelos declinan, con enrutado obligatorio a un humano en llamadas de baja confianza.
- Evaluación automática de respuestas en pipelines de anotación: generar decisiones tipadas calibradas para preetiquetar grandes volúmenes (el corpus de entrenamiento tiene 740.957 filas) y priorizar la revisión por confianza.
- Sistemas de decisión asistida en modalidad multimodal: cuando la variante VL se despliegue, el modelo podrá incorporar imágenes como entrada al juicio tipado.
- Gatekeeper de confianza previo a un modelo mayor: usar la calibración para decidir cuándo delegar una petición a un modelo más grande o a un humano.

## Benchmarks y rendimiento

Resultados medidos sobre el conjunto de test retenido test_set_30k (27.695 filas, excluyendo D1) de jev-distill-corpus-v3, con los suelos de aceptación de AutoTrust como referencia:

| Metrica | JEV-27B (Qwen pristino) | Este modelo (backbone sin censura) | Suelo | Estado |
|---|---|---|---|---|
| noul AUROC | 0.9961 | 0.985 | >= 0.95 | PASS |
| noul top-1 | 0.962 | 0.930 | — | -3.2 pts |
| choice top-1 | 0.904 | 0.855 | >= 0.90 | -4.9 pts |
| score top-1 | 0.890 | 0.797 | >= 0.891 | -9.3 pts |
| KL global | 0.019 | 0.055 | <= 0.15 | PASS |
| ECE (crudo) | 0.0011 | 0.033 | <= 0.03 | ~en el suelo |
| ECE (refit T 0.7/0.8/0.9) | — | noul 0.0032 / choice 0.018 / score 0.0046 | <= 0.03 | TODOS PASS |

Tasa de rechazo de 0.0 medida sobre una batería de 10 prompts, idéntica entre el base y el base más JEV.

## Requisitos de hardware

- Cuantizacion NVFP4 (compressed-tensors W4A4 + down_proj FP8) sobre 18,75B parametros. La estimacion de VRAM para pesos ronda los 11-13 GB; con cache KV para 32768 tokens conviene reservar del orden de 16-20 GB.
- GPU recomendadas: H100 y A100 (40/80 GB) para produccion con contexto completo; A100 40 GB permite una sola instancia holgada.
- Cabe en GPU de consumo: si, previsiblemente en RTX 4090 (24 GB) y RTX 5090, ajustando la longitud de contexto y el batch; la cuantizacion de 4 bits es la que lo hace viable.
- Despliegue: vLLM con `--quantization compressed-tensors`, mas el harness de decision serve_decide.py con `--enable-lora --max-lora-rank 32 --lora-modules jev-decision=./adapter_vllm --logprobs-mode processed_logprobs --max-model-len 32768`.
- La cabeza de decision (head.safetensors, decision_head.json, calibration.json, serve_decide.py) no se incluye en este repositorio y se publicara en SargeDev/JEV-27B-Uncensored; sin ella, este repo solo expone los pesos NVFP4 del backbone.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Backbone | Bloque de decision | Licencia |
|---|---|---|---|---|---|
| SargeDev/JEV-27B-Uncensored-NVFP4 | ~18,75B | 32768 | Qwen3.8-27B abliterated | Si (System-1, calibrado) | Apache 2.0 |
| AutoTrust JEV-27B | ~18,75B (segun familia) | no disponible | Qwen3.8-27B pristino | Si (System-1, calibrado) | Apache 2.0 |
| huihui-ai/Huihui-Qwen3.8-27B-abliterated | ~18,75B | no disponible | Qwen3.8-27B | No | Apache 2.0 |
| SargeDev/Jev_Qwen3.8-27B-NVFP4-FP8 | no disponible | no disponible | Qwen3.8-27B | Si (misma receta) | Apache 2.0 |

Los dos primeros comparten arquitectura y tarea; la diferencia medida esta en el intercambio de backbone (abliterated frente a pristino), que cuesta 3.2 puntos de top-1 en noul, 4.9 en choice y 9.3 en score, pero mantiene los suelos de AUROC y KL. El modelo de huihui carece del bloque de decision. Los modelos comparables fuera de esta familia (Qwen base, otros modelos de decision) no estan disponibles en la informacion proporcionada.

## Limitaciones y advertencias

- No apto para decisiones de alto impacto. El propio autor recomienda usar gating por confianza y enrutar las llamadas de baja confianza a un modelo mas fuerte o a un humano.
- La ablacion del backbone degrada la precision top-1 en choice (-4.9 pts) y sobre todo en score (-9.3 pts); la correccion mediante refit de temperatura recupera el ECE, pero no la precision.
- El ECE crudo (0.033) queda ligeramente por encima del suelo de 0.03 hasta aplicar el refit de temperatura por tipo de decision.
- La calibracion se ajusto con 384 prompts de un corpus privado (solar-decisions-corpus-v4), por lo que su generalizacion fuera de ese dominio no esta garantizada.
- Este repositorio contiene unicamente pesos NVFP4; la maquinaria de decision (cabeza, JSON de calibracion y serve_decide.py) aun no se distribuye aqui, lo que limita su uso inmediato como modelo de decision completo.
- La condicion sin censura implica que el modelo no aplica filtros de rechazo; requiere controles externos de contenido y cumplimiento normativo en produccion.
- Idiomas soportados: no disponible, por lo que no puede acreditarse cobertura multilingue.
- Riesgo de sesgos y de alucinacion: no cuantificado en la informacion proporcionada; al derivar de un modelo abliterated conviene auditar los sesgos antes de produccion.
- Licencia Apache 2.0, permisiva para uso comercial, siempre que se cumpla con la atribucion del linaje (AutoTrust AI, huihui-ai, Qwen, TypeSafe AI y SargeDev).

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/SargeDev/JEV-27B-Uncensored-NVFP4
- Repositorio de la cabeza de decision (pendiente de publicacion): https://huggingface.co/SargeDev/JEV-27B-Uncensored
- Dataset de entrenamiento: https://huggingface.co/datasets/SargeDev/jev-distill-corpus-v3
- Modelo base abliterated: https://huggingface.co/huihui-ai/Huihui-Qwen3.8-27B-abliterated
- JEV-27B original: https://huggingface.co/autotrust/JEV-27B
- JEV-27B-VL (variante con vision): https://huggingface.co/autotrust/JEV-27B-VL
- Backbone Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- Receta de cuantizacion de referencia: https://huggingface.co/SargeDev/Jev_Qwen3.8-27B-NVFP4-FP8
