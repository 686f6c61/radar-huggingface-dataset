# OneScience-Group/WeatherBench2

## Resumen

WeatherBench2 es, pese a su publicación en HuggingFace, un banco de pruebas (benchmark) de evaluación y no un modelo de pesos. El repositorio `OneScience-Group/WeatherBench2` es una reproducción de ingeniería independiente de las especificaciones públicas de WeatherBench 2, el estándar propuesto conjuntamente por Google Research, Google DeepMind y ECMWF para evaluar la nueva generación de modelos meteorológicos globales basados en datos.

El benchmark cubre cuatro familias de diagnóstico sobre pronósticos globales de uno a catorce días: evaluación determinista, evaluación probabilística de ensembles, análisis de sesgo y diagnóstico espectral. Trabaja sobre pronósticos de 2020 de ERA5, IFS y varios sistemas data-driven, remuestreados a una rejilla común de 1,5 grados, lo que permite comparar modelos muy dispares bajo las mismas métricas.

Su relevancia actual deriva de la proliferación de modelos meteorológicos neuronales (GraphCast, Pangu-Weather, FuXi y similares) que necesitan una vara de medir común y reproducible. Este repositorio concreto añade una capa de ingeniería práctica: scripts de datos sintéticos, entrenamiento monoproceso y multiproceso, inferencia, evaluación y visualización, con soporte explícito para GPU y para aceleradores DCU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No aplica: es un benchmark de evaluación, no un modelo neuronal. La model card no especifica arquitectura para el baseline de entrenamiento incluido |
| Parametros totales | No disponible (no se publica un artefacto de pesos; `weight/` está vacío por diseño) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica |
| Tipos de cuantizacion | No disponible (no se distribuyen pesos cuantizados; el checkpoint de entrenamiento se guarda en `result/checkpoints/weatherbench2.pt`) |
| Idiomas soportados | Inglés (documentación y código) |
| Licencia | Apache 2.0 para el repositorio. Los datos ERA5, IFS y los pronósticos de los sistemas participantes quedan sujetos a las licencias y condiciones de uso de sus proyectos de origen |
| Formato de pesos | No aplica como modelo; el checkpoint de entrenamiento se guarda en formato PyTorch (`.pt`) |

Datos adicionales: autor `OneScience-Group`, framework PyTorch, pipeline no declarado, 0 descargas y 0 likes, región `us`, creado y actualizado el 17 de septiembre de 2026.

## Arquitectura y entrenamiento

Al tratarse de un benchmark, no existe una arquitectura de red definida en la información disponible. Lo que el repositorio sí implementa es un flujo completo de evaluación y un baseline compacto de entrenamiento. El benchmark original compara pronósticos globales de ERA5, IFS y múltiples sistemas data-driven correspondientes a 2020, interpolados a una rejilla común de 1,5 grados, con horizontes de pronóstico de uno a catorce días.

Los datos de entrenamiento del baseline son sintéticos por defecto: `scripts/fake_data.py` genera un conjunto que conserva ocho variables principales y la dimensión de ensemble, reduciendo el número de pasos temporales y el tamaño de la rejilla. El entrenamiento se lanza con `python scripts/train.py` en un solo proceso, o con `torchrun --standalone --nproc_per_node=2 scripts/train.py` para validar el escalado multiproceso. Los resultados se escriben en `result/checkpoints/weatherbench2.pt` y `result/training/metrics.json`. No se documenta en la información disponible el uso de RLHF, DPO ni ninguna innovación de atención o decodificación especulativa.

## Capacidades

- Evaluación determinista de pronósticos globales mediante RMSE, ACC, bias y SEEPS.
- Evaluación probabilística de ensembles mediante CRPS y ratio spread-skill.
- Diagnóstico de ensembles: comparación de medias de ensemble, dispersión y habilidad predictiva.
- Análisis de sesgo sobre la rejilla común de 1,5 grados.
- Diagnóstico espectral, es decir, evaluación del error en función de la escala espacial.
- Cobertura temporal de pronóstico de uno a catorce días.
- Inferencia de ensembles: `scripts/inference.py` genera una salida con forma `[8,8,8,24,48]` guardada en `result/output/predictions.npz`.
- Evaluación y visualización integradas: `scripts/result.py` produce `result/evaluation/metrics.json` y un mapa espacial de error en `result/evaluation/comparison.png`.
- Entrenamiento distribuido validado con `torchrun` sobre dos procesos.
- Ejecución sobre GPU, aceleradores DCU o CPU (esta última solo para validación de conectividad con la configuración de muestra pequeña).
- No dispone de tool calling, function calling, capacidades de agente, visión, audio ni modo de razonamiento explícito: no es un modelo generativo de propósito general.

## Casos de uso

- Validación de modelos meteorológicos data-driven: un equipo que entrena su propio modelo global puede usar este benchmark para calcular RMSE, ACC y bias frente a ERA5 e IFS bajo la misma rejilla de 1,5 grados, evitando comparaciones sesgadas por resoluciones distintas.
- Evaluación probabilística de ensembles: si el modelo produce un ensemble, el cálculo de CRPS y del ratio spread-skill permite detectar si el sistema está infravalorando o sobrevalorando la incertidumbre, algo crítico en predicción a medio plazo.
- Diagnóstico de sesgo por variable y región: el análisis de bias sobre las ocho variables principales permite identificar sesgos sistemáticos (por ejemplo, en temperatura a dos metros o en geopotencial) antes de desplegar un modelo en un servicio operativo.
- Análisis espectral de errores: el diagnóstico por escala espacial ayuda a determinar si un modelo falla en estructuras sinópticas de gran escala o en fenómenos de escala menor, guiando decisiones de arquitectura y de datos de entrenamiento.
- Integración en CI/CD de equipos de modelización: `scripts/fake_data.py` permite generar un conjunto sintético reducido y ejecutar el ciclo completo de entrenamiento, inferencia y evaluación como prueba de humo en cada commit, sin necesidad de descargar ERA5 completo.
- Validación de infraestructura multi-GPU: la ejecución con `torchrun --standalone --nproc_per_node=2` sirve para verificar que el entorno distribuido, las dependencias y el almacenamiento funcionan antes de lanzar entrenamientos largos y costosos.
- Verificación de entornos sobre aceleradores DCU: el repositorio documenta una instalación específica con DTK 25.04.2 y el extra `onescience[earth-dcu]`, lo que lo convierte en una prueba útil de compatibilidad en clústeres con hardware nacional o no-NVIDIA.
- Generación de material visual para informes: `comparison.png` produce un mapa espacial de error directamente utilizable en documentación técnica o publicaciones internas sobre el rendimiento de un modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye métricas numéricas de ningún modelo concreto: su función es precisamente calcularlas. Las métricas que implementa son RMSE, ACC, bias, SEEPS, CRPS y ratio spread-skill.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. No se publica un artefacto de pesos ni se indican requisitos de memoria.
- GPU o acelerador DCU recomendado para entrenamiento e inferencia, según la model card.
- CPU admitida únicamente para validación de conectividad con la configuración de muestra pequeña por defecto (datos sintéticos con rejilla y pasos temporales reducidos).
- Modelos de GPU concretos (A100, H100, RTX 4090, etc.): no disponibles en la información proporcionada.
- Aceleradores DCU: requieren DTK 25.04.2 o una versión compatible recomendada por OneScience, instalada previamente.
- Entorno GPU: Python 3.11 con `libstdcxx-ng=12`, `libgcc-ng=12`, `gcc_linux-64=12` y `gxx_linux-64=12`, más el extra `onescience[earth-gpu]`.
- Entorno DCU: Python 3.11 más el extra `onescience[earth-dcu]`, instalado desde el mirror `http://mirrors.onescience.ai:3141/pypi/simple/`.
- Escalado multiproceso: soportado mediante `torchrun`; el ejemplo documentado usa dos procesos.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no aplican, ya que no se trata de un modelo de lenguaje.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. El repositorio no publica comparativas numéricas frente a otros bancos de prueba, y una comparación entre benchmarks exige datos de cobertura, resolución y métricas que no figuran en la información proporcionada. Como referencia cualitativa, el propio benchmark declara basarse en las especificaciones públicas de WeatherBench 2, propuesto por Google Research, Google DeepMind y ECMWF, y este repositorio se presenta explícitamente como una reproducción de ingeniería independiente, no como el benchmark oficial.

| Criterio | OneScience-Group/WeatherBench2 | Benchmark oficial WeatherBench 2 | Otros frameworks de evaluación meteorológica |
|---|---|---|---|
| Naturaleza | Reproducción de ingeniería independiente | Benchmark de referencia | No disponible |
| Entidad responsable | OneScience-Group | Google Research, Google DeepMind y ECMWF | No disponible |
| Licencia | Apache 2.0 (datos de origen con sus propias licencias) | No disponible en la información proporcionada | No disponible |
| Entrenamiento multi-GPU documentado | Sí, mediante `torchrun` | No disponible | No disponible |
| Datos sintéticos para CI | Sí, `scripts/fake_data.py` | No disponible | No disponible |
| Soporte DCU | Sí, documentado con DTK 25.04.2 | No disponible | No disponible |

## Limitaciones y advertencias

- No es un modelo de lenguaje ni un modelo predictivo listo para usar: es un banco de pruebas. No debe evaluarse con criterios de MMLU, HumanEval o GSM8K.
- No se distribuyen pesos. El directorio `weight/` está vacío de forma intencionada y la model card lo justifica indicando que WeatherBench2 es un benchmark y no un modelo preentrenado único.
- El baseline incluido se entrena por defecto con datos sintéticos que reducen pasos temporales y tamaño de rejilla; sus resultados no son representativos del rendimiento en datos reales de ERA5 o IFS.
- La salida de inferencia documentada tiene forma `[8,8,8,24,48]`, coherente con la configuración de muestra pequeña, no con una evaluación global completa.
- Licencia del repositorio Apache 2.0, pero los datos ERA5, IFS y los pronósticos de los sistemas participantes mantienen las licencias y condiciones de uso de sus proyectos de origen. Cualquier uso comercial debe verificar esas condiciones por separado.
- Idiomas soportados limitados al inglés en la documentación; no hay soporte multilingüe.
- No se han publicado resultados de benchmarks, métricas de referencia ni comparativas de rendimiento en la información disponible.
- Repositorio con 0 descargas y 0 likes, creado y actualizado el mismo día, sin pipeline declarado: no hay evidencia de uso en producción ni de mantenimiento continuado.
- Los resultados de la búsqueda web proporcionada no contienen información relevante sobre este repositorio: devolvieron exclusivamente páginas corporativas de Microsoft, por lo que no aportan datos verificables.
- Riesgo de sesgo: el benchmark se apoya en ERA5 como referencia, que arrastra los sesgos propios del sistema de reanálisis; las comparaciones deben interpretarse con esa cautela.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/OneScience-Group/WeatherBench2
- Artículo de WeatherBench 2: https://arxiv.org/abs/2308.15560
- Repositorio principal de OneScience en GitHub: https://github.com/onescience-ai/OneScience
- Repositorio de skills de OneScience en GitHub: https://github.com/onescience-ai/oneskills
- Repositorio principal de OneScience en Gitee: https://gitee.com/onescience-ai/onescience
- Repositorio de skills de OneScience en Gitee: https://gitee.com/onescience-ai/oneskills
- Mirror de paquetes de OneScience: http://mirrors.onescience.ai:3141/pypi/simple/

Las referencias de Microsoft devueltas por la búsqueda web no guardan relación con este repositorio y se han descartado.
