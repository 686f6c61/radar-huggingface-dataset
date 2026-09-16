# sanchitpandey/qwen3-4b-northwind10k-compositional-sft-gguf

## Resumen

`sanchitpandey/qwen3-4b-northwind10k-compositional-sft-gguf` es un ajuste fino (SFT) del modelo base Qwen3-4B, distribuido exclusivamente en formato GGUF para su uso con llama.cpp y herramientas compatibles. Lo publica el usuario de HuggingFace sanchitpandey y se ha generado con el flujo de trabajo de Unsloth, que según la propia model card permitió entrenar "2x más rápido". El repositorio contiene tres cuantizaciones (Q4_K_M, Q5_K_M y Q8_0) del modelo fusionado, con un total de 4.022.468.096 parámetros y un tamaño de repositorio de 9,7 GB.

El problema que aborda es acotado: el nombre del modelo apunta a un ajuste sobre un conjunto de datos denominado "northwind10k", presumiblemente relacionado con el esquema de base de datos Northwind y con 10.000 ejemplos, orientado a generalización composicional ("compositional"). La model card, sin embargo, no describe el dataset, el procedimiento de entrenamiento, la licencia ni los idiomas soportados, por lo que cualquier afirmación sobre su comportamiento más allá de lo anterior es una inferencia no verificada.

Su relevancia práctica es limitada pero concreta: es un modelo pequeño (4 B) cuantizado que cabe en GPUs de consumo, ejecutable en local con llama.cpp mediante `llama-cli` y compatible con la API de endpoints, lo que lo hace útil para experimentos de ajuste sobre dominios estrechos (por ejemplo, SQL) sin depender de infraestructura en la nube. Conviene subrayar que el repositorio no tiene descargas ni valoraciones y no se han publicado resultados de evaluación, por lo que debe tratarse como un artefacto experimental no validado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, familia Qwen3 (detalle no especificado en la model card) |
| Parámetros totales | 4.022.468.096 (≈4,02 B) |
| Parámetros activos | No aplica (no se indica que sea MoE) |
| Longitud de contexto | No disponible (no declarada en la model card; depende del modelo base Qwen3-4B) |
| Tipos de cuantización | GGUF: Q4_K_M, Q5_K_M, Q8_0 |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | GGUF (los tres ficheros publicados); el modelo fusionado previo a la conversión no se distribuye en safetensors en este repositorio |
| Etiquetas declaradas | gguf, qwen3, llama.cpp, unsloth, endpoints_compatible, conversational |
| Ficheros publicados | `qwen3-4b-northwind10k-compositional-sft-merged.Q4_K_M.gguf`, `...Q5_K_M.gguf`, `...Q8_0.gguf` |
| Tamaño del repositorio | 9,7 GB |

## Arquitectura y entrenamiento

La model card no documenta la arquitectura interna del modelo. Por el identificador y el recuento de parámetros (4.022.468.096), se trata de un derivado de Qwen3-4B, un transformer decoder-only de la familia Qwen3. No hay información en el repositorio sobre número de capas, dimensión oculta, número de cabezas de atención, uso de atención lineal o híbrida, ni sobre mecanismos de decodificación especulativa. Tampoco se publica la configuración de tokenizador ni la ventana de contexto efectiva tras el ajuste.

Respecto al entrenamiento, lo único verificable es que se realizó un ajuste supervisado (SFT) y que la conversión a GGUF se hizo con Unsloth. El nombre del modelo sugiere un dataset de 10.000 ejemplos vinculado a "Northwind" (esquema de base de datos de ejemplo ampliamente usado en materiales de SQL) y un objetivo de generalización composicional, pero la model card no confirma la composición del dataset, el número de tokens vistos, la existencia de etapas de RLHF o DPO, ni hiperparámetros de entrenamiento. No se documentan innovaciones técnicas propias: el valor diferencial declarado es únicamente la velocidad de entrenamiento de Unsloth.

## Capacidades

- Generación de texto conversacional: la etiqueta `conversational` indica que el ajuste se orientó a formato de diálogo.
- Ejecución local mediante llama.cpp: soporta `llama-cli -hf sanchitpandey/qwen3-4b-northwind10k-compositional-sft-gguf --jinja`, lo que implica compatibilidad con plantillas de chat Jinja.
- Compatibilidad con la API de endpoints (`endpoints_compatible`), pensada para despliegues tipo servidor compatible con OpenAI.
- Presunta especialización en tareas sobre el esquema Northwind y en composición de operaciones (consultas, transformaciones), según el nombre del repositorio; no verificada.
- Capacidades heredadas del modelo base Qwen3-4B (razonamiento, código, matemáticas, multilingüismo, tool calling, modo "thinking"): no se pueden dar por garantizadas, ya que el ajuste SFT puede haber degradado o alterado estos comportamientos y la model card no aporta ninguna evaluación al respecto.
- Soporte multimodal: la model card menciona el comando `llama-mtmd-cli` como plantilla genérica de Unsloth, lo que no implica que este modelo concreto tenga capacidades de visión; el recuento de parámetros y las etiquetas no lo respaldan.

## Casos de uso

- Text-to-SQL sobre esquemas tipo Northwind: dado que el ajuste parece entrenado sobre 10.000 ejemplos de ese dominio, el uso más directo es traducir preguntas en lenguaje natural a consultas SQL contra tablas como `Orders`, `Customers` o `Products`. Requiere validación manual, ya que no hay métricas publicadas de exactitud de ejecución.
- Agente local con tool calling: al ser compatible con llama.cpp y con endpoints, puede integrarse como motor de decisión en agentes que llamen a funciones externas (consultas a bases de datos, APIs REST) en un bucle multi-paso, aceptando el riesgo de que la plantilla de herramientas de Qwen3 se haya visto alterada por el SFT.
- Asistente de documentación técnica en local: desplegado con Ollama o llama.cpp sobre una estación de trabajo con GPU de consumo, permite resumir y reescribir documentación interna sin enviar datos a servicios externos, un requisito habitual en entornos regulados.
- Extracción de datos estructurados: generación de JSON con esquema fijo a partir de texto libre (extracción de entidades de pedidos, facturas o fichas de producto), usando la cuantización Q5_K_M como compromiso entre calidad y memoria.
- Prototipado de pipelines de ajuste fino: sirve como referencia reproducible de un flujo Unsloth → merge → GGUF, útil para equipos que quieran replicar el proceso con sus propios datos y comparar contra esta línea base.
- Generación y revisión de consultas en herramientas de BI: integración como asistente que propone consultas analíticas y las explica paso a paso a analistas no técnicos, con revisión humana obligatoria antes de ejecutar sobre producción.
- Chatbot de atención al cliente on-premise: viable por el tamaño y el formato cuantizado, pero solo si antes se realiza una evaluación propia de calidad y de sesgos, dado que no existe ningún benchmark publicado.
- Fine-tuning adicional o destilación: al estar ya en GGUF, es más adecuado como modelo de inferencia que como punto de partida para nuevo entrenamiento; para esto último habría que recuperar los pesos en safetensors, que no se distribuyen en este repositorio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K, evaluación de SQL (por ejemplo, Spider o BIRD) ni comparaciones con el modelo base Qwen3-4B, por lo que se desconoce si el ajuste SFT ha mejorado o degradado las capacidades originales.

## Requisitos de hardware

- VRAM estimada para los pesos (cálculo a partir del recuento de parámetros, no confirmado por el autor):
  - Q4_K_M: aproximadamente 2,4-2,8 GB.
  - Q5_K_M: aproximadamente 2,8-3,1 GB.
  - Q8_0: aproximadamente 4,3 GB.
- Sumar a esas cifras la caché KV, que crece con la longitud de contexto configurada; con contextos de varias decenas de miles de tokens el consumo adicional puede ser de varios GB.
- Cabe en GPUs de consumo: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090, así como en equipos Apple Silicon con memoria unificada de 8 GB o superior (Q4_K_M en 8 GB es ajustado).
- GPUs profesionales (A100, H100) no son necesarias para un modelo de 4 B, aunque permitirían lotes grandes y mayor concurrencia.
- Despliegue: llama.cpp (`llama-cli`, `llama-server`), Ollama, LM Studio y cualquier runtime compatible con GGUF. Para vLLM o TGI sería necesario convertir los pesos a safetensors o usar soporte GGUF experimental, no documentado aquí.
- Latencia y throughput estimados: no disponibles. No hay ninguna medición publicada de tokens por segundo.

## Comparativa con modelos similares

Los datos del modelo base y de los alternativas corresponden a su documentación pública y no han sido verificados en el contexto de este ajuste concreto; los del modelo evaluado son los únicos confirmados en este repositorio.

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| qwen3-4b-northwind10k-compositional-sft-gguf | 4,02 B | No disponible | No disponible | GGUF (Q4_K_M, Q5_K_M, Q8_0) | Ajuste SFT sobre Qwen3-4B, sin benchmarks, 0 descargas |
| Qwen3-4B (base/instruct) | 4,02 B | No confirmado en esta ficha | No confirmado en esta ficha | safetensors, GGUF oficial | Referencia directa del ajuste |
| Llama 3.2 3B Instruct | ≈3,2 B | No confirmado en esta ficha | Llama 3.2 Community License | safetensors, GGUF | Alternativa de tamaño similar con ecosistema consolidado |
| Gemma 3 4B IT | ≈4 B | No confirmado en esta ficha | Términos de uso de Gemma | safetensors, GGUF | Alternativa multimodal de tamaño similar |
| Phi-4-mini | ≈3,8 B | No confirmado en esta ficha | MIT | safetensors | Alternativa orientada a razonamiento |

La comparación de rendimiento no es posible: no existen métricas publicadas para este ajuste.

## Limitaciones y advertencias

- Ausencia total de evaluación: no hay benchmarks, ni evaluación humana, ni comparación con el modelo base, por lo que no se puede afirmar que el ajuste mejore nada.
- Licencia no declarada: al no especificarse licencia en el repositorio, el uso comercial queda en un limbo legal. La licencia del modelo base Qwen3-4B no se hereda automáticamente de forma explícita en este repositorio y debería confirmarse con el autor antes de cualquier despliegue productivo.
- Riesgo de olvido catastrófico: un SFT sobre un dominio estrecho (presumiblemente SQL/Northwind) puede degradar capacidades generales como el razonamiento abierto, el código o el multilingüismo del modelo original.
- Riesgo de alucinación: como cualquier modelo de 4 B, puede generar consultas SQL sintácticamente válidas pero semánticamente incorrectas, o inventar columnas y tablas inexistentes. No debe ejecutarse SQL generado contra bases de datos de producción sin revisión.
- Sesgos: no se documenta ninguna fase de alineación (RLHF/DPO) ni filtrado del dataset, por lo que se desconocen los sesgos presentes. Un ajuste conversacional sin alineación posterior puede reproducir estereotipos del corpus de entrenamiento.
- Idiomas: no declarados. Es probable que el ajuste haya concentrado el modelo en el idioma dominante del dataset (presumiblemente inglés), reduciendo su competencia en castellano u otros idiomas.
- Contexto: la longitud de contexto efectiva no está documentada; usar ventanas largas sin verificar puede producir degradación silenciosa.
- Validación de la comunidad inexistente: 0 descargas y 0 valoraciones en el momento de la consulta, sin issues ni discusiones que permitan contrastar el comportamiento real.
- Procedencia opaca: el autor no publica el dataset, ni los hiperparámetros, ni la receta de entrenamiento, lo que impide reproducir el resultado o auditar los datos utilizados.
- Uso en producción: no recomendado sin una evaluación propia sobre el caso de uso concreto.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/sanchitpandey/qwen3-4b-northwind10k-compositional-sft-gguf
- Unsloth: https://github.com/unslothai/unsloth
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Informe técnico de Qwen3 (referencia del modelo base, no citado en el repositorio): https://arxiv.org/abs/2505.09388
- Repositorio de Qwen3 de Alibaba: https://github.com/QwenLM/Qwen3
- Modelo base Qwen3-4B en HuggingFace: https://huggingface.co/Qwen/Qwen3-4B
- Demos o artículos específicos de este ajuste: no disponible
