# mradermacher/ZwZ-2B-GGUF

## Resumen

ZwZ-2B-GGUF es una colección de cuantizaciones estáticas en formato GGUF del modelo inclusionAI/ZwZ-2B, realizadas por el cuantizador mradermacher. El modelo base, ZwZ-2B, es un modelo vision-language (visión-lenguaje) de 2.031.739.904 parámetros (aproximadamente 2B) desarrollado por inclusionAI, especializado en razonamiento visual. Según los tags del repositorio, el modelo fue entrenado con aprendizaje por refuerzo (concretamente GRPO, Group Relative Policy Optimization) utilizando los datasets ZoomBench y ZwZ-RL-VQA, ambos de inclusionAI, lo que sugiere un enfoque en tareas de respuesta a preguntas visuales (VQA) que requieren razonamiento sobre detalles finos de las imágenes.

La relevancia de esta ficha radica en la disponibilidad del modelo en formato GGUF, que permite ejecutarlo localmente en hardware de consumo mediante llama.cpp, Ollama u otras herramientas compatibles. El repositorio incluye además los archivos mmproj (suplemento multimodal) en Q8_0 y f16, necesarios para que el procesador de vision funcione en llama.cpp. Con cuantizaciones desde Q2_K (1,0 GB) hasta f16 (4,2 GB), el modelo es accesible incluso para GPUs modestas o ejecución en CPU.

Cabe destacar que este repositorio es una cuantización de terceros: no contiene documentación técnica del modelo base más allá de los metadatos (tags, datasets y licencia), por lo que varios datos técnicos concretos (arquitectura detallada, longitud de contexto, benchmarks) no están disponibles en la información proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer vision-language (detalles no disponibles); incluye proyector multimodal (mmproj) |
| Parametros totales | 2.031.739.904 (aprox. 2,03B, dato real de safetensors) |
| Parametros activos | no disponible (no hay indicios de que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16; mmproj en Q8_0 y f16 |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (cuantizado desde safetensors del modelo base) |

## Arquitectura y entrenamiento

El modelo base, inclusionAI/ZwZ-2B, es un modelo multimodal de vision-language de aproximadamente 2B de parametros. La presencia de archivos mmproj en el repositorio GGUF confirma que sigue el patron habitual de estos modelos: un backbone de lenguaje (LLM) acompanado de un codificador visual y un proyector multimodal que alinea las representaciones visuales con el espacio del modelo de lenguaje. Los detalles concretos del backbone, el codificador de vision y la longitud de contexto no estan disponibles en la informacion proporcionada.

Respecto al entrenamiento, los tags del repositorio indican el uso de reinforcement-learning y grpo (Group Relative Policy Optimization), una tecnica de aprendizaje por refuerzo popularizada por DeepSeek que optimiza el modelo comparando salidas de un grupo de respuestas sin necesidad de un modelo de recompensa entrenado aparte. Los datasets de entrenamiento mencionados son inclusionAI/ZoomBench y inclusionAI/ZwZ-RL-VQA. ZoomBench es un benchmark centrado en razonamiento sobre imagenes con zoom y detalles finos, y ZwZ-RL-VQA parece ser un dataset de VQA creado especificamente para la fase de RL del modelo. Esto apunta a que el modelo se ha optimizado especificamente para responder preguntas que requieren examinar detalles visuales pequenos o regiones concretas de la imagen. El numero de tokens de preentrenamiento y la composicion completa del dataset no estan disponibles.

## Capacidades

- Comprension de imagenes y respuesta a preguntas visuales (VQA), con enfoque en razonamiento visual sobre detalles finos, segun los tags visual-reasoning y los datasets de entrenamiento.
- Razonamiento visual optimizado mediante GRPO (aprendizaje por refuerzo), lo que habitualmente mejora la precision en respuestas estructuradas y el razonamiento paso a paso sobre contenido visual.
- Generacion de texto conversacional en ingles (tag conversational, idioma en).
- Ejecucion multimodal local via llama.cpp gracias a los archivos mmproj incluidos (Q8_0 y f16).
- No hay indicios en la informacion disponible de soporte de tool calling, function calling, agentes, audio ni generacion de imagenes.

## Casos de uso

- Razonamiento sobre imagenes con detalles pequenos: gracias a su entrenamiento con ZoomBench y ZwZ-RL-VQA, el modelo es adecuado para responder preguntas que requieren examinar regiones concretas o elementos diminutos de una imagen, como leer etiquetas, numeros de serie o texto pequeno en capturas.
- Documentacion y analisis de capturas de pantalla: puede emplearse en pipelines locales para responder preguntas sobre interfaces de usuario, diagramas o capturas tecnicas sin enviar datos a la nube, aprovechando la ejecucion offline de llama.cpp.
- Automatizacion de tareas de VQA en dispositivos con recursos limitados: con cuantizaciones de 1,0-1,4 GB (Q2_K a Q4_K_M), cabe en portatiles y mini-PCs, lo que lo hace util para aplicaciones edge de inspeccion visual.
- Prototipado de agentes multimodales locales: su tamano reducido permite integrarlo en flujos experimentales donde un agente necesita razonar sobre imagenes (por ejemplo, verificar el estado de una interfaz tras una accion), con baja latencia.
- Indexacion y etiquetado de bibliotecas de imagenes: puede usarse en batch para generar descripciones o respuestas a preguntas plantilladas sobre grandes colecciones de imagenes en estaciones de trabajo sin GPU de gama alta.
- Educacion y demostraciones de RL aplicado a vision: al ser un modelo pequeno entrenado con GRPO sobre datasets publicos, resulta util como caso de estudio para entender como el aprendizaje por refuerzo mejora el razonamiento visual en modelos compactos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Los datasets ZoomBench y ZwZ-RL-VQA se citan como datos de entrenamiento en los metadatos del repositorio, pero no se incluyen puntuaciones de evaluacion (ni del modelo base ni de las cuantizaciones) en la model card proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: desde aproximadamente 1,0 GB (Q2_K) hasta 4,2 GB (f16) solo para el LLM; anadir 0,5 GB (mmproj-Q8_0) o 0,9 GB (mmproj-f16) para el procesador de vision, mas la memoria del KV cache segun el contexto usado. La recomendacion Q4_K_M ocupa 1,4 GB.
- GPU recomendadas: cualquier GPU moderna con 4 GB de VRAM o mas ejecuta con holgura las cuantizaciones medias; no se requieren GPUs de datacenter (A100/H100) para este tamano.
- Consumer GPUs: cabe comodamente en GPUs como la RTX 3060 de 12 GB, RTX 4060, RTX 4090 e incluso GPUs de 4 GB con las cuantizaciones bajas; tambien es viable la ejecucion pura en CPU dado su tamano reducido.
- Opciones de despliegue: llama.cpp (formato nativo GGUF, incluyendo soporte mmproj para la parte visual), Ollama, LM Studio y otras herramientas compatibles con GGUF. No hay indicacion de soporte directo en vLLM o TGI para estos archivos GGUF (el modelo base en safetensors si podria funcionar con transformers).
- Latencia y throughput: no disponible; por tamano (2B), cabe esperar respuestas rapidas incluso en hardware modesto, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Modalidad | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| ZwZ-2B (base: inclusionAI/ZwZ-2B) | ~2,03B | Vision-language | safetensors / GGUF (esta ficha) | Apache-2.0 | Especializado en razonamiento visual fino, entrenado con GRPO |
| Qwen2-VL-2B (Qwen) | ~2B | Vision-language | safetensors / GGUF (terceros) | Qwen (uso comercial con condiciones) | Modelo multimodal generalista de tamano similar |
| SmolVLM-2B (HuggingFace) | ~2B | Vision-language | safetensors / GGUF (terceros) | Apache-2.0 | Modelo multimodal compacto para ejecucion local |

La comparativa se basa en caracteristicas generales conocidas de los modelos alternativos; los datos de rendimiento de ZwZ-2B no estan disponibles, por lo que no puede afirmarse su posicion relativa en benchmarks.

## Limitaciones y advertencias

- Idioma: el modelo esta etiquetado solo para ingles (en); su rendimiento en castellano no esta documentado y probablemente sea limitado.
- Riesgo de alucinacion: como todo modelo vision-language de 2B, puede generar respuestas incorrectas o inventadas sobre el contenido de las imagenes, especialmente con cuantizaciones agresivas (Q2_K, Q3_K_S), que degradan la calidad.
- Cuantizaciones estaticas: el repositorio indica que las cuantizaciones weighted/imatrix no estan disponibles por el momento, por lo que las cuants ofrecidas son estaticas y pueden perder mas calidad que las imatrix equivalentes.
- Longitud de contexto: no documentada en la informacion disponible; debe verificarse en la ficha del modelo base antes de planificar cargas de trabajo con imagenes grandes o muchas por conversacion.
- Licencia: Apache-2.0, permisiva para uso comercial; sin restricciones relevantes conocidas, aunque conviene revisar la ficha del modelo base por si tiene condiciones adicionales.
- Repositorio de terceros: esta ficha corresponde a una cuantizacion de mradermacher, no al autor original; para soporte, actualizaciones del modelo o documentacion tecnica completa, acudir a inclusionAI/ZwZ-2B.
- Produccion: al tratarse de un modelo especializado en VQA con RL y sin documentacion publica de benchmarks en esta fuente, se recomienda evaluacion propia en el dominio de uso antes de desplegarlo en produccion.

## Enlaces

- Repositorio de la cuantizacion GGUF: https://huggingface.co/mradermacher/ZwZ-2B-GGUF
- Modelo base: https://huggingface.co/inclusionAI/ZwZ-2B
- Pagina de descargas de mradermacher para este modelo: https://hf.tst.eu/model#ZwZ-2B-GGUF
- Dataset ZoomBench: https://huggingface.co/datasets/inclusionAI/ZoomBench
- Dataset ZwZ-RL-VQA: https://huggingface.co/datasets/inclusionAI/ZwZ-RL-VQA
- FAQ y solicitudes de cuantizacion de mradermacher: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF de TheBloke (referenciada en la model card): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Empresa de mradermacher (nethype GmbH): https://www.nethype.de/
