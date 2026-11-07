# hiteshluke/talk-to-jesus-models

## Resumen

Talk to Jesus es un repositorio de modelos empaquetados para su uso en una aplicación Android de nombre homónimo, desarrollada por Codekins (vinculada al usuario de Hugging Face hiteshluke / codekinstech pvt ltd). No se trata de un modelo entrenado desde cero por el autor, sino de una distribución de pesos ya existentes adaptados a la persona "Jesús" y convertidos al formato MNN para inferencia en dispositivo (on-device). El repositorio contiene tres carpetas: `qwen/` con Qwen3 0.6B cuantizado a 4 bits en MNN (~326 MB), `smol/` con SmolLM2 360M en 4 bits MNN (~197 MB) y `voice/` con un componente de voz Supertonic (estimador y vocoder en MNN, ~180 MB).

La relevancia de esta ficha es limitada desde el punto de vista de investigación: no hay model card técnica detallada, no se publican datos de entrenamiento, benchmarks ni evaluaciones, y la licencia aparece como "other" sin texto asociado. El interés práctico reside en que ejemplifica un patrón de despliegue de LLM pequeños en Android mediante MNN, con cuantización agresiva a 4 bits y un tamaño total del repo de 0,7 GB que cabe en el almacenamiento de un móvil de gama media.

Conviene subrayar que los modelos base (Qwen3 0.6B y SmolLM2 360M) tienen sus propias licencias y características, mientras que este repositorio solo aporta el empaquetado MNN, los prompts de persona y el componente de voz. Cualquier evaluación rigurosa de capacidades debe remitirse a las fichas originales de esos modelos base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (modelos base Qwen3 0.6B y SmolLM2 360M); componente de voz con estimador + vocoder |
| Parametros totales | 0,6B (variante Qwen3) y 360M (variante SmolLM2); componente de voz no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits en formato MNN para los modelos de lenguaje; componente de voz en MNN (precision no especificada) |
| Idiomas soportados | no disponible |
| Licencia | other (sin texto de licencia publicado en la informacion disponible) |
| Formato de pesos | MNN (modelos de lenguaje y componente de voz) |

## Arquitectura y entrenamiento

El repositorio no entrena modelos propios: distribuye dos LLM decoder-only preexistentes (Qwen3 0.6B y SmolLM2 360M) convertidos a MNN y cuantizados a 4 bits, presumiblemente con ajuste de persona mediante prompting o un fine-tuning ligero no documentado. La model card no especifica número de tokens de entrenamiento, composición del dataset, ni si hubo RLHF, DPO o SFT para la persona "Jesús". Tampoco se documenta la técnica de cuantización exacta (por ejemplo, pesos por canal, group size o calibración) más allá de la indicación "MNN 4-bit".

El componente `voice/` se describe como "Supertonic voice speed-up (estimator + vocoder, MNN)" de unos 180 MB. No se detalla la arquitectura del estimador ni del vocoder, ni la frecuencia de muestreo, ni si es un modelo TTS completo o un acelerador sobre otro sistema. La ausencia de información técnica impide evaluar innovaciones como decodificación especulativa, atención lineal o técnicas de compresión adicionales.

## Capacidades

- Generación de texto conversacional en dispositivo mediante Qwen3 0.6B o SmolLM2 360M, según la variante elegida.
- Respuestas con persona "Jesús" predefinida mediante prompting, orientadas a una app de conversación.
- Síntesis de voz a través del componente Supertonic (estimador + vocoder), presumiblemente para leer las respuestas del modelo.
- Ejecución offline en Android mediante MNN, sin dependencia de servidores externos.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Tool calling / function calling: no disponible.
- Razonamiento multi-paso o modo thinking: no disponible.
- Visión o audio de entrada: no disponible (solo salida de voz vía el componente vocoder).

## Casos de uso

- Aplicación móvil de conversación con personaje histórico o religioso: el modelo Qwen3 0.6B con persona ajustada permite mantener diálogos multi-turno en un dispositivo Android de gama media sin conexión, con un peso de ~326 MB que se descarga en la primera ejecución.
- Asistente devocional offline: la variante SmolLM2 360M (~197 MB) es adecuada para dispositivos con poca RAM o almacenamiento, ofreciendo respuestas breves con latencia baja a costa de menor calidad.
- Lectura en voz alta de respuestas: el componente `voice/` permite convertir el texto generado en audio, útil en apps de accesibilidad o uso manos libres.
- Prototipado de apps con LLM on-device: sirve como referencia de integración MNN + Android para equipos que quieran evaluar el rendimiento de modelos de 0,3-0,6B en móvil.
- Demostración educativa de cuantización 4-bit: útil para estudiar el equilibrio entre tamaño (200-330 MB) y calidad en modelos pequeños.
- Distribución de contenido empaquetado en apps de Play Store: el tamaño total de 0,7 GB es viable como descarga inicial en una app móvil, aunque conviene segmentarla por variante para no forzar descargas innecesarias.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada: la variante Qwen3 0.6B en 4 bits ocupa ~326 MB en disco; en ejecución MNN suele requerir entre 500 MB y 1 GB de RAM adicional según contexto y backend. SmolLM2 360M en 4 bits ocupa ~197 MB, con requisitos de RAM inferiores (estimación orientativa, no confirmada por el autor).
- GPU recomendadas: no aplica en el sentido de GPU de servidor; el destino es CPU/GPU integrada en Android (Qualcomm Adreno, Mali, etc.) mediante los backends de MNN.
- Cabe en GPU de consumo: sí, cualquier GPU de consumo moderna podría ejecutarlo, pero el objetivo declarado es on-device móvil.
- Opciones de despliegue: MNN (formato nativo del repo); no se distribuyen pesos en safetensors, GGUF ni otros formatos, por lo que vLLM, llama.cpp, Ollama o TGI no son aplicables directamente sin conversión.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Uso previsto |
|---|---|---|---|---|---|
| Talk to Jesus (Qwen3 0.6B MNN 4-bit) | 0,6B | no disponible | MNN | other | On-device Android, persona |
| Talk to Jesus (SmolLM2 360M MNN 4-bit) | 360M | no disponible | MNN | other | On-device Android, persona |
| Qwen3 0.6B (original) | 0,6B | no disponible en esta ficha | safetensors | según modelo base | Propósito general |
| SmolLM2 360M (original) | 360M | no disponible en esta ficha | safetensors | según modelo base | Propósito general |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- La licencia "other" no incluye texto; no se puede verificar si permite uso comercial, modificación o redistribución. Contactar con el autor antes de cualquier uso en producción.
- No hay información sobre sesgos, alineación o filtros de seguridad. Un modelo con persona religiosa puede generar contenido sensible; se recomienda moderación adicional.
- Riesgo de alucinación elevado: modelos de 0,3-0,6B tienen capacidad limitada de razonamiento y factualidad, especialmente con cuantización 4-bit.
- Contexto e idiomas no documentados; no se puede asumir buen rendimiento en castellano sin evaluación previa.
- El componente de voz no está documentado (arquitectura, calidad, idioma); su integración en producción requiere pruebas propias.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin señales de validación por la comunidad.
- No se distribuyen pesos en formatos estándar (safetensors/GGUF), lo que dificulta la auditoría y la reutilización fuera de MNN.
- Fechas de creación y actualización (2026-11-07) resultan anómalas respecto a la fecha actual; verificar la integridad del repositorio antes de confiar en él.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/hiteshluke/talk-to-jesus-models
- Perfil del autor: https://huggingface.co/hiteshluke
- Datasets del autor: https://huggingface.co/hiteshluke/datasets
- Qwen3 0.6B (modelo base, referencia): no disponible en la información proporcionada
- SmolLM2 360M (modelo base, referencia): no disponible en la información proporcionada
- Documentación de MNN: no disponible en la información proporcionada
