# leonasu/Huihui-MiniCPM-V-4.6-abliterated

## Resumen

Huihui-MiniCPM-V-4.6-abliterated es una variante "abliterated" (sin mecanismos de rechazo) del modelo multimodal MiniCPM-V 4.6 de OpenBMB, publicada por el usuario leonasu en HuggingFace. El modelo base MiniCPM-V 4.6 es un modelo de imagen-a-texto (image-text-to-text) de tipo MiniCPM-V, disenado para tareas conversacionales multimodales. La variante abliterated elimina las respuestas de rechazo mediante una tecnica de "abliteration" que modifica los pesos del modelo para suprimir el comportamiento de negativa ante ciertas peticiones.

El modelo cuenta con aproximadamente 1.300 millones de parametros (1.300.428.016 segun los pesos en safetensors), lo que lo situa en la categoria de modelos pequenos y eficientes para despliegue en hardware modesto. El repositorio ocupa 2.6 GB y los pesos estan en formato safetensors. La licencia declarada es Apache 2.0.

Es relevante ahora porque combina capacidades multimodales (procesamiento de imagenes y texto) con un tamano reducido, lo que facilita su ejecucion en GPUs de consumo. Sin embargo, al tratarse de una version abliterated, presenta riesgos significativos de generar contenido sensible o inapropiado, y el propio autor advierte que no es apta para produccion ni para audiencias generales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MiniCPM-V (transformer multimodal, image-text-to-text) |
| Parametros totales | 1.300.428.016 (~1.3B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; se puede cuantizar con herramientas estandar) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura MiniCPM-V 4.6 de OpenBMB, un transformer multimodal disenado para tareas de imagen-a-texto. La variante abliterated se ha generado mediante la tecnica de abliteration, que identifica y suprime las direcciones de activacion asociadas con el comportamiento de rechazo en los pesos del modelo, sin reentrenamiento adicional. El autor describe la implementacion como una prueba de concepto "cruda" basada en la herramienta remove-refusals-with-transformers, que no utiliza TransformerLens.

No se dispone de informacion detallada sobre los datos de entrenamiento del modelo base (numero de tokens, composicion del dataset, uso de RLHF/DPO) en la informacion proporcionada. El modelo soporta procesamiento de imagenes con modos de downsample configurables ("16x" para uso general, "4x" para mayor detalle) y un parametro max_slice_nums de hasta 36, lo que sugiere capacidades de procesamiento de imagenes de alta resolucion mediante division en parches. Se recomienda Flash Attention 2 para aceleracion y ahorro de memoria en escenarios multi-imagen y video.

## Capacidades

- Generacion de texto conversacional multimodal: responde a preguntas sobre imagenes proporcionadas como entrada.
- Procesamiento de imagenes con modos de downsample configurables (16x para uso general, 4x para mayor detalle).
- Soporte de multi-imagen y video (se recomienda Flash Attention 2 para estos escenarios).
- Comprension de imagen-a-texto: descripcion, analisis y respuesta a preguntas sobre contenido visual.
- Generacion de texto libre sin mecanismos de rechazo (comportamiento abliterated).
- No se dispone de informacion sobre soporte de tool calling, function calling, agentes o modo thinking en la informacion proporcionada.
- Capacidades multilingues: no disponible.

## Casos de uso

- Investigacion sobre seguridad y alineacion: el modelo sirve como caso de estudio para analizar como la abliteration afecta al comportamiento de rechazo y que riesgos introduce en modelos multimodales, en entornos controlados de laboratorio.
- Analisis de imagenes en entornos de investigacion: procesamiento de imagenes cientificas o tecnicas donde se requiere descripcion detallada sin filtros de contenido, con revision manual posterior.
- Pruebas de robustez y red-teaming: evaluacion de la facilidad con la que un modelo multimodal puede ser modificado para eliminar salvaguardas, informando el diseno de futuros sistemas de seguridad.
- Experimentacion con tecnicas de abliteration: comparacion de la variante abliterated con el modelo base para medir el impacto en calidad, coherencia y sesgos.
- Prototipado de pipelines multimodales en local: gracias a sus ~1.3B parametros, puede ejecutarse en GPUs de consumo para experimentar con arquitecturas MiniCPM-V sin infraestructura dedicada.
- Docencia y formacion: demostracion practica de las implicaciones eticas y tecnicas de los modelos sin filtrado de seguridad en cursos de IA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2.6-3 GB en bfloat16 (pesos de ~2.6 GB); en cuantizacion de 8 bits ~1.3-1.5 GB; en 4 bits ~0.7-1 GB (estimaciones basadas en el numero de parametros, no confirmadas por el autor).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para bfloat16; RTX 3060, RTX 4060, RTX 4090, A100, H100 son compatibles.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU moderna de consumo con 4 GB o mas de VRAM.
- Opciones de despliegue: transformers (recomendado por el autor con AutoModelForImageTextToText y AutoProcessor); Flash Attention 2 recomendado para multi-imagen y video. No se confirma soporte de vLLM, llama.cpp, Ollama o TGI en la informacion proporcionada.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multimodal | Licencia | Notas |
|---|---|---|---|---|---|
| Huihui-MiniCPM-V-4.6-abliterated | ~1.3B | no disponible | Si (imagen-texto) | Apache 2.0 | Variante abliterated, sin filtrado de seguridad |
| openbmb/MiniCPM-V-4.6 (base) | no disponible | no disponible | Si (imagen-texto) | no disponible | Modelo original con salvaguardas |
| Otros MiniCPM-V de OpenBMB | no disponible | no disponible | Si (imagen-texto) | no disponible | Familia de modelos multimodales de OpenBMB |

No se dispone de datos de rendimiento comparativo en la informacion proporcionada.

## Limitaciones y advertencias

- Riesgo elevado de generar contenido sensible, controvertido o inapropiado: el filtrado de seguridad ha sido significativamente reducido mediante abliteration.
- No apta para todas las audiencias: los outputs pueden ser inapropiados para entornos publicos, usuarios menores de edad o aplicaciones que requieran alta seguridad.
- Responsabilidad legal y etica del usuario: el contenido generado puede conllevar riesgos legales o eticos; el usuario es el unico responsable de las consecuencias.
- Uso recomendado solo para investigacion, pruebas o entornos controlados; se desaconseja su uso directo en produccion o en aplicaciones comerciales de cara al publico.
- Se recomienda monitorizacion en tiempo real y revision manual de los outputs para evitar la difusion de contenido inapropiado.
- Sin garantias de seguridad por defecto: el modelo no ha pasado por optimizacion de seguridad rigurosa.
- Riesgo de alucinacion: no cuantificado en la informacion disponible, pero inherente a los modelos de lenguaje de este tamano.
- Limitaciones de contexto e idioma: no disponibles.
- La abliteration es una implementacion "cruda" de prueba de concepto, lo que puede afectar a la coherencia y calidad general del modelo en comparacion con el base.
- El autor original de la tecnica (huihui-ai) declina toda responsabilidad sobre las consecuencias de su uso.

## Enlaces

- HuggingFace: https://huggingface.co/leonasu/Huihui-MiniCPM-V-4.6-abliterated
- Modelo base: https://huggingface.co/openbmb/MiniCPM-V-4.6
- Repositorio de la tecnica de abliteration: https://github.com/Sumandora/remove-refusals-with-transformers
- Model card original referenciada: https://huggingface.co/huihui-ai/Huihui-MiniCPM-V-4.6-abliterated
- Ko-fi del autor de la tecnica: https://ko-fi.com/huihuiai
