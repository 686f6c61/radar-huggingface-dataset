# fm-dev/pi05-button-order-status-d-full-gbs64-pgb8-gpu8-r4-epoch100-step8000

## Resumen

Este repositorio contiene un checkpoint de ajuste fino completo (full fine-tuning) del modelo de robotica pi0.5 del ecosistema openpi, orientado a la tarea denominada "button_order / status_d" sobre un brazo robotico Franka. El checkpoint corresponde al paso de optimizador 8000, tras 100 epochs adicionales del sampler, partiendo de unos pesos de inferencia EMA del paso 12500 de un entrenamiento previo R4. Lo publica el usuario fm-dev como paquete de inferencia autocontenido de 12,6 GB, con los parametros EMA, los activos de normalizacion, el codigo exacto de modelo y runtime, y los resultados de evaluacion.

Se trata de una politica vision-lenguaje-accion (VLA): recibe imagenes de camara base y estado del robot, y produce secuencias de accion de forma `(20, 8)` con coordenadas XYZ absolutas, cuaternion XYZW y una componente `gripper_open` (0 cerrado, 1 abierto). Su relevancia es acotada pero real: es un ejemplo reproducible de ajuste fino de parametros completos sobre un VLA con backbone, vision de imagen actual, action expert, adaptadores LoRA retenidos y modulos de historial, entrenado con JAX FSDP en 8 GPU NVIDIA H100 de 80 GB.

El interes practico esta en el detalle de su metodologia (definicion de epoch sobre ventanas de accion validas, historial causal, evaluacion offline de acciones) mas que en su rendimiento, dado que no se publican tasas de exito en robot fisico, la licencia no esta declarada y el modelo acumula cero descargas. La model card advierte explicitamente de que la publicacion no establece exito fisico en la tarea ni resuelve la latencia de despliegue.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | politica vision-lenguaje-accion (VLA) pi0.5 de openpi; componentes declarados: backbone, vision de imagen actual, action expert, modulos de historial y adaptadores LoRA retenidos |
| Parametros totales | no disponible (la model card no publica el recuento de parametros; el repositorio ocupa 12,6 GB) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el bundle se distribuye como pesos de inferencia EMA sin declarar cuantizacion) |
| Idiomas soportados | no disponible / no aplica (no es un modelo conversacional; no se declaran idiomas) |
| Licencia | no disponible |
| Formato de pesos | no disponible explicitamente; el bundle usa el formato de runtime de openpi e incluye parametros EMA, activos de normalizacion y codigo fuente |
| Tamano del repositorio | 12,6 GB |
| Horizonte de accion | salida de forma `(20, 8)` |
| Entrada | frames de camara base (RGB) y estado del robot |
| Accion | XYZ absoluto, cuaternion XYZW, `gripper_open` (0 cerrado, 1 abierto) |
| Framework de entrenamiento | JAX FSDP |
| Libreria declarada | openpi |

## Arquitectura y entrenamiento

El modelo es un ajuste fino de parametros completos sobre pi0.5, una politica VLA que combina un backbone de vision-lenguaje con un modulo especifico de generacion de acciones (action expert). En este checkpoint son entrenables el backbone, la vision de imagen actual, el action expert, los adaptadores LoRA retenidos y los modulos de historial. La inicializacion parte de los pesos de inferencia EMA del paso 12500 de un entrenamiento previo, con optimizador AdamW, estado EMA y sampler reiniciados desde cero. El entrenamiento se ejecuto con batch global 64, batch por GPU 8, sobre 8 GPU NVIDIA H100 de 80 GB HBM3, con EMA decay 0,99. El checkpoint publicado es el paso de optimizador 8000, tras 100 epochs adicionales de sampler sobre un schedule de learning rate de 200 epochs que no se modifico en este hito.

La definicion de epoch es relevante y no equivale al conjunto completo de frames grabados: se cuenta sobre el split de entrenamiento procesado, con 4582 ventanas de accion de train, 648 de validacion y 358 de test. Las ventanas de accion son aquellas que superan comprobaciones de sincronizacion y de horizonte continuo; los frames de demostracion previos quedan solo como historial visual y algunos episodios originales no aportan ninguna ventana valida. La variante Status-D anade filas de Status repetidas a las filas de comportamiento, por lo que la longitud de su epoch de sampler difiere de las variantes Baseline y Uniform32. La model card insiste en que el ajuste fino de parametros completos no implica que todos los frames brutos esten supervisados. Los modulos de historial usan un codificador fijo (`history_encoder/`) que debe conservarse integro y que `load()` instala automaticamente; la evaluacion offline de Status-D emplea proyecciones causales del Writer sobre el historial del experto.

## Capacidades

- Generacion de acciones roboticas: produce secuencias de forma `(20, 8)` con posicion XYZ absoluta, orientacion en cuaternion XYZW y apertura de pinza.
- Control visomotor: consume frames de camara base y estado del robot para emitir acciones, con historial de frames acumulado mediante `observe(policy, rgb, state)`.
- Memoria de episodio: los modelos con historial incluyen un codificador fijo de historial que replica las caracteristicas cacheadas durante el entrenamiento, con reinicio de la politica entre episodios.
- Subtareas y keyframes: la variante Status-D requiere el subobjetivo/keyframe causal del Writer y el contexto de Status empleados por su runtime de despliegue.
- Ejecucion de una tarea especifica de manipulacion: la tarea "button_order / status_d"; la finalizacion de Pick3 exige la tercera colocacion seguida de pulsar el boton azul fisico.
- Ajuste fino reproducible: se distribuyen el codigo de modelo y runtime, las versiones de dependencias, `training_config.json`, `assets/policy_metadata.json` y `dataset_manifest.json`.
- Tool calling / function calling: no disponible / no aplica.
- Soporte de agentes y razonamiento multi-paso en el sentido LLM: no aplica; el modelo es una politica de control, no un agente conversacional.
- Capacidades multilingues: no disponible / no aplica.
- Modo thinking, vision generativa, audio: no disponible / no aplica.

## Casos de uso

- Manipulacion pick-and-place con Franka en laboratorio: el modelo recibe frames RGB de la camara base y el estado del robot, y emite 20 pasos de accion con posicion, orientacion y apertura de pinza, lo que permite ejecutar la secuencia completa de colocacion dentro de un unico horizonte de accion.
- Investigacion en politicas VLA: sirve como referencia reproducible de ajuste fino de parametros completos con JAX FSDP en 8 GPU, con configuracion, manifiesto de dataset y metadatos de politica incluidos.
- Automatizacion de paneles de control fisicos (button order): la tarea entrenada combina ordenacion de objetos y accionamiento de un boton fisico, un patron habitual en lineas de produccion y bancos de pruebas.
- Evaluacion offline previa al despliegue: las metricas de error L2 de posicion y de angulo de cuaternion sobre los splits de validacion y test permiten descartar checkpoints antes de gastar tiempo de robot real.
- Base para transferencia a tareas propias: al ser un checkpoint de ajuste completo con historial, puede reutilizarse como punto de partida para nuevos datasets de manipulacion con el mismo robot y camara.
- Estudio de memoria e historial en politicas: el bundle incluye un codificador fijo de historial y el flujo `observe`/reset, lo que facilita experimentos sobre el efecto del contexto visual acumulado.
- Comparacion de variantes de entrenamiento: las variantes Baseline, Uniform32 y Status-D descritas en la model card permiten analizar como cambia el sampler al introducir filas de Status repetidas.
- Verificacion de integridad del pipeline de publicacion: el paquete se cargo en CPU mediante `load_model.py`, incluido el codificador de historial fijo, antes de subirse, lo que sirve de plantilla para validar bundles de inferencia.

## Benchmarks y rendimiento

La informacion proporcionada solo incluye errores offline de accion sobre datos retenidos, no tasas de exito en robot fisico. No hay datos de MMLU, HumanEval, GSM8K ni de benchmarks de manipulacion estandar.

| Split | Error L2 medio de posicion (m), H20 | Angulo medio de cuaternion (rad) |
|---|---:|---:|
| validation | 0,04184 | 0,07271 |
| test | 0,04361 | 0,06463 |

El checkpoint en la nube supero la evaluacion offline de acciones con salidas `(20, 8)` finitas. La evaluacion offline de Status-D usa proyecciones causales del Writer sobre el historial del experto. La model card subraya que estos valores son errores offline sobre datos retenidos y no tasas de exito en robot real.

## Requisitos de hardware

- Entrenamiento documentado: 8 GPU NVIDIA H100 de 80 GB HBM3, con JAX FSDP, batch por GPU 8 y batch global 64.
- Huella en disco: 12,6 GB para el bundle de inferencia completo (pesos EMA, activos de normalizacion, codigo y artefactos).
- VRAM de inferencia: no disponible. La unica cota inferior objetiva es el tamano del bundle en disco; hay que anadir el overhead de activaciones, del codificador de historial y del runtime de openpi.
- GPU recomendadas: no disponible para inferencia; el unico dato publicado es el hardware de entrenamiento (H100 80GB).
- Encaje en GPU de consumo: no confirmado. No hay datos publicados que permitan afirmar que quepa en una RTX 4090 u otra GPU de consumo.
- Opciones de despliegue: runtime de openpi mediante `load_model.py` (`from load_model import load, observe`), con `requirements.txt` del repositorio instalado y ejecucion desde el directorio del bundle. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que ademas no aplican a una politica de control.
- Requisito de historial: es obligatorio conservar el directorio `history_encoder/` completo; `load()` instala el codificador fijo automaticamente.
- Latencia y throughput: no disponibles. La model card indica explicitamente que la publicacion no resuelve la latencia de despliegue.

## Comparativa con modelos similares

No se han publicado datos comparativos en la informacion disponible. El repositorio no incluye resultados frente a otras politicas VLA (por ejemplo, el propio pi0, OpenVLA o RDT) ni frente a las variantes Baseline y Uniform32 que se mencionan en la model card. La unica comparacion posible con los datos aportados es interna al propio entrenamiento.

| Modelo | Parametros | Contexto | Rendimiento publicado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| pi0.5 button_order / status_d (este checkpoint) | no disponible | no disponible | error L2 de posicion 0,04184 m (val), 0,04361 m (test); angulo 0,07271 / 0,06463 rad | no disponible | repositorio HuggingFace, 0 descargas |
| pi0.5 Base (referencia del ecosistema openpi) | no disponible | no disponible | no disponible | no disponible | no disponible |
| Variante Baseline del mismo autor | no disponible | no disponible | no disponible | no disponible | no disponible |
| Variante Uniform32 del mismo autor | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Licencia no declarada: sin licencia explicita no se puede asumir permiso de uso comercial; es un riesgo legal directo para produccion.
- Sin validacion en robot fisico: los numeros publicados son errores offline sobre datos retenidos, no tasas de exito. La model card afirma que la publicacion no establece exito fisico en la tarea.
- Latencia no resuelta: no se aportan mediciones de latencia ni de throughput de despliegue.
- Componentes no supervisados: los elementos marcados como no supervisados en `training_config.json` y `assets/policy_metadata.json` no deben interpretarse como control de pinza entrenado.
- Cobertura de datos limitada y sesgada al montaje original: 4582 ventanas de accion de entrenamiento, 648 de validacion y 358 de test, procedentes de un unico entorno y robot Franka. Algunos episodios originales no aportan ninguna ventana valida.
- Definicion de epoch no intuitiva: las epochs se cuentan sobre el split procesado, no sobre frames brutos, y la variante Status-D cambia la longitud del epoch del sampler respecto a Baseline y Uniform32.
- Dependencia fuerte del runtime: Status-D necesita el subobjetivo/keyframe causal del Writer y el contexto de Status de su runtime de despliegue; usarlo fuera de ese contexto invalida las condiciones de entrenamiento.
- Estado del optimizador no incluido: el repositorio es solo un bundle de inferencia; el estado completo de optimizador y sampler queda en almacenamiento AMLT, por lo que no se puede reanudar el entrenamiento desde aqui.
- Riesgo de sobreajuste a la tarea: el identificador del modelo esta atado a una tarea concreta ("button_order / status_d") y a una condicion de exito muy especifica (tercera colocacion mas pulsacion del boton azul fisico).
- Riesgo de alucinacion en el sentido conversacional: no aplica, pero si existe riesgo de generalizacion incorrecta de la politica ante estados, iluminacion u objetos fuera de la distribucion de entrenamiento.
- Idiomas: no se declaran idiomas soportados; no es un modelo de lenguaje para texto.
- Sesgos conocidos: no disponibles; la composicion detallada del dataset original no se describe en la informacion proporcionada.
- Adopcion nula: 0 descargas y 0 likes, sin evidencia de uso externo ni de replicacion independiente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/fm-dev/pi05-button-order-status-d-full-gbs64-pgb8-gpu8-r4-epoch100-step8000
- La busqueda web realizada no devolvio ningun resultado relevante: todos los enlaces recuperados corresponden a foros y articulos sobre compras y envios de Amazon (en frances, chino y aleman) sin relacion con el modelo. No se dispone, por tanto, de papers, blogs, repositorios ni demos adicionales que enlazar.
- Artefactos internos del repositorio citados en la model card (no enlazables desde aqui): `training_config.json`, `assets/policy_metadata.json`, `dataset_manifest.json`, `requirements.txt`, `load_model.py` y el directorio `history_encoder/`.
