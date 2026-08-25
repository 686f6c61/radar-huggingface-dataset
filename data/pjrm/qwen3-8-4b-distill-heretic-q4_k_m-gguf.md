# PJRM/Qwen3.8-4B-Distill-heretic-Q4_K_M-GGUF

## Resumen
PJRM/Qwen3.8-4B-Distill-heretic-Q4_K_M-GGUF es una cuantización GGUF en formato Q4_K_M del modelo [valiolla/Qwen3.8-4B-Distill-heretic](https://huggingface.co/valiolla/Qwen3.8-4B-Distill-heretic), un modelo de lenguaje de 4.200 millones de parámetros (4,2B) desarrollado mediante destilación de la serie Qwen3.8 sobre la arquitectura Qwen3.5-4B. El modelo base fue entrenado con aproximadamente 45.000 trazas de razonamiento denso (chain-of-thought) curadas, abarcando matemáticas, razonamiento general y seguimiento de instrucciones, y posteriormente se le aplicó la técnica "heretic" (abliteración) para eliminar el alineamiento de seguridad (censura).

La relevancia de esta versión GGUF es que permite ejecutar el modelo en entornos locales con llama.cpp, Ollama u otros motores compatibles, sin necesidad de GPU de alta gama. El archivo pesa 2,7 GB y es adecuado para despliegues en CPU o GPUs con poca VRAM. Su licencia Apache-2.0 permite uso comercial sin restricciones adicionales, aunque el modelo está orientado a generación de texto en inglés y no se han publicado resultados de benchmarks en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basada en Qwen3.5-4B) |
| Parametros totales | 4.205.751.296 (4,2B) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (este archivo) |
| Idiomas soportados | en (ingles) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo original `Qwen3.8-4B-Distill-heretic` es una destilación de parámetros completos de un modelo Qwen3.8 de 2,4 billones de parámetros (probablemente MoE, aunque no se especifica) hacia la arquitectura densa Qwen3.5-4B. El proceso de destilación utilizó alrededor de 45.000 trazas de profesor curadas, que consisten en cadenas de razonamiento denso para tareas de matemáticas, razonamiento general y seguimiento de instrucciones, con un filtrado de calidad previo.

Posteriormente, se aplicó la técnica "heretic" (abliteración direccional) para eliminar el alineamiento de seguridad del modelo, lo que produce un comportamiento menos censurado. Esta técnica se basa en el método de ablación direccional descrito en Arditi et al. (2024) y optimizada con Optuna. La cuantización a GGUF Q4_K_M se realizó con llama.cpp mediante el espacio GGUF-my-repo, conservando las capacidades del modelo original a un coste de memoria reducido.

## Capacidades

- Generación de texto en inglés, con razonamiento matemático y lógico.
- Soporte de function calling / tool calling (indicado en los tags del modelo original).
- Capacidad de seguir instrucciones complejas gracias al entrenamiento con trazas de razonamiento.
- Razonamiento multi-paso (chain-of-thought) en tareas de matemáticas y lógica.
- Comportamiento "uncensored" o "heretic" (abliterado), que elimina restricciones de seguridad típicas.
- Compatible con pipelines de texto de transformers y con el ecosistema llama.cpp (CLI, servidor, bindings).

## Casos de uso

- **Atención al cliente automatizada**: el modelo puede gestionar conversaciones multi-turno en inglés, aunque su ventana de contexto no está documentada; para casos simples de soporte técnico puede integrarse en bots con memoria corta.
- **Generación de código en entornos de desarrollo**: gracias al soporte de function calling, puede usarse en asistentes de programación que invoquen APIs o ejecuten scripts, aunque su tamaño de 4B limita la calidad en tareas complejas.
- **Razonamiento matemático y lógico**: para aplicaciones educativas o de cálculo, el modelo puede resolver problemas de álgebra y lógica con explicaciones paso a paso, útil en plataformas de tutoría.
- **Prototipado rápido de agentes de IA**: al ser ligero (2,7 GB) y con licencia Apache-2.0, es adecuado para pruebas de concepto en entornos con pocos recursos, como laptops o servidores CPU.
- **Procesamiento de texto en entornos con privacidad**: al ejecutarse localmente, permite analizar documentos o correos sin enviar datos a la nube, aunque solo en inglés.
- **Investigación en alineamiento y desalineamiento**: el modelo sirve para estudiar los efectos de la abliteración en modelos pequeños, siendo un ejemplo reproducible para experimentos académicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La pagina del modelo base en HuggingFace no incluye tablas de evaluacion, y la version GGUF no aporta datos adicionales. Se recomienda consultar el repositorio de Qwen3.5 o la documentacion de Qwen para obtener comparativas de modelos similares.

## Requisitos de hardware

- **VRAM estimada**: el archivo GGUF Q4_K_M pesa 2,7 GB, por lo que la VRAM necesaria para inferencia es aproximadamente 3-4 GB (incluyendo overhead de contexto y buffers). Puede ejecutarse en GPUs con 4 GB de VRAM, como NVIDIA GTX 1650 Ti o RTX 3050.
- **CPU**: funciona con llama.cpp en CPU sin GPU, con latencias mayores (dependiendo del número de hilos). En un procesador moderno de 8 núcleos puede generar entre 5-10 tokens/s.
- **GPUs recomendadas**: cualquier GPU con soporte CUDA o Vulkan con al menos 4 GB de VRAM. En GPUs como RTX 4090 o A100 la latencia es mínima.
- **Opciones de despliegue**: llama.cpp CLI, llama-server, Ollama (importando el archivo GGUF), o TGI (si se convierte a safetensors). También se puede usar directamente con transformers en Python cargando el modelo base.
- **Latencia estimada**: en CPU, 5-10 tokens/s; en GPU de gama media, 30-60 tokens/s (valores típicos para modelos de 4B cuantizados).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Qwen3.8-4B-Distill-heretic (GGUF) | 4,2B | no disponible | Apache-2.0 | HuggingFace (este repo) |
| Qwen3.5-4B (base) | 4B | no disponible | Apache-2.0 | HuggingFace |
| Llama 3.2 3B | 3,2B | 128K | Llama 3.2 Community | Meta |
| Gemma 2 2B | 2,6B | 8K | Gemma | Google |

No se dispone de datos de rendimiento comparativo. La diferencia principal es que el modelo heretic ha sido abliterado (sin censura) y destilado de Qwen3.8, mientras que los otros son modelos originales con alineamiento estándar.

## Limitaciones y advertencias

- **Contenido no censurado**: al eliminar el alineamiento de seguridad, el modelo puede generar contenido ofensivo, ilegal o peligroso. No debe usarse en aplicaciones públicas sin supervisión humana.
- **Riesgo de alucinación**: como todo modelo de lenguaje, puede inventar información, especialmente en tareas de hechos o citas.
- **Ventana de contexto no documentada**: se desconoce la longitud máxima de contexto soportada, lo que puede causar degradación en conversaciones largas.
- **Idioma limitado**: solo se ha entrenado para inglés; el rendimiento en otros idiomas no está garantizado.
- **Sin garantías de calidad**: al ser una destilación de un modelo grande, puede presentar errores en razonamiento complejo o matemáticas avanzadas.
- **Licencia**: aunque es Apache-2.0, el uso de la técnica "heretic" puede implicar restricciones legales en algunos países por la generación de contenido inapropiado. Consulte la normativa local.

## Enlaces

- [HuggingFace - PJRM/Qwen3.8-4B-Distill-heretic-Q4_K_M-GGUF](https://huggingface.co/PJRM/Qwen3.8-4B-Distill-heretic-Q4_K_M-GGUF)
- [HuggingFace - valiolla/Qwen3.8-4B-Distill-heretic (modelo original)](https://huggingface.co/valiolla/Qwen3.8-4B-Distill-heretic)
- [GitHub - QwenLM/Qwen3.5 (arquitectura base)](https://github.com/QwenLM/Qwen3.5)
- [GitHub - Heretic (herramienta de abliteración)](https://github.com/p-e-w/heretic)
- [FriendliAI - Descripción de Qwen3.8-4B-Distill](https://friendli.ai/models/valiolla/Qwen3.8-4B-Distill-heretic)
- [HuggingFace - mradermacher/Qwen3.8-4B-Distill-heretic-GGUF (otra cuantización)](https://huggingface.co/mradermacher/Qwen3.8-4B-Distill-heretic-GGUF)
