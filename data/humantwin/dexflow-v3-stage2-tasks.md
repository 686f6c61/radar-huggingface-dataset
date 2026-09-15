# Humantwin/dexflow-v3-stage2-tasks

## Resumen

DexFlow MLP Stage-2 v3 es una política de imitación para manipulación robótica diestra, publicada por la organización Humantwin en Hugging Face bajo el identificador `Humantwin/dexflow-v3-stage2-tasks`. No es un modelo de lenguaje ni un transformer generativo de texto: es un controlador entrenado por imitación que, a partir de una imagen y un vector de estado propioceptivo, predice un chunk de acciones. La variante publicada corresponde a la designación interna V3-E ("Selective Grounding"), con doble lector, propiocepción selectiva y mensajes compactos de 16 dimensiones entre el cuerpo y la mano.

El modelo se apoya en la arquitectura propietaria `DexFlowMLPPolicy` (identificador `policy_variant=dexflow_mlp`), con las banderas `split_head=true`, `dual_reader=true`, `selective_obs=true` y `message_dim=16`. El entrenamiento usa una pérdida balanceada de la forma `0.5 L_body + 0.5 L_hand`, es decir, separa explícitamente la predicción del cuerpo y de la mano y equilibra ambas contribuciones. El autor indica de forma explícita que no se trata de ACT ni de un DiT, lo que sitúa el modelo fuera de las dos familias de referencia más habituales en imitación robótica.

El checkpoint distribuido es el paso 15.000 de la etapa 2 (`stage2_step15000.ckpt`), inicializado desde un modelo de etapa 1 (`stage1_step02000.ckpt`), con semilla `20260910` y validación de puerta G2 superada. Se publican dos variantes de tarea, `plastic` y `pill`, cada una con su propio checkpoint, estadísticas de normalización y fichero de puerta. Su relevancia actual es acotada pero concreta: aporta un punto de partida reproducible para manipulación diestra con imágenes de 480x640, estado de 41 dimensiones y chunks de 30 acciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DexFlow MLP (`policy_variant=dexflow_mlp`), con `split_head=true`, `dual_reader=true`, `selective_obs=true` y `message_dim=16`; no es ACT ni DiT |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje); horizonte de accion de 30 pasos y vector de estado de 41 dimensiones |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no aplica: politica robotica, sin interfaz de lenguaje) |
| Licencia | apache-2.0 |
| Formato de pesos | checkpoint PyTorch `.ckpt` (`selective/{plastic,pill}/stage2_step15000.ckpt`, espejo `stage2.ckpt`), acompanado de `norm_stats.json` y `gate_step15000.json` |
| Tamano del repositorio | 0,6 GB |
| Entradas | imagen `[B,1,3,480,640]` en float 0-1; estado `[B,41]` normalizado con MEAN_STD |
| Salida | chunk de acciones `[B,30,41]` (normalizado, requiere desnormalizacion) |
| Tareas incluidas | `plastic` y `pill` |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-09-15 |

## Arquitectura y entrenamiento

La arquitectura es una politica de imitacion basada en MLP residual, segun la etiqueta `residual-mlp` del repositorio. El diseno se articula en torno a cuatro decisiones declaradas por el autor: cabeza dividida (`split_head`), doble lector (`dual_reader`), observacion selectiva (`selective_obs`) y un canal de mensajes cuerpo-mano de 16 dimensiones. La combinacion de doble lector con mensajes compactos de 16 dimensiones sugiere una separacion de rutas de procesamiento que se comunican por un cuello de botella pequeno, aunque la model card no detalla la topologia exacta de capas ni el numero de parametros.

El entrenamiento es un proceso en dos etapas. La etapa 1 se ejecuto sobre un nucleo identificado como `dexflow_mlp_stage1_core4_current_state_gate_20260910`, con checkpoint en el paso 2.000; la etapa 2 parte de esa inicializacion y se detiene en el paso 15.000. La semilla fue `20260910` y el criterio de aceptacion es una puerta denominada G2, cuyo resultado se publica en `gate_step15000.json`. La funcion de perdida combina a partes iguales el error del cuerpo y el de la mano (`0.5 L_body + 0.5 L_hand`), una eleccion que evita que el termino de mayor magnitud domine el gradiente. No se especifican en la informacion disponible el numero de tokens o transiciones, la composicion del dataset, ni si se emplearon RLHF, DPO o tecnicas similares (no aplicables en este dominio).

## Capacidades

- Prediccion de chunks de accion de 30 pasos a partir de una unica imagen y un vector de estado de 41 dimensiones, con salida de 41 dimensiones por paso.
- Manipulacion diestra: el modelo distingue explicitamente entre la prediccion del cuerpo y la de la mano mediante cabezas separadas.
- Ejecucion de dos tareas concretas: manipulacion de un objeto `plastic` y de una `pill`.
- Procesamiento de vision: acepta imagenes de 480x640 con un unico canal de camara (`[B,1,3,480,640]`).
- Integracion con normalizacion externa: se apoya en `ActionStateNormalizer` para normalizar el estado y desnormalizar la accion.
- Reconstruccion de configuracion desde checkpoint: `from_checkpoint` restaura `mlp_cfg.split_head`, `dual_reader`, `selective_obs` y `message_dim`, lo que permite cargar el modelo sin declarar la configuracion a mano.
- No dispone de tool calling, function calling, capacidades de agente, razonamiento multi-paso simbolico ni capacidades multilingues; no son aplicables a este tipo de modelo.

## Casos de uso

- Manipulacion robotica diestra de laboratorio: la politica genera chunks de 30 acciones de 41 dimensiones, lo que permite controlar simultaneamente el brazo y la mano en tareas de recogida de objetos pequenos como la `pill`.
- Investigacion en imitacion con MLP residual: sirve como linea base reproducible frente a ACT y Diffusion Policy, ya que el autor publica checkpoint, estadisticas de normalizacion y el criterio de puerta G2 empleado para aceptar el modelo.
- Punto de partida para fine-tuning en tareas nuevas: al ser un checkpoint de etapa 2 inicializado desde etapa 1, se puede reutilizar como inicializacion de politicas para objetos o configuraciones distintas de `plastic` y `pill`.
- Evaluacion de esquemas de representacion cuerpo-mano: el canal de 16 dimensiones entre cuerpo y mano permite estudiar experimentalmente cuanto ancho de banda de comunicacion necesita una politica diestra, comparando contra variantes con `message_dim` distinto.
- Despliegue en robot real mediante el cargador de referencia: la model card documenta el uso de `load_dexflow_policy(..., device="cuda")` junto con `ActionStateNormalizer.load(...)`, lo que facilita integrarlo en un bucle de control existente que ya consuma imagenes 480x640 y estado de 41 dimensiones.
- Auditoria de politicas de imitacion: dispone de fichero de puerta (`gate_step15000.json`), lo que permite registrar y versionar el criterio de aceptacion del checkpoint dentro de un pipeline de validacion.
- Comparacion de estrategias de perdida balanceada: la formulacion `0.5 L_body + 0.5 L_hand` es un caso de estudio util para equipos que depuren desequilibrios de gradiente entre subobjetivos.

## Benchmarks y rendimiento

Los unicos resultados publicados son metricas de bucle abierto sobre el conjunto de entrenamiento, con la puerta G2 superada en el paso 15.000. No se han publicado resultados en conjuntos de validacion externos, en robot real ni comparaciones con otras politicas.

| Ruta | nRMSE | RMSE cuerpo | MAE mano |
|---|---:|---:|---:|
| `selective/plastic` | 0,0576 | 0,0060 | 3,07 |
| `selective/pill` | 0,0656 | 0,0072 | 4,74 |

Advertencia metodologica: al tratarse de error de bucle abierto medido sobre el propio conjunto de entrenamiento, estas cifras no son indicativas de rendimiento en ejecucion cerrada ni de generalizacion a objetos, camaras o entornos no vistos. Las unidades de la MAE de la mano no se especifican en la informacion disponible.

## Requisitos de hardware

- El autor no publica requisitos de hardware, VRAM ni latencias. Cualquier cifra al respecto seria una estimacion no respaldada.
- El repositorio ocupa 0,6 GB, lo que incluye los checkpoints de las dos tareas y los ficheros auxiliares; el peso de un unico checkpoint es una fraccion de ese total.
- El codigo de carga de referencia usa `device="cuda"`, por lo que se espera una GPU con CUDA; no se indica si existe soporte CPU funcional.
- No se publican GPU recomendadas (A100, H100, RTX 4090 u otras) ni si el modelo cabe en GPU de consumo.
- Opciones de despliegue: al no ser un modelo de lenguaje, vLLM, llama.cpp, Ollama y TGI no son aplicables. El despliegue documentado es PyTorch directo mediante `deploy.real_robot.load_p0_policy`, modulo que no se incluye en el repositorio de Hugging Face.
- Latencia y throughput: no disponibles. En un despliegue real de control, el limite practico lo marcara el coste de inferencia del codificador visual y del MLP por cada chunk de 30 acciones.

## Comparativa con modelos similares

La comparacion se limita a caracteristicas cualitativas porque no hay datos publicos de parametros ni de rendimiento para este modelo.

| Modelo | Familia | Parametros | Contexto / horizonte | Licencia | Datos de rendimiento |
|---|---|---|---|---|---|
| DexFlow MLP Stage-2 v3 (V3-E) | MLP residual con doble lector y mensajes cuerpo-mano de 16D | no disponible | chunk de 30 acciones, estado de 41D | apache-2.0 | nRMSE 0,0576 (`plastic`) y 0,0656 (`pill`) en entrenamiento |
| ACT | Transformer con chunking de acciones | no disponible en la informacion proporcionada | no disponible | no disponible | no disponible |
| Diffusion Policy | Politica generativa basada en difusion | no disponible en la informacion proporcionada | no disponible | no disponible | no disponible |
| DexFlow MLP etapa 1 (`core4_current_state_gate`) | misma familia, etapa previa | no disponible | no disponible | no disponible | no disponible |

El propio autor descarta explicitamente la comparacion directa con ACT y con DiT, de modo que la fila de ACT se incluye solo como referencia de categoria, no como comparacion medida.

## Limitaciones y advertencias

- El modelo solo se ha entrenado y validado para dos tareas (`plastic` y `pill`). No hay evidencia de generalizacion a otros objetos, iluminaciones, camaras o disposiciones de escena.
- Las metricas publicadas son de bucle abierto y sobre el conjunto de entrenamiento. No hay validacion en bucle cerrado ni en robot real, que es donde aparecen los fallos por acumulacion de error.
- El numero de parametros, la composicion del dataset de entrenamiento, el numero de transiciones y el coste computacional no se especifican.
- Los pesos se distribuyen como checkpoints PyTorch `.ckpt`, formato basado en serializacion que puede ejecutar codigo arbitrario al cargarse. Conviene cargar solo ficheros de origen fiable y en entornos aislados.
- El repositorio no incluye el modulo de despliegue `deploy.real_robot.load_p0_policy` ni el paquete `dexflow`; el fragmento de carga de la model card referencia codigo externo no publicado en este repositorio.
- El modelo no tiene interfaz de lenguaje, por lo que no hay riesgos de alucinacion textual ni sesgos linguisticos, pero si existe el riesgo propio de una politica de imitacion: ejecutar acciones fuera de distribucion cuando el estado observado se aleja del dataset.
- La licencia apache-2.0 permite uso comercial y modificacion, con la obligacion habitual de conservar el aviso de licencia y el fichero de cambio. No se declaran restricciones adicionales.
- El repositorio registra 0 descargas y 0 likes en la fecha consultada, por lo que no existe comunidad de validacion independiente que haya reproducido los resultados.
- Las fechas de creacion y actualizacion (2026-09-15) son muy cercanas entre si, lo que sugiere que el repositorio no ha pasado por ciclos de mantenimiento.
- La busqueda web realizada no devolvio ninguna fuente relacionada con el modelo: los resultados obtenidos corresponden a documentacion de Google Maps y no guardan relacion con este repositorio. No se dispone de paper, blog tecnico ni informe de evaluacion externo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Humantwin/dexflow-v3-stage2-tasks
- Organizacion Humantwin en Hugging Face: https://huggingface.co/Humantwin
- Paper, blog tecnico, repositorio de codigo y demos: no disponibles en la informacion proporcionada.
