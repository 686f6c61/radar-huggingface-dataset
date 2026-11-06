# IsValorum/Axion-1.0-35B-APEX-I-NanoPlus-V2.1-GGUF

## Resumen

Axion-1.0-35B-APEX-I-NanoPlus-V2.1-GGUF es una cuantización GGUF del modelo base Axion-1.0-35B, publicada por el usuario independiente IsValorum dentro de su serie APEX Quantization. No se trata de un modelo nuevo, sino de una compilación de pesos en formato GGUF optimizada mediante quantización quirúrgica tensor a tensor, calibrada con una importance matrix pública, para su uso con llama.cpp en CPU y GPU. El resultado es un fichero de 12,55 GB que comprime un modelo de 34.660.610.688 parámetros.

El modelo base es un transformer híbrido con arquitectura MoE: 40 capas (30 de atención lineal/SSM y 10 de atención completa), 256 expertos enrutados más uno compartido con 8 activos por token, dimensión oculta de 2048, contexto de 262.144 tokens y vocabulario de 248.320 entradas. La cuantización conserva en F32 los componentes críticos para la estabilidad numérica del estado recurrente (escalas SSM, RMSNorms) y los routers de expertos, mientras degrada agresivamente los expertos enrutados de las bandas periféricas a IQ2_S, IQ2_XXS e IQ3_XXS.

La relevancia de esta ficha es doble: por un lado, documenta una técnica de cuantización poco habitual (mapa de tensores auditado y publicado en `tensor-map.tsv`); por otro, advierte de que el modelo base carece de evaluación independiente y de que el pipeline declarado es `image-text-to-text` pese a que este repositorio solo contiene los pesos de texto, siendo necesario descargar el `mmproj` desde otro repositorio para uso multimodal.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido MoE (30 capas de atención lineal/SSM + 10 capas de atención completa) |
| Parametros totales | 34.660.610.688 |
| Parametros activos | 8 expertos enrutados de 256 + 1 compartido por token (número exacto de parámetros activos no disponible) |
| Longitud de contexto | 262.144 tokens (modelo base); el ejemplo de uso recomienda `-c 32768` |
| Tipos de cuantizacion | Mixta quirúrgica: F32, Q8_0, Q6_K, Q4_K, Q3_K, IQ3_XXS, IQ2_S, IQ2_XXS |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

La arquitectura del modelo base combina atención lineal con modelos de estado recurrente (SSM) en 30 de las 40 capas, reservando 10 capas de atención completa cuadrática como anclas periódicas (capas 3, 7, 11, etc.) para tareas de recuperación de información en contexto largo. La capa MoE emplea 256 expertos enrutados más un experto compartido, con 8 expertos activos por token, dimensión oculta de 2048 y un vocabulario de 248.320 tokens. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron etapas de RLHF o DPO.

La innovación técnica de este repositorio no reside en el modelo, sino en el esquema de cuantización. Se protegen en F32 los 131 tensores de normalización, los 80 routers de expertos, las 120 escalas SSM (`ssm_alpha`, `ssm_a`, `ssm_conv1d`, `ssm_dt`) y los sesgos asociados, para evitar deriva del estado recurrente. Los expertos compartidos (120 tensores, activos en cada token) se mantienen en Q4_K, las proyecciones de atención completa en Q4_K/Q6_K, y solo los expertos enrutados de las capas 0-9 y 30-39 (bandas periféricas) y 10-29 (banda central) se comprimen a IQ2_S, IQ2_XXS e IQ3_XXS. La calibración usa la importance matrix pública `Axion-1.0-35B.imatrix.gguf` de mradermacher, verificada por tamaño y sha256.

## Capacidades

- Generación de texto conversacional y razonamiento multi-turno, con plantilla de chat propia (`chat_template.jinja`).
- Procesamiento multimodal imagen-texto, siempre que se descargue el proyector `Axion-1.0-35B.mmproj-bf16.gguf` (o sus versiones cuantizadas) desde el repositorio upstream de prithivMLmods; este repositorio solo contiene los pesos de texto.
- Contexto largo de hasta 262.144 tokens en el modelo base, adecuado para recuperación de información en documentos extensos gracias a las 10 capas de atención completa.
- Capacidad MoE con 8 expertos activos por token, lo que reduce el coste computacional por token frente a un modelo denso del mismo tamaño.
- Soporte de ejecución en llama.cpp mediante `llama-cli` y `llama-server` con flag `--jinja` para plantillas de chat.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la información proporcionada.
- Modo thinking explícito: no disponible en la información proporcionada.
- Idiomas soportados: no disponible.

## Casos de uso

- Despliegue en estaciones de trabajo sin GPU dedicada: con 12,55 GB de pesos y capas SSM en F32, el modelo puede ejecutarse en CPU con llama.cpp usando `-ngl 0` o con offload parcial, lo que permite prototipar asistentes conversacionales en hardware modesto.
- Procesamiento de documentos largos en local: el contexto de 262.144 tokens del modelo base permite resumir o extraer información de contratos, informes o expedientes completos sin truncar, aunque en la práctica conviene limitar `-c` al presupuesto de memoria disponible.
- Asistente conversacional multi-turno autoalojado: la plantilla de chat incluida y el soporte de `llama-server` con `--jinja` permiten exponer una API compatible con OpenAI para integrarse en aplicaciones internas.
- Análisis de imágenes en pipelines documentales: descargando el `mmproj` desde el repositorio upstream, el modelo puede describir capturas, extraer texto de imágenes o responder preguntas sobre diagramas, útil en digitalización de archivos.
- Evaluación comparativa de cuantizaciones: el mapa de tensores publicado (`tensor-map.tsv`) permite auditar qué precisión tiene cada tensor y comparar la degradación frente a la versión BF16 o frente a la variante MiniPlus del mismo autor.
- Investigación sobre cuantización de modelos híbridos SSM/MoE: el esquema de protección F32 de escalas recurrentes y routers constituye un caso de estudio reproducible para quienes investigan técnicas de compresión con preservación de estado.
- Generación de código y tareas de razonamiento en entornos con recursos limitados: aunque no hay benchmarks publicados que lo confirmen, el modelo base está pensado para tareas generales de texto; conviene validar la calidad en el workload propio antes de producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que los benchmarks del modelo base son autoinformados por el equipo de Axion y que no se reclama evaluación independiente para esta variante cuantizada.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 12,6 GB solo para los pesos; con overhead de contexto y caché KV, se recomienda entre 16 y 24 GB para `-c 32768`.
- GPU recomendadas: RTX 4090 (24 GB) para carga completa con contexto moderado; A100 40/80 GB o H100 para contexto largo (128K-256K) y mayor throughput.
- GPU de consumo: cabe en RTX 3090/4090 (24 GB), RTX 4080 (16 GB) con contexto reducido, y en GPUs de 12 GB solo con offload parcial a CPU.
- Despliegue: llama.cpp (`llama-cli`, `llama-server`), y por compatibilidad de formato GGUF, potencialmente Ollama y otros runners basados en llama.cpp. vLLM y TGI no soportan GGUF de forma nativa para este tipo de arquitectura híbrida, por lo que no se recomiendan.
- Latencia y throughput: no disponible. El uso de 8 expertos activos por token reduce el coste frente a un denso de 35B, pero las capas SSM en F32 añaden ancho de banda de memoria; el rendimiento real dependerá del backend y del hardware.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Axion-1.0-35B APEX-I NanoPlus V2.1 (este) | 34,66 B (MoE, 8 activos) | 262.144 | GGUF 12,55 GB | Apache-2.0 | Cuantización mixta IQ2/IQ3/Q4/Q6/F32 |
| Axion-1.0-35B APEX-I MiniPlus V2.1 | 34,66 B (MoE) | 262.144 | GGUF | Apache-2.0 | Variante del mismo autor, presumiblemente con distinto esquema de precisión; detalles no disponibles |
| Axion-1.0-35B (BF16, prithivMLmods) | 34,66 B (MoE) | 262.144 | GGUF BF16 | Apache-2.0 | Referencia sin cuantizar; incluye `mmproj` para multimodal |
| Modelos densos de ~30-35B (p. ej. familia Llama/Qwen) | ~30-35 B densos | variable | safetensors/GGUF | variable | Comparación no disponible con datos concretos en la información proporcionada |

No se dispone de datos de rendimiento comparativo entre estas variantes ni frente a modelos de otras familias, por lo que la comparativa se limita a parámetros, contexto, formato y licencia.

## Limitaciones y advertencias

- Los benchmarks del modelo base son autoinformados por el equipo de Axion; no existe evaluación independiente de esta cuantización.
- La calidad de la cuantización es teórica hasta que se valide en el workload concreto del usuario; los expertos enrutados en IQ2_XXS e IQ2_S pueden degradar tareas que dependan de conocimiento factual poco frecuente.
- El repositorio solo contiene los pesos de texto; el pipeline declarado `image-text-to-text` requiere descargar el `mmproj` desde el repositorio upstream de prithivMLmods, lo que puede inducir a error si se asume multimodalidad out-of-the-box.
- No se incluyen tensores MTP ni draft de DSpark para decodificación especulativa en esta familia, por lo que no se puede acelerar la generación con ese mecanismo.
- Idiomas soportados no documentados; el rendimiento en castellano no está verificado y podría ser inferior al de modelos con cobertura multilingüe explícita.
- Riesgo de alucinación inherente a los modelos de lenguaje; no hay evaluación específica de factualidad para esta variante.
- Sesgos conocidos: no documentados en la información proporcionada; se heredan los del modelo base, sin datos sobre su composición de entrenamiento.
- Licencia Apache-2.0 permite uso comercial, pero al ser una cuantización de un modelo de terceros conviene conservar la atribución al modelo base y al autor de la cuantización.
- El contexto máximo de 262.144 tokens es teórico; en la práctica la memoria KV y la degradación de atención en cuantizaciones agresivas pueden limitar la calidad en ventanas muy largas. El ejemplo oficial usa `-c 32768`.

## Enlaces

- Repositorio Hugging Face de esta cuantización: https://huggingface.co/IsValorum/Axion-1.0-35B-APEX-I-NanoPlus-V2.1-GGUF
- Modelo base: https://huggingface.co/Axion1-0/Axion-1.0-35B
- Repositorio GGUF BF16 upstream (incluye `mmproj`): https://huggingface.co/prithivMLmods/Axion-1.0-35B-GGUF
- Variante MiniPlus del mismo autor: https://huggingface.co/IsValorum/Axion-1.0-35B-APEX-I-MiniPlus-V2.1-GGUF
- Importance matrix de mradermacher: https://huggingface.co/mradermacher
- Apoyo al autor de la cuantización: https://ko-fi.com/isvalorum
