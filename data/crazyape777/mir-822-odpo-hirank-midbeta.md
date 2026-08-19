# crazyape777/mir-822-odpo-hirank-midbeta

## Resumen

El modelo `crazyape777/mir-822-odpo-hirank-midbeta` es un checkpoint experimental desarrollado por el usuario crazyape777, orientado a tareas de minería de modelos dentro del ecosistema Affine SN120. Se trata de un modelo de lenguaje basado en una arquitectura MoE derivada de Qwen3.5 (etiqueta `qwen3_5_moe`), con 35.107.181.936 parámetros totales y un repositorio de 70.2 GB en formato safetensors. Su propósito declarado es competir en duelos de razonamiento de la plataforma evalsrv Reason v3, optimizando una métrica de preferencia anclada al profesor (`lpC(y_C|z_A) − lpC(y_C|∅)`).

El modelo se entrenó mediante *offline DPO* sobre pares de preferencias generados con un filtro de alta relevancia (HiRank) y una ventana de contexto suave (SoftCtx) de 12288 tokens, partiendo del modelo base `unconst/Affine-5czsc2fc98-r252-merged`. No es un modelo de chat general ni está pensado para uso conversacional; su utilidad se limita al contexto de evaluación y minería de modelos en la infraestructura Affine. La licencia no está especificada, aunque la model card indica que sigue la política de artefactos de minería del proyecto Affine.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (etiqueta `qwen3_5_moe`), transformer con mezcla de expertos |
| Parametros totales | 35.107.181.936 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (entrenado con max_len=12288) |
| Tipos de cuantizacion | no disponible (repositorio solo contiene safetensors) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (sigue la politica de artefactos de mineria Affine) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es un modelo de mezcla de expertos (MoE) basado en la familia Qwen3.5, según las etiquetas del repositorio. No se proporcionan detalles sobre el número de expertos ni los parámetros activos. El entrenamiento se realizó mediante *offline DPO* (Direct Preference Optimization) sobre pares de respuestas previamente rankeados por un modelo profesor. El conjunto de datos se generó con un filtro de alta relevancia (HiRank) y una longitud de contexto suave de 12288 tokens. Los hiperparámetros principales fueron LoRA con r=64 y α=128, un valor beta de 0.1 (MidBeta), una tasa de aprendizaje de 5e-6 y un objetivo de 3600 pasos, aunque el entrenamiento se detuvo en el paso 259 (TRAIN_DONE@259). El modelo se fusionó posteriormente con el adaptador LoRA. No se menciona el uso de RLHF, GRPO ni otras técnicas de alineación adicionales.

## Capacidades

- Generacion de texto orientada a razonamiento, especificamente optimizada para la metrica Reason v3 de la plataforma evalsrv.
- No es un modelo de chat general: la model card indica explicitamente que no es un modelo conversacional.
- No se documentan capacidades de tool calling, agentes, vision, audio ni multimodalidad.
- No se especifican capacidades multilingues; los idiomas soportados no estan disponibles.
- El modelo esta disenado para competir en duelos de razonamiento donde se compara la preferencia del profesor entre dos respuestas.

## Casos de uso

- Mineria de modelos en el ecosistema Affine SN120: el modelo se utiliza como candidato a rey (king) en duelos de razonamiento, evaluando su capacidad para superar al modelo reinante en la metrica Reason v3.
- Investigacion en preferencias de modelos: dado su entrenamiento con DPO offline sobre pares rankeados, puede servir para estudiar como la optimizacion de preferencias afecta al rendimiento en tareas de razonamiento.
- Evaluacion de tecnicas de alineacion: el checkpoint permite comparar el impacto de diferentes configuraciones (HiRank, SoftCtx, MidBeta) sobre la calidad del razonamiento.
- Desarrollo de pipelines de DPO: su metodologia de entrenamiento (LoRA, offline DPO, filtrado de pares) puede replicarse o adaptarse en otros proyectos de investigacion.
- Benchmarking interno de modelos MoE: al ser un modelo de 35B parametros con arquitectura MoE, puede utilizarse para medir el rendimiento de inferencia en infraestructuras especificas.
- No se recomienda su uso en aplicaciones de produccion, atencion al cliente, generacion de codigo u otras tareas generales, dado su caracter experimental y su falta de documentacion sobre capacidades.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La model card incluye metricas internas de la plataforma Affine, que no son comparables con benchmarks publicos:

| Metrica | Valor |
|---|---|
| Margen n80 vs rey reinante (reign34) | +0.006196 |
| Error estandar (SE) | 0.002357 |
| z-score | 2.63 |
| Tamano de muestra (n) | 75 |
| Barra de aprobacion (max(2·SE, δ=0.002)) | 0.004713 (~1.31×) |
| Mediana de pensamiento (thought median) | 199 (≥80) |
| Pase B | 0.368 (≥0.30) |

Estos valores corresponden a la evaluacion interna del autor y no son extrapolables a otros contextos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma fiable. Con 35.107 millones de parametros en fp16, el modelo requiere aproximadamente 70 GB de VRAM para cargar los pesos completos. Con cuantizacion a 8 bits se reduciria a unos 35 GB, y a 4 bits a unos 18 GB, pero no se ha confirmado la disponibilidad de estas cuantizaciones para este modelo.
- GPU recomendadas: no se especifican. Para una carga completa en fp16 serian necesarias GPU profesionales como A100 (80 GB) o H100 (80 GB). Con cuantizacion 4-bit podria caber en una RTX 4090 (24 GB) o similar, pero no esta verificado.
- Si cabe en consumer GPU: no confirmado. Depende del numero de parametros activos (desconocido) y de la cuantizacion aplicable.
- Opciones de despliegue: al ser un modelo de transformers, podria utilizarse con vLLM, TGI o llama.cpp si se convierte a GGUF, pero no hay instrucciones oficiales.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables en la misma categoria (mineria SN120 / duelos de razonamiento Affine). El modelo base `unconst/Affine-5czsc2fc98-r252-merged` y el rey reinante `cryptoDev23/Affine-5Dku3dYp9j-hk8161` son los unicos referentes mencionados, pero no hay datos publicos de sus especificaciones. Por tanto, la comparativa no esta disponible.

## Limitaciones y advertencias

- Modelo experimental: no es un modelo de proposito general; su unico fin es la mineria en el ecosistema Affine SN120.
- Licencia no definida: la model card indica que sigue la politica de artefactos de mineria Affine, pero no se especifica una licencia estandar (Apache, MIT, etc.). El uso comercial puede estar restringido o requerir permisos adicionales.
- Sesgos y alucinaciones: no hay informacion sobre evaluaciones de sesgo o fiabilidad. Dado su entrenamiento especializado, puede generar respuestas incoherentes fuera de su dominio.
- Longitud de contexto limitada: el entrenamiento uso max_len=12288, por lo que el contexto efectivo puede ser menor que el de otros modelos de la familia Qwen3.5.
- Idiomas: no se especifican, por lo que el rendimiento en lenguas distintas del ingles (o del corpus de entrenamiento) es desconocido.
- Sin soporte de herramientas ni multimodalidad: no se documentan capacidades de tool calling, vision ni audio.
- Riesgo de dependencia de infraestructura interna: las metricas de rendimiento estan ligadas a la plataforma evalsrv y no son reproducibles externamente.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/crazyape777/mir-822-odpo-hirank-midbeta
- Modelo base: https://huggingface.co/unconst/Affine-5czsc2fc98-r252-merged
- No se encontraron otros enlaces (papers, blogs, demos) en la busqueda web.
