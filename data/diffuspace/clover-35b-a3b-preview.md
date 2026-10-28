# Diffuspace/Clover-35B-A3B-Preview

bias), agentic benchmarks (blog mentions agentic), 128K context, block diffusion parallel decoding, self-speculative decoding, expert routing coreset. Tool calling: not stated → "no disponible / no se documenta". Languages: no disponible.

Let's write it. Use Spanish from Spain, no emojis, only first word of headings capitalized ("Resumen", "Especificaciones tecnicas" — note the prompt's headings lack accents; I'll follow with proper accents? The prompt uses "Especificaciones tecnicas" without accent. Rules say no spelling errors — "técnicas" with accent is correct. But structure is mandatory with those heading names. I'll use accents: "Especificaciones técnicas", "Arquitectura y entrenamiento", "Capacidades", "Casos de uso", "Benchmarks y rendimiento", "Requisitos de hardware", "Comparativa con modelos similares", "Limitaciones y advertencias", "Enlaces". Hmm, deviating from given heading text slightly but with correct orthography. The rules say only first word capitalized — that conflicts with "Especificaciones técnicas" (both words... "técnicas" is lowercase adjective, fine). OK.

Titles capitalization: "## Resumen" fine.

Write the ficha.

Details on params: totales 34.661.350.848 (~34,7B). Activos ~3B per token.

Weights format: safetensors, BF16, custom code (trust_remote_code=True), clover_moe architecture.

Transformers 5.19.0, PyTorch 2.10+.

Context: 131.072 tokens including prompt+response; requests exceeding rejected including space for final block.

Decoding: block diffusion with LowConfidence decoding, block_size 32, threshold 0.95, do_sample=False example.

Generation controls table could be included in architecture or hardware—maybe a small table in "Arquitectura y entrenamiento"? Better: include the controls in Capacidades or a subsection. Tables where possible. I could add a table in "Arquitectura y entrenamiento" listing decoding parameters. But structure is obligatory: headings and content. Adding a table within a section is fine.

Hardware: 
- BF16 weights ~69 GB → needs ≥80 GB VRAM plus estado de inferencia → A100 80GB, H100 80GB, o reparto multi-GPU (2×RTX 4090 24GB = 48GB insuficiente para BF16). Mention device_map="cuda:0" single GPU in example, but requires ~69GB → H100/A100 80GB.
- Consumer GPU: no en BF16; con cuantizacion 4-bit (~18-20 GB estimado) cabria en RTX 4090/3090, pero no hay cuantizaciones oficiales publicadas; llama.cpp backend existe en el repo de codigo.
- Deployment: transformers (referencia), SGLang y llama.cpp (self-speculative decoding) via repo oficial, vLLM/TGI: no documentado.
- Latency/throughput: no disponible; block diffusion resolves block_size=32 tokens in parallel per step.

Licence: apache-2.0 → commercial use permitted; caveat: base model Qwen3.6-35B-A3B license to check (unknown in the info) — mention as caveat that the base model's licence terms should be verified; apache-2.0 declared. Hmm base is Qwen which is usually Apache-2.0. Say "no disponible en la informacion" for base licence but note it should be verified.

Limitations: repetition in very long generations (documented), soft length/think controls may truncate reasoning, threshold decoding may vary quality, block diffusion non-determinism with sampling, no language list, no published benchmarks numbers, preview model (name Preview) → API/config may change, requires trust_remote_code (security risk), custom code + specific transformers version 5.19.0 and PyTorch 2.10 → compatibility constraints, thinking mode must be closed (</think> bias) — risk of unterminated thinking, hallucinations inherent, biases not documented, unknown safety alignment/training data.

Enlaces: HF, blog, github, diffuspace.ai, base model HF.

Write now.## Resumen

Clover-35B-A3B-Preview es el primer modelo publicado por DiffuSpace y se presenta como un modelo de lenguaje de difusión (diffusion language model) de código abierto con un backbone de mezcla de expertos (MoE) de aproximadamente 35.000 millones de parámetros totales y unos 3.000 millones activos por token. Deriva del Qwen3.6-35B-A3B, del que conserva la arquitectura híbrida Gated DeltaNet (GDN) y atención completa, con 40 capas, 256 expertos enrutados, enrutamiento top-8 y un experto compartido por capa.

Su rasgo diferencial es el mecanismo de generación: decodificación por bloques mediante difusión (block diffusion) con una estrategia denominada LowConfidence decoding, en la que cada bloque arranca con tokens enmascarados y las posiciones de mayor confianza se resuelven en paralelo, no estrictamente de izquierda a derecha. El modelo incorpora además atención bidireccional dentro del bloque ruidoso manteniendo un prefijo causal, y una ventana de contexto de 128K tokens (131.072 en total, prompt más respuesta).

Es relevante ahora porque, según el autor, ofrece resultados de referencia entre los modelos de difusión de código abierto en las evaluaciones publicadas en su blog de lanzamiento, y porque su licencia Apache 2.0 y su integración con Transformers, SGLang y llama.cpp lo sitúan como una alternativa práctica a los modelos autorregresivos equivalentes para experimentación en decodificación paralela y razonamiento agéntico. Se trata de una versión Preview, publicada en octubre de 2026 y con un único checkpoint en BF16.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE híbrido Gated DeltaNet (GDN) + atención completa, con generación por difusión de bloques (block diffusion); arquitectura declarada en el repo como `clover_moe` |
| Parametros totales | 34.661.350.848 (~34,7 B) |
| Parametros activos | ~3 B por token (enrutamiento top-8 sobre 256 expertos enrutados + 1 experto compartido por capa) |
| Capas | 40 |
| Longitud de contexto | 131.072 tokens (prompt + respuesta); las peticiones que exceden el límite se rechazan, incluido el espacio necesario para resolver el bloque final |
| Tipos de cuantizacion | No se han publicado cuantizaciones oficiales; el repo solo distribuye pesos BF16 (safetensors). El repositorio de código incluye un backend para llama.cpp, pero no se detallan artefactos GGUF publicados |
| Idiomas soportados | No disponible (la model card no declara lista de idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16), requiere `trust_remote_code=True` (código personalizado) |
| Libreria y versiones | Transformers 5.19.0 y PyTorch 2.10 o superior |
| Modelo base | Qwen/Qwen3.6-35B-A3B (fine-tune) |
| Tamano del repositorio | 69,3 GB |

## Arquitectura y entrenamiento

Clover parte del checkpoint Qwen3.6-35B-A3B y conserva su columna vertebral híbrida: 40 capas que combinan capas Gated DeltaNet (atención lineal recurrente con compuertas) y capas de atención completa, junto con una capa MoE de 256 expertos enrutados, selección top-8 por token y un experto compartido por capa. Sobre esa base, DiffuSpace añade parámetros GDN aprendidos para atención bidireccional de bloque, incluidos pesos de convolución por la derecha y controles softmax, de forma que los tokens pueden atenderse entre sí dentro de un bloque ruidoso sin romper el prefijo causal ya resuelto. El resultado es un modelo de texto que genera mediante difusión por bloques en lugar de decodificación autorregresiva pura.

La decodificación implementada en Hugging Face es block diffusion con LowConfidence decoding: cada bloque comienza con tokens enmascarados y se resuelven en paralelo las posiciones cuya confianza supera el umbral; si ninguna lo supera, se rellena la posición más confiable para garantizar el avance, y el bloque resuelto pasa a formar parte del prefijo del siguiente. Los valores por defecto son `block_size=32` y `threshold=0.95`. El repositorio oficial de código añade decodificación auto-especulativa (self-speculative decoding) mediante implementaciones en SGLang y llama.cpp.

El modelo incluye un mecanismo de selección de expertos a nivel de bloque durante el denoising (`moe_block_coreset_enabled=true`): agrega las puntuaciones de enrutamiento de los top-8 candidatos de cada token a lo largo del bloque, ordena los expertos por puntuación agregada y restringe el enrutamiento a un subconjunto según un umbral de masa acumulada (`moe_block_coreset_top_p=0.9`), reduciendo el número de expertos distintos activados por bloque. También incorpora controles de generación con valores por defecto ya configurados, que se aplican incluso en decodificación voraz:

| Parametro | Valor por defecto | Funcion |
|---|---|---|
| `presence_penalty` | 0.9 | Penaliza tokens ya aparecidos en la respuesta generada |
| `frequency_penalty` | 0.0 | Penaliza proporcionalmente a la frecuencia; desactivado |
| `repetition_penalty` | 1.05 | Reduce la preferencia por tokens ya generados (1.0 lo desactiva) |
| `dllm_length_penalty` | 10.0 | Aumenta gradualmente la preferencia por tokens de fin de respuesta |
| `dllm_think_end_bias` | 10.0 | Favorece gradualmente el cierre de la fase de razonamiento con `</think>` |
| `dllm_length_penalty_start` / `_window` | 8192 / 8192 | La penalización de longitud empieza a los 8192 tokens de respuesta y alcanza su fuerza máxima 8192 tokens después |
| `dllm_think_end_start` / `_window` | 4096 / 4096 | El sesgo de cierre de razonamiento empieza a los 4096 tokens y se completa 4096 tokens después |

No se detallan en la información proporcionada el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron etapas de RLHF, DPO u otras técnicas de alineación.

## Capacidades

- Generación de texto conversacional en formato chat mediante `apply_chat_template`, con soporte de plantilla de chat y modo de razonamiento activable (`enable_thinking=True`).
- Razonamiento multi-paso con fase de pensamiento explícita, cerrada mediante la etiqueta `</think>`, con sesgos configurables para forzar su finalización en generaciones largas.
- Generación por difusión de bloques con resolución paralela de tokens, incluyendo control explícito de `block_size` y `threshold` en cada llamada a `generate()`.
- Decodificación auto-especulativa documentada para los backends SGLang y llama.cpp del repositorio oficial.
- Contexto largo de hasta 131.072 tokens compartidos entre prompt y respuesta.
- Capacidades agénticas: la model card publica resultados de benchmarks agénticos en su blog, aunque sin cifras en el texto de la ficha.
- Control de repetición, control de longitud de respuesta y control de cierre del razonamiento integrados y activos por defecto.
- Selección de expertos por bloque para reducir el conjunto de expertos activados durante el denoising.
- No se documentan en la información disponible capacidades de visión, audio, tool calling o function calling explícito.
- No se declara lista de idiomas soportados.

## Casos de uso

- Razonamiento con contexto largo en documentación técnica: con 131.072 tokens de ventana, el modelo puede ingerir especificaciones completas, varios ficheros de código o actas de reuniones y responder sobre ellos sin trocear el material, algo útil en auditorías y revisiones de diseño.
- Experimentación en decodificación por difusión: al exponer `block_size` y `threshold` como argumentos de `generate()`, permite medir el compromiso entre paralelismo por bloque, calidad y latencia en comparación con la decodificación autorregresiva del modelo base.
- Evaluación de agentes multi-paso: los benchmarks agénticos publicados por el autor lo sitúan como candidato para pipelines de agentes donde el modelo debe encadenar razonamiento, planificación y respuesta final, siempre que se valide el soporte real de herramientas en el entorno concreto.
- Generación de documentación y contenido largo con control de repetición: los valores por defecto de `presence_penalty=0.9` y `repetition_penalty=1.05`, junto con la penalización progresiva de longitud, están pensados para respuestas extensas donde los modelos de difusión tienden a repetirse.
- Asistencia conversacional multi-turno: la plantilla de chat y el modo de razonamiento permiten construir asistentes que separan fase de pensamiento y respuesta visible, útil en atención al cliente o soporte interno con trazas auditables.
- Serving experimental con llama.cpp o SGLang: el repositorio oficial incluye backends con decodificación auto-especulativa, lo que facilita desplegar el modelo en entornos de investigación y comparar throughput frente a servicios autorregresivos.
- Investigación sobre eficiencia de MoE en difusión: los ajustes `moe_block_coreset_enabled` y `moe_block_coreset_top_p` permiten estudiar el impacto de restringir el conjunto de expertos activos por bloque en memoria y calidad.

## Benchmarks y rendimiento

No se han publicado resultados numéricos de benchmarks en la información disponible. La model card referencia resultados de benchmarks agénticos en imágenes y enlaces al blog de lanzamiento (`https://diffuspace.ai/blog/clover-35b/#agentic-benchmarks`), pero no incluye cifras, configuraciones de evaluación ni comparaciones con otros modelos en el texto proporcionado.

| Benchmark | Clover-35B-A3B-Preview | Notas |
|---|---|---|
| MMLU | No disponible | No se reporta en la información |
| HumanEval | No disponible | No se reporta en la información |
| GSM8K | No disponible | No se reporta en la información |
| Benchmarks agénticos | No disponible (solo referencia gráfica al blog) | El autor publica resultados y ajustes de evaluación en el blog de lanzamiento |

## Requisitos de hardware

- Pesos en BF16: aproximadamente 69 GB, según la propia model card; a ello hay que sumar el estado de inferencia (cachés y buffers del denoising por bloques).
- GPU recomendadas para BF16: A100 80 GB o H100 80 GB en una sola tarjeta; el ejemplo oficial usa `device_map="cuda:0"`. En configuraciones multi-GPU el peso debe repartirse con suficiente memoria agregada por encima de los 69 GB.
- GPU de consumo: no cabe en BF16 en tarjetas de 24 GB (RTX 4090, RTX 3090) ni en 48 GB agregados de dos tarjetas. Con cuantización a 8 bits (estimación ~35 GB) seguiría sin caber en una sola GPU de consumo; con 4 bits (estimación ~18-20 GB) podría caber en una RTX 4090 o 3090, pero no hay cuantizaciones oficiales publicadas y estas cifras son estimaciones, no datos del autor.
- Opciones de despliegue: Transformers 5.19.0 con `trust_remote_code=True` (implementación de referencia), SGLang y llama.cpp mediante el repositorio oficial de código con decodificación auto-especulativa. No se documenta soporte de vLLM ni de TGI en la información disponible.
- Memoria y contexto: el límite de 131.072 tokens se aplica a prompt más respuesta, incluido el espacio necesario para resolver el bloque final; las peticiones que lo exceden se rechazan en lugar de truncarse.
- Latencia y throughput: no disponibles. Cualitativamente, la decodificación resuelve bloques de 32 tokens de forma paralela según confianza, por lo que el coste por token depende de `block_size`, `threshold` y del backend empleado.
- Requisito de software: PyTorch 2.10 o superior con CUDA y Transformers 5.19.0; el código es personalizado, por lo que hay que fijar versiones para reproducibilidad.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Tipo de generacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Clover-35B-A3B-Preview | ~34,7 B | ~3 B | 131.072 | Difusion por bloques (MoE hibrido GDN + atencion completa) | Apache 2.0 | Pesos safetensors BF16 en Hugging Face |
| Qwen3.6-35B-A3B (modelo base) | ~35 B (segun denominacion) | ~3 B (segun denominacion) | No disponible en la informacion | Autorregresiva | No disponible en la informacion | Hugging Face |
| Otros modelos de difusion de texto abiertos | No disponible | No disponible | No disponible | Difusion | No disponible | No disponible |

La informacion proporcionada solo permite comparar con el modelo base, del que se conocen la denominacion y la arquitectura heredada, pero no sus resultados de benchmarks, contexto exacto ni condiciones de licencia. No se aportan datos numericos que permitan una comparacion de rendimiento con alternativas de la misma categoria.

## Limitaciones y advertencias

- Modelo en version Preview: la model card advierte de que es el primer lanzamiento de DiffuSpace y de que la implementacion de decodificacion es específica, por lo que la API, los valores por defecto y el comportamiento pueden cambiar en versiones posteriores.
- Repeticion en generaciones muy largas: el propio autor documenta que las generaciones muy extensas pueden volverse repetitivas, de ahi los controles de repeticion y los sesgos graduales hacia el cierre; siguen siendo controles blandos y `max_new_tokens` es el unico limite duro.
- Riesgo de truncamiento del razonamiento: el sesgo `dllm_think_end_bias` fuerza el cierre de la fase de pensamiento a partir de 4096 tokens, lo que puede cortar cadenas de razonamiento largas antes de que concluyan.
- Dependencia de codigo personalizado: requiere `trust_remote_code=True`, lo que implica ejecutar codigo del autor; conviene auditar el repositorio y fijar la revision antes de usarlo en produccion.
- Restricciones de version: exige Transformers 5.19.0 y PyTorch 2.10 o superior; versiones distintas pueden romper la carga o la decodificacion.
- Idiomas: no se declara lista de idiomas soportados, por lo que el rendimiento multilingue no esta garantizado ni documentado.
- Sesgos y alineacion: no se documentan datos de entrenamiento, composicion del corpus ni etapas de RLHF/DPO, lo que impide evaluar sesgos conocidos o el grado de alineacion de seguridad.
- Alucinacion: no se publican tasas de alucinacion ni evaluaciones de veracidad; como en cualquier modelo generativo, el riesgo persiste y debe mitigarse con verificacion externa.
- Benchmarks: no hay cifras verificables en la informacion disponible; los resultados solo se referencian graficamente en el blog del autor, sin detallar en la ficha ajustes de evaluacion ni comparaciones numericas.
- Licencia: el modelo se declara Apache 2.0, lo que permite uso comercial, pero no se detallan en la informacion las condiciones de licencia del modelo base Qwen3.6-35B-A3B, que conviene verificar antes de un despliegue comercial.
- Memoria: los 69 GB en BF16 obligan a hardware de centro de datos; no hay cuantizaciones oficiales que faciliten el despliegue en GPU de consumo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Diffuspace/Clover-35B-A3B-Preview
- Blog de lanzamiento y benchmarks: https://diffuspace.ai/blog/clover-35b/
- Seccion de benchmarks agenticos del blog: https://diffuspace.ai/blog/clover-35b/#agentic-benchmarks
- Repositorio de codigo y backends de inferencia: https://github.com/DiffuSpace/Clover-35B-A3B-Preview
- Sitio del autor: https://diffuspace.ai/
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
