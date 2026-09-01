# kon172verma/intent-classifier

## Resumen

El repositorio `kon172verma/intent-classifier` contiene los artefactos de release de un proyecto de clasificación de intenciones (intent classification) desarrollado por Konark Verma. Incluye dos modelos fine-tuneados a partir de Qwen3-0.6B y Llama-3.2-1B, ambos transformers decoder-only de tamaño reducido, optimizados para la tarea de clasificación de texto. El repositorio se limita a los artefactos finales: checkpoints completos en safetensors, exportaciones GGUF para llama.cpp y exportaciones ONNX para backends de inferencia como ONNX Runtime, CoreML o TensorRT.

La relevancia de este proyecto radica en ofrecer modelos ligeros y listos para producción en tareas de clasificación de intenciones, con soporte para múltiples formatos de despliegue. Al estar basados en arquitecturas modernas y de bajo coste computacional, son adecuados para entornos con recursos limitados, como CPUs o GPUs de gama media. La licencia Apache 2.0 permite uso comercial sin restricciones adicionales.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (basado en Qwen3-0.6B y Llama-3.2-1B) |
| Parametros totales | 0.6B (Qwen3) y 1B (Llama-3.2) |
| Parametros activos | no aplica (modelos densos) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF: Q4_K_M, Q6_K, Q8_0, F16; ONNX: fp16, int8 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, GGUF, ONNX |

## Arquitectura y entrenamiento

Ambos modelos parten de arquitecturas transformer decoder-only estándar: Qwen3-0.6B y Llama-3.2-1B. Han sido fine-tuneados específicamente para clasificación de intenciones, aunque no se proporcionan detalles sobre el dataset de entrenamiento, el número de tokens, ni el proceso de ajuste (por ejemplo, si se usó supervisión humana o RLHF). La model card indica que los checkpoints son "merged full-weight", es decir, pesos completos fusionados, listos para inferencia o para un fine-tuning adicional.

La principal innovación técnica del repositorio es la exportación a múltiples formatos de inferencia: safetensors para Transformers, GGUF para llama.cpp y ONNX para runtime backends. Esto facilita el despliegue en entornos heterogéneos, desde servidores con GPUs hasta dispositivos edge con CPU.

## Capacidades

- Clasificación de intenciones en texto: identifica la intención subyacente de una frase o consulta (por ejemplo, comprar, reclamar, preguntar, etc.).
- Soporte de inferencia en múltiples backends: Transformers, llama.cpp (vía GGUF) y ONNX Runtime (vía ONNX).
- Modelos de tamaño reducido (0.6B y 1B) que permiten inferencia rápida en CPU y GPU de baja gama.
- No se documentan capacidades adicionales como tool calling, agentes, razonamiento multi-paso o soporte multilingüe explícito.

## Casos de uso

- Asistentes virtuales y chatbots: clasificar la intención del usuario en cada turno para enrutar la conversación hacia el flujo adecuado (por ejemplo, "quiero cancelar mi pedido" → intención de cancelación).
- Atención al cliente automatizada: identificar si una consulta es una queja, una solicitud de información o una compra, permitiendo priorizar y derivar a agentes humanos cuando sea necesario.
- Enrutamiento de tickets en sistemas de soporte: asignar automáticamente cada ticket a un departamento o cola según la intención detectada (facturación, soporte técnico, ventas).
- Análisis de feedback de usuarios: clasificar comentarios o reseñas en categorías de intención (sugerencia, problema, elogio) para extraer insights accionables.
- Automatización de respuestas en redes sociales: detectar la intención de mensajes entrantes (pregunta, spam, solicitud) para activar respuestas automáticas o alertar a moderadores.
- Preprocesamiento en pipelines de NLP: como etapa de clasificación previa a otros módulos (por ejemplo, extracción de entidades o generación de respuestas) en sistemas conversacionales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de métricas como exactitud, F1, MMLU, HumanEval o GSM8K para estos modelos fine-tuneados.

## Requisitos de hardware

- Al ser modelos de 0.6B y 1B parámetros, la VRAM necesaria es baja. Con cuantización Q4_K_M, el modelo de 0.6B ocupa aproximadamente 0.4 GB y el de 1B alrededor de 0.7 GB, por lo que caben en GPUs consumer como una GTX 1060 o incluso en CPUs modernas.
- GPUs recomendadas: cualquier GPU con al menos 2 GB de VRAM para inferencia en FP16; para cuantización GGUF, se puede ejecutar en CPU con llama.cpp sin necesidad de GPU.
- Opciones de despliegue: Transformers (Python), llama.cpp (C++), ONNX Runtime (C++, Python, C#), y herramientas como Ollama o vLLM (aunque vLLM no es necesario para modelos tan pequeños).
- Latencia y throughput: no se proporcionan datos medidos. En una CPU moderna, se esperan latencias de decenas de milisegundos por inferencia para el modelo de 0.6B en cuantización Q4.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables específicos en el mismo repositorio o en la documentación. Existen otros clasificadores de intención basados en BERT o DistilBERT, pero no se pueden comparar sin datos de rendimiento. Se indica "no disponible".

## Limitaciones y advertencias

- No se documentan sesgos específicos, pero al ser modelos pequeños pueden tener una comprensión limitada de matices lingüísticos, ironía o contextos complejos.
- Riesgo de errores de clasificación en entradas ambiguas o fuera del dominio de entrenamiento; se recomienda validar con datos propios.
- La longitud de contexto no está especificada; los modelos base tienen ventanas de contexto amplias (Qwen3-0.6B: 32k tokens; Llama-3.2-1B: 128k tokens), pero el fine-tuning podría haber reducido la ventana efectiva.
- No se indica el idioma de entrenamiento; si el fine-tuning se realizó solo en inglés, el rendimiento en otros idiomas será limitado.
- El repositorio solo contiene artefactos de release; el código de entrenamiento y los experimentos están en repositorios separados, lo que puede dificultar la reproducibilidad.
- La licencia Apache 2.0 permite uso comercial, pero se debe verificar que los modelos base (Qwen3 y Llama-3.2) también tengan licencias compatibles; ambos son de código abierto con permisos comerciales.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/kon172verma/intent-classifier
- Repositorio de experimentos: https://huggingface.co/kon172verma/intent-classifier-experiments
- Código de entrenamiento (GitHub): https://github.com/kon172verma/intent-classifier
- Código de inferencia y benchmarking (GitHub): https://github.com/kon172verma/intent-classifier-inference
- Perfil del autor: https://huggingface.co/kon172verma
