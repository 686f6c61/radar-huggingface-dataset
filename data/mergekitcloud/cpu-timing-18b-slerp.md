# MergekitCloud/cpu-timing-18b-slerp

## Resumen

cpu-timing-18b-slerp es un modelo de lenguaje obtenido mediante fusión de pesos (model merge), publicado por el usuario MergekitCloud en HuggingFace. No es un modelo entrenado desde cero: es el resultado de combinar dos modelos hermanos, vicgalle/solarized-18B-dpo y vicgalle/solarized-18B-truthy, aplicando el método SLERP con la herramienta mergekit. El repositorio declara arquitectura Llama, pipeline de text-generation y 17.929.236.480 parámetros contabilizados en safetensors, con un tamaño de repositorio de 35,9 GB en bfloat16.

El modelo aborda, en principio, el mismo problema que sus predecesores: generación de texto conversacional. Su interés es fundamentalmente metodológico, ya que ilustra cómo combinar dos variantes de ajuste (una orientada a preferencias tipo DPO y otra orientada a veracidad) mediante interpolación esférica capa a capa, sin coste adicional de entrenamiento.

Se publica con 0 descargas y 0 likes, sin licencia declarada, sin idiomas especificados y sin resultados de benchmarks. Por todo ello debe considerarse un artefacto experimental de investigación más que un modelo listo para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Llama (transformador decoder denso, según la etiqueta "llama" del repositorio) |
| Parámetros totales | 17.929.236.480 (~17,93 mil millones) |
| Parámetros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no especificados por el autor; al publicarse en safetensors bfloat16 es cuantizable a GGUF (Q2–Q8), GPTQ o AWQ con herramientas estándar |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (bfloat16) |
| Librería | transformers |
| Método de fusión | SLERP (mergekit) |
| Modelos base | vicgalle/solarized-18B-dpo, vicgalle/solarized-18B-truthy |
| Etiquetas relevantes | text-generation, conversational, text-generation-inference, endpoints_compatible |
| Fecha de creación | 2026-10-15 |

## Arquitectura y entrenamiento

El modelo es una fusión de dos checkpoints que comparten arquitectura, no un entrenamiento nuevo. La configuración YAML publicada por el autor especifica merge_method: slerp, base_model: vicgalle/solarized-18B-dpo y dtype: bfloat16. El parámetro de interpolación t no es constante: varía por tipo de capa y por profundidad. Para las capas de self_attn toma los valores [0, 0,5, 0,3, 0,7, 1] y para las capas mlp toma [1, 0,5, 0,7, 0,3, 0], quedando el valor por defecto en 0,5 para el resto.

Esto implica que la atención y el bloque MLP de una misma capa se mezclan con proporciones distintas entre los dos modelos base, y que esa proporción cambia a lo largo de la red: en self_attn la mezcla arranca favoreciendo al modelo dpo y termina favoreciendo al modelo truthy, mientras que en mlp ocurre lo contrario. Es una estrategia de mezcla selectiva, no una media uniforme de pesos.

No hay información sobre el número de tokens, la composición del dataset ni las etapas de alineación (RLHF, DPO u otras) de la fusión, porque esas etapas pertenecen a los modelos base y no se documentan en esta model card. Tampoco se documenta ninguna innovación adicional de inferencia (decodificación especulativa, atención lineal, etc.).

## Capacidades

- Generación de texto: etiquetas "text-generation" y pipeline text-generation confirman la tarea principal.
- Conversación multi-turno: la etiqueta "conversational" sugiere un uso orientado a diálogo, si bien no se detalla el formato de plantilla ni el chat template.
- Razonamiento y matemáticas: no documentado; depende de las capacidades heredadas de los modelos base.
- Generación de código: no documentado.
- Tool calling / function calling: no documentado.
- Uso como agente y razonamiento multi-paso: no documentado.
- Capacidades multilingües: no disponible (no se declaran idiomas).
- Modos especiales (thinking, visión, audio): no documentado.
- Compatibilidad de despliegue: etiquetas text-generation-inference y endpoints_compatible, orientadas a servir el modelo mediante TGI y endpoints HTTP.

## Casos de uso

- Investigación sobre fusión de modelos: sirve como caso de estudio reproducible de SLERP con máscaras distintas por capa (self_attn frente a mlp), ya que el YAML de configuración está publicado y permite replicar o modificar la mezcla.
- Evaluación comparativa de técnicas de merge: permite contrastar SLERP frente a otros métodos (TIES, DARE, linear) partiendo de los mismos dos modelos base y midiendo el efecto sobre la calidad conversacional.
- Base para fine-tuning posterior: al ser un checkpoint denso de ~18B en bfloat16, puede servir como punto de partida para ajuste supervisado o DPO en dominios concretos, siempre que se resuelva antes la licencia.
- Prototipado conversacional autoalojado: tras cuantizar a 4 bits, puede desplegarse en una GPU de consumo para demos de chat interno y pruebas de integración con TGI o vLLM.
- Sustitución de los modelos base en pipelines existentes: al compartir arquitectura y número de parámetros con los modelos de origen, es intercambiable en scripts de transformers sin cambios de tokenizador ni de código de carga.
- Generación de texto por lotes en local: mediante llama.cpp u Ollama y una cuantización GGUF, puede ejecutarse en hardware sin GPU para tareas de generación offline que no exijan baja latencia.
- Docencia y formación técnica: útil para explicar de forma práctica qué es una interpolación esférica de pesos y cómo afecta la mezcla por capas al comportamiento del modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

Las siguientes cifras son estimaciones derivadas del recuento real de parámetros (17,93B) y del tamaño del repositorio (35,9 GB en bfloat16); no proceden de mediciones publicadas por el autor.

- Inferencia en bfloat16/fp16: aproximadamente 36 GB solo para pesos, más caché KV. Requiere GPUs de 40-80 GB (A100 40GB muy ajustada, A100 80GB, H100 80GB) o reparto en múltiples GPUs (por ejemplo, 2x RTX 3090 o 2x RTX 4090).
- Inferencia en int8: en torno a 18 GB de VRAM; encaja en RTX 4090 (24 GB), RTX 3090 (24 GB), A6000 o L40S.
- Cuantización a 4 bits (Q4_K_M, GPTQ o AWQ): en torno a 10-11 GB; cabe en GPUs de consumo como RTX 3060 12GB, RTX 4070 o RTX 3080 Ti.
- Cuantización a 5-6 bits: en torno a 13-15 GB; requiere 16 GB o más (RTX 4080, RTX 4090).
- Cuantización a 8 bits (Q8): en torno a 19 GB; requiere 24 GB (RTX 3090, RTX 4090).
- Opciones de despliegue: transformers, text-generation-inference (etiqueta declarada), vLLM, llama.cpp y Ollama previa conversión a GGUF.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones completas de alternativas. La comparación más directa posible es con los dos modelos que se fusionaron para producirlo.

| Modelo | Parámetros | Contexto | Licencia | Naturaleza | Disponibilidad |
|---|---|---|---|---|---|
| cpu-timing-18b-slerp | 17,93B | no disponible | no disponible | fusión SLERP de dos checkpoints | HuggingFace, 0 descargas |
| vicgalle/solarized-18B-dpo | no disponible | no disponible | no disponible | modelo base ajustado con DPO | HuggingFace |
| vicgalle/solarized-18B-truthy | no disponible | no disponible | no disponible | modelo base orientado a veracidad | HuggingFace |

No se han identificado en la información proporcionada otros modelos comparables de la misma categoría (fusiones SLERP de ~18B sobre arquitectura Llama) con datos verificables.

## Limitaciones y advertencias

- Licencia no declarada: sin licencia explícita no hay autorización clara para uso comercial; además, la licencia final está condicionada por las licencias de los modelos base, que tampoco se detallan aquí.
- Ausencia total de benchmarks: no hay evidencia publicada de que la fusión mejore a los modelos base; una mezcla de pesos puede degradar capacidades de forma no obvia.
- Riesgo de alucinación: inherente a los modelos de lenguaje de esta familia; no se documentan mecanismos de mitigación ni evaluación de veracidad, pese a que uno de los modelos base está orientado a "truthy".
- Adopción nula: 0 descargas y 0 likes en el momento de la consulta, sin comunidad que haya validado el comportamiento del modelo.
- Contexto e idiomas desconocidos: no se especifica la longitud de contexto ni los idiomas soportados, lo que impide planificar despliegues multilingües o de contexto largo.
- Procedencia de los modelos base no documentada: se desconoce la arquitectura exacta de la familia solarized-18B, su dataset de entrenamiento y sus etapas de alineación.
- Metadatos anómalos: la fecha de creación registrada (2026-10-15) es posterior a la fecha actual del análisis, lo que sugiere posibles inconsistencias en los metadatos del repositorio.
- Formato de prompt no documentado: al no publicarse chat template ni tokenizer config en la información disponible, la integración en pipelines conversacionales requiere verificarlo manualmente.
- Sin garantías de producción: se recomienda tratarlo como artefacto experimental y validarlo con evaluaciones propias antes de cualquier uso real.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/MergekitCloud/cpu-timing-18b-slerp
- Modelo base vicgalle/solarized-18B-dpo: https://huggingface.co/vicgalle/solarized-18B-dpo
- Modelo base vicgalle/solarized-18B-truthy: https://huggingface.co/vicgalle/solarized-18B-truthy
- Repositorio de mergekit: https://github.com/cg123/mergekit
- Documentación de SLERP (Wikipedia): https://en.wikipedia.org/wiki/Slerp
