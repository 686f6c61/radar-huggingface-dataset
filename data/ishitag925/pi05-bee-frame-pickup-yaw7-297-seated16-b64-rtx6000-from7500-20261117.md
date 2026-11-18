# ishitag925/pi05-bee-frame-pickup-yaw7-297-seated16-b64-rtx6000-from7500-20261117

## Resumen

Este repositorio contiene un checkpoint de ajuste fino del modelo de politica robotica pi0.5 (Pi-Zero-Point-Five) de Physical Intelligence, entrenado por el usuario ishitag925 para una tarea concreta de manipulacion: la recogida de un marco de abeja (bee-frame pickup) con un brazo robotico Piper-X configurado con siete grados de libertad de actuacion sobre eje yaw. No se trata de un modelo de lenguaje generalista, sino de una politica visomotora que mapea observaciones RGB (camara trasera y muneca derecha) a acciones de articulacion y pinza.

El modelo parte del checkpoint 7500 de un entrenamiento previo publicado en el Hub y continua el entrenamiento en una estacion de trabajo RTX PRO 6000 hasta el paso 12000 (ultimo checkpoint publicado), con un objetivo declarado de 50.000 pasos. La receta original se mantiene: entrenamiento completo de pi0.5, batch global de 64, microbatch de 64, dos GPUs con FSDP, horizonte de accion de 50, EMA desactivado y decaimiento coseno de la tasa de aprendizaje de 5e-5 a 5e-6 durante 30.000 pasos absolutos.

Es relevante ahora porque ejemplifica el flujo de trabajo de ajuste fino de politicas roboticas open source sobre OpenPI, incluyendo la publicacion periodica de checkpoints cada 500 pasos con sus assets de normalizacion, lo que permite reproducibilidad y reanudacion. El repositorio pesa 12,4 GB y no incluye evaluacion en split reservado, por lo que el exito de la politica no esta establecido por la perdida de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | pi0.5 (politica visomotora de Physical Intelligence, OpenPI) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (horizonte de accion de 50 pasos) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de robotica, sin interfaz de lenguaje declarada) |
| Licencia | no disponible |
| Formato de pesos | checkpoints bajo `checkpoints/STEP/params` y `checkpoints/STEP/assets` (formato OpenPI; no se especifica safetensors/GGUF) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino completo de pi0.5, la politica visomotora de Physical Intelligence implementada en OpenPI (revision `215abfb217dbac7d5f1273282331b9b1866c0479`). La arquitectura concreta de pi0.5 no se detalla en la informacion disponible; se sabe que el entrenamiento usa dos GPUs con FSDP, microbatch de 64 y batch global de 64, con horizonte de accion de 50 y EMA desactivado. El modelo consume dos camaras RGB (trasera y muneta derecha) y produce siete acciones absolutas de articulacion y pinza.

El dataset de entrenamiento es `ishitag925/bee-frame-pickup-yaw7-297-seated16-lerobot`, fijado al commit `c0113780504cc1b2bdd006dad96f4d1571eb9aeb`, con 297 episodios y 413.637 frames en formato LeRobot. El entrenamiento se inicializo desde el checkpoint 7500 del run original (revision `871530146c382749703fb3d6c7045cdd8178cabf`); como el checkpoint de origen solo contenia pesos de politica y assets de normalizacion, los momentos de AdamW y la correccion de sesgo se reiniciaron, mientras que el schedule de learning rate continua desde el paso absoluto 7500. La tasa decae de forma coseno de 5e-5 a 5e-6 a lo largo de 30.000 pasos absolutos y despues se mantiene en 5e-6. No se menciona RLHF, DPO ni tecnicas de decodificacion especulativa.

## Capacidades

- Generacion de acciones de control roboticas: mapea observaciones de dos camaras RGB a siete acciones absolutas de articulacion y pinza con horizonte de 50 pasos.
- Manipulacion visomotora especifica: entrenado para la tarea de recogida de un marco de abeja (bee-frame pickup) en una configuracion Piper-X con yaw de 7 grados.
- Entrada multimodal visual: usa camara trasera y camara de muneca derecha como fuentes de observacion.
- No se documenta soporte de tool calling, function calling, agentes multi-paso ni razonamiento de texto.
- No se documentan capacidades multilingues ni modos de pensamiento (thinking mode), vision general o audio.
- Publicacion periodica de checkpoints cada 500 pasos con pesos de politica y assets de normalizacion, lo que facilita la inspeccion y reanudacion.

## Casos de uso

- Recogida automatizada de piezas en linea de montaje: la politica esta entrenada especificamente para la tarea de bee-frame pickup con un brazo Piper-X; se desplegaria como controlador visomotor que recibe frames de las dos camaras y emite comandos de articulacion y pinza a 50 pasos de horizonte, adecuado para ciclos repetitivos de pick-and-place.
- Investigacion en aprendizaje por imitacion: el repositorio sirve como punto de partida para estudiar el ajuste fino de pi0.5 sobre datasets LeRobot de 297 episodios, comparando la evolucion de checkpoints cada 500 pasos y el efecto del reinicio de momentos de AdamW.
- Reproduccion de experimentos de robotica: al estar fijados el commit del dataset y la revision de OpenPI, permite reproducir el entrenamiento con FSDP en dos GPUs y validar la receta de learning rate coseno.
- Benchmark interno de politicas visomotoras: util para comparar el rendimiento de pi0.5 frente a otras politicas sobre la misma tarea y configuracion de camaras, aunque sin split de evaluacion reservado.
- Desarrollo de pipelines de publicacion de checkpoints: el esquema de publicador en segundo plano que hace snapshot de los ficheros antes de subirlos sirve como referencia para entrenamientos de larga duracion con publicacion periodica.
- Prototipado de control de brazos de 7 grados de libertad: la configuracion yaw7 con siete acciones absolutas es un ejemplo concreto para adaptar politicas a otras tareas de manipulacion con el mismo hardware.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que no existe split de evaluacion reservado y que la perdida de entrenamiento no establece el exito de la politica.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el tamano del repositorio es de 12,4 GB, lo que da una cota inferior del espacio en disco necesario para los pesos.
- GPU de entrenamiento documentadas: dos GPUs con FSDP; el run de continuacion se ejecuto en una estacion de trabajo RTX PRO 6000.
- GPU recomendadas para inferencia: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: la libreria declarada es `openpi`; no se documentan vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de politica).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| pi05-bee-frame-pickup-yaw7-297-seated16-b64-rtx6000-from7500-20261117 | no disponible | no disponible (horizonte de accion 50) | sin benchmarks publicados | no disponible | Hugging Face (0 descargas) |
| pi05-bee-frame-pickup-yaw7-297-seated16-b64-mit-20261116 (modelo base) | no disponible | no disponible | sin benchmarks publicados | no disponible | Hugging Face |
| Otras politicas pi0.5 de OpenPI | no disponible | no disponible | no disponible | no disponible | no disponible en la informacion proporcionada |

No se dispone de datos de benchmarks ni de especificaciones de alternativas comparables en la informacion proporcionada.

## Limitaciones y advertencias

- No existe split de evaluacion reservado; la perdida de entrenamiento no demuestra que la politica tenga exito en la tarea real.
- El modelo esta especializado en una unica tarea (bee-frame pickup) y una configuracion de hardware concreta (Piper-X, yaw7, camara trasera y muneca derecha); no es generalizable sin nuevo ajuste fino.
- Los momentos de AdamW y la correccion de sesgo se reiniciaron al continuar desde el checkpoint 7500, lo que puede introducir diferencias respecto a un entrenamiento ininterrumpido.
- La licencia no esta disponible, por lo que no se puede confirmar el uso comercial.
- No se documentan sesgos, riesgos de alucinacion ni limitaciones de idioma porque el modelo no es de lenguaje natural.
- El checkpoint publicado mas reciente es el 12000, lejos del objetivo de 50.000 pasos; el estado del entrenamiento puede ser intermedio e inestable.
- Solo se publican pesos de politica y assets de normalizacion, no checkpoints completos de optimizador, lo que limita la reanudacion exacta por terceros.
- El repositorio tiene 0 descargas y 0 likes, sin validacion externa de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/ishitag925/pi05-bee-frame-pickup-yaw7-297-seated16-b64-rtx6000-from7500-20261117
- Modelo base: https://huggingface.co/ishitag925/pi05-bee-frame-pickup-yaw7-297-seated16-b64-mit-20261116
- Dataset: https://huggingface.co/datasets/ishitag925/bee-frame-pickup-yaw7-297-seated16-lerobot
- OpenPI (Physical Intelligence): no disponible en la informacion proporcionada (revision citada `215abfb217dbac7d5f1273282331b9b1866c0479`)
