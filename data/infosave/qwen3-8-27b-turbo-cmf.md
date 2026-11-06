# infosave/Qwen3.8-27B-Turbo-cmf

## Resumen

Qwen3.8-27B-Turbo-cmf es una cuantización de 4 bits del modelo Qwen3.8-27B de Qwen, empaquetada en un único fichero CMF para `cortiq`, un motor de inferencia escrito en Rust sin dependencias de Python ni de frameworks de machine learning. El autor del empaquetado es el usuario `infosave`, y el modelo base conserva la licencia Apache 2.0. El objetivo declarado es permitir que un modelo de 27 000 millones de parámetros funcione en tarjetas gráficas de 16 GB con prompts de hasta 64 000 tokens sin que el consumo de memoria del dispositivo crezca con la longitud del texto.

La innovación principal es un mecanismo de "campo lejano" (far field) que mantiene una ventana de atención exacta para los primeros 8192 tokens (4096 en una tarjeta de 16 GB) y comprime el resto de la clave-valor en 32 puntos de referencia por cabeza, conservando además 248 filas exactas seleccionadas por su relevancia para la tarea. Según la model card, esto permite leer 64 000 tokens en 177 s frente a 316 s del fichero estándar, con una decodificación de 92 tok/s frente a 51, manteniendo exactos datos como contraseñas y códigos.

El modelo está pensado para despliegues de contexto largo con recursos limitados, especialmente en GPUs de consumo con backend Vulkan, y declara soporte para inglés, ruso y chino. La información disponible no detalla la arquitectura interna del modelo base ni sus datos de entrenamiento, por lo que varios apartados de esta ficha quedan marcados como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Qwen3.8-27B; el empaquetado usa atención exacta más campo lejano comprimido) |
| Parametros totales | 27 000 millones (según nombre del modelo base) |
| Parametros activos | no disponible |
| Longitud de contexto | hasta 64 000 tokens documentados en pruebas; ventana exacta de 8192 tokens (4096 con 16 GB de VRAM) |
| Tipos de cuantizacion | 4 bits (q4tp) en formato CMF |
| Idiomas soportados | inglés (en), ruso (ru), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | CMF (fichero único para el motor cortiq) |

## Arquitectura y entrenamiento

La información proporcionada no describe la arquitectura interna del modelo base Qwen3.8-27B ni sus datos de entrenamiento (número de tokens, composición del corpus, uso de RLHF o DPO). Lo que sí se detalla es la capa de empaquetado: el fichero CMF contiene los pesos en 4 bits y una cabecera que gestiona la memoria del dispositivo durante prompts largos. La atención se divide en dos regímenes: las primeras 8192 filas (4096 en tarjetas de 16 GB) se procesan de forma exacta en la GPU, mientras que las filas posteriores se expulsan a RAM o disco a medida que se leen. Antes de las últimas 512 filas se construye un campo lejano capa a capa que conserva las primeras 4 filas y las últimas 1800 de forma exacta, y el resto se representa con 32 puntos de referencia por cabeza.

Además, cada fila se puntúa según lo que hacen con ella las capas, y las 248 mejores se mantienen exactas para que una pregunta al final del prompt pueda leerlas antes de responder. El modelo base incorpora una cabeza MTP (multi-token prediction) que genera borradores de tokens; la GPU los verifica en un lote y el campo lejano solo avanza sobre los aceptados, de modo que el texto greedy no cambia con o sin borradores. El autor cita una solicitud de patente (nº 19/738,763) sobre este mecanismo.

## Capacidades

- Generación de texto con contexto largo: lectura de prompts de hasta 64 000 tokens documentados, con pruebas adicionales en 230 000 caracteres (unos 53 000 tokens).
- Recuperación exacta de datos plantados: contraseñas, códigos de acceso, claves y números de habitación se conservan literales en las pruebas realizadas (12 de 12 en 100 000 caracteres; 6 de 6 en 230 000 caracteres).
- Modo de respuesta directa mediante `--no-think`, que evita el razonamiento extendido.
- Decodificación especulativa con la cabeza MTP del modelo base, activada con `--greedy`.
- Capacidades multilingües declaradas en inglés, ruso y chino.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades de visión o audio: no disponible en la información proporcionada.

## Casos de uso

- Análisis de documentos extensos en GPU de consumo: con 16 GB de VRAM y un presupuesto de 15 GB, el modelo procesa prompts de 32 000 y 64 000 tokens manteniendo 92 tok/s de decodificación, lo que permite resumir informes o contratos largos en una RTX 5090 o similar.
- Extracción de credenciales y datos críticos: gracias a las 248 filas exactas, es adecuado para localizar contraseñas, códigos de acceso o números de referencia plantados en textos de más de 100 000 caracteres sin que se degraden.
- Procesamiento por lotes de corpus largos en servidores sin GPU dedicada: con `--o1-spill` sobre SSD, el modelo funciona con 2,2-3,0 GB de RAM para prompts de 16 000 a 64 000 tokens, lo que permite ejecutarlo en máquinas modestas con almacenamiento rápido.
- Resumen de artículos de Wikipedia o documentación técnica: la model card reporta respuestas reales de 400 tokens sobre resúmenes de artículos, con velocidades de 60,4 tok/s en prompts de 100 000 caracteres.
- Despliegue en portátiles Apple Silicon: en un MacBook Air M4 de 24 GB el proceso se mantiene en 6,3 GB junto a los pesos mapeados, útil para recuperar hechos plantados en 40 000 caracteres aunque a solo 4-5 tok/s.
- Automatización de atención al cliente con conversaciones multi-turno largas: la ventana exacta de 8192 tokens y el campo lejano permiten mantener historiales extensos sin que la memoria del dispositivo crezca con cada turno.
- Integración en pipelines Rust sin Python: el motor `cortiq` se instala con `cargo install cortiq-cli`, lo que facilita incorporar el modelo a servicios backend escritos en Rust sin dependencias de PyTorch.

## Benchmarks y rendimiento

Datos de la model card en RTX 5090 con Vulkan, comando `cortiq bench --core`, 60 tokens generados tras un prompt de la longitud indicada:

| Prompt (tokens) | Primer token, s (estándar) | Primer token, s (turbo) | Decodificación, tok/s (estándar) | Decodificación, tok/s (turbo) | Memoria pico, GB (estándar) | Memoria pico, GB (turbo) |
|---:|---:|---:|---:|---:|---:|---:|
| 1 000 | 2,2 | 2,2 | 105 | 105 | 14,5 | 14,4 |
| 4 000 | 8,8 | 8,8 | 104 | 104 | 14,9 | 14,8 |
| 16 000 | 42 | 47 | 87 | 92 | 16,5 | 15,5 |
| 32 000 | 107 | 92 | 71 | 91 | 18,5 | 15,7 |
| 64 000 | 316 | 177 | 51 | 92 | 22,8 | 15,7 |

Respuestas reales de 400 tokens (resumen de artículos de Wikipedia, con aproximadamente la mitad de los borradores aceptados):

| Prompt | Primer token, s (estándar) | Primer token, s (turbo) | Decodificación, tok/s (estándar) | Decodificación, tok/s (turbo) |
|---|---:|---:|---:|---:|
| 30 000 caracteres | 19,2 | 18,6 | 76,4 | 76,3 |
| 100 000 caracteres | 76,7 | 72,1 | 50,9 | 60,4 |

Con presupuesto de 16 GB (`CMF_GPU_VRAM_MB=15000`) en la misma RTX 5090: sellado a 4096 filas, 15,0 GB estables, primer token de 43 s a 16 000 tokens, 87 s a 32 000 y 176 s a 64 000, con 92 tok/s de decodificación. En MacBook Air M4 de 24 GB con Metal: 6,3 GB de proceso a 16 000 tokens, primer token de 545 s y 4 tok/s de decodificación; los borradores no compensan (4,6 tok/s con ellos frente a 4,9 sin ellos).

Calidad: perplejidad en las filas posteriores al sellado, dos ventanas de 16 384 tokens de Wikipedia: 4,76 con atención exacta y 4,97 con campo lejano. Un campo lejano sin filas exactas encuentra 0 de 4 hechos plantados.

## Requisitos de hardware

- VRAM estimada: 14,4-15,7 GB en RTX 5090 con backend Vulkan para prompts de 1 000 a 64 000 tokens; 15,0 GB estables con presupuesto de 16 GB configurado mediante `CMF_GPU_VRAM_MB=15000`.
- GPU recomendadas: RTX 5090 (probada); cualquier GPU con soporte Vulkan y al menos 16 GB de VRAM para el modo con sellado a 4096 filas. El autor advierte que una tarjeta real de 16 GB tiene menos núcleos de shader, por lo que la velocidad será inferior a la misma memoria.
- GPU de consumo: sí, cabe en tarjetas de 16 GB; en tarjetas con menos memoria no hay datos disponibles.
- Memoria host: 4,4 GB de RAM a 16 000 tokens, 7,0 GB a 32 000 y 13,2 GB a 64 000; con `--o1-spill` se reduce a 2,2-3,0 GB de RAM usando 4,7-18,7 GB de disco.
- Almacenamiento: con un SSD de 4,5 GB/s de escritura y 5,2 GB/s de lectura la velocidad es la misma que en RAM.
- Opciones de despliegue: `cortiq` 0.8.58 o superior (instalable con `cargo install cortiq-cli` o mediante binarios precompilados en la página de releases); no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: primer token de 2,2 s a 1 000 tokens y 177 s a 64 000 tokens en RTX 5090; decodificación de 92-105 tok/s en GPU y 4-5 tok/s en MacBook Air M4.
- Ahorro de memoria: en MacBook Air M4 de 24 GB el proceso se mantiene en 6,3 GB junto a los pesos mapeados, con un primer token de 545 s a 16 000 tokens.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Motor | Disponibilidad |
|---|---|---|---|---|---|---|
| Qwen3.8-27B-Turbo-cmf | 27 000 M | 64 000 tokens documentados | 4 bits (q4tp, CMF) | Apache 2.0 | cortiq (Rust, Vulkan) | Hugging Face, 0 descargas, 1 like |
| Qwen3.8-27B-cmf (estándar) | 27 000 M | atención exacta a cualquier longitud | 4 bits (CMF) | Apache 2.0 | cortiq | Hugging Face (referenciado en la model card) |
| Qwen3.8-27B (base) | 27 000 M | no disponible | pesos originales | Apache 2.0 | no disponible | Hugging Face (Qwen/Qwen3.8-27B) |

No se dispone de datos de benchmarks de modelos alternativos de otros fabricantes en la información proporcionada, por lo que la comparación se limita a las variantes del mismo modelo base.

## Limitaciones y advertencias

- El campo lejano solo funciona en Vulkan; el resto de backends no está documentado en la información disponible.
- La ventana de atención exacta se limita a 8192 tokens (4096 en tarjetas de 16 GB); más allá, la perplejidad sube de 4,76 a 4,97 en las pruebas realizadas.
- Un campo lejano sin filas exactas pierde por completo los datos plantados (0 de 4 encontrados), por lo que el mecanismo de selección de 248 filas es crítico para la fiabilidad.
- En Mac con Metal el modelo decodifica a 4-5 tok/s independientemente de la longitud, limitado por la velocidad matricial; los borradores especulativos no aportan y se desactivan.
- El rendimiento en una GPU real de 16 GB será inferior al medido con presupuesto simulado en una RTX 5090, ya que las tarjetas de 16 GB tienen menos núcleos de shader.
- El repositorio tiene 0 descargas y 1 like en el momento de la consulta, lo que indica una validación comunitaria muy limitada.
- No se han publicado datos sobre sesgos, riesgo de alucinación ni evaluación de seguridad en la información disponible.
- La licencia Apache 2.0 permite uso comercial, pero el mecanismo de campo lejano está sujeto a una solicitud de patente (nº 19/738,763) cuyo alcance no se detalla.
- Los idiomas declarados son solo inglés, ruso y chino; no hay soporte documentado de español.
- El modelo depende de una herramienta específica (`cortiq` 0.8.58 o superior) y de un formato propietario (CMF), lo que limita la portabilidad frente a GGUF o safetensors.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/infosave/Qwen3.8-27B-Turbo-cmf
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Variante estándar: https://huggingface.co/infosave/Qwen3.8-27B-cmf
- Repositorio del motor CMF: https://github.com/infosave2007/cmf
- Binarios precompilados de cortiq: https://github.com/infosave2007/cmf/releases
