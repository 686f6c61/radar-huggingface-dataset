# kizzlah/granite-4.2-3b

## Resumen

Granite-4.2-3B es un modelo de lenguaje de razonamiento compacto desarrollado por el equipo Granite de IBM, publicado el 25 de agosto de 2026 como parte de la familia Granite 4.2. Se trata de un transformer denso decoder-only de 3.000 millones de parámetros, post-entrenado sobre el modelo base Granite-4.1-3B-Base, que incorpora capacidades nativas de razonamiento mediante cadenas de pensamiento (chain-of-thought) integradas en su arquitectura.

El modelo resuelve el problema de obtener capacidades de razonamiento avanzado en un formato lo suficientemente pequeño para entornos con recursos limitados, manteniendo una ventana de contexto nativa de 128K tokens extensible hasta 512K. Su relevancia actual radica en que combina razonamiento paso a paso, modos de pensamiento flexibles (completo, no-pensamiento y esfuerzo bajo) y tool calling aumentado por razonamiento, todo ello bajo licencia Apache 2.0, lo que permite uso comercial y de investigación sin restricciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Decoder-only Dense Transformer (GraniteForCausalLM) |
| Parametros totales | 3.659.737.600 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 128K nativo, extensible a 512K |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Ingles, aleman, espanol, frances, japones, portugues, arabe, checo, italiano, coreano, neerlandes, chino |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Granite-4.2-3B emplea una arquitectura de transformer denso decoder-only con atención por grupos de consultas (Grouped Query Attention, GQA) compuesta por 40 cabezas de atención y 8 cabezas KV. Utiliza embeddings rotatorios posicionales (RoPE) con theta de 10.000.000, capas feed-forward con activación SwiGLU y tamaño oculto de 8192, normalización RMSNorm con epsilon de 1e-5 y embeddings de entrada y salida separados (no atados). La precisión de trabajo es bfloat16.

El modelo es post-entrenado sobre el base Granite-4.1-3B-Base, que ya incorporaba el pre-entrenamiento de la generación 4.1. La fase de post-entrenamiento de la generación 4.2 añade las capacidades de razonamiento nativo, permitiendo al modelo generar cadenas de pensamiento internas antes de producir la respuesta final. No se dispone de información detallada sobre el número de tokens de entrenamiento ni sobre la composición exacta del dataset de post-entrenamiento, ni sobre el uso de técnicas como RLHF o DPO.

## Capacidades

- Razonamiento nativo con cadena de pensamiento integrada: el modelo genera un bloque interno de razonamiento delimitado por las etiquetas `thinking... response` antes de emitir la respuesta final.
- Modos de pensamiento flexibles: permite alternar entre modo completo (por defecto), modo sin pensamiento y modo de esfuerzo bajo, ajustando la profundidad del razonamiento frente a la latencia por consulta.
- Tool calling aumentado por razonamiento: el modelo razona sobre qué herramientas invocar y por qué, produciendo llamadas a funciones más precisas en flujos agénticos.
- Generación de código y resolución de problemas matemáticos complejos.
- Soporte multilingüe en 12 idiomas probados: ingles, aleman, espanol, frances, japones, portugues, arabe, checo, italiano, coreano, neerlandes y chino.
- Manejo de documentos largos y conversaciones multi-turno gracias a su ventana de contexto de 128K tokens.
- Capacidad de extensión de contexto hasta 512K para flujos de trabajo agénticos complejos.

## Casos de uso

- Atención al cliente automatizada: el modelo puede gestionar conversaciones multi-turno con contexto prolongado gracias a su ventana de 128K tokens, manteniendo el historial completo de la interacción y razonando sobre la mejor respuesta antes de emitirla.
- Generación de código en producción: con soporte de tool calling y razonamiento paso a paso, puede integrarse en pipelines de CI/CD para generar, revisar y depurar código, explicando la lógica detrás de cada cambio.
- Agentes autónomos con planificación multi-paso: su capacidad de razonamiento aumentado permite a un agente decidir qué herramientas invocar, en qué orden y por qué, mejorando la fiabilidad en tareas como automatización de procesos o gestión de APIs.
- Análisis de documentos extensos: la ventana de contexto de 128K permite procesar informes, contratos o expedientes completos, resumiendo, extrayendo información relevante o respondiendo preguntas sobre el contenido íntegro.
- Asistente de programación en entornos con recursos limitados: al ser un modelo de 3B parámetros, puede desplegarse en GPUs de consumo o incluso en CPU con cuantización, ofreciendo capacidades de razonamiento en entornos edge.
- Tutoría y educación técnica: su modo de razonamiento explícito permite mostrar el proceso de resolución de problemas matemáticos o de lógica, útil para generar explicaciones didácticas paso a paso.
- Automatización de tareas ofimáticas multilingües: redacción, traducción y resumen de documentos en los 12 idiomas soportados, con razonamiento sobre el contexto cultural y lingüístico.

## Benchmarks y rendimiento

| Benchmark | Resultado |
|---|---|
| AIME25 | 78,33 |

No se han publicado resultados de benchmarks adicionales en la informacion disponible. El dato de AIME25 proviene de la ficha del modelo en AI/TLDR y no se especifica la metodologia de evaluacion ni la comparacion con otros modelos en la misma fuente.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 7,3 GB, basado en el tamaño del repositorio de pesos.
- VRAM estimada con cuantizacion de 4 bits: aproximadamente 2-3 GB (estimacion orientativa, no confirmada por el fabricante).
- GPU recomendadas: RTX 4090, RTX 3090, A100, H100 o cualquier GPU con al menos 8 GB de VRAM para inferencia en bf16.
- Cabe en GPUs de consumo como la RTX 4060 Ti de 16 GB o superiores sin necesidad de cuantizacion.
- Opciones de despliegue: vLLM, llama.cpp, Ollama, TGI (Text Generation Inference) y cualquier framework compatible con transformers.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Razonamiento | Licencia | AIME25 |
|---|---|---|---|---|---|
| Granite-4.2-3B | 3B | 128K | Nativo (CoT) | Apache 2.0 | 78,33 |
| Qwen3-4B | 4B | 32K | Nativo (CoT) | Apache 2.0 | No disponible |
| Llama-3.2-3B | 3B | 128K | No nativo | Llama 3.2 | No disponible |

La comparativa se basa en datos publicos de cada modelo. Granite-4.2-3B destaca por combinar razonamiento nativo con una ventana de contexto amplia y licencia permisiva, aunque Qwen3-4B ofrece un tamano ligeramente superior y Llama-3.2-3B no incorpora razonamiento nativo.

## Limitaciones y advertencias

- Solo se han probado oficialmente 12 idiomas; otros idiomas pueden funcionar pero no estan garantizados.
- El modo de razonamiento completo aumenta la latencia por consulta, lo que puede ser un problema en aplicaciones en tiempo real si no se usa el modo de esfuerzo bajo.
- Riesgo de alucinacion en tareas de razonamiento complejo, especialmente en dominios especializados no cubiertos por los datos de entrenamiento.
- No se dispone de informacion sobre sesgos especificos del modelo, aunque al ser un modelo pequeno puede presentar sesgos presentes en sus datos de entrenamiento base.
- La extension de contexto hasta 512K puede degradar la calidad de las respuestas en los extremos de la ventana, como es habitual en modelos con extension post-hoc.
- El repositorio de HuggingFace del autor kizzlah no es el repositorio oficial de IBM; se recomienda verificar la procedencia de los pesos antes de su uso en produccion.

## Enlaces

- Repositorio de HuggingFace: https://huggingface.co/kizzlah/granite-4.2-3b
- Coleccion oficial Granite 4.2: https://huggingface.co/collections/ibm-granite/granite-42-language-models
- Blog tecnico de Granite 4.2: https://huggingface.co/blog/ibm-granite/granite-4-2
- Repositorio de GitHub: https://github.com/ibm-granite/granite-4.2-language-models
- Documentacion de IBM Granite: https://www.ibm.com/granite/docs/models/granite4-2
- Pagina principal de IBM Granite: https://www.ibm.com/granite
- Ficha en AI/TLDR: https://ai-tldr.dev/models/granite-4-2-3b/
