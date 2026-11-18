# IsValorum/Qwen3.8-35B-A3B-Distill-APEX-I-MiniPlus-V2.1-GGUF

## Resumen

Qwen3.8-35B-A3B-Distill-APEX-I-MiniPlus-V2.1-GGUF es una cuantización GGUF del checkpoint empero-ai/Qwen3.8-35B-A3B-Distill, un modelo de arquitectura MoE (Mixture of Experts) de tipo Qwen3.5-MoE con aproximadamente 34.660 millones de parámetros totales y unos 3.000 millones de parámetros activos por token. La release la firma IsValorum, un cuantizador independiente que publica bajo la marca APEX-I-MiniPlus y que, según su propia model card, calcula las imatrix y los tensores en clústeres cloud privados financiados de su bolsillo. El modelo base procede de empero-ai y conserva la licencia Apache 2.0.

El interés de esta ficha está en la combinación de tres factores: un MoE de 35B con solo 3B activos, un contexto nativo declarado de 256K tokens y una cuantización quirúrgica tensor a tensor que, según el autor, permite ejecutar el contexto completo en estaciones de trabajo de 24 GB de VRAM mediante offload selectivo a RAM del sistema. Frente a las cuantizaciones planas convencionales, el autor reporta mejoras de perplejidad en WikiText-2 respecto a GSQ-RCO IQ3_S, aunque esas cifras se refieren a la línea hermana de 27B y no a este checkpoint de 35B.

Es relevante ahora porque el ecosistema llama.cpp ha madurado lo suficiente para servir MoE con expertos offloaded, y porque la familia Qwen3.x se ha convertido en la referencia open source para razonamiento, agentes y tool calling multilingüe. Esta release concreta incluye además MTP (multi-token prediction) integrado y una plantilla de chat endurecida para flujos agénticos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (tipo Qwen3.5-MoE / qwen35moe), con MTP integrado |
| Parametros totales | 34.660.610.688 (~34,7B) |
| Parametros activos | ~3B por token (designación A3B) |
| Longitud de contexto | 256K tokens (declarado en la model card) |
| Tipos de cuantizacion | GGUF con esquema APEX-I-MiniPlus (fidelidad clase Q5 a Q6, sin techo fijo de tamaño); imatrix propia |
| Idiomas soportados | en, zh, es, fr, de, pt, it, ru, ja, ko, vi, th, ar (13 idiomas declarados) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo base es un transformer con mezcla de expertos en el que cada token activa aproximadamente 3.000 millones de parámetros de un total de 34.660 millones, lo que sitúa la ratio de activación en torno al 8,7 %. La nomenclatura de la release indica soporte de MTP (multi-token prediction), una técnica de decodificación especulativa integrada que permite proponer varios tokens por paso y verificarlos en paralelo, con la ganancia de throughput asociada. El tag `qwen35moe` confirma la familia arquitectónica, derivada de la línea Qwen3.5.

El checkpoint base es un destilado (Distill) de empero-ai sobre el que no se documentan en la información disponible el número exacto de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO. La model card del autor de la cuantización no reproduce esos detalles del upstream y se centra en el proceso de cuantización: cálculo de imatrix, asignación quirúrgica de bits por tensor (con un mapa auditable extraído del propio GGUF) y verificación empírica de fidelidad. La innovación destacable de esta release no está en el entrenamiento sino en el esquema de compresión: el autor afirma que el enfoque tensor a tensor prioriza fidelidad de clase Q5–Q6 sin imponer un límite fijo de tamaño de archivo, y que el resultado cabe en 18,5 GB de repositorio.

## Capacidades

- Generación de texto conversacional multi-turno con contexto largo (hasta 256K tokens declarados).
- Razonamiento explícito: el modelo emite bloques `<think>` y admite control del esfuerzo de razonamiento mediante la plantilla de chat endurecida que incluye la release.
- Tool calling y function calling, con plantilla agéntica adaptada para flujos de varios pasos.
- Razonamiento multi-paso y uso como agente autónomo con llamadas encadenadas a herramientas.
- Capacidades multilingües en 13 idiomas, con especial solidez esperada en inglés y chino por la familia de origen.
- MTP para decodificación especulativa, que acelera la generación en llama.cpp cuando está soportado.
- Capacidad multimodal: la model card menciona tareas multimodales al describir la línea MoE de 35B, pero no se detalla en la información disponible si este checkpoint concreto conserva proyección de visión.

## Casos de uso

- Asistentes de atención al cliente con historial largo: los 256K tokens de contexto permiten mantener conversaciones con decenas de turnos y documentación de producto adjunta sin truncar, algo inviable en modelos de 8K–32K.
- Agentes de automatización con tool calling: la plantilla agéntica endurecida y el soporte de function calling permiten encadenar consultas a APIs, lectura de ficheros y ejecución de acciones en pipelines de back-office.
- Análisis de repositorios y documentación extensa: con contexto de 256K se puede ingerir un conjunto amplio de ficheros y hacer preguntas cruzadas, útil para onboarding técnico y auditoría de código.
- Razonamiento asistido en investigación: el modo `<think>` con esfuerzo configurable sirve para tareas de análisis donde interesa ver la traza de razonamiento y ajustar el coste computacional.
- Despliegue en estaciones de trabajo de 24 GB: según el autor, el contexto completo cabe en VRAM en GPUs de 24 GB mediante offload de expertos a RAM, lo que habilita prototipado local de agentes sin clúster.
- Servicio multilingüe de resúmenes y traducción: los 13 idiomas declarados cubren los mercados habituales de Europa, Asia oriental y Oriente Medio para generación de contenido y localización.
- Extracción de información estructurada de documentos largos: contratos, informes o expedientes que superan la ventana de modelos densos pequeños.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible para este checkpoint de 35B. La model card incluye cifras de perplejidad WikiText-2 comparadas con GSQ-RCO IQ3_S (PPL 7,07), pero corresponden a la línea hermana de 27B (MiniPlus V3 y NanoPlus V3) y no son trasladables a este modelo. Tampoco se aportan datos de MMLU, HumanEval, GSM8K ni de evaluaciones agénticas.

| Benchmark | Resultado | Nota |
|---|---|---|
| MMLU | no disponible | — |
| HumanEval | no disponible | — |
| GSM8K | no disponible | — |
| WikiText-2 PPL (35B) | no disponible | Las cifras publicadas son de la línea 27B |

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 18,5 GB, de modo que la inferencia completa requiere al menos ~19–20 GB de VRAM si se carga todo; con offload parcial de expertos a RAM del sistema se puede operar con 24 GB de VRAM y contexto completo, según el autor.
- GPU recomendadas: RTX 4090 / RTX 5090 (24–32 GB) para el escenario de contexto completo con offload; A100 40/80 GB y H100 para servicio sin offload y mayor throughput.
- Cabe en GPU de consumo: sí, en RTX 3090, 4090 y 5090 de 24 GB o más, con offload de expertos a RAM; en GPUs de 12–16 GB el offload necesario degrada notablemente el throughput.
- Opciones de despliegue: llama.cpp y sus derivados (Ollama, LM Studio, llama-server) son el soporte natural por ser GGUF; vLLM y TGI no consumen GGUF de forma nativa y requerirían el checkpoint en safetensors.
- Latencia y throughput: la model card incluye una sección de benchmarks de throughput y offload para RTX 30/40/50 y streaming desde RAM, pero las cifras concretas no están recogidas en la información disponible. La activación de solo ~3B parámetros por token sitúa el rendimiento esperado muy por encima de un modelo denso de 35B.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Qwen3.8-35B-A3B-Distill APEX-I-MiniPlus V2.1 (este) | ~34,7B | ~3B | 256K | Apache 2.0 | GGUF | Cuantización quirúrgica con imatrix e MTP |
| Qwen3.6-35B-A3B MTP APEX-I-MiniPlus V2.1 | ~35B | ~3B | no disponible | Apache 2.0 | GGUF | Release hermana del mismo autor, orientada a razonamiento general, agentes y tool calling |
| Ornith 1.5 35B-A3B APEX-I-MiniPlus V2.1 | ~35B | ~3B | no disponible | no disponible | GGUF | Release hermana enfocada a ingeniería de software y agentes de código a escala de repositorio |
| Tiel Coder 35B-A3B APEX-I-MiniPlus V2.1 | ~35B | ~3B | no disponible | no disponible | GGUF | Release hermana especializada en programación agéntica y depuración iterativa |

Las tres alternativas son releases del mismo cuantizador sobre familias base distintas, no variantes intercambiables del mismo modelo. No se dispone de datos de benchmarks comparativos entre ellas en la información proporcionada.

## Limitaciones y advertencias

- Limitación conocida del upstream: el checkpoint BF16 original puede entrar en bucles de repetición en respuestas muy largas, incluso después del bloque `<think>`. EmperoAI reconoce el problema y trabaja en un Distill V2; la cuantización no lo corrige.
- Advertencia específica del autor sobre sintaxis de código y repeat penalty: aplicar penalizaciones de repetición agresivas puede provocar intercambio de caracteres en código generado. Es un caveat relevante para pipelines de generación de código en producción.
- Riesgo de alucinación: no hay evaluaciones publicadas de factualidad para este checkpoint; como todo modelo generativo, puede producir afirmaciones plausibles pero falsas, especialmente con contexto muy largo.
- Sesgos: no se documentan análisis de sesgo en la información disponible. La composición del dataset de destilado es desconocida, lo que impide evaluar sesgos de origen.
- Contexto e idioma: los 256K son un dato declarado por el autor de la cuantización; la calidad efectiva en ventanas extremas no está verificada con benchmarks publicados. El campo `language` de los metadatos de Hugging Face lista solo `en`, aunque la model card declara 13 idiomas.
- Licencia: Apache 2.0 permite uso comercial, pero conviene verificar la licencia del checkpoint base en empero-ai/Qwen3.8-35B-A3B-Distill antes de desplegar, ya que las obligaciones de atribución pueden recaer en el upstream.
- Producción: al ser una cuantización GGUF de un tercero independiente, no hay garantías de soporte ni de paridad exacta con el BF16 original más allá de las verificaciones de fidelidad que reporta el autor. Para servicio a gran escala, evaluar el checkpoint en safetensors con vLLM.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/IsValorum/Qwen3.8-35B-A3B-Distill-APEX-I-MiniPlus-V2.1-GGUF
- Modelo base: https://huggingface.co/empero-ai/Qwen3.8-35B-A3B-Distill
- Colección APEX-I MiniPlus V2.1: https://huggingface.co/collections/IsValorum/apex-i-miniplus-v21-standard-moe-6acfee77961c8c0cf5a083b5
- Release hermana Qwen3.6-35B-A3B MTP V2.1: https://huggingface.co/IsValorum/Qwen3.6-35B-A3B-MTP-APEX-I-MiniPlus-V2.1-GGUF
- Release hermana Qwen3.6-35B-A3B MTP V2.1 Abliterated: https://huggingface.co/IsValorum/Qwen3.6-35B-A3B-MTP-APEX-I-MiniPlus-V2.1-Abliterated-GGUF
- Release hermana Ornith 1.5: https://huggingface.co/IsValorum/Ornith-1.5-35B-A3B-APEX-I-MiniPlus-V2.1-GGUF
- Release hermana Tiel Coder: https://huggingface.co/IsValorum/Tiel-Coder-35B-A3B-APEX-I-MiniPlus-V2.1-GGUF
- Qwen3.8 27B MiniPlus V3: https://huggingface.co/IsValorum/Qwen3.8-27B-VAL-APEX-I-MiniPlus-V3-GGUF
- Qwen3.8 27B NanoPlus V3: https://huggingface.co/IsValorum/Qwen3.8-27B-VAL-APEX-I-NanoPlus-V3-GGUF
- Swift-1.5 Qwen3.8 27B Uncensored MTP MiniPlus V3: https://huggingface.co/IsValorum/Swift-1.5-Qwen3.8-27B-Uncensored-MTP-VAL-APEX-I-MiniPlus-V3-GGUF
- Swift-1.5 Qwen3.8 27B Uncensored MTP NanoPlus V3: https://huggingface.co/IsValorum/Swift-1.5-Qwen3.8-27B-Uncensored-MTP-VAL-APEX-I-NanoPlus-V3-GGUF
- Apoyo al autor: https://ko-fi.com/isvalorum
