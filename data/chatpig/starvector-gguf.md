# chatpig/starvector-gguf

## Resumen

`chatpig/starvector-gguf` es una conversión a formato GGUF de un modelo de la familia StarVector, publicada por el usuario `chatpig` en Hugging Face. StarVector es una familia de modelos orientada a la generación de código SVG (gráficos vectoriales) a partir de imágenes o de descripciones textuales, desarrollada originalmente por el grupo de investigación del mismo nombre (StarVector en GitHub, con paper asociado). Esta ficha se refiere exclusivamente al artefacto publicado en el repositorio `chatpig/starvector-gguf`.

El artefacto contiene 1.434.095.620 parámetros totales (aproximadamente 1,43 mil millones), lo que lo sitúa en la categoría de modelos pequeños, adecuados para inferencia en hardware de consumo. El repositorio ocupa 0,8 GB, lo que es coherente con una cuantización de los pesos originales en safetensors a GGUF. La licencia declarada es Apache 2.0.

La información disponible es muy limitada: la model card del repositorio está prácticamente vacía (solo declara la licencia), no se especifican idiomas soportados, pipeline, ni detalles de arquitectura o entrenamiento más allá del recuento de parámetros. Cualquier dato no confirmado en la información proporcionada se marca como "no disponible" en esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el repositorio no documenta la arquitectura; StarVector se basa en modelos de visión-lenguaje, pero no se confirma en la información del repo) |
| Parametros totales | 1.434.095.620 |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF (el repositorio es una conversión GGUF; no se detallan los niveles de cuantización incluidos) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo de 0,8 GB; los pesos originales de referencia estarían en safetensors, según el recuento de parámetros) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura en la documentación del repositorio. El nombre del artefacto remite a StarVector, un proyecto de generación de SVG que combina un codificador visual con un modelo de lenguaje para producir código vectorial, pero la model card de `chatpig/starvector-gguf` no confirma ni detalla esta arquitectura, ni el número de tokens de entrenamiento, ni la composición del dataset, ni si hubo fases de RLHF o DPO.

Tampoco se documenta en el repositorio el proceso de conversión a GGUF (herramienta utilizada, nivel de cuantización exacto, si se preservaron todas las capas). El tamaño del repo (0,8 GB) frente a los 1,43 mil millones de parámetros sugiere una cuantización agresiva (del orden de 4-5 bits por parámetro), pero este dato es una estimación derivada y no está confirmado por el autor.

## Capacidades

- Generación de código SVG a partir de entradas visuales o textuales (capacidad inferida del nombre StarVector; no confirmada en la model card del repositorio).
- Generación de texto y razonamiento: no disponible.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Modo thinking, visión, audio u otras capacidades especiales: no disponible en la documentación del repositorio.

## Casos de uso

- Generación de gráficos vectoriales a partir de bocetos o imágenes: si el modelo conserva las capacidades de StarVector, podría convertir diagramas o ilustraciones rasterizadas en SVG editable para integrarlo en flujos de diseño. No confirmado en la documentación del repo.
- Prototipado de iconos y logotipos: generación de SVG a partir de descripciones textuales para iterar rápidamente en herramientas de diseño.
- Automatización de documentación técnica: conversión de diagramas de arquitectura en imágenes a SVG vectorial para manuales y wikis.
- Integración en pipelines de diseño web: producción de assets SVG ligeros y escalables para interfaces.
- Inferencia local en hardware de consumo: al tratarse de un GGUF de ~1,43 mil millones de parámetros, puede ejecutarse con llama.cpp u Ollama en equipos sin GPU dedicada.
- Experimentación e investigación: servir como base para evaluar la conversión GGUF de modelos de generación de SVG frente a los pesos originales.

Nota: estos casos asumen que el artefacto conserva las capacidades del modelo StarVector original; la documentación del repositorio no las confirma.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con un repo de 0,8 GB en GGUF, la inferencia requiere del orden de 1-2 GB de memoria (pesos más overhead de contexto), aunque no se confirma el nivel de cuantización exacto.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM; no se dispone de datos de rendimiento específicos para A100, H100 o RTX 4090.
- ¿Cabe en GPU de consumo? Sí, por tamaño (1,43 mil millones de parámetros en GGUF), en tarjetas como GTX 1650, RTX 3060 o superiores; no confirmado por el autor.
- Opciones de despliegue: llama.cpp y Ollama son los entornos habituales para GGUF; vLLM y TGI no soportan GGUF de forma nativa sin conversión.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| chatpig/starvector-gguf | 1.434.095.620 | no disponible | GGUF | Apache 2.0 | Hugging Face (0 descargas, 0 likes en el momento de la consulta) |
| StarVector (original, safetensors) | no disponible en esta ficha | no disponible | safetensors | no disponible | Hugging Face / GitHub (proyecto StarVector) |
| Alternativas de generación SVG | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información suficiente para comparar con modelos alternativos de la misma categoría con datos verificables.

## Limitaciones y advertencias

- La model card del repositorio está vacía salvo la licencia; no hay documentación sobre arquitectura, entrenamiento ni evaluación.
- El repositorio tiene 0 descargas y 0 likes, lo que indica que no ha sido validado por la comunidad.
- No se confirma que la conversión GGUF preserve fielmente el comportamiento del modelo original; pueden existir degradaciones por cuantización.
- Riesgo de alucinación y sesgos: no documentados por el autor; aplican los riesgos habituales de los modelos de lenguaje.
- Idiomas soportados no especificados; no se puede garantizar un rendimiento adecuado en castellano.
- Licencia Apache 2.0 permite uso comercial, pero al no haber documentación sobre el modelo base ni sobre los datos de entrenamiento, conviene verificar la procedencia antes de usarlo en producción.
- El nombre del autor (`chatpig`) coincide con un servicio de videollamadas aleatorias sin relación aparente con el modelo; no hay que confundir el repositorio con dicho servicio.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/chatpig/starvector-gguf
- Proyecto StarVector (referencia del nombre, no verificado en esta búsqueda): no disponible en los resultados proporcionados
- Paper de StarVector: no disponible en los resultados proporcionados
- Repositorio GitHub de StarVector: no disponible en los resultados proporcionados
- Demo: no disponible en los resultados proporcionados
