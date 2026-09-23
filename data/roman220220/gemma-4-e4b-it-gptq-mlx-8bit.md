# roman220220/gemma-4-E4B-it-gptq-mlx-8bit

## Resumen

Este repositorio es una cuantización de 8 bits en formato MLX del modelo multimodal google/gemma-4-E4B-it, publicada por el usuario roman220220. No se trata de un modelo entrenado desde cero, sino de una conversión de pesos con corrección de error GPTQ (basada en la matriz de Hess) aplicada a los tres componentes reales del modelo: el decodificador de texto, la torre de visión y la torre de audio. El checkpoint conserva íntegros los pesos multimodales, con 7.996.156.490 parámetros totales según los safetensors y un repositorio de 12,1 GB, frente a los aproximadamente 16 GB del original en bf16.

Su relevancia es fundamentalmente de infraestructura: el soporte de Gemma 4 en mlx-lm solo implementaba el decodificador de texto, de modo que cargar un checkpoint descartaba silenciosamente los pesos `vision_tower`, `audio_tower`, `embed_vision` y `embed_audio`. Este release incluye código de inferencia MLX escrito desde cero para las torres de visión y audio (`gemma4_vision.py`, `gemma4_audio.py`), verificado contra la implementación real de `transformers` con una diferencia absoluta máxima de aproximadamente 1e-6 en la fusión multimodal completa.

El modelo se distribuye bajo licencia Apache 2.0 y está pensado para ejecutarse en Apple Silicon mediante MLX. No se han publicado resultados de benchmarks estándar, el repositorio acumula 0 descargas y 0 likes en el momento de la consulta, y el propio autor reconoce que todavía no existe una comparación cuantitativa entre GPTQ y redondeo al más cercano (RTN) para este checkpoint.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal de la familia Gemma 4: decodificador de texto mas torre de vision y torre de audio (arquitectura concreta del backbone no detallada; la nomenclatura E4B del modelo base sugiere esquema de parametros efectivos, sin confirmar) |
| Parametros totales | 7.996.156.490 (segun safetensors) |
| Parametros activos | no disponible (no se confirma en la informacion proporcionada si el modelo base emplea mezcla de expertos) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GPTQ de 8 bits en MLX (`gptq_nbit`) para todas las capas lineales de las tres torres; normas, embeddings y tensores pequenos de condicionamiento permanecen en bf16 |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors en formato MLX (libreria `mlx`); no se proporciona GGUF |
| Modalidad | Texto, imagen (vision) y audio; pipeline `image-text-to-text` |
| Modelo base | google/gemma-4-E4B-it |
| Tamano del repositorio | 12,1 GB |
| Autor | roman220220 |
| Fecha de creacion | 2026-09-22 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo Gemma 4 E4B instruct de Google, un transformer multimodal con tres componentes diferenciados: decodificador de lenguaje, torre de visión y torre de audio, más proyecciones de embedding específicas por modalidad (`embed_vision`, `embed_audio`). Este repositorio no modifica la arquitectura: reimplementa en MLX el camino de inferencia completo, incluidas las torres de visión y audio que el soporte oficial de mlx-lm no cubría, y valida la paridad numérica frente a `transformers` mediante pases forward reales (diferencia absoluta máxima de aproximadamente 1e-6 en la fusión multimodal completa).

No hubo entrenamiento adicional ni ajuste fino. El proceso aplicado es una cuantización GPTQ de 8 bits con corrección de error Hessiana, en lugar de redondeo al más cercano, con datos de calibración reales y específicos por modalidad: prompts de texto reales para el decodificador, fotografías reales de COCO para la torre de visión y fragmentos reales de LibriSpeech para la torre de audio. La implementación de `gptq_nbit` es la misma que el autor empleó en sus trabajos previos (`nemotron-extreme-quant`, `zimage-quant`), sin modificaciones. No se detalla la composición del dataset de entrenamiento del modelo base, ni si este pasó por RLHF o DPO; esa información pertenece a la model card de Google y no se incluye aquí.

## Capacidades

- Generación de texto conversacional: funciona como cualquier modelo de texto de mlx-lm mediante `mlx_lm.generate`.
- Comprensión de imágenes: la torre de visión está cuantizada y operativa; validada con una fotografía real de COCO de dos gatos, respondiendo correctamente a la pregunta "What animal is in this picture?".
- Transcripción de audio: la torre de audio está cuantizada y validada con un fragmento real de LibriSpeech, con salida coincidente con la referencia ("Mr Quilter is the apostle of the middle classes and we are glad to welcome his gospel.").
- Generación autorregresiva multimodal: la validación se realizó con un bucle de generación completo, no con un único pase forward.
- Seguimiento de instrucciones y formato conversacional: la plantilla de chat se aplica con `tokenizer.apply_chat_template`.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible (los idiomas soportados no figuran en la información proporcionada).
- Capacidades especiales: multimodalidad conjunta texto + imagen + audio en un mismo checkpoint; no se documenta modo de razonamiento explícito ni salida de audio.

## Casos de uso

- Transcripción de audio local y privada: el modelo puede procesar fragmentos de audio y devolver la transcripción sin salir del equipo, lo que resulta adecuado para material sensible donde no se quiere enviar audio a una API externa. La torre de audio está cuantizada y verificada con LibriSpeech.
- Descripción de imágenes para accesibilidad: dado que la torre de visión funciona con pesos cuantizados, se puede construir un pipeline que reciba una fotografía y genere una descripción textual, útil para etiquetado automático o generación de texto alternativo.
- Asistente multimodal de escritorio en Mac: al ejecutarse sobre MLX en Apple Silicon, permite montar un chat que acepte imágenes y audio además de texto, con los datos permaneciendo en el dispositivo.
- Verificación y curación de datasets multimodales: el modelo puede usarse para comprobar pares imagen-texto o audio-transcripción, generando descripciones o transcripciones de control sobre muestras grandes.
- Análisis de documentos escaneados con texto incrustado: combinando la entrada de imagen con el decodificador de texto, se pueden extraer y resumir contenidos de capturas o digitalizaciones.
- Prototipado e investigación en cuantización: el repositorio sirve como referencia reproducible de GPTQ multimodal en MLX, con código y pipeline de calibración publicados, para estudiar el impacto de la cuantización por modalidad.
- Integración en aplicaciones de escritorio vía LLMTray: el autor indica que el checkpoint podrá usarse desde LLMTray cuando su interfaz de chat incorpore visión y audio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible (no hay MMLU, HumanEval, GSM8K ni métricas equivalentes). La model card solo aporta validaciones cualitativas y una medida de paridad numérica:

| Prueba | Modalidad | Resultado reportado |
|---|---|---|
| Paridad MLX vs `transformers` | Multimodal (fusion completa) | Diferencia absoluta maxima ~1e-6 |
| Pregunta "What animal is in this picture?" sobre foto real de COCO (dos gatos) | Vision | "The animals in this picture are cats." |
| Transcripcion de fragmento real de LibriSpeech | Audio | Coincide con la referencia: "Mr Quilter is the apostle of the middle classes and we are glad to welcome his gospel." |
| Comparativa GPTQ vs RTN (vision o metricas cuantitativas) | Vision / texto | No realizada, segun el propio autor |

## Requisitos de hardware

- VRAM / memoria unificada: los pesos cuantizados ocupan aproximadamente 11 GB (frente a los ~16 GB del bf16). Hay que sumar la caché KV y las activaciones, por lo que se recomienda un mínimo de 16 GB de memoria unificada y 24-32 GB para trabajar con contexto largo o varias modalidades simultáneas. El repositorio completo ocupa 12,1 GB.
- GPU compatibles: el formato es MLX, por lo que requiere Apple Silicon (series M1, M2, M3, M4 o posteriores). No se documenta soporte para A100, H100, RTX 4090 ni otras GPU NVIDIA o AMD.
- Cabe en GPU de consumo: en el ecosistema Apple, sí, en equipos con 16 GB o más de memoria unificada. En GPUs de consumo NVIDIA no es utilizable sin una reconversión de formato que no se proporciona.
- Opciones de despliegue: `mlx-lm` (se recomienda el fork `ipsupport-llc/mlx-lm`, que incluye el soporte de visión y audio), LLMTray cuando su capa de chat multimodal esté lista, y ejemplos propios en `rromenskyi/quant-ternary/gemma4-quant`. No se ofrece compatibilidad con vLLM, llama.cpp, Ollama, TGI ni ninguna otra opción del ecosistema CUDA; tampoco se publica GGUF.
- Latencia y throughput: no disponible. La model card no incluye medidas de velocidad ni de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Cuantizacion | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| roman220220/gemma-4-E4B-it-gptq-mlx-8bit | 7.996.156.490 | no disponible | Texto + imagen + audio | GPTQ 8 bits (MLX) | safetensors MLX | apache-2.0 | Publicado, 0 descargas; ~11 GB |
| google/gemma-4-E4B-it (base) | no disponible | no disponible | Texto + imagen + audio | bf16 sin cuantizar | pesos originales de Google | apache-2.0 | Modelo de referencia; ~16 GB |
| Cuantizacion MLX 8 bits con RTN sobre el mismo base | 7.996.156.490 (equivalente) | no disponible | Texto + imagen + audio | RTN 8 bits | safetensors MLX | apache-2.0 | No generada ni comparada en la informacion disponible |
| Cuantizaciones MLX de terceros para Gemma 4 (p. ej. comunidad mlx-community) | no disponible | no disponible | Texto unicamente, segun la limitacion descrita del soporte de mlx-lm | no disponible | safetensors MLX | no disponible | No verificadas en la informacion proporcionada |

## Limitaciones y advertencias

- Repositorio sin validación comunitaria: 0 descargas y 0 likes en el momento de la consulta, publicado el 2026-09-22. No hay evidencia externa de funcionamiento más allá de las pruebas del autor.
- Ausencia de benchmarks estándar: no hay MMLU, HumanEval, GSM8K ni métricas de degradación por cuantización. La única medida objetiva publicada es la paridad numérica frente a `transformers` (~1e-6).
- Sin comparación GPTQ vs RTN: el autor reconoce explícitamente que no se ha ejecutado una comparación visual ni cuantitativa frente a un redondeo al más cercano, por lo que no puede cuantificarse la ganancia real de GPTQ en este modelo.
- Dependencia de un fork no oficial: el soporte de visión y audio requiere `ipsupport-llc/mlx-lm`; con el `mlx-lm` estándar los pesos multimodales se descartan silenciosamente. `mlx_lm.generate()` no tiene plomería para imágenes, por lo que hay que escribir un bucle manual con caché.
- Restricción de plataforma: MLX solo funciona en Apple Silicon. No hay ruta oficial a CUDA, GGUF, Ollama o vLLM, lo que limita su uso en producción sobre servidores con GPU.
- Idiomas soportados no documentados: no puede confirmarse el comportamiento multilingüe ni la cobertura de idiomas distintos del inglés en las validaciones publicadas.
- Longitud de contexto desconocida: no se indica la ventana de contexto del modelo base ni si la cuantización la altera, lo que impide dimensionar despliegues con entradas largas.
- Riesgo de alucinación: no se han publicado evaluaciones de fidelidad, tasas de alucinación ni comportamiento ante entradas fuera de distribución; las validaciones se limitan a una imagen y un clip de audio.
- Licencia: Apache 2.0 permite uso comercial, pero conviene verificar en la model card de Google las condiciones aplicables al modelo base y a los datos de entrenamiento, no cubiertas en esta ficha.
- Idoneidad para producción no acreditada: no hay datos de latencia, throughput, estabilidad bajo carga ni pruebas de concurrencia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/roman220220/gemma-4-E4B-it-gptq-mlx-8bit
- Modelo base: https://huggingface.co/google/gemma-4-E4B-it
- Codigo de inferencia MLX (gemma4.py, gemma4_vision.py, gemma4_audio.py): https://github.com/ipsupport-llc/mlx-lm
- Pipeline de cuantizacion: https://github.com/rromenskyi/quant-ternary/tree/main/gemma4-quant
- LLMTray: https://github.com/ipsupport-llc/llmtray
- No se han encontrado papers, blogs ni demos adicionales en los resultados de la busqueda web proporcionados (los resultados devueltos no guardan relacion con el modelo).
