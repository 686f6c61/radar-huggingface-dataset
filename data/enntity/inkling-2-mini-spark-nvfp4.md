# Enntity/Inkling-2-Mini-Spark-NVFP4

## Resumen

Inkling-2-Mini-Spark-NVFP4 es un overlay de cuantización en formato NVFP4 del modelo base thinkingmachines/Inkling-2-Mini, publicado por el usuario Enntity. No se trata de un modelo independiente, sino de un conjunto de 459 tensores calibrados que sustituyen a sus equivalentes en BF16 y MXFP8 del checkpoint original, diseñado específicamente para el modo Spark de la herramienta SparkInkling sobre una única NVIDIA DGX Spark. El resto del modelo (expertos enrutados NVFP4 de las capas 0-19, router, controladores de bucle, embeddings y el drafter DSpark) se toma sin cambios del checkpoint base.

El objetivo es reducir el peso leído por token en inferencia de 5,5 GB a aproximadamente 2,8 GB, a cambio de una pérdida de fidelidad medida y documentada mediante divergencia KL frente al modelo base. La cuantización se aplica a las proyecciones de atención (q, k, v, output-gate, output y bias relativo) de las 24 capas, al `lm_head` y a los expertos enrutados de las capas 20-23.

La relevancia de esta ficha radica en que documenta un caso de cuantización post-entrenamiento con GPTQ sobre un modelo de arquitectura híbrida con bucle y mezcla de expertos, con métricas de calidad reproducibles y bajo licencia Apache-2.0. Es material de interés para quienes despliegan modelos grandes en hardware de una sola GPU con memoria unificada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos y controladores de bucle (según checkpoint base; detalles no disponibles en esta ficha) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 (E2M1 con escala E4M3 cada 16 entradas y `weight_scale_2` F32 por tensor); overlay sobre base en BF16 y MXFP8 |
| Idiomas soportados | no disponible (el conjunto de calibración incluye texto en inglés y japonés) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (ModelOpt NVFP4, nombres de módulo de transformers) |

## Arquitectura y entrenamiento

El modelo base Inkling-2-Mini emplea una arquitectura con mezcla de expertos (los expertos enrutados de las capas 0-19 ya vienen en NVFP4 en el checkpoint original) y un mecanismo de bucle que reutiliza las capas 6-17 en tres pasadas. Incluye además un drafter DSpark para decodificación especulativa. Esta ficha no dispone de los detalles completos de la arquitectura del modelo base (número total de parámetros, tokens de entrenamiento, composición del dataset ni si hubo RLHF o DPO); esa información no está disponible en la documentación consultada.

La cuantización de este overlay se realizó con GPTQ por capa lineal (bloque de 128, damping 0,1, orden de activación) con una búsqueda amplia de escala por grupo (0,80-1,75 × amax/6). Las matrices de Hessian se obtuvieron del checkpoint base tal como se distribuye; las tres pasadas del núcleo de bucle sobre las capas 6-17 comparten un único Hessian sumado sobre las tres visitas. La calibración usó 497 documentos y 658.557 tokens de texto de dominio mixto, disjuntos del conjunto de evaluación. El informe `quant-report.json` recoge un error relativo medio de salida de 0,0017 sobre las 145 capas lineales densas (máximo 0,0043) y de 0,0017-0,0049 para los expertos de la coda.

## Capacidades

- Generación de texto y razonamiento conversacional (la categoría chat_reasoning aparece en la evaluación de calidad).
- Llamada a herramientas (tool calling), evaluada explícitamente como categoría de calidad.
- Generación de código (categoría code en la evaluación).
- Razonamiento matemático (categoría math, con la menor divergencia KL del conjunto: 0,0034).
- Procesamiento de prosa en inglés y japonés (categorías prose_en y prose_ja).
- Contenido científico (categoría science).
- Decodificación especulativa mediante el drafter DSpark del checkpoint base.
- No se dispone de información sobre soporte de visión, audio, modo thinking explícito ni otras capacidades especiales en la documentación consultada.

## Casos de uso

- Despliegue en una única NVIDIA DGX Spark: el overlay está diseñado para el modo Spark de SparkInkling, reduciendo el peso leído por token de 5,5 GB a unos 2,8 GB, lo que permite servir el modelo en hardware de memoria unificada de una sola máquina.
- Evaluación de cuantización NVFP4 en producción: útil para equipos que quieran medir el impacto real de GPTQ frente a RTN en un modelo con mezcla de expertos y bucle, usando los receipts incluidos (`kl-compare.json` por brazo).
- Asistentes con tool calling: la categoría tool_calling presenta una KL de 0,0097, lo que indica degradación contenida para pipelines de agentes que invocan funciones.
- Generación de código en pipelines de CI/CD: la categoría code (KL 0,0070) sugiere que el modelo cuantizado mantiene fidelidad razonable para tareas de autocompletado y revisión de código.
- Razonamiento matemático asistido: la categoría math (KL 0,0034) es la más fiel al modelo base, adecuada para resolución de problemas paso a paso.
- Atención al cliente multilingüe: con soporte de prosa en inglés y japonés y buena retención en chat_reasoning (KL 0,0104), puede emplearse en conversaciones multi-turno, siempre que se valide el contexto máximo real del modelo base.
- Investigación sobre compresión de modelos: el informe de calibración y los receipts permiten reproducir el proceso y comparar estrategias de cuantización en arquitecturas híbridas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. La documentación proporciona métricas de fidelidad de cuantización frente al modelo base, no de rendimiento absoluto.

| Tensores sustituidos | KL GPTQ [IC 95%] | Acuerdo top-1 | NLL | KL RTN |
|---|---|---|---|---|
| Proyecciones de atención | 0,0064 [0,0059, 0,0070] | 97,36% | +0,02% | 0,0131 |
| + lm_head | 0,0073 [0,0068, 0,0080] | 97,13% | +0,11% | 0,0155 |
| + expertos capas 20-23 (overlay completo) | 0,0081 [0,0075, 0,0088] | 97,00% | +0,16% | 0,0170 |

Evaluación sobre 224 documentos retenidos y 222.234 tokens en 7 categorías. GPTQ supera a RTN en los 224 documentos en todos los brazos. Desglose por categoría del overlay completo: chat_reasoning 0,0104; tool_calling 0,0097; prose_ja 0,0099; prose_en 0,0087; science 0,0080; code 0,0070; math 0,0034.

## Requisitos de hardware

- VRAM estimada: el overlay ocupa 2,9 GB en disco; el modelo completo requiere el checkpoint base más este overlay. En modo Spark se leen unos 2,8 GB de pesos por token frente a 5,5 GB del checkpoint original.
- GPU recomendada: NVIDIA DGX Spark (memoria unificada), único hardware para el que está diseñado el modo Spark de SparkInkling.
- Compatibilidad con GPU de consumo: no disponible; no se documenta soporte para RTX 4090 u otras GPU de consumo.
- Opciones de despliegue: SparkInkling (modo Spark para este overlay; modo Strict para el checkpoint base sin cuantizar). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. El autor indica que el modo Spark intercambia fidelidad por velocidad, sin cifras concretas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Inkling-2-Mini-Spark-NVFP4 (este) | no disponible | no disponible | NVFP4 (GPTQ) | Apache-2.0 | Hugging Face, requiere checkpoint base |
| thinkingmachines/Inkling-2-Mini (base) | no disponible | no disponible | BF16 + MXFP8 | Apache-2.0 | Hugging Face |
| RTN NVFP4 de los mismos tensores | no disponible | no disponible | NVFP4 (round-to-nearest) | Apache-2.0 | Referencia interna en receipts |

No se dispone de información sobre otros modelos comparables de la misma categoría en la documentación consultada.

## Limitaciones y advertencias

- No es un modelo autónomo: requiere el checkpoint base thinkingmachines/Inkling-2-Mini en la revisión `ed40e7da625f594fc9c4990f5f66be24873c22d7` y el enlazado mediante `install/spark_overlay.py` de SparkInkling.
- Pérdida de fidelidad medible: KL de 0,0081 y acuerdo top-1 del 97,00% frente al modelo base; la degradación es mayor en chat_reasoning (0,0104) y menor en math (0,0034).
- El modo Spark no equivale al modelo original; para máxima fidelidad debe usarse el modo Strict de SparkInkling con el checkpoint base.
- Riesgo de alucinación: no cuantificado en la documentación; se desconoce el impacto de la cuantización en la tasa de alucinación más allá de la divergencia de distribución.
- Sesgos conocidos: no documentados.
- Idiomas: solo se confirma calibración con texto en inglés y japonés; el resto de idiomas no está verificado.
- Licencia Apache-2.0 permite uso comercial, pero se deriva de un modelo de Thinking Machines y conviene revisar los términos del modelo base.
- Sin datos de benchmarks estándar ni de latencia/throughput, lo que limita la comparación con alternativas.

## Enlaces

- Hugging Face: https://huggingface.co/Enntity/Inkling-2-Mini-Spark-NVFP4
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Repositorio SparkInkling: https://github.com/Enntity/sparkinkling
