# Ineeoluwa/whisper-tiny-yoruba-waxal-research

## Resumen

Whisper-tiny-yoruba-waxal-research es un checkpoint de investigacion publicado por el autor Ineeoluwa (usuario de HuggingFace) que consiste en un ajuste fino de `openai/whisper-tiny` sobre el subconjunto yoruba del corpus `google/WaxalNLP`. El modelo se distribuye como un artefacto reproducible de un estudio en curso sobre preservacion de tonos, decodificacion y compresion en reconocimiento automatico del habla (ASR) para yoruba, una lengua tonal de Nigeria. No es un modelo orientado a produccion: el propio autor lo presenta explicitamente como un checkpoint de investigacion con un resultado medido y debil.

La relevancia del modelo es metodologica mas que de rendimiento. Publica de forma transparente un WER del 88,76 % sobre las 177 grabaciones del split de test completo de WAXAL Yoruba, un resultado que el autor reconoce que no supera la linea base de MMS Yoruba del mismo estudio (58,41 % WER). El valor esta en que hace reproducible un checkpoint seleccionado por validacion (paso 800, WER de validacion 61,0785 %), junto con hashes, identidades de test y ficheros de evaluacion, para estudiar efectos de tono y compresion.

Arquitectonicamente es un transformer encoder-decoder de tipo Whisper con 37.760.640 parametros, licencia CC BY-SA 4.0 y pesos en safetensors. El repositorio ocupa 0,2 GB y acumula 28 descargas en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper tiny) |
| Parametros totales | 37.760.640 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (Whisper tiny usa ventanas de audio de 30 s; el valor exacto no se detalla en la informacion proporcionada) |
| Tipos de cuantizacion | no disponible (el repo distribuye pesos en safetensors; no se documentan variantes GGUF/INT8) |
| Idiomas soportados | yoruba (yo) |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `openai/whisper-tiny` en la revision `169d4a4341b33bc18d8881c4b69c2e104e1cc0af`, un transformer encoder-decoder con atencion estandar y decodificacion autorregresiva, disenado originalmente por OpenAI para transcripcion multilingue. El ajuste fino se realizo sobre `google/WaxalNLP`, configuracion `yor_tts`, revision `5f4d8ca24f2b9d168b2ee545f1febaaff4b40580`. Es importante notar que se trata de un corpus TTS reutilizado para ASR, no de un subconjunto oficial de ASR yoruba de WAXAL.

Los splits originales contienen 2.233 clips de entrenamiento (19,169 h), 201 de validacion (1,785 h) y 177 de test (1,562 h). Tras eliminar solapamientos de transcripciones en entrenamiento quedan 2.216 clips; tras aplicar filtrado por duracion y contexto de la locucion completa se retienen 1.691 clips de entrenamiento y 156 de validacion. El audio largo no se recorta bajo una etiqueta completa. El entrenamiento se ejecuto en una unica GPU T4 visible en Kaggle v6, con precision mixta fp16, semilla 2026, learning rate 1e-5, batch de cuatro con acumulacion de gradiente de cuatro pasos, 100 pasos de warmup y 2.000 pasos totales de optimizador. Se activo gradient checkpointing no reentrante. La validacion y el guardado de checkpoints se ejecutaron cada 100 pasos. El checkpoint del paso 800 fue el de menor WER de validacion retenida (61,0785 %), y no fue seleccionado por el split de test.

No se documenta en la informacion disponible el uso de RLHF, DPO ni tecnicas de decodificacion especulativa. El interes tecnico del release reside en la trazabilidad: ficheros `selection.json`, `evaluation.json` y `release-manifest.json` con hashes SHA256, identidad completa del test e historial de entrenamiento.

## Capacidades

- Reconocimiento automatico del habla (ASR) para yoruba, con transcripcion de audio a texto mediante el pipeline `automatic-speech-recognition` de Transformers.
- Decodificacion condicionada por idioma y tarea (`language="yo"`, `task="transcribe"`).
- Manejo parcial de diacriticos y marcas de tono del yoruba, aunque el propio autor advierte que Whisper puede omitirlos o alucinar texto.
- Soporte de inferencia en CPU (`device=-1`) y en GPU.
- No se documenta soporte de tool calling, function calling, agentes, vision, audio de entrada mas alla del propio ASR ni modos de razonamiento extendido.
- Capacidad multilingue limitada al yoruba en la practica; el modelo base es multilingue, pero el ajuste fino y la evaluacion se centran exclusivamente en `yo`.

## Casos de uso

- Investigacion reproducible sobre preservacion de tonos: el checkpoint permite repetir el experimento de ajuste fino y comparar el WER del 88,76 % con las metricas de tono condicional (37,17 % de TER explicito) usando los ficheros de evaluacion publicados.
- Estudio de efectos de compresion y coste: el autor indica que el estudio completo de compresion y coste sigue en curso; este checkpoint sirve como punto de partida medido para analizar el impacto de la cuantizacion o conversion en el WER.
- Analisis de errores en ASR de lenguas tonales: los investigadores pueden inspeccionar que palabras y tonos fallan con mayor frecuencia, dado que el modelo publica cobertura de palabras emparejadas (31,70 %) y de tonos emparejados (27,45 %).
- Comparacion de lineas base: util como referencia negativa frente a MMS Yoruba (58,41 % WER) en estudios comparativos de arquitecturas para yoruba.
- Docencia y divulgacion: ejemplo realista de un ajuste fino de Whisper con resultados publicados de forma transparente, incluido un resultado debil, para ensenar practicas de evaluacion y seleccion de checkpoints.
- Pruebas de integracion del pipeline de Transformers: validacion de carga, decodificacion y ejecucion del pipeline ASR con `language="yo"` en entornos de desarrollo, sin pretension de calidad de transcripcion.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---:|
| Grabaciones de test | 177 |
| Duracion de audio | 5.622,144 s |
| WER con tonos eliminados | 88,7646 % |
| Tasa de error de secuencia de tono explicito condicional | 37,1726 % |
| Cobertura de palabras emparejadas | 31,6960 % |
| Cobertura de tonos de referencia emparejados | 27,4512 % |
| WER de validacion del checkpoint seleccionado (paso 800) | 61,0785 % |
| WER de la linea base MMS Yoruba del estudio | 58,41 % |

El WER elimina unicamente las marcas combinantes Unicode grave y aguda tras NFD; los underdots del yoruba se conservan. La tasa de error de tono explicito condicional solo cuenta ediciones en secuencias de tono explicitas para palabras emparejadas tras eliminar tonos, y excluye del denominador las palabras no emparejadas, por lo que no es una medida de precision tonal sobre toda la transcripcion. Los tonos medios no marcados no se puntuan directamente. No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estandar en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo de 37,7 M de parametros, la inferencia en fp16 requiere del orden de decenas de MB de pesos; con overhead de activaciones y decodificacion, cabe holgadamente en cualquier GPU consumer con 2 GB o mas. No se dispone de cifras oficiales de VRAM en la informacion proporcionada.
- GPU recomendadas: cualquier GPU consumer moderna (por ejemplo, RTX 3060, RTX 4060, RTX 4090) es sobradamente suficiente; tambien funciona en CPU, como muestra el ejemplo del autor con `device=-1`.
- Cabe en GPU consumer: si, en practicamente todas las GPU consumer actuales e incluso en entornos integrados.
- Opciones de despliegue: pipeline `automatic-speech-recognition` de Transformers (version 4.57.6 segun el autor), con PyTorch y FFmpeg para decodificacion de ficheros. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI en la informacion disponible.
- Latencia y throughput: no disponibles. El autor advierte que los tiempos en GPU del modelo fuente no constituyen una medida de coste de servicio en CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | WER yoruba | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ineeoluwa/whisper-tiny-yoruba-waxal-research | 37,7 M | no disponible | 88,76 % (test WAXAL, tonos eliminados) | CC BY-SA 4.0 | HuggingFace |
| MMS Yoruba (linea base del estudio) | no disponible | no disponible | 58,41 % | no disponible | no disponible |
| openai/whisper-tiny (base) | 37,7 M | ventana de audio de 30 s | no disponible en la informacion | Apache 2.0 | HuggingFace |

La comparativa se limita a los datos publicados en la model card. No se dispone de resultados de otros modelos ASR para yoruba en la informacion proporcionada.

## Limitaciones y advertencias

- El propio autor declara que el checkpoint no esta validado como reconocedor de produccion y que un WER del 88,76 % no es evidencia de reconocimiento preciso del yoruba.
- No supera la linea base MMS Yoruba del estudio (58,41 % WER).
- Ocho hablantes se solapan entre los splits de origen, por lo que los resultados no demuestran generalizacion a hablantes no vistos, dialectos, conversaciones con ruido ni usuarios reales.
- El corpus es un TTS guionizado y pequeno, y se excluyeron clips largos de entrenamiento, lo que limita la interpretacion.
- La baja cobertura de tonos emparejados (27,45 %) puede hacer enganosa la tasa de error de tono condicional.
- Whisper puede alucinar texto u omitir diacriticos; se requiere revision humana de los errores.
- Usos medicos, legales, financieros, de control de acceso u otros de consecuencias graves no han sido validados.
- La licencia CC BY-SA 4.0 impone atribucion y compartir bajo la misma licencia las obras derivadas; se deben conservar los avisos Apache 2.0 y MIT de los componentes upstream.
- No se redistribuyen las grabaciones ni transcripciones crudas de WAXAL.
- El estudio completo de compresion y coste sigue pendiente, asi como la revision humana de los errores de habla.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Ineeoluwa/whisper-tiny-yoruba-waxal-research
- Repositorio del estudio: https://github.com/Eunini/yoruba-asr-tone-compression
- Modelo base: https://huggingface.co/openai/whisper-tiny
- Dataset: https://huggingface.co/datasets/google/WaxalNLP
