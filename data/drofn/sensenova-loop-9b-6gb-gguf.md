# drofn/SenseNova-Loop-9B-6GB-GGUF

## Resumen

SenseNova-Loop-9B es un modelo de lenguaje decoder-only de aproximadamente 9.000 millones de parametros desarrollado por SenseTime (SenseNova). Su rasgo distintivo es el uso de un bloque de capas "looped" (recurrente): almacena 32 capas de decoder pero ejecuta las capas 4-27 dos veces por token, lo que resulta en 56 ejecuciones de capa por pase forward. Emplea un residual stream de doble flujo con hyper-conexiones restringidas a variedad (mHC) y atencion hibrida que combina capas de atencion lineal (Gated DeltaNet) con capas de atencion completa.

Esta ficha corresponde a la cuantizacion GGUF publicada por el usuario drofn bajo el identificador `drofn/SenseNova-Loop-9B-6GB-GGUF`. No es el modelo original, sino una version cuantizada en precision mixta orientada a inferencia con contexto largo (hasta 32K) en tarjetas NVIDIA de 6 GB de VRAM, como la RTX 2060 6GB o la RTX 3050 6GB. La asignacion de bits por grupo de tensores se realizo a partir de la sensibilidad medida (divergencia KL frente a Q8_0), no con una regla uniforme.

La relevancia de esta publicacion es practica: demuestra que un modelo de ~9B con contexto nativo de 512K puede servirse en hardware consumer de gama baja mediante cuantizacion guiada por imatrix y una compilacion parcheada de llama.cpp. El repositorio incluye un unico archivo de 4,72 GB que alcanza 39.680 tokens de contexto con KV cache q4_0 en una tarjeta de 6 GB simulada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con bloque de capas recurrente (looped), atencion hibrida (Gated DeltaNet + atencion completa) y residual stream mHC de doble flujo |
| Parametros totales | 8.956.949.376 (~9B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512K en el modelo base (YaRN x2); 32K objetivo en esta cuantizacion; hasta 39.680 tokens con KV q4_0 en 6 GB simulados sin display |
| Tipos de cuantizacion | GGUF de precision mixta (asignacion por grupo de tensores, tipos IQ y K); KV cache q4_0 o q8_0 |
| Idiomas soportados | en, zh, tr |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp); pesos originales del modelo base en safetensors |

## Arquitectura y entrenamiento

El modelo base SenseNova-Loop-9B es un decoder de ~9B con 32 capas almacenadas. Las capas 4-27 se ejecutan dos veces por token, lo que da 56 ejecuciones de capa por pase forward. El residual stream utiliza hyper-conexiones de variedad restringida (mHC) de doble flujo, con enrutamiento normalizado mediante 20 iteraciones de Sinkhorn. La atencion es hibrida: cada grupo de cuatro capas contiene tres capas de atencion lineal (Gated DeltaNet) y una capa de atencion completa. La atencion completa usa 16 cabezas de query, 4 cabezas KV y head_dim de 256. El vocabulario tiene 248.320 tokens y la longitud de contexto nativa es de 512K con extension YaRN x2. El modelo original acepta imagenes; las cuantizaciones GGUF de este repositorio son solo texto y no incluyen proyector de vision (mmproj).

Sobre el entrenamiento del modelo base, la informacion disponible no detalla el numero de tokens, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO; estos datos figuran como no disponibles. La innovacion documentada en esta publicacion es el proceso de cuantizacion: cada grupo de tensores se cuantizo individualmente a Q2_K y a Q4_K (el resto en Q8_0) y se midio la divergencia KL frente a Q8_0; despues, un asignador voraz repartio bits segun el coste en KLD por GB ahorrado. El analisis muestra que las capas 0-3, especialmente sus tensores de atencion lineal, son las mas sensibles por GB, mientras que las capas 28-31 son las menos sensibles; como las capas 4-27 se ejecutan dos veces, los bits se desplazan hacia el inicio de ese bloque.

## Capacidades

- Generacion de texto conversacional y continuacion de texto en ingles, chino y turco.
- Razonamiento multi-paso y respuesta a instrucciones en formato conversacional.
- Procesamiento de contexto largo: hasta 32K tokens objetivo en esta cuantizacion, con hasta 39.680 tokens reales con KV q4_0 en 6 GB simulados.
- Capacidad multilingue limitada a los tres idiomas declarados (en, zh, tr).
- Compatibilidad con endpoints (tag `endpoints_compatible`) para despliegue como servicio de generacion de texto.
- El modelo base admite entrada de imagenes; esta cuantizacion GGUF no incluye vision.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de agente y modo thinking: no disponible en la informacion proporcionada.

## Casos de uso

- Asistente conversacional local en equipos con GPU de 6 GB: el archivo de 4,72 GB permite ejecutar un modelo de ~9B con contexto de decenas de miles de tokens en tarjetas como la RTX 2060 6GB o la RTX 3050 6GB, sin depender de la nube.
- Procesamiento de documentos largos en local: con hasta 39.680 tokens de contexto con KV q4_0 (sin display conectado), es adecuado para resumir o extraer informacion de informes, contratos o articulos extensos en una sola pasada.
- Atencion al cliente automatizada en ingles o chino: la ventana de contexto permite mantener conversaciones multi-turno con historial extenso y documentacion de referencia inyectada en el prompt.
- Generacion de texto y redaccion asistida en turco: es uno de los pocos modelos de este tamano que declara soporte explicito de turco, lo que lo hace util para aplicaciones dirigidas a ese mercado.
- Prototipado e investigacion en hardware consumer: sirve para experimentar con arquitecturas de capas recurrentes y atencion hibrida sin acceso a GPUs de datacenter, gracias a su licencia Apache-2.0.
- Despliegue en entornos con requisitos de privacidad: al ejecutarse integramente en local (solo la tabla de embeddings de tokens permanece en RAM del sistema), los datos no salen del equipo, lo que encaja en escenarios con datos sensibles.
- Evaluacion comparativa de tecnicas de cuantizacion: el repositorio documenta KLD, tasa de mismo top-token y ajuste de contexto por archivo, lo que lo convierte en un caso de referencia para estudiar cuantizacion guiada por sensibilidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. Los unicos datos de rendimiento publicados son metricas de calidad de la cuantizacion:

| Metrica | 6GB-32K | IQ3_M (misma imatrix) | Q3_K_M (misma imatrix) | IQ3_XS (misma imatrix) | Q3_K_S (misma imatrix) |
|---|---:|---:|---:|---:|---:|
| KLD set 1 (menor es mejor) | 0.168 | 0.288 | 0.285 | 0.288 | 0.504 |
| KLD set 2 | 0.146 | no disponible | no disponible | no disponible | no disponible |
| KLD set 3 | 0.090 | no disponible | no disponible | no disponible | no disponible |
| Mismo top-token set 1 | 81,7 % | 77,7 % | 78,3 % | 78,0 % | 72,1 % |
| Contexto, sin display (q4_0 KV) | 39.680 | 40.192 | 30.464 | 49.920 | 48.896 |
| Tamano del archivo | 4,72 GB | no disponible | no disponible | no disponible | no disponible |

El umbral de calidad fijado por el autor es una tasa de mismo top-token de al menos el 80 % en el set 1; solo el archivo 6GB-32K lo supera. Una variante de 3,6 bpw y 64K de contexto (KLD medio 0,333; 74,8 % de mismo top-token) quedo por debajo del umbral y no se publico.

## Requisitos de hardware

- VRAM estimada: 6 GB para el archivo 6GB-32K (4,72 GB de pesos) con contexto de hasta 39.680 tokens usando KV cache q4_0 y sin display conectado; con KV q8_0 el contexto maximo baja a 23.296 tokens.
- Con display conectado (se asumen 700 MiB de escritorio) solo caben unos 3,6K tokens de contexto.
- GPU objetivo: NVIDIA RTX 2060 6GB, RTX 3050 6GB y similares. Las mediciones de ajuste se realizaron con `llama-fit-params` sobre una RTX 4060 simulando 6 GB; el autor indica que no se probo ninguna tarjeta real de 6 GB.
- Todo se ejecuta en la GPU; solo la tabla de embeddings de tokens permanece en RAM del sistema.
- Despliegue: requiere una compilacion parcheada de llama.cpp (fork indicado en la model card). El llama.cpp upstream, LM Studio y Ollama no soportaban la arquitectura `sensenova_loop` a fecha de 2026-11-19 (issue ggml-org/llama.cpp#31571). Existe una escalera de cuantizacion completa en formato upstream (PR #32588) en `drofn/SenseNova-Loop-9B-GGUF`, pero esos archivos no cargan con el fork y viceversa; en una RTX 4060 la build del PR es actualmente mas lenta que el archivo 8GB-v3 sobre el fork parcheado, porque el PR aun no tiene kernels CUDA para el enrutamiento mHC.
- Latencia y throughput: no disponibles en la informacion proporcionada.
- Para tarjetas de 8 GB existe la variante `drofn/SenseNova-Loop-9B-8GB-v3-GGUF` (104K de contexto, cabeza MTP y entrada de imagen opcional).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---:|---|---|---|
| SenseNova-Loop-9B-6GB-GGUF (esta ficha) | ~9B | 32K objetivo; 39.680 tokens con KV q4_0 en 6 GB | Apache-2.0 | GGUF para llama.cpp parcheado | Cuantizacion guiada por KLD; solo texto |
| SenseNova-Loop-9B-8GB-v3-GGUF | ~9B | 104K | Apache-2.0 | GGUF para llama.cpp parcheado | Misma familia; cabeza MTP; imagen opcional |
| SenseNova-Loop-9B (base) | ~9B | 512K (YaRN x2) | Apache-2.0 | Safetensors | Modelo original con vision |
| Cuantizaciones estandar IQ3_M / Q3_K_M | ~9B | 40.192 / 30.464 tokens en 6 GB simulados | Apache-2.0 | GGUF | Peor KLD y tasa de mismo top-token que el archivo 6GB-32K |

No se dispone de datos de benchmarks de tareas que permitan comparar el rendimiento cualitativo con modelos de otros desarrolladores de tamano similar; esa comparacion figura como no disponible.

## Limitaciones y advertencias

- Requiere una compilacion parcheada de llama.cpp: los archivos no cargan en llama.cpp upstream, LM Studio ni Ollama (situacion a 2026-11-19). Ademas, no son compatibles con la build del PR #32588.
- Las mediciones de contexto y VRAM se hicieron sobre una RTX 4060 simulando 6 GB; no se probo ninguna GPU real de 6 GB.
- Con un display conectado, el contexto utilizable cae a unos 3,6K tokens, lo que limita severamente los casos de contexto largo en equipos de escritorio.
- Solo texto: no incluye proyector de vision, pese a que el modelo base acepta imagenes.
- Idiomas limitados a ingles, chino y turco; no se declara soporte de castellano.
- Riesgo de alucinacion inherente a los modelos de ~9B cuantizados a ~4 bits; la propia cuantizacion introduce divergencia respecto a Q8_0 (KLD de 0,168 en el set 1), lo que puede agravar errores en generaciones largas.
- Sesgos conocidos: no disponibles en la informacion proporcionada.
- Licencia Apache-2.0: permite uso comercial, pero debe verificarse el cumplimiento de las condiciones de la licencia del modelo base y de las dependencias del runtime parcheado.
- La calidad esta calibrada con el umbral del 80 % de mismo top-token en un unico set de evaluacion; no hay validacion con benchmarks de tareas estandar.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/drofn/SenseNova-Loop-9B-6GB-GGUF
- Modelo base: https://huggingface.co/sensenova/SenseNova-Loop-9B
- Variante 8 GB (v3): https://huggingface.co/drofn/SenseNova-Loop-9B-8GB-v3-GGUF
- Primera release 8 GB: https://huggingface.co/drofn/SenseNova-Loop-9B-8GB-GGUF
- Coleccion de todas las tallas: https://huggingface.co/collections/drofn/sensenova-loop-9b-gguf-for-6-8-gb-gpus-6aff1a746c005b20c4230d30
- Escalera de cuantizacion en formato upstream: https://huggingface.co/drofn/SenseNova-Loop-9B-GGUF
- PR de llama.cpp con soporte de la arquitectura: https://github.com/ggml-org/llama.cpp/pull/32588
- Issue de soporte en llama.cpp: https://github.com/ggml-org/llama.cpp/issues/31571
