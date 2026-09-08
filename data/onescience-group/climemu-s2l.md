# OneScience-Group/ClimEmu-S2L

## Resumen

ClimEmu-S2L es un modelo de regresión espacial desarrollado por OneScience-Group para predecir patrones globales de cambio climático a largo plazo a partir de respuestas de temperatura superficial de corto plazo. Reproduce el método descrito en el artículo "Predicting global patterns of long-term climate change from short-term simulations using machine learning" (DOI: 10.1038/s41612-020-00148-5), cuyos autores incluyen a equipos de Imperial College London, la Universidad de Reading, la Universidad de East Anglia, la Universidad de Warwick y la Universidad Técnica de Creta. El problema que resuelve es la reducción del coste computacional de simulaciones climáticas multi-escenario: en lugar de ejecutar simulaciones completas de más de 70 años, el modelo estima el patrón espacial a largo plazo usando solo los primeros 10 años de respuesta térmica.

El modelo no es una red neuronal ni un modelo de lenguaje; se compone de dos algoritmos de regresión: regresión Ridge y regresión por proceso gaussiano (GPR) con kernel compartido no-ARD. Opera sobre una rejilla espacial global de 145×192 puntos, trabajando con anomalías de temperatura superficial en grados Celsius. El repositorio no incluye pesos oficiales del artículo; el checkpoint disponible es un artefacto de ingeniería generado con datos sintéticos para validar el flujo de trabajo, no los parámetros formales del paper.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Regresión Ridge y regresión por proceso gaussiano (GPR) con kernel compartido no-ARD |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de regresión espacial, no de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | inglés (documentación) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | no disponible (checkpoint de ingeniería en formato PyTorch .pt, sin pesos oficiales) |

## Arquitectura y entrenamiento

ClimEmu-S2L implementa dos modelos de regresión que operan sobre campos espaciales de temperatura superficial. El modelo Ridge selecciona el parámetro de regularización mediante validación cruzada interna de 3 pliegues. El modelo GPR optimiza un kernel compartido no-ARD, reduciendo la complejidad del ajuste frente a kernels con parámetros independientes por dimensión. El entrenamiento se realiza sobre 21 escenarios de forzamiento climático, empleando una estrategia leave-one-scenario-out (LOSO): cada escenario se retiene como validación mientras los otros 20 se usan para entrenar. Las entradas son las medias de las anomalías de temperatura durante los primeros 10 años de cada escenario, y los objetivos son las medias a largo plazo después del año 70.

Los datos de entrenamiento incluidos en el repositorio son sintéticos y replican la estructura del problema original: 21 escenarios de anomalías de temperatura superficial de un solo canal en la rejilla completa de 145×192 grados, con las mismas ventanas temporales. Sin embargo, estos datos no representan la distribución oficial de HadGEM3 ni la escala de entrenamiento del artículo. El paper original utiliza 21 escenarios de forzamiento de los proyectos PDRMIP, ECLIPSE y Kasoar. No se aplica RLHF ni DPO, ya que no es un modelo generativo. La innovación principal es la aplicación de técnicas de regresión para emular respuestas climáticas de largo plazo, reduciendo así el coste de simulaciones multi-escenario.

## Capacidades

- Predicción de patrones espaciales de temperatura a largo plazo (después del año 70) a partir de los primeros 10 años de respuesta térmica.
- Evaluación global y regional de la respuesta climática mediante RMSE ponderado por área, error absoluto medio global y error absoluto medio regional.
- Regresión Ridge con selección automática de regularización mediante validación cruzada interna.
- Regresión GPR con kernel compartido no-ARD, optimizado sobre los 21 folds LOSO.
- Entrenamiento distribuido multi-GPU con `torchrun`, distribuyendo los 21 folds entre 8 procesos.
- Ejecución integral en entornos OneCode y ModelScope, incluyendo entrenamiento, inferencia, evaluación y visualización.
- No soporta generación de texto, tool calling, visión, audio ni razonamiento multi-step.

## Casos de uso

- Predicción de respuesta climática a largo plazo: a partir de las anomalías de temperatura de los primeros 10 años de un escenario de forzamiento, el modelo genera el patrón espacial esperado después del año 70. Esto permite reducir el coste de simulaciones climáticas completas en estudios multi-escenario.
- Análisis regional de vulnerabilidad climática: los errores absolutos medios regionales permiten identificar zonas geográficas con mayor incertidumbre en la predicción, útiles para estudios de impacto climático a escala regional.
- Validación de métodos de regresión en ciencia climática: comparar Ridge y GPR sobre los 21 escenarios LOSO ayuda a decidir qué algoritmo ofrece mejor generalización para un conjunto de forzamientos dado.
- Integración en pipelines de OneCode/ModelScope: el flujo de trabajo completo (entrenamiento, inferencia, evaluación y visualización) puede ejecutarse de forma automatizada en entornos online, facilitando la reproducibilidad de experimentos.
- Entrenamiento distribuido en clústeres: con `torchrun --nproc_per_node=8`, los 21 folds LOSO se distribuyen entre múltiples GPUs o DCUs, acelerando el ajuste de los modelos.
- Investigación en emulación climática: el modelo sirve como herramienta de apoyo para estudios de sensibilidad climática, permitiendo explorar múltiples escenarios sin ejecutar simulaciones de larga duración.
- Educación y formación en IA para ciencias de la Tierra: los datos sintéticos y los scripts del repositorio permiten demostrar el flujo completo de un proyecto de machine learning aplicado a clima.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio indica que los resultados obtenidos con los datos sintéticos solo validan el flujo de trabajo de ingeniería y no representan el rendimiento formal del artículo.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible.
- GPU recomendada: se recomienda una GPU o DCU; una CPU es suficiente para la validación de conectividad con la configuración pequeña por defecto.
- Usuarios de DCU: deben instalar DTK 25.04.2 o posterior, o la versión recomendada por OneScience para el clúster.
- Entrenamiento multi-GPU: se usa `torchrun` con 8 procesos por nodo.
- Despliegue: scripts locales, entorno OneCode y ModelScope. No aplica vLLM, llama.cpp, Ollama ni TGI, al no ser un modelo de lenguaje.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. No se han identificado modelos comparables en la información proporcionada.

## Limitaciones y advertencias

- El repositorio no incluye pesos oficiales bajo `weight/`; el checkpoint de ingeniería guardado en `result/checkpoints/climemu_s2l.pt` no contiene los parámetros formales del modelo descrito en el paper.
- Los datos de entrenamiento incluidos son sintéticos y no representan la distribución real de HadGEM3; los resultados obtenidos con ellos no son comparables con los del artículo original.
- No es un modelo de lenguaje: no soporta generación de texto, tool calling ni tareas de procesamiento de lenguaje natural.
- La licencia CC-BY-4.0 permite uso comercial con atribución, pero no ofrece garantías de rendimiento ni soporte técnico.
- El riesgo de alucinación no aplica, al ser un modelo de regresión determinista; sin embargo, la precisión de las predicciones depende críticamente de la calidad y representatividad de los datos de entrenamiento.
- Documentación disponible únicamente en inglés.

## Enlaces

- HuggingFace: https://huggingface.co/OneScience-Group/ClimEmu-S2L
- Artículo original: https://doi.org/10.1038/s41612-020-00148-5
- OneScience GitHub: https://github.com/onescience-ai/OneScience
- OneScience Gitee: https://gitee.com/onescience-ai/onescience
- OneSkills GitHub: https://github.com/onescience-ai/oneskills
- OneSkills Gitee: https://gitee.com/onescience-ai/oneskills
- Entorno OneCode: https://web-2069360198568017922-iaaj.ksai.scnet.cn:58043/home
