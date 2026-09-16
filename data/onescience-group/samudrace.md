# OneScience-Group/SamudrACE

## Resumen

SamudrACE es un modelo de emulacion climatica acoplada que combina un emulador tridimensional de atmosfera y un emulador tridimensional de oceano en un unico modelo rapido. Lo desarrollan equipos de Ai2, la Universidad de Nueva York, la Universidad de Princeton, NOAA/GFDL, la Universidad de Columbia y colaboradores. El problema que resuelve es el coste computacional de los modelos climaticos acoplados tradicionales: en lugar de resolver las ecuaciones fisicas paso a paso, SamudrACE aprende la dinamica a partir de simulaciones y permite ejecutar periodos largos en una fraccion del tiempo.

El modelo se entreno con una simulacion de control preindustrial de 200 anos de GFDL CM4. Integra un componente atmosferico de estilo ACE2 y un componente oceanico de estilo SamudraI, que intercambian estado fisico (temperatura superficial del mar, hielo marino y flujos superficiales) para producir simulaciones acopladas estables. La relacion de acoplamiento es de 20 pasos de atmosfera por cada paso de oceano.

La relevancia actual radica en que los emuladores de clima estan emergiendo como alternativa practica para explorar escenarios de largo plazo, diagnosticar deriva climatica y generar grandes volumenes de simulaciones donde un modelo fisico completo seria prohibitivamente caro. La ficha de HuggingFace corresponde a una reproduccion de ingenieria independiente de las especificaciones publicas de SamudrACE bajo licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Emuladores acoplados: atmosfera estilo ACE2 y oceano estilo SamudraI, en espacio de estado fisico 3D |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; no aplica ventana de contexto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en |
| Licencia | Apache 2.0 |
| Formato de pesos | Checkpoint de PyTorch (`result/checkpoints/samudrace.pt`) |

## Arquitectura y entrenamiento

SamudrACE es un modelo acoplado de emulacion climatica, no un modelo de lenguaje. Combina dos emuladores: un componente atmosferico con arquitectura de estilo ACE2 (`46` canales de atmosfera) y un componente oceanico de estilo SamudraI (`80` canales de oceano), sumando los `126` campos enumerados en el articulo. Los componentes intercambian estados fisicos en espacio de estado real (no en un espacio latente compartido), lo que segun los autores favorece la estabilidad de la simulacion a largo plazo. La relacion de acoplamiento es de `20` pasos atmosfericos por cada paso oceanico. El estado global se mantiene en una malla multinivel de aproximadamente un grado.

El entrenamiento se realizo con una simulacion de control preindustrial de `200` anos de GFDL CM4. El repositorio describe un entrenamiento con retropropagacion acoplada a traves de 20 pasos de atmosfera y 1 paso de oceano, con soporte para ejecucion en un solo proceso y en dos procesos DDP mediante `torchrun`. La inferencia restaura el checkpoint y preserva los 46 canales de atmosfera, los 80 canales de oceano, las coordenadas de tile originales y el marcador de globo incompleto. Los datos sinteticos de prueba conservan los 126 campos y la relacion de acoplamiento 20 a 1. No se detallan en la informacion disponible la composicion exacta del dataset, el numero de tokens equivalente ni el uso de RLHF o DPO (tecnicas que, por otra parte, no aplican a este tipo de modelo).

## Capacidades

- Emulacion de atmosfera y oceano en 3D acoplados dentro de un unico modelo.
- Simulacion climatica acoplada a largo plazo con intercambio de SST, hielo marino y flujos superficiales.
- Diagnostico de deriva climatica mediante proxies de atmosfera, calor y salinidad.
- Emulacion climatica global preservando un estado logico multinivel de aproximadamente un grado.
- Ejecucion de simulaciones con relacion de acoplamiento 20:1 (20 pasos de atmosfera por 1 de oceano).
- Entrenamiento multi-GPU y multi-proceso mediante `torchrun` (DDP).
- Validacion de datos estructurados, entrenamiento, inferencia, metricas climaticas y visualizacion en el ecosistema OneScience/OneCode.
- Soporte de ejecucion en GPU y en aceleradores DCU (requiere DTK 25.04.2 o version compatible recomendada por OneScience); CPU disponible para validacion de conectividad con la configuracion de muestra pequena.

## Casos de uso

- Simulacion climatica acoplada de largo plazo: permite ejecutar periodos extensos encadenando 20 pasos de atmosfera por cada paso de oceano, lo que reduce el coste frente a un modelo fisico acoplado completo.
- Diagnostico de deriva climatica: el modelo expone proxies de atmosfera, calor y salinidad que se pueden monitorizar en `result/evaluation/` para detectar desviaciones en ejecuciones prolongadas.
- Emulacion climatica global: mantiene un estado multinivel de aproximadamente un grado, adecuado para explorar configuraciones globales sin resolver explicitamente toda la fisica.
- Reproduccion de experimentos y validacion metodologica: al ser una reproduccion de ingenieria de las especificaciones publicas, sirve para verificar pipelines de entrenamiento e inferencia acoplados.
- Desarrollo y validacion de infraestructura climatica en OneScience/OneCode: cubre datos estructurados, entrenamiento, inferencia, metricas y visualizacion dentro de un mismo flujo.
- Entrenamiento distribuido en cluster: se puede lanzar entrenamiento multiproceso con `torchrun --nproc_per_node=2 --nnodes=1`, lo que facilita escalar a mas GPUs para experimentos de mayor duracion.
- Exploracion de escenarios de clima preindustrial: al haberse entrenado con la simulacion de control preindustrial de GFDL CM4, es util para estudiar el comportamiento base del sistema acoplado antes de introducir forzamientos.
- Integracion en pipelines de investigacion academica: permite sustituir componentes costosos por emuladores en estudios de sensibilidad donde se requieren muchas ejecuciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible.
- GPU recomendadas: no se especifica ninguna familia concreta; el autor recomienda usar GPU o DCU.
- DCU: requiere DTK 25.04.2 o una version compatible recomendada por OneScience.
- CPU: utilizable para validacion de conectividad con la configuracion de muestra pequena por defecto.
- Despliegue: scripts de Python del repositorio (`scripts/train.py`, `scripts/inference.py`, `scripts/result.py`), con soporte de `torchrun` para entrenamiento multiproceso (DDP) y del paquete `onescience` con extras `earth-gpu` o `earth-dcu`.
- Latencia y throughput: no disponible.
- Multi-GPU: se ha verificado la ejecucion en un solo proceso y en dos procesos DDP.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SamudrACE | Emulador climatico acoplado atmosfera + oceano 3D | no disponible | no aplica | Apache 2.0 (reproduccion) | HuggingFace, Gitee, GitHub |
| ACE2 | Emulador atmosferico (componente de referencia) | no disponible | no aplica | no disponible | no disponible |
| SamudraI | Emulador oceanico (componente de referencia) | no disponible | no aplica | no disponible | no disponible |

No se dispone en la informacion proporcionada de datos cuantitativos de parametros, contexto o rendimiento de los modelos comparables.

## Limitaciones y advertencias

- El repositorio de HuggingFace se declara como una reproduccion de ingenieria independiente de las especificaciones publicas de SamudrACE; no son necesariamente los pesos o el codigo oficiales.
- El articulo original, el codigo oficial, los pesos y los datos de GFDL CM4 estan sujetos a sus propias licencias y terminos, que pueden diferir de la licencia Apache 2.0 de esta reproduccion.
- El modelo se entrena con una unica simulacion de control preindustrial de 200 anos de GFDL CM4, lo que puede introducir sesgos hacia ese regimen climatico y limitar su validez para climas muy alejados del preindustrial.
- No es un modelo de lenguaje: no genera texto, no soporta tool calling ni razonamiento multietapa, y no tiene ventana de contexto ni cuantizaciones en el sentido habitual.
- El idioma declarado es `en`, lo que afecta a la documentacion y a los recursos asociados, no a la salida del modelo (que son campos fisicos).
- Las pruebas del repositorio se apoyan en datos sinteticos que conservan los 126 campos y la relacion de acoplamiento; esto valida la estructura del pipeline, no necesariamente la fidelidad climatica.
- Riesgo de deriva en simulaciones largas: es precisamente uno de los diagnosticos previstos, por lo que conviene monitorizar los proxies de atmosfera, calor y salinidad.
- El despliegue en DCU exige versiones concretas del toolkit (DTK 25.04.2 o compatible), lo que puede complicar la reproducibilidad en entornos distintos.
- No se han publicado en la informacion disponible datos de rendimiento, benchmarks ni limites de contexto que permitan evaluar la calidad de la emulacion frente a alternativas.

## Enlaces

- HuggingFace: https://huggingface.co/OneScience-Group/SamudrACE
- Paper (arXiv): https://arxiv.org/abs/2509.12490
- OneScience (GitHub): https://github.com/onescience-ai/OneScience
- OneSkills (GitHub): https://github.com/onescience-ai/oneskills
- OneScience (Gitee): https://gitee.com/onescience-ai/onescience
- OneSkills (Gitee): https://gitee.com/onescience-ai/oneskills
