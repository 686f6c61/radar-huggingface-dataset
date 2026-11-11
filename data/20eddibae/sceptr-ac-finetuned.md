# 20eddibae/sceptr-ac-finetuned

## Resumen

SCEPTR-AC finetuned es un ajuste fino del modelo de lenguaje de proteinas SCEPTR, desarrollado por el usuario 20eddibae y publicado en Hugging Face bajo licencia MIT con acceso restringido (gated). SCEPTR es un modelo de representacion de proteinas disenado especificamente para el dominio inmunologico, concretamente para secuencias de receptores de celulas T (TCR). El modelo base emplea aprendizaje contrastivo para generar embeddings densos de secuencias de TCR, y este ajuste fino adapta esas representaciones a una tarea concreta (presumiblemente clasificacion o extraccion de caracteristicas relacionadas con el repertorio de celulas T, aunque la informacion disponible no especifica la tarea exacta).

El modelo se publica como pipeline de `feature-extraction`: no es un modelo generativo, sino un encoder que transforma secuencias de aminoacidos de TCR en vectores de representacion utilizables por clasificadores, sistemas de recuperacion o pipelines de analisis inmunologico. Su relevancia radica en el creciente interes por modelos de lenguaje especializados en biologia (protein language models) aplicados a inmunologia computacional, un campo donde los modelos genericos de proteinas (ESM, ProtBERT) no capturan bien las particularidades estadisticas de las secuencias de TCR.

La informacion publica del repositorio es extremadamente limitada: cero descargas, cero likes, tamano de repo de 0.0 GB en el momento de la consulta y sin model card detallada, sin resultados de benchmarks ni especificaciones de entrenamiento. Esta ficha refleja fielmente esa escasez de datos y marca explicitamente como "no disponible" todo aquello que no consta en la informacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base SCEPTR: encoder tipo transformer para proteinas, segun tags del repo) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no consta que sea MoE) |
| Longitud de contexto | no disponible (las secuencias de TCR suelen ser cortas, tipicamente <200 aminoacidos, pero no consta el limite del modelo) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo sobre secuencias de proteinas, no lenguaje natural) |
| Licencia | MIT |
| Formato de pesos | no disponible (libreria `sceptr`; pesos probablemente en safetensors o PyTorch binario, sin confirmar) |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura en la model card publica. Por los tags del repositorio (`sceptr`, `protein-language-model`, `contrastive-learning`, `feature-extraction`) se deduce que el modelo base SCEPTR es un encoder de proteinas entrenado con objetivos contrastivos para aprender representaciones de secuencias de TCR donde secuencias funcionalmente relacionadas quedan proximas en el espacio latente. El ajuste fino (`-finetuned`) adapta esos embeddings a una tarea supervisada especifica que no se detalla en la informacion disponible.

Tampoco consta el volumen de datos de entrenamiento, la composicion del dataset (repertorios de TCR publicos como VDJdb, McPAS-TCR u otros), ni si se emplearon tecnicas de alineamiento o regularizacion adicionales. La fecha de creacion (2026-06-25) y la actualizacion (2026-11-11) indican un modelo reciente, pero sin mas contexto sobre el proceso de entrenamiento.

## Capacidades

- Extraccion de caracteristicas (embeddings) de secuencias de proteinas, especificamente receptores de celulas T.
- Generacion de representaciones vectoriales densas aptas para tareas downstream: clasificacion de especificidad antigenica, agrupamiento de clonotipos, busqueda por similitud.
- Aprendizaje contrastivo: las representaciones estan optimizadas para que secuencias similares funcionalmente queden proximas en el espacio latente.
- No es un modelo generativo: no produce texto ni secuencias.
- No consta soporte de tool calling, agentes, razonamiento multi-paso ni modos de pensamiento.
- Capacidades multilingues: no aplica (dominio de secuencias biologicas).
- No consta soporte de vision ni audio.

## Casos de uso

- Clasificacion de especificidad antigenica de TCR: usar los embeddings del modelo como entrada a un clasificador ligero para predecir a que peptido-MHC se une un TCR dado, aprovechando que el ajuste fino adapta las representaciones a la tarea.
- Agrupamiento de clonotipos: calcular distancias coseno entre embeddings de secuencias de TCR para identificar clones expandidos en datos de secuenciacion de repertorio (RepSeq), util en estudios de respuesta inmune.
- Recuperacion por similitud en bases de datos de TCR: indexar embeddings de VDJdb o McPAS-TCR y realizar busquedas de vecinos mas cercanos para anotar secuencias nuevas por transferencia de etiqueta.
- Analisis de repertorio en cohortes clinicas: procesar lotes de secuencias de pacientes y proyectar los embeddings en 2D (UMAP/t-SNE) para comparar diversidad y expansion clonal entre condiciones (sano vs. enfermedad autoinmune, respuesta a inmunoterapia).
- Preprocesamiento para modelos de prediccion de inmunogenicidad: emplear los embeddings como features de entrada a modelos de ranking de candidatos terapeuticos (p. ej. TCR-T o anticuerpos TCR-like).
- Investigacion en biologia computacional: benchmark de representaciones de proteinas en tareas de inmunologia, comparando SCEPTR-AC frente a ESM-2 o ProtBERT en tareas de clasificacion de TCR.
- Filtrado de calidad en pipelines de secuenciacion: detectar secuencias de TCR atipicas o mal formadas mediante la distancia de sus embeddings a la distribucion de referencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye model card con metricas, y no constan evaluaciones en tareas estandar de inmunologia computacional (clasificacion de especificidad, prediccion de union peptido-MHC, etc.).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (depende del tamano del modelo base SCEPTR, que no consta; los protein language models tipo encoder suelen oscilar entre 100M y 1B parametros, pero no se confirma).
- GPU recomendadas: no disponible por falta de especificaciones; para un encoder de proteinas de tamano moderado, una RTX 3090/4090 o incluso CPU seria suficiente para inferencia por lotes pequenos.
- Compatibilidad con GPU consumer: probablemente si, dado que los encoders de proteinas suelen ser manejables, pero no confirmado.
- Opciones de despliegue: la libreria `sceptr` es el unico runtime documentado; no consta soporte de vLLM, llama.cpp, Ollama ni TGI (son herramientas orientadas a LLMs generativos, no a encoders de proteinas).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SCEPTR-AC finetuned (este) | Encoder de proteinas (TCR) | no disponible | no disponible | MIT | Hugging Face (gated) |
| ESM-2 | Protein language model | 8M–15B (varias tallas) | ~1024 aa (version 650M) | MIT | Hugging Face (publico) |
| ProtBERT | Protein language model | ~420M | 512 aa | MIT | Hugging Face (publico) |
| TCR-BERT / modelos especificos de TCR | Encoder de TCR | no disponible | no disponible | variable | variable |

No se dispone de datos de rendimiento comparativo del modelo frente a estas alternativas. La comparacion se limita a categoria, licencia y disponibilidad.

## Limitaciones y advertencias

- Modelo gated: requiere aceptar condiciones en Hugging Face antes de descargar los pesos, lo que anade friccion a la integracion en pipelines automatizados.
- Ausencia total de model card detallada: no hay informacion sobre datos de entrenamiento, composicion del dataset, sesgos potenciales ni evaluacion de rendimiento, lo que impide una validacion rigurosa antes de usarlo en produccion.
- Cero descargas y cero likes en el momento de la consulta: sin evidencia de uso comunitario ni validacion externa.
- Riesgo de sobreajuste al dataset de ajuste fino: al tratarse de un finetune sin documentacion, las representaciones pueden estar sesgadas hacia la distribucion de entrenamiento y degradarse en repertorios de otras poblaciones o especies.
- Aplicabilidad limitada a secuencias de TCR: no es un modelo generico de proteinas ni de lenguaje natural.
- Licencia MIT permite uso comercial, pero la ausencia de documentacion sobre el origen de los datos de entrenamiento impide descartar restricciones subyacentes de los datasets originales (VDJdb, etc.).
- No apto para uso clinico directo sin validacion prospectiva: cualquier aplicacion medica requiere evaluacion independiente.

## Enlaces

- Hugging Face: https://huggingface.co/20eddibae/sceptr-ac-finetuned
- Repositorio del modelo base SCEPTR: no disponible en la informacion proporcionada
- Paper de SCEPTR: no disponible en la informacion proporcionada
- Demo o Space asociado: no disponible
