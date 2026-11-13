# KoreaPeter/ms-eff-gcvit-deepfake-b5-celeb-df-v2

## Resumen

ms-eff-gcvit-deepfake-b5-celeb-df-v2 es un modelo de clasificación de imágenes orientado a la detección de deepfakes, publicado por el usuario KoreaPeter en Hugging Face bajo el paraguas del proyecto DeepGuard. Combina un backbone EfficientNet-B5 preentrenado en ImageNet (timm/tf_efficientnet_b5.ns_jft_in1k) con un módulo de contexto global basado en Vision Transformer (Global Context ViT), dando lugar a una arquitectura híbrida convolucional-transformer registrada como ms_eff_gcvit. El modelo se distribuye a través de la librería transformers con pesos en safetensors y código personalizado (custom_code), lo que obliga a confiar en la implementación del autor para cargarlo.

Con 52.743.453 parámetros totales y un repositorio de apenas 0,2 GB, es un modelo compacto pensado para inferencia eficiente en tareas de verificación de autenticidad de rostros y vídeo. El nombre del checkpoint sugiere un ajuste fino sobre el conjunto de datos Celeb-DF (versión v2), un benchmark habitual en investigación sobre detección de caras manipuladas. El pipeline declarado en la tarjeta es video-classification, aunque la arquitectura subyacente es de clasificación de imágenes, lo que apunta a un uso por fotograma con agregación posterior a nivel de vídeo.

Su relevancia actual radica en la creciente demanda de herramientas de moderación de contenido y verificación forense ante la proliferación de contenido sintético. No obstante, el acceso está restringido (gated): es necesario aceptar condiciones en Hugging Face antes de descargar los pesos, y la información pública sobre entrenamiento y evaluación es muy limitada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida CNN + Vision Transformer (ms_eff_gcvit: EfficientNet-B5 + Global Context ViT) |
| Parametros totales | 52.743.453 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de visión; resolución de entrada no especificada) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no aplica; modelo de visión) |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Modelo base | timm/tf_efficientnet_b5.ns_jft_in1k (fine-tune) |
| Pipeline declarado | video-classification (image-classification en tags) |
| Dataset de referencia | ILSVRC/imagenet-1k (tag); Celeb-DF v2 (según nombre) |
| Acceso | Restringido (gated) |
| Tamano del repositorio | 0,2 GB |
| Descargas | 36.540 |
| Fecha de creación | 2026-06-23 |

## Arquitectura y entrenamiento

La arquitectura ms_eff_gcvit parte de un backbone convolucional EfficientNet-B5 preentrenado con destilación de Noisy Student en ImageNet (variante ns_jft_in1k de timm). Sobre ese extractor se incorpora un módulo de contexto global inspirado en Vision Transformer, cuyo objetivo es capturar dependencias de largo alcance entre regiones de la imagen, algo relevante para detectar artefactos de manipulación que no se localizan en un único parche. El resultado es un clasificador binario (real frente a deepfake) con 52,7 millones de parámetros, un tamaño moderado que permite despliegue en hardware de gama media.

No se dispone de información pública sobre el volumen de tokens o imágenes de entrenamiento, la composición exacta del dataset, ni si se aplicaron técnicas de aumento de datos, balanceo de clases o ajuste fino diferencial. El nombre del checkpoint apunta a un fine-tune sobre Celeb-DF v2, un conjunto de vídeos de celebridades con caras manipuladas, pero no se detalla el protocolo de entrenamiento ni las métricas de validación. Tampoco se documenta el uso de RLHF, DPO ni técnicas de destilación adicionales más allá del preentrenamiento heredado del backbone. La etiqueta custom_code indica que la carga requiere `trust_remote_code=True`.

## Capacidades

- Clasificación binaria de imágenes para detección de deepfakes (real frente a manipulado).
- Procesamiento de fotogramas individuales como paso previo a la clasificación agregada de vídeo.
- Extracción de características visuales mediante backbone EfficientNet-B5 con contexto global.
- Integración con la librería transformers mediante AutoModel y código personalizado.
- No dispone de generación de texto, razonamiento, código ni matemáticas.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües (modelo puramente visual).
- No incluye modo thinking, visión general, audio ni otras modalidades.

## Casos de uso

- Moderación de contenido en plataformas sociales: clasificar fotogramas de vídeos subidos por usuarios para marcar posibles caras manipuladas antes de la revisión humana, aprovechando el bajo coste computacional del modelo (52,7 M de parámetros).
- Verificación forense de material audiovisual: uso como primera pasada en flujos de peritaje donde se analizan fotogramas clave de un vídeo y se agrega la puntuación por fotograma para emitir una alerta.
- Detección de suplantación de identidad en procesos KYC: comprobar la autenticidad de vídeos de verificación de identidad antes de validar al usuario, dado el ajuste declarado sobre Celeb-DF v2, centrado en rostros.
- Filtrado previo en pipelines de datasets: descartar muestras sintéticas al construir corpus de investigación sobre reconocimiento facial o análisis de vídeo.
- Herramientas de periodismo de verificación: asistir a redacciones en la comprobación rápida de vídeos virales, integrando el modelo en un servicio interno que devuelve una probabilidad por clip.
- Investigación académica en detección de deepfakes: servir como baseline reproducible (licencia MIT) para comparar con detectores más recientes sobre Celeb-DF v2 u otros conjuntos.
- Automatización de auditorías de contenido en repositorios de vídeo: ejecutar clasificación por lotes sobre fotogramas extraídos con ffmpeg y generar informes de riesgo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: en torno a 0,2-0,4 GB para los pesos (52,7 M de parámetros), más overhead de activaciones; cómodo en cualquier GPU con 4 GB o más.
- VRAM estimada en FP16: aproximadamente 0,1-0,2 GB de pesos, con margen amplio para lotes grandes.
- GPU recomendadas: RTX 3060, RTX 4060, RTX 4090, A100 o H100 para procesamiento por lotes a gran escala; también CPU para inferencia puntual.
- Cabe en GPU de consumo: sí, en cualquier GPU moderna con al menos 4 GB de VRAM, e incluso en iGPU con suficiente memoria compartida.
- Opciones de despliegue: transformers con `trust_remote_code=True`; exportación a ONNX o TorchScript para servicios de inferencia; no se documenta soporte nativo en vLLM, llama.cpp, Ollama ni TGI (son motores orientados a LLM).
- Latencia y throughput: no disponibles; por el tamaño del modelo se espera latencia de milisegundos por fotograma en GPU moderna, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Tarea | Licencia | Acceso |
|---|---|---|---|---|---|
| ms-eff-gcvit-deepfake-b5-celeb-df-v2 | 52,7 M | no disponible | Detección de deepfake en imagen/vídeo | MIT | Gated |
| EfficientNet-B5 (timm) | ~30 M | 456x456 (por defecto) | Clasificación ImageNet | Apache-2.0 | Abierto |
| ViT-B/16 (base) | ~86 M | 224x224 | Clasificación de imágenes | Apache-2.0 | Abierto |
| XceptionNet (detectores deepfake clásicos) | ~20,8 M | 299x299 | Detección de deepfake | Varía | Abierto |

La comparación con detectores específicos de deepfake de la literatura (XceptionNet, Face X-ray, SBI) no puede completarse con datos de rendimiento porque el autor no publica métricas. Frente a los backbones genéricos, la diferencia clave es el ajuste específico a la tarea y la licencia MIT, aunque el acceso restringido limita la reproducibilidad.

## Limitaciones y advertencias

- Acceso restringido: es necesario aceptar las condiciones en Hugging Face y disponer de token de autenticación para descargar los pesos.
- Requiere `trust_remote_code=True`: se ejecuta código del autor no auditado, con el riesgo de seguridad asociado.
- No hay información pública sobre el dataset de entrenamiento, el protocolo de evaluación ni las métricas alcanzadas; no es posible verificar su rendimiento real.
- El ajuste sobre Celeb-DF v2 puede provocar sobreajuste a los artefactos específicos de ese generador y degradar la detección frente a métodos de síntesis más recientes.
- Riesgo de falsos positivos en imágenes comprimidas, con baja resolución o con iluminación adversa; no se documentan umbrales recomendados.
- Sesgos potenciales por la composición del dataset de celebridades (demografía, etnia, edad) no caracterizados.
- El pipeline declarado (video-classification) no coincide con la naturaleza de clasificador de imágenes; la agregación a nivel de vídeo debe implementarla el usuario.
- Aunque la licencia es MIT, conviene revisar las condiciones del acceso gated y de los datasets de origen antes de un uso comercial.
- No apto como única línea de defensa en producción: debe combinarse con revisión humana y otros detectores.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/KoreaPeter/ms-eff-gcvit-deepfake-b5-celeb-df-v2
- Modelo base en Hugging Face: https://huggingface.co/timm/tf_efficientnet_b5.ns_jft_in1k
- Repositorio timm: https://github.com/huggingface/pytorch-image-models
- Dataset Celeb-DF: https://github.com/yuezunli/celeb-deepfakeforensics
- Dataset ImageNet-1k: https://huggingface.co/datasets/ILSVRC/imagenet-1k
