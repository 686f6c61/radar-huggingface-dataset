# lite-infer/moss-image-sft-nunchaku-lite-int4-r128

## Resumen

MOSS-Image-SFT Nunchaku Lite INT4 r128 es una versión cuantizada del modelo de generación de imágenes texto-a-imagen OpenMOSS-Team/MOSS-Image-SFT, publicada por el usuario lite-infer. No se trata de un modelo nuevo entrenado desde cero, sino de una conversión de precisión reducida orientada a disminuir el consumo de memoria y facilitar la inferencia en hardware más modesto. El transformer se ha cuantizado a INT4 con la técnica SVDQuant (W4A4, rango 128) y GPTQ, mientras que el codificador de texto incluido emplea NF4 serializado de BitsAndBytes con cómputo en BF16.

El paquete conserva el VAE original en FP32, el tokenizer y el scheduler, y se distribuye con un pipeline personalizado compatible con una build específica de Diffusers que soporta capas lineales empaquetadas y kernels remotos. El modelo completo ocupa 9,8 GB en el repositorio y cuenta con aproximadamente 2.916 millones de parámetros según los pesos en safetensors.

Su relevancia actual radica en que permite ejecutar un modelo de difusión de resolución 1024×1024 con un pico de VRAM medido de 12,00 GiB, lo que lo sitúa al alcance de GPUs de consumo de gama alta. La licencia Apache 2.0 del modelo base y del pipeline facilita su uso comercial, aunque la dependencia de builds no estándar de Diffusers y de versiones muy concretas de Transformers y BitsAndBytes introduce fricción operativa.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Modelo de difusión texto-a-imagen (transformer cuantizado, pipeline MOSSImagePipeline) |
| Parámetros totales | 2.916.718.608 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | Transformer INT4 W4A4 SVDQuant r128 con GPTQ; codificador de texto NF4 BitsAndBytes; VAE en FP32 |
| Idiomas soportados | No disponible (los prompts de ejemplo están en inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería diffusers) |

## Arquitectura y entrenamiento

El modelo subyacente es MOSS-Image-SFT, un generador texto-a-imagen de la familia MOSS. Esta versión no incluye entrenamiento propio: es una cuantización post-entrenamiento del checkpoint original en la revisión `f972bd4b4b9e3852133cc5da954d87bc32cd8fb9`. La conversión afecta a 262 capas lineales, transformadas a SVDQ W4A4 con tamaño de grupo 64 y rango 128, más dos capas de modulación AWQ INT4. La calibración se realizó con ocho prompts qdiff originales a 1024×1024, 50 pasos y CFG 3, reteniendo las 800 llamadas de guidance y muestreando 32.768 filas de activación por objetivo en bloques de 4.096.

Los hiperparámetros de GPTQ fueron damping 0,01, tamaño de bloque 128, lote de Hessiana 512 y hasta 250 reintentos de inversión. La descomposición SVD aleatorizada usó sobremuestreo 10, cuatro iteraciones y semilla 0. El codificador de texto se serializó en NF4 sin doble cuantización y cómputo BF16, mientras que el VAE se mantiene en FP32 para preservar la calidad de decodificación. El scheduler emplea un shift de 5.0 y el pipeline admite omisión de capas en la rama negativa (`uncond_skip_layers=[22]`) y escalado SLG opcional.

## Capacidades

- Generación de imágenes texto-a-imagen a resolución 1024×1024 con 50 pasos de inferencia y CFG 3 en la configuración de referencia.
- Soporte de prompt negativo y de omisión selectiva de capas en la rama negativa para control fino del guidance.
- Escalado SLG (skip layer guidance) configurable, desactivado por defecto en los ejemplos.
- Control de semilla mediante `torch.Generator`, lo que permite reproducibilidad aproximada (no garantía de píxeles idénticos entre ejecuciones).
- Compatibilidad con `enable_model_cpu_offload()` para reducir la memoria residente en GPU.
- Generación de retratos, fotografía de producto, escenas naturales, arquitectura y estilos pictóricos según los casos de ejemplo publicados.
- No se documentan capacidades de edición de imagen, inpainting, control por pose o condicionamiento adicional.
- No se documenta soporte multilingüe explícito; los prompts de referencia están en inglés.

## Casos de uso

- Prototipado rápido de generación de imágenes en estaciones de trabajo con una única GPU: el pico de 12,00 GiB a 1024×1024 y 50 pasos permite iterar en tarjetas de consumo de gama alta sin recurrir a servicios en la nube.
- Generación de material visual para marketing y catálogos: los ejemplos de fotografía de producto (frasco de perfume sobre piedra caliza) muestran que el modelo puede producir imágenes con iluminación controlada y sin texto espurio cuando se indica en el prompt.
- Creación de ilustraciones y arte conceptual: los casos de acuarela y paisaje mediterráneo indican versatilidad estilística razonable para bocetos y referencias de dirección de arte.
- Integración en pipelines de Diffusers existentes: al exponerse como `DiffusionPipeline` con `custom_pipeline="pipeline_moss_image"`, puede encajarse en flujos que ya usan la API de Diffusers, sustituyendo el checkpoint BF16 por esta variante cuando la VRAM es limitada.
- Despliegue en entornos con presupuesto de memoria ajustado: la combinación de transformer INT4 y codificador NF4 reduce el peso del modelo respecto al original, y el offload de CPU permite bajar aún más la memoria residente a costa de latencia.
- Evaluación comparativa de técnicas de cuantización: el repositorio incluye métricas LPIPS y PSNR frente a referencias BF16, lo que lo convierte en un caso de estudio útil para investigadores que analizan el impacto de SVDQuant y GPTQ en modelos de difusión.
- Generación por lotes con semillas fijas para pruebas de regresión visual: el soporte de `torch.Generator` y los conjuntos de casos publicados permiten montar comparaciones reproducibles entre versiones del pipeline.

## Benchmarks y rendimiento

El autor publica métricas de similitud frente a las referencias BF16 guardadas, calculadas sobre 32 casos generales a resolución completa con AlexNet LPIPS v0.1 y PSNR RGB:

| Pipeline final | Casos | LPIPS ↓ | PSNR ↑ (dB) | VRAM pico (GiB) |
|---|---:|---:|---:|---:|
| INT4 r128 + NF4 | 32 | 0,2993 | 17,78 | 12,00 |

La VRAM pico se midió a 1024×1024, 50 pasos y CFG 3, con todos los componentes del pipeline residentes en GPU y sin offload de CPU. No se han publicado resultados de benchmarks estándar (FID, CLIP score, MMLU u otros) en la información disponible; las métricas anteriores miden únicamente la fidelidad respecto a las salidas BF16 de referencia, no la calidad absoluta del modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: 12,00 GiB de pico medido con todos los componentes en GPU, a 1024×1024, 50 pasos y CFG 3.
- Con `enable_model_cpu_offload()` la memoria residente en GPU se reduce, a costa de mayor latencia por transferencias host-device.
- GPU recomendadas: no especificadas por el autor. Por el pico de 12 GiB, encaja en tarjetas con 16 GB o más; en GPUs de 12 GB el margen es nulo y probablemente requiera offload.
- Cabe en GPUs de consumo de gama alta con 16 GB o más; en modelos de 12 GB conviene usar offload.
- Opciones de despliegue: Diffusers con la build específica de Nunchaku Lite (`rootonchair/diffusers`, commit `86960edbfda2a74d9764de73067b03701fea525e`), Transformers 5.19.0, BitsAndBytes 0.50.2 y el paquete `kernels` compatible. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Es necesario definir `DIFFUSERS_TRUST_REMOTE_KERNELS=true` y usar `trust_remote_code=True` con el pipeline personalizado.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / resolución | Cuantización | Licencia | VRAM pico |
|---|---|---:|---|---|---:|
| lite-infer/moss-image-sft-nunchaku-lite-int4-r128 | 2.916.718.608 | 1024×1024 | INT4 SVDQuant r128 + NF4 | Apache 2.0 | 12,00 GiB |
| OpenMOSS-Team/MOSS-Image-SFT (BF16) | No disponible | 1024×1024 | BF16 | Apache 2.0 | No disponible |
| Otras variantes Nunchaku Lite del mismo autor | No disponible | No disponible | INT4 con distintos rangos | Apache 2.0 | No disponible |

La comparación principal es contra el checkpoint BF16 del que deriva: esta versión reduce el peso y el consumo de memoria a cambio de una pérdida de fidelidad medible (LPIPS 0,2993 y PSNR 17,78 dB frente a las referencias BF16). No se dispone de datos de otros modelos de la misma categoría en la información proporcionada, por lo que no se puede establecer una comparación cuantitativa con alternativas externas.

## Limitaciones y advertencias

- La cuantización introduce degradación respecto al modelo original: LPIPS de 0,2993 y PSNR de 17,78 dB indican diferencias perceptibles frente a las salidas BF16.
- Las métricas publicadas miden similitud con referencias guardadas, no calidad absoluta; un PSNR de 17,78 dB no debe interpretarse como una medida de fidelidad al prompt.
- Las semillas fijas no garantizan píxeles idénticos entre ejecuciones, según advierte el propio autor.
- Dependencia de una build no estándar de Diffusers y de versiones muy concretas de Transformers (5.19.0) y BitsAndBytes (0.50.2); la incompatibilidad de versiones puede romper el pipeline.
- Requiere `trust_remote_code=True` y la ejecución de kernels remotos, lo que implica revisar el código del pipeline antes de usarlo en producción.
- No se documentan sesgos específicos, pero al ser un modelo texto-a-imagen hereda los sesgos de sus datos de entrenamiento originales, no detallados en esta ficha.
- Riesgo de alucinación visual: el modelo puede generar elementos no solicitados o interpretar incorrectamente prompts complejos; los ejemplos incluyen indicaciones explícitas como "no text" para evitar texto espurio.
- Idiomas soportados no documentados; los prompts de referencia están en inglés y no hay evidencia de buen rendimiento en castellano.
- La licencia Apache 2.0 permite uso comercial, pero las dependencias (build de Diffusers, kernels) deben verificarse por separado.
- El repositorio tiene un volumen de descargas muy bajo (11) y ningún "like", lo que sugiere poca validación por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/lite-infer/moss-image-sft-nunchaku-lite-int4-r128
- Modelo base: https://huggingface.co/OpenMOSS-Team/MOSS-Image-SFT/tree/f972bd4b4b9e3852133cc5da954d87bc32cd8fb9
- Build de Diffusers requerida: https://github.com/rootonchair/diffusers/tree/86960edbfda2a74d9764de73067b03701fea525e
- Metadatos de cuantización: `quantization_manifest.json` (en el repositorio)
- Modificaciones: `MODIFICATIONS.md` (en el repositorio)
- Aviso legal: `NOTICE` (en el repositorio)
- Licencia: `LICENSE` (en el repositorio)
- Configuración de casos de evaluación: `evaluation/cases.json` (en el repositorio)
- Resultados de métricas: `evaluation/metrics.json` (en el repositorio)
- Medición de VRAM: `evaluation/vram.json` (en el repositorio)
