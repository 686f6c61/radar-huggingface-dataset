# OneScience-Group/GCRM-ConvectionNN

# GCRM-ConvectionNN

## Resumen

GCRM-ConvectionNN es una red neuronal diseñada para la parametrización de convección atmosférica en modelos de circulación general de nubes resueltas (GCRM). El modelo, desarrollado por el equipo de OneScience-Group como reproducción independiente de un método propuesto por investigadores de Vulcan Inc., la Universidad de California Irvine, la Universidad de Columbia y la Universidad de Washington, aprende a predecir tendencias de calentamiento y humedecimiento convectivo a partir de columnas termodinámicas de 34 niveles. Además, permite diagnosticar inestabilidades propagantes mediante funciones de respuesta lineal y espectros de ondas de gravedad.

La relevancia de este modelo radica en el problema de la estabilidad de los esquemas de física basados en aprendizaje automático dentro de simulaciones climáticas. A diferencia de los modelos de lenguaje, su entrada es un vector numérico de 70 valores (perfiles termodinámicos, temperatura superficial del mar e insolación en el tope de la atmósfera) y su salida son 68 valores correspondientes a las tendencias de calentamiento (Q1) y humedecimiento (Q2) en los mismos 34 niveles. El repositorio actual contiene únicamente datos sintéticos para validar el flujo de trabajo de ingeniería; no se incluyen pesos preentrenados oficiales del artículo científico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal para parametrización de convección (arquitectura exacta no disponible) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de física atmosférica; entrada de 70 valores por columna) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (idioma de la documentación; el modelo procesa datos numéricos atmosféricos) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch (.pt) |

## Arquitectura y entrenamiento

El modelo se basa en una red neuronal que procesa perfiles termodinámicos de 34 niveles. Cada muestra de entrada contiene 70 valores: 34 niveles de agua total, 34 niveles de energía estática líquido-hielo, temperatura superficial del mar e insolación en el tope de la atmósfera. La salida son 68 valores: tendencias de calentamiento y humedecimiento para los mismos 34 niveles, en intervalos de tres horas. El entrenamiento utiliza una función de pérdida MSE ponderada por masa y un regularizador de balance configurable de 20 miembros.

Los datos de entrenamiento originales proceden de simulaciones SAM de resolución de nubes casi globales y de simulaciones climáticas superparametrizadas SPCAM. Sin embargo, el repositorio de HuggingFace incluye únicamente muestras sintéticas generadas con el script `fake_data.py`, destinadas a validar el código y no a reproducir el rendimiento del paper. No se distribuyen pesos preentrenados bajo el directorio `weight/`; el checkpoint de ingeniería generado a partir de datos sintéticos no es un checkpoint oficial del artículo. La innovación técnica destacable es el diagnóstico de estabilidad mediante diferenciación automática para calcular funciones de respuesta lineal, ablaciones de entrada superior y espectros de ondas de gravedad, lo que permite detectar modos propagantes peligrosos en el esquema de parametrización.

## Capacidades

- Predicción de tendencias convectivas de calentamiento (Q1) y humedecimiento (Q2) en columnas atmosféricas de 34 niveles.
- Diagnóstico de estabilidad mediante funciones de respuesta lineal calculadas con diferenciación automática.
- Análisis de espectros de ondas de gravedad bidimensionales para identificar modos inestables.
- Validación de entrenamiento distribuido multi-GPU mediante `torchrun` con comprobación de puntos de control.
- Ejecución en entornos ModelScope y OneCode para validar datos, entrenamiento, inferencia, métricas espectrales y visualización.
- Soporte de evaluaciones con configuración completa y con ablación de entrada superior (upper-input ablation).

Nota: este modelo no es un modelo de lenguaje. No tiene capacidades de generación de texto, tool calling, agentes, visión ni audio.

## Casos de uso

- Parametrización de convección en GCRM: el modelo predice tendencias de calentamiento y humedecimiento a partir de columnas termodinámicas de 34 niveles, lo que permite sustituir esquemas de convección empíricos por un componente de aprendizaje automático en modelos de circulación general.
- Diagnóstico de estabilidad de esquemas de física ML: mediante funciones de respuesta lineal, el modelo puede detectar modos de propagación peligrosos que provocan inestabilidad numérica en simulaciones climáticas acopladas.
- Estabilización de parametrizaciones basadas en ML: los resultados del diagnóstico (crecimiento máximo, velocidad máxima de propagación) permiten ajustar o regularizar el esquema antes de su despliegue en producción.
- Investigación en ciencias atmosféricas: análisis de espectros de ondas de gravedad y comparación de perfiles Q1/Q2 predichos frente a objetivos, útil para estudiar la interacción entre convección y circulación de gran escala.
- Entrenamiento distribuido en entornos HPC: el repositorio incluye scripts para entrenamiento con `torchrun` en 8 procesos por nodo, útil para validar infraestructura de cómputo de alto rendimiento.
- Validación de plataformas AI4S: ejecución del flujo completo (datos, entrenamiento, inferencia, evaluación y visualización) en entornos OneCode o ModelScope para verificar la reproducibilidad del pipeline científico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Los datos sintéticos incluidos en el repositorio no representan la distribución oficial ni el rendimiento formal del paper. La evaluación local calcula MSE ponderado por masa, recuento de modos propagantes peligrosos, crecimiento máximo y velocidad máxima de propagación, pero estos valores corresponden únicamente a datos sintéticos y no deben interpretarse como métricas de rendimiento científico.

## Requisitos de hardware

- Se recomienda una GPU o DCU para el entrenamiento y la inferencia completos.
- Una CPU puede utilizarse para la validación de conectividad con la configuración predeterminada de muestras pequeñas.
- En sistemas DCU es necesario instalar DTK 25.04.2 o posterior, o la versión recomendada por OneScience para el clúster correspondiente.
- El entrenamiento multi-GPU se ha validado con `torchrun --nproc_per_node=8 --nnodes=1`.
- No se especifican los requisitos exactos de VRAM ni las GPUs concretas (A100, H100, RTX 4090, etc.).
- Opciones de despliegue: scripts Python nativos (`train.py`, `inference.py`, `result.py`), entorno OneCode y entorno ModelScope.

## Comparativa con modelos similares

No disponible. No se han encontrado modelos comparables de la misma categoría (parametrización de convección con diagnóstico de estabilidad) en la información proporcionada. Este modelo es específico para ciencias de la Tierra y no es comparable con modelos de lenguaje de propósito general.

## Limitaciones y advertencias

- El repositorio contiene únicamente datos sintéticos; no representan la distribución oficial de datos ni el rendimiento del artículo científico.
- No se incluyen pesos preentrenados oficiales. El checkpoint de ingeniería generado con datos sintéticos no debe utilizarse como modelo entrenado para investigación climática.
- La evaluación no incluye predicción multi-step ni métricas por lead time o por clase, ya que no es una tarea de predicción secuencial ni de clasificación.
- El modelo no es un modelo de lenguaje: no genera texto, no mantiene conversaciones y no soporta tool calling ni agentes.
- La licencia Apache 2.0 se aplica al repositorio, pero el uso de código, pesos y datos de proyectos originales está sujeto a las licencias y términos de sus respectivos proyectos.
- Los resultados fuera de la distribución de datos de entrenamiento pueden ser poco fiables; no se han documentado estudios de sesgos específicos para este tipo de modelo físico.

## Enlaces

- HuggingFace: https://huggingface.co/OneScience-Group/GCRM-ConvectionNN
- Paper: Interpreting and Stabilizing Machine-Learning Parametrizations of Convection — https://doi.org/10.1175/JAS-D-20-0082.1
- OneCode: https://web-2069360198568017922-iaaj.ksai.scnet.cn:58043/home
- GitHub OneScience: https://github.com/onescience-ai/OneScience
- Gitee OneScience: https://gitee.com/onescience-ai/onescience
- GitHub OneSkills: https://github.com/onescience-ai/oneskills
- Gitee OneSkills: https://gitee.com/onescience-ai/oneskills
