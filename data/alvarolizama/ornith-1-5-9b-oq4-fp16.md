# alvarolizama/Ornith-1.5-9B-oQ4-fp16

## Resumen

Ornith-1.5 es una familia de modelos de código abierto desarrollada por ornith-ai, diseñada para tareas de razonamiento, agente y generación de código. La familia incluye tres escalas: 397B MoE, 35B MoE y 9B denso. Este repositorio concreto contiene una cuantización mixta de precisión oQ4-fp16 del modelo denso de 9B, realizada con la librería oMLX (v0.6.0.dev1) y dirigida a dispositivos Apple Silicon.

La cuantización reduce el modelo original de 9B parámetros a un formato MLX safetensors de 4 bits con grupo de tamaño 64, lo que permite ejecutar el modelo en hardware Apple con requisitos de memoria reducidos. El repositorio pesa 7.0 GB y el conteo de tensores cuantizados es de aproximadamente 1.876 millones de parámetros, aunque el modelo original declara 9B. Su relevancia radica en ofrecer una alternativa de código abierto para flujos de trabajo de codificación agentic en entornos locales, especialmente en ecosistema Apple Silicon.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (tipo qwen3_5) |
| Parametros totales | 9B (modelo original); 1.876.724.560 tensores cuantizados en safetensors |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | oQ4-fp16 (4 bits, grupo 64, MLX) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | MLX safetensors (cuantizados) |

## Arquitectura y entrenamiento

El modelo base Ornith-1.5-9B es un transformer denso basado en la arquitectura qwen3_5, orientado a tareas de razonamiento, agente y codificación. Según la documentación de ornith.ai, el entrenamiento sigue un enfoque de "auto-andamiaje" (self-scaffolding) y "auto-mejora" (self-improvement), que busca que el modelo aprenda a estructurar sus propios procesos de razonamiento y a iterar sobre sus resultados sin intervención humana explícita. No se dispone de detalles sobre el volumen de datos de entrenamiento, la composición del dataset o el uso de RLHF/DPO en la información proporcionada.

La cuantización de este repositorio utiliza oQ (oMLX v0.6.0.dev1), una técnica de cuantización de precisión mixta que combina pesos de 4 bits con algunas capas en fp16 para preservar la calidad en partes críticas del modelo. El grupo de cuantización es de 64, lo que ofrece un equilibrio entre compresión y fidelidad. El formato de salida es exclusivo de MLX, por lo que solo es ejecutable con la librería MLX de Apple.

## Capacidades

- Generación de texto general y razonamiento multi-step.
- Codificación y asistencia en tareas de programación, incluyendo generación de código, depuración y refactorización.
- Ejecución de tareas agénticas: el modelo puede estructurar planes de acción y ejecutarlos de forma autónoma en entornos de desarrollo.
- Capacidad de auto-mejora mediante andamiaje de razonamiento, según la documentación oficial de ornith.ai.
- Soporte de tool calling: no confirmado en la información disponible, aunque la orientación agéntica del modelo sugiere que puede integrarse con herramientas externas.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Asistente de codificación en entornos locales: el modelo puede integrarse en editores de código (VS Code, Neovim) mediante servidores locales de inferencia MLX, proporcionando sugerencias de código y completado de funciones sin necesidad de conexión a servicios externos.
- Generación de código en pipelines de CI/CD: gracias a su enfoque agéntico, puede autogenerar pruebas unitarias, corregir errores de compilación o escribir documentación técnica en repositorios, integrado con herramientas como GitHub Actions.
- Desarrollo de agentes autónomos de depuración: el modelo puede analizar logs de error, proponer parches y ejecutar pruebas iterativamente, lo que lo hace adecuado para sistemas de mantenimiento de código automatizado.
- Razonamiento y análisis de requisitos técnicos: puede transformar descripciones de alto nivel en especificaciones de implementación detalladas, útil en fases de diseño de software.
- Asistente de documentación técnica: capaz de generar explicaciones de código, comentarios en línea y documentación de API a partir del análisis del propio código fuente.
- Despliegue en equipos Apple Silicon: al estar cuantizado en MLX, puede ejecutarse en Macs con M1/M2/M3/M4 con 8 GB o más de RAM unificado, lo que permite uso local en equipos de desarrollo sin GPU dedicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio pesa 7.0 GB; con el formato MLX cuantizado a 4 bits, se recomienda al menos 8 GB de memoria unificada en Apple Silicon para ejecutar el modelo completo con contexto razonable.
- GPU recomendadas: Apple Silicon con al menos 16 GB de memoria unificada (M1 Pro, M2 Pro, M3 Pro, etc.) para inferencia fluida. En GPUs NVIDIA no se puede ejecutar directamente el formato MLX.
- En consumer GPU: no aplica, ya que el formato es exclusivo de MLX (Apple).
- Opciones de despliegue: la librería MLX de Apple es la única vía para ejecutar este formato. Se puede usar con el servidor MLX (mlx-lm) o integrar en aplicaciones Python con `mlx_lm`.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone de datos suficientes para realizar una comparativa rigurosa con alternativas. El modelo base Ornith-1.5-9B compite con otros modelos densos de 9B de código abierto (por ejemplo, Qwen2.5-Coder-7B, Llama-3.1-8B o DeepSeek-Coder-7B), pero no se han encontrado benchmarks comparativos en la información proporcionada. La cuantización MLX limita la comparación directa con otros formatos (GGUF, safetensors) en términos de despliegue.

## Limitaciones y advertencias

- La licencia del modelo base no se ha publicado en el repositorio; antes de usar comercialmente el modelo, es necesario consultar la licencia del modelo original Ornith-1.5-9B en la colección de ornith-ai.
- El formato MLX solo es ejecutable en Apple Silicon; no se puede usar en GPUs NVIDIA o AMD sin convertir los pesos a otro formato (por ejemplo, GGUF o safetensors estándar).
- El conteo de parámetros de safetensors (1.876M) corresponde al modelo cuantizado, no al modelo original de 9B; esto puede inducir a error si se interpreta como el tamaño real del modelo.
- No se han publicado resultados de benchmarks, por lo que el rendimiento real en tareas de código y razonamiento no está verificado.
- La información sobre contexto, idiomas y licencia está ausente; se recomienda consultar la documentación oficial de ornith.ai antes de adoptar el modelo en producción.
- La cuantización de 4 bits puede provocar pérdida de calidad en tareas complejas de razonamiento o generación de código largo, aunque el grupo de 64 y la parte fp16 mitigan parcialmente este efecto.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/alvarolizama/Ornith-1.5-9B-oQ4-fp16
- Colección Ornith-1.5 en HuggingFace: https://huggingface.co/collections/ornith-ai/ornith-15
- Blog de ornith.ai sobre Ornith-1.5: https://ornith.ai/ornith_1_5.html
- Guía de Ornith AI (modelos, VRAM, benchmarks, uso local): https://ornith.online/
- Repositorio oMLX (librería de cuantización): https://github.com/jundot/omlx
- Repositorio HuggingFace de la versión 1.0: https://huggingface.co/alvarolizama/Ornith-1.0-9B-oQ4-fp16
- Página de Ollama para Ornith-9b: https://ollama.com/maxwell1500/ornith-9b
