# jancirnodziewiaty/gemma-4-E4B-it-oQ6e-mtp

## Resumen

`gemma-4-E4B-it-oQ6-mtp` es una cuantización mixta de precisión del modelo Gemma 4 E4B instruct, publicada por el usuario jancirnodziewiaty en HuggingFace. Se trata de una conversión a formato MLX (Apple Silicon) mediante la herramienta oQ (oMLX v0.7.3), que aplica cuantización afín de precisión mixta con un promedio efectivo de 7,341 bits por peso sobre un checkpoint de 8.019.880.782 parámetros. El resultado ocupa 7,4 GB en disco, lo que lo hace viable en equipos con memoria unificada de gama alta.

El modelo subyacente, Gemma 4 E4B, es un modelo multimodal de la familia Gemma de Google que integra componentes de lenguaje, visión y audio, además de una cabeza MTP (multi-token prediction) destinada a decodificación especulativa. Esta ficha describe la versión cuantizada, no el modelo original, y por tanto las capacidades heredadas se infieren de la estructura de pesos publicada, no de una model card completa del autor.

La relevancia de esta publicación es práctica: permite ejecutar un modelo multimodal de 8B en hardware Apple Silicon con un consumo de memoria contenido, manteniendo una distribución de bits que preserva en BF16 las capas más sensibles (6,874% de los pesos) mientras comprime el grueso del transformer a 6 bits. No obstante, la ausencia de licencia declarada, de idiomas especificados y de benchmarks publicados limita su uso en producción sin verificación adicional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (lenguaje + visión + audio) con cabeza MTP; pesos en formato MLX |
| Parametros totales | 8.019.880.782 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Afín 6-bit grupo 64 (83,815% de pesos), afín 8-bit grupo 64 (9,308%), BF16 (6,874%), I64 (0,003%); promedio efectivo 7,341 bits/peso |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (MLX), cuantización oQ mixta |

## Arquitectura y entrenamiento

La información disponible corresponde únicamente al proceso de cuantización, no al entrenamiento del modelo base. El checkpoint cuantizado distribuye 8.020B parámetros lógicos en cuatro componentes: modelo de lenguaje (7,469B, 6,256 GB), visión (0,167B, 0,335 GB), audio (0,305B, 0,610 GB) y cabeza MTP (0,079B, 0,159 GB). La presencia de módulos de visión y audio confirma que el modelo base es multimodal, y la cabeza MTP indica soporte para predicción multi-token, técnica habitual para decodificación especulativa y aceleración de inferencia.

La cuantización oQ aplica precisión mixta por tensor: el 83,815% de los pesos (6,722B) se almacena en afín 6-bit con grupo de 64, el 9,308% (0,746B) en afín 8-bit, y un 6,874% (0,551B) permanece en BF16, presumiblemente capas de normalización, embeddings o proyecciones sensibles a la precisión. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si el modelo base utilizó RLHF o DPO.

## Capacidades

- Generación de texto y razonamiento en modo instruct, heredado del modelo Gemma 4 E4B-it.
- Procesamiento de visión: el checkpoint incluye 0,167B parámetros en el módulo visual, lo que sugiere soporte de entrada de imágenes.
- Procesamiento de audio: 0,305B parámetros dedicados a un encoder de audio, lo que indica capacidad de transcripción o comprensión de audio.
- Predicción multi-token (MTP): cabeza de 0,079B parámetros que permite decodificación especulativa para reducir latencia.
- Ejecución en Apple Silicon mediante MLX, con soporte nativo de memoria unificada.
- Tool calling, agentes y multilingüismo: no disponible en la información proporcionada.

## Casos de uso

- Inferencia local en Mac con memoria unificada: el checkpoint de 7,4 GB cabe en equipos con 16 GB o más de RAM unificada, permitiendo ejecutar un modelo multimodal de 8B sin GPU dedicada mediante MLX.
- Prototipado de asistentes multimodales: la combinación de módulos de visión y audio permite construir demos que reciban imagen y audio además de texto, útil para validar pipelines antes de migrar a infraestructura mayor.
- Decodificación especulativa en producción: la cabeza MTP de 0,079B puede emplearse para acelerar la generación en servidores Apple Silicon, reduciendo el número de pasos de decodificación por token emitido.
- Investigación sobre cuantización mixta: la distribución publicada (6-bit, 8-bit y BF16 por tensor) sirve como caso de estudio para evaluar el impacto de la precisión mixta en modelos multimodales.
- Evaluación comparativa de formatos MLX frente a GGUF: permite medir latencia y calidad en el mismo hardware frente a otras conversiones del mismo modelo base.
- Pruebas de regresión de calidad tras cuantización: al conservar BF16 en un 6,874% de los pesos, es adecuado para analizar qué capas requieren mayor precisión en tareas de razonamiento o percepción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM unificada: aproximadamente 7,4 GB para los pesos en disco; en ejecución se requiere margen adicional para el KV cache, por lo que se recomienda un mínimo de 12-16 GB de memoria unificada.
- GPU recomendadas: Apple Silicon (series M1/M2/M3/M4, especialmente variantes Pro, Max y Ultra). No es compatible de forma nativa con CUDA sin reconversión, ya que el formato es MLX.
- Cabe en GPU consumer: sí, en equipos Apple con memoria unificada suficiente; no está pensado para GPUs NVIDIA consumer en su formato actual.
- Opciones de despliegue: MLX (librería `mlx`), `mlx-lm` para el componente de lenguaje; el soporte multimodal depende de las herramientas MLX disponibles para Gemma 4. No se indica compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| gemma-4-E4B-it-oQ6-mtp (este) | 8,02B | no disponible | MLX safetensors cuantizado | no disponible | Cuantización comunitaria, 7,341 bits/peso |
| Gemma 4 E4B-it original | ~8B | no disponible | safetensors BF16 | no disponible en esta ficha | Modelo base multimodal de Google |
| Otras cuantizaciones MLX de Gemma 4 E4B | ~8B | no disponible | MLX 4/6/8-bit | según autor | No se dispone de datos comparativos de calidad |

No se dispone de información suficiente para comparar rendimiento con alternativas de la misma categoría.

## Limitaciones y advertencias

- La licencia no está declarada en el repositorio, lo que impide confirmar si el uso comercial está permitido; debe verificarse la licencia del modelo Gemma 4 original antes de cualquier despliegue.
- No se especifican los idiomas soportados; el comportamiento multilingüe no está garantizado.
- No hay benchmarks publicados para esta cuantización concreta, por lo que se desconoce la degradación de calidad respecto al modelo en BF16.
- El repositorio tiene 0 descargas y 0 likes, y fue creado y actualizado con dos minutos de diferencia, lo que sugiere una publicación reciente sin validación comunitaria.
- La cuantización mixta puede introducir degradaciones no uniformes: las capas en 6-bit podrían afectar tareas de razonamiento fino o percepción multimodal.
- El formato MLX limita el despliegue a hardware Apple Silicon; no es portable directamente a CUDA.
- Riesgo de alucinación inherente al modelo base, no cuantificado en esta ficha.
- No se dispone de información sobre sesgos conocidos del modelo base.

## Enlaces

- [HuggingFace: jancirnodziewiaty/gemma-4-E4B-it-oQ6e-mtp](https://huggingface.co/jancirnodziewiaty/gemma-4-E4B-it-oQ6e-mtp)
- [oQ / oMLX (herramienta de cuantización)](https://github.com/jundot/omlx)
