# Horizon-Labs/prompt-injection-guard-small

## Resumen

Prompt Injection Guard (small) es un clasificador de texto de 140,6 millones de parametros desarrollado por Horizon-Labs, disenado para detectar intentos de prompt injection y jailbreak tanto en mensajes de usuario (inyeccion directa) como en contenido no confiable que un agente de IA procesa: correos electronicos, paginas web, documentos, fragmentos de RAG y salidas de herramientas o API (inyeccion indirecta). Se construye sobre el backbone multilingue jhu-clsp/mmBERT-small y se distribuye con licencia Apache-2.0 sin restricciones de acceso.

Su relevancia actual reside en el despliegue masivo de agentes que leen contenido externo no verificado. El modelo se entrena con documentos realistas de 45 tipos en los que se han plantado inyecciones, junto con sus contrapartidas limpias, de modo que aprende a identificar instrucciones dirigidas al modelo y no simples palabras amenazantes. Esto se traduce en una tasa baja de falsos positivos sobre texto benigno que se parece a un ataque: 96,2 % en NotInject y 99,5 % en OR-Bench-hard.

El modelo ofrece 8.192 tokens de contexto, soporte para 30 idiomas en los datos de entrenamiento sintetico y artefactos listos para produccion en PyTorch, ONNX (fp32 e int8) y transformers.js, lo que permite ejecutarlo desde servidores con GPU hasta el navegador. La convencion de etiquetas `SAFE` (0) e `INJECTION` (1) es identica a la de `protectai/deberta-v3-base-prompt-injection-v2`, por lo que actua como reemplazo directo en codigo y herramientas ya existentes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (ModernBERT / mmBERT-small) para clasificacion de secuencias |
| Parametros totales | 140.642.306 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 8.192 tokens |
| Tipos de cuantizacion | ONNX fp32 y ONNX int8 (embeddings cuantizados); soporte q8 en transformers.js |
| Idiomas soportados | Multilingue; datos sinteticos en 30 idiomas, con etiquetas para en, de, fr, es, pt, it, nl, pl, ru, uk, tr, ar, hi, zh, ja, ko, vi, id, th |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors, ONNX (`onnx/model.onnx`, `onnx/model_quantized.onnx`) |

## Arquitectura y entrenamiento

El modelo es un encoder transformer de la familia ModernBERT en su variante multilingue mmBERT-small, con una cabeza de clasificacion binaria sobre la representacion del token de agregacion. La tarea es text-classification con dos etiquetas: `SAFE` (0) e `INJECTION` (1). El contexto de 8.192 tokens permite analizar documentos completos o fragmentos largos de RAG en una sola pasada; para entradas mayores la model card recomienda ventanas solapadas con stride y agregacion por maximo de probabilidad.

El entrenamiento combina conjuntos publicos de inyeccion y jailbreak (neuralchemy/Prompt-injection-dataset, S-Labs/prompt-injection-dataset, microsoft/llmail-inject-challenge, hendzh/PromptShield, TrustAIRLab/in-the-wild-jailbreak-prompts, nvidia/Nemotron-RL-Agentic-Indirect-Prompt-Injection-v1, 3nesdeniz/agentic-prompt-injection-5k, rgeada/tool-response-injections, JailbreakV-28K/JailBreakV-28k, nvidia/Nemotron-RL-Jailbreak-Robustness-v1) con datos de instrucciones generales (OpenAssistant/oasst2, CohereLabs/aya_dataset) y corpus web (HuggingFaceFW/fineweb-edu, fineweb-2). La innovacion metodologica destacable es el uso de documentos realistas de 45 tipos con inyecciones plantadas y sus versiones limpias emparejadas, lo que reduce el sesgo hacia palabras clave y mejora la deteccion de instrucciones dirigidas al agente. No se especifican en la informacion disponible el numero total de tokens de entrenamiento ni si se aplico RLHF o DPO.

## Capacidades

- Clasificacion binaria de prompt injection directa en mensajes de usuario: anulacion de instrucciones, mensajes falsos de sistema o desarrollador, trucos de delimitadores.
- Deteccion de jailbreaks: adopcion de personajes, modo desarrollador, encuadres hipoteticos y tecnicas orientadas a eliminar las reglas del modelo.
- Deteccion de extraccion de system prompt.
- Deteccion de inyeccion indirecta en contenido no confiable: correos, paginas web, documentos, fragmentos de RAG y respuestas de herramientas o API, incluyendo instrucciones ocultas en HTML.
- Capacidad multilingue sobre 30 idiomas de entrenamiento sintetico, con ejemplos verificados en aleman y otros idiomas europeos y asiaticos.
- Entradas largas de hasta 8.192 tokens, con patron de ventanas solapadas para documentos de longitud arbitraria.
- Integracion con LLM Guard mediante el escaner `PromptInjection` y compatibilidad con Text Embeddings Inference y endpoints.
- Despliegue en navegador y entornos JavaScript mediante transformers.js con cuantizacion q8.
- No soporta generacion de texto, tool calling, vision ni audio: es exclusivamente un clasificador.

## Casos de uso

- Filtrado de entrada en asistentes conversacionales: se ejecuta el clasificador sobre cada mensaje del usuario antes de enviarlo al LLM principal; si la probabilidad supera el umbral configurado, se bloquea o se sanea la peticion. Su latencia baja y su tamano de 141 M lo hacen apto para estar en la ruta critica.
- Proteccion de agentes que leen contenido externo: antes de inyectar en el contexto del agente el resultado de una herramienta, una pagina web o un correo, se calcula la puntuacion de inyeccion con ventanas solapadas; si supera el umbral, el contenido se sustituye por un marcador de contenido eliminado.
- Seguridad en pipelines de RAG: se analiza cada fragmento recuperado antes de incorporarlo al prompt, lo que mitiga ataques de envenenamiento de la base de conocimiento y de documentos con instrucciones ocultas.
- Moderacion de contenido generado por usuarios en plataformas: deteccion de intentos de jailbreak en comentarios, formularios y chats publicos, con la posibilidad de registrar la puntuacion para auditoria.
- Gateway de seguridad para API de LLM: integracion como escaner de entrada en LLM Guard o en un proxy propio, aplicando umbrales por tenant y por tipo de contenido (mensaje de usuario frente a salida de herramienta).
- Analisis de correo electronico empresarial: inspeccion de cuerpos y adjuntos textuales en busca de instrucciones dirigidas a asistentes de correo, como exfiltracion de datos o envio de mensajes a direcciones externas.
- Ejecucion en el cliente: con transformers.js y cuantizacion q8, el filtro puede correr en el navegador o en el edge, reduciendo la exposicion de datos sensibles y el coste de servidor.
- Evaluacion offline de corpus: clasificacion por lotes de conjuntos de datos historicos para medir la prevalencia de intentos de inyeccion y calibrar umbrales antes del despliegue.

## Benchmarks y rendimiento

| Benchmark | Resultado | Notas |
|---|---|---|
| NotInject | 96,2 % | Tasa baja de falsos positivos sobre texto benigno que imita ataques |
| OR-Bench-hard | 99,5 % | Tasa baja de falsos positivos sobre peticiones benignas dificiles |

No se han publicado en la informacion disponible resultados de MMLU, HumanEval, GSM8K ni de exactitud o recall sobre conjuntos de inyeccion etiquetados. Tampoco se han publicado mediciones de latencia o throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,6 GB en fp32 (141 M de parametros) y alrededor de 0,3 GB con la variante ONNX int8.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; A100, H100, L4, T4 y RTX 4090 son sobredimensionadas para este modelo y se usarian solo por agregacion de carga.
- Cabe en GPU de consumo: si, en cualquier GPU consumer moderna (RTX 3060, RTX 4060, GTX 1660 y superiores) e incluso en CPU para inferencia por lotes moderados.
- Opciones de despliegue: PyTorch con transformers, ONNX Runtime, transformers.js, LLM Guard, Text Embeddings Inference y endpoints compatibles.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada; por el tamano del modelo se espera inferencia en el orden de milisegundos en GPU y decenas de milisegundos en CPU, aunque no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| Horizon-Labs/prompt-injection-guard-small | 141 M | 8.192 | 30 (entrenamiento) | Apache-2.0 | Misma convencion de etiquetas que protectai v2; ONNX y transformers.js |
| protectai/deberta-v3-base-prompt-injection-v2 | no disponible en la informacion | no disponible | principalmente ingles | no disponible | Referencia de compatibilidad de etiquetas segun la model card |
| Horizon-Labs/prompt-injection-guard-base | no disponible | no disponible | multilingue | Apache-2.0 | Variante de mayor tamano de la misma familia |
| Horizon-Labs/prompt-injection-guard-large | no disponible | no disponible | multilingue | Apache-2.0 | Variante de mayor tamano de la misma familia |

Los datos de parametros, contexto y licencia de los modelos alternativos no se detallan en la informacion proporcionada; solo se confirma la existencia de las variantes base y large de la misma familia y la compatibilidad de etiquetas con protectai/deberta-v3-base-prompt-injection-v2.

## Limitaciones y advertencias

- Es un clasificador binario, no un generador: no puede sustituir al LLM ni razonar sobre el contenido, solo puntuar la probabilidad de inyeccion.
- Riesgo de falsos negativos ante ataques novedosos, ofuscaciones o inyecciones muy sutiles que no se parezcan a los patrones de entrenamiento; se recomienda combinarlo con otras defensas en profundidad.
- Riesgo de falsos positivos en contenido legitimo que contenga instrucciones dirigidas a personas o metaforas sobre IA; el umbral debe calibrarse por caso de uso.
- La cobertura multilingue se basa en datos sinteticos en 30 idiomas; el rendimiento real en idiomas distintos del ingles y del aleman no esta cuantificado en la informacion disponible.
- El contexto de 8.192 tokens obliga a usar ventanas solapadas en documentos largos, lo que anade coste computacional y puede diluir senales localizadas si la agregacion no es la adecuada.
- No se han publicado metricas de recall ni de exactitud sobre conjuntos de inyeccion etiquetados, ni evaluaciones de sesgo; la robustez frente a ataques adversariales adaptativos no esta documentada.
- La licencia Apache-2.0 permite uso comercial sin restricciones adicionales, pero el usuario es responsable del cumplimiento normativo en su jurisdiccion.
- En produccion conviene registrar las puntuaciones y revisar periodicamente los umbrales, ya que la distribucion de ataques cambia con el tiempo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Horizon-Labs/prompt-injection-guard-small
- Demo en el navegador: https://huggingface.co/spaces/Horizon-Labs/prompt-injection-guard
- Variante base: https://huggingface.co/Horizon-Labs/prompt-injection-guard-base
- Variante large: https://huggingface.co/Horizon-Labs/prompt-injection-guard-large
- Codigo fuente (datos, entrenamiento, evaluacion): https://github.com/horizon-ai-labs/agent-io-guards
- Modelo base: https://huggingface.co/jhu-clsp/mmBERT-small
