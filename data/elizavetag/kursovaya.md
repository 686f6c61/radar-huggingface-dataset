# ElizavetaG/kursovaya

## Resumen

ElizavetaG/kursovaya es un modelo de reconocimiento óptico de caracteres (OCR) especializado en texto impreso procedente de recortes de palabras de tickets de compra. Se trata de un fine-tuning del modelo microsoft/trocr-small-printed, un vision-encoder-decoder basado en transformer pensado para tareas de image-to-text. El modelo fue desarrollado por ElizavetaG como trabajo de curso de aprendizaje automático en la Universidad Politécnica de San Petersburgo (SPbPU), y se publica en Hugging Face bajo el identificador ElizavetaG/kursovaya.

El problema que aborda es concreto: la transcripción fiable de palabras individuales extraídas de imágenes de recibos, un dominio con tipografías densas, ruido de impresión y variabilidad de calidad de escaneo. El ajuste se realizó sobre el dataset naver-clova-ix/cord-v2, un corpus público de tickets de compra, lo que sitúa al modelo en el nicho del OCR documental de recibos más que en el OCR generalista.

Con 61.596.672 parámetros y un tamaño de repositorio de 0,2 GB en formato safetensors, es un modelo pequeño y ligero, adecuado para despliegue en hardware modesto. Su relevancia es limitada fuera del ámbito académico y del dominio específico de recibos, pero resulta un ejemplo útil de fine-tuning de TrOCR para una tarea vertical y de cómo un modelo base pequeño puede alcanzar tasas de error bajas en un subdominio estrecho.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-encoder-decoder (TrOCR), basada en transformer |
| Parametros totales | 61.596.672 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Modelo base | microsoft/trocr-small-printed |
| Dataset de ajuste | naver-clova-ix/cord-v2 |
| Tamano del repositorio | 0,2 GB |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura TrOCR (Transformer-based Optical Character Recognition) en su variante small, un esquema vision-encoder-decoder: un encoder visual procesa la imagen del recorte y un decoder de tipo transformer genera la secuencia de texto correspondiente. El punto de partida es microsoft/trocr-small-printed, entrenado originalmente para OCR de texto impreso, sobre el que se aplicó un fine-tuning específico.

El ajuste se realizó durante 5 épocas sobre 19.367 recortes de palabras de la partición de entrenamiento del dataset CORD v2 (naver-clova-ix/cord-v2). La model card indica que el CER (character error rate) se calculó sin distinguir mayúsculas y minúsculas. No se especifica en la información disponible si se aplicaron técnicas de aumento de datos, optimizador concreto, tasa de aprendizaje ni si hubo etapas de RLHF o DPO (no procede en un modelo OCR). Tampoco se detalla la composición lingüística del corpus más allá de su origen en tickets de compra.

## Capacidades

- Reconocimiento de texto impreso en recortes de palabras de tickets de compra (image-to-text).
- Transcripción de palabras individuales, no de líneas o documentos completos, según la descripción del ajuste.
- Especialización en tipografías y disposiciones propias de recibos del dataset CORD v2.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta capacidad multilingüe explícita; el corpus de origen es principalmente en inglés/japonés según el dataset CORD, pero no se confirma en la información disponible.
- No se documentan modos especiales como thinking mode, visión general, audio o decodificación especulativa.

## Casos de uso

- Digitalización de tickets de compra: el modelo puede transcribir palabras sueltas extraídas de imágenes de recibos, lo que permite construir un pipeline de extracción de campos (producto, precio, total) combinando el OCR con reglas o un parser posterior.
- Automatización de gastos en aplicaciones de finanzas personales: integrado tras un detector de regiones de texto, el modelo convierte cada recorte en texto para alimentar la contabilidad automática del usuario.
- Procesamiento por lotes de archivos históricos de recibos: al ser un modelo de 61,6 M de parámetros, puede ejecutarse en CPU o GPU modesta para digitalizar grandes volúmenes sin coste elevado.
- Validación de sistemas OCR en producción: sirve como referencia de fine-tuning vertical para comparar la calidad de un OCR generalista frente a uno especializado en un dominio concreto.
- Investigación académica y docencia: es un ejemplo reproducible de fine-tuning de TrOCR sobre un dataset público, útil para prácticas de visión por computador y NLP.
- Extracción de datos para auditoría fiscal o contable: la transcripción palabra a palabra facilita la verificación manual posterior de importes y descripciones en recibos escaneados.

## Benchmarks y rendimiento

Los únicos datos disponibles provienen de la model card y se refieren a la partición de test del dataset CORD v2 (2.356 palabras):

| Metrica | Valor |
|---|---|
| CER (test, sin distinguir mayusculas) | 0,014 |
| WER (test) | 0,056 |
| Palabras exactas | 95,0 % |
| CER en validacion (sin distinguir mayusculas) | 0,013 |

No se han publicado resultados comparativos con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en precisión completa (61,6 M de parámetros), y del orden de 200-400 MB en cuantizaciones de 8 o 4 bits, aunque no se documentan cuantizaciones oficiales.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; una RTX 3060, RTX 4060 o superior ofrece holgura. También puede ejecutarse en CPU para volúmenes moderados.
- Cabe en GPU consumer: sí, en prácticamente cualquier GPU con al menos 2 GB de VRAM, e incluso en CPU.
- Opciones de despliegue: transformers (PyTorch) es la vía natural al ser un modelo safetensors de Hugging Face; no se documenta soporte de vLLM, llama.cpp, Ollama o TGI para este modelo concreto.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| ElizavetaG/kursovaya | 61,6 M | no disponible | no disponible | Hugging Face | Fine-tuning de TrOCR-small sobre CORD v2 |
| microsoft/trocr-small-printed | ~61 M | no disponible | no disponible | Hugging Face | Modelo base, OCR impreso generalista |
| microsoft/trocr-base-printed | ~334 M | no disponible | no disponible | Hugging Face | Variante base, mayor capacidad y coste |
| microsoft/trocr-large-printed | ~558 M | no disponible | no disponible | Hugging Face | Variante large, mayor precisión potencial |

La comparativa se limita a la familia TrOCR porque no se dispone de datos de rendimiento de otros modelos OCR en la información proporcionada. No se dispone de cifras comparativas de CER/WER entre estas variantes.

## Limitaciones y advertencias

- El modelo está ajustado exclusivamente a recortes de palabras de tickets de compra; su rendimiento fuera de ese dominio (documentos, texto manuscrito, otras tipografías) no está garantizado.
- No se documenta la licencia, lo que impide confirmar si el uso comercial está permitido; es un riesgo relevante para producción.
- No se documentan los idiomas soportados; el dataset CORD contiene principalmente texto en inglés y japonés, pero el ajuste se describe sobre palabras de recibos sin especificar cobertura lingüística.
- Al ser un trabajo de curso con 0 descargas y 0 likes, no hay evidencia de validación por parte de la comunidad ni de mantenimiento posterior.
- Riesgo de alucinación inherente a los modelos generativos de OCR: el decoder puede producir caracteres plausibles pero incorrectos en imágenes de baja calidad.
- No se han publicado análisis de sesgos; al ser un modelo de OCR, los sesgos relevantes serían de dominio (tipografías, idiomas, formatos de recibo) más que sociales.
- La ventana de contexto y el comportamiento con secuencias largas no están documentados; el uso previsto es palabra a palabra, no documentos completos.
- No se especifican cuantizaciones oficiales ni pipelines de despliegue probados, lo que añade incertidumbre para integraciones en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ElizavetaG/kursovaya
- Modelo base: https://huggingface.co/microsoft/trocr-small-printed
- Dataset CORD v2: https://huggingface.co/datasets/naver-clova-ix/cord-v2
