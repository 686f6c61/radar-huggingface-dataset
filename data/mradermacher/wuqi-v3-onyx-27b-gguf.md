# mradermacher/WuQi-V3-Onyx-27B-GGUF

## Resumen

WuQi-V3-Onyx-27B es un modelo de lenguaje de 27.320 millones de parámetros desarrollado originalmente por Alniyat5f y publicado bajo licencia Apache 2.0. Esta ficha se refiere a la versión cuantizada en formato GGUF realizada por mradermacher, que facilita su ejecución en entornos con recursos limitados, como CPU o GPUs de consumo. El modelo está orientado principalmente al idioma chino, aunque podría tener capacidades multilingües no documentadas. La cuantización estática incluye múltiples niveles (Q2_K, Q3_K, Q4_K, Q5_K, Q6_K, Q8_0, IQ4_XS) y además se ofrecen archivos auxiliares multimodales (mmproj) en Q8_0 y f16, lo que sugiere que el modelo base podría tener capacidades de visión o audio, aunque no se detalla en la documentación disponible.

La relevancia de esta versión cuantizada radica en que permite probar un modelo de 27B parámetros en equipos con menos de 16 GB de VRAM si se utiliza una cuantización baja, sin necesidad de hardware especializado. Sin embargo, la información técnica sobre la arquitectura interna, el entrenamiento o los benchmarks es escasa, por lo que esta ficha se basa únicamente en los datos públicos del repositorio GGUF y del modelo base.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parámetros totales | 27.320.697.856 (≈27.3B) |
| Parámetros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | f16, Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, IQ4_XS (según README) |
| Idiomas soportados | zh (chino) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (además safetensors para el modelo base) |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo. El nombre sugiere una versión "V3" de una familia llamada WuQi, pero no hay documentación técnica pública. El modelo base (Alniyat5f/WuQi-V3-Onyx-27B) está disponible en formato safetensors, y la versión GGUF es una conversión estática realizada por mradermacher. No se han publicado datos sobre el conjunto de entrenamiento, el número de tokens, técnicas de alineación (RLHF/DPO) ni innovaciones arquitectónicas. La única pista adicional es la presencia de archivos mmproj (multi-modal projection) en la versión GGUF, lo que podría indicar que el modelo original integra un módulo visual o auditivo, pero no se confirma.

## Capacidades

- Generación de texto en chino (lengua principal según la etiqueta `zh`).
- Conversación de estilo chat, indicado por la etiqueta `conversational`.
- Posible soporte multimodal (imagen o audio) gracias a los archivos `mmproj` incluidos, aunque no se especifica el tipo de modalidad.
- Compatibilidad con la librería `transformers` para el modelo base, y con herramientas de inferencia GGUF como llama.cpp, Ollama o vLLM (con soporte para GGUF).
- No hay evidencia de tool calling, razonamiento multi-paso ni otros capacidades avanzadas en la documentación.

## Casos de uso

- **Chatbots en chino**: el modelo puede integrarse en aplicaciones de atención al cliente o asistentes virtuales que requieran respuestas en chino, gracias a su tamaño de 27B que ofrece un equilibrio entre calidad y consumo de recursos.
- **Procesamiento de documentos en chino**: para resumir, extraer información o generar contenido a partir de textos largos en chino, si la longitud de contexto es suficiente (aunque no se conoce el valor exacto).
- **Traducción automática**: aunque no se ha confirmado, un modelo de 27B entrenado en chino podría utilizarse como base para tareas de traducción, siempre que se ajuste con datos específicos.
- **Generación de contenido creativo**: redacción de artículos, cuentos o poesía en chino, aprovechando la capacidad generativa del modelo.
- **Análisis de sentimiento o clasificación de texto**: mediante fine-tuning sobre el modelo base (safetensors) o usando el GGUF para inferencia directa con prompts adecuados.
- **Investigación académica**: como modelo de referencia para experimentos de cuantización, comparación de rendimiento entre distintos niveles de cuantización (Q2_K a Q8_0) en hardware variado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos sobre MMLU, HumanEval, GSM8K ni otras métricas estándar. El único dato indirecto es el tamaño de parámetros (27.3B), que sugiere un rendimiento intermedio, pero sin mediciones no se puede afirmar nada más.

## Requisitos de hardware

- **VRAM estimada** (según cuantización GGUF):
  - Q2_K: ≈ 8-10 GB (para inferencia en GPU)
  - Q4_K_M: ≈ 14-16 GB (recomendable para GPU de 16 GB)
  - Q6_K: ≈ 20-22 GB
  - Q8_0: ≈ 28-30 GB (requiere GPU de 32 GB o más)
- **GPU recomendadas**: NVIDIA RTX 4090 (24 GB), RTX A6000 (48 GB) o A100 (40/80 GB) para las cuantizaciones altas. Para las bajas, una RTX 3080/3090 (10-24 GB) podría ser suficiente.
- **Despliegue**: se puede usar con llama.cpp, Ollama, llama-cpp-python o vLLM (con soporte GGUF). También es posible cargar el modelo base con transformers y cuantización bitsandbytes.
- **Latencia**: no se conoce; dependerá del hardware y de la cuantización. Para un modelo de 27B, se espera un throughput de aproximadamente 10-20 tokens/s en GPU de 24 GB con cuantización Q4_K_M.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables. La familia WuQi no es ampliamente conocida y no hay datos de otros modelos de 27B con la misma licencia y enfoque en chino. Se sugiere comparar con modelos como Qwen-27B, pero no se tienen datos concretos para establecer una comparación objetiva.

## Limitaciones y advertencias

- **Sesgos**: no hay información sobre sesgos del modelo, pero es probable que tenga los sesgos comunes de los modelos entrenados con datos de Internet.
- **Riesgo de alucinación**: como cualquier LLM, puede generar información falsa o inventada, especialmente en temas de baja frecuencia.
- **Limitación de idioma**: la documentación solo indica chino; si se usa en otros idiomas, el rendimiento puede degradarse.
- **Contexto**: se desconoce la longitud de contexto; si es corta (p.ej. 2K), no será adecuado para documentos largos.
- **Licencia**: Apache 2.0 permite uso comercial, pero se debe verificar si el modelo base tiene alguna restricción adicional (no se ha encontrado).
- **Cuantización**: los archivos GGUF son estáticos y no incluyen matriz de importancia (imatrix), por lo que la calidad puede ser menor que con cuantizaciones ponderadas.
- **Producción**: no se han publicado pruebas de robustez ni de seguridad; se recomienda evaluar el modelo en el entorno de uso antes de desplegarlo.

## Enlaces

- [Modelo GGUF en Hugging Face](https://huggingface.co/mradermacher/WuQi-V3-Onyx-27B-GGUF)
- [Modelo base en Hugging Face](https://huggingface.co/Alniyat5f/WuQi-V3-Onyx-27B)
- [Leaderboard de modelos self-hosted (referencia general)](https://onyx.app/self-hosted-llm-leaderboard)
