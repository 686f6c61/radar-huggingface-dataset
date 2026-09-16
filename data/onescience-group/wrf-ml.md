# OneScience-Group/WRF-ML

## Resumen

WRF-ML es una reproducción de ingeniería del modelo descrito en el artículo "WRF–ML v1.0: a bridge between WRF v4.3 and machine learning parameterizations and its application to atmospheric radiative transfer" (Geoscientific Model Development, 2023), propuesto originalmente por investigadores de Damo Academy (Alibaba Group). Su objetivo es sustituir el cálculo de transferencia radiativa RRTMG dentro del modelo meteorológico WRF v4.3 por una red neuronal que emule sus salidas, reduciendo el coste computacional de una de las parametrizaciones físicas más caras de la simulación atmosférica.

El modelo implementa la variante recomendada por los autores (Model D) mediante una LSTM bidireccional que recibe columnas atmosféricas y predice flujos y tasas de calentamiento de onda corta y onda larga. Cada muestra contiene 57 niveles verticales y el sistema incorpora adaptación de layout y un protocolo síncrono de petición-respuesta para funcionar como parametrización física *online* dentro de WRF, con salidas de perfil de forma `[6,57,4]` y de frontera de forma `[6,2]`.

Es relevante porque demuestra un patrón híbrido clima-ML reproducible y acoplable a un modelo numérico operativo, y porque publica un flujo completo de datos sintéticos, entrenamiento distribuido, inferencia y evaluación. El repositorio no incluye pesos preentrenados: se distribuye como reproducción de código bajo Apache 2.0, con el código y datos originales archivados por los autores en Zenodo.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LSTM bidireccional (variante Model D del artículo) sobre columnas atmosféricas |
| Parametros totales | no disponible |
| Longitud de contexto | no aplica; entradas de columna atmosférica de 57 niveles verticales |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (la model card declara inglés; el modelo opera sobre datos numéricos) |
| Licencia | Apache 2.0 (código); artículo original bajo CC BY 4.0 |
| Formato de pesos | checkpoint de PyTorch (`.pt`); no se publica checkpoint preentrenado |

## Arquitectura y entrenamiento

La arquitectura es una LSTM bidireccional que emula las salidas de RRTMG (onda corta y onda larga) a partir de columnas atmosféricas. El artículo emplea un dominio horizontal de `190x170`, 57 niveles verticales y columnas WRF-RRTMG muestreadas cada 30 minutos; el modelo consume esas columnas y devuelve seis salidas de radiación (flujos de onda corta y larga, tasas de calentamiento y flujo de onda corta en frontera). El repositorio incorpora adaptación de layout para convertir la estructura de WRF al formato de entrada de la red y restaurar después el layout de salida, además de un protocolo síncrono de petición-respuesta que permite usarlo como parametrización *online*.

El entrenamiento del repositorio se realiza con datos sintéticos que preservan los 57 niveles, la conversión de layout de WRF y la semántica de las seis salidas, pero reducen el número de columnas, la anchura oculta y las épocas. La model card advierte explícitamente de que las diez variables de entrada son un "registro de ingeniería", porque el artículo no enumera todas las variables de entrada, y que los resultados obtenidos con estos datos sintéticos solo verifican el flujo de trabajo, no el rendimiento del artículo. El entrenamiento soporta proceso único y DDP con dos procesos mediante `torchrun`, y guarda un checkpoint recuperable de estilo Model D junto con métricas de error cuadrático medio normalizado.

## Capacidades

- Emulación de transferencia radiativa: predice flujos de onda corta y onda larga y tasas de calentamiento a partir de columnas atmosféricas de 57 niveles.
- Emulación de flujos de frontera: genera la salida de frontera de forma `[6,2]` además del perfil `[6,57,4]`.
- Integración como parametrización física *online* en WRF v4.3 mediante adaptación de layout y protocolo síncrono de petición-respuesta.
- Evaluación offline: calcula RMSE para las seis salidas de radiación (flujos de onda corta y larga, tasas de calentamiento y flujo de onda corta en frontera).
- Entrenamiento distribuido: soporta ejecución multiproceso con `torchrun` y DDP verificado a dos procesos.
- Ejecución en ModelScope y OneCode para validar datos estructurados, entrenamiento, inferencia, métricas probabilísticas de precipitación y visualización.
- No es un modelo de lenguaje: no soporta *tool calling*, agentes, razonamiento multi-paso ni generación de texto, código o matemáticas.

## Casos de uso

- Aceleración de la parametrización radiativa en WRF: sustituir las llamadas a RRTMG por la LSTM bidireccional dentro de la simulación, reduciendo el coste de una de las parametrizaciones más exigentes sin modificar el resto del modelo.
- Validación de acoplamiento *online*: comprobar que la adaptación de layout y el protocolo síncrono de petición-respuesta restauran correctamente las formas de salida `[6,57,4]` y `[6,2]` antes de integrar el modelo en un experimento completo.
- Evaluación offline de emulación: entrenar con columnas WRF-RRTMG y medir el RMSE de las seis salidas de radiación para cuantificar la fidelidad de la emulación frente al esquema físico original.
- Experimentación híbrida clima-ML: usar el repositorio como plantilla para sustituir otras parametrizaciones físicas por redes neuronales, reutilizando el pipeline de datos, entrenamiento e inferencia.
- Entrenamiento distribuido en clústeres: lanzar entrenamientos multiproceso con `torchrun` sobre varias GPU o DCU para escalar el número de columnas y épocas más allá de la configuración sintética por defecto.
- Reproducción docente o de investigación: ejecutar el flujo completo con datos sintéticos (`fake_data.py`, `train.py`, `inference.py`, `result.py`) para estudiar cómo se conecta un modelo de *machine learning* con un modelo numérico de predicción.
- Validación de entornos DCU: desplegar el flujo sobre aceleradores DCU con DTK 25.04.2 y el paquete `onescience[earth-dcu]`, como prueba de portabilidad del *stack*.
- Integración en ModelScope o OneCode: validar datos estructurados, métricas y visualización dentro de esas plataformas antes de llevar el modelo a producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio únicamente describe que la evaluación calcula RMSE para las seis salidas de radiación y genera una comparación de perfiles verticales, pero no incluye cifras concretas. La propia model card advierte de que los resultados de la ejecución sintética verifican el flujo de trabajo y no representan el rendimiento del artículo.

## Requisitos de hardware

- VRAM estimada: no disponible.
- GPU o DCU recomendadas por el autor; no se especifican modelos concretos.
- Una CPU puede ejecutar la configuración de conectividad con muestra pequeña incluida por defecto.
- Para DCU se requiere DTK 25.04.2 o una versión compatible recomendada por OneScience.
- Entorno GPU: Python 3.11 con `libstdcxx-ng=12`, `libgcc-ng=12`, `gcc_linux-64=12` y `gxx_linux-64=12`, más `onescience[earth-gpu]`.
- Entorno DCU: Python 3.11 y `onescience[earth-dcu]`.
- Entrenamiento distribuido verificado con `torchrun --nproc_per_node=2 --nnodes=1`.
- Opciones de despliegue: PyTorch, `torchrun` para DDP, y ejecución en ModelScope o OneCode. No aplica el despliegue con vLLM, llama.cpp, Ollama o TGI, al no ser un modelo de lenguaje.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone en la información proporcionada de modelos comparables con parámetros, contexto, rendimiento y licencia verificables. El único punto de referencia directo es la implementación original del artículo (WRF–ML v1.0) publicada por Damo Academy, cuyo código y datos están archivados en Zenodo; este repositorio se declara como una reproducción independiente de esas especificaciones, sin checkpoint preentrenado enlazado ni resultados de rendimiento comparables.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| OneScience-Group/WRF-ML | no disponible | no aplica (57 niveles verticales) | no disponible | Apache 2.0 (código) | Repositorio de código; sin pesos preentrenados |
| WRF–ML v1.0 (implementación original) | no disponible | no aplica | no disponible | Paper CC BY 4.0 | Código y datos en Zenodo |

## Limitaciones y advertencias

- No se publica checkpoint preentrenado: la model card indica que no se enlaza ninguno porque no se confirmó un artefacto de pesos oficial con licencia separada. Cualquier uso real exige entrenar desde cero.
- Los datos incluidos son sintéticos: reducen columnas, anchura oculta y épocas, por lo que sus resultados no reproducen el rendimiento del artículo.
- Las diez variables de entrada son un "registro de ingeniería", ya que el artículo no enumera todas las variables de entrada del modelo original; esto puede provocar divergencias respecto a la implementación de referencia.
- Sesgos conocidos: no disponibles.
- Riesgo de alucinación: no aplica en el sentido de los modelos de lenguaje, pero sí existe riesgo de error de emulación; el propio repositorio recomienda cuantificarlo con RMSE sobre las seis salidas de radiación.
- Limitaciones de idioma: la model card declara únicamente inglés, aunque la entrada real son datos numéricos de columnas atmosféricas.
- Restricciones de licencia: el código de este repositorio es Apache 2.0, pero el artículo original, WRF, RRTMG, ONNX Runtime y los datos asociados mantienen sus propias licencias y condiciones, que deben respetarse por separado en uso comercial.
- Requisitos de entorno estrictos: DCU necesita DTK 25.04.2 o compatible, y GPU requiere versiones concretas de `libstdcxx-ng`, `libgcc-ng` y compiladores GCC 12.
- Advertencia de producción: al no haber pesos preentrenados ni métricas publicadas, no debe desplegarse como parametrización operativa sin un ciclo propio de entrenamiento y validación contra RRTMG.

## Enlaces

- HuggingFace: https://huggingface.co/OneScience-Group/WRF-ML
- Artículo (WRF–ML v1.0): https://doi.org/10.5194/gmd-16-199-2023
- Código y datos originales (Zenodo): https://doi.org/10.5281/zenodo.7407487
- OneScience en Gitee: https://gitee.com/onescience-ai/onescience
- OneSkills en Gitee: https://gitee.com/onescience-ai/oneskills
- OneScience en GitHub: https://github.com/onescience-ai/OneScience
- OneSkills en GitHub: https://github.com/onescience-ai/oneskills
