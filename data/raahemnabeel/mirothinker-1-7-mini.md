# raahemnabeel/mirothinker-1.7-mini

## Resumen

MiroThinker-1.7-mini es un modelo de lenguaje especializado en investigación profunda y uso de herramientas, desarrollado por MiroMind como un fine-tune de Qwen3-30B-A3B-Thinking-2507. Se trata de un modelo de mezcla de expertos (MoE) con 30.000 millones de parámetros totales y 3.000 millones activos por token, diseñado para tareas de búsqueda, navegación web y razonamiento multi-paso de largo horizonte, con soporte de hasta 300 llamadas a herramientas por tarea.

La ficha que nos ocupa corresponde a un paquete de despliegue publicado por el usuario raahemnabeel, que empaqueta los pesos originales de MiroMind para su ejecución sobre hardware Tenstorrent (p150, p150x2, p150x4, p300 y p300x2) mediante vLLM y el gestor tt-model-manager. No se trata de un nuevo entrenamiento, sino de una distribución lista para servir con API compatible con OpenAI.

El modelo resulta relevante para quienes necesitan agentes de investigación autónomos con ventanas de contexto muy largas (256.000 tokens) y razonamiento explícito antes de responder, en un entorno de inferencia alternativo a las GPU tradicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de mezcla de expertos (MoE), 48 capas, 128 expertos, top-8 |
| Parametros totales | 30.000 millones (30B) |
| Parametros activos | 3.000 millones (3B) por token |
| Longitud de contexto | 256.000 tokens (98.304 tokens en perfil p150 simple) |
| Tipos de cuantizacion | No disponible (los pesos de expertos se convierten a menor precision al cargar; no se detalla el formato) |
| Idiomas soportados | No disponible (el modelo base MiroThinker-1.7-mini deriva de Qwen3; la model card no explicita idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | No disponible (repo de 2,0 GB; pesos referenciados desde miromind-ai/MiroThinker-1.7-mini en el commit e371d5a8956cad89c574bc1bbe79f3866b325755) |

## Arquitectura y entrenamiento

El modelo base es Qwen3-30B-A3B-Thinking-2507, un transformer de mezcla de expertos con 48 capas, 128 expertos y enrutamiento top-8, lo que resulta en 3.000 millones de parámetros activos por token sobre un total de 30.000 millones. MiroMind lo ha afinado para tareas de investigación profunda (deep research), con entrenamiento orientado a búsqueda, navegación y uso de herramientas en horizontes largos, admitiendo hasta 300 llamadas a herramientas por tarea. El modelo incorpora un modo de razonamiento explícito (thinking) que genera texto de razonamiento antes de la respuesta final.

No se dispone de detalles sobre el número de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO en la información proporcionada. El paquete de raahemnabeel no modifica los pesos: los sirve tal cual se publican y convierte los pesos de los expertos a menor precisión en el momento de la carga del servidor. La innovación destacable de este paquete es el soporte de despliegue sobre aceleradores Tenstorrent mediante vLLM con perfiles de servicio predefinidos (p150, p150x2, p150x4, p300, p300x2), con compilación de kernels en el primer arranque.

## Capacidades

- Generación de texto y razonamiento explícito: el modelo piensa antes de responder y separa el texto de razonamiento (`reasoning`) del contenido final (`content`).
- Uso de herramientas (tool calling): soporte del parser `hermes`, con peticiones que incluyen `tools` y devuelven `tool_calls` con `finish_reason: tool_calls`.
- Agentes multi-paso: entrenado para cadenas de hasta 300 llamadas a herramientas por tarea, orientado a investigación y navegación.
- Integración con MiroFlow: compatible con el framework de agentes de MiroMind, que inserta herramientas en el system prompt y parsea bloques `<use_mcp_tool>`.
- Contexto largo: hasta 256.000 tokens en los perfiles p300, p300x2, p150x2 y p150x4.
- API compatible con OpenAI: endpoints de chat completions, completions y `/v1/models`.
- Concurrencia: hasta 32 secuencias simultáneas en los perfiles de servicio.
- Multilingüe: no disponible en la información proporcionada.
- Modalidades: solo texto (no hay visión ni audio).

## Casos de uso

- Agentes de investigación profunda: el modelo puede encadenar búsquedas, navegación y lectura de fuentes a lo largo de cientos de llamadas a herramientas, adecuado para informes que requieren recopilar y sintetizar evidencia de múltiples páginas.
- Automatización de due diligence o análisis competitivo: con 256.000 tokens de contexto puede mantener el estado de una investigación larga sin perder referencias previas, integrando herramientas de búsqueda y extracción.
- Asistentes de atención al cliente con acceso a sistemas: mediante tool calling puede consultar bases de datos, CRM o APIs internas y devolver respuestas razonadas, con el razonamiento separado del texto visible.
- Pipelines de generación de código asistida por herramientas: el modelo puede invocar ejecutores de código o linters como herramientas y razonar sobre los resultados, útil en flujos de CI/CD con agentes.
- Despliegue en infraestructura Tenstorrent: organizaciones con aceleradores p150 o p300 pueden servir el modelo con `tt serve` y una API compatible con OpenAI, sin depender de GPU NVIDIA.
- Investigación académica sobre agentes: el paquete facilita reproducir experimentos de agentes de búsqueda sobre hardware alternativo, con perfiles de servicio documentados y métricas de rendimiento publicadas.
- Procesamiento de documentos extensos: con contexto de 256.000 tokens puede analizar contratos, informes o corpus técnicos completos en una sola pasada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de precisión (BrowseComp, BrowseComp-ZH, GAIA, HLE) para este paquete en la información disponible; la model card indica que están pendientes y remite a la model card original de MiroMind y a su repositorio de GitHub.

Sí se publican métricas de rendimiento de servicio con vLLM (mediana, una petición por usuario a la vez):

| Perfil | Usuarios | Entrada / salida (tokens) | TTFT (ms) | TPOT (ms) | tok/s por usuario | tok/s salida total |
|---|---:|---:|---:|---:|---:|---:|
| p300x2 | 1 | 128 / 128 | 164 | 10,2 | 98 | 88 |
| p300x2 | 1 | 1.024 / 256 | 410 | 10,5 | 95 | 80 |
| p300x2 | 1 | 4.096 / 256 | 837 | 11,1 | 90 | 67 |
| p300x2 | 1 | 32.768 / 256 | 3.585 | 13,1 | 76 | 37 |
| p300x2 | 8 | 128 / 128 | 543 | 14,8 | 68 | 427 |
| p300x2 | 8 | 1.024 / 256 | 1.355 | 15,6 | 64 | 391 |
| p300x2 | 32 | 1.024 / 256 | 5.802 | 29,3 | 34 | 660 |
| p300 | 1 | 128 / 128 | 139 | 11 (dato truncado en la fuente) | no disponible | no disponible |

Además, con texto real (12 prompts de chat × 384 tokens de salida, temperatura 0): 95 tok/s en p300x2 y 86 tok/s en p300.

## Requisitos de hardware

- Hardware objetivo: aceleradores Tenstorrent p150 (1 die), p150x2 (2 dies), p150x4 (4 dies), p300 (2 dies) o p300x2 (4 dies). No se documenta despliegue en GPU NVIDIA en esta ficha.
- Perfil p150: 1 die, todos los 128 expertos, contexto compartido de 98.304 tokens entre 32 secuencias (KV en bf16 de 96 KiB por token en un die).
- Perfil p300 o p150x2: 2 dies, 64 expertos por die, 32 secuencias, 256.000 tokens de contexto.
- Perfil p300x2 o p150x4: 4 dies, 32 expertos por die, 32 secuencias, 256.000 tokens de contexto.
- VRAM estimada: no disponible (hardware no GPU).
- Despliegue: `tt serve raahemnabeel/mirothinker-1.7-mini` o `tt-model serve raahemnabeel/mirothinker-1.7-mini`, con Docker, CLI de Tenstorrent y servidor OpenAI-compatible en el puerto 20000.
- Primer arranque: compilación de kernels para el dispositivo, que tarda varios minutos.
- Throughput medido: hasta 98 tok/s por usuario en p300x2 con una sola secuencia; 660 tok/s agregados con 32 usuarios en p300x2.
- Cabe en GPU de consumo: no disponible (el paquete está orientado a Tenstorrent).

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Licencia | Hardware de referencia |
|---|---|---|---|---|---|
| MiroThinker-1.7-mini (este paquete) | 30B (MoE) | 3B | 256.000 | Apache 2.0 | Tenstorrent p150/p300 |
| Qwen3-30B-A3B-Thinking-2507 (base) | 30B (MoE) | 3B | No disponible en esta ficha | No disponible en esta ficha | GPU (no especificado) |
| MiroThinker-1.7-mini original (miromind-ai) | 30B (MoE) | 3B | 256.000 | Apache 2.0 | GPU (no especificado) |

No se dispone de datos de benchmarks comparativos en la información proporcionada para establecer diferencias de rendimiento entre estas variantes.

## Limitaciones y advertencias

- El modelo piensa antes de responder: si el presupuesto de `max_tokens` se agota dentro del razonamiento, el campo `content` queda vacío. Hay que asignar presupuestos de miles de tokens.
- `top_k` está limitado a 32 en el muestreo en dispositivo.
- Solo texto: no hay capacidades de visión ni audio.
- El paquete sirve únicamente el modelo; las herramientas de búsqueda, navegación y código debe aportarlas el usuario.
- Los pesos de los expertos se convierten a menor precisión al cargar el servidor, lo que puede afectar a la fidelidad respecto al checkpoint original.
- El perfil p150 reduce el contexto a 98.304 tokens compartidos entre 32 secuencias.
- Riesgo de alucinación: no cuantificado en la información disponible; es un riesgo inherente a modelos de lenguaje en tareas de investigación.
- Sesgos conocidos: no documentados en la información proporcionada.
- Idiomas soportados: no documentados en esta ficha.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar las condiciones del modelo base y de las dependencias de despliegue (vLLM, tt-model-manager, Docker).
- Las métricas de precisión en benchmarks del paquete están pendientes de publicación.

## Enlaces

- Paquete en Hugging Face: https://huggingface.co/raahemnabeel/mirothinker-1.7-mini
- Modelo base original: https://huggingface.co/miromind-ai/MiroThinker-1.7-mini
- Repositorio de MiroThinker / MiroFlow: https://github.com/MiroMindAI/MiroThinker
- Gestor de modelos Tenstorrent: https://github.com/tenstorrent/tt-model-manager
- CLI de Tenstorrent (prerrequisitos): https://github.com/tenstorrent/tt-cli/blob/main/docs/prerequisites.md
