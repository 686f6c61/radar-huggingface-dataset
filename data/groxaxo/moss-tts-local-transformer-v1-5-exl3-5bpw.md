# groxaxo/MOSS-TTS-Local-Transformer-v1.5-EXL3-5bpw

## Resumen

MOSS-TTS-Local-Transformer-v1.5-EXL3-5bpw es una version cuantizada del modelo de sintesis de voz (text-to-speech) OpenMOSS-Team/MOSS-TTS-Local-Transformer-v1.5, publicada por el usuario groxaxo. Se trata de un checkpoint de precision mixta en el que las matrices lineales del backbone del transformer se han empaquetado con el formato EXL3 (ExLlamaV3) en trellis K=5, mientras que el resto de componentes (embedding de texto, cabezas y embeddings de audio, transformer local de tramas y normalizaciones) permanecen en BF16. El objetivo es reducir el consumo de memoria GPU manteniendo la calidad de sintesis.

El modelo tiene 1.634.149.888 parametros y sintetiza voz a 48 kHz en estereo a partir de texto, con soporte de ingles y espanol. Frente al pipeline original en BF16, la pareja completa cuantizada (modelo TTS + codec) reduce el pico de VRAM asignada en un 70,8 % (de 16,20 GiB a 4,73 GiB) a costa de un RTF 1,28 veces mayor, manteniendo una tasa de error de palabra del 0 % en la comprobacion de inteligibilidad realizada con Faster Whisper large-v3.

Es relevante porque permite ejecutar un sistema TTS de calidad en GPUs de consumo (el autor realizo todas las mediciones en una RTX 3090) y porque demuestra un flujo de cuantizacion EXL3 aplicado a una arquitectura TTS no causal estandar, con loader propio y validacion byte a byte de las salidas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer TTS local con codec de audio RVQ (12 codebooks) y transformer local de tramas; backbone cuantizado con kernels EXL3 |
| Parametros totales | 1.634.149.888 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | EXL3 trellis K=5 (5 bits) en 252 matrices lineales; resto en BF16; bits efectivos serializados 6,331 por parametro original unico |
| Idiomas soportados | en, es |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (pesos empaquetados EXL3 + loader custom en Python) |

## Arquitectura y entrenamiento

El modelo base es un sistema TTS de MOSS que combina un transformer principal con un codec de audio basado en RVQ (residual vector quantization) de 12 codebooks y un transformer local de tramas. La version EXL3 sustituye las matrices lineales del backbone por matrices empaquetadas en trellis K=5 (252 matrices nativas), generadas mediante LDLQ calibrado con activaciones, regularizacion sigma de 0,025, escalado multiplicativo y guardas de rango potencia de dos por fila. El embedding de texto y la cabeza de salida (tied), los 12 pares de embedding/cabeza de audio, el transformer local de tramas y las normalizaciones se mantienen en BF16.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO en el modelo base. La conversion EXL3 incluye comprobaciones de las salidas de los kernels empaquetados contra las matrices cuantizadas reconstruidas, y el autor documenta que las 16 muestras WAV del perfil cuantizado resultaron identicas byte a byte tras aplicar un kernel dinamico de escalado de longitud total, evitando compilaciones Triton por cada longitud de utterance.

## Capacidades

- Sintesis de voz (text-to-speech) a 48 kHz en estereo, con salida en forma `[samples, 2]`.
- Soporte de ingles y espanol mediante el parametro `language` del runtime.
- Control de semilla (`seed`) para reproducibilidad de la sintesis.
- Codec de audio con 12 codebooks RVQ fijos para el modelo TTS.
- Decodificacion en streaming del codec (chunks de 0,32 s) segun las pruebas del autor.
- No se documenta soporte de tool calling, function calling, agentes ni razonamiento multi-paso: es un modelo TTS, no un LLM.
- No se documentan capacidades de clonacion de voz, control de emocion ni prosodia en la informacion disponible.

## Casos de uso

- Narracion de articulos y audiolibros en espanol e ingles: el modelo genera voz a 48 kHz en estereo con un RTF de 0,515 en el perfil completamente cuantizado, lo que permite sintetizar aproximadamente dos segundos de audio por segundo de computo en una RTX 3090.
- Locucion automatizada para videos y podcasts: la salida estereo a 48 kHz es directamente utilizable en produccion sin remuestreo, y el control por semilla permite regenerar una toma concreta.
- Asistentes de voz en local: con un pico de 4,73 GiB de VRAM en el perfil exl3_exl3, el sistema cabe en GPUs de consumo y puede integrarse en un pipeline de reconocimiento de voz mas LLM en la misma maquina.
- Accesibilidad y lectura de textos: sintesis de documentos largos en espanol para usuarios con discapacidad visual, ejecutable en hardware de gama media-alta sin depender de servicios en la nube.
- Generacion de avisos y mensajes dinamicos: el modelo acepta texto arbitrario por peticion, adecuado para sistemas de megafonia, notificaciones o interfaces conversacionales que requieran locucion bajo demanda.
- Pruebas de regresion de pipelines TTS: las comprobaciones de inteligibilidad con Faster Whisper large-v3 (0 errores en 154 palabras de referencia) y la verificacion byte a byte de las salidas permiten usar el modelo como referencia estable en CI.
- Investigacion sobre cuantizacion de modelos de audio: el repositorio documenta el proceso EXL3 completo (LDLQ, escalado, guardas de rango) y los JSON de benchmark por utterance, util para estudiar el compromiso memoria-latencia en TTS.

## Benchmarks y rendimiento

Mediciones end-to-end del autor en una NVIDIA RTX 3090 con host i7-12700KF, cuatro prompts retenidos en ingles y espanol y dos semillas, excluyendo carga inicial y un utterance de calentamiento:

| Perfil | RTF agrupado | RTF mediano | VRAM pico asignada (GiB) |
|---|---:|---:|---:|
| bf16_fp32 | 0,4009 | 0,3989 | 16,20 |
| exl3_fp32 | 0,5171 | 0,5169 | 11,35 |
| exl3_exl3 | 0,5151 | 0,5124 | 4,73 |

Inteligibilidad con Faster Whisper large-v3 (CPU, INT8) sobre ocho utterances por perfil:

| Perfil | Errores de palabra / palabras de referencia | WER agrupado |
|---|---:|---:|
| bf16_fp32 | 0/154 | 0,00 % |
| exl3_fp32 | 0/154 | 0,00 % |
| exl3_exl3 | 0/154 | 0,00 % |

Comprobaciones solo del codec (harness propio, con calentamiento y repeticiones):

| Metrica | Valor |
|---|---|
| RTF de decodificacion del codec FP32 original | 0,03166 |
| RTF de decodificacion del codec cuantizado | 0,01992 |
| RTF del decodificador en streaming FP32 (chunks de 0,32 s) | 0,13667 |
| RTF del decodificador en streaming cuantizado (chunks de 0,32 s) | 0,19770 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, al no tratarse de un modelo de lenguaje.

## Requisitos de hardware

- VRAM estimada: 4,73 GiB de pico en el perfil completamente cuantizado (TTS EXL3 + codec EXL3); 11,35 GiB con TTS EXL3 y codec FP32; 16,20 GiB con el pipeline original BF16/FP32.
- GPU recomendadas: el autor valido el modelo en una RTX 3090. Cualquier GPU con al menos 8 GiB de VRAM y soporte CUDA deberia poder ejecutar el perfil exl3_exl3, aunque no se han publicado mediciones en otras tarjetas.
- Cabe en GPU de consumo: si, segun las mediciones en RTX 3090 con 4,73 GiB de pico en el perfil completamente cuantizado.
- Despliegue: requiere el loader custom incluido en el repositorio (`tts_pipeline.load_runtime`) y el runtime ExLlamaV3 fijado en la revision `02aef45cd681b960a00afcd0749a4ab99e6c1bfe`. No es compatible con `AutoModel.from_pretrained` (bloqueado deliberadamente) ni con llama.cpp, Ollama, vLLM o TGI segun la informacion disponible. Dependencias: PyTorch con CUDA, Transformers, accelerate, safetensors, soundfile, torchaudio, NumPy y huggingface_hub.
- Latencia y throughput: RTF de 0,515 en el perfil exl3_exl3, es decir, 1,94 veces mas rapido que tiempo real; el pipeline BF16 original es 1,28 veces mas rapido (RTF 0,401). El codec cuantizado decodifica a RTF 0,01992 frente a 0,03166 del FP32, pero el decodificador en streaming cuantizado es mas lento (0,19770 frente a 0,13667).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| groxaxo/MOSS-TTS-Local-Transformer-v1.5-EXL3-5bpw | 1.634.149.888 | no disponible | en, es | apache-2.0 | safetensors EXL3 + loader custom | 4,73 GiB de pico, RTF 0,515 |
| OpenMOSS-Team/MOSS-TTS-Local-Transformer-v1.5 (BF16) | mismo modelo base | no disponible | en, es | apache-2.0 | safetensors BF16 | 16,20 GiB de pico, RTF 0,401 |
| groxaxo/MOSS-Audio-Tokenizer-v2-EXL3-5bpw | no disponible | no disponible | no disponible | no disponible | safetensors EXL3 | Codec cuantizado usado en el perfil exl3_exl3 |

No se dispone de datos de otros modelos TTS comparables en la informacion proporcionada.

## Limitaciones y advertencias

- El modelo solo soporta ingles y espanol; no se documentan otros idiomas.
- La cuantizacion EXL3 introduce un coste de latencia: el pipeline completamente cuantizado es 1,28 veces mas lento que el original BF16, y el decodificador en streaming cuantizado es un 45 % mas lento que el FP32 (RTF 0,19770 frente a 0,13667).
- La comprobacion de inteligibilidad se basa en un unico reconocedor (Faster Whisper large-v3) sobre un conjunto pequeno de ocho utterances; no es una medida de naturalidad ni de similitud de hablante.
- La calidad del codec a profundidades RVQ distintas de 12 no esta establecida por el autor.
- Los prompts y semillas pueden producir duraciones de audio distintas tras la cuantizacion, lo que afecta a las comparaciones de RTF.
- El modelo no es cargable con `AutoModel.from_pretrained`; requiere el loader custom y una version fijada de ExLlamaV3 compilada contra el toolkit CUDA, lo que complica el despliegue en entornos gestionados.
- No se documentan sesgos conocidos, tasas de alucinacion ni restricciones adicionales de la licencia apache-2.0 para uso comercial en la informacion disponible.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y el autor es un tercero distinto del equipo OpenMOSS; conviene validar el modelo en el caso de uso concreto antes de produccion.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/groxaxo/MOSS-TTS-Local-Transformer-v1.5-EXL3-5bpw
- Modelo base: https://huggingface.co/OpenMOSS-Team/MOSS-TTS-Local-Transformer-v1.5
- Revision fijada del modelo base: `be7766a6735b98bd793f7c79fb720b4d0f5d13b8`
- Codec cuantizado: https://huggingface.co/groxaxo/MOSS-Audio-Tokenizer-v2-EXL3-5bpw
- Runtime ExLlamaV3: https://github.com/turboderp-org/exllamav3 (revision `02aef45cd681b960a00afcd0749a4ab99e6c1bfe`)
