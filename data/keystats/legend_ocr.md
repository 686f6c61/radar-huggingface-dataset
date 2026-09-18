# keystats/Legend_ocr

## Resumen

Legend_ocr es un modelo multimodal de tipo image-text-to-text publicado en HuggingFace por el usuario keystats. El repositorio contiene 8.292.166.656 parametros en formato safetensors, lo que sitúa al modelo en la franja de los 8,3 mil millones de parametros (~16,6 GB de pesos en el repositorio, consistente con un almacenamiento en bf16/fp16). El tag de arquitectura declarado, `qwen2_5_vl`, indica que se apoya en la familia Qwen2.5-VL de Alibaba, orientada a comprensión de imagenes, documentos y video, y el propio nombre del checkpoint sugiere un uso especializado en OCR.

El modelo está pensado para tareas de vision-lenguaje con entrada de imagen y salida de texto: transcripción de documentos, extracción de texto estructurado y conversación sobre imagenes. Sin embargo, la model card es una plantilla automática de HuggingFace sin rellenar, por lo que el autor no documenta ni el proceso de entrenamiento, ni los datos utilizados, ni los idiomas soportados, ni la licencia. Cualquier dato que no sean los parametros y los tags debe considerarse no verificado.

Su relevancia es limitada por el momento: cuenta con 0 descargas y 0 likes, y el repositorio fue creado y actualizado el 18 de septiembre de 2026 con un intervalo de menos de una hora, lo que apunta a una publicación reciente y sin validación por parte de la comunidad. Resulta útil como base para quien quiera evaluar un fine-tune de OCR sobre Qwen2.5-VL, pero no es un artefacto listo para producción sin una evaluación propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal basada en la familia Qwen2.5-VL (tag `qwen2_5_vl`); vision encoder + LLM decoder. Detalles concretos no disponibles |
| Parametros totales | 8.292.166.656 (~8,29 mil millones), segun metadatos de safetensors |
| Parametros activos | No aplica (no hay indicios de arquitectura MoE) |
| Longitud de contexto | No disponible (la model card no la especifica) |
| Tipos de cuantizacion | No disponible. El repositorio solo contiene safetensors en precision completa/mixta; no se publican GGUF, AWQ, GPTQ ni FP8 |
| Idiomas soportados | No disponible (la model card no los lista) |
| Licencia | No disponible (campo vacio en HuggingFace y en la model card) |
| Formato de pesos | Safetensors (libreria `transformers`) |

## Arquitectura y entrenamiento

El unico dato estructural fiable es el tag `qwen2_5_vl`, que vincula el modelo a la arquitectura Qwen2.5-VL: un encoder visual tipo ViT con atencion espacial (ventanas y atención completa combinadas) conectado a un decoder de lenguaje tipo transformer autoregresivo, entrenado de forma nativa para posiciones absolutas y para procesar imagenes de resolucion variable. El pipeline declarado, `image-text-to-text`, y la inclusion del tag `text-generation-inference` y `endpoints_compatible` confirman que la intencion es servir el modelo como endpoint conversacional multimodal.

No hay informacion sobre el entrenamiento: ni numero de tokens, ni composicion del dataset, ni si hubo etapas de SFT, DPO o RLHF, ni hiperparametros, ni infraestructura de computo. La model card incluye unicamente los marcadores `[More Information Needed]` en todas las secciones de detalles, datos de entrenamiento y evaluacion. Tampoco se documenta ninguna innovacion tecnica propia de este checkpoint (decodificacion especulativa, cuantizacion, destilacion, etc.).

## Capacidades

- Generacion de texto condicionada por imagen (image-text-to-text) mediante `transformers`.
- Lectura y transcripcion de documentos, segun se deduce del nombre `Legend_ocr`, aunque no hay evidencia publicada que lo confirme.
- Comprension visual general heredada de la familia Qwen2.5-VL: descripcion de escenas, interpretacion de graficos y diagramas, y dialogos multi-turno sobre imagenes.
- Compatibilidad declarada con Text Generation Inference (TGI) y con endpoints compatibles, lo que permite exponerlo como API conversacional.
- Soporte de tool calling / function calling: no disponible (no documentado).
- Capacidades de agente y razonamiento multi-paso: no disponible (no documentado).
- Cobertura multilingue: no disponible (no documentada).
- Modo thinking, audio o video: no disponible (no documentado).

## Casos de uso

- Digitalizacion de facturas y albaranes: el modelo recibe la imagen del documento y devuelve texto plano o estructurado; habria que validar con un conjunto propio la precision en campos numericos antes de integrarlo en un ERP.
- Extraccion de texto de escaneos historicos: util para pipelines de archivo documental donde se necesita transcripcion masiva, siempre que la calidad de la imagen sea suficiente.
- Procesamiento de formularios manuscritos: como modelo vision-lenguaje puede abordar campos escritos a mano, pero requiere evaluacion especifica porque la model card no reporta resultados en este tipo de tarea.
- Asistente conversacional sobre documentos: dado que el pipeline es conversacional y multi-turno, permite preguntas de seguimiento sobre el contenido de una imagen o un PDF renderizado.
- Preprocesado para pipelines RAG: generar texto a partir de imagenes que despues se indexa en una base vectorial, aprovechando que el modelo se puede servir con TGI.
- Base para fine-tuning especifico de dominio: al ser un checkpoint de ~8,3B parametros, es un punto de partida asequible para ajustar OCR en un vertical concreto (medico, legal, industrial).
- Evaluacion comparativa de modelos OCR multimodales: sirve como candidato adicional en un benchmark interno frente a otros modelos de la misma franja.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye la seccion de evaluacion cumplimentada, y no existen datos de MMLU, OCRBench, DocVQA, HumanEval ni de ninguna otra métrica para este checkpoint.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: en torno a 17-20 GB solo para los pesos (8,29B x 2 bytes ≈ 16,6 GB), mas la cache KV y las activaciones del encoder visual; en la practica conviene reservar 22-24 GB.
- VRAM estimada con cuantizacion de 8 bits: aproximadamente 9-11 GB de pesos, mas overhead.
- VRAM estimada con cuantizacion de 4 bits: aproximadamente 5-6 GB de pesos, mas overhead; requiere convertir el checkpoint, ya que el repositorio solo distribuye safetensors sin cuantizar.
- GPU recomendadas: A100 40/80 GB, H100 80 GB y L40S 48 GB para servicio en bf16 con concurrencia; RTX 4090 o RTX 3090 (24 GB) para inferencia en bf16 de una sola peticion o con lotes pequenos.
- Cabe en GPU de consumo: si, en RTX 4090/3090 (24 GB) en bf16 con margen ajustado, y en tarjetas de 12-16 GB si se aplica cuantizacion de 8 o 4 bits.
- Opciones de despliegue: `transformers` (libreria declarada), Text Generation Inference (tag `text-generation-inference`) y soluciones compatibles con la API de endpoints. vLLM es probablemente viable dado el soporte de la familia Qwen2.5-VL, pero no esta confirmado para este checkpoint. llama.cpp/Ollama requeririan una conversion a GGUF que el autor no proporciona.
- Latencia y throughput: no disponibles (no se han publicado mediciones).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| keystats/Legend_ocr | 8,29B | No disponible | No disponible | Repositorio HuggingFace con safetensors; 0 descargas |
| Qwen2.5-VL-7B-Instruct (modelo base probable) | ~8,3B | 32.768 tokens nativos, ampliable con YaRN | Apache 2.0 | Ampliamente desplegado, con variantes GGUF y cuantizadas |
| Llama-3.2-11B-Vision-Instruct | ~10,6B | 128.000 tokens | Llama 3.2 Community License | Disponible en HuggingFace con pesos oficiales |
| InternVL2.5-8B | ~8B | No verificado en la informacion disponible | MIT (no verificado en la informacion disponible) | Disponible en HuggingFace |

La comparacion es estructural: no existen datos de rendimiento publicados para Legend_ocr que permitan contrastarlo con estas alternativas en tareas de OCR o VQA. La diferencia mas relevante en terminos practicos es la licencia: frente al Apache 2.0 del modelo base de Qwen, Legend_ocr no declara licencia, lo que impide determinar si su uso comercial esta permitido.

## Limitaciones y advertencias

- Ausencia total de documentacion: la model card es una plantilla automatica; no hay informacion sobre datos de entrenamiento, evaluacion, sesgos ni uso previsto.
- Licencia indefinida: al no declararse licencia, no se puede asumir permiso de uso comercial, redistribucion ni modificacion del modelo. Cualquier despliegue en produccion requiere aclarar este punto con el autor.
- Riesgo de alucinacion: no hay evaluacion publicada sobre la fidelidad de las transcripciones; en tareas OCR esto es critico, ya que el modelo puede generar texto plausible que no aparece en la imagen.
- Idiomas no declarados: se desconoce si el ajuste conserva el multilingüismo del modelo base o si se ha especializado en un unico idioma.
- Contexto no declarado: sin conocer la ventana efectiva ni la estrategia de extension, no es posible planificar el procesamiento de documentos largos sin pruebas previas.
- Sin validacion de la comunidad: 0 descargas y 0 likes, repositorio creado y actualizado en menos de una hora, sin issues ni discusiones. No hay evidencia externa de que el checkpoint funcione correctamente.
- Fecha de creacion anomala (2026-09-18): conviene verificar la procedencia del repositorio antes de integrarlo en cualquier flujo.
- Sin cuantizaciones oficiales: desplegarlo en hardware limitado exige convertir los pesos por cuenta propia, con el riesgo de degradacion que ello implica.
- Sesgos y comportamientos indeseados: no disponibles (no evaluados por el autor).

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/keystats/Legend_ocr
- Paper de referencia para el calculo de emisiones citado en la plantilla: https://arxiv.org/abs/1910.09700
- Calculadora de impacto de machine learning: https://mlco2.github.io/impact
