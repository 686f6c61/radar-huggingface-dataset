# agurung/cobalt-seeded-rl-base-ramp25-stoppen-gen4k-ep2-ncp10-base

## Resumen

El modelo `agurung/cobalt-seeded-rl-base-ramp25-stoppen-gen4k-ep2-ncp10-base` es un checkpoint de aprendizaje por refuerzo (RL) construido sobre el modelo base `Qwen/Qwen3-4B-Instruct-2507`. Lo desarrolla el usuario `agurung` como parte de un experimento de investigación (proyecto `eaiexp-paper-final`) orientado a mejorar la generación de código mediante RL directo sobre el modelo base, sin una etapa previa de ajuste supervisado (SFT). El objetivo es resolver problemas de programación competitiva del conjunto `cobalt-train frontier`, donde el modelo base fallaba en la mayoría de los intentos.

El checkpoint se guardó en el paso global 16 de un run de RL con el algoritmo GRPO (Group Relative Policy Optimization) implementado en OpenRLHF. Se seleccionó como el mejor checkpoint por su métrica `pass@8` en validación. Con 4.411.424.256 parámetros (4,4B), es un modelo compacto que puede ejecutarse en GPUs de consumo, aunque su especialización en generación de código limita su uso a tareas relacionadas con programación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (basada en Qwen3-4B-Instruct-2507) |
| Parametros totales | 4.411.424.256 (4,4B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible (heredada del modelo base Qwen3-4B-Instruct-2507) |
| Tipos de cuantizacion | No disponible (el repositorio contiene pesos en safetensors; no se mencionan cuantizaciones) |
| Idiomas soportados | No disponible (el modelo base Qwen3 soporta multilingue, pero no se especifica para este checkpoint) |
| Licencia | No disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del modelo base `Qwen/Qwen3-4B-Instruct-2507`, un transformer decoder-only de 4,4B parámetros. No se proporcionan detalles adicionales sobre la arquitectura interna (número de capas, cabezas de atención, etc.) en la información disponible.

El entrenamiento consiste en un pipeline de RL con el algoritmo GRPO, aplicado directamente sobre el modelo base sin una etapa de SFT previa. La recompensa es binaria: 1.0 si el programa generado pasa todos los tests del problema, 0.0 en caso contrario. Se aplican dos penalizaciones adicionales: una penalización por truncamiento (respuestas truncadas reciben -1.0) y una penalización DAPO overlong (respuestas en los últimos 1024 tokens antes del límite reciben una penalización aditiva que aumenta hasta -0.25). El run usó 8 muestras por prompt, un batch de rollout de 128, un máximo de 4096 tokens nuevos por rollout, 2 episodios y una tasa de aprendizaje de 1e-06 constante. El dataset de entrenamiento y validación son problemas del `cobalt-train frontier` (1833 problemas de entrenamiento y 112 de validación) que el modelo base resolvió en como máximo 2 de 64 muestras.

## Capacidades

- Generación de código: el modelo está especializado en escribir programas que resuelven problemas de programación competitiva, validados mediante tests automáticos.
- Razonamiento para programación: gracias al entrenamiento con RL, el modelo aprende a explorar múltiples soluciones y a mejorar su tasa de éxito en problemas difíciles.
- No se mencionan capacidades de tool calling, agentes, visión, audio ni otras tareas de lenguaje general en la información disponible.

## Casos de uso

- Resolución de problemas de programación competitiva: el modelo puede generar soluciones a problemas de algoritmia y estructuras de datos, útil para plataformas de entrenamiento o competiciones.
- Generación de código en entornos de investigación: sirve como punto de partida para estudiar técnicas de RL aplicadas a la generación de código, permitiendo reproducir experimentos de mejora de modelos base.
- Evaluación de pipelines de RL: al ser un checkpoint intermedio (paso 16), puede usarse para analizar la evolución de métricas durante el entrenamiento y comparar con otros checkpoints.
- Componente en sistemas de autocompletado de código: aunque no está diseñado para ello, puede integrarse en herramientas de sugerencia de código para problemas específicos con tests definidos.
- Benchmark de modelos de código de tamaño pequeño: permite comparar el rendimiento de un modelo de 4,4B entrenado con RL frente a otros modelos similares en tareas de programación.
- Estudio de penalizaciones en RL: el modelo incorpora técnicas como el stop-properly penalty y el DAPO overlong penalty, por lo que es útil para investigar el efecto de estas modificaciones en el rendimiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Los únicos datos de rendimiento reportados corresponden a la evaluación en el conjunto de validación held-out de problemas de código (112 problemas), con 8 muestras por problema:

| Metrica | Valor |
|---|---|
| pass@1 (media por problema) | 0.5290 |
| pass@8 (problema resuelto si alguna muestra es correcta) | 1.3379 |

Estos valores indican que, en promedio, el modelo resuelve correctamente el 52,9% de los problemas en el primer intento, y el 133,79% en términos de pass@8 (la métrica puede superar 1.0 porque cuenta problemas resueltos por cualquiera de las 8 muestras, y el valor se normaliza de forma no estándar en el informe). No se dispone de comparación con el modelo base u otros modelos.

## Requisitos de hardware

- VRAM estimada: con pesos en BF16 (formato habitual de safetensors), el modelo necesita aproximadamente 8,8 GB de VRAM solo para los pesos. Con overhead de inferencia, se recomienda al menos 12 GB.
- GPUs recomendadas: una RTX 3090, RTX 4090, A10 o A100 (24 GB) puede ejecutar el modelo en BF16. Con cuantización a 8 bits o 4 bits, podría caber en GPUs con 8-10 GB de VRAM (por ejemplo, RTX 3070, RTX 4060 Ti).
- Opciones de despliegue: vLLM (compatible con el modelo, como se indica en la model card), llama.cpp para cuantización GGUF (si se generan), o Hugging Face Transformers con `AutoModelForCausalLM`.
- Latencia y throughput: no se proporcionan datos específicos. Para un modelo de 4,4B en una GPU moderna, se espera una latencia de decodificación de unos 20-50 ms por token en BF16, dependiendo del hardware y del batch.

## Comparativa con modelos similares

No se dispone de datos comparativos con otros modelos en la información proporcionada. El modelo base `Qwen3-4B-Instruct-2507` es el punto de referencia natural, pero no se reportan sus métricas en el mismo conjunto de validación. Tampoco se mencionan alternativas como CodeLlama-7B, DeepSeek-Coder-6.7B o modelos similares. Por tanto, no es posible realizar una comparativa objetiva con los datos disponibles.

## Limitaciones y advertencias

- Es un checkpoint de investigación, no un modelo final pulido: se guardó en el paso 16 de un run de RL y puede no haber convergido completamente.
- Especialización estrecha: solo se ha entrenado para generar código que pase tests; no está alineado para tareas de chat, razonamiento general o comprensión de instrucciones complejas.
- Riesgo de alucinación en código: como cualquier modelo generativo, puede producir soluciones sintácticamente válidas pero incorrectas lógicamente, especialmente en problemas fuera de su dominio de entrenamiento.
- Sesgos del conjunto de entrenamiento: los problemas de `cobalt-train frontier` pueden no representar la diversidad de tareas de programación del mundo real, lo que limita su generalización.
- Licencia no especificada: al no indicarse la licencia, el uso comercial y la redistribución pueden estar sujetos a restricciones legales no definidas; se recomienda contactar al autor antes de usar el modelo en producción.
- Dependencia del modelo base: las limitaciones de `Qwen3-4B-Instruct-2507` (como posibles sesgos lingüísticos o alucinaciones) se heredan, aunque el entrenamiento con RL puede amplificarlas en el dominio del código.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/agurung/cobalt-seeded-rl-base-ramp25-stoppen-gen4k-ep2-ncp10-base
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Logs de entrenamiento: proyecto Weights & Biases `eaiexp-paper-final`, run `seeded_rl_base_ramp25_stoppen_gen4k_ep2_ncp10_base` (sin URL directa en la información disponible).
