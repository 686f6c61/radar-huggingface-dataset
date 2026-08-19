# incoai/Qwen3.8-27B-DFlash2-GGUF

## Resumen

Qwen3.8-27B-DFlash2-GGUF es un modelo de borrador (draft model) para decodificación especulativa, desarrollado por Inco AI como parte de su familia DFlash 2. No es un modelo de lenguaje independiente: su función es generar bloques de tokens candidatos que un modelo objetivo, en este caso Qwen/Qwen3.8-27B, verifica y acepta o rechaza, acelerando la inferencia sin alterar la distribución de salida. Este repositorio contiene las conversiones GGUF del checkpoint original, listas para usar con llama.cpp y otros motores compatibles.

La relevancia de este modelo radica en que permite acelerar la generación de texto de Qwen3.8-27B (un modelo denso de 27B parámetros) hasta casi 3 veces la velocidad de decodificación autoregresiva, manteniendo exactamente la misma salida en modo greedy y preservando la distribución en muestreo. DFlash 2 introduce una arquitectura de difusión por bloques con convoluciones dinámicas de dos taps, que evita la degradación del borrador hacia el final del bloque. El modelo tiene 1.924.404.480 parámetros y se distribuye en cuantizaciones Q4_K_M, Q8_0 y BF16, con tamaños de archivo de 1,1 GB, 2,0 GB y 3,8 GB respectivamente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Block-diffusion drafter con selector de ruta y convoluciones dinamicas de dos taps |
| Parametros totales | 1.924.404.480 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (hereda la del modelo objetivo, Qwen3.8-27B) |
| Tipos de cuantizacion | Q4_K_M, Q8_0, BF16 |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (safetensors del checkpoint original en incoai/Qwen3.8-27B-DFlash2) |

## Arquitectura y entrenamiento

DFlash 2 es un drafter de difusión por bloques para decodificación especulativa. A diferencia de los drafters autoregresivos tradicionales, predice un bloque completo de tokens en una sola pasada, manteniendo los mejores candidatos en cada posición. Un selector ligero traza después una ruta coherente a través de esos candidatos. La columna vertebral utiliza convoluciones dinámicas de dos taps que evitan que el borrador se degrade hacia el final del bloque, un problema común en este tipo de modelos.

El modelo se entrena específicamente para imitar la distribución del modelo objetivo Qwen3.8-27B, de modo que la verificación sea lossless: en modo greedy, la salida coincide exactamente con la del modelo objetivo, y en muestreo se preserva la distribución original. No se han publicado detalles sobre el dataset de entrenamiento ni el proceso de alineación (RLHF/DPO) en la información disponible. El checkpoint base está disponible en incoai/Qwen3.8-27B-DFlash2 y las conversiones GGUF se generaron para su uso con llama.cpp (PR #27342).

## Capacidades

- Aceleración de inferencia mediante decodificación especulativa: genera bloques de tokens candidatos que el modelo objetivo verifica en paralelo, reduciendo el número de pasos de verificación.
- Compatibilidad con el modelo Qwen3.8-27B: diseñado específicamente para este modelo objetivo, aunque la arquitectura DFlash 2 es generalizable.
- Decodificación sin pérdida: la salida greedy coincide exactamente con la del modelo objetivo; el muestreo preserva la distribución.
- Soporte de cuantización: disponible en Q4_K_M, Q8_0 y BF16, lo que permite ajustar el equilibrio entre memoria y velocidad.
- Integración con llama.cpp: requiere una versión con soporte DFlash 2 (PR #27342) y se sirve mediante `llama-server` con la opción `--spec-type draft-dflash`.
- No es un modelo de generación de texto independiente: no puede usarse solo para generar respuestas, sino únicamente como componente de un servidor de decodificación especulativa.

## Casos de uso

- Despliegue de Qwen3.8-27B en producción con baja latencia: al usar DFlash 2 como drafter, se reduce el tiempo de generación de tokens en servicios de chat o agentes que requieren respuestas rápidas, manteniendo la calidad del modelo objetivo.
- Inferencia en hardware limitado: al ser un drafter pequeño (1,9B parámetros), puede ejecutarse en GPUs consumer junto con el modelo objetivo cuantizado, permitiendo servir Qwen3.8-27B en entornos con VRAM moderada.
- Integración en pipelines de agentes con razonamiento multi-paso: la aceleración de la decodificación es crítica en tareas que requieren múltiples llamadas al modelo, como planificación o tool calling; DFlash 2 reduce la latencia acumulada.
- Evaluación de modelos y experimentación: investigadores pueden comparar la velocidad de generación con y sin decodificación especulativa, midiendo el acceptance length y el throughput en diferentes cuantizaciones.
- Servicios de generación de código en CI/CD: al integrarse con llama.cpp, puede usarse en entornos de integración continua para generar código o documentación de forma más rápida, sin sacrificar exactitud.
- Aplicaciones de oficina automatizada: Qwen3.8-27B está orientado a tareas de automatización de oficina; DFlash 2 permite que estas tareas se ejecuten con menor latencia en despliegues locales o en la nube.

## Benchmarks y rendimiento

La model card proporciona datos de acceptance length (longitud de aceptación) para las tres cuantizaciones del drafter, evaluados con el modelo objetivo Qwen3.8-27B en Q4_K_M, usando los parámetros de muestreo recomendados (temperatura 1.0, top-p 0.95, top-k 20) y esfuerzo de razonamiento `xhigh`, con un máximo de 2048 tokens nuevos y los primeros ocho ejemplos de GSM8K como prompts.

| Cuantizacion del drafter | Acceptance length |
|---|---|
| BF16 | 5.28 |
| Q8_0 | 5.13 |
| Q4_K_M | 5.39 |

El acceptance length es el promedio por petición de tokens completados dividido por pasos de verificación; un valor más alto indica mayor eficiencia. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) para el drafter en sí, ya que no es un modelo de lenguaje completo. La evaluación completa del checkpoint base está disponible en la model card principal de incoai/Qwen3.8-27B-DFlash2.

## Requisitos de hardware

- VRAM estimada: el drafter en Q4_K_M ocupa 1,1 GB, en Q8_0 2,0 GB y en BF16 3,8 GB. Se suma a la VRAM del modelo objetivo (Qwen3.8-27B cuantizado, que requiere aproximadamente 15-20 GB en Q4_K_M).
- GPU recomendadas: para ejecutar el conjunto completo (modelo objetivo + drafter) se recomienda una GPU con al menos 24 GB de VRAM, como RTX 3090, RTX 4090 o A100. Con cuantizaciones agresivas del modelo objetivo, podría caber en GPUs de 16 GB, pero no es garantizable.
- Compatibilidad con consumer GPU: sí, siempre que se use el modelo objetivo cuantizado y el drafter en Q4_K_M o Q8_0.
- Opciones de despliegue: llama.cpp con soporte DFlash 2 (PR #27342), usando `llama-server` con las opciones `--spec-type draft-dflash` y `--spec-draft-n-max`. También se menciona soporte en otros motores en el blog de Inco AI, aunque no se detallan.
- Latencia y throughput: no se proporcionan cifras exactas de tokens por segundo, pero el blog indica una aceleración de casi 3× respecto a la decodificación autoregresiva. El acceptance length medido (5.13-5.39) sugiere que cada paso de verificación acepta alrededor de 5 tokens, lo que reduce significativamente el número de pasos.

## Comparativa con modelos similares

No se dispone de datos comparativos con otros drafters de decodificación especulativa (como EAGLE, Medusa o Lookahead) en la información proporcionada. DFlash 2 es un drafter específico para Qwen3.8-27B, y su principal ventaja es la generación por bloques en una sola pasada, frente a los drafters autoregresivos que generan token a token. No se pueden ofrecer comparaciones cuantitativas sin datos adicionales.

## Limitaciones y advertencias

- No es un modelo independiente: no puede generar texto por sí mismo; requiere el modelo objetivo Qwen3.8-27B y un servidor compatible con DFlash 2.
- Dependencia de la implementación: necesita una versión específica de llama.cpp (PR #27342) o motores que soporten el formato; no funciona con versiones estándar.
- Riesgo de alucinación y sesgos: al ser un drafter, no introduce sesgos propios, pero hereda los del modelo objetivo. No se han evaluado sesgos específicos del drafter.
- Limitaciones de contexto: la longitud de contexto efectiva depende del modelo objetivo; no se especifica un valor propio.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero el modelo objetivo Qwen3.8-27B tiene su propia licencia (Apache-2.0 según el repositorio de Alibaba), que debe verificarse.
- Rendimiento variable: la aceleración depende del modelo objetivo, del hardware y de la tarea; en algunos casos el acceptance length puede ser menor, reduciendo la ganancia de velocidad.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/incoai/Qwen3.8-27B-DFlash2-GGUF
- Checkpoint original (safetensors): https://huggingface.co/incoai/Qwen3.8-27B-DFlash2
- Espejo del repositorio GGUF: https://huggingface.co/z-lab/Qwen3.8-27B-DFlash2-GGUF
- Blog de Inco AI sobre DFlash 2: https://inco.ai/blog/dflash2/
- Repositorio GitHub de DFlash: https://github.com/z-lab/dflash
- Modelo objetivo Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- Conversiones GGUF del modelo objetivo: https://huggingface.co/ggml-org/Qwen3.8-27B-GGUF
- PR de llama.cpp con soporte DFlash 2: https://github.com/ggml-org/llama.cpp/pull/27342
