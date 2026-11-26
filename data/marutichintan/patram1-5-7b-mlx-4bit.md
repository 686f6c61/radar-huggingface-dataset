# marutichintan/Patram1.5-7B-mlx-4bit

## Resumen

Patram1.5-7B-mlx-4bit es una cuantización en 4 bits para MLX del modelo multimodal Patram 1.5 7B, desarrollado originalmente por BharatGen Technology Foundation. Se trata de un modelo de comprensión de documentos que combina un codificador visual SigLIP2 (google/siglip2-so400m-patch14-384) con un decodificador de lenguaje Olmo-3-7B-Instruct, orientado a tareas de lectura de documentos, OCR y respuesta a preguntas sobre imágenes de páginas.

La relevancia de esta ficha concreta reside en que es una conversión comunitaria (autor marutichintan) pensada para ejecución local en Apple Silicon mediante MLX y oMLX. El modelo original de 7.800 millones de parámetros se comprime a un repositorio de 4,5 GB gracias a la cuantización afín de 4 bits con tamaño de grupo 64, lo que permite desplegarlo en equipos de consumo con memoria unificada.

La arquitectura es personalizada (requiere Trust Remote Code) y el adaptador incluido impone limitaciones importantes: tamaño de lote uno, sin decodificación especulativa, sin tool calling, sin vídeo y sin URLs remotas de imagen. La licencia es Apache 2.0, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Multimodal vision-language: codificador SigLIP2-so400m-patch14-384 + decodificador Olmo-3-7B-Instruct (arquitectura personalizada) |
| Parametros totales | 7.760.786.896 (7,8B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens |
| Tipos de cuantizacion | MLX afín 4 bits, tamaño de grupo 64 (pesos en 4 bits; normas, sesgos, embeddings posicionales y matrices con ancho de entrada no divisible por 64 en precisión original) |
| Idiomas soportados | Inglés y páginas con mezcla de código (code-mixed) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX), repositorio de 4,5 GB |

## Arquitectura y entrenamiento

El modelo es un sistema image-text-to-text compuesto por dos componentes: un codificador visual SigLIP2 (variante so400m, patch de 14 píxeles, resolución 384) y un decodificador de lenguaje basado en Olmo-3-7B-Instruct de AllenAI. Esta combinación está especializada en comprensión de documentos, incluyendo OCR y extracción de información de páginas escaneadas.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO en el modelo original. La model card de esta cuantización no detalla el proceso de entrenamiento del modelo base. La conversión a MLX emplea cuantización afín de 4 bits con grupo 64, preservando en precisión original las normas, sesgos, embeddings posicionales y matrices cuyo ancho de entrada no es divisible por 64. El adaptador mantiene el procesador de CPU original y ejecuta las operaciones del modelo en MLX.

## Capacidades

- Comprensión de documentos e imágenes de páginas (image-text-to-text).
- OCR de páginas escaneadas o fotografías de documentos.
- Respuesta a preguntas sobre el contenido de una imagen (por ejemplo, extracción del nombre de un consumidor en una factura).
- Generación de texto conversacional multimodal en inglés.
- Manejo de páginas con mezcla de código (code-mixed).
- Contexto de hasta 32.768 tokens para documentos extensos.

Limitaciones funcionales del adaptador (no del modelo base): no implementa tool calling, decodificación especulativa, restricciones gramaticales, vídeo, URLs remotas de imagen, ni procesamiento por lotes (batch size uno).

## Casos de uso

- Digitalización de facturas y recibos: el modelo puede recibir la imagen de una factura y extraer campos concretos (nombre del titular, importe, fecha) mediante prompts dirigidos, aprovechando su especialización en comprensión de documentos.
- OCR de documentos escaneados: con el prompt adecuado y max-tokens elevado (por ejemplo 4096), genera la transcripción completa de una página, útil para pipelines de archivo y preservación documental.
- Extracción de datos estructurados de formularios: preguntas específicas sobre campos de un formulario permiten obtener valores puntuales sin necesidad de un pipeline OCR + NER separado.
- Asistencia a la revisión documental en local: al ejecutarse en Apple Silicon con MLX, permite procesar documentos sensibles sin enviarlos a servicios en la nube.
- Prototipado de aplicaciones de lectura de documentos: el servidor oMLX expone una API local (puerto configurable) que facilita integrar el modelo en demos y pruebas de concepto.
- Procesamiento de documentos en inglés con terminología técnica o código mezclado: adecuado para páginas que combinan texto en inglés con fragmentos de código o identificadores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que las comprobaciones realizadas (inferencia de imagen standalone, inferencia de texto en oMLX, inferencia de imagen en streaming y guardado de ajustes tras reubicación) son validaciones de funcionamiento, no un benchmark OCR exhaustivo del modelo cuantizado.

## Requisitos de hardware

- VRAM/memoria: el repositorio ocupa 4,5 GB; se recomienda al menos 8 GB de memoria unificada libre para inferencia con contexto moderado, y más para aprovechar los 32.768 tokens de contexto.
- Plataforma: exclusivamente Apple Silicon (MLX); no está pensado para GPU NVIDIA ni CPU x86.
- GPU de consumo: cabe en Macs con memoria unificada de 16 GB o superior; en equipos de 8 GB el margen es muy ajustado.
- Despliegue: MLX standalone (script run.sh incluido) y servidor oMLX con adaptador portátil (setup.sh + run-omlx.sh). Requiere Trust Remote Code y el adaptador incluido; un loader oMLX estándar sin modificar no soporta la arquitectura.
- Entorno probado: MLX 0.32.5, Transformers 4.57.6, PyTorch 2.10.0 y oMLX 0.8.3.
- Latencia y throughput: no disponibles. El adaptador procesa lote de tamaño uno y no implementa decodificación especulativa.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Patram1.5-7B-mlx-4bit (esta ficha) | 7,8B | 32.768 | Imagen + texto | Apache 2.0 | MLX / oMLX en Apple Silicon |
| bharatgenai/Patram1.5-7B (base) | 7,8B | 32.768 | Imagen + texto | Apache 2.0 | Pesos originales (BF16) |
| Modelos de OCR/VLM comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones de modelos alternativos en la información proporcionada para establecer una comparación cuantitativa fiable.

## Limitaciones y advertencias

- Solo inglés y páginas con mezcla de código; no se declara soporte de otros idiomas.
- El adaptador no implementa tool calling, decodificación especulativa, restricciones gramaticales, vídeo ni URLs remotas de imagen.
- Batch size fijo de uno: no apto para servir cargas concurrentes altas sin escalado externo.
- Requiere Trust Remote Code y un adaptador específico; la arquitectura personalizada no funciona con loaders estándar sin modificar.
- Las validaciones publicadas no constituyen un benchmark OCR exhaustivo; el rendimiento real en documentos diversos no está cuantificado.
- Riesgo de alucinación inherente a los modelos de lenguaje, especialmente en extracción de campos de documentos con baja calidad de imagen.
- Sesgos: no se documentan sesgos específicos en la información disponible.
- Licencia Apache 2.0 permite uso comercial, pero deben conservarse los avisos (LICENSE, NOTICE) del modelo original.
- Compatibilidad limitada a Apple Silicon; no hay soporte declarado para CUDA, vLLM, llama.cpp ni TGI.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/marutichintan/Patram1.5-7B-mlx-4bit
- Modelo base: https://huggingface.co/bharatgenai/Patram1.5-7B
- Codificador visual: https://huggingface.co/google/siglip2-so400m-patch14-384
- Decodificador de lenguaje: https://huggingface.co/allenai/Olmo-3-7B-Instruct
- Instalación de uv: https://docs.astral.sh/uv/getting-started/installation/
- Revisión del modelo base: 02bef1fe7f87ee19288aacca852a7314567e3d96
