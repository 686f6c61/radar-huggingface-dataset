# aj9o9/Ling-3.2-air-GGUF

## Resumen

Ling-3.2-air es un modelo de lenguaje de tipo Mixture-of-Experts (MoE) desarrollado por inclusionAI, con un total de 127.486.405.600 parametros y aproximadamente 5.500 millones de parametros activos por token. Combina capacidades de texto y vision (pipeline `image-text-to-text`) y emplea la arquitectura `bailingmoe3`, soportada por llama.cpp. Esta ficha documenta concretamente la version cuantizada en GGUF publicada por el usuario aj9o9, que ofrece cuatro niveles de compresion (XS, S, M y L) pensados para distintos presupuestos de VRAM y RAM.

El principal valor de esta publicacion es que permite ejecutar un modelo MoE de 124B parametros en hardware de consumo mediante una estrategia de offloading hibrido: los expertos mas utilizados se mantienen en la GPU y el resto en RAM, con lectura desde SSD como ultimo recurso. Los cuants han sido validados contra el modelo original en FP8 mediante metricas de divergencia KL y coincidencia del token mas probable, no solo con perplejidad, lo que aporta una referencia de calidad mas fiable.

El modelo esta liberado bajo licencia MIT y esta orientado a Project Maya (motor `maya-ling`), aunque los ficheros GGUF tambien cargan en llama.cpp. La relevancia actual radica en la posibilidad de desplegar un modelo multimodal de gran escala en una unica GPU de 24 GB con resultados de velocidad medidos y reproducibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE transformer (`bailingmoe3`), con vision (image-text-to-text) |
| Parametros totales | 127.486.405.600 (~127,5B) |
| Parametros activos | ~5,5B (según model card del cuantizador) |
| Longitud de contexto | Hasta 81.920 tokens configurado en las pruebas (80K) |
| Tipos de cuantizacion | GGUF en cuatro tiers: XS (30,3 GB), S (46,0 GB), M (61,8 GB), L (77,6 GB); proyector de vision en BF16 (829 MiB) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (con fichero `mmproj` separado para vision) |

## Arquitectura y entrenamiento

La informacion disponible confirma que Ling-3.2-air es un modelo MoE con 127,5B parametros totales y aproximadamente 5,5B activos, construido sobre el layout `bailingmoe3` que implementa llama.cpp. Incorpora un proyector de vision (`Ling-3.2-air-mmproj-BF16.gguf`, 829 MiB) que habilita la entrada de imagenes y funciona con todos los tiers de cuantizacion. La model card del cuantizador no detalla la composicion del dataset de entrenamiento, el numero de tokens utilizados ni si se aplicaron tecnicas de RLHF o DPO; esa informacion corresponderia al modelo base `inclusionAI/Ling-3.2-air`, no incluida en los datos proporcionados.

La innovacion tecnica destacable de esta publicacion es el esquema de cuantizacion por tiers con validacion explicita frente al modelo FP8 de referencia. El autor reporta metricas de divergencia KL y de coincidencia del token mas probable sobre 32 secuencias reservadas de 2048 tokens, cubriendo chat, chat multilingue, razonamiento, codigo web, otro codigo, tool calls y wikitext. Ademas, el motor `maya-ling` implementa offloading mixto de expertos (GPU + RAM + SSD) y decodificacion especulativa mediante MTP (multi-token prediction) drafting, que en las pruebas incrementa notablemente el throughput frente a llama.cpp.

## Capacidades

- Generacion de texto conversacional multi-turno con contexto largo (hasta 80K tokens en las pruebas).
- Razonamiento y cadena de pensamiento (modo thinking activable/desactivable).
- Generacion y comprension de codigo, incluyendo codigo web.
- Tool calling / function calling (evaluado en el conjunto de validacion de cuantizacion).
- Comprension de imagenes mediante el proyector de vision (`mmproj`), con pipeline `image-text-to-text`.
- Capacidades multilingues (el conjunto de validacion incluye chat multilingue, aunque no se especifican los idiomas exactos).
- Compatibilidad con APIs OpenAI (`/v1`) y Anthropic (`/v1/messages`) a traves de Project Maya.
- Carga en llama.cpp ademas del motor propio `maya-ling`.

## Casos de uso

- Asistente conversacional local con contexto largo: gracias a la ventana de hasta 80K tokens y al modo thinking, puede mantener conversaciones extensas con documentos largos en un solo equipo con GPU de 24 GB, usando el tier S o M.
- Analisis de documentos con imagenes: el proyector de vision permite responder preguntas sobre capturas, diagramas o documentos escaneados combinando texto e imagen en la misma peticion.
- Generacion de codigo en pipelines de desarrollo: el soporte de tool calling y la evaluacion especifica sobre codigo web y otro codigo lo hacen apto para integrarse en asistentes de IDE o revision de parches mediante la API compatible con OpenAI.
- Automatizacion de agentes multi-paso: la combinacion de razonamiento, tool calling y contexto largo permite orquestar tareas con varias llamadas a herramientas manteniendo el estado en la ventana de contexto.
- Despliegue en estaciones de trabajo con una sola GPU: el tier XS (30,3 GB) esta disenado para una RTX 3060 de 12 GB mas 16 GB de RAM, lo que habilita prototipos de un modelo de 124B en hardware de gama media.
- Servicio de inferencia self-hosted con API compatible: Project Maya expone endpoints OpenAI y Anthropic, lo que permite sustituir proveedores cloud en entornos con requisitos de privacidad, usando el tier L en una GPU de 96 GB para maximizar calidad.
- Procesamiento por lotes de textos largos: el throughput de lectura de prompt medido (hasta 2.210 tokens/s en 8K) hace viable el analisis de corpus extensos en local.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. La model card proporciona metricas de fidelidad de cuantizacion y de velocidad, que se reproducen a continuacion.

Fidelidad frente al modelo FP8 (32 secuencias x 2048 tokens; KL menor es mejor):

| Version | Tamano | KL ↓ | Mismo token top ↑ |
|---|---:|---:|---:|
| FP8 ejecutado dos veces (ruido) | 121 GB | 0,066 | 95,2% |
| BF16 | 255 GB | 0,078 | 94,9% |
| Q8_0 | 135,6 GB | 0,101 | 94,1% |
| L | 77,6 GB | 0,140 | 92,3% |
| bartowski Q4_K_M | 80,4 GB | 0,159 | 91,4% |
| M | 61,8 GB | 0,204 | 89,8% |
| bartowski Q3_K_M | 61,5 GB | 0,259 | 88,3% |
| S | 46,0 GB | 0,340 | 85,5% |
| bartowski IQ2_M | 47,1 GB | 0,437 | 83,6% |

Velocidad del tier S en una RTX 3090 (24 GB, limitada a 250 W), 60 GB RAM, Ryzen 9 9900X, contexto 80K, cache KV q8, MTP activo, thinking desactivado, greedy:

| Metrica | Maya (todo en VRAM+RAM) | Maya (0,3 GB en SSD) | llama.cpp |
|---|---:|---:|---:|
| Escritura (respuestas cortas) | 106 tok/s | 70 tok/s | 34 tok/s |
| Escritura tras prompt de 30K | 79 tok/s | 76 tok/s | no disponible |
| Lectura de prompt 2K / 8K | 1.734 / 2.210 tok/s | 1.089 / 2.142 tok/s | ~370 tok/s (7K) |
| Lectura de prompt 30K | 1.905 tok/s (15,5 s) | 1.834 tok/s (16,1 s) | no disponible |

En una RTX PRO 6000 (96 GB), con el modelo completo en VRAM, todos los tiers generan a 145-195 tokens/s.

## Requisitos de hardware

- VRAM estimada por tier: XS pensado para 12 GB de VRAM mas 16 GB de RAM; S para 24 GB de VRAM mas 32 GB de RAM; M para 24 GB de VRAM mas 48 GB de RAM; L para 24 GB de VRAM mas 64 GB de RAM.
- GPU recomendadas: RTX 3060 12 GB (tier XS), RTX 3090 / RTX 4090 24 GB (tiers S, M y L con offloading), RTX PRO 6000 96 GB (cualquier tier completo en VRAM).
- Cabe en GPU de consumo: si, mediante los tiers XS y S en tarjetas de 12 y 24 GB respectivamente, con apoyo de RAM del sistema.
- Opciones de despliegue: Project Maya (motor `maya-ling`, disponible via PR mw00/project-maya#1224, con API OpenAI y Anthropic) y llama.cpp (usando `-m` y `--mmproj`).
- Latencia y throughput: en RTX 3090 con tier S, 106 tok/s de generacion y hasta 2.210 tok/s de lectura de prompt; en RTX PRO 6000, 145-195 tok/s. Requiere dejar unos 51 GB de RAM libres al arrancar Maya para el tier S; si parte de los expertos cae en SSD, la generacion cae aproximadamente un tercio.
- Nota operativa: `--reserve-gb 0.5` evita fallos de asignacion con prompts largos; la cache KV en q8 resulto mas rapida que fp16 al liberar VRAM para expertos.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Formato disponible |
|---|---|---|---|---|---|
| Ling-3.2-air (esta ficha, GGUF) | ~127,5B | ~5,5B | hasta 80K en pruebas | MIT | GGUF + mmproj |
| Ling-3.2-air FP8 (base) | ~127,5B | ~5,5B | no disponible | MIT | FP8 |
| Ling-3.2-air BF16 (base) | ~127,5B | ~5,5B | no disponible | MIT | BF16 |
| bartowski Q4_K_M / Q3_K_M / IQ2_M (mismo modelo) | ~127,5B | ~5,5B | no disponible | MIT | GGUF |

No se dispone de datos de otros modelos de la misma categoria en la informacion proporcionada para establecer una comparativa cruzada de rendimiento; los unicos puntos de comparacion disponibles son las cuantizaciones alternativas del mismo modelo base.

## Limitaciones y advertencias

- El soporte de Ling en Project Maya es todavia una pull request (mw00/project-maya#1224); no forma parte de una version estable y puede cambiar.
- Los tiers no estan en el catalogo de Maya; la pantalla de setup muestra el cuant S del PR en lugar del tier descargado.
- El rendimiento depende criticamente de la RAM libre: si parte de los expertos se lee desde SSD, la generacion cae alrededor de un tercio y la tasa de acierto de expertos en GPU baja del 92% al 69%.
- El tier XS presenta una divergencia KL de 0,654 y solo un 78,7% de coincidencia del token top frente al FP8, lo que implica una perdida de calidad notable.
- No se especifican los idiomas soportados ni el comportamiento multilingue real, pese a que el conjunto de validacion incluye chat multilingue.
- No hay datos publicados de benchmarks estandar de capacidad (razonamiento, codigo, matematicas) en la informacion disponible.
- Riesgo de alucinacion inherente a los modelos de lenguaje; no se documentan evaluaciones de sesgo ni de robustez.
- La licencia MIT permite uso comercial, pero se recomienda verificar las condiciones del modelo base `inclusionAI/Ling-3.2-air` y de sus datos de entrenamiento.
- Los ficheros M y L estan divididos en dos shards; es necesario descargar ambos y apuntar el cargador al primero.
- La decodificacion especulativa MTP y la cache KV q8 son ajustes medidos en un entorno concreto (Linux, NVIDIA, CUDA 12/13); su comportamiento en otras configuraciones puede variar.

## Enlaces

- Repositorio GGUF: https://huggingface.co/aj9o9/Ling-3.2-air-GGUF
- Modelo base: https://huggingface.co/inclusionAI/Ling-3.2-air
- Project Maya: https://github.com/mw00/project-maya
- Pull request con soporte Ling: https://github.com/mw00/project-maya/pull/1224
