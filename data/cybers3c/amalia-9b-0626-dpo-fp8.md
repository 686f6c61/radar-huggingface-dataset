# CYBERS3C/AMALIA-9B-0626-DPO-FP8

## Resumen

AMALIA-9B-0626-DPO-FP8 es una cuantización en punto flotante de 8 bits (FP8) del modelo de lenguaje AMALIA-9B-0626-DPO, desarrollado por el equipo de AMALIA para el portugués europeo. Esta versión concreta, publicada por CYBERS3C, está pensada para servirse con vLLM en GPUs de servidor, y es la primera cuantización FP8 de AMALIA disponible en Hugging Face. El objetivo principal es reducir a la mitad el tamaño del modelo y casi duplicar el rendimiento de inferencia sin una pérdida medible de calidad, algo especialmente relevante para un modelo especializado en una variante lingüística minoritaria como el portugués europeo.

La elección de FP8 dinámico (W8A8) frente a formatos de 4 bits responde a que la cuantización dinámica no requiere datos de calibración. Esto evita calibrar el modelo con textos en inglés, que degradaría las capacidades específicas del portugués europeo. Según las mediciones del autor, la degradación global de perplexidad es de solo un 0,94 % respecto al original en BF16, con un aumento del throughput de 12,2 a 22,3 tokens por segundo en una DGX Spark. El modelo base tiene una arquitectura transformer estilo LLaMA con 42 capas, 4096 dimensiones ocultas y atención por grupos de consultas (GQA), con una ventana de contexto de 32 768 tokens.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (estilo LLaMA) con GQA |
| Parametros totales | 9.152.319.488 (9,15 B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 32 768 tokens |
| Tipos de cuantizacion | FP8 dinámico (W8A8), con lm_head en precisión original |
| Idiomas soportados | Portugués europeo (pt-PT) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (compatible con compressed-tensors para vLLM) |

## Arquitectura y entrenamiento

El modelo base AMALIA-9B-0626-DPO es un transformer decoder con 42 capas, tamaño oculto de 4096, 32 cabezas de consulta y 8 cabezas de clave/valor (GQA), con una capa intermedia de 12 288. Su entrenamiento incluyó una fase de preentrenamiento y una fase de alineación mediante DPO (Direct Preference Optimization), que ajusta el modelo para distinguir entre respuestas de mayor y menor calidad a una misma instrucción. El resultado es un modelo conversacional especializado en portugués europeo, con vocabulario y construcciones gramaticales propias de esa variante.

La cuantización FP8 se realizó con la librería `llm-compressor` de vLLM, utilizando el modificador `QuantizationModifier` con esquema `FP8_DYNAMIC`. Este esquema calcula las escalas de pesos por canal y las escalas de activaciones en tiempo de ejecución, lo que elimina la necesidad de un conjunto de calibración. El proceso completo tardó 209 segundos, de los cuales solo 2 corresponden a la cuantización en sí; el resto es lectura y escritura del modelo. Se mantuvo la capa `lm_head` en precisión original para no degradar la generación. También se probó una variante solo de pesos (W8A16), que resultó peor en perplexidad (+2,31 % frente a +0,94 %), debido a que en hardware Blackwell con soporte nativo de FP8, la ruta de cómputo W8A8 con acumulación FP32 es más precisa que reconvertir los pesos a BF16.

## Capacidades

- Generación de texto en portugués europeo, incluyendo registros literario, administrativo, coloquial y técnico.
- Mantiene marcadores léxicos específicos de la variante europea, como *comboio*, *pequeno-almoço*, *casa de banho* y *telemóvel*, y usa la construcción de gerundio europea (*estou a fazer*) en lugar de la brasileña (*estou fazendo*).
- Conversación multi-turno gracias a una ventana de contexto de 32 768 tokens.
- Inferencia eficiente en servidores con vLLM gracias a la cuantización FP8 dinámica, sin necesidad de calibración.
- Compatible con el ecosistema de vLLM y con `compressed-tensors`, lo que facilita su integración en pipelines de producción.
- No se especifican capacidades explícitas de tool calling, agentes o razonamiento multi-paso en la información disponible.

## Casos de uso

- Atención al cliente automatizada en portugués europeo: el modelo puede gestionar conversaciones multi-turno con contexto largo de hasta 32 768 tokens, lo que permite mantener el historial completo de una interacción con un cliente sin perder información relevante.
- Generación de documentación administrativa y legal: su bajo nivel de perplexidad en el registro administrativo (4,81 en FP8) lo hace adecuado para redactar cartas, informes y formularios oficiales en pt-PT, un ámbito con alta demanda de precisión terminológica.
- Asistentes virtuales para servicios públicos portugueses: al estar especializado en la variante europea, puede responder con el vocabulario y las expresiones correctas para usuarios de Portugal, evitando ambigüedades con el portugués brasileño.
- Traducción y localización de contenidos al portugués europeo: aunque no es un modelo de traducción puro, puede adaptar textos escritos en otras variantes del portugués o en otros idiomas a la norma europea, preservando los marcadores léxicos adecuados.
- Análisis de sentimiento y moderación de contenido en redes sociales: su capacidad para comprender el registro coloquial europeo, con términos como *comboio* o *telemóvel*, permite identificar matices que un modelo multilingüe genérico podría pasar por alto.
- Generación de contenido creativo y periodístico: el modelo mantiene una perplexidad aceptable en el registro literario (16,06 en FP8), lo que lo hace útil para redactar artículos, guiones o narrativa en portugués europeo con un estilo natural.
- Integración en sistemas de recuperación aumentada (RAG) para bases de conocimiento en portugués: su ventana de contexto de 32K permite procesar documentos extensos y responder preguntas sobre ellos con precisión lingüística.

## Benchmarks y rendimiento

La model card del autor proporciona mediciones propias de perplexidad sobre 401 tokens de portugués europeo en cuatro registros, comparando el modelo FP8 con el original en BF16. También incluye datos de rendimiento de servicio en una NVIDIA DGX Spark (GB10 Grace-Blackwell, 121 GB de memoria unificada). No se han publicado resultados de benchmarks estándar como MMLU, HumanEval o GSM8K.

| Registro | Perplexidad BF16 | Perplexidad FP8 | Delta |
|---|---|---|---|
| Literario | 15,6962 | 16,0568 | +2,30 % |
| Administrativo | 4,7820 | 4,8075 | +0,53 % |
| Coloquial | 9,8653 | 10,1136 | +2,52 % |
| Técnico | 18,1637 | 17,8324 | -1,82 % |
| **Global** | **11,0987** | **11,2033** | **+0,94 %** |

| Métrica de servicio | BF16 | FP8 |
|---|---|---|
| Tamaño en disco | 18 GB | 9,6 GB |
| Throughput (flujo único, DGX Spark) | 12,2 tok/s | 22,3 tok/s |
| KV cache con la misma fracción de memoria | 140 912 tokens | 190 112 tokens |
| Tiempo de arranque | 270 s | 180 s |

Además, en 12 prompts de generación, ambas variantes produjeron 7 marcadores léxicos europeos y cero brasileños, confirmando que la cuantización no degrada la especificidad lingüística.

## Requisitos de hardware

- VRAM estimada: el modelo FP8 ocupa 9,6 GB en disco, por lo que en inferencia con vLLM se necesitan al menos 12 GB de VRAM para el modelo más la caché KV. El modelo base BF16 requiere aproximadamente 18,3 GB, según LLM Explorer.
- GPUs recomendadas: el autor probó en una DGX Spark (GB10 Grace-Blackwell). Para producción en servidor, GPUs como NVIDIA A100 (40/80 GB), H100 (80 GB) o L40S (48 GB) son adecuadas. Una RTX 4090 de 24 GB también es suficiente.
- Compatibilidad con GPUs de consumo: sí, cualquier GPU con al menos 12 GB de VRAM y soporte FP8 (RTX 3090, RTX 4090, RTX 6000 Ada) puede ejecutar el modelo.
- Opciones de despliegue: vLLM es la opción recomendada, ya que detecta automáticamente el formato `compressed-tensors`. También puede usarse con TGI si se convierte el formato, aunque no está documentado. No es compatible directamente con llama.cpp ni Ollama, que esperan GGUF.
- Latencia y throughput: en una DGX Spark, el modelo FP8 alcanza 22,3 tokens por segundo en flujo único, con un tiempo de arranque de 180 segundos. La caché KV disponible es de 190 112 tokens con la misma fracción de memoria que el modelo BF16.

## Comparativa con modelos similares

La comparación principal es con el modelo base AMALIA-9B-0626-DPO en BF16, del que esta versión es una cuantización. No existen otras cuantizaciones FP8 de AMALIA en el Hub; las alternativas existentes son en GGUF (para llama.cpp) y MLX (para Apple Silicon). En cuanto a otros modelos de portugués europeo de tamaño similar, no hay información disponible en la documentación consultada.

| Modelo | Parámetros | Contexto | Precisión | Tamaño en disco | Throughput (DGX Spark) | Perplexidad global |
|---|---|---|---|---|---|---|
| AMALIA-9B-0626-DPO (BF16) | 9,15 B | 32 768 | BF16 | 18 GB | 12,2 tok/s | 11,0987 |
| AMALIA-9B-0626-DPO-FP8 (este) | 9,15 B | 32 768 | FP8 | 9,6 GB | 22,3 tok/s | 11,2033 |
| LLaMA-3-8B (multilingüe) | 8,03 B | 8192 | BF16 | ~16 GB | no disponible | no disponible |

La comparación con LLaMA-3-8B es orientativa: aunque tiene un tamaño similar, no está especializado en portugués europeo y su ventana de contexto es menor. No se dispone de datos de rendimiento comparativo en tareas específicas de pt-PT.

## Limitaciones y advertencias

- La equivalencia estadística entre BF16 y FP8 no implica respuestas idénticas. En 12 prompts de prueba, ninguna respuesta FP8 coincidió token a token con la BF16, aunque la calidad agregada fuera equivalente.
- Ejemplo concreto de degradación: en una pregunta de geografía, la versión FP8 situó la isla de Madeira cerca del estrecho de Gibraltar, mientras que la BF16 la colocó correctamente al oeste de Marruecos.
- El modelo está especializado en portugués europeo; su rendimiento en otras variantes del portugués o en otros idiomas puede ser inferior.
- Al ser un modelo de lenguaje, existe riesgo inherente de alucinación y de generar información factual incorrecta, como se observa en el ejemplo anterior.
- No se han documentado sesgos específicos, pero es recomendable realizar pruebas de sesgo antes de un despliegue en producción.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base está sujeto a restricciones de uso legal: no debe desplegarse de forma que entre en conflicto con la Ley de IA de la UE, el GDPR u otros marcos legales aplicables.
- Para producción, se recomienda realizar pruebas específicas de la tarea y del dominio antes de su uso, como indica la documentación del modelo base.

## Enlaces

- Repositorio Hugging Face del modelo FP8: https://huggingface.co/CYBERS3C/AMALIA-9B-0626-DPO-FP8
- Modelo base AMALIA-9B-0626-DPO: https://huggingface.co/amalia-llm/AMALIA-9B-0626-DPO
- GitHub del proyecto AMALIA: https://github.com/AMALIA-LLM/AMALIA
- Herramienta de cuantización llm-compressor: https://github.com/vllm-project/llm-compressor
- Vista de arquitectura del modelo base: https://hfviewer.com/amalia-llm/AMALIA-9B-0626-DPO
- Ficha del modelo en LLM Explorer: https://llm-explorer.com/model/amalia-llm%2FAMALIA-9B-0626-DPO,5TWf78AyWDYn04iTxBYYz5
