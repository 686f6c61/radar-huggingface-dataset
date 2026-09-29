# Abdusin/gemma-3-4b-est-v1

## Resumen

Gemma 3 4B Estonian (v1) es un ajuste del modelo base google/gemma-3-4b-pt desarrollado por el usuario Abdusin, orientado a dotar al Gemma 3 de 4B de competencia real en estonio. El modelo parte de un Gemma 3 4B con escaso conocimiento del estonio y lo adapta mediante un pipeline de dos etapas (preentrenamiento continuado y ajuste supervisado) ejecutado con QLoRA en una unica GPU de consumo (RTX 5070 de 12 GB) durante aproximadamente 26 horas.

La arquitectura es la de Gemma 3, un transformer decoder-only multimodal de 4.300.079.472 parametros (denso, no MoE), con una ventana de contexto de hasta 128.000 tokens en la arquitectura base. Aunque Gemma 3 incorpora comprension de vision, este ajuste se ha entrenado exclusivamente sobre texto estonio, por lo que las capacidades multimodales no estan garantizadas tras el ajuste.

El modelo es relevante porque demuestra que con menos del 2% de los datos de preentrenamiento estonio usados por EstLLM-8B se puede alcanzar un rendimiento competitivo en varias tareas linguisticas estonias (inflexion y resumen), y porque su version cuantizada Q4_K_M (2,49 GB) cabe en telefonos con 6 GB o mas de memoria. Se distribuye bajo los Terminos de Uso de Gemma y en formato safetensors y GGUF.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Gemma 3, multimodal en su base) |
| Parametros totales | 4.300.079.472 (4,3B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | hasta 128.000 tokens en la arquitectura base Gemma 3; el autor recomienda un maximo de 4096 en despliegues moviles |
| Tipos de cuantizacion | bfloat16 (original); GGUF: Q4_K_M, Q5_K_M, F16 |
| Idiomas soportados | estonio (et), ingles (en); el estonio es el idioma objetivo, el ingles no fue reevaluado tras el ajuste |
| Licencia | Gemma Terms of Use (license: gemma) |
| Formato de pesos | safetensors (transformers), GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Gemma 3, un transformer decoder-only que en su version base integra un codificador de vision para entrada multimodal y una ventana de contexto de al menos 128K tokens, con un patron de atencion que reduce el coste de la KV-cache en contextos largos. Sobre esta base, el autor aplica un ajuste de dos etapas con QLoRA sobre una unica GPU de consumo:

1. **Preentrenamiento continuado** sobre 161,5 millones de tokens de texto web estonio (subconjunto estonio de FineWeb-2), empaquetados en bloques de 2048 tokens, una epoca y tasa de aprendizaje 5e-5.
2. **Ajuste supervisado (SFT)** sobre aproximadamente 30.500 ejemplos, una epoca y tasa de aprendizaje 1e-4, compuestos por 15.000 instrucciones estonias de tartuNLP/magpie-gemma-3-12b-it-100k-et, unas 2.900 respuestas destiladas del modelo abierto EstLLM-8B sobre prompts nativos estonios (explicaciones de diccionario, inflexion, comprension lectora) y unas 11.000 parejas construidas a partir de recursos linguisticos publicos: definiciones del diccionario EKI, inflexion de sintagmas nominales, correccion gramatical con objetivos gold, QA extractiva y resumen de noticias (conjuntos TalTechNLP y ERRnews).

El volumen de datos de preentrenamiento continuado (161M tokens) es reducido en comparacion con el usado por modelos estonios dedicados, lo que explica el mejor rendimiento en tareas de forma linguistica que en tareas de conocimiento del mundo. El entrenamiento completo consumio aproximadamente 26 horas en una RTX 5070 de 12 GB.

## Capacidades

- Generacion de texto y conversacion en estonio, con plantilla de chat compatible con el tokenizador de Gemma.
- Inflexion nominal y morfologia estonia (tarea evaluada con 1.400 ejemplos).
- Explicacion de significados de palabras a partir de definiciones del diccionario EKI.
- Correccion gramatical con objetivos de referencia (1.000 ejemplos evaluados).
- Comprension lectora y QA extractiva sobre textos estonios.
- Resumen de noticias en estonio (evaluado con ROUGE-L sobre 523 ejemplos).
- Respuesta a preguntas de trivia y examenes nacionales estonios (8 asignaturas), con rendimiento limitado.
- Soporte de tool calling / function calling: no disponible (no documentado en la informacion proporcionada).
- Capacidades de agente y razonamiento multi-paso: no disponible (no documentado).
- Capacidades multimodales (vision): presentes en la arquitectura base, pero no evaluadas ni garantizadas tras el ajuste exclusivamente textual.

## Casos de uso

- **Correccion gramatical y de estilo en estonio**: el modelo fue ajustado especificamente con el conjunto grammar_et (con objetivos gold) y alcanza 0,223 de exact match, por lo que puede integrarse en editores o correctores para textos academicos y profesionales en estonio.
- **Inflexion y morfologia asistida**: con 0,779 de exact match en la tarea de inflexion, es adecuado para herramientas de generacion de formas nominales y casos, util en ensenanza del estonio o en sistemas de generacion de lenguaje controlado.
- **Resumen de noticias estonias**: el modelo supera a EstLLM-8B en ROUGE-L (0,162 frente a 0,152) en el corpus ERRnews, lo que lo hace apto para resumenes automaticos de prensa en estonio en redacciones o agregadores.
- **Explicacion de vocabulario y definiciones**: entrenado con definiciones del diccionario EKI, puede emplearse en aplicaciones de aprendizaje de idiomas para explicar el significado de palabras estonias en contexto.
- **Atencion al cliente en estonio**: dado su tamano reducido (2,49 GB en Q4_K_M), puede desplegarse en infraestructura modesta para gestionar conversaciones multi-turno con estonios hablantes.
- **Inferencia en dispositivo (movil)**: con el GGUF Q4_K_M cabe en telefonos con 6 GB o mas de RAM y funciona con PocketPal AI o ChatterUI; util para asistentes de idioma offline y traduccion de apoyo.
- **QA sobre documentacion interna en estonio**: puede usarse para responder preguntas extractivas sobre corpus de textos estonios ya indexados, apoyandose en su contexto configurable.
- **Procesamiento por lotes en pipelines ligeros**: al ser un modelo de 4B, es viable ejecutar batches grandes con llama.cpp o vLLM en GPUs de consumo para tareas de clasificacion, extraccion o normalizacion textual en estonio.

## Benchmarks y rendimiento

Evaluados con el harness oficial de benchmarks de LLM en estonio (LREC 2026, Lillepalu & Alumäe), con conjuntos de test completos, zero-shot y plantilla de chat. Los numeros de modelos de referencia publicados proceden del articulo del benchmark (arXiv:2510.21193).

| Tarea (exact match salvo indicacion) | Gemma-3-4B-it (base) | Este modelo | EstLLM-8B (publicado) |
|---|---|---|---|
| Inflexion (1.400) | 0,107 | 0,779 | 0,811 |
| Significados de palabras (1.000) | 0,133 | 0,252 | 0,327 |
| Correccion gramatical (1.000) | 0,083 | 0,223 | 0,275 |
| Trivia (800) | no disponible | 0,276 | 0,586 |
| Resumen de noticias, ROUGE-L (523) | ~0,07 | 0,162 | 0,152 |
| Examen nacional (1.614, macro sobre 8 asignaturas) | no disponible | 0,445 | 0,575 |
| **Media de 6 tareas** | no disponible | 0,356 | 0,454 |

Para contexto, el autor indica que Qwen3-4B-Instruct obtiene 0,212 y Llama-3.1-8B-Instruct 0,244 en la version publicada de este benchmark. El modelo supera a EstLLM-8B en resumen (ROUGE-L) y se mantiene competitivo en inflexion, pese a ser un modelo de 4B entrenado con menos del 2% de los datos de preentrenamiento estonio de EstLLM.

## Requisitos de hardware

- **VRAM en bfloat16 (safetensors)**: aproximadamente 8-9 GB para pesos mas overhead de activaciones; recomendable GPU de 12 GB o mas.
- **VRAM en GGUF Q4_K_M**: 2,49 GB de archivo; ejecutable con 6 GB de RAM/VRAM o mas (incluidos telefonos).
- **VRAM en GGUF Q5_K_M**: 2,83 GB de archivo.
- **VRAM en GGUF F16**: 7,77 GB de archivo.
- **GPU de entrenamiento**: el autor uso una unica RTX 5070 de 12 GB con QLoRA durante unas 26 horas.
- **GPU recomendadas**: cualquier GPU consumer con 8 GB o mas para las cuantizaciones GGUF; RTX 3090/4090 o superiores para bfloat16; A100/H100 no necesarias por el tamano del modelo.
- **Cabe en GPU de consumo**: si; en Q4_K_M funciona en telefonos con 6 GB+ y en GPUs integradas o discretas de gama media.
- **Opciones de despliegue**: transformers (Gemma3ForConditionalGeneration), llama.cpp, Ollama, LM Studio, vLLM; en movil, PocketPal AI y ChatterUI.
- **Latencia y throughput estimados**: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque | Rendimiento en benchmark estonio |
|---|---|---|---|---|---|
| **gemma-3-4b-est-v1 (este modelo)** | 4,3B | hasta 128K (base), 4096 recomendado en movil | Gemma Terms of Use | Estonio (QLoRA, 2 etapas) | Media 6 tareas: 0,356 |
| EstLLM-8B (Llama-3.1-EstLLM-8B-Instruct-1125) | 8B | no disponible en la informacion | no disponible en la informacion | Estonio dedicado, >2% de datos adicionales | Media 6 tareas: 0,454 |
| Qwen3-4B-Instruct | ~4B | no disponible | Apache 2.0 (segun el modelo original; no confirmado aqui) | Multilingue general | Benchmark publicado: 0,212 |
| Llama-3.1-8B-Instruct | 8B | no disponible | Llama license | Multilingue general | Benchmark publicado: 0,244 |
| Gemma-3-4B-it (base) | 4,3B | 128K | Gemma Terms of Use | Multilingue general | Inflexion 0,107; significados 0,133; gramatica 0,083 |

El modelo se posiciona como una alternativa de 4B especializada en estonio que, sin alcanzar a EstLLM-8B en conocimiento del mundo y examenes, iguala o supera a modelos generalistas del mismo tamano e incluso a Llama-3.1-8B en el benchmark completo, y mejora a EstLLM-8B en resumen.

## Limitaciones y advertencias

- **Idioma**: entrenado principalmente para estonio; el ingles y otras lenguas no se reevaluaron tras el ajuste y pueden haber degradado.
- **Conocimiento del mundo limitado**: las tareas de trivia y examenes nacionales quedan por detras de modelos estonios mas grandes; el corpus de preentrenamiento continuado es de solo 161M tokens.
- **Alucinacion**: se aplican las advertencias habituales de los LLM; puede generar informacion incorrecta con seguridad y no debe usarse para decisiones medicas, legales o de alto riesgo.
- **Vision no verificada**: aunque la arquitectura base es multimodal, el ajuste fue exclusivamente textual, por lo que las capacidades de vision no estan garantizadas.
- **Contexto practico**: aunque la base soporta 128K tokens, el autor recomienda limitar a 4096 tokens en despliegues moviles por restricciones de memoria.
- **Licencia**: hereda los Terminos de Uso de Gemma, que imponen condiciones especificas de uso y redistribucion que deben revisarse antes de un despliegue comercial.
- **Tool calling y agentes**: no disponibles ni documentados; no se debe asumir soporte de function calling en produccion.
- **Rendimiento en tareas duras**: la media de 0,356 frente a 0,454 de EstLLM-8B y el 0,276 en trivia indican un modelo apto para tareas linguisticas de forma, no para conocimiento factual complejo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Abdusin/gemma-3-4b-est-v1
- Modelo base: https://huggingface.co/google/gemma-3-4b-pt
- Variante instruct de la base: https://huggingface.co/google/gemma-3-4b-it
- Dataset FineWeb-2: https://huggingface.co/datasets/HuggingFaceFW/fineweb-2
- Dataset magpie-gemma-3-12b-it-100k-et: https://huggingface.co/datasets/tartuNLP/magpie-gemma-3-12b-it-100k-et
- Modelo profesor EstLLM-8B: https://huggingface.co/tartuNLP/Llama-3.1-EstLLM-8B-Instruct-1125
- Dataset word_meanings_et: https://huggingface.co/datasets/TalTechNLP/word_meanings_et
- Dataset inflection_et: https://huggingface.co/datasets/TalTechNLP/inflection_et
- Dataset grammar_et: https://huggingface.co/datasets/TalTechNLP/grammar_et
- Dataset EstQA: https://huggingface.co/datasets/TalTechNLP/EstQA
- Dataset ERRnews: https://huggingface.co/datasets/TalTechNLP/ERRnews
- Harness de benchmark estonio: https://github.com/taltechnlp/lm-eval-harness-tasks-estonian
- Informe tecnico de Gemma 3: https://arxiv.org/html/2503.19786v1
- Informe tecnico de Gemma 3 (PDF): https://storage.googleapis.com/deepmind-media/gemma/Gemma3Report.pdf
- Pagina de Gemma 3 en Google DeepMind: https://deepmind.google/models/gemma/gemma-3/
- Benchmark de LLM en estonio (Lillepalu & Alumäe): https://arxiv.org/abs/2510.21193
- Trabajo EstLLM: https://arxiv.org/abs/2603.02041
- Trabajo Llammas: https://arxiv.org/abs/2310.03389
- Terminos de Uso de Gemma: https://ai.google.dev/gemma/terms
