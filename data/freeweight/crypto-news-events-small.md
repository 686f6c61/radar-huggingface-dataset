# freeweight/crypto-news-events-small

## Resumen

Crypto News Events (small) es un clasificador de texto multilingüe desarrollado por freeweight, un proyecto independiente que publica modelos abiertos bajo licencia Apache-2.0. El modelo resuelve un problema concreto: asignar una etiqueta de evento a titulares y avisos breves del ámbito cripto y financiero, distinguiendo entre 16 tipos de evento como hackeos, listados, deslistados, sanciones regulatorias, aprobaciones de ETF o datos macroeconómicos. Es relevante porque permite construir pipelines de monitorización de noticias en tiempo casi real sin depender de APIs propietarias ni de modelos generativos grandes.

Arquitectura y tamaño: se trata de un fine-tuning de jhu-clsp/mmBERT-small, un encoder transformer de tipo ModernBERT con 140.647.696 parámetros totales. El contexto de entrada está limitado a 192 tokens, suficiente para titulares y posts cortos de hasta unas 500 caracteres, pero no para cuerpos de artículo completos. El modelo está entrenado de forma nativa en 12 idiomas y se distribuye en formatos PyTorch (safetensors) y ONNX, incluyendo variantes fp32, fp16 e int8.

La propuesta de valor principal es la eficiencia: según la model card, procesa unos 17 ms por elemento en CPU con ONNX Runtime, lo que lo hace viable en entornos sin GPU. Además, incorpora una temperatura calibrada en la cabeza de clasificación, de modo que las probabilidades de salida son directamente utilizables sin post-procesado adicional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (ModernBERT, base jhu-clsp/mmBERT-small) |
| Parametros totales | 140.647.696 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 192 tokens (entrada máxima) |
| Tipos de cuantizacion | fp32, fp16, int8 (solo en la tabla de embeddings) |
| Idiomas soportados | en, zh, ko, ja, es, pt, tr, ru, vi, id, de, fr (12 idiomas) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors, ONNX (fp32, fp16, int8) |

## Arquitectura y entrenamiento

El modelo parte de mmBERT-small, un encoder de la familia ModernBERT orientado a multilingüismo y eficiencia. Sobre esa base se ha realizado un fine-tuning para clasificación de texto de etiqueta única con 16 clases. La cabeza de clasificación incorpora una temperatura calibrada, lo que significa que las probabilidades devueltas por el modelo están ajustadas y no requieren técnicas adicionales de calibración post-hoc.

Según la model card, el entrenamiento se realizó con texto sintético y con titulares de organismos reguladores de licencia abierta. No se especifican el número total de tokens de entrenamiento ni la composición exacta del dataset más allá de esa descripción general. Tampoco se documenta si hubo RLHF, DPO u otras fases de alineación, algo esperable en un modelo de clasificación y no de generación. La innovación técnica destacable es la combinación de un encoder compacto con calibración integrada y exportación a ONNX y transformers.js, lo que facilita el despliegue en navegador y en entornos de inferencia ligera.

## Capacidades

- Clasificación de texto de etiqueta única en 16 tipos de evento: hack_exploit, outage_insolvency, stablecoin, delisting, listing, token_supply, airdrop_rewards, legal_enforcement, regulation_policy, etf_institutional, funding_mna, partnership_integration, product_launch, macro, market_commentary y other.
- Procesamiento multilingüe nativo en 12 idiomas (inglés, chino, coreano, japonés, español, portugués, turco, ruso, vietnamita, indonesio, alemán y francés), con filas de entrenamiento nativas y test real por idioma según la model card.
- Salida de probabilidades calibradas gracias a la temperatura integrada en la cabeza de clasificación.
- Soporte de top-k labels para obtener las etiquetas más probables con sus puntuaciones.
- Inferencia en CPU con ONNX Runtime (unos 17 ms por elemento) y en navegador mediante transformers.js.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generación de texto: es exclusivamente un clasificador.
- No dispone de modo thinking, visión ni audio.

## Casos de uso

- Monitorización de noticias cripto en tiempo real: el modelo clasifica titulares y avisos de exchanges a medida que llegan, permitiendo enrutar alertas de hackeos o deslistados a los equipos correspondientes con una latencia de milisegundos en CPU.
- Moderación y filtrado de feeds financieros: se puede usar para separar contenido relevante (eventos regulatorios, macro, listados) del ruido (comentario de mercado, otros) antes de pasarlo a un modelo generativo más costoso.
- Enriquecimiento de bases de datos de eventos: clasificar automáticamente miles de titulares históricos para construir un dataset etiquetado de eventos cripto que alimente análisis posteriores o modelos de forecasting.
- Alertas de cumplimiento normativo: detectar automáticamente noticias de legal_enforcement o regulation_policy en varios idiomas para que los equipos de compliance revisen posibles impactos regulatorios en distintas jurisdicciones.
- Automatización de boletines y resúmenes diarios: agrupar titulares por tipo de evento (funding_mna, partnership_integration, product_launch) para generar secciones temáticas en newsletters o dashboards internos.
- Procesamiento en el navegador o en el edge: gracias a la exportación a transformers.js y a las variantes ONNX cuantizadas, se puede integrar la clasificación directamente en una extensión o aplicación web sin backend, clasificando titulares en el cliente.
- Filtrado previo en pipelines de trading algorítmico: clasificar noticias macro o de hackeos para activar o desactivar estrategias o circuit breakers ante eventos de riesgo.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Macro-F1 en 2.098 items reales en 12 idiomas | 0,705 (etiquetas generadas por el modelo, no verificadas por humanos) |
| Mejor baseline zero-shot probado | 0,471 macro-F1 |
| Latencia CPU por elemento (ONNX fp32) | 16,5 ms |
| Latencia CPU por elemento (ONNX fp16) | 18,6 ms |
| Latencia CPU por elemento (ONNX int8) | 17,4 ms |
| Latencia CPU por elemento (PyTorch fp32) | 78 ms |
| Acuerdo de etiquetas fp16 vs fp32 | 0,9990 |
| Acuerdo de etiquetas int8 vs fp32 | 0,9953 |

No se han publicado resultados de benchmarks estándar como MMLU, HumanEval o GSM8K en la información disponible, ya que el modelo no está orientado a esas tareas.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 (563 MB de pesos) y alrededor de 300 MB en las variantes ONNX fp16 e int8.
- GPU recomendadas: no requiere GPU; cualquier GPU consumer (RTX 3060, RTX 4090, etc.) puede ejecutarlo con holgura, pero el diseño está optimizado para CPU.
- Cabe en cualquier GPU consumer e incluso en entornos sin GPU dedicada, incluyendo Raspberry Pi y navegadores.
- Opciones de despliegue: PyTorch con transformers (>= 4.48), ONNX Runtime, transformers.js, y compatible con text-embeddings-inference y endpoints de Hugging Face según los tags.
- Latencia y throughput estimados: aproximadamente 17 ms por elemento en CPU con ONNX Runtime, lo que equivale a unos 58 elementos por segundo en un solo hilo; el throughput escala con el número de hilos y batch size.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Enfoque |
|---|---|---|---|---|---|
| freeweight/crypto-news-events-small | 140,6 M | 192 tokens | 12 | Apache-2.0 | Clasificación de eventos cripto |
| jhu-clsp/mmBERT-small (base) | no disponible | no disponible | multilingüe | no disponible | Encoder multilingüe general |
| Clasificadores zero-shot genéricos (p. ej. baselines probados por el autor) | variable | variable | variable | variable | Clasificación zero-shot; macro-F1 0,471 en el test del autor |

No se dispone de información sobre otros clasificadores especializados en eventos cripto comparables en la documentación proporcionada.

## Limitaciones y advertencias

- El modelo está diseñado para titulares y posts cortos de hasta aproximadamente 500 caracteres (192 tokens); no es adecuado para cuerpos de artículo completos.
- La métrica principal (macro-F1 0,705) se calculó sobre etiquetas generadas por el propio modelo, no verificadas por humanos, por lo que puede estar sesgada.
- Riesgo de alucinación no aplica en el sentido generativo, pero sí de clasificación errónea en textos ambiguos o que mezclan varios tipos de evento; el modelo devuelve una sola etiqueta primaria.
- Los ejemplos de la model card usan nombres de exchanges y proyectos inventados, lo que sugiere que el entrenamiento con texto sintético puede no cubrir todos los casos reales.
- Aunque se listan 12 idiomas, el rendimiento puede variar entre ellos; no se proporcionan métricas desglosadas por idioma en la información disponible.
- Licencia Apache-2.0 permite uso comercial sin restricciones adicionales, pero se recomienda validar el modelo en el dominio específico antes de producción.
- No soporta tool calling, agentes ni generación, por lo que no puede sustituir a un LLM en tareas que requieran razonamiento o síntesis.

## Enlaces

- Hugging Face: https://huggingface.co/freeweight/crypto-news-events-small
- Modelo base: https://huggingface.co/jhu-clsp/mmBERT-small
- Repositorio de transformers.js: https://github.com/huggingface/transformers.js
- ONNX Runtime: https://onnxruntime.ai/
- Documentación de transformers: https://huggingface.co/docs/transformers
