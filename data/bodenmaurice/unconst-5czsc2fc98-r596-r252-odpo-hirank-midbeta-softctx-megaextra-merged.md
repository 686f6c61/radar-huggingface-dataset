# bodenmaurice/unconst-5czsc2fc98-r596-r252-odpo-hirank-midbeta-softctx-megaextra-merged

## Resumen

Este checkpoint, identificado como `unconst-5czsc2fc98-r596-r252-odpo-hirank-midbeta-softctx-megaextra-merged`, es un modelo especializado desarrollado por bodenmaurice dentro del ecosistema de minería SN120 Affine. Con 35.107 millones de parámetros y arquitectura qwen3_5_moe (MoE) con capacidades image-text-to-text, se entrenó mediante offline DPO sobre el checkpoint base `unconst/Affine-5czsc2fc98-r252-merged`, con el objetivo explícito de superar al "live king" reinante en la métrica de evaluación Reason v3.

No es un modelo de chat general: su uso previsto es exclusivamente como submission de minería SN120 Affine y para duelos de evaluación (evalsrv Reason duel). La relevancia de este checkpoint reside en su metodología: DPO offline sobre pares rankeados por Reason, con configuración SoftCtx (contexto suave de 12288 tokens) y filtro HiRank, usando LoRA r=64 y α=128. Los resultados locales muestran un margen de +0,006196 sobre el rey reinante (reign 34), con un z=2,63 y un margen ~1,31× el umbral de significancia establecido.

El entrenamiento se completó en 259 pasos (frente a los 3600 planificados), lo que sugiere una convergencia temprana en esta configuración DPO con β=0,1. El modelo se distribuye en formato safetensors con un tamaño de repositorio de 70,2 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen3_5_moe (MoE, image-text-to-text) |
| Parametros totales | 35.107.181.936 (~35,1 B) |
| Parametros activos | no disponible (arquitectura MoE) |
| Longitud de contexto | no disponible (max_len de entrenamiento: 12288) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | no disponible (sigue la politica de artefactos de mineria Affine) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura qwen3_5_moe, un transformer MoE con capacidades multimodales (image-text-to-text). El entrenamiento se realizó mediante offline DPO sobre pares rankeados por Reason, partiendo del checkpoint `unconst/Affine-5czsc2fc98-r252-merged` (revisión b42d6245d77fe30885ea8a90387771e1bc465e0f, reign 33). No se empleó SFT ni GRPO online: la optimización se centró en la preferencia por respuestas con mayor puntuación de Reason del lado del profesor, según la métrica `lpC(y_C|z_A) − lpC(y_C|∅)`.

Los hiperparámetros clave incluyen LoRA con r=64 y α=128, β=0.1 (MidBeta), lr=5e-6 y max_len=12288 (SoftCtx). El dataset utilizado es el conjunto SoftCtx × HiRank, que combina un rango de contexto suave con un filtro de alto rango. El entrenamiento estaba planificado para 3600 pasos (MegaExtra), pero se completó en 259 pasos, tras lo cual el adaptador se conservó y fusionó. El entrenamiento se ejecutó en GPUs Lium (GPUs 6 y 7) y el merge en GPUs T4 (GPUs 4 y 5) del entorno de minería del autor.

## Capacidades

- Especializado en la tarea Reason v3: optimiza la preferencia de razonamiento del lado del profesor, con una mediana de pensamiento de 199 y un pase B de 0.368.
- Diseñado para competiciones de minería SN120 Affine: submissions y duelos de evaluación (evalsrv Reason duel).
- Capacidades multimodales (image-text-to-text) según las etiquetas del modelo.
- Generación de texto conversacional (pipeline text-generation).
- No es un modelo de chat general: su uso previsto es exclusivamente como submission de minería.
- Compatible con el ecosistema transformers y endpoints de HuggingFace.

## Casos de uso

- Submission de minería SN120 Affine: el modelo está diseñado para presentarse como candidato en el contexto de minería SN120, donde compite contra el "live king" reinante en la métrica Reason v3.
- Duelo de evaluación Reason (evalsrv): puede enfrentarse a otros checkpoints en duelos de evaluación para determinar qué modelo ofrece mejor rendimiento en razonamiento anclado al profesor.
- Evaluación de preferencias de razonamiento: gracias al entrenamiento con DPO offline sobre pares rankeados, el modelo puede discriminar entre respuestas de mayor y menor calidad de razonamiento, útil como referencia en pipelines de evaluación.
- Investigación en metodologías DPO offline: el checkpoint sirve como referencia para estudiar el impacto de hiperparámetros como β=0.1, SoftCtx (contexto suave de 12288 tokens) y el filtro HiRank en el rendimiento de razonamiento.
- Benchmark de modelos MoE multimodales: con sus 35,1 B parámetros y arquitectura qwen3_5_moe, puede utilizarse como punto de referencia en evaluaciones comparativas de modelos MoE con capacidades de visión.
- Análisis de convergencia temprana en DPO: el hecho de que el entrenamiento se completara en 259 pasos (frente a los 3600 planificados) ofrece datos empíricos sobre la convergencia en configuraciones DPO con β baja y LoRA de alto rango.

## Benchmarks y rendimiento

Los resultados publicados en la model card se refieren a la métrica local n80 (evaluación con 80 muestras):

| Comparacion | Margen | Error estandar | z | n |
|---|---|---|---|---|
| vs live king reign34 | +0,006196 | 0,002357 | 2,63 | 75 |
| vs r252 (modelo base) | +0,008490 | — | — | — |

El umbral de significancia (bar) se fijó en `max(2·SE, δ=0.002)` = 0,004713, y el margen obtenido fue ~1,31× dicho umbral. La mediana de pensamiento fue 199 (mínimo requerido: 80) y el pase B fue 0,368 (mínimo requerido: 0,30). No se han publicado resultados de benchmarks estándar como MMLU, HumanEval o GSM8K en la información disponible.

## Requisitos de hardware

- El repositorio ocupa 70,2 GB en formato safetensors, lo que implica requisitos de almacenamiento considerables.
- Con ~35,1 B parámetros y arquitectura MoE, la inferencia en fp16/bf16 requiere aproximadamente 70 GB de VRAM; en cuantización de 8 bits, unos 35 GB; en 4 bits, unos 18-20 GB (estimaciones estándar, no confirmadas por el autor).
- El entrenamiento se realizó en GPUs Lium (GPUs 6 y 7) y el merge en GPUs T4 (GPUs 4 y 5), lo que sugiere el uso de GPUs de datacenter.
- No se dispone de información sobre latencia o throughput estimados.
- No se mencionan opciones de despliegue específicas (vLLM, llama.cpp, Ollama, TGI, etc.) en la información disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Este modelo (r596) | 35,1 B (MoE) | no disponible | no disponible | DPO offline, especializado en Reason v3 |
| unconst/Affine-5czsc2fc98-r252-merged (base) | no disponible | no disponible | no disponible | Modelo base, reign 33 |
| cryptoDev23/Affine-5Dku3dYp9j-hk8161 (live king reign34) | no disponible | no disponible | no disponible | Rey reinante en el momento del entrenamiento |

No se dispone de información suficiente sobre otros modelos comparables fuera del ecosistema Affine SN120.

## Limitaciones y advertencias

- No es un modelo de chat general: su uso previsto es exclusivamente como submission de minería SN120 Affine, no para aplicaciones conversacionales o de producción.
- Licencia no disponible: la model card indica que sigue la política de artefactos de minería Affine, pero no se especifica una licencia concreta, lo que limita su uso comercial.
- Idiomas soportados no documentados: no se especifica qué idiomas maneja el modelo.
- Contexto limitado: el entrenamiento usó max_len=12288, lo que sugiere una ventana de contexto relativamente corta en comparación con modelos modernos de 128K+ tokens.
- Riesgo de sobreajuste al benchmark: al estar optimizado específicamente para la métrica Reason v3, su rendimiento en otras tareas de razonamiento o generación podría ser inferior.
- Sesgos y alucinaciones no documentados: no se ha publicado información sobre sesgos conocidos o tasas de alucinación.
- Datos de entrenamiento no públicos: no se detalla la composición del dataset más allá de la descripción SoftCtx × HiRank.
- Reproducibilidad limitada: los detalles del entorno de entrenamiento (GPUs específicas, infraestructura de minería) no están completamente documentados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/bodenmaurice/unconst-5czsc2fc98-r596-r252-odpo-hirank-midbeta-softctx-megaextra-merged
- Modelo base: https://huggingface.co/unconst/Affine-5czsc2fc98-r252-merged
- Modelo relacionado: https://huggingface.co/unconst/Affine-5czsc2fc98-h32-merged

No se han encontrado papers, blogs o repositorios adicionales en la búsqueda web.
