# minoola/chemberta-zinc-base-v1-ames-mutagenicity

## Resumen

`minoola/chemberta-zinc-base-v1-ames-mutagenicity` es un modelo de la familia RoBERTa publicado en HuggingFace por el usuario `minoola`. Por su identificador, se trata de un modelo derivado de ChemBERTa (variante de RoBERTa preentrenada sobre el corpus quimico ZINC) y ajustado para la tarea de prediccion de mutagenicidad AMES. Sin embargo, la model card publicada no contiene texto alguno mas alla de la declaracion de licencia MIT, por lo que ni el procedimiento de ajuste ni el conjunto de datos de entrenamiento estan documentados en el repositorio.

El modelo cuenta con 44.105.474 parametros y pesos en formato safetensors, con un tamano de repositorio de 0,2 GB. Es, por tanto, un modelo pequeno (rango de decenas de millones de parametros) que puede ejecutarse en CPU o en cualquier GPU de consumo. El repositorio registra 0 descargas y 0 likes en el momento de la consulta, y las marcas temporales de creacion y actualizacion son del 15 de septiembre de 2026.

Su relevancia potencial reside en el nicho de la prediccion de toxicidad temprana en descubrimiento de farmacos: los ensayos AMES son un filtro regulatorio estandar para mutagenicidad bacteriana, y un clasificador ligero sobre representaciones quimicas aprendidas puede integrarse en cribados virtuales de alto rendimiento. No obstante, al carecer de documentacion, de resultados de evaluacion y de cualquier otro artefacto de validacion, debe tratarse como un experimento sin verificar y no como un modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RoBERTa (segun el tag `roberta` del repositorio); variante quimica tipo ChemBERTa segun el identificador del modelo |
| Parametros totales | 44.105.474 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio solo publica pesos en precision original; no se documentan versiones cuantizadas) |
| Idiomas soportados | no disponible (el campo de idiomas esta vacio en el repositorio) |
| Licencia | MIT |
| Formato de pesos | safetensors |

Datos adicionales del repositorio: tamano del repo 0,2 GB, region `us`, pipeline declarado no disponible, 0 descargas, 0 likes.

## Arquitectura y entrenamiento

La unica informacion estructural disponible es el tag `roberta` del repositorio, que indica una arquitectura transformer encoder-only con atencion bidireccional. El recuento de parametros (44,1 millones) es coherente con una configuracion RoBERTa de tamano reducido respecto a las variantes base habituales, aunque no se especifica el numero de capas, cabezas de atencion ni la dimension oculta. El identificador sugiere un vocabulario y una tokenizacion adaptados a notacion quimica (SMILES), herencia del preentrenamiento sobre el corpus ZINC, pero este extremo no esta confirmado en la informacion disponible.

No hay ningun dato publicado sobre el numero de tokens de entrenamiento, la composicion del dataset de ajuste, el regimen de optimizacion, el uso de RLHF o DPO, ni la existencia de una fase de ajuste fino supervisado con cabecera de clasificacion binaria. Tampoco se documentan innovaciones tecnicas como decodificacion especulativa, atencion lineal o estrategias de destilacion. Cualquier afirmacion sobre el proceso de entrenamiento distinta de lo anterior seria especulacion.

## Capacidades

- Clasificacion de moleculas: el nombre del modelo apunta a una tarea de clasificacion binaria (mutagenico / no mutagenico) sobre la salida del ensayo AMES.
- Representaciones de quimica computacional: al derivar de un preentrenamiento tipo ChemBERTa sobre ZINC, es previsible que genere embeddings utiles para moleculas en notacion SMILES, aunque no hay documentacion que lo confirme.
- Generacion de texto: no disponible; se trata de un encoder, no de un modelo generativo.
- Razonamiento, matematicas y codigo: no disponible; fuera del proposito del modelo.
- Vision o audio: no disponible.
- Tool calling / function calling: no disponible.
- Soporte de agentes o razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponibles; el campo de idiomas esta vacio.
- Modo de razonamiento explicito (thinking): no disponible.

## Casos de uso

Debido a la ausencia total de documentacion y de evaluacion, los siguientes casos deben considerarse escenarios hipoteticos a validar internamente antes de cualquier uso:

- Cribado virtual de mutagenicidad: filtrar bibliotecas de compuestos antes de sintetizarlos, priorizando candidatos con baja probabilidad de dar positivo en AMES y reduciendo coste experimental.
- Triaje en descubrimiento temprano de farmacos: descartar scaffolds problematicos en fases de hit-to-lead, donde el coste de sintesis es todavia bajo y el valor del filtrado es alto.
- Enriquecimiento de pipelines QSAR: usar el modelo como descriptor o caracteristica adicional junto a descriptores fisicoquimicos clasicos en un modelo de ensemble.
- Priorizacion de compuestos en quimica medioambiental: evaluar mutagenicidad potencial de sustancias antes de ensayos ecotoxicologicos.
- Analisis de impurezas y metabolitos: estimar el riesgo mutagenico de productos de degradacion para los que no existen datos experimentales.
- Investigacion metodologica: servir como punto de partida para estudiar tecnicas de ajuste fino sobre corpus quimicos ZINC y comparar arquitecturas encoder-only de tamano reducido.
- Extraccion de embeddings para clustering quimico: agrupar familias estructurales a partir de las representaciones internas del modelo en tareas de analisis de espacio quimico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

El repositorio no incluye metricas de validacion (AUC-ROC, precision, recall, F1, sensibilidad ni especificidad) sobre el conjunto de test AMES, ni comparaciones con lineas base. La busqueda web realizada no devolvio ningun resultado relacionado con el modelo.

## Requisitos de hardware

- VRAM estimada en funcion del numero de parametros (44.105.474):
  - fp32: aproximadamente 176 MB solo de pesos.
  - fp16 / bf16: aproximadamente 88 MB.
  - int8: aproximadamente 44 MB.
  - int4: aproximadamente 22 MB.
  - A estas cifras hay que sumar el overhead del runtime (tipicamente entre 200 MB y 1 GB segun framework y tamano de lote).
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM resulta suficiente; una NVIDIA RTX 3060, RTX 4090, T4, A10G, A100 o H100 sirven sobradamente. El modelo es demasiado pequeno para aprovechar GPUs de gama alta.
- Inferencia en CPU: totalmente viable, incluido en portatiles sin GPU dedicada.
- Cabe en GPU de consumo: si, en practicamente todas las GPU de consumo de los ultimos diez anos, e incluso en dispositivos embebidos con suficiente memoria.
- Opciones de despliegue: al ser un modelo RoBERTa en safetensors, es compatible con HuggingFace Transformers. Para lotes grandes o servicio de baja latencia pueden usarse vLLM o TGI, aunque el beneficio respecto a inferencia directa en CPU es marginal dado el tamano. Los formatos GGUF y llama.cpp no son aplicables de forma estandar a un encoder de clasificacion.
- Latencia y throughput estimados: no disponibles. No hay mediciones publicadas en el repositorio.

## Comparativa con modelos similares

La busqueda web proporcionada no devolvio resultados relevantes (unicamente enlaces de gestion de correo ajeno al tema), por lo que no se dispone de datos verificados de modelos comparables en la informacion suministrada.

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| minoola/chemberta-zinc-base-v1-ames-mutagenicity | 44.105.474 | no disponible | Clasificacion AMES (segun identificador) | MIT | HuggingFace |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

Como referencia de categoria, el espacio de modelos quimicos encoder-only incluye propuestas conocidas como ChemBERTa y variantes derivadas de RoBERTa preentrenadas sobre ZINC, pero no se dispone en esta ficha de cifras verificadas de parametros, contexto o rendimiento que permitan una comparacion rigurosa.

## Limitaciones y advertencias

- Ausencia total de model card: el README solo contiene la linea de licencia. No hay descripcion de la tarea, del formato de entrada, del preprocesado de SMILES ni del significado de las etiquetas de salida.
- Sin resultados de evaluacion: no se publica ninguna metrica de validacion ni de test, por lo que el rendimiento real del modelo es desconocido.
- Sin validacion externa reproducible: 0 descargas y 0 likes indican que el modelo no ha sido utilizado ni auditado por terceros.
- Riesgo de sesgo del dataset: los conjuntos AMES presentan fuerte desbalance de clases y sesgos hacia familias quimicas sobrerrepresentadas; sin documentacion no es posible saber si se corrigio.
- Riesgo de uso indebido: no debe emplearse como sustituto de ensayos regulatorios ni para decisiones toxico logicas sin validacion experimental.
- Idiomas no declarados: el campo de idiomas esta vacio; se desconoce el tratamiento de entradas no quimicas.
- Licencia MIT: permite uso comercial, modificacion y redistribucion con atribucion y sin garantia. La licencia no cubre los derechos sobre los datos de entrenamiento originales de ZINC o AMES, que pueden tener sus propias condiciones.
- Metadatos anomales: las fechas de creacion y actualizacion (15 de septiembre de 2026) son posteriores a la fecha actual, lo que debe tenerse en cuenta al evaluar la trazabilidad del repositorio.
- Idoneidad para produccion: no recomendada sin una evaluacion propia exhaustiva, incluida la verificacion de la cabecera de clasificacion y del tokenizador.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/minoola/chemberta-zinc-base-v1-ames-mutagenicity
- Resultados de busqueda web: no se han encontrado enlaces relevantes al modelo (los resultados devueltos corresponden a servicios de gestion de correo y no guardan relacion con el modelo).
- Papers, blogs, repositorios o demos adicionales: no disponible.
