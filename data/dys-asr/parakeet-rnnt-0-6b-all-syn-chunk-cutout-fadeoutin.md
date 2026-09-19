# dys-asr/parakeet-rnnt-0.6b-all-syn-chunk-cutout-fadeoutin

## Resumen

Parakeet RNN-T 0.6B — FadeOutIn es un modelo de reconocimiento automatico del habla (ASR) en ingles, desarrollado por el usuario dys-asr, especializado en habla con disartria y trastornos del habla. Se trata de un ajuste fino del modelo extraordinarylab/parakeet-unified-en-0.6b, un transductor RNN-T (recurrent neural network transducer) de 618.314.241 parametros con cabecera CTC/transducer, y su proposito es servir como entrada de competicion en el Speech Accessibility Project Challenge, en su modalidad de corpus restringido (constrained track).

El modelo reproduce diez epocas del entrenamiento publicado en dys-asr/parakeet-rnnt-0.6b-all-syn-chunk-cutout, anadiendo unicamente el aumento de datos FadeOutIn descrito por Mengke y Mihajlik en el Journal on Audio, Speech, and Music Processing (2026). La relevancia actual reside en que el habla atipica es un dominio donde los sistemas ASR comerciales fallan sistematicamente, y este modelo aporta un punto de comparacion reproducible sobre corpus SAPC-1 y SAPC-2 con licencia de uso restringida.

El rendimiento declarado es de 6,21% de CER en el split de desarrollo completo (17.492 enunciados) y 6,07% en un subconjunto de 4.000 enunciados. El propio autor advierte que la mejora frente a la linea base (6,25% y 6,06% respectivamente) esta dentro del ruido de una unica semilla, por lo que no debe interpretarse como una jerarquia entre metodos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con cabecera RNN-T (transducer), familia Parakeet |
| Parametros totales | 618.314.241 (0,6B), segun safetensors |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica como contexto de texto; entrenado con segmentos de audio de 0,5 a 45 s y hasta 200 tokens de etiqueta |
| Tipos de cuantizacion | No disponible (el repositorio solo publica pesos en safetensors) |
| Idiomas soportados | Ingles (en) unicamente |
| Licencia | speech-accessibility-project-dua (campo `license: other`) |
| Formato de pesos | safetensors; tamano del repositorio 2,5 GB |
| Libreria | transformers (requiere `transformers>=5.9`) |
| Entrada de audio | 16 kHz, mono |
| Modelo base | extraordinarylab/parakeet-unified-en-0.6b |
| Pipeline | automatic-speech-recognition |

## Arquitectura y entrenamiento

La arquitectura es un transductor RNN-T construido sobre el modelo Parakeet unificado en ingles de 0,6B parametros, cargable en transformers mediante la clase `ParakeetForRNNT` junto a `AutoProcessor`. La decodificacion es autorregresiva, lo que el propio autor senala como una desventaja de velocidad frente a las cabeceras CTC. El repositorio incluye tambien la etiqueta `feature-extraction`, ademas de `automatic-speech-recognition`, `dysarthria`, `disordered-speech`, `accessibility`, `constrained-track` y `fadeoutin`.

El entrenamiento consta de diez epocas sobre dieciseis GH200, con batch efectivo 32 (2 por dispositivo), optimizador AdamW a 1e-4 y schedule tri-stage (10% de calentamiento, 40% de mantenimiento), weight decay 0,01, layerdrop 0,05, gradient clipping 1,0, precision bf16, semilla 42 y 144.750 pasos de optimizador. El corpus es identico al del run de referencia: 250.014 registros de SAPC-1 (train y dev), 153.500 de SAPC-2 train, 55.988 de habla sintetica generada con CosyVoice3 y 8.933 fragmentos alineados forzosamente extraidos de grabaciones demasiado largas, sumando 468.435 registros antes de filtrado y 463.177 tras aplicar los filtros de 0,5-45 s y 200 tokens de etiqueta. No se emplea ningun dato externo a los corpus del desafio, de ahi la etiqueta de constrained track.

El aumento de datos combina perturbacion de velocidad en linea entre 0,8 y 1,2, SpecAugment (5% del eje temporal en tramos de 10 frames y 40% del eje mel en tramos de 27 bins) y SpecCutout (dos rectangulos de 20x20). La innovacion respecto al run base es FadeOutIn, implementado a partir del codigo de referencia de los autores y no de la prosa del articulo: dieciseis segmentos por enunciado, cada uno abarcando un 2% del mismo, con inicio muestreado uniformemente y rampas lineales de 1 a 0 y de 0 a 1 en cada mitad, de modo que la senal queda muda en el punto medio. Los segmentos pueden solaparse y, con dieciseis por enunciado, el solapamiento es frecuente, multiplicandose las rampas. La operacion se aplica sobre la forma de onda despues de la perturbacion de velocidad y equivale a un enmascaramiento temporal de SpecAugment con bordes suavizados. No se documenta RLHF ni DPO.

## Capacidades

- Transcripcion de voz a texto en ingles para habla tipica y, sobre todo, habla con disartria y trastornos asociados.
- Reconocimiento de habla atipica dentro del dominio de los corpus SAPC-1 y SAPC-2.
- Salida normalizada en minusculas, sin puntuacion y con los numerales escritos como palabras.
- Procesamiento de audio en formato 16 kHz mono, con enunciados de entre 0,5 y 45 segundos.
- Extraccion de caracteristicas acusticas (etiqueta `feature-extraction` declarada en el repositorio).
- Compatibilidad con endpoints de inferencia (`endpoints_compatible`).
- No se documenta soporte de tool calling ni de function calling.
- No se documenta soporte de agentes ni de razonamiento multi-paso.
- No dispone de capacidades multimodales: ni vision, ni audio de entrada distinto del propio ASR, ni modo de razonamiento explicito.
- Multilingue: no; el modelo es exclusivamente en ingles.

## Casos de uso

- Subtitulado accesible para hablantes con disartria: el modelo transcribe audio de 16 kHz mono en segmentos de hasta 45 segundos, lo que permite generar subtitulos en directo o diferido para personas cuyo habla no es reconocida por sistemas ASR generalistas.
- Preetiquetado de corpus clinicos y linguisticos: los 6,21% de CER sobre el split de desarrollo lo hacen util como paso inicial de anotacion masiva, dejando la correccion humana para una revision posterior mas rapida y barata.
- Comunicacion aumentativa y alternativa (AAC): integrado en un asistente de voz personal, permite que un usuario con disartria active comandos o componga mensajes mediante habla, aprovechando el ajuste especifico sobre este tipo de voz.
- Investigacion comparativa sobre aumento de datos: al ser una replicacion controlada del run sin FadeOutIn, sirve como linea base reproducible para medir el efecto de tecnicas de enmascaramiento temporal suavizado en ASR de habla atipica.
- Documentacion de historiales dictados por pacientes: transcripcion de notas de voz con habla degradada para su posterior revision por personal clinico, con la advertencia de que la salida no tiene valor diagnostico.
- Evaluacion de participantes en el Speech Accessibility Project Challenge: el modelo es una entrada de competicion en la modalidad de corpus restringido y permite comparar recetas de entrenamiento sobre los mismos datos.
- Prototipado de interfaces de voz para accesibilidad en aplicaciones moviles o de escritorio: con 618 millones de parametros, cabe en GPUs de consumo y puede desplegarse localmente sin enviar audio sensible a servicios externos.
- Analisis de inteligibilidad en estudios longitudinales: la tasa de error por caracter sobre grabaciones de un mismo hablante a lo largo del tiempo ofrece una medida objetiva de la evolucion del habla, siempre fuera de cualquier uso diagnostico.

## Benchmarks y rendimiento

El modelo no es un LLM, por lo que no se publican resultados de MMLU, HumanEval o GSM8K. El unico benchmark reportado es la tasa de error por caracter (CER) sobre el split de desarrollo retenido, comparada con el run del que deriva.

| Run | Mejor epoca | CER dev (subconjunto de 4.000 enunciados) | CER dev (split completo, 17.492 enunciados) |
|---|---|---|---|
| Linea base, sin FadeOutIn | 9 | 6,06% | 6,25% |
| Este modelo | 10 | 6,07% | 6,21% |

El autor advierte explicitamente de que ambas columnas deben interpretarse con cautela: el subconjunto y el split completo no coinciden en el orden de los runs de esta familia, la diferencia es inferior a 0,2 puntos de CER y solo hay una semilla por fila. Asimismo, todos los runs de la familia alcanzan su maximo en la epoca 9 o 10 sin senales de sobreajuste, lo que sugiere que diez epocas pueden ser insuficientes. El split retenido (`sapc2_dev_heldout.jsonl`, 17.582 clips) no presenta interseccion con los manifiestos de entrenamiento, verificado comparando rutas de fichero.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,24 GB en bf16/fp16 y 2,5 GB en fp32 para los pesos, mas el consumo de activaciones y del decodificador autorregresivo. Son estimaciones derivadas del recuento de parametros; no hay cifras publicadas por el autor.
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM disponible. El entrenamiento se realizo sobre 16 GH200, pero la inferencia no requiere ese hardware.
- Cabe en GPU de consumo: si. Una RTX 3060 de 12 GB, una RTX 4070, una RTX 4090 o equivalentes son suficientes. Tambien puede ejecutarse en CPU, segun el ejemplo de uso del autor.
- Opciones de despliegue: PyTorch con `transformers>=5.9` mediante `AutoProcessor` y `ParakeetForRNNT`. El repositorio esta marcado como compatible con endpoints de inferencia. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI en la informacion disponible.
- Latencia y rendimiento: no disponibles. El unico dato cualitativo es que la decodificacion es autorregresiva y por tanto mas lenta que una cabecera CTC equivalente.
- Requisito de entrada: audio a 16 kHz mono; no se aceptan otras frecuencias de muestreo sin remuestreo previo.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | CER dev (subconjunto / split completo) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (parakeet-rnnt-0.6b-all-syn-chunk-cutout-fadeoutin) | 618.314.241 | Ingles | 6,07% / 6,21% | speech-accessibility-project-dua | HuggingFace, transformers>=5.9 |
| dys-asr/parakeet-rnnt-0.6b-all-syn-chunk-cutout (linea base directa) | No disponible | Ingles | 6,06% / 6,25% | No disponible | HuggingFace |
| extraordinarylab/parakeet-unified-en-0.6b (modelo base) | No disponible | Ingles | No disponible | No disponible | HuggingFace |

No se dispone de datos de rendimiento de otros sistemas ASR de proposito general aplicados a habla con disartria en la informacion proporcionada, por lo que no se incluye una comparacion con alternativas tipo Whisper u otros modelos Parakeet.

## Limitaciones y advertencias

- Unica ejecucion con una unica semilla: no hay estimacion de varianza y las diferencias reportadas frente a la linea base son menores que las que mostraria un barrido de semillas; no deben leerse como una clasificacion de metodos.
- Requiere `transformers>=5.9`; no es cargable con la linea 4.x.
- La decodificacion es autorregresiva, por lo que es mas lenta que una alternativa basada en CTC.
- La salida es en minusculas, sin puntuacion y con los numerales escritos como palabras, lo que exige postprocesado para muchos usos en produccion.
- Solo ingles y solo audio de 16 kHz mono. No hay soporte multilingue.
- No es una herramienta clinica: nada en el modelo permite inferir diagnosticos.
- Modelo de corpus restringido: no se empleo ningun dato externo a los corpus del desafio, lo que limita la generalizacion fuera del dominio SAPC.
- La licencia `speech-accessibility-project-dua` condiciona el uso; los corpus SAPC se rigen por su propio acuerdo de uso de datos y no se redistribuyen, por lo que reproducir el conjunto de entrenamiento exige acceso autorizado. Los terminos de Fun-CosyVoice3 aplican al componente de sintesis.
- Riesgo de alucinacion y de sustituciones en habla muy degradada: el CER de referencia del 6,21% implica errores por caracter no despreciables en cada transcripcion.
- Sesgos: no se documenta ningun analisis de sesgo por tipo de disartria, edad, sexo o acento dentro de los corpus SAPC.
- Los resultados de busqueda web proporcionados no contienen informacion tecnica ni enlaces relevantes sobre este modelo; los enlaces disponibles se limitan a los citados en la model card y en la ficha de HuggingFace.

## Enlaces

- HuggingFace: https://huggingface.co/dys-asr/parakeet-rnnt-0.6b-all-syn-chunk-cutout-fadeoutin
- Run de referencia sin FadeOutIn: https://huggingface.co/dys-asr/parakeet-rnnt-0.6b-all-syn-chunk-cutout
- Modelo base: https://huggingface.co/extraordinarylab/parakeet-unified-en-0.6b
- Licencia (Speech Accessibility Project): https://speechaccessibilityproject.beckman.illinois.edu/
- Codigo de referencia de FadeOutIn: https://github.com/mengkedalaigit/FadeOutIn
- Referencia bibliografica de FadeOutIn: Mengke y Mihajlik, Journal on Audio, Speech, and Music Processing (2026) 2026:24 (sin URL en la informacion disponible)
- Datasets citados: dys-asr/sapc1 y dys-asr/sapc2 (acceso sujeto a acuerdo de uso de datos)
