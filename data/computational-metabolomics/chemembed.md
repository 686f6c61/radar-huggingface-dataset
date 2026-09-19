# computational-metabolomics/chemembed

## Resumen

ChemEmbed es un modelo de embeddings moleculares orientado a metabolomica y espectrometria de masas, publicado por Muhammad Faizan Khan y distribuido en HuggingFace a traves del espacio `computational-metabolomics/chemembed` (release v1.0.1). No es un modelo de lenguaje: se trata de un artefacto quimioinformatico que combina un fichero de modelo (`model_positive.bin`, correspondiente al modo de ionizacion positiva) con una base de datos de referencia de embeddings (`chemembed_reference_mol2vec_300d_520k.parquet`) que, segun el nombre del fichero, contiene representaciones vectoriales de 300 dimensiones para aproximadamente 520 000 compuestos, generadas con un enfoque tipo mol2vec.

El problema que resuelve es el de la representacion vectorial de moleculas para tareas de anotacion, busqueda por similitud y ranking de candidatos en flujos de metabolomica no dirigida. Al disponer tanto del modelo como de la base de datos de referencia empaquetada, permite calcular o consultar embeddings sin reconstruir el pipeline original. Es relevante ahora porque se integra con el ecosistema Galaxy mediante `galaxy-data-manager`, lo que facilita su uso en flujos reproducibles de analisis metabolomico dentro de una plataforma ampliamente adoptada en bioinformatica.

La informacion disponible no documenta arquitectura neuronal detallada, numero de parametros en el sentido habitual de un transformer, ni tamano de contexto. El repositorio ocupa 1,7 GB y comprende tres ficheros: licencia, modelo binario y base de datos Parquet. El propio autor advierte que la licencia MIT se registra por herencia del proyecto upstream y no por una concesion especifica del checkpoint, y que la base de datos de referencia tiene licencia separada CC-BY-4.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible; los nombres de fichero apuntan a embeddings moleculares tipo mol2vec (Word2Vec sobre subestructuras) |
| Parametros totales | no disponible (no se declara un recuento de parametros) |
| Parametros activos | no aplicable (no se indica que sea MoE) |
| Longitud de contexto | no aplicable / no disponible (no es un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo no linguistico) |
| Licencia | MIT para modelo y codigo, con salvedades; base de datos de referencia bajo CC-BY-4.0 |
| Formato de pesos | `.bin` (modelo, `model_positive.bin`) y `.parquet` (base de datos de referencia) |
| Dimension del embedding | 300 (inferido del nombre `..._mol2vec_300d_...`) |
| Tamano de la base de referencia | ~520 000 entradas (inferido del nombre del fichero) |
| Modo de ionizacion | positivo (`model_positive.bin`) |

## Arquitectura y entrenamiento

No se dispone de documentacion tecnica sobre la arquitectura en la informacion proporcionada. El unico indicio estructural es el nombre del fichero de referencia, `chemembed_reference_mol2vec_300d_520k.parquet`, que sugiere el uso de la familia mol2vec (embeddings de tipo Word2Vec entrenados sobre representaciones de subestructuras moleculares) con vectores de 300 dimensiones y una base de compuestos de aproximadamente 520 000 entradas. El fichero `model_positive.bin` corresponde al modo positivo, lo que indica que el artefacto esta especializado por polaridad de ionizacion.

Tampoco se documentan en la informacion disponible el volumen de datos de entrenamiento, la composicion del dataset, la existencia de ajuste fino con RLHF/DPO (no aplicable en principio a este tipo de modelo) ni innovaciones tecnicas concretas. El autor indica que los ficheros son copias byte a byte del release upstream v1.0.1 y que no se ha realizado conversion alguna del modelo; la base de datos de referencia se presenta como una conversion a Parquet de los datos citados en Zenodo (DOI 10.5281/zenodo.14778518).

## Capacidades

- Generacion de embeddings moleculares de 300 dimensiones para compuestos en modo de ionizacion positiva.
- Consulta de una base de referencia empaquetada de aproximadamente 520 000 compuestos precalculados.
- Busqueda por similitud vectorial entre moleculas (vecinos mas cercanos en el espacio de embeddings).
- Soporte de flujos reproducibles dentro de Galaxy mediante la integracion con `galaxy-data-manager`.
- Generacion de texto: no disponible (no es un modelo de lenguaje).
- Razonamiento, codigo o matematicas: no disponible (fuera del ambito del modelo).
- Vision o audio: no disponible.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no aplicable.
- Modo "thinking": no disponible.
- Contexto extenso: no aplicable.

## Casos de uso

- Anotacion de compuestos en metabolomica no dirigida: dados los embeddings de 300 dimensiones del modelo en modo positivo, se puede buscar el vecino mas cercano en la base de referencia de ~520 000 entradas para proponer identidades candidatas a partir de una senal desconocida.
- Ranking de candidatos tras busqueda espectral: en pipelines que ya usan herramientas como SIRIUS o CSI:FingerID, los embeddings pueden emplearse como criterio adicional de reranking de las listas de candidatos generadas por espectro de fragmentacion.
- Agrupacion y deduplicacion de features en LC-MS: agrupar senales coeluyentes o redundantes calculando distancias coseno entre embeddings, reduciendo el numero de features a interpretar manualmente.
- Cribado por similitud de bibliotecas quimicas: indexar los vectores en un indice ANN (FAISS, Annoy) para recuperar compuestos estructuralmente proximos a una molecula de interes dentro de un catalogo interno o publico.
- Integracion en flujos Galaxy reproducibles: desplegar el modelo como parte de un data manager de Galaxy para que grupos de investigacion sin perfil de programacion puedan ejecutar anotaciones de forma estandarizada y trazable.
- Feature engineering para modelos downstream: usar los embeddings como entrada para clasificadores de propiedades quimicas, prediccion de tiempo de retencion o modelos QSAR/QSPR.
- Enriquecimiento de bases de datos internas: proyectar un catalogo propio de compuestos al mismo espacio vectorial de 300 dimensiones para cruzarlo con la referencia publica y detectar solapamientos o huecos de cobertura.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM para inferencia: no aplicable en el caso general; el calculo y la consulta de embeddings no requiere GPU.
- Memoria principal: la base de referencia Parquet y el modelo suman en conjunto un repositorio de 1,7 GB, por lo que conviene disponer de al menos 4 GB de RAM para trabajar con holgura si se cargan en memoria.
- GPU recomendadas: no disponible; no se documenta ningun requisito de GPU. Para busquedas por similitud a gran escala solo seria relevante una GPU si se construye un indice ANN acelerado (por ejemplo, FAISS en GPU).
- Compatibilidad con GPU de consumo: no aplicable; el modelo es ejecutable en CPU.
- Opciones de despliegue: lectura directa con gensim/NumPy/pandas para el fichero `.bin` y el `.parquet`, indexacion con FAISS o Annoy para busqueda aproximada, e integracion como data manager de Galaxy.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone en la informacion proporcionada de datos comparativos (parametros, contexto, rendimiento, licencia o disponibilidad) de otros modelos de embeddings moleculares. El unico referente que puede inferirse es la propia familia mol2vec, mencionada en el nombre del fichero de referencia, pero no se aportan cifras sobre ella.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ChemEmbed (este modelo) | no disponible | no aplicable | no disponible | MIT con salvedades (modelo); CC-BY-4.0 (base de datos) | HuggingFace, release upstream v1.0.1 |
| Alternativas de la misma categoria (mol2vec, ChemBERTa, MoLFormer, CDDD) | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto ni mantiene conversaciones; cualquier uso en ese sentido queda fuera de su ambito.
- Cobertura limitada al modo de ionizacion positivo (`model_positive.bin`); no se documenta un modelo equivalente para modo negativo.
- Licencia ambigua en el propio model card: el mantenedor registra MIT por herencia del proyecto upstream, no por una concesion especifica del checkpoint. El `CITATION.cff` upstream describe ademas un deposito de modelos y datos bajo CC-BY-4.0, y la relacion exacta entre el modelo publicado y ese deposito no esta establecida.
- Divisibilidad de licencias: la base de datos de referencia (`chemembed_reference_mol2vec_300d_520k.parquet`) esta bajo CC-BY-4.0, no bajo MIT; el campo de licencia de la model card no relicencia los datos acompanantes. Para uso comercial hay que atender a ambas licencias y a la atribucion exigida por CC-BY-4.0.
- Los ficheros se distribuyen como copias byte a byte del upstream, sin conversion; cualquier problema de integridad debe verificarse contra los SHA-256 publicados.
- Riesgo de falsos positivos en anotaciones: la similitud en el espacio de embeddings no equivale a identidad estructural; los candidatos deben validarse con evidencia espectroscopica adicional.
- Sesgos de cobertura: el comportamiento del modelo depende de la composicion de la base de referencia de ~520 000 compuestos; clases quimicas poco representadas pueden quedar mal cubiertas. No se documenta la composicion del dataset.
- Sin benchmarks publicados en la informacion disponible, por lo que no es posible cuantificar su rendimiento frente a alternativas.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta, lo que limita la evidencia de uso en produccion por parte de terceros.
- No se documentan versiones cuantizadas ni formatos alternativos de pesos.

## Enlaces

- HuggingFace: https://huggingface.co/computational-metabolomics/chemembed
- Codigo fuente y documentacion upstream: https://github.com/faizanurv/ChemEmbed
- Release upstream v1.0.1: https://github.com/faizanurv/ChemEmbed/releases/tag/v1.0.1
- Licencia del proyecto upstream: https://github.com/faizanurv/ChemEmbed/blob/v1.0.1/LICENSE
- DOI de la base de datos de referencia (Zenodo): https://doi.org/10.5281/zenodo.14778518
- Licencia CC-BY-4.0: https://creativecommons.org/licenses/by/4.0/legalcode

Nota: la busqueda web realizada no devolvio resultados relacionados con este modelo; los enlaces anteriores proceden de la informacion de HuggingFace y de la model card.
