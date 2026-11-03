# PanocularAI/PanoVLM1.5-500M

## Resumen

PanoVLM1.5-500M es un modelo de vision-lenguaje (image-text-to-text) desarrollado por PanocularAI. Combina un codificador visual FastViT-HD de 122,7 M de parametros con un modelo de lenguaje causal propio, PanoLM1.5-400M, de 388,5 M de parametros, unidos mediante un proyector lineal de 3,1 M. El total asciende a 514,3 M de parametros, lo que lo situa en la gama ligera de modelos multimodales, apto para despliegue en hardware modesto.

La innovacion principal reside en la arquitectura del LM: de sus 24 capas, 20 emplean atencion lineal KDA (Kimi Delta Attention) y solo 4 usan multi-head latent attention (MLA), configurando un esquema de atencion hibrida orientado a reducir el coste computacional del contexto largo. El codificador visual es un FastViT-HD de la libreria timm con entrada en formato NCHW y resolucion de entrenamiento de 768x768.

El modelo se publica bajo licencia Apache 2.0, con pesos en safetensors y soporte en transformers (requiere `trust_remote_code=True`). Esta orientado exclusivamente al ingles y su pipeline declarado es image-text-to-text con soporte de plantillas de chat conversacionales. Su relevancia actual radica en ofrecer una alternativa compacta y de licencia permisiva para tareas de VQA y captioning donde no se justifica desplegar modelos multimodales de miles de millones de parametros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-lenguaje: FastViT-HD (encoder visual) + PanoLM1.5-400M (LM causal hibrido con atencion lineal KDA y MLA) + proyector lineal |
| Parametros totales | 514.377.344 (388,5 M LM + 122,7 M encoder + 3,1 M proyector) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue un esquema clasico de tres componentes para vision-lenguaje. El encoder visual es un FastViT-HD de timm (122,7 M de parametros) que procesa imagenes de 768x768 en formato NCHW, la resolucion con la que fue entrenado y que se aplica mediante pad-resize. La salida del encoder se proyecta al espacio del LM mediante un proyector puramente lineal (sin MLP intermedio) de 3,1 M de parametros.

El modelo de lenguaje, PanoLM1.5-400M, es un transformer causal hibrido: 20 de sus 24 capas utilizan KDA (Kimi Delta Attention), una variante de atencion lineal, y las 4 restantes emplean multi-head latent attention (MLA). Esta combinacion busca reducir el coste de la atencion en secuencias largas manteniendo capacidad expresiva en un subconjunto de capas. La implementacion depende de `flash-linear-attention` (version 0.5.0), cuyos kernels Triton de RMSNorm solo se ejecutan sobre tensores CUDA, lo que obliga a inferencia en GPU. No se han publicado en la informacion disponible detalles sobre el volumen de tokens de entrenamiento, la composicion del dataset ni si se aplicaron fases de RLHF o DPO.

## Capacidades

- Generacion de texto condicionada por imagen (image-text-to-text) mediante plantillas de chat conversacionales.
- Respuesta a preguntas visuales (VQA) sobre contenido de la imagen, incluyendo objetos, escenas y atributos.
- Descripcion y captioning de imagenes, con buen rendimiento relativo en CIDEr segun los benchmarks publicados.
- Razonamiento visual basico y respuesta a preguntas de si/no sobre presencia de objetos (evaluado en POPE).
- Soporte de conversaciones multi-turno a traves de `apply_chat_template` y el placeholder `<|image|>` insertado en linea en el texto.
- Capacidad multilingue: limitada al ingles.
- No se documenta soporte de tool calling, function calling, agentes, modo thinking, audio ni video en la informacion disponible.

## Casos de uso

- Descripcion automatica de imagenes en catalogos de producto: el modelo genera captions en ingles con calidad medida en COCO (CIDEr 93,9) y NoCaps (CIDEr 84,2), adecuado para etiquetado masivo de imagenes a bajo coste computacional.
- Moderacion y verificacion de contenido visual: las preguntas de si/no sobre presencia de objetos (POPE F1 83,3) permiten construir filtros que detecten si una imagen contiene una entidad concreta antes de publicarla.
- Asistencia a personas con discapacidad visual: dado su tamano de 514 M de parametros, puede desplegarse en GPUs de consumo o en el borde para describir escenas en tiempo real sin depender de servicios en la nube.
- Indexacion y busqueda semantica de imagenes: generar descripciones textuales de un corpus de imagenes y almacenarlas en un motor de busqueda de texto para recuperacion posterior.
- Analisis de documentos escaneados simples: responder preguntas sobre el contenido textual visible en una imagen (TextVQA 42,5), util para extraccion asistida en formularios o tickets.
- Prototipado e investigacion en vision-lenguaje: su licencia Apache 2.0 y su tamano compacto lo hacen idoneo como baseline reproducible en experimentos academicos o para fine-tuning sobre dominios especificos.
- Educacion y accesibilidad: generar preguntas y respuestas sobre ilustraciones en materiales didacticos o libros infantiles.

## Benchmarks y rendimiento

Evaluado con lmms-eval (commit 7439e2bf), decodificacion greedy, batch size 16 y prompts por defecto de cada tarea.

| Benchmark | Puntuacion |
|---|---|
| POPE (F1) | 83,3 |
| MME (/2800) | 1109,5 |
| HallusionBench | 25,8 |
| COCO captions (CIDEr) | 93,9 |
| NoCaps (CIDEr) | 84,2 |
| GQA (testdev) | 42,6 |
| TextVQA (val) | 42,5 |
| RealWorldQA | 36,7 |

Desglose adicional de MME: percepcion 880,9 sobre 2000 y cognicion 228,6 sobre 800. POPE con metrica de exactitud: 82,8. No se han publicado comparaciones directas con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en precision completa (fp32) los 514 M de parametros ocupan aproximadamente 2,1 GB; en fp16/bf16, unos 1,0 GB. El repo pesa 1,0 GB, coherente con pesos en bf16/fp16.
- GPU recomendadas: cualquier GPU NVIDIA con al menos 4 GB de VRAM para fp16 con margen para activaciones; una RTX 3060, RTX 4060 o superior es suficiente. Para mayor throughput, A100 o H100 no son necesarias pero permiten mayor batch size.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU NVIDIA moderna con 4 GB o mas de VRAM.
- Restriccion critica: los kernels Triton de `flash-linear-attention` para RMSNorm solo funcionan sobre tensores CUDA, por lo que la inferencia en CPU no esta soportada segun la model card.
- Opciones de despliegue: transformers (version 5.8.1) con `AutoModelForImageTextToText` y `trust_remote_code=True`; requiere `torch==2.12.0`, `flash-linear-attention==0.5.0` y `timm==1.0.25`. No se documentan soportes para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone de datos de benchmarks de modelos comparables en la informacion proporcionada, por lo que la comparacion se limita a caracteristicas estructurales.

| Modelo | Parametros | Contexto | Licencia | Idiomas |
|---|---|---|---|---|
| PanoVLM1.5-500M | 514 M | no disponible | Apache 2.0 | en |
| Modelos VLM ligeros tipo PaliGemma-3B | ~3 B | no disponible | Gemma license | multilingue |
| Modelos VLM ligeros tipo SmolVLM-500M | ~500 M | no disponible | Apache 2.0 | multilingue |

La comparacion cuantitativa de rendimiento con alternativas de la misma categoria no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- Idioma: solo entrenado y evaluado en ingles; el rendimiento en castellano u otros idiomas no esta garantizado.
- Alucinacion: HallusionBench de 25,8 y MME de cognicion de 228,6 sobre 800 indican una capacidad limitada de razonamiento visual complejo y riesgo de respuestas incorrectas ante preguntas que requieren inferencia sobre la imagen.
- Rendimiento modesto en tareas exigentes: GQA 42,6, TextVQA 42,5 y RealWorldQA 36,7 reflejan un modelo de gama ligera, no apto para tareas de razonamiento visual de alta precision.
- Contexto: la longitud de contexto no esta documentada, lo que dificulta planificar despliegues con conversaciones o documentos largos.
- Dependencia de CUDA: la inferencia requiere GPU NVIDIA por el uso de kernels Triton; no hay ruta CPU documentada.
- Dependencias estrictas: versiones fijadas de torch, transformers, flash-linear-attention y timm; la incompatibilidad de versiones puede romper la carga del modelo.
- `trust_remote_code=True`: obliga a ejecutar codigo remoto del repositorio, lo que implica una revision de seguridad previa en entornos de produccion.
- Licencia Apache 2.0: permite uso comercial sin restricciones adicionales, pero no se ofrece garantia ni soporte por parte del autor.
- Madurez: el modelo tiene 0 descargas y 0 likes en el momento de la ficha, sin ecosistema de terceros ni validacion externa conocida.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/PanocularAI/PanoVLM1.5-500M
- Modelo de lenguaje base: https://huggingface.co/PanocularAI/PanoLM1.5-400M
- lmms-eval (framework de evaluacion): https://github.com/EvolvingLMMs-Lab/lmms-eval
- flash-linear-attention: https://github.com/fla-org/flash-linear-attention
- timm (FastViT): https://github.com/huggingface/pytorch-image-models
