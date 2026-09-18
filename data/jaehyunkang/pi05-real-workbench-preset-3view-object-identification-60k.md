# jaehyunkang/pi05-real-workbench-preset-3view-object-identification-60k

## Resumen

Este repositorio contiene un checkpoint de ajuste fino del modelo de visión-lenguaje-acción (VLA) Pi0.5, publicado por el usuario jaehyunkang sobre la base `lerobot/pi05_base`. La política resuelve una tarea concreta de robótica de manipulación: la identificación de objetos sobre un banco de trabajo real (*task scope: object-identification*), recibiendo tres vistas de cámara (exterior, muñeca y una imagen *keyframe*) junto con un estado de 8 dimensiones, y emitiendo comandos delta de 7 dimensiones sobre el efector final.

Se trata del checkpoint final tras 60.000 pasos de optimización, entrenado sobre el dataset `Myungkyu/real_workbench-preset-gemini` con lote global de 32, dos GPU y semilla 42. La arquitectura conserva los 4.143.404.816 parámetros del modelo base (4,14 mil millones) y un horizonte de ejecución de 50 acciones con 10 pasos de *denoising* por inferencia.

Su relevancia es acotada pero clara: es un ejemplo reproducible de ajuste fino de bajo coste (dos GPU) de una política VLA de última generación para identificación de objetos, con todos los artefactos de preprocesado, normalización y reanudación de entrenamiento publicados. No incluye métricas de evaluación en robot real, no declara licencia ni idiomas, y su validación comunitaria es prácticamente nula (9 descargas, 0 *likes*).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | VLA (visión-lenguaje-acción) derivada de `lerobot/pi05_base`; el tokenizer apunta a `google/paligemma-3b-pt-224` y la inferencia usa 10 pasos de *denoising*, lo que indica un cabezal de acción generativo (flow matching/difusión) sobre un *backbone* tipo PaliGemma |
| Parámetros totales | 4.143.404.816 (4,14 mil millones) |
| Parámetros activos | No disponible; no se documenta una arquitectura de mezcla de expertos en la información proporcionada |
| Longitud de contexto | No disponible; no es un modelo de texto: procesa observaciones por *frame* (3 vistas + estado de 8 dimensiones) y emite trozos de 50 acciones |
| Tipos de cuantización | No documentados; solo se publican pesos en safetensors, sin variantes GGUF, AWQ o GPTQ ni indicación de la precisión de almacenamiento |
| Idiomas soportados | No disponible; las instrucciones de tarea se suministran como subtarea por *frame* desde el parquet del dataset |
| Licencia | No disponible (el autor no declara licencia; la del modelo base `lerobot/pi05_base` no se verifica en esta ficha) |
| Formato de pesos | safetensors, más configuración de política, preprocesado/postprocesado, estados de normalización y `artifact_manifest.json` con tamaños y hashes SHA-256 |

## Arquitectura y entrenamiento

El modelo es una política VLA con condicionamiento multimodal. La model card indica tres vistas de entrada (exterior, muñeca y `observation.image.keyframe`), almacenadas a 224×126 y rellenadas (*padding*) a 224×224 por la política. El estado tiene 8 dimensiones y la acción es un delta del efector final de 7 dimensiones (6 de velocidad cartesiana más pinza). La generación de acciones emplea *action chunking* con horizonte de ejecución de 50 pasos y 10 pasos de *denoising* en inferencia, coherente con un cabezal de acción de tipo flow matching o difusión. El tokenizer de referencia es `google/paligemma-3b-pt-224` (revisión de entrenamiento `35e4f46485b4d07967e7e9935bc3786aad50687c`).

El entrenamiento consistió en 60.000 pasos de optimización con lote global 32 sobre dos GPU y semilla 42, usando el dataset `Myungkyu/real_workbench-preset-gemini`. La instrucción se toma de la subtarea por *frame* almacenada en parquet. No se documenta RLHF, DPO ni ningún otro ajuste por preferencias: se trata de un ajuste fino por imitación sobre demostraciones. La implementación utilizada es `RLWRLD/hiwrld-ll-policy`, una versión vendorizada de LeRobot Pi0.5, lo que implica que los campos de entrada personalizados pueden requerir esa implementación concreta en lugar de LeRobot estándar. El repositorio raíz contiene pesos, configuración y estados de normalización; `training_state/` guarda los ficheros de reanudación, y las rutas específicas del host fueron eliminadas de los JSON de metadatos.

## Capacidades

- Manipulación robótica por imitación: genera comandos delta de 7 dimensiones (6 velocidades cartesianas + pinza) a partir de observaciones visuales y de un estado propioceptivo de 8 dimensiones.
- Percepción multi-vista: consume simultáneamente cámara exterior, cámara de muñeca y una imagen *keyframe* definida por el dataset.
- Identificación de objetos en un banco de trabajo real, que es el alcance declarado de la tarea.
- Condicionamiento por instrucción textual: acepta la subtarea por *frame* como texto de tarea de la política; para modelos de subtarea es obligatorio suministrarla.
- Planificación de acciones en bloque: produce 50 acciones por inferencia con 10 pasos de *denoising*, lo que permite control reactivo con re-planificación periódica.
- No soporta *tool calling* ni *function calling*: no es un modelo de lenguaje conversacional.
- No soporta agentes ni razonamiento multi-paso simbólico, ni generación de texto libre, código o matemáticas.
- Capacidades multilingües: no disponibles.
- No dispone de modo *thinking*, entrada de audio ni visión general fuera del dominio de cámaras del dataset.

## Casos de uso

- Identificación y *picking* de objetos en banco de trabajo: la política recibe las tres vistas del puesto y devuelve deltas de velocidad del efector final, por lo que puede cerrar el bucle de agarre sobre objetos previamente definidos en el dataset de entrenamiento.
- Base para *transfer learning* en dominios propios: al ser un ajuste fino de `lerobot/pi05_base` con 60.000 pasos documentados, sirve como punto de partida reproducible para reajustar la misma tarea con un banco de trabajo distinto, reutilizando los estados de normalización y la configuración publicados.
- Reproducción de experimentos de investigación en VLA: el repositorio incluye `training_state/`, hashes SHA-256 y semilla fija (42), lo que permite reanudar el entrenamiento y auditar el *pipeline* de datos con el dataset `Myungkyu/real_workbench-preset-gemini`.
- Célula de montaje con control reactivo: el *chunking* de 50 acciones con 10 pasos de *denoising* permite ejecutar secuencias largas sin re-inferencia por *frame*, reduciendo la frecuencia de cómputo necesaria en el lazo de control.
- Recolección de datos asistida: desplegado en teleoperación o en modo autónomo supervisado, puede generar trayectorias etiquetadas por subtarea para ampliar el dataset con nuevas variantes de objetos.
- Evaluación comparativa interna de políticas: sirve como referencia base en un *benchmark* propio de identificación de objetos, comparando su tasa de éxito contra otros checkpoints ajustados sobre el mismo dataset.
- Investigación en *keyframe conditioning*: al ser un modelo de 3 vistas que depende de una imagen *keyframe* definida por el dataset, es útil para estudiar cómo afecta la selección de *keyframes* al rendimiento de la política.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La propia model card indica explícitamente que es un *checkpoint* entrenado, no un resultado de evaluación, y que no se reclama ninguna métrica de evaluación en robot real. La búsqueda web realizada no devolvió ningún resultado relevante sobre este modelo (únicamente páginas sin relación con el contenido).

## Requisitos de hardware

- VRAM estimada para inferencia, calculada a partir del recuento de parámetros (no publicada por el autor): en fp32 unos 16,6 GB solo de pesos; en bf16/fp16 unos 8,3 GB; en int8 unos 4,1 GB; en int4 unos 2,1 GB. A estas cifras hay que sumar activaciones del *backbone* visual (3 vistas a 224×224), del cabezal de acción y del estado de normalización.
- No se publican variantes cuantizadas, por lo que las cifras de int8/int4 son teóricas y requerirían cuantización propia.
- GPU recomendadas: para inferencia en bf16, una RTX 4090 o RTX 3090 (24 GB) es suficiente con margen; también A100 40 GB, L40S o H100 para despliegues con mayor paralelismo o lote.
- ¿Cabe en GPU de consumo? Sí, en tarjetas de 24 GB (RTX 3090, 4090) en bf16 con lote pequeño; en tarjetas de 16 GB el margen es ajustado y dependería de cuantización no publicada.
- Entrenamiento: el autor indica 2 GPU con lote global 32, pero no especifica el modelo de GPU. Los ficheros de `training_state/` (estados de optimizador) y el tamaño del repositorio (24,5 GB) implican memoria adicional; se estima necesario un entorno de 80 GB por GPU en fp32/bf16 mixto, cifra no confirmada.
- Opciones de despliegue: LeRobot es la librería declarada; la implementación entrenada es la versión vendorizada `RLWRLD/hiwrld-ll-policy`. vLLM, TGI, llama.cpp y Ollama no son aplicables (no es un modelo de lenguaje causal con decodificación de tokens).
- Latencia y throughput: no publicados. Únicamente se conoce la estructura de cómputo: 10 pasos de *denoising* por cada trozo de 50 acciones, lo que amortiza el coste por acción frente a un esquema de una inferencia por *frame*.

## Comparativa con modelos similares

La comparativa siguiente se limita a lo verificable en la información proporcionada. Los datos de los modelos alternativos no se han podido confirmar en esta búsqueda y se marcan como no disponibles.

| Modelo | Parámetros | Entradas / salidas | Benchmarks públicos | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este checkpoint | 4.143.404.816 | 3 vistas (exterior, muñeca, keyframe) + estado 8D; acción delta EEF 7D | Ninguno declarado | No declarada | HuggingFace, 9 descargas, 0 *likes* |
| `lerobot/pi05_base` | No disponible en la información proporcionada (el ajuste deriva de él) | No disponible | No disponible | No disponible | Modelo base declarado en los metadatos |
| Alternativas de la misma familia VLA (por ejemplo, políticas Pi0 abiertas o VLA compactas tipo SmolVLA) | No disponible | No disponible | No disponible | No disponible | No verificadas en esta búsqueda |

En términos cualitativos, la diferencia de este *checkpoint* frente a su modelo base no está en el tamaño ni en la arquitectura, sino en la especialización: pasa de una política general a una política de identificación de objetos en un banco de trabajo concreto, con vistas y vocabulario de subtareas fijados por el dataset. No hay ninguna métrica que permita cuantificar esa especialización.

## Limitaciones y advertencias

- Ausencia de licencia declarada: no se puede asumir uso comercial. Además, el modelo base `lerobot/pi05_base` tiene su propia licencia, que debe verificarse antes de cualquier despliegue.
- Sin métricas de evaluación en robot real: el autor lo declara explícitamente. No hay evidencia publicada de tasa de éxito, robustez ni generalización.
- Riesgo de sobreajuste al *setup* del dataset: el rendimiento depende del montaje del banco de trabajo, del tipo de cámara, de las tres vistas concretas y de la imagen *keyframe* definida por el dataset. Fuera de esa configuración no está caracterizado.
- Dependencia de la implementación: los campos de entrada personalizados pueden exigir `RLWRLD/hiwrld-ll-policy` (LeRobot Pi0.5 vendorizado). Cargarlo con LeRobot estándar puede no reproducir el comportamiento esperado.
- Requisitos de entrada estrictos: en modelos de subtarea hay que suministrar la subtarea por *frame* como texto de tarea; en modelos de 3 vistas, además, la imagen *keyframe* del dataset. Omitirlos degrada o invalida la inferencia.
- Riesgo de alucinación en el sentido robótico: no existe un mecanismo de verificación semántica; el fallo se manifiesta como trayectorias incorrectas, colisiones o deriva del efector final. Es imprescindible parada de emergencia, límites de velocidad y supervisión humana.
- Idiomas no documentados: las instrucciones de tarea provienen de un parquet del dataset y no se especifica su idioma ni su variabilidad.
- Validación comunitaria nula: 9 descargas y 0 *likes* implican que no hay informes independientes de funcionamiento.
- Metadatos incompletos para reanudar: las rutas específicas del host fueron eliminadas de los JSON, por lo que es necesario aportar rutas locales de dataset y salida.
- Fechas de creación y actualización en 2026 según los metadatos; conviene comprobar si existe una revisión posterior.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jaehyunkang/pi05-real-workbench-preset-3view-object-identification-60k
- Dataset de entrenamiento: https://huggingface.co/datasets/Myungkyu/real_workbench-preset-gemini
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Tokenizer de referencia: https://huggingface.co/google/paligemma-3b-pt-224
- Librería declarada, LeRobot: https://github.com/huggingface/lerobot
- Implementación de entrenamiento, `RLWRLD/hiwrld-ll-policy`: URL no disponible en la información proporcionada.
- Paper, blog o demo del modelo: no disponible; la búsqueda web no devolvió resultados relevantes.
