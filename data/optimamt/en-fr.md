# OptimaMT/en-fr

## Resumen

OptimaMT/en-fr es un modelo de traduccion automatica ingles-frances publicado por OptimaMT, un proyecto que redistribuye los modelos OPUS-MT de la Universidad de Helsinki en formato ONNX optimizado para transformers.js. El modelo es una copia directa de Xenova/opus-mt-en-fr (revision `28726206f808`) en la que unicamente se ha reconstruido el decoder fusionado cuantizado, aplicando el modo rapido de ONNX Runtime (`disable_quant_qdq = 1`) para reducir el consumo de memoria y acelerar la inferencia.

La arquitectura subyacente es Marian NMT, un transformer encoder-decoder especializado en traduccion, con un vocabulario de 59.514 tokens. El modelo resuelve la traduccion de texto de ingles a frances y esta pensado para su uso en navegador o en aplicaciones de escritorio mediante transformers.js y ONNX Runtime, no para servir como modelo de proposito general.

Su relevancia radica en la reduccion de huella: tras la carga, el modelo pasa de 504 a 272 MiB en Linux (-46 %) y de 481 a 251 MiB en Windows (-48 %) con `disable_quant_qdq = 1`, manteniendo exactamente los mismos tokens de salida que el original. Esto lo hace adecuado para traductores de pantalla en tiempo real y aplicaciones con recursos limitados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Marian NMT (transformer encoder-decoder) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | ONNX cuantizado (q8) con decoder fusionado; modo rapido de ONNX Runtime (`disable_quant_qdq = 1`) |
| Idiomas soportados | en (ingles), fr (frances) |
| Licencia | CC BY 4.0 |
| Formato de pesos | ONNX (`onnx/decoder_model_merged_quantized.onnx` reconstruido; resto de ficheros identicos al original) |

## Arquitectura y entrenamiento

El modelo es un Marian NMT, la arquitectura de traduccion neuronal desarrollada en el marco del proyecto OPUS de la Universidad de Helsinki. Se trata de un transformer encoder-decoder clasico orientado a traduccion automatica, con un vocabulario de 59.514 tokens y pesos originales de Helsinki-NLP/opus-mt-en-fr.

OptimaMT no reentrena ni modifica los pesos: solo altera el grafo ONNX del decoder fusionado, moviendo la proyeccion de salida fuera de sus dos ramas y activando el modo rapido de ONNX Runtime. El resto de ficheros son identicos byte a byte al export de Xenova. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF o DPO en la informacion proporcionada.

## Capacidades

- Traduccion de texto de ingles a frances (direccion unica en-fr).
- Generacion de traduccion por decodificacion greedy, con resultados identicos token a token al modelo original.
- Ejecucion en navegador mediante transformers.js y en Python mediante onnxruntime, sentencepiece y numpy.
- Inferencia en CPU con 4 hilos; no requiere GPU.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No dispone de capacidades de vision, audio ni modo de razonamiento extendido.
- Capacidad multilingue limitada a los dos idiomas del par en-fr.

## Casos de uso

- Traduccion de pantalla en tiempo real: el modelo se integra en OpenCircle, un traductor de escritorio para Windows y Linux que lo distribuye desde la version v0.1.4, aprovechando su baja huella de memoria (251-272 MiB) para ejecutarse en segundo plano sin penalizar al sistema.
- Traduccion en el navegador sin backend: mediante transformers.js con `dtype: "q8"`, permite traducir contenido en cliente sin enviar texto a un servidor, util para privacidad y para reducir costes de infraestructura.
- Traduccion de documentacion tecnica en-fr: adecuado para pipelines por lotes de textos largos en ingles que deban publicarse en frances, con la calidad medida en FLORES-200 (BLEU 46,42, chrF 68,96).
- Preprocesado de datasets multilingues: util para generar versiones francesas de corpus en ingles en tareas de aumento de datos o evaluacion de sistemas de recuperacion de informacion.
- Traduccion de subtitulos y contenido audiovisual: el bajo consumo de memoria permite ejecutarlo junto a otros componentes (reconocimiento de voz, sincronizacion) en maquinas modestas.
- Prototipado de asistentes de traduccion en aplicaciones de escritorio Electron o Tauri: el formato ONNX y la integracion con transformers.js simplifican el empaquetado multiplataforma.
- Traduccion de correos y mensajes en herramientas ofimaticas: el modelo cabe en equipos sin GPU dedicada y responde con latencia interactiva en CPU.

## Benchmarks y rendimiento

| Benchmark | Resultado |
|---|---|
| FLORES-200 devtest (1.012 frases), BLEU (greedy) | 46,42 |
| FLORES-200 devtest (1.012 frases), chrF (greedy) | 68,96 |
| Memoria tras carga, Linux, `disable_quant_qdq = 1` | 504 → 272 MiB (-46 %) |
| Memoria tras carga, Windows, `disable_quant_qdq = 1` | 481 → 251 MiB (-48 %) |
| Memoria tras carga, Linux, valores por defecto de ONNX Runtime | 270 → 212 MiB (-21 %) |
| Memoria tras carga, Windows, valores por defecto de ONNX Runtime | 190 → 163 MiB (-14 %) |
| Aceleracion del modo rapido | 2,3–2,5× |
| Tokens de salida | Identicos al original |

Medido con ONNX Runtime 1.31.1, CPU, 4 hilos (Linux; Windows en maquina virtual). No se han publicado resultados de MMLU, HumanEval ni GSM8K, que no aplican a este modelo.

## Requisitos de hardware

- VRAM: no requiere GPU; la inferencia se ejecuta en CPU.
- Memoria RAM estimada tras la carga: 251-272 MiB con `disable_quant_qdq = 1`; 163-212 MiB con los valores por defecto de ONNX Runtime.
- GPU recomendadas: no aplica; el modelo esta disenado para CPU.
- Cabe en cualquier equipo de consumo, incluidos portatiles modestos y sistemas embebidos con al menos ~300 MiB de RAM libre para el proceso.
- Opciones de despliegue: transformers.js (navegador y Node.js), onnxruntime en Python (con sentencepiece y numpy), ONNX Runtime 1.31.1 o superior.
- Latencia y throughput: no se proporcionan cifras absolutas de latencia o throughput; solo la aceleracion relativa de 2,3-2,5× del modo rapido frente a los valores por defecto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| OptimaMT/en-fr | no disponible | no disponible | en, fr | CC BY 4.0 | ONNX | Decoder fusionado optimizado; 2,3-2,5× mas rapido y ~46-48 % menos memoria que el original |
| Xenova/opus-mt-en-fr | no disponible | no disponible | en, fr | CC BY 4.0 | ONNX | Modelo base del que deriva; mismo rendimiento de traduccion, mayor huella |
| Helsinki-NLP/opus-mt-en-fr | no disponible | no disponible | en, fr | CC BY 4.0 | safetensors/PyTorch | Pesos originales de OPUS-MT; requiere framework de inferencia completo |

No se dispone de datos de benchmarks comparativos con otros sistemas de traduccion en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo de direccion unica: solo traduce de ingles a frances; no soporta el par inverso ni otros idiomas.
- Es una copia optimizada, no un modelo reentrenado: hereda los sesgos y limitaciones de OPUS-MT en dominio y registro.
- Riesgo de alucinacion y errores en textos muy especializados, terminologia tecnica o expresiones idiomaticas; la calidad medida en FLORES-200 no garantiza el mismo rendimiento en dominios concretos.
- No se dispone de informacion sobre la longitud maxima de contexto; textos largos pueden requerir segmentacion manual.
- Licencia CC BY 4.0: permite uso comercial con atribucion a OPUS-MT (Universidad de Helsinki), al export de Xenova y a la modificacion de OptimaMT.
- Los resultados de memoria y velocidad se midieron con ONNX Runtime 1.31.1, CPU y 4 hilos; el rendimiento puede variar en otras configuraciones.
- El modelo esta pensado para transformers.js y ONNX Runtime; no se distribuyen pesos en safetensors ni GGUF en este repositorio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/OptimaMT/en-fr
- Modelo base en Hugging Face: https://huggingface.co/Xenova/opus-mt-en-fr
- Pesos originales OPUS-MT: https://huggingface.co/Helsinki-NLP/opus-mt-en-fr
- Repositorio del proyecto: https://github.com/AmerAlreyahi/OptimaMT
- Coleccion con los 51 pares: https://huggingface.co/collections/OptimaMT/optimamt-lighter-opus-mt-onnx-models-6af228dc9cd91f015e56e869
- Informe metodologico: https://github.com/AmerAlreyahi/OptimaMT/blob/main/REPORT.md
- Resultados interactivos: https://huggingface.co/spaces/OptimaMT/results
- Script de traduccion en Python: https://github.com/AmerAlreyahi/OptimaMT/blob/main/scripts/translate.py
- Aplicacion OpenCircle: https://github.com/AmerAlreyahi/OpenCircle
