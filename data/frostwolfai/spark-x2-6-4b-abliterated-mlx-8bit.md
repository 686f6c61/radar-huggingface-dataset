# FrostWolfAI/Spark-X2.6-4B-abliterated-MLX-8bit

## Resumen

Spark-X2.6-4B-abliterated-MLX-8bit es una conversión nativa para Apple Silicon (MLX) en cuantización de 8 bits del modelo FrostWolfAI/Spark-X2.6-4B-abliterated, a su vez una variante "abliterated" (decensored) del modelo post-entrenado XHToken/Spark-X2.6-4B. El autor de la conversión y del proceso de abliteración es Vatsal Bajpai (FrostWolfAI). El modelo resuelve el problema de ejecutar localmente en Macs con memoria unificada un modelo de 4.112 millones de parámetros con contexto de un millón de tokens, manteniendo capacidades de razonamiento controlable y tool calling.

La arquitectura interna se denomina `spark2_5`: 36 capas con atención híbrida (27 capas de ventana deslizante de 512 tokens y 9 capas de atención global, en proporción 3:1), 16 cabezas de atención y 4 cabezas KV, dimensión de cabeza 256, QKV fusionado y puerta de salida sigmoide por cabeza. El vocabulario es de 131.072 tokens y la longitud de contexto declarada alcanza 1.048.576 tokens. El modelo base sobre el que se aplicó la abliteración es de la familia Spark de XHToken, y la licencia heredada es Apache-2.0.

La relevancia actual radica en dos factores: por un lado, la abliteración con Arbitrary-Rank Ablation (ARA) mediante Heretic v2 reduce los rechazos de 100/100 a 2/100 con una divergencia KL de 0.0177, sin alterar arquitectura, contexto ni formato de tool calling; por otro, la conversión MLX 8-bit (8.503 bits/peso, 4.37 GB en disco) permite cargar el modelo en un Mac con `mlx-lm` sin código personalizado ni `trust_remote_code`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `spark2_5`: transformer con atención híbrida (27 capas sliding-window de 512 + 9 capas globales, 3:1), 36 capas, 16 cabezas / 4 KV heads, head dim 256, QKV fusionado, puerta sigmoide por cabeza, MLP GELU, embeddings atados |
| Parametros totales | 4.112.079.360 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 1.048.576 tokens (ventana deslizante de 512 en capas locales; caché KV rotatoria) |
| Tipos de cuantizacion | 8-bit affine, group size 64 (8.503 bits/peso); `g_proj` y normas en BF16. Existe versión 4-bit MLX (2.32 GB) y versiones GGUF en repo aparte |
| Idiomas soportados | en, zh |
| Licencia | Apache-2.0 (heredada de XHToken/Spark-X2.6-4B) |
| Formato de pesos | MLX safetensors (`model_type: spark2_5`), 4.37 GB en disco |

| Parametro adicional | Valor |
|---|---|
| Hidden / intermediate | 2560 / 10240 |
| Vocabulario | 131.072 tokens |
| Modelo base | FrostWolfAI/Spark-X2.6-4B-abliterated (BF16) |
| Libreria | mlx-lm >= 0.32 |
| Requisitos | Apple silicon, macOS 13.5+ |
| Descargas / likes | 361 / 0 |

## Arquitectura y entrenamiento

La arquitectura `spark2_5` es un transformer decoder-only con atención híbrida: de las 36 capas, 27 emplean atención de ventana deslizante de 512 tokens y 9 emplean atención global, en una proporción 3:1. Las capas deslizantes usan una caché KV rotatoria de 512 tokens, de modo que en contextos largos la memoria solo crece con las 9 capas globales. Cada capa tiene 16 cabezas de atención y 4 cabezas KV con dimensión de cabeza 256, QKV fusionado y una puerta de salida sigmoide por cabeza. El MLP usa activación GELU con dimensión intermedia 10240 sobre un hidden de 2560, y los embeddings están atados. El vocabulario es de 131.072 tokens y el contexto máximo declarado es de 1.048.576 tokens.

El modelo original XHToken/Spark-X2.6-4B es un modelo post-entrenado; la información disponible no detalla el número de tokens de entrenamiento, la composición del dataset ni si se aplicó RLHF o DPO. Sobre esa base, FrostWolfAI aplicó abliteración con Heretic v2 usando Arbitrary-Rank Ablation (ARA), una técnica que elimina direcciones de rechazo en el espacio de activaciones. El resultado declarado es una reducción de rechazos de 100/100 a 2/100 con divergencia KL de 0.0177 respecto al modelo base, preservando arquitectura, contexto de 1M tokens, pensamiento controlable y el formato `<tool_call>`. La conversión MLX 8-bit es una cuantización affine de grupo 64 que mantiene las puertas `g_proj` y las normas en BF16.

## Capacidades

- Generación de texto conversacional y razonamiento con modo de pensamiento controlable: emite un bloque `<think>...</think>` antes de la respuesta por defecto.
- Control del razonamiento por petición: `enable_thinking=False` para respuesta directa; `reasoning_effort="low"` o `"high"` (por defecto) para ajustar el presupuesto de razonamiento.
- Tool calling / function calling con formato `<tool_call>name<arg_key>k</arg_key><arg_value>v</arg_value></tool_call>`; los argumentos se pasan como diccionario, no como cadena JSON.
- Capacidades agentic y de razonamiento multi-paso (etiquetas `agentic`, `tool-calling`, `reasoning` del repo).
- Multilingüe limitado a inglés y chino.
- Contexto largo de hasta 1.048.576 tokens, con memoria que crece solo por las capas globales gracias a la caché KV rotatoria de las capas deslizantes.
- Sin censura por diseño: la abliteración suprime las direcciones de rechazo del modelo base.

## Casos de uso

- Asistente local en Mac para desarrollo: el modelo se carga con `mlx-lm` en un Mac con memoria unificada y sirve como asistente de código y explicaciones técnicas sin conexión a la nube, gracias a los 4.37 GB en disco y ~4.6 GB de pico de memoria.
- Servidor OpenAI-compatible en local: `mlx_lm.server` expone el modelo en el puerto 8080 con API compatible con OpenAI, lo que permite integrarlo en herramientas existentes que ya consumen esa interfaz.
- Agentes con tool calling: el formato `<tool_call>` estructurado permite construir agentes que invocan funciones externas (APIs, scripts, consultas) y encadenan varios pasos de razonamiento.
- Procesamiento de documentos largos: el contexto de 1M tokens permite analizar repositorios, expedientes o transcripciones extensas en una sola pasada, con coste de memoria acotado por el diseño de caché KV rotatoria.
- Prototipado de pipelines de razonamiento: el control de `reasoning_effort` y `enable_thinking` permite comparar respuestas directas frente a respuestas con cadena de pensamiento para evaluar latencia y calidad en una misma máquina.
- Investigación sobre alineación y abliteración: el modelo sirve como caso de estudio reproducible (parámetros de abliteración y bundle de reproducción publicados) para medir el efecto de ARA sobre rechazos y divergencia KL.
- Generación de texto en inglés y chino: útil para aplicaciones bilingües en esos dos idiomas, no así para castellano.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la información disponible. Los únicos datos de rendimiento publicados son medidas de inferencia en Apple M3 (8 núcleos, 16 GB de memoria unificada) con `mlx-lm` 0.32.2:

| Metrica | Valor |
|---|---|
| Procesamiento de prompt | ~120 tok/s |
| Generación | ~8 tok/s |
| Memoria pico | ~4.6 GB |
| Rechazos (abliteración) | 2/100 (frente a 100/100 del base) |
| Divergencia KL vs. base | 0.0177 |

## Requisitos de hardware

- VRAM/memoria unificada estimada: ~4.6 GB de pico en la configuración 8-bit medida; el repo ocupa 4.37 GB en disco.
- Plataforma: exclusivamente Apple silicon (MLX); requiere macOS 13.5+ y `mlx-lm >= 0.32`.
- GPU dedicadas (A100, H100, RTX 4090): no aplica; MLX no ejecuta en CUDA. Para esas GPUs habría que usar la variante GGUF o los pesos BF16 con otro runtime.
- Cabe en Macs consumer con memoria unificada de 16 GB o superior; la versión 4-bit (2.32 GB) está pensada para máquinas de 16 GB o cuando prima la velocidad.
- Despliegue: `mlx-lm` (Python y CLI `mlx_lm.generate`), `mlx_lm.server` (API OpenAI-compatible en :8080) y LM Studio con motor MLX. Para llama.cpp, Ollama o LM Studio vía GGUF debe usarse el repo `Spark-X2.6-4B-abliterated-GGUF`, ya que MLX no carga GGUF.
- Throughput medido en M3: ~120 tok/s de procesamiento de prompt y ~8 tok/s de generación; no hay datos de latencia para otros chips.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Formato / runtime |
|---|---|---|---|---|---|
| Spark-X2.6-4B-abliterated-MLX-8bit (este) | 4.112 M | 1.048.576 | 8-bit MLX (8.503 bits/peso) | Apache-2.0 | MLX safetensors, Apple silicon |
| Spark-X2.6-4B-abliterated-MLX (4-bit) | 4.112 M | 1.048.576 | 4-bit MLX (2.32 GB) | Apache-2.0 | MLX safetensors, Apple silicon |
| Spark-X2.6-4B-abliterated (BF16) | 4.112 M | 1.048.576 | BF16 | Apache-2.0 | safetensors |
| XHToken/Spark-X2.6-4B (base post-entrenado) | 4.112 M | 1.048.576 | BF16 | Apache-2.0 | safetensors |

No se dispone de datos de benchmarks que permitan comparar rendimiento cualitativo con modelos de otros autores; la comparativa se limita a las variantes del mismo modelo publicadas por el autor.

## Limitaciones y advertencias

- La abliteración suprime deliberadamente los rechazos: el modelo cumplirá peticiones que el base rechazaría, incluidas algunas que no debería. No hay filtrado de seguridad adicional.
- No debe exponerse tras un endpoint público sin moderación para terceros, según advierte el propio autor.
- La abliteración elimina direcciones de rechazo, pero no añade capacidad ni criterio; el riesgo de alucinación es el del modelo base, no cuantificado en la información disponible.
- Idiomas soportados solo inglés y chino; no hay garantía de calidad en castellano.
- Con el pensamiento activado por defecto, es necesario asignar un `max_tokens` generoso o las respuestas se truncarán a mitad del razonamiento.
- Restricción de plataforma: solo Apple silicon; no ejecutable en CUDA ni en GPUs dedicadas con este repo.
- El contexto de 1M tokens es una capacidad declarada; no se han publicado evaluaciones de degradación a longitudes extremas.
- Licencia Apache-2.0 permite uso comercial, pero la ausencia de filtrado de seguridad traslada al desplegador la responsabilidad sobre el contenido generado.
- Los parámetros de muestreo recomendados son `temperature=1.0`, `top_p=0.95`, `top_k=0` (desactivado).

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/FrostWolfAI/Spark-X2.6-4B-abliterated-MLX-8bit
- Modelo base abliterated (BF16): https://huggingface.co/FrostWolfAI/Spark-X2.6-4B-abliterated
- Variante GGUF: https://huggingface.co/FrostWolfAI/Spark-X2.6-4B-abliterated-GGUF
- Variante MLX 4-bit: https://huggingface.co/FrostWolfAI/Spark-X2.6-4B-abliterated-MLX
- Modelo post-entrenado original: https://huggingface.co/XHToken/Spark-X2.6-4B
- MLX: https://github.com/ml-explore/mlx
- Heretic (herramienta de abliteración): https://github.com/p-e-w/heretic
- Apoyo al autor: https://buymeacoffee.com/vatsalbajpai
