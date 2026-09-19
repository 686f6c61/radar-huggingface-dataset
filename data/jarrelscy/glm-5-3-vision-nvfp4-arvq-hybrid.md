# jarrelscy/GLM-5.3-Vision-NVFP4-ARVQ-hybrid

## Resumen

GLM-5.3-Vision-NVFP4-ARVQ-hybrid es un artefacto de pesos publicado en HuggingFace por el usuario `jarrelscy`. Se trata de una conversión experimental de cuantización mixta aplicada sobre un modelo multimodal de la familia GLM-5 (etiqueta `glm5v`), con 186.827.108.584 parámetros reales contabilizados en los ficheros safetensors. La model card describe una arquitectura de mezcla de expertos (MoE) con 75 capas de este tipo, sobre las que se aplica una política diferenciada: expertos "hot" cuantizados en NVFP4 y expertos "cold" cuantizados con ARVQ v3, con asignación de presupuesto REAP puntuada por ARVQ.

El punto clave es que se trata de un trabajo en curso, no de un modelo terminado. Solo 19 de las 75 capas MoE han sido sustituidas por la campaña secuencial de "PV" sobre el corpus completo; el resto conserva los pesos publicados previamente. Cada capa sustituida se publica como un par de ficheros tensoriales junto con sus informes, reemplazados en un único commit, y el progreso se documenta en un fichero `pv_progress.json`. El autor advierte explícitamente de que la paridad nativa en SM120 y la calidad del modelo completo "permanecen sin verificar".

Su relevancia es principalmente de investigación: explora hasta dónde se puede comprimir un MoE multimodal de gran tamaño combinando formatos de 4 bits (NVFP4) con una cuantización vectorial por experto (ARVQ), entrenando libros por experto restringidos a FP4 y escalas por bloque restringidas a FP8. No hay licencia declarada, ni idiomas, ni benchmarks publicados, por lo que su uso en producción no está respaldado por ninguna garantía documental.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE); la model card menciona 75 capas MoE; topología completa (número de expertos, expertos activos, atención) no disponible |
| Parametros totales | 186.827.108.584 (aprox. 186,8 mil millones) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible; el contexto de 1024 tokens que aparece en la model card corresponde al entrenamiento de la campaña de cuantización, no a la ventana del modelo |
| Tipos de cuantizacion | Híbrida: NVFP4 en expertos "hot", ARVQ v3 en expertos "cold"; escalas por bloque restringidas a FP8 y libros por experto restringidos a FP4 durante el entrenamiento. Etiqueta declarada: "8-bit" |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (librería declarada: vllm) |
| Tamaño del repositorio | 1058,6 GB |
| Descargas / likes | 479 descargas, 2 likes |
| Publicación / actualización | 14 de septiembre de 2026 / 18 de septiembre de 2026 |

## Arquitectura y entrenamiento

El modelo base es un transformer multimodal de la familia GLM-5 con capas MoE; la model card indica que se han procesado 75 capas de este tipo y que el backbone, los expertos "hot", el módulo MTP en BF16, los componentes de visión y la asignación de expertos se mantienen sin cambios. La intervención se centra únicamente en los expertos "cold", que pasan a un esquema ARVQ v3 por experto. La asignación del presupuesto de cuantización se realiza mediante REAP puntuado por ARVQ, y en la campaña publicada hasta la fecha se han reemplazado 19 de las 75 capas MoE.

El procedimiento de entrenamiento descrito es de destilación con objetivos fijos: las entradas del "student" reflejan las capas superiores ajustadas que se conservan, mientras que los objetivos de referencia proceden de los expertos enrutados originales en FP8 y del backbone donante; una caché rodante mantiene ambas trayectorias. Se recorren 18.001.846 tokens de texto con contexto 1024, con conjuntos fijos de validación y auditoría de desarrollo de 16.384 tokens cada uno. Adam optimiza libros por experto restringidos a FP4 y escalas por bloque restringidas a FP8, con lote efectivo de 262.144 tokens acumulados en cuatro pasadas de 65.536. Las capas 4 a 77 usan 69 actualizaciones con tasas de aprendizaje de 0,048/0,032 hasta la actualización 45 y de 0,012/0,008 después; la capa 3 conserva un refinamiento de tasa más baja cualificado por separado. La reasignación de índices por gradiente de salida se produce cada 20 actualizaciones y la validación cada 5, reteniendo el mejor checkpoint. La publicación se condiciona a la no regresión en auditoría y a la reproducibilidad de la exportación.

Como caveat técnico relevante, la aritmética "cold" emula planos de activación FP4 y fronteras FP16: no se ha validado sobre hardware nativo, y el propio autor señala que la paridad en SM120 y la calidad del modelo completo están sin verificar. El conjunto de auditoría es además datos históricos de desarrollo, no un conjunto de test final intacto.

## Capacidades

- Generación de texto y conversación: es un modelo de lenguaje de gran escala con 186,8 mil millones de parámetros, orientado a generación y razonamiento; no hay evaluación publicada que lo confirme tras la cuantización.
- Procesamiento multimodal: la etiqueta `glm5v` y la mención a "vision components" indican que conserva la torre de visión del modelo base, por lo que se le supone entrada de imagen además de texto. El alcance exacto (resolución, número de imágenes, OCR, vídeo) no está documentado.
- Mezcla de expertos: el enrutamiento por experto se mantiene sin cambios, de modo que el modelo conserva el comportamiento de activación dispersa del modelo original.
- Predicción multi-token (MTP): se conserva el módulo MTP en BF16 según la model card, lo que puede aprovecharse para decodificación especulativa en servidores compatibles.
- Tool calling / function calling: no disponible; la model card no documenta plantillas de herramientas ni soporte de agentes.
- Capacidades de agente y razonamiento multi-paso: no disponible.
- Modo "thinking" o razonamiento extendido: no disponible.
- Capacidades multilingües: no disponible; no se declaran idiomas soportados.
- Audio: no disponible.

## Casos de uso

- Investigación en cuantización de MoE: el modelo sirve como caso de estudio para medir el impacto de sustituir expertos "cold" por ARVQ v3 manteniendo expertos "hot" en NVFP4. Se compararía la perplejidad y las salidas del modelo cuantizado contra las del modelo base en FP8, capa por capa, usando los informes publicados junto a cada par de tensores.
- Validación de kernels NVFP4 en SM120: dado que la model card reconoce que la paridad nativa en SM120 no está verificada, un equipo con GPU Blackwell puede usar este repositorio para comprobar la corrección numérica de los kernels FP4 frente a la emulación empleada durante el entrenamiento.
- Servicio de inferencia con vLLM: la librería declarada es vLLM y el formato es safetensors, por lo que el despliegue natural es un servidor vLLM multi-GPU. Requiere un clúster de gama alta; véase la sección de hardware.
- Reproducción de la campaña de destilación: los detalles de lote efectivo, tasas de aprendizaje, cadencia de validación y reasignación de índices permiten replicar el proceso sobre las capas restantes (56 de 75 pendientes), comparando el checkpoint retenido con el conjunto de auditoría fijo de 16.384 tokens.
- Asistente multimodal de documentos: si la torre de visión funciona según lo previsto, el modelo podría atender consultas sobre imágenes y texto en un único contexto. Es un uso plausible pero sin validación publicada, por lo que exigiría una fase de evaluación interna previa.
- Auditoría de artefactos de pesos en HuggingFace: el repositorio es un ejemplo útil para estudiar cómo se publican conversiones incrementales (un commit por capa, `pv_progress.json`, informes adjuntos) y para diseñar políticas de trazabilidad de pesos.
- Pruebas de estrés de memoria y planificación de capacidad: con 1058,6 GB de repositorio y 186,8 mil millones de parámetros, sirve para dimensionar clústeres, medir tiempos de carga de safetensors y ajustar la configuración de tensor parallelism en vLLM.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente menciona métricas internas del proceso de cuantización (no regresión frente a conjuntos de auditoría de desarrollo de 16.384 tokens), sin cifras de MMLU, HumanEval, GSM8K ni ninguna otra evaluación estándar, y sin comparación con el modelo base.

## Requisitos de hardware

- Estimación de pesos: a 8 bits, 186,8 mil millones de parámetros ocupan aproximadamente 187 GB; a 4 bits, en torno a 93 GB. Al tratarse de una mezcla NVFP4/ARVQ cuya proporción exacta de expertos "hot" y "cold" no se publica, el rango razonable se sitúa entre unos 95 GB y unos 190 GB solo en pesos.
- Memoria adicional: hay que sumar caché KV, activaciones y buffers de enrutamiento. Estos valores dependen de la longitud de contexto y del número de cabezas KV, datos no disponibles, por lo que no se puede dar una cifra fiable.
- Repositorio: 1058,6 GB en disco. Conviene prever almacenamiento en NVMe y descarga por partes, ya que supera ampliamente el tamaño de los pesos finales (probablemente incluye checkpoints intermedios e informes).
- GPUs recomendadas: para cubrir el rango alto con margen, 8×H100 80 GB (640 GB) o 8×A100 80 GB; alternativas con menos tarjetas serían 4×H200 141 GB o 4×B200. Para el extremo bajo (si la mezcla es mayoritariamente de 4 bits y se usa contexto corto), podría plantearse 2×RTX 6000 Ada 48 GB o 2×L40S 48 GB, siempre con verificación empírica.
- GPU de consumo: no es viable en una RTX 4090 (24 GB de VRAM) ni en configuraciones de dos tarjetas de consumo. El propio repositorio apunta a SM120 para la ruta nativa NVFP4, que corresponde a la gama Blackwell, no a las GPUs de consumo habituales en inferencia local.
- Opciones de despliegue: vLLM es la librería declarada y la única confirmada por el autor. No hay GGUF publicado, por lo que llama.cpp y Ollama no están soportados con los ficheros actuales; TGI y SGLang no están confirmados.
- Latencia y throughput: no disponible. No se han publicado mediciones de tokens por segundo, ni de tiempo hasta el primer token, ni de escalado con tensor parallelism.

## Comparativa con modelos similares

| Modelo | Parametros | Parametros activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GLM-5.3-Vision-NVFP4-ARVQ-hybrid (este) | 186,8 mil millones | no disponible | no disponible | no disponible | HuggingFace, safetensors, vLLM |
| GLM-5.3-Vision (modelo base) | no disponible | no disponible | no disponible | no disponible | no disponible en la información proporcionada |
| DeepSeek-V3 | 671 mil millones | 37 mil millones | 128k | licencia propia con permisos de uso comercial | pesos abiertos en HuggingFace |
| Qwen3-235B-A22B | 235 mil millones | 22 mil millones | 128k | Apache 2.0 | pesos abiertos en HuggingFace |

Nota: los datos de DeepSeek-V3 y Qwen3-235B-A22B proceden de sus fichas públicas conocidas y no forman parte de la información proporcionada en esta búsqueda; se incluyen únicamente como referencia de categoría (MoE de gran tamaño con pesos abiertos). Para el modelo base GLM-5.3-Vision no se dispone de especificaciones, por lo que la comparación directa de rendimiento no es posible. No se dispone de ningún benchmark que permita situar a este modelo frente a las alternativas.

## Limitaciones y advertencias

- Conversión incompleta: solo 19 de las 75 capas MoE han sido sustituidas. El modelo es una mezcla de pesos cuantizados nuevos y pesos previamente publicados, lo que complica la reproducibilidad y hace que el estado del artefacto cambie con cada actualización del repositorio.
- Calidad sin verificar: la model card afirma explícitamente que la paridad nativa en SM120 y la calidad del modelo completo "permanecen sin verificar". No hay benchmarks publicados.
- Validación no independiente: el conjunto de auditoría es "datos históricos de desarrollo, no un conjunto de test final intacto", según el propio autor. No sirve como evidencia de generalización.
- Emulación en lugar de hardware nativo: la aritmética "cold" emula planos FP4 y fronteras FP16, por lo que el comportamiento real en GPUs con soporte nativo NVFP4 puede diferir.
- Licencia ausente: no se declara licencia alguna. Sin licencia explícita, no hay autorización clara para uso comercial ni para redistribución; hay que contactar con el autor antes de cualquier despliegue productivo.
- Idiomas no declarados: se desconoce la cobertura multilingüe real y su calidad tras la cuantización.
- Contexto no declarado: la ventana de contexto del modelo base no se documenta; el valor de 1024 tokens que aparece en la model card es el contexto de entrenamiento de la campaña de cuantización y no debe confundirse con la capacidad de inferencia.
- Riesgo de alucinación: no hay evaluación publicada. Al ser un modelo de gran escala orientado a generación, el riesgo de alucinación es intrínseco y no está cuantificado para esta versión.
- Sesgos: no se documenta ninguna evaluación de sesgos, toxicidad o equidad en la información disponible.
- Coste de infraestructura: 1058,6 GB de repositorio y un rango estimado de 95 a 190 GB solo en pesos implican clústeres multi-GPU y almacenamiento NVMe de gama alta; no es desplegable en hardware de consumo.
- Estabilidad de la API: al ser un artefacto experimental con actualizaciones frecuentes, los pesos y los informes pueden cambiar sin aviso, lo que rompe la reproducibilidad de experimentos que fijen una revisión concreta.
- Documentación críptica: términos como "campaña PV", "REAP" o "ARVQ v3" no se definen en la model card, lo que dificulta la replicación del método sin ingeniería inversa.

## Enlaces

- HuggingFace: https://huggingface.co/jarrelscy/GLM-5.3-Vision-NVFP4-ARVQ-hybrid
- Fichero de progreso citado en la model card: `pv_progress.json` (dentro del repositorio de HuggingFace)
- No se han encontrado en la búsqueda web enlaces relevantes al modelo, papers, blogs, repositorios de código ni demos. Los resultados devueltos corresponden a servicios de streaming de televisión (ARTE, ARD Mediathek, ZDFmediathek) y no guardan relación con el modelo.
