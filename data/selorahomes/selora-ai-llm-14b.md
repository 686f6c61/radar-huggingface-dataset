# selorahomes/Selora-AI-LLM-14B

## Resumen

Selora AI LLM 14B es un modelo de lenguaje ajustado por instrucciones, desarrollado por Selora Homes, especializado en el control y la automatización de viviendas mediante Home Assistant. No se trata de un modelo entrenado desde cero, sino de un conjunto de cinco adaptadores LoRA (F16) montados sobre una base compartida Qwen3 14B, que se intercambian en caliente por petición según la intención detectada. Los cinco especialistas cubren control de dispositivos, creación de automatizaciones y blueprints, respuesta a preguntas sobre el estado de la vivienda, peticiones de aclaración ante solicitudes ambiguas y utilidades de mantenimiento y resolución de problemas fundamentadas en documentación.

El modelo resuelve un problema muy concreto: convertir lenguaje natural en llamadas de servicio y objetos YAML válidos para Home Assistant, con un formato de salida JSON compacto y determinista. Su relevancia actual radica en que demuestra una estrategia de despliegue eficiente: en lugar de servir cinco modelos de 14B, comparte una única base cuantizada a Q5_K_S (10,3 GB) y suma adaptadores de entre 26 y 96 MB, de modo que el conjunto completo ocupa unos 10,5 GB de pesos y cabe en despliegues de aproximadamente 16 GB de memoria, incluidos la caché KV y Home Assistant.

La arquitectura subyacente es la de Qwen3 14B, con 14.768.307.200 parámetros totales, y el contexto de funcionamiento está fijado en 4096 tokens, que es el presupuesto con el que se construyeron el corpus de entrenamiento y el manifiesto del modelo. La licencia es Apache-2.0 y el único idioma declarado es el inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (base Qwen3 14B) con cinco adaptadores LoRA F16 por especialista |
| Parametros totales | 14.768.307.200 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 4096 tokens (presupuesto de entrenamiento y de ejecución, `runtime.ctx_size`) |
| Tipos de cuantizacion | Base en GGUF Q5_K_S; adaptadores LoRA en F16. Se menciona Q4_K_M como alternativa descartada por pérdida de precisión en consulta de documentación |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (base y adaptadores), más `Modelfile` para Ollama, prompts de sistema en texto plano y `manifest.json` |

## Arquitectura y entrenamiento

La base es Qwen3 14B, un transformer denso de 14.768 millones de parámetros. Sobre ella se entrenaron cinco adaptadores LoRA independientes, cada uno asociado a una intención y a un prompt de sistema propio: `command` (51 MB), `automation` (96 MB), `answer` (39 MB), `clarification` (26 MB) y `utilities` (51 MB). Todos los adaptadores comparten la misma base, de modo que el coste total de pesos ronda los 10,5 GB en lugar de replicar cinco modelos de 14B. El repositorio incluye los prompts de sistema exactos con los que se entrenó cada adaptador (`prompts/{intent}_system_prompt.txt`) y un `manifest.json` con versión, tamaño y sha256 por fichero, además de la receta de entrenamiento.

Ambas líneas del proyecto (la de 1.7B y esta de 14B) se entrenaron sobre el mismo corpus y contra los mismos prompts de sistema, y emiten el mismo formato de salida JSON compacto denominado «slim envelopes». La model card no detalla el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO; esa información no está disponible. La innovación técnica destacable no está en la arquitectura, sino en el esquema de servicio: intercambio en caliente de adaptadores LoRA por petición mediante el endpoint `/lora-adapters` de `llama-server`, con resolución de identificadores de ranura por nombre de fichero. La cuantización Q5_K_S se eligió explícitamente para que el conjunto quepa en 16 GB junto con la caché KV y Home Assistant; Q4_K_M, aunque más pequeño, degradaba de forma medible la precisión en la consulta de documentación.

## Capacidades

- Control de dispositivos: traducción de órdenes en lenguaje natural a llamadas de servicio de Home Assistant (por ejemplo, «turn off the kitchen lights»).
- Autoría de automatizaciones: generación de automatizaciones y blueprints en YAML, con declaración y conexión de todas las entradas solicitadas.
- Consulta del estado de la vivienda: respuestas sobre el estado en vivo de entidades y dispositivos.
- Aclaración de solicitudes ambiguas: formulación de preguntas de seguimiento cuando la petición no es resoluble.
- Utilidades de mantenimiento: resolución de problemas, configuración y ayuda fundamentada en documentación, con citas.
- Soporte de tool use / function calling, según los tags del modelo y el formato de salida orientado a llamadas de servicio.
- Salida estructurada: emisión de sobres JSON compactos y deterministas, adecuados para consumo programático.
- Capacidad multilingüe: limitada al inglés según la metadata del modelo.
- Modo de razonamiento explícito, visión o audio: no disponible.

## Casos de uso

- Control por voz o texto en el hogar: el especialista `command` convierte una frase como «apaga las luces de la cocina» en la llamada de servicio correspondiente, con un formato JSON que la integración de Home Assistant puede ejecutar directamente sin post-procesado.
- Creación asistida de automatizaciones: el especialista `automation` genera YAML de automatización y de blueprint que Home Assistant acepta, con todas las entradas solicitadas declaradas y cableadas, lo que reduce el trabajo manual de usuarios avanzados.
- Asistente conversacional sobre el estado de la casa: el especialista `answer` responde a preguntas del tipo «¿está la puerta del garaje abierta?» consultando el estado en vivo, con 91,9 % de acierto en el conjunto `questions` en modo solo modelo.
- Desambiguación en interfaces de voz: el especialista `clarification` pide seguimiento cuando la orden es ambigua, evitando ejecutar acciones incorrectas sobre dispositivos críticos.
- Soporte técnico y mantenimiento guiado: el especialista `utilities` responde dudas de configuración y resolución de problemas con base en documentación y citas, útil en un panel de ayuda dentro de la propia instalación.
- Despliegue en hardware de gama media: al ocupar unos 10,5 GB de pesos y requerir aproximadamente 16 GB de memoria total, es viable en un mini-PC o hub doméstico con 32 GB de RAM, sin depender de la nube y manteniendo los datos del hogar en local.
- Integración en pipelines de domótica con aprobación humana: la salida estructurada y determinista a temperatura 0 permite insertar una capa de validación o lista de comandos permitidos antes de ejecutar cualquier acción.

## Benchmarks y rendimiento

Resultados medidos sobre la suite abierta `allenporter/home-assistant-datasets`, la misma que alimenta el leaderboard de LLM de Home Assistant, a temperatura 0, sobre la suite completa, con llama.cpp sobre CUDA y la cuantización de distribución. «Solo modelo» desactiva las anulaciones deterministas de la integración; «red + modelo» las mantiene en el bucle. Intervalos de Wilson al 95 %.

| Dataset | Casos | Solo modelo | Red + modelo |
|---|---|---|---|
| assist | 460 | 85,9 % [82,4; 88,8] | 92,2 % [89,4; 94,3] |
| assist-mini | 196 | 95,9 % [92,2; 97,9] | 100,0 % [98,1; 100,0] |
| questions | 370 | 91,9 % [88,7; 94,3] | 94,6 % [91,8; 96,5] |
| automations | 20 | 100,0 % [83,9; 100,0] | 100,0 % [83,9; 100,0] |

El conjunto `automations` consta de cuatro tareas de blueprint con cinco muestras cada una y se puntúa por separado: una respuesta se considera válida si Home Assistant la acepta como blueprint con todas las entradas solicitadas declaradas y cableadas; la automatización no se ejecuta. La model card advierte que `questions` sale alta en los casos de calendario porque los fixtures aportan datos de eventos que un Home Assistant real no proporciona. La compilación fusionada en un solo modelo (`Selora-AI-LLM-14B-ollama`) obtiene dos puntos menos en `assist` con las anulaciones activadas.

## Requisitos de hardware

- Memoria: aproximadamente 16 GB para el modelo, la caché KV y Home Assistant en ejecución conjunta. El modelo está pensado para Selora Hubs con 32 GB de RAM.
- Pesos: base Q5_K_S de 10,3 GB (9,6 GiB) más 263 MB de adaptadores LoRA F16, unos 10,5 GB en total.
- Contexto: 4096 tokens, fijado en el manifiesto como `runtime.ctx_size`.
- GPU: la model card solo documenta ejecución con llama.cpp sobre CUDA; no especifica modelos de GPU concretos ni VRAM mínima por tarjeta. No disponible la lista de GPU recomendadas.
- GPU de consumo: no se confirma en la documentación; el requisito declarado es de memoria total del sistema, no de VRAM dedicada.
- Despliegue: `llama-server` de llama.cpp con soporte LoRA (`--lora-init-without-apply` y un único `--lora` con rutas separadas por comas), u Ollama 0.30 o superior con un `Modelfile` por especialista. El endpoint `/lora-adapters` permite cambiar el adaptador activo antes de cada llamada a `/v1/chat/completions`.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Selora AI LLM 14B | 14,77 B (denso) + 5 LoRA | 4096 | Domótica y Home Assistant | Apache-2.0 | GGUF en Hugging Face, Ollama |
| Selora AI LLM 1.7B | No disponible en esta ficha | No disponible | Domótica y Home Assistant, misma línea y corpus | Apache-2.0 (según la línea del proyecto) | Hugging Face |
| Selora AI LLM 14B (fusión) | 14,77 B | No disponible | Igual, en un único modelo fusionado para runtimes sin intercambio de adaptadores | Apache-2.0 | Hugging Face (`-ollama`) |
| Qwen3 14B (base) | 14,77 B | No disponible en esta ficha | Modelo generalista | Apache-2.0 | Hugging Face |

La comparación con alternativas de propósito general no está cubierta por la información disponible: no se aportan resultados de benchmarks de Qwen3 14B ni de otros modelos de domótica en la misma suite, por lo que no es posible establecer una comparación cuantitativa fiable.

## Limitaciones y advertencias

- Idioma: solo inglés declarado; no hay soporte documentado de castellano ni de otras lenguas.
- Contexto corto: 4096 tokens, insuficiente para conversaciones muy largas o para inyectar grandes volúmenes de documentación en el prompt.
- Dominio restringido: el ajuste está orientado a Home Assistant y a su modelo de entidades y servicios; su comportamiento fuera de ese dominio no está evaluado.
- Riesgo de alucinación en automatizaciones: el conjunto `automations` valida que Home Assistant acepte el YAML como blueprint, pero la automatización no se ejecuta, de modo que la corrección funcional en tiempo de ejecución no está verificada.
- Sesgo de evaluación en `questions`: los casos de calendario leen alto porque los fixtures incluyen datos de eventos que un Home Assistant real no suministra.
- Dependencia del prompt de sistema: cada adaptador se entrenó contra un prompt concreto; usar prompts distintos puede degradar el rendimiento y romper el formato de salida.
- Configuración frágil en llama.cpp: repetir el flag `--lora` hace que solo se cargue el último adaptador y que todas las intenciones se respondan con él; es obligatorio usar una única bandera con rutas separadas por comas.
- Cuantización: bajar a Q4_K_M reduce de forma medible la precisión en la consulta de documentación, según el autor.
- Licencia: Apache-2.0 permite uso comercial, pero debe conservarse el texto de licencia y el `NOTICE` con la atribución a Qwen3.
- Métricas de producción: los resultados «red + modelo» se obtuvieron con la aprobación y la lista de comandos seguros desactivadas, por lo que no reproducen exactamente la ruta de ejecución distribuida.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/selorahomes/Selora-AI-LLM-14B
- Variante fusionada para Ollama: https://huggingface.co/selorahomes/Selora-AI-LLM-14B-ollama
- Línea de 1.7B: https://huggingface.co/selorahomes/Selora-AI-LLM-1.7B
- Modelo base Qwen3 14B: https://huggingface.co/Qwen/Qwen3-14B
- Integración para Home Assistant: https://github.com/SeloraHomes/ha-selora-ai
- Sitio del desarrollador: https://selorahomes.com
- Suite de evaluación: https://github.com/allenporter/home-assistant-datasets
- Home Assistant: https://www.home-assistant.io/
