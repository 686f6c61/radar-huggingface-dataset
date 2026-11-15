# SEE7/AstheralTranslate-GGUF

## Resumen

AstheralTranslate es un modelo de traduccion automatica desarrollado por SEE7, publicado originalmente en formato safetensors y distribuido aqui como cuantizaciones GGUF generadas con llama.cpp. Con 1.656.850.432 parametros (aproximadamente 1,66 mil millones), se situa en la gama de modelos ligeros orientados a una tarea concreta: la traduccion entre idiomas. El repositorio que nos ocupa contiene unicamente los pesos cuantizados, no el modelo original ni su model card completa.

La relevancia de esta publicacion radica en su enfoque de despliegue: el autor ha generado cuantizaciones con importancia matrix (imatrix) calibradas sobre un corpus multilingue y de instrucciones propio (AstheralDataset), lo que permite ejecutar el modelo en hardware modesto, desde CPUs hasta GPUs de consumo. La cuantizacion Q4_K_M ocupa aproximadamente 1,045 GB, mientras que las variantes IQ1 e IQ2 bajan hasta los 0,5-0,6 GB, lo que facilita su integracion en entornos con memoria limitada.

No obstante, la informacion publicada es escasa: no se detallan la arquitectura exacta, los idiomas soportados, el volumen de entrenamiento ni resultados de evaluacion. El modelo se distribuye bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones adicionales, y el repositorio incluye un manifest.json con hashes SHA-256 y configuracion de calibracion para verificar la integridad de cada fichero.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo transformer de traduccion, inferido por el tipo de tarea; no confirmado en la informacion) |
| Parametros totales | 1.656.850.432 |
| Parametros activos | no aplica (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-IQ1_S, i1-IQ1_M, i1-IQ2_XXS, i1-IQ2_XS, i1-Q4_K_M (imatrix) |
| Idiomas soportados | no disponible (el corpus de calibracion se describe como multilingue) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo GGUF); el modelo base SEE7/AstheralTranslate se distribuye en safetensors |

## Arquitectura y entrenamiento

La informacion disponible no especifica la arquitectura interna del modelo base. Por el numero de parametros (1,66 mil millones) y la tarea declarada (traduccion), se trata de un transformer de escala pequena, pero no se confirma si emplea atencion estandar, atencion lineal u otra variante. Tampoco se documentan el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de alineacion como RLHF o DPO.

Lo que si se detalla es el proceso de cuantizacion: las versiones GGUF se generaron con llama.cpp (commit `5676dfbe01e7ebe0387913680eee0ed39bf4a363`) usando importancia matrix. Los datos de importancia se recogieron mediante pasadas forward reales sobre una muestra determinista multilingue y de instrucciones del dataset AstheralDataset (revision `9332074b5fdd649fa210353d263dc156e80c3f19`). El manifest.json del repositorio registra el hash del corpus, la configuracion de chunking, los formatos exactos de tensor y los hashes SHA-256 de cada fichero, lo que permite reproducir y verificar el proceso.

## Capacidades

- Traduccion automatica entre idiomas: es la funcion declarada por el nombre del modelo y su modelo base; el conjunto exacto de pares de idiomas no esta documentado.
- Generacion de texto condicionada a instrucciones: el corpus de calibracion incluye muestras de instrucciones, lo que sugiere cierta capacidad de seguir prompts, aunque no se detalla su alcance.
- Procesamiento multilingue: el dataset de calibracion se describe como multilingue, pero no se enumeran los idiomas cubiertos.
- Inferencia en CPU y GPU de gama baja gracias a las cuantizaciones IQ1/IQ2 y Q4_K_M.
- Compatibilidad con endpoints: la etiqueta `endpoints_compatible` indica que el modelo puede servirse a traves de la infraestructura de Inference Endpoints de Hugging Face.
- No se documenta soporte de tool calling, function calling, agentes, vision, audio ni modo de razonamiento extendido (thinking).

## Casos de uso

- Traduccion de documentacion tecnica en pipelines de CI/CD: con la cuantizacion Q4_K_M (~1 GB) el modelo puede desplegarse en un contenedor ligero y traducir ficheros Markdown o mensajes de commit en cada integracion, sin depender de APIs externas.
- Traduccion de contenido web en servidores de bajos recursos: las variantes IQ1/IQ2 (~0,5-0,6 GB) permiten ejecutar el modelo en VPS con poca RAM o en CPUs sin GPU, traduciendo articulos o paginas completas por lotes.
- Preprocesado multilingue de datasets: integrado en un pipeline de limpieza de datos, el modelo puede normalizar textos de origen diverso a un idioma comun antes de alimentar un corpus de entrenamiento mayor.
- Traduccion de soporte al cliente: para empresas que gestionan tickets en varios idiomas, el modelo puede traducir conversaciones entrantes a un idioma de trabajo con latencia baja en hardware de consumo.
- Prototipado de aplicaciones de traduccion en local: desarrolladores que necesitan un motor de traduccion offline para demos o pruebas pueden usar el GGUF con llama.cpp u Ollama sin coste de API.
- Traduccion de subtitulos y transcripciones: el tamano reducido permite procesar ficheros SRT o transcripciones por lotes en una estacion de trabajo, con la cuantizacion Q4_K_M como equilibrio entre calidad y velocidad.
- Evaluacion comparativa de cuantizaciones: el repositorio incluye cinco niveles de cuantizacion, lo que lo hace util como caso de estudio para medir la degradacion de calidad en tareas de traduccion segun el bitrate.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye metricas BLEU, chrF, MMLU ni ninguna otra evaluacion cuantitativa, ni comparaciones con modelos de traduccion de referencia.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin overhead de contexto):
  - i1-IQ1_S: ~0,51 GB
  - i1-IQ1_M: ~0,53 GB
  - i1-IQ2_XXS: ~0,57 GB
  - i1-IQ2_XS: ~0,60 GB
  - i1-Q4_K_M: ~1,05 GB
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM para Q4_K_M con contexto moderado; RTX 3060, RTX 4060, GTX 1660 o superiores son suficientes. Para las variantes IQ1/IQ2 basta con 1-1,5 GB de VRAM.
- Cabe en GPU de consumo: si, en practicamente todas las GPU dedicadas modernas e incluso en iGPUs con memoria unificada suficiente.
- Despliegue: llama.cpp, Ollama, y servidores compatibles con GGUF (por ejemplo, llama-cpp-python o text-generation-webui). No se confirma soporte de vLLM o TGI, que requieren formatos distintos.
- Latencia y throughput: no disponibles. Al tratarse de un modelo de 1,66 mil millones de parametros, se espera una latencia baja en GPU de consumo, pero no hay mediciones publicadas.

## Comparativa con modelos similares

No se dispone de datos de rendimiento del modelo, por lo que la comparacion se limita a caracteristicas estructurales. Se incluyen alternativas de traduccion de escala similar ampliamente conocidas, marcando los campos no verificables.

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| SEE7/AstheralTranslate-GGUF | 1,66 B | no disponible | Apache 2.0 | GGUF | Cuantizaciones imatrix; sin benchmarks publicados |
| Helsinki-NLP/opus-mt-* | ~75-300 M | ~512 tokens | Apache 2.0 / CC-BY 4.0 segun variante | safetensors, PyTorch | Familia especializada por par de idiomas; muy extendida |
| facebook/nllb-200-distilled-600M | 600 M | 1024 tokens | CC-BY-NC 4.0 | safetensors | 200 idiomas; licencia no comercial |
| google/madlad400-3b-mt | 3 B | 1024 tokens | Apache 2.0 | safetensors | 450 idiomas; requiere mas VRAM |

La comparacion de calidad no es posible sin evaluaciones publicadas del modelo AstheralTranslate.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay evidencia publicada de la calidad de traduccion, por lo que no se recomienda su uso en produccion sin una evaluacion propia sobre el dominio objetivo.
- Idiomas no documentados: se desconoce que pares de idiomas cubre y con que calidad; el caracter multilingue del corpus de calibracion no garantiza cobertura del modelo.
- Contexto desconocido: al no documentarse la longitud de contexto, los textos largos pueden truncarse o degradar la traduccion.
- Riesgo de alucinacion y omision: como todo modelo generativo de traduccion, puede omitir fragmentos, inventar contenido o cambiar el registro, especialmente en las cuantizaciones de 1-2 bits.
- Degradacion por cuantizacion: las variantes IQ1 e IQ2 comprimen agresivamente un modelo ya pequeno; es esperable una perdida de calidad frente a Q4_K_M, aunque no cuantificada.
- Modelo base poco documentado: la model card del modelo original no esta incluida en este repositorio, lo que impide conocer datos de entrenamiento, sesgos o limitaciones declaradas por el autor.
- Licencia Apache 2.0: permite uso comercial y modificacion, pero el usuario asume la responsabilidad de verificar el cumplimiento y la calidad en su caso de uso.
- Repositorio sin traccion: cero descargas y cero likes en el momento de la consulta, sin comunidad que haya validado su funcionamiento.

## Enlaces

- Repositorio GGUF: https://huggingface.co/SEE7/AstheralTranslate-GGUF
- Modelo base: https://huggingface.co/SEE7/AstheralTranslate
- Dataset de calibracion: https://huggingface.co/datasets/SEE7/AstheralDataset
- Manifest de cuantizacion: https://huggingface.co/SEE7/AstheralTranslate-GGUF/blob/main/manifest.json
- llama.cpp (herramienta de cuantizacion): https://github.com/ggml-org/llama.cpp
