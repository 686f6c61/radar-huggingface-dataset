# bmarti44/before-the-implant-causal-enhancer

## Resumen

Before the Implant es un modelo neuronal de mejora de voz (speech enhancement) diseñado específicamente para el contexto de usuarios de implante coclear. Lo desarrolla Brian Martin (bmarti44) en el marco de un hackathon de Meta centrado en personas sordas y con discapacidad auditiva, y su objetivo es limpiar una señal de voz ruidosa antes de que llegue al procesador de sonido de un implante. El modelo aborda el escenario más difícil para estos usuarios: aislar una voz objetivo dentro de una sala con múltiples conversaciones simultáneas.

Técnicamente es una red convolucional de tipo Conv-TasNet estrictamente causal (`CausalTasNetEnh`) que opera directamente sobre la forma de onda a 16 kHz mono, sin mirar hacia adelante en el tiempo. Con solo 602.510 parámetros y una latencia algorítmica de 5,88 ms, está pensada para un despliegue de bajísimo coste computacional, muy alejado de los grandes modelos generativos.

Su relevancia es doble: por un lado, demuestra que un modelo minúsculo puede aportar mejoras medibles en métricas de separación (SI-SDR) y de inteligibilidad (STOI) en mezclas sintéticas; por otro, es un ejemplo de investigación aplicada honesta, con una model card que explicita con claridad que no ha sido probado con oyentes reales ni con ningún implante.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Conv-TasNet causal (`CausalTasNetEnh`), dominio de forma de onda |
| Parámetros totales | 602.510 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (procesamiento por muestras, sin ventana de contexto definida) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | inglés (entrenado con LibriSpeech) |
| Licencia | MIT |
| Formato de pesos | safetensors (PyTorch) |
| Frecuencia de muestreo | 16 kHz mono |
| Latencia algorítmica | 5,88 ms (sin contar cómputo), retardo de 63 muestras |
| Lookahead | cero (estrictamente causal) |

## Arquitectura y entrenamiento

El modelo es un enhancer de forma de onda de estilo Conv-TasNet con restricción causal estricta: no utiliza información futura en ningún punto del cómputo. La salida está desplazada 63 muestras respecto a la entrada (`out[63 + n]` estima la señal limpia en `[n]`), lo que se traduce en los 5,88 ms de latencia algorítmica. El autor verifica la causalidad mediante una prueba de invariancia a sufijos en `model_causal.py`. La API de alto nivel (`enhance.py`) escala el fichero a RMS 0,14 (nivel de una mezcla de entrenamiento a 0 dB), elimina el retardo y restaura el nivel original de entrada.

El entrenamiento se realizó durante 24.000 pasos sobre mezclas construidas a partir de LibriSpeech train-clean-100 (CC BY 4.0): un hablante objetivo más babble de multitud (de 2 a 12 hablantes adicionales), ruido con espectro de voz o silencio, con relaciones señal-ruido entre −5 y +10 dB. La función de pérdida es SI-SDR negativa frente a la señal limpia desplazada por el retardo. Se publican tres semillas de entrenamiento (`model.safetensors` como predeterminada, más `seed18.safetensors` y `seed19.safetensors`). No se menciona uso de RLHF, DPO ni decodificación especulativa.

## Capacidades

- Mejora de voz en forma de onda (audio-to-audio) a 16 kHz mono, procesando muestra a muestra.
- Reducción de ruido y separación de una voz objetivo frente a babble de multitud (2-12 hablantes).
- Supresión de ruido con espectro de voz y de ruido blanco (este último con mejora limitada).
- Procesamiento estrictamente causal, apto para flujo en tiempo real con latencia algorítmica de 5,88 ms.
- Preservación de la longitud, la frecuencia de muestreo y el nivel RMS de la señal de entrada.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multimodales; es un modelo puramente de señal de audio.
- Multilingüismo: no disponible; solo se ha entrenado con inglés.

## Casos de uso

- Investigación en prótesis auditivas: servir como bloque de preprocesado evaluable en pipelines de simulación de implante coclear, como hace el propio autor con la correlación de electrodogramas ACE simulados (8 de 22 canales).
- Prototipado de front-ends de bajo consumo: sus 602.510 parámetros permiten incrustarlo en dispositivos embebidos o DSP con recursos muy limitados, algo inviable con modelos de separación de voz de gran tamaño.
- Aislamiento de voz en entornos de multitud: en una sala con 8-12 conversaciones simultáneas, el modelo mejora la SI-SDR en +3,51 dB de media según el banco sintético del autor.
- Preprocesado previo a un sistema ASR: al mejorar la relación señal-ruido en condiciones de babble, puede reducir la tasa de error de un reconocedor aguas abajo, aunque esto no se ha medido en el repositorio.
- Comunicaciones de baja latencia: su carácter causal y sus 5,88 ms de latencia algorítmica lo hacen candidato para aplicaciones de voz en tiempo real donde no se tolera lookahead.
- Base para experimentos de destilación o comparación: al ser un modelo pequeño con código y pesos abiertos (MIT), sirve como línea base reproducible para investigar mejoras causales de separación.
- Docencia y divulgación: el repositorio incluye el registro completo de investigación y un banco de evaluación documentado, útil para enseñar evaluación rigurosa de modelos de audio.

## Benchmarks y rendimiento

Resultados del banco sintético in-silico del autor (media de 3 semillas, frente a la mezcla sin procesar, con hablantes no vistos en entrenamiento):

| Prueba | Resultado |
|---|---|
| Crowd ΔSI-SDR (8-12 hablantes) | +3,51 dB |
| Crowd ΔSTOI | +0,035 |
| Correlación con electrodograma ACE simulado (8 de 22) | +0,072 |
| Crowd a 0 dB | +4,65 dB |
| Crowd a −5 dB | +1,19 dB (objetivo +1,5 dB; única fila fallida) |
| Ruido con espectro de voz | +6,45 dB |
| Ruido blanco en held-out | +0,73 dB |
| Silencio, SI-SDR absoluta | 36,3 dB |

El autor indica que 13 de 14 filas del scorecard requerido se superan. No se han publicado comparaciones con otros modelos de mejora de voz en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB; con 602.510 parámetros en float32 los pesos ocupan aproximadamente 2,4 MB, por lo que el modelo cabe en cualquier GPU, CPU o incluso microcontrolador con suficiente memoria.
- GPU recomendadas: no requiere GPU dedicada; funciona en CPU. Cualquier GPU consumer (por ejemplo, RTX 3060 o superior) es más que suficiente.
- Cabe en cualquier GPU consumer, incluida la gama integrada y placas tipo Jetson.
- Opciones de despliegue: PyTorch nativo (única librería requerida por `model_causal.py`); el autor no menciona soporte para vLLM, llama.cpp, Ollama ni TGI, que además no aplican a este tipo de modelo.
- Latencia y throughput: latencia algorítmica de 5,88 ms; el factor de tiempo real (RTF) no se ha medido según el autor.

## Comparativa con modelos similares

| Modelo | Parámetros | Enfoque | Causal | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Before the Implant (este) | 602.510 | Conv-TasNet causal, forma de onda | Sí | MIT | Hugging Face |
| Demucs / Denoiser (Meta) | Millones (no disponible en detalle) | Separación/denoising en forma de onda | Generalmente no causal | MIT | Abierto |
| Conv-TasNet original | No disponible | Separación de hablantes | No (versión base) | Abierto | Repositorios académicos |
| Modelos de mejora de voz tipo DNS-Challenge | No disponible | Diversos (CRN, GAN, etc.) | Mayoritariamente no causal | Variable | Varía |

No se dispone en la información proporcionada de comparaciones cuantitativas directas con estos modelos; la tabla refleja únicamente características estructurales conocidas.

## Limitaciones y advertencias

- Solo se ha evaluado por ordenador, sobre mezclas sintéticas; ningún oyente lo ha probado y nunca se ha usado con un implante real.
- No se ha comparado con el procesamiento de ruido del procesador Nucleus 6.
- El caso más difícil (multitud más fuerte que la voz, −5 dB) no alcanza su objetivo (+1,19 dB frente a +1,5 dB).
- El factor de tiempo real no se ha medido.
- Entrenado con habla leída de audiolibros en inglés a 16 kHz; otras voces, idiomas y entornos acústicos no están probados.
- La mejora frente a ruido blanco es marginal (+0,73 dB).
- Riesgo de artefactos y de distorsión de la voz objetivo no cuantificado en la model card.
- Licencia MIT: permite uso comercial, pero el modelo no está validado para uso clínico ni como dispositivo médico; cualquier aplicación sanitaria requeriría evaluación regulatoria independiente.
- No hay datos publicados sobre sesgos demográficos (edad, género, acento) en el rendimiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/bmarti44/before-the-implant-causal-enhancer
- Sitio del proyecto: https://beforetheimplant.com
- Código y registro de investigación: https://github.com/bmarti44/meta-hackathon-deaf-hard-of-hearing
- Dataset de entrenamiento (LibriSpeech): https://huggingface.co/datasets/openslr/librispeech_asr
- Paper de LibriSpeech (Panayotov et al., 2015): https://www.openslr.org/12
