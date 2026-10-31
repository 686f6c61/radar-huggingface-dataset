# diablomike20/Openai_gpt-oss-20b-CODEX-CODER

## Resumen

Openai_gpt-oss-20b-CODEX-CODER es una cuantización GGUF comunitaria del modelo openai/gpt-oss-20b de OpenAI, publicada por el usuario diablomike20 en Hugging Face. No se trata de un modelo entrenado desde cero, sino de una versión recomprimida orientada a programación: el autor aplica una técnica de "Doble Imatrix" (DI-Matrix), que combina dos datasets de calibración (NEO para rendimiento general y CODER para código, ambos compilados por DavidAU) al calcular las matrices de importancia usadas en la cuantización. El objetivo es preservar la calidad del modelo base en formatos comprimidos que pueden ejecutarse localmente.

El modelo base, gpt-oss-20b, es un modelo MoE (Mixture of Experts) de OpenAI con 20.914.757.184 parámetros totales, ventana de contexto de 128k tokens y licencia Apache 2.0. Esta variante destaca por ofrecer quants probados en IQ4_NL y MXFP4_MOE (un tipo de quant específico para la estructura de tensores de OpenAI), con velocidades de generación anunciadas de más de 80 tokens/segundo. Es relevante para desarrolladores que quieren un modelo de código y razonamiento ligero, ejecutable en hardware de consumo y con soporte de tool calling y niveles de "thinking" configurables.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer MoE (Mixture of Experts), 24 expertos |
| Parametros totales | 20.914.757.184 (dato real de safetensors) |
| Parametros activos | no disponible (MoE con 4-8 expertos activos recomendados por el autor; configurable hasta 24) |
| Longitud de contexto | 128k tokens |
| Tipos de cuantizacion | IQ4_NL (dos variantes), MXFP4_MOE (tres variantes, con tensor de salida en Q5_1 o IQ4_NL) |
| Idiomas soportados | Inglés (según model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizado desde safetensors del modelo base) |

## Arquitectura y entrenamiento

El modelo base gpt-oss-20b es un transformer de tipo MoE con 24 expertos totales, de los cuales se activan un subconjunto en cada token (el autor recomienda 4-8 expertos activos según el caso de uso, advirtiendo que valores superiores a 8 pueden degradar la calidad). Soporta un contexto de 128k tokens, uso de herramientas (tool calling) y navegación, además de niveles de razonamiento ("thinking") controlables según la model card original de OpenAI. No se dispone en la información proporcionada de datos sobre el número de tokens de preentrenamiento, composición del dataset ni etapas de RLHF/DPO del modelo base.

La innovación principal de esta versión no está en la arquitectura sino en la cuantización: el autor aplica una "Doble Imatrix" (DI-Matrix), que fusiona dos datasets de calibración de importancia generados por separado (NEO, orientado a rendimiento general, y CODER, orientado a código) en un único dataset de imatrix que se aplica a los quants. El autor indica que MXFP4_MOE fue diseñado específicamente para lograr una cuantización prácticamente sin pérdida respecto al modelo fuente, aunque matiza que aún está en evaluación. También señala que la estructura de tensores de OpenAI causa problemas con ciertos tipos de quant, por lo que solo se publican quants probados (IQ4_NL, Q5_1 y Q8_0 son compatibles con dicha estructura).

## Capacidades

- Generación de código: el dataset CODER de imatrix está específicamente orientado a mejorar el rendimiento en programación; el autor reporta que supera pruebas de código exigentes (código sin dependencias, múltiples bucles, procesamiento en tiempo real sin bloqueo).
- Razonamiento y cadena de pensamiento (CoT): hereda los niveles de "thinking" del modelo base, configurables según la model card de OpenAI.
- Contexto largo: hasta 128k tokens, útil para analizar bases de código extensas.
- Tool calling: soporte de uso de herramientas y navegación según el model card.
- Chat y conversación: pipeline text-generation con etiqueta conversational.
- Resolución de problemas y brainstorming: indicado en los tags (problem solving, solve riddles, brainstorming).
- Uso general: el dataset NEO mejora el rendimiento global, no solo en código.
- Idiomas: el model card declara únicamente inglés.

## Casos de uso

- Generación de código local y privada: al ser un GGUF ejecutable en LM Studio, llama.cpp u Ollama, permite generar y refactorizar código sin enviar el repositorio a servicios externos, adecuado para código propietario o sensible.
- Asistente de programación en el editor: con contexto de 128k tokens puede indexar ficheros largos o varios módulos a la vez para explicar, documentar o corregir código dentro de un proyecto.
- Resolución de algoritmos complejos: el autor documenta una prueba en la que el modelo genera JavaScript con la Fetch API procesando cuatro streams en paralelo sin Promise.all, útil como asistente para concurrencia y patrones asíncronos.
- Chatbots y roleplay locales: el autor proporciona ajustes de smoothing (factor 1.5 en KoboldCpp, text-generation-webui o Silly Tavern) para conversaciones más fluidas.
- Razonamiento paso a paso (CoT) en local: los niveles de "thinking" del modelo base permiten tareas de razonamiento multi-paso, acertijos y resolución de problemas sin depender de la nube.
- Prototipado de agentes con herramientas: el soporte de tool calling del modelo base permite integrarlo en pipelines de agentes locales para tareas como búsqueda web o ejecución de funciones.
- Brainstorming y escritura creativa: con temperatura alta (1.2+) el autor lo sugiere para usos creativos; con temperatura baja (~0.6) para código y uso general.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El único dato de rendimiento cuantitativo es la velocidad de generación anunciada por el autor: más de 80 tokens/segundo con los quants MXFP4_MOE. Para benchmarks formales del modelo base, puede consultarse la model card de openai/gpt-oss-20b.

## Requisitos de hardware

- Tamaño del repo: 59,2 GB en total; los ficheros GGUF individuales corresponden a cuantizaciones de ~4-5 bits (IQ4_NL, MXFP4_MOE), por lo que un quant individual ocupa aproximadamente 11-13 GB (estimación según tamaño del repo y tipo de quant; no disponible el tamaño exacto por fichero).
- VRAM estimada: para un quant de 4 bits de un modelo de 21B parámetros, del orden de 12-14 GB de VRAM o RAM unificada más el KV cache (estimación; dato exacto no disponible).
- GPUs compatibles: una RTX 3090 o RTX 4090 (24 GB) debería alojar los quants con holgura; en Mac con Apple Silicon (16-32 GB de memoria unificada) es viable vía llama.cpp; no disponible confirmación específica del autor.
- Ejecutable en hardware de consumo: sí, es el objetivo principal del formato GGUF; el autor reporta más de 80 t/s con MXFP4_MOE (hardware de prueba no especificado).
- Despliegue: LM Studio (rama beta 0.3.21, entorno donde el autor realizó las pruebas), KoboldCpp, oobabooga/text-generation-webui (requiere ficheros de configuración "llama_HF" del modelo fuente), Silly Tavern como frontend; por extensión, cualquier runtime compatible con GGUF como llama.cpp u Ollama (compatibilidad exacta con Ollama no confirmada).
- Ajustes recomendados por el autor: contexto mínimo 8k, temperatura 0,6 para código/uso general y 1,2+ para creativo, repeat penalty 1,1, top-k 40, top-p 0,95, min-p 0,05, y 4-8 expertos activos.

## Comparativa con modelos similares

| Modelo | Parametros | Arquitectura | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| diablomike20/Openai_gpt-oss-20b-CODEX-CODER | 20,9B (MoE) | Transformer MoE, 24 expertos | 128k | Apache 2.0 | GGUF (IQ4_NL, MXFP4_MOE) |
| openai/gpt-oss-20b (base) | 20,9B (MoE) | Transformer MoE, 24 expertos | 128k | Apache 2.0 | Safetensors (MXFP4 nativo) |
| deepseek-ai/DeepSeek-R1-Distill-Qwen-14B | 14,9B (dense) | Transformer dense | 128k (Qwen2.5) | MIT | Safetensors, GGUF comunitario |
| Qwen/Qwen2.5-Coder-14B-Instruct | 14,7B (dense) | Transformer dense | 128k | Qwen (uso comercial con restricciones >100M MAU) | Safetensors, GGUF comunitario |

Frente al modelo base, esta versión ofrece la misma capacidad con cuantizaciones alternativas y una imatrix doble orientada a código, a costa de una posible pérdida mínima de precisión. Frente a alternativas densas de tamaño similar (DeepSeek-R1-Distill-Qwen-14B, Qwen2.5-Coder-14B), gpt-oss-20b al ser MoE activa solo una fracción de sus parámetros por token, lo que teóricamente permite mayor velocidad de inferencia, aunque no hay benchmarks comparativos publicados en la información disponible.

## Limitaciones y advertencias

- Idioma: la model card declara únicamente inglés; el rendimiento en castellano no está documentado y puede ser inferior al del modelo base sin garantías.
- Cuantización experimental: el propio autor advierte de problemas de cuantización con la estructura de tensores de OpenAI ("oddball quant sizes / mixtures") y de que solo se publican quants probados; MXFP4_MOE aún no está confirmado como sin pérdida.
- Número de expertos: usar más de 8 expertos activos puede degradar la calidad según el autor; el comportamiento por defecto puede requerir ajuste manual.
- Es una cuantización de terceros: no es un modelo oficial de OpenAI; la calidad depende de la imatrix aplicada y no hay validación independiente publicada.
- Riesgo de alucinación: inherente a cualquier LLM; en tareas de código se recomienda siempre revisión humana y pruebas automatizadas antes de integrar el código generado.
- Sesgos: hereda los sesgos del modelo base gpt-oss-20b y de sus datos de entrenamiento; no disponible un análisis de sesgos específico.
- Licencia: Apache 2.0 permite uso comercial, pero conviene revisar la model card original de OpenAI para condiciones específicas del modelo base.
- Compatibilidad de herramientas: en text-generation-webui se requieren ficheros de configuración adicionales del modelo fuente; las pruebas del autor se realizaron en una rama beta de LM Studio, por lo que la compatibilidad con versiones estables puede variar.

## Enlaces

- Ficha del modelo: https://huggingface.co/diablomike20/Openai_gpt-oss-20b-CODEX-CODER
- Modelo base (OpenAI): https://huggingface.co/openai/gpt-oss-20b
- Guía para ajustar el número de expertos activos: https://huggingface.co/DavidAU/How-To-Set-and-Manage-MOE-Mix-of-Experts-Model-Activation-of-Experts
- Guía de parámetros y samplers para maximizar rendimiento: https://huggingface.co/DavidAU/Maximizing-Model-Performance-All-Quants-Types-And-Full-Precision-by-Samplers_Parameters
- Colección de ficheros fuente para cuantizaciones (DavidAU): https://huggingface.co/collections/DavidAU/d-au-source-files-for-gguf-exl2-awq-gptq-hqq-etc-etc-66b55cb8ba25f914cbf210be
