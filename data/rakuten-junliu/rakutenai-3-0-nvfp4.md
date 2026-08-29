# rakuten-junliu/RakutenAI-3.0-NVFP4

## Resumen

RakutenAI-3.0-NVFP4 es una versión cuantizada a precisión NVFP4 (4 bits en coma flotante) del modelo RakutenAI-3.0, desarrollado por Rakuten Group como parte del proyecto GENIAC del Ministerio de Economía, Comercio e Industria de Japón. El modelo base es un LLM masivo de 671 mil millones de parámetros con arquitectura MoE (Mixture of Experts) basada en DeepSeek-V3, optimizado para los idiomas japonés e inglés. Esta cuantización, producida con NVIDIA TensorRT-Model-Optimizer, reduce significativamente los requisitos de memoria y acelera la inferencia en GPUs Blackwell, manteniendo un rendimiento casi idéntico al baseline FP8.

La relevancia de esta versión radica en que permite desplegar un modelo de 671B en entornos de producción con restricciones de hardware, ya que el peso de los parámetros se reduce a la mitad respecto a FP8 (de 1 byte a 0,5 bytes por parámetro). La calibración se realizó con 820 muestras mixtas de japonés e inglés, y se evaluó frente al baseline FP8 en tareas de razonamiento matemático (GSM8K) y conocimiento general (MMLU), con una degradación mínima. Además, se conservan en alta precisión las proyecciones de atención MLA, los gates del MoE, la capa lm_head y el módulo MTP (Multi-Token Prediction), lo que contribuye a preservar la calidad del modelo original.

El modelo se distribuye bajo licencia Apache 2.0, igual que su base, y está diseñado para cargarse con SGLang (usando `--quantization modelopt_fp4`) o TensorRT-LLM en hardware Blackwell.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DeepSeek-V3 (MoE, transformer con atención MLA) |
| Parametros totales | 671 mil millones (671B) |
| Parametros activos | no disponible (el modelo base DeepSeek-V3 tiene ~37B activos, pero no se especifica para esta versión) |
| Longitud de contexto | no disponible (el modelo base soporta 128K tokens, pero no se indica en la documentación) |
| Tipos de cuantizacion | NVFP4 (FP4, 4 bits) con group size 16, KV cache en FP8 |
| Idiomas soportados | Japonés, inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (probablemente safetensors, pero no se confirma en la información) |

## Arquitectura y entrenamiento

RakutenAI-3.0-NVFP4 no es un modelo entrenado desde cero, sino una cuantización del modelo RakutenAI-3.0, que a su vez sigue la arquitectura DeepSeek-V3: un transformer con mezcla de expertos (MoE) donde solo se activa un subconjunto de parámetros por token, atención con latente multi-cabeza (MLA) y capas de predicción multi-token (MTP). El proceso de cuantización se llevó a cabo con NVIDIA TensorRT-Model-Optimizer utilizando la configuración `NVFP4_DEFAULT_CFG`, con un tamaño de grupo de 16 y caché KV en FP8. Se mantuvieron en alta precisión las proyecciones de atención MLA, los gates del MoE, la capa `lm_head` y el módulo MTP, ya que son componentes críticos para la estabilidad numérica.

La calibración se realizó con un conjunto de 820 muestras mixtas en japonés e inglés, que incluyen diálogos de seguridad y autoidentificación, instrucciones, texto enciclopédico y prosa periodística. Este enfoque busca minimizar la pérdida de calidad en tareas de razonamiento y conversación. No se aplicaron técnicas de entrenamiento adicionales como RLHF o DPO; la cuantización es puramente post-entrenamiento.

## Capacidades

- Generación de texto en japonés e inglés con alta fluidez, heredada del modelo base RakutenAI-3.0.
- Razonamiento matemático y lógico: conserva un rendimiento cercano al baseline FP8 en GSM8K (93,93 frente a 94,39).
- Conocimiento general y enciclopédico: MMLU de 84,67 frente a 85,27 del baseline FP8.
- Capacidad de autoidentificación como IA, preservada tras la cuantización según la evaluación realizada.
- Soporte de arquitectura MoE con activación parcial de parámetros, lo que permite una inferencia eficiente.
- Compatible con SGLang y TensorRT-LLM para despliegue en GPUs Blackwell (B200, GB200).
- No se documentan capacidades específicas de tool calling, visión o audio en la información disponible; estas dependerían del modelo base, pero no se confirman.

## Casos de uso

- Despliegue de un asistente conversacional en japonés para atención al cliente de empresas que operan en Japón, aprovechando la baja degradación de rendimiento y el soporte nativo del idioma.
- Generación de contenido editorial y periodístico en japonés e inglés, gracias a su calibración con prosa enciclopédica y noticias, manteniendo coherencia y estilo.
- Razonamiento matemático en aplicaciones educativas o de análisis financiero, donde los resultados de GSM8K indican una precisión cercana al modelo sin cuantizar.
- Sistemas de búsqueda semántica y resumen de documentos extensos en entornos con limitaciones de memoria, al reducir el footprint de memoria a la mitad frente a FP8.
- Investigación académica sobre técnicas de cuantización extrema (4 bits) en modelos MoE de gran escala, ya que la publicación incluye detalles de calibración y evaluación.
- Inferencia en producción con GPUs Blackwell en la nube, donde NVFP4 es una opción soportada nativamente por TensorRT-LLM, permitiendo mayor throughput por servidor.

## Benchmarks y rendimiento

Los únicos resultados de evaluación publicados en la model card comparan esta versión NVFP4 con el baseline FP8 del mismo modelo. No se proporcionan comparaciones con otros modelos.

| Métrica | RakutenAI-3.0-NVFP4 | Baseline FP8 |
|---|---|---|
| GSM8K | 93,93 | 94,39 |
| MMLU | 84,67 | 85,27 |

La degradación relativa es del 0,49% en GSM8K y del 0,70% en MMLU, lo que indica una pérdida de precisión muy reducida. No se dispone de más benchmarks (HumanEval, MATH, etc.) en la información proporcionada.

## Requisitos de hardware

- VRAM estimada: con 671B parámetros en FP4 (0,5 bytes por parámetro), el peso total ocupa aproximadamente 335 GB, más la caché KV en FP8 y overhead de activaciones. Esto requiere múltiples GPUs de alta gama.
- GPUs recomendadas: diseñado para GPUs Blackwell (B200, GB200) que soportan NVFP4 de forma nativa. También puede ejecutarse en GPUs Hopper (H100) con soporte de TensorRT-LLM, aunque con menor eficiencia.
- No cabe en una GPU de consumo (RTX 4090, 3090, etc.) debido al tamaño del modelo; se necesita un servidor con al menos 4-8 GPUs de 80 GB o más.
- Opciones de despliegue: SGLang (con `--quantization modelopt_fp4`) y TensorRT-LLM. No se menciona compatibilidad con llama.cpp u Ollama.
- Latencia y throughput: no disponibles en la documentación; dependerán del hardware y la configuración de despliegue.

## Comparativa con modelos similares

No se dispone de comparativas directas con otras cuantizaciones o modelos equivalentes en la información proporcionada. El modelo base RakutenAI-3.0 es comparable a otros LLM japoneses de gran escala como Fugaku-LLM o ELYZA-Llama, pero no se ofrecen datos de rendimiento comparado. La única referencia es el baseline FP8 del mismo modelo, que se ha incluido en la sección de benchmarks.

## Limitaciones y advertencias

- La cuantización a 4 bits introduce una ligera pérdida de precisión, aunque los benchmarks muestran una degradación mínima; en tareas no evaluadas podría haber desviaciones mayores.
- El modelo solo soporta japonés e inglés; no está optimizado para otros idiomas.
- La longitud de contexto no está especificada en la documentación de esta versión; se debe asumir la del modelo base (128K) solo si se confirma en la documentación oficial.
- No se han documentado sesgos específicos, pero al ser un modelo entrenado principalmente con datos japoneses y occidentales, puede presentar sesgos culturales o de género.
- Riesgo de alucinación inherente a los LLM, especialmente en tareas de generación libre; se recomienda validación humana en aplicaciones críticas.
- Aunque la licencia Apache 2.0 permite uso comercial, el despliegue requiere hardware Blackwell específico, lo que puede limitar su accesibilidad.
- La autoidentificación como IA se preserva, pero no se garantiza en todos los escenarios; se debe probar en el caso de uso concreto.

## Enlaces

- Modelo cuantizado: https://huggingface.co/rakuten-junliu/RakutenAI-3.0-NVFP4
- Modelo base: https://huggingface.co/Rakuten/RakutenAI-3.0
- Variante con menor error de cuantización: https://huggingface.co/rakuten-junliu/RakutenAI-3.0-NVFP4-fos
- Anuncio de Rakuten AI 3.0 (marzo 2026): https://global.rakuten.com/corp/news/press/2026/0317_01.html
- Anuncio de Rakuten AI 3.0 (diciembre 2025): https://global.rakuten.com/corp/news/press/2025/1218_01.html
- Web oficial de Rakuten AI: https://ai.rakuten.com/
