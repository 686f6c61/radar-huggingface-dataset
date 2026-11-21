# litert-community/laya-LiteRT

## Resumen

laya-LiteRT es un paquete de conversión a LiteRT (TFLite) de los checkpoints del modelo laya de convaiinnovations, publicado por la comunidad litert-community. No es un modelo generativo: es un codificador de decisiones que, dada una secuencia de entrada, responde a preguntas tipadas con tres formatos de salida: `choice` (una opción entre varios criterios), `score` (una escala ordenada) y `noul` (probabilidad de que una afirmación se cumpla). Cada pregunta requiere un único forward pass, lo que lo hace adecuado para inferencia en dispositivo.

El repositorio contiene dos checkpoints en forma de token-ids: el modelo inglés, basado en ModernBERT-large con la cabeza de decisión de laya (421M parámetros), y el multilingüe, basado en mmBERT-base con la misma cabeza (322M parámetros; el editor declara más de 100 idiomas). Los grafos tienen una ventana estática por fichero (256 o 512 tokens) y pesos en fp32 o float16 según la variante.

La relevancia de esta conversión es la ejecución local en Android: los grafos se han validado en un Samsung Galaxy S26 con LiteRT 2.2.0 sobre GPU y NPU, con latencias de decenas o centenas de milisegundos por pregunta y paridad verificada frente a la implementación fp32 del editor. Está pensado para clasificación y enrutado de decisiones en aplicaciones móviles, no para generación de texto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder: ModernBERT-large (inglés) y mmBERT-base (multilingüe) con cabeza de decisión de laya |
| Parametros totales | 421M (inglés), 322M (multilingüe) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | ventana estática de 256 o 512 tokens según el fichero |
| Tipos de cuantizacion | fp32 y float16 (wfp16: pesos FULLY_CONNECTED y EMBEDDING_LOOKUP en float16 con DEQUANTIZE a float32; activaciones en float32) |
| Idiomas soportados | inglés y japonés validados; multilingüe con más de 100 idiomas declarados por el editor |
| Licencia | Apache 2.0 |
| Formato de pesos | TFLite (LiteRT); tokenizer.json, tokenizer_config.json y rl_agent_config.json en `en/` y `multilingual/` |

## Arquitectura y entrenamiento

El paquete no entrena un modelo nuevo: convierte los checkpoints de convaiinnovations/laya (revisión `1c5edc17`) a grafos LiteRT clásicos con una ventana estática por fichero. La arquitectura subyacente es un encoder transformer (ModernBERT-large en inglés, mmBERT-base en multilingüe) al que se añade la cabeza de decisión propietaria de laya, que produce respuestas calibradas a preguntas tipadas en lugar de texto generado. La forma de petición y respuesta es la del propio laya.

Esta variante concreta (laya-LiteRT) recibe token ids y lleva la tabla de embeddings dentro del grafo, a diferencia de los paquetes Laya-Multilingual-LiteRT y Laya-English-LiteRT, que reciben filas de embedding que la aplicación consulta desde un fichero de tabla. Incluye un host de referencia (`laya_host.py`, con el constructor de prompt y el decodificador de laya 0.3.4 sobre un runner `CompiledModel` en CPU) y un contrato de host (`HOST_CONTRACT.md`) que especifica la secuencia y la decodificación para un port. El fichero `multilingual/calibration.json` contiene un ajuste de temperatura realizado específicamente para esta conversión. No se detallan en la información disponible los datos de entrenamiento, el número de tokens ni si hubo RLHF o DPO.

## Capacidades

- Clasificación de texto y toma de decisiones tipadas: salida `choice` (una entre varios criterios), `score` (escala ordenada) y `noul` (probabilidad de que una afirmación se cumpla).
- Una sola pasada hacia delante por pregunta, sin generación de texto.
- Clasificación zero-shot mediante preguntas tipadas (hay una muestra `zero_shot_classification` en litert-samples).
- Soporte multilingüe en la variante mmBERT (más de 100 idiomas declarados; validado en inglés y japonés).
- Ejecución en dispositivo Android sobre GPU y NPU mediante LiteRT `CompiledModel`.
- No dispone de tool calling, function calling, razonamiento multi-paso, visión ni audio según la información disponible.

## Casos de uso

- Clasificación zero-shot en aplicaciones Android: el modelo responde a preguntas tipadas sobre el texto de entrada con una sola pasada, lo que permite clasificar sin entrenar un clasificador específico y sin salir del dispositivo.
- Enrutado de decisiones en asistentes conversacionales: la salida `choice` permite seleccionar una de varias rutas o intenciones por turno, con latencias de 54 ms (multilingüe, 256 tokens, GPU) o 127 ms (inglés, 256 tokens, GPU) en el dispositivo de prueba.
- Procesamiento de facturas y documentos: la salida `score` sobre escalas ordenadas sirve para priorizar o validar campos en flujos de back office, con la ventaja de que el proceso ocurre localmente.
- Observabilidad de trazas de agentes: el paquete inglés incluye un fine-tune `typed-decisions/` para cuatro flujos (atención al cliente, procesamiento de facturas, incidentes de seguridad y observabilidad de trazas de agentes), útil para etiquetar trazas sin enviar datos a un servidor.
- Moderación y verificación de afirmaciones: la salida `noul` devuelve una probabilidad de que una afirmación se cumpla, aplicable a comprobaciones de consistencia en el propio dispositivo.
- Aplicaciones multilingües o con texto mixto: la variante mmBERT responde también en inglés con una puntuación cercana (XNLI inglés 0.843 frente a 0.860 del checkpoint inglés), lo que permite un único paquete para varios idiomas.
- Despliegue en dispositivos sin conectividad o con requisitos de privacidad: al ejecutarse con LiteRT sobre GPU o NPU, los datos de entrada no abandonan el teléfono.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Los únicos datos numéricos proporcionados son de latencia y paridad en el dispositivo de prueba (Samsung Galaxy S26, SM-S942Q, Android 16, LiteRT 2.2.0, GPU con precisión FP32 explícita, 2026-09-21):

| Fichero | Checkpoint | Ventana | Pesos | Tamano (bytes) | Rendimiento medido |
|---|---|---:|---|---:|---|
| `laya_ml_s256_fp32.tflite` | multilingüe | 256 | fp32 | 1.287.376.352 | GPU FP32: 54 ms/pregunta (mediana en caliente); CPU 4 hilos: 222 ms; NPU: 37 ms con una probabilidad 0,0115 por encima del límite de 0,01 |
| `laya_ml_s512_fp32.tflite` | multilingüe | 512 | fp32 | 1.288.293.856 | GPU FP32: 138 ms/pregunta; CPU 4 hilos: 649 ms (2026-09-23, paridad de 201 filas, 0 cambios) |
| `laya_ml_s256_wfp16.tflite` | multilingüe | 256 | float16 | 644.077.360 | NPU: 37 ms/pregunta (2026-09-29, paridad de 201 filas, 81/81, Δp máx. 0,0068); CPU 4 hilos: 245 ms (2026-09-21, paridad de 40 filas, 0 cambios); no compila en GPU |
| `laya_en_s256_fp32.tflite` | inglés | 256 | fp32 | 1.684.756.736 | GPU FP32: 127 ms/pregunta; NPU: 84 ms (2026-09-29, paridad de 140 filas, 59/59, Δp máx. 0,0054) |
| `laya_en_s512_fp32.tflite` | inglés | 512 | fp32 | 1.685.805.312 | GPU FP32: 442 ms/pregunta |
| `laya_en_s512_wfp16.tflite` | inglés | 512 | float16 | 843.929.776 | CPU 4 hilos: 1.326 ms/pregunta; no compila en GPU |

En el fixture público de decisión con tres opciones (144 filas), las elecciones del teléfono coinciden con la implementación del editor 144/144. En las filas capturadas, las puntuaciones del teléfono coinciden con `Agent.predict` en fp32 del editor (argmax idéntico, probabilidades dentro de 0,0001 tras la misma calibración). El editor reporta XNLI inglés de 0,843 para el checkpoint multilingüe frente a 0,860 para el inglés.

## Requisitos de hardware

- VRAM/almacenamiento: los ficheros van de 644 MB (multilingüe 256, wfp16) a 1,69 GB (inglés 512, fp32); el repositorio completo ocupa 14,9 GB.
- GPU de móvil: validado en GPU de Samsung Galaxy S26 con LiteRT 2.2.0 a precisión FP32 explícita; no se han probado otros teléfonos ni familias de GPU.
- NPU: los ficheros wfp16 están pensados para NPU (37 ms en multilingüe 256, 84 ms en inglés 256); los fp32 también se ejecutaron en NPU con paridad verificada.
- CPU: 4 hilos dan 222 ms (multilingüe 256 fp32), 245 ms (multilingüe 256 wfp16) y 1.326 ms (inglés 512 wfp16).
- No cabe en GPU de consumo de escritorio en el sentido habitual: el destino es LiteRT en Android; no se proporcionan datos de despliegue en A100, H100 o RTX 4090.
- Opciones de despliegue: LiteRT 2.2.0 `CompiledModel` en Android; el paquete incluye `laya_host.py` como host de referencia en CPU y `HOST_CONTRACT.md` para portarlo.
- Advertencia de compilación: en el teléfono probado, el acelerador GPU de LiteRT 2.2.0 deja los nodos DEQUANTIZE y EMBEDDING_LOOKUP en la partición de CPU y falla al compilar los ficheros wfp16, por lo que estos se ejecutaron en CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato / despliegue |
|---|---|---|---|---|---|
| laya-LiteRT (este) | 421M (inglés) / 322M (multilingüe) | 256 o 512 tokens (ventana estática) | inglés, japonés, multilingüe (100+ declarados) | Apache 2.0 | TFLite / LiteRT en Android |
| Laya-Multilingual-LiteRT | 322M (mmBERT-base) | 256 tokens | multilingüe (100+ declarados) | no indicada en la información disponible | TFLite con tabla de embeddings externa; 0,68 GB, 51 ms/pregunta; incluye app Android con tokenizador Kotlin |
| Laya-English-LiteRT | 421M (ModernBERT-large) | 256 tokens | inglés | no indicada en la información disponible | TFLite con tabla de embeddings externa; 0,85 GB, 123 ms/pregunta; incluye fine-tune para cuatro flujos |
| convaiinnovations/laya (original) | no disponible | no disponible | no disponible | no indicada en la información disponible | checkpoints originales en fp32 (`Agent.predict`) |

La diferencia principal entre los tres paquetes LiteRT es la forma de entrada: este recibe token ids con la tabla de embeddings dentro del grafo, mientras que los otros dos reciben filas de embedding consultadas por la aplicación, lo que añade unos 15-20 ms de búsqueda en tabla.

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto libre, solo respuestas a preguntas tipadas (`choice`, `score`, `noul`).
- Ventana de contexto estática de 256 o 512 tokens según el fichero; entradas más largas requieren truncado o troceado por parte de la aplicación.
- Los ficheros wfp16 no compilan en la GPU del dispositivo probado con LiteRT 2.2.0; deben ejecutarse en CPU o NPU.
- La validación se limita a un Samsung Galaxy S26 con LiteRT 2.2.0; otros teléfonos y familias de GPU no se han probado.
- En la NPU, el fichero multilingüe 256 fp32 produjo una probabilidad 0,0115 por encima del límite de 0,01; el editor recomienda el fichero wfp16 en NPU.
- El multilingüe está validado en inglés y japonés; el resto de los más de 100 idiomas declarados no está verificado en esta conversión.
- Riesgo de alucinación: no aplica en el sentido generativo, pero las probabilidades de las salidas `score` y `noul` dependen de la calibración (`multilingual/calibration.json`) y de la formulación de la pregunta.
- No se detallan sesgos conocidos ni restricciones adicionales de uso comercial más allá de la licencia Apache 2.0.
- El fine-tune `typed-decisions/` solo está en el paquete inglés (Laya-English-LiteRT), no en este repositorio.

## Enlaces

- [laya-LiteRT en Hugging Face](https://huggingface.co/litert-community/laya-LiteRT)
- [convaiinnovations/laya (modelo base)](https://huggingface.co/convaiinnovations/laya/tree/1c5edc17a7acd8701df6fc341c0d179f1c62c982)
- [Laya-Multilingual-LiteRT](https://huggingface.co/litert-community/Laya-Multilingual-LiteRT)
- [Laya-English-LiteRT](https://huggingface.co/litert-community/Laya-English-LiteRT)
- [LiteRT (Google AI Edge)](https://github.com/google-ai-edge/litert)
- [Muestra zero_shot_classification en litert-samples](https://github.com/google-ai-edge/litert-samples/tree/main/samples/litert/zero_shot_classification)
