# sebidev/Qwen3.5-35B-A3B

## Resumen

Qwen3.5-35B-A3B es un modelo de lenguaje causal multimodal (texto e imagen) de tipo Mixture-of-Experts con arquitectura hibrida, publicado por el equipo Qwen de Alibaba. El repositorio analizado, sebidev/Qwen3.5-35B-A3B, es una redistribucion o ajuste derivado del modelo base Qwen/Qwen3.5-35B-A3B-Base, con licencia Apache 2.0 y pesos en formato safetensors para transformers. Cuenta con 35.951.822.704 parametros totales y aproximadamente 3.000 millones de parametros activos por token, lo que le permite ofrecer una capacidad cercana a un modelo denso de gran tamano con un coste de inferencia propio de un modelo de 3B activos.

Su caracteristica tecnica principal es la combinacion de Gated DeltaNet (atencion lineal) con Gated Attention clasica y capas MoE en un patron hibrido de 40 capas, ademas de entrenamiento con Multi-Token Prediction (MTP) para decodificacion especulativa. La longitud de contexto nativa es de 262.144 tokens, extensible hasta 1.010.000 tokens, y la model card declara soporte para 201 idiomas y dialectos.

Es relevante ahora porque representa la tendencia de modelos MoE multimodales de tamanos medios con contexto muy largo y activacion esparsa, pensados para despliegue en produccion con throughput alto. No obstante, conviene tener en cuenta que el repositorio concreto de sebidev no presenta descargas ni valoraciones, y no incluye documentacion propia sobre el proceso de ajuste.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal hibrido con vision encoder: Gated DeltaNet (atencion lineal) + Gated Attention + Mixture-of-Experts |
| Parametros totales | 35.951.822.704 |
| Parametros activos | ~3B (8 expertos enrutados + 1 compartido de 256 expertos) |
| Longitud de contexto | 262.144 tokens nativos, extensible hasta 1.010.000 tokens |
| Tipos de cuantizacion | no disponible (el autor no publica variantes cuantizadas; el repo ocupa 71,9 GB, consistente con BF16) |
| Idiomas soportados | 201 idiomas y dialectos segun la model card; metadatos de HuggingFace: no disponibles |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (transformers) |

Otros datos de configuracion declarados: dimension oculta 2048, 40 capas, vocabulario de 248.320 tokens (con padding), layout 10 x (3 x (Gated DeltaNet → MoE) → 1 x (Gated Attention → MoE)). En Gated DeltaNet: 32 cabezas de atencion lineal para V y 16 para QK, dimension de cabeza 128. En Gated Attention: 16 cabezas para Q y 2 para KV, dimension de cabeza 256, dimension de RoPE 64. Expertos: 256, con dimension intermedia 512.

## Arquitectura y entrenamiento

El modelo es un transformer causal que integra un encoder de vision y combina dos mecanismos de atencion: Gated DeltaNet, una forma de atencion lineal con cabezas separadas para QK y V, y Gated Attention con atencion completa sobre 16 cabezas de consulta y 2 de clave-valor. Estas capas se intercalan en un patron repetido de 10 bloques, cada uno con tres subcapas de Gated DeltaNet seguidas de una subcapa de Gated Attention, y cada subcapa va seguida de una capa MoE. La MoE dispone de 256 expertos con dimension intermedia 512, de los que se activan 8 enrutados mas 1 compartido, lo que explica la diferencia entre 35B parametros totales y 3B activos.

Segun la model card, el entrenamiento combina preentrenamiento y postentrenamiento con fusion temprana de tokens multimodales, de modo que el modelo alcanza paridad con Qwen3 en tareas de texto y supera a los modelos Qwen3-VL en razonamiento, codigo, agentes y comprension visual. El postentrenamiento incluye escalado de aprendizaje por refuerzo en entornos con millones de agentes y distribuciones de tareas progresivamente complejas. Tambien se entrena con Multi-Token Prediction (MTP) en varios pasos, lo que habilita decodificacion especulativa. No se especifican en la informacion disponible el numero exacto de tokens de entrenamiento, la composicion del dataset ni si se emplearon tecnicas concretas como RLHF o DPO. La infraestructura de entrenamiento se describe como de casi el 100 % de eficiencia multimodal respecto a entrenamiento solo de texto.

## Capacidades

- Generacion de texto y razonamiento en lenguaje natural, con paridad declarada frente a Qwen3 en benchmarks de razonamiento.
- Codigo: la model card situa al modelo por encima de Qwen3-VL en tareas de codigo.
- Matematicas y conocimiento general: evaluado en MMLU-Pro dentro del bloque de conocimiento.
- Vision: pipeline image-text-to-text, con encoder de vision y entrenamiento de fusion temprana multimodal.
- Comprension visual: supera a Qwen3-VL segun la model card en tareas de understanding visual.
- Agentes: RL escalado en entornos multiagente y orientacion explicita a tareas de agente y razonamiento multi-paso.
- Tool calling / function calling: la version alojada Qwen3.5-Flash incluye herramientas integradas oficiales; no se detalla en la informacion disponible si el peso abierto expone plantillas de tool calling equivalentes.
- Multilingue: 201 idiomas y dialectos.
- Decodificacion especulativa mediante MTP entrenado en varios pasos.
- Contexto muy largo: 262.144 tokens nativos, extensible a 1.010.000, util para documentos extensos y conversaciones de muchas vueltas.

## Casos de uso

- Atencion al cliente automatizada: con 262.144 tokens de contexto nativo, el modelo puede mantener conversaciones multi-turno muy largas y arrastrar el historial completo de un cliente sin truncar, algo critico en soporte tecnico o banca.
- Analisis de documentos extensos: contratos, informes anuales o expedientes de cientos de miles de tokens pueden procesarse en una sola pasada, con la extension a 1M tokens para corpus que superen la ventana nativa.
- Generacion de codigo en produccion: su rendimiento declarado en tareas de codigo y su coste de inferencia bajo (3B activos) lo hacen adecuado para asistentes de autocompletado o revision de PRs integrados en pipelines de CI/CD.
- Agentes autonomos multi-paso: el entrenamiento con RL en entornos multiagente y el soporte de contexto largo permiten construir agentes que planifican, invocan herramientas y mantienen estado durante tareas largas.
- Procesamiento de documentos con imagenes: al ser image-text-to-text, sirve para extraccion de datos de facturas, tickets, formularios escaneados o capturas, combinando OCR implicito con razonamiento sobre el contenido.
- Asistencia en investigacion cientifica multilingue: con 201 idiomas declarados, es util para resumir y comparar literatura tecnica en distintos idiomas dentro de una misma ventana de contexto.
- Moderacion y clasificacion a gran escala: el bajo numero de parametros activos reduce el coste por token, lo que hace viable desplegarlo sobre volumenes altos de peticiones en tareas de etiquetado o filtrado.
- Despliegue en infraestructura propia con requisitos de soberania de datos: al ser Apache 2.0 y de pesos abiertos, puede alojarse on-premise sin dependencia de API externa.

## Benchmarks y rendimiento

La informacion proporcionada incluye la tabla de benchmarks de la model card, pero el bloque disponible esta truncado: solo se muestran los resultados de la seccion "Knowledge", empezando por MMLU-Pro. No hay datos publicados en la informacion disponible sobre HumanEval, GSM8K ni el resto de categorias.

| Modelo | MMLU-Pro |
|---|---|
| GPT-5-mini 2025-08-07 | 83,7 |
| GPT-OSS-120B | 80,8 |
| Qwen3-235B-A22B | 84,4 |
| Qwen3.5-122B-A10B | 86,7 |
| Qwen3.5-27B | 86,1 |
| Qwen3.5-35B-A3B | no disponible (valor truncado en la informacion) |

El resto de resultados de benchmark del modelo (razonamiento, codigo, agentes, vision y otras categorias de conocimiento) no estan disponibles en la informacion proporcionada. Las cifras anteriores corresponden a la tabla oficial de Qwen incluida en la model card y no han sido verificadas de forma independiente para este repositorio derivado.

## Requisitos de hardware

Las cifras de VRAM son estimaciones calculadas a partir del numero de parametros (35.951.822.704) y no proceden de mediciones publicadas en la informacion disponible.

- Pesos en BF16: aproximadamente 72 GB, consistente con el tamano de repo de 71,9 GB.
- Pesos en FP8: aproximadamente 36 GB.
- Pesos en 4 bits (AWQ, GPTQ o similar): aproximadamente 18-20 GB mas overhead de cache KV.
- GPU recomendadas para BF16: una H100 80 GB, o reparto en 2 x A100 80 GB / 4 x A100 40 GB.
- GPU recomendadas para FP8: 1 x H100 80 GB o 1 x A100 80 GB con margen para cache KV.
- Consumer GPU: con cuantizacion de 4 bits el modelo puede caber en una RTX 4090 (24 GB) o RTX 5090 (32 GB), con contexto limitado por el consumo de cache KV; en BF16 no cabe en ninguna GPU de consumo actual.
- Cache KV: al emplear Gated Attention con solo 2 cabezas KV, el consumo de cache por token es comparativamente bajo frente a un transformer denso de atencion completa, pero se desconoce la cifra exacta de bytes por token.
- Opciones de despliegue confirmadas por la model card: HuggingFace Transformers, vLLM, SGLang y KTransformers. No se confirma en la informacion disponible soporte de llama.cpp u Ollama para este repositorio, aunque al ser un modelo MoE hibrido requeriria soporte especifico de dichos runtimes.
- Latencia y throughput: no disponibles. Como referencia estructural, al activar ~3B parametros por token, el coste computacional por token es muy inferior al de un modelo denso de 35B, lo que en teoria permite throughput elevado y latencia baja en hardware con suficiente memoria para alojar los 35B de pesos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | MMLU-Pro | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-35B-A3B | 35B totales / 3B activos | 262.144 nativos, hasta 1.010.000 | no disponible en la informacion | apache-2.0 | Pesos abiertos (este repo y el base) |
| Qwen3.5-27B | 27B (nomenclatura) | no disponible | 86,1 | no disponible | Pesos abiertos segun la tabla de Qwen |
| Qwen3.5-122B-A10B | 122B totales / 10B activos (nomenclatura) | no disponible | 86,7 | no disponible | Pesos abiertos segun la tabla de Qwen |
| Qwen3-235B-A22B | 235B totales / 22B activos (nomenclatura) | no disponible | 84,4 | no disponible | Pesos abiertos segun la tabla de Qwen |
| GPT-OSS-120B | 120B (nomenclatura) | no disponible | 80,8 | no disponible | Pesos abiertos segun la tabla de Qwen |
| GPT-5-mini 2025-08-07 | no disponible | no disponible | 83,7 | propietaria | Solo API |

Advertencia sobre la comparativa: los datos de parametros y contexto de los modelos alternativos no aparecen en la informacion proporcionada y se derivan unicamente de su nomenclatura; deben verificarse en sus respectivas fichas antes de usarse en una decision tecnica. La tabla de benchmarks disponible solo cubre MMLU-Pro, por lo que no permite comparar el rendimiento en codigo, agentes o vision.

## Limitaciones y advertencias

- Riesgo de alucinacion: no se han publicado tasas de alucinacion ni evaluaciones de factualidad en la informacion disponible.
- Sesgos: no hay informacion sobre evaluaciones de sesgo, toxicidad o equidad para este modelo ni para este repositorio concreto.
- Idioma: la model card declara 201 idiomas, pero no se especifica el nivel de calidad por idioma; el castellano no figura con evaluacion propia.
- Contexto: aunque el contexto nativo es de 262.144 tokens y extensible a 1M, no se documentan en la informacion disponible los resultados de pruebas tipo needle-in-a-haystack ni la degradacion esperada en contextos muy largos.
- Licencia: Apache 2.0 permite uso comercial, pero la model card remite a la licencia del repositorio oficial de Qwen; conviene revisar ese texto antes de un despliegue comercial.
- Procedencia del repositorio: sebidev/Qwen3.5-35B-A3B es un repositorio de terceros con 0 descargas y 0 valoraciones en el momento de la consulta, creado y actualizado el 2026-10-04. No se documenta que ajuste o modificacion concreta se ha aplicado sobre Qwen/Qwen3.5-35B-A3B-Base, ni si los pesos han sido verificados. Para produccion es mas prudente partir del repositorio oficial de Qwen.
- Compatibilidad de runtimes: el modelo es una arquitectura hibrida con Gated DeltaNet, por lo que requiere versiones recientes de transformers, vLLM, SGLang o KTransformers; runtimes genericos sin soporte explicito de esta arquitectura fallaran al cargarlo.
- Reproducibilidad: no se publican detalles de datos de entrenamiento, tokens, composicion del dataset ni metodo de postentrenamiento en la informacion disponible.
- Coste de memoria: aunque solo se activen 3B parametros, es necesario alojar los 35B de pesos, por lo que el requisito de VRAM sigue siendo alto en precision completa.

## Enlaces

- Repositorio analizado (HuggingFace): https://huggingface.co/sebidev/Qwen3.5-35B-A3B
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-35B-A3B-Base
- Repositorio oficial del modelo Qwen3.5-35B-A3B: https://huggingface.co/Qwen/Qwen3.5-35B-A3B
- Licencia: https://huggingface.co/Qwen/Qwen3.5-35B-A3B/blob/main/LICENSE
- Blog de Qwen3.5: https://qwen.ai/blog?id=qwen3.5
- Qwen Chat: https://chat.qwen.ai
- Alibaba Cloud Model Studio (servicio gestionado, version Qwen3.5-Flash): https://modelstudio.alibabacloud.com/
- Guia de usuario de Model Studio: https://www.alibabacloud.com/help/en/model-studio/text-generation

Nota sobre la busqueda web: los resultados devueltos por la busqueda no guardan ninguna relacion con el modelo Qwen3.5-35B-A3B ni con sus autores. Se trata de enlaces a un sitio de contenido para adultos sin conexion tecnica con el modelo, por lo que se han descartado y no se incluyen como fuentes. No se han encontrado en la busqueda papers, repositorios ni demos adicionales relevantes para esta ficha.
