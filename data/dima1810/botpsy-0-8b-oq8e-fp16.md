# dima1810/BotPsy-0.8B-oQ8e-fp16

## Resumen

BotPsy-0.8B-oQ8e-fp16 es una versión cuantizada del modelo BotPsy-0.8B, publicada por el usuario dima1810 en Hugging Face. Se trata de un checkpoint de aproximadamente 853 millones de parámetros (852.985.920 según los pesos en safetensors) que conserva un componente de visión de unos 101 millones de parámetros, lo que indica que el modelo base es multimodal. La cuantización se ha realizado con la herramienta oQ (oMLX v0.8.0rc1), que aplica precisión mixta por tensor.

El modelo está empaquetado en formato MLX, la librería de Apple para ejecutar modelos en silicio de la serie M, y está pensado explícitamente para Macs con chips M1 y M2. El autor indica que esta variante fp16 de los pesos en FP32 ofrece mayor throughput en esos procesadores que la versión oQ8e estándar, mientras que en otros equipos la diferencia es despreciable.

La relevancia de esta ficha es limitada pero concreta: es un ejemplo de cuantización de precisión mixta sobre un modelo pequeño multimodal, con una media efectiva de 11,276 bits por peso y un tamaño de repositorio de 1,2 GB. No hay información pública sobre el modelo base, los datos de entrenamiento ni los benchmarks, por lo que la mayoría de apartados técnicos quedan marcados como no disponibles.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (tag `qwen3_5` en Hugging Face, sin confirmar) |
| Parámetros totales | 852.985.920 (0,853B) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Precisión mixta oQ: affine 8-bit grupo 64 (88,149% de los pesos), FP16 (0,058%), FP32 (11,793%); media efectiva 11,276 bits/peso |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors en formato MLX (librería `mlx`) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura del modelo base más allá del tag `qwen3_5` asociado al repositorio, que sugiere una familia Qwen 3.5, y de la presencia de un módulo de visión de 0,101B parámetros (0,402 GB en FP32). El desglose de almacenamiento distingue un componente de lenguaje de 0,752B parámetros y un componente de visión de 0,101B, lo que confirma que el checkpoint es multimodal, aunque no se detalla el mecanismo de fusión ni el tipo de encoder visual.

El proceso de cuantización sí está documentado: se aplicó oQ de oMLX v0.8.0rc1 con precisión mixta, dejando la mayor parte de los pesos en affine 8-bit con grupo de 64 (8,50 bits/peso efectivos), un 11,793% de los pesos en FP32 (32 bits/peso) y una fracción residual en FP16. No hay información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF, DPO u otras fases de alineamiento.

## Capacidades

- Generación de texto y razonamiento: presumiblemente heredadas del modelo base, aunque no se documentan explícitamente.
- Procesamiento de visión: el checkpoint incluye un módulo visual de 0,101B parámetros, por lo que se espera soporte de entrada de imágenes, sin detalle sobre tareas concretas.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Modos especiales (thinking, audio, etc.): no disponible.

## Casos de uso

- Inferencia local en Macs con chip M1 o M2: el autor recomienda esta variante para esos procesadores por su mayor throughput; el modelo ocupa 1,2 GB, por lo que cabe holgadamente en la memoria unificada de cualquier Mac moderno.
- Prototipado rápido de aplicaciones multimodales en entornos Apple: al estar en formato MLX, se integra directamente con el stack `mlx` y permite iterar sobre tareas de visión y lenguaje sin infraestructura GPU dedicada.
- Evaluación de técnicas de cuantización de precisión mixta: el desglose por tipo de almacenamiento (affine 8-bit, FP16, FP32) sirve como caso de estudio para quien quiera medir el impacto de oQ en un modelo pequeño.
- Pruebas de concepto de asistentes conversacionales ligeros: con 0,853B parámetros, el modelo es adecuado para demos de chat en local, siempre que se valide previamente su calidad real.
- Experimentación educativa con modelos multimodales pequeños: útil en docencia o investigación para estudiar el comportamiento de un modelo de menos de mil millones de parámetros con componente visual.
- Despliegue en pipelines de CI para pruebas de regresión de cuantización: el tamaño reducido permite incluirlo en flujos automatizados que verifiquen la coherencia de pesos y salidas tras recuantizar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: 1,2 GB de almacenamiento para los pesos; en memoria unificada de Apple se necesita espacio adicional para el contexto y las activaciones, no cuantificado.
- GPU recomendadas: el autor apunta explícitamente a chips Apple M1 y M2; no se mencionan GPU NVIDIA.
- Compatibilidad con GPU de consumo: no hay datos para RTX 4090 u otras GPU NVIDIA, ya que el formato es MLX y no estándar para CUDA.
- Opciones de despliegue: librería `mlx` (formato nativo del checkpoint); no se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; el autor solo afirma cualitativamente que esta variante es más rápida que oQ8e en M1/M2.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| BotPsy-0.8B-oQ8e-fp16 | 0,853B | no disponible | MLX safetensors | no disponible | Cuantización mixta oQ, 11,276 bits/peso |
| BotPsy-0.8B-oQ8e | no disponible | no disponible | MLX safetensors | no disponible | Variante estándar citada por el autor, sin ficha propia en la información disponible |
| Alternativas de ~1B con visión | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificables para establecer comparación |

## Limitaciones y advertencias

- No hay información sobre la licencia, lo que impide determinar si el uso comercial está permitido; debe consultarse el repositorio del modelo base antes de cualquier despliegue en producción.
- El modelo base no está documentado en la información disponible: se desconoce su procedencia, sus datos de entrenamiento y su calidad real.
- Riesgo de alucinación no evaluado: al no haber benchmarks ni evaluaciones publicadas, no se puede estimar la fiabilidad de las salidas.
- Sesgos desconocidos: sin model card del modelo original ni evaluación de sesgos, no es posible valorar comportamientos discriminatorios o tóxicos.
- Limitaciones de contexto e idioma no disponibles: no se especifica la ventana de contexto ni los idiomas cubiertos.
- El formato MLX limita el despliegue a entornos Apple; no es directamente portable a CUDA sin conversión.
- El repositorio tiene 0 descargas y 0 likes, y fue creado y actualizado el mismo día (17 de noviembre de 2026), lo que indica que no ha pasado por validación de la comunidad.
- La cuantización mixta con un 11,793% de pesos en FP32 puede introducir discrepancias respecto al modelo original que no han sido medidas públicamente.

## Enlaces

- Hugging Face: https://huggingface.co/dima1810/BotPsy-0.8B-oQ8e-fp16
- Repositorio de la herramienta de cuantización oQ (oMLX): https://github.com/jundot/omlx
