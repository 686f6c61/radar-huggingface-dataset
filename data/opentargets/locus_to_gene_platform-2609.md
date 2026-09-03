# opentargets/locus_to_gene_platform-2609

## Resumen

El modelo `opentargets/locus_to_gene_platform-2609` es un clasificador de gradiente boosting (XGBoost) desarrollado por Open Targets para priorizar genes causales en loci de estudios de asociación de genoma completo (GWAS). Su función principal es, a partir de un conjunto de variantes genéticas asociadas a un rasgo o enfermedad, identificar cuál es el gen más probablemente responsable de la señal observada, integrando información genética y funcional.

Este modelo resuelve un problema central en genómica: el paso de la asociación estadística (loci) a la causalidad biológica (genes). Es relevante porque permite reducir el espacio de candidatos en estudios post-GWAS, acelerando la validación experimental y el descubrimiento de dianas terapéuticas. La arquitectura es un árbol de decisión potenciado (XGBoost) sobre características tabulares, no un modelo de lenguaje, y su tamaño es mínimo (el repositorio no contiene pesos, solo el código de carga). El contexto de entrada son vectores de características numéricas, no texto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gradient Boosting Classifier (XGBoost) |
| Parametros totales | no disponible (modelo tabular, no se reportan parametros) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entrada tabular, no secuencial) |
| Tipos de cuantizacion | no disponible (no se distribuyen pesos cuantizados) |
| Idiomas soportados | en (etiqueta del modelo, aunque no es relevante para tabular) |
| Licencia | MIT |
| Formato de pesos | no disponible (el modelo se carga via codigo, no como archivo de pesos) |

## Arquitectura y entrenamiento

El modelo es un clasificador XGBoost de gradiente boosting, entrenado para predecir la probabilidad de que un gen sea causal en un locus GWAS. Las características de entrada incluyen: distancia entre las variantes del conjunto creible y el gen, evidencia de colocalizacion con QTL moleculares (expresion y proteinas) y puntuaciones de patogenicidad de variantes (VEP). El entrenamiento se realizo con pares gen-locus curados como positivos y negativos por Open Targets, y la metrica de evaluacion es el area bajo la curva precision-recall (AUCPR). No se dispone de informacion sobre el numero exacto de muestras, el proceso de curado ni si se aplicaron tecnicas de ajuste adicionales (como RLHF o DPO, que no aplican a este tipo de modelo).

## Capacidades

- Clasificacion tabular binaria: predice si un gen es causal en un locus GWAS dado un conjunto de caracteristicas geneticas y funcionales.
- Priorizacion de genes: genera una puntuacion de probabilidad que permite ordenar genes candidatos dentro de un locus.
- Integracion de multiples fuentes de evidencia: combina distancia fisica, colocalizacion con QTL y patogenicidad de variantes en un unico modelo.
- Uso programatico: se integra con la libreria `gentropy` de Open Targets, permitiendo cargar el modelo desde Hugging Face Hub y aplicarlo a matrices de caracteristicas propias.
- No soporta generacion de texto, razonamiento, codigo, vision ni tool calling; es un modelo puramente tabular.

## Casos de uso

- Priorizacion de genes en estudios de asociacion de genoma completo: dado un conjunto de loci significativos de un GWAS, el modelo ordena los genes candidatos por probabilidad de causalidad, reduciendo el numero de genes a validar experimentalmente.
- Descubrimiento de dianas terapeuticas: en proyectos de farmacogenomica, se utiliza para identificar genes con mayor probabilidad de ser la causa de una asociacion, priorizando aquellos con potencial de ser modulados farmacologicamente.
- Analisis de colocalizacion funcional: cuando se dispone de datos de eQTL o pQTL, el modelo integra la evidencia de colocalizacion para distinguir entre genes cuya expresion esta asociada al rasgo y aquellos que son solo proximos fisicamente.
- Validacion de resultados de estudios de genetica humana: los investigadores pueden aplicar el modelo a sus propios datos de GWAS para obtener una lista corta de genes candidatos antes de disenar experimentos de edicion genica o knockdown.
- Integracion en pipelines bioinformaticos: al ser una funcion de la libreria `gentropy`, se puede incorporar en flujos de analisis automatizados que procesan datos geneticos a gran escala.
- Comparacion de metodos de priorizacion: sirve como referencia (baseline) para evaluar nuevas tecnicas de integracion de datos genomicos, dado que es un modelo establecido y publicado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona que la metrica de evaluacion es AUCPR, pero no proporciona valores concretos ni comparaciones con otros modelos. No se dispone de datos de rendimiento en conjuntos estandar como MMLU, HumanEval o GSM8K, ya que no es un modelo de lenguaje.

## Requisitos de hardware

- Al ser un modelo XGBoost tabular, no requiere GPU para inferencia; puede ejecutarse en CPU con recursos minimos.
- No se especifican requisitos de VRAM; el modelo es ligero y cabe en cualquier maquina con Python y las dependencias de `gentropy` instaladas.
- No se recomienda ninguna GPU especifica; el despliegue es trivial en cualquier servidor o maquina local.
- Opciones de despliegue: se integra directamente en Python mediante `gentropy`; no se mencionan compatibilidades con vLLM, llama.cpp, Ollama o TGI, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponibles, pero al ser un clasificador de arboles, la inferencia es del orden de milisegundos por muestra en CPU.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables en la misma categoria (priorizacion de genes causales en GWAS) dentro de la informacion proporcionada. Existen otros metodos en la literatura (como PoPS, cS2G o FINEMAP), pero no se han incluido datos en la busqueda web ni en la model card. Por tanto, la comparativa no esta disponible.

## Limitaciones y advertencias

- Limitado a genes codificantes de proteinas con datos de caracteristicas disponibles; genes no codificantes o sin datos de QTL o VEP quedan excluidos.
- El modelo depende de la calidad y cobertura de los datos de entrada; si las caracteristicas (distancia, colocalizacion, patogenicidad) son incompletas o ruidosas, las predicciones pueden ser menos fiables.
- No se han documentado sesgos especificos, pero al entrenarse con datos curados de Open Targets, podria estar sesgado hacia poblaciones o tejidos con mayor representacion en los estudios GWAS originales.
- Riesgo de alucinacion no aplica (no es generativo), pero si de sobreajuste a los pares de entrenamiento; la metrica AUCPR no se ha reportado, por lo que se desconoce su rendimiento real en datos externos.
- La licencia MIT permite uso comercial, pero el modelo se distribuye como codigo y no como pesos; el usuario debe instalar `gentropy` y cargar el modelo desde el hub, lo que implica dependencias adicionales.
- No se garantiza la actualizacion del modelo; la version `platform-2609` sugiere una fecha de creacion en 2026, pero no hay informacion sobre mantenimiento o versiones posteriores.

## Enlaces

- Hugging Face: https://huggingface.co/opentargets/locus_to_gene_platform-2609
- Repositorio de codigo (gentropy): https://github.com/opentargets/gentropy
- Documentacion del metodo L2G: https://opentargets.github.io/gentropy/python_api/methods/l2g/_l2g/
- Articulo de referencia (Open Targets Genetics): https://doi.org/10.1038/s41588-021-00945-5
