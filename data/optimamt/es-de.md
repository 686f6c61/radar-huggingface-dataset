# OptimaMT/es-de

## Resumen

OptimaMT/es-de es un modelo de traduccion automatica espanol-aleman derivado de la familia OPUS-MT de la Universidad de Helsinki, redistribuido en formato ONNX optimizado para su ejecucion en el navegador y en el runtime de transformers.js. No se trata de un modelo entrenado desde cero, sino de una copia funcional de Xenova/opus-mt-es-de (revision `7f493e4b81b6`) en la que unicamente se ha reconstruido el decodificador fusionado cuantizado, aplicando el modo rapido de ONNX Runtime (`disable_quant_qdq = 1`) para reducir el consumo de memoria a la mitad y acelerar la inferencia entre 2,3 y 2,5 veces.

El modelo mantiene exactamente los mismos pesos y produce los mismos tokens que el original, por lo que su interes no reside en mejoras de calidad sino en la eficiencia del despliegue: permite ejecutar traduccion espanol-aleman en entornos con recursos muy limitados, incluidos navegadores y equipos de escritorio sin GPU. Forma parte del proyecto OptimaMT, que publica 51 pares de idiomas con el mismo esquema de nombres `OptimaMT/<src>-<tgt>`, y ya se utiliza en produccion en la aplicacion de escritorio OpenCircle, un traductor de pantalla para Windows y Linux.

La relevancia actual del modelo es practica: demuestra que es posible servir traduccion neuronal de calidad razonable con un consumo de memoria en torno a 250-280 MiB y sin dependencia de aceleradores hardware, lo que lo convierte en una pieza util para aplicaciones de traduccion local, extensiones de navegador y pipelines ligeros donde el coste por inferencia y la privacidad de los datos son prioritarios.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Marian, familia OPUS-MT) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | ONNX cuantizado (q8); decodificador fusionado con `disable_quant_qdq = 1` |
| Idiomas soportados | espanol (es), aleman (de) |
| Licencia | CC BY 4.0 |
| Formato de pesos | ONNX (`onnx/decoder_model_merged_quantized.onnx` reconstruido; resto de ficheros identicos al original) |

## Arquitectura y entrenamiento

La arquitectura subyacente es Marian, un transformer encoder-decoder disenado especificamente para traduccion automatica neuronal, desarrollado por el grupo Language Technology de la Universidad de Helsinki dentro del proyecto OPUS-MT. El vocabulario del modelo comprende 61.301 tokens. No se dispone en la informacion proporcionada de detalles sobre el numero de tokens de entrenamiento, la composicion del corpus ni si se aplicaron tecnicas de RLHF o DPO; estos datos corresponden al modelo original de OPUS-MT y no se reproducen en la model card de OptimaMT.

La innovacion tecnica de esta distribucion no esta en el entrenamiento sino en la exportacion: se ha reconstruido el grafo del decodificador fusionado para extraer la proyeccion de salida de sus dos ramas, lo que constituye un cambio exclusivamente de grafo. Combinado con el modo rapido de ONNX Runtime (`disable_quant_qdq = 1`), el resultado es una reduccion del 46 % de memoria en Linux (de 516 a 277 MiB) y del 49 % en Windows (de 492 a 253 MiB) respecto a la configuracion por defecto, manteniendo traducciones identicas token a token. Con los valores por defecto de ONNX Runtime la reduccion es mas modesta: del 22 % en Linux y del 15 % en Windows.

## Capacidades

- Traduccion de texto espanol a aleman, unica tarea para la que esta disenado el modelo.
- Generacion de traducciones deterministas con decodificacion greedy, identicas a las del modelo base Xenova/opus-mt-es-de.
- Ejecucion en navegador mediante transformers.js con el backend de ONNX Runtime Web.
- Ejecucion en Python mediante onnxruntime, sentencepiece y numpy, sin necesidad de PyTorch.
- Funcionamiento en CPU con un numero reducido de hilos (las mediciones se realizaron con 4 hilos).
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso.
- No dispone de modo thinking, vision ni audio.
- Cobertura limitada a un unico par de idiomas; no es un modelo multilingue general.

## Casos de uso

- Traduccion de pantalla en tiempo real: la aplicacion OpenCircle, que envia estos modelos desde la version v0.1.4, captura texto en espanol de la pantalla y lo traduce al aleman en local, aprovechando el bajo consumo de memoria (en torno a 250-280 MiB) para no interferir con otras aplicaciones del escritorio.
- Extension de navegador para traduccion de paginas: al ejecutarse con transformers.js y ONNX Runtime Web, el modelo puede cargarse en el navegador del usuario y traducir fragmentos de texto sin enviar contenido a servidores externos, lo que preserva la privacidad.
- Traduccion de documentacion tecnica en pipelines de CI: integrado mediante el script `translate.py` basado en onnxruntime, permite traducir cadenas de recursos, ficheros de localizacion o documentacion de proyectos de software de forma automatizada y reproducible.
- Procesamiento por lotes de correos y mensajes: para organizaciones que reciben comunicaciones en espanol y necesitan versiones en aleman, el modelo puede procesar lotes en CPU con un coste de memoria minimo, sin requerir GPU.
- Traduccion en dispositivos de bajos recursos: su huella de memoria inferior a 300 MiB lo hace viable en equipos antiguos, mini-PC o entornos contenedorizados con limites estrictos de RAM.
- Prototipado y evaluacion de sistemas de traduccion: al producir exactamente los mismos tokens que el modelo base, sirve como sustituto ligero en pruebas de integracion y benchmarks sin alterar los resultados esperados.
- Traduccion de subtitulos o transcripciones: para flujos donde se genera texto en espanol (por ejemplo, desde un sistema de reconocimiento de voz) y se necesita una version alemana con baja latencia en CPU.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Corpus de evaluacion | FLORES-200 devtest (1.012 frases) |
| BLEU | 17,75 |
| chrF | 50,18 |
| Modo de decodificacion | greedy |
| Memoria tras carga (Linux, `disable_quant_qdq = 1`) | 277 MiB (desde 516 MiB, -46 %) |
| Memoria tras carga (Windows, `disable_quant_qdq = 1`) | 253 MiB (desde 492 MiB, -49 %) |
| Memoria tras carga (Linux, valores por defecto) | 216 MiB (desde 276 MiB, -22 %) |
| Memoria tras carga (Windows, valores por defecto) | 165 MiB (desde 196 MiB, -15 %) |
| Aceleracion | 2,3-2,5x |
| Entorno de medida | ONNX Runtime 1.31.1, CPU, 4 hilos (Windows en maquina virtual) |

Los resultados de calidad (BLEU 17,75 y chrF 50,18) corresponden al modelo original y se mantienen identicos en esta distribucion, ya que las traducciones son las mismas token a token.

## Requisitos de hardware

- VRAM estimada: no aplica en el escenario de referencia, ya que el modelo esta pensado para ejecucion en CPU; el consumo de memoria del proceso se situa entre 165 y 277 MiB segun plataforma y configuracion.
- GPU recomendadas: no se requieren; el modelo no aprovecha aceleracion por GPU en la configuracion documentada.
- Compatibilidad con GPU de consumo: irrelevante para el caso de uso principal; el modelo esta disenado para CPU.
- Opciones de despliegue: transformers.js con ONNX Runtime Web (navegador), onnxruntime en Python (script `translate.py` con sentencepiece y numpy), y cualquier runtime compatible con el formato ONNX. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a esta arquitectura y formato.
- Latencia y throughput: la model card indica una aceleracion de 2,3-2,5x respecto a la configuracion por defecto, pero no se proporcionan cifras absolutas de latencia ni de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Calidad | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| OptimaMT/es-de | no disponible | no disponible | BLEU 17,75 / chrF 50,18 (FLORES-200) | CC BY 4.0 | ONNX cuantizado | Decodificador fusionado optimizado, 2,3-2,5x mas rapido |
| Xenova/opus-mt-es-de | no disponible | no disponible | Identica (mismos tokens) | CC BY 4.0 | ONNX | Modelo base del que deriva; mayor consumo de memoria |
| Helsinki-NLP/opus-mt-es-de | no disponible | no disponible | Identica (mismos pesos) | CC BY 4.0 | safetensors / PyTorch | Modelo original de OPUS-MT; requiere framework de aprendizaje profundo |

La comparativa se limita a las variantes del mismo modelo porque la informacion proporcionada no incluye datos de otros sistemas de traduccion espanol-aleman (por ejemplo, NLLB o modelos comerciales) que permitan una comparacion rigurosa de parametros, contexto y rendimiento.

## Limitaciones y advertencias

- El modelo solo traduce de espanol a aleman; no soporta el par inverso ni otros idiomas.
- La calidad es la del modelo OPUS-MT original, con un BLEU de 17,75 en FLORES-200, adecuada para traduccion asistida pero no para publicacion sin revision humana.
- No se dispone de informacion sobre sesgos especificos, pero al derivar de OPUS-MT hereda los posibles sesgos de los corpus paralelos utilizados en su entrenamiento.
- Riesgo de alucinacion y de errores en frases idiomaticas, terminologia especializada y textos con estructura compleja, comun en modelos de traduccion de este tamano.
- No se documenta la longitud maxima de contexto; los textos largos deben dividirse en segmentos.
- La licencia CC BY 4.0 permite uso comercial con atribucion; es obligatorio creditar a OPUS-MT (Universidad de Helsinki), a Xenova por la exportacion ONNX y a OptimaMT por la modificacion del grafo.
- Solo se ha reconstruido el fichero `onnx/decoder_model_merged_quantized.onnx`; el resto de ficheros son identicos byte a byte al original, por lo que cualquier problema del modelo base se mantiene.
- Las mediciones de rendimiento se realizaron en CPU con 4 hilos y Windows en maquina virtual; los resultados pueden variar en otros entornos.
- El modelo tiene un numero reducido de descargas (172) y ninguna valoracion en Hugging Face, lo que limita la evidencia de uso en produccion mas alla de OpenCircle.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/OptimaMT/es-de
- Modelo base en Hugging Face: https://huggingface.co/Xenova/opus-mt-es-de
- Modelo original OPUS-MT: https://huggingface.co/Helsinki-NLP/opus-mt-es-de
- Repositorio del proyecto OptimaMT: https://github.com/AmerAlreyahi/OptimaMT
- Informe metodologico: https://github.com/AmerAlreyahi/OptimaMT/blob/main/REPORT.md
- Script de traduccion en Python: https://github.com/AmerAlreyahi/OptimaMT/blob/main/scripts/translate.py
- Aplicacion OpenCircle: https://github.com/AmerAlreyahi/OpenCircle
- Resultados interactivos: https://huggingface.co/spaces/OptimaMT/results
- Coleccion con los 51 pares de idiomas: https://huggingface.co/collections/OptimaMT/optimamt-lighter-opus-mt-onnx-models-6af228dc9cd91f015e56e869
