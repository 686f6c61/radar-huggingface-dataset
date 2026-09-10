# fm-dev/pi05-button-order-status-d-lora-gbs4-pgb1-gpu4-r2-step7000

## Resumen

El modelo `fm-dev/pi05-button-order-status-d-lora-gbs4-pgb1-gpu4-r2-step7000` es un ajuste fino mediante LoRA sobre π0.5 (pi05), un modelo de vision-lenguaje-accion (VLA) orientado al control de robots manipuladores. Lo publica el usuario `fm-dev` en HuggingFace con pipeline `robotics` y etiquetas `robotics, pi05, franka, lora`. Está especializado en la tarea interna denominada `button_order`, ejecutada sobre un brazo Franka, y corresponde a la segunda ronda de entrenamiento (`r2`), separada del experimento original de 6.250 pasos.

El checkpoint publicado es el paso 7.000, que según la model card representa 28.000 exposiciones de muestras de un total previsto de 12.500 actualizaciones del optimizador y 50.000 exposiciones. El entrenamiento se realizó en local sobre 4 GPU RTX A6000, con lote global 4, lote por GPU 1 y sin acumulación de gradiente, usando AdamW, LoRA de rango 32, semilla 42 y EMA con factor 0,999^4 = 0,996005996001. El repositorio ocupa 12,8 GB e incluye pesos EMA de servicio, activos de normalización e historial, código de inferencia y estado completo de reanudación (no EMA, optimizador, RNG y sampler).

La variante `Status-D` introduce un esquema de condicionamiento con 32 fotogramas muestreados uniformemente del prefijo observado del episodio, un keyframe opcional del componente denominado Writer (528 tokens visuales en total) y un subobjetivo actual retenido. La relevancia de esta ficha es acotada: se trata de un artefacto intermedio de investigación, con 0 descargas y 0 likes, cuyo propio autor advierte que la publicación intermedia no constituye una evaluación de calidad de la política y que una evaluación offline no establece la tasa de éxito en robot real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo VLA (vision-language-action) basado en π0.5, con adaptadores LoRA de rango 32; no se detallan en la informacion proporcionada el backbone concreto ni el tipo de torre visual/lenguaje |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no se describe una arquitectura MoE) |
| Longitud de contexto | no disponible como ventana de texto; la variante Status-D usa 32 fotogramas del prefijo del episodio (528 tokens visuales) y un contexto de Status de 48 pasos con comandos de pose registrados y estado medido |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de robotica; la model card no declara idiomas) |
| Licencia | no disponible |
| Formato de pesos | no disponible en la model card; el bundle de 12,8 GB incluye pesos EMA de servicio, activos de normalizacion/historial, codigo de inferencia, versiones exactas de dependencias y estado de reanudacion no EMA/optimizador/RNG/sampler |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura interna del modelo base π0.5; solo se indica que se trata de un ajuste fino LoRA de segunda ronda sobre ese modelo, aplicado a una tarea de manipulacion sobre Franka. El entrenamiento se ejecuto en 4 GPU RTX A6000 con lote global 4, lote por GPU 1 y sin acumulacion de gradiente. El calendario de aprendizaje es: 250 actualizaciones de warmup hasta 5e-5 y decaimiento coseno hasta 5e-6 en el paso 12.500. Se usan AdamW, LoRA de rango 32 y semilla 42; los checkpoints se guardan cada 1.000 actualizaciones y en el paso final 12.500. La configuracion completa esta en `training_config.json`.

El aspecto tecnico mas distintivo es el condicionamiento `Status-D`. Se toman 32 fotogramas muestreados uniformemente sobre el prefijo completo del episodio observado [0,t], mas un keyframe nullable del Writer (528 tokens visuales en total) y un subobjetivo actual retenido. El Writer se inicializa al comienzo de la ejecucion y se actualiza en eventos de Status; su temporizacion offline se proyecta con estimaciones gruesas de eventos, y la propia model card aclara que se trata de condicionamiento de profesor (teacher conditioning) y no de un rollout online con Status predicho. Las muestras positivas de intervalo de Status usan brackets de eventos soportados; la supervision de endpoints y negativos proviene solo de ventanas revisadas explicitamente, y las etiquetas no revisadas permanecen enmascaradas. La procedencia de la revision es revision por agente/modelo, no ground truth humano. El contexto de Status de 48 pasos usa comandos de pose registrados y estado medido; la caracteristica de pinza del comando se desactiva de forma coherente en entrenamiento e inferencia y no se inventa ningun comando de pinza ausente. Los embeddings de estado historico estan desactivados.

Solo las filas de ejecucion del robot supervisan acciones. Las imagenes y caracteristicas de demostracion, asi como las coordenadas originales de episodio/fotograma, permanecen disponibles como historial, y el inicio de la ejecucion no reinicia el historial visual. Los splits de episodios y la normalizacion usan unicamente el split de entrenamiento. Las salidas tienen forma `(20,8)`: xyz absolutos, cuaternion XYZW unitario en la carta de qx positiva y comando de pinza en [0,1]. El estado y las acciones numericas usan normalizacion por desviacion tipica (STD), mientras que los tokens de estado usan una vista separada acotada train-q01/q99. Los componentes de accion desconocidos permanecen como NaN/false en el dataset de entrenamiento y se enmascaran tanto en el condicionamiento de flujo como en la perdida. No hay componentes totalmente sin supervisar (`[]`), pero la salida de pinza de Shuffle no tiene supervision de comando y no debe interpretarse como control de pinza aprendido, y Button Order solo tiene etiquetas verificadas de comando cerrado limitadas.

## Capacidades

- Generacion de acciones de manipulacion robotica: produce comandos de accion de forma `(20,8)` con xyz absolutos, cuaternion XYZW unitario y comando de pinza en [0,1].
- Ejecucion de la tarea especifica `button_order` sobre un brazo Franka, con condicionamiento por subobjetivo actual.
- Condicionamiento visual e historica: consume imagenes RGB base (`base_rgb`) y estado a traves de `observe(policy, base_rgb, state)` para cada fotograma observado, incluidas las demostraciones.
- Razonamiento de subobjetivos con el esquema Status-D: mantiene un subobjetivo del Writer y expone `transition_status` en la salida de `policy.infer(...)`.
- Contexto temporal de 48 pasos para Status, construido con comandos de pose registrados y estado medido.
- Capacidad de reanudacion de entrenamiento: el bundle incluye estado no EMA, de optimizador, RNG y sampler.
- No se declaran capacidades de tool calling, function calling, agentes, vision general, audio ni modo de razonamiento explicito (thinking mode); no disponible en la informacion proporcionada.
- No se declaran capacidades multilingues; no disponible.

## Casos de uso

- Manipulacion de paneles de botones en entorno industrial: la politica genera comandos de pose y pinza para una secuencia de pulsado ordenada, con el subobjetivo actual como guia. Es adecuado porque la tarea `button_order` esta definida explicitamente en el checkpoint.
- Ajuste fino por tarea sobre un VLA base: sirve como referencia reproducible de un pipeline LoRA de rango 32 sobre π0.5, con semilla, calendario de learning rate y configuracion documentados en `training_config.json`.
- Investigacion en condicionamiento por eventos y subobjetivos: el esquema Status-D, con Writer inicializado al inicio de la ejecucion y actualizado en eventos de Status, permite estudiar como se comporta una politica cuando el subobjetivo cambia durante el episodio.
- Estudio de supervision parcial y enmascaramiento de etiquetas: el modelo se entreno con etiquetas no revisadas enmascaradas y componentes de accion desconocidos como NaN/false, lo que lo convierte en un caso de estudio util para tecnicas de aprendizaje con anotacion incompleta.
- Reproduccion y continuacion de experimentos: al incluir estado de reanudacion de optimizador, RNG y sampler, el bundle permite retomar el entrenamiento desde el paso 7.000 hacia el objetivo de 12.500 actualizaciones.
- Evaluacion offline de politicas VLA: el repositorio incluye codigo de inferencia (`load_model.load`, `observe`) y activos de normalizacion, lo que facilita montar evaluaciones offline comparables entre checkpoints de la misma ronda.
- Pruebas de integracion en bucle de control con estado medido: el contexto de Status de 48 pasos, alimentado con comandos de pose registrados y estado medido, permite ensayar la integracion de la politica en un bucle de control sin depender de una ventana de texto.
- No se recomienda su uso como componente de produccion: la propia model card indica que la publicacion intermedia no es una evaluacion de calidad y que la evaluacion offline no establece la tasa de exito en robot real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que la publicacion intermedia no constituye una evaluacion de calidad de la politica y que cualquier evaluacion offline incluida no establece la tasa de exito en robot real.

## Requisitos de hardware

- Entrenamiento: 4 GPU RTX A6000, lote global 4, lote por GPU 1, sin acumulacion de gradiente, LoRA de rango 32, AdamW, semilla 42, EMA 0,996005996001.
- VRAM estimada para inferencia: no disponible. El tamano del repositorio (12,8 GB) incluye pesos EMA de servicio, activos de normalizacion e historial y estado completo de reanudacion, por lo que no equivale al consumo de memoria en inferencia.
- GPU recomendadas para inferencia: no disponible; solo se documenta el hardware de entrenamiento (RTX A6000).
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: no se cita soporte para vLLM, llama.cpp, Ollama ni TGI. La carga se realiza con el codigo de inferencia incluido en el bundle: `from load_model import load, observe; policy = load()`, y para Status-D se requieren ademas `history_keyframe_index`, `current_subgoal` y las entradas causales `transition_context_*` en `policy.infer(...)`.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de datos comparativos en la informacion proporcionada. La model card no incluye cifras de rendimiento ni referencias a otros modelos. Como contexto de categoria, los modelos comparables serian otros VLA de manipulacion (el propio π0.5 base, π0 u otros VLA afinados por tarea), pero no hay datos en la informacion disponible para establecer una comparacion cuantitativa.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| pi05-button-order-status-d-lora-gbs4-pgb1-gpu4-r2-step7000 | no disponible | 32 fotogramas (528 tokens visuales) + Status de 48 pasos en la variante Status-D | no disponible | no disponible | HuggingFace, 0 descargas, 0 likes |
| π0.5 base | no disponible | no disponible | no disponible | no disponible | no disponible en la informacion proporcionada |
| π0 | no disponible | no disponible | no disponible | no disponible | no disponible en la informacion proporcionada |
| Otros VLA afinados por tarea | no disponible | no disponible | no disponible | no disponible | no disponible en la informacion proporcionada |

## Limitaciones y advertencias

- No es una evaluacion de calidad: el autor advierte que la publicacion intermedia no constituye una evaluacion de la calidad de la politica.
- La evaluacion offline, si se incluye, no establece la tasa de exito en robot real.
- Anotacion incompleta: la supervision de endpoints y negativos proviene solo de ventanas revisadas explicitamente; las etiquetas no revisadas permanecen enmascaradas.
- Procedencia de la revision: la revision es por agente/modelo, no ground truth humano.
- Condicionamiento de profesor: la temporizacion offline del Writer se proyecta con estimaciones gruesas de eventos; no es un rollout online con Status predicho.
- Sin supervision de pinza en algunos componentes: la salida de pinza de Shuffle no tiene supervision de comando y no debe interpretarse como control de pinza aprendido; Button Order tiene solo etiquetas verificadas de comando cerrado limitadas.
- La caracteristica de pinza del comando en el contexto de Status esta desactivada tanto en entrenamiento como en inferencia, y no se inventa ningun comando de pinza ausente.
- Los embeddings de estado historico estan desactivados.
- Convencion de pose: la convencion registrada de pose cartesiana del efector final/herramienta debe coincidir con el controlador de recogida; no debe aplicarse un desplazamiento adicional de herramienta/brida.
- Licencia no disponible: no hay informacion sobre permisos de uso comercial, por lo que no puede asumirse ningun derecho de explotacion.
- Idiomas y sesgos: no disponibles; no se declaran idiomas soportados ni estudios de sesgo.
- Especificidad de tarea: el checkpoint esta afinado para `button_order` sobre Franka, por lo que su transferencia a otras tareas o plataformas no esta documentada.
- Requisitos de entrada especificos: para historial hay que llamar a `observe` en cada fotograma observado (incluidas demostraciones) y reiniciar entre episodios; Status-D exige ademas `history_keyframe_index` (un fotograma observado o None), `current_subgoal` y entradas causales de contexto, y el uso del calendario del Writer exportado con el fotograma de control correspondiente.
- Cero adopcion publica: 0 descargas y 0 likes en el momento de la consulta, sin senales externas de validacion.

## Enlaces

- HuggingFace: https://huggingface.co/fm-dev/pi05-button-order-status-d-lora-gbs4-pgb1-gpu4-r2-step7000
- Resultados de la busqueda web: no se encontro ningun enlace relevante. Las busquedas devolvieron exclusivamente sitios de radio en linea en frances (radio-en-ligne.fr, fr.wikipedia.org/wiki/Radio_FM, last.fm, cheriefm.fr, radio-en-direct.app), sin relacion con el modelo.
- Paper, blog, repositorio o demo adicionales: no disponible en la informacion proporcionada.
