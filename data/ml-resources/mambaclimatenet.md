# ml-resources/MambaClimateNet

## Resumen

MambaClimateNet es una red neuronal para predicción de series temporales climáticas multivariantes construida sobre modelos de espacio de estados selectivos (SSM), concretamente sobre bloques Mamba. Sustituye el mecanismo de autoatención por recurrencia lineal, lo que reduce la complejidad computacional de cuadrática a lineal respecto a la longitud de la secuencia y permite modelar retrospectivas largas con un coste de cómputo acotado. El repositorio analizado, ml-resources/MambaClimateNet, es un espejo (mirror) del modelo original publicado en ModelScope por el autor ZHangang1, no un lanzamiento oficial, y su model card está redactada íntegramente en chino.

La ficha describe cuatro etapas de procesamiento: un embedding variado invertido que trata cada variable climática como un token semántico independiente, un preprocesado convolucional (Conv1d) que extrae dependencias locales, un módulo de fusión SSM bidireccional con dos bloques Mamba paralelos (barrido directo e inverso) y un proyector lineal de decodificación con normalización reversible de instancia (RevIN) para mitigar el desplazamiento de distribución. El modelo se evalúa sobre dos conjuntos de datos derivados de Kaggle: uno diario de China (2020-2023, 8 variables) y otro horario multi-sitio global (10 variables).

Su relevancia actual es limitada como artefacto listo para usar: el repositorio declara 0 descargas, 0 likes, no contiene pesos (tamaño de 0.0 GB) y no declara licencia. Su interés es fundamentalmente metodológico, como referencia de arquitectura híbrida Mamba más proyección lineal para forecasting climático, categoría que compite con aproximaciones basadas en Transformer y en modelos puramente lineales. No se han publicado resultados de benchmarks, recuento de parámetros, ventana de entrada ni horizonte de predicción en la documentación disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | SSM selectivo (Mamba) bidireccional con embedding variado invertido, preprocesado Conv1d y proyector lineal de decodificación |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (no se documentan la ventana de retrospectiva L ni el horizonte de predicción T) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible; la documentación está en chino (zh). El modelo no procesa lenguaje natural |
| Licencia | unknown (no declarada en la fuente original; todos los derechos reservados a los autores originales) |
| Formato de pesos | no disponible (el repositorio no contiene pesos; tamaño de 0.0 GB) |
| Tarea (pipeline) | time-series-forecasting multivariante y multi-paso |
| Variables de entrada | 8 variables (dataset diario de China) y 10 variables (dataset horario global) |
| Framework | PyTorch (2.1.0 en el entorno de referencia; 2.8.0+cu128 en dependencias) con mamba-ssm 2.2.6.post3 |
| Fecha de creación | 2026-10-15 (última actualización: 2026-10-15) |

## Arquitectura y entrenamiento

La arquitectura se organiza en cuatro fases. Primero, la capa de embedding variado invertido remodela la entrada $\mathbf{X} \in \mathbb{R}^{B \times L \times N}$ a $\mathbf{X}^{T} \in \mathbb{R}^{B \times N \times L}$, de modo que cada una de las N variables climáticas actúa como un token y su historia completa de longitud L se proyecta linealmente a la dimensión oculta $D_{model}$. Este planteamiento traslada el problema de dependencia temporal a un problema de modelado de acoplamiento entre variables. Segundo, un módulo de preprocesado basado en Conv1d extrae dependencias locales de corto alcance y aplica activaciones no lineales antes de entrar en el espacio de estados, lo que ayuda a representar señales de cambio brusco y a suavizar ruido de entrada.

Tercero, el núcleo del modelo es un módulo de fusión SSM bidireccional: dos bloques Mamba procesan en paralelo la secuencia directa y la secuencia invertida (flip), y sus salidas se combinan mediante suma elemento a elemento para construir una representación con contexto completo en ambos sentidos temporales. Cuarto, la decodificación no es autorregresiva: un proyector lineal mapea directamente la representación $\mathbb{R}^{B \times N \times D}$ al horizonte de salida $\mathbb{R}^{B \times N \times T}$, y se aplica RevIN para contrarrestar el desplazamiento de distribución típico de las series climáticas.

En cuanto a los datos, se emplean dos conjuntos de Kaggle. El conjunto diario de China cubre del 1 de enero de 2020 a diciembre de 2023 con 8 indicadores: temperatura máxima, mínima y media, velocidad máxima de viento, rachas máximas, precipitación y duración de insolación; su finalidad es evaluar tendencias de largo plazo y estacionalidad. El conjunto global horario agrupa registros de varias regiones (etiquetadas como Country 0 a Country 4) con 10 variables, entre ellas temperatura media, viento máximo, presión, precipitación, humedad relativa, nubosidad, sensación térmica e índice UV; su finalidad es evaluar muestreo de alta frecuencia y respuesta ante eventos súbitos. El preprocesado incluye interpolación lineal de valores ausentes, eliminación de valores atípicos mediante el criterio 3σ y estandarización Z-score. No se documentan el número de tokens de entrenamiento, la composición exacta del corpus, la función de pérdida, el optimizador, las épocas, ni si hubo RLHF o DPO (no aplicable en principio a este tipo de modelo): todo ello consta como no disponible.

## Capacidades

- Predicción de series temporales multivariantes multi-paso: genera un horizonte completo de estados futuros de forma no autorregresiva mediante proyección lineal.
- Modelado de dependencias de largo alcance con complejidad lineal respecto a la longitud de secuencia, gracias a los bloques SSM selectivos en lugar de autoatención.
- Captura bidireccional de dependencias temporales mediante dos barridos Mamba (directo e inverso) fusionados por suma.
- Respuesta ante cambios locales y eventos súbitos, gracias al preprocesado convolucional (Conv1d) previo al espacio de estados.
- Robustez frente al desplazamiento de distribución mediante RevIN en la decodificación.
- Adaptación a dos granularidades temporales distintas: resolución diaria (dataset de China) y resolución horaria/subhoraria (dataset global).
- Fusión de información entre variables climáticas heterogéneas mediante el embedding variado invertido.
- No dispone de soporte de tool calling ni de function calling.
- No dispone de capacidades de agente ni de razonamiento multi-paso en el sentido de los modelos de lenguaje.
- No dispone de capacidades multilingües: no es un modelo de lenguaje y no procesa texto.
- No dispone de capacidades de visión, audio ni de modo de razonamiento explícito (thinking mode).
- No se documentan capacidades de generación condicionada por prompts textuales, zero-shot forecasting ni fine-tuning con instrucciones.

## Casos de uso

- Predicción meteorológica operativa a corto y medio plazo: partiendo de una ventana histórica de variables de estación (temperatura, presión, humedad, viento), el modelo proyecta directamente el horizonte futuro en una única pasada, sin decodificación autorregresiva, lo que reduce la latencia frente a aproximaciones autoregresivas.
- Previsión de demanda energética: la temperatura, la humedad y la nubosidad son predictores directos de la carga eléctrica; el modelo puede alimentar un pipeline de previsión horaria que sirva como entrada a sistemas de despacho y planificación de generación.
- Gestión agrícola y planificación de riego: con las variables de precipitación, temperatura máxima/mínima y duración de insolación del conjunto diario, se pueden anticipar ventanas de estrés hídrico o de helada y ajustar calendarios de riego y siembra.
- Alertas de eventos extremos de viento: las variables de velocidad máxima y racha máxima permiten construir un sistema de alerta temprana para parques eólicos, grúas, puertos y operaciones aeroportuarias, donde los umbrales de viento condicionan la operativa.
- Planificación de mantenimiento de infraestructuras sensibles al clima: carreteras, redes de distribución eléctrica y ferrocarriles pueden usar la previsión multi-variable para priorizar inspecciones antes de episodios de viento, lluvia o hielo.
- Salud pública y exposición ambiental: la predicción conjunta de índice UV, temperatura y humedad sirve para emitir recomendaciones de exposición solar y para estimar carga asistencial por golpes de calor.
- Investigación en series temporales: como baseline reproducible de la familia Mamba para forecasting multivariante, útil para comparar con arquitecturas basadas en atención (iTransformer, PatchTST) y con modelos puramente lineales (DLinear) en los mismos conjuntos de datos.
- Predicción multi-sitio a escala global: el diseño variado invertido permite tratar cada localización y variable como token independiente, lo que facilita extender el modelo a despliegues con múltiples estaciones sin rediseñar la arquitectura.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas (MAE, MSE, RMSE ni métricas normalizadas tipo MASE) para ninguno de los dos conjuntos de datos descritos, ni comparaciones cuantitativas con otras arquitecturas.

## Requisitos de hardware

- Entorno de referencia declarado por el autor: 1 GPU NVIDIA RTX 3090 (24 GB de VRAM), 10 vCPU, 60 GB de memoria RAM y Ubuntu 22.04.
- VRAM estimada para inferencia: no disponible. Al no publicarse el número de parámetros ni las dimensiones $D_{model}$ y $L$, no es posible calcularla; el consumo escalará con el número de variables N y con la ventana de entrada L.
- GPU recomendadas: la única configuración validada explícitamente es una RTX 3090 de 24 GB; no se documentan despliegues en A100, H100 ni en GPUs de gama inferior.
- Viabilidad en GPU de consumo: el autor valida una RTX 3090, que es una GPU de consumo de gama alta. No hay información sobre funcionamiento en GPUs con menos de 24 GB, ni sobre ajuste en 8 o 12 GB.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a este tipo de modelo al no ser un modelo de lenguaje generativo. El despliegue previsto es la ejecución directa en PyTorch mediante el script `run.py` y el script de forecasting multivariante incluido en `scripts/multivariate_forecasting/`.
- Dependencias críticas: `mamba-ssm` 2.2.6.post3, que requiere CUDA y compilación de kernels específicos. `einops` para la manipulación de tensores y `transformers` 4.57.3 como interfaz de módulos.
- Latencia y throughput estimados: no disponible. Cualitativamente, el uso de SSM selectivos implica complejidad lineal en la longitud de secuencia, frente a la complejidad cuadrática de la autoatención, pero no se aportan mediciones.
- Ejecución en CPU: técnicamente posible en PyTorch, pero no se documenta ni se recomienda; el barrido selectivo de Mamba es sensible al hardware y suele requerir kernels de GPU para un rendimiento razonable.

## Comparativa con modelos similares

No se dispone de resultados de rendimiento de MambaClimateNet, por lo que la comparación es únicamente cualitativa y de categoría arquitectónica.

| Modelo | Categoría | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MambaClimateNet | SSM (Mamba) bidireccional con embedding variado invertido y RevIN | no disponible | no disponible | unknown (no declarada) | Espejo en HuggingFace sin pesos (0.0 GB) |
| iTransformer | Transformer con embedding invertido (atención entre variables) | no disponible | no disponible | no disponible | no disponible |
| PatchTST | Transformer basado en parches, canal independiente | no disponible | no disponible | no disponible | no disponible |
| DLinear | Modelo lineal (descomposición tendencia-estacionalidad) | no disponible | no disponible | no disponible | no disponible |

La diferencia arquitectónica principal frente a las alternativas basadas en Transformer es el uso de SSM selectivos en lugar de autoatención, lo que cambia el coste de cuadrático a lineal en la longitud de secuencia. Frente a DLinear, MambaClimateNet incorpora un mecanismo de mezcla entre variables explícito mediante el embedding invertido y el módulo SSM bidireccional, a costa de una complejidad de implementación y de dependencias mucho mayor.

## Limitaciones y advertencias

- Licencia sin declarar: la fuente original no especifica licencia, por lo que no puede asumirse ningún permiso de uso comercial. Todos los derechos quedan en manos de los autores originales.
- Es un espejo no oficial: el repositorio ml-resources/MambaClimateNet replica el modelo de ModelScope y no constituye un lanzamiento del autor; puede quedar desactualizado o eliminarse sin aviso.
- Ausencia de pesos: el tamaño del repositorio es de 0.0 GB, de modo que no se pueden ejecutar inferencias directamente desde HuggingFace sin obtener los pesos de la fuente original.
- Validación comunitaria nula: 0 descargas y 0 likes en el momento de la consulta, sin incidencias, discusiones ni evidencia independiente de reproducibilidad.
- Barrera idiomática: toda la documentación está en chino, lo que dificulta su adopción por parte de equipos hispanohablantes.
- Sesgo geográfico y temporal: los datos de entrenamiento provienen de un conjunto diario de China (2020-2023) y de un conjunto horario multi-sitio de Kaggle. La generalización a otras regiones, altitudes o regímenes climáticos no está documentada ni garantizada.
- Riesgo de predicción plausible pero incorrecta: aunque no es un modelo generativo de lenguaje, sus salidas pueden resultar verosímiles y ser erróneas, especialmente ante regímenes no vistos en el entrenamiento. La validación con datos propios es imprescindible antes de cualquier uso operativo.
- Eliminación de valores atípicos mediante 3σ: este preprocesado puede infraestimar precisamente los eventos extremos, que son los de mayor interés operativo en meteorología y en gestión de riesgos.
- Ventana de entrada y horizonte no documentados: se desconoce el rango de longitudes de retrospectiva y de predicción para el que el modelo está calibrado, así como su comportamiento fuera de ese rango.
- Ausencia de benchmarks: no hay métricas publicadas, ni comparaciones con baselines, ni resultados de ablación, por lo que no puede evaluarse su calidad relativa.
- Dependencia frágil de `mamba-ssm`: requiere CUDA y compilación de kernels, lo que complica la reproducibilidad del entorno y la portabilidad entre versiones de PyTorch y de drivers.
- Acoplamiento al preprocesado: el uso de RevIN y de la estandarización Z-score implica que las métricas y el comportamiento del modelo dependen de la normalización aplicada; desviarse de ese pipeline puede degradar las predicciones.
- Sin soporte de cuantización documentado: no se indican formatos GGUF, AWQ, GPTQ ni equivalentes, lo que limita las opciones de despliegue en hardware restringido.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ml-resources/MambaClimateNet
- Fuente original en ModelScope (ZHangang1/MambaClimateNet): https://www.modelscope.cn/models/ZHangang1/MambaClimateNet
- Dataset diario de China (Kaggle): https://www.kaggle.com/datasets/shivamshinde1904/weather-data2000-2023?select=China_weather_data.csv
- Dataset global horario (Kaggle): https://www.kaggle.com/datasets/nelgiriyewithana/global-weather-repository/data
- Librería `mamba-ssm` (dependencia principal): https://github.com/state-spaces/mamba
- Paper, blog o repositorio oficial del modelo: no disponible. La búsqueda web realizada no devolvió resultados relevantes sobre este modelo.
