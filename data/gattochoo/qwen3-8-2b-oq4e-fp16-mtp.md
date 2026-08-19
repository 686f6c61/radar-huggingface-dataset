# gattochoo/Qwen3.8-2B-oQ4e-fp16-mtp

## Resumen

El modelo `gattochoo/Qwen3.8-2B-oQ4e-fp16-mtp` es una cuantización de 4 bits del modelo Qwen3.8-2B, realizada con la herramienta oQ (oMLX v0.6.2) en formato MLX safetensors. El autor, gattochoo, ha publicado esta versión para su uso en dispositivos Apple Silicon mediante MLX, un framework de aprendizaje automático optimizado para esa plataforma. La cuantización mixta oQ4e con grupo de tamaño 64 busca reducir el tamaño del modelo manteniendo una calidad aceptable.

A pesar de que el nombre sugiere un modelo de 2 mil millones de parámetros, los archivos safetensors contienen 656.253.248 parámetros totales, lo que indica una discrepancia que podría deberse a una convención de nombres del modelo base o a una arquitectura de tipo Mixture of Experts con parámetros activos reducidos. La model card indica que el tipo de modelo es `qwen3_5`, perteneciente a la serie Qwen3.5/3.8 de Alibaba. No se dispone de información sobre licencia, idiomas soportados ni pipeline específico.

Esta cuantización está pensada para entornos con restricciones de memoria, como portátiles con Apple Silicon, donde la inferencia local de modelos grandes es viable gracias a la optimización de MLX. Es relevante para desarrolladores que necesitan ejecutar un modelo de razonamiento de la familia Qwen en hardware de consumo sin recurrir a servicios en la nube.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (serie Qwen3.5/3.8, tipo `qwen3_5`) |
| Parametros totales | 656.253.248 (segun safetensors) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | oQ4e (4 bits, group size 64, mixed-precision) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | MLX safetensors |

## Arquitectura y entrenamiento

La información proporcionada no detalla la arquitectura interna del modelo base. Por la designación `qwen3_5`, se infiere que pertenece a la familia Qwen3.5, que emplea arquitectura transformer con atención de múltiples cabezas. Sin embargo, no se dispone de datos sobre el número de capas, dimensiones ocultas, ni sobre el proceso de entrenamiento (tokens, dataset, técnicas de alineación como RLHF o DPO). La cuantización oQ4e utiliza precisión mixta: algunas capas se mantienen en fp16 mientras que otras se reducen a 4 bits, con un tamaño de grupo de 64, lo que permite un equilibrio entre compresión y fidelidad. No se han publicado detalles sobre innovaciones técnicas específicas del modelo base en la información disponible.

## Capacidades

- Generacion de texto y razonamiento: al ser un modelo de la serie Qwen3, se espera que soporte tareas de comprension y generacion de lenguaje, aunque no se han verificado capacidades concretas.
- Razonamiento multi-paso: los modelos Qwen3 integran modos de pensamiento (thinking mode) para tareas complejas, pero no hay confirmacion para esta cuantizacion.
- Soporte de tool calling: no disponible en la informacion proporcionada.
- Soporte de agentes: no disponible.
- Capacidades multilingues: no disponible.
- Capacidades especiales (vision, audio, etc.): no disponible.

## Casos de uso

- Inferencia local en Apple Silicon: el formato MLX permite ejecutar el modelo en Macs con chip M-series, aprovechando la memoria unificada. Un desarrollador puede cargar el modelo con `mlx-lm` o `mlx_lm.generate` para obtener respuestas sin conexion.
- Prototipado rapido de aplicaciones de chat: al ser una cuantizacion de 4 bits, el modelo ocupa menos de 2.5 GB, lo que facilita su integracion en aplicaciones de escritorio o scripts de prueba.
- Experimentacion con cuantizacion mixta: el uso de oQ4e con group size 64 sirve como referencia para evaluar la perdida de calidad frente a versiones fp16 o cuantizaciones mas agresivas.
- Educacion y aprendizaje: estudiantes e investigadores pueden estudiar el comportamiento de un modelo de la familia Qwen en tareas de generacion de texto sin necesidad de hardware de alta gama.
- Despliegue en entornos con restricciones de memoria: el tamaño reducido permite ejecutar el modelo en dispositivos con 8 GB de RAM o menos, como portatiles antiguos o mini-PCs.
- Evaluacion comparativa de cuantizaciones: permite medir el impacto de la cuantizacion oQ4e en tareas especificas frente a otros formatos (GGUF, GPTQ) en la misma arquitectura.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: al ser un modelo de ~656M parametros cuantizado a 4 bits, el peso en memoria ronda los 0.33 GB (656M × 4 bits / 8 = 328 MB), mas overhead de activaciones. En la practica, el repositorio ocupa 2.5 GB, lo que incluye pesos fp16 de algunas capas y metadatos.
- GPU recomendadas: no requiere GPU dedicada; funciona en CPU con Apple Silicon gracias a MLX. En GPUs de escritorio se puede ejecutar con CUDA si se convierte a otro formato.
- Compatibilidad con consumer GPU: si, cualquier GPU con mas de 2 GB de VRAM puede ejecutarlo, aunque MLX esta optimizado para Apple Silicon.
- Opciones de despliegue: MLX (biblioteca nativa), `mlx-lm`, `mlx_lm.server` para API local, o conversion a GGUF para usar con llama.cpp u Ollama.
- Latencia y throughput: no disponible, pero al ser un modelo pequeno, se espera una generacion rapida en hardware moderno.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables especificos. La cuantizacion es de un modelo de la serie Qwen, pero no hay datos de rendimiento ni especificaciones del modelo base para establecer una comparacion fiable.

## Limitaciones y advertencias

- Sesgos conocidos: no hay informacion sobre sesgos especificos, pero al ser un modelo de lenguaje general, puede heredar sesgos de sus datos de entrenamiento.
- Riesgo de alucinacion: como cualquier LLM, puede generar contenido falso o inventado, especialmente en tareas de razonamiento complejo.
- Limitaciones de contexto: se desconoce la longitud de contexto soportada; el modelo base podria tener limitaciones que afecten a conversaciones largas.
- Restricciones de licencia: la licencia no esta especificada, por lo que no se puede garantizar su uso comercial. Se recomienda contactar al autor o consultar el repositorio original de Qwen.
- Caveat de produccion: al ser una cuantizacion no oficial, puede haber degradacion de calidad frente al modelo original. Ademas, el formato MLX limita su uso a ecosistemas Apple, salvo conversion.
- Discrepancia en parametros: el nombre indica 2B, pero los pesos suman 656M, lo que sugiere que el modelo base podria ser una variante mas pequena o una arquitectura MoE con parametros activos reducidos. Verificar antes de usar.

## Enlaces

- HuggingFace: https://huggingface.co/gattochoo/Qwen3.8-2B-oQ4e-fp16-mtp
- Repositorio oQ (oMLX): https://github.com/jundot/omlx
- Repositorio oficial Qwen3.8: https://github.com/QwenLM/Qwen3.8
- Pagina de Qwen3.8 en OpenLM.ai: https://openlm.ai/qwen3.8/
- Technical report de Qwen3: https://arxiv.org/html/2505.09388v1
