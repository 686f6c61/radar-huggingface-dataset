# OneScience-Group/GraphCast

## Resumen

GraphCast es un modelo global de predicción meteorológica a medio plazo desarrollado originalmente por Google DeepMind, cuya arquitectura se basa en redes neuronales de grafos (GNN). Este repositorio, publicado por OneScience-Group, ofrece una implementación práctica del modelo con scripts de entrenamiento, ajuste fino e inferencia, además de pesos preentrenados sobre el reanálisis atmosférico ERA5 (1979-2017) del ECMWF. El modelo resuelve el problema de la predicción meteorológica automatizada con un enfoque de aprendizaje profundo, superando en precisión a los métodos numéricos tradicionales en horizontes de hasta 10 días, tal como se describe en el artículo original publicado en *Science*.

La relevancia actual de GraphCast radica en su capacidad para generar pronósticos globales de alta resolución (0.25°) con un coste computacional reducido en comparación con los modelos físicos, y su integración en flujos de investigación y operativos. Esta implementación de OneScience facilita la reproducción de los resultados, el entrenamiento multi-GPU y la adaptación a entornos con aceleradores DCU, lo que la hace accesible para la comunidad científica y de desarrollo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal de grafos (GNN) con codificador, procesador y decodificador |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de prediccion meteorologica, no de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, zh (para documentacion y scripts, no para procesamiento de lenguaje) |
| Licencia | Apache 2.0 (codigo); pesos solo para uso no comercial |
| Formato de pesos | PyTorch (.pth) |

## Arquitectura y entrenamiento

GraphCast se basa en una red neuronal de grafos (GNN) que opera sobre una malla global de alta resolución. La arquitectura consta de tres componentes principales: un codificador que mapea las variables meteorológicas de entrada a un grafo de múltiples escalas, un procesador que realiza iteraciones de mensajes entre nodos para propagar información espacial y temporal, y un decodificador que produce las predicciones en la malla original. El modelo se entrena de forma autorregresiva, prediciendo el estado atmosférico a 6 horas y usando esa salida como entrada para el siguiente paso, hasta alcanzar horizontes de 10 días.

El entrenamiento se realiza sobre el conjunto de datos ERA5 del ECMWF, que cubre el periodo 1979-2017, con una resolución espacial de 0.25 grados. El repositorio de OneScience proporciona los scripts necesarios para generar los archivos auxiliares (`data.json` y `time_diff_std.npy`), así como para lanzar el entrenamiento en una o varias GPUs mediante `torchrun`. El ajuste fino se soporta a partir de los pesos preentrenados, y la inferencia produce salidas en formato de mapas de error y visualizaciones.

## Capacidades

- Predicción meteorológica global a medio plazo (hasta 10 días) con resolución de 0.25 grados.
- Generación de pronósticos de variables atmosféricas como temperatura, presión, humedad y viento en múltiples niveles de presión.
- Entrenamiento y ajuste fino sobre datos ERA5, con soporte para multi-GPU y aceleradores DCU.
- Inferencia autorregresiva con paso temporal de 6 horas.
- Evaluación cuantitativa mediante RMSE y ACC, y generación de gráficas comparativas de pronósticos.
- Capacidad de ejecución en CPU para pruebas de conectividad a pequeña escala, aunque el entrenamiento completo requiere GPU o DCU.

## Casos de uso

- Investigación en predicción meteorológica: el modelo permite reproducir y extender los experimentos de GraphCast, facilitando el estudio de la dinámica atmosférica a medio plazo con un enfoque de aprendizaje profundo.
- Validación local rápida: con datos sintéticos o un subconjunto de ERA5, se puede verificar la carga de datos, la generación de archivos auxiliares y el flujo completo de entrenamiento e inferencia en una máquina de desarrollo.
- Integración en pipelines de predicción operativa: la inferencia puede ejecutarse de forma periódica para generar pronósticos globales que alimenten sistemas de alerta temprana o servicios climáticos.
- Entrenamiento multi-GPU en clústeres: mediante `torchrun` se puede escalar el entrenamiento a 8 o más GPUs, reduciendo el tiempo de experimentación en entornos de investigación.
- Adaptación a hardware alternativo: el soporte para DCU (aceleradores chinos) permite ejecutar el modelo en infraestructuras sin GPUs NVIDIA, ampliando su accesibilidad.
- Educación y formación: los scripts comentados y la estructura modular del repositorio sirven como material didáctico para enseñar arquitecturas GNN aplicadas a ciencias de la Tierra.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El artículo original de GraphCast (arXiv:2212.12794) reporta mejoras significativas frente a los modelos numéricos operativos, pero esos datos no se incluyen en esta ficha para evitar inventar cifras.

## Requisitos de hardware

- Se recomienda una GPU o DCU para entrenamiento e inferencia completos.
- La CPU puede utilizarse para importar el modelo y realizar verificaciones de conectividad a pequeña escala, pero el entrenamiento y la inferencia serán muy lentos.
- Para DCU, se requiere instalar DTK 25.04.2 o superior.
- El entrenamiento multi-GPU se soporta mediante `torchrun` (ejemplo con 8 procesos).
- No se especifican requisitos de VRAM en la documentación proporcionada.
- Opciones de despliegue: scripts locales de Python (train.py, inference.py), sin soporte explícito para vLLM, llama.cpp u otros servidores de inferencia.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. GraphCast se posiciona como un modelo de predicción meteorológica basado en GNN, y su principal referencia es el artículo original de DeepMind, pero no se incluyen comparativas cuantitativas con otras implementaciones en este repositorio.

## Limitaciones y advertencias

- Los pesos preentrenados están restringidos a uso no comercial, aunque el código se distribuye bajo Apache 2.0.
- El modelo está entrenado con datos ERA5 (1979-2017), por lo que su rendimiento en condiciones climáticas extremas o escenarios fuera de ese rango puede degradarse.
- La resolución de 0.25 grados limita la capacidad de capturar fenómenos de mesoescala (tormentas locales, etc.).
- La inferencia autorregresiva acumula errores en horizontes largos; se recomienda evaluar la incertidumbre en pronósticos más allá de 7 días.
- El repositorio actual no incluye los pesos preentrenados (se indica que se subirán próximamente), por lo que el entrenamiento desde cero requiere recursos computacionales significativos.
- No se proporcionan métricas de latencia ni throughput, por lo que el rendimiento en producción debe medirse empíricamente.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/OneScience-Group/GraphCast
- Paper original: https://arxiv.org/abs/2212.12794
- Repositorio OneScience en GitHub: https://github.com/onescience-ai/OneScience
- Repositorio OneScience en Gitee: https://gitee.com/onescience-ai/onescience
- Repositorio de skills en GitHub: https://github.com/onescience-ai/oneskills
- Repositorio de skills en Gitee: https://gitee.com/onescience-ai/oneskills
