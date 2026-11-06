# cyttic/hmt-trocrctc-geom2-s42

## Resumen

`cyttic/hmt-trocrctc-geom2-s42` es un modelo de reconocimiento de texto manuscrito (HTR, *handwritten text recognition*) en hebreo, desarrollado por el grupo cyttic en el marco de un estudio de aumento de datos denominado `htr-metrics-transfer` (oleada 1). El modelo combina una arquitectura TrOCR con una cabeza de decodificación CTC, de ahí el identificador `trocrctc`, y se ha entrenado con la variante de aumentación `geom2` y la semilla 42 sobre el conjunto `cyttic/hhd-optionb-split`, excluyendo los escritores del conjunto de desarrollo.

Con 87,3 millones de parámetros y un repositorio de solo 0,3 GB en formato safetensors, es un modelo compacto orientado a una tarea muy concreta: transcribir líneas de texto manuscrito en hebreo. No es un modelo generativo de propósito general ni un asistente conversacional; su utilidad está en pipelines de digitalización documental, archivos históricos y procesamiento por lotes de manuscritos.

Su relevancia actual es la de un artefacto de investigación reproducible: documenta el efecto de una estrategia de aumentación geométrica concreta sobre métricas de reconocimiento (CER 0,0747 y WER 0,3316 en el test HHD Option-B con decodificación greedy y sin modelo de lenguaje). La licencia MIT facilita su reutilización comercial, aunque el alcance idiomático se limita al hebreo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TrOCR con cabeza CTC (identificador `trocrctc`; transformer encoder-decoder) |
| Parametros totales | 87.279.756 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documentan variantes GGUF/ONNX) |
| Idiomas soportados | hebreo (`he`) |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Tamano del repositorio | 0,3 GB |
| Pipeline declarado | no disponible |
| Tarea | HTR (reconocimiento de texto manuscrito) con decodificacion CTC |

## Arquitectura y entrenamiento

El modelo sigue el esquema TrOCR, es decir, un transformer encoder-decoder pensado para reconocimiento de texto en imagen, pero sustituye la decodificación autorregresiva habitual por una cabeza CTC, lo que permite alineamientos monotonos entre la secuencia visual y la secuencia de caracteres sin necesidad de un decoder autoregresivo paso a paso. El nombre `trocrctc` refleja esa hibridación. No se dispone de información sobre el número de capas, dimensiones ocultas, cabezas de atención ni resolución de entrada en la información proporcionada.

El entrenamiento se realizó sobre `cyttic/hhd-optionb-split`, usando la partición de entrenamiento menos los escritores reservados para desarrollo, con la aumentación `geom2` y semilla 42. No se documentan el número de tokens, la composición exacta del dataset, ni si hubo etapas de ajuste fino adicionales, RLHF o DPO (en HTR estos últimos no son habituales). La innovación destacable es metodológica: el estudio mide la transferencia de métricas bajo una aumentación geométrica concreta, y los resultados se publican en `results.json` dentro del repositorio.

## Capacidades

- Transcripción de líneas de texto manuscrito en hebreo a texto digital.
- Decodificación CTC greedy, sin modelo de lenguaje externo, tal como se reporta en la model card.
- Reconocimiento sobre imágenes de línea de texto (entrada visual), no sobre texto plano.
- No soporta tool calling ni function calling.
- No está diseñado para razonamiento multi-paso ni para uso como agente.
- Multilingüismo: únicamente hebreo.
- No dispone de modo *thinking*, visión general, audio ni generación de texto libre.

## Casos de uso

- Digitalización de archivos históricos en hebreo: el modelo transcribe líneas manuscritas escaneadas, adecuado por su especialización y su tamaño reducido para procesar lotes grandes en CPU o GPU modesta.
- Procesamiento por lotes de documentos administrativos manuscritos: al ser un modelo de 87 M de parámetros, permite desplegar múltiples instancias en una sola GPU y mantener throughput alto en pipelines nocturnos.
- Extracción de texto para motores de búsqueda internos: las transcripciones alimentan índices full-text sobre colecciones de manuscritos previamente inaccesibles.
- Investigación en HTR: sirve como punto de comparación reproducible (semilla 42, aumentación `geom2`) frente a otras variantes del mismo estudio `htr-metrics-transfer`.
- Preetiquetado para anotación humana: genera transcripciones iniciales que revisores corrigen, reduciendo el coste de crear corpus etiquetados en hebreo manuscrito.
- Integración en visores de archivo: transcripción bajo demanda de una línea seleccionada por el usuario, con latencia baja gracias al tamaño compacto del modelo.
- Evaluación de técnicas de aumentación: permite reproducir el experimento y medir el impacto de `geom2` sobre CER/WER en el conjunto HHD Option-B.

## Benchmarks y rendimiento

Resultados reportados en la model card sobre HHD Option-B (test), decodificación greedy, sin modelo de lenguaje:

| Metrica | Valor |
|---|---|
| CER | 0,0747 |
| WER | 0,3316 |

No se han publicado en la información disponible resultados comparativos con otros modelos (MMLU, HumanEval, GSM8K u otros) ni curvas de entrenamiento. Los detalles adicionales se remiten a `results.json` en el repositorio.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 0,35 GB solo para pesos; en fp16, unos 0,18 GB. Con activaciones y batch pequeño, el consumo real es de alrededor de 1 GB o menos.
- Cabe holgadamente en cualquier GPU consumer: GTX 1650, RTX 3060, RTX 4090, así como en CPU para lotes moderados.
- GPU recomendadas para alto throughput: A100, H100 o L4 para servir muchas peticiones concurrentes; para uso individual, cualquier GPU con 4 GB o más es suficiente.
- Opciones de despliegue: PyTorch con `transformers` (si la arquitectura TrOCR+CTC está soportada por la clase correspondiente), ONNX Runtime tras exportación, o TorchServe/Triton para servir. No se documentan variantes GGUF ni integración con llama.cpp u Ollama, al no ser un modelo de lenguaje.
- Latencia y throughput: no disponibles en la información proporcionada; por el tamaño (87 M de parámetros) se espera procesamiento de decenas a cientos de líneas por segundo en GPU moderna, pero es una estimación no verificada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| cyttic/hmt-trocrctc-geom2-s42 | 87,3 M | no disponible | hebreo | MIT | TrOCR+CTC, aumentación `geom2`, semilla 42 |
| TrOCR base (Microsoft) | ~334 M | no disponible | inglés principalmente | MIT | Referencia arquitectónica; no especializado en hebreo |
| Otros modelos del estudio `htr-metrics-transfer` | no disponible | no disponible | hebreo | no disponible | Variantes con otras aumentaciones y semillas; comparación directa pendiente de publicar |

No se dispone de datos de benchmarks de los modelos alternativos en la información proporcionada, por lo que la comparación cuantitativa de rendimiento queda como no disponible.

## Limitaciones y advertencias

- Especializado exclusivamente en hebreo; no transcribe otros idiomas ni texto impreso de forma fiable sin validación.
- El WER de 0,3316 indica que aproximadamente un tercio de las palabras presentan algún error en el conjunto de test; requiere revisión humana en producción.
- Riesgo de alucinación y de sustituciones sistemáticas en escrituras o dominios no representados en el conjunto de entrenamiento.
- No se documentan sesgos demográficos ni de escritor; el conjunto excluye escritores de desarrollo, lo que puede afectar a la generalización a nuevos escritores.
- Licencia MIT, que permite uso comercial y modificación, pero sin garantías del autor.
- No es un modelo de lenguaje: no admite prompts conversacionales, tool calling ni razonamiento; cualquier uso fuera de HTR no está soportado.
- Sin pipeline declarado en Hugging Face, la integración requiere cargar los pesos manualmente y conocer la arquitectura exacta.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de validación externa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/cyttic/hmt-trocrctc-geom2-s42
- Dataset de entrenamiento: https://huggingface.co/datasets/cyttic/hhd-optionb-split (referenciado en la model card)
- Resultados detallados: `results.json` en el repositorio del modelo
- Paper de TrOCR (arquitectura base): https://arxiv.org/abs/2109.10282 (referencia general, no específica de este modelo)
