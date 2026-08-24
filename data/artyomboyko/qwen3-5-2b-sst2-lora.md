# artyomboyko/qwen3.5-2b-sst2-lora

## Resumen

`artyomboyko/qwen3.5-2b-sst2-lora` es un adaptador LoRA de 64,21 MiB que ajusta el modelo base `Qwen/Qwen3.5-2B-Base` (2B parámetros, arquitectura gated delta attention con contexto nativo de 262 144 tokens) sobre el dataset `stanfordnlp/sst2` para clasificación binaria de sentimiento en inglés. El adaptador predice exclusivamente las etiquetas `positive` y `negative` a partir de un prompt de generación de texto.

El modelo resuelve el problema de clasificación de sentimiento sin necesidad de una cabeza de clasificación adicional, usando el mismo pipeline de generación de texto. Su relevancia radica en que demuestra cómo un adaptador de bajo rango (rank 16) puede elevar la precisión de un modelo base de 2B desde un 3,10 % hasta un 94,84 % en el split de validación completo de SST-2, manteniendo la licencia Apache 2.0 y un tamaño mínimo que lo hace viable en entornos con recursos limitados.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre Qwen3.5-2B-Base (gated delta attention, denso, 2B) |
| Parametros totales | 2B (base) + 64,21 MiB (adaptador LoRA) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262 144 tokens (heredada del modelo base) |
| Tipos de cuantizacion | No disponible para el adaptador (el base puede cuantizarse a 4/8 bits) |
| Idiomas soportados | Inglés (entrenado solo en `en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador usa LoRA con rango 16, alpha 32 y dropout 0,05, aplicado a todos los módulos lineales (`all-linear`) del modelo base. El modelo base `Qwen/Qwen3.5-2B-Base` emplea una arquitectura de gated delta attention, una variante de atención lineal eficiente que reduce la complejidad computacional respecto a la atención softmax estándar, y soporta un contexto nativo de 262 144 tokens. El entrenamiento se realizó mediante fine-tuning supervisado estándar sobre el dataset SST-2 (Stanford Sentiment Treebank), que contiene 67 349 oraciones de entrenamiento etiquetadas como positivas o negativas. No se utilizaron técnicas de RLHF ni DPO; el ajuste es exclusivamente de adaptación de tarea.

## Capacidades

- Clasificación binaria de sentimiento: predice `positive` o `negative` a partir de texto en inglés.
- Generación de texto: funciona como un modelo causal de lenguaje, generando la etiqueta como continuación del prompt.
- Prompt format específico: requiere el formato documentado (`Classify the sentiment of this movie review as positive or negative.\nReview: ...\nSentiment:`).
- Soporte de tool calling: no disponible.
- Soporte de agentes y multi-step reasoning: no disponible.
- Capacidades multilingües: no, solo inglés.
- Capacidades especiales: no incluye visión, audio ni modo thinking; el adaptador es exclusivamente para clasificación de sentimiento.

## Casos de uso

- Análisis de reseñas de películas: el modelo puede clasificar automáticamente comentarios de plataformas como IMDb o Letterboxd, facilitando la agregación de puntuaciones de opinión.
- Monitorización de opiniones en redes sociales: procesar tweets, posts de foros o comentarios de YouTube para detectar polaridad positiva o negativa sobre marcas o productos.
- Análisis de comentarios de clientes en e-commerce: clasificar reseñas de productos en tiendas online para priorizar quejas o destacar valoraciones positivas.
- Automatización de encuestas de satisfacción: en lugar de usar escalas numéricas, se puede pedir al usuario un texto libre y clasificarlo automáticamente.
- Filtrado de contenido en plataformas de moderación: detectar mensajes con sentimiento negativo extremo que requieran revisión humana.
- Entrenamiento de clasificadores más grandes: el adaptador puede servir como punto de partida para transferir aprendizaje a otros dominios con pocos datos etiquetados.

## Benchmarks y rendimiento

El README del autor reporta evaluación sobre el split completo de validación de SST-2. No se han publicado comparaciones con otros adaptadores.

| Metrica | Modelo base (sin adaptador) | LoRA |
|---|---|---|
| Generation accuracy | 3,10 % | **94,84 %** |
| Forced-choice accuracy | 51,49 % | **94,95 %** |
| Generation Macro F1 | 0,0573 | **0,9484** |
| Forced-choice Macro F1 | 0,3502 | **0,9495** |
| Perplexity | — | 1,0801 |

Los resultados muestran que el adaptador transforma un modelo base incapaz de generar la etiqueta correcta en formato libre (3,1 % de accuracy) en un clasificador casi perfecto (94,84 %). La accuracy forzada del modelo base (51,49 %) es cercana al azar, lo que indica que la adaptación LoRA es esencial para la tarea.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base en FP16 ocupa aproximadamente 4,5 GB; con cuantización 8-bit baja a ~2,3 GB y con 4-bit a ~1,2 GB. El adaptador LoRA añade ~64 MiB adicionales.
- GPU recomendadas: RTX 3060 8 GB, RTX 4060, GTX 1080 Ti o cualquier GPU con 8 GB de VRAM; también funciona en Apple Silicon (M1/M2/M3) con 8 GB de RAM unificada.
- Compatibilidad con GPUs de consumo: sí, es perfectamente viable en GPUs de gama media e incluso en CPU con cuantización.
- Opciones de despliegue: `transformers` + `peft` (código oficial), `vLLM` con soporte LoRA, `Ollama` si se convierte a GGUF, `llama.cpp` con adaptadores LoRA convertidos.
- Latencia y throughput: no disponible en la información del autor; en una RTX 3060 se espera generación de 4 tokens en menos de 1 segundo con batch pequeño.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Accuracy SST-2 | Licencia |
|---|---|---|---|---|
| Qwen3.5-2B-Base (sin adaptador) | 2B | 262 144 | 3,10 % (gen.) | Apache 2.0 |
| **qwen3.5-2b-sst2-lora** | 2B + 64 MiB | 262 144 | 94,84 % (gen.) | Apache 2.0 |
| Alternativa típica: adaptadores LoRA sobre otros modelos (p. ej. Llama-3.2-1B) | — | — | No disponible | — |

No se dispone de datos públicos de otros adaptadores LoRA para SST-2 sobre modelos de 2B en la información proporcionada. La comparación directa con el modelo base evidencia la efectividad del adaptador.

## Limitaciones y advertencias

- Solo funciona con el modelo base `Qwen/Qwen3.5-2B-Base` y el formato de prompt documentado; cualquier variación degrada la precisión.
- Entrenado exclusivamente en inglés y en el dominio de reseñas de películas (SST-2); puede tener un rendimiento inferior en otros dominios o idiomas.
- El dataset SST-2 presenta sesgos inherentes (reseñas de películas de los años 2000, lenguaje culto); el modelo puede reflejar esos sesgos en textos de otros dominios.
- Riesgo de alucinación: como modelo generativo, puede producir etiquetas inesperadas si el prompt no se ajusta al formato esperado.
- No soporta tool calling, agentes ni razonamiento multi-paso; es una herramienta de clasificación de propósito específico.
- No hay datos publicados de rendimiento en producción (latencia, throughput) más allá de la evaluación académica del autor.

## Enlaces

- [HuggingFace - artyomboyko/qwen3.5-2b-sst2-lora](https://huggingface.co/artyomboyko/qwen3.5-2b-sst2-lora)
- [Modelo base - Qwen/Qwen3.5-2B-Base](https://huggingface.co/Qwen/Qwen3.5-2B-Base)
- [Dataset SST-2](https://huggingface.co/datasets/stanfordnlp/sst2)
- [vLLM Recipes - Qwen3.5-2B](https://recipes.vllm.ai/Qwen/Qwen3.5-2B)
- [Qualcomm AI Hub - Qwen3.5-2B](https://aihub.qualcomm.com/models/qwen3_5_2b)
- [LM Studio - Qwen3.5-2B](https://lmstudio.ai/models/qwen/qwen3.5-2b)
