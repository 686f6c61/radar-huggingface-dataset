# marutichintan/Patram1.5-7B-mlx-8bit

## Resumen

Patram1.5-7B-mlx-8bit es la cuantizacion en 8 bits para MLX del modelo multimodal Patram 1.5 7B, desarrollado originalmente por BharatGen Technology Foundation y publicado en este repositorio por el usuario marutichintan. Se trata de un modelo de comprension de documentos (image-text-to-text) que combina un codificador visual SigLIP2 con un decodificador de lenguaje Olmo-3-7B-Instruct, orientado a tareas de OCR, extraccion de campos y respuesta a preguntas sobre imagenes de documentos.

La relevancia de esta version concreta reside en su formato: MLX con cuantizacion afin de 8 bits y tamano de grupo 64, pensado para ejecutarse en Macs con Apple Silicon mediante la libreria MLX y el runtime oMLX. El modelo original suma 7.760.786.896 parametros (7,8 mil millones) y soporta una ventana de contexto de 32.768 tokens, lo que permite procesar paginas completas con estructura compleja.

Al ser una cuantizacion, no introduce cambios arquitectonicos respecto al modelo base, pero si requiere codigo personalizado (custom code) y un adaptador de lanzamiento propio para funcionar en oMLX, ya que el cargador estandar no reconoce la arquitectura de Patram sin modificaciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Multimodal vision-language: codificador SigLIP2 + decodificador transformer Olmo-3-7B-Instruct |
| Parametros totales | 7.760.786.896 (7,8B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 32.768 tokens |
| Tipos de cuantizacion | MLX afin 8-bit, tamano de grupo 64 (normas, biases, embeddings posicionales y matrices con ancho de entrada no divisible por 64 en precision original) |
| Idiomas soportados | Ingles y paginas con code-mixing |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX), libreria mlx, custom_code |

## Arquitectura y entrenamiento

El modelo es un sistema multimodal compuesto por dos bloques: un codificador visual google/siglip2-so400m-patch14-384, que procesa la imagen del documento a parches de 14x14 con resolucion de 384, y un decodificador de lenguaje allenai/Olmo-3-7B-Instruct. Esta combinacion esta especializada en comprension de documentos: el codificador extrae representaciones visuales del texto impreso y el decodificador genera respuestas en lenguaje natural condicionadas a esas representaciones.

Esta ficha corresponde a la cuantizacion, no al entrenamiento original. La model card no detalla el volumen de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO; esos datos corresponden al modelo base bharatgenai/Patram1.5-7B y no se incluyen en la informacion disponible. La cuantizacion aplica cuantizacion afin de 8 bits con grupo de 64 sobre las matrices elegibles, manteniendo en precision original normas, biases, embeddings posicionales y de tokens extra, y cualquier matriz cuyo ancho de entrada no sea divisible por 64. El autor declara comprobaciones numericas del port MLX sin cuantizar frente al modelo BF16 original, ademas de validaciones de inferencia de imagen, inferencia de texto en oMLX y guardado de ajustes tras reubicar el modelo de carpeta.

## Capacidades

- Comprension de documentos e imagenes: responde preguntas sobre el contenido de una pagina (por ejemplo, identificar el consumidor de una factura de electricidad).
- OCR: extraccion de texto de una pagina de imagen mediante la instruccion "give me ocr for this page".
- Generacion de texto conversacional en ingles a partir de entradas imagen-texto.
- Procesamiento de paginas con code-mixing (texto en ingles mezclado con otros alfabetos o terminos).
- Ventana de contexto de 32.768 tokens, adecuada para documentos de varias paginas o respuestas largas.
- No soporta, segun el adaptador incluido: tool calling, decodificacion especulativa, restricciones gramaticales, video, URLs de imagen remotas ni cache paginada/SSD de oMLX. El tamano de lote es uno.

## Casos de uso

- Digitalizacion de facturas y recibos: enviar la imagen de una factura y pedir campos concretos (nombre del titular, importe, fecha) con respuestas cortas y directas, como demuestra el ejemplo de la model card con una factura de electricidad.
- OCR de documentos escaneados: extraer el texto completo de una pagina con `--max-tokens 4096` para alimentar pipelines posteriores de indexacion o busqueda.
- Extraccion de datos estructurados de formularios: plantear preguntas acotadas sobre cada campo de un formulario escaneado y validar la respuesta contra el esquema esperado.
- Procesamiento local en Mac: al estar en formato MLX 8-bit, permite ejecutar comprension de documentos en un Apple Silicon sin depender de GPUs dedicadas ni de servicios en la nube.
- Asistencia a la revision documental: responder preguntas de verificacion sobre contratos o extractos en ingles, aprovechando el contexto de 32.768 tokens para paginas densas.
- Prototipado de aplicaciones de vision-lenguaje: servir el modelo via oMLX con API HTTP en localhost para integrarlo en demos y pruebas de concepto antes de pasar a produccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo reporta validaciones funcionales (inferencia de imagen independiente, inferencia de texto en oMLX, inferencia de imagen en streaming y guardado de ajustes) y comprobaciones numericas del port MLX frente al modelo BF16, sin cifras de MMLU, OCRBench u otras metricas. El autor advierte explicitamente que estas comprobaciones no constituyen un benchmark OCR exhaustivo del modelo cuantizado.

## Requisitos de hardware

- VRAM/ memoria unificada estimada: el repositorio ocupa 8,4 GB en pesos de 8 bits; se recomienda al menos 12-16 GB de memoria unificada para cargar el modelo y procesar imagenes con contexto amplio.
- Plataforma objetivo: Macs con Apple Silicon (MLX). No se distribuyen pesos GGUF ni safetensors para CUDA.
- GPU dedicadas: no aplica de forma nativa; el runtime es MLX y no se documenta soporte para A100, H100 o RTX 4090.
- Cabe en GPU de consumo: si, en equipos Apple Silicon con memoria unificada suficiente (los Mac con 16 GB o mas son el objetivo declarado).
- Despliegue: oMLX (con Trust Remote Code activado y contexto fijado a 32.768) o inferencia MLX independiente mediante los scripts `run.sh` y `run-omlx.sh` incluidos. Requiere uv y las versiones probadas: MLX 0.32.5, Transformers 4.57.6, PyTorch 2.10.0 y oMLX 0.8.3.
- Latencia y throughput: no disponibles. El adaptador funciona con tamano de lote uno y sin decodificacion especulativa.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato/plataforma | Licencia |
|---|---|---|---|---|
| Patram1.5-7B-mlx-8bit (esta ficha) | 7,8B | 32.768 | MLX 8-bit, Apple Silicon | Apache 2.0 |
| bharatgenai/Patram1.5-7B (base) | 7,8B | 32.768 | BF16, formato original | Apache 2.0 |
| Modelos OCR/VLM de 7B comparables | no disponible | no disponible | no disponible | no disponible |

La unica comparacion documentada con datos es frente al modelo base sin cuantizar, del que esta version deriva. No se dispone de informacion sobre alternativas equivalentes de la misma categoria en los datos proporcionados.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la informacion disponible; al estar entrenado principalmente en ingles, el rendimiento en otros idiomas puede degradarse.
- Riesgo de alucinacion: inherente a los modelos generativos; en tareas de OCR y extraccion de campos conviene validar las respuestas contra el documento original.
- Limitaciones de contexto e idioma: ventana de 32.768 tokens y soporte declarado solo de ingles y paginas con code-mixing.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero se deben conservar los avisos de licencia y atribucion del modelo base (archivos LICENSE y NOTICE incluidos).
- Caveats de produccion: requiere Trust Remote Code y un adaptador propio; el cargador estandar de oMLX no soporta la arquitectura sin modificaciones. No hay tool calling, decodificacion especulativa, restricciones gramaticales, video, URLs remotas ni cache paginada. Tamano de lote uno. Las validaciones publicadas no son un benchmark OCR exhaustivo.
- Es una cuantizacion de un tercero, no del autor original; la calidad final depende del proceso de cuantizacion y del runtime MLX.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/marutichintan/Patram1.5-7B-mlx-8bit
- Modelo base: https://huggingface.co/bharatgenai/Patram1.5-7B
- Codificador visual: https://huggingface.co/google/siglip2-so400m-patch14-384
- Decodificador de lenguaje: https://huggingface.co/allenai/Olmo-3-7B-Instruct
- Guia de instalacion de uv: https://docs.astral.sh/uv/getting-started/installation/
