# mradermacher/flint-roleplay-antislop-heretic-GGUF

## Resumen

Este repositorio contiene la cuantización GGUF del modelo **flint-roleplay-antislop-heretic**, desarrollado originalmente por AlexWortega y cuantizado por el usuario mradermacher, un conocido contribuidor de la comunidad de Hugging Face especializado en generar versiones GGUF estáticas e imatrix de modelos populares. El modelo base es un modelo de lenguaje dirigido a roleplay y escritura creativa, entrenado con técnicas de aprendizaje por refuerzo orientadas a reducir el "slop" (texto repetitivo y cliché típico de los LLM) y con modificaciones de tipo "heretic", "decensored" y "abliterated", es decir, orientadas a reducir los rechazos de seguridad del modelo original.

El valor principal de este repositorio no es el modelo en sí, sino la disponibilidad inmediata del modelo en múltiples formatos de cuantización GGUF (desde Q2_K hasta Q8_0, además de IQ4_XS), lo que permite ejecutarlo localmente con llama.cpp, Ollama u otros runtimes compatibles en hardware de consumo. Con casi 40 mil millones de parámetros y arquitectura MoE según las etiquetas del repositorio, se sitúa en la gama media-alta de modelos abiertos para narrativa interactiva. La licencia Apache 2.0 del modelo base permite su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (mixture of experts), según etiquetas del repositorio; detalles no disponibles |
| Parametros totales | 39.785.287.456 (~39,8B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 (GGUF); original en bf16 |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (este repositorio); original en safetensors/bf16 |

## Arquitectura y entrenamiento

El modelo base, AlexWortega/flint-roleplay-antislop-heretic, está etiquetado como MoE (mixture of experts) y bf16, con un total de aproximadamente 39,8 mil millones de parámetros según los metadatos de safetensors. Sin embargo, la model card no detalla el número de expertos, los parámetros activos por token ni el tamaño de la capa de atención, por lo que estos datos concretos no están disponibles en la información proporcionada.

Respecto al entrenamiento, las etiquetas indican el uso de "antislop - reinforcement-learning", lo que sugiere un post-entrenamiento con aprendizaje por refuerzo orientado a penalizar patrones de escritura repetitivos y clichés característicos de los LLM (frases como "shivers down her spine", estructuras narrativas predecibles, etc.). Las etiquetas "heretic", "uncensored", "decensored" y "abliterated" indican que el modelo ha pasado por procesos de eliminación o debilitamiento de los filtros de seguridad del modelo base (abliteration es una técnica que modifica direccionalmente los pesos para suprimir las direcciones de rechazo en el espacio de activaciones). No hay datos publicados sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de RLHF o DPO.

## Capacidades

- Generación de texto creativo y roleplay conversacional multi-turno, su caso de uso principal según las etiquetas (roleplay, creative-writing, conversational).
- Escritura con estilo "antislop": el post-entrenamiento con refuerzo busca reducir clichés y frases hechas habituales en la salida de los LLM.
- Modelo decensored/abliterated: produce respuestas sin los rechazos típicos de los modelos alineados, incluyendo contenido que otros modelos se negarían a generar.
- Etiquetado como modelo conversacional, apto para chat con plantillas de instrucción (el formato de prompt concreto no está disponible).
- Compatibilidad con llama.cpp y ecosistemas GGUF gracias a la cuantización.
- No hay evidencia de capacidades de visión, audio, tool calling ni agentes en la información disponible.

## Casos de uso

- **Roleplay interactivo y narrativa colaborativa:** el modelo está especializado en mantener personajes coherentes en conversaciones largas de juego de rol, con un estilo menos repetitivo gracias al entrenamiento antislop.
- **Escritura de ficción asistida:** autores pueden usarlo como copiloto para generar prosa, diálogos y escenas, evitando el lenguaje "de IA" que delata el uso de modelos genéricos.
- **Juegos con NPCs dinámicos:** integrable en motores de juego o frontales como SillyTavern para dotar de diálogo libre a personajes no jugables.
- **Investigación sobre abliteration y decensado:** al ser un modelo público con etiquetas heretic/abliterated, sirve como caso de estudio para analizar el efecto de estas técnicas sobre la calidad de la generación.
- **Ejecución local en hardware de consumo:** la gama de cuants permite ajustar el modelo a GPUs de 16 a 48 GB de VRAM o a configuraciones CPU+GPU con descarga parcial.
- **Prototipado de aplicaciones creativas sin censura:** para desarrolladores que necesitan un modelo que no rechace peticiones de ficción madura dentro de un entorno controlado y legal.
- **Benchmarking de cuantizaciones:** el repositorio ofrece 11 niveles de cuantización del mismo modelo, útil para comparar la degradación de calidad entre formatos K-quants e IQ-quants.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al tratarse de un modelo especializado en roleplay y escritura creativa, además, los benchmarks académicos estándar (MMLU, GSM8K, HumanEval) serían poco representativos de su rendimiento real en su tarea principal.

## Requisitos de hardware

- **VRAM estimada para inferencia (solo pesos, sin contexto):**
  - Q2_K: ~14,8 GB
  - Q4_K_M (recomendado): ~24,3 GB
  - Q6_K: ~32,8 GB
  - Q8_0 (mejor calidad): ~42,5 GB
- **GPUs recomendadas:** RTX 4090 (24 GB) para cuants Q3/Q4 con contexto moderado; RTX 5090, A100 40 GB o 2x RTX 3090/4090 para Q6_K y Q8_0. Con offload parcial a CPU, cuants Q2_K/Q3_K_S pueden funcionar en máquinas con 16 GB de VRAM y 32 GB de RAM, a costa de latencia.
- **Consumer GPU:** cabe en una RTX 4090 de 24 GB con Q3_K_M o IQ4_XS ajustando el contexto; para Q4_K_M completo se recomienda 32 GB de VRAM o descarga parcial.
- **Despliegue:** llama.cpp (formato nativo GGUF), Ollama, LM Studio, KoboldCpp y cualquier runtime compatible con GGUF. Los quants imatrix ponderados están en un repositorio hermano y suelen ofrecer mejor calidad a igual tamaño.
- **Latencia y throughput:** no disponibles; al ser un MoE de ~40B de parámetros totales, el rendimiento dependerá críticamente de los parámetros activos por token, dato no publicado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Especializacion |
|---|---|---|---|---|
| flint-roleplay-antislop-heretic | ~39,8B (MoE) | no disponible | Apache 2.0 | Roleplay, escritura creativa, decensado |
| Mistral Small 3.x (24B) | 24B (denso) | 32k+ | Apache 2.0 | General, con versiones de comunidad para roleplay |
| Qwen3-30B-A3B | 30B MoE (~3B activos) | 32k+ | Apache 2.0 | General, razonamiento, multilingue |
| Command R (35B) | 35B (denso) | 128k | CC-BY-NC | RAG y conversacion, uso no comercial |

Frente a alternativas densas de tamaño similar, la ventaja teórica del enfoque MoE es un throughput mayor por token al activar solo un subconjunto de expertos, aunque sin el dato de parámetros activos no puede cuantificarse. Frente a modelos generalistas como Qwen3-30B-A3B, este modelo ofrece un ajuste específico a roleplay y escritura creativa con reducción de slop y sin filtros de seguridad, a cambio de un alcance más estrecho y sin soporte multilingüe declarado (solo inglés).

## Limitaciones y advertencias

- **Idioma:** solo se declara soporte para inglés; el rendimiento en castellano no está documentado y probablemente sea inferior.
- **Modelo abliterated/decensored:** al haberse debilitado los filtros de seguridad, puede generar contenido ofensivo, dañino o ilegal si se le solicita. Su uso conlleva responsabilidad legal y ética por parte del operador; no es apto para despliegues abiertos al público sin salvaguardas adicionales.
- **Riesgo de alucinación:** no documentado; como todo LLM, puede inventar hechos con fluidez, agravado por la ausencia de alineación con RLHF/DPO documentada.
- **Datos técnicos incompletos:** longitud de contexto, parámetros activos y plantilla de prompt no están disponibles en la model card, lo que complica la integración correcta (un chat template erróneo degrada seriamente la calidad).
- **Calidad de las cuantizaciones bajas:** los cuants Q2_K y Q3_K_M degradan notablemente la calidad; se recomienda Q4_K_M o superior, o los quants imatrix del repositorio hermano.
- **Licencia:** Apache 2.0 permite uso comercial, pero el modelo heredó pesos de un modelo base cuyos términos originales conviene verificar; además, el repositorio de cuantización es de un tercero (mradermacher), no del autor original.
- **Procedencia del entrenamiento:** no hay información sobre la composición del dataset, por lo que no puede evaluarse la presencia de sesgos, datos con copyright o contenido problemático heredado.

## Enlaces

- Repositorio GGUF (esta ficha): https://huggingface.co/mradermacher/flint-roleplay-antislop-heretic-GGUF
- Modelo base original: https://huggingface.co/AlexWortega/flint-roleplay-antislop-heretic
- Quants imatrix ponderados: https://huggingface.co/mradermacher/flint-roleplay-antislop-heretic-i1-GGUF
- Página de descarga resumida: https://hf.tst.eu/model#flint-roleplay-antislop-heretic-GGUF
- FAQ y solicitudes de cuantización de mradermacher: https://huggingface.co/mradermacher/model_requests
- Guía de uso de GGUF de TheBloke: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Notas de Artefact2 sobre cuantización: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
