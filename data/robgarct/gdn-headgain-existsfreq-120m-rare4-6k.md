# robgarct/gdn-headgain-existsfreq-120m-rare4-6k

## Resumen

`gdn-headgain-existsfreq-120m-rare4-6k` es un modelo de lenguaje de 120 millones de parámetros desarrollado por el usuario robgarct, publicado en Hugging Face dentro de una serie de ablaciones sobre mecanismos de compuerta en modelos con atención lineal. Se trata de un experimento de investigación, no de un modelo orientado a producción: su propósito es medir el efecto de una compuerta de salida por cabeza (`head gain`) condicionada a información n-grama (el bit `exists` y la frecuencia unigrama z-scoreada del candidato) sobre la capacidad de recuperación en contexto (*in-context recall*).

El modelo emplea una arquitectura Gated DeltaNet, una variante de atención lineal recurrente con compuerta delta, entrenada sobre el dataset Pile durante 6.000 actualizaciones (3.146 mil millones de tokens con batch global de 256 × 2.048), con un objetivo denominado `rare4` que aplica un factor de pérdida 4× a los tokens que completan bigramas raros. La semilla utilizada es 1111.

Su relevancia es acotada pero específica: forma parte de un conjunto de ablaciones diseñadas para aislar qué información debe condicionar las compuertas de un modelo de atención lineal para mejorar la recuperación de tokens raros en contexto. Los resultados publicados (PPL de 12,19 en Pile, 76,5% de top-1 en eventos de primera recuperación rara) sirven como referencia comparativa dentro de esa serie experimental.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gated DeltaNet (atención lineal recurrente con compuerta delta) |
| Parametros totales | 120M (aproximado, según nombre del modelo) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en checkpoint PyTorch, `final.ckpt`) |
| Idiomas soportados | no disponible (entrenado sobre Pile, predominantemente inglés) |
| Licencia | no disponible |
| Formato de pesos | `final.ckpt` (checkpoint PyTorch, estado del optimizador eliminado) |

## Arquitectura y entrenamiento

El modelo se basa en Gated DeltaNet, una arquitectura de atención lineal con estado recurrente y compuerta delta que sustituye la atención cuadrática por una actualización recurrente del estado. La innovación concreta de esta ablación es una ganancia de salida por cabeza (`per-head output gain`): un escalar aprendido por cabeza y por token, aplicado antes de la proyección de salida, que se condiciona a la entrada de la capa y a dos señales n-grama — el bit `exists` y el logaritmo de frecuencia unigrama del candidato, z-scoreado.

El entrenamiento se realizó sobre el dataset Pile con 6.000 actualizaciones (3.146B tokens, batch global 256 × 2.048) y el objetivo `rare4`, que multiplica por 4 la pérdida sobre tokens que completan bigramas raros. La semilla es 1111. El repositorio incluye `resolved-config.yaml` con la configuración exacta y `metadata.json` con la identidad del run. El código se encuentra en la rama `ngram-router-ablations` del proyecto `recurrent-recall-circuits`, y el modelo se construye con `experiment=gdn_router/headgain_existsfreq_rare4` (alias de registro `gdn_120m_rare4_gate_existsfreq`).

## Capacidades

- Generación de texto autoregresiva sobre dominio general (Pile), con calidad medida por perplejidad.
- Recuperación en contexto (*in-context recall*) de tokens raros: capacidad específicamente evaluada y optimizada mediante el objetivo `rare4`.
- Condicionamiento de compuertas por información n-grama (bit `exists` y frecuencia unigrama) para modular la salida por cabeza.
- No se documenta soporte de tool calling, function calling ni agentes.
- No se documenta capacidad multilingüe explícita; el entrenamiento sobre Pile sugiere predominio del inglés.
- No se documenta modo thinking, visión ni audio.

## Casos de uso

- Investigación en atención lineal: servir como punto de comparación en ablaciones sobre mecanismos de compuerta en arquitecturas Gated DeltaNet, midiendo el efecto de condicionar la ganancia por cabeza a señales n-grama.
- Estudio de recuperación en contexto: evaluar cómo el objetivo `rare4` y la compuerta `existsfreq` afectan a la recuperación de tokens raros, usando el conjunto Rare-AR de 66.394 eventos de primera recuperación.
- Reproducción de experimentos: reconstruir el modelo con la configuración `resolved-config.yaml` y la rama `ngram-router-ablations` para verificar los resultados publicados.
- Análisis de eficiencia de atención lineal: comparar el coste computacional y la perplejidad frente a transformers de tamaño similar en tareas de modelado de lenguaje.
- Base para fine-tuning experimental: partir de los pesos para probar variantes de compuerta o de objetivo en dominios con tokens raros (por ejemplo, entidades poco frecuentes).
- Docencia y divulgación: ilustrar cómo se diseña una ablación controlada en modelos de lenguaje de pequeño tamaño con métricas específicas de recuperación.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Pile PPL (1.000 secuencias de validación) | 12,19 |
| Rare-AR PPL (66.394 eventos de primera recuperación rara) | 2,90 |
| Rare-AR top-1 accuracy | 76,5% |
| Natural FDA (1.102 ejemplos, generación, respuesta contenida) | 6,8% |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; con 120M parámetros, en fp32 el checkpoint ronda los 0,5 GB (tamaño del repo), y en fp16 aproximadamente 0,24 GB.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4090) es suficiente por tamaño; no se documentan requisitos específicos.
- Cabe en GPU consumer: sí, por el tamaño del modelo (120M parámetros).
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI; el código propio (`recurrent-recall-circuits`) es el único método de carga documentado.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se proporcionan en la información modelos comparables de la misma serie de ablaciones ni alternativas de atención lineal con las que contrastar parámetros, contexto o rendimiento.

## Limitaciones y advertencias

- Modelo de investigación: no está pensado para uso en producción ni se documenta su robustez fuera del dominio Pile.
- Licencia no disponible: no se puede confirmar el uso comercial; debe contactarse con el autor antes de cualquier despliegue.
- Idiomas no documentados: el entrenamiento sobre Pile implica un sesgo fuerte hacia el inglés.
- Riesgo de alucinación: no evaluado; la métrica Natural FDA (6,8%) sugiere un rendimiento bajo en generación con respuesta contenida, lo que aconseja cautela.
- Longitud de contexto no documentada: no se puede garantizar el comportamiento en secuencias largas.
- Sin soporte documentado de tool calling, agentes ni cuantización: la integración en pipelines existentes requeriría trabajo adicional.
- Repositorio con 0 descargas y 0 likes: sin validación comunitaria ni evidencia de uso externo.

## Enlaces

- Hugging Face: https://huggingface.co/robgarct/gdn-headgain-existsfreq-120m-rare4-6k
- Código (rama `ngram-router-ablations` del proyecto `recurrent-recall-circuits`): no se proporciona URL directa en la información disponible.
- Paper, blog o demo: no disponibles.
