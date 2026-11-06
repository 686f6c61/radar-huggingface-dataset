# nphearum/PsarAI-Omni-GGUF

## Resumen

PsarAI-Omni v0.1 GGUF es una adaptación multimodal de tipo speech-to-speech construida sobre google/gemma-4-E2B-it, publicada por el usuario nphearum. El modelo recibe audio como entrada y produce audio como salida directamente, sin encadenar módulos separados de ASR, traducción y TTS: el adaptador de audio se fusiona en el mmproj junto con una LoRA (r8) sobre la atención del LM, y un decodificador de voz incluido en el propio mmproj genera la respuesta hablada a partir de los estados ocultos de Gemma. Está orientado a tres idiomas: jemer (km), inglés (en) y francés (fr).

El repositorio distribuye los pesos en formato GGUF para su uso con llama.cpp y audio.cpp, e incluye dos rutas de despliegue: una configuración íntegra en llama.cpp (con un parche propio del autor sobre la build de Unsloth) y una configuración híbrida en la que llama.cpp "piensa" y audio.cpp "habla". También se incluye un cliente Python (`psarai_omni_gguf.py`) que transmite la respuesta y sintetiza cada frase en cuanto se escribe.

El dato de parámetros reportado en safetensors es de 4.647.450.147, si bien el modelo base declarado (gemma-4-E2B-it) sugiere una variante de la familia E2B; la discrepancia entre ambos datos no se aclara en la información disponible. La licencia es Gemma Terms of Use y el modelo se publica como versión de investigación (v0.1).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (base Gemma-4-E2B-it) con adaptador de audio fusionado en mmproj, LoRA r8 sobre atención del LM y decodificador de voz en el mmproj |
| Parámetros totales | 4.647.450.147 (según safetensors); no se detalla el desglose por componente |
| Parámetros activos | no disponible |
| Longitud de contexto | 4096 tokens (valor usado en el ejemplo de despliegue con `-c 4096`); no se especifica el máximo del modelo base |
| Tipos de cuantización | f16 en todos los ficheros publicados; no se listan otras cuantizaciones |
| Idiomas soportados | km (jemer), en (inglés), fr (francés) |
| Licencia | Gemma Terms of Use |
| Formato de pesos | GGUF (llama.cpp y audio.cpp) |

## Arquitectura y entrenamiento

El modelo parte de google/gemma-4-E2B-it y le añade un adaptador de audio para jemer, inglés y francés fusionado en el fichero mmproj, junto con las torres de audio y visión de Gemma. Sobre el LM se aplica una LoRA de rango 8 sobre la atención, que se activa durante la fase de "pensamiento" (generación del texto de respuesta) y se desactiva en la pasada de síntesis de voz. La síntesis no emplea un TTS externo: un generador de voz (`psarai_omni_gen`) incluido en el mmproj completo lee los estados ocultos de Gemma y produce la señal acústica, con un vocoder y un encoder de hablante CAM++ para clonación de voz a partir de unos segundos de audio de referencia.

El repositorio separa los componentes en ficheros GGUF independientes: el modelo base sin modificar, el mmproj con adaptador de audio, la LoRA, un mmproj "full" que integra el generador de voz y CAM++, y un fichero de voz (`psarai-omni-speech.gguf`) para la ruta híbrida con audio.cpp. No se especifican en la información disponible el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. La innovación principal es la integración de la síntesis de voz dentro del propio pipeline de llama.cpp mediante un projector personalizado y un endpoint `/tts`, eliminando la orquestación de tres modelos separados.

## Capacidades

- Speech-to-speech directo: entrada de audio y salida de audio en una sola pila, sin ASR ni TTS intermedios.
- Generación de texto a partir de audio: el endpoint `/v1/chat/completions` recibe audio y produce una respuesta textual breve.
- Síntesis de voz desde texto: endpoint `/tts` que convierte una frase en audio.
- Clonación de voz: a partir de una referencia de audio de pocos segundos, mediante el encoder CAM++ (`speaker_ref` o `speaker_ref_b64`).
- Voz predefinida tipo "Jarvis" para la síntesis sin referencia.
- Multilingüe en jemer, inglés y francés, tanto en comprensión como en generación hablada.
- Procesamiento de audio de entrada de hasta 30 segundos.
- Torres de visión heredadas de Gemma-4-E2B-it presentes en el mmproj (no se documenta su uso en esta adaptación).
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Modo "thinking": la generación de texto se realiza con la LoRA activa y la síntesis con la LoRA desactivada, pero no se describe un modo de razonamiento extendido.

## Casos de uso

- Asistente de voz para jemer: el modelo permite mantener una conversación hablada en jemer sin depender de un ASR específico para ese idioma, con respuestas sintetizadas en la misma llamada. Es adecuado por su soporte nativo del idioma y su latencia baja (primera respuesta de audio en 0,29-0,37 s de mediana en RTX 3090).
- Atención al cliente telefónica multilingüe: con inglés, francés y jemer en un mismo servidor, se puede desplegar un punto de atención que reciba audio del cliente y responda con voz, usando la clonación de voz para mantener una identidad de marca consistente.
- Interfaces de voz para personas con discapacidad visual: la conversión directa de pregunta hablada a respuesta hablada, con latencia inferior a medio segundo, permite interacciones fluidas sin pantalla.
- Prótesis o asistentes conversacionales embebidos: al ejecutarse en llama.cpp con cuantización f16 y caber en una GPU de consumo (RTX 3090 en las pruebas), es viable en estaciones de trabajo locales sin infraestructura en la nube.
- Generación de locuciones con voz clonada: el endpoint `/tts` con `speaker_ref` permite producir audio en la voz de un hablante de referencia para doblaje o contenido formativo en los tres idiomas soportados.
- Investigación en modelos omni: sirve como base reproducible para estudiar la integración de decodificadores de voz sobre estados ocultos de un LM, con parches de llama.cpp y audio.cpp publicados y métricas de correlación frente a la implementación en PyTorch.
- Prototipado de agentes de voz en Python: el cliente `psarai_omni_gguf.py` transmite la respuesta y sintetiza frase a frase, lo que facilita integrar el modelo en pipelines de aplicaciones conversacionales existentes.

## Benchmarks y rendimiento

Los datos publicados por el autor son métricas de fidelidad y latencia, no benchmarks académicos estándar.

| Métrica | GGUF | Paquete Python |
|---|---:|---:|
| Estados ocultos de llama.cpp vs transformers (coseno, 18 frases) | 0,9999 | 1 |
| Tokenización idéntica a transformers | 18/18 | — |
| Voz de audio.cpp vs decodificador PyTorch, mismos estados ocultos (correlación de forma de onda 1,00) | 7/8 | — |
| Texto de respuesta idéntico al paquete Python | 3/4 | — |
| CER de la respuesta hablada transcrita por ASR vs texto de respuesta (4 respuestas) | 6,4 % | — |
| Primera señal de audio tras la pregunta (mediana) | 0,29 s | 0,43 s |
| Respuesta completa sintetizada (mediana) | 0,39 s | 1,0 s |
| Solo llama.cpp: texto idéntico a Python | 3/4 | — |
| Solo llama.cpp: voz idéntica al híbrido (correlación 1,00) | 10/16 | — |
| Solo llama.cpp: frases habladas transcritas (CER, 16) | 10,9 % | 9,2 % |
| Solo llama.cpp: primera señal de audio (mediana) / por frase en `/tts` | 0,37 s / 0,16 s | — |
| Solo llama.cpp, voz clonada (4 voces × 4 frases): similitud con la referencia | 0,475 | 0,454 |
| Solo llama.cpp, voz clonada: frases transcritas (CER) | 7,0 % | 11,1 % |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni benchmarks equivalentes en la información disponible.

## Requisitos de hardware

- Los pesos se distribuyen únicamente en f16; el repositorio ocupa 13,8 GB, por lo que se necesita al menos esa cantidad de VRAM para cargar todos los ficheros, o bien cargar solo el subconjunto necesario según la ruta de despliegue.
- GPU de referencia en las pruebas del autor: RTX 3090 (24 GB), con la que se obtienen las latencias reportadas.
- Cabe en GPU de consumo de gama alta con 24 GB o más; no se documenta el comportamiento en GPUs de 8-16 GB ni con cuantizaciones menores.
- Despliegue recomendado: build de llama.cpp de Unsloth b11985 con el parche `patches/llama.cpp-psarai_omni.patch` aplicado, compilado con `-DGGML_CUDA=ON`, y `llama-server` con `-ngl 99 -c 4096`.
- Despliegue híbrido: tres servidores (think con llama-server + mmproj + LoRA, embed con `--embeddings --pooling none` y speak con `audiocpp_server` y `psarai-omni-speech.gguf`).
- El cliente Python requiere `requests`, `numpy` y `soundfile`.
- Advertencia de despliegue: una build CUDA 13 de llama.cpp que no encuentre `libcudart.so.13` cae a CPU sin error, con una penalización de aproximadamente 20x; se recomienda usar `--cuda-lib` para fijar `LD_LIBRARY_PATH`.
- Throughput no disponible; solo se publican latencias de primera señal de audio y de síntesis por frase.

## Comparativa con modelos similares

No se dispone de datos de benchmarks estándar ni de especificaciones comparables de alternativas en la información proporcionada, por lo que la comparación cuantitativa no está disponible.

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| PsarAI-Omni v0.1 GGUF | 4.647.450.147 (safetensors) | 4096 (uso documentado) | km, en, fr | Gemma Terms of Use | GGUF |
| google/gemma-4-E2B-it (base) | no disponible en la información | no disponible | no disponible | Gemma Terms of Use | safetensors |
| Alternativas speech-to-speech de la misma categoría | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Versión de investigación (v0.1): las respuestas en jemer a menudo reformulan lo dicho en lugar de responder a la pregunta.
- En la ruta híbrida, Gemma se carga dos veces (servidores think y embed), lo que duplica el consumo de memoria; la ruta solo con llama.cpp lo carga una vez.
- La entrada de audio está limitada a 30 segundos.
- El decodificador de voz selecciona unidades de forma greedy, por lo que diferencias numéricas mínimas entre runtimes (coseno 0,9999 entre llama.cpp y transformers) alteran ligeramente algunas frases; la inteligibilidad se mantiene dentro del ruido según el autor.
- CER de la voz sintetizada del 6,4-10,9 % según la ruta, lo que implica errores de pronunciación o inteligibilidad medibles en producción.
- La similitud de la voz clonada con la referencia es de 0,475 (llama.cpp), un valor moderado que puede no ser suficiente para aplicaciones de identidad de marca exigentes.
- Solo se publican pesos en f16; no hay cuantizaciones menores que faciliten el despliegue en GPUs con menos VRAM.
- Riesgo de alucinación y sesgos: no se documentan evaluaciones específicas en la información disponible.
- Restricciones de licencia: se aplican los Gemma Terms of Use, que condicionan el uso comercial y la redistribución.
- La ruta solo con llama.cpp requiere aplicar un parche propio sobre una build concreta de Unsloth (b11985, commit 6f4cc4d), lo que añade riesgo de mantenimiento y de compatibilidad con versiones futuras.
- La ruta híbrida requiere un parche sobre audio.cpp (commit 50749561) y una familia de modelos `psarai_speech` no estándar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nphearum/PsarAI-Omni-GGUF
- Modelo base: https://huggingface.co/google/gemma-4-E2B-it
- Repositorio de llama.cpp de Unsloth (build b11985, commit 6f4cc4d): https://github.com/unslothai/llama.cpp
- Repositorio de audio.cpp (commit 50749561): no se proporciona URL en la información disponible
- Parches incluidos en el repositorio: `patches/llama.cpp-psarai_omni.patch` y `patches/audio.cpp-psarai.patch`
- Cliente Python y configuración: `psarai_omni_gguf.py`, `psarai-omni.json` (incluidos en el repositorio)
- Paper, blog o demo adicionales: no disponible
