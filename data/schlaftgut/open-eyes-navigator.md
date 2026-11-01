# SchlaftGut/open-eyes-navigator

## Resumen

open-eyes navigator v1 es un modelo ligero especializado en tareas de navegador, desarrollado por SchlaftGut como componente del proyecto open-eyes, una CLI que permite a agentes de IA "ver" y operar sobre un navegador real y visible. El modelo actúa como navegador autónomo dentro del comando `open-eyes do "<objetivo>"`: lee el estado de la página y ejecuta acciones concretas (clics, rellenar formularios, seleccionar opciones, pulsar teclas, hacer scroll o hover), devolviendo al agente principal solo un informe breve de unos 30 tokens en lugar de procesar cada snapshot completo. Esto reduce drásticamente el coste y el contexto consumido por el agente orquestador.

Técnicamente, es un fine-tune de Gemma 4 E2B (versión instruct, con 4.628 millones de parámetros) entrenado mediante QLoRA (rank 16, alpha 32) sobre el modelo de lenguaje, fusionado y cuantizado a GGUF para su ejecución con llama.cpp. Su entrenamiento se realizó con 55 trazas grabadas en sitios públicos que cubren búsquedas, formularios, desplegables nativos y personalizados, diálogos, tablas, iframes y páginas con intentos de inyección de prompts que el modelo debe ignorar.

Su relevancia actual radica en la tendencia de agentes locales capaces de automatizar tareas web rutinarias sin depender de APIs de navegador en la nube: un modelo de 2,19 GB que cabe en hardware de consumo y que, según la evaluación del autor, supera a su modelo base en tasa de éxito (91,1 % frente a 84,4 %) y elimina las afirmaciones falsas de éxito.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Gemma 4 E2B-it), fine-tune con QLoRA |
| Parametros totales | 4.628.569.635 (≈4,63 B) |
| Parametros activos | no disponible (no se indica arquitectura MoE) |
| Longitud de contexto | 16.384 tokens (valor recomendado en la configuración de llama-server) |
| Tipos de cuantizacion | Q4_0 en capas, embeddings por capa en Q2_K (23 % más pequeño que el Q4_0 base); variante con embeddings en Q6_K |
| Idiomas soportados | Inglés (entrenado solo con sitios en inglés; el modelo base Gemma 4 E2B-it soporta más idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (endpoints compatibles con llama.cpp) |

## Arquitectura y entrenamiento

El modelo parte de Gemma 4 E2B-it, un transformer instruct de Google con aproximadamente 4,63 mil millones de parámetros, licenciado bajo Apache 2.0. Sobre este modelo base se aplicó un fine-tune con QLoRA (rank 16, alpha 32) restringido al modelo de lenguaje, durante 3 épocas, ejecutado en una GPU T4 gratuita. El resultado se fusionó (merge) y cuantizó a GGUF, con Q4_0 en las capas y los embeddings por capa en Q2_K, lo que reduce el tamaño un 23 % respecto al Q4_0 base (2,19 GB frente a 2,84 GB).

El dataset de entrenamiento consiste en 55 trazas grabadas con `open-eyes trace` sobre sitios públicos (Wikipedia, Hacker News, GitHub, MDN, PyPI, npm, demoqa, the-internet) y páginas locales. Las tareas cubren búsquedas, formularios, desplegables nativos y personalizados, diálogos, tablas, iframes, esperas de contenido dinámico, rechazos honestos de objetivos imposibles y páginas con inyección de prompts que el modelo debe ignorar. Las trazas no se han publicado. Un detalle técnico relevante: la función de pérdida solo cubre las tool calls generadas por el modelo, nunca el contenido de la página, lo que concentra el aprendizaje en la toma de decisiones de navegación.

## Capacidades

- Navegación autónoma de tareas web rutinarias: clic, relleno de campos, selección, pulsación de teclas, scroll y hover sobre páginas reales.
- Tool calling estricto: está diseñado para operar con dos herramientas (`open_eyes` y `finish`) mediante `tool_choice: "required"`, siempre emitiendo llamadas a herramientas.
- Gestión de elementos de interfaz complejos: desplegables nativos y personalizados, diálogos, tablas e iframes.
- Espera de contenido dinámico: sabe esperar a que la página cargue contenido antes de actuar.
- Rechazo honesto de objetivos imposibles: entrenado para no fingir éxito cuando la tarea no puede completarse.
- Resistencia a inyección de prompts: entrenado con páginas que contienen intentos de inyección que debe ignorar.
- Integración como subagente: devuelve informes breves (~30 tokens) al agente principal, minimizando el consumo de contexto del orquestador.
- Capacidades generales de Gemma 4 E2B-it (conversación, generación de texto) fuera del bucle de navegación, aunque sin ajuste específico para ello.

## Casos de uso

- Automatización de registros y altas en sitios web: con `open-eyes do "Sign up as Ana and accept the terms"` el modelo rellena formularios de registro y acepta términos sin intervención humana, adecuado para pruebas de QA de flujos de alta.
- Búsquedas estructuradas en sitios públicos: puede realizar búsquedas en Wikipedia, GitHub, MDN, PyPI o npm y extraer el resultado, útil para pipelines de recopilación de información.
- Rellenado de formularios con desplegables personalizados: gestiona componentes de UI no estándar (dropdowns custom, diálogos modales) que rompen a los scrapers clásicos basados en selectores CSS.
- Subagente de navegador para frameworks de agentes: un agente principal (por ejemplo, un LLM mayor) delega la navegación en este modelo y solo recibe un informe de ~30 tokens, ahorrando contexto y coste de tokens del orquestador.
- Pruebas end-to-end de aplicaciones web: ejecución repetible de flujos de usuario (login, navegación de menús, interacción con tablas) verificable contra la página o la API del sitio.
- Ejecución local y privada de tareas de navegador: al ser un GGUF de 2,19 GB ejecutable con llama.cpp, permite automatizar navegación en entornos sin conexión o con requisitos de privacidad, sin enviar datos a servicios externos.

## Benchmarks y rendimiento

Evaluación del autor: 15 tareas retenidas (no vistas en entrenamiento), 3 ejecuciones cada una, con el `open-eyes do` real sobre llama.cpp b11836. El éxito se verifica sobre la página o contra la API del sitio, no a partir de la respuesta del modelo.

| Model | Size | Passed (3 × 15) | False success claims |
|---|---|---|---|
| Gemma 4 E2B Q4_0 (base) | 2,84 GB | 84,4 % | 3 |
| open-eyes navigator v1 (este archivo) | 2,19 GB | 91,1 % | 0 |
| open-eyes navigator v1, embeddings en Q6_K | 3,35 GB | 95,6 % | 0 |

No se han publicado benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Los resultados se obtienen sobre sitios en vivo, por lo que varían algunos puntos entre rondas.

## Requisitos de hardware

- VRAM estimada para inferencia: unos 2,2 GB solo para los pesos en Q4_0/Q2_K; con contexto de 16.384 tokens y overhead de llama.cpp, aproximadamente 3-4 GB de VRAM (o RAM, si se ejecuta en CPU).
- GPU recomendadas: cualquier GPU moderna con 4 GB de VRAM es suficiente (por ejemplo, RTX 3060, RTX 4060 o superior). El entrenamiento original se realizó en una T4 gratuita.
- Consumer GPUs: cabe cómodamente en GPUs de consumo de gama media; también es viable en CPU dada la cuantización agresiva de los embeddings.
- Opciones de despliegue: llama.cpp (llama-server, método documentado por el autor con `--jinja -c 16384`), y por extensión cualquier runtime compatible con GGUF (Ollama, LM Studio). No se menciona soporte para vLLM o TGI al ser un GGUF.
- Latencia y throughput: no disponibles. Al ser un modelo de ~2B parámetros cuantizado a 4 bits, se espera inferencia rápida incluso en hardware modesto, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Tamaño | Contexto | Especialización | Licencia |
|---|---|---|---|---|---|
| open-eyes navigator v1 | 4,63 B (base E2B) | 2,19 GB (GGUF) | 16.384 tokens | Navegación web con tool calling (open-eyes) | Apache 2.0 |
| Gemma 4 E2B Q4_0 (modelo base) | 4,63 B | 2,84 GB (GGUF) | no disponible | Modelo general instruct | Apache 2.0 |
| open-eyes navigator v1 (embeddings Q6_K) | 4,63 B | 3,35 GB (GGUF) | 16.384 tokens | Navegación web con tool calling (open-eyes) | Apache 2.0 |

En su nicho (agentes de navegador locales y ligeros), los alternativas más habituales son modelos de visión de mayor tamaño (por ejemplo, variantes de 7B+ para browser agents con capturas de pantalla), que exigen más VRAM. No hay datos comparativos publicados frente a otros browser agents en la información disponible.

## Limitaciones y advertencias

- Al ser un modelo de ~2B parámetros (base E2B), puede divagar en tareas largas de múltiples páginas y agotar sus pasos; el agente que invoca `open-eyes do` debería verificar el resultado (por ejemplo, con `open-eyes snapshot --find`) antes de confiar en él.
- Entrenado exclusivamente con sitios en inglés: el rendimiento en sitios en otros idiomas, incluido el castellano, no está garantizado.
- Requiere los guardrails de open-eyes (política de sitios, confirmación Allow/Deny para acciones arriesgadas, registro de auditoría); estos mecanismos viven en la herramienta, no en el modelo, por lo que usarlo fuera de ese entorno pierde esas protecciones.
- Está ajustado para un bucle de herramientas muy específico (system prompt y las herramientas `open_eyes` y `finish` con `tool_choice: "required"`); fuera de ese bucle se comporta como el Gemma 4 E2B base, sin mejora garantizada.
- La evaluación se realiza sobre sitios en vivo, por lo que los resultados varían algunos puntos entre ejecuciones y pueden degradarse si cambian las páginas objetivo.
- Riesgo de alucinación: la evaluación del autor reporta 0 afirmaciones falsas de éxito en la variante Q4_0/Q2_K, pero esta métrica proviene de una sola evaluación con 45 ejecuciones; no hay garantías en dominios no vistos.
- Las trazas de entrenamiento no son públicas, lo que dificulta auditar la cobertura real del dataset.
- Licencia Apache 2.0: sin restricciones para uso comercial.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/SchlaftGut/open-eyes-navigator
- Modelo base (Gemma 4 E2B-it): https://huggingface.co/google/gemma-4-E2B-it
- Repositorio de open-eyes (CLI): https://github.com/SchlaftGut0-1/open-eyes
