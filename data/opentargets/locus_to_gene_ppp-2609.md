# opentargets/locus_to_gene_ppp-2609

## Resumen

Locus-to-Gene (L2G) es un modelo de clasificación tabular desarrollado por Open Targets que prioriza genes causales probables en cada locus de GWAS a partir de características genéticas y de genómica funcional. No es un modelo de lenguaje: se trata de un clasificador de Gradient Boosting (XGBoost) entrenado sobre pares gen-locus etiquetados como positivos y negativos, y expuesto como pipeline `tabular-classification` en Hugging Face bajo el identificador `opentargets/locus_to_gene_ppp-2609`.

El problema que resuelve es central en genética de asociación: un estudio de GWAS identifica regiones del genoma asociadas a un rasgo, pero no el gen concreto responsable. L2G toma esas regiones y produce una puntuación por gen, combinando tres familias de evidencia: distancia entre las variantes del credible set y el gen, colocalización con QTL moleculares (expresión y proteína) y puntuaciones de patogenicidad de variantes derivadas de VEP.

Es relevante porque alimenta directamente la Plataforma Open Targets para el descubrimiento y priorización de dianas terapéuticas. El modelo está limitado a genes codificantes de proteína con datos de características disponibles, se distribuye con licencia MIT y se integra en el ecosistema `gentropy` mediante `LocusToGeneModel.load_from_hub`. La información publicada no especifica hiperparámetros, número de árboles ni tamaño del conjunto de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gradient Boosting Classifier (XGBoost) |
| Parametros totales | no disponible (no se documentan numero de arboles, profundidad ni learning rate) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo tabular; no procesa secuencias ni texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (segun metadatos); el modelo no procesa lenguaje natural |
| Licencia | MIT |
| Formato de pesos | no disponible (el repositorio ocupa 0.0 GB; la carga se realiza via `gentropy` con `LocusToGeneModel.load_from_hub`) |

## Arquitectura y entrenamiento

El modelo es un clasificador de Gradient Boosting implementado con XGBoost, segun la model card del autor. Se entrena sobre pares gen-locus curados como positivos y negativos procedentes de Open Targets, y la metrica de evaluacion declarada es el area bajo la curva de precision-recall (AUCPR), una eleccion coherente con un problema desbalanceado en el que los positivos reales son escasos frente al total de pares candidatos.

Las caracteristicas de entrada se agrupan en tres bloques: distancia de las variantes del credible set al gen; colocalizacion con QTL moleculares (estudios de expresion y de proteina); y patogenicidad de variantes segun puntuaciones de VEP. El alcance esta restringido a genes codificantes de proteina que dispongan de datos de caracteristicas. No se documentan en la informacion disponible el numero de arboles, la profundidad, la tasa de aprendizaje, el volumen de tokens o pares de entrenamiento, ni si hubo etapas de ajuste posteriores. Tampoco se describe ninguna innovacion tecnica adicional mas alla del propio ensamblado de arboles.

## Capacidades

- Priorizacion de genes causales en loci de GWAS: devuelve una puntuacion por gen que estima la probabilidad de ser el gen causal del locus.
- Integracion de evidencia heterogenea: combina distancia, colocalizacion con QTL y patogenicidad de variantes en una unica prediccion.
- Trabajo sobre matrices de caracteristicas precalculadas: la inferencia se realiza con `model.predict(your_feature_matrix, session)`.
- Uso como componente dentro del pipeline `gentropy` y de la Plataforma Open Targets.
- Aplicable a loci de enfermedades comunes, rasgos complejos y estudios de biobancos, siempre que existan datos de caracteristicas para el gen candidato.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generacion de texto.
- No tiene capacidades de vision, audio ni modo de razonamiento extendido.
- Cobertura limitada a genes codificantes de proteina con datos de caracteristicas disponibles.

## Casos de uso

- Descubrimiento de dianas terapeuticas: dado un conjunto de loci asociados a una enfermedad, el modelo ordena los genes candidatos por probabilidad de causalidad, lo que permite a los equipos de descubrimiento concentrar la validacion experimental en las hipotesis mas prometedoras.
- Post-procesado de estudios GWAS: tras el fine-mapping de un estudio, se introducen los credible sets y las caracteristicas de los genes del locus en L2G para obtener una lista priorizada, sustituyendo la asignacion por gen mas cercano.
- Enriquecimiento genetico en bases de conocimiento: la Plataforma Open Targets consume las puntuaciones L2G para asociar evidencias geneticas a dianas, de modo que el modelo actua como capa de evidencia dentro del grafo.
- Priorizacion a escala de biobancos: en estudios con miles de loci, el modelo permite filtrar sistematicamente los genes y reducir el espacio de busqueda antes de analisis funcionales costosos.
- Integracion de evidencia QTL en estudios de eQTL y pQTL: cuando existen datos de colocalizacion, el modelo incorpora esa senal y ayuda a distinguir genes cuya expresion o proteina esta realmente modulada por la variante asociada.
- Comparacion de hipotesis genicas en enfermedades raras y rasgos poco estudiados: con evidencia funcional limitada, la senal de patogenicidad de variantes (VEP) y la distancia aportan criterios objetivos de ordenacion.
- Reproducibilidad de analisis: al cargarse desde el Hub mediante `gentropy`, permite fijar una version concreta del modelo (identificador `locus_to_gene_ppp-2609`) y repetir la priorizacion en distintas ejecuciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente declara que la metrica de evaluacion empleada durante el entrenamiento es el area bajo la curva de precision-recall (AUCPR), pero no se aporta ningun valor numerico ni comparacion con versiones anteriores o modelos alternativos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; al ser un modelo de arboles, la inferencia se ejecuta en CPU.
- GPU recomendadas: no aplica; no se documenta soporte ni necesidad de GPU.
- Compatibilidad con GPU de consumo: no procede; el clasificador es ligero y no requiere aceleracion por hardware.
- El componente potencialmente pesado es el entorno `gentropy`, que trabaja con Spark; el modelo en si no es el cuello de botella de recursos.
- Opciones de despliegue: `gentropy` (`LocusToGeneModel.load_from_hub` y `model.predict`), y ejecucion en Python con las dependencias del ecosistema (sklearn, XGBoost).
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Categoria | Licencia | Disponibilidad | Metricas comparadas |
|---|---|---|---|---|---|
| opentargets/locus_to_gene_ppp-2609 | Gradient Boosting (XGBoost) | Priorizacion gen-locus en GWAS | MIT | Hugging Face / gentropy | AUCPR declarada como metrica, sin valor publicado |
| Versiones previas de L2G de Open Targets | no disponible | Priorizacion gen-locus en GWAS | no disponible | no disponible | no disponible |
| FLAMES | no disponible | Priorizacion de genes en loci de GWAS | no disponible | no disponible | no disponible |
| cS2G | no disponible | Priorizacion de genes en loci de GWAS | no disponible | no disponible | no disponible |

La informacion proporcionada no incluye datos de rendimiento de estas alternativas, por lo que no es posible establecer una comparacion cuantitativa. La comparativa se limita a la categoria funcional.

## Limitaciones y advertencias

- Restriccion de alcance a genes codificantes de proteina que dispongan de datos de caracteristicas; se excluyen genes no codificantes.
- Dependencia de la calidad y cobertura de los datos de entrada: sin colocalizacion con QTL ni puntuaciones VEP, el modelo depende practicamente de la distancia, lo que degrada la calidad de la priorizacion.
- Sesgo de seleccion en el entrenamiento: los pares positivos y negativos curados por Open Targets condicionan la distribucion de casos; la extrapolacion a loci atipicos o poco representados no esta garantizada.
- Riesgo de falsos positivos: una puntuacion alta no implica causalidad demostrada, solo mayor probabilidad segun las caracteristicas empleadas.
- Sin datos publicados de AUCPR ni de validacion externa, no es posible estimar la precision esperada en produccion.
- No procesa lenguaje natural ni secuencias; las variables linguisticas de los metadatos ("en") no reflejan una capacidad multilingue real.
- Licencia MIT: permite uso comercial, pero se debe citar el articulo de Open Targets Genetics segun indica la model card.
- El identificador incluye el sufijo `ppp-2609`, cuyo significado y relacion con otras variantes del modelo no se documenta.
- El modelo requiere el entorno `gentropy` y una sesion de Spark para su carga y ejecucion, lo que anade dependencias de infraestructura mas alla del propio clasificador.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/opentargets/locus_to_gene_ppp-2609
- Repositorio gentropy: https://github.com/opentargets/gentropy
- Documentacion del metodo L2G: https://opentargets.github.io/gentropy/python_api/methods/l2g/_l2g/
- Publicacion de referencia (Open Targets Genetics): Ghoussaini, M., Mountjoy, E., Carmona, M. et al. "Open Targets Genetics: systematic identification of trait-associated genes using large-scale genetics and functional genomics". Nature Genetics 53, 1527-1533 (2021). doi:10.1038/s41588-021-00945-5
