# iaeval2026-submission/qwen3-8b-knapsack-lora-persistent-seed1337

## Resumen

Este repositorio contiene un adaptador LoRA de 0,7 GB, publicado de forma anónima como material suplementario para una revisión de reproducibilidad en un workshop de NeurIPS. El adaptador se basa en el modelo Qwen/Qwen3-8B y está ajustado específicamente para la tarea agéntica "Opaque Knapsack", un escenario de evaluación que requiere razonamiento multi-paso y uso de herramientas. Forma parte de un conjunto de seis adaptadores que exploran dos regímenes de entrenamiento (persistente y sin estado) con tres semillas distintas; este ejemplar corresponde al régimen persistente con semilla 1337.

La característica distintiva del régimen persistente es que el entrenamiento se realiza con un intérprete de Python persistente, de modo que el estado se conserva entre los turnos del agente durante el ajuste. El adaptador se entrenó con Axolotl 0.13.2 sobre una base cuantizada en 4-bit NF4, con una secuencia máxima de 16 384 tokens. Al tratarse de una publicación anónima para revisión, la licencia, los idiomas soportados y los datos de entrenamiento detallados no están disponibles públicamente; el autor indica que la publicación no anónima (con cita del paper, código completo y trazas de entrenamiento) llegará tras concluir el proceso de revisión.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA adapter sobre Qwen/Qwen3-8B (transformer decoder-only) |
| Parametros totales | no disponible (adaptador LoRA; base: 8 000 millones aprox.) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 16 384 tokens (secuencia de entrenamiento) |
| Tipos de cuantizacion | Base entrenada en 4-bit NF4; adaptador en safetensors (BF16) |
| Idiomas soportados | no disponible (heredados del modelo base Qwen3-8B) |
| Licencia | no disponible |
| Formato de pesos | safetensors (PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se construye sobre Qwen/Qwen3-8B, un transformer decoder-only con atención de ventana deslizante y atención completa alternadas, desarrollado por Alibaba Cloud. El ajuste se realizó con LoRA (r=64, alpha=128, dropout=0.05) sobre los siete módulos lineales principales (q_proj, k_proj, v_proj, o_proj, gate_proj, up_proj, down_proj), con la base cuantizada en 4-bit NF4. El entrenamiento usó Axolotl 0.13.2 con una tasa de aprendizaje de 1e-4, programador coseno, optimizador AdamW, 3 épocas, micro-batch de 1 y acumulación de gradientes de 16, lo que equivale a un batch efectivo de 16 secuencias de 16 384 tokens.

La innovación principal no está en la arquitectura del adaptador, sino en el régimen de entrenamiento: el modelo se entrenó con un runtime de Python persistente, de modo que el estado del intérprete se conserva entre los turnos del agente. Esto contrasta con el régimen "stateless" (sin estado) de los otros tres adaptadores del conjunto. Los datos de entrenamiento consisten en trazas emparejadas para el régimen persistente, con un procedimiento de emparejamiento y filtrado descrito en el apéndice del paper (no accesible en esta revisión). No se menciona el uso de RLHF, DPO ni otras técnicas de alineación posteriores al ajuste supervisado.

## Capacidades

- Generación de texto y razonamiento multi-paso, heredados del modelo base Qwen3-8B.
- Ejecución de tareas agénticas con intérprete de Python persistente: el estado se conserva entre turnos, lo que permite mantener variables, resultados intermedios y contexto de ejecución a lo largo de una sesión.
- Soporte de tool calling y function calling, heredado de Qwen3-8B, aunque el adaptador está especializado en la tarea Opaque Knapsack.
- Razonamiento con contexto largo: la ventana de 16 384 tokens permite manejar trazas de ejecución extensas.
- Capacidades multilingües: no disponibles en la documentación del adaptador; se heredan del modelo base, que soporta principalmente inglés y chino.

## Casos de uso

- Reproducción de experimentos de investigación: el adaptador permite replicar los resultados del workshop sobre el régimen persistente en la tarea Opaque Knapsack, comparando con los adaptadores stateless y con el modelo base sin ajustar.
- Evaluación de regímenes de entrenamiento agéntico: investigadores pueden usar este adaptador para estudiar cómo la persistencia de estado durante el entrenamiento afecta al rendimiento en tareas que requieren mantener contexto entre turnos.
- Desarrollo de agentes con memoria de ejecución: el régimen persistente es relevante para aplicaciones donde el agente debe recordar resultados de pasos anteriores, como análisis de datos interactivo o resolución de problemas matemáticos multi-paso.
- Benchmarking de adaptadores LoRA en tareas agénticas: el conjunto de seis adaptadores (persistente/stateless × 3 semillas) sirve como banco de pruebas para estudiar la variabilidad entre semillas y la robustez de cada régimen.
- Integración en pipelines de evaluación de modelos agénticos: el adaptador puede cargarse con PEFT y usarse como punto de partida para evaluar el impacto de la persistencia en otros benchmarks de agentes.
- Estudio de la interacción entre cuantización 4-bit y LoRA en tareas de razonamiento: el entrenamiento sobre base NF4 permite analizar la pérdida de precisión en tareas que requieren cómputo exacto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye métricas de MMLU, HumanEval, GSM8K ni ninguna otra evaluación comparativa. El autor indica que los resultados completos se publicarán tras la revisión del workshop.

## Requisitos de hardware

- VRAM estimada para inferencia: el adaptador LoRA ocupa 0,7 GB, pero requiere cargar el modelo base Qwen3-8B. Con cuantización 4-bit, la base ocupa aproximadamente 5 GB; con el adaptador y el contexto de 16 384 tokens, se recomiendan al menos 8-10 GB de VRAM.
- GPU recomendadas: RTX 3090, RTX 4090, A100 40 GB o superiores. En consumer GPU con 8 GB (RTX 3070, RTX 4060) puede funcionar con cuantización 4-bit y secuencias cortas.
- Sí cabe en GPU de consumo: una RTX 4090 (24 GB) puede ejecutar el modelo con margen para el contexto completo.
- Opciones de despliegue: transformers + PEFT (carga directa), vLLM (con soporte LoRA), llama.cpp (si se convierte el adaptador a GGUF), Ollama (con integración de adaptadores).
- Latencia y throughput: no disponibles. Como referencia, Qwen3-8B en 4-bit en una RTX 4090 genera aproximadamente 40-60 tokens/s con batch 1.

## Comparativa con modelos similares

| Modelo | Base | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| qwen3-8b-knapsack-lora-persistent-seed1337 (este) | Qwen3-8B | 16 384 | no disponible | HuggingFace (anónimo) |
| qwen3-8b-persistent-knapsack-lora (AutomatedScientist) | Qwen3-8B | 16 384 | no disponible | HuggingFace (espejo) |
| qwen3-8b-persistent-knapsack-lora-seed1337 (TieuDaoChanNhan) | Qwen3-8B | 16 384 | no disponible | HuggingFace (espejo) |
| Qwen3-8B (base) | — | 32 768 | Apache 2.0 | HuggingFace |

Los tres adaptadores listados son el mismo modelo o versiones espejo del mismo. La comparación relevante es contra el modelo base Qwen3-8B, que tiene una ventana de contexto mayor (32 768 tokens) y licencia Apache 2.0, pero no está especializado en la tarea Opaque Knapsack. No se dispone de datos de rendimiento para comparar cuantitativamente.

## Limitaciones y advertencias

- Publicación anónima: el modelo se ha subido para revisión a ciegas; no hay garantía de mantenimiento, documentación completa ni soporte.
- Licencia no disponible: no se puede determinar si el uso comercial está permitido. Hasta que el autor publique la versión no anónima, se recomienda no usar en producción.
- Datos de entrenamiento no públicos: el procedimiento de emparejamiento y filtrado de trazas no está documentado, lo que limita la reproducibilidad independiente.
- Especialización estrecha: el adaptador está ajustado para una tarea concreta (Opaque Knapsack); su rendimiento en otras tareas agénticas o de generación general no está evaluado.
- Riesgo de sobreajuste: con solo 3 épocas sobre trazas de una tarea específica, el adaptador puede memorizar patrones de la tarea y generalizar mal a variantes no vistas.
- Sesgos y alucinaciones: heredados del modelo base Qwen3-8B; no se ha realizado ninguna evaluación de sesgos ni de seguridad sobre el adaptador.
- Sin garantías de producción: no hay benchmarks, ni tests de robustez, ni evaluación de latencia. No apto para despliegues críticos.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/iaeval2026-submission/qwen3-8b-knapsack-lora-persistent-seed1337
- Modelo base Qwen3-8B: https://huggingface.co/Qwen/Qwen3-8B
- Espejo del adaptador (AutomatedScientist): https://huggingface.co/AutomatedScientist/qwen3-8b-persistent-knapsack-lora
- Espejo del adaptador (TieuDaoChanNhan): https://huggingface.co/TieuDaoChanNhan/qwen3-8b-persistent-knapsack-lora-seed1337
- Repositorio GitHub de Qwen3: https://github.com/QwenLM/Qwen3
- Axolotl (herramienta de entrenamiento): https://github.com/axolotl-ai-cloud/axolotl
