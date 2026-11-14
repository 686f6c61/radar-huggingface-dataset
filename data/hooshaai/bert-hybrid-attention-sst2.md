# Hooshaai/bert-hybrid-attention-sst2

## Resumen

`bert-hybrid-attention-sst2` es un checkpoint derivado de `google-bert/bert-base-uncased` en el que el autor (Hooshaai, con código y pesos publicados también bajo el alias `tahamajs`) sustituye los bloques de atención softmax cuadrática de las 12 capas del transformer por un mecanismo denominado `hybrid_attention`, perteneciente a la librería NeuralOps. El modelo se ha afinado y destilado sobre la tarea SST-2 del benchmark GLUE (clasificación binaria de sentimiento en inglés) y se distribuye como pesos de atención en FP16 más una cabeza de clasificación, con un peso de descarga de unos 55 MB.

El interés del checkpoint no reside en su calidad predictiva, sino en su carácter de prueba de concepto: demuestra que es posible serializar únicamente los parámetros de atención modificados (en lugar de los 450 MB del BERT base completo) y reconstruir el modelo en tiempo de carga mediante un shim de código remoto (`modeling_neuralops_bert.py`). La arquitectura subyacente sigue siendo un transformer encoder de 110 millones de parámetros con vocabulario WordPiece en inglés, pero con una complejidad operativa de atención declarada como O(N) u O(N log N) en lugar de O(N²).

La relevancia actual es limitada pero instructiva: el modelo alcanza un 50,92 % de accuracy en el split de validación de SST-2, prácticamente equivalente al azar en una tarea binaria balanceada, muy lejos del 91,63 % del profesor BERT-base. Se trata, por tanto, de un artefacto de investigación sobre eficiencia de atención y destilación, no de un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder BERT-base con atención `hybrid_attention` (subcuadrática) en las 12 capas |
| Parametros totales | 110 M (BERT-base); el repo solo almacena ~55 MB de pesos de atención y cabeza en FP16 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (hereda la de BERT-base, 512 tokens, aunque no se explicita en la model card) |
| Tipos de cuantizacion | FP16 en los pesos publicados; no se documentan otras cuantizaciones |
| Idiomas soportados | inglés (`en`) |
| Licencia | MIT |
| Formato de pesos | `attention_weights.safetensors` (FP16) + código remoto Python (`trust_remote_code=True`) |

## Arquitectura y entrenamiento

El modelo parte de `bert-base-uncased` (transformer encoder de 12 capas, 768 dimensiones ocultas, 12 cabezas de atención, 110 M de parámetros) y reemplaza la atención multi-cabeza estándar por el mecanismo `hybrid_attention` de NeuralOps, que el autor describe como de complejidad efectiva O(N) u O(N log N). No se detalla en la información disponible la formulación matemática concreta del mecanismo ni la proporción de cabezas o capas que combinan atención lineal con atención softmax.

El entrenamiento sigue el "NeuralOps Cached Representation Distillation Protocol", una destilación en dos etapas (alineamiento de subespacio oculto y luego KL sobre logits más entropía cruzada de la tarea) con el profesor cacheado offline para no ocupar VRAM adicional. Se ejecutó en una única RTX 3090 de 24 GB, con 202 pasos de optimización, 49,7 segundos de entrenamiento, un throughput de 33.298,2 tokens/s y un pico de VRAM de 12.029 MB. El resultado es un ajuste muy somero: la accuracy pasa del 49,08 % (estudiante pre-destilación) al 50,92 % (post-destilación), con una entropía cruzada de validación de 0,7200.

## Capacidades

- Clasificación binaria de sentimiento (positivo/negativo) sobre texto en inglés, formato SST-2.
- Inferencia estándar vía `AutoModelForSequenceClassification` de Transformers con `trust_remote_code=True`.
- Carga modular mediante la API `neuralops.hub` (`load_pretrained_bert`, `load_surgeried_model`), que reconstruye el BERT base congelado y aplica los pesos de atención destilados.
- No soporta generación de texto, tool calling, agentes, razonamiento multi-paso, matemáticas, código, visión ni audio: es un clasificador de secuencias.
- Multilingüismo: no disponible; solo inglés.
- No se documentan modos especiales (thinking, decodificación especulativa ni atención con memoria persistente).

## Casos de uso

- Investigación sobre atención subcuadrática: servir como punto de partida reproducible para comparar `hybrid_attention` frente a MHA estándar en tareas GLUE, dado que el autor publica pesos y protocolo de destilación.
- Experimentos de destilación con profesor cacheado: el protocolo "zero teacher VRAM" permite reproducir el pipeline en una sola GPU de consumo (RTX 3090) con 202 pasos, útil para validar técnicas de KD en entornos con recursos limitados.
- Pruebas de serialización modular de pesos: el repo demuestra cómo distribuir únicamente los parámetros de atención (~55 MB) y reconstruir el modelo completo en carga, patrón aplicable a otros fine-tunes de BERT.
- Benchmarking de infraestructura: con throughput medido de 33.298 tokens/s y pico de 12 GB de VRAM, sirve para calibrar pipelines de entrenamiento en Ampere.
- Docencia y divulgación: ejemplo mínimo de cómo sustituir atención en un transformer preentrenado sin reentrenar desde cero.
- No es adecuado para análisis de sentimiento en producción: su accuracy del 50,92 % en SST-2 equivale prácticamente a una predicción aleatoria en una tarea binaria.

## Benchmarks y rendimiento

Evaluación sobre el split de validación de GLUE SST-2 (872 muestras binarias):

| Metrica | Profesor (`bert-base-uncased`) | Estudiante pre-KD | Modelo destilado |
|---|---|---|---|
| Accuracy SST-2 | 91,63 % | 49,08 % | 50,92 % |
| Entropia cruzada de validacion | 0,2428 | no calibrada | 0,7200 |
| Delta de accuracy | — | — | +1,83 pp |

Telemetría de entrenamiento (RTX 3090, 24 GB): 49,7 s de duración, 202 pasos, 33.298,2 tokens/s, 12.029 MB de VRAM pico.

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo completo en FP16 requiere aproximadamente 220 MB (110 M de parámetros), más overhead de activaciones y tokenizador; en FP32, unos 440 MB.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM libre; el autor entrenó en una RTX 3090 de 24 GB, pero la inferencia cabe holgadamente en GPUs de consumo como RTX 3060, RTX 4060 o incluso en CPU.
- Cabe en GPU de consumo: sí, en todas las NVIDIA modernas y en iGPU con suficiente memoria compartida.
- Opciones de despliegue: `transformers` con `trust_remote_code=True`, la API `neuralops.hub`, y potencialmente `vLLM`/`TGI` si el código remoto es compatible (no verificado). No se documenta soporte para llama.cpp, Ollama ni GGUF.
- Latencia y throughput: no se publican cifras de inferencia; solo el throughput de entrenamiento (33.298,2 tokens/s en RTX 3090).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Accuracy SST-2 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Hooshaai/bert-hybrid-attention-sst2` | 110 M (55 MB publicados) | no disponible | 50,92 % | MIT | Hugging Face |
| `google-bert/bert-base-uncased` (profesor) | 110 M | 512 | 91,63 % (referencia del autor) | Apache 2.0 | Hugging Face |
| `textattack/bert-base-uncased-SST-2` | 110 M | 512 | ~92-93 % (referencia habitual en la literatura; no verificado en esta ficha) | Apache 2.0 | Hugging Face |
| `distilbert-base-uncased-finetuned-sst-2-english` | 66 M | 512 | ~91 % (referencia habitual; no verificado) | Apache 2.0 | Hugging Face |

La comparación es desfavorable en calidad: el checkpoint aquí descrito pierde más de 40 puntos de accuracy frente a su propio profesor y frente a fine-tunes estándar de BERT en SST-2. Su ventaja diferencial es el tamaño de descarga (55 MB frente a ~440 MB) y la complejidad de atención, no el rendimiento predictivo.

## Limitaciones y advertencias

- Rendimiento predictivo prácticamente aleatorio en SST-2 (50,92 % en una tarea binaria), lo que invalida su uso en cualquier aplicación real de análisis de sentimiento.
- Entropía cruzada de validación alta (0,7200) frente al profesor (0,2428), indicando descalibración y falta de convergencia.
- Solo inglés; no hay soporte multilingüe.
- Requiere `trust_remote_code=True`, lo que implica ejecutar código Python del autor en el entorno de inferencia: riesgo de seguridad a auditar antes de desplegar.
- Dependencia de la librería NeuralOps y de la reconstrucción en carga desde `bert-base-uncased`; si el repo base desaparece o cambia, el modelo deja de cargar.
- Licencia MIT permite uso comercial, pero el estado del modelo hace inviable ese escenario.
- Sesgos heredados de `bert-base-uncased` (corpus BookCorpus + Wikipedia en inglés) y de SST-2 (reseñas de cine), no evaluados por el autor.
- Riesgo de alucinación no aplicable en sentido estricto (clasificador), pero sí de predicciones erráticas por descalibración.
- No se documentan límites de contexto explícitos ni comportamiento con secuencias largas; se asume el máximo de 512 tokens de BERT-base.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Hooshaai/bert-hybrid-attention-sst2
- Modelo base: https://huggingface.co/bert-base-uncased
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Licencia MIT del proyecto: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset GLUE / SST-2: https://huggingface.co/datasets/glue
