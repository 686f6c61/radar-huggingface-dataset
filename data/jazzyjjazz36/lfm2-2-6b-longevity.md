# Jazzyjjazz36/LFM2-2.6B-Longevity

## Resumen

LFM2-2.6B-Longevity (L-LFM2-2.6B) es un ajuste fino de parámetros completos del modelo base LiquidAI/LFM2-2.6B, desarrollado conjuntamente por Insilico Medicine y Liquid AI. El modelo está especializado en biología del envejecimiento y datos multi-ómicos y clínicos heterogéneos, y acompaña al estudio "An Open Benchmark and Language Models for AI in Aging Biology" (Zhavoronkov et al., 2026). Con 2.569.272.320 parámetros, se posiciona como una alternativa compacta y de dominio específico frente a modelos generalistas de mayor tamaño, con un contexto de 32.768 tokens.

La arquitectura subyacente es un modelo Liquid híbrido con puertas multiplicativas y convoluciones cortas, una propuesta que se aleja del transformer denso clásico y busca eficiencia en inferencia y despliegue en dispositivos. El ajuste se realizó sobre el corpus L-LLM de biología del envejecimiento, con un formato ChatML y una plantilla de "thinking dinámico" que permite alternar entre modos de respuesta mediante los sufijos `/think` y `/no_think` en el turno del usuario.

Este checkpoint es relevante para investigadores que necesitan un modelo pequeño, desplegable en hardware modesto y afinado para tareas biomédicas concretas como interpretación de datos genómicos, proteómicos y clínicos, comparación de casos clínicos y razonamiento sobre resultados de enriquecimiento de conjuntos de genes (GSEA). Su licencia LFM1.0 y su integración con Transformers, vLLM, SGLang, llama.cpp, MLX y LM Studio facilitan su evaluación y puesta en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Liquid híbrida con puertas multiplicativas y convoluciones cortas |
| Parametros totales | 2.569.272.320 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens |
| Tipos de cuantizacion | no disponible (pesos en safetensors; soporte de cuantización vía llama.cpp, MLX y otros frameworks) |
| Idiomas soportados | Inglés |
| Licencia | LFM1.0 (license_name: lfm1.0) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de LiquidAI/LFM2-2.6B, un modelo Liquid híbrido que combina puertas multiplicativas con convoluciones cortas en lugar de una pila de atención transformer convencional. Esta arquitectura está diseñada para reducir el coste computacional y de memoria en inferencia, manteniendo un contexto de 32.768 tokens. El checkpoint L-LFM2-2.6B se obtuvo mediante ajuste fino supervisado de parámetros completos (full-parameter SFT) sobre el corpus L-LLM, que abarca datos de biología del envejecimiento procedentes de fuentes multi-ómicas y clínicas. No se especifica en la información disponible el número de tokens de entrenamiento ni la composición exacta del dataset, aunque se remite a LongevityBench para más detalles.

El entrenamiento empleó prompts en formato ChatML con una plantilla de thinking dinámico: los turnos de usuario se sufijan con `/think` o `/no_think` para seleccionar el modo de respuesta en inferencia. No se documenta en la información proporcionada el uso de RLHF, DPO u otras técnicas de alineación posteriores al SFT. La familia incluye también un modelo de 1.2B parámetros (LFM2-1.2B-Longevity), lo que permite elegir entre dos tamaños según las restricciones de despliegue.

## Capacidades

- Generación de texto y razonamiento especializado en biología del envejecimiento, incluyendo interpretación de datos genómicos, proteómicos y clínicos.
- Razonamiento sobre casos clínicos comparativos, como la evaluación de intervalos libres de progresión entre pacientes a partir de datos de estadificación y resultados de GSEA.
- Modo de thinking dinámico seleccionable en inferencia mediante los sufijos `/think` y `/no_think` en el turno del usuario.
- Formato conversacional ChatML compatible con `tokenizer.apply_chat_template()`.
- Capacidades multilingües limitadas al inglés según la model card.
- No se documenta en la información disponible soporte explícito de tool calling, function calling, agentes multi-paso, visión ni audio.

## Casos de uso

- Interpretación de resultados de GSEA y análisis de enriquecimiento de pathways: el modelo puede recibir resultados de análisis de expresión génica diferencial y generar interpretaciones en lenguaje natural sobre su relevancia biológica, gracias a su ajuste sobre datos multi-ómicos.
- Comparación de casos clínicos oncológicos: con contexto de 32.768 tokens, puede procesar descripciones completas de estadificación (TNM, Clark level, ulceración) y datos moleculares de varios pacientes para responder preguntas comparativas sobre pronóstico o progresión.
- Asistencia en investigación sobre envejecimiento: sirve como componente de generación en pipelines que resumen literatura y datos experimentales sobre hallmarks of aging, reduciendo el coste frente a modelos generalistas de mayor tamaño.
- Extracción y estructuración de información biomédica: puede transformar registros clínicos y anotaciones multi-ómicas en resúmenes estructurados para su posterior revisión por especialistas.
- Despliegue en entornos con recursos limitados: al tener 2.6B parámetros y soporte en llama.cpp, MLX y LM Studio, puede ejecutarse en estaciones de trabajo o portátiles para prototipado de herramientas biomédicas sin depender de infraestructura GPU de datacenter.
- Evaluación comparativa de modelos de dominio: sirve como referencia en la benchmark LongevityBench para medir el rendimiento de otros modelos en tareas de biología del envejecimiento.
- Generación de respuestas en modo rápido o razonado: el modo `/no_think` permite respuestas de baja latencia para consultas simples, mientras que `/think` habilita razonamiento extendido en preguntas complejas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 5,1 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, se recomienda al menos 8-10 GB para contexto moderado.
- En cuantización de 8 bits, los pesos ocuparían alrededor de 2,6 GB; en 4 bits, aproximadamente 1,3 GB (estimaciones teóricas a partir del número de parámetros, no verificadas en la información disponible).
- GPU recomendadas: no se especifican en la información disponible; por tamaño, cabe en GPUs de consumo como RTX 3060 de 12 GB, RTX 4070, RTX 4090, así como en A100 y H100 para despliegues de mayor throughput.
- Cabe en GPU de consumo: sí, previsiblemente en modelos con 8 GB o más de VRAM en bfloat16, y en GPUs con 4-6 GB usando cuantización.
- Opciones de despliegue documentadas: Transformers (>=5.1.0), vLLM, SGLang, llama.cpp, MLX y LM Studio.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| LFM2-2.6B-Longevity | 2,57B | 32.768 | LFM1.0 | Hugging Face | Ajuste de dominio en biología del envejecimiento |
| LFM2-1.2B-Longevity | no disponible | no disponible | LFM1.0 | Hugging Face | Versión compacta de la misma familia |
| LiquidAI/LFM2-2.6B | 2,57B | 32.768 | LFM1.0 | Hugging Face | Modelo base generalista sin ajuste de dominio |

No se dispone en la información proporcionada de datos de rendimiento comparativo entre estos modelos ni con alternativas de otros desarrolladores.

## Limitaciones y advertencias

- El modelo está ajustado específicamente para biología del envejecimiento; su rendimiento en dominios generales puede degradarse respecto al modelo base.
- Riesgo de alucinación en la generación de interpretaciones biomédicas; no debe usarse como sustituto del criterio clínico profesional.
- Idiomas soportados limitados al inglés según la model card; no se garantiza un rendimiento adecuado en castellano u otros idiomas.
- La licencia LFM1.0 es una licencia "other" que puede imponer restricciones al uso comercial; es necesario revisar el archivo LICENSE antes de desplegar en producción.
- No se documentan en la información disponible sesgos conocidos, datos de evaluación de seguridad ni resultados de benchmarks que permitan validar su fiabilidad.
- El repositorio muestra 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación comunitaria.
- El identificador del repositorio (Jazzyjjazz36) no coincide con la organización oficial LiquidAI citada en la model card; conviene verificar la procedencia del checkpoint antes de usarlo.
- No se especifican requisitos de versión de Transformers más allá de `>=5.1.0`, lo que puede limitar la compatibilidad con entornos existentes.

## Enlaces

- Hugging Face: https://huggingface.co/Jazzyjjazz36/LFM2-2.6B-Longevity
- Modelo base: https://huggingface.co/LiquidAI/LFM2-2.6B
- Modelo hermano 1.2B: https://huggingface.co/LiquidAI/LFM2-1.2B-Longevity/
- Dataset LongevityBench: https://huggingface.co/datasets/insilicomedicine/longebench
- Documentación Liquid AI: https://docs.liquid.ai/lfm/getting-started/welcome
- Plantilla de chat: https://docs.liquid.ai/lfm/key-concepts/chat-template
- Inferencia con Transformers: https://docs.liquid.ai/lfm/inference/transformers
- Inferencia con vLLM: https://docs.liquid.ai/lfm/inference/vllm
- Inferencia con SGLang: https://docs.liquid.ai/deployment/gpu-inference/sglang
- Inferencia con llama.cpp: https://docs.liquid.ai/lfm/inference/llama-cpp
- Inferencia con MLX: https://docs.liquid.ai/lfm/inference/mlx
- LM Studio: https://docs.liquid.ai/deployment/on-device/lm-studio
- Insilico Medicine: https://insilico.com
- Liquid AI: https://www.liquid.ai
- Discord de Liquid AI: https://discord.com/invite/liquid-ai
- Paper de referencia: arXiv:2511.23404
