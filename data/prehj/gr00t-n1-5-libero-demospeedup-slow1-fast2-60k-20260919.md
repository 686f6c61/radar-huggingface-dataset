# prehj/GR00T-N1.5-libero-demospeedup-slow1-fast2-60k-20260919

## Resumen

Este modelo es un ajuste fino (fine-tune) del modelo fundacional de robótica NVIDIA GR00T-N1.5-3B, publicado por el usuario prehj bajo el identificador `prehj/GR00T-N1.5-libero-demospeedup-slow1-fast2-60k-20260919`. Se trata de un checkpoint de investigación orientado a la reproducción de la técnica DemoSpeedup sobre el benchmark de manipulación LIBERO, con una política de retiming de demostraciones que usa stride 1 para la fase lenta (slow) y stride 2 para la fase rápida (casual), sustituyendo los strides 2/4 de un experimento anterior. El entrenamiento se realizó durante 60.000 pasos con semilla 42 y batch global 32.

El modelo hereda la arquitectura visión-lenguaje-acción (VLA) del modelo base de NVIDIA, que combina una columna vertebral de comprensión de imagen y lenguaje con un módulo de generación de acciones; en este caso el peso total asciende a 2.724.114.368 parámetros. El pipeline declarado en HuggingFace es `robotics` y los pesos se distribuyen en formato safetensors, con un repositorio de 7,6 GB que incluye los pesos finales de inferencia, la configuración del modelo y la configuración del experimento con estadísticas de normalización.

Su relevancia es acotada y estrictamente experimental: el propio autor indica que el modelo no ha sido evaluado todavía, no declara licencia ni idiomas soportados, y acumula cero descargas. No es un modelo listo para producción, sino un artefacto de reproducibilidad para investigadores que trabajen en el efecto del retiming temporal de demostraciones sobre políticas robóticas.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible en la model card del fine-tune (modelo base: NVIDIA GR00T-N1.5-3B, familia visión-lenguaje-acción) |
| Parametros totales | 2.724.114.368 (aproximadamente 2,72 mil millones) |
| Parametros activos | no aplica / no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Modelo base | nvidia/GR00T-N1.5-3B |
| Pipeline (HuggingFace) | robotics |
| Tamano del repositorio | 7,6 GB |
| Pasos de entrenamiento | 60.000 |
| Batch global | 32 |
| Semilla | 42 |
| Fecha de publicacion | 2026-09-19 |

## Arquitectura y entrenamiento

La model card del fine-tune no describe la arquitectura interna; la información disponible se limita a la indicación de que se parte de `nvidia/GR00T-N1.5-3B`, un modelo fundacional de NVIDIA para robótica de la familia GR00T N1.5. No se documentan en este repositorio el número de capas, la dimensión oculta, el mecanismo de atención ni el diseño del módulo de acciones.

En cuanto al entrenamiento, la model card indica que se trata de una reproducción de DemoSpeedup sobre LIBERO, con precisión (slow) a stride 1 y casual (fast) a stride 2. Se reutilizaron las etiquetas de entropía y segmentación ya guardadas de ejecuciones previas, y las acciones delta se acumulan sobre los grupos fusionados. El cambio respecto al experimento anterior (2/4) es precisamente el par de strides de retiming. El repositorio conserva los pesos finales de inferencia, la configuración del modelo y la configuración del experimento, incluidas las estadísticas de normalización; el estado del optimizador, del scheduler y del generador de números aleatorios se omite para reducir el almacenamiento. Los detalles y hashes de archivos se encuentran en `reproduction.json`. No se especifica la composición del dataset más allá de LIBERO, ni si hubo etapas de RLHF, DPO o aprendizaje por imitación adicionales sobre el checkpoint base.

## Capacidades

- Generación de acciones motoras para manipulación robótica: al derivar de un modelo visión-lenguaje-acción, se espera que produzca comandos de acción a partir de observaciones visuales e instrucciones en lenguaje, aunque el autor no aporta ninguna validación empírica de esta capacidad.
- Manejo de acciones delta acumuladas sobre grupos fusionados de demostraciones, que es la modificación metodológica central de este experimento.
- Retiming temporal de demostraciones con strides asimétricos (slow 1, fast 2), capacidad que solo tiene sentido en el contexto del pipeline DemoSpeedup.
- Soporte de tool calling o function calling: no disponible; no es una capacidad propia del pipeline de robótica declarado.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles; no se declara ningún idioma en la ficha de HuggingFace.
- Capacidades especiales (modo thinking, audio, vídeo): no disponibles.
- Evaluación de rendimiento: ninguna; la model card afirma explícitamente que el modelo no ha sido evaluado.

## Casos de uso

- Reproducción de experimentos DemoSpeedup: el checkpoint permite replicar la configuración concreta de strides 1/2, semilla 42 y 60.000 pasos, y contrastarla con el experimento previo de strides 2/4 para aislar el efecto del retiming temporal en la política resultante.
- Estudios de ablación sobre retiming de demostraciones: sirve como punto de una rejilla experimental en la que se varían los strides y se mide la tasa de éxito en LIBERO, siempre que se disponga del resto de checkpoints y de un protocolo de evaluación propio.
- Evaluación de políticas en el benchmark LIBERO: puede cargarse como política de manipulación en simulación para ejecutar rollouts sobre las suites de tareas de LIBERO y obtener métricas de éxito, dado que el autor no las proporciona.
- Punto de partida para fine-tuning posterior: al incluir configuración y estadísticas de normalización, es utilizable como inicialización para ajustes en otros entornos o conjuntos de demostraciones del mismo dominio.
- Investigación sobre acumulación de acciones delta: permite estudiar cómo afecta la agregación de deltas sobre grupos fusionados a la estabilidad y a la suavidad de las trayectorias generadas, un problema relevante para el diseño de esquemas de action chunking.
- Baseline en comparativas de modelos VLA de escala 3B: dado su recuento de parámetros (2,72 mil millones), es un candidato razonable como referencia de bajo coste computacional en estudios comparativos de políticas robóticas en simulación.
- Docencia y formación técnica: el repositorio ilustra un flujo completo de fine-tuning de un VLA con gestión de pesos, configuración de experimento y normalización, útil como material didáctico sobre reproducibilidad en aprendizaje automático.
- Auditoría de reproducibilidad: la publicación de hashes en `reproduction.json` permite verificar la integridad del artefacto en revisiones de terceros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica de forma explícita que el modelo no ha sido evaluado todavía ("This model has not yet been evaluated"), por lo que no existen cifras de tasa de éxito en LIBERO, ni métricas de ningún otro tipo.

## Requisitos de hardware

- VRAM estimada para inferencia, calculada a partir del recuento de parámetros (estimación propia, no publicada por el autor): aproximadamente 10,9 GB en FP32, 5,5 GB en BF16/FP16 y alrededor de 2,7 GB en 8 bits, 1,4 GB en 4 bits, sin contar activaciones, el codificador visual ni el coste de los pasos de difusión del módulo de acciones.
- En la práctica, con activaciones y preprocesado de imagen conviene reservar entre 8 y 16 GB de VRAM en BF16, por lo que cabe en GPU de consumo como RTX 3090, RTX 4080 o RTX 4090 con 16-24 GB.
- GPU de centro de datos recomendadas para entrenamiento o para lotes grandes de inferencia: A100 (40/80 GB), H100, L40S. El repositorio pesa 7,6 GB, lo que es coherente con el checkpoint de pesos en precisión mixta.
- Opciones de despliegue: el ecosistema público de GR00T se sirve mediante PyTorch; no se declara compatibilidad con vLLM, llama.cpp, Ollama ni TGI en la información disponible, y estos motores están orientados a modelos de lenguaje, no a políticas VLA completas.
- Latencia y throughput: no disponibles. No se publican mediciones de frecuencia de inferencia ni de tiempo por episodio.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Rendimiento |
|---|---|---|---|---|---|
| prehj/GR00T-N1.5-libero-demospeedup-slow1-fast2-60k | 2,72 mil millones | no disponible | no disponible | HuggingFace, 0 descargas, sin evaluar | no disponible |
| nvidia/GR00T-N1.5-3B (modelo base) | aproximadamente 3 mil millones (denominacion del modelo) | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada | HuggingFace, modelo oficial de NVIDIA | no disponible en la informacion proporcionada |
| Otros fine-tunes de GR00T N1.5 sobre LIBERO | no disponible | no disponible | no disponible | no disponible en la informacion proporcionada | no disponible |
| OpenVLA (familia de VLA de 7B) | no disponible en la informacion proporcionada | no disponible | no disponible | no disponible en la informacion proporcionada | no disponible |

No se dispone de datos verificados de parámetros, contexto o rendimiento de los modelos alternativos dentro de la información proporcionada. La comparación cuantitativa con alternativas como OpenVLA o π0 no puede realizarse sin recurrir a fuentes externas, por lo que se marca como no disponible.

## Limitaciones y advertencias

- Ausencia total de evaluación: el autor afirma que el modelo no ha sido evaluado, de modo que no existe evidencia de que la política funcione en LIBERO ni en ningún otro entorno.
- Licencia no declarada: al no especificarse licencia en la ficha de HuggingFace, el uso comercial queda en un limbo jurídico; adicionalmente, se desconoce qué condiciones impone el modelo base `nvidia/GR00T-N1.5-3B`, cuyos términos podrían propagarse al derivado.
- Sesgos conocidos: no disponibles. No se documenta ningún análisis de sesgo, ni de comportamiento diferencial por tipo de tarea, objeto o instrucción.
- Riesgo de alucinación y de acciones incorrectas: inherente a cualquier política aprendida por imitación; sin evaluación no puede cuantificarse la tasa de fallo ni el modo de fallo dominante.
- Sesgo de dominio: el entrenamiento se limita a demostraciones de LIBERO, un entorno simulado; no hay evidencia de transferencia a robots reales ni a tareas fuera de la distribución del dataset.
- Restricciones de contexto e idioma: no se declara longitud de contexto ni idiomas soportados, lo que impide planificar despliegues multilingües.
- Reproducibilidad incompleta del entrenamiento: el estado del optimizador, del scheduler y del generador aleatorio se omitió, por lo que no es posible reanudar el entrenamiento desde el checkpoint, solo ejecutar inferencia o partir de los pesos.
- Semilla única: los resultados proceden de una sola ejecución con semilla 42, sin repeticiones que permitan estimar la varianza.
- Trazabilidad limitada: cero descargas y cero valoraciones en el momento de la consulta, sin revisión por pares ni validación de la comunidad.
- Advertencia sobre la búsqueda web: los resultados devueltos por la búsqueda no contienen información relacionada con este modelo; todas las entradas corresponden a páginas de cuestionarios diarios de Bing, sin ninguna relación con robótica ni con GR00T.

## Enlaces

- Página del modelo en HuggingFace: https://huggingface.co/prehj/GR00T-N1.5-libero-demospeedup-slow1-fast2-60k-20260919
- Modelo base en HuggingFace: https://huggingface.co/nvidia/GR00T-N1.5-3B
- Archivo de detalles y hashes del experimento, referenciado en la model card: `reproduction.json` (incluido en el repositorio del modelo)
- Papers, blogs, repositorios y demos adicionales: no disponibles en la información proporcionada. La búsqueda web realizada no devolvió ningún enlace relevante al modelo.
