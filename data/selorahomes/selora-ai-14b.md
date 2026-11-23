# selorahomes/Selora-AI-14B

## Resumen

Selora AI LLM 14B es un modelo de lenguaje instruido (instruction-tuned) especializado en domótica, desarrollado por Selora Homes sobre la base de Qwen3 14B. Su particularidad es que no es un modelo monolítico, sino un conjunto de cinco adaptadores LoRA (command, automation, answer, clarification y utilities) que comparten un mismo modelo base y que se intercambian en caliente por petición mediante la integración de Home Assistant del propio fabricante. Está pensado para desplegarse en hubs con unos 16 GB de memoria y 32 GB de RAM, y se distribuye en formato GGUF con la base cuantizada a Q5_K_S y los adaptadores en F16.

El modelo resuelve un problema muy concreto: traducir lenguaje natural a acciones y artefactos válidos dentro de Home Assistant, incluyendo llamadas a servicios, generación de automatizaciones y blueprints en YAML, respuestas sobre el estado en vivo de la vivienda, peticiones de aclaración ante órdenes ambiguas y ayuda de mantenimiento fundamentada en documentación. Frente a un LLM generalista, la especialización por adaptador y el uso de envoltorios JSON compactos ("slim envelopes") reducen la superficie de error en un dominio donde una acción mal formada puede tener consecuencias físicas.

La relevancia actual del modelo radica en su enfoque de eficiencia: cinco especialistas sobre una única base de 14.768.307.200 parámetros cuestan aproximadamente 10,5 GB de pesos, en lugar de requerir cinco modelos de 14B independientes. Con licencia Apache-2.0 y soporte para llama.cpp y Ollama, se posiciona como una alternativa práctica para despliegues locales de automatización del hogar sin dependencia de la nube.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3) con adaptadores LoRA por especialista |
| Parametros totales | 14.768.307.200 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 4096 tokens (presupuesto de entrenamiento y `runtime.ctx_size` del manifest) |
| Tipos de cuantizacion | Base en GGUF Q5_K_S; adaptadores LoRA en F16. Se menciona Q4_K_M como alternativa descartada por pérdida de precisión en consulta de documentación |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (base + 5 adaptadores LoRA), Modelfile para Ollama |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen3 14B, un transformer decoder-only, sobre el que se han entrenado cinco adaptadores LoRA independientes que comparten la misma base. Cada adaptador corresponde a una intención funcional: control de dispositivos (`command`), autoría de automatizaciones y blueprints (`automation`), consulta del estado en vivo del hogar (`answer`), petición de aclaración ante ambigüedad (`clarification`) y ayuda de mantenimiento y resolución de problemas fundamentada en documentación (`utilities`). El enrutado no lo hace el modelo, sino la integración de Home Assistant, que selecciona el adaptador activo antes de cada llamada a `/v1/chat/completions`.

Ambas líneas de producto (14B y 1.7B) se entrenaron sobre el mismo corpus y contra los mismos system prompts, y emiten los mismos envoltorios JSON compactos, de modo que el comportamiento documentado para la variante pequeña aplica también aquí. Cada adaptador se entrenó contra un system prompt específico que se publica en el repositorio (`prompts/{intent}_system_prompt.txt`), junto con un `manifest.json` que recoge versión, tamaños, hashes sha256 y la receta de entrenamiento. No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron fases de RLHF o DPO.

Una decisión técnica destacable es la elección de la cuantización Q5_K_S en lugar de Q4_K_M: el autor indica que la cuantización más agresiva degrada de forma medible la precisión en la consulta de documentación, por lo que se prioriza la calidad dentro del presupuesto de 16 GB. También se advierte de un detalle operativo relevante en llama.cpp: los adaptadores deben pasarse en un único flag `--lora` separado por comas, ya que repetir el flag hace que solo se cargue el último adaptador y todas las intenciones se respondan con él.

## Capacidades

- Control de dispositivos del hogar: traducción de órdenes en lenguaje natural a llamadas a servicios de Home Assistant ("apagar las luces de la cocina").
- Autoría de automatizaciones: generación de automatizaciones y blueprints en YAML con entradas declaradas y conectadas correctamente.
- Consulta de estado en vivo: respuestas sobre el estado actual de la vivienda a partir del contexto que proporciona la integración.
- Aclaración proactiva: formulación de preguntas de seguimiento cuando la petición es ambigua, en lugar de ejecutar una acción especulativa.
- Asistencia de mantenimiento y resolución de problemas: ayuda fundamentada en documentación, con citas.
- Soporte de tool use / function calling orientado al esquema de servicios de Home Assistant.
- Emisión de envoltorios JSON compactos ("slim envelopes") como formato de salida estructurado.
- Capacidad multilingüe limitada: el modelo está declarado únicamente para inglés.

## Casos de uso

- Control por voz o texto de dispositivos: la integración enruta la petición al adaptador `command`, que devuelve la llamada de servicio adecuada; el modelo es adecuado porque su salida está restringida al esquema de servicios de Home Assistant y se evalúa específicamente en el conjunto `assist` (85,9 % en modo solo modelo).
- Creación asistida de automatizaciones: un usuario describe una rutina ("cuando salga de casa por la mañana, apaga las luces y baja la calefacción") y el adaptador `automation` produce un blueprint YAML que Home Assistant acepta con todas las entradas declaradas y conectadas; en el conjunto `automations` obtiene un 100 % (20 casos, intervalo de confianza amplio).
- Panel de estado conversacional: el adaptador `answer` responde a preguntas sobre el estado en vivo de la vivienda, con un 91,9 % en el conjunto `questions` en modo solo modelo, lo que lo hace apto para asistentes de consulta dentro de dashboards.
- Desambiguación en asistentes domésticos: cuando la orden es imprecisa ("ponlo más caliente"), el adaptador `clarification` genera una pregunta de seguimiento en lugar de actuar, reduciendo acciones erróneas en un entorno físico.
- Soporte técnico y mantenimiento guiado: el adaptador `utilities` responde consultas de configuración y resolución de problemas citando documentación, útil para guiar a usuarios no técnicos en la puesta a punto de integraciones.
- Despliegue local en hub doméstico: con unos 16 GB de memoria total (modelo, caché KV y Home Assistant en ejecución) y contexto de 4096 tokens, encaja en hubs de 32 GB de RAM sin enviar datos del hogar a servicios externos.
- Integración en pipelines de validación: el formato de salida JSON compacto y determinista a temperatura 0 facilita tests automáticos de regresión sobre las respuestas del modelo antes de desplegar cambios en producción.

## Benchmarks y rendimiento

Resultados medidos sobre la suite abierta `allenporter/home-assistant-datasets` (la misma que usa el leaderboard de LLM de Home Assistant), a temperatura 0, con llama.cpp sobre CUDA y la cuantización de distribución. Se reportan dos modos: "model only" (sin las anulaciones deterministas de la integración) y "net + model" (con esas anulaciones en el bucle).

| Dataset | Casos | Model only | Net + model |
|---|---|---|---|
| assist | 460 | 85,9 % [82,4; 88,8] | 92,2 % [89,4; 94,3] |
| assist-mini | 196 | 95,9 % [92,2; 97,9] | 100,0 % [98,1; 100,0] |
| questions | 370 | 91,9 % [88,7; 94,3] | 94,6 % [91,8; 96,5] |
| automations | 20 | 100,0 % [83,9; 100,0] | 100,0 % [83,9; 100,0] |

Los intervalos son de Wilson al 95 %. El conjunto `automations` consta de cuatro tareas de blueprint con cinco muestras cada una, puntuadas por separado: una respuesta se considera válida si Home Assistant la acepta como blueprint con todas las entradas solicitadas declaradas y conectadas; la automatización no se ejecuta. El autor indica que la build fusionada de modelo único publicada aparte obtiene dos puntos menos en `assist` con las anulaciones activadas. No se han publicado resultados de benchmarks generalistas (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- Memoria: aproximadamente 16 GB para el modelo, la caché KV y Home Assistant ejecutándose en paralelo.
- Pesos: base Q5_K_S de 10,3 GB (9,6 GiB) más 263 MB de adaptadores F16 (51 + 96 + 39 + 26 + 51 MB), es decir, unos 10,5 GB en total.
- GPU: no se especifican modelos concretos en la información disponible; el autor reporta mediciones con llama.cpp sobre CUDA. Por el perfil de memoria, encaja en GPUs consumer de 16 GB o más (por ejemplo, RTX 4080/4090 o A4000), así como en A100 y H100 con holgura.
- Cabe en GPU consumer: sí, siempre que se disponga de al menos 16 GB de VRAM para modelo, caché KV y el resto del sistema; en configuraciones de 12 GB no cabría con el margen indicado.
- Despliegue: `llama-server` de llama.cpp con soporte LoRA (runtime de la integración de Home Assistant) u Ollama 0.30+ por especialista, usando los `Modelfile.{intent}` incluidos. Existe una build fusionada para runtimes que no pueden intercambiar adaptadores.
- Contexto de servicio: 4096 tokens, valor al que están construidos el corpus y `runtime.ctx_size`.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Selora AI LLM 14B | 14,77 B (base + 5 LoRA) | 4096 | Domótica / Home Assistant, 5 especialistas | Apache-2.0 | GGUF en Hugging Face |
| Selora AI LLM 1.7B | No disponible | No disponible (mismo corpus y envelopes) | Domótica / Home Assistant, misma familia | Apache-2.0 | Hugging Face |
| Selora AI LLM 14B (fusión) | 14,77 B | No disponible | Domótica, modelo único fusionado | Apache-2.0 | Hugging Face / Ollama |
| Qwen3 14B (base) | 14,77 B | No disponible en esta ficha | LLM generalista | Apache-2.0 | Hugging Face |

La comparación relevante es interna a la familia: la variante de 1.7B comparte corpus, system prompts y formato de salida, por lo que es la alternativa cuando el presupuesto de memoria es menor; la build fusionada evita el intercambio de adaptadores a costa de unos dos puntos en `assist` con las anulaciones activadas. Frente al Qwen3 14B base, la diferencia es de especialización y formato de salida, no de tamaño. No se dispone de datos de benchmarks comparativos con modelos de domótica de terceros en la información proporcionada.

## Limitaciones y advertencias

- Idioma: el modelo está declarado únicamente para inglés; no hay evidencia de calidad en castellano ni en otros idiomas.
- Contexto reducido: 4096 tokens es un presupuesto ajustado para conversaciones multi-turno largas o para volcar grandes volúmenes de estado del hogar; superarlo degradará la calidad de forma no caracterizada.
- Dependencia del enrutado externo: el modelo no selecciona el especialista; si la integración elige mal el adaptador, la respuesta será incorrecta aunque el adaptador sea correcto en su dominio.
- Riesgo de acción errónea: en el dominio de control de dispositivos, una salida mal formada o una interpretación incorrecta puede ejecutar acciones físicas; el autor recomienda mantener aprobaciones y listas de comandos seguros en producción, que además estaban desactivadas durante la medición de benchmarks.
- Alucinación: no se documentan tasas específicas; el adaptador `utilities` cita documentación, pero no se garantiza que las citas sean correctas en todos los casos.
- Sesgos: no se documentan análisis de sesgo en la información disponible.
- Cifras de benchmark con matices: `automations` solo tiene 20 casos (intervalo de confianza muy amplio, de 83,9 % a 100 %), y el modo "net + model" no es idéntico al camino de producción (aprobación y allowlist desactivadas, y `questions` sobreestima en casos de calendario porque los fixtures aportan datos que un Home Assistant real no tiene).
- Detalle operativo crítico: repetir el flag `--lora` en llama.cpp hace que solo se cargue el último adaptador y todas las intenciones se respondan con él; debe usarse un único flag con rutas separadas por comas y resolver los ids de slot por nombre de fichero.
- Cuantización: Q4_K_M es más pequeño pero degrada la precisión en consulta de documentación según el autor; no se recomienda para ese caso de uso.
- Licencia: Apache-2.0 permite uso comercial, pero debe conservarse el fichero `NOTICE` con la atribución a Qwen3.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/selorahomes/Selora-AI-14B
- Variante 1.7B: https://huggingface.co/selorahomes/Selora-AI-LLM-1.7B
- Build fusionada para Ollama: https://huggingface.co/selorahomes/Selora-AI-LLM-14B-ollama
- Modelo base Qwen3 14B: https://huggingface.co/Qwen/Qwen3-14B
- Integración de Home Assistant: https://github.com/SeloraHomes/ha-selora-ai
- Suite de evaluación: https://github.com/allenporter/home-assistant-datasets
- Sitio del fabricante: https://selorahomes.com
- Home Assistant: https://www.home-assistant.io/
