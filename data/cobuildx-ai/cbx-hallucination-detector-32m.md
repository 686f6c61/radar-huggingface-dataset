# CobuildX-AI/cbx-hallucination-detector-32M

## Resumen

cbx-hallucination-detector-32M es un modelo de clasificación de tokens (token classification) especializado en detectar alucinaciones en respuestas generadas por sistemas de IA aumentados por recuperación (RAG). Lo desarrolla CobuildX-AI y se obtiene por fine-tuning del encoder jhu-clsp/ettin-encoder-32m, un transformer encoder de tipo ModernBERT con 31.884.291 parámetros. Su función es señalar los fragmentos concretos de una respuesta que el contexto proporcionado no respalda, devolviendo para cada fragmento su posición, tipo y una puntuación de confianza.

El modelo resuelve un problema específico de los pipelines RAG: verificar la fidelidad (faithfulness) de la respuesta respecto a los pasajes recuperados o a un registro estructurado. A diferencia de un clasificador a nivel de respuesta, opera a nivel de span, lo que permite auditar exactamente qué frase o cifra es inventada o contradice el contexto. Distingue entre spans de tipo `factual` (conflictos con el contexto o hechos inventados) y `soft` (tono, elogios o interpretaciones no respaldadas), y ofrece dos modos de operación, `lenient` y `strict`.

Su relevancia práctica radica en el tamaño reducido y la latencia: unos 9 ms por cada 1.000 tokens en GPU y 84 ms en CPU, con un repositorio de 0,1 GB. Esto lo hace apto para insertarse como paso de verificación en producción sin el coste de un modelo generativo adicional. La versión actual es v0.1 y existe una variante mayor de 68M parámetros del mismo autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (ModernBERT, fine-tune de jhu-clsp/ettin-encoder-32m) |
| Parametros totales | 31.884.291 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4.096 tokens (contexto + pregunta + respuesta en conjunto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de jhu-clsp/ettin-encoder-32m, un encoder de la familia ModernBERT de 32M parámetros, y se ajusta finamente como clasificador de tokens para la tarea de detección de spans no respaldados. La entrada combina contexto, pregunta y respuesta, y la salida es un etiquetado por token que se agrupa en spans con tipo (`factual` o `soft`) y puntuación. El contexto puede ser texto libre o un registro estructurado (JSON como cadena, `dict` o `list`); en este último caso se serializa en texto plano, una línea por campo, con claves anidadas convertidas en rutas, valores booleanos y nulos normalizados a yes/no/not given, y horarios como `17:0-21:0` acompañados de su forma de 12 horas. Cuando la entrada supera los 4.096 tokens se recorta el final del contexto, nunca la respuesta, y el número de tokens de contexto descartados se expone en `res["context_cut"]`.

El autor indica que el modelo cubre tres tipos de entrada: question answering sobre pasajes, resúmenes y descripciones generadas a partir de registros estructurados (data-to-text). No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO; al tratarse de un encoder de clasificación, lo habitual sería un ajuste supervisado sobre spans anotados, pero este dato no está confirmado. El modelo declara no haber sido entrenado con RAGTruth ni con ninguno de los benchmarks que reporta, lo que permite presentar esas cifras como evaluación fuera de dominio. El umbral de decisión por defecto es 0,5 y es ajustable.

## Capacidades

- Detección de spans no respaldados por el contexto en respuestas de sistemas RAG, con posición de inicio y fin, texto, tipo y puntuación.
- Distinción entre spans `factual` (conflicto con el contexto o hecho inventado: cifras, fechas, nombres, lugares, atributos, causas) y `soft` (tono, elogios o interpretaciones no respaldadas).
- Dos modos derivados del mismo modelo: `lenient` (solo factuales, menos falsos positivos) y `strict` (factuales y soft).
- Soporte de tres formatos de tarea: question answering sobre pasajes, resúmenes y data-to-text desde registros estructurados.
- Aceptación de contexto como texto libre o como JSON (cadena, `dict` o `list`) con serialización normalizada.
- Inferencia por lotes mediante `detect_batch`.
- No marca como alucinación paráfrasis correctas, resúmenes fieles, lecturas razonables del contexto, matizaciones (hedges) ni afirmaciones sobre lo que el contexto no menciona.
- Capacidad monolingüe: únicamente inglés.
- No dispone de tool calling, capacidades de agente, visión, audio ni modo de razonamiento; es un clasificador, no un generador.

## Casos de uso

- Verificación de fidelidad en pipelines RAG: tras generar la respuesta, se pasa el contexto recuperado, la pregunta y la respuesta al detector para obtener los spans no respaldados y decidir si se bloquea, se regenera o se anota la respuesta antes de mostrarla al usuario.
- Auditoría de respuestas en atención al cliente automatizada: el modelo señala cifras, plazos o condiciones inventadas respecto a la documentación de producto, lo que permite filtrar respuestas con riesgo antes de enviarlas.
- Control de calidad de resúmenes automáticos: dado un artículo y su resumen, detecta datos añadidos o contradichos en el resumen, útil en flujos de síntesis documental donde la fidelidad es requisito.
- Validación de descripciones data-to-text: a partir de un registro JSON (ficha de producto, expediente, horario de local), comprueba que el texto generado no introduce atributos, eventos o citas ausentes del registro.
- Métrica automática en evaluación de sistemas generativos: integrado en un harness de evaluación, calcula la proporción de respuestas con spans no respaldados y la tasa de falsas alarmas sobre respuestas correctas, como complemento a métricas léxicas.
- Filtrado y anotación de datasets: uso del modelo para preetiquetar spans sospechosos en grandes volúmenes de pares contexto-respuesta y reducir el trabajo de anotación humana posterior.
- Guardrail de bajo coste en CPU: con 84 ms por 1.000 tokens en CPU y un repositorio de 0,1 GB, puede desplegarse como servicio de verificación ligero en entornos sin GPU o en el propio dispositivo.

## Benchmarks y rendimiento

Datos reportados por el autor. En HaluEval y HaluBench la métrica es F1 de la clase alucinada a nivel de respuesta; en RAGTruth, F1 de spans sobre caracteres, F1 a nivel de respuesta y porcentaje de falsas alarmas (respuestas correctas que reciben algún span). El modelo no fue entrenado con RAGTruth ni con los benchmarks mostrados. Los modelos marcados con ⚠ fueron entrenados con RAGTruth, por lo que su cifra en ese benchmark no es una comparación fuera de dominio.

| Modelo | Modo | HaluEval QA | HaluEval resúmenes | HaluBench |
|---|---|---|---|---|
| cbx-hallucination-detector-68M | lenient | 0,686 | 0,590 | 0,621 |
| cbx-hallucination-detector-68M | strict | 0,685 | 0,644 | 0,626 |
| cbx-hallucination-detector-32M | lenient | 0,735 | 0,617 | 0,521 |
| cbx-hallucination-detector-32M | strict | 0,746 | 0,650 | 0,522 |
| TinyLettuce 17M ⚠ | – | 0,502 | 0,419 | 0,419 |
| TinyLettuce 32M ⚠ | – | 0,668 | 0,456 | 0,521 |

| Modelo | Modo | Span F1 | QA / resumen / data-to-text | Answer F1 | Falsas alarmas | Falsas alarmas data-to-text |
|---|---|---|---|---|---|---|
| cbx-hallucination-detector-68M | lenient | 0,315 | 0,357 / 0,221 / 0,323 | 0,616 | 52% | 74% |
| cbx-hallucination-detector-68M | strict | 0,243 | 0,352 / 0,210 / 0,206 | 0,612 | 59% | 95% |
| cbx-hallucination-detector-32M | lenient | 0,280 | 0,363 / 0,236 / 0,224 | 0,597 | 52% | 74% |
| cbx-hallucination-detector-32M | strict | 0,208 | 0,347 / 0,218 / 0,144 | 0,607 | 60% | 95% |
| TinyLettuce 17M ⚠ | – | 0,446 | 0,551 / 0,235 / 0,438 | 0,685 | 19% | 31% |
| TinyLettuce 32M ⚠ | – | no disponible en la información proporcionada | no disponible | no disponible | no disponible | no disponible |

Latencia declarada por el autor: aproximadamente 9 ms por 1.000 tokens en GPU y 84 ms por 1.000 tokens en CPU, con una velocidad en CPU unas 2,5 veces superior a la del modelo de 68M.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 31,9M parámetros; en fp32 ocupa aproximadamente 128 MB de pesos y en fp16 unos 64 MB, a lo que se suma el estado de activaciones para secuencias de hasta 4.096 tokens. No se publican cifras de VRAM medidas.
- GPU recomendadas: cualquier GPU con al menos unos pocos GB libres es suficiente; el autor no especifica modelos concretos. Por tamaño, cabe holgadamente en RTX 3060, RTX 4060, RTX 4090, A100 y H100.
- Cabe en GPU de consumo: sí, con margen amplio en cualquier GPU de consumo moderna con soporte de PyTorch.
- Despliegue: el repositorio incluye el wrapper `HallucinationDetector` en `cbx_hallucination.py` y un `example.py` de verificación; requiere instalar dependencias con `requirements.txt`. No se documenta integración con vLLM, llama.cpp, Ollama o TGI, que además no son el marco habitual para un encoder de token classification.
- Latencia y throughput: 9 ms por 1.000 tokens en GPU y 84 ms por 1.000 tokens en CPU, según el autor. El throughput agregado no está disponible; existe `detect_batch` para procesamiento por lotes.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | HaluEval QA (F1) | RAGTruth span F1 | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| cbx-hallucination-detector-32M | 31,9M | 4.096 | 0,735 (lenient) | 0,280 (lenient) | Apache 2.0 | Hugging Face |
| cbx-hallucination-detector-68M | no disponible | no disponible | 0,686 (lenient) | 0,315 (lenient) | no disponible en la información proporcionada | Hugging Face |
| TinyLettuce 17M | 17M | no disponible | 0,502 | 0,446 (entrenado con RAGTruth) | no disponible en la información proporcionada | Hugging Face |
| TinyLettuce 32M | 32M | no disponible | 0,668 | no disponible | no disponible en la información proporcionada | Hugging Face |

Frente al modelo de 68M del mismo autor, el de 32M obtiene mejor F1 en HaluEval (0,735 frente a 0,686 en QA; 0,617 frente a 0,590 en resúmenes en modo lenient) pero peor en HaluBench (0,521 frente a 0,621) y peor F1 de spans en RAGTruth (0,280 frente a 0,315). Las cifras de TinyLettuce en RAGTruth no son una comparación limpia porque ese modelo fue entrenado con dicho benchmark.

## Limitaciones y advertencias

- Modelo monolingüe: solo inglés; no se ha validado su comportamiento en castellano ni en otros idiomas.
- Ventana de 4.096 tokens compartida entre contexto, pregunta y respuesta; con contextos largos se descarta el final del contexto, lo que puede provocar falsos positivos por información ausente en la entrada efectiva.
- Tasa de falsas alarmas elevada en el benchmark reportado: 52% en modo lenient y 60% en strict sobre respuestas correctas de RAGTruth; en data-to-text alcanza el 74% y el 95% respectivamente. Requiere calibración del umbral (0,5 por defecto) según el caso de uso.
- F1 de spans moderado (0,280 en lenient, 0,208 en strict en RAGTruth), especialmente bajo en data-to-text en modo strict (0,144); no debe tratarse como veredicto definitivo sin revisión humana en flujos críticos.
- Riesgo de que el propio detector genere falsos negativos en alucinaciones sutiles o en paráfrasis que alteran el significado sin cambiar la forma.
- Es un clasificador, no un generador: no corrige la respuesta ni produce texto alternativo; solo localiza spans.
- Licencia Apache 2.0, que permite uso comercial y modificación, pero el autor no ofrece garantías sobre el rendimiento en dominios distintos de los evaluados (QA sobre pasajes, resúmenes y data-to-text en inglés).
- Versión v0.1, publicada en noviembre de 2026 y sin descargas ni valoraciones en el momento de la consulta; debe fijarse con `--revision v0.1` para reproducibilidad.
- No se documentan sesgos específicos del modelo base ni del dataset de ajuste en la información disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/CobuildX-AI/cbx-hallucination-detector-32M
- Variante de 68M: https://huggingface.co/CobuildX-AI/cbx-hallucination-detector-68M
- Modelo base: https://huggingface.co/jhu-clsp/ettin-encoder-32m
- TinyLettuce 17M (comparativa): https://huggingface.co/KRLabsOrg/tinylettuce-ettin-17m-en
- TinyLettuce 32M (comparativa): https://huggingface.co/KRLabsOrg/tinylettuce-ettin-32m-en
