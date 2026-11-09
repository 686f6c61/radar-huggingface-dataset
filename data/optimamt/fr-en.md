# OptimaMT/fr-en

## Resumen
OptimaMT/fr-en es un modelo de traduccion automatica frances a ingles publicado por el proyecto OptimaMT, distribuido como copia directa del export ONNX de Xenova/opus-mt-fr-en, que a su vez deriva del modelo OPUS-MT de la Universidad de Helsinki. El modelo mantiene exactamente los mismos pesos y el mismo vocabulario que el original, pero sustituye el decodificador combinado por una version reconstruida que reduce el consumo de memoria en tiempo de ejecucion sin alterar la salida generada.

La relevancia de esta ficha no esta en la calidad de traduccion, que es identica a la del modelo base, sino en la optimizacion del grafo ONNX: segun la model card, el uso de memoria tras la carga baja de 505 a 272 MiB en Linux (un 46 % menos) con `disable_quant_qdq = 1`, y de 270 a 212 MiB con los valores por defecto de ONNX Runtime, manteniendo tokens de salida identicos. Esto lo hace util para despliegues en navegador o en entornos con memoria limitada mediante transformers.js.

Se trata de un modelo Marian de traduccion unidireccional (fr a en), con un vocabulario de 59.514 tokens, licencia CC BY 4.0 y un tamano de repositorio de 0,1 GB. No es un modelo generativo de proposito general ni soporta razonamiento o tool calling: su unico cometido es la traduccion de frases o parrafos del frances al ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Marian (transformer encoder-decoder para traduccion, exportado a ONNX) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | ONNX cuantizado (q8 en el ejemplo de uso); el repositorio incluye `decoder_model_merged_quantized.onnx` |
| Idiomas soportados | frances (fr) y ingles (en) |
| Licencia | CC BY 4.0 |
| Formato de pesos | ONNX (transformers.js); repositorio de 0,1 GB |

## Arquitectura y entrenamiento
El modelo es un Marian, la arquitectura de traduccion neuronal secuencia a secuencia desarrollada en el ecosistema OPUS-MT de la Universidad de Helsinki. Consta de un encoder y un decoder transformer con proyeccion de salida sobre un vocabulario de 59.514 tokens. OptimaMT no reentrena ni ajusta los pesos: parte del export ONNX de Xenova en la revision `6b166a182780` y reconstruye unicamente el fichero `onnx/decoder_model_merged_quantized.onnx`, moviendo la proyeccion de salida del decoder fuera de sus dos ramas. El resto de ficheros se conserva byte a byte.

No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del corpus ni el uso de tecnicas de alineacion como RLHF o DPO en la informacion proporcionada. La innovacion tecnica documentada es exclusivamente la del grafo ONNX: la reorganizacion del decoder combinado reduce la memoria residente tras la carga entre un 16 % y un 48 % segun la configuracion de ONNX Runtime y la plataforma, con verificacion de que los tokens de salida son identicos a los del modelo de referencia.

## Capacidades
- Traduccion de texto de frances a ingles, unidireccional.
- Generacion de texto secuencia a secuencia mediante pipeline `translation` de transformers.js.
- Ejecucion en navegador o en Node.js a traves de ONNX Runtime Web, con cuantizacion q8.
- Ejecucion en Python mediante onnxruntime, sentencepiece y numpy (script `translate.py` del repositorio).
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni comportamiento de agente.
- No dispone de modo thinking, vision ni audio.
- Cobertura multilingue limitada estrictamente al par fr-en.

## Casos de uso
- Traduccion en el navegador sin backend: al ejecutarse con transformers.js y ONNX Runtime Web, el modelo puede integrarse en una pagina web para traducir contenido frances a ingles en el cliente, sin enviar texto a un servidor y con una huella de memoria de aproximadamente 212-272 MiB tras la carga.
- Traduccion por lotes en servidores modestos: el script `translate.py` basado en onnxruntime permite procesar ficheros de texto o subtitulos en maquinas sin GPU, aprovechando la reduccion de memoria del decoder reconstruido.
- Preprocesado de datos para pipelines de NLP: traduccion de corpus franceses a ingles antes de alimentar modelos de analisis, clasificacion o busqueda que solo operan en ingles.
- Internacionalizacion de documentacion tecnica: traduccion de README, guias y notas de version escritas en frances a un ingles de referencia para su posterior revision humana.
- Traduccion de subtitulos y transcripciones: procesamiento de segmentos cortos de audio transcrito en frances, adecuado por la naturaleza frase a frase del modelo Marian.
- Extension de navegador o herramienta de escritorio: integracion del modelo ONNX en una aplicacion local que traduzca selecciones de texto, sin dependencia de APIs externas y con licencia CC BY 4.0 compatible con uso comercial con atribucion.
- Prototipado de sistemas de traduccion: uso como linea base ligera frente a modelos multilingues de mayor tamano cuando el unico par necesario es fr-en.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente reporta metricas de memoria tras la carga y la comprobacion de que los tokens de salida son identicos a los del modelo base:

| Metrica | Linux | Windows |
|---|---:|---:|
| Memoria con `disable_quant_qdq = 1` | 505 → 272 MiB (-46 %) | 481 → 249 MiB (-48 %) |
| Memoria con valores por defecto de ONNX Runtime | 270 → 212 MiB (-22 %) | 192 → 162 MiB (-16 %) |
| Tokens de salida identicos | si | si |

Las mediciones se realizaron con ONNX Runtime 1.31.1, en CPU, con 4 hilos (Windows en una maquina virtual).

## Requisitos de hardware
- VRAM: no aplica en la configuracion documentada; el modelo se ejecuta en CPU con ONNX Runtime.
- Memoria RAM estimada: entre 162 y 272 MiB tras la carga, segun plataforma y opciones de sesion.
- GPU recomendadas: no disponibles; el modelo esta orientado a CPU y a ejecucion en navegador.
- Cabe en cualquier GPU de consumo y en entornos sin GPU; no requiere aceleracion dedicada.
- Opciones de despliegue: transformers.js con `dtype: "q8"` y `session_options` con `disable_quant_qdq`, o onnxruntime en Python mediante el script `translate.py`.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| OptimaMT/fr-en | no disponible | no disponible | fr, en | CC BY 4.0 | ONNX |
| Xenova/opus-mt-fr-en | no disponible | no disponible | fr, en | CC BY 4.0 | ONNX |
| Helsinki-NLP/opus-mt-fr-en | no disponible | no disponible | fr, en | CC BY 4.0 | safetensors / PyTorch |

La diferencia entre los tres modelos es de empaquetado, no de calidad: OptimaMT/fr-en y Xenova/opus-mt-fr-en son exports ONNX del modelo original de Helsinki-NLP, y OptimaMT anade una reconstruccion del decoder combinado que reduce la memoria con salidas identicas. No se dispone de datos de rendimiento comparativo (BLEU u otras metricas) en la informacion proporcionada.

## Limitaciones y advertencias
- Modelo unidireccional: solo traduce de frances a ingles; no admite el par inverso ni otros idiomas.
- No es un modelo generativo general: no responde preguntas, no razona y no ejecuta codigo.
- Riesgo de alucinacion y de traducciones literales en frases idiomaticas, terminologia especializada o texto con ruido, inherente a los modelos Marian de este tamano.
- Longitud de contexto no documentada; el modelo esta pensado para segmentos cortos y puede degradarse con entradas muy largas.
- Licencia CC BY 4.0: permite uso comercial con atribucion a OPUS-MT, Xenova y OptimaMT; es necesario conservar los creditos.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de uso en produccion ni validacion externa.
- La optimizacion depende de la opcion `disable_quant_qdq` de ONNX Runtime; con otras configuraciones la reduccion de memoria es menor.
- No se han publicado evaluaciones de calidad de traduccion especificas para esta copia.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/OptimaMT/fr-en
- Repositorio OptimaMT: https://github.com/AmerAlreyahi/OptimaMT
- Informe del metodo: https://github.com/AmerAlreyahi/OptimaMT/blob/main/REPORT.md
- Script de traduccion en Python: https://github.com/AmerAlreyahi/OptimaMT/blob/main/scripts/translate.py
- Demo de resultados: https://huggingface.co/spaces/OptimaMT/results
- Modelo base ONNX: https://huggingface.co/Xenova/opus-mt-fr-en
- Modelo original OPUS-MT: https://huggingface.co/Helsinki-NLP/opus-mt-fr-en
