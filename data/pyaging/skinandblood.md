# pyaging/skinandblood

## Resumen

`skinandblood` es un reloj epigenético de edad cronológica publicado en 2018 por el grupo de Steve Horvath (Universidad de California, Los Ángeles) y distribuido dentro del ecosistema `pyaging` bajo el identificador `pyaging/skinandblood`. No es un modelo de lenguaje ni una red neuronal: es un modelo de regresión elastic net entrenado sobre datos de metilación del ADN para predecir la edad cronológica de una muestra biológica humana a partir de los niveles de metilación de 391 dinucleótidos CpG.

El modelo se diseñó específicamente para tejidos problemáticos para los relojes epigenéticos clásicos: piel, fibroblastos cultivados, epitelio bucal, sangre completa y sangre de cordón. Los relojes de primera generación (Horvath 2013, Hannum 2013) perdían precisión en fibroblastos cultivados in vitro y en muestras de piel, un problema relevante porque los cultivos celulares son la base de buena parte de la investigación traslacional en envejecimiento. Este reloj corrige parcialmente esa deriva y se aplicó con éxito al estudio del síndrome de progeria de Hutchinson-Gilford.

Su relevancia actual es práctica: es un componente estándar en pipelines de análisis de envejecimiento epigenético, se integra en `pyaging` con una sola llamada y su licencia MIT (para el software; los pesos conservan los términos de los autores originales) permite usarlo en investigación y en desarrollos comerciales con relativa libertad. El repositorio es de tamaño despreciable (0,0 GB), coherente con un modelo lineal de 391 coeficientes más un intercepto.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Regresion elastic net (modelo lineal regularizado sobre 391 CpG) |
| Parametros totales | No disponible con precision; estructuralmente 391 coeficientes de CpG mas intercepto |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (entrada tabular de 391 valores de metilacion beta) |
| Tipos de cuantizacion | No aplica (coeficientes en coma flotante; no requiere cuantizacion) |
| Idiomas soportados | No aplica (modelo biologico, no linguistico) |
| Licencia | MIT (software); los pesos conservan los terminos de los autores originales |
| Formato de pesos | No disponible en la informacion proporcionada; se consume via la libreria `pyaging` |

## Arquitectura y entrenamiento

El modelo es una regresión elastic net, es decir, una regresión lineal con penalización combinada L1/L2, ajustada sobre valores de metilación beta (proporción de citosinas metiladas por locus) en 391 posiciones CpG seleccionadas por el procedimiento de regularización. La entrada es, por tanto, un vector de 391 números reales en el intervalo [0, 1] y la salida un único escalar: la edad cronológica estimada en años. No hay capas, atención ni embeddings; la "inferencia" es un producto escalar más un término independiente.

El entrenamiento utilizó muestras de múltiples tejidos: células bucales, sangre completa, epitelio, fibroblastos cultivados, piel y sangre de cordón. La composición exacta del dataset, el número de muestras y los hiperparámetros de la búsqueda de la penalización no están detallados en la información disponible. El trabajo original valida el reloj en muestras de pacientes con síndrome de progeria de Hutchinson-Gilford y en estudios ex vivo, lo que constituye la evidencia principal de su utilidad clínica y experimental.

La innovación técnica no reside en el algoritmo sino en la selección del conjunto de CpG y en la estrategia de entrenamiento multi-tejido: al incluir fibroblastos cultivados y piel en el conjunto de entrenamiento, el modelo absorbe parte de la variación introducida por el cultivo celular in vitro, que es una fuente conocida de error en relojes entrenados solo con sangre.

## Capacidades

- Predicción de edad cronológica a partir de metilación del ADN en humanos (Homo sapiens).
- Funciona en seis contextos tisulares: epitelio bucal, sangre completa, epitelio, fibroblastos cultivados, piel y sangre de cordón.
- Precisión especialmente alta en muestras derivadas de piel y en células cultivadas, que es el nicho para el que fue optimizado.
- Integración nativa con la librería `pyaging` mediante `pya.pred.predict_age(adata, ["skinandblood"])` sobre objetos AnnData.
- Entrada estandarizada: valores beta de metilación en 391 CpG, compatible con arrays de metilación habituales (por ejemplo, Illumina 450K/EPIC) tras el preprocesado de `pyaging`.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües: no es un modelo generativo.
- No dispone de modo "thinking", visión, audio ni ninguna modalidad distinta de la tabular.

## Casos de uso

- Investigación en envejecimiento de la piel: estimar la edad epigenética de biopsias cutáneas y compararla con la edad cronológica para medir el efecto de exposiciones (radiación UV, contaminación, tratamientos tópicos) sobre el envejecimiento cutáneo, aprovechando que el modelo está optimizado para tejido de piel.
- Estudios con fibroblastos cultivados: cuantificar la deriva de edad epigenética inducida por el cultivo celular in vitro en experimentos de reprogramación, senescencia o estrés replicativo, donde los relojes de primera generación pierden calibración.
- Modelos animales humanos y enfermedades raras: replicar el uso original en progeria de Hutchinson-Gilford para contrastar intervenciones o caracterizar cohortes de envejecimiento acelerado.
- Epigenética clínica de muestras sanguíneas: estimar edad cronológica en sangre completa como variable de control en estudios epidemiológicos, con la ventaja de que la sangre está incluida en el entrenamiento multi-tejido.
- Muestras pediátricas y neonatales: la inclusión de sangre de cordón permite aplicar el reloj a cohortes de recién nacidos y estudios de programación fetal, un rango de edad mal cubierto por relojes entrenados solo en adultos.
- Control de calidad en biobancos: detectar inconsistencias entre la edad declarada y el perfil de metilación de una muestra, como indicio de errores de etiquetado, intercambio de muestras o contaminación cruzada.
- Pipelines de análisis reproducibles: al integrarse en `pyaging` junto a otros relojes del catálogo, permite calcular decenas de estimadores de edad epigenética sobre el mismo AnnData y comparar resultados en un único flujo de trabajo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas numéricas (correlación de Pearson, error absoluto medio, error mediano) ni comparaciones cuantitativas con otros relojes; únicamente afirma una precisión particularmente alta en muestras de piel y células cultivadas. Para cifras concretas debe consultarse el artículo original de Horvath et al. (2018), referenciado en la sección de enlaces.

## Requisitos de hardware

- VRAM estimada: prácticamente nula. El modelo son 391 coeficientes y un intercepto; cabe en cualquier GPU, CPU o incluso en memoria de un microcontrolador.
- GPU recomendadas: innecesarias. Cualquier CPU moderna ejecuta la inferencia en microsegundos por muestra; el cuello de botella real es el preprocesado de los datos de metilación, no el modelo.
- Cabe en cualquier GPU de consumo y en entornos sin GPU (portátiles, servidores de CI, contenedores ligeros).
- Opciones de despliegue: librería `pyaging` en Python; no requiere vLLM, llama.cpp, Ollama ni TGI, que están pensados para modelos generativos.
- Latencia y throughput: no disponibles de forma explícita; por la naturaleza lineal del modelo, la latencia está dominada por la carga y el preprocesado del AnnData, no por la predicción.

## Comparativa con modelos similares

| Modelo | Tipo | CpG | Tejidos de entrenamiento | Año | Licencia |
|---|---|---|---|---|---|
| skinandblood (este) | Elastic net | 391 | Buccal, sangre, epitelio, fibroblastos, piel, cordon | 2018 | MIT (software); pesos con terminos de los autores |
| Horvath 2013 (pan-tissue) | Elastic net | 353 | Multiples tejidos (pan-tissue) | 2013 | No disponible en la informacion proporcionada |
| Hannum 2013 | Elastic net | 71 | Sangre completa | 2013 | No disponible en la informacion proporcionada |
| PhenoAge (Levine 2018) | Elastic net | 513 | Sangre completa, calibrado contra mortalidad | 2018 | No disponible en la informacion proporcionada |

La comparación cualitativa es clara: Horvath 2013 es el reloj pan-tissue de referencia y más versátil, pero pierde precisión en fibroblastos cultivados; Hannum 2013 tiene la ventaja de un panel mínimo de 71 CpG, más económico de medir, pero está restringido a sangre; PhenoAge no predice edad cronológica sino edad fenotípica calibrada contra mortalidad, lo que lo hace un objetivo distinto. `skinandblood` ocupa el nicho de piel y cultivos celulares con 391 CpG. Las métricas comparativas de rendimiento no están disponibles en la información proporcionada.

## Limitaciones y advertencias

- Solo predice edad cronológica; no estima edad biológica, mortalidad ni riesgo de enfermedad. Para edad fenotípica existen otros relojes del catálogo de `pyaging`.
- Requiere datos de metilación en los 391 CpG exactos del panel; muestras con cobertura incompleta, plataformas distintas de las usadas en el entrenamiento o preprocesado diferente pueden degradar la precisión de forma no cuantificada.
- Sesgo tisular: está optimizado para piel, fibroblastos y sangre; su comportamiento en tejidos no representados en el entrenamiento (por ejemplo, hígado, músculo, cerebro) no está validado.
- Sensible a la composición celular de la muestra: mezclas de tipos celulares distintas de las del entrenamiento pueden introducir error, un problema compartido por todos los relojes basados en metilación.
- Licencia: el software `pyaging` es MIT, pero los pesos conservan los términos de los autores originales; para uso comercial de los pesos debe revisarse la licencia original del artículo de 2018, no solo la del repositorio.
- Riesgo de alucinación no aplica; el riesgo equivalente es la sobreinterpretación de una predicción puntual como medida biológica robusta, cuando se trata de una estimación con error no cuantificado en esta ficha.
- La model card no documenta sesgos poblacionales (etnia, sexo, rango de edad) del conjunto de entrenamiento; estudios en cohortes no europeas deberían validar el modelo antes de usarlo.
- Repositorio de 0,0 GB y sin pipeline declarado: conviene verificar la integridad de los artefactos descargados antes de integrarlos en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/pyaging/skinandblood
- Catalogo de relojes pyaging: https://pyaging.readthedocs.io
- Articulo original: Horvath, S., et al. "Epigenetic clock for skin and blood cells applied to Hutchinson Gilford Progeria Syndrome and ex vivo studies." Aging 10(7), 1758-1775 (2018). https://doi.org/10.18632/aging.101508
