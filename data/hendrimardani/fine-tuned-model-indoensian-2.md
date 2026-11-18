# hendrimardani/fine-tuned-model-indoensian-2

## Resumen

fine-tuned-model-indonesian-2 es un ajuste fino supervisado (SFT) del modelo Llama-3.1-8B-Instruct, desarrollado por el usuario independiente hendrimardani. Su objetivo es especializar el modelo base en conversación y análisis de documentos en indonesio, con un foco explícito en el dominio legal: referencias a normativa (PP/UU), artículos reglamentarios y políticas organizativas. Se distribuye con licencia Apache 2.0 y está pensado para integrarse en pipelines de generación aumentada por recuperación (RAG).

El modelo conserva la arquitectura transformer decoder-only de Llama 3.1 con 8.030.261.248 parámetros (aproximadamente 8B), entrenado originalmente con una ventana de contexto de 128.000 tokens. Sin embargo, el autor declara una longitud máxima de secuencia de 2.048 tokens para este ajuste, lo que limita de facto el contexto útil en producción. El ajuste se realizó con Unsloth y TRL sobre la variante cuantizada en 4 bits NF4 de Unsloth, y los pesos publicados están en safetensors.

La relevancia del modelo es acotada pero específica: cubre un nicho poco atendido, el procesamiento de texto legal en indonesio, con un coste de despliegue bajo gracias a la cuantización de 4 bits. No obstante, la documentación es escasa, no hay benchmarks publicados y la model card contiene inconsistencias (el campo `language` de Hugging Face lista solo `en` mientras la card declara `id` y `en`), lo que exige cautela antes de usarlo en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.1) |
| Parametros totales | 8.030.261.248 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2.048 tokens declarados por el autor; el modelo base soporta 128.000 tokens |
| Tipos de cuantizacion | NF4 (4 bits) en el modelo base de partida; pesos publicados en safetensors (precisión original no especificada) |
| Idiomas soportados | Indonesio (`id`) y inglés (`en`) según la model card; el campo `language` del repo lista solo `en` |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `unsloth/Llama-3.1-8B-unsloth-bnb-4bit`, una versión del Llama-3.1-8B-Instruct cuantizada en 4 bits NF4 y optimizada para el framework Unsloth. Sobre esa base se aplicó un ajuste fino supervisado (SFT v2) con PEFT/LoRA, usando la librería TRL de Hugging Face. La model card no detalla el número de tokens de entrenamiento, la composición del dataset, ni si hubo etapas de alineación adicionales como RLHF o DPO.

Las mejoras declaradas por el autor se centran en tres frentes: reducción de erratas, repeticiones de n-gramas y salidas corruptas en indonesio formal; mejor manejo de estructuras oracionales complejas; y mayor fidelidad al citar referencias normativas en aplicaciones RAG legales. No se documenta ninguna innovación arquitectónica propia: el modelo es un ajuste de pesos sobre una arquitectura estándar, y la única particularidad técnica reseñable es la cadena de cuantización en 4 bits empleada para reducir el consumo de VRAM.

## Capacidades

- Generación de texto conversacional en indonesio formal, con alineación orientada a asistencia profesional.
- Análisis y resumen de documentos legales: referencias a PP (Peraturan Pemerintah), UU (Undang-Undang) y artículos reglamentarios.
- Respuesta a preguntas sobre procedimientos administrativos y normativa laboral indonesia.
- Integración en pipelines RAG mediante LangChain (`HuggingFacePipeline`) y en `transformers` con `apply_chat_template`.
- Soporte de formato conversacional multi-turno con roles `system`, `user` y `assistant`.
- Generación en inglés, aunque el entrenamiento está orientado al indonesio.
- Compatibilidad con text-generation-inference y endpoints compatibles según los tags del repo.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, visión, audio ni modo de razonamiento explícito.

## Casos de uso

- Asistencia legal en indonesio: el modelo responde consultas sobre procedimientos normativos (por ejemplo, registro de contratos PKWT según el PP n.º 35 de 2021) citando artículos y plazos concretos, lo que lo hace útil como primera capa de orientación en despachos o departamentos jurídicos.
- RAG sobre corpus normativo: se integra con LangChain para recuperar fragmentos de legislación y generar respuestas fundamentadas en el contexto inyectado; la temperatura recomendada de 0,3 favorece respuestas ancladas en los hechos recuperados.
- Análisis de políticas internas: permite resumir y extraer obligaciones de documentos corporativos en indonesio, con menor riesgo de erratas que la versión anterior según el autor.
- Atención al cliente en indonesio: gestiona conversaciones multi-turno con un presupuesto de contexto de 2.048 tokens, suficiente para diálogos de soporte de longitud moderada.
- Generación de borradores administrativos: redacta explicaciones estructuradas con listas numeradas de requisitos y plazos, un formato que el modelo reproduce de forma consistente según el ejemplo de la model card.
- Despliegue en hardware modesto: gracias a la cuantización de 4 bits, puede ejecutarse en GPUs de consumo para prototipos y demos internas de asistentes legales.
- Traducción asistida indonesio-inglés en contextos documentales, aunque sin garantías de calidad equivalentes a modelos específicos de traducción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada en 4 bits NF4: en torno a 5-6 GB para los pesos, más overhead de activaciones y caché KV; con contexto de 2.048 tokens el consumo total se mantiene por debajo de los 8-10 GB en la mayoría de configuraciones.
- VRAM estimada en bfloat16: aproximadamente 16 GB solo para pesos, más activaciones; requiere GPUs de 24 GB o superiores para contexto completo.
- GPUs recomendadas: A100 40/80 GB o H100 para despliegue en bfloat16 con concurrencia; RTX 4090 (24 GB) para bfloat16 en una sola instancia; RTX 3090, RTX 4080 o RTX 4060 Ti 16 GB para cuantización 4 bits.
- Cabe en GPU de consumo: sí, en 4 bits en tarjetas de 8 GB o más; en bfloat16 requiere 24 GB.
- Opciones de despliegue: `transformers` con `load_in_4bit=True`, text-generation-inference (tag del repo), vLLM (previa conversión de pesos), llama.cpp/Ollama (requiere generar GGUF, no publicado en el repo).
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| fine-tuned-model-indonesian-2 | 8,03B | 2.048 tokens (declarado) | id, en | Apache 2.0 | Ajuste legal en indonesio sobre Llama-3.1-8B; sin benchmarks |
| Meta Llama-3.1-8B-Instruct | 8,03B | 128.000 tokens | multilingüe (8 idiomas oficiales) | Llama 3.1 Community License | Modelo base; mejor contexto y ecosistema, pero sin especialización legal en indonesio |
| Meta Llama-3-8B-Instruct | 8,03B | 8.192 tokens | multilingüe | Llama 3 Community License | Generación anterior; contexto menor que 3.1 |
| Mistral-7B-Instruct-v0.3 | 7,25B | 32.768 tokens | en, fr, de, es, it | Apache 2.0 | Alternativa de tamaño similar con licencia permisiva, sin foco en indonesio |

## Limitaciones y advertencias

- No es asesoramiento legal: el propio autor advierte que las salidas no constituyen consejo jurídico formal y deben verificarse contra fuentes normativas primarias.
- Riesgo de alucinación en citas normativas: puede generar referencias a artículos o reglamentos inexistentes o desactualizados, especialmente fuera del dominio de entrenamiento.
- Contexto efectivo reducido: los 2.048 tokens declarados limitan los pipelines RAG a pocos fragmentos recuperados por consulta, muy por debajo de los 128.000 tokens del modelo base.
- Inconsistencia en metadatos: el campo `language` del repo lista solo `en` mientras la model card declara `id` y `en`; conviene validar el comportamiento real en indonesio antes de desplegar.
- Documentación insuficiente: no se publican detalles del dataset, número de tokens de entrenamiento, métricas de evaluación ni procedimiento de alineación.
- Sesgos no evaluados: al ser un ajuste sobre Llama 3.1 con un corpus no documentado, los sesgos del modelo base persisten y no han sido medidos en el dominio legal indonesio.
- Licencia: Apache 2.0 permite uso comercial, pero el modelo base Llama 3.1 está sujeto a la Llama 3.1 Community License; conviene revisar la compatibilidad de ambas licencias antes de un despliegue comercial.
- Sin soporte documentado de tool calling ni agentes: no es adecuado para flujos que requieran invocación de funciones o razonamiento multi-paso con herramientas.
- Repositorio de 60,9 GB: el tamaño incluye múltiples artefactos (checkpoints, logs de TensorBoard), lo que complica la descarga y el versionado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hendrimardani/fine-tuned-model-indonesian-2
- Perfil del autor: https://huggingface.co/hendrimardani
- Modelo base (Unsloth, 4 bits): https://huggingface.co/unsloth/Llama-3.1-8B-unsloth-bnb-4bit
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
- Librería TRL de Hugging Face: https://github.com/huggingface/trl
- Licencia Apache 2.0: https://opensource.org/licenses/Apache-2.0
