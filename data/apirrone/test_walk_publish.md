# apirrone/test_walk_publish

## Resumen

El modelo `test_walk_publish` es una política de control de locomoción para el robot cuadrúpedo microduck, desarrollada por Antoine Pirrone (apirrone) en el contexto del proyecto pollen-robotics. Se trata de un modelo de aprendizaje por refuerzo (reinforcement learning) que genera comandos de marcha a 50 Hz a partir de 61 observaciones del estado del robot y produce 14 acciones de control. El modelo se distribuye en formato ONNX y está diseñado para ejecutarse de forma perpetua, manteniendo la marcha hasta que se le indique lo contrario mediante el comando `command.idle` durante 0,5 segundos antes de devolver el control al sistema de marcha.

La relevancia de este modelo radica en que demuestra un flujo completo de entrenamiento y despliegue de políticas RL en robótica real, con el normalizador de observaciones integrado en el propio archivo ONNX, lo que simplifica su uso en el robot. Es un ejemplo de cómo se pueden publicar y compartir políticas de control a través de Hugging Face, con un esquema de manifiesto definido por el propio proyecto microduck. El modelo se entrenó en la rama `publish_policies` del repositorio `pollen-robotics/microduck_rl` (commit `8dc749c4d`), aunque no se especifican los detalles del entrenamiento en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal no especificada (formato ONNX) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de control, no de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo de control robotico) |
| Licencia | no disponible |
| Formato de pesos | ONNX (policy.onnx) |

## Arquitectura y entrenamiento

La arquitectura exacta del modelo no se detalla en la informacion proporcionada. Se sabe que es un modelo de aprendizaje por refuerzo, probablemente basado en una red neuronal de tipo MLP o similar, dado el tamano reducido del repositorio (0.0 GB) y su uso en un robot con recursos limitados. El modelo recibe 61 observaciones (estado del robot, probablemente incluyendo posiciones de articulaciones, velocidades, orientacion, etc.) y produce 14 acciones (posiblemente torques o posiciones objetivo para las articulaciones). La frecuencia de control es de 50 Hz, lo que implica una inferencia rapida.

El entrenamiento se realizo con el repositorio `pollen-robotics/microduck_rl`, en la rama `publish_policies` y el commit `8dc749c4d`. No se especifican los hiperparametros, el numero de timesteps, el algoritmo concreto (PPO, SAC, etc.) ni el entorno de simulacion utilizado. El normalizador de observaciones esta integrado en el archivo `policy.onnx`, lo que significa que el modelo espera observaciones crudas y realiza la normalizacion internamente. El manifiesto asociado (`manifest.json`) sigue el esquema 2 definido en la documentacion del daemon microduck.

## Capacidades

- Genera comandos de marcha para el robot cuadrupedo microduck a 50 Hz.
- Mantiene una politica de marcha perpetua hasta que se le envia una senal de idle durante 0,5 segundos.
- Integra el normalizador de observaciones dentro del propio modelo ONNX, aceptando observaciones crudas.
- Se puede desplegar mediante la herramienta `robotctl` con comandos como `robotctl policy add` y `robotctl robot do`.
- Especifico para el robot microduck, con dims de observacion (61) y accion (14) fijas.
- No es un modelo de lenguaje, vision ni generacion de texto; sus capacidades se limitan al control de locomocion.

## Casos de uso

- **Control de marcha en robot cuadrupedo microduck**: el modelo se ejecuta directamente en el robot mediante `robotctl`, proporcionando una politica de caminar estable y continua. Es util para pruebas de campo y experimentos de locomocion.
- **Investigacion en aprendizaje por refuerzo aplicado a robotica**: sirve como punto de partida para comparar politicas entrenadas con diferentes algoritmos o recompensas, ya que se puede cargar y ejecutar en el robot real.
- **Integracion en sistemas de navegacion**: al ser una politica perpetua, puede combinarse con un planificador de alto nivel que envie comandos de idle para detener la marcha cuando sea necesario, por ejemplo al alcanzar un objetivo o evitar un obstaculo.
- **Validacion de modelos entrenados en simulacion**: el modelo puede utilizarse para transferir politicas de RL de simulacion al mundo real, evaluando la brecha entre ambos entornos.
- **Desarrollo de comportamientos complejos**: al poder mantener la marcha indefinidamente, es posible superponer otros comportamientos (giros, paradas) mediante el daemon, creando rutinas completas.
- **Educacion y demostraciones**: por su simplicidad de despliegue, es adecuado para ensenar conceptos de robotica y RL en laboratorios academicos, mostrando como una politica entrenada se ejecuta en hardware real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se proporcionan metricas de rendimiento como velocidad de marcha, consumo energetico, robustez ante perturbaciones o comparaciones con otras politicas de control. Tampoco se indican datos de latencia o throughput de la inferencia ONNX en el hardware del robot.

## Requisitos de hardware

- El modelo es un archivo ONNX de tamano reducido (repositorio de 0.0 GB), por lo que es compatible con hardware embebido de bajo consumo.
- Se espera que pueda ejecutarse en la computadora del robot microduck (posiblemente una Raspberry Pi u otro SBC con soporte para inferencia ONNX).
- No se especifican requisitos de VRAM ni GPU; al ser un modelo pequeno, probablemente funcione en CPU.
- Opciones de despliegue: la herramienta `robotctl` (parte del ecosistema microduck) es el metodo principal. Tambien podria integrarse en entornos ONNX Runtime en Python o C++.
- No se dispone de datos de latencia o throughput estimados.

## Comparativa con modelos similares

No disponible. No se han encontrado en la informacion proporcionada modelos comparables de control de locomocion para microduck u otros robots cuadrupedos con especificaciones similares. El ecosistema microduck es relativamente nicho y no se dispone de una base de datos publica de politicas RL comparables.

## Limitaciones y advertencias

- El modelo es una publicacion de prueba (el nombre `test_walk_publish` lo indica) y no se garantiza su robustez en entornos no controlados.
- La licencia no esta especificada, lo que limita su uso comercial sin autorizacion explicita del autor.
- No se proporcionan datos sobre sesgos o alucinaciones (no aplica a un modelo de control), pero si existe riesgo de comportamiento impredecible ante observaciones fuera del rango de entrenamiento.
- El modelo esta disenado exclusivamente para el robot microduck; no es portable a otros robots sin reentrenamiento.
- No se especifican limitaciones de contexto (no aplica) ni de idiomas (no aplica).
- Para uso en produccion, se recomienda verificar el comportamiento en simulacion y realizar pruebas exhaustivas en el robot real antes de un despliegue prolongado.

## Enlaces

- [HuggingFace - apirrone/test_walk_publish](https://huggingface.co/apirrone/test_walk_publish)
- [Repositorio microduck (pollen-robotics)](https://github.com/pollen-robotics/microduck)
- [Repositorio microduck_rl (pollen-robotics)](https://github.com/pollen-robotics/microduck_rl) (rama `publish_policies`, commit `8dc749c4d`)
- [Perfil de apirrone en GitHub](https://github.com/apirrone)
- [Documentacion de control de marcha (DeepWiki)](https://deepwiki.com/apirrone/Open_Duck_Mini/4-walking-control)
- [Documentacion de modelos ONNX (DeepWiki)](https://deepwiki.com/apirrone/Open_Duck_Mini/6.1-onnx-models)
