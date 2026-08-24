# KissTheHabit/IDA_Edge

## Resumen

IDA_Edge es un modelo de lenguaje causal desarrollado por KissTheHabit, publicado en la plataforma HuggingFace en mayo de 2026 como parte de la familia "IDA" junto con el modelo IDA_AI. El repositorio, cuyo acceso está restringido y requiere aceptar condiciones previas, presenta un peso total de aproximadamente 1,3 TB, lo que indica un modelo de muy gran escala. Las etiquetas del repositorio revelan una arquitectura híbrida que combina estado recurrente, atención local y un mecanismo de enrutamiento cognitivo, con un sistema de memoria gobernada.

El modelo está integrado en la librería transformers y utiliza el pipeline de generación de texto. Su documentación pública es extremadamente limitada: no se han publicado especificaciones técnicas detalladas, datos de entrenamiento ni resultados de benchmarks. El autor ha publicado también un dataset asociado con registros de TensorBoard (10,7 MB, 1.075 commits), lo que sugiere un proceso de desarrollo activo. La etiqueta "endpoints_compatible" y su presencia en FriendliAI indican que está preparado para despliegue en servicios de inferencia gestionada.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: estado recurrente + atención local + enrutamiento cognitivo (inferido de etiquetas) |
| Parametros totales | No disponible |
| Parametros activos | No disponible |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | Other (no especificada) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La información disponible sobre la arquitectura proviene exclusivamente de las etiquetas del repositorio. El modelo emplea un diseño híbrido que integra un estado recurrente (recurrent-state) con atención local (local-attention), lo que sugiere un enfoque de procesamiento por ventanas con memoria interna. La etiqueta "cognitive-routing" apunta a un mecanismo de enrutamiento dinámico de las representaciones, posiblemente de tipo MoE (mixture of experts) o de selección de rutas de cómputo. Los términos "edge-body" y "paired-body" sugieren una arquitectura de dos cuerpos o rutas de procesamiento parejas, mientras que "governed-memory" indica un sistema de gestión de memoria explícita.

El modelo se clasifica como "causal-lm", es decir, un modelo de lenguaje causal estándar para generación autorregresiva. No se dispone de información sobre el dataset de entrenamiento, el número de tokens procesados, la composición de los datos ni el proceso de alineación (RLHF, DPO u otros). La licencia "other" no permite determinar las condiciones exactas de uso, y el acceso gated requiere una solicitud de aceptación previa en HuggingFace.

## Capacidades

- Generación de texto autorregresiva, confirmada por el pipeline text-generation.
- Integración con la librería transformers y compatibilidad con endpoints de inferencia (FriendliAI ofrece un servicio de despliegue para este modelo).
- El diseño híbrido con estado recurrente y atención local sugiere una capacidad potencial para procesar secuencias largas con memoria interna, aunque no se ha confirmado.
- El mecanismo de enrutamiento cognitivo (cognitive-routing) apunta a un posible soporte para razonamiento multi-paso, pero no hay documentación que lo respalde.
- No se ha confirmado soporte para tool calling, function calling, visión o audio.

## Casos de uso

Dada la ausencia de documentación funcional, los siguientes casos se presentan como aplicaciones potenciales basadas en la arquitectura descrita, no como capacidades verificadas:

- **Despliegue en servicios de inferencia gestionada**: el modelo está listado en FriendliAI, lo que permite su integración en pipelines de producción sin infraestructura propia, mediante API de baja latencia y alto rendimiento.
- **Investigación de arquitecturas híbridas**: la combinación de estado recurrente, atención local y enrutamiento cognitivo constituye un campo de investigación activo; este modelo puede servir como referencia para estudiar el comportamiento de arquitecturas de este tipo en comparación con transformers densos o MoE convencionales.
- **Procesamiento de secuencias largas**: la presencia de estado recurrente y atención local sugiere que el modelo podría manejar contextos extensos de forma eficiente, aunque no se ha publicado la longitud de contexto soportada.
- **Evaluación comparativa en entornos académicos**: al ser un modelo de acceso restringido pero disponible, puede utilizarse en estudios comparativos de arquitecturas emergentes frente a modelos establecidos de similar escala.
- **Análisis de procesos de entrenamiento**: el dataset público con registros de TensorBoard permite estudiar la dinámica de entrenamiento, las curvas de pérdida y las decisiones de diseño del autor.
- **Aplicaciones de generación de texto en entornos controlados**: una vez aceptadas las condiciones de acceso, puede evaluarse para tareas de generación de contenido, resumen o diálogo, aunque su rendimiento en estas tareas no está documentado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- El repositorio pesa 1.291,8 GB, lo que indica un modelo de escala muy grande; en precisión fp16, esto podría corresponder a varios cientos de miles de millones de parámetros, o bien a un conjunto de múltiples pesos o variantes del modelo.
- No se han publicado requisitos de VRAM, GPUs recomendadas ni medidas de latencia o throughput.
- La compatibilidad con la librería transformers y la presencia en FriendliAI sugieren que puede desplegarse mediante vLLM, TGI o servicios de inferencia gestionada, pero no está confirmado.
- Para un modelo de este tamaño, se requeriría infraestructura multi-GPU de gama alta (A100 80GB, H100) o servicios en la nube especializados en inferencia de modelos grandes.

## Comparativa con modelos similares

No disponible. La única referencia cercana es el modelo IDA_AI, también de KissTheHabit, pero no se han publicado sus especificaciones técnicas. No se puede establecer una comparativa con modelos de la misma categoría sin datos de parámetros, contexto o rendimiento.

## Limitaciones y advertencias

- **Acceso restringido**: el modelo requiere aceptación de condiciones en HuggingFace, lo que puede limitar su uso en entornos corporativos o de investigación.
- **Licencia indefinida**: la licencia "other" no especifica los términos de uso comercial; es imprescindible revisar las condiciones del repositorio antes de cualquier despliegue en producción.
- **Documentación insuficiente**: no se han publicado especificaciones técnicas, datos de entrenamiento, benchmarks ni limitaciones conocidas, lo que dificulta la evaluación de su idoneidad para casos de uso concretos.
- **Sin información de idiomas**: no se indica qué idiomas soporta el modelo, lo que complica su uso en aplicaciones multilingües.
- **Riesgo de alucinación**: como cualquier modelo de lenguaje causal, puede generar contenido inventado o incorrecto, especialmente en dominios especializados.
- **Sin garantías de rendimiento**: al no existir benchmarks publicados, no se puede comparar objetivamente con otros modelos de su escala.
- **Fecha de publicación reciente**: el modelo fue creado en mayo de 2026 y actualizado en agosto de 2026, por lo que se trata de un proyecto en desarrollo activo, sin una base de usuarios que haya validado su comportamiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/KissTheHabit/IDA_Edge
- Dataset asociado: https://huggingface.co/datasets/KissTheHabit/IDA_Edge
- Modelo relacionado (IDA_AI): https://huggingface.co/KissTheHabit/IDA_AI
- Página de inferencia en FriendliAI: https://friendli.ai/models/KissTheHabit/IDA_Edge
