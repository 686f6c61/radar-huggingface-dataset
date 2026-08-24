# SoftBacon-Software/Laguna-XS-2.1-sbQ-4bit

## Resumen

Laguna-XS-2.1-sbQ-4bit es una cuantización 4-bit con imatrix en formato MLX del modelo Laguna XS 2.1, desarrollada por SoftBacon Software. El modelo base, creado por poolside, es un Mixture-of-Experts (MoE) de 33B parámetros totales con solo 3B activos por token, diseñado específicamente para tareas de codificación agéntica y trabajo de largo horizonte en máquinas locales. Esta versión cuantizada reduce el peso a 18 GB, lo que permite ejecutarlo en hardware Apple Silicon con memoria unificada, manteniendo un rendimiento cercano al original. Su relevancia radica en ofrecer una alternativa eficiente para desarrolladores que necesitan un modelo de codificación capaz de operar localmente sin sacrificar demasiada calidad.

El repositorio se publica como "control" en un experimento del autor: la misma construcción que su gemelo calibrado con trazas de agentes, pero con un corpus de calibración genérico. Esto permite comparar cómo la calibración del imatrix afecta al comportamiento y la velocidad. En las pruebas del autor, esta versión es ligeramente más rápida en decodificación (136.5 tok/s frente a 131.5) pero pierde por un margen mínimo en métricas de comportamiento agéntico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) |
| Parametros totales | 33B (modelo base) |
| Parametros activos | 3B |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4-bit imatrix (MLX) |
| Idiomas soportados | no disponible |
| Licencia | openmdw-1.1 |
| Formato de pesos | safetensors (MLX) |

Nota: el archivo safetensors del repositorio contiene 5.400.989.440 parámetros, correspondientes a la representación cuantizada del modelo base.

## Arquitectura y entrenamiento

El modelo base Laguna XS 2.1 es un MoE con 33B parámetros totales y 3B activos por token, entrenado desde cero por poolside en su "Model Factory". No se dispone de información pública sobre el número de tokens de entrenamiento, la composición del dataset ni el proceso de post-entrenamiento (RLHF, DPO, etc.). La cuantización sbQ-4bit se realizó con la herramienta de SoftBacon Software sobre los pesos BF16 oficiales de poolside, utilizando imatrix calibrado con un corpus genérico de código y texto multilingüe. El autor publica el informe de activación de expertos (`oq_imatrix_report.json`) que indica 0 expertos oscuros de 256 para este corpus.

## Capacidades

- Generación de texto y código, con especialización en tareas de programación.
- Diseñado para agentes autónomos y flujos de trabajo de largo horizonte (multi-step reasoning).
- Soporte de contexto largo (la longitud exacta no se ha especificado en la documentación disponible).
- Capacidades multilingües según el corpus de calibración, aunque no se detallan los idiomas concretos.
- Compatible con decodificación especulativa (el autor reporta 320.6 tok/s en modo especulativo).
- Integración con el ecosistema MLX para Apple Silicon.

## Casos de uso

- Asistente de codificación local: el modelo puede generar, explicar y refactorizar código directamente en el equipo del desarrollador, sin depender de servicios en la nube. Su tamaño de 18 GB lo hace viable en Macs con 32 GB de RAM unificada.
- Agente de automatización de tareas de programación: gracias a su diseño para agentes, puede ejecutar flujos multi-paso como crear tests, corregir bugs o integrar cambios en repositorios, manteniendo el contexto de la conversación.
- Generación de código en entornos aislados: al ser un modelo local, es adecuado para entornos con restricciones de seguridad o sin conexión a internet, como instalaciones industriales o laboratorios de investigación.
- Prototipado rápido de herramientas de IA: los desarrolladores pueden usarlo como base para construir asistentes de código personalizados, ajustándolo con técnicas de fine-tuning o prompting.
- Evaluación de cuantizaciones: este repositorio sirve como referencia para comparar el efecto de la calibración imatrix en el comportamiento del modelo, útil para investigadores que estudian técnicas de compresión.
- Despliegue en producción con MLX: al estar optimizado para Apple Silicon, puede integrarse en aplicaciones macOS o iOS que requieran inferencia de lenguaje natural en el dispositivo.

## Benchmarks y rendimiento

La model card del repositorio incluye mediciones propias del autor, realizadas el 23-24 de agosto de 2026, bajo un régimen de prueba específico. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

| Metrica | Este build | sbQ-cal-4bit |
|---|---|---|
| Tamano | 18 GB | 18 GB |
| Decode tok/s | 136.5 | 131.5 |
| Speculative tok/s | 320.6 | 315.8 |
| Held-out NLL (merged split, cap 8192) | 1.4806 | 1.4802 |
| Needle test (n=72) | 71/72 | 71/72 |
| verify_before_assert (n=96) | 0.833 | 0.844 |
| say_not_measured (n=96) | 0.354 | 0.375 |

El único fallo en el needle test (posición `ctx32000_pos0.5`) también aparece en la referencia de 8 bits, por lo que se atribuye a un artefacto de la carga de trabajo, no a la cuantización.

## Requisitos de hardware

- Diseñado para Apple Silicon (MLX). Se requiere al menos 24 GB de memoria unificada para cargar los 18 GB de pesos y dejar margen para el contexto y los cálculos intermedios (estimación razonable, no confirmada por el autor).
- Velocidad de decodificación medida: 136.5 tok/s en el hardware de prueba del autor (no especificado).
- Con decodificación especulativa: 320.6 tok/s.
- Opciones de despliegue: MLX (biblioteca nativa para Apple Silicon), compatible con frameworks como mlx-lm o vLLM si se adapta.
- No se recomienda para GPUs NVIDIA sin conversión previa, ya que el formato MLX es específico de Apple.

## Comparativa con modelos similares

No se dispone de datos comparativos con otros modelos de la misma categoría (MoE de codificación agéntica) en la información proporcionada. El autor no publica comparaciones con alternativas como Qwen2.5-Coder, DeepSeek-Coder o el propio Laguna XS.2 sin cuantizar. La comparación más relevante es con su gemelo calibrado con trazas de agentes (sbQ-cal-4bit), que se muestra en la tabla de benchmarks.

## Limitaciones y advertencias

- La cuantización 4-bit puede introducir una ligera degradación en la calidad de generación en comparación con el modelo BF16 original, aunque el autor reporta una pérdida mínima en NLL (1.4806 frente a 1.4802 del gemelo calibrado).
- El modelo base no ha sido evaluado en benchmarks estándar públicos, por lo que su rendimiento real en tareas como MMLU o HumanEval es desconocido.
- La licencia OpenMDW-1.1 es una licencia de código abierto con condiciones específicas; se recomienda revisar sus términos antes de uso comercial.
- El corpus de calibración es genérico (código y texto multilingüe), pero no se especifican los idiomas exactos, lo que puede afectar al rendimiento en lenguas minoritarias.
- El fallo en el needle test en una posición concreta sugiere posibles limitaciones en la recuperación de información en contextos muy largos, aunque el autor lo atribuye a un artefacto de la prueba.
- Al ser una cuantización MLX, no es directamente utilizable en entornos CUDA sin conversión adicional.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/SoftBacon-Software/Laguna-XS-2.1-sbQ-4bit
- Modelo base: https://huggingface.co/poolside/Laguna-XS-2.1
- Blog de poolside sobre Laguna XS 2.1: https://poolside.ai/blog/introducing-laguna-xs-2-1
- Colección de poolside en HuggingFace: https://huggingface.co/collections/poolside/laguna-xs-21
- GitHub de SoftBacon Software: https://github.com/SoftBacon-Software
- Gemelo calibrado con agentes: https://huggingface.co/SoftBacon-Software/Laguna-XS-2.1-sbQ-cal-4bit
