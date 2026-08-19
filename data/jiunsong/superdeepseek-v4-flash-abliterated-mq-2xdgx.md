# Jiunsong/SuperDeepseek-V4-Flash-abliterated-MQ-2xDGX

## Resumen

SuperDeepseek-V4-Flash-abliterated-MQ-2xDGX es un checkpoint derivado de `deepseek-ai/DeepSeek-V4-Flash-0731`, desarrollado por Jiunsong, que combina una intervención de "abliteración" (reducción de rechazos innecesarios) con una cuantización mixta (MQ) de precisión FP4, FP8 y BF16. El objetivo principal es ofrecer un modelo de razonamiento y generación de texto con una tasa de rechazo drásticamente menor que la del modelo base, manteniendo intactas las capacidades de tool calling y el rendimiento general.

El modelo conserva la arquitectura híbrida del DeepSeek V4 Flash: un MoE de clase 304B con 43 capas backbone y 3 capas MTP, 256 expertos enrutados con top-6, y una ventana de contexto configurada de 1.048.576 tokens, verificada con una prueba de recuperación de aguja sobre un prompt de 1.028.621 tokens. El checkpoint se distribuye como pesos safetensors directamente cargables, sin adaptadores en tiempo de inferencia, y está pensado para despliegue con vLLM en hardware de alta gama, habiéndose medido un rendimiento agregado de hasta 123,3 tokens/s en generación estructurada sobre dos nodos DGX Spark.

La relevancia actual del modelo reside en su enfoque quirúrgico: en lugar de una reentrenamiento completo, aplica una actualización acotada sobre 46 pares de pesos/escalas `attn.wo_b` y una corrección de la cabeza de salida, preservando el resto de tensores del checkpoint oficial. Esto permite reducir la tasa de rechazo en modo peor caso del 97,92% al 4,17% sin degradar la selección de herramientas, que se mantiene en el 100%.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DeepSeek V4 Flash, MoE híbrido, 43 capas backbone + 3 capas MTP, 256 expertos enrutados, top-6 |
| Parametros totales | Clase 304B (cifra exacta no disponible) |
| Parametros activos | No disponible (MoE con top-6 sobre 256 expertos) |
| Longitud de contexto | 1.048.576 tokens configurados; verificado con 1.028.621 tokens en recuperación de aguja |
| Tipos de cuantizacion | FP4 (expertos MoE), FP8 E4M3 (bloques con cuantización por bloques 128x128, escalas UE8M0), BF16 (tensores sensibles a calidad), NVFP4 DS-MLA (KV cache en servido) |
| Idiomas soportados | Inglés, coreano |
| Licencia | MIT |
| Formato de pesos | Safetensors (checkpoint híbrido de precisión mixta, ~169,5 GB en el Hub) |

## Arquitectura y entrenamiento

El modelo mantiene la arquitectura híbrida del DeepSeek V4 Flash: un transformer con capas de atención estándar y capas MTP (multi-token prediction), combinado con un enrutamiento MoE de 256 expertos y selección top-6. La cuantización es mixta por diseño: los pesos de los expertos se almacenan en FP4, los bloques con cuantización por bloques usan FP8 E4M3 con escalas dinámicas, y los tensores sensibles a calidad permanecen en BF16. Esta disposición es heredada del checkpoint oficial, no es una recuantización completa del modelo.

El entrenamiento del ajuste se basa en dos pasadas de espacio de pesos: primero, un paso OBLITERATUS que ajusta una dirección de rechazo de rango 1 en modos chat, think-high y think-max con una fuerza de 2; después, una segunda pasada residual de rango 1, ortogonalizada contra la primera, con fuerza 0,5. Finalmente se aplica una corrección acotada de la cabeza de salida de rango 64, con un delta de Frobenius relativo de 0,0025. El resultado modifica únicamente 46 pares de pesos/escalas `attn.wo_b` (43 del backbone y 3 de las capas MTP) y la cabeza de salida, sin necesidad de adaptadores en tiempo de inferencia. No se menciona el uso de RLHF o DPO en la información disponible.

## Capacidades

- Generación de texto y razonamiento multi-turno con ventana de contexto de hasta 1M de tokens, verificada con recuperación de aguja sobre prompts de 149.845 y 1.028.621 tokens.
- Tool calling y function calling: la tasa de cumplimiento de herramientas y la selección correcta de herramienta se mantienen en el 100% tras la abliteración.
- Reducción drástica de rechazos innecesarios: la tasa de rechazo en modo peor caso baja del 97,92% al 4,17%, manteniendo la tasa de respuesta vacía en 0%.
- Capacidad multilingüe limitada a inglés y coreano según la información publicada.
- Compatible con vLLM y endpoints de inferencia estándar de transformers.
- Sin modo de pensamiento explícito documentado, aunque el modelo base DeepSeek V4 Flash incluye capacidades de razonamiento; la abliteración se aplicó sobre modos chat, think-high y think-max.

## Casos de uso

- Atención al cliente automatizada: el modelo puede gestionar conversaciones multi-turno con contexto largo (hasta 1M de tokens) y mantener un tono cooperativo sin rechazos innecesarios, gracias a la reducción de la tasa de refusal del 97,92% al 4,17%.
- Generación de código en producción: soporta tool calling con una tasa de cumplimiento del 100%, lo que permite integrarlo en pipelines de CI/CD para generación, revisión y autocompletado de código con verificación de herramientas externas.
- Agentes autónomos multi-paso: la combinación de razonamiento, tool calling y ventana de contexto amplia permite construir agentes que mantienen estado a lo largo de sesiones largas, por ejemplo para automatización de tareas administrativas o investigación web.
- Análisis de documentos extensos: con 1.048.576 tokens de contexto verificados, puede procesar libros técnicos, expedientes legales o repositorios de código completos en una sola pasada, extrayendo información específica mediante consultas de recuperación.
- Asistente de investigación multilingüe: al soportar inglés y coreano, puede ayudar en la traducción, resumen y análisis de literatura técnica en ambos idiomas, con menor riesgo de rechazo ante consultas complejas o sensibles.
- Despliegue de inferencia de alto rendimiento: el perfil de decode agregado de 123,3 tokens/s en generación estructurada sobre dos nodos DGX Spark lo hace adecuado para servicios de generación concurrente con requisitos de latencia moderada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Los únicos datos de rendimiento publicados son métricas de comportamiento y de decode agregado, que se presentan a continuación.

| Metrica | Modelo base (DeepSeek-V4-Flash-0731) | SuperDeepseek-V4-Flash-abliterated-MQ-2xDGX |
|---|---:|---:|
| Tasa de rechazo en modo peor caso | 97,92% | 4,17% |
| Tasa de respuesta vacía en modo peor caso | 0,00% | 0,00% |
| Cumplimiento de herramientas en modo peor caso | 100,00% | 100,00% |
| Tasa de herramienta correcta en modo peor caso | 100,00% | 100,00% |
| Media de capacidad mínima | 0,9375 | 0,9583 |

| Carga de trabajo | Prompt / concurrencia | Decode agregado |
|---|---:|---:|
| Salida forzada | p256 / C6 | 118,5505 tok/s |
| Salida estructurada con herramientas | p256 / C6 | 123,2888 tok/s |

La relación de decode mediana frente al modelo base es de 1,001, lo que indica que la abliteración no degrada la velocidad de generación.

## Requisitos de hardware

- El checkpoint ocupa aproximadamente 169,5 GB en el Hub, con pesos en FP4, FP8 y BF16; la VRAM necesaria para inferencia dependerá de la cuantización y del tamaño de lote, pero no se ha publicado una cifra exacta.
- El perfil de decode agregado se midió sobre dos nodos DGX Spark, lo que sugiere que se requiere hardware de múltiples GPU de alta gama (por ejemplo, DGX Spark con GPU Blackwell) para alcanzar el rendimiento publicado.
- No se indica compatibilidad con GPU de consumo (RTX 4090, etc.); dado el tamaño del modelo, es poco probable que quepa en una sola GPU de consumo sin cuantizaciones adicionales agresivas.
- Opciones de despliegue: vLLM (mencionado explícitamente), así como cualquier framework compatible con transformers y safetensors; no se menciona soporte para llama.cpp u Ollama.
- La latencia y el throughput por petición individual no se han publicado; solo se dispone del decode agregado bajo concurrencia C6.

## Comparativa con modelos similares

La comparativa más directa es con el modelo base del que deriva, DeepSeek-V4-Flash-0731, ya que no se dispone de datos de otros modelos comparables en la información proporcionada.

| Modelo | Parametros | Contexto | Licencia | Tasa de rechazo (peor caso) | Tool compliance | Decode agregado |
|---|---|---|---|---|---|---|
| DeepSeek-V4-Flash-0731 (base) | Clase 304B MoE | 1.048.576 | MIT | 97,92% | 100% | No publicado |
| SuperDeepseek-V4-Flash-abliterated-MQ-2xDGX | Clase 304B MoE | 1.048.576 | MIT | 4,17% | 100% | 123,3 tok/s (C6, p256) |

No se dispone de información suficiente para comparar con otros modelos MoE de tamaño similar (por ejemplo, otras variantes de DeepSeek o modelos de la competencia) en términos de benchmarks estandarizados.

## Limitaciones y advertencias

- La abliteración reduce los rechazos, pero no elimina el riesgo de alucinación; el modelo puede generar contenido falso o inventado, especialmente en tareas de razonamiento complejo o con contexto muy largo.
- El soporte de idiomas se limita a inglés y coreano; no se garantiza un rendimiento adecuado en otros idiomas, incluido el español.
- La ventana de contexto de 1M de tokens está verificada mediante recuperación de aguja, pero no se han publicado pruebas de rendimiento en tareas de razonamiento sobre contextos extremadamente largos; el uso en producción con contextos cercanos al máximo puede degradar la calidad.
- La licencia MIT permite uso comercial sin restricciones, pero el modelo deriva de DeepSeek-V4-Flash-0731, por lo que se deben revisar los términos de la licencia del modelo base si existen condiciones adicionales.
- El despliegue requiere hardware de gama alta; el rendimiento publicado se obtuvo en dos nodos DGX Spark, y no se garantizan resultados similares en configuraciones de menor capacidad.
- La intervención de abliteración es quirúrgica y se validó con un conjunto de centinelas (salida vacía, Unicode, repetición, serialización, razonamiento, código, formato y uso de herramientas), pero no cubre todos los escenarios posibles; pueden aparecer comportamientos inesperados en dominios no evaluados.
- No se han publicado benchmarks estándar de razonamiento, matemáticas o código, por lo que la capacidad real frente a otros modelos en estas tareas no está cuantificada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Jiunsong/SuperDeepseek-V4-Flash-abliterated-MQ-2xDGX
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4-Flash-0731
- Repositorio de medición de rendimiento sparkDash: https://github.com/MiaAI-Lab/sparkDash
