# GeertWang/pi05-pipette-fulltask-multitask-bc-20261003

## Resumen

Este repositorio contiene un checkpoint de politica robotica de imitacion (behavior cloning) construido sobre pi0.5, el modelo vision-lenguaje-accion nativo de OpenPI, inicializado desde el checkpoint oficial `gs://openpi-assets/checkpoints/pi05_base`. Lo publica el usuario GeertWang y esta disenado para ejecutar cinco tareas de pipeteo con un robot humanoide Unitree G1, seleccionables mediante instrucciones de lenguaje natural, compartiendo un unico conjunto de parametros, estadisticas de normalizacion e interpretacion de acciones.

A diferencia de las aproximaciones que entrenan una politica por tarea, aqui se ha realizado un ajuste fino completo (full fine-tuning, sin LoRA) sobre los 202 episodios de entrenamiento combinados, con 137.741 anclas filtradas y un total de 10.762 actualizaciones (aproximadamente 10 epocas). El checkpoint publicado corresponde al paso 9.693, elegido por menor error cuadratico medio (MSE) de accion normalizado sobre 2.400 fragmentos de validacion fijos.

Es relevante porque demuestra una politica multitarea condicionada por lenguaje sobre hardware humanoide real, con contrato de entrada y accion completamente documentado, y porque el autor explicita las incompatibilidades con versiones anteriores (decodificador de pulgar dependiente de fase y adaptador de accion HIL293 XYZ-only). El modelo es un checkpoint JAX nativo en formato orbax: no es un modelo de chat, no es un checkpoint de Transformers/PyTorch y no se realizo conversion alguna a PyTorch.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | pi0.5 nativo (vision-lenguaje-accion, familia OpenPI); detalles internos de capas no disponibles en la informacion |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | texto: maximo 320 tokens; entrada visual: 2 imagenes RGB (head y left-wrist); tercer slot de imagen a cero y enmascarado |
| Tipos de cuantizacion | no disponible (checkpoint en precision nativa JAX/orbax; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | en (instrucciones en ingles) |
| Licencia | no disponible |
| Formato de pesos | JAX/orbax (`params/` + `assets/` forman el checkpoint de inferencia; sin estado del optimizador) |

## Arquitectura y entrenamiento

La politica es un modelo pi0.5 nativo de OpenPI, entrenado en JAX con la revision `2d70d966582e711128ad8358d8dbf23d2cc3d658` de OpenPI, partiendo del checkpoint base oficial `pi05_base`. Es un modelo condicionado por lenguaje que combina entradas visuales (imagen de cabeza y muneca izquierda), un vector de estado de 59 dimensiones y una instruccion textual de hasta 320 tokens. El estado se normaliza por cuantiles y se tokeniza mediante la entrada de estado discreta nativa de pi0.5. La cabeza de accion produce 30 x 32 valores a 60 Hz (un chunk nominal de 0,5 s; el primer elemento del chunk es cero por construccion en las traslaciones de muneca). El ajuste fue completo, sobre todos los parametros, con perdida de flujo (flow matching) nativa sobre las 32 dimensiones de accion.

El entrenamiento uso el dataset `jren313/g1-pipette-2view-teleop0925-5task-eerel` en la revision `340ebabb48e6d1fb42f92178fba0f6ded87322df`, con 202 episodios de entrenamiento y 35 de validacion, y muestreo uniforme barajado sobre 137.741 anclas filtradas (las tareas mas grandes contribuyen proporcionalmente mas). Se aplico una puerta de movimiento solo en entrenamiento (desplazamiento combinado de muneca izquierda/derecha en el chunk >= 1 mm) y un normalizador de cuantiles comun. La configuracion de optimizacion fue: batch global 128, dos GPU B200, FSDP2, semilla 42, sin EMA, AdamW con betas (0,9; 0,95), eps 1e-8, weight decay 1e-10, gradient clipping 1, learning rate 1e-5 con warmup de 100 pasos y decaimiento coseno hasta 1e-6 en 10.762 actualizaciones. Solo durante entrenamiento se aplico dropout del estado normalizado completo con probabilidad 0,8 y recorte aleatorio. La evaluacion y el guardado se hicieron cada 1.077 actualizaciones, con 10 pasos de denoising.

## Capacidades

- Generacion de acciones de control para un robot humanoide Unitree G1 en cinco tareas de pipeteo, seleccionables por instruccion de lenguaje natural.
- Condicionamiento por lenguaje: cambio de tarea cambiando el texto de la instruccion, sin recargar el modelo ni cambiar estadisticas de normalizacion.
- Manejo de entrada multimodal: dos flujos RGB (cabeza y muneca izquierda) mas estado propietario de 59 dimensiones.
- Salida de chunk de acciones de 30 x 32 valores (posiciones y rotaciones de muneca chunk-relativas, registros absolutos de mano y comandos absolutos de articulaciones de brazo en radianes).
- Inferencia a 60 Hz en el dataset; la tasa de replanificacion es un ajuste del controlador, no la FPS del dataset.
- No soporta tool calling ni function calling.
- No esta documentado como agente de razonamiento multi-paso; la deteccion automatica de fin de etapa y el cambio de prompt son responsabilidad del controlador externo.
- Capacidades multilingues: no disponible; solo se documentan instrucciones en ingles.
- Capacidades especiales: no se documentan modos de pensamiento, vision general, audio ni otras capacidades fuera del control robotico.

## Casos de uso

- Ejecucion multitarea de pipeteo en laboratorio automatizado: una sola politica cubre las cinco etapas (recoger pipeta, recoger tubo, apuntar, devolver tubo, devolver pipeta), lo que simplifica el despliegue al eliminar la gestion de cinco checkpoints distintos.
- Control por lenguaje natural en robot humanoide G1: el operador o un planificador de alto nivel emite la instruccion correspondiente a la etapa actual y el modelo genera el chunk de acciones adecuado.
- Investigacion en behavior cloning multitarea: sirve como linea base reproducible (semilla 42, hiperparametros y revision de dataset documentados) para comparar estrategias de entrenamiento conjunto frente a politicas por tarea.
- Evaluacion de contrato de estado/accion: util para validar implementaciones de reconstruccion de acciones chunk-relativas (`p_target = p_anchor + delta_p`, `R_target = R_anchor @ Exp(delta_rot)`) y para comprobar que no se suman acumulativamente las traslaciones relativas.
- Integracion en pilas OpenPI/JAX existentes: al ser un checkpoint nativo orbax sin conversion a PyTorch, encaja directamente en herramientas que ya consumen checkpoints OpenPI.
- Reentrenamiento o ajuste posterior: el autor conserva el checkpoint de estado completo localmente para reanudar el entrenamiento, de modo que el flujo sirve como referencia para continuar el ajuste en otra maquina (relocalizando las rutas HPC registradas en `training_config.yaml`).
- Analisis de transferencia entre etapas: al compartir modelo y estadisticas, permite estudiar interferencia entre tareas y el efecto del muestreo proporcional al tamano de cada tarea.

## Benchmarks y rendimiento

Los datos disponibles son de validacion offline (predicciones sobre observaciones grabadas), no de despliegue en bucle cerrado ni tasas de exito en robot real. La tabla por tarea incluida en la model card aparece truncada en la informacion proporcionada, por lo que solo se recogen las metricas agregadas.

| Metrica | Modelo | Baseline (hold) |
|---|---|---|
| MSE normalizado de validacion (mejor checkpoint, paso 9.693) | 0,03888196 | 0,04670338 |
| Reduccion frente al baseline | 16,75% | - |
| MSE normalizado en el paso final | 0,03899255 | - |
| Perdida de entrenamiento (ultimo registro) | 0,0086 (desde 0,5712) | - |

Protocolo: 480 fragmentos fijos por tarea, equilibrados por episodio (2.400 en total), 30 acciones por fragmento, semilla 42, 10 pasos de denoising. El baseline "hold" mantiene la primera accion comandada de cada fragmento, no un vector de 32 dimensiones a cero. El autor advierte que la perdida de flow matching y el MSE de accion muestreada son objetivos distintos y no deben compararse numericamente como brecha entrenamiento/validacion. No se han publicado resultados de benchmarks comparativos externos (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- Entrenamiento: dos GPU B200 con FSDP2, batch global 128, segun la model card.
- Tamano del repositorio: 12,4 GB (checkpoint de inferencia sin estado del optimizador); ese es el espacio en disco necesario para `params/` y `assets/`.
- VRAM estimada para inferencia: no disponible en la informacion proporcionada. Como referencia, el checkpoint de inferencia ocupa 12,4 GB en disco, por lo que se necesita al menos ese orden de magnitud de memoria en GPU o reparto entre dispositivos.
- GPU recomendadas: no disponible en la informacion proporcionada; el autor solo documenta B200 para entrenamiento.
- Compatibilidad con GPU de consumo: no disponible. No se documenta si cabe en tarjetas tipo RTX 4090.
- Opciones de despliegue: libreria `openpi` con checkpoint JAX/orbax (revision OpenPI `2d70d966582e711128ad8358d8dbf23d2cc3d658`). No se documentan rutas vLLM, llama.cpp, Ollama ni TGI; al no ser un modelo de lenguaje en formato GGUF ni Transformers/PyTorch, esas herramientas no aplican tal cual.
- Latencia y throughput: no disponible. La model card indica que la tasa de inferencia/replanificacion la fija el controlador y no coincide con los 60 Hz del dataset.
- Nota de portabilidad: `training_config.yaml` contiene rutas HPC originales que deben reubicarse para ejecutar en otra maquina.

## Comparativa con modelos similares

Los datos cuantitativos de los modelos comparables no estan disponibles en la informacion proporcionada; la tabla recoge unicamente lo que la model card menciona de forma explicita.

| Modelo | Parametros | Contexto / entradas | Licencia | Disponibilidad |
|---|---|---|---|---|
| Este checkpoint (pi05 pipette multitask) | no disponible | texto hasta 320 tokens; 2 imagenes RGB; estado de 59 dims; accion 30 x 32 | no disponible | HuggingFace, 12,4 GB, JAX/orbax |
| pi05_base (inicializacion oficial) | no disponible | no disponible | no disponible | `gs://openpi-assets/checkpoints/pi05_base` |
| Modelos full-task anteriores del mismo autor (separados por tarea) | no disponible | no disponible | no disponible | mencionados en la model card, sin enlace |
| Adaptador de accion HIL293 XYZ-only anterior | no disponible | solo XYZ | no disponible | mencionado; incompatible con este modelo |

No se comparan aqui otras familias VLA (por ejemplo OpenVLA o GR00T N1) porque no aparecen en la informacion proporcionada y sus cifras no se han facilitado.

## Limitaciones y advertencias

- La licencia no esta disponible: no se puede asumir uso comercial sin aclaracion del autor.
- El autor indica explicitamente que este run de behavior cloning no establece exito autonomo de la tarea completa. La deteccion automatica de fin de etapa y el cambio de instruccion son responsabilidad del controlador.
- Las metricas publicadas son predicciones offline sobre observaciones grabadas, no rollouts en bucle cerrado ni tasas de exito reales; el 16,75% de mejora sobre el baseline es una mejora de MSE, no una medida de exito de tarea.
- Riesgo de sobreajuste a la distribucion de demostraciones de teleoperacion del dataset `jren313/g1-pipette-2view-teleop0925-5task-eerel` y al montaje fisico concreto (posiciones de soporte y gradilla).
- Contrato de accion propenso a errores: las traslaciones y rotaciones de muneca son chunk-relativas y deben reconstruirse con el ancla sincronizada; sumarlas acumulativamente produce comandos incorrectos. Los comandos de mano y articulaciones son absolutos y no deben transformarse.
- Incompatibilidad declarada con el decodificador de pulgar dependiente de fase de los modelos anteriores (p2-p5 usaban comandos relativos del pulgar izquierdo) y con el adaptador HIL293 XYZ-only. Mezclar componentes produce comportamiento incorrecto.
- Es un checkpoint solo de inferencia: no incluye estado del optimizador, por lo que no sirve por si solo para reanudar el entrenamiento (el autor conserva ese estado localmente).
- Idioma: unicamente ingles en las instrucciones; no hay soporte documentado para castellano ni otros idiomas.
- No es un modelo de lenguaje conversacional ni soporta tool calling; no se puede reutilizar como generador de texto.
- La tabla de resultados por tarea de la model card esta truncada en la informacion disponible, lo que impide verificar el rendimiento por etapa.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/GeertWang/pi05-pipette-fulltask-multitask-bc-20261003
- Dataset de entrenamiento: https://huggingface.co/datasets/jren313/g1-pipette-2view-teleop0925-5task-eerel
- Checkpoint base de inicializacion: `gs://openpi-assets/checkpoints/pi05_base`
- Revision de OpenPI utilizada: `2d70d966582e711128ad8358d8dbf23d2cc3d658`
- Revision del dataset: `340ebabb48e6d1fb42f92178fba0f6ded87322df`
- La busqueda web realizada no devolvio ningun resultado relevante para este modelo; los unicos enlaces utiles son los disponibles en la propia model card.
