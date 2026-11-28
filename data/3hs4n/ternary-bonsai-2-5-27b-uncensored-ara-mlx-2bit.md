# 3hs4n/Ternary-Bonsai-2.5-27B-Uncensored-ARA-mlx-2bit

## Resumen

Ternary-Bonsai-2.5-27B-Uncensored-ARA-mlx-2bit es un checkpoint multimodal de inferencia empaquetado en formato MLX, derivado del modelo base prism-ml/Ternary-Bonsai-2.5-27B-mlx-2bit de Prism ML, que a su vez desciende de la línea Qwen3.8-27B de Alibaba Cloud. El autor del repositorio, 3hs4n, aplica una edición de los pesos del decodificador de lenguaje mediante Arbitrary-Rank Ablation (ARA), una técnica de edición de modelos atribuida a Philipp Emanuel Weidmann, manteniendo intacta la torre de visión en FP16 y el cargador Hadamard del modelo original. El resultado es un checkpoint de 27.359.638.768 parámetros totales con un peso en disco de 8,60 GB de pesos principales (8.595.477.990 bytes, 8,00 GiB), más un sidecar MTP opcional de unos 266 MB.

El modelo resuelve el problema de ejecutar un modelo multimodal de 27B en hardware Apple Silicon con un presupuesto de memoria contenido, gracias a la cuantización ternaria/2-bit de las matrices del decodificador de lenguaje y a la implementación nativa de MLX. Conserva capacidades de texto, imagen, razonamiento acotado (thinking) y tool calling, y expone una API compatible con OpenAI a través de `mlx_vlm.server`. Está pensado para flujos locales de inferencia en Mac con chip de la serie M, no para entrenamiento ni para despliegue en GPU de datacenter.

La relevancia actual del checkpoint es doble: por un lado, demuestra que la edición de pesos ARA puede aplicarse sobre un modelo ternario ya cuantizado sin destruir la torre de visión ni el comportamiento conversacional; por otro, el autor publica evidencia de validación concreta (20/20 fixtures sintéticos y una divergencia KL de primer token de 0,01074 nats de media frente al base oficial en 100 prompts). La licencia es Apache 2.0 y el pipeline declarado es image-text-to-text.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (decodificador de lenguaje con cuantización ternaria/2-bit + torre de visión FP16), linaje Qwen3.8-27B; implementación MLX con cargador Hadamard (`prism_hadamard_qwen35`) |
| Parámetros totales | 27.359.638.768 |
| Parámetros activos | no disponible (no se declara arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | 2-bit ternaria en las matrices del decodificador de lenguaje; torre de visión en FP16; incluye cabecera MTP opcional |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors empaquetados para MLX (`mlx`, `mlx-vlm`); no incluye GGUF en este repo |

## Arquitectura y entrenamiento

El checkpoint es una edición de inferencia, no un entrenamiento desde cero. Se construye a partir de la revisión `aa432fd0e17612f6684e728d4d3c42b6656bcabb` del release MLX de Prism ML. Según la model card, solo difieren los códigos empaquetados de 126 matrices writer del decodificador de lenguaje; la auditoría de tensores confirma que las 333 tensores de visión coinciden byte a byte con el base y verifica de forma independiente el conjunto de tensores editados. La técnica aplicada es Arbitrary-Rank Ablation (ARA), implementada de forma nativa para MLX, que modifica los pesos del decodificador sin tocar la torre de visión FP16, el cargador Hadamard ni la plantilla de chat.

El modelo hereda la arquitectura del linaje Qwen3.8-27B, con un decodificador de lenguaje cuantizado de forma ternaria/2-bit y una torre de visión en FP16 que procesa imágenes en el mismo pipeline image-text-to-text. La cuantización ternaria reduce los pesos principales a 8,00 GiB, lo que hace viable la inferencia en memoria unificada de Apple Silicon. La model card menciona una cabecera MTP (multi-token prediction) opcional incluida como sidecar, pero indica que el rendimiento especulativo no se ha medido sobre estos pesos editados. No se documentan en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO; el autor remite a la card de Qwen3.8-27B para el modelo padre.

## Capacidades

- Generación de texto conversacional multturno con plantilla de chat incluida.
- Comprensión de imágenes en pipeline image-text-to-text, con torre de visión FP16 conservada.
- OCR y lectura de contenido visual: la validación incluye fixtures de visión y OCR.
- Razonamiento acotado mediante modo thinking, activable con `--enable-thinking` en la CLI de MLX.
- Tool calling / function calling: la API local acepta un esquema `tools` y permite devolver resultados en la conversación (ida y vuelta verificada).
- Razonamiento multi-paso dentro de los límites del modo thinking acotado.
- Servidor local compatible con OpenAI (`/v1/models`, contenido de texto y `image_url`).
- Capacidades multilingües: no disponibles en la información proporcionada.
- No se declaran capacidades de audio ni de vídeo.

## Casos de uso

- Asistente local multimodal en Mac: ejecutar un chat que alterna texto e imágenes directamente en Apple Silicon con 8,00 GiB de pesos principales, usando `quickstart.py` o la CLI de `mlx_vlm.generate`.
- Análisis de gráficos y capturas: el propio repositorio incluye un fixture de gráfico de barras y demuestra la respuesta correcta a preguntas sobre la imagen; útil para tareas de lectura de dashboards o informes visuales.
- OCR y extracción de texto de imágenes: la validación incluye fixtures de OCR, lo que lo hace adecuado para digitalizar documentos escaneados o capturas en local sin enviar datos a la nube.
- Agente con tool calling en local: montar un servidor `mlx_vlm.server` en `127.0.0.1` y conectar un cliente compatible con OpenAI que pase un esquema `tools` y reciba los resultados en la conversación, por ejemplo para consultar APIs internas o ejecutar acciones controladas.
- Integración en Unsloth Studio Data Recipes: el autor documenta cómo apuntar el proveedor de modelo a `http://127.0.0.1:PORT/v1` y usar el bloque LLM Text para previsualizar filas de un dataset, lo que permite generar datos sintéticos o etiquetados asistidos por el modelo.
- Prototipado de pipelines de razonamiento con thinking: activar el modo thinking para tareas que requieren pasos intermedios acotados, manteniendo temperatura 0 para comprobaciones deterministas.
- Evaluación de ediciones de pesos: servir como referencia práctica para investigadores que quieran medir el impacto de ARA sobre un modelo ternario ya cuantizado, comparando contra el base oficial con la divergencia KL documentada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor sí publica una tabla de verificación acotada:

| Comprobación | Resultado |
|---|---|
| Texto, thinking acotado, tool call e ida y vuelta, visión y OCR | 20/20 fixtures sintéticos dirigidos |
| KL de primer token frente al base oficial | 0,01074 nats de media en 100 prompts |
| Entorno Apple Silicon limpio | Quickstart de texto, CLI del gráfico y peticiones de texto e imagen a la API local superadas |

El propio autor advierte que estas puntuaciones describen comprobaciones dirigidas y que la precisión amplia, el comportamiento en contexto largo y la RAM mínima no se han medido. El rendimiento especulativo de la cabecera MTP opcional tampoco se ha medido sobre estos pesos editados.

## Requisitos de hardware

- VRAM/RAM unificada estimada: los pesos principales ocupan 8,00 GiB en disco (8.595.477.990 bytes); el sidecar MTP opcional añade unos 266 MB. La memoria en tiempo de ejecución debe cubrir además el caché de prompt y el procesamiento de imágenes, por lo que el consumo real supera el tamaño de los pesos.
- Hardware objetivo: Apple Silicon (chips de la serie M) con memoria unificada suficiente; el repositorio está etiquetado `apple-silicon` y usa la librería `mlx`.
- GPU NVIDIA (A100, H100, RTX 4090): no soportadas por este checkpoint MLX; el autor remite a un GGUF oficial separado de Prism ML para otros flujos.
- ¿Cabe en GPU de consumo? No aplica en el sentido habitual: el formato es MLX y el destino es memoria unificada de Mac, no VRAM de GPU dedicada.
- Despliegue: `mlx-vlm` 0.7.2 (CLI `mlx_vlm.generate` y servidor `mlx_vlm.server`), Python 3.11, `huggingface-hub==1.33.0`; el servidor expone una API compatible con OpenAI en `/v1`.
- Latencia y throughput: no disponibles; el autor no publica cifras de tokens por segundo ni de latencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Formato / destino |
|---|---|---|---|---|---|
| Ternary-Bonsai-2.5-27B-Uncensored-ARA-mlx-2bit (este) | 27.359.638.768 | no disponible | Ternaria/2-bit + visión FP16 | Apache 2.0 | MLX / Apple Silicon |
| prism-ml/Ternary-Bonsai-2.5-27B-mlx-2bit (base) | no disponible en la información | no disponible | Ternaria/2-bit + visión FP16 | Apache 2.0 | MLX / Apple Silicon |
| prism-ml/Ternary-Bonsai-2.5-27B-GGUF | no disponible en la información | no disponible | GGUF (cuantización específica no detallada) | Apache 2.0 (según base) | GGUF / runtime GGUF |
| Qwen/Qwen3.8-27B (modelo padre) | 27B (linaje declarado) | no disponible | FP16 y otras no detalladas | no disponible en la información | Transformers |

La comparación relevante es frente al base de Prism ML: este checkpoint solo difiere en 126 matrices writer del decodificador y conserva byte a byte los 333 tensores de visión, con una divergencia KL de primer token de 0,01074 nats. Frente al GGUF oficial, la diferencia es de formato y runtime, no de pesos de referencia. Frente al Qwen3.8-27B original, la diferencia es la cuantización ternaria y la edición ARA.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información disponible; al heredar el linaje Qwen3.8-27B, arrastra los sesgos del modelo padre, que no se detallan.
- Riesgo de alucinación: no cuantificado; el autor solo reporta 20/20 en fixtures sintéticos dirigidos y advierte que la precisión amplia no se ha medido.
- Contexto e idiomas: la longitud de contexto y los idiomas soportados no están disponibles en la información proporcionada; el autor indica que el comportamiento en contexto largo no se ha medido.
- Licencia: Apache 2.0, lo que permite uso comercial, pero deben respetarse el archivo `NOTICE.txt` y las atribuciones a Prism ML, Alibaba Cloud (linaje Qwen) y Philipp Emanuel Weidmann (método ARA).
- Restricción de plataforma: es un checkpoint MLX para Apple Silicon; no es directamente utilizable en vLLM, TGI, llama.cpp ni Ollama, y el autor remite a un GGUF separado para esos flujos.
- Entrenamiento: es un checkpoint de inferencia empaquetado; para LoRA o QLoRA hay que partir de un modelo en formato Transformers soportado por el runtime de Unsloth, no de este repo.
- Importación en apps de escritorio MLX: fuera de la validación del release; hay que comprobar que el runtime instalado soporte visión `prism_hadamard_qwen35`.
- Cabecera MTP: incluida pero sin medición de rendimiento especulativo sobre estos pesos editados.
- Servidor local: la API en loopback no usa autenticación; no debe exponerse fuera de `127.0.0.1` sin protecciones adicionales.
- RAM mínima: no medida; el tamaño de los pesos en disco no equivale al consumo en tiempo de ejecución.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/3hs4n/Ternary-Bonsai-2.5-27B-Uncensored-ARA-mlx-2bit
- Modelo base (Prism ML): https://huggingface.co/prism-ml/Ternary-Bonsai-2.5-27B-mlx-2bit
- GGUF oficial de Prism ML: https://huggingface.co/prism-ml/Ternary-Bonsai-2.5-27B-GGUF
- Modelo padre Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- MLX-VLM 0.7.2 en PyPI: https://pypi.org/project/mlx-vlm/0.7.2/
- Guía de proveedor de Unsloth Data Recipes: https://unsloth.ai/docs/new/studio/data-recipe
- Guía de fine-tuning de Unsloth: https://unsloth.ai/docs/get-started/fine-tuning-llms-guide
- Evidencia de validación (en el repo): `evidence/validation.json`
- Resumen de build (en el repo): `evidence/build.json`
- Sumas de verificación (en el repo): `SHA256SUMS`
- Licencia (en el repo): `LICENSE`
- Avisos legales (en el repo): `NOTICE.txt`
