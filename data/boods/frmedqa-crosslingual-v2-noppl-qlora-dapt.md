# boods/FrMedQA-CrossLingual-v2-NoPPL-qlora-DAPT

## Resumen

Este modelo es un ajuste fino publicado por el usuario boods bajo el identificador `boods/FrMedQA-CrossLingual-v2-NoPPL-qlora-DAPT`. Se trata de un derivado del modelo base `unsloth/qwen3-14b-unsloth-bnb-4bit`, es decir, una variante de Qwen3 de aproximadamente 14.000 millones de parametros distribuida por Unsloth en cuantizacion de 4 bits (bitsandbytes). Segun los metadatos, el ajuste se realizo con QLoRA y la etiqueta del nombre sugiere un entrenamiento de adaptacion de dominio (DAPT) sobre el conjunto FrMedQA, orientado a preguntas y respuestas medicas con transferencia entre idiomas.

El repositorio ocupa unicamente 0,5 GB, un tamano coherente con un conjunto de adaptadores LoRA y no con los pesos completos de un modelo de 14B (que en FP16 rondarian los 28 GB), por lo que es previsible que requiera cargar el modelo base para su uso. La model card es practicamente un volcado automatico de la plantilla de Unsloth: no documenta la composicion del dataset, el numero de tokens de entrenamiento, la metodologia de evaluacion ni resultados de benchmarks.

Su relevancia actual es acotada y de caracter metodologico: sirve como ejemplo reproducible de un flujo de trabajo QLoRA + DAPT sobre un modelo denso de 14B con licencia Apache-2.0, un patron cada vez mas habitual para adaptar modelos generalistas a dominios tecnicos (en este caso, el biomedico) con recursos de computo limitados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de la familia Qwen3; no detallada en la model card) |
| Parametros totales | Aproximadamente 14.000 millones (segun el nombre del modelo base `qwen3-14b`); no confirmado en la ficha del autor |
| Parametros activos | no disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Modelo base publicado en bnb-4bit; formatos disponibles para este ajuste: no disponible |
| Idiomas soportados | en (unico idioma declarado en los metadatos) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Metodo de ajuste | QLoRA (adaptadores de bajo rango sobre base cuantizada en 4 bits) |
| Tecnica declarada | Unsloth (entrenamiento "2x mas rapido" segun la model card) y TRL |
| Modelo base | unsloth/qwen3-14b-unsloth-bnb-4bit |
| Tamano del repositorio | 0,5 GB |
| Libreria | transformers |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-09-26 (segun metadatos de HuggingFace) |

## Arquitectura y entrenamiento

La model card no aporta informacion sobre la arquitectura interna mas alla del modelo base. Dado que el punto de partida es `unsloth/qwen3-14b-unsloth-bnb-4bit`, se trata de un transformer decoder-only de la familia Qwen3, cuantizado en 4 bits con bitsandbytes y redistribuido por Unsloth para reducir el coste de memoria del ajuste fino. El autor no detalla numero de capas, dimensiones ocultas, tipo de atencion ni mecanismos de decodificacion.

Respecto al entrenamiento, la informacion disponible se limita a tres indicios: el sufijo `qlora` del identificador (ajuste con adaptadores de bajo rango sobre pesos cuantizados), el sufijo `DAPT` (probablemente *domain-adaptive pretraining* o adaptacion de dominio) y el prefijo `FrMedQA` (nombre que sugiere un corpus de preguntas y respuestas medicas en frances). El sufijo `NoPPL` podria indicar que no se empleo perplexity como criterio de entrenamiento o evaluacion, pero esto es una interpretacion del nombre y no un dato documentado. No se especifican tokens de entrenamiento, composicion del dataset, si hubo fases de RLHF, DPO o SFT supervisado, ni hiperparametros del ajuste. Tampoco se indica si los adaptadores se han fusionado con el modelo base.

## Capacidades

- Generacion de texto: capacidad heredada del modelo base Qwen3-14B; no verificada especificamente tras el ajuste.
- Dominio declarado (por el nombre del modelo): respuesta a preguntas de ambito medico y comportamiento cross-lingual (frances e ingles); no confirmado en la model card.
- Razonamiento y matematicas: presumiblemente heredados de Qwen3-14B, pero no documentados para este ajuste.
- Generacion de codigo: no documentada para este ajuste.
- Tool calling / function calling: no documentado; los tags incluyen `text-generation-inference` y `endpoints_compatible`, pero no hay confirmacion de soporte de herramientas.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: los metadatos declaran unicamente `en`; el nombre del modelo apunta a un componente en frances no reflejado en el campo `language`.
- Capacidad especial (modo thinking, vision, audio): no disponible.

## Casos de uso

- Investigacion en adaptacion de dominio (DAPT): el modelo sirve como punto de partida o referencia para reproducir experimentos de *domain-adaptive pretraining* sobre corpus medicos usando QLoRA en un modelo de 14B con una sola GPU de gama alta.
- Evaluacion de transferencia cross-lingual frances-ingles: dado el nombre FrMedQA y el idioma declarado `en`, es plausible utilizarlo para estudiar como un ajuste sobre datos medicos en frances afecta al rendimiento en ingles, aunque el autor no publica ninguna evaluacion al respecto.
- Generacion de conjuntos de preguntas-respuestas medicas para docencia: el modelo puede producir preguntas tipo test y respuestas razonadas sobre temario biomedico, siempre con revision humana obligatoria y sin uso clinico directo.
- Prototipado de asistentes de documentacion clinica: en entornos internos y no regulados, para resumir o reformular notas y articulos, aprovechando la licencia Apache-2.0 que permite uso comercial.
- Extraccion de entidades y relaciones en literatura biomedica: como componente de un pipeline de procesamiento de textos medicos, combinado con validacion por reglas o por un segundo modelo.
- Base para ajustes posteriores: al ser un adaptador LoRA de bajo coste, puede emplearse como inicializacion para tareas medicas mas especificas (clasificacion de especialidades, triaje de consultas) con presupuestos reducidos.
- Experimentos academicos de eficiencia de ajuste: comparar QLoRA frente a ajuste completo en tareas de dominio sanitario, usando el repositorio como uno de los brazos del estudio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de MMLU, MedQA, MedMCQA, GSM8K, HumanEval ni de ningun otro conjunto de evaluacion, ni comparaciones con el modelo base sin ajustar.

## Requisitos de hardware

Las siguientes cifras son estimaciones derivadas del tamano de parametros (~14B) y de la cuantizacion, no datos publicados por el autor:

- VRAM para pesos en 4 bits: aproximadamente 8-10 GB, mas el *overhead* de la cache KV, que crece con la longitud de contexto.
- VRAM para pesos en FP16/BF16: aproximadamente 28 GB.
- VRAM para pesos en FP8: aproximadamente 14-15 GB.
- VRAM para pesos en FP32: aproximadamente 56 GB.
- GPU de gama de consumo: un modelo de 14B en 4 bits puede caber en tarjetas de 12 GB o mas (RTX 3060 12 GB, RTX 4070 Ti, RTX 4080, RTX 4090), con contextos cortos y cuantizacion agresiva.
- GPU profesionales: A100 40/80 GB, H100, L40S para FP16 o para servir con contextos largos y lotes grandes.
- Multi-GPU: en FP16 son necesarias dos o mas GPU (por ejemplo, 2x RTX 4090) con paralelismo de tensor.
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference (tag presente), vLLM para servicio de alto rendimiento, llama.cpp u Ollama previa conversion a GGUF, y plataformas compatibles con `endpoints_compatible`.
- Necesidad del modelo base: por el tamano de 0,5 GB del repositorio, es probable que sea necesario descargar `unsloth/qwen3-14b-unsloth-bnb-4bit` y cargar los adaptadores por separado.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| boods/FrMedQA-CrossLingual-v2-NoPPL-qlora-DAPT | ~14B (heredados del base) | no disponible | no disponible | Apache-2.0 | Publicado en HuggingFace, 0 descargas, 0 likes |
| unsloth/qwen3-14b-unsloth-bnb-4bit (base) | ~14B | no disponible | no disponible | Apache-2.0 (heredada) | Modelo base publico de Unsloth |
| Qwen3-14B (modelo oficial de referencia de la familia) | ~14B | no disponible en esta busqueda | no disponible | Apache-2.0 | Publico |

No se dispone de datos de rendimiento del modelo ajustado ni de comparaciones controladas con alternativas de la misma categoria (por ejemplo, otros ajustes medicos de ~7B-14B). Cualquier comparacion cuantitativa requeriria evaluar los modelos sobre el mismo conjunto de validacion, algo que el autor no ha documentado.

## Limitaciones y advertencias

- Ausencia total de evaluacion: no hay benchmarks, ni validacion cualitativa, ni ejemplos de uso en la model card.
- Riesgo elevado de alucinacion en contenido medico: el modelo deriva de un generalista ajustado con datos no documentados; no debe emplearse para diagnostico, triaje clinico ni recomendaciones terapeuticas sin supervision profesional y validacion regulatoria.
- Discrepancia de idioma: los metadatos declaran unicamente `en`, mientras que el nombre del modelo hace referencia a datos medicos en frances (FrMedQA). No se especifica el comportamiento real en frances.
- Documentacion inexistente del entrenamiento: no constan tokens, composicion del dataset, hiperparametros, ni fases de alineacion (RLHF/DPO).
- Posible repositorio de solo adaptadores: con 0,5 GB, es probable que no contenga pesos completos, lo que obliga a depender del modelo base y de su version exacta.
- Fechas de metadatos anomalas: la creacion y la actualizacion figuran como 2026-09-26, lo que puede indicar un error de plataforma o de registro; conviene verificarlo.
- Licencia: Apache-2.0 permite uso comercial, pero no exime del cumplimiento de normativas sectoriales (por ejemplo, proteccion de datos de salud o marcado CE para software medico).
- Trazabilidad limitada del autor del ajuste: no hay informacion sobre quien lo ha publicado, con que proposito ni con que financiacion.
- Sin senales de adopcion: 0 descargas y 0 likes implican que no existe una comunidad que haya validado el modelo en produccion.
- Sesgos: no se han documentado analisis de sesgos; los sesgos del corpus medico de origen y del modelo base Qwen3 no han sido auditados en este ajuste.
- Idoneidad para produccion: baja sin evaluacion adicional; se recomienda tratarlo como artefacto de investigacion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/boods/FrMedQA-CrossLingual-v2-NoPPL-qlora-DAPT
- Modelo base: https://huggingface.co/unsloth/qwen3-14b-unsloth-bnb-4bit
- Repositorio de Unsloth (herramienta de entrenamiento citada en la model card): https://github.com/unslothai/unsloth
- Paper, blog, demo o repositorio adicional del autor: no disponible
