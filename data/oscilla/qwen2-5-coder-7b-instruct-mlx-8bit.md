# Oscilla/Qwen2.5-Coder-7B-Instruct-mlx-8Bit

## Resumen

Oscilla/Qwen2.5-Coder-7B-Instruct-mlx-8Bit es una conversión al formato MLX (Apple Silicon) del modelo Qwen2.5-Coder-7B-Instruct, desarrollado por Alibaba Cloud. Esta versión cuantizada a 8 bits está pensada para ejecutarse de forma eficiente en dispositivos con chip de Apple (M1/M2/M3/M4) mediante la librería mlx-lm, manteniendo las capacidades originales de generación de código, razonamiento y conversación del modelo base.

El modelo base, Qwen2.5-Coder-7B-Instruct, es un transformer decoder-only con 7.610 millones de parámetros, entrenado con 5.5 trillones de tokens de código y texto, con un pipeline de SFT y RLHF. Esta conversión a MLX 8-bit reduce el tamaño de los pesos a un byte por parámetro, lo que facilita su uso en entornos con memoria limitada sin sacrificar en exceso la precisión. Es relevante para desarrolladores que trabajan en ecosistemas Apple y necesitan un modelo de código local, privado y con buena relación calidad/rendimiento.

La licencia Apache 2.0 permite uso comercial sin restricciones, lo que lo convierte en una opción atractiva para integraciones en producción. Aunque el repositorio reporta 2.142.131.712 parámetros en los safetensors, este número corresponde al tamaño en bytes de los tensores cuantizados, no al número real de parámetros del modelo, que es de 7.610 millones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5) |
| Parametros totales | 2.142.131.712 (según safetensors; el modelo base Qwen2.5-Coder-7B-Instruct tiene 7.610.000.000) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el modelo base soporta 131.072 tokens, pero no se especifica en este repo) |
| Tipos de cuantizacion | 8-bit (MLX) |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo original Qwen2.5-Coder-7B-Instruct emplea la arquitectura Qwen2.5, un transformer decoder-only con atención por ventanas deslizantes, RoPE (Rotary Position Embedding) y Grouped Query Attention (GQA) para mejorar la eficiencia en inferencia. Fue entrenado con 5.5 trillones de tokens, combinando código de múltiples lenguajes, texto técnico y datos generales, seguido de un proceso de supervisión (SFT) y optimización con RLHF para alinear el comportamiento con instrucciones humanas.

Esta versión MLX 8-bit es una conversión realizada con mlx-lm 0.31.2, que cuantiza los pesos a 8 bits manteniendo la estructura original del modelo. La cuantización reduce el tamaño en memoria a aproximadamente 7.6 GB (el repositorio ocupa 8.1 GB), permitiendo su ejecución en Mac con Apple Silicon sin necesidad de GPU dedicada. No hay cambios en la arquitectura ni en los pesos originales más allá de la reducción de precisión.

## Capacidades

- Generación de código en múltiples lenguajes: Python, JavaScript, Java, C++, Go, Rust, etc., con soporte para completado, generación de funciones y refactorización.
- Razonamiento sobre código: explica fragmentos, identifica errores, sugiere correcciones y predice entradas/salidas de programas.
- Conversación y asistencia técnica: responde preguntas sobre programación, documentación y buenas prácticas.
- Tool calling / function calling: puede invocar funciones externas si se le proporciona el esquema adecuado, útil para agentes.
- Soporte para agentes multi-paso: puede mantener contexto en tareas secuenciales, aunque la ventana de contexto no se especifica en este repo.
- Capacidades multilingües: aunque la model card indica solo inglés, el modelo base soporta múltiples idiomas; esta conversión hereda esa capacidad, pero no está garantizada.

## Casos de uso

- Asistente de programación local en macOS: desarrolladores que trabajan en entornos Apple pueden ejecutar el modelo directamente en su Mac con mlx-lm, sin conexión a internet, para obtener sugerencias de código en tiempo real dentro de editores como VS Code o Neovim.
- Generación de tests unitarios: el modelo puede crear casos de prueba a partir de funciones existentes, ayudando a aumentar la cobertura en proyectos con CI/CD.
- Revisión de código automatizada: integrado en pipelines de CI, puede analizar pull requests y detectar posibles bugs, problemas de estilo o vulnerabilidades comunes.
- Chatbot técnico para documentación interna: empresas pueden desplegarlo como un asistente que responde preguntas sobre su propio código base, siempre que se le proporcione contexto relevante.
- Educación y formación: estudiantes de programación pueden usarlo para entender fragmentos de código, pedir explicaciones paso a paso o practicar resolución de problemas.
- Prototipado rápido: en entornos de investigación, sirve para generar esqueletos de aplicaciones o scripts de automatización sin depender de servicios en la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo base Qwen2.5-Coder-7B-Instruct tiene resultados conocidos en HumanEval, MBPP y otros, pero esta conversión específica no incluye mediciones propias. Se recomienda evaluar el rendimiento en el caso de uso concreto antes de desplegarlo en producción.

## Requisitos de hardware

- VRAM estimada: al ser un modelo de 7.6B parámetros en 8-bit, ocupa aproximadamente 7.6 GB de memoria. En Apple Silicon, la memoria unificada del sistema (RAM) debe ser de al menos 16 GB para un funcionamiento cómodo.
- GPU recomendadas: no requiere GPU dedicada; funciona en cualquier Mac con chip M1 o superior. Para GPU NVIDIA, sería necesario convertir el modelo a otro formato (por ejemplo, GGUF o FP16) y usar vLLM o llama.cpp.
- Compatibilidad con consumer GPU: no aplica directamente, ya que MLX es específico de Apple. En GPUs de escritorio, se puede usar el modelo original en FP16 (necesita ~15 GB VRAM) o cuantizaciones de 4-bit (~4 GB).
- Opciones de despliegue: mlx-lm (recomendado), también se puede cargar con transformers si se convierten los pesos a formato estándar. No es compatible directamente con vLLM, TGI u Ollama sin conversión previa.
- Latencia y throughput: no disponibles, pero en Apple Silicon (M2 Pro) se espera una generación de 20-40 tokens/segundo para un modelo de este tamaño en 8-bit.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Oscilla/Qwen2.5-Coder-7B-Instruct-mlx-8Bit | 7.6B (base) | no disponible | Apache 2.0 | MLX 8-bit | Optimizado para Apple Silicon |
| Qwen/Qwen2.5-Coder-7B-Instruct | 7.6B | 131.072 | Apache 2.0 | safetensors (FP16) | Modelo original, requiere más VRAM |
| CodeLlama-7B-Instruct | 7B | 16.384 | Llama 2 license | safetensors | Menor contexto, licencia restrictiva |
| DeepSeek-Coder-7B-Instruct | 6.7B | 16.384 | MIT | safetensors | Buen rendimiento en código, contexto menor |

La conversión MLX no altera el rendimiento intrínseco del modelo base, pero su ventaja radica en la eficiencia en hardware Apple. Frente a alternativas, Qwen2.5-Coder-7B destaca por su mayor contexto (131K) y licencia permisiva.

## Limitaciones y advertencias

- Alucinación: como todo modelo generativo, puede producir código incorrecto o inventar APIs inexistentes. Es necesario validar las salidas en entornos críticos.
- Sesgos: el entrenamiento con datos de código puede reflejar sesgos presentes en repositorios públicos, como preferencias por ciertos estilos o lenguajes dominantes.
- Idioma: la model card indica solo inglés; aunque el modelo base soporta más idiomas, no se garantiza un rendimiento óptimo fuera del inglés técnico.
- Cuantización 8-bit: puede degradar ligeramente la precisión en tareas de razonamiento complejo comparado con FP16, aunque en la práctica la diferencia suele ser mínima.
- Dependencia de Apple Silicon: el formato MLX solo es ejecutable en hardware Apple; para otros entornos es necesario convertir los pesos, lo que añade un paso adicional.
- Sin garantías de soporte: el autor (Oscilla) no proporciona mantenimiento activo; el repositorio tiene 0 descargas y 0 likes, lo que sugiere un proyecto experimental.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Oscilla/Qwen2.5-Coder-7B-Instruct-mlx-8Bit
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-7B-Instruct
- Página de Ollama para Qwen2.5 Coder: https://ollama.com/library/qwen2.5-coder:7b-instruct
- Repositorio GitHub de Qwen2.5-Coder: https://github.com/huggingface/Qwen2.5-Coder
- Benchable (detalles del modelo base): https://benchable.ai/models/qwen/qwen2.5-coder-7b-instruct
