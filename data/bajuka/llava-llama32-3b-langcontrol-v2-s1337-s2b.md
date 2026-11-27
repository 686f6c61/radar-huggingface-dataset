# BAJUKA/LLaVA-llama32-3b-LangControl-v2-s1337-s2b

## Resumen

LLaVA-llama32-3b-LangControl-v2-s1337-s2b es un ajuste fino (fine-tune) de meta-llama/Llama-3.2-3B-Instruct publicado por el usuario BAJUKA en Hugging Face. A pesar del nombre "LLaVA", el modelo es un LlamaForCausalLM nativo sin torre de visión: se trata de un checkpoint de control exclusivamente de lenguaje, diseñado como pieza de un grid experimental (la "controlled grid" de LLaVA-NeXT Llama-3.2-3B) para aislar el comportamiento lingüístico del pipeline multimodal. Es cargable directamente con `AutoModelForCausalLM` de transformers.

El modelo resuelve un problema concreto de investigación: proporcionar una referencia de lenguaje puro, entrenada con la misma receta y datos que las etapas de instrucción del pipeline LLaVA-NeXT, de modo que cualquier diferencia observada en el modelo multimodal pueda atribuirse a la visión y no al entrenamiento textual. Se distribuye con 3.212.749.824 parámetros (3,2 mil millones) en formato safetensors, con un repositorio de 6,4 GB.

Es relevante ahora por dos motivos: primero, porque permite reproducir y auditar experimentos de control en pipelines multimodales sin depender de pesos propietarios; segundo, porque su receta de entrenamiento está documentada con precisión (pasos, batch, learning rate, semilla), lo que facilita la replicabilidad. No obstante, es un artefacto de investigación con cero descargas y cero likes en el momento de redactar esta ficha, sin benchmarks publicados ni idiomas declarados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (LlamaForCausalLM), sin torre de visión |
| Parametros totales | 3.212.749.824 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 8192 tokens (longitud máxima de entrenamiento); ventana nativa de Llama 3.2 3B: 131072 tokens, no verificada en este fine-tune |
| Tipos de cuantizacion | no disponible (solo se publican pesos safetensors en bf16) |
| Idiomas soportados | no disponible (no declarados en la model card) |
| Licencia | Llama 3.2 Community License |
| Formato de pesos | safetensors |
| Modelo base | meta-llama/Llama-3.2-3B-Instruct |
| Etapas de entrenamiento | S2a (5.859 pasos) y S2b (2.797 pasos, este checkpoint) |
| Plantilla de chat | llava_llama_3 |

## Arquitectura y entrenamiento

La arquitectura es la de Llama 3.2 3B Instruct sin modificaciones estructurales: un transformer decoder-only denso con atención por grupos (GQA) y RoPE, empaquetado como `LlamaForCausalLM`. El autor elimina explícitamente cualquier torre de visión del pipeline LLaVA-NeXT, de modo que el checkpoint es un modelo de lenguaje puro. El entrenamiento se organiza en dos etapas secuenciales: S2a parte de Llama-3.2-3B-Instruct y entrena durante 5.859 pasos con texto de FineWeb más el dataset `language_50k_v2`; S2b, que corresponde a este checkpoint, entrena 2.797 pasos adicionales con un subconjunto de Tulu 3 emparejado en tokens a la etapa de instrucción visual (308.068 tokens) más `language_50k_v2` (49.956 tokens).

La receta es reproducible y está documentada con detalle: batch global de 128 (2 por dispositivo × 16 de acumulación × 4 GPU H100), learning rate 1e-5 con scheduler coseno, 3 % de warmup, longitud máxima de 8192 tokens, ZeRO-3 en bf16 y semilla 1337. No se menciona RLHF, DPO ni decodificación especulativa; el ajuste es supervisado (SFT). La innovación técnica no está en la arquitectura sino en el diseño experimental: el emparejamiento en tokens con la etapa visual permite comparaciones controladas entre el modelo de lenguaje y su contraparte multimodal.

## Capacidades

- Generación de texto conversacional multi-turno, heredada de Llama-3.2-3B-Instruct.
- Instrucción y seguimiento de directrices en formato chat mediante la plantilla `llava_llama_3`.
- Control de idioma (language control): el dataset `language_50k_v2` sugiere un ajuste orientado a la selección o el mantenimiento de idioma en la respuesta, aunque la model card no detalla el mecanismo ni los idiomas cubiertos.
- Razonamiento básico y respuesta a preguntas de conocimiento general, en la medida en que lo permite un modelo de 3,2 mil millones de parámetros.
- Generación de código y matemáticas elementales: capacidad esperable por herencia del modelo base, no verificada con benchmarks en este checkpoint.
- Soporte de tool calling / function calling: no documentado en la model card; no se garantiza.
- Capacidades de agente y razonamiento multi-paso: no documentadas.
- Capacidades multimodales: ninguna. El nombre "LLaVA" es engañoso; no hay visión, audio ni entrada de imágenes.
- Capacidades multilingües: no declaradas; los idiomas soportados figuran como no disponibles.

## Casos de uso

- Reproducción de experimentos de control en pipelines LLaVA-NeXT: el modelo sirve como línea base de lenguaje puro frente al modelo multimodal con la misma receta, permitiendo atribuir diferencias de rendimiento a la torre de visión y no al entrenamiento textual.
- Auditoría de recetas de SFT: al estar documentados pasos, batch, learning rate, semilla y composición de datos, se puede reentrenar o variar un hiperparámetro y comparar contra este checkpoint de referencia.
- Investigación sobre control de idioma: el dataset `language_50k_v2` y la etiqueta `language-control` permiten estudiar cómo un ajuste pequeño (49.956 tokens en S2b) modifica la selección de idioma de un modelo de 3,2 mil millones de parámetros.
- Evaluación de olvido catastrófico: comparar este checkpoint con Llama-3.2-3B-Instruct en tareas de conocimiento general mide cuánto se degrada el modelo tras 8.656 pasos de ajuste con datos mayoritariamente conversacionales.
- Prototipado de asistentes conversacionales de bajo coste en investigación: con 3,2 mil millones de parámetros y contexto de 8192 tokens, cabe en una GPU de consumo para pruebas de concepto, aunque sin garantías de calidad en producción.
- Generación de datos sintéticos para experimentos académicos: el modelo puede producir respuestas en formato chat para alimentar pipelines de destilación o evaluación interna, siempre que se respete la licencia Llama 3.2.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni evaluaciones de control de idioma, y el repositorio registra cero descargas y cero likes, por lo que no existen evaluaciones de terceros.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 6,4 GB solo para pesos, más overhead de activaciones y KV cache; en la práctica, entre 8 y 10 GB para contextos moderados.
- VRAM estimada en cuantización de 8 bits: alrededor de 3,5-4 GB de pesos.
- VRAM estimada en cuantización de 4 bits: alrededor de 2-2,5 GB de pesos.
- GPU recomendadas para entrenamiento: el autor usó 4 × H100 con ZeRO-3; para inferencia basta una sola GPU.
- GPU de consumo: cabe en RTX 4090 (24 GB), RTX 4080 (16 GB), RTX 4070 Ti (12 GB) e incluso en GPUs de 8 GB con cuantización de 4 u 8 bits.
- Opciones de despliegue: transformers con `AutoModelForCausalLM`, text-generation-inference (etiqueta `text-generation-inference` y `endpoints_compatible` en el repo), vLLM y llama.cpp/Ollama previa conversión a GGUF (no se publican GGUF oficiales).
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| BAJUKA/LLaVA-llama32-3b-LangControl-v2-s1337-s2b | 3,21 B | 8192 (entrenamiento) | Llama 3.2 Community | Hugging Face, safetensors | Checkpoint de control, sin benchmarks |
| meta-llama/Llama-3.2-3B-Instruct | 3,21 B | 131072 nativo | Llama 3.2 Community | Hugging Face, ampliamente adoptado | Modelo base; benchmarks publicados por Meta |
| Qwen2.5-3B-Instruct | 3,09 B | 32768 nativo | Apache 2.0 | Hugging Face | Alternativa permisiva de tamaño similar |
| Phi-3.5-mini-instruct | 3,82 B | 131072 nativo | MIT | Hugging Face | Alternativa permisiva con contexto largo |

La comparación de rendimiento con estas alternativas no está disponible para este checkpoint, ya que no se han publicado evaluaciones. La diferencia principal frente a ellas es la licencia (Llama 3.2 frente a Apache 2.0 o MIT) y el propósito (artefacto de investigación frente a modelo listo para producción).

## Limitaciones y advertencias

- Es un checkpoint de investigación con cero descargas y cero likes; no hay evidencia de uso en producción ni validación por terceros.
- El nombre "LLaVA" puede inducir a error: no procesa imágenes ni audio, es un modelo exclusivamente de texto.
- No se han publicado benchmarks; se desconoce si el ajuste degrada capacidades del modelo base (olvido catastrófico) en matemáticas, código o conocimiento factual.
- Riesgo de alucinación inherente a un modelo de 3,2 mil millones de parámetros, agravado por el ajuste con datos conversacionales (Tulu 3) y de control de idioma.
- Idiomas soportados no declarados; el comportamiento multilingüe es impredecible y no está verificado.
- La ventana de contexto efectiva tras el ajuste es de 8192 tokens; no se ha validado el contexto nativo de 131.072 tokens del modelo base.
- Sesgos conocidos: no documentados por el autor; hereda los sesgos de Llama-3.2-3B-Instruct, FineWeb y Tulu 3, no evaluados en este checkpoint.
- Licencia Llama 3.2 Community: uso comercial permitido con condiciones (atribución "Built with Llama", política de uso aceptable y obligaciones para modelos derivados de más de 700 millones de parámetros); requiere revisión legal antes de producción.
- Sin cuantizaciones oficiales (GGUF, AWQ, GPTQ); cualquier conversión corre por cuenta del usuario y puede alterar el comportamiento.
- No hay garantía de soporte de tool calling ni de comportamiento de agente; no documentados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/BAJUKA/LLaVA-llama32-3b-LangControl-v2-s1337-s2b
- Modelo base: https://huggingface.co/meta-llama/Llama-3.2-3B-Instruct
- Licencia Llama 3.2: https://www.llama.com/llama3_2/license/
- Repositorio LLaVA: https://github.com/haotian-liu/LLaVA
- Repositorio LLaVA-NeXT: https://github.com/LLaVA-VL/LLaVA-NeXT
- Dataset Tulu 3: https://huggingface.co/datasets/allenai/tulu-3-sft-mixture
- Dataset FineWeb: https://huggingface.co/datasets/HuggingFaceFW/fineweb
