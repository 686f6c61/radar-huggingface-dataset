# OneScience-Group/SFNO-BVMC

## Resumen

SFNO-BVMC es un modelo de prediccion meteorologica global por conjuntos (ensemble) basado en operadores neuronales de Fourier esfericos (Spherical Fourier Neural Operator, SFNO). Lo publica el grupo OneScience en HuggingFace y reproduce el diseno experimental descrito en el articulo *Huge ensembles - Part 1: Design of ensemble weather forecasts using spherical Fourier neural operators* (Geoscientific Model Development, 2025), firmado por investigadores de Lawrence Berkeley National Laboratory, UC Berkeley, NVIDIA, Indiana University y otras instituciones colaboradoras.

El problema que aborda es la generacion eficiente de ensembles globales de gran tamano que capturen simultaneamente incertidumbre de condicion inicial e incertidumbre de modelo. Para ello combina tres elementos: un operador espectral esferico como arquitectura base, varios checkpoints de entrenamiento (que aportan diversidad de modelo) y bred vectors centrados por pares (que aportan diversidad de condicion inicial). El resultado es un metodo que evita el coste de entrenar muchos modelos independientes.

El modelo se entreno con datos de reanalisis ERA5 globales a 0,25 grados: 1979-2015 para entrenamiento, 2018 para validacion y 2020 para test. Esta pensado para prediccion de medio plazo y para estudios de probabilidad de eventos extremos. Es relevante ahora porque se situa en la linea de modelos de emulacion atmosferica basados en operadores espectrales, alternativa a los enfoques de grafos (GraphCast) y a los transformers de vision (Pangu-Weather), con la particularidad de producir directamente un ensemble grande en lugar de una prediccion determinista.

Conviene senalar que el repositorio se presenta explicitamente como una reproduccion de ingenieria independiente de las especificaciones publicas de SFNO-BVMC, no como la version oficial de los autores del articulo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Spherical Fourier Neural Operator (SFNO) con ensemble por multiples checkpoints y bred vectors centrados |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de rejilla global 721 x 1440; rollout por pasos temporales, no secuencia textual) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (segun metadatos del repositorio; el modelo procesa campos fisicos, no texto) |
| Licencia | Apache 2.0 (codigo del repositorio) |
| Formato de pesos | no disponible (repositorio PyTorch; el autor no especifica formato ni que los pesos se distribuyan) |

## Arquitectura y entrenamiento

La arquitectura es un operador neuronal de Fourier esferico. En lugar de aplicar la transformada de Fourier plana, opera sobre armonicos esfericos, lo que respeta la topologia de la esfera y evita artefactos en los polos, habituales en los modelos convolucionales sobre proyecciones latitud-longitud. El modelo trabaja sobre una rejilla global de 0,25 grados de resolucion, con la convencion de coordenadas `[721, 1440]` (latitud x longitud), y genera predicciones por pasos de rollout.

El entrenamiento usa reanalisis ERA5 global a 0,25 grados con particion temporal 1979-2015 (entrenamiento), 2018 (validacion) y 2020 (test). La innovacion principal no esta en la arquitectura aislada, sino en la estrategia de ensemble: se combinan varias instantaneas de entrenamiento del mismo modelo (diversidad de modelo) con bred vectors centrados por pares (diversidad de condicion inicial). Este esquema es el que permite escalar a ensembles de tamano grande con un coste computacional asumible, en lugar de entrenar y ejecutar decenas de modelos independientes. No se documentan en la informacion disponible detalles sobre RLHF, DPO ni sobre el numero exacto de tokens o muestras procesadas.

El repositorio incluye scripts de generacion de datos sinteticos, entrenamiento, inferencia y postprocesado (`fake_data.py`, `train.py`, `inference.py`, `result.py`). Los datos sinteticos preservan el protocolo completo de canales y la logica de coordenadas globales mediante muestreo de teselas en coordenadas originales. Los artefactos de ejecucion se escriben en `result/` y no se incluyen en el paquete de release.

## Capacidades

- Prediccion meteorologica global determinista a partir de un estado inicial sobre rejilla 0,25 grados.
- Generacion de ensembles globales de gran tamano combinando multiples checkpoints y bred vectors centrados.
- Representacion explicita de incertidumbre de condicion inicial mediante bred vectors.
- Representacion de incertidumbre de modelo mediante diversidad entre checkpoints de entrenamiento.
- Estimacion de probabilidades de eventos extremos a partir de la distribucion del ensemble.
- Prediccion de medio plazo en el marco temporal habitual de los modelos de emulacion atmosferica.
- Ejecucion sobre GPU con PyTorch y flujo de trabajo por linea de comandos.
- No dispone de tool calling, function calling ni soporte de agentes: no es un modelo de lenguaje.
- No dispone de capacidades de vision, audio, codigo ni razonamiento simbolico.
- Capacidad multilingue: no aplica; el modelo opera sobre campos fisicos y su documentacion esta en ingles.

## Casos de uso

- Prediccion meteorologica operativa de medio plazo: el modelo genera campos globales a 0,25 grados que pueden alimentar pipelines de prediccion numerica, sirviendo como emulador rapido frente a modelos fisicos como el IFS.
- Estimacion de probabilidad de eventos extremos: ejecutando el ensemble completo se obtiene una distribucion de escenarios que permite calcular la probabilidad de superar umbrales de viento, precipitacion o temperatura en una region concreta.
- Estudio de incertidumbre de condicion inicial: los bred vectors centrados por pares permiten aislar y analizar como crecen los errores iniciales en distintas escalas espaciales.
- Estudio de incertidumbre de modelo: la comparacion entre checkpoints de entrenamiento distintos permite cuantificar la dispersion atribuible al propio modelo, no solo al estado inicial.
- Investigacion en modelos del sistema Tierra: sirve como banco de pruebas para comparar operadores espectrales esfericos frente a arquitecturas de grafos o transformers en tareas de emulacion atmosferica.
- Evaluacion de riesgo para el sector energetico: los ensembles de viento y radiacion a escala global permiten estimar la variabilidad esperada de la produccion renovable con varios dias de antelacion.
- Analisis de sensibilidad y calibracion de ensembles: el esquema multi-checkpoint mas bred vectors es un objeto de estudio util para investigar tecnicas de calibracion estadistica de ensembles meteorologicos.
- Reproduccion y docencia: los scripts incluidos permiten reproducir el flujo completo con datos sinteticos en entornos docentes o de validacion de infraestructura, sin necesidad de disponer del reanalisis completo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye tablas comparativas de RMSE, ACC, CRPS ni de habilidades de prediccion frente a otros modelos, ni tampoco datos de latencia o throughput.

## Requisitos de hardware

- VRAM para inferencia: no disponible. El autor no publica cifras de memoria. Como referencia orientativa, los modelos de emulacion global a 0,25 grados con operadores espectrales suelen requerir del orden de 16 a 40 GB en precision mixta por miembro del ensemble, cantidad que crece de forma aproximadamente lineal con el numero de miembros si se ejecutan en el mismo dispositivo.
- GPU recomendadas: no especificadas por el autor. Para una rejilla global 0,25 grados (721 x 1440 puntos por campo) son razonables GPU de centro de datos tipo A100 (40/80 GB), H100 o L40S; el numero de miembros del ensemble determina si hace falta una o varias GPU.
- GPU de consumo: no confirmado. Una RTX 4090 (24 GB) podria ser suficiente para inferencia de un numero reducido de miembros si el modelo cabe en memoria, pero no hay datos publicados que lo confirmen.
- Opciones de despliegue: el repositorio esta pensado para PyTorch con scripts de linea de comandos. No hay soporte declarado para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo. El despliegue realista pasa por PyTorch con `torchrun` o DataParallel/DistributedDataParallel para repartir miembros del ensemble entre GPU.
- Latencia y throughput: no disponibles.
- Nota: todas las cifras de hardware de esta seccion son estimaciones orientativas basadas en la resolucion y el tipo de arquitectura, no datos confirmados por el autor.

## Comparativa con modelos similares

La comparacion se establece con otros emuladores globales de prediccion meteorologica a 0,25 grados. Los datos de modelos de terceros proceden de informacion publica general y deben verificarse en sus repositorios oficiales antes de usarse en produccion.

| Modelo | Enfoque | Resolucion | Parametros | Licencia | Disponibilidad de pesos |
|---|---|---|---|---|---|
| SFNO-BVMC | SFNO + ensemble multi-checkpoint + bred vectors | 0,25 grados | no disponible | Apache 2.0 (repositorio de reproduccion) | no confirmada en la informacion disponible |
| FourCastNet (SFNO) | Operador neuronal de Fourier sobre la esfera | 0,25 grados | no disponible en esta ficha | licencia propia de NVIDIA (uso no comercial) | pesos publicos bajo sus terminos |
| GraphCast | Red neuronal de grafos | 0,25 grados | no disponible en esta ficha | licencia propia de DeepMind (uso no comercial) | pesos publicos bajo sus terminos |
| GenCast | Modelo de difusion sobre grafos | 0,25 grados | no disponible en esta ficha | licencia propia de DeepMind (uso no comercial) | pesos publicos bajo sus terminos |

Diferencias clave frente a esas alternativas: SFNO-BVMC no produce una unica prediccion determinista ni un ensemble puramente estocastico por difusion, sino un ensemble construido a partir de varios checkpoints y bred vectors, lo que cambia el perfil de coste computacional. Ademas, su licencia Apache 2.0 en el repositorio es mas permisiva que las licencias no comerciales habituales en los pesos de los modelos citados, aunque esa permisividad se refiere al codigo publicado y no necesariamente a los pesos del modelo original.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no procesa ni genera texto, no soporta tool calling ni razonamiento multi-paso en el sentido de los LLM.
- Riesgo de alucinacion: no aplica en el sentido linguistico, pero si existe el riesgo de generar campos fisicamente inconsistentes en rollout largos, un problema documentado en todos los emuladores neuronales de la atmosfera.
- Deriva y acumulacion de error: en predicciones de medio y largo plazo los emuladores neuronales tienden a suavizar el campo y perder energia en escalas pequenas; no se publican metricas de deriva para este repositorio.
- Ausencia de benchmarks: no hay resultados verificables de RMSE, ACC o CRPS, por lo que no es posible avalar su calidad predictiva con datos publicados.
- Reproduccion independiente: el repositorio se declara como reproduccion de ingenieria de las especificaciones publicas, no como la implementacion oficial de los autores del articulo. Los pesos oficiales, el articulo y los datos quedan sujetos a sus propias licencias y terminos.
- Datos de entrada: el flujo de ejemplo usa datos sinteticos, no ERA5 real. Para un uso cientifico serio hay que aportar el reanalisis y verificar la compatibilidad de canales y normalizacion.
- Idioma: la documentacion y los metadatos estan en ingles; no hay soporte ni documentacion en castellano.
- Licencia: el codigo del repositorio es Apache 2.0, pero eso no se extiende automaticamente a los pesos del modelo original ni a ERA5, cuyos terminos de uso son independientes y deben respetarse.
- Estado del repositorio: registra 0 descargas y 0 me gusta en el momento de la consulta, lo que indica ausencia de validacion por parte de la comunidad.
- Produccion: sin cifras de latencia, memoria ni verificacion de calidad, no es recomendable para un sistema operativo de prediccion sin una evaluacion previa propia contra un modelo de referencia.

## Enlaces

- HuggingFace: https://huggingface.co/OneScience-Group/SFNO-BVMC
- Articulo de referencia: *Huge ensembles - Part 1: Design of ensemble weather forecasts using spherical Fourier neural operators*, Geoscientific Model Development, 2025: https://doi.org/10.5194/gmd-18-5575-2025
- Resultados de busqueda web: las busquedas realizadas no han devuelto ningun resultado relevante sobre este modelo, su repositorio de codigo, sus pesos o sus benchmarks. No se dispone de enlaces adicionales verificables.
