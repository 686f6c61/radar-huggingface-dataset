# richardyoung/OLMo-2-0325-32B-Instruct-SOM-heretic

## Resumen

OLMo-2-0325-32B-Instruct-SOM-heretic es una variante modificada del modelo OLMo 2 32B Instruct desarrollado por el Allen Institute for AI (Ai2). La intervención, realizada por el usuario richardyoung, aplica la técnica conocida como "abliteration" o "decensoring" (etiquetada como heretic) para eliminar o atenuar los mecanismos de rechazo y moderación aprendidos durante el alineamiento del modelo original. El resultado es un modelo de 32.234 millones de parámetros orientado a generación de texto conversacional sin las restricciones típicas de seguridad.

El modelo base OLMo 2 es un transformer decoder-only denso, entrenado de forma completamente abierta (pesos, datos y receta), lo que lo convierte en una referencia para investigación reproducible. Esta variante conserva la arquitectura y el tokenizador del original, pero modifica los pesos para reducir la tendencia a declinar peticiones. Está publicado bajo licencia Apache 2.0 y con acceso restringido (gated) en Hugging Face, lo que exige aceptar condiciones antes de la descarga.

Su relevancia radica en dos factores: por un lado, demuestra el interés de la comunidad por modelos abiertos sin censura para investigación sobre alineamiento, red-teaming y evaluación de sesgos; por otro, al derivar de un modelo de pesos totalmente abiertos, permite estudiar con transparencia el efecto de las técnicas de abliteration sobre el comportamiento del modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (OLMo 2) |
| Parametros totales | 32.234.279.936 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible en la informacion proporcionada (el OLMo 2 32B base soporta contextos largos, pero no se confirma aqui) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada (pesos en safetensors; compatible con cuantizacion via transformers/bitsandbytes, no confirmado) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 (con acceso restringido/gated en Hugging Face) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de OLMo 2 32B Instruct: un transformer decoder-only denso con atención estándar y las mejoras introducidas por Ai2 en la familia OLMo 2 (normalización en capas post-norm con RMSNorm, atención con RoPE y ajustes de estabilidad de entrenamiento documentados en el paper arXiv:2501.00656). No es un modelo MoE ni híbrido SSM; es un transformer clásico de 32B parámetros.

El entrenamiento original de OLMo 2 incluyó preentrenamiento sobre un corpus abierto (Dolma) y un pipeline de post-entrenamiento con instrucciones y preferencias (SFT y DPO), documentado en arXiv:2411.15124. Sobre esa base, esta variante aplica una modificación de pesos tipo "abliteration"/"heretic" para reducir la probabilidad de respuestas de rechazo. No se dispone en la información proporcionada de detalles sobre el dataset exacto usado en la intervención, el número de tokens adicionales ni la metodología precisa de modificación; el tag de dataset `allenai/RLVR-GSM-MATH-IF-Mixed-Constraints` aparece asociado pero no se confirma su uso en esta variante.

## Capacidades

- Generación de texto conversacional multi-turno en inglés.
- Razonamiento y matemáticas (heredado del entrenamiento con datos GSM/MATH del modelo base).
- Generación de código (capacidad del OLMo 2 Instruct base; no verificada específicamente en esta variante).
- Respuestas sin mecanismos de rechazo ante peticiones que el modelo original declinaría (comportamiento "uncensored"/"decensored").
- Soporte de conversación con plantilla de chat (pipeline text-generation, formato conversacional).
- Capacidades multilingües limitadas al inglés según los metadatos.
- No se confirma soporte de tool calling, function calling, agentes o visión en la información disponible.

## Casos de uso

- Investigación sobre alineamiento y seguridad: comparar el comportamiento del modelo heretic frente al OLMo 2 Instruct original para estudiar cómo la abliteration afecta a la tasa de rechazos, la utilidad y los sesgos. Es adecuado porque ambos comparten arquitectura y tokenizador.
- Red-teaming y evaluación de robustez: usar el modelo como generador de respuestas sin filtro para construir conjuntos de datos adversarios y probar clasificadores de seguridad o guardrails.
- Estudio de sesgos y toxicidad: al eliminar los rechazos, el modelo puede exponer de forma más directa los sesgos latentes del preentrenamiento, útil para auditorías académicas.
- Generación creativa sin restricciones: escritura de ficción, guiones o narrativa que requiera temáticas sensibles, donde los rechazos del modelo alineado resultan un obstáculo.
- Fine-tuning posterior controlado: servir como base para proyectos de investigación que necesiten un punto de partida sin moderación y aplicar después su propio alineamiento específico de dominio.
- Experimentos de reproducibilidad: al derivar de un modelo de pesos y datos abiertos (OLMo 2), permite reproducir experimentos de modificación de pesos y publicar resultados verificables.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de métricas propias de esta variante (MMLU, HumanEval, GSM8K u otras) ni comparaciones numéricas con el modelo base en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 64 GB solo para pesos, más overhead de activaciones y KV cache; se recomienda 80 GB o más.
- VRAM estimada en cuantización de 8 bits: en torno a 32-35 GB; en 4 bits: en torno a 16-20 GB (estimaciones teóricas, no confirmadas para esta variante).
- GPU recomendadas: A100 80GB, H100 80GB, o múltiples GPUs de 24-48 GB con tensor parallelism.
- En consumer GPU: no cabe en FP16 en una sola RTX 4090 (24 GB); podría caber en cuantización 4 bits, aunque con margen ajustado y sin confirmación oficial.
- Opciones de despliegue: transformers (librería declarada), potencialmente vLLM, TGI o llama.cpp si se generan pesos GGUF (no confirmado en la información disponible).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Acceso | Notas |
|---|---|---|---|---|---|
| OLMo-2-0325-32B-Instruct-SOM-heretic (este) | 32,2B | no disponible | Apache 2.0 | Gated | Variante sin censura |
| allenai/OLMo-2-0325-32B-Instruct | 32,2B | no disponible | Apache 2.0 | Abierto | Modelo base alineado |
| Modelos "abliterated" de la comunidad (p. ej. variantes de Llama/Mistral) | variable | variable | variable | variable | Misma técnica de decensoring; no se dispone de comparación numérica |

No se dispone de datos de rendimiento comparativos en la información proporcionada.

## Limitaciones y advertencias

- Modelo "uncensored": puede generar contenido ofensivo, ilegal o peligroso; no apto para despliegue en producción sin guardrails externos.
- Riesgo elevado de alucinación, agravado por la modificación de pesos que puede degradar la calibración del modelo base.
- Idiomas: solo inglés según metadatos; no se garantiza calidad en castellano u otros idiomas.
- Licencia Apache 2.0 permite uso comercial, pero el acceso es restringido (gated) y el uso de un modelo sin moderación conlleva responsabilidad legal y ética del desplegador.
- La abliteration puede reducir capacidades de razonamiento o coherencia respecto al modelo original; no hay benchmarks que lo cuantifiquen.
- Sin datos confirmados sobre tool calling, agentes, visión ni longitud de contexto efectiva.
- Procedencia comunitaria: no es un modelo oficial de Ai2; la calidad de la modificación no está auditada por el desarrollador original.

## Enlaces

- Hugging Face: https://huggingface.co/richardyoung/OLMo-2-0325-32B-Instruct-SOM-heretic
- Modelo base: https://huggingface.co/allenai/OLMo-2-0325-32B-Instruct
- Paper OLMo 2 (arXiv:2501.00656): https://arxiv.org/abs/2501.00656
- Paper OLMo 2 post-entrenamiento (arXiv:2411.15124): https://arxiv.org/abs/2411.15124
- Dataset referenciado: https://huggingface.co/datasets/allenai/RLVR-GSM-MATH-IF-Mixed-Constraints
