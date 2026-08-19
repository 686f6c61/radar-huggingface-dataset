# Flashtond22/Taltos-27B-GGUF

## Resumen

Taltos-27B es un modelo de lenguaje ajustado específicamente para el húngaro, desarrollado por Flashtond22 a partir del modelo base Qwen3.8-27B. El nombre «Táltos» hace referencia al chamán de la mitología húngara, y el modelo está orientado a producir texto natural en húngaro con razonamiento y respuestas bien estructuradas. Se distribuye en formato GGUF para su uso en entornos locales como Ollama, llama.cpp, LM Studio, Jan o KoboldCpp, tanto en CPU como en GPU.

El modelo tiene aproximadamente 27 300 millones de parámetros y está disponible en varias cuantizaciones que van desde Q2_K hasta Q8_0, con tamaños de archivo entre 10 y 29 GB. Según la model card, en una evaluación comparativa con su modelo base sobre 55 tareas en húngaro, Taltos-27B resultó mejor en el 55,5 % de los casos según un juez independiente. La licencia es Apache 2.0, lo que permite uso comercial y modificación libre.

Este lanzamiento es relevante porque cubre una necesidad concreta: disponer de un modelo de alta calidad para húngaro que pueda ejecutarse en hardware doméstico, con opciones de cuantización adaptadas a distintos niveles de VRAM y compatibilidad con las herramientas de inferencia más extendidas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Basado en Qwen3.8-27B (transformer, detalles internos no disponibles) |
| Parametros totales | 27 320 697 856 (27,3 mil millones) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (el Modelfile de ejemplo usa 16 384 tokens) |
| Tipos de cuantizacion | Q2_K, Q3_K_M, Q4_K_M, Q5_K_M, Q6_K, Q8_0 |
| Idiomas soportados | Húngaro (hu), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

Taltos-27B es un fine-tuning del modelo Qwen3.8-27B, también licenciado bajo Apache 2.0. No se han publicado detalles sobre el proceso de entrenamiento, como el número de tokens utilizados, la composición del dataset o si se emplearon técnicas de RLHF o DPO. La model card únicamente indica que el modelo está «ajustado para húngaro» y que su fortaleza reside en la redacción natural, el razonamiento en húngaro y la generación de respuestas concisas y bien estructuradas.

La versión GGUF que nos ocupa es una cuantización del modelo original en bf16 (Flashtond22/Taltos-27B). Existe también una versión FP8 para vLLM. No se mencionan innovaciones técnicas específicas en la arquitectura, más allá de las heredadas del modelo base.

## Capacidades

- Generación de texto en húngaro con especial atención a la corrección gramatical, orden de palabras y conjugación.
- Razonamiento y resolución de problemas expresados en húngaro, incluyendo tareas matemáticas y de lógica.
- Respuestas estructuradas y concisas, orientadas a conversación y redacción de contenido.
- Soporte bilingüe húngaro-inglés, con predominio del húngaro como idioma principal.
- Compatible con herramientas de inferencia local como Ollama, llama.cpp, LM Studio, Jan y KoboldCpp.
- No se ha documentado soporte para tool calling, agentes, visión o audio en la información disponible.

## Casos de uso

- Atención al cliente en húngaro: el modelo puede gestionar conversaciones multi-turno en húngaro con un tono natural y preciso, adecuado para chatbots de soporte en empresas que operan en Hungría.
- Generación de contenido editorial: redacción de artículos, descripciones de productos o publicaciones en redes sociales en húngaro, manteniendo un estilo coherente y sin errores gramaticales.
- Traducción asistida húngaro-inglés: aunque no es un traductor dedicado, puede utilizarse para revisar o reformular traducciones, aprovechando su dominio de ambos idiomas.
- Asistente de estudio para estudiantes de húngaro: explicaciones, resúmenes y generación de ejercicios en húngaro para fines educativos.
- Automatización de informes internos: generación de resúmenes de reuniones, actas o documentación técnica en húngaro, reduciendo el trabajo manual.
- Desarrollo de aplicaciones de escritura creativa: cuentos, poemas o guiones en húngaro, con control del estilo y la estructura narrativa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandarizados (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La única métrica mencionada es una evaluación comparativa frente al modelo base Qwen3.8-27B sobre 55 tareas en húngaro, donde Taltos-27B fue considerado mejor por un juez independiente en el 55,5 % de los casos. No se proporcionan detalles sobre la metodología ni los resultados desglosados.

## Requisitos de hardware

- Q2_K: 10 GB de archivo, ~12 GB de VRAM estimada. Adecuado para GPUs de gama baja o inferencia solo CPU.
- Q3_K_M: 13 GB de archivo, ~15 GB de VRAM estimada. Calidad reducida en tareas de razonamiento largo.
- Q4_K_M: 17 GB de archivo, ~19 GB de VRAM estimada. Recomendado como mejor equilibrio calidad/recursos.
- Q5_K_M: 20 GB de archivo, ~22 GB de VRAM estimada. Cabe en GPUs de 24 GB.
- Q6_K: 23 GB de archivo, ~25 GB de VRAM estimada. Calidad casi indistinguible del original.
- Q8_0: 29 GB de archivo, ~31 GB de VRAM estimada. Requiere GPUs profesionales (A6000, A100, etc.).

El modelo puede ejecutarse en CPU con llama.cpp o llama-server, aunque con mayor latencia. Las opciones de despliegue incluyen Ollama, llama.cpp, LM Studio, Jan y KoboldCpp. No se han publicado datos de latencia o throughput.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Observaciones |
|---|---|---|---|---|---|
| Taltos-27B (GGUF) | 27,3 B | no disponible | Apache 2.0 | GGUF | Ajustado para húngaro, basado en Qwen3.8-27B |
| Qwen3.8-27B (base) | 27,3 B | no disponible | Apache 2.0 | safetensors | Modelo base multilingüe, sin ajuste específico para húngaro |
| Taltos-27B (bf16) | 27,3 B | no disponible | Apache 2.0 | safetensors | Versión original en bf16, para servidores y fine-tuning adicional |

No se dispone de información sobre otros modelos comparables en la misma categoría (por ejemplo, otros LLM ajustados para húngaro) en la documentación proporcionada.

## Limitaciones y advertencias

- En cuantizaciones bajas (Q3_K_M y especialmente Q2_K), la calidad de las respuestas se degrada notablemente: los razonamientos matemáticos largos pueden fallar y la precisión factual disminuye. Se recomienda no usar Q2_K para tareas que requieran fiabilidad.
- El modelo está optimizado para húngaro e inglés; su rendimiento en otros idiomas no está garantizado.
- No se ha documentado el contexto máximo real del modelo. El ejemplo de configuración usa 16 384 tokens, pero podría ser mayor o menor.
- Riesgo de alucinación, especialmente en cuantizaciones bajas. La model card advierte que en Q2_K no se debe confiar en las respuestas sin verificación.
- Aunque la licencia Apache 2.0 permite uso comercial, el modelo base Qwen3.8-27B también es Apache 2.0, por lo que no hay restricciones conocidas de uso.
- No se proporcionan datos sobre sesgos, aunque al ser un fine-tuning de un modelo multilingüe, puede heredar sesgos del modelo base.

## Enlaces

- Repositorio GGUF: https://huggingface.co/Flashtond22/Taltos-27B-GGUF
- Modelo base (bf16): https://huggingface.co/Flashtond22/Taltos-27B
- Versión FP8: https://huggingface.co/Flashtond22/Taltos-27B-FP8
- Modelo base original: https://huggingface.co/Qwen/Qwen3.8-27B
