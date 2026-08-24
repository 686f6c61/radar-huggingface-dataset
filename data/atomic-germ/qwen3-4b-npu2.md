# Atomic-Germ/Qwen3-4B-NPU2

## Resumen

Qwen3-4B-NPU2 es una variante del modelo Qwen3-4B de Alibaba, publicada por el usuario Atomic-Germ, con un ajuste orientado a su ejecución en unidades de procesamiento neuronal (NPU). El modelo base, Qwen3-4B, es un modelo de lenguaje causal denso de 4.000 millones de parámetros desarrollado por el equipo Qwen, que destaca por su capacidad de alternar entre modo de pensamiento (thinking mode) y modo directo (non-thinking mode) dentro de un mismo modelo, una innovación relevante para tareas de razonamiento complejo y diálogo eficiente.

La variante NPU2 mantiene la arquitectura y las capacidades del Qwen3-4B original, con una ventana de contexto nativa de 32.768 tokens ampliable a 131.072 mediante YaRN, y soporte para más de 100 idiomas. Su relevancia radica en que permite desplegar un modelo de razonamiento con licencia Apache 2.0 en hardware de inferencia acelerada por NPU, un escenario cada vez más común en entornos de servidor y edge computing. El repositorio ocupa 9,9 GB y está registrado con la librería transformers.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer causal denso con atención GQA (32 cabezas de consulta, 8 de clave/valor) |
| Parámetros totales | 4.0B (3.6B no-embedding) |
| Parámetros activos | No aplica (modelo denso) |
| Longitud de contexto | 32.768 tokens nativa; 131.072 con YaRN |
| Tipos de cuantización | No disponible en la información del repositorio |
| Idiomas soportados | Más de 100 idiomas y dialectos (según el modelo base Qwen3-4B) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 9.9 GB, formato estándar de transformers) |

## Arquitectura y entrenamiento

El modelo base Qwen3-4B es un transformer causal de 36 capas con atención de consultas agrupadas (GQA), con 32 cabezas de consulta y 8 de clave/valor. Se entrenó en dos fases: preentrenamiento y post-entrenamiento, que incluye alineación con preferencias humanas. Su característica más innovadora es el cambio fluido entre modo de pensamiento (razonamiento extenso antes de responder) y modo directo (respuesta eficiente), activable mediante el parámetro `enable_thinking` en la plantilla de chat. La variante NPU2 de Atomic-Germ conserva estas características y está optimizada para su ejecución en NPU, aunque no se publican detalles concretos sobre el proceso de optimización o los datos adicionales de entrenamiento.

## Capacidades

- Generación de texto y diálogo multiuso con razonamiento de alta calidad en modo pensamiento.
- Razonamiento lógico, matemático y generación de código, con mejoras frente a modelos previos de la familia.
- Cambio dinámico entre modo pensamiento y modo directo dentro de un solo modelo.
- Capacidades de agente y tool calling, con integración de herramientas externas tanto en modo pensamiento como directo.
- Alineación con preferencias humanas para escritura creativa, role-playing y conversaciones multiturno.
- Soporte multilingüe para más de 100 idiomas y dialectos, con instrucción multilingüe y traducción.
- Optimización para ejecución en NPU (variante NPU2), lo que facilita despliegues en hardware de inferencia acelerada.

## Casos de uso

- **Asistentes de razonamiento en producción**: el modelo puede resolver problemas matemáticos y de lógica con razonamiento explícito en modo pensamiento, útil en plataformas educativas o de análisis técnico.
- **Generación de código en entornos CI/CD**: con soporte de tool calling y modo no-pensamiento eficiente, puede integrarse en pipelines de revisión de código o autocompletado en IDE.
- **Chatbots multilingües**: su soporte de más de 100 idiomas permite construir asistentes de atención al cliente con cobertura global.
- **Agentes autónomos con herramientas**: su capacidad de razonamiento multi-step y tool calling lo hace apto para agentes que consultan APIs, bases de datos o ejecutan acciones externas.
- **Despliegue en servidores con NPU**: la variante NPU2 está pensada para ejecución en hardware acelerado de tipo NPU, adecuada para entornos de inferencia en edge o centros de datos con restricciones de consumo.
- **Traducción y localización de contenidos**: su capacidad multilingüe y su modo directo permiten generar traducciones de manera rápida y económica en volumen.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para la variante NPU2 en la información disponible. El modelo base Qwen3-4B reporta mejoras frente a QwQ y Qwen2.5-Instruct en matemáticas, generación de código y razonamiento lógico, según la documentación oficial de Qwen, pero no se incluyen cifras concretas en la model card de este repositorio. Los resultados de búsqueda web mencionan benchmarks de Qwen 3 en NPU con FastFlowLM, pero no proporcionan métricas desglosadas para esta variante concreta.

## Requisitos de hardware

- **VRAM estimada**: para un modelo de 4B parámetros en FP16, se estiman aproximadamente 8-10 GB de VRAM; con cuantización INT8 o INT4, el uso se reduce a 4-6 GB o 2-3 GB respectivamente. No se especifican cuantizaciones en el repositorio.
- **GPU recomendadas**: una NVIDIA RTX 4090 (24 GB) o A10G/A100 son suficientes para inferencia sin cuantización. Para despliegue en NPU, requiere hardware compatible con la optimización NPU2.
- **Compatibilidad con GPU de consumo**: sí, el modelo cabe en GPUs de consumo de 16-24 GB con cuantización ligera.
- **Opciones de despliegue**: compatible con transformers, vLLM (>=0.8.5), SGLang (>=0.4.6.post1), Ollama, llama.cpp y MLX-LM según la documentación del modelo base.
- **Latencia y throughput**: no disponible en la información del repositorio.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Modo pensamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| **Qwen3-4B-NPU2** | 4.0B | 32K (131K con YaRN) | Sí | Apache 2.0 | Hugging Face |
| Qwen3-4B-Instruct | 4.0B | 32K (131K con YaRN) | Sí | Apache 2.0 | Hugging Face |
| Llama-3.2-3B-Instruct | 3.2B | 128K | No | Llama 3.2 Community | Hugging Face |
| Gemma-3-4B-It | 4.0B | 128K | No | Gemma Terms | Hugging Face |

La variante NPU2 se distingue de Qwen3-4B-Instruct por su optimización para NPU, aunque conserva el mismo rendimiento base. Frente a Llama-3.2-3B y Gemma-3-4B, ofrece modo de pensamiento y una licencia Apache 2.0 más permisiva, aunque con una ventana de contexto menor (32K frente a 128K).

## Limitaciones y advertencias

- **Falta de documentación específica**: la model card no aporta detalles sobre la optimización NPU2 ni sobre los datos de entrenamiento adicionales; la información técnica se hereda del modelo base.
- **Riesgo de alucinación**: como cualquier modelo de lenguaje, puede generar contenido plausible pero incorrecto, especialmente en modo directo sin razonamiento explícito.
- **Repeticiones**: la documentación de Qwen3 advierte de posibles repeticiones infinitas; recomienda ajustar `presence_penalty` a 1.5 en caso de aparecer.
- **Sesgos**: no se han publicado evaluaciones de sesgo para esta variante; los sesgos del modelo base son desconocidos.
- **Contexto**: la ventana nativa es de 32K tokens; para contextos más largos es necesario YaRN, lo que puede degradar ligeramente el rendimiento.
- **Uso comercial**: la licencia Apache 2.0 permite uso comercial sin restricciones, pero la variante NPU2 puede requerir hardware específico no estándar.
- **Sin métricas de producción**: no se han publicado benchmarks de latencia, throughput ni rendimiento en NPU para este modelo concreto.

## Enlaces

- [Repositorio Hugging Face: Atomic-Germ/Qwen3-4B-NPU2](https://huggingface.co/Atomic-Germ/Qwen3-4B-NPU2)
- [Modelo base: Qwen/Qwen3-4B](https://huggingface.co/Qwen/Qwen3-4B)
- [Blog oficial de Qwen3](https://qwenlm.github.io/blog/qwen3/)
- [Repositorio GitHub de Qwen3](https://github.com/QwenLM/Qwen3)
- [Documentación de Qwen](https://qwen.readthedocs.io/en/latest/)
- [Benchmarks de Qwen 3 en NPU con FastFlowLM](http://fastflowlm.com/docs/benchmarks/qwen3_results/)
