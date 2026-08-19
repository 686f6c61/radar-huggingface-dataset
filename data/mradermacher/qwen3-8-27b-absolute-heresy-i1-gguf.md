# mradermacher/Qwen3.8-27B-absolute-heresy-i1-GGUF

## Resumen

Este repositorio contiene exclusivamente el archivo de importancia (imatrix) para la cuantización del modelo `MuXodious/Qwen3.8-27B-absolute-heresy`, un modelo de lenguaje de gran tamaño basado en la arquitectura Qwen y modificado mediante técnicas de *abliteration* para eliminar los mecanismos de rechazo de contenido. El archivo imatrix se emplea para generar cuantizaciones GGUF de alta calidad, optimizadas para inferencia eficiente en hardware diverso. El modelo base, desarrollado por el usuario MuXodious, está orientado a la generación de texto sin restricciones temáticas, lo que lo hace relevante para investigaciones sobre alineación, sesgos y creatividad. Este repositorio no contiene los pesos del modelo; los archivos GGUF cuantizados están disponibles en el repositorio estático enlazado más abajo.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (presumiblemente basada en Qwen, sin confirmar) |
| Parametros totales | 27B (según nombre del modelo, no verificado) |
| Parametros activos | No disponible |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No aplicable (solo archivo imatrix) |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (en repositorio estático) |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura exacta ni el proceso de entrenamiento del modelo base. Por el nombre y los tags, se infiere que es una variante de un modelo de la familia Qwen (posiblemente Qwen2.5 o Qwen3) con 27 mil millones de parámetros, modificada mediante *abliteration* para eliminar las direcciones de rechazo de contenido. Esta técnica consiste en identificar y anular los subespacios del espacio latente responsables de las respuestas de rechazo, permitiendo que el modelo genere contenido que normalmente sería bloqueado. No se han publicado detalles sobre el dataset de entrenamiento, el número de tokens procesados ni el uso de RLHF o DPO.

## Capacidades

- Generación de texto libre con mínimas restricciones de contenido, gracias a la eliminación de mecanismos de rechazo.
- Capacidades generales de un LLM de 27B: razonamiento, comprensión contextual, generación creativa, resumen, traducción (limitada al inglés).
- Posible soporte de tool calling o function calling, aunque no está confirmado.
- No se ha verificado soporte multimodal, a pesar de que el modelo card menciona que podría ser un modelo de visión (mmproj en el repositorio estático).
- Multilingüismo limitado al inglés según los metadatos.

## Casos de uso

- Investigación en alineación de IA: estudiar cómo los modelos generan contenido sensible cuando se eliminan los mecanismos de rechazo, y evaluar los riesgos asociados.
- Generación creativa sin filtros: escritura de ficción, poesía o guiones que exploren temas tabú o controvertidos sin restricciones automáticas.
- Análisis de sesgos: examinar los sesgos subyacentes del modelo base al eliminar las capas de moderación, comparando con versiones censuradas.
- Desarrollo de sistemas de moderación: utilizar el modelo como caso de prueba para entrenar clasificadores de contenido dañino.
- Evaluación de robustez: probar la capacidad del modelo para mantener coherencia y seguridad en entornos adversarios.
- Prototipado de aplicaciones de chat sin moderación: aunque no recomendado para producción, puede servir para experimentos controlados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Un modelo de 27B parámetros requiere aproximadamente 54 GB en FP16, por lo que se necesitan GPUs con al menos 48-64 GB de VRAM para inferencia sin cuantización.
- Con cuantización Q4 (típica en GGUF), el tamaño se reduce a ~14-16 GB, permitiendo ejecución en GPUs consumer como RTX 4090 (24 GB) o A6000 (48 GB).
- Con cuantización Q8, el tamaño sube a ~27-29 GB, requiriendo GPUs de gama alta como A100 (40 GB) o H100 (80 GB).
- Opciones de despliegue: llama.cpp, Ollama, vLLM (con soporte GGUF), text-generation-inference (TGI) con adaptadores.
- La latencia y throughput dependen del hardware y la cuantización; sin datos oficiales, no se pueden proporcionar estimaciones fiables.

## Comparativa con modelos similares

No se dispone de información sobre modelos directamente comparables, ya que se trata de una modificación específica de un modelo Qwen. Como referencia general, los modelos Qwen2.5 de 14B y 32B ofrecen capacidades similares en tamaño, pero con moderación estándar. Sin embargo, la falta de benchmarks y detalles técnicos impide una comparación rigurosa.

## Limitaciones y advertencias

- Al ser un modelo "uncensored", puede generar contenido ofensivo, violento, ilegal o éticamente problemático. Su uso debe limitarse a entornos de investigación controlados.
- Riesgo elevado de alucinaciones, especialmente en temas controvertidos donde el modelo no tiene datos fiables.
- No se ha verificado la calidad del modelo base; la modificación mediante *abliteration* puede degradar el rendimiento general.
- El repositorio solo contiene el archivo imatrix, no los pesos. Para usar el modelo, es necesario descargar los GGUF del repositorio estático.
- Licencia Apache 2.0 permite uso comercial, pero el contenido generado puede violar términos de servicio de plataformas o leyes locales.
- Idioma limitado al inglés; no se garantiza un rendimiento adecuado en otros idiomas.

## Enlaces

- Repositorio actual (imatrix): https://huggingface.co/mradermacher/Qwen3.8-27B-absolute-heresy-i1-GGUF
- Modelo base: https://huggingface.co/MuXodious/Qwen3.8-27B-absolute-heresy
- Repositorio de quants estáticos: https://huggingface.co/mradermacher/Qwen3.8-27B-absolute-heresy-GGUF
- Guía de uso de GGUF (referencia de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
