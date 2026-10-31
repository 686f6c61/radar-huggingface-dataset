# mradermacher/flint-roleplay-antislop-heretic-i1-GGUF

## Resumen

flint-roleplay-antislop-heretic-i1-GGUF es una colección de cuantizaciones GGUF con imatrix (matriz de importancia) del modelo AlexWortega/flint-roleplay-antislop-heretic, publicada por mradermacher, un cuantizador muy activo de la comunidad de Hugging Face. El modelo base es un modelo de roleplay y escritura creativa con enfoque "antislop" (entrenado con aprendizaje por refuerzo para reducir el lenguaje repetitivo y cliché típico de los LLM), de tipo MoE, sin censura y con técnicas de abliteración/decensura aplicadas.

Este repositorio no es un modelo nuevo, sino la distribución cuantizada pensada para inferencia local con llama.cpp y herramientas compatibles. Ofrece 22 variantes de cuantización, desde IQ1_S (8,3 GB) hasta Q6_K (32,8 GB), lo que permite ejecutar el modelo en un amplio rango de hardware, desde GPUs de consumo hasta estaciones de trabajo con más VRAM. El modelo original pesa unos 39,79 mil millones de parámetros en bf16 (safetensors), y el repo completo de cuantizaciones ocupa 421,4 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (mixture of experts), basada en transformers |
| Parametros totales | 39.785.287.456 (~39,79 B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, Q2_K_S, Q2_K, IQ3_XXS, IQ3_XS, Q3_K_S, IQ3_S, IQ3_M, Q3_K_M, Q3_K_L, IQ4_XS, Q4_0, Q4_K_S, Q4_K_M, Q4_1, Q5_K_S, Q5_K_M, Q6_K (todas con imatrix) |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizado a partir de safetensors bf16) |

## Arquitectura y entrenamiento

El modelo base, AlexWortega/flint-roleplay-antislop-heretic, es un modelo MoE etiquetado con técnicas de "antislop - reinforcement-learning", lo que sugiere un entrenamiento post-LSM con aprendizaje por refuerzo orientado a penalizar el "slop": frases hechas, metáforas gastadas y patrones estilísticos repetitivos habituales en la salida de los modelos generativos. Las etiquetas "uncensored", "decensored" y "abliterated" indican que se han aplicado técnicas de abliteración (eliminación de direcciones de rechazo en el espacio de activaciones) para reducir los comportamientos de negativa del modelo original.

Sobre los detalles concretos de entrenamiento (número de tokens, composición del dataset, uso de RLHF/DPO, modelo del que parte el MoE, número de expertos activos), la model card no aporta información. La versión de mradermacher se limita a la conversión: se calculó una matriz de importancia (imatrix) sobre el modelo en bf16 y se generaron cuantizaciones ponderadas con ella, lo que habitualmente preserva mejor la calidad que las cuantizaciones estáticas a igual tamaño de archivo. También existe una versión de cuantizaciones estáticas en mradermacher/flint-roleplay-antislop-heretic-GGUF.

## Capacidades

- Generación de texto creativo y escritura de ficción, con foco en estilos menos repetitivos gracias al enfoque antislop.
- Roleplay conversacional multi-turno, marcado como "conversational" en el pipeline.
- Comportamiento sin censura: el modelo abliterado/decensurado tiende a no rechazar peticiones sensibles, lo que amplía el rango de contenido generado en contextos de ficción.
- Ejecución local eficiente: al ser GGUF con imatrix, funciona en llama.cpp y derivados (Ollama, LM Studio, koboldcpp) con aceleración CPU+GPU.
- No hay indicios en la información disponible de soporte de visión, audio, tool calling ni modos de razonamiento explícitos.

## Casos de uso

- Roleplay interactivo local: ejecutar personajes conversacionales en koboldcpp o SillyTavern con contexto multi-turno, aprovechando el ajuste específico para roleplay y la ausencia de negativas.
- Escritura de ficción asistida: redacción de narrativa larga con un modelo afinado para evitar clichés lingüísticos, útil para autores que iteran borradores sin depender de APIs de pago.
- Generación de contenido creativo sin filtros: producción de guiones, diálogos o escenas con contenido maduro en entornos controlados donde el rechazo del modelo sería un obstáculo.
- Pruebas de calidad de cuantización: la amplia gama de quants (IQ1_S a Q6_K) lo hace idóneo para evaluar la degradación de calidad en cuantizaciones extremas sobre un modelo MoE de ~40 B.
- Servidor de inferencia en hardware de consumo: con la variante IQ4_XS (21,4 GB) cabe en una RTX 3090/4090 de 24 GB para inferencia totalmente en GPU.
- Investigación en des censura y abliteración: como modelo abliterated documentado públicamente, sirve de base para estudiar el impacto de estas técnicas en la coherencia y seguridad del modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al tratarse de un modelo de roleplay y escritura creativa abliterado, es probable que el rendimiento en benchmarks académicos estándar (MMLU, HumanEval, GSM8K) no sea el foco del autor; no obstante, no hay datos ni en la model card del cuantizador ni en la del modelo base incluida en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia según cuant (tamaño del archivo + overhead de contexto, aproximadamente 1-2 GB extra):
  - IQ1_S: 8,3 GB — cabe en GPUs de 12 GB (RTX 3060 12 GB, RTX 4070).
  - IQ2_M: 13,2 GB — GPUs de 16 GB (RTX 4060 Ti 16 GB, RTX 4080).
  - IQ3_M: 17,6 GB — GPUs de 20-24 GB.
  - IQ4_XS: 21,4 GB y Q4_K_M: 24,3 GB — RTX 3090/4090 (24 GB); Q4_K_M justo en el límite.
  - Q6_K: 32,8 GB — RTX 5090 (32 GB), A100 40 GB o descarga parcial a CPU/RAM.
- GPU recomendadas: RTX 3060 12 GB (quants bajos), RTX 4060 Ti 16 GB, RTX 4080/4090 (rango medio-alto), RTX 5090, A100/H100 para la mejor calidad sin descarga.
- Consumer GPUs: sí, desde 12 GB de VRAM con quants IQ1/IQ2, con calidad degradada; el punto dulce según el autor es Q4_K_S (22,8 GB, "optimal size/speed/quality") en una 24 GB.
- Despliegue: llama.cpp (formato nativo), Ollama, LM Studio, koboldcpp, text-generation-webui; también compatible con backends que soporten GGUF como vLLM (soporte experimental de GGUF).
- Alternativa: para sistemas con mucha RAM y poca GPU, usar quants IQ2/IQ3 con offload parcial de capas a CPU; la velocidad será limitada por el ancho de banda de memoria al ser un modelo de ~40 B.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | Licencia | Formato | Foco |
|---|---|---|---|---|---|
| flint-roleplay-antislop-heretic (este) | ~39,79 B (total) | MoE, roleplay, antislop, abliterated | Apache 2.0 | GGUF (imatrix), safetensors bf16 | Roleplay y escritura creativa sin censura |
| Mistral Small 3.x (24 B) | 24 B | Dense, uso general | Apache 2.0 | safetensors, GGUF comunitario | Uso general, roleplay mediante fine-tunes |
| Qwen3-30B-A3B | 30 B (3 B activos) | MoE, uso general | Apache 2.0 | safetensors, GGUF comunitario | Uso general eficiente, razonamiento |

Comparado con alternativas densas de tamaño similar, este modelo destaca por el ajuste específico en roleplay y la abliteración, a costa de carecer de benchmarks públicos y de documentación detallada. Frente a MoE de uso general como Qwen3-30B-A3B, ofrece un perfil de generación creativa más especializado, aunque con parámetros activos y rendimiento de inferencia no documentados en la información disponible.

## Limitaciones y advertencias

- Modelo abliterated/uncensored: elimina salvaguardas de seguridad. Su uso conlleva riesgos legales y éticos; no debe desplegarse en producción expuesta a usuarios finales sin controles adicionales.
- Sesgos: no hay documentación de auditoría de sesgos; hereda los sesgos del modelo base y de sus datos de entrenamiento, que no están descritos en la model card.
- Alucinaciones: al ser un modelo de escritura creativa sin filtros y sin datos de evaluación, el riesgo de alucinación factual es alto; no es adecuado para tareas que exijan exactitud factual sin verificación.
- Idioma: entrenado/etiquetado solo para inglés; el rendimiento en castellano no está documentado y probablemente sea inferior.
- Cuantizaciones extremas (IQ1_S, IQ1_M, IQ2_XXS): el propio autor las marca como "para desesperados", con degradación sustancial de calidad; evitar salvo restricciones severas de memoria.
- Longitud de contexto, parámetros activos del MoE y plantilla de chat: no documentados en la información disponible; verificar empíricamente antes de uso serio.
- Licencia: Apache 2.0 permite uso comercial, pero la procedencia del modelo base y las técnicas de abliteración aplicadas deben revisarse caso por caso si se planea un producto comercial.
- Es un repo de terceros cuantizador: cualquier bug de conversión sería responsabilidad del cuantizador, no del autor del modelo base.

## Enlaces

- Repositorio cuantizado (esta ficha): https://huggingface.co/mradermacher/flint-roleplay-antislop-heretic-i1-GGUF
- Modelo base: https://huggingface.co/AlexWortega/flint-roleplay-antislop-heretic
- Cuantizaciones estáticas del mismo modelo: https://huggingface.co/mradermacher/flint-roleplay-antislop-heretic-GGUF
- Página de descargas con vista general: https://hf.tst.eu/model#flint-roleplay-antislop-heretic-i1-GGUF
- README de referencia sobre uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
