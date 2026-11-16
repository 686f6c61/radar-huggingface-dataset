# Donghyun1228/pi05-libero-lape-curve-expert-copy-20261116

## Resumen

El repositorio `Donghyun1228/pi05-libero-lape-curve-expert-copy-20261116` es un checkpoint de investigación publicado en Hugging Face por el usuario Donghyun1228. Según la model card, se trata de un reentrenamiento del control "expert copy" del 9 de noviembre de 2026 sobre una variante del modelo pi0.5 (π0.5) aplicada al benchmark de manipulación robótica LIBERO, con cabecera IDM separada (LAPE) y configuración "Large / Yaw30". El autor ha guardado checkpoints intermedios en los pasos 1k, 2k, 3k, 5k, 7k y 10k de entrenamiento, exportando cada uno con una regla fija: visión preparada de origen y visión de muñeca tomada de la fuente.

No es un modelo de lenguaje de propósito general ni un modelo listo para producción: es un artefacto experimental de un pipeline de investigación en robótica y aprendizaje por imitación, con un tamaño de repositorio de 92,6 GB que sugiere pesos de un modelo grande de política visomotora (posiblemente con múltiples checkpoints empaquetados). La información pública disponible es mínima: no hay licencia declarada, ni idiomas, ni pipeline, ni descargas, ni likes, y la model card se limita a una descripción de una línea sobre el protocolo de entrenamiento.

Por tanto, esta ficha describe lo que se puede inferir de forma rigurosa a partir de los datos disponibles y marca explícitamente como "no disponible" todo aquello que el autor no ha publicado. Es relevante ahora únicamente para investigadores que sigan la línea de trabajo de π0.5 sobre LIBERO y quieran reproducir o comparar curvas de entrenamiento con cabecera IDM separada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (por el nombre del repo, variante de pi0.5 con cabecera IDM separada; no confirmado en la model card) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible (el repo ocupa 92,6 GB; no se especifica safetensors, GGUF ni otro formato) |

## Arquitectura y entrenamiento

La model card indica que se trata de un reentrenamiento del control "expert copy" del 9 de noviembre de 2026, con configuración "Large / Yaw30", sobre el entorno LIBERO y con la variante pi0.5 como base. El nombre del repositorio menciona una "LAPE separate-IDM-head", es decir, una cabecera de modelo de dinámica inversa (IDM) separada dentro del esquema LAPE. No se detalla en la información proporcionada la arquitectura interna (transformer, MoE, híbrida u otra), el número de parámetros, el volumen de datos de entrenamiento ni si se aplicaron técnicas de RLHF, DPO o similares.

El aspecto técnico mejor documentado es el protocolo de exportación: se guardan checkpoints tras 1k, 2k, 3k, 5k, 7k y 10k actualizaciones, y cada paso se exporta con la regla del 9 de noviembre (visión de origen preparada y visión de muñeca tomada de la fuente). Esta granularidad permite trazar curvas de aprendizaje y comparar el efecto de la cabecera IDM separada a lo largo del entrenamiento, que es precisamente el propósito declarado del artefacto.

## Capacidades

- Entrenamiento y evaluación de políticas visomotoras sobre el benchmark LIBERO (manipulación robótica), según la model card.
- Cabecera IDM separada (LAPE separate-IDM-head) para el modelado de dinámica inversa en el pipeline experimental.
- Exportación de checkpoints intermedios en 1k, 2k, 3k, 5k, 7k y 10k pasos para análisis de curvas de entrenamiento.
- No se documentan capacidades de generación de texto, razonamiento, código, matemáticas, visión general, tool calling, agentes ni multilingüismo.
- No se documenta modo thinking, audio ni otras capacidades especiales.

## Casos de uso

- Reproducción de curvas de entrenamiento: cargar los checkpoints de 1k a 10k y medir la evolución de la tasa de éxito en tareas LIBERO para estudiar el efecto de la cabecera IDM separada.
- Comparación de configuraciones: contrastar esta variante "Large / Yaw30" con el control "expert copy" del 9 de noviembre para aislar el impacto del reentrenamiento y de la regla de exportación.
- Investigación en aprendizaje por imitación: usar los pesos como referencia en experimentos de políticas visomotoras con visión de muñeca y visión de origen separadas.
- Análisis de estabilidad del entrenamiento: los checkpoints intermedios permiten detectar sobreajuste, colapso o mesetas entre 1k y 10k pasos.
- Ablación de la cabecera IDM: comparar el rendimiento con y sin cabecera separada en el mismo entorno y presupuesto de cómputo.
- Base para fine-tuning en robótica: partir de un checkpoint intermedio (por ejemplo, 5k o 7k) para adaptar la política a una tarea o morfología distinta, siempre que la licencia lo permita (actualmente no declarada).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tasas de éxito en LIBERO, métricas de pérdida ni comparaciones numéricas con otros checkpoints.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El tamaño del repo (92,6 GB) sugiere pesos de gran volumen, posiblemente con varios checkpoints empaquetados, pero no se especifica el tamaño de un checkpoint individual.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no disponible; al tratarse de una política robótica y no de un LLM, estas herramientas probablemente no sean aplicables, pero no se confirma en la información.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Entorno | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| pi05-libero-lape-curve-expert-copy-20261116 | no disponible | no disponible | LIBERO | no disponible | Hugging Face, 0 descargas |
| Control "expert copy" 11/09 (referencia del autor) | no disponible | no disponible | LIBERO | no disponible | no disponible como enlace público en la información |
| pi0.5 (modelo base citado) | no disponible | no disponible | robótica general | no disponible | no disponible en la información |

No se dispone de datos suficientes para una comparativa cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Artefacto de investigación: no es un modelo listo para producción ni para uso general; su propósito es el análisis de curvas de entrenamiento en LIBERO.
- Licencia no declarada: no se puede asumir permiso para uso comercial ni para redistribución; hay que contactar con el autor antes de cualquier uso más allá de la evaluación interna.
- Ausencia de model card detallada: no hay información sobre sesgos, datos de entrenamiento, composición del dataset ni evaluación de robustez.
- Riesgo de sobreajuste al benchmark LIBERO: al ser un reentrenamiento específico sobre ese entorno, la generalización a otras tareas o morfologías no está documentada.
- Sin métricas publicadas: no se puede verificar el rendimiento real de ninguno de los checkpoints (1k a 10k) sin ejecutar la evaluación por cuenta propia.
- Tamaño del repositorio elevado (92,6 GB): requiere almacenamiento y ancho de banda considerables para su descarga y réplica.
- Fecha de creación futura (2026-11-16) y cero descargas: la trazabilidad y la madurez del artefacto son limitadas; conviene tratar los resultados con cautela.

## Enlaces

- Hugging Face: https://huggingface.co/Donghyun1228/pi05-libero-lape-curve-expert-copy-20261116
- No se han encontrado en la información proporcionada papers, blogs, repositorios de código ni demos adicionales.
