# agurung/cobalt-seeded-rl-base-ramp25-stoppen-gen4k-ep2-ncp5-nb21groot16

## Resumen
Este modelo es un checkpoint de aprendizaje por refuerzo (RL) basado en Qwen/Qwen3-4B-Instruct-2507, publicado por el usuario agurung. Fue entrenado con el algoritmo GRPO de OpenRLHF, aplicando RL directamente sobre el modelo base sin una etapa intermedia de SFT adicional. Su objetivo es mejorar la generación de código, utilizando una recompensa binaria de corrección de código (1.0 si el programa generado pasa los tests, 0.0 en caso contrario).

El modelo tiene 4.411.424.256 parámetros (4.4B) y una arquitectura transformer decoder-only (familia Qwen3). Se trata de un checkpoint intermedio guardado en el paso global 8 de una ejecución de RL, y es el mejor checkpoint por pass@8 según la model card. Está pensado para investigación en RL aplicada a generación de código, no para uso en producción.

La relevancia actual radica en que explora la aplicación directa de RL sobre un modelo instruido, sin SFT adicional, e incorpora técnicas de penalización para evitar truncamiento y respuestas demasiado largas. No se dispone de datos sobre la longitud de contexto ni sobre los idiomas soportados.

## Especificaciones técnicas
| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen3) |
| Parametros totales | 4.411.424.256 (~4.4B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento
El modelo parte de Qwen/Qwen3-4B-Instruct-2507, un transformer decoder-only de 4.400 millones de parámetros. Sobre él se aplica un entrenamiento de RL con el algoritmo GRPO (Group Relative Policy Optimization) de OpenRLHF, sin una etapa intermedia de SFT adicional. La recompensa es binaria: 1.0 si el programa generado supera los tests del problema, 0.0 si falla.

El dataset de entrenamiento es el subconjunto "cobalt-train ≤2/64 frontier", compuesto por 1.833 problemas de entrenamiento y 112 de validación, seleccionados porque el modelo base los resolvía en como máximo 2 de 64 muestras. El entrenamiento incorpora dos técnicas de penalización: la penalización "stop-properly" (recompensa -1.0 para respuestas truncadas) y la penalización "DAPO overlong" (penalización aditiva de hasta -0.25 en los últimos 1024 tokens antes del límite). Se usaron 8 muestras por prompt, batch de rollout y entrenamiento de 128, un máximo de 4.096 tokens nuevos por rollout, 2 episodios y una tasa de aprendizaje del actor de 1e-06 constante.

## Capacidades
- Generación de código: entrenado con recompensa binaria de corrección, el modelo está optimizado para producir programas que superen los tests de problemas de programación.
- Razonamiento algorítmico: los problemas de la frontera cobalt requieren razonamiento de varios pasos, aunque no se especifica un modo de pensamiento explícito.
- Tool calling / function calling: no disponible.
- Soporte de agentes y multi-step reasoning: no disponible.
- Capacidades multilingües: no disponible.
- Capacidades especiales (visión, audio): no disponibles; el pipeline es exclusivamente text-generation.

## Casos de uso
- Generación de soluciones para problemas de programación competitiva: el modelo puede producir código para problemas algorítmicos de dificultad media-alta, basándose en los 1.833 problemas de entrenamiento de la frontera cobalt. Es adecuado para entornos de entrenamiento o evaluación de habilidades de programación.
- Asistencia en la escritura de pruebas unitarias: dado que la recompensa se basa en pasar tests, el modelo puede generar código que cumpla con especificaciones de pruebas, útil en el desarrollo de software dirigido por tests.
- Automatización de corrección de bugs: se puede integrar en pipelines de CI/CD para proponer parches que superen los tests existentes, aunque requiere validación humana.
- Generación de prototipos funcionales: a partir de descripciones de problemas, el modelo puede generar implementaciones rápidas para prototipos, reduciendo el tiempo de desarrollo en fases iniciales.
- Evaluación de técnicas de RL para código: al ser un checkpoint intermedio de una ejecución de GRPO con penalizaciones específicas, puede usarse como referencia en investigaciones sobre RL aplicada a generación de código.
- Punto de partida para fine-tuning adicional: el modelo puede servir como base para experimentos de SFT o RL posteriores, dado que es un checkpoint intermedio de una ejecución de RL.

## Benchmarks y rendimiento
| Metrica | Valor |
|---|---|
| pass@1 (val, 8 muestras/problema) | 0.2817 |
| pass@8 (val, problema resuelto si alguna muestra es correcta) | 1.6470 |

El valor de pass@8 es superior a 1, lo que indica una definición no estándar o un posible error en la métrica. Se reproduce tal como aparece en la model card. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware
- VRAM estimada para inferencia: no disponible. El modelo tiene 4.411.424.256 parámetros, lo que en FP16 supone aproximadamente 8.8 GB y en 8 bits aproximadamente 4.4 GB.
- GPU recomendadas: no disponible.
- Consumer GPU: no disponible, aunque el tamaño sugiere que podría ejecutarse en GPUs de consumo con cuantización.
- Opciones de despliegue: compatible con transformers (según la model card) y vLLM (`vllm serve`).
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares
No se han publicado resultados comparativos en la información disponible. El modelo base es Qwen/Qwen3-4B-Instruct-2507, pero no se dispone de métricas de este checkpoint frente a otras alternativas.

## Limitaciones y advertencias
- Sesgos conocidos: no disponibles.
- Riesgo de alucinación: no evaluado; como modelo generativo, puede producir código incorrecto o inventar APIs inexistentes.
- Limitaciones de contexto o idioma: no disponibles.
- Restricciones de licencia: la licencia no está disponible, por lo que el uso comercial requiere verificación previa con el autor.
- Caveat para producción: es un checkpoint de investigación con 0 descargas y 0 likes, no validado en entornos reales. La métrica pass@8 con valor >1 sugiere una definición no estándar o un posible error; interpretar con cautela.
- Especialización: el entrenamiento se limitó a problemas de programación de la frontera cobalt, por lo que el rendimiento en otros dominios puede degradarse.

## Enlaces
- HuggingFace: https://huggingface.co/agurung/cobalt-seeded-rl-base-ramp25-stoppen-gen4k-ep2-ncp5-nb21groot16
- Repos similares:
  - https://huggingface.co/agurung/cobalt-seeded-rl-base-ramp25-stoppen-gen4k-ep2-ncp10-mgroot16
  - https://huggingface.co/agurung/cobalt-seeded-rl-base-ramp25-stoppen-gen4k-ep2-ncp10-base
