# jucamohedano/rlm-laguna-xs2-dense-3b-v0.1

## Resumen

RLM-Laguna-XS.2-Dense-3B v0.1 es un modelo denso de aproximadamente 3.000 millones de parámetros (2.996.678.656 según los pesos publicados en safetensors) distribuido por el usuario jucamohedano en Hugging Face bajo licencia Apache 2.0 y con el inglés como único idioma declarado. No es un asistente generalista: es un checkpoint de investigación concebido como «warm start» del protocolo Recursive Language Model (RLM), en el que el modelo abre un bloque ```repl, escribe código Python ejecutable, un harness lo lanza contra un contexto largo externalizado y el modelo lee el resultado para decidir su siguiente acción, marcando `answer["ready"] = True` cuando cree tener la respuesta.

El modelo parte de EvanOLeary/laguna-xs2-dense-k8-cuda-sft-v2, un denso obtenido por destilación MoE→densa (K=8) a partir del MoE poolside/Laguna-XS.2 de Poolside AI (33.400 millones de parámetros totales, 3.000 millones activos, 256 expertos con top-8), seguido de un SFT sobre datos de kernels CUDA (Sakana AI-CUDA-Engineer-Archive, niveles 1+2 y después 1+2+3). Sobre esa base, el autor aplica un LoRA (r=32, α=64) sobre proyecciones de atención y FFN para enseñar exclusivamente el protocolo de acciones RLM, usando 60 filas limpias de un único turno con objetivo definido.

Su relevancia actual es doble: por un lado documenta con detalle inusual el estado real de un warm start RLM (progresión de pérdida de validación, tasa de acierto, modos de fallo); por otro sirve como material de partida para RL, SFT adicional o estudio del propio protocolo. El autor advierte explícitamente de que solo resuelve correctamente 1 de cada 3 tareas medidas y de que esas tareas fueron vistas por el profesor que generó las trazas, por lo que las cifras publicadas no deben interpretarse como una medida de generalización.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso con `custom_code` en transformers; procede de la densificación (K=8) del MoE Laguna-XS.2 |
| Parámetros totales | 2.996.678.656 (~3,0 B) |
| Parámetros activos | No aplica: el checkpoint es denso. El profesor del linaje (poolside/Laguna-XS.2) es MoE de 33,4 B totales y 3,0 B activos con 256 expertos y top-8 |
| Longitud de contexto | No disponible. La model card describe operación sobre contexto largo externalizado vía REPL, pero no publica una cifra de ventana |
| Tipos de cuantización | No disponible. No se publican pesos GGUF ni variantes cuantizadas; solo safetensors |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería transformers, requiere `trust_remote_code` por el `custom_code`) |
| Tamaño del repositorio | 6,0 GB |
| Modelo base | EvanOLeary/laguna-xs2-dense-k8-cuda-sft-v2 (adaptador LoRA entrenado sobre él) |
| Fecha de publicación | Creado el 2026-09-26, actualizado el 2026-09-26 |
| Descargas / likes | 0 descargas, 1 like |

## Arquitectura y entrenamiento

La arquitectura es un transformer denso de ~3,0 B de parámetros. El linaje arranca en poolside/Laguna-XS.2, un MoE de Poolside AI con 33,4 B totales y 3,0 B activos (256 expertos, top-8). Un equipo de hackathon lo densificó con K=8 usando un warm start de selección de expertos DO-ACP en lugar de inicialización aleatoria (descrito como la palanca de convergencia más importante), y después aplicó un preentrenamiento de reconstrucción en el que la FFN densa se entrena contra las activaciones del bloque MoE del profesor, con teacher forcing y todas las capas en paralelo. A continuación vino un SFT sobre el dataset de kernels CUDA Sakana AI-CUDA-Engineer-Archive (niveles 1+2 y posteriormente 1+2+3); ese segundo SFT es precisamente el modelo base de este checkpoint.

Lo que añade este checkpoint es el protocolo de acciones RLM sobre un modelo ya afinado en kernels CUDA. El entrenamiento consistió en un LoRA con r=32 y α=64 aplicado a las proyecciones de atención y FFN, sobre 60 filas limpias de un único turno con objetivo único, reanudado desde un adaptador anterior. De una ejecución de 70 pasos, el mejor checkpoint por pérdida de validación es el paso 50; los pasos posteriores sobreajustan. Los datos de tarea pertenecen a la familia de benchmarks de contexto largo OOLONG (oolongbench/oolong-synth), y las trazas de SFT se destilaron de un modelo mayor sobre ese mismo conjunto. El stack de entrenamiento y de entorno multi-turno proviene de prime-rl / verifiers (Prime Intellect) y del proyecto RLM de Alex Zhang et al. No se ha ejecutado RL ni GRPO sobre este checkpoint.

## Capacidades

- Emisión fiable de acciones REPL: abre un bloque ```repl, escribe Python corto ejecutable, cierra el bloque y, cuando cree tener la respuesta, marca `answer["ready"] = True`. En la evaluación medida pasa de 0/3 a 3/3 tareas con fence cerrado respecto al modelo base.
- Ejecución efectiva de código en entorno real: 3 a 6 bloques REPL ejecutados por tarea, frente a cero en el modelo base.
- Razonamiento agregado sobre contexto largo externalizado: las tareas objetivo son de agregación sobre documentos largos que el harness mantiene fuera del prompt y que el modelo inspecciona mediante código (por ejemplo `print(type(context))`, `print(len(context))`, `print(context[:500])`).
- Intento de envío de respuesta: 2 de cada 3 tareas medidas acaban en un intento de submission.
- Herencia de capacidades de escritura de kernels CUDA del modelo base (Sakana AI-CUDA-Engineer-Archive, niveles 1 a 3), aunque el SFT RLM desvía el comportamiento hacia la emisión de código REPL.
- Ausencia de capacidades propias de un asistente: no hay evidencia declarada de tool calling estándar, function calling, agentes multi-paso de propósito general, visión, audio ni modo «thinking» explícito.
- Multilingüismo: solo inglés declarado.

## Casos de uso

- Warm start para RL del protocolo RLM: el checkpoint ya produce acciones REPL válidas y ejecutables, de modo que un ciclo de RL (por ejemplo con prime-rl) no parte de cero en cuanto a formato y puede centrarse en la señal de recompensa sobre la respuesta final. Es exactamente el uso para el que el autor lo publica.
- Base para SFT adicional en razonamiento sobre contexto largo: al estar entrenado solo con 60 filas de un único turno, el modelo admite seguir afinando con datos propios de agregación sobre documentos largos; se aprovecha su formato de salida ya establecido y la ventana de contexto se gestiona externamente mediante el harness.
- Estudio y depuración de harnesses CodeAct/REPL: el modelo genera código Python real que el entorno ejecuta, lo que permite validar sandboxes, límites de ejecución, timeouts y aislamiento de procesos con un generador de acciones que se comporta de forma representativa.
- Investigación en análisis de errores de razonamiento frente a errores de formato: la model card documenta que el modo de fallo se desplazó de «no emitir fence» a «código que no funciona» (por ejemplo, una regex que no casa con el formato de fecha) y a bucles cuando el modelo no progresa; este checkpoint es material útil para estudiar esa transición.
- Evaluación comparativa de recetas de destilación MoE→densa: sirve como punto de referencia reproducible del pipeline completo (densificación K=8 con DO-ACP, preentrenamiento de reconstrucción, SFT de kernels CUDA y SFT RLM) sobre un modelo de ~3,0 B que cabe en una GPU de gama alta.
- Generación de código en un pipeline aislado de evaluación de kernels: aunque el SFT RLM desvía el comportamiento, la base CUDA subyacente permite probar generación de kernels en un entorno con ejecución aislada, tratando siempre la salida como código no confiable.
- Prototipado de agentes de razonamiento recursivo en investigación académica: el modelo permite reproducir el bucle «emitir acción → ejecutar contra contexto offloaded → leer resultado → decidir» sin depender de modelos propietarios ni de hardware de gran escala.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Lo único medido por el autor es el comportamiento en el entorno RLM real, con decodificación greedy y T=0,7, sobre 3 tareas:

| Métrica (3 tareas) | Base (`laguna-xs2-dense-k8-cuda-sft-v2`) | Este checkpoint (paso 50) |
|---|---|---|
| Emite un fence ```repl cerrado | 0 / 3 | 3 / 3 |
| Bloques REPL realmente ejecutados | 0 | 3–6 por tarea |
| Intenta un submission | 0 / 3 | 2 / 3 |
| Respuesta correcta (reward 1) | 0 / 3 | 1 / 3 |

Datos adicionales de entrenamiento publicados: la pérdida de validación bajó de 1,52 a 1,31 en el paso 50 y volvió a subir a 1,62 en el paso 70, mientras la pérdida de entrenamiento caía hasta 0,14 (sobreajuste). Estas cifras no constituyen una medida de generalización porque los conjuntos de evaluación fueron vistos por el profesor que generó las trazas. No se reclaman resultados de RL ni de GRPO.

## Requisitos de hardware

- VRAM estimada (cálculo a partir de los 2.996.678.656 parámetros, no publicada por el autor): en bf16/fp16 los pesos ocupan ~6,0 GB (coincide con el tamaño del repositorio), y con activaciones y caché KV conviene reservar ~8 GB; en cuantización de 8 bits, ~3 GB de pesos; en 4 bits, ~2 GB de pesos.
- GPU recomendadas: cualquier GPU con 8 GB o más en bf16 (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080, RTX 4090); en 4 bits cabe en GPUs de 4–6 GB. Para producción con lotes grandes o muchas secuencias concurrentes, A100 40/80 GB o H100 aportan margen de sobra, aunque el modelo no los necesita por tamaño.
- Cabe en GPU de consumo: sí. Es un modelo de ~3,0 B; una RTX 4090 lo ejecuta holgadamente en bf16 y una GPU de 8 GB en 4 bits.
- Opciones de despliegue: transformers es la vía soportada (la model card incluye un ejemplo con AutoModelForCausalLM y AutoTokenizer); es imprescindible `trust_remote_code=True` porque el repositorio incluye `custom_code`. No hay confirmación de compatibilidad con vLLM, TGI, llama.cpp u Ollama en la información disponible, y no se publican pesos GGUF, por lo que llama.cpp u Ollama exigirían una conversión previa no facilitada.
- Latencia y throughput: no disponibles. Ninguna cifra de tokens por segundo o tiempo de respuesta se publica en la model card.
- Advertencia de despliegue: el código REPL que genera el modelo debe ejecutarse en un sandbox aislado; el autor lo califica explícitamente como código no confiable.

## Comparativa con modelos similares

| Modelo | Parámetros | Arquitectura | Contexto | Licencia | Enfoque y disponibilidad |
|---|---|---|---|---|---|
| rlm-laguna-xs2-dense-3b-v0.1 (este) | ~3,0 B totales | Transformer denso, adaptador LoRA RLM | No disponible | Apache 2.0 | Warm start del protocolo RLM; safetensors con `custom_code` |
| EvanOLeary/laguna-xs2-dense-k8-cuda-sft-v2 (base) | ~3,0 B (no confirmado en la información disponible) | Transformer denso procedente de MoE→denso | No disponible | No disponible | SFT sobre kernels CUDA; es el punto de partida directo y no sabe emitir acciones REPL (0/3) |
| poolside/Laguna-XS.2 (profesor) | 33,4 B totales / 3,0 B activos | MoE, 256 expertos, top-8 | No disponible | No disponible | Modelo de referencia del linaje, mucho mayor en VRAM; usado como profesor de destilación |
| mit-oasys/rlm-qwen3-30b-a3b-v0.1 | ~30 B totales / ~3 B activos (según la convención citada) | MoE Qwen3 adaptado a RLM | No disponible | No disponible | Alternativa RLM de mayor escala, citada en la model card como referencia de nomenclatura; no se publican comparativas de rendimiento entre ambos |

No se dispone de comparativas de benchmarks entre estos modelos en la información proporcionada, por lo que la tabla compara únicamente características estructurales y de disponibilidad.

## Limitaciones y advertencias

- Rendimiento real muy bajo: solo obtiene recompensa 1 en 1 de 3 tareas medidas. Es un warm start, no un RLM terminado.
- Riesgo de sobreinterpretación de las cifras: las 103 tareas OOLONG empleadas pasaron íntegramente por el profesor que generó las trazas de SFT, de modo que los conjuntos «held-out» lo están respecto al split de SFT, no respecto al profesor. Las métricas no miden generalización.
- La pérdida de validación tampoco es una medida de generalización por el mismo motivo, y además el entrenamiento sobreajusta a partir del paso 50 (validación 1,31 → 1,62 entre los pasos 50 y 70, con pérdida de entrenamiento cayendo a 0,14).
- Modos de fallo conocidos: bucles y repetición cuando el modelo se atasca; manejo frágil de fechas y expresiones regulares (por ejemplo, regex que no casan con el formato de fecha real); uso muy infrecuente de la llamada al submodelo `llm_query` que ofrece el system prompt de RLM.
- No es un asistente generalista. Fue entrenado solo con tareas de razonamiento agregado sobre contexto largo; ante cualquier otra petición tenderá a emitir código REPL en lugar de responder.
- Riesgo de seguridad: los kernels CUDA y el código REPL que genera deben tratarse como código no confiable y ejecutarse siempre en entornos aislados.
- Sesgos: no se documentan análisis de sesgo en la información disponible.
- Longitud de contexto: no se publica ninguna cifra, por lo que no puede garantizarse un comportamiento correcto más allá de lo que el harness externalice.
- Idioma: solo inglés declarado; no hay soporte multilingüe documentado.
- Licencia Apache 2.0, que permite uso comercial, pero el modelo base y el profesor del linaje tienen licencias no especificadas en la información disponible; conviene verificarlas antes de un uso comercial en cadena.
- Sin RL: el autor no ha ejecutado RL ni GRPO sobre este checkpoint y no reclama cifras asociadas.
- Adopción prácticamente nula: 0 descargas y 1 like en el momento de la consulta; no hay señales de uso en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jucamohedano/rlm-laguna-xs2-dense-3b-v0.1
- Modelo base: https://huggingface.co/EvanOLeary/laguna-xs2-dense-k8-cuda-sft-v2
- Perfil del autor del linaje denso: https://huggingface.co/EvanOLeary
- Modelo profesor (MoE de Poolside AI): https://huggingface.co/poolside/Laguna-XS.2
- Receta y código de densificación y SFT CUDA: https://github.com/Tyronita/laguna-dense-cuda-kernels
- Procedencia de la selección de expertos: https://github.com/cm2435/laguna-xs2-expert-coactivation-scheduling
- Paper de Recursive Language Models (Alex Zhang et al.): https://arxiv.org/abs/2512.24601
- Blogpost sobre RLM: https://alexzhang13.github.io/blog/2025/rlm/
- Repositorio del proyecto RLM: https://github.com/alexzhang13/rlm
- Dataset de tareas de contexto largo OOLONG: https://huggingface.co/datasets/oolongbench/oolong-synth
- Modelo RLM de referencia citado por el autor: https://huggingface.co/mit-oasys/rlm-qwen3-30b-a3b-v0.1
- Dataset de kernels CUDA de Sakana (AI-CUDA-Engineer-Archive): mencionado en la model card, sin URL en la información disponible
- Trainer y entorno multi-turno prime-rl / verifiers (Prime Intellect): mencionados en la model card, sin URL en la información disponible
