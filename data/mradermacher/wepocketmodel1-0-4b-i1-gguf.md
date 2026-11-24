# mradermacher/WePocketModel1.0-4B-i1-GGUF

## Resumen

WePocketModel1.0-4B-i1-GGUF es una cuantizacion en formato GGUF del modelo multimodal tencent/WePocketModel1.0-4B, publicada por el usuario mradermacher. El modelo base, desarrollado por Tencent, esta disenado para ejecucion en dispositivo (on-device) y combina capacidades multimodales con embeddings multimodales, tecnicas de representacion multinivel (MRL, Matryoshka Representation Learning) y decision estructurada. Esta version concreta es un artefacto de cuantizacion, no un modelo nuevo.

El repositorio contiene unicamente el fichero imatrix (0,1 GB) generado para producir cuantizaciones de calidad, junto con los metadatos de la model card. Los pesos cuantizados propiamente dichos se distribuyen en el repositorio estatico asociado (mradermacher/WePocketModel1.0-4B-GGUF), que tambien aloja los ficheros mmproj necesarios para el procesamiento de vision. El autor documenta una bateria amplia de tipos de cuantizacion (Q2_K, IQ3_M, Q4_K_S, IQ3_XXS, Q3_K_M, Q5_K_M, Q6_K, IQ4_XS, IQ1_M, entre otros), lo que permite ajustar el equilibrio entre tamano y calidad.

La relevancia de esta ficha radica en que el modelo base esta orientado a despliegues en el borde (edge), donde el espacio de almacenamiento y la memoria son limitados, y la licencia Apache 2.0 facilita su uso comercial. No obstante, la informacion publicada en este repositorio es escasa: no se detallan arquitectura interna, datos de entrenamiento ni resultados de benchmarks, y el recuento de parametros en safetensors (1.550.888) no es coherente con la denominacion "4B" del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base multimodal; detalles internos no publicados) |
| Parametros totales | no disponible de forma fiable (la etiqueta del modelo indica 4B; el recuento en safetensors del repo es 1.550.888, incoherente con la etiqueta) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q2_K_S, Q3_K_S, Q3_K_M, Q3_K_L, Q4_0, Q4_1, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, IQ3_XXS, IQ3_XS, IQ3_S, IQ3_M, IQ4_XS, small-IQ4_NL |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones); fichero imatrix incluido en este repo; pesos estaticos y mmproj en el repo estatico |

## Arquitectura y entrenamiento

No se dispone de informacion publicada sobre la arquitectura interna del modelo base tencent/WePocketModel1.0-4B en la documentacion proporcionada. Las etiquetas del repositorio indican que se trata de un modelo multimodal con capacidades de embedding multimodal, MRL (Matryoshka Representation Learning, que permite truncar las representaciones a distintas dimensiones) y decision estructurada. La presencia de ficheros mmproj en el repositorio estatico confirma el soporte de entrada de imagen.

Tampoco se detallan el volumen de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de alineacion como RLHF o DPO. Esta version es exclusivamente un artefacto de cuantizacion: mradermacher genera cuantizaciones ponderadas con fichero imatrix (importancia de pesos) para preservar la calidad en tasas de bits bajas, y ofrece tanto cuantizaciones estaticas como dinamicas (i1). No se documentan innovaciones tecnicas adicionales del proceso de cuantizacion mas alla del uso de imatrix.

## Capacidades

- Procesamiento multimodal: soporte de entrada de imagen mediante ficheros mmproj (confirmado por la model card y las etiquetas del repositorio).
- Embeddings multimodales: el modelo esta disenado para generar representaciones vectoriales de contenido multimodal, utiles para busqueda y recuperacion.
- MRL (Matryoshka Representation Learning): permite truncar las representaciones a dimensiones menores sin reentrenar, lo que facilita el almacenamiento y la comparacion eficiente.
- Decision estructurada: orientado a tareas de clasificacion o decision con salidas estructuradas.
- Ejecucion on-device: disenado para despliegue en dispositivos con recursos limitados.
- Generacion de texto: no confirmada explicitamente en la informacion disponible; las etiquetas no la mencionan.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: limitadas al ingles segun la model card.

## Casos de uso

- Busqueda multimodal en el dispositivo: el modelo puede generar embeddings de imagenes y texto para recuperacion semantica local, sin enviar datos a la nube, gracias a su orientacion on-device y a las representaciones MRL.
- Clasificacion de imagenes en el borde: con salidas de decision estructurada, es adecuado para tareas de etiquetado o filtrado en dispositivos con recursos limitados.
- Deduplicacion y agrupamiento de contenido visual: los embeddings multimodales permiten comparar imagenes y detectar duplicados o similitudes en bibliotecas locales.
- Recomendacion de contenido: las representaciones vectoriales sirven para construir sistemas de recomendacion ligeros que se ejecutan junto al usuario.
- Moderacion de contenido local: la decision estructurada y el procesamiento de imagen permiten clasificar contenido en el propio dispositivo, reduciendo latencia y preservando la privacidad.
- Prototipado rapido con llama.cpp/Ollama: las cuantizaciones GGUF permiten probar el modelo en portatiles y estaciones de trabajo sin GPU dedicada, usando el fichero imatrix para generar variantes propias.
- Investigacion en embeddings multinivel: el soporte de MRL facilita experimentos sobre el compromiso entre dimension de representacion y precision en tareas de recuperacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma fiable; depende del tamano real del modelo base (etiquetado como 4B) y de la cuantizacion elegida. Para un modelo de 4B, las cuantizaciones Q4_K_M suelen requerir en torno a 2,5-3 GB, pero este dato no esta confirmado para este modelo concreto.
- GPU recomendadas: no disponible. Al tratarse de un modelo on-device, esta pensado para ejecutarse en CPU y aceleradores integrados; no se documentan requisitos de GPU.
- Compatibilidad con GPU de consumo: probable en GPUs con 4-8 GB de VRAM para cuantizaciones bajas, pero no confirmado.
- Opciones de despliegue: llama.cpp y derivados (Ollama, LM Studio) por el formato GGUF; el repositorio incluye el fichero imatrix para generar cuantizaciones propias. No se documenta soporte de vLLM o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables de la misma categoria (multimodal on-device con embeddings MRL), y no se dispone de datos de rendimiento para establecer una comparacion rigurosa.

## Limitaciones y advertencias

- Informacion muy escasa: la model card del repositorio no documenta arquitectura, contexto, datos de entrenamiento ni benchmarks, lo que dificulta evaluar su calidad antes de desplegarlo.
- Incoherencia en el recuento de parametros: el dato de safetensors (1.550.888) no concuerda con la etiqueta "4B" del modelo base; conviene verificar el tamano real antes de planificar recursos.
- Este repositorio contiene solo el fichero imatrix; los pesos cuantizados y los ficheros mmproj estan en el repositorio estatico enlazado.
- Riesgo de alucinacion: no evaluado; no se han publicado estudios al respecto.
- Sesgos conocidos: no documentados.
- Idioma: solo ingles segun la model card; el rendimiento en castellano no esta garantizado.
- Licencia Apache 2.0: permite uso comercial, pero debe conservarse el aviso de licencia y atribucion correspondiente.
- Al ser una cuantizacion, puede degradarse la precision respecto al modelo original, especialmente en cuantizaciones de 1-3 bits (IQ1, IQ2, Q2_K).
- No se documenta soporte de tool calling, agentes ni generacion de texto libre; no asumir estas capacidades sin verificacion empirica.

## Enlaces

- Repositorio Hugging Face (cuantizacion i1): https://huggingface.co/mradermacher/WePocketModel1.0-4B-i1-GGUF
- Repositorio de cuantizaciones estaticas y mmproj: https://huggingface.co/mradermacher/WePocketModel1.0-4B-GGUF
- Modelo base: https://huggingface.co/tencent/WePocketModel1.0-4B
- Pagina de descargas del autor: https://hf.tst.eu/model#WePocketModel1.0-4B-i1-GGUF
- Guia de uso de GGUF (README de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Notas sobre tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Peticiones de cuantizacion del autor: https://huggingface.co/mradermacher/model_requests
