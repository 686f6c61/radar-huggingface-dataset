# liorbenhorin-nv/so101_vials_dr_procedural_layout_aware_first75ep_20261012_GR00T17_20k_visualtrue_1gpu

## Resumen

Se trata de un ajuste fino (fine-tune) del modelo fundacional de robotica NVIDIA GR00T N1.7-3B, publicado por el usuario liorbenhorin-nv en HuggingFace. No es un modelo de lenguaje generico, sino una politica vision-lenguaje-accion (VLA) especializada en una unica tarea de manipulacion con el brazo robotico de bajo coste SO-101: el manejo de viales con conciencia del layout de la escena ("layout aware") y con aleatorizacion de dominio procedural. El repositorio contiene unicamente la politica final, con 3.144.016.000 parametros (3,14 mil millones) almacenados en safetensors y un tamano de repositorio de 12,6 GB.

El entrenamiento se realizo con la libreria LeRobot sobre un subconjunto muy pequeno del dataset `so101_vials_dr_procedural_layout_aware_250ep_20261009`: exactamente los episodios 0 a 74, es decir 75 episodios y 27.028 fotogramas. Se ejecutaron 20.000 pasos de optimizador en una sola GPU RTX PRO 6000 Blackwell, con batch 16, semilla 42, autocast BF16 y parametros del modelo en FP32. Es relevante ahora porque demuestra que un fine-tune de GR00T N1.7 puede completarse en una unica GPU profesional, con `tune_visual=true` y `tune_llm=false`, lo que sitúa el coste de adaptacion de un VLA de 3B al alcance de laboratorios pequenos.

La ficha debe leerse con cautela: la model card no declara licencia ni idiomas, no aporta resultados de benchmarks y afirma explicitamente que no se ha realizado ninguna evaluacion en simulacion. Los checkpoints intermedios (10k y 20k pasos) y el estado del optimizador no se han publicado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo vision-lenguaje-accion (VLA) basado en NVIDIA GR00T N1.7; backbone Cosmos (commit `9ce19a195e423419c349abfc86fd07178b230561`) con cabeza de accion de difusion |
| Parametros totales | 3.144.016.000 (3,14 mil millones, dato de safetensors) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; el repositorio solo distribuye pesos en safetensors (entrenamiento con autocast BF16 y parametros FP32) |
| Idiomas soportados | no disponible (no se declara ningun idioma en la model card ni en los metadatos) |
| Licencia | no declarada en el repositorio; debe verificarse la licencia del modelo base `nvidia/GR00T-N1.7-3B` |
| Formato de pesos | safetensors |
| Tamano del repositorio | 12,6 GB |
| Libreria de carga | lerobot |
| Modelo base | nvidia/GR00T-N1.7-3B (revision `2fc962b973bccdd5d8ce4f67cc63b264d6886495`) |
| Espacio de acciones | brazo relativo y pinza absoluta |
| Ventana de accion (action chunk) | 16 pasos |
| Epocas / pasos de entrenamiento | 20.000 pasos de optimizador (checkpoints a 10k y 20k, no publicados) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de NVIDIA GR00T N1.7, un sistema VLA compuesto por un backbone de tipo Cosmos (vision-lenguaje) y una cabeza de accion generativa que produce secuencias de acciones motoras. El pipeline declarado en la model card confirma el uso de una ventana de 16 pasos de accion, con acciones de brazo relativas y accion de pinza absoluta, un esquema habitual en politicas de manipulacion que reducen la frecuencia de inferencia necesaria para controlar el robot.

El entrenamiento se realizo con el wrapper `groot_fast_train` fijado al commit `07be46c3c3da9561e5d407135594d109f10efe62`, sobre un subconjunto local nativo de LeRobot que preserva los valores numericos y los bytes de video del dataset original. Se usaron 75 episodios (0 a 74 inclusive), con 27.028 fotogramas, identificador de contenido `local-sha256:868ef387535cdc00d9df886298910013bd61e3a361f90a1ba746310d61ba3ca5` (no es una revision del Hub). La configuracion incluye `tune_visual=true`, `tune_llm=false` (solo se ajusta la torre visual; el LLM permanece congelado), aumentado de imagenes activado, AdamW fusionado con tasa de aprendizaje 1e-4, 1.000 pasos de warmup y scheduler coseno, batch global 16 y semilla 42. La normalizacion emplea la agregacion estandar de las 75 estadisticas por episodio, con el arreglo de estadisticas agrupadas ("pooled-statistics fix") desactivado de forma deliberada. No se documento ningun tipo de RLHF, DPO ni evaluacion en simulacion.

## Capacidades

- Generacion de trayectorias de accion para manipulacion robotica: produce chunks de 16 acciones (brazo relativo, pinza absoluta) a partir de observaciones visuales y de estado.
- Percepcion visual para control: `tune_visual=true` indica que la torre visual fue ajustada especificamente para las imagenes de esta tarea (viales y layout del entorno).
- Conciencia del layout de la escena: el nombre del modelo y del dataset indican entrenamiento explicito para escenas con disposicion variable de los objetos.
- Robustez ante aleatorizacion de dominio procedural (DR): el dataset de origen se genero con variaciones procedurales del entorno.
- Control de un brazo SO-101 de bajo coste: politica especializada en una plataforma concreta, no generica.
- No se documenta soporte de tool calling, function calling, uso de agentes, multi-step reasoning simbolico, vision generativa conversacional, audio ni modo "thinking".
- Capacidades multilingues: no disponibles (no se declara ningun idioma).
- No se documenta ninguna capacidad de generacion de texto, codigo o matematicas mas alla de lo que herede el backbone congelado.

## Casos de uso

- Manipulacion de viales en laboratorio: el modelo puede generar las acciones necesarias para coger, colocar y reorganizar viales sobre una superficie, gracias a su ventana de 16 acciones que permite ejecutar movimientos continuos sin reinferencia constante.
- Automatizacion de pick-and-place con layout variable: al haberse entrenado con aleatorizacion procedural y conciencia de layout, es adecuado para lineas donde la posicion de los objetos cambia entre ejecuciones.
- Politica de referencia para el brazo SO-101: sirve como punto de partida para equipos que quieran adaptar un VLA de 3B a un brazo de bajo coste con un presupuesto de computo reducido.
- Fine-tune adicional sobre datos propios: el coste de entrenamiento documentado (una RTX PRO 6000 Blackwell, 20.000 pasos, batch 16) lo hace viable como base para nuevas tareas mediante ajuste de la torre visual.
- Investigacion en aleatorizacion de dominio: el repositorio y el dataset asociado permiten estudiar como afecta el numero de episodios (75 frente a los 250 del dataset completo) al rendimiento de la politica.
- Docencia y formacion en robotica: al ser un fine-tune pequeno y reproducible con LeRobot, es util para practicas de entrenamiento de politicas VLA en cursos de posgrado.
- Evaluacion comparativa de estrategias de normalizacion: el modelo desactiva el arreglo de estadisticas agrupadas, por lo que permite comparar ese efecto sobre la estabilidad de la politica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La propia model card indica de forma explicita: "No simulation evaluation has been performed" (no se ha realizado ninguna evaluacion en simulacion). No existen datos de exito de tarea, tasa de exito por episodio, MMLU, HumanEval, GSM8K ni de ningun otro benchmark aplicable. Tampoco se documentan latencia ni throughput de inferencia.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en BF16 ocupan aproximadamente 6,3 GB (3,14 mil millones de parametros); con buffers de vision, ventanas de observacion y overhead del runtime, es razonable reservar entre 8 y 12 GB. El repositorio de 12,6 GB sugiere que los pesos almacenados podrian estar en FP32, en cuyo caso la carga completa requeriria unos 12,6 GB.
- GPU recomendadas: RTX PRO 6000 Blackwell (96 GB, la usada para entrenar), A100, H100 para despliegues con margen amplio; RTX 4090 (24 GB) o RTX 3090 (24 GB) para inferencia en un solo equipo.
- Cabe en GPU de consumo: si, previsiblemente en tarjetas de 16 GB o mas con pesos en BF16 o FP16; no se documentan pruebas oficiales con GPUs de consumo.
- Entrenamiento: 20.000 pasos con batch 16 global en una unica RTX PRO 6000 Blackwell, autocast BF16 y parametros FP32; no se indica la duracion total del entrenamiento.
- Opciones de despliegue: la libreria declarada es `lerobot`; el ecosistema de referencia para GR00T N1.7 es NVIDIA Isaac-GR00T. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, que en cualquier caso no son los runtimes habituales para politicas VLA.
- Latencia y throughput: no disponibles. La ventana de 16 acciones reduce el numero de inferencias por segundo necesarias para controlar el brazo, pero no se aportan cifras medidas.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | Contexto / ventana de accion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| so101_vials_dr_procedural_layout_aware (este modelo) | 3,14 B | VLA fine-tune de GR00T N1.7 | ventana de accion de 16 pasos; contexto no disponible | no declarada | safetensors en HuggingFace, libreria lerobot |
| nvidia/GR00T-N1.7-3B | 3 B (aproximado) | VLA fundacional | no disponible en esta busqueda | licencia de NVIDIA (verificar) | HuggingFace |
| GR00T N1.5 | 3 B (aproximado) | VLA fundacional | no disponible en esta busqueda | licencia de NVIDIA (verificar) | HuggingFace |
| Physical Intelligence pi0 | 3,3 B (aproximado) | VLA con flow matching | no disponible en esta busqueda | no verificada | openpi |
| SmolVLA | 450 M (aproximado) | VLA compacto | no disponible en esta busqueda | no verificada | HuggingFace / LeRobot |

Los datos de los modelos comparables provienen de conocimiento general del ecosistema y no se han verificado en la informacion proporcionada; deben confirmarse en sus fichas oficiales antes de usarse en una decision tecnica. La diferencia principal de este modelo frente a todos ellos es su caracter de fine-tune de tarea unica sobre 75 episodios, no un modelo fundacional de proposito general.

## Limitaciones y advertencias

- Entrenamiento con solo 75 episodios y 27.028 fotogramas de una unica tarea: riesgo elevado de sobreajuste y de generalizacion muy limitada fuera de la distribucion del dataset.
- Sin evaluacion: la model card afirma explicitamente que no se ha realizado ninguna evaluacion en simulacion, y no hay resultados en robot real. No hay evidencia publicada de tasa de exito.
- LLM congelado: `tune_llm=false` implica que solo se adapto la torre visual; la comprension semantica de instrucciones no se ha ajustado a la tarea.
- Licencia no declarada: no se puede asumir uso comercial. Es imprescindible verificar la licencia del modelo base `nvidia/GR00T-N1.7-3B`, que impone sus propias condiciones.
- Normalizacion no corregida: el arreglo de estadisticas agrupadas esta deliberadamente desactivado, con agregacion estandar de las 75 estadisticas por episodio; esto puede introducir sesgos en la escala de acciones y observaciones.
- Dominio cerrado: el modelo esta especializado en el brazo SO-101 y en la tarea de viales con conciencia de layout; no debe esperarse comportamiento correcto en otros robots, morfologias o tareas.
- Reproducibilidad parcial: los checkpoints de 10k y 20k pasos y el estado del optimizador permanecen en un entorno privado ("unicorn"), y el subconjunto de datos usa un identificador de contenido local que no esta alojado como revision del Hub.
- Riesgo de acciones inseguras: en un sistema fisico, una prediccion erronea puede provocar colisiones o manipulacion incorrecta de material. Se requiere supervision humana, limites de par y paradas de emergencia en produccion.
- Idiomas: no se declara ningun idioma soportado, lo que impide asumir instrucciones en castellano u otras lenguas.
- Cero adopcion documentada: 0 descargas y 0 "likes" en el momento de la consulta, sin evidencia de uso independiente.
- Sesgos conocidos: no disponibles; no se documenta ningun analisis de sesgo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/liorbenhorin-nv/so101_vials_dr_procedural_layout_aware_first75ep_20261012_GR00T17_20k_visualtrue_1gpu
- Modelo base: https://huggingface.co/nvidia/GR00T-N1.7-3B
- Dataset de origen: https://huggingface.co/datasets/liorbenhorin-nv/so101_vials_dr_procedural_layout_aware_250ep_20261009
- Libreria LeRobot: https://github.com/huggingface/lerobot
- Repositorio de referencia de GR00T (NVIDIA Isaac-GR00T): https://github.com/NVIDIA/Isaac-GR00T
- Paper de GR00T N1: https://arxiv.org/abs/2503.14734
