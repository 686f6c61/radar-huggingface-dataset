# mah92/Chatterbox-FA-T3-Q4_K-GGUF

## Resumen

Chatterbox FA — T3 Q4_K GGUF es una cuantización de 4 bits del componente T3 (texto a tokens de habla) del modelo de síntesis de voz Chatterbox, especializado en persa (farsi). Lo publica el usuario mah92 sobre la arquitectura original de ResembleAI y el ajuste fino persa de Thomcles, empaquetado en formato GGUF para su uso con el motor CrispASR, derivado del ecosistema llama.cpp. El repositorio contiene únicamente el fichero T3; la generación de audio real requiere además el fichero S3Gen (tokens de habla a audio), que se obtiene del repositorio padre.

El modelo resuelve un problema concreto: ejecutar TTS persa de calidad en hardware modesto reduciendo el peso del componente T3 de 1138 MB (f16) a 386 MB (Q4_K), es decir, en torno al 34 % del tamaño original. Es relevante para desarrolladores que necesitan integrar voz en farsi en aplicaciones locales o de borde sin depender de servicios en la nube, y para quienes ya trabajan con el ecosistema GGUF/llama.cpp y quieren reutilizar su infraestructura.

La arquitectura subyacente es la de Chatterbox (modelo TTS de ResembleAI), con licencia MIT. El contexto, el número de parámetros y los idiomas adicionales no están disponibles en la información proporcionada; el único idioma declarado es `fa` (persa).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Chatterbox (TTS); este repositorio contiene solo el componente T3 (texto a tokens de habla) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K (212 tensores Q4_K, 1 tensor Q8_0, 98 tensores F32; 313 tensores en total) |
| Idiomas soportados | Persa (farsi, `fa`) |
| Licencia | MIT |
| Formato de pesos | GGUF (`chatterbox-t3-fa-q4k.gguf`, 366 MB; requiere además `chatterbox-s3gen-q8_0.gguf`, 365 MB, del repositorio padre) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna de Chatterbox ni los datos de entrenamiento (número de tokens, composición del dataset, uso de RLHF/DPO). Lo que sí se documenta es el proceso de cuantización: se parte del fichero f16 publicado en `mazrba/Chatterbox-TTS-Persian-gguf` y se aplica el cuantizador propio de CrispASR con el comando `crispasr-quantize chatterbox-t3-fa-f16.gguf chatterbox-t3-fa-q4k.gguf q4_k`. El resultado conserva las normas y los sesgos en F32 (98 tensores) y un tensor en Q8_0, mientras que los 212 tensores restantes pasan a Q4_K.

La innovación técnica destacable de esta ficha no está en el modelo base sino en el empaquetado: un pipeline TTS de dos etapas (T3 texto a tokens y S3Gen tokens a audio) separado en dos ficheros GGUF que se cargan conjuntamente en CrispASR. El autor reporta una reducción de tamaño del 1138 MB (f16) a 386 MB, con una calidad auditiva sin diferencias apreciables frente a f16 según pruebas de escucha y transcripción ASR, aunque sin MOS oficial.

## Capacidades

- Síntesis de voz (text-to-speech) en persa a partir de texto de entrada.
- Generación de audio WAV a 24 kHz, mono, PCM16.
- Clonación de voz a partir de una muestra de referencia de 16 o 24 kHz mono, con consentimiento del hablante.
- Ejecución local mediante el motor CrispASR con backend CUDA (y también con build CPU-only, aunque mucho más lento).
- Integración en el ecosistema GGUF/llama.cpp mediante el binario `crispasr`.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión ni audio de entrada; este modelo es exclusivamente TTS.

## Casos de uso

- Lectura de contenidos en persa: convertir artículos, documentación o textos de interfaz a voz para aplicaciones de accesibilidad o consumo de contenido en farsi, aprovechando que el modelo cabe en 366 MB y puede ejecutarse en local.
- Asistentes de voz locales: integrar el pipeline T3 + S3Gen en un asistente de escritorio o dispositivo de borde que responda en persa sin enviar texto a servicios externos, con la ventaja de privacidad y de no depender de red.
- Audiolibros y pódcast automatizados: trocear el texto en fragmentos de hasta 240 caracteres (según la recomendación del autor) y sintetizar cada uno con `--tts-output`, concatenando los WAV resultantes.
- Pruebas de voz para aplicaciones multilingües: generar clips de referencia en persa para test de interfaces, avisos de sistema o mensajes de error en productos que se localizan a farsi.
- Clonación de voz con consentimiento: crear una voz sintética a partir de una muestra de referencia de 16/24 kHz para narración personalizada, manteniendo la marca de agua y C2PA que CrispASR añade a la salida.
- Prototipado rápido en GPU de consumo: usar una RTX 3080 Laptop (RTF ≈ 0,7) para iterar sobre guiones y textos antes de desplegar en producción, con un coste de cómputo de aproximadamente 7 segundos por cada 10 segundos de audio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MOS, MMLU, etc.) en la información disponible. El autor aporta únicamente métricas de rendimiento de inferencia:

| Metrica | Valor | Entorno |
|---|---|---|
| RTF (real-time factor) | ≈ 0,7 | GPU RTX 3080 Laptop, backend CUDA |
| RTF | ≈ 4,7 | Build CPU-only del mismo motor |
| Tamano del fichero T3 | 386 MB (Q4_K) frente a 1138 MB (f16) | — |
| Calidad | Sin diferencias apreciables frente a f16 en prueba de escucha y ASR | Sin MOS oficial |

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; los dos ficheros GGUF suman aproximadamente 731 MB en disco, por lo que la huella en memoria es del orden de 1 GB o inferior, aunque no se documenta el pico exacto.
- GPU recomendadas: el autor valida el funcionamiento en una RTX 3080 Laptop con backend CUDA; no se documentan pruebas en A100, H100 ni otras GPU.
- GPU de consumo: sí, cabe en GPU de consumo; el ejemplo validado es una RTX 3080 Laptop. No se confirma compatibilidad con GPU de gama de entrada.
- Despliegue: binario CrispASR (releases de GitHub), con backend CUDA recomendado; el build CPU-only funciona pero con RTF ≈ 4,7. No se documenta soporte en vLLM, TGI, Ollama ni llama.cpp estándar.
- Latencia y throughput: RTF ≈ 0,7 en GPU (aproximadamente 7 s de cómputo por cada 10 s de audio); RTF ≈ 4,7 en CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mah92/Chatterbox-FA-T3-Q4_K-GGUF | no disponible | no disponible | RTF ≈ 0,7 en RTX 3080 Laptop | MIT | GGUF, solo T3, requiere S3Gen |
| cstr/chatterbox-GGUF | no disponible | no disponible | no disponible | no disponible en la informacion | GGUF (incluye `chatterbox-t3-q4_k.gguf`) |
| calcuis/chatterbox-gguf | no disponible | no disponible | no disponible | no disponible en la informacion | GGUF |
| ResembleAI/chatterbox (base) | no disponible | no disponible | no disponible | MIT | Repositorio original |

No se dispone de datos de parámetros, contexto ni benchmarks de los modelos comparables en la información proporcionada; la comparación se limita a formato, licencia y disponibilidad.

## Limitaciones y advertencias

- No se ha realizado una comparación MOS oficial; la evaluación de calidad es solo auditiva y mediante transcripción ASR, por lo que la calidad objetiva frente a f16 no está cuantificada.
- Los textos largos deben trocearse en fragmentos de 240 caracteres o menos; de lo contrario se observan repeticiones o finalización prematura.
- La clonación de voz requiere una muestra de referencia de 16 o 24 kHz mono y el consentimiento explícito del hablante.
- La salida conserva la marca de agua y los metadatos C2PA de CrispASR, lo que puede ser relevante para flujos que exijan audio sin marcar.
- El repositorio contiene solo el componente T3; sin el fichero S3Gen del repositorio padre el modelo no genera audio.
- Solo se declara soporte de persa (`fa`); no hay información sobre otros idiomas.
- El modelo está pensado para ejecución ligera en GPU; el rendimiento en CPU (RTF ≈ 4,7) lo hace poco adecuado para tiempo real sin aceleración.
- Riesgo de sesgos y alucinaciones acústicas: no se documentan análisis específicos, pero al ser un TTS ajustado sobre un modelo base, puede heredar sesgos de los datos de entrenamiento originales.
- La licencia MIT del cuantizado es coherente con la del repositorio padre, pero el autor indica que el trabajo principal corresponde a los autores originales; conviene revisar las condiciones de los repositorios base antes de un uso comercial.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mah92/Chatterbox-FA-T3-Q4_K-GGUF
- Modelo base persa (ajuste fino): https://huggingface.co/Thomcles/Chatterbox-TTS-Persian-Farsi
- Conversión GGUF padre: https://huggingface.co/mazrba/Chatterbox-TTS-Persian-gguf
- Arquitectura original: https://huggingface.co/ResembleAI/chatterbox
- Motor CrispASR: https://github.com/CrispStrobe/CrispASR
- Releases de CrispASR: https://github.com/CrispStrobe/CrispASR/releases
- GGUF alternativo (cstr): https://huggingface.co/cstr/chatterbox-GGUF/blob/main/chatterbox-t3-q4_k.gguf
- GGUF alternativo (calcuis): https://huggingface.co/calcuis/chatterbox-gguf
