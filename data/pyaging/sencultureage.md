# pyaging/sencultureage

## Resumen

`sencultureage` es un clasificador binomial de senescencia celular in vitro basado en metilación de ADN, desarrollado por el equipo de pyaging (Kasamoto, Gibson, Moqri, Smith y Higgins-Chen). El modelo fue entrenado mediante regresión logística con regularización elastic net sobre datos de metilación de ADN de fibroblastos humanos y células estromales mesenquimales cultivadas, tras aplicar corrección ComBat para armonizar conjuntos de datos agrupados. Su objetivo es predecir si una muestra celular cultivada ha entrado en estado de senescencia, un proceso biológico clave en el envejecimiento y en enfermedades relacionadas con la edad.

La relevancia de este modelo radica en que ofrece una herramienta reproducible y estandarizada para detectar senescencia celular a partir de datos de metilación, un biomarcador epigenético ampliamente utilizado. A diferencia de los relojes de envejecimiento tradicionales que estiman edad cronológica o biológica, este clasificador se centra específicamente en el estado de senescencia, y fue restringido a CpGs con dirección concordante entre senescencia, edad y mortalidad, lo que aumenta su especificidad biológica. Se distribuye bajo licencia BSD-3-Clause y está integrado en la librería `pyaging`, lo que facilita su uso en pipelines de análisis epigenético.

El modelo no es un LLM ni un sistema de IA generativa; es un modelo de aprendizaje automático clásico (regresión logística con regularización elastic net) diseñado para una tarea concreta de biología computacional. Su formato de pesos no se especifica en la información disponible, pero al estar integrado en `pyaging` se puede cargar directamente mediante la función `predict_age`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Regresion logistica con regularizacion elastic net |
| Parametros totales | no disponible (modelo clasico, no se reportan parametros) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (no procesa texto) |
| Tipos de cuantizacion | no aplica (no es un modelo de redes neuronales profundas) |
| Idiomas soportados | no aplica (trabaja con datos de metilacion de ADN) |
| Licencia | BSD-3-Clause |
| Formato de pesos | no disponible (integrado en la libreria pyaging) |

## Arquitectura y entrenamiento

El modelo emplea una regresión logística con regularización elastic net, una técnica de clasificación binaria que combina penalizaciones L1 y L2 para seleccionar características y evitar sobreajuste. En este caso, las características son los niveles de metilación en sitios CpG específicos del genoma humano. El entrenamiento se realizó sobre datos agrupados de fibroblastos humanos y células estromales mesenquimales cultivadas, tras aplicar corrección ComBat para eliminar efectos de lote entre diferentes conjuntos de datos. Además, los CpGs incluidos en el modelo se restringieron a aquellos cuya dirección de cambio (hiper o hipometilación) era concordante entre senescencia, edad cronológica y mortalidad, lo que refuerza la relevancia biológica de las señales utilizadas.

No se dispone de información detallada sobre el número total de CpGs utilizados, el tamaño de la muestra de entrenamiento ni el proceso de validación. El modelo está diseñado para predecir la probabilidad de que una muestra celular cultivada esté en estado de senescencia, y su salida es una etiqueta binaria o una probabilidad, dependiendo de cómo se implemente en `pyaging`.

## Capacidades

- Predicción de senescencia celular in vitro a partir de datos de metilación de ADN.
- Clasificación binaria (senescente vs. no senescente) en cultivos de fibroblastos y células estromales mesenquimales humanas.
- Integración con el ecosistema `pyaging`, que permite aplicar el modelo a datos de metilación de forma sencilla mediante la función `predict_age`.
- Restricción a CpGs con dirección concordante entre senescencia, edad y mortalidad, lo que proporciona una base biológica más sólida que otros relojes epigenéticos.
- No soporta procesamiento de texto, visión, audio ni generación de contenido; es exclusivamente un modelo de biología computacional.

## Casos de uso

- Investigación en biología del envejecimiento: los laboratorios pueden usar `sencultureage` para determinar si cultivos celulares han alcanzado senescencia, sustituyendo ensayos de laboratorio costosos y lentos (como tinción de β-galactosidasa) por un análisis epigenético rápido y reproducible.
- Validación de modelos de senescencia inducida: al tratar células con agentes genotóxicos u otros estresores, los investigadores pueden verificar la eficacia de la inducción de senescencia mediante el clasificador, comparando muestras tratadas y control.
- Evaluación de fármacos senolíticos: el modelo puede aplicarse a datos de metilación de células tratadas con compuestos candidatos a eliminar células senescentes, ayudando a evaluar si el tratamiento reduce la señal de senescencia.
- Control de calidad en cultivos celulares: en entornos de biobancos o producción de terapias celulares, el modelo puede detectar senescencia no deseada en lotes de células cultivadas antes de su uso en experimentos o aplicaciones clínicas.
- Estudios longitudinales de envejecimiento celular: al combinar datos de metilación de múltiples pasajes celulares, el clasificador permite monitorizar la progresión hacia la senescencia a lo largo del tiempo en cultivos primarios.
- Meta-análisis de datos públicos de metilación: los investigadores pueden reanalizar conjuntos de datos depositados en GEO u otras bases, aplicando `sencultureage` para clasificar muestras como senescentes o no, sin necesidad de nuevos experimentos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se reportan métricas de precisión, sensibilidad, especificidad o AUC en la model card ni en la documentación accesible. El artículo asociado (Kasamoto et al., 2026) podría contener dichas métricas, pero no se dispone de su contenido completo en la información proporcionada.

## Requisitos de hardware

- El modelo es extremadamente ligero al tratarse de una regresión logística sobre un conjunto de CpGs (probablemente cientos o pocos miles de características). No requiere GPU ni hardware especializado.
- Puede ejecutarse en cualquier CPU moderna, incluso en portátiles o instancias cloud de baja gama.
- La memoria RAM necesaria es mínima (menos de 1 GB) para cargar los coeficientes del modelo y los datos de metilación de entrada.
- Se integra en la librería `pyaging`, que depende de Python y bibliotecas científicas estándar (numpy, pandas, scikit-learn, etc.).
- No aplican opciones de despliegue como vLLM, llama.cpp u Ollama, al no ser un modelo de lenguaje. La inferencia se realiza mediante llamadas a funciones de `pyaging`.

## Comparativa con modelos similares

Existen otros relojes epigenéticos y clasificadores de senescencia, aunque no se dispone de una comparación directa en la información proporcionada. Algunos ejemplos relevantes en el campo:

| Modelo | Tipo | Especie | Tejido | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| sencultureage | Elastic net logistic regression | Humano | Fibroblastos y MSC cultivados | BSD-3-Clause | pyaging |
| Horvath clock (pan-tissue) | Elastic net regression (edad cronológica) | Humano | Múltiples tejidos | No libre (patente) | Scripts propietarios |
| PhenoAge | Elastic net regression (edad fenotípica) | Humano | Sangre | No libre | Scripts propietarios |
| Skin & Blood clock | Elastic net regression | Humano | Piel, sangre | No libre | Scripts propietarios |

La principal diferencia de `sencultureage` es que está específicamente entrenado para predecir senescencia celular in vitro, no edad cronológica, y que se distribuye bajo una licencia permisiva (BSD-3-Clause), lo que facilita su uso académico y comercial. Además, está integrado en un ecosistema de código abierto (`pyaging`), mientras que muchos relojes clásicos tienen restricciones de uso.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente con datos de fibroblastos y células estromales mesenquimales humanas cultivadas; no es aplicable a otros tipos celulares ni a tejidos sólidos sin validación previa.
- La predicción se basa en metilación de ADN, por lo que requiere datos de alta calidad generados con plataformas compatibles (p. ej., Illumina 450K o EPIC). Diferencias en la preparación de muestras o en la normalización pueden afectar los resultados.
- No se dispone de métricas de rendimiento publicadas, por lo que se desconoce su precisión, sensibilidad y especificidad en distintos escenarios.
- La senescencia es un proceso heterogéneo; el modelo podría no capturar todas las variantes de senescencia (p. ej., senescencia inducida por oncogenes vs. replicativa) si no estaban representadas en el entrenamiento.
- La licencia BSD-3-Clause permite uso comercial y modificación, pero se recomienda citar el artículo original en publicaciones científicas.
- El modelo fue publicado en 2026, por lo que su validación independiente aún es limitada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/pyaging/sencultureage
- Documentación de pyaging (Clock Catalogue): https://pyaging.readthedocs.io
- Artículo asociado: Kasamoto, K., Gibson, J., Moqri, M., Smith, R. & Higgins-Chen, A.T. DNA methylation signatures of cellular senescence are not reversed by senolytic treatment. Aging Cell 25, e70430 (2026). DOI: https://doi.org/10.1111/acel.70430
