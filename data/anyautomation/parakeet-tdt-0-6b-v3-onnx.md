# AnyAutomation/parakeet-tdt-0.6b-v3-onnx

## Resumen

Parakeet TDT 0.6B v3 (ONNX, int8) es un espejo de pesos del modelo de reconocimiento automatico del habla (ASR) multilingue `nvidia/parakeet-tdt-0.6b-v3` de NVIDIA, exportado a formato ONNX y cuantizado a int8 por el usuario `istupakov` (proyecto onnx-asr). Este repositorio, publicado por `AnyAutomation`, no introduce ninguna modificacion sobre el modelo: los ficheros son copias byte a byte del export original en el commit `8f23f0c03c8761650bdb5b40aaf3e40d2c15f1ce`, unicamente renombrados para que el software de AnyAutomation pueda descargarlos desde una direccion fijada (pinned).

El modelo resuelve transcripcion de voz a texto en 25 idiomas europeos (entre ellos espanol, ingles, aleman, frances, italiano y portugues) con un tamano de 0,6 mil millones de parametros. La arquitectura subyacente es Parakeet con decodificacion TDT (Token-and-Duration Transducer), una variante de transducer que predice conjuntamente tokens y duraciones, lo que acelera la decodificacion frente a transducers clasicos. El export ONNX int8 reduce el peso del encoder a unos 652 MB, lo que permite ejecucion en CPU y en GPUs de gama consumer sin necesidad de framework NeMo.

Su relevancia practica es la portabilidad: al estar en ONNX int8 con ficheros de tamano contenido, se puede desplegar con `onnxruntime` en entornos sin CUDA, en contenedores ligeros o en dispositivos de borde, manteniendo el modelo original de NVIDIA como referencia de calidad. La licencia CC BY 4.0 permite uso comercial con atribucion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Parakeet TDT (Token-and-Duration Transducer), exportada a ONNX |
| Parametros totales | 0,6 mil millones (segun nombre del modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8 (encoder y decoder-joint en int8; fichero nemo128 sin cuantizar) |
| Idiomas soportados | bg, cs, da, de, el, en, es, et, fi, fr, hr, hu, it, lt, lv, mt, nl, pl, pt, ro, ru, sk, sl, sv, uk (25 idiomas) |
| Licencia | CC BY 4.0 |
| Formato de pesos | ONNX (encoder int8, decoder-joint int8, nemo128, vocab.txt) |

## Arquitectura y entrenamiento

El modelo base es un transducer TDT de NVIDIA entrenado con NeMo. La arquitectura combina un encoder (que procesa el audio en representaciones acusticas) con un decoder y un joint network que, en cada paso, predicen de forma conjunta el siguiente token y su duracion. Esta prediccion de duraciones permite avanzar varios frames de audio por paso de decodificacion, reduciendo el numero de llamadas al decoder frente a un RNN-T convencional y mejorando la latencia. El export ONNX separa el modelo en tres piezas: `encoder.int8.onnx` (unos 652 MB), `decoder_joint.int8.onnx` (unos 18 MB) y el fichero de preprocesado `nemo128.onnx` (unos 140 KB), mas el vocabulario `vocab.txt`.

No se dispone en la informacion proporcionada de datos sobre el volumen de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF o ajuste fino supervisado mas alla de lo que documente la model card original de NVIDIA. Tampoco se documenta en este repositorio ninguna innovacion adicional introducida por el export: el autor indica explicitamente que no se ha modificado nada salvo los nombres de fichero. La innovacion tecnica relevante es, por tanto, la propia decodificacion TDT y la cuantizacion int8 del encoder, que reduce el peso a aproximadamente un tercio del modelo en punto flotante.

## Capacidades

- Reconocimiento automatico del habla (ASR) en 25 idiomas europeos, incluidos espanol, ingles, aleman, frances, italiano, portugues, neerlandes, polaco, rumano, sueco y ucraniano.
- Transcripcion de audio a texto con marcas de tiempo a nivel de token o segmento (segun el pipeline onnx-asr que consuma los ficheros).
- Decodificacion eficiente mediante TDT, adecuada para streaming y procesamiento por lotes.
- Ejecucion en CPU y GPU a traves de ONNX Runtime, sin dependencia de NeMo ni de PyTorch en inferencia.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es un modelo puramente acustico, no un LLM.
- No dispone de modo thinking, vision ni audio generativo; su unica salida es texto transcrito.

## Casos de uso

- Transcripcion de reuniones y actas: el modelo convierte audio de reuniones multilingues en texto, y su naturaleza ONNX int8 permite ejecutarlo en el servidor de la propia organizacion sin enviar audio a terceros.
- Subtitulado automatico de video: se puede integrar en pipelines de ffmpeg + onnxruntime para generar subtitulos en 25 idiomas, con marcas de tiempo por segmento.
- Atencion al cliente con analitica de voz: transcripcion de llamadas grabadas para alimentar sistemas de analisis de sentimiento o busqueda, ejecutandose en contenedores sin GPU dedicada.
- Dictado y accesibilidad: integracion en aplicaciones de escritorio o moviles mediante ONNX Runtime, aprovechando el peso reducido del encoder int8 para dispositivos de borde.
- Generacion de corpus y datasets: transcripcion masiva de archivos de audio en lote, donde el bajo coste por hora de CPU compensa frente a APIs en la nube.
- Investigacion en ASR multilingue: punto de partida reproducible (ficheros con hash fijado) para evaluar o comparar tecnicas de cuantizacion y despliegue en ONNX.
- Moderacion y compliance: transcripcion local de grabaciones sujetas a requisitos de residencia de datos, al no requerir salida a servicios externos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card de este repositorio remite a la de `nvidia/parakeet-tdt-0.6b-v3` para descripcion, idiomas y limitaciones, pero no incluye cifras de WER, latencia ni throughput. Tampoco se aportan mediciones del impacto de la cuantizacion int8 frente al modelo original en punto flotante.

## Requisitos de hardware

- VRAM estimada: el encoder int8 ocupa unos 652 MB en disco; en memoria, la inferencia ONNX int8 requiere del orden de 1-2 GB de RAM/VRAM incluyendo buffers de activacion (estimacion orientativa, no publicada por el autor).
- GPU recomendadas: cualquier GPU con soporte de ONNX Runtime (CUDA o TensorRT), incluidas RTX 3060, RTX 4090, A100 y H100; el modelo es lo bastante pequeno para no necesitar GPU de datacenter.
- Cabe en GPU consumer: si, practicamente en cualquier GPU con 4 GB o mas de VRAM; tambien funciona en CPU.
- Opciones de despliegue: ONNX Runtime (CPU o CUDA), onnx-asr (proyecto de origen del export), TensorRT y contenedores ligeros. No esta pensado para vLLM, llama.cpp, Ollama ni TGI, que son motores de LLM.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Parakeet TDT 0.6B v3 (ONNX int8, este repo) | 0,6 B | 25 europeos | ONNX int8 | CC BY 4.0 | Espejo del export de istupakov; portable a CPU |
| nvidia/parakeet-tdt-0.6b-v3 (original) | 0,6 B | 25 europeos | NeMo (.nemo) | CC BY 4.0 | Requiere NeMo/PyTorch; referencia de calidad |
| istupakov/parakeet-tdt-0.6b-v3-onnx | 0,6 B | 25 europeos | ONNX int8 | CC BY 4.0 | Export original del que este repo es copia identica |
| Whisper large-v3 (referencia de la categoria) | ~1,55 B | ~99 | safetensors / GGUF / ONNX | MIT (pesos) | Mayor cobertura idiomatica; datos de WER no disponibles aqui |

La comparativa se limita a los modelos mencionados en la informacion proporcionada. No se dispone de cifras de WER comparativas entre Parakeet y Whisper en este repositorio.

## Limitaciones y advertencias

- El repositorio no aporta documentacion propia: descripcion, idiomas y limitaciones remiten a la model card de NVIDIA, por lo que cualquier caveat del modelo original aplica sin modificaciones.
- La cuantizacion int8 puede degradar ligeramente la precision frente al modelo en punto flotante; el autor no publica mediciones de esa degradacion.
- Riesgo de alucinacion y errores en audio con ruido, acentos no representados en el entrenamiento o solapamiento de hablantes, inherente a los sistemas ASR.
- Cobertura limitada a 25 idiomas europeos; no soporta idiomas fuera de esa lista.
- Licencia CC BY 4.0: el uso comercial es posible, pero exige atribucion a NVIDIA ("Parakeet TDT 0.6B v3" by NVIDIA, converted to ONNX by istupakov) y conservar el aviso de licencia.
- El modelo es solo ASR: no genera texto libre, no razona y no admite instrucciones; no debe evaluarse como un LLM.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y su utilidad depende de la estabilidad del commit fijado; si el repositorio se elimina, el software de AnyAutomation que dependa de el dejara de descargar los pesos.
- No se documentan requisitos de preprocesado mas alla del fichero `nemo128.onnx`, por lo que un uso incorrecto del pipeline puede degradar la transcripcion.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/AnyAutomation/parakeet-tdt-0.6b-v3-onnx
- Modelo base: https://huggingface.co/nvidia/parakeet-tdt-0.6b-v3
- Export ONNX original: https://huggingface.co/istupakov/parakeet-tdt-0.6b-v3-onnx
- Licencia CC BY 4.0: https://creativecommons.org/licenses/by/4.0/
- Proyecto onnx-asr (referenciado en la model card): no disponible como enlace directo en la informacion proporcionada
- Paper o blog oficial de Parakeet TDT: no disponible en la informacion proporcionada
