# Lanni-ni/dynamic_alibi_4_6_384_inverse_babylm_100m_seed44_epoch2

## Resumen

Este modelo es un experimento de investigación publicado por el usuario Lanni-ni en Hugging Face. Se trata de un modelo de generación de texto basado en la arquitectura transformer que incorpora una variante de ALiBi (Attention with Linear Biases) denominada `dynamic_alibi` con configuración `inverse`. El nombre del modelo sugiere que fue entrenado sobre el corpus BabyLM de 100 millones de palabras, aunque el número real de parámetros es de 45.694.080, lo que indica un modelo compacto de tamaño reducido.

La secuencia `4_6_384` en el identificador apunta a una posible configuración de 4 cabezas de atención, 6 capas y dimensión oculta de 384, pero esta información no está confirmada en la documentación disponible. El modelo se publica como un checkpoint de investigación, con una ficha autogenerada que no incluye detalles sobre el proceso de entrenamiento, datos, licencia ni idiomas soportados. Su relevancia radica en explorar mecanismos de positional encoding dinámicos, un área activa en la investigación de transformers eficientes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con atención y sesgo lineal (ALiBi) dinámico, según el nombre del modelo |
| Parametros totales | 45.694.080 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (el nombre sugiere 384, sin confirmar) |
| Tipos de cuantizacion | No disponible (pesos en safetensors, sin cuantizacion publicada) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es un transformer estándar con una modificación en el mecanismo de atención: el uso de ALiBi dinámico en su variante `inverse`. ALiBi (Attention with Linear Biases) es una técnica de positional encoding que añade un sesgo lineal a las puntuaciones de atención, permitiendo extrapolar a secuencias más largas sin necesidad de embeddings posicionales aprendidos. La variante `dynamic` indica que el sesgo se ajusta o se aprende durante el entrenamiento, mientras que `inverse` sugiere una modificación de la pendiente o la dirección del sesgo, aunque no hay documentación que lo detalle.

Según el nombre del modelo, el entrenamiento se realizó sobre el corpus BabyLM, un conjunto de datos de 100 millones de palabras diseñado para entrenar modelos de lenguaje con datos de entrada limitados, simulando el aprendizaje del lenguaje en la infancia. No se dispone de información sobre el número de tokens, la composición exacta del dataset, ni si se aplicaron técnicas de ajuste como RLHF o DPO. El checkpoint corresponde a la época 2 de entrenamiento con semilla 44, lo que indica que es un experimento intermedio en un estudio más amplio.

## Capacidades

- Generación de texto autoregresivo, tal como indica el pipeline `text-generation` de la librería transformers.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles.
- Capacidades especiales (vision, audio, thinking mode): no disponibles.

## Casos de uso

- Investigación en positional encoding: el modelo es útil para estudiar el comportamiento de ALiBi dinámico en tareas de generación de texto con secuencias largas. Se puede usar como referencia en comparativas con otras variantes de ALiBi o con modelos con positional encoding estándar.
- Experimentos en BabyLM: sirve como checkpoint intermedio para analizar la evolución del aprendizaje durante el entrenamiento en el corpus BabyLM. Permite investigar cómo cambia el rendimiento a lo largo de las épocas.
- Evaluación de extrapolación de contexto: gracias a la naturaleza de ALiBi, el modelo puede utilizarse para probar la capacidad de generalizar a longitudes de secuencia mayores que las vistas durante el entrenamiento.
- Comparativa de arquitecturas ligeras: por su tamaño reducido (45,7M de parámetros), es adecuado para experimentos de eficiencia y compresión de modelos en entornos con recursos limitados.
- Docencia y divulgación: puede emplearse como ejemplo práctico de una implementación de ALiBi dinámico en PyTorch y Hugging Face transformers, dado que el repositorio incluye código personalizado.
- Reproducción de experimentos: al estar publicados los pesos con semilla y época determinadas, permite reproducir o continuar los experimentos del autor en el contexto de investigaciones sobre atención con sesgo lineal.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye evaluaciones, métricas ni comparativas con otros modelos. No es posible determinar el rendimiento en tareas como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 183 MB en FP32, 91 MB en FP16 y 46 MB en cuantizacion de 8 bits, calculados a partir de los 45.694.080 parámetros.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM, incluyendo modelos de consumo como NVIDIA GTX 1650, RTX 3050 o equivalentes. También es viable la inferencia en CPU.
- Compatibilidad con GPU de consumo: sí, el modelo es suficientemente pequeño para ejecutarse en la mayoría de GPUs domésticas.
- Opciones de despliegue: transformers (pip install transformers), vLLM, Text Generation Inference (TGI), y llama.cpp si se convierten los pesos a formato GGUF.
- Latencia y throughput estimados: no disponibles, al no haber mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Lanni-ni/dynamic_alibi_4_6_384_inverse_babylm_100m_seed44_epoch2 | 45.694.080 | No disponible | No disponible | Hugging Face, safetensors |
| Lanni-ni/dynamic_alibi_4_6_384_babylm_100m_epoch6 | No disponible | No disponible | No disponible | Hugging Face, safetensors |
| Lanni-ni/dynamic_forgetting_4_6_384_babylm_100m | No disponible | No disponible | No disponible | Hugging Face, safetensors |

Los dos modelos adicionales pertenecen a la misma familia de experimentos del autor, pero no se dispone de sus parámetros exactos ni de resultados de rendimiento. No se han encontrado modelos comparables de otros autores con información pública suficiente para establecer una comparativa detallada.

## Limitaciones y advertencias

- Sesgos conocidos: no se dispone de información sobre sesgos. El modelo fue entrenado en BabyLM, un corpus de lenguaje infantil, lo que puede introducir sesgos hacia registros de habla simples o limitados.
- Riesgo de alucinacion: al ser un modelo de investigación sin evaluación publicada, el riesgo de generar contenido factualmente incorrecto es alto y no ha sido cuantificado.
- Limitaciones de contexto o idioma: la longitud de contexto no está documentada. El idioma de entrenamiento probablemente sea inglés, pero no está confirmado.
- Restricciones de licencia: la licencia no está especificada, por lo que el uso comercial no está garantizado. Se recomienda contactar al autor antes de utilizar el modelo en producción.
- Caveat importante para produccion: el modelo es un checkpoint experimental de época 2, con una ficha autogenerada sin documentación técnica. No está pensado para uso en entornos de producción y carece de validación de seguridad o robustez.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Lanni-ni/dynamic_alibi_4_6_384_inverse_babylm_100m_seed44_epoch2
- Perfil del autor en Hugging Face: https://huggingface.co/Lanni-ni
- Modelo relacionado (epoch6): https://huggingface.co/Lanni-ni/dynamic_alibi_4_6_384_babylm_100m_epoch6
- Modelo relacionado (dynamic_forgetting): https://huggingface.co/Lanni-ni/dynamic_forgetting_4_6_384_babylm_100m
