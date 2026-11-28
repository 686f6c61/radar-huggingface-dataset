# OptimaMT/de-en

## Resumen

OptimaMT/de-en es un modelo de traduccion automatica aleman-ingles publicado por OptimaMT como reempaquetado optimizado del clasico OPUS-MT de la Universidad de Helsinki, en su version ONNX distribuida por Xenova. No se trata de un modelo entrenado desde cero, sino de una copia byte a byte de `Xenova/opus-mt-de-en` (revision `399dfd687067`) en la que solo se ha reconstruido el decodificador fusionado cuantizado para aprovechar el modo rapido de ONNX Runtime. El resultado son exactamente las mismas traducciones que el original, pero con entre un 46 % y un 48 % menos de memoria tras la carga en Linux y Windows respectivamente, y una velocidad de inferencia entre 2,3 y 2,5 veces mayor.

La arquitectura subyacente es Marian NMT, un transformer encoder-decoder seq2seq especializado en traduccion, con un vocabulario de 58.101 tokens. El modelo es deliberadamente pequeno (el repositorio completo ocupa 0,1 GB) y esta pensado para ejecutarse en CPU, lo que lo convierte en una pieza adecuada para aplicaciones de escritorio, extensiones de navegador o servicios de traduccion de bajo coste donde no hay GPU disponible.

Su relevancia actual radica en que demuestra que una optimizacion puramente de grafo (mover la proyeccion de salida del decodificador fuera de sus dos ramas y activar `disable_quant_qdq`) puede reducir a la mitad el consumo de memoria sin tocar los pesos ni degradar la calidad. Forma parte de una coleccion de 51 pares de idiomas con el mismo enfoque, y ya se usa en produccion en OpenCircle, un traductor de pantalla de escritorio para Windows y Linux.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Marian NMT (transformer encoder-decoder seq2seq) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | ONNX cuantizado (q8 en el ejemplo de uso); el autor menciona `disable_quant_qdq = 1` como opcion de sesion |
| Idiomas soportados | aleman (de), ingles (en) |
| Licencia | CC BY 4.0 |
| Formato de pesos | ONNX (`decoder_model_merged_quantized.onnx` reconstruido; resto de ficheros identicos al original) |
| Vocabulario | 58.101 tokens |
| Tamano del repositorio | 0,1 GB |
| Libreria | transformers.js |
| Modelo base | Xenova/opus-mt-de-en (revision `399dfd687067`) |

## Arquitectura y entrenamiento

El modelo es un Marian NMT, la arquitectura seq2seq encoder-decoder desarrollada por el grupo de Helsinki-NLP para traduccion automatica neuronal. No hay entrenamiento propio por parte de OptimaMT: los pesos son los de OPUS-MT de la Universidad de Helsinki, exportados a ONNX por Xenova y reempaquetados aqui. Por tanto, los datos de entrenamiento, el numero de tokens vistos y la composicion del corpus corresponden al modelo original de OPUS-MT, y no se detallan en la informacion disponible.

La innovacion tecnica de este reempaquetado es exclusivamente de grafo. Se ha reconstruido unicamente `onnx/decoder_model_merged_quantized.onnx`, moviendo la proyeccion de salida del decodificador fuera de sus dos ramas, y se activa el modo rapido de ONNX Runtime mediante `disable_quant_qdq = 1`. Segun el autor, esto produce una aceleracion de 2,3 a 2,5 veces y reduce la memoria tras la carga de 495 a 268 MiB en Linux (-46 %) y de 474 a 245 MiB en Windows (-48 %). Con los valores por defecto de ONNX Runtime la reduccion es menor: de 265 a 208 MiB en Linux (-21 %) y de 190 a 158 MiB en Windows (-17 %). En todos los casos los tokens generados son identicos a los del original.

## Capacidades

- Traduccion de texto aleman a ingles, unica tarea del modelo (pipeline `translation`).
- Generacion seq2seq determinista con decodificacion greedy; el autor reporta resultados con estrategia greedy.
- Ejecucion en CPU mediante ONNX Runtime, sin necesidad de GPU.
- Integracion con transformers.js en JavaScript/TypeScript mediante `pipeline("translation", ...)`.
- Integracion en Python mediante `onnxruntime`, `sentencepiece` y `numpy` (script `translate.py` del repositorio).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, vision ni audio.
- No es un modelo multilingue: solo cubre el par de-en.

## Casos de uso

- Traduccion de pantalla en aplicaciones de escritorio: OpenCircle, el traductor de pantalla para Windows y Linux del mismo autor, ya embarca estos modelos desde la version v0.1.4. El bajo consumo de memoria (245-268 MiB tras la carga) y la ejecucion en CPU permiten mantener el modelo residente mientras se capturan y traducen regiones de pantalla en tiempo real.
- Extensiones de navegador y widgets de traduccion: al ocupar 0,1 GB y ejecutarse via transformers.js en el runtime de JavaScript, puede desplegarse en el cliente sin backend, traduciendo fragmentos de paginas web alemanas al ingles de forma local.
- Preprocesado de corpus y pipelines de datos: util para traducir grandes volumenes de texto aleman a ingles en tareas de mineria de datos, curacion de datasets o generacion de pares paralelos, donde el throughput en CPU importa mas que la calidad de un modelo grande.
- Traduccion de documentacion tecnica y tickets de soporte: para equipos que reciben material en aleman y necesitan una primera version en ingles antes de la revision humana, con la ventaja de que el modelo cabe en cualquier portatil.
- Sistemas de traduccion por lotes en servidores sin GPU: al ejecutarse en ONNX Runtime sobre CPU, puede desplegarse en contenedores ligeros o entornos edge donde no hay aceleradores disponibles.
- Prototipado y evaluacion de pipelines NMT: sirve como baseline rapido y reproducible (BLEU 40,04 y chrF 66,18 en FLORES-200 devtest) para comparar con modelos de traduccion mas grandes o con otras estrategias de decodificacion.

## Benchmarks y rendimiento

El autor reporta resultados sobre FLORES-200 devtest (1.012 frases) con decodificacion greedy. No se proporcionan comparaciones numericas con otros modelos en la informacion disponible.

| Metrica | Valor |
|---|---|
| BLEU (FLORES-200 devtest, greedy) | 40,04 |
| chrF (FLORES-200 devtest, greedy) | 66,18 |
| Aceleracion vs. original (`disable_quant_qdq = 1`) | 2,3-2,5x |
| Memoria tras carga, Linux (con `disable_quant_qdq = 1`) | 495 -> 268 MiB (-46 %) |
| Memoria tras carga, Windows (con `disable_quant_qdq = 1`) | 474 -> 245 MiB (-48 %) |
| Memoria tras carga, Linux (defaults ONNX Runtime) | 265 -> 208 MiB (-21 %) |
| Memoria tras carga, Windows (defaults ONNX Runtime) | 190 -> 158 MiB (-17 %) |
| Identidad de tokens vs. original | si |

Entorno de medida: ONNX Runtime 1.31.1, CPU, 4 hilos (Linux; Windows en una maquina virtual).

## Requisitos de hardware

- VRAM: no aplica; el modelo esta pensado para ejecucion en CPU.
- Memoria RAM tras la carga: 245-268 MiB con `disable_quant_qdq = 1`; 158-208 MiB con los valores por defecto de ONNX Runtime.
- GPU: no necesaria. No se han publicado requisitos ni recomendaciones de GPU.
- Cabe holgadamente en cualquier equipo de consumo, incluidos portatiles modestos y dispositivos edge.
- Opciones de despliegue: ONNX Runtime (via transformers.js en JS/TS o via `onnxruntime` en Python), tal como se documenta en la model card.
- Latencia y throughput: no se publican cifras absolutas de latencia o tokens por segundo; solo el factor de aceleracion relativo (2,3-2,5x) y las cifras de memoria.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| OptimaMT/de-en | no disponible | no disponible | de, en | CC BY 4.0 | ONNX | Reempaquetado optimizado; BLEU 40,04 en FLORES-200 devtest |
| Xenova/opus-mt-de-en | no disponible | no disponible | de, en | CC BY 4.0 | ONNX | Modelo base; mismas traducciones, mas memoria y mas lento |
| Helsinki-NLP/opus-mt-de-en | no disponible | no disponible | de, en | CC BY 4.0 | safetensors/PyTorch (formato original OPUS-MT) | Pesos originales de la Universidad de Helsinki |

No se dispone de datos de benchmarks de los modelos comparables en la informacion proporcionada, por lo que la comparacion se limita a licencia, formato y caracteristicas de despliegue.

## Limitaciones y advertencias

- Modelo de traduccion de un solo par (de-en); no sirve para otras direcciones ni para tareas generativas generales.
- No hay informacion sobre sesgos del corpus de entrenamiento original de OPUS-MT en la documentacion disponible; al ser un modelo de traduccion, puede reflejar sesgos presentes en los datos de OPUS.
- Riesgo de alucinacion y de traducciones incorrectas en dominios especializados (terminologia juridica, medica o tecnica muy especifica), comun en modelos NMT de este tamano.
- No se documenta la longitud maxima de secuencia de entrada ni el contexto soportado; conviene validar el comportamiento con frases largas antes de usarlo en produccion.
- Licencia CC BY 4.0: permite uso comercial con atribucion. Es obligatorio acreditar a OPUS-MT (Universidad de Helsinki) y a Xenova por la exportacion ONNX, ademas de indicar los cambios realizados por OptimaMT.
- El rendimiento optimizado depende de activar `disable_quant_qdq = 1` en las opciones de sesion de ONNX Runtime; con los valores por defecto la mejora de memoria es mucho menor.
- Solo se ha reconstruido el decodificador fusionado cuantizado; el resto de ficheros son identicos al original, por lo que cualquier limitacion del modelo base se hereda intacta.
- El modelo se distribuye para transformers.js y ONNX Runtime; no se proporcionan pesos en safetensors ni GGUF en este repositorio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/OptimaMT/de-en
- Modelo base en Hugging Face: https://huggingface.co/Xenova/opus-mt-de-en
- Pesos originales OPUS-MT: https://huggingface.co/Helsinki-NLP/opus-mt-de-en
- Repositorio del proyecto OptimaMT: https://github.com/AmerAlreyahi/OptimaMT
- Informe metodologico (REPORT.md): https://github.com/AmerAlreyahi/OptimaMT/blob/main/REPORT.md
- Script de traduccion en Python: https://github.com/AmerAlreyahi/OptimaMT/blob/main/scripts/translate.py
- Coleccion de los 51 pares de idiomas: https://huggingface.co/collections/OptimaMT/optimamt-lighter-opus-mt-onnx-models-6af228dc9cd91f015e56e869
- Resultados interactivos (Space): https://huggingface.co/spaces/OptimaMT/results
- OpenCircle, traductor de pantalla que usa estos modelos: https://github.com/AmerAlreyahi/OpenCircle
