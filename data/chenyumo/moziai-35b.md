# chenyumo/moziAI-35B

## Resumen

MoziAI-35B es un modelo de lenguaje multimodal de tipo Mixture of Experts (MoE) desarrollado por el equipo de Chen Yumo, publicado en Hugging Face bajo el identificador `chenyumo/moziAI-35B`. Segun la model card, se distribuye como una variante del modelo MoziAier-35B-V3.9, construido sobre la base Occamy-1.0-35B-A3B, que sigue la arquitectura Qwen3.6-35B-A3B. El modelo esta orientado al dominio financiero, soporta vision y tool calling, y esta disenado para ejecutarse localmente en GPUs de consumo.

La propuesta central es la ejecucion de tareas de largo horizonte (long-horizon) sobre una ventana de contexto de clase 250K, junto con una cuantizacion hibrida propia denominada MoziSmartBit que reduce el peso en disco a 12,99 GB frente a los 21-22 GB tipicos de un Q4_K_M. El modelo se distribuye exclusivamente en formato GGUF para llama.cpp, con la plantilla de chat embebida en el propio archivo.

El modelo declara 34.660.610.688 parametros totales y un tamano de repositorio de 14,6 GB. La informacion disponible es limitada: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, y la model card no incluye resultados numericos de benchmarks estandar (MMLU, GSM8K, HumanEval) pese a mencionarlos como parte de su evaluacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (base Occamy-1.0-35B-A3B, arquitectura Qwen3.6-35B-A3B) |
| Parametros totales | 34.660.610.688 (~35B) |
| Parametros activos | no disponible (la model card indica "35B MoE" sin desglose de activos; la nomenclatura A3B sugiere ~3B activos, dato no confirmado) |
| Longitud de contexto | 262.144 tokens (256K; presets recomendados de 192K en 16 GB y 250K en 24 GB+) |
| Tipos de cuantizacion | MoziSmartBit hibrida (capas de expertos IQ3_XXS + imatrix occamy); KV cache recomendada q4_0 |
| Idiomas soportados | en, zh (chino especialmente ajustado) |
| Licencia | other (la model card indica "free for commercial use") |
| Formato de pesos | GGUF (llama.cpp); proyector de vision mmproj Q8_0 en GGUF |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura transformer con capas de mezcla de expertos (MoE), heredada de la base Occamy-1.0-35B-A3B, que a su vez sigue el diseno Qwen3.6-35B-A3B. Sobre esa base, el equipo aplica su propia metodologia de entrenamiento, que la model card describe como un marco de razonamiento de siete dimensiones y un mecanismo de agente denominado LOOP orientado a la autocorreccion en tareas complejas. No se especifica el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO.

La innovacion tecnica mas destacada es MoziSmartBit, un algoritmo de cuantizacion hibrida multinivel que combina cuantizacion IQ3_XXS en las capas de expertos con una imatrix propia (occamy). Segun la model card, la perdida de calidad medida en perplejidad es de PPL 8,3044, un incremento del 0,47 % respecto a BF16. El modelo no dispone de cabeza MTP, por lo que la decodificacion especulativa debe permanecer desactivada. La plantilla de chat va embebida en el campo `tokenizer.chat_template` del GGUF, lo que evita depender de un archivo jinja externo.

## Capacidades

- Generacion de texto conversacional en ingles y chino, con ajuste especifico para chino.
- Razonamiento estructurado mediante un marco de siete dimensiones que adapta la profundidad del pensamiento a la complejidad de la tarea.
- Ejecucion de tareas de largo horizonte con el mecanismo LOOP de autocorreccion sobre contextos de clase 250K.
- Tool calling / function calling con formato correcto en turno unico y multi-turno, incluida la invocacion paralela de herramientas.
- Capacidades de agente para tareas de multiples pasos con decenas de llamadas a herramientas.
- Vision: lectura de capturas de pantalla locales y graficos mediante el proyector mmproj Q8_0.
- Dominio financiero: preguntas y respuestas financieras y programacion de estrategias cuantitativas.
- Capacidad "uncensored" declarada en las etiquetas del repositorio.
- Analisis de documentos largos y trabajo de ingenieria entre multiples archivos.

## Casos de uso

- Analisis de documentos financieros extensos: el modelo puede procesar informes anuales, prospectos o transcripciones de resultados dentro de una ventana de hasta 250K tokens, recordando hechos plantados a lo largo del contexto, lo que permite preguntas cruzadas sobre secciones distantes sin trocear el documento.
- Automatizacion de atencion al cliente en chino e ingles: con tool calling multi-turno y contexto largo puede mantener conversaciones con historial extenso e invocar APIs de consulta de cuentas o pedidos.
- Generacion y revision de codigo para estrategias cuantitativas: su ajuste en finanzas y su soporte de tool calling permiten integrarlo en pipelines que consultan datos de mercado, generan backtests y validan resultados.
- Agentes de ingenieria multiarchivo: el mecanismo LOOP y la estabilidad en tareas de largo horizonte lo hacen adecuado para agentes que editan varios archivos, ejecutan pruebas y corrigen errores en cadena.
- Lectura de graficos y capturas en flujos de analisis: con el proyector de vision puede interpretar capturas de pantalla de terminales, paneles o graficos y convertirlas en texto estructurado para su posterior procesamiento.
- Despliegue local en estaciones de trabajo con GPU de consumo: al ejecutarse desde 8 GB de VRAM con offload a RAM del sistema, permite prototipar asistentes financieros privados sin enviar datos a la nube.
- Extraccion estructurada de datos de documentos largos: combinando contexto de 192K en una GPU de 16 GB con tool calling, puede rellenar esquemas JSON a partir de contratos o estados financieros.

## Benchmarks y rendimiento

La model card menciona una evaluacion basada en Occamy-1.0 que incluye MMLU, GSM8K y HumanEval, pero no publica los valores numericos. Los unicos datos cuantitativos disponibles son los siguientes:

| Metrica | Resultado |
|---|---|
| Perplejidad tras cuantizacion | 8,3044 (+0,47 % frente a BF16) |
| Test de estres de contexto largo | Superado en clase 250K con recuperacion precisa de hechos plantados |
| Tool calling | Formato correcto en turno unico y multi-turno; llamadas paralelas soportadas |
| Vision | Comprension de capturas y lectura de graficos verificadas |

No se han publicado resultados numericos de benchmarks estandar (MMLU, GSM8K, HumanEval) en la informacion disponible.

## Requisitos de hardware

- VRAM minima: 8 GB, con offload de capas a RAM del sistema (contexto de 16K-32K, KV cache q4_0); funciona pero con mayor latencia.
- VRAM recomendada: 16 GB para contexto de 192K (unos 0,4 GB de margen); 24 GB o mas para 256K con vision.
- Presets medidos: 16 GB con contexto de 250K ocupa aproximadamente 15,5 GB de VRAM, en el limite.
- La KV cache debe ser q4_0; con q8_0 el consumo sube lo suficiente como para no caber en una GPU de 16 GB.
- Flash attention debe estar activado; slots paralelos = 1.
- La decodificacion especulativa debe permanecer desactivada (no hay cabeza MTP).
- Opciones de despliegue: llama.cpp (`llama-server`), Ollama (mediante Modelfile), LM Studio y Jan. El ejemplo de la model card usa `--jinja` y el puerto 20016.
- Throughput y latencia: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone de datos de rendimiento comparables del modelo frente a alternativas, por lo que la comparacion se limita a caracteristicas declaradas.

| Modelo | Parametros | Contexto | Formato / cuantizacion | Licencia |
|---|---|---|---|---|
| MoziAI-35B (MoziAier-35B-V3.9) | ~35B MoE | 256K | GGUF, IQ3_XXS hibrida (12,99 GB) | other, uso comercial declarado |
| Base Occamy-1.0-35B-A3B | ~35B MoE | no disponible | no disponible | no disponible |
| Modelo tipo Qwen3.6-35B-A3B en Q4_K_M | ~35B MoE | no disponible | GGUF, Q4_K_M (~21-22 GB) | no disponible |

La model card solo aporta la comparacion de tamano frente a un Q4_K_M generico del mismo tamano (12,99 GB frente a 21-22 GB). No se dispone de comparaciones de rendimiento con modelos alternativos.

## Limitaciones y advertencias

- La licencia es "other": aunque la model card afirma uso comercial libre, las condiciones juridicas exactas no estan detalladas y conviene revisarlas antes de un despliegue en produccion.
- El modelo se distribuye unicamente en GGUF con cuantizacion IQ3_XXS; no hay pesos en safetensors ni BF16 publicados en este repositorio, lo que limita el ajuste fino y la evaluacion de la calidad completa.
- La decodificacion especulativa no es compatible (sin cabeza MTP); activarla degrada o rompe la inferencia.
- La KV cache q8_0 no cabe en GPUs de 16 GB; usar q4_0 es obligatorio en esos presets.
- Cobertura idiomatica limitada a ingles y chino; el rendimiento en castellano no esta documentado.
- El ajuste esta orientado a finanzas, lo que puede introducir sesgos de dominio en tareas generales.
- La etiqueta "uncensored" implica un filtrado de seguridad reducido; requiere moderacion adicional en aplicaciones expuestas a usuarios.
- Riesgo de alucinacion no cuantificado: no se publican tasas de error en tareas factuales.
- El repositorio no registra descargas ni likes, y no hay resultados numericos de benchmarks estandar, lo que dificulta validar de forma independiente las afirmaciones de la model card.
- El rendimiento en contexto de 250K con 16 GB de VRAM esta en el limite medido (15,5 GB), por lo que la estabilidad puede variar segun el hardware.

## Enlaces

- Hugging Face: https://huggingface.co/chenyumo/moziAI-35B
- Model card en chino simplificado: README.zh.md (referenciado en la model card)
- Model card en chino tradicional: README.zh-hant.md (referenciado en la model card)
- Model card en japones: README.ja.md (referenciado en la model card)
- Model card en coreano: README.ko.md (referenciado en la model card)
- Model card en hindi: README.hi.md (referenciado en la model card)
- Model card en aleman: README.de.md (referenciado en la model card)
- Model card en frances: README.fr.md (referenciado en la model card)
- Model card en neerlandes: README.nl.md (referenciado en la model card)
- Model card en italiano: README.it.md (referenciado en la model card)
- Model card en ruso: README.ru.md (referenciado en la model card)
- Descargas alternativas: ModelScope y GitHub (mencionados en la model card sin URL concreta)
