# KerzgrAI/Senryu-2.1-1B

## Resumen

Senryu-2.1-1B es un modelo de lenguaje causal orientado a chat desarrollado por KerzgrAI. Su núcleo tiene 1.094.961.660 parámetros y emplea una arquitectura híbrida que combina Gated DeltaNet-2 con Parallax attention, a la que se añade un módulo de memoria n-gram (engram) de 2,17 B de parámetros. Es la segunda iteración sobre la arquitectura Senryu-2 y se presenta como reemplazo directo de Senryu-2-1B: conserva arquitectura, tokenizador y plantilla de chat.

El modelo está afinado mediante SFT para instrucciones, conversación, razonamiento, uso de herramientas y seguimiento de system prompts. El entrenamiento continúa el de Senryu-2-1B con 2,06 B de tokens adicionales; los últimos 827 M se centran en conversaciones nuevas con traza de razonamiento en el bloque `<think>`, 119.137 conversaciones respondidas bajo su propio system prompt y 36.929 conversaciones con un prompt por defecto y tres herramientas (`web-search`, `fetch-page` y `calculator`).

Su relevancia práctica está en el tamaño: un modelo de ~1,1 B de parámetros, licencia Apache 2.0 y capacidades de tool calling y razonamiento explícito, desplegable en GPU de consumo. Como contrapartida, solo soporta inglés, no hay benchmarks publicados en la información disponible y la longitud de contexto no está confirmada en la model card.

## Especificaciones tecnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Híbrida: Gated DeltaNet-2 + Parallax attention + memoria n-gram (engram); modelo causal denso |
| Parámetros totales | 1.094.961.660 (~1,09 B) en el núcleo |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la model card; fuentes de terceros discrepan: 4.096 tokens en Free2AITools y 32K en LLM Explorer |
| Tipos de cuantizacion | No disponible; solo se publican pesos safetensors y no se documentan GGUF, AWQ ni GPTQ |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (PyTorch; librería `tiny_gdn`) |
| Memoria n-gram (engram) | 2,17 B de parámetros adicionales |
| Modelo base | KerzgrAI/Senryu-2-1B (finetune) |
| Tamaño del repositorio | 6,5 GB |
| Plantilla de chat | Propia, con system prompt por defecto y fecha dinámica |
| Herramientas por defecto | `web-search`, `fetch-page`, `calculator` |

## Arquitectura y entrenamiento

La arquitectura es híbrida: combina capas Gated DeltaNet-2, un mecanismo de atención lineal con estado recurrente y compuertas, con Parallax attention, además de un módulo de memoria n-gram tipo engram de 2,17 B de parámetros. La model card no detalla el número de capas, la dimensión oculta, la distribución de capas híbridas ni el mecanismo exacto de recuperación de la memoria n-gram, por lo que esos datos se consideran no disponibles.

El entrenamiento parte de Senryu-2-1B y añade 2,06 B de tokens, con una fase final de 827 M tokens en la que la mitad son conversaciones nuevas con razonamiento explícito. Los datos combinan SFT de instrucciones y chat (SmolTalk, SmolTalk2, UltraChat 200k, OpenAssistant/oasst2, No Robots, Tulu-3 personas, WildChat-4.8M, LMSYS Chat), datos de agentes y tool calling (Nemotron-Agentic-v1, Nemotron-SFT-Agentic-v2 y v4, When2Call, Toucan-1.5M, Hermes reasoning tool use, Glaive function calling v2), datos de código y matemáticas (OpenCodeReasoning, OpenMathReasoning, Magicoder-Evol-Instruct-110K, self-oss-instruct-sc2), y datasets específicos de seguimiento de system prompts (SystemChat-2.0, SystemChat-1.1, SystemCheck, Multifaceted-Collection). No se especifica en la información disponible si hubo RLHF, DPO u otra etapa de preferencias.

La innovación destacable es la memoria n-gram de 2,17 B de parámetros, que amplía la capacidad del núcleo sin aumentar los parámetros activos del transformer, y el entrenamiento explícito bajo un system prompt con reglas de uso de herramientas. En las conversaciones con el prompt por defecto, solo cerca del 4 % realizaba alguna llamada a herramienta.

## Capacidades

- Generación de texto conversacional multi-turno en inglés, con plantilla de chat propia y soporte de system prompt.
- Razonamiento explícito mediante trazas en el bloque `<think>` en cada turno, entrenado en la fase final con conversaciones nuevas.
- Tool calling con tres herramientas predefinidas: `web-search` (búsqueda con resultados tipo Tavily), `fetch-page` (recuperación de URL con `offset`) y `calculator`.
- Seguimiento de system prompts: personas, formatos de salida, reglas y restricciones, entrenado con más de 119.000 conversaciones bajo prompts propios.
- Formateo de salida en Markdown: listas, tablas, bloques de código con vallas, nombres de archivo en código inline, matemáticas con delimitadores `$...$` y `$$...$$`, y secciones colapsables con `details`/`summary`.
- Generación y explicación de código, apoyada en datasets como Magicoder, self-oss-instruct y OpenCodeReasoning.
- Razonamiento matemático paso a paso, con uso de calculadora para aritmética no trivial.
- Gestión de fecha actual en el prompt por defecto (`Weekday, Month D, YYYY`).
- Capacidades multimodales: no disponibles; el modelo es solo texto.

## Casos de uso

- Atención al cliente automatizada en inglés: el modelo mantiene conversaciones multi-turno y puede fijarse una persona, tono y formato mediante system prompt, aprovechando el entrenamiento específico en seguimiento de instrucciones de sistema.
- Agente de investigación web: con `web-search` y `fetch-page` puede resolver consultas que requieren datos posteriores al entrenamiento, precios, resultados o páginas concretas, siguiendo la política entrenada de buscar solo cuando sea necesario.
- Asistente con calculadora para tareas financieras o analíticas: deriva la aritmética a `calculator` y presenta el resultado con formato Markdown y matemáticas en LaTeX.
- Generación y revisión de código en pipelines: admite bloques de código, razonamiento previo en `<think>` y explicaciones paso a paso, adecuado para integraciones ligeras en herramientas de desarrollo o CI/CD.
- Despliegue on-premise o en el borde: con ~1,1 B de parámetros en el núcleo y licencia Apache 2.0, es viable en GPU de consumo para prototipos, entornos con requisitos de privacidad o aplicaciones de bajo coste.
- Prototipado de agentes multi-step: las trazas de razonamiento y el formato de llamadas a herramientas permiten construir flujos de varios pasos y depurar las decisiones intermedias del modelo.
- Tutoría y explicación técnica en inglés: razonamiento matemático, explicaciones de conceptos y resúmenes estructurados con secciones colapsables para contenido extenso.
- Evaluación de robustez de system prompts: útil como modelo pequeño de referencia para probar personas, restricciones de formato y adherencia a reglas en sistemas de prompt engineering.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La ficha de Free2AITools muestra un índice propio ("Nexus Index") de 46,3, sin desglose de MMLU, HumanEval, GSM8K ni otras pruebas, por lo que no se trata de un benchmark comparable ni verificable. No se deben inferir capacidades de ese valor.

## Requisitos de hardware

- VRAM estimada para el núcleo en FP16/BF16: unos 2,2 GB solo para los pesos (coincide con la estimación de 2,2 GB de LLM Explorer); en int8, alrededor de 1,1 GB; en int4, alrededor de 0,6 GB. Son estimaciones teóricas, no medidas publicadas.
- La memoria n-gram de 2,17 B de parámetros añade huella adicional. El repositorio ocupa 6,5 GB, lo que sugiere que incluye núcleo y memoria, pero el desglose exacto no está documentado.
- VRAM total realista: entre 3 y 7 GB según el formato de pesos y si la memoria n-gram se carga completa; el dato exacto es no disponible.
- GPU de consumo: cabe en RTX 3060 12 GB, RTX 4060 Ti 16 GB y RTX 4090 24 GB. En tarjetas de 8 GB es probable solo con cuantización agresiva, que no está publicada.
- GPU de datacenter: A100 o H100 no son necesarias para inferencia individual; solo tendrían sentido para servir lotes grandes o evaluaciones masivas.
- Opciones de despliegue confirmadas: PyTorch con la librería `tiny_gdn` e inferencia mediante el script `inference.py` del repositorio; demo alojada en un Space ZeroGPU de Hugging Face.
- vLLM, llama.cpp, Ollama y TGI: no confirmados en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

Valores de los modelos comparables tomados de sus model cards públicas; no se han ejecutado evaluaciones comparativas para esta ficha.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Senryu-2.1-1B | 1,09 B de núcleo + 2,17 B de memoria n-gram | No confirmado (4.096 o 32K según fuentes de terceros) | Apache 2.0 | Hugging Face, demo ZeroGPU | Arquitectura híbrida Gated DeltaNet-2 + Parallax; tool calling y razonamiento explícito; solo inglés |
| Qwen2.5-1.5B | 1,54 B | 32.768 nativo; hasta 131.072 con YaRN | Apache 2.0 | Hugging Face, amplio ecosistema | Multilingüe, muchas cuantizaciones y soporte en vLLM, llama.cpp y Ollama |
| Llama 3.2 1B | 1,24 B | 128.000 | Llama 3.2 Community License | Hugging Face, ecosistema amplio | Multilingüe, licencia con restricciones de uso comercial y de despliegue |
| SmolLM2-1.7B | 1,71 B | 8.192 | Apache 2.0 | Hugging Face | Modelo pequeño entrenado con un volumen alto de tokens; sin memoria n-gram |
| Gemma 2 2B | 2,61 B | 8.192 | Gemma Terms of Use | Hugging Face | Mayor tamaño; licencia con condiciones de uso |

Senryu-2.1-1B se diferencia por la memoria n-gram y el entrenamiento intensivo en system prompts y herramientas, pero carece de la documentación de contexto, cuantizaciones y benchmarks que sí publican los modelos comparables.

## Limitaciones y advertencias

- Solo soporta inglés; no se ha entrenado ni evaluado para castellano u otros idiomas.
- Con ~1,1 B de parámetros en el núcleo, la tasa de alucinación en datos factuales es un riesgo alto; el uso de `web-search` mitiga solo parcialmente el problema y el modelo fue entrenado para buscar de forma restrictiva.
- No hay resultados publicados de MMLU, HumanEval, GSM8K ni otras pruebas; no se puede verificar su rendimiento frente a alternativas.
- La longitud de contexto no está confirmada y las fuentes de terceros discrepan entre 4.096 y 32K tokens; conviene validarla empíricamente antes de diseñar aplicaciones con contexto largo.
- El uso de herramientas es poco frecuente en el entrenamiento (aproximadamente el 4 % de las conversaciones con el prompt por defecto), lo que puede provocar que el modelo infrautilice las herramientas en producción.
- El prompt por defecto incluye la fecha actual; puede inducir respuestas condicionadas por esa fecha o requerir ajustes si se usa un system prompt distinto.
- Los datos de entrenamiento provienen de múltiples fuentes de terceros (Nemotron, WildChat, LMSYS, Glaive, entre otras); es responsabilidad del desplegador revisar sus condiciones y los posibles sesgos heredados.
- La licencia Apache 2.0 permite uso comercial, pero no se documentan las licencias individuales de todos los datasets; conviene auditar la procedencia antes de un despliegue comercial.
- El repositorio es muy reciente y con poca validación externa: 0 descargas y 1 like en el momento de la consulta, creado el 26 de octubre de 2026.
- No se publican cuantizaciones oficiales ni instrucciones de despliegue en motores estándar como vLLM, llama.cpp u Ollama.
- La información disponible de la model card está truncada, por lo que pueden faltar detalles sobre la arquitectura, el contexto y el esquema completo de herramientas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/KerzgrAI/Senryu-2.1-1B
- Modelo base Senryu-2-1B: https://huggingface.co/KerzgrAI/Senryu-2-1B
- Demo en Hugging Face Spaces: https://huggingface.co/spaces/KerzgrAI/senryu-2.1-1b-demo
- Perfil del autor: https://huggingface.co/KerzgrAI
- Ficha de terceros en Free2AITools: https://free2aitools.com/model/kerzgrai/senryu-2-1b
- Ficha de terceros en LLM Explorer: https://llm-explorer.com/model/KerzgrAI%2FSenryu-2-1B,3DI4Ueg0PbDUwekEN29I1
- Paper referenciado arXiv:2605.22791: https://arxiv.org/abs/2605.22791
- Paper referenciado arXiv:2605.29157: https://arxiv.org/abs/2605.29157
- Paper referenciado arXiv:2601.07372: https://arxiv.org/abs/2601.07372
