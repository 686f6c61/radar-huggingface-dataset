# olo-labs/olo-qwen3-4b-thinking-mock-claims

## Resumen

olo-qwen3-4b-thinking-mock-claims es un adaptador QLoRA publicado por olo-labs sobre el modelo base Qwen/Qwen3-4B. Su objetivo no es mejorar las capacidades generales del modelo, sino especializarlo en la invocación fiable de herramientas MCP (Model Context Protocol) a través del proyecto olo-toolgate. El adaptador se entrenó para que el modelo responda con una única llamada a herramienta en el formato nativo de Qwen3, con argumentos que respeten el esquema JSON de la herramienta, o con texto plano cuando ninguna herramienta encaja.

El modelo resuelve un problema muy concreto: la fiabilidad del tool calling en modelos pequeños. Según la model card, el adaptador eleva la tasa de acierto en un conjunto de 112 prompts reservados del 90,2 % al 100 %, y la validez de esquema de los argumentos del 89 % al 100 %. Se trata, por tanto, de un artefacto de ajuste fino orientado a producción de agentes, no de un modelo de propósito general.

El repositorio es muy ligero (0,3 GB) porque contiene únicamente los pesos del adaptador, no el modelo base. La licencia y los idiomas soportados no están declarados en la información disponible, lo que condiciona su uso comercial hasta que el autor o la licencia del modelo base lo aclaren.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (adaptador QLoRA sobre Qwen/Qwen3-4B) |
| Parametros totales | 4B en el modelo base; el adaptador añade un conjunto reducido de pesos LoRA (tamaño de repo 0,3 GB) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del modelo base Qwen3-4B) |
| Tipos de cuantizacion | QLoRA implica cuantizacion de 4 bits durante el entrenamiento; el adaptador se distribuye en safetensors y puede combinarse con el base en otras precisiones segun el runtime |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT); requiere el modelo base Qwen/Qwen3-4B |

## Arquitectura y entrenamiento

El adaptador se entrena mediante QLoRA sobre Qwen/Qwen3-4B, un transformer decoder-only de 4.000 millones de parámetros. No se modifica la arquitectura del modelo base: se añaden matrices de bajo rango sobre las capas existentes y se entrena con el modelo base cuantizado a 4 bits. El adaptador conserva el formato de tool calling propio de Qwen3, de modo que las llamadas generadas son compatibles con el parser de herramientas del modelo base en servidores como vLLM, Ollama o llama.cpp.

El conjunto de entrenamiento es pequeño y muy específico: 632 filas, 4 herramientas (`examples.claims/assess`, `examples.claims/claim`, `examples.claims/file-claim`, `examples.claims/policy`), 400 pasos y una pérdida final media de 0,0014 en los últimos 50 pasos. El entrenamiento duró 130,6 minutos (ejecución `20261103_065455`). No se documentan en la información disponible detalles sobre composición del dataset, uso de RLHF/DPO ni innovaciones arquitectónicas adicionales; el valor técnico reside en la curación del dataset de tool calling y en el ajuste al esquema exacto de las herramientas.

## Capacidades

- Generación de llamadas a herramientas en el formato nativo de Qwen3, con nombre de herramienta exacto y argumentos conformes al esquema JSON.
- Tool calling y function calling con soporte para el campo `tools` del chat template y de servidores compatibles con OpenAI (vLLM, Ollama, llama.cpp).
- Integración con herramientas MCP a través de olo-toolgate.
- Generalización a herramientas no vistas durante el entrenamiento, siempre que se ofrezcan con el mismo formato.
- Respuesta en texto plano cuando ninguna herramienta disponible encaja con la petición (categoría "no-tool").
- Modo thinking del modelo base Qwen3, desactivable mediante `enable_thinking=False` en el chat template.
- Generación de texto y conversación multi-turno heredadas del modelo base.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Automatización de gestión de siniestros: el adaptador está entrenado específicamente con las herramientas `claims/assess`, `claims/claim`, `claims/file-claim` y `claims/policy`, por lo que puede encadenar la consulta de póliza, la evaluación del siniestro y la presentación de la reclamación en un flujo de agente.
- Agentes MCP en producción: al emitir llamadas con argumentos válidos según esquema en el 100 % de los prompts de evaluación, reduce la necesidad de reintentos y de validación posterior en orquestadores de agentes.
- Integración en servidores OpenAI-compatibles: se puede desplegar en vLLM, Ollama o llama.cpp enviando las herramientas en el campo `tools` de la petición, sin cambios en el cliente.
- Enrutamiento de intenciones con fallback a texto: la categoría "no-tool correct" al 100 % permite usarlo como primer eslabón de un pipeline que decide entre invocar una herramienta o responder directamente al usuario.
- Asistentes de soporte técnico con herramientas acotadas: con 4 herramientas y un system prompt fijo, encaja en escenarios de helpdesk donde la superficie de acciones está bien delimitada.
- Prototipado rápido de agentes sobre hardware modesto: al ser un adaptador de 0,3 GB sobre un base de 4B, se puede servir en una única GPU consumer para pruebas de integración de tool calling.
- Evaluación de pipelines de entrenamiento de tool calling: sirve como referencia reproducible para comparar la fiabilidad de un base frente a un adaptador QLoRA con el mismo conjunto de prompts.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre 112 prompts reservados, mismo system prompt y decodificación greedy:

| Metrica | Modelo base | Adaptador | Cambio |
|---|---|---|---|
| Tasa de acierto (pass rate) | 90,2 % | 100,0 % | +9,8 pts |
| Herramienta correcta | 89,0 % | 100,0 % | +11,0 pts |
| JSON estricto | 97,8 % | 100,0 % | +2,2 pts |
| Argumentos válidos según esquema | 89,0 % | 100,0 % | +11,0 pts |
| Argumentos exactos | 86,8 % | 100,0 % | +13,2 pts |
| No-tool correcto | 95,2 % | 100,0 % | +4,8 pts |

Desglose por categoría:

| Categoria | Modelo base | Adaptador |
|---|---|---|
| defaults | 16/16 (100,0 %) | 16/16 (100,0 %) |
| negative | 12/13 (92,3 %) | 13/13 (100,0 %) |
| parameter_variation | 22/24 (91,7 %) | 24/24 (100,0 %) |
| positive | 43/51 (84,3 %) | 51/51 (100,0 %) |
| unavailable | 8/8 (100,0 %) | 8/8 (100,0 %) |

El entrenamiento corrigió 11 prompts que el modelo base fallaba y no rompió ninguno. En el conjunto de validación (14 prompts escritos por autores de herramientas y por personas, nunca vistos en entrenamiento) el adaptador alcanza un 92,9 % (13/14). No se han publicado resultados de benchmarks generales (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en FP16, el modelo base de 4B requiere aproximadamente 8-9 GB; en cuantización de 4 bits, alrededor de 3-4 GB, a lo que se suma el adaptador (0,3 GB en disco).
- GPU recomendadas: A100, H100 o L40S para despliegues concurrentes; RTX 4090, RTX 3090 o RTX 4080 para inferencia en FP16 con holgura.
- GPU consumer: cabe en GPUs consumer con 8 GB o más en FP16 y en GPUs de 6-8 GB con cuantización de 4 bits.
- Opciones de despliegue: transformers con PEFT (`AutoPeftModelForCausalLM`), vLLM con el parser de herramientas del modelo base, Ollama y llama.cpp.
- Latencia y throughput: no disponibles en la información proporcionada. El entrenamiento reportado (400 pasos en 130,6 minutos) no permite inferir cifras de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| olo-qwen3-4b-thinking-mock-claims | 4B (base) + adaptador LoRA | no disponible | Tool calling MCP (olo-toolgate) | no disponible | HuggingFace (olo-labs) |
| Qwen/Qwen3-4B | 4B | no disponible en la informacion | Modelo generalista con tool calling | no disponible en la informacion | HuggingFace (Qwen) |
| Adaptadores QLoRA de tool calling sobre modelos de 3-8B | 3-8B | variable | Tool calling generico | variable | HuggingFace |

La comparación más directa es con el propio Qwen3-4B sin adaptar: el adaptador mejora entre 2,2 y 13,2 puntos en las métricas de tool calling evaluadas, a costa de un entrenamiento muy específico sobre 4 herramientas. Frente a otros adaptadores de tool calling de la misma escala, no se dispone de datos comparativos publicados en la información proporcionada.

## Limitaciones y advertencias

- El adaptador se entrenó con solo 4 herramientas y 632 filas; aunque la model card afirma que generaliza a herramientas no vistas ofrecidas en el mismo formato, el conjunto de validación es de únicamente 14 prompts, por lo que la evidencia de generalización es limitada.
- Los resultados del 100 % se obtuvieron con decodificación greedy, un system prompt fijo y 112 prompts reservados; no hay garantía de que se mantengan con sampling, prompts fuera de distribución o esquemas de herramientas más complejos.
- Licencia no declarada: no se puede confirmar el uso comercial ni las obligaciones de atribución. Es imprescindible verificar también la licencia de Qwen/Qwen3-4B antes de desplegar.
- Idiomas soportados no declarados; el comportamiento multilingüe del adaptador no está evaluado.
- Riesgo de alucinación inherente al modelo base de 4B, especialmente en razonamiento abierto y en la selección de argumentos cuando el esquema es ambiguo.
- El adaptador no mejora las capacidades generales de generación, matemáticas o código del modelo base; su valor está acotado al tool calling.
- El formato de pesos es un adaptador PEFT: requiere cargar el modelo base, lo que añade complejidad operativa frente a un checkpoint completo.
- No se documentan sesgos conocidos ni evaluaciones de seguridad en la información disponible.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/olo-labs/olo-qwen3-4b-thinking-mock-claims
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B
- Repositorio olo-toolgate: https://github.com/olo-labs/olo-toolgate
- Herramienta de entrenamiento olo-ai-training-mcp: https://github.com/olo-labs/olo-ai-training-mcp
