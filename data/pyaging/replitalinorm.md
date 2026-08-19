# pyaging/replitalinorm

## Resumen

`replitalinorm` es un modelo de reloj de envejecimiento (aging clock) basado en regresión elastic net, desarrollado por el equipo de pyaging como parte de la construcción del reloj RepliTali. Su función específica es estimar el offset de historia replicativa no observado en una línea de fibroblastos fetales de piel (AG06561), sirviendo como modelo de normalización previo al modelo final de 87 CpGs. El modelo opera sobre datos de metilación de ADN en células humanas cultivadas, y fue publicado en 2022 en el artículo de Endicott et al. en Nature Communications.

A diferencia de los modelos de lenguaje, este es un modelo estadístico clásico que predice la historia replicativa de células a partir de patrones de metilación. Su relevancia radica en su papel dentro del ecosistema pyaging, que permite a investigadores calcular relojes epigenéticos de forma estandarizada. No se trata de un modelo de propósito general, sino de una pieza específica en un pipeline de análisis biológico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Elastic net regression |
| Parametros totales | no disponible (no se indica el numero de CpGs del modelo de normalizacion) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (no procesa texto) |
| Tipos de cuantizacion | no aplica (modelo estadistico, no neuronal) |
| Idiomas soportados | no aplica |
| Licencia | BSD-3-Clause |
| Formato de pesos | no disponible (integrado en la libreria pyaging) |

## Arquitectura y entrenamiento

El modelo emplea una regresión elastic net, una técnica de regularización lineal que combina penalizaciones L1 y L2. Se entrena sobre datos de metilación de ADN (probablemente valores beta o M-values) de la línea celular de fibroblastos fetales AG06561, la más joven cronológicamente dentro del conjunto de datos usado para RepliTali. El objetivo es modelar el offset de historia replicativa pre-cultivo, es decir, cuántas divisiones celulares habían ocurrido antes de que la línea fuera establecida en cultivo. Este offset no es directamente observable, por lo que el modelo se entrena de forma indirecta para estimarlo y luego normalizar las predicciones del modelo final RepliTali.

No se han publicado detalles sobre el número exacto de características (CpGs) utilizadas en este modelo de normalización, ni sobre el tamaño del conjunto de entrenamiento. El artículo original (Endicott et al., 2022) describe el desarrollo de RepliTali, pero la información específica de `replitalinorm` es limitada en la model card.

## Capacidades

- Predicción de historia replicativa (número de divisiones celulares acumuladas) a partir de perfiles de metilación de ADN.
- Funciona exclusivamente con datos de metilación de fibroblastos humanos cultivados.
- Integración directa con la librería `pyaging` mediante la función `pya.pred.predict_age`.
- No soporta procesamiento de texto, visión ni otras modalidades.
- No dispone de capacidades de tool calling, agentes o razonamiento multi-paso.

## Casos de uso

- Investigación en biología del envejecimiento: estimar la historia replicativa de líneas de fibroblastos para estudiar la relación entre divisiones celulares y cambios epigenéticos.
- Normalización de datos en estudios de metilación: usar el modelo como paso previo para corregir el sesgo de historia replicativa antes de aplicar el reloj RepliTali completo.
- Validación de líneas celulares: comprobar si una línea de fibroblastos tiene una historia replicativa anómala que pueda afectar a experimentos posteriores.
- Análisis de datos de metilación en el contexto de la librería pyaging: los usuarios pueden ejecutar `replitalinorm` junto con otros relojes para obtener un panel de predicciones.
- Replicación de resultados del artículo de Endicott et al.: el modelo permite reproducir los análisis de normalización descritos en la publicación.
- Docencia e investigación metodológica: como ejemplo de aplicación de regresión elastic net a datos ómicos en el campo de los relojes epigenéticos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de rendimiento (como correlación o error absoluto medio) para este modelo de normalización. El artículo original podría contener validaciones, pero no se proporcionan en los datos suministrados.

## Requisitos de hardware

- Al ser un modelo de regresión lineal con regularización, no requiere GPU. Puede ejecutarse en cualquier CPU moderna.
- Memoria RAM: mínima, típicamente menos de 1 GB para almacenar los coeficientes y procesar matrices de metilación.
- No aplica cuantización ni despliegue en servidores de inferencia especializados.
- La integración con pyaging se realiza en Python, por lo que solo se necesita un entorno con esa librería instalada.
- Latencia: prácticamente instantánea para una muestra individual; el coste computacional es despreciable frente a otros modelos de aprendizaje profundo.

## Comparativa con modelos similares

Existen otros relojes epigenéticos como el reloj de Horvath (2013) o el de Hannum (2013), que también usan regresión sobre metilación de ADN para predecir edad cronológica. Sin embargo, `replitalinorm` predice historia replicativa, no edad cronológica, y está especializado en fibroblastos. No se dispone de datos comparativos cuantitativos en la información proporcionada.

| Modelo | Tipo de prediccion | Tecnica | Especie | Tejido | Licencia |
|---|---|---|---|---|---|
| replitalinorm | Historia replicativa | Elastic net | Humano | Fibroblastos | BSD-3-Clause |
| Reloj de Horvath | Edad cronologica | Regresion penalizada | Humano | Multiples tejidos | no disponible |
| Reloj de Hannum | Edad cronologica | Regresion penalizada | Humano | Sangre | no disponible |

## Limitaciones y advertencias

- Entrenado exclusivamente en una única línea celular (AG06561), por lo que su capacidad de generalización a otras líneas o tejidos es limitada.
- Es un modelo de normalización, no el reloj final RepliTali; usarlo directamente para predecir historia replicativa absoluta puede dar resultados sesgados.
- No se especifican los rangos de valores de metilación esperados ni las transformaciones de datos necesarias; los usuarios deben seguir las convenciones de pyaging.
- Licencia BSD-3-Clause permite uso comercial, pero se recomienda revisar los términos del artículo original para cualquier uso derivado.
- No hay información sobre sesgos o alucinaciones (no aplica a un modelo estadístico), pero sí riesgo de sobreajuste a la línea celular de entrenamiento.
- No se proporcionan métricas de rendimiento ni intervalos de confianza, lo que dificulta evaluar su precisión en aplicaciones reales.

## Enlaces

- HuggingFace: https://huggingface.co/pyaging/replitalinorm
- Artículo original: Endicott, J.L., Nolte, P.A., Shen, H. & Laird, P.W. Cell division drives DNA methylation loss in late-replicating domains in primary human cells. Nature Communications 13, 6659 (2022). DOI: https://doi.org/10.1038/s41467-022-34268-8
- Documentación de pyaging: https://pyaging.readthedocs.io
