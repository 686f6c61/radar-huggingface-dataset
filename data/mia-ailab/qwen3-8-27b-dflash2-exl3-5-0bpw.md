# Mia-AiLab/Qwen3.8-27B-DFlash2-EXL3-5.0bpw

## Resumen

El modelo `Mia-AiLab/Qwen3.8-27B-DFlash2-EXL3-5.0bpw` es una cuantización en formato EXL3 (5.0 bpw) del drafter DFlash2, un modelo auxiliar de decodificación especulativa diseñado para acelerar la inferencia del modelo principal Qwen3.8-27B. No es un modelo de lenguaje autónomo: su función es proponer bloques de tokens candidatos que el modelo objetivo verifica, reduciendo el número de pasos de decodificación y mejorando el rendimiento en entornos con restricciones de hardware.

Desarrollado por Mia-AiLab a partir del release original de inco.ai (z-lab), este drafter emplea una arquitectura de difusión por bloques con convoluciones dinámicas de dos taps, capaz de generar hasta 7 tokens especulativos en una sola pasada. La cuantización EXL3 reduce el peso del drafter de 3.85 GB (bf16) a 1.4 GB, lo que supone una mejora medible del throughput de decodificación en hardware como DGX Spark (GB10), donde se ha observado un incremento del +33% frente al drafter en bf16.

El modelo está pensado para integrarse en el fork de exllamav3 con soporte DFlash2, junto con el target cuantizado `Mia-AiLab/Qwen3.8-27B-EXL3-3.5bpw`. Su licencia Apache-2.0 permite uso comercial sin restricciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Block-diffusion speculative decoder (DFlash2) con selector de candidatos y convoluciones dinámicas de dos taps |
| Parametros totales | 735.448.320 (según safetensors; la documentación del drafter original indica 1.93B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible (depende del modelo objetivo Qwen3.8-27B) |
| Tipos de cuantizacion | EXL3 5.0 bpw (module-adaptive, incluye el selector) |
| Idiomas soportados | No disponible (hereda las capacidades del modelo objetivo) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (EXL3 v1.4.2) |

## Arquitectura y entrenamiento

El drafter DFlash2 se basa en una arquitectura de difusión por bloques: en lugar de predecir un token a la vez, genera un bloque completo de hasta 7 tokens especulativos (`block_size: 8`) en una sola pasada. Mantiene los mejores candidatos en cada posición y un selector ligero traza una ruta coherente a través de ellos. Las convoluciones dinámicas de dos taps en el backbone evitan la degradación de la calidad del draft en horizontes largos.

Los detalles del entrenamiento (número de tokens, composición del dataset, método de alineación) no se han publicado en la información disponible. El modelo original en bf16 fue entrenado por z-lab / inco.ai, y esta versión es una cuantización derivada para exllamav3. La cuantización EXL3 5.0 bpw se realizó con datos de calibración por defecto, logrando un RMSE por proyección de aproximadamente 0.00085.

## Capacidades

- Generación de bloques especulativos de hasta 7 tokens en una sola pasada para decodificación especulativa.
- Mantenimiento de múltiples candidatos por posición con un selector ligero que traza una ruta coherente.
- Compatibilidad con el fork de exllamav3 que implementa DFlash2 (arquitectura, selector y bucle de generación especulativa).
- Reducción del peso del drafter de 3.85 GB (bf16) a 1.4 GB, facilitando su uso en hardware con VRAM limitada.
- Mejora del throughput de decodificación en entornos como DGX Spark (GB10): +33% frente al drafter bf16 con aceptación a la par.
- No es un modelo de lenguaje standalone: no genera texto por sí mismo, solo propone candidatos para el modelo objetivo.

## Casos de uso

- Aceleración de inferencia para Qwen3.8-27B en servidores de producción: el drafter se integra en el bucle de decodificación especulativa del fork de exllamav3, reduciendo la latencia por token en cargas de trabajo de generación larga.
- Despliegue en hardware de consumo con VRAM ajustada: al ocupar solo 1.4 GB, el drafter cuantizado puede acompañar al target cuantizado en GPUs como RTX 4090 o RTX 6000 PRO, donde el drafter bf16 consumiría 3.85 GB adicionales.
- Optimización de costes en entornos cloud con facturación por GPU: la reducción de peso y el mayor throughput permiten servir más peticiones por instancia, amortizando el coste de la GPU.
- Generación de código en pipelines de CI/CD: el drafter mantiene una tasa de aceptación alta (4.43 en HumanEval-style con T=0.6), lo que acelera la generación de código sin sacrificar calidad.
- Asistentes conversacionales con contexto largo: al combinarse con el target Qwen3.8-27B y su ventana de contexto ampliada, el drafter reduce la latencia en diálogos multi-turno.
- Evaluación de modelos en local: investigadores que necesiten probar Qwen3.8-27B en una sola GPU pueden usar este drafter cuantizado para obtener un rendimiento aceptable sin hardware de gama alta.

## Benchmarks y rendimiento

La model card proporciona métricas medidas con el target EXL3 3.5bpw en DGX Spark (GB10):

| Metrica | Drafter bf16 | Drafter EXL3 5.0bpw |
|---|---|---|
| Aceptación greedy (prosa de código) | 2.68–2.80 | 2.68–2.74 (una ejecución con salida bit-idéntica) |
| Aceptación estilo HumanEval (T=0.6) | 4.27 | 4.43 |
| Decodificación tok/s (HumanEval, T=0.6) | 35.7 | 47.5 |

No se han publicado resultados de benchmarks adicionales (MMLU, GSM8K, etc.) en la información disponible, ya que el modelo no es un LLM standalone.

## Requisitos de hardware

- VRAM estimada: 1.4 GB para el drafter cuantizado (frente a 3.85 GB en bf16). El target Qwen3.8-27B en 3.5bpw requiere VRAM adicional, no especificada en la documentación.
- GPU recomendadas: DGX Spark (GB10) según las mediciones publicadas; también compatible con GPUs de consumo como RTX 4090 o RTX 6000 PRO si se usa el target cuantizado.
- Opciones de despliegue: fork de exllamav3 con soporte DFlash2 (servidor OpenAI-compatible `tools/serve_openai.py`). No es compatible con stock exllamav3, vLLM, llama.cpp u Ollama sin modificaciones.
- Latencia y throughput: 47.5 tok/s en decodificación con HumanEval (T=0.6) en DGX Spark, frente a 35.7 tok/s con el drafter bf16.
- El drafter mantiene su propia caché KV en fp16 (paridad-pinned); el target puede usar caché NVFP4 (`-cq nvfp4`).

## Comparativa con modelos similares

| Modelo | Parametros | Tamano | Formato | Aceptacion (HumanEval T=0.6) | Decode tok/s (DGX Spark) | Licencia |
|---|---|---|---|---|---|---|
| incoai/Qwen3.8-27B-DFlash2 (bf16) | 1.93B (documentado) | 3.85 GB | bf16 | 4.27 | 35.7 | Apache-2.0 |
| Mia-AiLab/Qwen3.8-27B-DFlash2-EXL3-5.0bpw | 735M (safetensors) | 1.4 GB | EXL3 5.0bpw | 4.43 | 47.5 | Apache-2.0 |

No se dispone de información sobre otros draft models comparables en la misma categoría (decodificación especulativa por bloques) en los resultados de búsqueda.

## Limitaciones y advertencias

- No es un modelo de lenguaje standalone: no puede generar texto por sí mismo; requiere el modelo objetivo Qwen3.8-27B y un motor de decodificación especulativa compatible.
- Requiere un fork específico de exllamav3 con soporte DFlash2; el exllamav3 estándar no implementa esta arquitectura.
- La discrepancia entre los parámetros declarados (1.93B) y los del safetensors (735M) no está aclarada en la documentación; podría deberse a una poda o a un error en la metadata.
- Los benchmarks publicados se limitan a un único entorno (DGX Spark) y a un único target cuantizado (3.5bpw); los resultados pueden variar en otras configuraciones.
- No se han publicado evaluaciones de sesgos, alucinación o calidad lingüística del drafter, ya que no es un modelo generativo.
- La licencia Apache-2.0 permite uso comercial, pero el usuario debe verificar que el fork de exllamav3 y el target cuantizado asociado cumplen con sus propias licencias.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Mia-AiLab/Qwen3.8-27B-DFlash2-EXL3-5.0bpw
- Target cuantizado recomendado: https://huggingface.co/Mia-AiLab/Qwen3.8-27B-EXL3-3.5bpw
- Drafter original en bf16: https://huggingface.co/incoai/Qwen3.8-27B-DFlash2
- Modelo objetivo Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- Blog de DFlash2: https://inco.ai/blog/dflash2/
- Repositorio GitHub de DFlash2: https://github.com/z-lab/dflash
- Repositorio de Qwen3.8-27B (Alibaba): https://github.com/AlibabaCloud-Official/Qwen3.8-27B
- Guia de despliegue para DGX Spark / RTX 6000 PRO: https://github.com/MiaAI-Lab/Qwen3.8-27B-DGX-Spark-RTX-6000
