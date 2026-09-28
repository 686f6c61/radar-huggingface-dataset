# nchapman/LFM2.5-8B-A1B-ONNX-q4f16-sharded

## Resumen

Este repositorio no contiene un modelo nuevo, sino un reempaquetado del export ONNX en q4f16 de LFM2.5-8B-A1B, publicado originalmente por Liquid AI. El autor, nchapman, ha vuelto a fragmentar los pesos sin modificar un solo byte: los tensores son idénticos al export upstream, verificado mediante SHA-256 sobre los 5.045.284.864 bytes de tensores antes y después del proceso. El único cambio es el empaquetado de los ficheros de datos externos.

El problema que resuelve es concreto y técnico. El export upstream reparte los pesos en tres ficheros de datos externos de 2,15 GB, 2,13 GB y 0,77 GB; los motores de JavaScript (V8) no pueden asignar ArrayBuffers de aproximadamente 2^31 bytes o más, por lo que onnxruntime-web y transformers.js fallan con `RangeError: Array buffer allocation failed` al cargarlos en cualquier navegador. Este re-shard distribuye los mismos tensores en seis fragmentos de como máximo 900 MB, que sí se cargan correctamente.

El modelo subyacente, LFM2.5-8B-A1B, es un Mixture of Experts de Liquid AI con 8.000 millones de parametros totales, 32 expertos y 4 activos por token, ventana de contexto de 128K, razonamiento con cadena de pensamiento y orientacion declarada a tool calling en dispositivo. La relevancia de este repositorio, por tanto, es de despliegue: habilita la inferencia del modelo en el navegador mediante WebGPU o WASM.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE) transformer, 32 expertos, 4 activados por token; base LFM2.5-8B-A1B |
| Parametros totales | 8.000 millones (8B) |
| Parametros activos | Aproximadamente 1B segun la model card del export ONNX de LiquidAI; 1,5B segun la documentacion de Liquid. Existe discrepancia entre ambas fuentes oficiales |
| Longitud de contexto | 128K tokens |
| Tipos de cuantizacion | q4f16 (pesos 4 bits, computo en fp16). No se detallan otras variantes disponibles en este repositorio |
| Idiomas soportados | no disponible |
| Licencia | LFM Open License (segun la informacion de busqueda, corresponde a los pesos de Liquid AI). Este repositorio de re-shard no declara una licencia propia; el autor remite al LICENSE del repositorio upstream |
| Formato de pesos | ONNX con datos externos fragmentados: `model_q4f16.onnx` (grafo) mas seis ficheros `model_q4f16.onnx_data*` de maximo 900 MB |
| Numero de fragmentos | 6 (frente a los 3 del export upstream) |
| Tamano del repositorio | 5,1 GB |
| Bytes de tensores verificados | 5.045.284.864 |
| Integridad de pesos | Byte-identicos al export upstream, verificado por SHA-256 |
| Tokenizador y config | Copias del upstream; `transformers.js_config.use_external_data_format["model_q4f16.onnx"]` ajustado a 6 |
| Compatibilidad | onnxruntime-web, transformers.js, navegadores con WebGPU o WASM |

## Arquitectura y entrenamiento

El modelo base es un Mixture of Experts con 8.000 millones de parametros totales y una fraccion activa por token muy reducida. Segun la model card del export ONNX de LiquidAI, emplea 32 expertos con 4 activados por token y ronda los 1.000 millones de parametros activos; la documentacion de Liquid cifra esa activacion en 1,5B. La informacion disponible no detalla la composicion exacta de capas (atencion, convoluciones o hibridas), el numero de capas ni las dimensiones internas del modelo, por lo que esos datos quedan como no disponibles.

En cuanto al entrenamiento, la informacion de busqueda indica que LFM2.5-8B-A1B se publico el 28 de mayo de 2026 bajo la LFM Open License, como evolucion del LFM2-8B-A1B de octubre de 2025. El cambio principal habria sido la ampliacion de la ventana de contexto hasta 128K y el escalado del preentrenamiento de 12 billones a 38 billones de tokens. No se especifican en la informacion disponible la composicion del dataset, el uso de RLHF o DPO, ni innovaciones de decodificacion.

La innovacion propia de este repositorio es exclusivamente de empaquetado. Los tensores se redistribuyen en seis fragmentos inferiores al limite de asignacion de ArrayBuffer de V8, y se corrige el campo `transformers.js_config.use_external_data_format` para que Transformers.js precargue los seis ficheros en lugar de tres. Esto es relevante porque Transformers.js decide que ficheros de datos externos precargar a partir de ese contador declarado, no inspeccionando el grafo ONNX; sin el ajuste, la carga fallaria aunque los fragmentos existieran.

## Capacidades

- Generacion de texto y razonamiento con cadena de pensamiento (chain of thought), segun la documentacion de Liquid.
- Tool calling y function calling, capacidad destacada explicitamente en la documentacion del modelo y en el blog de presentacion.
- Razonamiento multi-paso orientado a agentes.
- Ventana de contexto de 128K tokens, adecuada para documentos largos y conversaciones extensas.
- Inferencia en dispositivo y en navegador mediante ONNX Runtime Web y transformers.js.
- Distribucion en seis fragmentos compatible con el limite de asignacion de memoria de V8.
- Ejecucion acelerada por WebGPU o por WebAssembly en entornos sin GPU accesible.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Vision, audio u otras modalidades: no disponible en la informacion proporcionada.

## Casos de uso

- Asistentes web sin backend: el modelo puede ejecutarse integramente en el navegador del usuario con transformers.js, de modo que la conversacion nunca sale del dispositivo. El re-shard es precisamente lo que hace viable esta carga en V8.
- Demos publicas en navegador: una pagina estatica puede servir un chatbot funcional sin coste de GPU en servidor, distribuyendo los seis fragmentos desde un CDN. El limite de 900 MB por fragmento facilita el cacheo y la reanudacion de descargas.
- Procesamiento de documentos sensibles: sectores con requisitos de residencia de datos (sanidad, legal, administracion publica) pueden ofrecer resumen y extraccion sobre documentos que no pueden enviarse a una API externa.
- Agentes con tool calling en local: gracias al soporte declarado de function calling y a los 128K de contexto, el modelo puede orquestar llamadas a herramientas locales (sistema de ficheros, APIs internas, bases de datos) dentro de un flujo multi-paso sin conexion.
- RAG en el navegador: combinado con un indice vectorial en cliente, el modelo puede responder preguntas sobre documentacion con contexto largo, aprovechando la ventana de 128K para insertar varios fragmentos recuperados.
- Aplicaciones de escritorio multiplataforma: al ser un export ONNX, puede embeberse en aplicaciones Electron, Tauri o herramientas nativas que usen ONNX Runtime, evitando dependencias de Python.
- Prototipado sin infraestructura: investigadores y desarrolladores pueden evaluar el comportamiento del modelo directamente en un portatil o en el navegador antes de decidir un despliegue en servidor.
- Extensiones de navegador: el formato fragmentado permite cargar los pesos de forma perezosa dentro de una extension, ejecutando tareas de resumen o clasificacion sobre la pagina activa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El blog de Liquid AI menciona "strong AI benchmarks" de forma cualitativa, y las paginas consultadas no incluyen cifras de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion, por lo que no se reproducen numeros.

## Requisitos de hardware

- Peso total de los pesos q4f16: 5,05 GB de tensores mas el grafo. El repositorio completo ocupa 5,1 GB.
- Memoria estimada para inferencia: en torno a 5-6 GB si se mantienen todos los pesos en memoria, cifra derivada del tamano del export y no de una medicion publicada por el autor.
- Navegador con WebGPU: la memoria disponible depende del limite impuesto por el navegador y el controlador grafico; 5 GB de pesos es exigente y puede requerir equipos con GPU dedicada.
- Navegador con WebAssembly: funciona sin GPU, pero el rendimiento es previsiblemente bajo y el uso de memoria esta limitado por el propio motor.
- GPU de servidor: al tratarse de un export ONNX, puede ejecutarse en ONNX Runtime con CUDA o TensorRT sobre A100, H100, L40S o similares; no se dispone de cifras de latencia o throughput.
- GPU de consumo: el modelo podria caber en tarjetas con 8 GB o mas de VRAM, pero no se han publicado mediciones que lo confirmen.
- Opciones de despliegue: onnxruntime-web y transformers.js son los destinos explicitos de este repositorio; ONNX Runtime (CPU, CUDA, TensorRT) en servidor; el export upstream es la alternativa para despliegues que no necesiten la fragmentacion.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Activos por token | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| LFM2.5-8B-A1B-ONNX-q4f16-sharded (este repositorio) | 8B | ~1B o 1,5B segun la fuente | 128K | ONNX q4f16 en 6 fragmentos de maximo 900 MB | LFM Open License (pesos); el re-shard no declara licencia propia | Hugging Face, orientado a navegador |
| LiquidAI/LFM2.5-8B-A1B-ONNX (upstream) | 8B | ~1B | 128K | ONNX q4f16 en 3 fragmentos (2,15 / 2,13 / 0,77 GB) | LFM Open License | Hugging Face; no carga en navegadores por el limite de V8 |
| LFM2-8B-A1B (generacion anterior, octubre de 2025) | 8B | no disponible | inferior a 128K, valor no disponible | no disponible | LFM Open License | Hugging Face |

Los datos de la generacion anterior proceden de la informacion de busqueda, que indica que el preentrenamiento paso de 12 a 38 billones de tokens y el contexto se amplio hasta 128K en LFM2.5. No se dispone de comparativas cuantitativas de rendimiento entre estos modelos.

## Limitaciones y advertencias

- Este repositorio es un reempaquetado, no un modelo distinto: cualquier limitacion del modelo base LFM2.5-8B-A1B se aplica integramente.
- Existe una discrepancia sin resolver entre las dos fuentes oficiales de Liquid sobre los parametros activos (1B frente a 1,5B). Conviene verificar la cifra antes de citarla en documentacion tecnica.
- El repositorio no declara licencia propia. Los pesos pertenecen a Liquid AI y se rigen por la LFM Open License; es responsabilidad del usuario revisar ese texto antes de cualquier uso comercial.
- No se han publicado datos de sesgos, tasas de alucinacion ni evaluaciones de seguridad en la informacion disponible.
- El soporte de idiomas no esta documentado en las fuentes consultadas, lo que incluye una posible cobertura limitada del castellano.
- El rendimiento en navegador depende de WebGPU y del limite de memoria del motor; 5 GB de pesos pueden no cargar en equipos con GPU integrada o con poca memoria.
- La fragmentacion resuelve el fallo de asignacion de ArrayBuffer de V8, pero no reduce el consumo total de memoria ni mejora la velocidad de inferencia.
- Al ser una cuantizacion de 4 bits, cabe esperar cierta perdida de calidad frente a los pesos en precision completa, aunque no se han publicado mediciones de esa degradacion.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de uso en produccion ni de validacion por parte de terceros.
- El campo `use_external_data_format` esta ajustado manualmente a 6; si upstream cambia el numero de fragmentos, el repositorio puede quedar desincronizado.

## Enlaces

- Repositorio analizado: https://huggingface.co/nchapman/LFM2.5-8B-A1B-ONNX-q4f16-sharded
- Export ONNX upstream: https://huggingface.co/LiquidAI/LFM2.5-8B-A1B-ONNX
- README del export upstream: https://huggingface.co/LiquidAI/LFM2.5-8B-A1B-ONNX/blob/main/README.md
- Documentacion de Liquid AI sobre LFM2.5-8B-A1B: https://docs.liquid.ai/lfm/models/lfm25-8b-a1b
- Blog de presentacion: https://www.liquid.ai/blog/lfm2-5-8b-a1b
- Ficha en LLM Releases: https://www.llm-releases.com/models/lfm2-5-8b-a1b
