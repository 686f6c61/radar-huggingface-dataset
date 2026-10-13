# hstolte/Qwen3.8-Flash-Next-HALOLOOM

## Resumen

Qwen3.8-Flash-Next-HALOLOOM es un paquete de cuantizaciones de precisión mixta INT4/INT8 (receta AWQ) del modelo base Qwen/Qwen3.8-Flash-Next, publicado por el usuario hstolte y orientado específicamente al flujo de inferencia sobre AMD Strix Halo con arquitectura gfx1151. No es una publicación oficial de Qwen: se trata de una conversión de terceros empaquetada con la herramienta HaloLoom y pensada para funcionar con un fork propio de vLLM (HawgAuto/vllm), no con vLLM estándar.

El interés de esta ficha radica en que documenta un intento de ejecutar un modelo de gran tamaño con expertos enrutados en hardware de memoria unificada de gama de 128 GB, desplazando parte del modelo a SSD en lugar de mantenerlo residente en memoria. En concreto, la tabla de embeddings n-gram (PLE) de 95,37 GiB se lee desde NVMe mediante un lector de filas respaldado por SSD, lo que reduce la asignación residente a entre 73,05 y 78,52 GiB según variante y modo de decodificación.

El repositorio se encuentra en estado de subida pública en curso y el propio autor advierte que no es una release completa ni verificada. A fecha de los datos disponibles acumula 0 descargas y 0 «likes», no declara licencia ni idiomas soportados y no publica resultados de benchmarks, por lo que debe considerarse material experimental.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MoE con núcleo denso y expertos enrutados; incluye tabla de embeddings n-gram (PLE) y multi-token prediction (MTP) para decodificación especulativa, según la model card y fuentes secundarias |
| Parámetros totales | Aproximadamente 180.000 millones según fuentes secundarias; no confirmado por el autor del repositorio. La tabla PLE declarada (320.001.536 filas × 160 valores BF16) equivale a unos 51.200 millones de parámetros |
| Parámetros activos | Aproximadamente 6.000 millones según fuentes secundarias; no confirmado en la información del repositorio |
| Longitud de contexto | No disponible. Las pruebas de carga citadas por el autor usaron 4.096 tokens de contexto con un presupuesto de lote de 12.288 tokens |
| Tipos de cuantización | INT4/INT8 de precisión mixta (receta AWQ). Dos builds: Bf16Core-int4-int8 (núcleo BF16, expertos INT4/INT8 mixtos) e int8Core-int4-int8 (núcleo INT8, expertos INT4/INT8 mixtos) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors. 132 archivos de pesos por variante: 131 shards del modelo objetivo más un shard del modelo draft |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-Flash-Next se describe, en fuentes secundarias, como una arquitectura experimental de tipo mezcla de expertos (MoE) que serviría de anticipo de la arquitectura de Qwen4, con un coste de entrenamiento aproximadamente nueve veces menor que Qwen3.7-Plus. Este repositorio no entrena nada: aplica cuantización y calibración sobre el modelo base. El autor indica que el proceso se realizó con HaloLoom (flujo integrado de cuantización, perfilado, optimización y servicio para Strix Halo, con pila de contenedores ROCm fijada) y con AMD Quark como herramienta de cuantización, calibración y exportación. No se detalla la composición del dataset de calibración, el número de tokens de entrenamiento original ni si hubo etapas de RLHF o DPO.

La innovación técnica más destacable de este empaquetado es la gestión de la tabla PLE. Se trata de una tabla de embeddings n-gram de 320.001.536 filas × 160 valores en BF16, distribuida en 128 tensores y con un peso en disco de 95,37 GiB. El runtime requerido implementa un lector de filas respaldado por SSD que accede explícitamente a los embeddings solicitados en lugar de cargar o mapear la tabla completa en memoria del acelerador. Además, se declara compatibilidad con decodificación especulativa MTP con tres tokens especulativos, servida mediante un shard draft independiente de 3,98 GB (3,70 GiB). La integración con el runtime vive en un fork propio de vLLM, y el autor advierte explícitamente que no debe asumirse compatibilidad con vLLM estándar.

## Capacidades

- Generación de texto: tarea principal declarada (pipeline `text-generation`).
- Codificación y tareas ofimáticas: el repositorio oficial del modelo base afirma capacidades superiores a Qwen3.7-Plus en código y tareas de oficina; no hay evaluación específica publicada para esta cuantización.
- Decodificación especulativa: soporte de MTP con 3 tokens especulativos mediante el shard draft incluido.
- Ejecución local con memoria unificada: inferencia sobre Strix Halo / gfx1151 con PLE respaldada por SSD, sin requerir que la tabla completa resida en RAM.
- Precisión mixta por componente: núcleo denso en BF16 o INT8, con expertos enrutados en INT4/INT8 mixtos, lo que permite elegir entre dos compromisos de calidad y tamaño.
- Tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponibles en la información proporcionada.
- Capacidades multilingües: no disponibles; el repositorio no declara idiomas.
- Visión, audio u otras modalidades: no disponibles.

## Casos de uso

- Inferencia local en estación de trabajo Strix Halo: despliegue de un modelo de gran tamaño en un equipo de 128 GB de memoria unificada, ejecutando una sola variante a la vez con el runtime propio y la PLE en NVMe. Es el escenario para el que el paquete fue construido.
- Asistente de código en entorno aislado: generación y revisión de código sin salida a servicios en la nube, aprovechando que todo el proceso de inferencia ocurre en hardware local y que el modelo base declara mejoras en tareas de programación frente a Qwen3.7-Plus.
- Automatización de tareas ofimáticas: resumen, reescritura y generación de documentos, apoyándose en las capacidades declaradas del modelo base en tareas de oficina.
- Evaluación de recetas de cuantización: comparación experimental entre Bf16Core-int4-int8 e int8Core-int4-int8 para medir el impacto del núcleo denso en BF16 frente a INT8 sobre la calidad de salida, con el mismo conjunto de expertos mixtos.
- Investigación en ejecución con memoria insuficiente: estudio de esquemas de lectura de embeddings desde SSD como alternativa a mantener tablas de gran tamaño residentes, un patrón reutilizable en otros modelos con tablas PLE.
- Pruebas de decodificación especulativa MTP: análisis del coste y beneficio de los 3 tokens especulativos, comparando la asignación de 76,85 GiB en modo ordinario frente a 78,52 GiB en MTP3 en la variante Bf16Core.
- Desarrollo de kernels y runtime para ROCm/gfx1151: banco de pruebas para el fork HawgAuto/vllm y para ajustes de kernel nativo en la pila ROCm.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye tablas de MMLU, HumanEval, GSM8K ni métricas equivalentes, ni para el modelo cuantizado ni para la comparación entre las dos variantes. Los únicos datos de rendimiento publicados son medidas de asignación de memoria en carga, reproducidas en la sección de requisitos de hardware.

## Requisitos de hardware

- Sistema objetivo: una variante a la vez sobre un equipo Strix Halo / gfx1151 de clase 128 GB, con el runtime personalizado y PLE respaldada por SSD.
- Asignación de memoria del modelo en carga, medida por el autor con contexto de 4.096 tokens y presupuesto de lote de 12.288 tokens: 76,85 GiB (Bf16Core-int4-int8) y 73,05 GiB (int8Core-int4-int8) en decodificación ordinaria; 78,52 GiB y 74,72 GiB respectivamente con MTP activado y 3 tokens especulativos.
- Presupuesto adicional obligatorio: 5,5 GiB de pool KV en las pruebas citadas, más asignaciones de grafos (0,06–0,21 GiB en esas ejecuciones), activaciones y espacios de trabajo, transitorios de carga y compilación, procesos de host y sistema operativo. Estas cifras no son memoria pico total del proceso ni una garantía de RAM mínima.
- Almacenamiento: al menos 200 GB de SSD libre por variante, sobre NVMe local rápido, más espacio para la imagen de servicio, caché y revisiones retenidas. Las dos variantes suman aproximadamente 373,48 GB de archivos de pesos. Tamaños declarados por variante completa (objetivo más draft): 188,84 GB / 175,87 GiB (Bf16Core) y 184,64 GB / 171,96 GiB (int8Core).
- Tabla PLE: 95,37 GiB que no deben asumirse residentes en RAM. Colocarla íntegramente en memoria del host consumiría aproximadamente esa misma cantidad, algo que el autor descarta en un sistema Strix Halo de memoria compartida.
- GPU consumer discreta: no disponible / no viable según los datos aportados. La asignación residente de 73–79 GiB excede la VRAM de cualquier GPU de consumo actual, incluidas tarjetas de 24 GB o 32 GB.
- GPU de centro de datos: no se documenta despliegue en A100, H100 ni similares; el paquete está ligado a la ruta rocm/gfx1151.
- Opciones de despliegue: fork HawgAuto/vllm con los cambios específicos de modelo. El autor advierte de que no debe asumirse compatibilidad con vLLM estándar. No se documentan rutas llama.cpp, Ollama, TGI ni GGUF para esta conversión concreta; sí existen GGUFs del modelo base publicados por terceros (unsloth/Qwen3.8-Flash-Next-GGUF) para otras rutas de despliegue.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| hstolte/Qwen3.8-Flash-Next-HALOLOOM | Cuantización INT4/INT8 mixta del modelo base, para gfx1151 | No confirmados en el repo (≈180.000 M totales / ≈6.000 M activos según fuentes secundarias) | No disponible | safetensors, 132 shards por variante | No disponible | Repositorio público en subida, 0 descargas, requiere runtime propio |
| Qwen/Qwen3.8-Flash-Next | Modelo base original | ≈180.000 M totales / ≈6.000 M activos según fuentes secundarias | No disponible | No disponible | No disponible | Repositorio oficial del modelo base |
| unsloth/Qwen3.8-Flash-Next-GGUF | Cuantizaciones GGUF del modelo base para otras rutas de despliegue | Los del modelo base | No disponible | GGUF | No disponible | Citado en resultados de búsqueda; no verificado en esta ficha |
| Kevletesteur/Qwen3.8-Flash-Next-StrixHalo-Verified | Runtime y verificación para Strix Halo | Los del modelo base | No disponible | No disponible | No disponible | Repositorio público según resultados de búsqueda |

## Limitaciones y advertencias

- Estado de publicación: el autor indica que la subida pública está en curso y que la verificación completa del paquete no ha terminado. No es una release pública cualificada.
- Compatibilidad: los checkpoints requieren cambios específicos de modelo en el runtime. No debe asumirse funcionamiento con vLLM estándar por el mero hecho de que existan archivos de pesos.
- Licencia no declarada: sin licencia publicada no puede determinarse si el uso comercial está permitido. Debe consultarse la licencia del modelo base antes de cualquier uso en producción.
- Idiomas no declarados: el repositorio no especifica los idiomas soportados ni su cobertura.
- Ausencia de benchmarks: no hay datos de calidad, precisión ni degradación por cuantización, ni comparación entre las dos variantes. El impacto del núcleo INT8 frente al BF16 sobre la calidad es desconocido.
- Benchmarks del modelo base: las afirmaciones de mejora en código y tareas de oficina proceden del repositorio oficial del modelo base y no han sido verificadas sobre estas cuantizaciones.
- Dependencia de SSD: el funcionamiento depende de un lector de filas PLE respaldado por SSD; sigue habiendo coste de E/S y de memoria del host. No es una solución de memoria cero.
- Presión de recursos: las cifras de carga publicadas corresponden a contexto de 4.096 tokens y lotes pequeños (cuatro secuencias en modo ordinario, una con MTP3). Contextos más largos, lotes mayores o cargas concurrentes elevan el requisito y pueden provocar fallos de memoria.
- Alucinación: riesgo inherente a los modelos generativos de este tipo; no se han publicado evaluaciones de fidelidad específicas para esta conversión.
- Sesgos: no se documenta ningún análisis de sesgos en la información disponible.
- Madurez del modelo base: se describe como una vista previa experimental de la arquitectura que sustentará Qwen4, lo que implica riesgo de cambios e inestabilidad en el ecosistema de herramientas.
- Validación comunitaria nula: 0 descargas y 0 «likes» en el momento de los datos; no existe evidencia pública de despliegues correctos por terceros.
- Discrepancia de tamaños: el repositorio del Hub declara 153,6 GB, por debajo de los totales por variante indicados en la model card (184,86 GB y 180,66 GB de checkpoint objetivo). Es coherente con una subida incompleta, pero el autor no lo aclara.

## Enlaces

- Repositorio del modelo en HuggingFace: https://huggingface.co/hstolte/Qwen3.8-Flash-Next-HALOLOOM
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Repositorio del modelo base en GitHub: https://github.com/QwenLM/Qwen3.8-Flash-Next/
- Herramienta HaloLoom: https://github.com/HawgAuto/HaloLoom
- Fork de vLLM para el servicio: https://github.com/HawgAuto/vllm
- Artículo sobre despliegue local y hardware: https://www.runaihome.com/blog/qwen38-flash-next-local-ai-hardware-guide-2026/
- Guía de despliegue en Windows sobre Strix Halo: https://github.com/olliehm/qwen-flash-next-windows
- Repositorio de verificación para Strix Halo: https://huggingface.co/Kevletesteur/Qwen3.8-Flash-Next-StrixHalo-Verified
- AMD Quark (herramienta de cuantización citada por el autor): enlace no proporcionado en la información disponible.
