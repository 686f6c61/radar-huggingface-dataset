# abhishek-040010/smart-turn-hinglish

## Resumen

Smart Turn Hinglish es un modelo acústico de detección de turnos conversacionales diseñado para agentes de voz en tiempo real que operan en entornos bilingües hindi-inglés (Hinglish). Desarrollado por Abhishek Agrawal, el modelo resuelve el problema del endpointing: decidir si un hablante ha terminado su turno o si está haciendo una pausa a mitad de pensamiento, incluyendo hesitaciones y conectores como "kyunki...", "lekin..." o "matlab...". Esta decisión es crítica en sistemas de voz conversacional, donde responder demasiado pronto interrumpe al usuario y responder demasiado tarde genera latencia perceptible.

El modelo se basa en el encoder de Whisper de OpenAI (versiones tiny y base), descartando el decoder, y añade una cabeza de pooling por atención con LayerNorm y MLP. Se distribuye en formato ONNX optimizado para inferencia de baja latencia, con dos variantes: una de 32,3 MB basada en Whisper-Tiny y otra de 79,9 MB basada en Whisper-Base. El contexto acústico procesado es de 8 segundos de audio, alineado a la derecha mediante padding por la izquierda. Su relevancia actual radica en la creciente adopción de agentes de voz en India, donde el code-switching entre hindi e inglés es la norma y los modelos entrenados solo en inglés fallan en la detección de final de turno.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder Whisper (tiny o base) + cabeza de pooling por atencion con LayerNorm y MLP |
| Parametros totales | No disponible (Whisper-Tiny encoder: ~4 M; Whisper-Base encoder: ~23 M, mas cabeza de atencion) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 8,0 segundos de audio (80 canales log-mel, 800 frames) |
| Tipos de cuantizacion | ONNX (sin cuantizacion adicional documentada) |
| Idiomas soportados | Hindi, ingles y code-switching Hinglish |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (dos archivos: 32,3 MB y 79,9 MB) |

## Arquitectura y entrenamiento

La arquitectura reutiliza el encoder de Whisper de OpenAI, eliminando el decoder y los embeddings posicionales se recortan de 1500 a 400 frames para ajustarse a la ventana de 8 segundos. El encoder transforma el espectrograma log-mel de 80 canales en representaciones de 384 dimensiones (variante tiny) o 512 dimensiones (variante base). Sobre estas representaciones se aplica una cabeza de pooling por atencion aprendida, compuesta por LayerNorm seguida de un MLP, que produce una probabilidad de final de turno. El audio se procesa con padding por la izquierda (left-padding) para que la silaba final se alinee en el frame 400, lo que permite que la cabeza de atencion pondere correctamente la informacion reciente.

Los datos de entrenamiento no estan documentados en la model card. Se menciona un benchmark humano con 518 clips de Hinglish real, pero no se especifica la composicion del dataset de entrenamiento ni si se aplicaron tecnicas como RLHF o DPO. La evaluacion incluye un conjunto de test de Pipecat con 1.000 clips (500 en ingles y 500 en hindi), lo que sugiere que el entrenamiento pudo combinar datos propios con datos publicos de Pipecat.

## Capacidades

- Deteccion de final de turno conversacional en audio de 8 segundos, devolviendo una probabilidad entre 0 y 1.
- Distincion entre pausas de hesitacion (conectores como "kyunki...", "lekin...", "matlab...") y finales de turno reales.
- Soporte de code-switching hindi-ingles, incluyendo acentos indios en ingles.
- Inferencia en CPU con latencia inferior a 50 ms (segun el repositorio GitHub asociado, para la variante tiny).
- Integracion con ONNX Runtime, lo que permite despliegue en multiples plataformas sin dependencias pesadas.
- Preprocesado compatible con WhisperFeatureExtractor de HuggingFace Transformers, facilitando la integracion en pipelines existentes.
- Umbral de decision calibrable (tau) para ajustar el equilibrio entre interrupcion (responder antes de tiempo) y latencia (esperar de mas).

## Casos de uso

- Agentes de voz de atencion al cliente en India: el modelo permite que un IVR o asistente virtual sepa cuando el cliente ha terminado de hablar, evitando interrupciones molestas. Su soporte de Hinglish lo hace adecuado para sectores como banca, telecomunicaciones o comercio electronico en el mercado indio.
- Asistentes de voz para reservas y pedidos: en restaurantes o servicios de delivery, el agente puede guiar al usuario por un flujo de confirmacion, detectando con precision cuando el usuario ha dado una respuesta completa frente a cuando esta dudando.
- Transcripcion y subtitulado en vivo: integrado en un pipeline de speech-to-text, el modelo puede marcar los puntos de cambio de hablante, mejorando la legibilidad de transcripciones de reuniones o entrevistas en Hinglish.
- Sistemas de entrevistas automatizadas: en procesos de seleccion de personal, el modelo puede detectar cuando el candidato ha terminado de responder, permitiendo que el sistema formule la siguiente pregunta sin pisar la respuesta anterior.
- Juegos y aplicaciones de voz interactivas: en experiencias de voz para entretenimiento, el modelo permite que el personaje virtual responda en el momento adecuado, manteniendo un ritmo conversacional natural.
- Evaluacion de calidad de llamadas en contact centers: el modelo puede analizar grabaciones para detectar patrones de interrupcion o solapamiento, ayudando a los supervisores a identificar agentes que interrumpen con frecuencia a los clientes.

## Benchmarks y rendimiento

### Benchmark humano de Hinglish (518 clips)

| Modelo | Umbral optimo (tau*) | Tasa de retencion de turnos incompletos (TNR) | Recall de turnos completos (TPR) | Precision balanceada | ROC-AUC |
| :--- | :--- | :--- | :--- | :--- | :--- |
| Whisper-Tiny + cabeza de atencion | tau = 0,11 | 75,9% (186/245) | 44,7% (122/273) | 60,3% | 0,6008 |
| Stock Pipecat v3.2 | tau = 0,60 | 67,8% (166/245) | 72,2% (197/273) | 70,0% | 0,7501 |

### Conjuntos de test de Pipecat (1.000 clips)

| Conjunto | Precision balanceada | ROC-AUC |
| :--- | :--- | :--- |
| Ingles (500 clips) | 67,4% | 0,681 |
| Hindi (500 clips) | 72,4% | 0,777 |

El modelo tiny muestra un rendimiento inferior al stock de Pipecat en el benchmark humano de Hinglish, con una precision balanceada de 60,3% frente al 70,0%. Sin embargo, el modelo tiny retiene mejor los turnos incompletos (TNR 75,9% frente a 67,8%), lo que significa que es mas conservador a la hora de interrumpir. No se han publicado resultados para la variante base en estos benchmarks.

## Requisitos de hardware

- La variante tiny (32,3 MB) puede ejecutarse en CPU con latencia inferior a 50 ms, segun el repositorio GitHub asociado. Es adecuada para despliegue en edge devices, Raspberry Pi o servidores sin GPU.
- La variante base (79,9 MB) requiere algo mas de computo, pero sigue siendo ligera en comparacion con modelos de lenguaje grandes. Puede ejecutarse en CPU moderna o en GPUs de gama baja.
- VRAM estimada: inferior a 1 GB para ambas variantes, dado el tamano reducido de los pesos y la ausencia de decoder.
- GPUs recomendadas: cualquier GPU con soporte CUDA o incluso integradas (iGPU) para la variante tiny. Para despliegue masivo, una T4 o RTX 4090 puede servir multiples instancias simultaneas.
- Opciones de despliegue: ONNX Runtime (CPU y CUDA), integrable en pipelines de Pipecat, LiveKit o cualquier framework de agentes de voz. Tambien puede servirse como microservicio con FastAPI.
- Latencia: inferior a 50 ms en CPU para la variante tiny, lo que la hace apta para streaming en tiempo real.

## Comparativa con modelos similares

| Modelo | Tamano | Contexto | Enfoque | Licencia | Disponibilidad |
| :--- | :--- | :--- | :--- | :--- | :--- |
| Smart Turn Hinglish (tiny) | 32,3 MB | 8 s audio | Deteccion de turno acustica, Hinglish | Apache 2.0 | ONNX en HuggingFace |
| Stock Pipecat v3.2 | No disponible | No disponible | Deteccion de turno acustica, multilingue | No disponible | Parte de Pipecat |
| Hinglish-turn-detection (GitHub) | <10 M parametros | No disponible | Deteccion de turno acustica, Hinglish | No disponible | Codigo en GitHub |

La comparativa directa con Pipecat v3.2 muestra que el modelo stock tiene mejor precision balanceada en el benchmark humano, pero el modelo de Smart Turn Hinglish ofrece la ventaja de ser un artefacto autocontenido en ONNX, sin dependencias de un framework mayor. La alternativa de GitHub (Hinglish-turn-detection) es similar en filosofia pero no se han publicado benchmarks comparables.

## Limitaciones y advertencias

- El modelo tiny muestra un recall de turnos completos de solo 44,7% en el benchmark humano, lo que significa que en mas de la mitad de los turnos completos el sistema esperaria de mas antes de responder. Esto puede generar latencia perceptible en conversaciones reales.
- El rendimiento en el benchmark humano de Hinglish es inferior al stock de Pipecat (60,3% frente a 70,0% de precision balanceada), lo que sugiere que el modelo puede no ser la mejor opcion si la precision es prioritaria.
- No se han publicado resultados de la variante base en los benchmarks, por lo que se desconoce si ofrece una mejora sustancial sobre la variante tiny.
- El modelo solo procesa audio; no tiene acceso a informacion textual, semantica o de intencion del hablante. Un hablante que hace una pausa larga antes de continuar puede ser erroneamente detectado como final de turno.
- El umbral de decision optimo varia entre 0,11 y 0,68 segun el conjunto de datos, lo que indica sensibilidad al dominio y requiere calibracion por caso de uso.
- No se documentan sesgos especificos, pero al estar entrenado principalmente para Hinglish, su rendimiento en otros acentos o variantes del hindi puede degradarse.
- La licencia Apache 2.0 permite uso comercial sin restricciones, pero el modelo se distribuye sin garantias y sin documentacion sobre los datos de entrenamiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/abhishek-040010/smart-turn-hinglish
- Demo en HuggingFace Spaces: https://huggingface.co/spaces/AbhiCommits/smart-turn-hinglish
- Perfil del autor: https://huggingface.co/abhishek-040010
- Repositorio GitHub (proyecto relacionado): https://github.com/abhinav7289A/Hinglish-turn-detection
- Repositorio GitHub (smart-turn-hinglish): https://github.com/CodeWithMoin/smart-turn-hinglish
