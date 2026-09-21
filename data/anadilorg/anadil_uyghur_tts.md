# Anadilorg/Anadil_Uyghur_TTS

## Resumen

Anadil_Uyghur_TTS (AnadilUyghurTTS) es un adaptador LoRA de síntesis de voz (text-to-speech) para uigur (ISO 639-3: `ug`), desarrollado por la organización Anadilorg sobre el modelo base openbmb/VoxCPM2. Resuelve un problema clásico de las lenguas de bajos recursos: la ausencia de voces sintéticas de calidad en herramientas digitales. Se trata de un adaptador pequeño, de unos 18,1 millones de parámetros en F32 (384 tensores, ~72 MB), que se aplica sobre las capas LM y DiT del modelo base en lugar de reentrenar el modelo completo.

El adaptador se ha entrenado con 209.906 segmentos de un único hablante procedentes de Mozilla Common Voice 26.0 en uigur, durante 5.000 pasos. Según el autor, es el miembro con mayor volumen de datos de la familia "Anadil" de adaptadores TTS para lenguas minoritarias (laz, zazaki, adigué, kurmandí, armenio, ladino y kirguís). La salida se genera a 48 kHz y el modelo permite clonación de voz zero-shot a partir de un fichero WAV de referencia.

Su relevancia actual es doble: por un lado, demuestra que un adaptador LoRA de menos de 100 MB puede dotar de voz a una lengua con pocos recursos; por otro, es un ejemplo reproducible de la estrategia "modelo base grande + adaptador ligero" aplicada a la síntesis de voz. La licencia MIT y el formato safetensors facilitan su integración, aunque la ausencia de métricas objetivas publicadas (WER, UTMOS) limita la evaluación rigurosa de su calidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (r=32, alpha=32) sobre openbmb/VoxCPM2, aplicado a las capas LM y DiT del modelo base |
| Parametros totales | No disponible para el modelo base; el adaptador LoRA tiene ~18,1 M de parametros (384 tensores en F32) |
| Parametros activos | No aplica: no es un modelo MoE. El adaptador anade ~18,1 M de parametros entrenables sobre el modelo base |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible. El adaptador se distribuye en F32; el autor no documenta cuantizaciones del modelo base |
| Idiomas soportados | Uigur (`ug`) como idioma de entrenamiento; los metadatos del repositorio declaran tambien turco (`tr`), sin evidencia de evaluacion en ese idioma |
| Licencia | MIT |
| Formato de pesos | safetensors (adaptador LoRA, ~72 MB); el formato de los pesos del modelo base no se especifica |

Otros datos proporcionados por el autor: tamano del repositorio 0,2 GB, salida a 48 kHz, hablante unico etiquetado como `spk_tmp_001`, 5.000 pasos de entrenamiento, `cfg_value` por defecto 2.0 e `inference_timesteps` por defecto 10.

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA de rango 32 y alpha 32 insertado en las capas de tipo LM y DiT de openbmb/VoxCPM2. El autor no detalla la topologia interna del modelo base; la presencia de capas DiT (Diffusion Transformer) y de un parametro `inference_timesteps` en la API apunta a un decodificador acustico basado en difusion, pero se trata de una inferencia a partir de la informacion disponible, no de un dato confirmado en la model card. El adaptador ocupa unicamente 384 tensores en F32 (~72 MB), lo que lo hace muy ligero frente al modelo base.

El entrenamiento se realizo sobre 209.906 segmentos de audio de un unico hablante extraidos de Mozilla Common Voice 26.0 (`ug`), con 5.000 pasos de optimizacion. No se menciona en la informacion disponible el uso de RLHF, DPO ni de ningun otro ajuste por preferencias; tampoco se indica el numero total de tokens ni la composicion exacta del dataset mas alla de su origen en Common Voice. La innovacion practica del modelo es la clonacion de voz zero-shot: la sintesis se condiciona con un WAV de referencia, de modo que un unico checkpoint puede aproximar voces distintas sin reentrenar. El autor advierte explicitamente que 5.000 pasos es el estandar de la familia Anadil y que entrenamientos mas largos podrian mejorar la calidad.

## Capacidades

- Sintesis de voz en uigur a partir de texto en escritura arabe-uigur, con salida de audio a 48 kHz.
- Clonacion de voz zero-shot: acepta un fichero WAV de referencia para aproximar el timbre de un hablante, incluido el propio hablante de entrenamiento (`samples/1.wav`).
- Control de generacion mediante dos parametros expuestos en la API: `cfg_value` (por defecto 2.0) e `inference_timesteps` (por defecto 10).
- Interfaz Python (`AnadilUyghurTTS.synthesize`) e interfaz Gradio local (`demo.py`, puerto 7860).
- Utilidad de linea de comandos (`inference.py`) con modo de sintesis individual y modo `--list-samples` para regenerar las cinco frases de ejemplo del repositorio.
- Pruebas de integridad y de humo incluidas (`test_smoke.py`, con modo `--weights-only`).
- No dispone de tool calling, function calling ni soporte de agentes: es un modelo exclusivamente texto-a-audio.
- No dispone de capacidades multimodales de entrada (no procesa imagenes ni audio de entrada mas alla del WAV de referencia para clonacion).
- Capacidad multilingue no demostrada: aunque los metadatos declaran `tr`, la model card solo documenta uigur.

## Casos de uso

- Accesibilidad para personas ciegas o con baja vision: lectura en voz alta de documentos, paginas web y aplicaciones en uigur, un idioma practicamente sin soporte en los lectores de pantalla comerciales. El modelo permite generar audio en local sin depender de servicios en la nube.
- Audiolibros y prensa hablada: conversion de texto largo en uigur a audio para medios digitales o radios comunitarias, con la voz del hablante de entrenamiento como timbre de referencia.
- Preservacion y ensenanza del idioma: generacion de material didactico con pronunciacion consistente para escuelas y cursos de uigur, especialmente util al tratarse de una lengua con variacion dialectal y escasez de recursos grabados.
- Localizacion de video y doblaje: produccion de pistas de voz en uigur para materiales educativos, documentales o contenido corporativo, usando el WAV de referencia para mantener un timbre homogeneo entre fragmentos.
- Sistemas de atencion al cliente y telefonia (IVR): locuciones y respuestas de voz en uigur para menus telefonicos o asistentes de voz, siempre que se valide previamente la inteligibilidad en dominios distintos al de Common Voice.
- Investigacion en TTS de bajos recursos: punto de partida reproducible (adaptador safetensors de 72 MB, licencia MIT) para estudiar tecnicas LoRA en sintesis de voz, comparar rangos y pasos de entrenamiento o explorar destilacion y cuantizacion.
- Prototipado de asistentes de voz en uigur: integracion del modelo en una demo Gradio o en un servicio local para validar productos de voz antes de invertir en un corpus mayor.
- Clonacion de voz personalizada con consentimiento explicito: recreacion de la voz de un locutor concreto para proyectos de narracion, asumiendo las implicaciones eticas y legales del uso de la voz de terceros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explicitamente que los metricos automaticos (WER, UTMOS u otros) no se han calculado y que las cinco muestras de audio incluidas en el repositorio corresponden a frases vistas durante el entrenamiento, por lo que no constituyen una evaluacion fuera de muestra.

| Metrica | Resultado | Estado |
|---|---|---|
| WER (tasa de error de palabras) | No disponible | No calculado por el autor |
| UTMOS u otra metrica de naturalidad | No disponible | No calculada por el autor |
| Similitud de hablante (clonacion) | No disponible | No calculada por el autor |
| Evaluacion fuera de muestra | No disponible | Las muestras publicadas son frases de entrenamiento |
| Latencia y throughput | No disponible | No documentados |

## Requisitos de hardware

- Memoria: el autor recomienda unos 9 GB de memoria para sintesis en fp32, incluyendo el modelo base y el adaptador.
- El adaptador en si ocupa ~72 MB; el grueso del consumo corresponde al modelo base VoxCPM2, cuyo tamano no se detalla en la informacion disponible.
- CUDA es la opcion preferida segun el autor; en Apple Silicon el rendimiento es mas lento.
- GPU de consumo: con ~9 GB de requisito, el modelo cabe en tarjetas con 12 GB o mas de VRAM (por ejemplo, RTX 3060 12 GB, RTX 4070, RTX 4080, RTX 4090). Para GPUs de 8 GB o menos no hay confirmacion de que quepa en fp32 sin reducir precision.
- GPU de centro de datos: A100, H100 o L40S son sobradamente suficientes, aunque el modelo es pequeno y no las aprovecha a gran escala.
- Opciones de despliegue: la libreria `voxcpm` con el script `inference.py` proporcionado, la API Python `AnadilUyghurTTS`, y una demo Gradio local (`demo.py`). No se documenta soporte para vLLM, TGI, llama.cpp ni Ollama, que en cualquier caso estan orientados a modelos de lenguaje y no a este tipo de decodificador acustico.
- Latencia y throughput: no disponibles. Los unicos parametros de rendimiento expuestos son `inference_timesteps` (10 por defecto) y `cfg_value` (2.0 por defecto), que afectaran a la calidad y al tiempo de sintesis.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Licencia | Notas |
|---|---|---|---|---|
| Anadil_Uyghur_TTS | Adaptador ~18,1 M; base no disponible | uigur (metadatos: tambien turco) | MIT | 209.906 segmentos de entrenamiento, el mayor de la familia Anadil |
| openbmb/VoxCPM2 (modelo base) | No disponible | No disponible | No disponible | Base sobre la que se aplican todos los adaptadores de la familia |
| Otros adaptadores de la familia Anadil (laz, zazaki, adigue, kurmandi, armenio, ladino, kirguis) | No disponible | Lenguas minoritarias respectivas | No confirmado | Comparten base VoxCPM2 y metodo LoRA; el autor indica que este es el de mayor volumen de datos |
| Alternativas comerciales de TTS para uigur | No disponible | No disponible | Propietaria | No se ha identificado informacion comparable en la busqueda realizada |

La busqueda web realizada no ha devuelto resultados relevantes sobre este modelo ni sobre alternativas comparables; los resultados obtenidos eran consultas no relacionadas sobre Google Earth y se han descartado.

## Limitaciones y advertencias

- Hablante unico: el modelo esta entrenado sobre una sola voz (`spk_tmp_001`). Las voces distintas solo pueden aproximarse mediante clonacion zero-shot con un WAV de referencia, sin garantia de calidad.
- Entrenamiento corto: 5.000 pasos es el estandar declarado de la familia Anadil; el autor reconoce que un entrenamiento mas largo podria mejorar la calidad.
- Ausencia de metricas: no hay WER, UTMOS ni evaluacion de similitud de hablante, por lo que no es posible cuantificar la fidelidad de la sintesis.
- Riesgo de sobreajuste a las muestras: las cinco frases publicadas son frases vistas durante el entrenamiento, lo que puede enmascarar errores en texto nuevo.
- Riesgo de alucinacion acustica: como todo modelo generativo de audio, puede producir pronunciaciones incorrectas, omisiones, repeticiones, ruido o artefactos, especialmente con texto fuera de dominio, numeros, siglas o prestamos.
- Cobertura limitada: no hay evidencia de que sintetice turco correctamente pese a la etiqueta `tr` en los metadatos; tampoco se documenta el tratamiento de dialectos del uigur ni de la escritura latina uigur (ULY).
- Sin contexto largo documentado: no se especifica un limite de longitud de texto de entrada ni estrategias de segmentacion para parrafos largos.
- Consumo de memoria: ~9 GB en fp32, lo que excluye GPUs de gama de entrada con 8 GB o menos.
- Licencia MIT: permite uso comercial y modificacion sin restricciones de la licencia, pero conviene verificar la licencia del modelo base openbmb/VoxCPM2 antes de un despliegue comercial, ya que no se detalla en la informacion disponible.
- Uso etico de la clonacion de voz: la capacidad de clonar voces a partir de un WAV de referencia puede emplearse para suplantacion; es responsabilidad del usuario obtener consentimiento explicito y cumplir la normativa aplicable.
- Adopcion nula registrada: el repositorio figura con 0 descargas y 0 likes, por lo que no existe validacion independiente por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Anadilorg/Anadil_Uyghur_TTS
- Modelo base VoxCPM2: https://huggingface.co/openbmb/VoxCPM2
- Dataset de entrenamiento (Mozilla Common Voice 26.0, uigur): https://commonvoice.mozilla.org/
- Muestras de audio del repositorio: https://huggingface.co/Anadilorg/Anadil_Uyghur_TTS/tree/main/samples
- Cita BibTeX (incompleta en la informacion disponible): `@software{anadil-uyghur-tts, author = {Anadilorg}, title = {AnadilUyghurTTS: An Open-Source Text-to-Speech LoRA Adapter for Uyghur}, url = {https://huggingface.co/Anadilorg/Anadil_Uyghur_TTS}}`
- Resultados de busqueda web: no se han encontrado articulos, papers ni repositorios adicionales relevantes sobre este modelo.
