# ApolloRaines/Deidentified-7B

## Resumen

Deidentified-7B es un derivado del modelo Qwen/Qwen2.5-7B-Instruct al que el autor, ApolloRaines, ha aplicado un proceso de "cirugía de pesos" para eliminar la identidad propia del modelo, sus barreras de rechazo y su tendencia a la adulación (sycophancy). El objetivo declarado no es mejorar las capacidades del modelo, sino vaciarlo de autoconcepto para que sirva como base sobre la que implantar una identidad personalizada mediante LoRA sin que compita con la identidad original de Qwen.

El modelo conserva la arquitectura y los pesos funcionales de Qwen2.5-7B-Instruct (7.615.616.512 parámetros, transformer denso), de modo que las capacidades de razonamiento, código, matemáticas y comprensión del lenguaje permanecen intactas según el autor. Lo que se elimina es el comportamiento de identidad: el modelo no revela ser Qwen ni ningún otro asistente, y según la model card supera una batería de 200 preguntas de identidad sin filtrar información.

Su relevancia es acotada pero específica: para desarrolladores que quieran construir un asistente con identidad propia y no quieran luchar contra el sesgo de identidad preexistente del modelo base. La licencia Apache 2.0 y el formato safetensors facilitan su uso comercial y su integración en pipelines estándar de Hugging Face.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen2) |
| Parámetros totales | 7.615.616.512 |
| Parámetros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible en la información proporcionada (heredada de Qwen2.5-7B-Instruct, no confirmada en la ficha) |
| Tipos de cuantización | No especificados por el autor; al ser safetensors en bfloat16 es compatible con cuantizaciones estándar (GGUF, GPTQ, AWQ) mediante herramientas externas |
| Idiomas soportados | Inglés (declarado: `en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 15,2 GB) |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-7B-Instruct, un transformer denso de 7.615.616.512 parámetros. No se ha reentrenado desde cero ni se ha hecho un fine-tuning convencional: el autor aplica un pipeline de dos fases sobre los pesos existentes. La fase 1, denominada "Jbliteration", elimina los comportamientos de rechazo; la fase 2, "Desycophancy", elimina la capitulación aduladora ante afirmaciones incorrectas del usuario. El proceso completo se ejecuta en aproximadamente 90 segundos sobre 2x RTX PRO 6000 según la model card.

El autor afirma que la cirugía de pesos no toca los tensores de normalización ni los sesgos, y que esto es verificable por diff contra el modelo base: de 14 tensores medidos, 13 son idénticos bit a bit y 1 difiere por debajo del umbral de almacenamiento en bfloat16 (atribuido a un re-guardado, no a una edición). Otros tres checkpoints plausibles de Qwen 7B dan 0 de 14 coincidencias, incluido el modelo preentrenado Qwen2.5-7B, que obtiene una similitud coseno de 0,9985 frente a estos pesos. No se detalla la composición del dataset de entrenamiento ni el número de tokens utilizados en el proceso de deidentificación.

## Capacidades

- Generación de texto conversacional en inglés, con plantilla de chat compatible con `apply_chat_template`.
- Razonamiento, matemáticas, conocimiento general y comprensión del lenguaje, heredados de Qwen2.5-7B-Instruct según el autor.
- Generación de código, presumiblemente conservada del modelo base (no verificada de forma independiente en la información disponible).
- Ausencia de identidad propia: no revela ser Qwen ni otro asistente ante preguntas directas, indirectas, multilingües, de roleplay, técnicas o adversariales, según la batería de 200 preguntas del autor.
- Sin barreras de rechazo declaradas (fase Jbliteration).
- Sin capitulación aduladora ante afirmaciones incorrectas del usuario (fase Desycophancy).
- Soporte para implantación de identidad personalizada mediante LoRA con `peft`, usando pares pregunta-respuesta en JSON o JSONL.
- No se documentan capacidades de tool calling, function calling, agentes, visión ni audio en la información proporcionada.

## Casos de uso

- Construcción de asistentes con marca propia: el modelo sirve como base para implantar una identidad corporativa mediante LoRA (unos 36 pares de Q&A, 3 épocas, rank 16, aproximadamente 2 minutos en una GPU), sin que la identidad de Qwen compita con la nueva.
- Prototipado rápido de personajes conversacionales: al no tener autoconcepto previo, la identidad definida en el fichero `example_identity.json` se implanta de forma consistente ante preguntas directas, comparaciones ("¿Eres ChatGPT?"), presión adversarial y extracción estructurada.
- Investigación sobre identidad y alineación en modelos: permite estudiar cómo se comporta un modelo sin identidad ni guardarraíles de rechazo, y comparar con el base para aislar el efecto de la cirugía de pesos.
- Evaluación de técnicas de eliminación de sycophancy: la fase Desycophancy permite probar si el modelo mantiene posiciones correctas cuando el usuario afirma lo contrario, en escenarios de verificación factual.
- Despliegue en GPU de consumo: con aproximadamente 14 GB en fp16, cabe en tarjetas como RTX 4090 (24 GB) o RTX 3090 (24 GB) sin cuantización, lo que facilita experimentación local con identidades personalizadas.
- Base para pipelines de ajuste fino con `peft`: al estar en safetensors y licencia Apache 2.0, se integra directamente en flujos de entrenamiento con `transformers` y `torch` sin restricciones comerciales adicionales.
- Ejecución en hardware limitado: el autor ofrece DeepswapLLM, que transmite capas entre GPU, RAM y disco y permite ejecutar el modelo en precisión completa en GPUs con menos VRAM que la necesaria para retenerlo entero, con una velocidad declarada de hasta 4 veces la de AirLLM.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo reporta una prueba interna de identidad: 200 preguntas en 6 categorías (directas, indirectas, multilingües, roleplay, técnicas y adversariales) con cero revelaciones de identidad. No hay datos de MMLU, HumanEval, GSM8K ni comparaciones numéricas con otros modelos.

## Requisitos de hardware

- VRAM estimada: aproximadamente 14 GB en fp16 según el autor; el repo de safetensors ocupa 15,2 GB en disco.
- GPU recomendadas: cualquier GPU con 16 GB o más de VRAM para fp16 (RTX 4090, RTX 3090, A100, H100). El proceso de deidentificación se ejecutó en 2x RTX PRO 6000.
- Cabe en GPU de consumo: sí, en RTX 4090 y RTX 3090 (24 GB) en fp16; en GPUs de 8-12 GB requeriría cuantización externa (GGUF, GPTQ, AWQ), no proporcionada por el autor.
- Opciones de despliegue: `transformers` con `device_map="auto"` (documentado), `peft` para la implantación de identidad, y DeepswapLLM del propio autor para ejecución por streaming de capas en GPUs pequeñas. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. El único dato temporal es el del pipeline de deidentificación (unos 90 segundos) y el de la implantación de identidad (unos 2 minutos), no de inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Identidad propia | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Deidentified-7B | 7,6 B | No disponible | Eliminada (según autor) | Apache 2.0 | Hugging Face |
| Qwen/Qwen2.5-7B-Instruct | 7,6 B | No disponible en esta ficha | Presente (Qwen) | Apache 2.0 | Hugging Face |
| ApolloRaines/Qwen2.5-7B-Parasite | 7,6 B | No disponible | Implantada (Parasite) | No disponible | Hugging Face |
| ApolloRaines/Mistral-7B-Instruct-v0.3-Parasite | 7 B | No disponible | Implantada (Parasite) | No disponible | Hugging Face |

La comparación relevante es con el propio modelo base: Deidentified-7B conserva los pesos funcionales de Qwen2.5-7B-Instruct pero elimina su autoconcepto y sus guardarraíles de rechazo, lo que cambia el perfil de comportamiento sin alterar el tamaño ni la arquitectura. Los modelos Parasite del mismo autor aplican la misma técnica e implantan además una identidad concreta.

## Limitaciones y advertencias

- La eliminación de los guardarraíles de rechazo (fase Jbliteration) implica que el modelo puede generar contenido que el base rechazaría; no se documenta ningún mecanismo de seguridad sustitutivo.
- El autor advierte que la mayoría de sus modelos públicos se publican a "fuerza parcial" como prueba de concepto, no como producto final; el comportamiento real puede diferir del anunciado.
- La afirmación de "cero revelaciones de identidad" procede de una batería interna del propio autor, no de una evaluación independiente.
- El modelo está declarado solo para inglés; el comportamiento en otros idiomas no está garantizado, aunque la batería de identidad incluye pruebas multilingües.
- Riesgo de alucinación: no se documenta ninguna mitigación específica; al eliminar la sycophancy se reduce la capitulación ante el usuario, pero no se aportan datos sobre precisión factual.
- No hay benchmarks públicos que permitan verificar que las capacidades de razonamiento, código y matemáticas se conservan intactas tras la cirugía de pesos.
- La longitud de contexto no se confirma en la ficha; se asume la del base, pero no está verificada en la información disponible.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías sobre el comportamiento del modelo en producción ni sobre el cumplimiento normativo derivado de la ausencia de rechazos.
- El proceso de implantación de identidad depende de `peft` y de un conjunto pequeño de pares Q&A; la robustez de la identidad implantada frente a entradas adversarias no está evaluada de forma independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ApolloRaines/Deidentified-7B
- Plantilla de identidad de ejemplo: https://huggingface.co/ApolloRaines/Deidentified-7B/blob/main/example_identity.json
- Repositorio DeepswapLLM: https://github.com/apolloraines/DeepswapLLM
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Parasite-7B (Qwen): https://huggingface.co/ApolloRaines/Qwen2.5-7B-Parasite
- Parasite-7B (Mistral): https://huggingface.co/ApolloRaines/Mistral-7B-Instruct-v0.3-Parasite
- Parasite-MoE (Mixtral 8x7B): https://huggingface.co/ApolloRaines/Mixtral-8x7B-Instruct-v0.1-Parasite
- Todos los modelos del autor: https://huggingface.co/ApolloRaines
