# OptimaMT/ru-uk

## Resumen

OptimaMT/ru-uk es un modelo de traducción automática neuronal para el par ruso-ucraniano (ru → uk), distribuido en formato ONNX y pensado para su ejecución en el navegador o en entornos sin GPU mediante transformers.js. No se trata de un modelo entrenado desde cero: es una copia directa de Xenova/opus-mt-ru-uk (revisión `6d8a744ed6ea`), que a su vez es la exportación ONNX del modelo OPUS-MT de la Universidad de Helsinki (Helsinki-NLP/opus-mt-ru-uk). La única modificación real introducida por OptimaMT afecta al grafo del decodificador: se ha reconstruido el fichero `onnx/decoder_model_merged_quantized.onnx` moviendo la proyección de salida fuera de sus dos ramas, lo que reduce el consumo de memoria sin alterar los pesos ni los tokens generados.

El modelo mantiene exactamente la misma arquitectura y vocabulario que el original (57.777 tokens), por lo que la calidad de traducción es idéntica a la del modelo de referencia. Su propuesta de valor es puramente de eficiencia en despliegue: según la model card, con `disable_quant_qdq = 1` el consumo de memoria tras la carga baja de 494 a 268 MiB en Linux (-46 %) y de 470 a 244 MiB en Windows (-48 %), manteniendo tokens idénticos. Con los valores por defecto de ONNX Runtime la reducción es más modesta (-21 % en Linux, -16 % en Windows).

Es relevante para desarrolladores que necesitan traducción ru-uk de baja latencia en cliente (extensiones de navegador, aplicaciones offline, edge computing) y que no pueden asumir el coste de memoria de un transformer completo. El repositorio ocupa 0,1 GB y se publicó en noviembre de 2026 dentro del proyecto OptimaMT, que cubre 49 pares de idiomas con el mismo enfoque.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Marian NMT, exportado a ONNX) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | ONNX quantized (q8 en el ejemplo de uso); fichero `decoder_model_merged_quantized.onnx` |
| Idiomas soportados | ruso (ru) como origen, ucraniano (uk) como destino |
| Licencia | CC BY 4.0 |
| Formato de pesos | ONNX (transformers.js); repositorio de 0,1 GB |
| Vocabulario | 57.777 tokens |
| Modelo base | Xenova/opus-mt-ru-uk (revision `6d8a744ed6ea`) |
| Modelo original | Helsinki-NLP/opus-mt-ru-uk (OPUS-MT) |
| Libreria | transformers.js |
| Pipeline | translation |

## Arquitectura y entrenamiento

La arquitectura subyacente es Marian NMT, un transformer encoder-decoder desarrollado en el marco del proyecto OPUS-MT de la Universidad de Helsinki y entrenado sobre corpus paralelos multilingües de OPUS. OptimaMT no aporta información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo técnicas de alineación como RLHF o DPO; estos datos corresponden al modelo original y no se detallan en la model card disponible. Tampoco se especifica la dimensión oculta, el número de capas ni de cabezas de atención.

La innovación técnica de esta variante es exclusivamente de grafos: el decodificador fusionado (`decoder_model_merged_quantized.onnx`) se ha reconstruido moviendo la proyección de salida fuera de sus dos ramas. El resto de ficheros del repositorio son idénticos byte a byte al export original de Xenova. El resultado es una reducción de memoria tras la carga verificada con ONNX Runtime 1.31.1 en CPU con 4 hilos, manteniendo la equivalencia funcional (tokens idénticos). No hay decodificación especulativa, atención lineal ni otras optimizaciones algorítmicas: la mejora proviene únicamente de la reorganización del grafo y de la cuantización a 8 bits del decodificador.

## Capacidades

- Traducción de texto ruso a ucraniano, tarea única del modelo (pipeline `translation`).
- Ejecución en navegador y en Node.js mediante transformers.js con el backend ONNX Runtime.
- Ejecución en CPU sin GPU, con cuantización q8 y opción `disable_quant_qdq` para reducir memoria.
- Inferencia en Python mediante onnxruntime, sentencepiece y numpy (script `translate.py` del repositorio OptimaMT).
- Equivalencia funcional con Xenova/opus-mt-ru-uk: mismos pesos, mismos tokens, misma salida.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking.
- Cobertura limitada a dos idiomas (ru → uk); no es un modelo multilingüe general.

## Casos de uso

- Traducción en el navegador: integración con transformers.js para traducir texto ru-uk directamente en el cliente, sin enviar datos a un servidor, aprovechando que el modelo cabe en unos 268 MiB tras la carga con `disable_quant_qdq = 1`.
- Extensiones y aplicaciones de escritorio offline: el tamaño del repositorio (0,1 GB) y la ejecución en CPU permiten empaquetar el modelo en aplicaciones de escritorio o extensiones de navegador que funcionan sin conexión.
- Procesamiento por lotes en servidores sin GPU: uso de onnxruntime en Python para traducir grandes volúmenes de documentos ru-uk en máquinas CPU, donde el ahorro de memoria del 46 % permite más instancias concurrentes por nodo.
- Preprocesamiento en pipelines de NLP: traducción ru-uk como paso previo a análisis de sentimiento, extracción de entidades o indexación de contenido ucraniano a partir de fuentes rusas.
- Atención al cliente bilingüe: traducción de mensajes de usuarios rusoparlantes a ucraniano en sistemas de soporte, con latencia baja al ejecutarse en CPU y sin dependencia de APIs externas.
- Moderación de contenido y filtrado: traducción de texto ru a uk para aplicar clasificadores o listas de bloqueo entrenados en ucraniano sobre contenido originalmente en ruso.
- Prototipado y demos: el espacio OptimaMT/results permite comparar resultados interactivos y validar la equivalencia de tokens antes de integrar el modelo en producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad de traducción (BLEU, chrF, COMET) en la información disponible. La model card solo reporta métricas de memoria tras la carga con ONNX Runtime 1.31.1, CPU y 4 hilos:

| Configuracion | Linux (MiB) | Windows (MiB) | Reduccion Linux | Reduccion Windows | Tokens identicos |
|---|---:|---:|---:|---:|---|
| `disable_quant_qdq = 1` | 494 → 268 | 470 → 244 | -46 % | -48 % | si |
| Valores por defecto de ONNX Runtime | 265 → 208 | 189 → 159 | -21 % | -16 % | si |

No se proporcionan datos de latencia por token ni de throughput (tokens/s) en la información disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Memoria tras carga |
|---|---|---|---|---|---|---|
| OptimaMT/ru-uk | no disponible | no disponible | ru → uk | CC BY 4.0 | ONNX (transformers.js) | 268 MiB (Linux, `disable_quant_qdq`) |
| Xenova/opus-mt-ru-uk | no disponible | no disponible | ru → uk | CC BY 4.0 | ONNX (transformers.js) | 494 MiB (Linux, misma configuracion) |
| Helsinki-NLP/opus-mt-ru-uk | no disponible | no disponible | ru → uk | CC BY 4.0 | safetensors / PyTorch | no disponible |

La comparativa se limita al linaje directo del modelo, ya que no se dispone de datos de benchmarks ni de especificaciones de parámetros para establecer comparaciones con alternativas de otros proveedores. La diferencia medible entre OptimaMT/ru-uk y Xenova/opus-mt-ru-uk es únicamente el consumo de memoria, con salidas idénticas.

## Limitaciones y advertencias

- Solo traduce de ruso a ucraniano; no soporta la dirección inversa ni otros pares de idiomas.
- No se han publicado evaluaciones de calidad de traducción (BLEU, chrF, COMET) en la información disponible; la calidad hereda la del modelo OPUS-MT original, sin verificación independiente en esta ficha.
- Riesgo de alucinación y de traducciones inexactas inherente a los modelos NMT, especialmente en textos técnicos, nombres propios, terminología especializada o dominios poco representados en OPUS.
- Sesgos potenciales heredados del corpus de entrenamiento de OPUS-MT, cuya composición no se detalla en la model card.
- Longitud de contexto no documentada; textos largos pueden requerir segmentación manual.
- La licencia CC BY 4.0 permite uso comercial, pero exige atribución a los autores originales (Universidad de Helsinki para los pesos, Xenova para la exportación ONNX y OptimaMT para la modificación del grafo).
- La reducción de memoria solo se ha verificado con ONNX Runtime 1.31.1 en CPU con 4 hilos; el comportamiento en otras versiones, backends (WebGPU, WASM) o configuraciones de hilos no está documentado.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación comunitaria de su funcionamiento en producción.
- No es adecuado para tareas de razonamiento, generación libre, código o matemáticas: es exclusivamente un traductor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/OptimaMT/ru-uk
- Modelo base (export ONNX): https://huggingface.co/Xenova/opus-mt-ru-uk
- Modelo original OPUS-MT: https://huggingface.co/Helsinki-NLP/opus-mt-ru-uk
- Repositorio del proyecto OptimaMT: https://github.com/AmerAlreyahi/OptimaMT
- Informe metodológico: https://github.com/AmerAlreyahi/OptimaMT/blob/main/REPORT.md
- Script de traducción en Python: https://github.com/AmerAlreyahi/OptimaMT/blob/main/scripts/translate.py
- Resultados interactivos: https://huggingface.co/spaces/OptimaMT/results
