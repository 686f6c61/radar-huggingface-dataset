# loom-ai-org/sanotts-loom

## Resumen

sanoTTS-loom es una exportación al formato GGUF del modelo de síntesis de voz `ampixa/sanoTTS`, publicada por el colectivo loom-ai-org para su uso con el motor de inferencia loom.cpp y el runtime de Python `loom-py-rt`. No se trata de un modelo único, sino de un repositorio que agrupa varias voces destiladas de tamaño muy reducido (entre 0,29M y 2,27M de parámetros) distribuidas en 14 idiomas. La variante por defecto, `sanotts-heartnano.gguf`, es un alumno destilado de la voz `af_heart` de Kokoro a través de un decodificador estilo Vocos, con salida a 24 kHz y apenas 1.084.963 parámetros según los safetensors del repositorio.

El modelo resuelve el problema de la síntesis de voz en entornos con recursos muy limitados: el autor documenta síntesis a 1,1 veces la duración del audio en una Raspberry Pi Zero W (un núcleo ARMv6 a 1 GHz sin SIMD), lo que lo sitúa en la categoría de TTS embebido y de borde. Cada fichero GGUF es autocontenido: incluye las topologías de grafo, el tokenizador (si lo hay) y el script controlador, de modo que el motor no necesita código específico por voz.

La relevancia actual está en su combinación de tamaño mínimo, cobertura multilingüe amplia (árabe, checo, alemán, español, francés, indonesio, italiano, portugués, rumano, ruso, turco, vietnamita, chino e inglés) y un formato de despliegue portable. La contrapartida es una licencia GPL-3.0 heredada del modelo base, que condiciona seriamente su uso comercial, y un front-end de texto que solo está validado en inglés.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Red neuronal de síntesis de voz destilada con decodificador estilo Vocos (línea nano); voces Piper destiladas a 22,05 kHz (línea piperlite) |
| Parámetros totales | 1.084.963 (variante por defecto `sanotts-heartnano.gguf`); rango del repositorio: 0,29M a 2,27M |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible; límite de 207 símbolos fonéticos por llamada en las voces heart y heart-nano |
| Tipos de cuantización | Pesos en GGUF; la variante heart-nano procede de int8 upstream dequantizado en la exportación |
| Idiomas soportados | en, ar, cs, de, es, fr, id, it, pt, ro, ru, tr, vi, zh |
| Licencia | GPL-3.0 (heredada del modelo base) |
| Formato de pesos | GGUF autocontenido (grafo, tokenizador y driver embebidos); safetensors en el modelo base |

## Arquitectura y entrenamiento

La línea nano parte de la voz `af_heart` de Kokoro y se destila mediante un decodificador estilo Vocos, con salida a 24 kHz. La línea piperlite se destila a partir de voces de Piper y opera a 22,05 kHz. Ambas son redes de tamaño muy reducido, pensadas para inferencia en CPU y en placas de un solo núcleo. El decodificador de las voces heart y heart-nano se alimenta de ruido: el parámetro `seed` altera ligeramente la voz y el valor por defecto reproduce el renderizado original de upstream.

La exportación la realiza loom-exporter, que importa los scripts de entrenamiento de upstream desde un clon fijado en lugar de incluirlos en el repositorio. El paquete resultante es un único GGUF que declara sus propias topologías de grafo, su tokenizador y su script controlador. El motor loom.cpp incorpora la operación `ISTFT`, introducida en `loom-py-rt` 1.0.0rc18, necesaria para este fichero. No se detallan en la información disponible el volumen de datos de entrenamiento, la composición del corpus ni si hubo etapas de RLHF o DPO.

## Capacidades

- Síntesis de voz a partir de texto (pipeline `text-to-speech`) en 14 idiomas.
- Síntesis de voz a partir de fonemas IPA mediante el argumento `phonemes`, lo que permite usar un G2P externo de mayor calidad.
- Puerta de texto integrada basada en orthography2ipa, con léxico de pronunciación opcional para inglés (`en_US-misaki.tsv`, Apache-2.0).
- Reproducción del timbre de la voz original de Kokoro (`af_heart`) en la variante heart-nano.
- Control de variación de voz mediante la semilla (`seed`) en las voces heart y heart-nano.
- Ejecución en CPU sin SIMD y en GPU, con backend que aplica fusión de convoluciones.
- No dispone de tool calling, razonamiento multi-paso, visión, audio de entrada ni modo de pensamiento; es un modelo estrictamente de texto a voz.

## Casos de uso

- Asistentes de voz en dispositivos embebidos: la variante heart-nano sintetiza a 1,1 veces la duración del audio en una Raspberry Pi Zero W con 34 MB de memoria, lo que permite integrarla en altavoces, termostatos o wearables sin acelerador.
- Lectura de notificaciones y avisos en sistemas de domótica: el tamaño de 1,08M de parámetros y el formato GGUF autocontenido facilitan el despliegue en placas ARM de gama baja con presupuesto de memoria mínimo.
- Generación de audiolibros y contenido largo por lotes: dividiendo el texto por frases para respetar el límite de 207 símbolos fonéticos por llamada, se puede procesar texto extenso en un portátil x86 de dos núcleos, donde amy-1,46M tarda una catorceava parte de la duración del audio.
- Localización de contenidos a 14 idiomas: un mismo pipeline puede generar pistas de voz en español, francés, alemán, árabe o vietnamita, pasando fonemas precalculados con un G2P estilo espeak para las lenguas distintas del inglés.
- Prototipado de interfaces conversacionales: al ser un runtime de Python (`loom-py-rt`), se integra en notebooks y servicios de prueba para validar guiones de voz antes de contratar un TTS comercial.
- Síntesis offline con requisitos de privacidad: al ejecutarse íntegramente en local sin llamadas a servicios externos, es apto para aplicaciones sanitarias o industriales donde el texto no puede salir del dispositivo.
- Pruebas de accesibilidad en CI: la instalación vía `pip install -U "loom-py-rt[hub,phonemes]"` permite generar muestras de audio en pipelines automatizados para verificar regresiones de pronunciación.

## Benchmarks y rendimiento

Los únicos datos cuantitativos publicados en la información disponible son métricas de error de palabra (WER) sobre 30 frases de LibriSpeech evaluadas con Whisper, y mediciones de velocidad en hardware concreto:

| Métrica | heart-nano | amy-1,46M |
|---|---|---|
| WER con léxico integrado (puerta de texto) | 11,9 % | 12,3 % |
| WER con front-end propio de upstream | 8,1 % | 8,5 % |

| Hardware | Voz | Tiempo de síntesis respecto a la duración del audio |
|---|---|---|
| Raspberry Pi Zero W (ARMv6 1 GHz, sin SIMD) | heart-nano | 1,1x (34 MB de memoria) |
| Raspberry Pi Zero W | piperlite 0,51M | 2,3x |
| Raspberry Pi Zero W | heart | 2,5x |
| Raspberry Pi Zero W | amy-1,46M | 8,4x |
| Portátil x86 de 2 núcleos | amy-1,46M | 1/14 de la duración del audio |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible, al no ser aplicables a un modelo de síntesis de voz.

## Requisitos de hardware

- VRAM estimada: no disponible; el modelo está diseñado para CPU. La variante heart-nano ocupa 34 MB de memoria en ejecución.
- GPU recomendadas: no se especifican modelos concretos; el backend GPU de loom.cpp aplica fusión de convoluciones y requiere `GGML_VC4_FUSE=0` en Raspberry Pi Zero y Pi 1-3 con `loom-py-rt` 1.0.0rc20 o anterior.
- CPU: funciona en un único núcleo ARMv6 a 1 GHz sin SIMD; en x86 de dos núcleos el rendimiento es holgadamente superior al tiempo real para las voces pequeñas.
- Cabe en cualquier GPU de consumo, incluida una RTX 4090, aunque no se aprovecha su capacidad de cómputo por el tamaño del modelo.
- Despliegue: runtime `loom-py-rt` (PyPI, extra `[hub,phonemes]`), motor loom.cpp y exportador loom-exporter. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: en Raspberry Pi Zero W, entre 1,1x y 8,4x la duración del audio según la voz; en portátil x86 de dos núcleos, hasta 1/14 de la duración con amy-1,46M.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / límite | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| sanoTTS-loom (heart-nano) | 1,08M | 207 símbolos fonéticos por llamada | 14 | GPL-3.0 | GGUF |
| Kokoro (`af_heart`) | No disponible en la información | No disponible | No disponible | No disponible | No disponible |
| Piper (voces originales) | ~0,5M en las voces piperlite destiladas | No disponible | No disponible | No disponible | No disponible |

Las alternativas citadas son los modelos de origen de los que se destila sanoTTS; no se dispone en la información proporcionada de especificaciones completas ni de comparativas de rendimiento frente a otros sistemas TTS de la misma categoría.

## Limitaciones y advertencias

- Licencia GPL-3.0 heredada del modelo base: los ficheros portan los parámetros de upstream, lo que impone obligaciones de copyleft para uso comercial y redistribución.
- La puerta de texto solo está medida en inglés; sin el léxico integrado, la calidad en inglés cae notablemente (11,9 % de WER frente a 8,1 % con el front-end original).
- El chino no tiene puerta de texto: la salida de orthography2ipa queda casi por completo fuera de la tabla de fonemas de la voz zh (una frase de 13 caracteres se codificó en 3 ids), por lo que hay que aportar pinyin estilo espeak manualmente.
- Las voces heart y heart-nano aceptan como máximo 207 símbolos fonéticos por llamada; el texto más largo debe dividirse por frases.
- El decodificador es alimentado por ruido: la semilla modifica ligeramente la voz y no se reproduce la inyección de sibilantes opcional de upstream.
- Requiere `loom-py-rt` 1.0.0rc18 o superior por la operación `ISTFT`; versiones anteriores fallan con `unknown op 'ISTFT'`.
- En Raspberry Pi Zero y Pi 1-3 con `loom-py-rt` 1.0.0rc20 o anterior, el backend GPU aborta con un `GGML_ASSERT` en `conv_f32_run` salvo que se defina `GGML_VC4_FUSE=0` o se use `device="cpu"`.
- Es un trabajo en curso: el fonemizador orthography2ipa es un reemplazo mínimo y las lenguas de ortografía profunda necesitan un léxico de referencia para reglas de acentuación y fonemización contextual.
- Riesgo de alucinación y sesgos: no se documentan en la información disponible; al ser un modelo acústico condicionado por fonemas, el riesgo principal es de pronunciación incorrecta, no de contenido inventado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/loom-ai-org/sanotts-loom
- Modelo base: https://huggingface.co/ampixa/sanoTTS
- Motor loom.cpp: https://github.com/loom-ai-org/loom.cpp
- Exportador loom-exporter: https://github.com/loom-ai-org/loom-exporter
- Runtime loom-py: https://github.com/loom-ai-org/loom-py
- Léxico de pronunciación para inglés: https://huggingface.co/loom-ai-org/sanotts-loom/resolve/main/lexicons/en_US-misaki.tsv
