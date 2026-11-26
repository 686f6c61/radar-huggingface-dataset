# gbuzhf/Inkling-2-Mini-UD-Q8_K_XL-MXFP8-Q8attn-abliterated-GGUF

## Resumen

Inkling-2-Mini es un modelo de lenguaje conversacional cuyo repositorio en Hugging Face ha sido publicado por el usuario gbuzhf bajo el identificador `gbuzhf/Inkling-2-Mini-UD-Q8_K_XL-MXFP8-Q8attn-abliterated-GGUF`. Se trata de una cuantización GGUF del modelo original, distribuida en formato listo para su uso con llama.cpp y compatible con endpoints. El nombre del repositorio indica una cuantización de tipo Q8_K_XL con atención en MXFP8 y Q8, además de una variante "abliterated", es decir, con la capa de rechazo (refusal) neutralizada mediante técnicas de edición de pesos.

El dato objetivo disponible es el número de parámetros: 26.070.390.272, aproximadamente 26.000 millones, lo que sitúa al modelo en la categoría de modelos densos de gran tamaño (cercanos a la familia 27B). El repositorio ocupa 38,8 GB, coherente con una cuantización de 8 bits de un modelo de ese tamaño. No se dispone de información sobre la arquitectura interna, la longitud de contexto, los idiomas soportados ni la licencia.

La relevancia de esta ficha es limitada por la escasez de metadatos publicados: el autor no ha documentado el modelo base original, el proceso de cuantización ni las condiciones de uso, y el acceso está restringido (gated), requiriendo aceptar condiciones en Hugging Face. Cualquier evaluación rigurosa del modelo requerirá consultar la documentación del modelo original de Inkling-2-Mini, que no se ha proporcionado en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 26.070.390.272 (~26B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF Q8_K_XL con atención MXFP8 y Q8 (según nombre del repo) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura del modelo en la información disponible. El nombre del repositorio sugiere un transformer denso de aproximadamente 26.000 millones de parámetros, pero no se confirma si emplea atención estándar, atención lineal, arquitectura híbrida o mezcla de expertos. Tampoco se dispone de datos sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF, DPO o similares.

La única innovación técnica documentada en el nombre del repositorio es la cuantización: se trata de una variante "UD" (probablemente Unsloth Dynamic, aunque no se confirma) en Q8_K_XL, con atención cuantizada en MXFP8 y Q8. La etiqueta "abliterated" indica que se ha aplicado una técnica de edición de pesos para eliminar la dirección de rechazo del modelo, lo que afecta al comportamiento conversacional y a las salvaguardas del modelo original. No se documenta el procedimiento exacto ni el impacto sobre el rendimiento.

## Capacidades

- Generación de texto conversacional multi-turno, según la etiqueta `conversational` del repositorio.
- Compatibilidad con endpoints (etiqueta `endpoints_compatible`), lo que sugiere integración con infraestructuras de despliegue tipo API.
- Ejecución mediante llama.cpp, dado el formato GGUF.
- Comportamiento "abliterated": el modelo ha sido modificado para reducir o eliminar los rechazos ante peticiones que el modelo original rechazaría.
- No se dispone de información sobre soporte de tool calling, function calling, agentes, razonamiento multi-paso, matemáticas, código, visión, audio ni modo thinking.
- No se dispone de información sobre capacidades multilingües concretas.

## Casos de uso

- Despliegue local en estaciones de trabajo con GPU de gran capacidad: al ser una cuantización de 8 bits de un modelo de ~26B, puede ejecutarse con llama.cpp en equipos con suficiente VRAM, permitiendo inferencia sin conexión y sin depender de APIs externas.
- Experimentación en investigación sobre alineación y seguridad: la variante "abliterated" permite estudiar el comportamiento de un modelo sin la capa de rechazo, útil para analizar sesgos y mecanismos de negativa en modelos de gran tamaño.
- Prototipado de asistentes conversacionales: la etiqueta `conversational` y la compatibilidad con endpoints facilitan integrar el modelo en un backend de chat para pruebas internas.
- Evaluación comparativa de cuantizaciones: el repositorio permite comparar el rendimiento de Q8_K_XL con atención MXFP8/Q8 frente a otras cuantizaciones del mismo modelo base, si están disponibles.
- Generación de texto en pipelines de procesamiento por lotes: con llama.cpp se puede servir el modelo en modo servidor para tareas de generación masiva en local.
- Docencia y formación técnica: sirve como ejemplo práctico de cuantización GGUF de un modelo de 26B y de las implicaciones de las variantes abliterated en el comportamiento del modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 38,8 GB, por lo que se necesita al menos esa cantidad de VRAM (o memoria unificada) para cargar los pesos completos en GPU. Con offloading parcial a RAM se puede reducir el requisito de VRAM a costa de latencia.
- GPU recomendadas: A100 80 GB, H100 80 GB, o GPUs con 48 GB o más (por ejemplo, RTX A6000, L40S) para carga completa. En GPUs de 24 GB (RTX 4090, 3090) no cabe la cuantización Q8 completa; sería necesario offloading o una cuantización menor.
- Cabe en consumer GPU: no en su configuración Q8 completa. Solo con offloading parcial o mediante cuantizaciones más agresivas (no incluidas en este repo).
- Opciones de despliegue: llama.cpp (formato nativo GGUF), servidor llama.cpp, y potencialmente Ollama si se importa el GGUF. No se confirma soporte de vLLM ni TGI para este formato.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se dispone de información sobre el modelo base original de Inkling-2-Mini ni sobre alternativas comparables en la información proporcionada.

## Limitaciones y advertencias

- Acceso restringido (gated): es necesario aceptar condiciones en Hugging Face antes de descargar el modelo.
- Licencia no disponible: no se puede confirmar si el uso comercial está permitido; se debe consultar al autor o al modelo original.
- Variante "abliterated": la eliminación de la capa de rechazo puede aumentar el riesgo de generar contenido dañino, sesgado o inapropiado, y reduce las salvaguardas del modelo original.
- Sin documentación de arquitectura, contexto, idiomas ni datos de entrenamiento: no es posible evaluar su idoneidad para producción con rigor.
- Riesgo de alucinación: no cuantificado, pero inherente a modelos de este tamaño sin datos de evaluación publicados.
- Sin benchmarks publicados: no se puede comparar su rendimiento con alternativas.
- Repositorio con 0 descargas y 1 like: no hay evidencia de uso comunitario ni validación externa.
- La cuantización Q8 puede introducir degradación respecto al modelo original en precisión completa, especialmente en tareas sensibles.

## Enlaces

- Hugging Face: https://huggingface.co/gbuzhf/Inkling-2-Mini-UD-Q8_K_XL-MXFP8-Q8attn-abliterated-GGUF
- No se han encontrado otros enlaces (papers, blogs, repos, demos) en la información disponible.
