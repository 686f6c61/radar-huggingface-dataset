# bambocher/Qwen3.5-4B-heretic-oQ2.5-mtp

## Resumen

Qwen3.5-4B-heretic-oQ2.5-mtp es una cuantizacion mixta del modelo Qwen3.5-4B, publicada por el usuario bambocher en Hugging Face. No se trata de un modelo entrenado desde cero, sino de un checkpoint derivado del Qwen3.5-4B original (desarrollado por Alibaba Qwen) al que se le ha aplicado una cuantizacion de precision mixta mediante la herramienta oQ (oMLX v0.7.3) y un ajuste de tipo "heretic" (eliminacion de rechazos o alineacion laxa) del que la model card no ofrece detalles tecnicos.

El checkpoint tiene 4.659.865.088 parametros totales (4,66 mil millones), lo que incluye el modelo de lenguaje (4,206B), un modulo de vision (0,334B) y una cabeza MTP (multi-token prediction, 0,121B). La cuantizacion emplea un esquema mixto con pesos que van desde 3 bits hasta BF16, con un promedio efectivo de 4,394 bits por peso y un almacenamiento total de 2,56 GB, lo que lo hace atractivo para inferencia en hardware Apple Silicon mediante MLX.

El modelo resulta relevante para desarrolladores que necesitan ejecutar un modelo multimodal de ~4,7B parametros con contexto largo y decodificacion especulativa (via MTP) en equipos con memoria unificada limitada. Sin embargo, la informacion publicada es extremadamente escasa: no hay model card del modelo base, no se especifican benchmarks, licencia, idiomas ni contexto, y el repositorio no tiene descargas ni likes, lo que indica que es una publicacion reciente y sin validacion comunitaria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal con cabeza MTP (multi-token prediction); arquitectura Qwen3.5 (detalles no disponibles) |
| Parametros totales | 4.659.865.088 (4,66B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Mixta: affine 3-bit (group 128 y 64), 4-bit, 5-bit, 6-bit (group 64) y BF16; promedio efectivo 4,394 bits/peso |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (libreria MLX) |
| Tamano del repositorio | 2,6 GB (2,384 GiB de pesos) |
| Desglose de componentes | LM: 4,206B (1,806 GB); Vision: 0,334B (0,667 GB); MTP head: 0,121B (0,087 GB) |
| Distribucion de bits | 3-bit g128: 70,573% de pesos; 3-bit g64: 13,642%; 5-bit g64: 5,401%; BF16: 7,459%; 4-bit g64: 2,869%; 6-bit g64: 0,056% |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del Qwen3.5-4B, un transformer multimodal (lenguaje + vision) con una cabeza adicional de prediccion multi-token (MTP). La presencia de MTP sugiere que el modelo base incorpora decodificacion especulativa nativa, una tecnica que permite generar varios tokens por paso y acelerar la inferencia. El modulo de vision (0,334B parametros) indica capacidad de procesamiento de imagenes, aunque la model card no detalla el encoder visual ni la resolucion soportada.

No se dispone de informacion sobre el entrenamiento del modelo base: numero de tokens, composicion del dataset, uso de RLHF/DPO, ni detalles sobre el ajuste "heretic" aplicado. La cuantizacion se realizo con oQ (oMLX v0.7.3), que asigna precision variable por capa: la mayor parte de los pesos (84,2%) se almacena a 3 bits, mientras que un 7,46% se mantiene en BF16 (probablemente capas de normalizacion, embeddings o cabezas criticas) y el resto en 4-6 bits. Este esquema busca preservar calidad en capas sensibles mientras reduce el tamano total a 2,56 GB.

## Capacidades

- Generacion de texto y razonamiento: heredadas del Qwen3.5-4B base (no verificadas en esta cuantizacion).
- Procesamiento de vision: incluye un modulo visual de 0,334B parametros, lo que sugiere capacidad de entender imagenes (no se detalla el tipo de tareas).
- Decodificacion especulativa: la cabeza MTP permite generar multiples tokens por paso, reduciendo latencia en inferencia autoregresiva.
- Tool calling / function calling: no disponible en la informacion proporcionada (probablemente heredado del base, sin confirmar).
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Modo "thinking": no disponible.
- Ajuste "heretic": el nombre sugiere eliminacion de rechazos o reduccion de alineacion de seguridad, pero no se documenta el metodo ni el alcance.

## Casos de uso

- Inferencia local en Apple Silicon: el formato MLX y el tamano de 2,56 GB permiten ejecutar el modelo en Macs con 8-16 GB de memoria unificada, ideal para prototipado offline sin GPU dedicada.
- Asistentes multimodales en dispositivo: el modulo de vision permite procesar imagenes junto con texto en aplicaciones de escritorio o moviles con MLX, sin enviar datos a la nube.
- Generacion de texto con baja latencia: la cabeza MTP acelera la decodificacion, adecuada para chatbots interactivos donde la latencia por token es critica.
- Experimentacion con cuantizacion mixta: util para investigadores que quieran evaluar el impacto de esquemas 3-6 bits en calidad y velocidad frente al modelo original en BF16.
- Prototipos de agentes con tool calling: si el base soporta function calling, esta cuantizacion permite desplegar agentes ligeros en entornos con memoria limitada (requiere validacion).
- Fine-tuning ligero o LoRA sobre MLX: el checkpoint cuantizado puede servir como base para adaptaciones de bajo rango en flujos MLX, aunque la cuantizacion complica el entrenamiento directo.
- Evaluacion de modelos "heretic": util para estudiar el comportamiento de modelos con alineacion reducida en tareas de generacion abierta (con las advertencias de seguridad correspondientes).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria estimada: ~2,6 GB para los pesos en el formato cuantizado; con overhead de MLX y cache KV, se recomienda al menos 4-6 GB de memoria unificada.
- GPU recomendadas: Apple Silicon (M1/M2/M3/M4) con MLX; no se garantiza compatibilidad con CUDA sin conversion previa a otro formato.
- Cabe en consumer GPU: si, en GPUs con >=6 GB de VRAM tras conversion a GGUF (no incluida en el repo); en Apple Silicon, en equipos con >=8 GB de memoria unificada.
- Opciones de despliegue: MLX (libreria nativa del repo); para otros backends seria necesaria conversion a GGUF (llama.cpp/Ollama) o safetensors estandar (vLLM/TGI), no documentada.
- Latencia y throughput: no disponibles; la cabeza MTP deberia reducir latencia frente a decodificacion estandar, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.5-4B-heretic-oQ2.5-mtp | 4,66B | no disponible | no disponible | MLX safetensors (mixto 3-6 bits) | Multimodal + MTP, cuantizacion agresiva |
| Qwen3.5-4B (base) | ~4,2B (LM) | no disponible | no disponible | safetensors BF16 | Modelo original sin cuantizar; referencia de calidad |
| Qwen2.5-VL-3B | ~3,75B | 32K (tipico en Qwen2.5-VL) | Apache 2.0 (Qwen2.5-VL) | safetensors, GGUF | Alternativa multimodal de tamano similar con licencia conocida |
| Llama-3.2-3B | 3,21B | 128K | Llama 3.2 Community License | safetensors, GGUF | Solo texto; referencia de tamano en consumer hardware |

La comparativa es limitada porque no se dispone de datos de rendimiento del modelo evaluado ni de especificaciones del Qwen3.5-4B base. La licencia del checkpoint derivado es desconocida, lo que impide confirmar compatibilidad comercial.

## Limitaciones y advertencias

- Licencia no disponible: no se puede confirmar el uso comercial ni las restricciones de redistribucion; el modelo base Qwen3.5 probablemente tenga su propia licencia que se hereda.
- Cuantizacion agresiva: el 84,2% de los pesos esta a 3 bits, lo que puede degradar calidad en tareas de razonamiento, matematicas o codigo frente al modelo en BF16.
- Ajuste "heretic": el nombre sugiere reduccion de rechazos o alineacion laxa; puede generar contenido inapropiado y no es apto para produccion sin filtros adicionales.
- Sin validacion comunitaria: 0 descargas y 0 likes; no hay evidencia de que el checkpoint funcione correctamente ni de que la cuantizacion preserve la coherencia.
- Idiomas y contexto desconocidos: no se puede planificar su uso multilingue ni con ventanas largas sin pruebas.
- Riesgo de alucinacion: inherente a modelos de ~4B; la cuantizacion puede amplificarlo.
- Compatibilidad limitada: formato MLX restringe el despliegue a ecosistema Apple; la conversion a otros backends no esta documentada ni validada.
- Sesgos: no documentados; se heredan del modelo base y del ajuste heretic, sin evaluacion disponible.

## Enlaces

- Hugging Face: https://huggingface.co/bambocher/Qwen3.5-4B-heretic-oQ2.5-mtp
- Herramienta de cuantizacion oQ (oMLX): https://github.com/jundot/omlx
- Modelo base Qwen3.5-4B: no disponible (no se enlaza en la model card)
- Paper o documentacion de Qwen3.5: no disponible
- Demo o espacio asociado: no disponible
