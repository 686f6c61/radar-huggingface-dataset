# akumaburn/Qwen3.8-27B-heretic

## Resumen

Qwen3.8-27B-heretic es un derivado del modelo multimodal denso Qwen/Qwen3.8-27B de Alibaba, al que se le ha aplicado una técnica de "abliteration" mediante la herramienta Heretic. Esta técnica identifica y elimina la dirección del espacio residual que media en los rechazos del modelo, de modo que el modelo deja de emitir negativas explícitas ante peticiones dañinas. El resultado es un artefacto de investigación sin alineamiento de seguridad, pensado exclusivamente para estudios de interpretabilidad, red-teaming y evaluación.

El modelo conserva la arquitectura original del Qwen3.8-27B: 27 356 millones de parámetros, atención híbrida (48 de 64 capas con atención lineal), torre de visión, cabezal MTP (decodificación especulativa) en BF16 y una ventana de contexto nativa de 262 144 tokens. No ha recibido entrenamiento adicional; es una modificación numérica de los pesos. El autor lo publica bajo licencia Apache-2.0, heredada del modelo base, y lo etiqueta como "research-only".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso híbrido (atención lineal en 48 de 64 capas) con torre de visión y cabezal MTP |
| Parametros totales | 27 356 728 560 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262 144 tokens nativos (extensible a 1M) |
| Tipos de cuantizacion | BF16 (repo principal); existe una variante INT8 W8A8 SmoothQuant publicada por el mismo autor |
| Idiomas soportados | No disponibles (no declarados en la model card) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (BF16) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B es un transformer denso con atención híbrida: 48 de sus 64 capas emplean atención lineal, lo que reduce el coste computacional del contexto largo. Incluye una torre de visión que permite entrada de imágenes y un cabezal MTP (multi-token prediction) para decodificación especulativa, conservado en BF16 en este derivado. El entrenamiento original del base incluye fases de preentrenamiento y postentrenamiento con razonamiento (thinking mode), pero la model card no detalla la composición exacta del dataset ni el número de tokens.

Este derivado no ha sido entrenado: se ha aplicado abliteration numérica con Heretic, que calcula la dirección del residual que correlaciona con los rechazos y la elimina de las proyecciones de salida de atención y MLP. Según la model card, se optimiza la divergencia KL con el modelo fuente en prompts inocuos (KL de 0.088 nats en el primer token). El resultado es una reducción de rechazos duros de 98/100 a 0/100 en un conjunto de 100 prompts dañinos, aunque persiste un 20-24 % de desviaciones suaves emergentes del chain-of-thought.

## Capacidades

- Generación de texto y razonamiento paso a paso (thinking mode) usando la plantilla de chat Qwen3.5, con razonamiento habilitado por defecto.
- Comprensión de imágenes (pipeline image-text-to-text) gracias a la torre de visión conservada del modelo base.
- Soporte de contexto largo nativo de 262 144 tokens, extensible a 1M, útil para documentos extensos y conversaciones multi-turno.
- Decodificación especulativa mediante el cabezal MTP integrado, que acelera la inferencia en hardware compatible.
- Capacidades de código, agentes y automatización de oficina heredadas del Qwen3.8-27B (según el repositorio oficial de Alibaba).
- Ausencia deliberada de rechazos: el modelo no emite negativas duras ante peticiones dañinas, ilegales o poco éticas (característica de investigación, no de producción).

## Casos de uso

- Red-teaming de modelos de lenguaje: el modelo sirve para probar sistemas de moderación y evaluar la robustez de los filtros de contenido ante salidas sin alineamiento.
- Investigación en interpretabilidad: permite estudiar cómo la dirección de rechazo afecta al comportamiento del modelo y qué mecanismos internos median en la negativa.
- Evaluación de técnicas de alineamiento: comparar el comportamiento de este modelo frente al base Qwen3.8-27B permite medir el impacto de la abliteration en la calidad de las respuestas y en la seguridad.
- Análisis de sesgos emergentes del chain-of-thought: el 20-24 % de desviaciones suaves ofrece material para estudiar cómo el razonamiento interno elude la censura direccional.
- Desarrollo de métodos de eliminación de censura: sirve como referencia para investigar nuevas técnicas de ablación direccional y sus límites.
- Benchmark de fidelidad de modelos ablacionados: la baja divergencia KL (0.088) permite validar que la abliteration no degrada significativamente el comportamiento en tareas ordinarias.

## Benchmarks y rendimiento

La model card no incluye resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) para este derivado. El autor solo reporta dos métricas específicas del proceso de abliteration:

| Metrica | Valor |
|---|---|
| Rechazos duros (100 prompts de mlabonne/harmful_behaviors) | 0 / 100 |
| Divergencia KL (source ‖ este modelo) en primer token | 0.088 nats |

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada en BF16: aproximadamente 55 GB solo para los pesos (27 356 728 560 parámetros × 2 bytes), más overhead de KV cache y activaciones; se recomienda una GPU con 60-80 GB (A100 80GB, H100 80GB) para inferencia cómoda.
- Con la variante INT8 W8A8 SmoothQuant, los pesos ocupan unos 28 GB, lo que permite ejecutarlo en GPUs de 32 GB o 40 GB (por ejemplo, A100 40GB, L40S, RTX 6000 Ada).
- No cabe en GPUs de consumo de 24 GB (RTX 4090) en BF16 ni INT8 sin cuantización más agresiva (GGUF de 4 bits podría caber, pero no se ofrece oficialmente).
- Opciones de despliegue: transformers con `device_map="auto"` (como en el ejemplo de la model card), vLLM para servidores de alta concurrencia, y la variante INT8 para Ampere con TensorRT-LLM o vLLM con Soporte W8A8.
- La presencia del cabezal MTP permite decodificación especulativa, que puede reducir la latencia por token en hardware compatible (por ejemplo, en AMD Ryzen AI Max y GPUs Radeon, según el anuncio de AMD).
- Para uso en CPU o hardware de baja gama, se requiere cuantización adicional no publicada por el autor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Qwen3.8-27B (base) | 27 356 M | 262 144 | Apache-2.0 | Modelo original con alineamiento intacto; rechaza 98/100 prompts dañinos |
| Qwen3.8-27B-heretic (este) | 27 356 M | 262 144 | Apache-2.0 | Abliterated; 0/100 rechazos duros; KL 0.088 |
| Qwen3.8-27B-heretic-SmoothQuant-W8A8-INT8 | 27 356 M | 262 144 | Apache-2.0 | Misma abliteration, cuantizado a 8 bits para inferencia rápida |

No se dispone de datos de rendimiento comparativo en tareas estándar. La comparación relevante es en comportamiento de rechazo y divergencia de distribución, que ya se ha indicado.

## Limitaciones y advertencias

- **Seguridad eliminada deliberadamente**: el modelo responde a peticiones dañinas, ilegales, peligrosas o poco éticas sin moderación. No debe desplegarse en entornos donde pueda alcanzar a personas que no hayan consentido recibir contenido sin filtrar.
- **Riesgo de desviaciones suaves**: aunque no hay rechazos duros, el modelo aún produce desviaciones suaves en el 20-24 % de los prompts dañinos, redirigiendo la respuesta hacia el inverso legal de la petición. Esto no es eliminable mediante ablación direccional.
- **Alucinaciones y errores factuales**: al ser un modelo de lenguaje, puede generar información falsa o inventada, especialmente en temas especializados. La abliteration no corrige este comportamiento.
- **Licencia y responsabilidad**: aunque la licencia es Apache-2.0, el autor declina toda responsabilidad por el uso del modelo. El usuario es responsable del cumplimiento de las leyes aplicables (por ejemplo, normativas sobre contenido ilegal en la UE).
- **Idiomas no declarados**: la model card no especifica los idiomas soportados; el modelo base hereda las capacidades multilingües de Qwen, pero no hay garantía formal.
- **Sesgos del modelo base**: los sesgos presentes en el Qwen3.8-27B original se mantienen, y la eliminación de rechazos puede amplificar la expresión de sesgos dañinos.
- **Uso exclusivo para investigación**: el autor lo etiqueta como "research-only"; no es apto para producción ni para aplicaciones comerciales sin una evaluación de riesgos exhaustiva.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/akumaburn/Qwen3.8-27B-heretic
- Variante INT8 W8A8: https://huggingface.co/akumaburn/Qwen3.8-27B-heretic-SmoothQuant-W8A8-INT8
- Modelo base Qwen/Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio oficial de Qwen3.8-27B en GitHub: https://github.com/AlibabaCloud-Official/Qwen3.8-27B
- Herramienta Heretic: https://github.com/p-e-w/heretic
- Guía de despliegue en AMD (LM Studio, Lemonade): https://www.amd.com/en/blogs/2026/run-qwen-3-8-27b-on-amd-ryzen-ai-max-and-radeon-graphics-cards-day-0.html
- Recetas vLLM para Qwen3.8-27B: https://recipes.vllm.ai/Qwen/Qwen3.8-27B
