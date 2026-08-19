# bzannah/Qwen3.8-27B-AEON-ULTIMATE-UNCENSORED-BF16

## Resumen

Qwen3.8-27B-AEON-ULTIMATE-UNCENSORED-BF16 es una version "abliterada" (desprovista de rechazos y restricciones de seguridad) del modelo Qwen/Qwen3.8-27B, publicada por el usuario bzannah bajo el paraguas AEON-7. El objetivo declarado del autor es eliminar la negativa del modelo a responder peticiones consideradas peligrosas o sensibles, manteniendo la coherencia del texto y la calidad de las respuestas, en lugar de perseguir una reduccion artificial de la divergencia KL como hacen otras herramientas de abliteracion publicas.

El modelo base, Qwen3.8-27B, es un modelo denso de 27.8 mil millones de parametros con capacidades multimodales (vision y texto), razonamiento configurable y una ventana de contexto nativa de 262.144 tokens. Incorpora una arquitectura hibrida que combina atencion clasica con capas Gated DeltaNet (GDN), una variante de state-space model, ademas de un modulo de vision y una cabeza de decodificacion especulativa (MTP). Esta version abliterada conserva intactos el vision tower y la cabeza MTP del modelo original, y se distribuye en precision BF16 completa.

La relevancia de este modelo radica en que ofrece una alternativa sin censura para desarrolladores e investigadores que necesitan explorar los limites de la generacion de texto sin restricciones, ya sea para estudios de alineacion, generacion de contenido creativo o pruebas de robustez. El autor ha documentado un proceso de abliteracion cuidadoso, con metricas de coherencia y tasas de rechazo, y ha validado el modelo en un NVIDIA H200 con vLLM.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hibrida: atencion + Gated DeltaNet (GDN), con vision tower y cabeza MTP |
| Parametros totales | 27.781.427.952 (27,8 B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262.144 tokens (nativo); validado a 16.384 en la prueba del autor |
| Tipos de cuantizacion | BF16 (repo oficial); NVFP4 anunciado por el autor; cuantizaciones GGUF de terceros disponibles |
| Idiomas soportados | Ingles, chino, multilingue |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B es un transformer denso de 27,8 B de parametros con una arquitectura hibrida que intercala bloques de atencion clasica con bloques Gated DeltaNet (GDN), un tipo de state-space model con convolucion 1D. Incluye un vision tower para entrada de imagenes y una cabeza MTP (multi-token prediction) para decodificacion especulativa. El contexto nativo es de 262.144 tokens y soporta razonamiento configurable (thinking mode).

El proceso de abliteracion aplicado por bzannah consta de varias etapas documentadas en la model card:

1. Reparacion de outliers en la capa SSM conv1d (etiquetada como "SSM conv1d outlier repair" de FernflowerAI).
2. Aplicacion de la herramienta abliterix 1.12.2 con 50 pruebas de Optuna, usando un juez basado en google/gemini-3.1-flash-lite para evaluar la tasa de rechazo y la coherencia de las respuestas.
3. Seleccion de la prueba 48 de 50, que logro un equilibrio entre eliminacion de rechazos (0 rechazos duros en los conjuntos de prueba) y mantenimiento de la coherencia (KL de 0,0991 nats/token respecto al modelo original).
4. Reinsercion de la cabeza MTP original (15 tensores con hash coincidente) y del vision tower (333/333 tensores sin modificar).

El autor enfatiza que no se optimizo para minimizar la KL, sino para obtener respuestas coherentes y utiles sin rechazos. El modelo resultante mantiene el thinking mode activado por defecto y soporta tool calling.

## Capacidades

- Generacion de texto y razonamiento: responde a preguntas complejas con cadenas de pensamiento visibles (thinking mode) y razonamiento configurable (low, medium, high).
- Vision-language: acepta entrada de imagenes junto con texto, gracias al vision tower intacto del modelo base.
- Tool calling y function calling: soporta invocacion de herramientas externas mediante el parser qwen3_coder en vLLM.
- Capacidades de agente: puede ejecutar tareas multi-paso y razonamiento de largo horizonte, segun las capacidades del modelo base.
- Multilingue: entrenado principalmente en ingles y chino, con soporte multilingue adicional.
- Sin rechazos: el modelo no se niega a responder peticiones que el modelo base rechazaria, incluyendo contenido potencialmente peligroso, sexual o ilegal (aunque puede incluir avisos legales o de seguridad en la respuesta).
- Decodificacion especulativa: la cabeza MTP permite acelerar la generacion con 3 tokens especulativos (aceptacion del 40-66% en las pruebas del autor).

## Casos de uso

- Investigacion en alineacion y seguridad de IA: permite estudiar como se comporta un modelo sin restricciones de seguridad, comparando respuestas con el modelo base para analizar el impacto de la abliteracion en la coherencia y la utilidad.
- Generacion de contenido creativo sin filtros: escritura de ficcion, guiones o dialogos que aborden temas tabu o controvertidos sin que el modelo se niegue a participar, manteniendo un estilo coherente.
- Asistente de codigo con tool calling: integracion en entornos de desarrollo donde se necesita invocar funciones o APIs, aprovechando el soporte nativo de function calling y la ventana de contexto larga para proyectos extensos.
- Analisis de documentos con vision: procesamiento de imagenes, capturas de pantalla o diagramas junto con texto, gracias al vision tower, para tareas de extraccion de informacion o resumen.
- Automatizacion de agentes de largo horizonte: despliegue en pipelines de agentes que requieren multiples pasos de razonamiento y acceso a herramientas, con la ventaja de no recibir rechazos en peticiones intermedias.
- Pruebas de robustez y red teaming: evaluacion de vulnerabilidades, generacion de prompts adversariales o estudio de sesgos en un modelo sin capas de seguridad, util para investigadores de seguridad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) para esta version abliterada. El autor proporciona metricas especificas del proceso de abliteracion:

| Metrica | Valor |
|---|---|
| KL media (full_distribution_kl, 100 prompts inofensivos) | 0,0991 nats/token |
| KL re-medida (persist-pass) | 0,099126 nats/token |
| Rechazos duros ("I won't") en conjunto harmful (100) | 0 |
| Rechazos duros en conjunto sexual (50) | 0 |
| Rechazos duros en conjunto inofensivo (100) | 0 |
| Tasa de rechazo del juez Flash Lite en harmful | 36/100 (frente a ~100/100 del base) |
| Tasa de rechazo del juez Flash Lite en sexual | 5/50 (frente a 30/50 del base) |
| Tasa de rechazo del juez Flash Lite en inofensivo | 1/100 (frente a 3/100 del base) |
| Aceptacion de MTP (3 tokens especulativos) | 40-66% |

Para el modelo base Qwen3.8-27B, fuentes externas citan los siguientes resultados (no verificados de forma independiente): DeepSWE 42.2, Terminal Bench 73.0, OSWorld 84.3. Estos datos corresponden al modelo original, no a esta version abliterada.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint BF16 ocupa 55,6 GB en disco. Para inferencia con contexto de 16k y batch pequeno, se necesitan al menos 70-80 GB de VRAM. Con la ventana completa de 262k, se requieren mas de 140 GB (el autor menciona "140 GB card" para el contexto nativo).
- GPU recomendadas: NVIDIA H200 (validado por el autor), A100 80GB, A100 40GB (con cuantizacion), RTX 4090 24GB solo con cuantizacion GGUF de alta compresion (posiblemente 4-bit o inferior).
- En consumer GPU: no cabe en 24 GB en BF16; con cuantizacion GGUF Q4 o inferior podria ejecutarse en una RTX 4090 o similar, aunque con perdida de calidad. Unsloth indica que el modelo base puede correr en 17 GB de RAM/VRAM con cuantizacion, pero no hay garantia para esta version abliterada.
- Opciones de despliegue: vLLM (validado con la version 0.27.1), llama.cpp, Ollama, LM Studio, TGI. El autor proporciona un comando de ejemplo con vLLM que incluye `--gdn-prefill-backend triton` y `--speculative-config` para MTP.
- Latencia y throughput: no se han publicado mediciones formales. La decodificacion especulativa con MTP (3 tokens) mejora el throughput entre un 40-66% en aceptacion de tokens, segun las pruebas del autor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Vision | Censura | Licencia | Formato |
|---|---|---|---|---|---|---|
| Qwen3.8-27B (base) | 27,8 B | 262k | Si | Si (rechazos) | Apache 2.0 | BF16, GGUF, NVFP4 |
| Qwen3.8-27B-AEON-ULTIMATE-UNCENSORED (este) | 27,8 B | 262k | Si | No (0 rechazos duros) | Apache 2.0 | BF16 (safetensors) |
| Otros abliterados de Qwen3.8-27B | 27,8 B | 262k | Variable | Parcial | Apache 2.0 | Variable |

No se dispone de comparativas con otros modelos abliterados de la misma familia en la informacion proporcionada. La diferencia principal frente al base es la eliminacion de rechazos, con una KL media de 0,0991 nats/token, lo que indica una desviacion moderada en la distribucion de salida. Frente a otros abliterados publicos, el autor afirma que su enfoque prioriza la coherencia sobre la minimizacion de KL, evitando la degradacion del modelo.

## Limitaciones y advertencias

- Ausencia de salvaguardas: el modelo puede generar contenido peligroso, ilegal, sexual o danino sin rechazarlo. El autor incluye avisos legales en algunas respuestas, pero no garantiza que esto ocurra siempre. Su uso en produccion conlleva riesgos legales y eticos significativos.
- Riesgo de alucinacion: al eliminar capas de seguridad, el modelo puede inventar informacion con mayor confianza, especialmente en dominios donde el modelo base habria dudado o rechazado.
- Coherencia no garantizada: aunque el autor reporta metricas de coherencia (longitud media, type-token ratio), no hay evaluaciones exhaustivas en todos los dominios. La abliteracion puede degradar el rendimiento en tareas especificas.
- Sesgos conocidos: el modelo base puede presentar sesgos de genero, raza o cultura, y la abliteracion no los corrige; de hecho, podria amplificarlos al eliminar filtros de contenido.
- Limitaciones de contexto: la ventana de 262k tokens requiere hardware de alta gama; en configuraciones con menos VRAM, el contexto efectivo se reduce drasticamente.
- Restricciones de licencia: aunque la licencia es Apache 2.0, el uso comercial de un modelo sin censura puede violar politicas de plataformas o leyes locales. El autor no ofrece ninguna garantia de cumplimiento legal.
- Soporte limitado: el modelo es un experimento de un solo autor, sin mantenimiento oficial ni canal de soporte. Las cuantizaciones de terceros pueden no estar alineadas con el checkpoint original.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/bzannah/Qwen3.8-27B-AEON-ULTIMATE-UNCENSORED-BF16
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Guia de Qwen3.8 en Unsloth: https://unsloth.ai/docs/models/qwen3.8
- Pagina de Qwen3.8 en LM Studio: https://lmstudio.ai/models/qwen3.8
- Blog de referencia sobre Qwen3.8-27B: https://lovableapp.org/blog/qwen3-8-27b
- Blog de AMD sobre ejecucion local de Qwen3.8: https://www.amd.com/en/blogs/2026/run-qwen-3-8-27b-on-amd-ryzen-ai-max-and-radeon-graphics-cards-day-0.html
- Modelos cuantizados de terceros: https://huggingface.co/models?other=base_model:quantized:AEON-7/Qwen3.8-27B-AEON-ULTIMATE-UNCENSORED-BF16
