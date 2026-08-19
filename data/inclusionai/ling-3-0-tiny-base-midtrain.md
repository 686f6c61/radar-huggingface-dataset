# inclusionAI/Ling-3.0-tiny-base-midtrain

## Resumen

Ling-3.0-tiny-base-midtrain es un checkpoint intermedio de la familia Ling-3.0, desarrollado por InclusionAI, que corresponde a la etapa de mid-training dentro del pipeline de entrenamiento del modelo base Ling-3.0-tiny. Este checkpoint se publica con fines de investigación: permite continuar el pre-entrenamiento, realizar fine-tuning para dominios específicos o estudiar la arquitectura híbrida MoE sin necesidad de partir de cero. No ha pasado por el proceso de Weighted Stable Merge (WSM) ni por post-training, por lo que no está pensado para uso directo en producción o chat.

El modelo emplea una arquitectura híbrida de atención lineal con mezcla de expertos (MoE) que combina capas KDA con capas Gated MLA, activando solo 1.300 millones de parámetros por token de un total de aproximadamente 8.200 millones. Esta configuración busca un equilibrio entre capacidad y eficiencia computacional, especialmente para contextos largos. Su licencia MIT facilita su adopción tanto en entornos académicos como industriales, aunque su estado de checkpoint intermedio exige etapas adicionales de alineación y ajuste antes de cualquier despliegue real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hybrid-linear MoE (18 capas KDA + 6 capas Gated MLA, proporcion 3:1) |
| Parametros totales | 8.209.997.600 (según safetensors); la model card indica 7.9B |
| Parametros activos | 1.3B por token (8 expertos enrutados + 1 experto compartido de 128 expertos enrutados) |
| Longitud de contexto | no disponible para este checkpoint; el modelo post-entrenado Ling-3.0-tiny soporta 256K segun fuentes externas |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en una arquitectura MoE híbrida con atención lineal nativa, diseñada desde el inicio del pre-entrenamiento. Combina dos tipos de capas: 18 capas KDA (Key-Value Decomposed Attention) y 6 capas Gated MLA (Multi-head Latent Attention con compuerta), en una proporción 3:1. Esta combinación busca procesar eficientemente secuencias largas manteniendo la calidad de modelado del lenguaje. La capa densa intermedia tiene un tamaño de 4608, mientras que los expertos tienen un tamaño intermedio de 512. El vocabulario alcanza 157.184 tokens.

El entrenamiento sigue un pipeline por fases: pre-entrenamiento a gran escala, mid-training, fusión WSM (Weighted Stable Merge) y post-training. Este checkpoint corresponde al final de la fase de mid-training, antes de la fusión WSM y del post-training. InclusionAI reemplaza el decaimiento de tasa de aprendizaje convencional por una fusión ponderada de checkpoints, lo que permite explorar perfiles de decaimiento sin repetir costosos experimentos. El modelo comparte la misma receta de entrenamiento que Ling-3.0-flash-base, lo que facilita escalar estrategias validadas en el modelo pequeño al más grande.

## Capacidades

- Generación de texto y modelado de lenguaje autoregresivo, al ser un modelo base sin post-training.
- Razonamiento y comprensión de lenguaje en tareas generales, aunque sin alineación específica para instrucciones.
- Procesamiento eficiente de contextos largos gracias a la atención híbrida lineal (KDA + Gated MLA).
- Capacidad de continuación de pre-entrenamiento y fine-tuning para dominios específicos, al ser un checkpoint intermedio.
- Investigación sobre arquitecturas MoE, atención lineal y técnicas de fusión de pesos (WSM).
- No incluye soporte nativo de tool calling, function calling ni modos de razonamiento especiales, ya que esas capacidades se añaden en el post-training del modelo final.

## Casos de uso

- Continuación de pre-entrenamiento: investigadores pueden tomar este checkpoint y seguir entrenando con datos adicionales o dominios específicos, aprovechando que no ha pasado por decaimiento de tasa de aprendizaje, lo que facilita la expansión dinámica del corpus.
- Fine-tuning para dominios verticales: por ejemplo, adaptar el modelo a terminología médica, legal o técnica mediante supervisión, dado que su tamaño activo de 1.3B permite iterar con recursos moderados.
- Investigación en arquitecturas MoE: estudiar el comportamiento de los expertos enrutados, la distribución de activaciones y el efecto de diferentes estrategias de enrutamiento sin necesidad de entrenar desde cero.
- Experimentación con fusión de pesos WSM: al ser un checkpoint previo a la fusión, permite reproducir y explorar distintos perfiles de decaimiento y comparar con el checkpoint fusionado Ling-3.0-tiny-base.
- Optimización de inferencia para contextos largos: probar técnicas de atención lineal y gestión de memoria en secuencias de hasta 256K tokens (si se confirma esa capacidad) en entornos de investigación.
- Distillation de conocimiento: usar este modelo base como profesor para entrenar modelos más pequeños, gracias a su licencia MIT y su disponibilidad como checkpoint intermedio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para el checkpoint midtrain en la informacion disponible. La model card menciona una evaluacion del modelo base fusionado Ling-3.0-tiny-base mediante una suite propia que cubre conocimiento, codigo, matematicas, razonamiento, comprension multilingue y contexto largo, pero no se proporcionan cifras concretas ni tablas comparativas en el material consultado. Se recomienda consultar la documentacion oficial de InclusionAI o el repositorio GitHub para obtener datos cuantitativos.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en FP16 ocupan aproximadamente 16,4 GB (tamano del repositorio), por lo que se necesitan al menos 16-20 GB de VRAM para carga completa en precision media. Con cuantizacion a 4 bits, el modelo podria caber en unos 4-5 GB, aunque no se han publicado cuantizaciones oficiales.
- GPU recomendadas: para inferencia en FP16, una GPU con 24 GB de VRAM (RTX 3090, RTX 4090, A5000) es suficiente. Para entrenamiento o fine-tuning, se recomienda al menos una A100 de 40 GB o H100.
- En consumer GPU: si, con cuantizacion a 4 bits podria ejecutarse en una RTX 3060 de 12 GB o similar, pero sin garantias de rendimiento optimo.
- Opciones de despliegue: al ser un modelo base sin post-training, no se recomienda su uso con frameworks de chat como Ollama o vLLM directamente. Para investigacion, puede usarse con Transformers de Hugging Face, o con vLLM y TGI si se desea servir como modelo base.
- Latencia y throughput: no disponibles. La arquitectura MoE con solo 1.3B parametros activos sugiere una latencia menor que un modelo denso equivalente, pero no hay datos publicados para este checkpoint.

## Comparativa con modelos similares

No se dispone de datos de rendimiento para comparar directamente con otros modelos de tamano similar. Como referencia cualitativa, el modelo comparte caracteristicas con otros MoE eficientes como Qwen3-30B-A3B (30B totales, 3B activos) o DeepSeek-V2-Lite (16B totales, 2.4B activos), pero no hay benchmarks comunes publicados. La principal diferencia es su atencion hibrida lineal, que lo orienta a contextos largos, y su licencia MIT, mas permisiva que las de muchos competidores. Se recomienda evaluar el checkpoint fusionado Ling-3.0-tiny-base para comparaciones de rendimiento reales.

## Limitaciones y advertencias

- Checkpoint intermedio sin post-training: no esta alineado para instrucciones ni para chat, por lo que no debe usarse directamente en aplicaciones de usuario final.
- Sin alineacion de seguridad: puede generar contenido sesgado, toxico o factualmente incorrecto, como cualquier modelo base sin ajuste.
- Riesgo de alucinacion: elevado en tareas generativas, especialmente sin supervisión posterior.
- Datos de entrenamiento no especificados: no se ha publicado la composicion del corpus, los idiomas soportados ni el numero total de tokens de pre-entrenamiento.
- Discrepancia en parametros totales: la model card indica 7.9B, pero el peso real en safetensors es de 8.209.997.600 parametros; esta diferencia puede deberse a parametros no entrenables o a errores de documentacion.
- No apto para produccion: la propia model card desaconseja su uso en aplicaciones criticas o de produccion sin post-training y validacion especifica.
- Contexto maximo no confirmado: aunque el modelo post-entrenado soporta 256K, este checkpoint no especifica su longitud de contexto real; podria requerir ajustes de posicion para contextos muy largos.

## Enlaces

- HuggingFace del modelo: https://huggingface.co/inclusionAI/Ling-3.0-tiny-base-midtrain
- Modelo fusionado (Ling-3.0-tiny-base): https://huggingface.co/inclusionAI/Ling-3.0-tiny-base
- Modelo post-entrenado (Ling-3.0-tiny): https://huggingface.co/inclusionAI/Ling-3.0-tiny
- Repositorio GitHub de InclusionAI: https://github.com/inclusionAI/Ling
- Cookbook de fine-tuning: https://github.com/inclusionAI/ling-cookbook/
- Paper WSM (arXiv:2507.17634): https://arxiv.org/abs/2507.17634
- Ficha en crafiq.ai: https://crafiq.ai/models/language/inclusionai-ling-3-0-tiny-rc2
- Ficha en zenmux.ai: https://zenmux.ai/inclusionai/ling-3.0-tiny
