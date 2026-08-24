# nickchen384/Geneformer

## Resumen

Geneformer es un modelo fundacional de tipo transformer desarrollado por el laboratorio de Christina Theodoris en el Instituto Gladstone (UCSF), diseñado específicamente para biología de redes y transcriptómica de célula única. El modelo se entrena de forma auto-supervisada sobre un corpus masivo de transcriptomas humanos de célula única, lo que le permite aprender dinámicas de redes génicas y realizar predicciones sensibles al contexto celular incluso en escenarios con datos limitados. Esta versión en particular, publicada bajo el identificador `nickchen384/Geneformer`, corresponde al modelo Geneformer-V2-316M, la variante más grande de la segunda generación, con 316 millones de parámetros y una ventana de entrada de 4096 genes.

La relevancia de Geneformer radica en que aborda un problema central en biología computacional: la escasez de datos etiquetados para tareas de predicción de redes génicas y clasificación de estados celulares. Gracias a su preentrenamiento sobre ~104 millones de transcriptomas humanos no cancerosos, el modelo codifica una comprensión fundamental de la jerarquía de redes génicas en sus pesos de atención, de forma completamente auto-supervisada. Esto permite su uso tanto en modo zero-shot, por ejemplo para perturbaciones in silico, como mediante fine-tuning con pocos datos etiquetados, superando consistentemente a los métodos tradicionales en una amplia variedad de tareas downstream de relevancia clínica y biológica.

El modelo está disponible bajo licencia Apache 2.0, lo que facilita su adopción tanto en entornos académicos como industriales. Su implementación de referencia se basa en la arquitectura BERT adaptada a datos de expresión génica, y se distribuye en formato safetensors. La publicación original (2021) y las actualizaciones posteriores (2024) documentan aplicaciones validadas experimentalmente, incluyendo la identificación de factores de transcripción críticos y dianas terapéuticas candidatas para cardiomiopatías.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (BERT adaptado a transcriptómica) |
| Parametros totales | 316.354.867 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 4096 genes (input size) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada |
| Idiomas soportados | no aplica (datos de expresion genica, no lenguaje natural) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Geneformer emplea una arquitectura de transformer encoder similar a BERT, adaptada al dominio de la transcriptómica. Cada célula se representa mediante un rank value encoding: los genes se ordenan por su nivel de expresión en esa célula, escalado por su expresión media en todo el corpus de preentrenamiento (Genecorpus-30M para V1, Genecorpus-104M para V2). Este enfoque no paramétrico prioriza los genes que distinguen el estado celular, relegando a los genes housekeeping ubicuos a rangos inferiores, y es robusto frente a artefactos técnicos que puedan sesgar los conteos absolutos de transcritos.

El preentrenamiento se realizó con un objetivo de aprendizaje enmascarado: se oculta el 15% de los genes de cada transcriptoma y el modelo debe predecir qué gen corresponde a cada posición enmascarada, utilizando el contexto de los genes restantes. Este enfoque es completamente auto-supervisado, lo que permite entrenar sobre grandes volúmenes de datos sin necesidad de etiquetas. La versión V2, entrenada en diciembre de 2024, amplía el corpus a ~104 millones de transcriptomas humanos no cancerosos, excluyendo células con alta carga mutacional (como células malignas o líneas inmortalizadas) para evitar un rewire de redes que no pueda interpretarse sin secuenciación genómica acompañante. El vocabulario se limita a ~20.000 genes codificantes de proteínas.

Una innovación destacable es la variante de continual learning sobre ~14 millones de transcriptomas cancerosos, que produce un modelo ajustado al dominio oncológico (Geneformer-V2-104M_CLcancer). Además, los autores han implementado estrategias de cuantización para predicciones eficientes en recursos, y han documentado métodos de aprendizaje multitarea y continuo en publicaciones posteriores.

## Capacidades

- Comprensión de dinámicas de redes génicas: el modelo codifica la jerarquía de redes génicas en sus pesos de atención de forma auto-supervisada, capturando relaciones entre genes que dependen del contexto celular.
- Zero-shot learning: puede aplicarse directamente a tareas como perturbación in silico, sin necesidad de fine-tuning previo, para predecir el efecto de sobreexpresar o silenciar un gen en un tipo celular concreto.
- Fine-tuning con datos limitados: el modelo está diseñado para adaptarse a tareas downstream con pocas muestras etiquetadas, como clasificación de genes o estados celulares, superando a métodos tradicionales.
- Clasificación de células y genes: permite clasificar tipos celulares y predecir la relevancia de genes en contextos específicos, como la identificación de factores de transcripción críticos.
- Descubrimiento de dianas terapéuticas: mediante perturbaciones in silico y fine-tuning con datos de pacientes, puede predecir candidatos terapéuticos, como se demostró en modelos de cardiomiopatía con validación experimental en células iPSC.
- Modelado de cromatina y dinámicas de redes: el modelo ha demostrado mejoras en tareas relacionadas con dinámicas de cromatina y redes reguladoras, tanto en zero-shot como con fine-tuning.
- Multilingüe: no aplica, ya que el modelo opera sobre datos de expresión génica y no sobre lenguaje natural.

## Casos de uso

- Identificación de factores de transcripción críticos: los investigadores pueden usar Geneformer en modo zero-shot para realizar perturbaciones in silico de genes individuales en tipos celulares específicos (por ejemplo, cardiomiocitos) y predecir qué factores de transcripción son esenciales para funciones celulares como la generación de fuerza contráctil. Esto permite priorizar candidatos para validación experimental, reduciendo costes y tiempo.
- Descubrimiento de dianas terapéuticas: con datos limitados de pacientes, el modelo puede fine-tuning para predecir qué genes, al ser modulados, restaurarían un estado celular sano. En el estudio original, esta estrategia identificó dianas para cardiomiopatía que mejoraron la fuerza contráctil en modelos iPSC, lo que sugiere un flujo de trabajo aplicable a otras enfermedades.
- Clasificación de estados celulares en enfermedades: Geneformer puede fine-tuning con datos de expresión de célula única de tejidos enfermos y sanos para clasificar estados celulares patológicos, ayudando a caracterizar la heterogeneidad celular en enfermedades como el cáncer o trastornos degenerativos.
- Análisis de redes reguladoras génicas: el modelo puede utilizarse para inferir redes de regulación génica específicas de tejido o estado celular, aprovechando la jerarquía de redes codificada en los pesos de atención. Esto es útil para comprender mecanismos de diferenciación celular o respuesta a estímulos.
- Predicción de efectos de fármacos: mediante perturbaciones in silico, se puede simular el efecto de fármacos candidatos sobre la expresión génica a nivel de célula única, lo que permite cribar compuestos de forma computacional antes de pasar a ensayos experimentales.
- Modelado de enfermedades con datos escasos: en enfermedades raras o con muestras limitadas, Geneformer permite aprovechar el conocimiento preentrenado de ~104 millones de transcriptomas para hacer predicciones robustas con pocas muestras etiquetadas, algo que los métodos tradicionales no logran.
- Investigación en oncología: la variante ajustada con continual learning sobre células cancerosas (Geneformer-V2-104M_CLcancer) puede aplicarse a la caracterización de microambientes tumorales y a la identificación de vulnerabilidades específicas de células malignas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Los manuscritos asociados reportan mejoras consistentes en una diversa panel de tareas downstream, pero los valores numéricos específicos no se incluyen en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Con 316 millones de parámetros en precisión FP32, el modelo requiere aproximadamente 1,3 GB solo para los pesos, pero la memoria total dependerá del tamaño del batch y la longitud de la secuencia (hasta 4096 genes).
- GPU recomendadas: el modelo es relativamente pequeño en comparación con LLMs modernos, por lo que puede ejecutarse en GPUs de consumo como una RTX 3090 o RTX 4090 (24 GB VRAM). Para fine-tuning o inferencia con batches grandes, se recomienda una GPU con al menos 16-24 GB de VRAM.
- Compatibilidad con consumer GPU: sí, el modelo cabe en GPUs de consumo con 16 GB o más de VRAM, especialmente con cuantización o usando precisiones mixtas.
- Opciones de despliegue: el modelo se distribuye en formato safetensors y puede cargarse con la librería de transformers de HuggingFace. No se mencionan integraciones específicas con vLLM, Ollama o llama.cpp, que están orientados a modelos de lenguaje natural.
- Latencia y throughput: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Geneformer-V2-316M | 316M | 4096 genes | ~104M transcriptomas | Apache 2.0 | HuggingFace |
| Geneformer-V2-104M | 104M | 4096 genes | ~104M transcriptomas | Apache 2.0 | HuggingFace |
| scBERT | ~15M | 2048 genes | ~400K células | MIT | GitHub |
| scGPT | ~100M | 2048 genes | ~33M células | MIT | GitHub |

Geneformer se distingue de alternativas como scBERT y scGPT por su enfoque de rank value encoding, su mayor escala de preentrenamiento (~104M transcriptomas) y su validación experimental en aplicaciones como el descubrimiento de dianas terapéuticas. La licencia Apache 2.0 es más permisiva que las de algunos competidores, y la disponibilidad de variantes con continual learning oncológico amplía su rango de aplicaciones.

## Limitaciones y advertencias

- Sesgos conocidos: el modelo se entrenó exclusivamente con transcriptomas humanos no cancerosos (excepto la variante CLcancer), por lo que su rendimiento puede degradarse en otros organismos o en tejidos con alta carga mutacional.
- Riesgo de alucinación: aunque el modelo no genera lenguaje natural, las predicciones de genes o estados celulares pueden ser incorrectas o no generalizar a contextos no representados en el corpus de entrenamiento. Toda predicción debe validarse experimentalmente.
- Limitaciones de contexto: la ventana de entrada está limitada a 4096 genes, lo que excluye transcriptomas con más genes detectados o requiere un preprocesamiento de selección de genes.
- Restricciones de licencia: la licencia Apache 2.0 permite uso comercial, pero se recomienda revisar las condiciones específicas de la licencia y citar los manuscritos originales en publicaciones derivadas.
- Consideraciones para producción: el modelo no está diseñado para tareas de lenguaje natural y su uso requiere conocimientos especializados en biología computacional y procesamiento de datos de célula única. La reproducibilidad de los resultados depende de la calidad y el preprocesamiento de los datos de entrada.
- Datos de entrenamiento: aunque el corpus incluye una amplia gama de tejidos humanos, puede existir un sesgo hacia tejidos o condiciones bien representadas en la literatura, lo que podría afectar a tejidos menos estudiados.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/nickchen384/Geneformer)
- [Manuscrito original (2021)](https://rdcu.be/ddrx0)
- [Manuscrito V2 (2024)](https://rdcu.be/famFk)
- [Preprint continual learning](https://www.biorxiv.org/content/10.1101/2024.08.16.608180v1.full.pdf)
- [Documentación oficial](https://geneformer.readthedocs.io)
- [Dataset Genecorpus-30M](https://huggingface.co/datasets/ctheodoris/Genecorpus-30M)
- [Dataset Genecorpus-104M](https://huggingface.co/datasets/theodoris-lab/Genecorpus-104M)
- [Geneformer-V2-104M (NVIDIA)](https://huggingface.co/nvidia/geneformer_V2_104M)
- [Geneformer-V2-316M (NVIDIA)](https://huggingface.co/nvidia/geneformer_V2_316M)
- [Repositorio GitHub de referencia](https://github.com/jkobject/geneformer)
- [Integración con Helical](https://github.com/helicalAI/helical/blob/release/helical/models/geneformer/README.md)
