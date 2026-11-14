# dilys-ai/gliner-x-base-int8

## Resumen

GLiNER-X base int8 (Dilys) es una versión re-cuantizada a int8 del modelo `knowledgator/gliner-x-base`, un modelo de reconocimiento de entidades nombradas (NER) de tipo generalista basado en la arquitectura GLiNER. Lo publica el usuario `dilys-ai` y su propósito declarado es la detección de nombres y otros datos personales (PII) en el propio dispositivo, tanto en teléfonos Android como en el navegador, antes de que el texto salga del dispositivo. El modelo original lo desarrolla Knowledgator y su encoder es mT5 base de Google.

La aportación de esta versión no es un nuevo entrenamiento ni un ajuste fino, sino una receta de cuantización distinta a la publicada por el autor original: cuantización dinámica int8 de pesos por tensor con ONNX Runtime, manteniendo en fp32 las 12 matmuls de salida del feed-forward del encoder mT5 (nodos `DenseReluDense/wo/MatMul`) para evitar los errores que provoca int8 en los valores atípicos de activación de esa capa. El resultado es un fichero ONNX de unos 370 MB frente a los 1,2 GB del fp32 original.

Es relevante ahora porque el modelo es un reemplazo directo del `onnx/model_quantized.onnx` del repositorio original (mismas entradas, salidas, tokenizer y configuración) y porque el autor publica métricas de calidad y latencia medidas en hardware móvil y en navegador, un escenario donde el NER de PII en local es especialmente sensible a los compromisos entre tamaño, velocidad y precisión.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | GLiNER sobre encoder mT5 base (transformer bidireccional para NER zero-shot); exportado a ONNX y cuantizado a int8 |
| Parámetros totales | no disponible (el fichero int8 pesa 369.862.229 bytes; el fp32 de origen, 1.207.693.659 bytes) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | int8 dinámico (QInt8), por tensor (`per_channel=False`), solo operadores `MatMul` y `Gather`; 12 matmuls del feed-forward del encoder mT5 en fp32 |
| Idiomas soportados | multilingüe, inglés (en), neerlandés (nl), francés (fr) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`onnx/model_quantized.onnx`); se incluyen `tokenizer.json` y `gliner_config.json` sin cambios |

## Arquitectura y entrenamiento

El modelo es un GLiNER (Generalist Model for Named Entity Recognition using Bidirectional Transformer, arXiv:2311.08526), un enfoque de NER zero-shot que combina un encoder bidireccional con etiquetas de entidad codificadas como texto, de forma que el conjunto de etiquetas se especifica en tiempo de inferencia en lugar de fijarse durante el entrenamiento. En esta versión el encoder es mT5 base de Google. El fichero distribuido aquí es una exportación ONNX del modelo original, no un modelo entrenado desde cero.

No hubo reentrenamiento ni ajuste fino en esta versión: solo se re-cuantizó el `onnx/model.onnx` fp32 del repositorio de Knowledgator en la revisión `a6c7a8fbfe2066c68d12c0480418504fde6d91d1`, mediante `onnxruntime.quantization.quantize_dynamic` (ONNX Runtime 1.31.1, onnx 1.23.2) con `weight_type=QInt8`, `per_channel=False` y `op_types_to_quantize=['MatMul', 'Gather']`. La innovación técnica destacable es la exclusión explícita de los 12 matmuls de salida del feed-forward del encoder mT5 del proceso de cuantización, porque los valores atípicos de activación en esa capa son el punto donde int8 falla en este modelo. La receta es determinista: repetirla sobre el mismo origen produce el mismo SHA-256.

En cuanto a datos de entrenamiento, esta versión hereda los del modelo base, cuya model card cita `knowledgator/gliner-multilingual-synthetic` (sin licencia declarada en Hugging Face) y `lang-uk/UberText-NER-Silver` (Apache 2.0). No se dispone de información sobre volumen de tokens, composición detallada del dataset ni uso de RLHF o DPO.

## Capacidades

- Reconocimiento de entidades nombradas zero-shot: las etiquetas se definen en tiempo de inferencia, sin reentrenamiento.
- Detección de PII orientada a anonimización: el autor cita etiquetas como fecha de nacimiento, número de teléfono, número de caso, factura o pedido, número de cuenta bancaria, además de nombres y otras categorías.
- Clasificación de tokens (`token-classification`) con puntuaciones por etiqueta y umbrales configurables por etiqueta.
- Multilingüe con cobertura declarada de inglés, neerlandés y francés (y etiqueta genérica `multilingual`).
- Inferencia en dispositivo: ejecución en Android mediante ONNX Runtime y en navegador mediante ONNX Runtime Web (WASM).
- Compatibilidad directa con la librería GLiNER a través de su soporte ONNX, o con ONNX Runtime directamente.
- No se documentan capacidades de generación de texto, razonamiento general, código, matemáticas, visión, audio, tool calling ni agentes; el modelo es exclusivamente extractivo para NER.

## Casos de uso

- Anonimización de PII en el dispositivo antes de enviar texto a un servicio: el modelo permite sustituir nombres, teléfonos, cuentas bancarias o fechas de nacimiento en el propio teléfono o navegador, de modo que el texto original nunca sale del dispositivo. Es el caso de uso declarado por el autor.
- Formularios y aplicaciones web con procesamiento en cliente: integrado mediante ONNX Runtime Web en WASM, permite validar o enmascarar datos personales en el navegador sin backend, con un coste medido de 1.077 ms por 1.000 caracteres en Chrome 157 con 1 hilo.
- Aplicaciones móviles Android de mensajería o notas: con 1.004 ms por 1.000 caracteres en un Samsung Galaxy A15 y 892 MB de memoria pico, es viable para redactar o enmascarar PII en local en gama media.
- Preprocesado de textos para cumplimiento de protección de datos: detección por etiquetas configurables (número de caso, factura, pedido, cuenta bancaria) antes de almacenar o registrar documentos en sistemas internos.
- Enriquecimiento de documentos multilingües: extracción de entidades en inglés, neerlandés y francés con un único modelo y un conjunto de etiquetas definido por caso de uso, sin entrenar un modelo por idioma.
- Filtrado previo en pipelines de datos: al ser un reemplazo directo del ONNX int8 original, se puede sustituir el fichero en un pipeline existente de ONNX Runtime sin cambiar entradas, salidas, tokenizer ni configuración.
- Prototipado rápido de extracción de información: definir etiquetas nuevas en tiempo de inferencia para probar esquemas de extracción sin reentrenamiento.

## Benchmarks y rendimiento

El autor publica métricas propias medidas el 2026-11-11 sobre un conjunto sintético de anonimización de 234 textos en inglés, neerlandés y francés, sin datos personales reales, con umbrales por etiqueta (fecha de nacimiento 0,6; teléfono 0,5; número de caso, factura o pedido 0,55; cuenta bancaria 0,45; resto 0,4). Las cifras del int8 publicado usan sus propios umbrales (fecha de nacimiento 0,7).

| Métrica | int8 publicado | Este fichero | fp32 |
|---|---|---|---|
| Tamaño | 302.646.302 bytes | 369.862.229 bytes | 1.207.693.659 bytes |
| Recall, Android (Galaxy A15, ORT 1.31.0, 4 hilos) | 98,1 % | 99,2 % | no disponible |
| Errores de etiqueta, Android | 21,2 % | 8,0 % | no disponible |
| Recall, navegador (Chrome 157, ORT Web 1.31.1, WASM, 1 hilo) | 97,7 % | 99,0 % | no disponible |
| Errores de etiqueta, navegador | 20,5 % | 8,0 % | no disponible |
| Recall, CPU x86 (ORT 1.31.0, 8 hilos) | no disponible | 99,2 % | 99,0 % |
| Errores de etiqueta, CPU x86 | no disponible | 7,7 % | 12,9 % |

Velocidad y memoria medidas por el autor:

| Plataforma | Este fichero | int8 publicado |
|---|---|---|
| Android (Galaxy A15) | 1.004 ms / 1.000 caracteres; 892 MB de memoria pico; carga 3,8 s | 763 ms / 1.000 caracteres (+32 % para este fichero); 804 MB |
| Navegador | 1.077 ms / 1.000 caracteres | 979 ms / 1.000 caracteres (+10 % para este fichero) |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K ni similares) en la información disponible.

## Requisitos de hardware

- Inferencia en CPU: el modelo está pensado para ejecución en CPU mediante ONNX Runtime; el autor reporta 892 MB de memoria pico en un Samsung Galaxy A15.
- GPU: no se documenta uso de GPU ni requisitos de VRAM; el escenario objetivo es CPU móvil y navegador.
- Consumer GPU: no disponible (no se han publicado requisitos ni pruebas en GPU de consumo).
- Despliegue: ONNX Runtime (incluido ONNX Runtime Web con backend WASM) y la librería GLiNER con su soporte ONNX. No se documentan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este formato y tarea.
- Latencia: 1.004 ms por 1.000 caracteres en Android (Galaxy A15, 4 hilos) y 1.077 ms por 1.000 caracteres en navegador (Chrome 157, WASM, 1 hilo). Tiempo de carga en Android: 3,8 s.
- Throughput: no disponible más allá de las cifras de latencia anteriores.

## Comparativa con modelos similares

| Modelo | Tipo | Tamaño | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| dilys-ai/gliner-x-base-int8 (este) | GLiNER ONNX int8 | 369.862.229 bytes | multilingüe, en, nl, fr | Apache 2.0 | 12 matmuls del FF en fp32; recall 99,2 % y errores de etiqueta 8,0 % en el test sintético del autor |
| knowledgator/gliner-x-base (int8 publicado) | GLiNER ONNX int8 | 302.646.302 bytes | multilingüe, en, nl, fr | Apache 2.0 | Referencia del autor; recall 98,1 % y errores de etiqueta 21,2 % en Android según las mediciones de Dilys |
| knowledgator/gliner-x-base (fp32) | GLiNER ONNX fp32 | 1.207.693.659 bytes | multilingüe, en, nl, fr | Apache 2.0 | Modelo de origen; recall 99,0 % y errores de etiqueta 12,9 % en CPU x86 según Dilys |
| urchade/GLiNER | GLiNER (implementación de referencia) | no disponible | no disponible | no disponible | Repositorio y paper originales del método GLiNER |

No se dispone de datos de benchmarks estándar para comparar con otros modelos NER de la misma categoría.

## Limitaciones y advertencias

- Las métricas de calidad y latencia provienen de un único conjunto sintético de 234 textos en tres idiomas y no garantizan el comportamiento en otros textos, idiomas o etiquetas.
- Los umbrales por etiqueta usados en la evaluación (0,4 a 0,6) están ajustados a un conjunto de sintonización propio del autor; otros umbrales cambiarán recall y errores de etiqueta.
- Es un modelo extractivo de NER: no genera texto ni razona; no debe evaluarse como un modelo de lenguaje general.
- Cobertura lingüística declarada limitada a multilingüe, inglés, neerlandés y francés; el rendimiento en otros idiomas no está documentado.
- Riesgo de alucinación en el sentido de falsos positivos y errores de etiqueta: el propio autor mide un 8,0 % de reemplazos con etiqueta incorrecta en su test, y un 7,7 % en CPU x86.
- La procedencia de los datos de entrenamiento incluye `knowledgator/gliner-multilingual-synthetic`, sin licencia declarada en Hugging Face; la re-cuantización no altera esa situación y conviene revisar la model card del modelo original para el estado actual.
- El repositorio de origen no tiene fichero NOTICE en la revisión `a6c7a8fb`; esta model card actúa como aviso de cambios conforme a la sección 4(b) de Apache 2.0.
- Licencia Apache 2.0: permite uso comercial, pero exige conservar avisos de licencia y atribución; el crédito del modelo corresponde a Knowledgator, Google (mT5) y los autores de GLiNER.
- El modelo es más lento que el int8 publicado: +32 % en Android y +10 % en navegador, y ocupa 67 MB más, a cambio de menor tasa de errores de etiqueta.
- No se documentan sesgos específicos, pero al heredar los datos del modelo base puede reproducir los sesgos presentes en ellos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dilys-ai/gliner-x-base-int8
- Modelo base: https://huggingface.co/knowledgator/gliner-x-base
- Revisión del modelo base usada: https://huggingface.co/knowledgator/gliner-x-base/tree/a6c7a8fbfe2066c68d12c0480418504fde6d91d1
- Encoder mT5 base: https://huggingface.co/google/mt5-base
- Repositorio GLiNER: https://github.com/urchade/GLiNER
- Paper GLiNER: https://arxiv.org/abs/2311.08526
- Knowledgator en Hugging Face: https://huggingface.co/knowledgator
