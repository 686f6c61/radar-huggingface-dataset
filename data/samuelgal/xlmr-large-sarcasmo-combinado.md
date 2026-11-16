# SamuelGal/xlmr-large-sarcasmo-combinado

## Resumen

xlmr-large-sarcasmo-combinado es un modelo de clasificación de texto en español especializado en la detección binaria de sarcasmo (etiquetas `NO_SARCASMO` y `SARCASMO`). Lo desarrolla SamuelGal en el marco del Taller 1 de Procesamiento del Lenguaje Natural de la Universidad del Valle (2026-II), mediante fine-tuning completo de `FacebookAI/xlm-roberta-large` sobre un dataset propio denominado sarcasmo_combinado.

El modelo resuelve una tarea acotada pero relevante en PLN en castellano: distinguir enunciados irónicos o sarcásticos de enunciados literales en frases cortas, con un rendimiento de validación notable (F1 macro de 0,9420). Su utilidad principal es como componente de preprocesado en pipelines de análisis de opinión, moderación de contenido o sistemas conversacionales que necesiten interpretar el tono del usuario.

Se trata de un encoder transformer de tipo XLM-RoBERTa-large con 559,9 millones de parámetros, licencia MIT y pesos en safetensors, lo que facilita su integración en producción. No es un modelo generativo: su salida es una etiqueta con su probabilidad asociada, y su ventana de contexto efectiva es de 128 tokens, coherente con la longitud de las frases con las que fue entrenado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (XLM-RoBERTa-large), fine-tuning para clasificación de secuencias |
| Parametros totales | 559.892.482 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 128 tokens (max_length de entrenamiento); límite arquitectónico del modelo base no especificado en la información disponible |
| Tipos de cuantizacion | no disponible (el autor no documenta cuantizaciones; al ser un encoder de ~560 M es viable en fp16 e int8, pero no se confirma) |
| Idiomas soportados | español (es) |
| Licencia | MIT |
| Formato de pesos | safetensors (también compatible con transformers) |

## Arquitectura y entrenamiento

El modelo es un XLM-RoBERTa-large completo (24 capas, 1024 dimensiones ocultas, 16 cabezas de atención, vocabulario SentencePiece de 250 002 tokens) al que se le ha añadido una cabeza de clasificación binaria y se ha afinado de extremo a extremo. No se empleó QLoRA ni ningún esquema de cuantización durante el entrenamiento: se trata de un fine-tuning completo en fp16.

El dataset sarcasmo_combinado contiene 12 145 frases de entrenamiento, 3 037 de validación y clases balanceadas (aproximadamente 50/50). La mayoría son titulares y frases cortas, con una mediana de unas 13 palabras. El entrenamiento usó learning rate 1e-05, weight decay 0,01, warmup del 10 %, scheduler lineal, fp16 y `max_length` 128, con un máximo de 10 épocas y early stopping con paciencia 2 sobre F1 macro de validación. Se probaron tres tamaños de batch (8, 16 y 32, con acumulación de gradiente cuando no cabía en memoria); el modelo publicado corresponde al batch 16, que obtuvo el mejor F1 macro de validación. No se documenta el uso de RLHF, DPO ni técnicas de decodificación especulativa, algo esperable en un modelo de clasificación.

## Capacidades

- Clasificación binaria de sarcasmo en español: devuelve `SARCASMO` o `NO_SARCASMO` con su puntuación de confianza.
- Procesamiento de frases cortas y titulares: el rendimiento es más alto en el rango de 11 a 25 palabras (F1 macro 0,9544).
- Uso como componente en pipelines de transformers mediante `pipeline("text-classification")`.
- Compatible con Text Embeddings Inference y con endpoints de Hugging Face (`endpoints_compatible`).
- Capacidad multilingüe heredada del modelo base: aunque el fine-tuning es solo en español, XLM-RoBERTa-large fue preentrenado en 100 idiomas; el autor no valida el rendimiento fuera del español.
- No soporta tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito: es un clasificador, no un modelo generativo.
- No se documentan capacidades de razonamiento multi-paso ni de generación de texto.

## Casos de uso

- Análisis de opinión y sentimiento en redes sociales: el modelo puede etiquetar tuits o comentarios como sarcásticos antes de pasarlos a un analizador de sentimiento, evitando que una frase irónica se clasifique como positiva. Es adecuado por su entrenamiento específico en frases cortas y titulares.
- Moderación de contenido y detección de toxicidad encubierta: en foros y comunidades, el sarcasmo suele acompañar a mensajes hostiles; el clasificador permite marcar mensajes para revisión humana con una señal adicional de tono.
- Atención al cliente automatizada: integrado como paso previo en un chatbot, permite detectar cuándo el usuario está siendo irónico y ajustar la respuesta o derivar a un agente humano. Su contexto de 128 tokens es suficiente para turnos individuales.
- Investigación en PLN en español: sirve como baseline reproducible para estudios sobre ironía y sarcasmo, con métricas de validación documentadas y particiones de datos conocidas.
- Enriquecimiento de datasets periodísticos: al estar entrenado con titulares, puede usarse para clasificar grandes volúmenes de titulares de prensa y separar piezas satíricas de informativas.
- Filtrado en pipelines de curación de datos: en la construcción de corpus para entrenar otros modelos, permite descartar o etiquetar ejemplos sarcásticos que podrían introducir ruido en tareas de sentimiento o diálogo.
- Sistemas de recomendación de contenido satírico: permite identificar y etiquetar piezas de humor o sátira para separarlas de noticias reales en agregadores.

## Benchmarks y rendimiento

Resultados en validación publicados por el autor (3 037 frases):

| batch_size | épocas | mejor época | F1 macro | F1 weighted | accuracy | precision | recall | eval_loss | minutos | memoria (GB) |
|---|---|---|---|---|---|---|---|---|---|---|
| 8 | 9 | 7 | 0,9341 | 0,9341 | 0,9341 | 0,9344 | 0,9341 | 0,5886 | 80,3 | 8,99 |
| 16 (publicado) | 10 | 9 | 0,9420 | 0,9420 | 0,9420 | 0,9423 | 0,9420 | 0,5158 | 56,8 | 9,00 |
| 32 | 7 | 5 | 0,9295 | 0,9295 | 0,9295 | 0,9298 | 0,9295 | 0,3754 | 45,6 | 10,02 |

F1 macro por longitud de frase (modelo publicado):

| longitud | N | F1 macro |
|---|---|---|
| ≤10 palabras | 1055 | 0,9135 |
| 11–25 palabras | 1932 | 0,9544 |
| >25 palabras | 50 | 0,9048 |

No se han publicado resultados en benchmarks estándar externos (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en fp16, el modelo ocupa aproximadamente 1,1 GB de pesos (559,9 M de parámetros × 2 bytes); con activaciones y overhead de runtime, se recomienda al menos 2–3 GB de VRAM. En fp32, unos 2,2 GB de pesos.
- GPU recomendadas: cualquier GPU con 4 GB o más de VRAM es suficiente; por ejemplo, RTX 3050, RTX 3060, RTX 4060, T4, L4. Para entrenamiento o fine-tuning completo, el autor reporta unos 9 GB de memoria con batch 16, lo que encaja en una RTX 3090, RTX 4090, A10, A100 o H100.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna con 4 GB o más (GTX 1650 4 GB en adelante); el entrenamiento completo requiere unos 9 GB, por lo que una RTX 3080/3090/4090 es suficiente.
- Opciones de despliegue: transformers (pipeline nativo), Text Embeddings Inference (TEI), endpoints de Hugging Face. Al ser un encoder BERT-like, también es convertible a ONNX y desplegable con servidores de inferencia estándar; el autor no documenta soporte explícito de vLLM, llama.cpp u Ollama.
- Latencia y throughput estimados: no disponibles en la información proporcionada. Como referencia, el entrenamiento con batch 16 tardó 56,8 minutos para 10 épocas sobre 12 145 frases, lo que da una idea del orden de magnitud del coste computacional, pero no se aportan cifras de inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SamuelGal/xlmr-large-sarcasmo-combinado | 559,9 M | 128 tokens | Clasificación binaria de sarcasmo en español | MIT | Hugging Face |
| FacebookAI/xlm-roberta-large (base) | 559,9 M | 512 tokens arquitectónicos | Modelo base multilingüe, sin cabeza de clasificación | MIT | Hugging Face |
| beto-cliip/sentiment-analysis (BETO) | ~110 M | 512 tokens | Análisis de sentimiento en español (no sarcasmo) | no disponible | Hugging Face |

No se dispone de datos de benchmarks comparativos con otros modelos de detección de sarcasmo en español en la información proporcionada; el autor no incluye una comparativa con alternativas. La comparación con el modelo base es estructural: el fine-tuning añade la cabeza de clasificación y especializa el modelo en español y en la tarea de sarcasmo, a costa de reducir el `max_length` efectivo a 128 tokens.

## Limitaciones y advertencias

- Sesgos de fuente y tema: el dataset mezcla titulares satíricos y noticias reales, por lo que el modelo puede aprender pistas de fuente, tema o época (nombres de políticos, ciudades, años) en lugar de la intención irónica. Esto puede provocar falsos positivos o negativos en dominios distintos al de entrenamiento.
- Riesgo de alucinación: al ser un clasificador, no genera texto, pero sí puede producir etiquetas erróneas con alta confianza; no debe usarse como única señal en decisiones sensibles.
- Limitación de longitud: casi no hay frases de más de 40 palabras en el entrenamiento y el `max_length` es 128 tokens; el rendimiento en textos largos es menos fiable (F1 macro 0,9048 en el tramo >25 palabras, con solo 50 ejemplos).
- Ambigüedad intrínseca: el sarcasmo depende del contexto y del tono; una frase aislada puede ser ambigua incluso para personas, lo que impone un techo de rendimiento.
- Cobertura lingüística: el fine-tuning es solo en español; no se valida el comportamiento en otras lenguas ni en variantes dialectales.
- Licencia MIT: permite uso comercial y modificación, pero conviene revisar las condiciones del modelo base XLM-RoBERTa-large (también MIT) y citar adecuadamente el origen de los datos.
- Madurez: el modelo tiene 0 descargas y 0 likes en el momento de la consulta y fue creado en noviembre de 2026; no hay validación externa ni auditoría independiente.
- Para producción: se recomienda calibrar los umbrales de decisión con datos propios, monitorizar la deriva y combinar la señal con revisión humana en aplicaciones sensibles.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SamuelGal/xlmr-large-sarcasmo-combinado
- Modelo base: https://huggingface.co/FacebookAI/xlm-roberta-large
- No se han encontrado en la información proporcionada enlaces a papers, blogs, repositorios o demos adicionales.
