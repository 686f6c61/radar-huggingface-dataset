# redmingwei/HeteroMoEProjSpace-v2

## Resumen

HeteroMoEProjSpace-v2 es un modelo de extracción de características multimodal desarrollado por el usuario redmingwei, publicado bajo licencia Apache 2.0. No es un modelo generativo al uso: su pipeline declarado es `feature-extraction` y su salida principal es un tensor de representaciones de 1024 dimensiones (`out.y`) junto con pesos de routing de expertos (`out.alpha`). El modelo combina tres backbones preentrenados reales —Qwen2.5-0.5B-Instruct, un BERT pequeño (L4, H256) y ViT-base-patch16-224— dentro de una arquitectura MoE heterogénea con una capa de proyección dimensional y una capa de fusión de 1024 dimensiones.

El interés técnico reside en su planteamiento: en lugar de un MoE convencional con expertos homogéneos, utiliza backbones de distinta naturaleza (texto autoregresivo, texto bidireccional e imagen) como expertos, proyectados a un espacio común de dimensiones y fusionados mediante routing aprendido. Los pesos de los backbones están congelados y solo se entrenan el espacio de proyección (2,76 M de parámetros) y la capa de fusión (50,34 M), con expertos de la fusión desbloqueados pero inicializados aleatoriamente.

Es relevante como artefacto de investigación reproducible: incluye código de modelado autocontenido, inputs de ejemplo y salidas esperadas para verificar la carga de pesos, y documenta explícitamente sus métricas y sus limitaciones. Con 101 descargas y 0 likes en el momento de la consulta, es un modelo de nicho orientado a experimentación, no a producción general.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MoE heterogéneo multimodal con espacio de proyección dimensional y capa de fusión (transformers, código custom) |
| Parámetros totales | 645.190.802 |
| Parámetros activos | No disponible (no se documenta el ratio de activación por token) |
| Longitud de contexto | No disponible (el ejemplo de uso trunca a `max_length=16`; no se declara contexto máximo) |
| Tipos de cuantización | No disponible |
| Idiomas soportados | No disponible (el backbone Qwen2.5-0.5B-Instruct es multilingüe, pero el modelo no declara idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`model.safetensors`, 2,58 GB) y PyTorch (`.pt`, 214 MB, solo proyección y fusión) |

Desglose de parámetros por componente:

| Componente | Parámetros |
|---|---|
| `qwen` (Qwen2.5-0.5B-Instruct) | 494,03 M |
| `bert` (bert-uncased-L4-H256) | 11,17 M |
| `vit` (vit-base-patch16-224) | 86,39 M |
| `proj_space` (espacio de proyección dimensional) | 2,76 M |
| `fusion` (capa de fusión de 1024 dimensiones) | 50,34 M |

## Arquitectura y entrenamiento

La arquitectura es un MoE heterogéneo en el que cada "experto" es un backbone preentrenado de modalidad o naturaleza distinta: Qwen2.5-0.5B-Instruct para texto generativo, un BERT uncased de 4 capas y dimensión oculta 256 para texto bidireccional, y ViT-base-patch16-224 para imagen. Las representaciones de cada backbone se proyectan mediante `proj_space` a un espacio dimensional común y se combinan en una capa de fusión de 1024 dimensiones que produce la salida `y` y los pesos de routing `alpha` (4 dimensiones por token). Las modalidades son opcionales: si falta una entrada, se usa un vector cero como marcador en el routing.

El entrenamiento se realizó sobre estados ocultos reales extraídos de 10.000 textos de ag_news y 5.000 imágenes de food101, con partición estratificada por clase 80/20. Los backbones están congelados; se entrenan `proj_space` y `fusion`, y los expertos de la fusión están desbloqueados con inicialización aleatoria (desviación respecto al diseño original de la v33). No se documenta uso de RLHF, DPO ni número de tokens de entrenamiento más allá del conjunto de estados ocultos descrito. La innovación principal es el propio esquema de proyección y fusión entre modalidades heterogéneas, no técnicas de decodificación o atención.

## Capacidades

- Extracción de características multimodales: produce representaciones de 1024 dimensiones a partir de texto, imagen o ambos.
- Routing de expertos inspeccionable: expone `alpha` con los pesos de asignación por token y modalidad.
- Procesamiento de texto con dos tokenizadores independientes (Qwen y BERT) y de imagen con `ViTImageProcessor`.
- Entrada multimodal opcional: funciona solo con texto, solo con imagen o con ambas, usando vectores cero para modalidades ausentes.
- Carga reproducible con verificación de pesos (missing 0 / unexpected 0) y comparación contra `expected_y.npy`.
- No se documenta soporte de tool calling, function calling, agentes, modo thinking, audio ni generación de texto como tal; el pipeline es de extracción de características.

## Casos de uso

- Clasificación de noticias por categoría: el modelo fue evaluado en ag_news (4 clases) con una precisión held-out de 0,9016; puede usarse como extractor de embeddings para un clasificador ligero aguas abajo.
- Búsqueda y recuperación multimodal: generar embeddings de 1024 dimensiones de textos e imágenes para indexar y recuperar contenido cruzado en un motor vectorial.
- Prototipado de investigación sobre MoE heterogéneos: el routing `alpha` y el código autocontenido permiten estudiar cómo se asignan tokens a expertos de distinta naturaleza sin entrenar desde cero.
- Verificación de pipelines de inferencia: los inputs de ejemplo y la salida esperada sirven para validar instalaciones y versiones de transformers en CI.
- Clasificación de imágenes de alimentos: con las 5.000 imágenes de food101 usadas en entrenamiento como referencia, puede adaptarse como extractor para tareas de visión similares.
- Experimentos de fusión dimensional: el espacio de proyección de 2,76 M de parámetros es un banco de pruebas para técnicas de alineamiento entre espacios latentes de modelos distintos.
- Reproducción de resultados: los scripts y métricas del subpaquete de GitHub permiten recalcular precisión, balance de carga y entropía de routing.

## Benchmarks y rendimiento

| Métrica | Valor | Referencia |
|---|---|---|
| Precisión held-out (ag_news, 4 clases) | 0,9016 | Azar: 0,25 |
| Balance de carga de expertos | 0,8774 | No disponible |
| Entropía de routing | 0,5016 | No disponible |
| Carga de pesos | missing 0 / unexpected 0 | — |
| Consistencia entre dos forward en la misma instancia | Δ = 0,000e+00 | — |
| Deriva entre versiones de transformers (5.16.1 vs 5.21.0) | max\|Δy\| = 7,9e-05 (relativo ~2e-7) | — |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. La precisión de 0,9016 corresponde a una tarea de clasificación de 4 clases sobre ag_news y no debe interpretarse como capacidad general del modelo.

## Requisitos de hardware

- Peso del checkpoint completo: 2,58 GB en safetensors, más el repositorio total de 31,4 GB (incluye cachés y artefactos).
- VRAM estimada para inferencia en fp32: aproximadamente 2,6 GB solo de pesos, más activaciones; en fp16/bf16 bajaría a ~1,3 GB, aunque no se documentan cuantizaciones oficiales.
- Cabe en GPUs de consumo: cualquier GPU con 6-8 GB de VRAM o más (RTX 3060, RTX 4060, RTX 4090) debería poder cargarlo en precisión reducida.
- GPU recomendadas para mayor throughput: A100, H100 o L40S si se procesan lotes grandes de estados ocultos.
- Despliegue: `transformers` con `trust_remote_code=True` y `AutoModel`; requiere `transformers==5.21.0` para reproducibilidad bit a bit. No se documenta soporte de vLLM, TGI, llama.cpp ni Ollama (el modelo no es generativo y usa código custom).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Modalidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| HeteroMoEProjSpace-v2 | 645,19 M | No disponible | Texto + imagen | Apache 2.0 | Hugging Face, código custom |
| Qwen2.5-0.5B-Instruct | ~494 M | 32.768 tokens (según su model card pública) | Texto | Apache 2.0 | Hugging Face, ampliamente soportado |
| ViT-base-patch16-224 | ~86 M | No aplica (imagen 224×224) | Imagen | Apache 2.0 | Hugging Face |
| BERT uncased L4 H256 | ~11 M | 512 tokens | Texto | Apache 2.0 | Hugging Face |

La comparación directa es limitada: HeteroMoEProjSpace-v2 no es un modelo generativo ni un clasificador estándar, sino un extractor multimodal que envuelve a los tres anteriores. Frente a un CLIP o un ImageBind (no documentados en la información disponible), su propuesta es usar backbones de texto generativo y bidireccional como expertos, algo poco habitual.

## Limitaciones y advertencias

- Las métricas publicadas (0,9016 de precisión) corresponden exclusivamente a ag_news 4 clases y no miden capacidad general; el autor lo advierte explícitamente.
- Los expertos de la capa de fusión están desbloqueados y con inicialización aleatoria, lo que se desvía del diseño original de la v33 y puede afectar a la estabilidad del routing.
- El modelo no genera texto: es un extractor de características; usarlo para generación requeriría un cabezal adicional no incluido.
- No se declaran idiomas soportados ni longitud de contexto máxima, lo que dificulta planificar su uso en producción multilingüe o con documentos largos.
- No se documentan cuantizaciones oficiales; el despliegue en entornos con poca VRAM depende de conversiones manuales no verificadas.
- Riesgo de alucinación no aplica directamente al no ser generativo, pero los embeddings pueden heredar sesgos de los backbones subyacentes (Qwen2.5, BERT, ViT), no evaluados en la información disponible.
- La reproducibilidad bit a bit exige fijar `transformers==5.21.0`; otras versiones introducen derivas de hasta 7,9e-05.
- El repositorio pesa 31,4 GB, muy superior al checkpoint de 2,58 GB, por los artefactos de entrenamiento y cachés incluidos.
- El autor advierte de que otros repositorios de la serie (`HeteroMoE-v1`, `hetero-moe-router`, etc.) son artefactos históricos no cargables; solo este es utilizable de extremo a extremo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/redmingwei/HeteroMoEProjSpace-v2
- Repositorio de investigación en GitHub: https://github.com/Microbiosis/hetero-moe/tree/main/research/aligner/v62_dimension_projection_space
- Repositorio de datos de caché de entrenamiento: https://huggingface.co/datasets/redmingwei/hetero-moe-cache
- Repositorio de experimentos de routing: https://huggingface.co/redmingwei/hetero-moe-router
- Repositorio de análisis (v48-v61): https://huggingface.co/redmingwei/hetero-moe-projspace
- Repositorio histórico v33 (no cargable): https://huggingface.co/redmingwei/HeteroMoE-v1
- Productos de vídeo: https://huggingface.co/datasets/redmingwei/structure-film-public
