# prism-ml/Ternary-Bonsai-2.5-27B-mlx-2bit

## Resumen

Ternary Bonsai 2.5 27B es un empaquetado para Apple Silicon del modelo Bonsai 2.5 27B, una variante del Qwen/Qwen3.8-27B afinada por prism-ml y cuantizada a 2 bits con agrupación de 128 pesos (group-128) mediante transformadas de Hadamard firmadas. El paquete combina el modelo de lenguaje ternario con una torre de visión en FP16, por lo que acepta entradas de texto e imagen y se expone como pipeline `image-text-to-text`. Incluye además una cabeza MTP (multi-token prediction) opcional de tipo draft para decodificación especulativa.

El modelo resuelve el problema de ejecutar un modelo multimodal de 27.359.638.768 parámetros en hardware de consumo de Apple, reduciendo el repositorio a 8,9 GB gracias a la cuantización ternaria. La librería de referencia es MLX, lo que lo hace dependiente del ecosistema de Apple Silicon y del cargador incluido en el propio repositorio, que aplica las transformadas Hadamard necesarias para interpretar los pesos.

Es relevante ahora porque demuestra la viabilidad de empaquetar modelos multimodales de escala 27B en cuantizaciones extremas (2 bits) manteniendo una torre visual sin cuantizar, y porque incorpora decodificación especulativa mediante una cabeza MTP compartida con el modelo objetivo. La licencia Apache 2.0 y la existencia de un paquete GGUF complementario amplían su aplicabilidad fuera del ecosistema MLX.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (modelo de lenguaje + torre de visión FP16); base Qwen/Qwen3.8-27B con afinado Bonsai 2.5 |
| Parametros totales | 27.359.638.768 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 2 bits ternario con group-128 en el modelo de lenguaje; torre de visión en FP16; paquete GGUF complementario disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX); GGUF en el paquete complementario |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.8-27B, un transformer multimodal con torre de visión, y se ha afinado como Bonsai 2.5. La innovación principal del empaquetado es la cuantización ternaria a 2 bits con grupos de 128 pesos, aplicada mediante transformadas de Hadamard firmadas que el cargador incluido en `runtime/` debe aplicar para reconstruir los pesos. La torre de visión se mantiene en FP16, de modo que la pérdida de precisión se concentra en el modelo de lenguaje. Los pesos del lenguaje coinciden byte a byte con el paquete MLX validado de Bonsai 2.5 solo texto, una vez contabilizado el espacio de nombres de los tensores multimodales.

El paquete incorpora una cabeza MTP v2 opcional que comparte la proyección de embedding y de salida del modelo objetivo, y que se usa como modelo draft en decodificación especulativa con `draft_block_size=2`. El manifiesto `mtp/head-manifest.json` registra la revisión del GGUF de origen y el SHA-256 del sidecar como registro de verificación. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO.

## Capacidades

- Generación de texto conversacional en formato chat mediante plantilla de chat (`apply_chat_template`).
- Comprensión de imágenes: descripción y respuesta a preguntas sobre una imagen de entrada, con soporte de prompts multimodales.
- Razonamiento aritmético básico verificado en la validación del autor (prueba de aritmética de texto).
- Distinción de contenido visual por color, verificada en la validación (imágenes rojas y azules).
- Modo thinking configurable mediante el parámetro `enable_thinking` de la plantilla de chat.
- Decodificación especulativa opcional con cabeza MTP draft.
- No se documenta soporte de tool calling, function calling ni razonamiento multi-paso con agentes en la información disponible.
- Capacidades multilingües: no disponibles.

## Casos de uso

- Inferencia local multimodal en Mac Apple Silicon: el paquete está diseñado para ejecutarse con MLX en un Mac con Python 3, permitiendo describir imágenes o responder preguntas sobre ellas sin conexión a servicios externos, con un peso de repositorio de 8,9 GB.
- Asistente de escritorio con entrada de imagen: integración en aplicaciones de escritorio nativas de macOS que necesiten responder preguntas sobre capturas de pantalla o fotografías, usando la plantilla de chat y `mlx_vlm.generate`.
- Prototipado de investigación en cuantización extrema: el paquete sirve como referencia reproducible para estudiar el impacto de la cuantización ternaria a 2 bits con group-128 y transformadas Hadamard en un modelo de 27B.
- Evaluación de decodificación especulativa: la cabeza MTP v2 permite medir la preservación de tokens greedy y experimentar con `draft_block_size` en hardware de Apple, aunque el throughput aún no está medido por el autor.
- Despliegue en entornos con restricciones de memoria: al reducir el modelo a 8,9 GB, encaja en Mac con memoria unificada moderada donde un modelo de 27B en FP16 no cabría.
- Pipeline de visión conversacional por lotes: uso de `image-text-to-text` para clasificar o describir conjuntos de imágenes con temperatura 0 para resultados deterministas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor únicamente reporta validación cualitativa: coincidencia byte a byte con el paquete de texto validado, superación de una prueba de aritmética de texto y distinción correcta de imágenes rojas y azules. El throughput de la decodificación especulativa con MTP no ha sido medido según la model card.

## Requisitos de hardware

- VRAM/memoria unificada estimada: el repositorio ocupa 8,9 GB; se requiere memoria unificada suficiente para cargar el modelo, la torre de visión en FP16 y el estado de inferencia, además de la cabeza MTP opcional.
- Hardware objetivo: Apple Silicon (Mac con Python 3). No se documenta soporte para GPU NVIDIA ni CUDA.
- GPU de consumo: no aplica en el sentido habitual; el paquete está pensado para memoria unificada de Apple, no para GPUs discretas.
- Opciones de despliegue: MLX con `mlx_vlm` y el cargador incluido en `runtime/`; paquete GGUF complementario para llama.cpp y otros empaquetados.
- Latencia y throughput: no disponibles; el autor indica explícitamente que el throughput de MTP aún no se ha medido.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ternary-Bonsai-2.5-27B-mlx-2bit | 27.359.638.768 | no disponible | 2 bits ternario + visión FP16 | Apache 2.0 | MLX (Apple Silicon) |
| Ternary-Bonsai-2.5-27B-GGUF | no disponible | no disponible | GGUF | Apache 2.0 | llama.cpp y otros |
| Qwen/Qwen3.8-27B (base) | no disponible | no disponible | pesos originales | no disponible en la información | Hugging Face |

No se dispone de datos de benchmarks ni de especificaciones del modelo base en la información proporcionada, por lo que no es posible una comparación cuantitativa de rendimiento.

## Limitaciones y advertencias

- Dependencia de hardware: el paquete MLX está diseñado exclusivamente para Apple Silicon; no se documenta funcionamiento en CUDA ni en CPU convencional.
- Dependencia del cargador: los pesos requieren las transformadas Hadamard firmadas que aplica el cargador incluido; usar otro cargador sin ese paso produciría resultados incorrectos.
- Cuantización extrema: la cuantización ternaria a 2 bits con group-128 puede degradar la calidad respecto al modelo base; no se publican evaluaciones cuantitativas que lo midan.
- Contexto e idiomas no documentados: se desconoce la longitud de contexto efectiva y los idiomas soportados, lo que impide garantizar su comportamiento en producción multilingüe o con contextos largos.
- Riesgo de alucinación: no se documentan evaluaciones de fidelidad ni de tasas de alucinación.
- Throughput no medido: el rendimiento de la decodificación especulativa con MTP no ha sido cuantificado por el autor, solo verificado en preservación de tokens greedy.
- Sesgos: no se documentan sesgos conocidos en la información disponible.
- Licencia: Apache 2.0 permite uso comercial, pero debe revisarse `NOTICE.txt` para la atribución de componentes upstream y `runtime/LICENSE` para el cargador incluido.
- Madurez: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que sugiere escasa validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/prism-ml/Ternary-Bonsai-2.5-27B-mlx-2bit
- Paquete GGUF complementario: https://huggingface.co/prism-ml/Ternary-Bonsai-2.5-27B-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
