# CobuildX-AI/cbx-prompt-injection-detector-68M

## Resumen

cbx-prompt-injection-detector-68M es un clasificador de texto especializado en detectar ataques de inyección de prompts (prompt injection), tanto directos en mensajes de usuario como indirectos ocultos en correos, páginas web, resultados de herramientas y documentos recuperados. Lo desarrolla CobuildX-AI y está afinado a partir del encoder Ettin de 68 millones de parámetros (jhu-clsp/ettin-encoder-68m), una arquitectura ModernBERT. Su función es devolver una probabilidad calibrada de ataque, de modo que pueda integrarse como capa de seguridad en pipelines de asistentes y agentes basados en LLM.

El modelo resulta relevante porque la inyección de prompts es una de las principales superficies de ataque en aplicaciones con agentes que leen contenido no confiable (bandejas de entrada, navegación web, salidas de herramientas). Con solo 68M de parámetros ofrece una latencia muy baja (aproximadamente 12 ms por cada 1.000 tokens en GPU y 235 ms en CPU), lo que permite filtrar entradas en tiempo real sin añadir coste apreciable al pipeline.

La versión actual es v0.1, con licencia Apache 2.0 y pesos en safetensors. Existe también en variantes de 17M y 32M parámetros. El modelo está entrenado y evaluado únicamente en inglés y distingue el canal de origen del texto (mensaje de usuario, correo, página web, respuesta de herramienta, documento recuperado o desconocido), lo que modifica la definición de qué constituye un ataque.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT (encoder), afinado desde jhu-clsp/ettin-encoder-68m |
| Parametros totales | 68.148.231 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | ventanas deslizantes con solapamiento para entradas de más de 2.048 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un encoder transformer de tipo ModernBERT con 68M de parámetros, obtenido por fine-tuning del checkpoint jhu-clsp/ettin-encoder-68m. La tarea es clasificación de texto binaria (ataque / benigno) con salida de probabilidad calibrada. La inferencia sobre entradas largas se realiza mediante ventanas deslizantes con solapamiento: la puntuación final es la del ventana con mayor score, de forma que una inyección en cualquier punto del texto marca la entrada completa.

El autor no detalla en la model card el volumen de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO (no aplicables a un clasificador de este tipo). Sí se indica que el modelo lee conjuntamente el texto y el canal de origen (`user_message`, `email`, `web_page`, `tool_response`, `retrieved_document`, `unknown`), y que la definición de ataque depende del canal: en mensajes de usuario se marcan intentos de sobrescribir el system prompt, extraer instrucciones ocultas o desactivar comportamientos de seguridad; en el resto de canales se marca cualquier instrucción dirigida a la IA y también cualquier petición de acción sensible (mover dinero, enviar datos personales, cambiar credenciales, borrar datos). El umbral de decisión por defecto es 0,5 y es ajustable.

## Capacidades

- Detección de inyecciones directas en mensajes de usuario: sobrescritura del system prompt, extracción de instrucciones o secretos, jailbreaks.
- Detección de inyecciones indirectas en correos, páginas web, resultados de herramientas y documentos recuperados.
- Detección de peticiones de acciones sensibles en canales no interactivos, incluso si el texto va dirigido a una persona y no menciona a una IA.
- Clasificación consciente del canal: la misma frase puede puntuarse de forma distinta según el origen del texto.
- Salida de probabilidad calibrada (`score`) y decisión booleana con umbral configurable (`is_attack`).
- Procesamiento por lotes (`score_batch`) para múltiples textos y canales simultáneamente.
- Manejo de entradas largas mediante ventanas solapadas de 2.048 tokens.
- Distinción de falsos positivos habituales: peticiones legítimas del usuario, texto citado o discutido sobre ataques, correos ordinarios y código o logs que contienen palabras como "ignore" u "override".
- No se documentan capacidades de generación, razonamiento, código, matemáticas, visión, audio, tool calling ni agentes; es exclusivamente un clasificador.

## Casos de uso

- Filtrado de entrada en asistentes conversacionales: cada mensaje del usuario pasa por el detector con `channel="user_message"` antes de llegar al LLM, bloqueando intentos de sobrescribir el system prompt o extraer instrucciones internas con una latencia de milisegundos.
- Protección de agentes que leen correo: los cuerpos de correo se puntúan con `channel="email"` para detectar instrucciones dirigidas al agente y peticiones de acciones sensibles (transferencias, envío de datos) antes de que el agente actúe.
- Saneamiento de resultados de herramientas: las salidas de APIs y funciones externas se evalúan con `channel="tool_response"`, un escenario donde el modelo destaca según sus propias métricas (InjecAgent).
- Seguridad en pipelines RAG: los documentos recuperados se clasifican con `channel="retrieved_document"` para evitar que contenido envenenado en la base de conocimiento inyecte instrucciones al generador.
- Navegación web asistida por IA: el contenido de páginas visitadas por un agente se puntúa con `channel="web_page"`, útil frente a ataques alojados en webs (evaluado en BrowseSafe-bench).
- Moderación y auditoría de tráfico: el procesamiento por lotes permite analizar retrospectivamente logs de conversaciones o correos para identificar intentos de inyección y generar alertas de seguridad.
- Capa de defensa en despliegues con CPU: con 235 ms por 1.000 tokens en CPU, puede integrarse en servicios sin GPU como pre-filtro barato antes de modelos de seguridad más costosos.

## Benchmarks y rendimiento

Resultados publicados por el autor en la model card. Todas las métricas AP son average precision (mayor es mejor); "caught" es la proporción de ataques detectados y "flagged" la proporción de textos benignos marcados (menor es mejor). Cada modelo se evalúa en su umbral por defecto.

| Modelo | Params | CBX Benchmark AP | BrowseSafe-bench AP | BIPIA AP | deepset AP | InjecAgent caught | NotInject flagged | XSTest flagged |
|---|---|---|---|---|---|---|---|---|
| cbx-prompt-injection-detector-17M | 17M | 0,961 | 0,837 | 0,826 | 0,874 | 0,64 | 0,026 | 0,000 |
| cbx-prompt-injection-detector-32M | 32M | 0,979 | 0,832 | 0,764 | 0,843 | 0,55 | 0,026 | 0,000 |
| **cbx-prompt-injection-detector-68M** | 68M | 0,987 | 0,861 | 0,856 | 0,810 | 0,67 | 0,021 | 0,000 |
| PIGuard | 184M | 0,351 | 0,546 | 0,998 (posible contaminación) | 0,986 (posible contaminación) | 0,75 | 0,115 | 0,000 |
| Prompt Guard 2 86M | 86M | 0,254 | 0,786 | 0,859 | 0,917 | 0,50 | 0,047 | 0,000 |
| Prompt Guard 2 22M | 22M | 0,221 | 0,696 | 0,794 | 0,709 | 0,00 | 0,006 | 0,000 |
| ProtectAI v2 | 184M | 0,245 | 0,717 | 0,714 | 0,879 | 0,82 | 0,434 | 0,000 |
| deepset | 184M | 0,267 | 0,545 | 0,822 | 1,000 (posible contaminación) | 1,00 | 0,714 | 0,000 |

Advertencias del propio autor: el CBX Benchmark es un conjunto de evaluación propio (2.506 filas de pares ataque/limpio y negativos difíciles) generado por el mismo sistema que parte de los datos de entrenamiento, por lo que los modelos de CobuildX tienen ventaja en esa columna. BIPIA contiene un 75% de ataques, de modo que una clasificación aleatoria ya obtiene AP 0,75. En el split de test propio del autor (v2.2, 5.584 filas), el modelo de 68M alcanza AP 0,989, detectando el 93,7% de los ataques con un 2,8% de falsas alarmas. No se publican resultados de benchmarks de propósito general (MMLU, HumanEval, GSM8K), que no aplican a un clasificador.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; con pesos safetensors en fp32 el modelo ocupa aproximadamente 0,27 GB, y en fp16 alrededor de 0,14 GB. El repositorio completo pesa 0,3 GB.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM libre es suficiente; no requiere A100 ni H100. Funciona en GPUs consumer como RTX 3060, RTX 4060 o superiores.
- Cabe en GPU consumer y también en CPU: el autor reporta unos 12 ms por 1.000 tokens en GPU y 235 ms por 1.000 tokens en CPU.
- Opciones de despliegue: el repositorio incluye el wrapper `PromptInjectionDetector` (`cbx_prompt_injection.py`) con soporte de GPU si está disponible. No se documentan integraciones específicas con vLLM, llama.cpp, Ollama o TGI; al ser un encoder de clasificación, el despliegue habitual sería mediante Transformers o un servidor de inferencia de clasificación.
- Latencia y throughput: aproximadamente 12 ms por 1.000 tokens en GPU y 235 ms por 1.000 tokens en CPU, según el autor.

## Comparativa con modelos similares

| Modelo | Params | Licencia | Enfoque | InjecAgent caught | NotInject flagged | Disponibilidad |
|---|---|---|---|---|---|---|
| cbx-prompt-injection-detector-68M | 68M | Apache 2.0 | Clasificador con canal de origen, ModernBERT | 0,67 | 0,021 | HuggingFace (v0.1) |
| Prompt Guard 2 86M (Meta) | 86M | no disponible en la información | Clasificador de inyecciones y jailbreaks | 0,50 | 0,047 | HuggingFace |
| PIGuard | 184M | no disponible en la información | Clasificador de inyecciones | 0,75 | 0,115 | HuggingFace |
| ProtectAI v2 | 184M | no disponible en la información | Clasificador DeBERTa-v3 | 0,82 | 0,434 | HuggingFace |
| deepset deberta-v3-base-injection | 184M | no disponible en la información | Clasificador DeBERTa-v3 | 1,00 | 0,714 | HuggingFace |

El modelo de CobuildX es el más pequeño de la comparativa junto con Prompt Guard 2 22M y ofrece la mejor puntuación en CBX Benchmark y BrowseSafe-bench entre los modelos evaluados, con una tasa de falsos positivos en NotInject (0,021) inferior a la de Prompt Guard 2 86M (0,047), PIGuard (0,115) y ProtectAI v2 (0,434). En InjecAgent queda por debajo de PIGuard (0,75), ProtectAI v2 (0,82) y deepset (1,00), aunque este último con un 71,4% de textos benignos marcados. Las cifras de deepset y PIGuard en sus propios benchmarks están marcadas por el autor como posiblemente contaminadas.

## Limitaciones y advertencias

- Solo soporta inglés; el rendimiento en otros idiomas no está documentado y no debería asumirse.
- Es un clasificador, no un generador: no puede explicar por qué marca un texto ni generar una respuesta segura.
- Riesgo de falsos positivos y negativos: el umbral 0,5 es el punto de decisión del modelo; en producción conviene calibrarlo según el coste relativo de cada error. En el test propio, con 2,8% de falsas alarmas se detecta el 93,7% de ataques.
- El CBX Benchmark es propiedad del autor y comparte generador con los datos de entrenamiento, por lo que las métricas en esa columna favorecen a sus modelos; deben interpretarse con cautela.
- La detección depende de que se proporcione el canal correcto; usar `unknown` o un canal equivocado altera la definición de ataque y la precisión.
- Entradas de más de 2.048 tokens se evalúan por ventanas solapadas tomando el máximo, lo que puede aumentar falsos positivos en documentos largos con fragmentos ambiguos.
- No se documentan sesgos específicos del modelo, pero al derivar de un encoder entrenado en inglés puede heredar sesgos del corpus base.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías ni compromisos de mantenimiento; la versión es v0.1 y conviene fijar la revisión (`--revision v0.1`) para reproducibilidad.
- No sustituye a una defensa en profundidad: debe combinarse con otras medidas (validación de acciones sensibles, permisos mínimos para agentes, revisión humana en operaciones críticas).

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/CobuildX-AI/cbx-prompt-injection-detector-68M
- Variante 17M: https://huggingface.co/CobuildX-AI/cbx-prompt-injection-detector-17M
- Variante 32M: https://huggingface.co/CobuildX-AI/cbx-prompt-injection-detector-32M
- Modelo base Ettin: https://huggingface.co/jhu-clsp/ettin-encoder-68m
- PIGuard: https://huggingface.co/leolee99/PIGuard
- Prompt Guard 2 86M: https://huggingface.co/meta-llama/Llama-Prompt-Guard-2-86M
- Prompt Guard 2 22M: https://huggingface.co/meta-llama/Llama-Prompt-Guard-2-22M
- ProtectAI v2: https://huggingface.co/protectai/deberta-v3-base-prompt-injection-v2
- deepset deberta-v3-base-injection: https://huggingface.co/deepset/deberta-v3-base-injection
- Dataset BrowseSafe-bench: https://huggingface.co/datasets/perplexity-ai/browsesafe-bench
- Repositorio BIPIA: https://github.com/microsoft/BIPIA
- Dataset deepset/prompt-injections: https://huggingface.co/datasets/deepset/prompt-injections
- Repositorio InjecAgent: https://github.com/uiuc-kang-lab/InjecAgent
- Dataset NotInject: https://huggingface.co/datasets/leolee99/NotInject
