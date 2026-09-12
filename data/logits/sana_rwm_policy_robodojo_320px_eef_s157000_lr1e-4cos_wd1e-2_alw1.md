# logits/sana_rwm_policy_robodojo_320px_eef_s157000_lr1e-4cos_wd1e-2_alw1

## Resumen

SANA-RWM es un modelo de política robótica (policy) entrenado mediante ajuste supervisado (SFT) sobre el stack SANA-RWM, un *world-action model* bidireccional orientado a manipulación con brazo robótico. Lo publica el usuario `logits` en Hugging Face con el identificador `logits/sana_rwm_policy_robodojo_320px_eef_s157000_lr1e-4cos_wd1e-2_alw1`, y su etiquetado lo clasifica dentro de la categoría `robotics` con el pipeline `robotics`. El problema que aborda es el aprendizaje de políticas de control a partir del conjunto de datos RoboDojo, en resolución de trabajo de 320 píxeles y con un espacio de acciones unificado en coordenadas de efector final (`eef`).

El repositorio no es un paquete de inferencia al uso, sino un *live resume bundle*: un directorio de reanudación de entrenamiento que se sobrescribe con cada nuevo checkpoint y cuya historia se aplasta (squash), de modo que solo existe el último bundle. El contenido actual corresponde al checkpoint `epoch_6_step_35000` (época 6, paso 35000 del dataloader) del run `sft_robodojo_arxx5_unified_eef_f25_320px_4node_s157000_lr1e-4cos_wd1e-2_alw1_v1`.

Su relevancia es fundamentalmente de investigación: permite reproducir, reanudar o auditar un entrenamiento de política robótica con estados de optimizador, scheduler, estados aleatorios por rango, artefactos de normalización con hash fijado y tablas de validación *held-out*. El tamaño del repositorio es de 858,0 GB, aunque el fichero de pesos propiamente dicho ocupa aproximadamente 16 GB. No se han publicado especificaciones de arquitectura, licencia ni idiomas en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el nombre del run indica un *world-action model* bidireccional sobre el stack SANA-RWM; no se detalla la topologia) |
| Parametros totales | no disponible (el bundle incluye un fichero de pesos de ~16 GB en FSDP `FULL_STATE_DICT`) |
| Parametros activos | no disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | no disponible (el nombre del run incluye `f25` y `320px`, sin documentacion que los defina) |
| Tipos de cuantizacion | no disponible (no se publican variantes cuantizadas) |
| Idiomas soportados | no disponible (modelo de politica robotica; no se documenta soporte linguistico) |
| Licencia | no disponible |
| Formato de pesos | PyTorch `pytorch_model_fsdp.bin` (FSDP `FULL_STATE_DICT`), mas `optimizer.bin`, `scheduler.bin`, `random_states_*.pkl` (32 rangos) y `metadata.pth` |

## Arquitectura y entrenamiento

No se dispone de una descripcion formal de la arquitectura en la informacion proporcionada. Las etiquetas del repositorio (`world-action-model`, `policy-sft`, `sana-rwm`) y el nombre del run permiten situarlo como una politica de accion entrenada por imitacion sobre un modelo de mundo, con observaciones a 320 píxeles y acciones en el espacio de efector final unificado (`unified_eef`). El identificador del run tambien recoge los hiperparametros principales: `lr1e-4cos` (tasa de aprendizaje 1e-4 con planificador coseno), `wd1e-2` (weight decay 0,01), `alw1` (peso de la perdida de accion igual a 1) y `4node` (entrenamiento distribuido en 4 nodos). El sufijo `s157000` indicaria un paso global de 157000, mientras que el checkpoint empaquetado corresponde al paso 35000 del dataloader en la epoca 6.

El bundle documenta el proceso de entrenamiento con un nivel de detalle poco habitual: incluye el estado completo de AdamW (~33 GB, solo para reanudacion), el estado del scheduler, los estados aleatorios de los 32 rangos, el grafo de metadatos, los mirrors locales de W&B de los runs de entrenamiento y evaluacion (proyecto `sana-rwm`), el `work_dir` de validacion *held-out* con 632 ficheros (paneles y logs), los scripts `sbatch` del watcher de hitos y del validador, el arbol de codigo con `git head ab6b1faec32ac189d15138178f6a907407af9959`, el entorno conda resuelto y un `RESTORE.md` con instrucciones para reanudar en otro cluster. Los artefactos de normalizacion se distribuyen junto al modelo y estan fijados por `normalization_sha256` en el YAML: desplegar o evaluar sin exactamente esos artefactos produce resultados incorrectos.

## Capacidades

- Generacion de acciones de manipulacion robotica: el modelo actua como politica que produce comandos en el espacio de efector final unificado a partir de observaciones visuales de 320 píxeles.
- Modelado de mundo y accion (*world-action model*): la doble naturaleza sugerida por la etiqueta implica prediccion de la dinamica futura ademas de la accion, aunque no se detalla la interfaz exacta.
- Ajuste supervisado por imitacion: `policy-sft` indica entrenamiento sobre demostraciones del conjunto RoboDojo, no por refuerzo.
- Reanudacion y continuacion de entrenamiento: el bundle conserva estado de optimizador, scheduler y estados aleatorios, por lo que soporta *resume* bit a bit en otro cluster.
- Evaluacion reproducible: incluye tablas MSE de validacion *held-out* en el run de evaluacion de W&B, lo que permite contrastar checkpoints.
- Soporte de *tool calling* / *function calling*: no aplica (no es un modelo de lenguaje conversacional).
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no aplica / no disponible.
- Modo *thinking*, vision o audio como capacidades declaradas: no disponible.

## Casos de uso

- Reanudacion de entrenamientos largos: un equipo que entrene el mismo run en otro cluster puede arrancar desde `epoch_6_step_35000` usando `optimizer.bin`, `scheduler.bin` y los `random_states_*.pkl` de los 32 rangos, evitando repetir las seis primeras epocas.
- Auditoria y reproduccion de resultados: el bundle conserva el YAML resuelto, el log de entrenamiento, el `git head` y el `conda list`, lo que permite reconstruir exactamente el entorno y verificar que una reevaluacion reproduce las cifras publicadas.
- Fine-tuning posterior sobre un robot concreto: partiendo de una politica ya ajustada sobre RoboDojo en espacio `eef`, un laboratorio puede especializarla en su propia celda de manipulacion con un conjunto reducido de demostraciones propias.
- *Benchmarking* interno de politicas: las tablas MSE de validacion *held-out* y el `work_dir` de validacion con 632 ficheros permiten comparar checkpoints intermedios frente al empaquetado sin volver a entrenar.
- Desarrollo de pipelines de evaluacion en simulacion: el `work_dir` de validacion y los scripts sbatch del validador sirven como base para montar un bucle automatico de evaluacion tras cada nuevo checkpoint.
- Investigacion en modelos de mundo para robotica: el par de runs de entrenamiento y evaluacion en W&B, con el prefijo `sana-rwm`, permite estudiar como la perdida de accion (`alw1`) y el planificador coseno afectan a la calidad de las trayectorias predichas.
- Punto de partida para ablaciones de hiperparametros: el nombre del run codifica `lr`, `wd` y `alw`, de modo que comparar este bundle con otros del mismo autor facilita analisis controlados de estos tres ejes.
- Integracion en un banco de pruebas de despliegue robotico: al estar los pesos en `FULL_STATE_DICT`, un ingeniero puede consolidarlos y exportarlos a un runtime de inferencia propio para medir latencia real sobre el hardware del robot.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica metrica mencionada son las tablas de MSE sobre el conjunto de validacion *held-out*, que no se incluyen en la model card sino que residen en el run de evaluacion de W&B `sft_robodojo_arxx5_unified_eef_f25_320px_4node_s157000_lr1e-4cos_wd1e-2_alw1_v1_eval` (proyecto `sana-rwm`). No se dispone de cifras de MMLU, HumanEval, GSM8K ni de metricas de exito en tareas de manipulacion, por lo que no se presenta tabla comparativa.

## Requisitos de hardware

- El fichero de pesos empaquetado ocupa aproximadamente 16 GB; en formato `FULL_STATE_DICT` esta sin fragmentar, por lo que puede cargarse en un unico dispositivo, pero la VRAM exacta necesaria para inferencia no esta documentada.
- El estado del optimizador ocupa aproximadamente 33 GB adicionales y solo es necesario para reanudar el entrenamiento, no para inferencia.
- El repositorio completo ocupa 858 GB, debido a los estados de optimizador, los mirrors de W&B y el arbol de validacion *held-out*; no es necesario descargarlo entero para desplegar el modelo.
- El entrenamiento original se ejecuto en 4 nodos con 32 rangos FSDP, lo que da una idea del orden de magnitud del coste de reentrenamiento, no del de inferencia.
- GPU recomendadas para inferencia: no disponible en la documentacion. Como referencia orientativa basada unicamente en el tamano del fichero de pesos, un acelerador con 24 GB o mas (por ejemplo, RTX 4090, L40S, A100 40/80 GB, H100) seria el rango a considerar, pero debe validarse con mediciones propias.
- Opciones de despliegue: vLLM, llama.cpp, Ollama o TGI no aplican, ya que no se trata de un modelo de lenguaje. El despliegue requiere consolidar el estado FSDP y cargar el modelo en el framework de entrenamiento original (el bundle incluye el entorno conda y `RESTORE.md`).
- Denormalizacion obligatoria: cualquier despliegue o evaluacion debe usar exactamente los artefactos de `normalization/` cuyo hash coincide con el pin `normalization_sha256` del YAML; en caso contrario, las acciones resultantes seran incorrectas.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye datos de parametros, contexto, rendimiento ni licencia de este modelo, ni referencias a alternativas comparables. La busqueda web asociada no devolvio resultados relacionados con el modelo (los enlaces recuperados corresponden a paginas de medicion de velocidad de internet y foros de Steam, sin ninguna conexion con robotica ni con modelos de politica), por lo que no es posible construir una tabla comparativa con cifras verificables.

## Limitaciones y advertencias

- Licencia no declarada: no se especifica ninguna licencia, por lo que el uso comercial queda en un limbo juridico hasta que el autor lo aclare.
- Model card minima: no se documentan arquitectura, numero de parametros, longitud de contexto, idiomas ni procedimiento de inferencia; el repositorio esta pensado como bundle de reanudacion, no como artefacto de despliegue listo para produccion.
- Repositorio sobrescrito: el autor indica explicitamente que el repositorio se reescribe con cada nuevo checkpoint y que su historial se aplasta, de modo que la version que se descargue hoy puede desaparecer manana. Cualquier uso serio deberia fijar y archivar una copia con su hash.
- Dependencia critica de la normalizacion: los artefactos de `normalization/` estan fijados por SHA-256; sustituirlos o alterarlos invalida las predicciones.
- Idoneidad para produccion no demostrada: no hay benchmarks publicos de exito en tareas, ni latencias, ni tasas de fallo; es un checkpoint de investigacion.
- Riesgo de sobreajuste al dominio de entrenamiento: el nombre del run fija `robodojo`, `arxx5` y `eef`, lo que apunta a una plataforma robotica y un conjunto de datos concretos; la transferencia a otros robots, camaras o espacios de accion requeriria fine-tuning.
- Alucinacion en el sentido linguistico: no aplica al no ser un modelo de lenguaje. El riesgo analogo es la generacion de acciones fisicamente invalidas o inseguras, que en un robot real puede provocar colisiones o danos.
- Sesgos: no evaluados ni documentados. En robótica, los sesgos se manifiestan como sesgos de distribucion de demostraciones (posiciones, objetos, iluminacion, operadores), no como sesgos textuales.
- Ausencia de cuantizaciones publicadas: no hay versiones GGUF, AWQ ni GPTQ, lo que limita el despliegue en hardware de gama baja.
- Idioma: la model card esta en ingles y el modelo no tiene capacidades linguisticas declaradas; la ficha en castellano se elabora a partir de la informacion disponible.

## Enlaces

- Ficha del modelo en Hugging Face: https://huggingface.co/logits/sana_rwm_policy_robodojo_320px_eef_s157000_lr1e-4cos_wd1e-2_alw1
- Repositorio de pesos (mismo enlace, ruta de descarga): `checkpoints/epoch_6_step_35000/model/pytorch_model_fsdp.bin`
- Documento de reanudacion incluido en el repo: `RESTORE.md`
- Metadatos del entrenamiento incluidos en el repo: `run_meta/` (YAML resuelto, launcher, log de entrenamiento, `git head ab6b1faec32ac189d15138178f6a907407af9959`, `conda list`)
- Artefactos de normalizacion incluidos en el repo: `normalization/` (con `SHA256.txt`)
- Runs de W&B incluidos en el repo: `wandb/` (entrenamiento `sft_robodojo_arxx5_unified_eef_f25_320px_4node_s157000_lr1e-4cos_wd1e-2_alw1_v1` y evaluacion `sft_robodojo_arxx5_unified_eef_f25_320px_4node_s157000_lr1e-4cos_wd1e-2_alw1_v1_eval`, proyecto `sana-rwm`)
- Validacion *held-out* incluida en el repo: `validation/holdout/` (632 ficheros) y `validation/workspace/`
- Papers, blogs, repositorios de codigo o demos adicionales: no disponibles (la busqueda web no devolvio ningun enlace relacionado con el modelo)
