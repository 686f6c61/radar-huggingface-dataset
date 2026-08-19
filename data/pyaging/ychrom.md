# pyaging/ychrom

## Resumen
El modelo `ychrom` es un reloj de envejecimiento basado en metilación de ADN, desarrollado por el equipo de pyaging y descrito en el artículo de Wang et al. (2021). Su función principal es predecir la presencia del cromosoma Y a partir de datos de metilación de ADN de sangre completa, y combinarlo con el score del cromosoma X para inferir el sexo cromosómico y clasificar muestras en 46,XX, 46,XY, 45,X y 47,XXY. No es un modelo de lenguaje, sino un análisis de componentes principales (PCA) aplicado a la metilación del cromosoma Y. Su relevancia radica en que permite determinar el sexo cromosómico de forma no invasiva a partir de datos epigenéticos, lo que resulta útil en estudios de envejecimiento, genética de poblaciones y diagnóstico de aneuploidías sexuales. El modelo está integrado en la librería `pyaging` y se distribuye con licencia BSD-3-Clause.

## Especificaciones tecnicas
| Parametro | Valor |
|---|---|
| Arquitectura | PCA (analisis de componentes principales) sobre metilacion del cromosoma Y |
| Parametros totales | no disponible (no es una red neuronal; coeficientes PCA) |
| Parametros activos | no aplica (no es un modelo de mezcla de expertos) |
| Longitud de contexto | no aplica (no procesa texto) |
| Tipos de cuantizacion | no aplica |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | BSD-3-Clause |
| Formato de pesos | no disponible (probablemente coeficientes PCA en la libreria pyaging) |

## Arquitectura y entrenamiento
El modelo se basa en un analisis de componentes principales (PCA) aplicado a los niveles de metilacion de ADN de sitios CpG localizados en el cromosoma Y. El primer componente principal (PC1) se utiliza como score de presencia del cromosoma Y. Este score se combina con un score equivalente del cromosoma X para clasificar el sexo cromosomico y detectar aneuploidias sexuales. Los datos de entrenamiento provienen de muestras de sangre completa de individuos con cariotipos conocidos, y el modelo fue publicado en 2021 por Wang et al. No se dispone de informacion sobre el numero de muestras ni el proceso de validacion detallado en la informacion proporcionada.

## Capacidades
- Prediccion de presencia del cromosoma Y a partir de datos de metilacion de ADN.
- Clasificacion de sexo cromosomico en 46,XX, 46,XY, 45,X y 47,XXY cuando se combina con el score del cromosoma X.
- Funciona exclusivamente con datos de metilacion de sangre completa (tissue: whole blood).
- No tiene capacidades de generacion de texto, razonamiento, codigo, vision, tool calling ni agentes.
- No soporta funciones de lenguaje ni multilingueismo.

## Casos de uso
- Estudios de envejecimiento: permite controlar por sexo cromosomico en analisis de relojes epigeneticos, mejorando la precision de las predicciones de edad biologica.
- Diagnostico de aneuploidias sexuales: puede utilizarse como herramienta de cribado para detectar alteraciones en el numero de cromosomas sexuales a partir de datos de metilacion, complementando metodos citogeneticos.
- Investigacion en genetica de poblaciones: facilita la determinacion del sexo en muestras biologicas donde no se dispone de informacion fenotipica, por ejemplo en biobancos.
- Control de calidad en estudios de metilacion: permite verificar la concordancia entre el sexo reportado y el sexo cromosomico inferido, detectando posibles errores de etiquetado de muestras.
- Analisis de mosaicismo del cromosoma Y: el score de PCA puede utilizarse para estimar la proporcion de celulas con perdida del cromosoma Y en muestras de sangre, relevante en estudios de envejecimiento y riesgo de enfermedades.
- Integracion en pipelines de bioinformatica: el modelo esta disponible en la libreria `pyaging`, lo que facilita su uso en flujos de trabajo existentes de analisis de metilacion con Python.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. El articulo original (Wang et al., 2021) reporta metricas de clasificacion, pero no se incluyen en la model card ni en los datos proporcionados.

## Requisitos de hardware
- No requiere GPU: el modelo es un PCA, por lo que la inferencia es extremadamente ligera y puede ejecutarse en cualquier CPU.
- Memoria RAM: minima, ya que solo implica aplicar una transformacion lineal a los datos de metilacion.
- No se requiere hardware especializado; puede ejecutarse en entornos de computacion convencionales.
- La libreria `pyaging` se instala via pip y no tiene dependencias pesadas para este modelo.
- Latencia: practicamente instantanea para una muestra individual.

## Comparativa con modelos similares
No disponible. No se dispone de informacion sobre otros modelos de clasificacion de sexo cromosomico por metilacion para comparar directamente. Otros relojes de envejecimiento (como Horvath o Hannum) no son comparables porque tienen una funcion distinta (prediccion de edad, no de sexo).

## Limitaciones y advertencias
- El modelo esta entrenado exclusivamente para sangre completa; su aplicacion a otros tejidos puede dar resultados no validos.
- Requiere datos de metilacion de alta calidad; la presencia de artefactos tecnicos puede afectar al score del componente principal.
- No es una herramienta de diagnostico clinico sin validacion adicional; los resultados deben interpretarse con cautela.
- La clasificacion de aneuploidias se basa en la combinacion de scores X e Y; en muestras con mosaicismo o baja calidad de datos, la clasificacion puede ser menos precisa.
- La licencia BSD-3-Clause permite uso comercial y modificacion, pero se recomienda citar el articulo original en publicaciones cientificas.
- No se dispone de informacion sobre sesgos por edad, etnia o poblacion; es posible que el rendimiento varie en diferentes grupos.

## Enlaces
- HuggingFace: https://huggingface.co/pyaging/ychrom
- Articulo original: Wang, Y. et al. DNA methylation-based sex classifier to predict sex and identify sex chromosome aneuploidy. BMC Genomics 22, 484 (2021). https://doi.org/10.1186/s12864-021-07675-2
- Documentacion de pyaging: https://pyaging.readthedocs.io
