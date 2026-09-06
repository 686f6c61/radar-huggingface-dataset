# Lanni-ni/dynamic_alibi_2_4_256_babylm_10m_seed43_epoch10

## Resumen

El modelo `Lanni-ni/dynamic_alibi_2_4_256_babylm_10m_seed43_epoch10` es un modelo de lenguaje de tamaño reducido (27.447.040 parámetros en total según los pesos safetensors) desarrollado por el usuario Lanni-ni. Está pensado para experimentación en generación de texto y parece formar parte de una serie de pruebas con arquitecturas basadas en atención con sesgo ALiBi dinámico, como sugiere el nombre del repositorio y la etiqueta `dynamic_alibi`. El identificador `babylm_10m` apunta a que el modelo se enmarca en la iniciativa BabyLM, que investiga el aprendizaje del lenguaje con datos limitados (10 millones de palabras), aunque el conteo real de parámetros supera los 10 millones.

La arquitectura utiliza la técnica ALiBi (Attention with Linear Biases), propuesta en el paper arxiv:1910.09700, que permite extrapolar la longitud de contexto sin necesidad de entrenar con secuencias largas. El modelo se distribuye en formato safetensors y requiere código personalizado (`custom_code`) para su carga, lo que indica que no es un checkpoint estándar de Transformers. No se dispone de información sobre licencia, idiomas soportados ni datos de entrenamiento, lo que limita su uso a entornos de investigación donde se pueda evaluar su comportamiento de forma empírica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con atención ALiBi dinámica (custom code) |
| Parametros totales | 27.447.040 |
| Parametros activos | no disponible (no se ha confirmado que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura Transformer con atención basada en sesgo lineal ALiBi (Attention with Linear Biases), tal como se describe en el paper arxiv:1910.09700. Esta técnica añade un sesgo lineal proporcional a la distancia entre tokens en lugar de usar posiciones absolutas, lo que permite que el modelo generalice a secuencias más largas que las vistas durante el entrenamiento. El nombre `dynamic_alibi` sugiere una variante dinámica de este sesgo, aunque no se dispone de documentación técnica detallada al respecto.

El sufijo `babylm_10m` indica que el modelo probablemente se entrenó con el corpus de BabyLM, que contiene 10 millones de palabras. El número de épocas (epoch10) y la semilla (seed43) aparecen en el nombre del repositorio, lo que sugiere que se trata de un experimento controlado dentro de una serie de ejecuciones. No se han publicado detalles sobre el proceso de entrenamiento, la composición del dataset, el régimen de precisión ni si se aplicaron técnicas de alineación como RLHF o DPO.

## Capacidades

- Generación de texto básica a partir de un prompt, limitada al dominio y tamaño del corpus de entrenamiento (probablemente BabyLM).
- Extrapolación de longitud de contexto gracias al sesgo ALiBi, lo que permite probar el modelo con secuencias más largas que las usadas en entrenamiento.
- Soporte de código personalizado en `transformers` para cargar la arquitectura, lo que implica que no se puede usar con las clases estándar sin configuración adicional.
- No se ha confirmado soporte de tool calling, agentes, visión, audio ni capacidades multilingües.
- Sin datos sobre razonamiento matemático o capacidades de código.

## Casos de uso

- Investigación en arquitecturas de atención con sesgos lineales: el modelo permite experimentar con variantes de ALiBi dinámico y comparar su comportamiento con versiones estándar.
- Evaluación de extrapolación de contexto: al ser un modelo pequeño, es adecuado para medir cómo afecta el sesgo ALiBi a la capacidad de generalizar a longitudes de secuencia no vistas durante el entrenamiento.
- Pruebas de aprendizaje con corpus limitado (BabyLM): sirve como checkpoint para estudiar el efecto del número de épocas y la semilla en el rendimiento con un presupuesto de datos de 10 millones de palabras.
- Benchmarking de eficiencia en hardware de bajo consumo: al tener 27M de parámetros, puede ejecutarse en CPU o GPUs modestas, lo que facilita pruebas rápidas de inferencia.
- Desarrollo de pipelines de investigación en `transformers` con `trust_remote_code=True`: útil para probar la integración de arquitecturas personalizadas en el ecosistema HuggingFace.
- Comparación de semillas y configuraciones: el nombre incluye `seed43`, lo que permite replicar experimentos o comparar ejecuciones con distintas semillas dentro de la misma serie.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 27.447.040 parámetros en precisión fp32, el tamaño del modelo es de aproximadamente 110 MB, por lo que la VRAM necesaria es mínima (menos de 1 GB) si se usa una GPU. Con cuantización fp16 o int8, el requisito sería aún menor.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM, como una NVIDIA GTX 1650 o superior. También puede ejecutarse en CPU para pruebas básicas.
- Sí cabe en GPUs de consumo, incluso en modelos antiguos o integrados, dado el reducido número de parámetros.
- Opciones de despliegue: al requerir `custom_code`, la carga debe hacerse mediante `transformers` con `trust_remote_code=True`. No se ha confirmado compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponibles. Al ser un modelo pequeño, la latencia será baja en hardware moderno, pero no se han publicado mediciones.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa fiable con otros modelos de la misma categoría. Los modelos BabyLM de 10M de parámetros existen en el ecosistema, pero este checkpoint en concreto no tiene datos publicados de rendimiento, licencia ni detalles de entrenamiento que permitan una comparación rigurosa.

## Limitaciones y advertencias

- No se ha publicado la licencia, por lo que no se puede garantizar el uso comercial ni la redistribución del modelo.
- No hay información sobre los idiomas soportados, lo que implica que el modelo probablemente solo funcione bien en inglés (idioma del corpus BabyLM) y con un vocabulario limitado.
- La ausencia de benchmarks impide conocer su calidad real en tareas de generación, razonamiento o comprensión.
- Requiere `trust_remote_code=True` para cargarse, lo que supone un riesgo de seguridad si no se audita el código personalizado asociado.
- El tamaño del corpus (10M de palabras) es muy reducido, por lo que el modelo tendrá un vocabulario y conocimiento del mundo limitados, con alta probabilidad de alucinaciones.
- No se han documentado sesgos conocidos, pero al entrenarse con un corpus pequeño y probablemente sesgado, es esperable que herede sesgos presentes en los datos.
- El modelo es un experimento de investigación y no está preparado para producción sin una evaluación exhaustiva previa.

## Enlaces

- HuggingFace: https://huggingface.co/Lanni-ni/dynamic_alibi_2_4_256_babylm_10m_seed43_epoch10
- Paper de ALiBi (arxiv:1910.09700): https://arxiv.org/abs/1910.09700
- Repositorio relacionado (otro checkpoint de la misma serie): https://huggingface.co/Lanni-ni/dynamic_alibi_2_4_256_babylm_10m_epoch2
