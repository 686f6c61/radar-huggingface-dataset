# Hack100/Qwen2.5-72B-Instruct

## Resumen

Qwen2.5-72B-Instruct es la variante de instrucciones del modelo de lenguaje denso de 72 700 millones de parámetros de la familia Qwen2.5, desarrollada por el equipo Qwen de Alibaba Cloud. Este repositorio concreto (`Hack100/Qwen2.5-72B-Instruct`) es una redistribución del modelo original `Qwen/Qwen2.5-72B-Instruct`, publicado sin métricas de descargas ni interacciones en Hugging Face y con fecha de creación posterior a la publicación original del modelo. Se trata, por tanto, de una copia de los pesos originales más que de un ajuste fino propio del autor del repositorio.

El modelo emplea una arquitectura transformer causal con RoPE, SwiGLU, RMSNorm y sesgo en las proyecciones QKV, con 80 capas y atención GQA (64 cabezas de consulta frente a 8 de clave-valor). Su ventana de contexto nativa es de 131 072 tokens, ampliable mediante YaRN, y es capaz de generar hasta 8192 tokens por respuesta. Resuelve tareas de generación de texto, razonamiento, código, matemáticas y comprensión de datos estructurados, con soporte declarado para más de 29 idiomas.

Su relevancia radica en que, en el momento de su publicación, se situó como uno de los modelos abiertos densos de mayor tamaño y rendimiento de la familia Qwen2.5, compitiendo directamente con alternativas como Llama 3.1 70B en tareas de instrucciones, código y matemáticas, bajo una licencia propia de Qwen que permite uso comercial con condiciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal con RoPE, SwiGLU, RMSNorm y sesgo en proyecciones QKV (GQA) |
| Parametros totales | 72 706 203 648 (72,7B); 70,0B sin embeddings |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 131 072 tokens nativos; 32 768 en la configuración por defecto de `config.json`, ampliable a 131K con YaRN (factor 4.0) |
| Generación máxima | 8192 tokens |
| Capas | 80 |
| Cabezas de atención | 64 (Q) / 8 (KV), GQA |
| Tipos de cuantizacion | No especificados en la información disponible; pesos publicados en safetensors (BF16) |
| Idiomas soportados | Más de 29 idiomas según la model card (chino, inglés, francés, español, portugués, alemán, italiano, ruso, japonés, coreano, vietnamita, tailandés, árabe, entre otros); el campo `language` del repo solo declara `en` |
| Licencia | `other` con `license_name: qwen` (licencia Qwen, enlazada en el repo original) |
| Formato de pesos | safetensors (tamaño del repo: 145,4 GB) |
| Librería | transformers (requiere `transformers>=4.37.0`) |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

El modelo es un transformer causal denso de 80 capas con normalización RMSNorm, activación SwiGLU, embeddings rotatorios (RoPE) y atención con query-key-value bias. Usa Grouped Query Attention con 64 cabezas de consulta y 8 de clave-valor, lo que reduce el coste de memoria de la caché KV durante la inferencia respecto a atención multi-cabeza completa. El modelo tiene 72,7B parámetros totales, de los cuales 70,0B corresponden a parámetros no-embedding.

El entrenamiento consta de dos fases: preentrenamiento y post-entrenamiento (instrucciones). La model card indica que la familia Qwen2.5 incorpora modelos expertos especializados en código y matemáticas que han mejorado sustancialmente estas capacidades respecto a Qwen2. La información proporcionada no detalla el número exacto de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas concretas de RLHF o DPO; únicamente se menciona la fase de post-entrenamiento sin especificar el algoritmo. La innovación técnica destacable es la extrapolación de contexto mediante YaRN, que permite extender la ventana efectiva de 32K a 131K tokens configurando `rope_scaling` con factor 4.0.

## Capacidades

- Generación de texto y conversación multi-turno con plantilla de chat (`apply_chat_template`).
- Razonamiento, matemáticas y generación de código, con mejoras atribuidas a modelos expertos especializados en estas áreas.
- Comprensión y generación de datos estructurados, incluido JSON, y generación de textos largos de más de 8K tokens.
- Seguimiento de instrucciones robusto frente a diversidad de system prompts, útil para role-play y condicionamiento de chatbots.
- Capacidades multilingües declaradas para más de 29 idiomas, incluido el español.
- Soporte de contexto largo de hasta 131 072 tokens mediante YaRN.
- Integración con `text-generation-inference` y endpoints compatibles (según tags del repo).
- Soporte de tool calling / function calling: no confirmado explícitamente en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no confirmadas explícitamente en la información proporcionada.
- Modo thinking, visión o audio: no disponibles en este modelo (es un modelo de texto).

## Casos de uso

- Atención al cliente automatizada: con 131K tokens de contexto (activando YaRN) puede mantener conversaciones multi-turno con historial extenso y documentación de producto adjunta, manteniendo coherencia en diálogos largos.
- Generación de código en producción: sus mejoras específicas en código permiten usarlo como asistente de programación, autocompletado y revisión de parches en pipelines de desarrollo, aunque la integración con herramientas debe validarse por no estar confirmado el tool calling.
- Análisis de documentos extensos: informes, contratos o expedientes de decenas de miles de tokens pueden procesarse en una sola pasada activando la extensión YaRN, extrayendo resúmenes y respuestas sobre el contenido.
- Generación de JSON y salidas estructuradas: adecuado para extracción de entidades, rellenado de formularios y transformación de datos no estructurados a esquemas JSON en backends de aplicaciones.
- Traducción y localización multilingüe: con soporte para más de 29 idiomas, puede emplearse en pipelines de traducción y adaptación de contenido, incluyendo español, francés, alemán y portugués.
- Asistente de investigación y síntesis: para resumir artículos científicos, comparar fuentes y generar borradores técnicos, aprovechando su capacidad de generar textos largos de más de 8K tokens.
- Chatbot con role-play y condicionamiento: su resiliencia a distintos system prompts lo hace apto para personajes, tutores virtuales y asistentes con instrucciones de sistema complejas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite al blog oficial de Qwen2.5 para los resultados detallados de evaluación y a la documentación de Qwen para las métricas de throughput y requisitos de memoria, pero no incluye cifras concretas en el repositorio.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 145 GB solo para pesos, más caché KV y overhead, por lo que se requieren múltiples GPU.
- En cuantización de 8 bits: en torno a 75-80 GB de VRAM; en 4 bits, en torno a 40-45 GB (estimaciones según el tamaño de parámetros, no confirmadas en la información disponible).
- GPU recomendadas: múltiples A100 80GB, H100 80GB o H200; el modelo no cabe en una sola GPU consumer.
- GPU consumer: no cabe en RTX 4090 (24 GB) ni en RTX 3090 en precisión completa ni en 8 bits; en 4 bits requeriría al menos dos GPU de 24 GB con reparto de capas, con latencia elevada.
- Opciones de despliegue: vLLM (recomendado explícitamente por el autor para contexto largo), TGI, transformers con `device_map="auto"`; llama.cpp/Ollama no están confirmados en la información disponible.
- Latencia y throughput: no disponibles en la información proporcionada; la model card enlaza a la tabla de speed benchmark de la documentación de Qwen.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Qwen2.5-72B-Instruct (este repo) | 72,7B | 131K (YaRN) | Qwen (other) | Hugging Face, safetensors | Redistribución sin métricas de uso |
| Qwen2.5-72B-Instruct (original) | 72,7B | 131K (YaRN) | Qwen (other) | Hugging Face, safetensors | Repo oficial con soporte del equipo Qwen |
| Llama 3.1 70B Instruct | 70B | 128K | Llama 3.1 Community License | Hugging Face, Meta | Alternativa densa de tamaño comparable; benchmarks no disponibles en esta ficha |
| Qwen2.5-32B-Instruct | 32B | 131K (YaRN) | Qwen (other) | Hugging Face | Versión menor de la misma familia, menor coste de despliegue |

No se dispone de datos de rendimiento comparativo en la información proporcionada, por lo que la comparativa se limita a parámetros, contexto, licencia y disponibilidad.

## Limitaciones y advertencias

- Este repositorio es una redistribución no oficial del modelo original; conviene usar el repo oficial `Qwen/Qwen2.5-72B-Instruct` para garantizar integridad de pesos y soporte.
- Riesgo de alucinación inherente a los modelos de lenguaje; no se han publicado evaluaciones de fidelidad en la información disponible.
- Sesgos conocidos: no documentados en la información proporcionada; se recomienda evaluar sesgos por idioma y dominio antes de desplegar en producción.
- El campo `language` del repo declara únicamente `en`, aunque la model card afirma soporte para más de 29 idiomas; el rendimiento en español no está cuantificado en la información disponible.
- La licencia Qwen (`other`) impone condiciones de uso comercial que deben revisarse en el enlace de licencia del repo original antes de un despliegue productivo.
- El contexto por defecto en `config.json` es de 32 768 tokens; usar entradas más largas requiere configurar YaRN, y vLLM solo soporta YaRN estático, lo que puede degradar el rendimiento en textos cortos.
- Requiere `transformers>=4.37.0`; versiones anteriores fallan con `KeyError: 'qwen2'`.
- No se confirma soporte nativo de tool calling ni de flujos de agente en la información disponible, lo que limita su uso directo en pipelines agénticos sin capas adicionales.
- El tamaño de 72,7B impide su despliegue en hardware consumer de una sola GPU, lo que encarece la inferencia frente a alternativas de 7B-32B.

## Enlaces

- Repositorio Hugging Face de esta redistribución: https://huggingface.co/Hack100/Qwen2.5-72B-Instruct
- Modelo original: https://huggingface.co/Qwen/Qwen2.5-72B-Instruct
- Licencia Qwen: https://huggingface.co/Qwen/Qwen2.5-72B-Instruct/blob/main/LICENSE
- Blog de Qwen2.5: https://qwenlm.github.io/blog/qwen2.5/
- Repositorio GitHub de Qwen2.5: https://github.com/QwenLM/Qwen2.5
- Documentación de Qwen: https://qwen.readthedocs.io/en/latest/
- Documentación de despliegue con vLLM: https://qwen.readthedocs.io/en/latest/deployment/vllm.html
- Benchmarks de velocidad: https://qwen.readthedocs.io/en/latest/benchmark/speed_benchmark.html
- Chat de Qwen: https://chat.qwenlm.ai/
- Paper de YaRN: https://arxiv.org/abs/2309.00071
- Paper de Qwen2 (referencia arXiv 2407.10671): https://arxiv.org/abs/2407.10671
