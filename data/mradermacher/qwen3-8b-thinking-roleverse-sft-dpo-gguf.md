# mradermacher/Qwen3-8B-Thinking-RoleVerse-SFT-DPO-GGUF

## Resumen

Qwen3-8B-Thinking-RoleVerse-SFT-DPO es un modelo de lenguaje de 8 mil millones de parámetros especializado en role-playing y diálogo conversacional, desarrollado por tinyrolls a partir de Qwen3-8B de Alibaba. El modelo se ha ajustado mediante SFT (supervised fine-tuning) y posteriormente DPO (Direct Preference Optimization) sobre el dataset RoleVerse, con el objetivo de mejorar la generación de personajes coherentes y conversaciones inmersivas multi-turno.

La ficha aquí presentada corresponde a la versión GGUF cuantizada por mradermacher, un cuantizador muy conocido en la comunidad por sus conversiones estáticas de alta calidad. Esta versión permite ejecutar el modelo en hardware de consumo mediante llama.cpp, Ollama u otros runtimes compatibles con GGUF, con cuantizaciones que van desde Q2_K (3,4 GB) hasta f16 (16,5 GB).

El modelo conserva el carácter "Thinking" de la familia Qwen3, es decir, mantiene el modo de razonamiento extendido antes de responder, lo que puede aportar mayor coherencia narrativa en sesiones largas de role-playing. Soporta cinco idiomas (inglés, chino, japonés, francés y español) y se distribuye bajo licencia Apache 2.0, lo que permite su uso comercial sin restricciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (familia Qwen3), dense |
| Parametros totales | 8.190.735.360 |
| Parametros activos | no disponible (no es MoE; todos los parámetros activos) |
| Longitud de contexto | no disponible (la familia Qwen3-8B base soporta típicamente 32.768 tokens, ampliable a 131.072 con YaRN, pero no consta en la model card) |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en, zh, ja, fr, es |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (esta versión); el modelo base está disponible en safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-8B, un transformer decoder denso de la familia Qwen3 de Alibaba. La variante "Thinking" hereda el mecanismo de razonamiento extendido de Qwen3, en el que el modelo genera primero un bloque de pensamiento interno antes de producir la respuesta final, lo que suele mejorar la coherencia en tareas que requieren planificación, como mantener la personalidad y el estado de una conversación de rol a lo largo de muchos turnos.

El ajuste fino se realizó en dos etapas sobre el dataset tinyrolls/RoleVerse: primero un SFT (supervised fine-tuning) para adaptar el estilo de diálogo y role-playing, y después un DPO (Direct Preference Optimization) para alinear las respuestas con preferencias humanas o sintéticas sobre calidad de interpretación de personajes. No se ha publicado información sobre el número de tokens de entrenamiento, la composición detallada del dataset ni los hiperparámetros del entrenamiento. La versión aquí descrita es una cuantización estática GGUF realizada por mradermacher a partir de los pesos originales en safetensors.

## Capacidades

- Generación de texto conversacional especializada en role-playing: interpretación de personajes, diálogos inmersivos y narrativa interactiva.
- Diálogo multi-turno con mantenimiento de personaje, mejorado mediante DPO sobre preferencias de role-playing.
- Modo "Thinking" heredado de Qwen3: razonamiento extendido antes de responder (útil para coherencia narrativa; puede desactivarse según el runtime).
- Capacidades multilingües en cinco idiomas: inglés, chino, japonés, francés y español.
- Razonamiento general, matemáticas y código heredados del modelo base Qwen3-8B, aunque probablemente degradados respecto al original por el fine-tuning específico en role-playing.
- No consta soporte nativo de tool calling / function calling en la model card, aunque el modelo base Qwen3 sí lo incorpora; no disponible de forma confirmada.
- No incluye capacidades de visión ni audio; es un modelo de texto exclusivamente.

## Casos de uso

- Role-playing interactivo y juegos de narrativa: el modelo puede encarnar personajes con personalidades definidas en sesiones largas, manteniendo el tono y la coherencia del personaje gracias al fine-tuning sobre RoleVerse.
- Compañeros de conversación y chatbots de personaje: ideal para aplicaciones de compañía virtual donde la calidad del diálogo y la consistencia de personalidad son prioritarias sobre la precisión factual.
- Generación de diálogos para videojuegos: puede usarse para prototipar diálogos de NPCs dinámicos en herramientas de diseño narrativo, ejecutándose localmente sin coste por token.
- Escritura creativa asistida: generación de escenas, monólogos y conversaciones ficticias en los cinco idiomas soportados, incluido el castellano.
- Evaluación e investigación en alineación conversacional: al ser un modelo abierto con DPO sobre un dataset público, sirve como base para experimentos de investigación en SFT/DPO para diálogo.
- Asistente conversacional multilingüe en local: con la cuantización Q4_K_M (5,1 GB) funciona en portátiles y GPUs de consumo vía Ollama o LM Studio, sin enviar datos a la nube, relevante para privacidad del usuario.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Al tratarse de un fine-tuning orientado a role-playing, los benchmarks estándar (MMLU, HumanEval, GSM8K) del modelo base Qwen3-8B no son directamente transferibles a esta variante.

## Requisitos de hardware

- VRAM estimada para inferencia (pesos del modelo, sin KV cache):
  - Q2_K: ~3,4 GB
  - Q4_K_M: ~5,1 GB
  - Q6_K: ~6,8 GB
  - Q8_0: ~8,8 GB
  - f16: ~16,5 GB
- GPU recomendadas: cualquier GPU con 6 GB de VRAM o más para cuantizaciones Q4; RTX 3060 12 GB, RTX 4060 Ti 16 GB o RTX 4090 para cuantizaciones altas con contexto amplio.
- Cabe en GPUs de consumo: sí. La cuantización Q4_K_M (5,1 GB) funciona en GPUs de 6-8 GB e incluso parcialmente en CPU con RAM suficiente; Q8_0 requiere ~9 GB.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, KoboldCpp (muy usado para role-playing), text-generation-webui y cualquier runtime compatible con GGUF. La versión en safetensors del modelo base puede desplegarse con vLLM, TGI o SGLang.
- Latencia y throughput: no disponibles; en un RTX 4090 con cuantización Q4_K_M, un modelo de 8B típicamente supera los 100 tokens/s, pero este dato no consta en la model card.

## Comparativa con modelos similares

| Modelo | Parametros | Especializacion | Licencia | Formato GGUF |
|---|---|---|---|---|
| Qwen3-8B-Thinking-RoleVerse-SFT-DPO | 8,2B | Role-playing y diálogo | Apache 2.0 | Sí (esta ficha) |
| Qwen3-8B (base, Alibaba) | 8,2B | Uso general, thinking mode | Apache 2.0 | Sí |
| Nous-Hermes-2-Mistral-7B-DPO | 7B | Diálogo general, DPO | Apache 2.0 | Sí |

Frente al Qwen3-8B original, esta variante sacrifica parte de la generalidad a cambio de un estilo de diálogo y role-playing notablemente mejorado mediante SFT+DPO sobre RoleVerse. Frente a otros modelos de diálogo de 7-8B basados en Mistral, ofrece soporte nativo de cinco idiomas (incluido chino y japonés, donde Mistral es más débil), modo thinking y licencia Apache 2.0 igualmente permisiva.

## Limitaciones y advertencias

- Especialización en role-playing: el fine-tuning puede degradar capacidades de razonamiento, código y matemáticas respecto al Qwen3-8B base; no se han publicado benchmarks que cuantifiquen esta degradación.
- Riesgo de alucinación: elevado en contexto de role-playing, donde el modelo puede generar hechos falsos con apariencia convincente como parte de la interpretación.
- Sesgos: hereda los sesgos del dataset RoleVerse y del preentrenamiento de Qwen3; al tratarse de contenido de role-playing, puede reproducir estereotipos o contenido inapropiado sin filtros adicionales.
- Idiomas: soporte confirmado solo para cinco idiomas; el rendimiento en castellano no está cuantificado y puede ser inferior al del inglés o chino.
- Longitud de contexto: no confirmada en la model card; verificar en la ficha del modelo base antes de desplegar con contextos largos.
- Licencia: Apache 2.0 permite uso comercial sin restricciones relevantes; sin caveat de licencia destacable.
- Modo thinking: el razonamiento extendido consume tokens adicionales y aumenta la latencia; en aplicaciones de chat de rol conviene evaluar si conviene desactivarlo.
- Esta ficha describe la cuantización GGUF de mradermacher; para soporte del modelo en sí, recurrir al autor original (tinyrolls).

## Enlaces

- Modelo cuantizado (esta ficha): https://huggingface.co/mradermacher/Qwen3-8B-Thinking-RoleVerse-SFT-DPO-GGUF
- Modelo base original: https://huggingface.co/tinyrolls/Qwen3-8B-Thinking-RoleVerse-SFT-DPO
- Cuants weighted/imatrix: https://huggingface.co/mradermacher/Qwen3-8B-Thinking-RoleVerse-SFT-DPO-i1-GGUF
- Dataset de entrenamiento: https://huggingface.co/datasets/tinyrolls/RoleVerse
- Pagina de descargas de mradermacher: https://hf.tst.eu/model#Qwen3-8B-Thinking-RoleVerse-SFT-DPO-GGUF
- FAQ y solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF de TheBloke: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Notas de Artefact2 sobre cuantizacion: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
