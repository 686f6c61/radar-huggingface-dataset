# HYU-NLP-EVA2/dynamic-rubric-checkpoints-20261023-public

## Resumen

Este repositorio no es un modelo entrenado listo para inferencia, sino un archivo público de checkpoints de entrenamiento por refuerzo. Concretamente, preserva 424 directorios de checkpoint de un snapshot local fijo tomado el 2026-10-23, correspondientes a un pipeline de aprendizaje por refuerzo con rubricas dinamicas (dynamic rubric) cuyo arbol de salidas original estaba bajo `outputs/medicine`. El repositorio ocupa 1369,6 GB y esta etiquetado con `transformers`, `safetensors`, `reinforcement-learning` y `checkpoint-archive`.

El contenido son ficheros originales de entrenamiento, incluidos estados de optimizador y de generador de numeros aleatorios (RNG) cuando aun estaban presentes. Los shards FSDP generados por VERL/RuscaRL requieren un procedimiento de fusion (merge) antes de poder usarse con inferencia estandar de Transformers; los adaptadores EvoRubrics requieren su modelo base correspondiente, y las exportaciones SFT ya incluyen modelos fusionados. Otros 13 directorios de checkpoint completados antes de la separacion de visibilidad residen en el archivo companero privado `HYU-NLP-EVA2/dynamic-rubric-checkpoints-20261023`, por lo que el snapshot fijo completo suma 437 checkpoints.

Su relevancia es de tipo metodologico y de reproducibilidad: permite auditar la evolucion de una politica entrenada con rubricas dinamicas, reanudar entrenamiento y extraer pesos intermedios o adaptadores para evaluacion. No se declara arquitectura, tamano de parametros, contexto ni idiomas del modelo subyacente, por lo que no debe tratarse como una ficha de modelo desplegable sino como un artefacto de investigacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (archivo de checkpoints de entrenamiento RL; no se declara la arquitectura del modelo base) |
| Parametros totales | no disponible |
| Parametros activos | no aplica / no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (los pesos se distribuyen en safetensors y shards FSDP sin cuantizar; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (no declarada en el repositorio ni en la model card) |
| Formato de pesos | safetensors; shards FSDP de VERL/RuscaRL (requieren merge); estados de optimizador y RNG; adaptadores EvoRubrics; exportaciones SFT con modelo fusionado |
| Volumen del repositorio | 1369,6 GB |
| Numero de checkpoints publicos | 424 directorios |
| Checkpoints en archivo privado | 13 directorios (companero) |
| Fecha del snapshot | 2026-10-23 |
| Framework de entrenamiento | VERL / RuscaRL con FSDP (segun la model card) |
| Pipeline declarado | reinforcement-learning |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura del modelo subyacente (transformer, MoE, hibrido u otra), ni el numero de tokens de entrenamiento, ni la composicion del dataset. Lo que si se documenta es el marco de entrenamiento: un pipeline de aprendizaje por refuerzo ejecutado con VERL/RuscaRL sobre FSDP, con checkpoints que conservan estado de optimizador y de RNG, lo que indica intencion de reanudacion exacta del entrenamiento. El nombre del proyecto, "dynamic rubric", sugiere un esquema de recompensa basado en rubricas que se actualizan durante el entrenamiento, y las rutas originales bajo `outputs/medicine` apuntan a un dominio de aplicacion medico, pero ninguno de estos extremos se detalla en la model card.

La innovacion tecnica relevante aqui no es de modelado sino de trazabilidad: el archivo conserva los ficheros originales de entrenamiento, separa los adaptadores EvoRubrics (que necesitan su modelo base concreto), incluye exportaciones SFT ya fusionadas y mantiene una lista de repositorios de inferencia existentes en `existing_inference_repositories.json`. Tras la transferencia, el autor compara tamanos y hashes remotos y publica `verified_manifest.json`; la presencia de ese fichero es el registro de verificacion del snapshot publico. No se documentan tecnicas de decodificacion especulativa, attention linear ni esquemas de RLHF/DPO mas alla del propio bucle de RL.

## Capacidades

- No se declaran capacidades de inferencia del modelo subyacente: el repositorio es un archivo de checkpoints, no una tarjeta de capacidades.
- Reanudacion de entrenamiento: los estados de optimizador y RNG permiten continuar el bucle de RL desde un paso concreto, siempre que se reconstruya el entorno VERL/RuscaRL original.
- Extraccion de pesos intermedios: los shards FSDP pueden fusionarse para obtener pesos en formato Transformers y evaluar la politica en distintos pasos de entrenamiento.
- Uso de adaptadores EvoRubrics: se distribuyen adaptadores que requieren emparejarse con su modelo base para poderse aplicar.
- Exportaciones SFT: se incluyen modelos ya fusionados listos para el flujo estandar de Transformers, segun la model card.
- Localizacion de artefactos de inferencia: `existing_inference_repositories.json` enumera repositorios de inferencia ya existentes y separados de este archivo.
- Auditoria y verificacion: hashes y tamanos comparados tras la subida, con manifiesto de verificacion publicado.

## Casos de uso

- Reproducibilidad de resultados de RL: descargar el checkpoint correspondiente al paso reportado en un articulo y reejecutar la evaluacion con los mismos pesos, evitando depender de una unica publicacion final del modelo.
- Reanudacion de entrenamientos interrumpidos: restaurar pesos, estado de optimizador y estado RNG para continuar el bucle VERL/RuscaRL exactamente donde se detuvo el snapshot del 2026-10-23.
- Analisis de la dinamica de rubricas: comparar checkpoints de distintos pasos para medir como evoluciona la politica conforme cambian las rubricas de recompensa, util en investigacion sobre reward modeling.
- Estudio de olvido catastrofico y deriva de politica: evaluar una bateria fija de prompts sobre multiples checkpoints intermedios para trazar curvas de calidad frente al numero de pasos.
- Extraccion de adaptadores EvoRubrics para experimentos controlados: aplicar los adaptadores sobre su modelo base para aislar el efecto del ajuste con rubricas frente al modelo de partida.
- Despliegue de la variante SFT: usar las exportaciones SFT ya fusionadas como linea base supervisada en un pipeline de evaluacion, sin necesidad de ejecutar el merge de FSDP.
- Auditoria de artefactos de investigacion: verificar integridad de pesos y estados mediante hashes y el manifiesto de verificacion antes de reutilizar checkpoints en un estudio propio.
- Reconstruccion de infraestructura de entrenamiento: usar la estructura de directorios conservada bajo `outputs/medicine` como referencia para reproducir la organizacion de un pipeline VERL/RuscaRL con FSDP.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion, ni tampoco curvas de recompensa por paso de entrenamiento.

## Requisitos de hardware

- Almacenamiento: 1369,6 GB solo para este repositorio publico; conviene prever espacio adicional para el proceso de merge de shards FSDP y para los pesos fusionados resultantes.
- VRAM para inferencia: no disponible. Al no declararse el tamano del modelo base, no es posible estimar requisitos de VRAM por cuantizacion.
- GPU recomendadas: no disponible por la misma razon; el entrenamiento original uso FSDP, lo que implica configuraciones multi-GPU, pero no se especifica el hardware.
- Ajuste en GPU de consumo: no determinable sin conocer el tamano del modelo; los adaptadores EvoRubrics y las exportaciones SFT son las rutas mas plausibles para hardware limitado, siempre que el modelo base sea de escala reducida.
- Despliegue: para las exportaciones SFT fusionadas aplican las opciones habituales de Transformers (vLLM, TGI, llama.cpp/Ollama si se generan cuantizaciones GGUF, que no se distribuyen). Los shards FSDP requieren merge previo y no son consumibles directamente por estos servidores.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Criterio | dynamic-rubric-checkpoints-20261023-public | Archivos de checkpoints VERL/OpenRLHF tipicos | Repositorio de modelo final (pesos publicados) |
|---|---|---|---|
| Tipo de artefacto | Archivo de 424 checkpoints de RL | Salidas de entrenamiento RL | Modelo listo para inferencia |
| Parametros | no disponible | variable | variable |
| Contexto | no disponible | variable | variable |
| Estados de optimizador/RNG | Si, cuando estaban presentes | Habitualmente descartados | No |
| Requiere merge de FSDP | Si | Si | No |
| Verificacion por hash publicada | Si (`verified_manifest.json`) | Rara vez | Rara vez |
| Licencia | no disponible | variable | variable |

No se dispone de datos de rendimiento que permitan una comparacion cuantitativa con alternativas concretas; la comparacion anterior es estructural y no de calidad.

## Limitaciones y advertencias

- No es un modelo desplegable: sin el procedimiento de merge de VERL/RuscaRL, los shards FSDP no funcionan en inferencia estandar de Transformers.
- Ausencia total de especificaciones: se desconoce arquitectura, parametros, contexto, idiomas, datos de entrenamiento y composicion del dataset, lo que impide evaluar sesgos o calidad.
- Licencia no declarada: no hay permiso explicito de uso comercial; debe considerarse no autorizado hasta confirmacion del autor.
- Volumen de 1369,6 GB: la descarga completa es costosa en tiempo y almacenamiento; conviene descargar selectivamente directorios concretos.
- Duplicacion de pesos: al conservar estado de optimizador y RNG, cada checkpoint ocupa mucho mas que los pesos de inferencia, lo que complica su manejo local.
- Dependencia de modelos base externos: los adaptadores EvoRubrics no son autonomos y fallaran si se emparejan con un modelo base distinto del previsto.
- Fecha del snapshot: los checkpoints generados por entrenamiento posterior al 2026-10-23 no estan incluidos; ademas, 13 directorios previos a la separacion de visibilidad estan en un repositorio privado y no son accesibles publicamente.
- Verificacion condicional: el manifiesto de verificacion se publica tras comparar tamanos y hashes; su ausencia en un momento dado implica que la verificacion del snapshot aun no esta registrada.
- Dominio medico en las rutas de origen: cualquier reutilizacion en contextos clinicos exige validacion independiente; no hay evidencia en la informacion disponible sobre seguridad o exactitud en ese dominio.
- Riesgo de alucinacion y sesgos: no evaluable, dado que no se documenta el modelo base ni sus datos.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/HYU-NLP-EVA2/dynamic-rubric-checkpoints-20261023-public
- Archivo companero privado citado en la model card: https://huggingface.co/HYU-NLP-EVA2/dynamic-rubric-checkpoints-20261023
- Fichero de inventario y repositorios de inferencia existentes: `existing_inference_repositories.json` (referenciado en la model card; consultar el arbol de ficheros del repositorio)
- Manifiesto de verificacion: `verified_manifest.json` (se publica tras la comparacion de tamanos y hashes; su presencia registra la verificacion del snapshot)
- Paper, blog, repositorio de codigo o demo: no disponibles en la informacion proporcionada.
