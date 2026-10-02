# Shirley04/hw1-hc3-detector

## Resumen

El modelo `Shirley04/hw1-hc3-detector` es un clasificador binario de texto en ingles entrenado para distinguir respuestas escritas por personas de respuestas generadas por ChatGPT. Se construye mediante ajuste fino supervisado sobre `sentence-transformers/all-MiniLM-L6-v2`, un encoder transformer compacto de 22.713.986 parametros, y se publica bajo la libreria `transformers` con la etiqueta de pipeline `text-classification`. El problema que aborda es acotado pero relevante: la deteccion de texto sintetico en un dominio concreto (respuestas de tipo pregunta-respuesta, el corpus HC3).

El interes practico del modelo no reside en su tamano -es un fine-tune pequeno, de 0,1 GB de repositorio- sino en el resultado declarado por el autor: una exactitud de 0,9904 en el conjunto de test, frente a 0,8449 de una linea base de embeddings congelados mas regresion logistica. La mejora es notable y esta documentada con el desglose de errores, algo poco habitual en modelos de este tipo. Es, por tanto, un candidato util como componente de prefiltrado barato en pipelines de moderacion o de limpieza de corpus.

Ahora bien, la ficha publicada por el autor es extremadamente limitada: no declara licencia, no declara idiomas soportados, no incluye model card extendida ni datos sobre sesgos, y no hay resultados de benchmarks mas alla de la exactitud en su propio split de test. Ademas, el repositorio tiene 0 descargas y 0 "likes" en el momento de la consulta, sin senales de validacion independiente por parte de la comunidad. Todo uso en produccion deberia ir precedido de una evaluacion propia sobre datos del dominio objetivo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (BERT-style) destilado; modelo base `sentence-transformers/all-MiniLM-L6-v2` |
| Parametros totales | 22.713.986 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 256 tokens como longitud maxima de secuencia en entrenamiento; no se declara contexto adicional |
| Tipos de cuantizacion | No disponible (solo se publican pesos en safetensors; no hay versiones GGUF, ONNX ni cuantizadas en el repositorio) |
| Idiomas soportados | No disponible (el corpus HC3 empleado y la model card estan en ingles, pero el autor no declara cobertura idiomatica) |
| Licencia | No disponible |
| Formato de pesos | safetensors (libreria `transformers`) |

## Arquitectura y entrenamiento

La arquitectura es la de un encoder transformer de tipo BERT, heredada integramente del modelo base `sentence-transformers/all-MiniLM-L6-v2`. MiniLM-L6-v2 es un modelo destilado de la familia MiniLM, con seis capas y 384 dimensiones ocultas segun la documentacion publica del modelo base, y cuyo unico cambio respecto a la cabeza original es la sustitucion por una cabeza de clasificacion de secuencia con dos etiquetas: `0` para respuesta escrita por una persona y `1` para respuesta generada por ChatGPT. El repositorio pesa 0,1 GB, coherente con un checkpoint de 22,7 millones de parametros.

El procedimiento de ajuste fino esta descrito con detalle en la model card: cinco epocas, tamano de lote 32, tasa de aprendizaje 2e-5, optimizador AdamW, semilla aleatoria 42 y longitud maxima de secuencia de 256 tokens. El punto metodologicamente mas solido es la estrategia de particion del corpus HC3: el split se hizo por identificador de pregunta, de modo que las respuestas asociadas a una misma pregunta no aparecen repartidas entre entrenamiento, validacion y test. Esto evita la fuga de informacion tipica en clasificacion de texto y hace que la exactitud reportada sea mas creible que la de un split aleatorio por ejemplo. No se menciona en la informacion disponible el uso de RLHF, DPO ni ninguna fase de alineacion adicional, algo esperable en un clasificador de este tipo.

## Capacidades

- Clasificacion binaria de texto en dos clases: respuesta humana (etiqueta 0) y respuesta generada por ChatGPT (etiqueta 1).
- Devuelve una probabilidad por clase a traves de la pipeline `text-classification` de `transformers`.
- Funciona sobre fragmentos de hasta 256 tokens; los textos mas largos requieren truncado o troceado previo.
- Compatible con despliegue en Hugging Face Text Embeddings Inference (etiqueta `text-embeddings-inference`) y con endpoints compatibles (etiqueta `endpoints_compatible`).
- Capacidad de ejecucion en CPU por su tamano reducido, sin necesidad de GPU.
- No dispone de tool calling, function calling ni soporte de agentes.
- No dispone de modo de razonamiento explicito (thinking mode), vision, audio ni generacion de texto.
- Capacidades multilingues: no declaradas. El entrenamiento se realizo sobre el subconjunto en ingles del corpus HC3.

## Casos de uso

- Prefiltrado de corpus para entrenamiento: antes de etiquetar manualmente un gran volumen de respuestas recopiladas de foros, el modelo puede separar de forma automatica los fragmentos probablemente generados por ChatGPT y reducir el trabajo humano a una fraccion del total. Es adecuado por su coste de inferencia minimo y su tamano de 22,7 millones de parametros.
- Moderacion de contenido en plataformas de pregunta y respuesta: integrado como primera etapa de un pipeline, permite marcar respuestas sospechosas de ser sinteticas y derivarlas a revision humana o a un modelo mayor mas costoso. El coste por peticion es muy bajo frente a un LLM generativo.
- Investigacion sobre deteccion de texto generado: sirve como punto de comparacion reproducible frente a otras aproximaciones (embeddings congelados mas regresion logistica, detectores basados en RoBERTa) gracias a que el autor publica la configuracion completa de entrenamiento y el desglose de errores.
- Auditoria de contaminacion de datasets: en la construccion de conjuntos de evaluacion academicos, el modelo puede usarse para detectar si una porcion de las respuestas recopiladas procede de asistentes conversacionales en lugar de fuentes humanas.
- Analisis linguistico comparativo humano frente a IA: etiquetar grandes volumenes de texto permite estudiar diferencias de estilo, longitud o estructura entre respuestas humanas y respuestas de ChatGPT en un dominio concreto, con la etiqueta del modelo como variable de agrupacion.
- Herramienta de apoyo docente con cautela: en entornos educativos puede emplearse como indicador auxiliar para revisar entregas, siempre que el resultado se trate como una senal probabilistica y nunca como prueba concluyente, dado que el propio autor advierte de la dependencia del dominio.
- Despliegue en entornos con recursos limitados: por su tamano, puede ejecutarse en el mismo servidor que la aplicacion principal, en CPU, sin GPU dedicada ni servicio externo, lo que simplifica la integracion en arquitecturas de microservicios.

## Benchmarks y rendimiento

Los unicos resultados publicados son los de la model card, medidos sobre el split de test del corpus HC3 empleado por el autor. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

| Enfoque | Exactitud en test |
|---|---|
| Embeddings congelados + regresion logistica | 0,8449 |
| MiniLM ajustado (este modelo) | 0,9904 |

Desglose de errores declarado por el autor sobre 4.668 ejemplos de test:

| Metrica | Valor |
|---|---|
| Numero total de errores | 45 |
| Respuestas humanas clasificadas como ChatGPT (falsos positivos de la clase 0) | 45 |
| Respuestas de ChatGPT clasificadas como humanas (falsos negativos de la clase 1) | 0 |
| Exactitud | 0,9904 |

El patron de error es asimetrico y conviene subrayarlo: todos los fallos son respuestas humanas marcadas como generadas por ChatGPT, mientras que ninguna respuesta de ChatGPT paso el filtro. En un uso de moderacion esto implica riesgo de sancionar texto humano legitimo.

## Requisitos de hardware

- VRAM estimada: aproximadamente 91 MB en fp32 y 45 MB en fp16 si se calcula a partir de los 22,7 millones de parametros. No se publican cifras oficiales de consumo.
- GPU recomendadas: no se especifican. Cualquier GPU con al menos 1 GB de memoria libre es mas que suficiente; el modelo no necesita aceleradores de datacenter como A100 o H100.
- Cabe en cualquier GPU de consumo, incluida la gama de entrada (GTX 1050, GTX 1650, RTX 3050 y superiores). Tambien se ejecuta en CPU sin problema, e incluso en dispositivos de borde con memoria muy limitada.
- Opciones de despliegue: `transformers` con la pipeline `text-classification`, Hugging Face Text Embeddings Inference (la etiqueta del repositorio lo indica), endpoints compatibles de Hugging Face, y servidores de inferencia propios mediante TorchScript o ONNX tras conversion manual. No hay pesos GGUF publicados, por lo que su uso directo en `llama.cpp` u `Ollama` requeriria una conversion previa no documentada.
- Latencia y throughput: no disponibles. El autor no publica mediciones de latencia ni de peticiones por segundo.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de los modelos alternativos en la informacion recopilada, por lo que la comparacion se limita a caracteristicas estructurales y de disponibilidad.

| Modelo | Parametros | Contexto | Rendimiento publicado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Shirley04/hw1-hc3-detector` | 22.713.986 | 256 tokens (entrenamiento) | 0,9904 de exactitud en HC3 test | No disponible | 0 descargas, 0 likes en la fecha de consulta |
| `Hello-SimpleAI/chatgpt-detector-roberta` | No disponible (modelo base: RoBERTa) | No disponible | No disponible en la informacion recopilada | No disponible en la informacion recopilada | Repositorio activo dentro del proyecto `chatgpt-comparison-detection` |
| `Aishkrish/hw1-hc3-detector` | No disponible | No disponible | No disponible | No disponible | Publicacion en Hugging Face con el mismo nombre de modelo |
| `shichenghu/hw1-hc3-detector` | No disponible | No disponible | No disponible | No disponible | Publicacion en Hugging Face con el mismo nombre de modelo |

La coincidencia exacta del nombre `hw1-hc3-detector` en tres cuentas distintas (Shirley04, Aishkrish, shichenghu) sugiere que se trata de trabajos derivados de un mismo ejercicio academico o de una replicacion del mismo procedimiento, no de desarrollos independientes. Conviene verificar cual de los tres checkpoints se esta descargando.

## Limitaciones y advertencias

- Dependencia fuerte del dominio: el autor advierte explicitamente de que el modelo se entreno y evaluo sobre HC3, por lo que su rendimiento depende de los patrones de escritura de ese corpus. No debe extrapolarse a otros dominios, registros ni plataformas.
- No detecta modelos mas recientes: la propia model card senala que el resultado no debe interpretarse como evidencia de que el modelo pueda detectar texto de modelos de lenguaje posteriores a ChatGPT en el momento de la recopilacion de HC3.
- Sesgo asimetrico en los errores: los 45 errores del conjunto de test son todos respuestas humanas clasificadas como generadas por IA, con cero falsos negativos en la clase ChatGPT. En produccion, esto se traduce en riesgo de acusar falsamente a personas.
- Riesgo de alucinacion: no aplica en el sentido generativo, ya que el modelo no produce texto. Sin embargo, si puede devolver probabilidades altas y equivocadas sobre textos fuera de distribucion, que es un riesgo funcionalmente equivalente.
- Limitacion de contexto: la longitud maxima de secuencia es de 256 tokens. Textos mas largos deben truncarse o dividirse, y el truncado puede alterar la prediccion.
- Idiomas: no se declaran idiomas soportados. No hay evidencia de que funcione en castellano ni en ningun idioma distinto del ingles.
- Licencia no declarada: al no especificar licencia, no existe permiso explicito de uso, modificacion ni redistribucion. Para uso comercial es imprescindible contactar con el autor. El modelo base `all-MiniLM-L6-v2` se publica bajo Apache 2.0 segun su propia ficha, pero eso no determina la licencia de este fine-tune.
- Falta de validacion externa: 0 descargas y 0 likes en la fecha de consulta, sin evaluaciones independientes publicadas.
- Sin datos de sesgo: no se ha publicado ningun analisis de sesgo por genero, origen, variedad dialectal u otros ejes.
- Fechas de publicacion y actualizacion del repositorio: 1 de octubre de 2026 y 1 de octubre de 2026 respectivamente, segun los metadatos de Hugging Face. Conviene verificar la coherencia de estos datos con el estado real del repositorio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Shirley04/hw1-hc3-detector
- Modelo base: https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2
- Repositorio del proyecto HC3 y detectores de SimpleAI: https://github.com/Hello-SimpleAI/chatgpt-comparison-detection/tree/main/detect
- Organizacion SimpleAI en GitHub: https://github.com/Hello-SimpleAI
- Publicacion con el mismo nombre en Hugging Face (Aishkrish): https://huggingface.co/Aishkrish/hw1-hc3-detector
- Publicacion con el mismo nombre en Hugging Face (shichenghu): https://huggingface.co/shichenghu/hw1-hc3-detector
- Ficha de registro en free2aitools: https://free2aitools.com/model/shichenghu/hw1-hc3-detector
