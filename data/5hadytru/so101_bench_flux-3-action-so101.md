# 5hadytru/so101_bench_flux-3-action-so101

## Resumen

SO-101 Bench: FLUX 3 Action LoRA es un adaptador LoRA de rango 32 publicado por el usuario 5hadytru, obtenido mediante ajuste fino supervisado sobre el modelo base black-forest-labs/flux-3-action-so101 (commit `c9e13b2`). El adaptador se ha entrenado especificamente para control robotico en el banco de pruebas SO-101, empleando el dataset simulado `5hadytru/so101_bench_sim`. No es un modelo autonomo, sino un delta de pesos que debe cargarse sobre el paquete base de FLUX 3 Action, que es un modelo world action de 7B parametros con pesos abiertos.

El modelo base, desarrollado por Black Forest Labs, recibe fotogramas de camara, el estado del robot y una instruccion textual, y devuelve el siguiente bloque de acciones, aplicando un proceso de denoising conjunto con los siguientes fotogramas de video. Esta arquitectura convierte la inteligencia visual de la familia FLUX en senales de control motor, lo que resulta relevante ahora porque permite reutilizar un modelo fundacional visual para politicas roboticas concretas mediante adaptadores ligeros, en lugar de entrenar una politica desde cero.

En este caso concreto, el adaptador se ha re-cimentado sobre la normalizacion propia del banco SO-101 Bench y esta pensado para la politica SO-101 de FLUX 3 Action. El checkpoint oficial del repositorio corresponde al adaptador en bruto en la actualizacion 3000 (paso 048000 de LeRobot), seleccionado por el autor sobre validacion con un resultado de 5/39 episodios exitosos (12,8%). El repositorio ocupa 13,7 GB e incluye tanto el adaptador raiz como todos los checkpoints intermedios de la ejecucion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (adaptador LoRA rango 32 sobre FLUX 3 Action, modelo world action basado en transformer de difusion con cabezas de accion) |
| Parametros totales | 7B en el modelo base FLUX 3 Action; el adaptador LoRA no declara recuento propio |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (la entrada de instrucciones es textual; el autor no declara idiomas) |
| Licencia | flux-kommunity (etiquetada como `other`, `license_name: flux-kommunity`) |
| Formato de pesos | safetensors (checkpoint PEFT de LeRobot; adaptador en bruto y adaptador EMA, mas estado de entrenamiento) |
| Tamano del repositorio | 13,7 GB |
| Modelo base | black-forest-labs/flux-3-action-so101 (`c9e13b2`) |
| Libreria | lerobot |
| Pipeline | robotics |
| Rango LoRA | 32 (cabezas de accion entrenadas en su totalidad) |

## Arquitectura y entrenamiento

El adaptador se construye sobre FLUX 3 Action, un modelo world action de pesos abiertos con 7B parametros que combina la columna vertebral visual de la familia FLUX con decodificacion de acciones. El modelo base recibe fotogramas de camara, el estado del robot y una instruccion en lenguaje natural, y genera de forma conjunta el siguiente bloque de acciones y los siguientes fotogramas de video mediante un proceso de denoising. En este repositorio, el adaptador es un LoRA de rango 32 configurado segun `examples/flux3/lora.json` de LeRobot, en el que unicamente las cabezas de accion se entrenan por completo; el resto del modelo permanece congelado.

El entrenamiento se realizo sobre el dataset simulado `5hadytru/so101_bench_sim`, usando la camara cenital como camara `scene` del modelo mas la camara de muneca y sin fotogramas de inicializacion. Los hiperparametros declarados son: lote global 128 (micro lote 2, 4 GPU, 16 pasos de acumulacion), tasa de aprendizaje constante de 1e-4 y 6.280 actualizaciones completadas en 36 horas sobre 4 GPU A100-80GB. El autor re-cimento el adaptador sobre la normalizacion propia de SO-101 Bench, de modo que los ficheros de procesador incluidos arrastran esa normalizacion. En inferencia se emplearon 8 ticks de historial y bloques de 42 acciones, ejecutando 32 de ellas a 30 Hz.

## Capacidades

- Generacion de acciones de control robotico a partir de observaciones visuales, estado del robot e instrucciones textuales.
- Prediccion conjunta de los siguientes fotogramas de video (world model) junto con el bloque de acciones.
- Ejecucion de politicas de manipulacion para el robot SO-101 en entornos simulados.
- Consumo de historial de observaciones: la politica SO-101 lleva el historial propiedad del checkpoint (8 ticks en la configuracion de inferencia reportada).
- Emision de bloques de acciones con ejecucion parcial: 42 acciones generadas, 32 ejecutadas a 30 Hz.
- Condicionamiento por instruccion textual (prompt de tarea).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponibles.
- Capacidades especiales: modelo del tipo world action que denoisa video y acciones de forma conjunta.

## Casos de uso

- Manipulacion robotica simulada con SO-101: el adaptador controla el brazo SO-101 en el banco de pruebas para tareas de pick-and-place, aprovechando el condicionamiento por instruccion textual y el historial de 8 ticks para mantener coherencia temporal.
- Investigacion en politicas visuales para robotica: permite evaluar como un modelo fundacional visual de 7B se adapta a una tarea de control concreta mediante un LoRA de rango 32, con un coste de entrenamiento acotado (36 horas en 4x A100).
- Benchmarking de world action models: sirve como punto de referencia en SO-101 Bench para comparar arquitecturas de politicas que predicen acciones y video de forma conjunta, con una metrica de exito de validacion de 5/39 (12,8%).
- Prototipado de control a 30 Hz: al ejecutar 32 acciones de cada bloque a 30 Hz, es adecuado para probar lazos de control de frecuencia media en simulacion antes de trasladar la politica a hardware.
- Estudio de normalizacion especifica de banco: al re-cimentar sobre la normalizacion de SO-101 Bench, resulta util para analizar el impacto de las estadisticas de normalizacion en la transferencia de politicas.
- Generacion de datos sinteticos con el world model: la prediccion de fotogramas de video junto con las acciones permite generar pares observacion-accion artificiales para aumentar datasets de robotica.
- Experimentos de ajuste eficiente de parametros (PEFT): sirve de ejemplo reproducible de integracion de LoRA con LeRobot para adaptar modelos grandes a politicas especificas de robot.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible, salvo la tasa de exito en el conjunto de validacion propio del banco.

| Evaluacion | Metrica | Resultado |
|---|---|---|
| SO-101 Bench (39 episodios de validacion) | Episodios exitosos | 5/39 (12,8%) en la actualizacion 3000 (checkpoint oficial, paso 048000 de LeRobot) |
| SO-101 Bench (39 episodios de validacion) | Episodios exitosos | 3/39 en la actualizacion final 6280 |

No hay datos comparativos con otros modelos en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita en la informacion proporcionada. Como referencia orientativa basada en el modelo base de 7B, la inferencia en precision completa requeriria del orden de 14-16 GB de VRAM; las estimaciones por cuantizacion no son datos confirmados por el autor.
- GPU recomendadas: el entrenamiento se realizo sobre 4x A100-80GB. Para inferencia se desconoce la GPU minima declarada.
- Compatibilidad con GPU de consumo: no disponible. El modelo base de 7B podria caber teoricamente en GPU de consumo con suficiente VRAM, pero el autor no lo confirma.
- Opciones de despliegue: integracion con LeRobot (carga del checkpoint PEFT sobre el paquete base). El autor menciona `merge_lora_package.py` del repositorio SO-101 Bench (`scripts/FLUX3_fine_tuning/pod/`) para fusionar el adaptador. No se confirman otros servidores de inferencia (vLLM, TGI, Ollama, llama.cpp).
- Latencia y throughput: no disponibles. La unica referencia temporal es la ejecucion de 32 acciones a 30 Hz y el uso de 8 ticks de historial en inferencia.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye datos de rendimiento ni especificaciones de otros adaptadores o politicas comparables dentro de FLUX 3 Action o de modelos competidores en el mismo banco.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| so101_bench_flux-3-action-so101 | 7B (base) + LoRA rango 32 | No disponible | 5/39 en validacion SO-101 Bench | flux-kommunity | HuggingFace |
| Alternativas comparables | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Es un adaptador, no un modelo autonomo: requiere cargarse sobre el paquete base black-forest-labs/flux-3-action-so101 o fusionarse con `merge_lora_package.py`.
- Rendimiento limitado en validacion: la tasa de exito del checkpoint oficial es 5/39 (12,8%), y el checkpoint final cae a 3/39, lo que indica sobreajuste o degradacion con las actualizaciones.
- Entrenado sobre datos simulados (`so101_bench_sim`): la transferencia a robot fisico no esta demostrada ni declarada por el autor.
- Normalizacion especifica del banco: los ficheros de procesador arrastran la normalizacion propia de SO-101 Bench, por lo que usarlo fuera de ese contexto puede degradar el rendimiento.
- Sesgos conocidos: no disponibles (no se documentan).
- Riesgo de alucinacion: no disponible como metrica; en el contexto de world action models, el riesgo se manifiesta como predicciones de accion o video incoherentes con la tarea.
- Limitaciones de contexto e idioma: no disponibles. El autor no declara idiomas soportados ni longitud de contexto.
- Licencia flux-kommunity: es una licencia de comunidad con posibles restricciones para uso comercial; debe revisarse antes de desplegar en produccion.
- Cero descargas y cero likes en el momento de la consulta, creado y actualizado con pocos minutos de diferencia (6 de octubre de 2026), lo que sugiere un artefacto reciente y sin validacion externa.
- No se declaran cuantizaciones ni formatos alternativos a safetensors, lo que puede limitar opciones de despliegue en hardware restringido.

## Enlaces

- Adaptador en HuggingFace: https://huggingface.co/5hadytru/so101_bench_flux-3-action-so101
- Modelo base en HuggingFace: https://huggingface.co/black-forest-labs/flux-3-action-so101
- Repositorio de codigo FLUX Action: https://github.com/black-forest-labs/flux-action
- Pagina oficial del modelo FLUX 3 Action: https://bfl.ai/models/flux-3-action
- Coleccion FLUX 3 Action en HuggingFace: https://huggingface.co/collections/black-forest-labs/flux-3-action
- Modelo base en ModelScope: https://www.modelscope.cn/models/black-forest-labs/flux-3-action-so101
