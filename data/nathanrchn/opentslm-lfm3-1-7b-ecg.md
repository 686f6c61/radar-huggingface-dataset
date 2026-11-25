# nathanrchn/OpenTSLM-LFM3-1.7B-ECG

## Resumen

OpenTSLM-LFM3-1.7B-ECG es un modelo multimodal de series temporales especializado en la lectura de electrocardiogramas (ECG) de 12 derivaciones. Lo desarrolla nathanrchn combinando el modelo de lenguaje LiquidAI/LFM3-1.7B-Base con el codificador de series temporales amazon/chronos-2 (120M), siguiendo la arquitectura OpenTSLM-SoftPrompt del Stanford BDHG. El modelo recibe una grabación cruda de 10 segundos a 500 Hz y responde a preguntas clínicas sobre ella con una justificación breve paso a paso y una respuesta final seleccionada de un conjunto de opciones.

El problema que aborda es la interpretación automática de señales biomédicas mediante modelos de lenguaje: en lugar de un clasificador cerrado, el modelo razona sobre la señal ECG intercalando tokens de la serie temporal con tokens de texto. Esto permite formular preguntas en lenguaje natural y obtener explicaciones razonadas, algo relevante para investigación en modelos de lenguaje aplicados a dominios clínicos y para el estudio de la integración de series temporales en LLMs.

Se trata de un modelo de investigación de 1.7B parámetros (más el codificador de 120M), con licencia LFM Open License v1.0, entrenado exclusivamente sobre el dataset PTB-XL y evaluado en ECG-QA-CoT. No es un dispositivo médico y no debe usarse para diagnóstico. Su relevancia actual radica en que demuestra un pipeline completo y reproducible de adaptación de un LLM pequeño a tareas de series temporales con decodificación razonada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LLM transformer (LFM3-1.7B-Base) + codificador de series temporales Chronos-2 (120M) + proyector MLP (OpenTSLM-SoftPrompt) |
| Parametros totales | 1.7B (LLM) + 120M (codificador); proyector no especificado |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (la entrada es una grabación fija de 10 s a 500 Hz, 12 derivaciones; ~157 soft tokens por derivación) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; cuantización no documentada) |
| Idiomas soportados | en |
| Licencia | LFM Open License v1.0 (llm/); codificador bajo Apache-2.0 (derivado de amazon/chronos-2) |
| Formato de pesos | safetensors (llm/, encoder/, projector.safetensors) |

## Arquitectura y entrenamiento

El modelo es una combinación de un LLM transformer (LFM3-1.7B-Base) y un codificador de series temporales basado en Chronos-2 de 120M parámetros. Las 12 derivaciones de una grabación ECG se atienden entre sí dentro del codificador, lo que permite capturar dependencias entre derivaciones. A continuación, pares de embeddings de parches de 16 muestras se concatenan y se proyectan mediante un MLP al espacio de embeddings del modelo de lenguaje, generando aproximadamente 157 soft tokens por derivación. Los tokens de texto y de ECG se intercalan en el prompt con un formato del tipo «This is ECG Lead II, it has mean … and std …: <ECG tokens>», siguiendo el esquema OpenTSLM-SoftPrompt.

El LLM se ha ajustado con LoRA de rango 16 y posteriormente fusionado (los pesos están en `llm/`). El codificador también se ha ajustado (en `encoder/`). El entrenamiento siguió el currículo de OpenTSLM (TSQA, M4 captioning, HAR, Sleep y finalmente ECG-QA-CoT) sobre GPUs AWS L40S. No se especifican en la información disponible el número de tokens de entrenamiento ni la composición detallada del dataset más allá del uso de ECG-QA / ECG-QA-CoT sobre PTB-XL. No se documenta el uso de RLHF o DPO. La generación es greedy, con hasta 368 tokens, y tarda aproximadamente 2–5 segundos por pregunta en un Apple M4 Max.

## Capacidades

- Interpretación de ECG de 12 derivaciones: recibe grabaciones de 10 s a 500 Hz en milivoltios con forma `(5000, 12)` o `(12, 5000)` y derivaciones en orden I, II, III, aVR, aVL, aVF, V1–V6.
- Respuesta a preguntas clínicas de opción múltiple sobre la señal, con una justificación breve paso a paso (rationale) y una respuesta final.
- Razonamiento de tipo cadena de pensamiento (entrenado sobre ECG-QA-CoT), orientado a explicar la etiqueta más que a derivarla.
- Acepta un contexto clínico opcional (`clinical_context`) junto a la señal.
- Capacidades multilingües: solo inglés.
- No se documenta soporte de tool calling, function calling, agentes ni otras modalidades (visión, audio).

## Casos de uso

- Investigación en modelos de lenguaje aplicados a series temporales: sirve como referencia reproducible para estudiar la integración de codificadores de señales en LLMs mediante soft prompts, con código de inferencia y entrenamiento publicado.
- Evaluación de razonamiento clínico asistido: permite generar justificaciones textuales sobre hallazgos de ECG para su análisis cualitativo en entornos de investigación, no clínicos.
- Docencia y formación en interpretación de ECG: puede usarse como herramienta de apoyo para generar explicaciones de ejemplo sobre grabaciones de PTB-XL en contextos educativos controlados.
- Prototipado de pipelines multimodales señal-texto: el código de `inference.py` y el formato de prompt intercalado sirven de base para adaptar el enfoque a otras señales fisiológicas.
- Replicación de experimentos OpenTSLM: permite reproducir y comparar resultados de ECG-QA-CoT con un LLM de 1.7B en lugar de los modelos de 1B–3B del paper original.
- Análisis por lotes de grabaciones de 10 s: con generación greedy de hasta 368 tokens y 2–5 s por pregunta en hardware consumer de gama alta, es viable procesar conjuntos de grabaciones en investigación.
- Estudio de sesgos y errores en modelos médicos: útil para analizar cómo el modelo repite afirmaciones de contexto clínico inexactas presentes en los prompts de entrenamiento.

## Benchmarks y rendimiento

Resultados en el conjunto de test ECG-QA-CoT (41.093 preguntas sobre 3.207 grabaciones de PTB-XL), con el scorer del paper OpenTSLM:

| Modelo | Accuracy | Macro-F1 (no ponderado) | Macro-F1 (ponderado) |
|---|---|---|---|
| Este modelo, greedy | 45.93 | 44.46 | 38.88 |
| Este modelo, voto mayoritario de 8 muestras | 48.37 | 46.01 | 40.75 |
| OpenTSLM-Flamingo, Llama-3.2-3B (paper) | 46.25 | 40.25 | – |
| OpenTSLM-Flamingo + Chronos-2, Llama-3.2-1B (paper) | 44.01 | 41.92 | – |
| Baseline sin ECG (respuesta más común) | 44.0 | 29.1 | – |

El scorer del paper calcula tanto una media no ponderada como una ponderada por muestra del macro-F1 por plantilla, y el paper no especifica cuál reporta, por lo que se listan ambas. El baseline que ignora el ECG alcanza un 44.0% de accuracy pero solo 29.1 de F1 no ponderado, lo que indica que el macro-F1 es la métrica más informativa.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el repositorio ocupa 4.0 GB en safetensors (LLM 1.7B + codificador 120M + proyector). En FP16 el conjunto ronda los 3.6–4 GB de pesos.
- GPU recomendadas: no se especifican; el autor reporta ejecución en CUDA, Apple GPU (MPS) y CPU. El entrenamiento se realizó en GPUs AWS L40S.
- Cabe en GPU consumer: sí, previsiblemente en tarjetas con 8 GB o más de VRAM en FP16 (estimación a partir del tamaño de los pesos; no confirmada por el autor).
- Opciones de despliegue: el paquete incluye un script propio `inference.py` con la clase `EcgReader`; no se documenta integración con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: aproximadamente 2–5 segundos por pregunta en un Apple M4 Max con generación greedy de hasta 368 tokens. No se publican cifras de throughput en GPU.
- Dependencias: torch 2.15, transformers 5.23, chronos-forecasting 2.3, `wfdb` y `huggingface_hub`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Accuracy (ECG-QA-CoT) | Macro-F1 no ponderado | Licencia |
|---|---|---|---|---|---|
| OpenTSLM-LFM3-1.7B-ECG | 1.7B + 120M | 10 s, 12 derivaciones, 500 Hz | 45.93 (greedy) / 48.37 (voto 8) | 44.46 / 46.01 | LFM v1.0 |
| OpenTSLM-Flamingo (Llama-3.2-3B) | 3B | no disponible | 46.25 | 40.25 | no disponible |
| OpenTSLM-Flamingo + Chronos-2 (Llama-3.2-1B) | 1B | no disponible | 44.01 | 41.92 | no disponible |
| Baseline sin ECG | – | – | 44.0 | 29.1 | – |

Los dos modelos OpenTSLM del paper son los comparables directos. Este modelo, con 1.7B parámetros, supera en macro-F1 no ponderado al de 3B y al de 1B, y con voto mayoritario de 8 muestras alcanza la mayor accuracy de la tabla. No se dispone de datos de otros modelos de lectura de ECG en la información proporcionada.

## Limitaciones y advertencias

- Modelo de investigación, no un dispositivo médico: no debe usarse para diagnóstico ni en decisiones clínicas.
- Las justificaciones de entrenamiento fueron escritas por GPT-4o, por lo que el modelo aprende a explicar una etiqueta más que a derivarla de la señal.
- Los prompts de ECG-QA-CoT publicados contienen contexto clínico inexacto (campos de sexo del paciente y de artefactos); el modelo se entrenó con ellos y puede repetir tales afirmaciones.
- Entrenado y evaluado solo sobre PTB-XL: una única población de dispositivos y grabaciones de 10 s a 500 Hz, lo que limita la generalización a otros dispositivos, frecuencias o duraciones.
- Solo admite inglés y una entrada de formato fijo (10 s, 12 derivaciones, 500 Hz, milivoltios, orden de derivaciones concreto).
- Licencia LFM Open License v1.0 para los pesos del LLM: conviene revisar sus restricciones para uso comercial. El codificador es Apache-2.0.
- Riesgo de alucinación en las justificaciones clínicas y de repetición de contexto erróneo, dado el origen sintético de los rationales.
- El scorer del paper no especifica qué agregación de macro-F1 reporta, lo que dificulta comparaciones estrictas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nathanrchn/OpenTSLM-LFM3-1.7B-ECG
- Artículo y demo interactiva: https://nathanrchn.com/post/lfm3-ecg
- Código de entrenamiento: https://github.com/nathanrchn/OpenTSLM
- Repositorio OpenTSLM original (Stanford BDHG): https://github.com/StanfordBDHG/OpenTSLM
- Modelo base del LLM: https://huggingface.co/LiquidAI/LFM3-1.7B-Base
- Codificador base: https://huggingface.co/amazon/chronos-2
- Dataset ECG-QA: https://github.com/Jwoo5/ecg-qa
- Dataset PTB-XL: https://physionet.org/content/ptb-xl/1.0.3/
