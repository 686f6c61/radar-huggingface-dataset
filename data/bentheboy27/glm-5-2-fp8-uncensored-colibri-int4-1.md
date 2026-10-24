# BenTheBoy27/GLM-5.2-FP8-Uncensored-Colibri-Int4-1

## Resumen

GLM-5.2-FP8-Uncensored-Colibri-Int4-1 es una conversión a int4 compatible con Colibri del modelo zandenAI/GLM-5.2-FP8-Uncensored, publicada por el usuario BenTheBoy27. No se trata de un checkpoint estándar de Transformers, vLLM, SGLang, AWQ ni GGUF: los tensores usan el contenedor safetensors y el layout de cuantización propios de Colibri, por lo que solo puede cargarse con ese motor de inferencia en C (JustVugg/colibri). El modelo base pertenece a la familia GLM-5.2, con arquitectura de mezcla de expertos (MoE) y atención dispersa según la etiqueta `glm_moe_dsa`, e incorpora una cabeza MTP para decodificación especulativa.

La relevancia de esta conversión es de infraestructura: Colibri mantiene la parte densa del modelo en RAM y transmite los expertos enrutados desde almacenamiento local, lo que permite ejecutar un MoE de gran tamaño en hardware con VRAM limitada a costa de exigir almacenamiento rápido (NVMe). El repositorio ocupa 384 GB, un dato que da idea de la escala del modelo original, aunque no se especifican el número de parámetros totales ni los activos.

Al estar etiquetado como "Uncensored", el modelo fuente ha sido sometido a un proceso de ablación de alineamiento de seguridad, lo que implica que puede generar contenido que los modelos alineados rechazarían. La licencia declarada es MIT, tanto en el modelo fuente como en esta conversión.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (mezcla de expertos) con atencion dispersa, etiqueta `glm_moe_dsa`, y cabeza MTP para decodificacion especulativa |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int4 row-wise (expertos enrutados y lineales ordinarios), int8 (embeddings de tokens, LM head, indexador DSA y cabeza MTP), FP32 (normas y pesos de routing) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors con contenedor y layout propietario de Colibri (`out-*.safetensors`, `out-idx-*.safetensors`, `out-mtp-*.safetensors`) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura de la familia GLM-5.2, descrita por el autor mediante la etiqueta `glm_moe_dsa`: un transformer de mezcla de expertos con atención dispersa (DSA) y una cabeza de predicción multi-token (MTP) destinada a la decodificación especulativa. El repositorio incluye tres grupos de tensores diferenciados: los shards principales del modelo (`out-*.safetensors`), los pesos del indexador DSA / IndexShare (`out-idx-*.safetensors`) y la cabeza MTP (`out-mtp-*.safetensors`); los tres son necesarios para una conversión completa.

El proceso de conversión parte de los tensores FP8 del modelo fuente, los desquantiza y los recuantiza al formato de Colibri: int4 por filas para expertos enrutados y capas lineales, int8 para embeddings, LM head, indexador DSA y cabeza MTP, y FP32 para normas y pesos de routing. No se proporcionan datos sobre el número de tokens de entrenamiento, la composición del dataset ni el proceso de alineamiento (RLHF/DPO) del modelo original; el sufijo "Uncensored" indica que el modelo fuente fue modificado para reducir sus restricciones de seguridad, pero no se detalla la metodología de esa ablación.

## Capacidades

- Generación de texto autoregresiva (pipeline `text-generation`).
- Razonamiento y conversación multi-turno, asumiendo las capacidades heredadas de GLM-5.2 (no verificadas en la información disponible).
- Decodificación especulativa mediante cabeza MTP, orientada a reducir la latencia de generación.
- Atención dispersa (DSA) para gestionar contextos largos de forma eficiente en cómputo, según la arquitectura declarada.
- Ejecución con streaming de expertos desde disco, lo que habilita el despliegue en entornos con VRAM limitada.
- Generación sin filtros de alineamiento de seguridad (variante "Uncensored").
- Soporte de tool calling, agentes, visión, audio o modo "thinking": no disponible en la información proporcionada.

## Casos de uso

- Inferencia de un MoE de gran escala en estaciones de trabajo con una sola GPU: Colibri mantiene la parte densa en RAM y transmite los expertos desde un NVMe local, permitiendo ejecutar el modelo sin disponer de la VRAM agregada que exigiría un despliegue convencional.
- Investigación sobre cuantización extrema: el layout int4/int8/FP32 de Colibri sirve como banco de pruebas para estudiar el impacto de la cuantización por filas en la calidad de un MoE.
- Evaluación de decodificación especulativa: la cabeza MTP incluida permite medir la aceleración obtenida frente a decodificación autoregresiva estándar.
- Experimentación con modelos sin alineamiento: útil en entornos de investigación de seguridad para estudiar el comportamiento de modelos ablacionados y diseñar filtros externos.
- Despliegue en clústeres con almacenamiento compartido: al transmitir los expertos desde disco, el modelo puede servirse desde un sistema de ficheros en red de baja latencia en lugar de replicar los pesos en VRAM por nodo.
- Reproducción de pipelines de conversión FP8 → int4: el repositorio documenta el flujo de desquantización y recuantización, sirviendo de referencia para convertir otros checkpoints GLM al formato Colibri.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Tamano del repositorio: 384 GB; es necesario descargar el repositorio completo (modelo, indexador DSA y cabeza MTP).
- Almacenamiento: se recomienda NVMe local rapido, ya que Colibri transmite los shards de expertos desde disco durante la inferencia; un disco lento limita directamente el throughput.
- RAM: debe alojar la parte densa del modelo mas los buffers de trabajo; la cantidad exacta no esta disponible.
- VRAM: no disponible; el diseno de Colibri reduce el requisito de VRAM al delegar los expertos enrutados al almacenamiento, pero se desconoce el minimo para la parte densa.
- GPU recomendadas: no disponible. El motor Colibri es una implementacion en C; las GPU compatibles no se detallan en la informacion proporcionada.
- Opciones de despliegue: exclusivamente el motor Colibri (JustVugg/colibri). No es compatible con vLLM, SGLang, TGI, llama.cpp, Ollama, AWQ ni GGUF, y `AutoModelForCausalLM.from_pretrained()` no puede cargarlo.
- Latencia y throughput: no disponible; dependen criticamente de la velocidad del almacenamiento y del ancho de banda de memoria del sistema.

## Comparativa con modelos similares

| Modelo | Formato | Cuantizacion | Tamano | Licencia | Compatibilidad |
|---|---|---|---|---|---|
| BenTheBoy27/GLM-5.2-FP8-Uncensored-Colibri-Int4-1 | safetensors Colibri | int4 / int8 / FP32 | 384 GB (repo) | MIT | Solo Colibri |
| jlnsrk/GLM-5.2-colibri-int4 (modelo base de esta conversion) | safetensors Colibri | int4 | no disponible | no disponible | Solo Colibri |
| zandenAI/GLM-5.2-FP8-Uncensored (modelo fuente) | safetensors FP8 | FP8 | no disponible | MIT | Stacks FP8 habituales |
| GLM-5.2 original (familia) | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparacion con alternativas de otros fabricantes (por ejemplo, otros MoE de gran escala) no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- Compatibilidad restringida: no funciona con Transformers, vLLM, SGLang, AWQ, GGUF, TGI, llama.cpp ni Ollama; requiere el motor Colibri y su procedimiento de compilacion y ejecucion.
- Dependencia del almacenamiento: al transmitir expertos desde disco, el rendimiento queda limitado por la velocidad del NVMe; un almacenamiento lento degrada gravemente la latencia.
- Modelo "Uncensored": la ablacion de alineamiento de seguridad reduce los rechazos ante peticiones daninas, lo que supone un riesgo elevado de generar contenido toxico, ilegal o danino si no se aplican filtros externos.
- Riesgo de alucinacion: inherente a los modelos de lenguaje; no se dispone de evaluaciones especificas para esta conversion.
- Idiomas soportados: no especificados; no puede confirmarse un rendimiento adecuado en castellano ni en otros idiomas distintos del ingles.
- Longitud de contexto: no disponible; no puede verificarse el comportamiento en contextos largos pese a la atencion dispersa declarada.
- Trazabilidad: es una conversion independiente, no una publicacion oficial de Z.ai, NVIDIA ni Hugging Face; no hay garantias de soporte ni de mantenimiento.
- Licencia MIT declarada por el autor sobre la base del modelo fuente, pero se recomienda revisar los terminos del modelo original y de las dependencias (GLM-5.2, runtime Colibri) antes de un uso comercial.
- Sin descargas ni "likes" en el momento de la ficha, lo que implica ausencia de validacion por parte de la comunidad.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/BenTheBoy27/GLM-5.2-FP8-Uncensored-Colibri-Int4-1
- Modelo fuente (FP8 Uncensored): https://huggingface.co/zandenAI/GLM-5.2-FP8-Uncensored
- Modelo base de la conversion (int4): https://huggingface.co/jlnsrk/GLM-5.2-colibri-int4
- Runtime Colibri: https://github.com/JustVugg/colibri
- Instrucciones de compilacion y ejecucion de Colibri: https://github.com/JustVugg/colibri#readme
- DOI asociado: 10.57967/hf/11236
