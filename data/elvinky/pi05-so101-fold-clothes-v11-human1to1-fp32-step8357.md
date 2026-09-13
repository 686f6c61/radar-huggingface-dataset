# Elvinky/pi05-so101-fold-clothes-v11-human1to1-fp32-step8357

## Resumen

Elvinky/pi05-so101-fold-clothes-v11-human1to1-fp32-step8357 es una política robótica (vision-language-action) publicada en HuggingFace bajo la librería LeRobot, orientada a la tarea concreta de plegar ropa con un brazo SO-101. Se trata de un fine-tune de paso completo en FP32 sobre la política base Travor278/pi05-so101-fold-clothes-jax-v11, que fue convertida previamente de JAX a PyTorch. El modelo tiene 4.143.404.816 parámetros (aproximadamente 4,14 mil millones) y ocupa 16,6 GB en el repositorio, coherente con pesos de 32 bits sin cuantizar.

El problema que aborda es el ajuste fino con intervención humana (esquema tipo DAgger) sobre una política preentrenada: durante el entrenamiento se mezclaron demostraciones originales con segmentos en los que un operador humano corrige al robot en tiempo real. La relevancia actual está en que documenta de forma muy detallada la receta de entrenamiento (LeRobot 0.6.1, 8 GPU A800, 8.357 pasos de optimizador, batch global 64) y publica el manifiesto con SHA256, lo que facilita la reproducibilidad en Investigación robótica.

Se publica como versión de solo inferencia (no se suben estados de optimizador, RNG ni vídeos de entrenamiento). El autor advierte explícitamente de que el modelo todavía no ha pasado una evaluación en robot físico, por lo que el rendimiento de despliegue y la seguridad no están establecidos. Los datos de licencia e idiomas no están disponibles en la información proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | política robótica PI05 (vision-language-action) sobre la base JAX v11 convertida a PyTorch; configuración compatible con LeRobot PI05Config |
| Parametros totales | 4.143.404.816 (aprox. 4,14 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible; horizonte de acción (chunk/action horizon) de 50 pasos |
| Tipos de cuantizacion | no disponible; la release publica únicamente pesos FP32 |
| Idiomas soportados | no disponible (la instrucción de tarea del dataset está en inglés) |
| Licencia | no disponible |
| Formato de pesos | safetensors, precisión FP32 |
| Libreria / pipeline | lerobot 0.6.1 / robotics |
| Modelo base | Travor278/pi05-so101-fold-clothes-jax-v11 (fine-tune) |
| Datasets de entrenamiento | MINT-SJTU/RW-RL-Dataset y Elvinky/so101-fold-clothes-dagger-20260909 |
| Tarea | "Fold the clothes on the left side and stack them on the right." |
| Tamano del repositorio | 16,6 GB |
| Pasos de optimizador | 8357 (semilla 1000) |
| Descargas / likes | 4 / 0 |
| Fecha de publicacion | 2026-09-13 |

## Arquitectura y entrenamiento

La información disponible indica que se trata de una política PI05 gestionada mediante LeRobot (clase PI05Config) y ejecutada en PyTorch 2.11.0+cu128. El punto de partida fue una política JAX v11 que se convirtió a PyTorch antes del fine-tune. No se detalla en la model card el número de capas, la dimensión oculta, el codificador visual ni el mecanismo de atención; por tanto, esos datos figuran como no disponibles. El modelo no es un LLM conversacional: es una política de acción condicionada por observaciones visuales (cámaras) y por una instrucción textual de tarea.

El entrenamiento se realizó con DDP de paso completo en FP32 sobre 8 GPU A800, con batch 8 por GPU y batch global 64. En cada rango y batch se mezclaron 4 demostraciones originales y 4 muestras de intervención humana. La vista humana contiene 429 segmentos contiguos marcados como intervention=true, con 106.957 fotogramas a 30 FPS (0:59:25.233); la vista original contiene 108 episodios y 1.258.509 fotogramas. El objetivo declarado fue dar 2,5 pasadas sobre los datos humanos, no 2,5 pasadas sobre el conjunto combinado. Se conservó la normalización original de la v11 para ambas fuentes y se excluyó del cálculo de pérdida el padding temporal y de dimensiones de acción.

La configuración de optimización es: AdamW con foreach=false, sin AMP, sin ZeRO ni FSDP y sin LoRA; TF32 desactivado y gradient checkpointing activado. La tasa de aprendizaje decayó de 2,5e-6 a 2,5e-7, con 200 pasos de calentamiento, weight decay 0,01 y recorte de gradiente 1,0. Para compatibilidad con la PI05Config estándar de LeRobot se eliminó únicamente el campo de configuración de entrenamiento `mask_action_padding_loss`; según el autor, esas adaptaciones de despliegue no alteran los pesos, la normalización ni el algoritmo de inferencia.

## Capacidades

- Generación de acciones de manipulación robótica condicionadas por imágenes de cámara e instrucción textual de tarea.
- Ejecución de la tarea específica de plegado de ropa: "Fold the clothes on the left side and stack them on the right."
- Política entrenada con datos de intervención humana (human-in-the-loop), lo que busca mejorar la recuperación ante estados de error capturados durante el entrenamiento.
- Predicción de secuencias de acción con horizonte de 50 pasos (chunk/action horizon 50).
- Integración con las tuberías de procesador de LeRobot y con los mapeos guardados de cámaras y acciones.
- Inferencia offline: el repositorio incluye los ficheros de modelo, configuración, procesador y los recursos del tokenizer en la raíz.
- Soporte de tool calling: no aplicable / no disponible (es una política robótica, no un modelo de lenguaje con herramientas).
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles.
- Capacidades especiales (thinking mode, visión, audio): dispone de entrada visual por cámara como parte de la política; no se documentan modos de razonamiento explícito ni audio.

## Casos de uso

- Plegado de ropa en laboratorio de robótica: es la tarea exacta para la que se entrenó; se usaría cargando la política en LeRobot junto con los mapeos de cámaras y el procesador guardados, y ejecutando rollouts sobre un brazo SO-101 en un entorno controlado.
- Investigación en aprendizaje por imitación con intervención humana: sirve como referencia reproducible de una receta DAgger (429 segmentos de intervención, 106.957 fotogramas) para comparar estrategias de mezcla de datos originales y humanos.
- Base para fine-tuning en otras tareas textiles: al ser un checkpoint de paso completo en FP32, puede reutilizarse como inicialización para tareas relacionadas (doblar toallas, apilar prendas) ajustando el conjunto de datos y la instrucción de tarea.
- Evaluación comparativa de políticas VLA sobre SO-101: permite medir el efecto de un fine-tune FP32 con proporción 1:1 de datos humanos frente a la política base JAX v11 en las mismas condiciones de laboratorio.
- Recogida de datos y aumento de conjuntos DAgger: los rollouts del modelo pueden anotarse con correcciones humanas y reincorporarse al dataset para siguientes iteraciones del ciclo de entrenamiento.
- Validación de portabilidad JAX a PyTorch: el modelo documenta el paso de una política JAX a PyTorch y su compatibilidad con LeRobot estándar, útil para equipos que migran pipelines entre frameworks.
- Docencia y prácticas universitarias: por su tamaño moderado y su integración con LeRobot, es un caso práctico para demostrar entrenamiento distribuido, gradient checkpointing y despliegue de políticas robóticas.
- Despliegue offline en instalaciones aisladas: al incluir tokenizer y procesadores en el propio repositorio, puede ejecutarse sin dependencia del modelo base externo, sobrescribiendo `tokenizer_name` con el directorio local descargado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de éxito en robot físico, tasas de acierto, ni comparaciones numéricas con otras políticas, y advierte explícitamente de que la pérdida de entrenamiento no establece el rendimiento ni la seguridad en despliegue. La búsqueda web asociada no devolvió ningún resultado relevante sobre este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia con los pesos publicados en FP32: en torno a 16,6 GB solo para pesos, más el coste de activaciones y buffers de inferencia (estimación; no confirmada por el autor).
- Conversiones estimadas no publicadas: BF16/FP16 rondarían los 8,3 GB de pesos, INT8 unos 4,1 GB e INT4 alrededor de 2,1 GB; el autor no publica versiones cuantizadas.
- GPU profesionales recomendadas para FP32: A100 80 GB, H100 80 GB, A800 80 GB (estas son las empleadas en entrenamiento, 8 x A800) o tarjetas de 48 GB como A6000/L40S.
- GPU de consumo: una RTX 4090 de 24 GB puede alojar los pesos FP32 con poco margen para activaciones; en BF16/FP16 cabría con holgura, si bien esa conversión no está publicada ni validada.
- Opciones de despliegue: LeRobot 0.6.1 con PyTorch 2.11.0+cu128, usando las tuberías de procesador y los mapeos de cámara/acción guardados. Los servidores orientados a LLM (vLLM, TGI) y los formatos GGUF/Ollama no están indicados para esta release.
- Latencia y throughput: no disponibles.
- Almacenamiento: el repositorio completo ocupa 16,6 GB; `release_manifest.json` contiene tamanos de fichero y valores SHA256.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / horizonte | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Elvinky/pi05-so101-fold-clothes-v11-human1to1-fp32-step8357 | 4.143.404.816 | no disponible; horizonte de acción 50 | no disponible | no disponible | HuggingFace, libreria lerobot, FP32 |
| Travor278/pi05-so101-fold-clothes-jax-v11 (modelo base) | no disponible | no disponible | no disponible | no disponible | HuggingFace; origen JAX de este fine-tune |
| Otras políticas VLA de robotica (pi0, pi0.5, OpenVLA, etc.) | no disponible | no disponible | no disponible | no disponible | no disponible en la informacion proporcionada |

No se dispone de datos verificables en la información proporcionada para establecer una comparación cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- No se ha realizado evaluación en robot físico: el autor indica que la pérdida de entrenamiento no establece el rendimiento ni la seguridad en despliegue y que debe validarse en un entorno controlado.
- Licencia no disponible: no puede confirmarse si se permite el uso comercial; conviene contactar con el autor antes de cualquier despliegue productivo.
- Sesgos conocidos: no documentados; el modelo se entrena sobre un conjunto limitado de episodios y una tarea concreta de plegado de ropa, por lo que su comportamiento fuera de esa distribución es incierto.
- Riesgo de alucinación: no aplicable en el sentido lingüístico, pero sí existe riesgo de acciones incorrectas o inseguras ante estados visuales no vistos durante el entrenamiento.
- Limitaciones de contexto e idioma: no se especifica ventana de contexto; la instrucción de tarea está en inglés y no se documentan capacidades multilingües.
- Especialización estrecha: está ajustado para la instrucción "Fold the clothes on the left side and stack them on the right."; no es un modelo de propósito general.
- Solo inferencia: no se incluyen estados de optimizador, RNG de entrenamiento ni vídeos crudos, por lo que no puede reanudarse el entrenamiento original tal cual.
- Compatibilidad: se eliminó el campo `mask_action_padding_loss` para encajar con la PI05Config estándar de LeRobot; otras diferencias de versión de la librería podrían requerir ajustes.
- Dependencia del procesador guardado: para un uso correcto deben emplearse las tuberías de procesador y los mapeos de cámara/acción del repositorio, no configuraciones propias.
- Reproducibilidad offline: es necesario descargar la release completa y sobrescribir `tokenizer_name` del procesador del tokenizer con el directorio local.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Elvinky/pi05-so101-fold-clothes-v11-human1to1-fp32-step8357
- Espejo: https://hf-mirror.com/Elvinky/pi05-so101-fold-clothes-v11-human1to1-fp32-step8357
- Modelo base: https://huggingface.co/Travor278/pi05-so101-fold-clothes-jax-v11
- Dataset MINT-SJTU/RW-RL-Dataset: https://huggingface.co/datasets/MINT-SJTU/RW-RL-Dataset
- Dataset Elvinky/so101-fold-clothes-dagger-20260909: https://huggingface.co/datasets/Elvinky/so101-fold-clothes-dagger-20260909
- Manifiesto de la release: `release_manifest.json` en la raiz del repositorio (tamanos y SHA256)
- Resultados de busqueda web: no se encontro ningun recurso relevante sobre este modelo (los resultados devueltos no guardaban relacion con el modelo)
