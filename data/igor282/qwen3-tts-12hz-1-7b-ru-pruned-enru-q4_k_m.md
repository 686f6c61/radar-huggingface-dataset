# Igor282/qwen3-tts-12hz-1.7b-ru-pruned-enru-Q4_K_M

## Resumen

Qwen3-TTS 12Hz 1.7B RU pruned EN/RU Q4_K_M es una compilación cuantizada en formato GGUF del modelo de síntesis de voz Qwen3-TTS-12Hz-1.7B-Base de Alibaba Qwen, adaptada al ruso mediante un ajuste fino sobre marcas de acentuación (stress) y con el vocabulario de texto podado en un 23,7 % para eliminar escrituras no latinas ni cirílicas. El autor de la ficha es Igor282, que publica el artefacto con licencia Apache 2.0. El modelo resuelve la generación de voz a partir de texto con clonación de voz por referencia de audio de unos 3 segundos, y es relevante porque permite ejecutar un TTS neuronal de 1,7B parámetros en GPUs de consumo con tan solo 4 GB de VRAM, algo impensable con los pesos originales en precisión completa.

La arquitectura subyacente es la de Qwen3-TTS con dos corrientes (talker y code-predictor) y un códec de audio externo, que produce audio WAV mono a 24 kHz con 12,5 fotogramas por segundo (1 fotograma = 80 ms). El vocabulario de texto se reduce de 151 936 a 116 000 tokens sin pérdida para ruso e inglés, y la cuantización Q4_K_M deja el archivo en 1,11 GB. El modelo no admite control de voz por descripción textual (`--instruct`), ya que se basa en la variante Base; para eso existe la variante VoiceDesign, cuyo GGUF Q4_K_M se incluye en el mismo repositorio.

La ficha documenta las cifras de aceptación publicadas por el autor: identidad bit a bit con el modelo sin podar (mismos MD5 de WAV, mismo EOS), CER del 4,06 % en un relato largo y del 13,81 % en una lista densa de pares de acentuación con `--lang Russian`, frente al 57,06 % en modo automático. Es un artefacto especializado, de nicho y muy reciente (publicado en noviembre de 2026), pensado para despliegue local en ruso e inglés con clonación de voz.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Qwen3-TTS con dos corrientes (talker + code-predictor) y códec de audio externo; 12,5 fps (80 ms por fotograma) |
| Parámetros totales | 1 928 677 440 (≈1,93B) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q4_K_M (esta compilación); el códec se distribuye aparte en Q8_0 |
| Idiomas soportados | ruso (ru), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (talker Q4_K_M + tokenizer/codec Q8_0) |
| Salida de audio | WAV mono, 24 kHz, 12,5 fotogramas/s |
| Vocabulario de texto | 116 000 tokens (podado desde 151 936, −23,7 %) |
| Vocabulario del códec | 3072 (sin podar) |
| Tamaño del archivo Q4_K_M | 1 219 245 248 B → 1 157 193 440 B (−5,1 %) tras poda |
| Librería de inferencia | qwentts.cpp (fork de llama.cpp) |
| RTF medido | ≈0,19–0,21 en RTX 3060 Laptop |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura Qwen3-TTS de 12 Hz, que combina un «talker» autorregresivo con un «code-predictor» y un códec de audio externo que convierte los tokens de audio en forma de onda. El vocabulario del códec (3072 tokens), el code-predictor y las capas de atención y FFN no se han tocado en esta compilación; únicamente se ha modificado el vocabulario de texto y la matriz `talker.text_embd.weight`. La poda elimina escrituras CJK, coreano, árabe, hebreo, devanagari, tailandés y similares, conservando íntegros los tokens especiales, los tokens de bytes y todos los tokens del corpus ruso-inglés, con el cierre de merges BPE respetado. El autor verifica que la segmentación del corpus con el tokenizador antiguo y el nuevo coincide token a token (cero discrepancias), por lo que no fue necesario reentrenar pesos.

El ajuste fino al ruso procede de `siriusfreak/qwen3-tts-12hz-1.7b-ru-stress-cf`, que introduce el manejo de marcas de acentuación mediante el carácter U+0301 colocado tras la vocal tónica («за́мок», «замо́к»), incluso en casos que contradicen el diccionario. Sin marcas, el modelo lee según el diccionario. La variante VoiceDesign, cuyo GGUF Q4_K_M se incluye en el mismo repositorio, permite obtener una voz a partir de una descripción textual encadenando ambos modelos; en esta compilación Base, `--instruct` se rechaza en tiempo de ejecución. No se dispone de datos sobre volumen de tokens de entrenamiento, composición del dataset ni uso de RLHF/DPO.

## Capacidades

- Síntesis de voz (text-to-speech) de texto ruso e inglés a audio WAV mono de 24 kHz.
- Clonación de voz por referencia de audio (`--ref-wav`): bastan unos 3 segundos de grabación limpia para transferir timbre y estilo.
- Control de acentuación léxica mediante marcas U+0301 en el texto, incluyendo omógrafos y casos contra diccionario.
- Lectura de listas densas de palabras sin sintaxis cuando se fuerza `--lang Russian`, evitando el corte prematuro que ocurre en modo automático.
- Generación de voz por descripción textual solo mediante cadena de dos modelos con la variante VoiceDesign incluida en el repositorio (no de forma nativa en esta compilación).
- No dispone de tool calling, function calling, agentes ni razonamiento multi-paso: es un modelo puramente de síntesis de voz.
- No dispone de visión, audio de entrada (salvo la referencia de voz) ni modalidades adicionales.
- Multilingüismo limitado a ruso e inglés tras la poda del vocabulario.

## Casos de uso

- **Locución de artículos y relatos largos en ruso**: el modelo mantiene coherencia en textos de más de 180 palabras con CER del 4,06 %, adecuado para audiolibros, boletines y blogs narrados; el RTF de 0,19–0,21 permite generar un minuto de audio en unos 12 segundos en una RTX 3060 Laptop.
- **Clonación de voz para podcasts y narración personal**: con una grabación de 3 segundos del locutor se replica timbre y manera, lo que simplifica producir episodios consistentes sin regrabar cada fragmento.
- **Atención al cliente y asistentes de voz en ruso**: al ejecutarse en GPUs de consumo con 4 GB de VRAM, se puede desplegar en local o en servidores modestos para respuestas habladas de baja latencia en centros de contacto.
- **Doblaje y localización de contenido ruso-inglés**: al soportar ambos idiomas y clonación de voz, permite generar pistas de audio localizadas preservando la identidad vocal del hablante original.
- **Accesibilidad y lectura de pantalla**: integración en lectores de pantalla o aplicaciones de accesibilidad que necesiten voz natural en ruso, con control de acentuación para términos técnicos y nombres propios.
- **Investigación en TTS y poda de vocabulario**: como artefacto reproducible (identidad bit a bit con el control, MD5 coincidentes), sirve de base para estudiar el efecto de la poda de vocabulario y la cuantización Q4_K_M en modelos de voz.
- **Prototipado de voice design en local**: encadenando esta compilación Base con el GGUF VoiceDesign del mismo repositorio se obtienen voces descritas textualmente sin depender de servicios en la nube.

## Benchmarks y rendimiento

| Prueba | CER control (sin poda) | CER esta compilación | Fotogramas hasta EOS | Duración de audio |
|---|---|---|---|---|
| Relato largo (181 palabras) | 4,06 % | 4,06 % | 1108 / 1108 | 88,64 s / 88,64 s |
| Lista de pares de acentuación (123 palabras) | 13,81 % | 13,81 % | 913 / 913 | 73,04 s / 73,04 s |
| 12 frases con marcas U+0301 (omógrafos) | — | identidad bit a bit | 48…84 / los mismos | 3,84…6,72 s / los mismos |

| Modo de ejecución (misma entrada, semilla 42) | Fotogramas | Duración | CER |
|---|---|---|---|
| `--lang` sin especificar (auto) | 364 | 29,12 s | 57,06 % |
| `--lang Russian` | 913 | 73,04 s | 13,81 % |

| Métrica de rendimiento | Valor |
|---|---|
| RTF en RTX 3060 Laptop | ≈0,19–0,21 |
| Identidad con el control | 100 % de muestras, maxdiff 0, MD5 coincidentes |
| CER medido con | faster-whisper `small`, CUDA, int8, `language="ru"` |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible, por tratarse de un modelo de síntesis de voz.

## Requisitos de hardware

- VRAM estimada: desde 4 GB para la compilación Q4_K_M (1,11 GB de pesos más el códec Q8_0 y buffers de inferencia).
- GPU recomendadas: RTX 3060 Laptop (medición de referencia), RTX 4060/4070, RTX 4090; en servidores, A100 o H100 para mayor throughput.
- Cabe en GPU de consumo: sí, desde 4 GB de VRAM; el tamaño reducido tras la poda (−5,1 % del archivo) facilita el ajuste en tarjetas modestas.
- Opciones de despliegue: exclusivamente qwentts.cpp (fork de llama.cpp para Qwen3-TTS); no funciona en llama.cpp estándar ni en vLLM, TGI u Ollama, ya que la arquitectura `qwen3-tts` requiere dos corrientes y un códec externo.
- Latencia y throughput: RTF ≈0,19–0,21 en RTX 3060 Laptop, equivalente a unos 12 segundos para generar 1 minuto de audio; no se dispone de datos de throughput para otras GPU.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| Esta compilación (Qwen3-TTS 1.7B RU pruned Q4_K_M) | ≈1,93B | no disponible | ru, en | Apache 2.0 | GGUF (qwentts.cpp) | Hugging Face, 0 descargas |
| Qwen/Qwen3-TTS-12Hz-1.7B-Base | ≈1,93B | no disponible | multilingüe | Apache 2.0 | safetensors | Hugging Face oficial |
| Qwen/Qwen3-TTS-12Hz-1.7B-VoiceDesign | ≈1,93B | no disponible | multilingüe | Apache 2.0 | safetensors (GGUF Q4_K_M incluido en este repo) | Hugging Face oficial |
| siriusfreak/qwen3-tts-12hz-1.7b-ru-stress-cf | ≈1,93B | no disponible | ru | no disponible en la información | safetensors | Hugging Face |

La comparativa con alternativas de otros desarrolladores (por ejemplo, modelos TTS de otras familias) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Esta compilación no admite `--instruct`: la voz solo se define mediante grabación de referencia; para descripción textual hay que encadenar con VoiceDesign.
- El vocabulario podado limita el modelo a ruso e inglés; otros alfabetos quedan accesibles solo por el fallback de bytes, con mayor coste en tokens.
- En modo automático (`--lang` sin especificar), el modelo abandona la lectura de listas densas de palabras a mitad, con CER del 57,06 %; es imprescindible forzar `--lang Russian` en esos casos.
- El CER del 13,81 % en listas de pares de acentuación refleja dificultad intrínseca con entradas sin sintaxis, no un defecto de la poda (idéntico al control).
- La métrica de CER se midió con faster-whisper `small`, mientras el autor del ajuste base usó `large-v3-turbo`; las cifras (4,06 % frente a 2,9 %) no son directamente comparables.
- Riesgo de alucinación y artefactos de audio en entradas atípicas, ruidosas o muy largas; no se dispone de evaluación sistemática de sesgos.
- La dependencia de qwentts.cpp (fork no oficial de llama.cpp) implica compatibilidad limitada con el ecosistema estándar y mantenimiento incierto.
- El artefacto tiene 0 descargas y 0 likes en el momento de la ficha; su madurez y validación comunitaria son nulas.
- Licencia Apache 2.0 permite uso comercial, pero deben respetarse las condiciones de los modelos base y del ajuste ruso de origen.

## Enlaces

- [Hugging Face: Igor282/qwen3-tts-12hz-1.7b-ru-pruned-enru-Q4_K_M](https://huggingface.co/Igor282/qwen3-tts-12hz-1.7b-ru-pruned-enru-Q4_K_M)
- [Modelo base: Qwen/Qwen3-TTS-12Hz-1.7B-Base](https://huggingface.co/Qwen/Qwen3-TTS-12Hz-1.7B-Base)
- [Modelo base: Qwen/Qwen3-TTS-12Hz-1.7B-VoiceDesign](https://huggingface.co/Qwen/Qwen3-TTS-12Hz-1.7B-VoiceDesign)
- [Ajuste ruso de origen: siriusfreak/qwen3-tts-12hz-1.7b-ru-stress-cf](https://huggingface.co/siriusfreak/qwen3-tts-12hz-1.7b-ru-stress-cf)
- [Runtime: qwentts.cpp (fork de llama.cpp para Qwen3-TTS)](https://github.com/ServeurpersoCom/qwentts.cpp)
