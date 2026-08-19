# Koopah/Qwen3.6-35B-A3B-NVFP4-DSPARK-v2

## Resumen

Qwen3.6-35B-A3B-NVFP4-DSPARK-v2 es un modelo auxiliar de decodificación especulativa (draft model) desarrollado por Koopah, diseñado para acelerar la inferencia del modelo base unsloth/Qwen3.6-35B-A3B-NVFP4, la cuantización NVFP4 del Qwen3.6-35B-A3B de Alibaba. No es un modelo autónomo: su función es generar bloques de tokens candidatos que el modelo principal verifica mediante la regla de aceptación por ratio `min(1, q/p)`, manteniendo una calidad de salida idéntica a la del modelo base sin especulación.

El modelo emplea la técnica DSPARK, que permite redactar un bloque completo de tokens en una sola pasada hacia adelante. Con 1.530.167.041 parámetros (aproximadamente 1,53 mil millones) y un tamaño de repositorio de 3,1 GB, este draft está entrenado específicamente contra el checkpoint NVFP4 congelado del modelo base, no contra la versión bf16 original. La versión v2 representa un checkpoint posterior al v1, con una mejora del 6,8 % en la tasa de aceptación media (Spec-Bench macro de 3,70 a 3,96), y el entrenamiento continúa en curso.

La relevancia de este modelo radica en su capacidad para multiplicar el rendimiento de inferencia del Qwen3.6-35B-A3B NVFP4 en entornos de producción: alcanza hasta 580 tokens/s en solitario y 7.229 tokens/s agregados en vLLM 0.26, superando a la cabecera MTP integrada en todos los tamaños de lote probados. Está pensado para desarrolladores que sirven modelos grandes en GPU y necesitan reducir la latencia sin sacrificar calidad.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Draft model DSPARK (decodificación especulativa) |
| Parametros totales | 1.530.167.041 (safetensors) |
| Parametros activos | No aplica (no es un modelo MoE; es un modelo denso auxiliar) |
| Longitud de contexto | No disponible (depende del modelo base Qwen3.6-35B-A3B) |
| Tipos de cuantizacion | BF16 (drafter); el modelo base usa NVFP4 |
| Idiomas soportados | No disponibles |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (también disponible en GGUF en el repositorio Koopah/Qwen3.6-35B-A3B-NVFP4-DSPARK-v2-GGUF) |

## Arquitectura y entrenamiento

El modelo es un draft model DSPARK, una arquitectura auxiliar diseñada para decodificación especulativa. A diferencia de un modelo generativo completo, su función es predecir bloques de tokens que el modelo principal verifica posteriormente. El draft consume los estados ocultos (hidden states) capturados del checkpoint exacto de unsloth/Qwen3.6-35B-A3B-NVFP4, lo que garantiza que esté emparejado con los pesos NVFP4 tal como se sirven en producción, no con el original bf16.

El entrenamiento se realizó contra el checkpoint congelado del modelo base, identificado como la revisión `612d523c58` del repositorio upstream. La versión v2 es un checkpoint posterior al v1, con una mejora del 6,8 % en la tasa de aceptación media según Spec-Bench (macro 3,70 → 3,96), mejorando en todos los dominios evaluados. El entrenamiento continúa en curso y se espera una versión final con mayor rendimiento. No se especifican detalles sobre el dataset de entrenamiento ni el método de optimización (RLHF, DPO, etc.), pero al ser un draft model, el entrenamiento se centra en maximizar la probabilidad de aceptación de los tokens propuestos por el modelo principal.

## Capacidades

- Aceleración de inferencia mediante decodificación especulativa: genera bloques de tokens candidatos en una sola pasada hacia adelante, que el modelo base verifica con la regla de aceptación por ratio.
- Compatibilidad con múltiples motores de inferencia: funciona con sglang (rama fork), vLLM 0.26 y llama.cpp (a través de conversión GGUF).
- Preservación de la calidad de salida: la decodificación especulativa con la regla `min(1, q/p)` garantiza que la distribución de salida sea idéntica a la del modelo base sin especulación, a cualquier temperatura de muestreo.
- Soporte para diferentes tamaños de bloque de draft (k=4, k=6, k=8), lo que permite ajustar el equilibrio entre velocidad y sobrecarga computacional.
- Compatibilidad con el modelo base NVFP4 y NVFP4-Fast de Unsloth; también se espera compatibilidad con variantes fp8 y bf16 del Qwen3.6-35B-A3B, aunque no se han probado.
- No es un modelo generativo independiente: no ofrece capacidades propias de generación de texto, razonamiento, código, visión ni tool calling. Todas las capacidades funcionales provienen del modelo base.

## Casos de uso

- Servicio de inferencia de alto rendimiento en producción: el draft model se integra con sglang o vLLM para servir el Qwen3.6-35B-A3B NVFP4 con una velocidad de generación hasta 3,1× superior a la decodificación plana en solitario (580 tok/s en vLLM) y 1,5× a capacidad completa (7.229 tok/s agregados). Es adecuado para APIs de chat o generación de texto en tiempo real donde la latencia por usuario es crítica.
- Despliegue en entornos con una sola GPU de gama alta: con una RTX PRO 6000 Blackwell de 96 GB, el draft permite alcanzar 442 tok/s en solitario con sglang (k=8), lo que reduce drásticamente el tiempo de espera para usuarios individuales en aplicaciones interactivas.
- Aumento del throughput agregado en servidores multi-usuario: en configuraciones con lotes de 96 peticiones simultáneas, el draft alcanza 5.683–5.846 tok/s agregados en sglang y hasta 7.229 tok/s en vLLM, superando a la cabecera MTP integrada. Esto es útil para servicios con alta concurrencia, como asistentes virtuales o plataformas de generación de contenido.
- Inferencia local en equipos de escritorio con llama.cpp: la versión GGUF del draft permite acelerar la generación en una sola máquina, alcanzando 506 tok/s con el branch de rendimiento `speed.llama.cpp` (frente a 278 tok/s con upstream y 201 tok/s sin especulación). Ideal para desarrollo, pruebas o despliegues edge.
- Reducción de costes de computación en la nube: al mejorar el throughput por GPU, se pueden atender más peticiones con el mismo hardware, reduciendo el número de instancias necesarias y el coste por token servido.
- Integración en pipelines de inferencia existentes sin cambios en la calidad: dado que la salida es idéntica a la del modelo base sin especulación, se puede adoptar de forma transparente en sistemas que ya utilizan Qwen3.6-35B-A3B NVFP4, sin necesidad de revalidar la calidad de las respuestas.

## Benchmarks y rendimiento

Las pruebas se realizaron siguiendo el protocolo del post de lanzamiento de sglang DSpark: un lote de B peticiones simultáneas, prompt fijo de 16 preguntas GSM8K concatenadas, salida forzada a exactamente 1024 tokens, temperatura 0.7, caché de prompt desactivada, cada punto promediado sobre 3 rondas. Hardware: una RTX PRO 6000 Blackwell 96 GB (Max-Q). La velocidad de decodificación por usuario es la mediana de la tasa por petición desde el primer token hasta la finalización; el agregado es velocidad por usuario × B (estado estacionario).

### sglang (rama fork)

| config | solo (bs1) | bs16 | bs96 |
| --- | ---: | ---: | ---: |
| **DSpark k=8** | **442 tok/s** | **213/user · 3,411 agg** | 59/user · 5,683 agg |
| DSpark k=6 | 427 | 200 · 3,195 | **61 · 5,846** |
| DSpark k=4 | 347 | 180 · 2,874 | 61 · 5,827 |
| MTP (steps 4, k=6) | 290 | 158 · 2,531 | 57 · 5,453 |
| MTP (steps 3, k=4) | 273 | 161 · 2,579 | 57 · 5,472 |
| no speculation | 156 | 96 · 1,539 | 43 · 4,128 |

### vLLM 0.26

| config | solo (bs1) | bs16 | bs96 |
| --- | ---: | ---: | ---: |
| **DSpark k=8** | **580 tok/s** | **268/user · 4,285 agg** | **75/user · 7,229 agg** |
| DSpark k=6 | 500 | 254 · 4,064 | 65 · 6,269 |
| DSpark k=4 | 435 | 223 · 3,574 | 65 · 6,230 |
| MTP (k=4) | 341 | 186 · 2,976 | 61 · 5,818 |
| no speculation | 185 | 115 · 1,838 | 50 · 4,790 |

### llama.cpp (single-user / local serving)

| config | solo (bs1) | vs vLLM solo |
| --- | ---: | ---: |
| **DSpark k=8** | **506 tok/s** (accept 5.88) | 87 % |
| DSpark k=8, upstream llama.cpp | 278 | 48 % |
| no speculation | 201 | 109 % |

Nota: los números de sglang y vLLM se midieron sin truncamiento de bloques por confianza (confidence-scheduled block truncation), por lo que representan un límite inferior del rendimiento potencial. En llama.cpp, el branch `speed.llama.cpp` es +82 % sobre el upstream base en esta ruta de especulación.

## Requisitos de hardware

- El draft model en sí es ligero (1,53 B parámetros, ~3,1 GB en safetensors), por lo que puede residir en la misma GPU que el modelo base sin necesidad de hardware adicional.
- Para el modelo base Qwen3.6-35B-A3B NVFP4 se recomienda una GPU con al menos 48 GB de VRAM (por ejemplo, RTX A6000, L40S) para servir con cuantización NVFP4. Las pruebas de rendimiento se realizaron en una RTX PRO 6000 Blackwell de 96 GB.
- En configuraciones de una sola GPU, el draft model permite alcanzar hasta 580 tok/s en vLLM (k=8) y 442 tok/s en sglang, lo que lo hace viable en estaciones de trabajo con GPUs de gama alta.
- Para despliegues multi-usuario con lotes de 96 peticiones, se requiere una GPU con suficiente VRAM para alojar tanto el modelo base como el draft, además de los estados de atención (KV cache). La RTX PRO 6000 de 96 GB es suficiente para las cargas probadas.
- Opciones de despliegue: sglang (rama fork con soporte DSPARK), vLLM 0.26 (con soporte integrado), llama.cpp (a través de GGUF, con el branch de rendimiento `speed.llama.cpp` para mejor latencia).
- La latencia y el throughput dependen del motor, del tamaño de bloque (k) y del nivel de concurrencia. Los valores medidos se indican en la sección de benchmarks.

## Comparativa con modelos similares

El modelo se compara con las alternativas de especulación disponibles para el mismo modelo base Qwen3.6-35B-A3B NVFP4:

| Modelo | Tipo | Parámetros | Contexto | Rendimiento (solo, vLLM) | Licencia |
|---|---|---|---|---|---|
| Koopah/Qwen3.6-35B-A3B-NVFP4-DSPARK-v2 | Draft DSPARK | 1,53 B | No disponible | 580 tok/s (k=8) | Apache-2.0 |
| Cabecera MTP integrada (vLLM/sglang) | Multi-token prediction | No disponible | No disponible | 341 tok/s (vLLM, k=4) | No aplica |
| Sin especulación | — | — | — | 185 tok/s (vLLM) | — |

La comparativa muestra que el draft DSPARK supera claramente a la cabecera MTP integrada en todos los tamaños de lote y motores probados, y multiplica por más de tres la velocidad de decodificación plana en solitario. No se dispone de datos de otros draft models específicos para Qwen3.6-35B-A3B en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo autónomo: requiere el modelo base unsloth/Qwen3.6-35B-A3B-NVFP4 (o su variante -Fast) para funcionar. No puede generar texto por sí mismo.
- Dependencia de un checkpoint específico: el draft está entrenado contra el checkpoint congelado `612d523c58` del modelo base NVFP4. El repositorio upstream de Unsloth reemplazó silenciosamente sus pesos el 2026-07-10 con una re-exportación de precisión mixta que produce salidas degenerativas en las pruebas del autor. Se debe servir el repositorio congelado `Koopah/Qwen3.6-35B-A3B-NVFP4` (byte-idéntico a la revisión `612d523c58`) para garantizar la compatibilidad.
- Entrenamiento en curso: esta es una versión publicada temprana de un entrenamiento en curso; la tasa de aceptación aún está mejorando y los pesos pueden actualizarse en el futuro.
- Sin soporte de truncamiento por confianza: ningún motor actual integra la cabecera de confianza del draft en la inferencia, por lo que todos los bloques se verifican completos. Los números de rendimiento son un límite inferior; un motor que aproveche la cabecera podría mejorar aún más la velocidad.
- Compatibilidad no verificada con variantes fp8 y bf16 del Qwen3.6-35B-A3B: aunque se espera que sean compatibles, no se han probado.
- Riesgo de alucinación y sesgos: al ser un modelo auxiliar, no introduce sesgos propios, pero hereda los del modelo base. No se dispone de evaluaciones específicas de sesgo o alucinación para este draft.
- Limitaciones de idioma: no se especifican los idiomas soportados; se asume que hereda las capacidades multilingües del modelo base Qwen3.6-35B-A3B, pero no está confirmado.
- Licencia Apache-2.0 permite uso comercial, pero se debe verificar la licencia del modelo base (Qwen3.6) para asegurar el cumplimiento.

## Enlaces

- [Modelo en Hugging Face (safetensors)](https://huggingface.co/Koopah/Qwen3.6-35B-A3B-NVFP4-DSPARK-v2)
- [Versión GGUF del draft](https://huggingface.co/Koopah/Qwen3.6-35B-A3B-NVFP4-DSPARK-v2-GGUF)
- [Modelo base congelado (target)](https://huggingface.co/Koopah/Qwen3.6-35B-A3B-NVFP4)
- [Modelo base upstream de Unsloth](https://huggingface.co/unsloth/Qwen3.6-35B-A3B-NVFP4)
- [Variante NVFP4-Fast de Unsloth](https://huggingface.co/unsloth/Qwen3.6-35B-A3B-NVFP4-Fast)
- [Branch de rendimiento de llama.cpp](https://github.com/KoopahTManiac/speed.llama.cpp)
- [Post de lanzamiento de sglang DSpark](https://lmsys.org/blog/) (referencia del protocolo de benchmark)
