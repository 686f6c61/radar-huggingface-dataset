# laion/chatterbox-s3gen-vc-grow-ce-continue

## Resumen

Chatterbox S3Gen VC · Continued es un adaptador de conversión de voz (voice conversion, VC) en fase de investigación, publicado por LAION bajo el identificador `laion/chatterbox-s3gen-vc-grow-ce-continue`. No es un modelo TTS autónomo: modifica únicamente el decodificador acústico S3Gen de Chatterbox mediante un LoRA de rango 128 aplicado sobre 224 proyecciones de atención q/k/v/out, manteniendo congelados el tokenizador semántico S3, el codificador de hablante CAMPPlus y el vocoder HiFT del modelo base `ResembleAI/chatterbox`.

El adaptador se entrena con aprendizaje por refuerzo (RL) sobre recompensas predichas por un modelo de valoración estética de audio, el `laion/humaneness-ears-base-medium` congelado. La señal de recompensa combina al 50% Content Enjoyment (`audiobox:CE`) y al 50% el MSE negativo de las dos emociones dominantes, medidas sobre la grabación fuente real y no sobre etiquetas fijas del prompt. El repositorio continúa, sin fusionarlo, un adaptador previo de rango 128 ya completado en el paso 4.000 (publicado como `laion/chatterbox-s3gen-vc-grow`).

Es relevante porque documenta de forma inusualmente transparente un pipeline de RL sobre un decodificador acústico con condiciones de audio preparadas, checkpoints verificados con SHA-256 y límites metodológicos explícitos. El repositorio pesa 0,5 GB, tiene 0 descargas y 0 likes en el momento de la consulta, y se distribuye bajo licencia CC BY 4.0, mientras que la dependencia upstream Chatterbox conserva su licencia MIT.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (rango 128) sobre las proyecciones de atención q/k/v/out del decodificador acústico S3Gen de Chatterbox, con proyector de condicionamiento de 99 scores previamente entrenado |
| Parametros totales | no disponible (repositorio de 0,5 GB; no incluye los pesos base) |
| Parametros activos | no aplicable (no es un modelo MoE) |
| Longitud de contexto | no aplicable (modelo de audio; la inferencia opera sobre filas Parquet preparadas con tokens semánticos S3 y referencias de 5-10 segundos) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | cc-by-4.0 para los pesos del adaptador, código y documentación de LAION; el upstream Chatterbox conserva su licencia MIT |
| Formato de pesos | safetensors (pesos base y adaptador supervisado) y checkpoints `.pt` con estado del optimizador y RNG serializados con pickle |

## Arquitectura y entrenamiento

El adaptador actúa exclusivamente sobre el decodificador acústico S3Gen de Chatterbox. El resto de la pila permanece congelada: el tokenizador semántico S3, el codificador de hablante CAMPPlus y el vocoder HiFT. El LoRA tiene rango 128 y se aplica sobre 224 proyecciones de atención (q, k, v y out), y se acompaña de un proyector de condicionamiento de 99 scores ya entrenado en la fase anterior. No es un modelo autónomo: requiere descargar por separado el S3Gen upstream fijado a la revisión `5bb1f6ee58e50c3b8d408bc82a6d3740c2db6e18` y el adaptador padre supervisado de 300 horas.

El entrenamiento continúa el adaptador `continue` de rango 128 completado en el paso 4.000 sin fusionarlo en la base. El conjunto de condiciones contiene 4.000 pares fuente/objetivo (3.357 fuentes distintas y 477 clips de voz objetivo), recorridos seis veces con permutaciones y semillas de muestreo distintas, lo que da 24.000 pasos de optimizador y 384.000 candidatos generados por brazo, pero no 24.000 pares de entrada distintos. Cada paso procesa un grupo de 16 candidatos, repartidos cuatro por GPU en un nodo de cuatro GH200 con gradientes sincronizados. El esquema AdamW usa 1.200 pasos de warm-up (5%), un LR máximo de 2e-6, decaimiento coseno hasta 2e-7 y un anclaje de flujo de política congelada de 0,025 respecto al modelo de partida. La recompensa se estandariza por componente dentro de cada grupo de 16 candidatos, la ventaja ponderada se recorta a ±2,5 y se centra, y el peso final es 50% Content Enjoyment (`audiobox:CE` del modelo Humaneness Ears Medium) y 50% MSE negativo de las dos emociones más fuertes detectadas en la fuente. Los checkpoints con estado del optimizador se escriben cada 1.000 grupos y se publican en `checkpoints/`, con verificación SHA-256 en `RL_CHECKPOINTS.json`.

## Capacidades

- Conversión de voz audio-a-audio: transforma la identidad acústica de una fuente hacia una voz objetivo manteniendo el contenido lingüístico codificado en los tokens semánticos S3.
- Condicionamiento por emoción y estilo dinámicos: la fila fuente aporta scores de emoción y estilo que modulan la generación.
- Transferencia de identidad de hablante mediante el vector CAMPPlus extraído de una referencia objetivo de 5-10 segundos, junto con sus rasgos de voz estáticos.
- Optimización mediante RL sobre recompensas estéticas (Content Enjoyment) y emocionales predichas por un modelo de valoración externo congelado.
- Reanudación de entrenamiento: los checkpoints `.pt` incluyen estado del optimizador y RNG, lo que permite continuar el pipeline desde el paso registrado.
- No dispone de tool calling, function calling, capacidades de agente, razonamiento multi-paso, visión ni audio generativo de texto a voz autónomo. El pipeline es audio-a-audio.
- Idiomas soportados: no disponible (el contenido lingüístico depende del tokenizador S3 y de la fuente, pero no se documenta una lista de idiomas).

## Casos de uso

- Investigación en conversión de voz con RL: el adaptador sirve como sujeto de estudio para medir si optimizar recompensas estéticas predichas mejora o degrada la calidad percibida, siempre con un estudio de escucha emparejado por semilla.
- Evaluación de recompensas aprendidas: permite analizar cómo el modelo `humaneness-ears-base-medium` puntúa candidatos generados y hasta qué punto la política explota esos scores.
- Transferencia de identidad controlada por referencia: dado un clip objetivo de 5-10 segundos con derechos de uso, se generan variantes de una fuente con el timbre del objetivo para experimentos de clonación de voz.
- Estudio de robustez emoción-contenido: al condicionar sobre las dos emociones dominantes de la fuente, permite investigar la separación entre prosodia emocional y contenido semántico.
- Reproducibilidad de pipelines RL: el repositorio publica checkpoints cada 1.000 grupos con SHA-256, lo que facilita análisis de trayectorias de entrenamiento y comparación entre pasos.
- Prototipado de decodificadores acústicos: al mantener congelados el vocoder HiFT y el codificador CAMPPlus, es útil para aislar el efecto del decodificador S3Gen en la calidad final.
- Auditoría de sobreajuste: con 4.000 pares recorridos seis veces, es un caso práctico para estudiar sobreajuste y explotación de modelos de recompensa en datasets pequeños.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas objetivas (por ejemplo, precisión de contenido, similitud de hablante o naturalidad) ni comparaciones numéricas con otros sistemas. El autor indica explícitamente que la mejora en las recompensas predichas no implica una mejor conversión de voz y que se requiere un estudio de escucha con semillas emparejadas antes de elegir un adaptador por defecto.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Depende del S3Gen upstream, del adaptador de 300 horas y del adaptador de continuación, además del vocoder HiFT y del codificador CAMPPlus.
- GPU de entrenamiento documentadas: nodo de cuatro GH200, con cuatro candidatos por GPU por paso (16 candidatos por paso en total), gradientes sincronizados.
- GPU recomendadas para inferencia: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: el repositorio proporciona el script `code/grow_followup/infer_followup.py` con PyTorch y CUDA, cargando pesos mediante `weights_only=True`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que además no aplican a un pipeline de audio.
- Latencia y throughput: no disponibles. El autor advierte de que no existe un pipeline de conversión de voz de un solo comando sobre WAV arbitrario, sino que se requieren filas Parquet preparadas.
- La inferencia exige descargar por separado el S3Gen upstream y el adaptador padre, y cargar primero el adaptador base supervisado y después el de continuación.

## Comparativa con modelos similares

| Modelo | Tipo | Base | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| `laion/chatterbox-s3gen-vc-grow-ce-continue` | Adaptador LoRA rango 128 de continuación (RL) | `ResembleAI/chatterbox` | CC BY 4.0 (adaptador); MIT (upstream) | Repositorio de 0,5 GB, 0 descargas | No contiene pesos base; requiere adaptador padre |
| `laion/chatterbox-s3gen-vc-grow` | Adaptador LoRA rango 128 supervisado/RL v1 (300 horas) | `ResembleAI/chatterbox` | no disponible en la informacion proporcionada | Publicado como release padre | Es el punto de partida del paso 4.000 que aquí se continúa |
| `ResembleAI/chatterbox` | Modelo base de TTS/decodificador S3Gen | propio | MIT | Repositorio upstream fijado a la revisión `5bb1f6ee58e50c3b8d408bc82a6d3740c2db6e18` | Dependencia obligatoria; aporta S3Gen, tokenizador S3, CAMPPlus y HiFT |
| Otros modelos de conversión de voz | no disponible | no disponible | no disponible | no disponible | No se aportan datos comparables en la información proporcionada |

## Limitaciones y advertencias

- Es un adaptador en fase de investigación (`work-in-progress`), no un modelo listo para producción.
- No es un modelo TTS autónomo: modifica el decodificador S3Gen y requiere el upstream y el adaptador padre por separado.
- La inferencia no acepta WAV arbitrario: exige filas Parquet preparadas con tokens semánticos S3, scores de emoción/estilo y una referencia objetivo de 5-10 segundos.
- Las recompensas son puntuaciones predichas por un modelo, no valoraciones humanas; pueden ser explotadas por la política.
- El recorrido repetido de 4.000 pares seis veces puede provocar sobreajuste, y el propio autor advierte de que son 24.000 pasos sobre un conjunto limitado, no 24.000 pares distintos.
- La similitud de hablante, cuando se reporta, es un proxy basado en CAMPPlus y no establece fidelidad de identidad percibida por humanos.
- No hay evidencia de que mejorar la recompensa implique mejor conversión de voz; se requiere un estudio de escucha con contenido, similitud de hablante y naturalidad independientes.
- Las fuentes seleccionadas son disjuntas por UID respecto al holdout previo, pero no se garantiza que sean disjuntas por hablante.
- Los checkpoints `.pt` incluyen estado del optimizador y RNG y usan pickle: solo deben cargarse archivos de procedencia verificada.
- Idiomas soportados no documentados; el comportamiento multilingüe depende del tokenizador S3 y de la fuente.
- Licencia: los pesos, código y documentación de LAION son CC BY 4.0, pero el upstream Chatterbox retiene su licencia MIT y su atribución. Se debe usar únicamente voz y audio sobre los que se tengan derechos.
- No se documentan sesgos concretos ni tasas de alucinación; no disponible.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/laion/chatterbox-s3gen-vc-grow-ce-continue
- Modelo base upstream: https://huggingface.co/ResembleAI/chatterbox
- Release padre supervisado/RL v1 (300 horas): https://huggingface.co/laion/chatterbox-s3gen-vc-grow
- Modelo de recompensa Humaneness Ears Medium: https://huggingface.co/laion/humaneness-ears-base-medium
- Revisión fijada del modelo de recompensa: `818506970d93c809a3295a0a02c40dee8ff2bfc3`
- Revisión fijada del S3Gen upstream: `5bb1f6ee58e50c3b8d408bc82a6d3740c2db6e18`
- Documentación de entrenamiento: `TRAINING.md` (en el repositorio)
- Registro de checkpoints verificados: `RL_CHECKPOINTS.json` (en el repositorio)
- Script de inferencia: `code/grow_followup/infer_followup.py` (en el repositorio)
- La búsqueda web no devolvió enlaces relevantes sobre este modelo; los resultados obtenidos trataban sobre la dinastía Capeta y no guardan relación con el contenido de esta ficha.
