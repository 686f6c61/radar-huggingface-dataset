# oaita/gemma-4-E4B-Q4_K_M.gguf

## Resumen

Gemma 4 E4B es un modelo de lenguaje desarrollado por Google, distribuido originalmente con licencia Apache 2.0. Esta ficha corresponde a la conversión a formato GGUF realizada por el usuario oaita, publicada en Hugging Face bajo el identificador `oaita/gemma-4-E4B-Q4_K_M.gguf`. La conversión está pensada para inferencia local mediante llama.cpp y aplicaciones compatibles como OAITA, y emplea la cuantización Q4_K_M con una matriz de importancia (imatrix) para preservar la calidad en los pesos de 4 bits.

El modelo base cuenta con 7.518.069.290 parámetros totales según los datos de safetensors del repositorio, lo que lo sitúa en la gama de 7-8 mil millones de parámetros. El repositorio GGUF ocupa 5,0 GB, coherente con una cuantización de 4 bits. La model card menciona soporte de visión y audio mediante un archivo mmproj separado (`oaita/mmproj-gemma-4-E4B-it-Q8_0.GGUF`), lo que indica que la familia Gemma 4 E4B es multimodal.

La relevancia de esta publicación radica en que permite ejecutar un modelo de la familia Gemma 4 en hardware de consumo mediante llama.cpp, con soporte de aceleración por GPU y un ecosistema de herramientas ya establecido. No obstante, la información pública disponible sobre el modelo base es limitada: la model card del conversor no detalla arquitectura interna, composición del dataset de entrenamiento ni resultados de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gemma 4 (transformer; detalles internos no disponibles) |
| Parametros totales | 7.518.069.290 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (esta publicacion); otras cuantizaciones no disponibles en este repo |
| Idiomas soportados | en (segun tags de la model card); resto no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

La model card identifica el modelo base como `google/gemma-4-e4b` y describe la arquitectura como "Gemma 4", sin aportar detalles sobre el tipo de transformer, el mecanismo de atención, el número de capas o la dimensión de los estados ocultos. El dato de parámetros totales (7.518.069.290) proviene de los safetensors del repositorio y es el único dato estructural verificable. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni sobre si se aplicaron técnicas de RLHF, DPO u otras etapas de alineamiento.

La conversión a GGUF emplea cuantización Q4_K_M con imatrix, una técnica que calcula una matriz de importancia a partir de datos de calibración para asignar más bits a los pesos con mayor impacto en la salida, reduciendo la degradación respecto a una cuantización uniforme de 4 bits. El repositorio incluye además un archivo mmproj en Q8_0 para habilitar las capacidades de visión y audio, lo que sugiere que el modelo base es multimodal nativo o al menos compatible con proyecciones multimodales. No se han publicado detalles sobre innovaciones técnicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto conversacional, según la etiqueta "conversational" del repositorio.
- Soporte multimodal de visión y audio mediante el archivo mmproj separado en Q8_0 (según la model card).
- Compatibilidad con llama.cpp y aplicaciones derivadas como OAITA.
- Compatibilidad con endpoints (etiqueta "endpoints_compatible"), lo que facilita su despliegue como servicio.
- Idiomas: la model card declara únicamente inglés (`en`); no se confirma soporte multilingüe.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Modo de razonamiento explícito (thinking mode): no disponible en la información proporcionada.

## Casos de uso

- Inferencia local en estaciones de trabajo: el archivo Q4_K_M de 5,0 GB cabe en equipos con 16 GB de RAM o en GPUs de consumo con 8 GB o más de VRAM, permitiendo ejecutar el modelo sin conexión a servicios en la nube.
- Asistente conversacional de escritorio: la etiqueta "conversational" y la integración con OAITA permiten desplegar un chat local para tareas de redacción, resumen y preguntas generales en inglés.
- Procesamiento de documentos con imágenes: mediante el mmproj Q8_0, el modelo puede recibir entradas visuales junto con texto, útil para extracción de información de capturas, diagramas o documentos escaneados.
- Transcripción y análisis de audio: el soporte de audio declarado en el mmproj permite integrar el modelo en flujos de resumen de reuniones o análisis de grabaciones, siempre que la herramienta de inferencia gestione la entrada multimodal.
- Prototipado de aplicaciones con llama.cpp: al ser un GGUF compatible con endpoints, sirve para validar pipelines de generación de texto antes de migrar a infraestructura mayor.
- Evaluación comparativa de cuantizaciones: el uso de imatrix en Q4_K_M lo convierte en una referencia útil para medir la pérdida de calidad frente a cuantizaciones de 8 bits o al modelo original en safetensors.
- Despliegue en entornos con requisitos de licencia permisiva: la licencia Apache 2.0 facilita su uso comercial y su integración en productos derivados, sujeto a las condiciones de la licencia del modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 5-6 GB con Q4_K_M, considerando el tamaño del archivo (5,0 GB) y el overhead de contexto y caché KV.
- RAM recomendada: 16 GB o más, según la model card.
- GPU recomendadas: no especificadas por el autor. Por tamaño, el modelo puede ejecutarse en GPUs de consumo como RTX 3060 12 GB, RTX 4060 Ti 16 GB o RTX 4090, así como en A100 o H100 para despliegues de mayor concurrencia.
- Cabe en GPU de consumo: sí, con cuantización Q4_K_M en GPUs con 8 GB o más de VRAM, siempre que el contexto sea moderado.
- Opciones de despliegue: llama.cpp, OAITA y cualquier aplicación compatible con GGUF. Compatibilidad con vLLM, TGI u Ollama no confirmada en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Gemma 4 E4B (esta publicacion, Q4_K_M) | 7.518.069.290 | no disponible | Apache 2.0 | GGUF | Conversion comunitaria con imatrix; vision/audio via mmproj |
| Gemma 4 E4B original (google/gemma-4-e4b) | 7.518.069.290 | no disponible | Apache 2.0 | safetensors | Pesos originales de Google; sin cuantizar |
| Alternativas de ~7-8B | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificables de modelos comparables en la informacion proporcionada |

## Limitaciones y advertencias

- La información pública sobre el modelo base es escasa: no se detallan arquitectura interna, contexto máximo ni datos de entrenamiento, lo que dificulta evaluar su idoneidad para tareas exigentes.
- La model card declara únicamente inglés como idioma soportado; el rendimiento en castellano u otros idiomas no está garantizado.
- Riesgo de alucinación inherente a los modelos generativos de esta escala; no se han publicado evaluaciones de fiabilidad.
- La cuantización Q4_K_M introduce una pérdida de precisión respecto a los pesos originales en safetensors; para tareas sensibles conviene comparar con cuantizaciones de 8 bits o con el modelo base.
- La licencia Apache 2.0 se aplica según la model card, pero se recomienda verificar los términos de la licencia original de Google Gemma 4 antes de uso comercial, ya que la familia Gemma ha tenido históricamente condiciones específicas de uso.
- El soporte de visión y audio requiere descargar y configurar el archivo mmproj por separado; sin él, el modelo funciona solo como generador de texto.
- No se han publicado benchmarks, por lo que no es posible comparar su rendimiento con alternativas de forma objetiva.
- La fecha de creación del repositorio (2026) y el número reducido de descargas (465) y likes (1) indican una adopción limitada y poca validación comunitaria.

## Enlaces

- Repositorio GGUF: https://huggingface.co/oaita/gemma-4-E4B-Q4_K_M.gguf
- Modelo base: https://huggingface.co/google/gemma-4-e4b
- Proyección multimodal (mmproj): https://huggingface.co/oaita/mmproj-gemma-4-E4B-it-Q8_0.GGUF
- Documentación de llama.cpp: https://github.com/ggerganov/llama.cpp
