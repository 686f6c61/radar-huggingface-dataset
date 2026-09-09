# JacobLinCool/TEA-ASR-1.1

## Resumen

TEA-ASR-1.1 es un modelo de reconocimiento automático de voz (ASR) desarrollado por JacobLinCool, adaptado a partir de Qwen3-ASR-1.7B y diseñado específicamente para el mandarín hablado en Taiwán. Su objetivo es transcribir audio real a chino tradicional con vocabulario auténticamente taiwanés, manteniendo una alta robustez frente al code-switching mandarín–inglés habitual en conversaciones cotidianas de la isla. El modelo se presenta como un checkpoint único y autocontenido, compatible de forma directa con la API de Qwen3-ASR, sin necesidad de conversores ni post-procesado adicional.

La adaptación se realizó mediante un pequeño LoRA en el decoder sobre un encoder de audio congelado, entrenado con unas pocas horas de audio público, y posteriormente fusionado para su despliegue. El modelo que nos ocupa es la versión flagship de segunda generación, con 2.038.052.480 parámetros totales (unos 2.04B), y mejora los resultados de su predecesor TEA-ASR-1 en todos los benchmarks evaluados. Su relevancia radica en que ofrece una alternativa open source y ligera para el reconocimiento de voz en el contexto taiwanés, superando en las pruebas publicadas a especialistas como Breeze-ASR-25 y a modelos generalistas como Whisper-large-v3.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3-ASR adaptado (encoder de audio congelado + decoder LoRA fusionado) |
| Parametros totales | 2.038.052.480 (2.04B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | zh, en (mandarín de Taiwán con code-switching) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

TEA-ASR-1.1 parte del modelo base Qwen/Qwen3-ASR-1.7B. La adaptación se describe como "un pequeño decoder LoRA sobre un encoder de audio congelado", es decir, solo se entrenan parámetros adicionales en el lado del decoder mientras el encoder de audio permanece fijo. Tras el entrenamiento, estos parámetros se fusionan en un único checkpoint que se carga exactamente igual que el modelo Qwen3-ASR original. No se menciona el número de tokens de entrenamiento ni la composición exacta del dataset, solo que se utilizaron "unas pocas horas de audio público". Tampoco se indica si se emplearon técnicas como RLHF o DPO; no hay evidencia de ello en la información disponible. El autor señala que la adaptación es ligera y que no se requiere post-procesado en tiempo de ejecución.

El modelo está pensado para generar chino tradicional con vocabulario taiwanés de forma nativa, en lugar de traducir el mandarín a inglés cuando aparecen términos en inglés. La evaluación se realiza con una métrica de Mixed Error Rate (MER) que combina el error por caracteres en chino y el error por palabras en inglés, calculada de forma conjunta por utterance y micro-promediada.

## Capacidades

- Reconocimiento de voz en mandarín de Taiwán, generando salida en chino tradicional con vocabulario taiwanés auténtico.
- Robustez frente al code-switching mandarín–inglés, manejando mezclas naturales de ambos idiomas sin traducir el mandarín al inglés.
- Compatibilidad directa con la API de Qwen3-ASR: misma carga e inferencia, sin necesidad de herramientas adicionales.
- Soporte de contextual biasing mediante el parámetro `context=`, que permite pasar palabras clave (hotwords) como nombres propios o jerga técnica para mejorar la transcripción.
- Decodificación optimizada con la opción `language="Chinese"` para habla de Taiwán.
- Disponibilidad de variantes: TEA-ASR-1.1-mini (780M) y TEA-ASR-1.1-fmt (con control de convención numérica).
- No se menciona soporte de tool calling, visión ni otras capacidades multimodales más allá de entrada de audio y salida de texto.

## Casos de uso

- Transcripción de reuniones y llamadas en Taiwán: el modelo captura el code-switching natural entre mandarín e inglés, frecuente en equipos de trabajo taiwaneses, y produce texto en chino tradicional con términos locales.
- Subtitulado de vídeos y podcasts: genera subtítulos en chino tradicional con vocabulario taiwanés, evitando la conversión posterior de simplificado a tradicional que suele introducir errores.
- Accesibilidad para personas con discapacidad auditiva: puede integrarse en aplicaciones de transcripción en tiempo real para contenido en mandarín de Taiwán, incluyendo entornos educativos y corporativos.
- Análisis de interacciones de atención al cliente: las empresas de Taiwán pueden transcribir llamadas para análisis de calidad, aprovechando el parámetro `context=` para incluir nombres de productos o terminología propia del sector.
- Transcripción de conferencias y cursos universitarios: los benchmark en NTUML2021 demuestran un buen rendimiento en conferencias; es adecuado para crear notas de clase o archivos de seminarios académicos.
- Dictado por voz en aplicaciones móviles: al ser drop-in con Qwen3-ASR, se puede integrar en asistentes y herramientas de dictado que esperen chino tradicional, sin cambios en el código de integración.
- Subtitulado en vivo de eventos con mezcla de idiomas: gracias al manejo del code-switching, funciona bien en eventos donde se alterna mandarín e inglés de forma espontánea.

## Benchmarks y rendimiento

Los siguientes resultados son medidas propias del autor, obtenidas bajo un protocolo uniforme y recalculadas con el mismo código y las mismas divisiones de datos para todos los sistemas. La métrica es Mixed Error Rate (MER%), donde un valor menor indica mejor rendimiento. Antes de puntuar, referencias e hipótesis se normalizan a chino simplificado con OpenCC (t2s), minúsculas y sin puntuación, para aislar el reconocimiento del estilo de escritura.

| Benchmark | TEA-ASR-1.1 | TEA-ASR-1.1-mini | Qwen3-ASR-1.7B | Qwen3-ASR-0.6B | Breeze-ASR-25 | Whisper-large-v3 |
|---|---|---|---|---|---|---|
| CommonVoice 19 (zh-TW) | **3.58** | 5.12 | 3.90 | 5.79 | 8.03 | 10.17 |
| ASCEND (zh-en) | **9.60** | 11.20 | 10.57 | 12.54 | 17.53 | 19.61 |
| CSZS (zh-en) | **10.94** | 12.51 | 11.03 | 16.03 | 12.18 | 23.24 |
| NTUML2021 | **6.67** | 7.53 | 10.12 | 11.03 | 7.50 | 9.68 |

Comparación generacional entre TEA-ASR-1.1 y su predecesor TEA-ASR-1, en el mismo protocolo:

| Benchmark | TEA-ASR-1.1 | TEA-ASR-1 | Δ |
|---|---|---|---|
| CommonVoice 19 (zh-TW) | **3.58** | 3.64 | −0.06 |
| ASCEND (zh-en) | **9.60** | 10.59 | −0.99 |
| CSZS (zh-en) | **10.94** | 10.98 | −0.04 |
| NTUML2021 | **6.67** | 6.80 | −0.13 |

El autor indica que la métrica plegada oculta la diferencia práctica más relevante: TEA-ASR emite chino tradicional y vocabulario taiwanés de forma nativa, mientras que el modelo base produce chino simplificado.

## Requisitos de hardware

- VRAM estimada: no se han publicado cifras oficiales. Con 2.04B parámetros y pesos safetensors de 4.1GB, se estima que la inferencia en fp16 requiere al menos 8GB de VRAM para el modelo y sus activaciones.
- GPU recomendadas: no disponible. Una tarjeta con 12-16GB de VRAM (por ejemplo, RTX 4070 Ti o A10G) debería ser suficiente para la mayoría de casos.
- Compatibilidad con GPU de consumo: sí, el modelo es lo suficientemente pequeño como para ejecutarse en tarjetas de consumo modernas, aunque no se especifican requisitos mínimos.
- Opciones de despliegue: se puede usar con el paquete `qwen-asr` (pip install qwen-asr) o directamente con la librería `transformers` de Hugging Face. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Acceso |
|---|---|---|---|---|
| TEA-ASR-1.1 | 2.04B | no disponible | MIT | Hugging Face |
| Qwen3-ASR-1.7B | 1.7B | no disponible | no disponible | Hugging Face |
| Breeze-ASR-25 | no disponible | no disponible | no disponible | no disponible |
| Whisper-large-v3 | no disponible | no disponible | no disponible | no disponible |

En rendimiento sobre los benchmarks publicados, TEA-ASR-1.1 supera a Qwen3-ASR-1.7B en CommonVoice, ASCEND y NTUML2021, mientras que en CSZS obtiene un MER ligeramente peor (10.94 frente a 11.03, una diferencia marginal). Frente a Breeze-ASR-25, que es un especialista taiwanés, el modelo gana en todos los conjuntos. Frente a Whisper-large-v3, la diferencia es amplia en todos los casos.

## Limitaciones y advertencias

- Los datos de rendimiento provienen de mediciones propias del autor y no han sido verificados de forma independiente por terceros; existe riesgo de sesgo de selección en la elección de divisiones de datos.
- La métrica MER emplea una normalización que convierte ambas hipótesis y referencias a chino simplificado, por lo que no refleja la ganancia real de usar chino tradicional y vocabulario taiwanés.
- El entrenamiento se realizó con "unas pocas horas de audio público", una cantidad muy reducida; la generalización a dominios fuera del mandarín taiwanés o a otros dialectos chinos puede ser limitada.
- El modelo está optimizado para el code-switching mandarín–inglés específico de Taiwán; su rendimiento con otros idiomas o variantes (mandarín de China continental, hokkien, hakka) puede degradarse significativamente.
- La longitud de contexto no está documentada; en consecuencia, es posible que existan limitaciones para audios muy largos o de alta duración.
- El uso de detección automática de idioma no está recomendado por el autor; se sugiere pasar explícitamente `language="Chinese"` para habla taiwanesa.
- La licencia MIT permite el uso comercial, pero el modelo base Qwen3-ASR podría tener condiciones de licencia propias que conviene revisar antes de un despliegue en producción.
- No se documentan sesgos específicos, pero como en todo ASR, pueden existir diferencias de rendimiento según acento, género, ruido de fondo o estilo de habla.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/JacobLinCool/TEA-ASR-1.1
- Variante mini: https://huggingface.co/JacobLinCool/TEA-ASR-1.1-mini
- Variante fmt (control de convención numérica): https://huggingface.co/JacobLinCool/TEA-ASR-1.1-fmt
- Predecesor TEA-ASR-1: https://huggingface.co/JacobLinCool/TEA-ASR-1
- Modelo base Qwen/Qwen3-ASR-1.7B: https://huggingface.co/Qwen/Qwen3-ASR-1.7B
