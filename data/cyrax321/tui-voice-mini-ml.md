# Cyrax321/tui-voice-mini-ml

## Resumen

Tui Voice Mini Malayalam (identificador `Cyrax321/tui-voice-mini-ml`) es un modelo experimental de sintesis de voz (text-to-speech) en malayalam, desarrollado por el usuario Cyrax321. Se trata de un prototipo de investigacion de tamano extremadamente reducido: 4.537.291 parametros (aproximadamente 4,5 millones), lo que lo situa en un orden de magnitud muy inferior a las arquitecturas TTS convencionales como FastPitch + HiFi-GAN (unos 110 millones de parametros) o Meta MMS-TTS basado en VITS (unos 36 millones). El modelo se presenta como una prueba de concepto de sintesis de voz neural que puede ejecutarse integramente en dispositivo (on-device).

El modelo deriva de un ajuste fino sobre la base tiny-voca, entrenado con grabaciones de estudio del corpus femenino malayalam de AI4Bharat Rasa. Su propuesta principal es demostrar que es posible obtener voz inteligible en un idioma de bajos recursos con una huella de memoria inferior a 30 MB en inferencia y sin necesidad de un vocoder neuronal externo, gracias a un sintetizador integrado de tipo fuente-filtro (oscilador armonico y ruido filtrado). Esto lo hace apto para navegadores via WebAssembly, dispositivos iOS/Android, Raspberry Pi y robots ROS.

Es relevante ahora porque explora el limite inferior de parametros para TTS neuronal en lenguas minoritarias, un terreno poco cubierto por los modelos comerciales, y porque su licencia Apache 2.0 y sus formatos ONNX/INT8 facilitan su despliegue en entornos de borde sin GPU. No obstante, el propio autor lo etiqueta como `v0.1-preview`, un prototipo de investigacion y no una voz comercial acabada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TTS neuronal ultracompacta con sintetizador integrado fuente-filtro (oscilador armonico y ruido filtrado); ajuste fino desde tiny-voca |
| Parametros totales | 4.537.291 (aprox. 4,5 M) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (modelo TTS, no de lenguaje) |
| Tipos de cuantizacion | FP32, FP16, INT8 (ONNX quantized) |
| Idiomas soportados | Malayalam (ml) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch (.pt) FP32 y FP16; ONNX (opset 17) FP32 e INT8; checkpoints de entrenamiento (.pt) |

## Arquitectura y entrenamiento

La arquitectura es una red TTS neuronal de muy baja capacidad derivada de tiny-voca, con un sintetizador fuente-filtro integrado que genera la forma de onda directamente mediante excitacion armonica y ruido filtrado, eliminando la necesidad de un vocoder neuronal separado como HiFi-GAN o Vocos. El modelo incorpora un presupuesto explicito de 76 ranuras foneticas que cubren los 59 fonemas del malayalam, incluidas distinciones de vocal larga/corta, grupos consonanticos (conjunct clusters) y los chillus explicitos (ൺ, ൻ, ർ, ൽ, ൾ, ൿ). La salida de audio es mono a 24 kHz.

El entrenamiento se realizo durante 40.000 pasos con discriminadores GAN adversarios multiperiodo y multirresolucion, partiendo de grabaciones de estudio del corpus femenino malayalam de AI4Bharat Rasa. Se publican checkpoints intermedios en los pasos 5k, 8k, 10k, 15k, 20k, 25k, 30k, 35k y el estado final en 40k. Una innovacion destacable es el control nativo de prosodia en tiempo de ejecucion mediante parametros algebraicos `--pitch-shift` y `--pitch-range`, que permiten manipular timbre y contorno de tono sin latencia adicional. No se detalla en la informacion disponible el numero total de tokens de audio ni la composicion completa del dataset mas alla de su origen en Rasa.

## Capacidades

- Sintesis de voz (text-to-speech) en malayalam a partir de texto con cobertura fonetica completa de 59 fonemas.
- Generacion de audio mono a 24 kHz con sintetizador integrado, sin vocoder externo.
- Control de prosodia en tiempo de ejecucion mediante pitch shift y pitch range.
- Conversion grafema-fonema (G2P) explicita para malayalam, con manejo de vocales largas/cortas, grupos consonanticos y chillus.
- Ejecucion on-device en navegador (WebAssembly), Android, iOS, C++ y microcontroladores ARM.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generacion de texto: es exclusivamente un modelo TTS.
- No dispone de capacidades de vision ni audio de entrada (no es speech-to-text).

## Casos de uso

- Anuncios en transporte publico: el modelo puede generar avisos de estacion y plataforma (por ejemplo, metro de Kochi o estaciones de tren) en malayalam y ejecutarse en el propio panel o en una Raspberry Pi del sistema de megafonia, gracias a su huella de 5,4 MB en INT8 y su capacidad de operar sin conexion.
- Atencion al cliente IVR: integrado en flujos de respuesta de voz interactiva, permite sintetizar menus y mensajes de bienvenida en malayalam en el propio dispositivo telefonico o pasarela, reduciendo la dependencia de servicios TTS en la nube.
- Asistentes de voz para personas con discapacidad visual: al ejecutarse en movil sin conexion, puede leer notificaciones, mensajes y contenido en malayalam con latencia minima y sin enviar datos a servidores externos.
- Robots ROS y dispositivos de borde: su formato INT8 de 5,4 MB y su requisito de menos de 30 MB de RAM lo hacen adecuado para robots de servicio o kioscos interactivos que necesiten hablar malayalam en entornos sin conectividad.
- Aplicaciones web educativas: mediante ONNX y WebAssembly, puede incorporarse en navegador para pronunciar vocabulario o frases en malayalam en plataformas de aprendizaje de idiomas, sin backend.
- Sistemas de megafonia y emergencias: generacion de boletines meteorologicos o avisos de emergencia en malayalam en dispositivos de bajo consumo desplegados en zonas rurales.
- Prototipado e investigacion en TTS de bajos recursos: sirve como linea base reproducible (checkpoints publicados, licencia Apache 2.0) para estudiar el limite inferior de parametros en sintesis de voz de lenguas minoritarias.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas objetivas como MOS (Mean Opinion Score), MCD (Mel Cepstral Distortion) ni comparaciones cuantitativas con otros sistemas TTS.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 30 MB de RAM en el caso general; el peso INT8 ocupa aproximadamente 5,4 MB, el FP16 9,1 MB y el FP32 18,2 MB.
- GPU recomendadas: no requiere GPU; puede ejecutarse en CPU. Para inferencia en GPU, cualquier tarjeta moderna sirve, aunque el modelo esta disenado para CPU y dispositivos de borde.
- Compatibilidad con GPU de consumo: si, cabe holgadamente en cualquier GPU de consumo (RTX 4090, RTX 3060, etc.), aunque su uso tipico es en CPU.
- Despliegue: ONNX Runtime (opset 17), WebAssembly en navegador, Android, iOS, C++, PyTorch para Python, y despliegue en Raspberry Pi y robots ROS mediante el modelo INT8.
- Latencia y throughput: no disponibles en la informacion proporcionada; el autor menciona control de prosodia "con zero latency" pero sin cifras concretas.

## Comparativa con modelos similares

| Modelo | Parametros | Idioma | Vocoder externo | Licencia | Formatos |
|---|---|---|---|---|---|
| Tui Voice Mini ML | 4,5 M | Malayalam | No (integrado) | Apache 2.0 | PyTorch, ONNX, INT8 |
| FastPitch + HiFi-GAN | ~110 M | Multilingue (segun entrenamiento) | Si (HiFi-GAN) | Segun implementacion | PyTorch |
| Meta MMS-TTS (VITS) | ~36 M | Multilingue (incluye malayalam) | No (VITS end-to-end) | CC-BY-NC (segun version) | PyTorch |

La comparativa se limita a ordenes de magnitud de parametros citados en la propia model card; no se dispone de datos de rendimiento comparativo (MOS u otras metricas) en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo experimental `v0.1-preview`: el autor lo describe explicitamente como prueba de concepto de investigacion, no como una voz comercial acabada.
- Artefactos de timbre sintetico inherentes al vocoder fuente-filtro de baja parametrizacion; la calidad de voz no es la de un sistema TTS de gran escala.
- Unico idioma soportado: malayalam; no hay capacidades multilingues.
- Entrenado sobre un corpus femenino, por lo que la variedad de voces disponible es limitada.
- Riesgo de errores de pronunciacion en palabras fuera del vocabulario o con grafias poco frecuentes, dado el presupuesto fijo de 76 ranuras foneticas.
- No es un modelo de lenguaje: no genera texto, no razona ni soporta agentes.
- Licencia Apache 2.0 permite uso comercial, pero el estado experimental y la ausencia de benchmarks objetivos desaconsejan su uso en produccion sin evaluacion previa.
- No se han publicado evaluaciones de sesgos ni de robustez en dominios ruidosos o texttos informales.

## Enlaces

- Hugging Face: https://huggingface.co/Cyrax321/tui-voice-mini-ml
- Repositorio GitHub: https://github.com/Cyrax321/tui-voice
- Modelo base tiny-voca: https://github.com/n4ze3m/tiny-voca
- Dataset AI4Bharat Rasa: https://huggingface.co/datasets/ai4bharat/Rasa
- Licencia Apache 2.0: https://opensource.org/licenses/Apache-2.0
