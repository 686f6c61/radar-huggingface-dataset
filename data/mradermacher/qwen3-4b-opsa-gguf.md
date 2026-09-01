# mradermacher/Qwen3-4B-OPSA-GGUF

## Resumen

Este modelo es una cuantización GGUF del modelo Tuwhy/Qwen3-4B-OPSA, un fine-tuning de Qwen3-4B especializado en razonamiento matemático mediante el dataset DAPO-Math-17k. El autor de la cuantización, mradermacher, ofrece doce niveles de cuantización (desde Q2_K hasta f16) para facilitar el despliegue en entornos con recursos limitados, manteniendo la arquitectura transformer densa de Qwen3-4B con 4.022 millones de parámetros. Su relevancia radica en que permite ejecutar un modelo de razonamiento matemático en hardware de consumo, incluidas CPU y GPU de gama baja, gracias al formato GGUF. El modelo está etiquetado como orientado a razonamiento y matemáticas, con soporte únicamente para inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (basado en Qwen3-4B) |
| Parametros totales | 4.022.468.096 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | Ingles (etiquetado como "en") |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo base es Qwen3-4B, un transformer denso con 4.022 millones de parametros. El fine-tuning se realizo con el dataset BytedTsinghua-SIA/DAPO-Math-17k, un conjunto de datos de problemas matematicos. El metodo OPSA (Online Policy Search and Adaptation) se describe en el paper arXiv 2608.31046, aunque no se dispone de detalles adicionales sobre el proceso de entrenamiento. La cuantizacion es estatica, realizada por mradermacher, y no se menciona el uso de RLHF o DPO. El modelo conserva las capacidades generales de Qwen3-4B, pero esta optimizado para tareas de razonamiento y matematicas.

## Capacidades

- Razonamiento matematico: especializado en resolver problemas de algebra, calculo, geometria y otras areas de la matematica.
- Razonamiento general: heredado de Qwen3-4B, incluye logica basica y comprension de texto.
- Generacion de texto en ingles: puede producir explicaciones y soluciones paso a paso.
- No se dispone de informacion sobre tool calling, agentes, capacidades multimodales o soporte de otros idiomas.

## Casos de uso

- Resolucion de problemas matematicos: el modelo puede resolver ecuaciones, integrales, sistemas lineales y otros problemas tipicos de nivel universitario, gracias a su fine-tuning con DAPO-Math-17k.
- Tutoria educativa: puede actuar como asistente para estudiantes, explicando conceptos y desglosando soluciones en pasos comprensibles.
- Generacion de explicaciones paso a paso: adecuado para producir contenido didactico en matematicas, como soluciones detalladas para libros de texto o plataformas de aprendizaje.
- Verificacion de resultados: puede comprobar si una solucion matematica es correcta, comparando su propio razonamiento con el del usuario.
- Integracion en pipelines de razonamiento: puede usarse como modulo de razonamiento en sistemas de IA mas grandes, por ejemplo en agentes que necesiten resolver subproblemas matematicos.
- Experimentacion en entornos con recursos limitados: gracias a las cuantizaciones GGUF, puede ejecutarse en CPU con 8 GB de RAM o en GPU con 4 GB de VRAM, lo que lo hace accesible para prototipos y pruebas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: segun la cuantizacion, desde 1.8 GB (Q2_K) hasta 8.2 GB (f16). Para Q4_K_M (2.6 GB) se recomienda al menos 4 GB de VRAM.
- GPU recomendadas: tarjetas de consumo como NVIDIA RTX 3060, RTX 4060 o superiores. Tambien puede ejecutarse en CPU con suficiente RAM (por ejemplo, 8 GB para Q4_K_M).
- Opciones de despliegue: compatible con llama.cpp, Ollama, LM Studio y otros motores que soporten GGUF.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Especializacion |
|---|---|---|---|---|---|
| Qwen3-4B-OPSA (este) | 4.022 M | No disponible | Apache-2.0 | GGUF | Matematicas y razonamiento |
| Qwen3-4B (base) | 4.022 M | 32K (segun documentacion oficial) | Apache-2.0 | Safetensors, GGUF | Generalista |
| Llama-3.2-3B | 3.210 M | 128K | Llama 3.2 | Safetensors, GGUF | Generalista |
| Phi-3-mini-4k | 3.820 M | 4K | MIT | Safetensors, GGUF | Razonamiento y codigo |

Nota: los datos de contexto de Qwen3-4B y Llama-3.2-3B provienen de sus respectivas documentaciones oficiales, no de la informacion de este repositorio. No se dispone de datos de rendimiento comparativo.

## Limitaciones y advertencias

- Especializacion en matematicas: el fine-tuning puede degradar el rendimiento en tareas no matematicas, como generacion de codigo o conversacion general.
- Riesgo de alucinacion: como cualquier modelo de lenguaje, puede generar respuestas incorrectas o inventadas, especialmente en dominios fuera de su entrenamiento.
- Solo ingles: no soporta otros idiomas de forma nativa, lo que limita su uso en entornos multilingues.
- Cuantizacion: los niveles de cuantizacion mas bajos (Q2_K, Q3_K) pueden degradar la calidad de las respuestas. Se recomienda Q4_K_M o superior para uso serio.
- Licencia: Apache-2.0 permite uso comercial, pero se debe verificar la licencia del modelo base Qwen3-4B y del dataset DAPO-Math-17k para cumplir con sus condiciones.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mradermacher/Qwen3-4B-OPSA-GGUF
- Modelo base (Tuwhy/Qwen3-4B-OPSA): https://huggingface.co/Tuwhy/Qwen3-4B-OPSA
- Dataset DAPO-Math-17k: https://huggingface.co/datasets/BytedTsinghua-SIA/DAPO-Math-17k
- Paper arXiv (OPSA): 2608.31046 (sin enlace directo disponible)
- Pagina de mradermacher: https://huggingface.co/mradermacher
