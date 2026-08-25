# qzzhang/PlantGeneAnn-v2-preview

## Resumen

PlantGeneAnn-v2-preview es un modelo fundacional de genoma desarrollado por qzzhang (qzzhang0131 en GitHub) para la anotación ab initio de estructuras génicas en plantas. A diferencia de los métodos tradicionales que dependen de evidencia transcripcional o de homología, este modelo predice directamente la estructura de los genes —incluyendo regiones codificantes (CDS), exones y genes de proteínas— a partir de la secuencia de ADN, tanto en la cadena forward como en la reverse. Está construido sobre la arquitectura PlantBiMoE, que combina un enfoque de mezcla de expertos con un decodificador de embeddings tipo U-Net 1D, lo que le permite capturar patrones genómicos a múltiples escalas.

La versión preview (v2) se publica bajo licencia MIT, lo que facilita su uso comercial y académico. Aunque la información pública es limitada, el modelo se presenta como una herramienta relevante para la anotación de genomas de especies recién secuenciadas y no modelo, donde los métodos convencionales suelen fallar por falta de datos de expresión o de genomas de referencia cercanos. El modelo también puede utilizarse como extractor de embeddings genómicos para tareas downstream, como la predicción de elementos reguladores o la comparación de genomas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | PlantBiMoE (mezcla de expertos) con decodificador de embeddings U-Net 1D |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo biologico, procesa secuencias de ADN) |
| Licencia | MIT |
| Formato de pesos | no disponible (probablemente safetensors o PyTorch, no confirmado) |

## Arquitectura y entrenamiento

La arquitectura de PlantGeneAnn se basa en PlantBiMoE, un modelo de mezcla de expertos (MoE) diseñado específicamente para genomas de plantas. El modelo incorpora un decodificador de embeddings con estructura U-Net 1D, que permite refinar las predicciones a nivel de nucleotido y capturar dependencias de largo alcance en la secuencia. Segun la documentacion del repositorio, el modelo es capaz de predecir simultaneamente genes codificantes de proteinas, CDS y exones en ambas cadenas del ADN, lo que lo convierte en una herramienta de anotacion estructural completa.

No se dispone de informacion publica sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de aprendizaje por refuerzo (RLHF/DPO). El paper asociado (disponible en biorxiv) describe el modelo como un "genome foundation model" especifico para plantas, pero los detalles de entrenamiento no estan accesibles en la informacion proporcionada. La innovacion principal reside en la combinacion de la arquitectura MoE con el decodificador U-Net, que permite una prediccion precisa de estructuras genicas sin necesidad de evidencia externa.

## Capacidades

- Anotacion ab initio de estructuras genicas en genomas de plantas: predice genes codificantes de proteinas, CDS y exones.
- Prediccion en ambas cadenas (forward y reverse) del ADN.
- Generacion de embeddings genomicos utiles para tareas downstream (por ejemplo, clasificacion de elementos reguladores, comparacion de genomas).
- No se han documentado capacidades de generacion de texto, razonamiento, codigo, vision, tool calling o agentes, ya que es un modelo especializado en biologia molecular.

## Casos de uso

- Anotacion de genomas de especies vegetales recien secuenciadas: PlantGeneAnn puede predecir la estructura genica directamente a partir de la secuencia, sin necesidad de transcriptomas o genomas de referencia, lo que acelera el analisis de especies no modelo.
- Curacion de anotaciones existentes: el modelo puede utilizarse para verificar o refinar anotaciones generadas por metodos basados en homologia, especialmente en regiones donde la evidencia es escasa.
- Estudio de familias genicas: al predecir CDS y exones con precision, facilita la identificacion de variantes estructurales y la comparacion de familias genicas entre especies.
- Generacion de embeddings para aprendizaje automatico: las representaciones internas del modelo pueden alimentar clasificadores para predecir funciones genicas, promotores o sitios de union de factores de transcripcion.
- Analisis de genomas de cultivos: aplicable a la mejora genetica asistida por computacion, permitiendo identificar genes de interes agronomico en genomas de gran tamano.
- Investigacion en genomica comparativa: al anotar multiples genomas de forma consistente, facilita estudios de sintenia y evolucion de genomas vegetales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El paper de biorxiv (10.64898/2026.06.25.733695v1) podria contener metricas de rendimiento, pero no se han extraido en la busqueda. No se proporcionan datos de MMLU, HumanEval u otros benchmarks genericos, ya que el modelo no esta orientado a tareas de lenguaje natural.

## Requisitos de hardware

No se dispone de informacion sobre requisitos de hardware. Dado que se trata de un modelo de mezcla de expertos con decodificador U-Net, es probable que requiera una GPU con al menos 16 GB de VRAM para inferencia, pero este dato no esta confirmado. No se conocen opciones de despliegue especificas (vLLM, llama.cpp, etc.) ni latencias estimadas.

## Comparativa con modelos similares

No se dispone de informacion suficiente para establecer una comparativa con otros modelos de anotacion genica como Helixer, BRAKER o Augustus. Estos metodos tradicionales se basan en aprendizaje supervisado con caracteristicas disenadas manualmente o en pipelines de homologia, mientras que PlantGeneAnn es un modelo fundacional de secuencia completa. Sin embargo, no hay datos publicos de rendimiento comparativo en la informacion proporcionada.

## Limitaciones y advertencias

- No se han documentado sesgos especificos, pero al ser un modelo entrenado probablemente con genomas de plantas, su rendimiento en organismos no vegetales (hongos, animales) no esta garantizado.
- Riesgo de alucinacion en la prediccion de estructuras genicas: como cualquier modelo generativo, puede predecir genes falsos o mal anotados en regiones repetitivas o de baja complejidad.
- La version preview (v2) puede tener limitaciones de estabilidad o precision no documentadas.
- No se dispone de informacion sobre la longitud de contexto maxima, lo que podria limitar su aplicacion a cromosomas completos o regiones muy largas.
- La licencia MIT permite uso comercial, pero se recomienda revisar el paper y el repositorio para conocer posibles restricciones adicionales sobre los datos de entrenamiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/qzzhang/PlantGeneAnn-v2-preview
- Repositorio GitHub: https://github.com/qzzhang0131/PlantGeneAnn/tree/main/
- README del repositorio: https://github.com/qzzhang0131/PlantGeneAnn/blob/main/README.md
- Paper en biorxiv: https://www.biorxiv.org/content/10.64898/2026.06.25.733695v1.full.pdf
- Modelo relacionado (PlantGeneAnn-model-plants): https://huggingface.co/qzzhang/PlantGeneAnn-model-plants
