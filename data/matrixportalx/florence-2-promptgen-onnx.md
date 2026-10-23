# matrixportalx/Florence-2-PromptGen-onnx

## Resumen

Florence-2-PromptGen-onnx es un espejo en formato ONNX del modelo MiaoshouAI/Florence-2-base-PromptGen-v2.0, un ajuste fino de Microsoft Florence-2-base-ft especializado en generar instrucciones de texto (prompts) a partir de una imagen. Lo publica el usuario matrixportalx para que sus aplicaciones «Rüya» y «Esin» puedan seguir accediendo a los ficheros aunque los repositorios de origen se eliminen o se oculten; el repositorio tiene 0,5 GB y no registra descargas ni «likes» en el momento de la consulta.

El problema que resuelve es práctico: permite ejecutar un modelo imagen-a-texto en un telefono, en CPU, mediante ONNX Runtime. Para ello el codificador visual se mantiene en fp32 y la mitad lingüística (embeddings, encoder y decoder fusionado) se convierte a int8, lo que reduce el peso y el coste de computo a cambio de una perdida de calidad que el autor no cuantifica.

Es relevante para quien necesite un generador de prompts para Stable Diffusion totalmente offline y ligero, pero conviene tratarlo como un artefacto de despliegue, no como un modelo nuevo: no hay model card técnica propia, no se publican resultados de benchmarks y la informacion de entrenamiento del ajuste fino no esta disponible en el repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder con codificador visual DaViT (linaje Florence-2); no detallada en la model card del repositorio |
| Parametros totales | Aproximadamente 0,23 B (232 M), heredados de Florence-2-base (*) |
| Parametros activos | No aplica: modelo denso |
| Longitud de contexto | No disponible en la model card; la configuracion publica de Florence-2-base fija 1.024 posiciones en el decodificador de texto (*) |
| Tipos de cuantizacion | Codificador visual en fp32; `embed_tokens`, `encoder_model` y `decoder_model_merged` en int8 (ONNX quantized) |
| Idiomas soportados | No disponible |
| Licencia | MIT |
| Formato de pesos | ONNX (fp32 e int8), mas `tokenizer.json`, `vocab.json` y `preprocessor_config.json` |

(*) Dato procedente de la documentacion publica de Florence-2-base, no incluido en la model card de este repositorio. Verificar antes de usarlo en produccion.

Ficheros incluidos: `onnx/vision_encoder.onnx`, `onnx/embed_tokens_quantized.onnx`, `onnx/encoder_model_quantized.onnx`, `onnx/decoder_model_merged_quantized.onnx`, `tokenizer.json`, `vocab.json`, `preprocessor_config.json` y `KAYNAK-README.md` (copia del README original). No se incluyen pesos GGUF pese a que la etiqueta `gguf` figura en los tags del repositorio.

## Arquitectura y entrenamiento

El repositorio no describe la arquitectura; se limita a declarar la procedencia: los grafos ONNX provienen de AbrahamPJ/florence2-promptgen-onnx (MIT), que a su vez deriva de los grafos de onnx-community, y el modelo original es MiaoshouAI/Florence-2-base-PromptGen-v2.0, un ajuste fino de Microsoft Florence-2-base-ft. Florence-2 es un modelo secuencia-a-secuencia que combina un codificador de imagen DaViT con un encoder-decoder de texto tipo transformer, entrenado con una mezcla de tareas formuladas como generacion de texto (captioning, deteccion de objetos, grounding, OCR y region proposal). El ajuste PromptGen v2.0 reorienta esa capacidad hacia la redaccion de prompts descriptivos para modelos de difusion.

La innovacion de esta publicacion es exclusivamente de despliegue: cuantizacion int8 de la parte lingüistica, decodificador fusionado (`decoder_model_merged`) para simplificar el grafo autoregresivo y ejecucion en CPU via ONNX Runtime en dispositivos Snapdragon. No hay informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, el uso de RLHF/DPO ni las tecnicas de alineacion del ajuste fino: esos datos no estan disponibles en la informacion proporcionada.

## Capacidades

- Generacion de prompts textuales a partir de una imagen: es la funcion principal del ajuste fino PromptGen v2.0.
- Descripcion de imagenes y captioning detallado, capacidad heredada del modelo base Florence-2.
- Ejecucion en CPU sin GPU, mediante ONNX Runtime, orientada a aplicaciones moviles.
- Inferencia offline: todos los ficheros necesarios (pesos, tokenizador y preprocesador) estan en el repositorio.
- Soporte de tool calling o function calling: no disponible; no se documenta.
- Soporte de agentes o razonamiento multi-paso: no disponible; no se documenta.
- Capacidades multilingues: no disponibles; no se declaran idiomas en la model card.
- Capacidades especiales (modo thinking, vision, audio): vision si (entrada de imagen); audio y modo thinking no.

## Casos de uso

- Generacion de prompts para Stable Diffusion en movil: la aplicacion carga el codificador visual fp32 y el decodificador int8 con ONNX Runtime y obtiene una descripcion textual que se reutiliza como prompt positivo, sin conexion a internet.
- Etiquetado semiautomatico de datasets de imagenes: se procesa un lote de imagenes y se generan descripciones que un revisor humano corrige despues; el coste por imagen es bajo al ejecutarse en CPU.
- Texto alternativo para accesibilidad: integrado en una app de galeria o de captura de pantalla que genera descripciones breves para lectores de pantalla, con la ventaja de que no se envian imagenes a un servidor.
- Asistencia a la creacion de contenido en redes: el usuario fotografia una escena y el modelo propone una descripcion que se convierte en pie de foto o en prompt para generar una variante estilizada.
- Catalogacion de producto en comercio electronico: generacion de descripciones base a partir de la foto del articulo, que luego se revisan y se adaptan a la ficha del catalogo.
- Preprocesado en pipelines de difusion: el modelo actua como primer eslabon (imagen a prompt) en un flujo imagen-a-imagen o imagen-a-video, alimentando el prompt a un segundo modelo de generacion.
- Indexado y busqueda de una fototeca local: generacion de descripciones que se almacenan como texto para permitir busquedas semanticas sobre imagenes sin salir del dispositivo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye metricas de calidad del prompt generado, ni comparaciones con la version PyTorch original, ni mediciones de latencia o throughput en dispositivos Snapdragon.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 2 GB en GPU y del orden de 0,5-1 GB de memoria en CPU, estimacion derivada del tamano del repositorio (0,5 GB) y no de una medicion publicada.
- GPU recomendadas: cualquier GPU consumer con 2 GB o mas de memoria (por ejemplo, GTX 1650, RTX 3060, RTX 4060) puede alojar el modelo sin problemas; el objetivo declarado del autor no es GPU sino CPU movil.
- Si cabe en GPU consumer: si, con margen amplio, aunque el interes del artefacto es la ejecucion en CPU.
- Despliegue: ONNX Runtime (incluida la variante movil para Android/iOS), con los cuatro grafos del repositorio; no se incluyen pesos GGUF ni recetas para llama.cpp, Ollama, vLLM o TGI, y estas herramientas no estan documentadas como compatibles con esta conversion.
- Latencia y throughput: no disponibles. No se aportan tiempos por imagen ni tokens por segundo en ningun dispositivo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| matrixportalx/Florence-2-PromptGen-onnx (este) | ~0,23 B (*) | No disponible | ONNX fp32 + int8 | MIT | Publico en HuggingFace, 0 descargas |
| MiaoshouAI/Florence-2-base-PromptGen-v2.0 | ~0,23 B (*) | No disponible | PyTorch (safetensors) | MIT | Publico en HuggingFace |
| microsoft/Florence-2-base-ft | ~0,23 B (*) | 1.024 posiciones (*) | PyTorch (safetensors) | MIT | Publico en HuggingFace |
| microsoft/Florence-2-large-ft | ~0,77 B (*) | 1.024 posiciones (*) | PyTorch (safetensors) | MIT | Publico en HuggingFace |

(*) Datos de la documentacion publica de la familia Florence-2; no figuran en la model card de este repositorio. El rendimiento comparado no puede evaluarse: no hay benchmarks publicados en la informacion disponible.

## Limitaciones y advertencias

- Ausencia total de evaluacion: sin benchmarks, sin comparacion con la version PyTorch original y sin medicion del impacto de la cuantizacion int8 en la calidad del prompt.
- Repositorio espejo sin mantenimiento declarado: el autor lo publica como respaldo para sus propias aplicaciones, no como un artefacto soportado para terceros; 0 descargas y 0 «likes» en la fecha consultada.
- Fecha de creacion anomala en los metadatos (2026-10-23), posterior a la fecha actual, lo que sugiere un repositorio automatizado o mal configurado.
- Especializacion estrecha: el ajuste fino esta orientado a generar prompts; otras tareas del modelo base (grounding, deteccion de objetos, OCR) pueden degradarse y no se documenta su comportamiento tras la cuantizacion.
- Idiomas no declarados: Florence-2 se entreno predominantemente en ingles, por lo que la calidad en castellano no esta garantizada ni medida.
- Riesgo de alucinacion: como modelo generativo de descripciones, puede inventar objetos, texto o atributos ausentes en la imagen; requiere revision humana en usos sensibles.
- Limitacion de contexto: la ventana de texto del modelo base es corta (1.024 posiciones segun la documentacion publica), insuficiente para prompts largos o conversaciones multi-turno.
- Licencia MIT en el repositorio, pero conviene verificar las condiciones de los repositorios de origen (AbrahamPJ, onnx-community y MiaoshouAI) antes de redistribuir, ya que la cadena de derivacion es de terceros.
- La etiqueta `gguf` y `stable-diffusion.cpp` del repositorio no se corresponden con los ficheros incluidos (solo ONNX), lo que puede inducir a error en la integracion.
- No hay garantia de paridad numerica con la version PyTorch: los grafos ONNX proceden de una conversion concreta (revision `62041a2bf351`) y no se documenta el proceso de validacion.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/matrixportalx/Florence-2-PromptGen-onnx
- Perfil del autor: https://huggingface.co/matrixportalx
- Conversion ONNX de origen: https://huggingface.co/AbrahamPJ/florence2-promptgen-onnx
- Modelo original del ajuste fino: https://huggingface.co/MiaoshouAI/Florence-2-base-PromptGen-v2.0
- Modelo base de Microsoft: https://huggingface.co/microsoft/Florence-2-base-ft
- Organizacion de grafos ONNX: https://huggingface.co/onnx-community
