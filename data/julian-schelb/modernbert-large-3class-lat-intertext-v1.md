# julian-schelb/modernbert-large-3class-lat-intertext-v1

## Resumen

El modelo `julian-schelb/modernbert-large-3class-lat-intertext-v1` es un clasificador de secuencias pareadas (sequence-pair classification) desarrollado por Julian Schelb y colaboradores para detectar y tipificar vínculos intertextuales en literatura latina clásica. Se trata de un fine-tuning de `answerdotai/ModernBERT-large`, un encoder transformer de 395 millones de parámetros, adaptado a la tarea concreta de distinguir entre tres clases: `no_match` (pasajes sin relación), `cit` (cita o reutilización léxica cercana) y `cf` (eco temático laxo, del latín *confer*). El modelo está pensado para integrarse en el paquete Python LociSimiles, que automatiza la búsqueda de intertextualidades en corpus latinos.

La relevancia de este modelo radica en que aborda un problema específico de las humanidades digitales: la identificación automática de alusiones y reutilizaciones textuales entre autores clásicos, una tarea tradicionalmente manual y que requiere un conocimiento filológico profundo. Al distinguir entre citas explícitas y ecos temáticos, ofrece una granularidad mayor que los clasificadores binarios anteriores (match / no match). Su licencia Apache 2.0 y su disponibilidad pública en Hugging Face facilitan su adopción en flujos de investigación. El contexto máximo de entrada es de 512 tokens, suficiente para pasajes breves típicos de la literatura clásica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (ModernBERT-large) con cabecera de clasificación de secuencias |
| Parametros totales | 395.834.371 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 512 tokens (límite de entrada del fine-tuning) |
| Tipos de cuantizacion | no disponible (pesos originales en safetensors; cuantizaciones no publicadas) |
| Idiomas soportados | Latin (la) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `ModernBERT-large`, un encoder transformer bidireccional desarrollado por AnswerDotAI que incorpora mejoras modernas como atención con Flash Attention, normalización por capas pre-norm, y una tokenización eficiente con vocabulario BPE de 50.000 tokens. Sobre este encoder se añade una cabecera de clasificación de secuencias que recibe la representación del token especial `<s>` (CLS) para producir una distribución de probabilidad sobre las tres clases. La entrada se estructura como un par de secuencias con el patrón `<s> frase_jerónimo </s></s> frase_candidata </s>`, siguiendo la convención de los modelos encoder para clasificación de pares.

El entrenamiento se realizó sobre una de las cinco particiones de validación cruzada del benchmark Loci Similes, un conjunto de datos creado específicamente para este problema. El corpus incluye pasajes de Jerónimo (Hieronimus) y de otros autores clásicos latinos, con etiquetas de intertextualidad anotadas manualmente. Se empleó un muestreo balanceado por clases, dado que en corpus reales la mayoría de los pares son negativos (`no_match`). El modelo se entrenó con la función de pérdida de entropía cruzada estándar para clasificación multiclase. No se mencionan técnicas adicionales como RLHF o DPO, ya que es un modelo discriminativo de clasificación, no generativo.

## Capacidades

- Clasificación de pares de pasajes latinos en tres categorías: `no_match`, `cit` (cita / reutilización léxica cercana) y `cf` (eco temático laxo).
- Detección de reutilización textual exacta o casi exacta (clase `cit`) con alta precisión, gracias a la señal léxica fuerte.
- Identificación de ecos temáticos (clase `cf`) donde no hay solapamiento léxico evidente, aunque con menor fiabilidad que `cit`.
- Integración con el paquete LociSimiles para flujos de trabajo de intertextualidad en latín.
- Acepta pares de secuencias de hasta 512 tokens, adecuado para pasajes breves y citas.
- Salida probabilística sobre las tres clases, permitiendo ajustar umbrales de decisión por clase (recomendado: `cit` 0.91, `cf` 0.88).
- Sin capacidades generativas, de tool calling, ni multimodales; es un modelo puramente discriminativo.

## Casos de uso

- Investigación filológica asistida: un investigador puede cargar un pasaje de Jerónimo y obtener una lista de pasajes candidatos de otros autores clásicos clasificados como `cit` o `cf`, acelerando la identificación manual de fuentes y alusiones.
- Construcción de corpus de intertextualidad: el modelo puede procesar grandes volúmenes de pares de pasajes para generar anotaciones automáticas preliminares, que luego un experto revisa y refina.
- Análisis de recepción clásica: estudiar cómo un autor posterior (p. ej., Jerónimo) reutiliza textos de autores anteriores, distinguiendo entre citas directas y ecos temáticos, lo que permite trazar influencias intelectuales.
- Enriquecimiento de ediciones digitales: integrar el modelo en plataformas de publicación académica para añadir enlaces intertextuales automáticos a los textos, mejorando la navegación y el estudio comparativo.
- Evaluación de similitud textual en latín: servir como componente en pipelines de recuperación de información para literatura clásica, combinando la clasificación con búsqueda por similitud vectorial.
- Docencia y divulgación: generar ejemplos interactivos de intertextualidad para cursos de literatura latina, mostrando automáticamente cómo un pasaje se relaciona con otros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de precisión, recall o F1 sobre el conjunto de test, ni comparaciones con otros modelos. Solo se indica que el modelo se entrenó sobre una partición de validación cruzada del benchmark Loci Similes y que se recomienda el uso de umbrales por clase (`cit` 0.91, `cf` 0.88) para reducir falsos positivos en corpus desbalanceados. Los autores mencionan que la clase `cf` es considerablemente más difícil que `cit` por carecer de señal léxica fiable, pero no aportan cifras concretas.

## Requisitos de hardware

- VRAM estimada para inferencia: con pesos en fp32 (~1,6 GB), el modelo puede ejecutarse en GPUs con al menos 4 GB de VRAM para inferencia con batch pequeño. En fp16 (~0,8 GB) cabe en GPUs de 2-3 GB.
- GPU recomendadas: cualquier GPU moderna con soporte CUDA (p. ej., NVIDIA T4, RTX 3060, RTX 4090) es suficiente. También puede ejecutarse en CPU, aunque con mayor latencia.
- En consumer GPU: sí, cabe en GPUs de gama media como RTX 3060 o superiores.
- Opciones de despliegue: al ser un modelo de transformers estándar, puede servirse con Hugging Face Transformers, Text Embeddings Inference (TEI), o cualquier framework compatible con modelos encoder (p. ej., ONNX Runtime). No se ha probado con vLLM u Ollama, que están orientados a modelos generativos.
- Latencia y throughput: no disponible. Para un modelo de 395M parámetros, se espera una inferencia de decenas de milisegundos por par en GPU moderna, pero no hay datos oficiales.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `julian-schelb/modernbert-large-3class-lat-intertext-v1` | 395M | 512 | Clasificación 3 clases (no_match, cit, cf) | Apache 2.0 | Hugging Face |
| `julian-schelb/modernbert-large-class-lat-intertext-v1` (binario) | 395M | 512 | Clasificación binaria (match / no match) | Apache 2.0 | Hugging Face |
| `answerdotai/ModernBERT-large` (base) | 395M | 8192 | Modelo base de lenguaje enmascarado | Apache 2.0 | Hugging Face |

La comparativa se limita a los modelos relacionados del mismo autor y al modelo base, ya que no se dispone de información sobre otros clasificadores de intertextualidad latina en el momento de la búsqueda. La diferencia clave con el modelo binario es la capacidad de distinguir entre cita (`cit`) y eco temático (`cf`), lo que aporta más información filológica pero también mayor complejidad de decisión.

## Limitaciones y advertencias

- Entrenado exclusivamente en latín clásico, con un enfoque específico en los textos de Jerónimo y otros autores clásicos; puede no generalizar bien a latín medieval, humanístico o eclesiástico posterior.
- La clase `cf` (eco temático) es intrínsecamente difícil y el modelo puede producir falsos positivos o negativos en esta categoría; los autores recomiendan umbrales altos (0.88) para mitigar el ruido.
- La longitud máxima de 512 tokens limita el análisis a pasajes breves; no es adecuado para comparar capítulos completos o textos extensos sin segmentación previa.
- El modelo fue entrenado con una partición de validación cruzada específica; su rendimiento en otros corpus o dominios no ha sido validado públicamente.
- No se han publicado métricas de evaluación cuantitativas (precisión, recall, F1), lo que dificulta una comparación objetiva con alternativas.
- El uso de umbrales por clase requiere ajuste adicional si se aplica a corpus con distribuciones de clases muy diferentes a las del entrenamiento.
- Licencia Apache 2.0 permite uso comercial, pero los datos de entrenamiento (Loci Similes) pueden tener restricciones adicionales; se debe verificar la licencia de los datasets asociados.
- No es un modelo generativo; no puede producir texto nuevo ni explicar sus decisiones, solo clasificar pares.

## Enlaces

- Hugging Face del modelo: https://huggingface.co/julian-schelb/modernbert-large-3class-lat-intertext-v1
- Modelo binario anterior: https://huggingface.co/julian-schelb/modernbert-large-class-lat-intertext-v1
- Modelo base: https://huggingface.co/answerdotai/ModernBERT-large
- Paper (arXiv): https://arxiv.org/abs/2601.07533
- Datasets: 
  - https://huggingface.co/datasets/julian-schelb/latin-classical-intertextuality-labels
  - https://huggingface.co/datasets/julian-schelb/latin-classical-intertextuality-corpus
  - https://huggingface.co/datasets/julian-schelb/latin-classical-intertextuality-queries
- Paquete LociSimiles (PyPI): https://pypi.org/project/locisimiles/
- Documentación de LociSimiles: https://julianschelb.github.io/locisimiles/api/
- CLI de LociSimiles: https://julianschelb.github.io/locisimiles/cli/
