# RunningHubAI/rh-dasiwaminimaxh3-dasiwahybridv2-int8-unet

## Resumen

rh-dasiwaminimaxh3-dasiwahybridv2-int8-unet es un UNET de difusion para generacion de video a partir de texto (text-to-video), publicado por RunningHubAI en Hugging Face y pensado para cargarse en ComfyUI o en la plataforma RunningHub. No es un modelo de lenguaje: es el componente UNET (el denoiser) de un pipeline de difusion, distribuido como un unico archivo de pesos cuantizado a int8 de 19 996 MiB (el repositorio ocupa 21,0 GB).

El modelo es un ajuste fino (finetune) derivado de minimax-h3, la familia de generacion de video de MiniMax, y forma parte de la serie DaSiWa MiniMax H3 del autor. La variante "HybridV2" y la cuantizacion int8 apuntan a reducir el coste de memoria respecto a las versiones en bf16, manteniendo el estilo visual del ajuste. El repositorio no incluye codificador de texto, VAE ni scheduler: solo los pesos del UNET, por lo que no es autonomo y requiere el resto del pipeline.

La relevancia practica es acotada pero concreta: permite ejecutar en GPU de gama alta de consumo un UNET de gran tamano en formato int8 dentro de ComfyUI, algo que las versiones en precision completa hacen mas dificil. En contrapartida, la documentacion es practicamente inexistente: no se declaran parametros, contexto, licencia, idiomas ni resultados de benchmarks, y el repositorio no tiene descargas ni valoraciones en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | UNET de difusion para text-to-video (derivado de minimax-h3); no se detalla la topologia interna |
| Parametros totales | no disponible (estimacion indirecta: ~20 000 millones, a partir de un archivo int8 de 19 996 MiB asumiendo 1 byte por parametro; no confirmado por el autor) |
| Parametros activos | no aplica (no se describe arquitectura MoE) |
| Longitud de contexto | no disponible (no aplica en el sentido de contexto de texto; la duracion de video soportada no se documenta) |
| Tipos de cuantizacion | int8 (unica variante en este repositorio); existen variantes bf16 de la misma familia publicadas por el mismo autor |
| Idiomas soportados | no disponible (el idioma de los prompts depende del codificador de texto del pipeline, no incluido aqui) |
| Licencia | no disponible; la model card remite a la licencia del proyecto original o aguas arriba |
| Formato de pesos | safetensors (`DasiwaMinimaxH3_dasiwaHybridV2_int8_r.safetensors`, 19 996 MiB) |

## Arquitectura y entrenamiento

Se trata de un UNET de difusion para generacion de video condicionada por texto, ajustado a partir de minimax-h3. El nombre del repositorio indica dos rasgos concretos: la variante "HybridV2" del ajuste y la cuantizacion a int8 de los pesos ("int8", con el sufijo `_r` en el nombre del archivo). No se publica informacion sobre el numero de bloques, la dimension de los embeddings de tiempo o condicionamiento, ni sobre el mecanismo de atencion empleado (espacial, temporal o ambos).

Tampoco hay datos sobre el entrenamiento: no se indica el volumen de tokens o de pares texto-video, la composicion del dataset, la resolucion o duracion de los clips de entrenamiento, ni si se aplicaron tecnicas de alineacion como RLHF, DPO o destilacion por pasos. El ajuste se distribuye a traves de RunningHub, que actua como plataforma de entrenamiento y publicacion en nombre del autor, pero el repositorio no incluye hiperparametros ni recetas reproducibles. Cualquier afirmacion sobre innovaciones tecnicas seria especulativa con la informacion disponible.

## Capacidades

- Generacion de video a partir de descripciones textuales (pipeline declarado: `text-to-video`), actuando como denoiser dentro de un pipeline de difusion completo.
- Integracion nativa con ComfyUI, segun las etiquetas del repositorio (`comfyui`, `unet`), y carga en la plataforma RunningHub.
- Estilo visual especifico aportado por el ajuste DaSiWa MiniMax H3, orientado a la generacion de clips con una estetica concreta (el autor publica la referencia en Civitai).
- Ejecucion con menor huella de memoria que las variantes en bf16, gracias a la cuantizacion int8.
- Soporte de tool calling / function calling: no aplica y no disponible (no es un modelo de lenguaje).
- Soporte de agentes y razonamiento multi-paso: no aplica y no disponible.
- Capacidades multilingues: no disponibles; dependen del codificador de texto externo que use el pipeline.
- Capacidades especiales (modo thinking, vision, audio): no disponibles; existe una variante hermana del mismo autor etiquetada como REF2VA (referencia a video/audio), lo que sugiere que este repositorio concreto no cubre esas modalidades.

## Casos de uso

- Generacion de clips para prototipado creativo en ComfyUI: el UNET se carga como nodo de modelo dentro de un grafo que aporte el codificador de texto, el VAE y el scheduler, permitiendo iterar sobre prompts y semillas sin salir del entorno.
- Previsualizacion de storyboards: convertir guiones breves en clips de referencia para validar encuadres, ritmo y paleta antes de producir con herramientas mas costosas.
- Contenido para redes sociales con estilo propio: el ajuste DaSiWa MiniMax H3 permite mantener una estetica coherente entre piezas generadas en lote.
- Generacion por lotes en servidor con GPU de 24-80 GB: al estar en int8, el UNET reduce el peso en memoria y permite encolar varias generaciones en una misma maquina.
- Integracion en productos de terceros mediante la API de RunningHub: en lugar de desplegar el modelo, se puede invocar el endpoint hospedado y consumir el resultado como servicio.
- Comparacion de variantes de cuantizacion y ajuste: sirve como punto de referencia int8 frente a las versiones bf16 y a la variante int8 "convrot" de la misma familia, para medir impacto en calidad y velocidad.
- Experimentacion academica sobre cuantizacion de UNET de video: util para estudiar degradacion de calidad temporal al pasar de bf16 a int8 en modelos de difusion de gran tamano.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas objetivas (FVD, CLIP score, VBench ni equivalentes), no se comparan resultados con el modelo base minimax-h3 y no se documentan tiempos de inferencia, numero de pasos de muestreo ni resoluciones de salida soportadas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa, el archivo de pesos int8 ocupa 19 996 MiB, por lo que se necesita mas de 20 GB solo para los pesos del UNET, mas la memoria de activaciones del pipeline de video, el codificador de texto y el VAE (no incluidos en el repositorio).
- GPU recomendadas: no declaradas por el autor. Por tamano de pesos, resultan razonables tarjetas con 24 GB o mas (RTX 3090, RTX 4090, A100 40 GB, H100 80 GB), asumiendo que el resto del pipeline quepa en memoria.
- Cabe en GPU de consumo: previsiblemente en RTX 3090 y RTX 4090 (24 GB) con estrategias de offloading y gestion de memoria de ComfyUI; en tarjetas de 8-16 GB no cabe sin descarga a RAM/SSD y el rendimiento caeria de forma acusada. Esta afirmacion es una estimacion por tamano de archivo, no un dato confirmado.
- Opciones de despliegue: ComfyUI (entorno declarado por las etiquetas del repositorio) y la plataforma RunningHub, incluida su API. No se documenta soporte para vLLM, TGI, llama.cpp ni Ollama, que ademas no son herramientas adecuadas para un UNET de difusion.
- Latencia y throughput: no disponibles. No se publican tiempos por clip, resoluciones, duracion de video ni numero de pasos.

## Comparativa con modelos similares

Los unicos modelos comparables identificables son otras publicaciones del mismo autor sobre la misma base, todas con documentacion igualmente escasa. Los datos de parametros, contexto y rendimiento no estan disponibles para ninguno de ellos.

| Modelo | Tipo | Precision / cuantizacion | Base | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| rh-dasiwaminimaxh3-dasiwahybridv2-int8-unet (este modelo) | UNET text-to-video | int8 | minimax-h3 | no disponible | Hugging Face, RunningHub |
| rh-dasiwaminimaxh3-dasiwaref2vahybridv1.0-unet | UNET (variante REF2VA) | no disponible | minimax-h3 | no disponible | Hugging Face, RunningHub |
| rh-minimax-h3-fl2v-turbo-4step-v1.0-768p-comfyui-bf16 | UNET text-to-video / image-to-video, destilado a 4 pasos, 768p | bf16 | minimax-h3 | no disponible | Hugging Face, RunningHub |
| DaSiWa Minimax H3 Hybrid v1 int8 convrot | UNET con cuantizacion alternativa | int8 | minimax-h3 | no disponible | RunningHub |
| minimax-h3 (modelo base) | Modelo de generacion de video | no disponible | - | no disponible | Repositorio de MiniMax (no verificado en esta busqueda) |

## Limitaciones y advertencias

- Licencia no declarada: la model card indica que se sigue la licencia del proyecto original o aguas arriba, sin especificarla. El uso comercial es juridicamente incierto y requiere verificacion directa con el autor o con RunningHub antes de cualquier despliegue en produccion.
- Repositorio sin validacion de la comunidad: 0 descargas y 0 likes en el momento de redactar la ficha, sin incidencias ni evaluaciones de terceros que respalden la calidad del ajuste.
- Documentacion minima: no hay informacion sobre datos de entrenamiento, hiperparametros, resoluciones soportadas ni pasos de muestreo recomendados, lo que complica la reproduccion de resultados.
- Modelo no autonomo: solo contiene los pesos del UNET. Sin codificador de texto, VAE y scheduler compatibles con minimax-h3, el archivo es inutilizable.
- Degradacion por cuantizacion: la cuantizacion int8 puede introducir perdida de detalle fino y artefactos temporales (parpadeo, incoherencia entre fotogramas) frente a las variantes bf16. No se publican mediciones al respecto.
- Riesgo de alucinacion visual: como todo modelo generativo de difusion, puede producir contenido fisicamente incoherente, anatomia incorrecta, texto ilegible o movimiento no realista, especialmente en prompts ambiguos.
- Sesgos: no se documenta la composicion del dataset de ajuste, por lo que no es posible evaluar sesgos demograficos, culturales o de representacion en las personas y escenas generadas.
- Idioma: no se declaran idiomas soportados para los prompts; el comportamiento multilingue dependera por completo del codificador de texto empleado.
- Ausencia de benchmarks: no hay metricas objetivas de calidad, coherencia temporal ni fidelidad al prompt, ni comparacion con el modelo base.
- Restricciones de hardware: mas de 20 GB solo en pesos, lo que excluye la mayoria de GPU de consumo de gama media y baja.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/RunningHubAI/rh-dasiwaminimaxh3-dasiwahybridv2-int8-unet
- Perfil del autor en Hugging Face: https://huggingface.co/RunningHubAI
- Modelo original en RunningHub: https://www.runninghub.cn/model/public/2098650721989251073
- Pagina del autor en RunningHub: https://www.runninghub.cn/user-center/1819214514410942465
- Referencia del ajuste en Civitai (DaSiWa MiniMax H3): https://civitai.com/models/2877206/dasiwa-minimax-h3
- Variante DaSiWa MiniMax H3 V2 en RunningHub: https://www.runninghub.ai/model/public/2098431664417447937
- Variante DaSiWa Minimax H3 Hybrid v1 int8 convrot: https://www.runninghub.ai/model/public/2091205588368834561
- Variante relacionada rh-dasiwaminimaxh3-dasiwaref2vahybridv1.0-unet: https://huggingface.co/RunningHubAI/rh-dasiwaminimaxh3-dasiwaref2vahybridv1.0-unet
- Plataforma RunningHub: https://www.runninghub.ai
- Documentacion de la API de RunningHub: https://www.runninghub.cn/runninghub-api-doc-en/
- Entrenamiento de modelos en RunningHub: https://www.runninghub.ai/page-model
