# muyleanging/Lekha-HTR-Khmer

## Resumen

Lekha-HTR-Khmer es un modelo de reconocimiento de escritura manual (HTR, handwriting text recognition) para jemer (khmer), desarrollado por Muyleang Ing. Se presenta como el modo de escritura manual de Chakkhu, el sistema OCR del mismo autor, y forma parte de una familia de herramientas para el jemer que incluye Sota (ASR), Chakkhu (OCR), Tossana (captioning), Akkhara (teclado) y VoxPocket (TTS). El modelo está pensado para leer notas y formularios manuscritos en jemer y exportarse a ONNX int8 para inferencia en dispositivo.

En el momento de redactar esta ficha, el repositorio no contiene pesos: la model card indica explícitamente que es un trabajo en curso y que el primer modelo se publicará cuando esté entrenado y probado. El diseño previsto estima unos 14 millones de parámetros y reutiliza el vocabulario y el estilo de decoder de Chakkhu, con 3.402 tokens de clústeres del jemer.

Su relevancia es de nicho pero clara: el jemer tiene poca cobertura en herramientas OCR y HTR de código abierto, y la propuesta de un modelo pequeño, cuantizado a int8 y ejecutable en dispositivo encaja con escenarios de digitalización de formularios y notas en contextos con conectividad limitada. Cualquier evaluación de rendimiento debe posponerse hasta que se publiquen los pesos y los resultados de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (se describe como decoder con el mismo estilo de tokens que Chakkhu; no se detalla el tipo de red) |
| Parametros totales | aproximadamente 14M (estimacion prevista, no confirmada con pesos publicados) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8 (exportacion ONNX prevista) |
| Idiomas soportados | jemer (km) |
| Licencia | "other", con nombre de licencia "lekha-tbd" (pendiente de decidir en la primera release) |
| Formato de pesos | ONNX (previsto); no hay pesos publicados |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna mas alla de que el modelo reutilizara los mismos tokens y el estilo de decoder de Chakkhu, con un vocabulario de 3.402 tokens de clústeres del jemer. El objetivo declarado es procesar imagenes de lineas manuscritas, tanto reales como sinteticas, y exportar el modelo a ONNX en int8 para inferencia en dispositivo. No se especifican el numero de capas, la dimension oculta, el mecanismo de atencion ni el tipo exacto de encoder de imagen.

Tampoco se han publicado datos sobre el volumen de entrenamiento, la composicion del dataset, el uso de RLHF/DPO ni innovaciones tecnicas concretas. La model card incluye una tabla de estado en la que el paso "Handwriting data (open licenses)" figura como "planned" y "First model" como "soon", lo que confirma que el entrenamiento aun no ha concluido o no se ha documentado.

## Capacidades

- Reconocimiento de texto manuscrito en jemer a partir de imagenes de lineas (image-to-text).
- Procesamiento de notas y formularios manuscritos, segun la descripcion del autor.
- Integracion prevista como modo de escritura manual dentro del sistema Chakkhu.
- Inferencia en dispositivo gracias a la exportacion ONNX int8.
- Capacidades de tool calling, agentes, razonamiento multi-paso, vision general, audio o thinking mode: no disponibles ni anunciadas.
- Capacidades multilingues: limitadas al jemer (km).

## Casos de uso

- Digitalizacion de formularios manuscritos en jemer: el modelo leería lineas de texto de formularios escaneados o fotografiados y las convertiría en texto editable, lo que resulta adecuado por su enfoque específico en escritura manual y su vocabulario de clústeres del jemer.
- Archivo de notas personales: conversión de cuadernos y notas manuscritas en jemer a texto digital para su indexación y búsqueda.
- Integración en aplicaciones móviles sin conexión: al exportarse a ONNX int8 y estar pensado para on-device, podría ejecutarse localmente en dispositivos con recursos limitados, evitando el envío de documentos sensibles a servidores.
- Modo de entrada por escritura en Chakkhu: uso como complemento del OCR de documentos impresos, permitiendo al mismo sistema leer tanto texto impreso como manuscrito.
- Preservación de documentación histórica o administrativa en jemer: digitalización de registros manuscritos para su conservación y consulta.
- Automatización de extracción de datos en entornos con conectividad limitada: procesamiento local de formularios en oficinas o zonas rurales donde no es fiable el acceso a servicios en la nube.
- Evaluación e investigación en HTR de lenguas de bajos recursos: como referencia pequeña (≈14M parámetros) para experimentos de reconocimiento de escritura en jemer.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precision; con ≈14M parametros y cuantizacion int8, la huella de pesos seria del orden de decenas de MB, pero no se ha confirmado con pesos publicados.
- GPU recomendadas: no disponibles; el enfoque on-device sugiere ejecucion en CPU o aceleradores de baja potencia, sin datos concretos.
- Compatibilidad con GPU de consumo: previsiblemente si, dado el tamano estimado, pero no confirmado.
- Opciones de despliegue: ONNX Runtime (formato de exportacion previsto); otras opciones no disponibles.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Lekha-HTR-Khmer | ≈14M (estimado) | no disponible | jemer | lekha-tbd (pendiente) | sin pesos publicados |
| Chakkhu (OCR del mismo autor) | no disponible | no disponible | jemer | no disponible | no disponible en la informacion proporcionada |
| Alternativas genericas de HTR multilingue | no disponible | no disponible | varios | no disponible | no disponible |

No se dispone de datos suficientes para una comparativa cuantitativa con alternativas de la misma categoria.

## Limitaciones y advertencias

- El repositorio no contiene pesos: no es posible evaluar ni desplegar el modelo actualmente.
- La arquitectura, el contexto y los datos de entrenamiento no estan documentados; el tamano de ≈14M parametros es una estimacion del autor, no una medicion sobre pesos publicados.
- La licencia esta sin decidir ("lekha-tbd"), por lo que no se puede confirmar el uso comercial ni las condiciones de redistribucion.
- El modelo esta limitado al jemer; no se anuncia soporte multilingue.
- Al ser un modelo de reconocimiento de escritura, es previsible que tenga errores en caligrafias muy variables, ruido en la imagen o documentos degradados, aunque no se han publicado tasas de error.
- Riesgo de alucinacion en la transcripcion: sin benchmarks no puede descartarse que el decoder genere texto plausible pero incorrecto, especialmente en lineas ambiguas.
- No hay informacion sobre sesgos demograficos o de estilo de escritura en los datos de entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/muyleanging/Lekha-HTR-Khmer
- Sota (ASR en jemer): https://huggingface.co/muyleanging/Sota-ASR-Khmer-ONNX
- Chakkhu (OCR, demo web): https://muyleanging.github.io/chakkhu-web/
- Tossana (captioning en jemer): https://huggingface.co/muyleanging/Tossana-Caption-Khmer
- Akkhara (teclado, demo web): https://muyleanging.github.io/akkhara-web/
- VoxPocket (TTS en jemer): https://huggingface.co/muyleanging/VoxPocket-TTS-Khmer
