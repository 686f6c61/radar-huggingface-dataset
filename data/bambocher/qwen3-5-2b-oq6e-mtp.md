# bambocher/Qwen3.5-2B-oQ6e-mtp

## Resumen

bambocher/Qwen3.5-2B-oQ6e-mtp es un checkpoint cuantizado del modelo Qwen3.5-2B publicado por el usuario bambocher en Hugging Face. No es un modelo entrenado desde cero: es una conversión de precisión mixta realizada con oQ (oMLX v0.7.1rc1), una herramienta orientada a la inferencia en Apple Silicon mediante MLX. Conserva 2.274.069.824 parámetros lógicos, ocupa 2,146 GiB y presenta un promedio efectivo de 8,106 bits por peso.

El modelo base pertenece a la familia Qwen3.5 de Alibaba Cloud, descrita en la información disponible como una serie multilingüe con mejoras en razonamiento y seguimiento de instrucciones respecto a Qwen3, y con una base unificada de visión-lenguaje. El checkpoint incluye modelo de lenguaje (1,882B), torre de visión (0,331B) y cabeza MTP (0,061B). Su relevancia está en permitir probar un modelo multimodal de 2B en un Mac con memoria unificada, con un archivo de poco más de 2 GB.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible; el checkpoint Qwen3.5 incluye torre de visión y cabeza MTP |
| Parámetros totales | 2.274.069.824 (2,274B) |
| Parámetros activos | No disponible; no se indica que sea un modelo MoE |
| Longitud de contexto | No disponible |
| Tipos de cuantización | Precisión mixta oQ: affine 6-bit grupo 64 (75,837 % de los pesos), affine 8-bit grupo 64 (9,196 %) y BF16 (14,967 %) |
| Idiomas soportados | No disponible para este checkpoint; la familia base se describe como multilingüe |
| Licencia | No disponible |
| Formato de pesos | safetensors (MLX) |
| Precisión media efectiva | 8,106 bits por peso |
| Tamaño del checkpoint | 2,146 GiB (2,304 GB); repositorio de 2,3 GB |
| Componentes | Lenguaje 1,882B; visión 0,331B; cabeza MTP 0,061B |
| Biblioteca | mlx |
| Descargas y likes | 10 descargas, 0 likes |

## Arquitectura y entrenamiento

La información proporcionada no detalla la arquitectura interna del modelo base: no se especifica si emplea atención completa, atención lineal, SSM o una combinación híbrida, ni el número de capas, cabezas o dimensión oculta. Tampoco se documentan los datos de entrenamiento, el número de tokens, la composición del dataset ni si hubo etapas de RLHF o DPO. Este repositorio es una conversión de pesos, no un entrenamiento nuevo, por lo que esas decisiones corresponden al Qwen3.5-2B original de Alibaba Cloud.

El checkpoint está dividido en tres bloques de pesos: el modelo de lenguaje concentra 1,882B parámetros lógicos, la torre de visión 0,331B y la cabeza MTP 0,061B. La cuantización mezcla tres formatos: la mayor parte de los pesos (1,725B) se almacena en affine 6-bit con grupo de 64, un 9,196 % en affine 8-bit y un 14,967 % se mantiene en BF16. La cabeza MTP, asociada habitualmente a la predicción multi-token y a la decodificación especulativa, está presente en el checkpoint, aunque la model card no explica cómo se activa ni si mlx-lm la aprovecha automáticamente. Según la descripción de la familia recogida en la página de Ollama, Qwen3.5 emplea un entrenamiento de fusión temprana sobre tokens multimodales, con paridad respecto a Qwen3 y mejores resultados que Qwen3-VL en razonamiento, código, agentes y comprensión visual; no se aportan cifras concretas.

## Capacidades

- Generación de texto y seguimiento de instrucciones, heredados de la familia Qwen3.5.
- Razonamiento, código y tareas de agente a nivel de familia; no hay evaluaciones publicadas para este checkpoint concreto.
- Comprensión visual: incluye una torre de visión de 0,331B parámetros, por lo que puede procesar imágenes además de texto.
- Capacidad multilingüe: la familia base se describe como multilingüe, aunque este repositorio no enumera los idiomas soportados.
- Predicción multi-token mediante la cabeza MTP de 0,061B, potencialmente útil para decodificación especulativa.
- Inferencia local en Apple Silicon a través de MLX, con un peso total de 2,146 GiB.
- Soporte de tool calling o function calling: no disponible en la información proporcionada.
- Modo thinking explícito: no disponible en la información proporcionada.

## Casos de uso

- Asistente local en un Mac: el checkpoint puede cargarse con MLX en equipos Apple Silicon y mantener conversaciones sin conexión, con la ventaja de que los datos no salen del dispositivo. Su tamaño de 2,146 GiB permite ejecutarlo en máquinas con 8 GB de memoria unificada, aunque 16 GB ofrecen más margen para contextos largos.
- Análisis de imágenes y documentos: la torre de visión permite describir capturas, extraer información de figuras o responder preguntas sobre imágenes, integrándose en flujos locales de investigación o documentación.
- Prototipado de agentes y automatizaciones: el seguimiento de instrucciones de la familia Qwen3.5 permite construir asistentes que ejecutan tareas paso a paso en local, útiles para pruebas de concepto antes de migrar a modelos mayores.
- Generación de código en entornos locales: puede emplearse para autocompletado, explicación de fragmentos o generación de scripts en un editor, con la ventaja de no depender de una API externa y la limitación inherente a un modelo de 2B.
- Investigación sobre cuantización: el reparto explícito entre 6 bits, 8 bits y BF16 convierte este checkpoint en un caso de estudio para medir la degradación de calidad en modelos multimodales pequeños.
- Evaluación de decodificación especulativa: la cabeza MTP incluida permite experimentar con predicción multi-token y comparar latencia frente a la decodificación convencional, siempre que la herramienta de inferencia la soporte.
- Resumen y clasificación de textos multilingües sin conexión: adecuado para procesar correos, notas o informes en un portátil, con la cautela de que los idiomas exactos no están documentados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye evaluaciones de MMLU, HumanEval, GSM8K ni de tareas visuales, y los resultados de búsqueda solo aportan afirmaciones cualitativas sobre la familia Qwen3.5, sin cifras numéricas.

## Requisitos de hardware

- Pesos en memoria: 2,146 GiB para el checkpoint completo, según la model card.
- Memoria unificada estimada: entre 3 y 4 GiB para inferencia con contexto corto, y entre 4 y 6 GiB si se amplía el contexto o se procesan imágenes. Es una estimación orientativa a partir del tamaño de los pesos, no un dato oficial.
- Apple Silicon: cualquier Mac con 8 GB de memoria unificada puede alojar los pesos; se recomiendan 16 GB o más para trabajar con contextos largos y visión. MLX está optimizado para las familias M1, M2, M3 y M4.
- GPU NVIDIA: este repositorio está en formato MLX y no es compatible directamente con CUDA. Para usarlo en una GPU NVIDIA habría que convertirlo a otro formato, algo que no se proporciona en el repositorio.
- GPU de consumo: no se puede confirmar compatibilidad directa; el formato MLX limita el despliegue a Apple Silicon salvo conversión previa.
- Opciones de despliegue: mlx-lm y oMLX son las vías naturales. Ollama distribuye qwen3.5:2b, pero no esta variante cuantizada concreta. vLLM y TGI no soportan MLX de forma nativa.
- Latencia y throughput: no disponibles. No se han publicado medidas de tokens por segundo para este checkpoint.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| bambocher/Qwen3.5-2B-oQ6e-mtp | 2,274B | No disponible | Mixta oQ, 8,106 bits/peso | No disponible | Hugging Face, formato MLX |
| Qwen3.5-2B en Qualcomm AI Hub | 2B | No disponible | Exportación on-device para Qualcomm | No disponible | Qualcomm AI Hub |
| qwen3.5:2b en Ollama | 2B | No disponible | Formato de Ollama, no confirmado | No disponible | Ollama |
| Otros modelos densos de aproximadamente 2B | No disponible | No disponible | No disponible | No disponible | No disponible |

No hay datos de rendimiento comparables entre estas variantes. La diferencia principal es el formato de despliegue: MLX para Apple Silicon, exportación para dispositivos Qualcomm y paquete de Ollama para ejecución local multiplataforma.

## Limitaciones y advertencias

- La licencia no está indicada en el repositorio, por lo que no puede asumirse uso comercial sin consultar al autor y la licencia del modelo base.
- Es una cuantización de terceros con 10 descargas y 0 likes; no consta validación por parte de Alibaba Cloud ni evaluaciones independientes.
- La precisión mixta puede degradar el rendimiento frente al BF16 original, especialmente en visión, razonamiento y tareas de código; no se han publicado mediciones de esa pérdida.
- La longitud de contexto no está documentada, así que no deberían planificarse cargas de contexto largo sin pruebas previas.
- Los idiomas soportados no se enumeran; la etiqueta multilingüe se hereda de la familia, no de una verificación de este checkpoint.
- El formato MLX limita el uso a Apple Silicon o a conversiones manuales; no es directamente compatible con vLLM, TGI, llama.cpp ni con GPUs NVIDIA.
- Un modelo de 2B presenta mayor riesgo de alucinación y de errores en matemáticas, código complejo y razonamiento de varios pasos que modelos mayores.
- No se documentan sesgos conocidos ni medidas de mitigación.
- La cabeza MTP puede no ser utilizada por la herramienta de inferencia; su beneficio en latencia no está garantizado.
- No hay información sobre tool calling, modo thinking ni otras capacidades avanzadas, por lo que no deberían asumirse en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/bambocher/Qwen3.5-2B-oQ6e-mtp
- Repositorio de oQ/oMLX: https://github.com/jundot/omlx
- Qwen3.5-2B en Qualcomm AI Hub: https://aihub.qualcomm.com/models/qwen3_5_2b
- README de Qwen3.5-2B en ai-hub-models: https://github.com/qualcomm/ai-hub-models/blob/main/src/qai_hub_models/models/qwen3_5_2b/README.md
- Qwen3.5:2b en Ollama: https://ollama.com/library/qwen3.5:2b
