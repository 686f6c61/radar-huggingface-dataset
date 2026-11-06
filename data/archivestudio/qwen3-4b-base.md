# ArchiveStudio/Qwen3-4B-Base

## Resumen

Qwen3-4B-Base es un modelo de lenguaje causal de tipo denso (no MoE) perteneciente a la tercera generación de la familia Qwen, desarrollada por el equipo Qwen de Alibaba. Esta ficha concreta corresponde a una réplica alojada por el usuario ArchiveStudio en Hugging Face bajo el identificador `ArchiveStudio/Qwen3-4B-Base`; el modelo original es publicado por el equipo Qwen. Se trata de la variante *base*, es decir, únicamente preentrenada y sin ajuste por instrucciones ni alineamiento por preferencias, lo que la hace adecuada como punto de partida para *fine-tuning* y no para uso directo en conversación.

El modelo cuenta con 4.022.468.096 parámetros totales (3.6B no pertenecientes a *embeddings*), 36 capas y una ventana de contexto de 32.768 tokens. Emplea atención con *Grouped Query Attention* (32 cabezas de consulta y 8 de clave-valor) y añade *qk layernorm* para mejorar la estabilidad del entrenamiento. El preentrenamiento se realizó sobre 36 billones de tokens en 119 idiomas, con un currículo de tres etapas que prioriza conocimiento general, después razonamiento (STEM, código, lógica) y finalmente comprensión de contexto largo.

Su relevancia radica en que ofrece un modelo denso de 4B con contexto de 32k y licencia Apache 2.0, lo que permite uso comercial sin restricciones y despliegue en hardware de consumo. Al ser una variante *base*, no incorpora modo *thinking* ni capacidades de agente nativas: esas funciones se activan en las variantes instructivas de Qwen3, no en este checkpoint.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer causal denso con GQA y qk layernorm |
| Parámetros totales | 4.022.468.096 (4.0B) |
| Parámetros activos | No aplica (modelo denso) |
| Parámetros no-embedding | 3.6B |
| Capas | 36 |
| Cabezas de atención | 32 Q / 8 KV (GQA) |
| Longitud de contexto | 32.768 tokens |
| Tipos de cuantización | No disponible en la información proporcionada (pesos en safetensors; cuantizaciones GGUF/AWQ no listadas en el repo) |
| Idiomas soportados | 119 idiomas según la model card (lista concreta no disponible) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Etapa de entrenamiento | Solo preentrenamiento (base) |
| Tamaño del repositorio | 8.0 GB |
| Librería | transformers (requiere >= 4.51.0) |

## Arquitectura y entrenamiento

La arquitectura es un transformer causal denso con 36 capas, atención por *Grouped Query Attention* (32 cabezas de consulta y 8 de clave-valor, lo que reduce el coste de la caché KV) y normalización *qk layernorm* aplicada a las consultas y claves para estabilizar el entrenamiento. No se trata de un modelo MoE ni híbrido SSM: es un denso puro, por lo que todos los parámetros se activan en cada *forward pass*.

El preentrenamiento se estructuró en tres etapas sobre un corpus de 36 billones de tokens en 119 idiomas, con mezcla de datos de código, STEM, razonamiento, libros, multilingüe y datos sintéticos. La etapa 1 cubre modelado de lenguaje general y adquisición de conocimiento; la etapa 2 refuerza razonamiento (STEM, código, lógica); la etapa 3 extiende la longitud de secuencia hasta 32k tokens para mejorar la comprensión de contexto largo. Los hiperparámetros (learning rate, batch size) se ajustaron mediante estudios de *scaling laws* separados para modelos densos y MoE. Al ser una variante *base*, no se aplicaron RLHF ni DPO; tampoco se documentan innovaciones de decodificación especulativa ni atención lineal en la información disponible.

## Capacidades

- Modelado de lenguaje causal y generación de texto autoregresiva.
- Capacidad de continuación y *completion* de texto, no de instrucciones (al ser *base*).
- Razonamiento STEM, código y lógica reforzados en la etapa 2 del preentrenamiento.
- Comprensión de contexto largo hasta 32.768 tokens.
- Cobertura multilingüe declarada de 119 idiomas.
- Base para *fine-tuning* supervisado y para posteriores etapas de alineamiento (SFT, DPO, RLHF).
- No incluye *tool calling*, *function calling*, modo *thinking*, visión ni audio de forma nativa; esas capacidades pertenecen a las variantes instructivas de Qwen3.
- No soporta agentes multi-paso de forma nativa sin ajuste adicional.

## Casos de uso

- *Fine-tuning* supervisado para dominio específico: al ser un checkpoint base de 4B con licencia Apache 2.0, sirve como punto de partida para SFT sobre corpus propios (legal, médico, industrial) sin restricciones comerciales.
- Generación de código asistida tras ajuste: la etapa 2 de preentrenamiento refuerza código; un SFT sobre pares instrucción-respuesta de programación produce un asistente de autocompletado o revisión de código desplegable en una sola GPU de 24 GB.
- Modelo de referencia para destilación: su tamaño de 4B y contexto de 32k lo hacen útil como estudiante en pipelines de destilación desde modelos mayores, o como profesor para modelos de 1-2B.
- Procesamiento de documentos largos: la ventana de 32.768 tokens permite resumir, clasificar o extraer entidades de contratos, informes o artículos que no caben en modelos de 4k-8k, tras un ajuste ligero.
- Investigación en *scaling* y currículos de entrenamiento: reproduce la receta de tres etapas de Qwen3 a escala 4B, útil para estudiar dinámicas de entrenamiento y *scaling laws*.
- Generación de datos sintéticos: puede emplearse para producir texto de dominio tras ajuste, alimentando pipelines de aumento de datos para otros modelos.
- Evaluación comparativa de tokenizadores multilingües: con 119 idiomas declarados, sirve para medir calidad de tokenización y perplejidad en lenguas de bajos recursos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card remite al blog de Qwen3 y al informe técnico (arXiv:2505.09388) para las evaluaciones detalladas, pero no incluye cifras concretas para esta variante en el material proporcionado.

## Requisitos de hardware

- VRAM estimada en FP16/BF16: aproximadamente 8 GB solo para pesos (4.0B × 2 bytes), más caché KV y activaciones; en la práctica, 10-12 GB para contexto moderado.
- VRAM estimada en cuantización de 8 bits: ~4-5 GB de pesos; en 4 bits: ~2.5-3 GB de pesos.
- GPU recomendadas para FP16: A100 40/80 GB, H100, L40S, RTX A6000; para una sola GPU de consumo, RTX 4090 (24 GB) o RTX 3090 (24 GB) con margen amplio.
- Cabe en GPU de consumo: sí, en RTX 4090, 3090, 4080 (16 GB) e incluso en 4070 Ti (12 GB) con cuantización de 8 bits o inferior.
- Opciones de despliegue: transformers (>= 4.51.0), vLLM, TGI, llama.cpp y Ollama (previa conversión a GGUF), entre otras.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Etapa | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3-4B-Base (esta ficha) | 4.0B | 32.768 | Apache 2.0 | Base | Hugging Face |
| Qwen2.5-3B | 3.1B | 32.768 | Apache 2.0 | Base | Hugging Face |
| Llama 3.2-3B | 3.2B | 128.000 | Llama 3.2 Community | Base/Instruct | Hugging Face |
| Gemma 2-2B | 2.6B | 8.192 | Gemma Terms | Base/Instruct | Hugging Face |

La comparación con Qwen2.5-3B es la más directa por linaje: Qwen3 amplía el corpus a 36 billones de tokens y 119 idiomas frente a Qwen2.5, y añade *qk layernorm*. Frente a Llama 3.2-3B, este último ofrece contexto de 128k pero con licencia comunitaria restringida; Qwen3-4B-Base mantiene Apache 2.0. Gemma 2-2B es más pequeño y con contexto de 8k. Los datos de rendimiento comparativo no están disponibles en la información proporcionada.

## Limitaciones y advertencias

- Al ser un modelo *base*, no está alineado: puede generar contenido sesgado, tóxico o factualmente incorrecto y no sigue instrucciones de forma fiable sin SFT previo.
- Riesgo de alucinación inherente a los modelos de lenguaje; no hay mitigación por RLHF en este checkpoint.
- La lista concreta de los 119 idiomas no está disponible; el rendimiento por idioma puede variar mucho y no está cuantificado.
- Contexto máximo de 32.768 tokens; secuencias más largas requieren truncado o técnicas de extensión no documentadas aquí.
- Licencia Apache 2.0 permite uso comercial, pero el usuario debe verificar el cumplimiento de las licencias de los datos de *fine-tuning* que añada.
- El repositorio es una réplica de terceros (ArchiveStudio) con 0 descargas y 0 *likes*; para producción conviene usar el checkpoint oficial del equipo Qwen y verificar la integridad de los pesos.
- Requiere `transformers>=4.51.0`; versiones anteriores fallan con `KeyError: 'qwen3'`.
- No incluye *tool calling*, agentes ni modo *thinking*; esas capacidades no deben asumirse en esta variante.

## Enlaces

- Hugging Face (esta réplica): https://huggingface.co/ArchiveStudio/Qwen3-4B-Base
- Blog oficial de Qwen3: https://qwenlm.github.io/blog/qwen3/
- Repositorio GitHub de Qwen3: https://github.com/QwenLM/Qwen3
- Documentación de Qwen: https://qwen.readthedocs.io/en/latest/
- Informe técnico (arXiv): https://arxiv.org/abs/2505.09388
