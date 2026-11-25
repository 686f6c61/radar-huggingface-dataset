# Mikhailo/mova-tts

## Resumen

mova-tts es un modelo de síntesis de voz (text-to-speech) en ucraniano con capacidad de clonación de voz, desarrollado por Mikhailo. Se trata de un fine-tune completo del modelo neuphonic/neutts-air, un LM de habla de 0,7B de parámetros basado en la arquitectura Qwen2, entrenado sobre aproximadamente 1460 horas de audio en ucraniano. El modelo genera tokens de NeuCodec a partir de fonemas IPA y es capaz de clonar una voz a partir de una grabación de referencia de entre 3 y 12 segundos.

La relevancia de mova-tts radica en su especialización: frente a modelos TTS multilingües genéricos, ofrece un front-end de texto específico para ucraniano que incluye normalización de números, detección de acento léxico mediante el paquete naholos y conversión a IPA. Además, el modelo aprendió el acento real del habla (alineando el texto con el audio y detectando el estrés acústicamente) en lugar de depender de un diccionario, lo que mejora la naturalidad en una lengua con acento móvil.

El modelo se distribuye en formato safetensors (bf16) para transformers y en GGUF cuantizado (Q8_0 y Q4_K_M) para llama.cpp, con un tamaño de repositorio de 8,7 GB. Incorpora cuatro voces predefinidas (tetiana, mykyta, oleksa, lada) y soporta decodificación en streaming con contexto izquierdo y crossfade. La licencia es Apache-2.0.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LM de habla basado en Qwen2 (token prediction sobre NeuCodec), fine-tune de neuphonic/neutts-air |
| Parámetros totales | 747.930.496 (0,7B) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | bf16 (safetensors), GGUF Q8_0 (0,8 GB), GGUF Q4_K_M (0,6 GB) |
| Idiomas soportados | ucraniano (uk) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

mova-tts es un modelo de lenguaje de habla construido sobre neuphonic/neutts-air, un LM de 0,7B parámetros de base Qwen2 que predice tokens de audio NeuCodec. El pipeline es el siguiente: el texto ucraniano se procesa mediante un front-end que normaliza números a palabras, aplica detección de acento con naholos y lo convierte a fonemas IPA (ipa-uk). El modelo recibe el prompt con los fonemas IPA de referencia y del texto objetivo, y genera los códigos NeuCodec correspondientes, que se decodifican a audio de 24 kHz.

El entrenamiento consistió en un fine-tune completo desde el modelo base durante 30.000 pasos con una tasa de aprendizaje de 4e-5, sobre aproximadamente 1460 horas de habla en ucraniano. El corpus incluyó audiolibros narrados por profesionales, pódcasts, Common Voice y grabaciones de estudio. Se aplicaron filtros de calidad: recorte de silencios iniciales y finales, eliminación de enunciados con pausas internas largas, descarte de clips con UTMOS inferior a 2,5 (unas 280 horas) y un límite de 20 horas por narrador. Todo el audio se recodificó con NeuCodec. Una innovación destacable es que las etiquetas de acento se obtuvieron del propio audio: el texto se alineó con el Montreal Forced Aligner y un detector acústico marcó el acento que el hablante usó realmente, de modo que el modelo aprendió el estrés del habla real y no el de diccionario. Los datos de entrenamiento no se han publicado.

## Capacidades

- Síntesis de voz en ucraniano a partir de texto, con salida de audio a 24 kHz.
- Clonación de voz zero-shot a partir de una grabación de referencia de 3 a 12 segundos y su transcripción exacta.
- Generación en streaming: el primer fragmento de audio aparece tras 35 códigos, con chunks float32 de 24 kHz.
- Front-end de texto integrado en el paquete mova-tts: normalización de números a palabras, detección de acento léxico y conversión a IPA.
- Cuatro voces predefinidas incluidas (tetiana, mykyta, oleksa, lada) procedentes de los datasets OpenTTS (Apache-2.0).
- Decodificación en llama.cpp con contexto izquierdo y crossfade para streaming continuo.
- Marcado de agua imperceptible Perth en el audio generado por defecto.
- No soporta tool calling, function calling, agentes, visión, audio de entrada ni razonamiento multi-paso: es exclusivamente un modelo TTS.

## Casos de uso

- Audiolibros y narración automatizada: el modelo puede sintetizar textos largos en ucraniano con voces profesionales clonadas o predefinidas, manteniendo consistencia de timbre entre fragmentos gracias a la clonación desde una referencia fija y al streaming con crossfade.
- Doblaje y localización de contenido al ucraniano: permite clonar la voz de un hablante a partir de un clip corto y generar nuevas locuciones con esa misma voz, útil para doblar vídeos o cursos manteniendo la identidad vocal del original.
- Asistentes de voz y atención al cliente en ucraniano: la latencia de primer audio de 0,11 s en RTX 4090 (RTF 0,10) y de 0,9 s en CPU (RTF 0,69) permite integrar respuestas habladas en tiempo casi real en sistemas conversacionales.
- Accesibilidad y lectura de pantalla: conversión de texto a voz de alta calidad para usuarios con discapacidad visual, con voces naturales (UTMOS 3,52 en la evaluación completa) y soporte de streaming para lectura progresiva.
- Generación de contenido para pódcasts y medios: producción de introducciones, cuñas o segmentos narrados en ucraniano sin necesidad de un locutor, con control de acento real aprendido del habla.
- Pruebas y prototipado de interfaces de voz: el despliegue ligero en GGUF Q4_K_M (0,6 GB) permite ejecutar el modelo en hardware modesto para validar experiencias de voz antes de invertir en infraestructura.
- Sistemas de aprendizaje de idiomas: generación de ejemplos de pronunciación ucraniana con acento léxico correcto, aprovechando que el modelo aprendió el estrés del habla real.

## Benchmarks y rendimiento

Evaluación sobre 234 frases reservadas de Common Voice y audiolibros, con hablantes no vistos en entrenamiento, clonando cada voz desde una frase distinta de la misma persona:

| Configuración | WER | CER | UTMOS | Similitud de hablante |
|---|---:|---:|---:|---:|
| Enunciado completo, Q8_0 | 0,107 | 0,028 | 3,52 | 0,49 |
| Streaming, Q8_0 | 0,117 | 0,030 | 3,45 | 0,49 |
| Streaming, Q4_K_M | 0,117 | 0,033 | 3,40 | 0,48 |

Voces predefinidas:

| Preset | Voz | UTMOS | WER |
|---|---|---:|---:|
| tetiana (por defecto) | femenina | 3,64 | 0,020 |
| mykyta | masculina | 3,67 | 0,000 |
| oleksa | masculina | 3,41 | 0,020 |
| lada | femenina | 2,47 | 0,029 |

Notas metodológicas: WER y CER provienen de transcripciones con Whisper large-v3; UTMOS es una puntuación de naturalidad predicha de 1 a 5; la similitud de hablante es el coseno ECAPA frente a las grabaciones reales del hablante. Una sola semilla de muestreo varía aproximadamente ±0,01 en WER. Los mismos pesos muestreados por llama.cpp sin penalización de repetición (mova-tts 0.2.1) obtuvieron 0,114 / 0,141 / 0,140 de WER; la versión 0.1 del modelo obtuvo 0,123 / 0,136 / 0,131 de WER y 3,46 / 3,37 / 3,33 de UTMOS en las mismas frases y semilla.

Velocidad (streaming, front-end incluido): primer audio a los 0,11 s en RTX 4090 (RTF 0,10) y a los 0,9 s en CPU i9-13900KF con 8 hilos (RTF 0,69).

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 0,7B parámetros; en bf16 requiere aproximadamente 1,5 GB de VRAM solo para los pesos. El GGUF Q8_0 (0,8 GB) y Q4_K_M (0,6 GB) reducen el requisito, aunque hay que sumar el decodificador NeuCodec y el front-end.
- GPU recomendadas: RTX 4090 para baja latencia (primer audio en 0,11 s, RTF 0,10); el modelo cabe holgadamente en cualquier GPU consumer con al menos 4 GB de VRAM.
- Cabe en GPU consumer: sí, en tarjetas como RTX 3060, RTX 4060 o superiores, y también en Apple GPU y CPU según el paquete mova-tts.
- Opciones de despliegue: llama.cpp (formato GGUF, opción por defecto), paquete mova-tts (con backends CUDA, Apple GPU y CPU), y transformers con los pesos safetensors bf16.
- Latencia y throughput: RTF 0,10 en RTX 4090 y RTF 0,69 en CPU i9-13900KF con 8 hilos; primer audio tras 35 códigos en streaming.
- Nota: NeuCodec está restringido (gated) en Hugging Face; es necesario aceptar los términos en neuphonic/neucodec y neucodec-onnx-decoder.

## Comparativa con modelos similares

| Modelo | Parámetros | Idioma | Contexto | Clonación de voz | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| mova-tts | 0,7B | ucraniano | no disponible | sí (3-12 s) | Apache-2.0 | Hugging Face, GGUF y safetensors |
| neuphonic/neutts-air (base) | 0,7B | multilingüe (no especificado) | no disponible | sí | Apache-2.0 | Hugging Face |
| Modelos TTS multilingües genéricos | variable | varios | variable | variable | variable | no disponible |

No se dispone de datos de benchmarks comparativos directos con alternativas en la información proporcionada; la comparación se limita a parámetros, licencia e idioma.

## Limitaciones y advertencias

- Solo admite ucraniano. Las palabras en alfabeto latino se transliteran mediante el front-end.
- Cada toma se muestrea de forma estocástica: en ocasiones una palabra se alarga o aparece una pausa extraña; se recomienda regenerar con otra semilla.
- La calidad de la clonación depende de la referencia: es necesario usar una grabación limpia de un solo hablante y su transcripción exacta.
- El prompt requiere fonemas IPA generados por el front-end de mova-tts (ipa-uk con marcas de acento); los fonemas de eSpeak no funcionan.
- Los pesos deben muestrearse con los ajustes recomendados (penalización de repetición 1,1, top-k 50, top-p 0,8, temperatura 1,0) y penalizando el token de fin como los códigos; el muestreador integrado de llama-cpp-python produce habla claramente peor.
- Riesgo de alucinación y artefactos prosódicos inherente a los modelos generativos de audio; no se documentan sesgos específicos más allá de los derivados de los datos de entrenamiento (no publicados).
- Restricciones de uso: la licencia Apache-2.0 permite uso comercial, pero solo debe clonarse voces para las que se tenga permiso; el audio generado incorpora la marca de agua Perth por defecto.
- NeuCodec está restringido en Hugging Face y requiere aceptar términos, lo que añade un paso de configuración en producción.
- Los datos de entrenamiento no se han publicado, lo que limita la auditoría de sesgos y la reproducibilidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Mikhailo/mova-tts
- Modelo base: https://huggingface.co/neuphonic/neutts-air
- NeuCodec: https://huggingface.co/neuphonic/neucodec
- Repositorio del paquete mova-tts: https://github.com/MykhailoMS/mova-tts
- Detector de acento naholos: https://github.com/MykhailoMS/naholos
- Marca de agua Perth: https://github.com/resemble-ai/Perth
