# Lanni-ni/dynamic_alibi_4_6_384_babylm_100m_seed44_epoch2

## Resumen

El modelo `Lanni-ni/dynamic_alibi_4_6_384_babylm_100m_seed44_epoch2` es un modelo de lenguaje de pequeño tamaño, publicado por el usuario `Lanni-ni` en Hugging Face. Según los metadatos, se trata de un transformer con un mecanismo de atención basado en ALiBi (Attention with Linear Biases) en su variante dinámica, como indica el tag `dynamic_alibi` y la referencia al paper arXiv:1910.09700. El nombre del checkpoint (`4_6_384`) sugiere una configuración de 4 capas, 6 cabezas de atención y 384 dimensiones ocultas, aunque esta información no está confirmada en la model card.

El sufijo `babylm_100m_seed44_epoch2` apunta a que el modelo fue entrenado sobre el corpus BabyLM (100 millones de palabras), con semilla 44 y durante 2 épocas. Los pesos en el repositorio suman 45.694.080 parámetros y están almacenados en formato `safetensors`. La model card es una plantilla generada automáticamente y no contiene información sobre arquitectura, datos de entrenamiento, rendimiento o licencia. Se trata de un modelo experimental, creado con fines de investigación y reproducción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con atención de sesgo lineal (ALiBi) dinámico; detalles de capas no disponibles |
| Parametros totales | 45.694.080 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin especificación de precisión) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo no está documentado en su model card, que es una plantilla automática con la mayoría de campos en `[More Information Needed]`. Los tags y el nombre del checkpoint permiten inferir que se trata de un transformer de lenguaje con un mecanismo de atención basado en ALiBi (Attention with Linear Biases), en una variante llamada `dynamic_alibi`. La referencia al paper arXiv:1910.09700 confirma la inspiración en el trabajo de Press et al. sobre sesgos lineales para extrapolación de longitud.

Los tags `custom_code` y `region:us` indican que el modelo requiere código personalizado para cargarse, lo que implica que la implementación del mecanismo de atención no es estándar. El sufijo `babylm_100m_seed44_epoch2` sugiere que se entrenó sobre el corpus BabyLM de 100 millones de palabras, con una semilla concreta (44) y durante 2 épocas. No se han publicado detalles sobre el proceso de entrenamiento, la composición exacta del dataset, ni técnicas como RLHF o DPO.

## Capacidades

Las capacidades del modelo no están documentadas en la model card. No se han publicado resultados de benchmarks ni listas de tareas soportadas. En su estado actual, solo es posible afirmar que es un modelo de texto que genera texto. No se conoce soporte para tool calling, agentes, razonamiento multi-paso, visión o audio. Cualquier afirmación sobre capacidades específicas sería especulativa.

## Casos de uso

- **Investigación en extrapolación de longitud de contexto**: al usar ALiBi dinámico, el modelo permite estudiar cómo el sesgo lineal favorece la generalización a secuencias más largas que las vistas durante el entrenamiento.
- **Comparación experimental de arquitecturas de atención**: los checkpoints hermanos del mismo autor (`epoch7`, `inverse_epoch4`) pueden servir como controles para medir el efecto del mecanismo ALiBi frente a configuraciones alternativas.
- **Fine-tuning en tareas de clasificación de textos**: por su tamaño reducido, puede afinarse en CPU para prototipos rápidos en datasets pequeños, como clasificación de sentimiento o categorización de documentos.
- **Análisis de sesgos en modelos de lenguaje pequeños**: la opacidad del entrenamiento permite investigar cómo los datos BabyLM influyen en sesgos sociolingüísticos y de representación.
- **Pruebas de eficiencia en hardware limitado**: con ~46 millones de parámetros, es adecuado para medir latencia, consumo de memoria y viabilidad en dispositivos de baja capacidad.
- **Reproducibilidad de experimentos**: al exponer la semilla (seed44) y la época (epoch2), facilita estudios controlados sobre la influencia de estos hiperparámetros en el comportamiento del modelo.

Estos usos son hipotéticos y no están validados por ninguna evaluación publicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- **VRAM estimada para inferencia**: los pesos en FP32 ocupan aproximadamente 183 MB (45.694.080 parámetros × 4 bytes). En FP16 serían unos 92 MB. Con el overhead de activaciones y el backend de transformers, la inferencia puede ejecutarse con menos de 1 GB de VRAM.
- **GPU recomendada**: cualquier GPU moderna con 2 GB o más (RTX 3050, GTX 1650, etc.) es suficiente. También puede ejecutarse en CPU, aunque la latencia será mayor.
- **Compatibilidad con GPU de consumo**: sí, es un modelo ligero que cabe en la mayoría de GPUs de consumo.
- **Opciones de despliegue**: es necesario usar `trust_remote_code=True` en HuggingFace Transformers debido al tag `custom_code`. No se dispone de información sobre soporte en vLLM, llama.cpp, Ollama o TGI. Para usar llama.cpp sería necesario convertirlo a formato GGUF, lo cual no es inmediato dado el código personalizado.
- **Latencia y throughput**: no disponibles.

## Comparativa con modelos similares

La información disponible no permite una comparación técnica. Los únicos modelos cercanos son los checkpoints del mismo autor: `Lanni-ni/dynamic_alibi_4_6_384_babylm_100m_epoch7` y `Lanni-ni/dynamic_alibi_4_6_384_babylm_10m_inverse_epoch4`, que difieren en la época, el tamaño del corpus y la configuración de semilla. No se han publicado métricas que permitan comparar su rendimiento. Se desconoce si existen modelos de referencia comparables en el estado del arte para el mismo régimen de entrenamiento.

## Limitaciones y advertencias

- La model card es una plantilla automática sin información sobre sesgos, riesgos o limitaciones. No hay evaluación de seguridad ni pruebas de comportamiento.
- Riesgo de alucinación alto: al ser un modelo pequeño (~46 M) y sin datos de entrenamiento documentados, la generación podría ser incoherente o inventar contenido.
- Información sobre idiomas no disponible: no se sabe qué idiomas soporta, lo que impide usarlo con confianza en aplicaciones multilingües.
- Licencia no disponible: no está claro si permite uso comercial o modificación. Antes de cualquier uso en producción, se necesita contactar al autor o verificar los archivos del repositorio.
- Es un modelo experimental con fines de investigación, no apto para despliegue productivo sin validación previa.
- El uso de `custom_code` puede suponer un riesgo de seguridad si el código no es auditado.

## Enlaces

- HuggingFace: https://huggingface.co/Lanni-ni/dynamic_alibi_4_6_384_babylm_100m_seed44_epoch2
- Paper ALiBi (referencia en tags): https://arxiv.org/abs/1910.09700
- Checkpoint hermano epoch7: https://huggingface.co/Lanni-ni/dynamic_alibi_4_6_384_babylm_100m_epoch7
- Checkpoint hermano inverse_epoch4: https://huggingface.co/Lanni-ni/dynamic_alibi_4_6_384_babylm_10m_inverse_epoch4
