# laion/chatterbox-s3gen-vc-grow-ce-speaker

## Resumen

laion/chatterbox-s3gen-vc-grow-ce-speaker es un adaptador de conversión de voz (audio-to-audio) en fase de investigación, desarrollado por LAION. No es un modelo TTS independiente: modifica el decodificador acústico S3Gen de Chatterbox (ResembleAI) y mantiene congelados el tokenizador semántico S3, el encoder de hablante CAMPPlus y el vocoder HiFT. Se distribuye como adaptador LoRA de rango 128 sobre 224 proyecciones de atención q/k/v/out, junto con un proyector de condicionamiento de 99 puntuaciones previamente entrenado.

El adaptador continúa el entrenamiento del adaptador v1 `continue` de rango 128 en el paso 4.000, añadiendo una recompensa explícita de hablante objetivo. El objetivo es mejorar la conversión de voz preservando contenido y emoción de la fuente y transfiriendo la identidad de una referencia de 5-10 segundos. Es relevante porque documenta un pipeline de aprendizaje por refuerzo con modelos de recompensa de audio (Humaneness Ears Medium) aplicado a un decodificador acústico, con pesos y checkpoints publicados de forma verificable.

Requiere descargar aparte el modelo base upstream y el adaptador padre supervisado; el repositorio no contiene los pesos base ni el audio de entrenamiento. La licencia de los pesos de LAION es CC BY 4.0, mientras que el upstream Chatterbox mantiene MIT. El tamaño del repositorio es de 0,5 GB. No se dispone de número de parámetros totales, longitud de contexto ni idiomas soportados en la información proporcionada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA de rango 128 sobre 224 proyecciones de atención q/k/v/out del decodificador acústico S3Gen de Chatterbox; tokenizador semántico S3, encoder de hablante CAMPPlus y vocoder HiFT congelados; proyector de condicionamiento de 99 puntuaciones |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (modelo audio-a-audio; no se declara ventana de contexto en tokens) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | CC BY 4.0 para los pesos, código y documentación de LAION; el modelo base ResembleAI/chatterbox mantiene su licencia MIT |
| Formato de pesos | safetensors (adaptador supervisado `base_300h_adapter.safetensors`) y `.pt` con estado del optimizador y RNG (checkpoints de continuación) |
| Tipo de modelo | adaptador de conversión de voz audio-to-audio |
| Pipeline | audio-to-audio |
| Modelo base | ResembleAI/chatterbox |
| Adaptador padre | laion/chatterbox-s3gen-vc-grow (release supervisada/v1 RL de 300 horas) |
| Modelo de recompensa | laion/humaneness-ears-base-medium, revisión `818506970d93c809a3295a0a02c40dee8ff2bfc3` |
| Hardware de entrenamiento | 4 GPU NVIDIA GH200, con 4 candidatos por GPU y gradientes sincronizados |
| Tamaño del repositorio | 0,5 GB |
| Descargas / likes | 0 descargas, 0 likes en HuggingFace en la fecha de consulta |

## Arquitectura y entrenamiento

La arquitectura es un adaptador LoRA de rango 128 insertado en 224 proyecciones de atención q/k/v/out del decodificador acústico S3Gen de Chatterbox. El resto del sistema permanece congelado: tokenizador semántico S3, encoder de hablante CAMPPlus y vocoder HiFT. Se reutiliza un proyector de condicionamiento de 99 puntuaciones ya entrenado, que aporta puntuaciones dinámicas de emoción y estilo. El adaptador se aplica sobre el adaptador supervisado padre, no sobre el modelo base directamente: primero se carga el adaptador base supervisado y después este adaptador de continuación.

El entrenamiento es una continuación por aprendizaje por refuerzo del adaptador v1 `continue` de rango 128 en el paso 4.000. La recompensa combina tres componentes con pesos fijos: 40% Content Enjoyment (salida `audiobox:CE` del modelo Humaneness Ears Medium), 40% MSE negativo de las dos emociones principales y 20% coseno de hablante objetivo según CAMPPlus. Para cada grupo de 16 candidatos, los componentes de recompensa se estandarizan por separado dentro del grupo, la ventaja ponderada se recorta a ±2,5 y se centra. Las dos dimensiones de emoción corresponden a las emociones más fuertes de la grabación fuente real, no a etiquetas fijas del prompt. Se usan 4.000 condiciones fuente/objetivo con 3.357 fuentes distintas y 477 clips de voz objetivo, recorridas seis veces con permutaciones y semillas de muestreo diferentes: 24.000 pasos de optimizador y 384.000 candidatos generados por brazo, aunque no 24.000 pares de entrada distintos. Cada paso es un grupo de 16 candidatos, repartidos en cuatro candidatos por GPU GH200 en un nodo de cuatro GPU. El optimizador es AdamW con 1.200 pasos de warm-up (5%), LR máximo de 2e-6, decaimiento coseno hasta 2e-7 y un ancla de política congelada de flujo de 0,025 respecto al modelo de partida v1 del paso 4.000. Los checkpoints con estado del optimizador se escriben cada 1.000 grupos y se publican en `checkpoints/`; `RL_CHECKPOINTS.json` contiene SHA-256, tamaño y paso verificados.

## Capacidades

- Conversión de voz audio-to-audio: transforma una fuente conservando los tokens semánticos S3 y las puntuaciones dinámicas de emoción/estilo, y transfiere la identidad de una referencia objetivo de 5-10 segundos.
- Control de emoción y estilo basado en la propia fuente: las dos dimensiones de emoción usadas en la recompensa proceden de la grabación fuente real, no de etiquetas fijas del prompt.
- Transferencia de identidad de hablante mediante el vector CAMPPlus de la referencia objetivo y rasgos estáticos de voz.
- Inferencia sobre filas Parquet preparadas: requiere una fila fuente con tokens semánticos S3 y puntuaciones de emoción/estilo, y una fila de referencia objetivo con prefijo acústico, vector de identidad CAMPPlus y rasgos estáticos.
- No es un modelo TTS independiente ni genera voz desde texto.
- No se documentan soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio de entrada general ni capacidades multilingües.
- El repositorio se etiqueta como `work-in-progress` y `research-stage`, orientado a investigación y no a producción.

## Casos de uso

- Investigación en conversión de voz con RL: permite estudiar cómo una recompensa compuesta por Content Enjoyment, MSE emocional y similitud de hablante CAMPPlus afecta al decodificador acústico S3Gen en un entorno controlado con pares fuente/objetivo preparados.
- Evaluación de modelos de recompensa de audio: al usar Humaneness Ears Medium como recompensa congelada, el adaptador sirve para analizar explotación de recompensa, sobreajuste y correlación entre puntuaciones automáticas y percepción humana.
- Prototipado de doblaje y adaptación de estilo con derechos: en un flujo de investigación, se puede transformar una grabación fuente hacia una voz objetivo autorizada de 5-10 segundos, conservando contenido y emoción de la fuente.
- Generación de datos sintéticos supervisados: los pares fuente/objetivo preparados y los checkpoints publicados permiten generar candidatos de voz para experimentos de aumento de datos, siempre que se respeten los derechos de las voces y los audios.
- Análisis de similitud de hablante: la componente de coseno CAMPPlus permite comparar proxies automáticos de identidad de hablante entre adaptadores y pasos de entrenamiento, sin afirmar fidelidad percibida por humanos.
- Estudio de ablación de pesos de recompensa: la combinación 40/40/20 y el recorte de ventaja a ±2,5 pueden replicarse o modificarse en nuevas ejecuciones para medir el efecto de cada término.
- Reproducibilidad de RL a escala de grupo: el esquema de 16 candidatos por paso, cuatro por GPU GH200 y sincronización de gradientes sirve como referencia para experimentos de RL con generación masiva en audio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni equivalentes de audio, y advierte explícitamente que las recompensas son puntuaciones predichas por modelos, no valoraciones humanas, y que hace falta un estudio de escucha con semillas emparejadas, precisión de contenido, similitud de hablante y naturalidad independiente antes de seleccionar un adaptador por defecto.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. No se publica el número de parámetros del adaptador ni del decodificador acústico S3Gen, y la model card no indica requisitos de VRAM.
- GPU de entrenamiento documentadas: 4 GPU NVIDIA GH200, con 4 candidatos por GPU y gradientes sincronizados.
- GPU recomendadas para inferencia: no disponibles.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: el repositorio solo documenta un script de inferencia en PyTorch sobre filas Parquet preparadas (`code/grow_followup/infer_followup.py`); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.
- Almacenamiento: el repositorio ocupa 0,5 GB, pero se deben descargar aparte los pesos upstream de Chatterbox y el adaptador padre supervisado.
- Nota de seguridad: los checkpoints `.pt` incluyen estado del optimizador y RNG y usan pickle de Python; el código de inferencia emplea el cargador restringido `weights_only=True`, pero exige procedencia verificada y solo deben cargarse archivos de confianza.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|---|
| laion/chatterbox-s3gen-vc-grow-ce-speaker | Adaptador LoRA de conversión de voz sobre S3Gen, con recompensa de hablante objetivo | no disponible | no disponible | CC BY 4.0 (pesos LAION); upstream MIT | HuggingFace, 0 descargas, 0 likes | Continuación RL del adaptador v1 en el paso 4.000; requiere adaptador padre y upstream |
| laion/chatterbox-s3gen-vc-grow | Adaptador padre supervisado/v1 RL de 300 horas | no disponible | no disponible | CC BY 4.0 (según la model card del adaptador derivado) | HuggingFace | Proporciona `checkpoints/base_300h_adapter.safetensors`; es el punto de partida obligatorio |
| ResembleAI/chatterbox | Modelo base TTS y decodificador S3Gen | no disponible | no disponible | MIT | HuggingFace, revisión fijada `5bb1f6ee58e50c3b8d408bc82a6d3740c2db6e18` | Aporta los pesos S3Gen y los componentes congelados; no incluye la conversión de voz |

No se dispone de información sobre otros modelos comparables de conversión de voz en la documentación proporcionada.

## Limitaciones y advertencias

- Las recompensas son puntuaciones predichas por modelos, no valoraciones humanas; mejorar la recompensa no implica necesariamente mejor conversión de voz.
- El recorrido repetido de 4.000 pares puede provocar sobreajuste y los modelos de recompensa pueden ser explotados.
- El coseno de hablante es un proxy CAMPPlus y no puede establecer fidelidad de identidad percibida por personas.
- Se requiere un estudio de escucha con conjunto retenido, semillas emparejadas, precisión de contenido, similitud de hablante y métricas de naturalidad independientes antes de elegir un adaptador por defecto.
- Las fuentes seleccionadas son disjuntas por UID respecto al holdout anterior, pero no se garantiza que sean disjuntas por hablante.
- No es un modelo independiente: hay que cargar primero el adaptador base supervisado y después este adaptador de continuación; el checkpoint no es un modelo base fusionado.
- La inferencia no es un pipeline de un solo comando para WAV arbitrario: funciona con filas Parquet preparadas y requiere el orden de puntuaciones y la preparación documentados en `TRAINING.md`.
- Los checkpoints `.pt` usan pickle e incluyen estado del optimizador y RNG; solo deben cargarse archivos de confianza y con procedencia verificada.
- Licencia: los pesos, código y documentación de LAION son CC BY 4.0; la dependencia upstream Chatterbox conserva su licencia MIT y su atribución. Solo deben usarse voces y audios sobre los que se tengan derechos.
- Estado de investigación: el modelo está etiquetado como `work-in-progress`, con 0 descargas y 0 likes en HuggingFace en la fecha de consulta, y no se documentan usos en producción.
- No se dispone de datos sobre sesgos, idiomas soportados, cuantizaciones, latencia o throughput.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/laion/chatterbox-s3gen-vc-grow-ce-speaker
- Modelo base upstream: https://huggingface.co/ResembleAI/chatterbox
- Revisión fijada del upstream: https://huggingface.co/ResembleAI/chatterbox/tree/5bb1f6ee58e50c3b8d408bc82a6d3740c2db6e18
- Adaptador padre v1: https://huggingface.co/laion/chatterbox-s3gen-vc-grow
- Modelo de recompensa Humaneness Ears Medium: https://huggingface.co/laion/humaneness-ears-base-medium
- Revisión fijada del modelo de recompensa: https://huggingface.co/laion/humaneness-ears-base-medium/tree/818506970d93c809a3295a0a02c40dee8ff2bfc3
- Documentación de entrenamiento: https://huggingface.co/laion/chatterbox-s3gen-vc-grow-ce-speaker/blob/main/TRAINING.md
- Registro de checkpoints RL: https://huggingface.co/laion/chatterbox-s3gen-vc-grow-ce-speaker/blob/main/RL_CHECKPOINTS.json
- Carpeta de checkpoints: https://huggingface.co/laion/chatterbox-s3gen-vc-grow-ce-speaker/tree/main/checkpoints
- Script de inferencia: https://huggingface.co/laion/chatterbox-s3gen-vc-grow-ce-speaker/blob/main/code/grow_followup/infer_followup.py
