# jancirnodziewiaty/Wicked-Tutu-27B-oQ4e-mtp

## Resumen

Wicked-Tutu-27B-oQ4e-mtp es un checkpoint cuantizado en formato MLX del modelo ReadyArt/Wicked-Tutu-27B, publicado por el usuario jancirnodziewiaty. No es un modelo entrenado desde cero, sino una versión comprimida con la herramienta oQ (oMLX v0.7.1rc1) mediante cuantización de precisión mixta: pesos afines de 4 y 5 bits con grupo de 64, más una fracción en BF16. El resultado son 27.781 millones de parámetros almacenados en 16,971 GB (15,806 GiB), con un promedio efectivo de 4,887 bits por peso.

El checkpoint conserva tres componentes: el modelo de lenguaje (26,896B), una torre de visión (0,461B) y una cabeza MTP de predicción multi-token (0,425B). La presencia de visión y MTP sugiere capacidades multimodales y decodificación especulativa, aunque la model card no documenta entrenamiento, idiomas, licencia ni rendimiento. Su relevancia es práctica: permite probar un modelo de casi 28B en Apple Silicon con MLX, a cambio de depender de un formato específico y de una licencia no declarada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer etiquetado como `qwen3_5` en los metadatos; incluye torre de visión y cabeza MTP. No se detalla si es denso o MoE. |
| Parámetros totales | 27.781.427.952 (27,781B) |
| Parámetros activos | no disponible; no se indica si es MoE |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Afín 4-bit grupo 64 (22,443B, 80,784%); afín 5-bit grupo 64 (4,823B, 17,359%); BF16 (0,516B, 1,857%); promedio 4,887 bits/peso |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors MLX (`mlx`), cuantización afín mixta 4/5-bit + BF16 |
| Tamaño del repositorio | 17,0 GB |

## Arquitectura y entrenamiento

La arquitectura subyacente se etiqueta como `qwen3_5` en HuggingFace, lo que apunta a una familia transformer con atención estándar; no se especifica si emplea atención lineal, híbrida u otro mecanismo. El checkpoint incluye una torre visual de 0,461B parámetros almacenada en BF16 (0,921 GB) y una cabeza MTP de 0,425B (0,314 GB), orientada a predecir varios tokens por paso para decodificación especulativa. El modelo de lenguaje concentra 26,896B parámetros y 15,736 GB de almacenamiento.

No hay información sobre el dataset de entrenamiento, el número de tokens, la composición de datos ni si se aplicaron RLHF, DPO u otras fases de alineamiento. La única innovación documentada es la cuantización de precisión mixta de oQ: asigna 4 bits a la mayoría de pesos (80,784%), 5 bits a una fracción relevante (17,359%) y mantiene en BF16 un 1,857% de los tensores, presumiblemente capas sensibles. No se detalla el criterio de selección por capa.

## Capacidades

- Generación de texto y razonamiento: el checkpoint conserva el modelo de lenguaje completo, por lo que debería mantener las capacidades del modelo base; no se han publicado evaluaciones que lo confirmen.
- Procesamiento de visión: incluye una torre visual de 0,461B parámetros en BF16. La model card no especifica tareas concretas (VQA, OCR, captioning) ni resolución de entrada.
- Predicción multi-token (MTP): cabeza de 0,425B que puede emplearse para decodificación especulativa; requiere un runtime que la soporte.
- Tool calling / function calling: no disponible; no se documenta.
- Agentes y razonamiento multi-paso: no disponible; no se documenta.
- Capacidades multilingües: no disponible.
- Modo thinking o razonamiento explícito: no disponible.

## Casos de uso

- Inferencia local privada en Apple Silicon: con 15,806 GiB de pesos, el checkpoint cabe en un Mac con 32 GB de memoria unificada y ajusta en 24 GB con contexto corto. Sirve para procesar documentos confidenciales sin enviar datos a la nube, siempre que la licencia lo permita.
- Prototipado multimodal en local: la torre de visión permite experimentar con entradas imagen-texto en MLX; útil para validar demos de VQA o descripción de imágenes antes de invertir en GPUs.
- Evaluación de cuantización mixta: permite comparar la calidad de 4,887 bits/peso frente al modelo base en BF16 en tareas concretas (resumen, código, razonamiento) y medir la degradación por capa.
- Decodificación especulativa con MTP: la cabeza MTP puede actuar como generador de borradores interno para acelerar la generación; un equipo de investigación puede medir la tasa de aceptación y la mejora de latencia en MLX.
- Asistente de código en local: si el modelo base conserva capacidades de programación, se puede integrar en editores o scripts de revisión; requiere validar con pruebas propias porque no hay benchmarks publicados.
- Investigación de despliegue en MLX: permite medir latencia, memoria y throughput de un 27B cuantizado en chips M1/M2/M3/M4, y comparar con llama.cpp/GGUF en otras plataformas.
- Educación y experimentación: un 27B ejecutable en un portátil de gama alta facilita prácticas de cuantización, análisis de tensores y estudio de cabezas MTP.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

| Benchmark | Resultado |
|---|---|
| MMLU | no disponible |
| HumanEval | no disponible |
| GSM8K | no disponible |
| MMMU | no disponible |
| Latencia y throughput | no disponible |

## Requisitos de hardware

- Memoria estimada para inferencia: 15,806 GiB solo para los pesos. Con KV cache y overhead, prever 20-24 GB de memoria unificada para contextos moderados y más para contextos largos.
- GPU recomendadas: Apple Silicon (M1 Pro/Max/Ultra, M2/M3/M4 Pro/Max/Ultra) con 32 GB o más de memoria unificada. En 24 GB puede cargar con contexto reducido.
- GPU consumer: sí, en Macs con 32 GB o más. En GPUs NVIDIA de 24 GB no se puede usar directamente por MLX; requeriría conversión a otro formato.
- Despliegue: MLX (`mlx-lm`
