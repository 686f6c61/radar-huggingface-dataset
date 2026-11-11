# Bizuayeu/GLM-5.3-Flash-Jammed-XSFP4-NZ5

## Resumen

GLM-5.3-Flash Jammed XSFP4 NZ5 es un checkpoint derivado y cuantizado a 4 bits del modelo nvidia/GLM-5.3-Flash-FP4-Local, publicado por el usuario Bizuayeu en Hugging Face. No es un lanzamiento oficial ni de NVIDIA ni de Z.AI: se trata de un experimento de investigación sobre formatos de cuantización de 4 bits. Concretamente, redefine el código 0b1000 del formato E2M1 (que normalmente representa −0) para que pase a representar el valor +5 en los expertos enrutados de las capas 3 a 44, aprovechando un código que de otro modo queda desaprovechado.

El modelo conserva la arquitectura, el tamaño (331.033.893.726 parámetros totales) y el layout del checkpoint del que deriva, con un repositorio de 172 GB distribuido en 132 ficheros safetensors. Su pipeline es image-text-to-text, lo que indica que mantiene la torre de visión del modelo original, y está etiquetado para los idiomas japonés e inglés.

Su relevancia es fundamentalmente académica: demuestra que reutilizar un código redundante de E2M1 puede mejorar la fidelidad de la cuantización respecto al modelo BF16 de referencia (KL 0.0440 frente a 0.0470 de Jammed XSFP4), sin añadir bits ni aumentar el tamaño. A cambio, requiere kernels propios (NVFP4_NZ5 sobre TensorFold) que no estaban publicados en la fecha de la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (GLM-5, pipeline image-text-to-text) con expertos enrutados y capa MTP; detalles completos no disponibles |
| Parametros totales | 331.033.893.726 |
| Parametros activos | no disponible |
| Longitud de contexto | 40.960 tokens (ventana usada en las pruebas de servicio de la model card) |
| Tipos de cuantizacion | NVFP4 con mapa de códigos modificado (`e2m1_nz5`), escalas CSF0 en bloques de 32, cuantización de 8 bits (tag `8-bit`), XSFP4/NVFP4 |
| Idiomas soportados | ja, en |
| Licencia | nvidia-open-model-agreement (etiquetada como `other`) |
| Formato de pesos | safetensors (132 ficheros) |

## Arquitectura y entrenamiento

El modelo parte del checkpoint nvidia/GLM-5.3-Flash-FP4-Local, pensado para sistemas GB10 (clase DGX Spark), y de la variante intermedia Bizuayeu/GLM-5.3-Flash-XSFP4. La modificación afecta únicamente a los expertos enrutados de las capas 3 a 44: en lugar de usar el código 0b1000 de E2M1 como −0, se reinterpreta como +5, y esos expertos se recuantizan desde BF16 con la nueva tabla de códigos. El resto de tensores, incluida la capa MTP de decodificación especulativa y la torre de visión, se mantiene byte a byte igual que en el checkpoint FP4-Local.

El proceso de cuantización sigue la regla de Jammed XSFP4: cada escala se elige minimizando el error cuadrático dentro de la ventana de 16 pasos de cada fila. Sobre las 42 capas afectadas, el error cuadrático resultante es 0,8935 veces el de Jammed XSFP4, y la divergencia KL respecto a BF16 baja de 0,0470 a 0,0440, recuperando aproximadamente la mitad de la pérdida que Jammed XSFP4 había introducido frente a XSFP4. El +5 se coloca en el hueco más amplio del rango (entre 4 y 6), donde caen los pesos mayores de cada bloque; el 1,98% de los pesos de los expertos enrutados adoptan ese código. No se añade ningún bit ni se altera el layout de bytes. Los números de calidad publicados corresponden a decodificación de pesos a BF16 (W4A16).

## Capacidades

- Generación de texto conversacional multi-turno, heredada del modelo base GLM-5.3-Flash.
- Procesamiento de imagen y texto (pipeline image-text-to-text), con torre de visión conservada del checkpoint original.
- Idiomas: japonés e inglés según los metadatos del modelo.
- Decodificación especulativa mediante la capa MTP incluida en el checkpoint.
- Razonamiento y generación de código: no disponible en la información proporcionada; se asume lo que herede del modelo base, sin datos verificados en esta ficha.
- Tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la información proporcionada.
- Modo thinking, audio u otras capacidades especiales: no disponible en la información proporcionada.

## Casos de uso

- Investigación sobre formatos de cuantización de 4 bits: el modelo permite estudiar empíricamente el impacto de reasignar el código −0 de E2M1 a un valor útil (+5), comparando KL y error cuadrático frente a Jammed XSFP4 sobre las mismas posiciones.
- Experimentación con kernels personalizados: sirve como banco de pruebas para implementar y validar decodificadores de tablas de códigos de 16 entradas en TensorFold con el recetario NVFP4_NZ5.
- Evaluación de fidelidad W4A16: al publicarse métricas de cercanía a BF16 con pesos decodificados, es adecuado para medir la degradación de calidad de una cuantización de 4 bits en un modelo de 331.000 millones de parámetros.
- Estudio de despliegue en clústeres GB10: las pruebas de la model card se hicieron a TP=2 sobre dos GB10 con ventana de 40.960 tokens, por lo que el checkpoint documenta un escenario real de servicio distribuido en hardware de clase DGX Spark.
- Análisis comparativo de recetas de cuantización: permite aislar el efecto de una sola variable (el mapa de códigos) manteniendo tamaño, layout y resto de tensores idénticos al checkpoint de referencia.
- Docencia y divulgación técnica: los artefactos explicativos en inglés y japonés enlazados en la model card lo convierten en material didáctico sobre NVFP4, OSFP4 y XSFP4.

## Benchmarks y rendimiento

| Metrica | Jammed XSFP4 NZ5 | Jammed XSFP4 | XSFP4 |
|---|---|---|---|
| KL respecto a BF16 (PyTorch, menor es mejor) | 0,0440 | 0,0470 | 0,0410 |
| Error cuadratico relativo a Jammed XSFP4 (42 capas) | 0,8935 | 1,0 (referencia) | no disponible |
| Porcentaje de pesos con el codigo reasignado | 1,98% (1,92-2,08% por proyeccion) | no aplica | no aplica |
| Tamano del repositorio | 172 GB (132 safetensors) | 172 GB | no disponible |
| Memoria cargada a TP=2 (ventana 40.960, vision off) | 83,53 GiB | 83,53 GiB | no disponible |
| Velocidad de decodificacion (drafts off, TP=2) | 0,8-0,9% mas lento que Jammed XSFP4 | referencia | no disponible |

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el checkpoint ocupa 172 GB en disco y, cargado a TP=2 con ventana de 40.960 tokens, visión desactivada y un solo stream, consume 83,53 GiB por máquina.
- GPU recomendadas: sistemas GB10 (clase DGX Spark). Se requieren al menos dos unidades; con una sola GB10 no es viable según la model card. No se ha probado con tres.
- GPU de consumo: no cabe en GPUs de consumo convencionales (RTX 4090, etc.) por el tamaño del checkpoint y los requisitos de memoria distribuida.
- Opciones de despliegue: exclusivamente TensorFold con los kernels NVFP4_NZ5. vLLM, otros cargadores NVFP4 y TensorFold sin esos kernels no leen este checkpoint; de hecho, lo rechazan por nombre gracias al recetario `NVFP4_NZ5` declarado en la config.
- Latencia y throughput: la decodificación con drafts desactivados es entre un 0,8% y un 0,9% más lenta que Jammed XSFP4 a TP=2 en la misma build de motor; el prefill no se distingue del de Jammed XSFP4. No se publican valores absolutos de latencia ni tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad de motor |
|---|---|---|---|---|---|
| GLM-5.3-Flash Jammed XSFP4 NZ5 (este) | 331.033.893.726 | 40.960 (probado) | NVFP4 con mapa `e2m1_nz5` | nvidia-open-model-agreement | Sin motor publicado a 2026-11-11; solo kernels no fusionados de TensorFold |
| GLM-5.3-Flash Jammed XSFP4 | no disponible | no disponible | NVFP4 con CSF0, bloques de 32 | nvidia-open-model-agreement | Servible hoy |
| GLM-5.3-Flash XSFP4 | no disponible | no disponible | XSFP4 | nvidia-open-model-agreement | no disponible |
| nvidia/GLM-5.3-Flash-FP4-Local | no disponible | no disponible | FP4-Local | nvidia-open-model-agreement | no disponible |

## Limitaciones y advertencias

- No es un lanzamiento oficial de NVIDIA ni de Z.AI; es un checkpoint derivado por un tercero.
- No existe motor publicado que lea este checkpoint en la fecha de la model card (2026-11-11): los kernels necesarios se escribieron sobre el main de TensorFold en el commit `fde40f638b` y no están fusionados ni publicados.
- No es compatible con E2M1 estándar: el hardware que decodifica E2M1 directamente (tensor cores FP4) interpreta 0b1000 como −0, por lo que una ruta que entregue estos pesos sin decodificar la tabla produce resultados incorrectos. Servido con el recetario de Jammed XSFP4 en la config, el modelo se degrada.
- Requiere dos sistemas GB10 como mínimo; no funciona en una sola unidad y no se ha validado con tres.
- Las métricas de calidad publicadas son para decodificación de pesos a BF16 (W4A16), no para ejecución nativa en tensor cores FP4.
- Idiomas limitados a japonés e inglés según los metadatos; el comportamiento en otros idiomas no está documentado.
- Riesgo de alucinación y sesgos: no disponible en la información proporcionada; se desconoce la evaluación del modelo base en este aspecto.
- La licencia nvidia-open-model-agreement impone condiciones específicas para uso comercial; debe revisarse antes de cualquier despliegue productivo.
- El checkpoint no añade bits ni mejora el tamaño: la ganancia es de fidelidad (KL 0,0440 frente a 0,0470), no de eficiencia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Bizuayeu/GLM-5.3-Flash-Jammed-XSFP4-NZ5
- Modelo base intermedio: https://huggingface.co/Bizuayeu/GLM-5.3-Flash-Jammed-XSFP4
- Modelo base original: https://huggingface.co/nvidia/GLM-5.3-Flash-FP4-Local
- Explicación de Jammed XSFP4 NZ5 (inglés y japonés): https://claude.ai/artifact/2uL3T5qfYTi1kLnXWQgubs
- Explicación de Jammed XSFP4: https://claude.ai/artifact/Jmo5srGuQYCrPSUdYpbSRv
- Explicación de NVFP4, OSFP4 y XSFP4: https://claude.ai/artifact/AGG4jdSbUCtX98CExJWv16
- Licencia NVIDIA Open Model Agreement: https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-open-model-agreement/
- Paper referenciado en los tags: arxiv:2501.04052 (https://arxiv.org/abs/2501.04052)
