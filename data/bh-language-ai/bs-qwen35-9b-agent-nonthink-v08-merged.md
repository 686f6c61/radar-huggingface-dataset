# BH-Language-AI/bs-qwen35-9b-agent-nonthink-v08-merged

## Resumen

LUMI-9B v08 es un ajuste fino (fine-tune) del modelo Qwen/Qwen3.5-9B, desarrollado por BH-Language-AI y orientado a tareas de agente y tool-calling en lenguas del espacio bosnio-croata-serbio (bs, hr, sr) junto con inglés. Se distribuye como pesos completos ya fusionados (`merge_and_unload` del adaptador PEFT), en precisión bfloat16, listo para desplegarse directamente en vLLM, TGI o transformers sin necesidad de cargar el adaptador por separado. El modelo tiene 9.409.813.744 parámetros y un repositorio de 18,8 GB.

El problema que aborda es la falta de modelos con competencia real en bosnio, croata y serbio para flujos agénticos: llamada de herramientas estructurada, seguimiento de instrucciones y conversación multi-turno. El ajuste se ha entrenado sobre un dialecto XML propio para las llamadas a herramientas (`<tool_call>{"name": "ALAT", "arguments": {...}}</tool_call>`), lo que implica que los prompts de sistema deben proporcionar las herramientas en ese formato concreto.

La relevancia actual es doble: por un lado, cubre un hueco lingüístico poco atendido en el ecosistema open source; por otro, la model card documenta resultados medidos con un harness propio (fecha 22.11.2026) que muestran mejoras claras en las evaluaciones en bosnio (golden 79,1 % frente a 74,4 % de la base) y en tool bench (98,6 %), a costa de un retroceso en matemáticas (GSM8K 0,845 frente a 0,925 de la versión v06) y en seguimiento de instrucciones estricto (IFEval p-strict 0,730 frente a 0,830 de la base).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Qwen3.5-9B); detalles internos no disponibles en la informacion proporcionada |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en bfloat16) |
| Idiomas soportados | bs (bosnio), hr (croata), sr (serbio), en (ingles) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (bf16, pesos completos fusionados) |

## Arquitectura y entrenamiento

El modelo es un fine-tune completo sobre Qwen/Qwen3.5-9B, un transformer decoder-only de 9,4 mil millones de parámetros. El proceso consistió en entrenar un adaptador LoRA/PEFT (publicado como `bs-qwen35-9b-agent-nonthink-v08`) y posteriormente fusionarlo con los pesos base mediante `peft.merge_and_unload`, generando un checkpoint autónomo en bfloat16. La model card no detalla la arquitectura interna de la base (número de capas, cabezas, tipo de atención ni longitud de contexto), por lo que esos datos quedan como no disponibles.

En cuanto a los datos, el autor indica una mezcla de fuentes públicas (tulu-3, IFEval-personas, GSM8K) e internas, sin auditoría completa de procedencia por fuente. El entrenamiento está orientado a comportamiento agéntico y tool-calling con un dialecto XML propio, y la variante "nonthink" sugiere que se ha desactivado o evitado el modo de razonamiento extendido. La model card documenta además un experimento negativo: se probó DPO sobre pares de GSM8K y no mejoró el rendimiento (GSM8K 0,820 y degradación de otros comportamientos), por lo que se descartó.

## Capacidades

- Generación de texto conversacional multi-turno en bosnio, croata, serbio e inglés.
- Tool calling / function calling con un dialecto XML específico: `<tool_call>{"name": "ALAT", "arguments": {...}}</tool_call>`.
- Comportamiento agéntico orientado a pipelines de herramientas, con un resultado de 98,6 % en el tool bench interno de 72 casos.
- Seguimiento de instrucciones (IFEval p-strict 0,730), suficiente para tareas guiadas pero por debajo de la base.
- Razonamiento matemático básico (GSM8K strict 0,845), funcional pero no fiable en aritmética aplicada.
- Capacidades multilingües centradas en el espacio BCS; el inglés se mantiene prácticamente al nivel de la base (golden 96,7 %).
- No se documentan capacidades de visión, audio ni modo thinking; el nombre "nonthink" indica explícitamente la ausencia de razonamiento extendido.
- La carga con `AutoModelForImageTextToText` en la model card sugiere compatibilidad con la clase multimodal de la familia Qwen3.5, pero no se confirman capacidades de visión en la información disponible.

## Casos de uso

- Asistentes conversacionales en bosnio, croata y serbio: el modelo mantiene conversaciones multi-turno con calidad medida en BS golden (79,1 %) y BS-Eval (72,75 %), adecuado para atención al cliente regional donde los modelos generalistas rinden peor.
- Agentes con llamada de herramientas en producción: el 98,6 % en tool bench interno y el formato XML documentado permiten integrarlo en orquestadores que parseen `<tool_call>` para ejecutar APIs, consultas a bases de datos o acciones sobre CRM.
- Automatización de back-office con herramientas deterministas: dado que la aritmética monetaria (PDV/ERP) no es fiable, el patrón recomendado es que el modelo decida qué herramienta invocar y que el cálculo lo realice un servicio externo determinista.
- Enrutamiento y clasificación de intenciones en sistemas multiagente: el modelo puede actuar como capa de decisión que selecciona la herramienta o el subagente adecuado a partir del turno del usuario, en los cuatro idiomas soportados.
- Generación de respuestas asistidas en inglés: con un 96,7 % en EN golden, sirve para tareas de redacción y respuesta guiada en inglés dentro de productos cuyo mercado principal es la región BCS.
- Extracción de parámetros estructurados: el entrenamiento en JSON dentro de etiquetas XML facilita convertir lenguaje natural en argumentos de función tipados, útil para formularios, reservas o tickets.
- Despliegue self-hosted con vLLM o TGI: al ser pesos completos en bf16 con licencia Apache-2.0, encaja en infraestructura propia sin dependencias de PEFT ni restricciones comerciales.

## Benchmarks y rendimiento

Resultados publicados en la model card (harness propio, medidos el 22.11.2026):

| Metrica | v08 (este modelo) | v06 | Qwen3.5-9B base |
|---|---|---|---|
| BS golden (43) | 79,1 % | 72,1 % | 74,4 % |
| BS-Eval v1 (400) | 72,75 % | 72,0 % | 72,5 % |
| EN golden (30) | 96,7 % | 93,3 % | 96,7 % |
| Tool bench (72) | 98,6 % | 100,0 % | 97,2 % |
| GSM8K strict | 0,845 | 0,925 | 0,790 |
| IFEval p-strict | 0,730 | 0,795 | 0,830 |

No se han publicado resultados de benchmarks estándar externos (MMLU, HumanEval, etc.) en la información disponible. El autor advierte que los conjuntos de evaluación son pequeños y que diferencias de 1-2 casos son ruido estadístico.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 19 GB solo para pesos, más overhead de KV cache; en la práctica se recomienda un mínimo de 24 GB.
- Cuantización a 8 bits: en torno a 10-11 GB de pesos; a 4 bits, en torno a 5-6 GB, aunque el autor no publica versiones cuantizadas ni valida su calidad.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 6000 Ada para despliegue en bf16 con concurrencia; una RTX 4090 (24 GB) puede alojar los pesos en bf16 con contexto moderado.
- GPU de consumo: cabe en RTX 4090 y, con cuantización, en GPUs de 12-16 GB (RTX 4080, 4070 Ti Super), siempre que se genere o convierta una versión GGUF/AWQ.
- Opciones de despliegue: vLLM (`--trust-remote-code`), TGI y transformers (la model card usa `AutoModelForImageTextToText` con `dtype="bfloat16"`). No se documentan pesos GGUF ni Ollama en el repositorio.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| LUMI-9B v08 (este) | 9,41 B | no disponible | Apache-2.0 | Fine-tune agéntico BCS; tool bench 98,6 %, GSM8K 0,845, IFEval 0,730 |
| Qwen3.5-9B base | 9 B (aprox.) | no disponible | Apache-2.0 | Base del fine-tune; mejor IFEval (0,830), peor BS golden (74,4 %) |
| LUMI-9B v06 (adaptador previo) | 9 B (aprox.) | no disponible | Apache-2.0 | Mejor GSM8K (0,925) e IFEval (0,795), tool bench 100 %; peor en bosnio |
| Alternativas BCS de otros autores | no disponible | no disponible | no disponible | No se dispone de información sobre modelos comparables en la misma categoría lingüística |

## Limitaciones y advertencias

- Matemáticas y aritmética aplicada: GSM8K strict baja a 0,845 y la model card advierte que la aritmética monetaria (PDV/ERP) no es fiable sin una capa determinista externa.
- Seguimiento de instrucciones: IFEval p-strict de 0,730, por debajo de la base (0,830) y de v06 (0,795); puede incumplir restricciones de formato en prompts complejos.
- Riesgo de alucinación: no se documenta mitigación específica; el entrenamiento con datos internos no auditados aumenta la incertidumbre sobre comportamientos en dominios no cubiertos.
- Sesgos: no se publica análisis de sesgos; los datos internos de origen no especificado impiden evaluar su representatividad.
- Evaluaciones frágiles: los conjuntos golden son pequeños (43 casos en BS, 30 en EN, 72 en tool bench) y el propio autor señala que las diferencias de 1-2 casos son ruido.
- Formato de tool calling no estándar: exige el dialecto XML propio y herramientas en el system prompt; los frameworks que esperan JSON nativo o el formato de OpenAI requerirán adaptación.
- Idiomas: solo se validan bs, hr, sr y en; no hay evidencia de rendimiento en otras lenguas ni de calidad en variantes dialectales.
- Licencia: Apache-2.0 permite uso comercial, pero la procedencia de los datos de entrenamiento no está auditada en su totalidad, lo que traslada cierto riesgo de compliance al desplegador.
- Repositorio sin tracción: 0 descargas y 0 likes en el momento de la consulta, sin comunidad que valide los resultados de forma independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/BH-Language-AI/bs-qwen35-9b-agent-nonthink-v08-merged
- Adaptador PEFT de origen: https://huggingface.co/BH-Language-AI/bs-qwen35-9b-agent-nonthink-v08
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
