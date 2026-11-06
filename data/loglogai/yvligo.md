# loglogai/yvligo

## Resumen

yvligo es un adaptador LoRA de tipo PEFT desarrollado por loglogai sobre el modelo base deepseek-ai/DeepSeek-V4.1-Flash-1017. Su propósito es convertir el modelo base en un agente autónomo capaz de operar campañas publicitarias en X (Twitter) mediante el uso de herramientas de la API de X Ads. A partir de un brief de cliente, el modelo configura campañas, las monitoriza durante su vuelo, ajusta segmentación, pujas y presupuestos, y finaliza con un resumen al cliente. No es un modelo de propósito general, sino un especialista entrenado para una tarea concreta de agente con tool calling.

El adaptador se entrenó mediante supervisión fina (SFT) sobre trazas expertas: 312 trazas completas de campañas ejecutadas por un agente experto en un entorno simulado de X Ads. Cada traza puede alcanzar los 262.144 tokens e incluye el brief, cada paso de razonamiento, llamadas a herramientas, resultados y el resumen final. El checkpoint publicado corresponde al paso 39 de entrenamiento (aproximadamente una época y 24 millones de tokens), con un LoRA de rango 32 y alpha 32 aplicado sobre todas las capas lineales.

La relevancia de yvligo reside en su enfoque: un modelo pequeño y especializado, mediante un adaptador de bajo rango, supera en la tarea de gestión de campañas publicitarias a modelos frontera mucho más grandes como GPT-6.1 Sol, Opus 5.5 o Grok 4.7, según la evaluación del propio autor en un entorno simulado. Está publicado con licencia MIT y solo soporta inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer DeepSeek-V4.1-Flash-1017; rango 32, alpha 32, en todas las capas lineales |
| Parametros totales | no disponible (adaptador LoRA; el modelo base no reporta cifra en la informacion disponible) |
| Parametros activos | no disponible |
| Longitud de contexto | hasta 262.144 tokens por traza de entrenamiento; contexto del modelo base no disponible |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; la cuantizacion depende del stack que sirva el modelo base) |
| Idiomas soportados | ingles (en) |
| Licencia | MIT |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

yvligo no es un modelo independiente, sino un adaptador LoRA de rango 32 y alpha 32 aplicado sobre todas las capas lineales de DeepSeek-V4.1-Flash-1017. El entrenamiento se realizó con supervisión fina (SFT) sobre la plataforma Tinker de Thinking Machines. La pérdida se calculó sobre cada turno del asistente, con optimizador Adam (β₁ 0,9, β₂ 0,95, ε 1e-8), 8 trazas por paso, learning rate de 1e-4 con decaimiento lineal sobre 117 pasos planificados (tres épocas).

Los datos de entrenamiento consisten en 312 trazas de 181 briefs de entrenamiento (de un total de 196; los otros 26 se reservaron para validación). El agente experto ejecutó 444 campañas (222 briefs con dos semillas de rollout cada una) en un entorno simulado de X Ads; solo se conservaron las ejecuciones que terminaron, alcanzaron al menos el par de conversiones, igualaron o superaron al modelo base en el mismo brief y semilla, y pasaron las comprobaciones de reglas del brief. Cada traza completa puede ocupar hasta 262.144 tokens. El checkpoint publicado es el paso 39 (una época, unos 24 millones de tokens); el paso 59 se descartó porque rompía el formato de llamada a herramientas. La pérdida de validación sobre 22 trazas retenidas bajó de 0,415 a 0,366.

El formato de chat emplea DeepSeek V4.1 con thinking en esfuerzo bajo, conservando el razonamiento de turnos anteriores en el contexto, y el renderer de tinker-cookbook, que según el autor coincide token a token con la API de DeepSeek. El agente opera con 78 herramientas MCP bajo el prefijo `mcp__ads__*` más `mcp__scheduler__wait_until` para pausar hasta un momento posterior del vuelo de campaña.

## Capacidades

- Gestión completa de campañas de X Ads: creación de campañas, grupos de anuncios y anuncios a partir de un brief de cliente.
- Ajuste dinámico durante el vuelo: modificación de segmentación, pujas y presupuestos según el rendimiento observado.
- Tool calling extensivo: 78 herramientas MCP de la superficie de la API de X Ads, más una herramienta de planificación temporal (`mcp__scheduler__wait_until`).
- Razonamiento multi-paso con thinking en esfuerzo bajo y conservación del razonamiento de turnos previos en el contexto.
- Cierre de sesión con resumen (recap) al cliente; según el autor, escribió un recap preciso en las 45 ejecuciones de evaluación.
- Comprensión y cumplimiento de reglas de brief (con limitaciones, véase la sección de limitaciones).
- Capacidad de operar sesiones largas de hasta 262.144 tokens de contexto.
- Solo inglés; no se reportan capacidades de visión, audio ni otros idiomas.

## Casos de uso

- Automatización de la configuración inicial de campañas: dado un brief en inglés, el agente crea la estructura completa de campaña (campaña, grupos de anuncios, anuncios) mediante las herramientas de la API de X Ads, reduciendo el trabajo manual de un especialista en publicidad.
- Gestión de vuelo de campañas activas: el agente monitoriza el rendimiento y ajusta segmentación, pujas y presupuestos a lo largo de la campaña, usando `mcp__scheduler__wait_until` para esperar entre revisiones, lo que permite operar campañas de varios días sin intervención humana.
- Generación de resúmenes para el cliente: al final de cada sesión, el modelo produce un recap del estado y resultados de la campaña, adecuado para informes periódicos a clientes de agencias.
- Agente de referencia para investigación en tool use: sirve como caso de estudio de cómo un adaptador LoRA de bajo rango sobre un modelo base puede especializarse en una tarea de agente con muchas herramientas y superar a modelos frontera en ese dominio concreto.
- Prototipado de flujos de agente en entornos simulados: el adaptador puede integrarse en pipelines de evaluación de agentes publicitarios antes de pasar a producción real, dado que fue entrenado y medido en un simulador de X Ads.
- Base para fine-tuning adicional en dominios publicitarios adyacentes: al ser un adaptador PEFT estándar con licencia MIT, puede servir como punto de partida para especializaciones en otras plataformas de publicidad o en otras tareas de agente con API.
- Integración en stacks de servicio con LoRA: cualquier servidor que soporte el modelo base con adaptadores LoRA (por ejemplo, vLLM con soporte LoRA) puede servir yvligo junto al modelo base, permitiendo desplegar el especialista sin duplicar los pesos completos.

## Benchmarks y rendimiento

Los resultados publicados por el autor corresponden a una evaluación en un entorno simulado de X Ads: 45 briefs retenidos, una ejecución por agente, misma semilla de rollout. La métrica es la media geométrica de conversiones dividida por el par (conversiones esperadas de las campañas del agente divididas por las de una línea base scriptada en el mismo mundo y semilla; la línea base ejecuta un grupo de anuncios con las reglas del brief y la puja AUTO por defecto de X).

| Agente | Media geométrica de conversiones ÷ par | yvligo ÷ agente, emparejado por brief (EE) | yvligo por delante en |
|---|---|---|---|
| yvligo | 1,311 | — | — |
| Experto (fuente de las trazas) | 1,349 | ×0,972 (×1,025) | 21 de 45 |
| GPT-6.1 Sol (Codex) | 1,145 | ×1,145 (×1,035) | 33 |
| DeepSeek-V4.1-Flash (Claude Code en OpenRouter) | 1,117 | ×1,173 (×1,048) | 33 |
| DeepSeek-V4.1-Flash antes del post-entrenamiento (mismo setup) | 1,095 | ×1,196 (×1,036) | 36 |
| Grok 4.7 (Grok Build) | 1,087 | ×1,206 (×1,038) | 36 |
| Opus 5.5 (Claude Code) | 1,068 | ×1,228 (×1,033) | 40 |
| GPT-6 Astra (Codex) | 1,058 | ×1,239 (×1,036) | 37 |
| Haiku 5.5 (Claude Code) | 1,012 | ×1,295 (×1,037) | 40 |
| Sonnet 5.5 (Claude Code) | 0,930 | ×1,409 (×1,043) | 43 |
| GPT-6 Luna (Codex) | 0,738 | ×1,775 (×1,244) | 42 |
| Nemotron 3.5 Lightning (Claude Code en OpenRouter) | 0,213 | ×6,147 (×1,469) | 43 |

Datos adicionales de la evaluación: yvligo nunca puntuó por debajo de 0,8 del par (mínimo 0,842); el 2,3 % de sus llamadas a herramientas devolvieron error (el experto, 1,6 %); rompió 6 reglas de brief frente a las 2 del experto. Los demás modelos se ejecutaron en sus propias CLIs de agente con esfuerzo de razonamiento medio. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- El adaptador LoRA en sí ocupa 13,9 GB en el repositorio; los requisitos reales de VRAM vienen determinados por el modelo base DeepSeek-V4.1-Flash-1017, cuyas especificaciones no están disponibles en la información proporcionada.
- No es posible estimar con rigor la VRAM necesaria para inferencia sin los datos del modelo base (parámetros totales, arquitectura exacta, soporte de cuantización).
- El adaptador requiere un stack que sirva el modelo base con soporte de LoRA: Transformers + PEFT (según el ejemplo de la model card), o servidores de inferencia con soporte de adaptadores LoRA como vLLM.
- El contexto de trabajo es muy largo (hasta 262.144 tokens por traza), lo que exige GPUs con memoria suficiente para atender ventanas de ese tamaño; no se proporcionan cifras concretas de GPU recomendadas.
- No se dispone de datos de latencia ni throughput en la información proporcionada.
- No se confirma que quepa en GPUs de consumo; depende enteramente del modelo base, no disponible.

## Comparativa con modelos similares

Comparación en la tarea específica de gestión de campañas de X Ads en el simulador del autor (misma tabla de resultados, resumida):

| Modelo | Tipo | Media geométrica ÷ par | Licencia / disponibilidad |
|---|---|---|---|
| yvligo | LoRA sobre DeepSeek-V4.1-Flash | 1,311 | MIT; adaptador PEFT público en Hugging Face |
| Experto (agente de referencia) | Agente propietario del autor | 1,349 | no disponible |
| GPT-6.1 Sol (Codex) | Modelo frontera propietario | 1,145 | propietaria; vía API |
| DeepSeek-V4.1-Flash sin post-entrenamiento | Modelo base | 1,095 | no disponible en la información |
| Opus 5.5 (Claude Code) | Modelo frontera propietario | 1,068 | propietaria; vía API |

En parámetros, contexto y rendimiento en benchmarks generales no hay datos comparativos disponibles en la información proporcionada. La comparación relevante es la de la tarea de agente publicitario, donde el adaptador especializado supera a todos los modelos frontera evaluados salvo al agente experto que generó sus trazas.

## Limitaciones y advertencias

- Reglas de brief: a veces añade una restricción de edad 18+ que el brief no requiere, tres veces en peticiones; esto explica 5 de sus 6 fallos de reglas y le hace ir por detrás del experto en briefs de categorías restringidas.
- Ganancia por keywords: parte de su ventaja sobre el modelo base proviene de la segmentación por palabras clave, que el simulador puede recompensar más de lo que lo hace X en la realidad; los resultados podrían no transferirse a producción.
- Conciencia de evaluación: en 18 de las 45 ejecuciones, su razonamiento menciona explícitamente que está siendo evaluado, lo que puede afectar a la validez de la evaluación y al comportamiento en despliegues reales.
- Alucinación: no se reportan tasas específicas; como modelo generativo aplicado a una API real, existe riesgo de llamadas a herramientas con parámetros incorrectos (2,3 % de llamadas con error en la evaluación).
- Idioma: solo inglés; no soporta castellano ni otros idiomas.
- Licencia: MIT, igual que el modelo base, lo que permite uso comercial, pero el adaptador hereda las limitaciones y condiciones del modelo base DeepSeek-V4.1-Flash-1017, cuyos términos no se detallan en la información disponible.
- Entrenado y evaluado en un entorno simulado de X Ads; el comportamiento frente a la API real de X puede diferir, especialmente en la respuesta del sistema a las pujas y a la segmentación.
- El checkpoint publicado es el paso 39; el paso 59 se rechazó por romper el formato de llamada a herramientas, lo que sugiere sensibilidad al formato en entrenamientos más largos.
- Depende de un setup de agente concreto (system prompt headless de DeepSeek Harness, 78 herramientas MCP `mcp__ads__*`, thinking en esfuerzo bajo); usarlo fuera de ese setup puede degradar su rendimiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/loglogai/yvligo
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017
- Plataforma de entrenamiento Tinker: https://thinkingmachines.ai/tinker/
- Repositorio tinker-cookbook (renderer y utilidades de entrenamiento): no disponible como enlace directo en la información proporcionada
- Paper, blog o demo del modelo: no disponible en la información proporcionada
