# djrsystemservices/Agents-A1-4B-oQ6e-mtp

## Resumen

El modelo `djrsystemservices/Agents-A1-4B-oQ6e-mtp` es una conversión MLX cuantizada del checkpoint `InternScience/Agents-A1-4B`, realizada con la herramienta oMLX. Se trata de un modelo de visión y lenguaje (image-text-to-text) orientado a tareas de agente, con una cabeza MTP (Multi-Token Prediction) fusionada para acelerar la decodificación especulativa. La cuantización oQ6e (6 bits con calibración de sensibilidad imatrix) asigna precisión selectiva por tensor, lo que permite reducir el uso de memoria manteniendo una calidad cercana al original.

El modelo base, `InternScience/Agents-A1-4B`, no está documentado públicamente en la información proporcionada, pero los tags (`qwen3_5`, `vision-language`, `conversational`) sugieren que deriva de la familia Qwen3.5 con capacidades multimodales. La conversión añade un donante MTP de `guru87/Qwen3.5-4B-MTP` a precisión original (sin cuantizar) para mejorar la velocidad de generación. El repositorio pesa 4.5 GB e incluye los pesos cuantizados, la cabeza MTP y el informe de calibración imatrix.

Aunque el nombre indica 4B, los safetensors contienen 1.280.626.176 parámetros (~1.28B), lo que sugiere una discrepancia entre la denominación comercial y el tamaño real del archivo. La licencia es Apache 2.0, lo que permite uso comercial con atribución.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (visión-lenguaje), basada en Qwen3.5 (según tags) |
| Parametros totales | 1.280.626.176 (~1.28B, según safetensors; el nombre sugiere 4B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | oQ6e (6-bit, calibración imatrix con 128 muestras × 512 tokens) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

La arquitectura exacta no está documentada en la información disponible. Por los tags (`qwen3_5`, `vision-language`, `image-text-to-text`) se infiere un transformer multimodal similar a la familia Qwen3.5, con un encoder visual para procesar imágenes y un decoder de lenguaje. El checkpoint original `Agents-A1-4B` fue entrenado por InternScience, pero no se especifican datos de entrenamiento, número de tokens ni técnicas de alineación (RLHF/DPO).

La conversión oQ6e utiliza calibración de sensibilidad imatrix para asignar una precisión de 6 bits de forma selectiva, preservando los tensores más sensibles a mayor resolución. Además, se ha fusionado una cabeza MTP (Multi-Token Prediction) donada por `guru87/Qwen3.5-4B-MTP`, mantenida a su precisión original (sin cuantizar). Esta cabeza permite decodificación especulativa, prediciendo varios tokens a la vez para acelerar la inferencia.

## Capacidades

- Procesamiento de imágenes y texto (pipeline `image-text-to-text`).
- Generación de texto conversacional, según el tag `conversational`.
- Decodificación especulativa mediante la cabeza MTP, lo que acelera la generación en comparación con decodificación autoregresiva estándar.
- Orientado a tareas de agente (nombre `Agents-A1`), aunque no se confirman capacidades específicas de tool calling o multi-step reasoning en la documentación.
- Cuantización oQ6e optimizada para MLX, diseñada para ejecución eficiente en Apple Silicon.

No se dispone de información sobre soporte de function calling, razonamiento matemático avanzado, ni capacidades multilingües específicas.

## Casos de uso

- Asistentes multimodales en dispositivos Apple: al ser una conversión MLX con cuantización 6-bit, puede ejecutarse en Macs con Apple Silicon para responder preguntas sobre imágenes (por ejemplo, describir fotografías o extraer texto de capturas) con baja latencia gracias a la decodificación especulativa.
- Prototipos de agentes conversacionales: el nombre sugiere un diseño orientado a agentes, por lo que podría usarse en entornos de investigación para experimentar con pipelines de razonamiento multi-paso, aunque las capacidades exactas no están documentadas.
- Inferencia local en entornos con restricciones de memoria: la cuantización oQ6e reduce el footprint de VRAM frente al checkpoint bf16 original, permitiendo ejecutar el modelo en hardware con recursos limitados (por ejemplo, MacBooks con 16 GB unificados).
- Desarrollo de aplicaciones de visión-lenguaje en producción: la licencia Apache 2.0 permite integración comercial, y el formato MLX facilita el despliegue en ecosistemas Apple mediante librerías como `mlx-lm`.
- Evaluación de técnicas de cuantización selectiva: el repositorio incluye `oq_imatrix_report.json`, útil para investigar cómo la calibración imatrix afecta al rendimiento en tareas multimodales.
- Benchmarking de decodificación especulativa: la cabeza MTP fusionada permite comparar velocidad de generación frente a modelos sin MTP en hardware Apple.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras métricas estándar para este modelo o su base.

## Requisitos de hardware

- Al ser una conversión MLX, está diseñada para Apple Silicon (M1/M2/M3/M4). Se recomienda al menos 8 GB de memoria unificada para la carga del modelo cuantizado (4.5 GB de repo, pesos ~1.28B en 6 bits).
- La cabeza MTP se mantiene a precisión original (probablemente bf16), lo que añade memoria adicional; se estima un total de ~5-6 GB en RAM durante la inferencia.
- No se especifican requisitos para GPU NVIDIA o AMD; el formato MLX no es compatible directamente con CUDA, aunque podría convertirse a otros formatos (GGUF, etc.) con herramientas externas.
- Opciones de despliegue: librería `mlx-lm` (parte de oMLX) para inferencia en Python; también podría usarse con `mlx` directamente. No se menciona compatibilidad con vLLM, llama.cpp u Ollama.
- Latencia y throughput: no disponibles. La decodificación especulativa con MTP debería mejorar la velocidad respecto a generación autoregresiva, pero no hay cifras concretas.

## Comparativa con modelos similares

No se dispone de información suficiente para comparar con alternativas concretas. El modelo base `InternScience/Agents-A1-4B` no tiene documentación pública en los datos proporcionados, y no se conocen modelos comparables de la misma familia. Se puede señalar que, por su tamaño (~1.28B parámetros) y naturaleza multimodal, podría compararse con modelos como Qwen2-VL-2B o LLaVA-1.6-1.5B, pero no hay datos de rendimiento para establecer una comparación rigurosa.

## Limitaciones y advertencias

- La discrepancia entre el nombre (4B) y el número real de parámetros (1.28B) puede indicar que el modelo base es más pequeño de lo que sugiere la denominación, o que la cuantización elimina parámetros redundantes. Esto debe verificarse con el checkpoint original.
- No hay documentación sobre el entrenamiento del modelo base: se desconocen los datos usados, posibles sesgos y riesgos de alucinación.
- Las capacidades de agente y tool calling no están confirmadas; el nombre es una pista, pero no una garantía.
- La cuantización oQ6e puede degradar ligeramente la calidad en comparación con el bf16 original, especialmente en tareas sensibles a la precisión (razonamiento matemático, extracción de detalles finos en imágenes).
- El formato MLX limita el despliegue a hardware Apple; para otros entornos es necesario convertir los pesos.
- La cabeza MTP se mantiene a precisión original, lo que incrementa el uso de memoria y puede anular parte del ahorro de la cuantización.
- Licencia Apache 2.0 permite uso comercial, pero se debe respetar la atribución y las políticas de uso aceptable del modelo original (InternScience) y del donante MTP (guru87).

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/djrsystemservices/Agents-A1-4B-oQ6e-mtp
- Modelo base (fuente): https://huggingface.co/InternScience/Agents-A1-4B
- Donante MTP: https://huggingface.co/guru87/Qwen3.5-4B-MTP
- Informe de calibración imatrix: incluido en el repositorio como `oq_imatrix_report.json`
