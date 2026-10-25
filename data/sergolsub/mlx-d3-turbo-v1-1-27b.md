# sergolsub/mlx-d3-turbo-v1.1-27B

## Resumen

`sergolsub/mlx-d3-turbo-v1.1-27B` es una conversión a 8 bits en formato MLX del modelo `vllm-sr/d3-turbo` (27B parámetros), publicada por el usuario sergolsub para su ejecución nativa en Apple Silicon mediante la librería `mlx_lm`. La conversión se realizó en streaming desde los shards BF16 del repositorio original, sin reentrenamiento ni cambios de arquitectura, y mantiene la licencia Apache 2.0 del modelo base.

Su interés principal es permitir cargar un modelo de 27B en Macs con memoria unificada (la referencia de la familia se midió en un Mac mini M4 Pro de 48 GB), evitando la dependencia de GPUs de datacenter. La model card incluye archivos de inferencia adicionales (`decision_config.json`, `joint_config.json`), lo que sugiere que la familia d3 incorpora un modo de decisión orientado a tareas de clasificación o enrutamiento de baja latencia.

Se trata de un modelo muy reciente (0 descargas y 0 likes en el momento de la ficha), sin benchmarks de calidad publicados ni documentación detallada sobre contexto, idiomas o datos de entrenamiento, por lo que conviene validarlo antes de cualquier uso en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (conversión sin cambios de arquitectura respecto a vllm-sr/d3-turbo) |
| Parámetros totales | 27B (según denominación del modelo) |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | 8 bits (MLX); pesos originales en BF16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (layout MLX) |

Nota: los metadatos de HuggingFace indican un tamaño de repositorio de 10,2 GB, mientras que la model card menciona 27,8 GB previstos en disco. Conviene verificar que todos los shards están completos antes de descargar.

## Arquitectura y entrenamiento

Este repositorio no contiene un modelo entrenado desde cero, sino una cuantización a 8 bits para MLX de los pesos BF16 de `vllm-sr/d3-turbo`. Según la model card, la conversión se hizo en streaming ("stream-converted") y los pesos nunca se alojaron en la máquina del autor; no hubo reentrenamiento ni modificaciones de arquitectura. Los shards originales presentan un `text_config` anidado, un patrón habitual en configuraciones multimodales, aunque la ficha no confirma capacidades de visión.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de técnicas como RLHF o DPO, ya que la model card del modelo base no está incluida en la información proporcionada. Lo más distintivo es la inclusión de ficheros de inferencia para un modo de decisión (`*_mlx.py`, `decision_config.json`, `joint_config.json`), presentes "cuando el modelo tiene un modo de decisión", lo que apunta a cabezas de decisión/conjuntas adicionales sobre el backbone de 27B.

## Capacidades

- Generación de texto mediante `mlx_lm`, con el patrón de uso oficial `load()` / `generate()` y `chat_template.jinja` incluido en el repositorio.
- Modo de decisión: el repositorio prevé archivos de inferencia de decisión/cabeza conjunta; la referencia de familia mide una "decisión mediana" de 2141 ms, lo que sugiere orientación a tareas de decisión o clasificación rápida.
- Ejecución local en Apple Silicon sin conexión a servicios externos.
- Capacidades de razonamiento, código, matemáticas, visión, audio, tool calling o soporte agéntico: no disponibles (no documentadas en la información proporcionada).
- Capacidades multilingües: no disponibles (no especificadas).

## Casos de uso

- Enrutamiento semántico de prompts en sistemas multi-modelo: el modo de decisión y la latencia mediana de decisión medida en la familia (2141 ms) encajan con clasificar consultas entrantes y dirigirlas al modelo o agente adecuado antes de un LLM mayor.
- Clasificación y moderación de contenido on-premise: un modelo de 27B con cabeza de decisión puede etiquetar intenciones o categorizar tickets sin enviar datos a APIs de terceros.
- Asistente conversacional local y privado en Mac: con `mlx_lm` sobre memoria unificada de 48 GB, es adecuado para entornos con requisitos de confidencialidad (legal, sanitario, interno corporativo).
- Redacción y generación de texto sin coste por token: informes, correos y documentación interna, aprovechando que la inferencia se ejecuta íntegramente en hardware local.
- RAG sobre documentación privada: puede combinarse con un índice vectorial local para responder sobre documentos confidenciales; dado que la longitud de contexto no está publicada, conviene verificarla antes de diseñar el pipeline.
- Prototipado y evaluación de prompts sin API de pago: útil para iterar plantillas de prompt y comparar salidas localmente antes de escalar a un modelo servido en GPU.
- Automatización de decisiones en pipelines: los archivos `decision_config.json` y `joint_config.json` permiten integrar la salida de decisión (por ejemplo, escalar o no a un humano) en flujos de trabajo automatizados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

Como referencia operativa (no de calidad), la model card aporta mediciones del modelo familiar `d3-v3.1.0-27B`, con el mismo backbone, en un Mac mini M4 Pro de 48 GB:

| Métrica | Valor (referencia de familia) |
|---|---|
| Tamaño en disco | 28,15 GB |
| Tiempo de carga | 7,08 s |
| Pico de memoria residente | 15,78 GB |
| Decisión mediana | 2141 ms |

Estos valores no corresponden a este repositorio concreto, cuyo peso planificado en disco es de 27,8 GB y no fue medido localmente por el autor.

## Requisitos de hardware

- Estimación de memoria para inferencia: unos 27-28 GB solo de pesos a 8 bits, más la caché KV y el overhead del runtime; se recomienda un Mac con al menos 32 GB de memoria unificada, siendo 48 GB la configuración de referencia medida.
- GPU recomendadas: no aplica a GPUs NVIDIA en este formato; MLX está diseñado para Apple Silicon (M1/M2/M3/M4). Para servir en GPU (A100/H100 80 GB) habría que usar los pesos BF16 originales de `vllm-sr/d3-turbo` (unos 54 GB estimados a 16 bits).
- Consumer GPUs: no compatible directamente, ya que el formato MLX no funciona en CUDA; en Mac sí cabe en configuraciones de 32 GB ajustado y con holgura en 48 GB o más.
- Opciones de despliegue: `mlx_lm` (uso oficial documentado en la model card) y el ecosistema MLX; Ollama y llama.cpp requieren conversión a GGUF, que no está incluida. El modelo base podría servirse con frameworks estándar como vLLM o transformers, aunque no se especifica en la ficha.
- Latencia y throughput: la referencia de familia reporta carga en 7,08 s y decisión mediana de 2141 ms en M4 Pro 48 GB; no se publican tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato/Cuantización | Licencia | Notas |
|---|---|---|---|---|---|
| sergolsub/mlx-d3-turbo-v1.1-27B | 27B | no disponible | MLX 8-bit | Apache 2.0 | Modo de decisión; solo Apple Silicon |
| google/gemma-3-27b-it | 27B | 128K | BF16 y conversiones MLX comunitarias | Licencia Gemma | Multimodal (visión); ecosistema muy maduro |
| Qwen/Qwen3-32B | 32,8B | 32.768 (131.072 con YaRN) | BF16 y GGUF/MLX comunitarios | Apache 2.0 | Modo thinking; fuerte en razonamiento y código |
| mistralai/Mistral-Small-3.2-24B-Instruct | 24B | 128K | BF16 y cuantizaciones comunitarias | Apache 2.0 | Visión; buen soporte de function calling |

Frente a estas alternativas, la propuesta diferencial de d3-turbo es su modo de decisión integrado y la optimización para latencia de decisión en Apple Silicon, a costa de una documentación pública mucho más limitada.

## Limitaciones y advertencias

- Sin benchmarks de calidad publicados: el riesgo de alucinación y la exactitud en razonamiento, código o matemáticas no han sido evaluados públicamente.
- Conversión de terceros sin reentrenamiento: hereda íntegramente las capacidades y sesgos del modelo base `vllm-sr/d3-turbo`, cuya documentación tampoco está disponible en la información proporcionada.
- Discrepancia de tamaños (10,2 GB en metadatos del repo frente a 27,8 GB previstos en disco): verificar la integridad y completitud de los shards safetensors antes de usar.
- Longitud de contexto e idiomas no documentados: riesgo alto en tareas de contexto largo o en idiomas no verificados; probar con el chat template incluido.
- Formato MLX: ejecutable solo en Apple Silicon; no usable directamente en entornos CUDA/servidor sin recurrir a los pesos originales.
- Licencia Apache 2.0 permite uso comercial, pero la model card establece que, en caso de conflicto, prevalece la LICENSE del repositorio upstream; revisarla antes de un despliegue comercial.
- Repositorio muy reciente y sin tracción comunitaria (0 descargas): no hay validación de terceros ni historial de issues.
- El modo de decisión depende de archivos condicionales (`decision_config.json`, `joint_config.json`): confirmar su presencia y funcionamiento en la revisión descargada.

## Enlaces

- Ficha del modelo: https://huggingface.co/sergolsub/mlx-d3-turbo-v1.1-27B
- Modelo base (pesos originales): https://huggingface.co/vllm-sr/d3-turbo
- Paper, blog o demo: no disponibles (no se han encontrado en la información proporcionada)
