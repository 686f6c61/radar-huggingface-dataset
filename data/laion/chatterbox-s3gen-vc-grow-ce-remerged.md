# laion/chatterbox-s3gen-vc-grow-ce-remerged

## Resumen

Chatterbox S3Gen VC · Re-merged es un adaptador de conversion de voz (voice conversion, VC) de tipo audio-a-audio desarrollado por LAION. No es un modelo TTS autonomo, sino un adaptador LoRA de rango 128 que modifica el decodificador acustico S3Gen del modelo base Chatterbox de ResembleAI, manteniendo congelados el tokenizador semantico S3, el codificador de hablante CAMPPlus y el vocoder HiFT. Su proposito es transformar la identidad y el estilo emocional de una locucion de origen hacia una voz objetivo, partiendo de filas Parquet ya preparadas (tokens S3 y puntuaciones dinamicas de emocion/estilo) y una referencia objetivo de 5 a 10 segundos.

Es un artefacto de investigacion en fase temprana ("work-in-progress"), no un pipeline listo para produccion. La relevancia radica en que documenta un entrenamiento con aprendizaje por refuerzo (RL) sobre la salida del decodificador acustico, usando como recompensa las predicciones del modelo Humaneness Ears Medium: un 50 % de Content Enjoyment (salida `audiobox:CE`) y un 50 % de MSE negativo de las dos emociones mas fuertes presentes en la grabacion de origen. El repositorio solo contiene los pesos del adaptador (0,5 GB); los pesos base y el audio de entrenamiento deben descargarse por separado.

El modelo se publica como un brazo de continuacion ("re-merged") del adaptador v1 `merged_new` paso 4.000, sobre el que se inicializa un LoRA nuevo de rango 128. No incluye pesos base ni datos de audio, y no existen metricas de escucha humana que respalden mejoras en fidelidad de voz.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (rango 128) sobre el decodificador acustico S3Gen de Chatterbox; tokenizador S3, codificador CAMPPlus y vocoder HiFT congelados |
| Parametros totales | no disponible (rank 128 sobre 224 proyecciones q/k/v/out; tamano de repo 0,5 GB) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; pesos en safetensors (adaptador) y checkpoints `.pt` (PyTorch pickle con estado de optimizador y RNG) |
| Idiomas soportados | no disponible |
| Licencia | cc-by-4.0 (adaptador, codigo y documentacion de LAION); la dependencia upstream Chatterbox conserva licencia MIT aparte |
| Formato de pesos | safetensors (adaptador) y `.pt` (checkpoints de entrenamiento con optimizador) |

## Arquitectura y entrenamiento

El adaptador opera sobre el decodificador acustico S3Gen de Chatterbox. Introduce un LoRA de rango 128 aplicado a 224 proyecciones de atencion (q/k/v/out de las capas de atencion), junto con un proyector de condicionamiento previamente entrenado (el "99-score conditioning projector"). El tokenizador semantico S3, el codificador de hablante CAMPPlus y el vocoder HiFT permanecen congelados, de modo que la conversion se apoya en tokens semanticos de origen y en un vector de identidad CAMPPlus extraido de la referencia objetivo. La inferencia consume filas Parquet preparadas: la fila origen aporta tokens semanticos S3 y puntuaciones dinamicas de emocion/estilo, y la fila objetivo (5-10 segundos) aporta el prefijo acustico, el vector CAMPPlus y rasgos estaticos de voz.

El entrenamiento usa RL con un modelo de recompensa congelado (Humaneness Ears Medium, revision `818506970d93c809a3295a0a02c40dee8ff2bfc3`). El conjunto consta de 4.000 condiciones origen/objetivo, con 3.357 fuentes distintas y 477 clips de voz objetivo, recorridas seis veces con permutaciones y semillas de muestreo distintas: 24.000 pasos de optimizador y 384.000 candidatos generados por brazo (no 24.000 pares de entrada distintos). Cada paso es un grupo de 16 candidatos repartido en cuatro candidatos por GPU GH200 en un nodo de cuatro GPU con gradientes sincronizados. La recompensa estandariza cada componente dentro del grupo, recorta la ventaja ponderada a ±2,5 y la centra. El optimizador es AdamW con 1.200 pasos de calentamiento (5 %), LR pico de 2e-6, decaimiento coseno hasta 2e-7 y un ancla de flujo de politica congelada de 0,025 respecto al modelo de partida v1 paso 4.000.

## Capacidades

- Conversion de voz audio-a-audio: transforma una locucion de origen hacia la identidad acustica de una voz objetivo usando una referencia de 5 a 10 segundos.
- Transferencia de emocion y estilo: incorpora puntuaciones dinamicas de emocion/estilo en el condicionamiento, derivadas de la grabacion de origen (no etiquetas fijas del prompt).
- Modelado de identidad mediante CAMPPlus: emplea un vector de identidad de hablante y rasgos estaticos de la voz objetivo.
- Optimizacion por RL de la salida acustica: el adaptador se ajusta para maximizar Content Enjoyment y minimizar el MSE de las dos emociones dominantes segun el modelo de recompensa Ears Medium.
- Soporte de continuacion de entrenamiento: publica checkpoints cada 1.000 grupos con estado de optimizador y RNG, con verificacion SHA-256.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no aplica; no es un modelo de lenguaje.
- Capacidades multilingues: no disponible.
- Capacidades especiales: no es un modelo TTS autonomo ni produce texto; requiere pares origen/objetivo preparados.

## Casos de uso

- Investigacion en conversion de voz: permite reproducir y auditar un experimento de RL sobre el decodificador acustico de Chatterbox, comparando el adaptador re-merged con el modelo v1 paso 4.000 como referencia.
- Estudio de recompensas sinteticas: sirve para analizar como el uso de Content Enjoyment y MSE emocional como recompensa afecta a la salida, dado que el propio autor advierte de que son puntuaciones predichas y no valoraciones humanas.
- Ajuste fino condicionado por emocion: el uso de puntuaciones emocionales de la fuente (y no etiquetas fijas) lo hace util para experimentar con transferencia de estilo emocional en VC.
- Evaluacion de sobreajuste en RL: al recorrer seis veces las mismas 4.000 condiciones, es un caso de estudio para medir explotacion de modelo de recompensa y sobreajuste en entrenamiento por refuerzo.
- Prototipado de pipelines de VC basados en Parquet: el codigo de inferencia (`code/grow_followup/infer_followup.py`) trabaja con pares origen/objetivo preparados, util para validar flujos de datos antes de escalar.
- Base para comparativas de adaptadores LoRA en audio: al publicar checkpoints verificados por SHA-256, permite reproducir y contrastar distintos pasos de entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas MMLU, HumanEval, GSM8K ni equivalentes de audio (similaridad de hablante, naturalidad, precision de contenido) y senala explicitamente que un estudio de escucha retenido con metricas de precision de contenido, similitud de hablante y naturalidad es necesario antes de elegir un adaptador por defecto.

## Requisitos de hardware

- Entrenamiento: nodo de cuatro GPU GH200 (cuatro candidatos por GPU dentro de cada grupo de 16).
- Inferencia: no se especifica la VRAM necesaria en la informacion disponible; el adaptador ocupa 0,5 GB y depende del modelo base Chatterbox S3Gen completo mas el vocoder.
- GPU recomendadas: no disponible para inferencia. El entrenamiento documentado usa GH200.
- Compatibilidad con GPU de consumo: no confirmada en la informacion disponible.
- Opciones de despliegue: inferencia via script propio `code/grow_followup/infer_followup.py` con PyTorch y CUDA; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplicables a un decodificador acustico).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Base | Licencia | Disponibilidad |
|---|---|---|---|---|
| laion/chatterbox-s3gen-vc-grow-ce-remerged | Adaptador LoRA VC (RL) | ResembleAI/chatterbox | cc-by-4.0 | HuggingFace (0,5 GB) |
| laion/chatterbox-s3gen-vc-grow | Adaptador VC (padre) | ResembleAI/chatterbox | no disponible en la informacion | HuggingFace (referencia v1) |
| ResembleAI/chatterbox | Modelo TTS base | - | MIT (upstream) | HuggingFace |

No se dispone de datos de rendimiento comparativo entre estos modelos; la informacion solo confirma la relacion de dependencia (el adaptador re-merged se inicializa desde el v1 paso 4.000 y requiere los pesos base de Chatterbox).

## Limitaciones y advertencias

- Las recompensas son puntuaciones predichas por modelo (Humaneness Ears Medium), no valoraciones humanas; no esta demostrado que mejorar la recompensa implique mejor conversion de voz.
- Riesgo de explotacion del modelo de recompensa y de sobreajuste al recorrer seis veces las mismas 4.000 condiciones (con 3.357 fuentes distintas y 477 clips objetivo).
- La similitud de hablante, cuando se reporta, es un proxy CAMPPlus y no puede establecer fidelidad de identidad percibida por humanos.
- No se garantiza disjuncion de hablante con el conjunto de validacion previo: las fuentes seleccionadas son disjuntas por UID, no necesariamente por hablante.
- Es un artefacto de investigacion en fase temprana; no es un pipeline de VC para WAV arbitrario en un solo comando, sino para filas Parquet preparadas.
- Los archivos `.pt` incluyen estado de optimizador y RNG y usan pickle de Python: solo deben cargarse ficheros de procedencia fiable.
- El checkpoint no es un modelo base fusionado; hay que reconstruir la base efectiva v1 merged-new antes de aplicar el adaptador.
- Restricciones de uso: los pesos del adaptador, el codigo y la documentacion de LAION son CC BY 4.0; la dependencia upstream Chatterbox conserva licencia MIT independiente. Deben usarse unicamente voces y audio sobre los que se tengan derechos.
- No se dispone de informacion sobre sesgos, idiomas soportados ni longitud de contexto.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/laion/chatterbox-s3gen-vc-grow-ce-remerged
- Modelo base upstream: https://huggingface.co/ResembleAI/chatterbox
- Adaptador padre (v1): https://huggingface.co/laion/chatterbox-s3gen-vc-grow
- Modelo de recompensa: https://huggingface.co/laion/humaneness-ears-base-medium (revision `818506970d93c809a3295a0a02c40dee8ff2bfc3`)
- Documentacion de entrenamiento: `TRAINING.md` (en el repositorio)
- Registro de checkpoints: `RL_CHECKPOINTS.json` (en el repositorio)
- Codigo de inferencia: `code/grow_followup/infer_followup.py` (en el repositorio)
