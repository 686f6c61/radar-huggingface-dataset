# happyhappy-jun/gr00t-n1.6-aloha-pick-cubes-into-cup-15hz

## Resumen

Este repositorio contiene checkpoints intermedios de un segundo ajuste fino (*fine-tune*) del modelo base `nvidia/GR00T-N1.6-3B`, un modelo de visión-lenguaje-acción (VLA) orientado a control robótico. El autor, `happyhappy-jun`, lo ha entrenado sobre una tarea concreta de manipulación con brazos ALOHA: "pick two blue cubes into the cup" (coger dos cubos azules y meterlos en un vaso). A diferencia del primer ajuste publicado por el mismo autor, esta versión se entrena sobre una regrabación a 15 Hz, es decir, tanto las cámaras como las acciones están muestreadas a 15 Hz.

El interés técnico del modelo reside en su naturaleza de política robótica de imitación: no genera texto, sino secuencias de acciones de 14 dimensiones (dos brazos más pinzas) condicionadas por observaciones visuales y el estado propioceptivo actual. El entrenamiento emplea *state dropout* de 0,5 (el token de estado se sustituye por un token de máscara en la mitad de las muestras) para reducir la dependencia excesiva de la propiocepción, y el horizonte de acción es de 16 pasos, lo que a 15 Hz equivale a 1,07 segundos de planificación. Se trata de un artefacto experimental de investigación, con 0 descargas y 0 *likes* en el momento de redactar esta ficha, y solo incluye ficheros de inferencia (sin estado de optimizador).

Es relevante ahora porque ilustra el flujo de trabajo típico de especialización de modelos fundacionales de robótica: partir de un modelo general preentrenado a gran escala, aplicar el procedimiento NEW_EMBODIMENT para adaptarlo a un nuevo cuerpo/robot y publicar los checkpoints conforme se generan. La licencia NVIDIA Open Model License permite reutilización bajo condiciones específicas, algo crítico para quien evalúe su uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo VLA (vision-language-action) heredado del base `nvidia/GR00T-N1.6-3B`; detalles de la composicion interna (backbone, cabeza de accion) no disponibles en la informacion proporcionada |
| Parametros totales | Aproximadamente 3.000 millones (segun la denominacion del modelo base `GR00T-N1.6-3B`); cifra exacta no disponible |
| Parametros activos | No aplica (no se indica que sea un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (modelo de accion robotica; no se documentan capacidades linguisticas) |
| Licencia | NVIDIA Open Model License (`nvidia-open-model-license`), etiquetada como `other` en HuggingFace |
| Formato de pesos | safetensors |
| Horizonte de accion | 16 pasos a 15 Hz = 1,07 s (`aloha_config_h16.py`) |
| Dimension del estado | 14 (dos brazos + dos pinzas ALOHA); brazos en modo RELATIVE (delta respecto al estado articular actual), pinzas ABSOLUTE |
| Frecuencia de control | 15 Hz (camaras y acciones) |
| Tamano del repositorio | 19,7 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna del modelo; solo indica que se parte de `nvidia/GR00T-N1.6-3B` y que la adaptacion se realiza mediante el procedimiento NEW_EMBODIMENT, orientado a transferir una politica preentrenada a una nueva encarnacion robotica. Dado el tamaño declarado (3B) y las etiquetas `vla` y `robotics`, se trata de un modelo de vision-lenguaje-accion, pero la composicion concreta (backbone, mecanismo de generacion de acciones, tipo de atencion) no esta disponible en la informacion proporcionada.

El ajuste fino se ejecuto sobre 4 GPU A100 con un *batch* efectivo de 64, *learning rate* de 1e-4 y un plan de 10.000 pasos, publicandose los checkpoints a medida que se generan. Los datos son 31 episodios y 8.383 fotogramas a 15 Hz, de los cuales se emplean 28 episodios para entrenamiento y se reservan los episodios 5, 15 y 25 como conjunto de validacion (listados en `heldout.json`). La innovacion tecnica destacable es el uso de *state dropout* con probabilidad 0,5 durante el entrenamiento: en la mitad de las muestras el token de estado propioceptivo se sustituye por un token de máscara aprendido, lo que fuerza al modelo a apoyarse mas en la vision. El `config.json` publicado fija `state_dropout_prob` a 0,0 para inferencia. No se documenta uso de RLHF, DPO ni fases de *reinforcement learning*.

## Capacidades

- Generacion de acciones motoras para un robot ALOHA de dos brazos, condicionadas por observaciones visuales y estado propioceptivo de 14 dimensiones.
- Ejecucion de una tarea especifica de manipulacion: coger dos cubos azules y depositarlos en un vaso.
- Planificacion de acciones con horizonte temporal de 16 pasos (1,07 s a 15 Hz), lo que permite secuencias no reactivas de corto plazo.
- Control diferencial de brazos (acciones RELATIVE respecto al estado articular actual) y control absoluto de pinzas.
- Tolerancia parcial a la ausencia de informacion propioceptiva, gracias al entrenamiento con *state dropout* de 0,5.
- No se documenta soporte de *tool calling*, *function calling*, agentes, capacidades multilingues, *thinking mode*, vision descriptiva ni audio.

## Casos de uso

- Investigacion en aprendizaje por imitacion: reproducir el *pipeline* completo de ajuste fino de un VLA sobre una tarea de manipulacion concreta, usando los checkpoints intermedios para estudiar la evolucion del aprendizaje paso a paso.
- Evaluacion de generalizacion con *heldout*: los episodios 5, 15 y 25 estan reservados explicitamente, lo que permite medir el sobreajuste a las trayectorias de entrenamiento con una particion reproducible.
- Estudio del efecto del *state dropout*: comparar este *checkpoint* (`sd0.5/`) con variantes sin *dropout* para cuantificar la dependencia de la propiocepción en politicas VLA.
- Referencia para reentrenamiento a otras frecuencias: el autor mantiene una version previa grabada a otra frecuencia, de modo que este modelo sirve como punto de comparacion para analizar el impacto de la tasa de control en la calidad de la politica.
- Prototipado en laboratorio con brazos ALOHA: desplegar la politica en un banco de pruebas fisico para tareas de *pick-and-place* con dos objetos y un contenedor.
- Base para *fine-tuning* adicional en tareas relacionadas: al ser un ajuste NEW_EMBODIMENT sobre ALOHA, puede servir de inicializacion para variantes de la misma tarea (distinto numero de cubos, distintas posiciones iniciales).
- Docencia y divulgacion: ejemplo real y reproducible de adaptacion de un modelo fundacional de robotica a un *embodiment* concreto con recursos de computo acotados (4 GPU A100).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tasas de exito, errores de seguimiento de trayectoria ni comparaciones cuantitativas con otros checkpoints.

Conviene senalar que los resultados de la busqueda web proporcionada no contienen ninguna referencia al modelo: los enlaces devueltos corresponden a un hotel en Kassel (Alemania) y no guardan relacion con el repositorio. Por tanto, no hay datos externos que permitan contrastar el rendimiento.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita en la informacion proporcionada. Como referencia orientativa basada en el tamaño declarado del modelo (3B parametros), los pesos en precision de 16 bits ocuparian del orden de 6 GB, a los que habria que sumar el codificador visual, el estado de inferencia y las activaciones.
- GPU recomendadas: no disponibles. El autor solo documenta el hardware de entrenamiento (4x A100).
- Compatibilidad con GPU de consumo: no confirmada en la informacion disponible; dependeria de la VRAM total necesaria, que no se especifica.
- Opciones de despliegue: no disponibles. El repositorio contiene unicamente ficheros de inferencia en formato safetensors (estructura `sd0.5/checkpoint-<step>/` junto con `aloha_config_h16.py`, `modality.json` y `heldout.json`); no se mencionan vLLM, llama.cpp, Ollama ni TGI, herramientas por otra parte orientadas a modelos de lenguaje y no necesariamente aplicables a una politica VLA.
- Latencia y throughput: no disponibles. El unico dato temporal es la frecuencia de control de los datos de entrenamiento (15 Hz) y el horizonte de accion de 1,07 s.
- Almacenamiento: el repositorio ocupa 19,7 GB, ya que incluye varios checkpoints intermedios.

## Comparativa con modelos similares

| Modelo | Parametros | Frecuencia de datos | Contexto / horizonte | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `happyhappy-jun/gr00t-n1.6-aloha-pick-cubes-into-cup-15hz` (este) | ~3B (heredados del base) | 15 Hz | Horizonte de accion 16 pasos = 1,07 s | NVIDIA Open Model License | Publico en HuggingFace, 0 descargas |
| `happyhappy-jun/gr00t-n1.6-aloha-pick-cubes-into-cup` | ~3B (mismo base) | No especificada en esta ficha (grabacion previa) | No disponible | NVIDIA Open Model License | Publico en HuggingFace |
| `nvidia/GR00T-N1.6-3B` | ~3B (segun denominacion) | No aplica (modelo base preentrenado) | No disponible | NVIDIA Open Model License | Publico en HuggingFace |

No se dispone de datos sobre otros modelos VLA comparables (por ejemplo, alternativas de otros fabricantes o de la comunidad) en la informacion proporcionada, por lo que no se incluyen cifras de rendimiento ni comparaciones cuantitativas.

## Limitaciones y advertencias

- Especializacion extrema: el modelo esta ajustado para una unica tarea ("pick two blue cubes into the cup") sobre un unico *embodiment* ALOHA; no se espera que generalice a otras tareas, objetos o robots sin reentrenamiento.
- Artefacto de investigacion: 0 descargas y 0 *likes*, publicado como checkpoints intermedios dentro de un plan de 10.000 pasos, sin validacion externa ni resultados de evaluacion publicados.
- Contrato de inferencia estricto: las acciones de los brazos son RELATIVE respecto al estado articular actual, por lo que es obligatorio pasar el estado de 14 dimensiones en cada llamada; omitirlo o enviar un estado incorrecto produce comandos invalidos. Las pinzas, en cambio, son ABSOLUTE.
- Estado propioceptivo ruidoso: el entrenamiento con *state dropout* de 0,5 hace que el modelo tolere mejor la falta de estado, pero tambien implica que su comportamiento puede degradarse de forma distinta a un modelo entrenado siempre con estado completo.
- Resolucion temporal fija: el horizonte de accion y la frecuencia estan acoplados a 15 Hz; desplegarlo a otra frecuencia sin remuestrear o reentrenar introducira errores de temporizacion.
- Idiomas y capacidades linguisticas: no documentados; no debe asumirse comprension de instrucciones en lenguaje natural ni comportamiento multilingue.
- Riesgo de alucinacion motora: al ser una politica generativa de acciones, puede producir trayectorias plausibles pero fisicamente invalidas; en un robot real esto implica riesgo de colision, por lo que se requieren limites de seguridad en el controlador.
- Sesgos: no documentados. Los datos provienen de 31 episodios grabados por un operador concreto, por lo que cabe esperar sesgo hacia esa distribucion de posiciones iniciales, iluminacion y estilo de demostracion.
- Licencia: NVIDIA Open Model License, etiquetada como `other` en HuggingFace. Es imprescindible revisar los terminos completos antes de cualquier uso comercial; el texto integro se encuentra en el enlace incluido mas abajo.
- Ficheros incompletos para reentrenamiento: solo se publican ficheros de inferencia, sin estado del optimizador, del *scheduler* ni del entrenador, de modo que no es posible reanudar el entrenamiento tal cual.
- Advertencia de seguridad: cualquier despliegue fisico debe realizarse en entorno controlado, con parada de emergencia y validacion previa en simulacion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/happyhappy-jun/gr00t-n1.6-aloha-pick-cubes-into-cup-15hz
- Primer ajuste del mismo autor sobre la misma tarea: https://huggingface.co/happyhappy-jun/gr00t-n1.6-aloha-pick-cubes-into-cup
- Modelo base: https://huggingface.co/nvidia/GR00T-N1.6-3B
- Licencia NVIDIA Open Model License: https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-open-model-license/
- Resultados de busqueda web: no se ha encontrado ningun enlace relevante sobre el modelo; los resultados devueltos correspondian a un hotel en Kassel y se han descartado por no ser pertinentes.
