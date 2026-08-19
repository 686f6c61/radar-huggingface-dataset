# Preyazz/Qwen3.8-27B-GGUF

## Resumen

Qwen3.8-27B-GGUF es una cuantización estática en formato GGUF del modelo Qwen3.8-27B, desarrollado por el equipo Qwen de Alibaba. El modelo base es un transformer denso de 27 320 millones de parámetros con capacidades nativas de visión y lenguaje, arquitectura híbrida Gated-DeltaNet y predicción multi-token (MTP). Esta versión cuantizada, publicada por el usuario Preyazz, redistribuye los pesos del modelo original sin ningún entrenamiento adicional, aplicando únicamente cuantizaciones K‑quant estáticas para permitir su ejecución con llama.cpp y otros motores compatibles con GGUF.

La relevancia de esta ficha radica en que Qwen3.8-27B es la variante de la familia Qwen3.8 que puede ejecutarse en hardware de consumo, frente al modelo Qwen3.8-Max de 2,4 billones de parámetros. La cuantización GGUF reduce el tamaño de los pesos a entre 16 y 29 GB según la precisión elegida, lo que facilita el despliegue local en GPU de gama alta o incluso en configuraciones con memoria compartida. El modelo base ofrece una ventana de contexto de 256 000 tokens (ampliable hasta 1 millón) y capacidades de razonamiento y visión, lo que lo convierte en una opción atractiva para tareas multimodales y de agente.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso híbrido Gated-DeltaNet con MTP (multi-token prediction) |
| Parametros totales | 27 320 697 856 (27,3 B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 256 000 tokens (hasta 1 000 000 según documentación de Unsloth) |
| Tipos de cuantizacion | Q4_K_M, Q5_K_M, Q6_K, Q8_0 |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (archivos .gguf) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B emplea una arquitectura transformer densa con una capa de atención híbrida denominada Gated-DeltaNet, que combina mecanismos de atención lineal con componentes de estado recurrente. Incorpora además predicción multi-token (MTP), lo que permite anticipar varios tokens futuros durante la generación y mejora la eficiencia en tareas de razonamiento largo. El modelo es nativamente multimodal, aceptando entradas de imagen y texto (pipeline `image-text-to-text`).

No se dispone de información detallada sobre el proceso de entrenamiento del modelo base: número de tokens, composición del dataset, uso de RLHF o DPO. La cuantización GGUF aquí descrita se ha realizado mediante K‑quants estáticos, sin matriz de importancia, y no ha implicado ningún ajuste de pesos. El repositorio original del modelo base es la fuente de referencia para la documentación completa.

## Capacidades

- Generación de texto y razonamiento: el modelo base soporta tareas de lenguaje natural, incluyendo razonamiento multi-paso y modo de pensamiento (thinking mode) según la documentación de Unsloth.
- Comprensión de imágenes: al ser un modelo visión-lenguaje, puede procesar imágenes y responder preguntas sobre su contenido, así como realizar tareas de descripción y análisis visual.
- Ventana de contexto larga: 256 000 tokens nativos, ampliables hasta 1 000 000, lo que permite manejar documentos extensos, conversaciones multi-turno y contextos de agente prolongados.
- Soporte de herramientas y agentes: aunque no se especifica explícitamente en la información disponible, la arquitectura y el tamaño sugieren compatibilidad con tool calling y flujos de agente, pero no se puede confirmar sin documentación oficial.
- Multilingüismo: no se han publicado los idiomas soportados; se desconoce si el modelo cubre lenguas distintas del inglés y chino.

## Casos de uso

- Asistente multimodal local: desplegar el modelo en una estación de trabajo con GPU de 16‑24 GB (cuantización Q4_K_M o Q5_K_M) para responder preguntas sobre imágenes, documentos escaneados o capturas de pantalla, sin depender de servicios en la nube.
- Análisis de documentos extensos: gracias a la ventana de contexto de 256K tokens, se puede procesar informes largos, contratos o libros completos en una sola pasada, extrayendo resúmenes o respondiendo preguntas específicas.
- Generación de código asistida por visión: el modelo puede leer diagramas, capturas de pantalla de interfaces o esquemas y generar código o explicaciones técnicas a partir de ellos.
- Automatización de atención al cliente: con la capacidad de mantener conversaciones multi-turno y contexto largo, puede gestionar incidencias complejas que requieran recordar información de interacciones anteriores.
- Investigación académica: como modelo de 27B con licencia Apache 2.0, es adecuado para experimentos de fine-tuning o evaluación en entornos académicos sin restricciones de uso comercial.
- Desarrollo de agentes autónomos: su contexto amplio y razonamiento multi-paso permiten construir agentes que planifican y ejecutan tareas largas, como navegación web o gestión de proyectos, siempre que se confirme el soporte de tool calling.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del repositorio GGUF no incluye métricas de rendimiento, y las fuentes web consultadas tampoco proporcionan datos numéricos de MMLU, HumanEval, GSM8K u otras pruebas estandarizadas. Se recomienda consultar la documentación oficial del modelo base Qwen3.8-27B cuando esté disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: según la cuantización, el tamaño de los pesos es de aproximadamente 16 GB (Q4_K_M), 19 GB (Q5_K_M), 22 GB (Q6_K) y 29 GB (Q8_0). A esto hay que añadir la memoria para las claves y valores de atención y los buffers de cálculo, por lo que se recomienda una GPU con al menos 20 GB para Q4_K_M y 32 GB o más para Q8_0.
- GPU recomendadas: para Q4_K_M o Q5_K_M, una RTX 4080/4090 (16‑24 GB) o una A100 de 40 GB es suficiente. Para Q6_K o Q8_0, se necesitan GPUs con 24‑32 GB, como A100 40/80 GB, H100 o RTX 6000 Ada.
- Compatibilidad con GPU de consumo: sí, con cuantizaciones Q4_K_M o Q5_K_M en GPUs de 16‑24 GB. Para Q8_0 se requiere hardware profesional o de centro de datos.
- Opciones de despliegue: llama.cpp (mediante `llama-cli` o `llama-server`), Ollama, vLLM y SGLang (estos dos últimos para el modelo base en formato safetensors, no directamente con GGUF).
- Latencia y throughput: no se dispone de datos medidos. En general, un modelo de 27B cuantizado a Q4_K_M en una RTX 4090 puede generar entre 20 y 40 tokens por segundo, pero estos valores son estimaciones orientativas y dependen de la implementación y la longitud de la secuencia.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa fiable con otros modelos de la misma categoría. El modelo base Qwen3.8-27B es relativamente reciente y no se han publicado comparaciones con alternativas como Llama 3.1 70B, Mistral Large o Qwen2.5 32B. Se recomienda esperar a la documentación oficial del modelo base para obtener datos de rendimiento comparativo.

## Limitaciones y advertencias

- La cuantización GGUF introduce una pérdida de precisión que puede afectar ligeramente a la calidad de las respuestas, especialmente en tareas de razonamiento complejo o matemáticas. La degradación es menor en Q8_0 y mayor en Q4_K_M.
- No se han documentado los sesgos del modelo base. Como modelo entrenado por Alibaba, puede reflejar sesgos culturales o lingüísticos propios de los datos de entrenamiento, que no se han evaluado de forma independiente.
- Riesgo de alucinación: al igual que otros modelos de lenguaje, puede generar información falsa o inventada, especialmente en contextos largos o con entradas ambiguas.
- La ventana de contexto de 256K tokens es una capacidad teórica; en la práctica, el rendimiento puede degradarse con secuencias muy largas y el consumo de memoria aumenta considerablemente.
- La licencia Apache 2.0 permite uso comercial y modificación, pero el repositorio GGUF se distribuye "tal cual", sin garantía. El usuario debe revisar la licencia del modelo base para confirmar las condiciones exactas.
- No se ha confirmado el soporte de tool calling ni de funciones de agente; estas capacidades dependen de la implementación del motor de inferencia y de la documentación oficial del modelo base.

## Enlaces

- Repositorio HuggingFace del GGUF: https://huggingface.co/Preyazz/Qwen3.8-27B-GGUF
- Modelo base Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- Documentación de Unsloth sobre Qwen3.8: https://unsloth.ai/docs/models/qwen3.8
- Artículo de Yottalabs sobre especificaciones y requisitos: https://www.yottalabs.ai/post/qwen-3-8-27b-specs-hardware-requirements-how-to-run-2026
- Guía de ejecución local con Ollama y GGUF: https://www.yottalabs.ai/post/how-to-run-qwen-3-8-27b-locally-ollama-gguf-single-gpu-2026
- Artículo de SWFTE sobre despliegue local: https://www.swfte.com/blog/qwen-3-8-27b-run-locally-self-host-guide-2026
- Página de OpenLM.ai sobre Qwen3.8: https://openlm.ai/qwen3.8/
