# OptimaMT/uk-ru

## Resumen

OptimaMT/uk-ru es un modelo de traduccion automatica neuronal para el par ucraniano-ruso, distribuido en formato ONNX y optimizado para ejecucion en navegador y en CPU mediante transformers.js. No es un modelo entrenado desde cero: es una copia del export ONNX de Xenova/opus-mt-uk-ru (revision `cfb76ccd2077`), que a su vez deriva de los pesos OPUS-MT de la Universidad de Helsinki. La unica modificacion respecto al original es la reconstruccion del decoder fusionado (`decoder_model_merged_quantized.onnx`) para habilitar el modo rapido de ONNX Runtime (`disable_quant_qdq = 1`) y reducir el consumo de memoria.

El modelo resuelve un problema muy concreto: desplegar traduccion ucraniano-ruso en entornos con recursos limitados (escritorio, navegador, CPU sin GPU) manteniendo exactamente la misma salida que el modelo de referencia. Segun la model card, el modo rapido de ONNX Runtime ofrece entre 2,3 y 2,5 veces mas velocidad y aproximadamente la mitad de memoria tras la carga, con tokens identicos a los del original. La evaluacion en FLORES-200 devtest (1.012 frases) reporta BLEU 23,28 y chrF 51,04 en decodificacion greedy.

Es relevante para desarrolladores que necesitan un traductor ligero y embebible, no para quienes buscan un modelo multilingue de proposito general. El repositorio ocupa 0,1 GB, el vocabulario es de 57.777 tokens y el modelo se publica bajo licencia CC BY 4.0. Forma parte de una coleccion de 51 pares de traduccion bajo el paraguas OptimaMT, y se usa en produccion en OpenCircle, un traductor de pantalla de escritorio para Windows y Linux desde la version 0.1.4.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Marian / OPUS-MT) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | ONNX cuantizado (q8 en el ejemplo de uso); decoder fusionado cuantizado |
| Idiomas soportados | ucraniano (uk), ruso (ru) |
| Licencia | CC BY 4.0 |
| Formato de pesos | ONNX (`onnx/decoder_model_merged_quantized.onnx` y resto de ficheros del export original) |

## Arquitectura y entrenamiento

La arquitectura es la de OPUS-MT: un transformer encoder-decoder de tipo Marian, el mismo esquema que emplea Helsinki-NLP para sus modelos de traduccion. El vocabulario tiene 57.777 tokens y el pipeline declarado es `translation`. No hay informacion en la documentacion disponible sobre el numero de parametros, la composicion del corpus de entrenamiento ni el volumen de tokens utilizados; esos datos corresponden al modelo original de Helsinki-NLP y no se detallan en esta ficha.

La innovacion tecnica de esta publicacion no esta en el entrenamiento sino en el empaquetado. Se reconstruye unicamente el decoder fusionado cuantizado y se mueve la proyeccion de salida fuera de sus dos ramas (cambio de grafo, no de pesos), lo que permite activar el modo rapido de ONNX Runtime con `disable_quant_qdq = 1`. El resto de ficheros son identicos byte a byte al export de Xenova. Segun la model card, con ese ajuste la memoria tras la carga pasa de 494 a 268 MiB en Linux (-46 %) y de 471 a 243 MiB en Windows (-48 %), manteniendo tokens identicos; con los valores por defecto de ONNX Runtime la reduccion es del 21 % y el 16 % respectivamente. Las mediciones se hicieron con ONNX Runtime 1.31.1 en CPU con 4 hilos.

## Capacidades

- Traduccion de texto de ucraniano a ruso en una sola direccion (no soporta el sentido inverso).
- Generacion de texto seq2seq mediante pipeline `translation` de transformers.js o mediante onnxruntime en Python.
- Ejecucion en navegador y en CPU sin GPU, gracias al formato ONNX y a la cuantizacion q8.
- Salida determinista con decodificacion greedy, identica a la del modelo de referencia Xenova/opus-mt-uk-ru.
- Integracion en aplicaciones de escritorio (caso documentado: OpenCircle en Windows y Linux).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, vision ni audio.
- Cobertura limitada estrictamente al par uk-ru; no es un modelo multilingue.

## Casos de uso

- Traduccion de pantalla en escritorio: el modelo se integra en aplicaciones como OpenCircle para traducir texto capturado de la pantalla de ucraniano a ruso en tiempo real; su bajo consumo (268 MiB en Linux con el modo rapido) y su velocidad (2,3-2,5 veces superior al original) lo hacen adecuado para ejecucion en segundo plano en equipos sin GPU.
- Traduccion en el navegador sin backend: mediante transformers.js con `dtype: "q8"`, el modelo se ejecuta del lado del cliente, lo que evita enviar texto del usuario a un servidor y elimina costes de infraestructura.
- Traduccion por lotes en CPU: para procesar corpus de documentos ucranianos a ruso en pipelines offline, el modelo permite usar onnxruntime con sentencepiece y numpy sin dependencias pesadas.
- Localizacion de interfaces y contenido: traduccion de cadenas de UI, documentacion o articulos del ucraniano al ruso en flujos de localizacion donde se requiere coherencia terminologica y se puede revisar la salida.
- Procesamiento de comunicaciones internas: traduccion de mensajes, correos o tickets de soporte entre equipos ucranianos y rusoparlantes en organizaciones con ambos idiomas.
- Prototipado rapido de sistemas de traduccion: al ser un drop-in replacement del export de Xenova con la misma salida, sirve para comparar costes de memoria y latencia sin cambiar el resto del pipeline.
- Traduccion en dispositivos de bajos recursos: el tamano de repositorio de 0,1 GB y la cuantizacion q8 permiten desplegarlo en equipos con poca RAM o en contenedores ligeros.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Corpus de evaluacion | FLORES-200 devtest (1.012 frases) |
| BLEU | 23,28 |
| chrF | 51,04 |
| Decodificacion | greedy |
| Igualdad de tokens respecto al original | si |
| Memoria tras carga, Linux (`disable_quant_qdq = 1`) | 494 → 268 MiB (-46 %) |
| Memoria tras carga, Windows (`disable_quant_qdq = 1`) | 471 → 243 MiB (-48 %) |
| Memoria tras carga, Linux (valores por defecto) | 265 → 208 MiB (-21 %) |
| Memoria tras carga, Windows (valores por defecto) | 188 → 158 MiB (-16 %) |
| Aceleracion | 2,3-2,5× |
| Entorno de medida | ONNX Runtime 1.31.1, CPU, 4 hilos |

No se han publicado en la informacion disponible resultados de MMLU, HumanEval, GSM8K ni otros benchmarks de proposito general, que por otra parte no aplican a un modelo de traduccion.

## Requisitos de hardware

- VRAM: no aplica; el modelo esta pensado para CPU. La memoria del proceso tras la carga es de 268 MiB en Linux y 243 MiB en Windows con el modo rapido, y de 208 MiB y 158 MiB con los valores por defecto de ONNX Runtime.
- GPU recomendadas: no se especifican; el caso documentado es ejecucion en CPU con 4 hilos.
- GPU de consumo: irrelevante para este modelo; el objetivo es funcionar sin GPU.
- Despliegue: transformers.js (navegador y Node.js) y onnxruntime en Python (script `translate.py` con sentencepiece y numpy). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: la model card solo indica una aceleracion relativa de 2,3-2,5 veces respecto al export original; no se publican valores absolutos de latencia ni de tokens por segundo.
- Almacenamiento: repositorio de 0,1 GB.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| OptimaMT/uk-ru | no disponible | no disponible | uk → ru | CC BY 4.0 | ONNX | Decoder fusionado optimizado; 268 MiB en Linux con modo rapido |
| Xenova/opus-mt-uk-ru | no disponible | no disponible | uk → ru | CC BY 4.0 | ONNX | Modelo de referencia; misma salida, mas memoria y menor velocidad |
| Helsinki-NLP/opus-mt-uk-ru | no disponible | no disponible | uk → ru | CC BY 4.0 | safetensors (formato original OPUS-MT) | Pesos originales de la Universidad de Helsinki; no optimizado para ONNX |

La comparacion se limita al mismo par linguistico porque el modelo no es multilingue ni de proposito general. No se dispone de datos de benchmarks de las alternativas en la informacion proporcionada mas alla de la equivalencia de salida declarada respecto a Xenova/opus-mt-uk-ru.

## Limitaciones y advertencias

- Modelo unidireccional: solo traduce de ucraniano a ruso; no soporta el sentido inverso ni otros pares.
- No es multilingue: fuera de uk y ru no hay cobertura.
- Riesgo de alucinacion y de errores de traduccion inherente a los modelos OPUS-MT, especialmente en frases largas, terminologia especializada o texto con ruido; la evaluacion se limita a FLORES-200 con BLEU 23,28.
- No se documentan sesgos especificos, pero al derivar de OPUS-MT hereda los sesgos de sus datos de entrenamiento, no detallados en esta ficha.
- Longitud de contexto no documentada; conviene trocear textos largos en frases o parrafos.
- Licencia CC BY 4.0: permite uso comercial con atribucion. Es obligatorio creditar a OPUS-MT (Universidad de Helsinki), a Xenova por el export ONNX y a OptimaMT por la modificacion del decoder.
- Dependencia del ajuste `disable_quant_qdq = 1` para obtener la mejora de memoria y velocidad; con los valores por defecto de ONNX Runtime la ganancia es mucho menor.
- Solo se reconstruye el decoder fusionado cuantizado; el resto de ficheros debe tomarse del export original, por lo que la trazabilidad depende de la revision `cfb76ccd2077`.
- No apto para tareas de razonamiento, codigo, agentes ni tool calling.
- Para produccion, validar la calidad en el dominio concreto: las metricas publicadas corresponden a un corpus generico de noticias y no garantizan el rendimiento en dominios tecnicos o legales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/OptimaMT/uk-ru
- Modelo base en Hugging Face: https://huggingface.co/Xenova/opus-mt-uk-ru
- Pesos originales OPUS-MT: https://huggingface.co/Helsinki-NLP/opus-mt-uk-ru
- Repositorio OptimaMT: https://github.com/AmerAlreyahi/OptimaMT
- Informe metodologico: https://github.com/AmerAlreyahi/OptimaMT/blob/main/REPORT.md
- Script de traduccion en Python: https://github.com/AmerAlreyahi/OptimaMT/blob/main/scripts/translate.py
- Coleccion de los 51 pares: https://huggingface.co/collections/OptimaMT/optimamt-lighter-opus-mt-onnx-models-6af228dc9cd91f015e56e869
- Resultados interactivos: https://huggingface.co/spaces/OptimaMT/results
- OpenCircle (aplicacion que lo usa en produccion): https://github.com/AmerAlreyahi/OpenCircle
