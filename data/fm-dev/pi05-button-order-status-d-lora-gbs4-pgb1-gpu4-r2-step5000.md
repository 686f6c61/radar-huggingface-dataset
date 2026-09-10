# fm-dev/pi05-button-order-status-d-lora-gbs4-pgb1-gpu4-r2-step5000

## Resumen

pi05-button-order-status-d-lora-gbs4-pgb1-gpu4-r2-step5000 es un punto de control de ajuste fino con LoRA sobre π0.5, una política visomotora del tipo vision-language-action, para la tarea de manipulación button_order sobre un brazo Franka. Lo publica el usuario fm-dev dentro de un segundo ciclo de experimentos (r2) que el autor mantiene separado del experimento original de 6.250 pasos.

El checkpoint corresponde a 5.000 actualizaciones del optimizador, equivalentes a 20.000 exposiciones de muestras, de un objetivo de 12.500 actualizaciones y 50.000 exposiciones. El entrenamiento se ejecutó localmente en 4 GPU RTX A6000, con batch global 4 y batch por GPU 1, sin acumulación de gradiente; el rango LoRA es 32, el optimizador AdamW y la semilla 42. El repositorio ocupa 12,8 GB e incluye pesos EMA para serving, activos de normalización e historial, código de inferencia, versiones exactas de dependencias y el estado completo de reanudación (optimizador, RNG y sampler).

Se trata de un artefacto de investigación robótica y no de un modelo de lenguaje general. La propia model card advierte de que la publicación intermedia no constituye una evaluación de la calidad de la política y de que una evaluación offline, si se incluye, no establece una tasa de éxito en robot real. El repositorio no declara licencia ni idiomas, y acumula 0 descargas y 0 likes.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible; el autor indica que es un ajuste fino con LoRA (rango 32) sobre π0.5, una política visomotora |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no se describe una arquitectura MoE) |
| Longitud de contexto | no disponible en tokens de lenguaje; en la práctica maneja una ventana de historia visual de 32 fotogramas (528 tokens visuales) más un contexto de Status de 48 pasos |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible; no aplica como modelo de lenguaje, ya que la salida son acciones robóticas |
| Licencia | no disponible |
| Formato de pesos | no disponible; el repositorio incluye pesos EMA de serving, activos de normalización e historial, código de inferencia y estado de reanudación |
| Pipeline declarado | robotics |
| Tarea objetivo | button_order sobre brazo Franka |
| Forma de salida | (20, 8): xyz absoluto, cuaternión XYZW unitario en la carta positive-qx y comando de gripper en [0, 1] |
| Checkpoint | 5.000 actualizaciones (20.000 exposiciones de muestras) |
| Tamaño del repositorio | 12,8 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El artefacto es un ajuste fino de segundo ciclo sobre π0.5 mediante LoRA de rango 32, con AdamW y semilla 42. El entrenamiento usa batch global 4 y batch por GPU 1 en 4 RTX A6000, sin acumulación de gradiente, y aplica un warmup de 250 actualizaciones hasta 5e-5 con decaimiento coseno hasta 5e-6 en el paso 12.500. El promedio exponencial de pesos emplea un factor 0,999^4 = 0,996005996001. Los checkpoints se guardan cada 1.000 actualizaciones y en el paso final 12.500; los ajustes completos están en training_config.json.

El condicionamiento Status-D construye la entrada con 32 fotogramas muestreados uniformemente sobre el prefijo completo del episodio [0, t], más un fotograma clave de Writer que puede ser nulo (528 tokens visuales en total) y un subobjetivo actual retenido del Writer. El Writer se inicializa al comenzar la ejecución y se actualiza en los eventos de Status; su temporización offline se proyecta con estimaciones gruesas de eventos, de modo que se trata de condicionamiento de profesor y no de una afirmación de despliegue online con Status predicho. Los positivos de intervalo de Status usan corchetes de eventos respaldados, y la supervisión de extremos y negativos procede únicamente de ventanas revisadas explícitamente; las etiquetas no revisadas permanecen enmascaradas. La procedencia de la revisión es revisión por agente/modelo, no verdad de referencia humana. El contexto de Status de 48 pasos usa comandos de pose registrados y estado medido, con la característica command-gripper desactivada de forma coherente en entrenamiento e inferencia, sin inventar ningún comando de gripper ausente, y con los embeddings de estado histórico desactivados.

Solo las filas de ejecución del robot supervisan las acciones. Las imágenes de demostración, características y coordenadas originales de episodio/fotograma permanecen disponibles como historial, y el inicio de la ejecución no reinicia el historial visual. Las particiones de episodios y la normalización usan únicamente el split de entrenamiento. La convención registrada de pose cartesiana del efector final o herramienta debe coincidir con el controlador de recogida; no debe aplicarse un desplazamiento adicional de herramienta o brida. El estado y las acciones numéricas usan normalización por desviación típica (STD), mientras que los tokens de estado emplean una vista acotada train-q01/q99. Las componentes de acción desconocidas permanecen como NaN/false en el conjunto de entrenamiento y se enmascaran tanto en el condicionamiento de flujo como en la pérdida.

## Capacidades

- Generación de acciones de manipulación: produce trayectorias de 20 pasos con 8 componentes cada uno (xyz absoluto, cuaternión XYZW unitario en la carta positive-qx y comando de gripper normalizado en [0, 1]).
- Condicionamiento por subobjetivo: recibe un subobjetivo actual mantenido por el Writer, además del historial visual y del estado.
- Señal de transición de estado: la inferencia devuelve transition_status a partir de un contexto de Status de 48 pasos construido con comandos de pose registrados y estado medido.
- Memoria visual episódica: la API observe(policy, base_rgb, state) debe invocarse en cada fotograma observado, incluidas las demostraciones, y el historial solo se reinicia entre episodios, no al comenzar la ejecución.
- Entrada multimodal limitada a visión y estado: consume imágenes (base_rgb) y vectores de estado; no se documentan entradas de lenguaje, audio ni texto.
- Entradas explícitas adicionales de Status-D: requiere history_keyframe_index (un fotograma observado o None), current_subgoal e inputs causales transition_context_* en policy.infer(...).
- Tool calling o function calling: no disponible; no se documenta.
- Comportamiento agéntico multi-paso: no disponible; solo se describe el bucle de observación e inferencia.
- Capacidades multilingües: no disponible; no aplica.
- Modo de razonamiento explícito (thinking), visión generalista, audio o generación de texto: no disponibles; no se documentan.

## Casos de uso

- Reanudación y prolongación del entrenamiento: el repositorio incluye el estado completo de reanudación (optimizador, RNG, sampler y pesos no EMA), de modo que un equipo puede continuar desde las 5.000 actualizaciones hasta las 12.500 previstas, es decir, de 20.000 a 50.000 exposiciones de muestras, sin reiniciar el ciclo de ajuste.
- Ajuste fino específico de tarea sobre π0.5: sirve como plantilla reproducible para aplicar LoRA de rango 32 a una política visomotora en una tarea concreta de manipulación (button_order) sobre Franka, con hiperparámetros documentados (AdamW, warmup de 250 pasos, decaimiento coseno de 5e-5 a 5e-6, semilla 42, EMA 0,996005996001).
- Evaluación de condicionamiento por estatus: permite estudiar si la señal transition_status y el subobjetivo retenido del Writer mejoran la segmentación de la tarea en un bucle de control, etiquetando siempre los resultados como evaluación offline y no como tasa de éxito en robot real.
- Ablación de supervisión parcial: el diseño enmascara en la pérdida las componentes desconocidas (NaN/false) y solo supervisa acciones en filas de ejecución del robot, lo que lo hace útil para comparar esquemas de enmascaramiento frente a alternativas con supervisión densa.
- Comparación de rondas experimentales: al mantenerse separado del experimento original de 6.250 pasos, permite contrastar el efecto del segundo ciclo de ajuste (r2) y del número de exposiciones sobre la misma tarea y el mismo robot.
- Integración en un pipeline de inferencia personalizado: el bundle aporta código de inferencia, versiones exactas de dependencias y activos de normalización e historial, lo que facilita reproducir el entorno y desplegar la política en un banco de pruebas que respete la convención de pose del controlador de recogida.
- Estudio de calibración del canal de gripper: dado que la tarea Button Order solo dispone de etiquetas verificadas limitadas de comando cerrado y que la salida de gripper de Shuffle no tiene supervisión de comando, puede emplearse para medir la incertidumbre real de ese canal, sin interpretarlo en ningún caso como control aprendido de gripper.
- Formación y docencia en robótica: constituye un ejemplo documentado de artefacto de ajuste fino que incluye estado de reanudación completo y advertencias explícitas sobre los límites de validez de su evaluación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

La model card no incluye métricas de éxito ni comparaciones cuantitativas, y señala de forma explícita que la publicación intermedia no es una evaluación de la calidad de la política y que una eventual evaluación offline no establece una tasa de éxito en robot real. El único dato de progreso disponible es de entrenamiento: 5.000 actualizaciones completadas, equivalentes a 20.000 exposiciones de muestras sobre un objetivo de 12.500 actualizaciones y 50.000 exposiciones.

## Requisitos de hardware

- Entrenamiento documentado: 4 GPU RTX A6000, batch global 4, batch por GPU 1 y sin acumulación de gradiente.
- VRAM de inferencia: no disponible. El tamaño del repositorio (12,8 GB) incluye pesos EMA, activos de normalización e historial y estado de reanudación completo, por lo que no equivale a la huella de memoria necesaria para servir el modelo.
- GPU recomendadas: no disponible; el único dato aportado es que el ajuste fino se realizó en 4 RTX A6000.
- Compatibilidad con GPU de consumo: no disponible; no se indica ningún requisito de memoria que permita determinarla.
- Opciones de despliegue: el autor proporciona su propio cargador (from load_model import load, observe; policy = load()). No se mencionan vLLM, llama.cpp, Ollama ni TGI, y no se documenta ningún formato de pesos alternativo.
- Latencia y throughput: no disponibles.
- Precisión numérica y cuantización: no disponibles; el repositorio se distribuye con pesos EMA de serving sin especificar cuantizaciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| pi05-button-order-status-d-lora-gbs4-pgb1-gpu4-r2-step5000 | no disponible | ventana de 32 fotogramas (528 tokens visuales) más Status de 48 pasos | sin benchmarks publicados | no disponible | HuggingFace, 0 descargas, 0 likes |
| π0.5 (modelo base) | no disponible | no disponible | no disponible | no disponible | referenciado en la model card; no se proporciona enlace |
| Experimento original del autor a 6.250 pasos (r1) | no disponible | no disponible | no disponible | no disponible | mencionado en la model card; no se proporciona enlace |
| Otras variantes del autor (por ejemplo, la tarea Shuffle) | no disponible | no disponible | no disponible | no disponible | mencionadas en la model card; no se proporcionan enlaces |

No se dispone de datos de modelos comparables externos en la información proporcionada.

## Limitaciones y advertencias

- Licencia no disponible: no puede confirmarse la legalidad de un uso comercial ni las condiciones de redistribución.
- No es un modelo de lenguaje general: es una política robótica específica para la tarea button_order sobre un brazo Franka, sin capacidades documentadas de generación de texto, diálogo ni tool calling.
- Sin benchmarks publicados ni evaluación de éxito en robot real: la model card afirma que la publicación intermedia no es una evaluación de la calidad de la política y que la evaluación offline no establece una tasa de éxito real.
- Supervisión parcial y enmascarada: las etiquetas no revisadas permanecen enmascaradas y la supervisión de extremos y negativos proviene solo de ventanas revisadas explícitamente.
- Procedencia de las etiquetas: la revisión es de agente/modelo, no verdad de referencia humana, lo que limita la confianza en las anotaciones de Status.
- Temporización del Writer: se proyecta offline con estimaciones gruesas de eventos y es condicionamiento de profesor; no debe interpretarse como despliegue online con Status predicho.
- Canal de gripper poco supervisado: la tarea Button Order solo tiene etiquetas verificadas limitadas de comando cerrado, y la salida de gripper de Shuffle carece por completo de supervisión de comando, por lo que no debe interpretarse como control aprendido.
- Convención de pose crítica: la pose cartesiana registrada del efector final o herramienta debe coincidir con el controlador de recogida; aplicar un desplazamiento adicional de herramienta o brida invalida la inferencia.
- Características desactivadas: la característica command-gripper está desactivada tanto en entrenamiento como en inferencia, y los embeddings de estado histórico están desactivados; no se inventa ningún comando de gripper ausente.
- Riesgo de alucinación en el sentido habitual: no aplica de forma directa al no generar lenguaje, pero existe riesgo de acciones no válidas o mal calibradas fuera de la distribución de entrenamiento.
- Idiomas y contexto de lenguaje: no disponibles; el modelo no procesa texto.
- Sin validación comunitaria: 0 descargas y 0 likes en el momento de la consulta.
- Repositorio con estado de reanudación: incluye pesos no EMA y estado de optimizador, RNG y sampler, que no deben confundirse con los pesos de serving.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/fm-dev/pi05-button-order-status-d-lora-gbs4-pgb1-gpu4-r2-step5000
- No se han encontrado enlaces relevantes en la búsqueda web: los resultados devueltos correspondían a directorios de emisoras de radio en francés, sin relación alguna con el modelo.
- No se proporcionan enlaces a papers, blogs, repositorios de código ni demos, ni referencias directas al modelo base π0.5 o a la tarea Franka utilizada.
