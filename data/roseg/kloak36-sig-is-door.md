# RoseG/Kloak36-Sig-is-Door

## Resumen

Kloak36-Sig-is-Door es un modelo de generación de texto publicado por el usuario RoseG en Hugging Face, identificado en su model card como un "Legacy Model by The Kloaked Signal" de TRiADiC Intelligence Labs y SFTStudio.PRO. Se distribuye bajo arquitectura Qwen2 (según los tags del repositorio) con 32.763.876.352 parámetros totales, lo que lo sitúa en la categoría de modelos densos de aproximadamente 32B, y un tamaño de repositorio de 65,5 GB en formato safetensors.

El modelo está orientado a generación de texto conversacional, con soporte declarado únicamente para inglés y licencia Apache 2.0. Está etiquetado como compatible con text-generation-inference y endpoints, lo que facilita su despliegue en infraestructuras estándar de inferencia. La información pública disponible es muy limitada: la model card no incluye detalles sobre datos de entrenamiento, proceso de alineación ni resultados de evaluación.

Su relevancia actual es limitada pero no nula: se trata de un modelo de 32B con licencia permisiva y arquitectura conocida (Qwen2), lo que permite evaluarlo con herramientas estándar del ecosistema transformers. No obstante, la ausencia de benchmarks publicados y de documentación técnica detallada obliga a validarlo empíricamente antes de considerarlo en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Qwen2 (transformer decoder-only, según tags del repo) |
| Parámetros totales | 32.763.876.352 (~32,8B) |
| Parámetros activos | no disponible (no es MoE según los datos disponibles) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos publicados en safetensors; cuantizaciones GGUF/AWQ no documentadas) |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura transformer decoder-only de la familia Qwen2, tal como indican los tags del repositorio (`qwen2`, `transformers`). Con 32,8B parámetros y pesos en safetensors de 65,5 GB, se corresponde con un modelo denso en precisión de 16 bits (32,8B × 2 bytes ≈ 65,5 GB), sin indicios de arquitectura MoE ni de pesos cuantizados en el repositorio.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, el proceso de alineación (RLHF, DPO o SFT) ni innovaciones técnicas específicas. La model card se limita a identificarlo como modelo legacy de TRiADiC Intelligence Labs y SFTStudio.PRO, sin documentar la metodología de entrenamiento. Cualquier afirmación sobre datos de entrenamiento sería especulativa y no debe asumirse.

## Capacidades

- Generación de texto conversacional en inglés, con pipeline `text-generation` y soporte para `conversational`.
- Integración con el ecosistema transformers y compatibilidad declarada con text-generation-inference y endpoints.
- Capacidad multilingüe: limitada al inglés según la metadata del modelo.
- Tool calling / function calling: no disponible en la documentación.
- Soporte de agentes y razonamiento multi-paso: no disponible en la documentación.
- Capacidades especiales (thinking mode, visión, audio): no disponibles.
- Razonamiento, código y matemáticas: no documentados; no hay evidencia publicada de rendimiento en estas tareas.

## Casos de uso

- Generación de texto conversacional en inglés: el modelo puede emplearse como base para asistentes de chat en aplicaciones donde el idioma de trabajo sea exclusivamente inglés, aprovechando su formato conversacional y su integración con transformers.
- Prototipado e investigación: al ser un modelo de 32B con licencia Apache 2.0 y pesos safetensors, resulta adecuado para experimentos académicos de fine-tuning supervisado (SFT) sobre dominios específicos en inglés.
- Despliegue en infraestructura TGI: su compatibilidad declarada con text-generation-inference permite servirlo mediante endpoints HTTP estándar en clústeres con GPUs de suficiente memoria.
- Evaluación comparativa de modelos legacy: útil como referencia en estudios que analicen la evolución de checkpoints derivados de Qwen2 y su comportamiento tras procesos de SFT no documentados.
- Generación de contenido en inglés para entornos controlados: borradores, resúmenes o respuestas plantilla donde la licencia permisiva evite restricciones de uso comercial, previa validación de calidad.
- Base para cuantización y despliegue en local: al publicarse en safetensors, puede cuantizarse a GGUF o AWQ con herramientas del ecosistema (llama.cpp, AutoAWQ) para reducir requisitos de VRAM, aunque dichas cuantizaciones no están publicadas por el autor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 65,5 GB solo para pesos, más overhead de KV cache y activaciones; se recomienda un mínimo de 80 GB para contexto moderado.
- VRAM estimada en cuantización INT8: ~33 GB de pesos, con overhead adicional.
- VRAM estimada en cuantización INT4 (si se genera con herramientas externas): ~17-20 GB de pesos, más KV cache.
- GPUs recomendadas: A100 80GB, H100 80GB o múltiples GPUs (por ejemplo, 2×A100 40GB con tensor parallelism) para FP16.
- Consumer GPU: no cabe en FP16 en ninguna GPU de consumo; en INT4 podría ejecutarse en RTX 4090 (24 GB) o RTX 3090 (24 GB) con contexto limitado, generando la cuantización manualmente.
- Opciones de despliegue: transformers, text-generation-inference (declarado compatible), vLLM y llama.cpp/Ollama tras conversión a GGUF (no publicada por el autor).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Benchmarks públicos |
|---|---|---|---|---|---|
| Kloak36-Sig-is-Door | ~32,8B | no disponible | Apache 2.0 | Hugging Face (RoseG) | no disponibles |
| Qwen2.5-32B-Instruct | ~32,8B | 32.768 tokens (según documentación de Qwen) | Apache 2.0 (variantes) | Hugging Face (Qwen) | publicados por Qwen |
| Mistral Small 24B | ~24B | 32.000 tokens (según documentación de Mistral) | Apache 2.0 | Hugging Face (Mistral AI) | publicados por Mistral |
| Gemma 2 27B | ~27B | 8.192 tokens (según documentación de Google) | Gemma license | Hugging Face (Google) | publicados por Google |

La comparación se limita a parámetros, contexto y licencia, ya que el modelo evaluado no publica benchmarks ni especifica su ventana de contexto. Los datos de los modelos alternativos provienen de su documentación oficial y no de una evaluación conjunta.

## Limitaciones y advertencias

- Ausencia total de benchmarks publicados: no hay evidencia de rendimiento en MMLU, HumanEval, GSM8K ni otras tareas estándar, por lo que su calidad es desconocida.
- Documentación técnica mínima: la model card no detalla datos de entrenamiento, alineación ni proceso de SFT, lo que impide evaluar sesgos y riesgos de forma rigurosa.
- Riesgo de alucinación: sin datos de alineación documentados, no puede descartarse un comportamiento propenso a generar contenido inventado.
- Limitación idiomática: solo inglés declarado; no debe usarse en castellano u otros idiomas sin validación previa.
- Contexto desconocido: al no especificarse la longitud de contexto, no es seguro asumir ventanas largas en producción.
- Licencia Apache 2.0: permite uso comercial, pero el usuario asume toda la responsabilidad sobre el comportamiento del modelo, incluidos posibles sesgos no documentados.
- Modelo legacy: la etiqueta "Legacy Model" sugiere que no recibe mantenimiento activo, con riesgo de obsolescencia frente a alternativas actuales.
- Repositorio con 200 descargas y 0 likes: adopción muy baja, sin comunidad que reporte incidencias o comportamientos observados.
- Origen poco trazable: "TRiADiC Intelligence Labs" y "SFTStudio.PRO" no cuentan con documentación pública verificable en la información disponible.

## Enlaces

- Hugging Face: https://huggingface.co/RoseG/Kloak36-Sig-is-Door
