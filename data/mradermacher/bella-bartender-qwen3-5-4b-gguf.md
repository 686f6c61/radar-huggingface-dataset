# mradermacher/bella-bartender-qwen3.5-4b-GGUF

## Resumen

`mradermacher/bella-bartender-qwen3.5-4b-GGUF` es una cuantización estática en formato GGUF del modelo `juiceb0xc0de/bella-bartender-qwen3.5-4b`, publicada por el usuario mradermacher, conocido en Hugging Face por generar versiones GGUF de modelos de terceros para su uso con llama.cpp y derivados. El modelo base pertenece a la familia "bella-bartender", orientada a generación de texto creativo y roleplay, y se construye presumiblemente sobre una base de la familia Qwen (según el nombre, una variante "Qwen3.5" de 4B), aunque no se dispone de documentación oficial que lo confirme.

El repositorio contiene únicamente los pesos cuantizados en GGUF, sin model card propia más allá de los metadatos de la herramienta de cuantización, sin licencia declarada y sin información sobre idiomas, pipeline o dataset de entrenamiento. El dato de parámetros reportado en safetensors (333.514.240) resulta inconsistente con la denominación "4B" del nombre y con el tamaño del repositorio (1,0 GB), por lo que debe tratarse con cautela: podría corresponder a un subconjunto de tensores o a un error de metadatos.

La relevancia de esta ficha es limitada pero concreta: permite ejecutar localmente un modelo afinado para escritura creativa y roleplay en hardware de consumo, siempre que el usuario asuma la ausencia de garantías documentales, licencia y benchmarks. Es un artefacto de conveniencia (cuantización de un fine-tune comunitario), no un modelo con soporte oficial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (presumiblemente transformer decoder-only de la familia Qwen; no confirmado) |
| Parametros totales | 333.514.240 según safetensors reportado; el nombre indica 4B (dato inconsistente) |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | x-f16, Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, IQ4_XS |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantización estática, convert_type: hf) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura del modelo base. El nombre `qwen3.5-4b` sugiere una base de la familia Qwen con aproximadamente 4.000 millones de parámetros, pero no hay documentación que lo confirme ni detalles sobre número de capas, dimensión oculta, mecanismo de atención o tipo de normalización. El tag de cuantización `convert_type: hf` indica que la conversión a GGUF se realizó desde pesos en formato Hugging Face (probablemente safetensors), y `output_tensor_quantised: 1` señala que la herramienta de mradermacher aplicó cuantización sobre los tensores de salida.

Tampoco hay información sobre el proceso de entrenamiento del modelo base: no se conocen el volumen de tokens, la composición del dataset, la existencia de fases de SFT, RLHF o DPO, ni si se emplearon técnicas como decodificación especulativa o atención lineal. El modelo base (`juiceb0xc0de/bella-bartender-qwen3.5-4b`) es un fine-tune comunitario orientado a roleplay y escritura creativa, pero su model card no está incluida en la información proporcionada.

## Capacidades

- Generación de texto: el modelo está orientado, por su nombre y linaje, a escritura creativa y diálogo de rol, aunque no hay documentación que detalle sus capacidades concretas.
- Razonamiento y matemáticas: no disponible; no hay evidencia de que el fine-tune preserve o potencie estas capacidades respecto a su base.
- Generación de código: no disponible.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible; no se declaran idiomas en los metadatos.
- Capacidades especiales (modo thinking, visión, audio): no disponible; no se mencionan en la información proporcionada.

## Casos de uso

- Roleplay conversacional local: el modelo puede emplearse en aplicaciones de chat con personajes gracias a su orientación declarada a roleplay, ejecutándose en local mediante llama.cpp u Ollama sin depender de servicios externos.
- Escritura creativa asistida: generación de relatos, diálogos y borradores narrativos en un editor de texto con integración local, aprovechando el fine-tune sobre una base de 4B para mantener coherencia estilística en sesiones cortas.
- Prototipado de chatbots de entretenimiento: desarrollo de demos de personajes conversacionales en hardware de consumo, con la cuantización Q4_K_M como compromiso entre calidad y tamaño.
- Pruebas de pipelines de inferencia GGUF: uso del modelo como banco de pruebas para validar integraciones con llama.cpp, Ollama o servidores compatibles con la API de OpenAI, dado que ofrece múltiples niveles de cuantización en un mismo repositorio.
- Generación de contenido narrativo para juegos de texto: integración en motores de aventuras conversacionales o juegos de rol por texto que requieran respuestas generadas en tiempo real en una máquina local.
- Experimentación académica con fine-tunes comunitarios: análisis comparativo del efecto de distintas cuantizaciones (Q2_K frente a Q8_0) sobre la calidad de la generación creativa en un modelo pequeño.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: para un modelo de ~4B parámetros, las cuantizaciones Q4_K_M ocupan aproximadamente 2,5-3 GB, Q8_0 en torno a 4,5 GB y x-f16 alrededor de 8 GB; estas cifras son estimaciones basadas en el tamaño típico de modelos de esa escala y no en mediciones del repositorio.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090 y GPUs de datacenter como A10, A100 o H100 para despliegues con mayor concurrencia.
- Compatibilidad con GPU de consumo: sí, las cuantizaciones Q4 y Q5 caben en GPUs de 8 GB o menos; las versiones Q8_0 y f16 requieren 8-12 GB.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, servidores compatibles con la API de llama.cpp y, en general, cualquier runtime que soporte GGUF. vLLM y TGI no soportan GGUF de forma nativa en todas sus versiones, por lo que no se recomiendan como primera opción.
- Latencia y throughput: no disponibles; no se han publicado mediciones para este repositorio.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| mradermacher/bella-bartender-qwen3.5-4b-GGUF | 4B (según nombre; 333M según safetensors reportado) | no disponible | no disponible | GGUF | Cuantización estática de un fine-tune comunitario para roleplay |
| juiceb0xc0de/bella-bartender-9b-yi-GGUF | 9B | no disponible | no disponible | GGUF | Variante mayor de la misma familia, basada en Yi |
| juiceb0xc0de/bella-bartender-gemma-e4b | 8B | no disponible | no disponible | no disponible | Variante de la familia basada en Gemma |

No se dispone de datos de rendimiento ni de benchmarks que permitan una comparación cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Ausencia total de licencia declarada: no se especifican términos de uso comercial, lo que impide asumir permiso para producción sin consultar al autor del modelo base.
- Metadatos inconsistentes: el recuento de parámetros en safetensors (333.514.240) no concuerda con el nombre "4b" ni con el tamaño del repositorio (1,0 GB), lo que sugiere un error de publicación o un subconjunto de tensores; conviene verificar antes de confiar en las estimaciones de hardware.
- Sin model card propia: el repositorio solo contiene metadatos de la herramienta de cuantización; no hay información sobre dataset, sesgos, idiomas o comportamiento esperado.
- Riesgo de alucinación: inherente a los modelos de 4B afinados para ficción; no se han publicado evaluaciones de fidelidad factual.
- Sesgos desconocidos: al ser un fine-tune comunitario sin documentación, no se puede evaluar la presencia de sesgos de género, culturales o de otro tipo.
- Contexto e idiomas no especificados: no se puede garantizar un rendimiento adecuado en castellano ni en conversaciones de contexto largo.
- Naturaleza derivada: es una cuantización de terceros; los errores del modelo base se heredan y la cuantización puede degradar la calidad, especialmente en Q2_K y Q3_K_S.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/bella-bartender-qwen3.5-4b-GGUF
- Modelo base: https://huggingface.co/juiceb0xc0de/bella-bartender-qwen3.5-4b
- Variante de la familia basada en Yi: https://huggingface.co/juiceb0xc0de/bella-bartender-9b-yi-GGUF
- Variante de la familia basada en Gemma: https://huggingface.co/juiceb0xc0de/bella-bartender-gemma-e4b
- Listado de modelos con tag roleplay: https://huggingface.co/models?other=roleplay&p=2&sort=trending
- Listado de modelos con tag creative-writing: https://huggingface.co/models?other=creative-writing
