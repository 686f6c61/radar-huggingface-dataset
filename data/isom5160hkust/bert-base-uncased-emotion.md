# ISOM5160HKUST/bert-base-uncased-emotion

## Resumen

`ISOM5160HKUST/bert-base-uncased-emotion` es un modelo de clasificación de texto publicado en Hugging Face por el usuario ISOM5160HKUST. A pesar de su nombre, que sugiere un BERT base, los pesos reales corresponden a una arquitectura DistilBERT: el repositorio incluye la etiqueta `distilbert` y el recuento de parámetros en safetensors es de 66.958.086, cifra coherente con un DistilBERT (6 capas, 66M de parámetros) y no con un BERT base (110M). El modelo está orientado a la clasificación de emociones, presumiblemente mediante fine-tuning sobre un corpus etiquetado.

La model card es la plantilla autogenerada por Hugging Face y no contiene información sustantiva: no documenta el dataset de entrenamiento, los hiperparámetros, las métricas de evaluación ni el procedimiento de fine-tuning. Tampoco declara licencia, idiomas soportados ni uso previsto. Se trata, por tanto, de un artefacto de investigación o de un experimento académico (el identificador sugiere un contexto de curso o proyecto en la HKUST) sin documentación de producción.

Su relevancia es limitada: cuenta con cero descargas y cero likes, y no hay evidencia publicada de su calidad. Resulta útil únicamente como punto de partida para experimentación con clasificación de emociones o como ejemplo de fine-tuning de DistilBERT, nunca como componente crítico en producción sin una evaluación propia previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo DistilBERT (destilado de BERT), 6 capas |
| Parametros totales | 66.958.086 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (DistilBERT admite hasta 512 tokens por diseño, no confirmado en la model card) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; cuantización a int8/fp16 posible vía herramientas estándar) |
| Idiomas soportados | no disponible (el nombre sugiere inglés, no confirmado) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es un encoder transformer tipo DistilBERT, destilado de BERT mediante knowledge distillation, con 6 capas y aproximadamente 66M de parámetros. El modelo base DistilBERT se entrena con los mismos datos que BERT (BookCorpus y Wikipedia en inglés) y retiene en torno al 97 % del rendimiento de BERT con un 40 % menos de parámetros y una inferencia unas dos veces más rápida. Sobre esta base, el autor habría aplicado un fine-tuning para clasificación de emociones.

No obstante, la model card no proporciona ningún detalle sobre el dataset de fine-tuning, el número de épocas, la tasa de aprendizaje, la función de pérdida ni si se empleó alguna técnica de regularización. Tampoco se documenta si el etiquetado de emociones sigue un esquema concreto (por ejemplo, las seis emociones de Ekman: ira, miedo, alegría, tristeza, sorpresa y asco) ni cuántas clases predice la cabeza de clasificación. Toda esta información figura como `[More Information Needed]` en el repositorio.

## Capacidades

- Clasificación de texto: la tarea declarada en el pipeline es `text-classification`, orientada a etiquetar emociones en fragmentos de texto.
- Encoder bidireccional apto para extracción de representaciones: al ser un transformer encoder, sus estados ocultos pueden emplearse como embeddings de frases o documentos.
- Fine-tuning adicional: la cabeza de clasificación puede reemplazarse para adaptar el modelo a otros esquemas de etiquetas.
- Inferencia rápida en CPU: por su tamaño reducido (66M de parámetros), es viable en entornos sin GPU.
- Compatibilidad con text-embeddings-inference y endpoints: el repositorio incluye las etiquetas correspondientes.
- No se documentan capacidades de generación de texto, tool calling, razonamiento multi-paso, visión, audio ni modo de pensamiento; no es un modelo generativo.

## Casos de uso

- Análisis de sentimiento y emociones en redes sociales: el modelo puede clasificar publicaciones o tuits en categorías emocionales para monitorización de opinión pública, siempre que se valide previamente su esquema de etiquetas y su calidad con datos propios.
- Moderación de comunidades: detección de mensajes con carga emocional negativa (ira, hostilidad) como señal auxiliar para sistemas de moderación, combinada con reglas y revisión humana.
- Enrutamiento de tickets de soporte: clasificar el tono emocional de las incidencias entrantes para priorizar casos de frustración o urgencia antes de la asignación a agentes.
- Investigación en psicología computacional: análisis de corpus de texto para estudiar distribuciones emocionales en encuestas abiertas o diarios, con la cautela de que el modelo carece de documentación sobre su dataset de entrenamiento.
- Extracción de embeddings para clustering: usar las representaciones del encoder para agrupar textos por similitud semántica o temática en pipelines de análisis exploratorio.
- Prototipado rápido de clasificadores: punto de partida para fine-tuning sobre dominios específicos (reseñas de producto, correos de clientes) gracias a su reducido coste computacional.
- Clasificación en el borde (edge): despliegue en CPU o dispositivos de bajos recursos para filtrar texto en tiempo real sin dependencia de la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de evaluación (accuracy, F1, matriz de confusión) ni comparaciones con otros modelos, y no hay evidencia pública de su rendimiento en el corpus de emociones utilizado.

## Requisitos de hardware

- VRAM estimada para inferencia: en fp32, aproximadamente 270 MB de pesos (66,96M de parámetros × 4 bytes); en fp16, unos 134 MB; en int8, unos 67 MB. Con overhead de activaciones, el consumo total ronda los 0,5-1 GB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; una RTX 3060, RTX 4090, T4 o incluso una iGPU moderna pueden ejecutarlo sin problemas. Para lotes grandes, una A100 o H100 aportan margen de sobra pero no son necesarias.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU de consumo de los últimos diez años, y también en CPU.
- Opciones de despliegue: `transformers` con `pipeline("text-classification")`, Text Embeddings Inference (TEI), Hugging Face Inference Endpoints, ONNX Runtime y TorchScript. No se distribuyen pesos GGUF, por lo que llama.cpp u Ollama requerirían conversión manual.
- Latencia y throughput estimados: no disponibles en la información proporcionada; por la arquitectura DistilBERT, se espera un throughput alto en CPU y muy alto en GPU, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ISOM5160HKUST/bert-base-uncased-emotion | 66,96M | no disponible | Clasificación de emociones | no disponible | Hugging Face (0 descargas) |
| distilbert-base-uncased-finetuned-sst-2-english | ~67M | 512 tokens | Análisis de sentimiento (2 clases) | Apache 2.0 | Hugging Face (muy popular) |
| bhadresh-savani/distilbert-base-uncased-emotion | ~67M | 512 tokens | Clasificación de emociones (6 clases) | no disponible | Hugging Face (ampliamente usado) |
| j-hartmann/emotion-english-distilroberta-base | ~82M | 512 tokens | Clasificación de emociones (7 clases) | no disponible | Hugging Face (muy usado) |

La comparativa se basa en modelos de la misma familia y tarea; no hay datos de rendimiento del modelo evaluado que permitan una comparación cuantitativa. Los tres alternativos cuentan con documentación de entrenamiento y comunidades de uso activas, a diferencia de este repositorio.

## Limitaciones y advertencias

- Documentación inexistente: la model card es la plantilla autogenerada y no aporta información sobre datos, entrenamiento, evaluación ni uso previsto.
- Licencia no declarada: no se especifica licencia, lo que impide determinar si el uso comercial está permitido; en la práctica, debe tratarse como no autorizado hasta confirmación del autor.
- Idiomas no declarados: el nombre sugiere inglés, pero no hay confirmación; su uso en castellano no está validado.
- Riesgo de sesgos: al derivar de BERT/DistilBERT entrenados con BookCorpus y Wikipedia, hereda sesgos de género, raza y estereotipos presentes en esos corpus, sin que se documente ningún proceso de mitigación.
- Riesgo de alucinación: no aplica en sentido generativo, pero la clasificación puede ser errónea o sobreconfiada en textos ambiguos, irónicos o fuera de dominio.
- Esquema de etiquetas desconocido: se desconoce cuántas clases predice y cuáles son sus nombres, lo que impide interpretar las salidas sin inspeccionar el `config.json` y el mapeo de etiquetas.
- Sin validación empírica: cero descargas y cero likes; no hay evidencia de terceros sobre su calidad.
- No apto para producción sin evaluación: cualquier despliegue debería ir precedido de una evaluación con datos propios y de una revisión del esquema de etiquetas.
- Confusión de nomenclatura: el nombre indica "bert-base" pero los pesos son DistilBERT; conviene verificar la arquitectura real antes de integrarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ISOM5160HKUST/bert-base-uncased-emotion
- Paper de DistilBERT (Sanh et al., 2019): https://arxiv.org/abs/1910.09700
- Paper de BERT (Devlin et al., 2018): https://arxiv.org/abs/1810.04805
- Calculadora de impacto ambiental citada en la model card: https://mlco2.github.io/impact
- Documentación de Transformers: https://huggingface.co/docs/transformers
- Documentación de Text Embeddings Inference: https://huggingface.co/docs/text-embeddings-inference
