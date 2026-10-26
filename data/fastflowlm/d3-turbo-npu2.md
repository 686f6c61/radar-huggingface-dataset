# FastFlowLM/D3-Turbo-NPU2

## Resumen

D3-Turbo-NPU2 es un paquete de despliegue del modelo de decisión D3-Turbo (Decision 3.0, `vllm-sr/d3-turbo` v1.1, commit `689b3af1`) de vLLM Semantic Router, adaptado por FastFlowLM para ejecutarse en las NPU XDNA 2 de los procesadores AMD Ryzen AI. No es un modelo de chat generativo: es un modelo de clasificación y decisión de tipo *System One* que recibe un estado (texto, imágenes o vídeo) y responde preguntas estructuradas sobre él — elección entre opciones, sí/no, puntuaciones, cajas delimitadoras (`box`) y seguimiento por fotogramas (`track`) — devolviendo una probabilidad por cada opción.

El modelo base es multimodal, con 27B parámetros en la torre de texto Qwen3.5-27B y una torre de visión afinada de 27 capas, 1152 de anchura y 5120 de salida. FastFlowLM ha cuantizado la torre de texto a su formato Q4NX (proyecciones Q4_K con redondeo calibrado por GPTQ secuencial sobre las 64 capas y 400 tensores; embeddings Q8_0; normas y parámetros `alpha`/`beta` de Gated DeltaNet en BF16) y la torre de visión a Q4_K. El resultado ocupa 16,6 GB en disco y unos 17,9 GB residentes.

Su relevancia práctica está en dos puntos: la API `POST /v1/systemone` permite formular muchas preguntas sobre un mismo estado leyéndolo una sola vez ("ask once, answer many"), con hasta 32.768 tokens de entrada por pregunta, y todo el cómputo ocurre en la NPU local sin GPU dedicada ni nube. Es un modelo recién publicado (26 de octubre de 2026) sin descargas ni validación comunitaria todavía.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido multimodal heredado de Qwen3.5-27B: torre de texto de 64 capas con atención `prefix_bidir` y capas Gated DeltaNet causales, más torre de visión de 27 capas (1152 de anchura, 5120 de salida); cabeza de decisión (`readout.safetensors` + `decision_config.json`) para salida estructurada |
| Parametros totales | 27B en la torre de texto; número de parámetros de la torre de visión no disponible |
| Parametros activos | No aplicable (no se indica que sea un modelo MoE) |
| Longitud de contexto | 32.768 tokens por pregunta en este paquete; `long_context=True` (hasta 131.072 tokens en el modelo upstream) no está soportado y se rechaza con HTTP 422 |
| Tipos de cuantizacion | Formato Q4NX: proyecciones Q4_K con redondeo calibrado por GPTQ, embeddings de token Q8_0, normas y parámetros `alpha`/`beta` de Gated DeltaNet en BF16, torre de visión Q4_K |
| Idiomas soportados | No disponible (la model card no declara lista de idiomas) |
| Licencia | Apache-2.0 |
| Formato de pesos | Q4NX (`vision_weight.q4nx` y pesos de la torre de texto) más `readout.safetensors`, `tokenizer.json`, `tokenizer_config.json`, `decision_config.json`, `chat_template.jinja` |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen3.5-27B aplicada a decisión: 64 capas en la torre de texto que combinan atención con máscara `prefix_bidir` y capas Gated DeltaNet (estado recurrente) que permanecen causales. La máscara `prefix_bidir` define el comportamiento clave: el bloque de estado atiende de forma bidireccional a sí mismo, y cada bloque de pregunta atiende al estado y a sí mismo, pero nunca al revés. El motor ejecuta el estado una sola vez y procesa los bloques de pregunta contra las claves/valores y el estado recurrente ya cacheados, de modo que la respuesta de una pregunta no depende de las demás preguntas de la misma petición. `usage.input_tokens` contabiliza el estado una vez más cada bloque de pregunta. La torre de visión procede del propio encoder de d3-turbo (difiere del de Qwen3.5-27B estándar en todos los tensores, por afinamiento) y se ejecuta sobre los kernels de visión de FastFlowLM.

Este repositorio no entrena un modelo nuevo: es un port y una cuantización. El GPTQ secuencial se aplicó sobre las 64 capas y 400 tensores, con un conjunto de calibración de 300 preguntas sintéticas de tipo System One de hasta 2k tokens generadas con la máscara `prefix_bidir` del modelo y sin muestras del Decision Index. Los ficheros `readout.safetensors`, `decision_config.json`, `tokenizer.json`, `tokenizer_config.json`, `chat_template.jinja` y `LICENSE` son idénticos byte a byte a los upstream (verificables con `MANIFEST.sha256`); `NOTICE` añade la declaración de modificación. No se dispone de información sobre el corpus de preentrenamiento, el número de tokens, ni sobre si hubo RLHF o DPO en el modelo base.

## Capacidades

- Clasificación zero-shot con salida probabilística: preguntas de tipo `choice` (una probabilidad por cada opción definida en `criteria`), `noul` (sí/no) y `score`, sobre texto.
- Entrada multimodal: imágenes en el estado como data URLs base64 (PNG, JPEG o WebP, máximo 8 MB y 16 MP por imagen, reescaladas a 1,6 MP como máximo), varias imágenes por petición y compartidas por todas las preguntas.
- Vídeo en el estado: 2 fotogramas por segundo, entre 4 y 32 fotogramas, 0,2 MP por fotograma como máximo, hasta 60 s y 16.384 tokens de visión por petición. La decodificación de mp4/webm/mkv/mov/gif requiere las bibliotecas compartidas de FFmpeg; las listas de fotogramas (`{"frames": [...]}`) siempre funcionan.
- Localización visual: preguntas `box` que devuelven una caja con confianza calibrada, opcionalmente en un instante concreto del vídeo mediante `at`.
- Seguimiento temporal: preguntas `track` que devuelven una caja por momento a lo largo de un vídeo, con 1 o 2 actualizaciones por segundo y un máximo de 256 momentos por petición (`D3_MOMENT_ROWS`).
- Imágenes dentro de `assets`: en el estado, en las instrucciones de una pregunta o en sus opciones.
- Modo "ask once, answer many": una lectura del estado por petición y respuestas independientes para cada pregunta, con menor coste que una petición por pregunta.
- Descubrimiento de capacidades en tiempo de ejecución mediante `GET /v1/systemone/models`, que lista exactamente lo que acepta la build en marcha.
- Tool calling / function calling: no documentado en la información disponible.
- Modo *thinking*, audio, generación libre de texto o razonamiento multi-paso: no documentados; el modelo es un decisor, no un generador.

## Casos de uso

- Enrutamiento semántico de tickets de soporte: una única petición con el texto del ticket como estado y varias preguntas `choice` (por ejemplo `returns`, `billing`, `general`) devuelve la probabilidad de cada ruta. Al leer el estado una sola vez, evaluar cinco rutas cuesta mucho menos que cinco peticiones independientes.
- Pasarela de decisión delante de un LLM de chat: `flm serve qwen3.5:9b --decision d3:turbo` permite clasificar la consulta en la NPU antes de invocar el modelo grande, reservando el chat para los casos que realmente lo requieren.
- Moderación y cumplimiento de políticas: preguntas `noul` independientes, una por política, sobre el mismo estado; la independencia entre preguntas permite auditar cada criterio por separado y con una probabilidad explícita.
- Reranking y scoring de relevancia: el estado es la consulta y cada documento candidato se formula como pregunta `score`, todo en una petición de hasta 32.768 tokens de estado.
- Verificación de daños en devoluciones o control de calidad industrial: preguntas `box` sobre fotografías del producto para localizar el defecto con confianza calibrada, ejecutadas en local sin enviar imágenes a la nube.
- Análisis de clips cortos de vídeo: `track` sobre grabaciones de hasta 60 s con 1 o 2 actualizaciones por segundo (máximo 256 momentos) para seguimiento de objetos en inspección o análisis deportivo.
- Procesamiento de documentos con imágenes en el borde: formularios, facturas o albaranes enviados como `assets` junto a preguntas de tipo `score` o `noul`, con el dato sin salir del portátil o mini-PC con Ryzen AI.
- Clasificación por lotes de baja latencia en escritorio: los hermanos pequeños `d3:lite` (0,8B), `d3:nano` (2B) y `d3:mini` (4B) responden una pregunta corta en menos de un segundo, mientras que `d3:turbo` tarda unos segundos y se reserva para casos que exigen más precisión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card incluye un apartado titulado "Accuracy (against the upstream BF16 model)", pero los valores no estaban incluidos en la información proporcionada, por lo que no se reproduce ninguna cifra. Tampoco hay datos de MMLU, HumanEval, GSM8K ni de calibración de las probabilidades o de las confianzas de las cajas.

## Requisitos de hardware

- Acelerador: NPU XDNA 2 de un procesador AMD Ryzen AI (el paquete se probó en una máquina Strix Halo). No se documenta ninguna ruta de ejecución en GPU CUDA ni en CPU.
- Software: Linux con la pila XRT y FastFlowLM 1.0.11 o superior. Carga con `flm pull d3:turbo` (16,6 GB) y servicio con `flm serve --decision d3:turbo`.
- VRAM: no aplica en el sentido habitual; al ser una APU con memoria unificada, el modelo consume memoria del sistema. Ocupa unos 17,9 GB residentes tras la carga.
- Memoria medida del proceso servidor (pico residente, una petición): 17,4 GB con prompts de hasta 4k tokens, 22,4 GB a 24k y 26,3 GB a 32.768 tokens. El catálogo de FLM reserva 26 GB de huella más 8,6 GB de memoria *scratch* bloqueada.
- Sistema recomendado: 32 GB o más de RAM; todas las mediciones proceden de una máquina de 128 GB y no se probaron equipos más pequeños. El autor desaconseja ejecutarlo junto a otros modelos grandes.
- Tiempo de carga: unos 8 s del motor con los ficheros en la caché de página; `flm serve` verifica antes los 16,6 GB de ficheros contra sus hashes (76 s), por lo que está listo unos 85 s después del arranque.
- Latencia: el autor indica "unos segundos" por petición para `d3:turbo`, frente a menos de un segundo para `d3:lite`, `d3:nano` y `d3:mini`. No se publican cifras de throughput ni de latencia por token.
- Opciones de despliegue: exclusivamente FastFlowLM con la API `POST /v1/systemone` y `GET /v1/systemone/models`. No se mencionan vLLM, llama.cpp, Ollama ni TGI para este paquete.
- Requisito adicional para vídeo: bibliotecas compartidas de FFmpeg instaladas en la máquina; sin ellas la petición se rechaza con HTTP 422.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato / cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| D3-Turbo-NPU2 (este paquete) | 27B (torre de texto) + torre de visión | 32.768 tokens por pregunta | Q4NX: Q4_K (GPTQ calibrado), Q8_0, BF16 | Apache-2.0 | HuggingFace; `flm pull d3:turbo` |
| vllm-sr/d3-turbo (upstream) | 27B multimodal | 32.768 tokens; hasta 131.072 con `long_context=True` | BF16 (referencia sin cuantizar) | Apache-2.0 (el `LICENSE` de este paquete es el upstream sin modificar) | HuggingFace |
| d3:mini | 4B | No disponible | No disponible | No disponible | Catálogo de FastFlowLM |
| d3:nano | 2B | No disponible | No disponible | No disponible | Catálogo de FastFlowLM |
| d3:lite | 0,8B | No disponible | No disponible | No disponible | Catálogo de FastFlowLM |

La comparación relevante es frente al upstream BF16: este paquete reduce el peso a 16,6 GB y lo hace ejecutable en NPU, a cambio de perder `long_context` (131.072 → 32.768 tokens) y de introducir la cuantización Q4_K/Q8_0. Los hermanos pequeños priorizan latencia (menos de un segundo por pregunta corta) frente a los "unos segundos" de `d3:turbo`. No se dispone de datos de benchmarks que permitan comparar la calidad entre ellos.

## Limitaciones y advertencias

- Dependencia de hardware muy restrictiva: solo NPU XDNA 2 de AMD Ryzen AI sobre Linux con XRT y FastFlowLM 1.0.11+; no hay ruta documentada para GPU NVIDIA/AMD discreta, CPU ni macOS.
- Consumo de memoria elevado: hasta 26,3 GB de pico residente con prompts de 32.768 tokens y una reserva de catálogo de 26 GB más 8,6 GB de scratch; no cabe en equipos de 16 GB y el autor recomienda 32 GB o más sin acompañarlo de otros modelos grandes.
- Contexto limitado a 32.768 tokens por pregunta; las peticiones con `long_context=True` se rechazan con HTTP 422 y los prompts más largos devuelven `max_length_exceeded` sin truncar, por lo que el cliente debe trocear la entrada.
- Arranque lento en frío: la verificación de hashes de los 16,6 GB añade unos 76 s, con unos 85 s hasta estar listo.
- No es un modelo generativo: no produce texto libre, tool calling ni razonamiento multi-paso; toda interacción debe encajar en el esquema de `choice`, `noul`, `score`, `box` o `track` de `/v1/systemone`.
- Ausencia de datos de precisión: la model card anuncia un apartado de exactitud frente al modelo BF16 upstream, pero no se han proporcionado cifras; la calibración declarada de las probabilidades y de las confianzas de las cajas no está validada de forma independiente.
- Idiomas no declarados: no hay lista de idiomas soportados ni evaluación multilingüe, por lo que la cobertura más allá del inglés queda sin verificar.
- Riesgo de alucinación en sentido estricto bajo (no genera texto), pero sí riesgo de clasificación errónea con confianza alta si la calibración se degrada fuera del dominio de calibración, que fueron 300 preguntas sintéticas de hasta 2k tokens.
- Sesgos: no se documenta ninguna evaluación de sesgos, toxicidad o equidad en la información disponible.
- Diferencia de tokenización conocida: FastFlowLM usa el `tokenizer.json` del modelo, mientras que el tokenizador de `transformers` upstream descarta la clase de marcas combinantes en su pre-tokenizador, de modo que textos con marcas combinantes (por ejemplo, selectores de variación de emoji) pueden contar un token más en upstream (diferencia en 3 de 1.480 prompts de prueba).
- La decodificación de vídeo exige FFmpeg instalado; sin él hay que enviar listas de fotogramas o la petición falla con HTTP 422.
- Licencia Apache-2.0: permite uso comercial, pero exige conservar `LICENSE` y `NOTICE` con la declaración de modificación al redistribuir.
- Madurez: 0 descargas y 0 *likes* en el momento de la consulta, publicado y actualizado el mismo día (26 de octubre de 2026), sin validación de terceros.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/FastFlowLM/D3-Turbo-NPU2
- Modelo base upstream: https://huggingface.co/vllm-sr/d3-turbo
- Repositorio de FastFlowLM: https://github.com/ROCm/FastFlowLM
