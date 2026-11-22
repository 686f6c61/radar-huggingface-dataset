# dutgutg/AzurLane-Irodori-TTS-v4.1-Small-LoRA

## Resumen

AzurLane-Irodori-TTS-v4.1-Small-LoRA es un adaptador LoRA de rango 16 entrenado sobre el modelo de síntesis de voz Aratako/Irodori-TTS-v4.1-Small, un TTS japonés de tipo zero-shot basado en clonación de voz por referencia. Lo desarrolla el usuario dutgutg (publicado bajo la organización Moear en los enlaces de descarga) y su objetivo es reproducir las voces de los personajes del videojuego Azur Lane en japonés: un mismo adaptador compartido sirve para todos los personajes, cambiando únicamente el audio de referencia en cada inferencia.

El adaptador se entrenó con 49.727 clips de voz japonesa (135,8 horas) procedentes de 902 identificadores de nave (912 identidades de voz tras separar variantes de doblaje), extraídos del conjunto de datos Moear/AzurLane-Voice-20261118. El repositorio contiene el checkpoint del paso 692, de unos 106 MB, que se carga junto al modelo base con precisión BF16 y un decodificador de audio (codec).

Su relevancia es acotada pero clara: demuestra que un LoRA pequeño y de bajo rango puede especializar un TTS zero-shot en un dominio cerrado de voces de personajes, con un coste de entrenamiento e inferencia reducido (unos 6,4 GiB de VRAM en GPU). No es un modelo de propósito general: es un adaptador de nicho para doblaje y prototipado de voces de Azur Lane en japonés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (rango 16) sobre el modelo TTS Aratako/Irodori-TTS-v4.1-Small; se actualiza también el predictor de duración |
| Parametros totales | No disponible (el adaptador ocupa unos 106 MB; los parámetros del modelo base no se detallan) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible; la inferencia documentada usa BF16 para el modelo y FP32 para el codec |
| Idiomas soportados | Japonés (ja) |
| Licencia | No disponible |
| Formato de pesos | safetensors (adapter_model.safetensors + adapter_config.json) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 16 aplicado sobre el modelo base Irodori-TTS v4.1 Small (RF), un sistema de texto a voz con clonación de voz zero-shot que recibe un audio de referencia y un texto en japonés. Durante el entrenamiento no solo se ajustaron las capas del adaptador, sino también el predictor de duración del modelo base, lo que afecta al ritmo y la longitud de las locuciones generadas. El adaptador se publica en el paso 692 de entrenamiento.

Los datos de entrenamiento provienen del conjunto Moear/AzurLane-Voice-20261118, filtrado a clips de entre 3 y 20 segundos: 49.727 clips, 135,8 horas, 902 identificadores de nave más 114 clips adicionales de TB, hasta 912 identidades de voz. Todo el material es voz japonesa del videojuego. No se documentan detalles sobre el proceso de alineación texto-audio, el optimizador, la tasa de aprendizaje ni si hubo etapas de refinamiento posteriores.

## Capacidades

- Síntesis de voz en japonés con clonación de timbre a partir de un audio de referencia del personaje.
- Un único adaptador cubre todas las voces de personaje entrenadas; el cambio de personaje se hace sustituyendo el audio de referencia, sin recargar pesos.
- Control del número de pasos de inferencia (la evaluación usa 40 pasos), lo que permite intercambiar calidad por velocidad.
- Generación de locuciones de duración variable gracias al predictor de duración actualizado.
- Integración con servidor HTTP mediante Irodori-TTS-Server, especificando el directorio del adaptador en el campo `irodori.lora_adapter` de la petición.
- No soporta tool calling, agentes, razonamiento multi-paso ni otras capacidades de texto: es exclusivamente un modelo de texto a voz.

## Casos de uso

- Doblaje de contenido de fans de Azur Lane: generar líneas de voz nuevas para un personaje a partir de un clip de referencia y un guion en japonés, sin necesidad de grabar al actor original.
- Prototipado de mods y traducciones: sustituir o ampliar el audio de un personaje en una modificación del juego, generando las frases nuevas con el LoRA y el mismo timbre.
- Generación de audio para vídeos y podcasts de nicho: producir narraciones con voces de personaje para contenido divulgativo o de entretenimiento en japonés.
- Pruebas de calidad de pipelines TTS: usar el adaptador como caso de estudio de especialización de un TTS zero-shot mediante LoRA de bajo rango, comparando métricas de similitud de timbre y tasa de error de kana.
- Asistentes de voz con personalidad: integrar el modelo en un servidor TTS (Irodori-TTS-Server) para dar a un asistente conversacional la voz de un personaje concreto en japonés.
- Evaluación comparativa de modelos TTS: emplear los informes de evaluación incluidos (reports/evaluation-summary.json) como referencia para comparar variantes de adaptadores y modelos base en tareas de clonación de voz.

## Benchmarks y rendimiento

Los datos publicados comparan configuraciones con dos métricas de similitud de timbre (ERes2NetV2 y WavLM, mayor es mejor) y tasa de error de kana por transcripción automática (menor es mejor).

| Configuracion | Ronda 1 timbre (24 frases) | Error kana ronda 1 | Ronda 2 timbre (16 frases) | Error kana ronda 2 |
|---|---:|---:|---:|---:|
| V5turbo zero-shot (oficial) | 0,8079 / 0,9278 | 4,01 % | 0,8107 / 0,9205 | 8,72 % |
| Irodori v4.1 Small zero-shot (oficial) | 0,7542 / 0,9139 | 3,43 % | 0,7354 / 0,9154 | 8,17 % |
| Irodori LoRA paso 692 | 0,7659 / 0,9253 | 4,01 % | 0,7403 / 0,9094 | 9,81 % |

Como referencia, el audio original del juego medido con el mismo sistema ASR da un 7,63 % de error de kana en la segunda ronda. El LoRA mejora la similitud de timbre respecto al modelo base Irodori zero-shot en ambas rondas, pero queda por debajo de V5turbo en la media de las dos rondas y empeora ligeramente la tasa de error de kana en la segunda ronda.

## Requisitos de hardware

- VRAM en inferencia: unos 6,4 GiB de pico con el modelo en BF16 y el codec en FP32, todo en GPU (medido en una RTX 6000D).
- Alternativa de bajo consumo: con `--codec-device cpu` el pico baja a unos 3,7 GiB, a costa de mayor latencia de generación.
- GPU recomendadas: cualquier GPU NVIDIA con al menos 8 GiB de VRAM para la configuración completa; con 4-6 GiB es viable usando el codec en CPU. Entornos CUDA 12.8 (`uv sync --extra cu128`).
- Cabe en GPU de consumo: sí, en tarjetas con 8 GiB o más (por ejemplo, RTX 3060 Ti, 4060, 4070); con 6 GiB o menos, mover el codec a CPU.
- Despliegue: script `infer.py` del proyecto Irodori-TTS, interfaz Gradio (`gradio_app.py`) y servidor HTTP Irodori-TTS-Server. No se documentan soportes de vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo).
- Latencia y throughput: no disponibles de forma numérica; la evaluación usa 40 pasos de inferencia y el autor indica que la generación es más lenta con el codec en CPU.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Timbre (ronda 1) | Error kana (ronda 1) | Licencia |
|---|---|---|---|---|---|---|
| AzurLane-Irodori-TTS-v4.1-Small-LoRA (paso 692) | LoRA r16 sobre TTS | No disponible (adaptador ~106 MB) | No disponible | 0,7659 / 0,9253 | 4,01 % | No disponible |
| Irodori-TTS v4.1 Small (base, zero-shot) | TTS zero-shot | No disponible | No disponible | 0,7542 / 0,9139 | 3,43 % | Ver licencia del modelo base |
| AzurLane GPT-SoVITS V5turbo (zero-shot) | TTS zero-shot | No disponible | No disponible | 0,8079 / 0,9278 | 4,01 % | No disponible |

La comparación se limita a las variantes evaluadas por el autor; no se dispone de datos frente a otros TTS comerciales o abiertos de la misma categoría.

## Limitaciones y advertencias

- Solo funciona en japonés; no se documenta soporte de otros idiomas.
- Está especializado en las voces de Azur Lane: fuera de ese dominio de personajes, el LoRA no aporta ninguna ventaja sobre el modelo base.
- El error de kana empeora respecto al modelo base en la segunda ronda de evaluación (9,81 % frente a 8,17 %), lo que indica riesgo de pronunciación incorrecta en algunas frases.
- La similitud de timbre queda por debajo de V5turbo en la media de las dos rondas; el autor recomienda escuchar el personaje concreto antes de elegir pesos.
- Licencia no disponible en la información proporcionada: no se puede confirmar el uso comercial. El modelo base remite a su propia licencia y restricciones éticas.
- Las voces, diálogos y personajes pertenecen a sus titulares originales; el uso del audio generado puede infringir derechos de propiedad intelectual.
- Riesgo de alucinación acústica y artefactos en locuciones largas o con referencias de audio ruidosas; no se documentan garantías de estabilidad fuera del conjunto de evaluación.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validación comunitaria independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dutgutg/AzurLane-Irodori-TTS-v4.1-Small-LoRA
- Modelo base: https://huggingface.co/Aratako/Irodori-TTS-v4.1-Small
- Licencia y restricciones del modelo base: https://huggingface.co/Aratako/Irodori-TTS-v4.1-Small#license-ethical-restrictions
- Repositorio Irodori-TTS: https://github.com/Aratako/Irodori-TTS
- Instalación de Irodori-TTS: https://github.com/Aratako/Irodori-TTS#installation
- Commit de entrenamiento/evaluación: https://github.com/Aratako/Irodori-TTS/commit/f01c08cd40c0afa62a862439a5de12f6dcf62054
- Servidor TTS: https://github.com/Aratako/Irodori-TTS-Server
- Conjunto de datos de voz: https://huggingface.co/datasets/Moear/AzurLane-Voice-20261118/tree/39d126bfbaf30311b0518ca8549cc820fc98d92c
- Modelo V5turbo de referencia: https://huggingface.co/Moear/AzurLane-GPT-SoVITS-V5turbo
