# oluwagbotty/w2vbert-ky-ft-10ep-s3

## Resumen

w2vbert-ky-ft-10ep-s3 es un modelo de reconocimiento automático del habla (ASR) para kinyarwanda, especializado en habla no estándar: en concreto, hablantes que tartamudean. Lo desarrolla el usuario de Hugging Face oluwagbotty como parte de un proyecto de investigación (Rwanda Innovation Sprint, coordinado por el CDLI) sobre reconocimiento de voz de bajo coste para personas con disfluencias. El modelo parte de badrex/w2v-bert-2.0-kinyarwanda-asr, un Wav2Vec2-BERT ajustado previamente para kinyarwanda, y se afina sobre la partición de entrenamiento del dataset CDLI de habla no estándar de Ruanda.

La arquitectura es Wav2Vec2-BERT (backbone convolucional más transformer sobre representaciones de audio), con 580.525.920 parámetros totales y salida CTC. El modelo está pensado para inferencia de un solo audio, decodificación greedy y evaluación mediante WER y CER con normalización de texto estilo Whisper. Su relevancia actual radica en que aborda un nicho poco cubierto: ASR para lenguas de bajos recursos combinado con habla atípica, un escenario donde los modelos comerciales suelen degradarse notablemente.

El repositorio ocupa 69,7 GB (incluye checkpoints intermedios y artefactos de entrenamiento) y los pesos finales están en la carpeta `best/`. La licencia es CC-BY-4.0 y el único idioma declarado es el kinyarwanda (`rw`).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Wav2Vec2-BERT (transformer con front-end convolucional, cabeza CTC) |
| Parámetros totales | 580.525.920 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de audio; ventana dependiente de la configuración de Wav2Vec2-BERT) |
| Tipos de cuantización | no disponible (pesos en safetensors; no se documentan variantes GGUF/ONNX) |
| Idiomas soportados | kinyarwanda (`rw`) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | safetensors (carpeta `best/`) |

## Arquitectura y entrenamiento

El modelo es un Wav2Vec2-BERT, es decir, un codificador convolucional que extrae representaciones del audio seguido de un transformer con atención, y una cabeza de clasificación CTC para producir la transcripción. Se inicializa desde badrex/w2v-bert-2.0-kinyarwanda-asr y se afina sobre la partición de entrenamiento del dataset `cdli/rwandan_kinyarwanda_nonstandard_speech_v1.0`, cuyos hablantes son mayoritariamente adultos jóvenes que tartamudean. Las grabaciones se hicieron en Ruanda en 2026, en interiores con poco ruido, mediante una aplicación de tableta, a partir de descripciones de imágenes y de frases leídas.

El ajuste se hizo con hasta 10 épocas y parada temprana sobre el WER de dev (paciencia de 3 evaluaciones), semilla 3, `lr 2e-5`, batch 16, batch efectivo 16 y `eval_steps 350`. Solo se usó la partición de train; dev seleccionó el checkpoint y test se evaluó una única vez tras el entrenamiento. La partición `extra` no se utilizó y ningún hablante aparece en más de una partición. El código de entrenamiento está en `scripts/molab/run_experiments.py` y `experiments/finetune.yaml` del repositorio del proyecto (experimento `w2vbert-ky-ft-10ep-s3`). No se documentan etapas de RLHF ni DPO, algo esperable en un modelo CTC de ASR.

## Capacidades

- Transcripción de voz a texto en kinyarwanda mediante decodificación greedy, un audio cada vez.
- Reconocimiento de habla no estándar, en particular disfluencias por tartamudeo (repeticiones escritas literalmente en las transcripciones de referencia).
- Manejo de dos estilos de entrada: frases leídas y descripciones libres a partir de imágenes.
- Salida CTC, que por construcción no genera bucles de repetición (el autor lo señala explícitamente como ventaja frente a modelos generativos tipo Whisper).
- Evaluación con WER y CER, incluyendo normalización de texto estilo Whisper y una variante con paso de apóstrofos para comparación con las model cards del CDLI.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio de entrada más allá del propio ASR, ni modo de pensamiento.

## Casos de uso

- Transcripción de consultas o entrevistas con personas que tartamudean en kinyarwanda: el modelo está afinado específicamente sobre este tipo de habla y evita el fallo de bucles de los modelos generativos, lo que reduce el riesgo de transcripciones repetitivas.
- Subtitulado y documentación de material grabado en interiores con tableta: las condiciones de entrenamiento (poco ruido, micrófono de tableta) coinciden con las de grabaciones de campo controladas.
- Investigación sobre ASR para lenguas de bajos recursos: sirve como línea base reproducible (semilla, hiperparámetros y código publicados) para comparar estrategias de adaptación a habla atípica.
- Herramientas de accesibilidad para hablantes con disfluencias: la salida CTC sin bucles facilita la integración en interfaces de dictado que muestran el texto al hablante antes de actuar sobre él.
- Evaluación comparativa de modelos ASR en kinyarwanda: el autor publica métricas pooled y por enunciado con y sin normalización CDLI, útiles para contrastar con otros modelos sobre el mismo split de test.
- Prototipos de transcripción de frases leídas en entornos educativos o administrativos de Ruanda, teniendo en cuenta que el rendimiento es mejor en texto leído que en habla libre.
- Extracción de texto para pipelines de análisis lingüístico (conteo de palabras, búsqueda) sobre grabaciones de habla no estándar, siempre con revisión humana del resultado.

## Benchmarks y rendimiento

Resultados publicados por el autor, decodificación greedy, un audio cada vez, normalizador de texto básico de Whisper (y paso de apóstrofos estilo CDLI para la fila comparativa). El WER pooled agrega todas las palabras; el WER y CER por enunciado son medias sobre grabaciones, cada una limitada al 100 %.

| Split | WER pooled (%) | CER (%) | WER por enunciado (%) | CER por enunciado (%) | Bucles |
|---|---|---|---|---|---|
| test (9 hablantes) | 40,5 | 12,0 | 41,0 | 12,6 | 0 |
| dev (6 hablantes) | 42,6 | 18,5 | 41,0 | 19,1 | 0 |
| test, normalizador estilo CDLI | 38,0 | 11,6 | 39,0 | no disponible | 0 |

El propio autor advierte que, con solo 9 hablantes de test, no se pueden confirmar diferencias inferiores a unos 3 puntos de WER entre dos modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 580,5 M de parámetros, en fp32 los pesos ocupan aproximadamente 2,3 GB y en fp16/bf16 alrededor de 1,2 GB, a lo que hay que sumar activaciones y buffers de audio.
- GPU recomendadas: no disponibles en la documentación; por tamaño, cualquier GPU con al menos 4-6 GB de VRAM libre debería poder ejecutar el modelo en precisión reducida.
- Cabe en GPU de consumo: previsiblemente sí (por ejemplo, RTX 3060, RTX 4060, RTX 4090), aunque el autor no publica requisitos ni pruebas de despliegue.
- Opciones de despliegue: transformers (librería declarada) y endpoints compatibles (tag `endpoints_compatible`); no se documentan recetas para vLLM, llama.cpp, Ollama ni TGI, ni formatos GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Rendimiento documentado | Disponibilidad |
|---|---|---|---|---|---|---|
| w2vbert-ky-ft-10ep-s3 | 580,5 M | no disponible | rw | CC-BY-4.0 | WER test 40,5 % (pooled), CER 12,0 % | Hugging Face, 138 descargas |
| badrex/w2v-bert-2.0-kinyarwanda-asr (modelo base) | no disponible | no disponible | rw | no disponible | no disponible en la información proporcionada | Hugging Face |
| Modelos ASR multilingües tipo Whisper | no disponible | no disponible | multilingüe | no disponible | no disponible en la información proporcionada | no disponible |

No se dispone de datos comparativos adicionales en la información proporcionada. El autor solo aporta una comparación cualitativa: los modelos CTC no pueden entrar en bucles de repetición, un fallo documentado en Whisper.

## Limitaciones y advertencias

- Pocos hablantes y condiciones estrechas: 9 hablantes de test, mayoritariamente hombres adultos jóvenes, grabaciones en interiores silenciosos, habla leída y descrita a partir de imágenes, no conversacional. El rendimiento en niños, otras discapacidades, entornos ruidosos, audio telefónico o habla con cambio de código es desconocido.
- Objetivos literales: las repeticiones por tartamudeo se escriben en las transcripciones, y el modelo puede reproducirlas o no; los bloqueos y prolongaciones no son visibles en el texto.
- Las frases leídas son más fáciles: aparecen también en las transcripciones de entrenamiento, por lo que los resultados con descripciones de imágenes son la mejor guía para habla abierta.
- No usar para tomar decisiones sobre personas: prohibido diagnosticar o evaluar cualquier condición del habla, identificar hablantes o emplearlo en contextos clínicos, legales o de aplicación de la ley. Los términos del CDLI prohíben reidentificar hablantes y construir voces que imiten a una persona.
- Una transcripción errónea puede cambiar el significado de lo dicho: mostrar el texto al hablante antes de actuar sobre él.
- Licencia CC-BY-4.0: permite uso comercial con atribución, pero el acceso al dataset CDLI está restringido y no se puede redistribuir desde este repositorio.
- El repositorio ocupa 69,7 GB, muy por encima del tamaño de los pesos, por lo que la descarga completa incluye artefactos de entrenamiento innecesarios para inferencia; los pesos útiles están en `best/`.
- No se documentan sesgos específicos más allá de la composición demográfica descrita; no hay datos sobre calibración de confianza ni sobre umbrales de rechazo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/oluwagbotty/w2vbert-ky-ft-10ep-s3
- Modelo base: https://huggingface.co/badrex/w2v-bert-2.0-kinyarwanda-asr
- Dataset: https://huggingface.co/datasets/cdli/rwandan_kinyarwanda_nonstandard_speech_v1.0
- Código de entrenamiento: `scripts/molab/run_experiments.py` y `experiments/finetune.yaml` del repositorio del proyecto (no se proporciona URL)
- Paper, blog o demo: no disponible
