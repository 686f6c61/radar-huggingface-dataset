# Oscilla/Qwen2.5-3B-Instruct-mlx-8Bit

## Resumen

Oscilla/Qwen2.5-3B-Instruct-mlx-8Bit es una conversión al formato MLX (Apple Silicon) del modelo Qwen2.5-3B-Instruct, desarrollado por Alibaba Cloud. El modelo original es un transformer decoder-only denso de 3.000 millones de parámetros, preentrenado sobre hasta 18 billones de tokens y optimizado para tareas de instrucción y chat. Esta conversión, realizada por el usuario Oscilla con la librería mlx-lm 0.31.2, cuantiza los pesos a 8 bits, reduciendo el tamaño del repositorio a 3.3 GB y permitiendo su ejecución eficiente en hardware de Apple con Metal.

La relevancia de este modelo radica en su equilibrio entre tamaño compacto y capacidades de razonamiento, generación de código y soporte multilingüe. Al estar disponible en MLX 8-bit, facilita la inferencia local en Macs con memoria unificada, sin necesidad de GPUs dedicadas. Es una opción práctica para prototipado, desarrollo de asistentes conversacionales y aplicaciones de procesamiento de lenguaje natural en entornos con recursos limitados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5) |
| Parametros totales | 868.093.952 (según safetensors; el modelo base Qwen2.5-3B-Instruct tiene ~3.09B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 32.768 tokens (contexto del modelo base) |
| Tipos de cuantizacion | 8-bit (MLX) |
| Idiomas soportados | en (según model card; el modelo base soporta multilingüe) |
| Licencia | qwen-research (uso no comercial) |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo base Qwen2.5-3B-Instruct emplea una arquitectura transformer decoder-only con atención de múltiples cabezas, normalización RMSNorm y embeddings rotatorios (RoPE). Fue preentrenado sobre un corpus masivo de hasta 18 billones de tokens, con datos multilingües y de código, seguido de un ajuste fino supervisado (SFT) y optimización por preferencias humanas (RLHF/DPO). La conversión a MLX 8-bit no modifica la arquitectura, sino que cuantiza los pesos lineales en bloques de 64 canales con escalares de 8 bits, reduciendo el uso de memoria y acelerando la inferencia en GPUs de Apple mediante Metal.

No se dispone de detalles adicionales sobre el proceso de conversión más allá de la versión de mlx-lm utilizada (0.31.2). La cuantización 8-bit introduce una pérdida mínima de precisión, generalmente inferior al 1% en tareas de razonamiento, manteniendo la mayor parte de las capacidades del modelo original.

## Capacidades

- Generación de texto conversacional y completado de instrucciones con alta coherencia.
- Razonamiento lógico y matemático básico, adecuado para problemas de nivel medio.
- Generación y comprensión de código en lenguajes como Python, JavaScript y C++.
- Soporte de tool calling y function calling (heredado del modelo base Qwen2.5-Instruct).
- Capacidad para seguir instrucciones multi-turno y mantener contexto en diálogos largos.
- Soporte multilingüe limitado en esta conversión (etiqueta `en`), aunque el modelo base soporta más de 29 idiomas.
- Integración con el ecosistema MLX: carga directa con `mlx-lm` y generación optimizada en Apple Silicon.

## Casos de uso

- Asistente conversacional local en macOS: el modelo puede ejecutarse en un Mac con 8 GB de RAM unificada, proporcionando respuestas en tiempo real sin conexión a internet, ideal para prototipos de chatbots personales o de empresa.
- Generación de código en entornos de desarrollo: gracias a su capacidad de tool calling, puede integrarse en editores de código o pipelines de CI/CD para autocompletar, revisar o documentar fragmentos de código.
- Razonamiento y resolución de problemas: adecuado para aplicaciones educativas que requieran explicaciones paso a paso de problemas matemáticos o lógicos.
- Procesamiento de documentos: con su contexto de 32k tokens, puede resumir o extraer información de documentos extensos, como informes técnicos o artículos.
- Desarrollo de agentes simples: el soporte de function calling permite construir agentes que interactúan con APIs externas, bases de datos o herramientas de automatización.
- Investigación académica en NLP: al ser un modelo abierto y cuantizado, facilita experimentos de fine-tuning o evaluación en hardware modesto, sin necesidad de GPUs de alta gama.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para esta conversión MLX 8-bit. El modelo base Qwen2.5-3B-Instruct reporta en la documentación oficial valores de MMLU (68.3), HumanEval (72.6) y GSM8K (84.5) en su versión original, pero estos datos no están confirmados para la versión cuantizada. Se recomienda realizar una evaluación propia en el caso de uso concreto.

## Requisitos de hardware

- VRAM estimada: ~3.5 GB para los pesos en 8-bit más overhead de inferencia (KV cache y activaciones).
- GPU recomendadas: Apple Silicon (M1, M2, M3 y superiores) con Metal; funciona en cualquier Mac con al menos 8 GB de RAM unificada.
- Compatible con consumer hardware: sí, en Macs; no requiere GPU NVIDIA o AMD.
- Opciones de despliegue: `mlx-lm` (Python), integración con `ollama` (si se convierte a GGUF), o servidores basados en MLX.
- Latencia estimada: en un MacBook Pro M2 Pro, generación de ~20 tokens por segundo con 8-bit; en M1, ~10-15 tokens por segundo.
- Throughput: suficiente para aplicaciones interactivas de baja concurrencia; no recomendado para servir múltiples peticiones simultáneas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Uso en Mac |
|---|---|---|---|---|---|
| Oscilla/Qwen2.5-3B-Instruct-mlx-8Bit | 868M (cuantizado) | 32k | qwen-research | MLX 8-bit | Sí |
| lmstudio-community/Qwen2.5-3B-Instruct-MLX-8bit | ~3.09B | 32k | Apache 2.0 | MLX 8-bit | Sí |
| mlx-community/Qwen2.5-3B-Instruct-8bit | ~3.09B | 32k | Apache 2.0 | MLX 8-bit | Sí |
| Llama 3.2 3B Instruct (MLX 8-bit) | ~3.2B | 128k | Llama 3.2 Community | MLX 8-bit | Sí |

Las alternativas de la comunidad (lmstudio-community, mlx-community) ofrecen la misma conversión pero con licencia Apache 2.0, lo que permite uso comercial. La versión de Oscilla se limita a investigación por su licencia qwen-research.

## Limitaciones y advertencias

- Licencia qwen-research: restringe el uso exclusivamente a fines de investigación y prohíbe aplicaciones comerciales. Para producción, se debe usar una versión con licencia Apache 2.0.
- Idioma etiquetado como `en` en la model card; aunque el modelo base es multilingüe, esta conversión puede no haber sido probada en otros idiomas.
- La cuantización 8-bit puede degradar ligeramente la precisión en tareas de razonamiento complejo o generación de código muy específico.
- Riesgo de alucinaciones en contextos largos o temas especializados; se recomienda verificación de hechos.
- No se garantiza soporte para tool calling avanzado en todas las versiones de mlx-lm; requiere la versión 0.31.2 o superior.
- El tamaño de contexto de 32k tokens puede no ser suficiente para documentos muy extensos; se debe truncar o dividir el texto.
- Al ser una conversión de la comunidad, no hay garantía de mantenimiento ni actualizaciones futuras.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Oscilla/Qwen2.5-3B-Instruct-mlx-8Bit
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- Documentación de Qwen2.5 en GitHub: https://github.com/mx4ai/qwen2.5
- Página de Qwen2.5 en Ollama: https://ollama.com/library/qwen2.5:3b-instruct
- Conversión alternativa de LM Studio: https://huggingface.co/lmstudio-community/Qwen2.5-3B-Instruct-MLX-8bit
- Conversión de mlx-community: https://huggingface.co/mlx-community/Qwen2.5-3B-Instruct-8bit
