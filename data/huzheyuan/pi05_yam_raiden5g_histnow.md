# huzheyuan/pi05_yam_raiden5g_histnow

## Resumen

`huzheyuan/pi05_yam_raiden5g_histnow` es un conjunto de checkpoints de robotica de tipo vision-language-action (VLA) derivados de `physical-intelligence/pi05_base`. Implementa la politica de flow-matching pi0.5 aumentada con un modulo de condicionamiento por historial de acciones (`Pi0History` / `Pi0HistoryRTC`), y esta ajustada para el brazo bimanual YAM de la Universidad de Washington operando a 30 Hz en tareas de doblado de prendas de vestir.

El modelo se entrena mediante LoRA sobre el VLM de 2B y un ajuste fino completo del experto de accion de 300M, partiendo de `pi05_base`. En inferencia ocupa aproximadamente 3.300 millones de parametros en bf16. Predice los proximos 30 comandos de accion (1,0 s a 30 Hz) condicionado por los 60 comandos anteriores (2,0 s de historial), el estado actual de 14 dimensiones y tres camaras de 224x224.

Es relevante porque documenta un contrato de despliegue muy concreto (horizontes, padding, convenciones de estado y accion, ventanas temporales) para despliegue en tiempo real con planificacion por chunks (RTC). El repositorio pesa 33,9 GB e incluye varias variantes de configuracion (adversarial/baseline, con y sin RTC, 5 y 10 epocas). No tiene descargas ni likes y no declara licencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA con politica de flow-matching pi0.5 (`Pi0History` / `Pi0HistoryRTC`): VLM con LoRA + experto de accion + modulo de condicionamiento por historial de acciones |
| Parametros totales | Aproximadamente 3.300 millones en bf16 en inferencia (VLM de 2B con LoRA + experto de accion de 300M) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica en el sentido de contexto textual; ventana de accion: 30 acciones futuras (1,0 s) y 60 acciones de historial (2,0 s) a 30 Hz |
| Tipos de cuantizacion | No disponible; la model card solo menciona bf16 para inferencia |
| Idiomas soportados | No disponible; el modelo recibe cadenas de sub-tarea (`prompt`) en el idioma de entrenamiento, no declarado |
| Licencia | No disponible en la informacion proporcionada |
| Formato de pesos | No disponible explicitamente; el repositorio usa la estructura `<config>/<exp>/<step>/{params,assets}` del ecosistema openpi |
| Modelo base | physical-intelligence/pi05_base |
| Tamano del repositorio | 33,9 GB |
| Espacio de acciones | 14 dimensiones: `[left joints x6, left gripper, right joints x6, right gripper]` |
| Espacio de estado | 14 dimensiones, mismo orden que la accion |
| Entradas visuales | Tres camaras de 224x224 RGB uint8 (`observation.images.{top,left_wrist,right_wrist}`) |

## Arquitectura y entrenamiento

La arquitectura combina un modelo vision-language (VLM) de 2B parametros con un experto de accion de 300M. El VLM se adapta mediante LoRA y el experto de accion se ajusta de forma completa, partiendo en ambos casos de `pi05_base`. La politica generativa es de tipo flow-matching (pi0.5), a la que se anyade un modulo de historial de acciones (`Pi0History` / `Pi0HistoryRTC`) que condiciona la prediccion en los 60 comandos previos.

El entrenamiento usa los 13 repositorios LeRobot `huzheyuan/raiden_five_garments_*` convertidos a 30 Hz. Los conjuntos se dividen en rondas adversariales (5 repositorios) y rondas baseline (8 repositorios), con 12.000 pasos (5 epocas) para la mayoria de configuraciones y 24.000 pasos (10 epocas) para las variantes `_10ep`. Internamente las articulaciones se entrenan de forma relativa al estado actual (`DeltaActions(mask 6,-1,6,-1)`) y las pinzas de forma absoluta, pero el servidor reconvierte a acciones absolutas en el espacio del robot; el cliente nunca ve deltas. El historial se codifica relativo al estado actual (`HistoryRelativeToNow(source="action")`), con relleno de ceros y `is_pad=True` durante los primeros 2 s de cada episodio. Las variantes RTC incorporan planificacion por chunks con un prefijo comprometido acotado (`rtc_max_delay=8`, menos de 267 ms).

## Capacidades

- Generacion de acciones robotizadas bimanuales: predice los proximos 30 comandos de 14 dimensiones (articulaciones y pinzas) a partir de observaciones visuales, estado y prompt de sub-tarea.
- Condicionamiento por historial: utiliza las 60 acciones comandadas mas recientes para mantener coherencia temporal.
- Ejecucion por chunks con RTC opcional: variantes con planificacion por chunks y reanudacion sin transiciones bruscas.
- Control reactivo a 30 Hz con intervalos de replanificacion de 15 pasos (500 ms) en las configuraciones RTC.
- Percepcion multimodal: tres camaras simultaneas (`top`, `left_wrist`, `right_wrist`) a 224x224.
- Seguimiento de instrucciones por sub-tarea: el cliente envia una cadena de sub-tarea como `prompt` y reinicia el estado al cambiar de sub-tarea.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes multi-paso: no disponible como tal; la orquestacion por sub-tareas se gestiona en el cliente.
- Capacidades multilingues: no disponibles.
- Capacidades especiales: modo de pensamiento, vision o audio general: no disponibles (modelo especifico de robotica).

## Casos de uso

- Doblado de prendas con robot bimanual: el modelo esta ajustado especificamente para la tarea de plegado (`garment-folding`) con el YAM a 30 Hz, usando las tres camaras para percibir la prenda y emitir trayectorias de ambos brazos.
- Manipulacion bimanual coordinada: la representacion de 14 dimensiones cubre las dos extremidades y ambas pinzas, lo que permite tareas que requieren coordinacion entre brazos.
- Control en tiempo real con RTC: las variantes `_rtc` permiten ejecutar chunks de 30 acciones con un prefijo comprometido de menos de 267 ms, adecuado para entornos donde el robot no puede detenerse.
- Aprendizaje por imitacion a partir de demostraciones LeRobot: los checkpoints se entrenan directamente sobre repositorios LeRobot convertidos, de modo que sirven como referencia para reproducir el pipeline de entrenamiento en nuevos conjuntos de datos.
- Investigacion en politicas VLA con historial: el modulo `Pi0History` permite estudiar el efecto del historial de acciones en la estabilidad de politicas de flow-matching.
- Despliegue cliente-servidor: el servidor (`serve_policy.py`) expone la politica por websocket y un cliente ligero en Python puro (numpy, msgpack, websockets) puede ejecutarse en una maquina sin GPU, util para integrar el modelo en una celda robotica donde el control corre en otra maquina.
- Comparacion baseline vs adversarial: las configuraciones `baseline` y `adv` permiten analizar el impacto de datos adversariales en el rendimiento del plegado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: se requiere una GPU CUDA con al menos 24 GB para servir el modelo (aproximadamente 3,3B parametros en bf16, sin cuantizacion declarada).
- GPU recomendadas: no se especifican modelos concretos; la model card solo indica el requisito minimo de 24 GB de VRAM. Cualquier GPU con 24 GB o mas es suficiente segun el autor.
- GPU de consumo: no se confirma explicitamente; una GPU con 24 GB o mas (por ejemplo, gama alta de consumo) queda dentro del minimo indicado, pero no esta verificado en la informacion.
- Maquina cliente: no necesita GPU; solo requiere `packages/openpi-client` con numpy, msgpack y websockets.
- Opciones de despliegue: servidor openpi mediante `scripts/serve_policy.py` con `policy:checkpoint` y `--policy.num-steps 5`; cliente `WebsocketClientPolicy` envuelto en `RTCHistoryActionChunkBroker` (configuraciones RTC) o `HistoryActionChunkBroker` (sin RTC). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: bucle de control a 30 Hz; en las configuraciones RTC el intervalo de replanificacion es de 15 pasos (500 ms) y la latencia maxima del prefijo comprometido (`rtc_max_delay=8`) es inferior a 267 ms. No se publican cifras de throughput adicionales.
- Precalentamiento: se recomienda ejecutar `warmup_policy.py` con `--history-horizon 60` y `--rtc` antes de la inferencia en produccion.

## Comparativa con modelos similares

| Modelo | Parametros | Ventana de accion / historial | Licencia | Disponibilidad |
|---|---|---|---|---|
| `huzheyuan/pi05_yam_raiden5g_histnow` | Aproximadamente 3,3B en bf16 (VLM 2B + experto 300M) | 30 acciones futuras / 60 de historial a 30 Hz | No disponible | Publico en HuggingFace |
| `physical-intelligence/pi05_base` | No disponible en la informacion | No disponible | No disponible | Publico en HuggingFace |
| Otros VLA de robotica (por ejemplo, familias tipo pi0, GR00T, OpenVLA, RDT-1B) | No disponible en la informacion | No disponible | No disponible | No verificado en la informacion |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- El modelo esta especializado en el robot YAM a 30 Hz y en la tarea de plegado de prendas; su uso fuera de esa configuracion (otro robot, otra frecuencia, otro espacio de acciones) no esta soportado ni verificado.
- La licencia no esta declarada, por lo que no se puede confirmar si se permite uso comercial; ademas, al derivar de `pi05_base`, habria que revisar las condiciones del modelo base.
- Los idiomas soportados no estan documentados; el prompt es una cadena de sub-tarea cuyo idioma de entrenamiento se desconoce.
- El historial debe corresponder a las acciones realmente ejecutadas por el controlador, no a las planificadas; si el cliente no respeta esta convencion, la distribucion de entrada se desvia de la del entrenamiento.
- El relleno de las primeras 60 acciones con ceros y `is_pad=True` es obligatorio durante los primeros 2 s de un episodio; no respetarlo puede degradar la prediccion.
- Riesgo de alucinacion y sesgos: la model card no reporta evaluaciones de sesgo ni de robustez ante entradas fuera de distribucion.
- El repositorio tiene 33,9 GB y no declara cuantizaciones; la inferencia en bf16 exige al menos 24 GB de VRAM.
- El codigo de entrenamiento referenciado (`yam/budget-prep`) es privado y solo se comparte bajo peticion al autor, lo que limita la reproducibilidad.
- El cumplimiento del contrato de estado, accion, imagenes y prompt es critico; la propia model card advierte que las rutas de redimensionado de imagen deben reproducirse exactamente como en la conversion del dataset.
- No hay descargas ni likes registrados ni resultados de benchmarks publicos, por lo que el rendimiento real en produccion no esta validado de forma independiente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/huzheyuan/pi05_yam_raiden5g_histnow
- Modelo base: https://huggingface.co/physical-intelligence/pi05_base
- Checkpoints publicos citados en la model card: https://huggingface.co/huzheyuan/pi05_yam_raiden5g_histnow
- Repositorios de datos LeRobot: `huzheyuan/raiden_five_garments_*` (13 repositorios, fps 30, tres camaras de 224x224, estado y accion de 14 dimensiones)
- Codigo de entrenamiento y despliegue: repositorio openpi (rama `yam/budget-prep`, privada; acceso bajo peticion al autor segun la model card)
- Cliente ligero: `packages/openpi-client` (numpy, msgpack, websockets)
- Script de servido: `scripts/serve_policy.py`
- Script de autotest: `examples/yam/eval/raiden_selftest.py`
- Script de precalentamiento: `examples/yam/online/warmup_policy.py`
