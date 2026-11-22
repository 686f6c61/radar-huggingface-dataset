# jsun39/Future-OPSD-Qwen3-VL-8B-EgoPlan-IT

## Resumen
Future-OPSD-Qwen3-VL-8B-EgoPlan-IT es un ajuste fino de Qwen/Qwen3-VL-8B-Instruct desarrollado por Jingchen Sun y colaboradores, entrenado con el metodo Future-OPSD (On-Policy Self-Distillation) descrito en el paper "Learning Video Foresight Reasoning from Unlabeled Videos via On-Policy Self-Distillation". El modelo esta especializado en prediccion de acciones futuras en videos (next-action planning) en dominios de video en primera persona, y se distribuye con licencia Apache-2.0.

La innovacion principal es el entrenamiento sin etiquetas: el estudiante ve solo el video observado y genera su propio razonamiento y respuesta, mientras que una copia congelada del mismo modelo (profesor) ve ademas los fotogramas futuros reales y, por separado, los de un video no relacionado. La ventaja por token combina el contraste entre futuro real y futuro no relacionado con el termino de destilacion profesor-estudiante, sin usar etiquetas de respuesta, trazas de razonamiento ni modelos de recompensa externos.

El modelo parte de una arquitectura Qwen3-VL de 8.767 millones de parametros y resuelve el problema de adaptar un VLM generalista a tareas de anticipacion temporal en video con datos no anotados. Es relevante porque demuestra que la destilacion on-policy con contexto privilegiado puede mejorar el razonamiento temporal sin supervision explicita, manteniendo el rendimiento general del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3-VL (transformer multimodal vision-language) |
| Parametros totales | 8.767.123.696 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | no disponible en la informacion proporcionada |
| Idiomas soportados | no disponible en la informacion proporcionada |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento
El modelo hereda la arquitectura Qwen3-VL-8B-Instruct, un transformer multimodal capaz de procesar imagenes y video junto con texto. Sobre esa base se aplica un ajuste fino con el objetivo Future-OPSD, que utiliza contexto privilegiado z = fotogramas futuros y un coeficiente lambda = 0.75 con baseline de media por batch. El entrenamiento consistio en 100 pasos x 256 consultas (25.6K consultas totales), 1 rollout on-policy por consulta, learning rate 1e-6, ejecutado en 8 GPU B200. La semilla elegida (seed 30) fue la mejor de tres por puntuacion en SEED-Bench-R1, con medias (L1-L3) de 53.7 / 53.5 / 53.5 para las semillas 30 / 31 / 32.

Los datos de entrenamiento son EgoPlan-IT, construido a partir de los datos de entrenamiento de SEED-Bench-R1, usando los fotogramas futuros como contexto privilegiado y sin etiquetas de respuesta. No se emplearon trazas de razonamiento ni modelos de recompensa externos. El protocolo de evaluacion usa vLLM, decodificacion greedy, 32 fotogramas, el system prompt indicado y un presupuesto de razonamiento de 512 tokens.

## Capacidades
- Generacion de texto y razonamiento multimodal sobre video e imagen.
- Comprension de video en primera persona y prediccion de la siguiente accion.
- Razonamiento explicito en formato `<reason> ... </reason>` seguido de respuesta en `<answer> ... </answer>`.
- Prediccion de acciones futuras en tareas de planificacion cerrada (closed-ended next-action planning).
- Capacidades generales de VLM heredadas del modelo base Qwen3-VL-8B-Instruct (comprension de imagen, video y texto).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Modo thinking: si, mediante el bloque `<reason>` con presupuesto de 512 tokens en evaluacion.

## Casos de uso
- Prediccion de siguiente accion en videos de cocina y tareas domesticas: el modelo analiza el clip observado y anticipa la accion mas probable del usuario, util para asistentes de cocina o robots de asistencia domestica entrenados con datos tipo EPIC-KITCHENS.
- Asistencia a robots de primera persona: integrado en un pipeline de percepcion, el modelo predice la siguiente accion del operario para planificacion de tareas en entornos de video egocentrico.
- Analisis de videos de entrenamiento deportivo o de procedimientos: anticipa el siguiente paso en secuencias de video para generar instrucciones o alertas.
- Investigacion en razonamiento temporal: sirve como checkpoint de referencia para estudiar destilacion on-policy y prediccion de futuro sin etiquetas.
- Evaluacion comparativa de VLMs en tareas de anticipacion: util para medir la mejora frente al modelo base en benchmarks como TwiFF-Bench y SEED-Bench-R1.
- Generacion de datos sinteticos de planificacion: las salidas `<reason>`/`<answer>` pueden usarse para crear trazas de razonamiento en dominios de video no anotados.
- Prototipado de asistentes de video interactivos: con vLLM y decodificacion greedy, permite desplegar un servicio de prediccion de siguiente accion sobre clips cortos.

## Benchmarks y rendimiento

| Modelo | TwiFF CoT | TwiFF Ans. | TwiFF Avg | SEED L1 | SEED L2 | SEED L3 | TempCompass | TemporalBench | Video-MME | MVBench | General |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Qwen3-VL-8B-Instruct (base) | 58.6 | 48.7 | 53.6 | 45.4 | 47.5 | 39.7 | 78.3 | 18.6 | 61.7 | 65.5 | 56.0 |
| Future-OPSD-Qwen3-VL-8B-EgoPlan-IT | 65.1 | 55.0 | 60.0 | 54.4 | 56.5 | 50.2 | 78.7 | 18.8 | 62.4 | 64.7 | 56.2 |

TwiFF-Bench se puntua de 1 a 5 con un juez Qwen3.6-27B y se reporta x20. "General" promedia TempCompass, TemporalBench, Video-MME y MVBench (19 tareas). Los datos corresponden a este checkpoint (una semilla); el paper incluye estadisticas por semilla.

## Requisitos de hardware
- VRAM estimada para inferencia: no disponible de forma explicita; con 8.767 millones de parametros, en fp16 se requiere aproximadamente 17.5 GB de pesos mas memoria para activaciones y cache de video.
- GPU recomendadas: el entrenamiento se realizo en 8 x B200; para inferencia se puede usar A100, H100 o GPUs con al menos 24 GB de VRAM en cuantizacion reducida.
- Cabe en GPU consumer: probablemente en RTX 4090 (24 GB) en fp16 con cuantizacion o resolucion de video reducida; no confirmado en la informacion proporcionada.
- Opciones de despliegue: vLLM (>= 0.11, transformers >= 4.57) y transformers con AutoModelForImageTextToText; otras opciones como llama.cpp u Ollama no estan confirmadas.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | TwiFF Avg | SEED L1-L3 | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Future-OPSD-Qwen3-VL-8B-EgoPlan-IT | 8.767 M | no disponible | 60.0 | 54.4 / 56.5 / 50.2 | Apache-2.0 | Hugging Face |
| Qwen3-VL-8B-Instruct (base) | 8B | no disponible | 53.6 | 45.4 / 47.5 / 39.7 | Apache-2.0 | Hugging Face |
| Alternativas de prediccion de futuro en video | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias
- Entrenado especificamente en EgoPlan-IT, derivado de EPIC-KITCHENS (CC BY-NC 4.0); el uso comercial de los datos de entrenamiento puede estar restringido aunque los pesos sean Apache-2.0.
- El modelo esta especializado en prediccion de siguiente accion en video egocentrico; su rendimiento en otras tareas de video puede degradarse (MVBench baja de 65.5 a 64.7 respecto al base).
- Riesgo de alucinacion en la prediccion de acciones futuras, especialmente con clips ambiguos o fuera del dominio de cocina.
- Requiere el system prompt especifico y el formato `<reason>`/`<answer>` para un funcionamiento correcto.
- Los resultados de benchmarks corresponden a una sola semilla; el paper reporta variabilidad entre semillas (53.7 / 53.5 / 53.5 en SEED-Bench-R1).
- Idiomas soportados no documentados; el comportamiento multilingue no esta garantizado.
- Limitaciones de contexto y de numero de fotogramas (32 en evaluacion) no estan documentadas mas alla del protocolo.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en produccion.

## Enlaces
- Hugging Face: https://huggingface.co/jsun39/Future-OPSD-Qwen3-VL-8B-EgoPlan-IT
- Codigo: https://github.com/Jingchensun/future-opsd
- Pagina del proyecto: https://jingchensun.github.io/future-opsd/
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-8B-Instruct
- Dataset de evaluacion: https://huggingface.co/datasets/TencentARC/SEED-Bench-R1
