# McG-221/Qwen3.8-27B-Ultra-Uncensored-Heretic-mlx-8Bit

## Resumen
El modelo **McG-221/Qwen3.8-27B-Ultra-Uncensored-Heretic-mlx-8Bit** es una conversión al formato MLX (optimizado para Apple Silicon) del modelo base `llmfan46/Qwen3.8-27B-Ultra-Uncensored-Heretic-Native-MTP-Preserved`, que a su vez es una versión modificada (abliterada) del modelo **Qwen3.8-27B** de Alibaba. Se trata de un modelo de lenguaje y visión de 27 mil millones de parámetros, de arquitectura densa híbrida (atención lineal Gated DeltaNet + atención completa), con capacidades nativas de visión, control de modo de pensamiento, tool calling y una cabeza de predicción multi-token (MTP) para decodificación especulativa.

La modificación principal consiste en la eliminación del comportamiento de rechazo (refusal) mediante técnicas de "abliteración", lo que permite respuestas sin censura en temas controvertidos. Esta versión en particular está cuantizada a 8 bits en formato MLX, pensada para ejecutarse en Macs con chip Apple Silicon. El modelo se distribuye bajo licencia Apache 2.0, lo que permite uso comercial y modificación. Es relevante para desarrolladores que buscan un modelo de visión-lenguaje potente, sin restricciones de contenido, ejecutable localmente en hardware Apple.

## Especificaciones técnicas
| Parametro | Valor |
|---|---|
| Arquitectura | Densa, híbrida: atención lineal Gated DeltaNet + atención completa, con componente de visión |
| Parametros totales | 27B (modelo base); el archivo safetensors del repositorio indica 7.566.401.024 (posible discrepancia por cuantización o formato) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | 8-bit (afín, grupo de tamaño 64) en este repositorio; existen versiones de 2/4/6/8-bit en otros repos |
| Idiomas soportados | No disponible (Qwen3.8-27B soporta múltiples idiomas, pero no se especifica en esta ficha) |
| Licencia | Apache 2.0 |
| Formato de pesos | MLX (safetensors) |

## Arquitectura y entrenamiento
El modelo base Qwen3.8-27B utiliza una arquitectura híbrida que combina capas de atención lineal con Gated DeltaNet y capas de atención completa, lo que reduce el coste computacional en contextos largos manteniendo la calidad. Es un modelo de visión-lenguaje nativo: el codificador de visión está integrado en el propio transformer, permitiendo procesar imágenes y texto conjuntamente. Además, incorpora un mecanismo de control de "pensamiento" (thinking mode) que permite alternar entre respuestas razonadas y directas, y una cabeza MTP (Multi-Token Prediction) que acelera la decodificación mediante predicción especulativa de varios tokens a la vez.

El proceso de entrenamiento original de Qwen3.8-27B no se detalla en la información disponible. La modificación "Ultra-Uncensored-Heretic" aplica técnicas de abliteración (eliminación de capas o pesos asociados al rechazo) y posiblemente ajuste fino con preferencias (MPOA, Multi-Preference Optimization) para reducir la negativa a responder. El resultado es un modelo que responde a prácticamente cualquier solicitud sin filtros de seguridad. Esta versión concreta fue convertida a MLX usando `mlx-lm` versión 0.31.2, sin cambios adicionales en los pesos.

## Capacidades
- Generación de texto y razonamiento: respuestas coherentes y detalladas en tareas de lenguaje natural, incluyendo razonamiento lógico y matemático.
- Visión y lenguaje: procesamiento de imágenes junto con texto, capaz de describir, analizar y responder preguntas sobre contenido visual.
- Modo de pensamiento controlable: se puede activar o desactivar el razonamiento extendido (thinking mode) mediante el prompt, permitiendo respuestas rápidas o profundas según la necesidad.
- Tool calling / function calling: soporte para invocar herramientas externas mediante llamadas a funciones estructuradas.
- Decodificación especulativa con MTP: la cabeza de predicción multi-token acelera la generación al predecir varios tokens en paralelo, mejorando el throughput.
- Sin censura: al estar abliterado, no muestra rechazos ante solicitudes controvertidas o explícitas, lo que permite usos creativos y de investigación sin restricciones de contenido.

## Casos de uso
- Asistentes conversacionales sin filtros: el modelo puede gestionar conversaciones multi-turno sobre temas tabú o controvertidos sin evasivas, útil para investigación en ciencias sociales o simulación de diálogos abiertos.
- Análisis de imágenes con razonamiento: dado su soporte de visión, puede analizar fotografías o diagramas y explicar su contenido con detalle, por ejemplo en tareas de accesibilidad o documentación automática.
- Generación de código y depuración: con tool calling integrado, puede generar, revisar y ejecutar código en entornos de desarrollo, aunque su naturaleza sin censura requiere supervisión humana.
- Creación de contenido creativo: redacción de narrativas, guiones o material literario sin restricciones temáticas, aprovechando su capacidad de generar texto fluido y variado.
- Investigación en seguridad de IA: al ser un modelo abliterado, sirve como caso de estudio para analizar el impacto de la eliminación de mecanismos de rechazo y evaluar riesgos de sesgo o contenido dañino.
- Despliegue local en Mac: gracias al formato MLX y cuantización 8-bit, puede ejecutarse en un Mac con suficiente memoria unificada, permitiendo prototipado y uso offline sin depender de servicios en la nube.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible. No se dispone de datos objetivos sobre MMLU, HumanEval, GSM8K u otras métricas para esta versión específica. Dado que es una modificación del Qwen3.8-27B original, es razonable esperar un rendimiento similar al del modelo base, pero la abliteración puede afectar a la calidad en tareas que requieren seguir instrucciones de seguridad.

## Requisitos de hardware
- VRAM estimada: para una cuantización de 8 bits con 27B parámetros, se necesitan aproximadamente 27 GB de memoria, más overhead del sistema. En la práctica, un Mac con 32 GB de memoria unificada puede ejecutarlo, aunque con limitaciones de contexto.
- GPU recomendadas: el formato MLX está diseñado para Apple Silicon, por lo que se recomienda un Mac con chip M1 Pro, M1 Max, M2 Pro, M2 Max o superior. No es compatible directamente con GPUs NVIDIA o AMD.
- Si cabe en consumer GPU: no, el formato MLX es exclusivo de Apple. Para GPUs convencionales existen versiones GGUF del mismo modelo (por ejemplo, en Ollama) que sí requieren una GPU con al menos 24-32 GB de VRAM para 8 bits.
- Opciones de despliegue: `mlx-lm` para Python en macOS; también se puede usar con `ollama` si se dispone de la versión GGUF. No es compatible con vLLM ni TGI en su forma MLX.
- Latencia y throughput: no se han publicado mediciones. Se estima que en un M2 Max (64 GB) la generación puede alcanzar varios tokens por segundo, pero depende del contexto y del modo de pensamiento.

## Comparativa con modelos similares
| Modelo | Parametros | Contexto | Vision | Tool calling | Licencia | Formato |
|---|---|---|---|---|---|---|
| Qwen3.8-27B (original) | 27B | No disponible | Sí | Sí | Apache 2.0 | Transformers, GGUF |
| Qwen3.8-27B-Ultra-Uncensored-Heretic (este) | 27B | No disponible | Sí | Sí | Apache 2.0 | MLX, GGUF |
| Llama-3.1-8B-Instruct (abliterado) | 8B | 128K | No | Sí | Llama 3.1 | Transformers, GGUF |

La comparación directa con Llama-3.1-8B-Instruct abliterado muestra que este modelo es significativamente mayor (27B vs 8B) y añade capacidades de visión, lo que lo hace más adecuado para tareas multimodales. Sin embargo, el tamaño implica mayores requisitos de memoria. No se dispone de datos de rendimiento para comparar cuantitativamente.

## Limitaciones y advertencias
- Al ser un modelo "uncensored" (sin censura), puede generar contenido dañino, ofensivo o ilegal. Su uso en producción debe estar sujeto a políticas de responsabilidad y supervisión humana.
- La abliteración puede degradar el rendimiento en tareas que requieren seguir normas de seguridad o evitar sesgos, ya que se eliminan capas que contribuyen a la alineación.
- No se especifica la longitud de contexto soportada; se desconoce si mantiene la ventana original de Qwen3.8-27B (posiblemente 128K tokens, pero no confirmado).
- El soporte de idiomas no está documentado; aunque Qwen suele ser multilingüe, no hay garantía de cobertura completa.
- La discrepancia en el número de parámetros (7.56B en safetensors vs 27B declarados) sugiere que el archivo cuantizado podría tener una representación comprimida, pero no se ha aclarado oficialmente.
- La licencia Apache 2.0 permite uso comercial, pero el contenido generado es responsabilidad del usuario. No hay garantías de que el modelo cumpla normativas como la Ley de IA de la UE.
- El formato MLX solo funciona en Apple Silicon, lo que limita el despliegue a esa plataforma. Para otros entornos hay que buscar versiones GGUF o FP8.

## Enlaces
- [Repositorio HuggingFace del modelo](https://huggingface.co/McG-221/Qwen3.8-27B-Ultra-Uncensored-Heretic-mlx-8Bit)
- [Modelo base en HuggingFace: llmfan46/Qwen3.8-27B-Ultra-Uncensored-Heretic-Native-MTP-Preserved](https://huggingface.co/llmfan46/Qwen3.8-27B-Ultra-Uncensored-Heretic-Native-MTP-Preserved)
- [GitHub de onurburak9 con versiones MLX del mismo modelo](https://github.com/onurburak9/Qwen3.8-27B-Uncensored-MLX)
- [Build en Ollama: orcarouter/Qwen3.8-27B-Uncensored](https://ollama.com/orcarouter/Qwen3.8-27B-Uncensored)
- [Artículo sobre el lanzamiento de Orca Router](https://www.newsbytesapp.com/news/science/orca-router-releases-uncensored-qwen-38-27b-for-apple-silicon-macs/tldr)
- [Blog de explainx.ai sobre el build MLX](https://www.explainx.ai/blog/orcarouter-qwen3-8-27b-uncensored-mlx-august-2026)
