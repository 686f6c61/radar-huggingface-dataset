# mlx-community/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic-oQ6h-mtp

## Resumen

DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic-oQ6h-mtp es una cuantizacion mixta publicada por la organizacion mlx-community sobre un modelo base denominado Qwen3.5-9B, presumiblemente una variante afinada del linaje Qwen, con un prefijo de nombre que alude a DeepSeek-V4-Pro y una etiqueta "UNCENSORED-heretic" que sugiere un ajuste fino orientado a eliminar restricciones de rechazo. El checkpoint se distribuye en formato MLX (safetensors) para ejecucion en Apple Silicon y emplea la herramienta oQ de oMLX v0.8.0 para producir una mezcla de precisiones por tensor.

El dato objetivo mas relevante es el recuento real de parametros en los tensores safetensors: 4.250.332.912 (4,25 mil millones), muy por debajo de los 9B que sugiere el nombre comercial. Esa discrepancia es habitual en checkpoints cuantizados de forma agresiva, donde parte de los pesos se almacena en formatos comprimidos o empaquetados, pero conviene tratarla con cautela: el nombre del repositorio no debe tomarse como especificacion tecnica.

El modelo incorpora tres componentes diferenciados segun la propia model card: un modelo de lenguaje de 3,551B de pesos logicos, un modulo de vision de 0,456B y una cabeza MTP (multi-token prediction) de 0,243B. El checkpoint completo ocupa 8,654 GB en disco (8,060 GiB). La relevancia actual es limitada pero concreta: es un ejemplo de cuantizacion mixta por capas para MLX con soporte de vision y decodificacion especulativa mediante MTP, publicado el 19 de noviembre de 2026.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.5, segun tag `qwen3_5`); incluye modulo de vision y cabeza MTP |
| Parametros totales | 4.250.332.912 (4,25B) segun safetensors |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Mezcla por tensor: affine 6-bit grupo 64, affine 8-bit grupo 64, BF16 y U32; media efectiva 16,288 bits/peso |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (MLX); libreria `mlx` |

## Arquitectura y entrenamiento

La model card no documenta la arquitectura del modelo base ni su proceso de entrenamiento. Los unicos datos estructurales provienen del desglose de almacenamiento del checkpoint cuantizado: un modelo de lenguaje de 3,551B de pesos logicos, un modulo de vision de 0,456B y una cabeza MTP de 0,243B. La presencia de un modulo de vision confirma que el modelo base es multimodal (entrada de imagen ademas de texto), y la cabeza MTP apunta a decodificacion multi-token, una tecnica de prediccion especulativa que permite proponer varios tokens por paso y validarlos en paralelo para aumentar el throughput.

La innovacion tecnica destacable es la cuantizacion mixta con oQ (oMLX v0.8.0), que asigna precision de forma no uniforme: el 52,301% de los pesos logicos (2,223B) se guarda en affine 6-bit con grupo de 64, un 0,493% (0,021B) en affine 8-bit, un 14,117% (0,600B) en BF16 y un 33,088% (1,406B) en U32. Este ultimo bloque, que representa un tercio de los pesos logicos y 5,239 GiB de almacenamiento, corresponde con toda probabilidad a los empaquetados de cuantizacion y a tensores que el cuantizador deja en formato de 32 bits. El resultado es una media efectiva de 16,288 bits por peso, un valor alto para lo que sugiere la etiqueta "6-bit": el checkpoint no es un 6-bit puro, sino una mezcla con un peso considerable de tensores en BF16 y U32. No hay informacion sobre el dataset de entrenamiento, el numero de tokens, ni sobre si se aplico RLHF o DPO. El sufijo "UNCENSORED-heretic" indica un ajuste fino de alineacion inversa, pero no se documenta su metodologia.

## Capacidades

- Generacion de texto y razonamiento: el componente de lenguaje de 3,551B de pesos logicos soporta las capacidades propias del modelo base Qwen3.5, aunque no se detallan en la model card.
- Vision: el modulo de vision de 0,456B permite procesar imagenes como entrada, lo que habilita tareas de descripcion, VQA y extraccion de informacion de documentos visuales.
- Decodificacion multi-token: la cabeza MTP de 0,243B implementa prediccion especulativa integrada, orientada a reducir la latencia de generacion.
- Modo sin censura: la etiqueta "UNCENSORED-heretic" indica que el modelo ha sido ajustado para reducir rechazos y filtros de seguridad, lo que cambia el comportamiento en prompts sensibles.
- Tool calling y function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible; no se declaran idiomas.
- Capacidades especiales (audio, thinking mode explicito): no disponible.

## Casos de uso

- Inferencia local en Apple Silicon: al estar empaquetado en formato MLX con 8,654 GB en disco, el modelo esta pensado para ejecutarse en Macs con memoria unificada de 16 GB o mas mediante la libreria `mlx`, sin necesidad de GPU dedicada.
- Procesamiento de documentos con imagenes: el modulo de vision permite extraer texto y estructura de capturas, formularios o PDF renderizados, integrable en un pipeline de digitalizacion que corre en local.
- Generacion asistida de bajo coste en portatil: con 4,25B de parametros reales, es viable para autocompletado, resumenes y redaccion en un equipo de sobremesa, con la cabeza MTP reduciendo la latencia por token.
- Prototipado de aplicaciones multimodales: util para validar interfaces de vision-lenguaje antes de migrar a modelos mayores, dado el reducido coste de almacenamiento y despliegue.
- Experimentacion en alineacion y seguridad: la variante "heretic" sirve como caso de estudio para investigar el efecto del ajuste fino sin censura sobre el comportamiento del modelo y sus rechazos.
- Benchmarking de cuantizacion mixta: el checkpoint permite medir la perdida de calidad de oQ frente al modelo base en BF16, comparando la distribucion 6/8/16/32 bits documentada.
- Educacion y demostraciones offline: su tamano permite distribuirlo en entornos sin conectividad para talleres sobre MLX y cuantizacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: el checkpoint ocupa 8,654 GB en disco; en ejecucion se necesita ademas memoria para el contexto KV y los buffers intermedios. Se estima un minimo practico de 12-16 GB de memoria unificada para contextos cortos.
- GPU recomendadas: Apple Silicon con memoria unificada (series M1 Pro/Max, M2 Pro/Max/Ultra, M3 Pro/Max, M4 Pro/Max). El formato MLX no esta pensado para GPUs NVIDIA o AMD.
- Compatibilidad con GPU de consumo: si, en Macs con 16 GB o mas de memoria unificada; no se contempla en tarjetas graficas dedicadas convencionales.
- Opciones de despliegue: libreria `mlx` y `mlx-lm` para Apple Silicon. No se indica compatibilidad con vLLM, llama.cpp, Ollama o TGI, dado el formato especifico.
- Latencia y throughput: no disponibles. La cabeza MTP deberia mejorar el throughput respecto a decodificacion autoregresiva pura, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic-oQ6h-mtp | 4,25B (safetensors) | no disponible | MLX safetensors | no disponible | Cuantizacion mixta oQ, vision + MTP |
| Modelo base Qwen3.5-9B (BF16) | no disponible | no disponible | safetensors | no disponible | Referencia de calidad sin cuantizar |
| Checkpoints MLX de la comunidad para modelos ~4B | variable | variable | MLX safetensors | variable | Alternativas de tamano similar para Apple Silicon |

No se dispone de datos de rendimiento ni de especificaciones del modelo base que permitan una comparacion cuantitativa fiable. La comparativa con alternativas concretas queda como no disponible.

## Limitaciones y advertencias

- Discrepancia de nomenclatura: el nombre indica "9B" pero el recuento real de safetensors es de 4,25B; conviene no asumir el tamano del nombre en estimaciones de memoria o calidad.
- Licencia no declarada: sin licencia explicita no hay garantia de uso comercial; debe verificarse antes de cualquier despliegue en produccion.
- Etiqueta "UNCENSORED-heretic": el ajuste fino orientado a eliminar rechazos incrementa el riesgo de generar contenido danino, sesgado o ilegal; no es apto para aplicaciones de cara al publico sin filtros adicionales.
- Riesgo de alucinacion: no se aportan evaluaciones de fidelidad; en un modelo de 4,25B y con cuantizacion mixta, la tasa de alucinacion puede ser elevada en tareas de conocimiento factual.
- Perdida por cuantizacion: la mezcla incluye un 33% de pesos logicos en U32 y un 14% en BF16, lo que sugiere que el cuantizador preservo tensores sensibles; aun asi, no hay evaluacion de degradacion frente al base.
- Idiomas no declarados: no se garantiza soporte de castellano ni de otros idiomas distintos del que use el modelo base.
- Contexto desconocido: no se especifica la ventana de contexto, lo que impide planificar casos de uso con documentos largos.
- Dependencia de plataforma: el formato MLX limita el despliegue a Apple Silicon; no es portable a servidores NVIDIA sin reconversion.
- Procedencia del modelo base no verificada: el prefijo "DeepSeek-V4-Pro" en el nombre no se corresponde con ningun modelo documentado en la informacion disponible y no debe interpretarse como una especificacion oficial.

## Enlaces

- Hugging Face: https://huggingface.co/mlx-community/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic-oQ6h-mtp
- Repositorio de la herramienta de cuantizacion oQ (oMLX): https://github.com/jundot/omlx
