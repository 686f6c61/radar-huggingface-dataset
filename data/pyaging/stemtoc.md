# pyaging/stemtoc

## Resumen

stemtoc es un reloj epigenético de edad mitótica desarrollado por Tianlei Zhu y colaboradores, publicado en Nature Communications en 2024 y distribuido a través de la librería pyaging. A diferencia de los relojes de edad cronológica convencionales, stemtoc estima la edad mitótica relativa, es decir, el número acumulado de divisiones celulares, a partir de datos de metilación de ADN. El modelo agrega la metilación de 371 CpGs mitóticos filtrados in vivo mediante el percentil 95, un enfoque de agregación no lineal que sustituye a los modelos de regresión lineal clásicos.

El modelo no es una red neuronal ni un transformer: es un estimador estadístico determinista basado en la agregación del percentil 95 de un panel de sitios CpG. Esta naturaleza lo hace extremadamente ligero (el repositorio ocupa 0,0 GB) y adecuado para integrarse en pipelines bioinformáticos de análisis de metilación, como los basados en AnnData y pyaging.

Su relevancia actual radica en el interés creciente por distinguir el envejecimiento cronológico del envejecimiento replicativo en estudios de longevidad, cáncer y regeneración tisular. La licencia del software es MIT, aunque los pesos conservan los términos de los autores originales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Agregación del percentil 95 sobre 371 CpGs mitóticos filtrados in vivo |
| Parametros totales | no disponible (modelo estadístico sin pesos neuronales) |
| Parametros activos | no aplica |
| Longitud de contexto | no aplica |
| Tipos de cuantizacion | no aplica |
| Idiomas soportados | no disponible (entrada numérica de metilación, no texto) |
| Licencia | MIT (software); los pesos conservan los términos de los autores originales |
| Formato de pesos | no disponible (integrado en pyaging; repositorio de 0,0 GB) |

## Arquitectura y entrenamiento

stemtoc no emplea una arquitectura de aprendizaje profundo. Se trata de un contador de edad mitótica relativa que, para cada muestra, calcula el percentil 95 de los valores de metilación beta en un conjunto de 371 CpGs seleccionados por su comportamiento mitótico y filtrados para eliminar señales no replicativas in vivo. La predicción final deriva de esa agregación estadística, lo que reduce la sensibilidad a valores atípicos y a ruido técnico en comparación con medias o modelos lineales.

El panel de CpGs y el procedimiento de filtrado provienen del trabajo de Zhu et al. (2024), que valida el contador en múltiples tejidos: multi-tejido, células humanas cultivadas y sangre completa. La model card no detalla el número de muestras de entrenamiento, la composición exacta del dataset ni si hubo ajuste adicional; esos datos deben consultarse en la publicación original.

## Capacidades

- Estimación de edad mitótica relativa a partir de matrices de metilación de ADN (valores beta).
- Funcionamiento multi-tejido, incluyendo células humanas cultivadas y sangre completa.
- Agregación robusta mediante percentil 95 sobre 371 CpGs mitóticos.
- Integración nativa con pyaging mediante `pya.pred.predict_age(adata, ["stemtoc"])`.
- Entrada basada en AnnData, compatible con flujos de análisis single-cell y bulk.
- No soporta tool calling, agentes, generación de texto ni capacidades multimodales.

## Casos de uso

- Estudios de longevidad y envejecimiento replicativo: estimar el número de divisiones acumuladas en muestras de sangre completa para correlacionarlo con fenotipos de envejecimiento y compararlo con relojes cronológicos como Horvath o Hannum.
- Investigación oncológica: medir la edad mitótica en tejido tumoral frente a tejido adyacente sano para detectar expansión clonal y proliferación acelerada.
- Experimentos de reprogramación celular: cuantificar la reducción de edad mitótica en células cultivadas tras reprogramación, usando la capacidad del modelo para células humanas in vitro.
- Control de calidad en cultivos celulares: monitorizar el número de divisiones acumuladas en líneas celulares para evitar deriva fenotípica en experimentos de larga duración.
- Análisis multi-tejido en biobancos: aplicar el contador a cohorts con muestras heterogéneas gracias a su validación en múltiples tejidos.
- Pipelines de epigenética computacional: incorporar stemtoc como paso adicional en flujos basados en pyaging junto a otros relojes epigenéticos para comparar estimaciones cronológicas y mitóticas en un mismo AnnData.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM: no aplica; el modelo no requiere GPU.
- CPU: cualquier CPU moderna es suficiente; el cálculo es una agregación de percentil sobre 371 valores por muestra.
- GPU recomendadas: ninguna; no se requiere aceleración por hardware.
- Cabe en cualquier equipo consumer, incluidos portátiles de gama baja.
- Despliegue: mediante la librería pyaging en Python, integrado en entornos de análisis con AnnData/Scanpy.
- Latencia y throughput: no disponibles de forma oficial; por la naturaleza del cálculo, el coste por muestra es despreciable frente a la carga y preprocesado de los datos de metilación.

## Comparativa con modelos similares

| Modelo | Tipo | Predictor | Tejidos | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| stemtoc | Agregación percentil 95 | Edad mitótica | Multi-tejido, células cultivadas, sangre | MIT (software) | Hugging Face / pyaging |
| Relojes cronológicos epigenéticos (p. ej. Horvath, Hannum) | Regresión lineal sobre CpGs | Edad cronológica | Múltiples | Variable según modelo | pyaging y otras librerías |
| Otros contadores mitóticos (p. ej. epiTOC) | Regresión sobre CpGs de proliferación | Edad mitótica | Variable | Variable | Publicaciones y repositorios |

La comparación cuantitativa de rendimiento entre stemtoc y alternativas no está disponible en la información proporcionada; debe consultarse el artículo de Zhu et al. (2024).

## Limitaciones y advertencias

- Requiere datos de metilación de ADN de calidad y preprocesados de forma compatible con el panel de 371 CpGs; muestras con cobertura incompleta pueden producir estimaciones no fiables.
- La salida es una edad mitótica relativa, no absoluta; no debe interpretarse directamente como número de divisiones celulares exactas.
- Validado en Homo sapiens; no hay evidencia de aplicabilidad a otras especies en la información disponible.
- Los pesos conservan los términos de los autores originales; la licencia MIT del software no relicencia los pesos, por lo que el uso comercial debe verificarse con la publicación original.
- No se dispone de información sobre sesgos poblacionales, rendimiento en cohorts diversas ni tasas de error publicadas en la model card.
- No es un modelo generativo: no admite texto, tool calling ni razonamiento; su uso indebido fuera del ámbito de metilación producirá resultados sin sentido.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/pyaging/stemtoc
- Catálogo de relojes de pyaging: https://pyaging.readthedocs.io
- Artículo: Zhu, Tianlei, et al. "An improved epigenetic counter to track mitotic age in cells." Nature Communications 15 (2024): 4211. https://doi.org/10.1038/s41467-024-48649-8
