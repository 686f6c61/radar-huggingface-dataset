# Hooshaai/bert-comp-swift-svd-sst2

## Resumen

`bert-comp-swift-svd-sst2` es un checkpoint de BERT-Base comprimido mediante la técnica `swift_svd` (SVD truncada de forma cerrada y distribución simétrica de valores singulares) e "injertado" con adaptadores LoRA para recuperar parte de la precisión perdida. Lo publica el usuario Hooshaai dentro del ecosistema NeuralOps (repositorio `tahamajs/NeuralOps`), una librería orientada a compresión de modelos. El modelo parte de `google-bert/bert-base-uncased` afinado sobre GLUE SST-2 y se serializa a un rango `k=256`, lo que reduce los parámetros de 109,48 M a 67,03 M (un 38,8 % menos, ratio físico de 1,63x).

El problema que aborda es el de la compresión agresiva de clasificadores BERT manteniendo un despliegue viable: el checkpoint empaquetado ocupa unos 128 MB y se distribuye como `pytorch_model.bin` junto con la configuración y telemetría de compresión. Es relevante como ejemplo reproducible de un pipeline de compresión con evaluación Pareto multi-rango (k=256, 128, 64, 32) sobre un conjunto de validación de 872 muestras.

La contrapartida es importante: la precisión final en SST-2 es del 75,80 %, frente al 91,63 % del profesor original, una pérdida de paridad de 15,83 puntos. Es, por tanto, un artefacto de investigación y demostración de compresión, no un sustituto directo del BERT-Base afinado en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder BERT-Base (12 capas, dimensión oculta 768) comprimido con SVD truncada (`swift_svd`) y adaptadores LoRA |
| Parametros totales | 67.034.882 (checkpoint comprimido, k=256); modelo base original: 109.483.778 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (BERT-Base estándar, típicamente 512 tokens; no confirmado en la información) |
| Tipos de cuantizacion | No disponible (el checkpoint se distribuye en precisión completa como `pytorch_model.bin`) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | MIT |
| Formato de pesos | PyTorch (`pytorch_model.bin`), más `config.json`, `compression_summary.json` y assets del tokenizador |

## Arquitectura y entrenamiento

El modelo base es BERT-Base uncased: un transformer encoder de 12 capas con 768 dimensiones ocultas y 109.483.778 parámetros, afinado previamente sobre GLUE SST-2. Sobre ese checkpoint se aplica `SwiftSVDCompressor`, que realiza una SVD truncada de forma cerrada con distribución simétrica de valores singulares de raíz cuadrada, conservando los `k=256` componentes principales por capa. Esto rebaja el recuento a 67.034.882 parámetros y un ratio de compresión físico de 1,633x.

Cuando la compresión zero-shot degrada la precisión más de 2,0 puntos con una reducción superior a 1,10x, NeuralOps aplica un "healing" con LoRA de rango `r=8` durante 50 pasos con `lr=2e-4` y un presupuesto de 45 segundos. En el rango empaquetado, el zero-shot daba 59,52 % y el healing LoRA lo eleva a 75,80 %. La evaluación multi-rango se ejecutó físicamente en una NVIDIA GeForce RTX 3090 (24 GB) sobre las 872 muestras de validación de SST-2. No se detalla en la información disponible la composición exacta del dataset de entrenamiento más allá de GLUE SST-2, ni si hubo RLHF/DPO (no aplicable en un clasificador).

## Capacidades

- Clasificación de sentimiento binaria (0 = negativo, 1 = positivo) sobre texto en inglés, con dos etiquetas de salida.
- Clasificación de secuencias genérica: la cabeza `BertForSequenceClassification` es reemplazable, aunque el checkpoint está afinado específicamente para SST-2.
- Comprensión de lenguaje natural en inglés derivada del preentrenamiento de BERT-Base uncased.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni comportamiento agéntico.
- No dispone de modo "thinking", visión, audio ni multimodalidad.
- Capacidad multilingüe limitada al inglés (el vocabulario uncased es mayoritariamente inglés).

## Casos de uso

- Clasificación de sentimiento en reseñas de producto: el modelo recibe un texto corto en inglés y devuelve la polaridad; útil como baseline comprimido en entornos con presupuesto de memoria muy ajustado.
- Filtrado de comentarios en foros o redes: se puede desplegar en CPU para preclasificar mensajes positivos/negativos antes de un análisis más profundo, dado el reducido tamaño del checkpoint (128 MB).
- Etiquetado débil en pipelines de datos: usar el modelo comprimido para preanotar grandes volúmenes de texto y reservar el modelo profesor (91,63 %) para la revisión de casos dudosos.
- Demostración y docencia de compresión de modelos: el repositorio incluye `compression_summary.json` con la telemetría de los rangos k=256/128/64/32, lo que permite reproducir el análisis Pareto en un portátil con GPU consumer.
- Pruebas de regresión en CI de herramientas de compresión: sirve como caso de referencia para validar que un pipeline de SVD + LoRA healing produce el estado esperado.
- Inferencia en dispositivos edge sin GPU: al ocupar 128 MB en pesos y ser un encoder de 12 capas, puede ejecutarse en CPU con latencias de milisegundos por muestra corta (estimación no verificada en la información).

## Benchmarks y rendimiento

Resultados declarados por el autor (no verificados) sobre GLUE SST-2, split de validación (872 muestras):

| Modelo / rango | Ratio físico | Params comprimidos | Zero-shot | Con LoRA healing | Paridad vs profesor |
|---|---:|---:|---:|---:|---:|
| Profesor (`bert-base-uncased` SST-2) | 1,00x | 109.483.778 | — | 91,63 % | 0,00 |
| **`k=256` (empaquetado)** | 1,63x | 67.034.882 | 59,52 % | **75,80 %** | −15,83 |
| `k=128` | 2,39x | 45.792.002 | 52,41 % | 61,47 % | −30,16 |
| `k=64` | 3,11x | 35.170.562 | 51,38 % | 50,92 % | −40,71 |
| `k=32` | 3,67x | 29.859.842 | 50,00 % | 68,12 % | −23,51 |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB en FP32 para el checkpoint comprimido (67 M parámetros × 4 bytes ≈ 268 MB de pesos, más activaciones); en la práctica cabe holgadamente en cualquier GPU con 4 GB o más.
- GPU recomendadas: RTX 3090 (usada por el autor para la evaluación), RTX 4090, A100 o H100 para lotes grandes; cualquier GPU consumer moderna (RTX 3060 en adelante) es suficiente.
- Cabe en GPU consumer: sí, en todas las GPU con al menos 2-4 GB de VRAM; también en CPU.
- Opciones de despliegue: el modelo requiere la librería `neuralops` para reconstruir la topología comprimida antes de cargar el `state_dict`. No se documenta compatibilidad directa con vLLM, llama.cpp, Ollama o TGI; el flujo indicado es PyTorch + Transformers + NeuralOps.
- Latencia y throughput: no disponibles en la información proporcionada. El autor reporta un presupuesto de 45 segundos para el healing LoRA en RTX 3090, pero no cifras de inferencia.

## Comparativa con modelos similares

| Modelo | Params | Contexto | SST-2 (val) | Licencia | Disponibilidad |
|---|---|---:|---:|---|---|
| `Hooshaai/bert-comp-swift-svd-sst2` (k=256) | 67,03 M | No disponible | 75,80 % | MIT | Hugging Face (45 descargas) |
| `google-bert/bert-base-uncased` (profesor SST-2) | 109,48 M | 512 | 91,63 % | Apache 2.0 (modelo base) | Hugging Face |
| `distilbert-base-uncased-finetuned-sst-2-english` | ~66 M | 512 | No disponible en esta ficha | Apache 2.0 | Hugging Face |
| `textattack/bert-base-uncased-SST-2` | 109,48 M | 512 | No disponible en esta ficha | Apache 2.0 | Hugging Face |

La comparación más directa es con DistilBERT afinado en SST-2, que ofrece un tamaño similar (~66 M) sin la penalización de precisión documentada aquí; no obstante, no se dispone de cifras verificadas de ese modelo en la información proporcionada, por lo que la comparación cuantitativa queda incompleta.

## Limitaciones y advertencias

- Pérdida de precisión severa: 75,80 % frente al 91,63 % del profesor, una caída de 15,83 puntos que lo aleja del estado del arte en SST-2.
- El healing LoRA no es monótono con el rango: k=32 (68,12 %) supera a k=64 (50,92 %) y k=128 (61,47 %), lo que sugiere inestabilidad del procedimiento y dificulta elegir un punto de operación fiable.
- Solo inglés: el vocabulario uncased y el dataset de ajuste limitan su uso a texto en inglés.
- Riesgo de alucinación no aplicable en sentido estricto (es un clasificador), pero sí riesgo de clasificaciones erróneas en dominios distintos de SST-2 (reseñas de películas).
- La licencia MIT del checkpoint no exime de las obligaciones de la licencia del modelo base (`google-bert/bert-base-uncased`, Apache 2.0); conviene revisar ambas.
- Requiere la librería `neuralops` y una reconstrucción manual de la topología antes de cargar los pesos; no es un checkpoint "plug-and-play" con `AutoModel.from_pretrained` estándar.
- El repositorio tiene 45 descargas y 0 likes, sin verificación independiente de los resultados (`verified: false` en el model-index).
- Los identificadores del README (`tahamajs/...`) no coinciden con el ID real del repositorio (`Hooshaai/...`), lo que puede provocar errores en los scripts de ejemplo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Hooshaai/bert-comp-swift-svd-sst2
- Modelo base: https://huggingface.co/google-bert/bert-base-uncased
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Implementación de `swift_svd`: https://github.com/tahamajs/NeuralOps/blob/main/neuralops/compression/svd/swift_svd.py
- Licencia NeuralOps: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset GLUE SST-2: https://huggingface.co/datasets/nyu-mll/glue
