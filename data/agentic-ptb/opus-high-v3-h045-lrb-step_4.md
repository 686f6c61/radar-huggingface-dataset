# agentic-ptb/opus-high-v3.h045.lrB.step_4

## Resumen

`opus-high-v3.h045.lrB.step_4` es un checkpoint intermedio derivado de un experimento de entrenamiento agéntico denominado **AgentPTB opus-high-v3**, ejecutado mediante Claude Code. El autor, `agentic-ptb`, lo publica como artefacto de reproducibilidad y estudio cualitativo, no como un modelo listo para uso. Se trata de un fine-tune del modelo base `Qwen/Qwen3.5-9B-Base`, con 9.409.813.744 parámetros y pesos en formato `safetensors` (18.8 GB en el repositorio).

La model card incluye una advertencia explícita: el run **no encontró mejora en los pesos entrenados** y se etiqueta como `negative-results`. Esto significa que, pese a ser un checkpoint válido técnicamente, no representa una mejora sobre el modelo base y no debe inferirse calidad a partir de su publicación. Su relevancia actual reside en el estudio de dinámicas de entrenamiento agéntico, la reproducibilidad de pipelines basados en agentes y el análisis de fallos de convergencia, más que en su uso práctico como modelo de producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivado de Qwen/Qwen3.5-9B-Base) |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (no especificada en la informacion) |
| Tipos de cuantizacion | no disponible (solo safetensors en precision original) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tune del checkpoint base `Qwen/Qwen3.5-9B-Base`. No se proporcionan detalles sobre la arquitectura interna más allá de heredar la del modelo base (transformador denso, sin indicación de MoE ni SSM). Tampoco se especifican el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas como RLHF o DPO.

El entrenamiento se realizó bajo un pipeline agéntico (Claude Code), y este checkpoint corresponde al paso 4 de un run etiquetado como `h045`. La propia model card indica que el run no produjo mejoras en los pesos entrenados, por lo que el checkpoint se conserva únicamente con fines de reproducibilidad y estudio cualitativo. No hay información sobre innovaciones técnicas aplicadas (decodificación especulativa, atención lineal, etc.).

## Capacidades

No se han evaluado capacidades específicas de este checkpoint. Al ser un fine-tune del modelo base `Qwen/Qwen3.5-9B-Base`, en principio conservaría las capacidades generales de dicho modelo (generación de texto, razonamiento, código, etc.), pero la advertencia del autor indica que no hay mejora sobre el base y no se han publicado evaluaciones. Por tanto:

- No se dispone de datos sobre generación de texto, razonamiento, código o matemáticas.
- No se ha verificado soporte de tool calling, agentes o razonamiento multi-paso.
- No se ha verificado capacidad multilingüe.
- No se ha verificado ningún modo especial (thinking, visión, audio).

Cualquier uso funcional debe considerarse bajo la premisa de que el checkpoint es un artefacto de investigación y no un modelo optimizado.

## Casos de uso

Dado el carácter de resultado negativo, los casos de uso son exclusivamente de investigación y análisis:

- **Estudio de reproducibilidad de entrenamiento agéntico**: permite a investigadores comparar el comportamiento de este checkpoint con otros pasos del mismo run para entender cómo evolucionan (o no) los pesos bajo un pipeline orquestado por agentes.
- **Análisis de fallos de convergencia**: sirve como caso documentado de un run que no produce mejora, útil para estudiar por qué ciertos esquemas de entrenamiento agéntico no logran optimizar los pesos.
- **Auditoría de artefactos intermedios**: para verificar la integridad de checkpoints guardados durante procesos largos y su trazabilidad (run hour, provenance, step).
- **Comparación cualitativa de pesos**: permite inspeccionar los tensores del fine-tune frente al base para identificar cambios (o ausencia de ellos) en capas concretas.
- **Validación de pipelines de evaluación**: sirve como control negativo en experimentos donde se espera que un modelo entrenado supere al base; su rendimiento debe ser igual o peor, lo que ayuda a calibrar métricas.
- **Documentación de buenas prácticas**: su publicación con advertencia explícita de `negative-results` ejemplifica cómo reportar runs fallidos de forma transparente y reproducible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor no reporta métricas de MMLU, HumanEval, GSM8K ni ninguna otra. Dada la advertencia de que no hay mejora sobre el base, cualquier cifra de rendimiento sería especulativa y no debe inferirse.

## Requisitos de hardware

Al no existir cuantizaciones publicadas ni datos de inferencia oficiales, los requisitos se estiman a partir del peso del modelo en fp16 (18.8 GB):

- **VRAM estimada para inferencia**: aproximadamente 19 GB en fp16 (pesos) más overhead de activaciones y contexto; con cuantización 8-bit podría reducirse a ~10 GB, y con 4-bit a ~6 GB, pero estas cuantizaciones no están publicadas en el repositorio.
- **GPU recomendadas**: tarjetas con 24 GB o más (RTX 3090, RTX 4090, A10G, A100 40GB) para fp16 sin particionado; para cuantización 4-bit podría bastar una GPU de 8-12 GB, aunque no hay garantía de compatibilidad.
- **Compatibilidad con GPU de consumo**: posible en fp16 con RTX 3090/4090 (24 GB) o con cuantización externa (p. ej., mediante herramientas como llama.cpp) si se generan GGUF, pero no se proporcionan.
- **Opciones de despliegue**: vLLM, llama.cpp, Ollama o TGI podrían cargar el modelo si se adapta el formato, pero no hay instrucciones oficiales ni pruebas de rendimiento.
- **Latencia y throughput**: no disponibles.

## Comparativa con modelos similares

La comparativa se limita al modelo base y a otros fine-tunes de tamaño similar, dado que no hay datos de rendimiento publicados.

| Modelo | Parametros | Contexto | Licencia | Formato | Rendimiento conocido |
|---|---|---|---|---|---|
| agentic-ptb/opus-high-v3.h045.lrB.step_4 | 9.4B | no disponible | Apache-2.0 | safetensors | no publicado (resultado negativo) |
| Qwen/Qwen3.5-9B-Base | 9.4B | no disponible | Apache-2.0 | safetensors | no publicado en la info |
| Otros fine-tunes de Qwen3.5-9B | 9.4B | no disponible | Apache-2.0 (típico) | safetensors | no disponible |

No se dispone de información sobre alternativas comparables con benchmarks verificados. La única comparación fiable es contra el propio modelo base, que constituye el punto de referencia natural para este checkpoint.

## Limitaciones y advertencias

- **Resultado negativo**: el autor declara que el run no encontró mejora en los pesos entrenados; no debe usarse como modelo de producción ni inferirse calidad de su publicación.
- **Checkpoint intermedio**: no es un modelo final; corresponde al paso 4 de un run y puede contener estados parciales o inestables.
- **Sesgos y alucinaciones**: no evaluados; al ser un fine-tune del base, hereda los riesgos típicos de los LLM (sesgos del corpus de entrenamiento, posible alucinación), pero no hay estudios específicos.
- **Licencia**: Apache-2.0 permite uso comercial y modificación, pero al no haber mejoras sobre el base, su utilidad comercial es nula o marginal.
- **Falta de documentación técnica**: no se especifican datos de entrenamiento, hiperparámetros, ni proceso de fine-tuning; esto limita la reproducibilidad más allá del propio checkpoint.
- **Riesgo de sobreajuste o degradación**: sin evaluación, no se puede descartar que el modelo haya degradado capacidades respecto al base.
- **Idiomas y contexto**: no especificados; no hay garantía de soporte multilingüe ni de longitudes de contexto concretas.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/agentic-ptb/opus-high-v3.h045.lrB.step_4)
- [Dataset asociado al run](https://huggingface.co/datasets/agentic-ptb/opus-high-v3-data)
- [Búsqueda de modelos con tag agentic-ptb](https://huggingface.co/models?other=agentic-ptb)
