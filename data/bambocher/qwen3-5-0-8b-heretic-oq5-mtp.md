# bambocher/Qwen3.5-0.8B-heretic-oQ5-mtp

## Resumen

Qwen3.5-0.8B-heretic-oQ5-mtp es una versión cuantizada y "decensored" del modelo Qwen3.5-0.8B de Alibaba Qwen, publicada por el usuario bambocher en Hugging Face. El modelo original es un transformer multimodal de 0,8 mil millones de parámetros que incluye un cabezal de visión y un cabezal de predicción multi-token (MTP). Esta variante aplica la herramienta Heretic v2.0.0 para eliminar los comportamientos de rechazo del modelo original, manteniendo intacto el cabezal MTP, y posteriormente lo cuantiza con oMLX v0.7.3 usando cuantización de precisión mixta.

La relevancia de esta ficha radica en que combina tres transformaciones sobre un modelo base pequeño: eliminación de rechazos mediante ablación de rangos arbitrarios (ARA), cuantización mixta agresiva (media efectiva de 6,909 bits por peso) y preservación del cabezal MTP para decodificación especulativa. El resultado es un checkpoint de 0,873B parámetros lógicos que ocupa solo 0,703 GiB en disco, pensado para ejecutarse en Apple Silicon mediante la librería MLX.

No se dispone de información sobre la licencia, los idiomas soportados ni la pipeline de la versión publicada. El repositorio tiene 49 descargas y 0 likes, lo que sugiere un uso muy limitado y sin validación comunitaria significativa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Qwen3.5) con cabezal de visión y cabezal MTP (multi-token prediction) |
| Parametros totales | 873.438.784 (0,873B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Mixta: affine 5-bit grupo 64 (77,193% de pesos), affine 6-bit grupo 64 (8,047%), affine 8-bit grupo 64 (2,945%), BF16 (11,815%); media efectiva 6,909 bits/peso |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (librería MLX) |

## Arquitectura y entrenamiento

El modelo base Qwen3.5-0.8B es un transformer de 0,8B parámetros con componentes multimodales: el desglose de almacenamiento indica 0,752B parámetros lógicos en el modelo de lenguaje, 0,101B en el módulo de visión y 0,020B en el cabezal MTP. La presencia del cabezal MTP sugiere que el modelo original está diseñado para decodificación especulativa o predicción de múltiples tokens por paso, una técnica que acelera la inferencia autoregresiva.

Sobre el proceso de modificación: se aplicó Heretic v2.0.0 con ablación de rangos arbitrarios (ARA) entre las capas 1 y 19, con parámetros concretos (preserve_good_behavior_weight 0,8199; steer_bad_behavior_weight 0,0001; overcorrect_relative_weight 1,0547; neighbor_count 14) para eliminar los rechazos. Posteriormente se cuantizó con oMLX v0.7.3 en precisión mixta, asignando 5 bits a la mayoría de pesos y manteniendo en BF16 el 11,8% de los mismos (presumiblemente capas sensibles). No se dispone de información sobre los datos de entrenamiento originales, el número de tokens, la composición del dataset ni si hubo RLHF o DPO.

## Capacidades

- Generación de texto y razonamiento general, heredadas del modelo base Qwen3.5-0.8B.
- Procesamiento de visión: el checkpoint incluye un módulo de visión de 0,101B parámetros, por lo que se espera soporte de entrada de imágenes (no confirmado en la model card).
- Predicción multi-token (MTP): el cabezal MTP se mantiene intacto, lo que permite decodificación especulativa y potencial aceleración de inferencia.
- Eliminación de rechazos: el modelo reporta 0/100 rechazos frente a 97/100 del original, lo que implica que responde a solicitudes que el modelo base rechazaría.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Modo thinking: no disponible en la información proporcionada.

## Casos de uso

- Inferencia local en Apple Silicon: el checkpoint de 0,703 GiB y el formato MLX lo hacen adecuado para ejecutarse en Macs con memoria unificada, usando la librería MLX y el ecosistema oMLX para cargar pesos cuantizados en precisión mixta.
- Investigación sobre alineación y rechazos: con 0/100 rechazos y una divergencia KL de 0,1412 respecto al original, sirve para estudiar el efecto de la ablación ARA en el comportamiento del modelo y en la distribución de salidas.
- Experimentos de decodificación especulativa: al conservar el cabezal MTP, permite probar técnicas de predicción multi-token y medir su impacto en latencia y throughput sobre un modelo pequeño.
- Prototipado multimodal de bajo coste: el módulo de visión de 0,101B permite experimentar con tareas imagen-texto en entornos con recursos limitados, aunque sin garantías de calidad por el tamaño del modelo.
- Evaluación de cuantización mixta: la distribución 5/6/8 bits más BF16 permite comparar la degradación de calidad frente al modelo original en tareas concretas, útil para validar la estrategia de oMLX.
- Generación de texto sin restricciones en entornos controlados: para pruebas internas de robustez o generación creativa donde los rechazos del modelo base resultan un obstáculo, siempre con revisión humana y sin uso en producción orientada a usuarios finales.

## Benchmarks y rendimiento

La model card solo proporciona métricas del proceso de decensoring, no benchmarks estándar (MMLU, HumanEval, GSM8K, etc.):

| Metrica | Este modelo | Modelo original (Qwen/Qwen3.5-0.8B) |
|---|---|---|
| Rechazos | 0/100 | 97/100 |
| Divergencia KL | 0,1412 | 0 (por definición) |

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,7 GiB para los pesos en el formato cuantizado; el uso real de memoria es mayor por el contexto, los estados de activación y el runtime de MLX.
- GPU recomendadas: el formato MLX está orientado a Apple Silicon (series M1, M2, M3, M4); no se indica soporte para GPU NVIDIA.
- Cabe en GPU de consumo: sí, en cualquier Mac con memoria unificada de 8 GB o superior; también cabría en GPUs de consumo con 4-8 GB si se convirtiera a otro formato, aunque no se proporciona esa conversión.
- Opciones de despliegue: MLX y oMLX (herramienta de cuantización); no se mencionan vLLM, llama.cpp, Ollama ni TGI, y el formato safetensors MLX no es directamente compatible con ellos sin conversión.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen3.5-0.8B-heretic-oQ5-mtp (este) | 0,873B | no disponible | Mixta 5/6/8 bits + BF16 | no disponible | safetensors MLX |
| Qwen/Qwen3.5-0.8B (original) | 0,8B (aprox.) | no disponible | BF16 | no disponible en esta ficha | safetensors |
| Otras variantes Heretic de Qwen | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- La eliminación de rechazos (0/100) implica que el modelo puede generar contenido que el original bloqueaba; requiere filtros y revisión humana si se usa en aplicaciones expuestas a usuarios.
- La divergencia KL de 0,1412 respecto al original indica una alteración medible de la distribución de salidas, con posible degradación de calidad en tareas que dependían del comportamiento alineado.
- Modelo de 0,8B parámetros: capacidad limitada de razonamiento, conocimiento factual y seguimiento de instrucciones complejas en comparación con modelos de mayor tamaño; riesgo elevado de alucinación.
- Licencia no disponible: no puede confirmarse si se permite uso comercial; el modelo base Qwen tiene sus propias condiciones que deben verificarse por separado.
- Idiomas soportados no disponibles: no hay garantía de calidad multilingüe.
- Longitud de contexto no disponible: no se puede planificar su uso en tareas de contexto largo sin verificar el modelo base.
- Formato MLX exclusivo: no es directamente desplegable en vLLM, llama.cpp, Ollama o TGI sin conversión, lo que limita su uso a entornos Apple Silicon.
- Validación comunitaria mínima (49 descargas, 0 likes): no hay evidencia de pruebas independientes de calidad o seguridad.
- La cuantización mixta a 5 bits en el 77% de los pesos puede introducir degradación adicional no cuantificada en la model card.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/bambocher/Qwen3.5-0.8B-heretic-oQ5-mtp
- Modelo original: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Heretic: https://heretic-project.org
- oQ / oMLX: https://github.com/jundot/omlx
