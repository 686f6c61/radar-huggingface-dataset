# Palind/Qwen3-4B-SC-CodeAgent-200Steps

## Resumen

Qwen3-4B-SC-CodeAgent-200Steps es un checkpoint experimental publicado por el usuario Palind, consistente en un ajuste fino por aprendizaje por refuerzo de **Qwen/Qwen3-4B**. No se trata del Qwen3-4B versión 2507 ni de un agente de código de propósito general validado: es un artefacto de investigación pensado para registrar un experimento concreto de RL y permitir análisis posteriores. El modelo conserva los 4.022.468.096 parámetros del modelo base (~4,02 B) y el repositorio ocupa 8,1 GB en formato BF16.

El problema que aborda es metodológico: probar el algoritmo **Score Centering (SC)** sobre un pipeline de RL con herramienta opcional `run_python`, usando rollout asíncrono natural sobre un subconjunto filtrado del dataset BAAI/TACO. El entrenamiento constó de 200 pasos de trainer sobre 8 GPU NVIDIA A100 80 GB (4 para entrenamiento, 4 para rollout), con un presupuesto de contexto de 12.288 tokens (4.096 de prompt más 8.192 de respuesta).

Su relevancia es doble. Por un lado, es un ejemplo reproducible de RL agéntico con verl, FSDP2 y vLLM en un modelo denso de 4 B. Por otro, el propio autor advierte que **no demuestra** que SC sea superior a otros algoritmos ni que el modelo haya adquirido capacidad agéntica: el uso real de herramientas es casi residual (40 de 12.800 trayectorias, un 0,3125 %) y la truncación por longitud es elevada. En el conjunto de desarrollo fijo de 256 preguntas alcanzó un 50,78 % de precisión por pregunta en el paso 200.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso, derivado de Qwen/Qwen3-4B (con modo thinking) |
| Parametros totales | 4.022.468.096 (4,02 B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible como especificacion del modelo; presupuesto de entrenamiento de 12.288 tokens (prompt 4.096 + respuesta 8.192) |
| Tipos de cuantizacion | no disponible; el repositorio publica unicamente pesos en BF16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16) |

## Arquitectura y entrenamiento

El modelo parte de **Qwen/Qwen3-4B**, un transformer decoder-only denso de 4,02 B de parametros con modo thinking activado. El ajuste no modifica la arquitectura: se exporta el checkpoint final a BF16 con el tokenizer, el chat template y la configuracion de generacion del modelo base. Los detalles finos de capas, cabezas de atencion o tipo exacto de RoPE no se detallan en la informacion proporcionada.

El entrenamiento usa **verl** (revision upstream `8718ca30a3f002f93b7c4fd99b9b2506718681bc` con modificaciones del experimento) sobre FSDP2 para entrenamiento y vLLM para rollout (TP=1). La perdida es una politica tipo REINFORCE con correccion **Score Centering**: se centraliza el score de la politica para suprimir la deriva cuando la distribucion de muestreo difiere de la de entrenamiento, usando los top-128 del log-probabilidad de cada token generado (es una anchura de registro de probabilidad, no un top-k de generacion). La estimacion de ventaja usa 4 respuestas por pregunta restando la media del grupo, sin normalizar por desviacion tipica y sin TIS, RS, PPO clipping, critic, penalizacion KL ni bono de entropia. Optimizador AdamW con learning rate constante de 1e-6, sin warmup, weight decay 0 y clipping de norma global 1.0. Batch de 16 preguntas x 4 respuestas (64 trayectorias por paso), `ppo_epochs=1`, 200 pasos de trainer.

Los datos proceden de **BAAI/TACO** (revision fija `d593ed0a2becbbc952230bb89be09189bf1056dc`), usando los shards de entrenamiento 02, 03 y 04 de la configuracion `ALL`. Tras filtrar tareas de entrada/salida estandar ejecutables con la libreria estandar de Python, excluir dependencias de imagen y tareas con special-judge, y deduplicar, se obtuvo un conjunto fijo de **2.000 preguntas de entrenamiento y 256 de desarrollo**, sin solapamiento por clave de identidad. La recompensa es la proporcion de tests superados por el codigo final, en el rango `[0, 1]`, sin bono por usar herramientas. El ejecutor de la herramienta `run_python` corre cada programa en un proceso Python 3.12 aislado con Landlock y seccomp, sin red, GPU, subprocesos ni escritura de ficheros, con limites de 3 segundos, 1 GiB de espacio de direcciones y 1 MiB por flujo de salida.

## Capacidades

- Generacion de codigo Python para tareas con entrada/salida estandar, orientada a problemas de programacion competitiva y estilo TACO.
- Modo thinking activado heredado de Qwen3-4B: el modelo produce razonamiento antes de la respuesta final.
- Definicion de herramienta `run_python` disponible durante el entrenamiento, con esquema de herramienta inyectado en el prompt.
- Capacidad multilingue: no disponible (no se documentan idiomas soportados).
- Razonamiento multi-paso encadenado: el pipeline contempla hasta 6 turnos de asistente con 1 llamada paralela a herramienta por turno, pero el comportamiento observado es casi exclusivamente de generacion directa de codigo.
- Uso fiable de herramientas: no demostrado. Solo 40 de 12.800 trayectorias de entrenamiento ejecutaron la herramienta y en los ultimos 50 pasos la tasa fue 0; en el desarrollo final ninguna de las 256 trayectorias invoco herramientas.
- Function calling en produccion: no verificado; no hay evidencia de llamadas a herramientas estables fuera del bucle de entrenamiento.
- Capacidades de vision o audio: no disponibles.

## Casos de uso

- Investigacion en RL agéntico: servir como checkpoint de referencia para estudiar Score Centering, el desfase entre politica de muestreo y de entrenamiento y el efecto de la truncacion por longitud, reproduciendo la configuracion documentada en `experiment/training_config.json`.
- Generacion de soluciones Python en tareas de estilo stdin/stdout: el modelo esta ajustado para producir codigo completo en un bloque Python a partir de un enunciado, lo que encaja en pipelines de evaluacion automatizada tipo juez.
- Baseline en experimentos controlados de algoritmos de RL: al ser un checkpoint concreto de 200 pasos, permite comparar contra variantes sin SC u otras tecnicas, siempre que se igualen tarea, prompt y presupuesto de longitud.
- Base para un SFT posterior: los pesos BF16 exportados y el chat template de Qwen3 permiten continuar con ajuste supervisado o destilacion sobre dominios de codigo mas especificos.
- Evaluacion de decodificacion en modo thinking: util para medir como afectan temperatura, top-p y el presupuesto de 8.192 tokens de respuesta a la tasa de respuestas truncadas y a la proporcion de codigo extraible.
- Pruebas de infraestructura de inferencia: con 4,02 B de parametros en BF16 cabe en GPU consumer de 16-24 GB, lo que lo hace comodo para validar despliegues con vLLM, TGI o transformers antes de escalar a modelos mayores.
- Analisis de fallos por truncacion: permite estudiar por que un 40,81 % (media en los ultimos 50 pasos) de las trayectorias alcanza el limite de 8.192 tokens y como se relaciona con la ausencia de respuesta final valida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, LiveCodeBench). El autor indica explicitamente que el checkpoint **no ha sido evaluado en LiveCodeBench** (aunque se prepararon los tests publicos/privados de `release_v6`), por lo que no hay puntuacion LCB que reportar. Lo unico disponible es la validacion sobre el conjunto de desarrollo fijo de 256 preguntas de TACO, con una muestra por pregunta (temperature=0.6, top-p=1.0).

| Paso de entrenamiento | Preguntas con todos los tests superados / 256 | Precision por pregunta | Media de tasa de tests por pregunta | Proporcion con codigo extraible | Preguntas con uso real de herramienta |
|---:|---:|---:|---:|---:|---:|
| 25 | 94 | 36,72 % | 37,08 % | 38,28 % | 3 |
| 50 | 93 | 36,33 % | 38,10 % | 39,84 % | 2 |
| 75 | 104 | 40,63 % | 43,27 % | 45,70 % | 0 |
| 100 | 114 | 44,53 % | 47,56 % | 50,78 % | 0 |
| 125 | 118 | 46,09 % | 51,60 % | 55,08 % | 0 |
| 150 | 117 | 45,70 % | 51,54 % | 56,64 % | 0 |
| 175 | 123 | 48,05 % | 53,50 % | 56,64 % | 0 |
| 200 | 130 | 50,78 % | 56,11 % | 61,33 % | 0 |

Metricas complementarias reportadas por el autor: en el paso 200, 157 de 256 preguntas produjeron codigo extraible y 99 no tuvieron envio evaluable; de las 157 con envio, 130 superaron todos los tests. Cuatro preguntas registraron error de ejecucion o timeout, afectando a 123 casos de test. En cuanto a truncacion, las trayectorias de los ultimos 50 pasos alcanzaron el limite de respuesta en un 40,81 % de media, y en el ultimo lote de 64 trayectorias, 34 llegaron a los 8.192 tokens y 32 no tuvieron envio evaluable. El uso de herramienta global fue de 40 de 12.800 trayectorias (0,3125 %).

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 8,04 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica en torno a 10-12 GB para contexto moderado.
- El entrenamiento del checkpoint requirio 8 x NVIDIA A100 80 GB (4 para entrenamiento con FSDP2 y 4 para rollout con vLLM, TP=1), con precision BF16 y parametros maestros en FP32.
- Cabe en GPU consumer: si, en BF16 en tarjetas de 16-24 GB como RTX 4080, RTX 4090 o RTX 3090. En GPUs de 8-12 GB requeriria cuantizacion.
- Opciones de despliegue observadas o soportadas por las etiquetas del repositorio: transformers (libreria declarada), vLLM (usado en el rollout del entrenamiento) y text-generation-inference / endpoints compatibles (tags `text-generation-inference` y `endpoints_compatible`).
- llama.cpp u Ollama: no hay pesos GGUF publicados; seria necesario convertir el checkpoint BF16 a GGUF por cuenta propia.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Tipo | Rendimiento publicado |
|---|---|---|---|---|---|
| Palind/Qwen3-4B-SC-CodeAgent-200Steps | 4,02 B | no disponible (entrenado con 12.288 tokens) | Apache 2.0 | Ajuste por RL experimental sobre Qwen3-4B | 50,78 % de precision por pregunta en dev TACO de 256 preguntas |
| Qwen/Qwen3-4B | 4,02 B | no disponible en la informacion proporcionada | Apache 2.0 | Modelo base denso con modo thinking | no disponible |
| Qwen2.5-Coder-7B-Instruct | no disponible en la informacion proporcionada | no disponible | no disponible | Modelo de codigo generico | no disponible |

La comparacion sustantiva con alternativas de codigo no puede cerrarse con los datos disponibles: no se aportan resultados de HumanEval, LiveCodeBench ni MMLU para este checkpoint ni para los candidatos, y el modelo base Qwen3-4B no incluye cifras en la ficha. El unico contraste cuantitativo verificable es con el punto de partida implicito, ya que la tabla de desarrollo muestra una progresion de 36,72 % a 50,78 % de precision por pregunta entre los pasos 25 y 200.

## Limitaciones y advertencias

- Es un checkpoint experimental; el autor indica explicitamente que no debe tomarse como un agente de codigo general validado ni como evidencia de que SC mejore otros algoritmos.
- Uso de herramientas practicamente nulo: 40 de 12.800 trayectorias de entrenamiento (0,3125 %) ejecutaron `run_python`, y en el desarrollo final ninguna de las 256 trayectorias invoco herramientas. El comportamiento observado es de generacion directa de codigo.
- Truncacion elevada: en los ultimos 50 pasos, el 40,81 % de las trayectorias de entrenamiento alcanzo el limite de 8.192 tokens de respuesta, con razonamientos sin cerrar y codigo incompleto.
- Tasa relevante de respuestas sin codigo extraible: en el paso 200, 99 de 256 preguntas no tuvieron envio evaluable.
- Riesgo de alucinacion: no cuantificado. No hay evaluacion de fidelidad ni de sesgos.
- El conjunto de desarrollo (256 preguntas de TACO) se reutilizo durante el entrenamiento, por lo que las cifras no equivalen a un test limpio ni al test oficial de TACO. Tampoco es una muestra aleatoria del dataset completo.
- Posible contaminacion de preentrenamiento: el autor advierte que la deduplicacion no garantiza que el modelo base no haya visto estas tareas.
- Idiomas soportados: no disponibles; el pipeline y los datos estan centrados en enunciados Python, mayoritariamente en ingles.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero se heredan los terminos del modelo base Qwen3-4B; conviene revisar la licencia del modelo base antes de un despliegue comercial.
- Juicio y ejecucion: el juez es un checker personalizado del experimento y no se garantiza equivalencia con el checker oficial de LiveCodeBench. El aislamiento de `run_python` es de acceso (Landlock + seccomp), no una maquina virtual completa, y parte de los metadatos de rutas puede seguir siendo visible.
- Ausencia de reproducibilidad multi-semilla: se realizo una unica ejecucion con semilla 42, sin repeticiones.
- No incluye estado de optimizador, entorno de entrenamiento completo ni harness de herramientas; solo pesos de inferencia BF16, tokenizer, chat template, configuracion de generacion y metricas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Palind/Qwen3-4B-SC-CodeAgent-200Steps
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B
- Licencia: https://huggingface.co/Palind/Qwen3-4B-SC-CodeAgent-200Steps/blob/main/LICENSE
- Dataset BAAI/TACO: https://huggingface.co/datasets/BAAI/TACO
- Metricas por paso: https://huggingface.co/Palind/Qwen3-4B-SC-CodeAgent-200Steps/blob/main/metrics/metrics.jsonl
- Resumen de resultados: https://huggingface.co/Palind/Qwen3-4B-SC-CodeAgent-200Steps/blob/main/metrics/summary.json
- Configuracion de entrenamiento: https://huggingface.co/Palind/Qwen3-4B-SC-CodeAgent-200Steps/blob/main/experiment/training_config.json
- Manifiesto de conversion: https://huggingface.co/Palind/Qwen3-4B-SC-CodeAgent-200Steps/blob/main/conversion_manifest.json
- Grafico de resumen del entrenamiento: https://huggingface.co/Palind/Qwen3-4B-SC-CodeAgent-200Steps/blob/main/figures/training-summary.png
- Diagnostico de Score Centering: https://huggingface.co/Palind/Qwen3-4B-SC-CodeAgent-200Steps/blob/main/figures/sc-diagnostics.png
- LiveCodeBench: mencionado como `release_v6`; sin enlace proporcionado en la informacion disponible
- Papers, blogs o repos adicionales: no disponibles en la informacion proporcionada
