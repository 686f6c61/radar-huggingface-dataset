# dicksondickson/DSV4-Flash-Vision-Exp-ablit-DS4-GGUF

## Resumen

El modelo `dicksondickson/DSV4-Flash-Vision-Exp-ablit-DS4-GGUF` es una cuantización GGUF del modelo `drowzeys/keys-DeepSeekV4Flash-Vision-EXP-ablit`, que a su vez es una versión "abliterada" del modelo multimodal experimental de DeepSeek `DeepSeek-V4-Flash-Vision-Exp`. El proceso de abliteración reduce el filtrado de seguridad del modelo original, lo que da lugar a respuestas con menos restricciones de contenido. Esta cuantización se ha preparado específicamente para ejecutarse con el motor DS4/DwarfStar de antirez, con soporte para Apple Silicon (Metal).

El modelo base, `DeepSeek-V4-Flash-Vision-Exp`, es el primer modelo multimodal de la familia DeepSeek-V4. Según la información disponible, añade módulos visuales a `DeepSeek-V4-Flash` y ha recibido entrenamiento adicional para comprensión visual, mejorando sustancialmente las capacidades de agentes multimodales. El repositorio de HuggingFace pesa 93.6 GB, lo que indica un modelo de gran tamaño, aunque no se han publicado especificaciones completas sobre el número de parámetros o la longitud de contexto. Este modelo está pensado para investigación y entornos controlados, no para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (modelo multimodal de la familia DeepSeek-V4) |
| Parametros totales | No disponible |
| Parametros activos | No disponible |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | GGUF (IQ2XXS-w2Q2K-AProjQ8-SExpQ8-OutQ8) |
| Idiomas soportados | Inglés, chino |
| Licencia | MIT (según model card; el modelo base DeepSeek tiene licencia propia) |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo es una cuantización GGUF del modelo abliterado `drowzeys/keys-DeepSeekV4Flash-Vision-EXP-ablit`. La cuantización se realizó utilizando la matriz de importancia (imatrix) recopilada del archivo GGUF de antirez `DeepSeek-V4-Flash-Vision-Exp-IQ2XXS-w2Q2K-AProjQ8-SExpQ8-OutQ8.gguf`, y siguiendo la plantilla de cuantización de `antirez/deepseek-v4-gguf`. El modelo base original, `DeepSeek-V4-Flash-Vision-Exp`, es el primer modelo multimodal experimental de la familia DeepSeek-V4: se construye sobre `DeepSeek-V4-Flash` añadiendo módulos visuales y entrenamiento adicional para comprensión visual. No se han publicado detalles sobre el proceso de entrenamiento del modelo base ni sobre las técnicas de abliteración aplicadas por drowzeys.

## Capacidades

- Comprensión visual: integra módulos visuales sobre `DeepSeek-V4-Flash`, lo que permite procesar imágenes y tareas multimodales.
- Capacidades de agente multimodal: según la información de Fireworks AI, el modelo base mejora sustancialmente las tareas de agentes que combinan visión y texto.
- Generación de texto: mantiene capacidades comparables en tareas de agentes que solo usan texto.
- Idiomas: soporta inglés y chino.
- Filtrado de seguridad reducido: al estar abliterado, el modelo responde con menos restricciones de contenido, lo que puede generar salidas sensibles o controvertidas.
- Compatibilidad con el motor DS4/DwarfStar: diseñado para ejecutarse en Apple Silicon mediante Metal.

## Casos de uso

- Investigación en alineación y seguridad: este modelo permite estudiar cómo afecta la abliteración al comportamiento de un modelo multimodal, comparando sus respuestas con las del modelo base con filtros.
- Análisis de imágenes en entornos controlados: puede utilizarse para extraer información de capturas de pantalla, diagramas o documentos escaneados en laboratorios de investigación.
- Prototipado de agentes multimodales: sirve para desarrollar asistentes que combinen texto e imágenes, probando flujos de razonamiento visual en un entorno de pruebas.
- Evaluación de cuantización extrema: la cuantización IQ2XXS permite probar el rendimiento de modelos muy comprimidos en Apple Silicon, validando la eficiencia del motor DS4/DwarfStar.
- Generación de contenido creativo experimental: al tener filtrado reducido, puede usarse para explorar descripciones de imágenes sin las restricciones habituales, siempre bajo supervisión.
- Pruebas de compatibilidad con hardware Apple: el soporte Metal y la etiqueta "apple-silicon" lo hacen adecuado para validar el despliegue de modelos GGUF multimodales en dispositivos con chips de Apple.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- El repositorio ocupa 93.6 GB, por lo que se requiere una GPU con al menos 96 GB de VRAM para cargar el modelo completo en memoria, o una CPU con suficiente RAM para ejecutar la cuantización.
- Diseñado para Apple Silicon (etiqueta "metal"): se recomienda ejecutarlo con el motor DS4/DwarfStar, disponible en https://github.com/antirez/ds4.
- No se dispone de datos de latencia o throughput para este modelo.

## Comparativa con modelos similares

| Modelo | Tipo | Licencia | Disponibilidad |
|---|---|---|---|
| dicksondickson/DSV4-Flash-Vision-Exp-ablit-DS4-GGUF | GGUF cuantizado, abliterado | MIT | HuggingFace |
| drowzeys/keys-DeepSeekV4Flash-Vision-EXP-ablit | Safetensors, abliterado | No disponible | HuggingFace |
| deepseek-ai/DeepSeek-V4-Flash-Vision-Exp | Modelo base multimodal | No disponible | HuggingFace |

## Limitaciones y advertencias

- Riesgo de contenido sensible o controvertido: el filtrado de seguridad se ha reducido significativamente, por lo que el modelo puede generar contenido inapropiado.
- No apto para todos los públicos: sus salidas pueden ser inadecuadas para entornos públicos, menores de edad o aplicaciones que requieran alta seguridad.
- Responsabilidades legales y éticas: el usuario es responsable de cumplir con las leyes locales y de gestionar los riesgos asociados al contenido generado.
- Uso recomendado para investigación: se aconseja utilizarlo en entornos controlados, evitando producción o aplicaciones comerciales.
- Sin garantías de seguridad: el modelo no ha pasado por una optimización rigurosa de seguridad, y el autor no se hace responsable de las consecuencias de su uso.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/dicksondickson/DSV4-Flash-Vision-Exp-ablit-DS4-GGUF
- Modelo base abliterado: https://huggingface.co/drowzeys/keys-DeepSeekV4Flash-Vision-EXP-ablit
- Modelo base original: https://huggingface.co/deepseek-ai/DeepSeek-V4-Flash-Vision-Exp
- Motor DS4/DwarfStar: https://github.com/antirez/ds4
- GGUF de antirez usado como plantilla: https://huggingface.co/antirez/deepseek-v4-gguf
- Información del modelo original en Fireworks AI: https://fireworks.ai/models/deepseek-ai/deepseek-v4-flash-vision-exp
- Información del modelo original en unsloth: https://huggingface.co/unsloth/DeepSeek-V4-Flash-Vision-Exp
