# fpadovani/ppt-nld_newlexicon_uniform-100mb_seed10

## Resumen

El modelo `fpadovani/ppt-nld_newlexicon_uniform-100mb_seed10` es un ajuste fino (fine-tune) de 86,7 millones de parámetros basado en el modelo `goldfish-models/nld_latn_100mb`, un GPT-2 pequeño entrenado sobre un corpus de neerlandés de 100 MB. Ha sido desarrollado por fpadovani (Universidad de Groninga) y forma parte de una serie de experimentos etiquetados como "ppt-art-lang-newlexicon", que parecen investigar la adaptación de vocabulario o la creación de "nuevos léxicos" en modelos de lenguaje. El entrenamiento se realizó mediante Supervised Fine-Tuning (SFT) con la librería TRL de Hugging Face.

Este modelo es relevante para la comunidad investigadora por su tamaño reducido (86,7 M de parámetros) y su enfoque experimental: permite estudiar cómo un vocabulario modificado o "nuevo léxico" afecta al comportamiento de un modelo de lenguaje preentrenado. No está pensado para producción, sino como herramienta de análisis en lingüística computacional o investigación en adaptación de modelos. Su licencia no está especificada de forma clara, lo que limita su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-2 (según tags) |
| Parametros totales | 86.708.736 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (probablemente 1024, típico de GPT-2, pero no confirmado) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el nombre sugiere neerlandés, pero no está confirmado) |
| Licencia | no disponible (la model card indica "licence: license", sin especificar) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tune de `goldfish-models/nld_latn_100mb`, que a su vez es un modelo GPT-2 de 86,7 M de parámetros entrenado sobre un corpus de neerlandés de 100 MB. El ajuste se realizó con SFT (Supervised Fine-Tuning) utilizando la librería TRL (versión 0.23.0) y el framework Transformers 4.56.2. No se proporcionan detalles sobre el dataset de entrenamiento, el número de tokens ni la composición de los datos. El nombre "newlexicon_uniform" sugiere que se experimentó con un vocabulario nuevo distribuido uniformemente, pero no hay documentación adicional al respecto. No se mencionan innovaciones técnicas como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto: el modelo puede generar texto en el idioma en el que fue entrenado (probablemente neerlandés, aunque no está confirmado).
- Fine-tuning específico: al ser un modelo pequeño, es adecuado para experimentos de adaptación a dominios o vocabularios concretos.
- No se han documentado capacidades de tool calling, agentes, razonamiento multi-paso, visión o audio.
- No se indica soporte multilingüe; el nombre sugiere que está especializado en neerlandés.

## Casos de uso

- Investigación en adaptación de vocabulario: el modelo permite estudiar cómo un "nuevo léxico" (posiblemente inventado o modificado) afecta a la generación de texto en neerlandés, comparando con el modelo base.
- Experimentos de fine-tuning con SFT: sirve como banco de pruebas para evaluar metodologías de ajuste con TRL en modelos pequeños.
- Análisis de sesgos lingüísticos: al ser un modelo pequeño y entrenado en un corpus limitado, puede usarse para estudiar sesgos de género, registro o dialecto en neerlandés.
- Prototipado rápido: su bajo coste computacional permite iterar rápidamente en entornos de investigación sin necesidad de GPUs de gama alta.
- Educación y docencia: útil para demostrar conceptos de fine-tuning, generación de texto y evaluación de modelos en cursos de PLN.
- Comparación de semillas y variantes: junto con otros modelos de la misma serie (seed3407, baseline, zipf-heavy), permite analizar la influencia de la semilla aleatoria y la distribución del léxico en el rendimiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras métricas estándar. El modelo es demasiado pequeño y especializado para competir en tareas generales.

## Requisitos de hardware

- VRAM estimada: 0,2 GB (según el tamaño del repositorio), por lo que cabe en cualquier GPU consumer (incluso integradas) y en CPU.
- GPUs recomendadas: cualquier GPU con al menos 1 GB de VRAM, como GTX 1050, RTX 2060, o incluso inferencia en CPU con llama.cpp.
- Despliegue: compatible con Transformers (pipeline de text-generation), vLLM, TGI (Text Generation Inference) y llama.cpp (si se convierte a GGUF).
- Latencia y throughput: no se han publicado datos, pero al ser un modelo de 86,7 M de parámetros, la inferencia es muy rápida (del orden de milisegundos por token en GPU).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| fpadovani/ppt-nld_newlexicon_uniform-100mb_seed10 | 86,7 M | no disponible | no disponible | Hugging Face |
| fpadovani/ppt-nld_newlexicon_uniform-100mb_seed3407 | 86,7 M (estimado) | no disponible | no disponible | Hugging Face |
| fpadovani/ppt-art-lang-newlexicon-nld-baseline-100mb_seed10 | 86,5 M (según llm-explorer) | no disponible | no disponible | Hugging Face |
| fpadovani/ppt-art-lang-newlexicon-zipf-nld-heavy-baseline-100mb_seed10 | 86,7 M (según llm-explorer) | no disponible | no disponible | Hugging Face |

No se dispone de datos de rendimiento comparativo. Todos son variantes del mismo experimento con diferentes semillas o distribuciones de léxico.

## Limitaciones y advertencias

- Tamaño muy reducido: 86,7 M de parámetros, lo que limita su capacidad para tareas complejas o razonamiento avanzado.
- Sesgos desconocidos: al estar entrenado sobre un corpus de 100 MB, es probable que presente sesgos de género, registro o contenido del corpus original, pero no se han documentado.
- Riesgo de alucinación: como todo modelo generativo, puede producir texto incoherente o falso, especialmente con contextos largos.
- Licencia no clara: la model card indica "licence: license" sin especificar términos, lo que impide su uso comercial sin consultar al autor.
- Idioma no confirmado: aunque el nombre sugiere neerlandés, no hay documentación oficial que lo confirme.
- Sin soporte para tool calling ni agentes: no es adecuado para aplicaciones que requieran interacción con APIs o ejecución de código.

## Enlaces

- [Hugging Face - fpadovani/ppt-nld_newlexicon_uniform-100mb_seed10](https://huggingface.co/fpadovani/ppt-nld_newlexicon_uniform-100mb_seed10)
- [Modelo base - goldfish-models/nld_latn_100mb](https://huggingface.co/goldfish-models/nld_latn_100mb)
- [Variante seed3407](https://huggingface.co/fpadovani/ppt-nld_newlexicon_uniform-100mb_seed3407)
- [FriendliAI - despliegue del modelo baseline](https://friendli.ai/models/fpadovani/ppt-art-lang-newlexicon-nld-baseline-100mb_seed10)
- [LLM Explorer - ficha del modelo baseline](https://llm-explorer.com/model/fpadovani%2Fppt-art-lang-newlexicon-nld-baseline-100mb_seed10,2iW0wjJgIlh7cCWyHZwtXL)
- [LLM Explorer - ficha del modelo zipf-heavy](https://llm-explorer.com/model/fpadovani%2Fppt-art-lang-newlexicon-zipf-nld-heavy-baseline-100mb_seed10,4ndlQIeK6oD9eDWCABR1J8)
