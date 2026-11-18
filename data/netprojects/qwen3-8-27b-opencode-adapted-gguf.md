# netprojects/Qwen3.8-27B-opencode-adapted-GGUF

## Resumen

Qwen3.8-27B-opencode-adapted-GGUF es una cuantización en formato GGUF del modelo harness-hub/Qwen3.8-27B-opencode-adapted, un ajuste fino mediante LoRA sobre Qwen/Qwen3.8-27B orientado a tareas de agente de programación. El adaptador fue entrenado por harness-hub con aprendizaje por refuerzo (AsyncGRPO en TRL) para funcionar como el modelo subyacente del agente de código OpenCode en tareas de ingeniería de software y de terminal. Esta publicación, mantenida por netprojects (Internet Projects Ltd), fusiona el adaptador con el modelo base y lo convierte a GGUF para su uso directo con llama.cpp, sin necesidad de cargar el LoRA por separado.

El modelo tiene 27.320.697.856 parámetros totales y una arquitectura transformer con 64 capas, de las cuales 16 son de atención completa, además de una capa de predicción multi-token (MTP) que permite decodificación especulativa. Incorpora también un codificador visual, por lo que acepta entrada de imagen y texto (pipeline image-text-to-text). El repositorio ofrece cuatro ficheros: tres cuantizaciones del modelo (Q4_K_M, Q6_K y Q8_0) y un proyector multimodal F16.

La relevancia de esta ficha radica en que empaqueta un modelo especializado en agentes de código en un formato listo para ejecutar en local con llama-server, con MTP activable para acelerar la decodificación y soporte de imágenes. Según la model card, el adaptador mejora el rendimiento del modelo base en SWE-bench Pro (hard 51) del 35,3% al 51,0% y en Terminal-Bench 2.1 del 46,4% al 52,4%, con el modo thinking desactivado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con 64 capas (16 de atención completa) y capa MTP; codificador visual |
| Parametros totales | 27.320.697.856 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 65.536 tokens (valor usado en el ejemplo de llama-server; no se especifica el máximo oficial) |
| Tipos de cuantizacion | Q4_K_M, Q6_K, Q8_0 (GGUF); MLX 6-bit en repo aparte |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp), con proyector multimodal mmproj F16 |

## Arquitectura y entrenamiento

El modelo base es Qwen3.8-27B, un transformer de 27.320.697.856 parámetros con 64 capas, de las que 16 son de atención completa. Incluye una capa de predicción multi-token (MTP) que llama-server puede aprovechar con `--spec-type draft-mtp` para decodificación especulativa. El adaptador de harness-hub se entrenó con aprendizaje por refuerzo (AsyncGRPO en TRL) sobre tareas de ingeniería de software y de terminal, y se fusionó con el modelo base mediante la operación `W + 2.0 · B @ A` redondeada a bf16 en los 256 módulos adaptados (q, k, v, o en las 16 capas de atención completa; gate, up, down en las 64 capas). El resto de tensores, incluida la capa MTP y el codificador visual, es idéntico byte a byte a Qwen3.8-27B.

La conversión se realizó con `convert_hf_to_gguf.py` de llama.cpp (commit 8642541b2) y la cuantización con `llama-quantize` de Homebrew llama.cpp (commit b1b770d90). El tokenizador y la plantilla de chat son los del adaptador de harness-hub, embebidos sin cambios. La model card no detalla el volumen de tokens de entrenamiento ni la composición del dataset, que remite a la ficha del adaptador original.

## Capacidades

- Generación de texto y razonamiento, con modo thinking desactivable mediante `enable_thinking: false`.
- Programación y tareas de ingeniería de software: resolución de bugs, parches y ejecución de tests.
- Uso de herramientas (tool calling) en formato de agente, con llamadas bien formadas a herramientas `bash` y `read` verificadas en la model card.
- Operación como agente multi-paso dentro de OpenCode y otros clientes compatibles con la API de OpenAI.
- Entrada de imagen y texto gracias al proyector multimodal `mmproj-Qwen3.8-27B-opencode-F16.gguf` (verificado con una imagen de prueba: cuadrado rojo y círculo azul).
- Decodificación especulativa con la capa MTP integrada.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Agente de código en local con OpenCode: el modelo se conecta a llama-server mediante un proveedor compatible con la API de OpenAI y resuelve tareas como localizar y corregir tests fallidos, aprovechando el ajuste RL específico para este agente.
- Automatización de tareas de terminal: con tool calling bien formado para `bash`, puede ejecutar comandos, inspeccionar ficheros y encadenar pasos en un flujo de agente.
- Revisión y corrección de parches en pipelines de CI/CD: el modelo puede recibir el contexto del fallo de tests y proponer el cambio, con el modo thinking desactivado para reducir el consumo de tokens (según la model card, genera aproximadamente una sexta parte de tokens que el modelo base con thinking al máximo).
- Asistencia en terminal con contexto largo: la ventana de 65.536 tokens permite incluir varios ficheros, trazas de error y el histórico de la sesión en una sola petición.
- Análisis de capturas e imágenes técnicas: el proyector multimodal permite describir o interpretar imágenes junto con instrucciones de texto, útil para tareas de documentación o diagnóstico visual.
- Despliegue en estación de trabajo con Apple Silicon: las builds MLX 6-bit y los GGUF Q4_K_M (16,8 GB) permiten ejecutar el modelo en un MacBook Pro con memoria unificada, con velocidades medidas de 27 a 53 tok/s según cuantización y MTP.
- Prototipado de agentes sin dependencia de la nube: al ser Apache-2.0 y ejecutable con llama.cpp, se puede integrar en entornos con requisitos de privacidad o sin conectividad.

## Benchmarks y rendimiento

Resultados publicados en la model card del adaptador (OpenCode, thinking desactivado):

| Benchmark | Modelo base | Adaptador opencode |
|---|---|---|
| SWE-bench Pro (hard 51) | 35,3% | 51,0% |
| Terminal-Bench 2.1 | 46,4% | 52,4% |

Fidelidad de las cuantizaciones respecto a los pesos BF16 (divergencia KL sobre 12 prompts cortos con formato de chat):

| Fichero | Tamano | Mismo siguiente token que BF16 | Divergencia KL media |
|---|---|---|---|
| Q6_K (recomendado) | 22,4 GB | 98,7% | 0,0197 |
| Q8_0 | 29,0 GB | 99,5% | 0,0002 |
| Q4_K_M | 16,8 GB | 94,2% | 0,0689 |

Velocidad de decodificación medida con llama-server en un MacBook Pro M5 Max (greedy, thinking off, 5 prompts × 256 tokens de GSM8K, MATH-500, HumanEval, MBPP y MT-Bench; con otros servicios en ejecución, por lo que son indicativas):

| Fichero | Sin MTP | Con `--spec-type draft-mtp` | Borradores aceptados |
|---|---|---|---|
| Q4_K_M | 27 tok/s | 53 tok/s (×1,97) | 77% |
| Q6_K | 22 tok/s | 46 tok/s (×2,07) | 73% |
| Q8_0 | 18 tok/s | 43 tok/s (×2,36) | 74% |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM/memoria estimada para inferencia: unos 16,8 GB para Q4_K_M, 22,4 GB para Q6_K y 29,0 GB para Q8_0, más 0,9 GB del proyector multimodal si se usa entrada de imagen.
- GPU recomendadas: no se especifican en la información disponible; por tamaño, Q6_K y Q8_0 requieren GPUs con al menos 24 GB de VRAM (por ejemplo, RTX 4090) y Q4_K_M puede caber en GPUs de 24 GB o, con ajustes, en algunas de 16 GB.
- Cabe en consumer GPU: sí, al menos Q4_K_M en GPUs de gama alta; el fabricante verificó el modelo en un MacBook Pro M5 Max con 128 GB de memoria unificada.
- Opciones de despliegue: llama.cpp (llama-server), con `--jinja`, plantilla de chat y `--spec-type draft-mtp` para MTP; builds MLX 6-bit para Apple Silicon; cliente compatible con la API de OpenAI (por ejemplo, OpenCode mediante `@ai-sdk/openai-compatible`).
- Latencia y throughput: 27-53 tok/s (Q4_K_M), 22-46 tok/s (Q6_K) y 18-43 tok/s (Q8_0) en MacBook Pro M5 Max, según el uso de MTP. No hay datos de throughput en GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-27B-opencode-adapted (este, GGUF) | 27,3B | 65.536 tokens (uso documentado) | SWE-bench Pro 51,0%; Terminal-Bench 2.1 52,4% | Apache-2.0 | GGUF y MLX |
| Qwen3.8-27B (base) | 27,3B | no disponible | SWE-bench Pro 35,3%; Terminal-Bench 2.1 46,4% | Apache-2.0 | safetensors |
| harness-hub/Qwen3.8-27B-opencode-adapted (adaptador) | 27,3B | no disponible | mismos resultados que este modelo | Apache-2.0 | safetensors (LoRA) |

No se dispone de datos de otros modelos comparables de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- El adaptador se entrenó y evaluó con thinking desactivado; la model card recomienda mantenerlo apagado, por lo que el uso con thinking puede no reflejar el comportamiento validado.
- Las velocidades publicadas se midieron en un MacBook Pro M5 Max con otros servicios en ejecución y son indicativas, no garantizadas.
- La cuantización Q4_K_M presenta una divergencia KL de 0,0689 y solo un 94,2% de coincidencia en el siguiente token con BF16; para máxima fidelidad se recomienda Q6_K o Q8_0.
- No se detallan los idiomas soportados ni la composición del dataset de entrenamiento en la información disponible.
- Riesgo de alucinación y sesgos: no documentados en la información proporcionada.
- Licencia Apache-2.0, que permite uso comercial; el fichero NOTICE acredita a harness-hub y al Qwen Team (Alibaba Cloud). El publicador (NetProjects) no está afiliado a Hugging Face, harness-hub ni Alibaba.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación comunitaria adicional.
- El contexto de 65.536 tokens es el valor empleado en el ejemplo de llama-server; no se especifica el máximo oficial del modelo.

## Enlaces

- Hugging Face: https://huggingface.co/netprojects/Qwen3.8-27B-opencode-adapted-GGUF
- Modelo base del adaptador: https://huggingface.co/harness-hub/Qwen3.8-27B-opencode-adapted
- Modelo base original: https://huggingface.co/Qwen/Qwen3.8-27B
- Build MLX 6-bit: https://huggingface.co/netprojects/Qwen3.8-27B-opencode-adapted-MLX-6bit
- OpenCode: https://opencode.ai
- Más builds de NetProjects: https://huggingface.co/netprojects
- NetProjects: https://netprojects.com
