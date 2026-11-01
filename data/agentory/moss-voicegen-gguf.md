# agentory/moss-voicegen-gguf

## Resumen

MOSS-VoiceGenerator es un modelo de generacion de voz (text-to-speech con control por instrucciones en lenguaje natural) desarrollado por el equipo OpenMOSS. El repositorio `agentory/moss-voicegen-gguf` no es el modelo original, sino una conversion de los pesos oficiales al formato GGUF para su uso con el runtime C++/GGML OpenMOSS, lo que permite ejecutar el modelo fuera de CUDA, incluyendo CPU y Vulkan.

El modelo base cuenta con aproximadamente 1.842 millones de parametros (1,84 B) y esta orientado a la sintesis de voz condicionada por una descripcion textual del estilo deseado (instruccion), no solo por el texto a sintetizar. Genera audio mono a 24 kHz a partir de 16 codebooks RVQ, con soporte de ingles y chino.

La relevancia de esta conversion concreta reside en su correccion de precision: ambos ficheros GGUF estan libres de FP16, manteniendo los pesos aprendidos en BF16 y los tensores de normalizacion y del vector-quantizer residual del tokenizador de audio en FP32. Esto es critico porque las activaciones de attention-sink del modelo pueden exceder el rango finito de FP16, lo que hace insegura una conversion estandar a FP16.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo TTS con tokenizador de audio RVQ; detalles del backbone no especificados en la informacion disponible) |
| Parametros totales | 1.841.740.800 (1,84 B) |
| Parametros activos | no aplica (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 y FP32 (sin FP16); no se documentan cuantizaciones de menor precision como Q4/Q8 |
| Idiomas soportados | en (ingles), zh (chino) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (dos ficheros: `moss-voicegen.gguf` y `moss-voicegen.extras.gguf`) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del backbone del modelo base (transformer, atencion, capas, etc.). Lo que si se documenta es la cadena de generacion de audio: el modelo produce tokens de audio organizados en 16 codebooks RVQ (residual vector quantization), que un tokenizador de audio dedicado (`OpenMOSS-Team/MOSS-Audio-Tokenizer`) decodifica a una forma de onda mono a 24 kHz. El identificador de plantilla del sidecar es `moss_tts_delay`.

La conversion GGUF preserva la precision del checkpoint original: los pesos aprendidos ordinarios se mantienen en BF16 y los tensores de normalizacion, junto con los tensores float32 del vector-quantizer residual del tokenizador de audio, permanecen en FP32. El fichero principal contiene 198 tensores BF16 y 113 FP32; el sidecar de audio contiene 586 BF16 y 1.046 FP32. No se dispone de informacion sobre el volumen de datos de entrenamiento, la composicion del dataset ni el uso de RLHF/DPO.

## Capacidades

- Sintesis de voz (text-to-speech) a partir de texto en ingles y chino.
- Control por instruccion en lenguaje natural: permite describir el estilo de voz deseado (por ejemplo, "voz clara y neutra con tempo uniforme y articulacion precisa").
- Generacion de audio mono a 24 kHz con 16 codebooks RVQ.
- Finalizacion natural del habla (deteccion de fin de locucion) segun las pruebas de validacion del autor.
- Ejecucion en CPU y en Vulkan mediante el runtime OpenMOSS C++/GGML.
- No se documentan capacidades de tool calling, agentes, vision ni audio de entrada en la informacion disponible.

## Casos de uso

- Locucion para contenidos editoriales y podcasts: el modelo permite generar narraciones con un estilo de voz definido mediante instruccion textual, util para producir audios consistentes sin regrabar.
- Accesibilidad y lectores de pantalla: sintesis de texto a voz en ingles y chino con control de claridad y tempo, adecuada para aplicaciones de lectura asistida.
- Prototipado de asistentes de voz: generacion rapida de muestras de voz en pipelines de desarrollo antes de contratar locuciones definitivas.
- Doblaje y localizacion de material audiovisual: generacion de pistas de voz en ingles o chino con un estilo controlado por instruccion para pruebas de doblaje.
- Despliegue en entornos sin GPU: gracias al formato GGUF y al runtime C++/GGML, puede ejecutarse en CPU o Vulkan en maquinas sin CUDA, lo que facilita integraciones en servidores modestos o en el borde.
- Generacion de audiolibros y material formativo: sintesis por lotes de textos largos con una voz uniforme definida mediante instruccion.
- Pruebas de calidad de audio y QA de waveforms: el modelo sirve para generar muestras controladas con las que validar cadenas de decodificacion y deteccion de clipping.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La unica validacion documentada es funcional: en CPU se completo la carga del modelo, la finalizacion natural del habla, la decodificacion de un codec de 62 frames y la generacion de un WAV de 4,96 segundos; en Vulkan se completo la carga de modelo y sidecar, la finalizacion natural del habla, la decodificacion de 52 frames y un WAV de 4,16 segundos. Una comprobacion con Whisper en CPU recupero el pangrama solicitado hasta su ultima palabra, y el control de calidad de la forma de onda no detecto clipping ni transitorios de recorte tardio.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; con 1,84 B de parametros en BF16/FP32, el peso de los tensores ronda los 3,7 GB en BF16 puro, aunque el repositorio ocupa 7,8 GB por la mezcla de precisiones y el sidecar de audio.
- GPU recomendadas: no se especifican; el autor valida ejecucion en CPU y en Vulkan, por lo que no se requiere CUDA.
- Cabe en GPU de consumo: previsiblemente si en tarjetas con 8 GB o mas de VRAM, aunque este dato no esta confirmado en la informacion disponible.
- Opciones de despliegue: runtime OpenMOSS C++/GGML (CLI `moss-tts-cli`), con soporte de carga de sidecar de codec en BF16/FP32. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; solo se documentan duraciones de audio generado (4,96 s en CPU y 4,16 s en Vulkan) sin tiempos de ejecucion asociados.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones de modelos alternativos en la informacion proporcionada, por lo que la comparativa cuantitativa no esta disponible. Como referencia cualitativa, el modelo se posiciona en la categoria de TTS condicionado por instrucciones con soporte de ingles y chino, licencia Apache 2.0 y pesos en GGUF para ejecucion en CPU/Vulkan; no se han facilitado comparaciones con otros sistemas TTS.

## Limitaciones y advertencias

- Solo soporta ingles y chino; no se documenta cobertura de otras lenguas, incluido el castellano.
- Requiere una build de OpenMOSS con soporte de carga de sidecar de codec en BF16/FP32; las builds antiguas que esperan tensores `moss.codec.quantizer.*` en FP16 fallan con error `expected f16`.
- Convertir los tensores del codec a FP16 no es una solucion valida: el tokenizador de audio upstream mantiene el calculo del vector-quantizer residual en FP32.
- Los dos ficheros GGUF deben permanecer juntos; el sidecar es imprescindible para la decodificacion de audio.
- No se documentan sesgos conocidos, tasas de alucinacion ni limitaciones de contexto en la informacion disponible.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda verificar las condiciones del modelo base y del tokenizador de audio por separado.
- El repositorio tiene un volumen de descargas bajo (150) y ninguna valoracion, lo que limita la evidencia de uso en produccion.
- No se documentan capacidades de tool calling, agentes ni multimodalidad de entrada.

## Enlaces

- Repositorio GGUF: https://huggingface.co/agentory/moss-voicegen-gguf
- Modelo base: https://huggingface.co/OpenMOSS-Team/MOSS-VoiceGenerator
- Tokenizador de audio: https://huggingface.co/OpenMOSS-Team/MOSS-Audio-Tokenizer
- Runtime OpenMOSS C++/GGML: https://github.com/pwilkin/openmoss
