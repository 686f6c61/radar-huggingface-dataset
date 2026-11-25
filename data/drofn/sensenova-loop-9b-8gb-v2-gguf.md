# drofn/SenseNova-Loop-9B-8GB-v2-GGUF

## Resumen

SenseNova-Loop-9B-8GB-v2-GGUF es una cuantizacion GGUF del modelo SenseNova-Loop-9B, desarrollado originalmente por SenseNova y empaquetado para llama.cpp por el usuario drofn. El modelo base es un transformer con arquitectura de bucles (looped transformer) de 9.200 millones de parametros, disenado para generacion de texto e imagen-texto, con soporte para razonamiento conversacional y decodificacion especulativa mediante una cabeza de prediccion multi-token (MTP). Esta version concreta resuelve el problema de ejecutar un modelo de 9B en GPUs de consumo con 8 GB de VRAM, manteniendo contexto largo (hasta 104.448 tokens en modo texto) y anadiendo entrada de imagenes opcional.

La relevancia de esta ficha radica en que combina tres elementos poco habituales en un mismo paquete: cuantizacion agresiva con mezclas asignadas por sensibilidad, decodificacion especulativa nativa mediante MTP (que casi duplica el throughput en una RTX 4060) y soporte multimodal opcional con un proyector de vision de 0.92 GB que tambien cabe en la tarjeta. El modelo esta publicado bajo licencia Apache-2.0 y soporta ingles, chino y turco.

El autor reporta mejoras medibles frente a la version v1: la generacion pasa de 25,9 a 47,8 tok/s en texto y de 28,4 a 53,5 tok/s con vision, con tasas de aceptacion de tokens redactados del 71,9% y 74,1% respectivamente. Existe una version posterior (v3) con menor divergencia KL respecto a Q8_0, pero esta v2 sigue siendo la opcion con mayor contexto cuando se usa vision.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Looped transformer (transformer con bucles) con cabeza MTP para decodificacion especulativa |
| Parametros totales | 9.200.240.000 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 104.448 tokens (texto, 8GB-v2); 81.920 tokens (texto + vision, 8GB-v2-Vision) |
| Tipos de cuantizacion | Mezclas asignadas por sensibilidad; pesos del modelo en Q6_K/Q8_0/F32 segun tensor; KV cache q4_0; escalera completa Q8_0 a IQ2_XS disponible en repo separado |
| Idiomas soportados | en, zh, tr |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp), con mmproj F16 separado para vision |

## Arquitectura y entrenamiento

El modelo base SenseNova-Loop-9B emplea una arquitectura de transformer con bucles (looped transformer), en la que el mismo bloque se aplica de forma iterativa para incrementar la profundidad efectiva sin multiplicar el numero de parametros. Esta version GGUF conserva los pesos cuantizados del modelo original y anade la cabeza MTP (`mtp.safetensors`), un pequeno bloque decodificador adicional de 15 tensores (matrices Q6_K, `eh_proj` en Q8_0 y normas en F32, unos 208 MB) que redacta los siguientes tokens para que el modelo principal los verifique en un solo lote.

No se dispone de informacion detallada sobre el numero de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF/DPO en la informacion proporcionada. La innovacion tecnica destacable de este paquete es la combinacion de decodificacion especulativa MTP con cuantizacion por sensibilidad y KV cache en q4_0, que permite mantener contexto de mas de 100.000 tokens en 8 GB de VRAM. El autor indica que la cabeza MTP no altera la perplejidad medida por `llama-perplexity`, por lo que los valores de divergencia KL coinciden con los de la version v1.

## Capacidades

- Generacion de texto conversacional multi-turno con contexto largo (hasta 104.448 tokens en modo texto).
- Razonamiento y generacion de codigo: el prompt de prueba del autor solicita una funcion Python y tres tests de pytest, y el modelo los produce.
- Entrada de imagenes (image-text-to-text) en la variante 8GB-v2-Vision, usando el proyector oficial mmproj en F16.
- Decodificacion especulativa mediante cabeza MTP con `--spec-type draft-mtp`, con tasas de aceptacion del 71,9% al 74,1% en las pruebas del autor.
- Capacidades multilingues limitadas a ingles, chino y turco.
- Recuperacion de informacion en contexto largo: el autor verifica que localiza 3 de 3 hechos ocultos en prompts de 102.903 y 80.380 tokens.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Modo thinking: el autor menciona que las pruebas se hicieron con "thinking off", lo que implica que existe un modo de razonamiento, pero no se detallan sus caracteristicas.

## Casos de uso

- Asistente de codigo en estaciones de trabajo con GPU de 8 GB: el modelo genera funciones y tests unitarios (el autor lo prueba con Python y pytest) a 47,8 tok/s con MTP activo en una RTX 4060, lo que lo hace viable para autocompletado y generacion de tests en local sin depender de la nube.
- Analisis de documentos largos en local: con 104.448 tokens de contexto en modo texto, se puede cargar un informe extenso o un repositorio de documentacion y hacer preguntas sobre hechos concretos; el autor demuestra recuperacion de 3 de 3 hechos en prompts de casi 103.000 tokens.
- Procesamiento de capturas de pantalla o diagramas: la variante 8GB-v2-Vision acepta imagenes junto con texto, util para extraer informacion de interfaces, graficos o documentacion escaneada, con 81.920 tokens de contexto compartido.
- Atencion al cliente automatizada multilingue: el soporte de ingles, chino y turco permite desplegar un asistente conversacional para esos mercados, con contexto suficiente para historiales de conversacion largos.
- Prototipado de pipelines de IA en hardware de consumo: al caber en una RTX 4060 con todas las capas en GPU y menos de 200 MiB de memoria compartida, sirve para validar flujos de inferencia antes de escalar a hardware mayor.
- Investigacion sobre decodificacion especulativa: la inclusion de la cabeza MTP y las metricas de aceptacion publicadas lo convierten en un banco de pruebas practico para estudiar el equilibrio entre velocidad y calidad en llama.cpp.
- Despliegue edge o en entornos con restricciones de red: al ser un GGUF ejecutable con llama.cpp y licencia Apache-2.0, se puede integrar en dispositivos locales sin conexion para tareas de resumen o clasificacion de texto.

## Benchmarks y rendimiento

Los datos disponibles son mediciones del autor en una RTX 4060 8GB bajo Windows, sin pantalla conectada, con ejecuciones unicas (no medianas). El prompt tiene 58 tokens, la salida 400 tokens, temperatura 0, thinking off y `--spec-draft-n-max 2`.

| Metrica | 8GB-v2 (texto) | 8GB-v2-Vision + mmproj |
|---|---:|---:|
| Generacion con MTP off | 25,9 tok/s | 28,4 tok/s |
| Generacion con MTP on | 47,8 tok/s | 53,5 tok/s |
| Tokens redactados aceptados | 235/327 (71,9%) | 238/321 (74,1%) |
| Contexto maximo (MTP on) | 104.448 | 81.920 |
| Prefill en contexto largo | 722 tok/s (102.903 tokens) | 767 tok/s (80.380 tokens) |
| Generacion en contexto largo | 20,2 tok/s | 27,3 tok/s |
| Recuperacion de hechos en contexto largo | 3/3 | 3/3 |
| Divergencia KL media vs Q8_0 (set 1 / set 2) | 0,0703 / 0,0762 | 0,1375 / 0,1213 |

La perplejidad de referencia Q8_0 fue 11,5547 en el set 1 y 2,6327 en el set 2. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: 8 GB para todas las capas en GPU con el archivo de texto (5,76 GB) o el de vision (5,19 GB) mas el proyector (0,92 GB); memoria de sistema compartida mantenida en 200 MiB o menos.
- GPU recomendadas: RTX 4060 8GB es el banco de pruebas del autor; cualquier GPU con 8 GB o mas de VRAM deberia poder ejecutarlo, aunque no se aportan mediciones en otros modelos.
- Cabe en GPU de consumo: si, en tarjetas de 8 GB como la RTX 4060; el autor no reporta pruebas en GPUs de 6 GB.
- Opciones de despliegue: llama.cpp con el fork parcheado del autor y soporte para `--spec-type draft-mtp`; la version con escalera completa de cuantizacion requiere una build con el PR #32588 y no carga en el fork usado aqui. No se mencionan vLLM, Ollama ni TGI.
- Latencia y throughput: 47,8 tok/s (texto) y 53,5 tok/s (vision) con MTP en RTX 4060; 20,2 y 27,3 tok/s respectivamente en contexto largo; prefill de 722 a 767 tok/s.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---:|---|---|---|
| SenseNova-Loop-9B-8GB-v2 (esta ficha) | 9,2B | 104.448 (texto) / 81.920 (vision) | Apache-2.0 | MTP incluido, vision opcional, KLD 0,0703/0,0762 |
| SenseNova-Loop-9B-8GB-v3 | 9,2B | 104.448 (texto) / 57.344 (vision) | Apache-2.0 | KLD ~20% menor que v2, pero menos contexto con imagenes |
| SenseNova-Loop-9B-GGUF (upstream, PR #32588) | 9,2B | no disponible | Apache-2.0 | Escalera Q8_0 a IQ2_XS; en RTX 4060 mas lento que v3 por falta de kernels CUDA para el routing mHC |
| AtomicChat AD-Q4_K_M | 9,2B | no disponible | no disponible | Segun el autor, tan cerca o mas de Q8_0 que v3 |

No se dispone de comparaciones con modelos de otros desarrolladores en la informacion proporcionada.

## Limitaciones y advertencias

- La cuantizacion introduce divergencia respecto a Q8_0: KLD media de 0,0703/0,0762 en texto y 0,1375/0,1213 en vision, lo que puede degradar tareas sensibles a la precision.
- La version v3 reduce el KLD pero tambien el contexto con imagenes (57.344 frente a 81.920 tokens), por lo que elegir v2 implica un compromiso.
- El soporte de vision requiere el archivo mmproj separado y reduce el contexto disponible a 81.920 tokens.
- Los archivos de este repositorio no cargan en la build del PR #32588 y viceversa; es necesario usar el fork parcheado correcto, lo que complica el despliegue estandar.
- La build del PR #32588 carece de kernels CUDA para el routing mHC, lo que la hace mas lenta en RTX 4060.
- Idiomas limitados a ingles, chino y turco; no hay soporte declarado de espanol.
- Las mediciones son ejecuciones unicas en un solo equipo (RTX 4060, Windows), no medianas ni replicadas en otro hardware.
- La tasa de aceptacion de MTP depende del texto y se midio en un unico prompt de codigo.
- Riesgo de alucinacion y sesgos: no disponible en la informacion proporcionada.
- Uso comercial: permitido por Apache-2.0, pero conviene verificar las condiciones del modelo base SenseNova-Loop-9B.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/drofn/SenseNova-Loop-9B-8GB-v2-GGUF
- Version v1: https://huggingface.co/drofn/SenseNova-Loop-9B-8GB-GGUF
- Version v3: https://huggingface.co/drofn/SenseNova-Loop-9B-8GB-v3-GGUF
- Repositorio con escalera completa de cuantizacion: https://huggingface.co/drofn/SenseNova-Loop-9B-GGUF
- Coleccion de todas las versiones: https://huggingface.co/collections/drofn/sensenova-loop-9b-gguf-for-6-8-gb-gpus-6aff1a746c005b20c4230d30
- Modelo base: https://huggingface.co/sensenova/SenseNova-Loop-9B
- GGUF oficial del modelo base: https://huggingface.co/sensenova/SenseNova-Loop-9B-GGUF
- PR de llama.cpp: https://github.com/ggml-org/llama.cpp/pull/32588
- Licencia Apache-2.0: https://www.apache.org/licenses/LICENSE-2.0
