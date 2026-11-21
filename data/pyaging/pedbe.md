# pyaging/pedbe

## Resumen

`pedbe` es un reloj epigenético (aging clock) publicado por el grupo de Lisa M. McEwen y empaquetado por la organización `pyaging` para su uso dentro de la librería homónima. No es un modelo de lenguaje ni una red neuronal profunda: es un modelo de regresión elastic net entrenado sobre datos de metilación del ADN para predecir la edad cronológica en muestras pediátricas de epitelio bucal (buccal epithelium), una matriz no invasiva. El modelo se publicó originalmente en 2020 en *Proceedings of the National Academy of Sciences* (PNAS).

El problema que resuelve es la estimación de edad biológica en población infantil a partir de un perfil de metilación, un caso de uso con aplicaciones en pediatría, epidemiología del desarrollo y estudios de adversidad temprana. La relevancia actual viene de su integración en el catálogo unificado de relojes de `pyaging`, que permite invocarlo con una única llamada (`pya.pred.predict_age(adata, ["pedbe"])`) sobre objetos AnnData, evitando tener que reimplementar el pipeline de normalización y selección de CpGs de cada publicación.

El repositorio de Hugging Face es de tamaño prácticamente nulo (0.0 GB) y 790 descargas, lo que es coherente con un modelo lineal de pocos cientos de coeficientes más metadatos. La licencia declarada en el repo es MIT, pero la propia model card advierte que los pesos conservan los términos de los autores originales y que la licencia del software `pyaging` no los relicencia.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Regresión elastic net (modelo lineal regularizado) sobre features de metilación del ADN |
| Parametros totales | no disponible (número de CpGs y coeficientes no declarado en la información proporcionada) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (no es un modelo de secuencia) |
| Tipos de cuantizacion | no disponible (no aplica cuantización de pesos neuronales) |
| Idiomas soportados | no disponible (la entrada es un vector de metilación, no texto) |
| Licencia | MIT declarada en el repo; los pesos retienen los términos de los autores originales |
| Formato de pesos | no disponible (artefacto consumido por la librería `pyaging`) |

## Arquitectura y entrenamiento

El modelo es una regresión elastic net, es decir, una regresión lineal con penalización combinada L1/L2, aplicada a valores de beta de metilación (probablemente normalizados y filtrados a un subconjunto de CpGs informativos). Este tipo de modelo es el estándar de facto en la literatura de relojes epigenéticos por su interpretabilidad, su bajo coste computacional y su robustez frente a la alta dimensionalidad del array de metilación (cientos de miles de sondas frente a cientos de muestras).

Según la model card, el modelo se desarrolló específicamente para epitelio bucal pediátrico, lo que implica que el conjunto de CpGs seleccionados y los coeficientes están calibrados para esa matriz y ese rango de edad, no para sangre periférica ni para adultos. El año de publicación es 2020 y la referencia es el paper de PNAS indicado. No se detalla en la información disponible el número exacto de muestras de entrenamiento, el número de CpGs retenidos, la plataforma de array utilizada (por ejemplo, Illumina 450K o EPIC), ni si hubo validación cruzada externa; estos datos deben consultarse en la publicación original.

## Capacidades

- Predicción de edad cronológica a partir de perfiles de metilación de ADN en muestras de epitelio bucal humano.
- Especialización pediátrica: calibrado para el rango de edad infantil, a diferencia de relojes de adulto como Horvath o Hannum.
- Matriz no invasiva: diseñado explícitamente para hisopado bucal, lo que facilita su uso en estudios con menores.
- Integración nativa con `pyaging`: invocable mediante `pya.pred.predict_age(adata, ["pedbe"])` sobre objetos AnnData.
- Ejecución determinista y de coste despreciable: una predicción es una combinación lineal de coeficientes, sin necesidad de GPU.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües: no es un modelo generativo.

## Casos de uso

- Estudios pediátricos de envejecimiento biológico: estimar la discrepancia entre edad cronológica y edad epigenética en cohortes infantiles a partir de hisopados bucales, aprovechando que el modelo está calibrado para esa matriz y ese rango de edad.
- Epidemiología del desarrollo: usar la edad epigenética como variable de resultado en estudios longitudinales sobre adversidad temprana, estrés psicosocial o exposiciones ambientales, gracias a la naturaleza no invasiva de la muestra.
- Investigación en salud bucodental y medicina del desarrollo: correlacionar el reloj con marcadores de desarrollo puberal, crecimiento o indicadores de salud oral en poblaciones pediátricas.
- Reproducibilidad y armonización de pipelines: al estar integrado en `pyaging`, permite recalcular predicciones de forma estandarizada sobre datasets procesados con distintos pipelines de normalización, reduciendo variabilidad entre laboratorios.
- Análisis exploratorio en biobancos con datos de metilación bucal: filtrar y priorizar subcohortes pediátricas por edad epigenética estimada antes de análisis más costosos (por ejemplo, secuenciación o seguimiento clínico).
- Docencia y formación en epigenética computacional: servir como ejemplo canónico de reloj lineal interpretable, con coeficientes inspeccionables, para enseñar selección de features y regularización en datos ómicos de alta dimensionalidad.
- Control de calidad en estudios con menores: detectar muestras con edad epigenética atípica respecto a la edad cronológica declarada, lo que puede indicar errores de etiquetado, intercambio de muestras o problemas de calidad del hisopado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de error (MAE, correlación de Pearson, R²) ni comparaciones con otros relojes; estos datos deben extraerse del paper de PNAS de 2020.

## Requisitos de hardware

- VRAM: no aplica; el modelo es una regresión lineal y se ejecuta en CPU.
- GPU recomendadas: ninguna necesaria. Cualquier CPU moderna es suficiente.
- Cabe en cualquier consumer GPU y también en entornos sin GPU (portátiles, servidores de CPU, notebooks).
- Opciones de despliegue: librería `pyaging` en Python, sobre objetos AnnData del ecosistema Scanpy/anndata. No aplica vLLM, llama.cpp, Ollama ni TGI, que son runtimes para modelos generativos.
- Latencia y throughput: no disponibles de forma explícita; por la naturaleza del modelo (una combinación lineal sobre un subconjunto de CpGs), la inferencia por muestra es del orden de milisegundos y el coste dominante en un pipeline real será la carga y normalización de los datos de metilación, no la predicción.
- Almacenamiento: el repo ocupa 0.0 GB, por lo que el artefacto es de tamaño despreciable.

## Comparativa con modelos similares

| Modelo | Tipo | Tejido / población | Año | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| pedbe | Elastic net | Epitelio bucal pediátrico | 2020 | MIT declarada (pesos con términos de los autores) | Hugging Face (pyaging/pedbe), catálogo pyaging |
| Horvath clock | Elastic net | Múltiples tejidos, adulto | 2013 | no disponible en la información proporcionada | Referenciado en literatura; disponibilidad vía implementaciones de terceros |
| Hannum clock | Elastic net | Sangre, adulto | 2013 | no disponible en la información proporcionada | Referenciado en literatura; disponibilidad vía implementaciones de terceros |

La comparación con Horvath y Hannum es pertinente por categoría (relojes epigenéticos de regresión elastic net), pero conviene subrayar que `pedbe` se diferencia por estar restringido a epitelio bucal y a edad pediátrica, lo que lo hace inadecuado como sustituto directo de relojes multi-tejido o de adulto. No se dispone de datos de rendimiento comparativo en la información proporcionada.

## Limitaciones y advertencias

- Especificidad de tejido: calibrado para epitelio bucal; aplicarlo a sangre, saliva de otro tipo o tejidos internos invalidaría las predicciones.
- Especificidad de población: diseñado para edad pediátrica; extrapolar a adultos o a rangos de edad fuera del entrenamiento no está validado.
- Sesgos demográficos: no se documenta en la información disponible la composición étnica, geográfica o socioeconómica de la cohorte de entrenamiento, un factor crítico en relojes epigenéticos por las diferencias conocidas entre ancestrías.
- Riesgo de alucinación: no aplica en sentido generativo, pero existe riesgo de predicción espuria si la entrada tiene CpGs faltantes, valores mal normalizados o plataformas de array distintas de las usadas en entrenamiento.
- Dependencia del pipeline: el resultado depende de la normalización previa de los datos de metilación; cambios en el preprocesado pueden alterar la edad estimada.
- Licencia: el repo declara MIT, pero la model card advierte que los pesos conservan los términos de los autores originales; para uso comercial conviene verificar la licencia del paper y del artefacto original antes de desplegar.
- Falta de transparencia en el repo: no se publican en Hugging Face el número de CpGs, los coeficientes, las métricas de error ni los detalles de entrenamiento; la trazabilidad completa exige consultar la publicación.
- Uso clínico: es una herramienta de investigación; no está validada como dispositivo médico ni para diagnóstico individual.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/pyaging/pedbe
- Catálogo de relojes pyaging: https://pyaging.readthedocs.io
- Paper de referencia (McEwen et al., PNAS 2020): https://doi.org/10.1073/pnas.1820843116
