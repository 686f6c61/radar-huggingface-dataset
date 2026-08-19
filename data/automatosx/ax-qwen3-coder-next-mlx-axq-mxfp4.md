# AutomatosX/AX-Qwen3-Coder-Next-MLX-AXQ-MXFP4

## Resumen

AX-Qwen3-Coder-Next-MLX-AXQ-MXFP4 es un checkpoint cuantizado en formato MLX para Apple Silicon, desarrollado por AutomatosX a partir del modelo base Qwen/Qwen3-Coder-Next de Alibaba. Este modelo base es un transformador de mezcla de expertos (MoE) con 79,67 mil millones de parámetros lógicos y solo 3 mil millones activos por token, diseñado específicamente para agentes de codificación y entornos de desarrollo locales. La versión de AutomatosX aplica cuantización de precisión mixta AXQuant (AXQ) con clase de presupuesto MXFP4, reduciendo el peso del archivo a aproximadamente 43 GB y permitiendo su ejecución en equipos Apple Silicon con memoria unificada suficiente.

La relevancia de este checkpoint radica en que combina el alto rendimiento en tareas de programación del modelo original —que según las guías publicadas alcanza un nivel comparable a Claude Sonnet 4.5 en benchmarks de codificación— con la eficiencia de una cuantización de 4,32 BPW medida. Está pensado para desarrolladores que desean ejecutar un asistente de codificación potente localmente en un Mac, sin depender de APIs externas. El contexto máximo configurado es de 262 144 tokens, aunque el límite práctico depende de la memoria unificada disponible. No incluye capacidades de visión ni audio, y tampoco incorpora predicción multi-token (MTP).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3NextForCausalLM (mixture of experts, MoE) |
| Parametros totales | 79,67 mil millones (logicos) |
| Parametros activos | 3 mil millones (por token) |
| Longitud de contexto | 262 144 tokens (configurado; limite practico segun memoria unificada) |
| Tipos de cuantizacion | MXFP4 (AXQ), mezcla de 4-bit, 8-bit y bf16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo base Qwen3-Coder-Next emplea una arquitectura de mezcla de expertos (MoE) con 79,67 mil millones de parámetros lógicos, de los cuales se activan aproximadamente 3 mil millones por token. Esta configuración permite un equilibrio entre capacidad y eficiencia computacional, ya que solo una fracción de los expertos participa en cada paso de inferencia. El checkpoint de AutomatosX conserva esta arquitectura y aplica una cuantización de precisión mixta mediante AXQuant 1.9.0, que protege tensores críticos como embeddings y normas, manteniéndolos en mayor precisión (8-bit o bf16) mientras el grueso de los pesos se cuantiza a 4-bit. La distribución de precisión resultante es: 99,15 % de los parámetros en 4-bit, 0,45 % en 8-bit y 0,39 % en bf16, con tamaños de grupo de 32 y 64.

No se dispone de información detallada sobre el entrenamiento del modelo base en la documentación proporcionada. Se sabe que fue lanzado por el equipo Qwen de Alibaba en febrero de 2026, orientado a agentes de codificación y entornos de desarrollo locales. La cuantización se realizó sin calibración, basándose en prioris de arquitectura, y se registraron 74 125 conversiones de módulos exitosas sin fallos. No se han publicado métricas de retención de calidad frente al modelo BF16 original.

## Capacidades

- Generación de texto y razonamiento: el modelo base está optimizado para tareas de programación, incluyendo generación de código, explicación de algoritmos y resolución de problemas técnicos.
- Soporte de tool calling y function calling: aunque no se especifica explícitamente en la documentación del checkpoint, el modelo base Qwen3-Coder-Next está diseñado para agentes que interactúan con herramientas, por lo que se espera compatibilidad con llamadas a funciones.
- Capacidades de agente y razonamiento multi-paso: el modelo base está pensado para agentes de codificación autónomos que planifican y ejecutan múltiples pasos.
- Capacidades multilingües: no especificadas en la información disponible; se desconoce si el modelo base soporta idiomas además de inglés y chino.
- Sin visión ni audio: la model card indica explícitamente que no hay sidecars de visión ni audio.
- Sin predicción multi-token (MTP): el campo MTP presente es False, por lo que no se ofrece aceleración por predicción de múltiples tokens.

## Casos de uso

- Asistente de codificación local en Mac: un desarrollador puede ejecutar este modelo en un Mac con 64 GB o más de memoria unificada para obtener sugerencias de código, completado de funciones y explicaciones técnicas sin conexión a internet ni coste por API.
- Agente autónomo de desarrollo de software: gracias a su arquitectura MoE con 3B parámetros activos y su diseño orientado a agentes, puede integrarse en entornos como Claude Code o herramientas similares para automatizar tareas de implementación, pruebas y corrección de errores.
- Generación y revisión de código en pipelines de CI/CD: el modelo puede utilizarse para generar tests unitarios, revisar pull requests o detectar vulnerabilidades de seguridad en el código, integrándose mediante tool calling en flujos de integración continua.
- Chat técnico con contexto largo: con una ventana de contexto de hasta 262 144 tokens, es adecuado para mantener conversaciones extensas sobre una base de código completa, documentación o logs de gran tamaño.
- Refactorización de código legacy: el modelo puede analizar código antiguo, proponer reescrituras modernas y explicar los cambios necesarios, aprovechando su capacidad de razonamiento multi-paso.
- Documentación automática de proyectos: puede generar documentación técnica, comentarios en el código y guías de uso a partir del análisis del repositorio, reduciendo el trabajo manual de los equipos de desarrollo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks para este checkpoint cuantizado en la información disponible. La model card indica explícitamente que no se ha realizado una comparación de calidad frente al modelo BF16 original ni frente a líneas base uniformes. Sin embargo, según las guías web sobre el modelo base Qwen3-Coder-Next, este alcanza un 44,3 % en SWE-Bench Pro y un rendimiento comparable a Claude Sonnet 4.5 en tareas de codificación, pero estos datos corresponden al modelo sin cuantizar y no pueden atribuirse a esta versión AXQ sin verificación.

## Requisitos de hardware

- VRAM estimada: el archivo de pesos ocupa aproximadamente 43 GB, por lo que se requiere un mínimo de 64 GB de memoria unificada en Apple Silicon para cargar el modelo completo con espacio para el contexto y los cálculos intermedios.
- GPU recomendadas: Apple Silicon con al menos 64 GB de memoria unificada, como los chips M2 Ultra, M3 Ultra o M4 Max/Ultra. No es compatible con GPUs NVIDIA o AMD convencionales, ya que el formato MLX está diseñado para el ecosistema de Apple.
- En consumer GPU: no cabe en GPUs de consumo típicas como la RTX 4090 (24 GB) o la RTX 5090 (32 GB), ya que el formato MLX no es ejecutable en esas plataformas.
- Opciones de despliegue: MLX-LM es el runtime principal indicado en la documentación. También podría utilizarse con otras herramientas que soporten MLX, aunque no se mencionan explícitamente.
- Latencia y throughput: no disponibles en la información proporcionada. La model card no incluye mediciones de velocidad ni certificaciones de rendimiento.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| AX-Qwen3-Coder-Next-MLX-AXQ-MXFP4 (este) | 79,67B totales, 3B activos | 262 144 | Apache 2.0 | MLX safetensors | Cuantizado AXQ 4,32 BPW, sin MTP |
| Qwen/Qwen3-Coder-Next (original) | 79,67B totales, 3B activos | 262 144 | Apache 2.0 | PyTorch / BF16 | Modelo base sin cuantizar |
| AX-Qwen3-Coder-Next-MLX-AXQ-4bit (sibling) | 79,67B totales, 3B activos | 262 144 | Apache 2.0 | MLX safetensors | Presupuesto de almacenamiento menor, BPW exacto no publicado |
| AX-Qwen3-Coder-Next-MLX-AXQ-6bit (sibling) | 79,67B totales, 3B activos | 262 144 | Apache 2.0 | MLX safetensors | Mayor precisión media cerca de 6 BPW |

No se dispone de comparativas con otros modelos de codificación como DeepSeek-Coder o CodeLlama en la información proporcionada.

## Limitaciones y advertencias

- No se ha publicado ninguna métrica de retención de calidad frente al modelo BF16 original; la cuantización puede degradar el rendimiento en tareas complejas.
- La cuantización se realizó sin calibración, basándose únicamente en prioris de arquitectura, lo que podría afectar a la precisión en dominios específicos.
- No incluye capacidades de visión ni audio, a pesar de que el modelo base podría tener variantes multimodales.
- No se certifica la aceleración por predicción multi-token (MTP); el checkpoint no incluye sidecar MTP.
- El runtime AX Engine nativo no está establecido; solo se garantiza la ejecución mediante MLX-LM estándar.
- Requiere al menos 64 GB de memoria unificada en Apple Silicon, lo que limita su uso a equipos de gama alta.
- Los idiomas soportados no están documentados, por lo que el rendimiento en idiomas distintos del inglés o el chino es incierto.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda verificar los términos del modelo base Qwen3-Coder-Next para evitar conflictos.

## Enlaces

- [Checkpoint en HuggingFace](https://huggingface.co/AutomatosX/AX-Qwen3-Coder-Next-MLX-AXQ-MXFP4)
- [Modelo base Qwen/Qwen3-Coder-Next](https://huggingface.co/Qwen/Qwen3-Coder-Next)
- [Colección Qwen3-Coder-Next de AutomatosX](https://huggingface.co/collections/AutomatosX/qwen3-coder-next)
- [Certificado Tier 1 del checkpoint](https://github.com/defai-digital/axquant/blob/main/docs/certifications/qwen3-coder-next-axq-mxfp4-tier1.md)
- [Guía completa de Qwen3-Coder-Next (dev.to)](https://dev.to/sienna/qwen3-coder-next-the-complete-2026-guide-to-running-powerful-ai-coding-agents-locally-1k95)
- [Guía completa de Qwen3-Coder-Next (lovableapp.org)](https://lovableapp.org/blog/2026-qwen3-coder-next-complete-guide)
- [Guía completa de Qwen3-Coder-Next (a2aprotocol.ai)](https://a2aprotocol.ai/blog/2026-qwen3-coder-next-complete-guide)
