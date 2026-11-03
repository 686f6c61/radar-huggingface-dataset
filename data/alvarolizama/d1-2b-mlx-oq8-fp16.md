# alvarolizama/d1-2B-MLX-oQ8-fp16

## Resumen

d1-2B-MLX-oQ8-fp16 es una versión cuantizada del modelo d1-2B, un modelo multimodal de aproximadamente 1.918 millones de parámetros (1.918B) con arquitectura de tipo `lfm3_vl`, es decir, un transformer de lenguaje con torre de visión integrada. Lo publica el usuario alvarolizama en HuggingFace y está empaquetado específicamente para la librería MLX de Apple, lo que lo orienta a inferencia en hardware Apple Silicon (chips M-series). La cuantización se ha realizado con la herramienta oQ (oMLX v0.7.3) en precisión mixta, con un promedio efectivo de 10.822 bits por peso.

El interés técnico del checkpoint reside en su estrategia de cuantización mixta: la práctica totalidad de los pesos del modelo de lenguaje se almacenan en 8 bits afines con grupo de 64 (90,1 % de los pesos lógicos, 8,50 bits efectivos), mientras que el módulo de visión se mantiene en FP32 (9,87 % de los pesos lógicos, 32 bits efectivos) y una fracción residual en FP16. El resultado es un checkpoint de 2,6 GB que preserva la torre visual en alta precisión, algo relevante para tareas de imagen donde la cuantización agresiva suele degradar la calidad.

Al tratarse de una conversión comunitaria de un modelo base, no hay información publicada sobre datos de entrenamiento, benchmarks ni licencia en la información disponible. Su relevancia es, por tanto, operativa: ofrece una ruta de despliegue local en Mac para un modelo de visión-lenguaje de ~2B con un peso reducido y compatible con el ecosistema MLX.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | lfm3_vl (transformer de lenguaje con módulo de visión) |
| Parámetros totales | 1.918.181.888 (1.918B) |
| Parámetros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Cuantización mixta oQ: affine 8-bit grupo 64 (90,107 % de pesos lógicos), FP16 (0,020 %), FP32 (9,873 %); promedio efectivo 10,822 bits/peso |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (repo MLX, librería `mlx`) |

## Arquitectura y entrenamiento

La arquitectura declarada en las etiquetas es `lfm3_vl`, un diseño multimodal que combina un modelo de lenguaje de tipo transformer con un codificador de visión. El desglose de almacenamiento confirma esta separación: el modelo de lenguaje concentra 1.729B parámetros lógicos (1.837 GB) y el módulo de visión 0.189B parámetros lógicos (0.758 GB), para un total de 2.595 GB en disco. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de alineación como RLHF o DPO.

La innovación destacable de este checkpoint no está en el entrenamiento, sino en el esquema de cuantización. oQ (oMLX v0.7.3) aplica precisión mixta: mantiene el módulo de visión en FP32 para no degradar la representación visual, cuantiza el grueso del modelo de lenguaje a 8 bits afines con grupo de 64 y deja una fracción mínima en FP16. El promedio de 10,822 bits por peso es un compromiso explícito entre tamaño (2,6 GB) y fidelidad numérica, más conservador que una cuantización uniforme de 4 u 8 bits. El checkpoint requiere `custom_code`, lo que implica que la implementación de la arquitectura no es estándar y depende de código específico del repositorio.

## Capacidades

- Generación de texto y razonamiento general, heredadas del modelo de lenguaje base de ~1,7B parámetros.
- Procesamiento de imágenes: el módulo de visión de 0,189B parámetros se conserva en FP32, lo que sugiere soporte de tareas imagen-a-texto (descripción, VQA, OCR).
- Conversación multimodal multi-turno, siempre que el modelo base lo soporte (no confirmado en la información disponible).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible; no se declaran idiomas en la model card.
- Modo thinking o decodificación especulativa: no disponible en la información proporcionada.

## Casos de uso

- Inferencia local en Mac con Apple Silicon: el checkpoint está empaquetado para MLX y ocupa 2,6 GB, por lo que se puede cargar en un Mac con 16 GB de memoria unificada y ejecutar sin GPU dedicada. Adecuado para prototipos y demos en portátil.
- Descripción automática de imágenes en local: la torre de visión en FP32 permite generar pies de foto o resúmenes de imágenes sin enviar datos a la nube, útil en flujos con requisitos de privacidad.
- Extracción de información de documentos escaneados: combinación de OCR implícito y generación de texto para convertir facturas o formularios en campos estructurados, ejecutado en el propio dispositivo.
- Asistente de accesibilidad: descripción de escenas o imágenes en tiempo real para usuarios con discapacidad visual, aprovechando el bajo peso del modelo para ejecución continua en portátil.
- Moderación de contenido visual: clasificación y descripción de imágenes subidas por usuarios en una aplicación pequeña, con el modelo corriendo en el servidor de desarrollo o en un Mac mini.
- Prototipado de pipelines multimodales: validar la integración de un modelo visión-lenguaje en MLX antes de escalar a un modelo mayor, gracias al formato safetensors y a la carga directa con la librería `mlx`.
- Investigación en cuantización: servir como caso de estudio de precisión mixta (FP32 en visión, 8-bit en lenguaje) para medir el impacto de distintas asignaciones de bits por módulo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: ~2,6 GB para los pesos; con overhead de activaciones y contexto, un mínimo práctico de 8 GB de memoria unificada, recomendable 16 GB.
- GPU recomendadas: Apple Silicon (M1, M2, M3, M4 y variantes Pro/Max/Ultra), ya que MLX está optimizado para estos chips. No es compatible de forma nativa con CUDA.
- ¿Cabe en GPU de consumo? Sí, en cualquier Mac con 8 GB o más de memoria unificada; no está pensado para GPUs NVIDIA de consumo.
- Opciones de despliegue: librería `mlx` (requerida), con posible integración en `mlx-lm` si el código personalizado lo permite; no se indica soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. El promedio de 10,822 bits/peso implica más ancho de banda de memoria que una cuantización de 4 bits, por lo que la velocidad será inferior a un checkpoint Q4 equivalente.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| d1-2B-MLX-oQ8-fp16 | 1.918B | no disponible | no disponible | safetensors (MLX) | Cuantización mixta oQ, visión en FP32, 2,6 GB |
| Modelo base d1-2B | ~1.9B | no disponible | no disponible | no disponible | Origen del checkpoint; sin datos publicados |
| Alternativas de ~2B visión-lenguaje | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificables en la información proporcionada |

No hay información suficiente para establecer una comparativa cuantitativa con alternativas concretas.

## Limitaciones y advertencias

- Licencia no declarada: no se puede asumir uso comercial permitido; es necesario contactar con el autor o consultar el modelo base antes de producción.
- Modelo comunitario sin benchmarks: no hay evidencia publicada de calidad en MMLU, HumanEval, GSM8K ni tareas de visión, por lo que el rendimiento real es desconocido.
- Dependencia de `custom_code`: la arquitectura lfm3_vl no es estándar y requiere código específico; puede romper con actualizaciones de MLX.
- Sesgos y alucinaciones: no documentados, pero al ser un modelo de ~2B es esperable una tasa de alucinación superior a modelos mayores, especialmente en razonamiento y matemáticas.
- Idiomas: no se declaran; no se garantiza un rendimiento correcto en castellano.
- Contexto: no documentado; no se debe asumir una ventana larga en conversaciones multi-turno.
- Ecosistema restringido: al estar en formato MLX, no se puede desplegar directamente en servidores con GPU NVIDIA sin reconversión.
- Cuantización no uniforme: la mezcla de FP32 y 8-bit complica la reproducibilidad y la comparación con otros checkpoints del mismo modelo base.
- Repositorio con 0 descargas y 0 likes: sin validación comunitaria; tratar como experimental.

## Enlaces

- HuggingFace: https://huggingface.co/alvarolizama/d1-2B-MLX-oQ8-fp16
- Herramienta de cuantización oQ (oMLX): https://github.com/jundot/omlx
