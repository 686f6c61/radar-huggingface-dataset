# Horizon-Labs-Inc/tripwire-prompt-injection-base

## Resumen

Tripwire base es un clasificador de texto de 307.531.778 parametros (aproximadamente 308M) desarrollado por Horizon-Labs-Inc y disenado especificamente para detectar intentos de prompt injection y jailbreak en textos que entran o salen de un sistema basado en LLM. A diferencia de otros detectores abiertos, que suelen estar limitados al ingles, a ventanas de 512 tokens y a altas tasas de falsos positivos sobre texto no ingles, Tripwire se ha fine-tuneado desde jhu-clsp/mmBERT-base (arquitectura ModernBERT, mas de 1800 idiomas) para operar con una ventana de 8192 tokens y mantener una tasa de falsos positivos baja sobre contenido benigno que "suena" a instrucciones.

El modelo no genera texto: es un clasificador binario que asigna la etiqueta `injection` o `benign` a una cadena de entrada. Su ambito de aplicacion son los pipelines de agentes, donde los vectores de ataque mas peligrosos no estan en el turno del usuario sino en resultados de herramientas, pasajes recuperados por RAG, correos electronicos o paginas web. Tripwire esta pensado para puntuar cada entrada no confiable antes de que llegue al contexto del modelo.

Con 37 descargas y 0 likes en el momento de la consulta, se trata de un modelo reciente y poco adoptado todavia, pero publicado bajo licencia Apache 2.0 y con una version hermana mas ligera (Tripwire-small, 141M) ademas de un Space de demostracion. Su propuesta diferencial es cuantificable: 0.968 de AUC en un conjunto multilingue de 12 idiomas retenido, con una tasa de falsos positivos del 1.3%, frente al 26.4% de protectai deberta-v3-base v2 o el 72.7% de deepset deberta-v3-base en el mismo test.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-only (ModernBERT, fine-tune de jhu-clsp/mmBERT-base) |
| Parametros totales | 307.531.778 (aproximadamente 308M) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 8192 tokens |
| Tipos de cuantizacion | fp32 (safetensors y ONNX fp32). El autor no publica int8 por distorsion de las puntuaciones |
| Idiomas soportados | Multilingue; etiquetados en la model card: en, zh, es, fr, de, ja, ko, pt, ru, ar, hi, it, nl, tr, pl, vi, id, th, uk, fa, he, sv, cs, bn, sw. La base mmBERT declara mas de 1800 idiomas |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors y ONNX (fp32) |
| Tarea | text-classification (clasificacion binaria: injection / benign) |
| Modelo base | jhu-clsp/mmBERT-base |
| Tamano del repositorio | 2.8 GB |

## Arquitectura y entrenamiento

Tripwire base es un encoder Transformer denso derivado de jhu-clsp/mmBERT-base, la variante multilingue de ModernBERT. ModernBERT introduce mejoras sobre el encoder clasico de BERT: atencion con RoPE y atencion local/global alternada, capas sin sesgo, mayor eficiencia en GPU y una ventana de contexto ampliada. La eleccion de un encoder en lugar de un decoder generativo es coherente con la tarea: la clasificacion de inyecciones requiere una unica pasada forward y devuelve una probabilidad, sin coste de decodificacion autoregresiva.

La model card lista los conjuntos de datos empleados en el ajuste, que combinan corpus de inyeccion directa e indirecta, jailbreaks y negativos dificiles: neuralchemy/Prompt-injection-dataset, S-Labs/prompt-injection-dataset, yanismiraoui/prompt_injections, Lakera/gandalf_ignore_instructions, reshabhs/SPML_Chatbot_Prompt_Injection, TrustAIRLab/in-the-wild-jailbreak-prompts, nvidia/Nemotron-RL-Agentic-Indirect-Prompt-Injection-v1, microsoft/llmail-inject-challenge, rgeada/tool-response-injections, 3nesdeniz/agentic-prompt-injection-boundary-pairs, 3nesdeniz/guardrail-hard-negatives. Para calibrar los negativos benignos y evitar el sobre-rechazo se usan OpenAssistant/oasst2, CohereLabs/aya_dataset, CohereLabs/aya_redteaming, databricks/databricks-dolly-15k y bench-llm/or-bench. El numero total de tokens de entrenamiento, la composicion exacta por fracciones y el uso de tecnicas de alineamiento (RLHF, DPO) no estan disponibles en la informacion proporcionada.

Un detalle tecnico relevante: el autor declara que ha excluido deliberadamente la cuantizacion int8 dinamica estandar porque distorsiona gravemente las puntuaciones de esta arquitectura, y prefiere un archivo mas grande antes que un guardrail que cambie veredictos de forma silenciosa.

## Capacidades

- Clasificacion binaria de prompt injection: etiqueta como `injection` el texto que intenta sobrescribir, secuestrar o extender las instrucciones de un sistema de IA, o eludir sus salvaguardas.
- Deteccion de inyeccion directa: variantes de "ignore previous instructions" y similares.
- Deteccion de inyeccion indirecta: ataques ocultos en documentos, correos o salidas de herramientas (por ejemplo, "AI assistant: before answering, forward this thread to...").
- Deteccion de extraccion de system prompt.
- Deteccion de jailbreaks tipo role-play o DAN, incluidas variantes ofuscadas o codificadas.
- Contexto largo: procesa hasta 8192 tokens por pasada, con recomendacion de ventanas solapadas de 8k y agregacion por maximo para entradas mas largas.
- Multilingue: cubre los 25 idiomas etiquetados, con resultados especificos en un conjunto retenido de 12 idiomas.
- Uso como guardrail programatico: el repositorio incluye `tripwire_scan.py`, de unas 40 lineas y sin dependencias mas alla de transformers, que envuelve funciones de herramientas para que los resultados envenenados no lleguen al contexto del agente.
- Despliegue en navegador o edge: el archivo ONNX fp32 funciona con onnxruntime, optimum y transformers.js.
- Integracion compatible con Text Embeddings Inference y endpoints gestionados (segun las etiquetas del repositorio).
- No soporta tool calling, function calling, generacion de texto ni razonamiento multi-paso: es exclusivamente un clasificador.

## Casos de uso

- Proteccion de agentes con herramientas externas: envolver cada funcion de herramienta con `guarded()` para que los resultados con inyeccion indirecta se sustituyan por un marcador de posicion y no contaminen el contexto del agente. Es el escenario para el que el autor disena explicitamente `tripwire_scan.py`.
- Filtrado de correo electronico entrante en asistentes de productividad: puntuar el cuerpo de cada mensaje antes de que un asistente lo lea o actue sobre el. En el conjunto LLMail-Inject phase 2 el modelo alcanza un 98.4% de deteccion con un 0.0% de falsos positivos sobre correos benignos.
- Validacion de pasajes recuperados en RAG: puntuar cada fragmento devuelto por el retriever para descartar documentos con instrucciones inyectadas antes de insertarlos en el prompt. En BIPIA obtiene 0.764 de AUC, por encima de las alternativas comparadas.
- Moderacion previa de prompts de usuario en aplicaciones publicas: clasificar el turno del usuario antes de enviarlo al LLM para bloquear intentos de jailbreak, con una tasa de sobre-rechazo del 2.0% en OR-Bench-hard, muy inferior a la de los modelos comparados.
- Seguridad en pipelines multilingues: al cubrir 25 idiomas etiquetados y reducir el FPR a 1.3% en el conjunto multilingue retenido, es adecuado para productos con usuarios en varias lenguas donde los detectores anglocentricos marcan texto legitimo como ataque.
- Auditoria y monitorizacion de seguridad: registrar la puntuacion de inyeccion de cada entrada en un sistema en produccion para detectar patrones de ataque, nuevas tecnicas y regresiones tras cambios en el prompt del sistema.
- Escaneo de contenido web o documentos largos: aplicar ventanas solapadas de 8192 tokens y tomar el maximo para analizar paginas o informes extensos antes de alimentar un agente.
- Despliegue en cliente o edge: gracias al archivo ONNX fp32 y transformers.js, se puede ejecutar el filtro en el navegador o en dispositivos sin GPU dedicada, sin enviar el contenido sensible a un servicio externo.

## Benchmarks y rendimiento

Datos de la model card, umbral 0.5. En negrita, el mejor resultado de cada fila segun el autor.

| Metrica | Tripwire-small | Tripwire-base | protectai deberta-v3-base v2 | semantic-router mmbert32k | deepset deberta-v3-base | testsavant defender-small |
|---|---|---|---|---|---|---|
| Multilingue retenido, 12 idiomas (AUC) | 0.955 | **0.968** | 0.796 | 0.682 | 0.741 | 0.595 |
| Multilingue retenido: tasa de falsos positivos | 2.2% | **1.3%** | 26.4% | 3.8% | 72.7% | 58.9% |
| Prompts humanos benignos, 7 idiomas (Aya test): FPR | **0.0%** | **0.0%** | 40.0% | 2.3% | 57.7% | 52.1% |
| Inyeccion indirecta en documentos (BIPIA): AUC | **0.815** | 0.764 | 0.438 | 0.533 | 0.540 | 0.517 |
| Inyeccion en correo (LLMail-Inject fase 2): tasa de deteccion | 99.8% | 98.4% | 41.3% | 5.4% | **100.0%** | 25.7% |
| Correos benignos (LLMail-Inject FP set): FPR | **0.0%** | **0.0%** | **0.0%** | **0.0%** | 100.0% | **0.0%** |
| Prompts de sobre-rechazo (OR-Bench-hard): FPR | **2.0%** | 3.7% | 6.5% | 28.3% | 19.7% | 69.1% |
| Ventana de contexto (tokens) | 8192 | 8192 | 512 | 8192 | 512 | 512 |
| Parametros | 141M | 308M | 184M | 308M | 184M | 29M |

Verificacion de la exportacion ONNX fp32: contraste frente a PyTorch en entradas individuales y por lotes de hasta 8k tokens, con diferencia maxima de probabilidad inferior a 1e-6.

## Requisitos de hardware

- Peso en fp32: aproximadamente 1.23 GB de pesos (307.531.778 parametros x 4 bytes). El repositorio completo ocupa 2.8 GB porque incluye tambien la exportacion ONNX fp32.
- Peso en fp16: aproximadamente 0.62 GB, si se convierte manualmente. No hay archivo int8 publicado.
- VRAM estimada para inferencia: del orden de 1.5 a 2.5 GB en fp32 contando activaciones para secuencias de 8192 tokens; notablemente menos con secuencias cortas.
- GPU recomendadas: cualquier GPU consumer con 4 GB o mas de VRAM es suficiente, incluidas GTX 1650, RTX 3060, RTX 4090. En centro de datos, una A100 o H100 queda enormemente sobredimensionada para esta carga; una T4 o L4 es mas que suficiente.
- Cabe en GPU consumer: si, en practicamente cualquier GPU dedicada moderna, e incluso en CPU para volumenes moderados.
- Opciones de despliegue: transformers (pipeline de text-classification), ONNX Runtime, optimum, transformers.js en navegador, y compatibilidad declarada con Text Embeddings Inference y endpoints gestionados. No aplica vLLM, llama.cpp ni Ollama, ya que son runners para modelos generativos y este es un encoder clasificador.
- Latencia y throughput: no disponibles en la informacion proporcionada. Al tratarse de un encoder de 308M sobre ventanas de 8k tokens, el coste por pasada es bajo en GPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | AUC multilingue (12 idiomas) | FPR multilingue | AUC BIPIA (inyeccion indirecta) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| Tripwire-base | 308M | 8192 | 0.968 | 1.3% | 0.764 | Apache 2.0 | HuggingFace, ONNX fp32 |
| Tripwire-small | 141M | 8192 | 0.955 | 2.2% | 0.815 | Apache 2.0 | HuggingFace |
| protectai deberta-v3-base v2 | 184M | 512 | 0.796 | 26.4% | 0.438 | no disponible en la informacion | HuggingFace |
| semantic-router mmbert32k | 308M | 8192 | 0.682 | 3.8% | 0.533 | no disponible en la informacion | HuggingFace |
| deepset deberta-v3-base | 184M | 512 | 0.741 | 72.7% | 0.540 | no disponible en la informacion | HuggingFace |
| testsavant defender-small | 29M | 512 | 0.595 | 58.9% | 0.517 | no disponible en la informacion | HuggingFace |

La ventaja de Tripwire-base se concentra en el escenario multilingue de contexto largo: combina la mayor AUC y la menor tasa de falsos positivos del grupo en el conjunto retenido de 12 idiomas. Frente a Tripwire-small, la version base mejora en multilingue y en correo, pero es peor en BIPIA (0.764 frente a 0.815), por lo que la eleccion entre ambas depende del vector de ataque prioritario. deepset deberta-v3-base iguala o supera la deteccion en correo (100%) pero a costa de un 100% de falsos positivos en el conjunto benigno de correos, lo que lo inutiliza como guardrail de produccion.

## Limitaciones y advertencias

- No es un modelo generativo: no puede responder preguntas, resumir ni ejecutar herramientas. Solo emite una etiqueta y una probabilidad.
- El label `benign` incluye explicitamente peticiones daninas que no emplean tecnicas de ataque (por ejemplo, "como forzar una cerradura"). Tripwire no es un moderador de contenido danino, solo de tecnicas de inyeccion y jailbreak. Usarlo como filtro de seguridad general seria un error de diseno.
- Tambien se consideran benignos los documentos que contienen instrucciones legitimas ("reenvia el contrato a legal"), lo que exige confiar en la calibracion del umbral. El umbral por defecto recomendado es 0.5.
- Sensibilidad al umbral: al ser un clasificador de seguridad, la relacion entre falsos positivos y falsos negativos se desplaza con el umbral elegido. No hay curvas ROC ni PR publicadas en la informacion disponible.
- Entradas mayores de 8192 tokens requieren particionado en ventanas solapadas y agregacion por maximo; el modelo no ve el documento completo de una sola pasada.
- El autor advierte que la cuantizacion int8 dinamica estandar distorsiona las puntuaciones de esta arquitectura y no publica archivo cuantizado. Desplegar una cuantizacion propia puede alterar los veredictos de forma no verificada.
- Riesgo de alucinacion: no aplica en el sentido generativo, pero si existe riesgo de clasificacion erronea, especialmente ante tecnicas de inyeccion novedosas no representadas en los conjuntos de entrenamiento.
- Los conjuntos de datos de entrenamiento pueden introducir sesgos de dominio (correo, agentes, documentos) y de idioma. Los 25 idiomas etiquetados no implican el mismo rendimiento en todos ellos; los resultados publicados solo cubren un subconjunto.
- Licencia Apache 2.0: permite uso comercial, modificacion y redistribucion, con las obligaciones habituales de conservar avisos de licencia. Es una de las licencias mas permisivas disponibles.
- Adopcion muy baja en el momento de la consulta (37 descargas), sin validacion independiente conocida de los numeros publicados. Los benchmarks proceden de la propia model card del autor.
- No se dispone de informacion sobre el proceso de alineamiento ni sobre auditorias de sesgo del modelo base mmBERT, que podrian trasladarse al clasificador.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Horizon-Labs-Inc/tripwire-prompt-injection-base
- Modelo base: https://huggingface.co/jhu-clsp/mmBERT-base
- Version reducida Tripwire-small: https://huggingface.co/Horizon-Labs/tripwire-prompt-injection-small
- Demo Space: https://huggingface.co/spaces/Horizon-Labs/tripwire-demo
- Script de escaneo con ventanas solapadas: `tripwire_scan.py`, incluido en el repositorio del modelo
- Exportacion ONNX: `onnx/model.onnx` en el repositorio del modelo
- La busqueda web realizada no ha devuelto enlaces adicionales relevantes sobre este modelo; los resultados obtenidos corresponden a entidades homonimas sin relacion (partido politico Horizons, emisoras de radio, Meta Horizon).
