# GadiGG/ofensivo-no-ofensivo-escom

## Resumen

`GadiGG/ofensivo-no-ofensivo-escom` es un modelo de clasificación de texto publicado en Hugging Face por el usuario GadiGG. Por su identificador y su pipeline (`text-classification`), está diseñado para la tarea binaria de distinguir contenido ofensivo de contenido no ofensivo, presumiblemente en castellano (el sufijo "escom" sugiere un ámbito en español, posiblemente vinculado a ESCOM o a un proyecto académico en español). El modelo se distribuye en formato safetensors bajo la librería transformers y suma 278.045.186 parámetros, lo que lo sitúa en la gama de los encoders de tamaño base.

La arquitectura declarada en las etiquetas del repositorio es `xlm-roberta`, un encoder multilingüe basado en transformer con atención bidireccional y tokenizador SentencePiece. Con ~278 millones de parámetros, el tamaño corresponde aproximadamente a una variante `xlm-roberta-base` (278M), lo que es coherente con un modelo de clasificación de secuencias obtenido por fine-tuning de un checkpoint base. No obstante, la model card no confirma ni el checkpoint de partida ni los datos de entrenamiento.

La relevancia de este modelo es limitada en el estado actual: cuenta con 0 descargas y 0 likes, la model card es la plantilla automática de Hugging Face sin rellenar, y no se especifican licencia, idiomas ni datos de evaluación. Es, por tanto, un artefacto de investigación o experimental cuyo uso en producción requeriría validación independiente. Se documenta aquí con las cautelas correspondientes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | xlm-roberta (encoder transformer, etiqueta del repo) |
| Parametros totales | 278.045.186 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (xlm-roberta-base admite hasta 512 tokens, no confirmado por el autor) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; cuantización dinámica posible vía bitsandbytes/ONNX, no documentada) |
| Idiomas soportados | no disponible (el identificador sugiere español; no confirmado) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Pipeline | text-classification |
| Tamaño del repositorio | 1.1 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La etiqueta `xlm-roberta` del repositorio indica que el modelo parte de la familia XLM-RoBERTa (Conneau et al., 2019), un encoder transformer multilingüe preentrenado con enmascaramiento de tokens sobre corpus en 100 idiomas. El recuento de 278 millones de parámetros coincide con la variante `base`, que emplea 12 capas, 768 dimensiones ocultas, 12 cabezas de atención y un vocabulario SentencePiece de 250.002 tokens. Sobre esa base se habría añadido una cabeza de clasificación para la tarea binaria ofensivo/no ofensivo, lo que explica el pipeline declarado.

No hay información pública sobre el procedimiento de fine-tuning: ni el dataset utilizado, ni el número de ejemplos, ni hiperparámetros, ni si se aplicó balanceo de clases, aumento de datos o validación cruzada. Tampoco se documenta si el entrenamiento fue en fp32, fp16 o bf16. La model card es la plantilla automática de Hugging Face y no aporta detalles técnicos. El tamaño del repositorio (1.1 GB) es superior al esperado para 278M parámetros en fp32 (~1,1 GB), lo que es coherente con pesos completos sin cuantizar.

No se ha publicado ninguna innovación técnica (atención lineal, decodificación especulativa, destilación, etc.) asociada a este checkpoint.

## Capacidades

- Clasificación binaria de texto en la categoría "ofensivo" frente a "no ofensivo", según el identificador del modelo.
- Inferencia de etiquetas a nivel de secuencia (pipeline `text-classification`), devolviendo etiqueta y puntuación de confianza.
- Procesamiento de secuencias de hasta 512 tokens si se confirma la base xlm-roberta (límite no documentado por el autor).
- Potencial multilingüismo heredado de XLM-RoBERTa, aunque el ajuste fino probablemente esté orientado a español y no se documenta.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generación de texto libre: es un encoder discriminativo, no un modelo generativo.
- No dispone de modo thinking, visión, audio ni capacidades multimodales.

## Casos de uso

- Moderación de comentarios en plataformas en español: el modelo puede puntuar cada mensaje entrante y derivar a revisión humana los que superen un umbral de probabilidad de ofensividad, actuando como primera línea de filtrado en foros o secciones de comentarios.
- Pre-filtrado en pipelines de anotación: uso como etiquetador automático para priorizar qué mensajes revisan los moderadores humanos, reduciendo el coste de anotación manual en corpus de toxicidad.
- Investigación en detección de discurso de odio: servir como línea base (baseline) en experimentos académicos sobre clasificación de toxicidad en castellano, comparando su rendimiento con modelos como RoBERTuito o BETO.
- Análisis de reputación de marca en redes sociales: clasificar menciones de una empresa y separar las que contienen lenguaje ofensivo para enrutarlas a equipos de soporte o comunicación.
- Filtrado previo en datasets de entrenamiento: descartar ejemplos ofensivos de corpus recopilados de la web antes de usarlos para entrenar modelos generativos, reduciendo el riesgo de reproducir toxicidad.
- Sistemas de alerta en comunidades online: integración en un servicio de inferencia (text-embeddings-inference o un endpoint compatible con la API de Hugging Face) que evalúe mensajes en tiempo casi real y active notificaciones al equipo de confianza y seguridad.
- Enriquecimiento de analítica de contenido generado por usuarios: añadir una etiqueta de ofensividad a cada documento para segmentar métricas de engagement por tipo de contenido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de precisión, recall, F1 ni comparaciones con otros clasificadores, y no hay evidencia de evaluación sobre conjuntos como OffendES, HatEval o DETOXIS.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 1,1 GB de pesos más activaciones; en la práctica, menos de 2 GB para lotes pequeños.
- VRAM estimada en fp16/bf16: alrededor de 0,6 GB de pesos, con un pico total inferior a 1,5 GB.
- Cabe holgadamente en cualquier GPU de consumo: RTX 3060, RTX 4060, RTX 4090, e incluso en iGPU con suficiente memoria compartida o en CPU para lotes reducidos.
- GPU de datacenter (A100, H100) innecesarias para este tamaño; útiles solo si se requiere throughput masivo por lotes.
- Opciones de despliegue: `transformers` con `pipeline("text-classification")`, Text Embeddings Inference (etiqueta `text-embeddings-inference` presente en el repo), ONNX Runtime, o exportación a GGUF para llama.cpp/Ollama (no documentada por el autor).
- Latencia y throughput: no disponibles. Para un encoder base de 278M, en una GPU moderna se esperan decenas de miles de secuencias cortas por segundo, pero es una estimación general no medida sobre este checkpoint.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GadiGG/ofensivo-no-ofensivo-escom | 278M | no disponible | Clasificación ofensivo/no ofensivo | no disponible | Hugging Face, 0 descargas |
| RoBERTuito (pysentimiento) | ~110M (RoBERTa base) | 128 tokens | Análisis de sentimiento y toxicidad en español | MIT (repo pysentimiento) | Hugging Face, ampliamente usado |
| BETO (bert-base-spanish-wwm-cased) | ~110M | 512 tokens | Encoder base en español, fine-tuneable | MIT | Hugging Face |
| XLM-RoBERTa base | 278M | 512 tokens | Encoder multilingüe base, fine-tuneable | MIT | Hugging Face |

La comparación con RoBERTuito y BETO es la más directa por dominio lingüístico (español) y tarea (clasificación de toxicidad). El modelo aquí descrito no documenta métricas que permitan afirmar superioridad o inferioridad frente a ellos. La licencia no disponible es una desventaja frente a las alternativas de licencia permisiva.

## Limitaciones y advertencias

- La model card es la plantilla automática sin rellenar: no hay información sobre datos de entrenamiento, sesgos, evaluación ni uso previsto.
- Licencia no disponible: no se puede asumir permiso para uso comercial ni redistribución; hay que contactar con el autor antes de integrarlo en producción.
- Idiomas no confirmados: el identificador sugiere español, pero no se documenta si el ajuste fino cubre variantes dialectales o solo una variedad concreta.
- Riesgo de alucinación no aplica en sentido generativo, pero sí de falsos positivos y falsos negativos en la clasificación, sin métricas publicadas que permitan calibrar umbrales.
- Sesgos potenciales desconocidos: al no documentarse el corpus de entrenamiento, no se puede evaluar el sesgo por género, origen étnico, orientación sexual o registro lingüístico.
- Sin validación externa: 0 descargas y 0 likes implican que el modelo no ha sido reproducido ni auditado por la comunidad.
- Longitud de contexto no confirmada: aunque la base xlm-roberta admite 512 tokens, el autor no lo especifica y podría haberse truncado en el ajuste fino.
- No apto para generación de texto, razonamiento, código ni tareas agénticas: es exclusivamente un clasificador.
- En producción, conviene combinarlo con revisión humana y monitorizar la deriva de la distribución de entrada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/GadiGG/ofensivo-no-ofensivo-escom
- Paper de XLM-RoBERTa (Conneau et al., 2019): https://arxiv.org/abs/1910.09700
- Documentación de transformers para text-classification: https://huggingface.co/docs/transformers/tasks/sequence_classification
- Text Embeddings Inference: https://github.com/huggingface/text-embeddings-inference
- Calculadora de impacto medioambiental (Lacoste et al., 2019): https://mlco2.github.io/impact
- Perfil del autor en Hugging Face: https://huggingface.co/GadiGG
