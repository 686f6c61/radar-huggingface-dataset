# darylap/Qwen3-1.7B-coreai-ios

## Resumen

Qwen3-1.7B-coreai-ios es una exportación del modelo Qwen3-1.7B del equipo Qwen al formato Core AI de Apple, publicada por el usuario darylap. No se trata de un entrenamiento nuevo ni de un ajuste fino: es una conversión de representación y cuantización del modelo base, realizada con la herramienta apple/coreai-models y el preset `qwen3_1_7b_6bit`, pensada para ejecutarse en dispositivos iOS 27 o posteriores.

El repositorio distribuye el artefacto `.aimodel` junto con los metadatos de exportación y los ficheros del tokenizer, y conserva el tokenizer y la plantilla de chat originales. La ventana de contexto configurada en la exportación es de 8.192 tokens y el repositorio ocupa 1,4 GB. La licencia es Apache 2.0, heredada sin modificaciones de la revisión upstream `70d244cc86ccca08cf5af4e1e306ecf908b1ad5e`.

Su relevancia es acotada pero clara: permite integrar un modelo de lenguaje de 1,7 mil millones de parámetros en aplicaciones iOS con inferencia local, sin depender de servicios en la nube. La exportación se publica como soporte de Hearth, un asistente local de escritura y documentos, por lo que su caso de uso principal es la asistencia de redacción en el propio dispositivo.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only del modelo base Qwen3-1.7B (la model card del repo no detalla la arquitectura) |
| Parametros totales | 1,7 mil millones (según la denominación del modelo base) |
| Parametros activos | no aplica; no es un modelo MoE según la información proporcionada |
| Longitud de contexto | 8.192 tokens (configurada en la exportación) |
| Tipos de cuantizacion | 6 bits, preset `qwen3_1_7b_6bit`; no se ofrecen otras cuantizaciones en este repo |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | `.aimodel` (Apple Core AI); no es safetensors, GGUF ni MLX |
| Autor de la exportacion | darylap |
| Modelo base | Qwen/Qwen3-1.7B |
| Revision upstream | `70d244cc86ccca08cf5af4e1e306ecf908b1ad5e` |
| Tamano del repositorio | 1,4 GB |
| Runtime requerido | Core AI en iOS 27 o posterior |
| Fecha de publicacion | 2026-10-04 |

## Arquitectura y entrenamiento

La información disponible corresponde únicamente al proceso de exportación, no al entrenamiento. El modelo base es Qwen3-1.7B, desarrollado por el equipo Qwen, y este repositorio aplica una conversión de representación y una cuantización a 6 bits mediante la herramienta apple/coreai-models, en la revisión `e7b24da85ea64a77d26324d7ce9607de9b955f57` y con el preset `qwen3_1_7b_6bit` para iOS. El comando exacto de exportación queda registrado en el fichero `EXPORT.md` del repositorio.

La conversión no altera el tokenizer ni la plantilla de chat originales, pero sí modifica el formato de los pesos y su precisión numérica. No se documentan en esta ficha el número de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO: esos datos corresponden a la model card upstream de Qwen3-1.7B, que no forma parte de la información proporcionada.

## Capacidades

- Generación de texto en formato conversacional, heredada del modelo base Qwen3-1.7B.
- Uso como asistente de escritura y edición de documentos, que es el propósito declarado de la exportación (proyecto Hearth).
- Inferencia completamente local en el dispositivo, sin llamadas a servicios externos.
- Conservación de la plantilla de chat original del modelo base, lo que mantiene el formato de turnos esperado por Qwen3.
- Soporte de tool calling, agentes, razonamiento multi-paso, matemáticas, código, visión o modo de pensamiento: no disponible en la información proporcionada para esta exportación.
- Capacidades multilingües: no disponible; la model card del repo no enumera idiomas.

## Casos de uso

- Asistente de redacción local en iOS: el modelo puede generar y reescribir borradores de texto directamente en el dispositivo, con los 8.192 tokens de contexto disponibles, sin que el contenido salga del terminal.
- Corrección y mejora de estilo en documentos: integrado en un editor, permite reescribir párrafos o frases con instrucciones en lenguaje natural, aprovechando que toda la inferencia ocurre en local.
- Resumen de notas y documentos breves: con 8.192 tokens de ventana se pueden resumir actas, correos largos o apuntes que quepan en ese presupuesto, manteniendo la confidencialidad del contenido.
- Borradores de correo electrónico y mensajes: generación de respuestas a partir de un contexto breve, útil en aplicaciones de correo que quieran ofrecer sugerencias sin coste de API.
- Autocompletado y sugerencias de escritura en apps de notas: dado el tamaño reducido (1,7 B de parámetros), es apto para completar frases con latencia baja en dispositivos compatibles, siempre que la verificación en dispositivo confirme el rendimiento.
- Funcionamiento sin conectividad: escenarios de uso en avión, zonas sin cobertura o entornos con requisitos de privacidad estrictos, donde no es viable un modelo servido en la nube.
- Base para experimentación en el ecosistema Core AI: sirve como referencia para desarrolladores que quieran probar el pipeline de exportación de apple/coreai-models con un modelo denso de tamaño pequeño antes de escalar a modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del repositorio remite explícitamente a la model card upstream de Qwen/Qwen3-1.7B para los datos de entrenamiento, evaluación y limitaciones. Tampoco se proporcionan métricas de latencia, throughput ni de consumo de memoria en tiempo de ejecución.

## Requisitos de hardware

- El repositorio ocupa 1,4 GB, correspondientes al artefacto `.aimodel` en cuantización de 6 bits más los ficheros del tokenizer.
- La model card advierte de forma explícita que el tamaño de los ficheros exportados no determina el requisito de memoria en tiempo de ejecución de un dispositivo concreto.
- Requiere Core AI en iOS 27 o posterior. El conjunto de dispositivos compatibles queda sujeto a verificación por parte del fabricante y no se detalla en la información proporcionada.
- No es un directorio de pesos de Transformers ni de MLX, por lo que no puede cargarse con vLLM, llama.cpp, Ollama, TGI ni con la librería `transformers` estándar.
- No se dispone de datos de latencia ni de throughput estimados.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| darylap/Qwen3-1.7B-coreai-ios | 1,7 B | 8.192 tokens | `.aimodel` (Core AI) | Apache 2.0 | HuggingFace; 0 descargas, 0 likes |
| Qwen/Qwen3-1.7B (modelo base) | 1,7 B | no disponible | no disponible | Apache 2.0 | HuggingFace (repositorio upstream) |
| Otras alternativas de ~1-2 B para on-device | no disponible | no disponible | no disponible | no disponible | no disponible |

La información proporcionada no incluye datos de rendimiento ni especificaciones detalladas de modelos alternativos, por lo que no es posible establecer una comparación cuantitativa con otras opciones de la misma categoría.

## Limitaciones y advertencias

- Se trata de una exportación con cuantización a 6 bits, no de los pesos originales; puede haber una pérdida de calidad respecto al modelo base que no se cuantifica en la información disponible.
- El contexto está limitado a 8.192 tokens, inferior al que pueda ofrecer el modelo base en otros formatos.
- La exportación está ligada al runtime Core AI y a iOS 27 o posterior; no es portable a Android, escritorio ni servidores.
- El rendimiento real y los niveles de dispositivo soportados están pendientes de verificación: la propia model card indica que el tamaño de los ficheros no establece el requisito de memoria en ejecución.
- No hay datos publicados de sesgos, tasas de alucinación ni comportamiento multilingüe para esta exportación concreta.
- El repositorio tiene 0 descargas y 0 likes, por lo que no existe evidencia de uso en producción ni validación por parte de terceros.
- El autor de la exportación es un usuario individual (darylap), no el equipo Qwen ni Apple; la garantía de calidad recae en quien la publica.
- La licencia Apache 2.0 permite uso comercial, pero al derivar del modelo base conviene revisar los términos aplicables al modelo upstream.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/darylap/Qwen3-1.7B-coreai-ios
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
- Revisión upstream utilizada: https://huggingface.co/Qwen/Qwen3-1.7B/tree/70d244cc86ccca08cf5af4e1e306ecf908b1ad5e
- Herramienta de exportación apple/coreai-models: https://github.com/apple/coreai-models/tree/e7b24da85ea64a77d26324d7ce9607de9b955f57

No se han encontrado enlaces adicionales relevantes en la búsqueda web realizada.
