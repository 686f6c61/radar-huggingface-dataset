# scottlowry/Qwen3.8-27B-oQ5e-fp16-mtp

## Resumen

Qwen3.8-27B-oQ5e-fp16-mtp es una cuantización mixta del modelo base Qwen/Qwen3.8-27B, publicada por el usuario scottlowry. No se trata de un modelo entrenado desde cero, sino de una redistribución de pesos optimizada para inferencia en Apple Silicon mediante la librería MLX. La cuantización se ha realizado con la herramienta oQ (oMLX v0.7.4.dev1), que aplica precisión mixta por tensor en lugar de una cuantización uniforme.

El checkpoint contiene 27.781 millones de parámetros lógicos distribuidos en cuatro bloques funcionales: el modelo de lenguaje (26.896B), un codificador visual (0.461B) y una cabeza MTP (Multi-Token Prediction) de 0.425B. La precisión efectiva media es de 6.154 bits por peso, con un almacenamiento total de 19.904 GiB, lo que reduce el peso en disco respecto a los aproximadamente 55 GB que ocuparían los pesos en FP16.

La relevancia de esta ficha radica en que documenta un artefacto de cuantización para despliegue local en hardware Apple, no un modelo nuevo. El modelo base Qwen3.8-27B pertenece a la familia Qwen3.5 según los tags del repositorio, e incorpora visión y decodificación especulativa mediante la cabeza MTP. La información pública disponible sobre el modelo base es limitada en este repositorio, por lo que varios campos técnicos se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.5, según tags); incluye codificador visual y cabeza MTP |
| Parametros totales | 27.781.427.952 (27.781B lógicos) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Mixta: affine 5-bit grupo 64, affine 6-bit grupo 64, affine 8-bit grupo 64, FP16 y FP32 |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (librería mlx) |

## Arquitectura y entrenamiento

El artefacto es una cuantización del modelo Qwen/Qwen3.8-27B, no un entrenamiento propio. La arquitectura subyacente es un transformer de la familia Qwen3.5, con tres componentes diferenciados según el desglose de almacenamiento: un modelo de lenguaje de 26.896B parámetros, un módulo de visión de 0.461B y una cabeza MTP de 0.425B. La presencia de MTP sugiere soporte de predicción multi-token, técnica habitualmente asociada a decodificación especulativa para acelerar la generación.

La cuantización aplicada por oQ es de precisión mixta por tensor. El 87,971% de los pesos lógicos (24.440B) se almacenan en affine 5-bit con grupo de 64, con un coste efectivo de 5,50 bits por peso. Un 5,558% (1.544B) usa affine 6-bit (6,50 bits efectivos), un 4,614% (1.282B) usa affine 8-bit (8,50 bits efectivos) y una fracción pequeña permanece en FP16 (0,055B) y FP32 (0,461B). Esta distribución concentra la mayor precisión en los tensores más sensibles, presumiblemente capas de normalización, embeddings o componentes del módulo visual.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si el modelo base utilizó RLHF o DPO. Tampoco se documentan innovaciones de atención más allá de la mencionada cabeza MTP.

## Capacidades

- Generación de texto y razonamiento: heredadas del modelo base Qwen3.8-27B, aunque no se detallan en la model card del repositorio.
- Procesamiento de visión: el checkpoint incluye un módulo visual de 0.461B parámetros en FP32, lo que indica capacidad multimodal de entrada de imagen.
- Predicción multi-token (MTP): la cabeza dedicada de 0.425B permite decodificación especulativa, orientada a reducir latencia en generación.
- Inferencia en Apple Silicon: el formato MLX y la cuantización mixta están diseñados para ejecución local en chips de Apple.
- Tool calling, agentes, modo thinking y capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Inferencia local en Mac con memoria unificada: el checkpoint ocupa 19.904 GiB, por lo que puede cargarse en equipos Apple con 32 GB o más de memoria unificada, permitiendo ejecutar un modelo de 27B sin GPU dedicada.
- Asistentes multimodales de escritorio: el módulo visual integrado permite procesar imágenes junto con texto en aplicaciones locales, útil para herramientas de accesibilidad o análisis de capturas.
- Prototipado de agentes con baja latencia: la cabeza MTP habilita decodificación especulativa, adecuada para entornos de desarrollo donde se prioriza la velocidad de respuesta interactiva.
- Investigación en cuantización: el desglose detallado por tipo de precisión lo convierte en un artefacto útil para estudiar el impacto de la cuantización mixta en la calidad de salida frente al modelo base.
- Despliegue en estaciones de trabajo sin conexión: al ser un modelo local, encaja en escenarios con requisitos de privacidad donde no se permite enviar datos a APIs externas.
- Evaluación comparativa de formatos: sirve para contrastar el rendimiento de MLX frente a GGUF o safetensors en el mismo modelo base, midiendo throughput y calidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM o memoria unificada estimada: 19.904 GiB para los pesos en el formato cuantizado; se requiere margen adicional para el contexto KV y buffers de activación.
- Hardware objetivo: Apple Silicon con MLX; el repositorio no documenta soporte para CUDA ni ROCm.
- Cabe en consumer GPU: no aplicable directamente, ya que el formato es MLX para memoria unificada de Apple. En Mac, se recomienda un mínimo de 32 GB de memoria unificada; 64 GB ofrece mayor holgura para contextos largos.
- Opciones de despliegue: MLX y oMLX (herramienta de cuantización del mismo ecosistema). No se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-27B-oQ5e-fp16-mtp | 27.781B | no disponible | safetensors MLX, 6.154 bits/peso | no disponible | Hugging Face, 59 descargas |
| Qwen/Qwen3.8-27B (base) | 27B (aprox.) | no disponible | safetensors originales | no disponible | Hugging Face |
| Otras cuantizaciones del mismo base (GGUF, AWQ, etc.) | 27B (aprox.) | no disponible | GGUF / otros | no disponible | no disponible en la información proporcionada |

La comparativa se limita al modelo base y a otras cuantizaciones potenciales, ya que no se dispone de datos de rendimiento ni de especificaciones de contexto para establecer comparaciones cuantitativas con alternativas de la misma categoría.

## Limitaciones y advertencias

- Es un artefacto de cuantización, no un modelo original: la calidad puede degradarse respecto al Qwen3.8-27B en FP16, especialmente en tareas de razonamiento matemático o código, aunque la precisión mixta mitiga parte del efecto.
- Licencia no especificada en el repositorio: antes de uso comercial debe verificarse la licencia del modelo base Qwen/Qwen3.8-27B, ya que la cuantización no puede otorgar derechos más amplios que el original.
- Dependencia de MLX: no es portable a ecosistemas CUDA o ROCm sin reconversión, lo que limita su uso a hardware Apple.
- Riesgo de alucinación: inherente a los modelos de lenguaje de esta escala; no hay documentación específica sobre mitigaciones en este checkpoint.
- Idiomas y sesgos: no disponibles; se desconoce la cobertura lingüística real y los sesgos del modelo base.
- Actualización del 2026-11-11: el autor recomienda volver a descargar versiones anteriores, lo que indica que las copias previas pueden tener pesos inconsistentes.
- Contexto máximo: no documentado, lo que impide planificar despliegues con ventanas largas sin pruebas previas.
- Trazabilidad limitada: 59 descargas y 1 like sugieren poca validación comunitaria; conviene evaluar el checkpoint antes de usarlo en producción.

## Enlaces

- Hugging Face: https://huggingface.co/scottlowry/Qwen3.8-27B-oQ5e-fp16-mtp
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Herramienta de cuantización oQ (oMLX): https://github.com/jundot/omlx
