# palli23/whisper-tiny-samromur-5h

## Resumen

whisper-tiny-samromur-5h es un ajuste fino del modelo Whisper Tiny (39 M de parámetros) sobre un subconjunto anidado de 5 horas del corpus islandés Miljón/samromur-500h. Lo publica el usuario palli23 en HuggingFace y su propósito es servir como punto de control dentro de un estudio de escalado de modelos ASR pequeños frente a modelos multilingües grandes, recogido en el artículo "Scaling Smaller ASR Models Against Multilingual ASR Giants" (ICASSP 2027).

El modelo mantiene la arquitectura original de Whisper Tiny (transformer encoder-decoder, ~37,8 M de parámetros, ventanas de audio de 30 segundos) y está especializado exclusivamente en islandés, con licencia CC BY-SA 4.0. No se trata de un modelo de propósito general: es un artefacto de investigación pensado para medir cómo escala el rendimiento ASR al aumentar las horas de entrenamiento sobre una misma receta.

Su relevancia es acotada pero clara: permite reproducir experimentos de escalado en islandés con un coste computacional mínimo (el repositorio ocupa 0,2 GB y el modelo se ejecuta en CPU) y sirve como referencia para comparar ajustes finos de Whisper en lenguas de bajos recursos. La model card es muy escueta: no publica hiperparámetros, WER/CER ni detalles del proceso de ajuste.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper Tiny), entrada de mel-espectrograma |
| Parámetros totales | 37.760.640 (≈37,8 M) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | Ventanas de audio de 30 s (1.500 frames de mel-espectrograma); no disponible en la model card |
| Tipos de cuantización | No disponibles; pesos publicados en safetensors (el tamaño del repo, 0,2 GB, es consistente con fp32) |
| Idiomas soportados | Islandés (is) únicamente |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | safetensors |
| Tarea principal | Reconocimiento automático del habla (ASR) en islandés |
| Dataset de ajuste | Subconjunto anidado de 5 h de Miljón/samromur-500h |
| Tamaño del repositorio | 0,2 GB |
| Descargas / likes | 24 / 0 |

## Arquitectura y entrenamiento

La arquitectura es la de Whisper Tiny sin modificaciones: un transformer encoder-decoder con atención estándar, que procesa audio convertido a mel-espectrograma en ventanas de 30 segundos. El recuento de parámetros publicado en safetensors (37.760.640) coincide exactamente con el checkpoint whisper-tiny de OpenAI, lo que confirma que la fine-tuning no alteró la topología ni las dimensiones del modelo. La model card no detalla hiperparámetros, régimen de congelación de capas ni estrategia de aumento de datos.

El entrenamiento consistió en un ajuste fino supervisado sobre un subconjunto anidado de 5 horas extraído del pool de escalado samromur-500h. El término "nested subset" indica que las 5 horas forman parte de una jerarquía de subconjuntos crecientes, típica de los estudios de escalado: el mismo material se reutiliza en checkpoints con más horas para aislar el efecto del volumen de datos. Al ser un modelo ASR, no hay RLHF ni DPO; el objetivo es la entropía cruzada token a token sobre transcripciones. No se documenta ninguna innovación técnica adicional (decodificación especulativa, atención lineal, destilación) en la información disponible.

## Capacidades

- Transcripción de voz a texto en islandés, con audio de hasta 30 segundos por ventana.
- Procesamiento de audio de larga duración mediante segmentación en fragmentos de 30 s (segmentación no incluida en el modelo).
- Salida con marcas de tiempo a nivel de segmento, heredadas del formato de decodificación de Whisper (no confirmado explícitamente en la model card).
- Generación de texto derivada del decodificador de Whisper, condicionada a la transcripción.
- Capacidades multilingües: no. El tag de idioma es únicamente `is`; se desconoce el estado de las cabezas de traducción del checkpoint original tras el ajuste.
- Tool calling / function calling: no soportado.
- Uso como agente o razonamiento multi-paso: no soportado.
- Visión, audio generativo o modo "thinking": no soportado.
- Capacidad especial: ninguna documentada.

## Casos de uso

- Investigación en escalado de ASR: el modelo es uno de los puntos de control de un estudio de escalado, por lo que su uso natural es reproducir curvas WER/horas de entrenamiento en islandés y compararlas con modelos multilingües grandes.
- Transcripción de audio islandés en prototipos: con 0,2 GB de repositorio y ejecución viable en CPU, permite validar una pipeline de voz a texto en islandés antes de invertir en un modelo mayor.
- Pre-anotación de corpus para anotación activa: generar transcripciones iniciales de grabaciones islandesas y revisarlas manualmente, reduciendo el coste de anotación si la calidad del ajuste resulta suficiente (no verificada).
- Subtitulado automático de vídeo en islandés: segmentando el audio en ventanas de 30 s y reconstruyendo las marcas de tiempo de Whisper para generar subtítulos.
- Dictado y toma de notas en aplicaciones de escritorio o móviles sin conexión: el tamaño del modelo permite empaquetarlo en aplicaciones locales mediante whisper.cpp o CTranslate2 sin depender de servicios en la nube.
- Evaluación comparativa de licencias: sirve como ejemplo práctico de modelo con licencia CC BY-SA 4.0 para equipos que necesitan estudiar las implicaciones del share-alike en productos derivados.
- Despliegue en hardware embebido o edge: Raspberry Pi, Jetson Nano o teléfonos de gama media pueden ejecutar la variante cuantizada a int8 para transcripción de comandos cortos en islandés.
- Docencia y experimentación académica: coste de ajuste y de inferencia muy bajo, útil para prácticas sobre fine-tuning de Whisper en lenguas de bajos recursos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card remite al artículo "Scaling Smaller ASR Models Against Multilingual ASR Giants" (ICASSP 2027) para la metodología y los resultados de WER/CER, pero no incluye cifras ni enlace al texto completo.

## Requisitos de hardware

- Pesos en fp32: aproximadamente 151 MB (37,76 M parámetros × 4 bytes). El repositorio completo ocupa 0,2 GB.
- VRAM estimada en fp16: alrededor de 76 MB de pesos más activaciones y caché; en la práctica, menos de 1 GB en total.
- VRAM estimada en int8: alrededor de 38 MB de pesos; ejecutable en cualquier GPU con 2 GB o más.
- GPU recomendadas: cualquier GPU moderna con al menos 2 GB de VRAM (GTX 1050 Ti, RTX 2060, RTX 4090, T4, A100, H100). El modelo está muy por debajo de la capacidad de estas tarjetas, por lo que el cuello de botella será el preprocesado de audio, no la GPU.
- Cabe holgadamente en GPU de consumo e incluso en CPU: es viable en Raspberry Pi 4/5, Jetson Nano o móviles mediante whisper.cpp con cuantización int8.
- Opciones de despliegue: transformers (PyTorch), faster-whisper / CTranslate2, whisper.cpp (requiere conversión a GGUF), ONNX Runtime, y en menor medida vLLM o TGI, cuyo sobredimensionamiento no aporta ventajas a esta escala.
- Latencia y throughput: no disponibles. No se han publicado mediciones de RTF ni de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parámetros | Ventana de audio | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| whisper-tiny-samromur-5h | 37,8 M | 30 s | Islandés | CC BY-SA 4.0 | HuggingFace (palli23) |
| Whisper Tiny (OpenAI) | 37,8 M | 30 s | Multilingüe (~99 idiomas) | MIT | HuggingFace (openai/whisper-tiny) |
| Whisper Small (OpenAI) | 244 M | 30 s | Multilingüe (~99 idiomas) | MIT | HuggingFace (openai/whisper-small) |

La comparación con Whisper Tiny es la más directa: misma arquitectura y mismo recuento de parámetros, pero el modelo de palli23 está especializado en islandés con solo 5 horas de ajuste, mientras que el original es multilingüe y genérico. Frente a Whisper Small, el modelo aquí descrito es unas 6,5 veces más pequeño, lo que se traduce en mayor velocidad y menor huella de memoria a costa de capacidad de modelado. No se dispone de datos de WER para ninguno de los tres en islandés dentro de la información proporcionada, por lo que no es posible establecer una comparación de rendimiento.

## Limitaciones y advertencias

- Cobertura lingüística restringida: solo islandés. El uso con otros idiomas producirá salidas incorrectas o alucinadas.
- Volumen de entrenamiento muy bajo: 5 horas de audio es un conjunto de ajuste pequeño; es previsible un WER alto en dominios, acentos o condiciones acústicas no representados en samromur.
- Ausencia de evaluación publicada: no hay WER, CER ni comparación con líneas base en la model card, por lo que no se puede recomendar su uso en producción sin una evaluación propia.
- Adopción mínima: 24 descargas y 0 likes indican que el modelo no ha sido validado por la comunidad.
- Alucinación en audio: los modelos Whisper tienden a generar texto plausible cuando la entrada contiene silencio, ruido o habla solapada; este comportamiento no se ha caracterizado en este checkpoint.
- Procesamiento de audio largo: el modelo trabaja en ventanas de 30 s; la gestión de audio continuo requiere segmentación y ensamblado externos, con riesgo de errores en las fronteras.
- Licencia CC BY-SA 4.0: permite uso comercial, pero exige atribución y obliga a distribuir las obras derivadas (incluidos modelos ajustados a partir de este) bajo la misma licencia. Conviene revisar la compatibilidad con la política de licencias del producto antes de integrarlo.
- Documentación insuficiente: se desconocen hiperparámetros, composición exacta del subconjunto, estrategia de tokenización del islandés y si se conservaron las cabezas de traducción del modelo original.
- Metadatos: la model card no declara pipeline ni dataset completo, y las fechas de creación (2026-06-03) y actualización (2026-09-17) sugieren posibles revisiones posteriores.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/palli23/whisper-tiny-samromur-5h
- Dataset de referencia citado en la model card: Miljón/samromur-500h (identificador mencionado sin URL)
- Artículo citado: "Scaling Smaller ASR Models Against Multilingual ASR Giants" (ICASSP 2027), sin enlace disponible en la información proporcionada
- No se han encontrado enlaces adicionales. Los resultados de la búsqueda web devueltos corresponden a la aplicación de navegación AlpineQuest y a un proyecto alpino homónimo, sin relación alguna con el modelo.
