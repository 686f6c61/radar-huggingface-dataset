# OptimaMT/fr-es

## Resumen

OptimaMT/fr-es es un modelo de traduccion automatica frances-castellano publicado por OptimaMT como parte de una coleccion de 49 pares de idiomas bajo el esquema `OptimaMT/<src>-<tgt>`. Se trata de una copia directa del modelo `Xenova/opus-mt-fr-es` (revision `962338be5103`) en la que unicamente se ha reconstruido el fichero `onnx/decoder_model_merged_quantized.onnx`; el resto de artefactos son identicos byte a byte al original. La motivacion del autor es reducir el consumo de memoria en inferencia sin alterar la salida: los pesos, el vocabulario y la tokenizacion se mantienen intactos.

El modelo hereda la arquitectura Marian de OPUS-MT, desarrollada por el grupo Language Technology de la Universidad de Helsinki, y el pipeline de exportacion a ONNX realizado por Xenova para su uso con Transformers.js y ONNX Runtime. La innovacion concreta de esta variante es un cambio exclusivamente de grafo: la proyeccion de salida del decodificador se ha sacado de sus dos ramas (la de generacion y la de validacion), lo que permite fusionar el decodificador en un unico grafo mas ligero en memoria.

Es relevante para escenarios de traduccion embebida o en navegador, donde el consumo de RAM es el factor limitante. Segun las mediciones del autor con ONNX Runtime 1.31.1 en CPU con 4 hilos, la memoria tras la carga baja de 610 a 316 MiB en Linux (-48 %) y de 587 a 293 MiB en Windows (-50 %) al activar `disable_quant_qdq = 1`, manteniendo tokens de salida identicos. Con los valores por defecto de ONNX Runtime la reduccion es mas modesta: de 243 a 208 MiB (-14 %) en Linux y de 221 a 184 MiB (-17 %) en Windows.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Marian (transformer encoder-decoder para traduccion, familia OPUS-MT) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | ONNX quantized (q8 en el ejemplo de uso); fichero `decoder_model_merged_quantized.onnx` |
| Idiomas soportados | frances (fr) y castellano (es) |
| Licencia | CC BY 4.0 |
| Formato de pesos | ONNX (repo de 0,1 GB); compatible con Transformers.js |
| Vocabulario | 74.822 tokens |
| Modelo base | Xenova/opus-mt-fr-es (revision 962338be5103) |
| Libreria | transformers.js |
| Pipeline | translation |

## Arquitectura y entrenamiento

La arquitectura es Marian, un transformer encoder-decoder disenado especificamente para traduccion automatica y utilizado en la familia OPUS-MT de la Universidad de Helsinki. El modelo original fue entrenado por Helsinki-NLP sobre datos paralelos de OPUS; esta variante no reentrena ni ajusta pesos, sino que reutiliza integramente los del checkpoint `Xenova/opus-mt-fr-es`. No se dispone de informacion sobre el numero exacto de tokens de entrenamiento, la composicion del corpus ni si se aplicaron tecnicas de RLHF o DPO; estos datos corresponden al modelo OPUS-MT subyacente y no se detallan en la informacion proporcionada.

La unica modificacion tecnica documentada es un cambio de grafo en el decodificador: la proyeccion de salida se ha extraido de sus dos ramas (generacion y validacion) para fusionarlas en un unico grafo `decoder_model_merged_quantized.onnx`. Esto reduce el numero de tensores intermedios residentes en memoria durante la inferencia. El autor verifica que los tokens generados son identicos a los del modelo original, por lo que el cambio es semanticamente neutro. No se mencionan innovaciones como decodificacion especulativa ni atencion lineal.

## Capacidades

- Traduccion de texto frances a castellano en el pipeline `translation` de Transformers.js.
- Generacion de texto seq2seq mediante la tarea `text2text-generation`.
- Ejecucion en navegador y en Node.js a traves de Transformers.js con backend ONNX Runtime.
- Ejecucion en Python mediante `onnxruntime`, `sentencepiece` y `numpy` (script `translate.py` del repositorio del autor).
- Inferencia en CPU con bajo consumo de memoria, apta para entornos con recursos limitados.
- No se documentan capacidades de tool calling, function calling, agentes, razonamiento multi-paso, vision, audio ni modo thinking.

## Casos de uso

- Traduccion en el navegador: integrado con Transformers.js, el modelo puede traducir texto frances a castellano completamente en el cliente sin enviar datos a un servidor, gracias a su formato ONNX y a su bajo consumo de memoria (208-316 MiB tras la carga).
- Traduccion en dispositivos de borde o embebidos: la reduccion de memoria del 48-50 % con `disable_quant_qdq = 1` permite desplegarlo en entornos con RAM limitada donde el modelo original no cabria con holgura.
- Preprocesado de contenidos editoriales: traduccion por lotes de articulos, documentacion o catalogos del frances al castellano en pipelines de Python con `onnxruntime` y `sentencepiece`.
- Atencion al cliente multilingue: traduccion de mensajes entrantes en frances a castellano antes de pasarlos a un sistema de gestion de tickets o a un modelo de mayor tamano.
- Localizacion de interfaces y aplicaciones: traduccion de cadenas cortas de UI en tiempo de ejecucion en aplicaciones web, donde el modelo cabe en memoria junto al resto de la aplicacion.
- Prototipado rapido de sistemas de traduccion: al ser una copia drop-in del modelo de Xenova, permite sustituirlo sin cambios de codigo y evaluar el ahorro de memoria en un entorno real.
- Traduccion offline en aplicaciones de escritorio: el modelo puede empaquetarse con la aplicacion y ejecutarse en CPU sin dependencia de servicios externos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad de traduccion (BLEU, COMET, MMLU, etc.) en la informacion disponible. Los unicos datos de rendimiento proporcionados son mediciones de memoria tras la carga con ONNX Runtime 1.31.1 en CPU con 4 hilos:

| Metrica | Linux (original → OptimaMT) | Windows (original → OptimaMT) |
|---|---:|---:|
| Memoria con `disable_quant_qdq = 1` | 610 → 316 MiB (-48 %) | 587 → 293 MiB (-50 %) |
| Memoria con valores por defecto de ONNX Runtime | 243 → 208 MiB (-14 %) | 221 → 184 MiB (-17 %) |
| Tokens de salida identicos | si | si |

No se proporcionan datos de latencia ni de throughput (tokens por segundo).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| OptimaMT/fr-es | no disponible | no disponible | fr → es | CC BY 4.0 | ONNX | Decodificador fusionado, menor memoria |
| Xenova/opus-mt-fr-es | no disponible | no disponible | fr → es | CC BY 4.0 | ONNX | Modelo base; misma salida, mas memoria |
| Helsinki-NLP/opus-mt-fr-es | no disponible | no disponible | fr → es | CC BY 4.0 | PyTorch (safetensors/bin) | Modelo OPUS-MT original en formato PyTorch |

La comparativa se limita a la propia cadena de derivacion del modelo, ya que no se dispone de datos de otros modelos de traduccion fr-es en la informacion proporcionada. No hay datos de benchmarks que permitan comparar calidad entre ellos; la diferencia documentada es exclusivamente de consumo de memoria y formato de pesos.

## Limitaciones y advertencias

- Solo traduce de frances a castellano; no es un modelo multilingue general ni soporta traduccion inversa.
- No se han publicado evaluaciones de calidad de traduccion para esta variante; la equivalencia con el modelo base se ha verificado a nivel de tokens en los ejemplos del autor, no mediante metricas de calidad.
- Riesgo de alucinacion y de errores de traduccion inherente al modelo OPUS-MT subyacente, especialmente en dominios especializados, terminologia tecnica o texto con ruido.
- No se documentan sesgos especificos, pero al ser un modelo entrenado sobre corpus OPUS puede reflejar sesgos presentes en esos datos.
- La licencia CC BY 4.0 permite uso comercial con atribucion; es necesario citar a OPUS-MT (Universidad de Helsinki), a Xenova por la exportacion ONNX y a OptimaMT por la modificacion del grafo.
- El modelo esta pensado para el pipeline de Transformers.js y ONNX Runtime; el uso con otras librerias requiere conversion adicional.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validacion comunitaria de su comportamiento en produccion.
- El ejemplo de uso requiere pasar `session_options.extra.session.disable_quant_qdq = "1"` para obtener la reduccion maxima de memoria; sin esa opcion el ahorro es del 14-17 %.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/OptimaMT/fr-es
- Modelo base (exportacion ONNX): https://huggingface.co/Xenova/opus-mt-fr-es
- Modelo OPUS-MT original: https://huggingface.co/Helsinki-NLP/opus-mt-fr-es
- Repositorio del proyecto OptimaMT: https://github.com/AmerAlreyahi/OptimaMT
- Informe metodologico: https://github.com/AmerAlreyahi/OptimaMT/blob/main/REPORT.md
- Script de traduccion en Python: https://github.com/AmerAlreyahi/OptimaMT/blob/main/scripts/translate.py
- Resultados interactivos: https://huggingface.co/spaces/OptimaMT/results
