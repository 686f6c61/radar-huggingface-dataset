# followsci/bert-ai-text-detector

## Resumen

bert-ai-text-detector es un modelo de clasificación de texto desarrollado por followsci, un fine-tuning de google-bert/bert-base-uncased orientado a la detección binaria de texto académico generado por IA frente a texto escrito por humanos. Con 109,48 millones de parámetros y una ventana de 512 tokens, resuelve el problema concreto de identificar párrafos de artículos científicos producidos por modelos de lenguaje, un caso de uso cada vez más demandado en editoriales, universidades y plataformas de integridad académica.

El modelo se entrenó sobre un corpus propio de 1.859.260 párrafos (1.487.400 de entrenamiento, 185.930 de validación y 185.930 de test), combinando artículos humanos extraídos de arXiv con texto generado por distintos LLM (GPT, Claude, entre otros). El autor declara métricas muy altas en su conjunto de test: 99,57 % de accuracy, 99,58 % de F1, 99,23 % de precisión y 99,94 % de recall.

Su relevancia actual radica en que ofrece una alternativa ligera y desplegable en hardware de consumo para una tarea que hasta ahora se abordaba con clasificadores propietarios o modelos mucho mayores. La licencia MIT y el formato safetensors facilitan su integración en pipelines existentes, aunque las métricas declaradas no están verificadas de forma independiente y el modelo solo cubre inglés y dominio académico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT-base-uncased (transformer encoder, 12 capas) |
| Parametros totales | 109.483.778 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | no disponible (pesos en safetensors; admite cuantización estándar vía herramientas externas) |
| Idiomas soportados | en (inglés) |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Tarea | Clasificación binaria de texto (0 = humano, 1 = IA) |
| Modelo base | google-bert/bert-base-uncased |
| Tamaño del repositorio | 0,4 GB |
| Descargas | 1.189 |
| Likes | 7 |

## Arquitectura y entrenamiento

El modelo es un BERT-base-uncased estándar (transformer encoder bidireccional de 12 capas, 768 dimensiones ocultas, 12 cabezas de atención) al que se le añadió una cabeza de clasificación de secuencia con dos etiquetas. No incorpora innovaciones arquitectónicas: es un fine-tuning clásico de clasificación, con tokenización WordPiece y truncamiento a 512 tokens.

El entrenamiento se realizó durante 3 épocas con batch size 64, learning rate 5e-5 con warmup lineal de 5.000 pasos y optimizador AdamW, empleando aproximadamente 11 horas en una RTX 3090. El conjunto de datos combina párrafos humanos de artículos de arXiv con párrafos generados por varios LLM, con una distribución casi equilibrada (48,7 % humano / 51,3 % IA en cada split). No se documenta el uso de RLHF, DPO ni técnicas de aumento de datos más allá de la composición del corpus.

## Capacidades

- Clasificación binaria de texto: distingue entre párrafos escritos por humanos y párrafos generados por IA, devolviendo probabilidades por clase.
- Detección a nivel de párrafo: optimizado para muestras de párrafo académico de hasta 512 tokens.
- Procesamiento por lotes: admite inferencia batch con padding y truncamiento, lo que permite clasificar miles de párrafos por segundo.
- Integración con el pipeline de Transformers: funciona directamente con `pipeline("text-classification")`.
- Salida con puntuaciones de confianza: permite aplicar umbrales personalizados sobre la probabilidad de IA.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking.
- Capacidad multilingüe limitada: solo inglés; no se declara soporte para otros idiomas.
- No identifica qué modelo generó el texto ni detecta texto parcialmente asistido por IA.

## Casos de uso

- Revisión de integridad académica en editoriales: clasificar los párrafos de un manuscrito recibido para señalar secciones con alta probabilidad de generación por IA antes de enviarlas a revisión por pares, aprovechando el throughput de aproximadamente 20.900 muestras por segundo en una RTX 3090.
- Filtrado previo en repositorios de preprints: procesar por lotes los envíos a arXiv o servidores similares y marcar automáticamente los párrafos sospechosos para revisión humana, dado que el modelo está entrenado sobre texto de arXiv.
- Detección en plataformas de evaluación de trabajos: integrar el clasificador en un sistema de entrega de trabajos de fin de máster para generar informes con resaltado a nivel de párrafo y probabilidad asociada.
- Auditoría de corpus de investigación: analizar grandes volúmenes de textos recopilados para estudios sobre prevalencia de contenido generado por IA en publicaciones científicas, gracias a su bajo coste computacional y licencia MIT.
- Moderación en foros y plataformas de divulgación científica: aplicar el modelo como primera capa de filtrado en contenidos de temática académica, con revisión humana de los casos marcados por el 0,82 % de falsos positivos.
- Servicio de API de bajo coste: desplegar el modelo en una GPU de consumo (RTX 3090 o superior) para ofrecer detección de texto académico como servicio, con latencia reducida y sin dependencia de proveedores propietarios.
- Investigación sobre detección de IA: usar el modelo como línea base en experimentos de detección de texto generado, comparando su comportamiento con clasificadores más grandes o específicos de dominio.

## Benchmarks y rendimiento

Resultados declarados por el autor en su conjunto de test (Custom Academic Text Dataset, 185.930 muestras). No verificados de forma independiente.

| Metrica | Valor |
|---|---|
| Accuracy | 99,57 % |
| F1 | 99,58 % |
| Precision | 99,23 % |
| Recall | 99,94 % |
| Tasa de falsos positivos | 0,82 % |
| Tasa de falsos negativos | 0,06 % |

Matriz de confusión (test set):

| | Predicho: humano | Predicho: IA |
|---|---|---|
| Real: humano | 89.740 (VN) | 740 (FP) |
| Real: IA | 60 (FN) | 95.390 (VP) |

Rendimiento de inferencia declarado: aproximadamente 20.900 muestras por segundo en una RTX 3090 con batch size 64.

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible, ya que el modelo no es generativo.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,5 GB en fp32 (109 M de parámetros) y menos de 0,3 GB en fp16; con batch grande y activaciones, alrededor de 1-2 GB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; RTX 3090, RTX 4090, A100 o H100 para máximo throughput en procesamiento por lotes.
- Cabe en GPU de consumo: sí, en tarjetas como GTX 1650, RTX 3060, RTX 4060 y superiores.
- También puede ejecutarse en CPU para volúmenes moderados, aunque con menor throughput.
- Opciones de despliegue: Transformers (PyTorch), pipeline de text-classification, TorchServe, FastAPI con Transformers, ONNX Runtime tras exportación, y llama.cpp/Ollama no aplican al no ser un modelo generativo.
- Latencia y throughput: aproximadamente 20.900 muestras por segundo en RTX 3090 con batch 64 (dato del autor); en CPU el rendimiento será órdenes de magnitud menor y no está documentado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| followsci/bert-ai-text-detector | 109,5 M | 512 tokens | Detección binaria humano/IA en texto académico | MIT | Hugging Face |
| Modelos de detección de IA propietarios (p. ej. clasificadores comerciales) | no disponible | no disponible | Detección de texto generado por IA | Propietaria | APIs comerciales |
| Clasificadores BERT base genéricos | ~110 M | 512 tokens | Clasificación de texto general | Variable (MIT/Apache) | Hugging Face |

No se dispone de datos públicos comparables de otros clasificadores abiertos específicos de detección de texto académico generado por IA en la información proporcionada; la comparación cuantitativa con alternativas queda como no disponible.

## Limitaciones y advertencias

- Especificidad de dominio: entrenado principalmente con texto académico; el rendimiento puede degradarse en texto informal, redes sociales, documentación técnica o escritura creativa.
- Clasificación binaria únicamente: no identifica qué modelo generó el texto, no ofrece intervalos de confianza y no detecta texto parcialmente asistido por IA.
- Nivel de párrafo: optimizado para párrafos; el rendimiento a nivel de frase o de documento completo puede variar.
- Falsos positivos: aproximadamente el 0,82 % del texto humano se marca como IA, lo que en un corpus grande implica miles de casos; requiere revisión humana antes de cualquier acción disciplinaria.
- Métricas no verificadas: los resultados del model-index están declarados por el autor con `verified: false` y proceden de un conjunto de test propio, no de un benchmark independiente.
- Solo inglés: no cubre otros idiomas, lo que limita su uso en entornos multilingües.
- Riesgo de sesgo: al entrenarse con texto de arXiv y salidas de determinados LLM, puede sobrerrepresentar estilos de escritura concretos y penalizar variedades de escritura académica no representadas.
- Riesgo de alucinación no aplicable en sentido generativo, pero sí de clasificaciones erróneas con alta confianza.
- Licencia MIT: permite uso comercial, pero el autor no ofrece garantías sobre la idoneidad para decisiones de alto impacto (sanciones académicas, retirada de publicaciones).
- Advertencia ética: el autor indica que el modelo debe usarse como herramienta de apoyo, no como veredicto automático.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/followsci/bert-ai-text-detector
- Modelo base: https://huggingface.co/google-bert/bert-base-uncased
- Demo y plataforma del autor (XYZ SCIENCE): https://www.xyzscience.com/
- Detector académico gratuito del autor: https://www.xyzscience.com/detection
- Herramienta de reescritura académica del autor: https://www.xyzscience.com/rewrite
