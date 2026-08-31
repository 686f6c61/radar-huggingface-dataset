# eslab1234/smolvla_task1_444ep_fullft_b16_220k

## Resumen

SmolVLA es un modelo de vision-lenguaje-accion (VLA) compacto desarrollado por Hugging Face, disenado para control robotico por imitacion con hardware de consumo. Este repositorio concreto, `eslab1234/smolvla_task1_444ep_fullft_b16_220k`, es un fine-tuning completo del modelo base `lerobot/smolvla_base` sobre un dataset propio de demostraciones de una tarea de manipulacion: recoger cinco bloques de colores en una secuencia determinada y colocarlos en un area objetivo. El modelo consume dos vistas de camara (superior y muneca) junto con el estado del robot (6 dimensiones) y produce acciones de 6 dimensiones.

Con 450 millones de parametros, SmolVLA es significativamente mas pequeno que otros VLA como OpenVLA (7B) o RT-2, lo que permite su despliegue en GPUs de gama media e incluso en sistemas embebidos. Esta ficha corresponde a una politica entrenada con el framework LeRobot, que facilita la grabacion de datos, el entrenamiento y la ejecucion en robots reales como el SO-100 o SO-101. El modelo se distribuye bajo licencia Apache 2.0 y los pesos estan en formato safetensors.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (vision-lenguaje-accion), basado en SmolVLM |
| Parametros totales | 450.046.176 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible (acepta multiples imagenes de alta resolucion y texto) |
| Tipos de cuantizacion | No disponible (pesos en bfloat16 originalmente) |
| Idiomas soportados | No disponible (el modelo base soporta varios idiomas, pero la tarea esta en ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bfloat16) |

## Arquitectura y entrenamiento

SmolVLA combina un codificador de vision, un modelo de lenguaje multimodal (SmolVLM) y un "action expert" que genera las acciones del robot a partir de las caracteristicas contextuales. La arquitectura es un transformer denso, sin mezcla de expertos. El modelo recibe como entrada las imagenes de dos camaras (top y wrist) a resolucion 480x640, el estado del robot (posicion y orientacion, 6 valores) y una instruccion en lenguaje natural. La salida es un vector de accion de 6 dimensiones (posiciones y orientaciones del efector final).

El entrenamiento se realizo mediante fine-tuning completo del modelo base `lerobot/smolvla_base` sobre el dataset `eslab1234/task1_hybrid_5blocks_v3_444ep_merged`, que contiene 444 episodios y 625.527 fotogramas a 30 FPS. Se usaron 250.000 pasos de entrenamiento con batch size 16, optimizador AdamW, learning rate 2e-5 y semilla 1000. No se aplicaron tecnicas de RLHF ni DPO; es aprendizaje por imitacion supervisado (behavioral cloning). La configuracion completa se gestiono con LeRobot version 0.5.2.

## Capacidades

- Control robotico de 6 grados de libertad (posicion y orientacion del efector) a partir de observaciones visuales y de estado.
- Seguimiento de instrucciones en lenguaje natural para tareas de manipulacion (p. ej., "recoge los bloques en secuencia rojo, amarillo, madera, verde, azul").
- Procesamiento de multiples vistas de camara simultaneas (top y wrist) para percepcion del entorno.
- Generacion de acciones en tiempo real (30 FPS) adecuadas para control de robots en bucle cerrado.
- Integracion nativa con el ecosistema LeRobot: entrenamiento, evaluacion y despliegue en robots SO-100/SO-101.
- Capacidad de generalizar a variaciones de posicion de objetos dentro del escenario de entrenamiento (no verificado sin evaluacion real).

## Casos de uso

- Manipulacion de objetos en entornos de laboratorio: el modelo puede ejecutar tareas de pick-and-place con multiples objetos, como la tarea de cinco bloques para la que fue entrenado.
- Automatizacion de procesos de ensamblaje: gracias a su capacidad de seguir instrucciones secuenciales, puede aplicarse a tareas de montaje de piezas en lineas de produccion flexibles.
- Investigacion en aprendizaje por imitacion: sirve como punto de partida para estudiar la transferencia de politicas VLA a nuevos escenarios o robots.
- Robotica educativa: su tamano reducido y licencia permisiva permiten usarlo en proyectos academicos y de formacion en robotica con hardware asequible.
- Prototipado rapido de politicas robotizadas: con LeRobot, se puede grabar un dataset propio y fine-tunear el modelo en pocas horas para tareas especificas.
- Control de robots colaborativos en entornos domesticos o de oficina: tareas como recoger y ordenar objetos, siempre que el entorno sea similar al de entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que no se han proporcionado resultados de evaluacion para esta politica. No se dispone de metricas como tasa de exito en el robot real ni comparaciones con otros modelos en la misma tarea.

## Requisitos de hardware

- VRAM estimada para inferencia: al tener 450M parametros en bfloat16, el modelo ocupa aproximadamente 900 MB en memoria. Con overhead de activaciones y procesamiento de imagenes, se recomienda al menos 4-6 GB de VRAM para inferencia en tiempo real.
- GPU recomendadas: NVIDIA RTX 3060 (12 GB), RTX 4070, RTX 4090, o cualquier GPU con al menos 6 GB de VRAM y soporte CUDA. Tambien funciona en GPUs de datacenter como A10 o A100.
- Compatibilidad con GPU de consumo: si, es uno de los objetivos principales de SmolVLA. Puede ejecutarse en una RTX 3060 o superior.
- Opciones de despliegue: LeRobot proporciona scripts de rollout (`lerobot-rollout`) que cargan el modelo y lo ejecutan en el robot. Tambien se puede servir como API mediante vLLM o TGI, aunque para control robotico en tiempo real se recomienda ejecucion local.
- Latencia y throughput: no se han publicado mediciones especificas para este modelo, pero al ser un modelo compacto, se espera que la inferencia se realice en menos de 50 ms por paso en una GPU moderna, cumpliendo con el requisito de 30 FPS.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Uso robotico |
|---|---|---|---|---|
| SmolVLA (este) | 450M | No disponible | Apache 2.0 | Si (LeRobot) |
| OpenVLA | 7B | 2048 tokens | MIT | Si (via adaptacion) |
| RT-2 (PaLI-X) | 55B | No disponible | Propietaria | Si (Google) |
| Octo | 93M | No disponible | MIT | Si (LeRobot) |

SmolVLA se distingue por ser mucho mas ligero que OpenVLA o RT-2, lo que permite su ejecucion en hardware de consumo sin sacrificar demasiado rendimiento en tareas de manipulacion simples. OpenVLA ofrece mayor capacidad de razonamiento general, pero requiere GPUs de alta gama. Octo, con 93M de parametros, es aun mas pequeno pero no incorpora lenguaje natural de forma nativa. SmolVLA equilibra tamano, capacidades multimodales y facilidad de fine-tuning.

## Limitaciones y advertencias

- El modelo ha sido entrenado exclusivamente en una tarea especifica (recoger 5 bloques en una secuencia determinada). No se espera que generalice a tareas fuera de este dominio sin fine-tuning adicional.
- No se han publicado resultados de evaluacion en el robot real, por lo que la tasa de exito esperada es desconocida. Puede fallar en condiciones de iluminacion, posiciones de objetos o configuraciones de camara diferentes a las del dataset de entrenamiento.
- Riesgo de alucinacion en la interpretacion de escenas: como cualquier VLA, puede malinterpretar la presencia o posicion de objetos, especialmente con oclusiones o reflejos.
- Dependencia critica de la configuracion de camaras: las vistas `top` y `wrist` deben coincidir exactamente con las utilizadas durante el entrenamiento (misma posicion, orientacion y resolucion).
- El modelo no soporta tool calling ni funciones de agente; esta disenado exclusivamente para generar acciones de robot.
- Aunque la licencia Apache 2.0 permite uso comercial, el modelo base y el dataset de entrenamiento pueden tener restricciones adicionales. El dataset `eslab1234/task1_hybrid_5blocks_v3_444ep_merged` no especifica su licencia en la informacion disponible.
- No se proporcionan datos sobre sesgos del modelo. El dataset de entrenamiento es limitado y puede reflejar sesgos del operador humano que grabo las demostraciones.

## Enlaces

- Repositorio del modelo: https://huggingface.co/eslab1234/smolvla_task1_444ep_fullft_b16_220k
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Dataset de entrenamiento: https://huggingface.co/datasets/eslab1234/task1_hybrid_5blocks_v3_444ep_merged
- Paper de SmolVLA: https://arxiv.org/abs/2506.01844
- Documentacion de LeRobot sobre SmolVLA: https://huggingface.co/docs/lerobot/main/en/smolvla
- Guia de instalacion de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
