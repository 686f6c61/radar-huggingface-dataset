# Linxiushen/MicroCat-Policies

## Resumen

MicroCat-Policies es un repositorio de politicas de control para robotica que contiene dos modelos ONNX compactos entrenados con aprendizaje por refuerzo (PPO) para el prototipo de simulacion MicroCat, un cuadrupedo de 16 actuadores. Lo desarrolla Linxiushen (Leon S Kennedy) y se publica bajo licencia Apache-2.0. No es un modelo de lenguaje: es un par de controladores de locomocion y recuperacion de postura que se ejecutan en bucle cerrado sobre MuJoCo.

El repositorio incluye dos artefactos: `microcat_walk.onnx`, para locomocion comandada por velocidad, y `microcat_recover.onnx`, para recuperacion aprendida de postura tras una caida. Cada uno va acompanado de un manifiesto schema-2 que documenta el orden exacto de las observaciones, el orden de las articulaciones, la escala de accion y la frecuencia de control. La interfaz es fija: entrada `obs` de tipo float32 con forma `[1, 66]` y salida `actions` float32 con forma `[1, 16]`.

Su relevancia es acotada pero concreta: sirve como referencia reproducible de un pipeline completo de RL en simulacion (entrenamiento PPO/GAE con aleatorizacion de dominio, normalizacion embebida en el grafo ONNX y validacion numerica frente a PyTorch) y como banco de pruebas para integrar controladores roboticos como herramientas de agentes. El autor advierte explicitamente de que no se ha validado sobre ningun robot fisico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Politica de control neuronal exportada a ONNX; entrenada con PPO/GAE en entorno MuJoCo (arquitectura interna de la red no disponible) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje; observacion de 66 valores float32) |
| Tipos de cuantizacion | no disponible (pesos exportados en ONNX float32) |
| Idiomas soportados | no aplica (modelo de control robotico, sin capacidades linguisticas) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (ejecutable con onnxruntime) |

Especificaciones adicionales de la interfaz:

| Parametro | Valor |
|---|---|
| Entrada | `obs`: float32, forma `[1, 66]` |
| Salida | `actions`: float32, forma `[1, 16]` |
| Frecuencia de control | 50 Hz objetivo |
| Frecuencia de fisica | MuJoCo a 200 Hz |
| Normalizacion | embebida en el grafo ONNX |
| Semantica de accion | offsets de posicion articular (no comandos de servo en crudo) |
| Escala de accion | 0.5, con recorte y limites de tasa aplicados en el runtime |
| Manifiesto | schema-2 (`*.manifest.json`) con layout de observacion, orden de articulaciones, escala y tasa de control |
| Tamano del repo | 0.0 GB |

## Arquitectura y entrenamiento

Las politicas se entrenaron con PPO y GAE (generalized advantage estimation) en un entorno MuJoCo personalizado que se ejecuta en CPU. El entrenamiento incorpora aleatorizacion de dominio sobre friccion, masa, ganancias, ruido de observacion y retardo de accion, lo que busca robustez frente a variaciones del entorno simulado. La normalizacion de observaciones esta horneada dentro del grafo ONNX, de modo que el runtime no necesita replicarla, y la exportacion incluye comprobaciones de concordancia numerica contra la implementacion original en PyTorch.

El vector de observacion de 66 dimensiones combina giroscopio, gravedad proyectada, posiciones articulares relativas a la pose de reposo, velocidades articulares, acciones previas, comandos de cuerpo/cabeza/cola/velocidad y un reloj de marcha bidimensional. El orden exacto de estos componentes es critico y viene definido en el manifiesto. La salida de 16 valores representa offsets de posicion articular que el runtime transforma aplicando la pose de reposo documentada, la escala de 0.5, recorte y limites de tasa antes de enviarlos al simulador. La arquitectura interna de la red (capas, anchuras, activaciones) no se detalla en la informacion disponible.

## Capacidades

- Locomocion comandada por velocidad: `microcat_walk.onnx` genera patrones de marcha a partir de comandos de velocidad y un reloj de marcha de dos dimensiones.
- Movimiento lateral y giro: las comprobaciones de runtime en simulacion cubren desplazamiento lateral y rotacion, ademas de la marcha frontal.
- Recuperacion de postura: `microcat_recover.onnx` implementa una politica aprendida para recuperar la postura tras una caida forzada.
- Gestos predefinidos: el repositorio fuente incluye nueve clips de gestos, pero son keyframes escritos a mano, no politicas aprendidas adicionales.
- Inferencia en CPU: ambos modelos se ejecutan con onnxruntime usando `CPUExecutionProvider`, sin necesidad de GPU.
- Integracion como herramienta de agente: el autor contempla su uso en experimentos de integracion de herramientas para agentes y en la evaluacion de fronteras entre control y runtime.
- Sin capacidades de lenguaje ni vision: no hay modelo linguistico ni de percepcion incluido en estos dos ficheros de politica.

## Casos de uso

- Investigacion reproducible en RL para robotica: sirve como referencia completa de un pipeline PPO/GAE con aleatorizacion de dominio y exportacion ONNX validada numericamente, util para comparar metodologias o como punto de partida en cursos y papers.
- Banco de pruebas de integracion de herramientas para agentes: un agente puede invocar la politica como herramienta (por ejemplo, "avanza a 0.3 m/s") y evaluar como gestiona el bucle cerrado, los limites de tasa y el estado devuelto por el simulador.
- Simulacion de bucle cerrado en MuJoCo: con el runtime de MicroCat se pueden construir observaciones correctas y ejecutar episodios completos de marcha, giro y recuperacion para estudiar estabilidad y consumo de control.
- Evaluacion de fronteras control/runtime: el modelo permite estudiar donde acaba la politica y empieza el runtime (pose de reposo, escala, recorte, limites de tasa), un aspecto critico en despliegues roboticos reales.
- Docencia en robotica cuadrupeda: el prototipo de 16 actuadores y su interfaz simple de 66 entradas y 16 salidas facilitan explicar observaciones, acciones y relojes de marcha en un entorno controlado.
- Pruebas de robustez ante aleatorizacion: al haberse entrenado con variaciones de friccion, masa y retardo, el modelo permite experimentar con cambios de parametros fisicos en simulacion y medir la degradacion de la marcha.
- Referencia para exportacion ONNX en RL: el patron de normalizacion embebida y validacion contra PyTorch es reutilizable en otros proyectos que necesiten desplegar politicas fuera de su framework de entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks numericos en la informacion disponible. El autor menciona evaluaciones de recuperacion con semilla fija en simulacion limpia, descritas como un benchmark restringido de simulacion, pero no se proporcionan cifras en la model card. Tampoco se ofrecen datos de latencia o throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; los modelos se ejecutan en CPU con onnxruntime mediante `CPUExecutionProvider`.
- GPU recomendadas: no disponibles ni necesarias para la inferencia; el entrenamiento se realizo en CPU en un entorno MuJoCo personalizado.
- Compatibilidad con GPU de consumo: irrelevante para la inferencia; el cuello de botella es la simulacion fisica de MuJoCo, no la red.
- Opciones de despliegue: onnxruntime (Python) con el runtime de MicroCat para construir observaciones correctas y ejecutar el bucle cerrado; MuJoCo para la fisica a 200 Hz.
- Latencia y throughput: no disponibles. La politica opera a 50 Hz objetivo de control sobre fisica a 200 Hz.
- Nota: una entrada sintetica de ceros solo valida la interfaz de tensores, no constituye una observacion de sensor valida.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables de la misma categoria (politicas de control para cuadrupedos de simulacion). El autor menciona que la implementacion se inspira en el ecosistema Microduck de Pollen Robotics, pero de forma independiente y sin que se detallen comparaciones tecnicas ni de rendimiento.

## Limitaciones y advertencias

- Sin validacion en hardware: ningun robot fisico ha sido validado para esta release. No se certifican el diseno electrico, la carga de actuadores, la proteccion termica o de bateria ni la percepcion del mundo real.
- No enviar salidas crudas a actuadores fisicos: la accion es un offset de posicion articular que requiere la pose de reposo, escala, recorte y limites de tasa del runtime.
- Incompatibilidad de version: la revision posterior de 10 motores Kitbo R1 no es compatible con estas politicas de 16 actuadores.
- Benchmark restringido: las evaluaciones de recuperacion con semilla fija en simulacion limpia no establecen fiabilidad en el mundo real ni rendimiento sim-to-real.
- Dependencia del manifiesto: el orden exacto de las 66 observaciones y de las 16 articulaciones debe seguirse estrictamente; cualquier desviacion invalida la politica.
- Sin modelo de lenguaje ni vision: no debe esperarse razonamiento, dialogo ni percepcion visual de estos ficheros.
- Gestos no aprendidos: los nueve clips de gestos del repositorio fuente son keyframes escritos a mano, no politicas adicionales.
- Licencias separadas: el codigo fuente y los pesos tienen licencia distinta de la geometria y los medios del robot; este repositorio solo contiene pesos, manifiestos y documentacion originales. Verificar los limites de licencia en el repositorio fuente antes de uso comercial.
- Sesgos y alucinacion: no aplica en el sentido de modelos generativos, pero la politica puede fallar fuera de la distribucion de entrenamiento (cambios de friccion, masa o retardo mas alla de lo aleatorizado).

## Enlaces

- Hugging Face: https://huggingface.co/Linxiushen/MicroCat-Policies
- Repositorio fuente con codigo de entrenamiento, runtime y script de evaluacion: no disponible en la informacion proporcionada (el autor lo referencia sin enlace explicito)
- Paper o blog tecnico: no disponible
- Demo: no disponible
