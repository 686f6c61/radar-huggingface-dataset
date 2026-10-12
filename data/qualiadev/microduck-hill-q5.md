# qualiadev/microduck-hill-q5

## Resumen

`qualiadev/microduck-hill-q5` es una politica de control (policy) para el robot microduck, publicada por el usuario qualiadev en HuggingFace. No es un modelo de lenguaje: se trata de un fichero ONNX que implementa una marcha o gait completo, entrenado mediante aprendizaje por refuerzo para el robot microduck, con una observacion de 61 dimensiones y 14 acciones a 50 Hz, segun la model card del autor.

El modelo se integra en el ecosistema del daemon de microduck (proyecto de Pollen Robotics) y se carga en una ranura de politica mediante el comando `robotctl policy load`. El normalizador de observaciones viene incluido dentro del propio `policy.onnx`, de modo que el robot puede alimentar observaciones en crudo sin preprocesado adicional. El `manifest.json` sigue el esquema 2 del manifiesto de politicas de microduck.

La relevancia de esta publicacion es limitada y muy especializada: se enmarca en la experimentacion con politicas de locomocion para robots de bajo coste. En el momento de la consulta el repositorio acumula 0 descargas y 0 likes, no declara licencia ni idiomas, y el tamano del repositorio figura como 0.0 GB, por lo que no hay garantias de soporte o mantenimiento. El nombre incluye el sufijo `q5`, que sugiere algun tipo de cuantizacion, aunque no se confirma en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Politica de control entrenada por aprendizaje por refuerzo y exportada a ONNX; no se detalla la topologia de red |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica; observacion de 61 dimensiones por paso de control |
| Tipos de cuantizacion | no disponible (el sufijo "q5" del nombre sugiere una cuantizacion, sin confirmar) |
| Idiomas soportados | no aplica (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) acompanado de `manifest.json` (esquema 2 del manifiesto de politicas de microduck) |
| Dimension de observacion | 61 |
| Dimension de accion | 14 |
| Frecuencia de control | 50 Hz |
| Libreria | microduck |
| Pipeline declarado | robotics |
| Comportamiento | perpetuo (se ejecuta de forma continua hasta que se detiene de forma explicita) |

## Arquitectura y entrenamiento

La informacion disponible no describe la topologia interna de la red (numero de capas, tipo de capa, funcion de activacion ni tamano de las capas ocultas). Lo unico confirmado es que se trata de una politica entrenada por aprendizaje por refuerzo y serializada en formato ONNX, con el normalizador de observaciones embebido en el propio grafo, lo que simplifica el despliegue: el robot entrega observaciones sin normalizar y el modelo las procesa internamente.

Respecto al entrenamiento, la model card indica que se uso el repositorio `pollen-robotics/microduck_rl`, en la rama `sprint/race` y el commit `0141bf4a8`. No se especifica el numero de pasos de entrenamiento, la composicion del dataset, el algoritmo de RL empleado (PPO, SAC u otro), ni si hubo fases de ajuste fino o de curriculum sobre terrenos con pendiente. Tampoco se documenta si existe aleatorizacion de dominio para mejorar la transferencia del simulador al robot real. La unica pista funcional es el sufijo `hill` del nombre, que apunta a una marcha pensada para terrenos inclinados o con pendiente.

## Capacidades

- Generacion de una marcha completa y perpetua para el robot microduck, con 14 acciones de control a 50 Hz.
- Procesamiento de observaciones en crudo de 61 dimensiones, gracias al normalizador integrado en el fichero ONNX.
- Ejecucion continua sin fin predefinido: la politica se mantiene activa hasta que se detiene de forma externa.
- Carga en el daemon del robot mediante `robotctl policy load <slot> qualiadev/microduck-hill-q5`.
- Integracion con el esquema 2 del manifiesto de politicas de microduck, lo que permite su gestion como una ranura de politica mas.
- Marcha orientada a terreno con pendiente, segun el identificador `hill` del nombre del modelo.
- No soporta tool calling, function calling, razonamiento multi-paso, capacidades multilingues, vision, audio ni generacion de texto: no es un modelo de lenguaje ni un modelo multimodal.

## Casos de uso

- Locomocion base en el robot microduck: cargar la politica en una ranura mediante `robotctl policy load` y dejar que el robot camine de forma continua sin intervencion, aprovechando que la politica es perpetua.
- Pruebas de marcha en pendiente: dado el identificador `hill`, es un candidato razonable para validar el comportamiento del robot en superficies inclinadas dentro de un banco de pruebas controlado.
- Comparacion de politicas de RL: al convivir con otras politicas en el mismo daemon, permite alternar entre marchas en una misma sesion y comparar estabilidad, velocidad y consumo energetico.
- Reproduccion de experimentos de `microduck_rl`: el commit `0141bf4a8` de la rama `sprint/race` permite regenerar o auditar el entrenamiento que dio lugar al ONNX publicado.
- Base para ajuste fino o destilacion: el fichero ONNX puede servir como punto de partida para experimentos de RL posterior o de destilacion a redes mas pequenas.
- Evaluacion de sim-to-real: comprobar hasta que punto una politica entrenada en simulacion se mantiene estable en el hardware real, midiendo deriva, oscilaciones y caidas.
- Docencia y prototipado en robotica: ejemplo de pipeline completo que va del entrenamiento por refuerzo a un artefacto ONNX desplegable en un robot de bajo coste.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye metricas de recompensa, tasas de exito, velocidad de avance, robustez ante perturbaciones ni comparaciones con otras politicas.

## Requisitos de hardware

- No se dispone de datos sobre el numero de parametros ni el tamano del fichero ONNX, por lo que no es posible estimar la VRAM necesaria para inferencia.
- El modelo esta pensado para ejecutarse en el propio robot microduck (o en el proceso que aloja el daemon), no en un servidor de inferencia de gran escala.
- Al tratarse de una politica de control a 50 Hz con observaciones de 61 dimensiones y 14 acciones, el coste por inferencia es previsiblemente muy bajo, pero no se confirma ningun dato de latencia ni de throughput.
- Opciones de despliegue conocidas: el daemon de microduck con el comando `robotctl policy load` y un runtime compatible con ONNX. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de artefacto.
- No se indica si requiere GPU; el despliegue en CPU es plausible por la naturaleza del modelo, aunque no esta confirmado en la informacion disponible.
- No se publican estimaciones de latencia, throughput ni consumo energetico.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye otras politicas comparables para el robot microduck ni resultados que permitan situar este modelo frente a alternativas de la misma categoria.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qualiadev/microduck-hill-q5 | no disponible | no aplica (61-D de observacion) | no disponible | no disponible | HuggingFace |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- La licencia no esta declarada, por lo que no hay certeza sobre el uso comercial ni sobre las condiciones de redistribucion.
- El repositorio registra 0 descargas y 0 likes, y un tamano de 0.0 GB, lo que sugiere que el artefacto puede no estar subido correctamente o carecer de cualquier validacion por parte de terceros.
- No se documenta el algoritmo de entrenamiento, el numero de pasos, la composicion del dataset ni las condiciones del simulador, lo que impide evaluar la robustez real de la politica.
- Al ser una politica entrenada por RL, existe riesgo de sobreajuste a las condiciones concretas de entrenamiento y de degradacion ante cambios de terreno, carga, bateria o desgaste de motores.
- El identificador `hill` sugiere una marcha especializada en pendientes; su comportamiento en terreno llano, escaleras u obstaculos no esta documentado.
- Un fallo de la politica en un robot fisico puede provocar caidas, danos mecanicos o situaciones inseguras; no se documentan limites de par, paradas de emergencia ni validaciones de seguridad.
- No hay informacion sobre sesgos, al no tratarse de un modelo de lenguaje ni de un sistema que procese datos personales.
- Aunque el nombre incluye `q5`, no se confirma que exista cuantizacion ni con que precision se ha exportado el grafo ONNX.
- La fecha de creacion indicada (2026-10-12) y la de actualizacion (2026-10-12) no permiten extraer conclusiones sobre el mantenimiento del proyecto.

## Enlaces

- HuggingFace: https://huggingface.co/qualiadev/microduck-hill-q5
- Repositorio del robot microduck: https://github.com/pollen-robotics/microduck
- Repositorio de entrenamiento por refuerzo (rama `sprint/race`, commit `0141bf4a8`): `pollen-robotics/microduck_rl`
- Documentacion del manifiesto de politicas (`docs/policy-manifest.md` en el repositorio del daemon): no disponible como enlace directo en la informacion proporcionada
