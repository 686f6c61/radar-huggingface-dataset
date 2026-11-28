# chengli-thu/naming-ai-detector-bge-zh

## Resumen

El modelo `chengli-thu/naming-ai-detector-bge-zh` es un detector de texto generado por IA, desarrollado por el usuario chengli-thu, que parte del encoder chino `BAAI/bge-small-zh-v1.5` y lo afina como un clasificador de tres cabezas. Resuelve un problema concreto: dado un texto en chino o en inglés, estimar si ha sido producido por una IA, qué tokens concretos presentan patrones artificiales y qué proporción del documento es atribuible a IA. No identifica el modelo generador, solo el carácter sintético del texto.

La arquitectura es un transformer encoder de tipo BERT (BGE small) con 25.676.932 parámetros totales, adaptado mediante fine-tuning supervisado a una tarea de token-classification con tres salidas: probabilidad y decisión a nivel de documento, probabilidad y máscara por token, y proporción estimada de IA. El contexto de análisis se procesa en ventanas de hasta 512 tokens, con un máximo de 16 ventanas por documento, lo que permite cubrir textos largos marcando explícitamente las colas no procesadas.

Es relevante porque aborda la detección de texto sintético en un entorno bilingüe (chino e inglés) con un modelo compacto de 0,1 GB, desplegable en CPU, y porque publica una calibración de umbral explícita y métricas de segmentación a nivel de token, algo poco habitual en este tipo de detectores. La licencia general no está declarada, lo que condiciona su uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (BGE small, tipo BERT) con tres cabezas de clasificación |
| Parametros totales | 25.676.932 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | Ventanas de hasta 512 tokens; máximo 16 ventanas por documento |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Chino (zh) e inglés (en) |
| Licencia | No declarada a nivel de repositorio (el modelo base BGE lista MIT; el checkpoint afinado, el código y los datos no tienen licencia general) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning del encoder `BAAI/bge-small-zh-v1.5`, un transformer bidireccional de tipo BERT con 25,7 millones de parámetros, adaptado a una tarea de token-classification con tres cabezas: una de documento (probabilidad y decisión binaria de IA), una de token (probabilidad por token y máscara `1`/`0`/`null`) y una de proporción (estimación de la fracción de texto generada por IA). El checkpoint publicado corresponde al mejor modelo de validación (011-07) de la época 2 de un entrenamiento de 3 épocas.

El entrenamiento usó 999.061 registros de texto preparados (341.346.152 tokens supervisados): 174.083 en chino y 824.978 en inglés. Las fuentes son Zhihu (39.624 zh), OpenReview (12.270 en), C-HAT-240K (117.306 zh), GPABench2 (794.493 en) y artículos académicos (35.368, de los cuales 18.215 en y 17.153 zh). La validación empleó 63.281 registros (16.468 zh, 46.813 en). El autor advierte que son filas preparadas, no documentos fuente únicos, y que los datos de entrenamiento no se incluyen en el repositorio. El umbral de documento guardado es 0,9964611856026986, seleccionado sobre 2.078 documentos puros de Zhihu (1.039 humanos, 1.039 IA) exigiendo recall de validación de al menos 91,5 % y precisión superior al 90 %, y eligiendo después el umbral más alto para reducir falsos positivos sobre texto humano.

## Capacidades

- Detección de texto generado por IA a nivel de documento, con probabilidad y decisión binaria.
- Detección a nivel de token: probabilidad por token y máscara con valores `1` (tipo IA), `0` (tipo humano) y `null` (fuera de la ventana procesada).
- Estimación de la proporción de texto atribuible a IA en el documento.
- Soporte bilingüe chino-inglés en la misma entrada.
- Procesamiento de documentos largos mediante ventanas de hasta 512 tokens y hasta 16 ventanas, con metadatos de cobertura que marcan la cola no procesada.
- Offsets de token en caracteres Unicode (rangos semiabiertos) y en UTF-16 para selección en navegador.
- Ejecución en CPU o GPU mediante el código de inferencia incluido (`predict.py`, clase `ThreeHeadDetector`).
- No identifica el modelo generador del texto; solo estima el carácter sintético.
- No dispone de tool calling, function calling, capacidades de agente, visión ni audio.

## Casos de uso

- Moderación de contenido generado por IA en plataformas de publicación: el modelo devuelve una probabilidad de documento y una máscara por token, lo que permite señalar fragmentos concretos sospechosos en artículos o respuestas, con ventanas de 512 tokens y cobertura de hasta 16 ventanas por documento.
- Filtrado de reseñas y respuestas en foros chinos: entrenado con datos de Zhihu y calibrado sobre documentos puros de Zhihu, es adecuado para triaje previo de contenido en ese dominio, siempre con revisión humana dado el 5,54 % de falsos positivos sobre texto humano en la re-evaluación.
- Detección de texto sintético en revisiones académicas: el uso de OpenReview y artículos académicos en el entrenamiento lo hace aplicable a la revisión de envíos en inglés y chino, combinando la señal de documento con la proporción estimada de IA.
- Análisis de integridad en flujos editoriales: la máscara por token y los offsets UTF-16 permiten resaltar en un editor web los tramos marcados como IA, facilitando la revisión manual de manuscritos.
- Investigación sobre detección de texto generado: el modelo publica umbral calibrado, métricas de segmentación (macro-F1 de token 0,6937 en documentos puros, IoU de IA 0,6972) y proporción de error (MAE 0,3524 en puros), lo que lo convierte en una línea base reproducible para experimentos bilingües.
- Despliegue ligero en CPU para preprocesado por lotes: con 25,7 millones de parámetros y 0,1 GB de repositorio, puede ejecutarse en CPU dentro de pipelines de ingesta documental para etiquetar grandes volúmenes antes de un análisis más costoso.
- Triaje en sistemas de gestión de confianza y seguridad: la probabilidad de documento puede usarse como señal de entrada en un sistema de scoring, con el umbral guardado (0,9965) como punto de partida y recalibración sobre datos propios.

## Benchmarks y rendimiento

| Medida (documentos puros, split-0 de Zhihu) | Resultado |
|---|---:|
| Precisión | 94,28 % |
| Recall | 91,31 % |
| Tasa de falsos positivos sobre humano | 5,54 % |
| Exactitud | 92,89 % |
| Recuentos | 4.563 TP · 277 FP · 434 FN · 4.723 TN |

| Medida de segmentación (split 0) | Resultado |
|---|---:|
| Macro-F1 de token en documentos puros | 0,6937 |
| Macro-F1 de token en documentos mixtos | 0,5691 |
| Macro-F1 de segmento fuente en mixtos | 0,4408 |
| IoU de token IA | 0,6972 |
| F1 de frontera a ±1 token | 0,0132 |
| MAE de proporción de IA en puros | 0,3524 |
| MAE de proporción de IA en mixtos | 0,3015 |

| Validación del umbral (2.078 documentos puros de Zhihu) | Resultado |
|---|---:|
| Precisión | 94,16 % |
| Recall | 91,53 % |

No se han publicado comparaciones con otros detectores en la información disponible. El autor advierte que el split-0 no es una prueba ciega: se usó en el desarrollo previo del proyecto y en comparaciones de modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP32 para 25,7 millones de parámetros; el repositorio ocupa 0,1 GB.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de memoria; no requiere A100 ni H100. Funciona en CPU, como demuestra el ejemplo oficial (`--device cpu`).
- Cabe en cualquier GPU de consumo (RTX 3060, RTX 4090, GTX 1650, etc.) e incluso en entornos sin GPU.
- Opciones de despliegue: el código propio incluido (`predict.py` con `ThreeHeadDetector`), ejecutable como script (`python predict.py --file example.txt --device cpu`) o como biblioteca. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponibles en la información proporcionada.
- Requisitos de entorno: Python 3.10-3.12 y las dependencias de `requirements.txt` del repositorio.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| chengli-thu/naming-ai-detector-bge-zh | 25,7 M | Ventanas de 512 tokens, hasta 16 ventanas | zh, en | No declarada | Hugging Face |
| BAAI/bge-small-zh-v1.5 (modelo base) | no disponible | no disponible | zh (principalmente) | MIT | Hugging Face |
| Otros detectores de texto IA bilingües | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks de detectores alternativos en la información proporcionada, por lo que no es posible una comparación cuantitativa de rendimiento.

## Limitaciones y advertencias

- El modelo estima patrones de texto y no prueba la autoría; sus salidas no deben presentarse como evidencia definitiva.
- La calibración del umbral se hizo sobre documentos puros de Zhihu y la re-evaluación usó el split-0, que no es una prueba ciega; el autor advierte que los resultados no garantizan precisión o recall en textos futuros y recomienda una evaluación independiente y representativa.
- Tasa de falsos positivos sobre texto humano del 5,54 % en la re-evaluación, con umbral fijado en 0,9965; recalibrar antes de usar en producción.
- La segmentación por token es débil: F1 de frontera a ±1 token de 0,0132 y MAE de proporción de IA de 0,3524 en documentos puros; la máscara y la proporción deben tratarse como estimaciones y revisarse.
- Cobertura limitada: ventanas de 512 tokens y máximo 16 ventanas por documento; la cola no procesada se marca con `null` en la máscara.
- Solo admite chino e inglés; no se documenta soporte de otros idiomas.
- Entrada vacía lanza `ValueError`.
- Licencia: el repositorio no declara licencia general. El modelo base lista MIT, pero eso no concede por sí mismo derechos sobre el checkpoint afinado, el código del proyecto ni los datos de entrenamiento; los derechos de publicación de todas las fuentes de entrenamiento no están confirmados. La disponibilidad pública no otorga permiso de reutilización.
- Riesgo de sesgo por dominio: el entrenamiento está dominado por datos de Zhihu, OpenReview, C-HAT-240K y GPABench2; el rendimiento puede degradarse en otros géneros o registros.
- No identifica el modelo generador, por lo que no sirve para atribuir texto a un sistema concreto.
- No dispone de tool calling, agentes, visión ni audio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/chengli-thu/naming-ai-detector-bge-zh
- Modelo base: https://huggingface.co/BAAI/bge-small-zh-v1.5
