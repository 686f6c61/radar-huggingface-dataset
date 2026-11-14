# Hooshaai/bert-comp-entropy-budget-allocation-sst2

## Resumen
El modelo `Hooshaai/bert-comp-entropy-budget-allocation-sst2` es un checkpoint comprimido y posteriormente reparado mediante LoRA de `google-bert/bert-base-uncased`, ajustado para clasificación de sentimiento binaria en GLUE SST-2. Lo publica el usuario Hooshaai dentro del ecosistema NeuralOps, una librería de compresión de modelos, y emplea el compresor `entropy_budget_allocation` (`EntropyBudgetCompressor`, familia SVD), que asigna rangos de forma global a partir de la entropía de las activaciones blanqueadas.

El interés del checkpoint no reside en su calidad predictiva, sino en su valor como artefacto de investigación sobre compresión física de transformers. Con un rango de truncamiento `k=128`, el modelo reduce sus parámetros de 109.483.778 a 45.792.002 (−58,17 %, ratio físico 2,391x), y tras aplicar un healing LoRA de rango 8 alcanza un 75,92 % de accuracy en la validación de SST-2, frente al 91,63 % del profesor original. Es, por tanto, un ejemplo reproducible de hasta dónde se puede comprimir un BERT-base sin colapsar la tarea.

La relevancia actual es metodológica: permite comparar curvas de Pareto entre distintos rangos (`k=256, 128, 64, 32`) y evaluar si técnicas de reparación ligera recuperan capacidad tras una compresión agresiva. No está pensado como modelo de producción para análisis de sentimiento, sino como referencia técnica dentro del zoo de compresores de NeuralOps.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder BERT-base (12 capas, dimensión oculta D=768), con topología comprimida por descomposición SVD y asignación de rango por entropía |
| Parametros totales | 45.792.002 (checkpoint comprimido, −58,17 % respecto a los 109.483.778 del BERT-base original) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible en la información proporcionada (heredada de `bert-base-uncased`, típicamente 512 tokens, pero no confirmado en la model card) |
| Tipos de cuantizacion | no disponible (el artefacto se distribuye en `pytorch_model.bin` en precisión completa; no se documentan variantes GGUF, GPTQ ni AWQ) |
| Idiomas soportados | inglés (`en`) |
| Licencia | MIT |
| Formato de pesos | `pytorch_model.bin` (state dict serializado de PyTorch); tokenizer en `vocab.txt`, `tokenizer.json`, `tokenizer_config.json` |

## Arquitectura y entrenamiento
La arquitectura de partida es `google-bert/bert-base-uncased`: un transformer encoder de 12 capas con 109.483.778 parámetros y dimensión oculta 768, preentrenado de forma auto-supervisada y ajustado posteriormente en GLUE SST-2. Sobre ese modelo, NeuralOps aplica `EntropyBudgetCompressor`, un operador de compresión de la familia SVD que asigna rangos de truncamiento de forma global mediante la entropía de las activaciones blanqueadas, en lugar de fijar un rango uniforme por capa. El resultado es una topología de bajo rango que se serializa como state dict comprimido.

El proceso de compresión se evalúa en cuatro rangos (`k=256, 128, 64, 32`) sobre la partición de validación de SST-2 (872 muestras) en una NVIDIA GeForce RTX 3090 de 24 GB. Cuando la compresión zero-shot degrada la accuracy más de 2,0 puntos con una reducción superior a 1,10x, se activa un healing LoRA dirigido con `r=8`, 50 pasos, `lr=2e-4` y un presupuesto de 45 segundos. El checkpoint publicado corresponde a `k=128` con healing aplicado. No se documentan en la información disponible detalles sobre el dataset de preentrenamiento, el volumen de tokens, ni si hubo RLHF o DPO (no aplicables a un encoder de clasificación de este tipo).

## Capacidades
- Clasificación de sentimiento binaria (negativo/positivo) sobre texto en inglés, con dos etiquetas de salida.
- Inferencia sobre entradas tokenizadas con el vocabulario estándar de `bert-base-uncased`.
- Evaluación reproducible de compresión: el repositorio incluye `compression_summary.json` con telemetría de los cuatro rangos evaluados.
- Reconstrucción programática mediante `neuralops.core.compression_pipeline.compress_model` y carga del state dict con `strict=False`.
- Carga mediante la API universal de NeuralOps Hub (`load_surgeried_model`).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking: es un encoder de clasificación, no un modelo generativo.
- Capacidad multilingüe limitada al inglés; no se declaran otros idiomas.

## Casos de uso
- Investigación en compresión de modelos: sirve como punto de referencia para medir la curva de Pareto entre ratio de compresión y accuracy en una tarea controlada (SST-2), comparando `k=256, 128, 64, 32` con el profesor a 91,63 %.
- Reproducción de experimentos de healing LoRA: el checkpoint permite verificar si un ajuste de 50 pasos con `r=8` recupera capacidad tras una poda SVD agresiva, útil para validar metodologías de reparación.
- Docencia y formación técnica: ejemplo tangible de cómo la asignación de rango por entropía difiere del truncamiento uniforme y qué impacto tiene en la precisión downstream.
- Baseline para pipelines de destilación o cuantización: al estar comprimido a 45,8 M de parámetros, sirve como punto de partida para comparar con otras técnicas (poda estructurada, destilación, cuantización de 8 bits).
- Pruebas de integración de la librería NeuralOps: el flujo de `compress_model` + `load_state_dict(strict=False)` es un caso de prueba realista para CI del propio framework.
- Análisis de robustez de clasificadores comprimidos: permite estudiar cómo se degrada la calibración y la accuracy en un clasificador de sentimiento cuando se reduce el rango, antes de decidir si merece la pena desplegar una versión comprimida.
- Prototipado de clasificación de sentimiento de baja capacidad en entornos con restricciones de memoria, siempre que se asuma la pérdida de ~15,7 puntos de accuracy frente al profesor.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente):

| Modelo / configuración | Ratio físico | Parámetros (reducción) | Accuracy zero-shot | Accuracy con healing LoRA | Paridad vs profesor (91,63 %) |
|---|---:|---:|---:|---:|---:|
| Profesor `bert-base-uncased` (SST-2) | 1,00x | 109.483.778 | 91,63 % | — | 0,00 % |
| `k=256` | 1,63x | 67.034.882 (−38,8 %) | 59,52 % | 49,08 % | −42,55 % |
| `k=128` (checkpoint publicado) | 2,39x | 45.792.002 (−58,2 %) | 52,41 % | 75,92 % | −15,71 % |
| `k=64` | 3,11x | 35.170.562 (−67,9 %) | 51,38 % | 50,92 % | −40,71 % |
| `k=32` | 3,67x | 29.859.842 (−72,7 %) | 50,00 % | 50,92 % | −40,71 % |

Evaluación realizada sobre la partición de validación de GLUE SST-2 (872 muestras) en una NVIDIA GeForce RTX 3090. El resultado de `k=128` con healing (75,92 %) es el único declarado en el `model-index` del repositorio. No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks en la información disponible.

## Requisitos de hardware
- VRAM estimada para inferencia: el checkpoint pesa aproximadamente 87,5 MB según la model card, por lo que la inferencia en FP32 requiere del orden de 200-400 MB de VRAM incluyendo activaciones y overhead de framework; no se han publicado mediciones exactas.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM es suficiente; el autor evaluó en una NVIDIA GeForce RTX 3090 (24 GB), pero el modelo es sobradamente pequeño para GPUs consumer.
- Cabe en cualquier GPU consumer (RTX 3060, RTX 4060, GTX 1660, etc.) e incluso en CPU para inferencia por lotes pequeños.
- Opciones de despliegue: la model card documenta exclusivamente el flujo con `neuralops` + `transformers` (`BertForSequenceClassification` + `compress_model` + `load_state_dict(strict=False)`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, y al no haber pesos GGUF no es directamente compatible con llama.cpp.
- Latencia y throughput: no disponibles en la información proporcionada. La evaluación se ejecutó en RTX 3090 pero no se reportan tiempos de inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | SST-2 (val) | Licencia | Disponibilidad |
|---|---:|---|---:|---|---|
| `Hooshaai/bert-comp-entropy-budget-allocation-sst2` (`k=128`) | 45.792.002 | no disponible | 75,92 % (con healing) | MIT | Hugging Face, requiere NeuralOps |
| `google-bert/bert-base-uncased` (profesor) | 109.483.778 | 512 tokens (estándar) | 91,63 % (declarado por el autor) | Apache 2.0 | Hugging Face, `transformers` |
| `textattack/bert-base-uncased-SST-2` | 109.483.778 | 512 tokens | ~92 % (referencia habitual de la comunidad, no verificada aquí) | Apache 2.0 | Hugging Face, `transformers` |
| `distilbert-base-uncased-finetuned-sst-2-english` | 66.955.010 | 512 tokens | ~91 % (referencia habitual, no verificada aquí) | Apache 2.0 | Hugging Face, `transformers` |

La comparación relevante es con el profesor y con DistilBERT: el checkpoint comprimido ofrece un ratio de compresión cercano al de DistilBERT (2,39x frente a ~1,63x en parámetros) pero con una pérdida de accuracy muy superior (~15,7 puntos frente al profesor). No se dispone de datos de benchmarks comparativos adicionales en la información proporcionada.

## Limitaciones y advertencias
- Pérdida de accuracy significativa: 75,92 % frente al 91,63 % del profesor, una diferencia de −15,71 puntos. No es adecuado para producción sin una evaluación adicional.
- El healing LoRA no es monotónico: `k=256` y `k=64` empeoran tras el healing (49,08 % y 50,92 % respectivamente), lo que sugiere inestabilidad en el procedimiento de reparación y cuestiona su reproducibilidad.
- El checkpoint requiere reconstruir la topología comprimida con `neuralops` antes de cargar el state dict; no es un modelo `transformers` estándar cargable con `from_pretrained` directamente.
- Solo inglés; no se declaran capacidades multilingües.
- Riesgo de alucinación no aplicable en sentido generativo (es un clasificador), pero sí de clasificaciones erróneas sistemáticas en dominios distintos de SST-2.
- Sesgos heredados de `bert-base-uncased` y del corpus SST-2 (reseñas de películas), no auditados en la model card.
- Licencia MIT, lo que permite uso comercial, pero la licencia del modelo base (`bert-base-uncased`, Apache 2.0) y del dataset GLUE deben respetarse por separado.
- No se documentan limitaciones de longitud de contexto específicas del checkpoint comprimido; se asume la del modelo base, pero no está confirmado.
- El repositorio tiene un tamaño de 0,1 GB y 51 descargas, con muy poca validación comunitaria; los resultados son declarados por el autor y no verificados de forma independiente.
- La información de la búsqueda web proporcionada no contiene resultados relevantes sobre este modelo; no se han podido contrastar datos externos.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/Hooshaai/bert-comp-entropy-budget-allocation-sst2
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Implementación del compresor `entropy_budget_allocation`: https://github.com/tahamajs/NeuralOps/blob/main/neuralops/compression/svd/entropy_budget_allocation.py
- Licencia NeuralOps (MIT): https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Modelo base: https://huggingface.co/google-bert/bert-base-uncased
- Dataset GLUE SST-2: https://huggingface.co/datasets/nyu-mll/glue
