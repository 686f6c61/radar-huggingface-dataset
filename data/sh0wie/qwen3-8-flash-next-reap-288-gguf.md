# sh0wie/Qwen3.8-Flash-Next-REAP-288-GGUF

## Resumen

Qwen3.8-Flash-Next-REAP-288-GGUF es una versión podada del modelo multimodal Qwen3.8-Flash-Next de Qwen, convertida a formato GGUF para su ejecución con llama.cpp y herramientas derivadas como Ollama o LM Studio. El autor, sh0wie, ha aplicado la técnica de poda de expertos REAP (Redundancy Elimination via Adaptive Pruning) reduciendo el número de expertos por capa de 512 a 288 en la arquitectura MoE, y posteriormente ha cuantizado los pesos directamente desde la versión bf16 en un solo paso para evitar la pérdida acumulada de precisión.

El modelo resultante mantiene la mayor parte de las capacidades del original, con una puntuación de 91,5% en HumanEval frente al 93,9% del modelo sin podar, a la vez que reduce significativamente el tamaño de los archivos y los requisitos de memoria. Está pensado para desarrolladores que necesitan ejecutar un modelo de la clase 124B parámetros en hardware local con cuantización, manteniendo un equilibrio entre calidad y eficiencia. La licencia es la Qwen Community License 1.0, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE híbrida (Gated DeltaNet + Gated Attention), basada en Qwen4 |
| Parametros totales | 124.068.144.000 (~124B) |
| Parametros activos | 6B por token (según documentación del modelo base) |
| Longitud de contexto | 262.144 tokens (262K) |
| Tipos de cuantizacion | Q4_K_M (78 GB), Q5_K_M (87 GB), Q8_0 (116 GB) |
| Idiomas soportados | no disponible (el modelo base es multilingüe, pero no se especifica la lista) |
| Licencia | Qwen Community License 1.0 |
| Formato de pesos | GGUF (safetensors disponible en la versión bf16) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-Flash-Next emplea una arquitectura MoE híbrida que combina Gated DeltaNet y Gated Attention, un diseño introducido originalmente en Qwen3-Next y que ha sido utilizado en las series Qwen3.5, Qwen3.6, Qwen3.7 y Qwen3.8. Esta arquitectura sirve como avance de la que se usará en Qwen4. El modelo es multimodal, con capacidad de procesamiento de visión además de texto.

La versión REAP-288 aplica poda de expertos: de los 512 expertos por capa del modelo original, se conservan 288. La selección de expertos se calibró sobre aproximadamente 686.000 tokens de tráfico de codificación agéntica (agentic-coding), lo que significa que la poda está optimizada para tareas de generación y razonamiento de código. La conversión a GGUF se realizó directamente desde los pesos bf16 en una única operación de cuantización, evitando la doble pérdida que supondría cuantizar un modelo ya cuantizado.

## Capacidades

- Generación de texto y razonamiento complejo, con soporte de modo de pensamiento (thinking mode) heredado del modelo base.
- Generación de código y asistencia en programación, con buen rendimiento en HumanEval (91,5% en la versión podada).
- Capacidades multimodales: procesamiento de entrada de visión (imágenes), aunque no se ha verificado tras la poda.
- Soporte de tool calling y function calling, integrable en pipelines de agentes.
- Razonamiento multi-paso y planificación, adecuado para tareas agénticas.
- Multilingüismo: el modelo base soporta múltiples idiomas, aunque la lista exacta no está disponible en la documentación consultada.
- Ventana de contexto larga de 262K tokens, útil para documentos extensos y conversaciones multi-turno.

## Casos de uso

- Asistente de programación en entornos de desarrollo: el modelo puede generar código, refactorizar funciones y añadir validaciones de entrada, como se muestra en el ejemplo del README. Su calibración en tráfico agentic-coding lo hace especialmente adecuado para esta tarea.
- Agente autónomo de codificación: gracias a su soporte de tool calling y razonamiento multi-paso, puede integrarse en sistemas que ejecutan tareas de desarrollo de forma autónoma, como la resolución de issues o la generación de pull requests.
- Análisis de código legacy: con su contexto de 262K tokens, puede procesar repositorios completos o archivos muy extensos para identificar patrones, vulnerabilidades o proponer mejoras.
- Chat conversacional con contexto largo: su ventana de 262K permite mantener conversaciones muy largas con memoria completa del historial, útil para asistentes de atención al cliente o tutores.
- Procesamiento de documentos técnicos multimodales: al aceptar entrada de visión, puede analizar diagramas, capturas de pantalla o documentación con imágenes, aunque esta capacidad no está verificada tras la poda.
- Despliegue local en servidores privados: al estar en formato GGUF, puede ejecutarse con llama.cpp en hardware propio sin depender de APIs externas, lo que garantiza privacidad de los datos.

## Benchmarks y rendimiento

El autor reporta únicamente el resultado de HumanEval en la versión podada, medido sobre la línea MLX 4-bit:

| Benchmark | Modelo podado (REAP-288) | Modelo completo (sin podar) |
|---|---|---|
| HumanEval (pass@1) | 91,5% (149/164) | 93,9% |

No se han publicado resultados de otros benchmarks (MMLU, GSM8K, etc.) en la información disponible. El autor advierte que la calibración se realizó sobre un dominio específico (codificación agéntica) y que los resultados no deben extrapolarse a dominios generales.

## Requisitos de hardware

- VRAM estimada para inferencia: el archivo Q4_K_M ocupa 78 GB, por lo que se necesita al menos esa cantidad de memoria disponible entre GPU y RAM unificada. En la práctica, con overhead de contexto y KV cache, se recomienda un mínimo de 90-100 GB de memoria total.
- GPU recomendadas: no cabe en una sola GPU de consumo. Se necesitan configuraciones multi-GPU, por ejemplo 2x A100 80GB, 4x RTX 4090 24GB, o 2x RTX 6000 Ada 48GB. También puede ejecutarse en Apple Silicon con memoria unificada (por ejemplo, Mac Studio con 128GB o más).
- Opciones de despliegue: llama.cpp (llama-server o llama-cli), Ollama (compatible con GGUF), LM Studio, y cualquier herramienta que soporte GGUF.
- Latencia y throughput: no se han publicado datos específicos para esta versión podada. Al reducir el número de expertos activos, se espera una mejora en velocidad respecto al modelo completo, pero no hay cifras confirmadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | HumanEval | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next (original) | ~125B MoE | 262K | 93,9% | Qwen Community 1.0 | safetensors, GGUF |
| Qwen3.8-Flash-Next-REAP-288 (este) | ~124B MoE (288 expertos) | 262K | 91,5% | Qwen Community 1.0 | GGUF |
| Qwen3-235B-A22B (similar en clase) | 235B MoE | 131K | no disponible | Apache 2.0 | safetensors, GGUF |

La comparativa se limita a modelos de la misma familia o clase. No se dispone de datos de rendimiento de otros modelos comparables en las mismas condiciones para establecer una comparación justa.

## Limitaciones y advertencias

- La poda se calibró sobre un dominio específico (codificación agéntica). En dominios alejados del código, la degradación de rendimiento puede ser mayor que la observada en HumanEval.
- La capacidad de visión no ha sido probada tras la poda; puede presentar degradaciones no documentadas.
- Los resultados de benchmarks provienen de una única ejecución, sin intervalos de confianza.
- La licencia Qwen Community License 1.0 tiene restricciones de uso comercial que deben revisarse antes de desplegar el modelo en producción.
- El tamaño de los archivos (78-116 GB) requiere hardware de gama alta; no es adecuado para equipos de consumo estándar.
- Al ser una versión podada, puede presentar comportamientos ligeramente diferentes al modelo original en tareas de razonamiento complejo o generación creativa.

## Enlaces

- Repositorio GGUF: https://huggingface.co/sh0wie/Qwen3.8-Flash-Next-REAP-288-GGUF
- Versión bf16 (fuente): https://huggingface.co/sh0wie/Qwen3.8-Flash-Next-REAP-288-bf16
- Versión MLX 4-bit: https://huggingface.co/sh0wie/Qwen3.8-Flash-Next-REAP-288-MLX-4bit
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Repositorio GitHub del modelo base: https://github.com/QwenLM/Qwen3.8-Flash-Next/
- Guía de ejecución local (unsloth): https://unsloth.ai/docs/models/qwen3.8-next
- Guía de ejecución con GGUF (atomic.chat): https://atomic.chat/blog/guides/how-to-run-qwen-3-8-flash-next-locally
