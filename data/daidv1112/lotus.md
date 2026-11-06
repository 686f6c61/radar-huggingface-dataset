# daidv1112/LOTUS

## Resumen

LOTUS (Learning to Understand Time-series by Learning to Forecast) es un modelo de lenguaje especializado en series temporales desarrollado por el autor daidv1112 y publicado en Hugging Face. Se trata de un adaptador que combina un codificador de series temporales con un LLM base (Qwen3-0.6B, Gemma3-1B o Gemma3-270M) mediante LoRA, y que se entrena bajo un principio de "forecast grounding": las representaciones de series temporales deben seguir siendo predictivas de la evolución futura de la señal antes de adaptarse a tareas concretas.

El modelo resuelve un problema específico de los time-series language models: la alineación habitual mediante etiquetas, captions o pares pregunta-respuesta fomenta representaciones lingüísticas pero no exige que estas preserven información sobre cómo evoluciona la señal. LOTUS cierra esa brecha dividiendo cada canal en parches no solapados, combinándolos con su representación espectral y mapeándolos al espacio de embeddings del LLM, prediciendo además el siguiente parche desde los estados ocultos.

La relevancia actual reside en que, con muy pocos parámetros entrenables (1,9M a 11,1M), LOTUS supera a baselines como OpenTSLM-SP y OpenTSLM-Flamingo en seis conjuntos de evaluación downstream, y su variante de 270M lidera el benchmark de razonamiento zero-shot TSRBench por delante de backbones 25-50 veces mayores.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Codificador transformer de parches temporales + proyector + decodificador next-patch + LLM base con adaptadores LoRA |
| Parametros totales | Depende del backbone: Qwen3-0.6B (~600M), Gemma3-1B (~1B), Gemma3-270M (~270M) más interfaz temporal |
| Parametros activos | No aplica (no es MoE) |
| Parametros entrenables | 9,3M (Qwen3-0.6B), 11,1M (Gemma3-1B), 1,9M (Gemma3-270M) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (checkpoints en `torch.save`; el LLM base admite las cuantizaciones de su propio ecosistema) |
| Idiomas soportados | No disponible |
| Licencia | MIT |
| Formato de pesos | `.pt` (diccionario `torch.save` con encoder, proyector, decodificador y adaptadores LoRA); LLM base cargado desde Hugging Face |

## Arquitectura y entrenamiento

LOTUS emplea una arquitectura híbrida: un codificador transformer (6 capas, dimensión 192, 8 cabezas, FF 896) procesa parches no solapados de tamaño 32 de cada canal de la serie temporal, con embeddings posicionales sin/cos y codificación de frecuencia. Cada parche se combina con su representación espectral (representación temporal-espectral) antes de proyectarse al espacio de embeddings del LLM. Un decodificador next-patch (4 capas, dimensión 192, 8 cabezas, FF 896) predice el siguiente parche a partir de los estados ocultos del LLM, forzando a la representación a retener información temporal. Sobre el LLM base se aplican adaptadores LoRA (r=8, alpha=16).

El entrenamiento tiene dos fases. La fase 1 (forecast grounding, pretraining) entrena conjuntamente encoder, proyector, decodificador next-patch y adaptadores LoRA sobre una mezcla de corpus de forecasting (predicción del siguiente parche) y corpus de lenguaje (TSQA de elección múltiple, captioning de M4). La fase 2 (adaptación downstream) elimina el decodificador next-patch y entrena solo la interfaz temporal y los adaptadores LoRA con el objetivo de lenguaje, de forma conjunta sobre HAR, Sleep-EDF, ECG-QA, PAMAP2 y Time-MQA. La evaluación se realiza con decodificación greedy: el modelo escribe una justificación seguida de una respuesta explícita que se parsea y compara con la referencia.

## Capacidades

- Predicción y forecasting de series temporales mediante predicción del siguiente parche.
- Clasificación de actividades humanas (HAR) a partir de ventanas de acelerómetro de tres ejes.
- Clasificación de fases del sueño (Sleep-EDF).
- Preguntas y respuestas sobre electrocardiogramas (ECG-QA) con respuesta generativa.
- Reconocimiento de actividades con datos multimodales de sensores (PAMAP2).
- Razonamiento zero-shot sobre series temporales (TSRBench) y preguntas de elección múltiple y verdadero/falso (Time-MQA).
- Generación de justificación (rationale) antes de la respuesta final, lo que permite trazabilidad del razonamiento.
- Capacidad de captioning de series temporales (entrenado con M4 captioning).
- No se documenta soporte de tool calling, function calling, agentes multi-paso, visión ni audio.

## Casos de uso

- Monitorización de actividad física con wearables: el modelo procesa ventanas de acelerómetro de tres ejes y clasifica la actividad (HAR) con una justificación textual, adecuado por su entrenamiento específico en HAR y su bajo coste de parámetros entrenables.
- Análisis de estudios del sueño: clasificación de fases del sueño a partir de señales de Sleep-EDF, con la ventaja de que LOTUS obtiene 77,10-77,20 en este split con Gemma3-1B y Qwen3-0.6B respectivamente.
- Interpretación de electrocardiogramas: respuesta a preguntas clínicas sobre ECG (ECG-QA) con generación de respuesta normalizada, útil en asistentes de revisión de registros cardíacos.
- Reconocimiento de actividades con sensores corporales múltiples: uso sobre PAMAP2 para clasificar actividades a partir de señales de sensores inerciales y fisiológicos.
- Razonamiento zero-shot sobre series temporales: despliegue en escenarios TSRBench donde no hay datos etiquetados de la tarea, aprovechando que la variante de 270M lidera el benchmark frente a backbones mucho mayores.
- Investigación en representaciones de series temporales: uso del checkpoint como base para estudiar forecast grounding, reproducir los baselines OpenTSLM o extender la metodología a nuevos dominios con bajo coste computacional.
- Prototipado en entornos con recursos limitados: la variante de 270M con 1,9M de parámetros entrenables permite experimentar en una sola GPU consumer, algo inviable con modelos de series temporales de mayor tamaño.

## Benchmarks y rendimiento

Resultados sobre seis splits downstream (exactitud de clasificación; ECG-QA sobre los primeros 5.000 ítems de test):

| Backbone | Metodo | Params | HAR | Sleep | ECG | PAMAP2 | MCQ | T/F | Avg. |
|---|---|---|---|---|---|---|---|---|---|
| Gemma3-270M | OpenTSLM-SP | 3,1M | 54,38 | 65,12 | 9,66 | 52,14 | 38,59 | 68,39 | 48,05 |
| Gemma3-270M | OpenTSLM-Flamingo | 317M | 62,55 | 68,01 | 30,10 | 54,70 | 12,37 | 3,04 | 38,46 |
| Gemma3-270M | LOTUS | 1,9M | 58,38 | 70,54 | 33,16 | 55,15 | 39,41 | 74,47 | 55,19 |
| Gemma3-1B | OpenTSLM-SP | 5,5M | 55,46 | 72,58 | 21,66 | 47,44 | 41,36 | 77,51 | 52,67 |
| Gemma3-1B | LOTUS | 11,1M | 62,67 | 77,10 | 37,66 | 52,56 | 44,98 | 78,42 | 58,90 |
| Qwen3-0.6B | OpenTSLM-SP | 27,8M | 63,25 | 70,54 | 32,20 | 47,44 | 54,64 | 71,20 | 56,55 |
| Qwen3-0.6B | LOTUS | 9,3M | 63,66 | 77,20 | 31,58 | 53,42 | 56,72 | 76,90 | 59,91 |

LOTUS obtiene la mejor media en cada grupo de backbone comparable, con una mejora de 3,36 puntos sobre el mejor baseline con Qwen3-0.6B (59,91 frente a 56,55). La variante de 270M es el mejor sistema en TSRBench zero-shot, por delante de backbones 25-50 veces mayores.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita en la información proporcionada. El repositorio ocupa 12,6 GB e incluye los tres checkpoints LOTUS más los baselines OpenTSLM-SP y OpenTSLM-Flamingo.
- La variante Gemma3-270M (1,9M de parámetros entrenables) es la más ligera y cabe previsiblemente en GPU consumer, aunque el dato exacto de VRAM no se especifica.
- La variante Qwen3-0.6B (~600M) y Gemma3-1B (~1B) requieren más memoria; el quickstart usa `device="cuda"` y `llm_dtype="fp32"` por defecto, con opción `"bf16"` en GPUs con soporte.
- GPU recomendadas: no disponible. El manual de uso menciona CUDA genéricamente.
- Opciones de despliegue: el modelo se carga mediante el código del repositorio `DA2I2-SLM/Lotus` (Python ≥ 3.12, `pip install -e .` o añadir `Lotus/src` a `sys.path`), con `huggingface_hub` para descargar los pesos. No se documenta integración con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Backbone | Params entrenables | Avg. seis splits | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LOTUS (Qwen3-0.6B) | Qwen3-0.6B | 9,3M | 59,91 | MIT | Hugging Face |
| OpenTSLM-SP (Qwen3-0.6B) | Qwen3-0.6B | 27,8M | 56,55 | No disponible | Incluido en el repo LOTUS |
| LOTUS (Gemma3-1B) | Gemma3-1B | 11,1M | 58,90 | MIT | Hugging Face |
| OpenTSLM-SP (Gemma3-1B) | Gemma3-1B | 5,5M | 52,67 | No disponible | Incluido en el repo LOTUS |
| LOTUS (Gemma3-270M) | Gemma3-270M | 1,9M | 55,19 | MIT | Hugging Face |
| OpenTSLM-Flamingo (Gemma3-270M) | Gemma3-270M | 317M | 38,46 | No disponible | Incluido en el repo LOTUS |

Los baselines OpenTSLM son los sistemas comparables directos usados en el paper. No se dispone de comparación con otros time-series language models de la literatura en la información proporcionada.

## Limitaciones y advertencias

- Modelo de investigación con 0 descargas y 0 likes en Hugging Face; no hay evidencia de uso en producción.
- Los pesos se distribuyen como diccionario `torch.save` que requiere el código del repositorio para cargarse; no hay formato estándar (safetensors, GGUF) ni integración directa con frameworks de inferencia comunes.
- La licencia MIT se aplica al adaptador, pero el uso comercial está condicionado por las licencias de los LLM base (Qwen3-0.6B y Gemma3), que deben verificarse por separado.
- Los idiomas soportados no están documentados; el entrenamiento se centra en tareas de series temporales y texto en inglés presumiblemente, pero no se confirma.
- Riesgo de alucinación inherente a los LLM base; las respuestas se generan con justificación y se parsean, pero no se documenta ninguna mitigación específica.
- El rendimiento en ECG-QA se calcula sobre solo los primeros 5.000 ítems de test, lo que puede no representar el conjunto completo.
- El modelo está especializado en dominios concretos (HAR, sueño, ECG, PAMAP2, Time-MQA) y no se documenta su generalización a otros tipos de series temporales.
- La longitud de contexto no está especificada, lo que limita la planificación de despliegues con ventanas largas.
- No se documentan sesgos conocidos ni evaluaciones de robustez o seguridad.

## Enlaces

- Hugging Face: https://huggingface.co/daidv1112/LOTUS
- Paper: https://arxiv.org/abs/2610.18877
- Código: https://github.com/DA2I2-SLM/Lotus
- Modelo base Qwen3-0.6B: https://huggingface.co/Qwen/Qwen3-0.6B
- Modelo base Gemma3-1B: https://huggingface.co/google/gemma-3-1b-pt
- Modelo base Gemma3-270M: https://huggingface.co/google/gemma-3-270m
