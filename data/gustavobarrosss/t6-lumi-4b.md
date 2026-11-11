# gustavobarrosss/t6-lumi-4b

## Resumen

T6-Lumi es un ajuste fino (fine-tune) del modelo Lumi-4B-v0.2 de CEIA/UFG, desarrollado por gustavobarrosss, orientado a habilitar y estabilizar el modo de razonamiento (thinking) en portugues. Lumi hereda la arquitectura y el modo de razonamiento de NVIDIA Nemotron 3 Nano 4B, pero su release original no entreno ni valido ese modo: con thinking activado razonaba en ingles y a menudo no cerraba la etiqueta `</think>`, alcanzando el limite de 4.096 tokens en el 60,9% de las preguntas del examen de la OAB. T6-Lumi corrige ambos problemas mediante dos etapas de ajuste con LoRA fusionadas en los pesos.

El modelo mantiene exactamente la misma arquitectura, tamano, tokenizer y plantilla de chat que Lumi-4B: un hibrido NemotronH de 42 capas (21 bloques Mamba-2, 17 bloques MLP y 4 de atencion) con 3.973.556.832 parametros en BF16. La innovacion no esta en la arquitectura sino en el entrenamiento: primero un SFT sobre trazas de razonamiento en portugues generadas por NVIDIA Nemotron 3 Nano 30B-A3B, y despues una etapa de preferencia anti-bucle (Antidoom, basada en Final Token Preference Optimization) para evitar repeticiones.

Su relevancia es practica: demuestra que con un presupuesto de computo muy bajo (18 minutos de SFT LoRA mas 6 minutos de etapa anti-bucle en una unica GPU de 24 GB) se puede convertir un modelo que razona en ingles y se atasca en uno que razona en portugues y termina dentro de un presupuesto acotado. La ganancia medida en la puntuacion de razonamiento es de +6,8 pp frente a Lumi con thinking y +4,4 pp frente a Lumi sin thinking, aunque el autor advierte que el beneficio proviene de terminar el razonamiento, no de razonar mejor por item.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | NemotronH hibrida: 42 capas (21 Mamba-2, 17 MLP, 4 atencion) |
| Parametros totales | 3.973.556.832 (3,97B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos publicados en BF16) |
| Idiomas soportados | Portugues (razonamiento y respuestas); ingles heredado del modelo base, no evaluado |
| Licencia | No declarada (igual que Lumi-4B-v0.2) |
| Formato de pesos | safetensors (custom_code) |

## Arquitectura y entrenamiento

La arquitectura es identica a la de Lumi-4B-v0.2, que a su vez reproduce la de NVIDIA Nemotron 3 Nano 4B: un modelo hibrido de 42 capas que combina 21 bloques Mamba-2 (modelos de espacio de estados), 17 bloques MLP y solo 4 bloques de atencion. Esta mezcla reduce el coste computacional del contexto largo frente a un transformer denso equivalente. El checkpoint tiene 3,97B parametros en BF16 y conserva el tokenizer y la plantilla de chat del modelo base.

El entrenamiento se realizo en dos etapas con LoRA, ambas fusionadas en los pesos finales. La primera etapa fue un SFT sobre trazas de razonamiento en portugues escritas por NVIDIA Nemotron 3 Nano 30B-A3B, usando los datasets Polygl0t/gigaverbo-v2-sft, Polygl0t/gsm8k-pt, open-r1/Mixture-of-Thoughts, TIGER-Lab/WebInstruct-verified y openlifescienceai/medmcqa. La segunda etapa es un ajuste de preferencia anti-bucle (Antidoom) basado en Final Token Preference Optimization (FTPO), disenado para que el modelo deje de caer en bucles de repeticion. El coste total fue de 18 minutos de SFT LoRA mas 6 minutos de etapa anti-bucle, mas 1,7 horas para minar los bucles, todo en una unica GPU de 24 GB. Cambiaron 72 de los 263 tensores de pesos: las `in_proj` de los 21 bloques Mamba-2, las `up_proj` y `down_proj` de los 17 bloques MLP, las 16 proyecciones de atencion y el `lm_head`. No hubo RL, RLVR, entrenamiento de tool-use ni de identidad de modelo.

## Capacidades

- Generacion de texto conversacional en portugues con modo de razonamiento (thinking) activado.
- Razonamiento en portugues: entre el 97,3% y el 100% de las trazas de razonamiento en los cinco conjuntos de prueba estan en portugues (frente a ingles en Lumi).
- Cierre del razonamiento dentro de un presupuesto acotado: cierra `</think>` en menos de 4.096 tokens nuevos en el 82,6% al 99,8% de las generaciones.
- Razonamiento matematico (GSM8K-PT) y resolucion de preguntas de opcion multiple (MMLU-ProX, ENEM, BLUEX, OAB).
- Conocimiento en dominios academicos y profesionales en portugues (examenes de bachillerato, universidad y abogacia).
- No dispone de entrenamiento especifico de tool calling, function calling, agentes, vision, audio ni identidad de modelo.

## Casos de uso

- Tutoria academica en portugues: el modelo puede resolver preguntas de examenes tipo ENEM o BLUEX mostrando el razonamiento paso a paso en portugues antes de la respuesta final, gracias a su modo thinking entrenado para cerrar dentro de 4.096 tokens.
- Asistencia en preparacion de oposiciones y examenes de abogacia: con una puntuacion del 44,0% en OAB Exams, sirve como apoyo para practicar preguntas de opcion multiple con explicacion del razonamiento, aunque no sustituye a un profesional.
- Generacion de cadenas de razonamiento sinteticas en portugues: util para crear datasets de entrenamiento o destilacion en portugues, ya que el modelo produce trazas en ese idioma de forma consistente (97,3%-100%).
- Evaluacion comparativa de modelos en portugues: su protocolo de evaluacion zero-shot con formato fijo y metrica de exactitud estricta lo hace adecuado como referencia en pipelines de evaluacion de razonamiento en portugues.
- Investigacion sobre ajuste eficiente de parametros: sirve como caso de estudio reproducible de como un SFT LoRA de 18 minutos mas una etapa FTPO de 6 minutos corrigen el idioma y los bucles de un modelo base, con todos los hiperparametros y datasets publicados.
- Despliegue ligero en entornos con una sola GPU de 24 GB: el modelo en BF16 cabe en una RTX 4090, lo que permite prototipado local de asistentes de razonamiento en portugues sin infraestructura de datacenter.
- Analisis de examenes medicos basicos: el SFT incluye el dataset medmcqa, por lo que puede responder preguntas de conocimiento medico de nivel basico en portugues, siempre con supervision humana.

## Benchmarks y rendimiento

Evaluacion zero-shot con prompt en portugues, decodificacion greedy, maximo 4.096 tokens nuevos, vLLM 0.33.0, misma maquina (NVIDIA RTX 4090, BF16). Metrica: exactitud estricta (la respuesta se lee solo tras `</think>` y debe seguir el formato pedido; una generacion que no cierra `</think>` puntua cero).

| Benchmark | Items | Lumi (sin thinking) | Lumi (thinking) | T6-Lumi (thinking) | Delta vs Lumi (thinking) | Delta vs Lumi (sin thinking) |
|---|---:|---:|---:|---:|---:|---:|
| GSM8K-PT | 1.295 | 85,3 | 88,7 | 90,3 | +1,6 [0,0, +3,2] | +5,0 [+3,3, +6,7] |
| MMLU-ProX PT | 11.759 | 48,8 | 53,6 | 54,5 | +0,9 [+0,1, +1,7] | +5,6 [+4,8, +6,5] |
| ENEM | 1.431 | 78,8 | 80,2 | 83,9 | +3,7 [+1,8, +5,7] | +5,1 [+3,0, +7,2] |
| BLUEX | 722 | 71,2 | 72,0 | 76,9 | +4,8 [+1,8, +7,8] | +5,7 [+2,2, +9,0] |
| OAB Exams | 2.210 | 43,5 | 21,2 | 44,0 | +22,8 [+20,6, +2...] | no disponible (intervalo truncado en la informacion) |
| Puntuacion de razonamiento (media) | - | 65,5 | 63,2 | 69,9 | +6,8 [+5,9, +7,6] | +4,4 [+3,4, +5,4] |

Nota del autor: donde Lumi y T6-Lumi ambos terminan el razonamiento, T6-Lumi es entre 0,3 y 2,7 puntos porcentuales menos preciso por item. La ganancia agregada proviene de terminar el razonamiento dentro de un presupuesto acotado, no de un mejor razonamiento por item. Los intervalos de confianza son del 95% por bootstrap pareado con 10.000 remuestreos.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 8 GB de pesos mas overhead de KV cache y activaciones; cabe en una GPU de 24 GB (el autor lo ejecuto en una RTX 4090).
- GPU recomendadas: NVIDIA RTX 4090 (24 GB) validada por el autor; A100 y H100 son sobredimensionadas para 3,97B parametros pero permiten mayor throughput y lotes mas grandes.
- Cabe en GPU de consumo: si, en RTX 4090 y en tarjetas con 16-24 GB; en 12 GB requeriria cuantizacion, que no esta documentada en la informacion disponible.
- Opciones de despliegue: vLLM 0.33.0 (usado en la evaluacion, con tokens de parada `</s>` y `<|im_end|>`, ids 2 y 11); al usar `custom_code` es necesario confiar en el codigo remoto del repositorio. Otras opciones (llama.cpp, Ollama, TGI) no estan documentadas en la informacion disponible.
- Latencia y throughput: no disponibles. El entrenamiento completo (SFT mas anti-bucle, sin contar el minado de bucles) requirio 24 minutos en una GPU de 24 GB.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Razonamiento en portugues | Puntuacion de razonamiento | Licencia |
|---|---|---:|---|---:|---|
| T6-Lumi | 3,97B | no disponible | Si (97,3%-100% de trazas) | 69,9 | no declarada |
| Lumi-4B (thinking) | 3,97B | no disponible | No (razona en ingles) | 63,2 | no declarada |
| Lumi-4B (sin thinking) | 3,97B | no disponible | No aplica | 65,5 | no declarada |
| NVIDIA Nemotron 3 Nano 4B | 4B | no disponible | No evaluado | no disponible | no disponible en la informacion |

La comparativa se limita a las variantes del propio modelo base y a Nemotron 3 Nano 4B, del que T6-Lumi hereda la arquitectura. No se dispone de datos de benchmarks de otros modelos de 4B en portugues en la informacion proporcionada.

## Limitaciones y advertencias

- El modelo debe usarse con thinking activado; no fue entrenado ni evaluado como modelo sin thinking. Para uso sin thinking, el autor recomienda Lumi-4B.
- La ganancia medida proviene de terminar el razonamiento dentro de un presupuesto acotado, no de un mejor razonamiento por item: donde ambos modelos terminan, T6-Lumi es 0,3 a 2,7 pp menos preciso por item.
- No tiene entrenamiento de RL, RLVR, tool-use ni identidad de modelo, por lo que no debe esperarse soporte fiable de function calling o agentes.
- El ingles esta heredado del modelo base pero no fue evaluado para T6-Lumi; el rendimiento en idiomas distintos del portugues es incierto.
- La licencia no esta declarada, lo que impide asumir permiso de uso comercial; es necesario contactar con el autor antes de cualquier despliegue en produccion.
- Riesgo de alucinacion inherente a un modelo de 4B, especialmente en dominios especializados como derecho (44,0% en OAB) o medicina; no apto como sustituto de asesoramiento profesional.
- Riesgo residual de bucles de repeticion pese a la etapa anti-bucle; el modelo cierra `</think>` en el 82,6% al 99,8% de las generaciones, no en el 100%.
- Al usar `custom_code`, la carga del modelo requiere ejecutar codigo remoto del repositorio, lo que anade un riesgo de seguridad en entornos de produccion.
- El modelo tiene 0 descargas y 0 likes en el momento de la ficha, por lo que no cuenta con validacion de la comunidad.
- Sesgos conocidos: no documentados en la informacion disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/gustavobarrosss/t6-lumi-4b
- Modelo base Lumi-4B: https://huggingface.co/ceia-br/lumi-4b
- Model card de NVIDIA Nemotron 3 Nano 4B BF16: https://huggingface.co/nvidia/NVIDIA-Nemotron-3-Nano-4B-BF16
- Dataset Polygl0t/gigaverbo-v2-sft: https://huggingface.co/datasets/Polygl0t/gigaverbo-v2-sft
- Dataset Polygl0t/gsm8k-pt: https://huggingface.co/datasets/Polygl0t/gsm8k-pt
- Dataset open-r1/Mixture-of-Thoughts: https://huggingface.co/datasets/open-r1/Mixture-of-Thoughts
- Dataset TIGER-Lab/WebInstruct-verified: https://huggingface.co/datasets/TIGER-Lab/WebInstruct-verified
- Dataset openlifescienceai/medmcqa: https://huggingface.co/datasets/openlifescienceai/medmcqa
- Dataset MMLU-ProX: https://huggingface.co/datasets/li-lab/MMLU-ProX
- Dataset ENEM challenge: https://huggingface.co/datasets/eduagarcia/enem_challenge
- Dataset BLUEX without images: https://huggingface.co/datasets/nicholasKluge/BLUEX_without_images
- Dataset OAB Exams: https://huggingface.co/datasets/eduagarcia/oab_exams
- Paper FTPO (arxiv:2510.15061): https://arxiv.org/abs/2510.15061
- Paper LoRA (arxiv:2106.09685): https://arxiv.org/abs/2106.09685
- Perfil de GitHub del autor: https://github.com/gustavobarrosss
- Perfil de GitHub del coautor: https://github.com/Pires-De-Andrade
