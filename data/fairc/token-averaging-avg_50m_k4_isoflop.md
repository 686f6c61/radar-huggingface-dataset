# FAIRC/token-averaging-avg_50m_k4_isoflop

## Resumen

El modelo `FAIRC/token-averaging-avg_50m_k4_isoflop` es un checkpoint de investigación publicado por FAIRC dentro del proyecto "token averaging". Se trata de un dump de entrenamiento de un transformer de aproximadamente 50 millones de parámetros, con una arquitectura de 8 capas, 8 cabezas de atención, dimensión de modelo 512 y una ventana de contexto de 1024 tokens. El nombre "avg_50m_k4_isoflop" sugiere que se estudia el efecto de promediar representaciones de tokens (con un parámetro k=4) bajo un presupuesto computacional iso-flop, es decir, comparando modelos con el mismo coste de entrenamiento.

El repositorio contiene exclusivamente checkpoints (en formato PyTorch nativo, no Hugging Face transformers) y registros de pérdida en CSV. No se proporciona información sobre licencia, idiomas soportados, pipeline de uso ni resultados de benchmarks. Es un recurso pensado para investigadores que quieran reproducir o extender los experimentos de token averaging, no para uso directo en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (configuración propia, no HF transformers) |
| Parametros totales | 50.897.408 (aprox. 50M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 1024 tokens |
| Tipos de cuantizacion | no disponible (solo pesos en float32/torch) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | PyTorch state_dict (checkpoints .pt) |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder con 8 capas, 8 cabezas de atención, dimensión de modelo 512 y embeddings atados (tie_embeddings=true). La innovación principal es la técnica de "token averaging" con un factor k=4, que probablemente consiste en promediar representaciones de tokens consecutivos o aplicar algún tipo de mezcla de embeddings durante el entrenamiento o la inferencia. No se especifican detalles adicionales sobre el mecanismo exacto.

El entrenamiento se realizó con un objetivo de 5.500 millones de tokens, una tasa de aprendizaje de 2e-4, 2000 pasos de warmup y una configuración isoflop, lo que implica que se comparó con otros modelos de similar coste computacional. Los logs de pérdida (`loss_log.csv`, `loss_log_rope_bug.csv`, `loss_log_same_ctx.csv`) sugieren que se investigaron variantes con y sin corrección de RoPE (rotary position embeddings) y con diferentes contextos.

## Capacidades

- Generación de texto autoregresiva básica, dado que es un transformer decoder de 50M parámetros.
- No se documentan capacidades específicas de razonamiento, código, matemáticas o tool calling.
- No se indica soporte multilingüe ni capacidades multimodales.
- El modelo es un artefacto de investigación, no se ha validado para tareas concretas.
- No se menciona soporte para agentes ni multi-step reasoning.
- La ventana de contexto de 1024 tokens limita su uso a tareas de texto corto.

## Casos de uso

- Reproducción de experimentos de investigación: el checkpoint permite cargar el estado del modelo y continuar el entrenamiento o evaluar la técnica de token averaging en entornos controlados.
- Análisis de la dinámica de pérdida: los logs CSV permiten estudiar la evolución de la pérdida durante el entrenamiento, incluyendo el efecto de bugs de RoPE o de cambios en el contexto.
- Comparación isoflop: al ser un modelo de 50M, se puede comparar con otros checkpoints de la misma familia (p.ej. `avg_50m_k4`, `avg_50m_k4_learnable_pos`) para aislar el efecto de la variante de token averaging.
- Desarrollo de técnicas de promediado de tokens: sirve como base para probar nuevas variantes de la técnica, ya que la arquitectura es simple y el código de carga está documentado.
- Educación en investigación de LLMs: útil para estudiantes que quieran entender cómo se estructuran los checkpoints de entrenamiento y cómo se analizan los logs de pérdida.
- No es adecuado para aplicaciones de producción, chatbots o generación de código, dado su tamaño y falta de validación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras evaluaciones estándar. El repositorio solo contiene checkpoints y logs de pérdida.

## Requisitos de hardware

- Al ser un modelo de ~50M parámetros, la inferencia requiere aproximadamente 0.2 GB de VRAM en float32 (50M × 4 bytes ≈ 200 MB), más overhead de activaciones.
- Cualquier GPU con al menos 2 GB de VRAM puede ejecutarlo, incluyendo GPUs integradas o CPUs (con suficiente RAM).
- Para entrenamiento o fine-tuning, se recomienda una GPU con al menos 8 GB de VRAM para comodidad, aunque el modelo es pequeño.
- No se proporcionan opciones de despliegue específicas (vLLM, llama.cpp, etc.) porque los pesos no están en formato compatible con esos frameworks. Solo se puede cargar con PyTorch y la arquitectura personalizada.
- Latencia y throughput: no disponibles, pero al ser un modelo pequeño, la generación sería muy rápida en cualquier hardware moderno.

## Comparativa con modelos similares

No se dispone de información suficiente para comparar con otros modelos de 50M parámetros. La familia de checkpoints de token averaging incluye variantes como `avg_50m_k4` y `avg_50m_k4_learnable_pos`, pero no se han publicado métricas comparativas. No hay modelos comerciales o de referencia de 50M con los que comparar directamente en cuanto a rendimiento.

## Limitaciones y advertencias

- Es un checkpoint de investigación, no un modelo listo para producción. No tiene licencia especificada, por lo que su uso comercial es incierto.
- No se han documentado sesgos ni alucinaciones, pero al ser un modelo pequeño entrenado probablemente con datos de dominio general, presentará limitaciones típicas de los modelos de este tamaño.
- La ventana de contexto de 1024 tokens es corta para tareas que requieran contexto largo.
- Los pesos no son compatibles con Hugging Face transformers; requieren reconstruir la arquitectura desde el código fuente (config.json o experiments/chinchilla/model_configs.py).
- No hay garantías de calidad del modelo ni de reproducibilidad de los resultados del paper asociado.
- El repositorio incluye logs con nombres como `loss_log_rope_bug.csv`, lo que sugiere que hubo errores durante el entrenamiento que pueden afectar a la validez de los checkpoints.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/FAIRC/token-averaging-avg_50m_k4_isoflop
- Repositorio relacionado (variante k4): https://huggingface.co/FAIRC/token-averaging-avg_50m_k4
- Repositorio relacionado (variante learnable_pos): https://huggingface.co/FAIRC/token-averaging-avg_50m_k4_learnable_pos
- Documentación de métodos de token averaging (GitHub): https://github.com/cyai/llm-token-averaging/blob/main/docs/methods_overview.md
