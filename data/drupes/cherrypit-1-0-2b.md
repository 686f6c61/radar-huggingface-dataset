# DRUPEs/CherryPit-1.0-2B

## Resumen

CherryPit-1.0-2B es un modelo de lenguaje causal de aproximadamente 2.500 millones de parámetros desarrollado por DRUPEs (Dense Representation & Unified Parameter Encoding Systems), un proyecto centrado en modelos compactos que puedan ejecutarse en hardware local. Se trata de un ajuste fino del modelo base MiniCPM5-2B de OpenBMB, concebido como una actualización directa ("drop-in upgrade") que mantiene el mismo tamaño, arquitectura y velocidad que el modelo original, pero con mejoras concentradas en generación de código.

El modelo emplea una arquitectura estándar de tipo Llama con 381 tensores y una longitud de contexto de 128K tokens (131.072), lo que resulta notable para su categoría de tamaño. Su propuesta de valor es ofrecer capacidades de codificación, razonamiento y tool calling en un paquete de ~2B parámetros desplegable en dispositivos de consumo, compitiendo en un nicho donde el contexto largo y la eficiencia de inferencia son determinantes.

La relevancia actual del modelo radica en su enfoque "on-device": pesos en bf16 safetensors para transformers y vLLM, más una variante GGUF para llama.cpp, Ollama y LM Studio. Con licencia Apache 2.0 y soporte de tool calling nativo mediante su plantilla de chat, se posiciona como una opción para pipelines de código y agentes ligeros donde el coste por token y la privacidad importan.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer causal estándar tipo Llama (381 tensores) |
| Parámetros totales | 2.516.756.480 (~2,5B) |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 128K tokens (131.072) |
| Tipos de cuantización | bf16 (pesos oficiales); GGUF disponible en repositorio separado (niveles no especificados en la información disponible) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16); GGUF en repositorio alternativo |

## Arquitectura y entrenamiento

El modelo es un transformer causal denso con arquitectura estándar de tipo Llama, compuesto por 381 tensores, derivado del modelo base MiniCPM5-2B de OpenBMB mediante ajuste fino. No se especifica en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si se emplearon técnicas de RLHF, DPO o similares durante el ajuste.

La innovación principal declarada es el propio proceso de ajuste fino orientado a código, que según el autor produce una ganancia de +1,9 puntos en LiveCodeBench v6, +3,2 en MBPP+ y +1,2 en HumanEval respecto al modelo base, manteniendo la longitud media de respuesta (≈2.100 tokens por respuesta en LiveCodeBench). El modelo incorpora un modo de razonamiento ("thinking mode") que puede desactivarse mediante `enable_thinking=False` en la plantilla de chat para obtener respuestas directas y breves. La plantilla de chat integra soporte de tool calling de forma nativa.

## Capacidades

- Generación de texto conversacional en inglés.
- Generación y razonamiento sobre código: funciones, algoritmos y resolución de problemas de programación.
- Razonamiento matemático (MATH-500) y razonamiento general de múltiples pasos (BBH, CoT 0-shot).
- Tool calling / function calling mediante la plantilla de chat integrada.
- Modo de razonamiento ("thinking mode") activable o desactivable según necesidad de latencia.
- Contexto largo de hasta 128K tokens para documentos extensos o conversaciones multi-turno prolongadas.
- Capacidad de presentarse como "CherryPit" cuando no se proporciona system prompt.
- No se documentan capacidades de visión ni audio.

## Casos de uso

- Asistente de programación local: el modelo puede generar funciones y resolver problemas de código en un IDE o editor con autocompletado contextual, aprovechando su ventana de 128K tokens para incluir varios archivos del proyecto como contexto.
- Revisión de código en CI/CD: integrado mediante tool calling, puede invocarse en pipelines para sugerir correcciones o detectar patrones problemáticos antes del merge, con la ventaja de ejecutarse on-device sin enviar código a terceros.
- Atención al cliente automatizada: gestiona conversaciones multi-turno con contexto largo gracias a sus 128K tokens, adecuado para historiales extensos de tickets o sesiones de soporte.
- Agentes ligeros de múltiples pasos: su soporte de tool calling y razonamiento CoT permite construir agentes que encadenen llamadas a APIs o funciones en entornos con recursos limitados.
- Procesamiento de documentación técnica: resumen y extracción de información de manuales o repositorios extensos, aprovechando el contexto de 128K tokens en una sola pasada.
- Prototipado y experimentación en investigación: al ser un modelo de ~2B con licencia Apache 2.0 y pesos bf16, sirve como base para fine-tuning adicional o para estudiar técnicas de ajuste sobre MiniCPM5-2B.
- Despliegue en dispositivos de borde: aplicaciones de escritorio o embebidas que requieran generación de texto sin conexión, mediante los ficheros GGUF en llama.cpp, Ollama o LM Studio.

## Benchmarks y rendimiento

Resultados publicados por el autor, ejecutados en el mismo harness (pesos bf16 en vLLM, thinking mode desactivado):

| Benchmark | Configuración | MiniCPM5-2B | CherryPit-1.0-2B | Δ |
|---|---|---:|---:|---:|
| LiveCodeBench v6 (2025-01..04) | pass@1, media de 8, T=1.0 | 30,4 | 32,4 | +1,9 |
| — easy / medium / hard | | 81,7 / 27,2 / 5,0 | 84,3 / 28,8 / 6,7 | +2,6 / +1,6 / +1,7 |
| MBPP+ (EvalPlus) | greedy | 61,9 | 65,1 | +3,2 |
| HumanEval | greedy | 89,6 | 90,9 | +1,2 |
| HumanEval+ | greedy | 85,4 | 86,0 | +0,6 |
| MATH-500 | greedy | 79,4 | 79,8 | +0,4 |
| BBH | 0-shot CoT | 77,8 | 78,4 | +0,6 |
| MMLU-Pro | answer-letter scoring | 35,0 | 34,8 | −0,2 |
| HotpotQA (distractor) | F1 | 55,1 | 54,7 | −0,4 |
| HellaSwag | acc_norm | 50,5 | 49,5 | −1,0 |

## Requisitos de hardware

- VRAM estimada en bf16: aproximadamente 5 GB solo para pesos (2.516.756.480 parámetros × 2 bytes), más overhead de KV cache y activaciones; el tamaño del repositorio es de 5,0 GB.
- Con cuantización GGUF de 4 bits, la huella de pesos se reduce a un rango aproximado de 1,5–2 GB (estimación basada en el tamaño de parámetros; los niveles exactos no se detallan en la información disponible).
- GPU recomendadas: A100 o H100 para despliegues de producción con contexto largo y concurrencia; RTX 4090 o RTX 3090 para inferencia local en bf16.
- Cabe en GPU de consumo: sí, en tarjetas con al menos 8 GB de VRAM en bf16 y en GPUs con 4–6 GB usando GGUF cuantizado.
- Opciones de despliegue: transformers, vLLM (comando `vllm serve` documentado), llama.cpp, Ollama y LM Studio mediante los ficheros GGUF.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| CherryPit-1.0-2B | ~2,5B | 128K | Apache 2.0 | Hugging Face (safetensors + GGUF) |
| MiniCPM5-2B (base) | ~2B | 128K | No disponible en la información | Hugging Face |
| CherryPit-1.1-2B | ~2B | No disponible en la información | No disponible en la información | Hugging Face |

El autor indica que CherryPit-1.1-2B es más fuerte en matemáticas, coding en thinking mode y aplicaciones web, por lo que 1.0 queda como versión previa con foco en coding directo. No se dispone de datos de benchmarks de 1.1 en la información proporcionada para una comparación cuantitativa.

## Limitaciones y advertencias

- Al ser un modelo de ~2B parámetros, comparte los límites de su base: puede cometer errores factuales y generar código con bugs; se recomienda revisar la salida antes de confiar en ella.
- Las mayores ganancias se concentran en coding; las mejoras en matemáticas y razonamiento son marginales (inferiores a 1 punto en MATH-500 y BBH).
- Se observan ligeros retrocesos respecto al base en MMLU-Pro (−0,2), HotpotQA (−0,4) y HellaSwag (−1,0), lo que sugiere una especialización a costa de conocimiento general.
- Las evaluaciones se realizaron únicamente en inglés y con thinking mode desactivado; el rendimiento en otros idiomas o con razonamiento activado no está documentado.
- Soporte de idiomas limitado al inglés según la model card.
- Riesgo de alucinación inherente a los modelos de este tamaño; no se documentan mitigaciones específicas.
- Licencia Apache 2.0 permite uso comercial, pero no se documentan sesgos conocidos ni auditorías de seguridad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DRUPEs/CherryPit-1.0-2B
- Versión GGUF: https://huggingface.co/DRUPEs/CherryPit-1.0-2B-GGUF
- Versión 1.1: https://huggingface.co/DRUPEs/CherryPit-1.1-2B
- Perfil del autor DRUPEs: https://huggingface.co/DRUPEs
- Modelo base MiniCPM5-2B: https://huggingface.co/openbmb/MiniCPM5-2B
