# greecree/microduck-tug-of-war-tug-super-v9

## Resumen

`microduck-tug-of-war-tug-super-v9` es una politica de control (policy) entrenada por el usuario `greecree` para el robot cuadrupedo de bajo coste **microduck** de Pollen Robotics. No es un modelo de lenguaje: es una red neuronal compacta exportada a ONNX que mapea observaciones de 61 dimensiones a 14 acciones de control a una frecuencia de 50 Hz, pensada para ejecutarse en bucle perpetuo sobre el robot fisico o en simulacion. El modelo resuelve una tarea concreta de aprendizaje por refuerzo: el juego del tira y afloja (tug-of-war) contra un oponente, dentro de un entorno de simulacion `Mjlab-TugOfWar-MicroDuck`.

La model card describe la politica como un "Dual-mode League Counter-MLP" afinado con CEM (Cross-Entropy Method) sobre GPU frente a un gauntlet de seis oponentes. Esto sugiere una arquitectura de perceptron multicapa con dos modos de operacion y un proceso de ajuste evolutivo posterior al entrenamiento por refuerzo. El checkpoint publicado corresponde al paso 250 de un entrenamiento con 4096 entornos paralelos, semilla 1 y hasta 1000 iteraciones maximas.

El interes de esta ficha es limitado para el publico general de IA, pero relevante para quienes trabajan en robotica de bajo coste, sim2real y politicas de control ligeras desplegables en hardware embebido. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y el tamano reportado es de 0.0 GB, lo que indica un artefacto muy pequeno (compatible con inferencia en microcontrolador o SBC).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MLP (Counter-MLP de doble modo) exportado a ONNX |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (politica de control, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (se distribuye como ONNX, probablemente FP32/FP16) |
| Idiomas soportados | no aplica (no procesa lenguaje) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) + `manifest.json` (schema 2) |
| Dimension de observacion | 61 |
| Dimension de accion | 14 |
| Frecuencia de control | 50 Hz |
| Modo de ejecucion | perpetuo (gait continuo) |
| Libreria | `microduck` |
| Tamano del repositorio | 0.0 GB |

## Arquitectura y entrenamiento

La politica es una red de tipo perceptron multicapa (MLP) con dos modos de operacion, descrita por el autor como "Dual-mode League Counter-MLP". El termino "Counter" sugiere que el modelo fue ajustado para contrarrestar a un conjunto de oponentes, y "League" apunta a un esquema de entrenamiento tipo liga (posiblemente self-play con una poblacion de politicas). El ajuste final se realizo con CEM (Cross-Entropy Method) sobre GPU contra un gauntlet de seis oponentes, un procedimiento de optimizacion sin gradientes que refina los pesos de la politica para mejorar el rendimiento competitivo.

El entrenamiento por refuerzo se llevo a cabo en el entorno `Mjlab-TugOfWar-MicroDuck` (basado en `mjlab-microduck 0.1.0`), con 4096 entornos paralelos, semilla 1, hasta 1000 iteraciones y checkpoint final en el paso 250. El codigo y la configuracion estan publicados en el repositorio `green-creeper/microduck-challenges` (commit `4b675ebf4`), con instrucciones de reproduccion via `uv`. El autor advierte explicitamente que el entrenamiento no es bit-reproducible entre maquinas, por lo que repetir el proceso produce una politica comparable pero no identica. El normalizador de observaciones esta embebido en `policy.onnx`, de modo que el robot alimenta observaciones en crudo.

## Capacidades

- Control locomotor del microduck para la tarea de tira y afloja (tug-of-war) a 50 Hz.
- Operacion en bucle perpetuo: la politica no tiene condicion de terminacion propia, se ejecuta hasta que el daemon la descarga.
- Doble modo de operacion (dual-mode), presumiblemente para alternar entre estrategias de traccion o respuesta al oponente.
- Acepta observaciones en crudo de 61 dimensiones; la normalizacion esta integrada en el grafo ONNX.
- Emite 14 acciones de control compatibles con el daemon `robotctl` de microduck.
- Carga directa en una ranura de politica del robot mediante `robotctl policy load`.
- Ajustada contra seis oponentes distintos (gauntlet), lo que sugiere cierta robustez frente a estilos de oposicion variados.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingues: no es un modelo de lenguaje.

## Casos de uso

- **Demostracion de tira y afloja con microduck fisico**: cargar la politica en una ranura del daemon con `robotctl policy load` y dejar que el robot tire de una cuerda contra un oponente humano o robotico. Es el caso de uso directo para el que fue entrenada.
- **Benchmark de sim2real en robotica de bajo coste**: usar la politica como referencia para medir la brecha entre simulacion (`Mjlab-TugOfWar-MicroDuck`) y el robot real, comparando el exito de traccion en ambos dominios.
- **Evaluacion de tecnicas de ajuste con CEM**: el modelo sirve como caso de estudio de refinamiento post-RL mediante Cross-Entropy Method sobre GPU contra un gauntlet de oponentes, util para investigar metodos sin gradientes en control continuo.
- **Entrenamiento de oponentes en liga**: al estar ajustada contra seis oponentes, la politica puede usarse como sparring partner para entrenar nuevas politicas de tug-of-war en el mismo entorno `mjlab-microduck`.
- **Despliegue en hardware embebido**: al ser un ONNX de un MLP pequeno (repositorio de 0.0 GB), es candidata para ejecucion en SBC o microcontrolador junto al daemon de microduck, sin GPU dedicada.
- **Reproduccion de experimentos de RL**: el repositorio `microduck-challenges` con `uv.lock`, commit y comando documentados permite reproducir el pipeline completo (entorno, 4096 envs, semilla 1) para estudiar variabilidad entre ejecuciones.
- **Pruebas de integracion del daemon `robotctl`**: validar el esquema 2 del manifiesto de politicas (`manifest.json`) y el flujo de carga de politicas en el daemon usando este artefacto como ejemplo real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de recompensa, tasa de exito en tug-of-war, ni comparaciones cuantitativas con otras politicas.

## Requisitos de hardware

- **VRAM estimada para inferencia**: no disponible con precision; al tratarse de un MLP de 61 entradas y 14 salidas exportado a ONNX con repositorio de 0.0 GB, la huella es del orden de kilobytes a pocos megabytes, ejecutable en CPU.
- **GPU recomendadas**: no se requiere GPU para inferencia; el entrenamiento original uso GPU (CEM sobre GPU y 4096 entornos paralelos), pero no se especifica el modelo.
- **Compatibilidad con GPU de consumo**: si, cualquier GPU de consumo es sobredimensionada para inferencia; el modelo cabe en CPU de SBC.
- **Opciones de despliegue**: ONNX Runtime a traves del daemon `microduck` (`robotctl`); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplican a una politica de control).
- **Latencia y throughput**: la politica opera a 50 Hz (periodo de 20 ms por paso de control); no se publican mediciones de latencia real en el robot.

## Comparativa con modelos similares

No se dispone de informacion sobre otras politicas publicadas para microduck ni sobre modelos comparables en la misma categoria (control de tug-of-war para cuadrupedo de bajo coste). Se indica "no disponible".

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| microduck-tug-of-war-tug-super-v9 | no disponible | no aplica | no disponible | no disponible | Hugging Face (0 descargas) |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- **Licencia no especificada**: la model card no declara licencia, lo que impide determinar si el uso comercial esta permitido. Antes de cualquier despliegue productivo debe contactarse con el autor.
- **Tarea unica y estrecha**: la politica esta especializada en tug-of-war; no es una politica generalista de locomotion ni transferible a otras tareas sin reentrenamiento.
- **Sin datos de rendimiento**: no hay metricas publicadas de exito, recompensa ni robustez, por lo que no puede evaluarse su calidad objetivamente.
- **Repositorio sin traccion**: 0 descargas y 0 likes; no hay evidencia de validacion por terceros ni de uso en robots reales documentado.
- **Riesgo de sim2real gap**: entrenada en `Mjlab-TugOfWar-MicroDuck` con 4096 entornos; el comportamiento en el robot fisico puede diferir y no se documenta validacion en hardware.
- **No reproducible bit a bit**: el autor advierte que reentrenar produce pesos distintos; la reproducibilidad es estadistica, no exacta.
- **Sesgos**: no aplica en el sentido de sesgos sociales, pero la politica puede estar sobreajustada a los seis oponentes del gauntlet y degradarse frente a oponentes fuera de esa distribucion.
- **Alucinacion**: no aplica (no genera texto).
- **Idioma**: no aplica.
- **Dependencia del daemon**: requiere el ecosistema `microduck` y el esquema 2 de manifiesto; no es portable a otros frameworks de robotica sin adaptacion.

## Enlaces

- Hugging Face: https://huggingface.co/greecree/microduck-tug-of-war-tug-super-v9
- Repositorio de retos y entrenamiento: https://github.com/green-creeper/microduck-challenges (commit `4b675ebf4`)
- Proyecto microduck de Pollen Robotics: https://github.com/pollen-robotics/microduck
- Base de simulacion: `mjlab-microduck 0.1.0` (commit `981a279c6`), referenciada en la model card
- Documentacion del manifiesto de politicas: `docs/policy-manifest.md` en el repositorio del daemon (referenciada, sin URL directa en la informacion disponible)
