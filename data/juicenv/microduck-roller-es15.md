# juicenv/microduck-roller-es15

## Resumen

`juicenv/microduck-roller-es15` es una política de control para robotica entrenada mediante estrategias de evolución (evolution strategies) sobre el robot microduck de Pollen Robotics, en su configuracion de patines (rollers). No es un modelo de lenguaje, sino una politica neuronal de locomocion que mapea observaciones de 61 dimensiones a 14 acciones, ejecutandose a 50 Hz en bucle perpetuo hasta que se le ordena lo contrario. Se distribuye como un archivo ONNX autocontenido con el normalizador de observaciones incorporado.

El modelo es un ajuste fino (finetune) del checkpoint de referencia `pollen-robotics/microduck-roller-sprint-2m-reference`, refinado por el autor (`juicenv`) en la decimoquinta ronda de busqueda de su pipeline de entrenamiento. Forma parte del ecosistema de politicas del daemon de microduck, que permite cargar politicas en slots mediante `robotctl policy load`. La relevancia actual radica en que ejemplifica el flujo de trabajo de robótica open source basado en politicas ONNX ligeras desplegables en hardware embebido.

Al tratarse de un artefacto de robotica y no de un modelo fundacional, varios parametros habituales en una ficha de LLM (contexto, idiomas, cuantizacion) no son aplicables y se indican como "no disponible". El repositorio tiene un tamano declarado de 0.0 GB, coherente con un fichero ONNX de pocos kilobytes o megabytes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Politica neuronal para robotica (no especificada; red feed-forward para control de locomocion); formato ONNX |
| Parametros totales | no disponible (repo de 0.0 GB, coherente con una red pequena) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; ventana de observacion de 61 dimensiones |
| Tipos de cuantizacion | no disponible (se distribuye como ONNX; normalizador de observaciones integrado en el propio `policy.onnx`) |
| Idiomas soportados | no aplica (modelo de control robotico, no procesa lenguaje) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) + `manifest.json` (schema 2 del manifiesto de politicas de microduck) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la topologia exacta de la red. Se trata de una politica de control que consume un vector de observacion de 61 dimensiones y produce 14 acciones, ejecutandose a 50 Hz sobre las ruedas (rollers) del robot microduck. El modelo se distribuye en formato ONNX, lo que permite su inferencia en el runtime embebido del robot sin dependencia de frameworks de entrenamiento. El normalizador de observaciones esta incrustado en `policy.onnx`, por lo que la politica consume observaciones en crudo.

El entrenamiento se realizo mediante evolution strategies (ES), no mediante aprendizaje por refuerzo basado en gradientes ni RLHF/DPO. El autor indica que la busqueda se llevo a cabo sobre el "Arena roller scorer" del pipeline `pollen-robotics/microduck_rl` (rama `hannes-ft`, commit `3c0598cae`), y que este checkpoint corresponde a la decimoquinta ronda de busqueda. El checkpoint de partida es `pollen-robotics/microduck-roller-sprint-2m-reference`, del que hereda la arquitectura; el ajuste se limita a refinar los pesos para el objetivo de sprint con patines.

## Capacidades

- Locomocion perpetua sobre patines: genera una marcha continua (gait) que se ejecuta indefinidamente hasta que se detiene la politica.
- Control de bajo nivel en tiempo real: inferencia a 50 Hz sobre 14 grados de actuacion.
- Mapeo directo observacion-accion: convierte un vector de 61 dimensiones (estado del robot y sensores) en 14 acciones de control.
- Autocontenido: incluye el normalizador de observaciones, por lo que acepta observaciones sin preprocesado externo.
- Despliegue en daemon: se integra como una politica cargable en un slot mediante `robotctl policy load`.
- No dispone de tool calling, function calling, agentes, capacidades multilingues, vision, audio ni modo de razonamiento; son capacidades no aplicables a este tipo de modelo.

## Casos de uso

- Locomocion de un robot microduck con patines: cargar la politica en un slot y ejecutarla para que el robot mantenga una marcha de sprint continua sobre rollers. Es el caso de uso principal y el unico explicitamente documentado por el autor.
- Demostracion de gait aprendida por evolution strategies: usar el checkpoint como referencia reproducible de una politica refinada en la decimoquinta ronda de busqueda para comparar con variantes anteriores del mismo pipeline.
- Base para nuevos finetunes: partir de `juicenv/microduck-roller-es15` como inicializacion de una ronda posterior de ES sobre el mismo scorer de Arena.
- Benchmark interno de scoring: evaluar la politica contra el Arena roller scorer del repo `microduck_rl` para medir la mejora frente al checkpoint de referencia.
- Pruebas de integracion del daemon: validar el flujo `robotctl policy load <slot>` y el esquema de manifiesto (schema 2) en pipelines de despliegue.
- Docencia e investigacion en robotica evolutiva: ejemplo minimo y abierto de como una politica ONNX se entrena por ES y se despliega en un robot de bajo coste.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona el uso del "Arena roller scorer" como funcion de evaluacion durante el entrenamiento, pero no aporta cifras concretas (recompensa, velocidad, distancia recorrida ni comparativas con otros checkpoints).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Dado el tamano del repo (0.0 GB) y la naturaleza del modelo (politica de control de 61 entradas y 14 salidas), es previsible que quepa en el hardware embebido del propio microduck, pero no hay datos confirmados.
- GPU recomendadas: no disponibles. No se requiere GPU para una politica de este tipo en produccion; la inferencia se realiza en el ordenador a bordo del robot.
- Compatibilidad con GPU de consumo: muy probablemente irrelevante o trivial (RTX 4090, etc. no son necesarias para una red de este tamano), aunque no hay confirmacion explicita.
- Opciones de despliegue: ONNX Runtime a traves del daemon de microduck; carga mediante `robotctl policy load <slot> <repo>`. No hay soporte indicado para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: objetivo de ejecucion a 50 Hz (periodo de 20 ms por ciclo de control). No se aportan mediciones reales de latencia.

## Comparativa con modelos similares

| Modelo | Tipo | Observaciones / acciones | Frecuencia | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| juicenv/microduck-roller-es15 | Politica RL/ES para microduck (rollers) | 61 / 14 | 50 Hz | no disponible | HuggingFace (0 descargas) |
| pollen-robotics/microduck-roller-sprint-2m-reference | Politica de referencia para microduck (rollers) | no disponible | no disponible | no disponible | HuggingFace (modelo base) |
| Otras politicas del ecosistema microduck | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparativos entre estos modelos; la comparativa se limita a la relacion de dependencia (el modelo aqui descrito es un finetune del checkpoint de referencia de Pollen Robotics).

## Limitaciones y advertencias

- Es una politica de control especifica para el robot microduck con patines; no es transferible a otros robots ni a tareas de lenguaje.
- No se especifica licencia, por lo que se desconoce si se permite uso comercial o modificaciones.
- El autor no documenta sesgos ni modos de fallo; al ser un modelo de control fisico, el riesgo relevante es el fallo de la marcha o inestabilidad, no la alucinacion.
- No hay datos publicos de rendimiento, robustez ni generalizacion a distintas superficies, cargas o condiciones del entorno.
- El repositorio muestra 0 descargas y 0 likes, y no cuenta con validacion externa; se recomienda tratarlo como un artefacto experimental.
- Depende del daemon y del esquema de manifiesto de microduck (schema 2); cambios en dicho esquema podrian romper la carga.
- El normalizador de observaciones esta incrustado: alimentar observaciones ya normalizadas externamente produciria un comportamiento incorrecto.
- La fecha de creacion/actualizacion indicada (2026) resulta anomala y conviene verificarla antes de citarla.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/juicenv/microduck-roller-es15
- Modelo base: https://huggingface.co/pollen-robotics/microduck-roller-sprint-2m-reference
- Repositorio del robot microduck: https://github.com/pollen-robotics/microduck
- Repositorio de entrenamiento RL: `pollen-robotics/microduck_rl` (rama `hannes-ft`, commit `3c0598cae`); URL publica no disponible en la informacion proporcionada.
- Documentacion del manifiesto de politicas: `docs/policy-manifest.md` en el repositorio del daemon (URL exacta no disponible en la informacion proporcionada).
