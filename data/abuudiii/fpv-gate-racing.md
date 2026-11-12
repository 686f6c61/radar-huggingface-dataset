# Abuudiii/fpv-gate-racing

## Resumen

FPV gate racing es un modelo de control para drones de carreras FPV desarrollado por el usuario Abuudiii. Se trata de una red neuronal convolucional pequena (2,43 millones de parametros) que vuela un cuadricoptero a traves de un circuito de seis puertas utilizando unicamente la imagen de una camara FPV, emitiendo las cuatro ordenes de stick que daria un piloto humano (empuje y velocidades de alabeo, cabeceo y guinada) a 50 Hz.

El modelo se entrena por imitacion de un profesor basado en estado (una politica PPO que recibe 43 numeros exactos del entorno) mediante el algoritmo DAgger, sin funcion de recompensa para el alumno. Toda la fisica se simula en Crazyflow y el renderizado de camara se realiza en Project AirSim sobre Unreal Engine 5. La relevancia de este trabajo radica en que demuestra que un piloto puramente visual puede igualar practicamente a un profesor con acceso al estado privilegiado en un circuito simulado, con un 95,8 % de exito en episodios aleatorizados frente al 100 % del profesor.

El repositorio es de tipo reinforcement-learning y no contiene pesos en formato safetensors ni GGUF, sino checkpoints en Python pickle con arrays de numpy. No se declara licencia ni idiomas soportados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN (6 capas convolucionales) + MLP; el profesor es un MLP 3 x 256 con actor y critico separados |
| Parametros totales | 2,43 M (alumno) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica; entrada de 3 frames RGB de 320 x 180 (camara inclinada 20 grados arriba, 110 grados de campo de vision horizontal) mas la accion previa |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | Python pickle (`.pkl`) con arrays de numpy y valores de configuracion planos |

## Arquitectura y entrenamiento

El alumno es una red convolucional de 6 capas seguida de un MLP, con 2,43 M de parametros, que recibe los ultimos tres frames RGB de 320 x 180 y su accion anterior, y produce `[thrust, roll rate, pitch rate, yaw rate]` en el rango [-1, 1] a 50 Hz. El profesor es un MLP de 3 capas de 256 unidades con actor y critico separados, entrenado con PPO durante 6 mil millones de pasos en dos etapas de unos 13 minutos cada una en una H100 con 8.192 drones en paralelo. El profesor recibe como entrada velocidad, actitud, velocidades angulares del cuerpo, las esquinas de las dos puertas siguientes en el marco del cuerpo y la accion previa.

El alumno se entrena por imitacion supervisada del profesor con DAgger, sin recompensa. Primero se preentrena con un renderizador sintetico rapido y despues se ajusta fino sobre aproximadamente 291.000 frames de Unreal, con las ultimas tres rondas voladas por el propio alumno en Unreal. El preentrenamiento con el renderizador sintetico resulto determinante: con los mismos primeros 171.000 frames de Unreal, la red preentrenada completo tres vueltas en 24 de 24 episodios de prueba y una red entrenada desde cero no lo consiguio en ninguno. La inferencia tarda 5,8 ms por llamada en una H100, frente al paso de control de 20 ms.

## Capacidades

- Control de vuelo end-to-end a partir de imagen FPV: genera empuje y velocidades de alabeo, cabeceo y guinada a 50 Hz.
- Vuelo de circuito cerrado con historial de tres frames y realimentacion de la accion previa.
- Generalizacion a layouts de puertas aleatorizados (desviaciones de mas o menos 0,3 m y mas o menos 0,2 rad por puerta), masa, empuje, resistencia y retardo de comando por episodio.
- Vuelo de al menos tres vueltas en el 95,8 % de 192 episodios aleatorizados retenidos.
- Capacidad de imitacion de una politica profesora basada en estado privilegiado.
- No soporta tool calling, function calling, agentes multi-paso, capacidades multilingues ni modos de razonamiento; no es un modelo de lenguaje.

## Casos de uso

- Investigacion en aprendizaje por imitacion: el par profesor-alumno sirve como banco de pruebas reproducible para estudiar DAgger y el efecto del preentrenamiento con renderizadores sinteticos frente a datos fotorrealistas.
- Desarrollo de pilotos visuales para simulacion: el checkpoint del alumno puede integrarse en el bucle de Crazyflow y Project AirSim para volar el circuito Blocks y comparar politicas de control.
- Generacion de datos de entrenamiento: el profesor basado en estado puede etiquetar trayectorias a gran escala (8.192 drones en paralelo) para alimentar futuros alumnos visuales.
- Evaluacion de robustez ante aleatorizacion de dominio: el protocolo de episodios con variacion de masa, empuje, resistencia y retardo permite medir la degradacion de una politica visual de forma controlada.
- Docencia y divulgacion: el video de vuelo y el grafico de trayectorias comparadas alumno-profesor facilitan explicar la diferencia entre politicas con estado privilegiado y politicas puramente visuales.
- Base para transferencia a hardware real: aunque no se ha probado en un controlador de vuelo real, la arquitectura ligera (2,43 M de parametros, 5,8 ms en H100) es un punto de partida razonable para experimentos de simulación a realidad.

## Benchmarks y rendimiento

| Piloto | Entrada | Aleatorizado: 3 o mas vueltas (192 episodios retenidos) | Choques | Tiempo por vuelta | Circuito nominal: 3 o mas vueltas (24 episodios) |
|---|---|---|---|---|---|
| Alumno (`student/ckpt.pkl`) | 3 frames de camara + accion previa | 95,8 % (184) | 4,2 % (8) | 4,60 s | 100 % |
| Profesor (`teacher/ckpt_latest.pkl`) | estado exacto (43 numeros) | 100 % | 0 % | 4,59 s | 100 % |

Los 8 choques del alumno son impactos contra el marco de las puertas y 7 de ellos ocurren en los primeros 4 segundos, antes de la tercera puerta. El fichero `student/eval.json` cubre 216 episodios aleatorizados (96,3 % con tres vueltas); los primeros 24 repiten la semilla de una evaluacion anterior cuyos vuelos entraron en los datos de entrenamiento y quedan excluidos de la tabla (los 24 completaron tres vueltas).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el modelo tiene solo 2,43 M de parametros, por lo que el peso de los parametros es del orden de decenas de MB en precision completa.
- GPU recomendadas: H100 para el bucle de evaluacion completo (5,8 ms por llamada de inferencia); no se especifican otros modelos.
- Cabe en GPU de consumo: no disponible como dato explicito, aunque el tamano del modelo sugiere que si; no se ha verificado.
- Opciones de despliegue: carga mediante `fpv/` del repositorio de GitHub junto con `jax`, `flax` y `optax`; el vuelo en bucle cerrado requiere Crazyflow y Project AirSim (Unreal Engine 5).
- Latencia y throughput: 5,8 ms por llamada en una H100 frente a un paso de control de 20 ms a 50 Hz; no se publican cifras de throughput para otras GPU.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye otros modelos de pilotaje visual de drones comparables ni datos de referencia cruzada.

## Limitaciones y advertencias

- Un unico circuito en una unica escena de Unreal (Blocks); otra pista u otro aspecto visual no esta probado.
- Velocidad de crucero de unos 4 m/s sobre un dron simulado de clase Crazyflie (`cf21B_500`); no es pilotaje de carreras agresivo.
- Solo simulacion: no se ha ejecutado contra firmware real de controlador de vuelo ni con una camara real.
- Los checkpoints son pickles de Python; deserializarlos puede ejecutar codigo, por lo que solo deben cargarse desde una fuente de confianza.
- No se declara licencia, lo que impide conocer las condiciones de uso comercial.
- No se declaran sesgos conocidos ni tasas de alucinacion porque no es un modelo generativo de texto; el riesgo principal es el fallo de control (choques) en condiciones fuera de distribucion.
- El 4,2 % de choques del alumno se concentra en los primeros segundos del episodio, lo que sugiere fragilidad en la fase de arranque.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Abuudiii/fpv-gate-racing
- Codigo y write-up: https://github.com/Abuudiii/rl-experiments/tree/main/fpv-racing
- Crazyflow (motor de fisica): https://github.com/learnsyslab/crazyflow
- Project AirSim (renderizado en Unreal Engine 5): https://github.com/iamaisim/ProjectAirSim
- Video de vuelo: https://huggingface.co/Abuudiii/fpv-gate-racing/resolve/main/fpv_flight.mp4
