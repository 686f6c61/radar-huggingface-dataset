# jklrc/mycobot-openvla-adapters

## Resumen

`jklrc/mycobot-openvla-adapters` es una coleccion de 41 checkpoints de adaptadores LoRA archivados, junto con sus procesadores y configuraciones de politica, derivados de experimentos de manipulacion robotica sobre un brazo myCobot 280 Pi. Los adaptadores se han entrenado sobre el modelo base `openvla/openvla-7b`, un modelo vision-language-action (VLA) de 7 mil millones de parametros desarrollado por OpenVLA, y se distribuyen mediante la libreria PEFT.

El repositorio no contiene un modelo entrenado end-to-end listo para produccion, sino un archivo historico de etapas de entrenamiento. Segun la model card, el checkpoint original 25200 alcanzo exito de colocacion en 7 de 10 casos simulados fijos, mientras que el checkpoint especializado en retirada 26400 solo cuenta con validacion offline y su evaluacion en bucle cerrado esta pendiente. No se ha establecido ninguna tasa de exito en robot fisico.

La relevancia de esta publicacion es acotada: sirve como material de reproducibilidad para experimentos de fine-tuning con LoRA sobre OpenVLA en un hardware concreto (myCobot 280 Pi), no como un modelo generalista. La informacion disponible sobre arquitectura interna, datos de entrenamiento y benchmarks es muy limitada, por lo que muchos campos de esta ficha se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptadores LoRA (rank 32, alpha 16) sobre el modelo base OpenVLA-7B (vision-language-action) |
| Parametros totales | No disponible (el modelo base OpenVLA-7B tiene 7B; el tamano de los adaptadores no se especifica) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (entrenamiento en BF16; no se documentan cuantizaciones para inferencia) |
| Idiomas soportados | No disponible |
| Licencia | MIT |
| Formato de pesos | Adaptadores PEFT (formato de la libreria `peft`); shards tar deduplicados de aproximadamente 1 GiB para los checkpoints |

## Arquitectura y entrenamiento

El modelo consiste en adaptadores LoRA de rango 32 y alpha 16 aplicados sobre `openvla/openvla-7b`. El entrenamiento se realizo en precision BF16. Los 41 checkpoints corresponden a distintos directorios de ejecucion y contadores de checkpoint locales, que identifican etapas de entrenamiento diferenciadas. Se conserva el estado completo del optimizador y del generador de numeros aleatorios (RNG) y del muestreador para tres configuraciones concretas: original 25200, original 26944 y especializada en retirada 26400. El resto de checkpoints solo soportan inferencia y comparaciones historicas.

La model card no detalla la composicion del dataset, el numero de tokens de entrenamiento ni si se aplicaron tecnicas de RLHF o DPO. Tampoco se describen innovaciones arquitectonicas propias mas alla del uso de LoRA sobre el VLA base. La restauracion de los checkpoints requiere el manifiesto de restauracion y el script `restore_archive.py` del repositorio de GitHub asociado, ademas de descargar el modelo base y conservar su licencia. Es necesario usar la camara archivada, las estadisticas de acciones y el codigo de historial y politica correspondiente.

## Capacidades

- Control robotico de manipulacion: los adaptadores estan entrenados para tareas de colocacion y retirada sobre el brazo myCobot 280 Pi.
- Percepcion visual y mapeo a acciones: al derivar de OpenVLA-7B, heredan la capacidad del modelo base de procesar imagenes y generar acciones motoras.
- Ejecucion de politicas especificas: cada checkpoint representa una etapa o especializacion concreta (por ejemplo, retirada especializada en 26400).
- Inferencia con estado de optimizador: tres checkpoints permiten reanudar entrenamiento con estado completo de optimizador, RNG y muestreador.
- Comparacion historica: el resto de checkpoints permiten reproducir y comparar etapas intermedias de entrenamiento.
- No se documentan capacidades de tool calling, agentes multi-paso, multilingue, thinking mode, vision general, audio ni generacion de texto libre.

## Casos de uso

- Reproducibilidad de experimentos de fine-tuning: investigadores que quieran replicar el entrenamiento LoRA sobre OpenVLA-7B en un myCobot 280 Pi pueden restaurar los checkpoints con el manifiesto y el script proporcionados y comparar etapas.
- Reanudacion de entrenamiento: los checkpoints 25200, 26944 y 26400 conservan estado de optimizador, RNG y muestreador, lo que permite continuar el entrenamiento desde esas etapas sin reiniciar.
- Analisis de especializacion de politicas: comparar el checkpoint original 25200 con el especializado en retirada 26400 para estudiar como cambia el comportamiento ante tareas de retirada.
- Validacion offline de politicas roboticas: usar los checkpoints con validacion offline documentada para evaluar metricas de politica antes de desplegar en hardware fisico.
- Docencia y formacion en robotica con VLA: el conjunto de adaptadores y configuraciones sirve como material didactico para entender el flujo de fine-tuning de OpenVLA con LoRA.
- Base para nuevos experimentos en myCobot: partir de un adaptador ya entrenado y ajustarlo a variaciones de la tarea o del entorno, aprovechando la licencia MIT y el modelo base abierto.

## Benchmarks y rendimiento

| Metrica | Checkpoint | Resultado | Condiciones |
|---|---|---|---|
| Exito de colocacion | Original 25200 | 7/10 | 10 casos simulados fijos |
| Validacion offline | Retirada especializada 26400 | Solo validacion offline | Evaluacion en bucle cerrado pendiente |
| Tasa de exito en robot fisico | No disponible | No establecida | No se ha medido |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, ya que se trata de un modelo de robotica y no de un LLM generalista.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada; depende del modelo base OpenVLA-7B y de la precision de carga (BF16 implicaria del orden de 14 GB solo para pesos, sin contar activaciones ni vision).
- GPU recomendadas: no disponible; por el tamano del modelo base, se requeriria al menos una GPU con 16-24 GB de VRAM en BF16, aunque no se documenta oficialmente.
- Compatibilidad con GPU de consumo: no confirmada; probablemente requiere GPUs de gama alta (RTX 4090 o superior) o profesionales (A100, H100) para el modelo base completo.
- Opciones de despliegue: no se documentan frameworks de serving (vLLM, llama.cpp, Ollama, TGI); la libreria indicada es `peft`, y se requiere el codigo de politica e historial del repositorio de GitHub.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| `jklrc/mycobot-openvla-adapters` | Adaptadores sobre 7B | No disponible | MIT | Hugging Face (41 checkpoints) | Especifico para myCobot 280 Pi |
| `openvla/openvla-7b` | 7B | No disponible | No disponible en la informacion | Hugging Face | Modelo base VLA generalista |
| Otros adaptadores LoRA sobre OpenVLA | No disponible | No disponible | Variable | No disponible | No se dispone de datos comparables en la informacion proporcionada |

No se dispone de informacion suficiente para comparar rendimiento con alternativas de la misma categoria.

## Limitaciones y advertencias

- No se ha establecido ninguna tasa de exito en robot fisico; los resultados son de simulacion o validacion offline.
- El checkpoint especializado en retirada 26400 carece de evaluacion en bucle cerrado; su comportamiento real no esta verificado.
- El repositorio es un archivo historico de 41 checkpoints, no un modelo unico listo para produccion; requiere identificar cada checkpoint por su ruta de ejecucion completa.
- La restauracion depende de scripts y manifiestos externos alojados en un repositorio de GitHub, lo que anade un punto de fallo.
- Es necesario usar la camara archivada, las estadisticas de acciones y el codigo de historial y politica correspondientes; no hacerlo puede invalidar los resultados.
- Sesgos conocidos: no documentados.
- Riesgo de alucinacion: no aplica en el sentido de texto generativo, pero si existe riesgo de acciones erroneas en el robot.
- Limitaciones de contexto e idioma: no documentadas.
- Licencia MIT para los adaptadores, pero el modelo base OpenVLA-7B tiene su propia licencia que debe conservarse y respetarse.
- Uso comercial: la licencia MIT lo permite para los adaptadores, pero debe verificarse la licencia del modelo base y el cumplimiento en robotica fisica.

## Enlaces

- Hugging Face: https://huggingface.co/jklrc/mycobot-openvla-adapters
- Modelo base: https://huggingface.co/openvla/openvla-7b
- Repositorio de experimentos y scripts de restauracion: https://github.com/n3115702251-crypto/mycobot-openvla-experiments
