# AutomatosX/AX-Nemotron-3-Embed-8B-MLX-AXQ-MXFP4

## Resumen

AX-Nemotron-3-Embed-8B-MLX-AXQ-MXFP4 es un punto de control cuantizado en formato MLX del modelo de embeddings nvidia/Nemotron-3-Embed-8B-BF16, publicado por AutomatosX. Se trata de una conversión de precisión mixta realizada con la herramienta AXQuant 1.9.0, orientada a ejecución sobre Apple Silicon mediante la librería MLX-LM. El modelo está pensado para tareas de extracción de características y similitud entre frases (pipeline `feature-extraction`), no como modelo generativo de propósito general.

El modelo base es una arquitectura densa `Ministral3Model` (familia `mistral3`) con 7.950 millones de parámetros lógicos y una ventana de contexto configurada de 262.144 tokens. La conversión aplica cuantización de precisión mixta con un presupuesto de almacenamiento de clase MXFP4, alcanzando 4,5374 bits por peso (BPW) medidos. El tamaño del repositorio es de 4,5 GB y la descarga completa ronda los 4,53 GB, lo que permite desplegarlo en equipos con memoria unificada modesta.

La relevancia de esta ficha radica en que se trata de evidencia de desarrollo, no de un lanzamiento certificado. El autor declara explícitamente que no publica métricas de calidad, de contexto largo, de velocidad de kernels ni de MTP. La licencia es Apache 2.0. Existe poca tracción en el Hub (23 descargas, 0 likes en la fecha de actualización indicada), lo que conviene tener en cuenta al evaluar su madurez.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso, `Ministral3Model` (familia `mistral3`), ruta de texto optimizada |
| Parametros totales | 7.952.683.008 (7,95B lógicos) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens configurados; el limite practico depende de la memoria unificada |
| Tipos de cuantizacion | Precisión mixta AXQuant: `4bit` (7,42B, 93,25%), `8bit` (536,87M, 6,75%), `bf16` (282.624 param.); métodos `affine`, `bf16`, `mxfp4`; tamanos de grupo 32 y 64 |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | MLX Safetensors (no incluye pesos PyTorch ni GGUF) |

## Arquitectura y entrenamiento

El modelo base nvidia/Nemotron-3-Embed-8B-BF16 es un transformer denso de la familia `mistral3` con arquitectura `Ministral3Model`, adaptado como modelo de embeddings. Esta ficha corresponde a una conversión cuantizada del mismo, no a un entrenamiento nuevo: AutomatosX parte del modelo BF16 original (revisión `d1f2f25730bbd775b99b29185134bc86653bf2d1`) y aplica cuantización AXQuant 1.9.0. No se aporta información sobre el número de tokens de entrenamiento, composición del dataset ni sobre si hubo fases de RLHF o DPO para el modelo base.

La innovación técnica reside en la estrategia de cuantización de precisión mixta. Los tensores protegidos (embeddings, normas y otros) se mantienen en mayor precisión, mientras que el resto se cuantiza con un presupuesto de clase MXFP4. El resultado es un total medido de 4,5374 BPW frente a los 5,2367 BPW planificados inicialmente. Se registraron 239/239 conversiones de módulo correctas y 0 fallbacks. La calibración fue inexistente: la asignación se basó en priors de arquitectura (`architecture_prior`). No hay sidecars de MTP ni de visión, y el paquete no incluye un `model-manifest.json` validado para el motor AX Engine nativo.

## Capacidades

- Extracción de características (feature-extraction): genera representaciones vectoriales a partir de texto, aptables para indexación y búsqueda.
- Similitud semántica entre frases (sentence-similarity): permite calcular distancias y afinidades entre textos.
- Ventana de contexto larga de 262.144 tokens configurados, útil para documentos extensos, sujeto a la memoria disponible.
- Ejecución sobre Apple Silicon mediante MLX-LM, con soporte de inferencia de texto/backbone estándar.
- Capacidades multilingües: no disponible.
- Modo de razonamiento explícito (thinking), visión o audio: no disponibles (MTP, visión y audio marcados como ausentes).

## Casos de uso

- Búsqueda semántica sobre documentación técnica: generar embeddings de fragmentos y consultas para un motor de recuperación vectorial, aprovechando el contexto largo para indexar secciones extensas sin trocear en exceso.
- Clasificación y agrupamiento de textos: calcular embeddings y aplicar clustering o clasificación por similitud para organizar tickets, artículos o correos.
- Sistema RAG local sobre Apple Silicon: usar el modelo como codificador de recuperación en un equipo Mac, con un tamaño de descarga de 4,53 GB que cabe en memoria unificada modesta.
- Deduplicación de contenido: detectar documentos o párrafos casi idénticos mediante similitud coseno sobre las representaciones generadas.
- Recomendación por contenido: representar ítems textuales y usuarios o consultas para sugerir elementos afines por proximidad vectorial.
- Detección de similitud y parafraseo: comparar pares de frases para tareas de evaluación de equivalencia semántica o control de plagio a pequeña escala.
- Filtrado de seguridad o moderación de contenido: usar embeddings para agrupar y comparar mensajes contra patrones de referencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor declara de forma explícita que este paquete no publica evidencias de calidad medidas, de contexto largo, de velocidad de kernels ni de velocidad de MTP, y advierte que la etiqueta AXQ no debe interpretarse como una afirmación de rendimiento.

## Requisitos de hardware

- VRAM/memoria: alrededor de 4,5 GB para los pesos en MLX Safetensors; la memoria adicional depende del contexto de entrada y del tamaño de lote. Con 262.144 tokens de contexto, el consumo crecerá de forma notable y el limite práctico dependerá de la memoria unificada.
- Hardware objetivo: Apple Silicon (chips de la familia M). Es el requisito de runtime implícito del formato MLX.
- GPU dedicadas (A100, H100, RTX 4090): no disponibles para este formato; el repositorio no incluye pesos PyTorch ni GGUF, por lo que no se puede ejecutar directamente en CUDA.
- Encaje en hardware de consumo: sí, cabe con holgura en equipos Apple Silicon con memoria unificada de 8 GB o más para contextos cortos.
- Opciones de despliegue: MLX-LM (ruta de runtime principal indicada). El motor AX Engine nativo no está establecido por este release al no incluir un manifiesto validado.
- Latencia y throughput: no disponibles (no se publican métricas de velocidad de kernels ni de MTP).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AX-Nemotron-3-Embed-8B-MLX-AXQ-MXFP4 | 7,95B (BPW medido 4,5374) | 262.144 tokens | MLX Safetensors | apache-2.0 | HuggingFace (23 descargas) |
| nvidia/Nemotron-3-Embed-8B-BF16 (modelo base) | 7,95B en BF16 | 262.144 tokens | Safetensors BF16 | no disponible en la informacion | HuggingFace (NVIDIA) |
| AutomatosX/AX-Nemotron-3-Embed-8B-MLX-AXQ-4bit (sibling) | 7,95B (presupuesto 4bit) | 262.144 tokens | MLX Safetensors | apache-2.0 | HuggingFace |
| AutomatosX/AX-Nemotron-3-Embed-8B-MLX-AXQ-8bit (sibling) | 7,95B (presupuesto cercano a 8 BPW) | 262.144 tokens | MLX Safetensors | apache-2.0 | HuggingFace |

No se dispone de datos de rendimiento para establecer comparaciones cuantitativas con alternativas externas de la misma categoría; la comparativa se limita a las variantes del mismo modelo base. Para alternativas externas: no disponible.

## Limitaciones y advertencias

- Evidencia de desarrollo: el propio autor indica que no es un lanzamiento AXQuant certificado y que no publica métricas de calidad, de contexto largo, de velocidad de kernels ni de MTP.
- Riesgo de alucinación: no disponible; al ser un modelo de embeddings, el riesgo relevante sería la baja calidad de representación, no medida aquí.
- Sin calibración: la asignación de precisión se basó en priors de arquitectura, no en datos de calibración, lo que puede afectar a la fidelidad de la cuantización.
- Alcance limitado al texto: no hay sidecars de visión ni de audio, y MTP está marcado como ausente.
- Compatibilidad de runtime: MLX-LM cubre inferencia de texto/backbone estándar, pero puede ignorar metadatos de runtime AXQuant y sidecars opcionales. El motor AX Engine nativo no está establecido (falta un `model-manifest.json` validado).
- Restricción de plataforma: al ser formato MLX, no se puede usar directamente en CUDA ni con runtimes como vLLM, llama.cpp u Ollama, salvo conversión previa.
- Idiomas soportados: no disponibles, por lo que la cobertura multilingüe no puede confirmarse con la información dada.
- Licencia: Apache 2.0 permite uso comercial, pero conviene revisar los términos del modelo base de NVIDIA por separado.
- Advertencia de reproducibilidad: el autor recomienda fijar el commit del Hub en despliegues reproducibles en lugar de depender indefinidamente de `main`.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/AutomatosX/AX-Nemotron-3-Embed-8B-MLX-AXQ-MXFP4
- Modelo base: https://huggingface.co/nvidia/Nemotron-3-Embed-8B-BF16
- Sibling 4bit: https://huggingface.co/AutomatosX/AX-Nemotron-3-Embed-8B-MLX-AXQ-4bit
- Sibling 8bit: https://huggingface.co/AutomatosX/AX-Nemotron-3-Embed-8B-MLX-AXQ-8bit
- Colecciones de AutomatosX: https://huggingface.co/AutomatosX/collections
- Índice completo del catálogo MLX: https://huggingface.co/collections/AutomatosX/automatosx-mlx-model-catalog
