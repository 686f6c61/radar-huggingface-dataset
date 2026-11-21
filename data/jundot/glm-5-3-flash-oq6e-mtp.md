# Jundot/GLM-5.3-Flash-oQ6e-mtp

## Resumen

GLM-5.3-Flash-oQ6e-mtp es una cuantización de precisión mixta en formato MLX del modelo `zai-org/GLM-5.3-Flash`, publicado por el usuario Jundot mediante la herramienta oQ (oMLX v0.8.0). El modelo base es un MoE nativamente multimodal de 320B parámetros totales y 18B activos, desarrollado por Z.ai (zai-org), que combina atención dispersa y lineal con Manifold-Constrained Hyper-Connections (mHC). Esta versión cuantizada conserva el backbone de lenguaje, el codificador de visión y la cabeza de multi-token prediction (MTP), lo que permite decodificación especulativa integrada.

El checkpoint ocupa 264,3 GB en disco (246,16 GiB) con una media efectiva de 6,581 bits por peso para el conjunto completo y 6,564 bits/peso para el backbone de lenguaje. La mayor parte de los pesos (96,991%) se almacena en affine 6-bit con grupo 64, mientras que un 2,793% se mantiene en 8-bit por mayor sensibilidad de capa, y una fracción mínima (0,216%) permanece en BF16/FP32. Está pensado para ejecución en hardware Apple Silicon mediante MLX, no para GPUs NVIDIA.

La relevancia de esta ficha radica en que permite ejecutar localmente un modelo multimodal de escala frontier con licencia MIT, algo poco habitual en esta categoría de tamaño. No obstante, el volumen de almacenamiento y los requisitos de memoria unificada implican que su despliegue práctico queda restringido a equipos de gama muy alta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) multimodal con atención dispersa + lineal y Manifold-Constrained Hyper-Connections (mHC); backbone transformer, codificador de visión y cabeza MTP |
| Parametros totales | 321.323.031.390 (321,3B) |
| Parametros activos | 18B |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | oQ6e mixed-precision: affine 6-bit grupo 64 (96,991%), affine 8-bit grupo 64 (2,793%), BF16 (0,189%), FP32 (0,027%) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (MLX), 6-bit, librería `mlx` |

## Arquitectura y entrenamiento

El modelo base GLM-5.3-Flash es un MoE nativamente multimodal con 320B parámetros totales y 18B activos, según indica la model card. Su arquitectura combina atención dispersa y lineal con Manifold-Constrained Hyper-Connections (mHC), una técnica que restringe las conexiones residuales a una variedad geométrica para estabilizar el entrenamiento en profundidad. Incluye además un codificador de visión (0,564B parámetros lógicos) que le confiere capacidad image-text-to-text, y una cabeza de multi-token prediction (7,433B parámetros lógicos) que permite decodificación especulativa nativa.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron etapas de RLHF o DPO, ya que la model card del checkpoint cuantizado no detalla el proceso de entrenamiento del modelo base. La cuantización oQ6e asigna bits por sensibilidad de capa medida, redondea cada grupo con una matriz de importancia (128 muestras × 512 tokens) y aplica un refit ponderado por mínimos cuadrados de escala y bias; la versión actualizada el 2026-11-19 incorpora un refinamiento de redondeo oQe que reduce el error de cuantización a igual tamaño y velocidad.

## Capacidades

- Generación de texto y razonamiento multi-step, al ser un modelo de lenguaje de escala frontier con 320B parámetros totales.
- Procesamiento multimodal image-text-to-text: el checkpoint incluye el codificador de visión del modelo base.
- Decodificación especulativa mediante la cabeza MTP integrada, que acelera la generación al predecir múltiples tokens por paso.
- Razonamiento matemático y generación de código: capacidades esperables de un modelo de esta familia, aunque no documentadas explícitamente en la model card del checkpoint.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y multi-step reasoning: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible; el campo de idiomas del repo está vacío.
- Modo thinking explícito: no disponible en la información proporcionada.

## Casos de uso

- Despliegue local multimodal en Apple Silicon: el checkpoint está en formato MLX y puede cargarse con la librería `mlx` en equipos con memoria unificada suficiente (por encima de 246 GiB), permitiendo inferencia de un modelo de 320B parámetros sin GPU dedicada.
- Asistencia visual sobre documentos: gracias al codificador de visión integrado, el modelo puede recibir imágenes junto con texto y responder preguntas sobre capturas, diagramas o documentos escaneados en un flujo conversacional.
- Generación de código asistida en local: con 18B parámetros activos por token, el coste computacional por paso es comparable a un modelo denso de 18B, lo que lo hace viable para autocompletado y revisión de código en estaciones de trabajo de gama alta.
- Investigación sobre cuantización: el checkpoint sirve como referencia para estudiar el impacto de la cuantización mixta oQ6e (6,581 bits/peso efectivos) frente al modelo base en BF16, comparando calidad y velocidad.
- Prototipado de pipelines de decodificación especulativa: la cabeza MTP incluida permite experimentar con generación multi-token en MLX sin necesidad de un draft model separado.
- Evaluación de modelos MoE multimodales con licencia permisiva: al ser MIT, puede usarse en entornos de investigación corporativa e integración en productos internos sin restricciones de licencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM (memoria unificada) estimada: al menos 246,16 GiB solo para los pesos; se requiere margen adicional para KV cache, activaciones y contexto, por lo que en la práctica hacen falta equipos con 256 GiB o más de memoria unificada.
- GPU recomendadas: no aplica GPU NVIDIA; el formato MLX está orientado a Apple Silicon. Para el modelo base en BF16 sería necesario hardware con capacidad muy superior a la de una A100 80 GB o H100 80 GB.
- Cabe en consumer GPU: no. Ninguna GPU de consumo (RTX 4090 24 GB, RTX 5090 32 GB) dispone de memoria suficiente; tampoco una Mac Studio de 128 GB o 192 GB. Solo configuraciones Apple Silicon de gama máxima (por ejemplo, Mac Studio M3 Ultra con 256 GB o 512 GB de memoria unificada) podrían albergarlo.
- Opciones de despliegue: librería `mlx` (mlx-lm / oMLX); no es compatible con vLLM, llama.cpp, Ollama ni TGI en su formato actual, que requiere conversión para otros runtimes.
- Latencia y throughput: no disponibles en la información proporcionada; la cabeza MTP está diseñada para reducir la latencia mediante decodificación especulativa, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parámetros totales / activos | Contexto | Multimodal | Licencia | Formato |
|---|---|---|---|---|---|
| GLM-5.3-Flash-oQ6e-mtp (este) | 321,3B / 18B | no disponible | Sí (visión) | MIT | MLX safetensors 6-bit |
| zai-org/GLM-5.3-Flash (base) | 320B / 18B | no disponible | Sí (visión) | MIT | safetensors (BF16 presumiblemente) |
| Alternativas de escala comparable | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones de modelos alternativos en la información proporcionada, por lo que no es posible establecer una comparativa cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Requisito de hardware extremo: 246,16 GiB de pesos impiden su ejecución en GPUs de consumo y en la mayoría de estaciones de trabajo; queda limitado a Apple Silicon con memoria unificada de gama máxima.
- Ecosistema restringido: el formato MLX solo funciona con la librería `mlx`; no hay pesos GGUF ni compatibilidad directa con vLLM, llama.cpp, Ollama o TGI.
- Idiomas no declarados: el repo no especifica idiomas soportados, por lo que el rendimiento multilingüe no está garantizado ni documentado.
- Contexto desconocido: no se indica la longitud de contexto del modelo base ni del checkpoint, lo que impide planificar despliegues con ventanas largas.
- Riesgo de alucinación: inherente a los modelos generativos de esta escala; no se documentan evaluaciones de fidelidad ni de calibración.
- Sesgos: no se dispone de información sobre sesgos conocidos ni sobre evaluaciones de seguridad del modelo base.
- Cuantización lossy: la media de 6,581 bits/peso implica degradación respecto al modelo base en BF16; la model card indica que la versión del 2026-11-19 reduce el error, pero no se aportan métricas de calidad comparativas.
- Licencia MIT: permisiva para uso comercial, pero conviene revisar el archivo `LICENSE` del repo y las condiciones del modelo base por si existen términos adicionales de uso responsable.
- Fecha de creación futura (2026-10-11) y actualización posterior (2026-11-19): verificar la integridad del checkpoint antes de usarlo en producción.

## Enlaces

- [Hugging Face: Jundot/GLM-5.3-Flash-oQ6e-mtp](https://huggingface.co/Jundot/GLM-5.3-Flash-oQ6e-mtp)
- [Modelo base: zai-org/GLM-5.3-Flash](https://huggingface.co/zai-org/GLM-5.3-Flash)
- [Repositorio de oQ (oMLX)](https://github.com/jundot/omlx)
- [PR oMLX #4930 (mejora de oQe)](https://github.com/jundot/omlx/pull/4930)
- [PR oMLX #5292 (refinamiento del redondeo oQe)](https://github.com/jundot/omlx/pull/5292)
