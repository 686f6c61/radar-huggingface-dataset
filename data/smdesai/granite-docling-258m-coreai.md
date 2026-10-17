# smdesai/granite-docling-258M-coreai

## Resumen

`smdesai/granite-docling-258M-coreai` es un port del modelo de visión-lenguaje IBM `granite-docling-258M` al runtime Core AI de Apple, orientado a la conversión de documentos en dispositivo (on-device) sobre iPhone y Mac. El autor, `smdesai`, no entrena un modelo nuevo: reempaqueta los pesos del modelo base y los exporta con `coreai-torch 0.4.3` (torch 2.13) y `coreai-build 3605.6.3`, de modo que el decodificador se ejecuta en el Neural Engine de Apple y la torre de visión junto con la proyección de vocabulario se ejecutan en la GPU.

El modelo recibe la imagen de una página de documento y genera DocTags: texto plano, cajas de maquetación, tablas, fórmulas, bloques de código y listas, todo localmente y sin conexión. La arquitectura subyacente es un VLM con un codificador de visión SigLIP2 más conector y un decodificador transformer de 30 capas, con un total de unos 258 millones de parámetros, dimensión oculta de 576 y vocabulario de 100.352 tokens.

Su relevancia actual radica en que demuestra una ruta práctica para llevar OCR y análisis de estructura documental a hardware móvil: en un iPhone 17 Pro procesa una página completa de arXiv (1.759 tokens) a 117 tokens/s con aproximadamente 400 MB de memoria. Los artefactos compilados están validados únicamente para el chip A19 Pro (`h18p`); para otras arquitecturas el usuario debe recompilar las fuentes portables incluidas en el repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLM: decodificador transformer de 30 capas + torre de vision SigLIP2 con conector; exportado a Core AI |
| Parametros totales | 258M (segun nomenclatura del modelo base) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 4096 tokens (buckets de 1024, 2048, 3072 y 4096) |
| Tipos de cuantizacion | fp16 (float16) |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | `.aimodelc` (compilado), `.aimodel` (fuente portable), `.bin` fp16 (tabla de embeddings), `tokenizer.json` |

Datos adicionales de interes: dimension oculta de 576, vocabulario de 100.352 tokens y cache KV de `[30, 1, 192, 1, ctx]` fp16. Tamano del repositorio: 1,2 GB.

## Arquitectura y entrenamiento

El modelo es un VLM compuesto por dos subsistemas exportados de forma independiente. Por un lado, una torre de visión SigLIP2 con conector que recibe tiles de imagen de `[1, 3, 512, 512]` en fp16 y produce `[1, 64, 576]` embeddings por tile. Por otro, un decodificador de 30 capas con dimension oculta de 576 que trabaja sobre `transformer_input` de `[1, q, 1, 576]` y mantiene las caches `key_cache` y `value_cache` como estado de runtime. Una tercera red (`head`) aplica la normalizacion final y la proyeccion de vocabulario, generando logits de `[1, 1, 100352]`. Las funciones del decodificador se exponen por buckets de contexto (`extend_{ctx}_{q}`, con ctx en {1024, 2048, 3072, 4096} y q en {8, 64}).

La innovacion tecnica principal no esta en el entrenamiento, sino en el despliegue: la particion del grafo entre Neural Engine (decodificador) y GPU (vision y proyeccion), el uso de buckets de contexto para acelerar la decodificacion y un esquema de prompt con tokens de imagen por tile y una vista global de la pagina. No hay informacion disponible en el material proporcionado sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF o DPO; estos detalles corresponden al modelo base `ibm-granite/granite-docling-258M` y no se detallan aqui.

## Capacidades

- Conversion de imagenes de documentos a DocTags: texto, cajas de maquetacion, tablas, formulas, codigo y listas.
- OCR integrado: extraccion de texto a partir de la imagen de una pagina.
- Comprension de maquetacion (layout) y reconstruccion de la estructura del documento.
- Reconocimiento de formulas matematicas en el flujo de docling.
- Conversion de tablas a representaciones estructuradas.
- Procesamiento de documentos largos mediante tileo de la pagina (tiles de 512x512 mas una vista global).
- Ejecucion totalmente en dispositivo, sin conexion a red, en el runtime Core AI (iOS 27 / macOS 27).
- Decodificacion greedy determinista: la salida es identica entre ejecuciones repetidas segun el autor.
- No se documentan en la informacion disponible capacidades de tool calling, function calling, agentes, razonamiento multi-paso, audio ni otros idiomas distintos del ingles.

## Casos de uso

- Escaneo de documentos en movil: una aplicacion iOS puede capturar una foto de una pagina y obtener texto y estructura en DocTags directamente en el dispositivo, sin enviar el documento a un servidor, lo que es adecuado para documentos sensibles.
- Digitalizacion de articulos cientificos: el modelo esta probado con una pagina completa de arXiv (1.759 tokens), por lo que encaja en flujos de conversion de papers con texto y formulas.
- Extraccion de tablas: en una pagina de tabla (400 tokens) decodifica a 130 tok/s, lo que permite integrar la conversion de tablas en pipelines de captura de datos.
- Aplicaciones de accesibilidad: convertir paginas impresas o fotografias en texto estructurado legible por lectores de pantalla, aprovechando la ejecucion offline.
- Archivado y digitalizacion en oficina: procesar lotes de documentos en un Mac con Core AI para generar repositorios de DocTags indexables.
- Procesamiento offline en entornos sin conectividad: al ejecutarse en el Neural Engine y no requerir red, es util en campo, sanidad o entornos aislados.
- Preprocesado de datos para RAG: convertir documentos a DocTags como paso previo a la indexacion y recuperacion de informacion, manteniendo la estructura de tablas y formulas.
- Integracion en apps de toma de notas: captura de apuntes escritos a mano o impresos con salida estructurada inmediata a 100+ tokens/s.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. Los unicos datos de rendimiento publicados son de velocidad y memoria en dispositivo:

| Dispositivo | Pagina | Decodificacion | Memoria |
|---|---|---|---|
| iPhone 17 Pro | pagina completa de arXiv, 1.759 tokens | 117 tok/s | ~400 MB |
| iPhone 17 Pro | pagina de tabla, 400 tokens | 130 tok/s | ~400 MB |

En cuanto a exactitud, el autor indica que sobre la pagina de ejemplo de arXiv el texto y las formulas generados coinciden con una ejecucion FP32 del modelo base, con unas pocas coordenadas de maquetacion que difieren en una unidad (empates cercanos en FP16), y que la salida es identica entre ejecuciones repetidas.

## Requisitos de hardware

- Diseno objetivo: Apple Neural Engine (decodificador) mas GPU (vision y cabeza) bajo el runtime Core AI (iOS 27 / macOS 27).
- Memoria en ejecucion: aproximadamente 400 MB en iPhone 17 Pro, segun el autor.
- Compatibilidad de artefactos: los ficheros `.aimodelc` incluidos estan compilados y validados unicamente para A19 Pro (`h18p`) y probados en iPhone 17 Pro. Para cualquier otro chip es necesario recompilar las fuentes portables.
- Recompilacion: `xcrun coreai-build compile source/{decoder,vision,head}.aimodel ...` con la arquitectura destino; solo la build h18p ha sido validada.
- Carga directa de fuentes: es posible cargar los `.aimodel` en el telefono, pero la especializacion tarda minutos, por lo que se recomienda distribuir los assets compilados.
- No se proporcionan datos de VRAM para GPU de escritorio (A100, H100, RTX 4090), ni opciones de despliegue en vLLM, llama.cpp, Ollama o TGI, ya que el formato de pesos no es compatible con esos runners.
- Throughput conocido: 117-130 tok/s de decodificacion en iPhone 17 Pro (no disponible para otros dispositivos).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Runtime objetivo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| smdesai/granite-docling-258M-coreai | 258M | 4096 | Core AI (Apple ANE/GPU) | Apache 2.0 | HuggingFace (repo del autor) |
| ibm-granite/granite-docling-258M | 258M | no disponible | Frameworks estandar (transformers) | Apache 2.0 | HuggingFace (IBM) |
| Otros modelos de conversion de documentos | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparacion directa mas relevante es con el modelo base `ibm-granite/granite-docling-258M`, del que este repositorio es una exportacion al runtime Core AI: comparten licencia Apache 2.0 e idioma (ingles), pero difieren en formato de pesos y en plataforma de ejecucion. No se dispone de datos de benchmarks comparativos frente a otras alternativas de conversion de documentos en la informacion proporcionada.

## Limitaciones y advertencias

- Idioma: solo se declara soporte para ingles (en); el rendimiento en otros idiomas no esta documentado.
- Sesgos: no se documentan sesgos especificos en la informacion disponible, pero al derivar de un modelo entrenado con datos no especificados, pueden heredarse sesgos del modelo base.
- Alucinacion: no se cuantifica el riesgo de alucinacion; en tareas de OCR y conversion de documentos, los errores pueden manifestarse como texto o coordenadas incorrectas no detectables a simple vista.
- Bucle de decodificacion: el autor advierte que la decodificacion greedy puede entrar en bucle en algunas paginas; recomienda detener la generacion cuando se repite un ciclo corto de tokens.
- Compatibilidad de hardware: los `.aimodelc` incluidos solo funcionan en A19 Pro (`h18p`); en otros chips hay que recompilar y esa ruta no esta validada.
- Formato no portable: al estar exportado a Core AI, el modelo no se puede ejecutar directamente en vLLM, llama.cpp, Ollama, TGI ni en GPU de escritorio.
- Gestion de memoria: el autor advierte que las salidas asignadas en runtime y no liberadas a tiempo aumentan el consumo de memoria en el telefono; es necesario reutilizar buffers.
- Precaucion de seguridad del contenido: el README del repositorio incluye codigo y comandos de shell; se ha tratado unicamente como material de referencia y no como instrucciones.
- Licencia: Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base `ibm-granite/granite-docling-258M` antes de desplegarlo en produccion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/smdesai/granite-docling-258M-coreai
- Modelo base en HuggingFace: https://huggingface.co/ibm-granite/granite-docling-258M
