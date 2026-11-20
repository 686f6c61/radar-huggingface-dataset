# mradermacher/gemma-4-E4B-it-uncensored-continued-i1-GGUF

## Resumen

`mradermacher/gemma-4-E4B-it-uncensored-continued-i1-GGUF` es una coleccion de cuantizaciones GGUF del modelo base `AlSamCur123/gemma-4-E4B-it-uncensored-continued`, un fine-tuning sin censura (uncensored) de la familia Gemma 4 en su variante E4B, publicada por el usuario mradermacher, conocido por distribuir versiones cuantizadas de modelos abiertos. El modelo original parte de la arquitectura Gemma 4 de Google y ha sido ajustado para reducir los rechazos y filtros de contenido, orientandose a generacion de texto conversacional en ingles.

El repositorio no contiene pesos en precision completa, sino un conjunto de ficheros GGUF cuantizados con la libreria llama.cpp, incluyendo variantes i1 (imatrix) generadas con el algoritmo de cuantizacion por importancia. El modelo cuenta con 7.518.069.290 parametros totales segun los safetensors del modelo base, lo que lo situa en la categoria de modelos de ~7,5 mil millones de parametros, adecuado para inferencia local en GPUs de consumo con las cuantizaciones mas agresivas.

La relevancia actual radica en que ofrece una alternativa sin censura de un modelo Gemma 4 de tamano medio, empaquetada en multiples formatos GGUF (desde Q2_K hasta Q6_K) para facilitar su despliegue en entornos con recursos limitados mediante llama.cpp, Ollama o servidores compatibles con GGUF. La licencia Apache 2.0 del repositorio facilita su uso comercial, aunque el modelo base hereda las condiciones de Gemma.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (familia Gemma 4, transformer; detalles no especificados en la informacion) |
| Parametros totales | 7.518.069.290 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-Q2_K, i1-Q3_K_S, i1-IQ3_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-IQ4_NL, i1-Q4_0, i1-Q4_K_S, i1-Q4_K_M, i1-Q4_1, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K (mas fichero imatrix) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizaciones i1 con imatrix); el modelo base en safetensors |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna mas alla de que pertenece a la familia Gemma 4 en su variante E4B. No se especifican el numero de capas, la dimension oculta, el mecanismo de atencion ni si incorpora innovaciones como atencion lineal o decodificacion especulativa. El modelo base es un fine-tuning de Gemma 4 E4B orientado a conversacion y etiquetado como "uncensored", lo que implica un ajuste destinado a reducir los rechazos ante peticiones que el modelo original filtraria.

El repositorio de mradermacher no aporta informacion sobre el dataset de entrenamiento, el numero de tokens utilizados, la composicion del corpus ni si se emplearon tecnicas de RLHF, DPO o similar. Tampoco se documenta el proceso de alineacion del modelo base. La unica informacion tecnica concreta es el proceso de cuantizacion: se han generado cuantizaciones i1 (imatrix) con el algoritmo de importancia, partiendo del modelo en formato Hugging Face y convirtiendolo a GGUF, con un fichero imatrix auxiliar de 0,1 GB para que terceros puedan generar sus propias cuantizaciones.

## Capacidades

- Generacion de texto conversacional en ingles, con enfasis en respuestas sin filtros de contenido (uncensored).
- Razonamiento y generacion de codigo: no se documentan capacidades especificas ni benchmarks que las respalden.
- Soporte de tool calling / function calling: no disponible en la informacion.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion.
- Capacidades multilingues: limitadas al ingles segun la etiqueta de idioma del repositorio.
- Capacidades especiales (modo thinking, vision, audio): no disponible en la informacion.

## Casos de uso

- Generacion de texto creativo sin restricciones: el ajuste "uncensored" permite explorar narrativa, guiones o dialogos con tematicas que los modelos alineados suelen rechazar, usando las cuantizaciones Q4_K_M o Q5_K_M para equilibrar calidad y velocidad en una GPU de consumo.
- Prototipado local de asistentes conversacionales: gracias a los ficheros GGUF de 4,5 a 6,3 GB, se puede desplegar en un portatil con GPU de 8 GB mediante llama.cpp u Ollama para pruebas de concepto de chatbots en ingles.
- Investigacion sobre alineacion y censura: comparar las respuestas del modelo sin censura frente al Gemma 4 original permite estudiar el efecto de los ajustes de alineacion en el comportamiento del modelo.
- Generacion de datos sinteticos para fine-tuning: el modelo puede producir corpus de texto en ingles con menos rechazos, util para aumentar datasets de entrenamiento en dominios sensibles.
- Despliegue en entornos con recursos limitados: las cuantizaciones IQ3_S e IQ4_XS (4,8 y 5,2 GB) permiten ejecutar el modelo en GPUs de 6-8 GB o incluso en CPU con llama.cpp, manteniendo un tamano manejable.
- Experimentacion con cuantizacion: el fichero imatrix incluido permite a investigadores generar sus propias cuantizaciones personalizadas y evaluar el impacto de distintas tecnicas en la calidad del modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 4,5 GB para i1-Q2_K, 5,4 GB para i1-Q4_K_M, 5,9 GB para i1-Q5_K_M y 6,3 GB para i1-Q6_K, mas el overhead de contexto y del runtime.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090 24 GB para las cuantizaciones altas; GPUs de 8 GB (RTX 3060 Ti, RTX 4060) suficientes para Q4_K_M.
- Cabe en GPU de consumo: si, en la mayoria de GPUs modernas con 6-8 GB o mas, usando cuantizaciones Q4 o inferiores.
- Opciones de despliegue: llama.cpp, Ollama, servidores compatibles con GGUF (por ejemplo, llama-cpp-python); el repositorio etiqueta text-generation-inference y transformers, aunque el formato GGUF esta orientado a llama.cpp.
- Latencia y throughput estimados: no disponible en la informacion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| gemma-4-E4B-it-uncensored-continued-i1-GGUF (este) | 7.518.069.290 | no disponible | apache-2.0 | GGUF i1 | Fine-tuning uncensored de Gemma 4 E4B, solo ingles |
| gemma-4-E4B-it-uncensored-continued (base) | 7.518.069.290 | no disponible | no disponible | safetensors | Modelo original sin cuantizar |
| gemma-4-E4B-it (original) | no disponible | no disponible | no disponible | no disponible | Version alineada de referencia de la familia Gemma 4 E4B |

No se dispone de datos de benchmarks ni de especificaciones detalladas de los modelos comparables en la informacion proporcionada, por lo que la comparacion se limita a parametros, licencia y formato.

## Limitaciones y advertencias

- El ajuste "uncensored" elimina filtros de seguridad, lo que incrementa el riesgo de generar contenido danino, ofensivo o ilegal; no es adecuado para aplicaciones de cara al publico sin moderacion adicional.
- Riesgo de alucinacion: como cualquier modelo de lenguaje, puede inventar hechos, citas o datos; no se han publicado evaluaciones de fidelidad.
- Limitacion de idioma: el repositorio declara unicamente ingles, por lo que el rendimiento en castellano u otros idiomas no esta garantizado.
- Longitud de contexto no documentada: no se puede confirmar la ventana maxima soportada, lo que limita su uso en tareas de contexto largo.
- Licencia: el repositorio indica apache-2.0, pero el modelo base es un derivado de Gemma 4, cuyos terminos de uso pueden imponer restricciones adicionales no reflejadas en la model card; conviene verificar la licencia del modelo base antes de un uso comercial.
- Sin benchmarks publicados: no hay evidencia cuantitativa de calidad, razonamiento o codigo, por lo que las decisiones de produccion deben basarse en evaluaciones propias.
- El repositorio tiene muy pocas descargas (131) y likes (1), lo que sugiere escasa validacion por parte de la comunidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/gemma-4-E4B-it-uncensored-continued-i1-GGUF
- Modelo base: https://huggingface.co/AlSamCur123/gemma-4-E4B-it-uncensored-continued
- Cuantizaciones estaticas: https://huggingface.co/mradermacher/gemma-4-E4B-it-uncensored-continued-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#gemma-4-E4B-it-uncensored-continued-i1-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico de calidad de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- FAQ y solicitudes de modelos: https://huggingface.co/mradermacher/model_requests
