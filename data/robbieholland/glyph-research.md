# RobbieHolland/Glyph-research

## Resumen

Glyph-research es un repositorio de Hugging Face publicado por el usuario RobbieHolland que contiene un conjunto de autoencoders dispersos (sparse autoencoders, SAE) preentrenados para el proyecto de investigacion clinica Glyph. No es un modelo de lenguaje generativo: no acepta prompts ni produce texto, sino que aprende un diccionario de caracteristicas dispersas a partir de las activaciones internas de otro modelo, con el objetivo de hacer interpretable su representacion interna en un contexto de investigacion clinica.

El repositorio incluye tres checkpoints diferenciados por modalidad segun los nombres de fichero (`sae_image.ckpt`, `sae_findings.ckpt` y `sae_labs.ckpt`), acompanados de `normalization.yaml` (estadisticas de normalizacion de las entradas) e `interpretations.csv` (interpretaciones de conceptos asociadas a las caracteristicas). El autor indica que estos SAE ya se publicaron anteriormente dentro del repositorio `RobbieHolland/HypothesisExtractor`, por lo que este espacio funciona como extraccion o reempaquetado de los pesos preentrenados.

Su relevancia es acotada pero especifica: en el ambito de la interpretabilidad mecanistica aplicada a IA clinica, disponer de diccionarios de caracteristicas separados para imagen, hallazgos radiologicos y laboratorio permite auditar que representaciones internas usa un sistema medico antes de desplegarlo. No obstante, el repositorio no incluye model card detallada, no declara licencia, no especifica el modelo base cuyas activaciones se interpretan y no registra descargas ni valoraciones, por lo que debe tratarse como material de investigacion sin validacion externa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Sparse autoencoder (SAE); detalle de encoder, decoder, funcion de activacion y coeficiente de esparsidad: no disponible |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; depende del modelo base cuyas activaciones se interpretan, que no se identifica en la informacion disponible) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (unico idioma declarado en los metadatos del repositorio) |
| Licencia | no disponible |
| Formato de pesos | PyTorch checkpoint (`.ckpt`, tres ficheros) mas `normalization.yaml` e `interpretations.csv` |
| Tamano del repositorio | 0,2 GB |
| Pipeline declarado | no disponible |
| Dominio de aplicacion | investigacion clinica (imagen, hallazgos radiologicos y laboratorio) |
| Fecha de creacion | 2026-09-27 |
| Fecha de ultima actualizacion | 2026-09-27 |

## Arquitectura y entrenamiento

La informacion disponible confirma unicamente que se trata de sparse autoencoders preentrenados. Un SAE de este tipo es habitualmente un autoencoder de una sola capa oculta con un diccionario sobredimensionado y una restriccion de esparsidad (por ejemplo L1 o top-k) que se entrena sobre las activaciones de una capa concreta de un modelo base, de modo que cada unidad del espacio latente tienda a corresponder a un concepto relativamente monosemantico. Ni la arquitectura exacta, ni la dimension del diccionario, ni la capa o el modelo base sobre el que se extrajeron las activaciones estan documentados en el repositorio.

Los nombres de fichero sugieren tres diccionarios especializados por modalidad: imagen (`sae_image.ckpt`), hallazgos radiologicos (`sae_findings.ckpt`) y laboratorio (`sae_labs.ckpt`). El fichero `normalization.yaml` apunta a que las entradas se normalizan con estadisticas calculadas previamente, y `interpretations.csv` encaja con el flujo habitual de etiquetado automatico de caracteristicas (auto-interpretacion con un modelo de lenguaje seguida de validacion). No hay informacion sobre volumen de datos de entrenamiento, composicion del dataset, uso de RLHF o DPO, ni sobre innovaciones tecnicas como decodificacion especulativa o atencion lineal; ninguna de estas tecnicas es aplicable de forma directa a un SAE.

## Capacidades

- Extraccion de caracteristicas interpretables: descompone activaciones de un modelo base en un conjunto disperso de caracteristicas activables de forma independiente.
- Separacion por modalidad: diccionarios especificos para imagen, hallazgos radiologicos y datos de laboratorio, segun los nombres de los checkpoints.
- Etiquetado de conceptos: el fichero `interpretations.csv` relaciona caracteristicas con interpretaciones textuales, lo que permite inspeccionar que representa cada unidad latente.
- Normalizacion reproducible: `normalization.yaml` documenta las estadisticas de entrada necesarias para reproducir la extraccion de activaciones.
- No es un modelo generativo: no genera texto, no responde a prompts, no realiza razonamiento de multiples pasos ni matemáticas.
- No soporta tool calling, function calling ni orquestacion de agentes.
- Capacidades multilingues: no disponibles; el repositorio declara unicamente ingles.
- Capacidades especiales (modo thinking, vision o audio propias): no disponibles; la componente de vision es indirecta, derivada del modelo cuyas activaciones se interpretan, no del SAE.

## Casos de uso

- Auditoria de un sistema de IA clinica: aplicar los SAE sobre las activaciones del modelo base para identificar que caracteristicas se activan ante cada caso, y detectar si el sistema usa atajos no clinicos (por ejemplo, el marcador de un equipo de radiologia) en lugar de hallazgos patologicos.
- Analisis de sesgos por subgrupo: comparar la activacion de caracteristicas entre cohortes (edad, sexo, origen del estudio) para localizar representaciones que correlacionen con variables demograficas en lugar de con la patologia.
- Curacion y depuracion de datasets clinicos: usar los diccionarios de imagen y hallazgos para agrupar estudios por conceptos activados y detectar duplicados, etiquetas erroneas o estudios fuera de distribucion.
- Monitorizacion en produccion: calcular la tasa de activacion de caracteristicas conocidas en inferencia para alertar de derivas de distribucion cuando llegan estudios con una composicion distinta a la de validacion.
- Investigacion en interpretabilidad comparada: contrastar los tres diccionarios (imagen frente a hallazgos frente a laboratorio) para estudiar como se alinean las representaciones visuales con las textuales y analiticas en un mismo paciente.
- Ensenanza y formacion de equipos clinicos tecnicos: inspeccionar las interpretaciones de `interpretations.csv` como material didactico sobre que aprenden las redes en tareas medicas, siempre con supervision metodologica.
- Red-teaming de modelos medicos: buscar caracteristicas asociadas a contenido sensible o a afirmaciones no verificables y utilizarlas para construir casos adversarios dirigidos.
- Reproducibilidad de investigacion propia: reutilizar los pesos preentrenados del proyecto Glyph como punto de partida en lugar de entrenar SAE desde cero sobre el mismo modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye metricas de reconstruccion, esparsidad, fraccion de varianza explicada, numero de caracteristicas vivas ni evaluaciones de interpretabilidad (por ejemplo, puntuaciones de auto-interpretacion o pruebas de activacion dirigida). Tampoco se documenta el modelo base sobre el que se calcularon las activaciones, por lo que no es posible comparar resultados con otros diccionarios de caracteristicas de forma metodologicamente valida.

## Requisitos de hardware

- VRAM para el propio SAE: no disponible de forma exacta. Como referencia, el repositorio completo ocupa 0,2 GB y contiene tres checkpoints, el YAML y el CSV, de modo que cada SAE individual ocupa previsiblemente decenas de megabytes; un forward pass del encoder requiere mantener en memoria una matriz de dimensiones (dimension del modelo base x tamano del diccionario), lo que en la mayoria de configuraciones publicas se resuelve con menos de 1 GB. Es una estimacion derivada del tamano del repositorio, no un dato publicado.
- VRAM para el sistema completo: el consumo dominante no es el SAE, sino el modelo base cuyas activaciones se extraen, que no se identifica en la informacion disponible. Sin ese dato no puede darse una cifra de VRAM util.
- GPU recomendadas: no disponibles. Cualquier GPU capaz de ejecutar el modelo base es suficiente para anadir el SAE, ya que el coste adicional es despreciable frente a una pasada completa del modelo.
- GPU de consumo: probablemente viable en GPUs de consumo si el modelo base cabe en ellas, pero no puede confirmarse sin conocer el modelo base.
- Opciones de despliegue: los checkpoints `.ckpt` son ficheros de PyTorch y no estan etiquetados con libreria (`transformers`, `safetensors`, `gguf`), por lo que no son cargables directamente con vLLM, llama.cpp, Ollama ni TGI, que estan orientados a modelos generativos. El despliegue previsible requiere codigo propio en PyTorch que cargue el checkpoint y enganche hooks sobre las activaciones del modelo base.
- Latencia y throughput: no disponibles. En terminos relativos, el coste de inferencia del SAE es una multiplicacion matricial dispersa adicional por capa monitorizada, muy inferior al coste del modelo base.

## Comparativa con modelos similares

Los SAE publicos de referencia pertenecen a ecosistemas de interpretabilidad de proposito general; ninguno esta especializado en dominios clinicos con diccionarios separados por modalidad, por lo que la comparacion directa es limitada y varios campos quedan como no disponibles en la informacion proporcionada.

| Recurso | Ambito | Especializacion clinica | Licencia | Disponibilidad de pesos | Datos comparables |
|---|---|---|---|---|---|
| Glyph-research (este repositorio) | SAE sobre activaciones para investigacion clinica | Si (imagen, hallazgos, laboratorio) | no disponible | Tres checkpoints `.ckpt` en Hugging Face | no disponible |
| Gemma Scope (Google DeepMind) | SAE por capa sobre modelos Gemma 2 | No | Licencia de Gemma | Pesos publicos en Hugging Face | no disponible en la informacion proporcionada |
| SAE sobre Claude 3 Sonnet (Anthropic) | Extraccion de caracteristicas en un modelo propietario | No | No aplica a pesos del modelo base | Caracteristicas y visor asociados, no pesos del modelo | no disponible en la informacion proporcionada |
| SAE sobre GPT-2 small (OpenAI) | Analisis de caracteristicas en un modelo pequeno | No | no disponible | Pesos publicos | no disponible en la informacion proporcionada |

No se dispone de datos verificados en la informacion aportada para comparar parametros, tamano de diccionario, metricas de reconstruccion ni rendimiento de interpretabilidad entre estos recursos y el repositorio Glyph-research.

## Limitaciones y advertencias

- Ausencia de licencia: el repositorio no declara licencia, lo que deja en situacion juridica indeterminada cualquier uso, incluido el comercial. Debe contactarse con el autor antes de reutilizar los pesos.
- Model card minima: no se documentan el modelo base, la capa interpretada, la dimension del diccionario, el metodo de esparsidad ni el procedimiento de entrenamiento, lo que impide reproducir o validar los resultados.
- Procedencia de los datos no documentada: al tratarse de investigacion clinica, no hay informacion sobre el origen de las imagenes, informes o analiticas utilizados. Es necesario verificar el cumplimiento de normativa de proteccion de datos y de uso de datos de salud antes de cualquier aplicacion real.
- Riesgo de interpretaciones erroneas: `interpretations.csv` recoge etiquetas de conceptos que, en flujos habituales de auto-interpretacion, se generan automaticamente y pueden ser incorrectas o incompletas. No deben tomarse como evidencia clinica.
- Cobertura limitada al ingles: el unico idioma declarado es `en`, lo que restringe su utilidad sobre informes clinicos en castellano u otras lenguas.
- Sin validacion externa: cero descargas y cero valoraciones en el momento de la consulta; no hay evidencia de uso independiente ni de replicacion de resultados.
- Dependencia de un modelo base no identificado: sin ese dato no puede reproducirse la extraccion de activaciones ni evaluarse la transferibilidad de las caracteristicas.
- No apto para uso clinico directo: es un artefacto de investigacion en interpretabilidad, no un dispositivo medico ni una herramienta de diagnostico.
- Riesgo de falso suelo de seguridad: una tasa de activacion baja en una caracteristica no implica ausencia del fenomeno correspondiente; los SAE presentan caracteristicas muertas y cobertura incompleta del espacio de representaciones.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/RobbieHolland/Glyph-research
- Repositorio previo donde se publicaron originalmente los SAE: https://huggingface.co/RobbieHolland/HypothesisExtractor

Nota: la busqueda web realizada no ha devuelto ningun resultado relacionado con el modelo, el proyecto Glyph ni su autoria; los enlaces obtenidos corresponden a foros y sitios de publicidad sin relacion con el contenido de esta ficha. No se dispone por tanto de papers, blogs, repositorios de codigo ni demos adicionales que enlazar.
