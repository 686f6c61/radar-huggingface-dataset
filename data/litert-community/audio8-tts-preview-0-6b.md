# litert-community/Audio8-TTS-Preview-0.6b

## Resumen

Audio8-TTS-Preview-0.6b es un modelo de síntesis de voz (text-to-speech) con clonación de voz zero-shot, desarrollado originalmente por Edge0 y convertido a formato LiteRT (`.tflite`) por la comunidad `litert-community` para su ejecución íntegra en dispositivo. El modelo base sigue la estela de Fish Audio S2 Pro y emplea una arquitectura DualAR: un transformer "lento" de 24 capas que predice un token semántico cada 46 ms y un transformer "rápido" de 4 capas que genera los diez codebooks del códec por fotograma. Un códec neuronal (RVQ con transformer ventaneado de 8 capas y ConvNet de sobremuestreo causal) convierte esos fotogramas en audio a 44,1 kHz nativos.

La relevancia de esta conversión radica en que permite TTS de calidad con clonación de voz en 11 idiomas sin conexión a red ni servidores, con un coste de almacenamiento de 2,6 GB para el conjunto completo de grafos. En un Galaxy S26 con LiteRT 2.2.0 se midió un factor de tiempo real (RTF) de 0,857 para una frase inglesa de 18 tokens y 0,900 para una japonesa de 14 tokens, con el decodificador del códec en GPU.

El repositorio incluye cuatro grafos (slow AR en int8 e int4, fast AR en int8, decodificadores de códec en fp16 e int8, codificador para registro de voz), el tokenizer original del proveedor y un bucle anfitrión en Python que reproduce el muestreador y el formato de prompt del fabricante. La licencia Apache-2.0 facilita su integración comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DualAR (transformer lento de 24 capas + transformer rápido de 4 capas) con códec neuronal RVQ (transformer ventaneado de 8 capas + ConvNet de sobremuestreo causal) |
| Parametros totales | 0,6 B (aproximado, según nombre del modelo; desglose exacto no disponible) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2048 tokens (max_seq_len del slow AR); decodificador de códec en ventanas de 128 o 192 fotogramas (5,9 s u 8,9 s) |
| Tipos de cuantizacion | int8 dinámico (per-channel) en proyecciones y tablas de embedding; int4 blockwise-32 OCTAV en slow AR; fp16 en decodificadores de códec; int8 en decodificador de códec (PT2E en exportación, codebooks fp32) |
| Idiomas soportados | en, zh, yue, ja, ko, de, fr, es, it, nl, pl |
| Licencia | Apache-2.0 |
| Formato de pesos | LiteRT (`.tflite`), tokenizer en `tokenizer.json` (Qwen2 BPE) |

## Arquitectura y entrenamiento

El modelo es un DualAR speech LM en la línea de Fish Audio S2 Pro. El transformer lento (24 capas) procesa el texto tokenizado y predice un token semántico por fotograma de 46 ms, con una caché KV de 2048 posiciones expuesta como entrada/salida del grafo y una salida de 4097 logits (4096 tokens semánticos más fin de habla). El transformer rápido (4 capas, caché KV de 10 ranuras) se invoca diez veces por fotograma: la posición 0 recibe el estado oculto normalizado del slow AR y las posiciones 1-9 el token del codebook anterior. El códec neuronal transforma los fotogramas en audio a 44,1 kHz mediante RVQ, un transformer ventaneado de 8 capas y una ConvNet de sobremuestreo causal.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en la información proporcionada. La conversión a LiteRT preserva el tokenizer del proveedor (Qwen2 BPE con tokens `<|semantic:N|>` y de rol) y el muestreador original (temperatura 0,7, top-p 0,9, top-k 50, máximo 512 fotogramas por defecto, con redesorte consciente de repeticiones). La innovación técnica destacable es la separación slow/fast AR con caché KV explícita como I/O del grafo, que permite ejecutar la generación autorregresiva en CPU con 4 hilos mientras el decodificador del códec se descarga a la GPU móvil cuando pasa una comprobación de consistencia contra CPU.

## Capacidades

- Síntesis de voz a 44,1 kHz nativos con calidad de conversión texto-a-habla.
- Clonación de voz zero-shot a partir de un clip de 0,5 a 10 s y su transcripción exacta, mediante registro previo con el codificador de códec.
- Generación sin voz de referencia (modo sin referencia).
- Soporte multilingüe en 11 idiomas: inglés, chino mandarín, cantonés, japonés, coreano, alemán, francés, español, italiano, neerlandés y polaco.
- Ejecución íntegra en dispositivo (on-device) sin conexión a red.
- Dos voces de referencia incluidas: una de LibriSpeech dev-clean (CC BY 4.0) y otra japonesa de FunAudioLLM/Fun-ASR-Nano-2512 (Apache-2.0).
- Decodificación por ventanas de 128 o 192 fotogramas para textos largos.
- Muestreador configurable con temperatura, top-k y top-p, y redesorte ante repeticiones.
- No se documenta soporte de tool calling, function calling, agentes, visión ni audio de entrada más allá del clip de referencia para clonación.

## Casos de uso

- Lectura de textos largos en aplicaciones móviles sin conexión: el bucle anfitrión divide el texto en ventanas de 128 o 192 fotogramas (5,9 s u 8,9 s de audio) y encadena la decodificación, lo que permite narrar artículos o libros completos en el dispositivo sin enviar texto a servidores.
- Accesibilidad para personas con discapacidad visual: integración en lectores de pantalla Android mediante el sample app incluido, con latencia RTF cercana a 0,86 en un Galaxy S26 y clonación de la propia voz del usuario a partir de una grabación de 10 s.
- Asistentes de voz embebidos en vehículos o electrodomésticos: el modelo cabe en 2,6 GB de almacenamiento y ejecuta los grafos autorregresivos en CPU con 4 hilos, lo que evita depender de conectividad y protege la privacidad de las locuciones.
- Localización de contenidos a 11 idiomas: un mismo pipeline puede generar la misma frase en inglés, español, japonés o polaco manteniendo la voz clonada del hablante, útil para doblaje de vídeos cortos y audiolibros multilingües.
- Prototipado de interfaces conversacionales: el script `audio8_tts_litert.py` permite validar en escritorio el formato de prompt y el muestreador del fabricante antes de portar la lógica a Android, reduciendo el ciclo de iteración.
- Generación de avisos y notificaciones personalizadas en apps de salud o banca: la clonación zero-shot con un clip corto permite que las alertas suenen con la voz del propio usuario o de un familiar, con audio generado localmente y sin exponer datos sensibles.
- Investigación en TTS eficiente: los cuatro grafos con distintas cuantizaciones (int8, int4 OCTAV, fp16) sirven como banco de pruebas para estudiar el impacto de la cuantización en la calidad y la latencia de un speech LM DualAR en hardware móvil.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Los únicos datos de rendimiento son medidas de latencia en dispositivo:

| Escenario | Dispositivo | RTF (mediana) | Rango | Notas |
|---|---|---|---|---|
| Frase inglesa de 18 tokens | Galaxy S26, LiteRT 2.2.0, decodificador en GPU | 0,857 | 0,828-1,229 | 5,99 s de audio; 6 ejecuciones en dos procesos |
| Frase japonesa de 14 tokens | Galaxy S26, LiteRT 2.2.0, decodificador en GPU | 0,900 | 0,880-0,904 | 3,44 s de audio |
| Carga del modelo | Galaxy S26 | 10,9-12,4 s | — | Incluye 7,8-8,2 s de comprobación del decodificador |
| Llamada de 128 fotogramas al decodificador | Galaxy S26, CPU | 2,84-2,85 s | — | Cuatro procesos de app |
| Llamada de 128 fotogramas al decodificador | Galaxy S26, GPU | 0,91-0,96 s | — | Por frase |
| Carga con fallo de comprobación y decodificador en CPU | Pixel 11 Pro, thermal status 1, CPU limitada | 18,7 s | — | 13,5 s corresponden a la primera llamada del decodificador en CPU (calentamiento con códigos a cero) |

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato / despliegue | Notas |
|---|---|---|---|---|---|---|
| Audio8-TTS-Preview-0.6b (LiteRT) | 0,6 B | 2048 tokens; ventanas de 128/192 fotogramas | 11 | Apache-2.0 | LiteRT `.tflite`, on-device | Clonación zero-shot, RTF ~0,86 en Galaxy S26 |
| Edge0/Audio8-TTS-Preview-0.6b (base) | 0,6 B | no disponible | 11 | Apache-2.0 | Pesos del proveedor (no especificado) | Modelo original del que deriva esta conversión |
| Fish Audio S2 Pro | no disponible | no disponible | no disponible | no disponible | no disponible | Linaje arquitectónico citado por el autor; datos no disponibles en la información proporcionada |

No se dispone de datos de benchmarks ni de especificaciones detalladas de alternativas comparables en la información proporcionada.

## Limitaciones y advertencias

- Es una versión "Preview": el autor la etiqueta como preliminar y los grafos del decodificador fueron reemplazados el 2026-11-02 bajo los mismos nombres, lo que puede romper reproducibilidad si se depende de bytes concretos.
- La comprobación de consistencia del decodificador en GPU añade 7,8-8,2 s a la carga; si falla, el decodificador cae a CPU y la primera llamada puede tardar 13,5 s (calentamiento) y la carga total 18,7 s en un Pixel 11 Pro con CPU limitada.
- El RTF puede superar 1,0 (hasta 1,229 en las medidas), es decir, generación más lenta que tiempo real en algunas ejecuciones del Galaxy S26.
- La clonación de voz exige un clip de 0,5 a 10 s con transcripción exacta; transcripciones erróneas degradan la calidad de la voz clonada.
- Riesgo de uso indebido para suplantación de identidad: la clonación zero-shot con Apache-2.0 no impone restricciones técnicas de consentimiento, por lo que la responsabilidad recae en el integrador.
- No se documentan sesgos lingüísticos por idioma ni evaluaciones de fidelidad; los 11 idiomas están soportados pero no se aportan métricas de calidad por lengua.
- El contexto del slow AR está limitado a 2048 tokens y el audio se genera en ventanas de 5,9 s u 8,9 s, lo que exige encadenar ventanas para textos largos y puede introducir discontinuidades en las uniones.
- El modelo no acepta audio de entrada salvo para el registro de voz; no hay soporte documentado de tool calling ni de razonamiento multi-paso.
- La licencia Apache-2.0 permite uso comercial, pero las voces de referencia incluidas tienen sus propias licencias (CC BY 4.0 y Apache-2.0) que deben respetarse al redistribuirlas.

## Enlaces

- Repositorio LiteRT en Hugging Face: https://huggingface.co/litert-community/Audio8-TTS-Preview-0.6b
- Modelo base: https://huggingface.co/Edge0/Audio8-TTS-Preview-0.6b
- Aplicación Android de ejemplo: https://huggingface.co/litert-community/Audio8-TTS-Preview-0.6b/tree/main/android
- Commit con los decodificadores originales: https://huggingface.co/litert-community/Audio8-TTS-Preview-0.6b/tree/56fcb491ebf03eb3a1a66615fedf6744015dd4c7
- Clip japonés de referencia (FunAudioLLM/Fun-ASR-Nano-2512): https://huggingface.co/FunAudioLLM/Fun-ASR-Nano-2512
