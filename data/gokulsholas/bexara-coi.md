# gokulSholas/Bexara-COI

## Resumen

Bexara-COI es un modelo de comprensión de documentos basado en la arquitectura Donut (Document Understanding Transformer), desarrollado por el usuario gokulSholas y publicado en Hugging Face. Se trata de un fine-tuning de `naver-clova-ix/donut-base` orientado a la extracción de información clave (key information extraction, KIE) en el dominio de seguros, según indican sus etiquetas. El modelo combina un encoder visual (Swin Transformer) con un decoder autoregresivo de tipo BART, lo que permite procesar una imagen de documento directamente y generar texto estructurado sin necesidad de un pipeline OCR separado.

El modelo cuenta con 202.063.288 parámetros totales y un repositorio de 0,8 GB en formato safetensors. Está pensado para tareas de image-to-text sobre documentos escaneados o fotografías de formularios, pólizas y otros documentos aseguradores, donde la extracción estructurada de campos es crítica. Su relevancia radica en que aborda el problema de la digitalización de documentos aseguradores con un enfoque end-to-end, evitando la fragilidad de los pipelines OCR + reglas.

No obstante, la información pública disponible es muy limitada: no se han publicado idiomas soportados, datos de entrenamiento, benchmarks ni detalles sobre el conjunto de datos de fine-tuning. El acceso está restringido (gated) y la licencia es propietaria (`bexara-internal-development-use`), lo que condiciona fuertemente su uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-encoder-decoder (Donut: Swin Transformer encoder + BART decoder) |
| Parametros totales | 202.063.288 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (depende del decoder BART base; típicamente 1024 tokens en Donut, no confirmado) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | bexara-internal-development-use (propietaria, acceso restringido) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Bexara-COI hereda la arquitectura Donut de `naver-clova-ix/donut-base`. Donut es un modelo encoder-decoder: un encoder visual Swin Transformer procesa la imagen del documento y un decoder BART (Bidirectional and Auto-Regressive Transformer) genera la secuencia de texto de salida de forma autoregresiva. Esta combinación elimina la necesidad de un motor OCR externo, ya que el modelo aprende a leer y estructurar la información directamente desde los píxeles.

El modelo es un fine-tuning del checkpoint base de Donut, orientado según sus etiquetas a la extracción de información clave en el ámbito de seguros. No se dispone de información sobre el volumen de datos de entrenamiento, la composición del dataset, el número de tokens vistos ni si se aplicaron técnicas de RLHF o DPO. Tampoco se documentan innovaciones técnicas adicionales más allá de las propias de la arquitectura Donut. El tamaño del repositorio (0,8 GB) es coherente con los 202 millones de parámetros en precisión completa o media precisión.

## Capacidades

- Comprensión de documentos: procesa imágenes de documentos (escaneos, fotografías) y genera texto estructurado directamente, sin OCR externo.
- Extracción de información clave (KIE): orientado a identificar y extraer campos relevantes de documentos aseguradores.
- Generación image-to-text: pipeline `image-to-text` declarado en Hugging Face.
- Fine-tuning específico de dominio: ajustado sobre `naver-clova-ix/donut-base` para el sector seguros (según etiquetas).
- Compatibilidad con `transformers`: cargable mediante la librería Transformers.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible (idiomas no declarados).
- Modo thinking, visión general, audio: no disponible.

## Casos de uso

- Digitalización de pólizas de seguro: el modelo puede recibir la imagen de una póliza escaneada y generar una representación estructurada de los campos clave (número de póliza, tomador, coberturas), aprovechando su fine-tuning específico en el dominio asegurador.
- Extracción de datos de partes de siniestro: procesamiento de formularios de declaración de siniestros para poblar automáticamente bases de datos internas, reduciendo la introducción manual.
- Automatización de onboarding de clientes: lectura de documentación aportada por el cliente (DNI, contratos, certificados) para verificar y extraer datos en un flujo de alta.
- Procesamiento por lotes de documentación histórica: al ser un modelo relativamente pequeño (202 M parámetros), puede desplegarse en infraestructura modesta para digitalizar archivos de documentos aseguradores a gran escala.
- Enriquecimiento de expedientes: extracción de campos de documentos adjuntos a un expediente para indexación y búsqueda posterior en sistemas de gestión documental.
- Validación de documentos en back-office: comparación de los campos extraídos por el modelo con los datos declarados por el cliente para detectar discrepancias en procesos de suscripción.
- Integración en pipelines de RPA: sustitución de pasos de OCR + reglas por un único modelo end-to-end en flujos de automatización robótica de procesos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 202 M parámetros, en fp32 serían aproximadamente 0,8 GB de pesos; en fp16, unos 0,4 GB. A ello hay que sumar la memoria para el encoder visual y las activaciones, por lo que una GPU con 4-8 GB de VRAM es suficiente en la mayoría de casos.
- GPU recomendadas: cualquier GPU moderna con al menos 8 GB de VRAM (RTX 3060, RTX 4060, RTX 4090, A10, L4). Para despliegues de alto throughput, A100 o H100 ofrecen margen de sobra.
- Cabe en GPU de consumo: sí, en GPUs de consumo como RTX 3060/4060/4090, e incluso en CPU para inferencia por lotes pequeños.
- Opciones de despliegue: `transformers` (pipeline `image-to-text`), TGI (Text Generation Inference) para servir el decoder, y ONNX Runtime para optimización. No se documenta soporte GGUF ni Ollama para este modelo.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Bexara-COI | 202 M | no disponible | KIE en seguros (image-to-text) | bexara-internal-development-use (gated) | Hugging Face, acceso restringido |
| naver-clova-ix/donut-base | ~200 M | ~1024 tokens (decoder BART) | Comprensión de documentos genérica | MIT | Hugging Face, público |
| microsoft/layoutlmv3-base | ~125 M | 512 tokens | Comprensión de documentos (clasificación, QA) | MIT | Hugging Face, público |
| google/pix2struct-docvqa-base | ~282 M | 2048 tokens | DocVQA / image-to-text | Apache 2.0 | Hugging Face, público |

Bexara-COI se diferencia de Donut base por su especialización en el dominio asegurador y por una licencia propietaria que restringe el uso comercial. Frente a LayoutLMv3 y Pix2Struct, comparte el enfoque end-to-end sin OCR, pero su acceso restringido y la ausencia de benchmarks públicos dificultan una comparación objetiva de rendimiento.

## Limitaciones y advertencias

- Licencia propietaria `bexara-internal-development-use`: restringe el uso a desarrollo interno de Bexara; no se permite uso comercial ni redistribución sin autorización expresa.
- Acceso restringido (gated): es necesario solicitar acceso y aceptar las condiciones en Hugging Face antes de descargar los pesos.
- Ausencia de benchmarks públicos: no hay evidencia publicada sobre su precisión en tareas KIE, lo que impide evaluar su calidad frente a alternativas.
- Idiomas no declarados: se desconoce si el modelo está entrenado para español, inglés u otros idiomas, lo que limita su aplicabilidad sin validación previa.
- Riesgo de alucinación: como modelo generativo, puede producir campos o valores inexistentes en el documento, especialmente en documentos con baja calidad de imagen o layouts no vistos durante el entrenamiento.
- Sesgos de dominio: al estar ajustado específicamente al sector asegurador, su rendimiento en otros tipos de documentos (facturas, contratos de otro sector) puede degradarse.
- Dependencia de la calidad de imagen: la arquitectura Donut es sensible a la resolución y legibilidad del documento de entrada.
- Sin información sobre el dataset de entrenamiento: no se puede evaluar la cobertura de layouts, idiomas ni sesgos demográficos.
- Fecha de creación futura (2026-11-18): el registro indica una fecha posterior a la actual, lo que puede reflejar un error de metadatos o un modelo programado; conviene verificar la integridad del repositorio antes de usarlo en producción.

## Enlaces

- Hugging Face: https://huggingface.co/gokulSholas/Bexara-COI
- Modelo base: https://huggingface.co/naver-clova-ix/donut-base
- Paper de Donut (OCR-free Document Understanding Transformer): https://arxiv.org/abs/2111.15664
- Repositorio oficial de Donut: https://github.com/clovaai/donut
