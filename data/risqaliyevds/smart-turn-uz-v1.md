# risqaliyevds/smart-turn-uz-v1

## Resumen

smart-turn-uz-v1 es un modelo de deteccion de fin de turno (end-of-turn detection) para agentes de voz telefonicos en uzbeko. Lo desarrolla el usuario risqaliyevds como un fine-tune adicional de gurinbaev/smart-turn-uz, que a su vez deriva de pipecat-ai/smart-turn-v3. El modelo resuelve un problema concreto de los agentes conversacionales por telefono: decidir si el interlocutor ha terminado de hablar o simplemente ha hecho una pausa, a partir de los ultimos 8 segundos de audio del canal del llamante.

La arquitectura es la de Smart Turn v3: un encoder Whisper tiny seguido de un clasificador, con unos 8 millones de parametros en total. El modelo recibe caracteristicas log-mel de Whisper (80 x 800 para 8 segundos de audio a 16 kHz) y devuelve la probabilidad de que el turno haya terminado. No genera texto ni transcribe: es un clasificador binario de audio orientado a la latencia, con unos 65 ms por peticion en un solo hilo de CPU en PyTorch.

Su relevancia actual esta en el rendimiento medido: alcanza un AUC de 0.900 en llamadas telefonicas uzbekas de validacion, frente a 0.790 de su modelo base y 0.615 de Smart Turn v3.2 original. Se distribuye en formato PyTorch y ONNX con licencia BSD 2-Clause, lo que facilita su integracion en pipelines de telefonia en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder Whisper tiny + clasificador (Smart Turn) |
| Parametros totales | ~8 millones |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8 segundos de audio (ventana fija) |
| Tipos de cuantizacion | no disponible (se distribuyen pesos PyTorch y ONNX en float32) |
| Idiomas soportados | uzbeko (uz), ruso (ru) |
| Licencia | BSD 2-Clause |
| Formato de pesos | PyTorch `state_dict` (`.pt`) y ONNX (`.onnx`) |

## Arquitectura y entrenamiento

El modelo reutiliza sin cambios la arquitectura de Smart Turn v3: un encoder Whisper tiny que procesa caracteristicas log-mel de 8 segundos de audio (tensor `[batch, 80, 800]`) y un clasificador que produce un logit de fin de turno. La extraccion de caracteristicas se realiza fuera del grafo ONNX, a diferencia del grafo de audio crudo de smart-turn-uz. El modelo base se entreno sobre llamadas telefonicas uzbekas y rusas; este fine-tune parte de los pesos publicados de smart-turn-uz y anade una etapa adicional sobre un conjunto privado mas amplio de llamadas uzbekas.

El entrenamiento uso etiquetas automaticas: un punto de decision es una pausa de 0.2 s en el habla del interlocutor, y la etiqueta es `end` si otro hablante toma la palabra primero, o `continue` si el mismo hablante prosigue poco despues. Se excluyeron casos ambiguos como solapamientos y backchannels cortos. Se entrenaron 3 epocas con batch 64, optimizador AdamW (weight decay 0.01), learning rate 5e-5 con warm-up y decaimiento coseno, precision mixta fp16, y se publicaron los pesos promediados con EMA (0.999). Como aumento de datos se aplicaron desplazamiento temporal pequeno, enmascaramiento de frecuencia y de tiempo, sin enmascarar nunca los ultimos 0.6 s de la frase. El checkpoint se selecciono sobre llamadas de validacion separadas.

## Capacidades

- Clasificacion binaria de fin de turno: devuelve la probabilidad de que el interlocutor haya terminado de hablar.
- Deteccion de pausas en audio telefonico de 8 kHz remuestreado a 16 kHz.
- Procesamiento de audio mono a 16 kHz en float32 en el rango [-1, 1].
- Inferencia de baja latencia: aproximadamente 65 ms por peticion en un hilo de CPU.
- Soporte de dos formatos de ejecucion: PyTorch y ONNX Runtime (CPUExecutionProvider), con coincidencia numerica de 5e-7 en probabilidad.
- Manejo de audio mas corto que 8 segundos mediante relleno de ceros a la izquierda.
- No soporta tool calling, agentes, generacion de texto, vision ni audio generativo: es exclusivamente un clasificador de audio.

## Casos de uso

- Agentes de voz telefonicos en tiempo real: el modelo se consulta en cada pausa de 0.2 s del llamante para decidir si el agente debe responder o seguir escuchando, evitando interrupciones prematuras en conversaciones uzbekas.
- Telefonia de atencion al cliente en uzbeko: integrado en un pipeline de ASR y TTS, permite segmentar los turnos del llamante antes de transcribir y responder, reduciendo la latencia percibida.
- Sistemas de IVR con reconocimiento de habla: sustituye los temporizadores fijos de silencio por una decision basada en el contenido acustico, mejorando la deteccion de pausas dubitativas frente a finales reales.
- Enrutamiento de llamadas con mezcla de uzbeko y ruso: el modelo se entreno sobre llamadas con palabras rusas intercaladas, por lo que puede operar en entornos bilingues de telefonia en Asia Central.
- Investigacion en deteccion de turnos: sirve como checkpoint de referencia para experimentos de end-of-turn detection en lenguas de bajos recursos, con AUC documentado y pesos ONNX reproducibles.
- Despliegue en CPU sin GPU: al ejecutarse en ONNX Runtime sobre un solo hilo de CPU con ~65 ms por peticion, es viable en servidores de telefonia sin aceleradores dedicados.
- Evaluacion de umbrales en produccion: el modelo permite ajustar el umbral de decision (por ejemplo 0.84 para un 5 % de falsos finales, o 0.74 para un 10 %) segun la tolerancia del agente a interrumpir.

## Benchmarks y rendimiento

Resultados medidos sobre llamadas telefonicas de test no usadas en entrenamiento ni en seleccion de checkpoint. AUC: 0.5 es azar, 1.0 es perfecto.

| Modelo | AUC |
|---|---|
| Smart Turn v3.2, tal como se publico | 0.615 |
| smart-turn-uz, tal como se publico | 0.790 |
| smart-turn-uz-v1 (este modelo) | 0.900 |

La mejora sobre smart-turn-uz es de +0.110 (intervalo del 95 %: +0.098 a +0.123).

Deteccion de finales reales de turno con una tasa fija de turnos inacabados clasificados erroneamente como finalizados:

| Turnos inacabados clasificados como finalizados | smart-turn-uz | smart-turn-uz-v1 | Umbral de smart-turn-uz-v1 |
|---|---|---|---|
| 5 % | 27 % de finales | 50 % de finales | 0.84 |
| 10 % | 41 % de finales | 66 % de finales | 0.74 |

Nota del autor: el modelo base obtiene 0.822 en su propio conjunto de test, con una definicion distinta de fin de turno; smart-turn-uz-v1 no se ha evaluado en ese conjunto. La latencia es de unos 65 ms por peticion en un hilo de CPU en PyTorch, igual que el modelo base.

## Requisitos de hardware

- VRAM estimada: no disponible; el modelo es de ~8 millones de parametros y esta pensado para ejecucion en CPU.
- GPU recomendadas: no disponibles; no se documenta entrenamiento ni inferencia en GPU. Cualquier GPU consumer moderna (por ejemplo RTX 4090) es sobradamente suficiente por tamano, pero no hay datos publicados.
- Cabe en GPU consumer: si, por tamano (~8M parametros), aunque el caso de uso documentado es CPU.
- Opciones de despliegue: PyTorch (`smart_turn.py` con `state_dict`) y ONNX Runtime con `CPUExecutionProvider`; no se documentan vLLM, llama.cpp, Ollama ni TGI, que no aplican a un clasificador de audio.
- Latencia y throughput: ~65 ms por peticion en un solo hilo de CPU en PyTorch; no se publica throughput agregado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | AUC (test propio) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| smart-turn-uz-v1 | ~8M | 8 s de audio | 0.900 | BSD 2-Clause | Hugging Face (PyTorch + ONNX) |
| gurinbaev/smart-turn-uz | ~8M | 8 s de audio | 0.790 (test de este modelo) / 0.822 (test propio) | BSD 2-Clause | Hugging Face (PyTorch) |
| pipecat-ai/smart-turn-v3 (v3.2) | ~8M | 8 s de audio | 0.615 (test de este modelo) | BSD 2-Clause | Hugging Face (multilingue) |

## Limitaciones y advertencias

- Entrenado y evaluado solo con llamadas telefonicas, mayoritariamente en uzbeko con palabras rusas intercaladas; el habla completamente en ruso no se evaluo por separado.
- La definicion de "end" es que otro hablante tome la palabra en una conversacion humana, lo que se aproxima pero no coincide exactamente con el momento en que un agente de voz deberia responder.
- Las etiquetas son automaticas y por tanto ruidosas, lo que introduce incertidumbre en el rendimiento real.
- Los backchannels se excluyeron del entrenamiento, igual que en el modelo base; el modelo solo distingue "terminado o no".
- Los umbrales difieren de los del modelo base: no se debe reutilizar 0.7 sin validarlo sobre las llamadas propias.
- Los datos de entrenamiento y test son privados y no se comparten, lo que limita la reproducibilidad de las cifras.
- Riesgo de alucinacion no aplica en el sentido generativo, pero si existe riesgo de falsos positivos y negativos en la clasificacion.
- Licencia BSD 2-Clause: permite uso comercial con atribucion y conservacion del aviso de copyright; no se documentan restricciones adicionales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/risqaliyevds/smart-turn-uz-v1
- Modelo base: https://huggingface.co/gurinbaev/smart-turn-uz
- Modelo original Smart Turn v3: https://huggingface.co/pipecat-ai/smart-turn-v3
