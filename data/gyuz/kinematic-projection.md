# gyuz/kinematic-projection

## Resumen

Kinematic Projection of Learned Trajectory Plans es un conjunto de checkpoints publicado por el autor gyuz (repositorio `gyuz/kinematic-projection`) asociado al articulo *Kinematic Projection of Learned Trajectory Plans: Conditions for Improving Planning and Execution Accuracy*, enviado a IJCAS. No es un modelo de lenguaje: es un sistema de conduccion autonoma end-to-end orientado a la planificacion de trayectorias, entrenado y evaluado sobre el dataset ETRI E2E Driving Dataset con movimiento del ego a 10 Hz.

El repositorio contiene seis checkpoints en formato PyTorch (`.pth`) que cubren las dos etapas del pipeline: una etapa 1 de percepcion y modelo del mundo, y una etapa 2 de planificacion con tres variantes de discretizacion espacial (planner de 105 celdas, planner de 15 celdas y un baseline sin celdas). Ademas incluye un checkpoint de la etapa 1 preentrenado en nuScenes, que sirve como punto de partida del entrenamiento.

La relevancia es acotada pero especifica: el trabajo propone una tecnica de proyeccion cinematica aplicada a planes de trayectoria aprendidos, y estos pesos permiten reproducir los experimentos del articulo. El repositorio ocupa 3,9 GB, la licencia es Apache 2.0 y el codigo asociado esta en GitHub. No hay informacion publicada sobre idiomas, pipeline ni descargas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (etapa 1 de percepcion y modelo del mundo + etapa 2 de planificacion de trayectorias con representacion en celdas) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (la tarea opera sobre secuencias de ego motion a 10 Hz, sin ventana declarada) |
| Tipos de cuantizacion | no disponible (pesos distribuidos solo en `.pth` en precision nativa) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch (`.pth`) |

## Arquitectura y entrenamiento

La model card no detalla la arquitectura interna de la red. Lo que se documenta es la organizacion en dos etapas: una etapa 1 que agrupa percepcion y modelo del mundo (`stage1_split301_10hz_epoch48.pth`), y una etapa 2 de planificacion que arranca desde una inicializacion fusionada de la etapa 1 (`stage2_init_split301_10hz.pth`). La etapa 1 puede iniciarse desde un checkpoint preentrenado en nuScenes (`law_pretrained_nus.pth`), lo que sugiere transferencia desde un corpus de conduccion mayor antes de adaptar al dataset ETRI.

El entrenamiento se realiza sobre las 301 escenas de entrenamiento del ETRI E2E Driving Dataset, con ego motion muestreado a 10 Hz, y la evaluacion se hace sobre 75 escenas reservadas. Los checkpoints de etapa 2 se entrenan durante 12 epocas y almacenan pesos EMA, con las claves `ema_*` como pesos crudos que se ignoran en inferencia; la etapa 1 se entrena durante 48 epocas. La innovacion central anunciada por el articulo es la proyeccion cinematica de los planes aprendidos, con el objetivo de mejorar la precision de planificacion y ejecucion; las tres variantes de etapa 2 (105 celdas, 15 celdas y sin celdas) corresponden a distintos niveles de discretizacion espacial del plan, lo que permite ablacionar el efecto de la representacion en celdas.

## Capacidades

- Planificacion de trayectorias end-to-end para conduccion autonoma a partir de percepcion y estado del ego.
- Percepcion y modelo del mundo en la etapa 1, reutilizable como inicializacion de la etapa 2.
- Proyeccion cinematica de planes de trayectoria aprendidos, segun el metodo del articulo.
- Tres configuraciones de planificador (105 celdas, 15 celdas, sin celdas) para analisis de ablacion.
- Transferencia desde preentrenamiento en nuScenes hacia el dataset ETRI.
- No dispone de generacion de texto, razonamiento linguistico, codigo, matematicas, vision general, tool calling ni capacidades de agente conversacional.

## Casos de uso

- Reproduccion de experimentos del articulo: cargar los checkpoints de etapa 2 y evaluar sobre las 75 escenas reservadas del ETRI E2E Driving Dataset para verificar las cifras de planificacion y ejecucion publicadas.
- Ablacion de la representacion en celdas: comparar el planner de 105 celdas, el de 15 celdas y el baseline sin celdas bajo el mismo split de 301 escenas para aislar el efecto de la discretizacion espacial sobre el error de trayectoria.
- Estudio de la proyeccion cinematica: usar los planes generados por el modelo como entrada del modulo de proyeccion y medir la mejora en precision de ejecucion frente al plan crudo.
- Inicializacion de nuevos experimentos de planificacion: partir de `stage2_init_split301_10hz.pth` o de `law_pretrained_nus.pth` para adaptar el pipeline a otro dataset de conduccion con ego motion a 10 Hz.
- Analisis del modelo del mundo: emplear la etapa 1 (`stage1_split301_10hz_epoch48.pth`) para estudiar la calidad de las representaciones de percepcion antes de la planificacion.
- Docencia e investigacion en conduccion end-to-end: servir como base reproducible para comparar metodos de planificacion de trayectorias en un entorno controlado de 301 escenas de entrenamiento y 75 de test.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible. El tamano del repositorio (3,9 GB) incluye seis checkpoints, por lo que el peso individual de cada uno es una fraccion de esa cifra; no se declara el numero de parametros ni la VRAM necesaria.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible; al no conocerse el tamano por checkpoint no puede confirmarse que quepa en una RTX 4090 u otra GPU consumer.
- Opciones de despliegue: los pesos son `.pth` de PyTorch y el codigo esta en `github.com/gyuz1/E2E_AD_cell-planner`; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables de planificacion end-to-end sobre el ETRI E2E Driving Dataset ni cifras de rendimiento que permitan una comparacion fundamentada.

## Limitaciones y advertencias

- Modelo de dominio especifico: entrenado exclusivamente sobre el ETRI E2E Driving Dataset (301 escenas de entrenamiento, 75 de evaluacion) y no validado fuera de ese corpus.
- Sin datos publicados de sesgos, tasas de alucinacion o fallos en escenarios de conduccion no vistos; no hay evaluacion de seguridad en carretera.
- Los checkpoints de etapa 2 contienen pesos EMA; las claves `ema_*` deben ignorarse en inferencia, y un uso incorrecto de las claves puede degradar los resultados.
- La model card no declara idiomas, parametros, contexto ni requisitos de hardware, lo que limita la planificacion de despliegue.
- Licencia Apache 2.0: permite uso comercial y modificacion con atribucion y aviso de cambios, pero no se documentan patentes ni restricciones adicionales; verificar el texto completo de la licencia antes de produccion.
- El repositorio no registra descargas ni likes y la fecha de creacion indicada es 2026-11-18, por lo que se trata de un artefacto de investigacion reciente y sin validacion comunitaria.
- Uso previsto de investigacion: no debe interpretarse como un sistema listo para produccion en vehiculos reales sin validacion independiente.

## Enlaces

- Hugging Face: https://huggingface.co/gyuz/kinematic-projection
- Codigo: https://github.com/gyuz1/E2E_AD_cell-planner
- Paper: no disponible como enlace directo (enviado a IJCAS, segun la model card)
