# Argo1-OOAS/TinyLlama-1.1B-V3-EdgeTravel

## Resumen

TinyLlama-1.1B-V3-EdgeTravel es un modelo experimental desarrollado por Argo1-OOAS que extiende el modelo base TinyLlama-1.1B-Chat-v1.0 con una rama condicionada por disparadores (trigger-conditioned edge/travel branch). Solo se entrenaron 16.781.313 parámetros de esa rama, mientras que los pesos del transformer original permanecen congelados. El objetivo es permitir que un disparador contextual active un comportamiento específico durante un número configurable de tokens posteriores, opcionalmente condicionado por texto del usuario. La arquitectura es la de TinyLlama (basada en Llama 2), con 22 capas y una anchura de 2.048, y una longitud de contexto de 2.048 tokens. El modelo está pensado para investigación y experimentación, no para uso productivo, y se distribuye bajo licencia Apache 2.0.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal (basado en Llama 2, 22 capas, anchura 2.048) |
| Parametros totales | 1.116.829.697 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 2.048 tokens |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (pytorch) |

## Arquitectura y entrenamiento

El modelo parte de TinyLlama-1.1B-Chat-v1.0, cuyos pesos están congelados, y añade una rama de adaptación condicionada por disparadores (trigger-conditioned edge/travel branch). Solo se optimizan 16.781.313 parámetros de esa rama, mientras que el resto del transformer no se modifica. El entrenamiento se realizó sobre el dataset HuggingFaceTB/smol-smoltalk, con 2.000 actualizaciones de la rama y 262.144.000 presentaciones de tokens. La pérdida de validación terminal reportada es 0,5318 (perplejidad 1,7), aunque el autor aclara que se trata de una estimación de la pérdida para el objetivo de la rama, no de la perplejidad general de TinyLlama.

No se dispone de información detallada sobre el proceso de entrenamiento (número total de tokens, duración, uso de RLHF o DPO). El modelo usa código personalizado (custom-code) y está etiquetado como investigación.

## Capacidades

- Generación de texto conversacional en inglés, basado en el chat core de TinyLlama.
- Activación condicional de una rama edge/travel mediante disparadores definidos por el usuario, que puede influir en los siguientes tokens generados.
- Control del número de tokens afectados por el disparador (configurable).
- Compatibilidad con el pipeline de HuggingFace `text-generation`.
- No se han documentado capacidades de tool calling, agentes, visión, audio o razonamiento multi-paso.

## Casos de uso

- Investigación en adaptación eficiente de parámetros: el modelo sirve como banco de pruebas para estudiar cómo una rama entrenada puede modificar el comportamiento de un modelo base congelado sin reentrenar todo.
- Experimentación con control de generación por disparadores: se puede evaluar cómo un token o frase desencadena un comportamiento específico durante un número limitado de tokens, útil para estudiar mecanismos de control contextual.
- Prototipado de asistentes conversacionales ligeros: al basarse en TinyLlama, puede ejecutarse en entornos con recursos limitados y probar interacciones de chat simples.
- Evaluación de la estabilidad de generación ante contextos guiados: útil para analizar problemas de fluidez y bucles de disparo documentados en la model card.
- Pruebas de integración con frameworks de inferencia (transformers, vLLM, llama.cpp) para verificar la compatibilidad del código personalizado.
- Estudio de la pérdida de la rama y su relación con la calidad de generación: la métrica de validación específica de la rama (0,5318) puede servir para comparar configuraciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La única métrica reportada es la pérdida de validación terminal de la rama (0,5318, PPL 1,7), que no es una perplejidad general del modelo.

## Requisitos de hardware

- No se proporcionan datos específicos de VRAM o latencia en la información disponible.
- Dado que el modelo tiene 1.116 millones de parámetros, una estimación razonable para inferencia en FP16 sería de aproximadamente 2,2 GB de VRAM solo para los pesos, más overhead de activaciones y caché KV. Sin embargo, no se dispone de mediciones oficiales.
- Por su tamaño, es probable que pueda ejecutarse en GPU de consumo con 4-6 GB de VRAM, pero no hay confirmación.
- Opciones de despliegue: se puede usar con `transformers` de HuggingFace (pipeline `text-generation`), y potencialmente con `vLLM` o `llama.cpp`, aunque la rama personalizada (custom-code) podría requerir ajustes.
- No hay datos de latencia ni throughput.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| TinyLlama-1.1B-V3-EdgeTravel (este) | 1,12B | 2.048 | No publicado | Apache 2.0 | HuggingFace |
| TinyLlama-1.1B-Chat-v1.0 (base) | 1,10B | 2.048 | No publicado | Apache 2.0 | HuggingFace |
| TinyLlama-1.1B (original) | 1,10B | 2.048 | MMLU 25,5% (según paper) | Apache 2.0 | HuggingFace |
| Qwen2.5-1.5B (alternativa) | 1,54B | 32.768 | No disponible aquí | Apache 2.0 | HuggingFace |

Nota: el rendimiento del V3 no está publicado. El valor de MMLU para TinyLlama original proviene del paper (arXiv 2401.02385), pero no se puede extrapolar a este modelo modificado.

## Limitaciones y advertencias

- El modelo es experimental y no ha pasado por una evaluación amplia de seguridad o capacidad, según su propia model card.
- Una guía contextual fuerte puede dañar la fluidez o provocar bucles de disparo (trigger loops).
- No debe utilizarse como fuente fiable para decisiones de alto impacto.
- Solo soporta inglés; no hay evidencia de capacidades multilingües.
- No se han publicado resultados de benchmarks estándar, lo que impide comparar su calidad con otros modelos.
- El código personalizado (custom-code) puede requerir ajustes para integrarse con infraestructuras de inferencia estándar.
- Aunque la licencia Apache 2.0 permite uso comercial, el modelo no está preparado para producción y no se recomienda su uso en entornos críticos.

## Enlaces

- Página del modelo en HuggingFace: https://huggingface.co/Argo1-OOAS/TinyLlama-1.1B-V3-EdgeTravel
- Repositorio del proyecto TinyLlama: https://github.com/jzhang38/TinyLlama
- Paper TinyLlama (arXiv 2401.02385): https://arxiv.org/abs/2401.02385
- Modelo base TinyLlama-1.1B-Chat-v1.0: https://huggingface.co/TinyLlama/TinyLlama-1.1B-Chat-v1.0
- Dataset smol-smoltalk: https://huggingface.co/datasets/HuggingFaceTB/smol-smoltalk
- Página de TinyLlama en Ollama: https://ollama.com/library/tinyllama
