# moonhouse/pianissimo-sv-mlx

## Resumen

Pianissimo-sv-mlx es la conversion a MLX del modelo de reconocimiento automatico del habla (ASR) Klang Pianissimo, desarrollado originalmente por Klang AI AB para sueco. Se trata de un modelo de 627.052.166 parametros con arquitectura FastConformer como codificador y decoder TDT (Token-and-Duration Transducer), afinado a partir de NVIDIA Parakeet TDT 0.6B v3. Esta version, publicada por el usuario moonhouse, no reentrena los pesos: unicamente los transforma al formato de memoria de MLX en float16 para permitir inferencia en GPU de Apple Silicon (M1/M2/M3/M4) mediante la libreria `parakeet-mlx`.

Su relevancia practica es doble. Por un lado, cubre una laguna poco habitual: ASR de alta calidad especificamente para sueco, un idioma con menos recursos que el ingles o el espanol. Por otro, demuestra una ruta de despliegue on-device muy eficiente: segun la model card, consigue un WER del 6,67 % en GPU de Apple Silicon frente al 4,67 % del modelo original en PyTorch NeMo sobre CPU, con una concordancia entre ambos del 98,00 %, una aceleracion aproximada de 8,8x y un tiempo de carga que baja de unos 7,6 s a unos 0,06 s gracias a la carga zero-copy sobre memoria unificada.

El repositorio se distribuye bajo licencia CC BY 4.0, la misma que el modelo base, e incluye pesos `model.safetensors` en float16, `config.json` y un tokenizer SentencePiece BPE. Aunque la etiqueta `quantization` aparece en los tags, la model card describe los pesos como float16 con el layout de memoria de MLX, sin detallar otros niveles de cuantizacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastConformer (codificador) + TDT (decoder Token-and-Duration Transducer) |
| Parametros totales | 627.052.166 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (modelo ASR; la configuracion de atencion local se define en `config.json`, sin valor publico detallado) |
| Tipos de cuantizacion | float16 (pesos en layout MLX). No se documentan otros niveles de cuantizacion en la informacion disponible |
| Idiomas soportados | Sueco (sv) |
| Licencia | CC BY 4.0 |
| Formato de pesos | safetensors (MLX, float16); tokenizer SentencePiece (`tokenizer.model`) |
| Libreria de inferencia | `parakeet-mlx` |
| Tarea (pipeline) | automatic-speech-recognition |
| Modelo base | KlangAI/pianissimo-sv (relacion: quantized) |
| Tamano del repositorio | 1,3 GB |
| Plataforma objetivo | Apple Silicon (M1/M2/M3/M4) |
| Fecha de publicacion (metadatos HF) | 2026-09-23 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El modelo es una adaptacion de pesos, no un entrenamiento nuevo. La arquitectura subyacente es FastConformer, una variante del codificador Conformer con atencion mayoritariamente local y subsampling agresivo, pensada para reducir coste computacional en audio largo manteniendo precision acustica. Sobre ella se situa un decoder TDT (Token-and-Duration Transducer), que predice conjuntamente el token y su duracion, lo que permite emisiones no monotonas por fotograma y mejora la eficiencia del decodificado frente a CTC o RNN-T clasicos. El modelo original fue afinado desde NVIDIA Parakeet TDT 0.6B v3 por Klang AI AB.

Esta publicacion concreta solo transforma los pesos del modelo base al layout de memoria de MLX y los almacena en float16, de modo que puedan cargarse en memoria unificada de Apple Silicon con `parakeet-mlx`. La model card indica explicitamente que los pesos no se han reentrenado y que todo el merito del modelo corresponde a Klang AI AB. No se detallan en la informacion disponible el volumen de tokens de audio, la composicion del dataset de afinado, ni si se emplearon tecnicas de RLHF/DPO (poco habituales en ASR). Tampoco se documenta el uso de decodificacion especulativa.

## Capacidades

- Transcripcion de voz a texto en sueco a partir de ficheros de audio en formatos como `.wav`, `.mp3` o `.m4a` (con `ffmpeg` instalado).
- Generacion de marcas de tiempo a nivel de palabra: la API expone `result.sentences[].tokens[]` con `start`, `end` y `text` por token.
- Reconoce variantes dialectales del sueco: la evaluacion se realizo sobre el dataset `KlangAI/klang-dialects`.
- Inferencia on-device sobre GPU de Apple Silicon con carga zero-copy en memoria unificada.
- Integracion en Python mediante `from parakeet_mlx import from_pretrained` y llamada directa a `model.transcribe(...)`.
- No se documenta soporte de tool calling, function calling, capacidades de agente, vision, audio de entrada mas alla del propio ASR, ni modo de razonamiento explicito.
- Capacidad multilingue: limitada a sueco segun el campo `language: sv`.

## Casos de uso

- Transcripcion de reuniones corporativas en sueco: el modelo convierte audio de reuniones a texto con marcas de tiempo por palabra, lo que facilita la generacion de actas con atribucion temporal y la busqueda dentro de la grabacion.
- Subtitulado automatico de video en sueco: los timestamps a nivel de token permiten alinear subtitulos y ajustar su duracion sin necesidad de un alineador forzado adicional.
- Aplicaciones de dictado en macOS: al ejecutarse sobre MLX en Apple Silicon con carga en 0,06 s, encaja en utilidades de escritorio que transcriben en local sin enviar audio a la nube, con la consiguiente ventaja de privacidad.
- Analisis de llamadas de atencion al cliente en sueco: la transcripcion permite indexar conversaciones, extraer palabras clave y alimentar analitica posterior; el coste marginal es bajo al no depender de APIs externas.
- Archivado y busqueda de contenido audiovisual en medios suecos: transcripcion masiva de catalogo para generar indices de busqueda sobre material historico, con marcas de tiempo que permiten saltar al fragmento exacto.
- Investigacion en dialectologia y linguistica: el modelo esta evaluado sobre un corpus de dialectos suecos, por lo que sirve como base para estudios de variacion fonetica y para generar transcripciones anotadas temporalmente.
- Accesibilidad para personas con discapacidad auditiva: generacion de transcripciones en vivo o diferidas de contenido hablado en sueco dentro de aplicaciones nativas de escritorio.
- Preprocesado de pipelines de NLP en sueco: transcripcion como primer paso antes de resumen, clasificacion de temas o analisis de sentimiento sobre el texto resultante.

## Benchmarks y rendimiento

Evaluacion publicada en la model card sobre el Swedish Speech Benchmark (`KlangAI/klang-dialects`), comparando el modelo original en PyTorch NeMo sobre CPU con esta conversion en MLX sobre GPU de Apple Silicon:

| Metrica | PyTorch NeMo (CPU) | Apple Silicon MLX (GPU) |
|---|---|---|
| Word Error Rate (WER) | 4,67 % | 6,67 % |
| Concordancia modelo a modelo | — | 98,00 % |
| Aceleracion de inferencia | 1,0x (referencia) | ~8,8x mas rapido |
| Tiempo de carga del modelo | ~7,6 s | ~0,06 s (zero-copy) |

No se han publicado en la informacion disponible resultados de MMLU, HumanEval, GSM8K ni de otros benchmarks de texto, ya que no es un modelo de lenguaje. Tampoco se detallan valores absolutos de latencia, RTF ni throughput en horas de audio por segundo.

## Requisitos de hardware

- VRAM / memoria: los pesos en float16 ocupan aproximadamente 1,25 GB (627 M de parametros); el repositorio completo pesa 1,3 GB. Conviene reservar algo mas de memoria unificada para activaciones y buffers de audio.
- Plataforma: exclusivamente Apple Silicon (M1/M2/M3/M4) mediante MLX. No se distribuye una ruta de ejecucion para CUDA en este repositorio.
- GPU compatibles: las integradas en los chips de Apple. GPU NVIDIA tipo A100, H100 o RTX 4090 no son utilizables con este repositorio tal cual; para esas plataformas habria que usar el modelo base `KlangAI/pianissimo-sv` en formato PyTorch/NeMo.
- Cabe en hardware de consumo: si, en cualquier Mac con chip M1 o posterior y memoria unificada suficiente (unos 2-4 GB libres bastan holgadamente). No cabe en GPU de consumo NVIDIA usando este repositorio.
- Opciones de despliegue: `parakeet-mlx` (libreria oficial de uso para estos pesos). No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: la model card reporta una aceleracion aproximada de 8,8x frente al baseline en CPU y una carga del modelo de aproximadamente 0,06 s. No se publican cifras absolutas de latencia por minuto de audio.
- Requisito adicional: `ffmpeg` instalado para la lectura de formatos de audio comprimidos.

## Comparativa con modelos similares

| Modelo | Parametros | Idioma | Formato / runtime | Licencia | Datos de rendimiento |
|---|---|---|---|---|---|
| moonhouse/pianissimo-sv-mlx | 627 M | Sueco | safetensors MLX, `parakeet-mlx` | CC BY 4.0 | WER 6,67 % en MLX GPU; 98 % de concordancia con el original; 8,8x mas rapido |
| KlangAI/pianissimo-sv (modelo base) | 627 M | Sueco | PyTorch / NeMo | CC BY 4.0 | WER 4,67 % en CPU |
| NVIDIA Parakeet TDT 0.6B v3 (origen del afinado) | ~600 M | Multilingue (segun version) | PyTorch / NeMo | No disponible en la informacion proporcionada | No disponible |
| Alternativas de ASR en sueco de otros proveedores (por ejemplo, la familia KBLab kb-whisper) | No disponible | Sueco | Depende del runtime | No disponible | No disponible |

La comparacion directa con alternativas de ASR en sueco fuera del ecosistema Klang/NVIDIA no puede completarse con la informacion disponible: no se han proporcionado specs ni resultados de esos modelos.

## Limitaciones y advertencias

- Degradacion de precision: el WER sube del 4,67 % en el modelo original a 6,67 % en la conversion MLX, una perdida relativa relevante en entornos donde la exactitud literal sea critica (por ejemplo, transcripcion legal o medica).
- Unico idioma soportado: sueco. La entrada en otro idioma producira salidas incorrectas o inventadas, sin mecanismo documentado de deteccion de idioma.
- Dependencia de plataforma: solo funciona en Apple Silicon con MLX. No hay soporte CUDA ni CPU en este repositorio, lo que descarta su uso en la mayoria de servidores de inferencia.
- Naturaleza de la publicacion: es una conversion de pesos, no un modelo entrenado ni validado de forma independiente. Toda la calidad depende del modelo base de Klang AI AB.
- Posible alucinacion: como cualquier modelo de ASR con decoder transducer, puede generar texto plausible en tramos de silencio, ruido o audio ininteligible. No se documentan filtros de confianza ni umbrales de descarte.
- Sesgos: no se documenta informacion sobre la composicion demografica del corpus de entrenamiento ni sobre sesgos de acento, genero o edad. La evaluacion en `KlangAI/klang-dialects` sugiere cobertura dialectal, pero no se aportan desgloses por subgrupo.
- Audio largo: el modelo emplea una configuracion de atencion local definida en `config.json`, cuyo parametro concreto no se detalla; en la practica conviene segmentar audios muy largos en fragmentos y ensamblar los resultados, asumiendo riesgo de errores en las fronteras.
- Licencia: CC BY 4.0 permite uso comercial, pero exige atribucion a Klang AI AB y el cumplimiento de las condiciones de la licencia. Al ser una licencia de Creative Commons pensada para contenido y no para software, conviene revisar su encaje en productos propietarios.
- Adopcion nula: el repositorio registra 0 descargas y 0 likes, por lo que no existe validacion comunitaria independiente de los resultados declarados.
- Sin garantias de mantenimiento: no hay informacion sobre actualizaciones posteriores ni sobre el soporte del autor de la conversion.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/moonhouse/pianissimo-sv-mlx
- Modelo base: https://huggingface.co/KlangAI/pianissimo-sv
- Libreria de inferencia `parakeet-mlx`: https://github.com/senstella/parakeet-mlx
- Dataset de evaluacion `KlangAI/klang-dialects`: https://huggingface.co/datasets/KlangAI/klang-dialects
- Modelo de origen del afinado (NVIDIA Parakeet TDT 0.6B v3): https://huggingface.co/nvidia/parakeet-tdt-0.6b-v3
- Licencia CC BY 4.0: https://creativecommons.org/licenses/by/4.0/
