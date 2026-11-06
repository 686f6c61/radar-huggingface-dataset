# jancirnodziewiaty/gemma-4-E2B-it-oQ4e-mtp

## Resumen

gemma-4-E2B-it-oQ4e-mtp es una cuantizacion mixta de precisión del modelo Gemma 4 E2B instruct (familia Gemma de Google), publicada por el usuario jancirnodziewiaty en Hugging Face. El checkpoint está empaquetado en formato MLX (Apple Silicon) y emplea la herramienta oQ de oMLX v0.7.3 para asignar distintos niveles de bits por tensor según su sensibilidad, logrando un promedio efectivo de 5,992 bits por peso sobre un total de 5.182B pesos lógicos.

El modelo base es multimodal: la distribución de almacenamiento revela componentes separados para lenguaje (4.632B), visión (0.167B) y audio (0.305B), además de una cabeza MTP (Multi-Token Prediction) de 0.078B que permite decodificación especulativa. El checkpoint ocupa 3.9 GB en disco, lo que lo hace manejable en equipos con memoria unificada de gama alta.

La relevancia de esta ficha es doble: por un lado documenta un ejemplo práctico de cuantización mixta con oQ y decodificación MTP; por otro, advierte de que se trata de una publicación de terceros sin model card descriptiva, sin licencia declarada y sin métricas de rendimiento, por lo que su uso en producción exige verificación previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (lenguaje + visión + audio) con cabeza MTP; pesos en formato MLX |
| Parametros totales | 5.104.297.539 (safetensors); 5.182B pesos lógicos según la model card |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Mixta: affine 4/5/6/8-bit group 64, BF16 e I64; promedio efectivo 5,992 bits/peso |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (MLX), cuantización oQ |
| Tamano del repo | 3,9 GB (3.615 GiB de tensores) |
| Libreria | mlx |
| Fecha de publicacion | 2026-11-02 |

## Arquitectura y entrenamiento

La model card no describe la arquitectura del modelo base más allá de la distribución de pesos. Por los componentes declarados se deduce un transformer multimodal con torre de visión (0.167B), torre de audio (0.305B), modelo de lenguaje (4.632B) y una cabeza MTP (0.078B) para predicción multi-token, técnica que permite generar varios tokens por paso y acelerar la decodificación especulativa. No se dispone de información sobre número de tokens de entrenamiento, composición del dataset ni si hubo RLHF o DPO.

La innovación de esta publicación es la cuantización mixta con oQ (oMLX v0.7.3): el 67,2% de los pesos lógicos se almacena a 4-bit (4,50 bits efectivos), el 19,6% a 5-bit, el 1,5% a 6-bit, el 1,1% a 8-bit y el 10,6% se mantiene en BF16, presumiblemente capas sensibles como embeddings, normas o la cabeza MTP. El resultado es un checkpoint de 3.615 GiB con una calidad teóricamente superior a una cuantización uniforme de 4-bit al mismo tamaño.

## Capacidades

- Generación de texto y razonamiento en modo instruct (sufijo `-it`).
- Procesamiento de imágenes mediante la torre de visión (0.167B parámetros).
- Procesamiento de audio mediante la torre de audio (0.305B parámetros).
- Decodificación multi-token (MTP) para acelerar la inferencia en Apple Silicon.
- Ejecución nativa en MLX, optimizada para memoria unificada de chips Apple.
- Soporte de tool calling, agentes o modo thinking: no disponible en la información proporcionada.
- Cobertura multilingüe: no disponible en la información proporcionada.

## Casos de uso

- Inferencia local en Mac con memoria unificada: el checkpoint de 3,9 GB cabe en equipos de 16 GB o más y permite ejecutar un modelo multimodal instruct sin GPU dedicada, usando MLX como runtime.
- Asistente multimodal de escritorio: combinando las torres de visión y audio, se puede construir un asistente que procese capturas de pantalla y notas de voz en local, útil en entornos con requisitos de privacidad.
- Prototipado de decodificación especulativa: la cabeza MTP incluida permite experimentar con generación multi-token y medir ganancias de throughput frente a decodificación autoregresiva estándar.
- Evaluación de cuantización mixta: sirve como referencia para comparar la calidad de oQ frente a cuantizaciones uniformes de 4-bit en tareas de razonamiento y generación.
- Transcripción y análisis de audio ligero: la torre de audio de 0.305B posibilita tareas de comprensión de voz en dispositivos Apple sin enviar datos a la nube.
- Educación e investigación: al ser un checkpoint pequeño y reproducible, es adecuado para estudiar el impacto de la precisión mixta por capa en modelos multimodales.
- No recomendado para producción crítica sin validación: la ausencia de licencia y de benchmarks impide usarlo en despliegues comerciales sin revisión legal y técnica previa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: ~3,9 GB para los pesos; con overhead de runtime MLX, se recomienda un mínimo de 8 GB y 16 GB para contexto largo.
- GPU recomendadas: chips Apple Silicon (M1, M2, M3, M4 y variantes Pro/Max/Ultra) con memoria unificada; no está pensado para CUDA.
- Cabe en GPU consumer: sí, en cualquier Mac con 16 GB o más; en GPUs NVIDIA no es directamente compatible por el formato MLX.
- Opciones de despliegue: MLX (librería oficial), mlx-lm y herramientas compatibles con MLX; no se indica soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles; la presencia de MTP sugiere mejoras en decodificación, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| gemma-4-E2B-it-oQ4e-mtp | 5,10B (5,18B lógicos) | no disponible | no disponible | MLX safetensors | Cuantización mixta oQ + MTP, solo Apple Silicon |
| Gemma 4 E2B it (original) | no disponible | no disponible | no disponible | safetensors | Modelo base sin cuantizar; referencia de calidad |
| Cuantización uniforme 4-bit del mismo modelo | ~5,18B | no disponible | no disponible | MLX/GGUF | Menor tamaño, posible pérdida de calidad en capas sensibles |

No se dispone de datos de rendimiento para establecer una comparación cuantitativa con alternativas.

## Limitaciones y advertencias

- Publicación de terceros: no es un checkpoint oficial de Google; no hay garantía de fidelidad respecto al modelo original.
- Licencia no declarada: no se puede asumir uso comercial permitido; es imprescindible contactar con el autor o consultar la licencia del modelo base Gemma 4.
- Sin model card descriptiva: no hay información sobre contexto, idiomas, sesgos ni datos de entrenamiento.
- Sin benchmarks: no hay evidencia publicada de la degradación introducida por la cuantización mixta.
- Riesgo de alucinación: inherente a los modelos de lenguaje; sin evaluación específica no se puede acotar.
- Compatibilidad restringida: el formato MLX limita el despliegue a Apple Silicon; no hay conversión a GGUF ni a otros runtimes documentada.
- Cero descargas y cero likes en el momento de la consulta: sin validación comunitaria.
- La cabeza MTP y las torres de visión/audio requieren runtimes que las soporten; un uso incorrecto puede ignorar estas capacidades.

## Enlaces

- Hugging Face: https://huggingface.co/jancirnodziewiaty/gemma-4-E2B-it-oQ4e-mtp
- Herramienta de cuantización oQ (oMLX): https://github.com/jundot/omlx
- Repositorio MLX: no disponible en la información proporcionada
- Modelo base Gemma 4 E2B it: no disponible en la información proporcionada
- Paper o blog del modelo base: no disponible en la información proporcionada
