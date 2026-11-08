# ArtTolston/longformer-base-pruner-hotpotqa_musique

## Resumen

Longformer chunk pruner for Q-RAG es un modelo derivado de `allenai/longformer-base-4096` desarrollado por el usuario ArtTolston. No es un modelo generativo ni un sistema de question answering completo: es un componente de poda (pruning) de chunks para cadenas de recuperación del sistema Q-RAG. Dada una pregunta y una secuencia ordenada de fragmentos recuperados, el modelo asigna a cada chunk una probabilidad `p_keep` que indica si debe conservarse o descartarse antes de pasarlo al generador de respuestas.

La arquitectura es un Longformer-base con un cabezal lineal de clasificación por chunk, con un total de 148.660.225 parámetros. El backbone completo más el cabezal se almacenan en `model.safetensors`, pero el modelo requiere un loader propio (`inference.py`) incluido en el repositorio, ya que no se ajusta a la interfaz estándar de clasificación de secuencias de Transformers.

Su relevancia práctica es acotada pero específica: en pipelines RAG multi-hop, reducir el número de chunks que llegan al generador disminuye el coste en tokens y el ruido contextual. El autor reporta una mejora de F1 de soporte de 0,5149 a 0,9546 sobre una muestra de 300 preguntas, a costa de reducir la cobertura de todos los hechos dorados del 0,9800 al 0,8867.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Longformer (transformer con atención local de ventana deslizante + atención global) con cabezal lineal de poda por chunk |
| Parametros totales | 148.660.225 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 4.096 tokens (pregunta hasta 128 tokens, cada chunk hasta 512 tokens) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `allenai/longformer-base-4096` (revisión `301e6a42cb0d9976a6d6a26a079fef81c18aa895`), un transformer tipo BERT inicializado desde RoBERTa y preentrenado con MLM sobre documentos largos, que combina atención local de ventana deslizante con atención global en tokens seleccionados para escalar linealmente con la longitud de secuencia. Sobre ese backbone se añade un cabezal de mean-pooling por chunk seguido de una capa lineal que produce una probabilidad de conservación por fragmento.

El entrenamiento utiliza el dataset `Q-RAG/Hotpotqa_and_Musique` (revisión `869188e85245c8ff5107f11b2d9ce24fd2bd953a`), con 90.447 ejemplos de entrenamiento de HotpotQA y 19.938 de MuSiQue. El retriever está congelado (`Q-RAG/qrag-ft-gte-on-hotpotqa_musique`, SHA-256 `ff2ab1db095fe05f0f854672a224e9dff6ff0a9a8ecda5cf35cdf88a94d37c56`). El objetivo es entropía cruzada binaria enmascarada: los chunks dorados de soporte se etiquetan como keep y el resto de chunks recuperados como drop. Se entrenó durante tres épocas con learning rate 2e-5, AdamW con weight decay 0,01, semilla 42, FP32, batch size 8 y acumulación 1 (reanudado desde el paso 500). El checkpoint seleccionado corresponde al paso de optimizador 38.900, elegido por el mayor F1 de hechos de soporte podados a umbral 0,5 entre muestras periódicas de validación.

La ensambladura de la secuencia reproduce el formato de entrenamiento: `[CLS] pregunta [SEP] chunk_1 [SEP] ... [SEP] chunk_H`, sin separador final, con atención global sobre `[CLS]` y los tokens de la pregunta. Los chunks que no caben en el presupuesto de tokens reciben probabilidad `None` y se excluyen. Durante el entrenamiento, Q-RAG produjo hasta seis chunks greedy distintos sin usar etiquetas doradas; el modelo no realiza recuperación.

## Capacidades

- Puntuación de conservación (`p_keep`) por chunk recuperado, con umbral por defecto de 0,5.
- Poda de cadenas de recuperación multi-hop antes de la generación de respuestas.
- Procesamiento de secuencias largas de hasta 4.096 tokens combinando pregunta y múltiples chunks.
- Manejo de chunks que exceden el presupuesto de tokens mediante exclusión explícita (probabilidad `None`).
- Integración con el pipeline Q-RAG como etapa de reranking/purning entre el retriever y el generador.
- No realiza recuperación, generación de texto, tool calling, razonamiento multi-paso ni otras tareas de QA de forma autónoma.

## Casos de uso

- Reducción de contexto en pipelines RAG multi-hop: insertar el pruner entre el retriever de Q-RAG y el LLM generador para descartar chunks irrelevantes y reducir el número de tokens enviados al modelo final, con el consiguiente ahorro de coste y latencia.
- Mejora de precisión en respuestas sobre HotpotQA y MuSiQue: al filtrar chunks ruidosos, el generador recibe un contexto más limpio, lo que según el autor eleva el F1 de soporte de 0,5149 a 0,9546 en la muestra de validación.
- Control de ventana de contexto en despliegues con límites estrictos: cuando la cadena de recuperación supera el presupuesto del generador, el pruner selecciona qué fragmentos conservar en lugar de truncar arbitrariamente.
- Evaluación y depuración de retrievers: las probabilidades `p_keep` permiten inspeccionar qué chunks considera útiles el modelo y detectar problemas en la cadena de recuperación.
- Sistemas de documentación técnica con múltiples fuentes: filtrar pasajes recuperados de manuales o bases de conocimiento antes de responder consultas que requieren combinar información de varios documentos.
- Investigación en RAG: servir como componente reproducible para experimentos de poda de contexto, ya que el repositorio incluye el loader y los metadatos de entrenamiento (`training_metadata.json`).

## Benchmarks y rendimiento

Métricas reportadas por el autor sobre un subconjunto de evaluación combinado de HotpotQA + MuSiQue de 300 preguntas remuestreadas, usado para seleccionar el checkpoint:

| Metrica | Pruner (umbral 0,5) | Cadena Q-RAG sin podar |
|---|---|---|
| F1 de hechos de soporte | 0,9546 | 0,5149 |
| Cobertura de todos los hechos dorados | 0,8867 | 0,9800 |
| Precision | 0,9666 | no disponible |
| Recall | 0,9492 | no disponible |
| ROC-AUC (micro, chunks visibles) | 0,9948 | no disponible |

El autor advierte que son métricas de selección de checkpoint basadas en muestras, no una evaluación completa e independiente: los checkpoints se seleccionaron repetidamente sobre muestras del mismo pool de evaluación. La cobertura indica que se retuvieron todos los chunks dorados de soporte, no exactitud de respuesta.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: aproximadamente 0,6 GB solo para pesos (148,6 M de parámetros); en FP16 en torno a 0,3 GB. El consumo real depende de la longitud de secuencia (hasta 4.096 tokens) y del batch.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM es suficiente; A100, H100, RTX 4090 o RTX 3090 no son necesarias pero funcionan sin problema.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU consumer moderna (RTX 3060 en adelante) e incluso en CPU para volúmenes moderados.
- Opciones de despliegue: el modelo requiere el loader propio `inference.py` del repositorio; no es compatible directamente con vLLM, TGI ni llama.cpp. Se puede servir con un wrapper propio (FastAPI, etc.) sobre PyTorch.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ArtTolston/longformer-base-pruner-hotpotqa_musique | 148,6 M | 4.096 | Poda de chunks RAG | Apache 2.0 | Hugging Face |
| allenai/longformer-base-4096 | 148,6 M (aprox.) | 4.096 | Modelo base MLM | Apache 2.0 | Hugging Face |
| Q-RAG/qrag-ft-gte-on-hotpotqa_musique | no disponible | no disponible | Retriever congelado del pipeline | no disponible | Hugging Face |

No se dispone de datos de benchmarks de los modelos comparables en la información proporcionada, por lo que no se puede establecer una comparación de rendimiento cuantitativa.

## Limitaciones y advertencias

- No es un modelo de question answering: no genera respuestas, solo puntúa chunks. Requiere un generador aguas abajo.
- No realiza recuperación; depende de que la cadena de chunks provenga de Q-RAG en el orden y formato exactos de entrenamiento.
- Las métricas reportadas son de selección de checkpoint sobre muestras del mismo pool de evaluación, no una evaluación independiente en held-out.
- La poda reduce la cobertura de todos los hechos dorados (de 0,9800 a 0,8867), por lo que puede eliminar información necesaria en preguntas que requieren todos los fragmentos.
- Riesgo de sesgo y alucinación: no evaluado ni documentado en la información disponible; el modelo hereda los sesgos del corpus de preentrenamiento de Longformer y de HotpotQA/MuSiQue.
- Idiomas soportados no documentados; el entrenamiento se realizó sobre datasets en inglés, por lo que el rendimiento en castellano es incierto.
- Requiere código personalizado (`inference.py`) y no es compatible con las interfaces estándar de Transformers, lo que complica su integración en plataformas de serving convencionales.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías sobre el rendimiento en dominios distintos de HotpotQA y MuSiQue.
- El repositorio tiene 0 descargas y 0 likes, sin validación externa de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/ArtTolston/longformer-base-pruner-hotpotqa_musique
- Modelo base: https://huggingface.co/allenai/longformer-base-4096
- Documentación de Longformer en Transformers: https://huggingface.co/docs/transformers/model_doc/longformer
- Dataset: https://huggingface.co/datasets/Q-RAG/Hotpotqa_and_Musique
- Retriever congelado: https://huggingface.co/Q-RAG/qrag-ft-gte-on-hotpotqa_musique
