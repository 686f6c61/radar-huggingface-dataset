# Donghyun1228/pi05-libero-support-unified-v1a1-yaw30-n50000-10000-20261016

## Resumen

El modelo `pi05-libero-support-unified-v1a1-yaw30-n50000-10000-20261016` es un checkpoint de politica robotica (vision-language-action) publicado por el usuario Donghyun1228 en Hugging Face bajo la libreria `openpi`. Se trata de una adaptacion de la familia pi0.5 orientada al benchmark LIBERO, entrenada mediante un esquema de ajuste fino parcial en el que solo se congelan las hojas del LLM base y se entrenan los modulos de vision, el experto completo y las proyecciones de accion y tiempo. El modelo esta pensado para el modelado de dinamica inversa (inverse dynamics) sobre transiciones de estado, no para conversacion ni generacion de texto general.

La relevancia del checkpoint reside en su protocolo experimental: parte de un modelo fuente (`pi05-libero-support-probe-source-n50000-10000-20261015`), continua desde la actualizacion 5000 conservando pesos crudos, estado del optimizador y EMA, y finaliza en 10000 actualizaciones con el paso 9999 sin EMA en BF16. El autor reporta una evaluacion completa en LIBERO con 1596 exitos sobre 2000 episodios (79,8 %), 40 tareas y 50 intentos por tarea, ejecutada con 32 clientes concurrentes sobre una unica GPU fisica.

El repositorio ocupa 7,7 GB y utiliza licencia Apache 2.0. No se han publicado datos sobre parametros totales, contexto, cuantizaciones ni idiomas, por lo que la ficha marca esos campos como no disponibles en lugar de estimarlos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) de la familia openpi/pi0.5, con LLM base congelado, torre de vision, experto y proyecciones de accion/tiempo (no se detalla la topologia interna) |
| Parametros totales | no disponible (repositorio de 7,7 GB) |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (se menciona inferencia en BF16) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | no disponible (libreria `openpi`) |

## Arquitectura y entrenamiento

El modelo sigue el esquema de "unified LLM-frozen adaptation": unicamente se congelan las nueve hojas del LLM base, mientras que la torre de vision (23 hojas), el experto completo (11 hojas) y las proyecciones de accion y tiempo (8 hojas) se entrenan con el mismo multiplicador de actualizacion AdamW nativo. El ajuste es una continuacion exacta desde la actualizacion 5000 del modelo fuente, preservando pesos crudos, estado del optimizador y EMA, saltando los indices del sampler ya consumidos y continuando el RNG nativo del modelo en funcion del paso global. Los hiperparametros reportados son batch 32, semilla 42, learning rate 1·10⁻⁵, warmup de 500 pasos y 10000 actualizaciones totales.

El objetivo de entrenamiento es una perdida de dinamica inversa (IDM) sobre la media de las 31 coordenadas rellenadas, excluyendo explicitamente la coordenada 6 de la pinza. Las entradas y salidas conservan las siete dimensiones (seis grados de libertad mas control de pinza) y se mantienen la normalizacion original y la muneca del modelo fuente. Los datos proceden del dataset `Donghyun1228/libero-support-random-waypoint-300k-yaw30-20261015` (300 000 waypoints aleatorios con yaw de 30 grados), del que se consumen 50 000 fotogramas en este entrenamiento. El checkpoint liberado es el paso 9999 crudo, sin EMA, para inferencia en BF16.

## Capacidades

- Generacion de acciones roboticas de 7 dimensiones (6 grados de libertad mas pinza) a partir de observaciones visuales y de estado.
- Modelado de dinamica inversa: inferencia de acciones a partir de transiciones de estado en el benchmark LIBERO.
- Manipulacion robotica en las cuatro suites de LIBERO (40 tareas evaluadas) mediante el stack openpi.
- Control de pinza: aunque la coordenada 6 se excluye de la perdida IDM, las entradas y salidas de 7 dimensiones conservan el control del gripper.
- Ejecucion en simulacion MuJoCo 3.2.3 con renderizado EGL verificado por PCI/UUID.
- Servicio concurrente multi-cliente: protocolo `batched16_clients32_global_queue_v1`, con batch de servidor 16 y hasta 32 clientes concurrentes mediante cola global.
- Soporte de tool calling, agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Capacidades de vision, audio o modo thinking: no disponibles como tales; la torre de vision forma parte del pipeline pero solo se describe su ajuste, no sus tareas.

## Casos de uso

- Investigacion en manipulacion robotica sobre LIBERO: el modelo puede evaluarse en las 40 tareas del benchmark con 50 intentos por tarea, lo que permite obtener tasas de exito comparables entre checkpoints dentro de un mismo protocolo (en este caso, 1596/2000).
- Ajuste fino con LLM congelado: sirve como referencia para estudiar que ocurre cuando solo se entrena vision, experto y proyecciones, manteniendo intacto el LLM base; util para analisis de transferencia y de coste de entrenamiento.
- Modelado de dinamica inversa: genera acciones a partir de pares de estados en simulacion, un componente habitual en pipelines de aprendizaje por imitacion y en la construccion de recompensas o datos auxiliares.
- Evaluacion reproducible de serving: el protocolo de cola global con 32 clientes y batch 16 permite medir el comportamiento del servidor bajo carga concurrente y detectar cuellos de botella de inferencia en una unica GPU.
- Generacion de datos con control de orientacion: al haberse entrenado con yaw de 30 grados sobre waypoints aleatorios, es adecuado para experimentos que requieren variabilidad controlada de orientacion final del efector.
- Investigacion en brecha sim-a-real: el modelo parte de datos sinteticos de LIBERO, por lo que es un candidato razonable para medir cuanto rendimiento se pierde al transferir politicas aprendidas en simulacion a un robot fisico.
- Comparacion de checkpoints predefinidos: dado que el autor indica que las comparaciones son predefinidas y que no se aplica early stopping basado en politica, el modelo es util en estudios que requieren seleccion no sesgada de checkpoints.

## Benchmarks y rendimiento

| Benchmark | Configuracion | Resultado |
|---|---|---|
| LIBERO | 40 tareas x 50 intentos, envseed 7, 2000 episodios | 1596/2000 exitos (79,8 %) |
| LIBERO (entorno) | MuJoCo 3.2.3, renderizado EGL con ubicacion PCI/UUID verificada | 0 errores de rollout reportados |

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; el repositorio ocupa 7,7 GB y la inferencia se realiza en BF16.
- GPU utilizada en la evaluacion: una unica GPU fisica, modelo no especificado, con batch de servidor 16 y 32 clientes concurrentes.
- GPU recomendadas: no disponible. Por el tamano del repositorio, es probable que requiera una GPU con soporte nativo de BF16 y al menos 16 GB de memoria si se carga el modelo completo en precision de inferencia, pero este dato no esta confirmado por el autor.
- Compatibilidad con GPU de consumo: no confirmada.
- Opciones de despliegue: libreria `openpi` (servidor de politica); el protocolo observado es `batched16_clients32_global_queue_v1` con cola global de 32 clientes. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a este tipo de politica VLA.
- Entorno de simulacion: MuJoCo 3.2.3 con renderizado EGL sin pantalla.
- Latencia y throughput: no disponibles; solo se documenta la configuracion de concurrencia (32 clientes, batch 16) y la ausencia de errores de rollout.

## Comparativa con modelos similares

No se dispone de datos comparativos verificables en la informacion proporcionada. El modelo pertenece a la familia openpi (pi0/pi0.5) y comparte linaje con su modelo fuente, pero no se han publicado en esta ficha cifras de parametros, contexto o rendimiento de las alternativas.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| `pi05-libero-support-unified-v1a1-yaw30-n50000-10000-20261016` | no disponible | no disponible | apache-2.0 | Hugging Face, 0 descargas |
| `pi05-libero-support-probe-source-n50000-10000-20261015` (modelo fuente) | no disponible | no disponible | no disponible | Hugging Face |
| Otras variantes de la familia openpi | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Dominio restringido: entrenado sobre waypoints aleatorios con yaw de 30 grados y 50 000 fotogramas; el rendimiento fuera de esa distribucion de orientacion y de las suites de LIBERO no esta caracterizado.
- Brecha simulacion-realidad: todos los datos y la evaluacion son sinteticos (LIBERO, MuJoCo 3.2.3); no hay evidencia de transferencia a un robot fisico.
- Perdida IDM sesgada: la coordenada 6 (pinza) se excluye del objetivo de dinamica inversa, por lo que la prediccion de esa dimension puede degradarse en tareas de IDM aunque el control de pinza siga presente en la interfaz.
- Reproducibilidad limitada: el autor advierte de que los cambios numericos por forma de batch y la asignacion de RNG compartido dependiente de la peticion forman parte del protocolo registrado, lo que dificulta reproducir exactamente los resultados fuera de esa configuracion.
- Dependencia del entorno: requiere MuJoCo 3.2.3 y renderizado EGL con colocacion PCI/UUID verificada; desviarse de ese stack puede alterar los resultados.
- Checkpoint unico: solo se libera el paso 9999 crudo sin EMA, y la seleccion de checkpoint esta predefinida sin early stopping basado en politica.
- Sin validacion comunitaria: 0 descargas y 0 me gusta en el momento de la consulta; no hay revision independiente.
- Idiomas y sesgos: no disponibles; al ser un modelo de accion y no de lenguaje, no se documentan sesgos linguisticos, pero tampoco se documentan sesgos de politica.
- Restricciones de licencia: Apache 2.0 permite uso comercial y modificacion, siempre que se conserven los avisos de copyright y licencia y se indiquen los cambios; no se declaran restricciones adicionales.
- Riesgo de acciones incoherentes: como toda politica aprendida, puede producir trayectorias fuera de distribucion ante observaciones no vistas; no se reportan tasas de fallo por tipo de tarea.
- Inferencia en BF16: requiere hardware con soporte de bfloat16.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Donghyun1228/pi05-libero-support-unified-v1a1-yaw30-n50000-10000-20261016
- Modelo fuente: https://huggingface.co/Donghyun1228/pi05-libero-support-probe-source-n50000-10000-20261015
- Dataset de entrenamiento: https://huggingface.co/datasets/Donghyun1228/libero-support-random-waypoint-300k-yaw30-20261015
- Libreria declarada (`openpi`): repositorio de Physical Intelligence, https://github.com/Physical-Intelligence/openpi
- Paper, blog o demo especificos del modelo: no disponibles.
