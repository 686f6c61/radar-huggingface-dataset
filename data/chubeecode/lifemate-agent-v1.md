# ChubeeCode/lifemate-agent-v1

## Resumen
LifeMate Agent v1 es un paquete de inferencia orientado a agentes de voz publicado por ChubeeCode en Hugging Face. No se trata de un modelo base entrenado desde cero, sino de un sistema compuesto que combina un módulo ASR (VietASR Zipformer RNN-T, 68.625.511 parámetros) con un LLM Qwen3-4B-Instruct-2507 (aproximadamente 4,02B parámetros) afinado mediante un adaptador LoRA (r16, alpha32) sobre la revisión `cdbee75f17c01a7cc42f958dc650907174af0554`. El conjunto se empaqueta para resolver tareas de agente conversacional con audio, herramientas y estado de entorno.

El repositorio (8,7 GB) contiene pesos en safetensors, código de entrenamiento, datos SFT congelados, estadísticas de ejecución y scripts de verificación y despliegue. El modelo está pensado para un escenario de competición con un ToolEnv y una SDK concreta (`zaic_tools`), con un pipeline que procesa audio, ejecuta ASR, invoca herramientas y produce un `submission.jsonl` por muestra.

La relevancia actual radica en su enfoque de agente multimodal de voz con ventana de contexto de 16.384 tokens en inferencia (12.288 en entrenamiento), soporte de hasta 14 rondas de agente, decodificación ASR con beam 4 y atención `TRITON_ATTN` sobre vLLM. No obstante, la información pública es limitada: no se declaran licencia, idiomas ni pipeline en la ficha de Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Sistema compuesto: ASR VietASR Zipformer RNN-T + LLM Qwen3-4B-Instruct-2507 con adaptador LoRA |
| Parametros totales | ASR: 68.625.511; LLM: aproximadamente 4,02B; LoRA r16/alpha32 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | Entrenamiento: 12.288 tokens; inferencia: 16.384 tokens |
| Tipos de cuantizacion | no disponible (inferencia declarada en FP16) |
| Idiomas soportados | no disponible en la ficha; el material de entrenamiento y evaluación es en vietnamita |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador LoRA y pesos empaquetados en `models/`) |

## Arquitectura y entrenamiento
El sistema es un pipeline híbrido de dos etapas. La primera es un reconocedor de voz VietASR Zipformer RNN-T con 68.625.511 parámetros, ajustado fino durante 90 épocas (ft90, medias de épocas 16/14/9) y decodificado con beam 4. La segunda es un LLM Qwen3-4B-Instruct-2507 de aproximadamente 4,02B parámetros, ejecutado en FP16 con un adaptador LoRA de rango 16 y alpha 32. La inferencia usa atención `TRITON_ATTN`, tensor parallel 1 y utilización de GPU de vLLM del 0,80.

El entrenamiento del adaptador sigue una receta curricular con 1.390 muestras LifeMate de entrenamiento y 155 de desarrollo separadas, complementadas con datos externos en vietnamita según cuota: 350 Nemotron, 350 LoopTool y 70 When2Call. En total, 5.231 exposiciones y 654 pasos de optimizador en dos fases (fase A mixta; fase B LifeMate con replay de ASK/NO_CALL), usando el mismo optimizador y scheduler. La supervisión se limita a assistant gold más EOS; no se añadieron predicciones públicas ni el conjunto de desarrollo al SFT. El checksum del adaptador es `422e6cc60f020104a0bec9caa9b92708e322dc5c8a9a108a401abd33ec90daed`. El agente se ejecuta con semilla 42, temperatura 0, zero-shot (fewshot 0), un worker y un máximo de 14 rondas, con un presupuesto de 30 segundos por muestra.

## Capacidades
- Reconocimiento automático de voz en vietnamita mediante VietASR Zipformer RNN-T con decodificación beam 4.
- Generación de texto y razonamiento a través de Qwen3-4B-Instruct-2507 con adaptador LoRA específico para el dominio del agente.
- Ejecución de agentes multi-turno con hasta 14 rondas y gestión de estado de entorno mediante ToolEnv.
- Soporte de tool calling y function calling a través de la SDK `zaic_tools` y el entorno de herramientas del pipeline.
- Procesamiento de audio actual e historial de audio decodificado realmente en cada muestra.
- Generación de trazas con hash de estado del entorno, con 115/155 hashes correctos en el conjunto de desarrollo declarado.
- Flujo de salida por muestra en `submission.jsonl`, con flush incremental y sin sobrescritura de ficheros previos.
- Ejecución offline de inferencia una vez construida la imagen, con pesos y estadísticas incluidas en `models/`.

## Casos de uso
- Agentes de voz para atención al cliente: el pipeline integra ASR y LLM en una sola ejecución, con contexto de 16.384 tokens en inferencia, lo que permite gestionar conversaciones multi-turno con historial de audio y texto sin salir del sistema.
- Automatización de tareas con herramientas: el soporte de ToolEnv y `zaic_tools` permite que el agente invoque funciones externas, mantenga estado y registre hashes de las llamadas ejecutadas, útil en flujos de automatización con auditoría.
- Evaluación de sistemas de voz en entornos controlados: el paquete incluye `scripts/verify_bundle.py`, pruebas de regresión (53 tests, 1 skipped) y un modo smoke con `--limit 2`, lo que facilita la validación antes de desplegar.
- Procesamiento por lotes de audio con latencias acotadas: en el conjunto público de 634 muestras se reportan p50 de 2,20 s, p95 de 4,68 s y máximo de 12,15 s sobre A100, adecuado para pipelines con requisitos de latencia moderados.
- Despliegue reproducible en contenedor: el Dockerfile permite construir una imagen con CUDA 13.2 y ejecutar inferencia offline con `--network none`, lo que simplifica la entrega en entornos aislados.
- Integración en notebooks de experimentación: el paquete incluye `predict_notebook.ipynb` y un servidor Jupyter en el puerto 9777, útil para inspeccionar el pipeline VoicePipeline y generar `jupyter_submission.jsonl`.
- Reproducción de entrenamiento: `training_code/` y `training_data/agent_sft_v4_r1/` contienen el snapshot del adaptador seleccionado, la receta curricular y los checksums, lo que permite auditar o repetir el ajuste fino con las mismas condiciones.

## Benchmarks y rendimiento

| Metrica | Resultado | Notas |
|---|---|---|
| Dev Agent | 62,0323/100 | Conjunto de selección reutilizado, no resultado independiente |
| State hash correcto | 115/155 | 0 errores y 0 timeouts |
| WER ASR dev524 | 4,9524% | Conjunto de selección |
| Audio público | 634/634 muestras | 0 errores y 0 timeouts |
| Latencia p50 | 2,20 s | Sobre A100 |
| Latencia p95 | 4,68 s | Sobre A100 |
| Latencia máxima | 12,15 s | Sobre A100 |
| Tiempo total de inferencia | 1.555,49 s | Sobre A100 |
| Carga de modelo | 200,31 s | Sobre A100 |
| Rama full-pool | 61,3118 puntos | Inferior a la rama curricular |
| Refine | −1,7619 puntos | Retención aprobada pero sin promoción |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware
- VRAM estimada: no disponible de forma explícita; el sistema se validó en A100 con FP16 y utilización de GPU del 0,80 en vLLM.
- GPU recomendadas: A100 para la configuración de referencia; el autor indica que una RTX 4060 Laptop de 8 GB no es suficiente para esta configuración de inferencia.
- GPU de consumo: no se confirma compatibilidad con GPUs de consumo; no se ha validado RTX 5090 según el propio autor.
- Opciones de despliegue: vLLM con `TRITON_ATTN`, Docker con CUDA 13.2, scripts `predict.sh` y `predict.py`, y notebook Jupyter con `start_jupyter.sh`.
- Latencia y throughput: p50 2,20 s, p95 4,68 s y máximo 12,15 s por muestra en A100; carga de modelo de 200,31 s; presupuesto de 30 s por muestra con deadline monitorizado, no forzado.
- Almacenamiento: el repositorio ocupa 8,7 GB; el autor advierte que la máquina de preparación tiene poco espacio libre y recomienda construir y exportar la imagen Docker en una máquina con capacidad suficiente.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LifeMate Agent v1 | ASR 68,6M + LLM ~4,02B | 16.384 en inferencia | Pipeline ASR + LLM + LoRA para agente de voz | no disponible | Hugging Face (ChubeeCode/lifemate-agent-v1) |
| Qwen3-4B-Instruct-2507 | ~4,02B | no disponible en la información | LLM base | no disponible en la información | Hugging Face (Qwen/Qwen3-4B-Instruct-2507) |
| VietASR Zipformer RNN-T | 68.625.511 | no disponible | ASR | no disponible en la información | Incluido en el paquete |

No se dispone de datos de benchmarks comparativos con alternativas de la misma categoría en la información proporcionada.

## Limitaciones y advertencias
- La licencia no está declarada en la ficha de Hugging Face; no se puede confirmar el uso comercial.
- Los idiomas soportados no están declarados; el entrenamiento y la evaluación se centran en vietnamita, por lo que el rendimiento en otros idiomas no está validado.
- Los resultados de desarrollo (62,0323/100 y WER 4,9524%) proceden de un conjunto de selección reutilizado, no de una evaluación independiente ni de una medición end-to-end de 30 s.
- La diferencia entre la receta curricular y la mixta es de solo 0,0968 puntos y no se ha demostrado significancia estadística.
- El paquete depende de la SDK `zaic_tools` y de un ToolEnv proporcionado por el organizador; no es un modelo de propósito general autónomo.
- El pipeline asume un entorno Linux con GPU y dependencias fijadas por `constraints-inference.txt` y `requirements-resolved.txt` (261 paquetes).
- El kernel de GPU del ASR no es preemptible; el deadline de 30 s se monitoriza pero no se puede forzar la parada del kernel en el instante exacto.
- No se ha validado la imagen Docker ni la RTX 5090 en la máquina de preparación; el autor recomienda verificar CLI y notebook en la máquina destino antes de exportar la imagen.
- El repositorio contiene datos de entrenamiento privados; el autor advierte de no publicar ni hacer commit de pesos o datos.
- Riesgo de alucinación y sesgos: no se documentan evaluaciones específicas en la información disponible.

## Enlaces
- Hugging Face: https://huggingface.co/ChubeeCode/lifemate-agent-v1
- Modelo base LLM: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Repositorio de código y datos: incluido en el propio repositorio de Hugging Face (`training_code/`, `training_data/`, `evidence/`, `models/`, `scripts/`)
- No se han encontrado papers, blogs, demos o repositorios adicionales en la información proporcionada.
