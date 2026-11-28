# qixunxiehuangbao/pi05_soarm_v4

## Resumen

Pi0.5 — SO-101 soarm_v4 es un adaptador LoRA entrenado sobre el modelo base `lerobot/pi05_base`, un modelo de politica visuomotora (vision-language-action, VLA) orientado al control de robots manipuladores. Lo publica el usuario `qixunxiehuangbao` y esta pensado para una tarea concreta de manipulacion: introducir un tubo de ensayo en una caja con un brazo SO-101. No es un modelo de lenguaje generalista, sino un checkpoint de politica que traduce observaciones visuales y estado de las articulaciones en comandos de accion.

El adaptador se entrena durante 40.000 pasos sobre 100 demostraciones (39.280 fotogramas a 30 FPS) y se distribuye como conjunto de pesos PEFT/LoRA, estadisticas de normalizacion, pipelines de preprocesado y postprocesado y activos del tokenizer. No contiene los pesos completos del modelo base: requiere cargar `lerobot/pi05_base` con el soporte PEFT de LeRobot.

Es relevante para quien experimenta con politicas VLA de codigo abierto en robots de bajo coste como el SO-101, porque demuestra el flujo completo de ajuste fino por LoRA sobre un modelo base grande y su integracion en el ecosistema LeRobot. El repositorio aparece vacio (0,0 GB) y sin descargas ni valoraciones en el momento de la consulta, por lo que debe tratarse como un artefacto experimental.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Politica visuomotora VLA Pi0.5 (modelo base `lerobot/pi05_base`), ajuste fino por LoRA (PEFT) |
| Parametros totales | no disponible (el repositorio solo contiene el adaptador LoRA, no los pesos completos) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; el adaptador se entrena y ejecuta en BF16 |
| Idiomas soportados | no disponible (modelo de robotica, no orientado a texto) |
| Licencia | no disponible (el modelo base y los activos PaliGemma quedan sujetos a sus licencias y condiciones de acceso) |
| Formato de pesos | safetensors (adaptador LoRA; libreria `lerobot`) |

Parametros adicionales del contrato de inferencia:

| Parametro | Valor |
|---|---|
| Rango LoRA | 16 |
| Alpha LoRA | 32 |
| Precisión | BF16 |
| Tamano de lote en entrenamiento | 1 |
| Pasos de entrenamiento | 40.000 |
| Demostraciones | 100 (39.280 fotogramas a 30 FPS) |
| Canales de estado/accion | 6 (shoulder_pan, shoulder_lift, elbow_flex, wrist_flex, wrist_roll, gripper) |
| Unidades | angulos articulares en grados; pinza en rango 0–100 |
| Entradas visuales | `observation.images.front` y `observation.images.wrist`, RGB 848 x 480, redimensionadas a 224 x 224 |
| Acciones | absolutas, chunks de 50 pasos a 30 Hz |
| Pasos de denoising en inferencia | 10 |
| Version verificada | LeRobot 0.7.1 |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Pi0.5, una politica visuomotora que combina un backbone de vision-lenguaje (los activos PaliGemma que menciona la model card) con un cabezal de generacion de acciones por difusion o flujo, segun el diseno de la familia Pi. En este repositorio no se reentrena el modelo completo: se aplica un adaptador LoRA de rango 16 y alpha 32 sobre `lerobot/pi05_base`, manteniendo congelados los pesos base.

El entrenamiento usa 100 demostraciones de la tarea "Grab the test tube into the box" con un brazo SO-101, equivalentes a 39.280 fotogramas a 30 FPS, con tamano de lote 1 durante 40.000 pasos. La normalizacion de estado y accion se hace por cuantiles, y el repositorio incluye los procesadores y estadisticas necesarios. Las acciones se representan en chunks absolutos de 50 pasos y la inferencia emplea 10 pasos de denoising. No se detalla en la informacion disponible la composicion del dataset, el uso de RLHF/DPO ni innovaciones adicionales de decodificacion.

## Capacidades

- Control visuomotor de un brazo SO-101 de seis grados de libertad para la tarea de introducir un tubo de ensayo en una caja.
- Fusion de dos camaras (frontal y de muneca) con el estado articular para producir acciones absolutas.
- Generacion de secuencias de accion en chunks de 50 pasos a 30 Hz, con 10 pasos de denoising por inferencia.
- Ajuste fino eficiente mediante LoRA sobre un modelo base VLA, sin duplicar los pesos completos.
- Integracion con el ecosistema LeRobot, incluidos los pipelines de preprocesado y postprocesado y las estadisticas de normalizacion.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, vision general, audio ni thinking mode; es una politica de robotica, no un asistente conversacional.

## Casos de uso

- Investigacion en manipulacion robotica de bajo coste: usar el adaptador como punto de partida para reproducir la tarea de recogida e insercion con un SO-101 y comparar variantes de ajuste fino.
- Ajuste fino por LoRA sobre Pi0.5: servir de plantilla para entrenar nuevas tareas sobre `lerobot/pi05_base` sin reentrenar el modelo completo, reutilizando el contrato de inferencia documentado.
- Evaluacion de pipelines LeRobot: validar la carga PEFT, el preprocesado de imagenes a 224 x 224 y la normalizacion por cuantiles en un entorno controlado.
- Docencia y demostraciones de VLA: ilustrar el flujo completo desde demostraciones teleoperadas hasta un checkpoint desplegable en un robot real.
- Pruebas de integracion en laboratorio: ejecutar smoke tests remotos que verifiquen la forma de salida (chunks de 50 x 6) antes de desplegar en hardware.
- Base para experimentos de generalizacion: comparar el rendimiento con 100 demostraciones frente a conjuntos mayores o a otras tareas del mismo brazo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que las pruebas de humo remotas devolvieron chunks de accion finitos de 50 x 6, pero que las tasas de exito de la tarea en el robot no se han medido de forma sistematica.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; depende del modelo base `lerobot/pi05_base`, cuyos pesos completos no se detallan en la informacion proporcionada.
- GPU recomendadas: no disponible. El adaptador se ejecuta en BF16, lo que exige GPUs con soporte de bfloat16 (por ejemplo, familias Ampere o posteriores), pero no se especifican modelos concretos.
- Compatibilidad con GPU de consumo: no confirmada. Al tratarse de un adaptador sobre un VLA con backbone de vision-lenguaje, es probable que requiera mas VRAM que un modelo pequeno, pero no hay datos para afirmarlo.
- Opciones de despliegue: LeRobot 0.7.1 con carga PEFT sobre `lerobot/pi05_base`. No se documentan vLLM, llama.cpp, Ollama ni TGI, que no son adecuados para este tipo de politica.
- Latencia y throughput: no disponibles. Solo se conoce la frecuencia de control de 30 Hz y los 10 pasos de denoising por inferencia.

## Comparativa con modelos similares

No se dispone de datos de rendimiento ni de especificaciones completas de este adaptador, por lo que la comparacion cuantitativa no es posible. A continuacion se comparan caracteristicas estructurales con alternativas de la misma categoria (politicas VLA para robotica):

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Pi0.5 — SO-101 soarm_v4 (este) | Adaptador LoRA sobre Pi0.5 | no disponible (solo adaptador) | no disponible | no disponible | Hugging Face, repo de 0,0 GB |
| lerobot/pi05_base | VLA base | no disponible en la informacion | no disponible | sujeta a licencia del autor | Hugging Face |
| Otras politicas VLA de LeRobot (p. ej. familia Pi0) | VLA | no disponible | no disponible | variable | Hugging Face |

No se han encontrado en la informacion proporcionada datos de rendimiento que permitan comparar tasas de exito, latencia o precision frente a estas alternativas.

## Limitaciones y advertencias

- El repositorio no contiene los pesos completos: sin `lerobot/pi05_base` y sus activos PaliGemma el adaptador no es utilizable.
- Las tasas de exito de la tarea no se han medido de forma sistematica; solo se verifico que las salidas son chunks finitos de 50 x 6.
- Entrenado con solo 100 demostraciones de una unica tarea y un unico robot; la generalizacion a otras tareas, objetos o entornos es muy limitada.
- Requiere la calibracion del SO-101 correspondiente a la recogida de datos; una calibracion distinta invalida las acciones.
- Depende de la version de LeRobot (verificado con 0.7.1) y del orden exacto de canales de estado y accion.
- Licencia no disponible: el uso comercial queda condicionado por las licencias del modelo base y de PaliGemma, que no se detallan.
- Riesgo de alucinacion en el sentido de acciones fisicas incorrectas o inseguras; debe operarse con limites de par y paradas de emergencia.
- No hay informacion sobre sesgos, idiomas ni comportamiento fuera de la distribucion de las demostraciones.
- El repositorio figura con 0,0 GB, 0 descargas y 0 valoraciones, lo que sugiere que los artefactos pueden no estar subidos o ser incompletos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/qixunxiehuangbao/pi05_soarm_v4
- Modelo base: https://huggingface.co/lerobot/pi05_base
- LeRobot (libreria): https://github.com/huggingface/lerobot
- No se han encontrado en la informacion proporcionada papers, blogs, repositorios adicionales ni demos especificos de este adaptador.
