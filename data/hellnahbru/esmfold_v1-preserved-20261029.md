# hellnahbru/esmfold_v1-preserved-20261029

## Resumen

ESMFold es un modelo de prediccion de estructura de proteinas de extremo a extremo desarrollado por Meta AI (FAIR), construido sobre el backbone del modelo de lenguaje de proteinas ESM-2. A diferencia de AlphaFold2, no requiere alineamiento multiple de secuencias (MSA) ni bases de datos externas de proteinas para realizar predicciones, lo que reduce drasticamente el tiempo de inferencia y simplifica el despliegue en produccion.

Este repositorio concreto (`hellnahbru/esmfold_v1-preserved-20261029`) es una copia preservada del modelo original `facebook/esmfold_v1`, publicada por un tercero bajo licencia MIT. El peso del repositorio es de 8,4 GB, coherente con un modelo de aproximadamente 690 millones de parametros en el backbone ESM-2 y un cabezal estructural de plegamiento. La fecha de creacion del repositorio (octubre de 2026) indica que se trata de una re-publicacion de preservacion, no de un modelo nuevo.

La relevancia de ESMFold radica en que permite predecir estructuras tridimensionales de proteinas a partir de una unica secuencia de aminoacidos en segundos, sin infraestructura de bases de datos, lo que lo hace adecuado para pipelines de alto rendimiento, cribado masivo de secuencias y entornos con recursos limitados. La licencia MIT del repositorio (frente a otras licencias mas restrictivas del original) es un factor a verificar por el usuario antes de uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer ESM-2 (protein language model) con cabezal de plegamiento estructural de extremo a extremo |
| Parametros totales | no disponible (el repositorio ocupa 8,4 GB; el backbone ESM-2 asociado es de ~690M parametros) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de proteinas, no de lenguaje natural) |
| Licencia | MIT |
| Formato de pesos | PyTorch (tags: pytorch) |

## Arquitectura y entrenamiento

ESMFold combina el backbone del modelo de lenguaje de proteinas ESM-2 con un modulo de plegamiento que predice coordenadas atomicas directamente a partir de las representaciones internas del modelo. La innovacion principal es la eliminacion del paso de MSA: en lugar de depender de alineamientos multiples para extraer senales coevolutivas, el modelo aprovecha el conocimiento estructural aprendido durante el preentrenamiento de ESM-2 sobre millones de secuencias de proteinas. Esto permite predicciones de extremo a extremo sin bases de datos externas.

La model card referencia el paper publicado en *Science* (DOI: 10.1126/science.ade2574) para los detalles de arquitectura y entrenamiento. No se proporcionan en la informacion disponible datos concretos sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO (proceso no habitual en modelos de plegamiento). El modelo se distribuye en formato PyTorch y esta etiquetado con la region `us` en HuggingFace.

## Capacidades

- Prediccion de estructura tridimensional de proteinas a partir de una unica secuencia de aminoacidos, sin MSA ni bases de datos externas.
- Inferencia significativamente mas rapida que AlphaFold2 gracias a la eliminacion del paso de busqueda de alineamientos.
- Plegamiento de extremo a extremo: la secuencia de entrada se procesa directamente hasta las coordenadas atomicas.
- Uso como modelo de lenguaje de proteinas subyacente (ESM-2) para representaciones de secuencias, aunque el repositorio esta orientado al plegamiento.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingues de lenguaje natural: es un modelo especializado en biologia estructural.
- No dispone de modo thinking, vision ni audio.

## Casos de uso

- Cribado masivo de secuencias de proteinas: al no requerir MSA ni bases de datos, se pueden procesar miles de secuencias en paralelo en pipelines de alto rendimiento para priorizar candidatos experimentales.
- Anotacion estructural en genomica: prediccion de estructuras para proteinas de genomas recien secuenciados sin necesidad de infraestructura de alineamiento.
- Diseno de proteinas y mutagénesis: evaluacion rapida del impacto estructural de mutaciones puntuales comparando estructuras predichas antes y despues del cambio.
- Docencia y prototipado en bioinformatica: el tutorial notebook oficial permite ejecutar el modelo en Google Colab para experimentacion sin GPU propia.
- Integracion en pipelines de biologa computacional: su rapidez relativa frente a AlphaFold2 lo hace adecuado para etapas de filtrado previo antes de metodos mas costosos.
- Analisis de proteinas huerfanas de MSA: secuencias sin homólogos conocidos, donde los metodos dependientes de alineamiento fallan, son candidatas naturales para ESMFold.
- Generacion de datasets estructurales sinteticos: produccion de estructuras predichas a escala para entrenar o validar otros modelos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente afirma que el tiempo de inferencia es "muy significativamente mas rapido" que AlphaFold2, sin cifras concretas. Para datos de precision estructural (TM-score, RMSD, GDT) debe consultarse el paper referenciado.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada; el repositorio ocupa 8,4 GB, lo que sugiere que la inferencia en precision completa requiere al menos esa cantidad de memoria, y menos con cuantizacion (no documentada).
- GPU recomendadas: no disponible. Por el tamano del backbone (~690M parametros) es plausible su ejecucion en GPUs consumer, pero no se confirma en la informacion.
- Cabe en GPU consumer: no confirmado; el tutorial oficial usa Google Colab, lo que sugiere viabilidad en GPUs de gama media.
- Opciones de despliegue: PyTorch (formato del repositorio); no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponible; solo se indica cualitativamente que es mucho mas rapido que AlphaFold2.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Requiere MSA | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ESMFold (este repo) | no disponible (~690M en backbone ESM-2) | no disponible | No | MIT (segun este repo) | HuggingFace |
| AlphaFold2 | no disponible en esta ficha | no disponible | Si | no disponible en esta ficha | Ampliamente distribuido |
| ESM-2 | no disponible en esta ficha | no disponible | No (es PLM, no plegador) | no disponible en esta ficha | HuggingFace |

La comparativa se limita a los datos disponibles; no se dispone de cifras de rendimiento estructural para contrastar.

## Limitaciones y advertencias

- Modelo especializado en proteinas: no procesa lenguaje natural ni soporta tareas de texto, codigo o vision.
- La precision estructural no esta cuantificada en la informacion disponible; no debe asumirse equivalencia con metodos experimentales.
- Al ser una re-publicacion de un tercero (`hellnahbru`), la integridad de los pesos no esta garantizada por el autor original; conviene verificar hashes frente al repositorio oficial `facebook/esmfold_v1`.
- La licencia MIT declarada en este repositorio debe contrastarse con los terminos del modelo original de Meta AI antes de uso comercial.
- Sin datos sobre sesgos, alucinacion o limitaciones de contexto en la informacion proporcionada.
- El repositorio tiene solo 24 descargas y 0 likes, lo que indica escasa validacion comunitaria.
- No se documentan cuantizaciones ni formatos alternativos de despliegue.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/hellnahbru/esmfold_v1-preserved-20261029
- Paper de referencia: https://www.science.org/doi/10.1126/science.ade2574
- Tutorial notebook oficial: https://colab.research.google.com/github/huggingface/notebooks/blob/main/examples/protein_folding.ipynb
