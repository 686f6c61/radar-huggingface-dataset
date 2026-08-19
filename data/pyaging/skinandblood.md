# pyaging/skinandblood

## Resumen

El modelo `skinandblood` es un reloj epigenético de edad cronológica desarrollado por el grupo de Steve Horvath en 2018, publicado en la revista *Aging*. Se trata de un modelo de regresión elastic net que utiliza los niveles de metilación de ADN en 391 sitios CpG específicos para estimar la edad biológica de una persona. A diferencia de otros relojes epigenéticos que se limitan a un solo tejido, este modelo fue entrenado con datos procedentes de múltiples tejidos humanos: células bucales, sangre total, epitelio, fibroblastos cultivados, piel y sangre de cordón umbilical. Esto le confiere una mayor versatilidad y una precisión particularmente alta en muestras derivadas de piel y en células cultivadas *ex vivo*.

El modelo está disponible a través de la librería `pyaging`, que integra numerosos relojes de envejecimiento en un ecosistema unificado para análisis de metilación de ADN en Python. Su relevancia actual radica en que los relojes epigenéticos se han convertido en una herramienta estándar en la investigación del envejecimiento, la medicina de precisión y los estudios de intervenciones anti-envejecimiento, donde la capacidad de estimar la edad biológica a partir de tejidos fácilmente accesibles como la sangre o la piel es fundamental. Al ser un modelo de regresión lineal regularizada, su ejecución es extremadamente ligera y no requiere hardware especializado, lo que facilita su integración en pipelines bioinformáticos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Regresion elastic net (regularizacion L1 + L2) |
| Parametros totales | 391 coeficientes CpG + intercepto (no disponible el numero exacto de parametros entrenables) |
| Parametros activos | No aplica (no es un modelo de mezcla de expertos) |
| Longitud de contexto | No aplica (modelo tabular, no secuencial) |
| Tipos de cuantizacion | No aplica (modelo de regresion, no red neuronal) |
| Idiomas soportados | No aplica (entrada: matriz de metilacion de ADN) |
| Licencia | BSD-3-Clause |
| Formato de pesos | No disponible (integrado en la libreria `pyaging`, probablemente como coeficientes en formato interno) |

## Arquitectura y entrenamiento

El modelo se basa en una regresión lineal con regularización *elastic net*, que combina las penalizaciones L1 (lasso) y L2 (ridge). Esta técnica es habitual en la construcción de relojes epigenéticos porque permite seleccionar un subconjunto reducido de sitios CpG altamente predictivos de la edad cronológica mientras se controla el sobreajuste. En este caso, el modelo final utiliza 391 CpG, un número considerablemente menor que los más de 450.000 sitios que se pueden medir con arrays de metilación estándar.

Los datos de entrenamiento incluyen muestras de seis tipos de tejido humano: células bucales, sangre total, epitelio, fibroblastos cultivados, piel y sangre de cordón umbilical. El modelo fue optimizado específicamente para ser preciso en muestras de piel y en células cultivadas, lo que lo diferencia de otros relojes como el Horvath 2013 (pan-tejido) o el Hannum 2013 (sangre). El entrenamiento se realizó con datos de metilación de ADN obtenidos mediante microarrays (Illumina 450K o similar, aunque no se especifica en la información disponible). No se menciona el uso de técnicas de RLHF, DPO u otras propias de modelos de lenguaje; se trata de un modelo supervisado clásico.

## Capacidades

- Predicción de edad cronológica en humanos a partir de datos de metilación de ADN.
- Soporte multi-tejido: válido para células bucales, sangre total, epitelio, fibroblastos, piel y sangre de cordón.
- Especial precisión en muestras de piel y en células cultivadas *ex vivo*.
- Integración con la librería `pyaging` mediante una llamada simple: `pya.pred.predict_age(adata, ["skinandblood"])`.
- Compatible con objetos `AnnData` (estructura de datos estándar en bioinformática de célula única y epigenética).
- No requiere GPU ni recursos computacionales elevados; puede ejecutarse en CPU en segundos.
- No soporta generación de texto, código, visión ni otras capacidades de los modelos de lenguaje; es un modelo puramente predictivo y tabular.

## Casos de uso

- **Investigación del envejecimiento**: estimar la edad biológica de cohortes de individuos a partir de muestras de sangre o piel para estudiar la aceleración del envejecimiento en enfermedades como la progeria (síndrome de Hutchinson-Gilford), tal como se describe en el artículo original.
- **Estudios de intervenciones anti-envejecimiento**: evaluar si un tratamiento farmacológico, dietético o de estilo de vida modifica la edad epigenética en modelos *ex vivo* de fibroblastos o células de piel cultivadas.
- **Medicina de precisión**: incorporar la edad epigenética como biomarcador en ensayos clínicos de enfermedades relacionadas con la edad, utilizando biopsias de piel o muestras de sangre fácilmente obtenibles.
- **Control de calidad en cultivos celulares**: verificar que células cultivadas (por ejemplo, fibroblastos) mantienen una edad epigenética esperada tras múltiples pasajes, lo que es crítico en investigación con células madre y terapia celular.
- **Análisis de datos de metilación en biobancos**: procesar grandes conjuntos de datos públicos (como GEO) para calcular la edad epigenética de miles de muestras y correlacionarla con variables clínicas.
- **Docencia y formación en epigenética**: utilizar el modelo como ejemplo didáctico de regresión regularizada aplicada a datos ómicos, gracias a su simplicidad y facilidad de ejecución.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El artículo original (Horvath et al., 2018) reporta métricas de precisión (error absoluto medio, correlación) en los tejidos de entrenamiento, pero esos datos no están incluidos en la model card de HuggingFace. Se indica únicamente que el modelo es "particularmente preciso para muestras derivadas de piel y células cultivadas", sin cifras concretas. Por tanto, no es posible presentar una tabla comparativa con otros relojes sin riesgo de inventar datos.

## Requisitos de hardware

- **VRAM**: no requiere GPU. Es un modelo de regresión con 391 coeficientes; la inferencia se realiza en CPU.
- **Memoria RAM**: menos de 1 GB para cargar el modelo y los datos de metilación de una muestra típica (matriz de ~450K CpG por muestra).
- **GPU recomendada**: ninguna. Cualquier CPU moderna es suficiente.
- **Compatibilidad con hardware de consumo**: sí, funciona en cualquier portátil o servidor sin aceleración gráfica.
- **Opciones de despliegue**: integración directa en Python mediante `pyaging`; también puede exportarse a otros lenguajes si se extraen los coeficientes, aunque no se proporciona un formato estándar.
- **Latencia**: del orden de milisegundos por muestra, ya que la predicción es una simple multiplicación de matriz-vector.

## Comparativa con modelos similares

| Modelo | Tipo | Tejidos | Nº CpG | Año | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `skinandblood` (este) | Elastic net | Bucal, sangre, epitelio, fibroblastos, piel, cordón | 391 | 2018 | BSD-3-Clause | HuggingFace + pyaging |
| Horvath 2013 (pan-tejido) | Elastic net | Multi-tejido (sangre, cerebro, piel, etc.) | 353 | 2013 | No especificada (uso académico) | Diversas implementaciones (p.ej. `methylclock`) |
| Hannum 2013 | Elastic net | Sangre | 71 | 2013 | No especificada | Diversas implementaciones |
| PhenoAge (Levine 2018) | Elastic net | Sangre | 513 | 2018 | No especificada | Diversas implementaciones |

Nota: los datos de la tabla para los modelos comparativos son de conocimiento general en el campo de los relojes epigenéticos, pero no se derivan de la información proporcionada. Se incluyen a título orientativo, sin cifras de rendimiento.

## Limitaciones y advertencias

- **Sesgo poblacional**: el modelo fue entrenado con datos de poblaciones mayoritariamente caucásicas (típico de los estudios de Horvath), por lo que su precisión puede verse reducida en otras etnias.
- **Riesgo de sobreajuste a tejidos específicos**: aunque es multi-tejido, su rendimiento en tejidos no incluidos en el entrenamiento (p. ej., cerebro, riñón) no está garantizado.
- **Alucinación**: no aplica, al ser un modelo regresivo, pero la interpretación de la edad epigenética como edad biológica exacta puede inducir a error si no se consideran factores como la variabilidad técnica de los arrays de metilación.
- **Limitaciones de contexto**: no maneja datos longitudinales ni integra información clínica adicional; solo acepta matrices de metilación.
- **Restricciones de licencia**: la licencia BSD-3-Clause permite uso comercial y modificación, pero se debe mantener el aviso de copyright. No hay restricciones conocidas adicionales.
- **Caveat para producción**: la calidad de la predicción depende críticamente de la normalización de los datos de metilación (deben ser valores beta o M-values consistentes con el preprocesado usado en el entrenamiento). Se recomienda seguir las guías de `pyaging` para evitar errores de escala.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/pyaging/skinandblood
- Documentación de `pyaging` (catálogo de relojes): https://pyaging.readthedocs.io
- Artículo original: Horvath, S., et al. "Epigenetic clock for skin and blood cells applied to Hutchinson Gilford Progeria Syndrome and ex vivo studies." *Aging* 10(7), 1758–1775 (2018). DOI: https://doi.org/10.18632/aging.101508
