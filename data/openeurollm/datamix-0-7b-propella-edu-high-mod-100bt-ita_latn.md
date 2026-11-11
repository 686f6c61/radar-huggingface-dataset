# openeurollm/datamix-0.7B-propella-edu-high-mod-100bt-ita_Latn

## Resumen

El modelo `datamix-0.7B-propella-edu-high-mod-100bt-ita_Latn` es un modelo de lenguaje de 0,7 mil millones de parámetros entrenado desde cero por el proyecto OpenEuroLLM, una iniciativa europea orientada a construir modelos fundacionales abiertos y multilingües. Se trata de un experimento controlado de mezcla de datos (de ahí el prefijo `datamix`): el modelo se ha entrenado exclusivamente con 100 mil millones de tokens en italiano extraídos del corpus HPLT 4, tras aplicar un filtro de calidad basado en el clasificador Propella-1, conservando únicamente los documentos clasificados como "Moderate" o "High" en la categoría "Educational".

El propósito del modelo no es tanto el despliegue en producción como la investigación sobre el impacto del filtrado de datos educativos en el rendimiento de modelos pequeños y monolingües. Al ser un modelo de 0,7B entrenado desde cero con un presupuesto de cómputo relativamente modesto, resulta útil como línea base reproducible para estudiar el efecto de las políticas de curación de datos sobre el italiano.

La relevancia actual radica en que forma parte de la familia de artefactos intermedios de OpenEuroLLM, que documenta sistemáticamente distintas combinaciones de datos y filtros. La licencia Apache 2.0 y el formato safetensors facilitan su reutilización y su integración en pipelines de evaluación comparativa dentro de la comunidad investigadora europea.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (transformer decoder-only, inferido por el tamaño y el formato) |
| Parametros totales | 0,7B |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | italiano (it) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La model card no detalla la arquitectura interna más allá del número de parámetros (0,7B). Por el tamaño, el formato safetensors y la convención de nombres del proyecto, se trata presumiblemente de un transformer decoder-only de tipo GPT, aunque no se especifican número de capas, dimensión oculta, cabezas de atención ni función de activación. Tampoco se indica la longitud de contexto de entrenamiento ni la presencia de embeddings posicionales rotatorios (RoPE) u otras innovaciones.

El dato central es el régimen de entrenamiento: 100 mil millones de tokens en italiano procedentes de HPLT 4, filtrados con el clasificador Propella-1 en su categoría "Educational", conservando documentos con puntuación "Moderate" o "High". No se documenta si hubo fases de ajuste supervisado, RLHF o DPO, ni la composición exacta del dataset más allá de la fuente y el filtro. La ausencia de información sobre el tokenizador y sobre la mezcla final limita la reproducibilidad exacta del experimento.

## Capacidades

- Generación de texto en italiano, como capacidad principal derivada del corpus de entrenamiento monolingüe.
- Modelado de lenguaje base: al no documentarse ajuste por instrucciones, no se garantiza el seguimiento de instrucciones ni el formato conversacional.
- Razonamiento y conocimiento factual limitados por el tamaño (0,7B) y por el filtro educativo del corpus.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: únicamente italiano; no se documenta transferencia a otras lenguas.
- Capacidades especiales (modo thinking, visión, audio): no disponibles.

## Casos de uso

- Investigación sobre curación de datos: servir como línea base para medir el efecto del filtro Propella-1 "Educational" frente a otras mezclas del mismo proyecto, comparando perplejidad y métricas downstream en italiano.
- Evaluación de modelos pequeños monolingües: utilizar el modelo como referencia de 0,7B en benchmarks de italiano para calibrar el rendimiento esperado de modelos de ese orden de magnitud.
- Generación de texto asistida en italiano: completado de frases, redacción de borradores y resúmenes cortos en dominios educativos, donde el corpus de entrenamiento es representativo.
- Experimentos de destilación: emplear el modelo como estudiante en pipelines de destilación desde modelos mayores, aprovechando su licencia permisiva y su tamaño reducido.
- Fine-tuning específico de dominio: partir de los pesos preentrenados para ajustar tareas concretas en italiano (clasificación, extracción, generación controlada) con requisitos de cómputo modestos.
- Reproducibilidad y auditoría de datos: analizar qué tipo de conocimiento y sesgos introduce un corpus filtrado por criterios educativos, comparándolo con modelos entrenados sobre HPLT 4 sin filtrar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 1,4 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, entre 2 y 3 GB según longitud de contexto.
- VRAM estimada en cuantización de 8 bits: alrededor de 0,7-1 GB para pesos.
- VRAM estimada en cuantización de 4 bits: alrededor de 0,4-0,6 GB para pesos.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060 12 GB, RTX 4060 Ti, RTX 4090) es sobradamente suficiente; también cabe en GPUs de gama baja y en CPU.
- Cabe en GPU consumer: sí, en prácticamente cualquier GPU con 4 GB o más de VRAM, e incluso en iGPU con suficiente memoria compartida.
- Opciones de despliegue: al no publicarse pesos en GGUF, la inferencia estándar sería con `transformers` (PyTorch) o `safetensors`; para llama.cpp u Ollama habría que convertir los pesos previamente. vLLM y TGI son viables si se dispone de la configuración de arquitectura, no documentada en la model card.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| datamix-0.7B-propella-edu-high-mod-100bt-ita_Latn | 0,7B | no disponible | it | Apache 2.0 | Entrenado desde cero con 100B tokens filtrados de HPLT 4 |
| Modelos de la familia OpenEuroLLM (otras mezclas datamix) | variable (0,7B y superiores) | no disponible | principalmente lenguas europeas | Apache 2.0 (presumible) | Mismo pipeline, distintas políticas de filtrado |
| Modelos monolingües italianos de tamaño similar (p. ej. variantes de 1B) | ~1B | variable | it | variable | No se dispone de datos concretos en la información proporcionada |

No se dispone de información suficiente para establecer una comparativa cuantitativa con alternativas concretas; los datos de rendimiento y contexto de los modelos comparables no están disponibles en la documentación consultada.

## Limitaciones y advertencias

- Modelo base sin ajuste por instrucciones documentado: no debe esperarse un comportamiento conversacional fiable sin fine-tuning adicional.
- Sesgos potenciales derivados del corpus HPLT 4 y del filtro "Educational" de Propella-1, que puede sobrerrepresentar ciertos registros y dominios.
- Riesgo de alucinación elevado por el tamaño reducido (0,7B) y la ausencia de fases de alineación documentadas.
- Cobertura lingüística limitada al italiano; no se garantiza un comportamiento correcto en otras lenguas.
- Longitud de contexto no documentada, lo que impide planificar su uso en tareas de contexto largo.
- Licencia Apache 2.0 permisiva para uso comercial, pero sin garantías de calidad ni de idoneidad para producción.
- Ausencia de información sobre el tokenizador, la arquitectura exacta y la composición del dataset, lo que dificulta la reproducibilidad y la auditoría.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que sugiere escasa validación comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/openeurollm/datamix-0.7B-propella-edu-high-mod-100bt-ita_Latn
- Corpus HPLT 4: no disponible en la información proporcionada
- Clasificador Propella-1: no disponible en la información proporcionada
- Proyecto OpenEuroLLM: no disponible en la información proporcionada
