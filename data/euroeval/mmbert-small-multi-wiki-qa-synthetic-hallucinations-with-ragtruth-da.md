# EuroEval/mmBERT-small-multi-wiki-qa-synthetic-hallucinations-with-ragtruth-da

## Resumen

El modelo EuroEval/mmBERT-small-multi-wiki-qa-synthetic-hallucinations-with-ragtruth-da es un modelo de clasificacion de tokens desarrollado por EuroEval, fine-tuneado a partir de mmBERT-small, una variante multilingue de la arquitectura ModernBERT. Su funcion es detectar alucinaciones a nivel de token en respuestas generadas por sistemas de recuperacion aumentada (RAG), concretamente en danes, como indica el sufijo "da" en su identificador.

El modelo forma parte de una serie multilingue que incluye variantes en ingles (en) y bosnio (bs), y se enmarca en el benchmark MultiWikiQHalluA, descrito en el articulo "A multilingual hallucination benchmark: MultiWikiQHalluA" (arXiv:2605.02504). La metodologia de entrenamiento combina una pipeline de generacion sintetica de datos de alucinacion basada en el framework LettuceDetect, que produce respuestas etiquetadas a nivel de token, con el fine-tuning del modelo para la tarea de deteccion.

Con 140,6 millones de parametros, es un modelo compacto adecuado para tareas de control de calidad en sistemas de generacion aumentada por recuperacion. La informacion publica sobre licencia, idiomas soportados y detalles de entrenamiento es escasa, ya que la model card no ha sido completada por el autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT (mmBERT-small, variante multilingue) |
| Parametros totales | 140.642.306 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el sufijo "da" indica danes; existen versiones en "en" y "bs") |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura ModernBERT, un transformer encoder optimizado para eficiencia y velocidad, adaptado a un contexto multilingue (mmBERT-small). Se trata de un modelo de clasificacion de tokens: dado un texto (tipicamente una respuesta generada por un sistema RAG), asigna a cada token una etiqueta que indica si forma parte de una alucinacion o no.

El entrenamiento sigue la metodologia descrita en el articulo "A multilingual hallucination benchmark: MultiWikiQHalluA". En una primera etapa, se genera un dataset sintetico de alucinaciones: los contextos, preguntas y respuestas correctas de MultiWikiQA se pasan al framework LettuceDetect, que utiliza un modelo de lenguaje para producir respuestas alucinadas etiquetadas a nivel de token. En la segunda etapa, se fine-tunea mmBERT-small sobre estos datos para la tarea de deteccion de alucinaciones.

No se dispone de informacion detallada sobre el numero de tokens de entrenamiento, la composicion del dataset ni el uso de tecnicas como RLHF o DPO.

## Capacidades

- Deteccion de alucinaciones a nivel de token en respuestas generadas por sistemas RAG.
- Clasificacion de tokens como factuales o alucinados en texto en danes.
- Integrable en pipelines de validacion de sistemas de generacion aumentada por recuperacion.
- Parte de una serie multilingue (danes, ingles, bosnio) para deteccion de alucinaciones.
- Compatible con la libreria transformers de HuggingFace y con endpoints de inferencia.

## Casos de uso

- Control de calidad en sistemas RAG en danes: el modelo puede analizar cada respuesta generada por un pipeline de recuperacion aumentada y marcar los tokens que probablemente sean alucinaciones, permitiendo filtrar o corregir automaticamente las salidas antes de mostrarlas al usuario final.
- Auditoria de respuestas en asistentes virtuales: en un asistente conversacional empresarial que use RAG, el modelo puede actuar como capa de verificacion posterior, senalando fragmentos no respaldados por el contexto recuperado.
- Evaluacion de datasets de entrenamiento: al aplicarlo sobre datasets de preguntas y respuestas, permite identificar respuestas alucinadas y depurar los datos antes de usarlos para fine-tuning de modelos generativos.
- Investigacion academica en alucinacion de LLMs: el modelo sirve como herramienta de anotacion automatica para estudios sobre fenomenos de alucinacion en modelos de lenguaje multilingues.
- Monitorizacion de sistemas de generacion en produccion: puede desplegarse como servicio de inferencia para auditar continuamente las respuestas de un sistema RAG en danes y generar metricas de calidad.
- Comparativa multilingue de deteccion de alucinaciones: junto con las versiones en ingles y bosnio, permite evaluar la robustez de los sistemas de deteccion entre idiomas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo de 140 millones de parametros, la inferencia en FP32 requiere aproximadamente 560 MB de VRAM, y en FP16 unos 280 MB.
- GPU recomendadas: cualquier GPU consumer con al menos 2 GB de VRAM es suficiente (por ejemplo, NVIDIA GTX 1650, RTX 3060 o superiores).
- El modelo cabe sin problemas en GPUs consumer y tambien puede ejecutarse en CPU con baja latencia para tareas de clasificacion de tokens.
- Opciones de despliegue: transformers (pipeline de token-classification), HuggingFace Inference Endpoints, ONNX Runtime, TensorRT.
- Latencia y throughput: no disponibles; al ser un modelo compacto, se espera una latencia baja en GPU moderna, pero no se han publicado mediciones oficiales.

## Comparativa con modelos similares

| Modelo | Parametros | Tarea | Idioma | Licencia |
|---|---|---|---|---|
| EuroEval/mmBERT-small-multi-wiki-qa-synthetic-hallucinations-with-ragtruth-da | 140,6 M | Deteccion de alucinaciones (token) | Danes | no disponible |
| EuroEval/mmBERT-small-multi-wiki-qa-synthetic-hallucinations-with-ragtruth-en | 140,6 M | Deteccion de alucinaciones (token) | Ingles | no disponible |
| EuroEval/mmBERT-small-multi-wiki-qa-synthetic-hallucinations-with-ragtruth-bs | 140,6 M | Deteccion de alucinaciones (token) | Bosnio | no disponible |

Las tres versiones comparten la misma arquitectura y tamano, diferenciandose unicamente en el idioma de los datos de entrenamiento. No se dispone de informacion sobre otros modelos comparables de la misma categoria en el momento de redactar esta ficha.

## Limitaciones y advertencias

- La model card del autor no proporciona informacion sobre sesgos conocidos, riesgos de alucinacion del propio modelo ni limitaciones especificas.
- El modelo ha sido fine-tuneado sobre datos sinteticos generados por el framework LettuceDetect, por lo que su rendimiento en datos reales puede diferir del observado en el entorno de entrenamiento.
- La licencia no esta especificada, lo que impide determinar si es apto para uso comercial sin autorizacion explicita del autor.
- No se dispone de informacion sobre la longitud de contexto soportada, lo que limita la planificacion de despliegues en produccion.
- Al ser un modelo de clasificacion de tokens, no genera texto; su uso se limita a tareas de etiquetado y deteccion.
- No se han publicado resultados de benchmarks ni evaluaciones independientes que permitan validar su rendimiento en escenarios reales.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/EuroEval/mmBERT-small-multi-wiki-qa-synthetic-hallucinations-with-ragtruth-da
- Version en ingles: https://huggingface.co/EuroEval/mmBERT-small-multi-wiki-qa-synthetic-hallucinations-with-ragtruth-en
- Version en bosnio: https://huggingface.co/EuroEval/mmBERT-small-multi-wiki-qa-synthetic-hallucinations-with-ragtruth-bs
- Articulo "A multilingual hallucination benchmark: MultiWikiQHalluA": https://arxiv.org/pdf/2605.02504v2 (version HTML: https://arxiv.org/html/2605.02504v2)
- EuroEval (framework de evaluacion): https://euroeval.com/
