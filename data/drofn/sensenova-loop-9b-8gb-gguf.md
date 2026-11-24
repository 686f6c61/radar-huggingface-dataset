# drofn/SenseNova-Loop-9B-8GB-GGUF

## Resumen

SenseNova-Loop-9B es un modelo de lenguaje decoder-only de aproximadamente 9.000 millones de parametros desarrollado por SenseNova, que introduce una innovacion estructural notable: un bloque de capas "looped" (recurrente en profundidad). Almacena 32 capas de decoder pero ejecuta las capas 4 a 27 dos veces por token, lo que resulta en 56 ejecuciones de capa por pasada forward. Esta ficha describe la cuantizacion GGUF realizada por el usuario drofn, optimizada especificamente para GPUs de 8 GB de VRAM mediante asignacion de bits por grupo de tensores segun sensibilidad medida.

La relevancia de esta publicacion radica en su enfoque de cuantizacion mixta: en lugar de aplicar un esquema uniforme como Q4_K_M, distribuye el presupuesto de bits entre 14 grupos de tensores (y el bloque loop dividido en tres bandas) segun la divergencia KL medida contra Q8_0. El resultado es un archivo de 5,54 GB que ofrece menor divergencia KL que un Q4_K_M estandar con la misma imatrix, y permite contextos de hasta 104.704 tokens en una tarjeta de 8 GB.

El modelo base soporta contexto de 512K tokens (con YaRN x2), usa atencion hibrida (tres capas de Gated DeltaNet por cada capa de atencion completa) y un vocabulario de 248.320 tokens. Esta version GGUF es solo texto (sin proyector de vision) y requiere una compilacion parcheada de llama.cpp, ya que la arquitectura `sensenova_loop` no estaba soportada en el upstream a fecha de la publicacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con bloque de capas looped y atencion hibrida (Gated DeltaNet + atencion completa) |
| Parametros totales | 8.956.949.376 (~8,96B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 512K en el modelo base (YaRN x2); en estos GGUF: hasta 132.864 tokens (128K), 104.704 (100K) o 38.400 (32K-HQ) segun archivo y VRAM |
| Tipos de cuantizacion | GGUF mixta (asignacion de bits por grupo de tensores); variantes 8GB-128K, 8GB-100K y 8GB-32K-HQ; KV cache configurable (f16, q8_0, q4_0) |
| Idiomas soportados | Ingles, chino, turco |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo base es un decoder de ~9B parametros con un diseno de profundidad recurrente: almacena 32 capas pero ejecuta las capas 4 a 27 dos veces por token, logrando 56 ejecuciones de capa por pasada forward sin incrementar el numero de parametros. El flujo residual utiliza hyper-conexiones de doble corriente restringidas a variedad (mHC, manifold-constrained hyper-connections), con enrutamiento normalizado mediante 20 iteraciones de Sinkhorn. La atencion es hibrida: cada grupo de cuatro capas contiene tres capas de atencion lineal (Gated DeltaNet) y una capa de atencion completa. La atencion completa usa 16 cabezas de query, 4 cabezas KV y head_dim de 256.

El vocabulario es de 248.320 tokens y el contexto nativo alcanza 512K tokens mediante YaRN x2. El modelo original acepta entrada de imagen, pero estas cuantizaciones GGUF son solo texto y no incluyen proyector de vision (mmproj). No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO, por lo que estos datos se consideran no disponibles.

La innovacion de esta publicacion concreta es el metodo de cuantizacion: se midio la sensibilidad de 14 grupos de tensores (y del bloque loop en tres bandas) cuantizando cada uno de forma independiente y evaluando la divergencia KL contra Q8_0, asignando el presupuesto de bits en consecuencia. El archivo 8GB-100K tiene un tamano de 5,54 GB y una KLD media de 0,0703 / 0,0762 (conjuntos de prueba 1 y 2), frente a 0,1064 / 0,1235 de un Q4_K_M con la misma imatrix.

## Capacidades

- Generacion de texto conversacional y continuacion de contexto largo (hasta 104.704 tokens en el archivo 8GB-100K).
- Razonamiento multi-paso y tareas de recuperacion de informacion en contextos extensos (haystacks).
- Capacidades multilingues en ingles, chino y turco.
- Seguimiento de instrucciones de formato dadas en el system prompt (con degradacion observada al usar KV cache q4_0 en contexto largo).
- El modelo base acepta imagenes, pero estas cuantizaciones GGUF no incluyen soporte de vision.
- No se documenta en la informacion disponible soporte explicito de tool calling, function calling ni modo "thinking".

## Casos de uso

- Analisis de documentos extensos: con 104.704 tokens de contexto en el archivo 8GB-100K, se puede procesar un libro tecnico o un expediente completo en una sola pasada en una GPU de 8 GB, sin necesidad de fragmentacion.
- Recuperacion de informacion en corpus largos: las pruebas de haystack del autor (6 haystacks por tarea) muestran que el modelo localiza codigos concretos en contextos de ~31K tokens con KV cache f16, q8_0 y q4_0.
- Asistentes conversacionales multi-turno en hardware de consumo: el archivo 8GB-32K-HQ (7,02 GB) ofrece la mayor fidelidad respecto a Q8_0 (KLD 0,0182 / 0,0245) para dialogos de hasta 38.400 tokens en una RTX 4060 sin pantalla conectada.
- Procesamiento de texto en chino e ingles: el soporte nativo de ambos idiomas permite tareas de traduccion, resumen y analisis bilingue sin modelos adicionales.
- Despliegue local con privacidad de datos: al ejecutarse integramente en GPU local (solo la tabla de embeddings queda en RAM del sistema), es adecuado para entornos donde los datos no pueden salir del equipo.
- Investigacion sobre cuantizacion: la metodologia de asignacion de bits por sensibilidad y los datos de KLD publicados sirven como referencia para estudiar el impacto de la cuantizacion mixta en arquitecturas con capas recurrentes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. Los unicos datos cuantitativos son de calidad de cuantizacion y velocidad:

| Metrica | 8GB-128K | 8GB-100K | 8GB-32K-HQ |
|---|---|---|---|
| Tamano del archivo | 4,97 GB | 5,54 GB | 7,02 GB |
| Contexto estimado (`llama-fit-params`) | 132.864 tokens | 104.704 tokens | 38.400 tokens |
| KLD media vs Q8_0 (conjunto 1 / 2) | 0,1375 / 0,1213 | 0,0703 / 0,0762 | 0,0182 / 0,0245 |

Referencia de comparacion: un Q4_K_M con la misma imatrix presenta KLD de 0,1064 / 0,1235 y encaja 94.464 tokens en la misma tarjeta de 8 GB. En la version v2 (con cabeza MTP) se reporta una generacion aproximadamente 1,85x mas rapida en una RTX 4060 con `--spec-type draft-mtp`.

## Requisitos de hardware

- VRAM estimada: 8 GB para los tres archivos (4,97-7,02 GB de pesos mas KV cache); solo la tabla de embeddings de tokens permanece en RAM del sistema.
- GPUs objetivo: tarjetas NVIDIA de 8 GB (el autor cita explicitamente la RTX 4060); tambien valido en GPUs de mayor VRAM, donde se podria ampliar el contexto.
- Cabe en GPU de consumo: si, en modelos de 8 GB sin pantalla conectada (los valores de contexto se estiman con `llama-fit-params` en esas condiciones).
- Despliegue: requiere una compilacion parcheada de llama.cpp (fork del autor); el upstream, LM Studio y Ollama no soportaban la arquitectura `sensenova_loop` a fecha de 2026-11-19 (issue ggml-org/llama.cpp#31571). La escalera completa de cuantizaciones en formato upstream esta en otro repositorio (drofn/SenseNova-Loop-9B-GGUF) y necesita la build del PR #32588.
- Latencia y throughput: no se publican cifras absolutas de tokens por segundo; solo la mejora relativa de ~1,85x con cabeza MTP en la version v2 sobre RTX 4060.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Calidad de cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SenseNova-Loop-9B-8GB-100K (esta ficha) | ~8,96B | 104.704 tokens en 8 GB | KLD 0,0703 / 0,0762 vs Q8_0 | Apache 2.0 | GGUF en HF, requiere fork parcheado |
| SenseNova-Loop-9B Q4_K_M (misma imatrix) | ~8,96B | 94.464 tokens en 8 GB | KLD 0,1064 / 0,1235 vs Q8_0 | Apache 2.0 | GGUF estandar |
| SenseNova-Loop-9B-8GB-v3 (mismo autor) | ~8,96B | 104.448 tokens en 8 GB | ~20% menor KLD que v2; cabeza MTP; vision opcional | Apache 2.0 | GGUF en HF |
| AtomicChat AD-Q4_K_M (citado por el autor) | ~8,96B | No disponible | Tan cercano o mas a Q8_0 que v3 | No disponible | GGUF en HF |

No se dispone de datos de benchmarks de tarea que permitan comparar el rendimiento bruto frente a otros modelos de ~9B de la competencia.

## Limitaciones y advertencias

- Solo texto: estas cuantizaciones no incluyen proyector de vision, aunque el modelo base acepta imagenes.
- Compatibilidad restringida: los archivos no cargan en llama.cpp upstream, LM Studio ni Ollama; requieren un fork parcheado concreto.
- Idiomas limitados a ingles, chino y turco; el rendimiento en castellano no esta documentado.
- Riesgo de alucinacion inherente a modelos de ~9B, no cuantificado en la informacion disponible.
- La cuantizacion introduce degradacion medible (KLD de hasta 0,1375 en el archivo 128K); el seguimiento de instrucciones en contexto largo se degrada con KV cache q4_0 (9/18 haystacks frente a 13/18 con f16), aunque el autor lo presenta como indicio, no como diferencia probada.
- El archivo 8GB-100K se describe como superado por la version v3 del mismo autor; conviene evaluar v3 para nuevos despliegues.
- Licencia Apache 2.0 permite uso comercial, pero debe verificarse la licencia del modelo base y el cumplimiento de sus terminos.
- No se documentan sesgos especificos ni datos de entrenamiento, lo que dificulta evaluar riesgos de sesgo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/drofn/SenseNova-Loop-9B-8GB-GGUF
- Modelo base: https://huggingface.co/sensenova/SenseNova-Loop-9B
- Version recomendada v3: https://huggingface.co/drofn/SenseNova-Loop-9B-8GB-v3-GGUF
- Version v2: https://huggingface.co/drofn/SenseNova-Loop-9B-8GB-v2-GGUF
- Version para 6 GB: https://huggingface.co/drofn/SenseNova-Loop-9B-6GB-GGUF
- Escalera completa de cuantizaciones: https://huggingface.co/drofn/SenseNova-Loop-9B-GGUF
- Coleccion de todas las versiones: https://huggingface.co/collections/drofn/sensenova-loop-9b-gguf-for-6-8-gb-gpus-6aff1a746c005b20c4230d30
- PR de llama.cpp con soporte upstream: https://github.com/ggml-org/llama.cpp/pull/32588
- Issue de soporte de arquitectura: https://github.com/ggml-org/llama.cpp/issues/31571
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
