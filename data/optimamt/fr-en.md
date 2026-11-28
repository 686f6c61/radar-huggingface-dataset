# OptimaMT/fr-en

## Resumen

OptimaMT/fr-en es un modelo de traduccion automatica frances-ingles publicado por OptimaMT. No se trata de un modelo entrenado desde cero, sino de una reexportacion optimizada del modelo Marian de OPUS-MT (Universidad de Helsinki) en formato ONNX, partiendo de la conversion previa de Xenova. La modificacion consiste en reconstruir unicamente el decoder fusionado (`decoder_model_merged_quantized.onnx`) para aprovechar el modo rapido de ONNX Runtime mediante la opcion `disable_quant_qdq = 1`, manteniendo el resto de archivos byte a byte identicos al original.

El modelo resuelve traduccion de texto fr a en con una ventana de vocabulario de 59.514 tokens y pesos cuantizados en 8 bits. Su relevancia actual radica en que reduce el consumo de memoria entre un 46 % y un 48 % en Linux y Windows respectivamente, y acelera la inferencia entre 2,3 y 2,5 veces, produciendo exactamente los mismos tokens que el modelo de referencia. Esto lo hace atractivo para aplicaciones de traduccion en local, incluido el traductor de pantalla de escritorio OpenCircle, que lo distribuye desde su version 0.1.4.

La arquitectura subyacente es un transformer encoder-decoder de tipo Marian, propio de la familia OPUS-MT. El modelo se distribuye bajo licencia CC BY 4.0 y esta pensado para ejecutarse con transformers.js u ONNX Runtime en CPU, sin necesidad de GPU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Marian, familia OPUS-MT) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | ONNX cuantizado en 8 bits (q8); decoder fusionado reconstruido |
| Idiomas soportados | frances (fr), ingles (en) |
| Licencia | CC BY 4.0 |
| Formato de pesos | ONNX (transformers.js); tamano del repo 0,1 GB |

## Arquitectura y entrenamiento

El modelo es un Marian seq2seq transformer, la arquitectura estandar de la familia OPUS-MT desarrollada por la Universidad de Helsinki. Consta de un encoder y un decoder con atencion cruzada, y utiliza SentencePiece para la tokenizacion con un vocabulario de 59.514 tokens. No se dispone de informacion sobre el numero de parametros totales ni sobre la composicion exacta del dataset de entrenamiento original en la informacion proporcionada.

La innovacion tecnica de esta ficha no reside en el entrenamiento, sino en la optimizacion de la exportacion ONNX. El decoder fusionado se reconstruye moviendo la proyeccion de salida fuera de sus dos ramas (cambio solo de grafo, sin alterar pesos) y activando el modo rapido de ONNX Runtime mediante `disable_quant_qdq = 1`. El resto de archivos del repositorio son identicos al export original de Xenova en la revision `6b166a182780`. No se documentan fases de RLHF, DPO ni fine-tuning adicional sobre los pesos de OPUS-MT.

## Capacidades

- Traduccion de texto frances a ingles, unica tarea del pipeline (`translation`).
- Generacion determinista con decodificacion greedy; produce los mismos tokens que el modelo de referencia.
- Ejecucion en navegador y Node.js mediante transformers.js, y en Python mediante onnxruntime, sentencepiece y numpy.
- Inferencia en CPU sin GPU, con consumo de memoria reducido tras la carga.
- No soporta tool calling, function calling ni razonamiento multi-paso.
- No dispone de modo thinking, vision ni audio.
- Capacidad multilingue limitada estrictamente al par fr-en.

## Casos de uso

- Traduccion de pantalla en escritorio: integrado en OpenCircle para Windows y Linux, traduce texto en tiempo real con un consumo de memoria de 272 MiB en Linux y 249 MiB en Windows, lo que permite mantenerlo residente en segundo plano.
- Traduccion local en navegador: mediante transformers.js con `dtype: "q8"`, se puede ofrecer traduccion fr-en sin enviar texto a un servidor, util para aplicaciones web con requisitos de privacidad.
- Preprocesado de corpus: traduccion por lotes de documentacion o articulos franceses a ingles dentro de pipelines de NLP, aprovechando la velocidad de ONNX Runtime en CPU.
- Traduccion en dispositivos de recursos limitados: el bajo consumo de memoria tras la carga (212 MiB con la configuracion por defecto en Linux) permite desplegarlo en equipos sin GPU dedicada.
- Subtitulado y transcripcion: traduccion de subtitulos fr a en en herramientas de accesibilidad que ya operan en local.
- Prototipado rapido de sistemas de traduccion: al ser un drop-in replacement del modelo de Xenova, permite sustituirlo sin cambios en el codigo y con la misma salida, reduciendo costes de memoria y latencia.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| FLORES-200 devtest (1.012 frases) | BLEU 41,43 · chrF 66,62 (greedy) |
| Memoria tras carga, Linux (`disable_quant_qdq = 1`) | 505 → 272 MiB (-46 %) |
| Memoria tras carga, Windows (`disable_quant_qdq = 1`) | 481 → 249 MiB (-48 %) |
| Memoria tras carga, Linux (defaults ONNX Runtime) | 270 → 212 MiB (-22 %) |
| Memoria tras carga, Windows (defaults ONNX Runtime) | 192 → 162 MiB (-16 %) |
| Velocidad | 2,3–2,5× mas rapido que el original (modo rapido) |
| Equivalencia de salida | Tokens identicos al modelo original |

Mediciones realizadas con ONNX Runtime 1.31.1 en CPU con 4 hilos (Linux; Windows en maquina virtual).

## Requisitos de hardware

- VRAM: no aplica; el modelo esta disenado para inferencia en CPU.
- Memoria RAM estimada tras carga: 272 MiB en Linux y 249 MiB en Windows con `disable_quant_qdq = 1`; 212 MiB y 162 MiB con los valores por defecto de ONNX Runtime.
- GPU: no requerida ni documentada; el modelo se ejecuta en CPU.
- Cabe en cualquier equipo de consumo: el repo ocupa 0,1 GB y la memoria en ejecucion es inferior a 300 MiB.
- Despliegue: transformers.js (`@huggingface/transformers`) y ONNX Runtime en Python (script `translate.py` con onnxruntime, sentencepiece y numpy).
- Latencia y throughput: no se publican cifras absolutas; solo la mejora relativa de 2,3–2,5× frente al modelo original.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| OptimaMT/fr-en | no disponible | no disponible | fr, en | CC BY 4.0 | ONNX (q8) | Decoder fusionado optimizado; 2,3–2,5× mas rapido y ~46–48 % menos memoria |
| Xenova/opus-mt-fr-en | no disponible | no disponible | fr, en | CC BY 4.0 | ONNX | Modelo base de la conversion; misma salida, mas memoria y latencia |
| Helsinki-NLP/opus-mt-fr-en | no disponible | no disponible | fr, en | CC BY 4.0 | safetensors/PyTorch | Pesos originales de OPUS-MT; requiere framework PyTorch |

## Limitaciones y advertencias

- Solo traduce frances a ingles; no es un modelo generalista ni bidireccional.
- No se documentan sesgos especificos, pero al heredar los pesos de OPUS-MT puede reproducir sesgos presentes en los corpus de traduccion originales.
- Riesgo de alucinacion y de traducciones literales en dominios especializados (terminologia tecnica, juridica o medica) no cubiertos por el entrenamiento original.
- La longitud de contexto no esta documentada; frases muy largas pueden truncarse o degradar la calidad.
- La licencia CC BY 4.0 permite uso comercial con atribucion; es obligatorio citar a OPUS-MT (Universidad de Helsinki), la exportacion de Xenova y la modificacion de OptimaMT.
- La optimizacion depende de la opcion `disable_quant_qdq` de ONNX Runtime; sin ella, las ganancias de memoria se reducen al 16–22 %.
- El modelo esta pensado para CPU; no se documenta soporte GPU ni aceleracion por hardware.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/OptimaMT/fr-en
- Repositorio OptimaMT: https://github.com/AmerAlreyahi/OptimaMT
- Coleccion de los 51 pares: https://huggingface.co/collections/OptimaMT/optimamt-lighter-opus-mt-onnx-models-6af228dc9cd91f015e56e869
- Informe metodologico (REPORT.md): https://github.com/AmerAlreyahi/OptimaMT/blob/main/REPORT.md
- Script de traduccion en Python: https://github.com/AmerAlreyahi/OptimaMT/blob/main/scripts/translate.py
- Resultados interactivos: https://huggingface.co/spaces/OptimaMT/results
- OpenCircle (traductor de pantalla): https://github.com/AmerAlreyahi/OpenCircle
- Modelo base ONNX: https://huggingface.co/Xenova/opus-mt-fr-en
- Pesos originales OPUS-MT: https://huggingface.co/Helsinki-NLP/opus-mt-fr-en
