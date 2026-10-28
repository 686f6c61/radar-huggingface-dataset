# SinhalaMMLU-SharedTask/team-rexx

## Resumen

`SinhalaMMLU-SharedTask/team-rexx` es el repositorio de código, script de inferencia y predicciones finales del equipo Rexx (P. L. M. S. Udayashan, Universidad de Sri Jayewardenepura; K. Praveen, Universidad de Ruhuna) para la tarea compartida Sinhala MMLU. El repositorio en sí no contiene pesos: el modelo evaluado vive en `SinhalaMMLU-SharedTask/team-rexx-gemma-4-e4b` (commit `f6936800`) y se publica también como `sinhala-mmlu/gemma-4-e4b-sinhala-mmlu` (tag `v2.0.0`). Conviene leer esta ficha como la de un sistema de competición completo, no como la de un checkpoint aislado.

El sistema parte de `google/gemma-4-E4B-it`, un modelo abierto de 7.941.100.832 parámetros (7,94 B) en BF16 que incluye torres de visión y audio, aunque la inferencia de la tarea es solo texto. Sobre esa base se aplica un ajuste con LoRA sobre 20.870 trazas de razonamiento en inglés para preguntas de opción múltiple del currículo ceilandés, se fusiona el adaptador y se promedia el resultado 50/50 con los pesos originales (WiSE-FT).

La relevancia práctica está en dos cosas: es un ejemplo reproducible de destilación de razonamiento hacia una lengua de bajos recursos (sinhala) y su receta de inferencia (8 respuestas greedy con opciones reordenadas y voto por mayoría) está documentada hasta el nivel de determinismo por máquina. Con esa configuración obtuvo un promedio macro de 67,5666 en el conjunto de test del shared task, primero en la clasificación en el momento de subir el repositorio.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible en detalle; el autor indica que deriva de `google/gemma-4-E4B-it`, con torres de visión y audio presentes en el checkpoint. No se declara MoE, SSM ni híbrida |
| Parametros totales | 7.941.100.832 (7,94 B), contando todos los tensores del checkpoint, incluidas las torres de visión y audio que la inferencia de texto no usa |
| Parametros activos | No aplica: el autor no declara arquitectura de mezcla de expertos |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No se publican versiones cuantizadas. El checkpoint se distribuye y se ejecuta en BF16 sin cuantizar. No hay GGUF ni AWQ/GPTQ en la información disponible |
| Idiomas soportados | Sinhala (`si`) para la tarea evaluada; las trazas de razonamiento empleadas en el ajuste están en inglés. No se documentan otros idiomas, aunque el modelo base sea multilingüe |
| Licencia | Apache 2.0 (según la model card, bajo la licencia Gemma 4) |
| Formato de pesos | Checkpoint completo fusionado en BF16 con tokenizer, chat template y configuración. El formato de serialización (safetensors u otro) no se especifica en la información disponible |

## Arquitectura y entrenamiento

La arquitectura no se describe en la model card más allá de su origen: `google/gemma-4-E4B-it`, publicado en el Hub el 2 de marzo de 2026 con licencia Apache 2.0. El autor confirma que el checkpoint contiene torres de visión y audio, pero el sistema evaluado es puramente textual y no carga adaptador, ensemble, router, clasificador ni recuperador adicional. El pipeline es: LoRA sobre la base, fusión del adaptador y promedio ponderado 50/50 con los pesos originales mediante WiSE-FT, una técnica habitual para no degradar las capacidades previas del modelo base al especializarlo.

El ajuste se hizo sobre 20.870 trazas de razonamiento en inglés para preguntas de opción múltiple del currículo de sinhala, con un filtro estricto: solo se conservaron las trazas cuya respuesta final coincidía con la clave oficial. Las preguntas de entrenamiento provienen de tres fuentes: preguntas redactadas a partir de libros de texto y guías docentes oficiales en medio sinhala, el conjunto de desarrollo oficial y preguntas generadas por máquina y verificadas a ciegas. El dataset asociado contiene 18.635 filas generadas por máquina, el modelo de origen de cada fila escrita por un modelo cerrado y la lista de las 930 preguntas oficiales de desarrollo usadas (solo fichero y `q_no`, ya que ese dataset está restringido).

La innovación reseñable no está en el entrenamiento sino en la inferencia: cada pregunta se responde 8 veces con decodificación greedy, cada vez con las opciones en un orden distinto, y gana la respuesta mayoritaria. El script fija semilla y `VLLM_ENABLE_V1_MULTIPROCESSING=0` para hacer determinista la planificación de vLLM; el test de determinismo compara 944 respuestas (118 preguntas × 8) en dos procesos independientes.

## Capacidades

- Responder preguntas de opción múltiple del currículo de sinhala en tres niveles de dificultad (Easy, Medium, Hard), con razonamiento intermedio en inglés.
- Generar cadenas de razonamiento antes de emitir la respuesta final, en lugar de contestar de forma directa.
- Voto por mayoría sobre 8 muestras greedy con orden de opciones permutado, lo que reduce la sensibilidad al orden de los distractores.
- Inferencia determinista en una misma máquina (mismas respuestas, mismo recuento de tokens y mismo motivo de finalización en replays).
- Ejecución batch sobre conjuntos grandes: 2.238 preguntas × 8 respuestas en 49 minutos en una A100 de 40 GB.
- No soporta, según la información disponible: tool calling, function calling, uso como agente multi-paso, recuperación aumentada ni modo thinking configurable. Tampoco se documentan capacidades de visión o audio en uso, pese a que el checkpoint contenga esas torres.

## Casos de uso

- Evaluación de modelos en lenguas de bajos recursos: el repositorio sirve como plantilla reproducible para montar un sistema de respuesta a exámenes tipo MMLU en sinhala, con script de inferencia, formato de salida Codabench y salidas detalladas por pregunta.
- Investigación en destilación de razonamiento: la receta LoRA + WiSE-FT sobre 20.870 trazas filtradas por coincidencia con la clave es replicable y sirve de línea base para medir cuánto rinde destilar razonamiento en inglés hacia una tarea en otro idioma.
- Ablación de estrategias de decodificación: el repositorio conserva en `submission08/` la variante con muestreo (16 respuestas a temperatura 1,0), lo que permite comparar directamente muestreo frente a greedy (64,6025 frente a 67,5666 de macro promedio) con el mismo modelo.
- Herramienta de apoyo docente en sinhala: el sistema puede responder baterías de preguntas de libros de texto oficiales y devolver la respuesta mayoritaria junto con las 8 trazas, útil para generar explicaciones revisables por un docente antes de publicarlas.
- Auditoría de contaminación y sesgo de selección: al conservar `predictions_details.jsonl` con las 8 votaciones, el orden de opciones, la respuesta parseada y el recuento de tokens, se puede analizar en qué preguntas el modelo es inestable.
- Verificación de reproducibilidad en infraestructura propia: el test de determinismo y el informe de reproducibilidad entre máquinas (91,6% de coincidencia global) permiten validar un despliegue antes de confiar en él para comparaciones.

## Benchmarks y rendimiento

Resultados en el conjunto de test del shared task, según la model card (2.238 preguntas):

| Conjunto | Submisión 08 (muestreo, T=1,0, 16 respuestas) | Submisión 09 (greedy, 8 respuestas, final) |
|---|---|---|
| Easy | 66,5109 | 70,7165 |
| Medium | 57,6058 | 59,4059 |
| Hard | 69,6907 | 72,5773 |
| Promedio macro | 64,6025 | 67,5666 |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni de otros benchmarks estándar en la información disponible.

## Requisitos de hardware

- VRAM: el autor indica que el script necesita una GPU con al menos 40 GB; el checkpoint pesa unos 16 GB de descarga.
- GPU probada: una NVIDIA A100-SXM4-40GB en Google Cloud Vertex AI, con imagen de runtime de Colab (Python 3.13) en entorno limpio. El autor sugiere A100 o H100 y afirma no haber probado GPUs menores.
- Ajuste en GPU de consumo: no confirmado. El requisito declarado de 40 GB deja fuera tarjetas de 24 GB como la RTX 4090 en la configuración publicada, y no se ofrecen versiones cuantizadas que reduzcan la huella.
- Despliegue: vLLM 0.32.0 con PyTorch 2.13.0. El script desinstala `torchaudio` y `torchcodec` antes de cargar vLLM, porque la build de torchaudio que arrastra vLLM desde PyPI apunta a otra versión de CUDA y rompe el import de Transformers.
- Tiempos medidos en una A100 40 GB desde entorno limpio: 2 min 41 s de `pip install`; 7 min de descarga de pesos y arranque de vLLM (compilación, grafos CUDA); 49 min para 2.238 preguntas × 8 respuestas; 59 min en total.
- Throughput derivado de esas cifras: 17.904 generaciones en 2.940 s, es decir, aproximadamente 6,1 respuestas por segundo en una A100 40 GB.
- Determinismo: repeticiones idénticas en la misma máquina; en una segunda A100 con la misma imagen y versiones se reprodujeron el 91,6% de las respuestas finales (2.050 de 2.238; Easy 93,9%).

## Comparativa con modelos similares

| Sistema | Parámetros | Contexto | Macro Sinhala MMLU | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| team-rexx (Gemma 4 E4B-it + LoRA + WiSE-FT, greedy ×8) | 7,94 B | No disponible | 67,5666 | Apache 2.0 | Pesos públicos en repo hermano |
| team-rexx, variante con muestreo ×16 | 7,94 B | No disponible | 64,6025 | Apache 2.0 | Ficheros en `submission08/` |
| `google/gemma-4-E4B-it` (base sin ajustar) | 7,94 B según el recuento del autor | No disponible | No disponible | Apache 2.0 | Pesos abiertos |
| Otros sistemas del Sinhala MMLU Shared Task | No disponible | No disponible | No disponible | No disponible | No disponible en la información |

La model card no incluye comparación con sistemas de terceros del shared task ni con otros modelos del mismo tamaño, por lo que no es posible establecer una comparativa externa fiable con los datos disponibles.

## Limitaciones y advertencias

- El repositorio `team-rexx` no contiene pesos (tamaño de 0,0 GB): aloja código, script de inferencia, predicciones y código de entrenamiento. Los pesos están en `team-rexx-gemma-4-e4b` y en la release pública `sinhala-mmlu/gemma-4-e4b-sinhala-mmlu`.
- Es un sistema de competición especializado en opción múltiple de currículo sinhala, no un asistente general. No hay evidencia de tool calling, agentes ni conversación multi-turno.
- Riesgo de alucinación en las trazas de razonamiento: el filtro de entrenamiento solo conserva trazas cuya respuesta coincide con la clave, lo que puede favorecer cadenas que aciertan por atajo y no penaliza razonamientos internamente inconsistentes que llegan a la respuesta correcta.
- Posible contaminación: parte del entrenamiento usa el conjunto de desarrollo oficial (930 preguntas) y preguntas generadas por máquina; los resultados en test no deben extrapolarse sin una partición limpia adicional.
- Sesgo de selección por el filtrado contra la clave oficial: las trazas descartadas (las que fallaban) no se usan como ejemplos negativos, de modo que el modelo no aprende explícitamente a evitar razonamientos incorrectos.
- Cobertura lingüística limitada al sinhala en la evaluación. El razonamiento se genera en inglés, lo que puede producir explicaciones intermedias poco naturales para un hablante nativo y dificulta su uso directo en el aula sin revisión.
- Reproducibilidad imperfecta entre máquinas: el 91,6% de coincidencia implica que alrededor de 188 de 2.238 respuestas cambian en otro host. No es apto para comparaciones de una décima de punto sin fijar hardware.
- Requisito de 40 GB de VRAM sin versiones cuantizadas publicadas, lo que encarece la reproducción y bloquea el despliegue en GPUs de consumo.
- Coste de inferencia multiplicado por 8: cada pregunta consume 8 generaciones completas, lo que hace que el sistema sea poco adecuado para servir tráfico interactivo.
- Licencia Apache 2.0 según la model card, pero heredada del modelo base Gemma 4; conviene revisar los términos de la licencia Gemma 4 antes de un uso comercial.

## Enlaces

- Repositorio del sistema (código, inferencia, predicciones): https://huggingface.co/SinhalaMMLU-SharedTask/team-rexx
- Pesos ajustados del equipo: https://huggingface.co/SinhalaMMLU-SharedTask/team-rexx-gemma-4-e4b (commit `f6936800`)
- Release pública del modelo: https://huggingface.co/sinhala-mmlu/gemma-4-e4b-sinhala-mmlu (tag `v2.0.0`)
- Dataset de entrenamiento: https://huggingface.co/datasets/SinhalaMMLU-SharedTask/team-rexx-training-data
- Conjunto de test del shared task: https://huggingface.co/datasets/SinhalaMMLU-SharedTask/Sinhala-MMLU-SharedTask-Test-Dataset (revisión `56fb2da5`)
- Modelo base: https://huggingface.co/google/gemma-4-E4B-it
