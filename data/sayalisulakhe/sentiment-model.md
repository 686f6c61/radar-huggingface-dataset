# sayalisulakhe/sentiment-model

## Resumen

`sentiment-model` es un modelo de clasificación de texto obtenido por ajuste fino (*fine-tuning*) de `distilbert-base-uncased`, la variante destilada de BERT desarrollada por Hugging Face. Lo publica el usuario sayalisulakhe en Hugging Face y su propósito declarado es la clasificación de sentimiento, aunque la model card no especifica el conjunto de datos de entrenamiento ni el esquema de etiquetas utilizado. Con 66.955.779 parámetros y un tamaño de repositorio de 0,3 GB, es un modelo ligero pensado para inferencia rápida en CPU o GPU de gama baja.

Se trata de un artefacto generado automáticamente por el `Trainer` de Transformers, con la model card sin completar ("More information needed" en descripción, usos previstos y datos de entrenamiento). La relevancia práctica es limitada: no hay documentación sobre el corpus, las clases ni el idioma de los datos, y las métricas declaradas (accuracy 0,6598 y F1 macro 0,6493 en el conjunto de evaluación) son modestas para una tarea de clasificación binaria o de pocas clases.

Es relevante únicamente como ejemplo de pipeline de ajuste fino reproducible con la librería Transformers (versión 5.20.2) o como punto de partida para experimentación, no como componente listo para producción. Cualquier evaluación seria requiere validar el modelo contra un conjunto de datos propio y verificar el esquema de etiquetas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder (DistilBERT, destilación de BERT) |
| Parámetros totales | 66.955.779 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (DistilBERT base admite hasta 512 tokens; no confirmado en la model card) |
| Tipos de cuantización | no disponible (compatible con cuantización dinámica de PyTorch y con conversión a ONNX; no documentado por el autor) |
| Idiomas soportados | no disponible (el modelo base es `uncased` en inglés, pero el autor no declara idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 0,3 GB, compatible con `transformers`) |

## Arquitectura y entrenamiento

La arquitectura es un transformer encoder de tipo DistilBERT: 6 capas, 12 cabezas de atención y dimensión oculta de 768, destilado a partir de BERT-base. Sobre esta base se añade una cabeza de clasificación de secuencias (`text-classification`) entrenada con el `Trainer` de Transformers. No hay innovaciones arquitectónicas propias: el modelo es un ajuste fino estándar.

El entrenamiento se realizó durante 3 épocas con `learning_rate=2e-05`, `train_batch_size=32`, `eval_batch_size=32`, semilla 42, optimizador AdamW fused con betas (0,9; 0,999) y epsilon 1e-08, y scheduler lineal. El conjunto de datos es desconocido ("on an unknown dataset"), al igual que su composición, tamaño y número de tokens. No se documenta RLHF, DPO ni ninguna técnica de alineación. El número total de pasos registrados (174) sugiere un conjunto de entrenamiento pequeño, del orden de unos pocos miles de ejemplos.

## Capacidades

- Clasificación de texto por secuencia completa (`text-classification`), orientada a sentimiento según el nombre del modelo.
- Inferencia rápida gracias a su tamaño reducido (67 M de parámetros) y a la arquitectura DistilBERT.
- Compatible con la API `pipeline("text-classification")` de Transformers y con `endpoints_compatible`.
- No soporta generación de texto, razonamiento, código, matemáticas ni visión.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- Capacidades multilingües no declaradas; el modelo base es de vocabulario inglés en minúsculas.
- No dispone de modo *thinking*, visión, audio ni ninguna capacidad multimodal.

## Casos de uso

- Clasificación de sentimiento en reseñas o comentarios en inglés: se puede invocar con `pipeline("text-classification")` sobre textos cortos; adecuado por su bajo coste computacional, aunque requiere validar previamente el esquema de etiquetas, que no está documentado.
- Filtrado de comentarios en foros o sistemas de moderación: el modelo puede etiquetar grandes volúmenes de texto en CPU con throughput alto, pero la accuracy declarada (0,66) obliga a usarlo como primera etapa de triaje con revisión humana posterior.
- Prototipado rápido de pipelines de NLP: sirve como baseline reproducible para comparar con modelos ajustados propios, dado que el autor documenta hiperparámetros y versiones de framework.
- Extracción de señal de sentimiento en analítica de encuestas: útil para agregar respuestas abiertas en inglés a escala, siempre que se valide el rendimiento en el dominio concreto.
- Enseñanza y experimentación con `Trainer`: el repositorio documenta el proceso de ajuste fino con Transformers 5.20.2, PyTorch 2.11.0 y Datasets 4.8.5, lo que lo hace útil como ejemplo didáctico.
- Preetiquetado en anotación semiautomática: puede generar etiquetas iniciales para que anotadores humanos las corrijan, reduciendo coste en proyectos de creación de datasets de sentimiento.

## Benchmarks y rendimiento

El autor declara los siguientes resultados en el conjunto de evaluación (no se especifica el dataset):

| Métrica | Valor |
|---|---|
| Loss (evaluación) | 0,7470 |
| Accuracy | 0,6598 |
| F1 weighted | 0,6493 |
| F1 macro | 0,6493 |

Evolución durante el entrenamiento:

| Época | Paso | Training loss | Validation loss | Accuracy | F1 weighted | F1 macro |
|---|---|---|---|---|---|---|
| 1.0 | 58 | 1,0498 | 0,8737 | 0,6080 | 0,5529 | 0,5529 |
| 2.0 | 116 | 0,8304 | 0,7226 | 0,6975 | 0,6881 | 0,6881 |
| 3.0 | 174 | 0,6785 | 0,7117 | 0,6821 | 0,6736 | 0,6736 |

No se han publicado resultados de benchmarks estándar (MMLU, GLUE, SST-2, etc.) en la información disponible. El `model-index` de la model card está vacío.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 0,27 GB de pesos, más activaciones; en la práctica menos de 1 GB.
- VRAM estimada en fp16 o cuantización dinámica: por debajo de 0,2 GB de pesos.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; funciona en RTX 3060, RTX 4090, T4, A10, A100 y H100 sin problema.
- Cabe holgadamente en GPU de consumo e incluso en CPU; es viable en entornos sin GPU.
- Opciones de despliegue: `transformers` (PyTorch), `optimum`/ONNX Runtime, TorchScript, y servidores de inferencia compatibles con `text-classification` (por ejemplo, Hugging Face Inference Endpoints). No se documenta soporte explícito de vLLM, TGI o llama.cpp (este último no aplica a arquitecturas encoder).
- Latencia y throughput: no disponibles en la información proporcionada; por el tamaño del modelo se espera un throughput alto en CPU y muy alto en GPU, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento declarado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| sayalisulakhe/sentiment-model | 66,9 M | no disponible (base: 512) | Accuracy 0,6598; F1 0,6493 (dataset no especificado) | Apache 2.0 | Hugging Face, 16 descargas |
| distilbert-base-uncased-finetuned-sst-2-english | ~67 M | 512 tokens | Métricas publicadas en la model card original (SST-2) | Apache 2.0 | Hugging Face, ampliamente usado |
| roberta-base (ajustado para sentimiento) | ~125 M | 512 tokens | Depende del ajuste fino | MIT | Hugging Face |
| bert-base-uncased (ajustado para sentimiento) | ~110 M | 512 tokens | Depende del ajuste fino | Apache 2.0 | Hugging Face |

La comparación directa con alternativas es difícil porque este modelo no documenta el dataset de evaluación ni el esquema de etiquetas. Los modelos de referencia de la familia DistilBERT/BERT ajustados sobre SST-2 tienen métricas públicas y reproducibles, mientras que aquí solo se dispone de una accuracy de 0,66 sobre un conjunto no identificado.

## Limitaciones y advertencias

- Model card incompleta: no se documentan el dataset, las etiquetas, el idioma ni los usos previstos; cualquier uso en producción exige validación propia.
- Accuracy declarada de 0,6598 y F1 macro de 0,6493: rendimiento modesto que sugiere un problema de clasificación con más de dos clases o un dataset ruidoso.
- Riesgo de alucinación no aplica en sentido estricto (no genera texto), pero sí de clasificaciones erróneas y sesgos heredados del corpus de entrenamiento, que se desconoce.
- El modelo base es `uncased` en inglés: el vocabulario y el preentrenamiento están orientados al inglés, por lo que el rendimiento en castellano u otros idiomas es dudoso y no está evaluado.
- Longitud de contexto limitada por la arquitectura DistilBERT (512 tokens en el modelo base), aunque el autor no la declara.
- Licencia Apache 2.0: permite uso comercial, pero al no documentarse el dataset de entrenamiento no se puede garantizar la ausencia de datos con restricciones.
- Solo 16 descargas y 0 likes: sin validación por parte de la comunidad; no hay evidencia de uso en producción.
- Sin resultados en benchmarks estándar ni en el `model-index`: no es posible comparar de forma rigurosa con alternativas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sayalisulakhe/sentiment-model
- Modelo base DistilBERT: https://huggingface.co/distilbert-base-uncased
- Documentación de Transformers para clasificación de texto: https://huggingface.co/docs/transformers/tasks/sequence_classification
- Documentación del `Trainer` de Transformers: https://huggingface.co/docs/transformers/main_classes/trainer
