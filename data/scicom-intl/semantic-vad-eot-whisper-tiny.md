# Scicom-intl/semantic-vad-eot-whisper-tiny

## Resumen

Este modelo, desarrollado por Scicom-intl, es un detector de fin de turno (end-of-turn, EOT) para agentes de voz. Se basa en el codificador de Whisper-tiny y añade una pequeña cabeza de clasificación sobre una ventana fija de 8 segundos de audio a 16 kHz. Su función es devolver la probabilidad de que una persona haya terminado de hablar, sin necesidad de transcripción. Esto permite que un agente de voz responda en cuanto se detecta un silencio breve, en lugar de esperar a un sistema de reconocimiento de voz (STT).

El modelo está entrenado con telefonía real de centros de llamadas en Malasia, en malayo e inglés, donde los finales de turno se observan directamente (cuando la otra parte toma la palabra). Con solo 8 millones de parámetros y una exportación int8 de 10 MB, ofrece una latencia de aproximadamente 30 ms por predicción en un único hilo de CPU, lo que lo hace apto para despliegues en tiempo real. Es una alternativa ligera y audionativa a detectores como smart-turn-v3, con mejor rendimiento en los benchmarks del autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Codificador Whisper-tiny + cabeza de clasificación (audio classification) |
| Parametros totales | 8 millones (8 M) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 8 segundos de audio a 16 kHz (ventana fija, no contexto de texto) |
| Tipos de cuantizacion | int8 ONNX (10 MB); también safetensors |
| Idiomas soportados | Malayo (ms) e inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (int8) y safetensors |

## Arquitectura y entrenamiento

La arquitectura sigue la misma receta que pipecat smart-turn-v3: utiliza el codificador de Whisper-tiny como backbone y añade una pequeña cabeza de clasificación. La entrada es una ventana de audio de 8 segundos alineada a la izquierda, muestreada a 16 kHz. El modelo no usa transcripciones, sino directamente el audio, y produce una probabilidad `p(end of turn)` en el rango 0-1.

El entrenamiento se realizó con llamadas reales de centros de llamadas malasios, incluyendo tanto el canal del cliente como el del agente. Los finales de turno se definen de forma observada: el turno termina cuando la otra parte toma la palabra, no cuando hay un hueco de silencio inferido. No se menciona uso de RLHF ni DPO. La innovación técnica destacable es su eficiencia: un modelo pequeño, optimizado a int8 ONNX, que mantiene una curva de puntuación suave y monótona a lo largo de las pausas, con una desviación local de 0,04 sobre 200 ms y solo un 1,5 % de cambios de umbral por paso de 20 ms (frente a 0,12 y 9,8 % de smart-turn-v3).

## Capacidades

- Detección de fin de turno (EOT) en audio, sin necesidad de transcripción ni STT.
- Procesa ventanas fijas de 8 segundos de audio a 16 kHz.
- Devuelve una probabilidad continua de fin de turno.
- Bilingüe: malayo e inglés, entrenado en telefonía real.
- Integración con LiveKit Agents: pipeline Silero VAD → turn detector → endpointing.
- Muy ligero: 8 M de parámetros y 10 MB en int8 ONNX.
- Latencia de ~30 ms por predicción en un único hilo de CPU.
- Variantes disponibles: whisper-tiny (este modelo), whisper-base y whisper-small.

## Casos de uso

- Agentes de voz en tiempo real: el modelo permite que el agente responda en cuanto el usuario termina de hablar, sin esperar a un STT. Al ser audionativo, se puede ejecutar en un pipeline LiveKit con una latencia p50 de 0,64 s.
- Centros de llamadas: análisis de turnos en llamadas reales para mejorar la calidad del servicio y detectar interrupciones. El modelo está entrenado específicamente con telefonía de centros de llamadas.
- Sistemas de respuesta interactiva (IVR): al detectar el fin de turno del usuario, el sistema puede pasar al siguiente prompt o acción sin esperar un timeout largo.
- Transcripción de reuniones: en combinación con un VAD, el modelo segmenta correctamente los turnos de habla, lo que facilita la generación de transcripciones estructuradas.
- Automatización de atención al cliente: integrado en un agente de LiveKit, reduce la latencia de respuesta y mantiene una tasa de interrupciones comparable a la de un VAD por sí solo.
- Despliegue en edge o sistemas con CPU limitada: gracias a su tamaño de 10 MB y a su bajo coste computacional, puede ejecutarse en dispositivos con un solo hilo de CPU, lo que lo hace apto para routers, gateways de telefonía o hardware de baja potencia.

## Benchmarks y rendimiento

El autor presenta resultados en un pipeline real de LiveKit Agents 1.8, con 300 turnos de telefonía grabados y configuración por defecto (Silero VAD con silencio de 0,55 s, `min_delay` 0,5 s, `max_delay` 3,0 s). La latencia se mide desde el verdadero fin de habla del llamador hasta el commit del pipeline; un corte es un commit durante una pausa intermedia.

| Turn detector | Latencia p50 / p90 | Turnos cortados | Turnos completados en fast path | AUC (eot vs hold) |
|---|---:|---:|---:|---:|
| Solo VAD | 0,63 / 0,71 s | 14,3 % | – | – |
| smart-turn-v3, umbral 0,5 | 0,65 / 3,04 s | 10,0 % | 82 % | 0,74 |
| **Este modelo, umbral 0,5** | **0,64 / 0,74 s** | 10,0 % | **95 %** | **0,84** |
| Este modelo, umbral 0,6 | 0,65 / 0,80 s | 9,7 % | 92 % | 0,84 |
| Este modelo, umbral 0,6, silencio VAD 0,4 s | **0,49 / 0,66 s** | 14,0 % | 92 % | 0,84 |
| Variante whisper-base, umbral 0,3 | 0,64 / 0,74 s | 9,7 % | 96 % | 0,88 |

En pruebas offline, con puntos de corte fijos relativos al inicio de cada pausa, el AUC del modelo int8 es:

| Corte relativo al inicio de la pausa | −0,4 s | −0,2 s | 0,0 s | +0,2 s | +0,6 s |
|---|---:|---:|---:|---:|---:|
| smart-turn-v3 | 0,60 | 0,62 | 0,63 | 0,65 | 0,69 |
| **Este modelo (int8)** | **0,72** | **0,78** | **0,80** | **0,81** | **0,97** |

En el harness eot-bench de LiveKit, con 1 000 turnos de telefonía (inglés y malayo), este modelo reduce la tasa de cortes frente a smart-turn-v3 y al baseline VAD en los puntos de operación evaluados. Por ejemplo, con un presupuesto de latencia de 300 ms, la tasa de corte es del 50,8 % en inglés y del 55,0 % en malayo, frente al 69,6 % y 78,1 % de smart-turn-v3. A un presupuesto de corte del 5 %, iguala al temporizador del VAD, mientras que a un presupuesto del 10 % la latencia es menor que la de las alternativas.

## Requisitos de hardware

- VRAM estimada: el modelo es un ONNX int8 de 10 MB; no requiere VRAM significativa. Puede ejecutarse íntegramente en CPU.
- GPU recomendadas: ninguna. El modelo funciona con un único hilo de CPU a ~30 ms por predicción. Si se usa a través de Transformers, cualquier GPU con 1 GB de VRAM es más que suficiente.
- Cabe en consumer GPU: sí, pero no es necesario; el despliegue en CPU es la opción natural.
- Opciones de despliegue: ONNX Runtime, Transformers (PyTorch), LiveKit Agents, pipecat, o cualquier runtime que soporte ONNX int8.
- Latencia y throughput: ~30 ms por predicción en un hilo de CPU (según el autor). Esto permite múltiples instancias en paralelo en servidores modestos.

## Comparativa con modelos similares

| Modelo | Parámetros | Latencia en CPU | AUC (LiveKit) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (tiny) | 8 M | ~30 ms | 0,84 | Apache-2.0 | HuggingFace |
| smart-turn-v3 | no disponible | ~65 ms | 0,74 | no disponible | HuggingFace (pipecat) |
| Variante base | no disponible | no disponible | 0,88 | Apache-2.0 | HuggingFace |

El modelo supera a smart-turn-v3 en latencia y AUC, y mantiene una tasa de interrupciones equivalente o mejor. La variante base ofrece más margen de ranking (AUC 0,88) pero con un coste computacional mayor no especificado. El baseline VAD puro, sin detector semántico, presenta una tasa de cortes más alta (14,3 % en el pipeline LiveKit) y no tiene capacidad para distinguir entre una pausa mediana y un final de turno.

## Limitaciones y advertencias

- El entrenamiento se realizó principalmente con telefonía de centros de llamadas de Malasia, por lo que la generalización a otros acentos, idiomas o condiciones acústicas (ruido de fondo, calidad de micrófono) puede ser limitada.
- Al ser un modelo pequeño, puede tener más falsos positivos o negativos que las variantes base o small, especialmente en acentos o situaciones fuera del dominio de entrenamiento.
- No es un VAD en sí mismo: requiere un VAD previo (por ejemplo, Silero) en el pipeline. Si el VAD falla, el detector no puede funcionar correctamente.
- La ventana fija de 8 segundos limita el contexto. Si una persona habla durante más de 8 segundos sin pausa, el modelo solo verá los últimos 8 segundos, lo que puede afectar a la detección en intervenciones muy largas.
- No se han publicado resultados de benchmarks en conjuntos de datos públicos fuera de la telefonía privada del autor. Los resultados presentados provienen del propio modelo card y no han sido verificados de forma independiente.
- El modelo solo procesa audio; no utiliza transcripciones. En escenarios donde la información semántica del texto sería útil (por ejemplo, detectar finales de turno basados en el contenido), este modelo no puede aprovecharla.
- La licencia Apache-2.0 permite uso comercial, pero los usuarios deben verificar que los datos de entrenamiento (telefonía de centros de llamadas) cumplen con las normativas aplicables.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Scicom-intl/semantic-vad-eot-whisper-tiny
- Variante base: https://huggingface.co/Scicom-intl/semantic-vad-eot-whisper-base
- Variante small: https://huggingface.co/Scicom-intl/semantic-vad-eot-whisper-small
- Repo eot-bench de LiveKit: https://github.com/livekit/eot-bench
