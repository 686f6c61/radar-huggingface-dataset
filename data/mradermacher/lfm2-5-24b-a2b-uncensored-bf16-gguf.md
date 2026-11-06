# mradermacher/LFM2.5-24B-A2B-Uncensored-BF16-GGUF

## Resumen

LFM2.5-24B-A2B-Uncensored-BF16-GGUF es una cuantizacion estatica en formato GGUF del modelo LFM2.5-24B-A2B-Uncensored-BF16, publicado por el usuario mradermacher en Hugging Face. Se trata de una conversion de pesos a formatos optimizados para inferencia con llama.cpp y derivados, no de un modelo entrenado desde cero. El repositorio actua como espejo cuantizado del original alojado en frstofrhx/LFM2.5-24B-A2B-Uncensored-BF16.

El nombre sugiere una arquitectura Mixture of Experts (MoE) con 24.000 millones de parametros totales y aproximadamente 2.000 millones activos por token (notacion A2B), ademas de una variante "Uncensored" que implicaria un ajuste fino con menor filtrado de contenido. No obstante, la model card no aporta informacion verificable sobre arquitectura, contexto, datos de entrenamiento ni licencia, por lo que estos datos deben tratarse como no disponibles.

La relevancia de esta ficha es limitada pero practica: permite a desarrolladores identificar rapidamente que existe una version GGUF cuantizada de un supuesto MoE de 24B con activacion de 2B, util para despliegue en hardware modesto si la arquitectura se confirma. La ausencia de metadatos obliga a precaucion en entornos de produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el nombre sugiere MoE, sin confirmar) |
| Parametros totales | 24B (segun nombre del repositorio, no verificado) |
| Parametros activos | 2B (segun notacion A2B del nombre, no verificado) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | x-f16, Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, IQ4_XS |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones estaticas) y BF16 en el modelo original |

## Arquitectura y entrenamiento

No se dispone de informacion verificable sobre la arquitectura interna, los datos de entrenamiento, el numero de tokens procesados ni si se aplicaron tecnicas de RLHF, DPO o ajuste instructivo. El nombre del modelo apunta a una arquitectura MoE con 24B totales y 2B activos, lo que seria coherente con la familia LFM (Liquid Foundation Models) de Liquid AI, pero esta hipotesis no se confirma en la informacion proporcionada.

El repositorio es una conversion de pesos realizada con herramientas de cuantizacion (los metadatos indican `convert_type: hf` y `output_tensor_quantised: 1`), no un entrenamiento. Se ofrecen cuantizaciones estaticas en multiples niveles, desde Q2_K hasta Q8_0 e IQ4_XS, generadas a partir del modelo BF16 original. No se documentan innovaciones tecnicas adicionales.

## Capacidades

- Generacion de texto: capacidad esperada por tratarse de un modelo de lenguaje, aunque no se detalla en la model card.
- Razonamiento y codigo: no confirmado en la informacion disponible.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Modo "uncensored": el nombre indica un ajuste con menor filtrado de contenido, lo que puede implicar respuestas sin rechazos en temas sensibles.
- Capacidades especiales (vision, audio, thinking mode): no disponible.

## Casos de uso

- Despliegue local en hardware de consumo: si se confirma la arquitectura MoE con 2B activos, las cuantizaciones Q4_K_M o Q5_K_M permitirian ejecutar el modelo en GPUs con 16-24 GB de VRAM mediante llama.cpp u Ollama, con un coste computacional por token proximo al de un modelo de 2B.
- Experimentacion con modelos sin filtrado: util para investigadores que estudian el comportamiento de modelos "uncensored" en tareas de red teaming, evaluacion de sesgos o analisis de seguridad.
- Prototipado rapido en entornos sin GPU dedicada: las cuantizaciones Q2_K y Q3_K permiten pruebas en CPU o GPUs de gama baja, aunque con perdida de calidad.
- Integracion en pipelines de generacion de texto offline: al ser GGUF, se puede integrar en aplicaciones de escritorio o servidores sin conexion mediante llama.cpp.
- Evaluacion comparativa de cuantizaciones: el repositorio ofrece 12 variantes, lo que permite medir el impacto de la cuantizacion en calidad y velocidad sobre el mismo modelo base.
- Base para fine-tuning posterior: partiendo del BF16 original (no de las cuantizaciones), se podria ajustar el modelo para dominios especificos, siempre que la licencia lo permita (dato no disponible).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa, un modelo de 24B en Q4_K_M ocuparia aproximadamente 14-15 GB, y en Q8_0 en torno a 25-26 GB; en Q2_K alrededor de 9-10 GB. Estas cifras son estimaciones basadas en el tamano nominal y no en mediciones del repositorio.
- GPU recomendadas: no disponible. Si se confirma el MoE con 2B activos, una RTX 4090 (24 GB) o RTX 3090 (24 GB) podrian ejecutar cuantizaciones Q4_K_M y Q5_K_M; para Q8_0 se requeriria una A100 40 GB o H100.
- Cabe en GPU de consumo: probablemente si en RTX 4090/3090 con cuantizaciones Q4 o inferiores, sujeto a verificacion.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui y cualquier runtime compatible con GGUF. vLLM y TGI no soportan GGUF de forma nativa en todas sus versiones.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| LFM2.5-24B-A2B-Uncensored-BF16-GGUF (este) | 24B totales / 2B activos (segun nombre) | no disponible | no disponible | GGUF | Cuantizacion de un modelo "uncensored" |
| Modelos MoE de ~24B con ~2B activos (familia LFM) | no disponible | no disponible | no disponible | safetensors / GGUF | No se dispone de datos verificables para comparar |
| Alternativas GGUF de 24B densos | 24B | variable | variable | GGUF | Mayor coste por token al no ser MoE |

No se dispone de informacion suficiente para establecer una comparativa rigurosa con modelos concretos.

## Limitaciones y advertencias

- Ausencia total de metadatos: no hay licencia, idiomas, contexto ni arquitectura documentados, lo que impide garantizar su uso comercial o su idoneidad en produccion.
- Riesgo de alucinacion: inherente a los modelos de lenguaje; no hay evaluaciones publicadas que lo cuantifiquen.
- Variante "uncensored": puede generar contenido sensible, ofensivo o inseguro sin rechazos, lo que exige moderacion externa en aplicaciones publicas.
- Sesgos: no documentados; probablemente heredados del modelo base y del ajuste fino, sin informacion sobre su mitigacion.
- Perdida de calidad por cuantizacion: las variantes Q2_K y Q3_K pueden degradar notablemente el rendimiento respecto al BF16 original.
- Repositorio sin descargas ni likes: no hay evidencia de validacion por parte de la comunidad.
- Fecha de creacion futura (2026-11-03): metadato anomalo que sugiere posibles errores en el registro del repositorio.
- Sin garantias de soporte ni mantenimiento por parte del autor.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/LFM2.5-24B-A2B-Uncensored-BF16-GGUF
- Modelo original referenciado: https://huggingface.co/frstofrhx/LFM2.5-24B-A2B-Uncensored-BF16
