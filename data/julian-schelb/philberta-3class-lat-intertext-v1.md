# julian-schelb/philberta-3class-lat-intertext-v1

## Resumen

El modelo `julian-schelb/philberta-3class-lat-intertext-v1` es un clasificador de pares de secuencias entrenado para detectar y tipificar vínculos intertextuales entre pasajes de la literatura latina clásica, con especial foco en las obras de Jerónimo (Hieronimus) y otros autores. Desarrollado por Julian Schelb y colaboradores, se presenta como un componente integrable en el paquete Python LociSimiles, orientado a flujos de trabajo filológicos digitales. El modelo distingue entre tres clases: `no_match` (pasajes no relacionados), `cit` (cita o reutilización léxica cercana) y `cf` (eco temático difuso). Se basa en el modelo preentrenado `bowphs/PhilBerta` y se ajusta con uno de los cinco splits de validación cruzada del benchmark Loci Similes, empleando muestreo balanceado de clases para contrarrestar el fuerte desequilibrio de los corpus reales. Con 135 millones de parámetros y una ventana de 512 tokens, está pensado para tareas de clasificación de pares de pasajes latinos, no para generación de texto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (RoBERTa) basado en `bowphs/PhilBerta` |
| Parametros totales | 135.196.419 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 512 tokens (max input tokens) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | latin (la) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura de un transformer encoder tipo RoBERTa, heredada de su base `bowphs/PhilBerta`, un modelo de lenguaje preentrenado específicamente para latín. Sobre esta base se añade una cabeza de clasificación de secuencias que procesa pares de pasajes concatenados con el patrón `<s> frase1 </s></s> frase2 </s>`. El entrenamiento se realizó sobre el benchmark Loci Similes, un corpus de pares etiquetados con tres clases, utilizando uno de los cinco splits de validación cruzada. Se aplicó un muestreo balanceado por clase para mitigar el desequilibrio entre positivos y negativos, ya que en corpus reales la mayoría de pares no presentan relación intertextual. No se mencionan técnicas como RLHF o DPO; el ajuste es de tipo supervisado estándar para clasificación. La innovación principal radica en la distinción entre cita textual (reutilización léxica directa) y eco temático (similitud conceptual sin solapamiento léxico), algo que los modelos binarios anteriores no capturaban.

## Capacidades

- Clasificación de pares de pasajes latinos en tres categorías: `no_match`, `cit` (cita) y `cf` (eco temático).
- Detección de reutilización léxica cercana entre fragmentos de autores clásicos, útil para identificar fuentes y alusiones directas.
- Reconocimiento de ecos temáticos o paralelismos conceptuales que no comparten vocabulario explícito.
- Manejo de secuencias de hasta 512 tokens, suficiente para pasajes de extensión media.
- Integración con el paquete Python `locisimiles` para búsqueda de intertextualidades en corpus latinos.
- Soporte de umbrales de decisión ajustables por clase (0.98 para `cit`, 0.61 para `cf`) para controlar el equilibrio entre precisión y recall en corpus desbalanceados.
- No soporta tool calling, agentes, generación de texto ni otras modalidades; es exclusivamente un clasificador.

## Casos de uso

- Investigación filológica sobre fuentes clásicas: dado un pasaje de Jerónimo, el modelo puede identificar qué autores clásicos cita o evoca, distinguiendo entre citas literales y alusiones temáticas.
- Análisis de tradición textual: ayuda a rastrear cómo ciertos motivos o expresiones se transmiten a lo largo de la literatura latina, facilitando estudios de recepción.
- Curaduría de corpus para ediciones críticas: al filtrar pares de pasajes candidatos a intertextualidad, reduce el trabajo manual de revisión en proyectos de anotación filológica.
- Enriquecimiento de bases de datos de repertorios de fuentes: permite etiquetar automáticamente pares de pasajes en grandes colecciones digitales, como la Vulgata o el corpus de autores clásicos.
- Docencia y aprendizaje de latín: puede usarse como herramienta didáctica para mostrar ejemplos de intertextualidad en obras de autores como Virgilio, Ovidio o Cicerón.
- Integración en pipelines de humanidades digitales: junto con el paquete `locisimiles`, se puede incorporar en flujos de procesamiento de texto latino para descubrir conexiones no triviales entre obras.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona que el modelo se evaluó mediante validación cruzada, pero no se incluyen métricas numéricas (precisión, recall, F1) ni comparaciones con otros sistemas. Por tanto, no es posible presentar una tabla de resultados.

## Requisitos de hardware

- VRAM estimada: no disponible oficialmente. Dado que el modelo tiene 135 millones de parámetros, una inferencia en precisión fp32 requeriría aproximadamente 540 MB de memoria, y en fp16 unos 270 MB. Con cuantización a 8 bits podría reducirse a ~135 MB, aunque no se ofrecen pesos cuantizados.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM (p. ej., NVIDIA GTX 1650, RTX 2060, o superiores) es suficiente. También puede ejecutarse en CPU para lotes pequeños.
- Opciones de despliegue: al ser un modelo de transformers estándar, es compatible con bibliotecas como Hugging Face Transformers, vLLM (para clasificación), y puede exportarse a ONNX o TensorRT. No se menciona compatibilidad con llama.cpp u Ollama, dado que no es un modelo generativo.
- Latencia y throughput: no disponible. Se espera una latencia baja (del orden de milisegundos por par) en GPU moderna, pero no hay datos oficiales.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa con modelos alternativos. Existe una versión binaria previa (`philberta-class-lat-intertext-v1` y `v2`) en la misma colección, pero no se proporcionan sus métricas ni detalles de arquitectura. Tampoco se mencionan otros modelos de clasificación de intertextualidad en latín en la documentación. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- El modelo está entrenado específicamente para latín clásico y puede no generalizar bien a latín medieval, tardío o a variantes no clásicas.
- La ventana de contexto está limitada a 512 tokens; pasajes más largos deben truncarse, lo que puede perder información relevante.
- La clase `cf` (eco temático) es intrínsecamente difícil de detectar y el modelo puede producir falsos positivos o negativos, como se indica en la model card.
- Los umbrales de decisión recomendados (0.98 para `cit`, 0.61 para `cf`) están calibrados para el corpus de entrenamiento; en otros dominios o distribuciones pueden requerir reajuste.
- No se han publicado evaluaciones independientes ni análisis de sesgos. Al ser un modelo entrenado sobre un corpus específico, puede reflejar los sesgos de las fuentes (p. ej., sobrerrepresentación de ciertos autores o géneros).
- Aunque la licencia es Apache 2.0, el uso comercial está permitido, pero se recomienda verificar la procedencia de los datos de entrenamiento (benchmark Loci Similes) para posibles restricciones adicionales.
- El modelo no es generativo; no produce texto, solo clasifica pares. No debe usarse para tareas de generación o completado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/julian-schelb/philberta-3class-lat-intertext-v1
- Colección de modelos para búsqueda de intertextualidad latina: https://huggingface.co/collections/julian-schelb/models-for-latin-intertextuality-search
- Paquete Python LociSimiles en PyPI: https://pypi.org/project/locisimiles/
- Documentación de LociSimiles (API): https://julianschelb.github.io/locisimiles/api/
- Artículo arXiv (preprint): https://arxiv.org/abs/2601.07533 (referencia: Schelb et al., 2026, "Loci Similes: A Benchmark for Extracting Intertextualities in Latin Literature")
- Modelo base PhilBerta: https://huggingface.co/bowphs/PhilBerta
