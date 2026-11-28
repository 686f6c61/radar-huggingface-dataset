# OptimaMT/en-hi

## Resumen

OptimaMT/en-hi es un modelo de traduccion automatica ingles-hindi derivado de Xenova/opus-mt-en-hi, que a su vez es una exportacion a ONNX del modelo OPUS-MT de la Universidad de Helsinki. El modelo original se basa en la arquitectura Marian (transformer encoder-decoder) y esta disenado especificamente para la tarea de traduccion en el par de idiomas ingles-hindi. OptimaMT publica esta variante como una copia "drop-in" con un decodificador fusionado mas ligero, optimizado para ONNX Runtime.

La relevancia de esta ficha radica en que no se trata de un modelo nuevo entrenado desde cero, sino de una reoptimizacion de inferencia: se reconstruye unicamente el fichero `onnx/decoder_model_merged_quantized.onnx` mientras que el resto de ficheros son identicos byte a byte al original. Segun la model card, el modo rapido de ONNX Runtime (`disable_quant_qdq = 1`) ofrece entre 2,3 y 2,5 veces mas velocidad y aproximadamente la mitad de memoria, manteniendo exactamente los mismos tokens de salida que el modelo original.

El modelo esta pensado para despliegue en el navegador o en entornos ligeros mediante transformers.js y ONNX Runtime, con un tamano de repositorio de 0,1 GB. Forma parte de una coleccion mas amplia de 51 pares de idiomas publicados bajo el mismo esquema de nombres `OptimaMT/<src>-<tgt>`, y ya se usa en produccion en la aplicacion OpenCircle, un traductor de pantalla de escritorio para Windows y Linux.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Marian (transformer encoder-decoder), exportado a ONNX |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | ONNX cuantizado (q8 en el ejemplo de uso); fichero `decoder_model_merged_quantized.onnx` |
| Idiomas soportados | ingles (en), hindi (hi) |
| Licencia | CC BY 4.0 |
| Formato de pesos | ONNX (transformers.js) |
| Vocabulario | 61.950 tokens |
| Tamano del repositorio | 0,1 GB |
| Modelo base | Xenova/opus-mt-en-hi (revision `7aad72006a15`) |
| Pipeline | translation |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura Marian del OPUS-MT original de Helsinki-NLP, un transformer encoder-decoder disenado para traduccion automatica neuronal. No se ha realizado ningun entrenamiento adicional: los pesos son los mismos que los del modelo base Xenova/opus-mt-en-hi, que a su vez proviene de Helsinki-NLP/opus-mt-en-hi. La unica modificacion introducida por OptimaMT es un cambio en el grafo ONNX: la proyeccion de salida del decodificador se ha movido fuera de sus dos ramas, lo que permite un decodificador fusionado mas eficiente.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO en el modelo original. Tampoco se documentan innovaciones como decodificacion especulativa o atencion lineal. La innovacion destacable de esta variante es exclusivamente de inferencia: el uso del modo rapido de ONNX Runtime (`disable_quant_qdq = 1`), que segun la model card reduce el consumo de memoria de 522 a 279 MiB en Linux (-47 %) y de 498 a 255 MiB en Windows (-49 %), manteniendo tokens identicos a la salida original.

## Capacidades

- Traduccion de texto de ingles a hindi en modalidad texto a texto.
- Generacion de traduccion determinista en modo greedy (el ejemplo de la model card usa decodificacion greedy).
- Ejecucion en navegador y en entornos JavaScript mediante transformers.js y ONNX Runtime.
- Inferencia en CPU con ONNX Runtime (probado con 4 hilos).
- Compatibilidad con Python mediante onnxruntime, sentencepiece y numpy (script `translate.py`).
- No se documentan capacidades de tool calling, function calling, agentes, razonamiento multi-paso, vision, audio ni modo thinking.
- Capacidad multilingue limitada exclusivamente al par en-hi.

## Casos de uso

- Traduccion de pantalla en tiempo real: el modelo esta pensado para aplicaciones de escritorio como OpenCircle, que lo integra desde la version v0.1.4 para traducir texto en pantalla de ingles a hindi con bajo consumo de memoria (255-279 MiB tras la carga).
- Traduccion en el navegador sin backend: gracias a transformers.js y al formato ONNX cuantizado, puede ejecutarse del lado del cliente en aplicaciones web que necesiten traducir contenido en-hi sin enviar datos a un servidor.
- Traduccion de documentacion tecnica: adecuado para pipelines que conviertan documentacion de producto o manuales de ingles a hindi, dado su bajo coste de despliegue y su naturaleza determinista.
- Preprocesado en pipelines de NLP multilingue: puede usarse como paso de traduccion en-hi antes de aplicar otros modelos de analisis o clasificacion sobre texto en hindi.
- Aplicaciones de bajo recursos en CPU: al requerir solo unos cientos de MiB de memoria y funcionar en CPU con 4 hilos, encaja en entornos sin GPU como servidores ligeros, contenedores o dispositivos de borde.
- Traduccion de subtitulos o textos cortos en herramientas de escritorio: su tamano reducido (0,1 GB de repositorio) y su velocidad (2,3-2,5 veces superior al original en modo rapido) lo hacen apto para integraciones en aplicaciones de escritorio multiplataforma (Windows y Linux).

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Conjunto de evaluacion | FLORES-200 devtest (1.012 frases) |
| BLEU | 11,33 |
| chrF | 32,0 |
| Modo de decodificacion | greedy |
| Equivalencia con el original | tokens identicos |
| Memoria tras carga (Linux, `disable_quant_qdq = 1`) | 522 → 279 MiB (-47 %) |
| Memoria tras carga (Windows, `disable_quant_qdq = 1`) | 498 → 255 MiB (-49 %) |
| Memoria tras carga (Linux, valores por defecto ONNX Runtime) | 279 → 218 MiB (-22 %) |
| Memoria tras carga (Windows, valores por defecto ONNX Runtime) | 196 → 164 MiB (-16 %) |
| Entorno de medida | ONNX Runtime 1.31.1, CPU, 4 hilos |

No se han publicado en la informacion disponible resultados de benchmarks como MMLU, HumanEval o GSM8K, que no aplican a un modelo de traduccion.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en el modo documentado; el modelo se ejecuta en CPU con un consumo de memoria de aproximadamente 255-279 MiB tras la carga con `disable_quant_qdq = 1`.
- GPU recomendadas: no se documentan; el modelo esta optimizado para CPU con ONNX Runtime.
- Compatibilidad con GPU de consumo: no se especifica, aunque por su tamano (0,1 GB de repositorio) cabria en cualquier GPU de consumo si se ejecutara en ese modo; no se aportan datos al respecto.
- Opciones de despliegue: transformers.js (JavaScript), ONNX Runtime en Python mediante `translate.py` (onnxruntime, sentencepiece, numpy). No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no se proporcionan cifras absolutas de latencia o throughput; solo la mejora relativa de 2,3-2,5 veces en modo rapido respecto al original.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| OptimaMT/en-hi | no disponible | no disponible | en, hi | CC BY 4.0 | ONNX | Decodificador fusionado optimizado, 2,3-2,5x mas rapido |
| Xenova/opus-mt-en-hi | no disponible | no disponible | en, hi | CC BY 4.0 | ONNX | Modelo base; mismos pesos, sin la optimizacion del decodificador |
| Helsinki-NLP/opus-mt-en-hi | no disponible | no disponible | en, hi | CC BY 4.0 | PyTorch (original) | Modelo OPUS-MT original de la Universidad de Helsinki |

No se dispone de datos de rendimiento comparativo (BLEU/chrF) de los modelos alternativos en la informacion proporcionada, salvo la equivalencia de tokens entre OptimaMT/en-hi y su base.

## Limitaciones y advertencias

- Solo traduce de ingles a hindi; no soporta otros pares de idiomas ni traduccion inversa.
- No se documentan sesgos conocidos, pero al heredar los pesos de OPUS-MT puede reproducir los sesgos presentes en los datos de entrenamiento originales.
- Riesgo de alucinacion y de traducciones inexactas en dominios especializados o texto con terminologia tecnica, dado el BLEU de 11,33 en FLORES-200.
- No se documenta la longitud maxima de contexto; puede haber limitaciones no especificadas para entradas largas.
- La licencia CC BY 4.0 permite uso comercial con atribucion; es necesario conservar los creditos a OPUS-MT (Universidad de Helsinki), a Xenova por la exportacion ONNX y a OptimaMT por la modificacion del grafo.
- La optimizacion se ha validado con ONNX Runtime 1.31.1 en CPU con 4 hilos; el rendimiento puede variar en otras versiones o configuraciones.
- Solo se reconstruye el fichero `onnx/decoder_model_merged_quantized.onnx`; el resto de ficheros son identicos al original, por lo que las limitaciones del modelo base se mantienen integras.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/OptimaMT/en-hi
- Modelo base en Hugging Face: https://huggingface.co/Xenova/opus-mt-en-hi
- OPUS-MT original: https://huggingface.co/Helsinki-NLP/opus-mt-en-hi
- Repositorio OptimaMT: https://github.com/AmerAlreyahi/OptimaMT
- Coleccion de los 51 pares: https://huggingface.co/collections/OptimaMT/optimamt-lighter-opus-mt-onnx-models-6af228dc9cd91f015e56e869
- Resultados interactivos: https://huggingface.co/spaces/OptimaMT/results
- Metodologia (REPORT.md): https://github.com/AmerAlreyahi/OptimaMT/blob/main/REPORT.md
- Script de traduccion en Python: https://github.com/AmerAlreyahi/OptimaMT/blob/main/scripts/translate.py
- OpenCircle (aplicacion que lo usa en produccion): https://github.com/AmerAlreyahi/OpenCircle
