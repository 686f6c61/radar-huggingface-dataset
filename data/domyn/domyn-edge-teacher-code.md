# domyn/Domyn-Edge-Teacher-Code

## Resumen

Domyn Edge Teacher Code es un modelo de lenguaje denso de 4B parámetros desarrollado por Domyn, derivado de Domyn Edge SFT mediante un pase supervisado específico de código y software de ingeniería seguido de GRPO sobre problemas de programación con tests unitarios. Forma parte del segundo paquete de la release por fases de la familia Domyn Edge y su función principal es actuar como *teacher* de código dentro de la etapa de destilación on-policy multi-teacher (MOPD) del protocolo de post-entrenamiento de Domyn: puntúa token a token los rollouts del estudiante.

La arquitectura y el tokenizador son idénticos a los de Domyn Edge SFT, un transformer denso de 3.928.787.968 parámetros con pesos en bfloat16 y contexto de entrenamiento de 64k tokens. El modelo razona antes de responder y emite la solución final en un único bloque de código Python delimitado al final de la respuesta, con respuestas que en problemas difíciles superan con frecuencia los 30k tokens.

Es relevante ahora porque se publica como recurso totalmente abierto (licencia Apache 2.0, pesos safetensors, dataset de mezcla de entrenamiento) para investigación y reproducibilidad del pipeline MOPD. No es un asistente de propósito general: su utilidad está en la evaluación de rollouts y en la experimentación sobre post-entrenamiento de código, no en el despliegue como chatbot.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (misma arquitectura que Domyn Edge SFT) |
| Parámetros totales | 3.928.787.968 |
| Parámetros activos | No aplica (modelo denso) |
| Longitud de contexto | 64k tokens (contexto de entrenamiento; evaluación servida a 64k) |
| Tipos de cuantización | No disponible (pesos publicados en bfloat16) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (bfloat16) |

## Arquitectura y entrenamiento

El modelo es un transformer denso con la misma arquitectura y tokenizador que Domyn Edge SFT. El entrenamiento consta de dos etapas. Primero, un SFT de código de una época a 64k de contexto sobre datos de programación competitiva, código general, CUDA y software de ingeniería a nivel de repositorio. Segundo, GRPO (Group Relative Policy Optimization) asíncrono sobre problemas de programación, con recompensa definida como la fracción de tests unitarios que pasa el programa generado.

La innovación destacable no está en la arquitectura sino en el rol: el modelo se entrena para puntuar rollouts de un estudiante token a token dentro de la destilación on-policy multi-teacher (MOPD). La plantilla de chat es la de Domyn Edge SFT sin cambios, con una línea de identidad fija en el turno de sistema ("You are Domyn Edge, a model trained by Domyn."), y es la misma que se usó durante GRPO y en la evaluación publicada.

## Capacidades

- Generación de código en Python con razonamiento previo explícito y solución final en un bloque de código delimitado.
- Resolución de problemas de programación competitiva y verificación implícita contra tests unitarios (objetivo del entrenamiento GRPO).
- Código CUDA y tareas de software de ingeniería a nivel de repositorio.
- Razonamiento matemático, incluyendo matemáticas multilingües (de, en, es, fr, ru) según la suite de evaluación.
- Conocimiento y razonamiento general (evaluado en GPQA Diamond).
- Seguimiento de instrucciones (IFBench) y function calling (BFCL v4, incluidos modos multi-turn y memory).
- Modo *thinking* activado en todas las evaluaciones publicadas.
- Puntuación token a token de rollouts como teacher en MOPD (uso previsto principal).

## Casos de uso

- Destilación on-policy multi-teacher: usar el modelo como teacher de código que puntúa token a token los rollouts del estudiante Domyn Edge en la etapa MOPD, aprovechando su especialización en código y su señal de recompensa basada en tests unitarios.
- Reproducción de investigación en post-entrenamiento: replicar el pipeline SFT + GRPO sobre problemas con tests unitarios para estudiar dinámicas de recompensa verificable en modelos de 4B.
- Generación de código en pipelines de evaluación: servir el modelo con vLLM a 64k de contexto para generar soluciones a problemas de programación y medirlas con ejecutores de tests, gracias a su formato de salida consistente en un bloque Python final.
- Evaluación comparativa de modelos de código: emplear sus resultados publicados en HumanEval, MBPP, LiveCodeBench y BigCodeBench como referencia para calibrar modelos de tamaño similar en las mismas condiciones de muestreo.
- Generación de datos sintéticos de código: producir soluciones razonadas de alta longitud (más de 30k tokens en problemas difíciles) para construir datasets de entrenamiento o de preferencias.
- Estudio de fallos en razonamiento de código: analizar las trazas de razonamiento antes del bloque final para investigar dónde se rompe la lógica en problemas de programación competitiva.
- Experimentación con function calling y agentes: probar el comportamiento en BFCL v4 (multi-turn, memory) como caso de evaluación acotado, no como asistente de producción.

## Benchmarks y rendimiento

Comparación del teacher frente al estudiante Domyn Edge SFT en la suite general (porcentajes):

| Grupo | Benchmark | Métrica | Domyn Edge SFT | Teacher Code | Δ |
|---|---|---|---:|---:|---:|
| Matemáticas | AIME 2026 | avg@10 | 61.3 | 66.3 | +5.0 |
| Matemáticas multilingües | MGSM (de, en, es, fr, ru) | accuracy | 85.8 | 87.5 | +1.7 |
| Conocimiento y razonamiento | GPQA Diamond | pass@1 | 56.3 | 65.4 | +9.1 |
| Seguimiento de instrucciones | IFBench | prompt strict pass@1 | 24.1 | 26.0 | +1.9 |
| Function calling | BFCL v4 sin búsqueda web (overall) | pass@1 | 36.5 | 37.7 | +1.2 |
| Function calling | BFCL v4 (non-live) | pass@1 | 51.9 | 55.8 | +3.9 |
| Function calling | BFCL v4 (live) | pass@1 | 75.9 | 75.4 | -0.5 |
| Function calling | BFCL v4 (multi-turn) | pass@1 | 35.9 | 36.0 | +0.1 |
| Function calling | BFCL v4 (memory) | pass@1 | 27.3 | 31.4 | +4.1 |
| Agéntico | SWE-bench Verified | pass@1 | 33.6 | 25.0 | -8.6 |
| Código | LiveCodeBench (set completo, 1.055 problemas) | pass@1 | 73.0 | 74.0 | +1.0 |

Comparación en la suite de código frente a Qwen3.5 4B (porcentajes):

| Benchmark | Métrica | Teacher Code | Qwen3.5 4B | Δ |
|---|---|---:|---:|---:|
| HumanEval | pass@1 | 92.1 | 89.6 | +2.5 |
| MBPP (sanitized) | pass@1 | 82.9 | 72.0 | +10.9 |
| CRUXEval-O | pass@1 | 72.1 | 84.1 | -12.0 |
| CRUXEval-I | pass@1 | 81.4 | 89.1 | -7.7 |
| LiveBench coding | pass@1 | 64.2 | 72.1 | -7.9 |
| LiveCodeBench (set Qwen, 131 problemas) | pass@1 | 53.1 | 47.3 | +5.8 |
| BigCodeBench | pass@1 | 33.0 | 46.9 | -13.9 |

Ajustes de evaluación: servido con vLLM en bfloat16 a 64k de contexto, thinking activado. Para HumanEval, MBPP, CRUXEval y LiveBench coding: temperatura 1.0, top-p 0.95, top-k 20, min-p 0, sin penalización de presencia ni repetición. Para LiveCodeBench y BigCodeBench: temperatura 0.6, top-p 0.95, top-k 20, min-p 0, sin penalizaciones. Qwen3.5 4B se evalúa con los mismos ajustes y su propia plantilla de chat.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 8 GB solo para pesos (3.928.787.968 parámetros × 2 bytes), más overhead de KV cache que crece con el contexto; a 64k de contexto el consumo adicional es significativo.
- Cuantización: no se publican pesos cuantizados oficiales; al ser un transformer denso estándar con safetensors, es convertible a GGUF/AWQ/GPTQ, pero no hay artefactos ni validación oficial.
- GPU recomendadas: A100 40/80 GB o H100 para servir a 64k de contexto con lotes; en consumer, RTX 4090 (24 GB) permite cargar los pesos en bf16 con margen para contexto moderado, aunque 64k completos requieren planificación de KV cache.
- Despliegue: vLLM es la opción usada en la evaluación oficial; Transformers es compatible según la model card. No se documentan instrucciones para llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. La model card advierte que las respuestas a problemas difíciles superan a menudo los 30k tokens, por lo que la latencia efectiva es alta y conviene reservar `max_new_tokens` amplio.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | HumanEval | MBPP | LiveCodeBench (set Qwen) | Licencia |
|---|---|---:|---:|---:|---:|---|
| Domyn Edge Teacher Code | 3.93B densos | 64k | 92.1 | 82.9 | 53.1 | Apache 2.0 |
| Qwen3.5 4B | ~4B (no detallado) | no disponible | 89.6 | 72.0 | 47.3 | no disponible |
| Domyn Edge SFT (base) | 3.93B densos | 64k | no disponible | no disponible | no disponible | Apache 2.0 |

Frente a Qwen3.5 4B, el teacher gana en HumanEval (+2.5), MBPP (+10.9) y LiveCodeBench reciente (+5.8), pero pierde en CRUXEval-O (-12.0), CRUXEval-I (-7.7), LiveBench coding (-7.9) y BigCodeBench (-13.9). Frente a su base Domyn Edge SFT, mejora en código (LiveCodeBench +1.0), matemáticas (AIME +5.0), GPQA (+9.1) y memoria en function calling (+4.1), pero retrocede en SWE-bench Verified (-8.6). No se dispone de datos de otros modelos comparables en la información proporcionada.

## Limitaciones y advertencias

- No es un asistente de propósito general: está diseñado como teacher para puntuar rollouts en MOPD; su uso como chatbot de producción no está respaldado por el autor.
- Solo soporta inglés; no hay soporte declarado de otros idiomas, aunque se evalúe en matemáticas multilingües.
- Riesgo de alucinación y de soluciones incorrectas que parecen plausibles: la recompensa de GRPO se basa en tests unitarios, lo que no garantiza corrección fuera de la distribución de problemas de entrenamiento.
- Regresión en tareas agénticas de repositorio: SWE-bench Verified cae de 33.6 a 25.0 respecto al modelo base, lo que desaconseja su uso en flujos agénticos de ingeniería de software.
- Debilidad relativa en ejecución de código y benchmarks de instrucciones complejas (CRUXEval, BigCodeBench, LiveBench coding) frente a Qwen3.5 4B.
- Longitud de salida elevada: respuestas de más de 30k tokens en problemas difíciles implican coste computacional y latencia altos; hay que dimensionar `max_new_tokens` y la KV cache.
- Pesos solo en bfloat16: no hay cuantizaciones oficiales publicadas, lo que limita el despliegue en hardware de gama baja sin conversión manual.
- Licencia Apache 2.0 permite uso comercial, pero el autor restringe explícitamente el propósito a investigación y reproducibilidad; conviene revisar los términos de la familia Domyn Edge antes de integrarlo en producto.
- Sin datos publicados de sesgos; al entrenarse principalmente con datos de código en inglés, es esperable un sesgo hacia ese dominio y ese idioma.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/domyn/Domyn-Edge-Teacher-Code
- Modelo base (Domyn Edge SFT): https://huggingface.co/domyn/Domyn-Edge-SFT
- Dataset de entrenamiento: https://huggingface.co/datasets/domyn/Domyn-Edge-Teacher-Code-Mix
- Qwen3.5 4B (referencia comparativa): https://huggingface.co/Qwen/Qwen3.5-4B
- Organización Domyn en Hugging Face: https://huggingface.co/domyn
