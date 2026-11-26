# Mihai-LeanZero/Qwen3.8-Flash-Next-oQ4e-LeanZero

## Resumen

Qwen3.8-Flash-Next-oQ4e-LeanZero es una cuantización de 4 bits en formato MLX del modelo multimodal Qwen/Qwen3.8-Flash-Next, publicada por el desarrollador Mihai-LeanZero (LeanZero). El modelo base es un transformer multimodal de tipo image-text-to-text con arquitectura MoE (mezcla de expertos), cabeza de predicción multi-token (MTP) y una tabla de embeddings n-gram de 51B parámetros, orientado a Macs con Apple Silicon. Esta build concreta ocupa 100,275 GiB en disco y está pensada para ejecutarse en un único Mac con 128 GB de memoria unificada.

El problema que resuelve es práctico: el release oficial en BF16 pesa 360,0 GB repartidos en 131 shards, lo que lo hace inejecutable en hardware de consumo. LeanZero aplica la receta de cuantización oQ4e de oMLX (v0.7.3, Apache-2.0) para reducir el peso a menos de un tercio manteniendo la estructura completa del modelo original: el modelo de lenguaje, el encoder de visión, la cabeza MTP y la tabla n-gram. La relevancia actual radica en que permite ejecutar localmente un modelo de aproximadamente 180.000 millones de parámetros en un solo equipo de sobremesa de Apple, con verificación criptográfica de la procedencia de los pesos.

La licencia es qwen-community-1.0 (etiquetada como "other" en Hugging Face), lo que condiciona el uso comercial. El repositorio acumula 260 descargas y no tiene likes en el momento de la consulta. Los pesos se distribuyen en safetensors y la librería de referencia es MLX.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal MoE con cabeza MTP y tabla de embeddings n-gram; cuantización MLX (receta oQ4e de oMLX v0.7.3) |
| Parametros totales | 179.999.981.459 (dato de safetensors) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (la model card menciona una tabla de contexto medida, pero el contenido está truncado) |
| Tipos de cuantizacion | 4-bit afín (grupo 64) en expertos enrutados y tabla n-gram (grupo 32); 8-bit afín (grupo 128) en expertos compartidos; 8-bit afín (grupo 64) en resto de lineales, embedding de tokens y cabeza de salida; BF16 en router MoE, norms, convoluciones y encoder de visión |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 (etiquetada como "other" en Hugging Face) |
| Formato de pesos | safetensors (MLX), 21 shards, 107,67 GB en total |

## Arquitectura y entrenamiento

El modelo base es un transformer multimodal con mezcla de expertos (MoE) que integra cuatro componentes: un modelo de lenguaje, un encoder de visión, una tabla de embeddings n-gram de 51B parámetros y una cabeza de predicción multi-token (MTP). La cabeza MTP permite decodificación especulativa en motores que la soportan, y la tabla n-gram actúa como componente adicional de modelado. La model card menciona también capas de "linear attention", un "indexer" y "hyper-connection mixers", lo que sugiere una arquitectura híbrida más allá del transformer denso clásico, aunque los detalles completos no están disponibles en la información proporcionada.

El proceso de cuantización parte del release oficial BF16 en la revisión `de4b8e4d43b917e7706784d8bb445c9af86a3540` (131 shards, 360,0 GB), verificando el sha256 de cada shard contra el LFS de Hugging Face. No hubo fine-tuning, merging ni mezcla con otros modelos. El redondeo de los tensores con cuantización ponderada por importancia (método oQe) se calibró con 1.024 secuencias de 512 tokens del conjunto de calibración multilingüe de código de oMLX (Apache-2.0), obteniendo valores de importancia mediante una pasada forward sobre los pesos BF16 originales. Los ficheros de tokenizer, plantilla de chat, configuración de generación y preprocesadores de imagen y vídeo son byte a byte los de Qwen en esa revisión.

## Capacidades

- Generación de texto y conversación multi-turno, con pipeline image-text-to-text.
- Procesamiento de imágenes y vídeo: el encoder de visión se conserva íntegro en BF16 y los preprocesadores de imagen y vídeo son los originales de Qwen.
- Predicción multi-token (MTP) para decodificación especulativa en motores compatibles.
- Modelado n-gram a gran escala mediante la tabla de embeddings de 51B parámetros.
- Capacidades multilingües: la calibración usó un conjunto multilingüe de código, pero la lista oficial de idiomas no está disponible.
- Tool calling y razonamiento multi-paso: no confirmado en la información disponible.
- Modo "thinking" explícito: no confirmado en la información disponible.

## Casos de uso

- Ejecución local de un modelo multimodal de gran escala en Apple Silicon: con 100,275 GiB en disco y un Mac de 128 GB de memoria unificada, permite inferencia image-text-to-text sin depender de la nube, útil para prototipado y evaluación de modelos Qwen en hardware de sobremesa.
- Agente de escritorio integrado: la model card indica que se probó con el motor MLX de Elzi, una aplicación de agente de escritorio construida sobre goose, por lo que encaja en flujos de automatización local con entrada visual.
- Análisis de documentos e imágenes en local: al conservar el encoder de visión en BF16 y los preprocesadores originales, puede emplearse para tareas de comprensión de imagen y texto en entornos con requisitos de privacidad.
- Decodificación especulativa acelerada: la cabeza MTP cuantizada permite a motores compatibles usar draft tokens para reducir la latencia en generación larga.
- Investigación en cuantización: el manifiesto `own_convert_manifest.json` con hashes sha256 de los 3.748 tensores de salida y las métricas de error publicadas lo convierten en una referencia reproducible para estudiar el impacto de la cuantización 4-bit en modelos MoE multimodales.
- Evaluación comparativa de recetas de cuantización: al compartir receta con la build de Jundot, permite contrastar implementaciones (98,7% de coincidencia de códigos 4-bit en la mediana) en estudios de robustez.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. La model card sí incluye métricas de error de cuantización frente al BF16 original:

| Metrica | Valor |
|---|---|
| Error relativo mediano, expertos enrutados 4-bit | 0,084 (peor 0,093) |
| Similitud coseno mínima, expertos enrutados 4-bit | 0,9957 |
| Coincidencia de códigos 4-bit con la build de Jundot (mediana) | 98,7% |
| Error relativo mediano, expertos compartidos 8-bit | 0,0072 |
| Error relativo mediano, otras capas 8-bit | 0,0066 |
| Peor tensor individual (mezclador hyper-connection de MTP) | error relativo 0,155, coseno 0,989 |
| Tensores BF16 copiados sin cambios | 687, byte-idénticos a Qwen (salvo dos transposiciones de layout) |
| Tensores redondeados a nearest | 132, bit-idénticos a la build de Jundot |

Las mediciones de velocidad se realizaron en un Mac Studio con M5 Max y 128 GB, con el límite de memoria cableada de GPU elevado a 120.832 MB, usando el motor MLX de LeanZero (fork de Rapid-MLX, versión `v0.14.3-lz.24`), pero los valores concretos de latencia y throughput no están disponibles en el fragmento proporcionado.

## Requisitos de hardware

- VRAM/memoria unificada: 100,275 GiB en disco; requiere un Mac con 128 GB de memoria unificada para cargar el modelo completo.
- GPU recomendadas: Apple Silicon de gama alta; la model card cita un Mac Studio con M5 Max y 128 GB como plataforma de referencia.
- Cabe en GPU de consumo: no en GPUs NVIDIA convencionales por el formato MLX y el tamaño; en Apple Silicon, únicamente en configuraciones de 128 GB.
- Ajuste del sistema: es necesario elevar el límite de memoria cableada de la GPU con `sudo sysctl iogpu.wired_limit_mb=120832`.
- Opciones de despliegue: motor MLX de LeanZero (fork de Rapid-MLX); otros motores MLX compatibles con safetensors cuantizados no están confirmados.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Plataforma |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next-oQ4e-LeanZero | 179.999.981.459 | no disponible | 4-bit/8-bit/BF16 mixto (MLX) | qwen-community-1.0 | Apple Silicon (MLX) |
| Jundot/Qwen3.8-Flash-Next-oQ4e-mtp | no disponible | no disponible | oQ4e (misma receta) | no disponible | MLX |
| Qwen/Qwen3.8-Flash-Next (BF16) | no disponible (360,0 GB en 131 shards) | no disponible | BF16 | qwen-community-1.0 | Multiplataforma |

La build de Jundot es la referencia directa: misma receta oQ4e, mismos nombres y formas de tensores (3.748 tensores almacenados), y la build de LeanZero coincide con ella en el 98,7% de los códigos 4-bit y es bit-idéntica en los 132 pesos redondeados a nearest y en los 687 tensores BF16. El release oficial BF16 es la referencia de calidad, con un peso 3,3 veces mayor.

## Limitaciones y advertencias

- La cuantización 4-bit introduce error: los expertos enrutados presentan un error relativo mediano de 0,084 y el peor tensor individual alcanza 0,155, lo que puede degradar tareas sensibles a la precisión numérica.
- La model card está truncada en la información disponible: faltan la tabla de contexto medida, las mediciones de latencia y throughput, y la sección completa de licencia.
- Licencia qwen-community-1.0: es necesario revisar el fichero LICENSE para confirmar las condiciones de uso comercial, que pueden incluir restricciones adicionales.
- Dependencia de hardware Apple Silicon y del formato MLX: no es portable a GPUs NVIDIA ni a stacks de inferencia convencionales (vLLM, TGI) sin conversión adicional.
- Requiere 128 GB de memoria unificada y un ajuste manual del límite de memoria cableada de la GPU; no funciona en configuraciones inferiores.
- Riesgo de alucinación y sesgos: no hay información específica publicada en la model card sobre evaluación de sesgos o tasas de alucinación.
- Idiomas soportados no documentados: la calibración usó datos multilingües de código, pero no se garantiza cobertura idiomática general.
- El repositorio tiene 0 likes y 260 descargas, y no procede del equipo oficial de Qwen: es una build de terceros, aunque verificada criptográficamente contra el release oficial.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Mihai-LeanZero/Qwen3.8-Flash-Next-oQ4e-LeanZero
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Build de referencia con la misma receta: https://huggingface.co/Jundot/Qwen3.8-Flash-Next-oQ4e-mtp
- LeanZero: https://leanzero.net
- Receta de cuantización oMLX (oQ4e, Apache-2.0, por jundot): no disponible como enlace directo en la información proporcionada
