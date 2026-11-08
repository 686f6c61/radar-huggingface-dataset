# mradermacher/LFM3-1.7B-genshin-ru-rp-GGUF

## Resumen

LFM3-1.7B-genshin-ru-rp es un modelo de lenguaje conversacional de 1.728.801.600 parámetros (aproximadamente 1,7 mil millones) derivado de la familia LFM3 (Liquid Foundation Model 3) y especializado en roleplay en ruso ambientado en el universo de Genshin Impact. El modelo original fue publicado por el usuario wafureshugen y esta ficha describe la versión cuantizada en formato GGUF elaborada por mradermacher, un conocido generador de cuantizaciones de la comunidad de Hugging Face.

Se trata de un ajuste fino (fine-tuning) mediante LoRA ya fusionada (lora-merged) sobre una base LFM3-1.7B, orientado a mantener conversaciones multi-turno con un tono y una personalidad consistentes con personajes del videojuego. No es un modelo de propósito general: su entrenamiento está sesgado deliberadamente hacia el diálogo de rol en ruso, lo que lo hace poco adecuado para tareas de razonamiento técnico, código o matemáticas.

La relevancia de esta ficha es práctica: permite ejecutar un modelo de rol de ~1,7B en hardware de consumo gracias a las cuantizaciones GGUF disponibles desde Q2_K (0,9 GB) hasta f16 (3,6 GB). Está pensado para entusiastas del roleplay que quieran desplegar localmente un chatbot temático en ruso sin depender de APIs externas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (familia LFM3, transformer; detalles no publicados en la información disponible) |
| Parámetros totales | 1.728.801.600 (≈1,7B) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | ruso (ru) |
| Licencia | lfm1.0 (etiquetada como "other" en Hugging Face) |
| Formato de pesos | GGUF (cuantizaciones estáticas); el modelo base en safetensors |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base LFM3-1.7B (número de capas, dimensión oculta, mecanismo de atención o si incorpora innovaciones como atención lineal). Lo que sí consta es que se trata de un ajuste fino sobre la familia LFM3 de Liquid AI, con una LoRA entrenada para roleplay temático de Genshin Impact en ruso y posteriormente fusionada en los pesos base (lora-merged). No se especifican el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO.

Las cuantizaciones de mradermacher son estáticas (static quants): no se han publicado versiones ponderadas por imatrix en el momento de la ficha, según indica el propio autor. La cuantización se generó a partir del modelo en formato Hugging Face (convert_type: hf), con tensores de salida cuantizados.

## Capacidades

- Generación de texto conversacional multi-turno en ruso.
- Roleplay con personalidad y estilo temáticos de Genshin Impact.
- Mantenimiento de contexto de personaje a lo largo de una conversación.
- Respuestas en registro coloquial y narrativo (diálogo de ficción).
- No se documentan capacidades de tool calling ni function calling.
- No se documentan capacidades de agente ni razonamiento multi-paso.
- No se documentan capacidades de visión, audio ni modo "thinking".
- Capacidad multilingüe limitada: el modelo está etiquetado únicamente para ruso.

## Casos de uso

- Roleplay local de personajes de Genshin Impact: el modelo se carga en llama.cpp u Ollama y sostiene conversaciones en ruso con la personalidad entrenada, sin coste por token ni envío de datos a terceros.
- Chatbot temático para comunidades de fans: se puede integrar en un bot de Discord o Telegram en ruso para responder a usuarios en el rol de un personaje concreto.
- Prototipado rápido de experiencias conversacionales: al ocupar menos de 2 GB en Q4_K_M, permite iterar sobre prompts de sistema y plantillas de personaje en un portátil sin GPU dedicada.
- Generación de diálogos de ficción: útil para escribir borradores de escenas conversacionales en ruso con un tono consistente, que luego un humano revisa y edita.
- Pruebas de cuantización y despliegue: sirve como banco de pruebas para validar pipelines GGUF (llama.cpp, Ollama, servidores compatibles con endpoints) con un modelo pequeño y de licencia restrictiva antes de pasar a modelos mayores.
- Investigación sobre ajuste fino temático: como ejemplo de LoRA fusionada sobre una base pequeña, es útil para estudiar cómo el fine-tuning desplaza el estilo y el idioma de un modelo base de 1,7B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia según cuantización: Q2_K ≈ 0,9 GB; Q4_K_M ≈ 1,2 GB; Q8_0 ≈ 1,9 GB; f16 ≈ 3,6 GB (tamaños de fichero; la VRAM real añade overhead de contexto KV).
- Cabe holgadamente en GPU de consumo: RTX 3060 12 GB, RTX 4060 8 GB, RTX 4090 24 GB, e incluso en iGPU con memoria unificada usando Q4_K_S o Q4_K_M.
- GPU de datacenter (A100, H100) no son necesarias; el modelo es demasiado pequeño para aprovecharlas y quedarían infrautilizadas.
- Despliegue recomendado: llama.cpp y Ollama para uso local; servidores compatibles con endpoints para integración en aplicaciones. vLLM y TGI no se documentan para este GGUF en la información disponible.
- Latencia y throughput estimados: no disponibles. Por el tamaño (1,7B) se espera ejecución en tiempo real en GPU de consumo con Q4, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| LFM3-1.7B-genshin-ru-rp (esta ficha) | ≈1,7B | no disponible | ru | lfm1.0 | GGUF, safetensors |
| Modelo base wafureshugen/LFM3-1.7B-genshin-ru-rp | ≈1,7B | no disponible | ru | lfm1.0 | safetensors |
| Alternativas de rol de ~1-2B en ruso | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones de modelos comparables en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa fiable.

## Limitaciones y advertencias

- Modelo altamente especializado: su entrenamiento en roleplay de Genshin Impact en ruso lo hace inadecuado para tareas generales de razonamiento, código o matemáticas.
- Idioma restringido al ruso; el rendimiento en castellano u otros idiomas no está garantizado y probablemente sea deficiente.
- Riesgo de alucinación elevado en preguntas factuales: al ser un modelo pequeño y ajustado para ficción, no debe usarse como fuente de información.
- Sesgos: no documentados, pero el dataset de roleplay puede introducir sesgos de estilo, género o caracterización de personajes.
- Licencia lfm1.0: es una licencia restrictiva que puede limitar el uso comercial. Es imprescindible revisar el fichero LICENSE del modelo base antes de cualquier despliegue en producción.
- Las cuantizaciones de baja precisión (Q2_K, Q3_K_S) degradan la coherencia del diálogo; se recomienda Q4_K_M o superior para roleplay.
- No hay versiones ponderadas por imatrix disponibles según el autor, lo que puede afectar a la calidad de las cuantizaciones IQ frente a alternativas.
- Longitud de contexto no documentada: no se puede planificar el uso en conversaciones largas sin verificarla empíricamente.
- Modelo con 0 descargas y 0 likes en el momento de la ficha: sin validación comunitaria ni reportes de calidad.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/LFM3-1.7B-genshin-ru-rp-GGUF
- Modelo base: https://huggingface.co/wafureshugen/LFM3-1.7B-genshin-ru-rp
- Página de descargas del autor: https://hf.tst.eu/model#LFM3-1.7B-genshin-ru-rp-GGUF
- Perfil del cuantizador: https://huggingface.co/mradermacher
- Solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Comparativa de tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
