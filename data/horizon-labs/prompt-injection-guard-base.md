# Horizon-Labs/prompt-injection-guard-base

## Resumen

Prompt Injection Guard (base) es un clasificador de texto desarrollado por Horizon-Labs, diseñado para detectar intentos de prompt injection y jailbreak tanto en mensajes de usuario (inyección directa) como en contenido no confiable que lee un agente de IA: correos electrónicos, páginas web, documentos, fragmentos de RAG y salidas de herramientas o APIs (inyección indirecta). Con 307.531.778 parámetros, se posiciona como un modelo de tamaño medio, lo suficientemente ligero para ejecutarse en CPU o en el navegador, pero con capacidad para procesar contextos de hasta 8.000 tokens.

El modelo se construye sobre el backbone jhu-clsp/mmBERT-base, un transformer encoder multilingüe de la familia ModernBERT, y se afina como clasificador binario con las etiquetas `SAFE` (0) e `INJECTION` (1). Su enfoque es eminentemente práctico: está entrenado con documentos realistas en los que se han plantado inyecciones (45 tipos de documento distintos) junto con sus contrapartidas limpias, de modo que aprende a identificar instrucciones dirigidas al sistema de IA y no simplemente palabras que suenan amenazantes. Esto se traduce en una tasa de falsos positivos baja sobre texto benigno que se parece a una inyección: 94,4 % en NotInject y 99,4 % en OR-Bench-hard.

Su relevancia actual radica en que los agentes de IA cada vez consumen más contenido externo no controlado, lo que amplía la superficie de ataque de la inyección indirecta. El modelo es abierto (Apache-2.0), no requiere gating, se distribuye también en ONNX y transformers.js, y es compatible con LLM Guard, lo que facilita integrarlo como guardrail en pipelines de producción sin depender de un proveedor externo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (ModernBERT / mmBERT-base, jhu-clsp/mmBERT-base) |
| Parametros totales | 307.531.778 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8.000 tokens |
| Tipos de cuantizacion | ONNX fp32 (`onnx/model.onnx`) y ONNX int8 en embeddings (`onnx/model_quantized.onnx`); dtype `q8` en transformers.js |
| Idiomas soportados | Multilingüe: en, de, fr, es, pt, it, nl, pl, ru, uk, tr, ar, hi, zh, ja, ko, vi, id, th (datos sintéticos de entrenamiento en 30 idiomas) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors, ONNX (fp32 e int8), compatible con transformers.js |

## Arquitectura y entrenamiento

El modelo parte de jhu-clsp/mmBERT-base, un encoder de la familia ModernBERT adaptado a multilingüismo, y se afina como clasificador de secuencias con dos clases (`SAFE` e `INJECTION`). La elección de un encoder bidireccional en lugar de un modelo generativo permite una inferencia mucho más rápida y barata, adecuada para inspeccionar cada mensaje o cada fragmento de contenido que entra en un agente. El contexto de 8.000 tokens cubre la mayoría de documentos, y para textos más largos la model card propone una estrategia de ventanas solapadas (por ejemplo, ventana de 2.048 tokens con stride de 512) tomando la probabilidad máxima de inyección entre ventanas.

El entrenamiento combina múltiples conjuntos de datos orientados a seguridad: neuralchemy/Prompt-injection-dataset, S-Labs/prompt-injection-dataset, microsoft/llmail-inject-challenge, hendzh/PromptShield, TrustAIRLab/in-the-wild-jailbreak-prompts, nvidia/Nemotron-RL-Agentic-Indirect-Prompt-Injection-v1, 3nesdeniz/agentic-prompt-injection-5k, rgeada/tool-response-injections, JailbreakV-28K/JailBreakV-28k y nvidia/Nemotron-RL-Jailbreak-Robustness-v1, complementados con datos de instrucción general (OpenAssistant/oasst2, CohereLabs/aya_dataset) y corpus web (HuggingFaceFW/fineweb-edu, fineweb-2). La model card indica que se usaron únicamente datos con licencias permisivas y que los datos sintéticos multilingües cubren 30 idiomas. No se detalla en la información disponible el número exacto de tokens de entrenamiento ni si se aplicaron técnicas de RLHF o DPO; al tratarse de un clasificador, el ajuste es supervisado sobre etiquetas binarias.

## Capacidades

- Clasificación binaria de texto en `SAFE` o `INJECTION`, con una puntuación de probabilidad asociada.
- Detección de inyección directa: anulación o ignorado de instrucciones, mensajes falsos de sistema o desarrollador, trucos de delimitadores.
- Detección de jailbreak: personajes, modo desarrollador, planteamientos hipotéticos destinados a eliminar las reglas del modelo.
- Detección de extracción de system prompt.
- Detección de inyección indirecta en contenido no confiable: correos, páginas web, documentos, fragmentos de RAG y respuestas de herramientas o APIs.
- Robustez ante texto benigno que imita una inyección (baja tasa de falsos positivos en NotInject y OR-Bench-hard).
- Capacidad multilingüe en 30 idiomas de entrenamiento, con etiquetas de idioma para 19 de ellos.
- Procesamiento de entradas largas de hasta 8.000 tokens; ventanas solapadas para documentos de mayor longitud.
- Compatibilidad con LLM Guard (escáner `PromptInjection`) y con el convenio de etiquetas de `protectai/deberta-v3-base-prompt-injection-v2`, lo que permite sustituirlo sin cambiar el código.
- Ejecución en PyTorch, ONNX Runtime y transformers.js (navegador).

## Casos de uso

- Filtrado de entrada de usuario en un chatbot: cada mensaje se clasifica antes de llegar al LLM; si la puntuación de inyección supera el umbral, se bloquea o se sanea, evitando que un usuario malicioso extraiga el system prompt o altere el comportamiento del asistente.
- Protección de agentes que leen contenido externo: antes de pasar el resultado de una herramienta, una página web o un correo al agente, se ejecuta el clasificador con ventanas solapadas; si detecta instrucciones dirigidas al sistema, el contenido se elimina o se marca, mitigando la inyección indirecta.
- Seguridad en pipelines de RAG: cada fragmento recuperado de la base vectorial se inspecciona antes de incorporarlo al contexto del modelo, lo que evita que un documento envenenado en el índice redirija las respuestas del sistema.
- Moderación de correo electrónico y mensajería corporativa: el modelo puede analizar el cuerpo de los mensajes entrantes en busca de instrucciones ocultas dirigidas a asistentes de correo, con soporte multilingüe para plantillas internacionales.
- Guardrail en despliegues con LLM Guard: se integra como escáner de entrada con umbral configurable (por ejemplo, 0,5) y tipo de coincidencia `FULL`, encajando en arquitecturas de seguridad ya existentes sin reescribir la lógica.
- Ejecución en el navegador o en el edge: gracias a la variante ONNX int8 y a transformers.js, puede desplegarse en aplicaciones web o dispositivos con recursos limitados para prefiltrar entradas antes de enviarlas a un servicio remoto.
- Evaluación de robustez de agentes: sirve como componente de referencia en pruebas de red teaming para medir cuántos ataques de inyección directa e indirecta superan el filtro antes de llegar al modelo principal.

## Benchmarks y rendimiento

| Benchmark | Resultado |
|---|---|
| NotInject (tasa de acierto sobre texto benigno que imita inyección) | 94,4 % |
| OR-Bench-hard (tasa de acierto sobre texto benigno que imita inyección) | 99,4 % |

No se han publicado en la información disponible resultados de benchmarks estándar de clasificación (MMLU, HumanEval, GSM8K u otros) ni comparativas numéricas directas con modelos competidores. Los dos valores anteriores son métricas de falsos positivos declaradas por el autor en la model card.

## Requisitos de hardware

- VRAM estimada para inferencia: con 307,5 millones de parámetros, en fp32 ocupa aproximadamente 1,2 GB de pesos; en fp16 unos 0,6 GB; la variante ONNX int8 en embeddings reduce el tamaño a la mitad respecto a fp32.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; una RTX 3060 de 12 GB o superior, RTX 4090, A100 o H100 pueden ejecutar el modelo con lotes grandes sin problema. En la práctica, el modelo también funciona en CPU.
- Cabe en GPU consumer: sí, en cualquier GPU con al menos 2 GB de VRAM en fp32 y con menos de 1 GB en int8; también cabe en entornos sin GPU.
- Opciones de despliegue: PyTorch con `transformers` (pipeline `text-classification`), ONNX Runtime, transformers.js, LLM Guard, y text-embeddings-inference según las etiquetas del repositorio. No se menciona compatibilidad explícita con vLLM, llama.cpp o Ollama, que están orientados a modelos generativos.
- Latencia y throughput estimados: no disponibles en la información proporcionada. Al ser un encoder de 308 M de parámetros, la latencia por petición es baja en comparación con modelos generativos, pero no se aportan cifras concretas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Horizon-Labs/prompt-injection-guard-base | 307,5 M | 8.000 tokens | Clasificador de inyección directa e indirecta, multilingüe | Apache-2.0 | Hugging Face, ONNX, transformers.js |
| protectai/deberta-v3-base-prompt-injection-v2 | no disponible en la información | no disponible | Clasificador de prompt injection; mismo convenio de etiquetas | no disponible en la información | Hugging Face |
| Horizon-Labs/prompt-injection-guard-small | no disponible en la información | no disponible | Variante reducida del mismo guard | Apache-2.0 | Hugging Face |
| Horizon-Labs/prompt-injection-guard-large | no disponible en la información | no disponible | Variante ampliada del mismo guard | Apache-2.0 | Hugging Face |

La comparativa se limita a los modelos mencionados en la model card. No se dispone de datos de rendimiento comparativos entre ellos en la información proporcionada.

## Limitaciones y advertencias

- Es un clasificador, no un generador: no mitiga por sí solo todos los ataques; debe combinarse con otras defensas (aislamiento de contenido, permisos mínimos en herramientas, validación de salidas).
- Riesgo de falsos negativos ante ataques novedosos o muy ofuscados que no se parezcan a los patrones de entrenamiento; el umbral de decisión debe calibrarse según el caso de uso.
- Riesgo de falsos positivos en textos legítimos que contengan instrucciones o meta-lenguaje (por ejemplo, documentación sobre seguridad o prompts de ejemplo); la model card reporta buenas cifras en NotInject y OR-Bench-hard, pero no elimina el problema.
- La cobertura multilingüe se basa en datos sintéticos en 30 idiomas; el rendimiento real puede variar entre idiomas y no se aportan métricas por idioma.
- Para documentos de más de 8.000 tokens es necesario aplicar ventanas solapadas; sin ese preprocesado, el contenido más allá del límite no se inspecciona.
- Licencia Apache-2.0: permite uso comercial, pero conviene revisar las licencias de los conjuntos de datos de entrenamiento si se redistribuye el modelo o se realizan afirmaciones de cumplimiento.
- No se han publicado métricas de sesgo ni evaluaciones de robustez adversarial independientes en la información disponible.
- La fecha de creación del repositorio (2026-09-23) y la de actualización (2026-11-09) indican un modelo reciente; la información sobre su adopción en producción es limitada (7.092 descargas y 6 likes en el momento de la consulta).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Horizon-Labs/prompt-injection-guard-base
- Demo en el navegador: https://huggingface.co/spaces/Horizon-Labs/prompt-injection-guard
- Variante small: https://huggingface.co/Horizon-Labs/prompt-injection-guard-small
- Variante large: https://huggingface.co/Horizon-Labs/prompt-injection-guard-large
- Código fuente (datos, entrenamiento, evaluación): https://github.com/horizon-ai-labs/agent-io-guards
- Modelo base: https://huggingface.co/jhu-clsp/mmBERT-base
- Modelo de referencia con el mismo convenio de etiquetas: https://huggingface.co/protectai/deberta-v3-base-prompt-injection-v2
