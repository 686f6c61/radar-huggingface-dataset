# mradermacher/Lunar-Memories-26B-A4B-GGUF

## Resumen

Lunar-Memories-26B-A4B-GGUF es un repositorio de cuantizaciones estáticas en formato GGUF del modelo base Lunar-Memories-26B-A4B, publicado por el usuario Sorihon en Hugging Face. El repositorio que nos ocupa, mantenido por mradermacher (conocido por generar y distribuir cuantizaciones GGUF de forma automatizada), no contiene un modelo original sino una colección de versiones comprimidas del modelo para su uso con llama.cpp y herramientas compatibles.

Por el nombre del modelo puede inferirse una arquitectura de mezcla de expertos (MoE) con 26 mil millones de parámetros totales y aproximadamente 4 mil millones de parámetros activos por token (el sufijo A4B), aunque esta información no está confirmada en la documentación disponible. El repositorio no incluye model card descriptiva, licencia declarada, idiomas soportados ni detalles de entrenamiento.

La relevancia de este repositorio es práctica: ofrece múltiples niveles de cuantización (desde Q2_K hasta Q8_0, además de F16 e IQ4_XS) que permiten desplegar un modelo de 26B en hardware de consumo, algo imposible con los pesos originales. Sin embargo, la ausencia total de documentación sobre el modelo base limita seriamente cualquier evaluación rigurosa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el nombre sugiere MoE, sin confirmar) |
| Parametros totales | 26B (inferido del nombre, no confirmado) |
| Parametros activos | ~4B (inferido del sufijo A4B, no confirmado) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | F16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K, IQ4_XS |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones estáticas, quantize_version 2) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo base Lunar-Memories-26B-A4B. El nombre sugiere una arquitectura de mezcla de expertos con 26B parámetros totales y 4B activos, patrón habitual en modelos tipo Mixtral o Qwen-MoE, pero no hay confirmación documental. Tampoco se conocen los datos de entrenamiento, el número de tokens procesados, la composición del dataset ni si se aplicaron técnicas de alineación como RLHF o DPO.

Respecto al proceso de cuantización, los metadatos del repositorio indican `quantize_version: 2`, `output_tensor_quantised: 1`, `convert_type: hf` y `skip_mmproj: 1`, lo que confirma que se partió de pesos en formato Hugging Face y se generaron cuantizaciones estáticas con llama.cpp. El flag `skip_mmproj` sugiere que el modelo base no incluye proyector multimodal o que este se omitió deliberadamente.

## Capacidades

- Generación de texto: capacidad esperable en cualquier modelo de lenguaje, sin detalles confirmados.
- Razonamiento y matemáticas: no disponible.
- Generación de código: no disponible.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Capacidades especiales (modo thinking, visión, audio): no disponible; el flag `skip_mmproj` apunta a ausencia de componente multimodal.

## Casos de uso

- Despliegue local en hardware de consumo: las cuantizaciones Q4_K_M y Q5_K_M permiten ejecutar un modelo de 26B en GPUs con 16-24 GB de VRAM mediante llama.cpp u Ollama, algo inviable con pesos F16.
- Experimentación e investigación: útil para estudiar el comportamiento de modelos MoE de gran tamaño en entornos con recursos limitados, comparando la degradación entre niveles de cuantización.
- Prototipado de aplicaciones de texto: integración en pipelines locales con llama-cpp-python para generar texto sin depender de APIs externas.
- Evaluación comparativa de cuantizaciones: el repositorio ofrece doce variantes que permiten medir el impacto de la compresión en calidad y velocidad sobre el mismo modelo base.
- Inferencia en CPU: las variantes Q2_K y Q3_K_S reducen el peso lo suficiente para ejecución en CPU con RAM abundante, útil en servidores sin GPU.
- Pruebas de integración con llama.cpp: validación de compatibilidad de modelos MoE cuantizados en versiones recientes del runtime.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (26B parámetros, cálculos aproximados):
  - F16: ~52 GB.
  - Q8_0: ~28 GB.
  - Q6_K: ~21 GB.
  - Q5_K_M: ~18 GB.
  - Q4_K_M: ~15-16 GB.
  - Q3_K_M: ~13 GB.
  - Q2_K: ~10 GB.
- GPU recomendadas: A100 80 GB o H100 para F16/Q8_0; RTX 4090 (24 GB) o RTX 3090 para Q4_K_M y Q5_K_M; GPUs de 16 GB para Q3_K_M.
- Cabe en GPU de consumo: sí, en RTX 4090/3090 con cuantizaciones Q4-Q5; en GPUs de 12-16 GB con Q3 o Q2.
- Opciones de despliegue: llama.cpp, Ollama, llama-cpp-python, LM Studio y cualquier runtime compatible con GGUF. vLLM y TGI no soportan GGUF de forma nativa en todas sus versiones.
- Latencia y throughput: no disponible. Al ser un MoE con ~4B activos, el throughput debería ser superior al de un modelo denso de 26B, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| Lunar-Memories-26B-A4B-GGUF | 26B (inferido) | ~4B (inferido) | no disponible | no disponible | GGUF |
| Mixtral 8x7B (GGUF) | 46,7B | ~12,9B | 32K | Apache 2.0 | GGUF |
| Qwen1.5-MoE-A2.7B (GGUF) | 14,3B | 2,7B | 32K | Apache 2.0 | GGUF |
| Phi-3-medium (GGUF) | 14B | denso | 4K | MIT | GGUF |

La comparación es orientativa: los datos del modelo Lunar no están confirmados y las alternativas citadas son modelos con documentación pública y licencias permisivas, algo de lo que carece este repositorio.

## Limitaciones y advertencias

- Ausencia total de model card: no hay información sobre entrenamiento, datos, sesgos ni evaluación, lo que impide un uso responsable en producción.
- Licencia no declarada: no se puede asumir uso comercial permitido; el modelo base podría tener restricciones desconocidas.
- Idiomas no documentados: no se puede garantizar calidad en castellano ni en ningún otro idioma.
- Riesgo de alucinación: inherente a los modelos de lenguaje y agravado por la falta de evaluación publicada.
- Degradación por cuantización: las variantes Q2_K y Q3_K pueden perder calidad de forma notable; se recomienda Q4_K_M o superior para uso serio.
- Procedencia del modelo base incierta: el repositorio Sorihon/Lunar-Memories-26B-A4B no cuenta con métricas de descargas ni likes, lo que dificulta verificar su origen y calidad.
- Sin soporte multimodal confirmado: el flag `skip_mmproj` sugiere que no hay visión u otros componentes multimodales.
- Fecha de creación futura (2026-11-26) en los metadatos: inconsistencia que conviene verificar antes de confiar en el repositorio.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Lunar-Memories-26B-A4B-GGUF
- Modelo base: https://huggingface.co/Sorihon/Lunar-Memories-26B-A4B
- llama.cpp (runtime GGUF): https://github.com/ggerganov/llama.cpp
- Ollama: https://ollama.com
