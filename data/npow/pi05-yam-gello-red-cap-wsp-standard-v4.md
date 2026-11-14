# npow/pi05-yam-gello-red-cap-wsp-standard-v4

## Resumen

`npow/pi05-yam-gello-red-cap-wsp-standard-v4` es un ajuste fino del modelo de robotica `lerobot/pi05_base` (PI0.5, la evolucion del modelo pi-zero de Physical Intelligence) orientado a una unica tarea manipulativa: recoger un tapon rojo y colocarlo sobre una caja negra con un brazo YAM. Lo desarrolla el usuario `npow` y se publica bajo licencia Gemma. No es un modelo de lenguaje general, sino una politica visomotora que mapea observaciones (tres camaras y estado de las articulaciones) a comandos de accion de 14 dimensiones (seis articulaciones por brazo y dos pinzas).

La particularidad tecnica es que el ajuste no se ha hecho por gradiente descendente clasico, sino mediante *weight-space programming* (WSP): ediciones algebraicas fijas sobre las proyecciones de entrada y salida de acciones del modelo base, sin entrenamiento ni optimizacion. El autor declara que la edicion reduce el error de accion un 57,1% (backend OpenPI nativo) y un 65,2% (backend LeRobot) respecto al modelo base, manteniendo la precision de la pinza en el 93,54%.

El modelo tiene 4.143.404.816 parametros (4,14 mil millones) y se distribuye en dos formatos de pesos: safetensors estandar para LeRobot y parametros Orbax nativos para OpenPI. El repositorio ocupa 23,2 GB. Es relevante ahora porque demuestra una via alternativa de adaptacion de politicas roboticas sin reentrenamiento, aunque sus propios resultados son exploratorios y no hay validacion en hardware real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer visomotor PI0.5 (politica de difusion/flow con solver Euler), heredada de `lerobot/pi05_base` |
| Parametros totales | 4.143.404.816 |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors y Orbax, presumiblemente float32) |
| Idiomas soportados | no disponible (modelo de robotica, no de lenguaje) |
| Licencia | gemma |
| Formato de pesos | safetensors (LeRobot) y Orbax (`params/`) para OpenPI |
| Dimension de accion | 14 (6 articulaciones + pinza por brazo) |
| Horizonte de accion | 50 comandos, evaluados los 10 primeros |
| Entradas | `observation.state`, `task`, tres imagenes: `base_0_rgb`, `left_wrist_0_rgb`, `right_wrist_0_rgb` |
| Pasos de denoising | 10 (solver Euler) |
| Frecuencia de datos | 20 Hz |
| Tamano del repo | 23,2 GB |

## Arquitectura y entrenamiento

El modelo parte de `lerobot/pi05_base`, una politica visomotora de la familia PI0.5 que combina un codificador visual con un transformer que genera secuencias de acciones mediante un proceso de difusion con solver Euler de 10 pasos. La salida son 50 comandos de accion de 14 dimensiones; las articulaciones se expresan como deltas relativos a un ancla de planificacion y las pinzas como valores absolutos.

El "entrenamiento" aqui no es tal: el autor aplica *weight-space programming* sobre el checkpoint base. La edicion principal modifica conjuntamente las proyecciones de entrada y salida de acciones (`W_in`, `b_in`, `W_out`, `b_out`) con un factor de escala fijo de 0,5 alrededor de cero para las seis coordenadas del brazo izquierdo, usando las formulas `W_in' = S^-1 W_in`, `b_in' = b_in - d S^-1 W_in`, `W_out' = W_out S`, `b_out' = b_out S`. No se usan gradientes, optimizador ni regresion sobre acciones demostradas; las filas y columnas de la pinza quedan intactas. Los factores 0,75 y 0,5 se declararon antes de las pruebas de desarrollo y el 0,5 se congelo antes de la evaluacion.

La version v4 anade una correccion estatica de compatibilidad entre backends: el pipeline de LeRobot rellena las imagenes con -1 antes de reescalar de [0,1] a [-1,1], lo que produce un borde de -3 frente al -1 de OpenPI nativo. El autor compila esa diferencia en el embedding posicional visual de LeRobot mediante `torch_position = native_position + patch_conv(2 * padding_mask)`, sin tocar el codigo de preprocesado en tiempo de ejecucion. El dataset asociado (`npow/yam-gello-red-cap-100`) contiene 60 episodios para normalizacion compartida, 20 para desarrollo y 20 para evaluacion.

## Capacidades

- Generacion de comandos de accion para un brazo robotico YAM de dos brazos en una tarea concreta: recoger un tapon rojo y colocarlo sobre una caja negra.
- Percepcion visomotora con tres camaras (vista base y dos muñecas) y estado articular de 14 dimensiones.
- Generacion de secuencias de 50 acciones con horizonte de planificacion, de las que se ejecutan las 10 primeras a 20 Hz.
- Control de pinza con precision equilibrada del 93,54% segun la evaluacion del autor.
- Compatibilidad con dos backends de inferencia: LeRobot (PyTorch/safetensors) y OpenPI nativo (JAX/Orbax) mediante el plugin de Orchestral.
- No soporta tool calling, agentes, razonamiento multi-paso, vision general, audio ni capacidades multilingues: es una politica robotica especializada, no un modelo de lenguaje.

## Casos de uso

- Manipulacion pick-and-place en laboratorio: el modelo recoge un objeto y lo deposita en una ubicacion fija; su horizonte de 50 acciones y control a 20 Hz encaja con tareas de recogida y colocacion de corta duracion.
- Investigacion en adaptacion sin entrenamiento: sirve como caso de estudio reproducible de *weight-space programming* sobre una politica preentrenada, con scripts de carga y verificacion incluidos en el repo.
- Benchmark de compatibilidad entre backends: permite comparar la inferencia en LeRobot frente a OpenPI nativo sobre el mismo checkpoint, con la correccion de padding ya compilada.
- Prototipado de pipelines de robotica con LeRobot: la carga estandar con `PI05Policy.from_pretrained` y los procesadores guardados simplifican la integracion en entornos de investigacion.
- Evaluacion offline de politicas: el protocolo de 20 episodios fijos con cuatro observaciones y tres semillas sirve como plantilla para medir error de accion frente a un modelo base.
- Docencia y demostraciones de PI0.5: al ser un ajuste pequeno y bien documentado, resulta util para explicar el flujo observacion-accion de las politicas visomotoras.
- No es adecuado para produccion industrial ni para tareas distintas de la entrenada, dado que no hay validacion en hardware ni en simulacion.

## Benchmarks y rendimiento

Resultados declarados por el autor (error cuadratico medio sobre el brazo izquierdo y la pinza en los 10 primeros comandos; 20 episodios fijos, cuatro observaciones por episodio, tres semillas de ruido):

| Backend estandar | Error base | Error editado | Error posicion fija | Reduccion vs base | Reduccion vs posicion fija |
|---|---:|---:|---:|---:|---:|
| OpenPI nativo | 0,058662 | 0,025148 | 0,027486 | 57,1% | 8,5% |
| LeRobot | 0,070437 | 0,024533 | 0,027486 | 65,2% | 10,7% |

Precision equilibrada de la pinza: 93,54% (LeRobot editado) frente a 90,90% del base emparejado. En LeRobot, el modelo mejora al base en los 20 episodios; el intervalo de confianza del 95% para la reduccion relativa de error es 54,4-74,0%. El autor advierte que los episodios tienen exposicion previa del proyecto y que los resultados son exploratorios, no un benchmark limpio. No se ha demostrado exito de recogida en simulacion ni en hardware.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada. Con 4,14 mil millones de parametros, una carga en float32 requiere del orden de 16,6 GB solo para pesos; en float16 o bfloat16, unos 8,3 GB, mas el coste de activaciones y del codificador visual.
- GPU recomendadas: no disponibles de forma explicita. Por tamano, cabria esperar A100, H100 o L40S para los backends JAX/Orbax y PyTorch; no confirmado por el autor.
- Viabilidad en GPU de consumo: no confirmada. Un modelo de 4,14 mil millones de parametros en precision reducida podria caber en tarjetas de 16-24 GB (RTX 4090, RTX A5000), pero no hay datos publicados de latencia ni de memoria real.
- Opciones de despliegue: LeRobot (`PI05Policy` con safetensors), OpenPI nativo via Orchestral (JAX, solver Euler, 10 pasos, `dtype=float32`, `matmul_precision=highest`). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `npow/pi05-yam-gello-red-cap-wsp-standard-v4` | 4,14 mil millones | no disponible | Pick-and-place de tapon rojo con YAM | gemma | Hugging Face, 0 descargas |
| `lerobot/pi05_base` | no disponible en la informacion | no disponible | Politica visomotora general PI0.5 | no disponible | Hugging Face (modelo base) |
| Alternativas de robotica comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks de otros modelos de robotica en la informacion proporcionada para establecer una comparacion cuantitativa adicional.

## Limitaciones y advertencias

- Modelo especializado en una unica tarea ("recoger el tapon rojo y colocarlo en la caja negra"); no generaliza a otras tareas ni objetos.
- No se ha demostrado exito de recogida en simulacion ni en hardware real; la evidencia es solo de acuerdo offline de acciones.
- Los resultados son exploratorios: los episodios de evaluacion tienen exposicion previa del proyecto y no constituyen un benchmark limpio.
- Los dos formatos de pesos difieren intencionadamente en el tensor posicional: Orbax conserva los parametros v3 y LeRobot incluye la correccion de borde compilada; no es una conversion bit a bit entre Torch y Orbax.
- En LeRobot es obligatorio usar los fotogramas originales en 4:3 (640x480); preescalar a cuadrado rompe la correccion posicional estatica.
- Las salidas de las articulaciones son deltas relativos al ancla de planificacion; hay que sumar el ancla medida para obtener objetivos absolutos. Las pinzas son absolutas.
- Licencia Gemma: conviene revisar los terminos de uso comercial de dicha licencia antes de cualquier despliegue productivo.
- Riesgo de alucinacion y sesgos: no evaluados en la informacion disponible; al ser un modelo de acciones, el riesgo se traduce en comandos fisicos incorrectos, con implicaciones de seguridad en un robot real.
- Sin datos de cuantizacion, latencia ni requisitos de memoria publicados.
- Repositorio con 0 descargas y 0 likes; sin validacion externa por la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/npow/pi05-yam-gello-red-cap-wsp-standard-v4
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Dataset asociado: https://huggingface.co/datasets/npow/yam-gello-red-cap-100
- Libreria LeRobot: https://github.com/huggingface/lerobot
- OpenPI: https://github.com/Physical-Intelligence/openpi
- Orchestral: no disponible (enlace no proporcionado en la informacion)
