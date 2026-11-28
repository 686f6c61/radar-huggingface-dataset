# 3hs4n/Ternary-Bonsai-2.5-27B-Uncensored-heretic-v2.1-mlx-2bit-compact

## Resumen

Ternary-Bonsai-2.5-27B-Uncensored-heretic-v2.1-mlx-2bit-compact es un checkpoint multimodal de inferencia para Apple Silicon, derivado del modelo base prism-ml/Ternary-Bonsai-2.5-27B-mlx-2bit de Prism ML. El autor, 3hs4n, aplica un ajuste Heretic v2.1.0 (técnica de ablación de rechazos que reduce el comportamiento de negativa del modelo) sobre los pesos ternarios de 2 bits del modelo original, manteniendo el mismo tamaño de fichero de pesos que su predecesor Bonsai 2 Heretic v2 Compact. El paquete incluye plantilla de chat, cargador con soporte de visión y un conjunto de comprobaciones reproducibles.

El modelo cuenta con 27 359 638 768 parámetros totales almacenados en formato ternario de 2 bits, lo que se traduce en aproximadamente 8,41 GB de pesos principales y un repositorio de 8,7 GB. Está empaquetado en formato MLX con cuantización Hadamard rotada (identificador de arquitectura `prism_hadamard_qwen35`), pensado para ejecutarse en Macs con Apple Silicon mediante la librería `mlx-vlm`. La pipeline declarada es `image-text-to-text`, e incluye capacidades de texto, visión, razonamiento con modo thinking y tool calling.

Su relevancia actual radica en que permite ejecutar un modelo de escala 27B con capacidades multimodales en hardware de consumo Apple, a costa de una cuantización extremadamente agresiva (2 bits ternarios) y de una pérdida de calidad que el autor no documenta con benchmarks. La licencia Apache 2.0 facilita su uso comercial, aunque la naturaleza del ajuste "uncensored/heretic" introduce consideraciones de seguridad relevantes para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal con cuantización ternaria Hadamard rotada (identificador `prism_hadamard_qwen35`), derivada de la familia Qwen3.8; incluye torre de visión en precisión mixta |
| Parametros totales | 27 359 638 768 |
| Parametros activos | no disponible (no se declara arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 2 bits ternario (empaquetado MLX); el modelo base publica además una variante GGUF oficial |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors en formato MLX (librería `mlx`, runtime `mlx-vlm`) |

## Arquitectura y entrenamiento

El modelo parte de Ternary-Bonsai-2.5-27B de Prism ML, un checkpoint de 27B con pesos ternarios de 2 bits empaquetados mediante una rotación de Hadamard, técnica que redistribuye la energía de los pesos para reducir el error de cuantización en regímenes de muy baja precisión. La arquitectura subyacente se identifica como `prism_hadamard_qwen35`, lo que sugiere una base de la familia Qwen3.8-27B (el autor enlaza explícitamente `Qwen/Qwen3.8-27B` como checkpoint upstream compatible para fine-tuning), con una torre de visión en precisión mixta que habilita la pipeline `image-text-to-text`.

Sobre esa base, el autor aplica un ajuste Heretic v2.1.0, una técnica de ablación direccional que modifica los pesos para eliminar la dirección de rechazo aprendida durante el alineamiento, reduciendo la tasa de negativas del modelo. No se documentan en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si hubo RLHF o DPO adicionales. El paquete se distribuye como checkpoint de inferencia: el autor advierte que no está pensado para entrenamiento directo con Unsloth o LoRA, ya que los adaptadores entrenados sobre el checkpoint Qwen upstream requerirían un "bake" y validación separados para trasladarse a los pesos ternarios.

## Capacidades

- Generación de texto conversacional multi-turno con plantilla de chat incluida.
- Razonamiento en modo thinking, activable con `--enable-thinking` en la CLI de MLX o con `enable_thinking` en la API.
- Comprensión de imágenes (image-text-to-text): el paquete incluye un fixture de prueba con un gráfico de barras y un cargador con soporte de visión.
- Tool calling / function calling: la API acepta un esquema `tools` y devuelve resultados de herramientas en la conversación; la ejecución de la herramienta ocurre en el cliente.
- Capacidades de agente y razonamiento multi-paso, derivadas del modo thinking y del soporte de herramientas.
- Servidor local con endpoint compatible con OpenAI (`/v1/models`, `image_url` como parte de contenido), integrable en clientes como Open WebUI o Unsloth Studio Data Recipes.
- Comportamiento "uncensored" por el ajuste Heretic: menor tasa de rechazos ante peticiones que el modelo base rechazaría.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Asistente conversacional local en Mac Apple Silicon: el modelo cabe en 8,41 GB de pesos y se ejecuta con `mlx-vlm`, permitiendo un chatbot privado sin conexión a servicios externos, con historial de chat corto y una imagen por turno como recomienda el autor.
- Análisis de imágenes y documentos visuales: la pipeline image-text-to-text permite extraer información de gráficos, capturas o diagramas; el fixture incluido (gráfico de barras con respuesta esperada "B") sirve como prueba de humo reproducible.
- Automatización de flujos con herramientas: gracias al tool calling y al endpoint compatible con OpenAI, puede integrarse en pipelines que requieran consultar APIs externas, con la ejecución de herramientas delegada al cliente.
- Prototipado de agentes multi-paso: el modo thinking permite cadenas de razonamiento antes de actuar, útil para tareas de planificación en entornos de desarrollo o investigación.
- Integración en Unsloth Studio Data Recipes: el autor documenta el uso del servidor MLX como proveedor de modelo para generar o previsualizar datasets, lo que facilita la creación de datos sintéticos con un modelo local.
- Despliegue en Open WebUI u otros clientes OpenAI-compatibles: el servidor local expone `/v1` sin autenticación en loopback, adecuado para entornos de desarrollo y pruebas internas.
- Experimentación con cuantización extrema: investigadores interesados en evaluar el impacto de pesos ternarios de 2 bits en tareas multimodales pueden usar este checkpoint como referencia práctica frente al modelo base sin ajuste Heretic.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card incluye una sección "What we measured" con comprobaciones de humo (por ejemplo, la respuesta de texto a una pregunta simple y el fixture visual), pero los resultados completos no están incluidos en la información proporcionada.

## Requisitos de hardware

- VRAM/ memoria unificada estimada: los pesos principales ocupan 8,41 GB en disco; en ejecución hay que sumar la caché de prompt y el procesamiento de imagen, por lo que se recomienda un Mac con al menos 16 GB de memoria unificada, y 24-32 GB para contextos largos o imágenes de alta resolución.
- GPU recomendadas: Apple Silicon exclusivamente (M1, M2, M3, M4 y variantes Pro/Max/Ultra). No hay soporte CUDA ni GGUF en este repositorio; el autor remite a checkpoints separados para esas pilas.
- ¿Cabe en GPU de consumo? Sí, en Macs de consumo con memoria unificada suficiente; no aplica a GPUs NVIDIA/AMD de consumo porque el formato es MLX.
- Opciones de despliegue: `mlx-vlm` 0.7.2 (CLI `mlx_vlm.generate` y servidor `mlx_vlm.server`), Python 3.11, `huggingface-hub==1.33.0`. El autor advierte que las importaciones directas en LM Studio y Unsloth no están verificadas para esta versión.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Ternary-Bonsai-2.5-27B-Uncensored-heretic-v2.1-mlx-2bit-compact | 27,36B | no disponible | MLX 2-bit ternario | Apache 2.0 | Ajuste Heretic, multimodal, solo Apple Silicon |
| prism-ml/Ternary-Bonsai-2.5-27B-mlx-2bit (base) | 27,36B | no disponible | MLX 2-bit ternario | Apache 2.0 (según este repo) | Sin ajuste Heretic; comportamiento alineado original |
| 3hs4n/Ternary-Bonsai-2-27B-Uncensored-Heretic-v2-mlx-2bit-compact (predecesor) | no disponible | no disponible | MLX 2-bit | Apache 2.0 | Mismo tamaño de pesos; generación anterior de Heretic |
| Qwen/Qwen3.8-27B (upstream) | ~27B | no disponible | Transformers (safetensors) | no disponible en la información | Checkpoint de referencia para fine-tuning; no ejecutable directamente en MLX 2-bit |

## Limitaciones y advertencias

- La cuantización ternaria de 2 bits implica una degradación de calidad frente al modelo de 27B en precisión completa; no se documentan métricas que cuantifiquen esa pérdida.
- El ajuste Heretic elimina la dirección de rechazo del alineamiento: el modelo puede responder a peticiones que el modelo base declinaría, lo que exige filtros de seguridad externos en producción.
- Riesgo de alucinación inherente a modelos de lenguaje; no se documentan evaluaciones de factualidad.
- Longitud de contexto e idiomas soportados no declarados: no se puede garantizar el comportamiento en contextos largos o en castellano sin pruebas propias.
- Compatibilidad limitada a Apple Silicon y a la librería `mlx-vlm`; el autor indica que las importaciones en LM Studio y Unsloth no están verificadas.
- No apto para entrenamiento directo: los adaptadores LoRA/QLoRA entrenados sobre el checkpoint Qwen upstream no son trasladables sin un proceso de "bake" y validación adicional.
- Aunque la licencia es Apache 2.0, el uso comercial debe evaluar el riesgo reputacional y legal del comportamiento "uncensored".
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que sugiere una validación comunitaria muy limitada.

## Enlaces

- Hugging Face: https://huggingface.co/3hs4n/Ternary-Bonsai-2.5-27B-Uncensored-heretic-v2.1-mlx-2bit-compact
- Modelo base (Prism ML): https://huggingface.co/prism-ml/Ternary-Bonsai-2.5-27B-mlx-2bit
- GGUF oficial de Prism ML: https://huggingface.co/prism-ml/Ternary-Bonsai-2.5-27B-GGUF
- Predecesor v2 Compact: https://huggingface.co/3hs4n/Ternary-Bonsai-2-27B-Uncensored-Heretic-v2-mlx-2bit-compact
- Heretic v2.1.0 (release): https://github.com/p-e-w/heretic/releases/tag/v2.1.0
- mlx-vlm 0.7.2 (PyPI): https://pypi.org/project/mlx-vlm/0.7.2/
- Qwen3.8-27B (upstream): https://huggingface.co/Qwen/Qwen3.8-27B
- Unsloth Data Recipes: https://unsloth.ai/docs/new/studio/data-recipe
- Unsloth fine-tuning guide: https://unsloth.ai/docs/get-started/fine-tuning-llms-guide
- Unsloth Qwen3.8-27B: https://unsloth.ai/models/qwen3.8-27b
