# AllSpark-Research/Iris-pro

## Resumen

Iris-pro es un modelo de inteligencia artificial publicado por AllSpark-Research, un laboratorio de investigación con presencia en GitHub y HuggingFace. El repositorio de HuggingFace indica que se trata de un modelo con pesos en formato safetensors, etiquetado como `qwen3_5_moe`, lo que sugiere una arquitectura de mezcla de expertos (MoE) basada en la familia Qwen 3.5, aunque no hay confirmación oficial en la documentación disponible. La licencia es Apache 2.0, lo que permite uso comercial y modificación, pero el modelo no ha recibido descargas ni valoraciones en la plataforma.

El tamaño del repositorio es de 379,8 GB, lo que apunta a un modelo de gran escala, probablemente con decenas de miles de millones de parámetros, aunque no se especifica el número exacto. La fecha de creación es de septiembre de 2026, y la model card únicamente contiene la línea de licencia, sin detalles técnicos, capacidades o instrucciones de uso. Esta falta de documentación hace que sea imposible evaluar su rendimiento o sus aplicaciones prácticas con los datos disponibles. La relevancia actual del modelo es incierta, ya que no existe información pública sobre su arquitectura, entrenamiento o resultados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (etiqueta sugiere MoE basada en Qwen 3.5, sin confirmar) |
| Parametros totales | No disponible |
| Parametros activos | No disponible (probablemente MoE, sin confirmar) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura interna, el proceso de entrenamiento, el número de tokens utilizados, la composición del dataset o si se aplicaron técnicas como RLHF o DPO. La etiqueta `qwen3_5_moe` en HuggingFace sugiere que el modelo podría ser una variante de mezcla de expertos derivada de Qwen 3.5, pero no hay documentación que lo confirme. Tampoco se conocen innovaciones técnicas específicas. El tamaño del repositorio (379,8 GB) indica que el modelo es considerablemente grande, pero sin más datos no se puede determinar si se trata de un modelo denso o de una arquitectura MoE con parámetros activos reducidos.

## Capacidades

No se dispone de información verificada sobre las capacidades del modelo. La model card no describe ninguna funcionalidad, y no hay demos, ejemplos de uso ni benchmarks publicados. Por tanto, no se puede confirmar si el modelo es capaz de generación de texto, razonamiento, código, matemáticas, visión, tool calling o cualquier otra tarea. La única pista es la etiqueta `qwen3_5_moe`, que podría implicar capacidades similares a las de los modelos Qwen (multilingüismo, razonamiento, código), pero esto es especulativo y no debe tratarse como un dato fiable.

## Casos de uso

No se pueden enumerar casos de uso concretos debido a la ausencia total de documentación técnica y ejemplos prácticos. Sin información sobre la arquitectura, el contexto, el rendimiento o las capacidades, cualquier aplicación propuesta sería una suposición infundada. Se recomienda a los desarrolladores esperar a que AllSpark-Research publique una model card completa o documentación adicional antes de considerar este modelo para ningún escenario real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No existen tablas comparativas ni métricas de rendimiento en la model card ni en el repositorio de GitHub. Tampoco hay referencias a evaluaciones independientes en la web.

## Requisitos de hardware

No se dispone de datos oficiales sobre requisitos de hardware. Sin embargo, el tamaño del repositorio (379,8 GB) sugiere que la inferencia requerirá múltiples GPUs de alta gama, probablemente con al menos 80 GB de VRAM por GPU en configuraciones distribuidas. Para una estimación aproximada, un modelo con pesos en FP16 de ese tamaño necesitaría alrededor de 190 GB de VRAM (asumiendo que el tamaño del repo incluye pesos en FP16, lo cual no está confirmado). Esto implicaría al menos dos GPUs A100 de 80 GB o varias RTX 4090 en paralelo. No se conocen opciones de despliegue específicas como vLLM, llama.cpp o Ollama, ya que no hay instrucciones de uso ni compatibilidad declarada.

## Comparativa con modelos similares

No se puede realizar una comparativa porque no se dispone de información sobre los parámetros, el contexto, el rendimiento o la arquitectura del modelo. No hay modelos comparables identificables sin datos técnicos. La única referencia posible es la etiqueta `qwen3_5_moe`, que podría indicar similitud con la serie Qwen 3.5 MoE, pero no hay confirmación ni métricas para establecer una comparación válida.

## Limitaciones y advertencias

- La documentación es prácticamente inexistente: la model card solo contiene la licencia, y el repositorio de GitHub no aporta información técnica.
- No se conocen sesgos, riesgos de alucinación o limitaciones de contexto porque no hay datos sobre el entrenamiento ni el comportamiento del modelo.
- La licencia Apache 2.0 permite uso comercial y modificación, pero sin documentación de atribución o requisitos adicionales, el usuario debe revisar los términos completos.
- El modelo no tiene descargas ni valoraciones, lo que sugiere que es muy reciente o no ha sido probado por la comunidad.
- El tamaño del repositorio (379,8 GB) implica costes de almacenamiento y computación significativos; cualquier despliegue en producción requeriría una infraestructura potente.
- No hay garantía de que el modelo funcione según lo esperado; se recomienda no utilizarlo en entornos críticos sin una evaluación exhaustiva previa.

## Enlaces

- [HuggingFace: AllSpark-Research/Iris-pro](https://huggingface.co/AllSpark-Research/Iris-pro)
- [GitHub: AllSpark-Research/Iris](https://github.com/AllSpark-Research/Iris)
- [Sitio web de AllSparkResearch](https://allsparkresearch.com/)
