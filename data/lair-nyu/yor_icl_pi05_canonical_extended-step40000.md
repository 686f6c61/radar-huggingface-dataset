# lair-nyu/yor_icl_pi05_canonical_extended-step40000

## Resumen

El repositorio `lair-nyu/yor_icl_pi05_canonical_extended-step40000` contiene un checkpoint de un modelo de politica robotica (policy) identificado por su autor como "plain pi0.5", es decir, la variante pi0.5 sin mecanismo de recuperacion (retrieval). Lo publica el grupo `lair-nyu` y corresponde al paso 40.000 de un entrenamiento total de 50.000 pasos sobre un conjunto recortado de 20 tareas y 1.186 episodios, con un espacio canonico de acciones y observaciones.

El checkpoint no es un modelo de lenguaje: es un modelo de accion (vision-lenguaje-accion dentro del ecosistema openpi) que consume observaciones de robot y produce acciones. El repositorio solo incluye los pesos (`params/`), las estadisticas de normalizacion (`assets/norm_stats.json`) y el fichero `_CHECKPOINT_METADATA`; se ha eliminado deliberadamente el estado del optimizador (`train_state/`) para reducir el tamano, siguiendo la convencion de checkpoints del proyecto. El tamano total del repositorio es de 12,4 GB.

Su relevancia ahora es acotada y de caracter investigador: sirve como punto de partida para reproducir o comparar experimentos de aprendizaje por imitacion y de aprendizaje en contexto (el identificador incluye `icl`), asi como para evaluar el efecto del recorte de datos de entrenamiento. Es un checkpoint intermedio, no una version final, y su carga exige disponer del repositorio de entrenamiento openpi con la configuracion `yor_icl_pi05_canonical_extended`, ya que el repositorio no incluye arquitectura ni transformaciones de datos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | pi0.5 "plain" (sin retrieval), politica de robotica del ecosistema openpi; detalles de capas no disponibles |
| Parametros totales | no disponible; el repositorio ocupa 12,4 GB y solo contiene pesos + norm stats (estimacion orientativa: ~6.000 millones de parametros si los pesos estan en bf16) |
| Parametros activos | no aplica / no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (no es una ventana de contexto de LLM; depende de la configuracion de entrenamiento en openpi) |
| Tipos de cuantizacion | no disponible; no se declara ninguna cuantizacion (no hay GGUF ni safetensors cuantizados) |
| Idiomas soportados | no disponible; el modelo opera sobre acciones y observaciones, no sobre texto generado |
| Licencia | no disponible |
| Formato de pesos | directorio `params/` con los pesos del modelo (formato concreto no especificado en la model card); incluye `assets/norm_stats.json` y `_CHECKPOINT_METADATA` |

## Arquitectura y entrenamiento

La model card describe el checkpoint como "Plain pi0.5 (no retrieval), canonical action/observation space, 20-task/1186-episode trimmed set. Step 40000 of 50000". Esto indica que se entrenó sobre un subconjunto recortado de datos (20 tareas, 1.186 episodios) con espacios de accion y observacion canonizados, y que se desactivo el componente de recuperacion que caracteriza a otras variantes del proyecto. No se especifican en la informacion disponible el numero de tokens o frames, la composicion del dataset, ni si se aplicaron fases de RLHF, DPO u otro ajuste por preferencias.

El proceso de entrenamiento se enmarca en openpi: el autor indica que la carga requiere la configuracion `yor_icl_pi05_canonical_extended` definida en `openpi/src/openpi/training/config.py`, y ofrece un ejemplo de creacion de la politica mediante `policy_config.create_trained_policy`. Se han omitido el estado del optimizador y el `train_state/` (aproximadamente 1,5 veces el tamano de `params/`), de modo que el checkpoint sirve para inferencia y evaluacion, pero no para reanudar el entrenamiento tal cual. No se documentan innovaciones tecnicas adicionales (decodificacion especulativa, atencion lineal, etc.).

## Capacidades

- Generacion de acciones motoras a partir de observaciones, en un espacio canonico de acciones y observaciones, orientada a tareas de manipulacion robotica.
- Ejecucion de politicas entrenadas sobre un conjunto concreto de 20 tareas; el comportamiento fuera de esa distribucion no esta documentado.
- Inferencia como politica entrenada dentro de openpi, mediante `create_trained_policy` y la configuracion de entrenamiento correspondiente.
- Variante "plain", sin recuperacion (retrieval) en el momento de la inferencia: el autor la distingue explicitamente de las variantes con ICL/retrieval.
- Soporte de tool calling / function calling: no disponible; no es una capacidad declarada y no aplica a un modelo de politica robotica.
- Soporte de agentes y razonamiento multi-paso en lenguaje natural: no disponible.
- Capacidades multilingues: no disponibles; no se declara procesamiento de lenguaje natural.
- Capacidades especiales (modo thinking, vision, audio): no disponibles. La existencia de un espacio de observaciones sugiere entrada sensorial, pero la model card no detalla que modalidades incluye.

## Casos de uso

- Reproduccion de experimentos de aprendizaje por imitacion: el checkpoint permite cargar una politica ya entrenada con la configuracion `yor_icl_pi05_canonical_extended` y evaluar el comportamiento en las 20 tareas del conjunto recortado sin repetir el entrenamiento.
- Ablacion de retrieval frente a la variante "plain": al tratarse de la version sin recuperacion, sirve como linea base para medir cuanto aporta el mecanismo de ICL/retrieval en las mismas tareas y episodios.
- Estudio del recorte de datos: el conjunto de 20 tareas y 1.186 episodios es una version "trimmed", por lo que el checkpoint es util para analizar la relacion entre cobertura del dataset y rendimiento de la politica.
- Analisis de la dinamica de entrenamiento: al ser el paso 40.000 de 50.000, permite comparar checkpoints intermedios y finales para estudiar convergencia y sobreajuste.
- Punto de partida para fine-tuning: puede emplearse como inicializacion en un ajuste posterior sobre tareas propias, aunque requiere reconstruir el `train_state/` ausente si se quiere reanudar el entrenamiento de forma exacta.
- Evaluacion de espacios de accion/observacion canonizados: sirve para comprobar si la canonizacion facilita la transferencia entre distintas configuraciones de robot o de sensores.
- Despliegue en bucle de control robotico: cargando la politica con openpi, se puede integrar en un pipeline de inferencia que consuma observaciones y emita acciones, siempre que el entorno coincida con el espacio de observaciones usado en el entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tasas de exito por tarea, comparaciones numericas ni metricas de evaluacion.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa, si los pesos estan en bf16 y ocupan aproximadamente 12 GB (el repositorio completo son 12,4 GB), la inferencia necesitaria del orden de 13-16 GB de VRAM contando activaciones y buffers, aunque esta cifra es una estimacion derivada del tamano del repositorio y no un dato del autor.
- GPU recomendadas: no disponibles. Por tamano, resultarian adecuadas GPU con 24 GB o mas (RTX 3090, RTX 4090, A100 40/80 GB, H100), sujeto a verificacion.
- Cabe en GPU de consumo: probablemente si en tarjetas de 24 GB (RTX 3090/4090) bajo la estimacion anterior, sin confirmacion por parte del autor.
- Opciones de despliegue: openpi, mediante `policy_config.create_trained_policy` con la configuracion `yor_icl_pi05_canonical_extended`. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI, que estan orientados a modelos de lenguaje y no a esta politica.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No se han publicado comparativas en la informacion disponible. El autor menciona la existencia de una variante "plain" frente a otras con retrieval y de una convencion de repositorios de checkpoints dentro del mismo proyecto, pero no se aportan nombres, tamanos ni metricas de esas alternativas.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| yor_icl_pi05_canonical_extended-step40000 | no disponible | no aplica / no disponible | no disponible | no disponible | HuggingFace, 0 descargas, 0 likes |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El repositorio no incluye la arquitectura ni las transformaciones de datos: sin el repositorio openpi y la configuracion `yor_icl_pi05_canonical_extended`, el checkpoint no se puede cargar correctamente.
- No se incluye `train_state/` (estado del optimizador, aproximadamente 1,5 veces el tamano de `params/`), por lo que no es posible reanudar el entrenamiento exactamente desde este punto sin reconstruirlo.
- Es un checkpoint intermedio (paso 40.000 de 50.000), no la version final del entrenamiento.
- Entrenado sobre un conjunto recortado de 20 tareas y 1.186 episodios: se desconoce su comportamiento fuera de esa distribucion de tareas.
- La licencia no esta declarada, lo que impide determinar si se permite uso comercial; conviene contactar con el autor antes de cualquier uso en produccion.
- No se declaran sesgos ni riesgos de alucinacion, pero al ser una politica de robotica el riesgo relevante es la ejecucion de acciones incorrectas fuera de la distribucion de entrenamiento; se recomienda validacion en entorno controlado.
- No hay informacion sobre idiomas, porque el modelo no genera texto.
- El repositorio registra 0 descargas y 0 likes, y no hay pipeline declarado en HuggingFace; se trata de un artefacto de investigacion sin senales de validacion externa.
- Las fechas de creacion y actualizacion indicadas (2026-09-12) no coinciden con el estado actual del ecosistema, lo que conviene tener en cuenta al citar el artefacto.
- No se documentan requisitos de hardware, latencia ni throughput, por lo que cualquier planificacion de despliegue debe medirse empiricamente.

## Enlaces

- HuggingFace: https://huggingface.co/lair-nyu/yor_icl_pi05_canonical_extended-step40000
- Model card del autor: incluida en la pagina de HuggingFace del repositorio
- Configuracion de entrenamiento referenciada: `openpi/src/openpi/training/config.py`, entrada `yor_icl_pi05_canonical_extended` (repositorio openpi; URL no proporcionada en la informacion disponible)
- Paper, blog, repositorio adicional o demo: no disponibles en la informacion proporcionada. Los resultados de busqueda web devueltos no guardan relacion con el modelo.
