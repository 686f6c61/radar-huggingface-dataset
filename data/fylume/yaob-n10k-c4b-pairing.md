# fylume/yaob-n10k-c4b-pairing

## Resumen

Yaob Next (N10K-C4B) 0.2.0 es un artefacto de "emparejamiento" (pairing) publicado por Fylume que no contiene pesos de un modelo de lenguaje entrenado por el propio autor, sino la composicion empaquetada de una red de conocimiento estructurada (N10K, con 10.167 nodos y 105.888 relaciones en 19 MPN) con un nucleo linguistico externo: Qwen3.5-4B de Alibaba Cloud, cuantizado en Q8_0. El identificador N10K-C4B designa precisamente esa combinacion: N10K es la red y C4B el nucleo de 4.000 millones de parametros. La red y el nucleo son independientes y sustituibles por separado.

El unico componente entrenado por Fylume es un router de 3.140.787 parametros que decide que nodos de la red se activan para cada consulta, entrenado con el encoder Qwen3-Embedding-0.6B congelado. El modelo se distribuye como un fichero `.mpn` de 6.635.995.615 bytes que se ejecuta con MPN Studio, exponiendo un endpoint compatible con la API de OpenAI. Se trata, por tanto, de una propuesta de recuperacion aumentada estructurada con citas a nodos, no de un LLM generativo nuevo.

Su relevancia es experimental: demuestra un patron de composicion modular (red + encoder + nucleo + router) con verificacion criptografica de cada miembro y ofrece metricas de ejecucion concretas en hardware consumer y de estacion de trabajo. La calidad declarada por el autor es de 228 aciertos sobre 236 tareas retenidas (97 %), aunque con advertencias explicitas sobre el sesgo de ese conjunto de evaluacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red de nodos estructurada (N10K) + router de 3,1 M de parametros + nucleo transformer denso Qwen3.5-4B + encoder Qwen3-Embedding-0.6B |
| Parametros totales | Nucleo: 4.000 millones (Qwen3.5-4B); router: 3.140.787; encoder: 0,6 mil millones |
| Parametros activos | No es MoE; no disponible |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Nucleo en Q8_0 (`Qwen3.5-4B-Q8_0.gguf`); proyector en F16; encoder en F16 |
| Idiomas soportados | Solo ingles (declarado y probado unicamente en ingles) |
| Licencia | Compuesta: red CC BY-SA 4.0 (hechos Wikidata CC0); nucleo y encoder Apache-2.0; pesos del router bajo Fylume Source-Available Terms 1.0 |
| Formato de pesos | GGUF (componentes) empaquetados en un fichero `.mpn`; manifiesto `fylume-release.json` |

## Arquitectura y entrenamiento

El sistema no entrena un modelo de lenguaje. El nucleo es Qwen3.5-4B (commit `851bf6e8`) de Alibaba Cloud, convertido y cuantizado a Q8_0 sin fine-tuning por parte de Fylume; el proyector multimodal se distribuye en F16. El encoder es Qwen3-Embedding-0.6B, tambien de Alibaba, convertido y congelado. La red N10K contiene 10.167 nodos (10.007 en uso y 160 canarios diagnosticos inventados) y 105.888 relaciones organizadas en 19 MPN, almacenada como SQLite de 110.870.528 bytes con SHA-256 `deeb2437413f7a81bfb1a11135b857acdea8e7f7bcd9ed4d2d5ce3ed0b2b3b9f`, en revision 40.

El unico componente aprendido por Fylume es el router (checkpoint `ck-261111-200127-6f01ff`), entrenado especificamente con el encoder Qwen3-Embedding-0.6B y funcional solo con el. En tiempo de inferencia, el router selecciona nodos de la red relevantes para la consulta, el nucleo genera la respuesta condicionada por esa recuperacion y el resultado incluye citas a nodos (`[1]`). El artefacto probado es `Yaob-Next-N10K-C4B-0.2.0.mpn`, con verificacion de checksums de todos sus miembros (`mpn verify`: "All members match their checksums").

## Capacidades

- Generacion de texto en ingles con recuperacion estructurada y citas explicitas a nodos de la red.
- Respuesta a preguntas factuales apoyada en la red N10K (por ejemplo, capitales de paises con cita al nodo correspondiente).
- Calculo aritmetico dentro de conversaciones multi-turno (verificado en la prueba Semechka).
- Rechazo de premisas inventadas: el modelo declino responder sobre un pueblo ficticio en la prueba de cinco turnos.
- Seguimiento de conversacion multi-turno con preguntas de seguimiento.
- Servicio mediante endpoint compatible con la API de OpenAI (`/v1/chat/completions`, model id `yaob-next-n10k-c4b`).
- Intercambiabilidad del nucleo: se probo a sustituir Qwen3.5-4B por Qwen3-4B-Instruct-2507 Q8_0 manteniendo la misma red (mismo `net_hash`).
- No dispone de tool calling, function calling ni capacidades de agente declaradas; no disponible.
- Sin soporte multimodal declarado pese a incluir el proyector F16 del nucleo; no disponible como capacidad verificada.

## Casos de uso

- Asistentes de preguntas factuales con trazabilidad: el modelo cita el nodo concreto que respalda cada respuesta, lo que permite auditar la fuente en dominios donde la justificacion es obligatoria (por ejemplo, atencion interna sobre datos curados).
- Base de conocimiento conversacional: la red N10K se puede reemplazar por otra red manteniendo el nucleo, de modo que una organizacion puede actualizar su grafo de conocimiento sin reentrenar el LLM.
- Prototipado de sistemas RAG estructurados: sirve como referencia funcional de arquitectura router + red + LLM con verificacion de integridad de cada componente por hash, util para equipos que disenan pipelines de recuperacion.
- Despliegue en hardware de gama media: con 7.365 MiB de pico de memoria GPU y 14,4 a 14,8 tokens/s en un DGX Spark, es viable en estaciones con GPU de 8-12 GB para cargas de baja concurrencia.
- Evaluacion comparativa de nucleos: al ser el nucleo intercambiable, permite medir el efecto de distintos LLM (Qwen3.5-4B frente a Qwen3-4B-Instruct-2507) sobre la misma red y el mismo router.
- Entornos de investigacion sobre modularidad: el manifiesto `fylume-release.json` y la verificacion por checksums facilitan reproducir la composicion exacta en laboratorio y experimentar con sustituciones controladas.
- Servicio local en CPU: con 2,4 a 2,5 tokens/s y arranque en 8,1 s, es adecuado para pruebas de integracion o demostraciones sin GPU, no para produccion interactiva.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Calidad en 236 tareas retenidas (suite seed 20261111, RTX 4060 Ti, paquete de release 0.2.0) | 228 correctas (97 %; intervalo Wilson 95 %: 94-98) |
| Misma suite, release 0.2.1 en DGX Spark | 228 de 236 |
| Nucleo solo (Qwen3.5-4B) | 102 de 236 (43 %) |
| Recuperacion plana (plain retrieval) | 198 de 236 (84 %) |
| Yaob 0.1.0 | 211 de 236 (89 %) |
| Arranque en CUDA (DGX Spark, GB10) | 10,6 s |
| Throughput en CUDA | 14,4 a 14,8 tokens/s |
| Memoria GPU pico | 7.365 MiB |
| Memoria de proceso pico | 3,1 GB |
| Arranque en CPU | 8,1 s |
| Throughput en CPU | 2,4 a 2,5 tokens/s |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. El autor advierte que la suite de 236 tareas fue escrita por el mismo equipo, es pequena y el bucle final se fijo tras leer los fallos de la primera ejecucion, por lo que no es completamente ciega.

## Requisitos de hardware

- VRAM estimada: aproximadamente 7.365 MiB de pico medidos en CUDA con el nucleo Q8_0 y el proyector F16; el fichero completo `.mpn` ocupa 6,64 GB.
- GPU verificadas: NVIDIA GB10 (DGX Spark, arm64) para build y ejecucion; RTX 4060 Ti para la evaluacion de calidad; RTX 4060 Ti y DGX Spark para la release 0.2.1.
- Cabe en GPU consumer de 8-12 GB de VRAM; el pico medido es compatible con una RTX 4060 Ti.
- Despliegue mediante MPN Studio 0.2.0 o 0.5.0 (comandos `mpn verify`, `mpn run`, `mpn model build`, `mpn model export`), con backend Python propio y llama.cpp b12318 en el paquete de release.
- Endpoint compatible con la API de OpenAI en el puerto configurado (por ejemplo, 8861).
- Latencia y throughput: 14,4-14,8 tokens/s en CUDA (GB10) y 2,4-2,5 tokens/s en CPU; arranque de 10,6 s en CUDA y 8,1 s en CPU.
- No probado: Vulkan, CPU x86 mediante `mpn run`, Windows y macOS (no existen paquetes).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Yaob Next (N10K-C4B) 0.2.0 | Nucleo 4 B + router 3,1 M + red de 10.167 nodos | No disponible | Recuperacion estructurada con citas sobre red curada | Compuesta (CC BY-SA 4.0, Apache-2.0, Source-Available para router) | Hugging Face (manifiesto) y release en GitHub |
| Qwen3.5-4B (nucleo) | 4 B | No disponible | LLM denso generativo | Apache-2.0 | Hugging Face |
| Qwen3-4B-Instruct-2507 Q8_0 | 4 B | No disponible | LLM denso generativo, usado como nucleo alternativo probado | No disponible en la informacion | No disponible en la informacion |
| Yaob 0.1.0 | No disponible | No disponible | Version anterior del sistema Yaob | No disponible | No disponible |

La comparacion directa con LLM generativos de 4 B no es homogenea: Yaob Next no es un modelo entrenado, sino una composicion que depende de un LLM externo. En la suite propia del autor, la composicion alcanza 228 de 236 frente a 102 del nucleo solo y 211 de Yaob 0.1.0.

## Limitaciones y advertencias

- Solo se ha probado en ingles; no hay evidencia de funcionamiento en otros idiomas.
- La evaluacion de calidad la diseno el mismo equipo, con 236 tareas y ajuste del bucle final tras ver los fallos de la primera ejecucion; no es un benchmark ciego ni independiente.
- Riesgo de alucinacion no cuantificado fuera de la suite propia; el mecanismo de citas mitiga pero no elimina respuestas incorrectas.
- Sesgos: la red se apoya en hechos de Wikidata (CC0), con los sesgos y lagunas de cobertura de esa fuente; no se documentan evaluaciones de sesgo.
- Licencia compuesta con restricciones: los pesos del router estan bajo Fylume Source-Available Terms 1.0, no bajo una licencia de codigo abierto; la red es CC BY-SA 4.0 (con obligacion de compartir igual) y el nucleo y encoder son Apache-2.0. El uso comercial requiere revisar cada componente por separado.
- El router funciona exclusivamente con el encoder Qwen3-Embedding-0.6B con el que fue entrenado; sustituir el encoder invalida el router.
- No hay paquetes para Windows ni macOS; Vulkan y CPU x86 mediante `mpn run` no estan probados.
- El `.mpn` no se ha probado tras descargarlo desde GitHub en una segunda maquina (solo verificado por hash y `mpn verify`).
- El repositorio de Hugging Face no contiene pesos ni datos, solo el manifiesto de emparejamiento; la descarga del artefacto se realiza desde la release de GitHub.
- No hay informacion sobre tool calling, agentes, contexto maximo ni soporte multimodal verificado.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/fylume/yaob-n10k-c4b-pairing
- Red N10K: https://huggingface.co/fylume/yaob-next-n10k
- Nucleo cuantizado: https://huggingface.co/fylume/qwen3.5-4b-q8_0-gguf
- Encoder: https://huggingface.co/fylume/qwen3-embedding-0.6b-f16-gguf
- Modelo original del nucleo: https://huggingface.co/Qwen/Qwen3.5-4B
- Release del artefacto `.mpn` (GitHub, `v0.2.0` de `sarja-technologies/yaob`): https://github.com/sarja-technologies/yaob
