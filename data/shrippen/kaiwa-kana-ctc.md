# shrippen/kaiwa-kana-ctc

## Resumen

kaiwa-kana-ctc es un modelo de reconocimiento automatico del habla (ASR) en japones especializado en transcripcion fonetica. No transcribe ortografia: escribe lo que se ha **pronunciado**, en hiragana, representando las vocales largas como `ー`, la particula `は` como `わ`, y reflejando la presencia o ausencia de `っ` y `ん` tal y como suenan. Lo desarrolla el autor shrippen como componente del proyecto Kaiwa, un entrenador de conversacion en japones, con el objetivo de detectar errores de duracion de mora en estudiantes.

El modelo parte de `reazon-research/japanese-wav2vec2-large` (revision `55969d37`, licencia Apache-2.0) y se afina con CTC sobre 49 horas de Common Voice 19.0 en japones. Cuenta con 315.516.117 parametros y se distribuye tanto en safetensors para `transformers` (`Wav2Vec2ForCTC`) como en un ONNX int8 de 356 MB para inferencia ligera. El repositorio ocupa 1.0 GB.

Su relevancia es de nicho pero muy concreta: es un verificador de pronunciacion, no un ASR general. En lugar de competir con Whisper o con los wav2vec2 japoneses convencionales, resuelve un problema que esos modelos no abordan bien, que es medir si un aprendiz ha acortado una vocal larga o se ha comido un `っ`. El autor publica umbrales calibrados para mantener una tasa de falsos positivos inferior al 5 % sobre voces reales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | wav2vec2 (Transformer encoder con extractor convolucional de features) + cabeza CTC |
| Parametros totales | 315.516.117 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica en el sentido de tokens; modelo acustico que recibe audio a 16 kHz normalizado (media cero, varianza unitaria). Limite maximo de audio no disponible |
| Tipos de cuantizacion | fp32 (safetensors) e int8 (ONNX, solo para las multiplicaciones matriciales) |
| Idiomas soportados | japones (ja) unicamente |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (PyTorch/transformers) y ONNX int8 (`model.int8.onnx`, 356 MB) |

## Arquitectura y entrenamiento

La arquitectura es un wav2vec2 con cabeza de clasificacion CTC, heredada del checkpoint `reazon-research/japanese-wav2vec2-large`. La entrada es audio en crudo a 16 kHz, normalizado a media cero y varianza unitaria; la salida son logits por fotograma sobre un vocabulario en hiragana (`vocab.json`). El ONNX cuantizado a int8 aplica la cuantizacion solo a las multiplicaciones matriciales, lo que reduce el peso del artefacto a 356 MB manteniendo la estructura del modelo. La interfaz ONNX expone `samples` (1 x n, float32) como entrada y `logits` (1 x frames x vocab) como salida.

El ajuste fino se hizo sobre Common Voice 19.0 en japones (CC0), 49 horas, usando las particiones `train`, `dev` y los clips de `other` que recibieron votos a favor y ninguno en contra. Se excluyeron los hablantes del split `test` y 40 hablantes de `dev`. Los objetivos de entrenamiento son la pronunciacion de cada frase generada con OpenJTalk (pyopenjtalk) y convertida a hiragana; se descartaron las frases con digitos o letras latinas. El entrenamiento consistio en 7000 pasos con perdida CTC, usando el script `spikes/s06-moren/finetune.py` del repositorio Kaiwa. No se menciona uso de RLHF ni DPO: es un ajuste supervisado puro con CTC.

## Capacidades

- Reconocimiento de habla japonesa con salida exclusivamente en hiragana, sin kanji ni puntuacion.
- Transcripcion fonetica fiel a la pronunciacion: vocales largas como `ー`, `は` realizada como `わ`, y presencia o ausencia de `っ` y `ん` tal y como se articulan.
- Puntuacion de variantes de pronunciacion: dado un enunciado kana esperado, el modelo permite comparar su probabilidad CTC con la de variantes con un unico error (por ejemplo `とうきょう` frente a `ときょう`, o `きって` frente a `きて`).
- Deteccion de acortamiento de vocal larga (tipo `long-`) y de omision de `っ` (tipo `q-`), con umbrales calibrados en `thresholds.json`.
- Clasificacion del tipo de error: cuando detecta un fallo, identifica la clase correcta en el 97 % de los casos.
- Inferencia en CPU y GPU mediante el artefacto ONNX int8 o via `transformers`.
- No soporta tool calling, function calling, agentes, vision, audio de entrada distinto al descrito ni capacidades multilingues. Es un modelo monofuncion.

## Casos de uso

- Deteccion de errores de mora en un entrenador de conversacion: Kaiwa conoce la frase que el estudiante pretendia decir, puntua el kana esperado y sus variantes con un unico error bajo las probabilidades CTC del modelo y, si una variante supera el umbral, la reporta como pista. Es el caso de uso nativo del modelo.
- Feedback de pronunciacion en aplicaciones de aprendizaje de japones: el modelo permite senalar de forma automatica que un aprendiz ha acortado una vocal larga o se ha comido un `っ`, dos de los errores mas persistentes en estudiantes hispanohablantes y angloparlantes.
- Evaluacion automatica de lectura en voz alta: en examenes o ejercicios de lectura, se compara la salida kana con la lectura esperada para detectar discrepancias de duracion sin necesidad de un corrector humano.
- Scoring de candidatos de pronunciacion en pipelines de sintesis y reconocimiento: el modelo puede usarse para puntuar distintas hipotesis de lectura de una misma frase y elegir la mas probable.
- Investigacion en fonetica computacional: la salida estrictamente kana, sin normalizacion ortografica, facilita estudios sobre duracion vocalica, geminacion consonantica y realizacion de particulas en corpus de habla real.
- Generacion de ayudas de lectura furigana/kana sobre audio: en herramientas de subtitulado o de lectura asistida, se puede producir una transcripcion kana alineada con el audio para lectores que aun no dominan los kanji.
- Filtrado y validacion de datos de audio: al no producir kanji ni puntuacion, la salida se compara de forma directa con lecturas generadas por OpenJTalk, lo que simplifica la verificacion de corpus de habla japonesa en procesos de control de calidad.
- Deteccion de discrepancias en doblaje o locucion: comparar la lectura kana real con el guion fonetico previsto permite localizar palabras acortadas o alargadas en postproduccion.

## Benchmarks y rendimiento

| Metrica | Resultado |
|---|---|
| Character error rate (CER) frente al kana de OpenJTalk, 40 hablantes reservados | 22.1 % |
| Deteccion de acortamientos (`long-`, `q-`) sobre 500 hablantes de `test` de Common Voice | 61.2 % (vocal larga 59 %, `っ` 64 %) |
| Falsos positivos en deteccion de acortamientos | 4.8 % |
| Deteccion de todas las clases de error (incluye alargamientos y `っ` insertada) | 22.9 % |
| Falsos positivos en deteccion de todas las clases | 5.7 % |
| Acierto al nombrar el tipo de error detectado | 97 % |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, ya que no son aplicables a un modelo acustico de este tipo.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 1.26 GB solo de pesos, mas activaciones; en la practica alrededor de 1.5-2 GB.
- VRAM estimada en fp16/bf16: aproximadamente 630 MB de pesos.
- ONNX int8: 356 MB de artefacto, segun la model card; apto para CPU y para GPU de gama baja.
- Cabe sobradamente en GPUs de consumo: RTX 3060, RTX 4060, RTX 4090 y cualquier GPU con 2-4 GB de VRAM. Tambien es viable en CPU con el ONNX int8 o con `onnxruntime`.
- Opciones de despliegue: `transformers` con `Wav2Vec2ForCTC`, ONNX Runtime con `model.int8.onnx`, pipelines de Hugging Face. No se mencionan integraciones con vLLM, TGI o llama.cpp, que no aplican a un modelo acustico de este tamano.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Entrada | Salida | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| shrippen/kaiwa-kana-ctc | 315.516.117 | audio 16 kHz, maximo no disponible | hiragana fonetico, sin kanji ni puntuacion | Apache-2.0 | safetensors y ONNX int8 en Hugging Face |
| reazon-research/japanese-wav2vec2-large | ~315 M (arquitectura wav2vec2-large) | audio 16 kHz | texto japones con kanji, segun su entrenamiento | Apache-2.0 | safetensors en Hugging Face; es el modelo base |
| Whisper large-v3 | ~1.55 B | ventanas de audio de 30 s | texto con kanji, puntuacion y formato libre | MIT | safetensors y variantes en Hugging Face |

Diferencias clave: kaiwa-kana-ctc y su modelo base comparten arquitectura y orden de magnitud de parametros, pero el afinado cambia por completo el objetivo y el vocabulario de salida, restringiendolo a hiragana fonetico. Frente a Whisper large-v3, kaiwa-kana-ctc es aproximadamente cinco veces mas pequeno, no normaliza ortografia y no produce puntuacion, lo que lo hace inutil como transcriptor general pero mas adecuado para medir duracion de mora. No se dispone de comparaciones de rendimiento publicadas frente a estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- No es un reconocedor de habla general: la salida no contiene kanji ni puntuacion, por lo que no sirve para transcripcion convencional.
- Los errores evaluados estan insertados artificialmente en habla nativa, no producidos por aprendices reales; el rendimiento sobre errores humanos espontaneos puede diferir.
- Los datos de evaluacion son habla leida de Common Voice, capturada con microfonos de portatil y de movil; no se ha validado sobre audio ruidoso, telefonia comprimida ni conversacion espontanea.
- Los alargamientos vocalicos y la `っ` insertada se detectan con menos del 18 % de acierto, por lo que Kaiwa solo reporta acortamientos.
- Rate de falsos positivos declarada de en torno al 5 %; en produccion esto implica avisos incorrectos ocasionales al usuario.
- Las lecturas de referencia proceden de OpenJTalk. Cuando una frase admite varias lecturas, el modelo se entreno con la eleccion de OpenJTalk, lo que puede penalizar variantes validas.
- Solo soporta japones. No hay capacidades multilingues.
- Se descartaron frases con digitos o letras latinas en el entrenamiento, por lo que estos casos quedan fuera de su dominio.
- Licencia Apache-2.0, heredada del modelo base, sin restricciones conocidas para uso comercial. Common Voice es CC0.
- No se documentan sesgos demograficos ni dialectales mas alla de la composicion de Common Voice.
- Riesgo de alucinacion en el sentido de produccion de kana plausible pero incorrecto cuando la senal es ambigua o el audio es de baja calidad; al ser un modelo CTC restringido a un vocabulario kana, no genera texto libre.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/shrippen/kaiwa-kana-ctc
- Modelo base: https://huggingface.co/reazon-research/japanese-wav2vec2-large
- Repositorio del proyecto Kaiwa: https://github.com/shrippen/Kaiwa
- Script de ajuste fino: `spikes/s06-moren/finetune.py` dentro del repositorio Kaiwa
- La model card cita Common Voice 19.0 (CC0) y OpenJTalk (pyopenjtalk) como fuentes de datos y de objetivos, sin enlace explicito en la documentacion proporcionada.
- La busqueda web realizada no aporto enlaces adicionales relevantes: los unicos resultados devueltos no guardan relacion con el modelo.
