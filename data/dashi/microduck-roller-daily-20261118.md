# dashi/microduck-roller-daily-20261118

## Resumen

`dashi/microduck-roller-daily-20261118` es una politica de control robótico (policy) publicada en Hugging Face por el usuario `dashi`, diseñada para el robot cuadrúpedo de bajo coste microduck del proyecto de Pollen Robotics. No es un modelo de lenguaje: es una politica de aprendizaje por refuerzo que mapea observaciones de 61 dimensiones a 14 acciones de control a 50 Hz, pensada para ejecutar una marcha (gait) perpetua sobre ruedas (rollers) en la ranura de habilidad `walk`.

El modelo es un refinamiento (finetune) de `DenRakEiw/microduck-senate_duck_0904` y se describe como una "re-entrada diaria" de `dashi/microduck-roller-remix-r900` con una puntuación de 0.900. Se distribuye en formato ONNX con el normalizador de observaciones ya integrado en el propio grafo `policy.onnx`, de modo que el consumidor debe alimentar observaciones en bruto.

Su relevancia es acotada pero concreta: forma parte del ecosistema de politicas modulares para microduck, donde cada fichero representa una habilidad cargable en caliente mediante el daemon `robotctl`. La informacion disponible es muy limitada (repo de 0.0 GB, sin descargas ni likes, sin model card extendida ni benchmarks), por lo que esta ficha se limita a documentar lo que el autor declara explicitamente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (politica de RL para control robótico, exportada a ONNX) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (politica de control; ventana de observacion de 61 dimensiones) |
| Tipos de cuantizacion | no disponible (se distribuye como `policy.onnx`) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) y `manifest.json` (schema 2 del manifiesto de politicas microduck) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna de la red (capas, tipo de encoder, dimensiones ocultas). Lo que si se especifica es la interfaz: observacion de 61 dimensiones, 14 acciones de salida, frecuencia de control de 50 Hz, y ejecucion sobre ruedas (rollers). El normalizador de observaciones esta embebido en el grafo ONNX, por lo que el modelo espera observaciones sin preprocesar.

El entrenamiento se realizo con el repositorio `pollen-robotics/microduck_rl`, en la rama `roll-backward`, commit `83599404a`. Se trata de aprendizaje por refuerzo (tag `reinforcement-learning`) con finetune sobre `DenRakEiw/microduck-senate_duck_0904`. El autor describe el modelo como una "re-entrada diaria" de `dashi/microduck-roller-remix-r900` con puntuacion 0.900, lo que sugiere un pipeline de iteracion diaria sobre politicas previas. No se especifican numero de pasos de entrenamiento, funcion de recompensa, ni composicion del dataset de simulacion.

## Capacidades

- Generacion de una marcha perpetua sobre ruedas para el robot microduck: la politica se ejecuta de forma continua hasta que se le indique lo contrario.
- Control a 50 Hz con 14 acciones de salida a partir de 61 observaciones de entrada.
- Integracion directa con el daemon del robot mediante `robotctl policy load walk <repo>`.
- Carga en la ranura de habilidad `walk` del sistema de politicas microduck.
- Normalizacion de observaciones integrada en el propio ONNX, lo que simplifica el pipeline de inferencia.
- No soporta tool calling, agentes, razonamiento multi-paso, vision, audio ni capacidades multilingues: es exclusivamente una politica de control motor.

## Casos de uso

- Locomocion sobre ruedas en microduck: cargar la politica en la ranura `walk` con `sudo robotctl policy load walk dashi/microduck-roller-daily-20261118` para que el robot se desplace de forma continua sobre superficies con rollers.
- Demostraciones de investigacion en RL robótico: usar la politica como baseline o punto de partida para comparar con otras politicas del mismo slot y del mismo modelo base.
- Iteracion de pipelines de entrenamiento: al ser una "re-entrada diaria" de un remix previo, sirve como referencia para reproducir el flujo de entrenamiento en la rama `roll-backward` de `pollen-robotics/microduck_rl`.
- Pruebas de integracion del daemon `robotctl`: valida el flujo de carga de politicas y el esquema 2 de `manifest.json` en un robot real.
- Experimentos de finetune: al estar basado en `DenRakEiw/microduck-senate_duck_0904`, puede emplearse como punto de partida para nuevos refinamientos sobre la misma tarea.
- Evaluacion comparativa de gaits: permite contrastar el comportamiento de esta politica con otras variantes del mismo autor o de otros autores dentro del ecosistema microduck.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El unico dato numerico aportado por el autor es la puntuacion 0.900 asociada al remix de origen (`dashi/microduck-roller-remix-r900`), sin especificar la metrica ni el protocolo de evaluacion.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el tamano del repositorio es de 0.0 GB, lo que sugiere un modelo de muy pocos parametros, pero no se confirma.
- GPU recomendadas: no disponible. Al ser una politica de control a 50 Hz exportada a ONNX, es probable que pueda ejecutarse en CPU o en hardware embebido del propio robot, pero el autor no lo especifica.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: el autor solo documenta el despliegue mediante el daemon `robotctl` del ecosistema microduck, cargando el fichero `policy.onnx` con el normalizador integrado. No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo).
- Latencia y throughput: no disponibles; la frecuencia de control declarada es de 50 Hz.

## Comparativa con modelos similares

| Modelo | Tipo | Entrada / salida | Frecuencia | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `dashi/microduck-roller-daily-20261118` | Politica RL (ONNX) | 61 obs / 14 acciones | 50 Hz | no disponible | Hugging Face |
| `DenRakEiw/microduck-senate_duck_0904` | Politica RL (modelo base) | no disponible | no disponible | no disponible | Hugging Face |
| `dashi/microduck-roller-remix-r900` | Politica RL (remix previo, score 0.900) | no disponible | no disponible | no disponible | Hugging Face |

No se dispone de datos de rendimiento comparables entre estas politicas mas alla de la puntuacion 0.900 atribuida al remix de origen.

## Limitaciones y advertencias

- La licencia no esta declarada, lo que impide confirmar si el uso comercial esta permitido.
- No es un modelo de lenguaje: no procesa texto, no responde a instrucciones en lenguaje natural y no tiene capacidades de razonamiento, codigo o vision.
- La politica esta diseñada especificamente para microduck sobre rollers; su comportamiento fuera de ese hardware o superficie no esta documentado.
- Al ser una politica de RL, existe riesgo de comportamientos no deseados o inestables en condiciones no vistas durante el entrenamiento; no se documentan evaluaciones de robustez.
- No se especifican sesgos, composicion del dataset de entrenamiento ni protocolo de evaluacion, lo que dificulta auditar el modelo.
- El repositorio no tiene descargas ni likes, y el tamano reportado es de 0.0 GB, lo que puede indicar que los pesos no estan efectivamente subidos o que la informacion de Hugging Face no refleja el contenido real.
- La model card no incluye informacion sobre seguridad, parada de emergencia ni limites operativos del robot.

## Enlaces

- Hugging Face: https://huggingface.co/dashi/microduck-roller-daily-20261118
- Modelo base: https://huggingface.co/DenRakEiw/microduck-senate_duck_0904
- Repositorio microduck: https://github.com/pollen-robotics/microduck
- Repositorio de entrenamiento RL: `pollen-robotics/microduck_rl` (rama `roll-backward`, commit `83599404a`)
