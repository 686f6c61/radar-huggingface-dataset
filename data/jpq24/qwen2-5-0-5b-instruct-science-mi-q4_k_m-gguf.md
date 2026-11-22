# JPQ24/Qwen2.5-0.5B-Instruct-Science-MI-Q4_K_M-GGUF

## Resumen
Este repositorio contiene una variante cuantizada en formato GGUF de Qwen2.5-0.5B-Instruct, el modelo de lenguaje conversacional de 494 millones de parámetros desarrollado por Alibaba Qwen. La particularidad del artefacto no es el modelo base, sino el procedimiento de cuantización aplicado por el autor (JPQ24): en lugar de un Q4_K_M estándar de llama.cpp, se ha realizado una selección de neuronas guiada por información mutua calculada en tiempo de inferencia, preservando en FP16 los circuitos que más contribuyen a la calidad de generación en tareas de ciencia en inglés y cuantizando de forma selectiva el resto dentro de un presupuesto de perplejidad.

El resultado es un fichero de 379,38 MB que, según la model card, mejora el rendimiento del Qwen2.5-0.5B-Instruct original en tareas de ciencia (ARC-Challenge: 45/100 frente a 33/100 del FP16 y 30/100 del Q4_K_M vanilla) a costa de degradar otras capacidades no calibradas, como la traducción al español, Winogrande o HellaSwag. Es un experimento metodológico de cuantización consciente de la tarea, no un modelo nuevo entrenado desde cero.

Su relevancia es doble: por un lado, demuestra que la cuantización selectiva por información mutua puede superar al FP16 en un dominio estrecho con un modelo de 0,5B; por otro, ilustra el coste de esa especialización, con deriva en tareas fuera de dominio. El modelo base subyacente es un transformer decoder-only de Qwen2.5 con 494.032.768 parámetros reales y ventana de contexto de 32.768 tokens (según la especificación oficial de Qwen2.5-0.5B-Instruct).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5), cuantización selectiva por información mutua sobre Q4_K_M |
| Parametros totales | 494.032.768 (modelo base); fichero GGUF de 379,38 MB |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens (heredada de Qwen2.5-0.5B-Instruct; no verificada en la model card) |
| Tipos de cuantizacion | Q4_K_M con subsecciones selectivas en FP16 (4/8 clústeres de mayor MI) y 33/48 subsecciones no activadas en 4 bits |
| Idiomas soportados | en (declarado); deriva documentada en español |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (Q4_K_M); safetensors FP16 intermedio usado para la exportación |

## Arquitectura y entrenamiento
El modelo subyacente es Qwen2.5-0.5B-Instruct, un transformer decoder-only denso de 494 millones de parámetros con atención de múltiples cabezas, RoPE y normalización RMSNorm, entrenado por Alibaba Qwen con datos multilingües y ajustado por instrucciones (SFT y preferencias) según la ficha oficial del modelo base. La model card de este repositorio no detalla la composición del dataset de preentrenamiento ni los volúmenes de tokens, por lo que esos datos deben consultarse en la ficha de Qwen.

La innovación de esta variante es puramente de cuantización. El autor engancha (hook) las 168 capas lineales durante la generación de respuestas verificadas de ciencia y calcula la información mutua de Shannon exacta entre el estado de disparo de cada neurona y la calidad/confianza de la generación. Después agrupa globalmente las 304.128 neuronas (sin cuotas por capa), conserva en FP16 los 4 de los 8 clústeres de mayor MI y cuantiza selectivamente a 4 bits 33 de las 48 subsecciones no activadas, todo ello sujeto a un presupuesto de perplejidad acumulada del +10 % ("Cumulative Perplexity Guard"). Finalmente reconstruye un checkpoint safetensors en float16 y lo cuantiza con llama.cpp (build b12613) a Q4_K_M. No hay entrenamiento adicional, RLHF ni DPO en esta variante.

## Capacidades
- Generación de texto conversacional multi-turno en inglés, heredada de Qwen2.5-0.5B-Instruct.
- Razonamiento científico en inglés reforzado por la cuantización selectiva (mejora documentada en ARC-Challenge y en un set propio de 10 preguntas de ciencia).
- Razonamiento estructurado: la model card indica que las capacidades de código (Python) y JSON permanecen intactas tras la cuantización.
- Resumen de texto: preservado según la nota de distorsión dirigida del autor.
- Soporte de tool calling / function calling: no documentado en esta variante; debe verificarse contra el modelo base.
- Capacidades de agente y razonamiento multi-paso: no documentadas específicamente para esta variante.
- Multilingüismo: limitado; el autor documenta deriva explícita en español ("Spanish drifted"), por lo que no se recomienda su uso fuera del inglés.
- Capacidades especiales (visión, audio, thinking mode): no disponibles en este modelo.

## Casos de uso
- Responder preguntas de ciencia en inglés en entornos educativos o de divulgación: el modelo muestra 9/10 en el set propio de ciencia y 45/100 en ARC-Challenge, por encima del Qwen2.5-0.5B-Instruct FP16 (33/100), lo que lo hace útil para prototipos de tutoría científica de bajo coste.
- Despliegue en dispositivos con recursos muy limitados (Raspberry Pi, móviles, portátiles sin GPU): el fichero de 379,38 MB cabe en menos de 1 GB de RAM y se ejecuta con llama.cpp u Ollama sin acelerador dedicado.
- Generación de código y JSON en pipelines ligeros: la model card confirma que estas capacidades se mantienen intactas, por lo que puede usarse para extracción estructurada o generación de snippets en inglés.
- Resumen de documentos técnicos en inglés: el autor documenta que el resumen se preserva tras la cuantización selectiva, lo que permite usarlo en tareas de condensación de texto de bajo coste.
- Evaluación de metodologías de cuantización: sirve como caso de estudio reproducible para investigadores que quieran comparar cuantización consciente de la tarea frente a Q4_K_M estándar en modelos pequeños.
- Pruebas de regresión de pipelines de inferencia: al estar en formato GGUF y ser compatible con endpoints, puede integrarse como modelo de smoke-test en CI para validar despliegues de llama.cpp u Ollama.
- Chat conversacional en inglés embebido en aplicaciones de escritorio: su tamaño reducido y licencia Apache-2.0 permiten distribuirlo dentro de binarios sin restricciones de uso comercial.

## Benchmarks y rendimiento

| Benchmark | Base FP16 | Q4_K_M vanilla (Qwen) | Science-MI Q4_K_M (este modelo) |
|---|---|---|---|
| Science QA (10 preguntas) | 8/10 | no disponible | 9/10 |
| tinyAI2_arc (ARC-Challenge, 100 preguntas) | 33/100 (33,0 %) | 30/100 (30,0 %) | 45/100 (45,0 %) |
| tinyWinogrande (100 preguntas) | 51/100 | no disponible | 49/100 |
| tinyHellaswag (100 preguntas) | 24/100 | no disponible | 23/100 |
| Out-of-Domain Sanity (10 tareas) | 8/10 | no disponible | 8/10 (código/JSON intactos; español con deriva) |

Los datos proceden exclusivamente de la model card del autor. No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware
- VRAM estimada para inferencia: menos de 1 GB en Q4_K_M (fichero de 379,38 MB más overhead de contexto y KV cache); en FP16 el modelo base ronda 1 GB.
- GPU recomendadas: cualquier GPU consumer con al menos 2 GB de VRAM (GTX 1050 Ti, RTX 3050, RTX 4060); también A100/H100 para despliegues por lotes, aunque el modelo está sobredimensionado para ellas.
- Cabe en GPU consumer: sí, en prácticamente cualquier GPU dedicada e incluso en iGPU con memoria compartida.
- Opciones de despliegue: llama.cpp (build b12613 o superior), Ollama (mediante Modelfile con `FROM`), y cualquier runtime compatible con GGUF; el tag `endpoints_compatible` sugiere compatibilidad con endpoints de Hugging Face.
- Latencia y throughput estimados: no disponibles en la información proporcionada; por el tamaño (0,5B) se espera decodificación en decenas de tokens por segundo en CPU moderna y cientos en GPU consumer, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| JPQ24/Qwen2.5-0.5B-Instruct-Science-MI-Q4_K_M-GGUF | 494 M | 32.768 (heredado) | Apache-2.0 | GGUF Q4_K_M | Especializado en ciencia EN; deriva en otros dominios |
| Qwen/Qwen2.5-0.5B-Instruct | 494 M | 32.768 | Apache-2.0 | safetensors | Modelo base oficial, capacidades equilibradas |
| Qwen2.5-0.5B-Instruct Q4_K_M vanilla | 494 M | 32.768 | Apache-2.0 | GGUF Q4_K_M | Cuantización estándar; 30/100 en ARC-Challenge según el autor |
| SmolLM2-360M-Instruct | 360 M | 8.192 | Apache-2.0 | safetensors, GGUF | Alternativa de tamaño similar de Hugging Face; no comparable en benchmarks con los datos disponibles |

La comparación con SmolLM2 se ofrece solo como referencia de categoría (modelo denso pequeño con licencia permisiva); no se dispone de resultados cruzados en los mismos benchmarks dentro de la información proporcionada.

## Limitaciones y advertencias
- Deriva documentada en tareas fuera de dominio: el propio autor indica que la traducción al español, Winogrande y HellaSwag absorben el coste de la cuantización selectiva (Winogrande baja de 51 a 49 y HellaSwag de 24 a 23).
- Idioma: declarado únicamente en inglés; no apto para producción en español u otros idiomas sin validación previa.
- Sesgos: no documentados en la model card; al heredar Qwen2.5-0.5B-Instruct, arrastra los sesgos del modelo base, pero no hay análisis específico.
- Riesgo de alucinación: alto por el tamaño reducido (0,5B) y por la especialización en ciencia, que puede producir respuestas plausibles pero incorrectas fuera del dominio calibrado.
- Contexto: la ventana de 32.768 tokens es la del modelo base; no se ha verificado en esta variante y el rendimiento en contextos largos con Q4_K_M puede degradarse.
- Licencia: Apache-2.0 permite uso comercial, pero el autor no ofrece garantías sobre el rendimiento en dominios no calibrados; conviene evaluar antes de desplegar.
- Madurez: el repositorio tiene 0 descargas y 0 likes, y fue creado y actualizado el mismo día (2026-11-21), por lo que no hay validación comunitaria ni informes independientes.
- Benchmarks limitados: los resultados provienen de sets propios de 10 y 100 preguntas, no de evaluaciones estándar completas; la mejora en ARC-Challenge debe interpretarse con cautela.

## Enlaces
- Hugging Face: https://huggingface.co/JPQ24/Qwen2.5-0.5B-Instruct-Science-MI-Q4_K_M-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- Repositorio llama.cpp: https://github.com/ggml-org/llama.cpp
- Ollama: https://ollama.com
- Paper de referencia sobre cuantización Q4_K_M: no disponible en la información proporcionada
- Blog o demo del autor: no disponible en la información proporcionada
