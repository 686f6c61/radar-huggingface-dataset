# cognitivers/Qwen3.8-27B-OBLITERATED-quantlab-IQ2XS-GGUF

## Resumen
El repositorio `cognitivers/Qwen3.8-27B-OBLITERATED-quantlab-IQ2XS-GGUF` ofrece una cuantización extrema (IQ2_XS, aproximadamente 2,1 bits por peso) en formato GGUF del modelo `OBLITERATUS/Qwen3.8-27B-OBLITERATED`, una variante "abliterada" del Qwen3.8-27B de Alibaba. El sufijo "OBLITERATED" indica que se ha eliminado el comportamiento de rechazo o negativa del modelo original, lo que permite una generación sin filtros, aunque con los riesgos asociados a la eliminación de alineación de seguridad.

El modelo base Qwen3.8-27B es un modelo denso de 27 mil millones de parámetros con una arquitectura híbrida de atención: solo 16 de sus 64 capas utilizan atención completa (con un intervalo de 4), mientras que las otras 48 emplean atención lineal con un estado recurrente constante (Gated-DeltaNet). La cuantización a IQ2_XS reduce drásticamente los requisitos de VRAM, permitiendo ejecutar un modelo de 27B en GPUs de consumo con 8-12 GB de memoria, aunque con una degradación significativa de la calidad de salida. Es relevante para experimentos de cuantización extrema y despliegues locales con hardware limitado, pero no se recomienda para tareas críticas.

## Especificaciones técnicas
| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: atención completa (16 capas) + atención lineal con estado recurrente (48 capas) |
| Parametros totales | 27 mil millones (27B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible en la información proporcionada (depende del modelo base) |
| Tipos de cuantizacion | IQ2_XS (2 bits aproximados) |
| Idiomas soportados | Inglés y chino (según tags del repositorio) |
| Licencia | Apache 2.0 (según tags del repositorio; el metadato no lo especifica) |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento
El modelo base Qwen3.8-27B, desarrollado por Alibaba, presenta una arquitectura híbrida de atención. Según la documentación de vLLM, de sus 64 capas solo 16 utilizan atención completa (con un intervalo de `full_attention_interval: 4`), mientras que las otras 48 implementan atención lineal con un estado recurrente constante, lo que reduce el coste computacional en secuencias largas. Esta arquitectura es la misma que la del modelo MoE insignia de 2,4T de la familia Qwen3.8.

El proceso de entrenamiento del modelo base no se detalla en la información proporcionada. Sin embargo, la variante `OBLITERATUS/Qwen3.8-27B-OBLITERATED` se obtiene mediante una técnica de abliteración (abliteration) que modifica los pesos para eliminar las respuestas de rechazo y los sesgos de seguridad del modelo original. Finalmente, el autor `cognitivists` ha aplicado una cuantización agresiva IQ2_XS utilizando el conjunto de herramientas `quantlab`, que incluye el uso de `imatrix` para optimizar la cuantización. No se especifican los datos de entrenamiento ni el número de tokens utilizados.

## Capacidades
- Generación de texto libre y conversacional en inglés y chino.
- Razonamiento y generación de código (capacidades heredadas del modelo base, aunque degradadas por la cuantización extrema).
- Soporte de tool calling y function calling (potencialmente heredado del modelo base, aunque no está confirmado explícitamente en la información proporcionada).
- Capacidad de ejecución en entornos con memoria muy limitada gracias a la cuantización de 2 bits.
- Debido a la abliteración, el modelo no rechaza solicitudes que normalmente serían bloqueadas por políticas de seguridad.
- Soporte para endpoints compatibles y uso conversacional (según los tags del repositorio).

## Casos de uso
- Prototipado local en hardware limitado: permite ejecutar un modelo de 27B en una GPU con 8-10 GB de VRAM, lo que facilita la experimentación y el desarrollo de aplicaciones de chat sin necesidad de infraestructura cloud.
- Aplicaciones de chat offline: integración en aplicaciones de escritorio o móviles donde la privacidad es prioritaria y se dispone de una GPU de gama media (por ejemplo, RTX 3060 12GB).
- Investigación sobre cuantización extrema: útil para estudiar el impacto de la cuantización de 2 bits en la calidad de generación y la degradación de métricas, ya que se compara fácilmente con las versiones Q4_K_M o FP16.
- Pruebas de alineación y seguridad: al ser una versión "abliterated", es útil para investigar el comportamiento de los modelos sin barreras de rechazo, siempre en entornos controlados de investigación.
- Generación de texto en chino e inglés con baja huella de memoria: adecuado para sistemas embebidos o dispositivos edge con restricciones de RAM.
- Experimentación con GGUF y llama.cpp: para desarrolladores que deseen probar la compatibilidad de cuantizaciones extremas con diferentes backends de inferencia (llama.cpp, Ollama, LM Studio).

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. Dado que se trata de una cuantización extrema (IQ2_XS), se espera una degradación notable en tareas de razonamiento, matemáticas y generación de código en comparación con las versiones Q4_K_M o FP16 del mismo modelo. No se debe asumir un rendimiento comparable al del modelo base sin verificar empíricamente.

## Requisitos de hardware
- VRAM estimada: el tamaño del archivo para IQ2_XS de 27B es aproximadamente 7,1 GB (cálculo: 27B * 2,1 bits / 8). Con la cache KV adicional, se recomienda un mínimo de 8-10 GB de VRAM.
- GPU recomendadas: RTX 3060 12GB, RTX 4060 Ti 16GB, RTX 3080 10GB, o cualquier GPU con al menos 8 GB de VRAM. También puede ejecutarse en CPU con suficiente RAM (16-32 GB).
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, llama-cpp-python. También es compatible con vLLM (si se convierte a formato adecuado, aunque GGUF es nativo de llama.cpp).
- Latencia y rendimiento: no disponible. La cuantización de 2 bits reduce el tamaño del modelo, lo que suele aumentar la velocidad de inferencia en memoria, pero la calidad del output se ve comprometida.

## Comparativa con modelos similares
| Modelo | Parametros | Cuantizacion | VRAM estimada | Contexto | Licencia |
|---|---|---|---|---|---|
| Qwen3.8-27B (original, FP16) | 27B | FP16 | ~54 GB | No disponible | Apache 2.0 |
| Qwen3.8-27B (GGUF Q4_K_M) | 27B | Q4_K_M | ~17,1 GB | No disponible | Apache 2.0 |
| Qwen3.8-27B (OBLITERATED, IQ2_XS) | 27B | IQ2_XS | ~7,1 GB | No disponible | Apache 2.0 |
| Llama 3.1 8B (Q4_K_M) | 8B | Q4_K_M | ~5 GB | No disponible | Meta Llama 3.1 |

La comparativa muestra que esta cuantización permite ejecutar un modelo de 27B en el mismo rango de VRAM que un modelo de 8B en Q4, pero con una pérdida de calidad significativa. No se dispone de benchmarks para comparar el rendimiento real.

## Limitaciones y advertencias
- Degradación severa de la calidad: la cuantización IQ2_XS (2 bits) reduce drásticamente la coherencia, el razonamiento y la capacidad de seguir instrucciones en comparación con el modelo original.
- Alucinaciones frecuentes: la cuantización extrema incrementa la probabilidad de generar contenido inventado o incorrecto.
- Contenido sin filtros: al ser una variante "abliterated", el modelo no tiene las barreras de seguridad estándar, por lo que puede generar contenido dañino, ilegal o inapropiado sin rechazo.
- Limitaciones de idioma: el modelo está optimizado para inglés y chino; su rendimiento en otros idiomas, incluido el español, es limitado y puede degradarse aún más con la cuantización.
- Licencia: aunque el tag indica Apache 2.0, el metadato del repositorio no especifica la licencia, por lo que se debe revisar el repositorio base (`OBLITERATUS/Qwen3.8-27B-OBLITERATED`) para confirmar la licencia exacta antes de usarlo en producción.
- Contexto limitado: no se proporciona la longitud de contexto exacta, y la cuantización de 2 bits puede hacer que la memoria para la KV cache sea insuficiente para ventanas largas.

## Enlaces
- Repositorio del modelo cuantizado: https://huggingface.co/cognitivists/Qwen3.8-27B-OBLITERATED-quantlab-IQ2XS-GGUF
- Modelo base Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- Versión GGUF de Unsloth: https://huggingface.co/unsloth/Qwen3.8-27B-GGUF
- Guía de cuantizaciones GGUF para Qwen3.8-27B: https://www.orcarouter.ai/blog/qwen-3-8-27b-gguf
- Recetas vLLM para Qwen3.8-27B: https://recipes.vllm.ai/Qwen/Qwen3.8-27B
- Guía local para Qwen3.8-27B (Substack): https://linas.substack.com/p/qwen3-8-27b-local-guide
