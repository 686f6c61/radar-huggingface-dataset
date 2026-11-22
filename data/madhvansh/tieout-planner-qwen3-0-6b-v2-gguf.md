# Madhvansh/tieout-planner-qwen3-0.6b-v2-gguf

## Resumen

tieout-planner-qwen3-0.6b-v2-gguf es un modelo de 0,6 mil millones de parámetros afinado a partir de Qwen/Qwen3-0.6B (licencia Apache-2.0) por el desarrollador Madhvansh. Su tarea no es responder preguntas en lenguaje natural, sino traducir preguntas sobre los informes SEC de empresas cotizadas estadounidenses a planes de consulta tipados en el lenguaje de planes del grafo de conocimiento TieOut. El modelo nunca enuncia una cifra: todos los números de la respuesta final provienen del grafo, que recupera las fórmulas con las que se calcularon los datos de los informes y verifica cada valor contra ellas.

Se distribuye únicamente como GGUF cuantizado en Q4_K_M (396.704.608 bytes, es decir, unos 0,4 GB), junto con un Modelfile para Ollama, y está pensado para ejecutarse en CPU. Forma parte de un estudio de escalado y es el planificador más pequeño del mismo, descrito por el autor como "medido, no usado por defecto": el sistema TieOut emplea dos lectores independientes que planifican cada pregunta y un árbitro que resuelve las discrepancias.

Su relevancia es acotada pero clara: demuestra que una tarea de parsing semántico estructurado y de dominio cerrado (40 empresas, 47 conceptos compartidos, 17 métricas) puede resolverse con un modelo de 0,6B cuantizado a 4 bits, sin GPU y con un coste de entrenamiento de menos de 10 minutos en una T4 de Kaggle.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Qwen3-0.6B); el autor no detalla mas |
| Parametros totales | 596.049.920 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4096 tokens en el Modelfile (num_ctx); TieOut envia num_ctx 8192 en tiempo de ejecucion |
| Tipos de cuantizacion | Q4_K_M (unico archivo publicado) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (planner06b-q4_k_m.gguf) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3-0.6B y se afina mediante LoRA con rango 16, alpha 32 y dropout 0,05 aplicado a todas las proyecciones de atención y MLP. El entrenamiento es de una sola época, con learning rate 2e-4, schedule coseno y 5 % de warm-up, y la pérdida se calcula únicamente sobre los tokens del plan (no sobre la pregunta). El system prompt compartido se ejecuta una vez por paso como prefijo cacheado. El entrenamiento se hizo con transformers y peft sobre una T4 de Kaggle en fp16, con micro-batch 8 y acumulación 2: 563 pasos, 9,83 minutos y pérdida final de 0,0024. Posteriormente se fusionaron los pesos, se convirtieron a GGUF con llama.cpp y se cuantizaron a Q4_K_M.

Los datos de entrenamiento son 9.000 pares (pregunta, plan) generados por `finetune/make_data.py` a partir del propio vocabulario del grafo: 40 empresas y sus nombres comunes, 47 conceptos compartidos, 17 métricas, atributos de texto y las etiquetas de segmento, producto y región que imprimen los informes. Cada plan se muestrea primero (válido por construcción y verificado con `tieout.plan.validate`) y después se verbaliza con una plantilla y distintas formas de nombrar la empresa, la medida y el periodo. La validación usa 600 pares cuyas plantillas y formulaciones nunca aparecen en entrenamiento. El autor declara que no hay en los datos ninguna pregunta de benchmark, pregunta reservada ni valor de respuesta. No se menciona RLHF ni DPO.

## Capacidades

- Generación de planes de consulta tipados en JSON para el lenguaje de planes de TieOut (operaciones como `members`, `rank` y `get`, con referencias entre pasos mediante `$s1`, `$s2`, etc.).
- Parsing semántico de preguntas sobre informes SEC: identificación de empresa, métrica, segmento, producto, región y periodo fiscal.
- Ordenación y ranking sobre conjuntos de miembros del grafo (por ejemplo, crecimiento de ingresos por segmento en un ejercicio fiscal).
- Salida en JSON válido en el 99,8 % de los casos según la medición del autor.
- Soporte de conversación mediante la plantilla de chat incluida en el Modelfile.
- No dispone de tool calling genérico, agentes, visión, audio ni modo de razonamiento extendido según la información disponible.
- Capacidad multilingüe limitada al inglés.

## Casos de uso

- Consultas financieras sobre informes SEC en producción: el modelo traduce la pregunta del analista a un plan que el motor TieOut ejecuta contra el grafo, de modo que ninguna cifra la genera el modelo y todas se validan contra las fórmulas recuperadas de los informes.
- Despliegue en local sin GPU: al ocupar unos 0,4 GB en Q4_K_M y ejecutarse en CPU vía Ollama, encaja en portátiles y entornos de desarrollo sin acelerador, útil para prototipar pipelines de análisis financiero.
- Enrutado y desambiguación de preguntas: como planificador barato, puede clasificar y estructurar la intención de la consulta antes de delegar en componentes más caros del sistema, reduciendo el coste por consulta.
- Generación de tests y datos sintéticos: el pipeline de `make_data.py` y la validación con `tieout.plan.validate` permiten generar planes válidos por construcción para probar el motor de consultas del grafo.
- Investigación en parsing semántico de dominio cerrado: sirve como referencia de hasta dónde llega un modelo de 0,6B con LoRA y 9.000 ejemplos generados en una tarea de estructuración estricta.
- Estudio de escalado de planificadores: el autor lo incluye explícitamente como el planificador más pequeño de su estudio comparativo, útil para medir la relación entre tamaño y precisión de plan en esta tarea.
- Asistente interno de consulta documental: integrado en una herramienta de línea de comandos (`python -m tieout ask "..."`) para que equipos de finanzas consulten métricas de las 40 empresas cubiertas.

## Benchmarks y rendimiento

| Benchmark | Resultado | Notas |
|---|---|---|
| Coincidencia exacta de plan (sintético) | 73,8 % | 600 formulaciones sintéticas reservadas |
| JSON válido (sintético) | 99,8 % | Sobre las mismas 600 formulaciones |
| Preguntas de desarrollo (rondas 1 a 6 de TieOut) | no disponible | El autor indica que la tabla se está midiendo |
| Reproducibilidad entre entornos | 72 de 87 preguntas | Mismo GGUF y misma versión de Ollama (0.30.5), decodificación greedy, portátil frente a CPU de Kaggle |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: no requiere GPU; el archivo Q4_K_M ocupa 396.704.608 bytes (unos 0,4 GB) y el autor indica que la CPU es suficiente.
- GPU recomendadas: no aplica; el autor entrena en una T4 de Kaggle, pero la inferencia publicada es en CPU (TieOut envía `num_gpu 0`).
- Cabe en cualquier GPU consumer, aunque no es necesario usarla.
- Opciones de despliegue: Ollama (flujo documentado con `ollama create` y `TIEOUT_LLM=ollama:tieout-planner-06b`); al ser GGUF, también es compatible con llama.cpp.
- Parámetros de inferencia recomendados por el autor: `temperature 0`, `num_ctx 8192` (el Modelfile fija 4096), formato JSON y `num_gpu 0`.
- Latencia y throughput: no disponibles. El único dato temporal publicado es el entrenamiento (9,83 minutos en T4).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| tieout-planner-qwen3-0.6b-v2-gguf | 596.049.920 | 4096 en Modelfile; 8192 enviado por TieOut | GGUF Q4_K_M | Apache-2.0 | Especializado en planes de consulta para el grafo TieOut; 73,8 % de coincidencia exacta en sintético |
| Qwen/Qwen3-0.6B (base) | 0,6B | no disponible en la información | safetensors | Apache-2.0 | Modelo generalista del que deriva; no conoce el lenguaje de planes de TieOut |
| Planificadores mayores del estudio de escalado de TieOut | no disponible | no disponible | no disponible | no disponible | El autor los menciona como parte del estudio, pero no publica sus especificaciones en esta ficha |

No se dispone de datos de benchmarks comparables con otros modelos de parsing semántico en la información proporcionada.

## Limitaciones y advertencias

- Solo conoce las 40 empresas y el vocabulario de este grafo concreto; para otro corpus hay que regenerar los datos a partir de ese grafo.
- Entrenado con formulaciones generadas, por lo que las preguntas largas o inusuales de analistas le resultan más difíciles que a los modelos grandes alojados; por eso TieOut usa dos lectores independientes y un árbitro.
- Los planes pueden diferir entre CPUs o versiones de Ollama: con decodificación greedy, el mismo GGUF reprodujo el plan del portátil en 72 de 87 preguntas al replicarse en una CPU de Kaggle con la misma versión de Ollama (0,30.5).
- Riesgo de alucinación acotado por diseño en las cifras (el modelo no genera números), pero presente en la estructura del plan: un plan sintácticamente válido puede ser semánticamente incorrecto.
- Solo soporta inglés.
- Uso comercial permitido por la licencia Apache-2.0, sin restricciones adicionales declaradas; conviene verificar la licencia del modelo base Qwen3-0.6B.
- Sin descargas ni valoraciones en el momento de la consulta; madurez y mantenimiento no verificables.
- No hay datos publicados de rendimiento sobre preguntas reales de desarrollo, solo sobre formulaciones sintéticas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Madhvansh/tieout-planner-qwen3-0.6b-v2-gguf
- Modelo base: https://huggingface.co/Qwen/Qwen3-0.6B
- Repositorio del proyecto TieOut: https://github.com/Madhvansh/tieout
- Lenguaje de planes de referencia: `benchmark/plan_language.txt` en el repositorio de TieOut
- Script de generación de datos: `finetune/make_data.py` en el repositorio de TieOut
- Scripts de entrenamiento: `finetune/train_kaggle_v3.py` (v3) y `train_kaggle.py` (v2) en el repositorio de TieOut
- Integración con Ollama: Modelfile incluido en el repositorio del modelo
