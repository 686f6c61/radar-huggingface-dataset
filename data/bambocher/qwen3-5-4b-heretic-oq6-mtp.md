# bambocher/Qwen3.5-4B-heretic-oQ6-mtp

## Resumen

Qwen3.5-4B-heretic-oQ6-mtp es una cuantizacion mixta del modelo Qwen3.5-4B, publicada por el usuario bambocher en Hugging Face. El checkpoint se ha generado con la herramienta oQ (oMLX v0.7.3), que aplica cuantizacion de precision mixta capa a capa para reducir el peso del modelo manteniendo un equilibrio entre tamano y fidelidad numerica. El resultado es un checkpoint de 4.660 millones de parametros logicos que ocupa 4.009 GiB en disco, con un promedio efectivo de 7,390 bits por peso.

El modelo base Qwen3.5-4B pertenece a la familia Qwen3.5 de Alibaba, aunque la model card no incluye informacion sobre arquitectura, contexto ni datos de entrenamiento del modelo original. La cuantizacion conserva tres componentes diferenciados: el modelo de lenguaje (4,206B parametros), un modulo de vision (0,334B) y una cabeza MTP (Multi-Token Prediction, 0,121B), lo que sugiere que el modelo base es multimodal y soporta decodificacion especulativa mediante prediccion de multiples tokens.

La relevancia de este checkpoint es practica: ofrece un modelo de 4B con vision y MTP en un formato MLX optimizado para Apple Silicon, con un tamano de 4,3 GB que cabe en la memoria unificada de un Mac moderno. La licencia no esta declarada en el repositorio, lo que constituye una limitacion importante para uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.5), con modulo de vision y cabeza MTP; detalles no disponibles |
| Parametros totales | 4.659.865.088 (4,660B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Cuantizacion mixta oQ: affine 6-bit grupo 64 (83,48% de pesos), affine 8-bit grupo 64 (9,06%), BF16 (7,46%); promedio efectivo 7,390 bits/peso |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (libreria mlx) |

## Arquitectura y entrenamiento

La model card no describe la arquitectura del modelo base Qwen3.5-4B ni sus datos de entrenamiento. Lo que si se puede inferir del checkpoint cuantizado es su composicion interna: un modelo de lenguaje de 4,206B parametros, un modulo de vision de 0,334B y una cabeza MTP de 0,121B. La presencia de un modulo de vision confirma que el modelo base es multimodal, y la cabeza MTP indica soporte para prediccion de multiples tokens, una tecnica de decodificacion especulativa que acelera la generacion al proponer varios tokens por paso y validarlos en paralelo.

La cuantizacion aplicada por oQ es de precision mixta: el 83,48% de los pesos (3,890B) se almacenan en affine 6-bit con grupo de 64, el 9,06% (0,422B) en affine 8-bit con grupo de 64, y el 7,46% (0,348B) se mantiene en BF16 sin cuantizar. Esta distribucion sugiere que las capas mas sensibles (probablemente embeddings, cabezas de salida o capas del modulo de vision) conservan mayor precision, mientras que el grueso de las capas del transformer se comprime a 6 bits. El desglose de almacenamiento es: modelo de lenguaje 3,523 GB, vision 0,667 GB y cabeza MTP 0,115 GB, para un total de 4,304 GB (4,009 GiB).

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO en el modelo base.

## Capacidades

- Generacion de texto y razonamiento: capacidades heredadas del modelo base Qwen3.5-4B, aunque no se detallan en la model card.
- Vision: el checkpoint incluye un modulo de vision de 0,334B parametros, lo que implica soporte para entrada de imagenes (comprension visual).
- Prediccion de multiples tokens (MTP): la cabeza MTP de 0,121B permite decodificacion especulativa, acelerando la inferencia.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Modo thinking: no disponible en la informacion proporcionada.

## Casos de uso

- Inferencia local en Apple Silicon: el checkpoint en formato MLX (4,3 GB) esta disenado para ejecutarse en Macs con memoria unificada, permitiendo desplegar un modelo de 4B con vision sin GPU dedicada. Adecuado para desarrolladores que trabajan en portatiles Mac y necesitan un modelo multimodal local.
- Prototipado de aplicaciones multimodales: el modulo de vision integrado permite construir demos de descripcion de imagenes, extraccion de texto de capturas o analisis de documentos visuales en local, sin depender de APIs externas.
- Aceleracion de generacion con MTP: la cabeza de prediccion de multiples tokens permite reducir la latencia en tareas de generacion larga, como resumen de documentos o generacion de codigo, al proponer y validar varios tokens por paso.
- Experimentacion con cuantizacion mixta: el checkpoint sirve como referencia para estudiar el impacto de la precision mixta (6-bit, 8-bit y BF16) en la calidad de salida de un modelo de 4B, comparando con el modelo original sin cuantizar.
- Asistentes de escritorio offline: al caber en memoria unificada de un Mac, el modelo puede integrarse en aplicaciones de escritorio que requieran privacidad total, procesando texto e imagenes sin enviar datos a la nube.
- Investigacion en eficiencia de inferencia: la combinacion de cuantizacion oQ y MTP ofrece un caso de estudio para medir throughput y calidad en hardware Apple frente a alternativas GGUF o GPTQ en GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria estimada para inferencia: aproximadamente 4,3 GB de almacenamiento para los pesos; la memoria en ejecucion sera algo superior por el estado de activaciones y cache KV, aunque no se dispone de cifras exactas.
- GPU recomendadas: el formato MLX esta optimizado para Apple Silicon (series M1, M2, M3, M4). No esta pensado para GPU NVIDIA o AMD en su formato actual.
- Cabe en consumer GPU: no aplica directamente; cabe en la memoria unificada de cualquier Mac con 8 GB o mas, aunque se recomienda 16 GB para margen con contexto largo y vision.
- Opciones de despliegue: MLX (libreria nativa), oMLX. No se indica compatibilidad con vLLM, llama.cpp, Ollama o TGI en el repositorio.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Vision | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Qwen3.5-4B-heretic-oQ6-mtp | 4,660B | no disponible | Si | MLX safetensors | no disponible | Hugging Face |
| Qwen3.5-4B (base) | ~4B | no disponible | Si (presumible) | safetensors | no disponible | Hugging Face (Qwen) |
| Qwen2.5-VL-3B | ~3B | 32k (tipico en la familia) | Si | safetensors, GGUF | Apache 2.0 (familia Qwen2.5) | Hugging Face |
| Llama-3.2-3B | 3,2B | 128k | No | safetensors, GGUF | Llama 3.2 Community | Hugging Face |

Nota: los datos de Qwen2.5-VL-3B y Llama-3.2-3B corresponden a conocimiento general de esas familias; no se dispone de comparacion directa con benchmarks del modelo aqui descrito.

## Limitaciones y advertencias

- Licencia no declarada: el repositorio no especifica licencia, lo que impide determinar si el uso comercial esta permitido. Es un bloqueo para produccion hasta que el autor lo aclare.
- Trazabilidad limitada: el autor (bambocher) no es el desarrollador original de Qwen3.5; se trata de una cuantizacion de terceros sin garantias de fidelidad respecto al modelo base.
- Sin benchmarks: no hay evaluacion publicada del impacto de la cuantizacion mixta en la calidad de salida, por lo que se desconoce la degradacion respecto al modelo original.
- Cero adopcion: 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en produccion ni reportes de la comunidad.
- Riesgo de alucinacion: inherente a los modelos de lenguaje de 4B; la cuantizacion a 6 bits puede amplificarlo en tareas de razonamiento complejo.
- Limitaciones de contexto e idioma: no se especifican, por lo que no se puede garantizar un rendimiento multilingue ni una ventana de contexto concreta.
- Dependencia de hardware Apple: el formato MLX limita el despliegue a ecosistema Apple Silicon; no es portable a servidores NVIDIA sin reconversion.
- Fecha de creacion futura (2026-11-12): el metadato del repositorio indica una fecha posterior a la actual, lo que sugiere un posible error de publicacion o un repositorio de prueba; conviene verificar la integridad antes de usarlo.

## Enlaces

- Hugging Face: https://huggingface.co/bambocher/Qwen3.5-4B-heretic-oQ6-mtp
- Herramienta de cuantizacion oQ (oMLX): https://github.com/jundot/omlx
- Modelo base Qwen3.5 (familia Qwen): no disponible enlace directo en la informacion proporcionada
