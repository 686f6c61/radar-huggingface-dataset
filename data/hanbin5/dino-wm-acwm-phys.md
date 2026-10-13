# hanbin5/dino-wm-acwm-phys

## Resumen

dino-wm-acwm-phys es un repositorio de checkpoints de modelos de mundo (world models) de la familia DINO-WM, publicados por el usuario hanbin5 para el conjunto de entornos de manipulacion ACWM-Phys. Un world model no genera texto ni responde a instrucciones: aprende la dinamica de un entorno visual para predecir la evolucion de sus representaciones latentes dado un historial de fotogramas y una secuencia de acciones. En este caso, el espacio latente no se aprende desde cero, sino que se apoya en caracteristicas de un encoder DINOv2 ViT-S/14 congelado.

El paquete cubre cuatro entornos fisicos: Pour Water (verter agua), Cloth Move (mover tela), Push Sand (empujar arena) y Stack Cube (apilar cubos). Para cada uno se publican varias ejecuciones de entrenamiento, incluidas variantes de historial largo y una variante con episodios fuera de distribucion (out-of-distribution, OoD) anadidos al conjunto de entrenamiento. El repositorio pesa 7,4 GB, reparte los pesos en directorios `outputs/<run>/` y no incluye el encoder visual, que debe obtenerse aparte.

Su relevancia es acotada pero clara para investigacion en aprendizaje basado en modelo y robotica: ofrece pesos ya entrenados y reproducibles (semilla 0, configuracion Hydra incluida) sobre entornos de manipulacion con materiales deformables y granulares, y permite evaluar planificacion y prediccion de dinamica sin reentrenar desde cero. No hay pipeline declarado, ni licencia, ni idiomas, y el repositorio no registra descargas ni likes en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | World model latente sobre caracteristicas congeladas de DINOv2 ViT-S/14; modulos `predictor`, `decoder`, `action_encoder` y `proprio_encoder` |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible; contexto temporal de `num_hist` 1 o 3 fotogramas con frameskip 5 |
| Tipos de cuantizacion | no disponible (no se publican versiones cuantizadas) |
| Idiomas soportados | no disponible (modelo visomotor; no procesa lenguaje natural) |
| Licencia | no disponible en la model card; los datos ACWM-Phys son CC BY 4.0 y el codigo DINO-WM es MIT |
| Formato de pesos | `.pth` (serializacion con `torch.save` de objetos de modulo; son ficheros pickle) |
| Tamano del repositorio | 7,4 GB |
| Resolucion de entrada | 224 px |
| Encoder visual | DINOv2 ViT-S/14 congelado, no incluido en el repositorio |
| Entornos cubiertos | Pour Water, Cloth Move, Push Sand, Stack Cube |

## Arquitectura y entrenamiento

El modelo sigue el diseno de DINO-WM: un encoder visual congelado (DINOv2 ViT-S/14) transforma los fotogramas en caracteristicas, y sobre ese espacio latente se entrena un `predictor` que modela la dinamica condicionada por acciones, junto con un `action_encoder` y un `proprio_encoder` para las acciones y el estado propioceptivo del robot. Un `decoder` reconstruye observaciones a partir del latente predicho. El encoder no se guarda en este repositorio porque sus pesos no se modifican.

Todos los entrenamientos usan fotogramas de 224 px, frameskip 5, tamano de lote 24, tasa de aprendizaje del predictor 5e-5 y semilla 0. Las ejecuciones base son `train_pw_h1f5` y `train_pw_h3f5` (Pour Water, con `num_hist` 1 y 3), `train_cloth_h1f5` (61.875 pasos), `train_sand_h1f5` (64.998 pasos) y `train_stack_h1f5` (62.125 pasos). Las variantes `*_long` continuan el entrenamiento de las ejecuciones base y solo actualizan el predictor y los dos encoders sobre caracteristicas DINOv2 ya calculadas, reutilizando el decoder original; por ejemplo, `train_cloth_h1f5_long` alcanza las epocas 30 y 60 partiendo de la epoca 15. La ejecucion `train_cloth_h1f5_oodmix` entrena predictor y encoders desde pesos aleatorios con 1.800 episodios de entrenamiento mas 25 episodios `smaller` y 25 `larger` de `ood_test`, dejando otros 25 + 25 episodios como `held_out`; el reparto se detalla en `split.json`. No se documenta en la informacion disponible el uso de RLHF, DPO ni ningun otro ajuste por preferencias, algo por otra parte esperable en un modelo de dinamica y no de lenguaje.

## Capacidades

- Prediccion de dinamica visual: genera rollouts latentes de los cuatro entornos entrenados (verter agua, mover tela, empujar arena, apilar cubos) a partir de un historial de fotogramas y una secuencia de acciones.
- Reconstruccion de observaciones: el modulo `decoder` proyecta los latentes predichos de vuelta al espacio de imagen.
- Modelado condicionado por acciones: el `action_encoder` integra las acciones del agente como variable de control de la prediccion.
- Uso de estado propioceptivo: el `proprio_encoder` incorpora informacion del estado interno del robot.
- Historial temporal configurable: se publican variantes con `num_hist` 1 y con `num_hist` 3 fotogramas.
- Generalizacion fuera de distribucion: la variante `train_cloth_h1f5_oodmix` esta preparada para evaluar escenarios con objetos de tamano distinto al de entrenamiento.
- Planificacion basada en modelo y evaluacion de politicas: los checkpoints se cargan desde el script `repro/eval/eval_acwm_phys.py` del repositorio de codigo asociado.
- No dispone de tool calling, function calling, agentes conversacionales, capacidades multilingues, vision-lenguaje, audio ni modo de razonamiento explicito.

## Casos de uso

- Planificacion de manipulacion robotica: el predictor permite simular en el espacio latente varias secuencias de acciones antes de ejecutar una en el robot, lo que reduce el numero de interacciones fisicas necesarias en tareas como apilar cubos o verter agua.
- Investigacion en world models: sirve como punto de partida reproducible (semilla 0 y `hydra.yaml` incluido) para comparar variantes de historial temporal, de decodificador o de estrategias de entrenamiento largo.
- Evaluacion de generalizacion OoD: la ejecucion `train_cloth_h1f5_oodmix` y su `split.json` permiten medir la degradacion del modelo cuando los objetos son `smaller` o `larger` que los vistos en entrenamiento.
- Manipulacion de materiales deformables: los entornos Cloth Move y Push Sand son casos donde la dinamica es dificil de modelar analiticamente, y un world model aprendido puede sustituir a un simulador rigido en tareas de robotica blanda.
- Generacion de datos sinteticos para aprendizaje por refuerzo: los rollouts del modelo pueden emplearse como trayectorias imaginadas para entrenar o preentrenar politicas antes del despliegue real.
- Estudio de representaciones visuales congeladas: al mantener fijo DINOv2 ViT-S/14, el repositorio permite analizar hasta que punto un backbone visual generico captura la informacion necesaria para predecir dinamica fisica.
- Reproduccion y auditoria de resultados: los `epoch_logs.jsonl` de las ejecuciones base y los checkpoints intermedios numerados (`model_<epoch>.pth`) permiten rehacer curvas de entrenamiento y verificar la evolucion del error.
- Evaluacion comparativa de decoders: las variantes `*_long` conservan el decoder de la ejecucion base mientras mejoran predictor y encoders, lo que aísla el efecto del entrenamiento adicional sobre la prediccion frente a la reconstruccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica unicamente que los resultados se encuentran en la rama de codigo `hanbin5/acwm-phys` del repositorio `jongmin-s-multicore/thread0`, pero no reproduce cifras, y las busquedas web realizadas no devolvieron ningun enlace relevante al modelo (los resultados obtenidos correspondian a dominios sin relacion alguna). No se dispone por tanto de valores de error de prediccion, de exito en tareas ni de comparaciones numericas con otros world models.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. No se publican cifras oficiales y el repositorio (7,4 GB) incluye muchos checkpoints y, en las ejecuciones base, los estados de los optimizadores, por lo que su tamano no equivale al de un unico modelo en memoria.
- El modelo necesita, ademas de los cuatro modulos entrenados aqui, un encoder DINOv2 ViT-S/14 congelado que no se distribuye en este repositorio; el coste de VRAM incluye ese encoder. ViT-S es la variante mas pequena de la familia DINOv2, por lo que el backbone no deberia ser el cuello de botella, pero no hay mediciones publicadas.
- GPU recomendadas: no disponible. No se especifica ninguna GPU objetivo ni se documentan pruebas de latencia o throughput.
- Compatibilidad con GPU de consumo: no verificada. No hay datos publicados que permitan confirmar o descartar su ejecucion en tarjetas tipo RTX 4090 o inferiores.
- Opciones de despliegue: no se contemplan vLLM, llama.cpp, Ollama ni TGI, ya que los pesos no son de un modelo de lenguaje ni usan safetensors o GGUF. El unico camino documentado es el script de evaluacion del repositorio de codigo asociado, invocado con el nombre de la ejecucion.
- Latencia y throughput: no disponible.
- Almacenamiento: el repositorio completo ocupa 7,4 GB y la descarga se realiza con `huggingface-cli download hanbin5/dino-wm-acwm-phys --local-dir $DINO_TRAIN`.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de otros world models en la informacion proporcionada, por lo que la comparacion se limita a aspectos estructurales y de disponibilidad frente al DINO-WM original, del que este repositorio deriva.

| Aspecto | hanbin5/dino-wm-acwm-phys | DINO-WM original (gaoyuezhou/dino_wm) |
|---|---|---|
| Parametros totales | no disponible | no disponible |
| Contexto | `num_hist` 1 o 3 fotogramas, frameskip 5 | configurable por el usuario en el codigo base |
| Rendimiento | no se publican cifras | no se publican cifras en la informacion disponible |
| Licencia | no disponible en la model card | MIT (codigo) |
| Disponibilidad | checkpoints `.pth` en HuggingFace, 0 descargas y 0 likes | repositorio de codigo en GitHub |
| Especificidad | pesos entrenados para cuatro entornos de ACWM-Phys | implementacion general, sin pesos de estos entornos |
| Formato de pesos | pickle (`torch.save` de objetos de modulo) | mismo formato en el codigo upstream |

Para alternativas de otras familias (por ejemplo world models recurrentes o basados en transformers discretos), no hay datos disponibles que permitan una comparacion rigurosa.

## Limitaciones y advertencias

- Seguridad al cargar: los checkpoints son pickles generados con `torch.save`, que pueden ejecutar codigo arbitrario al deserializarse. La propia model card advierte de cargarlos unicamente desde una fuente de confianza y con el codigo de la rama indicada.
- Licencia no declarada: la model card no especifica licencia para los pesos. Esto bloquea o complica cualquier uso comercial sin aclaracion previa del autor, aunque los datos de origen sean CC BY 4.0 y el codigo DINO-WM sea MIT.
- Dependencia externa: el encoder DINOv2 ViT-S/14 congelado no se incluye en el repositorio y debe obtenerse por separado, con su propia licencia.
- Ambito restringido: el modelo cubre cuatro entornos concretos de ACWM-Phys. No es un modelo de proposito general y no se documenta su comportamiento en otros dominios o morfologias de robot.
- Riesgo de deriva en rollouts largos: como todo world model latente, la prediccion acumula error a medida que se alarga el horizonte; al no publicarse metricas de error, no es posible acotar ese horizonte de forma fiable.
- Sesgos del conjunto de datos: las dinamicas aprendidas reflejan las condiciones fisicas y los objetos de los episodios de ACWM-Phys (incluidos los tamanos `smaller` y `larger` de la variante OoD); escenarios con materiales, iluminacion o camaras distintas pueden degradar la prediccion.
- Ausencia de validacion comunitaria: el repositorio figura con 0 descargas y 0 likes, y no hay resultados de benchmarks publicados ni verificacion independiente.
- Configuracion dependiente del entorno: `hydra.yaml` contiene rutas absolutas sustituidas por las variables `$DINO_TRAIN` y `$DATASET_DIR`, de modo que es necesario preparar `repro/env.sh` antes de evaluar.
- Limitacion idiomatica: el modelo no procesa lenguaje natural, por lo que no aplica ninguna consideracion multilingue.
- Trazabilidad: el paper citado se identifica como arXiv:2605.08567 y las fechas del repositorio son de octubre de 2026; no se ha podido contrastar esa referencia con fuentes externas en la busqueda realizada.

## Enlaces

- Repositorio del modelo en HuggingFace: https://huggingface.co/hanbin5/dino-wm-acwm-phys
- Dataset ACWM-Phys: https://huggingface.co/datasets/t1an/ACWM-Phys
- Paper de ACWM-Phys: https://arxiv.org/abs/2605.08567
- Rama de codigo con los cambios de este autor: https://github.com/jongmin-s-multicore/thread0/tree/hanbin5/acwm-phys
- Codigo upstream de DINO-WM: https://github.com/gaoyuezhou/dino_wm
- Busquedas web realizadas: no devolvieron ningun enlace relevante al modelo (los resultados correspondian a dominios sin relacion).
