# mradermacher/BlueBerry-2-GGUF

## Resumen

BlueBerry-2-GGUF es una cuantización en formato GGUF del modelo BlueBerry-2, desarrollado originalmente por artindnr y convertido por mradermacher para su uso con llama.cpp y herramientas compatibles. Se trata de un modelo de texto con arquitectura de mezcla de expertos (Mixture of Experts, MoE), tal como indican las etiquetas del repositorio, y cuenta con aproximadamente 116.829 millones de parámetros en total. El modelo soporta dos idiomas: persa (fa) e inglés (en), y se distribuye bajo licencia Apache 2.0.

Esta cuantización resulta relevante porque permite ejecutar un modelo de gran tamaño en entornos locales mediante GGUF, un formato optimizado para inferencia en CPU y GPU con distintas opciones de compresión. La disponibilidad de múltiples cuantizaciones, desde Q2_K hasta Q8_0, facilita el despliegue en sistemas con recursos variables, aunque su enorme tamaño impone requisitos de hardware considerables.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE) |
| Parametros totales | 116.829.156.672 (aprox. 116.8B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, Q4_K_M, Q8_0 |
| Idiomas soportados | fa, en |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (el modelo base usa safetensors) |

## Arquitectura y entrenamiento

BlueBerry-2 se presenta como un modelo de mezcla de expertos, lo que implica que durante la inferencia solo se activa una parte de los parámetros por token, en lugar de la totalidad. Esto es una característica común en arquitecturas MoE para reducir el coste computacional manteniendo una capacidad elevada. Sin embargo, la información disponible no incluye detalles sobre el número de expertos, la configuración de los mismos, el número de parámetros activos ni la arquitectura interna exacta.

En cuanto al entrenamiento, no se han publicado datos sobre la composición del dataset, el número de tokens de entrenamiento ni si se emplearon técnicas de alineación como RLHF o DPO. La etiqueta mxfp4 sugiere que el modelo original podría utilizar cuantización MXFP4 (Microscaling Floating Point de 4 bits) en los pesos, aunque esta conversión de mradermacher ofrece cuantizaciones GGUF estándar basadas en las familias K-quant y Q8_0.

## Capacidades

- Generación de texto en persa (fa) e inglés (en), con soporte para tareas de conversación según las etiquetas del repositorio.
- Arquitectura MoE que permite un escalado de parámetros mayor que un modelo denso del mismo coste de inferencia, aunque el número exacto de parámetros activos no se ha especificado.
- Compatibilidad con herramientas que admiten GGUF, como llama.cpp, Ollama o LM Studio, gracias al trabajo de cuantización realizado por mradermacher.
- No se dispone de información sobre soporte de tool calling, function calling, visión, audio, razonamiento avanzado o modo de pensamiento explícito.

## Casos de uso

- Traducción automática persa-inglés: el modelo puede procesar textos en ambos idiomas y generar traducciones fluidas, lo que resulta útil para localización de contenido, documentos o interfaces de usuario.
- Asistentes conversacionales bilingües: gracias a su capacidad de conversación, puede integrarse en chatbots que atiendan a usuarios en persa e inglés, por ejemplo, en servicios de atención al cliente para regiones de habla persa.
- Análisis de texto en persa: permite tareas de clasificación, extracción de información o resumen de textos escritos en persa, un idioma con menos recursos abiertos que el inglés.
- Generación de contenido editorial: puede redactar artículos, noticias o publicaciones en persa o inglés, aunque requiere supervisión y revisión por parte de editores humanos.
- Investigación sobre modelos MoE: al ser un modelo grande con arquitectura de mezcla de expertos, resulta interesante para estudiar el comportamiento de estas arquitecturas en tareas multilingües, siempre que se disponga de hardware adecuado.
- Despliegue local con llama.cpp: la disponibilidad de cuantizaciones GGUF permite ejecutarlo en servidores o estaciones de trabajo con CPU o GPU, sin depender de servicios cloud, lo que es útil para entornos con requisitos de privacidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Para la cuantización Q4_K_M (88.0 GB), se necesita aproximadamente 88 GB de VRAM solo para los pesos, más memoria para la caché KV y los buffers de inferencia. Una GPU A100 de 80 GB no es suficiente; se requiere una GPU con 96 GB o más, como una A100 de 96 GB o una H100 de 94 GB en configuraciones específicas.
- La cuantización Q8_0 (124.4 GB) exige al menos 128 GB de VRAM para una carga completa en GPU, lo que apunta a sistemas con múltiples GPUs o a GPUs profesionales de gama alta.
- Las cuantizaciones más pequeñas, como Q2_K (66.3 GB) o Q3_K_S (66.2 GB), reducen la carga pero siguen superando la VRAM de las GPUs de consumo, por lo que no son viables en una RTX 4090 de 24 GB.
- En CPU, se puede ejecutar con llama.cpp si el sistema cuenta con suficiente RAM. Para Q4_K_M se necesitan al menos 88-96 GB de RAM, más espacio para el contexto y las estructuras de datos.
- El despliegue puede realizarse con llama.cpp, Ollama, LM Studio o cualquier framework que soporte el formato GGUF. También es posible convertirlo a otros formatos, pero no se ha verificado su compatibilidad con vLLM o TGI en esta conversión.
- La latencia y el throughput no están disponibles; dependerán de la cuantización, del hardware y de la longitud del contexto.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en los datos proporcionados. Por tanto, no se ofrece una comparativa detallada. No obstante, es importante señalar que este modelo se sitúa en la categoría de modelos MoE de gran tamaño, por encima de referencias populares como Mixtral 8x7B (46.7B parámetros totales), pero no se pueden aportar cifras concretas de rendimiento ni de arquitectura sin datos adicionales.

## Limitaciones y advertencias

- No se dispone de información sobre sesgos conocidos ni sobre evaluaciones de seguridad y alineación.
- El riesgo de alucinación es inherente a cualquier modelo de lenguaje y puede verse amplificado en idiomas con menos recursos como el persa, donde los datos de entrenamiento podrían ser menos abundantes.
- La longitud de contexto no se ha especificado, lo que impide conocer el límite de tokens de entrada que soporta el modelo.
- Aunque la licencia Apache-2.0 permite el uso comercial, se recomienda revisar la documentación del modelo base original para confirmar las condiciones de uso y cualquier restricción adicional.
- Esta versión GGUF es una cuantización realizada por un tercero (mradermacher); la calidad de los resultados puede variar según la cuantización elegida, especialmente en las de menor precisión como Q2_K o Q3_K.
- No hay evidencia de que el modelo haya sido sometido a pruebas exhaustivas de robustez, por lo que se aconseja evaluar su comportamiento en el dominio específico antes de usarlo en producción.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/BlueBerry-2-GGUF
- Modelo base original: https://huggingface.co/artindnr/BlueBerry-2
- Perfil de mradermacher: https://huggingface.co/mradermacher
- Solicitud de modelos y preguntas frecuentes: https://huggingface.co/mradermacher/model_requests
