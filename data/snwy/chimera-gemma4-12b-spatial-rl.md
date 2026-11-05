# snwy/chimera-gemma4-12b-spatial-rl

## Resumen

chimera-gemma4-12b-spatial-rl es un ajuste fino del modelo multimodal google/gemma-4-12B-it orientado especificamente al razonamiento espacial 3D y al razonamiento sobre multiples imagenes. Lo desarrolla el usuario snwy y se distribuye como un checkpoint "tentativo" de la fase de RL F7 (paso 200), lo que indica que el autor lo considera una version intermedia y no necesariamente una release estable. El modelo resuelve el problema del razonamiento geometrico y espacial en tareas visuales, un punto historicamente debil en los VLM genericos: orientacion relativa de objetos, reconstruccion mental de escenas y puzzles visuales.

El pipeline de entrenamiento combina SFT sobre SenseNova-SI-8M, los splits de entrenamiento de MindCube y OmniSpatial, y puzzles Jigsaw generados sinteticamente, seguido de GRPO con modo thinking nativo. Los pesos son el modelo Gemma4UnifiedForConditionalGeneration sin injertos adicionales (el fichero `chimera_new.pt` contiene pesos de proyector no utilizados en esta configuracion). El checkpoint tiene 11.959.730.176 parametros (aproximadamente 12B) y un repositorio de 26,0 GB en safetensors.

Es relevante ahora porque demuestra que el RL con GRPO aplicado sobre un VLM abierto de 12B puede empujar el rendimiento en benchmarks espaciales especializados (MindCube 91,7, ViewSpatial 80,9, CV-Bench 85,3) sin sacrificar capacidades de matematicas visuales (MathVista 71,6 en modo thinking). La licencia Gemma permite uso comercial bajo sus terminos, lo que lo hace evaluable para integracion en producto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gemma 4 unified (Gemma4UnifiedForConditionalGeneration), transformer multimodal con vision encoder y proyector; sin injertos (no-graft) |
| Parametros totales | 11.959.730.176 (~12B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (repo en safetensors; cuantizaciones GGUF/AWQ no publicadas) |
| Idiomas soportados | no disponible (heredados del base google/gemma-4-12B-it) |
| Licencia | Gemma (terminos de uso de Google Gemma) |
| Formato de pesos | safetensors; incluye `chimera_new.pt` (proyector, no usado en esta configuracion) |

## Arquitectura y entrenamiento

El modelo parte de google/gemma-4-12B-it, un transformer multimodal con encoder de vision y proyector hacia el espacio del modelo de lenguaje. El ajuste fino se realiza sobre la cabeza completa de Gemma4UnifiedForConditionalGeneration, preservando la interfaz de chat del base. El modo de razonamiento se activa con el turno de sistema `<|think|>`, que abre un canal de pensamiento explicito; sin ese marcador el modelo responde de forma directa con la plantilla de chat habitual.

El entrenamiento tiene dos fases. Primero SFT sobre SenseNova-SI-8M, los conjuntos de entrenamiento de MindCube y OmniSpatial, y puzzles Jigsaw generados sinteticamente. Despues, GRPO (Group Relative Policy Optimization) con thinking nativo, sin ancla KL, con overlong masking y una regla de longitud minima de pensamiento que penaliza canales de pensamiento vacios (que no obtienen recompensa). Esta regla de longitud minima es una innovacion destacable: evita el colapso del canal de razonamiento hacia respuestas vacias, un fallo comun en RL sobre modelos con thinking explicito. La ausencia de ancla KL implica que no se regulariza la divergencia respecto a la politica de referencia, lo que puede aumentar la especializacion a costa de retener comportamiento general.

## Capacidades

- Razonamiento espacial 3D: orientacion relativa entre objetos, perspectiva y reconstruccion mental de escenas a partir de imagenes.
- Razonamiento multi-imagen: comparacion y agregacion de informacion entre varias imagenes de una misma escena.
- Resolucion de puzzles visuales (Jigsaw) y tareas de rompecabezas geometricos.
- Matematicas visuales: MathVista testmini 61,8 en modo directo y 71,6 en modo thinking.
- Modo thinking explicito activable con `<|think|>` en el turno de sistema, con canal de razonamiento separado de la respuesta final.
- Respuesta directa sin razonamiento explicito usando la plantilla de chat estandar.
- Capacidades heredadas del base Gemma 4 12B-it: generacion de texto, comprension de imagen, conversacion multi-turno.
- Tool calling / function calling: no disponible (no documentado en la model card).
- Soporte de agentes y multi-step reasoning: no disponible (no documentado).
- Capacidades multilingues: no disponible (no documentado; dependen del base).
- Capacidades de audio: no disponible.

## Casos de uso

- Analisis de escenas en robotica y navegacion asistida: el modelo puede determinar relaciones espaciales entre objetos (izquierda/derecha, delante/detras, arriba/abajo) en imagenes de camara, lo que resulta util para planificacion de movimiento de bajo nivel o validacion de percepcion. Su rendimiento en ViewSpatial (80,9) y 3DSRBench (60,2 directo / 62,6 thinking) lo respalda en este nicho.
- Validacion de montajes y ensamblajes industriales: dado un par de imagenes (referencia y estado actual), el modelo compara la disposicion espacial de componentes y detecta desviaciones, apoyandose en su entrenamiento multi-imagen.
- Reconstruccion y resolucion de puzzles visuales: util en aplicaciones educativas o de ocio que requieren razonar sobre piezas y encajes; el benchmark Jigsaw (72,6 directo) es la referencia directa.
- Tutoria de geometria y visualizacion espacial: responde a preguntas de tipo "que hay a la izquierda de X" o "desde que perspectiva se ve Y", con modo thinking para explicar el razonamiento paso a paso.
- Enriquecimiento de datasets de razonamiento espacial: el modelo puede generar trazas de pensamiento y respuestas para anotacion semi-automatica de datos de entrenamiento espacial, dado su ajuste especifico en MindCube y OmniSpatial.
- Evaluacion comparativa de VLM en pipelines de investigacion: sirve como baseline especializado para medir la brecha entre modelos genericos y ajustados en tareas de razonamiento espacial, con subsets estratificados de 300 items ya definidos por el autor.
- Preprocesado de documentos tecnicos con diagramas: interpretacion de esquemas, planos y figuras con relaciones espaciales entre elementos, combinando la comprension de imagen del base con el ajuste espacial.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre subsets estratificados de 300 items (directo greedy / thinking, media de 3 semillas muestreadas):

| Benchmark | Directo | Thinking |
|---|---|---|
| MMSI-Bench | 41,2 | 40,2 |
| MindCube (tiny) | 91,7 | 91,5 |
| ViewSpatial | 80,9 | 80,2 |
| Jigsaw | 72,6 | 71,0 |
| 3DSRBench | 60,2 | 62,6 |
| CV-Bench (full) | 85,3 | no disponible |

Held-out open-ended (mismos items, greedy):

| Benchmark | Directo | Thinking |
|---|---|---|
| MathVista testmini | 61,8 | 71,6 |
| VSI-Bench | 40,8 | 41,1 |

No se han publicado resultados de benchmarks comparativos frente a otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 24 GB solo para pesos (12B x 2 bytes), mas overhead de activaciones y cache KV; en la practica se recomienda 32-48 GB para contexto moderado.
- VRAM estimada en cuantizacion de 8 bits: alrededor de 12-14 GB de pesos, con margen adicional para activaciones.
- VRAM estimada en cuantizacion de 4 bits: alrededor de 6-8 GB de pesos; viable en GPUs consumer de gama alta con contexto corto.
- GPU recomendadas: A100 40/80 GB, H100 80 GB para BF16 sin cuantizar; RTX 4090 (24 GB) viable en 8 bits o 4 bits; RTX 3090 (24 GB) similar.
- Cabe en consumer GPU: si, en RTX 4090/3090 con cuantizacion 8 o 4 bits; en BF16 completo queda justo o no cabe por activaciones.
- Opciones de despliegue: vLLM, TGI, llama.cpp/Ollama (requiere conversion a GGUF, no publicada), transformers con `Gemma4UnifiedForConditionalGeneration`.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Razonamiento espacial | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| chimera-gemma4-12b-spatial-rl | ~12B | no disponible | Especializado (MindCube 91,7; ViewSpatial 80,9) | Gemma | HuggingFace (0 descargas) |
| google/gemma-4-12B-it (base) | ~12B | no disponible | Generico | Gemma | HuggingFace |
| Modelos VLM genericos de ~12B | ~12B | no disponible | No especializado | variable | variable |

No se dispone de datos de benchmarks del base ni de alternativas equivalentes en la informacion proporcionada, por lo que la comparacion cuantitativa de rendimiento queda como no disponible.

## Limitaciones y advertencias

- Checkpoint tentativo: el propio autor lo etiqueta como "tentative checkpoint" de la fase RL F7 (paso 200); no es una release estable ni validada de forma independiente.
- Cero descargas y cero likes en HuggingFace en el momento de la ficha: sin validacion de la comunidad.
- Sesgos conocidos: no documentados; hereda los del base google/gemma-4-12B-it, no evaluados en la model card.
- Riesgo de alucinacion: no cuantificado; en tareas espaciales abiertas (VSI-Bench 40,8) el rendimiento es bajo, lo que sugiere fragilidad fuera de los benchmarks de entrenamiento.
- El modo thinking no siempre mejora al directo: en MMSI-Bench, MindCube, ViewSpatial y Jigsaw el modo directo supera al thinking, por lo que el canal de razonamiento no es universalmente beneficioso.
- Limitaciones de contexto e idioma: no documentadas; no se especifican idiomas soportados ni longitud de contexto.
- Restricciones de licencia: licencia Gemma con terminos de uso de Google; el uso comercial esta sujeto a dichos terminos y a las obligaciones de atribucion y uso aceptable.
- En produccion: al no haber cuantizaciones publicadas (GGUF/AWQ), el despliegue eficiente requiere conversion propia; el fichero `chimera_new.pt` contiene pesos de proyector no usados en esta configuracion y debe ignorarse.
- Sin soporte documentado de tool calling ni de flujos de agente, no es adecuado como orquestador de herramientas sin evaluacion adicional.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/snwy/chimera-gemma4-12b-spatial-rl
- Modelo base: https://huggingface.co/google/gemma-4-12B-it
- Terminos de licencia Gemma: https://ai.google.dev/gemma/terms
- No se han encontrado en la informacion proporcionada enlaces a papers, blogs, repositorios o demos adicionales.
