# egcastro/ReLSO

## Resumen

ReLSO es un modelo de inteligencia artificial desarrollado por el equipo de Smita Krishnaswamy en la Universidad de Yale, presentado en el artículo "Transformer-based protein generation with regularized latent space optimization" publicado en Nature Machine Intelligence en 2022. Se trata de un autoencoder variacional (VAE) basado en arquitectura Transformer, entrenado específicamente para modelar la relación entre secuencia de proteínas y su función o fitness. Su principal innovación consiste en regularizar el espacio latente durante el entrenamiento para que sea suave y estructurado, lo que permite realizar optimización mediante ascenso por gradientes directamente sobre ese espacio latente.

El modelo resuelve el problema del diseño de proteínas asistido por computadora: dado un conjunto de secuencias etiquetadas con valores de fitness, ReLSO aprende un codificador que proyecta las secuencias a un espacio latente donde la función de fitness es continua y diferenciable. A partir de ahí, se pueden generar nuevas secuencias proteicas con propiedades mejoradas mediante gradientes ascendentes. Su relevancia actual radica en la creciente demanda de métodos de diseño de proteínas de novo, especialmente en biotecnología, farmacología y biología sintética. El repositorio de HuggingFace contiene los pesos del modelo en formato PyTorch, con un tamaño de 2,3 GB. Los detalles exactos del número de parámetros, la longitud de contexto y los idiomas soportados no están disponibles en la información proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer-based VAE (autoencoder variacional regularizado) |
| Parametros totales | no disponible |
| Parametros activos | no aplicable |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de secuencias de proteinas, no textual) |
| Licencia | Apache-2.0 |
| Formato de pesos | PyTorch (archivos .ckpt) |

## Arquitectura y entrenamiento

ReLSO combina un codificador Transformer con un espacio latente regularizado y una cabeza de prediccion de fitness. El entrenamiento se realiza de forma conjunta mediante una funcion de perdida que incluye la reconstruccion de la secuencia (como en un VAE estandar) y la prediccion del fitness, junto con un termino de regularizacion que suaviza el espacio latente. Esta regularizacion es la clave del metodo: fuerza a que secuencias cercanas en el espacio latente tengan fitness similares, lo que crea un "paisaje de fitness" continuo y diferenciable.

El modelo se entrena sobre datasets de mutagenesis masiva con datos de fitness etiquetados. En el repositorio se mencionan disponibles los conjuntos de datos 'gifford', 'gb1' y 'gfp'. Tambien se ofrecen varias configuraciones de entrenamiento ('all', 'neg', 'interp', 'vanilla', 'alpha0', 'alpha_01', 'alpha_05', 'cnn'), que probablemente corresponden a variaciones en la funcion de perdida o en el tipo de regularizacion. El proceso de optimizacion posterior al entrenamiento consiste en realizar ascenso por gradientes en el espacio latente, partiendo de una secuencia inicial y maximizando la prediccion de fitness del decodificador. No se indica si se empleo RLHF, DPO ni tecnicas de alineacion similares, ya que no es un modelo de lenguaje natural.

## Capacidades

- Generacion de secuencias de proteinas optimizadas mediante ascenso por gradientes en el espacio latente.
- Prediccion de fitness de secuencias proteicas, lo que permite evaluar rapidamente variantes sin experimentos de laboratorio.
- Modelado del paisaje de fitness de proteinas a partir de datos de mutagenesis masiva.
- Soporte para tres datasets preentrenados: gifford, gb1 y gfp.
- Capacidad de generar proteinas con propiedades mejoradas de forma eficiente, reduciendo el numero de experimentos necesarios.
- Representacion latente regularizada que mejora la generalizacion frente a estrategias de entrenamiento tradicionales.
- No soporta tool calling, agentes ni procesamiento de lenguaje natural, ya que opera exclusivamente sobre secuencias aminoacidicas.

## Casos de uso

- Diseno de enzimas industriales: ReLSO puede optimizar la secuencia de una enzima existente para mejorar su actividad catalitica o su estabilidad termica. El investigador introduce una secuencia inicial, realiza ascenso por gradientes en el espacio latente y obtiene variantes con mayor fitness predicho.
- Ingenieria de anticuerpos: el modelo puede explorar el espacio de secuencias de la region variable de un anticuerpo para mejorar su afinidad por un antigeno concreto, reduciendo el numero de candidatos a validar experimentalmente.
- Evolucion dirigida asistida por IA: en lugar de realizar rondas de mutacion y seleccion en laboratorio, ReLSO permite simular multiples generaciones de evolucion in silico, acelerando el proceso de optimizacion de proteinas.
- Descubrimiento de proteinas con nueva funcion: partiendo de una secuencia sin actividad conocida, el modelo puede generar variantes que presenten una funcion deseada, siempre que existan datos de fitness suficientes para el entrenamiento.
- Mejora de proteinas terapeuticas: para proteinas como citoquinas o factores de crecimiento, ReLSO puede identificar mutaciones que incrementen la estabilidad o reduzcan la inmunogenicidad, manteniendo la actividad biologica.
- Prediccion de efectos de mutaciones: el modelo puede evaluar rapidamente el impacto de mutaciones puntuales en el fitness de una proteina, util para priorizar variantes en diseno racional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El articulo original en Nature Machine Intelligence presenta evaluaciones en los tres datasets mencionados, pero los valores concretos no estan incluidos en la informacion proporcionada. No se pueden extraer metricas numericas especificas sin consultar el paper completo.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio tiene un tamano de 2,3 GB, lo que sugiere que los pesos del modelo pueden cargarse en una GPU con al menos 6-8 GB de memoria, pero no se confirma en la documentacion.
- GPU recomendadas: no especificadas. Dado que es un modelo PyTorch de tamano moderado, una GPU consumer como una RTX 3060 o superior podria ser suficiente para la inferencia, aunque no se proporcionan datos oficiales.
- Si cabe en consumer GPU: probablemente, dado el tamano del repositorio, pero no hay confirmacion explicita.
- Opciones de despliegue: el modelo se usa mediante el repositorio de GitHub asociado, cargando los checkpoints desde archivos .ckpt con la libreria `relso`. No se mencionan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No disponible. No se ha proporcionado informacion sobre modelos comparables en la busqueda web. ReLSO pertenece a una categoria especifica de modelos de diseno de proteinas basados en VAE con optimizacion de espacio latente, y no se dispone de datos sobre alternativas equivalentes en la informacion facilitada.

## Limitaciones y advertencias

- Dependencia de datos de fitness etiquetados: el modelo requiere datasets de mutagenesis masiva con valores de fitness experimentales. Sin datos suficientes, la calidad del espacio latente y de las predicciones se degrada.
- Sesgos inherentes a los datos de entrenamiento: si los datasets estan sesgados hacia ciertos tipos de proteinas o mutaciones, el modelo puede no generalizar bien a proteinas fuera de ese dominio.
- Riesgo de alucinacion en secuencias generadas: como todo modelo generativo, ReLSO puede producir secuencias que no sean funcionales o no se plieguen correctamente, aunque el fitness predicho sea alto. La validacion experimental sigue siendo obligatoria.
- Limitaciones de contexto: al operar sobre secuencias de aminoacidos, no es aplicable a tareas de lenguaje natural ni a otros dominios biologicos como el diseno de acidos nucleicos.
- Restricciones de licencia: la licencia Apache-2.0 permite uso comercial sin restricciones significativas, pero los datos de entrenamiento originales pueden tener licencias propias que limiten su redistribucion.
- Ausencia de informacion tecnica: el numero de parametros, el contexto y los requisitos de hardware no estan documentados en la informacion disponible, lo que dificulta la evaluacion previa de recursos.

## Enlaces

- HuggingFace: https://huggingface.co/egcastro/ReLSO
- Repositorio de GitHub: https://github.com/KrishnaswamyLab/ReLSO-Guided-Generative-Protein-Design-using-Regularized-Transformers/tree/main
- Paper en arXiv: https://arxiv.org/abs/2201.09948
- Paper en Nature Machine Intelligence: https://www.nature.com/articles/s42256-022-00532-1
- Pagina del paper en HuggingFace: https://huggingface.co/papers/2201.09948
