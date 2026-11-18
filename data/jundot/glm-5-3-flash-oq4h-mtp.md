# Jundot/GLM-5.3-Flash-oQ4h-mtp

## Resumen

GLM-5.3-Flash-oQ4h-mtp es una cuantización mixta de precisión del modelo multimodal zai-org/GLM-5.3-Flash, publicada por el usuario Jundot mediante su herramienta oQ (oMLX). El modelo base es el primer modelo nativamente multimodal de la serie GLM-5, con arquitectura de mezcla de expertos (MoE) de 320.000 millones de parámetros totales y 18.000 millones activos, que combina atención dispersa y lineal con Manifold-Constrained Hyper-Connections. Esta versión cuantizada conserva el modelo de lenguaje, el codificador de visión y la cabeza de predicción multi-token (MTP).

La relevancia de esta ficha radica en que permite ejecutar un modelo multimodal de escala frontier en hardware Apple Silicon mediante MLX, reduciendo el peso lógico de 321.300 millones de parámetros a un checkpoint de 173,46 GiB con un promedio efectivo de 4,637 bits por peso. La cuantización oQh aplica una transformación de Hadamard a los pesos de los expertos antes de cuantizarlos, lo que reduce el número de escalas necesarias y permite dedicar el espacio ahorrado a más bits en las capas más sensibles.

El checkpoint requiere oMLX 0.8.0 o superior con soporte oQh; versiones anteriores no pueden cargarlo. Está publicado bajo licencia MIT, siguiendo el modelo fuente, e incluye la cabeza MTP para decodificación especulativa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE multimodal (atención dispersa y lineal, Manifold-Constrained Hyper-Connections) con codificador de visión y cabeza MTP |
| Parametros totales | 321.323 millones (lógicos en el checkpoint); 62.065.142.622 según safetensors del repo |
| Parametros activos | 18.000 millones (modelo base) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | oQh 4-bit grupo 128, oQh 5-bit grupo 128, affine 8-bit grupo 64, affine 4-bit grupo 64, BF16 y FP32 en componentes concretos |
| Idiomas soportados | no disponible (la model card menciona prompts de evaluación en 7 idiomas vía FLORES+ y Aya) |
| Licencia | MIT |
| Formato de pesos | safetensors (MLX), cuantización mixta oQh |

## Arquitectura y entrenamiento

El modelo base GLM-5.3-Flash emplea una arquitectura de mezcla de expertos con atención dispersa y lineal, e incorpora Manifold-Constrained Hyper-Connections, una variante de conexiones residuales con restricciones de variedad. Es el primer modelo de la serie GLM-5 nativamente multimodal: integra un codificador de visión de 0,564.000 millones de parámetros lógicos y una cabeza de predicción multi-token (MTP) de 7,433.000 millones, además del backbone lingüístico de 313,327.000 millones. Los detalles sobre volumen de tokens de entrenamiento, composición del dataset y uso de RLHF o DPO no están disponibles en la información proporcionada.

La cuantización oQh parte del presupuesto de oQ4 y redistribuye los bytes ahorrados en las escalas de grupo hacia códigos más anchos en los tensores más estrechos y sensibles. La atención, los expertos compartidos, el embedding de tokens y la cabeza de salida se mantienen en grupos afines de 8 bits; los expertos enrutados de la cabeza MTP en grupos afines de 4 bits; y el codificador de visión en BF16. La distribución resultante es: 71,427% de los pesos lógicos en oQh 4-bit (4,25 bits efectivos), 23,308% en oQh 5-bit (5,25 bits), 2,793% en affine 8-bit (8,50 bits), 2,256% en affine 4-bit (4,50 bits), 0,189% en BF16 y 0,027% en FP32. El promedio efectivo es de 4,617 bits por peso en el backbone lingüístico y 4,637 bits en el checkpoint completo.

## Capacidades

- Generación de texto y conversación multi-turno.
- Procesamiento de imagen y texto combinados (pipeline image-text-to-text): el checkpoint incluye el codificador de visión.
- Razonamiento y matemáticas (capacidad heredada del modelo base, sin datos de benchmark disponibles).
- Generación de código: la model card evalúa la degradación de cuantización sobre código Python.
- Decodificación especulativa mediante la cabeza MTP incluida en el checkpoint.
- Capacidades multilingües: la evaluación de calidad cubre 7 idiomas mediante FLORES+ y Aya, aunque la lista exacta no está disponible.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.

## Casos de uso

- Inferencia local multimodal en Apple Silicon: el checkpoint de 173,46 GiB permite ejecutar un modelo de 320.000 millones de parámetros totales y 18.000 millones activos en equipos con memoria unificada suficiente, usando oMLX 0.8.0 o superior.
- Análisis de documentos con imagen y texto: al incluir el codificador de visión en BF16, el modelo puede procesar capturas, diagramas o páginas escaneadas junto con instrucciones textuales en un mismo flujo.
- Generación de código en local: la cuantización oQh reduce la divergencia KL frente al modelo FP8 un 16% en código Python respecto a oQe en el nivel oQ4, lo que la hace adecuada para asistentes de programación en entornos sin GPU dedicada.
- Traducción y procesamiento multilingüe: la evaluación con FLORES+ en 7 idiomas y la paridad de divergencia KL con oQe en oQ4 respaldan su uso en tareas de traducción automática local.
- Decodificación especulativa de baja latencia: la cabeza MTP incluida permite acelerar la generación mediante predicción multi-token en el runtime oMLX.
- Experimentación e investigación en cuantización: la distribución mixta de bits documentada (4-bit, 5-bit, affine 8-bit, BF16) sirve como referencia reproducible para estudiar el impacto de la precisión mixta en modelos MoE multimodales.
- Despliegue en entornos con requisitos de licencia permisiva: la licencia MIT facilita la integración en productos comerciales sin las restricciones habituales de los modelos frontier.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card únicamente reporta divergencia KL frente al modelo FP8 original, comparando oQe con oQh:

| Nivel | Tamano | FLORES+ KL (oQe -> oQh) | Aya KL (oQe -> oQh) | Codigo KL (oQe -> oQh) |
|---|---|---|---|---|
| oQ2 | 98,6 GiB | 0,34 -> 0,24 (-28%) | 0,80 -> 0,69 (-14%) | 0,25 -> 0,19 (-24%) |
| oQ3 | 134,1 GiB | 0,13 -> 0,11 (-15%) | 0,41 -> 0,37 (-10%) | 0,10 -> 0,11 (+5%) |
| oQ4 | 169,4 GiB | 0,069 -> 0,070 (+2%) | 0,25 -> 0,25 (-1%) | 0,068 -> 0,057 (-16%) |

## Requisitos de hardware

- Almacenamiento: el repo ocupa 186,3 GB; el checkpoint completo pesa 173,461 GiB (186,252 GB), con 168,398 GiB para el backbone lingüístico, 1,050 GiB para el codificador de visión y 4,013 GiB para la cabeza MTP.
- Memoria para inferencia: se requiere memoria unificada suficiente para cargar al menos los 173,461 GiB del checkpoint, más el overhead del runtime; no se especifica una cifra exacta de VRAM en la información proporcionada.
- GPU recomendadas: el formato es MLX, por lo que el hardware objetivo es Apple Silicon con memoria unificada; no se dispone de datos para GPU NVIDIA (A100, H100, RTX 4090).
- Compatibilidad con GPU de consumo: no disponible; el tamaño del checkpoint excede la memoria de cualquier GPU de consumo convencional.
- Opciones de despliegue: exclusivamente oMLX 0.8.0 o superior con soporte oQh. Otros motores MLX no pueden cargar el formato oQh, aunque el nivel oQe del mismo modelo usa el formato MLX estándar.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros totales / activos | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GLM-5.3-Flash-oQ4h-mtp (esta ficha) | 321,323B / 18B | no disponible | MLX oQh, 4,637 bits/peso | MIT | Hugging Face, requiere oMLX >= 0.8.0 |
| zai-org/GLM-5.3-Flash (base) | 320B / 18B | no disponible | Pesos originales (FP8 según la model card) | MIT | Hugging Face |
| Variantes oQe del mismo modelo | 320B / 18B | no disponible | MLX estándar | MIT | Hugging Face |
| Alternativas de otros fabricantes | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Dependencia estricta de runtime: el formato oQh solo lo carga oMLX 0.8.0 o superior; versiones anteriores fallan al cargar el checkpoint.
- Degradación por cuantización: aunque la divergencia KL es baja en oQ4 (0,070 en FLORES+, 0,25 en Aya, 0,057 en código), no es nula; en oQ3 la calidad en código empeora un 5% respecto a oQe.
- Sesgos conocidos: no disponibles en la información proporcionada.
- Riesgo de alucinación: no cuantificado en la información proporcionada; aplica el riesgo inherente a los modelos de lenguaje de gran escala.
- Limitaciones de contexto e idioma: la longitud de contexto no está documentada y la lista completa de idiomas soportados no está disponible.
- Licencia: MIT, permisiva para uso comercial, siguiendo el modelo fuente; debe conservarse el archivo LICENSE.
- Requisitos de memoria: el checkpoint de 173,461 GiB limita el despliegue a equipos con memoria unificada muy alta; no es viable en GPU de consumo.
- Madurez del artefacto: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación comunitaria documentada.

## Enlaces

- Hugging Face: https://huggingface.co/Jundot/GLM-5.3-Flash-oQ4h-mtp
- Modelo base: https://huggingface.co/zai-org/GLM-5.3-Flash
- Repositorio oMLX (herramienta de cuantización oQ): https://github.com/jundot/omlx
- Pull request del formato oQh: https://github.com/jundot/omlx/pull/5317
