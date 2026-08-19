# ManhHoDinh/lfm25-titlegen-sft

## Resumen

El modelo `ManhHoDinh/lfm25-titlegen-sft` es un ajuste fino supervisado (SFT) del modelo base `LiquidAI/LFM2.5-230M`, desarrollado por ManhHoDinh. Su propósito es generar títulos automáticos en inglés y vietnamita, como parte de un experimento que también incluye variantes entrenadas con DPO y curriculum learning. Con 229,7 millones de parámetros, es un modelo ligero orientado a tareas específicas de generación de títulos, no a conversación general.

La relevancia de este modelo radica en su tamaño reducido, que permite su despliegue en entornos con recursos limitados, y en su enfoque multilingüe (inglés y vietnamita). La publicación incluye un benchmark preliminar automatizado que reporta un 97,0% de aciertos en una muestra de 300 ejemplos, aunque los autores advierten que estos resultados no establecen preparación para producción ni significancia estadística.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (fine-tuning del modelo base LiquidAI/LFM2.5-230M) |
| Parametros totales | 229.693.184 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (solo safetensors en el repositorio) |
| Idiomas soportados | Ingles, vietnamita |
| Licencia | lfm1.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un ajuste fino supervisado (SFT) del modelo base `LiquidAI/LFM2.5-230M`, un modelo de lenguaje pequeño (230M parámetros). No se proporcionan detalles sobre la arquitectura interna del base (si es transformer, MoE, etc.) ni sobre los datos de entrenamiento utilizados para el SFT (número de tokens, composición del dataset, técnicas de alineación). El experimento incluye también variantes DPO y curriculum, pero este repositorio corresponde específicamente a la etapa SFT v2. No hay información pública sobre innovaciones técnicas específicas más allá del propio proceso de fine-tuning.

## Capacidades

- Generación de títulos en inglés y vietnamita.
- Generación de texto en formato de una sola línea (según los criterios de evaluación automatizada, que incluyen restricciones como `mot_dong` que significa "una línea").
- Capacidad multilingüe limitada a los dos idiomas evaluados (en, vi).
- No se menciona soporte para tool calling, agentes, razonamiento multi-paso, visión o audio.

## Casos de uso

- Generación de titulares para artículos de noticias en inglés y vietnamita: el modelo puede producir un título conciso a partir de un texto o resumen, útil para redacciones digitales con alto volumen de contenido.
- Titulado automático de documentos técnicos o académicos: dado un abstract o resumen, genera un título descriptivo en el idioma correspondiente.
- Etiquetado de contenido en plataformas de blogs o CMS: integración en flujos de publicación para sugerir títulos alternativos.
- Asistencia en marketing de contenidos: creación de variantes de titulares para pruebas A/B en campañas multilingües.
- Preprocesamiento de datos para sistemas de recuperación de información: asignación de títulos a documentos sin metadatos, mejorando la indexación.
- Entornos educativos o de investigación: experimentación con fine-tuning de modelos pequeños en tareas de generación de texto multilingüe.

## Benchmarks y rendimiento

La model card incluye un benchmark preliminar automatizado sobre 300 ejemplos (198 en inglés, 102 en vietnamita), con decodificación determinista (`do_sample: false`, `max_new_tokens: 32`). Los resultados para el modelo SFT v2 son:

| Modelo | Aciertos | Global | Inglés | Vietnamita |
| --- | ---: | ---: | ---: | --- |
| DPO | 293 / 300 | 97,7% | 99,5% | 94,1% |
| SFT v2 | 291 / 300 | 97,0% | 99,5% | 92,2% |
| Curriculum | 289 / 300 | 96,3% | 98,5% | 92,2% |

Nota: los resultados son preliminares, generados por una heurística automatizada, sin revisión nativa ni evidencia de preferencia ciega. Los autores advierten que no establecen preparación para producción, causalidad ni significancia estadística.

## Requisitos de hardware

- Con 229,7 millones de parámetros, el modelo es muy ligero y puede ejecutarse en CPU sin GPU.
- En GPU, cabe en tarjetas con 1-2 GB de VRAM en FP16 (estimación razonable para un modelo de este tamaño, aunque no hay datos oficiales).
- Compatible con la librería `transformers` de HuggingFace; se puede desplegar con herramientas como vLLM, llama.cpp u Ollama, aunque no hay configuraciones específicas documentadas.
- No se proporcionan datos de latencia o throughput.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. El modelo base LFM2.5-230M es una referencia, pero no hay benchmarks públicos frente a otros modelos de generación de títulos de tamaño similar.

## Limitaciones y advertencias

- Solo se han evaluado ejemplos en inglés y vietnamita; el resto de idiomas (alemán, español, francés, etc.) aparecen como `NOT_EVALUATED` en la model card, por lo que no se garantiza su funcionamiento.
- Los resultados del benchmark son preliminares y automatizados, sin revisión humana ni evidencia de preferencia. No deben interpretarse como indicadores de calidad en producción.
- La licencia `lfm1.0` (del modelo base) puede imponer restricciones de uso comercial; es necesario revisar los términos completos en el enlace proporcionado.
- No hay información sobre sesgos, alucinaciones o comportamientos adversos específicos.
- Al ser un modelo pequeño, su capacidad de razonamiento y generación de texto es limitada en comparación con modelos de mayor escala.

## Enlaces

- Repositorio del modelo: https://huggingface.co/ManhHoDinh/lfm25-titlegen-sft
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-230M
- Licencia del modelo base: https://huggingface.co/LiquidAI/LFM2.5-230M/blob/main/LICENSE
