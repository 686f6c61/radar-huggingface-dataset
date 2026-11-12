# mradermacher/Qwen3-REAP-15B-A3B-GGUF

## Resumen

Qwen3-REAP-15B-A3B-GGUF es una coleccion de cuantizaciones en formato GGUF del modelo Qwen3-REAP-15B-A3B, publicado por el usuario mradermacher. El modelo base es una poda (pruning) del Qwen3 original realizada por atbender mediante la tecnica REAP (Router-weighted Expert Activation Pruning), que reduce el numero de expertos activos de un modelo MoE para disminuir el coste de inferencia manteniendo el maximo rendimiento posible. El resultado es un modelo de aproximadamente 16.000 millones de parametros totales con unos 3.000 millones de parametros activos por token, de ahi el sufijo A3B.

La relevancia de esta publicacion es practica: ofrece el modelo podado en multiples niveles de cuantizacion (desde Q2_K hasta F16, incluyendo IQ4_XS y la familia Q3/Q4/Q5/Q6/Q8), lo que permite desplegarlo en hardware de consumo con llama.cpp u Ollama. El repositorio ocupa 53,2 GB en total, lo que refleja la suma de todas las variantes de cuantizacion incluidas.

No se dispone de informacion sobre la licencia, los idiomas soportados ni los datos de entrenamiento del modelo base en la informacion proporcionada. Se recomienda consultar la model card del modelo original de Qwen3 y del podado de atbender para obtener esos datos antes de un uso en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE), derivada de Qwen3 y podada con REAP |
| Parametros totales | 16.030.316.544 (aproximadamente 16,0 B) |
| Parametros activos | aproximadamente 3 B (sufijo A3B; valor exacto no disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | F16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K, IQ4_XS |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones estaticas generadas con llama.cpp) |

## Arquitectura y entrenamiento

El modelo base Qwen3-REAP-15B-A3B es una version podada del Qwen3 original. La tecnica REAP (Router-weighted Expert Activation Pruning) elimina expertos de la capa MoE ponderando su importancia por la activacion del router, de modo que se conservan los expertos mas utilizados y se descartan los de menor contribucion. Esto reduce el numero total de parametros y, sobre todo, el numero de expertos activos por token, rebajando los requisitos de memoria y el coste computacional en inferencia. El resultado conserva la estructura transformer con atencion por capas y feed-forward con mezcla de expertos del Qwen3 original.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo fases de RLHF o DPO en el modelo base. Tampoco se documenta en la informacion proporcionada ninguna innovacion adicional (decodificacion especulativa, atencion lineal, etc.). Las cuantizaciones de mradermacher son estaticas, generadas con la herramienta de cuantizacion de llama.cpp (quantize_version 2), e incluyen la variante IQ4_XS para maximizar la calidad por bit en entornos con poca VRAM.

## Capacidades

- Generacion de texto conversacional: el tag `conversational` del repositorio indica que el modelo esta orientado a dialogos multi-turno.
- Razonamiento y conocimiento general: heredado del Qwen3 original, aunque el grado exacto de degradacion por la poda no esta documentado.
- Generacion de codigo y matematicas: capacidades tipicas de la familia Qwen3; no se dispone de evaluaciones especificas del modelo podado.
- Soporte de tool calling / function calling: no confirmado en la informacion disponible para esta variante podada.
- Soporte de agentes y razonamiento multi-paso: no confirmado.
- Capacidades multilingues: no disponibles; dependen del modelo base Qwen3.
- Modo thinking: no confirmado para esta variante.
- Vision o audio: no disponible; el repositorio no incluye proyector multimodal (`skip_mmproj` vacio, sin mmproj).

## Casos de uso

- Despliegue en estaciones de trabajo con GPU de consumo: las variantes Q4_K_M e IQ4_XS permiten ejecutar el modelo en GPUs con 12-16 GB de VRAM mediante llama.cpp u Ollama, algo inviable con el Qwen3 MoE completo.
- Asistente conversacional local: el tag `conversational` y el formato GGUF lo hacen adecuado para chatbots en local con llama.cpp, sin dependencia de la nube.
- Prototipado rapido de aplicaciones de IA generativa: la disponibilidad de cuantizaciones desde Q2_K hasta F16 permite empezar con requisitos minimos y escalar la precision segun el hardware.
- Evaluacion comparativa de tecnicas de poda: util para investigadores que quieran medir la degradacion de calidad de REAP frente al Qwen3 original en tareas de razonamiento y generacion.
- Generacion de codigo en entornos con recursos limitados: si el modelo base conserva las capacidades de codigo de Qwen3, las variantes Q5_K_M o Q6_K ofrecen un equilibrio razonable entre calidad y VRAM para asistentes de programacion locales.
- Fine-tuning ligero o adaptacion con LoRA: el formato GGUF no es el ideal para entrenamiento, pero las variantes F16 o Q8_0 pueden servir como referencia de evaluacion antes de adaptar el modelo base en safetensors.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (aproximada, segun cuantizacion):
  - Q2_K: en torno a 6-7 GB.
  - Q3_K_S / Q3_K_M / Q3_K_L: en torno a 8-9 GB.
  - IQ4_XS / Q4_K_S / Q4_K_M: en torno a 9-11 GB.
  - Q5_K_S / Q5_K_M: en torno a 11-13 GB.
  - Q6_K: en torno a 13-15 GB.
  - Q8_0: en torno a 17-18 GB.
  - F16: en torno a 32 GB.
- GPU recomendadas: RTX 3060 12 GB o RTX 4060 Ti 16 GB para Q4; RTX 4090 24 GB para Q6/Q8; A100 40 GB o H100 para F16.
- Cabe en GPU de consumo: si, en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070 Ti Super 16 GB y RTX 4090 24 GB con las cuantizaciones adecuadas.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y cualquier runtime compatible con GGUF. El tag `endpoints_compatible` sugiere compatibilidad con endpoints de Hugging Face.
- Latencia y throughput: no disponibles; dependen del hardware y de la cuantizacion elegida.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen3-REAP-15B-A3B-GGUF (este) | 16,0 B | aproximadamente 3 B | no disponible | no disponible | GGUF |
| Qwen3-REAP-15B-A3B (base de atbender) | 16,0 B | aproximadamente 3 B | no disponible | no disponible | safetensors |
| Qwen3 MoE original | no disponible en la informacion | no disponible | no disponible | no disponible | safetensors |

No se dispone de datos de rendimiento comparado entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- La poda REAP elimina expertos del modelo original; es esperable cierta degradacion de calidad respecto al Qwen3 completo, aunque no se han publicado evaluaciones que la cuantifiquen.
- Las cuantizaciones de baja precision (Q2_K, Q3_K_S) pueden degradar notablemente el razonamiento y la coherencia; se recomienda Q4_K_M o superior para uso en produccion.
- Riesgo de alucinacion inherente a los modelos de lenguaje; no hay datos especificos de esta variante.
- Licencia no disponible: no se puede confirmar el uso comercial sin consultar la licencia del modelo base Qwen3 y del podado de atbender.
- Idiomas soportados no documentados; el rendimiento en castellano no esta verificado.
- Longitud de contexto no disponible; no se debe asumir la ventana del Qwen3 original sin comprobacion.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validacion de la comunidad.
- El formato GGUF esta pensado para inferencia, no para entrenamiento o fine-tuning completo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/Qwen3-REAP-15B-A3B-GGUF
- Modelo base podado: https://huggingface.co/atbender/Qwen3-REAP-15B-A3B
