# agurung/cobalt-seeded-rl-base-ramp25-stoppen-gen4k-ep2-ncp10-base-b20

## Resumen

Este modelo es un checkpoint de reinforcement learning (RL) obtenido mediante el algoritmo GRPO (Group Relative Policy Optimization) implementado en OpenRLHF, aplicado directamente sobre el modelo base Qwen/Qwen3-4B-Instruct-2507. El autor, agurung, lo ha entrenado para mejorar la capacidad de generación de código a partir de problemas de programación, utilizando un conjunto de datos denominado "cobalt-train ≤2/64 frontier" compuesto por 1833 problemas de entrenamiento y 112 de validación, todos ellos clasificados como difíciles para el modelo base (el modelo base los resuelve en como máximo 2 de cada 64 muestras).

El checkpoint se guardó en el paso global 8 de la ejecución de RL y se seleccionó como el mejor según la métrica pass@8. La recompensa utilizada es binaria: 1.0 si el programa generado supera los tests del problema y 0.0 en caso contrario. Se aplican penalizaciones adicionales para evitar truncamiento y respuestas demasiado largas. Con 4.411 millones de parámetros, este modelo se posiciona como una alternativa de tamaño medio para tareas de razonamiento y generación de código, aunque su ficha no especifica la licencia ni los idiomas soportados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (arquitectura Qwen3, basada en Qwen/Qwen3-4B-Instruct-2507) |
| Parametros totales | 4.411.424.256 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (repo en safetensors, sin cuantizaciones publicadas) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Qwen3-4B-Instruct-2507, un transformer decoder-only con atención causal estándar, diseñado para generación de texto y código. No se aplicó ninguna fase de fine-tuning supervisado (SFT) antes del RL; el entrenamiento se realizó directamente sobre el modelo base. El algoritmo utilizado es GRPO con ventajas normalizadas por grupo y sin penalización KL. Se emplearon dos mecanismos de regularización: una penalización "stop-properly" que asigna recompensa -1.0 a las respuestas truncadas, y una penalización DAPO overlong que añade un castigo incremental de hasta -0.25 para respuestas que se acercan al límite de tokens (los últimos 1024 tokens antes del corte). Cada prompt genera 8 muestras (samples per prompt), con un tamaño de lote de rollout de 128 y un lote de entrenamiento de 128. El número máximo de tokens nuevos por rollout es 4096, y se ejecutaron 2 episodios con una tasa de aprendizaje constante de 1e-6. El conjunto de datos de entrenamiento y validación proviene del "cobalt-train ≤2/64 frontier", una selección de problemas que el modelo base no podía resolver de forma consistente.

## Capacidades

- Generación de código: el modelo está optimizado para producir programas que superen tests de problemas de programación, con una recompensa binaria que premia la corrección funcional.
- Razonamiento sobre problemas algorítmicos: al estar entrenado con RL sobre problemas difíciles, mejora la capacidad de razonamiento paso a paso para encontrar soluciones correctas.
- Generación de texto en general: al ser un modelo de lenguaje base, conserva la capacidad de generar texto coherente en tareas no específicas de código, aunque su entrenamiento se centra en código.
- No se especifican capacidades de tool calling, agentes, visión, audio o modo thinking en la información proporcionada.

## Casos de uso

- Generación de soluciones de programación competitiva: el modelo puede utilizarse para resolver problemas de plataformas como Codeforces o LeetCode, generando código que pase los tests. Su entrenamiento específico en problemas difíciles lo hace adecuado para este escenario.
- Asistente de desarrollo: integrado en un IDE o herramienta de autocompletado, puede sugerir fragmentos de código correctos para problemas algorítmicos concretos, especialmente cuando se le proporciona una descripción del problema.
- Evaluación de calidad de código: al generar múltiples soluciones (muestreo con temperatura), se puede usar para comparar distintas implementaciones o como generador de candidatos en sistemas de búsqueda de programas.
- Entrenamiento de otros modelos: al ser un checkpoint de RL, puede servir como punto de partida para fine-tuning posterior en tareas específicas de código, aprovechando las mejoras de razonamiento adquiridas.
- Investigación en RL aplicada a código: este modelo es útil para estudiar los efectos de GRPO sin SFT previo, la influencia de las penalizaciones de truncamiento y overlong, y la dinámica de entrenamiento en dominios de código.
- Generación de datos sintéticos de entrenamiento: las soluciones generadas por el modelo, aunque no siempre correctas, pueden filtrarse y utilizarse para crear datasets de entrenamiento para otros modelos más pequeños.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que las métricas de evaluación en este checkpoint no están disponibles en el log de entrenamiento. No se proporcionan puntuaciones de MMLU, HumanEval, GSM8K ni otras pruebas estándar.

## Requisitos de hardware

- VRAM estimada para inferencia: al tener 4.411 millones de parámetros, en precisión fp16/bf16 los pesos ocupan aproximadamente 8.8 GB. Con overhead de memoria para activaciones y caché, se recomienda al menos 12 GB de VRAM para inferencia en lote pequeño. Para cuantización 4-bit (si se generara), se podría reducir a unos 2.5-3 GB, pero no hay cuantizaciones publicadas en el repositorio.
- GPU recomendadas: tarjetas con 12 GB o más de VRAM, como NVIDIA RTX 3060 (12 GB), RTX 4070 (12 GB), RTX 4080 (16 GB), o GPUs de datacenter como A10, A100 o H100. Para entrenamiento adicional, se necesitaría al menos 24 GB de VRAM.
- Compatibilidad con GPU de consumo: sí, es posible ejecutar el modelo en GPUs de consumo con 12 GB o más, siempre que se use una cuantización adecuada o se limite el tamaño del lote.
- Opciones de despliegue: el modelo es compatible con vLLM (como se indica en la model card), llama.cpp, Ollama, TGI y transformers. Para vLLM, se recomienda usar la versión que soporte arquitecturas Qwen3.
- Latencia y throughput: no se han publicado datos específicos. Para un modelo de 4B en una GPU moderna, se espera una latencia de decodificación de aproximadamente 20-40 ms por token en fp16, y un throughput de 10-30 tokens por segundo por lote, dependiendo del hardware y la configuración.

## Comparativa con modelos similares

No se dispone de datos de rendimiento para comparar con otros modelos. Sin embargo, se puede comparar a nivel estructural con alternativas de tamaño similar:

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| agurung/cobalt-seeded-rl-base-ramp25-stoppen-gen4k-ep2-ncp10-base-b20 | 4.4B | no disponible | no disponible | Checkpoint RL sobre Qwen3-4B-Instruct |
| Qwen/Qwen3-4B-Instruct-2507 | 4.4B | no disponible (típicamente 32K en Qwen3) | Apache 2.0 (según Qwen) | Modelo base de referencia |
| CodeLlama-7B | 6.7B | 16K | Llama 2 license | Especializado en código, pero sin RL |

La comparativa es limitada porque no hay métricas de rendimiento publicadas para este checkpoint. Se recomienda evaluar el modelo en benchmarks de código propios antes de usarlo en producción.

## Limitaciones y advertencias

- Licencia no disponible: el repositorio no especifica la licencia, lo que impide su uso comercial sin riesgo legal. Se debe contactar al autor para obtener aclaraciones.
- Sesgos del modelo base: al partir de Qwen3-4B-Instruct, el modelo puede heredar sesgos presentes en los datos de entrenamiento originales de Qwen, aunque no se han documentado específicamente.
- Riesgo de alucinación: como cualquier modelo de lenguaje, puede generar código sintácticamente válido pero incorrecto o con errores lógicos. La recompensa binaria durante el entrenamiento reduce este riesgo en los problemas del conjunto de validación, pero no lo elimina fuera de ese dominio.
- Limitaciones de contexto e idioma: no se han especificado la longitud de contexto ni los idiomas soportados. Se recomienda asumir las capacidades del modelo base Qwen3-4B-Instruct-2507, pero no está confirmado.
- Especialización limitada: el entrenamiento se realizó sobre un subconjunto concreto de problemas (frontier ≤2/64). El modelo puede no generalizar bien a otros tipos de problemas de programación o a tareas de código que requieran APIs, frameworks o bibliotecas específicas.
- Sin métricas de evaluación: no hay benchmarks publicados, por lo que su rendimiento real en tareas estándar es desconocido.
- Checkpoint intermedio: es un checkpoint de RL en el paso 8, no un modelo final pulido. Puede presentar inestabilidades o comportamientos subóptimos en comparación con un modelo fine-tuned de forma completa.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/agurung/cobalt-seeded-rl-base-ramp25-stoppen-gen4k-ep2-ncp10-base-b20
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Repositorio OpenRLHF (framework de entrenamiento): https://github.com/OpenRLHF/OpenRLHF
- Proyecto W&B (mencionado en la model card, sin enlace directo): proyecto `eaiexp-paper-final`, run `seeded_rl_base_ramp25_stoppen_gen4k_ep2_ncp10_base_b20`
