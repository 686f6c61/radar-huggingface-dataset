# mradermacher/Ornith-1.5-35B-A3B-FULLY-OBLITERATED-i1-GGUF

## Resumen

Ornith-1.5-35B-A3B-FULLY-OBLITERATED-i1-GGUF es una cuantizacion GGUF del modelo Ornith-1.5-35B-A3B, un modelo de lenguaje de tipo Mixture-of-Experts (MoE) desarrollado por la organizacion Ornith AI. Con 35.505 millones de parametros totales y aproximadamente 3.000 millones de parametros activos por token, esta disenado para tareas de razonamiento y generacion de codigo. La variante "FULLY-OBLITERATED" sugiere una version sin restricciones de uso, aunque no se han publicado detalles sobre el proceso de "obliteracion".

La cuantizacion ha sido realizada por mradermacher, un autor conocido por generar pesos GGUF con imatrix (importance matrix) para optimizar la calidad de los quants. El repositorio incluye multiples niveles de cuantizacion (desde Q1 hasta Q6) y esta pensado para su uso con motores de inferencia como llama.cpp, Ollama o vLLM. Aunque la ficha de Hugging Face no proporciona datos sobre licencia, idiomas o contexto, fuentes externas indican que el modelo original se distribuye bajo licencia MIT y que ha obtenido resultados notables en benchmarks de codigo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) |
| Parametros totales | 35.505.251.456 (35,5 B) |
| Parametros activos | ~3 B por token |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, IQ3_M, Q4_K_S, IQ3_XXS, Q3_K_M, small-IQ4_NL, Q4_K_M, IQ2_M, Q6_K, IQ4_XS, Q2_K_S, IQ1_M, Q3_K_S, IQ2_XXS, Q3_K_L, IQ2_XS, Q5_K_S, IQ2_S, IQ1_S, Q5_K_M, Q4_0, IQ3_XS, Q4_1, IQ3_S |
| Idiomas soportados | no disponible |
| Licencia | no disponible (el modelo original parece ser MIT segun fuentes externas) |
| Formato de pesos | GGUF (con imatrix) |

## Arquitectura y entrenamiento

La arquitectura es un MoE (Mixture-of-Experts) que activa aproximadamente 3.000 millones de parametros por token, lo que permite un rendimiento de inferencia relativamente rapido a pesar de tener 35.000 millones de parametros en total. Este diseno reduce el coste computacional por token en comparacion con un modelo denso del mismo tamano, manteniendo una alta capacidad de conocimiento.

Los detalles exactos del entrenamiento no estan disponibles en la informacion proporcionada. Sin embargo, segun el sitio web llm-releases.com, el modelo forma parte de la familia Ornith-1.5 y se entreno con un bucle de auto-mejora que genera tareas y andamiajes (task-and-scaffold generation loop), similar al utilizado en el modelo insignia de 397B. No se han publicado datos sobre el volumen de tokens de entrenamiento, la composicion del dataset ni la aplicacion de tecnicas como RLHF o DPO.

## Capacidades

- Razonamiento complejo: segun fuentes externas, el modelo destaca en tareas de razonamiento logico y matematico, con resultados de 68.5 en Terminal-Bench 2.1 y 79.0 en SWE-Bench Verified (datos reportados por el proveedor).
- Generacion de codigo: esta optimizado para tareas de programacion, incluyendo generacion, completado y depuracion de codigo en multiples lenguajes.
- Procesamiento de lenguaje natural: capacidad generica de generacion de texto, resumen y respuesta a preguntas, aunque no se especifican detalles sobre idiomas soportados.
- Inferencia eficiente: gracias a su arquitectura MoE con solo 3B parametros activos, puede ejecutarse con menor latencia que un modelo denso equivalente.
- Compatibilidad con motores GGUF: al estar en formato GGUF, es compatible con llama.cpp, Ollama, LM Studio y otros motores que soporten este formato.

No se ha confirmado soporte para tool calling, vision, audio ni modos de pensamiento extendido (thinking mode) en la informacion disponible.

## Casos de uso

- Asistente de programacion en entornos de desarrollo: el modelo puede integrarse en editores de codigo (como VS Code o Neovim) mediante plugins que usen llama.cpp u Ollama, ofreciendo autocompletado y sugerencias contextuales. Su capacidad de razonamiento permite sugerencias mas precisas que modelos densos de tamano similar.
- Automatizacion de pruebas y revision de codigo: en pipelines de CI/CD, el modelo puede analizar commits, detectar errores comunes y proponer correcciones, apoyandose en su rendimiento en benchmarks de ingenieria de software como SWE-Bench.
- Resolucion de problemas matematicos y cientificos: gracias a su capacidad de razonamiento, puede utilizarse como herramienta de apoyo en plataformas educativas o de investigacion para resolver ecuaciones, demostraciones o problemas de logica.
- Chatbot de soporte tecnico especializado: al ser un modelo ligero (3B activos), puede desplegarse en servidores con GPUs de gama media para atender consultas tecnicas con contexto moderado, manteniendo respuestas coherentes en conversaciones multi-turno.
- Generacion de documentacion tecnica: puede resumir codigo, generar comentarios y redactar documentacion de APIs, aprovechando su conocimiento de lenguajes de programacion y buenas practicas.
- Prototipado rapido de agentes conversacionales: al ser un modelo GGUF, puede ejecutarse en local con herramientas como Ollama, facilitando la experimentacion con arquitecturas de agentes sin depender de APIs externas.

## Benchmarks y rendimiento

Segun el sitio web llm-releases.com, el modelo original Ornith-1.5-35B-A3B obtuvo los siguientes resultados (datos reportados por el proveedor, promediados sobre cinco ejecuciones):

| Benchmark | Resultado |
|---|---|
| Terminal-Bench 2.1 | 68.5 |
| SWE-Bench Verified | 79.0 |

No se han publicado comparaciones independientes con otros modelos en la informacion disponible. Estos datos deben interpretarse con cautela, ya que no se detalla la metodologia exacta ni el entorno de evaluacion.

## Requisitos de hardware

- VRAM estimada: depende de la cuantizacion elegida. Para cuantizaciones bajas como Q2_K o Q3_K_M, el archivo pesa aproximadamente 12-15 GB, por lo que puede caber en GPUs con 16 GB de VRAM (por ejemplo, RTX 4080, RTX 4090). Para cuantizaciones medias como Q4_K_M, el archivo ronda los 20-22 GB, requiriendo 24 GB de VRAM (RTX 4090, A5000) o mas. Para cuantizaciones altas como Q6_K o Q8_0, se necesitan 28 GB o mas, lo que apunta a GPUs profesionales (A100, H100).
- GPUs recomendadas: RTX 3090, RTX 4090, A100, H100. En GPUs con menos de 16 GB de VRAM, solo se pueden usar cuantizaciones muy bajas (Q1, Q2) con perdida notable de calidad.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui, vLLM (con soporte GGUF) o TGI (si se convierte a otro formato). El repositorio incluye archivos GGUF listos para usar.
- Latencia y throughput: al ser un MoE con solo 3B parametros activos, la latencia por token es significativamente menor que la de un modelo denso de 35B. En una RTX 4090 con cuantizacion Q4_K_M, se puede esperar una velocidad de entre 20 y 40 tokens por segundo, aunque no hay datos oficiales publicados.

## Comparativa con modelos similares

No se dispone de datos comparativos directos con otros modelos en la informacion proporcionada. Sin embargo, se puede contextualizar con otros MoE de tamano similar:

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Benchmark destacado |
|---|---|---|---|---|---|
| Ornith-1.5-35B-A3B | 35,5 B | ~3 B | no disponible | MIT (segun fuentes) | SWE-Bench 79.0 (reportado) |
| Mixtral 8x7B | 46,7 B | ~13 B | 32k | Apache 2.0 | MMLU 70.6 |
| Qwen1.5-MoE-A2.7B | 14,3 B | 2,7 B | 32k | Qianwen License | MMLU 64.4 |

Ornith-1.5-35B-A3B se posiciona como un modelo de tamano medio con una alta proporcion de parametros totales frente a activos, lo que sugiere una buena eficiencia computacional. Sin embargo, falta informacion sobre el contexto maximo soportado y los resultados en benchmarks genericos como MMLU o HumanEval, lo que dificulta una comparacion completa.

## Limitaciones y advertencias

- Informacion incompleta: no se han publicado datos oficiales sobre la licencia, el contexto maximo, los idiomas soportados ni el proceso de "obliteracion". Esto limita la evaluacion de su idoneidad para entornos de produccion.
- Perdida de precision por cuantizacion: al ser una version GGUF, los pesos se han cuantizado, lo que puede degradar ligeramente la calidad de las respuestas en comparacion con el modelo original en float32 o bfloat16. Se recomienda usar cuantizaciones altas (Q5, Q6) si la VRAM lo permite.
- Sesgos y alucinaciones: no se ha publicado informacion sobre sesgos presentes en el modelo. Como ocurre con la mayoria de LLMs, existe riesgo de generar contenido falso o inventado, especialmente en temas de actualidad o nicho.
- Dependencia de fuentes externas: los resultados de benchmarks citados provienen del proveedor y no han sido verificados de forma independiente. Deben tomarse como referencia preliminar.
- Compatibilidad de licencia: aunque fuentes externas indican que el modelo original es MIT, el repositorio GGUF no especifica una licencia clara. Para uso comercial, se recomienda contactar con el autor o consultar el repositorio original.

## Enlaces

- Repositorio Hugging Face del modelo GGUF: https://huggingface.co/mradermacher/Ornith-1.5-35B-A3B-FULLY-OBLITERATED-i1-GGUF
- Repositorio Hugging Face del modelo original (jhone888): https://huggingface.co/jhone888/Ornith-1.5-35B-A3B-FULLY-OBLITERATED
- Ficha en llm-releases.com: https://www.llm-releases.com/models/ornith-1-5-35b-a3b
- Ficha en aimodels.fyi: https://www.aimodels.fyi/models/huggingFace/ornith-1.5-35b-a3b-gguf-ornith-ai
- Archivos del modelo en Benchgen: https://benchgen.com/models/ornith-deepreinforce/ornith-1-5-35b-a3b/files
