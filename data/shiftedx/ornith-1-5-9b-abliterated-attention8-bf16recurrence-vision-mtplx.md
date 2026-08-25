# Shiftedx/ornith-1.5-9b-abliterated-attention8-bf16recurrence-vision-mtplx

## Resumen

Este repositorio contiene una cuantización MLX experimental del modelo Ornith-1.5-9B, desarrollada por Shiftedx. El modelo base, creado por ornith.ai, pertenece a la familia Ornith-1.5, orientada a razonamiento y codificación agéntica, e incorpora una arquitectura híbrida con atención, recurrencia, visión y predicción multi-token (MTP). La versión aquí presentada aplica una cuantización mixta (atención en 8 bits, tronco en 4 bits, recurrencia y visión en BF16) y una modificación de comportamiento denominada "abliterated" que reduce drásticamente la tasa de rechazo del modelo original (del 100 % al 8,3 % en pruebas locales). El resultado es un checkpoint optimizado para Apple Silicon mediante MLX, con soporte de visión y MTP, pensado para despliegue local en entornos de desarrollo e investigación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: atención + recurrencia + visión + multi-token prediction (MTP) |
| Parametros totales | 2.639.813.872 (según safetensors; el modelo base se anuncia como 9B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Mixta: atención en 8 bits (130 módulos), tronco en 4 bits (72 módulos), recurrencia y visión en BF16, MTP en BF16 |
| Idiomas soportados | No disponibles |
| Licencia | MIT |
| Formato de pesos | MLX (safetensors) |

## Arquitectura y entrenamiento

El modelo base Ornith-1.5-9B emplea una arquitectura híbrida que combina capas de atención con proyecciones recurrentes, un codificador de visión y un módulo de predicción multi-token (MTP). Según la documentación de ornith.ai, la familia Ornith-1.5 se entrena mediante un bucle de auto-mejora: el modelo propone tareas, genera scaffolds específicos y produce rollouts para aprendizaje por refuerzo. No se dispone de detalles sobre el número de tokens de entrenamiento, la composición del dataset o el uso de RLHF/DPO en la información proporcionada. La cuantización aquí presentada no modifica la arquitectura, pero sí altera el comportamiento de rechazo mediante una técnica de "abliteración" que reduce la probabilidad de negarse a responder. El autor reporta que los tensores MTP nativos se conservan en BF16 y que se recomienda una profundidad MTP de D1.

## Capacidades

- Generación de texto y razonamiento multi-step, orientado a tareas de codificación y agentes.
- Comprensión de imágenes (pipeline image-text-to-text) gracias al codificador de visión conservado en BF16.
- Predicción multi-token (MTP) con profundidad configurable (D1 recomendada), que acelera la decodificación autoregresiva.
- Comportamiento "abliterated": tasa de rechazo reducida del 100 % al 8,3 % en pruebas locales, con 0 % de rechazo benigno y 100 % de utilidad en el conjunto de validación.
- Compatibilidad con MLX y MLX-VLM para ejecución en Apple Silicon.
- Soporte de cuantización mixta que equilibra rendimiento y fidelidad.

## Casos de uso

- Asistente de codificación local en macOS: el modelo puede generar y revisar código con contexto de imágenes (por ejemplo, capturas de pantalla de errores) gracias a su capacidad de visión y MTP, ejecutándose en un Mac con chip M-series.
- Agente de razonamiento multi-step: su arquitectura híbrida y MTP permiten encadenar pasos de razonamiento con menor latencia, útil para tareas de planificación y depuración.
- Análisis de documentos técnicos con figuras: al aceptar entradas de imagen y texto, puede extraer información de diagramas, gráficos o esquemas en documentación técnica.
- Prototipado de chatbots con menos restricciones: la modificación abliterated reduce rechazos, lo que puede ser útil en entornos controlados donde se necesita explorar respuestas sin filtros excesivos (con las debidas advertencias de seguridad).
- Evaluación de modelos de visión-lenguaje en hardware Apple: sirve como banco de pruebas para comparar el rendimiento de cuantizaciones MLX con MTP en tareas multimodales.
- Despliegue en entornos de investigación sin GPU dedicada: al ser un formato MLX, se integra con librerías como mlx-lm y mlx-vlm, facilitando experimentos en Mac con memoria unificada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor reporta mediciones locales en un M4 Max de 64 GiB:

| Metrica | Valor |
|---|---|
| Decodificación (D1) | 73,03 tokens/s |
| Decodificación autoregresiva (AR) | 49,54 tokens/s (1,47x con MTP) |
| Tasa de rechazo (held-out) | 8,3 % (frente al 100 % del modelo padre) |
| Rechazo benigno (held-out) | 0 % |
| Utilidad (held-out) | 100 % |

Estas cifras son específicas del hardware y la configuración, no comparables directamente con benchmarks académicos.

## Requisitos de hardware

- Diseñado para Apple Silicon (M-series) con MLX; probado en M4 Max con 64 GiB de RAM unificada.
- El tamaño del repositorio es de 9,3 GB, por lo que se recomienda al menos 16 GiB de RAM unificada para cargar el modelo en memoria, aunque 32 GiB o más ofrecen margen para contexto largo y MTP.
- No requiere GPU NVIDIA; se ejecuta mediante MLX, MLX-LM y MLX-VLM.
- Para inferencia, se puede usar `mtplx quickstart` con profundidad MTP D1, o integrarse en pipelines con vLLM (si se convierte a otro formato) o llama.cpp (no nativo, requiere conversión).
- La latencia medida en M4 Max es de ~73 tokens/s en decodificación con MTP, suficiente para aplicaciones interactivas.

## Comparativa con modelos similares

No se dispone de datos de rendimiento comparativos con otros modelos de la misma categoría. La familia Ornith-1.5 incluye variantes de 35B-A3B (MoE) y 397B (MoE), pero no hay benchmarks públicos en la información proporcionada. Como referencia cualitativa, el modelo base de 9B compite con otros modelos densos de visión-lenguaje de tamaño similar (por ejemplo, Qwen2-VL 7B o Llama 3.2 11B Vision), pero no se pueden establecer comparaciones numéricas sin datos. La principal diferenciación es su arquitectura híbrida con MTP y su disponibilidad en formato MLX para Apple Silicon.

## Limitaciones y advertencias

- Es una cuantización experimental y una modificación de comportamiento ("abliterated") que reduce los rechazos; esto puede generar respuestas no deseadas o inseguras. El autor recomienda validar el modelo para cada caso de uso.
- No se dispone de información sobre la longitud de contexto, idiomas soportados o sesgos específicos del modelo base.
- El número de parámetros reportado (2,64B) difiere del nombre "9B"; esto puede deberse a la cuantización o a una discrepancia en la documentación, por lo que se debe verificar antes de usarlo en producción.
- La licencia MIT permite uso comercial, pero el modelo base puede tener términos adicionales; se debe revisar la licencia del modelo original.
- El rendimiento medido es específico de un M4 Max; en otros chips M-series puede variar significativamente.
- No hay garantías de soporte o mantenimiento por parte del autor; es un proyecto personal.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Shiftedx/ornith-1.5-9b-abliterated-attention8-bf16recurrence-vision-mtplx
- Modelo base: https://huggingface.co/ornith-ai/Ornith-1.5-9B
- Página oficial de Ornith-1.5: https://ornith.ai/ornith_1_5.html
- Blog de despliegue local de Ornith 1.5: https://aicybr.com/blog/ornith-1-5-local-deployment-9b-35b-397b
- Variante 35B-A3B del mismo autor: https://huggingface.co/Shiftedx/ornith-1.5-35b-a3b-abliterated-attention8-bf16recurrence-vision-mtplx
- Otra cuantización MLX del mismo autor: https://huggingface.co/Shiftedx/ornith-1.5-9b-mxfp8-vision-mlx
