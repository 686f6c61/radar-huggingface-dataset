# dkuzmenko/eedgym-ckpts

## Resumen

EED Gym checkpoints es un repositorio de pesos de aprendizaje por refuerzo (RL) publicados por Dmytro Kuzmenko para el entorno Empathic Ethical Disobedience (EED) Gym, un banco de pruebas de interaccion humano-robot centrado en la desobediencia etica empatica. No es un modelo de lenguaje: son politicas entrenadas con Stable-Baselines3 (PPO y variantes) que actuan como lineas base y ablaciones de referencia para investigacion en RL seguro. El repositorio contiene 40 checkpoints por version (8 configuraciones con 5 semillas cada una) en dos versiones, v1.0 y v1.1.

El objetivo es permitir la reproduccion de los resultados del articulo "When Robots Say No: The Empathic Ethical Disobedience Benchmark" (HRI 2026) y servir de punto de partida para nuevas comparaciones. La version v1.1 corrige defectos de la v1.0 que afectaban a los numeros reportados: en concreto, el enmascaramiento de Masked PPO permitia todas las acciones y Lagrangian PPO nunca aplicaba su restriccion de coste, por lo que ambos conjuntos se entrenaron como PPO plano.

El repositorio es pequeno (0,1 GB), esta bajo licencia MIT y solo declara ingles como idioma. Su relevancia es metodologica: ofrece checkpoints auditables y una errata publica que documenta los fallos de la version anterior, algo poco habitual y util para quien trabaje en RL seguro aplicado a interaccion humano-robot.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Politicas de aprendizaje por refuerzo entrenadas con Stable-Baselines3 (PPO, PPO-LSTM, Masked PPO, Lagrangian PPO y ablaciones) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; depende del entorno EED Gym) |
| Tipos de cuantizacion | no disponible (checkpoints en formato .zip de Stable-Baselines3) |
| Idiomas soportados | en |
| Licencia | MIT |
| Formato de pesos | .zip (Stable-Baselines3) acompanado de ficheros .json por checkpoint |

## Arquitectura y entrenamiento

Los checkpoints corresponden a politicas de RL entrenadas con Stable-Baselines3 sobre el entorno EED Gym. Se incluyen ocho configuraciones: PPO plano (vanilla), PPO con LSTM, Masked PPO, Lagrangian PPO y cuatro ablaciones (sin afecto, sin aclaracion/alternativa, sin curriculo y sin penalizacion de confianza). Cada configuracion se entrena con cinco semillas, lo que da 40 checkpoints por version. No se dispone de informacion sobre el numero de pasos de entrenamiento, la composicion de episodios ni los hiperparametros concretos en la informacion proporcionada.

La innovacion destacable no esta en la arquitectura de red sino en la correccion metodologica: la version v1.1 repara defectos de la v1.0 documentados en una errata publica, entre ellos que Masked PPO no enmascaraba acciones y que Lagrangian PPO no aplicaba su restriccion de coste. Por tanto, los checkpoints v1.0 de esas dos variantes son funcionalmente PPO plano, y solo deben usarse para reproducir los numeros impresos en el articulo, no como referencia de las variantes que dicen ser.

## Capacidades

- Control de politica en el entorno EED Gym: seleccion de acciones ante situaciones de desobediencia etica empatica.
- Variantes con memoria recurrente (PPO-LSTM) para secuencias de interaccion.
- Variantes con enmascaramiento de acciones (Masked PPO) y con restricciones de coste (Lagrangian PPO) en la version v1.1.
- Ablaciones controladas para analisis de componentes: afecto, aclaracion/alternativa, curriculo y penalizacion de confianza.
- Reproducibilidad de resultados del articulo HRI 2026 mediante la version v1.0.
- Evaluacion estandarizada mediante los modulos `eed_benchmark.eval.id_eval` y `eed_benchmark.eval.st_eval`.
- No soporta tool calling, function calling, agentes multi-paso, vision, audio ni generacion de texto: no es un modelo de lenguaje.

## Casos de uso

- Reproduccion de resultados academicos: cargar los checkpoints de `v1.0/` y ejecutar los scripts de evaluacion del repositorio `eed_gym` para verificar las cifras publicadas en el articulo HRI 2026.
- Linea base para nuevas investigaciones en RL seguro: usar `v1.1/ppo` como referencia PPO estandar al proponer metodos de desobediencia etica empatica.
- Estudio de ablaciones: comparar `v1.1/ppo_noaffect`, `v1.1/ppo_noclarifyalt`, `v1.1/ppo_nocurriculum` y `v1.1/ppo_notrustpenalty` frente a la configuracion completa para aislar la contribucion de cada componente.
- Analisis de estabilidad entre semillas: las cinco semillas por configuracion permiten medir varianza del rendimiento y robustez del entrenamiento.
- Investigacion en interaccion humano-robot: evaluar politicas que deben negarse a ordenes humanas por motivos eticos sin degradar la confianza del usuario.
- Docencia y formacion: usar el repositorio como ejemplo practico de RL con Stable-Baselines3, incluyendo el estudio de una errata que documenta fallos de implementacion y su correccion.
- Auditoria de metodologia: revisar `ERRATA.md` y contrastar resultados v1.0 frente a v1.1 como caso de buenas practicas en publicacion de checkpoints.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite a `ERRATA.md` para la comparacion lado a lado entre resultados del articulo y de v1.1, pero no se incluyen cifras en el material proporcionado.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repositorio completo ocupa 0,1 GB, por lo que cualquier checkpoint individual es muy ligero.
- GPU recomendadas: no disponible; al tratarse de politicas pequenas de Stable-Baselines3, es probable que la CPU sea suficiente, pero no se confirma en la informacion proporcionada.
- Compatibilidad con GPU de consumo: no disponible de forma explicita; el tamano del repositorio sugiere que si, sin datos confirmados.
- Opciones de despliegue: carga mediante Stable-Baselines3 en Python; evaluacion con `python -m eed_benchmark.eval.id_eval` y `python -m eed_benchmark.eval.st_eval` tras instalar `eed_gym` con `pip install -e .`.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. No se han identificado en la informacion proporcionada otros repositorios de checkpoints comparables para el mismo entorno o benchmark.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no razona en lenguaje natural y no soporta tool calling ni agentes.
- Solo declara soporte de ingles; no hay evidencia de capacidades multilingues.
- Los checkpoints v1.0 de Masked PPO y Lagrangian PPO se entrenaron como PPO plano por defecto de implementacion; no deben interpretarse como las variantes que indican sus nombres.
- Los numeros del articulo pueden no coincidir con los de v1.1; usar `v1.0/` solo para reproducir el articulo tal cual y `v1.1/` para trabajo nuevo.
- El rendimiento esta acotado al entorno EED Gym; no hay garantia de transferencia a otros dominios de interaccion humano-robot.
- Riesgo de alucinacion no aplica en el sentido de modelos generativos, pero si existe riesgo de sobreinterpretar el comportamiento de la politica fuera de la distribucion de entrenamiento.
- Licencia MIT: permite uso comercial, pero conviene citar el articulo y revisar las condiciones del entorno `eed_gym` y de Stable-Baselines3.
- Repositorio con muy poca traccion (47 descargas, 0 likes), por lo que la validacion externa es limitada.
- Para produccion, verificar la version del codigo `eed_gym` frente a la de los checkpoints, ya que los enlaces directos antiguos requieren el prefijo `v1.0/`.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/dkuzmenko/eedgym-ckpts
- Codigo del entorno: https://github.com/dmytro-kuzmenko/eed_gym
- Release v1.1.0: https://github.com/dmytro-kuzmenko/eed_gym/releases/tag/v1.1.0
- Release v1.0.0: https://github.com/dmytro-kuzmenko/eed_gym/releases/tag/v1.0.0
- Errata: https://github.com/dmytro-kuzmenko/eed_gym/blob/main/ERRATA.md
- Articulo (DOI): https://doi.org/10.1145/3757279.3785547
- README v1.1: https://huggingface.co/dkuzmenko/eedgym-ckpts/blob/main/v1.1/README.md
- README v1.0: https://huggingface.co/dkuzmenko/eedgym-ckpts/blob/main/v1.0/README.md
