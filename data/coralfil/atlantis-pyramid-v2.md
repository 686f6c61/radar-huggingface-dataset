# Coralfil/Atlantis-Pyramid-v2

## Resumen

Atlantis-Pyramid-v2 es un modelo de lenguaje de 32.000 millones de parámetros publicado por Coralfil Inc. (Victoria, Columbia Británica, Canadá) y especializado en oceanografía, hidrología costera, acuicultura, cumplimiento normativo marino (normativa DFO canadiense) e ingeniería de restauración con biopolímeros. Se distribuye como un merge de pesos de dos modelos base: Qwen/Qwen2.5-32B-Instruct y deepseek-ai/DeepSeek-R1-Distill-Qwen-32B. El resultado es un modelo denso de 32B parámetros (el merge no suma parámetros: combina dos juegos de pesos del mismo tamaño).

La propuesta del autor es sustituir la "confabulación" de los modelos generalistas por derivaciones científicas deterministas y primacía normativa en el dominio marino. Para ello declara un ajuste RS-LoRA (rank 16, alpha 32) sobre currículos de dominio seguido de un merge esférico de parámetros, con recetas de cuantización AWQ W4A16 y FP8 nativo, una ventana de contexto nativa de 32.768 tokens (ampliable a 128k con YaRN) y un consumo de VRAM de 18,4 GB en inferencia, lo que permitiría servirlo en una sola GPU de consumo RTX 3090/4090.

El modelo es relevante por su enfoque vertical: en lugar de competir en capacidades generales, apunta a un nicho regulatorio y científico concreto con licencia Apache 2.0. Sin embargo, la ficha debe leerse con cautela: la model card incluye cifras contradictorias entre su propio model-index y sus tablas comparativas, y el repositorio no tiene descargas ni validación externa en el momento de la consulta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (decoder-only) resultante del merge de dos modelos Qwen2.5 de 32B: Qwen2.5-32B-Instruct y DeepSeek-R1-Distill-Qwen-32B |
| Parámetros totales | 32B (declarados; "dual 32B base merged") |
| Parámetros activos | no aplica; no es un modelo MoE |
| Longitud de contexto | 32.768 tokens nativo; ampliable a 128k mediante YaRN |
| Tipos de cuantización | AWQ W4A16 (GEMM, group size 128) y FP8 nativo; se citan también kernels CUDA 12.x, TensorRT-LLM y vLLM |
| Idiomas soportados | en (inglés) únicamente |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería transformers); checkpoints AWQ y FP8 según la model card; no se confirma GGUF |
| Método de ajuste | RS-LoRA, rank 16, alpha 32, targets q, k, v, o, gate, up, down_proj, seguido de merge esférico de parámetros |
| VRAM de inferencia declarada | 18,4 GB (cuantización AWQ) |
| Runtime de servicio | vLLM >= 0.6.0, TensorRT-LLM, Ollama |
| Hardware declarado | NVIDIA CUDA 12.x (RTX 3090/4090, A10, A100) |
| Dominio principal | Oceanografía física (TEOS-10), bioquímica marina, cumplimiento DFO, acuicultura |
| Fecha de creación / actualización | 2026-10-09 / 2026-10-12 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen2.5-32B-Instruct: un transformer decoder-only denso con atención por consultas agrupadas (GQA) y RoPE, entrenado originalmente por Alibaba. Sobre esa base, Coralfil parte de dos linajes: el instruct generalista (Qwen2.5-32B-Instruct) y un destilado de razonamiento (DeepSeek-R1-Distill-Qwen-32B). El proceso descrito consiste en un ajuste RS-LoRA (rank 16, alpha 32) aplicado a las proyecciones q, k, v, o, gate, up y down sobre currículos de dominio marino, seguido de un merge de parámetros descrito como "esférico" que fusiona ambos linajes en un único juego de pesos de 32B. La model card menciona además un mecanismo propietario de memoria y caché denominado "Deep Dive Hexactine Graph Memory" con grado 6 (una retícula ortogonal de seis ejes inspirada en las esponjas de cristal del Pacífico), cuya implementación no se detalla técnicamente ni se publica como código.

No se especifica en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si hubo fases de RLHF o DPO. Se citan dos conjuntos de datos propios: Coralfil/atlantis-ocean-master y Coralfil/AboveBoard-Marine-52 (este último usado como benchmark). El ajuste se orienta a dos objetivos declarados: derivaciones científicas deterministas en el dominio oceánico y "primacía estatutaria", es decir, priorizar la norma regulatoria sobre la respuesta genérica. La aceleración se apoya en kernels de NVIDIA CUDA 12.x, con soporte explícito para vLLM y TensorRT-LLM.

## Capacidades

- Generación de texto conversacional en inglés, con modo instructivo y trazas de razonamiento heredadas del destilado de DeepSeek-R1.
- Razonamiento multi-paso y cadena de pensamiento (CoT), evaluado en BBH 3-shot y MATH-Hard 4-shot.
- Razonamiento científico de nivel de posgrado en el dominio declarado (GPQA Diamond 0-shot CoT declarado en 51,6, con una cifra contradictoria de 94,6 en otra tabla de la propia model card).
- Conocimiento especializado en oceanografía física, con mención explícita al estándar TEOS-10 para propiedades termodinámicas del agua de mar.
- Cumplimiento normativo marino canadiense (DFO): el autor declara 100,0 de precisión en la métrica "Statutory Marine Compliance" del benchmark AboveBoard-Marine-52.
- Aplicaciones de acuicultura y restauración costera con biopolímeros.
- Integración vía API compatible con endpoints y despliegue en vLLM, TensorRT-LLM y Ollama.
- No se documenta soporte explícito de tool calling, function calling ni de agentes multi-paso, aunque el material de Coralfil menciona sistemas multiagente para telemetría marina.
- No se documentan capacidades de visión, audio ni multimodalidad.
- Capacidad multilingüe limitada al inglés según el campo `language` del repositorio.

## Casos de uso

- Cumplimiento normativo pesquero y marino: el modelo puede revisar documentación de proyectos y contrastarla con requisitos estatutarios canadienses, aprovechando el ajuste específico sobre normativa DFO y la métrica declarada del 100,0 en cumplimiento estatutario del benchmark AboveBoard-52.
- Acuicultura industrial: asistencia en la interpretación de parámetros de calidad de agua, biomasa y sanidad de cultivos, con respuestas ancladas en vocabulario técnico marino en lugar de generalista.
- Oceanografía física operativa: cálculo y explicación de magnitudes termodinámicas del agua de mar bajo el estándar TEOS-10 (salinidad absoluta, temperatura potencial, densidad), útil como copiloto de investigación.
- Evaluación ambiental y permisos costeros: gestión de expedientes largos en una ventana de 32.768 tokens, con resumen y extracción de obligaciones regulatorias de documentos extensos.
- Restauración de ecosistemas costeros: apoyo en la redacción de planes de restauración con biopolímeros y en la justificación técnica de intervenciones.
- Generación de informes técnicos y científicos: redacción de secciones metodológicas y resúmenes ejecutivos a partir de datos de sensores y notas de campo.
- Despliegue soberano en infraestructura propia: al caber en 18,4 GB de VRAM y publicarse bajo Apache 2.0, permite mantener datos oceanográficos y regulatorios dentro de la organización sin depender de API en la nube.
- Integración en pipelines de monitorización: exposición mediante vLLM u Ollama para procesar telemetría de sensores marinos y generar alertas textuales en un sistema multiagente.

## Benchmarks y rendimiento

Resultados declarados por el autor en el model-index oficial del repositorio (ninguno marcado como verificado):

| Tarea | Benchmark | Métrica | Valor |
|---|---|---|---|
| Seguimiento de instrucciones | IFEval | Strict Accuracy | 83,4 |
| Razonamiento complejo | BBH (Big-Bench Hard) | 3-Shot CoT Accuracy | 85,2 |
| Ciencia de posgrado | GPQA Diamond | 0-Shot CoT Accuracy | 51,6 |
| Matemáticas de competición | MATH-Hard | 4-Shot CoT Accuracy | 68,9 |
| Razonamiento multidisciplinar | MMLU-Pro | 5-Shot Accuracy | 64,7 |
| Dominio marino y estatutario | AboveBoard 52 Marine Benchmark | Overall Accuracy | 97,1 |
| Cumplimiento estatutario marino | AboveBoard 52 Marine Benchmark | Statutory Marine Compliance | 100,0 |

La model card incluye además una tabla comparativa con terceros que presenta cifras incompatibles con las anteriores y con modelos de referencia no verificables públicamente (por ejemplo, GPQA Diamond 94,6, ARC-AGI 97,5, SWE-Bench 77,8, AIME 92,6, y comparaciones contra "Claude 4.5 Sonnet" y "Gemini Flash 3.8"). Esas cifras no se reproducen aquí como resultados fiables; se señalan en la sección de limitaciones. La tabla de progresión generacional del propio autor declara Open LLM Leaderboard v2 en 67,27, IFEval 83,4, BBH 85,2, MATH-Hard 68,9, GPQA Diamond 51,6, MMLU-Pro 64,7 y Elo estimado en LMSYS Arena de 1248.

## Requisitos de hardware

- VRAM en inferencia (AWQ W4A16): 18,4 GB declarados por el autor. Cabe en una RTX 3090 o RTX 4090 de 24 GB con contexto corto.
- VRAM en FP8: aproximadamente 32-34 GB estimados a partir del tamaño del modelo; requiere A100 40 GB, L40S o H100.
- VRAM en BF16/FP16 sin cuantizar: aproximadamente 64 GB de pesos, más caché KV; requiere A100 80 GB o dos GPU de 40 GB.
- Caché KV: estimación propia a partir de la configuración habitual de Qwen2.5-32B (64 capas, 8 cabezas KV, head_dim 128, FP16), en torno a 256 KB por token; unos 2,1 GB a 8k tokens y unos 8,6 GB a 32.768 tokens. Con AWQ a contexto completo, el total superaría los 24 GB de una GPU de consumo.
- GPU recomendadas por escenario: RTX 3090/4090 para AWQ con contexto reducido; A10 o A100 40 GB para AWQ o FP8 en producción; H100 para FP8 con contexto largo o mayor concurrencia.
- Cabe en GPU de consumo: sí, en RTX 3090 o RTX 4090 con cuantización AWQ y ventana de contexto moderada.
- Opciones de despliegue: vLLM >= 0.6.0, TensorRT-LLM, Ollama. La librería base declarada es transformers.
- Latencia y throughput: no disponibles. No se publican mediciones de tokens por segundo ni de latencia por petición.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Idiomas | Rendimiento declarado | Disponibilidad |
|---|---|---|---|---|---|---|
| Atlantis-Pyramid-v2 | 32B (denso, merge) | 32.768 nativo, 128k con YaRN | Apache 2.0 | en | IFEval 83,4; MMLU-Pro 64,7; AboveBoard 52 97,1 | HuggingFace, 0 descargas |
| Qwen/Qwen2.5-32B-Instruct | 32B | 32.768 nativo, 128k con YaRN | Apache 2.0 (Qwen) | multilingüe | Referencia base del merge | Ampliamente desplegado |
| deepseek-ai/DeepSeek-R1-Distill-Qwen-32B | 32B | 32.768 (Qwen2.5) | MIT (según el repositorio original) | multilingüe | Fuerte en razonamiento y matemáticas | Ampliamente desplegado |
| Cohere Command R+ | 104B | 128k | CC-BY-NC 4.0 (no comercial) | multilingüe | Usado por el autor como referencia; GPQA 61,2 declarado por Coralfil | API y pesos con restricciones |

Los dos modelos base del merge son las alternativas naturales y están accesibles sin restricciones para reproducir o comparar. La ventaja diferencial de Atlantis-Pyramid-v2 se limita al nicho marino y regulatorio, donde el autor declara ganancias de hasta 29,8 puntos sobre Qwen2.5-32B-Instruct en su propio benchmark AboveBoard-52; esa cifra procede de un benchmark propietario del mismo autor y no ha sido replicada por terceros.

## Limitaciones y advertencias

- Contradicciones internas en la model card: el model-index declara GPQA Diamond en 51,6 mientras que una tabla comparativa del mismo documento declara 94,6; ARC-AGI en 97,5 y SWE-Bench en 77,8 no aparecen en el model-index ni están verificados.
- Comparaciones contra modelos no verificables: "Claude 4.5 Sonnet" y "Gemini Flash 3.8" no son identificables como versiones públicas conocidas, lo que resta credibilidad a la tabla comparativa.
- Benchmarks no verificados: el campo `verified` es falso en todos los resultados del model-index y el benchmark AboveBoard-52 es propiedad del propio autor del modelo, sin validación independiente.
- Riesgo de alucinación crítico en uso estatutario: un modelo que declara primacía normativa y 100 de cumplimiento puede generar confianza indebida; toda salida regulatoria debe ser revisada por un profesional cualificado.
- Sesgos: sesgo de dominio (entrenado para el contexto regulatorio canadiense y la costa del Pacífico), con posible infrarrepresentación de otras jurisdicciones y ecosistemas.
- Limitación de idioma: solo inglés. No hay soporte declarado de castellano ni de otras lenguas, lo que limita su uso en administraciones hispanohablantes.
- Adopción nula: 0 descargas y 0 likes en el momento de la consulta, sin evidencia de uso en producción ni comunidad que reporte comportamiento real.
- Opacidad técnica: no se publican tokens de entrenamiento, composición del dataset, proceso de RLHF/DPO ni implementación del mecanismo "Hexactine"; tampoco hay código asociado.
- Mecanismo propietario no auditable: las afirmaciones sobre memoria gráfica de grado 6 no vienen acompañadas de especificación ni de evaluación reproducible.
- Licencia: Apache 2.0 permite uso comercial sin restricciones de atribución más allá de las habituales, pero la licencia del modelo no cubre posibles reclamaciones sobre datos de entrenamiento no documentados.
- Requisitos reales de VRAM: la cifra de 18,4 GB corresponde a AWQ y contexto corto; con contexto de 32k el consumo crece y puede superar los 24 GB de una GPU de consumo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Coralfil/Atlantis-Pyramid-v2
- Model card (README): https://huggingface.co/Coralfil/Atlantis-Pyramid-v2/blob/main/README.md
- Repositorio relacionado del autor: https://huggingface.co/Coralfil-Atlantis/Atlantis-Pyramid
- Dataset de dominio: https://huggingface.co/datasets/Coralfil/atlantis-ocean-master
- Benchmark marino del autor: https://huggingface.co/datasets/Coralfil/AboveBoard-Marine-52
- Modelo base 1: https://huggingface.co/Qwen/Qwen2.5-32B-Instruct
- Modelo base 2: https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Qwen-32B
- Sitio del producto: https://atlantis-llm.io/
- Artículo de investigación del autor: https://coralfil.com/research/articles/article_3_atlantis_ai_agents
- Ficha en registro de terceros: https://free2aitools.com/model/coralfil/atlantis-pyramid-v2
