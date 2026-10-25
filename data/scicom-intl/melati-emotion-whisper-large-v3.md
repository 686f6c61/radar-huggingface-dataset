# Scicom-intl/Melati-Emotion-Whisper-Large-V3

## Resumen

Melati-Emotion-Whisper-Large-V3 es un clasificador de emoción en voz que reutiliza el encoder de `openai/whisper-large-v3` (congelado, en float16) y le acopla una cabeza propia en float32 entrenada sobre sus características. Lo desarrolla Scicom-intl (Scicom MSC Berhad), con Husein Zolkepli como autor de la cita, y forma parte del pipeline interno «Melati» de etiquetado de podcasts, donde inserta marcas de emoción (`<happy>...</happy>`) en las transcripciones.

El modelo resuelve una tarea concreta y acotada: asignar una de siete etiquetas (neutral, happy, sad, angry, surprised, fearful, disgusted) a un fragmento de audio de hasta 30 segundos. Su interés no está en el tamaño (637.301.288 parámetros, prácticamente todo el encoder de Whisper) sino en la selección de datos: solo se entrena con corpus cuya licencia permite redistribuir el modelo resultante, y publica umbrales calibrados para la prevalencia real de cada emoción en podcasts, no para la distribución balanceada de los corpus actuados.

Frente a otros clasificadores de emoción, el modelo declara métricas sobre 7.791 clips estrictamente fuera de entrenamiento (UAR 0,538; exactitud 61%), con evaluación de generalización por corpus (leave-one-corpus-out, UAR media 0,517). La licencia es de investigación no comercial, lo que limita su uso en producción sin acuerdo aparte.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder de Whisper (transformer) congelado en float16 + cabeza de clasificación propia: mean-pooling por capa sobre los frames del clip, mezcla softmax aprendida de las 32 capas, LayerNorm, una capa oculta de 256 unidades y 7 salidas |
| Parametros totales | 637.301.288 (dato real de safetensors) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica como contexto de tokens: ventana de audio fija de 30 s (128 mel x 3000 frames) impuesta por el encoder de Whisper |
| Tipos de cuantizacion | No se publican cuantizaciones; el repositorio solo distribuye encoder en float16 y cabeza en float32. No hay GGUF, ONNX ni INT8 |
| Idiomas soportados | Entrenado con voz en bangla, inglés, francés, italiano, ruso y español; no se declara cobertura por idioma ni se evalúa en malayo |
| Licencia | `other` / `melati-emotion-research`: solo investigación no comercial |
| Formato de pesos | safetensors más código Python propio (`melati_emotion.py`, requiere `trust_remote_code=True`) |

## Arquitectura y entrenamiento

La arquitectura es un híbrido congelado-cabeza: el encoder de `whisper-large-v3` (32 capas) procesa el espectrograma mel y no se actualiza; sobre sus activaciones, cada capa se agrega con mean-pooling restringido a los frames reales del clip (el argumento `num_frames` evita que el padding a 30 s diluya la media), una mezcla softmax aprendida pondera las capas, y tras LayerNorm hay una única capa oculta de 256 unidades con 7 salidas softmax. Es un esquema de probing lineal no linealizado, barato de entrenar y de auditar.

El entrenamiento usa nueve corpus redistribuibles que suman 28.895 clips según las cifras de la model card: EMNS (1.063, inglés actuado, Apache-2.0), Emozionalmente (6.902, italiano, CC BY 4.0), JL-Corpus (1.440, inglés neozelandés, CC0), MESD (862, español mexicano, CC BY 4.0), Oreau (502, francés, CC BY 4.0), RESD (1.396, ruso, MIT), SUBESCO (7.000, bangla, CC BY 4.0), EmoV-DB (5.172, inglés, licencia no comercial) y Expresso (4.558, inglés, CC BY-NC 4.0). Los corpus se ponderan por igual en la pérdida y las clases también dentro de cada corpus. No hay RLHF ni DPO: es un clasificador discriminativo, no un modelo generativo. La versión interna del pipeline, entrenada además con corpus no redistribuibles (CREMA-D, RAVDESS, CaFE, PAVOQUE, MELD, TurEV-DB, eNTERFACE, EmoDB, ASED, ShEMO, URDU), alcanza 0,557 de UAR en el mismo conjunto held-out, frente a 0,538 de esta versión pública.

## Capacidades

- Clasificación de emoción en voz con 7 clases y salida de probabilidades por clase (`logits.softmax(-1)`), en el orden de `model.config.labels`.
- Agregación consciente de la longitud real del clip: el pooling se limita a los frames presentes, sin contaminar la media con el padding a 30 s.
- Umbralización lista para uso: `melati_emotion.py` aplica los umbrales del pipeline y devuelve la emoción más probable solo si es `neutral` o supera su umbral; en caso contrario devuelve `neutral`.
- Multilingüe de entrada: seis idiomas de entrenamiento (bangla, inglés, francés, italiano, ruso, español), con corpus actuados y read/improvisados.
- Integración nativa con `transformers` (`AutoModel` + `AutoFeatureExtractor`) y ejecución en GPU o CPU con una sola pasada.
- No dispone de generación de texto, ASR, traducción, tool calling, capacidades de agente ni visión; el decoder de Whisper no se distribuye ni se usa.
- Una sola etiqueta por clip: los cambios de emoción dentro del fragmento se promedian, no se segmentan.

## Casos de uso

- Etiquetado de transcripciones de podcasts: es el caso original del pipeline Melati; el modelo inserta marcas de emoción sobre los segmentos de la transcripción para permitir búsqueda, resumen o renderizado expresivo posterior. Sus umbrales están calibrados precisamente para la prevalencia baja de emociones no neutras en este dominio.
- Enriquecimiento de corpus para TTS expresivo: anotar automáticamente miles de horas con etiquetas de emoción antes de entrenar un modelo de síntesis, filtrando por umbral alto para no introducir ruido en las etiquetas.
- Indexación y búsqueda por emoción en archivos de audio: precalcular la distribución de emociones por clip y exponerla como faceta de búsqueda en un archivo de radio, entrevistas o clases grabadas.
- Triaje previo a anotación humana: usar el modelo como filtro de primera pasada en un bucle de active learning, enviando a anotadores solo los clips donde la probabilidad máxima cae en una banda de incertidumbre.
- Investigación en reconocimiento de emociones en voz (SER): sirve como baseline reproducible con licencias limpias y con evaluación leave-one-corpus-out documentada, algo poco habitual en modelos de este tipo.
- Analítica de investigación cualitativa: medir la proporción de intervenciones con carga emocional en entrevistas semiestructuradas, siempre con revisión humana dado que las etiquetas no están validadas fuera de los corpus actuados.
- Detección de tono en moderación de audio comunitario: priorizar clips con alta probabilidad de `angry` para revisión, aceptando el coste de falsos positivos que implican los umbrales publicados (precisión objetivo del 75-77 %).

## Benchmarks y rendimiento

Evaluación sobre 7.791 clips held-out que ninguno de los modelos comparados usó en entrenamiento (nEMO, polaco actuado; y la mitad VoxCeleb de NonverbalTTS, entrevistas en inglés):

| Conjunto held-out | UAR | Exactitud |
|---|---|---|
| nEMO (polaco, actuado) | 0.559 | 57% |
| NonverbalTTS, mitad VoxCeleb (inglés, entrevistas) | 0.520 | 66% |
| Ambos (7.791 clips) | 0.538 | 61% |
| Referencia: cabeza interna de Melati (incluye corpus no redistribuibles) | 0.557 | no disponible |

Generalización entre corpus (cada corpus evaluado con la cabeza entrenada en los otros ocho): UAR media 0.517.

Umbrales por emoción, optimizados para 75 % de precisión re-ponderada a tasas supuestas de podcast, elegidos en una mitad del held-out y medidos en la otra:

| Emoción | Umbral | Tasa supuesta en podcast | Recall | Precisión a esa tasa |
|---|---|---|---|---|
| happy | 0.83 | 15% | 32% | 75% |
| sad | 0.93 | 5% | 20% | 76% |
| angry | 0.64 | 5% | 35% | 77% |
| surprised | 0.3 | 5% | 11% | 81% |
| fearful | 0.84 | 2% | 3% | 70% |
| disgusted | sin umbral (sin ejemplos held-out) | 2% | n/a | n/a |

La model card presenta los resultados de los modelos comparados únicamente en gráficas, sin cifras numéricas en el texto, por lo que no se pueden tabular aquí. No se han publicado resultados de MMLU, HumanEval ni GSM8K: el modelo no es generativo.

## Requisitos de hardware

- Pesos: encoder de ~637 M parámetros en float16 (unos 1,3 GB) más una cabeza minúscula en float32; el repositorio completo ocupa 1,3 GB.
- VRAM estimada: 2-3 GB en float16 incluyendo el espectrograma mel de 128 x 3000 y activaciones intermedias; el modelo entra sin problemas en cualquier GPU consumer con 6 GB o más (RTX 3060, 4060, 4070, 4090).
- GPU de datacenter: T4, L4, A10G, L40S, A100 y H100 son válidas; el cuello de botella es el encoder de 32 capas sobre una ventana fija, no la memoria.
- CPU: viable, ya que el encoder es de 637 M de parámetros, aunque no se publican medidas de latencia ni throughput en ningún hardware.
- Coste constante por clip: el encoder de Whisper procesa siempre una ventana de 30 s con padding, así que la latencia no depende de la duración real del audio hasta ese límite.
- Despliegue: `transformers` con `trust_remote_code=True` y PyTorch es la única vía documentada. No hay soporte publicado para vLLM, TGI, llama.cpp, Ollama ni ONNX Runtime; al usar código propio y una firma de `forward` con `num_frames`, cualquier servidor de inferencia requiere una integración a medida.
- No se publican cifras de latencia ni de throughput.

## Comparativa con modelos similares

| Modelo | Parámetros | Ventana / contexto | Tarea y salida | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Melati-Emotion-Whisper-Large-V3 | 637.301.288 | Audio fijo de 30 s | SER, 7 clases con umbrales calibrados | Investigación no comercial (`melati-emotion-research`) | HuggingFace, requiere `trust_remote_code` |
| openai/whisper-large-v3 (modelo base) | ~1.550 M | Audio fijo de 30 s | ASR y traducción, salida de texto | MIT | HuggingFace, `transformers` |
| emotion2vec+ (referencia citada en la model card, evaluada sobre EmoBox) | no disponible | no disponible | SER con embeddings auto-supervisados | no disponible en la información proporcionada | HuggingFace / repositorios de los autores |
| Familia wav2vec2-base para SER (p. ej. el checkpoint SUPERB ER) | ~95 M | Audio de pocos segundos | SER, típicamente 4 clases (neutral, happy, angry, sad) | no verificado en esta búsqueda | HuggingFace, `transformers` |

El modelo se distingue de los clasificadores ligeros tipo wav2vec2 por el número de clases (7 frente a 4) y por publicar umbrales y métricas de generalización entre corpus; su desventaja clara es la licencia, mucho más restrictiva que la MIT de Whisper o la de los checkpoints de SUPERB.

## Limitaciones y advertencias

- El habla de entrenamiento es mayoritariamente actuada y en seis idiomas (bangla, inglés, francés, italiano, ruso y español); ninguno es malayo, el idioma del mercado donde Melati lo ejecuta, y las etiquetas en podcasts malayos no se han medido contra juicios humanos.
- Las tasas de prevalencia usadas para calibrar los umbrales (15 % happy, 5 % sad, 5 % angry, 5 % surprised, 2 % fearful) son supuestos, no mediciones.
- `surprised` y `fearful` se detectan raramente con la precisión objetivo (recall 11 % y 3 % respectivamente); `disgusted` no tiene umbral y nunca se devuelve.
- Una sola etiqueta por clip: la emoción que cambia dentro del fragmento se promedia, lo que produce etiquetas engañosas en audio largo o con cambios bruscos.
- El audio se trunca a la ventana de 30 s del encoder de Whisper; los clips más largos no se segmentan automáticamente.
- Licencia de solo investigación no comercial: cualquier uso en producto, servicio interno con ánimo de lucro o evaluación comercial requiere acuerdo con Scicom; además, parte de los corpus de entrenamiento (EmoV-DB, Expresso) son no comerciales, lo que refuerza la restricción.
- Riesgo de alucinación de etiqueta: un clasificador siempre devuelve una de las siete clases con una probabilidad; sin aplicar los umbrales, el modelo etiqueta emociones en audio neutro o ruidoso.
- Sesgo de dominio y de actuación: el rendimiento cae previsiblemente en habla espontánea, con ruido de fondo o con solapamiento de hablantes, situaciones no cubiertas por los corpus de evaluación.
- El código requiere `trust_remote_code=True`, lo que implica ejecutar Python del autor del repositorio; conviene auditar `melati_emotion.py` antes de desplegarlo.
- La búsqueda web realizada no devolvió ningún resultado relevante sobre el modelo (solo contenido no relacionado), por lo que no hay fuentes externas que contrasten las cifras de la model card.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Scicom-intl/Melati-Emotion-Whisper-Large-V3
- Modelo base: https://huggingface.co/openai/whisper-large-v3
- Código, entrenamiento y evaluación (Melati): https://github.com/Scicom-AI-Enterprise-Organization/Melati
- Licencia del modelo: https://huggingface.co/Scicom-intl/Melati-Emotion-Whisper-Large-V3/blob/main/LICENSE
- Resultados held-out: https://huggingface.co/Scicom-intl/Melati-Emotion-Whisper-Large-V3/blob/main/figures/held_out.png
- Recall a 75 % de precisión: https://huggingface.co/Scicom-intl/Melati-Emotion-Whisper-Large-V3/blob/main/figures/recall.png
- Leave-one-corpus-out: https://huggingface.co/Scicom-intl/Melati-Emotion-Whisper-Large-V3/blob/main/figures/leave_one_out.png
- Script de umbralización: https://huggingface.co/Scicom-intl/Melati-Emotion-Whisper-Large-V3/blob/main/melati_emotion.py
- Paper o publicación técnica: no disponible en la información proporcionada
- Demo: no disponible en la información proporcionada
