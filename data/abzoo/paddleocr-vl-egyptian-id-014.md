# abzoo/paddleocr-vl-egyptian-id-014

## Resumen

El modelo `abzoo/paddleocr-vl-egyptian-id-014` es un fine-tune del modelo PaddleOCR-VL, desarrollado por el usuario abzoo, especializado en el reconocimiento óptico de caracteres (OCR) y la extracción de información de documentos de identidad egipcios. Se basa en `unsloth/PaddleOCR-VL`, una versión optimizada del modelo original de PaddlePaddle, y ha sido ajustado con la librería Unsloth y el stack de HuggingFace TRL, lo que permitió un entrenamiento aproximadamente dos veces más rápido que un fine-tune convencional.

El modelo base PaddleOCR-VL es un VLM compacto de 0.9B parámetros que combina un encoder visual de resolución dinámica estilo NaViT con el modelo de lenguaje ERNIE-4.5-0.3B, diseñado para el parseo de documentos con alta precisión y eficiencia. Este fine-tune concreto está orientado a la lectura de campos específicos de carnés de identidad egipcios, lo que lo hace relevante para flujos de verificación de identidad, KYC y automatización de procesos documentales en entornos de habla inglesa o con documentos en ese idioma.

Aunque el modelo apenas tiene descargas y likes (0 en ambos casos), su publicación bajo licencia Apache 2.0 y su compatibilidad con el ecosistema Transformers y text-generation-inference lo convierten en una opción interesante para desarrolladores que necesiten una solución de OCR especializada sin coste de licencia.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language Model (VLM) basado en PaddleOCR-VL: encoder visual NaViT + LLM ERNIE-4.5-0.3B |
| Parametros totales | 958.588.736 (~958M) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repo solo contiene pesos en safetensors) |
| Idiomas soportados | en (etiquetado en HF; el modelo base soporta 109 idiomas, pero este fine-tune no especifica otros) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base PaddleOCR-VL integra un encoder visual de resolución dinámica (estilo NaViT) que procesa imágenes a diferentes resoluciones sin necesidad de redimensionar, lo que mejora la precisión en documentos con layouts complejos. El componente de lenguaje es ERNIE-4.5-0.3B, un modelo de 0.3B parámetros que actúa como decodificador. El conjunto se entrena para tareas de image-text-to-text, es decir, recibe una imagen y genera texto (descripciones, extracción de campos, respuestas a preguntas sobre el documento).

El fine-tune realizado por abzoo se llevó a cabo con Unsloth (para acelerar el entrenamiento) y la librería TRL de HuggingFace. No se dispone de información pública sobre el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas como RLHF o DPO. Sin embargo, la existencia del dataset `abzoo/egyptian-id-ocr` en HuggingFace sugiere que los datos de entrenamiento consisten en imágenes de carnés de identidad egipcios con sus correspondientes transcripciones o campos extraídos.

## Capacidades

- OCR de documentos de identidad: extrae texto y campos estructurados de carnés de identidad egipcios (nombre, número de ID, fecha de nacimiento, etc.).
- Generación de texto a partir de imágenes: puede producir respuestas en formato natural o estructurado (JSON) sobre el contenido del documento.
- Procesamiento de imágenes con resolución dinámica: hereda la capacidad del modelo base para manejar documentos con diferentes tamaños y orientaciones.
- Soporte de image-text-to-text: pipeline de Transformers que permite entrada multimodal (imagen + texto opcional) y salida de texto.
- Compatible con text-generation-inference y endpoints de HuggingFace, lo que facilita su despliegue en producción.
- No se ha documentado soporte para tool calling, agentes o razonamiento multi-paso en este fine-tune específico.

## Casos de uso

- Verificación de identidad en onboarding digital: el modelo puede extraer automáticamente los campos de un DNI egipcio (nombre, número, fecha de expiración) y compararlos con los datos introducidos por el usuario en un formulario, reduciendo errores manuales.
- Automatización de procesos KYC (Know Your Customer): integrado en un pipeline de cumplimiento normativo, permite validar documentos de identidad en tiempo real, acelerando la apertura de cuentas bancarias o wallets digitales.
- Digitalización de archivos físicos: convierte escaneos de carnés de identidad en registros digitales estructurados, listos para ser almacenados en bases de datos o sistemas de gestión documental.
- Extracción de datos para formularios gubernamentales: ayuda a rellenar automáticamente solicitudes o trámites administrativos a partir de la imagen del documento, minimizando la intervención manual.
- Asistencia en atención al cliente: un chatbot puede recibir una foto del documento del usuario, extraer la información relevante y usarla para verificar la identidad antes de resolver consultas o gestionar incidencias.
- Preprocesamiento para sistemas de búsqueda multimodal: el texto extraído puede indexarse para permitir búsquedas por contenido en repositorios de documentos de identidad, útil en entornos de seguridad o recursos humanos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para este fine-tune en la información disponible. El modelo base PaddleOCR-VL reporta un 94.5% de precisión en el benchmark OmniDocBench v1.5 (según la documentación de PaddleOCR-VL-1.5), pero no se dispone de datos comparativos para la versión fine-tuneada con IDs egipcios. Se recomienda evaluar el modelo con un conjunto de validación propio antes de usarlo en producción.

## Requisitos de hardware

- VRAM estimada para inferencia: con 958M parámetros en FP16, los pesos ocupan aproximadamente 1.9 GB (tamaño del repo). En la práctica, con overhead de activaciones y buffers, se recomienda al menos 4 GB de VRAM para inferencia en FP16. Con cuantización a 4 bits (no disponible en el repo, pero posible con herramientas externas), podría reducirse a ~0.5 GB de pesos.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM, como NVIDIA GTX 1650, RTX 3050, RTX 4060, o superiores. También es viable en GPUs de datacenter como A10, A100 o H100 para mayor throughput.
- Compatibilidad con consumer GPU: sí, el modelo cabe en GPUs de gama media y baja gracias a su tamaño reducido.
- Opciones de despliegue: al ser un modelo de Transformers, puede servirse con vLLM, TGI (text-generation-inference), o mediante la API de HuggingFace Inference Endpoints. También es posible exportarlo a GGUF para usarlo con llama.cpp u Ollama, aunque no se proporcionan archivos GGUF en el repo.
- Latencia y throughput: no se dispone de datos medidos. Como referencia, un modelo de ~1B parámetros en una GPU moderna (RTX 4090) suele generar entre 50 y 100 tokens por segundo en FP16, pero la latencia dependerá del tamaño de la imagen de entrada y del número de tokens de salida.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| abzoo/paddleocr-vl-egyptian-id-014 | 958M | no disponible | OCR de IDs egipcios | Apache 2.0 | HuggingFace |
| PaddlePaddle/PaddleOCR-VL (base) | ~0.9B | no disponible | Parseo de documentos genérico, 109 idiomas | Apache 2.0 | HuggingFace |
| PaddleOCR-VL-1.5 | no disponible | no disponible | Parseo de documentos mejorado, 94.5% en OmniDocBench | Apache 2.0 | Documentación oficial |

La comparativa se limita a la familia PaddleOCR-VL porque no se dispone de información sobre otros modelos OCR de tamaño similar con los que se haya comparado este fine-tune. El modelo base es más generalista, mientras que este fine-tune está especializado en un tipo de documento concreto, lo que puede ofrecer mayor precisión en ese dominio a costa de perder generalidad.

## Limitaciones y advertencias

- Especialización limitada: el modelo ha sido fine-tuneado específicamente para carnés de identidad egipcios. Su rendimiento en otros tipos de documentos (pasaportes, licencias de conducir, etc.) no está garantizado y probablemente sea inferior al del modelo base.
- Datos de entrenamiento no documentados: no se ha publicado información sobre el tamaño, la calidad o la diversidad del dataset `abzoo/egyptian-id-ocr`, lo que dificulta evaluar posibles sesgos o sobreajuste.
- Riesgo de alucinación: como todo modelo generativo, puede producir texto incorrecto o inventar campos si la imagen es de baja calidad, está parcialmente oculta o contiene variaciones no vistas en el entrenamiento.
- Idioma: aunque el modelo base soporta 109 idiomas, este fine-tune está etiquetado únicamente como "en". Si los documentos contienen texto en árabe u otros idiomas, el rendimiento podría degradarse.
- Baja adopción: con 0 descargas y 0 likes, el modelo no ha sido validado por la comunidad. Se recomienda probarlo exhaustivamente antes de integrarlo en sistemas críticos.
- Licencia Apache 2.0: permite uso comercial y modificación, pero el autor no ofrece garantías ni soporte. El usuario es responsable del cumplimiento normativo en el tratamiento de datos personales (por ejemplo, RGPD en Europa).

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/abzoo/paddleocr-vl-egyptian-id-014
- Dataset de entrenamiento (abzoo/egyptian-id-ocr): https://huggingface.co/datasets/abzoo/egyptian-id-ocr
- Modelo base unsloth/PaddleOCR-VL: https://huggingface.co/unsloth/PaddleOCR-VL
- Repositorio oficial de PaddleOCR: https://github.com/PaddlePaddle/PaddleOCR
- Documentación de PaddleOCR-VL: https://www.paddleocr.ai/main/en/
- Página del modelo PaddleOCR-VL en HuggingFace: https://huggingface.co/PaddlePaddle/PaddleOCR-VL
