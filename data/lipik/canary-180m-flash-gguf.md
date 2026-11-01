# lipik/canary-180m-flash-gguf

## Resumen

Canary 180M Flash es un modelo de reconocimiento automatico del habla (ASR) y traduccion de voz desarrollado por NVIDIA dentro de la familia NeMo Canary. Se trata de un modelo encoder-decoder con un encoder FastConformer de 17 capas y un decoder Transformer de 4 capas, que suma 182 millones de parametros (189.083.776 segun los pesos en safetensors). Resuelve dos tareas en un unico modelo: transcripcion en ingles, aleman, espanol y frances, y traduccion bidireccional entre ingles y cada uno de esos tres idiomas, con o sin puntuacion y mayusculas.

La ficha que nos ocupa no es el modelo original de NVIDIA, sino la conversion a formato GGUF realizada por el usuario `lipik` para el runtime `transcribe.cpp`, una implementacion en C++ pensada para inferencia local sin dependencias de Python ni de CUDA. Esta conversion permite ejecutar el modelo en CPU, Metal (Apple Silicon) y Vulkan, con cuantizaciones que van desde F32 (756 MB) hasta Q4_K_M (139 MB), manteniendo un WER practicamente identico al de referencia en LibriSpeech test-clean.

Su relevancia actual reside en que ofrece ASR multilingue y traduccion de voz de calidad competitiva (WER del 1,9 % en LibriSpeech test-clean y entre 6 % y 8,5 % en FLEURS segun idioma) en un paquete de menos de 200 MB que cabe en cualquier portatil. Es una alternativa ligera y de licencia permisiva (CC-BY-4.0) frente a soluciones propietarias de transcripcion en la nube.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder-decoder: FastConformer (17 capas) + Transformer decoder (4 capas), multitask AED |
| Parametros totales | 189.083.776 (182M segun el autor) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (modelo de audio, no de texto; acepta audio de 16 kHz mono) |
| Tipos de cuantizacion | F32, F16, Q8_0, Q6_K, Q5_K_M, Q4_K_M |
| Idiomas soportados | Ingles, aleman, espanol, frances (ASR); traduccion EN↔{DE, ES, FR} |
| Licencia | CC-BY-4.0 |
| Formato de pesos | GGUF (para transcribe.cpp); pesos originales en safetensors en el modelo base |

## Arquitectura y entrenamiento

Canary es un modelo encoder-decoder multitarea. El encoder es un FastConformer de 17 capas que extrae caracteristicas acusticas del audio de entrada (16 kHz mono), y el decoder es un Transformer de 4 capas que genera texto condicionado por tokens de tarea: `<target language>`, `<task>`, `<toggle timestamps>` y `<toggle PnC>`. Esta formulacion permite que un unico conjunto de pesos realice ASR y traduccion simplemente cambiando los tokens de control. El tokenizador es una concatenacion de tokenizadores SentencePiece individuales por idioma, lo que facilita la extension a nuevos idiomas.

No se dispone en la informacion proporcionada de detalles sobre el volumen de datos de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO. La model card original de NVIDIA remite al paper de la familia Canary (arXiv:2503.05931) para los detalles de entrenamiento. La conversion a GGUF se realizo desde el commit `b12ab41` del modelo base y se valido contra la implementacion de referencia de NeMo en el commit `db53eda` de transcribe.cpp, con una diferencia de una sola sustitucion sobre aproximadamente 27.000 palabras de referencia.

## Capacidades

- Reconocimiento automatico del habla en ingles, aleman, espanol y frances.
- Traduccion de voz bidireccional: EN→{DE, ES, FR} y {DE, ES, FR}→EN.
- Generacion de transcripciones con o sin puntuacion y mayusculas (toggle PnC).
- Timestamps a nivel de palabra y de segmento: funcion experimental en el modelo original, no expuesta en el port v1 de transcribe.cpp.
- Entrada de audio: WAV mono a 16 kHz (requiere conversion previa con ffmpeg si el formato difiere).
- No soporta streaming: el modelo procesa el audio completo, no en tiempo real por fragmentos.
- No incluye deteccion automatica de idioma (`lang_detect: false`): el idioma de destino debe especificarse.
- No soporta tool calling, function calling ni razonamiento multi-paso: es un modelo puramente de voz.

## Casos de uso

- Transcripcion de reuniones y entrevistas en cuatro idiomas: el modelo procesa el audio completo de una reunion y genera la transcripcion con puntuacion, adecuado para equipos multilingues que necesitan actas en ingles, aleman, espanol o frances sin enviar audio a la nube.
- Subtitulado de contenido audiovisual: combinado con la opcion de traduccion, permite generar subtitulos en ingles a partir de audio en espanol, frances o aleman (o al reves), con la ventaja de que todo el proceso ocurre en local.
- Notas de voz en aplicaciones moviles o de escritorio: con 139 MB en Q4_K_M y soporte Metal/Vulkan, puede integrarse en apps nativas que transcriben dictados sin conexion.
- Atencion al cliente y analisis de llamadas: transcripcion por lotes de grabaciones telefonicas en los cuatro idiomas soportados para su posterior analisis de calidad o cumplimiento normativo.
- Investigacion en lingüistica y corpus orales: generacion de transcripciones de bajo coste computacional para corpus en ingles, aleman, espanol y frances, con WER documentado en FLEURS (5,98 % EN, 7,33 % DE, 6,54 % ES, 8,53 % FR en Q8_0).
- Prototipado y evaluacion de pipelines ASR: al ser un GGUF pequeno y con licencia permisiva, sirve como baseline reproducible en experimentos academicos o como componente de pruebas en sistemas mayores de procesamiento de voz.
- Transcripcion en entornos con hardware limitado: equipos sin GPU dedicada pueden ejecutarlo en CPU (RTF de 21,73 en Ryzen 4750U y 78,91 en M4 Max en CPU), lo que lo hace viable en portatiles de gama media.

## Benchmarks y rendimiento

Resultados publicados en la model card de la conversion GGUF:

| Benchmark | Metrica | Resultado |
|---|---|---|
| LibriSpeech test-clean (F32) | WER | 1,94 % |
| LibriSpeech test-clean (F16) | WER | 1,94 % |
| LibriSpeech test-clean (Q8_0) | WER | 1,93 % |
| LibriSpeech test-clean (Q6_K) | WER | 1,93 % |
| LibriSpeech test-clean (Q5_K_M) | WER | 1,90 % |
| LibriSpeech test-clean (Q4_K_M) | WER | 1,93 % |
| FLEURS aleman (Q8_0) | WER | 7,33 % |
| FLEURS ingles (Q8_0) | WER | 5,98 % |
| FLEURS espanol (Q8_0) | WER | 6,54 % |
| FLEURS frances (Q8_0) | WER | 8,53 % |

Referencias adicionales: la ejecucion de referencia de NeMo produce 1,93 % en LibriSpeech test-clean, y NVIDIA reporta 1,87 % en la model card original. Las cifras de LibriSpeech corresponden a la particion completa (2.620 enunciados), batch size 1, decodificacion greedy y sin modelo de lenguaje externo.

Rendimiento de inferencia (RTF, mayor es mejor):

| Plataforma | Backend | RTF |
|---|---|---|
| Apple M4 Max | CPU | 78,91 |
| Apple M4 Max | Metal | 153,46 |
| AMD Ryzen 4750U | CPU | 21,73 |
| AMD Ryzen 4750U | Vulkan | 33,09 |

## Requisitos de hardware

- VRAM/RAM estimada: entre 139 MB (Q4_K_M) y 756 MB (F32) para los pesos, mas el overhead del runtime. Cabe holgadamente en cualquier equipo con 2 GB de memoria libre.
- GPU recomendadas: no requiere GPU dedicada. Funciona en CPU y acelera con Metal (Apple Silicon) y Vulkan (GPU integradas y dedicadas de AMD/Intel/NVIDIA).
- Compatibilidad con GPU de consumo: si, en cualquier GPU de consumo con soporte Vulkan o en Apple Silicon con Metal. Tambien en CPU pura.
- Opciones de despliegue: exclusivamente `transcribe.cpp` (binario `transcribe-cli` compilado con CMake). No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI, ya que es un modelo de audio y no de texto.
- Latencia y throughput: RTF de 153,46 en Metal (M4 Max) y 33,09 en Vulkan (Ryzen 4750U), lo que implica procesar audio entre 33 y 153 veces mas rapido que tiempo real en esas plataformas. En CPU pura, RTF de 78,91 (M4 Max) y 21,73 (Ryzen 4750U).
- Preprocesado: el audio debe convertirse a WAV mono de 16 kHz con anterioridad (por ejemplo, `ffmpeg -i input.mp3 -ar 16000 -ac 1 output.wav`).

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Tareas | Licencia | Formato |
|---|---|---|---|---|---|
| canary-180m-flash (este) | 182M | EN, DE, ES, FR | ASR + traduccion | CC-BY-4.0 | GGUF, safetensors |
| nvidia/canary-180m-flash (original) | 182M | EN, DE, ES, FR | ASR + traduccion | CC-BY-4.0 | NeMo (.nemo), safetensors |
| Whisper small (OpenAI) | 244M | ~99 idiomas | ASR + traduccion a EN | MIT | safetensors, GGUF via whisper.cpp |
| Whisper base (OpenAI) | 74M | ~99 idiomas | ASR + traduccion a EN | MIT | safetensors, GGUF via whisper.cpp |

No se dispone de datos de benchmarks comparativos directos entre estos modelos en la informacion proporcionada. La comparativa se limita a parametros, cobertura de idiomas, tareas y licencia.

## Limitaciones y advertencias

- Solo cubre cuatro idiomas (EN, DE, ES, FR); no es un modelo multilingue amplio como Whisper.
- No soporta streaming: debe procesarse el audio completo, lo que limita su uso en dictado en tiempo real.
- No incluye deteccion automatica de idioma: el idioma de destino debe indicarse explicitamente en cada peticion.
- Los timestamps a nivel de palabra y segmento son experimentales en el modelo original y no estan expuestos en el port v1 de transcribe.cpp.
- Riesgo de alucinacion en audio con ruido, musica o habla solapada; el WER en FLEURS (6-8,5 %) es notablemente superior al de LibriSpeech (audio limpio de lectura).
- El modelo no genera texto libre ni razona: cualquier uso fuera de ASR o traduccion de voz no es posible.
- Licencia CC-BY-4.0: permite uso comercial con atribucion. Es necesario citar a NVIDIA y respetar los terminos del modelo base.
- La conversion GGUF es un port de terceros (`lipik`), no oficial de NVIDIA; la model card original es la fuente autoritativa.
- Requiere preprocesado de audio a WAV mono de 16 kHz; no acepta directamente MP3, FLAC ni otros formatos.
- El repositorio tiene muy pocas descargas (22) y cero likes en el momento de la consulta, lo que indica poca validacion por parte de la comunidad.

## Enlaces

- Repositorio GGUF: https://huggingface.co/lipik/canary-180m-flash-gguf
- Modelo base: https://huggingface.co/nvidia/canary-180m-flash
- Commit del modelo base usado: https://huggingface.co/nvidia/canary-180m-flash/commit/b12ab41
- Runtime transcribe.cpp: https://github.com/handy-computer/transcribe.cpp
- Commit de validacion: https://github.com/handy-computer/transcribe.cpp/tree/db53eda
- Documentacion del modelo en transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/blob/main/docs/models/canary-180m-flash.md
- Paper de la familia Canary: https://arxiv.org/abs/2503.05931
- Paper de FastConformer: https://arxiv.org/abs/2104.02821
- Paper de Transformer (Attention is all you need): https://arxiv.org/abs/1706.03762
- Paper sobre tokenizadores concatenados: https://arxiv.org/abs/2409.13523
- NVIDIA NeMo: https://github.com/NVIDIA/NeMo
