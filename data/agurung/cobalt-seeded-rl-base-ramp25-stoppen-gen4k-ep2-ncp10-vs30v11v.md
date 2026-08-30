# agurung/cobalt-seeded-rl-base-ramp25-stoppen-gen4k-ep2-ncp10-vs30v11v

## Resumen

Este modelo es un checkpoint de aprendizaje por refuerzo (RL) basado en `Qwen/Qwen3-4B-Instruct-2507`, desarrollado por el usuario agurung. Se trata de un experimento de investigación que aplica el algoritmo GRPO (Group Relative Policy Optimization) directamente sobre el modelo base, sin una etapa previa de fine-tuning supervisado (SFT), con el objetivo de mejorar la capacidad de generación de código que supere pruebas unitarias en problemas de programación competitiva.

El checkpoint se guardó en el paso global 4 de la ejecución de RL `seeded_rl_base_ramp25_stoppen_gen4k_ep2_ncp10_vs30v11v` y fue seleccionado como el mejor según la métrica pass@8 hasta ese momento. El entrenamiento se realizó sobre un subconjunto de problemas del "frontier cobalt-train" (problemas que el modelo base resolvía en como máximo 2 de 64 intentos), con recompensa binaria basada en la correctitud del código generado. Es relevante porque explora la aplicación de RL directamente sobre un modelo base sin SFT, una línea de investigación activa en el campo del razonamiento y la generación de código.

El modelo tiene 4.411.424.256 parámetros (aproximadamente 4,4 mil millones) y se distribuye en formato safetensors. No se especifican licencia, idiomas soportados ni longitud de contexto en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (basada en Qwen3-4B-Instruct-2507) |
| Parametros totales | 4.411.424.256 (4,4 B) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible (heredada del modelo base, no confirmada) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin cuantizaciones publicadas) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se construye sobre la arquitectura de Qwen3-4B-Instruct-2507, un transformer decoder-only con atención por grupos de consulta (GQA) y normalización QK, según las especificaciones de la serie Qwen3. No se trata de un modelo MoE, sino de un modelo denso de 4,4 B parámetros.

El entrenamiento de RL se realizó con OpenRLHF utilizando el algoritmo GRPO con ventajas normalizadas por grupo y sin penalización por divergencia KL. Se aplicaron dos técnicas de regularización adicionales: una penalización de parada prematura (stop-properly penalty) que asigna recompensa -1,0 a las respuestas truncadas, y una penalización por longitud excesiva estilo DAPO que resta hasta -0,25 en los últimos 1024 tokens antes del límite de generación. Se generaron 8 muestras por prompt, con un tamaño de lote de rollout y de entrenamiento de 128, un máximo de 4096 tokens nuevos por rollout, 2 épocas y una tasa de aprendizaje constante de 1e-06.

El conjunto de datos de entrenamiento y validación consiste en 1833 problemas de entrenamiento y 112 de validación extraídos del "frontier cobalt-train", definido como problemas que el modelo base resolvía en como máximo 2 de 64 muestras bajo un escaneo de dureza. La recompensa es binaria: 1,0 si el programa generado pasa todas las pruebas del problema, 0,0 si falla.

## Capacidades

- Generación de código en lenguajes de programación compatibles con los problemas del conjunto cobalt (principalmente C++ y Python, segun el contexto de programación competitiva, aunque no se especifica).
- Resolución de problemas de programación competitiva con verificación automática mediante pruebas unitarias.
- Mejora en la métrica pass@8 respecto al modelo base en el subconjunto de problemas evaluados (segun la seleccion del checkpoint).
- Capacidades generales de generación de texto y razonamiento heredadas del modelo base Qwen3-4B-Instruct-2507, aunque el entrenamiento de RL se centra exclusivamente en la correctitud de código.
- No se documenta soporte explicito para tool calling, agentes, vision o audio en la informacion disponible.

## Casos de uso

- Evaluación de tecnicas de RL para generacion de codigo: este checkpoint sirve como referencia para estudiar el efecto de GRPO aplicado directamente sobre un modelo base sin SFT, comparando con variantes que incluyen SFT previo.
- Generacion de soluciones a problemas de programacion competitiva: el modelo puede proponer codigo que pase los tests de problemas de plataformas como Codeforces o AtCoder, aunque su rendimiento fuera del conjunto de entrenamiento no esta medido.
- Investigacion en recompensas binarias y penalizaciones por truncamiento: el checkpoint permite analizar el impacto de las tecnicas de regularizacion (stop-properly penalty, DAPO overlong) en la calidad de las respuestas.
- Base para fine-tuning posterior: aunque es un checkpoint intermedio, puede usarse como punto de partida para experimentos de continuacion de entrenamiento o mezcla con otros datasets.
- Pruebas de inferencia con vLLM: al ser compatible con text-generation-inference, puede desplegarse en entornos de produccion para evaluar su latencia y throughput en tareas de generacion de codigo.
- Analisis de robustez frente a problemas no vistos: los 112 problemas de validacion permiten medir la generalizacion del modelo en problemas que no aparecieron en el entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La unica metrica mencionada es la seleccion del checkpoint como "mejor por pass@8" en la ejecucion de RL, pero no se proporcionan valores numericos concretos ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia en precision FP16: alrededor de 8,8 GB (correspondiente al tamano del repositorio con pesos en safetensors).
- Con cuantizacion de 4 bits (si se aplicara, aunque no se proporcionan archivos cuantizados), la VRAM podria reducirse a aproximadamente 2,5-3 GB, permitiendo su uso en GPUs de consumo como RTX 3060 o superiores.
- GPU recomendadas: RTX 3090/4090 (24 GB) para FP16 sin problemas; A100 o H100 para inferencia a gran escala o multiples instancias.
- Despliegue compatible con vLLM (comando `vllm serve`) y con la libreria transformers de HuggingFace.
- No se proporcionan datos de latencia ni throughput en la informacion disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| Qwen3-4B-Instruct-2507 (base) | 4,4 B | no disponible | Apache 2.0 (segun la serie Qwen3) | Instruct, SFT + RLHF |
| agurung/cobalt-seeded-rl-base-ramp25-stoppen-gen4k-ep2-ncp10-vs30v11v | 4,4 B | no disponible | no disponible | RL (GRPO) directo sobre base, sin SFT |
| Otros modelos de 4B de codigo (p.ej. DeepSeek-Coder-1.3B, CodeLlama-7B) | 1,3-7 B | 4K-16K | varian | SFT especifico para codigo |

No se dispone de resultados de benchmarks comparativos entre estos modelos. La comparacion se limita a caracteristicas generales, ya que no hay datos publicados de rendimiento para este checkpoint.

## Limitaciones y advertencias

- No se especifica la licencia del modelo, lo que impide determinar si es apto para uso comercial o academico sin restricciones.
- No se indican los idiomas soportados; al estar entrenado sobre problemas de programacion competitiva, es probable que funcione mejor con prompts en ingles, pero no hay confirmacion.
- La recompensa binaria de correctitud puede favorecer soluciones que funcionan en los tests pero que no son logicamente robustas (sobreajuste a los casos de prueba).
- El entrenamiento se realizo sobre un subconjunto muy especifico de problemas (frontier ≤2/64), lo que limita la generalizacion a otros dominios de programacion.
- Al ser un checkpoint intermedio de RL (paso 4), puede no haber convergido completamente y mostrar inestabilidad en la generacion.
- No se han evaluado sesgos o alucinaciones especificos de este modelo; hereda los riesgos del modelo base Qwen3-4B-Instruct-2507.
- El repositorio no incluye cuantizaciones ni documentacion de despliegue adicional mas alla del ejemplo de carga con transformers y vLLM.
- No se proporcionan metricas de rendimiento fuera del conjunto de validacion, por lo que su calidad en problemas reales es desconocida.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/agurung/cobalt-seeded-rl-base-ramp25-stoppen-gen4k-ep2-ncp10-vs30v11v
- Repositorio relacionado (checkpoint base sin el sufijo vs30v11v): https://huggingface.co/agurung/cobalt-seeded-rl-base-ramp25-stoppen-gen4k-ep2-ncp10-base
- Repositorio relacionado (fine-tuning DPO): https://huggingface.co/agurung/cobalt-ft-qwen3-4b-dpo-mixed-12-mc-correct-only-v1-lora-r128-a32-lr5e-6-const-lr5e-6-gb64-ep2-be
- Repositorio relacionado (fine-tuning SFT): https://huggingface.co/agurung/cobalt-ft-qwen3-4b-sft-iid-12-lora-r128-a32-lr2p5e-4-const-lr2p5e-4-qps8-gpuauto-ep2
