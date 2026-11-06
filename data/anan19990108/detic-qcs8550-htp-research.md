# anan19990108/detic-qcs8550-htp-research

## Resumen

`anan19990108/detic-qcs8550-htp-research` no es un modelo de lenguaje ni un detector listo para usar: es un kit de investigación de solo código (source-only) extraído de un experimento con Detic, el detector de objetos de código abierto de Meta AI. El repositorio contiene scripts y documentación para reproducir una familia de grafos TFLite derivados de un checkpoint Detic con salida fija, orientados a su despliegue en el acelerador HTP del SoC Qualcomm QCS8550. No incluye pesos, imágenes, etiquetas, binarios de Qualcomm ni código de aplicación Android, y no existe todavía ningún modelo descargable en el repositorio.

El modelo demostrado es un derivado de forma fija de Detic, no Detic completo ni un detector con prompts de texto. Consume una única imagen RGB redimensionada directamente a 640×640 en formato CHW `float32` con píxeles en `[0,255]`, y devuelve hasta 20 cajas `xyxy`, sus puntuaciones y los IDs de clase LVIS. Las clases validadas en el experimento son `35=suitcase`, `1178=wheelchair` y `31=baby_buggy/stroller`; mobility scooter, walker y rollator no se han validado como clases directas.

Su relevancia es acotada pero concreta: documenta el proceso de cuantización y particionado de un grafo Detic para el HTP de un SoC edge, con scripts de auditoría estructural, evaluación de holdout y comprobaciones de humo en CPU. Es material de referencia para quien investigue el despliegue de detectores en hardware Qualcomm, no una dependencia de producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Detic (detector de objetos de código abierto de Meta AI) con salida fija; grafo TFLite derivado |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de lenguaje) |
| Tipos de cuantización | W8A32 (pesos INT8, activaciones float), A8W8 (109 kernels Conv/FC calibrados), PTQ automática (r379) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | Apache-2.0 (solo para el código y documentación incluidos; no cubre checkpoints, SDKs ni datasets externos de Detic) |
| Formato de pesos | TFLite (grafos intermedios r358, r366, r367, r369, r370, r379, r380); no se distribuyen pesos |
| Entrada | Imagen RGB 640×640, CHW, `float32` en `[0,255]` |
| Salida | Hasta 20 cajas `xyxy`, puntuaciones e IDs LVIS |
| Hardware objetivo | Qualcomm QCS8550 (acelerador HTP) |
| Dependencias | `ai_edge_litert 2.3.0`, Python 3.10+ |

## Arquitectura y entrenamiento

El modelo base es Detic, un detector de objetos de código abierto de Meta AI que combina detección con clasificación de vocabulario abierto mediante el uso de clasificadores de imagen para las etiquetas. Este kit no incluye el modelo original ni sus pesos: documenta una derivación de forma fija con salida limitada a 20 cajas y un conjunto reducido de IDs LVIS. No se proporcionan datos sobre el entrenamiento del checkpoint base (número de tokens o imágenes, composición del dataset, uso de RLHF o DPO), y al no ser un modelo de lenguaje estas métricas no aplican del mismo modo.

La innovación técnica del repositorio está en el pipeline de transformación de grafos para el HTP del QCS8550. Se documentan varias rutas: una compresión solo de pesos (r369/r370) que almacena algunos pesos en INT8 pero computa Conv/FC con activaciones float, sin ser inferencia entera completa; una PTQ automática (r379) cuyo grafo colapsó a AP50 0 en el holdout de maletas; y una ruta A8W8 (r380) que injerta 109 kernels Conv/FC calibrados en el grafo float, conservando en float las operaciones de propuesta, caja y NMS. Los scripts incluyen aserciones estructurales y comprobaciones de humo en CPU, pero no son conversores generales para checkpoints Detic arbitrarios ni para otros vocabularios de clases. El fichero de entrada `r358.tflite` no se suministra y no existe una ruta de un solo comando desde el `.pth` oficial hasta ese intermedio.

## Capacidades

- Detección de objetos sobre una imagen RGB 640×640 con salida de hasta 20 cajas `xyxy`, puntuaciones e IDs LVIS.
- Clases validadas en el experimento: maleta (`35`), silla de ruedas (`1178`) y cochecito de bebé (`31`).
- Reproducción de operaciones de grafo documentadas: límite de propuestas, selección de clases, compresión de pesos, PTQ de activaciones, construcción de islas A8W8 y auditoría del grafo cuantizado.
- Evaluación de holdout con protocolo histórico de clase única (100 JPEG, etiquetas YOLO, 289 cajas de maleta), ampliable a otra clase única mediante `--expected-images`, `--label-class-id` y `--output-class-id`.
- Evaluación de salida en placa que consume `prefix-metadata.json`, ficheros de salida de 480 bytes y JSON de tiempos del runner.
- No soporta prompts de texto, tool calling, agentes, razonamiento multi-paso ni capacidades multilingües: no es un modelo de lenguaje.

## Casos de uso

- Investigación de despliegue en HTP: usar los scripts para reproducir las transformaciones de grafo r358→r366→r367→r369→r370→r379→r380 sobre un TFLite intermedio obtenido legalmente, y auditar cada paso con `detic_audit_quantized_graph.py`.
- Estudio de cuantización W8A32 frente a A8W8: comparar la ruta de solo pesos (r369/r370) con la ruta A8W8 (r380) para medir el impacto en calidad y en viabilidad de ejecución en el acelerador, verificando el colapso documentado de la PTQ automática (r379).
- Evaluación de holdout de una clase: adaptar los evaluadores a otra clase única con `--label-class-id` y `--output-class-id`, preparando un conjunto propio de imágenes y etiquetas YOLO con licencia adecuada.
- Verificación de ejecución real en placa: revisar el log del runtime y del delegate junto al `prefix-metadata.json` del runner para confirmar que la inferencia ocurrió en el HTP, dado que el metadata por sí solo no es prueba independiente.
- Reproducción de humo en CPU: reconstruir las familias de grafos r367 y r380 con Python 3.10 y las versiones fijadas en `requirements-smoke.txt`, comprobando que las cajas, puntuaciones e IDs coinciden en una entrada de prueba.
- Base para una receta upstream→r358: servir de punto de partida documentado para quien aborde la tarea pendiente de obtener el intermedio `r358.tflite` desde el checkpoint oficial `.pth`.

## Benchmarks y rendimiento

El repositorio documenta un protocolo de evaluación histórico de clase única: 100 JPEG, etiquetas en formato YOLO y 289 cajas de maleta, con ID de etiqueta `28` e ID de salida del modelo `35`. Los resultados medidos se remiten a `BENCHMARK.md`; en la información disponible solo se indica explícitamente que la ruta PTQ automática `r379` colapsó a AP50 0 en el holdout de maletas. No se han publicado en la información disponible el resto de cifras de AP50 ni comparativas numéricas con otros modelos.

| Ruta | Tipo de cuantización | Resultado documentado |
|---|---|---|
| r369 / r370 | W8A32 (pesos INT8, activaciones float) | no disponible en la información proporcionada |
| r379 | PTQ automática | AP50 0 en holdout de maletas |
| r380 | A8W8 con 109 kernels Conv/FC calibrados | no disponible en la información proporcionada |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (no se publican pesos ni tamaño del modelo).
- Hardware objetivo: SoC Qualcomm QCS8550 con acelerador HTP; el runner de placa no se incluye porque depende de un SDK instalado.
- GPU recomendadas: no aplica; el kit está orientado a ejecución en el HTP del QCS8550 y a comprobaciones de humo en CPU.
- ¿Cabe en GPU consumer? No disponible; sin pesos publicados no puede determinarse.
- Opciones de despliegue: TFLite LiteRT (`ai_edge_litert 2.3.0`) y el runtime/delegate de Qualcomm para el HTP; no se documentan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles; el evaluador de placa consume un JSON de tiempos del runner, pero las cifras no se recogen en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| detic-qcs8550-htp-research | Kit de investigación source-only sobre Detic de forma fija | no disponible | no aplica | Apache-2.0 (solo código) | Solo scripts; sin pesos |
| Detic (Meta AI) | Detector de vocabulario abierto | no disponible en esta ficha | no aplica | licencia del proyecto upstream | Checkpoints públicos en el repositorio oficial |
| Detectores edge cuantizados para HTP | no disponible | no disponible | no aplica | no disponible | no disponible |

La comparación directa con alternativas de la misma categoría no está disponible en la información proporcionada; el propio repositorio advierte de que no es Detic completo ni un detector con prompts de texto, por lo que la comparación con Detic upstream debe hacerse con cautela.

## Limitaciones y advertencias

- No contiene pesos, imágenes, etiquetas, binarios de Qualcomm ni código Android; no hay modelo descargable.
- No es Detic completo ni un detector con prompts de texto: la selección de IDs no añade conocimiento de nuevas clases.
- Solo tres clases validadas (maleta, silla de ruedas, cochecito); mobility scooter, walker y rollator no están validadas como clases directas.
- Los scripts no son conversores generales: no sirven para checkpoints Detic arbitrarios ni para otros vocabularios de clases.
- Falta el fichero de entrada `r358.tflite` y no existe una ruta de un solo comando desde el `.pth` oficial hasta ese intermedio.
- La ruta W8A32 no es inferencia entera completa; la PTQ automática r379 colapsó a AP50 0 en el holdout de maletas.
- El AP registrado no debe considerarse reproducible de forma independiente hasta que se disponga del conjunto de evaluación original o de un benchmark público equivalente.
- Un `prefix-metadata.json` por sí solo no prueba ejecución en HTP: hay que revisar también el log del runtime y del delegate.
- La licencia Apache-2.0 cubre solo el código y la documentación incluidos; no otorga derechos sobre checkpoints, SDKs ni datasets externos de Detic.
- La evidencia de humo es funcional, no reproducción bit a bit ni sobre el dataset completo: los grafos reconstruidos difirieron en 16 bytes y en SHA-256 respecto a los artefactos registrados, aunque las salidas coincidieron en una entrada comprobada.
- No se documentan sesgos ni riesgos de alucinación propios de un modelo de lenguaje, al no serlo; los riesgos se limitan al rendimiento del detector y a la validez de la evaluación.

## Enlaces

- Hugging Face: https://huggingface.co/anan19990108/detic-qcs8550-htp-research
- Detic (Meta AI, repositorio oficial): https://github.com/facebookresearch/Detic
- BENCHMARK.md (resultados medidos, dentro del repositorio): https://huggingface.co/anan19990108/detic-qcs8550-htp-research/blob/main/BENCHMARK.md
- RELEASE_STATUS.md (trabajo de publicación pendiente): https://huggingface.co/anan19990108/detic-qcs8550-htp-research/blob/main/RELEASE_STATUS.md
- requirements-smoke.txt (versiones fijadas del entorno de humo): https://huggingface.co/anan19990108/detic-qcs8550-htp-research/blob/main/requirements-smoke.txt
- LICENSE (Apache-2.0): https://huggingface.co/anan19990108/detic-qcs8550-htp-research/blob/main/LICENSE
