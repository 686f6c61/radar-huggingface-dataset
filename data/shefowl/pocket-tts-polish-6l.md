# shefowl/pocket-tts-polish-6l

## Resumen

pocket-tts-polish-6l es un modelo de sintesis de voz (text-to-speech) en polaco desarrollado por el usuario shefowl, publicado en HuggingFace bajo licencia CC-BY-4.0. Se trata de un ajuste fino (finetune) del modelo kyutai/pocket-tts, del que hereda el codec de audio Mimi, pero con el backbone reducido por destilacion de 24 capas transformer a 6. El resultado son 109,5 millones de parametros en total, de los cuales 89,4 M corresponden al backbone y 20,1 M al codec Mimi, en precision float32.

El modelo resuelve sintesis de voz en polaco con clonacion de voz zero-shot a partir de un clip de referencia, y esta disenado explicitamente para ejecucion on-device: alcanza un factor de tiempo real (RTF) de 0,21 en CPU de escritorio y 0,11 cuantizado a int8. El autor reporta una tasa de error de palabra (WER) del 8,5 % sobre 1339 enunciados repartidos en cuatro registros, y afirma que en sus mediciones el estudiante de 6 capas supera al profesor de 24 del que se destilo, al haber sido entrenado para reproducir las activaciones del backbone original y no como una simple poda.

Su relevancia actual es doble: por un lado, demuestra que la destilacion de un TTS moderno a un tamano de ~100 M de parametros mantiene calidad competitiva en un idioma con morfologia y grupos consonantivos complejos como el polaco; por otro, cuantifica con detalle un hallazgo practico poco documentado, que el clip de referencia elegido para la clonacion afecta al resultado mas que el propio modelo (22 puntos de diferencia en apellidos y un factor de tres en WER entre referencias distintas).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con backbone destilado de 6 capas mas codec neuronal Mimi; TTS con clonacion de voz zero-shot |
| Parametros totales | 109.502.146 (89,4 M backbone + 20,1 M codec Mimi) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | float32 por defecto; int8 como flag en tiempo de carga (`load_model(..., quantize=True)`), no requiere descarga adicional |
| Idiomas soportados | polaco (pl) |
| Licencia | cc-by-4.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de kyutai/pocket-tts, un sistema TTS que combina un backbone transformer con el codec de audio Mimi, y aplica destilacion para reducir el backbone de 24 a 6 capas. Segun la model card, el modelo de 6 capas no es una version recortada del de 24: es una red entrenada por separado para reproducir las activaciones del backbone del modelo profesor. El autor sostiene que, con las mediciones presentadas, el estudiante queda por delante del profesor, aunque la model card disponible no detalla la composicion del dataset de entrenamiento, el numero de tokens de audio utilizados ni si hubo etapas de RLHF o DPO.

El dato tecnico mas explotado de la ficha es la interaccion entre la referencia de clonacion y el rendimiento. El autor mide que el tempo del clip de referencia se transfiere a la salida con una pendiente de 0,59, y que el habla polaca rapida pierde primero los grupos consonantivos. De ahi una regla practica: usar una referencia leida a aproximadamente 2 palabras por segundo de audio sonoro. La model card advierte ademas que la duracion del clip no predice nada (+0,06 de correlacion) y que seis puntos de muestra son insuficientes para tratarlo como una ley ajustada.

## Capacidades

- Sintesis de voz en polaco con salida de audio natural a partir de texto.
- Clonacion de voz zero-shot a partir de un unico clip de referencia de 6-9 segundos.
- Ejecucion on-device: disenado para correr en CPU de escritorio sin GPU.
- Cuantizacion int8 en tiempo de carga, con 1,8x mas velocidad de inferencia y 2,7x menos memoria a cambio de como maximo 0,7 puntos de precision.
- Lectura precisa de vocabulario cerrado de interfaz: 100,0 % sobre 172 etiquetas de boton de un vocabulario de 43 palabras.
- Lectura de palabras frecuentes del polaco: 99,0 % sobre 400 palabras del top 3000 de una lista de frecuencia.
- Lectura de apellidos polacos: 98,4 % sobre 368 enunciados con 92 apellidos en cuatro marcos distintos.
- Lectura de etiquetas sueltas: 97,1 % sobre 308 palabras emitidas aisladas.
- No se documenta soporte de tool calling, function calling, agentes, vision ni audio de entrada mas alla del clip de referencia para clonacion.

## Casos de uso

- Lectura de etiquetas de interfaz en aplicaciones accesibles: el modelo alcanza un 100,0 % de acierto sobre un vocabulario cerrado de 43 palabras de boton y un 97,1 % cuando la palabra se envia aislada, que es exactamente el patron de una UI que sintetiza el nombre de un control.
- Guias por voz para navegacion turn-by-turn en polaco: la lectura de nombres de calles y toponimos se apoya en el mismo perfil de palabras poco frecuentes en el que el modelo rinde bien, y el RTF de 0,21 en CPU permite generar en tiempo real en dispositivos sin GPU.
- Locucion de contenidos para aprendizaje de idiomas: la clonacion zero-shot permite mantener una voz coherente a lo largo de ejercicios extensos a partir de un unico clip de 6-9 segundos del locutor de referencia.
- Atencion al cliente telefonica en polaco: el modelo se ejecuta en CPU, lo que abarata el despliegue de sintesis en infraestructura sin acelerador, y la lectura fiable de apellidos (98,4 %) reduce errores en la identificacion de clientes.
- Audiolibros y contenido largo en polaco: la ventana de silencio interno reportada (0,14 s de mediana y 0,80 s en el percentil 90) es compatible con concatenacion de fragmentos sin cortes perceptibles.
- Prototipado de asistentes de voz on-device: al pesar 0,4 GB en el repositorio y ejecutarse en CPU, el modelo se puede integrar en demos y pruebas de concepto sin aprovisionar GPU.
- Generacion de avisos y notificaciones personalizadas: la combinacion de plantillas cerradas (etiquetas de boton, vocabulario acotado) con el modo int8 es adecuada para volumen alto, ya que int8 aporta 1,8x de velocidad y 2,7x menos memoria con perdida maxima de 0,7 puntos.

## Benchmarks y rendimiento

Los datos de la model card corresponden a 1339 enunciados, una generacion por enunciado, sin reintentos y con un unico clip de referencia, en cuatro registros:

| Registro | n | Descripcion | Lectura correcta |
|---|---:|---|---:|
| Etiquetas de boton | 172 | palabras sueltas de un vocabulario fijo de UI, en frase portadora | 100,0 % |
| Palabras frecuentes | 400 | palabras del top 3000 de una lista de frecuencia del polaco | 99,0 % |
| Apellidos | 368 | 92 apellidos polacos en cuatro marcos cada uno | 98,4 % |
| Etiquetas aisladas | 308 | una palabra sola, tal como la enviaria un boton | 97,1 % |

WER sobre el mismo conjunto: 8,5 %. Silencio mas largo dentro de un enunciado: mediana 0,14 s, percentil 90 0,80 s.

Efecto del clip de referencia (mismos pesos, mismas frases, seis referencias de seis hablantes; solo el primer reconocedor, por lo que son suelos):

| Referencia | Tempo (palabras/s de audio sonoro) | Apellidos | Etiquetas aisladas | WER |
|---|---:|---:|---:|---:|
| A | 1,95 | 87,5 % | 93,5 % | 13,2 % |
| B | 2,07 | 87,0 % | 96,8 % | 14,3 % |
| C | 2,10 | 88,6 % | 98,1 % | 8,9 % |
| D | 2,77 | 72,3 % | 89,0 % | 11,6 % |
| E | 2,85 | 66,3 % | 90,9 % | 25,9 % |
| F | 3,35 | 76,1 % | 95,5 % | 11,7 % |

El autor senala que las tres referencias lentas ocupan las tres primeras posiciones y las tres rapidas las tres ultimas, con una correlacion entre tempo de referencia y precision en apellidos de -0,79 sobre esos seis puntos.

Clonacion de voz, medida como coseno entre x-vectors de WavLM-base-plus-sv sobre 180 generaciones:

| Medicion | Coseno |
|---|---:|
| Techo: mismo hablante, grabacion real distinta | 0,958 |
| Este modelo clonando su referencia | 0,946 |
| Suelo: hablantes distintos | 0,713 |

El autor matiza que la metrica satura para tres de los seis hablantes (la model card disponible se interrumpe en ese punto). La validacion de estos numeros se hizo con dos reconocedores: `nvidia/stt_pl_fastconformer_hybrid_large_pc` en sherpa-onnx int8 sobre CPU, y una segunda pasada de rescate con `nvidia/parakeet-tdt-0.6b-v3` para los enunciados marcados como erroneos. La diferencia entre ambos es notable en apellidos: 82,9 % con el primer reconocedor solo frente a 98,4 % tras la reescucha.

## Requisitos de hardware

- Peso de los pesos en float32: aproximadamente 438 MB para 109,5 M de parametros; en int8, alrededor de 110 MB. El repositorio completo ocupa 0,4 GB.
- Inferencia en CPU: es el escenario principal del modelo, con un RTF de 0,21 en un procesador de escritorio (unas 4,8 veces mas rapido que tiempo real).
- Con cuantizacion int8: RTF de 0,11 (aproximadamente 9 veces mas rapido que tiempo real), con 2,7x menos memoria y 1,8x mas velocidad de inferencia.
- GPU: no es un requisito. No se especifican GPU recomendadas en la informacion disponible; el modelo cabe holgadamente en cualquier GPU consumer (RTX 3060, RTX 4090, etc.) si se quiere acelerar, pero la model card no aporta cifras de VRAM ni de throughput en GPU.
- Opciones de despliegue: la libreria declarada es `pocket-tts`, con cuantizacion int8 activada mediante `load_model(..., quantize=True)`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: los unicos datos disponibles son los RTF indicados; no hay cifras de latencia por peticion ni de peticiones concurrentes.

## Comparativa con modelos similares

La model card menciona explicitamente el modelo profesor del que se destila, del que aporta la comparacion cualitativa. No se dispone de datos de otros modelos TTS en polaco en la informacion proporcionada.

| Modelo | Parametros | Contexto | Rendimiento en polaco | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| shefowl/pocket-tts-polish-6l | 109,5 M (89,4 M backbone + 20,1 M Mimi) | no disponible | WER 8,5 %; 98,4 % en apellidos; 100 % en vocabulario de UI | cc-by-4.0 | HuggingFace, 0 descargas y 0 likes en el momento de la consulta |
| kyutai/pocket-tts (profesor) | no disponible (backbone de 24 capas, ~3x mayor segun la model card) | no disponible | no disponible en polaco; la model card afirma que el estudiante queda por delante en sus mediciones | no disponible | HuggingFace |
| Otras alternativas TTS en polaco | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El modelo solo soporta polaco (idioma declarado: `pl`). No hay evidencia de soporte multilingue.
- La calidad depende fuertemente del clip de referencia: con las seis referencias medidas, la precision en apellidos varia 22 puntos y el WER se multiplica por tres. Una referencia rapida degrada el resultado de forma marcada, porque el habla polaca rapida pierde antes los grupos consonantivos.
- La regla del tempo (~2 palabras por segundo de audio sonoro) se basa en seis puntos de muestra; el propio autor la califica de regla practica y no de ley ajustada. Se recomienda validar la referencia generando una docena de frases antes de fijarla.
- La metrica de similitud de voz satura: para tres de los seis hablantes el clon puntua igual o por encima del techo medido, por lo que la comparacion entre clones pierde poder discriminativo en ese rango.
- Los numeros de la model card se obtienen con dos reconocedores automaticos y una pasada de rescate. Cualquier evaluacion externa con un unico fastconformer en polaco reportara cifras peores (hasta 15 puntos menos en apellidos), segun advierte el propio autor.
- No se documentan sesgos especificos, riesgos de alucinacion en el sentido de texto inventado, ni tasas de fallo en dominios fuera de los cuatro registros medidos.
- Riesgo de uso indebido de la clonacion de voz: el modelo clona con coseno 0,946 sobre una referencia de 6-9 segundos, lo que exige consentimiento explicito del hablante y cumplimiento de la normativa aplicable sobre sintesis de voz.
- Licencia CC-BY-4.0: permite uso comercial y modificacion, pero obliga a citar la autoria y a indicar los cambios. Conviene revisar la licencia del modelo base `kyutai/pocket-tts`, no detallada en la informacion proporcionada, por si impone condiciones adicionales.
- El modelo tiene 0 descargas y 0 likes, y fue creado el 17 de septiembre de 2026 con una unica actualizacion seis minutos despues: no hay evidencia de uso en produccion ni de mantenimiento posterior.
- La model card se interrumpe a mitad de frase en la seccion de clonacion de voz, por lo que puede faltar informacion adicional en el documento original.
- No se documenta longitud de contexto ni limites de longitud de texto de entrada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/shefowl/pocket-tts-polish-6l
- Modelo base: https://huggingface.co/kyutai/pocket-tts
- Reconocedor usado en la primera pasada: https://huggingface.co/nvidia/stt_pl_fastconformer_hybrid_large_pc
- Reconocedor usado en la pasada de rescate: https://huggingface.co/nvidia/parakeet-tdt-0.6b-v3
- Resultados de busqueda web: no se han encontrado enlaces relevantes al modelo; las busquedas devolvieron unicamente paginas de autenticacion de la Universite de Caen Normandie, sin relacion con el modelo.
