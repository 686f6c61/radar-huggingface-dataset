# litert-community/Audio8-TTS-Realistic-0.6b

## Resumen

Audio8-TTS-Realistic-0.6b es un modelo de síntesis de voz (text-to-speech) con clonación de voz zero-shot desarrollado por Edge0, distribuido aquí en formato LiteRT por la comunidad litert-community para su ejecución íntegra en dispositivo (on-device). El modelo base es `Edge0/Audio8-TTS-Realistic-0.6b`, construido sobre Audio8-TTS-Preview-0.6b, y esta conversión emplea litert-torch 0.9.4 y ai-edge-quantizer 0.9.0 sobre LiteRT 2.2.0. Su relevancia actual radica en que permite generar voz de alta calidad a 44,1 kHz en teléfonos Android sin conexión a red, con factores de tiempo real por debajo de 1.

La arquitectura es un diseño DualAR inspirado en Fish Audio S2 Pro: un transformer "lento" de 24 capas predice un token semántico por trama de audio (2.048 muestras, 46 ms), un transformer "rápido" de 4 capas predice los 10 codebooks del códec uno a uno, y un códec neuronal convierte las tramas en audio. El nombre indica 0,6 mil millones de parámetros, y el modelo cubre 23 idiomas, incluidos chino, inglés, japonés, coreano, español, alemán, francés, árabe, hindi y cantonés.

El repositorio incluye cinco grafos LiteRT (AR lento, AR rápido, decodificador de códec en dos ventanas y codificador de códec), el tokenizador original, dos voces de referencia, un bucle anfitrión en Python para escritorio y una app de ejemplo para Android. La licencia es Apache 2.0 para los pesos y el modelo, con el código de la app Android bajo MIT.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | DualAR (transformer autorregresivo lento de 24 capas + transformer rápido de 4 capas + códec neuronal), inspirada en Fish Audio S2 Pro |
| Parámetros totales | 0,6 mil millones (aprox., según nombre del modelo; no se detalla desglose exacto) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 1.024 posiciones de KV cache en el AR lento; hasta 256 posiciones de prompt por llamada (firma `prefill_256`); máximo 512 tramas de audio generadas |
| Tipos de cuantización | Pesos int8 dinámicos por canal + tablas de embedding int8 (grafos AR); pesos float16 (decodificador y codificador de códec) |
| Idiomas soportados | 23: zh, en, ja, ko, de, fr, es, it, ru, ar, fi, hi, id, ms, nl, no, pl, pt, sv, th, tr, vi, yue |
| Licencia | Apache 2.0 (pesos y modelo); MIT para el código de la app Android |
| Formato de pesos | TFLite (LiteRT); tokenizador en `tokenizer.json` (Qwen2 BPE) |

## Arquitectura y entrenamiento

El modelo sigue un esquema DualAR en el que dos transformadores autorregresivos colaboran jerárquicamente. El AR lento, de 24 capas, consume el texto tokenizado y predice un token semántico por trama de audio de 2.048 muestras (46 ms a 44,1 kHz); su KV cache abarca 1.024 posiciones y devuelve 4.097 logits (4.096 tokens semánticos más el token de fin de habla) junto con el estado oculto que alimenta al AR rápido. Este último, de 4 capas y con una KV cache de 10 posiciones, se invoca 10 veces por trama para predecir secuencialmente los 10 codebooks del códec: la posición 0 recibe el estado oculto del AR lento y las posiciones 1 a 9 el token del codebook anterior. Finalmente, un códec neuronal (decodificador y codificador) transforma las tramas en audio de 44,1 kHz.

La conversión a LiteRT aplica cuantización dinámica int8 por canal a los pesos de ambos grafos AR (con tablas de embedding int8) y mantiene float16 en el códec. El decodificador del códec se reescribió específicamente para GPUs móviles y se ofrece en dos ventanas (128 tramas / 5,9 s y 192 tramas / 8,9 s). El codificador procesa hasta 10,03 s de audio a 44,1 kHz para producir 10 × 216 códigos, lo que permite registrar una voz de referencia. No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni el uso de RLHF o DPO en la documentación proporcionada.

## Capacidades

- Síntesis de voz de alta fidelidad a 44,1 kHz con generación de audio natural.
- Clonación de voz zero-shot a partir de una grabación de referencia de hasta 10 s y su transcripción exacta.
- Síntesis sin voz de referencia (modo sin referencia).
- Multilingüe: 23 idiomas, incluidos español, inglés, chino, japonés, coreano, árabe, hindi y cantonés.
- Ejecución completamente on-device en Android mediante LiteRT 2.2.0 (CompiledModel API) y en escritorio mediante el intérprete ai-edge-litert.
- Muestreo configurable: temperatura 0,7, top-p 0,9, top-k 50 por defecto (configuración del repositorio fuente), con redibujado consciente de repeticiones del proveedor.
- Control de longitud: hasta 512 tramas de audio y hasta 49 tokens de texto por frase en la app Android.
- Aceleración opcional por GPU para el decodificador del códec, con verificación de correlación (≥ 0,99) frente a CPU y fallback automático.
- No se documenta soporte de tool calling, function calling, agentes, visión ni audio de entrada más allá de la referencia de voz.

## Casos de uso

- **Lectura de contenido en aplicaciones móviles sin conexión**: el modelo puede narrar artículos, noticias o libros electrónicos íntegramente en el dispositivo, sin enviar texto a servidores, gracias a sus grafos LiteRT y a un factor de tiempo real inferior a 1 en Pixel 11 Pro (0,884) y Galaxy S26 (0,725).
- **Asistentes de voz personalizados**: integrado en un asistente Android, permite respuestas habladas en 23 idiomas y con la voz del propio usuario mediante clonación zero-shot a partir de una grabación de 10 s, manteniendo la privacidad al no salir el audio del terminal.
- **Accesibilidad para personas con discapacidad visual o del habla**: la clonación de voz permite a usuarios con trastornos del habla generar una voz sintética a partir de una muestra corta, y la síntesis multilingüe facilita la lectura de pantalla en el idioma preferido del usuario.
- **Localización de aplicaciones y contenido multimedia**: generación de voces en español, inglés, japonés y otros 20 idiomas para doblaje de tutoriales, audiolibros o interfaces de producto, con la ventaja de ejecutarse en el propio dispositivo de desarrollo o de prueba.
- **Prototipado de interfaces conversacionales**: desarrolladores que necesitan validar flujos de voz en Android pueden usar la app de ejemplo y el bucle Python para iterar rápidamente sin depender de APIs en la nube ni de costes por petición.
- **Sistemas de navegación y avisos en vehículos o dispositivos embebidos**: la baja latencia (RTF < 1) y la ejecución local permiten anuncios de navegación y alertas habladas en tiempo real sin conectividad, con voces adaptadas al idioma del conductor.
- **Investigación en TTS on-device**: el repositorio expone los grafos por separado (AR lento, AR rápido, códec) y un bucle anfitrión configurable, lo que facilita experimentar con muestreo, cuantización y aceleración GPU/CPU en entornos de investigación.

## Benchmarks y rendimiento

Los únicos datos de rendimiento publicados en la información disponible son medidas de factor de tiempo real (RTF) en dispositivos Android:

| Dispositivo | Frase | Duración de audio | RTF (mediana de 6 ejecuciones) |
|---|---|---|---|
| Pixel 11 Pro | 18 tokens en inglés | 5,48 s | 0,884 |
| Galaxy S26 | 18 tokens en inglés | 6,36 s | 0,725 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible, dado que se trata de un modelo de síntesis de voz y no de un modelo de lenguaje general.

## Requisitos de hardware

- **VRAM/RAM estimada para inferencia**: el repositorio ocupa 1,6 GB; los grafos AR int8 suman aproximadamente 620 MB y el decodificador float16 unos 262 MB, por lo que se necesita del orden de 1 a 1,5 GB de memoria para cargar el conjunto completo en CPU.
- **GPU recomendadas**: no se especifican GPU de escritorio; el decodificador del códec puede ejecutarse en GPU móvil (verificado en Pixel 11 Pro y Galaxy S26). En escritorio, el bucle Python usa el intérprete ai-edge-litert en CPU con 4 hilos por defecto.
- **Compatibilidad con GPU de consumo**: no se documenta soporte para GPU de consumo tipo RTX 4090; el diseño está orientado a CPU y GPU móvil.
- **Opciones de despliegue**: LiteRT 2.2.0 (CompiledModel API en Android), ai-edge-litert Interpreter en Python de escritorio, app Android de ejemplo en Kotlin. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este formato.
- **Latencia y throughput**: RTF de 0,884 en Pixel 11 Pro y 0,725 en Galaxy S26, es decir, la síntesis termina antes de que el audio hablado habría finalizado su reproducción. El AR lento actualiza su KV cache in situ y ambos grafos AR corren en CPU con 4 hilos.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones de modelos alternativos en la información proporcionada, por lo que la comparación cuantitativa no está disponible. A modo orientativo, se puede contrastar con otras familias de TTS on-device, pero sin cifras verificadas en esta ficha:

| Modelo | Parámetros | Contexto / límite | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Audio8-TTS-Realistic-0.6b (LiteRT) | ~0,6 B | 512 tramas de audio, 1.024 posiciones KV | 23 | Apache 2.0 | TFLite |
| Alternativas de TTS on-device | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- **Riesgo de uso indebido de la clonación de voz**: la capacidad zero-shot permite imitar voces con una muestra de 10 s; es necesario obtener consentimiento explícito y cumplir la normativa aplicable sobre suplantación de identidad y deepfakes.
- **Sesgos y cobertura lingüística desigual**: aunque se declaran 23 idiomas, no se documenta el volumen de datos por idioma ni la calidad relativa; el español y otras lenguas pueden tener un rendimiento inferior al inglés o al chino.
- **Riesgo de alucinación acústica**: como todo modelo generativo, puede producir pronunciaciones incorrectas, omisiones o artefactos en textos largos, nombres propios o dominios especializados; se recomienda validación humana en producción.
- **Límites de longitud**: la app Android admite frases de hasta 49 tokens y el modelo genera como máximo 512 tramas; el decodificador trabaja en ventanas de 128 o 192 tramas, lo que puede requerir segmentación para audios largos.
- **Dependencia de la transcripción de referencia**: la calidad de la clonación depende de que la transcripción de la muestra sea exacta; errores en ella degradan el resultado.
- **Restricciones de licencia**: los pesos y el modelo son Apache 2.0 (uso comercial permitido con atribución), pero el código de la app Android es MIT; conviene revisar las licencias de las voces de referencia incluidas (la voz inglesa es CC BY 4.0).
- **Madurez del ecosistema**: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y la fecha de creación es 2026-11-02, por lo que la comunidad y el soporte son aún incipientes.
- **Dependencia de versiones concretas**: la conversión requiere LiteRT 2.2.0, litert-torch 0.9.4 y ai-edge-quantizer 0.9.0; cambios de versión pueden romper la compatibilidad de los grafos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/litert-community/Audio8-TTS-Realistic-0.6b
- Modelo base: https://huggingface.co/Edge0/Audio8-TTS-Realistic-0.6b
- App Android de ejemplo: https://huggingface.co/litert-community/Audio8-TTS-Realistic-0.6b/tree/main/android
- Instrucciones de compilación Android: https://huggingface.co/litert-community/Audio8-TTS-Realistic-0.6b/blob/main/android/README.md
- No se han encontrado en la información proporcionada papers, blogs, repositorios adicionales ni demos más allá de los enlaces anteriores.
