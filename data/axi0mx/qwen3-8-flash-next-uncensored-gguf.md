# axi0mX/Qwen3.8-Flash-Next-Uncensored-GGUF

## Resumen

axi0mX/Qwen3.8-Flash-Next-Uncensored-GGUF es un repositorio de cuantizaciones GGUF del modelo Qwen3.8-Flash-Next en su variante sin censura (abliterated), publicado por el usuario axi0mX en Hugging Face. El modelo base es un MoE multimodal desarrollado por el equipo Qwen (QwenLM) que, según el repositorio oficial, sirve como vista previa temprana de la arquitectura empleada en Qwen4, igual que Qwen3-Next lo fue para la serie Qwen3.5.

El dato real de parametros del modelo es de 179.551.050.368 (~179,6 B), lo que lo situa en la gama alta de los modelos abiertos actuales. La arquitectura combina atencion hibrida GDN (Gated DeltaNet) con QSA/Gated Attention, y el modelo incorpora vision mediante un fichero mmproj separado. El repositorio ocupa 449,5 GB e incluye, segun el blog de orcarouter, 13 cuantizaciones GGUF mas un build MLX de 6 bits para Apple Silicon.

Su relevancia radica en dos factores: permite ejecutar localmente un MoE multimodal de gran tamano mediante llama.cpp u Ollama, y ofrece una version abliterated del modelo, es decir, con los mecanismos de rechazo reducidos o eliminados. La ficha publica no declara licencia, idiomas ni pipeline, y el repositorio acumula 13 descargas y 0 likes desde su creacion el 5 de octubre de 2026.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE multimodal con atencion hibrida GDN (Gated DeltaNet) + QSA/Gated Attention, segun el repositorio oficial de Qwen3.8-Flash-Next |
| Parametros totales | 179.551.050.368 (~179,6 B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF (13 cuantizaciones segun el blog de orcarouter); un repositorio derivado menciona IQ4XS-NGQ4. Calibracion con imatrix (tag del repositorio) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (repositorio principal); build MLX de 6 bits segun el blog; los pesos originales del modelo base son safetensors |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-Flash-Next es un MoE multimodal que, segun su repositorio en GitHub, mejora el diseno anterior en cuatro ejes: atencion, residual, embedding y optimizacion. En atencion introduce una arquitectura hibrida GDN + QSA, que combina Gated DeltaNet (una familia de capas con estado recurrente y coste de computo lineal) con mecanismos de atencion con puertas. Esta combinacion busca reducir el coste computacional de la atencion clasica manteniendo la capacidad del modelo. El repositorio oficial indica ademas que esta arquitectura sirve como anticipo de la empleada en Qwen4.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, la existencia de fases de RLHF o DPO, ni sobre el proceso concreto de abliteration aplicado en la variante sin censura de este repositorio. Tampoco se documentan los parametros activos del MoE, el numero de expertos ni el ratio de activacion. El unico dato tecnico adicional verificable es el uso de calibracion imatrix en las cuantizaciones, segun las etiquetas del repositorio, y la presencia de vision a traves de un fichero mmproj mencionado en el blog de orcarouter.

## Capacidades

- Generacion de texto conversacional: el repositorio incluye la etiqueta conversational.
- Comprension de imagenes: el blog de orcarouter menciona un fichero mmproj vision, lo que habilita entrada multimodal de imagen.
- Ejecucion local de un MoE de gran tamano mediante cuantizacion GGUF, con versiones que permiten reducir el espacio de pesos frente a FP16.
- Despliegue compatible con endpoints: el repositorio incluye la etiqueta endpoints_compatible, orientada a servir el modelo como API.
- Comportamiento sin censura: la variante abliterated reduce los rechazos del modelo original ante determinadas peticiones.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible; la ficha no declara idiomas.
- Modo de razonamiento explicito (thinking), audio u otras capacidades especiales: no disponible en la informacion proporcionada.
- Capacidad de generacion de codigo y matematicas: no confirmada en la informacion disponible; el modelo base es de proposito general, pero no hay datos que lo verifiquen para esta variante.

## Casos de uso

- Analisis de documentos con imagenes en local: al disponer de un fichero mmproj de vision, permite procesar capturas, diagramas o documentos escaneados sin enviar los datos a un servicio externo, algo relevante en entornos con requisitos de confidencialidad.
- Despliegue de un asistente conversacional autoalojado: con las cuantizaciones GGUF y la etiqueta endpoints_compatible, se puede servir como API interna mediante llama.cpp u Ollama para equipos que no pueden usar APIs comerciales.
- Experimentacion con modelos abliterated: util para investigadores que estudian el efecto de la abliteration en el comportamiento del modelo, comparando esta variante con los pesos originales de Qwen3.8-Flash-Next sobre el mismo conjunto de prompts.
- Generacion de datos sinteticos en dominios sensibles: en casos de uso legitimos como salud, seguridad o ficcion adulta, una variante sin censura reduce los rechazos que bloquearian la generacion de datos de entrenamiento en esos dominios.
- Evaluacion comparativa de cuantizaciones: las 13 cuantizaciones GGUF, calibradas con imatrix, permiten medir la degradacion de calidad frente al coste de VRAM en un modelo de ~179,6 B de parametros.
- Ejecucion en Apple Silicon: el build MLX de 6 bits mencionado en el blog permite aprovechar la memoria unificada de los equipos Mac con chip de la serie M para un modelo de este tamano.
- Investigacion sobre arquitecturas hibridas: al ser una vista previa de la arquitectura de Qwen4, sirve para analizar en la practica el comportamiento de la combinacion GDN + QSA en cargas de trabajo reales.
- Procesamiento por lotes sin conexion: para pipelines internos de clasificacion, resumen o extraccion sobre corpus propios, con control total sobre los pesos y sin dependencia de terceros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

El repositorio de Hugging Face no incluye model card con metricas, y las busquedas web no aportan resultados de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion para esta variante cuantizada. Cualquier cifra que se quiera usar para decidir su adopcion tendria que obtenerse mediante evaluacion propia.

## Requisitos de hardware

Las cifras siguientes son estimaciones derivadas del numero de parametros (179,6 B) para el almacenamiento de pesos; no proceden de documentacion oficial del repositorio.

- FP16/BF16: aproximadamente 359 GB de pesos. Requiere del orden de 8 GPU de 80 GB en paralelo.
- Cuantizacion Q8: aproximadamente 180 GB. Requiere 3 GPU de 80 GB o 4 GPU de 48 GB.
- Cuantizacion Q6: aproximadamente 146 GB. Requiere 2 GPU de 80 GB mas margen de contexto.
- Cuantizacion Q5: aproximadamente 123 GB. Requiere 2 GPU de 80 GB.
- Cuantizacion Q4: aproximadamente 101 GB. Requiere 2 GPU de 80 GB, o 3 GPU de 48 GB (por ejemplo RTX 6000 Ada) si se reparte por capas.
- Cuantizacion Q3: aproximadamente 79 GB. Cabe en una sola GPU de 80 GB (A100, H100), con margen limitado para el contexto.
- Cuantizacion Q2: aproximadamente 60 GB. Cabe en una GPU de 80 GB con contexto amplio, a costa de una degradacion de calidad apreciable.
- GPU recomendadas por perfil: H100 80 GB o A100 80 GB para las cuantizaciones Q3 a Q8; multiples RTX 4090 de 24 GB solo con reparto por capas y asumiendo latencia alta por el trafico entre GPU.
- Consumer GPU: no cabe en una unica GPU de consumo con las cuantizaciones habituales. Configuraciones de 2x24 GB o 4x24 GB son viables en Q2/Q3 con offload parcial, pero con penalizacion de rendimiento.
- Apple Silicon: el build MLX de 6 bits esta pensado para equipos con memoria unificada; por el tamano del modelo, se necesita una configuracion de 128 GB o superior.
- Almacenamiento: el repositorio completo ocupa 449,5 GB, aunque el tamano del repo no permite deducir el peso individual de cada cuantizacion.
- Opciones de despliegue: llama.cpp, Ollama y LM Studio para GGUF; MLX para Apple Silicon; vLLM y TGI tienen soporte limitado o experimental de GGUF, por lo que estos formatos no son la via recomendada para servir el modelo a gran escala.
- Latencia y throughput: no disponible. En un MoE el coste por token depende de los parametros activos, dato que no se ha publicado, por lo que no se puede estimar con fiabilidad.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Enfoque |
|---|---|---|---|---|---|
| axi0mX/Qwen3.8-Flash-Next-Uncensored-GGUF | 179,6 B (total), activos no disponibles | no disponible | GGUF, MLX 6 bits | no disponible | Variante abliterated multimodal, 13 cuantizaciones con imatrix |
| Qwen3.8-Flash-Next (QwenLM) | mismos parametros base (no confirmado en la informacion) | no disponible | safetensors | no disponible | Modelo base oficial, con censura y pesos completos |
| cygnal/Qwen3.8-Flash-Next-Uncensored-IQ4XS-NGQ4-GGUF | mismos parametros base (no confirmado) | no disponible | GGUF (IQ4XS-NGQ4) | no disponible | Cuantizacion alternativa de la misma variante sin censura |

No se dispone de datos de rendimiento, licencia o contexto para ninguna de las tres entradas, por lo que la comparativa se limita a parametros, formato y enfoque de publicacion.

## Limitaciones y advertencias

- Ausencia de licencia declarada: el repositorio no especifica licencia. Esto impide determinar si el uso comercial esta permitido y obliga a verificar la licencia del modelo base antes de cualquier despliegue en produccion.
- Contenido sin censura: la variante abliterated reduce los rechazos del modelo original. Esto incrementa el riesgo de generar contenido danino, ofensivo o ilegal, y exige filtros propios si el modelo se expone a usuarios finales.
- Riesgo de alucinacion: no se han publicado evaluaciones de fiabilidad para esta variante, por lo que el comportamiento frente a la invencion de datos no esta cuantificado.
- Idiomas no documentados: el repositorio no declara idiomas soportados. El rendimiento en castellano no esta verificado y depende del modelo base.
- Sin benchmarks publicados: no hay forma de comparar objetivamente esta variante con el modelo original ni con otras cuantizaciones.
- Validacion comunitaria minima: 13 descargas y 0 likes. El repositorio no ha pasado una revision amplia por parte de la comunidad.
- Parametros activos desconocidos: al ser un MoE, el coste real de inferencia depende del numero de parametros activos, dato que no se ha publicado. Las estimaciones de hardware de esta ficha se basan en los parametros totales.
- Degradacion por cuantizacion: las cuantizaciones bajas (Q2, Q3) reducen la calidad de forma perceptible en modelos de este tamano. No hay mediciones publicadas de esa perdida.
- Necesidad de fichero mmproj para vision: las capacidades multimodales requieren descargar y cargar el proyector de vision por separado.
- Sin model card: la ficha carece de pipeline declarado, datos de entrenamiento y documentacion de uso, lo que complica la reproducibilidad.
- Requisitos de hardware elevados: con 179,6 B de parametros, el despliegue en una sola GPU de consumo no es viable en la mayoria de cuantizaciones.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/axi0mX/Qwen3.8-Flash-Next-Uncensored-GGUF
- Cuantizacion alternativa IQ4XS-NGQ4: https://huggingface.co/cygnal/Qwen3.8-Flash-Next-Uncensored-IQ4XS-NGQ4-GGUF
- Repositorio del modelo base en GitHub: https://github.com/QwenLM/Qwen3.8-Flash-Next/
- README del modelo base: https://github.com/QwenLM/Qwen3.8-Flash-Next/blob/main/README.md
- Blog con la guia de ejecucion GGUF y MLX: https://www.orcarouter.ai/blog/qwen3-8-flash-next-uncensored
