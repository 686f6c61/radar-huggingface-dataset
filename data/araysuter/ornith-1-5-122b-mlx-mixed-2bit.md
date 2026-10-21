# araysuter/Ornith-1.5-122B-MLX-mixed-2bit

## Resumen

Ornith-1.5-122B-MLX-mixed-2bit es una conversión experimental a MLX del modelo Ornith-1.5-122B (ornith-ai), publicada por el usuario araysuter. Se trata de una cuantización de precisión mixta generada directamente desde el checkpoint BF16 original (revisión `dfa07bab90e90746ffbfc0b0cba3126eb9265de2`), pensada para ejecutar un modelo de 122.562.817.776 parámetros en Apple Silicon con un payload de pesos de 40.621.228.512 bytes (40,62 GB / 37,83 GiB).

El interés de esta ficha no está en el modelo base, del que la información disponible no detalla entrenamiento ni contexto nativo, sino en la ingeniería de la cuantización: los expertos enrutados se comprimen a 2 bits (afina, group size 64), el resto de proyecciones cuantizadas a 4 bits y los routers y gates de expertos compartidos se mantienen en 8 bits, dejando en BF16 los tensores no cuantizados. El autor documenta el proceso con hashes SHA-256 de origen y destino, verificación estricta de los 2.440 tensores y un manifiesto de conversión.

Es relevante ahora porque demuestra que un MoE de 122B puede caber en una máquina de sobremesa Apple con memoria unificada, a cambio de una degradación de calidad frente a BF16 que el propio autor declara desconocida (no hay ejecución del modelo completo a plena precisión). Los resultados publicados son subconjuntos fijos de 120 preguntas, no puntuaciones de leaderboard.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE); el repositorio etiqueta la arquitectura como `qwen3_5_moe`. El detalle de capas, número de expertos y mecanismo de atención del modelo base no está disponible |
| Parametros totales | 122.562.817.776 (122,56 B), según safetensors |
| Parametros activos | no disponible |
| Longitud de contexto | 128K tokens (el autor completa una prueba a 128K; el contexto nativo declarado por el modelo base no está disponible) |
| Tipos de cuantizacion | Mezcla de precisiones: expertos enrutados a 2 bits afina con group size 64; otras proyecciones cuantizadas a 4 bits con group size 64; routers y gates de expertos compartidos a 8 bits con group size 64; tensores no cuantizados en BF16 |
| Idiomas soportados | no disponible |
| Licencia | MIT (la del repositorio; la del modelo base no se detalla en la información disponible) |
| Formato de pesos | safetensors para MLX; payload de pesos de 40.621.228.512 bytes (40,62 GB / 37,83 GiB); tamaño total del repositorio 40,6 GB |

## Arquitectura y entrenamiento

El modelo base es un transformer con mezcla de expertos de 122,56 mil millones de parámetros, según la etiqueta `qwen3_5_moe` del repositorio y el recuento de safetensors. La información proporcionada no incluye el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF, DPO u otras fases de alineación; tampoco se detalla el número de parámetros activos por token ni la configuración de atención. Lo que sí se documenta es que el modelo base incorpora un modo de razonamiento (la evaluación del autor se ejecuta con *thinking* desactivado) y que el checkpoint original incluye pesos de visión más los assets de procesador.

La aportación técnica de este repositorio es la conversión: se parte del checkpoint BF16 y se aplica una política de precisión por tipo de tensor (2 bits en expertos enrutados, 4 bits en el resto de proyecciones cuantizadas, 8 bits en routers y gates), con tensores no cuantizados conservados en BF16 tras las transformaciones del cargador. El conversor verifica los hashes SHA-256 de los shards de origen antes de leer los tensores y comprueba los 2.440 nombres de tensor de salida; `CONVERSION_MANIFEST.json` registra revisión de origen, hashes de entrada y salida, transformaciones, errores de reconstrucción muestreados, pico de asignación de MLX y duración. Los tensores MTP (*multi-token prediction*) del modelo original se excluyen, por lo que este checkpoint no incluye los pesos de *drafting* que permitirían decodificación especulativa.

## Capacidades

- Generación de texto y conversación multi-turno en formato chat, con plantilla aplicada mediante `mlx_vlm.prompt_utils.apply_chat_template`.
- Razonamiento matemático: 24/25 aciertos en el subconjunto de GSM8K (25 ítems) del autor.
- Generación de código: 17/20 en HumanEval adaptado a chat y evaluado con tests unitarios en sandbox.
- Seguimiento de instrucciones: 16/25 (64%) con el checker estricto oficial de IFEval en el perfil base de 2 bits.
- Contexto largo: el autor completa una prueba de 128K tokens de entrada sin caché con el perfil base.
- Modo de razonamiento (thinking) presente en el modelo base y desactivable; la evaluación publicada se hizo con thinking desactivado.
- Visión: los pesos de visión y los assets del procesador están incluidos en el repositorio, pero la inferencia de imagen no ha sido validada en este experimento.
- Tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente multi-paso: el autor cita Terminal-Bench 4.0 como referencia de modelos comerciales, pero no ejecuta esa prueba sobre esta cuantización.
- Idiomas: no disponible.

## Casos de uso

- Prototipado local de un MoE de gran tamaño en Apple Silicon: cargar el checkpoint con `mlx_vlm` y validar flujos de generación en un Mac con memoria unificada suficiente, sin depender de GPUs NVIDIA ni de APIs externas.
- Asistencia de código en local: con un 85% en el subconjunto de HumanEval, es utilizable para autocompletado y generación de funciones en un entorno de desarrollo offline, siempre con ejecución de tests unitarios como red de seguridad.
- Resolución de problemas matemáticos con verificación posterior: el 96% en GSM8K permite usar el modelo como primer generador en un pipeline donde un solver simbólico o un checker valida el resultado final.
- Procesamiento de documentos extensos: la ventana de 128K probada permite resumir o extraer información de contratos, informes o transcripciones largas en una sola pasada, asumiendo el coste de TTFT (282,54 s en la prueba de 128K) y el consumo de memoria del KV cache.
- Investigación sobre cuantización: comparar este perfil (2 bits g64, 40,62 GB) con el perfil 2 bits + 3 bits en proyecciones *down* (45,45 GB) y el perfil 2 bits g32 (47,87 GB) para estudiar el compromiso entre tamaño, instrucciones estrictas y precisión en código.
- Evaluación de infraestructura MLX: banco de pruebas para medir TTFT, throughput y pico de asignación de memoria en distintos backends y longitudes de contexto, usando los receipts y `comparison-results.json` del autor como referencia reproducible.
- Despliegue educativo o de demostración en un laboratorio: servir el modelo con `mlx_lm`/`mlx_vlm` para clases o demos internas donde la licencia MIT y la ausencia de llamadas a APIs comerciales son requisitos.

## Benchmarks y rendimiento

Suite fija de 120 preguntas del autor: una respuesta greedy por tarea, prompts de chat zero-shot, thinking desactivado y los mismos presupuestos de prompt y salida para todos los modelos. Subconjuntos pequeños, no puntuaciones completas de leaderboard.

| Modelo | Peso (GB) | ARC (50) | GSM8K (25) | HumanEval (20) | IFEval estricto (25) |
|---|---:|---:|---:|---:|---:|
| Ornith · 2 bits g64 (este repositorio) | 40,62 | 47/50 (94%) | 24/25 (96%) | 17/20 (85%) | 16/25 (64%) |
| Ornith · 2 bits + 3 bits en down | 45,45 | 46/50 (92%) | 25/25 (100%) | 16/20 (80%) | 21/25 (84%) |
| Ornith · 2 bits g32 | 47,87 | 46/50 (92%) | 25/25 (100%) | 16/20 (80%) | 18/25 (72%) |
| Swift-1.5 · 4 bits + DFlash2 (referencia) | 15,83 | 47/50 (94%) | 25/25 (100%) | 20/20 (100%) | 19/25 (76%) |

Rendimiento medido (una sola máquina, un solo intento):

| Escenario | TTFT | Generación | Memoria |
|---|---:|---:|---:|
| 20K tokens de entrada sin caché | 17,64 s | ~66,8 tok/s | no disponible |
| 128K tokens de entrada sin caché (solo perfil base) | 282,54 s | 44,0 tok/s (reportado en runtime) | 49,95 GB de pico de asignación MLX |
| Swift-1.5 a 20K (referencia) | 21,81 s | ~121,0 tok/s | no disponible |

Referencias de modelos comerciales citadas por el autor (Anthropic, 7 de octubre de 2026, Terminal-Bench 4.0): GPT-6 Luna 16,4% y Claude Haiku 5.5 39,2%. No se ejecutó Terminal-Bench 4.0 sobre esta cuantización ni sobre Swift, y esos porcentajes no son comparables numéricamente con los subconjuntos locales. No hay ejecución del modelo base a plena precisión, por lo que la pérdida de calidad respecto a BF16 es desconocida.

## Requisitos de hardware

- VRAM/memoria: el payload de pesos es de 40,62 GB, por lo que se necesita memoria unificada claramente superior a 48 GB; el autor midió un pico de asignación de MLX de 49,95 GB en la prueba de 128K, sin contar el resto de memoria del sistema. El tamaño en disco no determina el requisito de inferencia.
- Plataforma: Apple Silicon exclusivamente. La validación usa `mlx==0.32.4`, `mlx-vlm==0.7.9` y `mlx-lm==0.32.0`; no hay soporte CUDA en este repositorio.
- GPU recomendadas: no disponible como lista oficial. Por tamaño, encaja en equipos Apple con 64 GB de memoria unificada o más para contextos moderados; para 128K conviene 96-128 GB (estimación a partir del pico medido, no una cifra publicada por el autor).
- Cabe en GPU de consumo: no en GPUs NVIDIA de 24 GB por tamaño de pesos; en Apple Silicon de gama alta con memoria unificada amplia, sí.
- Opciones de despliegue: `mlx-vlm` (carga y generación con visión), `mlx-lm` para texto. No hay conversión GGUF, Ollama, llama.cpp, TGI ni vLLM publicada en este repositorio; vLLM no consume pesos MLX, requeriría otra conversión.
- Throughput y latencia: ~66,8 tok/s de generación tras el primer token con 20K de entrada y 17,64 s de TTFT; 44,0 tok/s reportados y 282,54 s de TTFT en la prueba de 128K. Además se asignó swap de macOS durante las pruebas.
- Se recomienda margen de memoria adicional: el propio autor advierte que el contexto de 128K requiere memoria para el modelo, el KV cache, buffers temporales y el sistema operativo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización / peso | Rendimiento publicado | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Ornith-1.5-122B MLX mixed 2-bit (este) | 122,56 B | 128K probado | 2/4/8 bits mixto, 40,62 GB | ARC 94%, GSM8K 96%, HumanEval 85%, IFEval 64% | MIT | HuggingFace, 0 descargas |
| Ornith-1.5-122B MLX 2-bit + 3-bit down | 122,56 B | no disponible | 2/3/4/8 bits mixto, 45,45 GB | ARC 92%, GSM8K 100%, HumanEval 80%, IFEval 84% | no disponible | Experimento del autor, no publicado como pesos |
| Ornith-1.5-122B MLX 2-bit g32 | 122,56 B | no disponible | 2 bits g32, 47,87 GB | ARC 92%, GSM8K 100%, HumanEval 80%, IFEval 72% | no disponible | Experimento del autor, no publicado como pesos |
| Ornith-1.5-122B MLX 4-bit (BobClawblaw) | 122,56 B (base) | no disponible | 4 bits, tamaño no disponible | no disponible | no disponible en la información | HuggingFace |
| Ornith-1.5-122B BF16 (modelo base) | 122,56 B | no disponible | BF16 | no medido por el autor | no disponible en la información | HuggingFace (`ornith-ai/Ornith-1.5-122B`) |
| Swift-1.5 4-bit + DFlash2 (referencia del autor) | no disponible | no disponible | 4 bits, 15,83 GB | ARC 94%, GSM8K 100%, HumanEval 100%, IFEval 76%; ~121 tok/s a 20K | no disponible | Configuración existente usada como baseline |

## Limitaciones y advertencias

- La cuantización agresiva a 2 bits puede reducir la precisión; el autor declara explícitamente que no dispone de una ejecución del modelo base en plena precisión, por lo que la pérdida real frente a BF16 es desconocida.
- El resultado más flojo del perfil publicado es el seguimiento estricto de instrucciones (16/25, 64%), inferior a los otros dos perfiles Ornith y a la referencia Swift; no es adecuado para pipelines que dependan de formato rígido sin validadores adicionales.
- Los benchmarks son subconjuntos fijos de 120 preguntas con un único intento por tarea y una sola máquina; no constituyen puntuaciones de leaderboard y no deben citarse como tales.
- Las puntuaciones publicadas por el modelo base no son atribuibles a esta conversión.
- Los pesos MTP están excluidos, de modo que no se puede usar decodificación especulativa con este checkpoint.
- Los pesos de visión están incluidos pero la inferencia de imagen no ha sido validada; no hay garantía de que funcione.
- Solo se completó la prueba de 128K con el perfil base y el autor no reclama que los perfiles mayores quepan en memoria a esa longitud; el resultado a 128K se describe como un sondeo de completación cruda, no como una evaluación de calidad en contexto largo. En esa prueba el marcador de verificación apareció, pero el razonamiento adicional hizo fallar la coincidencia exacta.
- Durante las pruebas se asignó swap de macOS y el pico de asignación de MLX no incluye el resto de memoria del sistema; en producción hay que dimensionar con margen.
- Dependencia de hardware Apple Silicon y de versiones concretas de `mlx`, `mlx-vlm` y `mlx-lm`; no hay compatibilidad nativa declarada con TensorFold, vLLM, llama.cpp ni Ollama.
- La licencia del repositorio es MIT, lo que permite uso comercial de esta conversión, pero la licencia y condiciones del modelo base no se detallan en la información disponible y deben verificarse antes de un despliegue comercial.
- Sesgos conocidos: no disponible. Riesgo de alucinación: no cuantificado en la información proporcionada.
- Idiomas soportados: no disponible, por lo que no se puede garantizar un rendimiento aceptable en castellano.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/araysuter/Ornith-1.5-122B-MLX-mixed-2bit
- Modelo base: https://huggingface.co/ornith-ai/Ornith-1.5-122B (revisión de origen `dfa07bab90e90746ffbfc0b0cba3126eb9265de2`)
- Conversión MLX 4-bit de referencia: https://huggingface.co/BobClawblaw/Ornith-1.5-122B-MLX-4bit/tree/e5eccbc52ed3572157e40e761e040b842845bd
- Referencia de modelos comerciales citada por el autor (Anthropic, Terminal-Bench 4.0): https://www.anthropic.com/claude-haiku-5-5
- Artefactos de validación dentro del repositorio: `CONVERSION_MANIFEST.json`, `comparison-results.json`, `evaluation-manifest.json`, `validation-packages.txt`, `quality-comparison.png`, `performance-comparison.png`
- Resultados de búsqueda web: no se han encontrado enlaces relevantes al modelo; las entradas devueltas por el buscador (foros, tipografías y contenido sobre TikTok) no guardan relación con esta ficha y se descartan.
