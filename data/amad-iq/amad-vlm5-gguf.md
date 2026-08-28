# amad-iq/amad-vlm5-GGUF

## Resumen

amad-vlm5 es un modelo de visión-lenguaje (VLM) especializado en reconocimiento óptico de caracteres (OCR) en árabe, incluyendo escritura manuscrita y comprensión de documentos. Es un fine-tuning del modelo Qwen2.5-VL-7B-Instruct, desarrollado por el usuario amad-iq, que incorpora un modo de razonamiento ("thinking") previo a la transcripción del texto extraído de las imágenes.

Esta ficha cubre la versión cuantizada en formato GGUF, publicada el 28 de agosto de 2026, que permite ejecutar el modelo en CPU y GPU mediante llama.cpp y LM Studio sin necesidad de infraestructura especializada. El modelo tiene aproximadamente 7,6 mil millones de parámetros, licencia Apache 2.0 y soporta árabe e inglés. Su relevancia radica en cubrir un nicho poco atendido: el OCR de documentos árabes con calidad de producción, tanto impresos como manuscritos, con un peso que cabe en GPUs de consumo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen2.5-VL-7B-Instruct (transformer con encoder de visión) |
| Parametros totales | 7.615.616.512 (7,6 B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no especificada en la model card; se recomienda al menos 8192 tokens |
| Tipos de cuantizacion | F16, Q8_0, Q4_K_M (modelo) y F16 (proyector de visión, mmproj) |
| Idiomas soportados | arabe (ar), ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-VL-7B-Instruct, un transformer denso con encoder de visión que procesa imágenes mediante un proyector multimodal. Sobre esta base se ha realizado un fine-tuning orientado a OCR en árabe, reconocimiento de escritura manuscrita y comprensión de documentos, incorporando un modo de razonamiento que antepone etiquetas de pensamiento (`thinking` y `response`) a la transcripción final.

No se dispone de información detallada sobre el dataset de entrenamiento, el número de tokens utilizados ni si se aplicaron técnicas como RLHF o DPO. La model card remite al repositorio principal (amad-iq/amad-vlm5) para consultar los detalles de entrenamiento y los resultados de evaluación, que no se incluyen en esta versión GGUF.

## Capacidades

- OCR de texto impreso en arabe: extrae texto de imagenes y documentos escaneados con precision.
- Reconocimiento de escritura manuscrita en arabe, incluyendo variantes caligraficas.
- Comprension de documentos: interpreta la estructura de paginas, formularios y tablas.
- Modo de razonamiento ("thinking"): genera una cadena de pensamiento antes de emitir la transcripcion final, lo que mejora la precision en documentos complejos.
- Comprension de imagenes en general: al heredar las capacidades de Qwen2.5-VL, puede describir y responder preguntas sobre contenido visual.
- Bilingue arabe-ingles: puede transcribir en arabe y responder en ingles o viceversa.
- Integracion con llama.cpp y LM Studio mediante el archivo `mmproj` que contiene el encoder de vision.

## Casos de uso

- Digitalizacion de archivos historicos: transcribir manuscritos y documentos antiguos en arabe a texto digital buscable, aprovechando el modo thinking para resolver trazos ambiguos.
- Procesamiento de facturas y formularios: extraer campos clave (importes, fechas, nombres) de documentos comerciales en arabe para pipelines de automatizacion contable.
- Atencion al cliente con tickets escritos a mano: convertir notas manuscritas de clientes en texto estructurado para sistemas de ticketing.
- Accesibilidad: generar descripciones o transcripciones de imagenes y documentos para personas con discapacidad visual en entornos arabofonos.
- Archivado y recuperacion de documentos: indexar escaneos de contratos, expedientes y certificados en arabe para busqueda por contenido.
- Traduccion asistida: transcribir documentos en arabe y posteriormente traducirlos al ingles en un flujo de dos pasos, aprovechando el soporte bilingue del modelo.
- Educacion: convertir apuntes manuscritos de estudiantes en texto digital para plataformas de aprendizaje.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio GGUF remite al repositorio principal (amad-iq/amad-vlm5) para consultar las evaluaciones, pero dichos datos no se incluyen en la documentacion proporcionada.

## Requisitos de hardware

- Cuantizacion Q4_K_M: archivo de 4,68 GB mas 1,35 GB del proyector de vision, aproximadamente 6 GB de VRAM. Cabe en GPUs de consumo con 8 GB (RTX 3060, RTX 4060, RX 7600) y en Macs con Apple Silicon de 8 GB o mas.
- Cuantizacion Q8_0: archivo de 8,10 GB mas 1,35 GB del proyector, aproximadamente 9,5 GB de VRAM. Requiere GPUs con 12 GB o mas (RTX 3060 12 GB, RTX 4070, RTX 4080).
- Cuantizacion F16: archivo de 15,24 GB mas 1,35 GB del proyector, aproximadamente 16,6 GB de VRAM. Requiere GPUs de 24 GB (RTX 4090, A5000, A6000) o despliegue en CPU con suficiente RAM.
- Despliegue: compatible con llama.cpp (comando `llama-mtmd-cli`), LM Studio y cualquier runtime que soporte GGUF multimodal. No se ha confirmado soporte en vLLM u Ollama.
- Latencia: no disponible. Depende del hardware, la cuantizacion y la longitud de la imagen procesada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| amad-vlm5 (GGUF) | 7,6 B | no especificado | OCR arabe, manuscritos, thinking | Apache 2.0 | GGUF en HuggingFace |
| Qwen2.5-VL-7B-Instruct | 7,6 B | 32k (base) | VLM general, OCR multilingue | Apache 2.0 | safetensors, GGUF |
| Otros modelos OCR en arabe | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparativa se limita al modelo base Qwen2.5-VL-7B-Instruct, del cual deriva. No se dispone de informacion sobre otros modelos especializados en OCR arabe para establecer una comparacion directa. La ventaja principal de amad-vlm5 frente a su base es el fine-tuning especifico para arabe y el modo thinking, que deberia traducirse en mayor precision en documentos arabes, aunque no hay benchmarks publicados que lo confirmen.

## Limitaciones y advertencias

- El modelo puede emitir etiquetas de pensamiento (`thinking` y `response`) antes de la transcripcion; en produccion es necesario filtrar el texto posterior a la ultima etiqueta `response`.
- El archivo `mmproj` es obligatorio: sin el proyector de vision, el modelo no puede procesar imagenes.
- No se han publicado benchmarks en este repositorio; el rendimiento real en tareas de OCR arabe no esta verificado de forma independiente.
- El repositorio registra cero descargas y cero likes en el momento de la consulta, lo que indica que es un modelo reciente sin validacion amplia por parte de la comunidad.
- Soporte limitado a arabe e ingles; no se garantiza rendimiento en otros idiomas.
- La longitud de contexto no esta documentada; se recomienda configurar al menos 8192 tokens, lo que puede limitar el procesamiento de documentos muy extensos en una sola pasada.
- Al ser un fine-tuning de Qwen2.5-VL-7B, hereda las limitaciones del modelo base, incluyendo posibles alucinaciones en la descripcion de contenido visual ambiguo.

## Enlaces

- Repositorio GGUF: https://huggingface.co/amad-iq/amad-vlm5-GGUF
- Repositorio principal (modelo base safetensors): https://huggingface.co/amad-iq/amad-vlm5
- Documentacion de llama.cpp: https://github.com/ggml-org/llama.cpp
