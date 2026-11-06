# NikeSong/so101_gestures_act

## Resumen

`so101_gestures_act` es un repositorio de Hugging Face publicado por el usuario NikeSong que contiene, segun su model card, los pesos de una politica de control robotico entrenada con el algoritmo ACT (Action Chunking with Transformers) sobre el brazo robotico SO-101. El modelo se enmarca en el ecosistema LeRobot de Hugging Face, una libreria centrada en aprendizaje por imitacion para robotica de bajo coste, y esta asociado al conjunto de datos `NikeSong/so101_gestures`, que presumiblemente contiene demostraciones de gestos capturadas con dicho brazo.

La relevancia de este tipo de artefactos es acotada y experimental: no se trata de un modelo de lenguaje ni de un modelo fundacional multimodal, sino de un checkpoint de politica visuomotora para una tarea concreta (gestos con el SO-101). Su interes radica en servir como ejemplo reproducible de un pipeline completo de LeRobot (dataset, entrenamiento con ACT, publicacion de pesos) para quienes trabajan con brazos SO-100/SO-101.

La informacion publicada es muy escasa: el repositorio no incluye descripcion tecnica detallada, hiperparametros, resultados de evaluacion ni especificaciones de entrenamiento. Ademas, la model card indica explicitamente que se trata de un "placeholder" de los pesos de la politica, lo que sugiere que el contenido puede estar incompleto o pendiente de actualizacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), segun el nombre del repositorio y la model card; no se detalla la configuracion exacta |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; en ACT el horizonte relevante es el chunking de acciones, no especificado) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de robotica, sin capacidades linguisticas declaradas) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (repositorio de LeRobot; el formato concreto no se indica en la informacion proporcionada) |

## Arquitectura y entrenamiento

Segun la model card, el modelo corresponde a una politica ACT, es decir, la familia de metodos de imitacion que predice secuencias de acciones ("chunks") a partir de observaciones visuales y del estado del robot mediante un transformer. Esta arquitectura es la implementada en LeRobot para tareas de manipulacion con brazos de bajo coste como el SO-100 y el SO-101.

No se dispone de informacion sobre el numero de parametros, la configuracion de capas y cabezas de atencion, el numero de demostraciones utilizadas, el numero de pasos de entrenamiento, la resolucion de las camaras de entrada ni los hiperparametros de entrenamiento. La model card unicamente enlaza al dataset `NikeSong/so101_gestures` como fuente de datos y a una coleccion de Hugging Face que agrupa los artefactos del proyecto. No se menciona el uso de RLHF, DPO ni tecnicas de refinamiento posteriores, algo por otra parte ajeno al paradigma de aprendizaje por imitacion de ACT.

## Capacidades

- Control visuomotor del brazo robotico SO-101 para la ejecucion de gestos, a partir de observaciones visuales y del estado de las articulaciones.
- Aprendizaje por imitacion: reproduce comportamientos demostrados en el dataset asociado, sin capacidad de generalizacion declarada fuera de la distribucion de entrenamiento.
- Prediccion de acciones por chunks (propia de ACT), lo que permite secuencias de movimiento mas coherentes que un control paso a paso.
- Integracion con el ecosistema LeRobot para entrenamiento, evaluacion y despliegue en robot real.
- No se declaran capacidades de generacion de texto, razonamiento, codigo, matematicas, vision general, tool calling, agentes ni multilingues.

## Casos de uso

- Reproduccion de experimentos de LeRobot: el checkpoint permite cargar una politica ACT ya entrenada para inspeccionar el pipeline completo (dataset, entrenamiento, evaluacion) sin tener que reentrenar desde cero.
- Demostracion educativa de aprendizaje por imitacion: util en cursos y talleres sobre robotica de bajo coste con el brazo SO-101, donde se explica como una politica transformer mapea imagenes y estados articulares a acciones.
- Punto de partida para fine-tuning: dado que la licencia Apache 2.0 lo permite, puede servir como inicializacion para entrenar gestos adicionales con nuevos datasets capturados por el usuario.
- Evaluacion comparativa de algoritmos de imitacion: al ser un checkpoint ACT publico, permite contrastar su comportamiento con otras politicas (por ejemplo, diffusion policy) sobre el mismo hardware y tarea.
- Pruebas de infraestructura de despliegue robotic: sirve para validar cadenas de inferencia en tiempo real sobre SO-101 (lectura de camaras, publicacion de comandos a los servos) antes de invertir en datos propios.
- Referencia para la comunidad hispanohablante de robotica open source: documenta un flujo de trabajo reproducible de publicacion de pesos y datasets en Hugging Face siguiendo las convenciones de LeRobot.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tasas de exito, curvas de aprendizaje, numero de episodios de evaluacion ni comparaciones con otras politicas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Al tratarse de una politica ACT para un brazo de sobremesa, es habitual que estos modelos se ejecuten en GPU de consumo, pero no se confirma en la informacion proporcionada.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no confirmada; no se especifica.
- Opciones de despliegue: LeRobot (libreria declarada en los tags del repositorio). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Hardware objetivo | Licencia | Datos publicados |
|---|---|---|---|---|
| so101_gestures_act (NikeSong) | Politica ACT (LeRobot) | Brazo SO-101 | Apache 2.0 | Dataset enlazado; sin metricas |
| Politicas ACT de referencia en LeRobot | Politica ACT (LeRobot) | SO-100 / SO-101 | Apache 2.0 (segun el proyecto LeRobot) | Ejemplos y tutoriales en la documentacion de LeRobot |
| Diffusion Policy (implementaciones en LeRobot) | Politica de difusion para control | Brazos de bajo coste | Variable segun implementacion | Depende del repositorio |

No se dispone de datos suficientes para una comparacion cuantitativa de rendimiento entre estas alternativas; la comparativa se limita a categoria, hardware y licencia.

## Limitaciones y advertencias

- La model card describe el repositorio como un "placeholder" de los pesos de la politica ACT, por lo que el contenido puede estar incompleto, desactualizado o no corresponder a un entrenamiento finalizado.
- No hay informacion sobre el numero de demostraciones, la calidad de las mismas ni la tasa de exito de la politica; no debe asumirse un rendimiento funcional en produccion.
- El modelo esta especializado en una tarea concreta (gestos con SO-101) y no generaliza a otras tareas, objetos o morfologias sin reentrenamiento.
- No se declaran sesgos, pero al ser un modelo de robotica entrenado con demostraciones humanas puede heredar sesgos de las trayectorias del demostrador y fallar ante condiciones de iluminacion, fondo o posicion distintas de las del dataset.
- Sin capacidades linguisticas ni de razonamiento; no debe evaluarse con benchmarks de texto.
- La licencia Apache 2.0 permite uso comercial y modificacion, pero el usuario debe verificar por su cuenta el cumplimiento en el despliegue fisico del robot y la seguridad del entorno.
- No se especifican requisitos de seguridad para operar el brazo robotico; cualquier uso real debe acompanarse de limites de par, paradas de emergencia y supervision.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/NikeSong/so101_gestures_act
- Dataset asociado: https://huggingface.co/datasets/NikeSong/so101_gestures
- Coleccion del proyecto: https://huggingface.co/collections/NikeSong/so-101-gestures-6ae5b75468c02fe9f5560be7
- LeRobot (libreria): https://github.com/huggingface/lerobot
