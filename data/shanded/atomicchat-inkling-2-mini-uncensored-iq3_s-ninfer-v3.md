# SHanded/AtomicChat-Inkling-2-Mini-Uncensored-IQ3_S-NInfer-v3

## Resumen

AtomicChat-Inkling-2-Mini-Uncensored-IQ3_S-NInfer-v3 es una conversión de cuantización del modelo AtomicChat/Inkling-2-Mini-Uncensored-GGUF, publicada por el usuario SHanded. Se trata de una variante "uncensored" y "abliterated" del modelo Inkling-2-Mini, es decir, una versión en la que se ha aplicado la técnica de abliteration para eliminar los mecanismos de rechazo aprendidos durante el alineamiento, de modo que el modelo responde a peticiones que un modelo alineado convencional rechazaría. El repositorio no aporta información sobre el desarrollador original del modelo base ni sobre su arquitectura interna.

El artefacto publicado es una cuantización IQ3_S (aproximadamente 3 bits por peso con escalado inteligente) empaquetada en el formato propietario NInfer, asociado a la librería `ninfer`. El tamaño del repositorio es de 14,5 GB, lo que sugiere un modelo base con un número de parámetros considerable, aunque el dato exacto no se especifica en la información disponible. La licencia declarada es Apache 2.0.

La relevancia de esta ficha es acotada: se trata de una conversión derivada, no de un modelo original, y la información técnica publicada por el autor es mínima (una sola frase que describe la conversión). Cualquier evaluación rigurosa debería remitirse al modelo base y a su model card original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible (el tamano del repo, 14,5 GB en IQ3_S, sugiere un modelo de decenas de miles de millones de parametros, pero no se confirma) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | IQ3_S (unica variante publicada en este repo); el modelo base ofrece GGUF con otras cuantizaciones |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | NInfer (libreria `ninfer`); el modelo base esta en GGUF |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura del modelo base Inkling-2-Mini en la documentación proporcionada. Por la nomenclatura y el ecosistema (conversión a GGUF y a NInfer, etiquetas "uncensored" y "abliterated"), se trata presumiblemente de un transformer decoder-only, pero este dato no se confirma en la información disponible. Tampoco se especifican el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron fases de RLHF o DPO.

La única innovación técnica documentada es el proceso de conversión: el autor toma la cuantización IQ3_S del modelo base en GGUF y la reempaqueta en el formato NInfer para su uso con la librería `ninfer`. La etiqueta "abliterated" indica que el modelo base ha sido sometido a una modificación de sus direcciones de activación para suprimir el comportamiento de rechazo, pero no se detalla la metodología empleada.

## Capacidades

- Generación de texto sin las restricciones de rechazo típicas de los modelos alineados, según la etiqueta "uncensored" y "abliterated".
- Se desconoce si soporta tool calling, function calling o razonamiento multi-paso; no disponible.
- Se desconoce si tiene modo de razonamiento explícito (thinking mode); no disponible.
- Se desconocen las capacidades multilingües concretas; no disponible.
- No se documentan capacidades de visión, audio ni multimodalidad.

## Casos de uso

- Investigación sobre alineamiento y seguridad: el modelo permite estudiar cómo se comporta una variante abliterated frente a la versión alineada en tareas de red-teaming y evaluación de rechazos, comparando respuestas ante el mismo conjunto de prompts.
- Generación de ficción y narrativa adulta: al no aplicar filtros de contenido, puede emplearse en entornos controlados para redactar narrativa con temáticas que los modelos alineados bloquean, siempre que el uso cumpla la legislación aplicable.
- Evaluación de cuantizaciones: sirve para medir la degradación de calidad de IQ3_S frente a cuantizaciones mayores del mismo modelo base en tareas de generación libre, útil para decidir qué variante desplegar.
- Pruebas de pipelines de inferencia con NInfer: al ser un artefacto específico de la librería `ninfer`, permite validar el rendimiento y la compatibilidad de esta herramienta en entornos de desarrollo.
- Experimentación con modelos derivados: útil para quienes investigan el efecto de la abliteration sobre capacidades como razonamiento o código, comparando contra el modelo base sin modificar.
- Despliegue en entornos de investigación aislados: su tamaño de 14,5 GB en IQ3_S permite ejecutarlo en hardware de gama alta de consumo, lo que facilita experimentación local sin infraestructura de datacenter.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 14,5 GB en IQ3_S, por lo que se necesita al menos ese espacio en memoria (más overhead de contexto y KV cache) para inferencia.
- GPU recomendadas: no disponible; por el tamaño del artefacto, encajaría en GPUs con 24 GB o más de VRAM (RTX 3090, RTX 4090, A10G, L4 con holgura limitada), aunque no se confirma.
- Cabe en GPU de consumo: probablemente en RTX 3090/4090 (24 GB) y posiblemente en GPUs de 16 GB con contexto reducido, pero no está confirmado.
- Opciones de despliegue: la librería `ninfer` es el runtime previsto para este artefacto; para el modelo base en GGUF se podría usar llama.cpp u Ollama, pero no se documenta compatibilidad de este repo con esos motores.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| AtomicChat-Inkling-2-Mini-Uncensored-IQ3_S-NInfer-v3 | no disponible | no disponible | Apache 2.0 | NInfer | Conversion IQ3_S del modelo base; solo 3 likes y 2329 descargas |
| AtomicChat/Inkling-2-Mini-Uncensored-GGUF | no disponible | no disponible | no disponible | GGUF | Modelo base del que deriva esta conversion; presumiblemente con mas cuantizaciones |
| Modelos abliterated comparables | no disponible | no disponible | no disponible | no disponible | No se dispone de datos de alternativas concretas en la informacion proporcionada |

## Limitaciones y advertencias

- La información técnica publicada es mínima: una sola frase de model card. No hay datos verificables sobre arquitectura, parámetros, contexto ni entrenamiento.
- El modelo es "uncensored" y "abliterated": no aplica filtros de seguridad, lo que implica riesgo de generar contenido dañino, ilegal o sexualmente explícito. No es apto para producción orientada al público sin capas de moderación externas.
- Riesgo elevado de alucinación y de respuestas factualmente incorrectas, agravado por la cuantización IQ3_S, que degrada la calidad respecto a precisiones mayores.
- La abliteration puede degradar capacidades generales (razonamiento, código, instrucciones) además de eliminar los rechazos; no se han publicado evaluaciones que cuantifiquen ese impacto.
- Licencia Apache 2.0 declarada, pero el modelo base podría tener condiciones adicionales no reflejadas en este repositorio; conviene verificar la licencia del modelo original antes de un uso comercial.
- El formato NInfer es específico de la librería `ninfer`, lo que limita la portabilidad frente a GGUF y puede complicar el despliegue en infraestructuras estándar (vLLM, TGI, llama.cpp).
- Solo 3 likes y 2329 descargas: comunidad pequeña, sin garantías de mantenimiento ni soporte.
- Uso comercial: la licencia Apache 2.0 lo permite nominalmente, pero la naturaleza uncensored del modelo puede incumplir normativas de servicios digitales o de contenido en determinadas jurisdicciones; se recomienda asesoramiento legal.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/SHanded/AtomicChat-Inkling-2-Mini-Uncensored-IQ3_S-NInfer-v3
- Modelo base: https://huggingface.co/AtomicChat/Inkling-2-Mini-Uncensored-GGUF
