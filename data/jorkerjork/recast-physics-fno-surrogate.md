# jorkerjork/recast-physics-fno-surrogate

## Resumen

El modelo `recast-physics-fno-surrogate` es un Fourier Neural Operator (FNO) desarrollado por el usuario jorkerjork como parte del proyecto recast-physics. Su objetivo es aproximar el solver de tensiones elásticas de dislocación de tipo Okada, que calcula el campo de tensiones generado por una falla a partir de su distribución de deslizamiento. En lugar de aprender un mapeo vector-a-vector sobre una malla fija, el FNO aprende un mapeo función-a-función: de la distribución de deslizamiento (una función sobre el espacio) al campo de tensiones circundante (otra función sobre el espacio).

El modelo se encuentra en estado de investigación y exploración, no listo para producción. Fue entrenado durante 20.000 pasos con pares sintéticos de deslizamiento y tensión generados sobre la marcha a partir del mismo solver de forma cerrada, aplicando una máscara de exclusión en la zona cercana a la ruptura para evitar la singularidad numérica del objetivo. Los resultados en casos de prueba no vistos muestran un error relativo medio L2 del 56,8% y un acuerdo de signo del Delta CFF del 73,3%, lo que indica un progreso real pero insuficiente frente al solver exacto.

La relevancia de este modelo radica en explorar el uso de FNOs como sustitutos rápidos de solvers numéricos en geofísica computacional. En el modo de cálculo de todo el grid a la vez (16x16x8 vóxeles en una sola pasada), el FNO es aproximadamente 5,2 veces más rápido que el solver de forma cerrada. Sin embargo, en consultas de un solo punto (el patrón que usa la featurización Delta CFF del proyecto), el FNO es unas 19 veces más lento, porque debe calcular todo el grid para leer un único valor. Por ello, no se utiliza en los pronósticos de producción, que siguen usando el solver exacto por defecto.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Fourier Neural Operator (FNO) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de física, no de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica |
| Licencia | no disponible |
| Formato de pesos | no disponible (repo de 0,2 GB) |

## Arquitectura y entrenamiento

El modelo es un Fourier Neural Operator, una arquitectura diseñada para aprender operadores entre espacios de funciones. En este caso, mapea la distribución de deslizamiento de una falla al campo de tensiones elásticas circundante, utilizando transformadas de Fourier dentro de la red para capturar dependencias espaciales de forma eficiente. El entrenamiento se realizó durante 20.000 pasos con pares sintéticos generados sobre la marcha a partir del solver de forma cerrada de Okada, lo que permite un suministro infinito de datos de entrenamiento sin necesidad de un dataset fijo.

Una innovación técnica destacable es el uso de una máscara de exclusión en la zona cercana a la ruptura, ya que el objetivo de forma cerrada presenta una singularidad numérica muy próxima a la falla, que no es un objetivo real aprendible. Esta máscara evita que el modelo intente aproximar una singularidad y permite que se centre en las regiones donde el campo de tensiones es físicamente significativo. No se menciona el uso de RLHF, DPO ni otras técnicas de alineación, ya que no es un modelo de lenguaje.

## Capacidades

- Aproximación de campos de tensiones elásticas: el modelo predice el campo de tensiones completo alrededor de una falla a partir de su distribución de deslizamiento.
- Mapeo función-a-función: a diferencia de los modelos de malla fija, el FNO opera sobre funciones continuas, lo que permite superresolución de cero disparos (capacidad de evaluar en resoluciones más finas sin reentrenar).
- Cálculo de Delta CFF: puede estimar el cambio en el criterio de Coulomb (Delta CFF) y su signo, que indica si una zona se acerca o se aleja de la rotura.
- Procesamiento por lotes de grids completos: en una sola pasada puede calcular un grid de 16x16x8 vóxeles, siendo más rápido que el solver exacto en este modo.
- No tiene capacidades de lenguaje, tool calling, agentes, visión ni audio.

## Casos de uso

- Aceleración de simulaciones de campo completo: cuando se necesita el campo de tensiones en todo un volumen (por ejemplo, para visualizar la distribución de tensiones tras un terremoto), el FNO puede ser unas 5 veces más rápido que el solver exacto, útil para estudios paramétricos o exploración rápida de escenarios.
- Análisis de riesgo sísmico en tiempo real: en situaciones donde se requiere evaluar rápidamente múltiples escenarios de deslizamiento (por ejemplo, durante una secuencia sísmica), el FNO podría proporcionar estimaciones aproximadas del campo de tensiones para priorizar análisis detallados con el solver exacto.
- Comparación de modelos en dashboards de investigación: el proyecto recast-physics incluye una variante de modelo etiquetada como investigación/exploración que permite comparar visualmente las predicciones del FNO con las del solver exacto, útil para entender las limitaciones de los sustitutos neuronales.
- Generación de datos sintéticos para otros modelos: el FNO podría usarse para generar rápidamente campos de tensiones aproximados que sirvan como aumentación de datos para entrenar otros modelos de aprendizaje automático en geofísica.
- Exploración de superresolución: gracias a la naturaleza función-a-función del FNO, se podría evaluar el campo de tensiones en resoluciones más finas que las del entrenamiento, lo que podría ser útil para refinar mallas en zonas de interés.
- Prototipado de sistemas de alerta temprana: aunque no está listo para producción, el FNO podría servir como base para desarrollar un sistema de alerta que estime rápidamente el impacto de una ruptura en las fallas vecinas, siempre que se valide cuidadosamente su precisión.

## Benchmarks y rendimiento

Se han publicado resultados reales sobre 20 casos de prueba sintéticos no vistos durante el entrenamiento:

| Metrica | Valor |
|---|---|
| Error relativo medio L2 de tension | 56,8% |
| Acuerdo de signo Delta CFF | 73,3% |
| Acuerdo de signo Delta CFF a 1.000 pasos de entrenamiento | ~50% (aleatorio) |
| Velocidad en grid completo (16x16x8) vs solver exacto | ~5,2x más rápido |
| Velocidad en consulta de un solo punto vs solver exacto | ~19x más lento |

No se han publicado comparaciones con otros modelos sustitutos en la información disponible.

## Requisitos de hardware

No se dispone de información detallada sobre requisitos de hardware. El tamaño del repositorio es de 0,2 GB, lo que sugiere un modelo relativamente pequeño que podría ejecutarse en una GPU de consumo o incluso en CPU, pero no se han proporcionado datos concretos de VRAM, latencia ni throughput. Se recomienda consultar el repositorio del proyecto para obtener más detalles.

## Comparativa con modelos similares

No se han publicado comparativas con otros modelos sustitutos de solvers de tensiones elásticas en la información disponible. El proyecto recast-physics incluye el solver exacto de forma cerrada como referencia, pero no se comparan otros FNOs o redes neuronales para esta tarea específica.

## Limitaciones y advertencias

- No está listo para producción: el propio autor lo etiqueta como research/exploratory.
- Error relativo medio L2 alto (56,8%): las predicciones del campo de tensiones se desvían significativamente del solver exacto.
- Acuerdo de signo Delta CFF limitado (73,3%): aunque mejora el azar, un 26,7% de las predicciones sobre si una zona se acerca o se aleja de la rotura son incorrectas, lo que podría llevar a conclusiones erróneas en análisis de riesgo.
- Singularidad en campo cercano: el modelo no puede predecir correctamente las tensiones muy cerca de la ruptura debido a la singularidad numérica del objetivo, y se aplica una máscara de exclusión.
- Rendimiento pobre en consultas puntuales: si se necesita el valor de tensión en un solo punto, el FNO es mucho más lento que el solver analítico directo, por lo que no es adecuado para ese patrón de uso.
- No se utiliza en producción: los pronósticos de recast-physics usan el solver exacto por defecto; este checkpoint solo alimenta una variante de investigación y un dashboard comparativo.
- Licencia no especificada: no se indica la licencia del modelo, por lo que se debe contactar con el autor antes de cualquier uso comercial.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jorkerjork/recast-physics-fno-surrogate
- Proyecto recast-physics (modelo de pronóstico sísmico): https://huggingface.co/jorkerjork/recast-physics-eq-forecast
- Documentación de Fourier Neural Operators (referencia general): https://neuraloperator.github.io/dev/theory_guide/fno.html
- Artículo sobre surrogate modelling con FNOs (referencia general): https://arxiv.org/abs/2311.05967
