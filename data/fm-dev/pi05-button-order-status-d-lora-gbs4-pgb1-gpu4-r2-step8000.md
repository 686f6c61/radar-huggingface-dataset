# fm-dev/pi05-button-order-status-d-lora-gbs4-pgb1-gpu4-r2-step8000

## Resumen

Este repositorio contiene un ajuste fino mediante LoRA del modelo π0.5 (pi05) para robótica de manipulación, especializado en la tarea denominada **button_order** sobre un brazo Franka. Se trata de un checkpoint intermedio, concretamente el paso 8.000 de la segunda ronda de entrenamiento (`r2`), dentro de un run que tiene como objetivo 12.500 actualizaciones de optimizador (50.000 exposiciones de muestras). El autor lo publica desde la organización `fm-dev` y el repositorio ocupa 12,8 GB, incluyendo pesos EMA de serving, activos de normalización e historial, código de inferencia, versiones exactas de dependencias y estado completo de reanudación.

El interés de esta ficha es acotado y conviene entenderlo bien: no es un modelo de lenguaje generalista ni un modelo listo para producción comercial. Es un artefacto de investigación sobre políticas visión-lenguaje-acción (VLA), con un condicionamiento específico llamado **Status-D**: 32 fotogramas muestreados uniformemente sobre el prefijo observado del episodio [0,t], más un keyframe opcional del módulo Writer, lo que suma 528 tokens visuales, junto con un subobjetivo actual del Writer y un contexto de Status de 48 pasos basado en comandos de pose registrados y estado medido.

El modelo produce acciones de forma `(20,8)`: posición absoluta xyz, cuaternión unitario XYZW en la carta de qx positiva y comando de gripper en [0,1]. La model card advierte explícitamente de que se trata de una publicación intermedia y que no constituye una evaluación de calidad de la política; la evaluación offline, cuando se incluye, no establece una tasa de éxito en robot real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | π0.5 (policy vision-language-action) con adaptadores LoRA de rango 32; no se detalla el backbone subyacente en la model card |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | no disponible; la model card describe un contexto de Status de 48 pasos y 528 tokens visuales para Status-D |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible; el repositorio incluye pesos EMA de serving, activos de normalizacion/historial y estado de reanudacion no EMA, de optimizador, RNG y sampler |

Otros datos operativos relevantes:

| Parametro | Valor |
|---|---|
| Tarea | button_order (Franka) |
| Checkpoint | paso 8.000 de la ronda `r2` |
| Exposiciones de muestra | 32.000 de un objetivo de 50.000 |
| Actualizaciones de optimizador objetivo | 12.500 |
| Frecuencia de guardado | cada 1.000 actualizaciones y en el paso final 12.500 |
| Hardware de entrenamiento | 4 x NVIDIA RTX A6000 |
| Batch global / por GPU | 4 / 1, sin acumulacion de gradientes |
| Optimizador | AdamW, LoRA rango 32, semilla 42 |
| Scheduler | warmup de 250 actualizaciones hasta 5e-5, decaimiento coseno hasta 5e-6 en el paso 12.500 |
| EMA | 0,999^4 = 0,996005996001 |
| Forma de salida | (20, 8): xyz absoluto, cuaternion unitario XYZW en carta qx positiva, comando de gripper en [0,1] |
| Normalizacion | STD para estado/acciones numericas; vista acotada train-q01/q99 para los tokens de estado |
| Tamano del repositorio | 12,8 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La model card indica que se parte de π0.5 y se aplica un ajuste fino LoRA de rango 32, con semilla 42 y AdamW. El entrenamiento se realizó localmente en 4 GPU RTX A6000, con batch global 4 y batch por GPU 1, sin acumulación de gradientes. El run objetivo son 12.500 actualizaciones de optimizador (50.000 exposiciones de muestra); este checkpoint del paso 8.000 corresponde a 32.000 exposiciones. El scheduler aplica un warmup de 250 actualizaciones hasta 5e-5 y un decaimiento coseno hasta 5e-6 en el paso 12.500, con EMA de factor 0,999^4. Todos los ajustes están en `training_config.json`.

La innovación técnica destacable no está en el backbone sino en el esquema de condicionamiento y supervisión. Status-D construye la entrada con 32 fotogramas muestreados uniformemente sobre el prefijo completo del episodio observado [0,t], más un keyframe nullable del Writer (528 tokens visuales en total) y un subobjetivo actual retenido del Writer. El Writer se inicializa al comienzo de la ejecución y se actualiza en los eventos de Status; su temporización offline se proyecta con estimaciones gruesas de eventos, lo que el autor califica explícitamente como condicionamiento de profesor y no como un rollout online con Status predichos. Los positivos de span de Status usan intervalos de eventos soportados; la supervisión de endpoints y negativos procede únicamente de ventanas revisadas explícitamente y las etiquetas no revisadas permanecen enmascaradas, con procedencia de revisión por agente/modelo y no como verdad de referencia humana.

En cuanto a la supervisión de acciones, solo las filas de ejecución del robot supervisan las acciones; las imágenes y características de demostración y las coordenadas originales de episodio/fotograma quedan disponibles como historial y el inicio de ejecución no reinicia el historial visual. Los splits de episodios y la normalización usan únicamente el split de entrenamiento. El contexto de Status de 48 pasos emplea comandos de pose registrados y estado medido, y su característica command-gripper está deshabilitada de forma consistente en entrenamiento e inferencia, sin inventar ningún comando de gripper ausente. Los embeddings de estado histórico están deshabilitados. La convención de pose cartesiana del efector final debe coincidir con el controlador de recolección, sin aplicar un offset adicional de herramienta/brida.

## Capacidades

- Generación de comandos de acción robótica: produce acciones de forma (20,8) con posición absoluta xyz, cuaternión unitario XYZW en la carta de qx positiva y comando de gripper en [0,1].
- Condicionamiento visual con historial: el modo Status-D consume 32 fotogramas del prefijo del episodio más un keyframe opcional del Writer, con 528 tokens visuales.
- Razonamiento de subobjetivos: mantiene un subobjetivo actual del Writer y lo actualiza en eventos de Status; la salida de inferencia incluye `transition_status`.
- Inferencia con contexto causal: requiere `history_keyframe_index` (un fotograma observado o None), `current_subgoal` y entradas causales `transition_context_*` en `policy.infer(...)`.
- API de historial: la función `observe(policy, base_rgb, state)` debe invocarse por cada fotograma observado, incluidas las demostraciones, y reiniciarse entre episodios.
- Enmascarado de componentes no supervisados: las componentes desconocidas permanecen NaN/false en el dataset y se enmascaran tanto en el condicionamiento de flujo como en la pérdida; las componentes totalmente no supervisadas listadas son `[]`.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible en el sentido de agentes LLM; el modelo es una política de manipulación.
- Capacidades multilingües: no disponibles.
- Capacidades especiales: modo de condicionamiento Status-D con Writer y supervision enmascarada; no se declaran visión general, audio ni thinking mode.

## Casos de uso

- Reanudación de experimentos de ajuste fino: el repositorio incluye el estado completo no EMA, de optimizador, RNG y sampler, además de las versiones exactas de dependencias, lo que permite continuar el run desde el paso 8.000 hasta las 12.500 actualizaciones objetivo sin reconstruir el entorno.
- Investigación en condicionamiento de políticas VLA: Status-D es un esquema concreto y documentado de subobjetivos, keyframes de Writer y enmascarado de etiquetas, útil para estudiar cómo afecta el condicionamiento de profesor a la política resultante.
- Ejecución sobre brazo Franka en laboratorio: los pesos EMA de serving permiten cargar la política mediante `from load_model import load, observe; policy = load()` y alimentarla con RGB e estado medido, respetando la convención de pose del controlador de recolección.
- Depuración de políticas con historial: la llamada obligatoria a `observe()` por cada fotograma, incluidos los de demostración, permite instrumentar cómo se acumula el historial visual y verificar que el reinicio entre episodios se realiza correctamente.
- Estudio de supervisión parcial y enmascarado de pérdida: el diseño con etiquetas no revisadas enmascaradas, negativos solo de ventanas revisadas y componentes NaN sirve como caso de estudio reproducible de entrenamiento con supervisión incompleta.
- Evaluación offline de políticas en pipelines de investigación: dado que el autor advierte que la evaluación offline no establece tasa de éxito real, el artefacto es adecuado para protocolos de evaluación offline internos y comparaciones controladas, no para validación de producto.
- Reproducibilidad de resultados: semilla 42, scheduler documentado, batch fijo y `training_config.json` permiten repetir el entrenamiento en un clúster equivalente de 4 GPU A6000.
- Integración en stacks de control cartesiano: la salida de pose absoluta más cuaternión y comando de gripper puede conectarse a un controlador que ya trabaje en esa convención, sin offset adicional de herramienta o brida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica de forma explícita que la publicación intermedia no constituye una evaluación de calidad de la política y que una eventual evaluación offline no establece una tasa de éxito en robot real. No se proporcionan cifras de latencia, throughput ni tasas de éxito.

## Requisitos de hardware

- Entrenamiento declarado por el autor: 4 GPU NVIDIA RTX A6000, con batch por GPU 1 y batch global 4, sin acumulación de gradientes.
- VRAM de inferencia: no disponible en la información proporcionada; el autor no publica el tamaño de los pesos de serving ni el consumo de memoria en inferencia.
- El bundle completo ocupa 12,8 GB e incluye pesos EMA de serving, activos de normalización e historial, código de inferencia y estado de reanudación (no EMA, optimizador, RNG y sampler); el tamaño final de los pesos desplegables es inferior a esa cifra pero no se especifica.
- Cabe en GPU de consumo: no confirmado. El entrenamiento con LoRA rango 32 y batch 1 por GPU se realizó en GPU de clase profesional de 48 GB, lo que no permite deducir el requisito de una GPU de consumo.
- GPU recomendadas: no disponible; la referencia empírica del autor es la RTX A6000.
- Opciones de despliegue: la vía prevista por el autor es el cargador incluido en el repositorio (`load_model.load` / `observe`). No se declara soporte de vLLM, llama.cpp, Ollama ni TGI, y no se publican pesos en formato GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se proporcionan en la información disponible datos verificables de modelos comparables (ni parámetros, ni contexto, ni resultados) que permitan una comparación rigurosa. La categoría natural de comparación son las políticas visión-lenguaje-acción para manipulación, y la referencia directa es el propio π0.5 sin LoRA, pero no se aportan cifras de ninguno de los dos.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| pi05-button-order-status-d-lora-gbs4-pgb1-gpu4-r2-step8000 | no disponible | no disponible | no disponible (sin benchmarks publicados) | no disponible | repositorio HuggingFace publico, 12,8 GB |
| π0.5 base | no disponible en la informacion proporcionada | no disponible | no disponible | no disponible | no disponible |
| Otras politicas VLA de manipulacion | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Checkpoint intermedio: corresponde al paso 8.000 de 12.500 actualizaciones objetivo y a 32.000 de 50.000 exposiciones de muestra; no es un modelo final.
- El propio autor declara que la publicación intermedia no es una evaluación de calidad de la política y que la evaluación offline no establece tasa de éxito en robot real.
- El condicionamiento del Writer es supervisión de profesor con temporización offline proyectada mediante estimaciones gruesas de eventos; no es un rollout online con Status predichos.
- La procedencia de las revisiones de etiquetas es revisión por agente/modelo, no verdad de referencia humana; las etiquetas no revisadas permanecen enmascaradas.
- Solo las filas de ejecución del robot supervisan acciones; el resto de datos actúa como historial.
- La salida de gripper de Shuffle no tiene supervisión de comando y no debe interpretarse como control de gripper aprendido.
- La tarea Button Order dispone únicamente de etiquetas verificadas de comando cerrado limitadas.
- Componentes de acción desconocidas permanecen como NaN/false y se enmascaran; las componentes totalmente no supervisadas listadas son `[]`.
- Uso obligatorio de la convención de pose cartesiana del efector final o herramienta del controlador de recolección, sin offset adicional de herramienta o brida; una convención distinta invalida la interpretación de las acciones.
- La característica command-gripper del contexto de Status de 48 pasos está deshabilitada en entrenamiento e inferencia; no se inventa ningún comando de gripper ausente.
- Los embeddings de estado histórico están deshabilitados, lo que limita el uso de información de estado pasada fuera del historial visual.
- La API exige llamar a `observe()` por cada fotograma observado, incluidas las demostraciones, y reiniciar el estado entre episodios; omitirlo produce un condicionamiento incorrecto.
- Licencia no disponible: no se puede confirmar el uso comercial ni las condiciones de redistribución. El repositorio no declara idiomas soportados.
- Sesgos conocidos: no disponible.
- Riesgo de alucinación: no aplicable en el sentido de texto generativo, pero existe riesgo de acciones incorrectas o no generalizables fuera de la distribución de entrenamiento, no cuantificado por el autor.
- Sin datos de latencia, throughput ni VRAM de inferencia publicados.
- Metadatos del repositorio sin tracción: 0 descargas y 0 likes en el momento de la consulta.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/fm-dev/pi05-button-order-status-d-lora-gbs4-pgb1-gpu4-r2-step8000
- No se han encontrado enlaces adicionales relevantes (papers, blogs, repositorios o demos) en la búsqueda web realizada: los resultados devueltos correspondían a directorios de emisoras de radio en francés y no guardan relación con el modelo.
