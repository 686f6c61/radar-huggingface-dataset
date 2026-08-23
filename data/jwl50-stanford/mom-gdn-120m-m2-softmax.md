# jwl50-stanford/mom-gdn-120m-m2-softmax

## Resumen

El modelo `jwl50-stanford/mom-gdn-120m-m2-softmax` es un checkpoint de entrenamiento del paso 20.000 de una arquitectura *residual banked Gated DeltaNet* (GDN) con *mixture of memories* (MoM), desarrollado por el usuario `jwl50-stanford` en el marco del proyecto [HazyResearch/mixture-of-memories-dev](https://github.com/HazyResearch/mixture-of-memories-dev). Se trata de un modelo de lenguaje autoregresivo de 120 millones de parámetros, diseñado para investigar el uso de bancos de memoria persistentes combinados con mecanismos de lectura *softmax* dentro de una arquitectura de atención lineal eficiente.

El modelo es relevante en el contexto actual de investigación sobre alternativas al *softmax attention* clásico, ya que propone una combinación de memoria persistente y *gated delta* para mejorar el equilibrio entre capacidad de memoria y eficiencia computacional. Su publicación como artefacto de investigación (checkpoint completo con estado de optimizador) permite reproducir y comparar resultados dentro del proyecto. No se trata de un modelo listo para producción, sino de una pieza de estudio para la comunidad científica.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Residual banked Gated DeltaNet (GDN) con mixture of memories (M2) y lectura *softmax* |
| Parametros totales | 120 millones (indicado en el nombre del experimento) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | Checkpoint de PyTorch Lightning (`.ckpt`) con estado de optimizador |

## Arquitectura y entrenamiento

La arquitectura se basa en *Gated DeltaNet* con bancos de memoria residuales. Las escrituras utilizan un router *softmax* denso, mientras que las lecturas emplean puertas *softmax* sobre dos bancos de memoria persistentes (M2). Este diseño busca combinar la eficiencia de la atención lineal con la capacidad de almacenamiento de memoria externa, permitiendo al modelo retener información a largo plazo de forma controlada.

El entrenamiento se realizó sobre el conjunto de datos The Pile (según las instrucciones de evaluación que requieren `--pile-data-dir`), aunque no se especifican el número de tokens ni la composición exacta del dataset. El checkpoint corresponde al paso 20.000 y no se detalla si se aplicaron técnicas como RLHF o DPO. El artefacto es un checkpoint completo de Lightning, incluyendo estado del optimizador, lo que indica que está orientado a continuar entrenamiento o a evaluación reproducible.

## Capacidades

- Generación de texto autoregresivo: como modelo de lenguaje, puede generar texto condicionado a un contexto previo, aunque no se han documentado capacidades específicas más allá de la modelización del lenguaje.
- Investigación en arquitecturas de memoria: el modelo está diseñado para estudiar el impacto de los bancos de memoria persistentes y el mecanismo de lectura *softmax* en el rendimiento de modelos de lenguaje.
- Evaluación reproducible: al ser un checkpoint exacto, permite reproducir métricas de validación en el protocolo definido por el repositorio fuente.
- No se han documentado capacidades de *tool calling*, agentes, razonamiento multi-paso, visión o audio. Tampoco se especifica soporte multilingüe.

## Casos de uso

- Investigación académica en arquitecturas de atención eficiente: el modelo sirve para estudiar cómo la memoria persistente y el *gating* afectan la perplejidad y la retención de información en modelos de 120M.
- Comparación de mecanismos de lectura: permite evaluar empíricamente el rendimiento de la lectura *softmax* frente a otras variantes (como *independent-softplus*) dentro de la misma arquitectura base.
- Análisis de rendimiento en tareas de recuerdo de contexto: las métricas de *rare first-recall PPL* y *FDA exact-match* permiten medir la capacidad del modelo para recuperar información poco frecuente.
- Desarrollo de técnicas de entrenamiento para arquitecturas lineales: el checkpoint con estado de optimizador permite reanudar el entrenamiento o aplicar técnicas de continuación desde un punto intermedio.
- Validación de protocolos de evaluación: el modelo puede utilizarse para verificar la correcta implementación de los scripts de evaluación del repositorio `mixture-of-memories-dev`.
- Estudio de la escalabilidad de GDN: comparando con otros checkpoints del mismo proyecto (p. ej., los de la serie `gdn-paper-120m-fixed-*`) se puede estudiar la evolución del rendimiento a lo largo del entrenamiento.

## Benchmarks y rendimiento

Se han publicado las siguientes métricas de validación según el protocolo del proyecto:

| Metrica | Valor |
|---|---|
| Perplejidad de validación (PPL) | 10.0111 |
| Perplejidad de recuerdo de primer rango raro (rare first-recall PPL) | 3.6467 |
| Exactitud de coincidencia exacta FDA (FDA exact-match accuracy) | 7.35% |

No se han publicado resultados en benchmarks estándar como MMLU, HumanEval o GSM8K. Estas métricas corresponden al protocolo interno del repositorio fuente.

## Requisitos de hardware

- Tamaño del checkpoint: 1.6 GB (incluye estado de optimizador, por lo que el tamaño en memoria durante inferencia será menor).
- Modelo de 120 millones de parámetros: la inferencia en precisión flotante de 32 bits requiere aproximadamente 0.5 GB de VRAM, pero no se han publicado cifras oficiales.
- No se han especificado GPUs recomendadas. Dado el tamaño del modelo, puede ejecutarse en GPUs comerciales como RTX 3090 o superiores, aunque no hay datos confirmados.
- Opciones de despliegue: al ser un checkpoint de Lightning, no se distribuye en formatos como GGUF o safetensors. Para inferencia habría que convertir los pesos o usar el código del repositorio fuente. No se menciona compatibilidad con vLLM, llama.cpp u Ollama.
- No se dispone de datos de latencia o throughput.

## Comparativa con modelos similares

No se dispone de información suficiente para una comparación directa con modelos de la misma categoría. El repositorio incluye otros checkpoints de la misma arquitectura (p. ej., `gdn-paper-120m-fixed-d256-fp32res-gpt2init-20k-r1` y `gdn-paper-120m-fixed-qk128-v64-fp32res-gpt2init-20k-r1`), pero no se han publicado especificaciones o métricas comparativas en la información proporcionada. Por lo tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- Modelo de investigación: no está pensado para uso en producción; es un artefacto de estudio para evaluar arquitecturas de memoria.
- Licencia no disponible: se desconoce si el uso comercial está permitido.
- Sesgos y alucinaciones: no se ha documentado información sobre sesgos ni riesgo de alucinación; al ser un modelo pequeño entrenado en The Pile, puede presentar sesgos presentes en los datos.
- Longitud de contexto no especificada: no se conoce el tamaño máximo de secuencia que soporta, lo que limita su uso en aplicaciones con contexto largo.
- Formato de pesos no estándar: el checkpoint de Lightning no es directamente utilizable con herramientas habituales (vLLM, llama.cpp, etc.) sin conversión previa.
- Sin soporte de tool calling ni agentes: las capacidades se limitan a generación de texto, sin integraciones adicionales.

## Enlaces

- [HuggingFace del modelo](https://huggingface.co/jwl50-stanford/mom-gdn-120m-m2-softmax)
- [Repositorio fuente HazyResearch/mixture-of-memories-dev](https://github.com/HazyResearch/mixture-of-memories-dev)
- [Modelos relacionados en HuggingFace](https://huggingface.co/jwl50-stanford/gdn-paper-120m-fixed-d256-fp32res-gpt2init-20k-r1)
- [Leaderboard de modelos LLM (agosto 2026)](https://benchlm.ai/)
- [Repositorio de investigación sobre atención lineal](https://github.com/vukrosic/linear-attention-research)
- [Artículo arXiv sobre atención lineal (arXiv:2503.12295)](https://arxiv.org/pdf/2503.12295v1)
