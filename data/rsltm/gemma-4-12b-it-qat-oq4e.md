# RSLtm/gemma-4-12B-IT-QAT-oQ4e

## Resumen

RSLtm/gemma-4-12B-IT-QAT-oQ4e es una cuantizacion comunitaria de un modelo de la familia Gemma, publicada por el usuario RSLtm en HuggingFace. Segun los metadatos del repositorio, se trata de una conversion a 4 bits del modelo base denominado gemma-4-12B-IT-QAT, realizada con la herramienta oQ de oMLX (version v0.7.0.dev2) mediante cuantizacion de precision mixta. El identificador interno de arquitectura declarado por el autor es gemma4_unified y el formato de pesos es MLX safetensors, por lo que el artefacto esta pensado para ejecutarse en el ecosistema MLX de Apple.

El modelo cuenta con 11.959.730.224 parametros reales (aproximadamente 12.000 millones), verificados a partir de los pesos en safetensors, y el repositorio ocupa 7,1 GB. La cuantizacion declarada es de 4 bits con tamano de grupo 64. Todo apunta a una variante instruction-tuned (sufijo IT) entrenada con quantization-aware training (QAT) en origen, es decir, que el propio modelo base fue entrenado contemplando la cuantizacion posterior.

La relevancia de esta ficha es limitada pero concreta: se trata de un artefacto publicado muy recientemente (17 de septiembre de 2026) con cero descargas y cero likes, sin model card extendida, sin licencia declarada y sin resultados de benchmarks. Es util como ejemplo del flujo de cuantizacion mixta con oQ sobre modelos Gemma de ~12B para inferencia local en Mac, pero cualquier uso en produccion exige verificar primero la licencia del modelo base y validar la calidad de la cuantizacion, ya que no hay evidencia publica de evaluacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | gemma4_unified (segun metadatos del autor); detalles de la arquitectura base no disponibles |
| Parametros totales | 11.959.730.224 (aproximadamente 12B), dato real de safetensors |
| Parametros activos | No aplica (no hay indicios de que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits, group size 64, precision mixta (oQ / oMLX v0.7.0.dev2) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | MLX safetensors (cuantizado) |
| Libreria de inferencia | mlx |
| Tamano del repositorio | 7,1 GB |
| ID en HuggingFace | RSLtm/gemma-4-12B-IT-QAT-oQ4e |
| Autor | RSLtm |
| Fecha de creacion | 17 de septiembre de 2026 |
| Ultima actualizacion | 17 de septiembre de 2026 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La informacion proporcionada no incluye detalles sobre la arquitectura interna del modelo base (numero de capas, dimensiones de atencion, tipo de atencion, uso de RoPE, normalizacion o vocabulario). El unico dato fiable es la etiqueta de arquitectura declarada por el autor, gemma4_unified, y el nombre del modelo, que sugiere una variante de la familia Gemma de aproximadamente 12.000 millones de parametros en version instruction-tuned. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni las tecnicas de alineacion empleadas (RLHF, DPO u otras).

Respecto al proceso de cuantizacion, la model card indica que el modelo se cuantizo con oQ (oMLX v0.7.0.dev2) mediante cuantizacion de precision mixta, con 4 bits de precision y tamano de grupo 64, en formato MLX safetensors. La nomenclatura QAT en el nombre del modelo indica que el modelo base fue sometido a quantization-aware training, de modo que la cuantizacion a 4 bits no es una simple conversion post-entrenamiento, sino que el modelo fue expuesto al ruido de cuantizacion durante el entrenamiento. La eleccion de precision mixta implica que distintas capas o tensores reciben distintos niveles de precision dentro del esquema general de 4 bits, una tecnica habitual para preservar las capas mas sensibles (por ejemplo, las proyecciones de atencion o los embeddings) a costa de un mayor tamano final.

## Capacidades

- Generacion de texto conversacional: el sufijo IT del modelo base indica una variante ajustada para seguir instrucciones y mantener dialogos multi-turno.
- Razonamiento y conocimiento general: capacidades esperables en un modelo denso de ~12B de la familia Gemma, si bien no hay evaluaciones publicadas que lo confirmen en esta version cuantizada.
- Capacidades multilingues: no disponible. No se declara la lista de idiomas soportados en los metadatos ni en la model card.
- Tool calling / function calling: no disponible. No se documenta soporte explicito de llamadas a herramientas.
- Soporte de agentes y razonamiento multi-paso: no disponible. No hay informacion sobre modos de pensamiento extendido ni sobre integracion con frameworks de agentes.
- Capacidades especiales (vision, audio, thinking mode): no disponible. La etiqueta gemma4_unified no permite inferir de forma fiable si existe torre de vision o procesamiento multimodal.

## Casos de uso

- Inferencia local en Mac para prototipado: el formato MLX safetensors permite cargar el modelo con mlx-lm en un equipo Apple Silicon, de modo que un desarrollador puede probar un modelo de ~12B en 4 bits sin depender de servicios en la nube ni de GPU dedicadas.
- Asistentes conversacionales de escritorio: al ser una variante instruction-tuned, encaja en aplicaciones de chat locales con historial de conversacion, siempre que se valide previamente la calidad tras la cuantizacion mixta.
- Evaluacion comparativa de tecnicas de cuantizacion: el artefacto es util como punto de referencia frente a cuantizaciones uniformes de 4 bits del mismo modelo base, para medir la perdida de calidad introducida por el esquema de oQ y por el group size 64.
- Generacion de texto en pipelines offline: tareas de resumen, reescritura o clasificacion por lotes ejecutadas en local, donde la ausencia de coste por token y la privacidad de los datos son requisitos prioritarios.
- Educacion e investigacion sobre QAT: sirve para estudiar como se comporta un modelo entrenado con quantization-aware training cuando se le aplica ademas una cuantizacion mixta posterior, un escenario relevante para quienes investigan compresion de modelos.
- Base para despliegues con requisitos de privacidad: al ejecutarse integramente en hardware local, es apto para entornos donde los datos no pueden salir del dispositivo, sujeto a la verificacion de la licencia del modelo base.
- Pruebas de integracion en aplicaciones de escritorio para macOS: el ecosistema MLX esta orientado a este sistema, por lo que el modelo puede integrarse en herramientas nativas de Mac mediante la API de mlx-lm.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye evaluaciones de MMLU, HumanEval, GSM8K ni de ninguna otra suite, y la busqueda web realizada no ha devuelto documentacion tecnica asociada al modelo (los resultados obtenidos corresponden a un servicio de transferencia de ficheros sin relacion con el artefacto).

## Requisitos de hardware

- Pesos en 4 bits: aproximadamente 6-7 GB, coherente con los 7,1 GB que ocupa el repositorio completo.
- Memoria unificada recomendada en Apple Silicon: 16 GB como minimo para cargar el modelo con margen reducido para el contexto; 24-32 GB si se trabaja con contextos largos o varias peticiones concurrentes. El consumo de la cache KV depende de la longitud de contexto, que no esta documentada.
- Compatibilidad con GPU de consumidor: el formato es MLX, disenado para Apple Silicon, por lo que no se ejecuta directamente en GPUs NVIDIA o AMD mediante CUDA o ROCm. Para usar una RTX 4090 o similar seria necesario convertir los pesos a otro formato (por ejemplo GGUF), una conversion que este repositorio no proporciona.
- Opciones de despliegue: mlx-lm (carga y generacion), servidor HTTP de mlx-lm, y herramientas basadas en oMLX. vLLM y TGI no soportan pesos MLX de forma nativa; llama.cpp y Ollama requeririan una conversion a GGUF no incluida en el repositorio.
- Latencia y throughput: no disponible. No se han publicado mediciones de tokens por segundo ni de tiempo hasta el primer token.

## Comparativa con modelos similares

La busqueda web no ha devuelto informacion sobre modelos comparables, por lo que no es posible establecer una comparativa con datos verificables. La tabla siguiente recoge unicamente los campos conocidos de este artefacto y deja el resto como no disponible.

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Formato | Rendimiento |
|---|---|---|---|---|---|---|
| RSLtm/gemma-4-12B-IT-QAT-oQ4e | 11,96B | no disponible | 4 bits, group size 64, precision mixta | no disponible | MLX safetensors | no disponible |
| Alternativas de la misma categoria (Gemma 12B, Qwen 14B u otras) | no disponible en la informacion proporcionada | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Ausencia de licencia declarada: el repositorio no especifica terminos de uso. Sin una licencia explicita no se puede asumir permiso para uso comercial, y ademas debe verificarse la licencia del modelo base subyacente, que podria imponer restricciones adicionales.
- Artefacto sin validacion comunitaria: cero descargas y cero likes en el momento de la consulta, con una unica actualizacion el mismo dia de creacion. No hay evidencia de que la cuantizacion haya sido evaluada por terceros.
- Riesgo de degradacion por cuantizacion: aunque el modelo base fue entrenado con QAT, la aplicacion posterior de una cuantizacion mixta de 4 bits con group size 64 puede introducir perdidas de calidad adicionales no medidas ni documentadas.
- Riesgo de alucinacion: no disponible como dato especifico, pero es una limitacion inherente a los modelos de lenguaje de esta escala; la ausencia de evaluaciones impide cuantificarlo en esta version.
- Idiomas y contexto desconocidos: no se declara la lista de idiomas soportados ni la longitud maxima de contexto, lo que impide garantizar el comportamiento en castellano o en tareas que requieran ventanas largas.
- Sesgos: no disponible. No hay informacion sobre la composicion del dataset de entrenamiento ni sobre analisis de sesgo del modelo base.
- Dependencia de plataforma: al estar en formato MLX, el uso queda practicamente restringido a hardware Apple Silicon salvo que se realice una conversion a otro formato, que no se incluye.
- Nomenclatura ambigua: el nombre del modelo (gemma-4-12B) no se corresponde con identificadores de version ampliamente documentados en la informacion disponible, por lo que conviene confirmar el modelo base exacto con el autor antes de integrarlo en cualquier flujo de trabajo.
- Fecha de publicacion: el repositorio esta fechado en septiembre de 2026, lo que lo situa como un artefacto muy reciente y sin historial de mantenimiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/RSLtm/gemma-4-12B-IT-QAT-oQ4e
- Herramienta de cuantizacion oQ (oMLX): https://github.com/jundot/omlx
- Paper, blog o repositorio del modelo base: no disponible en la informacion proporcionada
- Demos o espacios asociados: no disponible en la informacion proporcionada
