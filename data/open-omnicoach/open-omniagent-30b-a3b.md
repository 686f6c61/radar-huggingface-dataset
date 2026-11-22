# Open-OmniCoach/Open-OmniAgent-30B-A3B

## Resumen

Open-OmniAgent-30B-A3B es un agente de video omni-modal con percepción activa desarrollado por Open-OmniCoach, un grupo de investigacion vinculado a Weisong Liu, Xiangtai Li, Haochen Wang, Haiquan Wen y Zhaoxiang Zhang. Se construye mediante fine-tuning sobre Qwen/Qwen3-Omni-30B-A3B-Instruct y esta disenado para resolver tareas de comprension de video de larga duracion donde el modelo debe decidir activamente que fragmentos de video, audio o clips consultar antes de responder.

El modelo parte de la arquitectura Qwen3-Omni-MoE (tag `qwen3_omni_moe`), con aproximadamente 35.260 millones de parametros totales en pesos safetensors y un repositorio de 70,5 GB. Su innovacion principal es la invocacion nativa de herramientas multi-span (`get_frames`, `get_audio`, `get_clip`, `get_multi_span`) que permiten al agente muestrear selectivamente evidencia audiovisual en videos largos en lugar de procesar el video completo de una vez.

Es relevante porque mejora de forma medible el rendimiento de su modelo base en benchmarks de video omni-modal (58,1% de media en Omni-Video 5-Benchmark, +5,4 pp sobre Qwen3-Omni-30B-A3B) y en video largo centrado en vision (75,9% en Video-MME, 63,5% en LVBench). Se distribuye bajo licencia Apache 2.0. En el momento de redactar esta ficha, el repositorio esta inicializado pero los pesos del checkpoint aun no se han subido (estado declarado: "checkpoint weights will be uploaded upon public release").

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3-Omni-MoE (transformer multimodal con mezcla de expertos), fine-tuning sobre Qwen3-Omni-30B-A3B-Instruct |
| Parametros totales | 35.259.818.545 (~35,26 mil millones) |
| Parametros activos | no disponible (el nombre del modelo sugiere ~3B activos, pero no se confirma en la informacion proporcionada) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura Qwen3-Omni-MoE de su base, un transformer multimodal con mezcla de expertos orientado a entrada y salida omni-modal (texto, vision y audio). Sobre esa base, Open-OmniCoach aplica un pipeline de entrenamiento en dos fases: primero un SFT multi-span con reflexion sobre el dataset OmniCoach-240K, y despues un entrenamiento por refuerzo que combina SEPO y Turn-Level GSPO. Este esquema de RL por turnos esta disenado para optimizar trayectorias de agente con multiples pasos de invocacion de herramientas antes de emitir la respuesta final.

La innovacion tecnica destacable es el uso nativo de herramientas multi-span (`get_frames`, `get_audio`, `get_clip`, `get_multi_span`), que permiten al agente seleccionar dinamicamente evidencia audiovisual en videos largos. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion detallada del dataset ni los detalles del proceso de RLHF/DPO mas alla de lo indicado.

## Capacidades

- Comprension de video omni-modal: procesa video, audio y texto de forma conjunta para responder preguntas sobre contenido audiovisual.
- Percepcion activa: invoca herramientas (`get_frames`, `get_audio`, `get_clip`, `get_multi_span`) para muestrear fragmentos concretos de videos largos antes de responder.
- Razonamiento multi-paso orientado a agentes: entrenado con RL por turnos (SEPO + Turn-Level GSPO) para trayectorias de multiples pasos.
- Video de larga duracion: evaluado especificamente en Video-MME, Video-MME v2 y LVBench.
- Capacidades de audio-visual: el tag `audio-visual` y la herramienta `get_audio` indican soporte de entrada de audio.
- Capacidades de texto y vision heredadas del modelo base Qwen3-Omni-30B-A3B-Instruct (no detalladas en la informacion proporcionada).
- Capacidades multilingues: no disponible.
- Modo thinking explicito: no disponible en la informacion proporcionada.

## Casos de uso

- Analisis de videos largos de vigilancia o monitorizacion: el agente puede invocar `get_multi_span` para localizar eventos concretos en grabaciones de horas sin procesar el video completo, gracias a su percepcion activa entrenada con RL.
- Revision de reuniones y clases grabadas: usando `get_audio` y `get_clip`, el modelo puede extraer fragmentos de audio y video relevantes para responder preguntas sobre lo tratado, adecuado por su rendimiento en Video-MME y LVBench.
- Moderacion de contenido audiovisual: el muestreo selectivo de frames y clips permite inspeccionar segmentos sospechosos de videos largos de forma dirigida y eficiente.
- Asistencia en produccion audiovisual: busqueda de planos, momentos o declaraciones concretas en material de archivo mediante consultas en lenguaje natural y recuperacion multi-span.
- Analisis de retransmisiones deportivas o eventos en directo: la combinacion de audio y video con herramientas de muestreo permite responder preguntas sobre jugadas o comentarios concretos.
- Investigacion en agentes multimodales: el modelo y el kit de evaluacion (`video-agent-evalkit`) sirven como base reproducible para experimentar con politicas de percepcion activa en video.
- Descripcion accesible de contenido audiovisual: generacion de resumenes y descripciones de videos largos para usuarios con discapacidad visual o auditiva, apoyandose en la entrada conjunta de audio y video.

## Benchmarks y rendimiento

Datos publicados en la model card del autor (comparacion con Qwen3-Omni-30B-A3B):

| Benchmark | Open-OmniAgent-30B-A3B | Mejora vs. base |
|---|---|---|
| Omni-Video 5-Benchmark (media) | 58,1% | +5,4 pp |
| LVOmniBench | no disponible (solo se indica la mejora) | +12,2 pp |
| OmniVideoBench | no disponible (solo se indica la mejora) | +9,5 pp |
| Video-MME | 75,9% | +5,4 pp |
| Video-MME v2 | 44,4% | +10,3 pp |
| LVBench | 63,5% | +13,3 pp |

No se han publicado en la informacion disponible los valores absolutos de LVOmniBench ni OmniVideoBench, ni resultados de benchmarks de texto (MMLU, GSM8K, HumanEval) o de otros modelos comparables.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Con 35,26 mil millones de parametros totales y arquitectura MoE, en BF16 los pesos ocuparian aproximadamente 70 GB; en cuantizacion de 8 bits, en torno a 35 GB; en 4 bits, en torno a 18-20 GB (estimaciones a partir del tamano de parametros, no confirmadas por el autor).
- GPU recomendadas: no disponibles en la informacion proporcionada. Por volumen de pesos, se requeririan GPUs de clase A100/H100 (80 GB) para BF16, o configuraciones multi-GPU.
- Cabe en GPU de consumo: no confirmado; probablemente solo con cuantizaciones agresivas y verificacion previa, dado el tamano total.
- Opciones de despliegue: el autor indica servir con SGLang o vLLM-Omni (ver `docs/deployment.md` del repositorio) y evaluar con `evalkit/` o `scripts/infer.py`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros totales | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Open-OmniAgent-30B-A3B | ~35,26 B (MoE) | no disponible | Agente de video omni-modal con percepcion activa | Apache 2.0 | Pesos pendientes de publicacion |
| Qwen3-Omni-30B-A3B-Instruct | ~30 B (MoE, segun nombre) | no disponible | Omni-modal base (texto, vision, audio) | no disponible en la informacion | Publico en Hugging Face |
| Otros agentes de video comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

La unica comparacion documentada es contra su modelo base Qwen3-Omni-30B-A3B-Instruct, sobre el que mejora entre 5,4 y 13,3 pp en los benchmarks citados. No se dispone de datos de otros agentes de video omni-modales para una comparativa adicional.

## Limitaciones y advertencias

- Pesos no publicados: el repositorio esta inicializado pero los checkpoints aun no se han subido; no es posible usarlo en produccion en el momento de redactar esta ficha.
- Sesgos conocidos: no documentados en la informacion proporcionada; al heredar de Qwen3-Omni, puede arrastrar los sesgos del modelo base.
- Riesgo de alucinacion: no cuantificado; los agentes de video con muestreo selectivo pueden responder sin haber consultado evidencia suficiente si la politica de herramientas falla.
- Limitaciones de contexto e idioma: no disponibles; no se especifican idiomas soportados ni longitud de contexto.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen3-Omni y de los datasets utilizados.
- Dependencia de infraestructura especifica: el despliegue recomendado requiere SGLang o vLLM-Omni, lo que limita opciones frente a stacks mas comunes como llama.cpp u Ollama.
- Rendimiento en Video-MME v2 relativamente bajo (44,4%) pese a la mejora, lo que sugiere margen de error en escenarios de video largo complejos.
- Datos de benchmarks parciales: faltan valores absolutos de varios benchmarks y no hay resultados de tareas de texto o codigo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Open-OmniCoach/Open-OmniAgent-30B-A3B
- Repositorio GitHub: https://github.com/Open-OmniCoach/omnicoach
- Pagina del proyecto: https://open-omnicoach.github.io
- Dataset OmniCoach-240K: https://huggingface.co/datasets/Open-OmniCoach/OmniCoach-240K
- Kit de evaluacion: https://github.com/Open-OmniCoach/video-agent-evalkit
- Modelo base: https://huggingface.co/Qwen/Qwen3-Omni-30B-A3B-Instruct
