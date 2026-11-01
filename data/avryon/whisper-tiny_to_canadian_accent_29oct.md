# AVryon/whisper-tiny_to_canadian_accent_29oct

## Resumen

Whisper tiny Canadian es un ajuste fino (fine-tuning) del modelo openai/whisper-tiny, publicado por el usuario AVryon en Hugging Face. Se trata de un modelo de reconocimiento automatico del habla (ASR) especializado en ingles canadiense, entrenado sobre un dataset denominado Canadian_english. El modelo conserva la arquitectura encoder-decoder transformer propia de la familia Whisper y el mismo tamano que el modelo base: 37.760.640 parametros totales, con un repositorio de 0,3 GB en formato safetensors.

El interes de este modelo es acotado pero concreto: parte de la version mas pequena de Whisper (tiny, unos 39 millones de parametros) y la adapta a un acento regional especifico mediante un entrenamiento corto de 2.000 pasos. El resultado declarado por el autor es un WER de 20,93 sobre el split de test del dataset Canadian English, lo que lo situa como una alternativa ligera para transcripcion de audio en entornos con recursos muy limitados o para experimentacion rapida con adaptacion de acentos.

No obstante, conviene ser prudente: la model card esta generada automaticamente por el Trainer y no incluye descripcion del dataset, procedencia de los datos, ni analisis de sesgos. El modelo acumula solo 20 descargas y 0 likes en el momento de la consulta, y los resultados no estan verificados (verified: false). Es, por tanto, un artefacto de investigacion mas que un modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper) |
| Parametros totales | 37.760.640 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (Whisper tiny procesa ventanas de audio de 30 s) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning de openai/whisper-tiny, un transformer encoder-decoder disenado para ASR que convierte espectrogramas mel en tokens de texto. Whisper tiny es la variante mas pequena de la familia y esta pensada para inferencia en CPU o GPUs de gama baja. El ajuste se realizo con la libreria Transformers (version 5.22.0.dev0) y PyTorch 2.11.0+cu130, con un learning rate de 1e-05, optimizador AdamW con betas (0,9; 0,999) y epsilon 1e-08, scheduler lineal con 500 pasos de warmup, batch de entrenamiento de 2 y batch de evaluacion de 1, semilla 42 y un total de 2.000 pasos de entrenamiento (2 epocas).

No se especifica en la informacion disponible el numero de tokens de audio, la composicion exacta del dataset Canadian_english, ni si hubo tecnicas de aumento de datos o regularizacion. La unica traza de evaluacion son dos puntos de validacion: en el paso 1000 (epoca 1) se obtuvo una perdida de validacion de 0,4223 y un WER de 21,1907; en el paso 2000 (epoca 2) la perdida subio a 0,4253 y el WER bajo a 20,9284, lo que sugiere un ligero sobreajuste en perdida sin mejora sustancial en WER. No se documenta ninguna innovacion tecnica adicional (decodificacion especulativa, atencion lineal, etc.).

## Capacidades

- Reconocimiento automatico del habla (ASR) en ingles, con especializacion en acento canadiense.
- Transcripcion de audio a texto en formato compatible con el pipeline `automatic-speech-recognition` de Transformers.
- Capacidad multilingue limitada: solo declara `en`; no se ha entrenado para otros idiomas.
- No se documenta soporte de tool calling, function calling, agentes ni razonamiento multi-paso.
- No se documenta modo thinking, vision, audio generativo ni otras capacidades especiales.
- No se documenta traduccion, diarizacion de hablantes ni marcas de tiempo (timestamps) en la informacion disponible.

## Casos de uso

- Transcripcion de reuniones y notas de voz en entornos con ingles canadiense: el modelo puede convertir audio de reuniones en texto en dispositivos con recursos limitados, dado su tamano de 37,7 M de parametros.
- Subtitulado ligero de contenido audiovisual local: util para generar subtitulos en ingles canadiense en pipelines de bajo coste, aunque la precision (WER ~21 %) exige revision humana.
- Prototipado rapido de ASR en CPU: al ser la variante tiny, permite experimentar con transcripcion en portatiles sin GPU dedicada.
- Investigacion sobre adaptacion de acentos: sirve como caso de estudio de fine-tuning regional sobre un modelo base pequeno.
- Preprocesamiento de audio para pipelines de NLP: convertir voz a texto antes de aplicar clasificacion, resumen o busqueda semantica en ingles.
- Evaluacion comparativa de tecnicas de fine-tuning: el modelo documenta hiperparametros y curvas de entrenamiento, lo que facilita reproducir o contrastar metodologias.
- Aplicaciones de accesibilidad de bajo coste: dictado o transcripcion en tiempo casi real en hardware modesto, con la salvedad de la calidad limitada.

## Benchmarks y rendimiento

Datos declarados por el autor en la model-index (no verificados):

| Dataset | Split | Metrica | Valor |
|---|---|---|---|
| Canadian English | test | WER | 20,9284 |

Resultados de validacion durante el entrenamiento:

| Epoca | Paso | Perdida de validacion | WER |
|---|---|---|---|
| 1.0 | 1000 | 0,4223 | 21,1907 |
| 2.0 | 2000 | 0,4253 | 20,9284 |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible, ya que no aplican a un modelo ASR.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 para los 37,7 M de parametros; en la practica, el cuello de botella es el buffer de audio, no los pesos.
- GPU recomendadas: cualquier GPU moderna sirve; el modelo cabe holgadamente en RTX 3060, RTX 4090, A100 o H100, aunque no las aprovecha por su tamano.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU consumer e incluso en CPU.
- Opciones de despliegue: pipeline de Transformers, vLLM (soporte ASR limitado), llama.cpp no aplica (no es un modelo de lenguaje), TGI con soporte Whisper, o inferencia directa con PyTorch.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada; al ser un modelo tiny, se espera inferencia en tiempo real o mas rapida en CPU moderna, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Contexto audio | Licencia | WER declarado |
|---|---|---|---|---|---|
| AVryon/whisper-tiny_to_canadian_accent_29oct | 37,7 M | en | ventanas de 30 s (Whisper) | apache-2.0 | 20,93 (Canadian English test) |
| openai/whisper-tiny | 37,7 M | multilingue | ventanas de 30 s | apache-2.0 | no disponible en esta ficha |
| openai/whisper-base | ~74 M | multilingue | ventanas de 30 s | apache-2.0 | no disponible en esta ficha |
| openai/whisper-small | ~244 M | multilingue | ventanas de 30 s | apache-2.0 | no disponible en esta ficha |

La comparacion directa con whisper-tiny original no es posible con los datos aportados, ya que no se incluye el WER del modelo base sobre el mismo dataset Canadian English. No se dispone de datos de otros fine-tunes comparables en la informacion proporcionada.

## Limitaciones y advertencias

- Model card generada automaticamente: no describe el dataset, la procedencia de los datos ni el proceso de anotacion, lo que impide evaluar sesgos y calidad.
- WER elevado (20,93 %) incluso sobre el dataset de evaluacion; en dominios distintos o audio con ruido el rendimiento puede degradarse notablemente.
- Resultados no verificados (verified: false) y con solo 20 descargas; no hay evidencia independiente de su calidad.
- Ligero sobreajuste visible: la perdida de validacion sube de 0,4223 a 0,4253 entre epocas, aunque el WER mejora marginalmente.
- Solo soporta ingles; no se ha entrenado para otros idiomas ni para traduccion.
- Riesgo de alucinacion en ASR: como todos los modelos Whisper, puede generar texto plausible no presente en el audio, especialmente en silencios o ruido.
- Sin documentacion sobre sesgos de acento, genero o procedencia de hablantes.
- Licencia apache-2.0 permite uso comercial, pero la ausencia de documentacion sobre el dataset de entrenamiento impide descartar problemas de derechos sobre los datos.
- No apto para produccion sin validacion adicional: la falta de pruebas en dominios reales y el WER declarado lo desaconsejan para tareas criticas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AVryon/whisper-tiny_to_canadian_accent_29oct
- Modelo base: https://huggingface.co/openai/whisper-tiny
- Repositorio de Whisper (OpenAI): https://github.com/openai/whisper
- Paper de Whisper: https://arxiv.org/abs/2212.04356
- Documentacion de Transformers para ASR: https://huggingface.co/docs/transformers/tasks/asr
