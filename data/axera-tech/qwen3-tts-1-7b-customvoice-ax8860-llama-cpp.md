# AXERA-TECH/Qwen3-TTS-1.7B-CustomVoice-AX8860-llama.cpp

## Resumen

Qwen3-TTS-1.7B-CustomVoice-AX8860-llama.cpp es una distribucion empaquetada del modelo de sintesis de voz Qwen3-TTS-12Hz-1.7B-CustomVoice de Qwen, adaptada por AXERA-TECH para ejecutarse sobre la NPU de cuatro nucleos del SoC Axera AX8860 mediante una bifurcacion de llama.cpp con backend ggml-axera. No se trata de un modelo nuevo ni de un reentrenamiento: los pesos proceden del modelo base de Qwen y se distribuyen en formato GGUF BF16, mientras que la capa de aceleracion la aportan cuatro kernels de NPU compilados para el hardware AX8860.

El paquete resuelve un problema muy concreto: llevar un modelo TTS de 1.733 millones de parametros a un dispositivo de borde con NPU, sin GPU dedicada y con un runtime ligero. El repositorio incluye los pesos del talker (3,2 GB) y del code predictor y vocoder (645 MB), el binario estatico `llama-tts`, los kernels NPU y un script de ejecucion. La inferencia se hace con contexto de 4096 tokens y top-k limitado a 50.

Es relevante ahora porque demuestra la viabilidad de TTS de calidad con control de estilo por lenguaje natural en hardware de borde, con latencias medidas y verificacion de transcripcion inversa con Qwen3-ASR-1.7B. La ficha se centra en la version empaquetada para AX8860; los detalles de entrenamiento del modelo original no se incluyen en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible con detalle; el paquete separa talker, code predictor y vocoder (codec decoder). Backend ggml-axera sobre llama.cpp |
| Parametros totales | 1.733.157.888 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 4096 tokens |
| Tipos de cuantizacion | Pesos distribuidos en GGUF BF16; en carga se convierten a MXFP8 (talker y code predictor) y BF16 (vocoder) |
| Idiomas soportados | zh, en, de, it, pt, es, ja, ko, fr, ru y auto |
| Licencia | No disponible |
| Formato de pesos | GGUF (BF16): `qwen3-tts-1.7b-customvoice-bf16.gguf` y `mmproj-qwen3-tts-1.7b-customvoice-bf16.gguf` |

## Arquitectura y entrenamiento

El paquete se organiza en tres componentes diferenciados: un modelo talker (los pesos principales, 3,2 GB en BF16), un code predictor y un decodificador de codec o vocoder (645 MB en BF16). Los kernels de NPU no contienen pesos; estos se cargan desde los GGUF y se convierten en tiempo de ejecucion a MXFP8 para talker y code predictor, y se mantienen en BF16 para el vocoder. La generacion es autorregresiva sobre tokens de audio a 12 Hz, con una tasa de tramas de 80 ms.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si el modelo original uso RLHF o DPO. La model card del paquete solo documenta la integracion: bifurcacion `ZHEQIUSHUI/llama.cpp` en la rama `axera-dev`, con implementaciones en `ggml/src/ggml-axera/models/qwen3` y `qwen3_tts`, y un codificador de voz en `tools/mtmd/models/qwen3tts-encode.cpp`. La innovacion tecnica destacable es la ejecucion del pipeline completo (prefill del talker, decode del talker con cabeza de codec, code predictor y vocoder) sobre cuatro kernels NPU.

## Capacidades

- Sintesis de voz (text-to-speech) a partir de texto en diez idiomas mas deteccion automatica.
- Nueve voces integradas seleccionables por nombre (por ejemplo `vivian`, `dylan`, `eric`).
- Control de estilo por instruccion en lenguaje natural (`--tts-instruct`): tono, velocidad y expresividad.
- Generacion de audio a 12 Hz de tokens, con tramas de 80 ms.
- Ejecucion en dispositivo de borde sobre NPU Axera AX8860, sin GPU.
- Verificacion de fidelidad mediante transcripcion inversa con Qwen3-ASR-1.7B (reportada por el autor).
- No se documentan capacidades de tool calling, agentes, vision ni audio de entrada en la informacion disponible.

## Casos de uso

- Sintesis de voz en dispositivos de borde: el modelo se ejecuta integramente en la NPU del AX8860, lo que permite generar voz en equipos empotrados sin conexion a la nube y sin GPU dedicada.
- Asistentes por voz locales: con nueve voces integradas y control de estilo, se puede construir un asistente que ajuste el tono y la velocidad segun el contexto conversacional.
- Lectura de contenido largo en castellano: el soporte de `es` y un contexto de 4096 tokens permiten narrar parrafos extensos; el autor verifico fidelidad en chino con transcripcion inversa.
- Locucion automatizada multilingue: al aceptar zh, en, de, it, pt, es, ja, ko, fr y ru, un mismo binario puede generar avisos o locuciones en varios idiomas para productos con mercados internacionales.
- Prototipado de interfaces de voz: el binario estatico y el script `run.sh` permiten iterar rapidamente sobre prompts de estilo sin recompilar kernels.
- Accesibilidad: generacion de voz sintetica para lectura de pantalla o comunicacion aumentativa en hardware de bajo consumo.
- Evaluacion de TTS en silicio de borde: util como banco de pruebas para medir latencia y throughput de modelos TTS sobre NPU antes de un despliegue mayor.

## Benchmarks y rendimiento

| Metrica | Resultado |
|---|---|
| Parrafo en chino, 26,8 s de voz, tiempo total de proceso (incluye carga y primera conversion del vocoder) | 39 s |
| Estado estacionario talker + codec | Aproximadamente 33 tramas/s (30 ms por trama de 80 ms) |
| Carga y conversion de pesos, una vez por proceso | Aproximadamente 25 s |
| Fidelidad (chino, con instruccion de estilo) | Transcripcion inversa con Qwen3-ASR-1.7B identica al texto original, segun el autor |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, lo que es esperable en un modelo TTS.

## Requisitos de hardware

- Hardware objetivo: SoC Axera AX8860 con NPU de cuatro nucleos; SDK V0.5.0 o superior (probado con V0.5.1).
- Memoria: el repositorio ocupa 4,3 GB; los pesos suman aproximadamente 3,85 GB en BF16, mas el espacio de trabajo del runtime.
- GPU: no se requiere GPU; el modelo no esta pensado para A100, H100 ni RTX 4090 en esta distribucion.
- Cabe en hardware de borde, no en GPU de consumo convencional por el backend especifico (ggml-axera).
- Despliegue: binario `llama-tts` estatico incluido; requiere `LD_LIBRARY_PATH=/opt/lib` y `GGML_AXERA_KERNEL_DIR=<repo>/kernels`, con `-ngl 99 -c 4096`.
- Latencia y throughput: aproximadamente 33 tramas/s en estado estacionario; 25 s de carga inicial por proceso; 39 s para 26,8 s de voz en la prueba publicada.
- Limitacion de concurrencia: el proceso ocupa los cuatro nucleos NPU; no se deben ejecutar otros programas de NPU en paralelo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Despliegue | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3-TTS-1.7B-CustomVoice-AX8860 (este) | 1.733 M | 4096 | NPU AX8860, llama.cpp ggml-axera | No disponible | Paquete GGUF + kernels para borde |
| Qwen/Qwen3-TTS-12Hz-1.7B-CustomVoice (base) | 1.733 M | No disponible | Framework original de Qwen | No disponible | Modelo de origen; sin optimizacion NPU documentada aqui |
| Otras alternativas TTS | No disponible | No disponible | No disponible | No disponible | No se aportan datos comparables en la informacion disponible |

## Limitaciones y advertencias

- La licencia no esta indicada en la informacion disponible; debe verificarse antes de cualquier uso comercial.
- El modelo consume los cuatro nucleos NPU en exclusiva; no puede convivir con otras cargas de NPU.
- Contexto limitado a 4096 tokens y top-k maximo de 50.
- La decodificacion voraz (`--temp 0`) produce voz demasiado larga y con pausas; se recomienda la muestreo por defecto.
- El tiempo de carga y conversion de pesos (unos 25 s por proceso) penaliza escenarios de arranque frecuente.
- Solo se ha verificado la fidelidad de forma cualitativa en chino; no hay evaluacion publica de calidad en castellano ni en el resto de idiomas.
- Riesgo de sesgos y alucinacion acustica no evaluado en la informacion disponible; la sintesis puede producir prosodia incorrecta en textos fuera de dominio.
- Dependencia de hardware y SDK concretos (AX8860, SDK V0.5.0+), lo que limita la portabilidad.
- No se documentan capacidades de clonacion de voz a partir de muestras; las voces son las nueve integradas.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/AXERA-TECH/Qwen3-TTS-1.7B-CustomVoice-AX8860-llama.cpp
- Modelo base: https://huggingface.co/Qwen/Qwen3-TTS-12Hz-1.7B-CustomVoice
- Bifurcacion de llama.cpp: https://github.com/ZHEQIUSHUI/llama.cpp (rama `axera-dev`, commit `0104880be`)
