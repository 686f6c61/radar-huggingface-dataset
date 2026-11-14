# Hooshaai/bert-comp-optimal-subspace-projection-sst2

## Resumen

`bert-comp-optimal-subspace-projection-sst2` es un checkpoint comprimido de `google-bert/bert-base-uncased` fine-tuneado para clasificación de sentimiento en GLUE SST-2 y posteriormente comprimido mediante la técnica `optimal_subspace_projection` (SVD aleatorizado con conciencia de activaciones) del zoo de compresión NeuralOps. El modelo lo publica el usuario Hooshaai dentro del proyecto NeuralOps, una librería de código abierto orientada a compresión de modelos y recuperación mediante LoRA.

El interés del modelo no reside en su rendimiento absoluto, sino en su valor como artefacto de referencia: demuestra un pipeline completo de compresión física (reducción del 38,8 % de parámetros, ratio 1,63x) seguido de un proceso de "healing" con adaptadores LoRA de rango 8 para recuperar parte de la precisión perdida. El checkpoint empaquetado corresponde al rango k=256, el punto de la curva Pareto con mejor equilibrio entre compresión y exactitud.

La arquitectura subyacente es BERT-base (transformer encoder de 12 capas, dimensión oculta 768, 109,48 M de parámetros originales) reducida a 67,02 M de parámetros tras la proyección. El modelo es monolingüe en inglés, está pensado exclusivamente para clasificación binaria de sentimiento y su licencia MIT permite uso comercial sin restricciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (BERT-base) con compresión por proyección de subespacio óptimo (SVD aleatorizado activation-aware) |
| Parametros totales | 67.016.450 (modelo comprimido empaquetado, k=256) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la información proporcionada (BERT-base original: 512 tokens) |
| Tipos de cuantizacion | No disponible (el checkpoint se distribuye en `pytorch_model.bin` en precisión completa) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | MIT |
| Formato de pesos | `pytorch_model.bin` (state dict serializado de PyTorch) con topología comprimida reconstruible vía NeuralOps |

## Arquitectura y entrenamiento

El modelo parte de `google-bert/bert-base-uncased` (109.483.778 parámetros, 12 capas, D=768) ya fine-tuneado sobre GLUE SST-2, con una exactitud de referencia (teacher baseline) del 91,63 % en validación. Sobre ese checkpoint se aplica `OptimalSubspaceProjectionCompressor`, un compresor de la familia SVD que realiza una descomposición en subespacios óptimos guiada por activaciones (randomized SVD activation-aware), reduciendo el rango de las matrices a k=256. El resultado físico es un modelo de 67.016.450 parámetros, lo que supone una reducción del 38,79 % y un ratio de compresión de 1,634x.

Cuando la compresión zero-shot degrada la exactitud más de 2,0 puntos porcentuales con una reducción superior a 1,10x, NeuralOps aplica un "healing" selectivo con LoRA de rango r=8 durante 50 pasos, learning rate 2e-4 y un presupuesto de 45 segundos. En el rango k=256 esto eleva la exactitud del 50,92 % (zero-shot) al 72,59 % (healed) sobre las 872 muestras del split de validación de SST-2, evaluado en una NVIDIA GeForce RTX 3090. El autor documenta además la curva Pareto completa en k=256, 128, 64 y 32, con exactitudes healed de 72,59 %, 72,25 %, 71,22 % y 67,66 % respectivamente.

## Capacidades

- Clasificación binaria de sentimiento (positivo/negativo) sobre texto en inglés, con dos etiquetas de salida.
- Fine-tuning específico sobre GLUE SST-2; no está diseñado como modelo generativo ni de propósito general.
- No soporta tool calling ni function calling: es un `BertForSequenceClassification` puro.
- No soporta razonamiento multi-paso ni comportamiento de agente.
- Capacidad multilingüe limitada al inglés (vocabulario `bert-base-uncased`).
- No dispone de visión, audio ni modo "thinking".
- El checkpoint incluye adaptadores LoRA de healing ya integrados en el state dict, por lo que la inferencia requiere reconstruir la topología comprimida con NeuralOps antes de cargar los pesos.

## Casos de uso

- Análisis de sentimiento en reseñas de producto: el modelo clasifica polaridad positiva/negativa en inglés con un coste de inferencia muy reducido (67 M de parámetros), adecuado para procesar grandes volúmenes de reseñas en batch.
- Moderación de comentarios en comunidades online: filtrado rápido de toxicidad indirecta mediante sentimiento negativo como señal auxiliar, desplegable en CPU por su tamaño contenido.
- Enrutamiento de tickets de soporte: clasificación de quejas frente a feedback positivo para priorizar colas de atención al cliente en inglés.
- Monitorización de reputación de marca: análisis de menciones en redes sociales y prensa anglófona para calcular índices de sentimiento agregados.
- Investigación en compresión de modelos: el checkpoint sirve como referencia reproducible para comparar técnicas SVD, poda y cuantización sobre una tarea estándar (SST-2) con baseline conocido (91,63 % teacher).
- Docencia y experimentación con LoRA: ejemplo práctico de pipeline compresión + healing con hiperparámetros documentados (r=8, 50 pasos, lr=2e-4) para estudiar la recuperación de precisión tras compresión agresiva.
- Despliegue en entornos con recursos limitados: al reducir el modelo a 67 M de parámetros, cabe en dispositivos edge o instancias CPU pequeñas donde BERT-base completo resultaría costoso.

## Benchmarks y rendimiento

Resultados declarados por el autor (no verificados) sobre GLUE SST-2, split de validación (872 muestras):

| Modelo / variante | Ratio compresión | Parámetros | Exactitud SST-2 |
|---|---|---|---|
| Teacher (`bert-base-uncased` fine-tuneado) | 1x | 109.483.778 | 91,63 % |
| Este checkpoint, k=256 (zero-shot) | 1,63x | 67.016.450 | 50,92 % |
| Este checkpoint, k=256 (LoRA healed) | 1,63x | 67.016.450 | 72,59 % |
| Variante k=128 (LoRA healed) | 2,39x | 45.782.786 | 72,25 % |
| Variante k=64 (LoRA healed) | 3,11x | 35.165.954 | 71,22 % |
| Variante k=32 (LoRA healed) | 3,67x | 29.857.538 | 67,66 % |

El checkpoint empaquetado en el repositorio corresponde a k=256 con exactitud healed de 72,59 %, lo que supone un delta de -19,04 puntos frente al teacher.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 para 67 M de parámetros (unos 268 MB de pesos más activaciones y buffers); holgado en cualquier GPU consumer.
- GPU recomendadas: no requiere GPU dedicada; funciona en CPU. En GPU, cualquier tarjeta con 2 GB o más es suficiente (GTX 1650, RTX 3050, RTX 4090, A100, H100).
- Cabe en GPU consumer: sí, en todas las GPU consumer modernas e incluso en iGPU.
- Opciones de despliegue: la carga requiere la librería NeuralOps para reconstruir la topología comprimida antes de aplicar el state dict; no es directamente compatible con vLLM, llama.cpp, Ollama ni TGI sin conversión previa, ya que el formato es un state dict de PyTorch con topología modificada.
- Latencia y throughput: no disponibles en la información proporcionada. El autor reporta que el proceso de healing LoRA completo tarda 45 segundos en una RTX 3090, pero no se publican métricas de inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | SST-2 (val) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (k=256, healed) | 67,02 M | No disponible | 72,59 % | MIT | Hugging Face (repo 0,1 GB) |
| `google-bert/bert-base-uncased` fine-tuneado SST-2 (teacher) | 109,48 M | 512 tokens | 91,63 % | Apache 2.0 | Hugging Face |
| `distilbert-base-uncased-finetuned-sst-2-english` | 66,96 M | 512 tokens | No disponible en esta información | Apache 2.0 | Hugging Face |
| `textattack/bert-base-uncased-SST-2` | 109,48 M | 512 tokens | No disponible en esta información | Apache 2.0 | Hugging Face |

La comparación más directa es con DistilBERT fine-tuneado en SST-2, que tiene un tamaño casi idéntico (66,96 M) pero se obtiene por destilación en lugar de compresión post-hoc; no se dispone de su exactitud en la información proporcionada para contrastar directamente. El teacher BERT-base conserva 19 puntos más de exactitud a cambio de un 63 % más de parámetros.

## Limitaciones y advertencias

- La exactitud de 72,59 % es notablemente inferior al teacher (91,63 %); el delta de -19,04 puntos hace que el modelo no sea adecuado para producción donde se requiera precisión cercana al estado del arte en SST-2.
- El modo zero-shot de la compresión (50,92 %) está prácticamente a nivel de azar; el checkpoint empaquetado depende críticamente de los adaptadores LoRA de healing incluidos.
- La exactitud declarada no está verificada (`verified: false` en el model-index); conviene reproducirla antes de confiar en ella.
- Modelo monolingüe en inglés; no apto para texto en castellano u otros idiomas sin reentrenamiento.
- Es un clasificador de sentimiento, no un modelo generativo: no puede emplearse para resumen, traducción, código ni diálogo.
- Riesgo de sesgos heredados de BERT-base y del corpus SST-2 (reseñas de películas), con posible degradación en dominios distintos (legal, médico, técnico).
- Puede producir clasificaciones erróneas en textos con sarcasmo, negaciones complejas o sentimiento mixto, igual que el modelo original.
- La licencia MIT permite uso comercial, pero el modelo base `bert-base-uncased` está bajo Apache 2.0; conviene revisar la compatibilidad en despliegues comerciales.
- El formato de pesos requiere la librería NeuralOps y una reconstrucción explícita de la topología; no es plug-and-play con `transformers` estándar.
- La model card referencia el repo `tahamajs/bert-comp-optimal-subspace-projection-sst2` mientras que el ID real es `Hooshaai/...`; hay inconsistencia en las rutas de ejemplo que puede provocar errores al copiar el código.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Hooshaai/bert-comp-optimal-subspace-projection-sst2
- Modelo base: https://huggingface.co/google-bert/bert-base-uncased
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Licencia NeuralOps (MIT): https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Implementación del compresor: https://github.com/tahamajs/NeuralOps/blob/main/neuralops/compression/svd/optimal_subspace_projection.py
- Dataset GLUE SST-2: https://huggingface.co/datasets/nyu-mll/glue
