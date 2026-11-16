# gruxai/grux-local-4b

## Resumen

Grux Local 4B es un ajuste fino (finetune) del modelo Qwen/Qwen3.5-4B desarrollado por gruxai, orientado específicamente a tareas de agente local en macOS. El modelo está entrenado para ejecutar los trabajos que la aplicación Grux (un agente de IA de código abierto para macOS) delega a un modelo: llamadas a herramientas, gestión de tareas, eventos, notas, memorias, búsqueda web, control de aplicaciones y modos de concentración. Su propuesta central es funcionar sin clave de API ni cuenta, enteramente en local sobre Apple Silicon.

El modelo se distribuye en formato MLX (con pesos safetensors) y también mediante etiquetas de Ollama. Cuenta con 5.002.669.056 parámetros totales según los safetensors del repositorio (3,7 GB), y se ofrece en tres variantes de tamaño dentro de la familia (2B, 4B y 9B), aunque este repositorio concreto corresponde al 4B. La ventana de contexto operativa declarada por la aplicación es de 16.384 tokens en Macs de 16 GB y de 32.768 tokens en Macs de 24 GB o más.

Su relevancia actual radica en dos ejes: por un lado, el entrenamiento específico para resistir inyección de prompts en texto pegado (correos, páginas web, capturas de pantalla o documentos), un problema crítico en agentes que procesan contenido externo; por otro, la optimización para hardware de consumo Apple (Mac mini M4 de 16 GB), con latencias declaradas de 3,4 s para el percentil 95 de respuestas de chat en el 4B.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen/Qwen3.5-4B); no se detalla la arquitectura interna en la informacion disponible |
| Parametros totales | 5.002.669.056 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 16.384 tokens en Macs de 16 GB; 32.768 tokens en Macs de 24 GB o mas (valores usados por Grux 3.1) |
| Tipos de cuantizacion | 4-bit (tag del repositorio); formato NVFP4 mencionado en tags; pesos MLX con escalas renombradas |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors en formato MLX (libreria mlx); los tensores de vision se excluyen del repositorio |

## Arquitectura y entrenamiento

El modelo es un finetune del Qwen3.5-4B base. El repositorio aloja los tensores de texto sin cambios respecto al modelo servido como `gruxai.com/grux/grux-local:4b` (manifiesto `sha256:1de6472396f2`), con las escalas renombradas al formato que lee MLX y sin los tensores de vision, ya que Grux Local se entrena y evalúa únicamente sobre texto. Los pesos se distribuyen en cuantización de 4 bits.

El entrenamiento se centró en el conjunto de tareas reales que Grux asigna al modelo: llamadas a herramientas con argumentos correctos, rechazo explícito cuando ninguna herramienta puede cumplir la petición, tratamiento del texto pegado como datos (ignorando instrucciones ocultas y avisando de intentos de manipulación) y ejecución de trabajos en segundo plano (corrección de dictado, triaje de correo a JSON, clasificación de notificaciones, titulación de chats, resumen de reuniones y creación de issues). No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si se emplearon RLHF o DPO.

La evaluación se realizó sobre 464 tareas retenidas (held-out v1), escritas de forma independiente y nunca usadas en entrenamiento, puntuadas con los propios parsers de Grux y comparadas contra el modelo Qwen3.5 base sin entrenar. El modelo opera con el modo thinking desactivado tal como lo envía Grux.

## Capacidades

- Llamada a herramientas (tool calling / function calling) con relleno correcto de argumentos para tareas, eventos, notas, memorias, búsqueda web, apertura de aplicaciones y modos de concentración.
- Reconocimiento de límites: declarar que no puede realizar una petición cuando ninguna herramienta disponible la cubre, en lugar de simular que se hizo.
- Resistencia a inyección de prompts: trata el texto pegado (correos, páginas web, capturas, documentos) como datos y no como instrucciones, y advierte cuando detecta intentos de manipulación.
- Trabajos en segundo plano: corrección de dictado sin responder al contenido, triaje de correo a JSON, clasificación de notificaciones, titulación de chats, resumen de reuniones y creación de issues a partir de lo dictado.
- Generación de texto conversacional en inglés.
- Ejecución local sin clave de API ni cuenta, sobre Apple Silicon mediante Ollama o mlx-lm.
- No incluye capacidades de visión (los tensores de visión se excluyen y el modelo se entrena solo con texto).

## Casos de uso

- Agente personal en macOS: el modelo ejecuta las llamadas a herramientas que Grux le delega (crear tareas, eventos, notas y memorias) con los argumentos correctos, lo que permite un asistente local sin dependencia de servicios en la nube.
- Procesamiento seguro de correo pegado: al recibir un correo o una página web como texto, el modelo realiza la acción solicitada sobre ese contenido e ignora instrucciones ocultas, con un 92,9 % de casos superados en el conjunto de instrucciones ocultas; adecuado para triaje de bandeja de entrada.
- Triaje y clasificación de correo: convierte mensajes entrantes al JSON que Grux consume, aprovechando el entrenamiento específico en esta tarea de fondo.
- Corrección de dictado: corrige transcripciones sin responder a su contenido, integrándose en flujos de voz a texto en local.
- Resumen de reuniones y titulación de chats: tareas de fondo de bajo coste que se benefician de la latencia baja (95 % de respuestas en 3,4 s en el 4B sobre Mac mini M4).
- Clasificación de notificaciones: categoriza notificaciones del sistema en local, sin enviar datos a terceros.
- Creación de issues desde lenguaje natural: extrae y estructura la información dictada por el usuario para abrir issues en herramientas de seguimiento.
- Despliegue en hardware de consumo: un Mac mini M4 de 16 GB puede cargar el 4B en 4,44 GB a contexto 16.384, lo que lo hace viable para equipos sin GPU dedicada.

## Benchmarks y rendimiento

Resultados declarados por el autor (no verificados de forma independiente):

| Tarea | Metrica | Valor |
|---|---|---|
| Grux jobs (tool calls y trabajos en segundo plano) | accuracy, tareas superadas de 464 | 97,8 |
| Instrucciones ocultas en texto pegado ignoradas | accuracy, casos superados de 70 | 92,9 |

Comparativa antes/después del entrenamiento declarada en la model card (mismo Mac mini M4 de 16 GB, Ollama 0.40.8, thinking off):

| Modelo | Todas las 464 tareas | Instrucciones ocultas ignoradas |
|---|---|---|
| 4B base (Qwen3.5) | 396 (85 %) | 55 de 70 |
| Grux Local 4B | 454 (98 %) | 65 de 70 |
| 2B base | 295 (64 %) | 43 de 70 |
| Grux Local 2B | 435 (94 %) | 66 de 70 |
| 9B base (medido en MacBook Pro M4 Pro) | 400 (86 %) | 65 de 70 |
| Grux Local 9B | 458 (99 %) | 66 de 70 |

Ejecución propia del repositorio con mlx-lm 0.32.2 sobre Mac mini M4 de 16 GB (15 de noviembre de 2026, thinking off):

| Metrica | Via Ollama (model card) | Estos ficheros via mlx-lm |
|---|---|---|
| Todas las 464 tareas | 454 (98 %) | 458 (99 %) |
| Instrucciones ocultas ignoradas | 65 de 70 | 69 de 70 |

Latencia declarada: el 95 % de las respuestas de chat volvieron en 3,4 s (4B), 1,6 s (2B) y 3,8 s (9B) en el Mac mini M4 de 16 GB. No se han publicado resultados en benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM/memoria unificada: 4,44 GB recién cargado a num_ctx 16.384 en el 4B; tras una ejecución completa de 464 tareas, Ollama reportó 13,11 GB en el Mac mini de 16 GB. El 2B carga en 2,65 GB y el 9B en 7,25 GB a la misma configuración.
- Hardware objetivo: Macs con Apple Silicon. El 4B está pensado para Macs de 16 GB o más; el 2B para Macs de 8 GB; el 9B para Macs de 24 GB o más.
- GPU dedicadas (A100, H100, RTX 4090): no se documenta soporte; el modelo se distribuye en formato MLX para Apple Silicon.
- Cabe en GPU de consumo: sí, en el sentido de que cabe en la memoria unificada de un Mac mini M4 de 16 GB; no hay datos sobre GPUs NVIDIA de consumo.
- Opciones de despliegue: Ollama 0.40.8 o posterior (etiquetas `gruxai.com/grux/grux-local:2b`, `:4b`, `:9b` y `:4b-v2` opt-in) y mlx-lm (por ejemplo, `mlx_lm.generate --model gruxai/grux-local-4b --prompt "..."`).
- Latencia y throughput: 95 % de respuestas de chat en 3,4 s (4B) sobre Mac mini M4; no se publican cifras de throughput en tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Grux Local 4B | 5.002.669.056 | 16.384 / 32.768 tokens segun RAM | Finetune para agente local macOS y resistencia a inyeccion | apache-2.0 | Hugging Face (MLX) y Ollama |
| Qwen/Qwen3.5-4B (base) | no disponible en la informacion | no disponible en la informacion | Modelo generalista | no disponible en la informacion | Hugging Face |
| Grux Local 2B | no disponible en la informacion | 16.384 tokens (configuracion de Grux) | Misma familia, para Macs de 8 GB | apache-2.0 | Ollama |
| Grux Local 9B | no disponible en la informacion | 32.768 tokens en Macs de 24 GB+ | Misma familia, mayor capacidad | apache-2.0 | Ollama |

No se dispone de datos de benchmarks estándar ni de otros modelos comparables de la misma categoría en la información proporcionada; la comparación se limita a la propia familia Grux Local y al modelo base Qwen3.5-4B.

## Limitaciones y advertencias

- El modelo solo declara soporte de inglés; no se documentan capacidades multilingües.
- No incluye visión: los tensores de visión se excluyen deliberadamente y el entrenamiento y la evaluación son solo de texto.
- Los resultados de benchmarks son declarados por el autor y no están verificados de forma independiente (`verified: false` en el model-index).
- El conjunto de evaluación (held-out v1) es propio del proyecto y está orientado a las tareas de Grux, por lo que no es comparable con benchmarks generalistas como MMLU o HumanEval.
- El consumo de memoria crece durante la ejecución: de 4,44 GB recién cargado a 13,11 GB tras una ejecución completa en el 4B sobre un Mac mini de 16 GB; el comportamiento en Macs de 8 GB no está medido.
- Requiere Ollama 0.40.8 o posterior y Apple Silicon; no se documenta soporte para otras plataformas o GPUs.
- Existe una versión 4B v2 opt-in; las etiquetas `:4b` y `latest` permanecen en la versión 1, lo que puede generar confusión sobre qué versión se está desplegando.
- Aunque la licencia es Apache 2.0 y permite uso comercial, el modelo está optimizado para el conjunto de herramientas de Grux; su rendimiento fuera de ese dominio no está documentado.
- Riesgo de alucinación y sesgos: no se documentan análisis específicos en la información disponible.

## Enlaces

- Hugging Face: https://huggingface.co/gruxai/grux-local-4b
- Repositorio del agente Grux: https://github.com/dotcomjack/grux
- Página del modelo en gruxai.com: https://gruxai.com/grux-local/
- Código de configuración de contexto de Grux 3.1: https://github.com/dotcomjack/grux/blob/v3.1.0/Grux-Mac/Sources/Grux/Chat/LocalTurn.swift#L21-L27
- Resultados detallados de la evaluación: `results/v1.json` (referenciado en la model card)
- Script de verificación: `results/check.py` (referenciado en la model card)
- mlx-lm: https://github.com/ml-explore/mlx-lm
