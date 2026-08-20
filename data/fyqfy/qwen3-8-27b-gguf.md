# fyqfy/Qwen3.8-27B-GGUF

## Resumen

Qwen3.8-27B es un modelo de lenguaje denso de 27.320 millones de parámetros desarrollado por el equipo Qwen de Alibaba, publicado el 14 de agosto de 2026 bajo licencia Apache 2.0. Se trata de la generación más reciente de la familia Qwen abierta, diseñada para ofrecer un rendimiento competitivo en tareas de codificación, trabajo profesional, investigación y agentes autónomos de largo alcance, todo ello en un tamaño compacto que puede ejecutarse en una sola GPU.

El modelo es nativamente multimodal, ya que incorpora un codificador de visión que le permite procesar imágenes y vídeo, además de texto. Su arquitectura híbrida combina capas de atención lineal (Gated DeltaNet) con capas de atención clásica (Gated Attention), lo que le permite manejar contextos de hasta 262.144 tokens de forma nativa, extensibles a 1.000.000. También incluye un modo de pensamiento (thinking) configurable, que puede activarse o desactivarse por petición, y un mecanismo de predicción multi-token (MTP) que mejora la eficiencia y la calidad de las respuestas.

Este repositorio concreto, `fyqfy/Qwen3.8-27B-GGUF`, ofrece los pesos del modelo en formato GGUF, cuantizados mediante la técnica imatrix de Unsloth (Dynamic V3.0), lo que permite su ejecución en hardware de consumo con llama.cpp, Ollama u otros motores compatibles. La cuantización ha sido optimizada para mantener la precisión frente a otras alternativas del mercado, según las afirmaciones de Unsloth.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Causal Language Model con Vision Encoder, híbrida Gated DeltaNet + Gated Attention |
| Parametros totales | 27.320.697.856 (27,32 B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262.144 tokens nativos, extensible a 1.000.000 |
| Tipos de cuantizacion | No se especifican en el repositorio; al ser GGUF se esperan cuantías típicas (Q4_K_M, Q5_K_M, Q6_K, Q8_0) |
| Idiomas soportados | No disponibles en la información; el modelo base Qwen es multilingüe |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors disponibles en el modelo base) |

## Arquitectura y entrenamiento

Qwen3.8-27B se basa en una arquitectura de transformer causal con un codificador de visión adicional. El bloque de lenguaje está compuesto por 64 capas, con una dimensión oculta de 5120 y una dimensión intermedia de 17.408 en las redes feed-forward. El modelo usa una combinación de dos tipos de atención: Gated DeltaNet, que implementa atención lineal con 48 cabezas para V y 16 para QK (dimensión de cabeza 128), y Gated Attention (atención clásica) con 24 cabezas para Q y 4 para KV (dimensión de cabeza 256). Esta mezcla permite escalar el contexto a 262K tokens sin un coste cuadrático completo.

El entrenamiento incluye una fase de pre-entrenamiento y otra de post-entrenamiento, con técnicas de ajuste fino supervisado y aprendizaje por refuerzo. El modelo incorpora un módulo de predicción multi-token (MTP) que predice varios tokens a la vez, mejorando la velocidad de inferencia y la calidad del texto generado. La parte de visión se entrena conjuntamente, lo que permite entender diagramas, documentos y vídeos de hasta una hora de duración. No se han publicado detalles específicos sobre el volumen total de tokens de entrenamiento ni sobre la composición exacta del dataset.

## Capacidades

- Generación de texto de alta calidad en tareas de codificación, razonamiento matemático, trabajo profesional e investigación.
- Comprensión multimodal nativa: procesa imágenes (diagramas, documentos, gráficos) y vídeo de larga duración (hasta horas).
- Modo de pensamiento (thinking) activable por petición, con control de profundidad mediante `reasoning_effort` y conservación del contexto de razonamiento histórico con `preserve_thinking`.
- Soporte de tool calling / function calling mejorado para integración en agentes y herramientas de desarrollo.
- Ejecución de tareas agénticas de largo recorrido (multi-step reasoning) con planificación autónoma y manejo de feedback del entorno.
- Capacidades multilingües (según el modelo base Qwen, que soporta más de 30 idiomas, aunque no se detalla la lista completa en la información disponible).
- Compatibilidad con entornos de desarrollo populares (harnesses, frameworks) gracias a su soporte de integración.

## Casos de uso

- **Asistente de codificación en producción**: el modelo puede generar, revisar y refactorizar código en múltiples lenguajes. Gracias a su soporte de tool calling y su ventana de contexto de 262K, puede manejar repositorios completos y mantener coherencia en proyectos grandes, integrándose en pipelines de CI/CD para revisión automática de pull requests.
- **Automatización de oficina y documentos**: con su capacidad de visión, puede extraer datos de facturas, contratos o informes escaneados, resumir documentos largos y generar informes estructurados. Su contexto extendido permite procesar documentos de cientos de páginas sin truncamiento.
- **Agentes autónomos de investigación**: el modelo puede planificar y ejecutar tareas de investigación web, recopilar información de múltiples fuentes, analizar resultados y redactar informes. Su modo de pensamiento y su capacidad de razonamiento multi-paso lo hacen adecuado para este tipo de tareas.
- **Análisis de vídeo**: gracias a su visión nativa, puede analizar vídeos de hasta una hora, transcribir contenido, detectar eventos y generar resúmenes descriptivos. Útil para vigilancia, revisión de material de archivo o análisis de contenido audiovisual.
- **Atención al cliente automatizada**: puede gestionar conversaciones multi-turno con contexto largo (hasta 262K tokens), manteniendo el hilo de la conversación y accediendo a historial completo. Su capacidad de tool calling permite integrarse con CRMs y bases de conocimiento para resolver consultas complejas.
- **Generación de informes y análisis de datos**: puede procesar grandes volúmenes de texto y datos numéricos, generar visualizaciones conceptuales y producir informes ejecutivos. Su contexto largo y su capacidad de razonamiento permiten analizar series temporales y documentos financieros.
- **Asistencia educativa y tutoría**: el modo de pensamiento permite desglosar problemas matemáticos o científicos paso a paso, ofreciendo explicaciones detalladas y adaptadas al nivel del estudiante. Su capacidad multilingüe facilita su uso en entornos educativos internacionales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información proporcionada. Aunque el modelo base Qwen3.8-27B ha sido evaluado por el equipo de Alibaba, los datos concretos (MMLU, HumanEval, GSM8K, etc.) no están incluidos en el repositorio de GGUF ni en la documentación disponible. Se recomienda consultar la documentación oficial de Qwen para obtener resultados detallados.

## Requisitos de hardware

- **VRAM estimada para inferencia**: para una cuantización Q4_K_M (típica en GGUF), se necesitan aproximadamente 16-18 GB de VRAM para cargar el modelo en memoria. Con Q5_K_M ~19-20 GB, y con Q8_0 ~28 GB. Para el contexto completo de 262K tokens, se necesita VRAM adicional, aunque el modelo usa atención eficiente que reduce el overhead.
- **GPU recomendadas**: el modelo en Q4_K_M puede ejecutarse en una RTX 4090 (24 GB) o en una A100 40GB. Para Q8_0 se recomienda A100 80GB, H100 80GB o similares. También funciona en GPUs profesionales como las de la serie RTX A6000 (48 GB) para cuantías intermedias.
- **Compatibilidad con hardware de consumo**: sí, con cuantización Q4_K_M o menor (Q2_K, Q3_K) cabe en GPUs de 12-16 GB (como RTX 4070 Ti o RTX 3080), aunque el rendimiento y la calidad de respuesta pueden degradarse ligeramente.
- **Opciones de despliegue**: compatible con llama.cpp, Ollama, vLLM (con soporte GGUF), TGI (Text Generation Inference) y el ecosistema de Unsloth (Unsloth Desktop). También se puede usar con frameworks de Python como llama-cpp-python o ctransformers.
- **Latencia y throughput**: no se han publicado datos concretos. En una RTX 4090 con Q4_K_M, se espera una velocidad de decodificación de 50-100 tokens por segundo para texto, y una latencia inicial de ~0.5-1 segundo, dependiendo del contexto. La predicción multi-token (MTP) puede mejorar el throughput en un 10-20% respecto a modelos sin esta característica.

## Comparativa con modelos similares

No se dispone de datos comparativos publicados en la información proporcionada. Sin embargo, el modelo se posiciona como la variante densa de 27B de la generación Qwen3.8, frente a otras opciones como:

- **Qwen3.8-27B (safetensors)**: el modelo original en formato fp16, disponible en Hugging Face. Requiere más VRAM (≈54 GB en fp16) pero ofrece la máxima calidad de inferencia. El GGUF aquí descrito es una cuantización que reduce el tamaño a cambio de una ligera pérdida de precisión.
- **Qwen3.5-27B**: generación anterior, también densa y con arquitectura similar (Gated DeltaNet + Gated Attention), pero sin capacidades de visión nativa ni el contexto extensible a 1M. La licencia también es Apache 2.0.
- **Llama 3.1 8B** o **Llama 3.1 70B**: modelos de referencia de Meta, con arquitectura transformer estándar, sin visión nativa (salvo versiones específicas) y con contextos de 128K tokens. Qwen3.8-27B ofrece una mejor relación calidad/contexto para tareas de visión y agentes.

No se dispone de resultados de benchmarks para comparar numéricamente estos modelos.

## Limitaciones y advertencias

- **Sesgos conocidos**: como cualquier modelo entrenado con datos web, puede reflejar sesgos sociales, culturales y de género presentes en los datos de entrenamiento. No se han publicado evaluaciones específicas de sesgo para este modelo.
- **Riesgo de alucinación**: en modo no pensamiento (instruct) puede generar respuestas falsas o inventadas, especialmente en temas de actualidad o cuando el contexto es insuficiente. Se recomienda verificar la información crítica.
- **Limitaciones de contexto**: aunque el contexto nativo es de 262K tokens, el rendimiento puede degradarse cuando se utilizan los 1M tokens de extensión, y el coste de VRAM crece linealmente con el contexto.
- **Idiomas**: aunque el modelo es multilingüe, el rendimiento puede ser inferior en idiomas poco representados en el entrenamiento. El español está bien soportado, pero se recomienda probar en casos concretos.
- **Restricciones de licencia**: Apache 2.0 permite uso comercial, modificación y redistribución, siempre que se mantenga el aviso de copyright y se indiquen los cambios realizados. No hay restricciones de uso militar o de vigilancia explícitas, pero se debe cumplir la normativa local.
- **Caveats de producción**: al ser una cuantización GGUF, la calidad de las respuestas puede variar respecto al modelo original fp16. La cuantización imatrix (Dynamic V3.0) reduce la pérdida, pero en tareas de razonamiento complejo se recomienda usar cuantías más altas (Q6_K o Q8_0). Además, el modo de pensamiento (thinking) activa por defecto puede aumentar la latencia y el consumo de VRAM.

## Enlaces

- [Hugging Face: fyqfy/Qwen3.8-27B-GGUF](https://huggingface.co/fyqfy/Qwen3.8-27B-GGUF)
- [Modelo base en Hugging Face: Qwen/Qwen3.8-27B](https://huggingface.co/Qwen/Qwen3.8-27B)
- [GitHub oficial: AlibabaCloud-Official/Qwen3.8-27B](https://github.com/AlibabaCloud-Official/Qwen3.8-27B)
- [Guía de Unsloth para Qwen3.8](https://unsloth.ai/docs/models/qwen3.8)
- [Documentación de Unsloth Dynamic 3.0 GGUF](https://unsloth.ai/docs/basics/dynamic-3.0-ggufs)
- [Ficha en FitMyLLM](https://www.fitmyllm.com/model/qwen3.8-27b)
- [Ficha en Best of AI](https://bestofai.io/models/qwen3-8-27b/)
- [Documentación de Cloudflare Workers AI](https://developers.cloudflare.com/workers-ai/models/qwen3.8-27b/)
