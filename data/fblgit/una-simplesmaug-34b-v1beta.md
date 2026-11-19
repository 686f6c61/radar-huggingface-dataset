# fblgit/UNA-SimpleSmaug-34b-v1beta

## Resumen

UNA-SimpleSmaug-34b-v1beta es un modelo de lenguaje de 34.388.917.248 parametros desarrollado por fblgit, derivado mediante fine-tuning del modelo base abacusai/Smaug-34B-v0.1. Se distribuye bajo licencia Apache 2.0 y esta orientado a generacion de texto conversacional, con enfasis declarado en razonamiento matematico (tag `simple-math`) y en la metodologia de entrenamiento UNA (Unified Neural Alignment) del autor. El modelo se publico originalmente en febrero de 2024 y ha recibido actualizaciones posteriores en la model card.

La propuesta del autor es que este fine-tuning supera a su modelo base Smaug-34B-v0.1 en el Open LLM Leaderboard, con una puntuacion declarada de 77.41 en la media agregada. El modelo emplea la arquitectura Llama (tag `llama` en Hugging Face) con pesos en safetensors y es compatible con `transformers` y con Text Generation Inference, lo que facilita su despliegue en infraestructuras estandar.

Es relevante para desarrolladores que buscan un modelo denso de ~34B con licencia permisiva, capacidad conversacional y buen rendimiento en tareas de conocimiento general, aunque con limitaciones claras en matematicas avanzadas y razonamiento de multiples pasos segun los benchmarks declarados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tipo Llama (tag `llama`); detalles internos no disponibles |
| Parametros totales | 34.388.917.248 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponibles en la informacion proporcionada (pesos originales en safetensors) |
| Idiomas soportados | no disponibles |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Modelo base | abacusai/Smaug-34B-v0.1 |
| Tamano del repositorio | 68,8 GB |
| Libreria | transformers |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

El modelo es un fine-tuning del transformer denso abacusai/Smaug-34B-v0.1, que a su vez deriva de la familia Llama de 34B. No se dispone en la informacion proporcionada de detalles sobre el numero de capas, dimensiones ocultas, mecanismo de atencion ni longitud de contexto nativa. Tampoco se especifica si se aplicaron tecnicas como RLHF, DPO o SFT con preferencias; la model card solo indica la metodologia UNA del autor y el uso de los datasets `fblgit/simple-math` y `jondurbin/bagel-v0.3` en el proceso de ajuste.

La innovacion declarada por el autor es la metodologia UNA (Unified Neural Alignment), que segun la model card permite al fine-tuning superar al modelo base en la media del Open LLM Leaderboard (77.41 frente al base Smaug-34B-v0.1). No se documentan en la informacion disponible innovaciones arquitectonicas como decodificacion especulativa, atencion lineal o mezcla de expertos; se trata de un ajuste sobre una arquitectura transformer convencional.

## Capacidades

- Generacion de texto conversacional multi-turno, segun el tag `conversational` del repositorio.
- Razonamiento de conocimiento general: MMLU 5-shot con 76,68 de accuracy.
- Razonamiento cientifico de nivel escolar: ARC-Challenge 25-shot con 74,57 de accuracy normalizada.
- Sentido comun y completado de frases: HellaSwag 10-shot con 86,74 de accuracy normalizada.
- Resolucion de referencias y coreferencia: Winogrande 5-shot con 83,82 de accuracy.
- Matematicas de nivel escolar: GSM8K 5-shot con 72,48 de accuracy.
- Ajuste a instrucciones: IFEval 0-shot con 45,56 de strict accuracy.
- Razonamiento matematico avanzado: MATH Lvl 5 4-shot con 0,15 de exact match (muy limitado).
- Razonamiento de multiples pasos y tareas compuestas: BBH 3-shot con 32,78 de accuracy normalizada (debil).
- No se documenta soporte de tool calling, function calling, agentes, vision, audio ni modo thinking en la informacion proporcionada.
- Capacidades multilingues: no disponibles.

## Casos de uso

- Asistente conversacional de dominio general: el modelo puede mantener dialogos multi-turno con calidad razonable en conocimiento enciclopedico (MMLU 76,68) y sentido comun (HellaSwag 86,74), adecuado para chatbots internos o prototipos de atencion al cliente donde no se requiera contexto extremadamente largo.
- Generacion de resumentes y reescritura de documentos: su rendimiento en HellaSwag y Winogrande sugiere buena competencia en comprension de texto y coherencia local, util para pipelines de procesamiento de documentacion tecnica.
- Tutorizacion de matematicas de nivel escolar: con GSM8K en 72,48 puede emplearse en asistentes educativos para problemas aritmeticos y de algebra basica, evitando ejercicios de competicion donde el rendimiento cae a 0,15 en MATH Lvl 5.
- Clasificacion y extraccion de informacion en texto: el modelo puede usarse como base para tareas de etiquetado zero-shot o few-shot mediante prompting, aprovechando su conocimiento general y su licencia Apache 2.0 para uso comercial.
- Generacion de contenido asistida: redaccion de borradores, parafraseo y generacion de variaciones de texto en ingles (idioma de los benchmarks), integrable en herramientas editoriales.
- Fine-tuning posterior sobre dominios verticales: al ser un modelo denso de 34B con licencia permisiva y pesos safetensors, sirve como punto de partida para ajustes especificos en legal, sanitario o financiero, siempre que se disponga de infraestructura de GPU adecuada.
- Evaluacion comparativa de tecnicas de alineacion: investigadores pueden reproducir y contrastar la metodologia UNA frente a otros fine-tunings del mismo modelo base, dado que el autor publica los resultados en el Open LLM Leaderboard.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente, campo `verified: false`):

| Benchmark | Configuracion | Metrica | Valor |
|---|---|---|---|
| ARC-Challenge | 25-shot | acc_norm | 74,57 |
| HellaSwag | 10-shot | acc_norm | 86,74 |
| MMLU | 5-shot | accuracy | 76,68 |
| TruthfulQA | 0-shot | mc2 | 70,17 |
| Winogrande | 5-shot | accuracy | 83,82 |
| GSM8K | 5-shot | accuracy | 72,48 |
| IFEval | 0-shot | strict accuracy | 45,56 |
| BBH | 3-shot | acc_norm | 32,78 |
| MATH Lvl 5 | 4-shot | exact match | 0,15 |
| GPQA | 0-shot | acc_norm | 8,95 |
| MuSR | 0-shot | acc_norm | 11,96 |
| MMLU-PRO | 5-shot | accuracy | 39,33 |

El autor declara una media agregada de 77,41 en el Open LLM Leaderboard, superior a la de su modelo base Smaug-34B-v0.1, aunque no se aportan en la informacion disponible los valores desglosados del modelo base para verificar la comparacion.

## Requisitos de hardware

- VRAM estimada para inferencia en precision completa (fp16/bf16): aproximadamente 68,8 GB de pesos, por lo que se necesitan al menos 2 GPU de 48 GB (A6000, L40S) o una A100/H100 de 80 GB.
- Cuantizacion a 8 bits: en torno a 34-36 GB, viable en una unica A100 40 GB o en dos RTX 4090 de 24 GB.
- Cuantizacion a 4 bits (si se generan pesos GGUF/AWQ, no incluidos en el repo): aproximadamente 18-20 GB, lo que permitiria ejecucion en una RTX 4090 de 24 GB con margen limitado para el contexto.
- GPU recomendadas: A100 80 GB o H100 para fp16; A100 40 GB o 2x RTX 4090 para 8 bits; RTX 4090 unica solo con cuantizacion de 4 bits.
- No cabe en GPU de consumo de 8-16 GB sin cuantizaciones agresivas no documentadas.
- Opciones de despliegue: `transformers` (soporte nativo), Text Generation Inference (el repo incluye el tag `text-generation-inference` y `endpoints_compatible`); vLLM y llama.cpp no estan confirmados en la informacion disponible, aunque al ser arquitectura Llama son compatibles en principio.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | MMLU | GSM8K | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| UNA-SimpleSmaug-34b-v1beta | 34,4B | no disponible | 76,68 (5-shot) | 72,48 (5-shot) | Apache 2.0 | Hugging Face |
| abacusai/Smaug-34B-v0.1 (base) | 34B | no disponible | no disponible en la informacion | no disponible | no disponible en la informacion | Hugging Face |
| Yi-34B | 34B | no disponible en la informacion | no disponible en la informacion | no disponible en la informacion | no disponible en la informacion | Hugging Face |

La comparacion con alternativas de la misma categoria (Yi-34B, CodeLlama-34B, Mistral-8x7B) no puede completarse con rigor porque la informacion proporcionada solo incluye los resultados del modelo descrito. El autor afirma que supera a Smaug-34B-v0.1, pero no se aportan las cifras del base para contrastar.

## Limitaciones y advertencias

- Resultados de benchmarks declarados por el autor con `verified: false`; no han sido validados de forma independiente en la informacion disponible.
- Rendimiento muy bajo en razonamiento matematico avanzado (MATH Lvl 5: 0,15 de exact match) y en tareas de razonamiento compuesto (BBH: 32,78; MuSR: 11,96; GPQA: 8,95), lo que desaconseja su uso en dominios cientificos o de razonamiento profundo.
- IFEval de 45,56 sugiere seguimiento de instrucciones estrictas limitado; puede incumplir restricciones de formato en produccion.
- Idiomas soportados no documentados; los benchmarks son en ingles, por lo que el rendimiento en castellano no esta garantizado.
- Longitud de contexto no documentada; no debe asumirse una ventana extendida para casos de uso con documentos largos.
- Riesgo de alucinacion inherente a los modelos de lenguaje; TruthfulQA mc2 de 70,17 indica margen de mejora en veracidad.
- Sesgos: no se documentan evaluaciones de sesgo ni de toxicidad en la informacion proporcionada.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base Smaug-34B-v0.1 y sus dependencias deben verificarse por separado antes de desplegar en produccion.
- Modelo de febrero de 2024 con actualizacion de metadatos posterior; puede estar desactualizado frente a modelos de 2025-2026 en razonamiento e instrucciones.

## Enlaces

- Hugging Face: https://huggingface.co/fblgit/UNA-SimpleSmaug-34b-v1beta
- Modelo base: https://huggingface.co/abacusai/Smaug-34B-v0.1
- Open LLM Leaderboard (resultados del modelo): https://huggingface.co/spaces/HuggingFaceH4/open_llm_leaderboard?query=fblgit/UNA-SimpleSmaug-34b-v1beta
- Open LLM Leaderboard v2: https://huggingface.co/spaces/open-llm-leaderboard/open_llm_leaderboard?query=fblgit/UNA-SimpleSmaug-34b-v1beta
- Dataset simple-math: https://huggingface.co/datasets/fblgit/simple-math
- Dataset bagel-v0.3: https://huggingface.co/datasets/jondurbin/bagel-v0.3
- Paper citado en la model card (LLM DNA): https://arxiv.org/html/2509.24496v1
- Paper citado en la model card (EmbedLLM): https://arxiv.org/html/2410.02223v1
- Referencias arXiv incluidas en los tags del repositorio: arxiv:2606.07524, arxiv:2509.22888
