# Nikssxelo123/Rosie-vision-ai

## Resumen

Rosie-vision-ai es un modelo multimodal de tipo imagen-texto-a-texto publicado por el usuario Nikssxelo123 en HuggingFace. Se trata de un ajuste fino (fine-tune) del modelo SmolVLM-500M-Instruct de Hugging Face, que a su vez deriva de la arquitectura Idefics3. El modelo procesa entradas intercaladas de texto, imágenes y vídeo para generar respuestas textuales, y esta orientado a tareas de captioning, respuesta visual a preguntas (VQA) y descripcion de contenido audiovisual. Cuenta con 507.482.304 parametros, lo que lo situa en la gama ultraligera de los modelos multimodales.

La relevancia de este modelo radica en su tamano reducido: segun la documentacion del modelo base, la inferencia sobre video requiere aproximadamente 1,8 GB de VRAM, lo que permite desplegarlo en dispositivos con recursos limitados, incluidos entornos de borde y GPUs de consumo. El repositorio ocupa 7,2 GB e incluye pesos en safetensors y ONNX. La licencia es Apache 2.0 y el unico idioma declarado es el ingles.

No obstante, la model card publicada no documenta el proceso concreto de ajuste fino aplicado por el autor, ni hiperparametros, ni un conjunto de evaluacion propio. Los resultados de benchmarks que se citan corresponden al modelo base SmolVLM2-500M-Video de Hugging Face y deben interpretarse como referencia del punto de partida, no como una evaluacion verificada de este fine-tune.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal basada en Idefics3 (hereda de SmolVLM-500M-Instruct) |
| Parametros totales | 507.482.304 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio incluye pesos ONNX y safetensors; no se detallan variantes cuantizadas) |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, ONNX |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de SmolVLM-500M-Instruct, que a su vez se basa en Idefics3. Se trata de un transformer multimodal que combina un codificador visual con un modelo de lenguaje para procesar secuencias intercaladas de texto e imagenes, y que en la variante de video procesa fotogramas muestreados del video como entrada visual. El modelo base SmolVLM2-500M-Video esta disenado especificamente para el analisis de contenido de video ademas de imagenes y texto.

Respecto al entrenamiento, la model card del repositorio lista un conjunto amplio de datasets multimodales: HuggingFaceM4/the_cauldron, HuggingFaceM4/Docmatix, lmms-lab/LLaVA-OneVision-Data, lmms-lab/M4-Instruct-Data, HuggingFaceFV/finevideo, MAmmoTH-VL/MAmmoTH-VL-Instruct-12M, lmms-lab/LLaVA-Video-178K, orrzohar/Video-STaR, Mutonix/Vript, TIGER-Lab/VISTA-400K, Enxin/MovieChat-1K_train y ShareGPT4Video/ShareGPT4Video. Sin embargo, no se especifica el numero de tokens de entrenamiento, la composicion exacta del dataset utilizado en el ajuste fino ni si se aplicaron tecnicas de RLHF o DPO. Tampoco se documentan innovaciones tecnicas adicionales mas alla de las del modelo base.

## Capacidades

- Generacion de texto condicionada por imagen: descripcion de imagenes, respuesta a preguntas visuales y transcripcion de texto presente en imagenes.
- Comprension de video: analisis de contenido audiovisual, incluida la descripcion detallada de secuencias y la comparacion de fotogramas.
- Entrada multimodal intercalada: permite combinar texto e imagenes (una o varias) de forma arbitraria en un mismo prompt.
- Conversacion multiturno: la model card indica que el pipeline es conversacional y que admite plantillas de chat.
- Comparacion de imagenes multiples: capacidad de responder preguntas que relacionan dos o mas imagenes en una misma consulta.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: limitadas al ingles segun la metadata del modelo.
- Capacidades especiales (modo thinking, audio, vision): vision (imagen y video); no se documenta modo thinking ni audio.

## Casos de uso

- Descripcion automatica de imagenes para accesibilidad: el modelo puede generar texto alternativo para imagenes en sitios web o aplicaciones, aprovechando su capacidad de captioning y su bajo coste de inferencia para procesar lotes grandes.
- Analisis de documentos escaneados: gracias a su capacidad de transcripcion de texto en imagenes, puede extraer contenido de facturas, formularios o capturas y convertirlo en texto estructurado en pipelines de digitalizacion.
- Moderacion y anotacion de contenido audiovisual: el modelo puede describir el contenido de videos cortos para tareas de etiquetado, clasificacion preliminar o generacion de metadatos en plataformas de video.
- Asistencia en entornos con recursos limitados: con un requisito de aproximadamente 1,8 GB de VRAM para video segun el modelo base, es adecuado para despliegues en dispositivos de borde, Raspberry Pi con acelerador o portatiles sin GPU dedicada.
- Respuesta visual a preguntas en aplicaciones educativas: un usuario puede subir una imagen de un diagrama o ejercicio y formular preguntas sobre ella, con el modelo respondiendo en ingles.
- Comparacion de productos o imagenes en comercio electronico: la capacidad de entrada multi-imagen permite contrastar dos fotografias de producto y responder preguntas sobre diferencias o similitudes.
- Generacion de resumenes de video para previsualizacion: integrado en un pipeline que muestree fotogramas, el modelo puede producir una sinopsis textual de un clip antes de su publicacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks especificos de este fine-tune en la informacion disponible. Los siguientes datos corresponden al modelo base SmolVLM2-500M-Video de Hugging Face, segun su model card, y se incluyen unicamente como referencia del punto de partida:

| Modelo | Video-MME | MLVU | MVBench |
|---|---|---|---|
| SmolVLM2-2.2B | 52,1 | 55,2 | 46,27 |
| SmolVLM2-500M | 42,2 | 47,3 | 39,73 |
| SmolVLM2-256M | 33,7 | 40,6 | 32,7 |

No se dispone de datos de MMLU, HumanEval, GSM8K ni de otras evaluaciones para este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,8 GB de VRAM para inferencia sobre video, segun la model card del modelo base. Para imagen y texto el requisito es igual o inferior.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM; tarjetas de consumo como RTX 3060, RTX 4060 o superiores son suficientes. Tambien es viable en GPUs de datacenter (A100, H100) para despliegues por lotes de alto volumen.
- Compatibilidad con GPU de consumo: si, el modelo cabe en practicamente cualquier GPU de consumo moderna e incluso en algunos iGPU con memoria compartida suficiente.
- Opciones de despliegue: transformers (libreria declarada), con soporte de flash-attention 2 segun la documentacion del modelo base; el repositorio incluye pesos ONNX, lo que habilita despliegue con ONNX Runtime. No se documenta soporte explicito de vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Rosie-vision-ai (este modelo) | 507M | no disponible | Imagen, multi-imagen y video | Apache 2.0 | HuggingFace, 0 descargas |
| SmolVLM2-500M-Video (base) | 500M | no disponible | Imagen, multi-imagen y video | Apache 2.0 | HuggingFace, oficial de Hugging Face |
| SmolVLM2-256M | 256M | no disponible | Imagen y video | Apache 2.0 | HuggingFace, oficial de Hugging Face |
| SmolVLM2-2.2B | 2,2B | no disponible | Imagen y video | Apache 2.0 | HuggingFace, oficial de Hugging Face |

La comparativa se limita a la familia SmolVLM2 porque no se dispone de datos verificados de otros modelos multimodales de tamano comparable en la informacion proporcionada. Frente al modelo base, este fine-tune no documenta mejoras medibles ni un conjunto de evaluacion propio, por lo que la eleccion entre ambos deberia basarse en pruebas propias sobre la tarea objetivo.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la model card; al entrenarse sobre datasets multimodales de origen web, es probable que herede sesgos de representacion, pero no se aporta evidencia concreta.
- Riesgo de alucinacion: la model card del modelo base advierte explicitamente de que el modelo puede producir contenido que parece factual pero no es preciso.
- Limitaciones de idioma: el modelo solo declara soporte de ingles; el rendimiento en castellano no esta garantizado ni evaluado.
- Limitaciones de contexto: la longitud de contexto no esta documentada en la informacion disponible.
- Restricciones de licencia: la licencia Apache 2.0 permite uso comercial, modificacion y redistribucion con atribucion; no se identifican restricciones adicionales en la metadata.
- Uso en escenarios de alto riesgo: la model card del modelo base desaconseja explicitamente su uso en decisiones criticas que afecten al bienestar de las personas.
- Madurez del repositorio: el modelo tiene 0 descargas y 0 likes, fue creado y actualizado el mismo dia y no incluye documentacion del proceso de ajuste fino ni evaluacion propia; debe tratarse como un artefacto no validado por la comunidad.
- Trazabilidad: la model card del repositorio reproduce literalmente la del modelo base SmolVLM2-500M-Video, lo que impide distinguir que cambios introduce este fine-tune.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Nikssxelo123/Rosie-vision-ai
- Modelo base: https://huggingface.co/HuggingFaceTB/SmolVLM-500M-Instruct
- Blog de SmolVLM2: https://huggingface.co/blog/smolvlm2
- Demo Video Highlight Generator: https://huggingface.co/spaces/HuggingFaceTB/SmolVLM2-HighlightGenerator
- Repositorio SmolLM (tutorial de fine-tuning de vision): https://github.com/huggingface/smollm/blob/main/vision/finetuning/Smol_VLM_FT.ipynb
- Paper de referencia (arxiv:2504.05299): https://arxiv.org/abs/2504.05299
- Arquitectura Idefics3: https://huggingface.co/HuggingFaceM4/Idefics3-8B-Llama3
