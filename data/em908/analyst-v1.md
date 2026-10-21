# em908/analyst-v1

## Resumen

analyst-v1 es un adaptador LoRA para Qwen2.5-Coder-1.5B-Instruct, publicado por el usuario em908, especializado en una única tarea: escribir código pandas corto que responda a preguntas sobre un DataFrame llamado `df` que ya está cargado en el espacio de nombres de Python. No es un modelo de propósito general ni un modelo nuevo desde cero: es un ajuste fino ligero sobre un transformer decoder-only denso de 1,5 mil millones de parámetros, y su repo (0,1 GB) contiene únicamente los pesos del adaptador en safetensors.

Su interés técnico está en la metodología de entrenamiento más que en el tamaño. El autor construyó 613 pares (esquema, pregunta, código) y descartó cualquier objetivo que no se ejecutase correctamente contra el DataFrame real antes de incorporarlo al conjunto: 546 pares derivados de DS-1000 y 67 generados contra CSV públicos de Kaggle. Es decir, verificación por ejecución como filtro de calidad de los datos, una práctica relevante para quien entrene modelos pequeños de análisis de datos.

Los resultados medidos son modestos pero honestos: sobre 150 pares retenidos y evaluados por ejecución, la tasa de ejecución correcta sube del 53,3 % al 62,0 %, mientras que el exact match frente a referencias de script plano baja del 29,3 % al 25,3 %, porque el adaptador adopta un estilo de respuesta con función envoltorio. Es un modelo de nicho, con 0 descargas y 0 likes en el momento de la consulta, útil como base de experimentación o para prototipos locales de análisis de datos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (familia Qwen2), con adaptador LoRA sobre Qwen2.5-Coder-1.5B-Instruct |
| Parametros totales | 1,5 mil millones (modelo base); el adaptador LoRA añade un numero no especificado de parametros entrenables |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | 32.768 tokens en el modelo base; la model card del adaptador no especifica cambios ni extension |
| Tipos de cuantizacion | el adaptador se distribuye sin cuantizar (safetensors + PEFT); tras fusionar con el base puede cuantizarse a GGUF (Q4_K_M, Q5_K_M, Q8_0), int8 e int4 (bitsandbytes/AWQ/GPTQ) |
| Idiomas soportados | no disponibles en la model card; el modelo base esta entrenado principalmente en ingles y chino, sin evaluacion publicada del adaptador en castellano |
| Licencia | apache-2.0 (igual que el modelo base) |
| Formato de pesos | safetensors (adaptador LoRA cargable con peft); requiere fusion o carga en dos etapas con transformers + peft |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen2.5-Coder-1.5B-Instruct, un transformer decoder-only denso de la familia Qwen2, con atención causal, 32.768 tokens de contexto nativo y pesos en bfloat16. analyst-v1 no modifica la arquitectura: es un LoRA que se fusiona con `merge_and_unload()` para producir un modelo denso estándar. La model card no detalla rango del adaptador, módulos objetivo, hiperparámetros de entrenamiento, ni si hubo fases de RLHF o DPO posteriores al ajuste supervisado.

El dato diferencial es el pipeline de datos. Se partió de 613 tripletas (esquema del DataFrame, pregunta en lenguaje natural, código pandas objetivo), de las cuales 546 proceden de DS-1000 y 67 se generaron contra CSV públicos de Kaggle. Cada objetivo se ejecutó contra el DataFrame real antes de ser aceptado, de modo que el conjunto final sólo contiene código que corre sin error. El autor remite a un paper companion titulado "Every Answer Must Run: Training Small Data-Analyst Models Under Execution Verification", cuya sección 6 explica el mecanismo por el que el adaptador deriva hacia un estilo de respuesta con función envoltorio. El dataset asociado es `em908/analyst-data`, con los mismos recuentos y el mismo filtro de ejecución.

## Capacidades

- Generación de código pandas de longitud corta para responder preguntas analíticas sobre un DataFrame `df` ya presente en el scope de Python.
- Producción de agregaciones, filtrados, agrupaciones, ordenaciones y calculos derivados sobre columnas descritas en el esquema.
- Estilo de respuesta con función envoltorio (wrapper), lo que facilita su integración como función invocable pero penaliza el exact match frente a scripts planos.
- No se documenta soporte de tool calling ni de function calling nativo más allá del formato de respuesta mencionado.
- No se documenta soporte de agentes, razonamiento multi-paso ni modo thinking.
- Sin capacidades multimodales (visión o audio) declaradas.
- Capacidades multilingües no evaluadas; el entrenamiento se apoya en DS-1000 y Kaggle, con predominio del inglés.

## Casos de uso

- Análisis exploratorio interactivo en notebooks: dado un `df` cargado y un esquema pegado en el prompt, el modelo genera la línea de pandas que responde a preguntas del tipo "¿cuál es la media de ventas por región?". Su ventana de 32K permite incluir el esquema completo de tablas anchas sin truncar.
- Generación de código repetitivo en pipelines de informes: automatizar las transformaciones recurrentes (pivotados, ratios, normalizaciones) sobre DataFrames de Kaggle o de negocio, con revisión humana del snippet antes de ejecutarlo.
- Docencia y formación en pandas: al haber sido entrenado sólo con código que se ejecuta, sirve como generador de ejemplos canónicos para material didáctico, siempre con validación posterior por ejecución.
- Autocompletado asistido en el IDE para ciencia de datos: el adaptador es lo bastante pequeño (0,1 GB) para cargarse junto al base en local y ofrecer sugerencias de una o dos líneas con latencia baja en GPU de consumo.
- Generación de aserciones y tests sobre DataFrames: el estilo de función envoltorio encaja bien con la creación de helpers verificables que devuelvan un valor comprobable con `assert`.
- Baseline de investigación en ejecución verificada: permite reproducir la comparación base frente a adaptador sobre el conjunto retenido de 150 pares y medir el efecto del filtro por ejecución en modelos de 1,5B.
- Despliegue en entornos sin GPU dedicada: tras fusionar y convertir a GGUF Q4_K_M, el modelo ocupa alrededor de 1 GB y puede ejecutarse en CPU para tareas puntuales de generación de snippets.

## Benchmarks y rendimiento

Únicos datos publicados en la model card, medidos sobre 150 pares retenidos y puntuados por ejecución:

| Modelo | exec_rate | exact_match |
|---|---|---|
| Qwen2.5-Coder-1.5B-Instruct | 0,533 | 0,293 |
| + adaptador analyst-v1 | 0,620 | 0,253 |

Interpretación: la tasa de ejecución correcta sube 8,7 puntos porcentuales, mientras que el exact match contra referencias de script plano cae 4,0 puntos, atribuido al cambio de estilo de respuesta hacia función envoltorio. No se han publicado resultados de MMLU, HumanEval, GSM8K ni de ningún otro benchmark estándar en la información disponible, ni comparaciones con modelos de otros tamaños.

## Requisitos de hardware

- VRAM para inferencia en bfloat16/fp16: en torno a 3 GB sólo de pesos (1,5B × 2 bytes) más activaciones y caché KV; presupuesto realista de 4 a 6 GB para contexto largo.
- VRAM en int8: aproximadamente 1,6 GB de pesos, con un presupuesto práctico de 3 GB.
- VRAM en int4 (GGUF Q4_K_M): alrededor de 1 GB de pesos, ejecutable con 2 GB de VRAM.
- GPU recomendadas: cualquier GPU con 6 GB o más; RTX 3060 12 GB, RTX 4060 Ti, RTX 3090 y RTX 4090 son holgadas para bf16 con contexto completo. A100 y H100 no aportan ventaja a este tamaño salvo por despliegue por lotes.
- Cabe en GPU de consumo: sí, en GTX 1660 6 GB, RTX 3050 8 GB, RTX 4060 8 GB y superiores. También en CPU, con conversión a GGUF.
- Opciones de despliegue: transformers + peft (carga en dos etapas o con `merge_and_unload()`), vLLM o TGI sobre el modelo fusionado, llama.cpp u Ollama tras convertir a GGUF, y servidores ligeros tipo FastAPI sobre el modelo fusionado.
- Latencia y throughput: no disponibles. No se han publicado cifras de tokens por segundo ni de tiempo de respuesta en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Rendimiento en el conjunto del paper |
|---|---|---|---|---|---|
| analyst-v1 (adaptador) | 1,5B | 32.768 | apache-2.0 | HuggingFace (0 descargas, 0 likes) | exec_rate 0,620 / exact_match 0,253 |
| Qwen2.5-Coder-1.5B-Instruct | 1,5B | 32.768 | apache-2.0 | HuggingFace (modelo base, ampliamente disponible) | exec_rate 0,533 / exact_match 0,293 |
| Qwen2.5-Coder-7B-Instruct | 7,6B | 32.768 | apache-2.0 | HuggingFace | no evaluado en la información disponible |
| StarCoder2-3B | 3B | 16.384 | BigCode OpenRAIL-M | HuggingFace | no evaluado en la información disponible |

La comparación directa sólo es posible frente al modelo base, que es el único con métricas publicadas en el mismo conjunto. Frente a alternativas mayores (7B) o de otra familia, no hay datos de ejecución ni de exact match en la información disponible; la elección entre ellos dependerá de requisitos de VRAM y de licencia, no de una comparación medida.

## Limitaciones y advertencias

- Dominio muy restringido: sólo pandas, sólo código corto y sólo sobre un DataFrame llamado `df` presente en el scope. No cubre SQL, Spark, polars, visualización ni pipelines multi-archivo.
- Conjunto de entrenamiento pequeño (613 pares) y fuertemente sesgado hacia DS-1000 (546 de 613, aproximadamente el 89 %), lo que limita la diversidad de esquemas y estilos de pregunta.
- El estilo de respuesta con función envoltorio reduce el exact match en 4 puntos frente al modelo base; si se espera un script plano, hace falta post-proceso o reescritura del prompt.
- La garantía de ejecución aplica al dataset de entrenamiento, no a las salidas en producción: en inferencia el modelo puede generar nombres de columna o métodos inexistentes. Se recomienda validar siempre ejecutando antes de usar el resultado.
- Modelo base de 1,5B: mayor propensión a errores en consultas con múltiples joins, condicionales anidados o lógica de fechas que un modelo de 7B o superior.
- Idiomas no declarados ni evaluados; no hay evidencia de rendimiento con preguntas o nombres de columna en castellano.
- Sin validación comunitaria: 0 descargas y 0 likes en el momento de la consulta, y ausencia de `pipeline_tag` en la ficha de HuggingFace. No debe asumirse mantenimiento ni soporte.
- Licencia apache-2.0, permisiva para uso comercial, pero conviene verificar los términos del modelo base y de los datos de origen (DS-1000 y CSV de Kaggle) antes de un despliegue comercial, ya que la model card no detalla las licencias de las fuentes.
- Sesgos heredados del modelo base y del corpus de entrenamiento, con predominio de datos y convenciones en inglés.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/em908/analyst-v1
- Dataset de entrenamiento: https://huggingface.co/datasets/em908/analyst-data
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-1.5B-Instruct
- Paper citado en la model card: "Every Answer Must Run: Training Small Data-Analyst Models Under Execution Verification" (sin enlace disponible en la información proporcionada)
- La búsqueda web realizada no devolvió resultados relevantes sobre el modelo, el autor ni el paper: los enlaces encontrados correspondían a páginas de inicio de sesión de Gmail y no guardan relación con el contenido de esta ficha.
