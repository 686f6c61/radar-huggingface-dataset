# Nidhal101/A.X-K2-NVFP4-CLEER-k8

## Resumen

A.X-K2-NVFP4-CLEER-k8 es una variante cuantizada del modelo skt/A.X-K2-NVFP4, publicada por el usuario Nidhal101 (Nidhal Jegham) en Hugging Face. Se trata de un checkpoint de 36.265.499.360 parametros (aproximadamente 36,3 mil millones) almacenado en formato safetensors con cuantizacion de 8 bits, generado mediante la herramienta NVIDIA ModelOpt (tag `modelopt`) y etiquetado con el identificador propio `axk2`. El repositorio ocupa 29,4 GB y se distribuye bajo licencia Apache 2.0, heredada del modelo base.

El modelo deriva de la familia A.X de SK Telecom (skt/A.X-K2), de la que este checkpoint toma los pesos en su variante NVFP4 (formato de punto flotante de 4 bits de NVIDIA) y los reempaqueta en una version de 8 bits con un esquema que el autor denomina "CLEER-k8". La model card es minima: unicamente declara la licencia y el modelo base, sin documentar el proceso de cuantizacion, los datos de calibracion ni los resultados de evaluacion. No se dispone de informacion sobre arquitectura interna, contexto, idiomas o capacidades en la documentacion publicada.

La relevancia de esta ficha es acotada: se trata de un artefacto de cuantizacion de un modelo coreano de gran tamano, con cero descargas y cero likes en el momento de la consulta, y sin model card tecnica. Resulta util como referencia para quien ya conozca A.X-K2 y busque una version de menor huella en memoria, pero no constituye una publicacion con garantias documentadas de calidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (derivada de skt/A.X-K2-NVFP4; no documentada en la model card) |
| Parametros totales | 36.265.499.360 (36,3 B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8 bits (tag `8-bit`, generado con NVIDIA ModelOpt); el modelo base usa NVFP4 (4 bits) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (tag `modelopt`, `axk2`) |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura del modelo en la documentacion proporcionada. El tag `axk2` sugiere pertenencia a la familia A.X de SK Telecom, pero la model card no especifica si se trata de un transformer denso, un mixture of experts (MoE) o una arquitectura hibrida, ni detalla el numero de capas, dimensiones ocultas o mecanismo de atencion. Tampoco se documenta el volumen de tokens de entrenamiento, la composicion del corpus ni si se aplicaron tecnicas de alineacion como RLHF o DPO.

Lo unico verificable es el proceso de cuantizacion: el checkpoint parte de skt/A.X-K2-NVFP4, un modelo cuantizado en formato NVFP4 (punto flotante de 4 bits con escala compartida, disenado para las GPU Blackwell de NVIDIA), y lo transforma en una version de 8 bits mediante ModelOpt. El sufijo "CLEER-k8" no aparece explicado en la model card, por lo que se desconoce si designa un esquema de calibracion concreto, una seleccion de capas o un reempaquetado de bloques. No hay informacion sobre decodificacion especulativa, atencion lineal ni otras innovaciones tecnicas.

## Capacidades

- No se han documentado capacidades especificas en la model card del checkpoint.
- Se desconoce si el modelo soporta tool calling o function calling.
- Se desconoce si soporta razonamiento multi-paso o uso como agente.
- Se desconoce su cobertura multilingue; el modelo base podria estar orientado al coreano y al ingles, pero no hay confirmacion.
- Se desconoce si dispone de modo de razonamiento explicito (thinking mode), vision o audio.
- La unica capacidad implicita es la generacion de texto propia del modelo base, sujeta a las posibles perdidas de calidad introducidas por la cuantizacion a 8 bits.

## Casos de uso

- Evaluacion de cuantizacion: comparar la salida de este checkpoint de 8 bits con la del modelo base NVFP4 para medir la degradacion introducida por el reempaquetado, usando un conjunto fijo de prompts y metricas de perplejidad.
- Despliegue en memoria reducida: servir el modelo en una GPU con menos VRAM que la requerida por el checkpoint original en FP4 o BF16, aprovechando los 29,4 GB del repositorio.
- Pruebas de integracion con ModelOpt: validar que las herramientas de NVIDIA ModelOpt cargan correctamente los pesos y aplican las transformaciones esperadas en un pipeline de cuantizacion.
- Experimentacion academica con modelos coreanos: estudiar el comportamiento de la familia A.X de SK Telecom en tareas de procesamiento de lenguaje natural en coreano, si el modelo base lo soporta.
- Benchmarking interno de infraestructura: medir latencia y throughput de un modelo de 36 B en 8 bits sobre GPUs Blackwell o Hopper como referencia para planificacion de capacidad.
- Base para cuantizaciones posteriores: partir de este checkpoint para generar versiones GGUF o de 4 bits orientadas a llama.cpp u Ollama, aunque requeriria validar primero la fidelidad de los pesos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 36,3 B de parametros en 8 bits, los pesos ocupan aproximadamente 36 GB; sumando cache KV y overhead, se recomienda un minimo de 48 GB de VRAM.
- GPU recomendadas: A100 80 GB, H100 80 GB, H200 o GPU Blackwell (B200) por la compatibilidad nativa con formatos NVFP4 del modelo base.
- GPU de consumo: no cabe en RTX 4090 (24 GB) ni en RTX 3090 (24 GB) sin offloading a CPU o cuantizacion adicional a 4 bits.
- Opciones de despliegue: vLLM y TensorRT-LLM son las opciones mas plausibles dado el formato ModelOpt; llama.cpp y Ollama requeririan conversion previa a GGUF, no documentada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Nidhal101/A.X-K2-NVFP4-CLEER-k8 | 36,3 B | no disponible | 8 bits (ModelOpt) | Apache 2.0 | Hugging Face, 0 descargas |
| skt/A.X-K2-NVFP4 (modelo base) | no disponible | no disponible | NVFP4 (4 bits) | Apache 2.0 (segun derivado) | Hugging Face |
| Nidhal101/Kimi-K2.6-FP8-BLOCK-pruned-8experts | 33 B | no disponible | FP8 | no disponible | Hugging Face, 2 descargas |

La comparativa se limita a los artefactos del mismo autor y al modelo base, ya que no se dispone de datos de rendimiento que permitan contrastar con alternativas de la misma categoria.

## Limitaciones y advertencias

- La model card no documenta el proceso de cuantizacion, la calibracion ni las metricas de degradacion; no hay garantia de que la calidad se mantenga respecto al modelo base.
- El sufijo "CLEER-k8" no esta explicado, lo que impide reproducir el pipeline de generacion del checkpoint.
- Riesgo de alucinacion y sesgos: no evaluados ni documentados para este checkpoint.
- Cobertura idiomatica desconocida; si el modelo base esta centrado en coreano, el rendimiento en castellano podria ser limitado.
- La licencia Apache 2.0 permite uso comercial, pero el autor remite a la licencia del modelo base; conviene verificar que skt/A.X-K2-NVFP4 no imponga restricciones adicionales.
- El repositorio tiene cero descargas y cero likes, sin validacion por parte de la comunidad.
- No se dispone de plantilla de chat ni de tokenizer documentados en la informacion proporcionada, lo que complica la integracion en produccion.

## Enlaces

- Hugging Face del modelo: https://huggingface.co/Nidhal101/A.X-K2-NVFP4-CLEER-k8
- Modelo base: https://huggingface.co/skt/A.X-K2-NVFP4
- Perfil del autor: https://huggingface.co/Nidhal101
- Otro modelo del autor: https://huggingface.co/Nidhal101/Kimi-K2.6-FP8-BLOCK-pruned-8experts
