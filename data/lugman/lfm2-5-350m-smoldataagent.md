# lugman/LFM2.5-350M-SmolDataAgent

## Resumen

LFM2.5-350M-SmolDataAgent es un ajuste fino (fine-tune) del modelo base LiquidAI/LFM2.5-350M, desarrollado por el usuario lugman, orientado especificamente a tareas de analisis de datos dentro de un entorno de ejecucion controlado. El modelo recibe una pregunta junto con un conjunto de ficheros de datos (CSV, Parquet, SQLite, HDF5) y opera a traves de una unica herramienta `bash`: explora los ficheros, ejecuta Python y escribe la respuesta final en `/workdir/answer.txt`.

Se trata de un modelo pequeno, con 354.483.968 parametros, lo que lo situa en la categoria de modelos ultraligeros aptos para despliegue en hardware modesto. Su relevancia radica en que demuestra que un modelo de 350M puede adquirir capacidades de agente con uso de herramientas (tool use) y razonamiento multi-paso cuando se entrena con trayectorias cuidadosamente curadas y enriquecidas, superando a su modelo base, que obtiene un 0 % de pass@1 en el benchmark de referencia.

El modelo se distribuye en formato safetensors (repo de 0,7 GB) y esta pensado para servirse con vLLM usando el parser de tool calls `lfm2`. Su licencia no esta especificada en la informacion disponible, lo que constituye una limitacion importante para uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base LFM2.5 de LiquidAI; familia LFM2) |
| Parametros totales | 354.483.968 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (entrenado con max sequence length 16.384) |
| Tipos de cuantizacion | no disponible (pesos publicados en 16 bits; compatible con cuantizacion estandar via transformers/vLLM) |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de LiquidAI/LFM2.5-350M, un transformer de la familia LFM2 de LiquidAI, y se ajusta mediante LoRA con r=16 y alpha=32 usando Unsloth y TRL, con posterior fusion (merge) en pesos de 16 bits. El entrenamiento emplea learning rate 4e-4, 3 epocas, tamano de batch efectivo 16 y longitud maxima de secuencia de 16.384 tokens, calculando la perdida sobre todos los turnos del asistente.

Los datos de entrenamiento provienen del dataset lugman/SmolDataAgent-Trajectories, compuesto por 2.833 trayectorias de agente sobre las tareas de entrenamiento de SmolDataEnvs. Estas trayectorias se generaron originalmente con dos modelos profesor (LFM2.5-2.6B y Claude Haiku 5.5), se editaron (limpieza y eliminacion de llamadas a herramientas posteriores a la escritura de la respuesta) y se enriquecieron sinteticamente. La distribucion por dificultad es de 1.138 faciles, 1.533 medias y 162 dificiles; por grupo de tarea, 1.112 de lookup (G1), 1.381 de multistep (G2) y 340 de analisis (G3). El autor justifica el uso de este conjunto propio frente a FineEnvs/SmolDataEnvs-sft porque este ultimo emplea distintos harnesses y herramientas, un grader mas debil, y en un experimento controlado el modelo entrenado con el solo alcanzo un 13 % de pass@1 frente al 19 % del conjunto curado especificamente para el tamano de 350M.

## Capacidades

- Generacion de texto y razonamiento multi-paso dentro de episodios de agente de hasta 12 turnos.
- Uso de una unica herramienta `bash`: cada llamada se ejecuta como un `bash -c` nuevo y sin estado.
- Exploracion de ficheros de datos en multiples formatos: CSV, Parquet, SQLite, HDF5, entre otros.
- Ejecucion de codigo Python dentro del sandbox para manipular y analizar datos.
- Escritura de la respuesta final en `/workdir/answer.txt` como mecanismo de salida estructurada.
- Capacidades de analisis de datos: consultas de lookup, tareas multistep y analisis (tres grupos de tarea definidos en el benchmark).
- Soporte de tool calling compatible con el parser `lfm2` de vLLM (`--enable-auto-tool-choice --tool-call-parser lfm2`).
- Capacidades multilingues: solo ingles.
- No se documentan capacidades de vision, audio ni modo de razonamiento explicito (thinking mode).

## Casos de uso

- Analisis exploratorio de datos automatizado: dado un directorio con ficheros CSV o Parquet y una pregunta en lenguaje natural, el modelo inspecciona esquemas, calcula estadisticas y escribe la respuesta en `/workdir/answer.txt`, todo dentro de un sandbox bash.
- Consultas sobre bases de datos SQLite: el modelo puede abrir la base de datos con Python, ejecutar consultas SQL y sintetizar el resultado, adecuado para tareas de lookup (donde obtiene 0,561 de pass@1 en el tier facil).
- Pipelines de validacion de datos en CI/CD: integrado como agente ligero que verifica la integridad de datasets generados y reporta discrepancias, con un coste computacional minimo gracias a sus 350M de parametros.
- Automatizacion de informes periodicos: el modelo puede recorrer un directorio de datos, calcular agregados y redactar un resumen en texto plano, apropiado para entornos con recursos limitados.
- Prototipado de agentes de datos en local: al caber en GPU de consumo, sirve para desarrollar y depurar harnesses de agente con tool calling antes de escalar a modelos mayores.
- Educacion y demostraciones: util para ilustrar el ciclo completo de un agente (observar, ejecutar herramienta, razonar, responder) en cursos o talleres, dado su bajo coste de inferencia.
- Evaluacion de tecnicas de curacion de datos: el modelo y su dataset asociado permiten reproducir experimentos sobre calidad de trayectorias sinteticas frente a SFT generico.

## Benchmarks y rendimiento

Resultados en el split de test de SmolDataEnvs (250 tareas, 4 intentos por tarea, temperatura 0,1, hasta 12 turnos por episodio):

| Modelo | pass@1 | pass@2 | pass@4 |
|---|---|---|---|
| LiquidAI/LFM2.5-350M (base) | 0,000 | 0,000 | 0,000 |
| LFM2.5-350M-SmolDataAgent | 0,209 | 0,259 | 0,300 |

Desglose por dificultad:

| Tier | Tareas | pass@1 | pass@2 | pass@4 |
|---|---|---|---|---|
| easy | 33 | 0,561 | 0,606 | 0,636 |
| medium | 118 | 0,163 | 0,205 | 0,254 |
| hard | 99 | 0,146 | 0,209 | 0,242 |

No se han publicado resultados de otros benchmarks (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en 16 bits, aproximadamente 0,7 GB de pesos mas overhead de activaciones y cache KV; en cuantizacion de 8 bits, alrededor de 0,35 GB; en 4 bits, alrededor de 0,18 GB. Cifras orientativas calculadas a partir del numero de parametros, no publicadas por el autor.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM para 16 bits con contexto moderado; RTX 3060, RTX 4060, RTX 4090, A100 y H100 son sobradamente suficientes.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU consumer moderna, e incluso en CPU mediante llama.cpp si se generan pesos GGUF (no publicados en el repo).
- Opciones de despliegue: vLLM con `--enable-auto-tool-choice --tool-call-parser lfm2` (recomendado por el autor), transformers con la libreria estandar, y potencialmente llama.cpp u Ollama si se convierten los pesos.
- Parametros de muestreo recomendados: temperature 0,1, top_k 50, repetition_penalty 1,05, max_tokens 1024 por turno.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | pass@1 (SmolDataEnvs) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LFM2.5-350M-SmolDataAgent | 354M | no disponible | 0,209 | no disponible | Hugging Face |
| LiquidAI/LFM2.5-350M (base) | 350M | no disponible | 0,000 | no disponible | Hugging Face |
| LFM2.5-2.6B (profesor) | 2,6B | no disponible | no disponible | no disponible | Hugging Face |

No se dispone de datos de benchmarks de otros modelos comparables en la misma tarea dentro de la informacion proporcionada.

## Limitaciones y advertencias

- Solo soporta ingles; no se ha entrenado ni evaluado en castellano ni en otros idiomas.
- Rendimiento limitado en tareas dificiles: pass@1 de 0,146 en el tier hard, lo que desaconseja su uso en produccion para analisis complejos sin supervision.
- Dependencia estricta del harness: el modelo asume una unica herramienta `bash` sin estado y la escritura de la respuesta en `/workdir/answer.txt`; fuera de ese contrato su comportamiento puede degradarse.
- Riesgo de alucinacion: como modelo de 350M, puede generar comandos o resultados plausibles pero incorrectos; es imprescindible ejecutar en sandbox y validar las salidas.
- Sesgos conocidos: no documentados por el autor; al derivar de un modelo base entrenado principalmente en ingles, hereda los sesgos de este.
- Licencia no especificada: no se puede confirmar si el uso comercial esta permitido; conviene contactar con el autor o consultar la licencia del modelo base antes de desplegarlo.
- Modelo con 0 descargas y 0 likes en el momento de la consulta: no ha sido validado por la comunidad.
- Entrenado sobre tareas de SmolDataEnvs, por lo que puede sobreajustarse a los formatos y patrones de ese benchmark.
- No se documentan pesos cuantizados (GGUF, AWQ, GPTQ) en el repositorio; habria que generarlos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/lugman/LFM2.5-350M-SmolDataAgent
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-350M
- Dataset de trayectorias: https://huggingface.co/datasets/lugman/SmolDataAgent-Trajectories
- Dataset de entorno: https://huggingface.co/datasets/FineEnvs/SmolDataEnvs
- Dataset SFT alternativo: https://huggingface.co/datasets/FineEnvs/SmolDataEnvs-sft
