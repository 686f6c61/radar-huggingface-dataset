# BBBXR/raids-hkpc-checkpoints

## Resumen

RAIDS HKPC robot policy checkpoints es una coleccion de puntos de control (checkpoints) de politicas roboticas entrenadas y empaquetadas por el usuario BBBXR, publicada en Hugging Face bajo la libreria LeRobot. El repositorio no contiene un unico modelo generativo, sino un conjunto heterogeneo de pesos de inferencia para dos familias de politicas: pi0.5 (base publicada originalmente por Physical Intelligence) y ACT (Action Chunking Transformer). El problema que aborda es el control de robots manipuladores mediante aprendizaje por imitacion, proporcionando pesos listos para cargar junto con sus activos de normalizacion y catalogos de tareas.

El repositorio es fundamentalmente un artefacto de despliegue: agrupa checkpoints completos, deltas de inferencia independientes, exportaciones historicas y variantes de refinamiento de ACT, con un peso total de 148 GB. La relevancia es acotada y practica: sirve a quien necesite reproducir o desplegar las politicas concretas de este proyecto (denominado RAIDS HKPC), no a un publico general. No hay model card con metricas de rendimiento, ni informacion sobre el dataset de entrenamiento mas alla de que se comparte mediante un repositorio privado de LeRobot.

La informacion publica es escasa: no se declara licencia, idiomas, ni resultados de evaluacion. La unica documentacion disponible es el README, que describe la organizacion de directorios y advierte de que el software de despliegue se distribuye por separado y que los datos de entrenamiento no son publicos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de politicas roboticas: pi0.5 (basada en PaliGemma, vision-lenguaje-accion) y ACT (Action Chunking Transformer) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (depende del tokenizador PaliGemma incluido en `pi05/tokenizer/`) |
| Tipos de cuantizacion | no disponible; los pesos se distribuyen en safetensors |
| Idiomas soportados | no disponible |
| Licencia | no disponible en el repositorio; se referencia la licencia de Gemma en `pi05/LICENSE_GEMMA.txt` y un aviso de redistribucion en `pi05/NOTICE.txt` |
| Formato de pesos | safetensors (libreria LeRobot) |
| Tamano del repositorio | 148.0 GB |
| Pipeline declarado | robotics |
| Tags | lerobot, safetensors, robotics, openpi, region:us |

## Arquitectura y entrenamiento

El repositorio agrupa dos arquitecturas distintas. La primera es pi0.5, una politica vision-lenguaje-accion construida sobre el modelo PaliGemma (cuyo tokenizador se incluye en `pi05/tokenizer/`) y publicada originalmente por Physical Intelligence. Los checkpoints se organizan en exportaciones completas (`pi05/full/`), deltas de inferencia (`pi05/delta/`, 14 deltas independientes que comparten `pi05/base/params/`), exportaciones historicas (`pi05/historical/`) y un catalogo de tareas de despliegue (`pi05/deployment/tasks.json`). La reconstruccion de un paso seleccionado a partir de un delta requiere el exportador de CPU del proyecto y sus propios activos de normalizacion.

La segunda arquitectura es ACT (Action Chunking Transformer), con directorios por politica que contienen pesos y configuracion de carga. Los bundles de las etapas 9.5 y 17 incluyen normalizacion y vinculaciones de tareas; el panel de la etapa 17 toma por defecto `act/stage17_h40/checkpoints/050000/` y ofrece seis pasos a intervalos de 5k desde 25k. Las variantes de refinamiento de ACT conservan su estimador de caracteristicas aprendido y su politica de calentamiento. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO. Los datos de entrenamiento de LeRobot se comparten mediante un repositorio privado de entrega, por lo que no son verificables publicamente.

## Capacidades

- Generacion de acciones de control para robots manipuladores a partir de observaciones visuales y consignas de tarea (vision-lenguaje-accion en pi0.5).
- Aprendizaje por imitacion con chunking de acciones en ACT, orientado a tareas de manipulacion.
- Carga directa de pesos de inferencia completos para despliegue en produccion (etapas 1-17 de pi0.5 a 80k, 90k, 100k y 110k pasos).
- Reconstruccion de checkpoints intermedios mediante deltas de inferencia sobre una base comun, lo que reduce el coste de almacenamiento y transferencia.
- Vinculacion de tareas mediante catalogos (`tasks.json`) y activos de normalizacion incluidos en los bundles de ACT.
- Soporte de multiples etapas de entrenamiento y variantes de refinamiento con politica de calentamiento.
- No se documentan capacidades de tool calling, razonamiento multi-paso, multilingueismo, vision general, audio ni modo thinking; el ambito es exclusivamente robotico.

## Casos de uso

- Despliegue de una politica de manipulacion en un robot real: cargar los parametros completos de `pi05/full/stage01_17_h40/` en el paso deseado (80k, 90k, 100k o 110k) junto con `pi05/deployment/tasks.json` para ejecutar las tareas del catalogo en el entorno de destino.
- Reproduccion de experimentos de investigacion: usar las exportaciones historicas de `pi05/historical/` y los checkpoints de ACT por etapa para comparar el efecto de distintas fases de entrenamiento sobre el comportamiento del robot.
- Transferencia eficiente de checkpoints: distribuir solo la base `pi05/base/params/` mas el delta correspondiente y reconstruir el paso con el exportador de CPU del proyecto, reduciendo el ancho de banda frente a la descarga de exportaciones completas.
- Evaluacion comparativa de arquitecturas: contrastar pi0.5 (vision-lenguaje-accion) con ACT (chunking de acciones) sobre las mismas tareas y activos de normalizacion, para decidir que politica conviene en cada escenario de manipulacion.
- Ajuste fino posterior (fine-tuning) sobre una etapa concreta: partir de un checkpoint de ACT de la etapa 17 (`act/stage17_h40/checkpoints/050000/`) o de una variante de refinamiento que conserva su estimador de caracteristicas y politica de calentamiento.
- Integracion en un pipeline de LeRobot: cargar los pesos safetensors con la libreria LeRobot y conectar la politica a un bucle de control que consuma observaciones y emita acciones, respetando la revision fija del repositorio indicada por el autor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio pesa 148 GB en total, pero corresponde a la suma de decenas de checkpoints; el tamano de un checkpoint individual no se especifica en la informacion disponible.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible; depende del tamano real de cada checkpoint y de la cuantizacion, que no se documenta.
- Opciones de despliegue: la libreria declarada es LeRobot; el autor indica que el software de despliegue se distribuye por separado. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a este tipo de politicas roboticas.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RAIDS HKPC checkpoints (este repo) | pi0.5 + ACT | no disponible | no disponible | no disponible (referencia a licencia Gemma) | Publico en Hugging Face, 148 GB |
| pi0.5 base (Physical Intelligence) | Vision-lenguaje-accion sobre PaliGemma | no disponible en la informacion proporcionada | no disponible | sujeta a terminos de Gemma | Referenciado como origen de la base |
| ACT (Action Chunking Transformer) | Transformer con chunking de acciones | no disponible en la informacion proporcionada | no disponible | no disponible | Implementacion disponible en LeRobot |

No se dispone de datos de rendimiento que permitan una comparacion cuantitativa entre estas alternativas.

## Limitaciones y advertencias

- La licencia no esta declarada en el repositorio; el uso comercial queda condicionado a los terminos de Gemma recogidos en `pi05/LICENSE_GEMMA.txt` y al aviso de redistribucion de `pi05/NOTICE.txt`, que deben revisarse antes de cualquier despliegue.
- Los datos de entrenamiento no son publicos (repositorio privado de LeRobot), por lo que no es posible auditar la composicion del dataset ni los sesgos asociados.
- No hay benchmarks ni evaluaciones publicadas; el rendimiento real de las politicas en el robot de destino es desconocido.
- El software de despliegue se distribuye por separado y no esta incluido en el repositorio, lo que anade una dependencia externa para poner las politicas en produccion.
- Los deltas de inferencia requieren el exportador de CPU del proyecto y los activos de normalizacion correctos; un emparejamiento erroneo entre base, delta y normalizacion puede producir un comportamiento incorrecto sin aviso evidente.
- El repositorio debe descargarse a una revision fija, segun indica el autor, para garantizar la coherencia entre pesos y configuracion.
- El ambito es exclusivamente robotico: no es un modelo de proposito general y no ofrece generacion de texto, codigo ni conversacion.
- El repositorio es de gran tamano (148 GB) y contiene checkpoints redundantes entre etapas, lo que exige planificar el almacenamiento y la seleccion de artefactos.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/BBBXR/raids-hkpc-checkpoints
- Licencia de Gemma referenciada por el autor: `pi05/LICENSE_GEMMA.txt` (dentro del repositorio)
- Aviso de redistribucion: `pi05/NOTICE.txt` (dentro del repositorio)
- Catalogo de tareas de despliegue: `pi05/deployment/tasks.json` (dentro del repositorio)
- Libreria LeRobot: no se proporciona URL en la informacion disponible
- Physical Intelligence (autor original de pi0.5): no se proporciona URL en la informacion disponible
