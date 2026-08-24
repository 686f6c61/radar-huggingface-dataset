# mradermacher/ABForge-Qwen3-8B-i1-GGUF

## Resumen

ABForge-Qwen3-8B-i1-GGUF es una colección de cuantizaciones GGUF del modelo ABForge-Qwen3-8B, creada por mradermacher. El modelo base, desarrollado por SlowGuess, es un ajuste fino de Qwen3-8B orientado a razonamiento científico y ablación post-entrenamiento. Esta versión GGUF está pensada para facilitar la ejecución local en una amplia variedad de hardware, desde GPU de consumo hasta entornos con recursos limitados, gracias a la disponibilidad de múltiples niveles de cuantización.

La relevancia de este modelo radica en combinar la arquitectura probada de Qwen3-8B con un ajuste especializado en razonamiento científico, y en que el trabajo de cuantización de mradermacher es conocido por su calidad y por ofrecer tanto cuantizaciones estáticas como con imatrix. La versión i1 incluye cuantizaciones con importancia matrix (imatrix), que suelen ofrecer mejor calidad para un mismo tamaño de archivo en comparación con las cuantizaciones estáticas convencionales. Con 8.190 millones de parámetros, es un modelo de tamaño medio que puede ejecutarse en GPUs de consumo con las cuantizaciones adecuadas.

El modelo está pensado para desarrolladores e investigadores que necesitan un modelo de razonamiento científico en local, con la flexibilidad de elegir entre velocidad y calidad según el hardware disponible. La licencia Apache 2.0 permite uso comercial sin restricciones significativas.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (dense, basado en Qwen3-8B) |
| Parametros totales | 8.190.735.360 (8,19 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens (heredado de Qwen3-8B) |
| Tipos de cuantizacion | i1-IQ1_S, i1-IQ1_M, i1-IQ2_XXS, i1-IQ2_XS, i1-IQ2_S, i1-IQ2_M, i1-Q2_K_S, i1-Q2_K, i1-IQ3_XXS, i1-IQ3_XS, i1-Q3_K_S, i1-IQ3_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-Q4_0, i1-IQ4_NL, i1-Q4_K_S, i1-Q4_K_M, i1-Q4_1, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo base ABForge-Qwen3-8B es un ajuste fino de Qwen3-8B, un transformer denso de 8.190 millones de parámetros desarrollado por Alibaba Cloud. Qwen3-8B incorpora la capacidad de alternar entre "modo pensamiento" (thinking mode), que genera razonamientos paso a paso para problemas complejos, y "modo no pensamiento" (non-thinking mode), para respuestas rápidas y directas. Esta dualidad se implementa mediante tokens especiales que el modelo aprende a usar durante el entrenamiento.

El dataset de entrenamiento del ajuste es abforge-data, publicado por SlowGuess, y se centra en razonamiento científico y ablación post-entrenamiento. Los detalles exactos del proceso de entrenamiento (número de tokens, composición del dataset, uso de RLHF o DPO) no están disponibles en la información proporcionada. La cuantización GGUF fue realizada por mradermacher con técnica imatrix, que optimiza los pesos de cuantización basándose en la importancia de las activaciones, mejorando la calidad percibida respecto a cuantizaciones estáticas del mismo tamaño.

## Capacidades

- Generación de texto y diálogo conversacional en inglés, con razonamiento paso a paso para problemas científicos y matemáticos.
- Razonamiento multi-step: el modo pensamiento de Qwen3 permite descomponer problemas complejos en pasos intermedios.
- Generación de código: hereda las capacidades de Qwen3-8B para programación en múltiples lenguajes.
- Soporte de tool calling / function calling: disponible en la familia Qwen3, aunque no se confirma explícitamente en esta cuantización.
- Capacidades multilingües limitadas: el modelo base Qwen3 soporta más idiomas, pero la model card solo declara inglés como idioma soportado.
- No soporta visión ni audio: es un modelo de texto puro.

## Casos de uso

- Razonamiento científico asistido: el modelo puede ayudar a investigadores a estructurar hipótesis, revisar literatura y descomponer problemas de física, química o biología en pasos lógicos, gracias al modo pensamiento de Qwen3.
- Análisis de datos y matemáticas aplicadas: con el modo pensamiento activado, puede resolver problemas de cálculo, estadística o álgebra lineal, siendo útil para estudiantes e investigadores que necesitan ver el proceso de resolución.
- Generación y revisión de código técnico: para scripts de análisis de datos, simulación numérica o automatización de laboratorio, el modelo puede generar código Python o R y explicar el razonamiento detrás de las soluciones.
- Asistente educativo en inglés: como tutor de ciencias, puede explicar conceptos complejos paso a paso, adaptando el nivel de detalle según la petición.
- Chatbot de documentación técnica: integrado en sistemas de ayuda para proyectos de ingeniería o investigación, puede responder preguntas sobre procedimientos o conceptos con razonamiento estructurado.
- Despliegue en hardware modesto: gracias a las cuantizaciones i1-IQ2 o i1-Q3, puede ejecutarse en laptops con 8-16 GB de RAM o GPUs de gama baja, sirviendo como asistente local de razonamiento sin conexión a la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para ABForge-Qwen3-8B en la información disponible. Los datos de rendimiento del modelo base Qwen3-8B (MMLU, HumanEval, GSM8K, etc.) están publicados por Alibaba Cloud, pero no se pueden atribuir directamente a este ajuste sin datos propios del autor. Se recomienda consultar el repositorio de SlowGuess para posibles evaluaciones futuras.

## Requisitos de hardware

- VRAM estimada para inferencia:
  - Cuantizaciones i1-Q4_K_M (5,1 GB): ~6 GB de VRAM para contexto corto, ~8 GB con contexto largo.
  - Cuantizaciones i1-Q3_K_M (4,2 GB): ~5 GB de VRAM.
  - Cuantizaciones i1-IQ2_M (3,2 GB): ~4 GB de VRAM.
  - Cuantizaciones i1-IQ1_S (2,2 GB): ~3 GB de VRAM, calidad muy degradada.
- GPUs recomendadas:
  - RTX 3090/4090 (24 GB): puede ejecutar cuantizaciones Q5/Q6 con contexto completo.
  - RTX 3060 (12 GB) / RTX 4070 (12 GB): cuantizaciones Q4_K_M o Q5_K_S con contexto moderado.
  - GTX 1080 (8 GB): cuantizaciones Q3_K_M o inferiores.
  - CPU (sin GPU): viable con cuantizaciones Q4_K_M o inferiores usando llama.cpp, con velocidad de 5-15 tokens/s en CPUs modernas.
- Opciones de despliegue:
  - llama.cpp (formato GGUF nativo) y servidores compatibles: llama-server, Ollama, LM Studio.
  - vLLM y TGI no son compatibles con GGUF de forma nativa; necesitan el formato safetensors del modelo base.
- Latencia y throughput: no disponible para este ajuste específico.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Enfoque |
|---|---|---|---|---|---|
| ABForge-Qwen3-8B (este) | 8,19 B | 32.768 | Apache 2.0 | GGUF | Razonamiento científico |
| Qwen3-8B (base) | 8,19 B | 32.768 | Apache 2.0 | safetensors | Generalista con modo pensamiento |
| Qwen2.5-7B-Instruct | 7,61 B | 32.768 | Apache 2.0 | safetensors/GGUF | Generalista, sin modo pensamiento |
| Llama-3.1-8B-Instruct | 8,03 B | 131.072 | Llama 3.1 License | safetensors/GGUF | Generalista, contexto largo |

La comparativa es orientativa: ABForge-Qwen3-8B hereda las capacidades de Qwen3-8B, pero el ajuste científico puede mejorar o degradar el rendimiento en tareas generales. No hay benchmarks propios para comparar.

## Limitaciones y advertencias

- Idioma limitado: la model card solo declara inglés; el uso en español u otros idiomas puede degradar la calidad de las respuestas.
- Sin datos de evaluación del ajuste: no hay benchmarks publicados que validen el rendimiento específico de ABForge-Qwen3-8B frente al modelo base.
- Riesgo de alucinación: como cualquier modelo de lenguaje, puede generar información falsa con confianza, especialmente en temas científicos donde no hay datos verificados.
- Sesgos heredados: Qwen3-8B puede presentar sesgos de género, raza o culturales presentes en sus datos de entrenamiento, no mitigados por el ajuste.
- Cuantizaciones extremas: las cuantizaciones i1-IQ1 e IQ2 degradan significativamente la calidad y solo son recomendables para pruebas o hardware muy limitado.
- Sin garantías de tool calling: aunque Qwen3 soporta function calling, no se confirma que el ajuste de ABForge lo mantenga de forma estable.
- Fecha de publicación: la fecha de creación (2026-08-14) es futura respecto a la fecha de conocimiento actual, lo que puede indicar un error de metadatos o un modelo muy reciente.

## Enlaces

- Repositorio GGUF en HuggingFace: https://huggingface.co/mradermacher/ABForge-Qwen3-8B-i1-GGUF
- Modelo base (safetensors): https://huggingface.co/SlowGuess/ABForge-Qwen3-8B
- Dataset de entrenamiento: https://huggingface.co/datasets/SlowGuess/abforge-data
- Cuantizaciones estáticas: https://huggingface.co/mradermacher/ABForge-Qwen3-8B-GGUF
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Comparativa de cuantizaciones (gráfico): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Análisis de cuantizaciones de Artefact2: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- FAQ y peticiones de modelos de mradermacher: https://huggingface.co/mradermacher/model_requests
- Paper técnico de Qwen3: https://arxiv.org/html/2505.09388v1
