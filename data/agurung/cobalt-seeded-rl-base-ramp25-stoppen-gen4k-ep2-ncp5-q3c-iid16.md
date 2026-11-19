# agurung/cobalt-seeded-rl-base-ramp25-stoppen-gen4k-ep2-ncp5-q3c-iid16

## Resumen

`agurung/cobalt-seeded-rl-base-ramp25-stoppen-gen4k-ep2-ncp5-q3c-iid16` es un checkpoint de aprendizaje por refuerzo (RL) derivado de `Qwen/Qwen3-4B-Instruct-2507`, publicado por el usuario agurung. No se trata de un modelo entrenado desde cero, sino del resultado de aplicar GRPO (Group Relative Policy Optimization) mediante OpenRLHF directamente sobre el modelo base de Qwen3, sin una fase previa de SFT adicional (seeding). El checkpoint corresponde al paso global 110 de la ejecución de RL identificada en el nombre del repositorio y se marca como el mejor hasta la fecha según la métrica pass@8.

El objetivo declarado es la generación de código verificable: la señal de recompensa es binaria y se basa en si el programa generado supera los tests del problema (1.0 si pasa, 0.0 si no). El entrenamiento se realizó sobre un conjunto de 1833 problemas de entrenamiento y 112 de validación ("cobalt-train ≤2/64 frontier"), filtrados para incluir solo problemas que el modelo base resolvía como máximo en 2 de 64 muestras, es decir, casos difíciles que maximizan la señal de aprendizaje.

La relevancia de esta ficha es acotada: se trata de un artefacto de investigación con documentación mínima, sin licencia declarada, sin idiomas especificados y sin resultados de benchmarks publicados en la información disponible. Su interés principal radica en documentar una receta concreta de RL sobre Qwen3-4B con penalizaciones anti-truncamiento (stop-properly y DAPO overlong), útil para quienes replican pipelines de RL para código.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen3-4B-Instruct-2507) |
| Parametros totales | 4.411.424.256 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base Qwen3-4B-Instruct-2507; no confirmada en la informacion proporcionada) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documentan cuantizaciones oficiales) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura transformer decoder-only de Qwen3-4B-Instruct-2507, con 4.411.424.256 parámetros totales. La innovación no está en la arquitectura sino en el procedimiento de ajuste: se aplica GRPO con OpenRLHF directamente sobre el modelo base, sin semilla SFT, usando ventajas normalizadas por grupo y sin penalización KL. La recompensa es binaria por corrección de código (1.0 si el programa pasa los tests del problema, 0.0 en caso contrario).

La receta incluye dos mecanismos de control de longitud y truncamiento: una penalización "stop-properly" que asigna recompensa -1.0 a las muestras truncadas (estilo ProRL), y una penalización DAPO overlong que aplica una penalización aditiva creciente hasta -0.25 en los últimos 1024 tokens antes del límite. Se generan 8 muestras por prompt, con batch de rollout y de entrenamiento de 128, un máximo de 4096 tokens nuevos por rollout, 2 episodios y una tasa de aprendizaje del actor constante de 1e-06. El conjunto de datos se compone de 1833 problemas de entrenamiento y 112 de validación, filtrados según un escaneo de dureza (`iid_canonical@64`) para retener solo problemas resueltos por el modelo base en 2 de 64 muestras como máximo. Las evaluaciones de validación se muestrean con temperatura 1.0.

## Capacidades

- Generación de texto y código en el dominio de problemas de programación verificables.
- Razonamiento orientado a la resolución de problemas de código con tests automáticos.
- Ajuste específico para producir programas que pasen suites de tests (objetivo directo de la recompensa).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible (no se declaran idiomas).
- Capacidades especiales (thinking mode, visión, audio): no disponible.

## Casos de uso

- Generación de código para problemas de programación competitiva: el checkpoint está entrenado específicamente con recompensa de corrección sobre tests, por lo que es adecuado para generar soluciones a enunciados con casos de prueba definidos.
- Evaluación de pipelines de RL para código: sirve como artefacto de referencia para comparar recetas GRPO con y sin penalizaciones de truncamiento sobre Qwen3-4B.
- Reproducción de experimentos de investigación: al documentarse la receta completa (pasos, batch, LR, penalizaciones), permite replicar el entrenamiento y analizar el efecto del filtrado de dificultad.
- Generación asistida en entornos de test unitario: puede integrarse en flujos donde el código generado se valida automáticamente contra una suite de tests antes de aceptarse.
- Estudio de dinámica de RL sin SFT previo: útil para investigadores que analizan cómo el RL directo sobre el modelo base altera el comportamiento de generación de código.
- Base para ajustes posteriores específicos de dominio: al ser un checkpoint intermedio con pesos safetensors estándar, puede servir de punto de partida para fine-tuning adicional en tareas de código.
- Servido mediante vLLM para experimentación: la model card documenta el comando `vllm serve` con la revisión `main`, lo que facilita su despliegue en pruebas de inferencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que las métricas de evaluación de este checkpoint "no están disponibles en el log de entrenamiento" y solo se declara que es el mejor checkpoint por pass@8 dentro de la ejecución.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; para un modelo de 4.411.424.256 parámetros, una estimación orientativa en FP16 sería de aproximadamente 9 GB de pesos, y en cuantizaciones de 8 bits o 4 bits, considerablemente menos, aunque no se documentan cuantizaciones oficiales.
- GPU recomendadas: no disponible en la información proporcionada.
- ¿Cabe en GPU de consumo? No confirmado en la documentación; por tamaño de parámetros es plausible en GPUs de consumo con suficiente VRAM, pero no se aporta dato oficial.
- Opciones de despliegue: transformers (`AutoModelForCausalLM`) y vLLM (`vllm serve ... --revision main`), según la model card. Otras opciones (llama.cpp, Ollama, TGI) no se documentan.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| agurung/cobalt-seeded-rl-base-ramp25-stoppen-gen4k-ep2-ncp5-q3c-iid16 | 4.411.424.256 | no disponible | RL (GRPO) sobre Qwen3-4B para código | no disponible | Hugging Face |
| Qwen/Qwen3-4B-Instruct-2507 (modelo base) | ~4B | no disponible en esta ficha | Instruct generalista | no disponible en esta ficha | Hugging Face |
| Alternativas de ~4B para código | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Licencia no declarada: no se especifican términos de uso comercial; debe consultarse el repositorio antes de cualquier despliegue en producción.
- Idiomas no declarados: se desconoce el soporte multilingüe real más allá de lo heredado del modelo base.
- Riesgo de alucinación: como todo modelo generativo de código, puede producir programas sintácticamente válidos pero incorrectos; la validación mediante tests es imprescindible.
- Sesgo de dominio: el entrenamiento se limita a 1833 problemas filtrados por dificultad, lo que puede estrechar la distribución de tareas hacia problemas de tipo competitivo y reducir generalización fuera de ese dominio.
- Checkpoint intermedio: corresponde al paso global 110 de una ejecución de RL y se marca como "mejor hasta ahora", no como versión final o estable.
- Sin métricas publicadas: no hay resultados de evaluación en la model card, por lo que no es posible verificar empíricamente la mejora frente al modelo base.
- Documentación mínima: no se detallan cuantizaciones, contexto máximo efectivo ni requisitos de hardware, lo que complica la planificación de producción.
- Naturaleza experimental: el nombre del repositorio y la receta sugieren un artefacto de investigación, no un modelo listo para uso comercial sin validación adicional.

## Enlaces

- Hugging Face: https://huggingface.co/agurung/cobalt-seeded-rl-base-ramp25-stoppen-gen4k-ep2-ncp5-q3c-iid16
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Weights & Biases (proyecto y ejecución citados en la model card): proyecto `eaiexp-paper-final`, ejecución `seeded_rl_base_ramp25_stoppen_gen4k-ep2-ncp5-q3c-iid16` (no se proporciona URL directa)
- OpenRLHF: no se proporciona enlace en la información disponible
- Paper o blog del autor: no disponible
