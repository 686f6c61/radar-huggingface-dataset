# chimingw/Qwen3.8-27B-Uncensored-OrcaRouter-MLX-8bit

## Resumen

El modelo `chimingw/Qwen3.8-27B-Uncensored-OrcaRouter-MLX-8bit` es una conversión nativa a MLX en cuantización affine de 8 bits (grupo 64) del checkpoint `orcarouter/Qwen3.8-27B-Uncensored-GGUF`, que a su vez es una versión **abliterada** (eliminación del mecanismo de rechazo) del modelo oficial `Qwen/Qwen3.8-27B` de Alibaba. El autor de la conversión, chimingw, ha reconstruido los pesos directamente desde los archivos F16 del padre, sin añadir entrenamiento, fine-tuning ni cambios de alineación.

El modelo resultante es un sistema de visión-lenguaje (image-text-to-text) denso, con 27 mil millones de parámetros nominales y una cabeza de decodificación especulativa MTP (Multi-Token Prediction). Su relevancia actual radica en que ofrece una versión sin guardarraíles de un modelo de última generación, pensada exclusivamente para investigación en seguridad, interpretabilidad y red-teaming. La licencia es Apache 2.0, heredada del modelo base, pero el uso conlleva una responsabilidad total por parte de quien lo utilice.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso de vision-lenguaje con cabeza MTP (decodificacion especulativa) |
| Parametros totales | 27B (nominal); el archivo safetensors reporta 9.098.097.392, posiblemente por conteo parcial de tensores cuantizados |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | 8-bit affine, grupo 64 (MLX) |
| Idiomas soportados | Ingles (en), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura de Qwen3.8-27B, un transformer denso con capacidades nativas de vision y lenguaje. Incluye un proyector de vision (mmproj) que procesa imagenes y las integra con el stream de texto, y una cabeza MTP que predice multiples tokens futuros para acelerar la decodificacion especulativa. La conversion a MLX conserva la precision original: los tensores F16 permanecen como F16, los BF16 mantienen sus bytes crudos y las matrices elegibles se cuantizan directamente a 8-bit affine con grupo 64.

No se ha realizado ningun entrenamiento adicional. El proceso de abliteracion aplicado por OrcaRouter consiste en ortogonalizar la direccion de rechazo fuera del stream residual, eliminando la capa de seguridad del modelo original. Esta conversion no ha sido validada de forma independiente en cuanto a calidad, seguridad o comportamiento, segun advierte el propio autor.

## Capacidades

- Generacion de texto, razonamiento, codigo y matematicas, heredadas del modelo base Qwen3.8-27B.
- Comprension de imagenes y respuesta a consultas visuales (image-text-to-text), mediante el proyector de vision integrado.
- Decodificacion especulativa con cabeza MTP, que reduce la latencia en generacion secuencial.
- Soporte multilingue para ingles y chino.
- Sin guardarrailes de seguridad: el modelo no rechaza peticiones daninas, eticas u ofensivas, por lo que su comportamiento es impredecible en escenarios no controlados.
- Capacidad de tool calling y razonamiento multi-paso, si bien no se ha verificado en esta conversion.

## Casos de uso

- Investigacion en interpretabilidad de mecanismos de rechazo: el modelo permite estudiar como se comporta un LLM sin la direccion de refusal, comparando activaciones y respuestas con la version original.
- Red-teaming y evaluacion de robustez: ideal para probar defensas, detectar vulnerabilidades en sistemas de moderacion y generar ataques adversariales controlados.
- Experimentos de alineacion: sirve como punto de partida para re-alinear un modelo mediante fine-tuning o tecnicas de edicion de pesos, midiendo el impacto de cada intervencion.
- Desarrollo de capas de seguridad personalizadas: los equipos pueden anadir sus propios filtros de moderacion y probar su eficacia sobre un modelo sin sesgos de rechazo preexistentes.
- Estudios de sesgo y toxicidad: permite analizar el contenido generado sin restricciones, identificando patrones de sesgo que la alineacion suele enmascarar.
- Evaluacion de sistemas de deteccion de contenido: se puede usar como generador de datos dificiles para entrenar clasificadores de contenido danino.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor de la conversion no ha realizado evaluaciones independientes de calidad, seguridad o rendimiento, y el modelo padre tampoco proporciona datos comparativos en la documentacion revisada.

## Requisitos de hardware

- Disenado para Apple Silicon: al ser un paquete MLX, se ejecuta de forma nativa en Macs con chips M1, M2, M3 y M4 (incluidos los Pro y Max).
- Tamano del repositorio: 62,4 GB en archivos safetensors. La cuantizacion 8-bit reduce el peso efectivo, pero no se ha especificado el tamano exacto en memoria.
- Se requiere al menos 16 GB de RAM unificada para cargar el modelo en 8-bit; se recomiendan 32 GB o mas para trabajar con contexto largo o procesamiento de imagenes.
- No se han proporcionado requisitos para GPU NVIDIA o AMD; el formato MLX no es compatible directamente con CUDA.
- Opciones de despliegue: MLX (libreria oficial de Apple), con soporte para generacion local en macOS. No se mencionan integraciones con vLLM, llama.cpp u Ollama en esta conversion especifica.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Vision | Guardarrailes | Licencia | Formato |
|---|---|---|---|---|---|---|
| Qwen3.8-27B (oficial) | 27B | No disponible | Si | Si | Apache 2.0 | Safetensors, GGUF |
| Qwen3.8-27B-Uncensored (OrcaRouter) | 27B | No disponible | Si | No (abliterado) | Apache 2.0 | GGUF (F16) |
| Este modelo (MLX 8-bit) | 27B | No disponible | Si | No (abliterado) | Apache 2.0 | Safetensors (MLX) |

La comparativa se limita a las variantes del mismo modelo base, ya que no hay datos de rendimiento para contrastar con alternativas de otros fabricantes. La diferencia principal es el formato (MLX frente a GGUF) y la cuantizacion (8-bit affine frente a F16), ademas de la ausencia de guardarrailes en las versiones uncensored.

## Limitaciones y advertencias

- El modelo tiene la alineacion de seguridad eliminada mediante abliteracion: cumplira con solicitudes daninas, eticas, ofensivas o ilegales que el Qwen3.8-27B original rechazaria.
- No dispone de guardarrailes integrados; su uso en produccion o con usuarios finales requiere anadir capas de moderacion, filtrado y prevencion de abusos.
- Esta publicado estrictamente para investigacion legitima: interpretabilidad, estudio de mecanismos de rechazo, red-teaming, evaluacion de robustez y experimentos controlados.
- El autor de la conversion no ha validado de forma independiente las afirmaciones sobre calidad, seguridad o comportamiento del modelo padre.
- La licencia Apache 2.0 permite uso comercial, pero la responsabilidad legal y etica recae completamente en quien lo utilice.
- Solo soporta ingles y chino; no se ha verificado el rendimiento en otros idiomas.
- No se dispone de datos sobre la longitud de contexto efectiva ni sobre posibles degradaciones en tareas de razonamiento complejo debido a la cuantizacion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/chimingw/Qwen3.8-27B-Uncensored-OrcaRouter-MLX-8bit
- Modelo padre (GGUF F16): https://huggingface.co/orcarouter/Qwen3.8-27B-Uncensored-GGUF
- Repositorio oficial de Qwen3.8: https://github.com/QwenLM/Qwen3.8
- Anuncio de Chiming Wang en X: https://x.com/chimingwang/status/2088756255800406450
- Guia de ejecucion local de Qwen3.8-27B: https://modelfit.io/blog/run-qwen38-27b-locally-2026/
