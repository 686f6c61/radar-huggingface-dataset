# myendless/action-repre-newtask14-n32-lap-v4-j14-h32-head10k-0d64a2db

## Resumen

`myendless/action-repre-newtask14-n32-lap-v4-j14-h32-head10k-0d64a2db` es un checkpoint de investigacion para robotica publicado por el usuario de Hugging Face myendless (Li Ying). No es un modelo de lenguaje conversacional ni un modelo vision-lenguaje al uso, sino un artefacto de entrenamiento orientado a la representacion de acciones en politicas de manipulacion robotica: recibe observaciones (la nomenclatura del run indica RGB completo) y produce vectores de accion de 14 dimensiones con un horizonte de prediccion de 32 pasos. El repositorio ocupa 11,3 GB y contiene el checkpoint PyTorch original, no una exportacion estandar de `transformers.AutoModel`.

La relevancia del artefacto es de tipo reproducible: forma parte de una familia de experimentos (`qwenpi-v4`) que el autor documenta con trazabilidad SHA256 de datos, normalizacion, procesador y configuracion de entrenamiento en un repositorio de datos hermano. El checkpoint corresponde a 10 000 pasos reales de entrenamiento de la cabeza de accion, obtenidos como continuacion (`from30k`) de un checkpoint fuente de 30 000 pasos, y esta etiquetado por el autor como de categoria `legacy`.

Conviene subrayar que la model card esta en chino, no documenta arquitectura, numero de parametros, contexto, idiomas ni licencia, y que el propio autor advierte de que los resultados de esta familia no deben interpretarse como una comparacion de variable unica frente a otros checkpoints de la misma fuente. Con 0 descargas y 0 likes en el momento de la consulta, es un artefacto de uso interno de un bench de investigacion, no un modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible en la model card; los tags (`robotics`, `action-representation`, `qwenpi-v4`) y la ruta del checkpoint (`starvla_qwenpi_repr_runs_...`) apuntan a un modelo vision-lenguaje-accion (VLA) construido sobre la familia Qwen, sin confirmacion documental |
| Parametros totales | no disponible |
| Parametros activos | no disponible; no se documenta una arquitectura MoE |
| Longitud de contexto | no disponible; no es una ventana de contexto textual. El equivalente funcional es un horizonte de accion de 32 pasos (H32) |
| Tipos de cuantizacion | no disponible; se distribuye un unico checkpoint PyTorch. No hay versiones GGUF, AWQ, GPTQ ni ONNX publicadas |
| Idiomas soportados | no disponible; no se declara ningun idioma y no se documenta si las observaciones incluyen instrucciones en lenguaje natural |
| Licencia | no disponible; la model card no la indica. El dataset hermano `myendless/action_repre` declara apache-2.0, pero esa licencia no es extensible a los pesos de este repositorio |
| Formato de pesos | PyTorch nativo (`.pt`); no es una exportacion estandar de `transformers.AutoModel` y requiere el cargador propio del benchmark |
| Dimension del vector de accion | 14 (`joint14`), segun la model card |
| Horizonte de accion | 32 pasos (`H32`), segun la model card |
| Pasos de entrenamiento | 10 000 pasos reales de la cabeza de accion, partiendo de un checkpoint fuente de 30 000 pasos |
| Tamano del repositorio | 11,3 GB |
| Pipeline declarado | robotics |
| Descargas / likes | 0 / 0 |
| Fechas | creado el 24 de octubre de 2026; actualizado el 24 de octubre de 2026 |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna: no indica si el backbone es un transformer denso, un transformer con cabezas de accion tipo flow matching o difusion, ni cuantos parametros tiene. Lo unico verificable es la estructura de la cabeza de accion declarada (14 dimensiones de salida, horizonte de 32 pasos) y la existencia de un `processor`, un fichero de normalizacion y una configuracion de entrenamiento original referenciados por SHA256 en el repositorio de datos `myendless/action-repre-robotwin-v4-data`, con un `release.json` que contiene el mapeo exacto. El tag `qwenpi-v4` sugiere un linaje Qwen + pi (politica VLA con generacion de acciones por chunks), pero es una inferencia a partir de la nomenclatura, no un dato documentado.

El proceso de entrenamiento se describe por trazabilidad de rutas. El checkpoint fuente es `steps_30000_pytorch_model.pt`, procedente del run `new_task_source_lap_qwenpi_v4_joint14_h32_cleanrandom30k_rgb_full_seed42_20261019`. Sobre esa base se ejecuto el run `new_task/n32_lap_v4_joint14_h32_rgb_full_sourcenorm_head10k_from30k_seed42_20261020_legacy_v1`, que produce este artefacto tras 10 000 pasos adicionales. La nomenclatura indica entrenamiento con imagenes RGB completas, normalizacion heredada de la fuente (`sourcenorm`), una mezcla de datos etiquetada como `cleanrandom` y semilla 42. El autor declara explicitamente tres cautelas metodologicas: la admision de fuentes en el historial de trayectorias ARX de imagen, la proteccion de un tokenizador externo de acciones discretas y de los embeddings asociados, y diferencias en las entradas respecto a una fuente anterior de 20 000 pasos. No se documenta el volumen de tokens, la composicion del dataset, ni si hubo etapas de RLHF o DPO (no aplicables de forma estandar a politicas de robotica, pero no confirmado).

## Capacidades

- Generacion de acciones motoras: produce vectores de 14 dimensiones (posiciones articulares) con un horizonte de 32 pasos por inferencia, lo que permite ejecutar chunks de accion sin replanificar en cada tick de control.
- Percepcion visual: el run de origen se etiqueta como `rgb_full`, por lo que la politica consume observaciones de imagen RGB completas como entrada.
- Manipulacion robonica en tareas tipo `newtask14`: el identificador sugiere una tarea nueva (no vista en el checkpoint base) dentro de un conjunto de 14 variantes o tareas.
- Continuacion de politicas preentrenadas: el checkpoint esta disenado como cabeza de ajuste sobre una base de 30 000 pasos, no como modelo autonomo desde cero.
- Evaluacion reproducible en bench: compatible con el cargador del benchmark y con el ecosistema de datos referenciado (el ecosistema de datasets del autor incluye material de robotwin, robodojo, lerobot y calvin).
- No soporta: generacion de texto, razonamiento simbolico, codigo, matematicas, tool calling, function calling, agentes multi-paso, dialogo multilingue ni vision generalista fuera del dominio de control robotico. No hay modo "thinking", ni audio, ni capacidades multimodales declaradas mas alla de la observacion visual.
- No se documenta soporte de instrucciones en lenguaje natural, aunque el linaje Qwen lo haga plausible; tratarlo como capacidad no verificada.

## Casos de uso

- Evaluacion de representaciones de accion en investigacion VLA: el checkpoint sirve como punto de comparacion en ablaciones sobre dimension del vector de accion (14) y horizonte (32), cargandolo con el loader del benchmark y midiendo tasa de exito en las tareas `newtask14`.
- Reproduccion de experimentos publicados: al referenciar datos, normalizacion y procesador por SHA256, permite reconstruir exactamente el pipeline de entrenamiento de un run concreto (semilla 42, mezcla `cleanrandom`), lo que es util para verificar resultados de un paper o informe interno.
- Ajuste fino sobre una tarea nueva: partir de este checkpoint de 10 000 pasos y continuar el entrenamiento sobre un conjunto propio de demostraciones de manipulacion, aprovechando que ya incorpora la normalizacion de la fuente.
- Pruebas de regresion en pipelines de desarrollo de politicas: integrarlo como caso base en CI para detectar degradaciones cuando se cambia el procesador de observaciones, el tokenizador de acciones o la normalizacion.
- Analisis de sim-to-real en simuladores de robotica: el ecosistema de datos del autor incluye RobotWin y RoboDojo, de modo que el checkpoint puede evaluarse en entornos simulados antes de transferir a un brazo real.
- Estudio de deriva y seguridad en control: al tener horizonte de 32 pasos, es util para medir como se degrada la prediccion a lo largo del chunk y para definir envolventes de seguridad (limites de par, velocidad, colision) antes de desplegar cualquier politica derivada.
- Destilacion o compresion de politicas: usar este checkpoint como profesor para generar trayectorias etiquetadas y entrenar variantes mas ligeras, dado que el artefacto original ocupa 11,3 GB.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tablas de tasa de exito, no referencia ningun leaderboard y el autor advierte explicitamente de que los resultados de esta familia de runs no deben tratarse como una comparacion de variable unica frente a otras fuentes. No se dispone tampoco de latencia ni throughput medidos.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint ocupa 11,3 GB en disco. Cargado en fp32 requiere del orden de 12-16 GB de VRAM solo para los pesos, mas activaciones y buffers de imagen; en fp16 (si la precision del checkpoint lo permite, dato no confirmado) se reduce aproximadamente a 6-8 GB de pesos. Son estimaciones a partir del tamano del fichero, no medidas publicadas.
- GPU recomendadas: NVIDIA A100 (40 u 80 GB) o H100 para evaluacion por lotes y entrenamiento; L40S (48 GB) como alternativa de coste medio. Para inferencia de un solo episodio, una RTX 4090 o RTX 3090 de 24 GB deberia ser suficiente segun el calculo anterior, siempre que la politica no requiera precision fp32 completa con lote grande.
- Cabe en GPU de consumo: probablemente si, en tarjetas de 24 GB (RTX 4090, RTX 3090, RTX A6000). En tarjetas de 12-16 GB el margen es muy ajustado y no esta verificado.
- Opciones de despliegue: no es compatible con vLLM, TGI, llama.cpp ni Ollama, porque no es un modelo de lenguaje con pesos en safetensors/GGUF. El despliegue requiere PyTorch y el cargador especifico del benchmark indicado por el autor, ademas de la normalizacion y el procesador referenciados en el repositorio de datos.
- Latencia y throughput: no disponibles. Como referencia cualitativa, el horizonte de 32 pasos amortigua el coste de inferencia, ya que una sola pasada por la red cubre un chunk completo de control.

## Comparativa con modelos similares

No hay datos publicados de este checkpoint (ni parametros, ni contexto, ni metricas) que permitan una comparacion cuantitativa. La siguiente tabla es orientativa y solo recoge datos publicos y bien establecidos de las alternativas; las celdas de este modelo se marcan como no disponibles.

| Modelo | Parametros | Horizonte / salida | Licencia | Disponibilidad |
|---|---|---|---|---|
| Este checkpoint (`myendless/action-repre-...-head10k`) | no disponible | 32 pasos, vector de 14 dimensiones | no disponible | repositorio de 11,3 GB, 0 descargas |
| OpenVLA | 7B | acciones discretizadas, un paso por inferencia | licencia abierta con condiciones (consultar model card) | pesos publicos en Hugging Face |
| pi-0 (Physical Intelligence) | del orden de 3B | chunks de accion por flow matching | no comercial en la version publica (consultar terminos) | pesos publicos con acceso condicionado |
| RDT-1B | 1,2B | diffusion transformer para acciones bimanuales | MIT (segun su repositorio) | pesos publicos en Hugging Face |

Las filas de alternativas reflejan informacion publica general, no datos incluidos en la informacion proporcionada para este modelo; verificar siempre en las fuentes originales antes de citarlas.

## Limitaciones y advertencias

- Licencia no declarada: sin licencia explicita no se puede asumir uso comercial. La licencia apache-2.0 del dataset hermano `myendless/action_repre` aplica a los datos, no a estos pesos.
- Documentacion insuficiente: la model card esta en chino, no indica arquitectura, parametros, contexto, idiomas ni proceso de evaluacion. Cualquier afirmacion sobre el modelo mas alla de lo aqui recogido seria especulativa.
- Riesgo de carga de codigo: al ser un `.pt` de PyTorch y no una exportacion estandar, la carga implica deserializacion tipo pickle. Conviene auditar el fichero y usar `torch.load(..., weights_only=True)` o un entorno aislado antes de ejecutarlo en infraestructura compartida.
- Ausencia de validacion externa: 0 descargas y 0 likes. No hay evidencia de que terceros hayan reproducido los resultados.
- Etiqueta `legacy`: el propio autor clasifica el run de origen como legacy, lo que sugiere que ha sido superado por versiones posteriores de la misma familia.
- Advertencia metodologica del autor: las diferencias de admision de fuentes ARX, la proteccion del tokenizador de acciones y los cambios respecto al origen de 20 000 pasos impiden tratar los resultados como un ranking de variable unica.
- Sesgos esperados: al derivar de datos de teleoperacion, hereda los sesgos de las trayectorias humanas (sesgo de manipulador, de posicion de camara, de iluminacion y de distribucion de objetos). No hay analisis de sesgo publicado.
- Alucinacion en el sentido de politica: fuera de distribucion, el modelo puede generar acciones plausibles pero fisicamente invalidas. No hay garantia de seguridad ni envolvente de limites articulares documentada; cualquier uso real exige un controlador de bajo nivel con limites de par y colision.
- Generalizacion limitada: la nomenclatura apunta a una tarea y una morfologia concretas (`joint14`); no hay evidencia de transferencia a otras morfologias o efectores.
- Sin soporte de lenguaje: si el pipeline espera instrucciones textuales, no se documenta ni el formato ni los idiomas admitidos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/myendless/action-repre-newtask14-n32-lap-v4-j14-h32-head10k-0d64a2db
- Repositorio de datos referenciado (SHA256 de datos, normalizacion, procesador y config): https://huggingface.co/datasets/myendless/action-repre-robotwin-v4-data
- Dataset de benchmarks del autor: https://huggingface.co/datasets/myendless/action_repre/tree/main
- Perfil del autor en Hugging Face: https://huggingface.co/myendless
- Perfil del autor en GitHub: https://github.com/MyEndless/
- Paper, blog o demo oficial: no disponibles en la informacion proporcionada.
