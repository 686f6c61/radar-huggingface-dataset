# mradermacher/Lythri-Wink-2B-pt-i1-GGUF

## Resumen

Lythri-Wink-2B-pt-i1-GGUF es la distribucion en formato GGUF del modelo Lythri-Wink-2B-pt, publicada por el usuario mradermacher, especializado en cuantizacion de modelos open source. El modelo original lo desarrolla Lythri y, segun las etiquetas de su model card, deriva de la familia Gemma 4 y se ha obtenido mediante poda estructurada (structured pruning) y destilacion de conocimiento (knowledge distillation), con un enfoque declarado hacia la inferencia on-device. Esta version concreta contiene cuantizaciones con imatrix (etiquetadas como i1) pensadas para reducir el peso del modelo manteniendo la calidad relativa.

El modelo cuenta con 2.522.816.415 parametros totales (aproximadamente 2,5 mil millones), lo que lo situa en la gama baja de modelos densos y lo hace apto para ejecucion en hardware de consumo. La model card identifica el modelo como base-model y menciona que se trata de un modelo de vision, aunque los ficheros mmproj (proyector multimodal) no estan en este repositorio sino en el repositorio de cuantizaciones estaticas del mismo autor.

La relevancia de esta ficha radica en que ofrece una via practica para desplegar un modelo de ~2,5B en entornos con recursos limitados mediante llama.cpp u otros runners compatibles con GGUF. La licencia Apache 2.0 facilita su uso comercial, si bien la informacion publicada sobre contexto, idiomas y datos de entrenamiento es muy escasa en la documentacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivado de Gemma 4, segun etiquetas de la model card); detalles no disponibles |
| Parametros totales | 2.522.816.415 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-IQ1_S, i1-IQ1_M, i1-IQ2_XXS, i1-IQ2_XS, i1-IQ2_S, i1-IQ2_M, i1-IQ3_XXS, i1-Q2_K_S, i1-Q2_K, i1-IQ3_XS, i1-Q3_K_S, i1-IQ3_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-Q4_0, i1-IQ4_NL, i1-Q4_K_S, i1-Q4_K_M, i1-Q4_1, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K (mas fichero imatrix) |
| Idiomas soportados | en (segun la model card) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizaciones i1 con imatrix); el modelo base original esta en safetensors |

## Arquitectura y entrenamiento

La model card indica que el modelo original es un derivado de Gemma 4 obtenido mediante poda estructurada y destilacion de conocimiento, con orientacion a inferencia on-device. No se detalla el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron fases de RLHF o DPO. Tampoco se especifican innovaciones de atencion (por ejemplo, atencion lineal o decodificacion especulativa) en la informacion disponible.

Esta publicacion concreta no entrena el modelo: aplica cuantizacion GGUF de tipo i1 con fichero imatrix generado a partir del modelo base Lythri/Lythri-Wink-2B-pt. Las cuantizaciones i1 combinan pesos de importancia (imatrix) para mejorar la fidelidad respecto a cuantizaciones estaticas de tamano similar. El repositorio incluye tambien el fichero imatrix (0,1 GB) para que terceros puedan generar sus propias cuantizaciones. La model card advierte de que, al tratarse de un modelo de vision, los ficheros mmproj, si existen, residen en el repositorio de cuantizaciones estaticas.

## Capacidades

- Generacion de texto conversacional: la etiqueta conversational aparece en los metadatos del repositorio.
- Capacidad multimodal declarada: la model card indica que es un modelo de vision, con ficheros mmproj en el repositorio estatico.
- Modelo base (base-model): no se documenta un ajuste especifico de instrucciones en la informacion disponible.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: la model card solo declara ingles (en).
- Modo thinking, audio u otras capacidades especiales: no disponible en la informacion proporcionada.

## Casos de uso

- Asistente conversacional local en dispositivos: con cuantizaciones de 2,2 a 2,8 GB, el modelo puede ejecutarse en portatiles y mini-PC sin GPU dedicada mediante llama.cpp u Ollama, gestionando dialogos de varios turnos en ingles.
- Prototipado rapido de aplicaciones de chat: al ser un modelo base pequeno y con licencia Apache 2.0, sirve para validar pipelines de inferencia (prompting, streaming, plantillas de chat) antes de escalar a modelos mayores.
- Procesamiento por lotes en CPU: las cuantizaciones IQ2/IQ3 permiten desplegar el modelo en servidores sin acelerador para tareas de generacion de texto de baja criticidad, como resumenes o clasificacion ligera, siempre que se valide la calidad.
- Experimentacion con vision en el borde: usando los ficheros mmproj del repositorio estatico, puede emplearse para tareas basicas de descripcion de imagenes o extraccion de informacion visual en entornos con poca VRAM.
- Destilacion y poda como referencia de investigacion: el modelo documenta una receta de poda estructurada y destilacion sobre Gemma 4, util para estudiar tecnicas de compresion de modelos.
- Generacion de cuantizaciones propias: el fichero imatrix incluido permite a otros desarrolladores producir cuantizaciones personalizadas con llama.cpp para ajustar el equilibrio tamano/calidad.
- Educacion y demos offline: su reducido tamano facilita talleres y demostraciones de IA generativa en equipos sin conexion ni hardware especializado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada: entre 2,2 GB (i1-IQ1_S) y 2,8 GB (i1-Q6_K) solo para los pesos; anadir margen para el contexto KV cache, que depende de la longitud de contexto no documentada.
- GPU recomendadas: cualquier GPU consumer con 4-8 GB de VRAM (por ejemplo, RTX 3060, RTX 4060, RTX 4090) puede ejecutar las cuantizaciones mayores con comodidad; tambien es viable en CPU.
- Cabe en GPU consumer: si, en todas las cuantizaciones publicadas, al ocupar menos de 3 GB de pesos.
- Opciones de despliegue: llama.cpp, Ollama, y runners compatibles con GGUF; el repositorio declara endpoints_compatible. Para el modelo base en safetensors se usaria transformers.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Lythri-Wink-2B-pt-i1-GGUF | 2,52 B | no disponible | Apache 2.0 | GGUF | Vision declarada; derivado de Gemma 4 con poda y destilacion |
| Modelos Gemma de ~2B (familia original) | ~2 B | no disponible | Terminos de Gemma | safetensors, GGUF | Referencia arquitectonica; el modelo Wink deriva de Gemma 4 |
| Otros modelos densos de ~2-3B en GGUF | ~2-3 B | variable | variable | GGUF | Alternativas genericas de la misma franja de tamano |

No se dispone de datos de benchmarks ni de comparativas de rendimiento verificadas en la informacion proporcionada.

## Limitaciones y advertencias

- Documentacion muy escasa: no se publican datos de contexto, composicion del entrenamiento ni evaluaciones, lo que dificulta estimar su calidad real.
- Solo se declara soporte de ingles; el rendimiento en castellano no esta verificado y probablemente sea limitado.
- Al ser un modelo base, puede no seguir instrucciones de forma fiable sin ajuste adicional o prompting cuidadoso.
- Riesgo de alucinacion inherente a modelos de este tamano, especialmente en tareas de conocimiento factual.
- La capacidad de vision depende de ficheros mmproj alojados en otro repositorio; sin ellos, el uso es solo de texto.
- Sesgos: no disponible; no se documentan evaluaciones de sesgo.
- Licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base Lythri/Lythri-Wink-2B-pt y de la familia Gemma 4 de la que deriva.
- Las cuantizaciones de menor bit (IQ1, IQ2) degradan la calidad de forma notable; la propia model card las describe como para casos desesperados o de baja calidad.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Lythri-Wink-2B-pt-i1-GGUF
- Modelo base: https://huggingface.co/Lythri/Lythri-Wink-2B-pt
- Cuantizaciones estaticas: https://huggingface.co/mradermacher/Lythri-Wink-2B-pt-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#Lythri-Wink-2B-pt-i1-GGUF
- DOI del modelo: https://doi.org/10.5281/zenodo.23179311
- Solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafica de calidad de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- nethype GmbH: https://www.nethype.de/
