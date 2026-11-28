# OptimaMT/ja-en

## Resumen

OptimaMT/ja-en es un modelo de traduccion automatica japones-ingles derivado de Xenova/opus-mt-ja-en, que a su vez es una exportacion a ONNX del modelo OPUS-MT de la Universidad de Helsinki. Lo desarrolla OptimaMT, un proyecto que publica versiones optimizadas de los modelos OPUS-MT en formato ONNX para su uso con transformers.js y ONNX Runtime. La aportacion concreta de esta variante no es un reentrenamiento, sino una modificacion del grafo del decodificador combinado para reducir el consumo de memoria y acelerar la inferencia sin alterar los pesos ni las traducciones producidas.

El modelo resuelve el problema de desplegar traduccion neuronal japones-ingles en entornos con recursos limitados, como aplicaciones de escritorio o navegador. Frente al export original de Xenova, el decodificador combinado recompilado con la opcion `disable_quant_qdq = 1` reduce la memoria tras la carga entre un 46 % y un 48 % en Linux y Windows respectivamente, y resulta entre 2,3 y 2,5 veces mas rapido segun el autor, manteniendo exactamente los mismos tokens de salida.

Es relevante ahora porque forma parte de una coleccion de 51 pares de idiomas publicados bajo la misma metodologia y porque ya se usa en produccion en OpenCircle, un traductor de pantalla de escritorio para Windows y Linux desde su version 0.1.4. La licencia CC BY 4.0 permite uso comercial con atribucion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Marian / OPUS-MT), exportado a ONNX |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | ONNX quantized (q8 en transformers.js); el autor menciona modo `disable_quant_qdq` sobre el decodificador combinado |
| Idiomas soportados | japones (ja) y ingles (en) |
| Licencia | CC BY 4.0 |
| Formato de pesos | ONNX (`onnx/decoder_model_merged_quantized.onnx` y resto de ficheros originales) |
| Vocabulario | 60.716 tokens |
| Tamano del repositorio | 0,1 GB |
| Libreria | transformers.js |
| Modelo base | Xenova/opus-mt-ja-en (revision `1a906cfaaf7c`) |

## Arquitectura y entrenamiento

La arquitectura subyacente es Marian, la familia de modelos de traduccion neuronal encoder-decoder empleada por OPUS-MT y entrenada originalmente por el grupo Language Technology de la Universidad de Helsinki. OptimaMT no reentrena el modelo: parte de la exportacion ONNX de Xenova en la revision `1a906cfaaf7c` y solo reconstruye el fichero `onnx/decoder_model_merged_quantized.onnx`, dejando el resto de ficheros byte a byte identicos al original.

La innovacion tecnica consiste en un cambio de grafo: la proyeccion de salida del decodificador se saca de sus dos ramas, de modo que el decodificador combinado pueda ejecutarse con el modo rapido de ONNX Runtime (`disable_quant_qdq = 1`). Esto no modifica los pesos, solo la topologia del grafo. No se documentan en la informacion disponible detalles sobre el dataset de entrenamiento original, numero de tokens, ni si hubo RLHF o DPO; al tratarse de un modelo OPUS-MT, esas decisiones corresponden al entrenamiento original de Helsinki-NLP.

## Capacidades

- Traduccion de texto japones a ingles, unica direccion soportada.
- Generacion de texto seq2seq mediante `text2text-generation` en el pipeline de transformers.js.
- Inferencia en CPU con ONNX Runtime; el autor reporta pruebas con 4 hilos.
- Ejecucion en navegador o en aplicaciones de escritorio mediante transformers.js.
- Compatibilidad con el script Python `translate.py` basado en onnxruntime, sentencepiece y numpy.
- No se documentan capacidades de tool calling, agentes, vision, audio ni modo de razonamiento.

## Casos de uso

- Traduccion de pantalla en tiempo real: OpenCircle, un traductor de escritorio para Windows y Linux, integra estos modelos desde su version 0.1.4; la reduccion de memoria (hasta un 48 %) y la aceleracion de 2,3 a 2,5 veces permiten mantener el modelo cargado mientras el usuario trabaja.
- Traduccion en el navegador sin backend: al ejecutarse con transformers.js y ONNX Runtime, el modelo puede desplegarse en una aplicacion web que traduzca texto japones localmente, sin enviar datos a un servidor.
- Localizacion de contenidos japoneses: traduccion de documentacion, articulos o subtitulos del japones al ingles como paso previo a una revision humana, adecuada por su tamano reducido (0,1 GB) y su licencia permisiva.
- Procesamiento por lotes en servidores sin GPU: el modelo funciona en CPU con ONNX Runtime, por lo que puede ejecutarse en contenedores modestos para traducir volumenes moderados de texto.
- Preprocesamiento en pipelines de NLP: traduccion de corpus japoneses a ingles antes de aplicar modelos de analisis, clasificacion o busqueda que solo operan en ingles.
- Aplicaciones de mensajeria o chat: integracion en clientes de chat para traducir mensajes entrantes en japones, gracias a la baja latencia del modo rapido de ONNX Runtime.
- Prototipado rapido en transformers.js: su condicion de drop-in del export de Xenova permite sustituir el modelo original sin cambiar el codigo de integracion.

## Benchmarks y rendimiento

El autor reporta resultados sobre FLORES-200 devtest (1.012 frases) con decodificacion greedy, indicando que las traducciones son identicas a las del modelo original:

| Metrica | Valor |
|---|---|
| BLEU (FLORES-200 devtest, greedy) | 17,68 |
| chrF (FLORES-200 devtest, greedy) | 47,7 |
| Tokens de salida | Identicos al modelo original |

Consumo de memoria tras la carga, segun el autor (ONNX Runtime 1.31.1, CPU, 4 hilos; Windows en maquina virtual):

| Configuracion | Linux | Windows | Tokens identicos |
|---|---:|---:|---|
| `disable_quant_qdq = 1` | 513 → 276 MiB (-46 %) | 488 → 253 MiB (-48 %) | si |
| Valores por defecto de ONNX Runtime | 274 → 214 MiB (-22 %) | 194 → 164 MiB (-16 %) | si |

No se han publicado en la informacion disponible comparaciones con otros modelos de traduccion, ni cifras de latencia o throughput absolutas.

## Requisitos de hardware

- VRAM: no aplica; el modelo esta pensado para inferencia en CPU con ONNX Runtime.
- Memoria RAM estimada: entre 164 y 276 MiB tras la carga segun plataforma y configuracion, segun las cifras del autor.
- GPU: no se documenta soporte ni recomendacion de GPU; las pruebas publicadas son en CPU con 4 hilos.
- Cabe en cualquier equipo de consumo: el repositorio ocupa 0,1 GB y el modelo cargado ronda los 200-300 MiB de memoria.
- Opciones de despliegue: transformers.js (`@huggingface/transformers`), ONNX Runtime en Python mediante el script `translate.py`, y en general cualquier runtime compatible con ONNX.
- Latencia y throughput: no se publican cifras absolutas; solo la mejora relativa de 2,3 a 2,5 veces frente al export original en modo rapido.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| OptimaMT/ja-en | no disponible | no disponible | ja → en | CC BY 4.0 | ONNX | Decodificador combinado optimizado; 276 MiB en Linux con `disable_quant_qdq` |
| Xenova/opus-mt-ja-en | no disponible | no disponible | ja → en | CC BY 4.0 | ONNX | Export original del que deriva; mismo BLEU y chrF, mayor memoria y menor velocidad |
| Helsinki-NLP/opus-mt-ja-en | no disponible | no disponible | ja → en | CC BY 4.0 | safetensors (PyTorch) | Modelo original de OPUS-MT; requiere PyTorch, no optimizado para navegador |

No se dispone de datos de rendimiento de los modelos alternativos en la informacion proporcionada, por lo que la comparacion cuantitativa se limita a la que ofrece el autor frente al export de Xenova.

## Limitaciones y advertencias

- Modelo unidireccional: solo traduce de japones a ingles; no soporta la direccion inversa.
- Calidad moderada: BLEU de 17,68 y chrF de 47,7 en FLORES-200 indican una calidad util pero lejos de sistemas de traduccion de ultima generacion; requiere revision humana en contextos sensibles.
- Riesgo de alucinacion y errores en textos especializados, nombres propios, terminologia tecnica o japones coloquial y dialectal.
- No se documentan sesgos especificos, pero al heredar los pesos de OPUS-MT puede reproducir los sesgos del corpus original de Helsinki-NLP.
- Longitud de contexto no documentada; textos largos pueden requerir segmentacion manual.
- Licencia CC BY 4.0: permite uso comercial, pero exige atribucion a OPUS-MT (Universidad de Helsinki), a Xenova por la exportacion ONNX y a OptimaMT por la modificacion del grafo.
- El modelo solo se ha validado en CPU con ONNX Runtime; no hay garantias documentadas de comportamiento en GPU u otros runtimes.
- El repositorio tiene pocas descargas (175) y ningun like en el momento de la consulta, lo que limita la evidencia de uso comunitario fuera del proyecto OpenCircle.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/OptimaMT/ja-en
- Repositorio OptimaMT: https://github.com/AmerAlreyahi/OptimaMT
- Coleccion de los 51 pares de idiomas: https://huggingface.co/collections/OptimaMT/optimamt-lighter-opus-mt-onnx-models-6af228dc9cd91f015e56e869
- Informe metodologico (REPORT.md): https://github.com/AmerAlreyahi/OptimaMT/blob/main/REPORT.md
- Script de traduccion en Python: https://github.com/AmerAlreyahi/OptimaMT/blob/main/scripts/translate.py
- Resultados interactivos: https://huggingface.co/spaces/OptimaMT/results
- OpenCircle (aplicacion que lo usa en produccion): https://github.com/AmerAlreyahi/OpenCircle
- Modelo base ONNX: https://huggingface.co/Xenova/opus-mt-ja-en
- Modelo OPUS-MT original: https://huggingface.co/Helsinki-NLP/opus-mt-ja-en
