# nagohachi/Llama-3.2-tiny-lm-v2-japanese-500m-sft

## Resumen

Llama-3.2-tiny-lm-v2-japanese-500m-sft es un modelo de lenguaje de aproximadamente 476 millones de parámetros especializado en japonés, desarrollado por el usuario nagohachi. No se trata de un modelo entrenado desde cero, sino de un derivado de meta-llama/Llama-3.2-3B obtenido mediante poda estructurada de anchura (width pruning), seguido de preentrenamiento de recuperación sobre unos 10.000 millones de tokens y, finalmente, ajuste fino supervisado (SFT) para conversación. Es la variante instruction-tuned del modelo base homónimo y el contrapunto basado en poda del tiny-lm-v1-japanese-500m, que se entrenó desde cero.

El modelo resuelve el problema de desplegar un asistente conversacional en japonés con un coste computacional muy reducido, manteniendo parte del conocimiento adquirido por un modelo mucho mayor. Con 476 millones de parámetros y un contexto de 2048 tokens, está pensado para entornos con recursos limitados (CPU, GPU de gama baja, dispositivos edge) donde un modelo de 3B o superior no es viable. Utiliza un tokenizador de llm-jp/llm-jp-3-440m con un vocabulario de 99.574 tokens, adaptado al japonés.

Su relevancia actual radica en que demuestra que la poda estructurada con preentrenamiento de recuperación puede producir modelos pequeños competitivos frente a alternativas entrenadas desde cero con el mismo presupuesto de parámetros. En la evaluación con llm-jp-eval v1.4.1, el modelo base podado supera al tiny-lm-v1 base (0,277 frente a 0,210 de media), aunque la versión SFT rinde por debajo de su propio base en esa métrica concreta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer estilo Llama (implementación custom con `trust_remote_code=True`), podado en anchura desde Llama-3.2-3B |
| Parametros totales | 476.363.776 (~476M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantizacion | no disponible (el repo solo distribuye safetensors en bfloat16; no se documentan GGUF ni otras cuantizaciones) |
| Idiomas soportados | japonés (ja) |
| Licencia | Llama 3.2 Community License (license: llama3.2) |
| Formato de pesos | safetensors (librería transformers, requiere código custom) |

Datos adicionales: vocabulario de 99.574 tokens, tokenizador llm-jp/llm-jp-3-440m, tamaño del repositorio 1,0 GB, 430 descargas y 0 likes en el momento de la consulta.

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only de estilo Llama, pero no se carga con la implementación estándar de transformers: el repositorio incluye una implementación propia (`scratch_llama`) que exige `trust_remote_code=True`. El modelo se obtuvo podando la anchura de Llama-3.2-3B hasta unos 476M de parámetros y aplicando después un preentrenamiento de recuperación sobre aproximadamente 10.000 millones de tokens, lo que permite recuperar parte de la capacidad perdida durante la poda. El contexto máximo es de 2048 tokens, muy por debajo de los 128K del modelo original, y el tokenizador se sustituye por el de llm-jp-3-440m, más adecuado para japonés.

La fase de instrucción (SFT) se realizó sobre los datasets llm-jp/magpie-sft-v1.0 y kanhatakeyama/AutoMultiTurnByCalm3-22B, con unas 188.000 conversaciones tras filtrar las filas contaminadas con chino. El entrenamiento se ejecutó durante aproximadamente 2 épocas, partiendo del modelo base ya recuperado, y la función de pérdida se calculó únicamente sobre los turnos del asistente. La plantilla de chat empleada es la de llm-jp-3 instruct. Existe además una variante posterior afinada con DPO (Llama-3.2-tiny-lm-v2-japanese-500m-dpo), cuyos resultados en llm-jp-eval son prácticamente idénticos a los de esta versión SFT.

## Capacidades

- Generación de texto conversacional en japonés, con formato de chat multi-turno mediante la plantilla de llm-jp-3 instruct.
- Comprensión lectora, respuesta a preguntas y clasificación de texto en japonés, según las categorías evaluadas en llm-jp-eval (QA, RC, NLI, MC).
- Generación de resúmenes y traducción japonés-inglés dentro de las tareas de llm-jp-eval (SUM, MT), con rendimiento limitado.
- Razonamiento matemático elemental y generación de código a nivel básico (categorías MT y HE de la evaluación), sin garantías de calidad en problemas complejos.
- Respuesta a instrucciones conversacionales gracias al ajuste fino supervisado sobre datos de diálogo.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No dispone de visión, audio ni modo de razonamiento extendido (thinking).

## Casos de uso

- Asistente conversacional ligero en japonés para aplicaciones móviles o web: con 476M de parámetros y pesos en bfloat16 (aproximadamente 1 GB), puede ejecutarse en CPU o en GPUs integradas, gestionando diálogos de hasta 2048 tokens con la plantilla de chat de llm-jp-3.
- Clasificación y etiquetado de texto japonés a pequeña escala: tareas de análisis de sentimiento, categorización de tickets o moderación básica, donde el modelo puede desplegarse en lote sobre grandes volúmenes sin coste elevado de inferencia.
- Respuesta a preguntas sobre documentación interna en japonés: con prompts de contexto corto (hasta 2048 tokens) puede construir sistemas RAG sencillos para manuales, FAQs o bases de conocimiento acotadas.
- Generación de resúmenes de textos breves en japonés: útil para resumir correos, notas o artículos cortos en flujos internos donde no se requiere máxima calidad.
- Prototipado e investigación sobre poda de modelos: sirve como referencia reproducible para estudiar el impacto de la poda estructurada y el preentrenamiento de recuperación frente a entrenamiento desde cero (comparación directa con tiny-lm-v1).
- Entornos con privacidad estricta o sin conectividad: al caber en hardware modesto, permite ejecución local en dispositivos edge o servidores sin GPU, manteniendo los datos en el propio sistema.
- Filtrado y preprocesamiento de corpus japoneses: generación de pares instrucción-respuesta sintéticos o normalización de texto en pipelines de datos, aprovechando su bajo coste por token.

## Benchmarks y rendimiento

Resultados publicados por el autor con llm-jp-eval v1.4.1 (100 ejemplos del split dev por dataset, 4-shot, decodificación greedy, sin plantilla de chat). La media corresponde a 10 categorías, excluyendo generación de código.

| Modelo | Media | EL | FA | HE | MC | MR | MT | NLI | QA | RC | SUM |
| :--- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Llama-3.2-tiny-lm-v2-japanese-500m-base | 0,277 | 0,277 | 0,059 | 0,230 | 0,303 | 0,050 | 0,571 | 0,464 | 0,332 | 0,431 | 0,058 |
| **Llama-3.2-tiny-lm-v2-japanese-500m-sft** | **0,249** | **0,240** | **0,059** | **0,195** | **0,317** | **0,030** | **0,595** | **0,342** | **0,245** | **0,364** | **0,107** |
| Llama-3.2-tiny-lm-v2-japanese-500m-dpo | 0,249 | 0,220 | 0,063 | 0,195 | 0,307 | 0,030 | 0,595 | 0,340 | 0,242 | 0,391 | 0,105 |
| tiny-lm-v1-japanese-500m-base | 0,210 | 0,075 | 0,035 | 0,215 | 0,300 | 0,010 | 0,451 | 0,528 | 0,229 | 0,208 | 0,051 |
| tiny-lm-v1-japanese-500m-sft | 0,221 | 0,129 | 0,036 | 0,235 | 0,300 | 0,010 | 0,472 | 0,428 | 0,222 | 0,278 | 0,099 |
| tiny-lm-v1-japanese-500m-dpo | 0,220 | 0,137 | 0,035 | 0,235 | 0,293 | 0,010 | 0,476 | 0,412 | 0,232 | 0,268 | 0,102 |
| llm-jp/llm-jp-3-440m | 0,264 | 0,223 | 0,057 | 0,285 | 0,320 | 0,050 | 0,620 | 0,508 | 0,277 | 0,267 | 0,029 |
| llm-jp/llm-jp-3-440m-instruct3 | 0,274 | 0,296 | 0,060 | 0,240 | 0,313 | 0,050 | 0,646 | 0,444 | 0,229 | 0,384 | 0,073 |

Categorías: EL (examen lingüístico), FA (análisis morfológico), HE (humanidades), MC (opción múltiple), MR (razonamiento matemático), MT (traducción), NLI (inferencia en lenguaje natural), QA (preguntas y respuestas), RC (comprensión lectora), SUM (resumen). No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1 GB en bfloat16 o float16 para los 476M de parámetros, más el overhead de activaciones y caché KV (contexto máximo de 2048 tokens). En float32, unos 2 GB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM. Funciona holgadamente en RTX 3060, RTX 4060, RTX 4090, A100 y H100; estas dos últimas están sobredimensionadas para el modelo.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU dedicada moderna e incluso en GPUs integradas con memoria compartida suficiente. También es viable en CPU.
- Opciones de despliegue: transformers con `trust_remote_code=True` es la vía documentada. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI; al requerir código custom y no distribuir GGUF, el soporte en otros runners no está garantizado.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Media llm-jp-eval | Licencia | Disponibilidad |
| :--- | ---: | ---: | ---: | :--- | :--- |
| Llama-3.2-tiny-lm-v2-japanese-500m-sft | 476M | 2048 | 0,249 | Llama 3.2 Community | Hugging Face, requiere `trust_remote_code` |
| tiny-lm-v1-japanese-500m-sft | ~500M | no disponible | 0,221 | no disponible | Hugging Face |
| llm-jp/llm-jp-3-440m-instruct3 | 440M | no disponible | 0,274 | no disponible | Hugging Face |

Frente al tiny-lm-v1 (entrenado desde cero), este modelo obtiene una media superior en llm-jp-eval (0,249 frente a 0,221) y destaca especialmente en traducción (0,595 frente a 0,472) y examen lingüístico (0,240 frente a 0,129), aunque pierde en NLI (0,342 frente a 0,428). Frente al llm-jp-3-440m-instruct3, queda por debajo en la media global (0,249 frente a 0,274), con peor rendimiento en examen lingüístico, humanidades, razonamiento matemático y traducción, pero mejor en resumen (0,107 frente a 0,073).

## Limitaciones y advertencias

- Modelo de muy pequeño tamaño (476M): la calidad de razonamiento, matemáticas y código es limitada; los benchmarks muestran valores bajos en HE (0,195), MR (0,030) y QA (0,245).
- El ajuste SFT reduce la media global de llm-jp-eval respecto al modelo base podado (0,249 frente a 0,277), especialmente en NLI y QA; conviene evaluar ambas variantes según la tarea.
- Contexto máximo de solo 2048 tokens, insuficiente para documentos largos o conversaciones extensas.
- Entrenado exclusivamente en japonés: no se garantiza un comportamiento correcto en castellano ni en otros idiomas.
- Riesgo de alucinación elevado por el tamaño reducido del modelo y por el uso de datos SFT generados automáticamente (magpie y AutoMultiTurnByCalm3-22B).
- Posibles sesgos heredados de Llama-3.2-3B y de los datasets de instrucciones utilizados; no se documenta ninguna evaluación de sesgos ni de seguridad.
- Licencia Llama 3.2 Community: uso comercial permitido con condiciones, obligación de atribución ("Built with Llama") y sujeción a la Acceptable Use Policy de Meta. Es un modelo derivado, por lo que se aplican las restricciones de la licencia original.
- Requiere `trust_remote_code=True`, lo que implica ejecutar código del autor; conviene auditar el repositorio antes de usarlo en producción.
- No se documentan cuantizaciones GGUF ni soporte en motores de inferencia habituales, lo que limita las opciones de despliegue optimizado.
- El modelo fue creado en julio de 2026 y actualizado en noviembre de 2026 según los metadatos; su ecosistema y mantenimiento son reducidos (0 likes, 430 descargas).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nagohachi/Llama-3.2-tiny-lm-v2-japanese-500m-sft
- Modelo base podado: https://huggingface.co/nagohachi/Llama-3.2-tiny-lm-v2-japanese-500m-base
- Variante DPO: https://huggingface.co/nagohachi/Llama-3.2-tiny-lm-v2-japanese-500m-dpo
- Contraparte desde cero (SFT): https://huggingface.co/nagohachi/tiny-lm-v1-japanese-500m-sft
- Modelo original de Meta: https://huggingface.co/meta-llama/Llama-3.2-3B
- Tokenizador: https://huggingface.co/llm-jp/llm-jp-3-440m
- Dataset SFT: https://huggingface.co/datasets/llm-jp/magpie-sft-v1.0
- Dataset de diálogo multi-turno: https://huggingface.co/datasets/kanhatakeyama/AutoMultiTurnByCalm3-22B
- Herramienta de evaluación llm-jp-eval: https://github.com/llm-jp/llm-jp-eval
- Blog de LLM-jp con los resultados de referencia: https://llm-jp.github.io/blog/2025/02/05/instruct3.html
