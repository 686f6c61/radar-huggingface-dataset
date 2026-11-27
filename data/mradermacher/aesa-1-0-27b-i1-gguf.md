# mradermacher/Aesa-1.0-27B-i1-GGUF

## Resumen

Aesa-1.0-27B-i1-GGUF es una recuantizacion en formato GGUF del modelo Aesa-1.0-27B, publicada por el usuario mradermacher en Hugging Face. El modelo base, alojado originalmente por TheHerecy, cuenta con 27.320.697.856 parametros segun los pesos en safetensors, lo que lo situa en la categoria de modelos densos de aproximadamente 27B. Esta version emplea cuantizaciones ponderadas con matriz de importancia (imatrix), una tecnica que busca preservar mejor la calidad del modelo original al reducir la precision de los pesos.

La relevancia de esta publicacion radica en que facilita la ejecucion local del modelo en hardware de consumo mediante el formato GGUF, compatible con herramientas como llama.cpp u Ollama. El repositorio, de 40 GB, incluye un amplio abanico de niveles de cuantizacion, desde IQ1_S hasta Q6_K, lo que permite ajustar el equilibrio entre calidad y requisitos de memoria. La model card indica que se trata de un modelo de tipo conversacional, aunque no se proporcionan detalles sobre arquitectura interna, datos de entrenamiento ni resultados de evaluacion.

La informacion disponible es muy limitada: no se especifican licencia, idiomas soportados, longitud de contexto ni pipeline. El autor del modelo original no ha publicado una model card detallada en la informacion proporcionada, por lo que varios apartados de esta ficha se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo denso de ~27B, segun recuento de parametros) |
| Parametros totales | 27.320.697.856 |
| Parametros activos | no aplica (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, IQ3_M, Q4_K_S, IQ3_XXS, Q3_K_M, small-IQ4_NL, Q4_K_M, IQ2_M, Q6_K, IQ4_XS, Q2_K_S, IQ1_M, Q3_K_S, IQ2_XXS, Q3_K_L, IQ2_XS, Q5_K_S, IQ2_S, IQ1_S, Q5_K_M, Q4_0, IQ3_XS, Q4_1, IQ3_S |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones derivadas de safetensors del modelo base) |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del modelo base Aesa-1.0-27B en los datos proporcionados. El recuento de parametros (27.320.697.856) es coherente con un transformer denso de aproximadamente 27B, pero no se confirma el tipo de atencion, la presencia de capas MoE ni innovaciones como atencion lineal o decodificacion especulativa.

Tampoco se detallan los datos de entrenamiento: numero de tokens, composicion del corpus, uso de RLHF o DPO, ni tecnicas de alineacion. La unica informacion tecnica relevante es que las cuantizaciones de este repositorio se generaron con matrices de importancia (imatrix) y cuantizacion ponderada, un proceso que estima la importancia de cada tensor para minimizar la perdida de calidad en niveles bajos de bits. El autor etiqueta el resultado como compatible con endpoints y de uso conversacional.

## Capacidades

- Generacion de texto conversacional: el modelo esta etiquetado como "conversational", lo que sugiere uso en dialogos multi-turno.
- Razonamiento y generacion de texto general: no se documentan capacidades especificas mas alla de la generacion.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible (no se listan idiomas).
- Capacidades especiales (modo thinking, vision, audio): no disponible.
- Despliegue local: al estar en formato GGUF, es ejecutable con llama.cpp y derivados, lo que constituye una capacidad practica relevante.

## Casos de uso

- Asistente conversacional local: el modelo puede desplegarse en estaciones de trabajo con llama.cpp u Ollama para mantener conversaciones multi-turno sin conexion, usando cuantizaciones Q4_K_M o Q5_K_M para equilibrar calidad y memoria.
- Prototipado de chatbots en entornos con GPU de consumo: gracias a las cuantizaciones IQ2/IQ3, es posible ejecutar el modelo en GPUs con 12-16 GB de VRAM, lo que permite experimentar con un modelo de 27B sin infraestructura de servidor.
- Generacion de texto en pipelines offline: integrable en scripts de procesamiento por lotes mediante llama.cpp, adecuado para tareas de redaccion, resumen o reescritura donde no se requiera baja latencia.
- Evaluacion comparativa de cuantizaciones: el repositorio incluye 24 variantes, lo que permite medir la degradacion de calidad entre IQ1_S y Q6_K en tareas concretas y elegir el nivel optimo para un caso de uso.
- Educacion e investigacion: util para estudiar el efecto de las tecnicas imatrix en modelos de ~27B, comparando salidas entre cuantizaciones del mismo modelo base.
- Despliegue en entornos con restricciones de red: al ser un artefacto autocontenido en GGUF, puede distribuirse a maquinas aisladas y ejecutarse sin dependencias de servicios en la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (aproximada, segun el tamano del archivo GGUF y el nivel de cuantizacion; el repo completo ocupa 40 GB):
  - IQ1_S / IQ2_XXS / IQ2_XS / IQ2_S / IQ2_M: en torno a 7-10 GB, aptas para GPUs de 8-12 GB.
  - IQ3_XXS / IQ3_XS / IQ3_S / IQ3_M / Q3_K_S / Q3_K_M / Q3_K_L: en torno a 11-14 GB, aptas para GPUs de 12-16 GB.
  - IQ4_XS / small-IQ4_NL / Q4_0 / Q4_1 / Q4_K_S / Q4_K_M: en torno a 15-18 GB, requieren GPUs de 16-24 GB.
  - Q5_K_S / Q5_K_M: en torno a 18-20 GB, requieren GPUs de 24 GB.
  - Q6_K: en torno a 22-24 GB, al limite de una RTX 4090 (24 GB) o en A100/H100.
- GPU recomendadas: RTX 4090 (24 GB) para Q4-Q6; RTX 3090, RTX 4080 o A6000 para cuantizaciones medias; A100 40/80 GB y H100 para despliegue de mayor calidad y concurrencia.
- Cabe en GPU de consumo: si, en RTX 3060 12 GB, RTX 4070, RTX 4080 y RTX 4090 con cuantizaciones adecuadas; en GPUs de 8 GB solo con IQ1/IQ2 y contexto reducido.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui (oobabooga) y servidores compatibles con GGUF. vLLM y TGI no soportan GGUF de forma nativa en todas sus versiones, por lo que requeririan el modelo base en safetensors.
- Latencia y throughput: no disponibles; dependeran de la GPU, la cuantizacion y la longitud de contexto.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones del modelo base que permitan una comparacion rigurosa. Se indica "no disponible" para los modelos alternativos de la misma categoria (modelos densos de ~27B en GGUF), ya que no se conocen sus parametros, contexto ni rendimiento a partir de la informacion proporcionada.

| Modelo | Parametros | Contexto | Licencia | Formato |
|---|---|---|---|---|
| Aesa-1.0-27B-i1-GGUF | 27,3B | no disponible | no disponible | GGUF |
| Alternativas de ~27B | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Ausencia de model card detallada: no se documentan sesgos, datos de entrenamiento ni evaluaciones, lo que impide valorar riesgos de alucinacion o sesgo de forma fundamentada.
- Licencia desconocida: no se especifica la licencia, por lo que no puede confirmarse el uso comercial; es imprescindible verificar la licencia del modelo base TheHerecy/Aesa-1.0-27B antes de cualquier despliegue en produccion.
- Idiomas no declarados: no se garantiza un rendimiento adecuado en castellano ni en otros idiomas distintos del que se haya usado en el entrenamiento.
- Longitud de contexto desconocida: no puede planificarse su uso en tareas de contexto largo.
- Cuantizaciones muy agresivas: las variantes IQ1 e IQ2 pueden degradar notablemente la coherencia y el razonamiento; se recomienda Q4_K_M o superior para uso serio.
- Riesgo de alucinacion: inherente a los modelos generativos; sin evaluaciones publicadas, no hay evidencia de mitigacion.
- Repositorio sin descargas ni likes: no hay senales de validacion por parte de la comunidad en el momento de la consulta.
- Fecha de creacion futura en los metadatos (2026-11-27): conviene verificar la integridad y procedencia del repositorio antes de confiar en el.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Aesa-1.0-27B-i1-GGUF
- Modelo base: https://huggingface.co/TheHerecy/Aesa-1.0-27B
