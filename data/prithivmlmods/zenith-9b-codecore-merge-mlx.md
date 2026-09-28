# prithivMLmods/Zenith-9B-CodeCore-Merge-MLX

## Resumen

Zenith-9B-CodeCore-Merge-MLX es un repositorio de pesos publicado por el usuario prithivMLmods que contiene un modelo de 9.409.813.744 parámetros (9,41 B) en formato MLX, la librería de Apple para ejecutar modelos sobre silicio de la serie M. El pipeline declarado en los metadatos es image-text-to-text, lo que implica una arquitectura multimodal que acepta imágenes y texto como entrada, y la etiqueta de arquitectura del repositorio es qwen3_5, lo que apunta a una base de la familia Qwen3.5, aunque la model card no confirma ni detalla esta correspondencia. El nombre del repositorio sugiere un modelo resultante de una fusión (merge) orientada a código, pero no hay documentación que lo verifique.

El problema que resuelve es la ejecución local de un modelo multimodal de casi 10.000 millones de parámetros en equipos Apple Silicon sin depender de CUDA ni de servicios en la nube, aprovechando la memoria unificada de los chips M. Con 35,2 GB de repositorio, el peso de los ficheros casi duplica lo esperable para una única copia en bf16 (unos 18,8 GB), lo que sugiere la presencia de más de una precisión o de componentes adicionales, sin que la composición exacta esté documentada.

La relevancia de esta ficha es limitada y debe leerse con cautela: la model card está vacía (solo contiene los campos de metadatos), no se declara licencia, no hay benchmarks publicados, el repositorio acumula 0 descargas y 0 likes, y los idiomas soportados se reducen a inglés según los metadatos. Cualquier evaluación en producción exige validación propia antes de asumir capacidades, licencia o calidad.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (la etiqueta del repositorio indica qwen3_5; sin confirmación en la model card) |
| Parámetros totales | 9.409.813.744 (9,41 B), dato de los safetensors |
| Parámetros activos | no disponible (no se indica si la arquitectura es densa o MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (no se documentan variantes 4-bit, 8-bit ni otras) |
| Idiomas soportados | en (inglés), según los metadatos del repositorio |
| Licencia | no disponible |
| Formato de pesos | safetensors en formato MLX; librería declarada: mlx |
| Modalidad | image-text-to-text (entrada de imagen y texto) |
| Uso declarado | conversational |
| Autor | prithivMLmods |
| Tamaño del repositorio | 35,2 GB |
| Fecha de creación | 2026-09-28 |
| Última actualización | 2026-09-28 |

## Arquitectura y entrenamiento

No hay información publicada sobre la arquitectura interna, el proceso de entrenamiento ni la composición del dataset. La model card no incluye descripción, y los únicos indicios disponibles son los metadatos del repositorio: la etiqueta `qwen3_5` sugiere una base de la familia Qwen3.5 con pipeline multimodal `image-text-to-text`, y el nombre `Merge` apunta a una fusión de pesos (model merging), técnica habitual para combinar capacidades de varios modelos ajustados sobre la misma base. Ninguno de estos extremos está confirmado por el autor.

Tampoco se documentan el número de tokens de entrenamiento, la presencia de fases de RLHF, DPO o RLVR, ni innovaciones técnicas como decodificación especulativa, atención lineal o mecanismos híbridos. La conversión a MLX implica, en el flujo habitual de la librería, una reimplementación de las capas en el framework de Apple, pero no se especifica la precisión de conversión ni si se aplicó cuantización.

## Capacidades

Las capacidades listadas a continuación se infieren exclusivamente de los metadatos del repositorio (pipeline `image-text-to-text`, etiqueta `conversational`, idioma `en`) y no están verificadas por el autor:

- Procesamiento conjunto de imagen y texto, con generación de respuestas en formato conversacional.
- Generación de texto multi-turno en inglés.
- Ejecución local sobre Apple Silicon mediante la librería MLX.
- Posible especialización en código, deducible únicamente del nombre `CodeCore` del repositorio; no confirmada.
- Soporte de tool calling o function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles; los metadatos declaran solo inglés.
- Modo de razonamiento explícito (thinking mode), audio o visión de vídeo: no disponible.

## Casos de uso

- Asistente multimodal local en Mac: ejecutar el modelo con MLX sobre un Mac con memoria unificada suficiente para responder preguntas sobre capturas de pantalla, diagramas o documentación técnica escaneada sin enviar datos a servicios externos.
- Análisis de capturas de errores en desarrollo: introducir una imagen de una traza de error o de una consola y obtener una explicación en texto, útil en equipos donde el código no puede salir de la máquina por políticas de confidencialidad.
- Automatización de documentación técnica: generar descripciones textuales de diagramas de arquitectura o de esquemas subidos como imagen, como paso previo a su inclusión en documentación interna.
- Prototipado de asistentes conversacionales en inglés: usar la etiqueta `conversational` para construir demos locales multi-turno antes de decidir un despliegue en servidor, asumiendo que el contexto máximo es desconocido y debe medirse.
- Evaluación comparativa de fusiones de modelos: emplear el repositorio como caso de estudio de merges orientados a código en formato MLX, comparando su comportamiento con los modelos base sobre los que se haya fusionado.
- Extracción de información de imágenes en flujos internos: procesar facturas, formularios o tablas fotografiadas en un pipeline local, con la advertencia de que no hay benchmarks que respalden la precisión de OCR o de comprensión de documentos.
- Investigación sobre cuantización en MLX: analizar la diferencia entre los 35,2 GB del repositorio y los ~18,8 GB esperables para pesos en bf16, para estudiar qué componentes o precisiones adicionales se han incluido.
- Inferencia offline en entornos sin conectividad: desplegar el modelo en un portátil Apple Silicon para tareas de descripción de imágenes o preguntas sobre contenido visual en campo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del repositorio no incluye ninguna tabla de MMLU, HumanEval, GSM8K, MMMU ni de métricas multimodales, y no se dispone de comparaciones oficiales con otros modelos.

## Requisitos de hardware

Las cifras siguientes son estimaciones derivadas del recuento de parámetros (9,41 B) y del tamaño del repositorio, no datos publicados por el autor. La librería MLX está diseñada para Apple Silicon, por lo que el despliegue natural es sobre chips de la serie M con memoria unificada:

- Pesos en bf16/fp16: unos 18,8 GB solo de pesos; con caché KV y torre de visión, reservar entre 22 y 26 GB de memoria unificada.
- Pesos en 8 bits: unos 9,4 GB de pesos; con overhead, entre 12 y 14 GB.
- Pesos en 4 bits: unos 4,7 GB de pesos; con overhead, entre 7 y 9 GB.
- Mac con 16 GB de memoria unificada: viable únicamente en 4 bits y con contexto reducido; el repositorio, tal cual, ocupa 35,2 GB en disco, por lo que hay que verificar qué ficheros se descargan.
- Mac con 32 GB: permite 8 bits con margen razonable y bf16 con contexto limitado.
- Mac con 64 GB o más (M Max/Ultra): permite bf16 completo con contexto amplio y espacio para el encoder de visión.
- GPU NVIDIA (A100, H100, RTX 4090): no son compatibles de forma directa con pesos MLX; requieren reconversión a otro formato, no incluida en el repositorio.
- Opciones de despliegue: `mlx-lm` para texto y `mlx-vlm` para modelos visión-lenguaje; Ollama, vLLM, TGI y llama.cpp no consumen pesos MLX sin una conversión previa a GGUF u otro formato.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

La comparación cuantitativa no puede completarse con la información proporcionada: se desconoce la arquitectura, el contexto y la licencia del modelo evaluado. La tabla siguiente recoge alternativas de la misma categoría (modelos multimodales de 3 a 12 mil millones de parámetros con conversiones a MLX disponibles), con datos de conocimiento público general que deben verificarse en las fuentes oficiales, ya que no proceden de la información de esta ficha:

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad en MLX |
|---|---|---|---|---|
| Zenith-9B-CodeCore-Merge-MLX | 9,41 B | no disponible | no disponible | sí, nativa (objeto de esta ficha) |
| Qwen2.5-VL-7B-Instruct | ~8 B (aprox.) | no verificable aquí | Apache 2.0 (según su model card) | conversiones de la comunidad en mlx-community |
| Gemma 3 12B (multimodal) | ~12 B (aprox.) | no verificable aquí | Gemma Terms of Use | conversiones de la comunidad en mlx-community |
| InternVL3-8B | ~8 B (aprox.) | no verificable aquí | no verificable en esta ficha | conversiones de la comunidad en mlx-community |

## Limitaciones y advertencias

- Ausencia total de documentación: la model card está vacía, por lo que no se conocen datos de entrenamiento, sesgos, contexto máximo ni comportamiento esperado.
- Licencia no declarada: sin licencia explícita no puede asumirse permiso de uso comercial; es un riesgo legal directo para cualquier despliegue en producción.
- Riesgo de alucinación no evaluado: no hay benchmarks ni evaluaciones de fidelidad, especialmente crítico en tareas de lectura de imágenes y documentos.
- Idiomas: los metadatos declaran únicamente inglés; el comportamiento en castellano no está documentado y no debería asumirse.
- Contexto desconocido: la ausencia de una longitud de contexto declarada impide planificar conversaciones largas o procesamiento de documentos extensos.
- Modelo derivado de una fusión: los merges de pesos sin evaluación publicada pueden degradar capacidades de forma no evidente respecto a los modelos originales.
- Compatibilidad restringida: los pesos en formato MLX solo se ejecutan en Apple Silicon con la librería MLX; su uso en GPU NVIDIA exige conversión adicional.
- Repositorio sin adopción: 0 descargas y 0 likes implican ausencia de validación por parte de la comunidad y de informes de errores.
- Fechas de creación y actualización idénticas (2026-09-28), con el repositorio sin revisión posterior aparente.
- Advertencia sobre el tamaño: 35,2 GB de repositorio frente a los ~18,8 GB esperables para una copia en bf16; conviene inspeccionar los ficheros antes de descargar para no duplicar espacio en disco.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/prithivMLmods/Zenith-9B-CodeCore-Merge-MLX
- Perfil del autor en HuggingFace: https://huggingface.co/prithivMLmods
- Librería MLX (Apple): https://github.com/ml-explore/mlx
- mlx-lm (ejecución de modelos de lenguaje en MLX): https://github.com/ml-explore/mlx-lm
- mlx-vlm (modelos visión-lenguaje en MLX): https://github.com/Blaizzy/mlx-vlm
- No se han encontrado en la información proporcionada papers, blogs, demos ni repositorios adicionales asociados a este modelo concreto.
