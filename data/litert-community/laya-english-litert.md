# litert-community/Laya-English-LiteRT

## Resumen

Laya-English-LiteRT es un paquete de conversión a LiteRT del checkpoint en inglés del modelo Laya, desarrollado originalmente por Convai Innovations y empaquetado por la comunidad litert-community para su ejecución en GPU y NPU de dispositivos Android. Laya es un clasificador de texto basado en ModernBERT-large que responde preguntas definidas en tiempo de petición: selección entre opciones, puntuación en escala ordinal o probabilidad sí/no. El paquete incluye tanto el checkpoint base en inglés como su ajuste fino `typed-decisions`, orientado a cuatro flujos de trabajo concretos.

El problema que resuelve es la inferencia de un modelo de clasificación de 1.024 dimensiones ocultas en hardware móvil sin depender de la nube. Cada pregunta se responde con un pase forward del grafo principal más un pase de un pequeño grafo act-head, con tiempos validados de 66 ms por pregunta en la NPU Hexagon de un Samsung Galaxy S26 y 123 ms en su GPU con FP32 explícito, para una ventana de 256 tokens.

La relevancia actual radica en que demuestra que un transformer tipo ModernBERT-large puede ejecutarse con latencias de decenas de milisegundos en un teléfono, manteniendo una fidelidad numérica muy alta respecto a la implementación de referencia en CPU: mismo argmax en todas las preguntas de elección y puntuación, y una diferencia máxima de probabilidad de 0,0008 en GPU y 0,0072 en NPU sobre 140 filas en inglés y 100 de typed-decisions.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT-large (transformer encoder) |
| Parametros totales | no disponible (checkpoint base `convaiinnovations/laya`; tabla de embeddings de 50.368 x 1.024 en fp16) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 256 o 512 tokens según variante del grafo |
| Tipos de cuantizacion | wfp16 (pesos fp16, recomendado) y fp32 (referencia); tabla de embeddings en float16 |
| Idiomas soportados | inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | TFLite (`.tflite`) para LiteRT; tabla de embeddings en `.bin` + `.json`; tokenizer en `tokenizer.json` |

## Arquitectura y entrenamiento

El modelo subyacente es ModernBERT-large, un transformer encoder con 1.024 dimensiones ocultas y una tabla de embeddings de 50.368 tokens. El paquete no entrena un modelo nuevo: convierte el checkpoint `convaiinnovations/laya` (revisión `1c5edc17a7acd8701df6fc341c0d179f1c62c982`) a grafos LiteRT optimizados para GPU y NPU Android. La arquitectura de inferencia se divide en dos grafos: un grafo principal que procesa el texto o estado JSON de entrada y un act-head de 1.057.960 bytes compartido por todas las variantes, que transforma las representaciones en respuestas de elección, escala ordinal o probabilidad.

El diseño separa la tabla de embeddings del grafo principal: la aplicación realiza la búsqueda de filas de embedding desde un fichero `token_embeddings_en_fp16.bin` y pasa esas filas al grafo, lo que reduce el tamaño del modelo desplegado a 739.765.104 bytes en la variante wfp16 de 256 tokens. Se ofrecen variantes de ventana de 256 y 512 tokens, en wfp16 y fp32, más el ajuste fino `typed-decisions` con la misma estructura. No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni el uso de RLHF o DPO en la información proporcionada.

## Capacidades

- Clasificación de texto zero-shot: el usuario define las opciones o la pregunta en tiempo de petición, sin reentrenamiento.
- Selección entre múltiples opciones (argmax sobre las alternativas proporcionadas).
- Puntuación en escala ordinal (por ejemplo, valorar la gravedad de un incidente en una escala definida).
- Probabilidad sí/no para preguntas binarias.
- Procesamiento de texto plano o de estado JSON como entrada.
- Ajuste fino `typed-decisions` especializado en cuatro flujos: atención al cliente, procesamiento de facturas, incidentes de seguridad y observabilidad de trazas de agentes.
- Ejecución en GPU y NPU de Android mediante LiteRT `CompiledModel`.
- No soporta tool calling, agentes multi-paso ni generación de texto libre: es un clasificador, no un modelo generativo.
- Capacidades multilingües: no disponibles en este paquete (solo inglés); existe un paquete hermano multilingüe.

## Casos de uso

- Enrutamiento de tickets de atención al cliente: el ajuste fino `typed-decisions` clasifica el mensaje entrante en categorías definidas en tiempo de petición (por ejemplo, facturación, incidencia técnica, cancelación) con una sola pasada de 123 ms en GPU de móvil, lo que permite enrutar en el propio dispositivo sin enviar el texto a un servidor.
- Procesamiento de facturas en campo: la variante de 512 tokens permite clasificar documentos más largos y responder preguntas como el tipo de gasto o la necesidad de aprobación, ejecutándose en la NPU del teléfono en 73 ms por pregunta.
- Triaje de incidentes de seguridad: el modelo puntúa en escala ordinal la gravedad de un evento descrito en JSON y decide si requiere escalado, con la ventaja de que los datos sensibles no salen del dispositivo.
- Observabilidad de trazas de agentes: el ajuste fino evalúa trazas de agentes y clasifica si una ejecución fue correcta, ambigua o fallida, integrándose en pipelines de evaluación locales.
- Moderación o filtrado en el borde: clasificación sí/no de contenido en aplicaciones Android antes de cualquier llamada de red, con latencia inferior a 130 ms por pregunta.
- Encuestas y formularios inteligentes: convertir respuestas de texto libre en escalas ordinales o categorías predefinidas directamente en el móvil, sin backend.
- Clasificación por lotes en escritorio: el host de referencia `laya_host.py` permite validar el comportamiento en CPU de escritorio antes de desplegar en Android.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

Los únicos datos de rendimiento proporcionados son de latencia y fidelidad en el dispositivo de validación (Samsung Galaxy S26, SM-S942Q, Android 16, LiteRT 2.2.0), a ventana de 256 tokens:

| Metrica | Grafo ingles | Grafo typed-decisions |
|---|---:|---:|
| Tiempo por pregunta en NPU Hexagon | 66 ms | 73 ms |
| Tiempo por pregunta en GPU (FP32 explicito) | 123 ms | 126 ms |
| Diferencia maxima de probabilidad vs. referencia CPU fp32 | 0,0008 (GPU) / 0,0072 (NPU) | no disponible por separado |
| Coincidencia de argmax en 140 filas en ingles | 100 % | no disponible |
| Coincidencia de argmax en 100 filas typed-decisions | no disponible | 100 % |

Como referencia comparativa del paquete hermano multilingüe: 51 ms por pregunta y 0,68 GB en el teléfono, frente a 123 ms y 0,85 GB del paquete en inglés.

## Requisitos de hardware

- Tamaño del modelo desplegado: 739.765.104 bytes (0,74 GB) por grafo en wfp16; 1.478.482.924 bytes (1,48 GB) en fp32; más 103.153.664 bytes de tabla de embeddings fp16.
- VRAM/RAM estimada para inferencia: aproximadamente 0,85 GB en wfp16 (modelo más tabla) y 1,6 GB en fp32, según los tamaños de fichero indicados.
- Hardware validado: Samsung Galaxy S26 (SM-S942Q) con NPU Hexagon y GPU, Android 16.
- Otras GPU y NPU Android no han sido validadas según la model card.
- Cabe en hardware móvil de gama alta con NPU; no se especifican requisitos para GPU de escritorio o de servidor.
- Opciones de despliegue: LiteRT 2.2.0 `CompiledModel` en Android; `laya_host.py` como host de referencia en Python para CPU de escritorio.
- Latencia: 66-73 ms por pregunta en NPU y 123-126 ms en GPU a 256 tokens; el paquete multilingüe añade 15-20 ms de búsqueda de tabla en la aplicación.
- Throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Despliegue | Latencia por pregunta |
|---|---|---|---|---|---|---|
| Laya-English-LiteRT | ModernBERT-large (no disponible el conteo exacto) | 256 / 512 tokens | inglés | Apache 2.0 | LiteRT Android (GPU/NPU) | 66-126 ms (S26) |
| Laya-Multilingual-LiteRT | mmBERT-base | 256 tokens | 100+ idiomas (validado en inglés y japonés) | Apache 2.0 | LiteRT Android (GPU) | 51 ms (S26) |
| laya-LiteRT | mismos dos checkpoints en forma token-id | 256 / 512 tokens | inglés y multilingüe | Apache 2.0 | LiteRT, entrada de token ids | 54-127 ms (S26) |
| convaiinnovations/laya (original) | ModernBERT-large | no disponible | inglés | Apache 2.0 | CPU fp32 (referencia) | no disponible |

La comparativa con clasificadores zero-shot convencionales (por ejemplo, DeBERTa o BART-large MNLI) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Solo soporta inglés; para texto no inglés o mixto debe usarse el paquete multilingüe, que obtiene 0,843 en XNLI inglés frente a 0,860 del checkpoint inglés.
- Es un clasificador, no un generador: no produce texto libre, no hace tool calling ni razonamiento multi-paso.
- Ventana de contexto limitada a 256 o 512 tokens; textos más largos requieren truncado o segmentación.
- Validación restringida a un único dispositivo (Samsung Galaxy S26); el comportamiento en otras GPU y NPU Android no está verificado.
- La fidelidad numérica respecto a la referencia CPU no es exacta: diferencia máxima de probabilidad de 0,0008 en GPU y 0,0072 en NPU, lo que puede alterar decisiones en casos cerca del umbral.
- El paquete en inglés no incluye aplicación de ejemplo propia; requiere que la aplicación realice la búsqueda de embeddings y el tokenizado con el `tokenizer.json` incluido.
- Riesgo de alucinación: no aplica en el sentido generativo, pero el modelo puede asignar alta probabilidad a opciones incorrectas cuando la pregunta es ambigua o el texto de entrada está fuera de distribución.
- Sesgos: no se documentan sesgos específicos en la información disponible; al ser un modelo entrenado sobre datos en inglés, puede heredar sesgos de ese corpus.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías sobre el rendimiento en dominios no validados.
- El repositorio ocupa 18,0 GB, aunque los ficheros individuales necesarios para el despliegue son mucho menores.

## Enlaces

- Hugging Face: https://huggingface.co/litert-community/Laya-English-LiteRT
- Modelo base: https://huggingface.co/convaiinnovations/laya
- Paquete multilingüe: https://huggingface.co/litert-community/Laya-Multilingual-LiteRT
- Paquete en forma token-id: https://huggingface.co/litert-community/laya-LiteRT
- LiteRT (GitHub): https://github.com/google-ai-edge/litert
- Ejemplo zero-shot classification en litert-samples: https://github.com/google-ai-edge/litert-samples/tree/main/samples/litert/zero_shot_classification
