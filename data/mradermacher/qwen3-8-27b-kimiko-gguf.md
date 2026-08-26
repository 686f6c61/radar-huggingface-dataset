# mradermacher/Qwen3.8-27B-Kimiko-GGUF

## Resumen

El repositorio `mradermacher/Qwen3.8-27B-Kimiko-GGUF` contiene cuantizaciones GGUF del modelo `nlpguy/Qwen3.8-27B-Kimiko`, un ajuste fino (fine-tuning) del modelo base Qwen3.8-27B desarrollado por Alibaba. Este modelo base es un transformer denso multimodal con atención híbrida (lineal en 48 de sus 64 capas), una torre de visión integrada y una cabeza de borrador MTP para decodificación especulativa. Su contexto nativo es de 262 000 tokens, extensible a 1 000 000. Los archivos GGUF permiten ejecutar el modelo en entornos con recursos limitados, como ordenadores personales con CPU o GPUs de consumo, mediante herramientas como llama.cpp u Ollama.

La información pública sobre el ajuste fino "Kimiko" es muy escasa: no se especifica en qué se diferencia del modelo base ni qué técnicas de entrenamiento se emplearon. El repositorio GGUF no incluye una model card descriptiva, solo una línea que indica que se trata de cuantizaciones estáticas del modelo de `nlpguy`. Los metadatos de HuggingFace reportan 460 730 096 parámetros totales, una cifra claramente inconsistente con el nombre del modelo (27B), por lo que debe tomarse con cautela. El tamaño total del repositorio es de 1,6 GB, lo que sugiere que se trata de una cuantización de baja precisión (posiblemente Q2 o Q3) o que el archivo GGUF es único, aunque se listan varias variantes en los comentarios.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Densa con atención híbrida (lineal en 48 de 64 capas), torre de visión y cabeza MTP (según modelo base Qwen3.8-27B) |
| Parametros totales | 460 730 096 (según metadatos de HuggingFace; inconsistente con el nombre del modelo, que indica 27B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible en este repositorio; el modelo base Qwen3.8-27B tiene 262K nativo, extensible a 1M |
| Tipos de cuantizacion | x-f16, Q4_K_S, Q2_K, Q3_K_M, Q3_K_S, Q3_K_L, Q4_K_M, Q5_K_S, Q5_K_M, Q8_0, Q6_K, IQ4_XS (según comentarios de la model card) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo original `nlpguy/Qwen3.8-27B-Kimiko` es un ajuste fino de Qwen3.8-27B, pero no se dispone de información pública sobre el conjunto de datos, el método de entrenamiento (por ejemplo, RLHF, DPO, SFT) ni los objetivos específicos del ajuste. El modelo base Qwen3.8-27B emplea una arquitectura densa con atención híbrida: 48 de las 64 capas usan atención lineal (para reducir coste computacional) y las restantes usan atención completa. Incluye un vision tower para procesar imágenes y un MTP (Multi-Token Prediction) draft head para acelerar la decodificación especulativa. El entrenamiento del modelo base se realizó con un contexto de 262 144 tokens, y se ha demostrado que puede extenderse a 1 000 000 mediante técnicas de interpolación posicional. El repositorio GGUF se limita a convertir los pesos a formato GGUF con diferentes niveles de cuantización, sin modificar los pesos originales.

## Capacidades

- No se ha publicado una descripción detallada de las capacidades específicas del ajuste "Kimiko". Por tanto, no se puede confirmar si conserva todas las funcionalidades del modelo base.
- Según la información del modelo base Qwen3.8-27B (encontrada en la búsqueda web), el modelo es multimodal, capaz de procesar texto e imágenes.
- Soporta generación de texto, razonamiento, código y matemáticas (heredado del modelo base).
- Incluye soporte para tool calling y agentic workflows (según el repositorio oficial de Qwen3.8-27B en GitHub).
- Capacidad de procesar contextos largos (262K nativos).
- La versión GGUF puede ejecutarse en entornos CPU/GPU con herramientas como llama.cpp, Ollama o vLLM, dependiendo de la cuantización elegida.

## Casos de uso

Dado que no se dispone de información concreta sobre el fine-tuning "Kimiko", los casos de uso son los mismos que para cualquier modelo de la familia Qwen3.8-27B ejecutado vía GGUF:

- **Despliegue local en hardware de consumo**: gracias a las cuantizaciones GGUF, es posible ejecutar el modelo en una GPU de gama media (por ejemplo, RTX 3060 12GB) o incluso solo CPU con baja cuantización (Q2_K o Q3_K), para pruebas rápidas sin depender de la nube.
- **Prototipado de aplicaciones de chatbot**: se puede integrar en aplicaciones de chat local mediante Ollama o llama.cpp, con la ventaja de un contexto largo para conversaciones extensas.
- **Procesamiento de documentos largos**: con el contexto de 262K tokens (si se conserva en el ajuste), es adecuado para resumir informes, análisis de contratos o extracción de información de documentos extensos.
- **Automatización de tareas de oficina**: el modelo base está optimizado para office automation, como generación de informes, correos electrónicos y resúmenes de reuniones.
- **Generación de código y asistencia en programación**: el modelo base destaca en coding, por lo que puede usarse como asistente de código en entornos locales, con soporte de tool calling para integración en IDEs.
- **Creación de agentes conversacionales**: gracias a su capacidad de tool calling y multi-step reasoning, puede ser la base de un agente que interactúa con APIs o bases de datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio GGUF no incluye métricas de rendimiento, y el modelo base Qwen3.8-27B tiene resultados oficiales en el repositorio de Alibaba, pero no se han reproducido aquí. Para una evaluación específica de este ajuste fino, es necesario ejecutar pruebas propias con datasets como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- **VRAM estimada**: no se puede estimar con precisión sin conocer el archivo GGUF concreto. Para un modelo de 27B parámetros, una cuantización Q4_K_M requiere aproximadamente 14 GB de VRAM; Q3_K_M ~11 GB; Q2_K ~9 GB. Sin embargo, el tamaño del repositorio (1,6 GB) sugiere que podría tratarse de una cuantización muy baja (Q2_K o Q3_K) o que el modelo tiene menos parámetros de los que sugiere el nombre.
- **GPU recomendadas**: para cuantizaciones Q4 o superiores, una RTX 4090 (24 GB) o una A100 (40 GB) son adecuadas. Para cuantizaciones más bajas, una RTX 3060 (12 GB) o incluso una GTX 1080 Ti (11 GB) podrían funcionar.
- **Si cabe en GPU consumer**: sí, dependiendo de la cuantización. Una RTX 3060 de 12 GB puede ejecutar una Q3_K_M de 27B, aunque con contextos reducidos.
- **Opciones de despliegue**: llama.cpp, Ollama, vLLM (con soporte GGUF), llama-cpp-python, etc.
- **Latencia y throughput**: no hay datos disponibles. La velocidad depende del hardware y de la cuantización; en CPU, un modelo 27B Q4 puede producir entre 1-5 tokens/s en un Ryzen 9, mientras que en GPU puede alcanzar 20-50 tokens/s.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantizaciones | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mradermacher/Qwen3.8-27B-Kimiko-GGUF | 460M (según metadatos) o 27B (según nombre) | No disponible | Múltiples (Q2-Q8, IQ4) | No disponible | Hugging Face |
| unsloth/Qwen3.8-27B-GGUF | 27B | 262K | Q2_K a Q8_0 | Apache 2.0 (modelo base) | Hugging Face |
| mradermacher/Qwen3.8-27B-Uncensored-FP8-GGUF | 27B | 262K | FP8 | No disponible | Hugging Face |

Nota: la comparativa se basa en la información pública del modelo base, no en el ajuste fino específico. No se dispone de resultados de rendimiento para comparar.

## Limitaciones y advertencias

- **Inconsistencia en los metadatos**: el número de parámetros reportado (460 730 096) no coincide con el nombre del modelo (27B), lo que puede deberse a un error en la extracción o a que el repositorio contiene un modelo diferente al que sugiere el nombre. Se recomienda verificar antes de usarlo en producción.
- **Información insuficiente**: no se documenta el proceso de fine-tuning ni las modificaciones realizadas respecto al modelo base. No se puede garantizar que las capacidades del modelo base se mantengan íntegras.
- **Licencia desconocida**: no se indica la licencia del modelo ajustado ni de las cuantizaciones, lo que puede ser un problema para uso comercial. Es necesario contactar con el autor o revisar el repositorio original `nlpguy/Qwen3.8-27B-Kimiko`.
- **Riesgo de alucinación**: como cualquier LLM, puede generar contenido falso o no verificado. Sin evaluación específica, el riesgo no se conoce.
- **Sesgos**: no se ha publicado ningún estudio de sesgos del modelo ajustado.
- **Contexto**: aunque el modelo base soporta 262K tokens, las cuantizaciones GGUF pueden degradar el rendimiento con contextos muy largos debido a la pérdida de precisión en la atención lineal.

## Enlaces

- Repositorio Hugging Face de la cuantización: [mradermacher/Qwen3.8-27B-Kimiko-GGUF](https://huggingface.co/mradermacher/Qwen3.8-27B-Kimiko-GGUF)
- Repositorio original del modelo: [nlpguy/Qwen3.8-27B-Kimiko](https://huggingface.co/nlpguy/Qwen3.8-27B-Kimiko)
- Repositorio oficial de Qwen3.8-27B en GitHub: [AlibabaCloud-Official/Qwen3.8-27B](https://github.com/AlibabaCloud-Official/Qwen3.8-27B)
- Comparativa de cuantizaciones de Qwen3.8-27B: [kingy.ai](https://kingy.ai/blog/qwen3-8-27b-best-quantization-gguf/)
- Recetas vLLM para Qwen3.8-27B: [recipes.vllm.ai/Qwen/Qwen3.8-27B](https://recipes.vllm.ai/Qwen/Qwen3.8-27B)
