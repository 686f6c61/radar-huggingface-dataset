# JTF2000/ChorusTIC

## Resumen

ChorusTIC es un modelo fundacional para clasificación de series temporales multivariadas desarrollado por Juntao Fang (JTF2000). Su principal innovación es permitir la clasificación *in-context* sin necesidad de ajuste fino ni actualización de parámetros específicos de la tarea, lo que lo convierte en una solución *training-free* para este tipo de problemas. El modelo combina una concatenación de subcanales aleatorios consistente con episodios (Random Subchannel Slot Concatenation) con un codificador dual-axis compartido que modela simultáneamente las interacciones temporales y entre canales, mapeando configuraciones de canales variables a una representación de ancho fijo independiente del número original de canales.

El modelo se ha evaluado en los archivos completos UEA-30 y UCR-128, dos referencias estándar en clasificación de series temporales. Aunque el repositorio de HuggingFace es reciente (agosto de 2026) y cuenta con pocos metadatos, el paper asociado (arXiv:2608.24033) describe la metodología y los resultados. Su tamaño de repositorio es de 0.2 GB, lo que sugiere un modelo compacto, aunque no se especifican los parámetros totales. La licencia MIT permite uso comercial sin restricciones significativas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Codificador dual-axis compartido con concatenación de subcanales aleatorios (no se especifica el tipo de backbone, p. ej. transformer o CNN) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (trabaja con series temporales, no texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de series temporales, no lingüístico) |
| Licencia | MIT |
| Formato de pesos | no disponible (el repositorio tiene 0.2 GB, pero no se indica el formato) |

## Arquitectura y entrenamiento

ChorusTIC se basa en un codificador dual-axis que procesa por separado el eje temporal y el eje de canales de la serie multivariada. La técnica de Random Subchannel Slot Concatenation genera episodios consistentes donde se concatenan subconjuntos aleatorios de canales, lo que permite al modelo manejar configuraciones de canales variables y producir una representación de ancho fijo. Esta representación se utiliza para realizar clasificación *in-context*: dado un conjunto de consulta sin etiquetar y un conjunto de contexto etiquetado, el modelo predice las etiquetas sin modificar sus parámetros.

No se dispone de información detallada sobre el proceso de entrenamiento: número de tokens (o muestras), composición del dataset, uso de RLHF/DPO u otras técnicas. El paper menciona que es un modelo fundacional, pero no se especifican los datos de preentrenamiento ni el cómputo empleado. La evaluación se realiza en los archivos UEA-30 y UCR-128, que son conjuntos de clasificación de series temporales ampliamente utilizados.

## Capacidades

- Clasificación de series temporales multivariadas sin entrenamiento específico por tarea (*training-free*).
- Aprendizaje *in-context*: predice etiquetas para un conjunto de consulta a partir de un conjunto de contexto etiquetado, manteniendo los parámetros fijos.
- Manejo de configuraciones de canales variables: el modelo acepta series con distinto número de canales sin necesidad de reentrenamiento.
- Modelado conjunto de interacciones temporales y entre canales mediante el codificador dual-axis.
- Evaluado en los archivos completos UEA-30 y UCR-128, que cubren una amplia variedad de dominios (sensores, salud, actividad humana, etc.).
- No es un modelo de generación de texto ni de lenguaje; su salida son etiquetas de clase.

## Casos de uso

- Diagnóstico médico a partir de señales fisiológicas: clasificar electrocardiogramas (ECG) o electroencefalogramas (EEG) para detectar arritmias o anomalías, usando un conjunto de ejemplos etiquetados como contexto sin reentrenar el modelo.
- Monitorización industrial predictiva: clasificar vibraciones o lecturas de sensores en maquinaria para anticipar fallos, adaptándose a diferentes configuraciones de sensores en distintas plantas.
- Detección de actividad humana: clasificar datos de acelerómetros y giroscopios de wearables para reconocer actividades (caminar, correr, subir escaleras) con un modelo que no requiere ajuste por usuario.
- Análisis de series financieras: clasificar patrones de mercado (tendencias, volatilidad) a partir de múltiples indicadores económicos, aprovechando la capacidad de manejar canales heterogéneos.
- Clasificación de señales de tráfico o meteorológicas: procesar series de estaciones de medición con distinto número de sensores para categorizar condiciones (congestión, tormentas, etc.).
- Investigación académica en series temporales: servir como baseline *training-free* para comparar con métodos que requieren ajuste fino, especialmente en benchmarks como UEA y UCR.

## Benchmarks y rendimiento

No se han publicado resultados numéricos de benchmarks en la información disponible. El paper (arXiv:2608.24033) menciona la evaluación en los archivos UEA-30 y UCR-128, pero no se incluyen las métricas exactas (precisión, F1, etc.) en los resultados de búsqueda proporcionados. Se recomienda consultar el paper original para obtener los datos completos.

## Requisitos de hardware

- No se dispone de información sobre VRAM estimada, GPUs recomendadas ni latencia.
- El tamaño del repositorio es de 0.2 GB, lo que sugiere que el modelo es relativamente pequeño y podría ejecutarse en hardware de consumo, pero no hay datos confirmados.
- No se especifican opciones de despliegue (vLLM, llama.cpp, etc.). Dado que es un modelo de clasificación de series temporales, es probable que se use con frameworks de deep learning estándar (PyTorch, TensorFlow), pero no se confirma.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa con otros modelos de clasificación de series temporales (p. ej., TimesNet, PatchTST, TOTEM). No se conocen los parámetros, el rendimiento relativo ni las licencias de alternativas comparables en el contexto de este modelo. Se recomienda consultar el paper para posibles comparaciones con baselines.

## Limitaciones y advertencias

- No se dispone de información sobre sesgos conocidos ni riesgos de alucinación, al ser un modelo discriminativo (clasificación) y no generativo.
- La falta de metadatos en el repositorio de HuggingFace (idiomas, formato de pesos, cuantizaciones) dificulta su integración directa en pipelines existentes.
- Al ser un modelo *training-free*, su rendimiento depende de la calidad y representatividad del conjunto de contexto proporcionado en cada tarea.
- La licencia MIT permite uso comercial, pero se debe verificar la procedencia de los datos de entrenamiento si se utiliza en aplicaciones sensibles.
- No se especifica si el modelo soporta series de longitud variable o si requiere una longitud fija; esto debe consultarse en el paper.

## Enlaces

- HuggingFace: https://huggingface.co/JTF2000/ChorusTIC
- Paper arXiv: https://arxiv.org/abs/2608.24033
- Artículo en learnijoy.com: https://learnijoy.com/newscenter/104197-chorustic-enables-training-free-time-series-classification-w
- Artículo en aimodels.fyi: https://www.aimodels.fyi/papers/arxiv/chorustic-training-free-multivariate-time-series-classification
