# calneymgp/Qwen3.8-27B-NVFP4-lmhead4-recipe

## Resumen

Este repositorio, creado por calneymgp, no contiene pesos de modelo, sino una receta completa y reproducible para optimizar la inferencia del modelo Qwen3.8-27B en una GPU RTX 5090 de 32 GB. La receta incluye la cuantización manual del `lm_head` de BF16 a NVFP4, la activación de decodificación especulativa nativa MTP (Multi-Token Prediction) con EAGLE 3/1/4, el uso de KV cache en fp8_e4m3 y un lanzador SGLang ajustado. El resultado medido es un aumento del throughput de 68,0 a 151,0 tokens por segundo en cargas de trabajo agénticas, con una calidad objetiva sin cambios (9/10 en pruebas verificables).

El modelo base, Qwen3.8-27B, es un transformer denso híbrido con Gated DeltaNet, con una ventana de contexto de 160 352 tokens. La relevancia de esta receta radica en demostrar que es posible ejecutar un modelo de 27B con alta velocidad en hardware de consumo (Blackwell), manteniendo la fidelidad de las respuestas y el soporte de tool calling. Además, documenta dos errores metodológicos comunes en la evaluación de decodificación especulativa: medir sobre prosa creativa en lugar del workload real, y usar similitud de cadenas en lugar de pruebas de corrección objetiva.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso híbrido con Gated DeltaNet (modelo base Qwen3.8-27B) |
| Parametros totales | 27B (según nomenclatura del modelo base) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 160 352 tokens (medido) |
| Tipos de cuantizacion | NVFP4 (lm_head y pesos del modelo base), KV cache en fp8_e4m3 |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 (repositorio); la del modelo base no se especifica en la información |
| Formato de pesos | No disponible (el repositorio no contiene pesos, solo scripts y recetas) |

## Arquitectura y entrenamiento

El repositorio no describe un entrenamiento desde cero, sino una optimización de inferencia sobre el modelo base Qwen3.8-27B, que es un transformer denso con atención híbrida Gated DeltaNet. La contribución principal es la cuantización del `lm_head` de BF16 a NVFP4, realizada mediante un script idempotente y no destructivo. Esta cuantización reduce el tamaño del cabezal de salida y, combinada con la decodificación especulativa MTP (que usa un cabezal de predicción multi-token) y EAGLE 3/1/4, acelera la generación de tokens en cargas de trabajo con alta predictibilidad, como llamadas a herramientas y código.

El entrenamiento del modelo base no está documentado en la información proporcionada. La receta incluye además la selección del backend de atención `triton` en lugar de `flashinfer`, que en este hardware resultó un 11 % más rápido, y el uso de KV cache en fp8_e4m3 para reducir el consumo de memoria. No se mencionan técnicas de RLHF o DPO.

## Capacidades

- Generación de texto y razonamiento: el modelo base Qwen3.8-27B es capaz de tareas de lenguaje general, aunque la receta no modifica estas capacidades.
- Soporte de tool calling y function calling: el modelo base soporta llamadas a herramientas; la receta optimiza específicamente este caso, logrando que las llamadas a herramientas sean un 13 % más rápidas que otras solicitudes con decodificación especulativa MTP.
- Capacidades de agente y multi-step reasoning: el modelo puede ejecutar conversaciones multi-turno con razonamiento encadenado; la receta incluye un benchmark específico para medir el beneficio de la caché de prefijo en este escenario.
- Capacidades multilingües: solo se declara inglés en la información.
- Capacidades especiales: la receta no añade visión ni audio; se centra en optimización de inferencia.

## Casos de uso

- Despliegue de agentes con tool calling en producción: la receta está diseñada para cargas de trabajo agénticas, donde la decodificación especulativa MTP acelera las llamadas a herramientas un 150 % (de 58,5 a 146,3 tok/s). Es adecuada para sistemas que requieren baja latencia en interacciones multi-turno con APIs.
- Servicio de modelos de 27B en GPUs de consumo: con una RTX 5090 de 32 GB se alcanzan 151 tok/s en un solo stream, lo que permite ejecutar un modelo de este tamaño en hardware no profesional, reduciendo costes de infraestructura.
- Optimización de latencia para aplicaciones interactivas: el perfil `agent` del lanzador SGLang está ajustado para minimizar el tiempo de primera respuesta en conversaciones con herramientas.
- Evaluación de calidad en entornos de producción: el script `correctness.py` proporciona un control de calidad objetivo (9/10 en preguntas verificables) que puede integrarse en pipelines de CI/CD para detectar regresiones tras cambios de configuración.
- Benchmarking de decodificación especulativa: la receta incluye un benchmark segmentado por tipo de carga (prosa, código, tool call, multi-tool, razonamiento) que permite comparar configuraciones de forma fiable, evitando los errores metodológicos documentados.
- Investigación en optimización de inferencia: el repositorio sirve como referencia reproducible para estudiar el impacto de la cuantización del `lm_head`, el backend de atención y la caché de prefijo en modelos híbridos.

## Benchmarks y rendimiento

La información proporcionada incluye mediciones de throughput y calidad, pero no benchmarks estándar como MMLU o HumanEval. Los datos de rendimiento se resumen a continuación.

| Configuración | Throughput (tok/s) en workload agéntico | Notas |
|---|---|---|
| Sin decodificación especulativa | 68,0 | Medido en prosa: 75,3 |
| Con MTP | 120,5 | Medido en prosa: 105,8 |
| Con DSpark | 94,5 | Medido en prosa: 53–63 |
| Configuración completa (MTP + EAGLE + lm_head NVFP4 + triton) | 151,0 (single-stream) · 233,1 (agregado @4 concurrentes) | Accept length 2,25–3,67 |

Calidad objetiva (10 preguntas verificables: aritmética, geografía, lógica, API estándar, literatura):

| | BF16 lm_head | NVFP4 lm_head |
|---|---|---|
| Respuestas correctas | 9/10 | 9/10 |
| Tool call (nombre + argumentos) | — | 100 % idéntico |
| JSON estricto | — | 100 % idéntico |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- GPU: RTX 5090 32 GB (sm_120, arquitectura Blackwell) con soporte para NVFP4. El script de preflight verifica que la GPU sea sm_120.
- VRAM: 32 GB son suficientes para el modelo NVFP4 (~20 GB de descarga) más la caché KV en fp8_e4m3 y el overhead del motor.
- No cabe en GPUs consumer de generaciones anteriores (Ampere, Turing) por falta de soporte NVFP4.
- Opciones de despliegue: SGLang (imagen `lmsysorg/sglang:qwen38-27b`), con perfiles `agent` y `long-context`. No se mencionan otros motores como vLLM o llama.cpp.
- Latencia y throughput: 151,0 tok/s en un solo stream, 233,1 tok/s agregado con 4 concurrentes. Accept length entre 2,25 y 3,67.

## Comparativa con modelos similares

No se dispone de comparaciones con otros modelos de la misma categoría en la información proporcionada. La única comparativa disponible es entre configuraciones del mismo modelo base:

| Configuración | Throughput (tok/s) | Calidad (correctas/10) |
|---|---|---|
| Sin optimización (BF16, sin spec decoding) | 68,0 | 9/10 |
| Con MTP | 120,5 | no medido |
| Con MTP + EAGLE + lm_head NVFP4 + triton | 151,0 | 9/10 |

No se dispone de datos de otros modelos comparables (p. ej., Llama 3.1 8B, Mistral 7B) en el mismo hardware.

## Limitaciones y advertencias

- El repositorio no contiene pesos; es una receta que descarga el modelo base desde HuggingFace. Si el modelo base se retira o cambia, la receta puede fallar.
- La cuantización del `lm_head` a NVFP4 puede introducir cambios en las salidas a temperatura 0, aunque el autor reporta que la calidad objetiva no se degrada. Se recomienda ejecutar el script de corrección antes de usar en producción.
- El rendimiento medido depende del workload: en prosa creativa, la decodificación especulativa ofrece menos beneficio (accept length 1,25 frente a 3,52 en cargas agénticas). No generalizar los resultados a otros tipos de texto.
- La licencia Apache 2.0 del repositorio no cubre necesariamente el modelo base Qwen3.8-27B; es necesario verificar la licencia del modelo base para uso comercial.
- Solo se declara soporte para inglés; no se garantiza el rendimiento en otros idiomas.
- El hardware requerido es específico: solo GPUs Blackwell (sm_120) con soporte NVFP4. No funcionará en GPUs más antiguas.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/calneymgp/Qwen3.8-27B-NVFP4-lmhead4-recipe
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B (enlace inferido del campo `base_model`; no se proporciona URL directa en la información)
