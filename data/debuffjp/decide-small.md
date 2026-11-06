# debuffjp/decide-small

## Resumen

Decide Small es un encoder de frases publicado por el desarrollador debuffjp como componente del proyecto decidekit, una libreria que implementa un clasificador de texto de tipo "System One" (clasificacion rapida de un solo paso) que asigna una de las etiquetas definidas por el usuario a un fragmento de texto, ejecutandose en el dispositivo del usuario. El modelo es en realidad una copia sin modificar de la conversion ONNX de BAAI/bge-small-en-v1.5 (via Xenova/bge-small-en-v1.5, revision `ea104da`), con licencia MIT, publicada aqui para que decidekit tenga una fuente estable y fijada por revision.

No se trata por tanto de un modelo entrenado por el autor: los pesos son los del encoder BGE Small en ingles de BAAI. Lo que aporta decidekit es la "cabeza" de clasificacion entrenada y la calibracion de confianza que se anaden sobre este encoder. El modelo se distribuye en formato ONNX optimizado para transformers.js, con un peso de aproximadamente 34 MB en cuantizacion de 8 bits, y esta pensado para inferencia en navegador o en dispositivos de usuario final.

Su relevancia practica esta en el nicho: clasificacion de intenciones en ingles con latencia muy baja (7,7 ms de mediana por decision en un worker de Chrome sobre un portatil con Ryzen 7 260) y sin necesidad de enviar texto a un servidor. Es un modelo pequeno, especializado y de proposito muy concreto, no un modelo generativo de uso general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo BERT (BGE Small, derivado de BAAI/bge-small-en-v1.5) |
| Parametros totales | no disponible (modelo base BGE Small; el autor no publica el recuento exacto) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | 8 bits (aproximadamente 34 MB); el repo incluye conversion ONNX |
| Idiomas soportados | ingles (en) |
| Licencia | MIT |
| Formato de pesos | ONNX (transformers.js) |

## Arquitectura y entrenamiento

El modelo es un encoder Transformer de la familia BERT, concretamente la variante BGE Small en ingles de BAAI (bge-small-en-v1.5), convertida a ONNX. El autor declara explicitamente que no ha entrenado los pesos: son una copia sin modificar de Xenova/bge-small-en-v1.5 en la revision `ea104da`, a su vez conversion ONNX de BAAI/bge-small-en-v1.5. Por tanto, los detalles de entrenamiento (numero de tokens, composicion del corpus, uso de RLHF o DPO) corresponden al modelo original de BAAI y no se detallan en la informacion disponible.

La innovacion del proyecto no esta en el encoder sino en la capa que lo rodea: decidekit anade una cabeza de clasificacion entrenada sobre las representaciones del encoder y un mecanismo de confianza calibrada, de modo que el sistema devuelve una etiqueta elegida entre las que proporciona el usuario junto con una puntuacion de confianza. El pipeline declarado en Hugging Face es `feature-extraction`, es decir, el modelo en si produce embeddings; la clasificacion la aporta la libreria.

## Capacidades

- Extraccion de embeddings de frases en ingles para tareas de similitud semantica y clasificacion.
- Clasificacion de texto en un conjunto arbitrario de etiquetas definidas por el usuario, mediante la cabeza entrenada de decidekit.
- Devuelve una etiqueta elegida y una confianza calibrada por decision.
- Inferencia en el dispositivo del usuario (navegador mediante transformers.js y ONNX, o Node.js).
- Ejecucion en web worker: el ejemplo del autor mide decisiones en un worker de Chrome.
- No soporta generacion de texto, tool calling, agentes, vision ni audio.
- Capacidad multilingue limitada al ingles.

## Casos de uso

- Enrutamiento de tickets de soporte: clasificar el mensaje entrante en categorias como `card_arrival`, `refund` o `fraud` antes de asignarlo a un equipo, aprovechando la evaluacion del autor sobre BANKING77 (77 etiquetas, 90,7% con todos los datos de entrenamiento).
- Clasificacion de intenciones en asistentes conversacionales: mapear la utterance del usuario a una de las intenciones definidas por el desarrollador, con la ventaja de que el texto no sale del dispositivo.
- Triaje en aplicaciones de banca movil: decidir localmente si una consulta del cliente es sobre tarjeta, transferencia o reembolso sin enviar datos personales a un backend.
- Moderacion o etiquetado ligero en el navegador: asignar categorias predefinidas a textos cortos generados por el usuario dentro de una aplicacion web, con latencia de milisegundos.
- Clasificacion por lotes en pipelines de datos en ingles: usar el encoder como extractor de features para entrenar o alimentar clasificadores propios en entornos con recursos limitados.
- Prototipado rapido de clasificadores de pocas etiquetas: dado que decidekit acepta etiquetas en tiempo de ejecucion, permite validar un esquema de categorias sin reentrenar un modelo dedicado.
- Filtrado previo en sistemas de busqueda semantica: generar embeddings de consultas y documentos en el cliente para una primera fase de recuperacion.

## Benchmarks y rendimiento

Datos publicados por el autor en la model card:

| Benchmark | Etiquetas | Resultado (todos los datos de entrenamiento) |
|---|---|---|
| BANKING77 | 77 | 90,7% |
| CLINC150 | 150 | 94,4% |

| Metrica de latencia | Entorno | Valor |
|---|---|---|
| Decision en Chrome (worker, mediana) | Ryzen 7 260 | 7,7 ms |

No se han publicado en la informacion disponible resultados de benchmarks generativos (MMLU, HumanEval, GSM8K) porque el modelo no es generativo.

## Requisitos de hardware

- VRAM estimada: el modelo pesa aproximadamente 34 MB en 8 bits, por lo que cabe holgadamente en cualquier GPU consumer e incluso se ejecuta en CPU.
- GPU recomendadas: no requiere GPU; el autor mide en CPU (Ryzen 7 260) dentro de un worker de Chrome. Cualquier GPU consumer (por ejemplo, RTX 3060 o superior) seria mas que suficiente si se desea aceleracion.
- Cabe en GPU consumer: si, en cualquier modelo actual, y tambien en movil y navegador.
- Opciones de despliegue: transformers.js (libreria declarada), runtime ONNX, y decidekit como capa de clasificacion. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: mediana de 7,7 ms por decision en Chrome (worker) sobre Ryzen 7 260 segun el autor. No se publica throughput agregado.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| debuffjp/decide-small | Encoder BERT + cabeza de clasificacion (decidekit) | no disponible (BGE Small) | no disponible | MIT | Copia ONNX de BGE Small; clasificacion con etiquetas definidas por el usuario |
| BAAI/bge-small-en-v1.5 | Encoder de embeddings | no disponible en la informacion | no disponible | MIT | Modelo original del que deriva; sin cabeza de clasificacion |
| Xenova/bge-small-en-v1.5 | Encoder de embeddings en ONNX | no disponible en la informacion | no disponible | MIT | Conversion ONNX de la que decide-small es copia directa |

No se dispone de datos comparativos de rendimiento frente a otros clasificadores de intenciones en la informacion proporcionada.

## Limitaciones y advertencias

- Solo ingles: el modelo no esta pensado para castellano ni otros idiomas.
- No es un modelo generativo: no produce texto, no razona de forma multi-paso y no soporta tool calling ni agentes.
- Los pesos no han sido entrenados por el autor; cualquier sesgo del encoder BGE Small original se hereda sin cambios.
- Riesgo de alucinacion en el sentido de asignar una etiqueta con alta confianza cuando el texto no encaja en ninguna categoria; la calibracion de confianza de decidekit mitiga pero no elimina este riesgo.
- Los resultados de BANKING77 y CLINC150 se midieron con todos los datos de entrenamiento, lo que puede sobreestimar el rendimiento en dominios nuevos.
- La licencia MIT permite uso comercial, pero conviene verificar las condiciones del modelo base BAAI/bge-small-en-v1.5 y de la conversion Xenova, tambien MIT segun la informacion disponible.
- El modelo tiene 0 descargas y 0 likes en Hugging Face en el momento de la consulta, y fue creado en noviembre de 2026; su madurez y soporte comunitario son minimos.
- Para produccion, la dependencia de decidekit (libreria del mismo autor) anade un punto unico de mantenimiento a considerar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/debuffjp/decide-small
- Proyecto decidekit: https://debuff.jp/decide/
- Repositorio decidekit: https://github.com/debuffjp/decidekit
- Resultados de evaluacion: https://github.com/debuffjp/decidekit/blob/main/eval/results-bge-small.json
- Modelo base original: https://huggingface.co/BAAI/bge-small-en-v1.5
- Conversion ONNX de referencia: https://huggingface.co/Xenova/bge-small-en-v1.5
