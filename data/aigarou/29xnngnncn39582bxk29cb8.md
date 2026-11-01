# AIGAROU/29xnngnncn39582bxk29cb8

## Resumen

Genesis Hermes es un modelo multimodal de tipo image-text-to-text publicado por el usuario AIGAROU bajo el identificador `AIGAROU/29xnngnncn39582bxk29cb8`. Se trata de un derivado de `HauhauCS/Qwen3.6-35B-A3B-Uncensored-HauhauCS-Aggressive`, un modelo base de arquitectura Qwen3.6 con mezcla de expertos (MoE) de aproximadamente 34.660.610.688 parámetros totales. Sobre esa base se ha transferido un ajuste fino orientado a uso agéntico con el formato Hermes, procedente de `DJLougen/hermes-qwen3.5-35b-a3b-GGUF`, y se ha aplicado el método propietario Genesis de "reparación de tensores" descrito por el autor.

El modelo se distribuye en formato GGUF y está pensado para inferencia local y despliegues compatibles con endpoints. La model card lo etiqueta como "uncensored", con soporte declarado de inglés, chino y multilingüe, licencia Apache 2.0 y pipeline multimodal. El repositorio ocupa 89,3 GB, coherente con un modelo MoE de ~35B en cuantizaciones de alta precisión.

Su relevancia actual radica en la combinación de tres factores: una arquitectura MoE de ~35B con presunta activación de ~3B parámetros (según el sufijo A3B del nombre base), capacidades multimodales, y un ajuste orientado a function calling y flujos agénticos. No obstante, conviene señalar que el modelo carece de likes y tiene un volumen de descargas moderado (383), y que buena parte de las afirmaciones técnicas de la model card no están respaldadas por benchmarks publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) basada en Qwen3.6 (sufijo A3B en el modelo base) |
| Parametros totales | 34.660.610.688 (~34,7B) |
| Parametros activos | no disponible (el nombre del base sugiere ~3B activos, sin confirmación oficial) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF (el repo incluye cuantizaciones; niveles concretos no especificados); el autor referencia un script de cuantización con perfiles Unsloth |
| Idiomas soportados | en, zh, multilingual |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repositorio de 89,3 GB) |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer con mezcla de expertos (MoE), heredada de la familia Qwen3.6. El modelo base `HauhauCS/Qwen3.6-35B-A3B-Uncensored-HauhauCS-Aggressive` aporta la estructura de ~34,7B parámetros totales; el sufijo A3B indica, según la convención de nomenclatura de Qwen, aproximadamente 3B parámetros activos por token, aunque este dato no se confirma de forma explícita en la información disponible. El pipeline declarado es image-text-to-text, lo que implica un codificador visual integrado, si bien no se detalla su arquitectura ni el número de tokens de imagen soportados.

El proceso de construcción descrito por el autor no es un entrenamiento convencional. Se parte del base no censurado de HauhauCS y se transfieren datos de un ajuste fino Hermes (aproximadamente 2.000 bloques de dos tensores de expertos FFN) procedente de `DJLougen/hermes-qwen3.5-35b-a3b-GGUF`, con el objetivo de dotar al modelo de capacidades de function calling y uso agéntico. Sobre ese resultado se aplica el método Genesis, que el autor define como un algoritmo de "regeneración y calibración de datos post-entrenamiento" para GGUF, basado en estadística matemática (distribución de Marchenko-Pastur) y SVD personalizado. El método afirma reparar tensores `ssm_conv1d`, sustituir bloques nulos en tensores dañados y reducir ruido de entrenamiento preservando "el 99% de la señal". Estas afirmaciones proceden exclusivamente de la model card y no cuentan con validación independiente en la información proporcionada. No se especifican volúmenes de tokens de entrenamiento, composición del dataset ni uso de RLHF o DPO.

## Capacidades

- Generación de texto conversacional multi-turno, con formato de chat compatible con Hermes.
- Procesamiento de imagen y texto de forma conjunta (pipeline image-text-to-text), lo que habilita tareas de descripción, extracción de información y razonamiento sobre imágenes.
- Soporte de function calling y tool calling, derivado del ajuste sobre `NousResearch/hermes-function-calling-v1`.
- Orientación a flujos agénticos y razonamiento multi-paso, según las etiquetas "agentic" y "hermes" de la model card.
- Capacidades multilingües declaradas: inglés, chino y otros idiomas no especificados.
- Comportamiento "uncensored": el autor reporta 0 rechazos sobre 465 pruebas en el modelo base, lo que implica menor tendencia a declinar peticiones.
- Compatibilidad con endpoints (etiqueta `endpoints_compatible`), pensada para despliegues vía API.
- No se documentan capacidades de audio, modo "thinking" explícito ni decodificación especulativa.

## Casos de uso

- Asistentes conversacionales locales con contexto multimodal: el modelo puede mantener diálogos multi-turno e incorporar imágenes en la conversación, lo que resulta útil para prototipos de asistente personal en hardware propio mediante GGUF.
- Automatización de atención al cliente con imágenes adjuntas: un usuario puede enviar una captura o foto de un producto o error y el modelo razonar sobre ella junto con el texto, siempre que el contexto disponible sea suficiente (longitud no confirmada).
- Pipelines agénticos con function calling: gracias al ajuste sobre el dataset Hermes de function calling, el modelo puede invocar herramientas en flujos de automatización, por ejemplo para consultar APIs internas o ejecutar acciones en un CRM.
- Extracción de información estructurada de documentos escaneados: combinando visión y generación de texto, puede transcribir y estructurar datos de facturas, formularios o tickets en un formato JSON consumible por otros sistemas.
- Generación de código asistida en entornos con restricciones de privacidad: al ejecutarse en local en formato GGUF, permite autocompletado y explicación de código sin enviar datos a servicios externos.
- Investigación sobre alineación y censura: al ser un modelo etiquetado como "uncensored" con 0 rechazos reportados en el base, sirve para estudiar comportamientos de rechazo, sesgos y robustez en entornos controlados de evaluación.
- Despliegue en endpoints compatibles para pruebas A/B: la etiqueta `endpoints_compatible` permite integrarlo en infraestructuras que ya hablan el protocolo de endpoints habituales, facilitando comparaciones con otros modelos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card únicamente reporta "0/465 refusals" para el modelo base, un dato de comportamiento (tasa de rechazo) y no un benchmark de capacidad. No se aportan cifras de MMLU, HumanEval, GSM8K, MMMU ni de evaluación multimodal.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. Como referencia orientativa, un MoE de ~34,7B parámetros totales en GGUF requiere aproximadamente 20-24 GB en cuantización Q4_K_M, ~14-16 GB en Q3 y ~40-48 GB en Q8; estas cifras son estimaciones de orden de magnitud y no proceden de la información proporcionada.
- GPU recomendadas: no especificadas por el autor. Para cuantizaciones altas se requerirían GPUs de 48-80 GB (A100, H100, A6000); para cuantizaciones Q4 podría ser viable en RTX 4090 (24 GB) o RTX 3090.
- Viabilidad en GPU de consumo: probable en RTX 4090/3090 con cuantizaciones bajas o intermedias, sujeto a la VRAM real del modelo y al overhead del codificador visual (no cuantificado en la información disponible).
- Opciones de despliegue: llama.cpp y Ollama por el formato GGUF; vLLM y TGI requerirían conversión a safetensors, no documentada. El autor menciona compatibilidad con endpoints.
- Latencia y throughput: no disponibles. Al ser MoE con ~3B parámetros activos (según nomenclatura), cabría esperar un throughput relativamente alto por token, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Modalidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Genesis Hermes (este modelo) | ~34,7B totales (MoE) | no disponible | Texto + imagen | Apache 2.0 | GGUF en HuggingFace |
| HauhauCS/Qwen3.6-35B-A3B-Uncensored-HauhauCS-Aggressive | ~35B (MoE) | no disponible | Texto (base) | no disponible | HuggingFace |
| DJLougen/hermes-qwen3.5-35b-a3b-GGUF | ~35B (MoE) | no disponible | Texto | no disponible | GGUF en HuggingFace |
| Qwen3.6-35B-A3B (familia base) | ~35B (MoE, ~3B activos) | no disponible | Texto | no disponible | HuggingFace |

La comparativa se limita a los modelos emparentados directamente, ya que no se dispone de datos de rendimiento de alternativas equivalentes en la información proporcionada. No es posible establecer comparaciones cuantitativas de benchmarks.

## Limitaciones y advertencias

- El modelo está etiquetado como "uncensored" y el autor reporta 0 rechazos en 465 pruebas del base; esto implica un riesgo elevado de generar contenido inapropiado, ofensivo o dañino sin filtros, lo que exige salvaguardas externas en producción.
- Riesgo de alucinación no cuantificado; el método Genesis afirma reducirla, pero no hay evidencia independiente en la información disponible.
- Longitud de contexto no documentada: no se puede garantizar el rendimiento en contextos largos ni en conversaciones extensas.
- Idiomas: el soporte declarado se limita a inglés, chino y "multilingual" sin especificar; el rendimiento en castellano no está verificado.
- Las afirmaciones sobre "reparación de tensores" y preservación del 99% de la señal proceden únicamente de la model card del autor y no han sido validadas por terceros.
- El proceso de construcción (transferencia de bloques entre modelos y calibración SVD) es poco convencional y podría introducir degradaciones no documentadas en capacidades específicas.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base y el ajuste Hermes pueden tener condiciones adicionales no reflejadas; conviene verificar las licencias de los modelos de origen.
- El repositorio no tiene likes y un volumen de descargas bajo (383), lo que reduce la base de validación comunitaria.
- El autor incluye llamadas a donaciones y datos de contacto personales en la model card; no constituyen una limitación técnica, pero conviene tratarlos con cautela.
- No se especifican los niveles de cuantización incluidos ni sus tamaños, lo que dificulta planificar el despliegue.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/AIGAROU/29xnngnncn39582bxk29cb8
- Modelo base: https://huggingface.co/HauhauCS/Qwen3.6-35B-A3B-Uncensored-HauhauCS-Aggressive
- Ajuste Hermes de origen: https://huggingface.co/DJLougen/hermes-qwen3.5-35b-a3b-GGUF
- Dataset de function calling: https://huggingface.co/datasets/NousResearch/hermes-function-calling-v1
- Script de cuantización con perfiles Unsloth: https://pastebin.com/hXhcMJn9
- Discord del autor: https://discord.gg/SZ5vacTXYf
- Distribución de Marchenko-Pastur (referencia del método Genesis): https://en.wikipedia.org/wiki/Marchenko%E2%80%93Pastur_distribution
