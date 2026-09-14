# dyjackson/hw2-retrieval

## Resumen

`dyjackson/hw2-retrieval` es un repositorio de HuggingFace que contiene una implementacion propia y minima de una arquitectura denominada **Coca**, orientada a tareas de **retrieval** (recuperacion de informacion multimodal o texto-imagen, a juzgar por la referencia a Flickr30k en la model card). Lo publica el usuario `dyjackson` bajo licencia MIT, con fecha de creacion registrada el 13 de septiembre de 2026 y cero descargas y cero likes en el momento de la consulta.

El punto clave es que **no es un modelo entrenado**: el propio autor lo describe como "un punto de partida reproducible, no una release de modelo entrenado". El fichero `model.safetensors` es un checkpoint de inicializacion valido para pruebas de humo (smoke tests), no un checkpoint con pesos entrenados ni evaluados. La variante publicada corresponde a la escala **nano**, con atencion dilatada, fusion con puerta (gated fusion), activacion gelu-tanh y normalizacion RMSNorm.

El interes del repositorio es, por tanto, de tipo pedagogico y de ingenieria: sirve como esqueleto ejecutable (script con `config.json`, `training_args.json` y `eval.py`) para montar un pipeline de entrenamiento y evaluacion de retrieval con una receta de partida basada en optimizador Novograd y planificador de tasa de aprendizaje de tipo step. No debe confundirse con un modelo listo para produccion ni con un baseline con resultados publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Coca (implementacion propia; atencion dilatada, gated fusion) |
| Parametros totales | 49.600 (aproximadamente 0,05 M), segun safetensors |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se distribuye safetensors sin cuantizar) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (PyTorch); repo de 0,0 GB |
| Escala declarada | nano |
| Activacion | gelu tanh |
| Normalizacion | rmsnorm |
| Optimizador por defecto | Novograd con planificador step |
| Estado del checkpoint | inicializacion sin entrenar ni auditar |
| Fecha de creacion (registro) | 2026-09-13 |

## Arquitectura y entrenamiento

La model card describe la arquitectura con una tabla de cinco entradas: se trata de una implementacion **Coca** de escala nano, con **atencion dilatada** (dilated attention, orientada a ampliar el campo receptivo sin incrementar linealmente el coste), **gated fusion** como mecanismo de combinacion de representaciones y **RMSNorm** junto con activacion **gelu tanh**. No se especifica el numero de capas, dimension de embedding, numero de cabezas ni el esquema exacto de la atencion dilatada, por lo que la configuracion concreta debe leerse del `config.json` del repositorio, no disponible en la informacion proporcionada.

En cuanto al entrenamiento: **no se ha completado ningun entrenamiento**. El autor indica explicitamente que los valores de `training_args.json` (Novograd con planificador step) son valores de partida del script y "no evidencia de una ejecucion completada". Tampoco se documenta el volumen de tokens, la composicion del dataset, ni si hubo RLHF, DPO u otro ajuste por preferencias: nada de eso esta disponible. La model card sugiere como primera evaluacion util el conjunto **Flickr30k**, reportando la metrica de la tarea con al menos tres semillas y un baseline de capacidad comparable, manteniendo logs de entrenamiento y versiones del entorno. No se declara ninguna innovacion tecnica validada experimentalmente.

## Capacidades

- **Generacion de texto**: no disponible; el repositorio esta orientado a retrieval, no a generacion.
- **Razonamiento y matematicas**: no disponible; no hay evidencia de entrenamiento en esas tareas.
- **Codigo**: no disponible como capacidad del modelo, si bien el repositorio incluye codigo Python ejecutable (`eval.py`) del que se puede inspeccionar el bloque `__main__` con un ejemplo de smoke test.
- **Retrieval**: es la tarea declarada de la arquitectura. Al no existir checkpoint entrenado, la capacidad efectiva es la de un modelo inicializado aleatoriamente, es decir, sin calidad de recuperacion demostrada.
- **Tool calling / function calling**: no disponible.
- **Soporte de agentes y razonamiento multi-paso**: no disponible.
- **Capacidades multilingues**: no disponible; no se declaran idiomas.
- **Vision**: no confirmado. La evaluacion sugerida (Flickr30k) apunta a un escenario texto-imagen, pero la model card no detalla el preprocesado ni los encoders de cada modalidad.
- **Modo de razonamiento explicito (thinking), audio u otras capacidades especiales**: no disponible.
- **Carga mediante APIs genericas**: el autor advierte de que, al ser una implementacion propia, las APIs automaticas de carga necesitan un adaptador explicito.

## Casos de uso

- **Pruebas de humo de pipelines de retrieval**: usar el checkpoint de inicializacion para verificar que el codigo de carga, el forward pass, el calculo de perdida y el guardado de pesos funcionan de extremo a extremo antes de lanzar un entrenamiento real. Es el uso que el propio autor declara.
- **Andamiaje de un baseline de investigacion**: partir de `config.json`, `training_args.json` y `eval.py` para construir un baseline propio de recuperacion texto-imagen y compararlo despues contra un modelo de capacidad equivalente, siguiendo la recomendacion de evaluar en Flickr30k con al menos tres semillas.
- **Integracion continua para validar codigo de entrenamiento**: incorporar el script en un flujo de CI que instancie el modelo nano (49.600 parametros) y compruebe que los cambios en la implementacion no rompen las formas de los tensores ni el forward. Su tamano ridiculo hace que el test sea viable en CPU dentro de un runner convencional.
- **Docencia y estudio de arquitecturas**: el repositorio expone de forma compacta mecanismos como atencion dilatada, gated fusion y RMSNorm, lo que permite leer la implementacion completa en un unico fichero Python con fines didacticos.
- **Estudios de ablacion de recetas de optimizacion**: el script arranca con Novograd y planificador step, lo que facilita comparar frente a AdamW u otros esquemas bajo el mismo presupuesto de datos, semillas y tuning, tal como recomienda la model card.
- **Prototipado de adaptadores de carga**: dado que las APIs genericas no cargan este modelo sin un adaptador, sirve para desarrollar y probar el adaptador de integracion antes de escalar a un checkpoint mayor de la misma familia.
- **Verificacion de procedencia y licencias en un pipeline interno**: al estar liberado bajo MIT, puede integrarse en herramientas internas sin friccion de licencia, revisando aparte los terminos de los datasets externos que se le apliquen.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La propia model card declara que no se reclama ninguna puntuacion de benchmark en el repositorio y que el checkpoint no ha sido entrenado ni evaluado.

## Requisitos de hardware

- **VRAM para inferencia**: despreciable en terminos practicos. Con aproximadamente 49.600 parametros, los pesos ocupan del orden de cientos de kilobytes en fp32; cualquier GPU con 1 GB o incluso CPU es suficiente para instanciar el modelo.
- **GPU recomendadas**: no procede recomendacion de GPU de centro de datos (A100, H100) para este checkpoint; el cuello de botella real seria el dataset de entrenamiento y el pipeline de evaluacion, no el modelo.
- **Viabilidad en GPU de consumo**: si; cabe con margen enorme en cualquier GPU de consumo, e igualmente en CPU. Debe tenerse en cuenta que se trata de un checkpoint sin entrenar, por lo que la ejecucion no produce resultados utiles de retrieval.
- **Opciones de despliegue**: los formatos habituales (vLLM, llama.cpp, Ollama, TGI) no aplican directamente, ya que el autor indica que se requiere un adaptador explicito para APIs de carga genericas. El despliegue razonable es la ejecucion directa del script Python del repositorio.
- **Latencia y throughput estimados**: no disponibles. Por el tamano del modelo, la latencia estaria dominada por el preprocesado y la E/S de datos, no por el computo del forward pass.
- **Almacenamiento**: el repositorio ocupa 0,0 GB y contiene `eval.py`, `README.md`, `config.json`, `training_args.json` y `model.safetensors`.

## Comparativa con modelos similares

La informacion proporcionada no incluye resultados que permitan una comparacion de rendimiento, y la propia model card no declara baseline alguno. A modo de contexto de categoria, se incluye una comparacion de orden de magnitud con modelos conocidos de retrieval texto-imagen, marcando como no disponible todo aquello que no consta:

| Modelo | Parametros | Contexto | Licencia | Estado |
|---|---|---|---|---|
| dyjackson/hw2-retrieval (Coca nano) | 49.600 | no disponible | MIT | Checkpoint de inicializacion, sin entrenar |
| CLIP ViT-B/32 (referencia de categoria) | orden de 150 M (aproximado) | limite tipico de 77 tokens de texto (aproximado) | licencia permisiva del publicador | Modelo entrenado y evaluado |
| SigLIP base (referencia de categoria) | orden de 200 M (aproximado) | no disponible | Apache 2.0 (aproximado) | Modelo entrenado y evaluado |
| Alternativas de retrieval comparables en escala nano | no disponible | no disponible | no disponible | no disponible |

Los datos de CLIP y SigLIP se ofrecen solo como orden de magnitud de la categoria y no proceden de la informacion proporcionada, por lo que deben verificarse en sus repositorios oficiales antes de citarlos. No existe comparacion de rendimiento posible: este repositorio no publica metricas.

## Limitaciones y advertencias

- **No es un modelo entrenado**: el `model.safetensors` es un checkpoint de inicializacion para smoke tests. Cualquier uso que espere calidad de retrieval producira resultados sin sentido.
- **Sin auditoria**: el autor declara que el checkpoint no ha sido auditado en robustez, equidad (fairness) ni transferencia de dominio.
- **Sin benchmarks**: no hay ninguna puntuacion publicada; no debe citarse cifra alguna atribuida a este repositorio.
- **Riesgo de alucinacion**: no evaluable en su estado actual, ya que no se ha entrenado ni evaluado. No debe asumirse ningun comportamiento controlado.
- **Datos de arquitectura incompletos**: no se especifican numero de capas, dimension oculta, cabezas, contexto maximo ni estrategia exacta de atencion dilatada en la informacion disponible; hay que consultar `config.json`.
- **Idiomas no declarados**: no se documenta cobertura linguistica, lo que impide planificar despliegues multilingues.
- **Adapter necesario**: las APIs de carga automaticas requieren un adaptador explicito; no se puede cargar como un transformer convencional sin trabajo adicional.
- **Licencia MIT**: permite uso comercial del codigo y de los pesos, pero los terminos de los datos de origen deben revisarse por separado si se combina con datasets externos.
- **Sesgos y fairness**: no disponibles; no se ha realizado ninguna evaluacion.
- **Trazabilidad temporal**: la fecha de creacion registrada en HuggingFace es 2026-09-13, posterior a la fecha habitual de consulta; conviene verificar la vigencia y el estado del repositorio antes de basar trabajo en el.
- **Sin mantenimiento ni adopcion observables**: cero descargas y cero likes, sin senales de uso por terceros.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/dyjackson/hw2-retrieval
- Ficheros citados en la model card (rutas dentro del repo): `eval.py`, `README.md`, `config.json`, `training_args.json`, `model.safetensors`
- Dataset sugerido para evaluacion en la model card: Flickr30k (sin enlace proporcionado)
- Paper, blog, repositorio de codigo externo o demo: no disponibles en la informacion proporcionada
- Los resultados de busqueda web facilitados no guardan relacion con este modelo y no se han utilizado como fuente.
