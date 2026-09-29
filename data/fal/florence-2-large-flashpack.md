# fal/Florence-2-large-FlashPack

## Resumen

Florence-2-large-FlashPack es una version de Florence-2-large publicada por fal que ha sido sometida a un proceso de preentrenamiento continuado (continued pretraining) sobre el checkpoint original de Microsoft, con una longitud de contexto ampliada a 4.000 tokens. Se distribuye empaquetada mediante FlashPack, el cargador de pesos de alta velocidad que fal utiliza en su flota de inferencia serverless desplegada sobre nodos H100, H200 y B200. El modelo conserva la arquitectura secuencia-a-secuencia de Florence-2, disenada para resolver tareas de vision y vision-lenguaje mediante prompts de texto como `<OD>`, `<CAPTION>` o `<OCR>`.

El modelo base Florence-2-large cuenta con aproximadamente 0,77 mil millones de parametros y fue entrenado sobre FLD-5B, un dataset con 5.400 millones de anotaciones sobre 126 millones de imagenes. Esta variante concreta anade una fase de continued pretraining con solo 0,1B muestras, segun indica el propio autor, lo que limita su grado de ajuste. La tarea de OCR ha sido modificada para introducir saltos de linea (`\n`) como separador, un cambio relevante para pipelines de extraccion de texto estructurado.

La relevancia de esta ficha radica en que se trata de una publicacion muy reciente (creada y actualizada el 29 de septiembre de 2026), con un volumen de descargas todavia marginal (5) y sin likes. Su interes esta en mostrar como fal empaqueta modelos de vision bajo su infraestructura FlashPack, mas que en constituir un estado del arte en tareas de vision. El autor advierte explicitamente de que el modelo "podria no estar bien entrenado".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer secuencia-a-secuencia (encoder-decoder) para vision-lenguaje |
| Parametros totales | 0,77B (variante large) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 4.000 tokens (segun model card) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el modelo original esta orientado predominantemente al ingles) |
| Licencia | MIT (con enlace a la licencia de microsoft/Florence-2-large) |
| Formato de pesos | FlashPack (cargador de pesos de fal) / safetensors de transformers; tamano del repositorio 3,1 GB |
| Pipeline | image-text-to-text |
| Dataset de entrenamiento | FLD-5B (5.400 millones de anotaciones, 126 millones de imagenes) |
| Contexto adicional | Fase de continued pretraining con 0,1B muestras |

## Arquitectura y entrenamiento

Florence-2 emplea una arquitectura secuencia-a-secuencia que combina un codificador visual con un decodificador de texto basado en transformers. Esta concepcion unificada permite tratar tareas heterogeneas (captioning, deteccion de objetos, segmentacion, grounding, OCR) como problemas de generacion de secuencias guiados por un prompt textual. El modelo original se entreno sobre FLD-5B, un corpus a gran escala de anotaciones visuales generado de forma semiautomatica.

Esta version concreta, publicada por fal, parte del checkpoint microsoft/Florence-2-large y aplica un continued pretraining con 0,1B muestras y una ventana de contexto ampliada hasta 4.000 tokens. El autor indica explicitamente que dicho entrenamiento adicional es limitado y que el modelo "podria no estar bien entrenado". Se ha modificado la tarea de OCR para que utilice el salto de linea (`\n`) como separador, lo que altera el formato de salida respecto al original y puede afectar a codigo de post-procesado escrito para el checkpoint de Microsoft. No se documentan en la informacion disponible fases de RLHF, DPO ni tecnicas de decodificacion especulativa.

## Capacidades

- Generacion de descripciones de imagen en varios niveles de detalle: `<CAPTION>`, `<DETAILED_CAPTION>` y `<MORE_DETAILED_CAPTION>`.
- Deteccion de objetos con cajas delimitadoras y etiquetas mediante el prompt `<OD>` (formato de salida con `bboxes` y `labels`).
- Caption to phrase grounding: localizacion de frases concretas de un texto sobre la imagen (`<CAPTION_TO_PHRASE_GROUNDING>`).
- Dense region caption: descripcion de regiones densas con cajas y etiquetas asociadas.
- OCR con separador de linea (`\n`) actualizado en esta version.
- Tareas de segmentacion referenciada por expresion o por region (propias de la familia Florence-2).
- Procesamiento multimodal imagen-texto en un unico modelo prompt-based, sin necesidad de cabezas especificas por tarea.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible (predominio del ingles en el modelo original).
- Modo de pensamiento (thinking) o vision/audio adicionales: no disponible.

## Casos de uso

- Digitalizacion y extraccion de texto en documentos: el OCR con separador de linea permite reconstruir parrafos de facturas, formularios o articulos escaneados y alimentar pipelines de indexacion en buscadores corporativos.
- Etiquetado automatico de catalogos de e-commerce: mediante `<DETAILED_CAPTION>` y `<OD>` se pueden generar descripciones y atributos de producto (categoria, color, posicion) a partir de fotografias de miles de referencias.
- Moderacion y analisis de contenido visual: la deteccion de objetos y el dense region caption permiten localizar y clasificar elementos potencialmente problematicos en imagenes subidas por usuarios.
- Accesibilidad para personas con discapacidad visual: la generacion de descripciones detalladas permite producir texto alternativo para imagenes web o contenidos digitales de forma automatizada.
- Segmentacion para edicion de imagen y retoque: las tareas de segmentacion por region o por expresion permiten aislar sujetos (por ejemplo, "el coche rojo") para flujos de recorte o eliminacion de fondo.
- Grounding para vision en robotica o interfaces: la combinacion de deteccion y grounding de frases facilita que un sistema localice un objeto descrito en lenguaje natural dentro de una escena capturada por camara.
- Analisis de inventario y retail: la deteccion de multiples objetos por imagen permite contar y clasificar productos en estanterias o almacenes de forma batch.

## Benchmarks y rendimiento

La informacion disponible solo incluye un dato concreto de evaluacion: COCO OD AP 39,8 indicado por el autor en la model card. No se han publicado en la informacion disponible resultados completos en otros benchmarks (MMLU, HumanEval, GSM8K, VQA, RefCOCO, etc.).

| Benchmark | Resultado |
|---|---|
| COCO Object Detection AP | 39,8 |

No debe interpretarse este unico valor como una validacion global del modelo, especialmente teniendo en cuenta la advertencia del autor sobre el entrenamiento limitado.

## Requisitos de hardware

- VRAM estimada para inferencia: en float16 el modelo de 0,77B ocupa aproximadamente 1,5-2 GB de pesos; el repositorio completo pesa 3,1 GB, por lo que cabe holgadamente en GPUs con 4-6 GB de VRAM.
- GPU recomendadas: cualquier GPU moderna con al menos 6 GB de VRAM (RTX 3060, RTX 4060, RTX 4090). Para despliegue a gran escala, fal lo sirve sobre nodos H100, H200 y B200 mediante FlashPack.
- Compatibilidad con GPU de consumo: si, cabe en practicamente cualquier GPU de consumo actual e incluso en algunos entornos CPU, dado su tamano reducido.
- Opciones de despliegue: transformers con `trust_remote_code=True` y `AutoModelForCausalLM`; FlashPack para carga de pesos de alto throughput en infraestructura serverless; el soporte en vLLM, llama.cpp u Ollama no esta documentado en la informacion disponible.
- Latencia y throughput estimados: no disponible. FlashPack esta disenado para acelerar la carga de pesos en flotas serverless, pero no se publican cifras de latencia por token ni throughput en esta ficha.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| fal/Florence-2-large-FlashPack | 0,77B | 4.000 tokens | Continued pretraining (0,1B muestras) sobre Florence-2-large, OCR con `\n` | MIT | HuggingFace (fal) |
| microsoft/Florence-2-large | 0,77B | no disponible | Preentrenado con FLD-5B | MIT | HuggingFace (microsoft) |
| microsoft/Florence-2-large-ft | 0,77B | no disponible | Fine-tuning sobre coleccion de tareas downstream | MIT | HuggingFace (microsoft) |
| microsoft/Florence-2-base-ft | 0,23B | no disponible | Fine-tuning sobre coleccion de tareas downstream | MIT | HuggingFace (microsoft) |

La diferencia principal de esta version frente a los checkpoints de Microsoft es el contexto ampliado a 4.000 tokens, el separador de linea en OCR y el empaquetado FlashPack orientado a despliegue serverless en fal. Como contrapartida, el entrenamiento adicional es limitado y podria degradar el rendimiento general frente a los modelos `-ft` oficiales, que estan especificamente ajustados para tareas downstream.

## Limitaciones y advertencias

- El autor advierte explicitamente de que el modelo solo ha recibido 0,1B muestras de continued pretraining y "podria no estar bien entrenado", por lo que no se recomienda asumirlo como equivalente a los checkpoints Florence-2-large-ft.
- Riesgo de alucinacion en captioning y OCR: al tratarse de un modelo generativo, puede producir descripciones o texto que no se corresponden con la imagen.
- El cambio en el OCR para introducir saltos de linea puede romper codigo de post-procesado escrito para el checkpoint original de Microsoft.
- Idiomas soportados no documentados; el modelo original esta orientado al ingles y su rendimiento en castellano no esta garantizado.
- Sesgos conocidos: no se documenta una evaluacion de sesgos en la informacion disponible, pero al derivar de un dataset semiautomatico a gran escala puede heredar sesgos de representacion.
- Licencia MIT segun el repositorio de fal, aunque el enlace de licencia apunta a microsoft/Florence-2-large; conviene verificar la compatibilidad para uso comercial y el cumplimiento del aviso de Microsoft.
- El modelo requiere `trust_remote_code=True`, lo que implica ejecutar codigo personalizado del autor del repositorio y anade riesgo operativo en produccion.
- Repositorio con muy baja traccion (5 descargas, 0 likes) y fechas de publicacion muy recientes, por lo que la validacion comunitaria es practicamente nula.
- No se documentan capacidades de tool calling ni de agentes, por lo que no es adecuado para orquestacion multi-paso sin desarrollo adicional.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/fal/Florence-2-large-FlashPack
- Modelo base original: https://huggingface.co/microsoft/Florence-2-large
- Informe tecnico de Florence-2 (arXiv 2311.06242): https://arxiv.org/abs/2311.06242
- Notebook de inferencia y visualizacion de Florence-2-large: https://huggingface.co/microsoft/Florence-2-large/blob/main/sample_inference.ipynb
- API de Florence 2 Large en fal.ai: https://fal.ai/docs/model-api-reference/vision-api/florence-2-large
- Repositorio de FlashPack (fal-ai): https://github.com/fal-ai/flashpack
- Repositorio espejo comunitario de Florence-2-large: https://github.com/zcxboy/Florence-2-large
