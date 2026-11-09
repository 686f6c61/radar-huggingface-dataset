# mradermacher/LFM3-Omni-2B-heretic-i1-GGUF

## Resumen

`mradermacher/LFM3-Omni-2B-heretic-i1-GGUF` es una colección de cuantizaciones GGUF generadas por el usuario mradermacher a partir del modelo `rodrigomt/LFM3-Omni-2B-heretic`. Se trata, por tanto, de un artefacto derivado: el trabajo original corresponde a un modelo multimodal de la familia LFM3-Omni (Liquid AI) de aproximadamente 2 000 millones de parámetros, que ha sido sometido a un proceso de "abliteration" o "uncensoring" (de ahí el sufijo *heretic*) para reducir los rechazos y filtros de seguridad del modelo base. La ficha del repositorio en Hugging Face no incluye model card descriptiva más allá de los metadatos de cuantización.

El repositorio es relevante para desarrolladores que quieran ejecutar localmente un modelo omni (texto, visión y audio, según la nomenclatura de la familia LFM3-Omni) en hardware de consumo mediante llama.cpp u otros motores compatibles con GGUF. La colección cubre un espectro amplio de cuantizaciones, desde IQ1_S/IQ1_M (extremadamente agresivas) hasta Q6_K, lo que permite ajustar el equilibrio entre calidad y huella de memoria.

Conviene subrayar que el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, no dispone de licencia declarada en los metadatos y el tamaño del repo figura como 0.0 GB, lo que sugiere que la información pública es mínima. El dato de "parámetros totales: 899.013" que aparece en los metadatos de safetensors es inconsistente con el nombre del modelo (2B) y con el tamaño esperado de un modelo de 2 000 millones de parámetros; probablemente refleja solo un tensor o un conteo parcial, no el total real del modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (familia LFM3-Omni de Liquid AI; detalles no incluidos en la informacion proporcionada) |
| Parametros totales | ~2B segun el nombre del modelo; el metadato safetensors indica 899.013 (dato inconsistente, probablemente parcial) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, IQ3_M, Q4_K_S, IQ3_XXS, Q3_K_M, small-IQ4_NL, Q4_K_M, IQ2_M, Q6_K, IQ4_XS, Q2_K_S, IQ1_M, Q3_K_S, IQ2_XXS, Q3_K_L, IQ2_XS, Q5_K_S, IQ2_S, IQ1_S, Q5_K_M, Q4_0, IQ3_XS, Q4_1, IQ3_S |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones i1/weighted-imatrix) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna en la documentación proporcionada. Por el nombre, el modelo base pertenece a la familia LFM3-Omni de Liquid AI, descrita por el autor como "Omni", lo que en la nomenclatura habitual de esa familia implica capacidades multimodales (texto, visión y audio). Sin embargo, no se confirma en la información disponible ni el tipo de transformer, ni el número de capas, ni la dimensionalidad, ni si emplea atención lineal u otro mecanismo eficiente característico de Liquid AI.

El proceso de entrenamiento del modelo base tampoco está documentado aquí. Lo que sí se deduce de los metadatos es el pipeline de derivación: el modelo `rodrigomt/LFM3-Omni-2B-heretic` fue convertido a formato HF (`convert_type: hf`) y posteriormente cuantizado con llama.cpp usando cuantizaciones ponderadas por matriz de importancia (`weighted/imatrix quants`), con `output_tensor_quantised: 1` y `quantize_version: 2`. El sufijo *heretic* indica que el modelo base fue modificado mediante técnicas de abliteration para eliminar direcciones de rechazo en el espacio de activaciones, lo que reduce la tasa de respuestas negativas ante peticiones sensibles, a costa de posibles degradaciones en coherencia y seguridad.

## Capacidades

- Generación de texto y razonamiento general, heredadas del modelo base LFM3-Omni-2B.
- Capacidades multimodales (visión y audio) presumiblemente presentes por la denominación "Omni", aunque no confirmadas en la información disponible.
- Ejecución local en CPU y GPU mediante llama.cpp y motores compatibles con GGUF.
- Múltiples niveles de cuantización para ajustar calidad frente a memoria.
- Comportamiento "uncensored" o con rechazos reducidos por el proceso *heretic*.
- Soporte de tool calling, agentes o modo thinking: no disponible en la información proporcionada.

## Casos de uso

- Inferencia local en hardware de consumo: las cuantizaciones IQ2/IQ3 y Q4 permiten ejecutar un modelo de ~2B en GPUs con 4-8 GB de VRAM o incluso en CPU, útil para prototipos y pruebas offline.
- Experimentación con modelos "abliterated": investigadores que estudian el efecto de la eliminación de direcciones de rechazo pueden comparar el modelo *heretic* con el base usando las mismas cuantizaciones.
- Procesamiento multimodal en el borde: si se confirman las capacidades omni, podría emplearse para descripción de imágenes o transcripción de audio en dispositivos con recursos limitados.
- Evaluación de cuantizaciones: la colección cubre desde IQ1_S hasta Q6_K, lo que permite medir la degradación de calidad por nivel de compresión en un mismo modelo.
- Integración en pipelines de llama.cpp: al ser GGUF, encaja en servidores ligeros (llama-server) para tareas de generación de texto de baja latencia.
- Fines educativos y de investigación sobre seguridad de modelos: analizar qué tipo de contenido genera un modelo sin filtros y documentar sus riesgos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: para un modelo de ~2B parámetros, las cuantizaciones Q4_K_M ocupan del orden de 1,2-1,5 GB; Q6_K alrededor de 1,8-2,2 GB; IQ1_S/IQ2 en torno a 0,5-0,9 GB. Estas cifras son estimaciones basadas en el tamaño nominal del modelo, no datos medidos publicados en el repositorio.
- GPU recomendadas: cualquier GPU con 4 GB o más de VRAM (RTX 3050, RTX 4060, RTX 3060) para cuantizaciones Q4/Q5; GPUs de 8-12 GB (RTX 4070, RTX 4080) para Q6_K con contexto amplio.
- Cabe en GPU de consumo: sí, en la mayoría de GPUs modernas con 4 GB o más, especialmente en cuantizaciones bajas.
- Opciones de despliegue: llama.cpp, llama-server, Ollama (tras importar el GGUF), LM Studio, KoboldCpp y otros motores compatibles con GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| mradermacher/LFM3-Omni-2B-heretic-i1-GGUF | ~2B (nominal) | no disponible | no disponible | GGUF | Cuantizaciones de un modelo *heretic* multimodal |
| rodrigomt/LFM3-Omni-2B-heretic | ~2B (nominal) | no disponible | no disponible | safetensors (HF) | Modelo base del que derivan estas cuantizaciones |
| Modelo LFM3-Omni-2B original (Liquid AI) | ~2B | no disponible | no disponible | no disponible | Modelo base sin abliteración |

No se dispone de datos de rendimiento para establecer una comparación cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- El proceso *heretic* (abliteration) reduce los rechazos del modelo, lo que puede aumentar la probabilidad de generar contenido dañino, sesgado o inexacto; no debe desplegarse en producción sin filtros externos.
- Riesgo elevado de alucinación, acentuado por el tamaño reducido (~2B) y por la modificación de seguridad.
- No hay licencia declarada en los metadatos del repositorio; el uso comercial queda en un limbo legal hasta verificar la licencia del modelo base y del derivado.
- El dato de parámetros totales (899.013) contradice el nombre del modelo; conviene verificar el tamaño real antes de planificar despliegues.
- No se documentan idiomas soportados; el rendimiento en castellano es desconocido.
- Repositorio con 0 descargas y 0 likes: no hay evidencia de validación por parte de la comunidad.
- Las cuantizaciones IQ1/IQ2 pueden degradar notablemente la coherencia y la calidad multimodal.
- El tamaño del repo figura como 0.0 GB, lo que puede indicar metadatos incompletos o problemas de carga.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/LFM3-Omni-2B-heretic-i1-GGUF
- Modelo base del que derivan las cuantizaciones: https://huggingface.co/rodrigomt/LFM3-Omni-2B-heretic
- Perfil del autor de las cuantizaciones: https://huggingface.co/mradermacher
- Familia LFM3-Omni de Liquid AI: no disponible en la información proporcionada.
