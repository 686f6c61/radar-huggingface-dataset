# snupilab/Rep4Act-Asymmetric-MMDiT-4B-FM-Pretrained-100k-seed0

## Resumen

Rep4Act-Asymmetric-MMDiT-4B-FM-Pretrained-100k-seed0 es un modelo de investigación publicado por el laboratorio snupilab en Hugging Face, etiquetado dentro del pipeline de robótica y asociado a la línea "Rep4Act". Por el nombre y los tags (robotics, pretraining), se trata de un modelo de política para control robótico entrenado mediante preentrenamiento a gran escala sobre 100.000 episodios o muestras (el sufijo "100k") con una semilla concreta (seed0), lo que sugiere que forma parte de una familia de modelos con variantes por semilla.

La nomenclatura "Asymmetric-MMDiT-4B" apunta a una arquitectura de tipo Diffusion Transformer multimodal (MMDiT, el tipo de backbone usado en modelos de difusión de imagen como Stable Diffusion 3) con un diseño asimétrico, presumiblemente diferenciando el procesamiento de las distintas modalidades de entrada (observaciones visuales, estados propioceptivos y acciones). El sufijo "FM-Pretrained" indica que se distribuyen los pesos del modelo base preentrenado (foundation model), no un modelo afinado para una tarea concreta.

El modelo cuenta con aproximadamente 5.840 millones de parámetros reales en safetensors (aunque se etiqueta como "4B", probablemente por los parámetros activos o por el tamaño del backbone principal) y un repositorio de 19,7 GB. Es relevante como pieza de investigación en el área emergente de los foundation models para robótica, aunque su acceso está restringido (gated) y la información pública disponible es muy limitada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MMDiT asimétrico (Diffusion Transformer multimodal), segun nomenclatura del modelo |
| Parametros totales | 5.840.181.793 (aprox. 5,84 mil millones) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La información pública no detalla la arquitectura interna más allá de lo que sugiere el nombre: un MMDiT (Multimodal Diffusion Transformer) con diseño asimétrico, orientado a robótica. Los MMDiT son transformers que procesan múltiples modalidades mediante flujos paralelos con mecanismos de atención conjunta; el calificativo "asimétrico" indica que las ramas de cada modalidad no comparten la misma configuración (número de capas, dimensión o tratamiento de tokens). En el contexto robótico, esto se traduce habitualmente en una rama para observaciones visuales, otra para el estado del robot y una cabeza de difusión para generar secuencias de acciones.

El modelo se presenta como preentrenado ("FM-Pretrained") sobre un conjunto de 100.000 muestras o episodios, con una semilla fija (seed0). No se dispone de información sobre el número de tokens, la composición del dataset, el uso de RLHF/DPO ni innovaciones técnicas específicas más allá de lo inferible del nombre. Tampoco se documenta si emplea decodificación especulativa, atención lineal u otras optimizaciones.

## Capacidades

- Generación de acciones robóticas mediante difusión: la cabeza MMDiT produce trayectorias o secuencias de acciones condicionadas a observaciones, típico de políticas de imitación basadas en difusión.
- Procesamiento multimodal: integración de entradas visuales y de estado propioceptivo en un único backbone transformer.
- Preentrenamiento como foundation model: los pesos publicados sirven como base para afinado posterior en tareas robóticas específicas.
- No se dispone de información sobre soporte de tool calling, function calling, agentes, capacidades multilingües, modo thinking, visión general o audio.

## Casos de uso

- Afinado para manipulación robótica: partir de los pesos preentrenados y ajustar con demostraciones específicas de una tarea (por ejemplo, ensamblaje o pick-and-place) para obtener una política de difusión especializada.
- Investigación en políticas de imitación: usar el modelo como baseline preentrenado en experimentos comparativos sobre aprendizaje por imitación en entornos simulados.
- Evaluación de arquitecturas MMDiT en robótica: estudiar cómo se comporta un backbone de difusión multimodal asimétrico frente a alternativas tipo transformer autoregresivo o políticas CNN.
- Reproducción de experimentos con semilla controlada: al publicarse variantes por semilla (seed0), permite analizar la varianza entre inicializaciones en el preentrenamiento.
- Generación de trayectorias en simulación: emplear el modelo para producir secuencias de acciones en entornos simulados antes de transferir a hardware real.
- Base para destilación: usar el modelo grande como profesor para destilar políticas más pequeñas y desplegables en robots con cómputo limitado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 5,84 mil millones de parámetros, en FP16 se requieren aproximadamente 11,7 GB solo para pesos; en BF16, similar. En cuantización de 8 bits, alrededor de 6 GB; en 4 bits, unos 3 GB (estimaciones teóricas, sin datos oficiales del autor).
- GPU recomendadas: para FP16/BF16 sin offloading, una GPU con 16 GB o más (RTX 4090, A100 40 GB, H100). Para cuantización 8 bits, una RTX 3080/4080 de 10-12 GB podría ser suficiente en teoría.
- Cabe en GPU de consumo: probablemente sí en RTX 4090 (24 GB) en FP16, y en GPUs de 12-16 GB con cuantización, aunque no hay confirmación oficial.
- Opciones de despliegue: no disponible. Al ser un modelo de robótica con pesos safetensors y arquitectura de difusión, no se garantiza compatibilidad con vLLM, llama.cpp u Ollama; requeriría un runtime específico del proyecto.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Rep4Act-Asymmetric-MMDiT-4B (este) | ~5,84 B | no disponible | Política robótica por difusión | no disponible | Gated en HF |
| Modelos comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información suficiente para establecer una comparativa fiable con alternativas de la misma categoría (políticas robóticas basadas en difusión o foundation models para robótica), dado que no se documentan benchmarks ni especificaciones detalladas.

## Limitaciones y advertencias

- Acceso restringido: el repositorio es gated y requiere aceptar condiciones en Hugging Face, lo que limita su uso y reproducibilidad.
- Licencia no especificada: no se puede determinar si el uso comercial está permitido; debe consultarse con los autores antes de cualquier despliegue productivo.
- Información técnica mínima: no hay documentación pública sobre datos de entrenamiento, composición del dataset, sesgos o evaluación, lo que impide valorar su robustez.
- Riesgo de alucinación y fallos de política: como modelo generativo de acciones, puede producir trayectorias no seguras o fuera de distribución en entornos no vistos.
- Sin garantías para producción: al ser un modelo de investigación con 0 descargas y 0 likes, no hay evidencia de validación externa.
- Idiomas y contexto: no disponible; no se puede confirmar soporte multilingüe ni longitud de contexto.
- Posibles sesgos derivados de los datos de preentrenamiento robótico, no documentados.

## Enlaces

- Hugging Face: https://huggingface.co/snupilab/Rep4Act-Asymmetric-MMDiT-4B-FM-Pretrained-100k-seed0
