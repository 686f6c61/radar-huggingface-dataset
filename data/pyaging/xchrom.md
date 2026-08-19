# pyaging/xchrom

## Resumen

xchrom es un reloj epigenético desarrollado por el equipo de pyaging para inferir el dosaje del cromosoma X a partir de datos de metilación de ADN en sangre completa humana. Se basa en un análisis de componentes principales (PCA) aplicado a los sitios CpG del cromosoma X, y su primer componente principal se combina con una puntuación del cromosoma Y para clasificar muestras en cariotipos 46,XX, 46,XY, 45,X y 47,XXY. El modelo fue publicado en 2021 por Wang et al. en BMC Genomics y se distribuye bajo licencia BSD-3-Clause.

A diferencia de los modelos de lenguaje o visión, xchrom no es una red neuronal, sino un modelo estadístico clásico que actúa como un reloj de envejecimiento o clasificador genético. Su relevancia radica en su aplicación clínica y de investigación para la detección de aneuploidías sexuales a partir de datos de metilación, un biomarcador accesible y estable. Se integra en la librería pyaging, que permite su uso directo sobre objetos AnnData.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Principal component analysis (PCA) |
| Parametros totales | no disponible (no es un modelo con pesos de red neuronal) |
| Parametros activos | no disponible |
| Longitud de contexto | no aplica (no es un modelo de lenguaje) |
| Tipos de cuantizacion | no aplica |
| Idiomas soportados | no disponible |
| Licencia | BSD-3-Clause |
| Formato de pesos | no disponible (integrado en libreria pyaging) |

## Arquitectura y entrenamiento

xchrom se construye mediante un análisis de componentes principales sobre los niveles de metilación de ADN en el cromosoma X. El primer componente principal (PC1) resume la variabilidad principal asociada al dosaje del cromosoma X. Este PC1 se combina con una puntuación derivada del cromosoma Y (probablemente otro PCA o una métrica similar) para discriminar entre los cariotipos 46,XX, 46,XY, 45,X y 47,XXY. No se han publicado detalles sobre el número de muestras de entrenamiento, el preprocesado exacto o si se emplearon técnicas de regularización. El modelo está diseñado para datos de metilación de sangre completa en Homo sapiens.

## Capacidades

- Predicción del dosaje del cromosoma X a partir de datos de metilación de ADN.
- Clasificación de muestras en cariotipos 46,XX, 46,XY, 45,X y 47,XXY.
- Integración con el ecosistema pyaging para análisis de envejecimiento y genética.
- Funciona con datos de tipo DNA methylation (arrays de metilación, probablemente Illumina 450K o EPIC).
- No es un modelo generativo ni de lenguaje; no admite entrada de texto ni generación de contenido.

## Casos de uso

- Diagnóstico de aneuploidías sexuales: el modelo permite identificar muestras con síndrome de Turner (45,X) o Klinefelter (47,XXY) a partir de datos de metilación de sangre, lo que puede complementar análisis citogenéticos.
- Control de calidad en estudios epigenéticos: sirve para verificar la concordancia entre el sexo genético reportado y el inferido por metilación, detectando posibles errores de etiquetado en cohortes.
- Investigación en envejecimiento y sexo biológico: al combinar el dosaje del cromosoma X con otros relojes de envejecimiento de pyaging, se pueden estudiar interacciones entre el sexo cromosómico y la edad epigenética.
- Estudios de mosaicismo del cromosoma X: la puntuación continua del dosaje podría utilizarse para estimar grados de mosaicismo, aunque no se especifica en la documentación.
- Validación de modelos de imputación de sexo: en datasets donde el sexo no está registrado, xchrom ofrece una vía de inferencia basada en metilación.
- Análisis retrospectivo de biobancos: se puede aplicar a grandes colecciones de datos de metilación para reclasificar muestras y mejorar la precisión de estudios genético-epidemiológicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El paper original (Wang et al., 2021) reporta métricas de clasificación, pero no se incluyen en la model card ni en la información proporcionada.

## Requisitos de hardware

- No requiere GPU: al ser un modelo PCA, la inferencia es ligera y se ejecuta en CPU.
- Memoria RAM: depende del tamaño del dataset de metilación, pero típicamente menos de 8 GB para arrays de metilación estándar.
- Se integra en pyaging, que funciona con Python y AnnData; no requiere infraestructura especial.
- Latencia: milisegundos por muestra, ya que solo implica una proyección lineal.
- Despliegue: no aplica para servidores de inferencia; se usa como una función dentro de pyaging.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (relojes de metilación para dosaje del cromosoma X). Otros relojes de envejecimiento como Horvath o PhenoAge no abordan la clasificación de cariotipos, por lo que no son directamente comparables.

## Limitaciones y advertencias

- Específico para sangre completa: el modelo fue entrenado y validado en este tejido; su aplicación a otros tejidos podría dar resultados inexactos.
- Requiere datos de metilación de alta calidad: la precisión depende de la plataforma de arrays y del preprocesado.
- No es un modelo de lenguaje ni generativo: no debe usarse para tareas de NLP o generación de texto.
- La documentación no detalla el rendimiento en poblaciones diversas ni posibles sesgos étnicos.
- Licencia BSD-3-Clause permite uso comercial, pero se recomienda revisar los términos de la librería pyaging.
- No se proporcionan intervalos de confianza ni medidas de incertidumbre en la salida.

## Enlaces

- HuggingFace: https://huggingface.co/pyaging/xchrom
- Paper original: Wang, Y. et al. DNA methylation-based sex classifier to predict sex and identify sex chromosome aneuploidy. BMC Genomics 22, 484 (2021). https://doi.org/10.1186/s12864-021-07675-2
- Documentación de pyaging: https://pyaging.readthedocs.io
