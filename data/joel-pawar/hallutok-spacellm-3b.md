# joel-pawar/hallutok-SpaceLLM-3B

## Resumen

Hallutok-SpaceLLM-3B es un ajuste fino por adaptación de dominio del modelo Llama-3.2-3B-Instruct, desarrollado por el usuario joel-pawar y publicado en HuggingFace. El modelo está especializado en el ámbito espacial y aeroespacial, con entrenamiento orientado a misiones de NASA, SpaceX e ISRO, conceptos de ingeniería de sistemas espaciales y conocimiento técnico relacionado. La propuesta es ofrecer mayor densidad factual y mejor alineación terminológica que los modelos de propósito general del mismo tamaño en consultas sobre el dominio espacial.

El ajuste se realizó mediante QLoRA en 4 bits con la librería Unsloth, con rango LoRA de 16 y alpha de 16, aplicado a los módulos de atención y MLP del transformer. El entrenamiento se llevó a cabo en una GPU NVIDIA T4 (nivel gratuito de Google Colab) durante 150 pasos, con una longitud máxima de secuencia de 2048 tokens. Los pesos resultantes se fusionaron a 16 bits para su distribución.

Con 3.212.749.824 parámetros y un tamaño de repositorio de 6,4 GB, el modelo se posiciona como una opción ligera para asistentes de dominio espacial, pipelines de RAG y aplicaciones educativas. Su licencia Apache 2.0 facilita el uso comercial, aunque el autor advierte explícitamente que no debe emplearse en sistemas críticos de seguridad ni como única fuente de verdad en ingeniería.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Llama 3.2 (transformer decoder-only) |
| Parametros totales | 3.212.749.824 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2048 tokens (longitud máxima de entrenamiento) |
| Tipos de cuantizacion | 4-bit NF4 durante entrenamiento; pesos fusionados a 16-bit; cuantización posterior no documentada |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Modelo base | unsloth/Llama-3.2-3B-Instruct |
| Metodo de ajuste | QLoRA (4-bit) + Unsloth |
| Rango LoRA (r) | 16 |
| Alpha LoRA | 16 |
| Modulos objetivo | q_proj, k_proj, v_proj, o_proj, gate_proj, up_proj, down_proj |
| Precision de entrenamiento | 4-bit NF4 → fusionado a 16-bit |
| Framework de entrenamiento | Unsloth + TRL + Hugging Face Transformers |
| Hardware de entrenamiento | NVIDIA T4 (Google Colab Free Tier) |
| Pasos de entrenamiento | 150 |
| Tamano del repositorio | 6,4 GB |
| Descargas | 0 |
| Likes | 0 |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura Llama 3.2 de 3 mil millones de parámetros, un transformer decoder-only con atención por grupos (GQA) y las capas de atención y MLP estándar de la familia Llama 3.2. Sobre esta base se aplicó un ajuste fino supervisado mediante QLoRA en 4 bits (NF4) con Unsloth, que optimiza el uso de memoria y acelera el entrenamiento en GPUs de gama baja. El rango LoRA es 16 con alpha 16, y los módulos adaptados cubren las proyecciones de query, key, value y output de la atención, así como las proyecciones gate, up y down del bloque MLP.

El entrenamiento se realizó en una única NVIDIA T4 del nivel gratuito de Google Colab durante 150 pasos, con una longitud máxima de secuencia de 2048 tokens. Los datos de ajuste provienen de una mezcla curada de fuentes de alta señal: AstroChat (dataset conversacional sobre ingeniería de misiones espaciales y astronáutica), el historial de lanzamientos de SpaceX convertido a formato instrucción-respuesta, registros de misiones de ISRO transformados a pares instrucción-respuesta, un subconjunto del NASA Exoplanet Archive y el dataset Deep Space Probes (misiones Voyager, Cassini y relacionadas). Los datasets estructurados se convirtieron manualmente a formato instrucción-respuesta limpio antes del entrenamiento. No se documenta el uso de RLHF ni DPO, ni el número total de tokens de entrenamiento.

## Capacidades

- Generación de texto conversacional en inglés con formato de chat (chat template de Llama 3.2).
- Conocimiento factual sobre misiones de NASA, SpaceX e ISRO: programas, hitos y agencias.
- Identificación y explicación de vehículos de lanzamiento: Falcon 9, PSLV, GSLV, Starship y otros.
- Explicación de conceptos de sistemas espaciales e ingeniería de misiones en lenguaje estructurado y accesible.
- Respuesta a preguntas técnicas del dominio aeroespacial con terminología alineada.
- Capacidad de servir como base para pipelines de RAG en el dominio espacial.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, visión, audio ni modo de razonamiento extendido (thinking mode).
- Capacidades multilingües limitadas al inglés según la model card.

## Casos de uso

- Educación y divulgación espacial: el modelo puede responder preguntas sobre misiones históricas y actuales (Apollo, Chandrayaan-3, Falcon 9) con lenguaje estructurado, adecuado para plataformas educativas y chatbots de museos o centros de ciencia.
- Asistente técnico de dominio con RAG: integrado en un pipeline de recuperación aumentada sobre documentación oficial de NASA, ISRO o SpaceX, el modelo puede generar respuestas fundamentadas en los documentos recuperados, aprovechando su terminología especializada para reducir respuestas genéricas.
- Atención al cliente o soporte interno en empresas aeroespaciales: para consultas frecuentes sobre vehículos de lanzamiento, programas y conceptos de misión, con la ventaja de ejecutarse en GPUs de consumo o entornos gratuitos.
- Generación de material divulgativo: redacción de fichas, resúmenes y explicaciones sobre misiones y tecnología espacial para blogs, newsletters o material didáctico, con revisión humana posterior.
- Prototipado rápido de asistentes de dominio: al ser un modelo de 3B parámetros con licencia Apache 2.0, permite experimentar con adaptación de dominio y desplegar demos en entornos con recursos limitados (Colab, GPUs T4).
- Investigación en adaptación de dominio: sirve como caso de estudio reproducible de ajuste QLoRA con Unsloth sobre Llama 3.2, útil para investigadores que analizan el efecto de datasets curados pequeños (150 pasos) en la densidad factual de modelos pequeños.
- Base para ajustes adicionales: al estar fusionado a 16 bits y con licencia permisiva, puede emplearse como punto de partida para especializaciones más profundas o para combinar con otros adaptadores.

## Benchmarks y rendimiento

La model card documenta únicamente una evaluación de dominio propia, no benchmarks estándar (MMLU, HumanEval, GSM8K, etc.).

| Metrica | Resultado |
|---|---|
| Tamano del conjunto de evaluación | 8 preguntas centrales |
| Precision de coincidencia factual / por palabras clave | Moderada a alta |
| Rendimiento cualitativo | Fuerte en hechos de misiones, nombres de vehículos y programas de agencias |

No se han publicado resultados de benchmarks estandarizados en la información disponible. El autor indica que una suite de evaluación más completa (preguntas técnicas de formato largo y análisis de alucinaciones) está prevista para futuras versiones.

## Requisitos de hardware

- VRAM estimada para inferencia en 16 bits: aproximadamente 6,4 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, en torno a 8-10 GB para secuencias de 2048 tokens.
- VRAM estimada en 4 bits (NF4): aproximadamente 2-3 GB para pesos, con un total práctico de 4-6 GB según longitud de contexto y batch.
- GPU recomendadas: NVIDIA T4 (16 GB), RTX 3060/4060 (8-12 GB), RTX 4090 (24 GB), A100/H100 para despliegues con mayor concurrencia.
- Cabe en GPUs de consumo: sí, en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080 y superiores, especialmente con cuantización 4 bits.
- Opciones de despliegue: transformers (con Unsloth o sin él), text-generation-inference (el repo incluye el tag endpoints_compatible), llama.cpp/Ollama si se generan pesos GGUF (no incluidos en el repo), vLLM para serving de alto rendimiento.
- Latencia y throughput: no disponibles en la información proporcionada. El entrenamiento se realizó en una T4, lo que sugiere viabilidad en entornos de gama baja, pero no se documentan métricas de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Especializacion | Disponibilidad |
|---|---|---|---|---|---|
| Hallutok-SpaceLLM-3B | 3,21B | 2048 | Apache 2.0 | Dominio espacial/aeroespacial (NASA, SpaceX, ISRO) | HuggingFace, 0 descargas |
| Llama-3.2-3B-Instruct (base) | 3,21B | 128K (modelo original) | Llama 3.2 Community License | Propósito general | Amplia adopción |
| Modelos de 3B de propósito general (p. ej. Qwen2.5-3B-Instruct) | ~3B | 32K | Apache 2.0 / otras | Propósito general | Amplia adopción |

La comparación directa con alternativas especializadas en el dominio espacial no está disponible en la información proporcionada. Frente a su modelo base, Hallutok-SpaceLLM-3B reduce la ventana de contexto efectiva a 2048 tokens (frente a los 128K del Llama 3.2 original) y cambia la licencia a Apache 2.0, lo que facilita el uso comercial. No se dispone de datos de rendimiento comparativo con otros modelos del mismo tamaño en tareas del dominio.

## Limitaciones y advertencias

- Cobertura de conocimiento limitada por el tamaño y la diversidad del dataset de ajuste fino; puede fallar en temas técnicos muy especializados o de baja representación.
- Riesgo de alucinación en temas técnicos altamente especializados o con pocos datos; el autor lo reconoce explícitamente.
- No sustituye la documentación oficial de NASA, ISRO o SpaceX; no debe usarse como única fuente de verdad en ingeniería.
- No recomendado para sistemas críticos de seguridad ni para operaciones de misión en tiempo real sin verificación humana.
- Idioma limitado al inglés; no se documenta soporte de otros idiomas.
- Ventana de contexto de 2048 tokens, muy inferior a la del modelo base, lo que limita conversaciones largas y documentos extensos.
- Evaluación muy reducida (8 preguntas) y sin benchmarks estandarizados; el rendimiento real en producción no está caracterizado.
- Entrenamiento corto (150 pasos) en hardware de gama baja (T4), lo que puede limitar la profundidad de la adaptación.
- Sesgos conocidos: no documentados en la información disponible; al derivar de Llama 3.2, hereda los sesgos potenciales del modelo base.
- Aunque la licencia es Apache 2.0, conviene verificar las condiciones del modelo base Llama 3.2 si se redistribuye o se combinan componentes.
- El repositorio no incluye pesos GGUF ni cuantizaciones listas para llama.cpp/Ollama; habría que generarlas.
- Modelo con 0 descargas y 0 likes en el momento de la consulta; sin validación por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/joel-pawar/hallutok-SpaceLLM-3B
- Modelo base: https://huggingface.co/unsloth/Llama-3.2-3B-Instruct
- Unsloth (framework de entrenamiento): https://github.com/unslothai/unsloth
- TRL (Hugging Face): https://github.com/huggingface/trl
- Documentación de Llama 3.2: https://ai.meta.com/blog/llama-3-2-connect-2024-vision-edge-mobile-devices/
- No se han encontrado papers, blogs, repositorios adicionales ni demos en la información proporcionada.
