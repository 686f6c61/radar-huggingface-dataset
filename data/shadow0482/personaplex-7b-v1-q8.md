# Shadow0482/personaplex-7b-v1-q8

## Resumen

PersonaPlex-7B-v1 Q8 es una cuantización int8 del modelo `nvidia/personaplex-7b-v1`, un modelo de voz a voz (speech-to-speech) con arquitectura Moshi desarrollado originalmente por NVIDIA. La versión aquí descrita la publica el usuario Shadow0482 en Hugging Face y su objetivo es reducir el peso en disco y en memoria del modelo original manteniendo la mayor parte de la calidad. El modelo base resuelve el problema de la conversación hablada en tiempo real y en duplex completo (full-duplex): escucha y habla simultáneamente, algo que los pipelines clásicos de ASR + LLM + TTS no permiten de forma natural.

La relevancia de esta variante es práctica: el LM original en BF16 ocupa aproximadamente 16,74 GB, mientras que el fichero cuantizado `model-q8.safetensors` ocupa unos 8,87 GB. Esto facilita el almacenamiento y la descarga, aunque la inferencia en 8 bits reales en GPU requiere un runtime que sustituya las capas `nn.Linear` por capas lineales cuantizadas; de lo contrario, hay que expandir los pesos a FP16 antes de ejecutar el código estándar de PersonaPlex.

La ficha se basa únicamente en la información publicada en el repositorio de Hugging Face. No se dispone de datos de benchmarks de voz, de la composición del dataset de entrenamiento ni de la lista de idiomas soportados, por lo que esos apartados se marcan como no disponibles.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Moshi (modelo de voz a voz full-duplex), según la model card |
| Parámetros totales | 7B (según el nombre del modelo; no se detalla el desglose) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | int8 simétrico weight-only con una escala por fila de salida (Q8); el script también menciona Q4 con nibbles sin signo y una escala por grupo de 64 columnas de entrada |
| Idiomas soportados | no disponible |
| Licencia | NVIDIA Open Model License (license: other) |
| Formato de pesos | safetensors (`model-q8.safetensors`), con tensores `<key>.qscale` en FP16 para las escalas |

## Arquitectura y entrenamiento

El modelo base es un modelo de voz a voz construido sobre la arquitectura Moshi, que combina un modelo de lenguaje con un códec de audio (Mimi) para procesar flujos de audio de entrada y salida de forma simultánea. La cuantización aquí publicada afecta a 348 matrices de pesos lineales, que se almacenan como int8 simétrico con una escala por fila de salida. Los embeddings, las normas, las cabezas de salida y otros tensores pequeños (127 tensores en total) se mantienen en FP16. El error relativo medio reportado en los tensores cuantizados es de 8,61e-05 y el máximo de 4,31e-04; no había tensores con desbordamiento FP16 en el origen.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, el uso de RLHF/DPO ni otras innovaciones de entrenamiento del modelo original en la información proporcionada. La model card tampoco documenta detalles del proceso de cuantización más allá de los parámetros indicados (bits, group_size en metadatos, escalas por fila).

## Capacidades

- Conversión de voz a voz en tiempo real con arquitectura full-duplex: el modelo puede escuchar y generar audio de forma simultánea, según la descripción del modelo base.
- Interacción conversacional hablada de múltiples turnos, propia de un modelo speech-to-speech.
- Integración con el códec Mimi y el ecosistema Moshi para el procesamiento de audio.
- Soporte de prompts de voz: el repositorio incluye `voices.tgz` con prompts de voz copiados del repositorio base.
- Interfaz web incluida: el repositorio incorpora `dist.tgz` con la UI web del proyecto original.
- Tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible; no se especifican idiomas.
- Modo thinking, visión o audio de entrada adicional: no disponible más allá del audio-to-audio.

## Casos de uso

- Asistentes de voz conversacionales en tiempo real: el modelo puede mantener un diálogo hablado full-duplex, lo que encaja en interfaces de atención al cliente o asistentes domésticos donde la latencia y la naturalidad de la interacción son críticas.
- Pruebas de concepto en entornos con recursos limitados: al ocupar el fichero cuantizado unos 8,87 GB frente a los 16,74 GB del BF16, permite almacenar y distribuir el modelo en máquinas con menos disco, útil para prototipos y demos.
- Investigación en interacción hablada: sirve para experimentar con modelos full-duplex y comparar el efecto de la cuantización int8 en la calidad del audio generado, ya que el autor advierte que no se han evaluado benchmarks de voz.
- Sistemas de voz embebidos o de borde con presupuesto de memoria ajustado: la reducción de tamaño facilita el despliegue en equipos donde el modelo original no cabría, siempre que se disponga de un runtime de cuantización o se expandan los pesos a FP16.
- Desarrollo de interfaces web de voz: el repositorio incluye la UI web del proyecto original, lo que permite montar una demo de conversación hablada sin reescribir la capa de interfaz.
- Evaluación comparativa de cuantizaciones: el script `personaplex_quant.py` y el formato documentado (Q8 y Q4) permiten reproducir el proceso y medir la degradación de calidad entre precisiones.
- Clonación o selección de voces en prototipos: los prompts de voz incluidos en `voices.tgz` permiten probar distintas voces en la demo sin entrenar desde cero.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que el modelo no ha sido evaluado en benchmarks de voz y recomienda escuchar las salidas antes de confiar en él. Los únicos datos numéricos publicados son los errores de cuantización: error relativo medio de 8,61e-05 y máximo de 4,31e-04 en los 348 tensores cuantizados.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia de tamaño, el fichero cuantizado pesa unos 8,87 GB y el LM original en BF16 unos 16,74 GB; a ello hay que sumar el códec Mimi, el tokenizer y los buffers de inferencia.
- GPU recomendadas: no disponible en la información proporcionada. Por tamaño, el modelo cuantizado podría caber en GPUs de consumo con 12-16 GB o más si se usa un runtime de cuantización real; el modelo en BF16 requiere GPUs de mayor capacidad.
- ¿Cabe en GPU de consumo? No confirmado. El fichero de 8,87 GB sugiere que sí en tarjetas con suficiente VRAM, pero la model card no lo garantiza y el uso en 8 bits en memoria exige un runtime que sustituya `nn.Linear`.
- Opciones de despliegue: el código estándar es `python -m moshi.server` con pesos expandidos a FP16 mediante `personaplex_quant.py`. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de rendimiento ni de especificaciones completas de alternativas en la información proporcionada, por lo que la comparación se limita a datos objetivos de tamaño y licencia.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| PersonaPlex-7B-v1 Q8 (este) | 7B | no disponible | NVIDIA Open Model License | Hugging Face, repo de 18,1 GB |
| nvidia/personaplex-7b-v1 (base) | 7B | no disponible | NVIDIA Open Model License | Hugging Face |
| Alternativas speech-to-speech | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- No evaluado en benchmarks de voz: el autor recomienda escuchar las salidas antes de confiar en el modelo para producción.
- La cuantización Q4 pierde notablemente más calidad que Q8, según advierte la model card.
- Los ficheros reducen tamaño de descarga y almacenamiento, pero mantener los pesos en 8 o 4 bits en memoria de GPU requiere un runtime específico que reemplace las capas lineales; con el código estándar hay que expandir a FP16 y se pierde la ventaja de memoria.
- Licencia NVIDIA Open Model License: es necesario revisar sus términos antes de un uso comercial, ya que no es una licencia permisiva tipo Apache 2.0.
- Idiomas soportados no documentados: no se puede garantizar cobertura multilingüe.
- Riesgo de alucinación y sesgos: no documentado en la información proporcionada; se desconoce la composición del dataset de entrenamiento.
- El repositorio tiene 0 descargas y 1 like en el momento de la consulta, lo que indica que es una publicación reciente y poco validada por la comunidad.
- El repositorio incluye ficheros auxiliares (`bias.md`, `privacy.md`, `safety.md`, `explainability.md`) que conviene revisar para conocer las advertencias del autor original.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Shadow0482/personaplex-7b-v1-q8
- Modelo base: https://huggingface.co/nvidia/personaplex-7b-v1
- Repositorio de código PersonaPlex: https://github.com/NVIDIA/personaplex
- Licencia NVIDIA Open Model License: https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-open-model-license/
