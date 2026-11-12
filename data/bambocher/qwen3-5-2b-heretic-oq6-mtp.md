# bambocher/Qwen3.5-2B-heretic-oQ6-mtp

## Resumen

Qwen3.5-2B-heretic-oQ6-mtp es una version cuantizada y "decensored" del modelo Qwen3.5-2B de Alibaba Qwen, publicada por el usuario bambocher en Hugging Face. El checkpoint combina tres transformaciones sobre el modelo base: una ablacion de comportamiento realizada con Heretic v2.0.0 (que elimina los rechazos del modelo original), una cuantizacion de precision mixta mediante oQ de oMLX v0.7.3, y la preservacion de la cabeza de prediccion multi-token (MTP) del modelo original.

El modelo conserva la arquitectura multimodal del Qwen3.5-2B original, con 2.274 millones de parametros distribuidos entre el modelo de lenguaje (1.882B), el codificador de vision (0.331B) y la cabeza MTP (0.061B). El checkpoint ocupa 2.3 GB en disco con un promedio efectivo de 8.090 bits por peso, lo que lo hace adecuado para inferencia en hardware Apple Silicon mediante MLX.

Su relevancia radica en dos factores: por un lado, demuestra el flujo completo de cuantizacion mixta con oQ para modelos MLX; por otro, ejemplifica el uso de tecnicas de ablacion de comportamiento (Heretic) para eliminar rechazos en modelos pequenos, un area de interes creciente para investigadores que estudian alineamiento y seguridad en modelos compactos. La licencia y los idiomas soportados no estan declarados en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Qwen3.5) con cabeza MTP |
| Parametros totales | 2.274.069.824 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Precision mixta oQ: affine 6-bit grupo 64 (76.621%), affine 8-bit grupo 64 (8.412%), BF16 (14.967%) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (MLX) |

Desglose de almacenamiento:

| Componente | Parametros logicos | Almacenamiento |
|---|---|---|
| Modelo de lenguaje | 1.882B | 1.576 GB / 1.468 GiB |
| Vision | 0.331B | 0.663 GB / 0.617 GiB |
| Cabeza MTP | 0.061B | 0.061 GB / 0.057 GiB |
| Total | 2.274B | 2.300 GB / 2.142 GiB |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del Qwen3.5-2B original: un transformer multimodal con un codificador de vision separado (0.331B de parametros) y una cabeza de prediccion multi-token (MTP) de 0.061B. La cabeza MTP permite decodificacion especulativa nativa, acelerando la generacion al predecir varios tokens por paso. El checkpoint cuantizado mantiene esta cabeza intacta, lo que preserva la capacidad de decodificacion especulativa del modelo original.

El proceso de "decensoring" se realizo con Heretic v2.0.0 mediante una ablacion de rango arbitrario (ARA) aplicada entre las capas 12 y 23 del modelo, con los siguientes parametros: `start_layer_index=12`, `end_layer_index=23`, `preserve_good_behavior_weight=0.9189`, `steer_bad_behavior_weight=0.0008`, `overcorrect_relative_weight=0.9924`, `neighbor_count=14`. Segun la model card, el resultado es 0 rechazos en 100 prompts de prueba frente a 97/100 del modelo original, con una divergencia KL de 0.1397 respecto al modelo base. No se dispone de informacion sobre los datos de entrenamiento originales del Qwen3.5-2B ni sobre el proceso de RLHF/DPO del modelo base en la informacion proporcionada.

## Capacidades

- Generacion de texto y razonamiento: hereda las capacidades del Qwen3.5-2B base, aunque no se detallan en la informacion disponible.
- Vision: incluye un codificador de vision de 0.331B de parametros, por lo que soporta entrada de imagenes.
- Decodificacion especulativa: la cabeza MTP intacta permite prediccion multi-token y aceleracion de inferencia.
- Comportamiento sin rechazos: la ablacion Heretic elimina las respuestas de negativa del modelo original (0/100 rechazos segun la model card).
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Modo thinking: no disponible en la informacion proporcionada.

## Casos de uso

- Investigacion sobre alineamiento y seguridad: el modelo permite estudiar el efecto de la ablacion ARA en un modelo pequeno, comparando el comportamiento con y sin rechazos mediante la metrica de divergencia KL (0.1397) y la tasa de rechazos (0/100).
- Inferencia local en Apple Silicon: con 2.3 GB de checkpoint y formato MLX, el modelo se ejecuta en Macs con memoria unificada, permitiendo prototipado rapido de aplicaciones multimodales sin GPU dedicada.
- Evaluacion de cuantizacion mixta: sirve como caso de estudio del esquema oQ de oMLX, con una distribucion documentada de bits por peso (6.50, 8.50 y 16.00 bits segun el tensor) que permite analizar el impacto de la precision mixta en la calidad.
- Generacion de texto sin filtros en entornos controlados: util para investigadores que necesitan estudiar el comportamiento del modelo sin las capas de rechazo, siempre que se apliquen las salvaguardas externas adecuadas.
- Pruebas de decodificacion especulativa: la cabeza MTP permite medir el speedup de la prediccion multi-token en comparacion con decodificacion autoregresiva estandar.
- Prototipado de pipelines multimodales: el codificador de vision integrado permite experimentar con tareas imagen-texto en un modelo de solo 2.3 GB, adecuado para entornos con recursos limitados.
- Benchmarking de tecnicas de "decensoring": comparar Heretic v2.0.0 con otras tecnicas de ablacion en terminos de tasa de rechazo y divergencia KL.

## Benchmarks y rendimiento

La model card proporciona unicamente metricas del proceso de decensoring, no benchmarks estandar de capacidad:

| Metrica | Este modelo | Qwen/Qwen3.5-2B original |
|---|---|---|
| Rechazos | 0/100 | 97/100 |
| Divergencia KL | 0.1397 | 0 (por definicion) |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2.3 GB para los pesos en el formato cuantizado actual; el runtime MLX anade overhead adicional segun el contexto y el tamano de lote.
- GPU recomendadas: Apple Silicon (M1, M2, M3, M4 y variantes Pro/Max/Ultra) mediante MLX. No se garantiza compatibilidad con CUDA en el formato actual.
- Cabe en GPU consumer: si, en cualquier Mac con memoria unificada de 8 GB o superior; el checkpoint de 2.3 GB deja margen amplio para el contexto y el codificador de vision.
- Opciones de despliegue: MLX (libreria nativa), oMLX (herramienta de cuantizacion y runtime). No se ha verificado compatibilidad con vLLM, llama.cpp, Ollama o TGI en el formato MLX.
- Latencia y throughput: no disponibles en la informacion proporcionada. La cabeza MTP deberia reducir la latencia respecto a decodificacion autoregresiva, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Vision | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Qwen3.5-2B-heretic-oQ6-mtp | 2.274B | no disponible | Si | no disponible | safetensors MLX | Sin rechazos, cuantizacion mixta, MTP |
| Qwen/Qwen3.5-2B | 2.274B (aprox.) | no disponible | Si | no disponible | safetensors | Modelo base, 97/100 rechazos |
| Otros modelos de ~2B | no disponible | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la informacion proporcionada |

No se dispone de informacion suficiente sobre modelos alternativos de la misma categoria (tamano ~2B, multimodal, MLX) para establecer una comparativa detallada.

## Limitaciones y advertencias

- Eliminacion de rechazos: el modelo ha sido modificado para no negarse a peticiones (0/100 rechazos). Esto elimina las salvaguardas del modelo original y puede generar contenido inapropiado, danino o ilegal si se usa sin filtros externos. No es apto para despliegues en produccion orientados al publico sin moderacion adicional.
- Divergencia respecto al original: la divergencia KL de 0.1397 indica que el comportamiento del modelo se ha alejado del base; no se documenta si esto afecta a capacidades como razonamiento, codigo o vision.
- Licencia no declarada: la model card no especifica licencia, lo que impide determinar si el uso comercial esta permitido. El modelo base Qwen3.5-2B tiene su propia licencia que debe consultarse por separado.
- Idiomas no declarados: no se especifica que idiomas soporta el modelo; no se puede asumir cobertura multilingue.
- Contexto no disponible: se desconoce la longitud maxima de contexto, lo que limita la planificacion de aplicaciones con documentos largos.
- Formato exclusivo MLX: el checkpoint esta en formato MLX, no en GGUF ni safetensors estandar de PyTorch; la portabilidad a otros runtimes requiere conversion y no esta garantizada.
- Sin benchmarks de capacidad: no hay datos publicados de MMLU, HumanEval, GSM8K ni similares, por lo que no se puede evaluar su rendimiento en tareas estandar frente al modelo base.
- Riesgo de alucinacion: inherente a los modelos de 2B; no se aportan datos especificos sobre tasas de alucinacion.
- Repo sin traccion: 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de validacion por parte de la comunidad.
- Actualizacion reciente: la model card indica una recuantizacion con oMLX v0.7.3 el 2026-11-12; las copias anteriores deben descartarse.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/bambocher/Qwen3.5-2B-heretic-oQ6-mtp
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- Heretic (proyecto de decensoring): https://heretic-project.org
- oQ / oMLX (cuantizacion): https://github.com/jundot/omlx
