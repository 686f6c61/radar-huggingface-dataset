# ezuk/distilbert-rotten-tomatoes

## Resumen

distilbert-rotten-tomatoes es un modelo de clasificación de texto obtenido mediante ajuste fino (fine-tuning) de distilbert-base-uncased, la versión destilada de BERT desarrollada originalmente por Hugging Face. Lo publica el usuario ezuk en Hugging Face bajo licencia Apache 2.0. El nombre sugiere que se ha entrenado sobre reseñas de la web Rotten Tomatoes, aunque la model card no confirma el dataset utilizado ni la tarea exacta de clasificación.

Se trata de un modelo encoder-only de tipo transformer con 66.955.010 parámetros, derivado de la arquitectura DistilBERT, que reduce BERT-base a seis capas y aproximadamente la mitad de parámetros manteniendo en torno al 97 % del rendimiento de su modelo original en tareas de comprensión del lenguaje. Su utilidad práctica es limitada: la model card es automática, no declara métricas, no especifica el conjunto de datos ni el número de etiquetas, y el repositorio registra cero descargas y cero likes en el momento de la consulta.

Es relevante únicamente como artefacto de referencia para quien quiera inspeccionar un ajuste fino ligero de DistilBERT para análisis de sentimiento o clasificación de reseñas, o como punto de partida para reentrenar con un dataset documentado. No debe considerarse un modelo listo para producción sin una evaluación previa propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-only (DistilBERT, 6 capas, destilado de BERT-base) |
| Parametros totales | 66.955.010 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 512 tokens (límite estándar de la arquitectura DistilBERT; no declarado explícitamente en la model card) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; admite cuantización dinámica estándar de PyTorch, no documentada por el autor) |
| Idiomas soportados | no disponible (el modelo base es uncased en inglés, pero el autor no lo declara) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning de distilbert-base-uncased, un transformer encoder-only de 6 capas y 66,9 millones de parámetros que emplea tokenización WordPiece sin distinción de mayúsculas y atención multi-cabeza estándar. DistilBERT se obtuvo por destilación de conocimiento de BERT-base, con lo que conserva aproximadamente el 97 % de su rendimiento en GLUE con un 40 % menos de parámetros y una inferencia alrededor de un 60 % más rápida.

Los hiperparámetros declarados en la model card son: learning rate 2e-5, batch size de entrenamiento y evaluación de 8, semilla 42, optimizador AdamW con betas (0,9; 0,999) y epsilon 1e-8, scheduler lineal, 2 épocas y `OptimizerNames.ADAMW_TORCH_FUSED`. El dataset de entrenamiento no se especifica ("unknown dataset"), no se documenta ninguna fase de RLHF, DPO ni aumento de datos, y la sección de resultados de entrenamiento está vacía. Las versiones de framework declaradas son Transformers 5.22.1, PyTorch 2.14.1+cu130, Datasets 4.8.5 y Tokenizers 0.23.3.

## Capacidades

- Clasificación de texto por secuencia (pipeline `text-classification`): asigna una etiqueta a una entrada de hasta 512 tokens.
- Análisis de sentimiento o clasificación de reseñas, presumiblemente binaria o multiclase, aunque el número y nombre de etiquetas no se documenta.
- Codificación de representaciones contextuales reutilizables para extracción de características o fine-tuning posterior.
- No soporta generación de texto: es un modelo encoder-only sin cabeza de lenguaje.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni comportamiento de agente.
- No dispone de modo de pensamiento (thinking), visión ni audio.
- Capacidades multilingües no declaradas; el vocabulario uncased del modelo base está orientado al inglés.

## Casos de uso

- Clasificación de reseñas de cine o productos: el modelo puede etiquetar críticas cortas como positivas o negativas, aunque requiere validar previamente el número y significado real de las etiquetas de salida, ya que no están documentadas.
- Filtrado de retroalimentación de usuarios en un foro o tienda: con 66,9 millones de parámetros y contexto de 512 tokens, es adecuado para clasificar mensajes individuales con baja latencia en CPU.
- Etiquetado de datasets a gran escala: sirve como anotador automático preliminar para preetiquetar corpus de reseñas antes de una revisión humana.
- Prototipado rápido en investigación: al ser un ajuste fino ligero y con licencia Apache 2.0, es un punto de partida para experimentos de clasificación de sentimiento con DistilBERT.
- Extracción de embeddings para búsqueda semántica: las representaciones del token `[CLS]` o la media de estados ocultos pueden alimentar índices vectoriales de documentos cortos.
- Base para fine-tuning específico de dominio: el checkpoint puede reentrenarse con un dataset propio documentado, corrigiendo la falta de trazabilidad del ajuste original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El campo `model-index` de la model card declara una lista de resultados vacía y la sección de resultados de entrenamiento no contiene métricas.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: en torno a 270 MB de pesos (66,9 M de parámetros × 4 bytes), más activaciones; cabe holgadamente en cualquier GPU con 1 GB o más.
- VRAM estimada en FP16: aproximadamente 135 MB de pesos.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) e incluso GPUs de gama baja; también funciona en CPU con latencias de milisegundos por secuencia corta.
- Cabe en GPU consumer: sí, en todas las GPU con al menos 1 GB de VRAM, y en la mayoría de sistemas integrados.
- Opciones de despliegue: `transformers` con pipeline de clasificación, Text Embeddings Inference (el repo está marcado como `text-embeddings-inference` y `endpoints_compatible`), ONNX Runtime, TorchScript y cuantización dinámica de PyTorch. No se documenta soporte GGUF ni integración con Ollama o llama.cpp.
- Latencia y throughput: no disponibles; el autor no publica mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ezuk/distilbert-rotten-tomatoes | 66,9 M | 512 tokens | Clasificación de texto (etiquetas no documentadas) | Apache 2.0 | Hugging Face |
| distilbert-base-uncased-finetuned-sst-2-english | 67 M | 512 tokens | Análisis de sentimiento binario (SST-2) | Apache 2.0 | Hugging Face, ampliamente usado |
| distilbert-base-uncased | 66,9 M | 512 tokens | Modelo base sin cabeza de tarea | Apache 2.0 | Hugging Face |
| bert-base-uncased | 110 M | 512 tokens | Modelo base sin cabeza de tarea | Apache 2.0 | Hugging Face |

La diferencia principal frente a alternativas como `distilbert-base-uncased-finetuned-sst-2-english` es la trazabilidad: el modelo de referencia de Hugging Face documenta dataset, etiquetas y métricas en SST-2, mientras que este checkpoint no aporta ninguno de esos datos. En parámetros y contexto son equivalentes.

## Limitaciones y advertencias

- La model card es automática y no documenta el dataset, el número de etiquetas ni el significado de las clases de salida; usar el modelo sin inspeccionar `config.json` puede producir interpretaciones erróneas.
- No se han publicado métricas de evaluación, por lo que se desconoce su precisión real y su comportamiento fuera de la distribución de entrenamiento.
- Riesgo de alucinación no aplica en sentido generativo, pero sí de clasificaciones erróneas o sobreconfiadas en entradas ambiguas, sarcásticas o fuera de dominio.
- El modelo base es uncased y orientado al inglés; el rendimiento en castellano u otros idiomas no está garantizado ni documentado.
- Límite de 512 tokens por secuencia; textos más largos requieren truncado o segmentación.
- Sesgos heredados de distilbert-base-uncased (corpus WebText, Wikipedia y BookCorpus), sin auditoría conocida en este ajuste fino.
- Licencia Apache 2.0 permite uso comercial, pero la falta de documentación sobre el dataset de entrenamiento impide verificar la procedencia de los datos y posibles restricciones asociadas a Rotten Tomatoes.
- Cero descargas y cero likes en el momento de la consulta: no hay evidencia de uso comunitario ni de validación externa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ezuk/distilbert-rotten-tomatoes
- Modelo base: https://huggingface.co/distilbert/distilbert-base-uncased
- Paper de DistilBERT: https://arxiv.org/abs/1910.01108
- Paper de BERT: https://arxiv.org/abs/1810.04805
- Documentación de Transformers para clasificación de texto: https://huggingface.co/docs/transformers/tasks/sequence_classification
