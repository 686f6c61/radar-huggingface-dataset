# bhc6/ECT-LLaVA-OneVision-7B

## Resumen

ECT-LLaVA-OneVision-7B es un adaptador LoRA publicado por el usuario bhc6 sobre el modelo base LLaVA-OneVision-Qwen2-7B-OV, un modelo vision-lenguaje de 7 mil millones de parametros desarrollado originalmente por el equipo LLaVA. El adaptador implementa el metodo Evidence-Contrastive Training (ECT), descrito en el articulo *Speak When You See It: Proactive Task Assistants Should Wait for Evidence, Not the Clock*, y esta especializado en la deteccion proactiva de errores y en la confirmacion de finalizacion de pasos en video egocentrico de cocina.

El problema que aborda es el de los asistentes proactivos basados en video: decidir, en cada instante, si el usuario ha completado el paso actual o si ha cometido un error, sin depender unicamente del tiempo transcurrido. La innovacion de ECT consiste en construir pares de ejemplos emparejados temporalmente (mismo video, mismo instante, uno con evento y otro sin el) de modo que una politica basada solo en el reloj no pueda separar las etiquetas. Este adaptador concreto replica la receta del modelo principal (Qwen3-VL-2B) sobre una columna vertebral distinta para comprobar si el metodo depende de la arquitectura subyacente.

El modelo se distribuye exclusivamente como pesos LoRA (rank 64, alpha 128) sobre las proyecciones de atencion y MLP del modelo de lenguaje, con un tamano de repositorio de 0,6 GB. Requiere cargar el modelo base LLaVA-OneVision-Qwen2-7B-OV por separado. La licencia es de investigacion exclusiva (qicd-research-only), lo que restringe severamente su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre LLaVA-OneVision-Qwen2-7B-OV (transformer vision-lenguaje) |
| Parametros totales | 7B en el modelo base; el adaptador LoRA es un subconjunto (rank 64, alpha 128, dropout 0) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | no disponible en la informacion proporcionada (el adaptador se distribuye en safetensors) |
| Idiomas soportados | no disponible |
| Licencia | qicd-research-only (uso exclusivo de investigacion) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); requiere el base en safetensors |
| Libreria | peft (compatible con transformers) |
| Modelo base | llava-hf/llava-onevision-qwen2-7b-ov-hf |
| Tamano del repositorio | 0,6 GB |
| Pipeline | video-text-to-text |

## Arquitectura y entrenamiento

El adaptador se aplica sobre LLaVA-OneVision-Qwen2-7B-OV, un modelo vision-lenguaje que combina un codificador visual con el modelo de lenguaje Qwen2-7B y un proyector multimodal. El adaptador LoRA (rank 64, alpha 128, dropout 0) se inserta en las proyecciones de atencion y MLP del modelo de lenguaje, dejando congelado el resto de la red.

El entrenamiento sigue el protocolo Evidence-Contrastive Training (ECT): se afina sobre las preguntas por paso del propio benchmark (¿esta completado el paso? ¿ha ocurrido un error?) y cada ejemplo negativo se extrae de la misma grabacion y en el mismo instante que su positivo correspondiente, de forma que el tiempo transcurrido no pueda separar las etiquetas. El conjunto de datos son 209 videos de QICD Advanced Planning y se uso una unica semilla de entrenamiento. El autor no documenta en la informacion disponible el numero total de tokens de entrenamiento ni si hubo fases de RLHF o DPO.

## Capacidades

- Generacion de texto condicionada por video egocentrico (video-text-to-text) para tareas de asistencia proactiva.
- Deteccion de errores en la ejecucion de tareas de cocina (mistake detection) mediante respuestas si/no por paso.
- Confirmacion de finalizacion de pasos (instruction completion) a partir de evidencia visual.
- Razonamiento temporal guiado por evidencia visual en lugar de por el reloj, gracias al entrenamiento con pares emparejados temporalmente.
- Transferencia zero-shot a dominios de video no vistos (evaluado en Ego-MC-Bench sin adaptacion).
- Soporte multilingue: no disponible en la informacion proporcionada.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Modo thinking explicito: no disponible en la informacion proporcionada.

## Casos de uso

- Asistente de cocina proactivo: el modelo recibe el video egocentrico del usuario y, cada 5 segundos, responde si el paso actual esta completado y si se ha cometido un error, permitiendo avisos oportunos sin interrumpir al usuario por simple temporizacion.
- Deteccion de errores en tiempo real en entornos formativos: en escuelas de cocina o programas de formacion, el adaptador puede marcar desviaciones del procedimiento mientras el alumno cocina, con la ventaja de que sus alarmas superan a las de una politica basada solo en el tiempo (Δ positivo de F1).
- Evaluacion automatica de tareas manuales: en control de calidad de procesos con pasos definidos, el modelo puede verificar la finalizacion de cada paso a partir del video y generar registros de cumplimiento.
- Investigacion en asistentes proactivos: el adaptador sirve como replicacion de ECT sobre una columna vertebral distinta a la del modelo principal, util para estudiar si el metodo es independiente de la arquitectura.
- Transferencia a nuevos dominios de video: dado su comportamiento zero-shot en Ego-MC-Bench (IC-Acc del 64 %), puede emplearse como punto de partida para tareas de deteccion de errores en videos egocentricos de otros ambitos.
- Analisis de grabaciones retrospectivas: procesar videos de sesiones de cocina ya grabadas para etiquetar completaciones y errores por paso, con fines de anotacion asistida o analisis de datos.
- Prototipado de sistemas de asistencia remota: integrado en un pipeline que consuma video en streaming y consulte al modelo por turnos, puede alimentar interfaces de ayuda a distancia para operarios.

## Benchmarks y rendimiento

Resultados declarados por el autor (no verificados), con el protocolo oficial por turnos de cada benchmark y decodificacion greedy.

QICD Advanced Planning, test (36 videos):

| Modelo | IC-Acc (%) | Precision | Recall | F1 | TP/FP/FN | Δ |
|---|---|---|---|---|---|---|
| ECT (este adaptador) | 49,6 | 0,288 | 0,122 | 0,171 | 32/79/231 | +0,090 |
| LLaVA-OneVision-7B zero-shot (base) | 0,0 | 0,000 | 0,000 | 0,000 | 0/0/263 | -0,353 |
| ECT Qwen3-VL-2B semilla 0 (modelo principal) | 41,2 | 0,208 | 0,228 | 0,217 | 60/229/203 | +0,012 |

Ego-MC-Bench (39 sesiones, sin adaptacion):

| Modelo | IC-Acc (%) | Precision | Recall | F1 | TP/FP/FN | Δ |
|---|---|---|---|---|---|---|
| ECT (este adaptador) | 64,0 | 0,444 | 0,050 | 0,090 | 20/25/377 | +0,090 |
| LLaVA-OneVision-7B zero-shot (base) | 0,0 | 0,000 | 0,000 | 0,000 | 0/0/397 | -0,388 |
| ECT Qwen3-VL-2B semilla 0 (modelo principal) | 67,0 | 0,510 | 0,131 | 0,208 | 52/50/345 | +0,208 |

QICD Main, test (109 videos, sin ajuste sobre este conjunto):

| Modelo | IC-Acc (%) | Precision | Recall | F1 | TP/FP/FN | Δ |
|---|---|---|---|---|---|---|
| ECT (este adaptador) | 52,7 | 0,149 | 0,101 | 0,120 | 45/258/400 | +0,010 |
| ECT Qwen3-VL-2B semilla 0 (modelo principal) | 53,5 | 0,164 | 0,263 | 0,202 | 117/597/328 | +0,104 |

Politicas ciegas al video (referencia):

| Politica | QICD IC-Acc | QICD F1 | Ego-MC IC-Acc | Ego-MC F1 |
|---|---|---|---|---|
| Regla ciega, mejor F1 (alarma a 25 s, confirmacion a 30 s) | 0,0 | 0,316 | 0,0 | 0,373 |
| Regla ciega, mejor IC-Acc | 46,6 | 0 | 56,1 | 0 |

Pares emparejados temporalmente (test QICD):

| Modelo | Pares de completacion (417): precision de par [IC 95 %] | Ambos correctos | Pares de error (514): precision de par [IC 95 %] | Ambos correctos |
|---|---|---|---|---|
| ECT (este adaptador) | 0,894 [0,848; 0,936] | 0,583 | 0,751 [0,673; 0,821] | 0,086 |
| ECT Qwen3-VL-2B semilla 0 (modelo principal) | 0,903 [0,856; 0,950] | 0,607 | 0,766 [0,692; 0,833] | 0,173 |

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un adaptador LoRA sobre un base de 7B, se requiere cargar el modelo completo. En precision bf16, el base necesita aproximadamente 14-16 GB de VRAM solo para pesos, mas el coste del codificador visual y de los frames de video; en cuantizacion de 8 bits, en torno a 8-9 GB, y en 4 bits, alrededor de 5-6 GB (estimaciones generales para un modelo de 7B, no publicadas por el autor).
- GPU recomendadas: A100 40/80 GB o H100 para evaluacion por lotes con video; RTX 4090 (24 GB) suficiente para inferencia en bf16 de una sola secuencia.
- Cabe en GPU de consumo: si, en tarjetas con 16 GB o mas en bf16 (RTX 4080/4090, A4000 16 GB) y en tarjetas de 8-12 GB con cuantizacion de 8 o 4 bits.
- Opciones de despliegue: transformers con peft (carga del base mas `PeftModel`), vLLM (si soporta el adaptador LoRA sobre LLaVA-OneVision), TGI y llama.cpp/Ollama solo si se dispone de una conversion GGUF del modelo fusionado.
- Latencia y throughput: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | IC-Acc (QICD Adv.) | F1 error (QICD Adv.) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| ECT-LLaVA-OneVision-7B (este) | 7B + LoRA r64 | no disponible | 49,6 | 0,171 | qicd-research-only | Hugging Face |
| ECT-Qwen3-VL-2B (modelo principal del paper) | 2B + LoRA | no disponible | 41,2 | 0,217 | no disponible | Hugging Face (bhc6/ECT-Qwen3-VL-2B) |
| LLaVA-OneVision-Qwen2-7B-OV (base, zero-shot) | 7B | no disponible | 0,0 | 0,000 | no disponible | Hugging Face |

El adaptador supera al modelo principal en IC-Acc sobre QICD Advanced Planning (49,6 frente a 41,2) pero queda por debajo en F1 de errores (0,171 frente a 0,217). Frente al base sin ajustar, la mejora es total, ya que el modelo base no confirma ningun paso ni detecta ningun error en el protocolo evaluado.

## Limitaciones y advertencias

- Licencia qicd-research-only: el uso comercial esta prohibido; los terminos completos se remiten al PDF de licencia del dataset QICD de Qualcomm.
- Entrenado con una unica semilla, por lo que no se reporta variabilidad entre ejecuciones.
- El recall de errores es bajo (0,122 en QICD Advanced Planning y 0,050 en Ego-MC-Bench), con muchos falsos negativos (231 y 377 respectivamente); no es adecuado como unico mecanismo de seguridad en entornos criticos.
- La precision de error es moderada (0,288 y 0,444), lo que implica una proporcion notable de falsas alarmas.
- El rendimiento en QICD Main cae drasticamente en Δ (+0,010), lo que sugiere una capacidad limitada para superar la frontera ciega al video en dominios no vistos.
- La evaluacion se limita a video egocentrico de cocina; no hay evidencia de generalizacion a otros dominios.
- Riesgo de alucinacion inherente a los modelos vision-lenguaje: puede confirmar pasos o errores sin evidencia visual suficiente.
- Idiomas soportados no documentados; no se garantiza un comportamiento correcto fuera del ingles.
- Requiere cargar el modelo base completo (7B) ademas del adaptador, con el coste de VRAM asociado.
- Los resultados del model-index estan marcados como no verificados (`verified: false`).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/bhc6/ECT-LLaVA-OneVision-7B
- Modelo principal del paper (Qwen3-VL-2B): https://huggingface.co/bhc6/ECT-Qwen3-VL-2B
- Codigo del proyecto: https://github.com/bhc6/speak-when-you-see-it
- Modelo base: https://huggingface.co/llava-hf/llava-onevision-qwen2-7b-ov-hf
- Dataset QICD: https://huggingface.co/datasets/qualcomm/qualcomm-interactive-cooking-dataset
- Dataset Ego-MC-Bench: https://huggingface.co/datasets/qualcomm/qualcomm-interactive-cooking-dataset-ego-mistake-corrections
- Licencia: https://huggingface.co/datasets/qualcomm/qualcomm-interactive-cooking-dataset/blob/main/LICENSE.pdf
- Paper: *Speak When You See It: Proactive Task Assistants Should Wait for Evidence, Not the Clock* (Bohe Chen); identificador arXiv no disponible en la informacion proporcionada.
