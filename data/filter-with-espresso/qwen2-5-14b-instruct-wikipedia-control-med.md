# filter-with-espresso/Qwen2.5-14B-Instruct-wikipedia-control-med

## Resumen

Este repositorio no es un modelo completo, sino un adaptador LoRA de ajuste supervisado (SFT) publicado por el usuario `filter-with-espresso` sobre el modelo base `unsloth/Qwen2.5-14B-Instruct`. Se distribuye en formato PEFT (librería `peft`, versión 0.21.0) y su tamaño de repositorio es de 2,2 GB, lo que corresponde exclusivamente a los pesos del adaptador, no al modelo completo. El identificador del repositorio (`wikipedia-control-med`) sugiere un experimento de ajuste orientado a control estilístico o de dominio sobre contenido tipo Wikipedia y de ámbito médico, aunque la model card no documenta en ningún momento el objetivo, el dataset ni la metodología empleados.

La relevancia de esta ficha es limitada desde el punto de vista de producción: se trata de una publicación con 0 descargas y 0 likes, creada el 22 de septiembre de 2026, sin licencia declarada, sin idiomas declarados y con una model card que es la plantilla por defecto de HuggingFace con todos los campos marcados como `[More Information Needed]`. No hay datos de entrenamiento, hiperparámetros, evaluación ni instrucciones de uso.

Por tanto, cualquier evaluación debe partir del modelo base (Qwen2.5-14B-Instruct, un transformer denso decoder-only de 14,7 mil millones de parámetros con 32.768 tokens de contexto nativo) y tratar el adaptador como un artefacto experimental no documentado y no validado. La búsqueda web realizada no devolvió ninguna fuente relevante sobre este modelo (los resultados correspondían a la función `filter()` de JavaScript, a un catálogo de filtros industriales y a una banda de rock), por lo que toda la información técnica disponible proviene del repositorio de HuggingFace y de las especificaciones públicas del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador PEFT) sobre transformer denso decoder-only (modelo base Qwen2.5-14B-Instruct); no disponible el rango, alpha ni los modulos objetivo del adaptador |
| Parametros totales | No disponible para el adaptador; el modelo base tiene 14,7 mil millones de parametros (13,1 mil millones sin embeddings) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible para el adaptador; el modelo base soporta 32.768 tokens nativos y hasta 131.072 con RoPE escalado (YaRN) |
| Tipos de cuantizacion | El adaptador se publica en safetensors; la cuantizacion aplica al modelo base fusionado: GGUF (llama.cpp), AWQ, GPTQ, bitsandbytes (nf4/int8), FP8 |
| Idiomas soportados | No declarados en el repositorio; el modelo base declara soporte para 29 idiomas (entre ellos espanol, ingles, chino, frances, aleman, portugues, italiano, ruso, japones, coreano, arabe) |
| Licencia | No disponible en el repositorio del adaptador; el modelo base Qwen2.5-14B-Instruct se distribuye bajo Apache 2.0 |
| Formato de pesos | safetensors (adaptador LoRA/PEFT) |
| Libreria de carga | peft 0.21.0, transformers, trl, unsloth |
| Tamano del repositorio | 2,2 GB |
| Pipeline | text-generation |
| Fecha de creacion | 22 de septiembre de 2026 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El artefacto publicado es un adaptador LoRA entrenado mediante SFT (supervised fine-tuning) sobre el modelo base `unsloth/Qwen2.5-14B-Instruct`. Las etiquetas del repositorio (`lora`, `sft`, `trl`, `unsloth`, `peft`) indican que el entrenamiento se realizó con la librería TRL sobre la implementación optimizada de Unsloth. No se especifica el rango de la matriz de bajo rango, los módulos a los que se aplica (atención, MLP o ambos), el learning rate, el número de épocas, el tamaño efectivo de batch ni la precisión de entrenamiento. El tamaño del repositorio (2,2 GB) corresponde al conjunto de pesos del adaptador, lo que implica un número de parámetros entrenables muy superior al de un LoRA de rango bajo convencional sobre atención, pero no permite inferir la configuración exacta.

Respecto al modelo base, Qwen2.5-14B-Instruct es un transformer denso decoder-only con normalización RMSNorm, activación SwiGLU, embeddings rotatorios (RoPE) y atención con consultas agrupadas (GQA), con 48 capas y un vocabulario de 151.646 tokens. Qwen reporta que la familia Qwen2.5 fue preentrenada sobre 18 billones de tokens y que la variante Instruct incorpora un post-entrenamiento en dos fases (ajuste supervisado y optimización por preferencias). El adaptador aquí descrito no modifica esa arquitectura: añade matrices de bajo rango que se suman a los pesos congelados del base. No hay ninguna innovación técnica documentada por parte del autor del adaptador (no se mencionan decodificación especulativa, atención lineal ni variantes híbridas).

## Capacidades

- Generación de texto conversacional: hereda la capacidad del modelo base Qwen2.5-14B-Instruct, con soporte de diálogo multi-turno (chat template de Qwen).
- Razonamiento y matemáticas: el modelo base muestra buen desempeño en tareas de razonamiento aritmético y lógico, aunque no hay evaluación específica del adaptador.
- Generación de código: capacidad heredada del base, sin datos que confirmen mejora o degradación tras el ajuste.
- Tool calling / function calling: el modelo base Qwen2.5-Instruct soporta llamadas a funciones y formato JSON estructurado; no se ha verificado si el adaptador preserva esta capacidad.
- Capacidades de agente y razonamiento multi-paso: potencialmente heredadas del base; sin validación en el repositorio.
- Multilingüismo: el base declara 29 idiomas; el adaptador no declara ninguno.
- Capacidades especiales: no se documenta ningún modo de pensamiento explícito, visión ni audio. El nombre del repositorio sugiere un ajuste de control estilístico/dominio (Wikipedia, ámbito médico), pero esto es una inferencia a partir del nombre y no una capacidad confirmada.
- Riesgo relevante: no existe ninguna evaluación que confirme que el ajuste SFT no haya degradado capacidades del base (olvido catastrófico), especialmente si el dataset era pequeño o monolingüe.

## Casos de uso

- Experimentación en control estilístico: el adaptador puede fusionarse con el base para estudiar cómo un SFT acotado altera el registro de salida (por ejemplo, hacia un estilo enciclopédico). Es el uso más coherente con el nombre del repositorio, pero requiere validación propia.
- Reproducción de experimentos de ajuste: sirve como artefacto de referencia para comparar configuraciones de LoRA/SFT con Unsloth y TRL sobre un modelo de 14B.
- Prototipado de asistentes de dominio médico: solo como prueba de concepto y nunca en producción clínica, dado que no hay validación, ni licencia declarada, ni datos sobre el dataset sanitario empleado.
- Generación de resúmenes o reescritura de textos enciclopédicos: el modelo base ya cubre esta tarea con 32.768 tokens de contexto; el adaptador podría modificar el tono, pero no hay evidencia.
- Fine-tuning posterior (continued fine-tuning): el adaptador puede usarse como punto de partida para nuevos ajustes en lugar de partir del base, ahorrando cómputo si el dominio coincide.
- Investigación sobre seguridad y alineamiento: analizar si un ajuste SFT no documentado introduce sesgos, alucinaciones o fugas de datos del dataset de entrenamiento.
- Evaluación comparativa de adaptadores comunitarios: como caso de estudio de publicaciones sin model card, sin licencia y sin métricas, útil para discutir prácticas de publicación en HuggingFace.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del adaptador no contiene ninguna sección de evaluación cumplimentada (todos los campos aparecen como `[More Information Needed]`), y el repositorio no incluye cifras de MMLU, HumanEval, GSM8K ni de ninguna otra prueba. Las puntuaciones publicadas por Qwen para el modelo base no se reproducen aquí porque no forman parte de la información proporcionada para este repositorio, y no deben extrapolarse al adaptador sin una evaluación propia.

## Requisitos de hardware

- Inferencia con el modelo base en FP16/BF16: aproximadamente 29-30 GB de VRAM solo para pesos, más 2-6 GB para caché KV con 32.768 tokens de contexto; requiere una A100 40 GB, H100 80 GB o dos GPU de 24 GB con tensor parallelism.
- Inferencia en 8 bits: aproximadamente 15-16 GB de pesos; viable en una RTX 4090 (24 GB) o L40S con margen limitado para contextos largos.
- Inferencia en 4 bits (nf4/AWQ/GPTQ): aproximadamente 9-10 GB de pesos; cabe en RTX 4090, RTX 3090, RTX 4080 (16 GB) y en GPUs de 12 GB solo con contextos reducidos.
- El adaptador añade 2,2 GB de pesos en el repositorio, que se cargan además del base o se fusionan en él; en carga PEFT la VRAM adicional es la del adaptador en la precisión usada.
- Despliegue: vLLM o TGI para servir el base fusionado a alta concurrencia; llama.cpp/Ollama con GGUF para CPU o GPU de gama media (requiere fusionar el adaptador y convertir a GGUF); transformers + peft para cargar el adaptador directamente sobre el base.
- Latencia y throughput: no disponibles. No hay ninguna medición publicada por el autor. Como referencia orientativa, un modelo denso de 14B en 4 bits sobre una RTX 4090 suele generar del orden de decenas de tokens por segundo, pero esta cifra es una estimación genérica y no una medición de este artefacto.
- Entrenamiento o ajuste adicional: un SFT con LoRA sobre 14B en BF16 requiere del orden de 40-60 GB de VRAM con optimizaciones (gradient checkpointing, 8-bit Adam); con Unsloth y cuantización 4-bit puede reducirse a 16-24 GB.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| filter-with-espresso/Qwen2.5-14B-Instruct-wikipedia-control-med | Adaptador LoRA sobre 14,7B (2,2 GB de pesos) | No disponible (base: 32.768) | Adaptador PEFT | No disponible (base: Apache 2.0) | HuggingFace, 0 descargas |
| Qwen2.5-14B-Instruct (modelo base) | 14,7B | 32.768 (131.072 con YaRN) | Modelo denso completo | Apache 2.0 | HuggingFace, ampliamente utilizado |
| Llama-3.1-8B-Instruct | 8B | 131.072 | Modelo denso completo | Llama 3.1 Community License | HuggingFace, muy extendido |
| Phi-4 | 14,7B | 16.000 | Modelo denso completo | MIT | HuggingFace |

No existe información pública sobre benchmarks del adaptador que permita compararlo en rendimiento con estas alternativas. La comparación se limita a parámetros, contexto, licencia y disponibilidad; en el caso del adaptador, su utilidad práctica depende de si aporta una mejora medible sobre el modelo base, algo que no está documentado. Otras alternativas de la misma categoría (adaptadores LoRA comunitarios sobre Qwen2.5) no se comparan por falta de datos en la información proporcionada.

## Limitaciones y advertencias

- Ausencia total de documentación: la model card es la plantilla por defecto sin cumplimentar; no se especifican desarrollador, financiación, tipo de modelo, idiomas, licencia ni fuente de datos.
- Licencia no declarada: al no indicarse licencia en el repositorio del adaptador, no hay autorización explícita de uso comercial. Aunque el modelo base es Apache 2.0, el adaptador es una obra derivada cuya licencia no se ha hecho constar, lo que genera incertidumbre legal para producción.
- Riesgo de sesgos desconocido: al no documentarse el dataset de SFT, no puede evaluarse la presencia de sesgos demográficos, ideológicos o de dominio (especialmente relevante si el nombre del repositorio implica contenido médico).
- Riesgo de alucinación: el modelo base ya presenta alucinaciones; no hay evaluación que indique si el ajuste las mitiga o las agrava. En un contexto médico, esto es un riesgo crítico.
- Riesgo de olvido catastrófico: un SFT no documentado puede degradar capacidades del base (código, matemáticas, multilingüismo, tool calling) sin que existan métricas que lo detecten.
- Restricciones idiomáticas: el adaptador no declara idiomas; si el dataset de SFT era monolingüe, el rendimiento en castellano podría haberse deteriorado respecto al base.
- Trazabilidad nula: 0 descargas y 0 likes, sin paper, sin demo, sin repositorio de código y sin contacto del autor. No hay forma de verificar la procedencia de los pesos.
- Advertencia de producción: no se recomienda su uso en sistemas en producción, y menos en aplicaciones sanitarias, sin una evaluación propia exhaustiva, revisión de licencia y auditoría del adaptador.
- Sobre la búsqueda web: los resultados obtenidos no guardan relación con el modelo (documentación de `Array.prototype.filter()` de JavaScript, catálogo de filtros industriales y una banda musical), por lo que no aportan ninguna fuente verificable.

## Enlaces

- Repositorio del adaptador en HuggingFace: https://huggingface.co/filter-with-espresso/Qwen2.5-14B-Instruct-wikipedia-control-med
- Modelo base: https://huggingface.co/unsloth/Qwen2.5-14B-Instruct
- Modelo original de Qwen: https://huggingface.co/Qwen/Qwen2.5-14B-Instruct
- Librería PEFT: https://github.com/huggingface/peft
- Librería TRL: https://github.com/huggingface/trl
- Unsloth: https://github.com/unslothai/unsloth
- Referencia citada en la model card (calculadora de impacto ambiental): https://mlco2.github.io/impact
- Paper citado en la model card, Lacoste et al. (2019): https://arxiv.org/abs/1910.09700
- Búsqueda web realizada: sin resultados relevantes para este modelo (los enlaces devueltos correspondían a documentación de JavaScript, un catálogo de filtros industriales y una banda de rock).
