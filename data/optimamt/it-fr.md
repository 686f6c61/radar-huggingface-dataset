# OptimaMT/it-fr

## Resumen

OptimaMT/it-fr es un modelo de traduccion automatica italiano-frances publicado por OptimaMT como parte de una coleccion de 51 pares de idiomas. Se trata de una copia directa del modelo Xenova/opus-mt-it-fr (revision `7843e3b7137d`), que a su vez es una exportacion ONNX del clasico OPUS-MT de la Universidad de Helsinki. La unica modificacion introducida por OptimaMT es la reconstruccion del decodificador combinado en formato ONNX cuantizado, aplicando el modo rapido de ONNX Runtime (`disable_quant_qdq = 1`).

El modelo resuelve un problema muy concreto: reducir el consumo de memoria y aumentar la velocidad de inferencia en CPU sin alterar ni un solo token de salida respecto al original. Segun la model card, el decodificador consume entre un 46 % y un 48 % menos de memoria en Linux y Windows respectivamente con `disable_quant_qdq = 1`, y entre un 15 % y un 21 % menos con los valores por defecto de ONNX Runtime, manteniendo traducciones identicas.

Es relevante para desarrolladores que necesitan traduccion de calidad en entornos con recursos limitados, especialmente en aplicaciones de escritorio o web que usan transformers.js. El modelo esta pensado para ejecutarse en CPU con ONNX Runtime y tiene un tamano de repositorio de solo 0,1 GB, lo que lo hace adecuado para despliegues ligeros y aplicaciones de traduccion en tiempo real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Marian, OPUS-MT) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | ONNX cuantizado (q8); decodificador combinado cuantizado |
| Idiomas soportados | italiano (it), frances (fr) |
| Licencia | CC BY 4.0 |
| Formato de pesos | ONNX (`decoder_model_merged_quantized.onnx` y resto de ficheros originales) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura Marian de OPUS-MT, un transformer encoder-decoder disenado especificamente para traduccion automatica neuronal. Los pesos originales fueron entrenados por la Universidad de Helsinki como parte del proyecto OPUS-MT, y posteriormente exportados a ONNX por Xenova para su uso con transformers.js. OptimaMT no ha reentrenado ni ajustado los pesos: la unica intervencion es un cambio en el grafo del decodificador, moviendo la proyeccion de salida fuera de sus dos ramas para permitir el modo rapido de ONNX Runtime.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO, ya que la model card no los detalla. La innovacion tecnica destacable es la aplicacion de `disable_quant_qdq = 1` en ONNX Runtime, que acelera la inferencia entre 2,3 y 2,5 veces y reduce el uso de memoria a la mitad, manteniendo exactamente los mismos tokens de salida que el modelo original. El vocabulario tiene 59.351 tokens.

## Capacidades

- Traduccion de texto italiano a frances, unico par de idiomas soportado.
- Generacion de texto secuencia a secuencia (text2text-generation) orientada exclusivamente a traduccion.
- Ejecucion en navegador y Node.js mediante transformers.js.
- Ejecucion en Python mediante onnxruntime, sentencepiece y numpy.
- Inferencia en CPU con ONNX Runtime, sin necesidad de GPU.
- Compatibilidad con el modo rapido de ONNX Runtime (`disable_quant_qdq = 1`) para reducir memoria y latencia.
- No soporta tool calling, function calling, agentes, vision, audio ni modo thinking.
- Capacidades multilingues limitadas al par it-fr.

## Casos de uso

- Traduccion de pantalla en aplicaciones de escritorio: OpenCircle, un traductor de pantalla para Windows y Linux, ya integra estos modelos desde su version v0.1.4, aprovechando el bajo consumo de memoria para mantener la traduccion en tiempo real mientras el usuario trabaja.
- Traduccion en el navegador sin backend: gracias a transformers.js y al formato ONNX, el modelo puede ejecutarse integramente en el cliente, lo que permite ofrecer traduccion italiana-francesa en aplicaciones web sin enviar texto a un servidor y sin costes de infraestructura.
- Procesamiento por lotes de documentos en CPU: el modelo puede traducir grandes volumenes de texto en servidores sin GPU, con un consumo de memoria de aproximadamente 249-272 MiB tras la carga en modo rapido, lo que permite ejecutar varias instancias en paralelo en una sola maquina.
- Traduccion de subtitulos y contenido multimedia: la baja latencia en CPU y el reducido tamano del modelo (0,1 GB) lo hacen adecuado para pipelines de traduccion de subtitulos en tiempo casi real en entornos con recursos limitados.
- Aplicaciones de mensajeria y chat multilingue: integracion en clientes de mensajeria para traducir automaticamente mensajes entre usuarios italianos y franceses, con inferencia local en el dispositivo y sin dependencia de servicios externos.
- Sistemas embebidos y dispositivos de bajo consumo: el modelo puede desplegarse en dispositivos con poca memoria RAM, como Raspberry Pi o mini-PC, para tareas de traduccion puntual en kioscos, senaletica o asistentes de voz locales.
- Preprocesamiento en pipelines de NLP: usar el modelo como paso previo de traduccion antes de aplicar otros modelos de analisis, clasificacion o resumen sobre texto en frances a partir de fuentes italianas.

## Benchmarks y rendimiento

| Benchmark | Resultado |
|---|---|
| FLORES-200 devtest (1.012 frases), BLEU | 30,22 |
| FLORES-200 devtest (1.012 frases), chrF | 58,86 |
| Tokens identicos al original | Si |
| Aceleracion con `disable_quant_qdq = 1` | 2,3-2,5x |
| Memoria tras carga (Linux, modo rapido) | 503 → 272 MiB (-46 %) |
| Memoria tras carga (Windows, modo rapido) | 481 → 249 MiB (-48 %) |
| Memoria tras carga (Linux, por defecto) | 270 → 212 MiB (-21 %) |
| Memoria tras carga (Windows, por defecto) | 191 → 162 MiB (-15 %) |

Los resultados se obtuvieron con ONNX Runtime 1.31.1, en CPU con 4 hilos (Linux; Windows en una maquina virtual), con decodificacion greedy.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica, el modelo esta disenado para CPU. En GPU, el consumo seria minimo (menos de 1 GB) dado el tamano del repositorio de 0,1 GB.
- GPU recomendadas: no es necesario GPU; cualquier GPU moderna puede ejecutarlo, pero el objetivo es la inferencia en CPU.
- Cabe en cualquier consumer GPU y en la mayoria de CPUs modernas; el consumo de memoria tras la carga es de aproximadamente 249-272 MiB en modo rapido y 162-212 MiB con los valores por defecto.
- Opciones de despliegue: transformers.js (JavaScript/TypeScript), onnxruntime en Python, y cualquier runtime compatible con ONNX. No se menciona soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no se proporcionan cifras absolutas de latencia o throughput, solo la aceleracion relativa de 2,3-2,5x respecto al modelo original con `disable_quant_qdq = 1`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Memoria tras carga |
|---|---|---|---|---|---|---|
| OptimaMT/it-fr | no disponible | no disponible | it-fr | CC BY 4.0 | ONNX | 249-272 MiB (modo rapido) |
| Xenova/opus-mt-it-fr | no disponible | no disponible | it-fr | CC BY 4.0 | ONNX | 481-503 MiB (original) |
| Helsinki-NLP/opus-mt-it-fr | no disponible | no disponible | it-fr | CC BY 4.0 | safetensors/PyTorch | no disponible |

La comparativa se limita al ecosistema OPUS-MT, ya que no se dispone de informacion sobre otros modelos de traduccion italiano-frances en la documentacion proporcionada. La diferencia principal frente a Xenova/opus-mt-it-fr es el menor consumo de memoria y la mayor velocidad, manteniendo traducciones identicas. Frente a Helsinki-NLP/opus-mt-it-fr, la ventaja es el formato ONNX optimizado para CPU y navegador.

## Limitaciones y advertencias

- El modelo solo traduce de italiano a frances; no soporta otros pares de idiomas ni traduccion inversa.
- Al ser una copia de OPUS-MT, hereda los sesgos y limitaciones del corpus de entrenamiento original, que no se detallan en la model card.
- Riesgo de alucinacion y errores en textos especializados, terminologia tecnica o dominios muy especificos, comun en modelos de traduccion neuronal de este tamano.
- No se especifica la longitud maxima de contexto; textos largos pueden requerir segmentacion manual.
- La licencia CC BY 4.0 permite uso comercial con atribucion, pero es necesario creditar a OPUS-MT (Universidad de Helsinki), Xenova y OptimaMT segun corresponda.
- El modelo esta pensado para CPU y ONNX Runtime; el rendimiento en GPU no esta documentado.
- La model card no proporciona informacion sobre el dataset de entrenamiento, lo que limita la evaluacion de sesgos y cobertura linguistica.
- El uso de `disable_quant_qdq = 1` requiere ONNX Runtime 1.31.1 o compatible y configuracion especifica en las opciones de sesion.

## Enlaces

- [Hugging Face: OptimaMT/it-fr](https://huggingface.co/OptimaMT/it-fr)
- [Modelo base: Xenova/opus-mt-it-fr](https://huggingface.co/Xenova/opus-mt-it-fr)
- [OPUS-MT original: Helsinki-NLP/opus-mt-it-fr](https://huggingface.co/Helsinki-NLP/opus-mt-it-fr)
- [Coleccion OptimaMT (51 pares)](https://huggingface.co/collections/OptimaMT/optimamt-lighter-opus-mt-onnx-models-6af228dc9cd91f015e56e869)
- [Repositorio GitHub de OptimaMT](https://github.com/AmerAlreyahi/OptimaMT)
- [Informe tecnico REPORT.md](https://github.com/AmerAlreyahi/OptimaMT/blob/main/REPORT.md)
- [Script de traduccion en Python](https://github.com/AmerAlreyahi/OptimaMT/blob/main/scripts/translate.py)
- [Resultados interactivos (Space)](https://huggingface.co/spaces/OptimaMT/results)
- [OpenCircle, aplicacion que usa estos modelos](https://github.com/AmerAlreyahi/OpenCircle)
