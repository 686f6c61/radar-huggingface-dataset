# OptimaMT/es-fr

## Resumen

OptimaMT/es-fr es un modelo de traduccion automatica espanol-frances publicado por OptimaMT, un proyecto que redistribuye los modelos OPUS-MT de la Universidad de Helsinki en formato ONNX optimizado. Concretamente, es una copia directa de Xenova/opus-mt-es-fr (revision `3bef5f612825`) en la que unicamente se ha reconstruido el decoder fusionado en ONNX para aplicar el modo rapido de ONNX Runtime (`disable_quant_qdq = 1`), lo que reduce el consumo de memoria a la mitad y acelera la inferencia entre 2,3 y 2,5 veces sin alterar los tokens generados.

El modelo mantiene la arquitectura Marian original de OPUS-MT, con un vocabulario de 74.822 tokens y licencia CC BY 4.0. Su relevancia practica esta en el despliegue: al ser un modelo pequeno (repo de 0,1 GB) y estar empaquetado para transformers.js y ONNX Runtime, puede ejecutarse en CPU y en navegador, lo que lo hace adecuado para aplicaciones de traduccion en tiempo real, extensiones o herramientas de escritorio como OpenCircle, que ya lo integra en produccion desde su version v0.1.4.

No se trata de un modelo entrenado desde cero ni de una variante con mejor calidad de traduccion: la calidad es identica a la del OPUS-MT original. Su valor es exclusivamente de eficiencia de inferencia y de empaquetado para entornos ligeros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Marian, OPUS-MT) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | ONNX cuantizado (q8) para transformers.js; modo rapido de ONNX Runtime con `disable_quant_qdq = 1` |
| Idiomas soportados | es (espanol), fr (frances) |
| Licencia | CC BY 4.0 |
| Formato de pesos | ONNX (`onnx/decoder_model_merged_quantized.onnx` reconstruido; resto de ficheros identicos al original) |

## Arquitectura y entrenamiento

El modelo es un transformer encoder-decoder de tipo Marian, la familia utilizada por OPUS-MT, desarrollada por el grupo Language Technology de la Universidad de Helsinki. El entrenamiento original corresponde a Helsinki-NLP/opus-mt-es-fr y no ha sido modificado por OptimaMT: los pesos son los mismos y el vocabulario se mantiene en 74.822 tokens. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del corpus ni si se aplicaron tecnicas de RLHF o DPO en el modelo original.

La unica innovacion tecnica introducida por OptimaMT es de caracter de despliegue: la proyeccion de salida del decoder se ha sacado de sus dos ramas (cambio exclusivamente en el grafo) y se ha reconstruido el decoder fusionado en ONNX para aprovechar el modo rapido de ONNX Runtime. Segun la model card, esto produce entre un 48 % y un 50 % menos de memoria tras la carga en Linux y Windows respectivamente con `disable_quant_qdq = 1`, y entre un 15 % y un 17 % con los valores por defecto de ONNX Runtime, manteniendo tokens identicos a los del modelo base.

## Capacidades

- Traduccion de texto espanol a frances, unica tarea del modelo (pipeline `translation`).
- Generacion de tokens identica a la del modelo base Xenova/opus-mt-es-fr, verificado por el autor.
- Ejecucion en navegador y en Node.js mediante transformers.js con `dtype: "q8"`.
- Ejecucion en Python con onnxruntime, sentencepiece y numpy mediante el script `translate.py` del repositorio.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No soporta vision, audio ni modo thinking.
- Cobertura multilingue limitada exclusivamente al par es-fr.

## Casos de uso

- Traduccion en el navegador: al estar empaquetado para transformers.js con ONNX cuantizado, puede integrarse en una web o extension sin backend, traduciendo texto en el cliente y evitando enviar contenido a servidores externos.
- Traduccion de pantalla en tiempo real: es el caso de OpenCircle, una herramienta de escritorio para Windows y Linux que traduce texto en pantalla; el bajo consumo de memoria (318 MiB en Linux con el modo rapido) permite mantenerlo cargado junto a otras aplicaciones.
- Traduccion de documentacion tecnica es-fr: con BLEU 24,74 y chrF 55,42 en FLORES-200 devtest, es adecuado para traduccion de contenido informativo donde se tolere revision humana posterior.
- Preprocesado en pipelines de datos: util para normalizar o traducir grandes volumenes de texto espanol a frances en CPU, sin necesidad de GPU, gracias al bajo coste de memoria y a la velocidad mejorada.
- Aplicaciones de escritorio sin conexion: el modelo cabe en el repositorio de 0,1 GB y puede distribuirse junto a la aplicacion para funcionar offline.
- Prototipado rapido de funcionalidades de traduccion: la API de transformers.js permite tener un traductor funcional en pocas lineas de codigo, util para validar producto antes de invertir en modelos mayores.
- Traduccion de subtitulos o chat en vivo: la latencia reducida por el modo rapido de ONNX Runtime lo hace viable para flujos interactivos de frase corta.

## Benchmarks y rendimiento

| Benchmark | Resultado |
|---|---|
| FLORES-200 devtest (1.012 frases), BLEU | 24,74 |
| FLORES-200 devtest (1.012 frases), chrF | 55,42 |
| Memoria tras carga, Linux (`disable_quant_qdq = 1`) | 610 → 318 MiB (-48 %) |
| Memoria tras carga, Windows (`disable_quant_qdq = 1`) | 586 → 295 MiB (-50 %) |
| Memoria tras carga, Linux (defaults ONNX Runtime) | 244 → 208 MiB (-15 %) |
| Memoria tras carga, Windows (defaults ONNX Runtime) | 222 → 185 MiB (-17 %) |
| Velocidad | 2,3–2,5× mas rapido que el original (modo rapido) |

Mediciones realizadas con ONNX Runtime 1.31.1, CPU, 4 hilos (Linux; Windows en una maquina virtual). No se han publicado comparaciones con otros modelos de traduccion en la informacion disponible.

## Requisitos de hardware

- VRAM: no aplica; el modelo esta pensado para CPU. En GPU puede ejecutarse, pero no se han publicado mediciones.
- Memoria RAM estimada: entre 185 y 318 MiB tras la carga, segun sistema operativo y configuracion de ONNX Runtime.
- GPU recomendadas: no disponible; el modelo no requiere GPU.
- Cabe en cualquier GPU de consumo e incluso en entornos sin GPU (navegador, CPU de escritorio, Raspberry Pi no verificado).
- Opciones de despliegue: transformers.js (JavaScript/TypeScript), ONNX Runtime en Python mediante `translate.py`, y cualquier runtime compatible con ONNX.
- Latencia y throughput: no se han publicado valores absolutos de latencia o tokens por segundo; solo la mejora relativa de 2,3–2,5× respecto al modelo original.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Calidad | Licencia | Formato |
|---|---|---|---|---|---|
| OptimaMT/es-fr | no disponible | no disponible | BLEU 24,74 / chrF 55,42 (FLORES-200) | CC BY 4.0 | ONNX cuantizado |
| Xenova/opus-mt-es-fr | no disponible | no disponible | Identica (mismos pesos) | CC BY 4.0 | ONNX |
| Helsinki-NLP/opus-mt-es-fr | no disponible | no disponible | Identica (modelo base) | CC BY 4.0 | PyTorch (safetensors/bin) |

La diferencia entre las tres variantes es exclusivamente de empaquetado y eficiencia: OptimaMT ofrece el menor consumo de memoria y la mayor velocidad en ONNX Runtime, Xenova ofrece el export ONNX original y Helsinki-NLP el modelo PyTorch de referencia. No se dispone de comparaciones con modelos de traduccion de mayor tamano (NLLB, M2M-100, Seamless) en la informacion proporcionada.

## Limitaciones y advertencias

- Solo traduce espanol a frances; no soporta otras direcciones ni otros pares idiomaticos.
- La calidad de traduccion es la del OPUS-MT original; no hay mejora respecto al modelo base.
- Riesgo de alucinacion y de traducciones literales en frases idiomaticas, terminologia especializada o texto con ruido, comun en modelos de traduccion de este tamano.
- No se dispone de informacion sobre sesgos especificos del modelo; al heredar el corpus OPUS, puede reflejar sesgos presentes en datos paralelos de dominio publico.
- Longitud de contexto no documentada; no se recomienda para documentos largos sin segmentacion previa.
- Licencia CC BY 4.0: permite uso comercial con atribucion. Es necesario citar a OPUS-MT (Universidad de Helsinki), a Xenova por el export ONNX y a OptimaMT por la modificacion del decoder.
- El modelo no incluye salvaguardas ni filtros de contenido; la validacion de la salida es responsabilidad del integrador.
- La configuracion `disable_quant_qdq = 1` debe pasarse explicitamente en las opciones de sesion; sin ella se aplican los valores por defecto de ONNX Runtime y se pierde parte de la mejora de memoria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/OptimaMT/es-fr
- Modelo base ONNX: https://huggingface.co/Xenova/opus-mt-es-fr
- Modelo original OPUS-MT: https://huggingface.co/Helsinki-NLP/opus-mt-es-fr
- Repositorio OptimaMT: https://github.com/AmerAlreyahi/OptimaMT
- Informe tecnico: https://github.com/AmerAlreyahi/OptimaMT/blob/main/REPORT.md
- Script de traduccion en Python: https://github.com/AmerAlreyahi/OptimaMT/blob/main/scripts/translate.py
- Resultados interactivos: https://huggingface.co/spaces/OptimaMT/results
- Coleccion de los 51 pares: https://huggingface.co/collections/OptimaMT/optimamt-lighter-opus-mt-onnx-models-6af228dc9cd91f015e56e869
- OpenCircle (herramienta que lo integra): https://github.com/AmerAlreyahi/OpenCircle
