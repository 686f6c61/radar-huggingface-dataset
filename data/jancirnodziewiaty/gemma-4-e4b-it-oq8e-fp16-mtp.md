# jancirnodziewiaty/gemma-4-E4B-it-oQ8e-fp16-mtp

## Resumen

gemma-4-E4B-it-oQ8e-fp16-mtp es una cuantización mixta del modelo multimodal Gemma 4 E4B instruido, publicada por el usuario jancirnodziewiaty. El checkpoint conserva los tres componentes del modelo original (lenguaje, visión y audio) más una cabeza MTP (multi-token prediction) destinada a decodificación especulativa, y emplea la herramienta oQ de oMLX v0.7.3 para asignar precisión por tensor: pesos en affine 8-bit con grupo de 64 para la mayor parte de la red, BF16 para la cabeza MTP y FP32 para algunas capas sensibles.

El resultado es un checkpoint de 8.020 millones de parámetros lógicos que ocupa 9.298 GiB en disco, con un promedio efectivo de 9.959 bits por peso. Frente a una cuantización uniforme de 8 bits, el enfoque mixto preserva en mayor precisión los tensores críticos, lo que suele traducirse en menor degradación en tareas de razonamiento y en la torre de visión.

La relevancia de esta publicación es doble: por un lado permite ejecutar un modelo de la familia Gemma 4 con capacidades multimodales en hardware Apple Silicon mediante MLX; por otro, la inclusión de la cabeza MTP abre la puerta a decodificación especulativa, que puede aumentar el throughput de generación sin cambiar el modelo base. No obstante, el autor no ha publicado datos de evaluación, licencia explícita ni idiomas soportados en la model card, por lo que su uso en producción exige verificar previamente esos extremos contra el modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (lenguaje + visión + audio) con cabeza MTP; detalles de capas y atención no disponibles |
| Parametros totales | 8.019.880.782 (8.020B lógicos) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Mixta oQ: affine 8-bit grupo 64 (93,123% de los pesos), BF16 (0,979%), FP16 (0,007%), FP32 (5,888%), I64 (0,003%); promedio efectivo 9,959 bits/peso |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (librería MLX) |

Desglose de almacenamiento por componente:

| Componente | Pesos lógicos | Almacenamiento |
|---|---|---|
| Modelo de lenguaje | 7,469B | 7,391 GiB |
| Visión | 0,167B | 0,623 GiB |
| Audio | 0,305B | 1,136 GiB |
| Cabeza MTP | 0,079B | 0,148 GiB |
| Total | 8,020B | 9,298 GiB |

## Arquitectura y entrenamiento

El checkpoint deriva de Gemma 4 E4B-it, un modelo multimodal que integra un modelo de lenguaje con torres de visión y audio, según se deduce del desglose de pesos publicado (7,469B en lenguaje, 0,167B en visión, 0,305B en audio). La model card no detalla el número de capas, el mecanismo de atención ni la composición del corpus de entrenamiento del modelo base, por lo que esos datos deben consultarse en la documentación oficial de Gemma 4.

La innovación principal de esta publicación es la cuantización mixta con oQ (oMLX v0.7.3), que asigna 8 bits con grupo de 64 a la mayoría de los tensores, mantiene en BF16 la cabeza MTP y eleva a FP32 cerca del 5,9% de los pesos, presumiblemente capas normalizadoras y parámetros sensibles a la precisión. Además, la cabeza MTP de 0,079B parámetros está pensada para predicción multi-token y decodificación especulativa, una técnica que permite proponer varios tokens por paso y validarlos en paralelo para reducir la latencia. No se han publicado detalles sobre el proceso de alineación (RLHF, DPO) ni sobre el volumen de tokens de entrenamiento.

## Capacidades

- Generación de texto y razonamiento conversacional en modo instruido (sufijo `-it`).
- Procesamiento de imágenes mediante la torre de visión incluida en el checkpoint.
- Procesamiento de audio mediante la torre de audio incluida en el checkpoint.
- Decodificación especulativa gracias a la cabeza MTP, orientada a acelerar la inferencia.
- Ejecución nativa en Apple Silicon a través de MLX.
- Soporte de tool calling, agentes o razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Modo thinking explícito: no disponible en la información proporcionada.

## Casos de uso

- Inferencia local en Mac con Apple Silicon: el checkpoint en formato MLX y 9,3 GiB permite cargar el modelo en equipos con memoria unificada de 16 GB o más, útil para prototipado sin depender de GPUs dedicadas.
- Asistentes multimodales de escritorio: al incluir visión y audio, puede emplearse en aplicaciones que reciban capturas de pantalla o fragmentos de voz y devuelvan respuestas textuales, todo en local.
- Aceleración de generación con MTP: en servicios de chat con requisitos de latencia ajustados, la cabeza MTP permite decodificación especulativa para reducir el tiempo por token en comparación con decodificación autoregresiva estándar.
- Transcripción y análisis de reuniones: la torre de audio combinada con el modelo de lenguaje permite resumir o extraer acciones de grabaciones, siempre que se valide la calidad de la transcripción en el idioma objetivo.
- Procesamiento de documentos con imágenes: extracción de información de facturas, formularios o capturas mediante la torre de visión, con el modelo de lenguaje estructurando la salida.
- Investigación sobre cuantización mixta: sirve como referencia para estudiar el impacto de asignar FP32 a un subconjunto de pesos frente a cuantizaciones uniformes de 8 bits en modelos multimodales.
- Base para ajuste fino con LoRA en MLX: al estar en formato MLX y ocupar menos de 10 GB, es viable experimentar con adaptadores de bajo rango en hardware de consumo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: al menos 10-12 GB libres para cargar los 9,3 GiB de pesos más overhead de activaciones y caché KV; se recomienda 16 GB o más para contextos largos.
- GPU recomendadas: no disponible para CUDA; el checkpoint está en formato MLX y está pensado para Apple Silicon (series M1, M2, M3, M4).
- Compatibilidad con GPU de consumo: no aplicable en el formato actual; para RTX 4090 u otras GPUs NVIDIA sería necesario reconvertir los pesos a otro formato, lo que no se documenta en la model card.
- Opciones de despliegue: MLX (librería `mlx`), con el ecosistema oMLX; vLLM, llama.cpp, Ollama y TGI no soportan directamente este formato sin conversión.
- Latencia y throughput: no disponibles; la cabeza MTP está diseñada para mejorar el throughput mediante decodificación especulativa, pero no se han publicado cifras.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Multimodal | Licencia | Formato |
|---|---|---|---|---|---|
| gemma-4-E4B-it-oQ8e-fp16-mtp | 8,020B | no disponible | Sí (visión y audio) | no disponible | safetensors MLX |
| Gemma 4 E4B-it (original) | no disponible en la información | no disponible | Sí | no disponible en la información | no disponible |
| Otras cuantizaciones de Gemma 4 E4B | no disponible | no disponible | Sí | no disponible | no disponible |

No se dispone de datos de rendimiento ni de especificaciones completas de alternativas en la información proporcionada, por lo que la comparación cuantitativa no es posible.

## Limitaciones y advertencias

- La model card no declara licencia; antes de cualquier uso comercial debe verificarse la licencia del modelo Gemma 4 original y los términos de uso de Google.
- No se han publicado evaluaciones que cuantifiquen la degradación introducida por la cuantización mixta frente al modelo en BF16.
- Riesgo de alucinación inherente al modelo base; no se documentan mitigaciones específicas en esta publicación.
- Idiomas soportados no declarados; el rendimiento fuera del inglés o de los idiomas cubiertos por Gemma 4 puede ser inferior.
- Longitud de contexto no disponible; planificar despliegues con contextos largos requiere consultar la ficha del modelo original.
- El checkpoint está atado al ecosistema MLX; no es directamente utilizable en vLLM, TGI, llama.cpp u Ollama sin conversión.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia comunitaria de validación del checkpoint.
- La cabeza MTP requiere un runtime que implemente decodificación especulativa; en su ausencia, añade peso sin beneficio de latencia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jancirnodziewiaty/gemma-4-E4B-it-oQ8e-fp16-mtp
- Herramienta oQ / oMLX: https://github.com/jundot/omlx
- Documentación de Gemma 4: no disponible en la información proporcionada
- Paper o blog del modelo base: no disponible en la información proporcionada
