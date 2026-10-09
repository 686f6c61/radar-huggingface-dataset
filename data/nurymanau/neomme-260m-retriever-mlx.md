# Nurymanau/NeoMME-260M-Retriever-MLX

## Resumen

NeoMME-260M-Retriever-MLX es un runtime de inferencia nativo en Python y MLX para el modelo Hcompany/NeoMME-260M-Retriever, un codificador de recuperación visual de documentos. Lo publica el usuario Nurymanau como implementación no oficial, sin Torch ni Transformers en tiempo de ejecución, y está pensado exclusivamente para Apple Silicon. El modelo subyacente, desarrollado por H Company, resuelve un problema muy concreto: buscar dentro de documentos con diseño visual (PDFs, facturas, páginas escaneadas, imágenes) sin depender de OCR ni de una capa de texto extraída.

Se trata de un codificador compartido para texto e imagen que devuelve dos tipos de representación: un vector denso de 1024 dimensiones y un conjunto de vectores por token de 128 dimensiones para puntuación por interacción tardía (late interaction). La puntuación se calcula con similitud coseno o con el operador MeanMaxSim, que combina la similitud máxima por token con un promedio. El pipeline declarado es `visual-document-retrieval` y el modelo tiene 263.068.978 parámetros, con pesos originales en BF16 que el runtime expande a FP32.

Su relevancia ahora es doble. Por un lado, permite ejecutar recuperación visual de documentos en local sobre un Mac con Apple Silicon, sin GPU dedicada ni servicio remoto, algo útil para corpus privados o con requisitos de confidencialidad. Por otro, demuestra que la familia NeoMME, de tamaño medio (aproximadamente 263 M de parámetros), puede portarse a un stack alternativo manteniendo paridad numérica con la implementación de referencia, ya que el repositorio incluye verificación de hashes y umbrales de paridad frente a fixtures congelados.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Codificador compartido texto-imagen con salida multi-vector (late interaction); detalles internos de capas no disponibles |
| Parametros totales | 263.068.978 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 4096 tokens por defecto en el procesador; la arquitectura soporta 16384 posiciones, pero esta versión no declara validación a esa longitud |
| Tipos de cuantizacion | FP32 (precisión validada, única expuesta por la CLI); BF16 de origen cargado y expandido a FP32 en memoria; FP16 experimental y no superó los umbrales de paridad de vectores por token |
| Idiomas soportados | Multilingüe (lista de idiomas no disponible) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (BF16 original); runtime en MLX; no hay GGUF ni cuantizaciones de llama.cpp |

## Arquitectura y entrenamiento

El modelo es un codificador de recuperación con torre compartida: el mismo encoder procesa tanto consultas de texto como imágenes de documentos. Las consultas se formatean con el token `<query>` y diez tokens de máscara aprendidos; los documentos usan `<doc>` y, en el caso de imágenes, incluyen cabecera de imagen, tokens de parche y marcadores de fila. La salida es doble: características agrupadas y normalizadas que producen un vector denso de dimensionalidad configurable (128, 256, 512 o 1024, mediante truncado antes de la normalización) y vectores por token de 128 dimensiones que alimentan la puntuación de interacción tardía. El operador de puntuación propio es MeanMaxSim, que promedia la similitud máxima alcanzada por cada token de consulta contra los tokens del documento.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF o DPO; el repositorio consultado documenta la implementación de inferencia, no el proceso de entrenamiento del modelo base. La innovación destacable de esta publicación no está en el modelo, sino en el runtime: inferencia nativa en MLX sin importar Torch ni Transformers, indexación y búsqueda totalmente offline, renderizado de PDF página a página con PDFium (sin atajo por capa de texto ni OCR), particionado de ficheros de texto por párrafos y un manifiesto de hashes verificable con `python verify_package.py`. El repositorio incluye además scripts de auditoría y un oráculo de desarrollo separados del runtime.

## Capacidades

- Recuperación densa de documentos visuales: genera vectores de 1024 dimensiones para similitud coseno.
- Recuperación por interacción tardía: vectores por token de 128 dimensiones con puntuación MeanMaxSim, adecuada para consultas con terminología específica.
- Codificación conjunta de texto e imagen en un único encoder, sin necesidad de OCR previo.
- Indexación de PDF con renderizado página a página mediante PDFium, preservando la apariencia de la página.
- Soporte de formatos de imagen PNG, JPEG, WebP, BMP y TIFF, y de texto UTF-8 TXT y MD.
- Capacidad multilingüe declarada, con ejemplos de consulta en ruso y documentación en inglés.
- Indexación con truncado dimensional configurable (`dense_dim=128/256/512/1024`) para ajustar coste y precisión.
- Rechazo explícito de entradas por encima de 4096 tokens en lugar de truncarlas silenciosamente, lo que evita degradar diseños de página o expansiones de consulta.
- Limitación de páginas por PDF (`--max-pages`, por defecto 100) que aborta antes de codificar si se supera.
- No es un modelo generativo: no mantiene conversación, no redacta respuestas y no transcribe texto (no es OCR).
- No soporta tool calling ni function calling; no hay modo thinking ni capacidades de audio.

## Casos de uso

- Búsqueda semántica sobre facturas y albaranes escaneados: se indexan las páginas como imágenes y se consulta con lenguaje natural ("¿cuál es el total de la factura de marzo?"), evitando pipelines de OCR que fallan con tablas y tipografías no estándar.
- Recuperación en contratos y documentación legal: la puntuación por interacción tardía permite localizar cláusulas concretas en documentos largos con lenguaje jurídico repetitivo, donde un embedding denso único tiende a promediar demasiado.
- Archivo técnico multilingüe: el modelo es multilingüe, de modo que un mismo índice sirve para consultas en varios idiomas sobre manuales, planos o fichas de producto sin traducir el corpus.
- RAG local con requisitos de confidencialidad: al ejecutarse offline sobre Apple Silicon, los documentos no salen del equipo, lo que encaja en entornos sanitarios, legales o financieros con restricciones de tratamiento de datos.
- Preprocesado de corpus para recuperación posterior: usar los vectores densos de 1024 dimensiones como entrada de un recuperador de segunda etapa o de un reranker, o reducir a 128 dimensiones para un primer filtrado rápido.
- Herramienta de escritorio para profesionales: la CLI (`index` y `search`) permite construir índices de un directorio de PDFs y notas y consultarlos después, aprovechando que los índices existentes nunca se sobrescriben.
- Extracción asistida de información de formularios: recuperar la página y la región relevante de un formulario antes de pasarla a un modelo generativo o a un OCR específico, reduciendo el volumen de datos enviado a etapas posteriores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La documentación del repositorio menciona únicamente validaciones internas de paridad numérica frente a la implementación de referencia (fixtures congelados de vectores por token en páginas y textos largos), sin métricas de recuperación como nDCG, Recall@k o MRR, y sin comparaciones publicadas con otros recuperadores visuales. El autor indica explícitamente que no reclama calidad general de recuperación ni mejoras universales de rendimiento.

## Requisitos de hardware

- Plataforma: exclusivamente Apple Silicon (MLX). No hay soporte para GPU NVIDIA ni AMD en esta implementación.
- Software: Python 3.12 y las dependencias del paquete; el runtime no importa Torch ni Transformers.
- Pesos en FP32: aproximadamente 1,05 GB (263.068.978 parámetros x 4 bytes), que es la precisión validada.
- Pesos de origen en BF16: aproximadamente 526 MB; el repositorio ocupa 0,5 GB.
- Memoria recomendada: al menos 4-6 GB de RAM libres para el modelo, el renderizado de páginas (PDFium) y los índices cargados en memoria. No se dispone de cifras oficiales de consumo máximo.
- GPU de escritorio: no aplica; el modelo no se ejecuta en A100, H100 ni RTX 4090 con este runtime.
- Opciones de despliegue: MLX nativo mediante el paquete `neomme_mlx` o la CLI `python -m neomme_mlx`; no hay soporte de vLLM, TGI, llama.cpp, Ollama ni GGUF.
- Búsqueda: exacta, con el índice completo cargado en RAM; no hay índice ANN, por lo que la escalabilidad a corpus grandes está limitada.
- Latencia y throughput: no disponibles. El coste depende del `--max-side` de imagen (por defecto 1024 píxeles en el lado mayor; 512 reduce cómputo con riesgo de perder texto pequeño) y del número de páginas indexadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo de salida | Licencia | Runtime disponible |
|---|---|---|---|---|---|
| NeoMME-260M-Retriever-MLX | 263.068.978 | 4096 tokens efectivos (arquitectura hasta 16384) | Densa 1024 dim + tokens de 128 dim (MeanMaxSim) | Apache-2.0 | MLX (Apple Silicon), Python nativo |
| Hcompany/NeoMME-260M-Retriever | 263.068.978 | Igual que la versión MLX | Idéntica (son los mismos pesos) | Apache-2.0 | Implementación de referencia en PyTorch/Transformers |
| Otros recuperadores visuales por interacción tardía (por ejemplo, la familia ColPali/ColQwen) | No disponible | No disponible | Multivector por interacción tardía | No disponible | No disponible |

La comparación más fiable es contra el modelo base: el runtime MLX no modifica los pesos, solo los carga y los expande a FP32, por lo que la calidad de recuperación debería coincidir con la referencia en la medida en que se respeten el procesador y el formato de consulta. Para el resto de recuperadores visuales no se dispone en la información proporcionada de parámetros, contexto, métricas ni licencias verificables, de modo que no se incluyen cifras.

## Limitaciones y advertencias

- No es un modelo generativo ni conversacional: no produce texto, no responde preguntas y no debe usarse como chatbot.
- No realiza OCR ni transcripción. Renderiza la página como imagen, lo que implica que el texto no es recuperable como cadena de caracteres.
- No hay resultados de benchmarks publicados: no se puede asumir una calidad de recuperación concreta sin evaluar en el corpus propio.
- FP16 está marcado como experimental y no superó los umbrales de paridad de vectores por token; la CLI solo expone FP32, con el consiguiente mayor consumo de memoria.
- Límite práctico de 4096 tokens por entrada: los PDFs con páginas muy densas o las consultas con mucha expansión se rechazan en lugar de truncarse.
- La validación declarada no cubre las 16384 posiciones que soporta la arquitectura; no hay garantías a esa longitud.
- La orientación EXIF no se aplica automáticamente: imágenes de móvil o escáner pueden indexarse giradas si no se normalizan antes.
- La búsqueda es exacta y carga el índice en RAM; no es una base de datos ANN ni una aplicación de navegador. No es adecuado para corpus masivos.
- El autor declara ausencia de afiliación oficial con H Company y no reclama ser la primera implementación ni mejoras de rendimiento.
- Sesgos conocidos: no disponibles en la información proporcionada. Al ser multilingüe sin lista de idiomas publicada, el comportamiento puede degradarse en lenguas poco representadas; conviene validar con datos propios.
- Licencia Apache-2.0 en el modelo base y en el runtime, lo que en principio permite uso comercial, pero debe revisarse el fichero NOTICE y los términos del repositorio de origen antes de desplegar en producción.
- El proyecto está en versión local validada v0.1.0, sin descargas ni likes en el momento de la consulta, por lo que el soporte de la comunidad es limitado.

## Enlaces

- Repositorio HuggingFace de la implementación MLX: https://huggingface.co/Nurymanau/NeoMME-260M-Retriever-MLX
- Modelo base en HuggingFace: https://huggingface.co/Hcompany/NeoMME-260M-Retriever
- Código fuente del runtime MLX: https://github.com/Obscyra-app/neomme-mlx
- Revisión de los pesos de origen citada en la model card: `481083153ac22931afbd614e672212bffbcb666e`
