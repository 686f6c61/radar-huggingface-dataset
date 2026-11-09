# CobuildX-AI/cbx-hallucination-detector-68M

## Resumen

cbx-hallucination-detector-68M es un modelo de clasificación de tokens (token-classification) especializado en detectar alucinaciones en respuestas generadas por modelos de lenguaje. Lo desarrolla CobuildX-AI y se publica bajo licencia Apache 2.0. Su función es identificar los fragmentos concretos de una respuesta que el contexto proporcionado no respalda, devolviendo cada span con un tipo (`factual` o `soft`) y una puntuación de confianza.

El modelo parte de jhu-clsp/ettin-encoder-68m, un encoder ModernBERT de 68 millones de parámetros, y se ha afinado para tres tipos de entrada: question answering sobre pasajes, resúmenes y descripciones generadas a partir de registros estructurados (data-to-text). Con 68,1 millones de parámetros y un repositorio de 0,3 GB, está pensado como un verificador ligero que se puede ejecutar en producción junto a un generador, con una latencia declarada de unos 14 ms por cada 1.000 tokens en GPU y 230 ms en CPU.

Su relevancia actual radica en que ataca un problema central de los sistemas RAG: comprobar si la respuesta está fundamentada en el contexto recuperado (grounding y faithfulness). A diferencia de un clasificador de respuesta completa, devuelve los spans exactos no soportados, lo que permite interfaces de resaltado, filtrado selectivo o regeneración parcial. La versión actual es v0.1 y existe también una variante de 32M del mismo autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT encoder (fine-tune de jhu-clsp/ettin-encoder-68m) |
| Parametros totales | 68.146.179 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4.096 tokens (contexto + pregunta + respuesta) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un encoder transformer de la familia ModernBERT, concretamente un fine-tune del checkpoint jhu-clsp/ettin-encoder-68m de 68M parámetros. La tarea es de token classification: el encoder procesa conjuntamente contexto, pregunta y respuesta, y emite etiquetas por token que el wrapper `HallucinationDetector` agrupa en spans con tipo y score. El contexto puede ser texto libre o un registro JSON, que se serializa a texto plano (una línea por campo, claves anidadas como rutas, booleanos y null convertidos a yes/no/not given, y horas en formato de 12 horas) para replicar el formato de entrenamiento.

La model card indica que el modelo se entrenó cubriendo QA sobre pasajes, resúmenes y data-to-text, y que no se entrenó con RAGTruth ni con los benchmarks que reporta, por lo que estas evaluaciones son held-out. No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO. El autor describe dos modos de inferencia derivados del mismo modelo: `lenient` (por defecto, solo spans factuales) y `strict` (factuales y soft). El umbral de decisión es 0,5 y es ajustable.

## Capacidades

- Detección de spans no soportados por el contexto en respuestas generadas, con posición (`start`, `end`), texto, tipo y score.
- Distinción entre spans `factual` (conflicto con el contexto o hecho inventado) y `soft` (tono, elogio o interpretación no respaldada, como "a hidden gem").
- Dos modos de operación: `lenient` (solo factuales) y `strict` (factuales y soft).
- Soporte de tres tipos de entrada: question answering sobre pasajes, resúmenes y descripciones data-to-text.
- Aceptación de contexto como texto libre o como registro JSON (string, dict o lista), con normalización automática de campos.
- Procesamiento por lotes mediante `detect_batch`.
- Gestión de contextos largos: hasta 4.096 tokens conjuntos; si se excede, se recorta el final del contexto (nunca la respuesta) y se informa del número de tokens descartados en `context_cut`.
- No marca paráfrasis correctas, resúmenes fieles, lecturas razonables del contexto, matizadores (hedges) ni afirmaciones sobre lo que el contexto no menciona.
- No dispone de tool calling, capacidades de agente, visión, audio ni modo de razonamiento extendido: es un clasificador, no un generador.

## Casos de uso

- Verificación en pipelines RAG: tras la generación, se pasa el contexto recuperado, la pregunta y la respuesta al detector; los spans marcados se resaltan en la interfaz o se filtran antes de mostrarlos al usuario. Es adecuado por su latencia baja (14 ms/1.000 tokens en GPU) y porque devuelve posiciones exactas.
- Moderación de resúmenes automáticos: en resúmenes de documentos largos, el modo `strict` permite señalar tanto datos erróneos como valoraciones no presentes en el original, útil en entornos editoriales o legales.
- Validación de descripciones data-to-text: para respuestas generadas a partir de registros estructurados (fichas de producto, informes financieros, datos de pacientes), el modelo convierte el JSON a texto y comprueba que cada cifra y atributo citado aparece en el registro.
- Control de calidad en atención al cliente automatizada: con respuestas construidas sobre una base de conocimiento, el detector identifica números, fechas u horas inventadas (por ejemplo, horarios de apertura) antes de enviar la respuesta.
- Regeneración selectiva: cuando se detectan spans, el sistema puede pedir al generador que reescriba solo el fragmento marcado, usando el span como señal de reparación en lugar de descartar toda la respuesta.
- Evaluación offline de modelos generativos: como etiquetador de spans, sirve para medir faithfulness en conjuntos de prueba propios y comparar versiones de un generador o de un recuperador en un pipeline RAG.
- Enriquecimiento de revisiones humanas: en flujos de anotación, el detector pre-marca los fragmentos sospechosos para que el revisor se centre en ellos, reduciendo el coste de auditoría.

## Benchmarks y rendimiento

Datos reportados en la model card. F1 de la clase alucinada en HaluEval y HaluBench (nivel de respuesta); Span F1 sobre caracteres, Answer F1 y tasa de falsas alarmas en RAGTruth test (spans anotados por humanos). El modelo no se entrenó con RAGTruth ni con estos benchmarks.

| Modelo | Modo | HaluEval QA | HaluEval resúmenes | HaluBench | RAGTruth Span F1 | RAGTruth QA/sum/data-to-text | RAGTruth Answer F1 | Falsas alarmas | Falsas alarmas data-to-text |
|---|---|---|---|---|---|---|---|---|---|
| cbx-hallucination-detector-68M | lenient | 0,686 | 0,590 | 0,621 | 0,315 | 0,357 / 0,221 / 0,323 | 0,616 | 52% | 74% |
| cbx-hallucination-detector-68M | strict | 0,685 | 0,644 | 0,626 | 0,243 | 0,352 / 0,210 / 0,206 | 0,612 | 59% | 95% |
| cbx-hallucination-detector-32M | lenient | 0,735 | 0,617 | 0,521 | 0,280 | 0,363 / 0,236 / 0,224 | 0,597 | 52% | 74% |
| cbx-hallucination-detector-32M | strict | 0,746 | 0,650 | 0,522 | 0,208 | 0,347 / 0,218 / 0,144 | 0,607 | 60% | 95% |
| TinyLettuce 17M | – | 0,502 | 0,419 | 0,419 | 0,446 | 0,551 / 0,235 / 0,438 | 0,685 | 19% | 31% |
| TinyLettuce 32M | – | 0,668 | 0,456 | 0,521 | 0,400 | no disponible | no disponible | no disponible | no disponible |

Notas: los modelos TinyLettuce están marcados en la model card como entrenados con RAGTruth, por lo que su resultado en RAGTruth no es una comparación held-out. Los spans dentro de frases de rechazo ("los pasajes no dicen") no se puntúan como spans para ningún modelo.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: en torno a 0,15 GB de pesos (68M parámetros), más overhead de activaciones y del runtime; cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM libre; el autor reporta unos 14 ms por 1.000 tokens en GPU. Para lotes grandes, una RTX 4090 o una A100/H100 ofrecen margen de sobra, aunque el cuello de botella será el resto del pipeline.
- CPU: funciona sin GPU, con unos 230 ms por 1.000 tokens según la model card.
- Despliegue: el repositorio incluye `cbx_hallucination.py` con la clase `HallucinationDetector`, que carga el modelo una vez y usa GPU si está disponible; también `example.py` para validar la instalación. No se documentan integraciones específicas con vLLM, TGI, llama.cpp u Ollama en la información disponible.
- Latencia y throughput: 14 ms/1.000 tokens en GPU y 230 ms/1.000 tokens en CPU (datos del autor); el throughput exacto en tokens por segundo no está disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| cbx-hallucination-detector-68M | 68M | 4.096 tokens | Apache 2.0 | Token classification, spans factual/soft | Hugging Face, v0.1 |
| cbx-hallucination-detector-32M | 32M (no confirmado en la información) | no disponible | Apache 2.0 | Token classification, spans factual/soft | Hugging Face |
| TinyLettuce 17M (KRLabsOrg) | 17M | no disponible | no disponible | Detección de alucinaciones; entrenado con RAGTruth | Hugging Face |
| TinyLettuce 32M (KRLabsOrg) | 32M | no disponible | no disponible | Detección de alucinaciones; entrenado con RAGTruth | Hugging Face |

En HaluEval y HaluBench el modelo de 68M supera a los TinyLettuce y, en HaluBench, al de 32M del mismo autor; en RAGTruth held-out, los TinyLettuce obtienen mejor Span F1 (0,446 y 0,400 frente a 0,315) y muchas menos falsas alarmas (19% y 31% frente a 52%), aunque su entrenamiento con RAGTruth invalida la comparación directa en ese benchmark.

## Limitaciones y advertencias

- Solo inglés: el modelo está entrenado y evaluado en `en`; no hay evidencia de comportamiento en castellano u otros idiomas.
- Tasa de falsas alarmas elevada en RAGTruth: un 52% de respuestas correctas reciben al menos un span en modo `lenient`, y un 74% en el subconjunto data-to-text; en modo `strict` sube al 59% y 95% respectivamente. En producción conviene ajustar el umbral (por defecto 0,5).
- Span F1 moderado en RAGTruth (0,315 en `lenient`), especialmente bajo en resúmenes (0,221); no debe tratarse como un verificador de precisión alta sin revisión humana.
- Riesgo de alucinación del propio detector: puede marcar paráfrasis correctas o lecturas razonables como no soportadas, y no detecta alucinaciones que no aparezcan como spans textuales.
- Limitación de contexto: 4.096 tokens conjuntos; si se excede, se recorta el final del contexto, lo que puede provocar que información relevante desaparezca y aumenten los falsos positivos.
- El contexto JSON se normaliza a un formato concreto (una línea por campo, rutas anidadas, yes/no/not given); contextos con otra estructura pueden degradar el rendimiento.
- Licencia Apache 2.0: permite uso comercial, pero debe conservarse el aviso de licencia y no se ofrece garantía; el modelo base jhu-clsp/ettin-encoder-68m tiene su propia licencia que conviene revisar.
- Versión v0.1: el autor recomienda fijar la revisión (`--revision v0.1`) porque el comportamiento puede cambiar en versiones futuras.
- Sin datos publicados sobre sesgos demográficos o de dominio; no se han publicado resultados de benchmarks adicionales fuera de los reportados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/CobuildX-AI/cbx-hallucination-detector-68M
- Variante de 32M: https://huggingface.co/CobuildX-AI/cbx-hallucination-detector-32M
- Modelo base: https://huggingface.co/jhu-clsp/ettin-encoder-68m
- TinyLettuce 17M: https://huggingface.co/KRLabsOrg/tinylettuce-ettin-17m-en
- TinyLettuce 32M: https://huggingface.co/KRLabsOrg/tinylettuce-ettin-32m-en
