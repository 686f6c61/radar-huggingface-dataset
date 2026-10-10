# malinali-app/opus-mt_tiny_fra-eng-onnx

## Resumen

El modelo `malinali-app/opus-mt_tiny_fra-eng-onnx` es una exportacion a formato ONNX del modelo de traduccion automatica `Helsinki-NLP/opus-mt_tiny_fra-eng`, publicada por el usuario `malinali-app` como parte del ecosistema Malinali (variante identificada como `fr-en-tiny`). Se trata, por tanto, de un modelo de traduccion frances a ingles construido sobre la arquitectura Marian, orientado a inferencia ligera y a integracion en runtimes nativos de ONNX en lugar de depender de PyTorch.

Su relevancia practica esta en el formato: al incluir `encoder_model.onnx`, `decoder_model.onnx` y `decoder_with_past_model.onnx`, permite decodificacion incremental con cache KV, ademas de los tokenizadores SentencePiece (`source.spm`, `target.spm`) y los ficheros de configuracion. Esto lo hace adecuado para despliegues en entornos con recursos limitados, aplicaciones de escritorio o moviles, o servicios de traduccion con requisitos de baja latencia.

El repositorio ocupa aproximadamente 0,3 GB. No se han publicado en la informacion disponible detalles sobre numero de parametros, datos de entrenamiento, benchmarks ni condiciones de uso mas alla de la licencia Apache 2.0. La ficha oficial es muy breve y se limita a describir los ficheros incluidos y el runtime nativo previsto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder tipo Marian (traduccion automatica neuronal) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio no declara variantes cuantizadas; se distribuyen ficheros ONNX) |
| Idiomas soportados | frances (fr) y ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`encoder_model.onnx`, `decoder_model.onnx`, `decoder_with_past_model.onnx`) + tokenizadores SentencePiece (`source.spm`, `target.spm`) |
| Pipeline | translation |
| Tamano del repositorio | 0,3 GB |
| Runtime nativo declarado | Malinali `native/marian_onnx` |
| Modelo base | Helsinki-NLP/opus-mt_tiny_fra-eng |
| Fecha de creacion (metadatos) | 2026-10-09 |
| Fecha de actualizacion (metadatos) | 2026-10-12 |

## Arquitectura y entrenamiento

La arquitectura subyacente es Marian, un transformer encoder-decoder disenado especificamente para traduccion automatica neuronal. La exportacion ONNX sigue el patron de Optimum: un encoder independiente, un decoder para el primer paso de generacion que devuelve las claves y valores del cache (`present.*`) y un decoder con soporte de cache (`past_key_values.*`) para los pasos posteriores. Este desdoblamiento en dos grafos de decoder es la tecnica habitual para habilitar decodificacion incremental eficiente sin recalcular el contexto completo en cada token.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, el uso de RLHF/DPO ni el proceso de destilacion o reduccion que justifica el sufijo `tiny` en el nombre del modelo base. La model card del autor es puramente descriptiva del empaquetado ONNX y no documenta el entrenamiento. Tampoco se detalla el proceso de exportacion (version de Optimum, opset de ONNX, precision numerica de los tensores).

## Capacidades

- Traduccion de texto de frances a ingles, en modo unidireccional.
- Generacion autoregresiva con cache KV, gracias al grafo `decoder_with_past_model.onnx`, lo que reduce el coste computacional por token en secuencias largas.
- Tokenizacion SentencePiece integrada en el repositorio mediante los ficheros `source.spm` y `target.spm`.
- Ejecucion en runtimes ONNX sin dependencia de PyTorch, lo que facilita el despliegue en entornos ligeros.
- No se documentan capacidades de tool calling, function calling, agentes, razonamiento multi-paso, vision, audio ni modo de pensamiento.
- No se documentan capacidades multilingues mas alla del par fr-en.
- No se documenta soporte de instrucciones conversacionales: es un modelo de traduccion puro, no un modelo de chat.

## Casos de uso

- Traduccion de documentacion tecnica francesa a ingles: el modelo puede integrarse en una canalizacion de preprocesado que traduzca ficheros Markdown o paginas de manuales antes de indexarlos en un buscador interno.
- Localizacion de interfaces de usuario: traduccion de cadenas cortas y etiquetas en aplicaciones, con inferencia en CPU o GPU modesta y latencia baja al tratarse de un modelo compacto.
- Subtitulado y transcripcion: combinado con un sistema de reconocimiento de voz en frances, puede generar subtitulos en ingles de forma casi instantanea en el propio dispositivo.
- Procesamiento por lotes de correos o tickets de soporte en frances: traduccion previa a ingles para alimentar un clasificador o un sistema de enrutamiento que solo opere en ingles.
- Traduccion en el navegador o en aplicaciones de escritorio: al distribuirse como ONNX con tokenizadores incluidos, puede ejecutarse con ONNX Runtime Web o runtimes nativos sin servidor, preservando la privacidad del texto.
- Investigacion en traduccion automatica de bajo coste: util como linea base rapida para experimentos de destilacion, cuantizacion o comparacion de arquitecturas Marian frente a modelos multilingues mayores.
- Preprocesado en canalizaciones de recuperacion aumentada (RAG): traduccion de consultas o documentos franceses a ingles antes de la busqueda vectorial en un indice en ingles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del autor no incluye metricas BLEU, chrF, COMET ni evaluaciones comparativas con otros sistemas de traduccion.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita. El repositorio completo ocupa 0,3 GB, por lo que la huella en memoria es reducida, aunque depende de la precision de los tensores ONNX y del tamano real del modelo.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de memoria libre deberia ser suficiente. No se requiere hardware de centro de datos como A100 o H100.
- Viabilidad en GPU de consumo: si, cabe con holgura en tarjetas de gama de entrada y en GPUs integradas, y previsiblemente tambien en inferencia exclusiva por CPU.
- Opciones de despliegue: ONNX Runtime (CPU o GPU), el runtime nativo Malinali `native/marian_onnx`, y potencialmente conversiones a otros motores compatibles con Marian. No se confirma compatibilidad con vLLM, TGI, llama.cpp ni Ollama.
- Latencia y throughput estimados: no disponible. Dado el tamano del repositorio y el uso de cache KV, se espera una latencia baja, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| malinali-app/opus-mt_tiny_fra-eng-onnx | no disponible | fr-en | no disponible | Apache 2.0 | ONNX + SentencePiece | Exportacion ONNX del modelo base, con cache KV |
| Helsinki-NLP/opus-mt_tiny_fra-eng | no disponible | fr-en | no disponible | no disponible en la informacion proporcionada | PyTorch (safetensors/bin) | Modelo original del que deriva esta exportacion |
| Helsinki-NLP/opus-mt-fr-en | aproximadamente 74 M (valor de referencia) | fr-en | 512 tokens (valor de referencia) | no disponible en la informacion proporcionada | PyTorch | Variante estandar de OPUS-MT, mas pesada que la version `tiny` |
| facebook/nllb-200-distilled-600M | 600 M (valor de referencia) | 200 idiomas | 512 tokens (valor de referencia) | no disponible en la informacion proporcionada | PyTorch | Alternativa multilingue de mayor tamano; no se han verificado los datos en esta busqueda |

Los valores marcados como referencia no provienen de la informacion proporcionada en esta ficha y deberian verificarse en las fichas oficiales antes de usarse en una decision tecnica.

## Limitaciones y advertencias

- Direccionalidad unica: solo traduce de frances a ingles. No soporta la direccion inversa ni otros pares de idiomas.
- Modelo de traduccion puro: no sigue instrucciones, no mantiene conversaciones y no debe emplearse como asistente generalista.
- Riesgo de alucinacion y de errores de traduccion: como cualquier sistema de traduccion neuronal, puede omitir, duplicar o inventar contenido, especialmente en segmentos largos, con jerga muy especifica o con nombres propios.
- Sin datos de entrenamiento ni evaluacion publicados: no es posible estimar su calidad frente a alternativas sin realizar una evaluacion propia.
- Herencia de sesgos: los sesgos presentes en los corpus de OPUS pueden manifestarse en las traducciones; no se ha documentado ningun proceso de mitigacion.
- Formato especifico: al ser una exportacion ONNX, su uso esta ligado a runtimes compatibles; no se incluye el modelo en PyTorch ni variantes GGUF.
- Licencia Apache 2.0: permite uso comercial y modificacion con atribucion y conservacion del aviso de licencia, pero conviene verificar la licencia del modelo base por si impone condiciones adicionales.
- Metadatos incoherentes: las fechas de creacion y actualizacion indicadas (octubre de 2026) son posteriores a la fecha de consulta, lo que sugiere un error o una manipulacion de los metadatos del repositorio.
- Sin adopcion aparente: cero descargas y cero likes en el momento de la consulta, lo que implica ausencia de validacion por parte de la comunidad.
- Limite de longitud de entrada: no se documenta la ventana maxima; conviene segmentar textos largos antes de la traduccion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/malinali-app/opus-mt_tiny_fra-eng-onnx
- Modelo base: https://huggingface.co/Helsinki-NLP/opus-mt_tiny_fra-eng
- No se han encontrado enlaces adicionales relevantes en la busqueda web: los resultados devueltos no guardan relacion con el modelo.
