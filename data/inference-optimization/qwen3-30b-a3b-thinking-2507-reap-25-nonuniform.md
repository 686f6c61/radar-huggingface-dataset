# inference-optimization/Qwen3-30B-A3B-Thinking-2507-REAP-25-nonuniform

## Resumen

Esta ficha describe `inference-optimization/Qwen3-30B-A3B-Thinking-2507-REAP-25-nonuniform`, una variante podada del modelo de razonamiento Qwen3-30B-A3B-Thinking-2507 de Alibaba Qwen. El modelo base es un transformer causal decoder-only con arquitectura de mezcla de expertos (MoE) de 30,5B parametros totales y 3,3B activos, disenado especificamente para razonamiento en modo "thinking" con cadenas de pensamiento largas. Esta version concreta aplica una poda del 25 % de expertos mediante el metodo REAP (poda no uniforme por capa), reduciendo el numero de parametros totales a 23.281.219.584 (23,28B) segun los metadatos de safetensors.

El problema que resuelve esta variante es el coste de despliegue: al eliminar aproximadamente una cuarta parte de los expertos, reduce el peso en memoria y el coste de inferencia del modelo original manteniendo (segun el autor, sin datos publicados de evaluacion de esta version) la mayor parte de la capacidad de razonamiento. Es relevante para equipos que quieren servir un modelo de razonamiento MoE en hardware mas modesto que el exigido por la version completa de 30,5B.

Nota importante de trazabilidad: la model card del repositorio reproduce integramente la tarjeta del modelo base Qwen3-30B-A3B-Thinking-2507 y no documenta especificamente el proceso de poda REAP, el numero exacto de expertos resultante ni benchmarks de la version podada. Todos los datos de rendimiento que se muestran mas abajo corresponden al modelo base, no a esta variante.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal decoder-only con mezcla de expertos (MoE) y GQA; 48 capas; el modelo base usa 128 expertos con 8 activados por token, y esta variante aplica poda REAP no uniforme del 25 % |
| Parametros totales | 23.281.219.584 (23,28B) segun safetensors de esta variante; el modelo base declara 30,5B |
| Parametros activos | No disponible para esta variante; el modelo base activa 3,3B por token |
| Longitud de contexto | 262.144 tokens nativo (heredado del modelo base) |
| Tipos de cuantizacion | No disponible; el tag `compressed-tensors` sugiere artefactos comprimidos/cuantizados, pero no se especifican formatos |
| Idiomas soportados | No disponible; el modelo base es multilingue (evaluado en MultiIF, MMLU-ProX, INCLUDE, PolyMATH) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (tag `safetensors`); tamano de repo 93,1 GB |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del Qwen3-30B-A3B-Thinking-2507: transformer causal decoder-only con capas de atencion con grouped-query attention (32 cabezas para Q y 4 para KV) y capas feed-forward de mezcla de expertos. El modelo base tiene 48 capas y 128 expertos, de los cuales activa 8 por token, lo que da 3,3B parametros activos sobre 30,5B totales (29,9B sin contar embeddings). Esta variante aplica el metodo de poda REAP con una tasa del 25 % y un patron no uniforme, es decir, el numero de expertos eliminados varia por capa en lugar de ser un porcentaje fijo en todas ellas. El resultado es un modelo de 23,28B parametros totales, segun los metadatos de safetensors del repositorio.

Respecto al entrenamiento del modelo base, la model card indica dos etapas (pretraining y post-training) y una actualizacion orientada especificamente a reforzar el razonamiento: mayor calidad y profundidad de las cadenas de pensamiento, mejoras en seguimiento de instrucciones, uso de herramientas y comprension de contexto largo hasta 256K. El modelo opera exclusivamente en modo thinking: la plantilla de chat incluye automaticamente la etiqueta de apertura de pensamiento, por lo que las salidas pueden contener solo la etiqueta de cierre. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si se uso RLHF/DPO. La model card enlaza cinco articulos de arXiv (2402.17463, 2407.02490, 2501.15383, 2404.06654 y 2505.09388) como referencias tecnicas, sin detallar su contenido.

## Capacidades

- Razonamiento complejo en modo thinking: logica, matematicas, ciencia y tareas academicas que requieren pericia humana, con cadenas de pensamiento largas.
- Generacion de codigo: el modelo base obtiene 66,0 en LiveCodeBench v6 y 2044 en CFEval.
- Generacion de texto y escritura creativa, con resultados altos en WritingBench y Arena-Hard v2 en el modelo base.
- Soporte de tool calling / function calling: el modelo base obtiene 72,4 en BFCL-v3.
- Capacidades de agente y razonamiento multi-paso, evaluadas en las suites TAU1 y TAU2 (retail, airline, telecom).
- Comprension de contexto largo: 262.144 tokens nativos, con mejoras explicitas en comprension de 256K.
- Capacidades multilingues en el modelo base (MMLU-ProX, MultiIF, INCLUDE, PolyMATH).
- Idiomas concretos soportados por esta variante: no disponible.

## Casos de uso

- Razonamiento matematico avanzado: resolución de problemas de competicion y demostraciones paso a paso, aprovechando la cadena de pensamiento larga del modelo base (85,0 en AIME25). Adecuado para asistentes de investigacion y tutoria matematica.
- Generacion y revision de codigo en produccion: integrable en pipelines de CI/CD como revisor de pull requests o generador de pruebas, dado el soporte de tool calling y los resultados en LiveCodeBench y CFEval.
- Agentes autonomos con uso de herramientas: orquestacion de tareas multi-paso que requieren llamadas a APIs y sistemas externos, apoyandose en las puntuaciones de BFCL-v3 y TAU.
- Analisis de documentos extensos: resumen, extraccion y razonamiento sobre contratos, informes tecnicos o articulos cientificos de hasta 262.144 tokens, gracias a la ventana de contexto nativa.
- Asistencia cientifica y tecnica: respuesta a preguntas de nivel experto en dominios como fisica, quimica o biologia (GPQA, SuperGPQA), util en herramientas de soporte a la investigacion.
- Atencion al cliente automatizada compleja: gestion de conversaciones multi-turno con historial largo y requisitos de razonamiento, integrable via endpoint compatible con OpenAI (vLLM o SGLang).
- Generacion de contenido tecnico y divulgativo: redaccion de documentacion, articulos o material de formacion con control de estilo, apoyandose en los resultados de WritingBench y Creative Writing.
- Despliegue en hardware limitado: al reducir los parametros totales un 25 % respecto al base, esta variante permite servir un modelo de razonamiento MoE en GPUs con menos memoria o con cuantizacion mas agresiva.

## Benchmarks y rendimiento

Advertencia: la model card del repositorio reproduce la tabla de rendimiento del modelo base Qwen3-30B-A3B-Thinking-2507. No se han publicado resultados de benchmarks especificos de esta variante podada (REAP-25-nonuniform) en la informacion disponible. La tabla siguiente debe interpretarse como referencia del modelo original, no de esta version.

| Benchmark | Gemini 2.5 Flash Thinking | Qwen3-235B-A22B Thinking | Qwen3-30B-A3B Thinking | Qwen3-30B-A3B-Thinking-2507 |
|---|---|---|---|---|
| MMLU-Pro | 81,9 | 82,8 | 78,5 | 80,9 |
| MMLU-Redux | 92,1 | 92,7 | 89,5 | 91,4 |
| GPQA | 82,8 | 71,1 | 65,8 | 73,4 |
| SuperGPQA | 57,8 | 60,7 | 51,8 | 56,8 |
| AIME25 | 72,0 | 81,5 | 70,9 | 85,0 |
| HMMT25 | 64,2 | 62,5 | 49,8 | 71,4 |
| LiveBench 20241125 | 74,3 | 77,1 | 74,3 | 76,8 |
| LiveCodeBench v6 (25.02-25.05) | 61,2 | 55,7 | 57,4 | 66,0 |
| CFEval | 1995 | 2056 | 1940 | 2044 |
| OJBench | 23,5 | 25,6 | 20,7 | 25,1 |
| IFEval | 89,8 | 83,4 | 86,5 | 88,9 |
| Arena-Hard v2 | 56,7 | 61,5 | 36,3 | 56,0 |
| Creative Writing v3 | 85,0 | 84,6 | 79,1 | 84,4 |
| WritingBench | 83,9 | 80,3 | 77,0 | 85,0 |
| BFCL-v3 | 68,6 | 70,8 | 69,1 | 72,4 |
| TAU1-Retail | 65,2 | 54,8 | 61,7 | 67,8 |
| TAU1-Airline | 54,0 | 26,0 | 32,0 | 48,0 |
| TAU2-Retail | 66,7 | 40,4 | 34,2 | 58,8 |
| TAU2-Airline | 52,0 | 30,0 | 36,0 | 58,0 |
| TAU2-Telecom | 31,6 | 21,9 | 22,8 | 26,3 |
| MultiIF | 74,4 | 71,9 | 72,2 | 76,4 |
| MMLU-ProX | 80,2 | 80,0 | 73,1 | 76,4 |
| INCLUDE | 83,9 | 78,7 | 71,9 | 74,4 |
| PolyMATH | 49,8 | 54,7 | 46,1 | 52,6 |

Notas de la model card: en tareas muy exigentes (PolyMATH y todas las de razonamiento y codigo) se uso una longitud de salida de 81.920 tokens; en el resto, 32.768. Los valores de Arena-Hard v2 corresponden a win rates evaluados con GPT-4.1.

## Requisitos de hardware

- VRAM estimada para pesos (esta variante, 23,28B parametros totales): bf16/fp16 ~46,6 GB; int8/fp8 ~23,3 GB; int4 ~11,7 GB. Son estimaciones a partir del recuento de parametros; el repositorio ocupa 93,1 GB, coherente con pesos en mayor precision o con varios artefactos incluidos.
- Memoria adicional para KV cache: con contexto nativo de 262.144 tokens y atencion GQA, la cache de clave/valor puede alcanzar decenas de GB en precision bf16 si se llena la ventana completa. Con contextos cortos el consumo es mucho menor.
- GPU recomendadas para bf16: una A100 80 GB o H100 80 GB permiten alojar los pesos del modelo base con margen limitado; para esta variante podada el margen es mayor. Multi-GPU (2x A100 80 GB o similar) es lo aconsejable para contextos largos.
- Cabe en GPU de consumo: en cuantizacion int4 los ~11,7 GB de pesos podrian caber en una RTX 4090 (24 GB) o RTX 3090 (24 GB), con contexto reducido y dependiendo del soporte de cuantizacion; en bf16 no cabe en una sola GPU de consumo.
- Opciones de despliegue: la model card del base recomienda transformers >= 4.51, vLLM >= 0.8.5 y SGLang >= 0.4.6.post1 para exponer un endpoint compatible con OpenAI. No se confirma soporte de llama.cpp, Ollama, TGI ni artefactos GGUF para esta variante podada.
- Latencia y throughput: no disponible. Al ser un MoE, el coste por token depende de los parametros activos, no de los totales, pero no se publican cifras para esta variante.

## Comparativa con modelos similares

Los datos de rendimiento de esta variante podada no estan publicados, por lo que la comparacion se limita a caracteristicas estructurales frente al modelo base del que deriva.

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Benchmark publicado |
|---|---|---|---|---|---|
| Qwen3-30B-A3B-Thinking-2507-REAP-25-nonuniform (esta variante) | 23,28B | No disponible | 262.144 | apache-2.0 | No disponible |
| Qwen3-30B-A3B-Thinking-2507 (base) | 30,5B (29,9B sin embeddings) | 3,3B | 262.144 | apache-2.0 | Si (tabla anterior) |
| Qwen3-235B-A22B-Thinking | 235B | 22B | No disponible en la informacion | apache-2.0 (segun modelo base Qwen3) | Si (tabla anterior) |

No se dispone de datos para confirmar la degradacion exacta de rendimiento causada por la poda del 25 % en esta variante concreta.

## Limitaciones y advertencias

- No se han publicado benchmarks ni evaluaciones de esta variante podada: el impacto real de la poda REAP del 25 % sobre razonamiento, codigo y agentes es desconocido a partir de la informacion disponible.
- La model card del repositorio es una copia de la del modelo base y no documenta el proceso de poda, el numero exacto de expertos por capa ni los artefactos generados.
- Modelo exclusivamente en modo thinking: no soporta modo sin razonamiento, y las respuestas incluyen cadenas de pensamiento largas, lo que incrementa latencia y coste de tokens de salida (la model card recomienda hasta 81.920 tokens de salida en tareas dificiles).
- Riesgo de alucinacion: no se documenta de forma especifica en la informacion disponible, pero es un riesgo inherente a los modelos generativos de este tamano.
- Sesgos conocidos: no disponibles.
- Limitaciones de idioma: los idiomas concretos soportados por esta variante no estan especificados; los datos multilingues de la tabla corresponden al modelo base.
- Licencia apache-2.0 heredada del modelo base, que en principio permite uso comercial, pero conviene verificar los terminos exactos del modelo original enlazados en la model card antes de desplegarlo en produccion.
- El repositorio tiene 0 descargas y 0 "likes", y su fecha de creacion figura como 2026-09-29: es un artefacto sin validacion comunitaria ni historial de uso en produccion.
- No se confirma soporte de cuantizacion GGUF ni de runtimes tipo llama.cpp/Ollama para esta variante.
- El tag `compressed-tensors` sugiere artefactos comprimidos, pero no se detalla que esquema de compresion o cuantizacion se ha aplicado, lo que puede afectar a la compatibilidad con distintos motores de inferencia.

## Enlaces

- Repositorio HuggingFace de esta variante: https://huggingface.co/inference-optimization/Qwen3-30B-A3B-Thinking-2507-REAP-25-nonuniform
- Modelo base en HuggingFace: https://huggingface.co/Qwen/Qwen3-30B-A3B-Thinking-2507
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3-30B-A3B-Thinking-2507/blob/main/LICENSE
- Blog de Qwen3: https://qwenlm.github.io/blog/qwen3/
- Repositorio GitHub de Qwen3: https://github.com/QwenLM/Qwen3
- Documentacion de Qwen: https://qwen.readthedocs.io/en/latest/
- Chat de Qwen: https://chat.qwen.ai/
- Referencias de arXiv citadas en los tags del modelo: https://arxiv.org/abs/2402.17463 , https://arxiv.org/abs/2407.02490 , https://arxiv.org/abs/2501.15383 , https://arxiv.org/abs/2404.06654 , https://arxiv.org/abs/2505.09388

Nota: la busqueda web realizada no devolvio resultados tecnicos relevantes sobre este modelo (unicamente definiciones genericas del termino "inference"), por lo que no se incluyen como enlaces utiles.
