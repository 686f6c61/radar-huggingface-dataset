# SirSahOl/MiniCPM5-2B-chat-mlx-4bit

## Resumen

SirSahOl/MiniCPM5-2B-chat-mlx-4bit es una conversión a 4 bits en formato MLX del modelo openbmb/MiniCPM5-2B, publicada por el usuario SirSahOl y orientada exclusivamente a ejecución en Apple Silicon. No se trata de un modelo entrenado desde cero, sino de una cuantización weight-only del modelo base: la arquitectura, el tokenizador y el comportamiento heredan íntegramente del original, y lo único que cambia es la representación numérica de los pesos (4 bits por parámetro) y el formato de serialización, adaptado al framework MLX de Apple.

El modelo tiene 2.516.756.480 parámetros totales (unos 2,5 mil millones), ocupa 1,3 GB en disco tras la conversión y se distribuye en safetensors con licencia Apache 2.0. Su relevancia práctica es acotada pero clara: permite ejecutar un LLM conversacional de tamaño medio en un Mac con 8 GB de memoria unificada, con métricas declaradas de 37,05 tokens/s, 27,0 ms de tiempo hasta el primer token y 142,2 MB de memoria pico durante el benchmark realizado en un Apple M1.

La ficha del repositorio no documenta el proceso de entrenamiento del modelo original, ni el número de tokens, ni la composición del dataset, ni capacidades concretas como tool calling, visión o modo de razonamiento. La información disponible se limita a los detalles de la conversión, unas métricas de rendimiento en M1 y unas advertencias sobre pérdida de calidad por cuantización.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible (la etiqueta del repositorio indica "llama"; la model card no detalla la arquitectura del modelo base) |
| Parámetros totales | 2.516.756.480 (≈2,5 B), dato real de los safetensors |
| Parámetros activos | No aplica / no disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | No disponible. La model card advierte de degradación con contextos muy largos (>8K tokens) en cuantizaciones bajas |
| Tipos de cuantización | 4 bits (MLX). La model card recomienda 8 bits y 16 bits según memoria, pero solo publica el variante de 4 bits como enlace |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 (heredada del modelo base) |
| Formato de pesos | Safetensors (formato MLX) |
| Tamaño del repositorio | 1,4 GB (1,3 GB de pesos convertidos) |
| Librería | mlx-lm 0.31.3 |
| Modelo base | openbmb/MiniCPM5-2B |
| Relación con el base | Quantized (cuantización de pesos) |

## Arquitectura y entrenamiento

No hay información en la documentación proporcionada sobre la arquitectura interna del modelo base openbmb/MiniCPM5-2B más allá de la etiqueta "llama" presente en los tags del repositorio, que sugiere una familia de transformer decoder-only autorregresivo. Tampoco se especifican el número de capas, la dimensión oculta, el número de cabezas de atención, el tipo de atención ni si emplea alguna variante de atención lineal o híbrida.

Respecto al entrenamiento, la model card de esta conversión no aporta ningún dato: no se indica el volumen de tokens, la composición del corpus, ni si hubo fases de ajuste por instrucciones (SFT), RLHF o DPO. Lo que sí se documenta es el proceso de conversión: se utilizó mlx-lm 0.31.3 mediante el comando `mlx_lm.convert --hf-path openbmb/MiniCPM5-2B --mlx-path output/MiniCPM5-2B-mlx-4bit -q --q-bits 4`, con un tiempo de conversión de 2380,05 segundos y una salida de 1,3 GB. Se trata, por tanto, de una cuantización weight-only: no hay destilación, no hay reentrenamiento y no hay cambios en la arquitectura.

## Capacidades

- Generación de texto conversacional: el pipeline declarado es text-generation y el tag "conversational" indica que está orientado a diálogo multi-turno.
- Conversión de pesos sin alteración funcional: al ser una cuantización weight-only, conserva las capacidades del modelo base, aunque la model card no las enumera.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponibles; no se declara ningún idioma en los metadatos.
- Modo de razonamiento explícito (thinking), visión o audio: no disponible en la información proporcionada.
- Ejecución local en Apple Silicon mediante MLX, con CLI interactiva (`mlx_lm.chat`) y API de Python (`mlx_lm.load` / `mlx_lm.generate`).

## Casos de uso

- Asistente conversacional local en un Mac: el modelo puede ejecutarse con `mlx_lm.chat` en un equipo con 8 GB de memoria unificada, lo que permite mantener conversaciones privadas sin enviar datos a servicios externos; es adecuado porque los pesos ocupan 1,3 GB y el benchmark declara 142,2 MB de memoria pico.
- Prototipado rápido de aplicaciones de texto en Apple Silicon: un desarrollador puede integrar el modelo vía la API de Python de mlx-lm en scripts de prueba, con 27,0 ms de TTFT y 37,05 tokens/s, suficiente para validar flujos de generación antes de pasar a un modelo mayor.
- Generación de texto asistida por lotes en local: para tareas de resumen, reescritura o clasificación generativa sobre volúmenes moderados de documentos, el throughput declarado permite procesar continuamente sin GPU dedicada.
- Educación y experimentación con cuantización: resulta útil como caso de estudio para comparar la pérdida de calidad entre 4, 8 y 16 bits en el mismo modelo, tal como sugiere la tabla de recomendaciones de la model card.
- Generación de código en entornos con recursos limitados: si el modelo base conserva capacidad de código (no confirmado en la documentación), podría usarse como autocompletado local en editores sobre un Mac; conviene validar la calidad real antes de llevarlo a producción.
- Despliegue en portátiles sin GPU discreta: al requerir únicamente Apple Silicon (M1 o posterior), cubre escenarios de trabajo en movilidad donde no hay acceso a CUDA ni a VRAM dedicada.
- Base para experimentos de ajuste fino con LoRA en MLX: al ser un modelo pequeño y ya cuantizado, sirve como punto de partida para pruebas de adaptación a dominios concretos en hardware de consumo, siempre que se verifique la compatibilidad de mlx-lm con el flujo de entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la información disponible. Los únicos datos numéricos publicados son métricas de eficiencia de inferencia:

| Métrica | Valor (4 bits) | Condiciones |
|---|---|---|
| Tokens por segundo | 37,05 | Apple M1, 8 GB de memoria unificada, media de 5 ejecuciones, 256 tokens máximos |
| TTFT (tiempo hasta el primer token) | 27,0 ms | Mismas condiciones |
| Memoria pico | 142,2 MB | Mismas condiciones |

Estas cifras corresponden al benchmark declarado por el autor de la conversión y no incluyen comparación con otros modelos.

## Requisitos de hardware

- Plataforma obligatoria: Apple Silicon (M1 o posterior). El modelo no puede ejecutarse con MLX en hardware Intel, AMD o NVIDIA.
- Memoria: el autor recomienda 4 bits para equipos M1/M2 con 8 GB, 8 bits para M1/M2 Pro/Max con 16-32 GB y 16 bits para M2/M3/M4 Ultra con 64 GB o más.
- Memoria pico medida: 142,2 MB durante el benchmark en M1 con 8 GB (medición del autor; no representa necesariamente el consumo total del proceso completo).
- Almacenamiento: 1,4 GB de repositorio, 1,3 GB de pesos convertidos.
- GPU recomendadas: no aplica en el sentido habitual; el hardware objetivo son los SoC de Apple (M1, M2, M3, M4 y sus variantes Pro, Max y Ultra).
- ¿Cabe en GPU de consumo (NVIDIA/AMD)?: no disponible. Los pesos están en formato MLX, no en GGUF ni en safetensors estándar para transformers, por lo que no se pueden cargar directamente en vLLM, TGI o llama.cpp sin una conversión adicional no documentada.
- Opciones de despliegue: mlx-lm (CLI `mlx_lm.chat` y `mlx_lm.generate`, y API de Python `mlx_lm.load` / `mlx_lm.generate`). No se documentan otras opciones como vLLM, Ollama, llama.cpp o TGI.
- Latencia y throughput: 27,0 ms de TTFT y 37,05 tokens/s en Apple M1 con 8 GB, según el benchmark del autor.

## Comparativa con modelos similares

No se dispone de datos de benchmarks de calidad ni de especificaciones de terceros en la información proporcionada, por lo que no es posible una comparación rigurosa con otros modelos de la misma categoría. La única comparación documentada es interna, entre los niveles de cuantización recomendados por el autor:

| Variante | Hardware recomendado | Compromiso declarado |
|---|---|---|
| 4 bits (este repositorio) | M1/M2 con 8 GB | Mejor equilibrio entre calidad y uso de memoria; es la única variante publicada con enlace |
| 8 bits | M1/M2 Pro/Max con 16-32 GB | Mayor calidad con un uso de memoria razonable |
| 16 bits | M2/M3/M4 Ultra con 64 GB o más | Precisión completa, sin pérdida de calidad por cuantización |

Comparación con alternativas externas de tamaño similar: no disponible.

## Limitaciones y advertencias

- Pérdida de calidad por cuantización: el autor advierte explícitamente de que la conversión a 4 bits introduce una pérdida de calidad respecto al modelo original, y que a menor número de bits la pérdida es mayor.
- Degradación en contextos largos: la model card señala que el rendimiento puede degradarse con contextos superiores a 8K tokens en niveles de cuantización bajos.
- Dependencia de plataforma: requiere Apple Silicon (M1 o posterior). No es ejecutable en CUDA ni en CPU x86 a través de MLX.
- Conversión weight-only: la arquitectura y el comportamiento se heredan del modelo base; cualquier limitación del original (sesgos, alucinaciones, idiomas soportados) se mantiene. No se documenta ninguna evaluación de sesgos ni de tasas de alucinación.
- Idiomas: no se declara ningún idioma soportado en los metadatos, por lo que no se puede garantizar un rendimiento adecuado en castellano ni en otros idiomas sin evaluación previa.
- Capacidades no verificadas: no hay información sobre tool calling, razonamiento multi-paso, visión o modo thinking; no deben asumirse en producción.
- Licencia: Apache 2.0, heredada del modelo base, permite uso comercial siempre que se cumplan las condiciones de la licencia (atribución y conservación de avisos). Conviene consultar la model card del modelo original para los términos completos.
- Madurez del repositorio: 0 descargas y 0 "likes" en el momento de la consulta, una única versión (v1.0 del 11 de septiembre de 2026) y un único mantenedor; no hay garantía de mantenimiento ni de soporte.
- Ausencia de benchmarks de calidad: no hay datos de MMLU, HumanEval, GSM8K u otros que permitan estimar el rendimiento real en tareas, solo métricas de velocidad.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/SirSahOl/MiniCPM5-2B-chat-mlx-4bit
- Modelo base: https://huggingface.co/openbmb/MiniCPM5-2B
- Framework MLX (Apple): https://github.com/ml-explore/mlx
- Pipeline de conversión MLX Foundry: https://github.com/SirSahOl/mlx-foundry
- Perfil del autor de la conversión: https://huggingface.co/SirSahOl
- Papers, blogs o demos adicionales: no disponible. Las búsquedas web realizadas no devolvieron resultados relevantes sobre este modelo (únicamente páginas de inicio de sesión de Microsoft Teams, sin relación con el contenido).
