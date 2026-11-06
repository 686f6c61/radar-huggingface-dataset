# akm9191/opus-mt-ml-en-int8-onnx

## Resumen

Opus-mt-ml-en-int8-onnx es un modelo de traduccion automatica de malayalam a ingles, publicado por el usuario akm9191 en Hugging Face. No es un modelo entrenado desde cero: se trata de una exportacion cuantizada a int8 en formato ONNX del modelo Helsinki-NLP/opus-mt-ml-en, desarrollado originalmente por el Language Technology Research Group de la Universidad de Helsinki dentro del proyecto OPUS-MT (Jörg Tiedemann et al.). El repositorio solo cambia el formato de los pesos; no se ha realizado ningun fine-tuning ni entrenamiento adicional.

El problema que resuelve es la traduccion offline y en dispositivo de texto en malayalam (la lengua de Kerala, India) a ingles, sin depender de servicios en la nube. El autor lo creo para integrarlo en la aplicacion de notas Android "Daily Whisper", y el layout de ficheros sigue el formato de los repositorios Xenova/opus-mt-*, lo que lo hace compatible con cargadores tipo transformers.js. Esto lo hace especialmente util para aplicaciones que necesitan traduccion local, privada y de bajo consumo.

Es relevante porque la traduccion malayalam-ingles de calidad con modelos ligeros es escasa, y la cuantizacion int8 permite ejecutar el modelo en hardware modesto: el repo completo ocupa solo unos 0,1 GB. El modelo base es una arquitectura MarianMT (transformer-align) con preprocesamiento de normalizacion y SentencePiece.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MarianMT (transformer-align), encoder-decoder |
| Parametros totales | no disponible (pesos ONNX: encoder ~52 MB + decoder ~92 MB cuantizados) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (limitada por la configuracion Marian; optimo en frases cortas) |
| Tipos de cuantizacion | int8 dinamico (QInt8, per-channel, reduce_range, ONNX Runtime quantize_dynamic) |
| Idiomas soportados | malayalam (ml) → ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX cuantizado (encoder_model_quantized.onnx, decoder_model_merged_quantized.onnx) + tokenizer.json SentencePiece |

## Arquitectura y entrenamiento

El modelo base es un MarianMT con arquitectura transformer-align, un transformer encoder-decoder estandar entrenado con alineacion de atencion, propio del proyecto OPUS-MT. El preprocesamiento incluye normalizacion de texto y tokenizacion con SentencePiece. Fue entrenado sobre el corpus OPUS (instantanea del 20-04-2020), una coleccion masiva de datos paralelos de dominio publico.

El entrenamiento original corresponde al equipo de la Universidad de Helsinki; este repositorio no aporta ningun entrenamiento nuevo. El proceso de conversion consistio en tres pasos: exportacion a ONNX con Hugging Face Optimum 1.23.3 (tarea text2text-generation-with-past, con transformers 4.46.3 y torch 2.5.1), generando un encoder y un decoder fusionado con KV cache y un conmutador use_cache_branch; cuantizacion dinamica a int8 con ONNX Runtime 1.28.0 (QInt8, per-channel, reduce_range); y generacion del tokenizer.json a partir del vocabulario SentencePiece Marian mediante el conversor de transformers.js. Como innovacion practica, el decoder fusionado con KV cache acelera la inferencia autoregresiva en dispositivo.

## Capacidades

- Traduccion automatica de malayalam a ingles (pipeline text2text-generation / translation).
- Ejecucion completamente offline y en dispositivo gracias al formato ONNX cuantizado.
- Compatibilidad con transformers.js y cargadores estilo Xenova, lo que permite uso en navegador, Node.js y entornos Android via ONNX Runtime.
- Traduccion de buena calidad en frases cortas y de dominio general (BLEU 42.7 en Tatoeba.ml.en para el modelo original).
- No soporta vision, audio, tool calling ni capacidades de agente: es un modelo de traduccion puro.
- No es un modelo generativo de proposito general ni de razonamiento.

## Casos de uso

- Traduccion offline en apps moviles: el caso de uso original del autor; en una aplicacion de notas Android como "Daily Whisper", permite traducir notas en malayalam a ingles sin conexion ni envio de datos a servidores, con un peso total inferior a 200 MB.
- Privacidad en el procesamiento de textos personales: al ejecutarse localmente, el texto nunca sale del dispositivo, adecuado para diarios, mensajes o documentos sensibles.
- Traduccion en el navegador con transformers.js: el layout compatible con Xenova permite cargar el modelo en WebAssembly/ONNX Runtime Web para traducir paginas o textos en aplicaciones web sin backend.
- Herramientas de comunicacion interlingue: integracion en chats o correos donde un hablante de malayalam redacta y el destinatario lee en ingles.
- Preprocesamiento de corpus para investigacion: normalizacion y traduccion rapida de fragmentos cortos en malayalam para analisis posterior en ingles en flujos de NLP de bajo presupuesto.
- Prototipado de traduccion en hardware modesto: al ser int8 y ligero, es util para demostraciones en portatiles sin GPU dedicada o en dispositivos edge (Raspberry Pi, moviles de gama baja).

## Benchmarks y rendimiento

El modelo original (Helsinki-NLP/opus-mt-ml-en) alcanza un BLEU de 42.7 en el benchmark Tatoeba.ml.en. La cuantizacion int8 puede reducir ligeramente la calidad y este repositorio no ha sido re-benchmarked, por lo que no hay metricas publicadas para la version cuantizada. No se han publicado resultados de otros benchmarks (MMLU, HumanEval, etc.), lo cual es esperable al tratarse de un modelo de traduccion especializado.

| Benchmark | Resultado |
|---|---|
| Tatoeba.ml.en (BLEU, modelo original sin cuantizar) | 42.7 |
| Version int8 ONNX | no disponible (no re-benchmarked) |

## Requisitos de hardware

- VRAM / memoria: no requiere GPU; los pesos cuantizados ocupan ~144 MB (encoder ~52 MB + decoder ~92 MB), mas el tokenizer (~2,8 MB). Con memoria de trabajo, basta con menos de 1 GB de RAM.
- GPU recomendadas: no es necesario; funciona en CPU. Si se desea acelerar, cualquier GPU compatible con ONNX Runtime sirve.
- Consumer GPU: no aplica; el modelo esta pensado para ejecucion en CPU y dispositivos moviles, por lo que cabe holgadamente en cualquier equipo moderno, incluidos moviles Android y navegadores con WebAssembly.
- Opciones de despliegue: transformers.js (caso principal), ONNX Runtime (incluida la variante mobile para Android), y de forma indirecta cualquier runtime ONNX. No es un modelo GGUF, por lo que llama.cpp u Ollama no son aplicables directamente.
- Latencia y throughput: no disponibles; al ser un modelo Marian cuantizado de ~144 MB, la traduccion de frases cortas en CPU es practicamente instantanea, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Direccion | Licencia | Notas |
|---|---|---|---|---|---|
| akm9191/opus-mt-ml-en-int8-onnx | no disponible (~144 MB en int8) | ONNX int8 | ml → en | Apache 2.0 | Optimizado para inferencia offline en dispositivo con transformers.js |
| Helsinki-NLP/opus-mt-ml-en | no disponible | PyTorch (safetensors) | ml → en | Apache 2.0 | Modelo original sin cuantizar; BLEU 42.7 en Tatoeba.ml.en |
| Xenova/opus-mt-ml-en | no disponible | ONNX (fp32/int8) | ml → en | Apache 2.0 | Export ONNX de referencia con layout equivalente |

No hay alternativas comparables ampliamente conocidas de codigo abierto para el par malayalam-ingles en formato ligero; NLLB-200 de Meta cubre malayalam e ingles pero es un modelo multilingue mucho mayor y con licencia CC-BY-NC 4.0, no comercial.

## Limitaciones y advertencias

- Calidad variable por dominio: el modelo fue entrenado con datos OPUS de dominio general; rinde peor en textos tecnicos, legales o medicos.
- Frases cortas: el rendimiento es optimo en oraciones breves; textos largos pueden degradar la calidad.
- Texto code-mixed: el malayalam mezclado con palabras inglesas ("Manglish") se traduce mal.
- La cuantizacion int8 puede reducir ligeramente la calidad respecto al modelo original; no se ha re-benchmarked la version cuantizada.
- No apto para traduccion de alta importancia (high-stakes): el propio autor advierte contra su uso en contextos criticos.
- Riesgo de alucinacion tipico de modelos de traduccion neuronales en entradas ruidosas o fuera de dominio.
- Longitud de contexto limitada por la arquitectura Marian; no disponible el valor exacto.
- Licencia Apache 2.0: sin restricciones para uso comercial, tanto del modelo original como de esta redistribucion.
- Solo soporta el par malayalam-ingles en una direccion; no traduce de ingles a malayalam.

## Enlaces

- Repositorio del modelo: https://huggingface.co/akm9191/opus-mt-ml-en-int8-onnx
- Modelo base original: https://huggingface.co/Helsinki-NLP/opus-mt-ml-en
- Proyecto OPUS-MT (GitHub): https://github.com/Helsinki-NLP/Opus-MT
- Repositorios de referencia Xenova: https://huggingface.co/Xenova
- Paper OPUS-MT (Tiedemann y Thottingal, EAMT 2020): citado en la model card; disponible en los anales de la 22nd Annual Conference of the European Association for Machine Translation (Lisboa, 2020)
