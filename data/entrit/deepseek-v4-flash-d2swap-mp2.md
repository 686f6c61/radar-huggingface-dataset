# Entrit/DeepSeek-V4-Flash-d2swap-mp2

## Resumen

Entrit/DeepSeek-V4-Flash-d2swap-mp2 es una versión cuantizada del modelo DeepSeek-V4-Flash, publicada por Entrit Systems. La modificación afecta exclusivamente a los 256 expertos enrutados del componente MoE, que se sustituyen por valores codificados con el códec propietario d2 de Entrit. El resto de componentes (atención, experto compartido, router, embeddings y cabeza de salida) se mantiene en la versión FP4 original de DeepSeek, sin cambios.

La relevancia técnica del checkpoint reside en la agresividad de la compresión: cada peso de los expertos se reduce a uno de nueve niveles discretos ({0, ±1, ±2,83, ±5,20, ±8}) multiplicado por una escala única por grupo de 64 pesos, lo que equivale a unos 3,4 bits de información por peso. Según el autor, el modelo conserva aproximadamente el 99 % del rendimiento del base FP4 en las pruebas publicadas, lo que situaría la cuantización ternaria multinivel como una alternativa viable al FP4 para reducir huella de memoria en despliegues MoE.

El checkpoint se distribuye en dos shards de paralelismo tensorial (mp2) con el layout del código de inferencia de referencia de DeepSeek V4, con un tamaño total de 163,4 GB. No es compatible con `transformers` ni con vLLM, lo que restringe su uso a infraestructuras que puedan ejecutar el código de referencia con tensor-parallel de grado 2.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE); expertos enrutados cuantizados con códec d2 |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible (el modelo base declara 256 expertos enrutados) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | d2 sobre expertos enrutados (~3,4 bits/peso, 9 niveles, escala por grupo de 64); resto en FP4 |
| Idiomas soportados | no disponible |
| Licencia | MIT (heredada de deepseek-ai/DeepSeek-V4-Flash) |
| Formato de pesos | Shards de tensor-parallel 2 (`model0-mp2`, `model1-mp2`) en layout del código de referencia de DeepSeek V4; no compatible con safetensors estándar ni GGUF |

## Arquitectura y entrenamiento

El modelo base es un transformer MoE con 256 expertos enrutados más un experto compartido y un router, según se desprende de la descripción del checkpoint. La intervención de Entrit no implica reentrenamiento: se limita a una sustitución post-hoc de los pesos de los expertos enrutados por sus representaciones d2. Cada bloque de 64 pesos comparte una escala y cada peso toma uno de nueve valores discretos, con un presupuesto informativo de aproximadamente 3,4 bits por peso. Los componentes de atención, el experto compartido, el router, los embeddings y la cabeza de salida permanecen en la versión FP4 publicada por DeepSeek.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni las etapas de alineación (RLHF, DPO) del modelo base en la documentación proporcionada. Tampoco se detalla si el códec d2 aplica técnicas de calibración con datos, búsqueda de escalas por grupo o ajuste de sesgos, más allá de la descripción de la rejilla de niveles y la escala por grupo de 64 pesos.

## Capacidades

- Generación de texto: el pipeline declarado es `text-generation`, por lo que hereda las capacidades generativas del modelo base DeepSeek-V4-Flash.
- Razonamiento y matemáticas: los resultados publicados en GSM8K (0,97) y MATH-500 (0,95) indican competencia en razonamiento aritmético y matemático de varios pasos.
- Conocimiento general: MMLU de 0,95 en el arnés de evaluación del autor.
- Mezcla de expertos: 256 expertos enrutados con experto compartido, lo que permite activación dispersa y reduce el coste computacional por token frente a un modelo denso equivalente.
- Capacidades de tool calling, agentes, multimodalidad, audio o modo de razonamiento extendido: no disponibles en la información proporcionada.
- Capacidades multilingües: no disponibles; el campo de idiomas del repositorio no está cumplimentado.

## Casos de uso

- Despliegue de inferencia a gran escala con restricciones de memoria: la cuantización d2 reduce los expertos enrutados a ~3,4 bits por peso, lo que permite servir el checkpoint de 163 GB en configuraciones de tensor-parallel 2 con menor huella de VRAM que la versión FP4, siempre que se use el código de referencia de DeepSeek V4.
- Evaluación de técnicas de cuantización extrema en MoE: el checkpoint sirve como referencia empírica para estudiar la degradación de un modelo FP4 al cuantizar únicamente los expertos enrutados a una rejilla de nueve niveles, comparando GSM8K, MMLU y MATH-500 contra el base.
- Investigación en compresión de modelos: útil para analizar el compromiso entre bits por peso (3,4 frente a 4 en FP4) y pérdida de precisión (aproximadamente 1 % según el autor) en arquitecturas con routing disperso.
- Razonamiento matemático en entornos controlados: con MATH-500 en 0,95, puede emplearse en pipelines internos de resolución de problemas matemáticos donde el hardware permita ejecutar el layout mp2.
- Clasificación y extracción de conocimiento en textos largos: hereda la ventana de contexto del base (no documentada aquí), adecuada para tareas de comprensión sobre documentos extensos si se valida el comportamiento tras la cuantización.
- Banco de pruebas para toolchains de inferencia propietarias: al no cargar en `transformers` ni vLLM, es un caso de estudio para equipos que mantienen runners basados en el código de referencia de DeepSeek y necesitan validar compatibilidad de shards mp2.

## Benchmarks y rendimiento

| Benchmark | DeepSeek-V4-Flash-d2swap-mp2 | DeepSeek-V4-Flash (FP4, referencia del autor) |
|---|---|---|
| GSM8K | 0,97 | no disponible (el autor indica ~99 % de retención) |
| MMLU | 0,95 | no disponible (el autor indica ~99 % de retención) |
| MATH-500 | 0,95 | no disponible (el autor indica ~99 % de retención) |

Los valores corresponden al arnés de evaluación del autor. No se han publicado resultados adicionales de benchmarks ni comparaciones con modelos de terceros en la información disponible.

## Requisitos de hardware

- Tamaño del checkpoint: 163,4 GB en dos shards de tensor-parallel 2; se requiere al menos esa capacidad agregada de VRAM o memoria unificada, más overhead de activaciones y KV cache.
- Configuración mínima práctica: 2 GPU con al menos ~82 GB útiles cada una para alojar los shards, lo que apunta a A100 80 GB, H100 80 GB o aceleradores con memoria equivalente; no cabe en GPUs de consumo como RTX 4090 (24 GB) ni en configuraciones de 2×48 GB sin offloading.
- GPUs recomendadas: H100 80 GB en par (NVLink preferible por el tráfico de tensor-parallel), A100 80 GB en par, o nodos con mayor número de GPUs si se amplía el grado de paralelismo mediante sharding adicional del código de referencia.
- Opciones de despliegue: exclusivamente el código de inferencia de referencia de DeepSeek V4 con tensor-parallel 2 y el `config.json` del repositorio. No es compatible con vLLM, `transformers`, llama.cpp, Ollama ni TGI según la model card.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Compatibilidad de despliegue |
|---|---|---|---|---|---|
| Entrit/DeepSeek-V4-Flash-d2swap-mp2 | no disponible (256 expertos enrutados) | no disponible | d2 (~3,4 bits) en expertos, FP4 en el resto | MIT | Solo código de referencia DeepSeek V4, TP=2 |
| deepseek-ai/DeepSeek-V4-Flash | no disponible | no disponible | FP4 | MIT | Código de referencia DeepSeek V4 |
| Alternativas de terceros de tamaño y arquitectura comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información suficiente para comparar con otros modelos de la misma categoría en parámetros, contexto o rendimiento.

## Limitaciones y advertencias

- Compatibilidad restringida: el checkpoint no carga en `transformers` ni en vLLM; requiere el código de inferencia de referencia de DeepSeek V4 y tensor-parallel de grado 2, lo que limita su integración en stacks estándar.
- Degradación por cuantización: la rejilla de nueve niveles con una escala por grupo de 64 pesos introduce error de cuantización en los expertos enrutados; el autor reporta ~99 % de retención en tres benchmarks, pero no se documenta el impacto en otras tareas (código, multilingüe, instrucciones largas).
- Riesgo de alucinación: inherente a los modelos generativos del base; no se han publicado evaluaciones de factualidad ni de calibración tras la cuantización.
- Idiomas: el repositorio no declara idiomas soportados, por lo que el comportamiento multilingüe debe validarse empíricamente.
- Sesgos: no se documentan análisis de sesgo ni evaluaciones de seguridad para esta variante.
- Propiedad intelectual: el códec d2 está sujeto a solicitudes de patente pendientes de Entrit Systems; la licencia MIT del modelo no implica cesión de derechos sobre el códec ni sobre su implementación.
- Licencia: MIT heredada del base, lo que permite uso comercial del checkpoint, pero conviene revisar el `LICENSE` del repositorio y las condiciones del modelo base de DeepSeek para confirmar obligaciones adicionales.
- Madurez: 15 descargas y 0 likes en el momento de la consulta; no hay evidencia de validación independiente de los resultados reportados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Entrit/DeepSeek-V4-Flash-d2swap-mp2
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4-Flash
- Contacto del autor: eric@entrit.io
- Paper, blog, repositorio de código o demo del códec d2: no disponibles en la información proporcionada.
