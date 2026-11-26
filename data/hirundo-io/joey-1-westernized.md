# hirundo-io/joey-1-westernized

## Resumen

Joey-1-westernized es un modelo de decisión (decision-model) publicado por hirundo-io, derivado mediante un proceso de merge del modelo base baselabs/joey-1. Su propósito declarado es la mitigación de sesgos ("bias-mitigation") y la "occidentalización" (westernized) de las respuestas del modelo original, es decir, alinear su comportamiento con marcos culturales y normativos occidentales. Se distribuye como un modelo de clasificación de texto (pipeline text-classification) con pesos en formato safetensors y un total de 2.721.801.024 parámetros.

El modelo se apoya en la arquitectura qwen3_5, según las etiquetas del repositorio, y está construido como un merge sobre baselabs/joey-1. El repositorio ocupa 5,5 GB y tiene acceso restringido (gated): es necesario aceptar las condiciones en Hugging Face antes de descargarlo. La licencia se declara como "mit-and-apache-2.0", lo que sugiere una combinación de componentes MIT y Apache 2.0, aunque el campo de licencia del hub figura como "other".

Su relevancia es limitada y muy específica: se trata de un derivado experimental con cero descargas y cero likes en el momento de la consulta, orientado a equipos que necesiten un clasificador o modelo de decisión con sesgo cultural ajustado hacia contextos occidentales. No hay información publicada sobre idiomas soportados, datos de entrenamiento ni resultados de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen3_5 (según tags del repositorio) |
| Parametros totales | 2.721.801.024 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | mit-and-apache-2.0 (campo del hub: other) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La información disponible indica que el modelo se basa en la familia arquitectónica qwen3_5, un transformer decoder-only según la convención de la serie Qwen, aunque no se detalla la configuración interna (número de capas, dimensiones ocultas, cabezas de atención ni mecanismos de atención). El modelo se ha generado mediante un merge sobre baselabs/joey-1, etiquetado en el hub como `base_model:merge:baselabs/joey-1`, lo que implica una combinación de pesos más que un entrenamiento desde cero.

No se han publicado datos sobre el corpus de entrenamiento, el número de tokens procesados, la composición del dataset ni si hubo fases de RLHF, DPO o fine-tuning supervisado. El propósito declarado de "westernized" y "bias-mitigation" sugiere un ajuste orientado a modificar la distribución de respuestas del modelo base hacia marcos culturales occidentales, pero no se documenta la metodología concreta (si fue un merge ponderado, un fine-tuning o una combinación).

## Capacidades

- Clasificación de texto: el pipeline declarado en el hub es text-classification, por lo que su uso previsto principal es la asignación de etiquetas a entradas textuales.
- Modelo de decisión: la etiqueta "decision-model" indica un uso orientado a tomar decisiones o emitir juicios clasificatorios sobre contenido.
- Mitigación de sesgos: el ajuste "westernized" busca alinear las salidas con marcos culturales occidentales, presumiblemente reduciendo respuestas consideradas sesgadas en esa dirección.
- Generación de texto: no confirmada explícitamente; al derivar de un modelo base tipo Qwen, es plausible, pero no está documentado en la información disponible.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible (el hub no declara idiomas).
- Capacidades especiales (thinking mode, visión, audio): no disponible.

## Casos de uso

- Moderación de contenido con sesgo cultural ajustado: el modelo puede emplearse para clasificar textos y decidir si su tono o contenido se alinea con marcos normativos occidentales, aprovechando su ajuste "westernized" para reducir discrepancias culturales en la moderación.
- Clasificación de reseñas y feedback de clientes: al ser un modelo de clasificación de texto, puede etiquetar opiniones por categoría o sentimiento en pipelines de atención al cliente, siempre que se valide su comportamiento en el dominio concreto.
- Filtrado de contenido en plataformas: útil para decidir si un texto cumple políticas editoriales definidas desde una perspectiva occidental, integrándose en un pipeline de premoderación.
- Investigación sobre sesgos en LLM: el modelo sirve como caso de estudio de mitigación de sesgos mediante merge, permitiendo comparar su comportamiento con el del modelo base baselabs/joey-1.
- Clasificación documental en entornos corporativos: asignación de etiquetas a documentos internos según criterios predefinidos, con la ventaja de un tamaño de 2.700 millones de parámetros que permite despliegue en infraestructura moderada.
- Evaluación comparativa de derivados: útil en experimentos que midan el efecto de la "occidentalización" sobre las decisiones del modelo base, como referencia en estudios de alineación cultural.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 2.721.801.024 parámetros, en FP16 se requieren aproximadamente 5,4 GB solo para pesos; en cuantización de 8 bits, unos 2,7 GB; en 4 bits, alrededor de 1,4 GB. A esto hay que sumar la memoria para el contexto y el runtime.
- GPU recomendadas: para FP16, una GPU con 8-12 GB de VRAM es suficiente (RTX 3060 12 GB, RTX 4070, A10). Para mayor throughput, A100 o H100 permiten servir varias instancias.
- Cabe en GPU de consumo: sí, en tarjetas con 8 GB o más en cuantización de 8 bits, y en 4-6 GB en cuantización de 4 bits.
- Opciones de despliegue: vLLM, TGI, llama.cpp y Ollama son compatibles en principio con pesos safetensors de un transformer estándar, aunque la disponibilidad de conversiones a GGUF no está confirmada.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| hirundo-io/joey-1-westernized | 2.721.801.024 | no disponible | mit-and-apache-2.0 | Gated en Hugging Face |
| baselabs/joey-1 (modelo base) | no disponible | no disponible | no disponible | no disponible |
| Qwen3.5 (familia base) | variable según variante | no disponible | según variante | pública |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Acceso restringido: el repositorio es gated y requiere aceptar condiciones en Hugging Face, lo que puede limitar su uso automatizado o en producción.
- Licencia ambigua: el campo del hub indica "other" mientras que los metadatos señalan "mit-and-apache-2.0"; es necesario verificar los términos exactos antes de un uso comercial.
- Sin datos de entrenamiento ni evaluación: no hay información sobre el corpus, el proceso de merge ni métricas, lo que impide estimar su calidad real.
- Riesgo de alucinación y sesgo residual: aunque el ajuste busca mitigar sesgos, no se documenta su eficacia; el modelo puede seguir produciendo clasificaciones incorrectas o culturalmente sesgadas.
- Idiomas no declarados: se desconoce si soporta castellano u otros idiomas distintos del inglés, lo que limita su uso en entornos multilingües.
- Madurez: cero descargas y cero likes en el momento de la consulta; no hay evidencia de uso en producción ni validación por la comunidad.
- Contexto desconocido: sin longitud de contexto publicada, no se puede garantizar el manejo de entradas largas.

## Enlaces

- Hugging Face: https://huggingface.co/hirundo-io/joey-1-westernized
- Modelo base: https://huggingface.co/baselabs/joey-1
