# CALM-Dataset/CALM-PPO

## Resumen

CALM-PPO es una política de aprendizaje por refuerzo entrenada con PPO (Proximal Policy Optimization) que recomienda una velocidad de paso sobre badenes para mantener el confort de marcha. No es un modelo de lenguaje: se trata de un agente de control continuo cuyo cometido es elegir, para cada badén, una velocidad objetivo entre 8 km/h y la velocidad del escenario, de forma que la aceleración ponderada según la norma ISO 2631-1 se minimice sin penalizar el tiempo de viaje. Lo publica el espacio CALM-Dataset, asociado al repositorio CALM (Mohammed-Azab/CALM) de dinámica vehicular, bajo licencia MIT.

El agente se entrena en simulación sobre un modelo de semivehículo (half-car) con la carretera por delante como entrada y se evalúa sobre 105 escenarios de carretera real procedentes del dataset CALM-Scenarios (Augsburg, Nardo, Sindelfingen y Stuttgart), de los cuales 20 quedan completamente fuera del entrenamiento. La arquitectura es una red neuronal de pequeña talla: actor con dos capas ocultas (256, 128) y media acotada por tanh, más un crítico de dos capas (256, 256). Se publican cinco semillas de entrenamiento (69 a 73) de 10 millones de pasos cada una.

Su relevancia es acotada pero concreta: sirve como referencia reproducible de control basado en aprendizaje para confort de marcha, y su propio autor lo compara con un controlador predictivo basado en modelo (MPC). La diferencia frente al MPC en carreteras reales es de aproximadamente un 1 % y no distinguible de cero, por lo que debe interpretarse como un resultado a la par, no superior. La model card advierte además de que la ganancia frente a conducir a velocidad constante y a igual tiempo es de solo el 1,0 %.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal feedforward (MLP) con PPO; actor de 2 capas ocultas (256, 128) con media acotada por tanh; critico de 2 capas (256, 256) |
| Parametros totales | no disponible (la model card no publica el recuento; depende de la dimension de observacion, no indicada) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica en el sentido de contexto de lenguaje; la observacion incluye el estado del semivehiculo y los tres picos de baden mas cercanos en los proximos 40 m |
| Tipos de cuantizacion | no disponible; no se publican versiones cuantizadas (no es un modelo de pesos transformables) |
| Idiomas soportados | no disponible (el modelo no procesa lenguaje natural) |
| Licencia | MIT (igual que el codigo del repositorio CALM) |
| Formato de pesos | `.zip` de Stable-Baselines3 (`PPO_final.zip`) junto con `vecnormalize.pkl` para la normalizacion de observaciones y recompensas |

## Arquitectura y entrenamiento

La política se entrena con PPO durante 10 millones de pasos repartidos en 5 entornos paralelos, con un curriculum de cuatro niveles que va incorporando carreteras reales de forma progresiva. La accion es una velocidad recomendada entre 8 km/h y la velocidad del escenario, que despues se entrega a un controlador de velocidad. Un controlador adicional adapta el peso del termino de velocidad de la recompensa para mantener la velocidad media en un objetivo fijado (0,6 en `configs/algo_configs.yaml`), lo que evita que el agente optimice unicamente el confort reduciendo la velocidad. Las carreteras reales provienen del dataset CALM-Scenarios con sus inicios y finales recortados a nivel de carretera, y las 20 carreteras de Augsburg, Nardo, Sindelfingen y Stuttgart se reservan para evaluacion.

La senal de evaluacion es la aceleracion ponderada segun ISO 2631-1 (`a_w`), medida sobre el vehiculo de scoring calibrado contra una IMU. El modelo publicado como semilla 69 es el mejor de las cinco ejecuciones en confort a igual tiempo de viaje sobre carreteras no vistas. El repositorio incluye, ademas de la politica final, los ficheros de normalizacion y todos los ajustes de entrenamiento (agente, recompensa, entorno, previsualizacion, curriculum y recorte de escenarios), lo que permite reproducir el entrenamiento.

## Capacidades

- Recomendacion de velocidad de paso sobre badenes dentro de un rango continuo entre 8 km/h y la velocidad del escenario.
- Minimizacion de la aceleracion ponderada ISO 2631-1 en el semivehiculo, es decir, control explicito del confort de marcha.
- Mantenimiento de un objetivo de velocidad media mediante un controlador que ajusta el peso del termino de velocidad de la recompensa.
- Generalizacion a carreteras reales no vistas durante el entrenamiento (20 escenarios reservados de cuatro ciudades).
- Uso de previsualizacion del terreno: los tres picos de baden mas cercanos en los proximos 40 m forman parte de la observacion.
- Inferencia determinista y de coste muy bajo, apta para ejecucion en el bucle de control.
- No dispone de capacidades de generacion de texto, codigo, matematicas, vision, audio, tool calling, agentes ni razonamiento multi-paso.

## Casos de uso

- Control de confort en sistemas ADAS: el agente proporciona una consigna de velocidad a un controlador de velocidad de crucero adaptativo cuando el vehiculo se aproxima a un baden, usando la previsualizacion de 40 m para anticipar la maniobra.
- Vehiculos automatizados en entornos urbanos residenciales: en rutas con multitud de reductores de velocidad, el agente modula la velocidad baden a baden en lugar de aplicar una consigna fija, algo que resulta relevante para lanzaderas y robots de reparto de baja velocidad.
- Control de suspension semiactiva o activa: la senal de velocidad recomendada y el modelo de semivehiculo pueden emplearse como referencia para ajustar la rigidez de amortiguacion en el instante previo al baden.
- Transporte de pasajeros y mercancia sensible: en trayectos donde la comodidad o la integridad de la carga es critica (transporte sanitario, reparto de precision), la politica ofrece una velocidad de paso calculada en funcion de la geometria real del baden.
- Linea base de comparacion para investigacion en control: el modelo sirve como referencia reproducible (semillas, configuraciones y ficheros de normalizacion publicados) frente a controladores MPC u optimizadores clasicos en el mismo conjunto de 105 escenarios reales.
- Validacion en gemelos digitales y simuladores: dado que las carreteras de evaluacion estan publicadas y el entorno es un semivehiculo, el agente puede integrarse en simuladores para estudiar politicas de confort antes de ensayos en pista.
- Investigacion academica en aprendizaje por refuerzo aplicado a dinamica vehicular: el repositorio incluye entorno, sistema de scoring y curriculum, lo que facilita reproducir y extender el experimento con otros algoritmos o arquitecturas.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre los 105 escenarios reales, replicados sobre el vehiculo de scoring calibrado contra la IMU:

| Conjunto evaluado | a_w (m/s²) | Frente al conductor humano | Frente a velocidad constante a igual tiempo |
|---|---|---|---|
| 20 carreteras no vistas | 0,261 | -6,6 % | -1,0 % |
| Las 105 carreteras reales | 0,265 | -9,8 % | -1,0 % |

Resultados de las cinco semillas (carreteras reales, 20 escenarios no vistos; la columna de igual tiempo es relativa a una conduccion constante de la misma duracion):

| Semilla | Velocidad (km/h) | Frente al humano | Frente a constante a igual tiempo |
|---|---|---|---|
| 69 | 19,8 | -6,6 % | -1,0 % |
| 70 | 19,2 | -5,9 % | -0,5 % |
| 71 | 19,1 | -10,5 % | -0,6 % |
| 72 | 20,9 | -5,2 % | -0,6 % |
| 73 | 18,4 | -15,3 % | -0,7 % |

Frente al controlador MPC de referencia en carreteras reales, la diferencia es de aproximadamente un 1 % y no distinguible de cero; el autor indica explicitamente que la politica debe considerarse a la par del MPC, no mejor.

## Requisitos de hardware

- VRAM estimada para inferencia: practicamente despreciable (red MLP con dos capas ocultas en el actor); cabe de sobra en cualquier memoria disponible. No se publica una cifra oficial.
- GPU recomendadas: no se necesita GPU. Puede ejecutarse en CPU convencional, ya que la inferencia es una pasada de una red de dos capas mas el controlador.
- GPU de consumo: cualquier GPU, incluso integrada, es suficiente; tampoco es necesaria para el entrenamiento, aunque PPO con 5 entornos paralelos durante 10 millones de pasos se acelera con GPU.
- Opciones de despliegue: Stable-Baselines3 sobre Python con la pila de wrappers del entorno CALM (instalacion mediante `git clone --recurse-submodules https://github.com/Mohammed-Azab/CALM`); no aplica vLLM, TGI, llama.cpp ni Ollama, al no tratarse de un modelo de lenguaje. La exportacion a ONNX es tecnicamente posible, pero no se documenta en la model card.
- Latencia y throughput estimados: no disponibles. La model card no publica medidas de tiempo de inferencia.

## Comparativa con modelos similares

No se han identificado otros modelos publicados en HuggingFace de la misma categoria (politicas PPO para confort sobre badenes). La comparacion disponible es con las referencias internas del propio estudio:

| Referencia | Tipo | Entrada | Rendimiento en las 20 carreteras no vistas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CALM-PPO (semilla 69) | Politica PPO, MLP con capas 256/128 | Estado del semivehiculo y 3 picos de baden en 40 m | a_w = 0,261 m/s² (-6,6 % vs humano; -1,0 % vs constante a igual tiempo) | MIT | HuggingFace y repositorio GitHub |
| MPC de referencia | Control predictivo basado en modelo | Modelo de la carretera | Diferencia de ~1 % frente a la politica, no distinguible de cero | no disponible | Referenciado en la model card; no se publica como modelo independiente |
| Conductor humano | Referencia empirica | Percepcion humana | Linea base (0 %) | no aplica | no aplica |
| Velocidad constante a igual tiempo | Referencia de control | Ninguna (consigna fija) | Linea base (0 %) | no aplica | no aplica |

## Limitaciones y advertencias

- Modelo de semivehiculo unicamente: no cubre vehiculo completo ni dinamica lateral, y el modelo de validacion debe ser el half-car (valor por defecto).
- Dominio restringido a tramos planos con badenes; no contempla baches, curvas ni frenadas por trafico.
- En carreteras sinteticas con multiples badenes no muestra ganancia alguna frente a una conduccion a velocidad constante a igual tiempo, mientras que el MPC si mejora.
- La replica de la aceleracion se mantiene dentro del 30 % de la aceleracion medida por IMU en aproximadamente el 80 % de las carreteras, con un error mediano del 17 %.
- La ganancia frente a velocidad constante a igual tiempo es de solo el 1,0 % en las 20 carreteras no vistas y tambien del 1,0 % en el conjunto completo de 105, por lo que el beneficio practico es marginal en esos terminos.
- Las semillas difieren notablemente en la velocidad que eligen (de 18,4 a 20,9 km/h en carreteras no vistas): las que conducen mas despacio parecen mejores frente al conductor humano pero no a igual tiempo.
- Dependencia fuerte del entorno: la politica espera la observacion y la pila de wrappers del entorno CALM (estado del semivehiculo, tres picos de baden en 40 m y accion `target_speed`), de modo que no es reutilizable fuera de esa interfaz.
- No se identifican sesgos en el sentido de sesgos sociales, al no tratar datos humanos ni lenguaje; el riesgo relevante es de sobreajuste al dominio de carreteras del dataset.
- Licencia MIT, sin restricciones conocidas para uso comercial, igual que el codigo del repositorio.
- No se documentan datos de seguridad funcional, certificacion ni validacion en vehiculo real, por lo que no debe desplegarse directamente en un lazo de control de produccion sin validacion adicional.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/CALM-Dataset/CALM-PPO
- Repositorio de codigo, entorno y sistema de scoring: https://github.com/Mohammed-Azab/CALM
- Dataset CALM-Scenarios citado en la model card como origen de las carreteras reales: https://huggingface.co/datasets/CALM-Dataset/CALM-Scenarios (URL inferida a partir del espacio de nombres del autor; no confirmada en la informacion proporcionada)
- La busqueda web realizada no devolvio resultados relevantes para este modelo: todos los enlaces encontrados corresponden a la aplicacion de meditacion Calm (calm.com) y no guardan relacion con CALM-PPO.
