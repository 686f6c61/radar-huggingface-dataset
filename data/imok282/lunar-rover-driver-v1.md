# Imok282/lunar-rover-driver-v1

## Resumen

Lunar Rover Driver v1 es una politica de conduccion para rovers lunares desarrollada por Imok282 dentro del proyecto Adinfinitium, una iniciativa open source nacida como proyecto de NASA Space Apps 2026 centrada en el estudio de aterrizaje y navegacion en el polo sur lunar. El modelo utiliza una arquitectura propia denominada DriverFormer, un transformer de vision con tallo convolucional que procesa parches de 8x8 sobre recortes de 64x64 del terreno, junto con un token de estado y un token CLS, y que produce cabezas separadas de politica y de valor. Se entreno con PPO en el simulador del proyecto sobre 32 mundos (8 sitios de entrenamiento x 4 fechas) y cuenta con 11.377.354 parametros.

El modelo esta marcado como DEPRECATED por su propio autor: no alcanzo los criterios de exito pre-registrados y esta superado por el modelo scripted lunar-rover-brain (v3 y v3.1). Se mantiene publicado unicamente como registro de investigacion de un resultado negativo. En la evaluacion sobre 8 mundos reservados (ventanas centrales de Site23 y Site42 x 4 fechas, 512 rovers por mundo) solo alcanzo la reserva de hielo en el 1,7% de los casos, retorno al lander en el 0,0% y muerte en el 95,5%, frente al 19,6%, 9,3% y 86,8% de un planificador naive. En el benchmark de cuatro sitios (LM2-LM5) usado para el rover brain, el retorno fue del 0,0%.

La relevancia de este checkpoint es, por tanto, metodologica y no operativa: documenta de forma transparente un fallo de entrenamiento por colapso de politica hacia la accion "detener", y acompana la descripcion del mecanismo Dream-RSI de auto-mejora offline con compuerta de validacion. No debe emplearse para planificacion ni navegacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DriverFormer (transformer de vision): tallo convolucional, parches 8x8, token de estado, token CLS, cabezas de politica y valor; d=384, 6 capas, 8 cabezas, crop 64, stem 64 |
| Parametros totales | 11.377.354 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | Apache-2.0 |
| Formato de pesos | PyTorch (`rover_driver_mini.pt`, 45.542.971 bytes, sha256 `b66960bc…d8edc`) |

## Arquitectura y entrenamiento

DriverFormer es una red neuronal aplicada a observaciones visuales del terreno lunar. El tallo convolucional (stem de 64 canales) extrae caracteristicas que se tokenizan en parches de 8x8 sobre recortes de 64x64; a esos tokens visuales se anaden un token de estado (informacion del rover) y un token CLS. El transformer tiene dimension 384, 6 capas y 8 cabezas de atencion, y de su representacion salen dos cabezas: una de politica (acciones de conduccion) y otra de valor (estimacion de retorno), el esquema habitual en PPO. El entrenamiento se realizo con PPO sobre 8 sitios de entrenamiento y 4 fechas (32 mundos en total), con solo 144 de 800 actualizaciones completadas y sin mundo de validacion.

El checkpoint publicado corresponde a la red tras la actualizacion 1, no a una politica entrenada; la etiqueta de "mejor" checkpoint es enganosa segun el propio autor. La politica colapso a la accion "detener" y no logro exito ni una sola vez durante el entrenamiento. La model card documenta ademas el mecanismo Dream-RSI, un bucle de auto-mejora offline con compuerta estricta: se buscan fallos, se generan escenarios dificiles, se reentrena un candidato con warm start y se acepta solo si no pierde ninguna mision que el modelo actual o el respaldo fisico resuelvan (cero regresiones) y mejora la metrica de validacion congelada. Los mapas de test y el sitio del examen final nunca se usan en Dream-RSI.

## Capacidades

- Conduccion de rover en simulacion: politica de acciones para alcanzar hielo y regresar al lander sobre terreno del polo sur lunar (NASA LRO LOLA a 5 m).
- Percepcion visual del terreno mediante vision transformer sobre recortes de 64x64.
- Estimacion de valor de estado (critico PPO) ademas de la politica.
- Integracion en la cadena de modelos Adinfinitium: red de peligros -> red de iluminacion -> modelo de terreno -> rover brain -> lander pilot.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- Sin capacidades multilingues (no es un modelo de lenguaje).
- Sin modo de razonamiento (thinking), vision general, audio ni otras capacidades especiales.
- Uso limitado al estudio del fallo y a la reproducibilidad de resultados negativos.

## Casos de uso

- Estudio de resultados negativos en RL: cargar el checkpoint con `worldmodel.rover.policy.load_checkpoint` para analizar como colapsa una politica PPO hacia la accion "detener" y que senales ofrece la curva de valor.
- Reproduccion de experimentos de PPO en simulacion: comparar la configuracion de 32 mundos y 144 actualizaciones con variantes que incluyan mundo de validacion y mas actualizaciones.
- Benchmark de referencia para metodos de navegacion lunar: usar sus cifras (1,7% de llegada, 0,0% de retorno) como linea base inferior frente a planificadores naive (19,6% y 9,3%).
- Docencia en aprendizaje por refuerzo: ilustrar la importancia de la validacion, del numero de actualizaciones y de la seleccion de checkpoints con un caso real documentado.
- Investigacion sobre auto-mejora offline: emplear el bucle Dream-RSI descrito en la model card para experimentar con compuertas de cero regresiones en tareas de navegacion.
- Auditoria de model cards y transparencia: ejemplo de publicacion honesta de un fallo con metricas, hash SHA-256 y criterios de exito pre-registrados.
- Evaluacion de infraestructura de simulacion: validar el pipeline de evaluacion sobre 8 mundos reservados con 512 rovers por mundo antes de entrenar politicas nuevas.

## Benchmarks y rendimiento

Resultados en 8 mundos reservados (ventanas centrales de Site23 y Site42 x 4 fechas, 512 rovers cada uno), solo simulacion:

| Metrica | Esta politica | Planificador naive |
|---|---|---|
| Alcanzo el hielo | 1,7% | 19,6% |
| Regreso al lander | 0,0% | 9,3% |
| Murio | 95,5% | 86,8% |

En el benchmark de cuatro sitios (LM2-LM5) usado para el rover brain, el retorno fue del 0,0%. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible, ya que el modelo no es un modelo de lenguaje.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada; con 11,4 millones de parametros el modelo es muy pequeno y probablemente quepa en cualquier GPU consumer, pero no se aportan cifras oficiales.
- GPU recomendadas: no disponible.
- Cabe en GPU consumer: previsiblemente si por tamano, aunque no se confirma en la model card.
- Opciones de despliegue: carga mediante el codigo del proyecto en GitHub (`worldmodel.rover.policy.load_checkpoint`); no se documentan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de politica.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento (retorno al lander) | Licencia | Estado |
|---|---|---|---|---|---|
| Lunar Rover Driver v1 (este) | 11.377.354 | no disponible | 0,0% | Apache-2.0 | Deprecated |
| lunar-rover-brain v3 / v3.1 (Imok282) | no disponible | no disponible | no disponible (scripted, supera a este) | no disponible | Activo |
| Planificador naive (referencia del proyecto) | no aplica | no aplica | 9,3% | no disponible | Referencia |

No se dispone de datos de otros modelos comparables de conduccion de rovers lunares en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo marcado como DEPRECATED por el autor: no debe usarse para planificacion ni navegacion.
- La politica colapso a "detener" y nunca tuvo exito durante el entrenamiento.
- El checkpoint guardado es la red tras la actualizacion 1, no una politica entrenada; la etiqueta de "mejor" checkpoint es enganosa.
- Solo 144 de 800 actualizaciones completadas y sin mundo de validacion.
- Rendimiento muy inferior a un planificador naive en todas las metricas (1,7% frente a 19,6% de llegada al hielo; 0,0% frente a 9,3% de retorno).
- Todos los resultados son de simulacion o de sitios lunares reservados, no de mision real.
- No apto para vuelo, decisiones de aterrizaje ni sistemas de seguridad critica.
- Sin capacidades de lenguaje, tool calling, agentes ni multilingues.
- Licencia Apache-2.0 permite uso comercial, pero el estado deprecated y el fallo funcional desaconsejan cualquier uso en produccion.
- Riesgo de alucinacion no aplica como tal, pero la politica puede generar acciones sin sentido operativo por su colapso.

## Enlaces

- Hugging Face: https://huggingface.co/Imok282/lunar-rover-driver-v1
- Modelo sucesor (rover brain): https://huggingface.co/Imok282/lunar-rover-brain
- Familia de modelos Adinfinitium: https://huggingface.co/Imok282
- Codigo fuente y registros completos: no disponible en la informacion proporcionada (la model card menciona GitHub sin URL concreta)
- Paper o blog tecnico: no disponible
- Demo: no disponible
