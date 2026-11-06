# Aaqib099/distilbert-phishing-detection

## Resumen

DistilBERT Phishing Detection es un modelo de clasificación de texto binaria desarrollado por el usuario Aaqib099, que afina el checkpoint `distilbert-base-uncased` para distinguir correos electrónicos legítimos de correos de phishing. El modelo resuelve un problema acotado pero crítico en seguridad defensiva: la detección automática de mensajes fraudulentos que intentan suplantar identidades o inducir al usuario a pulsar enlaces maliciosos. Se publica bajo licencia Apache 2.0 y está pensado para integrarse en pipelines de filtrado de correo.

Arquitectónicamente es un transformer encoder-only de 66.955.010 parámetros (aproximadamente 67M), con una ventana efectiva de 256 tokens durante el entrenamiento. Su tamaño reducido permite ejecutarlo en hardware modesto, incluyendo GPU de consumo, y desplegarlo con latencias bajas en entornos de producción. Es relevante ahora porque ofrece una alternativa ligera y de código abierto frente a soluciones comerciales de filtrado, con métricas reportadas por el autor de 98,86% de accuracy y 98,48% de F1 sobre su conjunto de test.

El modelo se entrenó sobre el dataset público `zefang-liu/phishing-email-dataset`, con 17.537 muestras tras el proceso de limpieza, y solo soporta inglés. No incluye capacidades generativas, de razonamiento multi-paso ni de tool calling: es un clasificador puro que devuelve una etiqueta (`SAFE` o `PHISHING`) y una puntuación de confianza.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-only (DistilBERT, destilado de BERT) |
| Parametros totales | 66.955.010 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 256 tokens (longitud máxima usada en entrenamiento; la posición máxima del modelo base es 512) |
| Tipos de cuantizacion | no disponible (el autor no publica variantes cuantizadas; el modelo es compatible con cuantización estándar de transformers, pero no se documentan formatos) |
| Idiomas soportados | inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 0,3 GB) |

## Arquitectura y entrenamiento

El modelo parte de `distilbert-base-uncased`, un transformer encoder-only obtenido por destilación de BERT-base, con 6 capas y 66M de parámetros. Sobre esa base se añade una cabeza de clasificación binaria con dos clases: correo seguro (0) y correo de phishing (1). La tarea es, por tanto, clasificación de secuencias, no generación.

El entrenamiento se realizó con Hugging Face Transformers sobre una NVIDIA Tesla T4, durante 2 épocas, con learning rate 2e-5 y longitud máxima de secuencia de 256 tokens. El dataset de partida es `zefang-liu/phishing-email-dataset`; tras la limpieza quedaron 17.537 muestras, divididas en 14.029 de entrenamiento, 1.754 de validación y 1.754 de test. No se documenta en la model card el uso de RLHF, DPO ni técnicas de alineación adicionales, algo esperable en un clasificador. Tampoco se detalla la composición exacta del corpus ni el proceso de limpieza aplicado.

## Capacidades

- Clasificación binaria de correos electrónicos en dos categorías: `SAFE` y `PHISHING`.
- Detección de indicios textuales de phishing: urgencia, solicitud de verificación de cuenta, enlaces sospechosos y fórmulas de suplantación.
- Salida con etiqueta y puntuación de confianza, apta para umbrales configurables en producción.
- Integración directa con el pipeline `text-classification` de Transformers.
- Compatible con Text Embeddings Inference (tag `text-embeddings-inference`) y con endpoints de Hugging Face (`endpoints_compatible`).
- No soporta tool calling, function calling ni razonamiento multi-paso.
- No soporta generación de texto, visión, audio ni modo "thinking".
- Capacidad multilingüe limitada al inglés.

## Casos de uso

- Filtrado previo en pasarelas de correo: el modelo clasifica cada mensaje entrante y, con un umbral de confianza ajustado, marca los correos sospechosos para cuarentena antes de que lleguen al buzón del usuario. Su tamaño de 67M permite procesar lotes grandes en CPU o GPU modesta.
- Segunda opinión sobre reglas heurísticas: en lugar de sustituir un motor antispam basado en reglas, se usa como señal adicional; los correos que las reglas marcan como dudosos se reenvían al clasificador para desempatar.
- Moderación de bandejas de soporte: en un helpdesk que recibe correos de usuarios, el modelo ayuda a identificar mensajes que suplantan a la organización y a priorizar su revisión por el equipo de seguridad.
- Análisis retrospectivo de incidentes: dado un volcado de correos históricos, se ejecuta el modelo en lote para localizar mensajes de phishing que pasaron los filtros y estimar el alcance de una campaña.
- Generación de etiquetas para entrenamiento posterior: las predicciones de alta confianza se usan como pseudoetiquetas para ampliar un corpus propio de phishing, revisando manualmente una muestra para controlar el ruido.
- Prototipado rápido y demos: al ser un modelo pequeño y con licencia permisiva, sirve para construir una prueba de concepto de detección de phishing en pocas horas, sin depender de APIs comerciales.
- Filtrado en entornos con recursos limitados: su reducido consumo permite desplegarlo en un contenedor pequeño o incluso en un dispositivo edge con CPU, útil para organizaciones sin infraestructura GPU dedicada.

## Benchmarks y rendimiento

Resultados reportados por el autor sobre el conjunto de test (1.754 muestras):

| Metrica | Valor |
|---|---|
| Accuracy | 98,86% |
| Precision | 98,33% |
| Recall | 98,63% |
| F1-score | 98,48% |

No se han publicado en la información disponible resultados comparativos con otros modelos (MMLU, HumanEval, GSM8K u otros) ni métricas desagregadas por clase. Tampoco se documenta el rendimiento en dominios distintos al dataset de entrenamiento.

## Requisitos de hardware

- VRAM estimada para inferencia: en torno a 300-500 MB en fp32 para los pesos (67M de parámetros), y menos de 200 MB en fp16 o int8. El repo ocupa 0,3 GB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; el autor entrenó en una NVIDIA Tesla T4, que es suficiente también para inferencia por lotes.
- Cabe en GPU de consumo: sí, en cualquier RTX o GTX con 2 GB o más, e incluso en iGPU y CPU para volúmenes moderados.
- Opciones de despliegue: pipeline de Transformers, Text Embeddings Inference (tag oficial), endpoints de Hugging Face, y exportación a ONNX o cuantización estándar para servir con herramientas de inferencia ligeras. No se documentan configuraciones específicas para vLLM, llama.cpp u Ollama, que no son el formato natural para un encoder de clasificación.
- Latencia y throughput: no disponibles en la información proporcionada. Por el tamaño del modelo, se espera latencia de milisegundos por secuencia en GPU y de decenas de milisegundos en CPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Aaqib099/distilbert-phishing-detection | 66,96M | 256 tokens (entrenamiento) | Clasificación binaria de phishing | Apache 2.0 | Hugging Face |
| distilbert-base-uncased | 66,96M | 512 tokens | Modelo base (MLM, sin fine-tuning específico) | Apache 2.0 | Hugging Face |
| bert-base-uncased | 109,5M | 512 tokens | Modelo base (MLM, sin fine-tuning específico) | Apache 2.0 | Hugging Face |

No se dispone en la información proporcionada de otros clasificadores de phishing comparables con métricas publicadas, por lo que la comparación se limita a los checkpoints base de la familia BERT/DistilBERT. Frente a ellos, este modelo aporta la cabeza de clasificación ya entrenada, a costa de una ventana efectiva menor (256 frente a 512 tokens) y de un dominio de aplicación restringido al correo en inglés.

## Limitaciones y advertencias

- Entrenado sobre un único dataset de phishing; el rendimiento puede degradarse en dominios distintos (por ejemplo, correos corporativos reales, otros idiomas o formatos no vistos).
- El propio autor advierte que los resultados pueden diferir en mensajes del mundo real y que las predicciones no deben tratarse como decisiones de seguridad garantizadas.
- La entrada se trunca a 256 tokens, por lo que los indicios de phishing situados al final de correos largos pueden quedar fuera de la ventana y no ser evaluados.
- Solo soporta inglés; no se ha validado su comportamiento en castellano ni en otros idiomas.
- Riesgo de alucinación no aplica en sentido generativo, pero sí existe riesgo de falsos positivos y falsos negativos; con 2 épocas de entrenamiento y sin calibración documentada, las puntuaciones de confianza pueden no estar bien calibradas.
- Sesgos conocidos: no se documenta un análisis de sesgos; al entrenarse sobre un corpus concreto, puede heredar los sesgos de composición de ese dataset.
- Licencia Apache 2.0: permite uso comercial y modificación, pero conviene revisar las condiciones del dataset de origen (`zefang-liu/phishing-email-dataset`) antes de redistribuir derivados.
- Para producción se recomienda combinarlo con otras señales (reputación de dominio, análisis de cabeceras, listas de bloqueo) y no depender únicamente de la salida del clasificador.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Aaqib099/distilbert-phishing-detection
- Archivos del repositorio: https://huggingface.co/Aaqib099/distilbert-phishing-detection/tree/main
- Dataset de entrenamiento: https://huggingface.co/datasets/zefang-liu/phishing-email-dataset
- Modelo base: https://huggingface.co/distilbert-base-uncased
