# gitcommit90/GLM-5.3-Flash-EXL3-2.05-One-Spark

## Resumen

GLM-5.3-Flash-EXL3-2.05-One-Spark es un despliegue de producción reproducible del modelo GLM-5.3-Flash de Z.ai, cuantizado con ExLlamaV3 a 2.05 bits por peso (bpw) y optimizado para ejecutarse en un único NVIDIA DGX Spark (GB10, 128 GB de memoria unificada, ARM64/SM121a). El repositorio, creado por gitcommit90, no contiene pesos del modelo: es una página de descubrimiento de runtime y despliegue que enlaza los checkpoints originales de Turboderp (cuantización EXL3) y de Inco AI (drafter DFlash2), junto con instrucciones y recetas Docker.

El modelo base GLM-5.3-Flash es el primer modelo nativamente multimodal de la serie GLM-5, con 320 mil millones de parámetros totales y solo 18 mil millones activos (arquitectura MoE). Según Z.ai, supera a GLM-5.2 en benchmarks y se acerca a Claude Opus 4.8 en tareas de código y agénticas, a un coste significativamente menor. Este despliegue concreto logra 64.1 tokens por segundo en generación estructurada y 25.1 tokens por segundo en prosa, con una ventana de contexto de 262K tokens, todo ello en un solo dispositivo de 128 GB.

La relevancia de esta ficha radica en que demuestra la viabilidad de ejecutar un modelo de 320B en hardware de borde de gama alta, utilizando cuantización agresiva, decodificación especulativa y un runtime adaptado a ARM64. Es una opción atractiva para desarrolladores que necesitan inferencia local de alto rendimiento sin depender de clústeres multi-GPU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (mezcla de expertos) |
| Parametros totales | 320 mil millones |
| Parametros activos | 18 mil millones |
| Longitud de contexto | 262.144 tokens (262K) |
| Tipos de cuantizacion | EXL3 2.05 bpw (formato ExLlamaV3), FP8 para KV cache |
| Idiomas soportados | no disponible |
| Licencia | MIT (runtime y receta); DFlash2 es CC BY-NC-ND 4.0 (solo investigacion/evaluacion); licencia del modelo base no especificada en la informacion |
| Formato de pesos | EXL3 (no safetensors estandar; requiere ExLlamaV3) |

## Arquitectura y entrenamiento

El modelo base GLM-5.3-Flash es un transformer de mezcla de expertos (MoE) con 320B parámetros totales y 18B activos por token. Según el blog de Z.ai, parte de un modelo base entrenado desde cero, con arquitectura y datos de entrenamiento propios que no se detallan en la información disponible. Es nativamente multimodal, lo que implica que puede procesar texto e imágenes (aunque esta ficha se centra en el despliegue de texto).

El despliegue One-Spark utiliza tres componentes principales: el checkpoint cuantizado EXL3 2.05 bpw de Turboderp (que reduce el modelo a aproximadamente 2.05 bits por peso), el drafter DFlash2 K7 de Inco AI para decodificación especulativa, y un runtime vLLM adaptado a TP1 (tensor parallelism 1) sobre ARM64/SM121a. La cuantización EXL3 es una técnica de ExLlamaV3 que permite una compresión agresiva manteniendo calidad razonable. El drafter DFlash2 acelera la generación al predecir múltiples tokens en paralelo, que luego son verificados por el modelo principal. El runtime se deriva de la receta de dos DGX Sparks de MiaAI Lab, adaptada para un solo dispositivo.

## Capacidades

- Generación de texto y razonamiento de propósito general, con soporte para tareas complejas de código y matemáticas (según el fabricante del modelo base).
- Procesamiento multimodal nativo (texto e imágenes) en el modelo base, aunque el despliegue EXL3 puede tener limitaciones en este aspecto no documentadas.
- Decodificación especulativa mediante el drafter DFlash2, que acelera la inferencia sin cambiar la semántica del modelo.
- Soporte de contexto largo de hasta 262K tokens, adecuado para documentos extensos o conversaciones multi-turno.
- Capacidades agénticas y de tool calling (function calling) reportadas por Z.ai para el modelo base, aunque no se detallan en la información del despliegue.
- Integración con vLLM, lo que permite servir el modelo mediante una API compatible con OpenAI.

## Casos de uso

- Inferencia local de alto rendimiento en un solo dispositivo: el despliegue permite ejecutar un modelo de 320B en un DGX Spark, ideal para entornos donde no se dispone de clústeres multi-GPU. Con 64 tok/s en generación estructurada, es viable para aplicaciones interactivas.
- Asistente de código en producción: el modelo base destaca en tareas de programación y agentes. Con tool calling y contexto largo, puede integrarse en IDEs o pipelines de CI/CD para generación y revisión de código.
- Procesamiento de documentos largos: la ventana de 262K tokens permite analizar libros, informes técnicos o bases de conocimiento completas en una sola pasada, con prefill a ~845 tok/s en frío.
- Investigación académica en IA: el despliegue es reproducible y está documentado, lo que facilita experimentos con modelos MoE cuantizados en hardware de borde. La licencia MIT del runtime permite modificaciones, aunque DFlash2 restringe el uso comercial.
- Desarrollo de agentes autónomos: las capacidades agénticas del modelo base, combinadas con la baja latencia de este despliegue, lo hacen adecuado para sistemas de razonamiento multi-paso que requieren respuestas rápidas.
- Evaluación de cuantización agresiva: sirve como banco de pruebas para medir el impacto de EXL3 2.05 bpw en calidad y rendimiento, comparando con el modelo sin cuantizar o con otras cuantizaciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Sin embargo, la model card del despliegue reporta mediciones de rendimiento de inferencia en un DGX Spark (TP1, EXL3 2.05 bpw, DFlash2 K7, FP8 KV, thinking desactivado):

| Benchmark | Resultado |
|---|---:|
| Generacion estructurada C1, mediana de 5 ejecuciones, temperatura 0 | 64.053 tok/s |
| Generacion estructurada C1, mediana de 5 ejecuciones, temperatura 1.0/top-p 0.95 | 62.637 tok/s |
| Prosa abierta, mediana de 5 ejecuciones | 25.059 tok/s |
| C4 mediana de flujo activo | 40.958 tok/s/flujo |
| C4 suma de flujos activos (convencion MiaAI) | 181.944 tok/s |
| C4 tiempo total estricto (envio a finalizacion) | 91.475 tok/s |

Resultados de contexto largo (prefill y TTFT):

| Prompt | Prefill en frio | TTFT en frio | TTFT en caliente |
|---:|---:|---:|---:|
| 8K | 786.4 tok/s | 10.175 s | 1.775 s |
| 16K | 822.1 tok/s | 19.464 s | 2.786 s |
| 100K | 845.7 tok/s | 118.250 s | 8.842 s |

Nota: el valor de 181.944 tok/s en C4 es la suma de las tasas de decodificación activa de cada flujo, siguiendo la convención de MiaAI. El rendimiento estricto de lote completo es de 91.475 tok/s. Ambos números se publican intencionadamente.

## Requisitos de hardware

- Hardware objetivo: NVIDIA DGX Spark con GB10, 128 GB de memoria unificada, arquitectura ARM64/SM121a, CUDA 13.
- VRAM estimada: el modelo cuantizado a 2.05 bpw cabe en los 128 GB de memoria unificada del DGX Spark. No cabe en GPUs de consumo típicas (por ejemplo, RTX 4090 con 24 GB es insuficiente).
- GPU recomendadas: exclusivamente DGX Spark (o hardware equivalente con 128 GB de memoria unificada y soporte SM121a). No es compatible con x86.
- Opciones de despliegue: vLLM (runtime principal), ExLlamaV3 como motor de inferencia, TabbyAPI para API compatible con OpenAI, e imagen Docker preconstruida para ARM64 (`ghcr.io/gitcommit90/glm-5.3-one-spark:general23`).
- Latencia y rendimiento: 64 tok/s en generación estructurada, 25 tok/s en prosa, prefill de ~800 tok/s en frío. TTFT en caliente de 1.8 s para 8K tokens y 8.8 s para 100K tokens.

## Comparativa con modelos similares

No se dispone de datos comparativos directos con otros modelos en la información proporcionada. Sin embargo, se puede contextualizar:

| Modelo/Despliegue | Parametros | Contexto | Cuantizacion | Hardware | Rendimiento |
|---|---|---|---|---|---|
| GLM-5.3-Flash-EXL3-2.05-One-Spark (este) | 320B total, 18B activos | 262K | EXL3 2.05 bpw | 1x DGX Spark (128 GB) | 64 tok/s estructurado |
| GLM-5.3-Flash-EXL3-2x-DGX-Sparks (MiaAI) | 320B total, 18B activos | 262K | EXL3 (bpw no especificado) | 2x DGX Spark (256 GB) | no disponible |
| GLM-5.3-Flash (modelo base, sin cuantizar) | 320B total, 18B activos | 262K | FP16/BF16 | Requiere multiples GPUs | no disponible |

La comparativa con otros modelos MoE de tamaño similar (por ejemplo, DeepSeek-V3 o Qwen3-MoE) no está disponible en la información recopilada.

## Limitaciones y advertencias

- El repositorio no contiene pesos del modelo; es una página de despliegue. Los checkpoints deben descargarse de fuentes externas (Turboderp para EXL3, Inco AI para DFlash2).
- DFlash2 está bajo licencia CC BY-NC-ND 4.0, restringida a investigación y evaluación. Su uso comercial requiere licencia de Inco AI. No está incluido en el repositorio.
- La licencia MIT se aplica al runtime y la receta, no necesariamente al modelo base de Z.ai, cuya licencia no se especifica en la información disponible.
- El despliegue está optimizado para ARM64/SM121a y no es compatible con x86 ni con GPUs de consumo.
- El prefill en frío es lento para contextos muy largos (118 segundos para 100K tokens), lo que puede afectar a aplicaciones con requisitos estrictos de latencia inicial.
- No se han documentado sesgos específicos ni tasas de alucinación para este despliegue. Como cualquier modelo de lenguaje, puede generar contenido incorrecto o inventado, especialmente en tareas abiertas.
- La cuantización a 2.05 bpw puede degradar la calidad en comparación con el modelo sin cuantizar, aunque no se han publicado evaluaciones de calidad en la información disponible.
- El rendimiento de 181.9 tok/s en C4 es una convención de medición (suma de flujos activos); el rendimiento estricto de lote completo es de 91.5 tok/s, lo que debe tenerse en cuenta al dimensionar cargas de trabajo.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/gitcommit90/GLM-5.3-Flash-EXL3-2.05-One-Spark
- Coleccion HuggingFace: https://huggingface.co/collections/gitcommit90/glm-53-one-spark-6a98b70df9981ae425acbc05
- Codigo fuente e instrucciones (GitHub): https://github.com/gitcommit90/glm-5.3-one-spark
- Imagen Docker ARM64 preconstruida: `ghcr.io/gitcommit90/glm-5.3-one-spark:general23`
- Checkpoint cuantizado EXL3 (Turboderp): https://huggingface.co/turboderp/GLM-5.3-Flash-exl3/tree/2.05bpw
- Drafter DFlash2 (Inco AI): https://huggingface.co/incoai/GLM-5.3-Flash-DFlash2
- Modelo base GLM-5.3-Flash (Z.ai): https://huggingface.co/zai-org/GLM-5.3-Flash
- Blog de Z.ai sobre GLM-5.3-Flash: https://z.ai/blog/glm-5.3-flash
- Receta de dos DGX Sparks (MiaAI Lab): https://github.com/MiaAI-Lab/GLM-5.3-Flash-EXL3-2x-DGX-Sparks
- Despliegue alternativo con ExLlamaV3 y TabbyAPI (NeoAiLabs): https://github.com/NeoAiLabs/GLM-5.3-Flash-EXL3
