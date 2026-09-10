# fm-dev/pi05-button-order-status-d-lora-gbs4-pgb1-gpu4-r2-step11000

## Resumen

El repositorio `fm-dev/pi05-button-order-status-d-lora-gbs4-pgb1-gpu4-r2-step11000` contiene un checkpoint de ajuste fino con LoRA (rango 32) sobre el modelo base π0.5, orientado a robótica de manipulación. En concreto, es la segunda ronda (`r2`) de un experimento de fine-tuning para la tarea `button_order`, ejecutado sobre un brazo Franka, en el paso 11.000 de un ciclo que aspira a 12.500 actualizaciones del optimizador (44.000 exposiciones de muestras de las 50.000 previstas). El autor es el usuario `fm-dev` y el repositorio, de 12,8 GB, incluye pesos EMA de serving, activos de normalización e historial, código fuente de inferencia y el estado completo de reanudación (no-EMA, optimizador, RNG y sampler).

El interés técnico del checkpoint reside en su variante `Status-D`, un esquema de condicionamiento que combina 32 fotogramas muestreados uniformemente sobre el prefijo del episodio observado [0, t] más un keyframe opcional del denominado Writer, hasta un total de 528 tokens visuales, junto con un subobjetivo actual retenido del Writer. Este Writer se inicializa al comienzo de la ejecución y se actualiza en eventos de Status, y su temporización offline se proyecta con estimaciones gruesas de eventos, lo que el propio autor etiqueta explícitamente como condicionamiento de profesor y no como una política de Status predicha en línea.

Se trata de un artefacto de investigación en fase intermedia de publicación: no hay métricas de éxito en robot real, no se declara licencia, no se declaran idiomas y el propio autor advierte que la publicación intermedia no constituye una evaluación de calidad de la política. Las salidas tienen forma `(20, 8)`: posición absoluta xyz, cuaternión unitario XYZW en la carta de qx positivo y comando de gripper en [0, 1].

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible en detalle (modelo base π0.5 con adaptadores LoRA de rango 32; pipeline declarado: robotics) |
| Parametros totales | no disponible (el repositorio ocupa 12,8 GB e incluye pesos EMA, estado del optimizador, RNG y sampler, por lo que no equivale al tamano del checkpoint de serving) |
| Longitud de contexto | no disponible de forma general; la variante Status-D usa 528 tokens visuales y un contexto de Status de 48 pasos construido con comandos de pose registrados y estado medido |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no se declaran idiomas; el modelo pertenece al dominio robotic) |
| Licencia | no disponible |
| Formato de pesos | no disponible (se indica que el repositorio incluye pesos EMA de serving, activos de normalizacion e historial, codigo de inferencia en `load_model.py` y versiones exactas de dependencias) |

## Arquitectura y entrenamiento

El checkpoint es un ajuste fino LoRA de rango 32 sobre π0.5, con seed 42 y optimizador AdamW. El entrenamiento se realizó localmente en 4 GPU RTX A6000, con batch global de 4 y batch por GPU de 1, sin acumulación de gradientes; esto implica 4 muestras por actualización y un total de 44.000 exposiciones de muestras en el paso 11.000. El esquema de tasa de aprendizaje consiste en un calentamiento de 250 actualizaciones hasta 5e-5 y un decaimiento coseno hasta 5e-6 en el paso 12.500. Los checkpoints se guardan cada 1.000 actualizaciones y en el paso final 12.500. Se aplica EMA con factor 0,999^4 = 0,996005996001.

La innovación técnica destacable es el condicionamiento `Status-D`. Se muestrean 32 fotogramas uniformemente sobre el prefijo completo del episodio observado [0, t] y se añade un keyframe opcional del Writer, sumando 528 tokens visuales, junto con un subobjetivo actual del Writer mantenido como condicionamiento. El Writer se inicializa al inicio de la ejecución y se actualiza en eventos de Status; su temporización offline se proyecta mediante estimaciones gruesas de eventos, lo que el autor describe como condicionamiento de profesor y no como un despliegue en línea con Status predicho. Las anotaciones positivas del span de Status usan corchetes de eventos soportados, mientras que la supervisión de extremos y negativos procede únicamente de ventanas revisadas explícitamente; las etiquetas no revisadas permanecen enmascaradas y la procedencia de la revisión es agente/modelo, no verdad humana de referencia. El contexto de Status de 48 pasos emplea comandos de pose registrados y estado medido, con la característica de comando de gripper deshabilitada de forma consistente en entrenamiento e inferencia, y con los embeddings de estado histórico deshabilitados.

Solo las filas de ejecución del robot supervisan acciones. Las imágenes de demostración, características y coordenadas originales de episodio/fotograma permanecen como historial, y el inicio de la ejecución no reinicia el historial visual. Los splits de episodios y la normalización usan únicamente el split de entrenamiento. Los componentes de acción desconocidos permanecen como NaN/false en el dataset de entrenamiento y se enmascaran tanto en el condicionamiento de flujo como en la pérdida; la lista de componentes totalmente no supervisados está vacía. La normalización numérica de estado y acciones usa STD, mientras que los tokens de estado emplean una vista separada acotada train-q01/q99.

## Capacidades

- Generación de acciones de manipulación robótica en formato `(20, 8)`: posición absoluta xyz, cuaternión unitario XYZW en la carta de qx positivo y comando de gripper en [0, 1].
- Ejecución de la tarea `button_order` sobre un brazo Franka, con la convención de pose cartesiana de efector final/herramienta registrada por el controlador de recogida.
- Condicionamiento por historial visual mediante la función `observe(policy, base_rgb, state)` aplicada a cada fotograma observado, incluidas las demostraciones, con reinicio entre episodios.
- Condicionamiento por subobjetivo: la variante Status-D acepta `current_subgoal` y un `history_keyframe_index` explícito (un fotograma observado o None).
- Entrada de contexto de transición causal mediante los parámetros `transition_context_*` en `policy.infer(...)`.
- Salida de estado de transición: la inferencia devuelve `transition_status` como parte del resultado.
- Planificación temporal del Writer: se exporta un calendario del Writer que debe usarse junto con el fotograma de control correspondiente.
- Reanudación exacta del entrenamiento: el repositorio incluye estado de reanudación no-EMA, del optimizador, de RNG y del sampler.
- Servicio con pesos EMA: se incluyen pesos EMA de serving separados de los pesos de entrenamiento.
- No se declaran capacidades de tool calling, function calling, agentes multi-paso, razonamiento textual, matemáticas, visión general, audio ni modo de pensamiento.

## Casos de uso

- Manipulación de botones con brazo Franka: el checkpoint se ha ajustado específicamente para la tarea `button_order`, de modo que puede emplearse como política de control en ese escenario concreto sobre una celda Franka que respete la convención de pose del controlador de recogida.
- Evaluación comparativa de rondas de fine-tuning: al conservar `r2` como artefacto separado del experimento original de 6.250 pasos, permite contrastar el efecto del segundo ciclo de entrenamiento manteniendo el resto de hiperparámetros documentados.
- Reproducción de experimentos: el estado completo de reanudación (optimizador, RNG, sampler, pesos no-EMA) permite retomar el entrenamiento en el paso 11.000 y continuar hasta 12.500 sin reconstruir el pipeline.
- Investigación en condicionamiento por subobjetivos: la variante Status-D con `current_subgoal` y keyframe del Writer sirve para estudiar cómo el condicionamiento de profesor afecta a la ejecución de tareas de manipulación con cambios de subobjetivo.
- Estudio de supervisión parcial con enmascaramiento: el diseño de etiquetas (positivos por corchetes de eventos soportados, negativos solo en ventanas revisadas y enmascaramiento del resto) es un banco de pruebas para investigar aprendizaje con supervisión incompleta en robótica.
- Detección y conmutación de estados de transición: la salida `transition_status` y el contexto de Status de 48 pasos permiten experimentar con conmutación de subobjetivos basada en eventos durante la ejecución.
- Despliegue con pesos EMA en producción de laboratorio: los pesos EMA de serving junto con los activos de normalización e historial y el código de inferencia permiten montar un servicio de política reproducible con dependencias fijadas.
- Reajuste adicional con LoRA: dado que el artefacto es un adaptador LoRA de rango 32 sobre π0.5, puede servir como punto de partida para nuevos ajustes con otros rangos o tareas dentro del mismo entorno.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

El autor indica explícitamente que la publicación intermedia no es una evaluación de calidad de la política y que la evaluación offline, cuando se incluye, no establece la tasa de éxito en robot real. No se proporcionan cifras de MMLU, HumanEval, GSM8K ni de éxito de tarea.

## Requisitos de hardware

- Entrenamiento: el checkpoint se entrenó en 4 GPU RTX A6000 con batch global 4 y batch por GPU 1, sin acumulación de gradientes. La configuración completa está en `training_config.json` del propio repositorio.
- VRAM de entrenamiento: no disponible de forma explícita; las RTX A6000 empleadas disponen de 48 GB por tarjeta, pero el consumo real no se declara.
- VRAM de inferencia: no disponible. Como referencia, el repositorio completo ocupa 12,8 GB, pero incluye pesos EMA, estado del optimizador, estado de RNG y sampler, por lo que el peso de serving es inferior a esa cifra.
- GPU recomendadas: no disponibles. El entrenamiento usó RTX A6000; no se declaran requisitos de inferencia ni tarjetas validadas para servicio.
- Cabe en GPU de consumo: no confirmado por el autor. Por el tamano del repositorio es plausible que los pesos de serving quepan en GPU de 24 GB (por ejemplo RTX 3090 o RTX 4090), pero se trata de una estimación no verificada con la informacion disponible.
- Opciones de despliegue: el propio repositorio proporciona un camino de carga específico, `from load_model import load, observe; policy = load()`. No se declara soporte de vLLM, llama.cpp, Ollama ni TGI; estos motores están orientados a modelos de lenguaje y no cubren el formato de entrada/salida de este artefacto de robótica.
- Latencia y throughput: no disponibles.
- Requisito adicional de contexto: la variante Status-D necesita el calendario exportado del Writer y el fotograma de control correspondiente, además de `history_keyframe_index`, `current_subgoal` y las entradas causales `transition_context_*`. Es obligatorio llamar a `observe(...)` en cada fotograma observado y reiniciar entre episodios.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables ni datos de rendimiento de alternativas. El unico punto de referencia identificable es el propio modelo base π0.5, del que no se detallan parametros, contexto, licencia ni resultados.

## Limitaciones y advertencias

- Sin licencia declarada: no se especifican términos de uso, por lo que el uso comercial queda sin cobertura explícita hasta que el autor lo aclare.
- Sin evaluación de calidad: el autor advierte que la publicación intermedia no es una evaluación de calidad de la política, y que una eventual evaluación offline no establece la tasa de éxito en robot real.
- Etiquetas no verificadas por humanos: la procedencia de la revisión es agente/modelo, no verdad humana de referencia. Las ventanas no revisadas permanecen enmascaradas y la supervisión de extremos y negativos procede solo de ventanas revisadas explícitamente.
- Temporización del Writer aproximada: la temporización offline del Writer se proyecta con estimaciones gruesas de eventos y es condicionamiento de profesor, no una política de Status predicha en línea. Cualquier expectativa de despliegue con Status predicho no está respaldada por este artefacto.
- Salida de gripper sin supervisión en Shuffle: el comando de gripper de Shuffle no tiene supervisión de comando y no debe interpretarse como control de gripper aprendido. La tarea Button Order solo dispone de etiquetas verificadas limitadas de comandos de cierre.
- Requisito estricto de convención de pose: la convención registrada de pose cartesiana de efector final/herramienta debe coincidir con el controlador de recogida; no debe aplicarse un desplazamiento adicional de herramienta o brida.
- Dependencia del control frame: es necesario usar el calendario exportado del Writer junto con el fotograma de control correspondiente; un desajuste invalida el condicionamiento.
- Batch de entrenamiento muy reducido: el ajuste se hizo con batch global 4 y batch por GPU 1 sin acumulación, lo que limita la estabilidad estadística del resultado.
- Componentes enmascarados: los componentes de acción desconocidos quedan como NaN/false y se enmascaran en el condicionamiento de flujo y en la pérdida, de modo que el modelo no ha aprendido nada para esas dimensiones.
- Idiomas no declarados y alcance de dominio muy estrecho: no es un modelo de propósito general, de texto ni multimodal fuera del pipeline robotic declarado.
- Riesgo de alucinación: no evaluado ni cuantificado en la informacion disponible; en el contexto de una política de manipulación, el riesgo relevante es la ejecución de acciones incorrectas, no la generación de texto.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/fm-dev/pi05-button-order-status-d-lora-gbs4-pgb1-gpu4-r2-step11000
- Archivo de configuración de entrenamiento dentro del repositorio: `training_config.json` (ruta indicada en la model card)
- Código de carga e inferencia dentro del repositorio: `load_model.py` (funciones `load` y `observe`)

No se han encontrado enlaces relevantes adicionales en la busqueda web realizada; los resultados devueltos no guardan relacion con el modelo.
