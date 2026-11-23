# Recogment/qwen3.8-27b-gguf

## Resumen

Recogment/qwen3.8-27b-gguf es una cuantizacion GGUF en formato Q4_K_M del modelo Qwen/Qwen3.8-27B, publicada por el usuario Recogment como espejo de un unico fichero para el modelo de lenguaje on-device de su aplicacion. No se trata de un modelo nuevo ni de un fine-tuning: es una conversion a GGUF realizada a partir de la version UD-Q4_K_M publicada por unsloth, con una modificacion estructural concreta (eliminacion del bloque de prediccion multi-token) para que sea compatible con la version de llama.cpp que integra la aplicacion.

El modelo base pertenece a la familia Qwen3.8 de Alibaba Cloud, con 26.895.998.464 parametros totales (aproximadamente 27B) y licencia Apache 2.0. El fichero GGUF ocupa 16.213.250.016 bytes (unos 16,2 GB) y contiene 851 tensores tras eliminar los 15 tensores del bloque NextN/MTP. La model card no proporciona informacion sobre arquitectura detallada, longitud de contexto, idiomas soportados ni datos de entrenamiento del modelo base.

La relevancia de esta publicacion es fundamentalmente practica: ofrece un fichero verificado byte a byte mediante SHA-256, reproducible de forma determinista, y documenta con precision los cambios realizados respecto al original. Es util para desarrolladores que necesiten desplegar el modelo en llama.cpp con versiones que aun no soportan el bloque MTP de esta arquitectura, pero no aporta informacion tecnica adicional sobre el modelo subyacente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.8; detalles no disponibles) |
| Parametros totales | 26.895.998.464 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (UD-Q4_K_M de unsloth) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (fichero unico, 16.213.250.016 bytes, 851 tensores) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base Qwen/Qwen3.8-27B mas alla de que pertenece a la familia Qwen3.8 y que incorpora un bloque de prediccion multi-token (NextN / MTP) utilizado como ayuda para decodificacion especulativa. Segun la model card, ese bloque no se lee en el forward pass normal. El fichero GGUF modificado elimina dicho bloque: reduce `qwen35.block_count` de 65 a 64, elimina la clave `qwen35.nextn_predict_layers` y suprime los 15 tensores asociados, pasando de 866 a 851 tensores. El resto de tensores se copia sin cambios, con offsets reempaquetados a alineacion de 32 bytes.

No hay informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF, DPO u otras. La cuantizacion Q4_K_M se realizo previamente en el repositorio de unsloth y este repositorio no recuantiza ni modifica pesos: solo elimina el bloque MTP de forma determinista (reproducible byte a byte, verificado el 2026-11-23).

## Capacidades

- Generacion de texto conversacional (tag `conversational` en el repositorio).
- Compatibilidad con endpoints (tag `endpoints_compatible`).
- Decodificacion especulativa mediante bloque MTP en el modelo original; en este fichero GGUF dicho bloque ha sido eliminado, por lo que esa capacidad no esta disponible en esta version.
- Capacidades de razonamiento, codigo, matematicas, tool calling, agentes o vision: no disponibles en la informacion proporcionada.
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Inferencia on-device en aplicaciones de escritorio o moviles: el fichero GGUF de 16,2 GB esta pensado para integrarse en la aplicacion de Recogment mediante llama.cpp, con un fichero verificado por SHA-256 que garantiza integridad en la descarga.
- Despliegue en llama.cpp con versiones antiguas: la eliminacion del bloque MTP permite cargar el modelo en builds de llama.cpp que aun no soportan `nextn_predict_layers` en la arquitectura Qwen3.5/3.8.
- Servidores de inferencia ligeros: al ser un unico fichero GGUF Q4_K_M, puede servirse con llama.cpp server o herramientas compatibles en entornos con recursos limitados.
- Prototipado de asistentes conversacionales: el tag `conversational` y la compatibilidad con endpoints facilitan integrarlo en APIs locales para pruebas de chat multi-turno.
- Distribucion reproducible de modelos: el SHA-256 documentado y la naturaleza determinista del proceso de modificacion permiten pipelines de verificacion de artefactos en produccion.
- Evaluacion comparativa de cuantizaciones: util para medir el impacto de eliminar el bloque MTP en latencia y calidad frente al fichero original de unsloth.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 16,2 GB para el fichero completo en Q4_K_M, mas overhead de contexto y KV cache (no cuantificado en la informacion disponible).
- GPU recomendadas: no disponibles en la informacion proporcionada; por tamano, cabria esperar GPUs con 24 GB o mas (RTX 3090/4090, A100, H100), aunque no se confirma.
- Cabe en GPU de consumo: si, en GPUs con 24 GB o mas de VRAM si se mantiene contexto moderado; en GPUs de 16 GB requeriria offloading parcial a CPU.
- Opciones de despliegue: llama.cpp (build compatible con la arquitectura Qwen3.5/3.8 sin MTP); otras opciones (vLLM, Ollama, TGI) no confirmadas.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Recogment/qwen3.8-27b-gguf | 26,9B | no disponible | GGUF Q4_K_M (16,2 GB) | Apache 2.0 | Bloque MTP eliminado; espejo verificado |
| unsloth/Qwen3.8-27B-GGUF | 26,9B | no disponible | GGUF UD-Q4_K_M (16,56 GB) | Apache 2.0 | Incluye bloque MTP; requiere llama.cpp con soporte |
| Qwen/Qwen3.8-27B | 26,9B | no disponible | safetensors | Apache 2.0 | Modelo base original |

## Limitaciones y advertencias

- La eliminacion del bloque MTP desactiva la decodificacion especulativa que ofrece el modelo original, lo que puede reducir el throughput respecto al fichero de unsloth.
- El repositorio tiene 0 descargas y 0 likes; no hay evidencia de uso en produccion ni validacion comunitaria.
- No se documentan sesgos conocidos, riesgos de alucinacion ni limitaciones de idioma del modelo base.
- No se especifica la longitud de contexto soportada ni el comportamiento con contextos largos en esta cuantizacion.
- Aunque la licencia es Apache 2.0, el fichero es una obra modificada; debe conservarse el aviso de cambios segun la seccion 4(b) de la licencia.
- El modelo se distribuye "AS IS", sin garantias de ningun tipo.
- La compatibilidad esta limitada a builds de llama.cpp que no lean `nextn_predict_layers`; otras herramientas pueden requerir el fichero original.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Recogment/qwen3.8-27b-gguf
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- GGUF original de unsloth: https://huggingface.co/unsloth/Qwen3.8-27B-GGUF
