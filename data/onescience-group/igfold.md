# OneScience-Group/IgFold

## Resumen

IgFold es un modelo de código abierto para la predicción de estructuras tridimensionales de anticuerpos, desarrollado por el Gray Lab y publicado en el repositorio de OneScience-Group. A diferencia de los modelos generalistas de predicción de estructuras de proteínas, IgFold está especializado en anticuerpos, lo que le permite predecir la estructura tridimensional directamente a partir de la secuencia de aminoácidos, sin necesidad de alineamientos múltiples de secuencias (MSA) ni de información de plantillas, aunque también admite plantillas opcionales.

El modelo combina AntiBERTy, un modelo de lenguaje entrenado sobre un gran conjunto de secuencias naturales de anticuerpos, con una arquitectura basada en capas de graph Transformer y un módulo de estructura que utiliza atención de puntos invariante. Esta combinación permite obtener predicciones rápidas y precisas, con una ventaja de velocidad frente a AlphaFold según las fuentes disponibles. IgFold soporta anticuerpos emparejados de cadena pesada y ligera, anticuerpos de cadena simple y nanobodies, y proporciona además valores de RMSD predichos por residuo y representaciones intermedias de la secuencia.

El repositorio incluye un paquete de pesos de aproximadamente 0,1 GB y scripts de inferencia listos para ejecutar. Aunque no se especifica el número total de parámetros, el modelo es ligero y puede ejecutarse en CPU o en aceleradores compatibles con PyTorch, siendo recomendable el uso de GPU para obtener un rendimiento óptimo en la predicción de estructuras.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | AntiBERTy (modelo de lenguaje de anticuerpos) + graph Transformer + modulo de estructura con atencion de puntos invariante |
| Parametros totales | no disponible |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de secuencias de aminoacidos, no de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | other |
| Formato de pesos | no disponible |

## Arquitectura y entrenamiento

IgFold utiliza AntiBERTy, un modelo de lenguaje preentrenado sobre un conjunto masivo de secuencias naturales de anticuerpos (segun la herramienta COSMIC2, se emplearon 558 millones de secuencias), para extraer representaciones de la secuencia de aminoacidos. Estas representaciones se procesan a traves de capas de graph Transformer, que modelan las relaciones espaciales entre residuos, y se integran con caracteristicas de plantillas (templates) cuando se proporcionan. Finalmente, un modulo de estructura basado en atencion de puntos invariante genera las coordenadas tridimensionales de los atomos.

El modelo no utiliza RLHF ni DPO, ya que no es un modelo de lenguaje generativo. La innovacion principal reside en la especializacion en anticuerpos y en la capacidad de predecir estructuras con gran rapidez, sin necesidad de MSA, lo que reduce notablemente el coste computacional en comparacion con metodos generalistas. El entrenamiento se realizo sobre secuencias de anticuerpos naturales, lo que permite capturar las caracteristicas especificas de las regiones variables y constantes de estos dominios.

## Capacidades

- Prediccion de estructuras de anticuerpos emparejados a partir de secuencias de cadena pesada y ligera.
- Prediccion de estructuras de anticuerpos de cadena simple (solo cadena pesada o solo ligera).
- Prediccion de estructuras de nanobodies a partir de la secuencia de la cadena pesada.
- Salida de valores de RMSD predichos por residuo para los atomos N, CA, C y CB, que se escriben en la columna B-factor del archivo PDB generado.
- Extraccion de representaciones intermedias de AntiBERTy, del graph Transformer y del modulo de estructura, utiles para tareas de analisis o aprendizaje posterior.
- Soporte de estructuras de plantillas (template) para mejorar la prediccion.
- Refinamiento estructural mediante PyRosetta o OpenMM.
- Conversion de las estructuras predichas a numeracion Chothia mediante la herramienta AbNumber.

## Casos de uso

- Prediccion de estructuras de anticuerpos para analisis estructural: a partir de secuencias de cadena pesada y ligera en formato FASTA, IgFold genera un archivo PDB que puede utilizarse para estudiar la conformacion del anticuerpo y sus regiones de union a antigeno.
- Desarrollo de nanobodies: el modelo permite predecir la estructura tridimensional de nanobodies a partir de su secuencia de cadena pesada, lo que facilita el diseno y la evaluacion de estas moleculas de interes terapeutico.
- Analisis de errores de prediccion: los valores de RMSD predichos por residuo permiten identificar las regiones de la estructura con menor confianza, informacion valiosa para priorizar experimentos o refinar modelos.
- Extraccion de representaciones de anticuerpos: los embeddings generados por AntiBERTy y el graph Transformer pueden usarse como caracteristicas de entrada en modelos de aprendizaje automatico para clasificacion, clustering o prediccion de propiedades funcionales.
- Refinamiento de estructuras predichas: tras la prediccion inicial, se puede aplicar refinamiento con PyRosetta u OpenMM para mejorar la calidad geometrica y energetica de la estructura, especialmente en estudios de dinamica o docking.
- Estudios de interaccion anticuerpo-antigeno: las estructuras predichas por IgFold pueden emplearse como punto de partida para simulaciones de docking o analisis de interfaces, permitiendo hipotesis sobre el reconocimiento molecular.
- Integracion en pipelines de diseno de anticuerpos: el modelo puede incorporarse en flujos de trabajo de diseno racional para generar y filtrar candidatos antes de la validacion experimental.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La herramienta COSMIC2 indica cualitativamente que IgFold predice estructuras mas precisas que AlphaFold y de forma mas rapida, pero no se aportan cifras concretas en los materiales revisados. Para obtener datos cuantitativos de rendimiento, se recomienda consultar el articulo original publicado en Nature Communications: "Fast, accurate antibody structure prediction from deep learning on massive set of natural antibodies" (2023).

## Requisitos de hardware

- El modelo puede ejecutarse en CPU o en aceleradores compatibles con PyTorch.
- Se recomienda el uso de GPU u otros aceleradores para la prediccion de estructuras, aunque no se especifica la VRAM minima requerida.
- El refinamiento con PyRosetta se ejecuta principalmente en CPU, y el tiempo de ejecucion depende de la longitud de la secuencia y del rendimiento del procesador.
- El tamano del repositorio es de aproximadamente 0,1 GB, lo que sugiere que los pesos son ligeros y pueden cargarse en GPUs de consumo, aunque no se dispone de datos confirmados.
- Las opciones de despliegue incluyen los scripts de inferencia proporcionados en el repositorio, con soporte para entornos GPU y DCU. No se mencionan integraciones especificas con vLLM, llama.cpp, Ollama o TGI, ya que se trata de un modelo de prediccion estructural, no de un modelo de lenguaje.

## Comparativa con modelos similares

| Modelo | Especialidad | Arquitectura | Parametros | Contexto | Licencia |
|---|---|---|---|---|---|
| IgFold | Anticuerpos | AntiBERTy + graph Transformer + modulo de estructura | no disponible | no disponible | other |
| OpenFold | Proteinas generales | Reproduccion de AlphaFold2 (Evoformer, modulo de estructura) | no disponible | no disponible | no disponible |
| AlphaFold2 | Proteinas generales | Evoformer + modulo de estructura | no disponible | no disponible | no disponible |

IgFold se diferencia de OpenFold y AlphaFold2 por su especializacion en anticuerpos y por no requerir MSA, lo que reduce el coste computacional. Sin embargo, no se dispone de datos cuantitativos de parametros ni de benchmarks para realizar una comparacion numerica rigurosa. La herramienta COSMIC2 menciona que IgFold es mas rapido y preciso que AlphaFold en la prediccion de estructuras de anticuerpos, pero esta afirmacion no se acompaña de cifras en la informacion disponible.

## Limitaciones y advertencias

- El modelo esta diseñado exclusivamente para anticuerpos y nanobodies; su aplicacion a proteinas generales no esta soportada.
- La licencia "other" puede imponer restricciones para uso comercial; se debe revisar la licencia completa antes de utilizar el modelo en entornos de produccion.
- La calidad de la prediccion depende de la exactitud de las secuencias de entrada; secuencias erroneas o incompletas pueden producir estructuras poco fiables.
- Los valores de RMSD predichos son estimaciones y no deben interpretarse como errores reales medidos experimentalmente.
- El refinamiento con PyRosetta requiere una instalacion adicional y puede ser computacionalmente costoso, especialmente para secuencias largas.
- El repositorio no especifica el formato de los pesos ni ofrece cuantizaciones, lo que puede limitar la integracion con frameworks de despliegue estandar.
- No se proporcionan benchmarks cuantitativos en la informacion disponible, por lo que la comparacion con otros modelos debe realizarse consultando la literatura cientifica.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/OneScience-Group/IgFold
- Articulo original: https://www.nature.com/articles/s41467-023-38063-x
- Herramienta COSMIC2 que utiliza IgFold: https://cosmic-cryoem.org/tools/igfold/
- Modelo OpenFold de OneScience-Group (relacionado): https://huggingface.co/OneScience-Group/OpenFold
