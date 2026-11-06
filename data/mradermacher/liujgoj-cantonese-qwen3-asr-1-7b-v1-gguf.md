# mradermacher/Liujgoj-Cantonese-Qwen3-ASR-1.7B-V1-GGUF

## Resumen

Liujgoj-Cantonese-Qwen3-ASR-1.7B-V1-GGUF es una conversión a formato GGUF del modelo Liujgoj-Cantonese-Qwen3-ASR-1.7B-V1, publicada por el usuario mradermacher. Se trata de una cuantización estática del modelo original alojado en la cuenta Yvthyvq, orientada a la inferencia local de reconocimiento automático de voz (ASR) en cantonés mediante herramientas compatibles con GGUF, como llama.cpp.

El nombre del repositorio sugiere una base arquitectónica Qwen3 con aproximadamente 1.700 millones de parámetros (1.7B), adaptada específicamente para transcripción de voz en cantonés. No obstante, el dato de parámetros reportado en los safetensors del repositorio es de 319.013.504 parámetros, una discrepancia que conviene verificar contra el modelo original antes de cualquier uso en producción.

La relevancia de esta ficha es limitada por la escasez de documentación: la model card no incluye información sobre licencia, idiomas, arquitectura detallada ni benchmarks. El repositorio registra cero descargas y cero likes en el momento de la consulta, por lo que se trata de una publicación reciente y sin validación comunitaria.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (el nombre sugiere base Qwen3, sin confirmar) |
| Parámetros totales | 319.013.504 (según safetensors del repo); el nombre indica 1.7B |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | x-f16, Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, IQ4_XS |
| Idiomas soportados | no disponible (el nombre indica cantonés) |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones estáticas); el original en safetensors |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo original ni sobre su proceso de entrenamiento. El nombre del repositorio apunta a una base Qwen3 adaptada para ASR, pero la model card no confirma ni detalla esta circunstancia. Tampoco se documentan el volumen de datos de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de ajuste como RLHF o DPO.

La única información técnica disponible en la model card son los metadatos de la conversión a GGUF: `quantize_version: 2`, `convert_type: hf`, `output_tensor_quantised: 1` y una lista de cuantizaciones estáticas generadas. No se indica si se preservó el módulo `mmproj` (proyector multimodal), lo que sugiere que la conversión se centró en los tensores del modelo de lenguaje y no en componentes de audio adicionales.

## Capacidades

- Reconocimiento automático de voz (ASR) en cantonés, según el nombre del modelo.
- Generación de transcripciones de audio a texto (capacidad inferida del propósito ASR, no documentada explícitamente).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible; el nombre indica especialización en cantonés.
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Transcripción de audio en cantonés: el modelo, si funciona según su nombre, podría convertir grabaciones de voz en texto para aplicaciones de subtitulado o archivado. Requiere validación previa, dado que no hay documentación ni benchmarks.
- Procesamiento local sin conexión: al estar en formato GGUF, puede ejecutarse en entornos con llama.cpp u otros runners compatibles, útil para despliegues en dispositivos con recursos limitados.
- Investigación lingüística sobre cantonés: podría emplearse para generar transcripciones de corpus orales, siempre que se valide su calidad frente a modelos ASR consolidados.
- Prototipado de asistentes de voz en cantonés: serviría como componente ASR en pipelines experimentales, con la advertencia de que la licencia no está clara.
- Evaluación comparativa de modelos ASR de bajo tamaño: útil para experimentos académicos que comparen variantes cuantizadas frente a modelos de referencia.
- Integración en herramientas de accesibilidad: transcripción de conversaciones para personas con dificultades auditivas en contextos cantonés-parlantes, tras una validación rigurosa de precisión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión. Con 319 millones de parámetros en Q4_K_M, la huella rondaría los 200-400 MB; con 1.7B parámetros, entre 1 y 1,5 GB en Q4_K_M y hasta 3,5 GB en f16.
- GPU recomendadas: no disponible. Para un modelo de este tamaño, una GPU consumer como RTX 3060 o superior sería suficiente en cuantizaciones bajas.
- Compatibilidad con GPU consumer: probable en cuantizaciones Q4 y Q5, aunque no confirmado.
- Opciones de despliegue: llama.cpp y runners compatibles con GGUF (Ollama, LM Studio, entre otros). No se confirma soporte en vLLM o TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| Liujgoj-Cantonese-Qwen3-ASR-1.7B-V1-GGUF | 319M (safetensors) / 1.7B (nombre) | no disponible | no disponible | GGUF | Hugging Face |
| Whisper (OpenAI) | 39M–1.55B según variante | 30 s de audio por ventana | MIT | safetensors, GGUF | Amplia |
| Qwen2-Audio | 7B | no disponible | Apache 2.0 (según variante) | safetensors | Amplia |

La comparación es aproximada: no hay datos de rendimiento del modelo evaluado, y las alternativas citadas cubren ASR multilingüe o audio-texto de propósito general, no específicamente cantonés.

## Limitaciones y advertencias

- Ausencia total de documentación sobre licencia: no se puede garantizar el uso comercial.
- Discrepancia entre el tamaño indicado en el nombre (1.7B) y los parámetros de los safetensors (319M), lo que genera incertidumbre sobre el modelo real.
- Cero descargas y cero likes: sin validación comunitaria ni evidencia de funcionamiento.
- No se documentan sesgos, riesgo de alucinación ni limitaciones idiomáticas.
- No se confirma la preservación de componentes de audio en la conversión GGUF, lo que podría impedir la inferencia ASR real.
- La fecha de creación indicada (2026-11-01) es anómala y sugiere metadatos inconsistentes.
- No apto para producción sin una evaluación exhaustiva previa.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Liujgoj-Cantonese-Qwen3-ASR-1.7B-V1-GGUF
- Modelo original: https://huggingface.co/Yvthyvq/Liujgoj-Cantonese-Qwen3-ASR-1.7B-V1
