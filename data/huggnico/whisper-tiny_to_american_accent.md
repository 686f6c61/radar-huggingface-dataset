# huggnico/whisper-tiny_to_american_accent

## Resumen

Whisper tiny american es un ajuste fino (fine-tuning) del modelo openai/whisper-tiny, publicado por el usuario huggnico en Hugging Face. Se trata de un modelo de reconocimiento automatico del habla (ASR) especializado en acento estadounidense, entrenado sobre un dataset denominado american_english. Con 37,7 millones de parametros, hereda la arquitectura encoder-decoder transformer propia de la familia Whisper de OpenAI, disenada originalmente para transcripcion multilingue y traduccion de voz.

El modelo resuelve la tarea de transcripcion de audio a texto en ingles, con un enfasis declarado en el acento americano. Su principal interes practico radica en que parte de la variante tiny de Whisper, lo que lo hace extremadamente ligero (repo de 0,3 GB) y apto para despliegues con recursos muy limitados, como dispositivos de borde o prototipado rapido. El ajuste fino busca mejorar la precision sobre el dominio especifico del acento americano frente al modelo base generico.

La relevancia de esta ficha es acotada: se trata de un modelo experimental con cero descargas y cero likes en el momento de su publicacion, generado automaticamente desde el Trainer de Hugging Face, con documentacion minima ("More information needed" en varias secciones de la model card) y un unico resultado de benchmark no verificado (WER de 9,12 sobre el split de test del dataset american_english). Debe evaluarse como un artefacto de investigacion mas que como un modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper tiny) |
| Parametros totales | 37.760.640 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (ventana de audio de 30 s propia de Whisper) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; compatible con cuantizacion estandar de transformers) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura Whisper en su variante tiny: un transformer encoder-decoder con mecanismo de atencion estandar, preprocesamiento de audio mediante espectrogramas Mel y decodificacion autoregresiva de tokens de texto. El modelo base openai/whisper-tiny fue entrenado originalmente por OpenAI sobre cientos de miles de horas de audio con supervision debil; este ajuste fino parte de esos pesos y los adapta al dominio del acento americano.

El entrenamiento se realizo con el Trainer de Hugging Face sobre el dataset american_english, con los siguientes hiperparametros declarados: learning rate de 1e-05, batch de entrenamiento de 2, batch de evaluacion de 1, semilla 42, optimizador AdamW fused con betas (0,9; 0,999) y epsilon 1e-08, scheduler lineal con 500 pasos de warmup y un total de 2000 pasos de entrenamiento. La model card reporta dos puntos de control: en el paso 1000 (epoca 0,95) se obtuvo una perdida de validacion de 0,2031 y un WER de 10,8774; en el paso 2000 (epoca 1,89) la perdida bajo a 0,1866 y el WER a 9,1191. No se documentan tecnicas adicionales como RLHF, DPO o decodificacion especulativa. El entorno de entrenamiento fue Transformers 5.23.0.dev0, PyTorch 2.11.0+cu130, Datasets 5.1.0 y Tokenizers 0.23.3.

## Capacidades

- Reconocimiento automatico del habla (ASR) en ingles, con especializacion declarada en acento americano.
- Transcripcion de audio a texto con la ventana de 30 segundos caracteristica de Whisper (procesamiento por segmentos).
- Generacion de texto a partir de la salida del decoder, heredada del modelo base.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: limitadas al ingles segun la model card (el modelo base soporta mas idiomas, pero el ajuste fino esta orientado a en).
- Capacidades especiales (modo thinking, vision, audio de entrada): solo audio de entrada; sin vision ni modo thinking.

## Casos de uso

- Transcripcion de reuniones y notas de voz en ingles americano: el modelo puede convertir audio de hasta 30 segundos por segmento en texto, adecuado para prototipos de actas automaticas con acento estadounidense.
- Subtitulado automatico de contenido audiovisual en ingles: util para generar subtitulos en pipelines de bajo coste donde la precision absoluta no es critica y prima la ligereza del modelo.
- Prototipado rapido de interfaces de voz: al ocupar apenas 0,3 GB, permite iterar en local sobre un portatil sin GPU dedicada antes de escalar a un modelo mayor.
- Despliegue en dispositivos de borde: su tamano reducido (37,7 M de parametros) lo hace candidato para Raspberry Pi o moviles en tareas de dictado simple en ingles.
- Evaluacion comparativa de ajustes finos: sirve como referencia para estudiar como un fine-tuning ligero sobre whisper-tiny afecta al WER en dominios acotados.
- Filtrado y pre-etiquetado de datasets de audio: puede usarse para transcribir grandes volumenes de audio americano a bajo coste antes de una revision humana.
- Investigacion sobre sesgos de acento en ASR: permite analizar el comportamiento del modelo frente a distintos acentos dentro del ingles.

## Benchmarks y rendimiento

Datos declarados por el autor en la model card (no verificados):

| Metrica | Dataset | Split | Valor |
|---|---|---|---|
| WER | american_english | test | 9,1191 |
| Loss (validacion) | american_english | test | 0,1866 |

Evolucion durante el entrenamiento:

| Paso | Epoca | Training loss | Validation loss | WER |
|---|---|---|---|---|
| 1000 | 0,9452 | 0,1602 | 0,2031 | 10,8774 |
| 2000 | 1,8904 | 0,0606 | 0,1866 | 9,1191 |

No se han publicado resultados comparativos con otros modelos en la informacion disponible. El unico dato de referencia es el WER de 9,12 sobre el split de test del dataset american_english, marcado como no verificado.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 (37,7 M de parametros, aproximadamente 150 MB de pesos); en fp16 o int8 se reduce a decenas de MB.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; el modelo cabe holgadamente en una GTX 1650, RTX 3060 o superior. Tambien puede ejecutarse en CPU.
- Cabe en consumer GPU: si, en practicamente cualquier GPU consumer e incluso en CPU y dispositivos de borde.
- Opciones de despliegue: transformers (pipeline automatic-speech-recognition), vLLM (soporte limitado para Whisper), llama.cpp (no aplica a Whisper), Ollama (no soportado de forma nativa), TGI (soporte limitado), faster-whisper y whisper.cpp como alternativas optimizadas para la familia Whisper.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada; por el tamano del modelo se espera latencia muy baja en GPU y moderada en CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / audio | WER declarado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| huggnico/whisper-tiny_to_american_accent | 37,7 M | ventana de 30 s (Whisper) | 9,12 (american_english, no verificado) | apache-2.0 | Hugging Face |
| openai/whisper-tiny | 39 M aprox. | ventana de 30 s | no disponible en esta ficha | apache-2.0 | Hugging Face |
| openai/whisper-base | 74 M aprox. | ventana de 30 s | no disponible en esta ficha | apache-2.0 | Hugging Face |
| openai/whisper-small | 244 M aprox. | ventana de 30 s | no disponible en esta ficha | apache-2.0 | Hugging Face |

La comparativa se limita a la familia Whisper por ser el mismo linaje arquitectonico. No se dispone de datos de benchmarks de los modelos alternativos en la informacion proporcionada, por lo que no es posible establecer una comparacion cuantitativa de rendimiento.

## Limitaciones y advertencias

- Modelo experimental con cero descargas y cero likes en el momento de la publicacion; no hay evidencia de uso en produccion.
- La model card esta generada automaticamente y contiene secciones sin completar ("More information needed"), lo que impide conocer la composicion exacta del dataset de entrenamiento.
- El unico resultado de benchmark (WER 9,12) esta marcado como no verificado por el autor.
- Entrenado unicamente sobre ingles americano; su rendimiento en otros acentos o idiomas no esta documentado y probablemente sea deficiente.
- Riesgo de alucinacion de texto en segmentos de audio con ruido o silencio, comportamiento conocido en la familia Whisper.
- Sesgos conocidos: no documentados; al derivar de whisper-tiny hereda los sesgos del modelo base de OpenAI, no evaluados en esta ficha.
- Restricciones de licencia: apache-2.0 permite uso comercial, pero el autor no documenta condiciones adicionales ni procedencia exacta de los datos de entrenamiento.
- Limitacion de contexto: ventana de audio de 30 segundos por segmento, propia de Whisper; para audio mas largo requiere segmentacion manual.
- No se documentan capacidades de tool calling, agentes ni razonamiento multi-paso; no debe asumirse que las soporte.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/huggnico/whisper-tiny_to_american_accent
- Modelo base: https://huggingface.co/openai/whisper-tiny
- Repositorio de referencia de Whisper (OpenAI): https://github.com/openai/whisper
- Paper de Whisper: https://arxiv.org/abs/2212.04356
- Documentacion de transformers para ASR: https://huggingface.co/docs/transformers/tasks/asr
- faster-whisper: https://github.com/SYSTRAN/faster-whisper
- whisper.cpp: https://github.com/ggerganov/whisper.cpp
