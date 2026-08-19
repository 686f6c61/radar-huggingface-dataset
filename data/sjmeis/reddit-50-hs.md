# sjmeis/reddit-50-hs

## Resumen

El modelo `sjmeis/reddit-50-hs` es un ajuste fino de `google-bert/bert-base-cased` sobre el dataset `reddit-50`, presentado en el artículo *Introducing the Privacy-HSD Trade-off: Hate Speech Detection, but not at the Cost of Privacy* (WOAH 2026). Su propósito es la detección de discurso de odio en textos cortos, con especial atención al equilibrio entre precisión y privacidad de los usuarios. Se trata de un clasificador de secuencias basado en la arquitectura BERT, con 108 millones de parámetros y entrenado exclusivamente en inglés.

La relevancia de este modelo radica en su enfoque sobre el trade-off entre la utilidad de la detección de odio y la protección de datos personales, un aspecto crítico en la moderación de contenidos en plataformas sociales. Al ser un fine-tuning de BERT-base-cased, hereda su capacidad de comprensión contextual, aunque su ventana de contexto es limitada (típicamente 512 tokens). La licencia MIT permite su uso comercial sin restricciones significativas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT-base-cased (encoder transformer) |
| Parametros totales | 108.311.810 |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no disponible (heredada de BERT-base-cased, típicamente 512) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura BERT-base-cased, un transformer encoder de 12 capas con 768 dimensiones ocultas y 12 cabezas de atención. El ajuste fino se realizó sobre el dataset `reddit-50`, que contiene ejemplos de comentarios de Reddit etiquetados para discurso de odio. El artículo asociado (WOAH 2026) explora el equilibrio entre la precisión de la detección y la privacidad de los datos, lo que sugiere que el entrenamiento pudo haber incorporado técnicas de anonimización o regularización específicas, aunque no se detallan en la información disponible.

No se han publicado datos sobre el número de tokens de entrenamiento, la composición exacta del dataset (tamaño, balance de clases, etc.) ni el uso de técnicas como RLHF o DPO. Al ser un modelo de clasificación, no se espera que tenga capacidades generativas.

## Capacidades

- Clasificación de secuencias para detección de discurso de odio en texto en inglés.
- Procesamiento de texto corto (comentarios, publicaciones, mensajes) gracias a la arquitectura BERT.
- Salida binaria o multiclase (dependiendo de la configuración del dataset, no especificada) indicando presencia o ausencia de odio.
- No soporta generación de texto, tool calling, agentes, visión ni audio.
- Capacidad multilingüe limitada: solo inglés.

## Casos de uso

- Moderación de comentarios en foros y redes sociales: el modelo puede clasificar automáticamente comentarios de usuarios para detectar discurso de odio y priorizar la revisión humana o el bloqueo automático. Su tamaño reducido permite integrarlo en pipelines de moderación en tiempo real.
- Análisis de contenido en plataformas de noticias: permite identificar comentarios tóxicos en secciones de opinión, ayudando a mantener un entorno respetuoso.
- Monitorización de redes sociales para marcas: las empresas pueden usar el modelo para detectar menciones ofensivas hacia su marca o productos, facilitando la gestión de reputación online.
- Investigación académica en ciencias sociales: sirve como herramienta para etiquetar grandes volúmenes de datos textuales en estudios sobre discurso de odio, discriminación o polarización.
- Filtrado de contenido en comunidades online: administradores de subreddits o grupos pueden emplearlo para pre-clasificar publicaciones y reducir la carga de moderación manual.
- Auditoría de sesgos en modelos de lenguaje: al ser un modelo específico de detección de odio, puede utilizarse como componente en sistemas de evaluación de sesgos en otros modelos o datasets.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de métricas como F1, precisión o recall sobre datasets estándar (p. ej., HateXplain, OLID) ni comparaciones con otros modelos de detección de odio.

## Requisitos de hardware

- Al ser un modelo de 108M parámetros, es ligero y puede ejecutarse en CPU con razonable velocidad para inferencia por lotes.
- En GPU, cabe en tarjetas con poca VRAM (incluso 2-4 GB son suficientes para FP32), aunque no se proporcionan cifras oficiales.
- GPU recomendadas: cualquier GPU consumer moderna (p. ej., RTX 3060 o superior) o GPUs de datacenter como T4 o A10.
- Opciones de despliegue: se puede servir con Hugging Face Transformers, ONNX Runtime, o mediante frameworks como FastAPI para API de inferencia. No se menciona soporte para vLLM, llama.cpp u Ollama (típicamente orientados a modelos generativos).
- Latencia y throughput: no disponible, pero por el tamaño, se espera latencia de milisegundos en GPU y decenas de milisegundos en CPU para una sola muestra.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables específicos. Se podría comparar con otros fine-tunings de BERT para detección de odio (p. ej., `Hate-speech-CNERG/bert-base-uncased-hatexplain`), pero no se tienen datos de rendimiento ni características detalladas de este modelo para establecer una comparativa rigurosa.

## Limitaciones y advertencias

- Sesgos conocidos: al ser entrenado en datos de Reddit, puede reflejar sesgos demográficos y lingüísticos presentes en esa plataforma. No se ha evaluado su comportamiento en otros dominios.
- Riesgo de alucinación: no aplica, ya que es un clasificador y no genera texto.
- Limitaciones de contexto: la ventana de 512 tokens limita el análisis a textos cortos; no es adecuado para documentos largos.
- Idioma: solo inglés; no funciona en otros idiomas.
- Restricciones de licencia: la licencia MIT permite uso comercial y modificación, pero el usuario debe verificar la licencia del dataset `reddit-50` subyacente.
- Caveat para producción: no se han publicado métricas de rendimiento, por lo que se recomienda validar el modelo en el dominio específico antes de desplegarlo.

## Enlaces

- [HuggingFace - sjmeis/reddit-50-hs](https://huggingface.co/sjmeis/reddit-50-hs)
- Paper asociado: *Introducing the Privacy-HSD Trade-off: Hate Speech Detection, but not at the Cost of Privacy* (WOAH 2026) - no se dispone de enlace directo.
