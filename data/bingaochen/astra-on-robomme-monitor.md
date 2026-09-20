# bingaochen/Astra-on-RoboMME-Monitor

## Resumen

Astra-on-RoboMME-Monitor es un adaptador LoRA publicado por el usuario bingaochen para el modelo multimodal Qwen/Qwen3-VL-4B-Instruct. No es un modelo generativo de proposito general: es un clasificador visual binario especializado que responde exactamente `true` o `false` a la pregunta de si el subobjetivo (subgoal) actual de una tarea robotica se ha completado, a partir de observaciones visuales causales. Forma parte de la pipeline del proyecto Astra-on-RoboMME y corresponde al checkpoint V6 `checkpoint-2246`, entrenado sobre demostraciones del benchmark RoboMME.

El adaptador pesa unos 132 MB (`adapter_model.safetensors`, 132.195.448 bytes) porque solo modifica las capas lineales del modelo de lenguaje del modelo base, dejando congelados el codificador visual y el aligner. El modelo base no se distribuye en este repositorio: hay que descargarlo por separado desde Qwen/Qwen3-VL-4B-Instruct, fijando la revision `ebb281ec70b05090aa6165b016eac8ec08e71b17`.

Su relevancia es acotada pero concreta: cubre la pieza de "monitorizacion de progreso" que necesitan los sistemas VLA (vision-language-action) para saber cuando una subtarea ha terminado antes de pasar a la siguiente. El contrato de entrada es estricto (10 imagenes en un orden determinado y plantillas de texto concretas), por lo que no es sustituible por un prompt de chat generico. La licencia del adaptador es Apache 2.0 y solo declara soporte de ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre Qwen3-VL-4B-Instruct, transformer multimodal de tipo image-text-to-text |
| Parametros totales | Modelo base de 4B (segun denominacion del modelo base); adaptador de 132.195.448 bytes en safetensors, numero exacto de parametros del adaptador no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (depende del modelo base) |
| Tipos de cuantizacion | no disponible; la implementacion de inferencia de referencia usa bf16 |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador LoRA: `adapter_model.safetensors`, `adapter_config.json`, `additional_config.json`, `SHA256SUMS`) |

## Arquitectura y entrenamiento

Se trata de un adaptador LoRA de rango 16 y alpha 32 aplicado exclusivamente a las capas lineales del modelo de lenguaje de Qwen3-VL-4B-Instruct. El codificador visual y el aligner permanecen congelados durante el entrenamiento, de modo que la especializacion se produce unicamente en la parte textual del modelo, que debe interpretar las diez imagenes de entrada y el texto de la tarea, la instruccion, el subobjetivo actual y el estado de la ejecucion. Fue entrenado con 71.835 muestras de supervision de la etapa de demostracion de RoboMME, con un split retenido de 7.029 muestras de demostracion, distinto del split de validacion del benchmark usado en evaluacion en bucle cerrado. La configuracion de entrenamiento incluye learning rate 1e-4, 2 epocas, batch efectivo de 64 (8 GPUs x micro-batch de 4 x acumulacion de 2) y semilla 42; el checkpoint publicado es el paso final 2246, no seleccionado por validacion.

Las etiquetas se derivan de la lista de tareas completadas registrada para las etapas terminales; para StopCube, las etiquetas de espera (`remain static`) se derivan de eventos de aproximacion. Los limites de etapa ambiguos y las entradas visuales identicas con etiquetas contradictorias se excluyeron del entrenamiento. La innovacion principal no es arquitectonica sino de contrato de datos: la entrada se construye con ocho observaciones de camara frontal muestreadas cada tres pasos de entorno, `max(0, t-21), max(0, t-18), ..., t`, mas la observacion frontal del momento en que se emitio la instancia de comando actual y la observacion actual de la camara de muneca, en ese orden exacto. No se proporciona duracion explicita del comando, paso temporal global, lista de subobjetivos completados ni texto con desplazamiento relativo de fotogramas. La decodificacion es determinista: temperatura 0, `max_tokens=8` y `IMAGE_MAX_TOKEN_NUM=128`, con FlashAttention 2.

## Capacidades

- Clasificacion binaria de finalizacion de subobjetivo: devuelve exactamente `true` o `false`; no genera acciones de robot ni texto libre.
- Razonamiento visual causal sobre una ventana temporal de observaciones de camara frontal, comparando el estado actual con la imagen de referencia capturada al emitirse el comando.
- Integracion de dos puntos de vista: camara frontal (secuencia temporal) y camara de muneca (observacion actual).
- Manejo de semantica especifica por tarea: para la mayoria de tareas `true` significa que el subobjetivo esta completo; para StopCube, un subobjetivo de espera devuelve `true` cuando el cubo esta en una trayectoria de aproximacion, aproximadamente 16-32 pasos de entorno antes de alcanzar el objetivo.
- Interpretacion de tareas y subobjetivos expresados en lenguaje natural (en ingles) junto con las imagenes.
- Salida estrictamente parseable como booleano, adecuada para orquestacion automatizada.
- No soporta tool calling ni function calling.
- No esta disenado como agente ni para razonamiento multi-paso autonomo: es un componente de monitorizacion dentro de un bucle mayor.
- Sin capacidades declaradas de audio, video nativo, thinking mode o generacion de codigo.
- Multilingue: no, solo ingles declarado.

## Casos de uso

- Monitorizacion de progreso en pipelines VLA: el monitor se invoca tras cada paso del controlador y decide si el subobjetivo en curso ha terminado, permitiendo al planificador pasar a la siguiente subtarea sin depender de heuristicas manuales. Es adecuado porque su salida booleana estricta se integra directamente en la logica de control.
- Deteccion de fallos y disparo de recuperacion: si el monitor devuelve `false` durante mas pasos de los esperados, la pipeline puede reiniciar el subobjetivo o re-planificar; se apoya en la comparacion causal entre la imagen de referencia del comando y las observaciones recientes.
- Temporizacion de interceptacion en StopCube: la semantica especial de espera permite detectar el momento de aproximacion del cubo entre 16 y 32 pasos antes del objetivo, que es informacion util para un controlador posterior encargado de pulsar el boton.
- Segmentacion y etiquetado de demostraciones grabadas: al aplicarse sobre trayectorias H5 de RoboMME, permite marcar fotogramas de finalizacion de etapa y generar etiquetas de supervision para entrenar otros componentes del sistema.
- Evaluacion en bucle cerrado de politicas: el repositorio de codigo proporciona un runner para reproducir la evaluacion sobre el split de test oficial, de modo que el monitor actua como juez de progreso dentro del simulador (el exito final lo determina el simulador, no el monitor).
- Filtrado de datos de entrenamiento: descartando demostraciones cuyas etapas no se detectan correctamente, se pueden limpiar conjuntos antes de reentrenar modelos de accion.
- Control de seguridad en entornos de laboratorio: la confirmacion explicita de finalizacion de subobjetivo puede usarse como condicion previa para habilitar el siguiente movimiento en un brazo robotico.
- Investigacion en monitorizacion de progreso: sirve como referencia reproducible para comparar metodos de deteccion de finalizacion de subtareas basados en vision frente a metodos basados en estado privilegiado del simulador.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que los resultados finales del benchmark no se reportan y que la evaluacion en bucle cerrado debe reproducirse con el repositorio de codigo y credenciales propias de la API de GPT. Los unicos datos verificables aportados son de tipo cualitativo y de validacion interna:

| Comprobacion | Resultado |
|---|---|
| Tests de CPU de la pipeline portable | 48 tests superados (incluyen comprobaciones de entrada causal y de flujo de control) |
| Verificacion de hashes del adaptador | Descargado del backup de entrenamiento completado y hashes verificados |
| Instalacion limpia en Linux con GPU | No realizada todavia |
| Inferencia extremo a extremo desde la copia alojada | No realizada todavia |
| Comparacion byte a byte del snapshot historico de GCP con la revision fijada del modelo base | No realizada |

## Requisitos de hardware

- VRAM estimada: el modelo base de 4B en bf16 ocupa aproximadamente 8-9 GB solo en pesos; hay que anadir activaciones y cache, con diez imagenes por peticion limitadas a 128 tokens de imagen cada una (`IMAGE_MAX_TOKEN_NUM=128`), por lo que una GPU de 16-24 GB es un punto de partida razonable. No hay cifras oficiales publicadas.
- GPU recomendadas: cualquier GPU CUDA compatible con FlashAttention; el stack de referencia (PyTorch 2.9.1, Transformers 4.57.3, MS-Swift 3.11.1, PEFT 0.18.1, FlashAttention 2.8.3) se ejecuto en un entorno con GPU CUDA. Una RTX 4090 de 24 GB deberia bastar para bf16, aunque no esta verificado por el autor en una instalacion limpia.
- Cabe en GPU de consumo: probablemente si, en tarjetas de 24 GB o superiores con soporte de FlashAttention; no confirmado en la documentacion disponible.
- Opciones de despliegue: la unica ruta validada es MS-Swift `PtEngine` con PEFT y FlashAttention 2, cargando simultaneamente el adaptador y el modelo base. No hay soporte declarado para llama.cpp, Ollama, TGI ni vLLM, ni pesos GGUF publicados.
- Latencia y throughput: no disponibles. La decodificacion esta fijada a temperatura 0 y `max_tokens=8`, por lo que el coste de generacion es minimo y el cuello de botella esta en el preprocesado de las diez imagenes.
- Advertencia de entorno: el autor recomienda mantener este entorno separado del entorno JAX/VLA y advierte de que un prompt de chat generico o la pipeline por defecto de Transformers no son sustitutos validados del contrato de entrada y decodificacion.

## Comparativa con modelos similares

No se dispone de informacion sobre alternativas comparables en la documentacion proporcionada. Como referencia, la unica comparacion posible es con el modelo base sobre el que se aplica el adaptador:

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Astra-on-RoboMME-Monitor | Adaptador de 132.195.448 bytes sobre base de 4B | no disponible | Sin resultados de benchmark publicados; 48 tests de CPU superados | apache-2.0 | HuggingFace, requiere descargar el modelo base aparte |
| Qwen/Qwen3-VL-4B-Instruct | 4B | no disponible en la informacion proporcionada | No aplica como monitor especializado; es un modelo generalista | no disponible en la informacion proporcionada | HuggingFace, revision recomendada `ebb281ec70b05090aa6165b016eac8ec08e71b17` |

## Limitaciones y advertencias

- El monitor esta especializado en la geometria de camaras registrada en RoboMME; la propia model card advierte que no es portable a otras configuraciones de sensores sin reentrenamiento.
- No genera acciones de robot: cualquier uso como politica de control es incorrecto por diseno.
- El contrato de entrada es estricto (orden exacto de diez imagenes y plantillas de texto de `examples/champ/input_contract.py`); usar prompts genericos invalida los resultados.
- La salida debe parsearse estrictamente como booleano; no hay garantia de comportamiento fuera del contrato de decodificacion (temperatura 0, `max_tokens=8`).
- Semantica especial de StopCube: `true` en subobjetivos de espera significa aproximacion inminente, no finalizacion; malinterpretarlo puede producir errores de temporizacion.
- El monitor no cuenta pases ni decide cuando pulsar; esas funciones corresponden a otros componentes.
- No se incluye en la entrada duracion del comando, paso temporal global ni lista de subobjetivos completados, lo que limita su contexto de decision.
- Las etapas ambiguas y las entradas visuales identicas con etiquetas contradictorias se excluyeron del entrenamiento, lo que puede generar puntos ciegos en esos casos limite.
- El checkpoint publicado es el paso final 2246 y no fue seleccionado por validacion, por lo que puede no ser el mejor punto de la curva de entrenamiento.
- No hay resultados de benchmark publicados; el exito en la tarea lo determina el simulador, nunca la salida booleana del modelo.
- No se ha ejecutado una instalacion limpia en Linux con GPU ni una inferencia extremo a extremo desde esta copia alojada.
- El snapshot historico del modelo base en GCP no se ha comparado byte a byte con la revision fijada, lo que introduce riesgo de reproducibilidad.
- La regeneracion del conjunto de datos desde H5 bruto a V6 no esta completamente empaquetada, lo que dificulta reproducir el entrenamiento desde cero.
- Riesgo de alucinacion visual: al ser un clasificador basado en imagenes, puede producir falsos positivos o negativos ante oclusiones, iluminacion adversa o cambios de escena no vistos en entrenamiento.
- Idiomas: solo ingles declarado; las instrucciones de tarea en otros idiomas no estan soportadas oficialmente.
- Licencia: el adaptador es apache-2.0, pero el uso comercial implica tambien respetar la licencia del modelo base Qwen/Qwen3-VL-4B-Instruct, que no se detalla en la informacion proporcionada.
- Sesgos conocidos: no se documentan sesgos especificos en la informacion disponible.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/bingaochen/Astra-on-RoboMME-Monitor
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-4B-Instruct
- Repositorio de codigo Astra-on-RoboMME: https://github.com/bingaochen/Astra-on-RoboMME
- Contrato de entrada de referencia: `examples/champ/input_contract.py` del repositorio anterior
- Manifiesto de pesos para evaluacion congelada: `examples/champ/weights.json` del repositorio anterior
- Resultados de la busqueda web: no se han encontrado enlaces relevantes al modelo; los resultados devueltos corresponden a foros de hockey sobre hielo y no guardan relacion con la ficha.
