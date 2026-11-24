# mahwizzzz/kinnow

## Resumen

Kinnow es un corrector ortografico para urdu centrado en errores de palabra real, es decir, palabras que existen en el diccionario pero no encajan en el contexto de la frase (por ejemplo, confundir "اثر" con "عصر" en una oracion sobre la oracion del mercado). Lo desarrolla el autor independiente mahwizzzz y se distribuye bajo licencia MIT en formato ONNX, pensado para ejecucion en dispositivo (on-device). El modelo aborda un punto ciego clasico de los correctores basados en diccionario: la deteccion de sustituciones lexicas plausibles pero semanticamente erroneas.

La arquitectura no es un transformer, sino una red recurrente bidireccional con unidades GRU que lee una ventana de contexto de 16 palabras a la izquierda y 4 a la derecha del token objetivo, y puntua la palabra escrita frente a hasta 8 candidatos generados a partir de 72 grupos de confusion y vecinos a distancia de edicion uno. Solo propone un cambio cuando la diferencia de puntuacion supera un margen calibrado. El vocabulario se limita a 20.000 palabras y el modelo trabaja exclusivamente con escritura urdu.

Su relevancia actual radica en el enfoque de despliegue: un modelo pequeno, en ONNX, ejecutable sin GPU, que prioriza la precision de las correcciones (94,6% en configuracion por defecto) sobre la cobertura, con una tasa de falsos positivos de 1 cada 3.200 palabras. Es una pieza util para integrar en teclados, procesadores de texto o pipelines de preprocesamiento de urdu donde no se dispone de infraestructura de inferencia pesada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GRU bidireccional (red recurrente), no transformer |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 16 palabras a la izquierda + 4 a la derecha del token objetivo |
| Tipos de cuantizacion | no disponible (se distribuye en ONNX; el autor no documenta variantes cuantizadas) |
| Idiomas soportados | urdu (ur) |
| Licencia | MIT |
| Formato de pesos | ONNX (`model.onnx`) con ficheros auxiliares `resources.json` y `policy.json` |

## Arquitectura y entrenamiento

El modelo emplea dos capas de GRU bidireccionales que procesan una ventana de contexto asimetrica: 16 palabras previas y 4 posteriores a la palabra candidata. Para cada token, el sistema genera hasta 8 candidatos de sustitucion combinando 72 grupos de confusion predefinidos (pares o conjuntos de palabras que se confunden habitualmente en urdu) con vecinos a distancia de edicion uno. La red puntua la palabra escrita frente a cada candidato y solo emite una sugerencia de cambio si la diferencia supera un margen calibrado, lo que explica la baja tasa de falsos positivos.

El entrenamiento se realizo sobre la Wikipedia en urdu (dataset `wikimedia/wikipedia`). La model card no detalla el numero de tokens, la composicion exacta del corpus, ni si se aplicaron tecnicas de RLHF o DPO; tampoco se especifica el proceso de calibracion del margen mas alla de las dos politicas publicadas (Default y Balanced). La innovacion principal es el diseno de la ventana de contexto asimetrica y el filtrado por margen, orientados a reducir ediciones erroneas en lugar de maximizar la cobertura.

## Capacidades

- Deteccion y correccion de errores de palabra real en urdu (palabras validas en diccionario pero contextualmente incorrectas).
- Puntuacion contextual de candidatos mediante ventana de 16 palabras a la izquierda y 4 a la derecha.
- Generacion de candidatos a partir de 72 grupos de confusion y vecinos a distancia de edicion uno (hasta 8 candidatos por token).
- Dos politicas de correccion: Default (mayor precision) y Balanced (mayor cobertura).
- Ejecucion on-device mediante ONNX Runtime, sin necesidad de GPU.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es un modelo de etiquetado de tokens (token-classification) especializado.
- No dispone de capacidades multilingues, de vision ni de audio.
- No incorpora modo de razonamiento explicito (thinking mode).

## Casos de uso

- Teclados moviles y de escritorio en urdu: el modelo puede ejecutarse en el propio dispositivo con ONNX Runtime y ofrecer sugerencias de sustitucion en tiempo de escritura, con una tasa de falsos positivos de 1 cada 3.200 palabras que resulta aceptable para no interrumpir al usuario.
- Correccion de textos academicos y periodisticos en urdu: integrado como paso de preprocesamiento, detecta confusiones lexicas que los correctores de diccionario pasan por alto, manteniendo la intervencion humana sobre las sugerencias.
- Preprocesamiento de corpus para entrenamiento de modelos de lenguaje en urdu: limpiar errores de palabra real antes de tokenizar reduce ruido en datasets de Wikipedia, noticias o redes sociales.
- Sistemas de gestion de contenidos (CMS) con revision asistida: el modelo puede marcar candidatos en un editor y dejar que el redactor acepte o rechace cada sugerencia, aprovechando la politica Balanced para maximizar la cobertura.
- Herramientas de accesibilidad y dictado: tras la transcripcion de voz a texto en urdu, el corrector filtra sustituciones homofonas o cuasi-homofonas frecuentes antes de entregar el texto final.
- Filtrado de calidad en pipelines de datos: puntuar documentos y descartar o marcar aquellos con alta densidad de errores de palabra real, usando la salida del modelo como senal de confianza.
- Aplicaciones educativas de aprendizaje de urdu: mostrar al estudiante por que una palabra es incorrecta en contexto, con la ventaja de que el modelo funciona sin conexion y sin coste de inferencia en la nube.

## Benchmarks y rendimiento

| Metrica | Default | Balanced |
|---|---:|---:|
| Precision de las correcciones | 94,6% | 90,7% |
| Errores corregidos | 39,9% | 51,5% |
| Ediciones erroneas | 1 cada 3.200 palabras | 1 cada 1.300 palabras |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. Las cifras anteriores son las unicas reportadas por el autor y corresponden a la evaluacion interna del corrector, no a suites comparativas publicas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; por el tipo de arquitectura (GRU con vocabulario de 20.000 palabras y contexto de 20 tokens) el modelo es muy ligero y cabe holgadamente en memoria de CPU.
- GPU recomendadas: no requiere GPU; puede ejecutarse en CPU mediante ONNX Runtime.
- Compatibilidad con GPU de consumo: si, en cualquier GPU de consumo, aunque no es necesario; el despliegue objetivo es on-device.
- Opciones de despliegue: ONNX Runtime (libreria declarada), con el script `inference/fix.py` incluido en el repositorio; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables de correccion ortografica en urdu ni resultados de benchmarks que permitan una comparacion rigurosa con alternativas de la misma categoria.

## Limitaciones y advertencias

- Vocabulario limitado a 20.000 palabras: cualquier termino fuera de ese lexico no sera corregido ni evaluado.
- Solo cubre escritura urdu; no procesa texto en otros alfabetos ni idiomas.
- Rendimiento debil en concordancia de genero y numero, segun reconoce el propio autor.
- No ha sido probado con errores tipograficos humanos reales; la evaluacion se realizo sobre errores sinteticos derivados de grupos de confusion. El autor recomienda usarlo para sugerencias, no para correccion silenciosa.
- Riesgo de falsos positivos: 1 cada 3.200 palabras en modo Default y 1 cada 1.300 en modo Balanced; en produccion conviene mantener confirmacion humana.
- Cobertura limitada: corrige entre el 39,9% y el 51,5% de los errores segun la politica, por lo que no sustituye a una revision completa.
- Licencia MIT: permite uso comercial y modificacion, pero el modelo se distribuye sin garantias y sin datos de entrenamiento detallados que permitan auditar sesgos del corpus de Wikipedia.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y el tamano reportado es 0.0 GB; conviene verificar la integridad de los artefactos antes de integrarlo en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mahwizzzz/kinnow
- Repositorio GitHub: https://github.com/mwzkhalil/kinnow
- Dataset de entrenamiento: https://huggingface.co/datasets/wikimedia/wikipedia
