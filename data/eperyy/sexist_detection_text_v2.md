# ePeryy/sexist_detection_text_v2

## Resumen

`ePeryy/sexist_detection_text_v2` es un modelo de clasificación de texto en inglés especializado en la detección automática de frases sexistas. Se trata de un ajuste fino (fine-tuning) del modelo base `answerdotai/ModernBERT-base`, desarrollado por el usuario ePeryy y publicado bajo licencia Apache 2.0. El modelo resuelve un problema concreto de moderación de contenido: identificar de forma automática expresiones sexistas en textos en inglés, lo que lo hace útil para plataformas sociales, foros y sistemas de moderación automatizada.

Arquitectura ModernBERT, un transformer encoder de última generación que incorpora mejoras sobre BERT clásico (atención con rotaciones posicionales, mayor eficiencia y soporte de contextos más largos). El modelo cuenta con 149.606.402 parámetros totales y se distribuye en formato safetensors, con un tamaño de repositorio de 3,0 GB. Es un modelo de clasificación (pipeline `text-classification`), no generativo, por lo que su salida es una etiqueta o probabilidad, no texto libre.

Su relevancia actual radica en la creciente demanda de herramientas de moderación de contenido automatizadas y auditables. Al estar basado en ModernBERT y publicarse con licencia permisiva, puede integrarse en pipelines de producción sin restricciones comerciales significativas. Sin embargo, el modelo tiene un alcance limitado: solo inglés, una única tarea de clasificación y sin datos publicados de benchmarks formales más allá de las métricas de validación del entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT (transformer encoder) |
| Parametros totales | 149.606.402 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de ModernBERT-base; el autor no la especifica) |
| Tipos de cuantizacion | no disponible (pesos safetensors en fp32/fp16; no se documentan cuantizaciones GGUF/ONNX) |
| Idiomas soportados | inglés (el autor indica detección de frases sexistas en textos en inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning de `answerdotai/ModernBERT-base`, un transformer encoder que moderniza la familia BERT con mejoras en eficiencia computacional y soporte de secuencias más largas. La tarea es clasificación de texto binaria o multiclase (detección de sexismo), con una cabeza de clasificación sobre el encoder. El autor no detalla la composición del dataset de entrenamiento, el número de tokens ni si hubo técnicas de aumento de datos o balanceo de clases.

El entrenamiento se realizó con la librería Transformers (versión 5.22.1), PyTorch 2.14.1+cu130, Datasets 4.8.5 y Tokenizers 0.23.3. La model card reporta cinco épocas con pérdida de entrenamiento decreciente (de 0,6216 a 0,0332) y precisión de validación que alcanza su máximo en la época 3 (0,8857) para luego estabilizarse ligeramente por debajo (0,8838–0,8839). La pérdida de validación, sin embargo, aumenta a partir de la época 3 (de 0,3150 a 1,2159), lo que sugiere un sobreajuste progresivo a partir de ese punto. No se documenta el uso de RLHF, DPO ni decodificación especulativa, algo esperable en un modelo de clasificación.

## Capacidades

- Clasificación de texto en inglés para detección de frases sexistas.
- Salida de etiquetas/probabilidades de clasificación (pipeline `text-classification`).
- Integración con la librería Transformers y con Text Embeddings Inference (tag `text-embeddings-inference`).
- Compatible con endpoints de Hugging Face (tag `endpoints_compatible`).
- No soporta generación de texto, razonamiento multi-paso, tool calling ni function calling.
- No soporta visión, audio ni modalidades distintas de texto.
- Capacidad multilingüe no documentada; el autor limita explícitamente el uso a inglés.

## Casos de uso

- Moderación de comentarios en plataformas sociales: el modelo puede clasificar comentarios entrantes en tiempo real y marcar aquellos con contenido sexista para revisión humana o bloqueo automático, aprovechando su tamaño compacto (150M parámetros) para inferencia de baja latencia.
- Filtrado de foros y comunidades online: integración en pipelines de premoderación para priorizar la cola de revisión manual, reduciendo la carga de moderadores al preclasificar grandes volúmenes de mensajes.
- Análisis de toxicidad en datasets de investigación: uso como etiquetador automático para anotar corpus de texto en inglés en estudios sociolingüísticos o de sesgos de género, con la ventaja de ser reproducible y de código abierto.
- Monitorización de reseñas y feedback de usuarios: detección de lenguaje sexista en reseñas de productos o encuestas de satisfacción para escalar casos a equipos de confianza y seguridad.
- Preprocesado en sistemas de recomendación o búsqueda: filtrado de contenido sexista antes de indexar o recomendar textos generados por usuarios, evitando la amplificación de contenido dañino.
- Evaluación de sesgos en modelos generativos: uso como clasificador auxiliar para medir la prevalencia de expresiones sexistas en salidas de LLMs durante pruebas de red teaming o auditorías de seguridad.

## Benchmarks y rendimiento

La model card no incluye resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en el model-index; la lista de resultados está vacía. Los únicos datos disponibles son las métricas de entrenamiento y validación reportadas por el autor:

| Epoca | Training loss | Validation loss | Accuracy (validacion) |
|---|---|---|---|
| 1.0 | 0.6216 | 0.3150 | 0.8609 |
| 2.0 | 0.4424 | 0.3510 | 0.8814 |
| 3.0 | 0.2443 | 0.6728 | 0.8857 |
| 4.0 | 0.0847 | 1.0521 | 0.8838 |
| 5.0 | 0.0332 | 1.2159 | 0.8839 |

No se han publicado resultados de benchmarks en la informacion disponible mas alla de estas metricas de validacion.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,6 GB en fp16 (150M parámetros × 2 bytes) y alrededor de 1,2 GB en fp32; el repositorio ocupa 3,0 GB por incluir posiblemente checkpoints intermedios y optimizador.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; RTX 3060, RTX 4090, A100, H100 funcionan sin problema. También es viable en CPU para cargas moderadas.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna (GTX 1060 6GB en adelante) e incluso en iGPU con suficiente memoria compartida.
- Opciones de despliegue: Transformers (PyTorch), Text Embeddings Inference (TEI), Hugging Face Inference Endpoints; no se documentan pesos GGUF para llama.cpp/Ollama, aunque la conversión a ONNX o GGUF sería factible al ser un encoder estándar.
- Latencia y throughput estimados: no disponibles en la información proporcionada; por el tamaño del modelo, se espera latencia de milisegundos por batch en GPU moderna, pero el autor no publica cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ePeryy/sexist_detection_text_v2 | 149,6M | no disponible | Clasificacion de sexismo (ingles) | Apache 2.0 | Hugging Face |
| answerdotai/ModernBERT-base | ~149M | hasta 8192 tokens (según modelo base) | Encoder base (fine-tuning) | Apache 2.0 | Hugging Face |
| BERT-base (google-bert/bert-base-uncased) | 110M | 512 tokens | Encoder base | Apache 2.0 | Hugging Face |
| Modelos de moderación tipo toxic-bert | ~110M | 512 tokens | Clasificación de toxicidad | Apache 2.0 / varía | Hugging Face |

No se dispone de datos de rendimiento comparativo publicados para este modelo frente a alternativas; la comparación se limita a parámetros, contexto y licencia.

## Limitaciones y advertencias

- Sesgos conocidos: al ser un fine-tuning sobre un dataset no documentado, puede heredar sesgos del corpus de entrenamiento (por ejemplo, sobrerrepresentación de ciertos registros o variantes dialectales del inglés).
- Riesgo de alucinación: bajo en sentido generativo (no genera texto), pero puede producir falsos positivos y falsos negativos en la clasificación, especialmente en contextos irónicos, citas o lenguaje recuperado.
- Limitaciones de contexto o idioma: solo inglés; no se documenta la longitud máxima de secuencia efectiva ni el comportamiento en textos largos.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el autor no ofrece garantías ni soporte; el uso en producción requiere validación propia.
- Caveat importante para producción: el sobreajuste observado a partir de la época 3 (pérdida de validación creciente) sugiere que el checkpoint final puede no ser el óptimo; conviene evaluar checkpoints intermedios. Además, el modelo tiene muy pocas descargas (62) y ningún "like", lo que indica escasa validación por parte de la comunidad.
- No se documenta el dataset de entrenamiento, lo que dificulta la auditoría y la reproducibilidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ePeryy/sexist_detection_text_v2
- Modelo base: https://huggingface.co/answerdotai/ModernBERT-base
- No se han encontrado papers, blogs, repositorios o demos adicionales en la información proporcionada.
