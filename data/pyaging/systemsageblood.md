# pyaging/systemsageblood

## Resumen

`pyaging/systemsageblood` es un reloj epigenético (aging clock) desarrollado por el equipo de pyaging dentro del proyecto "Systems Age". Se trata de un modelo de regresión basado en análisis de componentes principales (PCA) y regresión elastic net, entrenado para estimar la edad biológica del sistema sanguíneo a partir de datos de metilación de ADN en sangre completa (whole blood) de Homo sapiens. El modelo forma parte de una batería de 11 relojes que cuantifican la heterogeneidad del envejecimiento en distintos sistemas fisiológicos, y devuelve una puntuación en una escala similar a la edad cronológica.

Su relevancia radica en que ofrece una medida específica del envejecimiento del sistema sanguíneo, lo que permite estudiar el desacoplamiento entre edad cronológica y edad biológica en contextos clínicos y de investigación. A diferencia de los modelos de lenguaje, este es un modelo de biología computacional que se distribuye como pesos entrenados (2.0 GB) bajo licencia BSD-3-Clause, y se integra en la librería `pyaging` para su uso directo con datos de metilación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | PCA + elastic net regression |
| Parametros totales | no disponible (pesos del modelo, 2.0 GB en repo) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (no es un modelo de texto) |
| Tipos de cuantizacion | no disponible (se distribuye como pesos completos) |
| Idiomas soportados | no aplica (modelo biologico, no linguistico) |
| Licencia | BSD-3-Clause |
| Formato de pesos | no disponible (repo de 2.0 GB, probablemente safetensors o similar, no especificado) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura clasica de los relojes epigeneticos de segunda generacion: primero se aplica un analisis de componentes principales (PCA) a los niveles de metilacion de ADN en sitios CpG seleccionados, y posteriormente se entrena una regresion elastic net sobre esos componentes para predecir una variable objetivo, en este caso la edad biologica del sistema sanguineo. Segun la model card, el entrenamiento se realizo sobre datos de sangre completa y la puntuacion resultante se calibra en una escala similar a la edad cronologica. El modelo forma parte del trabajo publicado en Nature Aging (Sehgal et al., 2025), donde se describe el sistema completo de 11 relojes. No se han proporcionado detalles sobre el numero de muestras de entrenamiento, el numero de CpGs utilizados ni el proceso de validacion interna, mas alla de la referencia al paper original.

## Capacidades

- Prediccion de edad biologica del sistema sanguineo a partir de datos de metilacion de ADN en sangre completa.
- Generacion de una puntuacion en escala de edad (anos), interpretable como desviacion respecto a la edad cronologica.
- Integracion con la libreria `pyaging` mediante la funcion `pya.pred.predict_age(adata, ["systemsageblood"])`.
- No soporta generacion de texto, codigo, vision, tool calling ni capacidades de agente, al ser un modelo de regresion biologica.
- No es multilingue; trabaja exclusivamente con datos de metilacion (matrices de intensidad) de muestras humanas.

## Casos de uso

- Investigacion en envejecimiento: estimar la edad biologica del sistema sanguineo en cohortes epidemiologicas para estudiar asociaciones con enfermedades, estilo de vida o exposiciones ambientales.
- Medicina de precision: evaluar el desajuste entre edad cronologica y edad biologica como biomarcador de riesgo en pacientes con patologias hematologicas o inflamatorias.
- Estudios longitudinales: monitorizar cambios en la edad biologica sanguinea a lo largo del tiempo en ensayos clinicos de intervenciones (dieta, ejercicio, farmacos).
- Analisis de datos de metilacion existentes: aplicar el modelo a conjuntos publicos de datos de metilacion de sangre (por ejemplo, GEO) para reanalizar resultados con una nueva metrica.
- Desarrollo de paneles de envejecimiento: combinar este reloj con otros del sistema Systems Age para obtener un perfil multi-sistema en una sola muestra.
- Control de calidad en estudios epigeneticos: utilizar la edad biologica predicha como variable de verificacion de la integridad de las muestras y la reproducibilidad experimental.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de rendimiento como correlacion con edad cronologica, error absoluto medio (MAE) ni comparaciones con otros relojes epigeneticos. Para obtener estos datos, es necesario consultar el articulo original en Nature Aging (DOI: 10.1038/s43587-025-00958-3).

## Requisitos de hardware

- El modelo ocupa 2.0 GB en disco, por lo que es viable en cualquier equipo con almacenamiento suficiente.
- La inferencia sobre datos de metilacion es computacionalmente ligera (una regresion sobre componentes principales), por lo que no requiere GPU. Puede ejecutarse en CPU en pocos segundos para una muestra individual.
- No se requieren GPUs especificas; un portatil con 8 GB de RAM es suficiente para cargar el modelo y hacer predicciones con `pyaging`.
- El despliegue se realiza mediante la libreria `pyaging` en Python; no se contemplan opciones como vLLM, llama.cpp u Ollama, dado que no es un modelo de lenguaje.
- La latencia es minima (del orden de milisegundos a segundos por muestra, dependiendo del numero de CpGs en la matriz de entrada).

## Comparativa con modelos similares

| Modelo | Tipo | Especie | Tejido | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| systemsageblood | PCA + elastic net | Homo sapiens | Sangre completa | BSD-3-Clause | HuggingFace (pyaging) |
| Horvath clock (2013) | Elastic net | Homo sapiens | Multi-tejido | No especificada (uso academico) | Scripts en GitHub |
| PhenoAge (Levine et al., 2018) | Elastic net | Homo sapiens | Sangre | No especificada (uso academico) | Scripts en GitHub |
| GrimAge (Lu et al., 2019) | Elastic net + surrogates | Homo sapiens | Sangre | No especificada (uso academico) | Scripts en GitHub |

Nota: los relojes clasicos (Horvath, PhenoAge, GrimAge) no se distribuyen como pesos en HuggingFace y tienen licencias mas restrictivas; `systemsageblood` destaca por su licencia permisiva y su integracion en un ecosistema moderno (`pyaging`). No se dispone de comparativas de rendimiento publicas entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- No se han publicado metricas de validacion externa en la model card; el rendimiento real en poblaciones distintas a la de entrenamiento es desconocido.
- El modelo esta entrenado exclusivamente para sangre completa humana; su aplicacion a otros tejidos o especies requiere recalibracion.
- Los relojes epigeneticos pueden verse afectados por la composicion celular de la muestra; no se especifica si se aplico correccion por tipos celulares.
- La licencia BSD-3-Clause permite uso comercial, pero el modelo se distribuye sin garantias; el autor no se hace responsable de interpretaciones clinicas.
- No es un modelo generativo ni de lenguaje; cualquier intento de usarlo como tal es incorrecto.
- El modelo fue creado en 2026 segun los metadatos de HuggingFace, pero la publicacion asociada es de 2025; verificar la version y el DOI para reproducibilidad.

## Enlaces

- HuggingFace: https://huggingface.co/pyaging/systemsageblood
- Documentacion de pyaging (Clock Catalogue): https://pyaging.readthedocs.io
- Articulo original: Sehgal, R., Markov, Y., Qin, C., et al. (2025). Systems Age: a single blood methylation test to quantify aging heterogeneity across 11 physiological systems. Nature Aging, 5, 1880–1896. DOI: https://doi.org/10.1038/s43587-025-00958-3
