# 532sdadasda/Suri-Qwen-3.8-27B-Companion-GGUF

## Resumen

Suri Qwen 3.8 27B Companion es un modelo de lenguaje de 26.896 millones de parametros (aproximadamente 27B) derivado de SpaceTimee/Suri-Qwen-3.8-27B-Uncensored, a su vez construido sobre la familia Qwen 3.8. El autor de esta distribucion, 532sdadasda, publica unicamente la version cuantizada en formato GGUF, orientada a inferencia local y a despliegues ligeros mediante llama.cpp u Ollama. La model card lo define como un modelo de tipo "companion" (acompanamiento conversacional), con un ajuste fino no censurado heredado del modelo base.

La relevancia de esta publicacion es limitada: se trata de un repositorio recien creado (13 de noviembre de 2026), sin descargas ni valoraciones, con licencia no declarada y sin resultados de benchmarks publicados. Su interes practico reside en la disponibilidad de pesos GGUF con cuantizacion basada en imatrix, lo que facilita ejecutar un modelo de 27B en hardware de consumo, aunque con las reservas propias de un artefacto sin validacion externa.

El modelo declara soporte de chino e ingles y una pipeline de image-text-to-text, si bien la model card no documenta ninguna capacidad multimodal concreta ni arquitectura de vision. La ausencia de informacion tecnica detallada obliga a tratar la mayoria de especificaciones como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen 3.8); detalles no disponibles |
| Parametros totales | 26.895.998.464 (26,9B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF con cuantizacion basada en imatrix (niveles concretos no disponibles) |
| Idiomas soportados | zh, en |
| Licencia | no disponible |
| Formato de pesos | GGUF (libreria declarada: transformers) |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna mas alla de su filiacion a la familia Qwen 3.8 y de que se distribuye como transformer. El repositorio no documenta numero de capas, dimension del hidden state, mecanismo de atencion ni si incorpora innovaciones como atencion lineal o decodificacion especulativa. Tampoco se especifica la longitud de contexto nativa del modelo base.

Respecto al entrenamiento, la unica informacion disponible es que el modelo deriva de SpaceTimee/Suri-Qwen-3.8-27B-Uncensored, un ajuste fino de caracter "companion" y sin censura. No se detallan volumenes de tokens, composicion del dataset, ni si se emplearon tecnicas de RLHF, DPO o preferencia directa. La cuantizacion GGUF se ha generado con imatrix, lo que sugiere el uso de una matriz de importancia para preservar la calidad en la compresion, pero no se indican los niveles publicados ni las metricas de degradacion.

## Capacidades

- Generacion de texto conversacional multi-turno, orientada a interacciones de acompanamiento y chat.
- Razonamiento y codigo: presumiblemente heredados del modelo base Qwen, aunque no hay documentacion que lo confirme.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues limitadas a chino e ingles segun los metadatos.
- Capacidad multimodal: la pipeline declarada es image-text-to-text, pero la model card no describe ningun modulo de vision ni ejemplos de uso con imagenes.
- Modo "thinking" o razonamiento extendido: no disponible.
- Ajuste sin censura: el modelo base se presenta como "uncensored", lo que implica menor rechazo a contenido sensible.

## Casos de uso

- Prototipado de asistentes conversacionales en local: el formato GGUF permite cargar el modelo en llama.cpp u Ollama para experimentar con dialogos multi-turno sin depender de APIs externas.
- Desarrollo de personajes y agentes de acompanamiento: el ajuste "companion" del modelo base lo hace adecuado para bots de rol o entretenimiento conversacional, siempre con moderacion externa.
- Evaluacion de cuantizaciones en hardware de consumo: util para medir la degradacion de calidad de un modelo de 27B cuantizado con imatrix frente al modelo original.
- Investigacion sobre modelos sin censura: permite estudiar el comportamiento de modelos con filtros reducidos en entornos controlados y con supervision humana.
- Generacion de texto en chino e ingles: util para tareas de redaccion o traduccion informal entre ambos idiomas, con verificacion posterior.
- Base para ajuste fino adicional: al estar en GGUF no es directamente entrenable, pero sirve como referencia para comparar con variantes en safetensors del modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: un modelo de 26,9B parametros en cuantizacion de 4 bits ocupa aproximadamente 14-16 GB de pesos; en 8 bits, en torno a 27-30 GB. Las cifras exactas dependen de los niveles GGUF publicados, que no se detallan.
- GPU recomendadas: para cuantizaciones de 4 bits, una RTX 4090 (24 GB) o RTX 3090 (24 GB) pueden alojar el modelo completo; para 8 bits se recomienda A100 40 GB, H100 o configuraciones multi-GPU.
- Cabe en GPU de consumo: si, en tarjetas con 16-24 GB de VRAM usando cuantizaciones de 4 bits, con posible offload parcial a CPU en GPUs de 12-16 GB.
- Opciones de despliegue: llama.cpp, Ollama, y servidores compatibles con GGUF; la libreria declarada es transformers, aunque el formato GGUF apunta a los runners anteriores.
- Latencia y throughput: no disponibles; dependen del hardware y del nivel de cuantizacion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Suri Qwen 3.8 27B Companion GGUF | 26,9B | no disponible | no disponible | GGUF | Ajuste companion sin censura, sin benchmarks |
| SpaceTimee/Suri-Qwen-3.8-27B-Uncensored | 26,9B (presumible) | no disponible | no disponible | no disponible | Modelo base del que deriva esta cuantizacion |
| Qwen 3.8 27B (familia original) | ~27B | no disponible | no disponible | safetensors, GGUF | Referencia de arquitectura; rendimiento no verificado en esta ficha |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay evidencia publicada de calidad, razonamiento o codigo.
- Licencia no declarada: no se puede confirmar el uso comercial; tratar como no apto para produccion sin aclaracion legal.
- Modelo sin censura: el ajuste "uncensored" implica riesgo elevado de generar contenido inapropiado, ofensivo o danoso; requiere moderacion externa obligatoria.
- Riesgo de alucinacion: inherente a los modelos de lenguaje y agravado por la falta de validacion del ajuste fino.
- Idiomas limitados a chino e ingles: el rendimiento en castellano no esta garantizado ni documentado.
- Metadatos inconsistentes: la pipeline image-text-to-text no se corresponde con ninguna capacidad multimodal descrita en la model card.
- Repositorio sin traccion: cero descargas y cero valoraciones, sin comunidad que valide su funcionamiento.
- Formato GGUF: no apto para reentrenamiento directo; requiere conversion a safetensors para ajuste fino.
- Contexto desconocido: no se puede planificar su uso en tareas de contexto largo sin verificar la ventana real.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/532sdadasda/Suri-Qwen-3.8-27B-Companion-GGUF
- Modelo base: https://huggingface.co/SpaceTimee/Suri-Qwen-3.8-27B-Uncensored
- Contacto del autor: QQ 902575634, correo Zeus6_6@163.com (sin enlaces web adicionales disponibles)
