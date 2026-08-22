# mradermacher/MANGO1.5-Qwen3.5-9B-GGUF

## Resumen

MANGO1.5-Qwen3.5-9B es un modelo de lenguaje bilingüe (tailandés e inglés) desarrollado por CMKL, una institución tailandesa, a partir del modelo base Qwen3.5-9B. El modelo se ha ajustado mediante LoRA y supervisión fina (SFT) para mejorar el rendimiento en tailandés, un idioma de bajos recursos con poca presencia en los corpus de entrenamiento estándar. La versión que aquí se documenta es una cuantización GGUF preparada por mradermacher, que permite ejecutar el modelo en hardware de consumo mediante motores como llama.cpp u Ollama.

La relevancia de esta ficha radica en que ofrece una alternativa bilingüe para aplicaciones de procesamiento de lenguaje natural en tailandés, con la flexibilidad de elegir entre distintas cuantizaciones según el compromiso entre calidad y uso de memoria. El modelo tiene aproximadamente 9,2 mil millones de parámetros y se distribuye bajo licencia Apache 2.0, lo que permite su uso comercial sin restricciones significativas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basado en Qwen3.5-9B) |
| Parametros totales | 9.197.093.888 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16, mmproj-Q8_0, mmproj-f16 |
| Idiomas soportados | tailandés (th), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo base, CMKL/MANGO1.5-Qwen3.5-9B, se construye sobre la arquitectura de Qwen3.5-9B, un transformer denso de aproximadamente 9,2 mil millones de parámetros. La información disponible indica que se aplicó un ajuste fino supervisado (SFT) con LoRA, orientado a mejorar el rendimiento en tailandés y a mantener la capacidad en inglés. No se han publicado detalles sobre la cantidad de tokens de entrenamiento, la composición del dataset ni el uso de técnicas como RLHF o DPO.

La cuantización GGUF realizada por mradermacher es una conversión estática de los pesos originales a formato GGUF, sin modificaciones en la arquitectura. Se incluyen además dos ficheros `mmproj` (proyector multimodal) en Q8_0 y f16, que sugieren que el modelo base podría tener capacidades de procesamiento de imágenes, aunque no se documenta el detalle en esta ficha.

## Capacidades

- Generación de texto bilingüe en tailandés e inglés, con especial atención al tailandés por el ajuste específico.
- Conversación multi-turno, adecuada para aplicaciones de chat.
- Soporte multimodal potencial: la presencia de ficheros `mmproj` indica que el modelo puede procesar imágenes, aunque no se especifica el detalle de las capacidades.
- Sin información sobre tool calling, function calling, razonamiento multi-step o modo de pensamiento extendido.

## Casos de uso

- Atención al cliente automatizada en tailandés: el modelo puede gestionar conversaciones de soporte en tailandés, reduciendo la necesidad de personal humano para consultas frecuentes.
- Traducción automática tailandés-inglés: útil en contextos de localización de contenido, soporte técnico o documentación bilingüe.
- Generación de contenido editorial en tailandés: permite redactar artículos, noticias o descripciones de producto con fluidez en el idioma.
- Asistente de escritura para hablantes de tailandés: ofrece corrección gramatical, sugerencias de estilo y generación de texto en tiempo real.
- Procesamiento de documentos legales o administrativos en tailandés: extracción de información, resumen y clasificación de textos extensos.
- Herramientas educativas para aprendizaje del tailandés: generación de ejercicios, explicaciones y ejemplos en contexto bilingüe.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card de la cuantización no incluye métricas de rendimiento como MMLU, HumanEval o GSM8K, y tampoco se encontraron datos de evaluación del modelo base en los resultados de búsqueda.

## Requisitos de hardware

- VRAM estimada para inferencia según cuantización:
  - Q2_K: aproximadamente 4 GB
  - Q4_K_S / Q4_K_M: 5,6-5,9 GB
  - Q5_K_M: 6,7 GB
  - Q6_K: 7,7 GB
  - Q8_0: 9,9 GB
  - f16: 18,5 GB
- GPU recomendadas: para cuantizaciones Q4 y Q5, una GPU con 6-8 GB de VRAM (RTX 3060, RTX 4060, GTX 1080 Ti) es suficiente. Para Q8_0 o f16, se recomienda una GPU con 12-24 GB (RTX 3090, RTX 4090, A100).
- Si cabe en GPU de consumo: sí, con cuantizaciones Q4_K_M o inferiores en GPUs de gama media.
- Opciones de despliegue: llama.cpp, Ollama, vLLM (con adaptación GGUF), TGI (Text Generation Inference).
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No se dispone de una comparativa directa con otros modelos bilingües tailandés-inglés en la información proporcionada. El modelo comparte base con Qwen3.5-9B, por lo que se puede considerar como una variante especializada del mismo, pero no se conocen datos de rendimiento comparativo frente a otras alternativas como SeaLLM o modelos multilingües genéricos.

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan sesgos específicos, pero el modelo hereda los sesgos del modelo base Qwen3.5, que pueden manifestarse en el tailandés por el ajuste limitado.
- Riesgo de alucinación: es especialmente relevante en tailandés, donde los datos de entrenamiento pueden ser más limitados que en inglés.
- Limitaciones de contexto: la longitud de contexto no se ha publicado, por lo que no se puede garantizar el manejo de documentos largos.
- Restricciones de licencia: Apache 2.0 permite uso comercial sin restricciones, pero se recomienda revisar la licencia del modelo base Qwen3.5 (Apache 2.0) para confirmar la compatibilidad.
- Caveat de cuantización: las cuantizaciones de menor calidad (Q2_K, Q3_K) pueden degradar la fluidez y la precisión en tailandés; se recomienda usar Q4_K_M o superior para aplicaciones en producción.

## Enlaces

- Repositorio de la cuantización: https://huggingface.co/mradermacher/MANGO1.5-Qwen3.5-9B-GGUF
- Modelo base: https://huggingface.co/CMKL/MANGO1.5-Qwen3.5-9B
- Versión imatrix de la cuantización: https://huggingface.co/mradermacher/MANGO1.5-Qwen3.5-9B-i1-GGUF
- Solicitudes de modelos de mradermacher: https://huggingface.co/mradermacher/model_requests
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.5-9B/blob/main/LICENSE
