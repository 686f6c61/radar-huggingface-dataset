# jancirnodziewiaty/gemma-4-E4B-it-oQ4e-mtp

## Resumen

`jancirnodziewiaty/gemma-4-E4B-it-oQ4e-mtp` es una versión cuantizada del modelo Gemma 4 E4B instruct, publicada por el usuario jancirnodziewiaty en Hugging Face. Se trata de una conversión en formato MLX (Apple Silicon) realizada con la herramienta oQ (oMLX v0.7.3) mediante cuantización de precisión mixta, con un promedio efectivo de 5,572 bits por peso sobre el checkpoint completo. El checkpoint resultante ocupa 5,6 GB en disco y contiene 8.019.880.782 parámetros lógicos distribuidos entre el modelo de lenguaje, el codificador de visión, el codificador de audio y una cabeza MTP (multi-token prediction).

El modelo base, Gemma 4 E4B, forma parte de la familia Gemma de Google, orientada a modelos abiertos de tamaño medio con capacidades multimodales. La variante "it" indica ajuste para instrucciones. La arquitectura subyacente combina un transformer de lenguaje de 7,469B de parámetros con módulos de visión (0,167B) y audio (0,305B), lo que la convierte en una propuesta multimodal (texto, imagen y audio) dentro de un rango de tamaño que puede ejecutarse en hardware de consumo con suficiente memoria unificada.

La relevancia de esta ficha concreta radica en su formato: es una cuantización mixta optimizada para MLX, lo que permite ejecutar el modelo en Macs con chip Apple Silicon sin necesidad de GPUs dedicadas. No obstante, al tratarse de una publicación de un tercero (no oficial), la información disponible es limitada: no se especifican licencia, idiomas soportados, pipeline ni resultados de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (lenguaje + visión + audio) con cabeza MTP; cuantización mixta oQ |
| Parametros totales | 8.019.880.782 (8,020B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Affine 4-bit group 64 (68,24% de pesos), 5-bit (21,85%), 6-bit (3,02%), 8-bit (0,008%), BF16 (6,87%), I64 (0,003%); promedio efectivo 5,572 bits/peso |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (MLX) |

Desglose de almacenamiento por componente:

| Componente | Pesos logicos | Almacenamiento |
|---|---|---|
| Modelo de lenguaje | 7,469B | 4,482 GB / 4,174 GiB |
| Visión | 0,167B | 0,335 GB / 0,312 GiB |
| Audio | 0,305B | 0,610 GB / 0,568 GiB |
| Cabeza MTP | 0,079B | 0,159 GB / 0,148 GiB |
| **Total** | **8,020B** | **5,586 GB / 5,202 GiB** |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base Gemma 4 E4B, más allá de que se trata de un transformer multimodal con módulos separados de lenguaje, visión y audio, más una cabeza MTP (multi-token prediction). La presencia de esta cabeza sugiere que el modelo base incorpora decodificación especulativa o predicción multi-token como mecanismo de aceleración de inferencia, aunque no se confirman los detalles de implementación.

Sobre el entrenamiento del modelo base (número de tokens, composición del dataset, uso de RLHF/DPO) no se proporciona información en la model card. Lo único documentado es el proceso de cuantización: la herramienta oQ (oMLX v0.7.3) aplica precisión mixta asignando 4 bits a la mayoría de los pesos (68,24%), 5 bits a un 21,85%, 6 bits a un 3,02% y manteniendo en BF16 un 6,87% (probablemente capas sensibles como embeddings, normas o heads). El resultado es un checkpoint de 5,6 GB con un promedio de 5,572 bits/peso.

## Capacidades

- Generación de texto y razonamiento en modo instruct (variante "it").
- Procesamiento de imagen: incluye un codificador de visión de 0,167B de parámetros.
- Procesamiento de audio: incluye un codificador de audio de 0,305B de parámetros.
- Predicción multi-token (cabeza MTP) para acelerar la decodificación.
- Ejecución nativa en Apple Silicon mediante MLX.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Modo thinking explícito: no disponible en la información proporcionada.

## Casos de uso

- Inferencia local en Mac con Apple Silicon: el formato MLX y el tamaño de 5,6 GB permiten cargar el modelo en memoria unificada de un Mac con 16 GB o más, sin GPU dedicada. Adecuado para prototipado y uso personal.
- Asistentes multimodales de escritorio: al incluir codificadores de visión y audio, puede emplearse en aplicaciones que reciben capturas de pantalla, imágenes o fragmentos de audio y generan respuestas de texto, todo en local.
- Procesamiento de documentos con imagen: extracción de información de capturas, formularios o diagramas combinando el módulo de visión con el modelo de lenguaje.
- Transcripción y análisis de audio: el codificador de audio (0,305B) permite integrar el modelo en pipelines de resumen o clasificación de contenido hablado sin depender de servicios en la nube.
- Aceleración de decodificación en producción: la cabeza MTP puede aprovecharse para decodificación especulativa y reducir la latencia en entornos MLX, siempre que el runtime lo soporte.
- Experimentación con cuantización mixta: útil para investigadores que quieran evaluar el impacto de la asignación de bits por capa (4/5/6/8/BF16) en calidad y velocidad frente a cuantizaciones uniformes de 4 bits.
- Despliegue en entornos con requisitos de privacidad: al ejecutarse localmente en MLX, los datos no salen del dispositivo, lo que encaja en escenarios con datos sensibles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: ~5,6 GB para los pesos en disco; en ejecución, el consumo real depende del runtime y del contexto, pero se estima un mínimo práctico de 8-12 GB de memoria unificada.
- GPU recomendadas: Apple Silicon (M1, M2, M3, M4 y variantes Pro/Max/Ultra). El formato MLX no está pensado para GPUs NVIDIA o AMD.
- ¿Cabe en consumer GPU? No en el sentido tradicional (NVIDIA/AMD); sí en Macs con memoria unificada de 16 GB o superior. En GPUs NVIDIA requeriría conversión a otro formato (por ejemplo GGUF), no incluida en este repo.
- Opciones de despliegue: MLX (librería `mlx` / `mlx-lm`), y herramientas compatibles con MLX como `mlx_lm.server`. No se indica compatibilidad con vLLM, llama.cpp, Ollama o TGI en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| gemma-4-E4B-it-oQ4e-mtp (esta ficha) | 8,020B lógicos (5,6 GB) | no disponible | safetensors MLX | no disponible | Hugging Face (0 descargas) |
| Gemma 4 E4B it (base, sin cuantizar) | ~8B | no disponible | safetensors | no disponible en esta ficha | Requiere consultar el repo oficial de Google |
| Otras cuantizaciones MLX 4-bit de Gemma 4 E4B | ~8B | no disponible | safetensors MLX | depende del publicador | Disponibles en Hugging Face (no verificadas) |

No se dispone de datos de rendimiento ni de especificaciones verificadas de los modelos comparables en la información proporcionada, por lo que la comparativa se limita a parámetros y formato.

## Limitaciones y advertencias

- Publicación de terceros: no es una conversión oficial de Google; la calidad de la cuantización mixta no está validada con benchmarks publicados.
- Licencia no especificada: antes de cualquier uso comercial es imprescindible verificar la licencia del modelo base Gemma 4 E4B y la del checkpoint derivado.
- Idiomas no documentados: no se puede asumir cobertura multilingüe sin comprobación empírica.
- Contexto no documentado: se desconoce la ventana máxima soportada por el modelo base y si la cuantización la preserva.
- Riesgo de degradación por cuantización: el 68,24% de los pesos está a 4 bits; tareas sensibles (matemáticas, código, razonamiento largo) pueden degradarse frente al modelo en BF16.
- Riesgo de alucinación: inherente a los modelos de lenguaje; no hay evaluación publicada para esta versión.
- Dependencia de MLX: no es portable directamente a NVIDIA/AMD sin reconversión; limita su uso en servidores GPU convencionales.
- Cero tracción comunitaria: 0 descargas y 0 likes en el momento de la consulta, lo que reduce la validación externa y el soporte.
- Sin información sobre sesgos: no se documentan sesgos conocidos del modelo base ni de la cuantización.

## Enlaces

- Hugging Face: https://huggingface.co/jancirnodziewiaty/gemma-4-E4B-it-oQ4e-mtp
- Herramienta de cuantización oQ (oMLX): https://github.com/jundot/omlx
- Repositorio oficial de Gemma (Google): no disponible en la información proporcionada
- Paper del modelo base: no disponible en la información proporcionada
- Demo: no disponible en la información proporcionada
