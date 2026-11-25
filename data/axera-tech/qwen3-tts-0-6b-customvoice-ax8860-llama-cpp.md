# AXERA-TECH/Qwen3-TTS-0.6B-CustomVoice-AX8860-llama.cpp

## Resumen

Qwen3-TTS-0.6B-CustomVoice-AX8860-llama.cpp es una distribución empaquetada del modelo de síntesis de voz Qwen3-TTS-12Hz-0.6B-CustomVoice de Alibaba Qwen, adaptada por AXERA-TECH para ejecutarse en la NPU de cuatro núcleos del SoC Axera AX8860 mediante una bifurcación de llama.cpp con backend ggml-axera. No se trata de un modelo nuevo: los pesos son los del modelo base de Qwen, convertidos a GGUF en precisión BF16 y acompañados de kernels precompilados para la NPU, junto con un binario estático `llama-tts` y un script de ejecución.

El paquete resuelve un problema muy concreto: llevar un TTS de 602 millones de parámetros a hardware de borde (edge) sin GPU, con un consumo de memoria contenido (1,1 GB para el talker y 575 MB para el predictor de códigos y el vocoder) y una latencia medible. Según la model card, una frase larga en chino que produce 20,9 s de audio se completa en unos 25 s de proceso total, de los cuales unos 14 s corresponden a carga y conversión de pesos, con una velocidad en régimen estable de aproximadamente 40 tramas por segundo sobre tramas de 80 ms.

Es relevante ahora porque demuestra que la inferencia de modelos generativos de audio en NPUs de bajo consumo ya es viable con llama.cpp como capa de ejecución, y porque el ecosistema de Qwen3-TTS ofrece voces predefinidas y control por instrucción de estilo (aunque la variante de 0,6B ignora dicha instrucción, igual que el wrapper oficial). La ficha se centra en el paquete AX8860, no en el modelo base genérico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo TTS generativo tipo talker (transformer autorregresivo) con predictor de códigos y decodificador de códec/vocoder; adaptado a NPU AX8860 mediante kernels ggml-axera |
| Parametros totales | 602.341.376 (0,6B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 4096 tokens |
| Tipos de cuantizacion | Pesos publicados en GGUF BF16; en carga se convierten a MXFP8 (talker y code predictor) y BF16 (vocoder) para los kernels NPU |
| Idiomas soportados | zh, en, de, it, pt, es, ja, ko, fr, ru y auto (parámetro `--tts-lang`) |
| Licencia | no disponible |
| Formato de pesos | GGUF BF16 (`qwen3-tts-0.6b-customvoice-bf16.gguf` y `mmproj-qwen3-tts-0.6b-customvoice-bf16.gguf`) |

## Arquitectura y entrenamiento

El paquete se apoya en el modelo base Qwen3-TTS-12Hz-0.6B-CustomVoice, un sistema de síntesis de voz generativo con una arquitectura de tipo "talker" que produce tokens de audio autorregresivamente a 12 Hz, seguido de un predictor de códigos y un decodificador de códec que reconstruye la forma de onda. En esta distribución, el talker se ejecuta con kernels NPU dedicados (prefill y decode, este último incluyendo la cabeza del códec), el code predictor dispone de su propio kernel y el vocoder se ejecuta en un cuarto kernel. Los kernels no contienen pesos: se cargan desde los GGUF y se convierten en tiempo de carga a MXFP8 (talker y code predictor) o BF16 (vocoder).

No se dispone de información sobre el dataset de entrenamiento, el número de tokens, la composición de datos ni si hubo RLHF o DPO en el modelo base, ya que la model card del paquete AX8860 solo documenta la integración y el rendimiento en hardware. La innovación técnica destacable de esta distribución es la integración de ggml-axera en la bifurcación de llama.cpp (`ZHEQIUSHUI/llama.cpp`, rama `axera-dev`), que permite ejecutar el pipeline completo de TTS —talker, predictor de códigos, vocoder y el codificador de voz en `tools/mtmd/models/qwen3tts-encode.cpp`— sobre la NPU de cuatro núcleos del AX8860 con un binario estático que solo depende de `/opt/lib` y libc.

## Capacidades

- Síntesis de voz (text-to-speech) en diez idiomas: chino, inglés, alemán, italiano, portugués, español, japonés, coreano, francés y ruso, además del modo `auto`.
- Nueve voces integradas seleccionables mediante `--tts-speaker` (por ejemplo, `vivian`, `dylan`, `eric`); el parámetro es obligatorio.
- Instrucción de estilo opcional mediante `--tts-instruct`, que la variante de 0,6B ignora con una advertencia, en línea con el wrapper oficial de Qwen.
- Generación de audio a 12 Hz de tokens de códec, con salida a fichero WAV mediante `-o`.
- Ejecución en la NPU de cuatro núcleos del AX8860 con contexto de 4096 tokens y top-k máximo de 50.
- No se documentan capacidades de tool calling, function calling, agentes, razonamiento multi-paso, visión ni audio de entrada más allá del codificador de voz incluido en el pipeline.

## Casos de uso

- Síntesis de voz en dispositivos de borde sin GPU: el paquete está pensado para ejecutarse íntegramente en la NPU del AX8860, con 1,7 GB de pesos en disco y conversión a MXFP8/BF16 en carga, lo que permite integrar TTS en cámaras, routers o equipos industriales con ese SoC.
- Lectura de avisos y notificaciones en chino e inglés: la model card verifica que una frase larga en chino se transcribe de vuelta con Qwen3-ASR-1.7B de forma literal, lo que respalda su uso en anuncios por megafonía o asistentes locales.
- Generación de audio para interfaces de voz embebidas: con 40 tramas/s en régimen estable (25 ms por trama de 80 ms), el modelo puede alimentar un buffer de reproducción en tiempo casi real una vez cargado.
- Localización de contenidos a diez idiomas: el parámetro `--tts-lang` permite generar la misma locución en español, francés, alemán, italiano, portugués, japonés, coreano y ruso, útil para doblaje automatizado de material breve.
- Pruebas de integración y CI de pipelines de audio: el binario estático y el script `run.sh` facilitan la validación reproducible de la cadena completa (GGUF, kernels, NPU) en un entorno controlado.
- Prototipado de asistentes conversacionales con voz predefinida: las nueve voces integradas permiten asignar timbres distintos a personajes o roles sin entrenamiento adicional.
- Evaluación comparativa de backends: sirve como referencia para medir el rendimiento de ggml-axera frente a otras implementaciones de llama.cpp en hardware de borde.

## Benchmarks y rendimiento

| Metrica | Resultado (AX8860, SDK V0.5.1, NPU 4 nucleos) |
|---|---|
| Frase larga en chino, 20,9 s de audio, tiempo total de proceso | 25 s |
| Regimen estable talker + codec | Aprox. 40 tramas/s (25 ms por trama de 80 ms) |
| Carga y conversion de pesos por proceso | Aprox. 14 s |
| Verificacion de correctitud (chino) | Transcripcion con Qwen3-ASR-1.7B identica al texto original |
| Verificacion de correctitud (ingles) | Transcripcion literal de "The quick brown fox jumps over the lazy dog." |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- SoC Axera AX8860 con NPU de cuatro núcleos; el modelo ocupa los cuatro núcleos y no debe ejecutarse junto a otros programas de NPU.
- SDK V0.5.0 o superior (verificable con `cat /proc/ax_proc/version`); las mediciones se hicieron con V0.5.1.
- Almacenamiento: 2,0 GB de repositorio, con 1,1 GB para el GGUF del talker y 575 MB para el GGUF del predictor de códigos y vocoder.
- Variables de entorno necesarias al invocar el binario directamente: `LD_LIBRARY_PATH=/opt/lib` y `GGML_AXERA_KERNEL_DIR=<repo>/kernels`; desde la actualización del 24 de noviembre de 2026, el programa aborta con error si `GGML_AXERA_KERNEL_DIR` no está definida.
- Opciones de ejecución recomendadas: `-ngl 99 -c 4096` y top-k no superior a 50.
- No aplica a GPU de consumo (RTX 4090, etc.) ni a CUDA: el paquete es específico para la NPU AX8860. No se documentan opciones de despliegue en vLLM, Ollama o TGI para esta distribución.
- Latencia: unos 25 s para 20,9 s de audio en el primer proceso, incluyendo 14 s de carga; en régimen estable, aproximadamente 40 tramas/s.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Hardware objetivo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3-TTS-0.6B-CustomVoice-AX8860-llama.cpp | 602 M | 4096 | NPU AX8860 (4 nucleos) | no disponible | Hugging Face, 869 descargas |
| Qwen/Qwen3-TTS-12Hz-0.6B-CustomVoice (modelo base) | 602 M | no disponible | GPU/CPU segun implementacion oficial | no disponible | Hugging Face |
| Otras variantes de Qwen3-TTS (tamanos superiores) | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparativa con alternativas de terceros no está disponible en la información proporcionada; los únicos datos verificables son los del modelo base y los de esta adaptación.

## Limitaciones y advertencias

- El modelo consume los cuatro núcleos de la NPU AX8860 en exclusiva; no puede convivir con otras cargas de NPU en el mismo dispositivo.
- Contexto limitado a 4096 tokens y top-k máximo de 50, lo que restringe la longitud de las entradas y la diversidad de muestreo.
- La decodificación greedy (`--temp 0`) produce voz demasiado larga y con pausas excesivas; se recomienda mantener el muestreo por defecto.
- La instrucción de estilo (`--tts-instruct`) no tiene efecto en la variante de 0,6B y solo genera una advertencia.
- El tiempo de carga y conversión de pesos (unos 14 s por proceso) penaliza escenarios de invocación puntual; conviene mantener el proceso vivo para varias síntesis.
- No se dispone de información sobre sesgos, riesgo de alucinación o calidad en idiomas distintos del chino e inglés; la verificación de correctitud documentada se limita a esos dos idiomas.
- La licencia no está indicada en la información disponible, por lo que no puede confirmarse el uso comercial; debe consultarse la licencia del modelo base Qwen/Qwen3-TTS-12Hz-0.6B-CustomVoice antes de desplegarlo en producción.
- Dependencia estricta del SDK de Axera (V0.5.0 o superior) y de la variable `GGML_AXERA_KERNEL_DIR`; no es portable a otras plataformas sin recompilar kernels.

## Enlaces

- Hugging Face: https://huggingface.co/AXERA-TECH/Qwen3-TTS-0.6B-CustomVoice-AX8860-llama.cpp
- Modelo base: https://huggingface.co/Qwen/Qwen3-TTS-12Hz-0.6B-CustomVoice
- Bifurcación de llama.cpp con backend Axera: https://github.com/ZHEQIUSHUI/llama.cpp (rama `axera-dev`, commit `6613735ce`)
- Repositorio de llama.cpp upstream: https://github.com/ggml-org/llama.cpp
