# Scicom-intl/voice-isolator

## Resumen

voice-isolator es un modelo de aislamiento de voz (target-speaker extraction) desarrollado por Scicom-intl, disenado especificamente para agentes de voz en produccion. Su funcion es mantener la voz del interlocutor principal (el llamante) y eliminar otras voces y ruido antes de que el detector de actividad de voz (VAD), el detector de turnos y el sistema de reconocimiento de habla escuchen la llamada. Es un modelo causal y de streaming que procesa audio a 16 kHz en tramas de 10 ms, con chunks de 20 ms o mas, y que puede atender todas las llamadas de un servidor GPU en un unico paso batcheado.

Tecnicamente se trata de un transformer causal de 555 millones de parametros que observa los ultimos 10 segundos de audio, acompanado de un WavLM-Large convertido a causal. Consume 47,7 GMAC por segundo de audio y mantiene 115 MB de estado por llamada activa, sin look-ahead mas alla de la ventana STFT de 20 ms. El modelo se enrola con la voz del llamante a partir de la propia llamada (desde los 3 segundos, tomando los 3 segundos mas fuertes oidos hasta el momento, fijados cuando la llamada cumple 15 segundos) o a partir de un clip de referencia del interlocutor.

Su relevancia actual radica en que resuelve un problema practico de los agentes de voz: la contaminacion del audio de entrada por voces de fondo y ruido degrada la precision del STT y provoca detecciones erroneas de turnos. El modelo se integra como plugin de LiveKit y existe una version destilada de 22 millones de parametros (voice-isolator-cpu) que corre en un solo hilo de CPU dentro del agente. El paper asociado es *The Voice on the Line* (arXiv:2610.35272).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal con WavLM-Large causal |
| Parametros totales | 555.229.786 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 10 segundos de audio (ventana causal) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | other |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer causal que observa los ultimos 10 segundos de audio, con un WavLM-Large modificado para operar de forma causal junto a el. La entrada es audio mono a 16 kHz en float32, procesado en tramas de 10 ms mediante una STFT con ventana de 20 ms, sin look-ahead adicional. El coste computacional es de 47,7 GMAC por segundo de audio y el estado por llamada activa es de 115 MB. La salida es audio del llamante aislado, tambien a 16 kHz.

El enrolamiento del hablante objetivo se realiza de dos formas: en modo live, el modelo toma los 3 segundos mas fuertes oidos desde los 3 segundos de llamada y los fija cuando la llamada alcanza los 15 segundos; alternativamente, se puede proporcionar un clip del llamante. Existe una version destilada de 22 millones de parametros con el mismo diseno, pensada para ejecutarse en un solo hilo de CPU dentro del agente. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF o DPO.

## Capacidades

- Aislamiento de voz del hablante principal (target-speaker extraction) en tiempo real.
- Eliminacion de otras voces y ruido antes del VAD, el detector de turnos y el STT.
- Procesamiento causal y de streaming: 16 kHz de entrada, 16 kHz de salida, tramas de 10 ms, chunks de 20 ms o mas.
- Enrolamiento automatico desde la propia llamada o mediante clip de referencia del llamante.
- Modo voicebot para agentes que hablan primero (saludan al llamante).
- Atencion batcheada de multiples llamadas concurrentes en una GPU.
- Integracion como plugin de LiveKit (RemoteIsolator y LocalIsolator).
- Servicio por WebSocket con un socket por llamada (vi.server o vi.server_mp).
- Capacidad de streaming sin LiveKit mediante la clase Stream en Python.
- Version destilada de 22M de parametros para ejecucion en CPU dentro del agente.

## Casos de uso

- Atencion al cliente automatizada: el modelo se situa como etapa de cancelacion de ruido en la entrada de audio del agente de voz, de modo que el VAD y el STT solo reciben la voz del llamante y no las voces de fondo del entorno, mejorando la precision de la transcripcion y la deteccion de turnos.
- Agentes de voz sobre LiveKit en produccion: mediante el plugin voice_isolator, cada agente envia sus llamadas a un servidor GPU compartido que devuelve el audio filtrado; con 32 llamadas simultaneas el retardo mediano fue de 40 ms y con 64 llamadas de 50 ms.
- Centros de llamadas con ruido ambiental: en entornos donde el llamante esta en un espacio con otras conversaciones, el modelo elimina las voces ajenas; en el ejemplo AMI ES2004c, el STT transcribio 111 palabras de otras personas sin el aislador y 0 con el.
- Reuniones y transcripcion selectiva: permite transcribir unicamente al participante designado, ignorando al resto de hablantes, util para actas o seguimiento de un interlocutor concreto.
- Pipelines de STT en produccion: al reducir el ruido y las voces interferentes antes del reconocedor, disminuye la tasa de error de palabra (WER) del sistema de reconocimiento en las nueve pruebas reportadas.
- Despliegue en el borde o en CPU: la version destilada de 22M de parametros permite ejecutar el aislamiento dentro del propio agente en un solo hilo de CPU, sin necesidad de servidor GPU.
- Integracion por WebSocket en cualquier lenguaje: el servidor acepta PCM int16 mono a 16 kHz en cualquier cantidad y devuelve el llamante aislado en orden, con 10 ms de retardo mas el chunk del servidor.

## Benchmarks y rendimiento

La model card reporta tasas de error de palabra (WER) de STT tras cada sistema, como media de nueve conjuntos de prueba, con todos los sistemas en vivo excepto el protocolo de benchmark de VoxLock, que toma su muestra de los primeros 15 segundos de la llamada. Los datos concretos de la figura no se incluyen como valores numericos en la informacion disponible; se indica que VoxLock en vivo va por delante en dos de las pruebas: el benchmark Krisp VI (265 grabaciones) y llamadas de centro de llamadas con el llamante solo.

En cuanto a latencia y throughput en produccion, a traves de agentes LiveKit reales con tramas de 50 ms y el servidor en `--chunk-hops 4` (pasos de 40 ms), 32 llamadas simultaneas volvieron 40 ms por detras de la llamada en la mediana (50 ms en el percentil 99) y 64 llamadas 50 ms (50 ms). Cada trama espera en el bucle de audio del agente su propia respuesta (14 ms en la mediana, 30 ms como maximo, el valor por defecto del plugin). El 0,13% del audio de la ejecucion de 32 llamadas y el 1,00% de la de 64 llamadas volvieron por encima del limite de 40 ms del plugin y pasaron sin filtrar. Con `AudioInputOptions(frame_size_ms=20)` y `--chunk-hops 2` el retardo es de 30 ms (50 ms), a costa de menos llamadas por GPU.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; el modelo tiene 555M de parametros (aproximadamente 2,2 GB en fp32 y 1,1 GB en fp16 para los pesos) y mantiene 115 MB de estado por llamada activa.
- GPU recomendadas: no se especifican modelos concretos; la model card indica que un unico servidor GPU atiende todas las llamadas y que el servidor se construye con `voice_isolator/Dockerfile`.
- Capacidad en GPU de consumo: no disponible.
- Opciones de despliegue: servidor propio `vi.server_mp` (con `--workers 8 --enroll-loud --chunk-hops 4 --max-streams 128 --port 8765`), `vi.server` por WebSocket, plugin de LiveKit (RemoteIsolator y LocalIsolator), y la clase `Stream` en Python para uso en proceso.
- Latencia y throughput: 40 ms de retardo mediano con 32 llamadas simultaneas y 50 ms con 64 llamadas; respuesta por trama de 14 ms en la mediana y 30 ms como maximo; version CPU destilada de 22M de parametros en un solo hilo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Scicom-intl/voice-isolator | 555M | 10 s de audio causal | other | Hugging Face |
| Scicom-intl/voice-isolator-cpu | 22M (destilado) | 10 s de audio causal | no disponible | Hugging Face |
| VoxLock | no disponible | no disponible | no disponible | referenciado como sistema comparado en el benchmark |

No se dispone de datos de parametros, contexto ni licencia de VoxLock en la informacion proporcionada; solo se indica que es un sistema comparable en el benchmark de WER de STT y que, en vivo, va por delante en dos de las nueve pruebas.

## Limitaciones y advertencias

- El modelo solo soporta ingles segun el campo `language` de la model card.
- La licencia es "other"; no se detallan en la informacion disponible las condiciones exactas para uso comercial, por lo que es necesario revisar los terminos del repositorio antes de un despliegue en produccion.
- El enrolamiento automatico requiere al menos 3 segundos de llamada para empezar a funcionar y se fija a los 15 segundos; antes de ese punto la calidad del aislamiento puede ser menor.
- El modelo es causal, por lo que no utiliza informacion futura del audio; esto puede limitar la calidad frente a sistemas no causales.
- En el benchmark de 64 llamadas simultaneas, el 1,00% del audio volvio por encima del limite de 40 ms del plugin y paso sin filtrar, lo que puede degradar el STT en esos fragmentos.
- No se dispone de informacion sobre sesgos conocidos, riesgo de alucinacion (no aplica directamente a una tarea de aislamiento de audio) ni limitaciones de idioma mas alla del ingles.
- No se han publicado en la informacion disponible datos sobre cuantizacion, lo que limita las opciones de reduccion de memoria en despliegues con recursos ajustados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Scicom-intl/voice-isolator
- Version CPU destilada: https://huggingface.co/Scicom-intl/voice-isolator-cpu
- Paper *The Voice on the Line*: https://arxiv.org/abs/2610.35272
- Plugin de LiveKit (STT-API): https://github.com/Scicom-AI-Enterprise-Organization/STT-API/tree/main/stt_api/livekit_plugin/voice_isolator
- Ejemplo AMI EN2002c: https://huggingface.co/Scicom-intl/voice-isolator/resolve/main/examples/ami_en2002c_8s/ami_en2002c_8s.mp4
- Ejemplo AMI ES2004c: https://huggingface.co/Scicom-intl/voice-isolator/resolve/main/examples/ami_es2004c_70s/ami_es2004c_70s.mp4
