# matthiastl/gepard-onnx

## Resumen

gepard-onnx es una conversión no oficial a ONNX del modelo de síntesis de voz gepard-1.0 de NineNineSix, publicada por el usuario matthiastl. El objetivo es ejecutar el modelo en CPU sin depender de PyTorch ni de NVIDIA NeMo, usando únicamente ONNX Runtime, numpy y la librería `tokenizers`. El modelo original está diseñado para agentes de voz: clona la voz de un clip de referencia corto y sintetiza texto en esa voz, con una arquitectura de decodificación por tramas que permite streaming.

La conversión ofrece dos variantes: precisión completa (por defecto) y un decodificador de 8 bits opcional. La variante completa ocupa 2,0 GB en disco y 2,3 GB de memoria durante la síntesis; la de 8 bits reduce a 1,2 GB y 1,4 GB respectivamente. La salida se genera en fragmentos de 0,56 s, lo que permite reproducir el inicio de una frase mientras el modelo sigue generando el final, una característica clave para agentes conversacionales.

La relevancia de esta ficha radica en que permite desplegar un sistema de clonación de voz en hardware sin GPU, algo poco habitual en modelos de TTS de calidad. No obstante, es una conversión de terceros, no avalada por NineNineSix ni por NVIDIA, y presenta limitaciones documentadas por el propio autor, como la necesidad obligatoria de una voz de referencia y la ocasional falta de terminación en frases largas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TTS neuronal basada en el modelo original gepard-1.0, con decodificador de audio NVIDIA NeMo Nano Codec (22 kHz, 1,89 kbps, 21,5 fps); conversión a ONNX con grafo estático para inferencia en CPU |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (el audio se procesa en tramas de 46,4 ms; límite de generación de 28 s por frase) |
| Tipos de cuantizacion | Precisión completa (FP32) y decodificador INT8 (capas lineales con pesos de 8 bits) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache-2.0 y NVIDIA Open Model License (combinada; ver NOTICE.md) |
| Formato de pesos | ONNX (repositorio de 2,3 GB; fichero del decodificador de 8 bits: 259 MB frente a 1.028 MB en FP32) |

## Arquitectura y entrenamiento

La arquitectura subyacente corresponde al modelo original gepard-1.0 de NineNineSix, un sistema de text-to-speech con clonación de voz zero-shot. El modelo toma texto y un clip de referencia de voz (hasta 15 s, remuestreado a 22.050 Hz mono) y genera código de audio que posteriormente decodifica mediante el códec NVIDIA NeMo Nano Codec a 22 kHz y 1,89 kbps. La conversión a ONNX preserva el grafo de inferencia en precisión completa y añade una variante con capas lineales cuantizadas a 8 bits en el decodificador.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en el modelo original, ya que la model card de la conversión no los detalla. La innovación técnica destacable de esta conversión es la eliminación de las dependencias de PyTorch y NeMo, permitiendo inferencia en CPU con ONNX Runtime, y la generación por tramas de 0,56 s que habilita streaming de audio de baja latencia (mediana de 0,21 s hasta el primer sonido en precisión completa y 0,15 s en 8 bits sobre un Apple M4 Max con 4 hilos).

## Capacidades

- Síntesis de voz a partir de texto en inglés con clonación de la voz de un clip de referencia de hasta 15 s.
- Generación de audio en streaming por fragmentos de 0,56 s, lo que permite reproducir el inicio de una frase antes de que el modelo termine de generarla.
- Inferencia en CPU sin PyTorch ni NeMo, usando ONNX Runtime, numpy y `tokenizers`.
- Dos modos de precisión: FP32 (por defecto, mayor fidelidad) e INT8 (menor huella de memoria y mayor velocidad, con ligera degradación en la tasa de error de palabras).
- Control de aleatoriedad mediante semilla (`seed`) para reproducibilidad en la generación.
- No se documentan capacidades de tool calling, agentes multi-step, visión, audio de entrada (salvo el clip de referencia) ni razonamiento textual; es exclusivamente un modelo de TTS.

## Casos de uso

- Agentes de voz en atención al cliente: el modelo puede sintetizar respuestas en una voz de marca concreta a partir de un clip de referencia de 5-15 s, y el streaming por tramas de 0,56 s permite iniciar la reproducción antes de completar la frase, reduciendo la latencia percibida en conversaciones multi-turno.
- Sistemas de IVR y contestadores automáticos en CPU: al no requerir GPU, puede desplegarse en servidores modestos o dispositivos edge con ONNX Runtime, gestionando mensajes pregrabados dinámicos o respuestas personalizadas en inglés.
- Generación de audiolibros y contenido narrado: con una voz de referencia consistente, el modelo mantiene el timbre en frases sucesivas; la variante FP32 es la recomendada por su menor tasa de error de palabras (1,34 % frente a 1,69 % en 8 bits sobre 2.400 grabaciones).
- Prototipado de asistentes conversacionales en local: desarrolladores que trabajan en estaciones sin GPU pueden integrar el modelo en pipelines Python con `soundfile` y `onnxruntime`, evaluando la calidad de clonación antes de escalar a infraestructura con GPU.
- Accesibilidad y lectura de texto en voz alta: el modelo puede convertir artículos o notificaciones en audio con una voz personalizada del usuario, siempre que se disponga de un clip de referencia y el texto esté en inglés.
- Pruebas A/B de voces sintéticas en productos: la posibilidad de cambiar la voz de referencia por clip permite generar múltiples variantes de una misma locución para evaluar preferencias de usuarios sin reentrenar el modelo.
- Integración en sistemas de respuesta por voz de baja latencia: la mediana de 0,15-0,21 s hasta el primer sonido en Apple M4 Max con 4 hilos lo hace apto para entornos interactivos, aunque no se han publicado pruebas en otras CPU.

## Benchmarks y rendimiento

Los datos disponibles provienen de las pruebas del autor de la conversión, no de benchmarks estándar de TTS. Se comparan la conversión ONNX en FP32 e INT8 con el original en PyTorch (32 bits, CPU).

| Prueba | Original (PyTorch) | ONNX FP32 | ONNX INT8 |
|---|---|---|---|
| Códigos idénticos (300 frases con voz, misma semilla) | referencia | 299 de 300 idénticas | no disponible |
| Tasa de error de palabras (2.400 grabaciones, con voz) | 1,34 % | no disponible | 1,69 % |
| Tasa de error de palabras (sin voz) | 8,8 % (40 frases) / 21,9 % (300 grabaciones) | no disponible | 12,7 % / 24,1 % |
| Frases que alcanzan el límite de 28 s | 7 de 2.400 | 3 de 300 | 15 de 2.400 |
| Velocidad (Apple M4 Max, 4 hilos) | no disponible | 0,37× tiempo real (media), 0,47× peor caso | 0,27× (media), 0,39× (peor caso) |
| Primer sonido (mediana) | no disponible | 0,21 s | 0,15 s |
| Diferencia máxima de muestras del decodificador de audio frente a NeMo | referencia | 0,00004 | no disponible |
| Códigos del codificador de voz (3 clips) | referencia | 100 % idénticos, coseno 1,000000 | no disponible |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) porque no aplican a un modelo de TTS.

## Requisitos de hardware

- VRAM: no aplica; el modelo está diseñado para CPU. Memoria RAM estimada: 2,3 GB en FP32 y 1,4 GB en INT8 durante la síntesis.
- GPU recomendadas: no se requieren; el autor no documenta ejecución en GPU para esta conversión ONNX.
- Cabe en CPU consumer: sí, con 2,3 GB de RAM en FP32 o 1,4 GB en INT8. El autor probó en un Apple M4 Max con 4 hilos; no se han probado móviles, Raspberry Pi ni CPU Intel o AMD.
- Opciones de despliegue: ONNX Runtime con Python (`onnxruntime`, `numpy`, `tokenizers`, `soundfile`); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a este tipo de modelo.
- Latencia y throughput: en Apple M4 Max con 4 hilos, 0,37× tiempo real de media en FP32 (0,47× en el peor de 100 frases) y 0,27× en INT8 (0,39× peor caso); primer sonido en 0,15-0,21 s de mediana. Sin datos en otras plataformas.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| gepard-onnx (esta ficha) | TTS con clonación de voz, ONNX CPU | no disponible | no disponible (límite 28 s por frase) | Inglés | Apache-2.0 + NVIDIA Open Model License | Hugging Face (conversión no oficial) |
| gepard-1.0 (original) | TTS con clonación de voz, PyTorch + NeMo | no disponible | no disponible | Inglés | no disponible en la información proporcionada | Hugging Face (nineninesix/gepard-1.0) |
| NVIDIA NeMo Nano Codec | Códec de audio neuronal | no disponible | no aplica | no disponible | NVIDIA Open Model License | Incluido como dependencia del original |

No se dispone de datos de otros modelos TTS comparables (p. ej., XTTS, Bark, Piper) en la información proporcionada, por lo que no se incluyen en la tabla.

## Limitaciones y advertencias

- Requiere obligatoriamente un clip de voz de referencia: sin él, la tasa de error de palabras del original sube al 14-28 % (frente al 1,3 % con referencia), según el autor.
- El modelo a veces no termina de generar: en el original, 7 de 2.400 grabaciones alcanzaron el límite de 28 s; en la variante INT8, 15 de 2.400. El autor recomienda reducir `max_frames` para frases cortas.
- La variante INT8 falló tres pruebas de palabras antes de aprobar una cuarta; su tasa de error (1,69 %) es superior a la del original (1,34 %) y la diferencia no está estadísticamente descartada como azar en todos los casos.
- Solo se ha probado en inglés; no hay validación en otros idiomas.
- El rendimiento se midió únicamente en un Apple M4 Max con 4 hilos; no hay datos en CPU Intel, AMD, móviles ni Raspberry Pi.
- Es una conversión no oficial, no avalada por NineNineSix ni por NVIDIA; la licencia combina Apache-2.0 y NVIDIA Open Model License, con restricciones que deben revisarse en NOTICE.md antes de uso comercial.
- Riesgo de alucinación no aplica en el sentido textual, pero sí de artefactos de audio o pronunciación incorrecta en palabras fuera del dominio de entrenamiento.
- No se documentan sesgos de voz (género, acento, etnia) ni la composición del dataset de entrenamiento original.

## Enlaces

- Hugging Face: https://huggingface.co/matthiastl/gepard-onnx
- Modelo base: https://huggingface.co/nineninesix/gepard-1.0
- Códec NVIDIA: https://huggingface.co/nvidia/nemo-nano-codec-22khz-1.89kbps-21.5fps
- Licencia combinada: https://huggingface.co/matthiastl/gepard-onnx/blob/main/NOTICE.md
- Resultados de las pruebas: carpeta `results/` del repositorio (referenciada en la model card)
