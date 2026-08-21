# 0xWhiteMage/Qwen3.8-27B-Kearuga-DFlash2-FP8-E4M3

## Resumen

Qwen3.8-27B-Kearuga-DFlash2-FP8-E4M3 es un modelo drafter (borrador) de decodificacion especulativa, cuantizado en FP8 E4M3, disenado para acelerar la inferencia del modelo denso Qwen3.8-27B de Alibaba en hardware NVIDIA Blackwell, especificamente en la estacion DGX Spark. El modelo ha sido desarrollado por el usuario 0xWhiteMage, que ha cuantizado el drafter original de z-lab (Qwen3.8-27B-DFlash2) a precision FP8 E4M3, reduciendo el trafico de memoria en un 46,7% y manteniendo los codebooks de transicion de vocabulario en BF16 para evitar la degradacion de aceptacion observada en drafters de 4 bits.

El modelo emplea una arquitectura de difusion por bloques de 5 capas y ha sido destilado en cinco dominios de capacidad (codigo, razonamiento matematico, IFEval, logica y tool calling) con una funcion de perdida con decaimiento posicional exponencial, lo que eleva la tasa de aceptacion especulativa de aproximadamente el 74% a mas del 85%. Con 1.924.404.480 parametros y un tamano de 2,1 GB, este drafter se sirve junto al modelo principal Qwen3.8-27B-Kearuga-NVFP4 mediante SGLang, alcanzando velocidades de decodificacion de 65 a 82 tokens por segundo.

La relevancia de este modelo radica en que permite ejecutar un LLM de 27.000 millones de parametros con contexto de 262.144 tokens en hardware de escritorio de gama alta, haciendo viable la inferencia local de alto rendimiento sin sacrificar la calidad de las respuestas. Su licencia Apache 2.0 y su compatibilidad con el ecosistema SGLang lo convierten en una opcion atractiva para desarrolladores que buscan desplegar modelos de gran tamano en entornos con recursos limitados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Block-diffusion speculative drafter, 5 capas, con codebooks de transicion de vocabulario (candidate_selector) |
| Parametros totales | 1.924.404.480 (1,92 B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262.144 tokens (heredada del modelo base) |
| Tipos de cuantizacion | FP8 E4M3 (pesos) + BF16 (codebooks) |
| Idiomas soportados | Ingles, chino |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un drafter de decodificacion especulativa con arquitectura de difusion por bloques de 5 capas, especificamente disenado para el modelo Qwen3.8-27B. A diferencia de los drafters convencionales que predicen token a token, este modelo genera bloques completos de tokens candidatos que el modelo principal verifica en paralelo, reduciendo significativamente la latencia de decodificacion.

El entrenamiento se ha realizado mediante destilacion multi-dominio sobre cinco capacidades nucleares: codificacion, razonamiento matematico con cadena de pensamiento, IFEval, logica y tool calling. La funcion de perdida emplea un decaimiento posicional exponencial (w_k = exp(-k/gamma)), que pondera mas los primeros tokens de cada bloque, lo que incrementa la tasa de aceptacion especulativa de aproximadamente el 74% al 85%. Los codebooks de transicion de vocabulario, con 248.320 entradas, se mantienen en BF16 para preservar la precision, evitando el colapso de aceptacion observado en drafters cuantizados a 4 bits.

## Capacidades

- Decodificacion especulativa: genera bloques de hasta 8 tokens candidatos que el modelo principal verifica en paralelo, acelerando la inferencia entre 1,3 y 1,6 veces.
- Destilacion multi-dominio: optimizado para codigo, razonamiento matematico, instrucciones complejas (IFEval), logica y tool calling.
- Compatibilidad con FP8 E4M3: aprovecha los Tensor Cores de Blackwell sin sobrecarga de dequantizacion en GEMM.
- Integracion con SGLang: soporta el algoritmo DFLASH con captura nativa de CUDA graphs.
- Multilingue: soporta ingles y chino, heredado del modelo base Qwen3.8-27B.
- No es un modelo autonomo: requiere el modelo principal Qwen3.8-27B-Kearuga-NVFP4 para funcionar.

## Casos de uso

- Inferencia local de alto rendimiento: permite ejecutar Qwen3.8-27B en una DGX Spark con velocidades de 65-82 tokens por segundo, haciendo viable la generacion de texto en tiempo real en hardware de escritorio.
- Asistente de codificacion en entornos de desarrollo: el drafter esta destilado para codigo, por lo que acelera la autocompletacion y generacion de fragmentos de codigo en IDEs y herramientas de desarrollo.
- Razonamiento matematico interactivo: la destilacion en razonamiento matematico con cadena de pensamiento mejora la velocidad de respuesta en aplicaciones de tutoria o resolucion de problemas paso a paso.
- Automatizacion de oficina: el modelo base Qwen3.8-27B esta optimizado para flujos de trabajo de oficina, y el drafter acelera tareas como redaccion de documentos, resumen de correos y generacion de presentaciones.
- Agentes conversacionales con tool calling: la destilacion en tool calling permite que el sistema completo (drafter + modelo principal) responda mas rapido en escenarios donde el agente debe invocar funciones externas.
- Despliegue en produccion con SGLang: el drafter se integra con SGLang para servir el modelo principal con contexto de 262.144 tokens, adecuado para aplicaciones que requieren ventanas de contexto largas, como analisis de documentos extensos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks tradicionales (MMLU, HumanEval, GSM8K) en la informacion disponible. Sin embargo, el modelo card del autor proporciona datos de rendimiento especificos del drafter:

| Drafter | Precision y formato | Tamano | SGLang CUDA Graph | Aceptacion especulativa (α) | Decodificacion single-stream (C1) |
|---|---:|---:|---|---:|---:|
| Kearuga DFlash 2 | FP8 E4M3 + BF16 codebooks | 1,95 GiB | Captura nativa | >85% | 65,0-82,0 tok/s |
| Base z-lab | BF16 (sin cuantizar) | 3,67 GiB | Captura nativa | ~74% | 50,9 tok/s |
| Comunidad INT8 (W8A16) | INT8 W8A16 | 2,02 GiB | Parcial | ~72% | ~45,0 tok/s (sobrecarga de dequant) |
| Comunidad INT4 (W4A16) | INT4 W4A16 | 1,20 GiB | No | ~58% (colapso de codebook) | ~34,0 tok/s |

## Requisitos de hardware

- VRAM estimada: 1,95 GiB para el drafter en FP8 E4M3, mas la VRAM del modelo principal Qwen3.8-27B-Kearuga-NVFP4 (no especificada, pero el modelo base de 27B en FP8 requiere aproximadamente 15-20 GB).
- GPU recomendada: NVIDIA DGX Spark (Blackwell), aunque puede funcionar en otras GPUs Blackwell con soporte FP8 E4M3.
- No cabe en GPUs de consumo convencionales (RTX 4090, etc.) si se combina con el modelo principal de 27B, dado el requisito de memoria total.
- Opciones de despliegue: SGLang con el algoritmo DFLASH, usando `--speculative-algorithm DFLASH` y `--speculative-num-draft-tokens 8`.
- Latencia y throughput: 65-82 tokens por segundo en decodificacion single-stream con captura nativa de CUDA graphs en DGX Spark.

## Comparativa con modelos similares

| Modelo | Precision | Tamano | Aceptacion especulativa | Velocidad | Licencia |
|---|---|---|---|---|---|
| Kearuga DFlash 2 (este modelo) | FP8 E4M3 + BF16 | 1,95 GiB | >85% | 65-82 tok/s | Apache 2.0 |
| Base z-lab DFlash2 | BF16 | 3,67 GiB | ~74% | 50,9 tok/s | Apache 2.0 |
| Comunidad INT8 W8A16 | INT8 | 2,02 GiB | ~72% | ~45 tok/s | Apache 2.0 |
| Comunidad INT4 W4A16 | INT4 | 1,20 GiB | ~58% | ~34 tok/s | Apache 2.0 |

## Limitaciones y advertencias

- Modelo dependiente: no es un LLM autonomo; requiere el modelo principal Qwen3.8-27B-Kearuga-NVFP4 para funcionar.
- Hardware especifico: el rendimiento optimo solo se alcanza en GPUs Blackwell con soporte FP8 E4M3; en hardware anterior, la cuantizacion FP8 puede no ofrecer ventajas o incluso degradar el rendimiento.
- Idiomas limitados: solo soporta ingles y chino, lo que restringe su uso en aplicaciones multilingues.
- Riesgo de alucinacion: como drafter, no genera respuestas finales, pero el sistema completo puede presentar alucinaciones propias del modelo base.
- Sin benchmarks publicados: no hay evaluaciones independientes de calidad del modelo base en tareas estandar.
- Dependencia de SGLang: la integracion optima requiere SGLang; otros servidores de inferencia pueden no soportar el algoritmo DFLASH.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/0xWhiteMage/Qwen3.8-27B-Kearuga-DFlash2-FP8-E4M3
- Modelo principal (NVFP4): https://huggingface.co/0xWhiteMage/Qwen3.8-27B-Kearuga-NVFP4
- Repositorio GitHub: https://github.com/0xWhiteMage/Qwen3.8-27B-Kearuga-SGLang-DGX-Spark-DFlash2
- Modelo base Qwen3.8-27B: https://github.com/AlibabaCloud-Official/Qwen3.8-27B
- Qwen3.8-27B-FP8 oficial: https://huggingface.co/Qwen/Qwen3.8-27B-FP8
- Recetas vLLM para Qwen3.8-27B: https://recipes.vllm.ai/Qwen/Qwen3.8-27B
