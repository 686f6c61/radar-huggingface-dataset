# Baileyy/stepwise-ielts-modernbert-moe

## Resumen

Stepwise IELTS ModernBERT MoE es un modelo encoder especializado en la evaluacion automatica de ensayos de IELTS Writing Task 2. Lo desarrolla el autor independiente Baileyy (proyecto Stepwise) y parte de `answerdotai/ModernBERT-base`, un encoder modernizado entrenado sobre 2 billones de tokens. El modelo no genera texto: estima cuatro puntuaciones de medio band (Task Response, Coherence and Cohesion, Lexical Resource y Grammatical Range and Accuracy) a partir de un enunciado y un ensayo, sin que se le proporcione la banda objetivo.

La relevancia del modelo es acotada y experimental. Se trata de un fine-tune con el encoder congelado y una cabeza de mezcla de expertos (MoE) de cuatro expertos para regresion, entrenado sobre 4.096 ensayos del dataset `ndtran0101/writing9-ielts-essays`. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y la model card advierte explicitamente que las etiquetas de referencia proceden de las puntuaciones del sitio Writing9, no verificadas por examinadores oficiales de IELTS.

Con 150 millones de parametros y un peso de repositorio de 0,6 GB, es un modelo ligero pensado para inferencia en CPU o GPU consumer. Su interes practico esta en servir como referencia reproducible de un pipeline de scoring de ensayos y como comparativa frente a alternativas generativas (el autor publica un modelo companion basado en Qwen3.5-0.8B con LoRA).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (ModernBERT-base) con cabeza de regresion MoE de cuatro expertos |
| Parametros totales | 150.078.228 |
| Parametros activos | no disponible (no se detalla el reparto de parametros entre expertos) |
| Longitud de contexto | no disponible en la model card (ModernBERT-base soporta hasta 8.192 tokens) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin variantes GGUF publicadas) |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible para el modelo; el modelo base es Apache 2.0 |
| Formato de pesos | safetensors (incluye tokenizer) |

## Arquitectura y entrenamiento

El modelo reutiliza el encoder de ModernBERT-base, que incorpora embeddings posicionales rotatorios para secuencias de hasta 8.192 tokens, capas GeGLU, atencion alterna y unpadding para evitar computo en tokens de relleno. Sobre ese encoder, Stepwise anade una cabeza de mezcla de expertos con cuatro expertos y regresion numerica para predecir las cuatro subpuntuaciones de IELTS de forma simultanea.

El entrenamiento se realizo en dos fases sobre 4.096 ensayos del dataset `ndtran0101/writing9-ielts-essays`: primero 12 epocas con el encoder congelado entrenando solo la nueva cabeza MoE, y despues 3 epocas de ajuste conjunto de encoder y cabeza. El split de desarrollo compartido de 256 ensayos selecciono la epoca 2 del ajuste conjunto. El conjunto de test registro 72 ensayos, de los cuales todos los modelos puntuaron 70 en comun. No se documentan tecnicas de RLHF, DPO ni decodificacion especulativa, algo coherente con un modelo encoder de regresion.

## Capacidades

- Puntuacion de ensayos IELTS Writing Task 2 en cuatro dimensiones: Task Response, Coherence and Cohesion, Lexical Resource y Grammatical Range and Accuracy.
- Estimacion de bandas en escala de medio punto a partir de un enunciado (`prompt`) y un ensayo (`essay`) en formato JSON.
- Evaluacion sin conocimiento de la banda objetivo: el scorer no recibe la puntuacion deseada.
- Inferencia mediante un script propio (`score.py`) con dependencias en `requirements.txt`.
- No soporta generacion de texto, fill-mask, tool calling, agentes ni razonamiento multi-paso; la model card indica explicitamente que los pipelines estandar de generacion o fill-mask del modelo base no ejecutan esta cabeza.
- Capacidad multilingue limitada al ingles.

## Casos de uso

- Evaluacion formativa de candidatos a IELTS: integrado en una plataforma de practica, el modelo devuelve las cuatro subbandas de un ensayo en milisegundos, permitiendo feedback inmediato sin coste de API de un LLM generativo.
- Investigacion sobre scoring automatico de ensayos: sirve como baseline reproducible (hash y resultados agregados en `checkpoint.json`) para comparar contra enfoques generativos como el companion Qwen3.5-0.8B LoRA o Gemini con y sin RAG.
- Precribado en academias: filtrar ensayos con puntuaciones muy bajas o muy altas para que los profesores revisen manualmente solo los casos ambiguos, reduciendo carga de correccion.
- Deteccion de desviaciones por dimension: al predecir TR, CC, LR y GRA por separado, permite identificar que componente del ensayo necesita refuerzo (por ejemplo, cohesion frente a lexico).
- Despliegue en entornos con recursos limitados: con 150 millones de parametros y 0,6 GB de pesos, puede ejecutarse en CPU o en GPU consumer para lotes de ensayos sin infraestructura dedicada.
- Prototipado de pipelines de evaluacion linguistica: el script `score.py` y el formato JSON de entrada facilitan integrar el scorer en un backend de correccion automatica o en un servicio interno de pruebas.

## Benchmarks y rendimiento

Resultados publicados en la model card como error absoluto medio (MAE) en puntos de banda IELTS, menor es mejor, frente a las puntuaciones del sitio Writing9:

| Metrica | Overall | TR | CC | LR | GRA |
|---|---:|---:|---:|---:|---:|
| MAE (banda IELTS) | 1,079 | 1,086 | 1,100 | 1,000 | 1,129 |

El test consta de 72 ensayos y todos los modelos comparados puntuaron 70 en comun. No se publican resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estandar, y no hay datos de latencia o throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 para los 150 millones de parametros; en fp16 o bf16, aproximadamente 300 MB de pesos mas overhead de activaciones.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; el modelo cabe holgadamente en RTX 3060, RTX 4090, A100 y H100, aunque no necesita ninguna de las de gama alta.
- Cabe en GPU consumer: si, en practicamente cualquier GPU consumer moderna, y tambien en CPU para lotes pequenos.
- Opciones de despliegue: el repositorio incluye `score.py` con `requirements.txt`; al ser un encoder con cabeza custom, no es directamente compatible con pipelines estandar de vLLM, TGI o Ollama sin adaptacion. La clonacion requiere Git LFS o `hf download`.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Baileyy/stepwise-ielts-modernbert-moe | 150.078.228 | no disponible (base: 8.192) | Scoring IELTS Task 2 (4 subbandas) | no disponible | Hugging Face, 0 descargas |
| saugataroy/ielts-task2-modernbert-base-moe | no disponible | no disponible | Scoring IELTS Task 2 | no disponible | Hugging Face |
| Baileyy/stepwise-ielts-qwen3.5-0.8b-lora | no disponible (base 0,8B) | no disponible | Scoring IELTS (companion generativo) | no disponible | Hugging Face |
| answerdotai/ModernBERT-base | no disponible | 8.192 | Encoder generalista | Apache 2.0 | Hugging Face |

No se dispone de datos de rendimiento de los modelos alternativos en la informacion proporcionada, por lo que la comparacion cuantitativa se limita al MAE del modelo descrito.

## Limitaciones y advertencias

- Las puntuaciones de referencia proceden del sitio Writing9 y no fueron verificadas por examinadores oficiales de IELTS; el rendimiento en la muestra emparejada no establece precision equivalente a un examinador.
- El modelo es solo para estimaciones de practica e investigacion, segun la propia model card.
- La licencia del modelo no esta declarada; la fuente de datos tiene licencia desconocida y el repositorio no redistribuye ensayos ni puntuaciones originales. Antes de un uso comercial hay que aclarar la licencia con el autor.
- Riesgo de alucinacion no aplicable en el sentido generativo, pero si de calibracion: un MAE cercano a 1,0-1,1 puntos de banda implica errores de una banda completa en promedio.
- El conjunto de test es muy pequeno (72 ensayos) y el split de desarrollo de 256; la generalizacion a otros estilos de ensayo o a otras fuentes de etiquetas no esta validada.
- Solo soporta ingles y no acepta la banda objetivo como entrada, lo que limita su uso para evaluar progreso hacia una nota concreta.
- No es compatible con los pipelines estandar de generacion o fill-mask del modelo base; requiere el script y la cabeza custom incluidos en el repositorio.
- Sesgos especificos no documentados en la informacion disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Baileyy/stepwise-ielts-modernbert-moe
- Modelo base ModernBERT-base: https://huggingface.co/answerdotai/ModernBERT-base/tree/8949b909ec900327062f0ebf497f51aef5e6f0c8
- Documentacion de ModernBERT en Transformers: https://huggingface.co/docs/transformers/model_doc/modernbert
- Benchmark completo del proyecto Stepwise: https://github.com/dwcqwcqw/AC215_Stepwise/blob/bei-li/README.md
- Modelo companion Qwen3.5-0.8B LoRA: https://huggingface.co/Baileyy/stepwise-ielts-qwen3.5-0.8b-lora
- Dataset de entrenamiento: https://huggingface.co/datasets/ndtran0101/writing9-ielts-essays
- Modelo alternativo con enfoque similar: https://huggingface.co/saugataroy/ielts-task2-modernbert-base-moe
