# EigenLabs/Qwen3.8-27B-MTP-4bit

## Resumen

EigenLabs/Qwen3.8-27B-MTP-4bit es un artefacto auxiliar de decodificación especulativa (MTP, *Multi-Token Prediction*) diseñado para el modelo Qwen3.8-27B de Alibaba. No es un modelo de lenguaje autónomo, sino una cabeza de propuesta de tokens de una sola capa que se empareja con el backbone cuantizado EigenLabs/Qwen3.8-27B-4bit para acelerar la generación de texto. El artefacto contiene únicamente los pesos de la capa MTP (66,38 millones de parámetros) cuantizados a 4 bits en formato MLX, y debe combinarse con la revisión exacta del backbone para funcionar.

La relevancia de este componente radica en que permite mejorar la velocidad de decodificación en hardware de consumo (GPUs y Macs con Apple Silicon) sin necesidad de reentrenar el modelo completo. Según la comunidad, el uso de MTP en Qwen3.8-27B puede aumentar la velocidad de decodificación entre un 33% y un 145% dependiendo de la tarjeta gráfica, aunque el autor de este artefacto no proporciona métricas de rendimiento propias. El modelo base Qwen3.8-27B es un modelo denso multimodal de 27B parámetros con contexto de 262.144 tokens y licencia Apache-2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen3_5_mtp (cabeza MTP de 1 capa, block_size=3) |
| Parametros totales | 66.381.312 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (depende del backbone; el modelo base soporta 262.144 tokens) |
| Tipos de cuantizacion | 4-bit (group_size=64, modo affine, escalas y biases en BF16) |
| Idiomas soportados | No disponible (depende del backbone) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El artefacto es una cabeza MTP de una sola capa (solo `layers.0`) con `block_size=3`, lo que significa que propone hasta tres tokens futuros por paso de decodificación. Los tensores están organizados en 31 claves, incluyendo ocho matrices 2D (proyecciones de atención y MLP) y siete tensores de normalización 1D en BF16. No incluye tokenizador, embeddings, LM head ni pesos del backbone.

La cuantización se realizó con MLX 0.31.2 usando `mlx.core.quantize` con group_size=64, bits=4 y modo affine. Cada matriz fue dequantizada y comparada con su fuente BF16, verificando errores máximos absolutos entre 0.0166 y 0.0977. El artefacto se derivó localmente del BF16 original de EigenLabs, no de un checkpoint cuantizado de terceros. No se proporciona información sobre el entrenamiento de la cabeza MTP (datos, método, etc.).

## Capacidades

- Propuesta de tokens para decodificación especulativa: genera candidatos de tokens que el backbone verifica, reduciendo el número de pasos de decodificación.
- Compatible con MLX (Apple Silicon) y con llama.cpp (según la comunidad, el MTP ya viene integrado en los GGUFs de Qwen3.8-27B).
- No genera texto por sí mismo: requiere el backbone EigenLabs/Qwen3.8-27B-4bit en la revisión exacta `301e9e2767fd0efcfab7883004720ba3c9a552a1`.
- No soporta tool calling, agentes ni razonamiento multi-step de forma independiente; esas capacidades dependen del modelo base.

## Casos de uso

- Aceleración de inferencia en Qwen3.8-27B en hardware local: al emparejar este MTP con el backbone cuantizado, se reduce la latencia de generación en GPUs de consumo (RTX 4090, etc.) y en Macs con Apple Silicon, útil para aplicaciones de chat y asistentes en tiempo real.
- Despliegue en entornos con VRAM limitada: el artefacto ocupa solo 0.2 GB, por lo que el sistema completo (backbone 4-bit + MTP) cabe en 24 GB de memoria unificada o VRAM, permitiendo ejecutar el modelo en portátiles y estaciones de trabajo sin GPUs de gama alta.
- Integración en pipelines de generación con MLX: desarrolladores que usan MLX-LM pueden cargar este artefacto junto al backbone para mejorar el throughput en aplicaciones de generación de código, resumen o análisis de documentos.
- Optimización de costes en inferencia serverless: al reducir el número de pasos de decodificación, se disminuye el tiempo de cómputo y, por tanto, el coste por petición en entornos de despliegue basados en GPU compartida.
- Investigación en decodificación especulativa: este artefacto sirve como referencia para estudiar el impacto de cabezas MTP cuantizadas en la velocidad de generación y en la calidad de los tokens propuestos.
- Prototipado rápido en Macs: con Ollama o MLX, se puede montar un entorno local de Qwen3.8-27B con MTP en una Mac de 24 GB, ideal para desarrollo y pruebas de agentes multimodales sin depender de la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explícitamente que las verificaciones realizadas (errores de cuantización, coincidencia de tensores) no constituyen afirmaciones sobre velocidad de generación, tasa de aceptación ni calidad. La comunidad reporta mejoras de velocidad de decodificación de +33% a +145% para el MTP de Qwen3.8-27B en general, pero no hay datos específicos para este artefacto concreto.

## Requisitos de hardware

- El artefacto MTP en sí requiere muy poca memoria (0.2 GB), pero debe ejecutarse junto al backbone EigenLabs/Qwen3.8-27B-4bit, que ocupa aproximadamente 17.8 GB en cuantización Q4.
- Para el sistema completo (backbone + MTP) se recomienda al menos 24 GB de VRAM o RAM unificada.
- GPUs compatibles: RTX 4090 (24 GB), A100 (40/80 GB), H100 (80 GB), y GPUs de 16 GB con cuantización más agresiva (aunque el backbone está fijado a 4-bit).
- En Apple Silicon, una Mac con 24 GB o más (M1 Pro/Max, M2 Pro/Max, M3 Pro/Max) puede ejecutar el modelo con MLX.
- Opciones de despliegue: MLX-LM, llama.cpp (con soporte MTP), Ollama (comando `ollama run qwen3.8:27b`), y potencialmente vLLM si se integra el soporte MTP.
- Latencia y throughput estimados: no disponibles para este artefacto específico. La comunidad reporta 24.5 tok/s en AMD Ryzen AI Max+ 395 con el modelo completo, pero no se ha verificado con este MTP.

## Comparativa con modelos similares

No disponible. Este artefacto es un componente auxiliar específico para Qwen3.8-27B, y no existen cabezas MTP comparables de otros modelos en la información proporcionada. Para comparar el modelo base Qwen3.8-27B con alternativas, se necesitarían datos adicionales no incluidos en esta ficha.

## Limitaciones y advertencias

- No es un modelo autónomo: debe emparejarse con la revisión exacta del backbone EigenLabs/Qwen3.8-27B-4bit (`301e9e2767fd0efcfab7883004720ba3c9a552a1`). Usarlo con otra versión puede producir resultados incorrectos o fallos de carga.
- Solo propone tokens; la calidad final de la generación depende enteramente del backbone. No se han realizado pruebas de extremo a extremo (generación, tasa de aceptación, calidad) por parte del autor.
- La cuantización 4-bit introduce errores de redondeo (errores máximos absolutos de hasta 0.0977 en algunas matrices), aunque se verificó que los tensores coinciden con la referencia independiente de mlx-community.
- No se garantiza ninguna mejora de velocidad: el autor declara explícitamente que las comprobaciones de fidelidad no son afirmaciones de rendimiento.
- El artefacto no incluye tokenizador ni pesos del modelo base; es necesario descargar el backbone por separado, lo que aumenta la complejidad del despliegue.
- La licencia Apache-2.0 permite uso comercial, pero el modelo base Qwen3.8-27B también es Apache-2.0, por lo que no hay restricciones adicionales conocidas.

## Enlaces

- Artefacto MTP: https://huggingface.co/EigenLabs/Qwen3.8-27B-MTP-4bit
- Backbone cuantizado: https://huggingface.co/EigenLabs/Qwen3.8-27B-4bit
- Modelo base original: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio oficial de Qwen3.8-27B: https://github.com/AlibabaCloud-Official/Qwen3.8-27B
- Análisis comunitario del MTP: https://github.com/sudoingX/qwen38-mtp
- Guía de ejecución local: https://modelfit.io/blog/run-qwen38-27b-locally-2026/
