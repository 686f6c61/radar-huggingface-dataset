# hanzceo/JOSS-v1

## Resumen

JOSS-v1 (Judi Online Semantic Sniper) es un modelo de clasificación de texto desarrollado por hanzceo, diseñado para identificar y filtrar contenido de promoción de juegos de azar online en corpus en indonesio. Se basa en el modelo de embeddings jinaai/jina-embeddings-v5-text-small-classification, que se ha ajustado (fine-tuning) sobre un dataset propio de 21.898 ejemplos de promociones de juego online y contenido de concienciación. El modelo resuelve un problema concreto: la detección automática de spam de apuestas y casinos en textos indonesios, útil para investigadores y plataformas que necesitan depurar sus datos.

Con 596 millones de parámetros, es un clasificador de tamaño considerable, heredado de la arquitectura de embeddings de Jina AI. Aunque el pipeline es de clasificación de secuencias, el modelo está pensado para un uso binario (promoción vs. concienciación), como muestran los ejemplos de la model card. Su relevancia actual radica en el aumento de contenidos de juego online en Indonesia y la necesidad de herramientas de moderación lingüística específicas para ese mercado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (basado en jina-embeddings-v5-text-small-classification) |
| Parametros totales | 596.051.968 |
| Parametros activos | no disponible |
| Longitud de contexto | no especificada (el ejemplo de uso emplea max_length=512) |
| Tipos de cuantizacion | no especificados (pesos en safetensors, se puede cuantizar posteriormente) |
| Idiomas soportados | Indonesio (id) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de jina-embeddings-v5-text-small-classification, un modelo de embeddings de Jina AI que emplea una arquitectura transformer encoder con atención multi-cabeza. Sobre esta base se ha realizado un ajuste fino para clasificación de secuencias, añadiendo una cabeza de clasificación con dos clases (clase 0 y clase 1). No se han publicado detalles sobre el número de tokens de entrenamiento, la composición exacta del dataset ni el uso de técnicas como RLHF o DPO. El dataset utilizado, hanzceo/JOSS-data-L3, contiene 21.898 filas de promociones de juego online y textos de concienciación, según la model card.

La innovación principal no reside en la arquitectura, sino en la especialización del modelo base para una tarea concreta de moderación de contenido en indonesio. Al tratarse de un ajuste fino sobre un modelo de embeddings ya entrenado, se aprovecha la representación semántica de Jina para transferir conocimiento a la tarea de clasificación binaria.

## Capacidades

- Clasificación binaria de textos en indonesio, distinguiendo entre promociones de juego online (clase 1) y contenido de concienciación o aviso (clase 0).
- Generación de probabilidades de pertenencia a cada clase mediante softmax sobre la salida de la cabeza de clasificación.
- Procesamiento de textos de hasta 512 tokens (según el ejemplo de uso), con truncamiento automático.
- Funciona como clasificador de secuencias estándar con la librería transformers, permitiendo su integración en pipelines de moderación.
- No soporta tool calling, agentes ni razonamiento multi-paso; es un modelo puramente discriminativo.

## Casos de uso

- Limpieza de corpus de investigación: investigadores que trabajan con datos textuales indonesios pueden filtrar automáticamente mensajes de spam de juegos de azar antes de entrenar otros modelos o realizar análisis.
- Moderación de contenido en foros y redes sociales: plataformas que permiten contenido generado por usuarios en indonesio pueden usar JOSS-v1 para marcar y eliminar publicaciones que promuevan apuestas online.
- Detección de campañas de phishing de casinos: organizaciones de seguridad pueden integrar el modelo en sistemas de monitorización para identificar enlaces y textos fraudulentos relacionados con juegos de azar.
- Análisis de tendencias de promoción de juego: entidades gubernamentales o ONGs pueden cuantificar la prevalencia de este tipo de contenido en comunicaciones públicas.
- Filtrado de comentarios en blogs y noticias: medios indonesios pueden usar el clasificador para evitar que comentarios promocionales de apuestas aparezcan en sus secciones de debate.
- Construcción de datasets balanceados: el modelo puede servir como herramienta de pre-etiquetado para crear conjuntos de datos más grandes sobre el fenómeno del juego online en Indonesia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo incluye ejemplos de inferencia con tres textos (dos promociones y un aviso) donde el modelo asigna probabilidades superiores a 0,999 a la clase correcta, pero no hay métricas formales como precisión, recall o F1 sobre un conjunto de test.

## Requisitos de hardware

- VRAM estimada: con 596M parámetros en fp32, la inferencia requiere aproximadamente 2,4 GB de VRAM (596M × 4 bytes). En fp16 se reduce a ~1,2 GB, y con cuantización 8-bit a ~0,6 GB.
- GPU recomendadas: cualquier GPU con al menos 3 GB de VRAM puede ejecutar el modelo en fp32. Una RTX 3060 o superior es suficiente para inferencia en lote. Para entrenamiento o fine-tuning adicional, se recomienda al menos 8 GB de VRAM (RTX 3070, RTX 4080, A100).
- Es viable en GPUs de consumo (RTX 20/30/40 series) y también en CPU, aunque con mayor latencia.
- Opciones de despliegue: al ser un modelo de transformers estándar, se puede servir con vLLM, Hugging Face TGI, o mediante la API de Inference Endpoints. También es compatible con llama.cpp si se convierte a GGUF, aunque no hay versiones preconvertidas publicadas.
- Latencia y throughput: no se han publicado datos. Para un modelo de 596M parámetros en una GPU moderna, se espera una latencia de decenas de milisegundos por secuencia corta, pero depende del hardware y del tamaño del lote.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables específicos para detección de promociones de juego online en indonesio. Como referencia genérica, se podrían considerar otros clasificadores de texto multilingües como `indolem/indobert-base-uncased` (124M parámetros) o `bert-base-multilingual-cased` (172M), pero no están especializados en esta tarea y no se han comparado con JOSS-v1 en ningún benchmark público.

| Modelo | Parámetros | Contexto | Licencia | Especialización |
|---|---|---|---|---|
| hanzceo/JOSS-v1 | 596M | 512 (aprox.) | Apache 2.0 | Detección de promoción de juego online (indonesio) |
| indolem/indobert-base-uncased | 124M | 512 | MIT | Clasificación general en indonesio |
| bert-base-multilingual-cased | 172M | 512 | Apache 2.0 | Clasificación multilingüe |

## Limitaciones y advertencias

- El modelo solo ha sido entrenado con 21.898 ejemplos, un dataset relativamente pequeño, lo que puede limitar su generalización a variaciones lingüísticas no representadas.
- Está especializado exclusivamente en indonesio; no funcionará correctamente con otros idiomas.
- La clasificación binaria (promoción vs. concienciación) puede fallar con textos ambiguos o que mezclen ambos contenidos.
- No se han documentado sesgos específicos, pero al ser un modelo entrenado sobre un corpus de promociones, podría tener un sesgo hacia detectar como promoción cualquier texto que mencione términos como "bonus", "slot", "jackpot" o "deposit".
- Riesgo de alucinación no aplica directamente al ser un clasificador discriminativo, pero sí existe riesgo de falsos positivos o negativos en la clasificación.
- La licencia Apache 2.0 permite uso comercial sin restricciones, pero el autor no ofrece garantías sobre el rendimiento en producción.
- No se han publicado métricas de evaluación sobre conjuntos de test independientes, por lo que su rendimiento real fuera de los ejemplos mostrados es desconocido.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/hanzceo/JOSS-v1)
- [Dataset de entrenamiento hanzceo/JOSS-data-L3](https://huggingface.co/datasets/hanzceo/JOSS-data-L3)
- [Modelo base jinaai/jina-embeddings-v5-text-small-classification](https://huggingface.co/jinaai/jina-embeddings-v5-text-small-classification)
