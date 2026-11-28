# OptimaMT/es-ru

## Resumen

OptimaMT/es-ru es una conversión a ONNX del modelo de traducción automática neuronal Xenova/opus-mt-es-ru, que a su vez deriva del modelo OPUS-MT de la Universidad de Helsinki para el par de idiomas español-ruso. Lo desarrolla el proyecto OptimaMT, que mantiene una colección de 51 pares de idiomas con el mismo enfoque: copias ligeras de los modelos OPUS-MT de Xenova con un decodificador fusionado reconstruido para ONNX Runtime.

El modelo resuelve la traducción automática directa del español al ruso en entornos con recursos limitados, especialmente en el navegador mediante transformers.js y en aplicaciones de escritorio. Su aportación principal no es un nuevo entrenamiento, sino una optimización de inferencia: el decodificador fusionado se reconstruye con la opción `disable_quant_qdq = 1` de ONNX Runtime, lo que reduce el consumo de memoria entre un 47 y un 49 por ciento en Linux y Windows respectivamente, y acelera la inferencia entre 2,3 y 2,5 veces, produciendo exactamente los mismos tokens que el modelo original.

La arquitectura subyacente es Marian (transformer encoder-decoder) con un vocabulario de 63.430 tokens. El repo pesa 0,1 GB y la licencia es CC BY 4.0. Es relevante ahora porque permite desplegar traducción es-ru de calidad en producción sobre CPU y en el navegador, algo que el modelo original de Xenova hacía con el doble de memoria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Marian (transformer encoder-decoder) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | ONNX cuantizado (q8); decodificador fusionado reconstruido con `disable_quant_qdq = 1` |
| Idiomas soportados | español (es), ruso (ru) |
| Licencia | CC BY 4.0 |
| Formato de pesos | ONNX (`onnx/decoder_model_merged_quantized.onnx`, más ficheros originales) |

## Arquitectura y entrenamiento

El modelo es una conversión ONNX del modelo Marian de OPUS-MT para es-ru, exportado originalmente por Xenova en la revisión `268ccd60bde3`. Marian es una arquitectura transformer encoder-decoder diseñada específicamente para traducción automática neuronal, con vocabulario de 63.430 tokens. No se dispone de información sobre el número de parámetros totales ni sobre el volumen de datos de entrenamiento originales en la información proporcionada.

La innovación técnica de esta ficha es exclusivamente de inferencia: OptimaMT reconstruye únicamente el fichero `onnx/decoder_model_merged_quantized.onnx`, moviendo la proyección de salida del decodificador fuera de sus dos ramas (cambio solo de grafo). Todos los demás ficheros son idénticos byte a byte al original. El resultado es un decodificador que, con `disable_quant_qdq = 1`, consume 284 MiB en Linux (frente a 532 MiB, un 47 por ciento menos) y 259 MiB en Windows (frente a 508 MiB, un 49 por ciento menos), con una aceleración de 2,3 a 2,5 veces. Con los valores por defecto de ONNX Runtime la reducción es menor (22 y 17 por ciento respectivamente). En todos los casos los tokens generados son idénticos a los del modelo original.

## Capacidades

- Traducción automática directa del español al ruso.
- Generación de texto secuencia a secuencia (text2text-generation) con pipeline `translation`.
- Inferencia en navegador mediante transformers.js con `dtype: "q8"`.
- Inferencia en CPU mediante ONNX Runtime con Python (onnxruntime, sentencepiece, numpy).
- Compatibilidad con la opción `session_options.extra.session.disable_quant_qdq = "1"` para activar el modo rápido.
- Producción de tokens idénticos al modelo base Xenova/opus-mt-es-ru (verificado en FLORES-200 devtest).
- No se documentan capacidades de tool calling, agentes, visión, audio ni modo thinking.

## Casos de uso

- Traducción de pantalla en escritorio: el modelo se usa en producción en OpenCircle, un traductor de pantalla para Windows y Linux que lo incorpora desde la versión v0.1.4. Su bajo consumo de memoria (259-284 MiB) y su velocidad (2,3-2,5 veces la del original) lo hacen adecuado para traducir texto en tiempo real sobre el escritorio sin penalizar el rendimiento del sistema.
- Traducción en el navegador sin backend: mediante transformers.js y `dtype: "q8"`, el modelo puede ejecutarse íntegramente en el cliente, lo que permite ofrecer traducción es-ru en aplicaciones web sin enviar el texto a un servidor y sin costes de infraestructura.
- Traducción por lotes en CPU: con ONNX Runtime y Python (`translate.py`), se puede procesar grandes volúmenes de documentos o subtítulos es-ru en servidores sin GPU, aprovechando el bajo uso de memoria para ejecutar varias instancias en paralelo.
- Localización de interfaces y documentación: para equipos que mantienen productos en español y ruso, el modelo permite traducir cadenas de UI, textos de ayuda y documentación técnica de forma automatizada dentro de pipelines de CI/CD, con la ventaja de que los tokens son idénticos al modelo de referencia.
- Traducción de subtítulos y transcripciones: dado su rendimiento en CPU y su naturaleza secuencia a secuencia, encaja en flujos de postproducción que convierten transcripciones en español a subtítulos en ruso, con revisión humana posterior.
- Aplicaciones de mensajería y atención al cliente bilingüe: integrado como microservicio ONNX, puede traducir mensajes de usuario es-ru en conversaciones de soporte, con latencia baja gracias al modo rápido del decodificador.
- Prototipado e investigación en traducción de bajo recursos: al ser una copia ligera y reproducible del modelo de Xenova, sirve como base para experimentos de cuantización y optimización de inferencia sin alterar los pesos.

## Benchmarks y rendimiento

| Benchmark | Resultado |
|---|---|
| FLORES-200 devtest (1.012 frases), BLEU (greedy) | 14,77 |
| FLORES-200 devtest (1.012 frases), chrF (greedy) | 44,71 |
| Memoria tras carga, Linux, `disable_quant_qdq = 1` | 284 MiB (frente a 532 MiB del original, -47 %) |
| Memoria tras carga, Windows, `disable_quant_qdq = 1` | 259 MiB (frente a 508 MiB del original, -49 %) |
| Memoria tras carga, Linux, valores por defecto | 222 MiB (frente a 284 MiB, -22 %) |
| Memoria tras carga, Windows, valores por defecto | 166 MiB (frente a 201 MiB, -17 %) |
| Aceleración con `disable_quant_qdq = 1` | 2,3-2,5 veces |
| Tokens generados frente al original | idénticos |

Medido con ONNX Runtime 1.31.1, CPU, 4 hilos (Linux; Windows en máquina virtual). No se han publicado resultados de benchmarks comparativos con otros modelos de traducción en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; el modelo está diseñado para CPU. En GPU, el consumo sería mínimo dado el tamaño del repo (0,1 GB), pero no se documentan requisitos de VRAM.
- GPU recomendadas: no disponible; el modelo se ha validado en CPU.
- Cabe en cualquier equipo consumer: el consumo tras carga es de 166-284 MiB de memoria según plataforma y configuración, por lo que funciona en portátiles y equipos de escritorio modestos.
- Opciones de despliegue: transformers.js (navegador), ONNX Runtime con Python (onnxruntime, sentencepiece, numpy), y cualquier runtime compatible con ONNX.
- Latencia y throughput: se documenta una aceleración de 2,3-2,5 veces frente al modelo original con `disable_quant_qdq = 1`; no se publican valores absolutos de latencia ni de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| OptimaMT/es-ru | no disponible | no disponible | es, ru | CC BY 4.0 | ONNX | Decodificador fusionado ligero; 284 MiB en Linux |
| Xenova/opus-mt-es-ru | no disponible | no disponible | es, ru | CC BY 4.0 | ONNX | Modelo base; 532 MiB en Linux, 2,3-2,5 veces más lento |
| Helsinki-NLP/opus-mt-es-ru | no disponible | no disponible | es, ru | CC BY 4.0 | safetensors/PyTorch | Modelo original de OPUS-MT (Universidad de Helsinki) |

## Limitaciones y advertencias

- El modelo solo traduce del español al ruso; no soporta otros pares de idiomas.
- No se documentan sesgos específicos, pero al derivar de OPUS-MT hereda los sesgos de los corpus paralelos usados en su entrenamiento original.
- Riesgo de alucinación y de traducciones incorrectas en dominios especializados, frases ambiguas o texto con jerga; se recomienda revisión humana en producción.
- No se dispone de información sobre la longitud máxima de contexto soportada.
- La licencia CC BY 4.0 permite uso comercial, pero exige atribución a los autores originales (Universidad de Helsinki, OPUS-MT) y a Xenova por la exportación ONNX.
- El rendimiento BLEU de 14,77 en FLORES-200 es moderado; para aplicaciones de alta exigencia conviene evaluar con datos propios.
- El modo rápido requiere pasar explícitamente `disable_quant_qdq = "1"` en las opciones de sesión; sin ello, la reducción de memoria es menor.
- Solo se reconstruye el fichero del decodificador fusionado cuantizado; el resto de ficheros son copias byte a byte del original.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/OptimaMT/es-ru
- Modelo base en Hugging Face: https://huggingface.co/Xenova/opus-mt-es-ru
- Modelo original OPUS-MT: https://huggingface.co/Helsinki-NLP/opus-mt-es-ru
- Repositorio del proyecto OptimaMT: https://github.com/AmerAlreyahi/OptimaMT
- Informe técnico (REPORT.md): https://github.com/AmerAlreyahi/OptimaMT/blob/main/REPORT.md
- Script de traducción en Python: https://github.com/AmerAlreyahi/OptimaMT/blob/main/scripts/translate.py
- Colección de los 51 pares de idiomas: https://huggingface.co/collections/OptimaMT/optimamt-lighter-opus-mt-onnx-models-6af228dc9cd91f015e56e869
- Resultados interactivos: https://huggingface.co/spaces/OptimaMT/results
- OpenCircle (aplicación que usa el modelo): https://github.com/AmerAlreyahi/OpenCircle
