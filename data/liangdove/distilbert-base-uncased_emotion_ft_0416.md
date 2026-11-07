# liangdove/distilbert-base-uncased_emotion_ft_0416

## Resumen

`liangdove/distilbert-base-uncased_emotion_ft_0416` es un modelo de clasificación de texto obtenido mediante fine-tuning de `distilbert-base-uncased` sobre un corpus de emociones no especificado por el autor. Lo publica el usuario de Hugging Face `liangdove` bajo licencia Apache 2.0. El modelo resuelve la tarea de asignar una etiqueta de emoción a un texto corto, un caso de uso clásico en análisis de opiniones, moderación de contenido y monitorización de conversaciones.

Técnicamente es un transformer encoder de tipo BERT destilado, con 66.958.086 parámetros (aproximadamente 67 M) y un tamaño de repositorio de 0,5 GB en formato safetensors. La arquitectura es la de DistilBERT: 6 capas, 12 cabezas de atención y una dimensión oculta de 768, con un tokenizador WordPiece en minúsculas (uncased) y una ventana de contexto efectiva de 512 tokens. Sobre esa base se ha añadido una cabeza de clasificación de secuencia, cuyos pesos no se detallan en la model card.

La relevancia de esta ficha es doble. Por un lado, ejemplifica el flujo típico de fine-tuning ligero con `Trainer` de Hugging Face para una tarea downstream concreta. Por otro, sirve como advertencia: la model card está generada automáticamente, no documenta el dataset, las etiquetas ni métricas de evaluación, y el modelo acumula muy pocas descargas (6) y un único "like", lo que desaconseja su uso en producción sin una validación previa por parte del equipo que lo adopte.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo BERT destilado (DistilBERT) |
| Parametros totales | 66.958.086 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 512 tokens (límite estándar de DistilBERT; no confirmado explícitamente en la model card) |
| Tipos de cuantizacion | no disponible (solo se publican pesos safetensors en fp32) |
| Idiomas soportados | no disponible (el modelo base es uncased en inglés; el autor no declara idiomas) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `distilbert-base-uncased`, un encoder transformer de 6 capas, 12 cabezas de atención y 768 dimensiones ocultas, destilado de BERT-base mediante destilación de conocimiento (soft targets de las distribuciones de salida del profesor, además de la pérdida supervisada). Sobre esa base se ha añadido una cabeza de clasificación de secuencia para la tarea de emociones, con un número de etiquetas que la model card no especifica.

El fine-tuning se realizó con la librería `Trainer` de Transformers 4.57.5, PyTorch 2.9.1+cu128, Datasets 4.5.0 y Tokenizers 0.22.2. Los hiperparámetros declarados son: learning rate 2e-05, batch size de entrenamiento y evaluación de 64, 4 épocas, optimizador `adamw_torch_fused` con betas (0,9; 0,999) y epsilon 1e-08, scheduler lineal y semilla 42. No se documenta el dataset de entrenamiento, su tamaño, la composición de etiquetas, si hubo validación cruzada ni si se aplicaron técnicas de aumento de datos. Tampoco se indica ningún mecanismo de RLHF, DPO o decodificación especulativa, algo esperable en un encoder de clasificación.

## Capacidades

- Clasificación de texto en una única pasada (single-label o multi-label, según la cabeza entrenada, no confirmado).
- Etiquetado de emociones en textos cortos, presumiblemente en inglés por herencia del modelo base uncased.
- Inferencia rápida y de bajo coste: 67 M de parámetros permiten ejecución en CPU con latencias de milisegundos por muestra.
- Compatible con el pipeline `text-classification` de Transformers y con `text-embeddings-inference` según los tags del repositorio.
- No soporta generación de texto, tool calling, razonamiento multi-paso, agentes, visión, audio ni modo "thinking".
- Capacidades multilingües: no declaradas; el tokenizador uncased de DistilBERT está orientado a inglés.

## Casos de uso

- Análisis de sentimiento y emoción en reseñas de producto: el modelo puede clasificar reseñas cortas en categorías emocionales para agregarlas en dashboards, siempre que se valide antes sobre el dominio concreto.
- Moderación de contenido en foros o chats: filtrado de mensajes con carga emocional negativa para su revisión humana, aprovechando el bajo coste de inferencia en CPU.
- Monitorización de atención al cliente: etiquetado automático de transcripciones de tickets o correos para detectar frustración o satisfacción y priorizar colas.
- Enriquecimiento de datasets para investigación en psicología computacional: etiquetado masivo de corpus textuales con categorías emocionales, con la cautela de que el modelo no documenta su esquema de etiquetas.
- Clasificación en pipelines de streaming: con 67 M de parámetros cabe en una sola GPU consumer o incluso en CPU, lo que permite procesar lotes grandes con `text-embeddings-inference` o `transformers` en servidores modestos.
- Baseline para experimentos de fine-tuning: sirve como punto de partida y comparación frente a modelos de emoción más grandes y documentados (RoBERTa, DeBERTa, XLM-R) en tareas de clasificación de emociones.
- Preetiquetado en anotación humana: generación de etiquetas preliminares que los anotadores revisan, reduciendo el coste de proyectos de etiquetado emocional.

## Benchmarks y rendimiento

El campo `model-index` de la model card está vacío (`results: []`) y el autor no publica ninguna métrica de evaluación (accuracy, F1, precisión/recall por clase). No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 0,27 GB solo para pesos (67 M × 4 bytes), más overhead de activaciones y tokenizador; en la práctica menos de 1 GB.
- VRAM estimada en fp16: aproximadamente 0,14 GB para pesos.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM (GTX 1650, T4, RTX 3060, RTX 4090, A100, H100); el modelo no aprovecha GPUs de gama alta por su reducido tamaño.
- Cabe holgadamente en GPU consumer e incluso en CPU; es viable en entornos edge y en contenedores sin GPU.
- Opciones de despliegue: `transformers` (pipeline `text-classification`), `text-embeddings-inference` (según tags), ONNX Runtime tras exportación, y servidores de inferencia genéricos compatibles con safetensors. No se han publicado pesos GGUF ni recetas para llama.cpp u Ollama.
- Latencia y throughput: no disponibles en la información proporcionada; por el tamaño, se espera un throughput alto en CPU y muy alto en GPU, pero no hay cifras oficiales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `liangdove/distilbert-base-uncased_emotion_ft_0416` | 66,96 M | 512 tokens (estándar DistilBERT) | Clasificación de emociones | Apache 2.0 | Hugging Face, 6 descargas |
| `distilbert-base-uncased` (modelo base) | 66,96 M | 512 tokens | MLM + NSP (preentrenamiento) | Apache 2.0 | Hugging Face, ampliamente usado |
| `bhadresh-savani/distilbert-base-uncased-emotion` | ~67 M | 512 tokens | Clasificación de emociones (6 clases) | Apache 2.0 | Hugging Face, comunidad amplia |
| `j-hartmann/emotion-english-distilroberta-base` | ~82 M | 512 tokens | Clasificación de emociones (7 clases) | MIT | Hugging Face, muy usado |

La comparativa se limita a modelos de tamaño y tarea equivalentes; no se dispone de métricas del modelo evaluado para comparar rendimiento numérico con las alternativas. Las alternativas citadas cuentan con model cards más completas y mayor adopción comunitaria, lo que las hace preferibles como punto de partida en producción.

## Limitaciones y advertencias

- La model card está generada automáticamente y no especifica el dataset de entrenamiento, el esquema de etiquetas ni el número de clases; es imposible saber qué emociones detecta sin inspeccionar el `config.json` o los pesos.
- No se publican métricas de evaluación, por lo que no hay evidencia de calidad ni de generalización fuera del corpus de entrenamiento.
- Riesgo de alucinación no aplica en sentido estricto (es un clasificador), pero sí de falsos positivos y negativos sistemáticos en dominios distintos al de entrenamiento.
- Sesgos: al derivar de `distilbert-base-uncased`, hereda los sesgos de género, raza y origen del corpus inglés de Wikipedia y BookCorpus usado en el preentrenamiento; no se documenta ningún análisis de sesgo.
- Limitación idiomática: el tokenizador uncased y el preentrenamiento en inglés hacen que el rendimiento en castellano u otros idiomas sea previsiblemente pobre.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el autor no ofrece garantías ni soporte; conviene revisar la licencia del dataset de fine-tuning, que no se declara.
- Advertencia para producción: con 6 descargas y 1 "like", el modelo no tiene validación comunitaria; se recomienda evaluarlo contra un conjunto de test propio antes de cualquier despliegue.
- No hay pesos cuantizados publicados ni integración con llama.cpp/Ollama, lo que limita su uso en entornos sin `transformers` o sin ONNX Runtime.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/liangdove/distilbert-base-uncased_emotion_ft_0416
- Perfil del autor: https://huggingface.co/liangdove
- Modelo base: https://huggingface.co/distilbert/distilbert-base-uncased
- Alternativa comparable en emociones (DistilBERT): https://huggingface.co/bhadresh-savani/distilbert-base-uncased-emotion
- Alternativa comparable en emociones (DistilRoBERTa): https://huggingface.co/j-hartmann/emotion-english-distilroberta-base
