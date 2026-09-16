# palli23/whisper-tiny-samromur-50h

## Resumen

whisper-tiny-samromur-50h es un ajuste fino del modelo Whisper-Tiny (39 M de parametros) sobre un subconjunto anidado de 50 horas del corpus islandes samromur-500h. Lo publica el usuario palli23 en HuggingFace y forma parte del conjunto de checkpoints de escalado del trabajo "Scaling Smaller ASR Models Against Multilingual ASR Giants" (ICASSP 2026). Se trata, por tanto, de un modelo de investigacion orientado a medir como se comporta un modelo ASR pequeno cuando se le da mas datos de un idioma concreto, en lugar de un modelo de produccion pulido.

El problema que aborda es el reconocimiento automatico del habla en islandes, un idioma con pocos recursos y con una comunidad de hablantes pequena, donde los corpus etiquetados son escasos. El modelo explora la hipotesis de que un Whisper-Tiny especializado con 50 horas de audio islandes puede acercarse a modelos multilingues mucho mayores en esa lengua concreta.

Tecnicamente hereda la arquitectura encoder-decoder transformer de la familia Whisper, con 37.760.640 parametros y pesos en formato safetensors, y esta licenciado bajo CC BY-SA 4.0. El repositorio ocupa 0,3 GB y registra 5 descargas y 0 likes en el momento de la consulta, por lo que se trata de un checkpoint con muy poca validacion comunitaria hasta la fecha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder de la familia Whisper (base whisper-tiny) |
| Parametros totales | 37.760.640 (aproximadamente 39 M) |
| Parametros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | No aplica contexto textual; ventana de audio de 30 segundos (formato estandar de Whisper: 1500 fotogramas de mel espectrograma de 80 bandas) |
| Tipos de cuantizacion | No disponible en el repositorio (solo safetensors en precision completa/FP16). Las conversiones a int8 o GGML dependerian de herramientas externas |
| Idiomas soportados | Islandes (is) |
| Licencia | cc-by-sa-4.0 |
| Formato de pesos | safetensors |
| Tarea | Reconocimiento automatico del habla (ASR) y transcripcion |
| Tamano del repositorio | 0,3 GB |
| Fecha de creacion | 3 de junio de 2026 |
| Ultima actualizacion | 15 de septiembre de 2026 |
| Descargas / likes | 5 / 0 |

## Arquitectura y entrenamiento

La arquitectura es la de Whisper-Tiny, un transformer encoder-decoder disenado para voz: el encoder consume una representacion log-Mel de 80 bandas calculada sobre ventanas de 30 segundos y el decoder genera texto de forma autorregresiva, con tokens especiales de idioma, tarea y marcas de tiempo. Al ser la variante tiny, la capacidad es muy limitada en comparacion con las variantes medium o large, lo que la hace adecuada para escenarios de bajos recursos computacionales pero mas sensible a errores en audio dificil.

El entrenamiento consiste en un ajuste fino sobre un subconjunto anidado de 50 horas del corpus samromur-500h (identificado en la model card como parte del pool de escalado "Miljón/samromur-500h"), un corpus de habla islandesa. La model card indica que este checkpoint pertenece a un conjunto de checkpoints de escalado y remite al paper de ICASSP 2026 para la metodologia y los resultados de WER y CER. No se especifica en la informacion disponible si hubo etapas de RLHF, DPO u optimizacion adicional, ni la composicion exacta del subconjunto (proporcion de hablantes, dominios o calidad de transcripcion), ni el numero total de tokens de audio vistos.

## Capacidades

- Transcripcion de voz a texto en islandes, con salida de texto plano y soporte de marcas de tiempo propias del decoder de Whisper.
- Reconocimiento de habla en audio de hasta 30 segundos por pasada; el audio mas largo requiere segmentacion previa.
- Deteccion de idioma y tokens de tarea heredados del modelo base, aunque el ajuste fino se ha realizado exclusivamente sobre islandes.
- Uso como bloque de investigacion en experimentos de escalado de datos: permite comparar el efecto de distintas cantidades de horas de entrenamiento sobre la misma arquitectura.
- Integracion en pipelines de HuggingFace Transformers mediante la clase de modelo Whisper para ASR y en herramientas derivadas tras conversion de formato.
- No se ha documentado soporte de tool calling, function calling, agentes, vision, audio generativo ni modos de razonamiento explicito; son capacidades propias de modelos de lenguaje, no de este modelo ASR.
- El campo `pipeline` no esta declarado en la ficha del repositorio, aunque la tarea es ASR por la naturaleza del modelo y sus etiquetas.

## Casos de uso

- Transcripcion de audio en islandes para medios de comunicacion: el modelo convierte entrevistas y piezas informativas en texto, aprovechando la ventana de 30 segundos por segmento y el ajuste especifico en habla islandesa.
- Subtitulado automatico de videos: se puede encadenar la segmentacion de audio con la generacion de texto y usar las marcas de tiempo del decoder para construir ficheros de subtitulos en islandes.
- Analitica de centros de atencion telefonica: transcripcion de llamadas en islandes para posterior busqueda por palabras clave, clasificacion de motivos de contacto y control de calidad, con coste computacional muy bajo por minuto procesado.
- Investigacion linguistica y creacion de corpus: transcripcion asistida de grabaciones de campo para acelerar el etiquetado manual posterior, util en una lengua con recursos limitados como el islandes.
- Prototipado rapido y demostraciones: al ocupar 0,3 GB y requerir menos de 1 GB de VRAM, permite montar demos locales de ASR en islandes sin infraestructura de GPU dedicada.
- Preprocesado de datos en pipelines de machine learning: convertir grandes volumenes de audio islandes en texto para entrenar clasificadores, sistemas de recuperacion de informacion o modelos de lenguaje especificos del dominio.
- Despliegue en dispositivos con recursos limitados o en el borde: su tamano reducido hace viable la inferencia en CPU o en GPUs integradas para aplicaciones de accesibilidad, como dictado o lectura de notas de voz.
- Punto de comparacion en estudios de escalado: sirve como referencia de "modelo pequeno con 50 horas" frente a otros checkpoints del mismo conjunto experimental.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que los resultados de WER (word error rate) y CER (character error rate) se encuentran en el paper "Scaling Smaller ASR Models Against Multilingual ASR Giants" (ICASSP 2026), pero las cifras concretas no forman parte de los datos proporcionados. Tampoco hay resultados de MMLU, HumanEval, GSM8K ni de otras suites, ya que no son aplicables a un modelo de reconocimiento de voz.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,2 GB en FP32 y 0,1 GB en FP16 solo para los pesos (estimacion a partir de los 37,76 M de parametros); con activaciones y buffers de audio, el consumo real se mantiene por debajo de 1 GB en la mayoria de configuraciones.
- GPU recomendadas: cualquier GPU con al menos 2 GB de memoria, incluidas GTX 1650, RTX 3050, RTX 4090, A100 o H100. En la practica, el modelo esta limitado por el ancho de banda y la latencia de entrada de audio, no por la VRAM.
- Compatibilidad con GPU de consumo: si, cabe sobradamente en cualquier GPU de consumo actual e incluso en GPUs integradas.
- CPU: la inferencia en CPU es viable en tiempo real o mejor en procesadores modernos, dado el reducido numero de parametros.
- Opciones de despliegue: HuggingFace Transformers (clase de ASR de Whisper), conversion a CTranslate2 para su uso con faster-whisper, conversion a GGML/GGUF para whisper.cpp, exportacion a ONNX Runtime. El soporte de vLLM o TGI para este checkpoint no esta documentado en la informacion disponible.
- Latencia y throughput: no disponibles. Cualquier cifra concreta dependera del hardware, del backend y de la longitud del audio; al tratarse de un modelo tiny, se espera una relacion tiempo real (RTF) claramente inferior a 1 en GPU moderna, pero es una estimacion orientativa no verificada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto de audio | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| palli23/whisper-tiny-samromur-50h | 37,76 M | 30 s por pasada | Islandes (is) | cc-by-sa-4.0 | HuggingFace, 5 descargas |
| openai/whisper-tiny | 39 M | 30 s por pasada | Multilingue (99 idiomas) | Apache 2.0 | HuggingFace, ampliamente usado |
| openai/whisper-base | 74 M | 30 s por pasada | Multilingue (99 idiomas) | Apache 2.0 | HuggingFace, ampliamente usado |
| openai/whisper-small | 244 M | 30 s por pasada | Multilingue (99 idiomas) | Apache 2.0 | HuggingFace, ampliamente usado |

No se dispone de cifras de WER comparativas entre estos modelos y el checkpoint objeto de la ficha, ya que los resultados del paper no se incluyen en la informacion proporcionada. La diferencia principal frente a los modelos originales de OpenAI es la especializacion en islandes y la licencia CC BY-SA 4.0, mas restrictiva que la Apache 2.0 del modelo base en lo relativo a la obligacion de compartir derivados bajo la misma licencia.

## Limitaciones y advertencias

- Sesgos conocidos: no hay documentacion sobre la composicion del subconjunto de 50 horas (hablantes, edad, genero, acento o dominio), por lo que no puede evaluarse el sesgo demografico ni la variedad dialectal cubierta.
- Riesgo de alucinacion: los modelos de la familia Whisper son propensos a generar texto plausible en tramos de silencio, ruido o audio musical; en la variante tiny este fenomeno es mas frecuente que en modelos mayores.
- Cobertura de idioma: el ajuste se ha realizado solo en islandes. El rendimiento en otros idiomas no esta garantizado y probablemente se degrade respecto al modelo base original.
- Contexto limitado: la ventana de 30 segundos obliga a segmentar el audio, lo que puede degradar la calidad en fronteras entre segmentos y complicar la transcripcion de audio largo.
- Precisión: al tratarse de la variante tiny con solo 50 horas de ajuste, la tasa de error esperada es superior a la de modelos medium o large; no se recomienda para transcripcion profesional sin revision humana.
- Licencia: CC BY-SA 4.0 permite uso comercial, pero exige atribucion y obliga a distribuir las obras derivadas bajo la misma licencia, lo que puede ser incompatible con productos propietarios que no quieran liberar sus derivados.
- Validacion limitada: con 5 descargas y 0 likes, no existen evidencias publicas de uso en produccion ni evaluaciones independientes de la calidad.
- Fecha de publicacion posterior a la ventana habitual de revisiones: conviene verificar que el paper asociado y los resultados esten efectivamente disponibles antes de basar decisiones en ellos.
- No se documentan limitaciones de longitud de salida, ni comportamiento con audio de mas de 30 segundos, ni la estrategia de segmentacion recomendada por el autor.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/palli23/whisper-tiny-samromur-50h
- Modelo base: https://huggingface.co/openai/whisper-tiny
- Paper de referencia citado en la model card: "Scaling Smaller ASR Models Against Multilingual ASR Giants" (ICASSP 2026). Enlace directo no disponible en la informacion proporcionada.
- Corpus samromur-500h, citado en la model card como "Miljón/samromur-500h": URL exacta no disponible en la informacion proporcionada.
- Repositorio y demos adicionales: no disponibles en la informacion proporcionada.
