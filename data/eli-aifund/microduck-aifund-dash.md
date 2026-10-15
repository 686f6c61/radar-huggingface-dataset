# eli-aifund/microduck-aifund-dash

## Resumen

`eli-aifund/microduck-aifund-dash` es una politica de control por aprendizaje por refuerzo (reinforcement learning) desarrollada por el usuario `eli-aifund` para el robot **microduck** de Pollen Robotics. No se trata de un modelo de lenguaje, sino de una politica de locomocion ("gait") permanente que controla al robot en una carrera de 2 metros ("2 m dash") dentro de una arena con reglas propias (linea de meta real como estado terminal, regla de caida de la arena, muros de carril y fisica nominal).

La politica se entreno con PPO sobre la propia carrera de la arena y posteriormente se ajusto con estrategias evolutivas (ES) sobre el "Arena runner". El modelo opera con una observacion de 61 dimensiones y un espacio de accion de 14 grados de libertad, a una frecuencia de control de 50 Hz. La politica se ejecuta de forma continua hasta recibir orden de parada, y se carga en una "slot" de politica del robot.

Su relevancia actual es limitada: el repositorio no acumula descargas ni likes, el tamano del repo es practicamente nulo (0.0 GB) y no se declara licencia. Aun asi, es un ejemplo representativo de politica de control ONNX lista para desplegar en un robot real mediante el stack `microduck_rl` y el daemon `robotctl`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Politica de control por aprendizaje por refuerzo (PPO con ajuste fino mediante estrategias evolutivas, ES); red neuronal exportada a ONNX |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) + `manifest.json` (schema 2 del manifiesto de politicas de microduck) |

## Arquitectura y entrenamiento

La politica se entreno en dos fases segun la model card. En primer lugar, un entrenamiento con **PPO** sobre la propia carrera de la arena del AI Fund: un "dash" de 2 metros con condicion terminal de meta real, regla de caida de la arena, muros de carril y fisica nominal. Despues, un ajuste fino con **estrategias evolutivas (ES)** ejecutado sobre el "Arena runner". El codigo de entrenamiento se encuentra en el repositorio `pollen-robotics/microduck_rl`, rama `aifund`, commit `ee780d49c`.

La politica opera a 50 Hz con una observacion de 61 dimensiones y 14 acciones. El `policy.onnx` lleva incorporado el normalizador de observaciones, de modo que la politica consume observaciones en crudo sin preprocesado externo. Se describe como una politica **perpetua**: genera una marcha continua que se mantiene hasta que se le indique lo contrario, y se carga en una "slot" de politica del robot. No se especifica el numero de parametros de la red, el volumen de datos de entrenamiento ni el numero de iteraciones de PPO o de la fase de ES.

## Capacidades

- Generacion de una marcha (gait) de locomocion perpetua para el robot microduck.
- Control de locomocion a partir de una observacion de 61 dimensiones y 14 acciones, a 50 Hz.
- Ejecucion de una carrera de 2 metros en la arena definida, con gestion de linea de meta como estado terminal.
- Aplicacion de reglas de la arena: deteccion de caida, respeto de muros de carril y fisica nominal.
- Consumo directo de observaciones en crudo (normalizador integrado en `policy.onnx`).
- Carga en una slot de politica del robot mediante el comando `robotctl policy load`.
- No se documentan capacidades de tool calling, agentes, vision, audio, generacion de texto ni multilingues, al no ser un modelo de lenguaje.

## Casos de uso

- Locomocion continua del microduck: la politica genera una marcha perpetua que mantiene al robot desplazandose hasta que se le ordena parar, adecuada para demostraciones de marcha estable.
- Carrera de 2 metros en arena de competicion: se usa directamente como agente de control para completar el "dash" respetando la linea de meta como estado terminal.
- Pruebas de fisica nominal en simulador o banco de pruebas: sirve como referencia de politica entrenada bajo condiciones nominales declaradas (sin perturbaciones externas), util para comparar degradacion al introducir ruido.
- Investigacion en PPO + ES: constituye un ejemplo de ajuste fino de una politica de PPO con estrategias evolutivas sobre un "Arena runner", reutilizable como punto de partida metodologico.
- Despliegue embarcado en el microduck: al ser un `policy.onnx` con normalizador integrado y manifiesto schema 2, se carga en una slot y se ejecuta en el robot sin pipeline adicional.
- Educacion y divulgacion en robotica: politica de control sencilla (61-D observacion, 14 acciones) que ilustra el ciclo completo de entrenamiento RL, exportacion a ONNX y despliegue en un robot de bajo coste.
- Referencia para ajuste fino de politicas de carril: el respeto de muros de carril y la regla de caida la convierten en base para variantes con obstaculos o pistas modificadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas numericas (tiempo de carrera, tasa de exito, recompensa media, distancia recorrida) ni comparacion con otras politicas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El tamano del repositorio se declara como 0.0 GB, coherente con una red de politica muy pequena (entrada de 61 dimensiones y salida de 14 acciones), aunque no se confirma la cifra.
- GPU recomendadas: no disponibles. Al ser un `policy.onnx` orientado a despliegue embarcado, es previsible que se ejecute en CPU, si bien la informacion proporcionada no lo especifica.
- Compatibilidad con GPU de consumo: no disponible. Por la naturaleza y el tamano del artefacto, es plauso que no requiera GPU dedicada, pero no se confirma.
- Opciones de despliegue: carga en el robot mediante `robotctl policy load <slot> eli-aifund/microduck-aifund-dash`, usando el runtime `microduck` (libreria declarada) y ONNX Runtime. No se documentan otros backends (vLLM, llama.cpp, Ollama, TGI no aplican al no ser un modelo de lenguaje).
- Latencia y throughput: no disponibles. El unico dato de temporizacion declarado es la frecuencia de control de 50 Hz.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye otros modelos comparables de la misma categoria (politicas de locomocion para microduck u otros robots), ni datos de rendimiento que permitan una comparacion objetiva.

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles. Al ser una politica de control entrenada en una arena concreta, es probable que tenga un sesgo hacia las condiciones especificas de entrenamiento (fisica nominal, muros de carril, ausencia de perturbaciones), aunque no se documenta explicitamente.
- Riesgo de alucinacion: no aplica, no es un modelo generativo de lenguaje.
- Limitaciones de contexto o idioma: no aplica; el modelo no procesa lenguaje ni tiene ventana de contexto.
- Restricciones de licencia para uso comercial: la licencia no esta declarada en la informacion disponible, por lo que no puede confirmarse su uso comercial. Debe verificarse en el repositorio antes de cualquier despliegue en produccion.
- Generalizacion limitada: la politica esta entrenada para una tarea concreta (carrera de 2 metros con reglas de arena especificas) y no se documenta su comportamiento fuera de ese escenario.
- Despliegue condicionado al ecosistema microduck: requiere el daemon `robotctl` y la libreria `microduck`; no es portable directamente a otros robots sin reentrenamiento.
- Ausencia de pruebas publicadas: sin descargas, likes ni metricas, no hay evidencia externa de su rendimiento real en hardware.
- Manifiesto de politica: la integracion depende del esquema 2 del manifiesto de politicas de microduck, por lo que cambios de esquema en el daemon podrian afectar la carga.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/eli-aifund/microduck-aifund-dash
- Repositorio del robot microduck: https://github.com/pollen-robotics/microduck
- Repositorio de entrenamiento: `pollen-robotics/microduck_rl` (rama `aifund`, commit `ee780d49c`)
- Documentacion del manifiesto de politicas: `docs/policy-manifest.md` del repositorio del daemon de microduck
- No se han encontrado papers, blogs ni demos adicionales en la busqueda web proporcionada.
