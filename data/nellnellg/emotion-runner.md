# nellnellg/emotion-runner

## Resumen

emotion-runner es un modelo de clasificación de texto publicado por el usuario nellnellg en Hugging Face. Se trata de un DistilBERT afinado sobre el conjunto de datos dair-ai/emotion, orientado a la detección de emociones en texto. Su distribución está empaquetada específicamente para transformers.js con pesos en formato ONNX, lo que lo hace apto para inferencia en el navegador o en entornos JavaScript/Node.js sin necesidad de backend Python.

Por su tamaño (repositorio de 0,3 GB) y su arquitectura destilada, encaja en el segmento de modelos ligeros de clasificación, no generativos. No es un modelo de lenguaje general: no genera texto, no soporta tool calling ni razonamiento multi-paso. Su utilidad se limita a etiquetar fragmentos de texto con una categoría emocional.

La información pública disponible es muy escasa: la model card se reduce a una línea descriptiva, no se declara licencia, idiomas ni resultados de evaluación. Cualquier uso en producción requiere validación propia y verificación de los términos legales antes de desplegarlo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DistilBERT (transformer encoder destilado, base para clasificación) |
| Parametros totales | no disponible (DistilBERT base típicamente ~66M, no confirmado por el autor) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (DistilBERT admite típicamente 512 tokens, no confirmado por el autor) |
| Tipos de cuantizacion | no disponible (pesos ONNX; el grado de cuantización no se especifica) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | ONNX (compatible con transformers.js) |

## Arquitectura y entrenamiento

El modelo se basa en DistilBERT, una versión destilada de BERT que reduce el número de capas y parámetros manteniendo buena parte del rendimiento del modelo original en tareas de comprensión. Sobre esta base se ha realizado un ajuste fino supervisado para clasificación de emociones usando el dataset dair-ai/emotion, que etiqueta textos cortos con categorías emocionales (típicamente tristeza, alegría, amor, ira, miedo y sorpresa, aunque la model card no detalla el conjunto exacto de etiquetas).

No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset, hiperparámetros, ni si hubo técnicas de alineación como RLHF o DPO. Tampoco se documenta ninguna innovación técnica adicional más allá del empaquetado para transformers.js con pesos ONNX.

## Capacidades

- Clasificación de texto en categorías emocionales (pipeline text-classification).
- Inferencia en navegador y en Node.js mediante transformers.js.
- Ejecución sobre pesos ONNX, sin dependencia de PyTorch en tiempo de inferencia.
- No soporta generación de texto.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni comportamiento de agente.
- Capacidades multilingües: no disponibles (no declaradas).
- No dispone de modo thinking, visión ni audio.

## Casos de uso

- Moderación de comunidades: clasificar mensajes de foros o chats para detectar emociones negativas (ira, tristeza) y priorizar revisión humana. Adecuado por su bajo coste computacional en inferencia.
- Análisis de sentimiento a nivel de emoción en reseñas: etiquetar reseñas de producto o servicio con la emoción dominante para agregar métricas más finas que positivo/negativo.
- Procesamiento en el cliente: al estar empaquetado para transformers.js, puede ejecutarse en el navegador y clasificar texto sin enviar datos a un servidor, útil en aplicaciones con requisitos de privacidad.
- Enrutado de tickets de soporte: asignar tickets a colas según la emoción detectada (por ejemplo, escalar clientes con ira) como señal auxiliar en un sistema de triaje.
- Investigación en psicología computacional: etiquetado rápido de corpus cortos de texto para estudios exploratorios, siempre que se valide la calidad del etiquetado en el dominio concreto.
- Filtrado previo en pipelines de datos: preetiquetar grandes volúmenes de texto corto antes de un análisis más costoso con modelos mayores, reduciendo el coste total del pipeline.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible con precisión; por el tamaño del repositorio (0,3 GB) y la arquitectura destilada, la inferencia cabe holgadamente en menos de 1 GB de memoria en la mayoría de configuraciones.
- GPU recomendadas: no se especifican; para un modelo de este tamaño no se requiere GPU dedicada.
- Compatibilidad con GPU de consumo: sí, previsiblemente en cualquier GPU de consumo e incluso en CPU; no confirmado por el autor.
- Opciones de despliegue: transformers.js (principal, según la librería declarada); ONNX Runtime; otros runtimes ONNX no documentados por el autor.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| nellnellg/emotion-runner | DistilBERT + ONNX | no disponible | no disponible | ONNX | Empaquetado para transformers.js |
| distilbert-base-uncased-finetuned-sst-2-english | DistilBERT | 512 tokens | Apache 2.0 | safetensors | Clasificación binaria de sentimiento, ampliamente usado |
| bhadresh-savani/distilbert-base-uncased-emotion | DistilBERT | 512 tokens | no disponible en la ficha de referencia | safetensors | Clasificación de emociones sobre dair-ai/emotion, mismo dataset de referencia |
| j-hartmann/emotion-english-distilroberta-base | DistilRoBERTa | 512 tokens | no disponible en la ficha de referencia | safetensors | Clasificación de emociones en inglés, base más grande |

Los datos de los modelos comparables proceden de sus fichas públicas habituales; conviene verificarlos antes de tomar decisiones. La ventaja diferencial de emotion-runner es su empaquetado ONNX para transformers.js, no un rendimiento superior demostrado.

## Limitaciones y advertencias

- La model card no declara licencia: no se puede asumir uso comercial sin contactar con el autor o verificar los términos.
- No se declaran los idiomas soportados; el dataset dair-ai/emotion es predominantemente en inglés, por lo que el rendimiento en castellano es incierto.
- No hay métricas de evaluación publicadas (exactitud, F1, matriz de confusión), lo que impide estimar su calidad real.
- Riesgo de alucinación no aplica en sentido generativo, pero sí de etiquetado erróneo en textos ambiguos, irónicos o de dominio especializado.
- El conjunto de etiquetas no está documentado en la model card; hay que inspeccionar la configuración del modelo para conocerlo.
- Sesgos: no documentados; los datasets de emociones suelen reflejar sesgos culturales y de género presentes en el corpus original.
- Al ser un modelo con 0 descargas y 0 likes, no hay evidencia de uso en producción ni validación por la comunidad.
- Verificar la integridad de los pesos ONNX antes de desplegar, dado que el repositorio no incluye documentación de procedencia del ajuste fino.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nellnellg/emotion-runner
- Dataset de referencia: https://huggingface.co/datasets/dair-ai/emotion
- Librería transformers.js: https://github.com/huggingface/transformers.js
- Documentación de DistilBERT: https://huggingface.co/docs/transformers/model_doc/distilbert
