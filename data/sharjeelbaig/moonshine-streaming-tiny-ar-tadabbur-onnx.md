# Sharjeelbaig/moonshine-streaming-tiny-ar-tadabbur-onnx

## Resumen

Moonshine Streaming Tiny Arabic — Tadabbur ONNX es una conversion a ONNX cuantizada del modelo de reconocimiento automatico del habla (ASR) `moonshine-ai/moonshine-streaming-tiny-ar`, publicada por el usuario Sharjeelbaig. No se trata de un modelo entrenado desde cero ni de un ajuste fino sobre el Coran, sino de un artefacto de conversion optimizado para inferencia que reproduce los pesos originales anclados a la revision `2d3a986306561346ef0bf0018d23238944faf087`. Su proposito es servir como motor de transcripcion de frases cortas de recitacion en arabe dentro de una integracion denominada Tadabbur.

Tecnicamente es un modelo encoder-decoder de tipo transformer con atencion de ventana deslizante en el encoder, exportado a dos ficheros ONNX independientes (`encoder_q8.onnx` y `decoder_q8.onnx`). Las matrices de multiplicacion (MatMul/Gemm) y las tablas de embeddings (Gather) estan cuantizadas a 8 bits, mientras que las convoluciones permanecen en coma flotante. La salida del decoder tiene una dimension de vocabulario de 12.288 tokens y el estado oculto del encoder es de 320 dimensiones.

Su relevancia es acotada pero concreta: ofrece un camino de despliegue ligero sobre ONNX Runtime, incluido el navegador, sin dependencia de PyTorch, para transcripcion de audio mono a 16 kHz en frases de hasta siete segundos. El autor advierte de forma explicita que la validacion realizada no constituye un benchmark representativo y que no se ha demostrado mejora alguna frente a modelos Whisper ajustados para recitacion coranica. El repositorio registra cero descargas y cero interacciones en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder con atencion de ventana deslizante en el encoder |
| Parametros totales | no disponible |
| Longitud de contexto | no aplica en el sentido de LLM; ventana deslizante en el encoder y frases limitadas a 7 segundos en la integracion Tadabbur |
| Tipos de cuantizacion | int8 (q8) en MatMul/Gemm y en embeddings Gather; convoluciones en coma flotante; existe tambien exportacion FP32 |
| Idiomas soportados | arabe (ar) |
| Licencia | MIT |
| Formato de pesos | ONNX (`encoder_q8.onnx`, `decoder_q8.onnx`), mas `tokenizer.json` y `manifest.json` |

Datos adicionales derivados del contrato de ejecucion publicado:

| Parametro | Valor |
|---|---|
| Dimension del estado oculto del encoder | 320 |
| Dimension del vocabulario (logits) | 12.288 |
| Frecuencia de muestreo de audio | 16 kHz, mono |
| Alineacion de muestras | multiplo de 80 muestras |
| Tamano de lote | 1 |
| Token de inicio | 1 |
| Token de parada | 2 |
| Limite de tokens generados | `floor(duracion_segundos * 6.5) + 2` |

## Arquitectura y entrenamiento

El modelo subyacente es un sistema ASR encoder-decoder tipo transformer, en la linea de la familia Moonshine de Moonshine AI. El encoder procesa la forma de onda mediante atencion de ventana deslizante, caracteristica que el autor de esta conversion indica haber preservado intacta durante la exportacion. El decoder es autorregresivo: recibe los identificadores de tokens ya generados junto con los estados ocultos del encoder y produce logits sobre un vocabulario de 12.288 entradas. El modelo original se distribuye bajo licencia MIT y tanto el modelo como el tokenizer son atribuidos a Moonshine AI.

No se dispone de informacion sobre el volumen de datos de entrenamiento, la composicion del dataset, ni sobre si se aplicaron tecnicas de RLHF o DPO. La model card indica expresamente que esta publicacion es una conversion de pesos y no un modelo recien entrenado, por lo que cualquier detalle de entrenamiento corresponde al modelo base y no se documenta en este repositorio.

La innovacion tecnica de esta ficha es la propia conversion: se cuantizan a 8 bits las operaciones MatMul/Gemm y las Gather de embeddings, dejando las convoluciones en coma flotante, lo que sugiere una decision deliberada para evitar la perdida de precision que la cuantizacion suele provocar en capas convolucionales. La validacion reportada compara el ONNX FP32 con PyTorch y arroja una diferencia maxima de logits de 0,00001574 en las comprobaciones de forma. No se expone streaming con estado ni caches KV del decoder, de modo que la integracion Tadabbur re-decoda frases crecientes en lugar de mantener un estado incremental.

## Capacidades

- Reconocimiento automatico del habla en arabe sobre audio mono a 16 kHz.
- Transcripcion de frases cortas de recitacion, con un limite practico de siete segundos por frase en la integracion Tadabbur.
- Generacion autorregresiva de tokens con criterio argmax y parada en el token 2.
- Ejecucion sin PyTorch mediante ONNX Runtime, incluyendo un smoke test en navegador reportado por el autor.
- Decodificacion de texto a partir de `tokenizer.json`, omitiendo tokens especiales.
- Capacidad de re-decodificacion de frases en crecimiento, segun describe el autor para la integracion Tadabbur.

No se documentan capacidades de tool calling, function calling, razonamiento multi-paso, agentes, vision, audio adicional ni modo de pensamiento. Tampoco se declara soporte multilingue: el unico idioma listado es el arabe.

## Casos de uso

- Transcripcion de recitacion coranica en aplicaciones de estudio: el modelo procesa fragmentos de hasta siete segundos y permite re-decodicar la frase a medida que se alarga, lo que encaja con el flujo de lectura por versiculos de la integracion Tadabbur.
- Asistentes de lectura guiada en navegador: al ejecutarse sobre ONNX Runtime con un smoke test en navegador de 365 ms en la maquina de desarrollo, permite desplegar transcripcion local sin enviar audio a un servidor.
- Verificacion de pronunciacion en herramientas de aprendizaje de arabe: la transcripcion de frases cortas permite comparar la salida del modelo con el texto esperado y detectar desviaciones.
- Indexacion y busqueda de archivos de audio en arabe: transcripcion por lotes de clips cortos para generar transcripciones buscables con un runtime ligero.
- Preprocesado de pipelines de subtitulado: dado que la salida es texto plano decodificable desde `tokenizer.json`, puede alimentar generadores de subtitulos para contenido hablado en arabe de frases breves.
- Integracion en aplicaciones de escritorio o moviles con recursos limitados: el formato ONNX q8 y el tamano reducido permiten incorporar el modelo sin dependencias de PyTorch ni de GPU dedicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye unicamente comprobaciones de validacion, que se reproducen a continuacion tal como se describen y que el propio autor califica de no representativas.

| Comprobacion | Resultado reportado |
|---|---|
| Diferencia maxima de logits entre ONNX FP32 y PyTorch | 0,00001574 |
| Clip de seis segundos (Alafasy 1:1), FP32 | Transcripcion `بسم الله الرحمن الرحيم` |
| Clip de seis segundos (Alafasy 1:1), q8 | Transcripcion `بسم الله الرحمن الرحيم` |
| Smoke test final en navegador | 365 ms en la maquina de desarrollo |

El autor indica expresamente que no se ha establecido ninguna mejora frente a modelos Whisper ajustados para recitacion coranica, y que estos datos no constituyen un benchmark de precision ni de latencia.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada. El repositorio reporta un tamano de 0,0 GB, lo que sugiere un artefacto muy pequeno, pero no se publica el consumo real de memoria.
- GPU recomendadas: no disponible. El autor no documenta ninguna GPU concreta.
- Compatibilidad con GPU de consumo: no disponible de forma explicita, aunque el perfil de modelo "tiny" y la exportacion ONNX cuantizada a int8 apuntan a que puede ejecutarse en CPU y en GPU de gama de entrada; se trata de una inferencia cualitativa, no de un dato medido.
- Opciones de despliegue: ONNX Runtime (escritorio o servidor) y ejecucion en navegador segun el smoke test reportado. No se contemplan vLLM, llama.cpp, Ollama ni TGI, ya que el artefacto no es un modelo de generacion de texto y no sigue el contrato de esos servidores.
- Latencia y throughput: el unico dato disponible es el smoke test de 365 ms en navegador sobre la maquina de desarrollo del autor para un unico clip de seis segundos. No hay cifras de throughput ni de latencia para otros entornos.
- Requisitos de integracion: batch size uno, audio mono a 16 kHz alineado a multiplos de 80 muestras, sin caches KV ni streaming con estado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto/uso | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Sharjeelbaig/moonshine-streaming-tiny-ar-tadabbur-onnx | no disponible | Frases de hasta 7 s, audio 16 kHz mono | Sin benchmark publicado; validacion cualitativa de un clip | MIT | ONNX en HuggingFace, 0 descargas |
| moonshine-ai/moonshine-streaming-tiny-ar (modelo base) | no disponible | ASR en arabe, mismo encoder-decoder | No disponible en la informacion proporcionada | MIT | Pesos originales en PyTorch |
| Whisper tiny (OpenAI) | no disponible | ASR multilingue generico | No disponible en la informacion proporcionada | MIT | Disponible en varios formatos |
| Whisper ajustado para recitacion coranica | no disponible | ASR en arabe coranico | El autor indica que no se ha demostrado mejora frente a estos modelos | no disponible | no disponible |

La comparacion cuantitativa no puede completarse porque la informacion proporcionada no incluye recuentos de parametros, resultados de benchmarks ni mediciones comparativas entre estos modelos.

## Limitaciones y advertencias

- No es un ajuste fino sobre el Coran: la model card lo indica de forma explicita. Es una conversion de pesos del modelo base.
- No se ha demostrado mejora alguna frente a modelos Whisper ajustados para recitacion coranica.
- La validacion se limita a un unico clip de seis segundos y a una comparacion de logits entre ONNX FP32 y PyTorch; no hay evaluacion de precision sobre un conjunto de prueba.
- El smoke test de 365 ms no es una medida representativa de latencia, tal como advierte el autor.
- Soporte unicamente de arabe; no hay capacidades multilingues declaradas.
- Limitacion a frases cortas: la integracion Tadabbur restringe los fragmentos a siete segundos y re-decoda frases crecientes en lugar de mantener estado.
- No expone streaming con estado ni caches KV del decoder, lo que limita su uso en transcripcion continua de audio largo.
- Tamano de lote fijo de uno: no esta disenado para procesamiento por lotes concurrente.
- Requiere audio mono a 16 kHz alineado a multiplos de 80 muestras; no se documenta manejo de otras frecuencias o canales.
- El repositorio no es un pipeline exportado de Transformers.js: debe consumirse con ONNX Runtime directamente, lo que exige implementar el bucle de decodificacion (token inicial 1, argmax, parada en token 2, limite de tokens) y la decodificacion con `tokenizer.json`.
- Sin datos de sesgo ni de comportamiento en dominios distintos a la recitacion coranica.
- Riesgo de alucinacion: no documentado en la informacion disponible, pero inherente a los modelos ASR autorregresivos, en especial con audio fuera de dominio o clips demasiado cortos.
- Licencia MIT, que permite uso comercial, si bien se recomienda conservar la atribucion a Moonshine AI que el autor incluye para el modelo y el tokenizer originales.
- Repositorio con cero descargas y cero interacciones, sin senales de validacion por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Sharjeelbaig/moonshine-streaming-tiny-ar-tadabbur-onnx
- Modelo base: https://huggingface.co/moonshine-ai/moonshine-streaming-tiny-ar
- Revision de origen anclada: `2d3a986306561346ef0bf0018d23238944faf087`
- Scripts de reproduccion y limitaciones detalladas: carpeta `conversion/` del repositorio
- Metadatos de revision y exportacion: fichero `manifest.json` del repositorio
