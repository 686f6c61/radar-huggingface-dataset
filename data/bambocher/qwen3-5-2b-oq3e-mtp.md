# bambocher/Qwen3.5-2B-oQ3e-mtp

## Resumen

`bambocher/Qwen3.5-2B-oQ3e-mtp` es una versión cuantizada del modelo Qwen3.5-2B de Alibaba Cloud, publicada por el usuario bambocher mediante la herramienta oQ (oMLX v0.7.1rc1) con una estrategia de cuantización de precisión mixta. El checkpoint conserva 2.274.069.824 parámetros lógicos distribuidos en tres componentes: el modelo de lenguaje (1,882B), un codificador de visión (0,331B) y una cabeza MTP o *multi-token prediction* (0,061B), lo que confirma que se trata de un modelo multimodal con decodificación especulativa integrada.

La particularidad del artefacto es su mezcla de precisión: el 71,99% de los pesos lógicos se almacena en affine 3-bit con grupo de 64, mientras que un 14,97% permanece en BF16 y el resto se reparte entre 4, 5 y 6 bits. El resultado es un peso medio efectivo de 5,620 bits por peso y un tamaño de repositorio de 1,6 GB, muy por debajo de lo que exigiría el checkpoint en BF16. Es relevante ahora porque permite ejecutar un modelo de la familia Qwen3.5 con capacidades de visión y predicción multi-token en equipos con memoria unificada modesta, a costa de una pérdida de calidad que no está documentada.

El formato es safetensors para MLX, lo que circunscribe su uso al ecosistema de Apple Silicon (mlx-lm, mlx-vlm y aplicaciones compatibles como LM Studio). No hay model card con datos de entrenamiento, benchmarks ni licencia declarada en el repositorio, por lo que las evaluaciones de calidad y de uso comercial deben remitirse al checkpoint base.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer de la familia Qwen3.5, multimodal (modelo de lenguaje + torre de visión) con cabeza MTP (*multi-token prediction*) |
| Parámetros totales | 2.274.069.824 (2,274B) |
| Parámetros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | No disponible |
| Tipos de cuantización | oQ de precisión mixta: affine 3-bit grupo 64, 4-bit grupo 64, 5-bit grupo 64, 6-bit grupo 64 y BF16; media efectiva de 5,620 bits/peso |
| Idiomas soportados | No disponible la lista concreta; la serie Qwen3.5 se describe como multilingüe en la documentación del modelo base |
| Licencia | No disponible en la información proporcionada (debe consultarse la licencia del checkpoint base Qwen3.5-2B) |
| Formato de pesos | safetensors para MLX (`library_name: mlx`) |
| Desglose de componentes | Lenguaje: 1,882B → 0,888 GB (0,827 GiB); visión: 0,331B → 0,663 GB (0,617 GiB); cabeza MTP: 0,061B → 0,046 GB (0,043 GiB) |
| Distribución de precisión | 3-bit: 1,637B (71,992%) · 4-bit: 0,052B (2,306%) · 5-bit: 0,219B (9,628%) · 6-bit: 0,025B (1,107%) · BF16: 0,340B (14,967%) |
| Tamaño del repositorio | 1,6 GB (1,597 GB / 1,488 GiB de pesos) |
| Descargas / likes | 12 descargas, 0 likes |
| Fecha de publicación | 20 de octubre de 2026 |

## Arquitectura y entrenamiento

El checkpoint es una recomposición de pesos, no un modelo entrenado desde cero. La arquitectura subyacente es la de Qwen3.5-2B: un transformer multimodal con fusión temprana de tokens visuales y textuales, según la documentación de la serie recogida en Ollama y Qualcomm AI Hub, que atribuye a Qwen3.5 paridad con Qwen3 y mejoras frente a Qwen3-VL en razonamiento, código, agentes y comprensión visual. El repositorio añade a esa base una cabeza MTP de 0,061B parámetros, utilizada para predecir varios tokens por paso y acelerar la decodificación mediante verificación especulativa.

La innovación del artefacto es exclusivamente de compresión. oQ asigna precisiones distintas por tensor: mantiene en BF16 el 14,97% de los pesos lógicos (0,340B, presumiblemente embeddings, capas normalizadas y componentes sensibles), mientras degrada a 3 bits el 71,99% (1,637B), que corresponde al grueso de las matrices de proyección. No se dispone de información sobre los datos de entrenamiento del modelo base, el número de tokens, la composición del dataset ni si hubo fases de RLHF o DPO. Tampoco se documenta el proceso de calibración empleado por oQ para decidir la asignación de bits por capa.

## Capacidades

- Generación de texto y razonamiento en varios turnos, heredados del modelo base Qwen3.5-2B.
- Comprensión de imágenes: el checkpoint incluye una torre de visión de 0,331B parámetros en BF16 (0,617 GiB), lo que sugiere que la cuantización preserva la calidad del codificador visual.
- Decodificación especulativa mediante cabeza MTP, orientada a reducir la latencia por token en generación autoregresiva.
- Razonamiento multi-paso y seguimiento de instrucciones, descritos por la documentación de la serie como mejorados respecto a Qwen3.
- Capacidades multilingües: la serie se presenta como multilingüe, aunque la lista exacta de idiomas y su cobertura no están disponibles.
- Soporte de *tool calling* y flujos de agente: no confirmado en la información proporcionada para este checkpoint concreto.
- No se documenta modo *thinking* explícito, soporte de audio ni otras modalidades adicionales.

## Casos de uso

- Inferencia local en Mac con memoria unificada: el checkpoint ocupa 1,488 GiB de pesos, por lo que un Mac con 8 GB de memoria unificada puede cargarlo y mantener contexto adicional para caché KV sin recurrir a swap.
- Asistente de escritorio con entrada visual: la presencia de la torre de visión permite describir capturas de pantalla, diagramas o imágenes escaneadas en una aplicación nativa de macOS que use MLX como backend.
- Prototipado rápido de aplicaciones conversacionales: al ocupar 1,6 GB, el modelo se descarga y se carga en segundos, lo que agiliza iteraciones de prompt engineering antes de migrar a un checkpoint mayor.
- Procesamiento por lotes de documentos con imágenes en un portátil: extracción de texto y resumen de figuras en informes o apuntes sin enviar datos a la nube, útil por motivos de confidencialidad.
- Generación asistida con baja latencia: la cabeza MTP está pensada para aceptar varios tokens por paso de decodificación, lo que resulta adecuado en entornos interactivos donde importa el tiempo hasta el primer token y el ritmo de generación.
- Evaluación comparativa de cuantizaciones: sirve como referencia para medir la degradación de un mismo modelo base frente a la variante de 8 bits del mismo autor (`Qwen3.5-2B-oQ8e-mtp`) en tareas concretas.
- Filtrado y clasificación de contenido en el dispositivo: clasificación de texto y pares texto-imagen en un pipeline local sin dependencia de API externa, siempre que se valide la calidad tras la cuantización a 3 bits.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente documenta la distribución de bits y el tamaño del checkpoint, sin métricas de MMLU, HumanEval, GSM8K, MMMU ni comparaciones de perplejidad frente al modelo base en BF16 o frente a cuantizaciones de mayor precisión.

## Requisitos de hardware

- VRAM o memoria unificada para pesos: 1,488 GiB en el checkpoint cuantizado; el consumo real en inferencia añade caché KV, búferes de atención y el grafo de MLX, por lo que conviene reservar entre 3 y 4 GiB para uso cómodo.
- Compatibilidad: el formato es safetensors para MLX, de modo que requiere Apple Silicon (series M1, M2, M3 o M4). No es ejecutable directamente en GPU NVIDIA o AMD sin conversión previa.
- GPU consumer: cabe holgadamente en cualquier Mac con 8 GB de memoria unificada o superior; en el espacio NVIDIA haría falta convertir los pesos a otro formato, ya que el artefacto no está pensado para CUDA.
- Opciones de despliegue: `mlx-lm` y `mlx-vlm` para integración en código, ML Studio o LM Studio para uso con interfaz gráfica, y descarga vía `hf download` con `huggingface_hub`. vLLM y TGI no soportan este formato; llama.cpp y Ollama requerirían una conversión a GGUF que no se distribuye en este repositorio.
- Latencia y throughput: no disponibles. La cabeza MTP sugiere una ganancia en tokens por segundo, pero no se publican mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Precisión media | Tamaño de pesos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| bambocher/Qwen3.5-2B-oQ3e-mtp | 2,274B | 5,620 bits/peso | 1,488 GiB | No disponible | No disponible | MLX safetensors |
| bambocher/Qwen3.5-2B-oQ8e-mtp | No disponible (mismo checkpoint base) | 8 bits (según nombre) | No disponible | No disponible | No disponible | MLX safetensors |
| Qwen3.5-2B (original) | 2B (aproximado según Qualcomm AI Hub) | BF16 | No disponible | No disponible | No disponible en la información | Distribución oficial de Qwen |
| Qwen3-VL (generación anterior, referencia) | No disponible | No disponible | No disponible | No disponible | No disponible | No disponible |

La comparación cuantitativa de rendimiento entre estas variantes no está disponible: no hay cifras publicadas de benchmarks ni de perplejidad para ninguna de ellas en la información consultada.

## Limitaciones y advertencias

- La cuantización a 3 bits afecta al 71,99% de los pesos lógicos; es esperable una degradación de calidad frente al modelo en BF16, pero no se publica ninguna medición que la cuantifique.
- No hay resultados de benchmarks ni evaluación de perplejidad que permitan estimar la pérdida de precisión en razonamiento, código o matemáticas.
- La licencia no está declarada en el repositorio. Antes de un uso comercial debe verificarse la licencia del checkpoint base Qwen3.5-2B, ya que la cuantización no otorga derechos adicionales.
- El artefacto está ligado a MLX y a Apple Silicon; no es portable a CUDA, ROCm ni a despliegues en servidores x86 sin conversión manual de formato.
- No se documenta la longitud de contexto soportada, lo que impide planificar aplicaciones con ventanas largas.
- La lista de idiomas soportados no está disponible; aunque la serie se describe como multilingüe, la cobertura real por idioma y la calidad tras la cuantización no están verificadas.
- El sesgo de calibración de oQ es desconocido: no se indica qué conjunto de datos se usó para decidir la asignación de bits, lo que puede introducir sesgos hacia el dominio de calibración.
- Riesgo de alucinación: inherente a un modelo de 2B parámetros y potencialmente agravado por la cuantización agresiva; requiere verificación en producción.
- Actividad mínima en el repositorio (12 descargas, 0 likes) y ausencia de pipeline declarado, lo que reduce la trazabilidad y el soporte de la comunidad.
- El checkpoint incluye una cabeza MTP que debe ser soportada explícitamente por el runtime; si el motor de inferencia la ignora, se pierde la ventaja de decodificación especulativa sin que ello rompa la ejecución.

## Enlaces

- HuggingFace: https://huggingface.co/bambocher/Qwen3.5-2B-oQ3e-mtp
- Variante de 8 bits del mismo autor: https://huggingface.co/bambocher/Qwen3.5-2B-oQ8e-mtp
- Repositorio de la herramienta de cuantización oQ (oMLX): https://github.com/jundot/omlx
- Ficha de Qwen3.5-2B en Qualcomm AI Hub: https://aihub.qualcomm.com/models/qwen3_5_2b
- Ficha de Qwen3.5-2B en Ollama: https://ollama.com/library/qwen3.5:2b
