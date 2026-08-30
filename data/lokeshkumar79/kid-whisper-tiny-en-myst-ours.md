# lokeshkumar79/kid-whisper-tiny-en-myst-ours

## Resumen

`lokeshkumar79/kid-whisper-tiny-en-myst-ours` es un modelo de reconocimiento automático del habla (ASR) obtenido por fine-tuning de `openai/whisper-tiny.en` sobre el corpus MyST (My Science Tutor), un conjunto de grabaciones de habla infantil en inglés de estudiantes de primaria (grados 3-5). El modelo ha sido desarrollado por lokeshkumar79 en el contexto de un trabajo de investigación (tesis de máster) centrado en el estudio de técnicas de compresión —cuantización y poda— aplicadas a modelos ASR de pequeña escala para habla infantil.

El modelo presenta una arquitectura encoder-decoder transformer propia de Whisper, con 37,76 millones de parámetros, y está diseñado específicamente para transcribir habla de niños y niñas en inglés. Su relevancia radica en que sirve como punto de partida para investigar cómo reducir el tamaño de los modelos ASR sin perder precisión en un dominio tan particular como el habla infantil, un ámbito con escasos recursos etiquetados. El checkpoint se ha entrenado de forma independiente, con un pipeline de filtrado de datos propio, para evitar confusiones con otros fine-tunes existentes sobre el mismo corpus.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder-decoder transformer (Whisper tiny.en) |
| Parametros totales | 37.760.256 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 30 segundos de audio (ventana fija de Whisper) |
| Tipos de cuantizacion | No disponible (el estudio de cuantizacion es posterior al entrenamiento, no se han publicado pesos cuantizados) |
| Idiomas soportados | Ingles (en) |
| Licencia | MIT |
| Formato de pesos | safetensors (tambien disponible en otros formatos si se exporta) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Whisper tiny.en, un transformer encoder-decoder con atención estándar, diseñado originalmente por OpenAI para ASR multilingüe. En este caso, se ha realizado un fine-tuning completo sobre el corpus MyST filtrado, que consta de 57.687 utterances de entrenamiento y 9.017 de validación. El proceso de filtrado incluye eliminación de transcripciones faltantes, control de calidad mediante un ASR de referencia, manejo de etiquetas de no-habla, eliminación de utterances muy cortos y limitación de duración.

El entrenamiento se llevó a cabo con el `Seq2SeqTrainer` de HuggingFace, usando precisión mixta fp16, una tasa de aprendizaje de 1e-5, batch efectivo de 64 (batch por dispositivo 16 con acumulación de gradientes de 4), 500 pasos de warmup y early stopping con paciencia de 5 basado en el WER de validación. El mejor checkpoint se obtuvo en el paso 5000. No se aplicaron técnicas de RLHF ni DPO; el entrenamiento es supervisado estándar con pérdida de entropía cruzada.

## Capacidades

- Reconocimiento automático del habla (ASR) en inglés, especializado en voz infantil.
- Transcripción de audio de hasta 30 segundos por ventana, con posibilidad de procesar audios más largos mediante segmentación.
- Generación de transcripciones con puntuación básica y normalización de mayúsculas (comportamiento heredado de Whisper).
- No soporta tool calling, agentes, visión ni otras modalidades; es exclusivamente un modelo de audio a texto.
- Capacidad multilingüe limitada al inglés, dado que el modelo base es `whisper-tiny.en` y el corpus de fine-tuning es exclusivamente en inglés.

## Casos de uso

- Investigación en compresión de modelos ASR: el checkpoint sirve como baseline para experimentos de cuantización post-entrenamiento (por ejemplo, cuantización a 8 bits o 4 bits) y poda por magnitud o importancia, permitiendo medir el impacto en WER sobre habla infantil.
- Evaluación de pipelines de filtrado de datos: al haber sido entrenado con un pipeline de filtrado específico y documentado, puede usarse para comparar el efecto de diferentes criterios de limpieza de corpus en el rendimiento final del modelo.
- Prototipado de ASR ligero para aplicaciones educativas: dado su tamaño reducido (37,7M parámetros), puede desplegarse en entornos con recursos limitados para transcribir interacciones de estudiantes en plataformas de tutoría inteligente.
- Análisis de habla infantil en entornos de aula: investigadores en tecnología educativa pueden usarlo para transcribir grabaciones de clases o tutorías y extraer métricas de participación oral.
- Comparación de fine-tunes de Whisper sobre el mismo corpus: al ser independiente de otros checkpoints (como los de Attia et al. o Dutta et al.), permite aislar el efecto del pipeline de datos en el rendimiento.
- Estudio de robustez ante acentos y variaciones de habla infantil: el corpus MyST contiene grabaciones de estudiantes de grados 3-5, lo que permite analizar cómo se comporta el modelo ante diferentes pronunciaciones y ritmos de habla.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El único dato reportado es un WER de validación del 13,14% medido durante el entrenamiento sobre utterances individuales no concatenados, utilizado exclusivamente para la selección de checkpoint. El autor indica explícitamente que este valor no es el número de evaluación reportable y que la evaluación metodológicamente rigurosa (pipeline ASR de HuggingFace con `chunk_length_s=30`, beam search de 5, batch de 4, sobre el conjunto de test concatenado de MyST) está pendiente de ejecución.

## Requisitos de hardware

- Al tratarse de un modelo de 37,76 millones de parámetros, la VRAM necesaria para inferencia es muy reducida: aproximadamente 150 MB en fp16 y menos de 100 MB en cuantización de 8 bits.
- Es ejecutable en cualquier GPU consumer con al menos 2 GB de VRAM (por ejemplo, NVIDIA GTX 1650, RTX 3050, etc.) y también en CPU con un rendimiento aceptable para audios cortos.
- Para despliegue en producción, se recomienda usar el pipeline de HuggingFace `automatic-speech-recognition` o la librería `transformers` con el modelo cargado en fp16.
- También puede servirse mediante `vLLM` o `TGI` si se desea un endpoint HTTP, aunque al ser un modelo pequeño, la latencia será baja incluso en CPU.
- No se dispone de datos de throughput medidos; en una GPU moderna (por ejemplo, RTX 4090) se espera una latencia de decodificación de unos pocos cientos de milisegundos por utterance de 5-10 segundos.

## Comparativa con modelos similares

| Modelo | Base | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| lokeshkumar79/kid-whisper-tiny-en-myst-ours | whisper-tiny.en | 37,76M | 30 s audio | MIT | Fine-tune independiente con pipeline propio |
| aadel4/kid-whisper-small-en-myst | whisper-small.en | ~244M | 30 s audio | MIT | Fine-tune de Attia et al. sobre MyST |
| aadel4/kid-whisper-medium-en-myst | whisper-medium.en | ~769M | 30 s audio | MIT | Fine-tune de Attia et al. sobre MyST |
| SatwikDutta/kid-whisper-tiny-en-myst | whisper-tiny.en | ~39M | 30 s audio | MIT | Fine-tune de Dutta et al. con otro esquema de filtrado |

Los tres modelos comparten la misma tarea (ASR de habla infantil en inglés) y el mismo corpus base (MyST), pero difieren en el tamaño del modelo base y en el pipeline de preprocesado. No se dispone de benchmarks comparativos publicados entre ellos.

## Limitaciones y advertencias

- El modelo no ha sido evaluado de forma rigurosa; el WER reportado en la model card es solo un valor de validación para selección de checkpoint y no debe usarse como métrica de rendimiento.
- No está destinado a producción: el autor indica explícitamente que su uso previsto es exclusivamente para investigación en compresión de modelos.
- El corpus MyST contiene habla de estudiantes de grados 3-5 en inglés; el modelo puede tener un rendimiento degradado con habla de niños más pequeños, acentos no representados o entornos ruidosos.
- Al ser un modelo ASR, existe riesgo de alucinación (generar texto que no corresponde al audio) especialmente en segmentos de silencio o ruido.
- La licencia MIT permite uso comercial, pero al no haber evaluación de rendimiento, cualquier uso en producción debería ir precedido de una validación exhaustiva.
- El tamaño del repositorio (1,3 GB) es desproporcionado para los pesos del modelo (unos 75 MB en fp16), lo que sugiere que incluye otros artefactos (checkpoints de entrenamiento, logs, etc.); esto puede afectar a la descarga si se clona el repositorio completo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/lokeshkumar79/kid-whisper-tiny-en-myst-ours
- Repositorio de la tesis (GitHub): https://github.com/lokeshkumar80/M.Tech_Thesis
- Modelo base `openai/whisper-tiny.en`: https://huggingface.co/openai/whisper-tiny.en
- Checkpoint relacionado de Attia et al.: https://huggingface.co/aadel4/kid-whisper-small-en-myst (y variante medium)
- Checkpoint relacionado de Dutta et al.: https://huggingface.co/SatwikDutta/kid-whisper-tiny-en-myst
- Repositorio Kid-Whisper (Attia et al.): https://github.com/ahmedadelattia/Kid-Whisper
