# Donghyun1228/pi05-libero-ila-data-scale-n5000-20261111

## Resumen

Este repositorio contiene artefactos de investigación sobre adaptación de dominio mediante ILA (Implicit Latent Adaptation, Yoneda et al., RSS 2022) aplicada a la cabeza del codificador visual PAD del modelo π0.5 (pi05) entrenado sobre el benchmark de manipulación robótica LIBERO. No es un modelo de lenguaje ni un modelo generativo de propósito general: es un conjunto de pesos y estados de entrenamiento derivados de un VLA (Vision-Language-Action) orientado a control robótico, publicado por el usuario Donghyun1228 como parte de un experimento de escalado de datos de sondeo.

El experimento compara dos configuraciones: una fuente (`pi05_libero_pad_img_source`) que entrena una cabeza IDM sobre la cabeza PAD del codificador visual con 5000 frames de sondeo por entorno, y varios objetivos (`pi05_libero_ila_img_{view,yaw}_adapt`) que aplican pasos de encoder con RMSProp manteniendo congelados la cabeza IDM, el modelo forward y el crítico WGAN, también sobre 5000 frames de sondeo por entorno. La evaluación se realiza con semilla 7 en OSMesa sobre 2000 episodios.

El interés del repositorio es acotado pero específico: sirve como evidencia reproducible de cómo escala la adaptación ILA con el número de frames de sondeo en tareas de manipulación LIBERO, y como material de partida para investigadores que trabajen en adaptación de dominio de VLAs sin reentrenamiento completo. El tamaño del repositorio es de 25,1 GB y no incluye `train_state`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA basada en π0.5 (pi05) con cabeza PAD en el codificador visual; adaptación ILA con cabeza IDM, modelo forward y crítico WGAN |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible (el repo contiene múltiples artefactos; `SHA256SUMS` lista todos los ficheros; `train_state` no incluido) |

## Arquitectura y entrenamiento

El modelo base es π0.5 (pi05), un VLA que combina un codificador visual con un transformer de política para generar acciones robóticas a partir de observaciones e instrucciones. Sobre la cabeza PAD del codificador visual se aplica ILA, una técnica de adaptación de dominio que alinea representaciones latentes entre un dominio fuente y un dominio objetivo mediante una cabeza IDM (inverse dynamics model), un modelo forward y un crítico WGAN.

El entrenamiento se estructura en dos fases. La fase fuente entrena la cabeza IDM y PAD sobre `pi05_libero_pad_img_source` con 5000 frames de sondeo por entorno, learning rate 1e-5 y 10k pasos. La fase objetivo parte de esa fuente y aplica pasos de encoder con RMSProp sobre `pi05_libero_ila_img_{view,yaw}_adapt`, manteniendo congelados la cabeza IDM, el modelo forward y el crítico WGAN, durante 10k pasos y con 5000 frames de sondeo objetivo por entorno. La evaluación se hace con semilla 7, renderizado OSMesa y 2000 episodios por configuración (`<shift>/eval_seed7`).

No se especifican en la información disponible el número total de tokens de entrenamiento, la composición del dataset más allá de los frames de sondeo LIBERO, ni si hubo RLHF o DPO. Tampoco se detalla la innovación técnica más allá de la propia receta ILA con cabezas congeladas y crítico WGAN.

## Capacidades

- Control robótico de manipulación en entornos LIBERO a partir de observaciones visuales e instrucciones.
- Adaptación de dominio del codificador visual mediante ILA con cabezas IDM, forward y crítico WGAN.
- Evaluación reproducible con semilla fija (seed 7) y renderizado OSMesa sobre 2000 episodios.
- Generación de acciones motoras (no es un modelo de texto, código, matemáticas ni visión general).
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes multi-paso en el sentido de LLM; el bucle agéntico es el propio control robótico.
- Capacidades multilingües: no disponibles (no aplica al dominio de control).
- No se documenta modo thinking, visión general, audio ni otras capacidades especiales.

## Casos de uso

- Investigación en adaptación de dominio de VLAs: usar los artefactos `pi05_libero_pad_img_source` y `pi05_libero_ila_img_{view,yaw}_adapt` como punto de partida para reproducir el experimento de escalado de datos de sondeo (5000 frames por entorno) y comparar curvas de adaptación.
- Estudio de escalado de datos de sondeo: el repositorio permite analizar cómo varía el rendimiento con 5000 frames por entorno frente a configuraciones menores, usando la evaluación con semilla 7 sobre 2000 episodios como referencia.
- Benchmarking de técnicas de alineación latente: comparar ILA con otras recetas de adaptación (fine-tuning completo, adapters, LoRA) sobre la misma base π0.5 y el mismo conjunto LIBERO.
- Reproducibilidad de experimentos robóticos: el fichero `SHA256SUMS` y la ausencia de `train_state` permiten verificar la integridad de los artefactos publicados y reentrenar desde cero con el código de `github.com/Donghyun1228/vla_adaptation`.
- Desarrollo de políticas de manipulación en simulación: emplear los pesos adaptados como política inicial en tareas LIBERO con variaciones de vista (`view`) y orientación (`yaw`) para estudiar robustez ante cambios de cámara.
- Docencia e investigación en robótica con aprendizaje profundo: usar el repositorio como ejemplo completo de pipeline ILA con cabeza IDM, modelo forward y crítico WGAN congelados, útil para cursos avanzados de adaptación de dominio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo indica la configuración de evaluación (semilla 7, OSMesa, 2000 episodios, `<shift>/eval_seed7`) sin reportar tasas de éxito ni métricas numéricas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El tamaño del repositorio es de 25,1 GB, pero incluye múltiples artefactos (fuente y objetivos) y no se desglosa por fichero.
- GPU recomendadas: no disponible en la información proporcionada.
- Compatibilidad con GPU de consumo: no disponible; no se puede confirmar sin conocer el número de parámetros y el formato de pesos.
- Opciones de despliegue: no se documentan (no se mencionan vLLM, llama.cpp, Ollama ni TGI; el pipeline es de robótica, no de generación de texto).
- Latencia y throughput: no disponibles.
- Nota: la evaluación se realiza con renderizado OSMesa, lo que sugiere un entorno de simulación sin GPU dedicada para el renderizado, aunque el cómputo del modelo puede requerir aceleración.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| pi05-libero-ila-data-scale-n5000-20261111 (este repo) | no disponible | no disponible | no disponible (evaluación seed 7, 2000 episodios, sin métricas publicadas) | no disponible | Hugging Face, 25,1 GB, 0 descargas |
| π0.5 (pi05) base | no disponible | no disponible | no disponible | no disponible | Referenciado como base en la model card |
| π0.5 LIBERO (`pi05_libero`) | no disponible | no disponible | no disponible | no disponible | Referenciado como fuente pública en la model card |
| ILA original (Yoneda et al., RSS 2022) | no disponible | no disponible | no disponible | no disponible | Paper académico, no modelo publicado en HF |

No se dispone de datos numéricos de parámetros, contexto ni rendimiento para ninguno de los modelos comparables en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no debe evaluarse con benchmarks tipo MMLU, HumanEval o GSM8K; su dominio es el control robótico en LIBERO.
- No se incluye `train_state` en el repositorio, por lo que no es posible reanudar el entrenamiento exactamente desde el punto publicado; solo se pueden usar los pesos resultantes.
- La licencia no está especificada, lo que impide determinar si el uso comercial está permitido; se debe contactar con el autor antes de cualquier uso en producción.
- El repositorio tiene 0 descargas y 0 likes, sin validación externa de la comunidad; los resultados no han sido replicados de forma independiente según la información disponible.
- La evaluación se limita a un único seed (7) y a 2000 episodios por configuración; no se reportan intervalos de confianza ni métricas numéricas, lo que dificulta la comparación objetiva.
- El tamaño de 25,1 GB sugiere artefactos de gran tamaño; sin desglose por fichero no se puede estimar la VRAM necesaria para inferencia.
- Riesgo de sobreajuste a los entornos LIBERO y a las condiciones de renderizado OSMesa; la generalización a otros simuladores o al mundo real no está documentada.
- No se documentan sesgos conocidos ni riesgos de alucinación en el sentido de LLM; en robótica, el riesgo equivalente es la ejecución de acciones incorrectas o inseguras, que no se analiza en la model card.
- La fecha de creación (2026-11-12) es futura respecto a la información de referencia habitual; conviene verificar la vigencia de los enlaces y del código asociado.

## Enlaces

- Hugging Face: https://huggingface.co/Donghyun1228/pi05-libero-ila-data-scale-n5000-20261111
- Código: https://github.com/Donghyun1228/vla_adaptation
- Paper ILA (Yoneda et al., RSS 2022): no disponible en la información proporcionada
- Paper π0.5: no disponible en la información proporcionada
- Benchmark LIBERO: no disponible en la información proporcionada
