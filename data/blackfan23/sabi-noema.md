# blackfan23/sabi-noema

## Resumen

`blackfan23/sabi-noema` es una versión cuantizada a 4 bits del modelo `sabicap/sabi-noema`, publicada por Julius (@blackfan23). No se trata de un modelo entrenado desde cero, sino de una conversión de pesos mediante Apple MLX (`mlx.core.quantize`) con cuantización affine de 4 bits y tamaño de grupo 64. El resultado reduce el peso original de aproximadamente 50,96 GB a unos 16,22 GB, lo que facilita la inferencia local en equipos Apple Silicon con memoria unificada limitada.

El modelo conserva 27.356.728.560 parámetros totales y se distribuye en formato safetensors para MLX bajo licencia Apache 2.0. La etiqueta `qwen3_5` sugiere una arquitectura de la familia Qwen 3.5, aunque la model card no detalla la arquitectura, la longitud de contexto, los idiomas soportados ni el proceso de entrenamiento. Tampoco se han publicado benchmarks en la información disponible.

Su relevancia es práctica: permite probar y desplegar un modelo de aproximadamente 27B en un Mac con 24-32 GB de memoria unificada, a costa de una posible pérdida de calidad por la cuantización. Es adecuado para experimentación local, prototipado con requisitos de privacidad y evaluación de la degradación frente a los pesos originales, no para decisiones de producción sin validación previa.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de la familia Qwen 3.5 según el tag `qwen3_5`; no confirmado en la model card |
| Parámetros totales | 27.356.728.560 (27,36 B) |
| Parámetros activos | No disponible; no se indica que sea un modelo MoE |
| Longitud de contexto | No disponible |
| Tipos de cuantización | 4-bit affine, group size 64, mediante `mlx.core.quantize`; 581 capas lineales cuantizadas y 603 tensores mantenidos sin cuantizar (norms, conv1d, biases 1D, embeddings) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors para MLX |
| Modelo base | `sabicap/sabi-noema` |
| Tamaño de pesos originales | ~50,96 GB |
| Tamaño de pesos cuantizados | ~16,22 GB |
| Tamaño del repositorio | 17,4 GB |
| Librería | MLX |
| Pipeline | No disponible |
| Autor de la conversión | blackfan23 (Julius) |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna ni el entrenamiento del modelo base. El tag `qwen3_5` apunta a un transformer decoder-only de la familia Qwen 3.5, pero no hay confirmación explícita en la documentación proporcionada. Tampoco se indican el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de alineación como RLHF o DPO.

La innovación técnica de este repositorio es la cuantización post-entrenamiento con Apple MLX: 581 capas lineales se convierten a 4 bits en modo affine con group size 64, mientras que 603 tensores relacionados con normalizaciones, convoluciones 1D, biases 1D y embeddings se mantienen sin cuantizar. No se documentan técnicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Conversión MLX 4-bit: única capacidad verificada; los pesos están preparados para cargarse con el ecosistema MLX.
- Generación de texto: capacidad esperada por tratarse de un modelo de lenguaje, pero no documentada en la información disponible.
- Razonamiento y matemáticas: no disponible.
- Generación de código: no disponible.
- Tool calling o function calling: no disponible.
- Agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible; no se declaran idiomas en la model card.
- Visión, audio o modo thinking: no disponible.

## Casos de uso

- Inferencia local privada en Mac: al ejecutarse con MLX sobre memoria unificada, los datos no salen del equipo; útil para asistentes internos con información sensible, siempre que se valide antes la calidad del modelo base.
- Evaluación de la cuantización 4-bit: comparar respuestas y perplejidad frente a `sabicap/sabi-noema` en tareas controladas para medir la pérdida introducida por la cuantización affine con group size 64.
- Prototipado de aplicaciones de generación de texto sin GPU NVIDIA: `mlx-lm` permite cargar los safetensors y exponer una API local; el footprint de 16,22 GB encaja en equipos Apple con 24 GB o más.
- Generación de código en entornos aislados: si el modelo base conserva capacidad de código, puede usarse como asistente offline en un Mac; no hay benchmarks que lo confirmen.
- Análisis de documentos y resúmenes: adecuado para flujos por lotes en estaciones Apple; la longitud de contexto no está documentada, por lo que hay que verificar el límite real antes de usarlo con textos largos.
- Chatbot interno de soporte: desplegable en una estación de trabajo Apple para preguntas frecuentes y borradores; requiere filtros y revisión humana por riesgo de alucinación.
- Investigación reproducible: sirve como artefacto de estudio de cuantización MLX y comparación de formatos, con licencia Apache 2.0.
- Despliegue en el borde con requisitos de soberanía: una máquina Apple puede ejecutar el modelo sin conexión; no es apto para hardware CUDA sin una conversión adicional no incluida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de datos de MMLU, HumanEval, GSM8K ni de comparativas numéricas frente al modelo base o a otras cuantizaciones.

## Requisitos de hardware

- Pesos cuantizados: aproximadamente 16,22 GB; el repositorio completo ocupa 17,4 GB.
- Memoria para inferencia: los pesos requieren al menos 16,22 GB; con overhead de KV cache y activaciones, se recomienda un mínimo de 24 GB de memoria unificada y 32 GB para contextos largos.
- Apple Silicon: equipos M1, M2, M3 o M4 con 24 GB o más de memoria unificada; 32 GB es la opción recomendada.
- GPU NVIDIA: no es el formato nativo; MLX está orientado a Apple Silicon. No se proporcionan instrucciones para convertir los pesos a GGUF u otros runtimes.
- Despliegue: `mlx-lm` y el ecosistema MLX. vLLM, TGI, llama.cpp y Ollama no soportan directamente safetensors MLX; Ollama requeriría una conversión no documentada.
- Latencia y throughput: no disponibles.
- Almacenamiento: reservar al menos 17,4 GB para el repositorio.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---:|---|---|---|---|
| `blackfan23/sabi-noema` | 27,36 B | No disponible | 4-bit affine MLX, group size 64 | Apache 2.0 | HuggingFace, MLX |
| `sabicap/sabi-noema` (base) | 27,36 B | No disponible | Pesos originales, ~50,96 GB | Apache 2.0 | HuggingFace |
| Otras cuantizaciones MLX del mismo modelo base | No disponible | No disponible | No disponible | No disponible | No disponible |
| Modelos comparables de ~27B | No disponible | No disponible | No disponible | No disponible | No disponible |

No se han identificado alternativas comparables con datos verificables en la información proporcionada.

## Limitaciones y advertencias

- No hay benchmarks publicados; no se puede afirmar que la calidad se mantenga respecto al modelo base.
- La cuantización a 4 bits puede degradar razonamiento, matemáticas, código y consistencia en contextos largos.
- Los idiomas soportados no están documentados; no se debe asumir multilingüismo.
- La longitud de contexto no está documentada; hay que verificarla experimentalmente antes de usarla en producción.
- Los sesgos del modelo base no se describen; son desconocidos.
- Riesgo de alucinación inherente a los modelos de lenguaje; requiere validación y revisión humana en usos críticos.
- La licencia Apache 2.0 permite uso comercial, pero conviene revisar los términos del modelo base y las obligaciones de atribución.
- Dependencia de Apple MLX: no es portable directamente a CUDA, vLLM o TGI sin conversión adicional.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; no hay validación comunitaria.
- La model card es escueta y no incluye información sobre entrenamiento, datos, sesgos o evaluación.
- No usar en producción crítica sin una evaluación propia frente al modelo base y a alternativas verificadas.

## Enlaces

- [HuggingFace: blackfan23/sabi-noema](https://huggingface.co/blackfan23/sabi-noema)
- [Modelo base: sabicap/sabi-noema](https://huggingface.co/sabicap/sabi-noema)
- [Apple MLX en GitHub](https://github.com/ml-explore/mlx)
