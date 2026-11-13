# bambocher/Qwen3.5-9B-heretic-oQ6e-mtp

## Resumen

Qwen3.5-9B-heretic-oQ6e-mtp es una cuantizacion mixta del modelo Qwen3.5-9B en su variante "heretic", publicada por el usuario bambocher en Hugging Face. El checkpoint resultante pesa 9.653 millones de parametros logicos distribuidos en 8.654 GB de almacenamiento, con un promedio efectivo de 7.172 bits por peso. La cuantizacion se ha realizado con la herramienta oQ de oMLX v0.7.3, que aplica precision mixta por tensor en funcion de su sensibilidad.

El modelo conserva tres componentes diferenciados: el modelo de lenguaje (8.954B parametros), un modulo de vision (0.456B) y una cabeza MTP (Multi-Token Prediction) de 0.243B. Esta ultima es una innovacion relevante porque permite decodificacion especulativa nativa, acelerando la generacion sin necesidad de un modelo borrador externo. La presencia del modulo de vision confirma que el modelo base es multimodal.

La relevancia de esta publicacion es doble: por un lado, demuestra que es posible comprimir un modelo de ~9.6B con vision y MTP a menos de 9 GB manteniendo precision mixta selectiva; por otro, el sufijo "heretic" indica que se ha aplicado una tecnica de ablacion de rechazos (tipicamente, eliminacion de direcciones de rechazo en el espacio de activaciones) que reduce las negativas del modelo a responder. La ficha se limita a los datos publicados: no hay informacion sobre el proceso de entrenamiento original de Qwen3.5-9B ni sobre la metodologia exacta de la variante heretic.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (lenguaje + vision) con cabeza MTP; detalles del backbone no disponibles |
| Parametros totales | 9.653.104.368 (9.653B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | oQ mixed-precision: affine 6-bit group 64 (8.250B pesos, 6.50 bits/peso), affine 8-bit group 64 (0.913B pesos, 8.50 bits/peso), BF16 (0.491B pesos, 16.00 bits/peso); media efectiva 7.172 bits/peso |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (libreria mlx) |

Desglose por componente:

| Componente | Parametros logicos | Almacenamiento |
|---|---|---|
| Modelo de lenguaje | 8.954B | 7.499 GB / 6.984 GiB |
| Vision | 0.456B | 0.912 GB / 0.849 GiB |
| Cabeza MTP | 0.243B | 0.243 GB / 0.226 GiB |
| Total | 9.653B | 8.654 GB / 8.060 GiB |

## Arquitectura y entrenamiento

La arquitectura de base corresponde a Qwen3.5-9B, un transformer multimodal con modulo de vision y cabeza MTP (Multi-Token Prediction). La cabeza MTP predice varios tokens futuros por paso, lo que habilita decodificacion especulativa integrada en el propio checkpoint: el modelo puede proponer tokens candidatos y verificarlos en una sola pasada, reduciendo el coste por token generado frente a la decodificacion autoregresiva clasica.

Sobre el entrenamiento original de Qwen3.5-9B (numero de tokens, composicion del corpus, uso de RLHF/DPO) no se proporciona informacion en la model card. La variante "heretic" implica una intervencion post-entrenamiento orientada a reducir la tasa de rechazos del modelo; la metodologia concreta no esta documentada en los datos disponibles. La cuantizacion oQ de oMLX v0.7.3 asigna precision por tensor: el 85.464% de los pesos logicos se almacenan en affine 6-bit con grupo de 64, el 9.453% en affine 8-bit y el 5.083% restante se mantiene en BF16, presumiblemente para capas sensibles (embeddings, normalizaciones o proyecciones criticas).

## Capacidades

- Generacion de texto y razonamiento en el modelo de lenguaje base (Qwen3.5-9B); el nivel concreto de rendimiento no esta documentado en la informacion disponible.
- Procesamiento de imagenes: el checkpoint incluye un modulo de vision de 0.456B parametros, por lo que se trata de un modelo multimodal imagen-texto.
- Decodificacion especulativa nativa mediante la cabeza MTP de 0.243B parametros, que puede acelerar la inferencia.
- Generacion de codigo y matematicas: capacidades esperables de la familia Qwen3.5, aunque no se aportan datos especificos en la model card.
- Tool calling / function calling: no confirmado en la informacion disponible.
- Soporte de agentes y razonamiento multi-paso: no confirmado en la informacion disponible.
- Capacidades multilingues: no disponibles.
- Modo "thinking" explicito: no confirmado en la informacion disponible.
- Reduccion de rechazos por la variante heretic: se espera una mayor tasa de respuesta a peticiones que el modelo base rechazaria, sin datos cuantitativos publicados.

## Casos de uso

- Inferencia local en Apple Silicon: al estar empaquetado para MLX y ocupar 8.06 GiB, el modelo cabe en Macs con 16 GB de memoria unificada o superior, lo que permite ejecutar un modelo multimodal de ~9.6B en hardware de consumo sin GPU dedicada.
- Asistentes multimodales de escritorio: la combinacion de modulo de vision y lenguaje permite construir aplicaciones que describan capturas de pantalla, extraigan texto de imagenes o respondan preguntas sobre documentos escaneados, todo en local.
- Generacion de texto acelerada por MTP: en escenarios de alto volumen (resumenes por lotes, clasificacion de documentos), la cabeza MTP puede reducir la latencia por token mediante decodificacion especulativa, aunque el factor de aceleracion no esta publicado.
- Prototipado de pipelines de vision-lenguaje: investigadores que necesiten un checkpoint compacto para experimentar con tecnicas de cuantizacion mixta o de ablacion de rechazos pueden usar este modelo como referencia reproducible.
- Estudio de tecnicas "heretic": util para analizar el efecto de la reduccion de rechazos sobre la calidad y la seguridad del modelo, comparando respuestas frente al Qwen3.5-9B original.
- Despliegue en entornos con memoria limitada: 8.06 GiB de pesos permiten cargar el modelo junto con el runtime MLX en maquinas de 16 GB, algo inviable con el checkpoint BF16 completo (~19 GB).
- Evaluacion de cuantizacion oQ: sirve como caso de estudio de la distribucion 6/8/16 bits de oMLX y su impacto en calidad frente a cuantizaciones uniformes de 4 u 8 bits.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo documenta la distribucion de bits y el almacenamiento; no incluye metricas de calidad (perplejidad, MMLU, HumanEval, GSM8K ni evaluaciones multimodales) ni comparaciones con el modelo base sin cuantizar.

## Requisitos de hardware

- VRAM/memoria estimada: 8.06 GiB para los pesos en el formato publicado; el runtime MLX anade overhead de activaciones y cache KV, por lo que en la practica conviene disponer de al menos 10-12 GB libres.
- Memoria unificada en Apple Silicon: cabe en Macs con 16 GB (M1/M2/M3/M4 base) y con holgura en configuraciones de 24 GB o mas.
- GPU dedicadas: al estar en formato MLX, el destino principal es Apple Silicon; para CUDA seria necesario reconvertir los pesos a otro formato (por ejemplo GGUF), lo que no se distribuye en este repositorio.
- Cabe en GPU de consumo: si, en el ecosistema Apple; en el ecosistema NVIDIA, una RTX 4090 (24 GB) tendria espacio suficiente tras una conversion de formato, aunque dicha conversion no esta incluida.
- Opciones de despliegue: MLX / mlx-lm (libreria declarada); el uso de vLLM, llama.cpp, Ollama o TGI requeriria conversion previa de los pesos y no esta soportado de forma nativa por este checkpoint.
- Latencia y throughput: no disponibles. La cabeza MTP esta disenada para acelerar la decodificacion, pero no se publican mediciones de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / runtime | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3.5-9B-heretic-oQ6e-mtp (este) | 9.653B (8.954B LM + 0.456B vision + 0.243B MTP) | no disponible | safetensors / MLX, ~7.17 bits/peso | no disponible | Cuantizacion mixta oQ, variante heretic, MTP integrado |
| Qwen3.5-9B (base) | ~9.6B (segun el desglose de este checkpoint) | no disponible | safetensors BF16 | no disponible en esta ficha | Referencia sin cuantizar; sin MTP-heretic aplicado |
| Cuantizaciones uniformes 8-bit de modelos ~9B | ~9B | depende del modelo base | GGUF / MLX / safetensors | depende del modelo base | Ocupan mas memoria que este checkpoint (~9-10 GB) con precision homogenea |
| Cuantizaciones uniformes 4-bit de modelos ~9B | ~9B | depende del modelo base | GGUF / MLX | depende del modelo base | Ocupan menos (~5-6 GB) pero degradan mas las capas sensibles |

La comparativa es estructural: no hay datos de rendimiento publicados para este checkpoint, por lo que no es posible comparar calidad frente a las alternativas. La ventaja diferencial es la precision mixta (preserva en BF16 el 5% de pesos mas sensibles) y la inclusion de vision y MTP en un paquete de 8.06 GiB.

## Limitaciones y advertencias

- Licencia no especificada: no se puede confirmar si el uso comercial esta permitido; es imprescindible verificar la licencia del modelo base Qwen3.5-9B antes de cualquier despliegue en produccion.
- La variante "heretic" reduce deliberadamente los rechazos del modelo; esto puede aumentar la probabilidad de respuestas a peticiones que el modelo original denegaria y traslada al operador la responsabilidad de filtrar contenido.
- La cuantizacion a 6 bits en el 85% de los pesos introduce perdida de precision frente al BF16; no se han publicado evaluaciones que cuantifiquen esa degradacion.
- Riesgo de alucinacion inherente a los modelos de lenguaje de ~9B, agravado por la cuantizacion y por la ausencia de benchmarks que validen la calidad tras la compresion.
- Idiomas soportados no documentados: no se puede garantizar un rendimiento aceptable fuera de los idiomas principales del modelo base.
- Longitud de contexto no disponible: no se debe asumir ninguna ventana concreta sin consultar la model card del Qwen3.5-9B original.
- Formato MLX exclusivo: no es directamente utilizable en CUDA, ROCm ni en la mayoria de servidores de inferencia estandar sin conversion.
- Repositorio con 0 descargas y 0 likes: no hay evidencia de uso en produccion ni de validacion por parte de la comunidad.
- El autor es un particular (bambocher), no el equipo oficial de Qwen; la trazabilidad del proceso de cuantizacion depende de la documentacion de oMLX v0.7.3.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/bambocher/Qwen3.5-9B-heretic-oQ6e-mtp
- Herramienta de cuantizacion oQ / oMLX: https://github.com/jundot/omlx
- Modelo base Qwen3.5-9B: no disponible en la informacion proporcionada
- Paper o documentacion de la variante heretic: no disponible en la informacion proporcionada
- Demos o repositorios adicionales: no disponibles en la informacion proporcionada
