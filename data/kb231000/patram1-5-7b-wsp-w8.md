# kb231000/Patram1.5-7B-WSP-W8

## Resumen

Patram1.5-7B-WSP-W8 es una versión comprimida del checkpoint multimodal `bharatgenai/Patram1.5-7B`, publicada por el usuario kb231000. Se trata de un modelo de 7B parámetros orientado a comprensión visual de documentos (image-text-to-text), con capacidades de OCR y conversión de documentos a Markdown. La variante WSP-W8 aplica una técnica denominada Weight-Space Programming (WSP), que reduce el peso del modelo de 15,52 GB en bfloat16 a aproximadamente 7,8 GB mediante auditoría estática del espacio de pesos y edición quirúrgica, sin reentrenamiento ni descenso de gradiente.

La compresión combina factorización de bajo rango por SVD en las proyecciones Q/K de atención (donde se detectaron subespacios nulos muertos en los pares RoPE) y cuantización simétrica por fila a int8 en las capas lineales del decodificador y del vision tower, manteniendo en bfloat16 las partes más sensibles (lm_head, adaptadores, embeddings de parches y normalizaciones). El resultado es un checkpoint que se ejecuta como un modelo estándar de Hugging Face sin dependencias de cuantización externas.

Es relevante ahora porque demuestra una vía de compresión casi sin pérdida (RMSE inferior al 1,1 % en la mayoría de tensores cuantizados) que reduce a la mitad el espacio en disco y la VRAM necesaria para un modelo multimodal de 7B, manteniendo la API de transformers y la licencia Apache 2.0 del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (decodificador LLM de 32 capas + vision tower), con atención GQA-8 y MLP SwiGLU; checkpoint comprimido mediante WSP (SVD de bajo rango + int8) |
| Parametros totales | 7B (heredados del modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | W8: int8 simétrico por fila con escalas bfloat16 en capas lineales del LLM y del vision tower; bfloat16 íntegro en lm_head, adaptadores, embeddings de parches/posicionales y normalizaciones |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (checkpoint de transformers con código custom) |

## Arquitectura y entrenamiento

El modelo base es un transformer multimodal con un decodificador de 32 capas que usa atención con cabezas agrupadas (GQA-8), MLP SwiGLU y codificación posicional RoPE, acoplado a un vision tower con 25 capas lineales y un adaptador compuesto por `pool_attn` y `projector`. La auditoría del espacio de pesos reveló que entre el 9,4 % y el 69,2 % de las coordenadas de `q_norm`/`k_norm` (media del 21,9 %) son simultáneamente inferiores a 1e-3 en pares RoPE `(j, j+64)`, respaldadas por valores singulares nulos en `W_Q` y `W_K`; en la capa 0, el 99 % de la energía espectral de `W_Q`/`W_K` se concentra en solo el 18,6 %/20,2 % del rango. Las capas con `r99.5 <= 1600` se comprimen mediante factorización SVD exacta (`Patram15LowRankLinear`) preservando al menos el 99,5 % de la energía espectral.

El resto de la compresión aplica cuantización int8 simétrica por fila a las 32 capas del decodificador y a las 25 capas lineales del vision tower, con errores RMSE entre 0,85 % y 1,45 %. Se preservan intactas las 32 capas y los 11.008 canales MLP (sin neuronas SwiGLU muertas, `r99 = 92–94 %`), así como `lm_head.weight` (la de mayor sensibilidad a W8, con 1,93 % RMSE), `model.adapter.*`, `embed_tokens.extra_weight`, `vision_tower.patch_embedding`, `vision_tower.positional_embedding` y todos los parámetros de normalización y bias. No se ha realizado ningún reentrenamiento ni ajuste fino: la compresión es puramente estática sobre el checkpoint original.

## Capacidades

- Generación de texto conversacional multi-turno en inglés.
- Comprensión visual de documentos (visual document understanding).
- OCR y extracción de texto desde imágenes de documentos.
- Conversión de documentos a Markdown (parseo estructurado).
- Procesamiento conjunto de imagen y texto mediante el pipeline `image-text-to-text`.
- Carga directa con `AutoModelForImageTextToText` y `AutoProcessor` de transformers, con `trust_remote_code=True`.
- Ejecución en CUDA (float16 en T4/P100, bfloat16 en Ampere/Hopper) y en CPU.
- No se documenta soporte de tool calling, function calling, agentes ni modo de razonamiento explícito en la información disponible.

## Casos de uso

- Digitalización de facturas y albaranes: el modelo recibe la imagen del documento y devuelve el contenido en Markdown, lo que permite alimentar pipelines de extracción estructurada sin OCR externo.
- Conversión de PDFs escaneados a Markdown: útil para construir bases de conocimiento o repositorios documentales indexables a partir de material impreso.
- Procesamiento de formularios y tablas: al conservar el vision tower en precisión completa en sus embeddings, mantiene la capacidad de leer estructuras tabulares en documentos administrativos.
- Atención al cliente sobre documentación adjunta: el modelo puede responder preguntas en inglés sobre imágenes de contratos o manuales enviadas por el usuario en una conversación multi-turno.
- Despliegue en hardware limitado: con ~7,8 GB de pesos, cabe en GPUs de consumo con 12-16 GB de VRAM (por ejemplo, RTX 3060 12 GB, RTX 4070 Ti, RTX 4080) usando float16 o bfloat16, lo que facilita prototipos locales de OCR.
- Servicio de extracción de datos en backend: al no requerir bitsandbytes ni AutoGPTQ, se integra en contenedores estándar de transformers sin dependencias de cuantización adicionales.
- Archivado y migración de documentación: la reducción a la mitad del tamaño en disco abarata el almacenamiento de checkpoints en entornos con muchos modelos desplegados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 8 GB solo para pesos en bfloat16/float16; con activaciones y caché KV, se recomienda un mínimo de 12 GB para imágenes y contextos moderados.
- GPU recomendadas: A100, H100 o L40S para producción; RTX 4090 (24 GB) para desarrollo de alta gama.
- Cabe en GPU de consumo: sí, en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070 Ti, RTX 4080 y RTX 4090, siempre que se limite el tamaño de imagen y la longitud de generación.
- Opciones de despliegue: transformers con `AutoModelForImageTextToText` (soporte oficial del checkpoint); no se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Patram1.5-7B-WSP-W8 | 7B | no disponible | Apache 2.0 | safetensors (int8 + bf16) | Compresión WSP sin reentrenamiento, ~7,8 GB |
| bharatgenai/Patram1.5-7B | 7B | no disponible | Apache 2.0 | safetensors (bfloat16) | Modelo base, 15,52 GB |
| Alternativas de OCR multimodal de 7B | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificados en la información proporcionada |

## Limitaciones y advertencias

- Solo soporta inglés según la model card; no se garantiza calidad en castellano ni en otros idiomas.
- La compresión int8 introduce un error RMSE de hasta el 1,1 % en las capas del decodificador y hasta el 1,45 % en el vision tower; aunque se describe como casi sin pérdida, no se han publicado evaluaciones comparativas frente al modelo base.
- No se han publicado benchmarks que cuantifiquen la degradación real en tareas de OCR o VQA tras la compresión.
- Riesgo de alucinación inherente a los modelos generativos multimodales, especialmente en documentos con baja resolución, tablas complejas o texto manuscrito.
- Requiere `trust_remote_code=True` para cargar código personalizado (`Patram15LowRankLinear`), lo que implica ejecutar código del autor del checkpoint.
- El checkpoint tiene cero descargas y cero likes en el momento de la consulta, por lo que no hay validación comunitaria documentada.
- No se documenta soporte para tool calling ni para flujos de agentes, lo que limita su uso en pipelines automatizados complejos sin capas adicionales.
- Aunque la licencia es Apache 2.0 y permite uso comercial, conviene revisar el archivo NOTICE y las condiciones del modelo base para atribución.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kb231000/Patram1.5-7B-WSP-W8
- Modelo base: https://huggingface.co/bharatgenai/Patram1.5-7B
