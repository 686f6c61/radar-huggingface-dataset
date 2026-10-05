# jdkent/nuextract3-neuro-tables

## Resumen

`jdkent/nuextract3-neuro-tables` es un ajuste fino (fine-tune) del modelo `numind/NuExtract3` orientado a una tarea muy concreta: extraer información estructurada de tablas de resultados de neuroimagen. El modelo lee tablas de estudios de neuroimagen publicados y decide qué coordenadas pertenecen a qué análisis estadístico, informa del espacio de coordenadas (MNI o Talairach) y etiqueta cada estadístico.

No es un modelo de propósito general: es un extractor especializado que trabaja con documentos serializados en un formato propio (título, resumen, pie de tabla y tabla con celdas separadas por ` | `), y devuelve JSON estructurado. Cuenta con 4.539.265.536 parámetros (aproximadamente 4,54 mil millones) en precisión bf16, con un tamaño de repositorio de 9,1 GB, y se distribuye bajo licencia Apache 2.0. Según el autor, la arquitectura heredada del modelo base incorpora capas Mamba, ya que el proceso de ajuste LoRA también actualizó 177 tensores que un adaptador LoRA convencional no toca (`A_log`, `dt_bias`, convoluciones y normalizaciones de las capas Mamba).

El modelo es relevante por su enfoque en la reproducibilidad de meta-análisis en neuroimagen: convierte tablas heterogéneas de literatura científica en datos estructurados y trazables, y publica el commit exacto del dataset de entrenamiento en cada versión. Las versiones se gestionan como etiquetas (tags) dentro del mismo repositorio, no como repositorios separados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Derivada de `numind/NuExtract3` (tag `qwen3_5`); incluye capas Mamba segun la model card |
| Parametros totales | 4.539.265.536 (4,54 mil millones) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (el ejemplo de despliegue usa `--max-model-len 16384`) |
| Tipos de cuantizacion | no disponible oficialmente; el repositorio distribuye pesos fusionados en bf16 |
| Idiomas soportados | no disponibles |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (transformers); no se distribuye GGUF |

## Arquitectura y entrenamiento

El modelo es un fine-tune del modelo base `numind/NuExtract3`, del que hereda la arquitectura. La model card indica explícitamente que el ajuste se realizó con LoRA, pero que se fusionaron los pesos completos ("merged weights") porque el entrenamiento también modificó 177 tensores sobre los que LoRA no tiene control: `A_log`, `dt_bias`, las convoluciones y las normalizaciones de las capas Mamba. Por ese motivo, cargar únicamente el adaptador produciría resultados incorrectos.

El entrenamiento se hizo sobre el dataset `jdkent/neuro-tables`, y cada release incluye un `provenance.json` que referencia un commit concreto (SHA, no tag) del dataset. La tarea concreta es la extracción de coordenadas y estadísticos: cada punto se representa posicionalmente como `[x, y, z, kind, value, extent]`, con la cola opcional, y el espacio de coordenadas se declara una sola vez por tabla. El esquema de salida se inyecta como variable del chat template (no como mensaje de sistema), entre `【template_start】` y `【template_end】`. Un detalle técnico relevante: si el cuarto campo del punto (`kind`) se declara como `"number"` en lugar de como enum, el modelo fusiona tipo y valor en cadenas como `"T=5.53"` y entra en bucle en el 8,4% de las tablas; con el enum declarado correctamente, no se observaron bucles en 871 tablas. No se dispone de datos sobre el número total de tokens de entrenamiento ni sobre la composición completa del dataset más allá del propio `jdkent/neuro-tables`.

## Capacidades

- Extraccion de coordenadas de tablas de neuroimagen y agrupacion por analisis estadistico.
- Identificacion del espacio de coordenadas (MNI o Talairach).
- Etiquetado del tipo de estadistico: T, Z, D (Cohen's d), G (Hedges' g), F, R, B y P.
- Manejo de medidas en voxels y mm^3.
- Interpretacion de tablas serializadas con colspans (`<N:`) y rowspans (`^N:`).
- Salida en JSON estructurado conforme al esquema declarado en el chat template.
- Soporte de modo conversacional (tag `conversational`).
- Modo de pensamiento controlable mediante `enable_thinking` (desactivado en los ejemplos de la model card).
- Procesamiento de entradas con estructura de documento cientifico: `Title:`, `Abstract:`, `Caption:`, `Footer:` y tabla.
- No se documentan capacidades de tool calling, agentes, vision ni audio, pese al pipeline declarado `image-text-to-text`.

## Casos de uso

- Meta-analisis de neuroimagen: extraer automaticamente las coordenadas y estadisticos de cientos de articulos para construir bases de datos de coordenadas reproducibles, evitando la extraccion manual.
- Construccion de bases de datos de coordenadas (coordinate-based meta-analysis, CBMA): poblar repositorios como NeuroVault o Neurosynth con coordenadas etiquetadas por tipo de estadistico.
- Verificacion de tablas en revision por pares: comprobar que las etiquetas de estadistico (T frente a Z) son coherentes antes de convertir valores entre distribuciones.
- Reproducibilidad de pipelines: al publicar `provenance.json` con el commit del dataset, un grupo de investigacion puede rastrear exactamente con que datos se entreno cada version.
- Normalizacion de literatura historica: procesar tablas antiguas en formato Talairach y convertirlas a estructuras comparables con estudios modernos en MNI.
- Auditoria de extraccion: revisar los casos marcados como ambiguos (por ejemplo, filas con colspan) para validacion manual selectiva en lugar de revision completa.
- Integracion en ETL cientifico: usar el modelo como paso de extraccion dentro de un pipeline que serializa PDFs a texto, aplica el modelo y valida el JSON resultante.

## Benchmarks y rendimiento

Los unicos datos publicados en la informacion disponible corresponden a la comparativa entre las versiones v19 y v21 sobre `neurometabench` (411 articulos, aproximadamente 9.100 coordenadas extraidas manualmente), cada modelo bajo su propia plantilla y serializacion, con 2 mm de tolerancia.

| Version | Etiqueta de estadistico | Recall de coordenadas | Agrupacion | No parseable |
|---|---|---|---|---|
| v19 | 55,3% | 71,1% | 93,0% | 0,2% |
| v21 | 98,7% | 69,7% | 91,9% | 0,3% |

Segun el autor, v21 mejora de forma decisiva el etiquetado pero pierde 1,4 puntos de recall de coordenadas. Sus cinco fallos de etiqueta corresponden a cuatro casos en los que una columna de coordenadas titulada "Peak Z" engana al verificador, y a una tabla que reporta tanto Z como T, donde T gana por la regla de prioridad.

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- Pesos fusionados en bf16: 8,5 GB, por lo que no caben en una GPU de 8 GB.
- Despliegue de referencia con vLLM: `--tensor-parallel-size 2 --data-parallel-size 2`, `--max-model-len 16384`, `--max-num-seqs 48`, `--max-num-batched-tokens 8192`, `--gpu-memory-utilization 0.92`, `--language-model-only --no-enable-prefix-caching`.
- El autor advierte que los flags de batch son determinantes en tarjetas pequenas: vLLM reserva memoria para CUDA graphs en funcion del batch prometido y toma la cache KV del resto, de modo que los valores por defecto impiden arrancar el motor.
- VRAM estimada segun cuantizacion: no disponible en la documentacion oficial. Como referencia de orden de magnitud, los pesos en bf16 ocupan 8,5 GB y habria que anadir la cache KV para una ventana de hasta 16.384 tokens.
- GPU recomendadas: no disponibles de forma explicita; el ejemplo de servicio asume al menos 2 GPU.
- Opciones de despliegue documentadas: transformers (carga directa) y vLLM. No se documenta soporte de llama.cpp, Ollama ni TGI, ni se distribuyen pesos GGUF.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Rendimiento |
|---|---|---|---|---|---|
| jdkent/nuextract3-neuro-tables (v21) | 4,54 B | no disponible (16.384 en el ejemplo de servicio) | apache-2.0 | HuggingFace, safetensors | 98,7% etiqueta, 69,7% recall de coordenadas en neurometabench |
| numind/NuExtract3 (base) | no disponible | no disponible | no disponible | HuggingFace | no disponible |
| Otros extractores de tablas de neuroimagen | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos comparativos publicados frente a alternativas de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- El prompt no es opcional: el esquema debe inyectarse como variable del chat template. Usarlo como mensaje de sistema produce resultados incorrectos, porque el fine-tune solo ha visto el esquema entre `【template_start】` y `【template_end】`.
- Si el cuarto campo del punto se declara como `"number"` en lugar del enum, el modelo fusiona tipo y valor (`"T=5.53"`) y entra en bucle en el 8,4% de las tablas.
- Ambiguedad en filas con colspan: cuando la celda "N voxels" ha sido absorbida por un colspan, el modelo resuelve por signo. Lee correctamente `-27 | -87 | 21`, pero interpreta `30 | -81 | 21` como tamano de cluster con las coordenadas desplazadas. El marcador `<2:` contiene la respuesta y el modelo lo ignora.
- Las desigualdades se pierden: `>8` se almacena como `8.0`.
- Requiere cargar los pesos fusionados; cargar solo el adaptador LoRA produce resultados silenciosamente incorrectos.
- Riesgo de alucinacion en tablas con formatos no vistos durante el entrenamiento; no hay datos publicados sobre este extremo.
- Sesgos conocidos: no disponibles.
- Limitaciones de idioma: no disponibles; la model card esta en ingles y los ejemplos de entrada tambien.
- No se documentan cambios en la licencia respecto al modelo base (Apache 2.0), pero conviene verificar las condiciones del modelo base `numind/NuExtract3` para uso comercial.
- El modelo no realiza razonamiento general ni generacion de texto libre: esta especializado en extraccion estructurada.
- Las versiones del repositorio son tags mutables; para reproducibilidad debe fijarse un SHA concreto y consultar `provenance.json`.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jdkent/nuextract3-neuro-tables
- Modelo base: https://huggingface.co/numind/NuExtract3
- Dataset de entrenamiento: https://huggingface.co/datasets/jdkent/neuro-tables
- Benchmark `neurometabench`: no disponible en los resultados de busqueda
- Paper asociado: no disponible en los resultados de busqueda
