# AXERA-TECH/Qwen3-TTS-0.6B-AX8860-llama.cpp

## Resumen

Qwen3-TTS-0.6B-AX8860-llama.cpp es un paquete de despliegue preparado por AXERA-TECH para ejecutar el modelo de sintesis de voz Qwen3-TTS-0.6B (base Qwen/Qwen3-TTS-12Hz-0.6B-Base, desarrollado por el equipo Qwen de Alibaba) sobre la NPU de cuatro nucleos del SoC Axera AX8860, utilizando una bifurcacion de llama.cpp con backend ggml-axera. No se trata de un modelo nuevo, sino de una distribucion de pesos en GGUF mas kernels NPU precompilados y un binario estatico (`llama-tts`) que permite sintetizar voz y clonar voces en hardware de borde sin GPU.

El modelo subyacente es un sistema TTS de 602.341.376 parametros (aproximadamente 0,6 B) que trabaja con representaciones de audio a 12 Hz y soporta clonacion de voz en dos modos: solo con la grabacion de referencia (vector x-vector del hablante) o con grabacion mas transcripcion (modo ICL oficial, que codifica la referencia como tokens de voz dentro del prompt). La relevancia actual reside en que demuestra la viabilidad de TTS con clonacion en un SoC de bajo consumo, con un factor de tiempo real (RTF) medido de 0,35-0,46 en el AX8860.

El repositorio incluye los pesos del talker (GGUF BF16, 1,1 GB) y un segundo GGUF con el code predictor, el decodificador de codec, el codificador de hablante y el codificador de voz (773 MB), ademas de cuatro kernels NPU (prefill del talker, decode del talker con cabeza de codec, code predictor y vocoder). Los pesos se convierten en tiempo de carga a MXFP8 (talker y code predictor) y BF16 (vocoder).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo TTS generativo tipo LLM (talker) con code predictor y decodificador de codec/vocoder; audio tokenizado a 12 Hz |
| Parametros totales | 602.341.376 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 4096 tokens |
| Tipos de cuantizacion | Pesos publicados en GGUF BF16; conversion en carga a MXFP8 (talker y code predictor) y BF16 (vocoder) en la NPU |
| Idiomas soportados | zh, en, de, it, pt, es, ja, ko, fr, ru |
| Licencia | no disponible |
| Formato de pesos | GGUF (BF16) + kernels NPU precompilados + binario estatico |
| Tamano del repo | 2,8 GB |
| Modelo base | Qwen/Qwen3-TTS-12Hz-0.6B-Base |
| Hardware objetivo | Axera AX8860, NPU de 4 nucleos, SDK V0.5.0 o superior |

## Arquitectura y entrenamiento

La arquitectura sigue el esquema de Qwen3-TTS: un "talker" con forma de modelo de lenguaje autorregresivo que genera tokens de audio a una tasa de 12 Hz, un code predictor que produce los tokens de codigo de audio frame a frame (con top-k en tiempo de ejecucion), y un decodificador de codec (vocoder) que convierte los tokens en forma de onda, procesando 72 frames por llamada. El paquete incorpora ademas un codificador de hablante (para el modo de clonacion por x-vector) y un codificador de voz para el modo ICL con transcripcion.

No se dispone de informacion sobre el volumen de datos de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO en la informacion proporcionada. La innovacion tecnica destacable de esta distribucion es la integracion del modelo en llama.cpp mediante el backend ggml-axera, con cuatro kernels NPU especializados y conversion de pesos en tiempo de carga desde GGUF, lo que permite ejecutar el pipeline completo de sintesis y clonacion en el SoC sin GPU dedicada.

## Capacidades

- Sintesis de voz (text-to-speech) a partir de texto en diez idiomas: chino, ingles, aleman, italiano, portugues, espanol, japones, coreano, frances y ruso.
- Clonacion de voz con una grabacion de referencia de pocos segundos en formato wav o mp3.
- Dos modos de clonacion: por vector de hablante (x-vector) solo con audio, o modo ICL oficial con audio mas transcripcion, que reproduce mejor el timbre y el estilo.
- Generacion de audio de hasta 2000 frames (aproximadamente 160 segundos) por invocacion.
- Muestreo configurable con temperatura 0,9 y top-k 50 por defecto (top-k maximo 50).
- Ejecucion completamente local en NPU, sin dependencia de servicios en la nube.
- No se documentan capacidades de tool calling, agentes, vision ni audio de entrada mas alla de la referencia de clonacion.

## Casos de uso

- Clonacion de voz para locuciones personalizadas: con una grabacion de referencia de pocos segundos y, opcionalmente, su transcripcion, el modelo genera locuciones con el timbre del hablante; el modo ICL ofrece mayor fidelidad de tono y estilo.
- Sintesis de voz en dispositivos de borde: al ejecutarse en la NPU de un AX8860 con un RTF de 0,35-0,46, es adecuado para terminales, electrodomesticos o equipos industriales que necesiten TTS local sin conexion.
- Generacion de audiolibros y contenido narrado: la ventana de contexto de 4096 tokens y el limite de unos 160 segundos por invocacion permiten sintetizar parrafos completos de forma secuencial.
- Accesibilidad y lectores de pantalla: la sintesis multilingue (diez idiomas) permite convertir texto en voz para personas con discapacidad visual en entornos sin conectividad.
- Sistemas de megafonia y avisos automatizados: el bajo consumo de la NPU y la ejecucion local encajan en paneles de informacion publica, transporte o comercio que emiten avisos pregrabados dinamicamente.
- Prototipado de asistentes conversacionales: combinado con un ASR como Qwen3-ASR (usado por el autor para validar la salida), permite construir bucles de voz a voz completamente en el dispositivo.
- Dooblaje y localizacion de contenido: la cobertura de diez idiomas y la clonacion permiten adaptar un mismo locutor a versiones en distintos idiomas, sujeto a las condiciones de licencia del modelo base.

## Benchmarks y rendimiento

Los datos disponibles son mediciones de rendimiento en hardware, no benchmarks academicos de calidad.

| Metrica | Resultado |
|---|---|
| Sintesis de un parrafo en chino (28,2 s de audio) | 12,96 s (RTF 0,46) |
| Sin la primera conversion de pesos del vocoder | RTF 0,35 (27 ms por frame de 80 ms) |
| Code predictor en NPU, por frame | 7,3 ms |
| Talker decode en NPU, por frame | 3,7 ms |
| Carga y conversion de pesos por proceso (0,6B) | aproximadamente 14 s |
| Conversion inicial de pesos del vocoder | aproximadamente 3 s |
| Codificacion de referencia en CPU (audio de 22 s) | aproximadamente 10 s |

En cuanto a correccion, el autor informa de que las locuciones generadas para frases de prueba en chino e ingles (decodificacion greedy y por muestreo, en ambos modos de clonacion) transcritas con Qwen3-ASR coinciden literalmente con el texto original. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, WER/CER comparativos) en la informacion disponible.

## Requisitos de hardware

- SoC Axera AX8860 con NPU de cuatro nucleos y SDK V0.5.0 o superior (las mediciones se hicieron con V0.5.1).
- El proceso ocupa los cuatro nucleos NPU en exclusiva; no deben ejecutarse otros programas NPU en paralelo.
- Almacenamiento: repositorio de 2,8 GB (pesos GGUF de 1,1 GB y 773 MB, mas binarios y kernels).
- Memoria: no se especifica el consumo de RAM; la carga y conversion de pesos tarda unos 14 s por proceso.
- Despliegue mediante el binario `llama-tts` incluido, con `LD_LIBRARY_PATH=/opt/lib`, `GGML_AXERA_KERNEL_DIR` apuntando al directorio de kernels, `-ngl 99 -c 4096` y top-k no superior a 50.
- No esta pensado para GPU de consumo (RTX 4090), A100 ni H100: el paquete es especifico para la NPU del AX8860. Para otros entornos habria que acudir al modelo base Qwen/Qwen3-TTS-12Hz-0.6B-Base.
- Latencia: aproximadamente 27 ms por frame de 80 ms de audio en regimen estable (RTF 0,35).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Hardware |
|---|---|---|---|---|---|
| Qwen3-TTS-0.6B-AX8860 (esta ficha) | 602 M | 4096 | 10 | no disponible | NPU Axera AX8860 |
| Qwen/Qwen3-TTS-12Hz-0.6B-Base | aproximadamente 0,6 B | no disponible | no disponible | no disponible | GPU/CPU genericos |
| Qwen3-TTS-1.7B (mencionado en la model card) | aproximadamente 1,7 B | no disponible | no disponible | no disponible | NPU Axera AX8860 (carga de pesos de 25 s) |

La comparativa con alternativas de otros fabricantes (por ejemplo, sistemas TTS como XTTS, Bark o Piper) no esta disponible en la informacion proporcionada; no se aportan datos de calidad, WER ni MOS que permitan una comparacion rigurosa.

## Limitaciones y advertencias

- El proceso monopoliza los cuatro nucleos NPU del AX8860; es incompatible con la ejecucion simultanea de otras cargas NPU.
- Contexto limitado a 4096 tokens y top-k maximo de 50, lo que restringe la longitud y la diversidad de muestreo.
- La decodificacion greedy (`--temp 0`) produce locuciones demasiado largas y con pausas excesivas; se recomienda el muestreo por defecto.
- El modo ICL exige que la transcripcion de la referencia coincida exactamente con lo que dice la grabacion; de lo contrario, la calidad de clonacion se degrada.
- No se incluye audio de referencia en el repositorio: el usuario debe aportar su propia grabacion.
- La licencia no esta indicada en la informacion disponible, por lo que el uso comercial no puede confirmarse; debe verificarse en el modelo base Qwen/Qwen3-TTS-12Hz-0.6B-Base.
- La clonacion de voz plantea riesgos de suplantacion y uso fraudulento; es necesario aplicar controles de consentimiento y marcas de agua en produccion.
- No se documentan sesgos especificos ni tasas de alucinacion; en TTS, los fallos se manifiestan como pronunciacion incorrecta, artefactos o desviaciones del texto, y el autor solo valida frases de prueba en chino e ingles.
- Dependencia estricta del SDK de Axera y de la bifurcacion ZHEQIUSHUI/llama.cpp (rama `axera-dev`), lo que limita la portabilidad.
- El binario falla si no se define `GGML_AXERA_KERNEL_DIR` (comportamiento introducido en la actualizacion del 24 de noviembre de 2026).

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/AXERA-TECH/Qwen3-TTS-0.6B-AX8860-llama.cpp
- Modelo base: https://huggingface.co/Qwen/Qwen3-TTS-12Hz-0.6B-Base
- Bifurcacion de llama.cpp utilizada: https://github.com/ZHEQIUSHUI/llama.cpp (rama `axera-dev`, commit `6613735ce`)
- No se han encontrado en la informacion proporcionada papers, blogs, demos ni otros repositorios adicionales.
