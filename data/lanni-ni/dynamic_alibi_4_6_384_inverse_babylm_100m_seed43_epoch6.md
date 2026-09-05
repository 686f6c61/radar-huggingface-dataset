# Lanni-ni/dynamic_alibi_4_6_384_inverse_babylm_100m_seed43_epoch6

## Resumen

El modelo `Lanni-ni/dynamic_alibi_4_6_384_inverse_babylm_100m_seed43_epoch6` es un modelo de lenguaje de tamaño reducido (45,7 millones de parámetros) desarrollado por Lanni-ni, publicado en Hugging Face con el pipeline de `text-generation`. Su nombre sugiere que emplea una variante de atención con sesgo lineal dinámico (`dynamic ALiBi`), una modificación de la técnica ALiBi (Attention with Linear Biases) que generalmente se utiliza para extrapolar la longitud de contexto. El identificador también apunta a una configuración de 4 capas, 6 cabezas y dimensión 384, así como a un entrenamiento relacionado con el corpus BabyLM, aunque estos detalles no están confirmados en la información pública.

El modelo se presenta como un experimento de investigación dentro de la familia `dynamic_alibi`, con pesos en formato `safetensors` y un tamaño de repositorio de 0,2 GB. No se ha publicado información sobre la licencia, los idiomas soportados, los datos de entrenamiento ni los resultados de benchmarks. La model card es genérica y generada automáticamente, por lo que la documentación disponible es muy limitada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con dynamic ALiBi (probablemente decoder-only) |
| Parametros totales | 45.694.080 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible (el nombre sugiere 384, sin confirmar) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura se basa en un transformer con `dynamic ALiBi`, un mecanismo de sesgo lineal para la atención que, a diferencia del ALiBi estático, podría ajustar dinámicamente los sesgos según la posición o la entrada. El identificador del modelo (`4_6_384`) sugiere una configuración de 4 capas, 6 cabezas de atención y una dimensión de embedding de 384, aunque no se ha confirmado oficialmente. El sufijo `inverse` y la referencia a `babylm` apuntan a un entrenamiento en el corpus BabyLM, un desafío centrado en el aprendizaje del lenguaje con datos limitados. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, el uso de RLHF/DPO ni otros detalles del procedimiento. La model card no incluye ninguna especificación técnica adicional.

## Capacidades

No se han documentado capacidades específicas en la información disponible. El pipeline declarado es `text-generation`, lo que indica que el modelo está diseñado para generar texto, pero no hay datos sobre:

- Generacion de texto, razonamiento, codigo, matematicas o vision: no documentado.
- Soporte de tool calling / function calling: no documentado.
- Soporte de agentes o razonamiento multi-paso: no documentado.
- Capacidades multilingues: no documentado.
- Capacidades especiales (thinking mode, vision, audio, etc.): no documentado.

## Casos de uso

No se han documentado casos de uso concretos en la información proporcionada. Al tratarse de un modelo experimental de investigación, su aplicacion principal seria academica, pero no existen datos fiables para enumerar escenarios practicos. Por tanto, no es posible proporcionar una lista de casos de uso sin incurrir en especulacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

Estimacion teorica basada en los parametros totales (45.694.080) y el formato de pesos:

- VRAM estimada para inferencia:
  - FP32: ~183 MB.
  - FP16/BF16: ~91 MB.
  - 8-bit: ~46 MB.
  - 4-bit: ~23 MB.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM (por ejemplo, NVIDIA T4, RTX 3060, A100).
- Si cabe en consumer GPU: si, en cualquier GPU de consumo moderna.
- Opciones de despliegue: transformers, llama.cpp, Ollama, vLLM, TGI.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No se dispone de datos de rendimiento para comparar. Existe un modelo hermano publicado por el mismo autor con el identificador `Lanni-ni/dynamic_alibi_4_6_384_babylm_100m_epoch6`, que comparte la mayoria de caracteristicas estructurales pero sin el sufijo `inverse` ni `seed43`. La informacion publica de ambos modelos es igualmente limitada.

| Modelo | Parametros | Contexto | Licencia | Benchmarks |
|---|---|---|---|---|
| dynamic_alibi_4_6_384_inverse_babylm_100m_seed43_epoch6 | 45.694.080 | No disponible | No disponible | No disponible |
| dynamic_alibi_4_6_384_babylm_100m_epoch6 | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Sesgos conocidos: no se ha realizado ninguna evaluacion de sesgos publicada.
- Riesgo de alucinacion: no evaluado; al ser un modelo pequeno y experimental, el riesgo de generar contenido incoherente puede ser alto.
- Limitaciones de contexto o idioma: la longitud de contexto no esta documentada; los idiomas soportados son desconocidos.
- Restricciones de licencia: la licencia no esta especificada, por lo que el uso comercial es incierto y requiere contacto con el autor.
- Caveats para produccion: no es recomendable su uso en entornos de produccion sin una evaluacion exhaustiva previa, dada la ausencia de documentacion tecnica y de benchmarks.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Lanni-ni/dynamic_alibi_4_6_384_inverse_babylm_100m_seed43_epoch6
- Modelo hermano: https://huggingface.co/Lanni-ni/dynamic_alibi_4_6_384_babylm_100m_epoch6
- Busqueda de modelos con tag `dynamic_alibi`: https://huggingface.co/models?other=dynamic_alibi
- Referencia a la calculadora de impacto ambiental (Lacoste et al., 2019): https://arxiv.org/abs/1910.09700
