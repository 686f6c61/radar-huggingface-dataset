# samadpls/baari

## Resumen

baari (باری, "turno" en urdu) es un modelo de deteccion de fin de turno (end-of-turn detection) para agentes de voz en urdu. Lo desarrolla samadpls y se publica como un clasificador de audio ONNX de 8,8 MB en su variante int8 por defecto. Resuelve un problema concreto de los sistemas conversacionales por voz: decidir, en cada pausa del hablante, si este ha terminado de hablar (responder ya) o solo esta haciendo una pausa a mitad de frase (seguir escuchando). Sin esta señal, los agentes de voz o interrumpen demasiado pronto o esperan en exceso, degradando la fluidez de la conversacion.

El modelo parte de Indic Smart Turn tiny, un encoder de Whisper-tiny con pooling por atencion y un clasificador pequeno de unos 8 millones de parametros, y se afina sobre conversaciones telefonicas reales en urdu. La interfaz es identica a la de Smart Turn de Pipecat, por lo que sustituye a este en una sola linea de codigo. Es relevante ahora porque cubre un idioma poco atendido (urdu) en el ecosistema de agentes de voz y porque ofrece latencias de 12 a 36 ms en CPU, lo que lo hace desplegable sin GPU.

La licencia es BSD-2-Clause, permisiva para uso comercial, y el repositorio ocupa 0,1 GB. No es un modelo generativo: es un clasificador binario que devuelve la probabilidad de que el hablante haya terminado su turno.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder de Whisper-tiny con attention pooling y clasificador pequeno (transformer encoder) |
| Parametros totales | Aproximadamente 8 millones |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 8 segundos de audio de entrada (espectrograma log-mel de 80 x 800) |
| Tipos de cuantizacion | int8 (por defecto) y fp32 |
| Idiomas soportados | Urdu (ur) |
| Licencia | BSD-2-Clause |
| Formato de pesos | ONNX (baari-int8.onnx, baari-fp32.onnx) y PyTorch (baari.pt) |

## Arquitectura y entrenamiento

El modelo reutiliza la arquitectura de Indic Smart Turn tiny: un encoder de Whisper-tiny seguido de attention pooling y una cabeza clasificadora pequena. La entrada es el espectrograma log-mel de Whisper de los ultimos 8 segundos de audio a 16 kHz, con relleno de ceros al principio y normalizacion de media cero y varianza unitaria, con forma `[batch, 80, 800]`. La salida es un tensor `logits` de forma `[batch, 1]` que, pese al nombre, contiene la probabilidad de que el hablante haya terminado; por encima de 0,5 se interpreta como "responder ya".

El entrenamiento parte de los pesos fp32 de Indic Smart Turn tiny, que solo se distribuia en ONNX y se reconstruyeron en PyTorch (la comprobacion de equivalencia con el ONNX original queda dentro de 6e-6). Se usaron 57.182 clips de conversaciones del split `train` de IndicVoices en urdu, excluyendo los hablantes de test y ambos lados de cada llamada de test, y se mezclaron 39.925 clips del split de entrenamiento de Indic Smart Turn (11 idiomas indios adicionales) para preservar el conocimiento previo. En total, 97.107 clips de entrenamiento, de los cuales 17.417 son "inacabados". Las etiquetas las genero un agente LLM que leyo cada transcripcion en orden y marco si el hablante habia terminado al final de cada segmento, usando un prompt publicado en el repositorio. Cada clip toma los ultimos 8 segundos de audio que terminan en el segmento, con los segmentos anteriores del hablante como contexto.

El ajuste fue de 3 epocas con AdamW, tasa de aprendizaje 2e-5 con warm-up y decaimiento lineal, batch de 64 y fp16, en una sola GPU T4 durante 34 minutos. Cada batch pondera las clases segun su frecuencia.

## Capacidades

- Deteccion de fin de turno: clasifica si el hablante ha terminado o solo hace una pausa, devolviendo una probabilidad entre 0 y 1.
- Integracion directa con Pipecat mediante `LocalSmartTurnAnalyzerV3`, sustituyendo Smart Turn con una linea.
- API Python sencilla (`TurnDetector`) con metodos `is_finished()` y `probability()`.
- Entrada de audio mono a 16 kHz, en float o int16; requiere remuestreo previo si el audio es de 8 kHz (telefonia).
- Inferencia en CPU con 1 o 4 hilos, sin necesidad de GPU.
- No soporta tool calling, agentes multi-paso, vision ni audio generativo; es exclusivamente un clasificador binario de audio.

## Casos de uso

- Agentes de voz telefonicos en urdu: el modelo decide en cada pausa si el usuario ha terminado para disparar la respuesta del agente, reduciendo interrupciones y esperas innecesarias en llamadas reales.
- Integracion en pipelines de Pipecat: se sustituye Smart Turn v3.2 por baari con `LocalSmartTurnAnalyzerV3(smart_turn_model_path=model_path())`, manteniendo el resto del pipeline intacto y mejorando la precision en urdu.
- Atencion al cliente automatizada: al gestionar conversaciones multi-turno, la deteccion fiable de fin de turno evita que el bot responda a mitad de una frase del cliente, algo critico en un idioma con pausas frecuentes.
- Despliegue en servidores sin GPU: con 12 ms por llamada a 4 hilos y 36 ms a 1 hilo en CPU (M3 Pro), permite atender muchas llamadas concurrentes en hardware modesto usando 1 hilo por llamada.
- Sistemas de transcripcion con diarizacion en tiempo real: la senal de fin de turno ayuda a segmentar el habla y cerrar turnos en la transcripcion de llamadas en urdu.
- Investigacion en agentes de voz multilingues: sirve como punto de partida o referencia para afinar detectores de turno en otros idiomas poco representados, dado que el autor documenta el proceso completo de reconstruccion de pesos y etiquetado.
- Evaluacion comparativa de detectores de turno: con sus metricas publicadas y su conjunto de test, permite comparar alternativas como Smart Turn v3.2 o urdu-turn-v2 en condiciones controladas.

## Benchmarks y rendimiento

Conjunto de test: 1.588 clips de conversaciones telefonicas reales en urdu del split `valid` de IndicVoices (1.470 terminados, 118 inacabados). La metrica justa es la exactitud balanceada, ya que la clase mayoritaria es "terminado". Un modelo que siempre responde "terminado" obtiene un 50%.

| Modelo | Exactitud balanceada (IC 95%) | Espera si inacabado | Responde si terminado |
|---|---|---|---|
| baari int8 (por defecto) | 77,0% (72,9-81,0) | 62,7% | 91,4% |
| baari fp32 | 76,8% (72,4-80,7) | 63,6% | 89,9% |
| Indic Smart Turn tiny (int8) | 73,4% (69,0-77,8) | 61,0% | 85,9% |
| Indic Smart Turn base (fp32) | 70,9% (66,5-75,4) | 47,5% | 94,4% |
| Indic Smart Turn tiny (fp32) | 70,0% (65,8-74,4) | 51,7% | 88,4% |
| Smart Turn v3.2 (CPU, int8) | 63,4% (58,8-68,1) | 57,6% | 69,2% |
| Smart Turn v3.2 (GPU, fp32) | 58,8% (54,8-63,0) | 76,3% | 41,3% |
| PuristanLabs1/urdu-turn-v2 | 51,8% (48,4-55,4) | 16,9% | 86,7% |

Notas del autor: la exactitud de int8 depende de la CPU; baari int8 obtiene 77,0% en Arm (Apple) y 74,9% en x86 (Intel y AMD), mientras que fp32 obtiene 76,8% en ambas. En los mismos clips, baari fp32 supera a Indic Smart Turn tiny int8 en 3,3 puntos (bootstrap emparejado, IC 95% +0,3 a +6,4) y a su punto de partida, Indic Smart Turn tiny fp32, en 6,7 puntos (+3,8 a +10,0).

Latencia por llamada, incluida la preparacion del audio, en CPU de un MacBook Pro (M3 Pro):

| Fichero | 1 hilo | 4 hilos |
|---|---|---|
| int8 (por defecto) | 36 ms | 12 ms |
| fp32 | 77 ms | 23 ms |

## Requisitos de hardware

- VRAM: no requiere GPU; el modelo int8 ocupa 8,8 MB y el fp32 32 MB, por lo que cabe en memoria RAM de cualquier maquina.
- GPU recomendadas: no necesarias. El autor evalua en CPU (MacBook Pro M3 Pro); en servidores se recomienda 1 hilo por llamada concurrente.
- GPU de consumo: irrelevante para este modelo; no hay dependencia de CUDA.
- Opciones de despliegue: ONNX Runtime a traves del paquete `baari` (pip), o integracion en Pipecat con `LocalSmartTurnAnalyzerV3`.
- Latencia: 36 ms a 1 hilo y 12 ms a 4 hilos para int8 en M3 Pro; 77 ms y 23 ms para fp32.
- Requisito de audio: 16 kHz mono; el audio telefonico de 8 kHz debe remuestrearse antes (por ejemplo, con `soxr.resample(audio, 8000, 16000)`).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto de audio | Exactitud balanceada | Licencia | Formato |
|---|---|---|---|---|---|
| baari (este modelo) | ~8 M | 8 s | 77,0% (int8) | BSD-2-Clause | ONNX, PyTorch |
| Indic Smart Turn tiny | ~8 M | 8 s | 73,4% (int8) | no disponible | ONNX |
| Indic Smart Turn base | no disponible | 8 s | 70,9% (fp32) | no disponible | ONNX |
| Smart Turn v3.2 | no disponible | 8 s | 63,4% (CPU int8) | no disponible | no disponible |
| PuristanLabs1/urdu-turn-v2 | no disponible | no disponible | 51,8% | no disponible | no disponible |

## Limitaciones y advertencias

- Solo soporta urdu; no se ha validado en otros idiomas, aunque se mezclaron datos de 11 idiomas indios durante el entrenamiento para preservar conocimiento.
- El conjunto de test esta desbalanceado (1.470 terminados frente a 118 inacabados), por lo que la exactitud bruta no es representativa; debe usarse la exactitud balanceada.
- La exactitud de int8 varia segun la CPU: 77,0% en Arm y 74,9% en x86. Para resultados consistentes entre plataformas, usar fp32.
- El modelo depende de etiquetas generadas por un agente LLM a partir de transcripciones, lo que puede introducir errores sistematicos en la definicion de "turno terminado".
- Requiere audio a 16 kHz; el audio telefonico de 8 kHz debe remuestrearse, y un remuestreo deficiente puede degradar la deteccion.
- Es un clasificador binario: no genera texto ni mantiene estado conversacional; la logica del agente debe gestionarse fuera del modelo.
- Licencia BSD-2-Clause, permisiva para uso comercial, pero conviene revisar las licencias de los datos de origen (IndicVoices) si se redistribuye el modelo o se usa en produccion.
- El repositorio tiene 0 descargas en el momento de la consulta y fue creado en noviembre de 2026, por lo que su validacion en produccion es limitada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/samadpls/baari
- Codigo en GitHub: https://github.com/samadpls/baari
- Paquete en PyPI: https://pypi.org/project/baari/
- Sitio del autor: https://samadpls.com
- Smart Turn (Pipecat): https://github.com/pipecat-ai/smart-turn
- Pipecat: https://github.com/pipecat-ai/pipecat
- Prompt de etiquetado: https://github.com/samadpls/baari/blob/main/prompts/label.md
- Modelo base: https://huggingface.co/adimyth/indic-smart-turn
- Dataset IndicVoices: https://huggingface.co/datasets/ai4bharat/IndicVoices
- Dataset de entrenamiento: https://huggingface.co/datasets/adimyth/indic-smart-turn-data
