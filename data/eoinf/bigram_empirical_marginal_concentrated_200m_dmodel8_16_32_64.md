# eoinf/bigram_empirical_marginal_concentrated_200m_dmodel8_16_32_64

## Resumen

`eoinf/bigram_empirical_marginal_concentrated_200m_dmodel8_16_32_64` es un artefacto de investigación publicado en HuggingFace por el usuario `eoinf`, no un modelo listo para producción. Se trata de un congelado de pesos perteneciente a una rejilla experimental de transformers causales de tamaño mínimo (d_model de 8, 16, 32 y 64) entrenados sobre un vocabulario de 4096 tokens y una longitud de contexto de 256 tokens, con un presupuesto nominal de aproximadamente 2.000 millones de tokens de entrenamiento.

El nombre del repositorio sugiere un estudio sobre la distribución marginal empírica de bigramas y su concentración, probablemente orientado a analizar cómo modelos con capacidad muy limitada aprenden (o no) las estadísticas de coocurrencia del corpus. No hay información publicada sobre el dataset concreto, el tokenizador ni los resultados de evaluación más allá de las referencias a ficheros de configuración internos.

El interés del modelo es, por tanto, metodológico y de reproducibilidad: sirve para estudiar dinámicas de entrenamiento y escalado en el régimen de parámetros ínfimos, no para tareas de generación real. No dispone de pipeline declarado, licencia, idiomas ni métricas publicadas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer causal (variantes con d_model 8, 16, 32 y 64) |
| Parámetros totales | No disponible (d_model entre 8 y 64; recuento exacto no publicado) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 256 tokens |
| Tipos de cuantización | No disponible (pesos en estado PyTorch, no se ofrecen variantes GGUF/AWQ) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | State-dict de PyTorch (`pytorch`); sin safetensors ni GGUF declarados |

## Arquitectura y entrenamiento

La arquitectura es un transformer causal de dimensiones reducidas: cuatro anchos de modelo (8, 16, 32 y 64) con una semilla por anchura, vocabulario de 4096 tokens y contexto de 256 tokens. El presupuesto nominal de entrenamiento es de 1.999.998.976 tokens, aunque la model card advierte de que los horizontes reales por modelo (incluyendo paradas tempranas) están registrados en `grid_summary.json` y `result.json`, ficheros que no se han podido inspeccionar.

El repositorio incluye, por cada directorio de modelo, los checkpoints de state-dict, la definición de la ejecución, el historial de checkpoints, el log de actualizaciones de entrenamiento y los metadatos de resultado. No se incluyen los estados de reanudación del optimizador ni los datos de entrenamiento. El código de arquitectura y carga vive en el repositorio `synthetic_trigrams`, lo que apunta a un corpus sintético basado en trigramas o bigramas. No se documenta uso de RLHF, DPO ni innovaciones de atención.

## Capacidades

- Generación de texto causal a nivel de token, limitada a un vocabulario de 4096 entradas y a un contexto de 256 tokens.
- Modelado de distribuciones de bigramas/trigramas del corpus sintético de entrenamiento.
- Capacidad de razonamiento, código, matemáticas o visión: no disponible; el tamaño del modelo (d_model ≤ 64) hace inviable cualquier uso de este tipo.
- Tool calling / function calling: no soportado.
- Soporte de agentes o razonamiento multi-paso: no soportado.
- Capacidades multilingües: no documentadas.
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Estudio de dinámicas de entrenamiento a escala ínfima: el modelo permite reproducir curvas de pérdida y comparar anchos de 8, 16, 32 y 64 bajo el mismo presupuesto de tokens.
- Análisis de concentración de la distribución marginal de bigramas: el nombre del checkpoint sugiere que se puede medir cómo se reparte la probabilidad aprendida entre los pares de tokens más frecuentes.
- Validación de pipelines de tokenización: con vocabulario de 4096 y contexto de 256, sirve como banco de pruebas barato para verificar flujos de preprocesado y carga de state-dicts.
- Docencia e introducción a transformers: la carga mediante el repositorio `synthetic_trigrams` permite inspeccionar la arquitectura completa sin requerir hardware significativo.
- Pruebas de infraestructura de evaluación: útil para validar harnesses de evaluación y logging antes de escalar a modelos reales.
- Reproducibilidad de experimentos sintéticos: los metadatos de resultado y el historial de checkpoints permiten auditar la ejecución y comparar con réplicas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en cualquier cuantización razonable; el repositorio completo ocupa 0,2 GB.
- GPU recomendadas: cualquier GPU consumer (GTX 1050, RTX 3060, RTX 4090) o incluso CPU es suficiente.
- Cabe en cualquier GPU consumer y en la mayoría de entornos integrados.
- Opciones de despliegue: carga directa con PyTorch mediante el código de `synthetic_trigrams`; no se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| eoinf/bigram_empirical_marginal_concentrated_200m_dmodel8_16_32_64 | No disponible (d_model 8–64) | 256 | No disponible | HuggingFace, 0 descargas |
| Alternativas comparables | No disponible | No disponible | No disponible | No disponible |

No se identifican en la información proporcionada modelos directamente comparables de la misma categoría (transformers causales de investigación con d_model ≤ 64 sobre corpus sintético).

## Limitaciones y advertencias

- No es un modelo utilizable en producción: el tamaño de d_model (8 a 64) y el vocabulario de 4096 tokens impiden una generación de texto coherente a escala real.
- Licencia no declarada: no se puede asumir permiso para uso comercial ni redistribución.
- Idiomas no documentados: no se puede garantizar el comportamiento en castellano ni en ningún otro idioma.
- Dataset y tokenizador no incluidos: la reproducibilidad depende del repositorio `synthetic_trigrams` y de los ficheros de configuración referenciados.
- Riesgo de alucinación: no aplica en el sentido convencional, pero la salida será estadísticamente trivial y sin valor factual.
- Sin estados de optimizador ni datos de entrenamiento: no es posible reanudar el entrenamiento desde el checkpoint publicado.
- Cero descargas y cero likes en el momento de la consulta: no hay evidencia de uso ni validación por parte de la comunidad.

## Enlaces

- HuggingFace: https://huggingface.co/eoinf/bigram_empirical_marginal_concentrated_200m_dmodel8_16_32_64
- Repositorio de código referenciado: `synthetic_trigrams` (no se proporciona URL en la información disponible)
- Ficheros internos de metadatos: `grid_summary.json`, `result.json`, `configuration.json` (incluidos en el repositorio)
