# jaehyunkang/pi05-real-workbench-preset-3view-object-classification-60k

## Resumen

El modelo `jaehyunkang/pi05-real-workbench-preset-3view-object-classification-60k` es un checkpoint de política robótica (VLA, vision-language-action) obtenido por fine-tuning del modelo base `lerobot/pi05_base`. Lo publica el usuario jaehyunkang dentro del ecosistema LeRobot y su ámbito de tarea declarado es la clasificación de objetos sobre un banco de trabajo real (real workbench). Se trata de un artefacto de investigación: el propio autor indica explícitamente que es «una política entrenada, no un resultado de evaluación», y no se reclama ninguna métrica de rendimiento en robot real.

El modelo tiene 4.143.404.816 parámetros (unos 4,14 mil millones) almacenados en formato safetensors, y el repositorio ocupa 24,5 GB porque incluye, además de los pesos, el estado de entrenamiento para reanudar (`training_state/`). Es un ajuste fino completo tras 60.000 pasos de optimización, con batch global 32, 2 GPU y semilla 42, sobre el dataset `Myungkyu/real_workbench-preset-gemini`.

Su relevancia es práctica antes que comparativa: documenta con detalle una receta reproducible de fine-tuning de Pi0.5 para una tarea concreta, con tres vistas de cámara (exterior, muñeca y un keyframe de `observation.image.keyframe`), estado de 8 dimensiones y acciones delta del efector final de 7 dimensiones. Ahora bien, con 0 descargas y 0 «likes» en el momento de redactar esta ficha, y sin licencia ni idiomas declarados, debe considerarse un experimento aislado y no un componente listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible en la model card; derivada de `lerobot/pi05_base` (política VLA con backbone tipo PaliGemma y experto de acción, según el tokenizer referenciado `google/paligemma-3b-pt-224`) |
| Parametros totales | 4.143.404.816 (~4,14 B, dato real de safetensors) |
| Longitud de contexto | no disponible (modelo de acción, no de texto; no se declara ventana de contexto) |
| Tipos de cuantizacion | no disponible. Los pesos se distribuyen en safetensors sin cuantizaciones publicadas (no hay GGUF ni AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (pesos, configuración, preprocesado/postprocesado y estados de normalización en la raíz del repo; estado de entrenamiento en `training_state/`) |
| Tipo de modelo | política robótica (pipeline `robotics`), librería `lerobot` |
| Modelo base | `lerobot/pi05_base` (fine-tune) |
| Dataset de entrenamiento | `Myungkyu/real_workbench-preset-gemini` |
| Pasos de optimizacion | 60.000 |
| Batch global / GPUs / semilla | 32 / 2 / 42 |
| Vistas de entrada | 3 (exterior, muñeca y `observation.image.keyframe`) |
| Dimension de estado | 8 |
| Dimension de accion | 7 (6 de velocidad cartesiana del EEF + gripper), en formato delta EEF |
| Horizonte de accion / ejecucion | 50 |
| Pasos de denoising en inferencia | 10 |
| Resolucion de imagen | almacenada 224×126; la política rellena hasta 224×224 |
| Tokenizer de referencia | `google/paligemma-3b-pt-224`, revisión `35e4f46485b4d07967e7e9935bc3786aad50687c` |
| Tamano del repositorio | 24,5 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creacion / actualizacion | 2026-09-17 / 2026-09-17 |

## Arquitectura y entrenamiento

No se describe la arquitectura en la model card más allá de la referencia al modelo base `lerobot/pi05_base` y al tokenizer de `google/paligemma-3b-pt-224`. Los indicios disponibles apuntan a una política Pi0.5 estándar: un backbone visión-lenguaje que procesa las imágenes de cámara junto con la instrucción textual de la subtarea, y un cabezal de acción que genera secuencias de acciones (action chunks) mediante un proceso iterativo de denoising —de ahí los 10 pasos de denoising declarados para producir un chunk de 50 acciones—. Cualquier detalle adicional sobre atención, tokenización de acciones o composición de capas debe consultarse en la documentación de `lerobot/pi05_base`, no en este repositorio.

El entrenamiento consistió en un fine-tune completo durante 60.000 pasos de optimización con batch global 32, repartido en 2 GPU y semilla 42, usando la implementación `RLWRLD/hiwrld-ll-policy` con una versión vendorizada de LeRobot Pi0.5. La instrucción de entrada es la subtarea por fotograma en formato parquet, y para los modelos de subtarea hay que proporcionar el texto de subtarea correspondiente como campo `task` de la política. No se documentan en la información disponible la composición exacta del dataset, el número de tokens o episodios, ni si hubo etapas de RLHF o DPO (procedimientos poco habituales en políticas robóticas). El autor advierte que los campos de entrada personalizados pueden requerir la implementación exacta con la que se entrenó el modelo.

## Capacidades

- Control robótico por imitación: genera acciones delta del efector final (6 componentes de velocidad cartesiana más gripper) a partir de observaciones visuales y de estado.
- Clasificación de objetos en el entorno de trabajo: es el ámbito de tarea declarado (`object-classification`) del checkpoint.
- Entrada multi-vista: consume tres flujos de imagen simultáneos (cámara exterior, cámara de muñeca y una imagen keyframe definida por el dataset).
- Condicionamiento por instrucción textual: acepta la subtarea por fotograma como texto de tarea, lo que permite variar el comportamiento sin reentrenar.
- Generación de secuencias de acción (action chunking) con horizonte 50 y 10 pasos de denoising por chunk.
- Integración con el ecosistema LeRobot para carga de políticas, preprocesado, postprocesado y estados de normalización.
- Reanudación de entrenamiento: el repositorio incluye `training_state/` con los ficheros necesarios para continuar el fine-tune.
- Verificación de integridad: `artifact_manifest.json` registra tamaños de fichero y hashes SHA-256.

No se declaran capacidades de tool calling, function calling, agentes, razonamiento multi-paso en lenguaje natural ni procesamiento de audio. Tampoco se documentan capacidades multilingües.

## Casos de uso

- Clasificación de objetos sobre banco de trabajo: el modelo se usa para identificar y discriminar objetos presentes en la mesa a partir de las tres vistas, aprovechando la imagen keyframe para desambiguar posiciones que una sola cámara no resuelve.
- Pick-and-place guiado por subtareas: alimentando la subtarea por fotograma como campo `task`, la política produce chunks de 50 acciones delta del EEF que un controlador de bajo nivel puede ejecutar para recoger y colocar piezas.
- Investigación en aprendizaje por imitación: sirve como punto de partida reproducible (semilla 42, batch 32, pasos documentados) para estudiar el efecto del número de pasos de fine-tuning en una política Pi0.5.
- Base para fine-tuning adicional: al incluir `training_state/`, es un candidato para continuar el entrenamiento con datos propios del mismo banco de trabajo sin partir de `pi05_base`.
- Evaluación de esquemas multi-vista: permite experimentar con la contribución de la cámara de muñeca y del keyframe frente a una configuración mono-cámara.
- Docencia y prototipado en robótica: su tamaño de 4,14 B parámetros y su formato safetensors facilitan desplegarlo en un laboratorio con una GPU de gama alta para prácticas de VLA.
- Generación de datos sintéticos o aumentados: las trayectorias de acción generadas pueden usarse como referencia para comparar con demos humanas en el mismo dataset.

Conviene recordar que no hay ninguna métrica de éxito en robot real publicada, por lo que ninguno de estos casos está validado por el autor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que se trata de una política entrenada y no de un resultado de evaluación, y que no se reclama ninguna métrica de evaluación en robot real.

## Requisitos de hardware

- VRAM estimada para los pesos (cálculo a partir de 4.143.404.816 parámetros, sin contar activaciones): ~16,6 GB en fp32, ~8,3 GB en bf16/fp16, ~4,2 GB en int8 y ~2,1 GB en int4.
- VRAM realista para inferencia: del orden de 10 a 14 GB en bf16 sumando activaciones del backbone visual a 224×224 y del cabezal de acción; 20 a 24 GB si se ejecuta en fp32.
- GPU recomendadas: A100 (40/80 GB), H100, L40S o RTX 4090/3090 (24 GB) para bf16. En tarjetas de 16 GB la ejecución en bf16 es ajustada y requeriría reducir precisión o trocear el modelo.
- Cabe en GPU de consumo: sí, en RTX 4090, RTX 3090 o similares de 24 GB en bf16; en 12-16 GB solo con cuantización, no soportada oficialmente por el repositorio.
- Almacenamiento: al menos 24,5 GB para el repositorio completo; si solo se despliegan los pesos de inferencia, menos, pero el manifiesto de artefactos y `training_state/` inflan el tamaño total.
- Opciones de despliegue: carga mediante LeRobot (PyTorch) con la implementación vendorizada `RLWRLD/hiwrld-ll-policy`. vLLM, llama.cpp, Ollama o TGI no son aplicables, ya que no es un modelo generativo de texto con pesos GGUF.
- Latencia y throughput: no disponible. El único dato relacionado es que cada chunk de 50 acciones requiere 10 pasos de denoising en inferencia, lo que da una idea del coste relativo pero no de los milisegundos por chunk.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / horizonte | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este checkpoint (pi05 real-workbench 3view) | 4,14 B | horizonte de acción 50, 10 pasos de denoising | Política VLA fine-tuneada | no disponible | HuggingFace, 0 descargas, repo de 24,5 GB |
| `lerobot/pi05_base` | no disponible en la informacion proporcionada | no disponible | Política VLA base | no disponible | HuggingFace (modelo base declarado) |
| Otras políticas VLA open source (p. ej. OpenVLA, GR00T) | no disponible en la informacion proporcionada | no disponible | Política VLA | no disponible | no disponible |

No se dispone de datos verificados de benchmarks ni de especificaciones de los modelos alternativos en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa fiable. Cualquier cifra sobre OpenVLA, GR00T u otras familias VLA debería verificarse en sus repositorios originales antes de usarla.

## Limitaciones y advertencias

- Ausencia total de evaluación: el autor declara que no se reclama ninguna métrica de robot real; no hay evidencia pública de que la política funcione fuera del conjunto de entrenamiento.
- Licencia no disponible: sin licencia declarada no hay autorización explícita de uso comercial; debe tratarse como material de investigación y contactar con el autor para cualquier explotación.
- Idiomas no declarados: el condicionamiento textual depende de subtareas en el idioma del dataset (`Myungkyu/real_workbench-preset-gemini`); no se documenta soporte multilingüe.
- Dependencia de implementación: el propio autor advierte que los campos de entrada personalizados pueden exigir la implementación exacta (`RLWRLD/hiwrld-ll-policy` con LeRobot Pi0.5 vendorizado); cargarlo con otra versión puede fallar silenciosamente.
- Requisitos de entrada estrictos: hay que aportar la subtarea por fotograma como texto `task` y, en modelos de 3 vistas, la imagen keyframe definida por el dataset. Omitirlos degrada o invalida la inferencia.
- Sobrecoste de almacenamiento: 24,5 GB incluyen estado de entrenamiento y manifiesto, no solo pesos útiles para inferencia.
- Riesgo de sobreajuste al banco de trabajo: al ser un fine-tune de 60.000 pasos sobre un único dataset de un entorno concreto, la generalización a otras mesas, iluminaciones, cámaras u objetos es incierta.
- Riesgo de alucinación de acciones: como toda política por imitación, puede producir trayectorias plausibles pero incorrectas o inseguras ante distribuciones de entrada fuera de las vistas durante el entrenamiento; requiere paradas de seguridad en un robot real.
- Sesgos: no se documenta ningún análisis de sesgos de género, raza u objeto en el dataset ni en el modelo.
- Huella mínima en la comunidad: 0 descargas y 0 «likes» implican ausencia de validación por terceros y de informes de errores.
- Metadatos incompletos: las rutas específicas de la máquina de entrenamiento fueron eliminadas de los JSON; al reanudar hay que aportar rutas locales de dataset y salida.
- Fechas de creación y actualización (2026-09-17) poco frecuentes; conviene verificar la vigencia del repositorio antes de integrarlo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jaehyunkang/pi05-real-workbench-preset-3view-object-classification-60k
- Dataset de entrenamiento: https://huggingface.co/datasets/Myungkyu/real_workbench-preset-gemini
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Tokenizer de referencia: https://huggingface.co/google/paligemma-3b-pt-224 (revisión `35e4f46485b4d07967e7e9935bc3786aad50687c`)
- Implementación de entrenamiento citada: RLWRLD/hiwrld-ll-policy (repositorio mencionado en la model card; no se proporciona URL directa)
- LeRobot (librería): no se proporciona URL en la información disponible
- Paper o blog del modelo: no disponible
- Demo o evaluación en robot real: no disponible
