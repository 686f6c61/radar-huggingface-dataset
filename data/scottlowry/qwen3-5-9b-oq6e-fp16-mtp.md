# scottlowry/Qwen3.5-9B-oQ6e-fp16-mtp

## Resumen

Qwen3.5-9B-oQ6e-fp16-mtp es una cuantización mixta del modelo base Qwen/Qwen3.5-9B, publicada por el usuario scottlowry en Hugging Face. No se trata de un modelo entrenado desde cero, sino de un checkpoint derivado cuyo interés principal reside en la técnica de compresión aplicada: cuantización de precisión mixta mediante la herramienta oQ (oMLX v0.7.4.dev1), que combina bloques afines de 6 y 8 bits con capas residuales en FP16 y FP32 para preservar la calidad del modelo original con un peso medio efectivo de 7,928 bits por parámetro.

El checkpoint conserva la arquitectura completa del modelo base, incluyendo el componente de visión (0,456B de parámetros lógicos almacenados en FP32) y una cabeza MTP (multi-token prediction) de 0,243B, lo que sugiere que el modelo original incorpora decodificación especulativa nativa. El total de parámetros es de 9.653.104.368, con un almacenamiento efectivo de 8,909 GiB, muy por debajo de lo que ocuparía el modelo en FP16.

La relevancia de esta ficha radica en que ejemplifica el ecosistema de cuantizaciones comunitarias para Apple Silicon (formato MLX), que permiten ejecutar modelos de casi 10.000 millones de parámetros en equipos de consumo con memoria unificada. Ahora bien, la información pública disponible es muy limitada: no se especifican licencia, idiomas, contexto ni resultados de evaluación, por lo que muchos apartados de esta ficha deben marcarse como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Qwen3.5, presumiblemente transformer con vision y cabeza MTP; no confirmado en la informacion) |
| Parametros totales | 9.653.104.368 (9,653B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Cuantizacion mixta: affine 6-bit grupo 64 (85,464% de los pesos), affine 8-bit grupo 64 (9,453%), FP16 (0,359%), FP32 (4,724%); media efectiva 7,928 bits/peso |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors con libreria mlx (MLX, Apple Silicon) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo base Qwen/Qwen3.5-9B en la documentación proporcionada. El desglose de almacenamiento del checkpoint cuantizado revela tres componentes diferenciados: un modelo de lenguaje de 8,954B de parámetros lógicos, un módulo de visión de 0,456B y una cabeza MTP (multi-token prediction) de 0,243B. La presencia de este último componente indica que el modelo base incorpora predicción multi-token, una técnica habitualmente asociada a decodificación especulativa para acelerar la generación.

El proceso de cuantización se realizó con oQ, la herramienta de cuantización de precisión mixta del proyecto oMLX (jundot/omlx), en su versión v0.7.4.dev1. La estrategia asigna 6 bits con grupo de 64 a la gran mayoría de los pesos (8,250B), reserva 8 bits para 0,913B de parámetros presumiblemente más sensibles, mantiene 0,035B en FP16 y deja 0,456B en FP32, que coinciden exactamente con el tamaño del módulo de visión. No se han publicado detalles sobre los datos de entrenamiento del modelo base, el número de tokens, la composición del dataset ni si hubo fases de RLHF o DPO.

## Capacidades

- Generación de texto y razonamiento: capacidades heredadas del modelo base Qwen3.5-9B, aunque no se documentan evaluaciones específicas en la información disponible.
- Procesamiento de visión: el checkpoint incluye un módulo de visión de 0,456B de parámetros, lo que implica soporte multimodal de entrada de imágenes (no confirmado explícitamente en la model card).
- Predicción multi-token (MTP): la cabeza MTP de 0,243B sugiere soporte de decodificación especulativa o generación multi-token, orientada a reducir latencia.
- Ejecución en Apple Silicon: empaquetado en formato MLX, lo que permite inferencia nativa en chips de la serie M de Apple.
- Tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Modo thinking, audio u otras capacidades especiales: no disponible en la información proporcionada.

## Casos de uso

- Inferencia local en Mac con memoria unificada: gracias a sus 8,909 GiB de almacenamiento efectivo, el modelo puede cargarse en equipos Apple Silicon con 16 GB o más de memoria unificada, permitiendo prototipado y uso personal sin GPU dedicada.
- Asistentes de escritorio con entrada visual: el módulo de visión incluido permite construir aplicaciones que procesen capturas de pantalla o imágenes junto con texto, siempre que el modelo base confirme dicha capacidad.
- Generación de texto asistida de baja latencia: la cabeza MTP está diseñada para acelerar la decodificación, lo que resulta adecuado para aplicaciones interactivas donde la latencia por token es crítica.
- Evaluación comparativa de técnicas de cuantización: el checkpoint sirve como referencia para medir la degradación de calidad de la cuantización mixta oQ frente al modelo base en FP16, útil para investigadores que estudien compresión de modelos.
- Despliegue en pipelines de investigación con MLX: integrable en scripts de experimentación que ya utilicen la librería MLX de Apple, sin necesidad de convertir formatos.
- Fine-tuning ligero o adaptación posterior: al conservar pesos en safetensors y componentes en mayor precisión (FP16/FP32), puede servir de punto de partida para ajustes con LoRA en entornos MLX, aunque la cuantización limita la actualización directa de pesos.
- Distribución de demos offline: su tamaño contenido permite incluirlo en paquetes de demostración que se ejecuten sin conexión en portátiles Apple.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada para inferencia: aproximadamente 8,9 GiB solo para los pesos; con overhead de contexto y buffers, se recomienda un mínimo de 12-16 GB de memoria unificada.
- GPU recomendadas: exclusivamente Apple Silicon (serie M1, M2, M3, M4 y variantes Pro, Max y Ultra) por el formato MLX; no es directamente compatible con CUDA sin conversión.
- ¿Cabe en GPU de consumo? Sí, en equipos Apple con 16 GB o más de memoria unificada. En GPUs NVIDIA de consumo requeriría conversión a otro formato (por ejemplo GGUF), no incluida en este repositorio.
- Opciones de despliegue: MLX y mlx-lm para Apple Silicon. No se proporcionan pesos en GGUF, por lo que llama.cpp, Ollama o TGI no son utilizables directamente con este checkpoint.
- Latencia y throughput estimados: no disponibles; dependerán del chip Apple concreto y de la implementación de la cabeza MTP.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3.5-9B-oQ6e-fp16-mtp (este) | 9,653B | no disponible | MLX safetensors, ~8,9 GiB | no disponible | Cuantización mixta 6/8 bits con vision y MTP |
| Qwen/Qwen3.5-9B (base) | ~9,65B (presumible) | no disponible | safetensors | no disponible | Modelo original sin cuantizar; referencia de calidad |
| Otras cuantizaciones comunitarias del mismo base (por ejemplo, GGUF de 6 bits) | ~9,65B | no disponible | GGUF | depende del autor | Ejecutables en llama.cpp/Ollama, no en MLX nativo |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- La cuantización mixta introduce una pérdida de precisión respecto al modelo base; no se han publicado evaluaciones que cuantifiquen esa degradación.
- La licencia no está especificada en la información disponible, por lo que no puede confirmarse el uso comercial; debe consultarse la licencia del modelo base Qwen/Qwen3.5-9B antes de cualquier despliegue en producción.
- El formato MLX limita el uso a hardware Apple Silicon; no hay pesos GGUF ni compatibilidad directa con CUDA.
- No se documentan idiomas soportados, longitud de contexto ni capacidades de tool calling, lo que impide garantizar su idoneidad para aplicaciones multilingües o agentes.
- Riesgo de alucinación: inherente a los modelos de lenguaje; no se han publicado evaluaciones de fiabilidad para este checkpoint.
- Sesgos conocidos: no disponibles en la información proporcionada.
- El repositorio tiene un número muy bajo de descargas (48) y ningún "like", lo que reduce la validación comunitaria de su calidad.
- La model card advierte de que fue re-cuantizado el 2026-11-11; copias anteriores deben descargarse de nuevo, lo que indica posibles cambios entre versiones.

## Enlaces

- [Hugging Face: scottlowry/Qwen3.5-9B-oQ6e-fp16-mtp](https://huggingface.co/scottlowry/Qwen3.5-9B-oQ6e-fp16-mtp)
- [Modelo base: Qwen/Qwen3.5-9B](https://huggingface.co/Qwen/Qwen3.5-9B)
- [Herramienta de cuantización oQ (oMLX)](https://github.com/jundot/omlx)
