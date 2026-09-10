# BonanDing/worldmem-baseline-evals

## Resumen

BonanDing/worldmem-baseline-evals no es un modelo, sino un repositorio de evaluaciones de referencia (baseline) para modelos de mundo (world models). Recopila cuatro workspaces independientes, cada uno con su propio entorno conda, para reproducir los protocolos de evaluación de los métodos DecMem, Matrix-Game 2.0, LIVE y Geometry Forcing. El objetivo es proporcionar una infraestructura de comparación estandarizada para los dominios Minecraft y RealEstate10K, incluyendo código de evaluacion, manifests fijos y scripts de despliegue para clústeres HPC.

El repositorio no incluye pesos preentrenados; estos se descargan automaticamente desde los repositorios de los autores durante la instalacion. Los protocolos de evaluacion cubren generacion de frames observadas y generadas, con métricas comunes compartidas. La relevancia actual radica en que permite reproducir y comparar de forma controlada distintos enfoques de modelado de mundo, un area clave para agentes que interactúan con entornos simulados. Sin embargo, no se trata de un modelo con arquitectura o parametros propios, por lo que muchas especificaciones tecnicas clasicas no aplican.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (repositorio de evaluacion, no un modelo) |
| Parametros totales | No disponible |
| Parametros activos | No aplicable (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | mixed-upstream-licenses (incluye S-Lab License 1.0 y licencias permisivas de terceros) |
| Formato de pesos | No disponible (los pesos se descargan desde repositorios externos) |

## Arquitectura y entrenamiento

Este repositorio no contiene un modelo entrenado ni implementa una arquitectura propia. Se estructura como un conjunto de cuatro métodos de world model independientes: DecMem, Matrix-Game 2.0, LIVE y Geometry Forcing. Cada método dispone de su propio workspace y entorno conda, con scripts de instalacion que compilan extensiones CUDA, descargan checkpoints y validan datos. Los protocolos de evaluacion son fijos y se indican en la documentacion, con detalles como el muestreo por pasos (por ejemplo, UniPC20 con CFG5 para DecMem, sampler de tres pasos para Matrix-Game, DDIM50 con siete frames recientes para Geometry Forcing).

No consta informacion sobre datos de entrenamiento, tokens procesados, RLHF o DPO. Los detalles sobre las capacidades nativas de cada modelo, sus datos de entrenamiento, controles de entrada y samplers se registran como metadatos en el repositorio, sin describirlos como equivalentes entre metodos. La evaluacion en Minecraft utiliza frames de observacion `[100,700)` y scores `[700,1200)` a 360×640, mientras que RealEstate10K usa 100 frames observados y 300 generados a 256×256, con una secuencia duplicada en el punto de giro.

## Capacidades

- Comparacion estandarizada de world models en los dominios Minecraft y RealEstate10K.
- Generacion de frames observados y generados segun protocolos definidos (600 observados + 500 generados para Minecraft; 100 observados + 300 generados para RE10K).
- Soporte para multiples metodos: DecMem, Matrix-Game 2.0, LIVE y Geometry Forcing.
- Incluye funciones de scoring comun con metricas agregadas, como FID agrupado y evaluacion de RGB decodificado.
- Scripts de despliegue para entornos HPC con Slurm, incluyendo jobs de smoke test y jobs de evaluacion completa.
- Descarga automatica de pesos desde repositorios de los autores y validacion de datasets locales.
- Capacidad de ejecutar cada metodo de forma independiente, con sus propios samplers y configuraciones de control.

## Casos de uso

- Reproduccion de benchmarks de world models: permite ejecutar los protocolos originales de DecMem, Matrix-Game, LIVE y Geometry Forcing en un entorno unificado, facilitando la verificacion de resultados publicados.
- Comparacion de metodos en Minecraft: ideal para evaluar agentes que navegan y generan no solo frames, sino tambien acciones y secuencias temporales, con validacion cruzada mediante semillas.
- Evaluacion de generacion de video en RealEstate10K: util para medir coherencia espacial y temporal en escenas de interiores, especialmente con la secuencia de ida y vuelta y el turno duplicado.
- Investigacion en modelos de mundo para robotica y simulacion: el protocolo de 300 casos con semillas fijas permite pruebas controladas de robustez y generalizacion.
- Integracion en pipelines de CI/CD para HPC: los scripts de setup y smoke tests permiten automatizar la verificacion de instalacion y la correccion de la generacion antes de lanzar evaluaciones largas.
- Auditoria de metodos de world modeling: el repositorio incluye manifests de versiones y una lista de fuentes upstream, lo que facilita el trazado de dependencias y licencias.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio contiene el codigo de evaluacion y los protocolos, pero no incluye metricas finales de los modelos evaluados. Los jobs de smoke test solo verifican la generacion y el scoring en un caso real, sin producir resultados de rendimiento publicados.

## Requisitos de hardware

- Para la instalacion del entorno en Berzelius Hopper: 14 CPUs, sin GPU, con limite de ocho horas, usando la particion `berzelius-hopper-cpu`.
- Para pruebas smoke: una GPU H200 durante cuatro horas por metodo.
- Para evaluacion completa: ocho GPUs H200 durante 48 horas por metodo.
- Cada job de GPU solicita 14 cores de CPU por H200; la asignacion de memoria queda a cargo de Slurm.
- No se aportan datos de latencia ni throughput en la documentacion.

## Comparativa con modelos similares

No disponible. La informacion proporcionada describe un repositorio de evaluacion, no un modelo concreto. No se identifican alternativas comparables en la misma categoria, ya que se trata de una herramienta de infraestructura, no de un modelo con parametros o rendimiento medible.

## Limitaciones y advertencias

- No es un modelo: no hay arquitectura, parametros ni pesos propios; cualquier uso como modelo es invalido.
- Las licencias son mixtas: el metodo WorldMem de referencia esta cubierto por S-Lab License 1.0, que puede imponer restricciones de uso comercial o de redistribucion.
- No se reivindica exito en la instalacion ni en la correccion de ejecucion en el clúster Berzelius: la validacion se realizo localmente en H200, pero la instalacion en Berzelius debe verificarse mediante los jobs de setup y smoke.
- Dependencia de fuentes externas: los pesos se descargan de repositorios de los autores, por lo que la reproducibilidad puede verse afectada si esos repositorios cambian o desaparecen.
- Los detalles de capacidad y control de cada metodo son especificos y no deben tratarse como equivalentes entre si.
- No hay informacion sobre sesgos, alucinaciones o limitaciones de idioma, ya que no se evaluan aspectos de lenguaje.

## Enlaces

- HuggingFace: https://huggingface.co/BonanDing/worldmem-baseline-evals
- Licencias de terceros: https://huggingface.co/BonanDing/worldmem-baseline-evals/blob/main/THIRD_PARTY.md
