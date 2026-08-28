# Oscilla/Qwen3-1.7B-mlx-8Bit

## Resumen

Oscilla/Qwen3-1.7B-mlx-8Bit es una conversión al formato MLX del modelo Qwen3-1.7B, desarrollada por el usuario Oscilla. El modelo base, Qwen/Qwen3-1.7B, es la versión densa más pequeña de la familia Qwen3, diseñada por Alibaba para ofrecer un equilibrio entre rendimiento y eficiencia en tareas de razonamiento, generación de texto, código y capacidades de agente. Esta conversión aplica una cuantización de 8 bits sobre los pesos originales, lo que reduce el tamaño del modelo a aproximadamente 1,8 GB y permite su ejecución en dispositivos Apple Silicon mediante la librería mlx-lm.

La relevancia de esta ficha radica en que ofrece una opción ligera y de código abierto (licencia Apache 2.0) para desarrolladores que necesitan desplegar un modelo de lenguaje conversacional en entornos con recursos limitados, como portátiles Mac o GPUs de gama baja, sin renunciar a las capacidades del modelo Qwen3 original. El modelo mantiene la ventana de contexto de 40 000 tokens del modelo base y conserva el soporte para tool calling y razonamiento, lo que lo hace adecuado para prototipos y aplicaciones de producción ligera.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso con atención de causalidad (arquitectura Qwen3) |
| Parametros totales | 484 000 768 (según archivo safetensors; el modelo base declara 1,7 mil millones) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 40 000 tokens (según LLM Explorer para el modelo base) |
| Tipos de cuantizacion | 8 bits (MLX) |
| Idiomas soportados | No disponible (el modelo base Qwen3 soporta multilingüe, pero no se especifica en esta conversión) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (formato MLX) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo Qwen3-1.7B, un transformer denso con atención de causalidad, similar a la generación anterior Qwen2.5 pero con mejoras en razonamiento y capacidades de agente. El modelo base fue entrenado por Alibaba con un corpus extenso y diverso, que incluye datos multilingües, código y matemáticas, seguido de fases de ajuste fino supervisado (SFT) y optimización con preferencias humanas (RLHF/DPO). No se dispone de detalles específicos sobre el número de tokens de entrenamiento ni la composición exacta del dataset para esta conversión.

La conversión a MLX se realizó con la librería mlx-lm versión 0.31.2, que transforma los pesos originales a un formato optimizado para el framework MLX de Apple, aplicando una cuantización de 8 bits. Esta cuantización reduce el tamaño del modelo y acelera la inferencia en hardware Apple Silicon, manteniendo una degradación mínima de calidad. No se han documentado innovaciones técnicas adicionales más allá de la conversión estándar.

## Capacidades

- Generación de texto conversacional y de completado de prompts, con soporte para chat multi-turno mediante plantilla de chat.
- Razonamiento y resolución de problemas lógicos y matemáticos, heredados del modelo base Qwen3.
- Generación de código en múltiples lenguajes de programación, con capacidad de seguir instrucciones de programación.
- Soporte para tool calling y function calling, lo que permite integrar el modelo en pipelines de agentes que necesitan invocar herramientas externas.
- Capacidades multilingües (el modelo base Qwen3 soporta más de 100 idiomas, aunque no se confirma en esta conversión).
- Modo de razonamiento híbrido: el modelo base Qwen3 ofrece modos de pensamiento (thinking) y no pensamiento, aunque no se garantiza que esta conversión mantenga esa funcionalidad completa.
- Compatible con el ecosistema MLX, permitiendo ejecución eficiente en Macs con Apple Silicon.

## Casos de uso

- Asistente de chat en aplicaciones móviles o de escritorio: el modelo puede gestionar conversaciones multi-turno con contexto largo (hasta 40 000 tokens) gracias a su ventana amplia, ideal para asistentes personales que recuerdan interacciones previas.
- Generación de código en entornos de desarrollo integrado (IDE): soporta tool calling, por lo que puede integrarse en plugins que autocompletan código, explican fragmentos o generan tests unitarios.
- Automatización de atención al cliente: con su capacidad de razonamiento y su tamaño compacto, puede desplegarse en servidores de bajo coste para responder consultas frecuentes, derivar tickets complejos y mantener el contexto de la conversación.
- Prototipado rápido de agentes conversacionales: al ser ligero y ejecutable en hardware local (Mac o GPU de 2 GB), permite iterar sobre prompts y flujos de agente sin depender de APIs externas.
- Análisis de documentos extensos: con 40 000 tokens de contexto, puede resumir informes, extraer entidades o responder preguntas sobre documentos largos en una sola pasada.
- Educación y tutoría: el modelo puede actuar como tutor de programación o matemáticas, explicando conceptos paso a paso y generando ejemplos personalizados.
- Despliegue en dispositivos edge: gracias a su cuantización de 8 bits y su tamaño reducido, es viable ejecutarlo en dispositivos con limitaciones de memoria, como Raspberry Pi o sistemas embebidos con aceleración MLX.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para esta conversión (Oscilla/Qwen3-1.7B-mlx-8Bit) en la información disponible. El modelo base Qwen3-1.7B ha sido evaluado en tareas como MMLU, HumanEval y GSM8K, pero no se proporcionan cifras concretas en las fuentes consultadas. Se recomienda consultar la documentación oficial de Qwen para obtener datos comparativos del modelo original.

## Requisitos de hardware

- VRAM estimada: aproximadamente 2 GB para inferencia en 8 bits (basado en el tamaño del repo de 1,8 GB).
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM (por ejemplo, NVIDIA GTX 1650, RTX 3050, o GPUs integradas de Apple Silicon). En Macs con chip M1 o superior, la ejecución es fluida gracias a MLX.
- Cabe en GPUs de consumo general (gama baja y media) y en Macs con Apple Silicon.
- Opciones de despliegue: principalmente mediante mlx-lm (pip install mlx-lm). También puede convertirse a otros formatos (GGUF) para usarlo con llama.cpp u Ollama, aunque no se incluye en este repositorio.
- Latencia y throughput: no disponibles. Se estima una latencia baja en hardware Apple Silicon, pero sin datos concretos.

## Comparativa con modelos similares

La siguiente tabla compara esta conversión con otros modelos de tamaño similar (aproximadamente 1,5-2 mil millones de parámetros) basándose en datos públicos del modelo base.

| Modelo | Parámetros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| Oscilla/Qwen3-1.7B-mlx-8Bit | 484M (safetensors) / 1,7B (base) | 40 000 | Apache 2.0 | MLX 8-bit | Hugging Face |
| Qwen/Qwen3-1.7B-MLX-8bit | 1,7B | 40 000 | Apache 2.0 | MLX 8-bit | Hugging Face / ModelScope |
| Qwen2.5-1.5B | 1,5B | 32 000 | Apache 2.0 | Varios | Hugging Face |
| Llama-3.2-1B | 1,0B | 128 000 | Llama 3.2 | Varios | Hugging Face |

Nota: los datos de parámetros de la conversión de Oscilla difieren del modelo base; se recomienda verificar el número real de parámetros en el repositorio. La comparativa se basa en especificaciones del modelo base para los otros casos.

## Limitaciones y advertencias

- El número de parámetros reportado en safetensors (484 000 768) no coincide con los 1,7 mil millones declarados por el modelo base; esto puede deberse a la cuantización o a un error en la conversión. Se recomienda verificar la integridad del modelo antes de usarlo en producción.
- No se dispone de información sobre sesgos específicos, pero al derivar de Qwen3, puede heredar sesgos presentes en el corpus de entrenamiento original.
- Riesgo de alucinación: como todo modelo de lenguaje, puede generar información falsa o inventada, especialmente en dominios especializados.
- La cuantización de 8 bits puede degradar ligeramente la precisión en tareas complejas de razonamiento o matemáticas en comparación con el modelo original en punto flotante.
- La licencia Apache 2.0 permite uso comercial, pero se debe respetar la atribución y las condiciones de la licencia del modelo base.
- No se garantiza el soporte completo de todas las capacidades del modelo base (por ejemplo, modo thinking) en esta conversión; es necesario probar.
- El formato MLX limita el despliegue a entornos que soporten MLX (principalmente Apple Silicon), aunque se puede convertir a otros formatos si es necesario.

## Enlaces

- Repositorio Hugging Face de Oscilla/Qwen3-1.7B-mlx-8Bit: https://huggingface.co/Oscilla/Qwen3-1.7B-mlx-8Bit
- Modelo base Qwen/Qwen3-1.7B: https://huggingface.co/Qwen/Qwen3-1.7B
- Conversión oficial Qwen/Qwen3-1.7B-MLX-8bit: https://huggingface.co/Qwen/Qwen3-1.7B-MLX-8bit
- Página en ModelScope: https://www.modelscope.cn/models/Qwen/Qwen3-1.7B-MLX-8bit
- Ficha en LLM Explorer: https://llm-explorer.com/model/Qwen%2FQwen3-1.7B-MLX-8bit,EhAtO0wh63aLNT5m2j3Ft
- Página de Qwen3 en Ollama: https://ollama.com/library/qwen3:1.7b
