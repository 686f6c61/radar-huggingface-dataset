# fm-dev/pi05-button-order-uniform32-full-gbs64-pgb8-gpu8-r4-epoch100-step7100

## Resumen

pi05-button-order-uniform32-full-gbs64-pgb8-gpu8-r4-epoch100-step7100 es un checkpoint de ajuste fino completo (full fine-tuning) del modelo de robotica pi0.5, publicado por el usuario fm-dev dentro del ecosistema openpi. No es un modelo de lenguaje general: es una politica visio-lenguaje-accion (VLA) orientada al control de un brazo robotico Franka, entrenada sobre la tarea "button_order" con la variante de datos "uniform32". El repositorio es un bundle de inferencia de 12,5 GB que incluye los parametros EMA, los activos de normalizacion, el codigo fuente exacto del modelo y del runtime, las versiones de dependencias y los resultados de evaluacion.

El entrenamiento parte de los pesos EMA de inferencia del step 12500 de un modelo ya existente y aplica un ciclo adicional de 100 epochs de sampler con un optimizador AdamW, EMA y sampler reiniciados desde cero. El checkpoint publicado corresponde al step de optimizador 7100. Se entreno con batch global 64, batch por GPU 8, sobre 8 GPU NVIDIA A100-SXM4-80GB usando JAX FSDP y un decaimiento EMA de 0,99. Son entrenables el backbone, la vision de imagen actual, el action expert, los adaptadores LoRA retenidos y los modulos de historial.

Su relevancia es acotada pero clara: sirve como referencia reproducible para investigacion en manipulacion robotica y como punto de partida para continuar el ajuste fino, ya que documenta de forma inusualmente detallada la cobertura de datos, la definicion de epoch y las metricas de error offline. No se han publicado resultados de exito en robot fisico ni cifras de latencia de despliegue.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) pi0.5 sobre runtime openpi; backbone + action expert + modulos de historial |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (salida de acciones de horizonte 20 pasos) |
| Tipos de cuantizacion | no disponible (se distribuyen los parametros EMA de inferencia en su formato nativo) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | pesos JAX/Flax de openpi dentro del bundle completo (codigo, dependencias y activos incluidos); no se indica safetensors ni GGUF |
| Tamano del repositorio | 12,5 GB |
| Pipeline declarado | robotics |
| Entrada de estado | XYZ absoluto, cuaternion XYZW y gripper_open (0 cerrado, 1 abierto) |
| Salida de acciones | tensor de forma (20, 8) |
| Hardware de entrenamiento | 8 x NVIDIA A100-SXM4-80GB, JAX FSDP |

## Arquitectura y entrenamiento

El modelo es un ajuste fino completo de pi0.5, una politica VLA que combina un backbone con un action expert y modulos de historial especificos. En este checkpoint son entrenables todas las partes relevantes: backbone, vision de la imagen actual, action expert, adaptadores LoRA retenidos y modulos de historial. El estado de entrada se expresa en coordenadas absolutas XYZ, orientacion como cuaternion XYZW y un valor escalar de apertura de pinza, y la politica emite ventanas de accion de forma (20, 8). Para los modelos con memoria se instala automaticamente un codificador de historial fijo que coincide con las caracteristicas de entrenamiento cacheadas, de modo que cada frame de la camara base observado debe anadirse mediante `observe(policy, rgb, state)` y la politica debe reiniciarse entre episodios.

El entrenamiento se inicializo a partir de los pesos EMA de inferencia del step 12500 de un modelo previo, tras lo cual se reiniciaron el optimizador AdamW, el EMA y el sampler. El checkpoint publicado es el step de optimizador 7100, alcanzado tras 100 epochs de sampler adicionales sobre un schedule de learning rate original de 200 epochs que se mantiene sin cambios en este hito. Se uso batch global 64 con batch por GPU 8 sobre 8 A100-SXM4-80GB, JAX FSDP y EMA con decaimiento 0,99. La definicion de epoch se refiere al split de entrenamiento procesado completo, no a cada frame original grabado: hay 4582 ventanas de accion de entrenamiento, 648 de validacion y 358 de test. Los objetivos de accion usan ventanas de ejecucion del robot que superan comprobaciones de sincronizacion y horizonte continuo, mientras que los frames de demostracion previos permanecen como historial visual. Algunos episodios originales no tienen ninguna ventana de accion valida y el ajuste fino completo no implica que todos los frames en bruto esten supervisados; los componentes supervisados y las limitaciones de pinza por tarea se recogen en `training_config.json` y `assets/policy_metadata.json`.

## Capacidades

- Control de manipulacion robotica sobre un brazo Franka: genera secuencias de accion de horizonte 20 con posicion y orientacion.
- Imitacion de comportamiento (behavior cloning) a partir de ventanas de ejecucion del robot, con soporte de ventanas de historial visual previas.
- Percepcion visual de la camara base, con vision de imagen actual entrenable.
- Entrada multimodal de estado: XYZ absoluto, cuaternion XYZW y estado de pinza (`gripper_open`, 0 cerrado, 1 abierto).
- Memoria temporal mediante un codificador de historial fijo, con caracteristicas cacheadas que deben coincidir con las del entrenamiento.
- Ejecucion de la tarea "button_order" en su variante uniform32: la finalizacion de Pick3 exige una tercera colocacion seguida de la pulsacion del boton azul fisico.
- Soporte de la variante Status-D, que requiere ademas el subobjetivo/keyframe causal Writer y el contexto Status del runtime de despliegue.
- No se documentan capacidades de tool calling, function calling, agentes, generacion de texto general, codigo ni matematicas.
- No se documentan capacidades multilingues ni modos de pensamiento (thinking mode), audio o vision general mas alla del pipeline robotic.

## Casos de uso

- Manipulacion pick-and-place con robot Franka: la politica recibe el estado articular y la imagen de la camara base y emite ventanas de accion de 20 pasos, adecuada para tareas de recogida y colocacion repetitivas en laboratorio.
- Pulsacion de botones fisicos en secuencias de ensamblaje: la tarea Pick3 requiere una tercera colocacion seguida de la pulsacion del boton azul, por lo que el checkpoint sirve para prototipos de interaccion fisica con elementos de control.
- Investigacion en modelos VLA: permite reproducir el pipeline de openpi y estudiar el efecto del ajuste fino completo frente a alternativas con LoRA, ya que se documentan los componentes entrenables.
- Punto de partida para ajuste fino adicional: al ser un bundle de inferencia con pesos EMA y no incluir el estado del optimizador, sirve como inicializacion para nuevos ciclos de entrenamiento sobre otras tareas.
- Evaluacion offline de politicas: las metricas de error de posicion y orientacion sobre los splits de validacion y test permiten comparar variantes de datos (Baseline, Uniform32, Status-D) sin acceso a robot fisico.
- Recoleccion y curaduria de datasets roboticos: el manifiesto por episodio y la definicion de epoch basada en ventanas de accion validas sirven de referencia para disenar pipelines de sincronizacion y horizonte continuo.
- Verificacion de despliegue en CPU: el paquete se carga en CPU mediante `load_model.py`, util para pruebas de integridad antes de mover el modelo a hardware con GPU.
- Sistemas con memoria de historial visual: el codificador de historial fijo permite experimentar con politicas que dependen de frames anteriores al episodio, reiniciando el estado entre episodios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. El autor unicamente reporta errores offline de accion sobre datos retenidos:

| Split | Error L2 medio de posicion (m), H20 | Angulo medio de cuaternion (rad) |
|---|---:|---:|
| validation | 0,03575 | 0,07269 |
| test | 0,04148 | 0,06679 |

Estas cifras son errores offline sobre conjuntos retenidos, no tasas de exito en robot real. El checkpoint en la nube supero la evaluacion offline de acciones con salidas finitas de forma (20, 8), y el paquete descargado se cargo de forma independiente en CPU a traves de `load_model.py`, incluido su codificador de historial fijo. La evaluacion offline de Status-D utiliza proyecciones causales del expert-history Writer. La publicacion no establece exito fisico en la tarea ni resuelve la latencia de despliegue.

## Requisitos de hardware

- Entrenamiento original: 8 GPU NVIDIA A100-SXM4-80GB con JAX FSDP, batch global 64 y batch por GPU 8.
- Tamano del bundle de inferencia: 12,5 GB en el repositorio, incluyendo pesos, activos de normalizacion, codigo fuente, dependencias y resultados.
- VRAM para inferencia: no disponible. No se publican cifras oficiales; el autor solo confirma la carga del paquete en CPU. Como referencia, el repositorio ocupa 12,5 GB, por lo que una GPU con 24 GB o mas (por ejemplo RTX 4090 o A100) deberia ser suficiente si se sirve en precision completa, y menos si se aplica cuantizacion.
- Cabe en GPU de consumo: no confirmado por el autor. Un modelo de este tipo y tamano de bundle es plausible en una RTX 4090 de 24 GB, pero no hay validacion publicada.
- Opciones de despliegue: el propio runtime de openpi mediante `load_model.py` y `observe(policy, rgb, state)`. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que no son adecuadas para este tipo de politica robotica.
- Requisitos adicionales de despliegue: conservar el directorio `history_encoder/` completo, instalar `requirements.txt` y mantener la version exacta del codigo fuente y de las dependencias incluidas en el bundle.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se proporcionan metricas comparativas publicadas para este checkpoint. La comparacion siguiente es cualitativa y se limita a lo declarado en la model card y a la categoria del modelo; las celdas no verificadas se marcan como no disponible.

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| pi05-button-order-uniform32 (este checkpoint) | VLA pi0.5, ajuste fino completo | no disponible | no disponible | no disponible | pesos EMA de inferencia en HuggingFace, 12,5 GB |
| pi0.5 base (openpi) | VLA pi0.5 | no disponible | no disponible | no disponible | modelo base del que deriva este ajuste |
| Otras variantes de la misma familia (Baseline, Uniform32, Status-D) | VLA pi0.5, distintas composiciones de datos | no disponible | no disponible | no disponible | mencionadas en la model card como experimentos comparables |
| OpenVLA | VLA de codigo abierto | no disponible | no disponible | no disponible | no disponible en la informacion proporcionada |

## Limitaciones y advertencias

- Las metricas publicadas son errores offline de accion, no tasas de exito en robot fisico; el autor indica explicitamente que la publicacion no establece exito fisico en la tarea.
- No se resuelve ni se reporta la latencia de despliegue, un factor critico en control robotico en tiempo real.
- El ajuste fino completo no implica que todos los frames en bruto esten supervisados: algunos episodios originales no tienen ninguna ventana de accion valida.
- Los componentes de control de pinza pueden estar limitados por la tarea; los componentes marcados como no supervisados en `training_config.json` y `assets/policy_metadata.json` no deben interpretarse como control de pinza entrenado.
- El checkpoint es un bundle de inferencia: el estado completo del optimizador y del sampler permanece en almacenamiento AMLT y no se incluye, por lo que no se puede reanudar el entrenamiento tal cual.
- Es obligatorio conservar el directorio `history_encoder/` completo y usar el codigo y las dependencias exactas del bundle; desviarse de ellos puede invalidar las caracteristicas de historial cacheadas.
- La variante Status-D requiere un runtime adicional con el subobjetivo/keyframe causal Writer y el contexto Status; no funciona con el flujo de carga por defecto.
- La finalizacion de Pick3 exige una tercera colocacion seguida de la pulsacion del boton azul fisico; no se puede evaluar esta capacidad solo con metricas offline.
- La licencia no esta declarada en la informacion disponible, lo que supone un riesgo para cualquier uso comercial.
- No hay informacion sobre idiomas soportados, sesgos, robustez ante cambios de iluminacion o distribucion, ni sobre el comportamiento fuera de la tarea entrenada.
- El modelo no es un LLM de proposito general: no dispone de tool calling, generacion de codigo, matematicas ni capacidades conversacionales, y no debe usarse como tal.
- Riesgo de alucinacion: no aplica en el sentido de texto generado, pero existe riesgo de generalizacion incorrecta de la politica fuera de las condiciones de entrenamiento.

## Enlaces

- HuggingFace: https://huggingface.co/fm-dev/pi05-button-order-uniform32-full-gbs64-pgb8-gpu8-r4-epoch100-step7100
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la busqueda web realizada; los resultados devueltos no guardan relacion con el modelo y se han descartado.
