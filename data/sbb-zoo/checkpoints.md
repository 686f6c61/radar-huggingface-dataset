# sbb-zoo/checkpoints

## Resumen

`sbb-zoo/checkpoints` no es un modelo generativo, sino un repositorio de checkpoints entrenados del SNN Backdoor Benchmark, un banco de pruebas para ataques de *backdoor* y defensas sobre redes neuronales de impulsos (SNN, *spiking neural networks*) alimentadas con datos neuromorficos. Lo publica la organizacion `sbb-zoo` como artefacto asociado al repositorio de codigo de Gorka Abad, y su funcion es permitir la reproduccion exacta de cada celda de resultados del benchmark: cada checkpoint se nombra con un hash que depende de todos los factores que determinan el artefacto (version del benchmark, ataque, defensa, dataset, semilla, etc.).

El contenido son clasificadores de imagenes de eventos entrenados sobre N-MNIST, DVS128 Gesture y CIFAR10-DVS. Por cada configuracion se publican variantes como el modelo limpio (`clean_model`), el modelo envenenado (`model`), el modelo tras aplicar una defensa (`defended_model`), el trigger aprendido (`trigger.safetensors`) y, en defensas de deteccion, un veredicto en JSON. Los pesos van en `safetensors` acompanados de un `checkpoint.json` con la arquitectura, la forma de entrada, el numero de clases y el sha256 de los pesos; no hay ficheros pickle.

Su relevancia es acotada pero importante: no sirve para desplegar nada, sino para que investigadores en seguridad de hardware neuromorfico puedan verificar resultados publicados sin reentrenar, comparar ataques y medir defensas sobre exactamente los mismos pesos. El propio autor advierte que la mayoria de estos modelos estan envenenados a proposito y no deben desplegarse.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal de impulsos (SNN); la arquitectura concreta de cada checkpoint figura en su `checkpoint.json` (no disponible en la informacion proporcionada) |
| Parametros totales | No disponible; varia por checkpoint y no se publica el recuento |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica: son clasificadores de imagenes de eventos, no modelos de lenguaje |
| Tipos de cuantizacion | No disponible; los pesos se distribuyen en el formato entrenado (safetensors), sin variantes GGUF/AWQ/GPTQ publicadas |
| Idiomas soportados | No aplica (entrada no textual) |
| Licencia | MIT para el codigo y los pesos; los datasets (N-MNIST, DVS128 Gesture, CIFAR10-DVS) conservan sus licencias propias |
| Formato de pesos | `safetensors` (`model.safetensors`), mas `checkpoint.json`; opcionalmente `trigger.safetensors` y `defense.safetensors`; veredictos de deteccion en JSON; sin pickle |
| Entrada | Forma de entrada declarada en `checkpoint.json` por checkpoint (no disponible en la informacion proporcionada) |
| Numero de clases | Declarado en `checkpoint.json` por checkpoint (no disponible en la informacion proporcionada) |
| Datasets de entrenamiento | N-MNIST, DVS128 Gesture, CIFAR10-DVS |
| Version del benchmark referenciada | 0.9.0 (segun el ejemplo de uso de la model card) |
| Tamano del repositorio | 0.0 GB reportados por HuggingFace (no refleja el conjunto completo de checkpoints) |
| Descargas / likes | 0 descargas, 1 like en el momento de la consulta |

## Arquitectura y entrenamiento

Cada artefacto es una red neuronal de impulsos que procesa datos neuromorficos en forma de eventos y resuelve una tarea de clasificacion. El repositorio no impone una unica arquitectura: el `checkpoint.json` de cada carpeta registra arquitectura, forma de entrada, numero de clases y sha256 de los pesos, de modo que la red concreta se reconstruye a partir de ese fichero. Los tres datasets cubiertos son N-MNIST, DVS128 Gesture y CIFAR10-DVS, es decir, vision basada en sensores de eventos (camaras DVS) en lugar de fotogramas RGB convencionales.

El entrenamiento no busca un modelo de proposito general, sino generar los pares necesarios para estudiar ataques de *backdoor*: un modelo limpio de referencia (`clean_model`), un modelo entrenado con un trigger inyectado (`model`), el trigger aprendido cuando el ataque lo produce (`trigger.safetensors`), y el resultado de aplicar una defensa sobre el modelo envenenado (`defended_model`), con el estado adicional que anada la defensa en `defense.safetensors` o un veredicto JSON si la defensa es de deteccion. No se especifican en la informacion disponible el numero de tokens o ejemplos vistos, la composicion exacta de los datasets, ni si se empleo RLHF/DPO (carente de sentido en este dominio). Cada tarjeta de ataque y defensa del repositorio de codigo cita el paper correspondiente.

## Capacidades

- Clasificacion de imagenes de eventos neuromorficos en las tres tareas del benchmark (N-MNIST, DVS128 Gesture, CIFAR10-DVS).
- Reproduccion determinista de resultados publicados: mismo checkpoint, misma version del benchmark y mismo commit producen la misma celda del leaderboard.
- Materializacion de ataques de *backdoor*: pesos envenenados listos para evaluar, con el trigger aprendido cuando aplica.
- Evaluacion de defensas: modelos ya defendidos y estados de defensa (`defense.safetensors`) para comparar mitigaciones sobre una misma base.
- Soporte de defensas de deteccion mediante veredictos en JSON, lo que permite medir tasas de deteccion sin reejecutar el entrenamiento.
- Integracion con el CLI del benchmark (`sbb zoo pull`, `sbb reproduce`) para descargar y reejecutar celdas.
- No ofrece generacion de texto, razonamiento, codigo, matematicas, vision general, tool calling, capacidades de agente ni soporte multilingue.

## Casos de uso

- Reproducibilidad de articulos: descargar el checkpoint citado por un resultado y reejecutar `sbb reproduce results/0.9.0/<key>.json` para verificar que la cifra publicada se obtiene con los mismos pesos, sin reentrenar.
- Evaluacion comparativa de defensas: cargar el mismo `model` envenenado y aplicar distintas defensas publicadas, comparando el `defended_model` resultante frente al `clean_model` para medir la perdida de exactitud limpia.
- Investigacion en deteccion de backdoors: usar los veredictos JSON y los triggers aprendidos como material de referencia para entrenar o validar detectores sobre SNN.
- Docencia en seguridad de IA neuromorfica: montar practicas con pares limpio/envenenado ya entrenados, evitando el coste de entrenar SNN desde cero en cada sesion.
- Desarrollo de contramedidas para hardware neuromorfico: analizar como se comporta un trigger sobre datos de eventos reales (DVS) y disenar filtrado o saneado de pesos especifico para SNN.
- Auditoria de pipelines de evaluacion: comprobar que el harness de un tercero reproduce las celdas del leaderboard con los pesos publicados y detectar discrepancias de preprocesado o de forma de entrada.
- Estudio de transferibilidad de ataques: comparar el mismo ataque entre N-MNIST, DVS128 Gesture y CIFAR10-DVS usando los checkpoints ya generados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Las cifras del SNN Backdoor Benchmark se consultan en el leaderboard del proyecto, no en esta model card. Los datos que si constan por checkpoint son estructurales, no de rendimiento:

| Campo en `checkpoint.json` | Contenido | Valor en la informacion disponible |
|---|---|---|
| Arquitectura | Definicion de la red | No disponible |
| Forma de entrada | Dimensiones del tensor de eventos | No disponible |
| Numero de clases | Clases de salida de la tarea | No disponible |
| sha256 | Huella de los pesos | No disponible |
| Exactitud limpia / tasa de exito del ataque | Metricas del benchmark | No disponible en la model card; consultar leaderboard |

## Requisitos de hardware

- VRAM estimada: no disponible en la informacion proporcionada. Por el tipo de tarea (clasificacion de eventos con entradas de baja resolucion frente a modelos de lenguaje) es esperable que los checkpoints sean ligeros, pero no hay cifras publicadas y no deben asumirse.
- GPU recomendadas: no disponibles. No se documentan requisitos de A100, H100 ni RTX 4090.
- GPU de consumo: previsiblemente viable en tarjetas consumer e incluso en CPU para inferencia puntual, aunque es una inferencia por el dominio del problema y no un dato del autor.
- Despliegue: el cauce previsto es el repositorio del benchmark, no servidores de inferencia. Flujo documentado: `git clone https://github.com/GorkaAbad/SNN-Backdoor-Benchmark`, `uv sync`, `uv run sbb zoo pull 0.9.0 --revision <commit>`, `uv run sbb reproduce results/0.9.0/<key>.json`. Requiere `uv` y el entorno de Python del proyecto.
- No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI, que ademas no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se han identificado en la informacion proporcionada modelos alternativos comparables con los que contrastar parametros, contexto, rendimiento o licencia; se indica "no disponible". Como referencia interna, el repositorio incluye por configuracion estas variantes, que no son alternativas sino artefactos del mismo benchmark:

| Variante | Clave en el resultado | Contenido |
|---|---|---|
| Modelo limpio | `clean_model` | Pesos entrenados sin trigger, referencia de exactitud |
| Modelo envenenado | `model` | Pesos con backdoor inyectado |
| Modelo defendido | `defended_model` | Pesos tras aplicar la defensa evaluada |
| Trigger aprendido | `trigger.safetensors` | Patron de ataque cuando el metodo lo genera |
| Estado de defensa | `defense.safetensors` | Parametros anadidos por la defensa |
| Veredicto de deteccion | JSON | Decision de una defensa de deteccion |

## Limitaciones y advertencias

- La mayoria de los modelos estan envenenados de forma deliberada; el autor indica explicitamente que no se desplieguen en produccion.
- No son modelos de proposito general: no generan texto, no razonan, no soportan tool calling ni agentes, y su unica salida es una clase sobre datos de eventos.
- El rendimiento solo es interpretable dentro del benchmark: fuera de N-MNIST, DVS128 Gesture y CIFAR10-DVS no hay garantia de comportamiento ni de que las metricas se mantengan.
- La licencia MIT cubre codigo y pesos, pero los datasets de origen mantienen sus propias licencias; el uso comercial de los datos requiere revisar cada una.
- Cada ataque y defensa tiene su propio paper y condiciones de reproduccion; mezclar checkpoints de versiones distintas del benchmark invalida la comparacion.
- Para reproducir exactamente hay que fijar el commit con `--revision`; usar la ultima revision puede cambiar el artefacto asociado a una clave.
- El repositorio reporta 0.0 GB y 0 descargas: conviene verificar la descarga completa de cada carpeta (`model.safetensors` mas `checkpoint.json`) antes de evaluar.
- No hay ficheros pickle, lo que reduce el riesgo de ejecucion de codigo arbitrario al cargar, pero el sha256 de `checkpoint.json` debe comprobarse para descartar pesos manipulados.
- No se documentan sesgos, tasas de alucinacion ni cobertura idiomatica porque no aplican a este tipo de modelo; cualquier afirmacion en ese sentido seria especulativa.

## Enlaces

- HuggingFace: https://huggingface.co/sbb-zoo/checkpoints
- Repositorio del benchmark: https://github.com/GorkaAbad/SNN-Backdoor-Benchmark
- Leaderboard: https://gorkaabad.github.io/SNN-Backdoor-Benchmark/
- Papers de ataques y defensas: citados en cada tarjeta del repositorio del benchmark (no disponibles en la informacion proporcionada)
- Demos: no disponibles
