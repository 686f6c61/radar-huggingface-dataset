# groxaxo/MOSS-TTS-v1.5-EXL3-4bit

## Resumen

MOSS-TTS v1.5 — EXL3-4bit es una cuantización comunitaria del modelo de síntesis de voz MOSS-TTS v1.5, desarrollado originalmente por el equipo OpenMOSS. El autor de esta versión, groxaxo, ha convertido los 252 módulos lineales del transformer a 4 bits mediante el esquema EXL3 (con codificación trellis LDLQ calibrada), manteniendo en BF16 los embeddings de audio, las normas y las cabezas de salida, con el objetivo de reducir la huella de VRAM manteniendo la calidad de voz clonada.

La relevancia de esta ficha radica en que se trata de un checkpoint experimental documentado con mediciones reales en una RTX 3090: el autor publica RTF (real-time factor), consumo de memoria, similitud de voz (WavLM/ECAPA), naturalidad predicha (UTMOS) e inteligibilidad (CER/WER vía Whisper-small) para varias cuantizaciones alternativas. El modelo base soporta inglés y español, y el formato EXL3-4 consigue el menor consumo de memoria de todas las variantes probadas (9,79 GiB asignados), con un RTF de 0,518, es decir, síntesis más rápida que el tiempo real.

Es importante subrayar que no es un checkpoint estándar compatible con AutoModel de Transformers, llama.cpp, vLLM o cargadores EXL3 sin modificar: requiere un adaptador de ejecución propio y un backend EXL3 concretamente fijado en su repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer autoregresivo de texto a voz (formato moss_tts_delay, custom code) con tokenizador de audio RVQ separado |
| Parametros totales | 3.327.288.320 (aprox. 3,33 B, dato real de safetensors) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | EXL3 4 bits en los 252 lineales del transformer; embeddings de texto y 33 cabezas afines a 8 bits G64; embeddings y normas de audio en BF16; efectivo 4,9425 bits por parametro original |
| Idiomas soportados | Ingles y espanol |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (payload de tensores: 5.245.161.440 bytes; tamano del repo: 5,3 GB), formato EXL3 nativo con codigo custom |

## Arquitectura y entrenamiento

MOSS-TTS v1.5 es un modelo de texto a voz autoregresivo basado en transformer que genera tokens de audio (RVQ, residual vector quantization) a partir de texto y de una voz de referencia, habilitando clonacion de voz. Utiliza un tokenizador de audio dedicado (MOSS-Audio-Tokenizer, distribuido en FP32 y descargable por separado) que decodifica los tokens generados a forma de onda. El checkpoint tiene 33 cabezas de salida de texto/RVQ; segun el autor, no existe una ruta MTP (multi-token prediction) entrenada compatible, por lo que esas cabezas no actuan como predictores de tokens futuros.

Respecto al entrenamiento del modelo base, no se han publicado en la informacion disponible detalles sobre el numero de tokens, composicion del dataset o uso de RLHF/DPO. En cuanto a la cuantizacion, los pesos se convirtieron directamente desde el checkpoint BF16 fijado (sin re-cuantizar desde AWQ o EXL3-4), usando codificacion trellis LDLQ calibrada nativa de EXL3 sin grupos afines de 64 bits ni punto cero equivalente. La verificacion de cada modulo cuantizado (252 modulos) frente a sus pesos reconstruidos arrojo un coseno minimo de al menos 0,999, lo que el autor denomina paridad nativa del kernel, no equivalencia con BF16.

## Capacidades

- Sintesis de texto a voz con clonacion de voz a partir de referencias de audio cortas (las pruebas usaron referencias de 15 s y 11 s).
- Soporte bilingue: espanol e ingles, con calidad medida en ambos idiomas (el ingles presenta una preocupacion de calidad senalada por el autor).
- Sintesis mas rapida que el tiempo real en GPU consumer: RTF de 0,518 en RTX 3090.
- Huella de VRAM reducida frente a BF16 (9,79 GiB frente a 19,50 GiB asignados), lo que permite ejecucion en GPUs de 12-24 GB.
- Script de inferencia incluido (`infer.py`) con parametros de idioma, texto de entrada, voz de referencia y fichero de salida.
- Script de verificacion de integridad (`verify_bundle.py`) que comprueba los hashes de todos los ficheros distribuidos y la estructura del checkpoint.
- No es un modelo de texto general: no tiene capacidades de chat, razonamiento, codigo ni tool calling.

## Casos de uso

- Clonacion de voz para locucion de contenido en espanol: con una referencia de audio consentida de 11-15 segundos, el modelo genera narraciones para videos, podcasts o audiolibros con sintesis mas rapida que el tiempo real en una sola GPU de 24 GB.
- Generacion de voz para asistentes de voz en espanol: su bajo RTF (0,518) y consumo de ~10 GiB lo hacen viable como motor TTS local en servidores de pequena escala para respuestas habladas.
- Produccion de audio con presupuesto de VRAM ajustado: al ser la variante con menor huella de memoria de las probadas (9,79 GiB asignados), permite co-residir el modelo con otros servicios en una misma GPU.
- Prototipado y evaluacion de cuantizaciones TTS: la documentacion exhaustiva (RTF, WavLM, ECAPA, UTMOS, CER/WER por runtime) sirve como referencia metodologica para equipos que evaluan cuantizar modelos de voz.
- Doblaje o localizacion bilingue: soporte de espanol e ingles en el mismo checkpoint, util para generar audio en ambos idiomas con la misma voz de referencia, previa validacion de calidad en ingles.
- Investigacion en tokenizacion de audio y modelos autoregresivos de voz: el formato moss_tts_delay y el tokenizador RVQ separado permiten estudiar pipelines de TTS neuronales de extremo a extremo.

## Benchmarks y rendimiento

El autor publica mediciones propias en RTX 3090 (16 casos por runtime, 2 semillas, referencias de 15 s y 11 s; 96 registros de renderizado en total). No son benchmarks estandarizados de la comunidad ni comparables entre modelos distintos.

| Runtime | RTF de sintesis | Pico asignado / reservado (GiB) | WavLM (coseno) | ECAPA (coseno) | UTMOS predicho | CER / WER |
|---|---:|---:|---:|---:|---:|---:|
| BF16 | 0,558 | 19,50 / 19,91 | 0,9703 | 0,6210 | 3,126 | 1,13% / 3,25% |
| AWQ4-G64 | 1,212 | 10,66 / 11,07 | 0,9685 | 0,5807 | 3,177 | 1,63% / 4,27% |
| GPTQPro4 | 0,759 | 10,04 / 10,50 | 0,9694 | 0,6119 | 3,120 | 2,14% / 5,69% |
| GPTQPro4-Fused | 0,605 | 10,04 / 10,48 | 0,9694 | 0,6119 | 3,120 | 2,14% / 5,69% |
| EXL3-4 (este modelo) | 0,518 | 9,79 / 9,84 | 0,9652 | 0,6135 | 3,127 | 2,18% / 4,88% |
| EXL3-5 | 0,525 | 10,56 / 10,62 | 0,9721 | 0,6405 | 3,111 | 1,13% / 3,66% |

Notas del autor: RTF incluye la decodificacion FP32 co-residente; WavLM/ECAPA son cosenos frente a las grabaciones de referencia originales; UTMOS es naturalidad predicha, no MOS humano; CER/WER miden inteligibilidad del audio generado a traves de Whisper-small e incluyen errores del reconocedor. EXL3-5 se midio en una ventana de GPU posterior con actividad de otras GPU, por lo que las diferencias de tiempo no son evidencia controlada de velocidad. En ingles (solo 4 casos y 1 prompt por runtime): UTMOS predicho de 3,323 (BF16), 3,137 (GPTQ), 3,078 (EXL3-4), 3,090 (EXL3-5); CER en ingles de 0% (BF16), 4,55% (GPTQ/EXL3-4) y 1,82% (EXL3-5).

## Requisitos de hardware

- VRAM estimada para inferencia: 9,79 GiB asignados / 9,84 GiB reservados en RTX 3090, incluyendo el decodificador FP32 del tokenizador de audio co-residente. Se recomienda una GPU con al menos 12 GB de VRAM.
- GPU de referencia en las mediciones: NVIDIA RTX 3090 (24 GB). No hay mediciones publicadas en otras GPUs.
- Cabe en GPUs consumer de gama alta: si, segun las mediciones del autor, funciona en una RTX 3090 con ~10 GiB; por extension, GPUs de 12 GB o mas deberian ser suficientes, aunque sin datos verificados.
- Entorno probado: Linux, Python 3.12, Torch 2.11.0+cu130, Transformers 5.19.0, Triton 3.6.0, CUDA toolkit 12.8 para compilar EXL3.
- Despliegue: unicamente mediante el runtime nativo incluido con el backend exllamav3 fijado (commit 02aef45) y el adaptador Python del autor. No es compatible con llama.cpp, vLLM, TGI, Ollama ni con AutoModel.from_pretrained estandar.
- Latencia y throughput: RTF de 0,518 (la sintesis tarda aproximadamente la mitad de la duracion del audio resultante), medido con decodificacion FP32 co-residente.

## Comparativa con modelos similares

Comparativa entre las variantes de cuantizacion del propio MOSS-TTS v1.5 medidas por el autor (no hay alternativas de otros fabricantes con datos publicados en la informacion disponible):

| Variante | Parametros | Pico de VRAM (GiB) | RTF | UTMOS | Licencia | Disponibilidad |
|---|---|---:|---:|---:|---|---|
| EXL3-4 (este modelo) | 3,33 B (4,94 bits efectivos) | 9,79 | 0,518 | 3,127 | Apache 2.0 | HF, requiere runtime custom |
| EXL3-5 | 3,33 B (~5 bits) | 10,56 | 0,525 | 3,111 | Apache 2.0 | Misma familia, mayor similitud de voz (WavLM 0,9721) |
| GPTQPro4-Fused | 3,33 B (4 bits G64) | 10,04 | 0,605 | 3,120 | Apache 2.0 | Requiere backend GPTQ-Pro del autor |
| BF16 (original) | 3,33 B | 19,50 | 0,558 | 3,126 | Apache 2.0 | OpenMOSS-Team/MOSS-TTS-v1.5 |

En resumen: EXL3-4 ofrece la menor huella de VRAM y el mejor RTF, mientras que EXL3-5 obtiene los mayores cosenos de referencia (WavLM/ECAPA) y el autor indica que GPTQ Pro fused sigue siendo su modelo preferido del proyecto; ninguna medicion proxy sustituye a la preferencia de oyentes en pruebas ciegas.

## Limitaciones y advertencias

- Calidad en ingles sin validar a fondo: solo se probaron 4 casos y un prompt en ingles por runtime; el autor senala expresamente que el ingles sigue siendo una preocupacion de cribado (CER de 4,55% en EXL3-4 frente a 0% en BF16). Se recomienda validar ambos idiomas con oyentes reales en ciego.
- Compatibilidad muy restringida: no funciona con AutoModel.from_pretrained, llama.cpp, vLLM ni cargadores EXL3 sin modificar; requiere revisar y ejecutar codigo Python custom suministrado por el autor, lo que supone un riesgo de seguridad y mantenimiento habitual en checkpoints comunitarios.
- Dependencia de backends fijados a commits concretos (exllamav3 commit 02aef45, GPTQ-Pro commit c02dd67) y de un revision concreta del tokenizador de audio; cualquier actualizacion puede romper la ejecucion.
- Requiere descargar por separado el tokenizador de audio FP32 (OpenMOSS-Team/MOSS-Audio-Tokenizer, revision 3cd226b), que tambien contribuye al consumo de VRAM.
- Las mediciones se basan en 16 casos por runtime con solo dos voces de referencia femeninas que no eran las voces objetivo previstas; los resultados no son generalizables a cualquier voz o idioma.
- Riesgo de clonacion de voz indebida: como todo modelo de voice cloning, puede usarse para suplantacion de identidad vocal; debe emplearse unicamente con referencias de audio consentidas, como indica el propio comando de ejemplo del autor.
- No hay datos de sesgos, tasas de alucinacion (no aplicable a TTS, aunque si de errores de pronunciacion medibles via CER/WER) ni de uso comercial publicados mas alla de la licencia Apache 2.0, que si permite uso comercial.
- La ruta AWQ probada dequantiza a BF16 GEMM y no es un resultado Marlin optimizado; no generalizar esos tiempos a otras implementaciones AWQ.
- Adopcion muy temprana: 30 descargas y 1 like en el momento de la ficha; proyecto experimental de un autor individual, sin respaldo del equipo OpenMOSS original.

## Enlaces

- Modelo cuantizado (esta ficha): https://huggingface.co/groxaxo/MOSS-TTS-v1.5-EXL3-4bit
- Modelo base: https://huggingface.co/OpenMOSS-Team/MOSS-TTS-v1.5
- Tokenizador de audio (descarga separada obligatoria): https://huggingface.co/OpenMOSS-Team/MOSS-Audio-Tokenizer (revision 3cd226ba2947efa357ef453bcad111b6eafba782)
- Backend EXL3 (exllamav3, commit fijado): https://github.com/turboderp-org/exllamav3/tree/02aef45cd681b960a00afcd0749a4ab99e6c1bfe
- Backend GPTQ-Pro alternativo (commit fijado): https://github.com/groxaxo/GPTQ-Pro/tree/c02dd675ad74cec2cc79f654d3c135ac225c8e23
- Fichero de entorno probado: https://huggingface.co/groxaxo/MOSS-TTS-v1.5-EXL3-4bit/blob/main/tested-environment.txt
