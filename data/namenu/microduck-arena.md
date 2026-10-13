# namenu/microduck-arena

## Resumen

`namenu/microduck-arena` es una política de control entrenada mediante aprendizaje por refuerzo para el robot bípedo MicroDuck de Pollen Robotics y Hugging Face. Aunque el repositorio se llama `microduck-arena`, el título interno de la model card es `strata-sprint-f3`: se trata de una política de marcha (gait) obtenida en el entorno de sprint de 2 metros de `microduck-challenges` ("Strata"), con recompensas modificadas respecto al entorno original. El artefacto principal es un fichero `policy.onnx` acompañado de un `manifest.json` conforme al esquema 2 del manifiesto de políticas de MicroDuck.

El modelo no es un modelo de lenguaje ni un modelo generativo multimodal: es una política reactiva de robótica con una observación de 61 dimensiones y 14 acciones, ejecutada a 50 Hz. Se describe como "perpetua", es decir, no está asociada a una tarea finita, sino que genera una marcha continua hasta que se le indique lo contrario, y se carga en una ranura (slot) del daemon `robotctl` del robot. El normalizador de observaciones está integrado dentro del propio ONNX, por lo que se le deben alimentar observaciones en crudo.

El interés del modelo es acotado pero específico: es un ejemplo de cómo se publican y distribuyen políticas de RL para robótica de bajo coste directamente en Hugging Face, con un formato de despliegue estandarizado (`robotctl policy load`) y un pipeline (`robotics`) distinto al de los modelos de lenguaje. No cuenta con descargas ni interacciones en el momento de la consulta, y su licencia no está declarada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible. Se trata de una política de aprendizaje por refuerzo exportada a ONNX; la model card no describe la topología de la red (MLP u otra) |
| Parametros totales | No disponible |
| Parametros activos | No disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | No aplica / no disponible. La interfaz es una observación de 61 dimensiones por paso a 50 Hz |
| Tipos de cuantizacion | No disponible. El artefacto distribuido es un ONNX (`policy.onnx`); no se documentan variantes cuantizadas |
| Idiomas soportados | No aplica / no disponible |
| Licencia | No disponible (campo de licencia vacío en Hugging Face y en la model card) |
| Formato de pesos | ONNX (`policy.onnx`) junto con `manifest.json`, esquema 2 del manifiesto de políticas de microduck |
| Entorno de entrenamiento | `Mjlab-Sprint2m-MicroDuck`, repo `pollen-robotics/microduck-challenges`, rama `main`, commit `a3e0c0fbe`, checkpoint `2999`, semilla `1` |
| Frecuencia de control | 50 Hz |
| Dimension de observacion / accion | 61 dimensiones de observacion, 14 acciones |
| Tamano del repositorio | 0,0 GB segun Hugging Face |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura interna de la red. Lo que si se documenta es el procedimiento de obtencion: la politica fue entrenada y evaluada ("judged") en el entorno de sprint de 2 metros de Strata, dentro del repositorio `pollen-robotics/microduck-challenges`, con recompensas modificadas respecto a la configuracion por defecto. El identificador de tarea es `Mjlab-Sprint2m-MicroDuck`, lo que apunta a un entorno de simulacion basado en MuJoCo y a un pipeline tipo mjlab para el entrenamiento por refuerzo. El checkpoint exportado es el `2999` con semilla `1`, sobre el commit `a3e0c0fbe` de la rama `main`.

Un detalle relevante para la reproducibilidad es que la exportacion se realizo desde un checkout con cambios sin commitear, tal y como admite la propia model card. Esto implica que el binario publicado no es estrictamente reproducible a partir del commit indicado. La unica innovacion tecnica declarada es de empaquetado: el normalizador de observaciones va embebido en el ONNX, de modo que el consumidor debe alimentar observaciones sin normalizar, lo que reduce el riesgo de desajustes entre entrenamiento e inferencia. No se menciona RLHF, DPO ni ninguna otra etapa de ajuste, algo esperable en una politica de control.

## Capacidades

- Generacion de una marcha continua y "perpetua" para el bipedo MicroDuck: la politica no termina por si sola, sino que sigue actuando a 50 Hz hasta que se detiene externamente.
- Locomocion de sprint: entrenada especificamente para la tarea de sprint de 2 metros con recompensas modificadas.
- Interfaz de observacion en crudo: acepta las 61 dimensiones de observacion del robot directamente, ya que la normalizacion esta integrada en el ONNX.
- Interfaz de accion de 14 dimensiones, coherente con el espacio de acciones del entorno de entrenamiento.
- Despliegue mediante el daemon `robotctl` del robot (`sudo robotctl policy load <slot> namenu/microduck-arena`).
- Compatibilidad declarada con el esquema 2 del manifiesto de politicas de microduck.
- No dispone de: generacion de texto, razonamiento, codigo, matematicas, vision, audio, tool calling, capacidades de agente ni soporte multilingue. Las etiquetas del repositorio (`microduck`, `onnx`, `robotics`, `reinforcement-learning`) confirman que es un artefacto exclusivamente de robotica.

## Casos de uso

- Control de locomocion del MicroDuck en laboratorio: cargar la politica en una ranura del daemon `robotctl` y alimentarla con las observaciones del robot para obtener una marcha continua a 50 Hz. Es el uso previsto explicitamente por el autor.
- Evaluacion comparativa de politicas de RL: al estar empaquetada en el formato estandar de microduck, se puede enfrentar contra otras politicas (por ejemplo, politicas de marcha de la comunidad) en el mismo robot o en el mismo entorno simulado para comparar estabilidad y velocidad.
- Reproduccion de experimentos de sprint de 2 metros: sirve como punto de partida para estudiar el efecto de modificaciones en la funcion de recompensa, ya que la model card indica que las recompensas se alteraron respecto al entorno base.
- Base para fine-tuning o distillation: al ser una politica "perpetua" ya entrenada, puede usarse como inicializacion en nuevos entrenamientos sobre el mismo entorno `Mjlab-Sprint2m-MicroDuck`.
- Demostraciones educativas de robotica con RL: el robot MicroDuck esta pensado para experimentacion en IA fisica, y esta politica permite mostrar en vivo el resultado de un entrenamiento por refuerzo en un bipedo de bajo coste.
- Integracion en simulacion con ONNX: al ser un fichero ONNX, se puede ejecutar en un runtime de inferencia dentro de un simulador (por ejemplo, MuJoCo con puente ONNX) para validar la politica antes de desplegarla en hardware.
- Pruebas de robustez de la pila de control: util para verificar la cadena `manifest.json` + `policy.onnx` + daemon, incluida la normalizacion embebida, antes de dar por buena una politica en produccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona que la politica fue "judged" en el entorno de sprint de 2 metros de Strata, pero no incluye metricas numericas (velocidad, tiempo de sprint, tasa de caidas, recompensa final ni curvas de entrenamiento). Tampoco se aportan comparaciones con otras politicas dentro del repositorio. No se deben asumir valores de rendimiento a partir del nombre `strata-sprint-f3`.

| Benchmark | Resultado | Notas |
|---|---|---|
| Sprint 2 m (entorno Strata) | No disponible | Se indica que fue evaluada, sin cifras publicadas |
| Metricas de recompensa | No disponible | Recompensas modificadas respecto al entorno base, sin detalle |
| Comparativa con otras politicas microduck | No disponible | Sin datos publicados |

## Requisitos de hardware

- VRAM para inferencia: no disponible. No se documentan requisitos de GPU, y por la naturaleza del artefacto (una politica ONNX de observacion 61 y accion 14 para un robot de 25 cm) cabe esperar que la inferencia sea ligera y ejecutable en CPU, pero este extremo no esta confirmado en la informacion proporcionada.
- GPU recomendadas: no disponible, no aplica segun la documentacion publicada.
- Ejecucion en GPU de consumo: no disponible. No hay datos que permitan afirmar ni descartar su ejecucion en tarjetas como RTX 4090 u otras.
- Opciones de despliegue documentadas: el daemon `robotctl` del MicroDuck, mediante `sudo robotctl policy load <slot> namenu/microduck-arena`. Cualquier otro runtime ONNX (ONNX Runtime, ejecucion en simulador) es viable en principio por el formato, pero no esta documentado por el autor.
- Latencia y throughput: no disponible. La unica referencia temporal es la frecuencia de control de 50 Hz (periodo de 20 ms) declarada para la politica.
- Requisitos de robot: el MicroDuck original es un bipedo de 25 cm, 15 motores, con camara, sensor de profundidad, dos sensores de movimiento y un pico articulado capaz de sujetar objetos, segun las fuentes de prensa. La model card declara 14 acciones, cifra que no coincide con los 15 motores del robot; conviene verificar la correspondencia entre acciones y actuadores antes de desplegar.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de esta politica ni de otras politicas comparables, por lo que la comparacion se limita a caracteristicas estructurales. Existen otras politicas de marcha para MicroDuck distribuidas por la comunidad (por ejemplo, las que se cargan en el Space `craigm26/microduck-arena`) y los entornos de referencia de `pollen-robotics/microduck-challenges`, pero no se han publicado metricas que permitan un ranking.

| Modelo / politica | Tipo | Observacion / accion | Contexto o frecuencia | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `namenu/microduck-arena` (strata-sprint-f3) | Politica RL para MicroDuck, ONNX | 61 / 14 | 50 Hz, marcha perpetua | No disponible | Hugging Face, 0 descargas |
| Politicas de marcha de la comunidad MicroDuck (p. ej. las usadas en Spaces de microduck) | Politica RL para MicroDuck | No disponible | No disponible | No disponible | Hugging Face Spaces |
| Entornos de referencia `pollen-robotics/microduck-challenges` | Entornos de entrenamiento, no politicas entrenadas | No disponible | No disponible | No disponible | GitHub |

## Limitaciones y advertencias

- Licencia no declarada: no hay informacion sobre permisos de uso comercial, modificacion o redistribucion. Tratarla como no apta para uso comercial hasta aclarar la licencia.
- Reproducibilidad comprometida: segun la propia model card, el modelo se exporto desde un checkout con cambios sin commitear, por lo que el binario no se corresponde exactamente con el commit `a3e0c0fbe` indicado.
- Sin validacion publica: cero descargas y cero likes, sin informes de terceros sobre su comportamiento en hardware real. El riesgo de fallos en robot fisico (caidas, inestabilidad) no esta cuantificado.
- Discrepancia en el numero de acciones: la model card declara 14 acciones mientras que las fuentes sobre el robot MicroDuck mencionan 15 motores. Hay que verificar la interfaz real antes de cargarla.
- Ambito muy restringido: es una politica de locomocion, no un modelo de proposito general. No procesa lenguaje, no razona y no tiene capacidades multimodales, aunque el robot incorpore camara y sensor de profundidad.
- Especifica de un entorno: fue entrenada en `Mjlab-Sprint2m-MicroDuck` con recompensas modificadas. Es esperable un comportamiento degradado fuera de ese entorno o con variaciones de terreno, carga o friccion, aunque no se documenta el grado de generalizacion.
- Politica perpetua: al no terminar por si sola, requiere un mecanismo externo de parada. En un robot real esto implica supervisar el proceso y prever un corte de seguridad.
- Confusion de nombre: el identificador `microduck-arena` coincide con el proyecto de futbol 3v3 en navegador `microduck-arena` de otro autor. No hay evidencia de que esta politica tenga relacion con ese proyecto; el contenido real de la model card es una politica de sprint.
- Ausencia de normalizacion externa: el normalizador va embebido en el ONNX. Si se preprocesan las observaciones antes de alimentar el modelo, se producira una doble normalizacion y la politica fallara.
- Idiomas no aplicables y sin datos de sesgo en el sentido de los modelos de lenguaje; el sesgo relevante aqui seria de simulacion a realidad (sim-to-real), no documentado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/namenu/microduck-arena
- Repositorio de referencia del entrenamiento (microduck-challenges): https://github.com/pollen-robotics/microduck-challenges
- Proyecto microduck de Pollen Robotics: https://github.com/pollen-robotics/microduck
- Proyecto Microduck Arena (futbol 3v3 en navegador, autor distinto): https://github.com/00make/microduck-arena
- Sitio de Microduck Arena: https://microduck-arena.com/
- Space de politicas de marcha para MicroDuck (craigm26): https://huggingface.co/spaces/craigm26/microduck-arena
- Cobertura de prensa sobre el robot MicroDuck (MarkTechPost): https://www.marktechpost.com/2026/08/28/pollen-robotics-hugging-face-microduck-399-open-source-rl-biped-robot/
- Cobertura de prensa sobre el robot MicroDuck (CNX Software): https://www.cnx-software.com/2026/08/28/microduck-a-duck-like-biped-robot-designed-for-physical-ai-experimentation-and-fun/
