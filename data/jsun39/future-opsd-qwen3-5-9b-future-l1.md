# jsun39/Future-OPSD-Qwen3.5-9B-Future-L1

## Resumen

Future-OPSD-Qwen3.5-9B-Future-L1 es un ajuste fino del modelo multimodal Qwen/Qwen3.5-9B desarrollado por Jingchen Sun (usuario jsun39 en Hugging Face) y presentado en el articulo *Learning Video Foresight Reasoning from Unlabeled Videos via On-Policy Self-Distillation*. El modelo esta especializado en prediccion de futuro sobre video: dado un clip observado, razona paso a paso y responde que ocurrira a continuacion en la escena. Se trata de un VLM (vision-language model) de 9.409.813.744 parametros con licencia Apache-2.0.

La contribucion tecnica del trabajo es el metodo de entrenamiento Future-OPSD, una variante de destilacion on-policy con contexto privilegiado. El alumno solo ve el video pasado, mientras que un profesor congelado (copia del mismo modelo) ve ademas los fotogramas futuros reales y, por separado, los de un video no relacionado. La ventaja por token combina el contraste entre futuro real y futuro ajeno con el termino de destilacion profesor-alumno, sin necesidad de etiquetas de respuesta, trazas de razonamiento ni modelos de recompensa externos.

El resultado es un checkpoint que mejora de forma clara la prediccion de futuro respecto a su base (TwiFF-Bench Avg 67,8 frente a 58,5) manteniendo practicamente intactas las capacidades generales de video (General 56,8 frente a 57,0). Es relevante para quien investigue razonamiento temporal en video, world models ligeros o tecnicas de auto-destilacion sin supervision.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (familia Qwen3.5, pipeline image-text-to-text); detalles internos no disponibles |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se publican pesos safetensors) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-9B, un VLM de la familia Qwen3.5 que procesa video e imagen junto con texto. No se detallan en la informacion disponible el numero de capas, el encoder visual ni el mecanismo de atencion; el unico dato estructural confirmado es el recuento de parametros (9,41 mil millones) y el pipeline image-text-to-text. El ajuste se realizo sobre el dataset Future-L1-50K, compuesto por pares de video pasado-futuro sin etiquetas de respuesta.

El entrenamiento emplea el objetivo Future-OPSD con contexto privilegiado z igual a los fotogramas futuros, lambda = 0,75 y baseline de media por lote. El profesor es una copia congelada del mismo modelo que ve el futuro real y, en paralelo, el futuro de un video no relacionado; la ventaja por token mezcla ese contraste con la destilacion profesor-alumno. El calendario fue de 100 pasos x 256 consultas (25.600 consultas), una rollout on-policy por consulta, learning rate 1e-6 y 8 GPUs B200. La semilla 31 se eligio como mejor de tres (puntuaciones TwiFF-Bench Avg de 67,7 / 67,8 / 66,1 para las semillas 30 / 31 / 32). No se mencionan fases de RLHF ni DPO.

## Capacidades

- Prediccion de futuro en video: razona paso a paso dentro de `<reason>` y emite la respuesta final dentro de `<answer>`.
- Comprension de video de corto y medio plazo (evaluado con 32 fotogramas en el protocolo del autor).
- Razonamiento temporal en multiples niveles: tareas SEED L1, L2 y L3 y TemporalBench.
- Comprension general de video e imagen: TempCompass, Video-MME y MVBench.
- Entrada image-text-to-text, por lo que tambien procesa imagenes ademas de video.
- Formato conversacional con plantilla de chat y soporte del flag `enable_thinking`.
- No se documenta soporte de tool calling, function calling ni comportamiento agentico multi-paso.
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Prediccion de siguiente accion en video de egocentrico o robotica: dado un clip de una persona manipulando objetos, el modelo anticipa el siguiente paso, util para planificacion en entornos de imitacion o asistencia.
- Analisis de vigilancia y seguridad: anticipar movimientos en secuencias de camaras fijas para generar alertas tempranas, aprovechando el razonamiento explicito en `<reason>`.
- Etiquetado asistido de video: generar descripciones del futuro probable de clips sin anotar, que luego se revisan manualmente para construir datasets de prediccion.
- Investigacion en world models y razonamiento temporal: servir como baseline reproducible de Future-OPSD frente a Qwen3.5-9B para estudiar el efecto del contexto privilegiado.
- Analisis deportivo: predecir la evolucion de una jugada a partir de los fotogramas previos para resumenes automaticos o narrativa en directo.
- Asistencia a edicion de video: sugerir el desenlace de una escena para tareas de continuidad o generacion de guiones.
- Evaluacion comparativa de VLMs: emplear el checkpoint como referencia en benchmarks de prediccion de futuro (TwiFF-Bench, SEED) en pipelines de investigacion.

## Benchmarks y rendimiento

Protocolo del autor: vLLM, decodificacion greedy, 32 fotogramas, system prompt indicado y presupuesto de razonamiento de 512 tokens. TwiFF-Bench puntuado de 1 a 5 por un juez Qwen3.6-27B y multiplicado por 20; "General" promedia TempCompass, TemporalBench, Video-MME y MVBench (19 tareas).

| Modelo | TwiFF CoT | TwiFF Ans. | TwiFF Avg | SEED L1 | SEED L2 | SEED L3 | TempCompass | TemporalBench | Video-MME | MVBench | General |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Qwen3.5-9B (base) | 62,4 | 54,5 | 58,5 | 44,3 | 44,9 | 37,9 | 79,9 | 21,4 | 61,2 | 65,6 | 57,0 |
| Este modelo | 69,9 | 65,7 | 67,8 | 42,9 | 45,0 | 34,8 | 79,1 | 20,9 | 62,6 | 64,7 | 56,8 |

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: en torno a 19 GB solo para pesos (9,41 mil millones de parametros), mas overhead de activaciones y cache KV para video; con clips de 32 fotogramas el consumo real es considerablemente mayor.
- Entrenamiento documentado en 8 GPUs B200, lo que da una idea del coste del ajuste, no de la inferencia.
- GPU recomendadas para inferencia: A100 80 GB, H100 80 GB o B200 para lotes grandes y contexto de video largo; en consumer, una RTX 4090 (24 GB) puede alojar los pesos en BF16 pero queda muy justa para video, y seria necesario cuantizar para mayor holgura.
- Despliegue: el autor documenta vLLM 0.30.0 con transformers 5.17 (`limit_mm_per_prompt={"video": 1}`) y transformers con `AutoModelForImageTextToText`. No se mencionan llama.cpp, Ollama ni TGI; al no publicarse GGUF, esas rutas no estan soportadas de forma directa.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | TwiFF Avg | General | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Future-OPSD-Qwen3.5-9B-Future-L1 | 9,41 B | no disponible | 67,8 | 56,8 | Apache-2.0 | Hugging Face (transformers, vLLM) |
| Qwen/Qwen3.5-9B (base) | 9,41 B (mismo tamano) | no disponible | 58,5 | 57,0 | Apache-2.0 | Hugging Face |
| Otros VLMs de ~9 B para prediccion de futuro | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El ajuste se centro en prediccion de futuro; el resto de capacidades generales de video se mantienen o caen ligeramente (General 56,8 frente a 57,0; SEED L3 34,8 frente a 37,9).
- Riesgo de alucinacion en el razonamiento dentro de `<reason>`: el modelo genera cadenas de razonamiento plausibles que pueden no corresponder a la evolucion real de la escena.
- Requiere usar el system prompt exacto del autor y el formato `<reason>`/`<answer>`; fuera de ese formato el rendimiento puede degradarse.
- El checkpoint es una sola semilla (31); el autor advierte que las estadisticas completas de semillas estan en el paper.
- El protocolo de evaluacion usa un juez automatico (Qwen3.6-27B), lo que introduce dependencia del juez en las puntuaciones.
- Idiomas soportados no documentados; no se garantiza un comportamiento multilingue especifico.
- Datos de entrenamiento (Future-L1-50K) sujetos a sus propios terminos, independientes de la licencia Apache-2.0 del modelo.
- No se documentan sesgos; al entrenarse sin etiquetas, puede heredar los sesgos del modelo base y de los videos de entrenamiento.
- Uso comercial permitido por Apache-2.0, pero conviene revisar la licencia del dataset y del modelo base antes de desplegar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jsun39/Future-OPSD-Qwen3.5-9B-Future-L1
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Codigo: https://github.com/Jingchensun/future-opsd
- Pagina del proyecto: https://jingchensun.github.io/future-opsd/
- Dataset: https://huggingface.co/datasets/Eurayka/Future-L1-50K
