# alwaysgood/Qwen3.5_4B_ADS

## Resumen

Qwen3.5_4B_ADS es un ajuste fino completo (full fine-tune) del modelo base `unsloth/Qwen3.5-4B`, desarrollado por el usuario `alwaysgood`, especializado en traducción financiera de inglés a coreano. El modelo se entrenó con un currículo de selección de datos basado en estimación de calidad baja (DQS, low-QE) con semilla 42, y conserva las capacidades multimodales del modelo base al no entrenar las capas de visión. Está publicado bajo licencia Apache-2.0 y disponible en formato Transformers (safetensors) y GGUF (Q4_K_M) para LM Studio y llama.cpp.

El modelo base Qwen3.5-4B es un modelo de lenguaje multimodal denso de 4 000 millones de parámetros con arquitectura híbrida (Gated DeltaNet + Gated Attention), contexto nativo de 262 144 tokens y entrenamiento con predicción multi-token. El ajuste fino se centra en la tarea de traducción financiera, con el modo de razonamiento (thinking) desactivado durante el entrenamiento y la evaluación, y ofrece un rendimiento medido en BLEU, chrF y métricas COMET sobre un conjunto de prueba reservado de 500 filas.

La relevancia de este modelo radica en su especialización en un dominio concreto (textos financieros) con un tamaño compacto que permite ejecutarlo en hardware de consumo, y en su compatibilidad con herramientas de inferencia locales como llama.cpp y LM Studio. Incluye un proyector de visión en BF16 para entrada de imágenes, aunque la tarea principal es traducción de texto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: Gated DeltaNet + Gated Attention (base Qwen3.5-4B) |
| Parametros totales | 4.539.265.536 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262 144 tokens nativos (heredado del base; extensible hasta ~1 010 000) |
| Tipos de cuantizacion | BF16 (checkpoint original), Q4_K_M (GGUF) |
| Idiomas soportados | en, ko (inglés y coreano) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (BF16), GGUF (Q4_K_M) |

## Arquitectura y entrenamiento

El modelo base Qwen3.5-4B emplea una arquitectura híbrida que combina capas de Gated DeltaNet (una variante de atención lineal eficiente) con capas de Gated Attention tradicionales, y fue entrenado con predicción multi-token (MTP). El ajuste fino `Qwen3.5_4B_ADS` es un fine-tune completo supervisado (full-parameter SFT) sobre el corpus `alwaysgood/financial-english-source-corpus`, con selección de ejemplos por estimación de calidad baja (low-QE) y semilla 42. Durante el entrenamiento y la evaluación se desactivó el modo de razonamiento (thinking) del modelo base. Las capas de visión no se entrenaron; se preservaron los componentes multimodales originales. El checkpoint final no incluye la cabeza auxiliar MTP declarada en la configuración heredada, por lo que la decodificación especulativa MTP no está disponible, aunque la generación autoregresiva normal no se ve afectada.

## Capacidades

- Traducción financiera inglés-coreano: tarea principal, optimizada para textos financieros con instrucciones que solicitan solo la traducción.
- Entrada multimodal: el modelo acepta imágenes gracias al proyector de visión BF16 (`mmproj`), aunque el ajuste no entrenó las capas de visión.
- Conversación multi-turno: hereda la capacidad conversacional del modelo base Qwen3.5-4B.
- Generación de texto autoregresiva estándar: sin soporte de decodificación especulativa MTP en este checkpoint.
- No se documenta soporte explícito de tool calling o function calling en el modelo card.
- Multilingüe limitado: los idiomas declarados son inglés y coreano, con foco en traducción financiera.

## Casos de uso

- Traducción de informes financieros y estados de resultados: el modelo puede traducir documentos contables y reportes trimestrales de inglés a coreano, manteniendo terminología específica del dominio financiero.
- Localización de comunicados de prensa de empresas: traducción de notas de prensa sobre resultados, fusiones o adquisiciones para su distribución en mercados coreanos.
- Traducción de documentación regulatoria y legal financiera: adecuado para traducir prospectos, contratos y avisos de cumplimiento con precisión terminológica.
- Asistencia en análisis de mercados internacionales: analistas pueden usar el modelo para traducir rápidamente noticias financieras en inglés al coreano y viceversa, facilitando el seguimiento de mercados globales.
- Integración en pipelines de localización de productos fintech: el modelo puede integrarse en herramientas de traducción automática para interfaces de aplicaciones bancarias o de inversión, con la posibilidad de ajustar el prompt para obtener solo la traducción.
- Procesamiento de documentos escaneados con imágenes: gracias al componente multimodal, puede procesar capturas de pantalla o escaneos de tablas financieras y traducir su contenido, aunque esta capacidad no fue específicamente entrenada.

## Benchmarks y rendimiento

El modelo card reporta las siguientes métricas sobre un conjunto de prueba reservado de 500 filas, evaluadas con el checkpoint BF16 original (no con la cuantización Q4_K_M):

| Metrica | Puntuacion |
|---|---:|
| BLEU | 27,4731 |
| chrF | 47,9918 |
| COMET (`wmt22-comet-da`) | 0,8906 |
| COMETKiwi (`wmt22-cometkiwi-da`) | 0,8565 |
| XCOMET-XXL | 0,8675 |
| MetricX-24 Hybrid XXL (menor es mejor) | 3,8712 |

No se han publicado comparaciones con otros modelos de traducción financiera en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint BF16 (4,54B parámetros) requiere aproximadamente 9 GB de VRAM; la versión GGUF Q4_K_M ocupa alrededor de 2,5 GB y cabe en GPUs con 4-6 GB de VRAM.
- GPU recomendadas: el modelo base Qwen3.5-4B puede ejecutarse en 8 GB de VRAM según la documentación pública; para el fine-tune, una RTX 3060 de 12 GB o superior es suficiente para BF16, y una RTX 4060 de 8 GB para Q4_K_M.
- Compatibilidad con GPU de consumo: sí, tanto en cuantización Q4_K_M como en BF16 con GPUs de gama media.
- Opciones de despliegue: llama.cpp, LM Studio, Transformers con Hugging Face, y servidores compatibles con endpoints (endpoints_compatible según tags).
- Latencia y throughput: no se proporcionan datos específicos; para un modelo de 4,5B en Q4_K_M, se espera una generación de decenas de tokens por segundo en GPUs modernas, pero no hay cifras oficiales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen3.5_4B_ADS (este) | 4,54B | 262K | Traducción financiera EN-KO | Apache-2.0 | safetensors, GGUF |
| unsloth/Qwen3.5-4B (base) | 4,54B | 262K | Multimodal general | Apache-2.0 | safetensors |
| Qwen3-30B (referencia de rendimiento del base) | 30B | 262K | Multimodal general | Apache-2.0 | safetensors |

El modelo base Qwen3.5-4B iguala a Qwen3-30B en MMLU-Pro y supera a GPT-5-Nano en benchmarks de visión, según la documentación pública. No se dispone de comparativas directas con otros modelos de traducción financiera especializados.

## Limitaciones y advertencias

- El ajuste fino se centra en traducción financiera inglés-coreano; el rendimiento en otros dominios o pares de idiomas puede ser inferior.
- La cuantización Q4_K_M no ha sido evaluada con las métricas reportadas; los resultados corresponden al checkpoint BF16 original y pueden degradarse ligeramente en la versión cuantizada.
- No se incluye el soporte de decodificación especulativa MTP, a pesar de que la configuración heredada lo declara; la generación es autoregresiva estándar.
- El corpus de entrenamiento agrega fuentes con términos de licencia mixtos; la tarjeta del dataset está marcada como `license: other`, por lo que los usuarios deben revisar los términos específicos de cada fuente antes de un uso comercial.
- Riesgo de alucinación inherente a los modelos de lenguaje, especialmente en traducciones de textos ambiguos o con jerga financiera poco común.
- El modo de razonamiento (thinking) está desactivado; no se recomienda solicitar explicaciones o razonamiento paso a paso al modelo.
- La capacidad multimodal se hereda del base pero no fue entrenada en el ajuste; la calidad de la traducción de contenido visual no está garantizada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/alwaysgood/Qwen3.5_4B_ADS
- Dataset de entrenamiento (corpus fuente): https://huggingface.co/datasets/alwaysgood/financial-english-source-corpus
- Dataset de entrenamiento (versión Qwen3.5-1280): https://huggingface.co/datasets/alwaysgood/financial-english-source-corpus-qwen35-1280
- Artefactos de ejecución del entrenamiento: https://huggingface.co/datasets/alwaysgood/dqs-runs/tree/fa8166a883d96460cc285b46d66b74a074b4b8d4/qwen35_4b_it_full_lowqe_seed42
- Modelo base: https://huggingface.co/unsloth/Qwen3.5-4B
- Información sobre Qwen3.5-4B (arquitectura y contexto): https://theresanaiforthat.com/model/qwen3-5-4b/
