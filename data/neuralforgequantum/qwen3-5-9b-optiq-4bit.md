# neuralforgequantum/Qwen3.5-9B-OptiQ-4bit

## Resumen

Qwen3.5-9B-OptiQ-4bit es una cuantización de precisión mixta del modelo Qwen3.5-9B, desarrollada por mlx-community con la herramienta mlx-optiq. Está diseñada específicamente para ejecutarse de forma eficiente en Apple Silicon mediante el framework MLX, sin necesidad de PyTorch ni infraestructura en la nube. El modelo resuelve el problema de desplegar un LLM de 9 mil millones de parámetros en hardware de consumo, reduciendo el tamaño en disco a aproximadamente 6,6 GB y manteniendo un rendimiento cercano al modelo original.

La cuantización emplea un análisis de sensibilidad basado en divergencia KL sobre una mezcla de calibración de seis dominios (prosa, razonamiento, código, agente, tool-calling e instrucciones con restricciones). Las capas sensibles se asignan a 8 bits y las robustas a 4 bits, con un tamaño final similar al de una cuantización uniforme de 4 bits pero con mejores resultados en benchmarks. Además, incluye una cabeza de predicción multi-token (MTP) que permite decodificación especulativa con una aceleración de aproximadamente 1,4×.

El modelo se distribuye bajo licencia Apache 2.0, heredada del modelo base, y está disponible en formato safetensors compatible con MLX. Es relevante para desarrolladores que buscan ejecutar un LLM de alto rendimiento en Macs con Apple Silicon, ya sea para prototipado, aplicaciones locales o integración en flujos de trabajo de agentes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3.5-9B) |
| Parametros totales | 2.371.575.024 (según safetensors del modelo cuantizado; el modelo base tiene 9B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4-bit y 8-bit mixto (132 capas a 8-bit, 116 a 4-bit, grupo de 64) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

Qwen3.5-9B-OptiQ-4bit es una versión cuantizada del modelo Qwen3.5-9B, que sigue una arquitectura Transformer estándar con atención de múltiples cabezas y capas de feed-forward. La cuantización no implica un entrenamiento adicional, sino una conversión de precisión mediante mlx-optiq, que utiliza un análisis de sensibilidad por capa basado en divergencia KL. El proceso asigna 8 bits a las capas más sensibles (132 capas) y 4 bits a las robustas (116 capas), con un tamaño de grupo de 64 para la cuantización por grupos. La calibración se realiza sobre 40 muestras por dominio en seis dominios distintos, y se utiliza una referencia bf16 para determinar la sensibilidad.

El modelo incluye un módulo adicional `mtp.safetensors` que implementa una cabeza de predicción multi-token (MTP), diseñada para decodificación especulativa. Esta cabeza permite una aceleración de decodificación de aproximadamente 1,4× con una tasa de aceptación del 70% a profundidad 2, según la documentación. No se detallan los datos de entrenamiento del modelo base, pero se sabe que Qwen3.5-9B pertenece a la familia Qwen3.5 de Alibaba, conocida por su soporte multilingüe y capacidades de razonamiento.

## Capacidades

- Generación de texto en lenguaje natural con coherencia y fluidez.
- Razonamiento lógico y matemático, como lo indican los resultados en GSM8K (81,7%) y MMLU (69,1%).
- Generación de código, con un 81,1% en HumanEval pass@1.
- Soporte de tool calling y function calling, evidenciado por el benchmark BFCL-V3 (91,0% en llamadas simples).
- Capacidad de seguir instrucciones complejas, con 71,2% en IFEval.
- Recuperación de información en contextos largos, aunque con limitaciones (25,0% en HashHop).
- Compatible con flujos de trabajo de agentes gracias al soporte de ejecución de Python en sandbox (según la documentación de mlx-optiq).
- Optimizado para Apple Silicon mediante MLX, con decodificación especulativa opcional.

## Casos de uso

- Inferencia local en Macs con Apple Silicon: el modelo está diseñado para ejecutarse eficientemente en chips M1/M2/M3 con MLX, permitiendo a desarrolladores probar y desplegar un LLM de 9B sin GPU dedicada ni conexión a la nube.
- Asistentes de conversación en aplicaciones de escritorio: gracias a su tamaño reducido (6,6 GB en disco), puede integrarse en aplicaciones nativas de macOS para ofrecer respuestas en tiempo real sin latencia de red.
- Generación de código asistida en entornos de desarrollo: con un 81,1% en HumanEval, es adecuado para autocompletado de código y sugerencias en editores, especialmente en entornos donde la privacidad del código es crítica.
- Automatización de tareas de agentes: el soporte de tool calling y la capacidad de seguir instrucciones con restricciones lo hacen útil para construir agentes que interactúan con APIs, ejecutan comandos o gestionan flujos de trabajo locales.
- Prototipado rápido de aplicaciones de IA: al ser un modelo cuantizado con licencia Apache 2.0, se puede integrar en entornos de desarrollo sin costes de licencia y sin necesidad de infraestructura especializada.
- Investigación en eficiencia de modelos: la metodología de cuantización mixta por sensibilidad puede ser estudiada y replicada para otros modelos, sirviendo como referencia para trabajos académicos o experimentos de compresión.

## Benchmarks y rendimiento

La model card proporciona una comparativa entre la cuantización OptiQ y una cuantización uniforme de 4 bits, evaluada con seis métricas (Capability Score). Los resultados son los siguientes:

| Métrica | OptiQ | Uniform 4-bit | Δ |
|---|---:|---:|---:|
| MMLU (5-shot, 1000 muestras) | 69,1% | 68,6% | +0,5 |
| GSM8K (1000 muestras, 3-shot CoT) | 81,7% | 81,7% | +0,0 |
| IFEval (set completo, estricto) | 71,2% | 71,0% | +0,2 |
| BFCL-V3 simple (200 llamadas) | 91,0% | 92,0% | -1,0 |
| HumanEval (164 problemas, pass@1) | 81,1% | 78,7% | +2,4 |
| HashHop (recuperación de contexto largo) | 25,0% | 26,0% | -1,0 |
| **Capability Score** (media de 6) | **69,85** | **69,66** | **+0,19** |
| KL vs uniform-4-bit (media / p95) | 0,1937 / 1,0790 | — | — |
| Tamaño en disco | 6,6 GB | 5,5 GB | +1,1 |

No se han publicado resultados comparativos con otros modelos de tamaño similar fuera de esta comparación interna.

## Requisitos de hardware

- El modelo está optimizado para Apple Silicon (M1, M1 Pro/Max/Ultra, M2, M3 y posteriores) y requiere el framework MLX.
- Tamaño en disco de 6,6 GB, lo que implica un uso de memoria VRAM similar durante la inferencia (más overhead de runtime).
- Se puede ejecutar en Macs con al menos 8 GB de RAM unificada, aunque se recomiendan 16 GB para un rendimiento fluido con contexto largo.
- No es compatible con GPUs NVIDIA ni AMD de forma nativa; para otros hardware se necesitaría convertir el modelo a otro formato (por ejemplo, GGUF).
- Para decodificación especulativa con MTP, se requiere usar `optiq serve --mtp`, que añade un pequeño overhead de memoria adicional.
- Latencia y throughput no especificados; dependen del chip concreto y de la longitud del contexto.

## Comparativa con modelos similares

No se dispone de datos comparativos directos con otras cuantizaciones de Qwen3.5-9B o con modelos de tamaño similar (por ejemplo, Llama 3.1 8B, Mistral 7B) en la información proporcionada. La comparativa interna con la cuantización uniforme de 4 bits muestra una ligera mejora en el Capability Score (69,85 vs 69,66) a costa de un tamaño en disco ligeramente mayor (6,6 GB vs 5,5 GB). Para una comparación justa con otros modelos, se necesitarían benchmarks externos adicionales.

## Limitaciones y advertencias

- Al ser una cuantización de 4 bits, puede experimentar pérdida de precisión en tareas complejas de razonamiento o generación de código, aunque los benchmarks muestran una degradación mínima respecto al modelo completo.
- El modelo está diseñado exclusivamente para Apple Silicon; no se puede ejecutar directamente en GPUs NVIDIA o AMD sin una conversión previa a otro formato.
- La longitud de contexto no está documentada en la información disponible; se recomienda verificar la documentación del modelo base Qwen3.5-9B para conocer el límite real.
- Los resultados en recuperación de contexto largo (HashHop) son bajos (25%), lo que sugiere que el modelo puede tener dificultades con tareas que requieren atender a información distante dentro de la ventana de contexto.
- La licencia Apache 2.0 permite uso comercial, pero se deben respetar los términos de la licencia y las atribuciones correspondientes.
- El modelo no incluye capacidades multimodales (visión, audio) a pesar de que el nombre "Qwen3.5" podría sugerir lo contrario; es exclusivamente de texto.
- La herramienta mlx-optiq y el modelo asociado son proyectos de la comunidad; su mantenimiento y soporte a largo plazo no están garantizados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/neuralforgequantum/Qwen3.5-9B-OptiQ-4bit (también disponible como mlx-community/Qwen3.5-9B-OptiQ-4bit)
- Proyecto mlx-optiq: https://mlx-optiq.com/
- Guía de la familia Qwen3.5: https://mlx-optiq.com/docs/qwen3.5
- Paquete PyPI de mlx-optiq: https://pypi.org/project/mlx-optiq/
- Blog sobre la mezcla de calibración: https://mlx-optiq.com/blog/calibration-mix
- Blog sobre el framework de evaluación: https://mlx-optiq.com/blog/eval-framework
- Modelo base Qwen3.5-9B: https://huggingface.co/Qwen/Qwen3.5-9B
