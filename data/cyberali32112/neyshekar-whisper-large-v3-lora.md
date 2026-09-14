# cyberali32112/neyshekar-whisper-large-v3-lora

## Resumen

Neyshekar Whisper large-v3 LoRA es un adaptador LoRA (PEFT) entrenado sobre el modelo base `openai/whisper-large-v3` para reconocimiento automatico del habla (ASR) en persa (farsi). Lo publica el usuario `cyberali32112` en HuggingFace y se apoya en el corpus Neyshekar v4 Persian ASR (`shekar-ai/neyshekar-v4-persian-asr-fa`), del que se usaron 33.432 muestras de entrenamiento y 5.900 de validacion, depuradas a partir de 40.008 filas en bruto. El adaptador anade 15.728.640 parametros entrenables sobre los 1.559.219.200 del modelo base, es decir, un 1,01 % del total.

El problema que resuelve es concreto: Whisper large-v3 rinde mal en persa sin ajuste, con un WER normalizado del 36,97 % sobre el mismo subconjunto de 200 locuciones. Con el adaptador, ese WER baja al 8,74 % y el CER del 8,80 % al 2,14 %. Sobre la particion completa de validacion (5.900 filas) el autor declara WER 8,05 % y CER 2,00 %. Ademas de la mejora numerica, el ajuste ensena convenciones ortograficas persas que el base no aplica: cero digitos en las predicciones (frente a 4 en el base) y uso del zero-width non-joiner (ZWNJ) en 116 predicciones (el base no emitia ninguno).

Es relevante porque demuestra que un ajuste QLoRA barato (14 h 19 min en una sola NVIDIA L4 con un pico de 5,51 GiB) puede reducir el error de un modelo de 1,55 B en un idioma de bajos recursos sin tocar el modelo completo. El repositorio pesa 0,2 GB, la licencia es Apache 2.0 y el pipeline declarado es `automatic-speech-recognition`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper) con adaptador LoRA sobre las proyecciones `q_proj` y `v_proj` |
| Parametros totales | 1.559.219.200 (modelo base Whisper large-v3) |
| Parametros activos | No aplica: no es un modelo MoE |
| Parametros entrenables | 15.728.640 (1,01 % del total) |
| Longitud de contexto | No disponible en la informacion proporcionada; el modelo base Whisper procesa ventanas de audio de 30 s |
| Tipos de cuantizacion | Entrenamiento en 4-bit NF4 con doble cuantizacion y computo fp16; el adaptador se distribuye en safetensors sin cuantizar. No se publican variantes GGUF ni otras |
| Idiomas soportados | Persa (farsi, `fa`) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (adaptador PEFT/LoRA) |
| Tamano del repositorio | 0,2 GB |
| Libreria | PEFT (compatible con transformers) |
| Modelo base | openai/whisper-large-v3 |
| Dataset de entrenamiento | shekar-ai/neyshekar-v4-persian-asr-fa |

## Arquitectura y entrenamiento

El adaptador se monta sobre Whisper large-v3, un transformer encoder-decoder disenado para transcripcion y traduccion de audio. El ajuste se hizo con QLoRA: el modelo base se carga en 4 bits NF4 con doble cuantizacion y el computo se realiza en fp16. Los hiperparametros del adaptador son `r=32`, `alpha=64` y `dropout=0.05`, aplicados unicamente a las proyecciones `q_proj` y `v_proj`. Esto deja intacta la mayor parte del decodificador, incluido su modelo de lenguaje interno, lo que explica una de las limitaciones declaradas (deriva hacia persa formal en habla coloquial). El entrenamiento uso 33.432 muestras de train y 5.900 de validacion, con 3 epocas, 6.270 pasos de optimizador, batch efectivo de 16 (8 x 2), learning rate de 1e-3, 50 pasos de warmup y decaimiento lineal. La seleccion del mejor checkpoint se hizo por WER, no por perdida.

El preprocesado de audio es parte del pipeline y se reutiliza tal cual en el servicio de inferencia: recorte de silencio al principio y al final de cada locucion (los silencios internos se conservan, por ser habla natural) y normalizacion de pico a -3 dBFS. Ambas decisiones se justifican con medidas sobre el propio corpus. El autor documenta que el 22,10 % del corpus satura en el techo digital, un defecto que la normalizacion no puede reparar. En cuanto a infraestructura, el entrenamiento completo corrio en una unica NVIDIA L4 con 22,03 GiB de VRAM y un pico de uso de 5,51 GiB, durante 14 h 19 min. La comparacion con el modelo base se hizo con carga de 4 bits, preprocesado y ajustes de generacion identicos, de modo que el adaptador es la unica variable.

## Capacidades

- Transcripcion de audio en persa (farsi) a texto, con el token de idioma fijado a `persian` y tarea `transcribe`.
- Reduccion drastica del error respecto al modelo base sin ajustar en el mismo dominio: WER normalizado del 8,74 % frente al 36,97 % en 200 locuciones identicas.
- Transcripcion exacta en el 57,5 % de las 200 locuciones evaluadas, frente al 11,5 % del base.
- Normalizacion numerica: el adaptador no emite digitos, coherente con las etiquetas de entrenamiento, donde los numeros estan escritos con palabras (el base emitia digitos en 4 de 200 casos).
- Uso correcto del zero-width non-joiner (ZWNJ): 116 predicciones con ZWNJ frente a 0 del base y 118 en las referencias.
- Inferencia en 4 bits sobre el modelo base, lo que permite ejecutarlo en GPU de gama media.
- Empaquetado como servicio HTTP con Docker (`POST /transcribe` con un fichero de audio), listo para desplegar sin instalar dependencias manualmente.
- No se declaran capacidades de tool calling, function calling, agentes, vision, audio aparte del ASR, ni modo de razonamiento explicito.

## Casos de uso

- Transcripcion de archivos de audio en persa para medios y productoras: el adaptador reduce el WER a menos de la mitad del base en habla del corpus, lo que baja el coste de revision humana posterior.
- Generacion de subtitulos para plataformas de video en farsi: el uso consistente del ZWNJ y la ausencia de digitos en la salida reducen la limpieza posterior necesaria antes de publicar subtitulos.
- Archivado y busqueda de grabaciones historicas en persa: transcripcion por lotes con el modelo en 4 bits permite procesar volumenes altos en una sola GPU de 8-12 GB.
- Asistentes de voz o IVR en persa con despliegue en servidor propio: el servicio Docker del repositorio expone un endpoint HTTP que se puede integrar detras de un motor de dialogos, con el modelo residente en memoria.
- Investigacion en ASR de bajos recursos: el repositorio incluye artefactos por locucion (`run_artifacts/error_analysis.csv` y `error_analysis_zeroshot.csv`) que permiten reproducir y auditar cada cifra, util para comparar variantes de QLoRA.
- Aprendizaje y ensenanza del persa: transcripcion de material oral con ortografia normalizada (ZWNJ, numeros en palabras) que sirve como texto de apoyo.
- Sistemas de accesibilidad para hablantes de persa: dictado y transcripcion en tiempo casi real cuando el audio no supera los 30 s por segmento del modelo base.
- Punto de partida para ajustes sobre otros dominios persas: al ser un adaptador PEFT, se puede combinar o reentrenar manteniendo el mismo pipeline de preprocesado.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente; `verified: false`).

| Metrica | Dataset / particion | Valor |
|---|---|---|
| WER | Neyshekar v4 Persian ASR, validation (5.900 filas) | 8,05 % |
| CER | Neyshekar v4 Persian ASR, validation (5.900 filas) | 2,00 % |

Comparacion directa base frente a adaptador sobre el mismo subconjunto de 200 locuciones:

| Metrica (200 locuciones) | Modelo base | Con adaptador | Cambio |
|---|---:|---:|---:|
| WER de corpus, normalizado | 36,97 % | 8,74 % | -28,2 puntos |
| CER de corpus, normalizado | 8,80 % | 2,14 % | -6,7 puntos |
| Transcritas exactamente | 23 (11,5 %) | 115 (57,5 %) | 5x mas |
| Predicciones con algun digito | 4 | 0 | eliminados |
| Predicciones con ZWNJ | 0 | 116 | convencion aprendida |

No se han publicado resultados de benchmarks en la informacion disponible para MMLU, HumanEval, GSM8K ni para otros conjuntos de ASR distintos del corpus Neyshekar. El propio autor advierte que la particion de validacion solapa por transcripcion con el entrenamiento en un 51,9 %, por lo que la cifra de 8,05 % debe interpretarse como in-domain.

## Requisitos de hardware

- Adaptador: 0,2 GB en disco (safetensors). Se anade al modelo base, que es el que domina el consumo.
- Pesos del base Whisper large-v3 en fp16: aproximadamente 3,1 GB. En 4 bits NF4, en torno a 1,5-2 GB. No se proporcionan cifras oficiales de VRAM total en la informacion disponible.
- VRAM estimada para inferencia con el base en fp16 y ventanas de 30 s: del orden de 6-10 GB incluyendo activaciones; en 4 bits baja aproximadamente a 3-5 GB. Estas cifras son estimaciones de orden de magnitud, no datos publicados por el autor.
- GPU de referencia usada en entrenamiento: una NVIDIA L4 (22,03 GiB), con pico real de 5,51 GiB.
- GPU recomendadas para produccion: L4, A10, A100 o H100 para lotes grandes; RTX 4090 para inferencia de baja latencia.
- Cabe en GPU de consumo: si, con el base cuantizado a 4 u 8 bits cabe en tarjetas de 8-12 GB (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 3080, RTX 4090). En fp16 completo conviene disponer de 10-12 GB o mas.
- Opciones de despliegue: `transformers` + `peft` (patron documentado en la model card), servicio HTTP ya empaquetado con Docker en el repositorio, y alternativas genericas para Whisper como vLLM, TGI, faster-whisper o whisper.cpp previa fusion del adaptador en el modelo base (el adaptador no se distribuye en GGUF).
- Latencia y throughput: no disponibles en la informacion proporcionada. El unico dato temporal publicado es el coste de entrenamiento (14 h 19 min en una L4).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / audio | WER (200 locuciones, mismo setup) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| neyshekar-whisper-large-v3-lora | 1,559 M base + 15,7 M adaptador | Ventanas de 30 s del base | 8,74 % | Apache 2.0 | HuggingFace (PEFT) |
| openai/whisper-large-v3 (base) | 1.559 M | Ventanas de 30 s | 36,97 % | Apache 2.0 | HuggingFace |
| Otros adaptadores o modelos ASR para persa | No disponible | No disponible | No disponible | No disponible | No disponible |

La informacion proporcionada no incluye comparaciones con alternativas especificas para ASR en persa (por ejemplo, ajustes de Whisper medium, modelos de terceros o sistemas comerciales), por lo que no se pueden tabular cifras de esos competidores.

## Limitaciones y advertencias

- Solapamiento entre validacion y entrenamiento: el 51,9 % de las transcripciones de validacion aparecen tambien en el split de entrenamiento con audio distinto. El split es disjunto por grabacion, pero no por frase; la perdida de validacion es optimista y el 8,05 % de WER debe tratarse como cifra in-domain.
- Error residual de convenciones ortograficas: el analisis manual de 156 eventos de error indica que el 25,6 % son reglas de espaciado de compuestos persas y letras homofonas, no fallos de audicion. Normalizar el ZWNJ al puntuar mueve el WER 0,53 puntos.
- Deriva de registro: el habla coloquial tiende a transcribirse en persa formal escrito, porque el adaptador solo toca las proyecciones de query y value y deja casi intacto el modelo de lenguaje del decodificador.
- Audio saturado no recuperable: el 22,10 % del corpus llega al techo digital y esa informacion se ha perdido; la normalizacion aplicada no la restaura.
- Entorno de entrenamiento no reproducible: no se capturo un `pip freeze` antes de liberar la maquina; el log establece transformers 5.x, pero no hay detalle mas fino.
- Idiomas: el modelo esta ajustado exclusivamente para persa. El token de idioma debe fijarse a `persian`; usarlo con otros idiomas no esta soportado ni evaluado.
- Confusion de identificadores: la ficha de HuggingFace corresponde a `cyberali32112/neyshekar-whisper-large-v3-lora`, mientras que el ejemplo de codigo de la model card referencia `hosseinzr/neyshekar-whisper-large-v3-lora`. Conviene verificar cual es el repositorio canonico antes de integrarlo en produccion.
- Licencia: Apache 2.0 permite uso comercial, pero al derivar de Whisper large-v3 conviene revisar tambien las condiciones del modelo base y del dataset Neyshekar.
- Metricas no verificadas: los valores de WER y CER estan marcados como `verified: false` en la model-index; no hay evaluacion de terceros.
- Riesgo de alucinacion: no se documenta de forma especifica. En ASR, el fenomeno equivalente son sustituciones o repeticiones en audio ruidoso o fuera de dominio, no evaluadas en la informacion disponible.
- Madurez y adopcion: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, y no se han encontrado referencias externas que lo avalen.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/cyberali32112/neyshekar-whisper-large-v3-lora
- Modelo base: https://huggingface.co/openai/whisper-large-v3
- Dataset de entrenamiento: https://huggingface.co/datasets/shekar-ai/neyshekar-v4-persian-asr-fa
- Repositorio con codigo, documentos de analisis y demo: https://github.com/hosseinzzare/neyshekar_asr
- Referencia alternativa del adaptador citada en la model card: https://huggingface.co/hosseinzr/neyshekar-whisper-large-v3-lora
- Resultados de busqueda web: no se han encontrado enlaces relevantes sobre este modelo; las busquedas devolvieron unicamente paginas genericas de Facebook, sin relacion con el modelo.
