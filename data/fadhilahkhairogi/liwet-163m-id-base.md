# fadhilahkhairogi/Liwet-163M-id-base

## Resumen

Liwet-163M-id-base es un modelo de lenguaje de tipo decoder-only transformer denso, entrenado desde cero para el idioma indonesio por un grupo de estudiantes de la asignatura de Generative AI de la Universidad de Telkom (Grupo 11). El nombre Liwet responde a "Lightweight Transformer" y el modelo se distribuye como checkpoint de preentrenamiento (base), es decir, sin ajuste por instrucciones ni alineamiento por preferencias. Su tamano es de 163,0 millones de parametros atados (187,6 millones de elementos almacenados en el fichero de pesos, que incluye una copia no atada de `lm_head.weight`).

La relevancia del modelo es fundamentalmente academica y de investigacion: demuestra el ciclo completo de construccion de un modelo fundacional (tokenizador BPE a nivel de byte, arquitectura moderna con Pre-RMSNorm, GQA, RoPE y SwiGLU, y entrenamiento sobre 2,10 mil millones de tokens de corpus indonesios). No compite en capacidad con modelos multilingues de gran escala, pero constituye una base util para experimentacion en un idioma con menor representacion en el ecosistema open source.

El contexto maximo es de 2.048 tokens, el vocabulario de 32.000 entradas y los pesos se almacenan en `bfloat16` dentro de un unico fichero `model.safetensors`. No es un checkpoint compatible con `AutoModelForCausalLM` de `transformers`: requiere cargar el `state_dict` en la definicion de arquitectura propia del proyecto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (`IndonesianChatLM`), Pre-RMSNorm, GQA 12Q/4KV, RoPE, SwiGLU |
| Parametros totales | 163.013.376 (atados); 187.589.376 elementos almacenados en `model.safetensors` |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 2.048 tokens |
| Tipos de cuantizacion | no disponible (pesos publicados en `bfloat16`; no se documentan versiones GGUF/AWQ/GPTQ) |
| Idiomas soportados | indonesio (`id`) |
| Licencia | no disponible |
| Formato de pesos | `safetensors` (`bfloat16`), mas `config.json` y `tokenizer.json` |
| Capas / cabezas / dimension | 16 capas; 12 cabezas de consulta y 4 de clave-valor; 768 dimension oculta; 3.072 dimension SwiGLU |
| Vocabulario | 32.000 tokens, Byte-Level BPE (`<pad>=0`, `<bos>=1`, `<eos>=2`, `<unk>=3`) |
| Etapa de entrenamiento | Preentrenamiento, 1 epoca, 2.101.916.614 tokens, 68.421 pasos |
| Perdida / perplejidad de validacion | 2,9742 / 19,57 |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura transformer decoder-only de tipo denso con las elecciones de diseno habituales en modelos fundacionales modernos de pequena escala: normalizacion RMS previa a cada subcapa (Pre-RMSNorm), atencion con consultas agrupadas (GQA) con 12 cabezas de consulta y 4 de clave-valor, codificacion posicional rotatoria (RoPE) y capa feed-forward con activacion SwiGLU de dimension 3.072. La pila consta de 16 capas con 768 dimensiones ocultas y un vocabulario de 32.000 tokens BPE a nivel de byte. Los pesos se publican en `bfloat16` con la matriz de embeddings y la cabeza de salida atadas en el modelo (aunque el fichero almacena una copia separada de `lm_head.weight`).

El entrenamiento consistio en un unico epoch sobre aproximadamente 2,10 mil millones de tokens en indonesio, distribuidos en 68.421 pasos. Los corpus declarados son `derhan/indonesian-wikipedia-20250120` (624.298 documentos), `meaecosystem/pustaka` (11.574.463 documentos, que agrega Wikipedia, Indo4B, CC-News, Kaskus y CulturaX) y `ffatty/plaintext-wikipedia-full-indonesian` (716.273 documentos). No se documenta el uso de RLHF, DPO ni ajuste por instrucciones; se trata, por tanto, de un checkpoint puramente de preentrenamiento. Tampoco se detallan hiperparametros de optimizacion, composicion exacta del dataset ni innovaciones tecnicas adicionales mas alla de las citadas.

## Capacidades

- Generacion de texto en indonesio por continuacion (completion) de una entrada cruda; no es un modelo conversacional ni sigue instrucciones de forma fiable.
- Modelado de lenguaje autoregresivo con contexto de 2.048 tokens, adecuado para tareas de perplexidad, scoring y generacion condicionada por prefijo.
- Tokenizacion BPE a nivel de byte con soporte de tokens especiales `<pad>`, `<bos>`, `<eos>` y `<unk>`.
- Capacidad multilingue limitada al indonesio; no se documenta soporte de otros idiomas.
- Sin soporte documentado de tool calling, function calling, agentes, razonamiento multi-paso, modo thinking, vision ni audio.
- Base potencial para fine-tuning supervisado (SFT) y ajuste por preferencias en indonesio, dado que se distribuye como modelo fundacional.

## Casos de uso

- Investigacion academica sobre entrenamiento de modelos fundacionales: sirve como referencia reproducible para estudiar el efecto del tamano de corpus, la arquitectura y las decisiones de tokenizacion en un idioma de recursos medios como el indonesio.
- Evaluacion de tecnicas de preentrenamiento: al ser un modelo pequeno entrenado desde cero, permite comparar variantes de normalizacion, atencion (GQA frente a MHA) o activaciones con coste computacional bajo.
- Fine-tuning para tareas de clasificacion o etiquetado en indonesio: el checkpoint base puede adaptarse con SFT a tareas como analisis de sentimiento, deteccion de topicos o extraccion de entidades sobre textos de Wikipedia y noticias.
- Generacion asistida de texto en indonesio: continuacion de parrafos, resumen extractivo o completado de plantillas en aplicaciones editoriales de baja latencia, siempre con revision humana por la calidad limitada del modelo.
- Base para modelos de dominio especifico: ajuste sobre corpus de atencion al cliente, legal o sanitario en indonesio para prototipos de asistentes con contexto corto.
- Experimentacion con tecnicas de alineamiento: al carecer de ajuste por instrucciones, es un punto de partida limpio para estudiar SFT, DPO o RLHF en un idioma no ingles y con recursos de computo modestos.
- Benchmarking de infraestructura de inferencia: su tamano reducido permite validar pipelines de despliegue (carga de safetensors, tokenizadores, servidores de inferencia) antes de escalar a modelos mayores.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Perdida de validacion (paso 68.421) | 2,9742 |
| Perplejidad de validacion (paso 68.421) | 19,57 |
| Tokens vistos en entrenamiento | 2.101.916.614 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en `bfloat16`: aproximadamente 0,4 GB para los pesos (187,6 millones de elementos a 2 bytes), mas overhead de activaciones y cache KV, que para 2.048 tokens de contexto es reducido (16 capas, 4 cabezas KV, 768 dimensiones).
- En cuantizacion de 8 bits o 4 bits, el modelo cabria holgadamente en GPUs de consumo con 4 GB o menos; no se distribuyen versiones cuantizadas oficiales.
- GPU recomendadas: cualquier GPU moderna con al menos 4-8 GB de VRAM es suficiente (RTX 3060, RTX 4060, RTX 4090, A100, H100). El modelo es viable incluso en CPU para inferencia por lotes de baja frecuencia.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU discreta reciente, dado su tamano inferior a 200 millones de parametros.
- Opciones de despliegue: al no ser un checkpoint `AutoModelForCausalLM` estandar, no es directamente compatible con vLLM, TGI, llama.cpp u Ollama sin conversion previa. El autor documenta carga manual mediante `safetensors.torch.load_file` y `tokenizers.Tokenizer.from_file`, con la definicion de arquitectura propia del proyecto. Para integrarlo en servidores de inferencia estandar seria necesario exportarlo a un formato compatible (por ejemplo, un `state_dict` mapeado a `transformers` o una conversion a GGUF).
- Latencia y throughput estimados: no disponibles en la informacion proporcionada; por el tamano del modelo, se espera un throughput alto y latencia baja en GPU, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idioma principal | Licencia | Formato / disponibilidad |
|---|---|---|---|---|---|
| Liwet-163M-id-base | 163,0 M (atados) | 2.048 | Indonesio | no disponible | Safetensors custom, carga manual |
| GPT-2 small | 124 M | 1.024 | Ingles | MIT (segun publicacion original) | `transformers`, ampliamente soportado |
| SmolLM-135M | 135 M | 2.048 | Ingles (multilingue parcial) | Apache 2.0 | `transformers`, GGUF, vLLM |
| Qwen2.5-0.5B | 494 M | 32.768 | Multilingue (incluye indonesio) | Apache 2.0 | `transformers`, GGUF, vLLM |

La comparativa es orientativa: Liwet-163M-id-base es el unico de la tabla entrenado especificamente desde cero para indonesio, pero carece de la infraestructura de despliegue y de la documentacion de licencia de las alternativas. No se dispone de datos de benchmarks comparativos publicados para establecer una comparacion de rendimiento cuantitativa.

## Limitaciones y advertencias

- Modelo base sin ajuste por instrucciones: no sigue ordenes de forma fiable y puede producir continuaciones incoherentes o repetitivas; no debe usarse como asistente conversacional sin fine-tuning previo.
- Riesgo elevado de alucinacion y de generar contenido factualmente incorrecto, especialmente en tareas de conocimiento, al haber sido entrenado con un volumen de tokens relativamente bajo (2,10 mil millones).
- Contexto limitado a 2.048 tokens, insuficiente para documentos largos o conversaciones multi-turno extensas.
- Cobertura linguistica restringida al indonesio; no se documenta rendimiento en otros idiomas ni en codigo o matematicas.
- Licencia no especificada: la ausencia de terminos explicitos impide confirmar si se permite el uso comercial; debe contactarse con el autor antes de cualquier despliegue productivo.
- Formato de pesos no estandar: la integracion con ecosistemas de inferencia (vLLM, TGI, llama.cpp, Ollama) requiere trabajo de conversion y validacion adicional.
- Sesgos potenciales derivados de los corpus de entrenamiento (Wikipedia, CC-News, Kaskus, CulturaX), con posible infrarrepresentacion de registros formales o de variedades regionales; no se documenta ninguna evaluacion de sesgos.
- Modelo desarrollado en contexto academico, sin proceso de revision por pares ni evaluacion de seguridad documentada; no apto para produccion sin auditoria previa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/fadhilahkhairogi/Liwet-163M-id-base
- Dataset `derhan/indonesian-wikipedia-20250120`: https://huggingface.co/datasets/derhan/indonesian-wikipedia-20250120
- Dataset `meaecosystem/pustaka`: https://huggingface.co/datasets/meaecosystem/pustaka
- Dataset `ffatty/plaintext-wikipedia-full-indonesian`: https://huggingface.co/datasets/ffatty/plaintext-wikipedia-full-indonesian
