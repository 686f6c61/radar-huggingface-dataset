# prodigalbeef/qwen3vl-chartqa-qlora

## Resumen

`prodigalbeef/qwen3vl-chartqa-qlora` es un adaptador LoRA (entrenado con QLoRA) sobre el modelo vision-lenguaje `Qwen/Qwen3-VL-4B-Instruct` de Alibaba Qwen, especializado en responder preguntas sobre graficos (chart question answering). Lo desarrolla Yashveer Singh Bhayan en el marco de la asignatura *25ARE471 Introduction to Generative AI* de Amrita Vishwa Vidyapeetham. El problema que aborda es acotado pero concreto: mejorar la precision de un VLM de 4B en la tarea ChartQA sin necesidad de GPUs de gama alta.

El interes practico esta en el metodo mas que en el resultado: demuestra que es posible afinar un VLM de 4B en una unica Tesla T4 de 16 GB (entorno gratuito de Kaggle) en menos de 3 horas, cargando el modelo base en 4-bit NF4 y aplicando LoRA tanto en las capas de atencion del decoder como en las del encoder visual. El adaptador resultante ocupa unos 0,1 GB y se distribuye de forma independiente del modelo base, lo que reduce drasticamente los requisitos de almacenamiento y descarga.

La ganancia medida es modesta: +1,8 puntos de *relaxed accuracy* sobre 500 preguntas del conjunto de test de ChartQA (83,8% a 85,6%), con un test de McNemar que arroja p ≈ 0,20, es decir, sin significacion estadistica sobre esa muestra. Es, por tanto, un artefacto util como referencia metodologica y como punto de partida reproducible, no como modelo de produccion para comprension de graficos a gran escala.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre transformer vision-lenguaje (Qwen3-VL-4B-Instruct); LoRA en atencion del LLM y del encoder ViT |
| Parametros totales | No disponible para el adaptador (14,2 M parametros entrenables, 0,32% del total); modelo base Qwen3-VL-4B-Instruct de 4B |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (heredada del modelo base) |
| Tipos de cuantizacion | Base cargado en 4-bit NF4 con doble cuantizacion (bitsandbytes); adaptador en safetensors (fp16/bf16) |
| Idiomas soportados | Ingles (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre `Qwen3-VL-4B-Instruct`, un modelo vision-lenguaje con un encoder visual tipo ViT y un decoder de lenguaje transformer. El fine-tuning congela los pesos base (cargados en 4-bit NF4 con doble cuantizacion de bitsandbytes) y entrena 192 modulos LoRA: 144 en el modelo de lenguaje (`q_proj`, `k_proj`, `v_proj`, `o_proj`) y 48 en el encoder visual (`attn.qkv`, `attn.proj`). El rango es r=16, alpha=16 y dropout 0, lo que da 14,2 millones de parametros entrenables, un 0,32% del total. La decision de adaptar tambien el encoder visual responde a un analisis de errores: muchas fallas en ChartQA son de percepcion (lectura de barras, etiquetas de ejes), no de razonamiento, por lo que dejar fijo el ViT limitaria la mejora.

El entrenamiento usa SFT con TRL y Unsloth sobre el split de entrenamiento de ChartQA (28.299 pares pregunta-respuesta), con 1.900 pasos, batch efectivo de 8 (2 × 4 de acumulacion de gradiente), learning rate 2e-4 con schedule lineal y 50 pasos de warmup, AdamW de 8 bits con weight decay 0,01, precision fp16 y semilla 3407. Se completa aproximadamente 0,54 epocas (unos 15.200 ejemplos). Las imagenes se redimensionan con el lado mayor a 768 px, se decodifican de forma perezosa por lote y se aplica gradient checkpointing con offload de gradientes para ajustar el consumo a los 16 GB de la T4. La perdida se enmascara a los tokens de la respuesta del asistente y cae de una media de 0,69 (primeros 20 pasos) a 0,35 (ultimos 20), con alta varianza por la brevedad de las respuestas (1-3 tokens). El tiempo total de entrenamiento es de 2,67 horas, 2,96 horas de extremo a extremo.

## Capacidades

- Respuesta a preguntas sobre graficos e imagenes de charts: valores numericos, etiquetas, comparaciones, tendencias y datos puntuales.
- Generacion de texto breve y factual a partir de una imagen mas una pregunta (pipeline `image-text-to-text`).
- Razonamiento visual basico heredado del modelo base Qwen3-VL-4B-Instruct (percepcion de ejes, barras, leyendas).
- Formato de respuesta restringido a una sola palabra o numero mediante prompt, con decodificacion greedy limitada a 24 tokens y truncado a la primera linea.
- Capacidades del modelo base no verificadas en este adaptador: tool calling, agentes, modo thinking, multilingue, matematicas avanzadas. La model card no documenta evaluaciones de estas funciones tras el fine-tuning.
- Soporte de inferencia via PEFT y Unsloth (`FastVisionModel`), con carga directa del adaptador desde el repositorio.

## Casos de uso

- Extraccion de valores en paneles de analitica: dado un grafico de barras o lineas exportado como imagen, el modelo devuelve el dato de una serie en un ano concreto. Adecuado por su entrenamiento especifico en ChartQA y su bajo coste de despliegue.
- Automatizacion de informes periodisticos: procesar capturas de graficos de organismos oficiales y obtener cifras citables, con validacion humana posterior dado el riesgo de error numerico.
- Enriquecimiento de bases de datos documentales: recorrer PDFs con graficos embebidos, extraer pregunta-respuesta y poblar campos estructurados, usando el adaptador sobre el modelo base cuantizado en una unica GPU.
- Prototipado academico y docencia: reproducir el experimento completo (`scripts/run_experiment.py`) en una T4 gratuita, util como material de referencia para cursos de generative AI y fine-tuning eficiente.
- Evaluacion comparativa de tecnicas QLoRA: servir como baseline reproducible para medir el efecto de adaptar el encoder visual frente a solo el LLM, con el codigo de metricas y el subset sembrado incluidos.
- Asistente de accesibilidad para dashboards: responder en lenguaje natural a preguntas sobre graficos mostrados en pantalla, integrado en una herramienta de escritorio con GPU consumer.
- Filtrado y control de calidad en pipelines de datos: detectar graficos mal etiquetados o inconsistentes comparando la respuesta del modelo con el valor esperado, usando la métrica de relaxed accuracy implementada en el repositorio.

## Benchmarks y rendimiento

Resultados sobre 500 preguntas del test de ChartQA (relaxed accuracy: tolerancia del 5% en numericos, coincidencia exacta case-insensitive en texto):

| Metrica | Base 4-bit zero-shot | QLoRA fine-tuned | Delta |
|---|---|---|---|
| Relaxed accuracy global | 0,838 (419/500) | 0,856 (428/500) | +1,8 pts |
| Numeric (n=382) | 0,859 | 0,872 | +1,3 |
| Text (n=90) | 0,789 | 0,833 | +4,4 |
| Yes/No (n=28) | 0,714 | 0,714 | 0,0 |
| Preguntas humanas (n=245) | 0,743 | 0,759 | +1,6 |
| Preguntas generadas por maquina (n=255) | 0,929 | 0,949 | +2,0 |

Analisis de significacion: 24 respuestas corregidas y 15 degradadas (39 cambios netos de +9). Test exacto de McNemar p ≈ 0,20, sin significacion estadistica sobre la muestra de 500. No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 16 GB para inferencia con el modelo base en 4-bit NF4 y el adaptador, segun el propio autor (una Tesla T4 de 16 GB es suficiente).
- GPU recomendadas: Tesla T4 (validada), RTX 4090, A100, H100. Cualquier GPU con 16 GB o mas deberia funcionar.
- Cabe en GPU consumer: si, en RTX 4090 (24 GB) con holgura; en GPUs de 16 GB como RTX 4080 o T4 con el modelo base cuantizado a 4-bit. En GPUs de 8-12 GB no esta validado y requeriria cuantizacion adicional o reduccion del tamano de imagen.
- Opciones de despliegue: PEFT + Unsloth (`FastVisionModel.from_pretrained(..., load_in_4bit=True)`), scripts incluidos (`scripts/infer.py`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI en la informacion disponible.
- Latencia y throughput: no disponibles. El entrenamiento completo tarda 2,67 h en una T4; la inferencia greedy esta limitada a 24 tokens por respuesta, lo que acota la latencia por consulta pero no se proporcionan cifras.
- Almacenamiento: repositorio de 0,1 GB (solo adaptador); el modelo base debe descargarse por separado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | ChartQA (relaxed acc.) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| prodigalbeef/qwen3vl-chartqa-qlora | 4B base + 14,2 M adaptador | No disponible | 85,6% (500 preguntas) | Apache 2.0 | Hugging Face |
| Qwen/Qwen3-VL-4B-Instruct (base) | 4B | No disponible | 83,8% (mismo subset, 4-bit) | Apache 2.0 | Hugging Face |
| Otros fine-tunes de ChartQA sobre VLMs de 2-7B | Variable | Variable | No disponible | Variable | Hugging Face |

La comparativa directa con alternativas especializadas en ChartQA no esta disponible en la informacion proporcionada. La referencia mas solida es el propio modelo base sin adaptar, evaluado con identico prompt, tamano de imagen, decodificacion y subset sembrado.

## Limitaciones y advertencias

- La mejora de +1,8 puntos no es estadisticamente significativa sobre 500 preguntas (McNemar p ≈ 0,20); haria falta evaluar el test completo de 2.500 preguntas para confirmarlo.
- Entrenado solo en ingles; no se ha validado su comportamiento en castellano ni en otros idiomas.
- Especializado exclusivamente en comprension de graficos; su rendimiento en otras tareas visuales o de texto puede degradarse respecto al modelo base.
- Los errores de razonamiento persisten: contar barras por encima de un umbral, promediar series o resolver preguntas de varios pasos siguen siendo el principal modo de fallo en graficos escritos por humanos.
- Riesgo de alucinacion numerica: el modelo puede devolver cifras plausibles pero incorrectas; en produccion requiere validacion o verificacion cruzada.
- Formato de respuesta restringido a una palabra o numero por prompt y decodificacion greedy de 24 tokens; no es adecuado para respuestas largas o explicativas sin reentrenamiento o cambio de prompt.
- Solo se entreno 0,54 epocas; un entrenamiento mas largo podria mejorar o sobreajustar, no esta determinado.
- Licencia Apache 2.0 permite uso comercial, pero se heredan las condiciones del modelo base Qwen3-VL-4B-Instruct, que deben verificarse por separado.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; sin mantenimiento ni comunidad verificada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/prodigalbeef/qwen3vl-chartqa-qlora
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-4B-Instruct
- Dataset ChartQA: https://huggingface.co/datasets/HuggingFaceM4/ChartQA
- Repositorio incluido en el modelo: scripts `scripts/infer.py`, `scripts/run_experiment.py`, `scripts/rescore.py`, `chartqa_qlora/metrics.py`, `results/report.md`, `notebooks/` (rutas relativas al repositorio de Hugging Face)
- Unsloth: https://github.com/unslothai/unsloth
- TRL: https://github.com/huggingface/trl
- PEFT: https://github.com/huggingface/peft
