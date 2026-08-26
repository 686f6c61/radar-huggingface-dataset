# animicaorg/Animica-Agent-2B

## Resumen

Animica-Agent-2B es un modelo especializado en tool-calling y function-calling, desarrollado por animicaorg sobre la base de Qwen3.5-2B (Apache-2.0). Se trata de un adaptador LoRA de 134,5 millones de parámetros que se aplica al modelo base, y que ha sido entrenado con datos generados a partir de los esquemas reales de 17.987 servicios de pago automático (machine-payable). Su objetivo es que un modelo pequeño pueda llamar a APIs que nunca ha visto, validando argumentos contra el esquema y absteniéndose cuando ninguna herramienta encaja.

El modelo se distribuye en dos formatos: un GGUF Q4_K_M de 1,19 GB que puede ejecutarse en un teléfono, y un adaptador de 257 MB aplicable en tiempo de ejecución mediante `llama-server --lora`. Es relevante ahora porque aborda el problema de la fiabilidad en tool-calling para entornos de edge y dispositivos con recursos limitados, donde los modelos grandes no son viables. Los resultados publicados muestran una mejora drástica en la selección de herramientas sobre superficies API desconocidas, aunque sin transferencia a benchmarks generales.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Qwen3.5-2B (Transformer) + LoRA (rank 128, todas las capas lineales incluyendo MLPs) |
| Parámetros totales | ~2.000 millones (base) + 134.553.600 (adaptador LoRA) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | GGUF Q4_K_M |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF, safetensors (adaptador LoRA) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA (rank 128, bf16, learning rate 1e-4) aplicado sobre Qwen3.5-2B, una arquitectura transformer densa. El entrenamiento se realizó sobre un corpus propio generado a partir de esquemas de 17.987 servicios reales, con argumentos validados contra esquema, hard negatives extraídos de endpoints hermanos del mismo servicio, y ejemplos explícitos de abstinencia cuando ninguna herramienta encaja. El dataset se complementó con conjuntos públicos de function-calling (linaje APIGen/xLAM) y chat general generado por Qwen, deduplicado y descontaminado contra los conjuntos de evaluación BFCL y API-Bank (se eliminaron 23 filas solapadas).

Una innovación destacable es el diseño de los datos de entrenamiento: los argumentos se puntúan solo sobre valores que el usuario realmente ha mencionado; los valores sintetizados por el generador se evalúan por tipo y presencia, nunca por coincidencia exacta. Esto evita que el modelo aprenda a inventar valores no declarados, un fallo habitual en tool-calling. El modelo no incluye cláusulas de naming de Llama porque se entrenó sobre un corpus libre de ese material.

## Capacidades

- **Tool calling sobre APIs desconocidas**: selección de herramientas con precisión 1.000 en superficies nunca vistas (held-out por host), argumentos extraíbles con exactitud 0.798 y F1 0.837, y 100% de validez JSON.
- **Abstinencia correcta**: el modelo es capaz de abstenerse cuando ninguna herramienta encaja, sin inventar llamadas.
- **Function calling a través de la API**: pasa las herramientas por el campo `tools` de la API OpenAI-compatible; el uso manual en el system prompt produce argumentos correctos pero en formato no parseable.
- **Ejecución en edge**: el GGUF Q4_K_M pesa 1,19 GB y puede ejecutarse en un teléfono con llama.cpp.
- **Carga dinámica del adaptador**: el LoRA se puede aplicar en tiempo de ejecución sobre la base (`llama-server --lora`), permitiendo cambiar el comportamiento sin recargar el modelo.
- **Capacidades generales limitadas**: la instrucción-following y el razonamiento agéntico general no mejoran respecto a la base (IFEval 66,15%).

## Casos de uso

- **Agentes de pago automático**: el modelo puede seleccionar y llamar a APIs de pago (servicios facturables) con argumentos validados contra esquema, reduciendo errores de formato y valores inventados en entornos on-device.
- **Integración de APIs en dispositivos móviles**: su tamaño (1,19 GB) permite ejecutar tool-calling en smartphones o dispositivos edge sin conexión a datacenter, ideal para asistentes locales que necesitan consultar servicios externos.
- **Automatización de flujos de trabajo con APIs propias**: la pipeline de entrenamiento está disponible como servicio (Animica Factory) para generar un adaptador específico para cualquier OpenAPI spec, permitiendo a equipos crear modelos de tool-calling para sus propias APIs.
- **Servicio de inferencia descentralizado**: el modelo se sirve en la red Animica mediante dispositivos voluntarios, con latencia de 20-40 segundos, adecuado para tareas no críticas en tiempo real.
- **Prueba y validación de contratos inteligentes**: el ejemplo de contrato AI Agent de Animica demuestra cómo un contrato on-chain puede delegar computación off-chain al modelo, útil para oráculos o agentes descentralizados.
- **Chat con herramientas en entornos sin GPU**: al correr en llama.cpp, se puede desplegar en CPUs convencionales o incluso en dispositivos embebidos, manteniendo la capacidad de llamar funciones de forma fiable.

## Benchmarks y rendimiento

La model card reporta dos conjuntos de resultados. El primero, sobre superficies API desconocidas (held-out por host, ningún servicio del test aparece en el entrenamiento):

| Métrica | Base Qwen3.5-2B | Animica-Agent-2B |
|---|---|---|
| Precisión de selección de herramienta | 0.611 | 1.000 |
| Precisión de argumentos (extraíbles-exactos) | 0.126 | 0.798 |
| F1 de argumentos | 0.256 | 0.837 |
| Validez JSON | 0.903 | 1.000 |
| Abstención correcta | 1.000 | 1.000 |

El segundo conjunto, sobre benchmarks generales (ambos excluyen la categoría `web_search` por falta de API key, medidos con el mismo harness):

| Benchmark | Base | Este modelo |
|---|---|---|
| BFCL v4 (global) | 20.37% | 20.35% |
| IFEval | 66.15% | 66.15% |

Los autores indican que el líder publicado en la categoría ≤2 GB de BFCL v4 obtiene 56.88, y que este modelo no está cerca. No se han publicado otros resultados de benchmarks en la información disponible.

## Requisitos de hardware

- **VRAM estimada para inferencia**: el GGUF Q4_K_M ocupa 1,19 GB, por lo que cabe en cualquier GPU con al menos 2 GB de VRAM o incluso en memoria RAM de un dispositivo móvil.
- **GPU recomendadas**: cualquier GPU consumer (RTX 3050 o superior) o incluso CPUs modernas; no requiere GPU de datacenter.
- **Dispositivos compatibles**: teléfonos móviles, Raspberry Pi 5, portátiles sin GPU dedicada, edge devices.
- **Opciones de despliegue**: llama.cpp (`llama-server -m animica-agent-2b-q4_k_m.gguf --jinja`), o con el adaptador sobre la base (`llama-server -m qwen3.5-2b-q4_k_m.gguf --lora animica-agent-2b-lora.gguf`). También se sirve a través de la API de Animica, OpenAI-compatible, sin descarga.
- **Latencia**: en la red descentralizada de Animica, la latencia es de 20-40 segundos por petición (porque las respuestas las generan dispositivos voluntarios que compiten). En hardware local, la latencia será menor, aunque no se proporcionan datos exactos.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | BFCL v4 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-2B (base) | ~2B | no disponible | 20.37% | Apache-2.0 | HuggingFace |
| Animica-Agent-2B | ~2B + 134M LoRA | no disponible | 20.35% | Apache-2.0 | HuggingFace + red Animica |
| Líder ≤2 GB en BFCL v4 (no identificado) | ≤2B | no disponible | 56.88 | no disponible | no disponible |

La comparativa con el líder de la categoría muestra una brecha significativa en el benchmark general; la especialización de Animica-Agent-2B se limita a superficies API específicas. No se dispone de datos de otros modelos de tool-calling pequeños (p. ej., Llama-3.2-3B o Qwen2.5-3B) en la información proporcionada.

## Limitaciones y advertencias

- **Sin mejora en benchmarks generales**: el fine-tune no mueve la capacidad general de tool-calling (BFCL v4 pasa de 20.37% a 20.35%, IFEval se mantiene en 66.15%). No es un modelo agéntico general; para eso se recomienda un modelo más grande.
- **Debilidad en secuencias multi-turno largas**: la tarea held-out más débil obtiene solo 0.28, lo que limita su uso en diálogos complejos con muchas llamadas encadenadas.
- **No inventa argumentos no declarados**: por diseño, el modelo se abstiene o deja fuera los argumentos que el usuario no ha mencionado, lo que puede resultar en llamadas incompletas si el usuario no proporciona todos los datos necesarios.
- **Instrucción-following mediocre**: IFEval 66.15% es un rendimiento bajo en comparación con modelos más grandes; no es adecuado para tareas que requieren seguir instrucciones complejas.
- **Advertencia de integridad del archivo**: el autor avisa de que una exportación anterior se distribuyó con el mismo nombre sin chat template embebido y no llamaba correctamente a las herramientas. Hay que verificar el checksum SHA256 antes de servir el modelo.
- **Pasar las herramientas por el campo `tools`**: si se introducen a mano en el system prompt, el modelo produce argumentos correctos pero envueltos en markup no parseable y con `tool_calls: null`.
- **Licencia Apache-2.0**: permite uso comercial, pero el adaptador se entrenó sobre un corpus propio, así que se debe verificar la compatibilidad de las licencias de los datos base (Qwen3.5-2B es Apache-2.0).
- **Sin datos de contexto ni idiomas**: no se ha publicado la longitud de contexto máxima ni los idiomas soportados, por lo que se recomienda probar con casos reales antes de usarlo en producción.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/animicaorg/Animica-Agent-2B)
- [Base del modelo: Qwen/Qwen3.5-2B](https://huggingface.co/Qwen/Qwen3.5-2B)
- [Página web de Animica](https://www.animica.org/)
- [Pipeline, corpus y harness de evaluación (GitLab)](https://gitlab.com/Animica/animica-model)
- [Ejemplo de contrato AI Agent (GitHub)](https://github.com/animicaorg/animica-core/tree/main/contracts/examples/ai_agent)
- [Tutorial del contrato AI Agent (GitHub)](https://github.com/animicaorg/animica-core/blob/main/contracts/docs/TUTORIAL_ai_agent.md)
- [Descarga directa del GGUF](https://animica.dev/models/animica-agent-2b-q4_k_m.gguf)
- [Descarga del LoRA](https://animica.dev/models/animica-agent-2b-lora.gguf)
- [Checksums SHA256](https://animica.dev/models/SHA256SUMS)
- [Servicio de fábrica para generar adaptadores sobre tu API](https://animica.dev/factory/)
