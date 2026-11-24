# erayyapagci/balbal-v2

## Resumen

balbal-v2 es un modelo de reconocimiento automatico del habla (ASR) en turco, desarrollado por erayyapagci, que combina una arquitectura Conformer-CTC con un refinador transformer iterativo ("looped refiner") y una memoria acustica de product-key, decodificada mediante un modelo de lenguaje KenLM de 6-gramas sobre piezas SentencePiece. Con 45,4 millones de parametros totales (de los cuales 30 millones corresponden a la tabla de memoria, de la que solo se leen unas pocas filas por frame), esta pensado para ejecutarse con rapidez en CPU: segun el autor, procesa audio 236 veces mas rapido que tiempo real con 8 hilos.

El modelo parte de erayyapagci/balbal-v1 mediante fine-tuning y esta entrenado sobre aproximadamente 5.000 horas de audio. Su foco principal son las llamadas telefonicas en turco, donde obtiene un 9,46 % de WER y un 18,44 % de sigWER en Mu-Bench tr-TR (frente a 11,93 / 25,18 de balbal-v1), y el habla leida, con un 5,22 % de WER en FLEURS turco. Tambien transcribe ingles, aunque con menor precision.

Es relevante por su propuesta de eficiencia: un modelo pequeno, orientado a CPU y con decodificacion KenLM, que compite en turco telefonico con modelos abiertos mucho mayores. Se distribuye en formato ONNX y con una licencia comunitaria propia (balbal-community-license-1.1), no estandar de codigo abierto. Existe un hermano mayor, balbal-v2-manas (313M parametros, turco e ingles).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Conformer-CTC (16 capas, d_model 176, 80 mel, submuestreo 4x, frames de 40 ms) + refinador Transformer de 2 capas (ancho 192, 3 pasadas) + memoria acustica product-key (500x500 subclaves, 4 cabezas, top-16, dim de valor 120, contexto de 3 frames) |
| Parametros totales | 45,4 M (30,0 M corresponden a la tabla de memoria) |
| Parametros activos | no disponible (no es MoE; la memoria lee solo unas pocas filas por frame) |
| Longitud de contexto | audio en trozos de 30 s como maximo (el audio mas largo se corta en fragmentos de 30 s) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | turco (principal) e ingles (menor precision) |
| Licencia | balbal-community-license-1.1 (license: other) |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

El modelo es un Conformer-CTC de 16 capas con d_model 176, entrada de 80 filtros mel y submuestreo 4x (frames de 40 ms). Sobre la salida del encoder se aplica un refinador Transformer de 2 capas y ancho 192 que se ejecuta en 3 pasadas, alimentando cada pasada la distribucion CTC anterior como entrada. Ademas incorpora una memoria acustica de product-key de 500x500 subclaves, 4 cabezas, seleccion top-16, dimension de valor 120 y contexto de 3 frames; pese a sus 30 millones de parametros, solo se leen unas pocas filas por frame, lo que explica su bajo coste computacional en inferencia.

El vocabulario es SentencePiece de 1.024 piezas mas el token blank de CTC, y la decodificacion se realiza con un KenLM de 6-gramas sobre dichas piezas. El autor indica un entrenamiento sobre aproximadamente 5.000 horas de audio, partiendo de balbal-v1 mediante fine-tuning. No se detalla en la informacion disponible la composicion exacta del dataset, ni si hubo RLHF/DPO (poco habitual en ASR) ni otras tecnicas de alineamiento. La salida es texto con mayusculas, puntuacion y marcas de tiempo por palabra; la normalizacion inversa de texto del codigo convierte numeros a digitos (con `--no-itn` se conservan las palabras habladas).

## Capacidades

- Reconocimiento automatico del habla (ASR) en turco con salida casing, puntuacion y timestamps por palabra.
- Transcripcion de ingles con precision inferior a la del turco.
- Manejo de audio de llamadas telefonicas, con resultados especificos en Mu-Bench tr-TR.
- Normalizacion inversa de texto (ITN) integrada en el codigo para convertir numeros hablados a digitos.
- Troceado automatico de audio largo en fragmentos de 30 s.
- Decodificacion KenLM de 6-gramas sobre piezas SentencePiece para mejorar la fluidez y reducir errores.
- Ejecucion eficiente en CPU (236x tiempo real con 8 hilos) y distribucion en ONNX.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, vision ni audio multimodal; es un modelo puramente ASR.

## Casos de uso

- Transcripcion de llamadas de atencion al cliente: el modelo esta optimizado para turco telefonico (9,46 % WER en Mu-Bench tr-TR) y puede transcribir conversaciones grabadas para auditoria de calidad, analisis de motivos de llamada o generacion de resumenes posteriores.
- Subtitulado y actas de reuniones en turco: con timestamps por palabra y salida puntuada, encaja en pipelines que generan subtitulos sincronizados o transcripciones navegables para reuniones y entrevistas.
- Dictado y notas de voz en aplicaciones moviles: su tamano reducido (45,4 M parametros, 1,0 GB de repo) y su velocidad en CPU lo hacen viable en dispositivos sin GPU; el autor publica una app Android enlazada desde la pagina del modelo.
- Sistemas de transcripcion en servidores sin GPU: al ejecutarse 236x tiempo real en 8 hilos de CPU, permite desplegar ASR turco en infraestructura convencional sin aceleradores.
- Indexacion y busqueda de contenido audiovisual en turco: transcribir archivos de audio o video para hacerlos buscables por texto, con normalizacion de numeros a digitos que facilita la recuperacion de datos como cifras o fechas.
- Analisis de centros de contacto y compliance: transcripcion masiva de grabaciones telefonicas para deteccion de palabras clave, analisis de sentimiento o cumplimiento normativo, aprovechando el rendimiento en dominio telefonico.
- Transcripcion bilingue turco-ingles en escenarios mixtos: aunque el ingles es secundario, puede usarse para contenido donde se mezclan ambos idiomas, asumiendo mayor tasa de error en el tramo ingles.

## Benchmarks y rendimiento

Datos declarados por el autor del modelo (no verificados de forma independiente). Mu-Bench se evalua con su harness oficial y juez GPT-4.1; FLEURS con balbal-normalizer.

| Dataset | Idioma | Metrica | Valor |
|---|---|---|---|
| Mu-Bench (tr-TR, llamadas telefonicas) | tr | WER | 9,46 % |
| Mu-Bench (tr-TR, llamadas telefonicas) | tr | sigWER | 18,44 % |
| FLEURS (tr_tr) | tr | WER | 5,22 % |
| FLEURS (tr_tr) | tr | CER | 1,52 % |
| LibriSpeech (clean) | en | WER | 10,32 % |
| LibriSpeech (other) | en | WER | 19,35 % |
| AMI (ihm, meetings) | en | WER | 31,52 % |
| Earnings-22 | en | WER | 30,86 % |
| Vox Populi (en) | en | WER | 18,18 % |
| GigaSpeech | en | WER | 23,43 % |
| SPGI Speech | en | WER | 16,17 % |
| TED-LIUM 3 (release3) | en | WER | 14,96 % |

Referencia comparativa del autor: balbal-v1 obtenia 11,93 % WER y 25,18 % sigWER en Mu-Bench tr-TR, y 6,54 % WER en FLEURS turco. No se han publicado en la informacion disponible resultados de benchmarks para balbal-v2-manas ni de otros modelos abiertos comparables.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el modelo esta pensado para ejecucion en CPU y se distribuye en ONNX.
- GPU recomendadas: no disponible; no se documentan requisitos de GPU.
- Compatibilidad con GPU consumer: no disponible; el enfasis del autor es la inferencia en CPU.
- Rendimiento en CPU: 236x mas rapido que tiempo real con 8 hilos, medido en un AMD Ryzen AI Max+ 395 con 100 clips, batch 1.
- Opciones de despliegue: ONNX Runtime (formato principal); el codigo de referencia (Apache 2.0) esta en https://github.com/erayyap/balbal. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI (herramientas orientadas a LLM, no a este ASR).
- Latencia y throughput: no disponible mas alla del dato de velocidad relativa en CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Contexto de audio | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| balbal-v2 | 45,4 M (30 M en memoria) | tr, en | fragmentos de 30 s | balbal-community-license-1.1 | ONNX, Hugging Face |
| balbal-v2-manas | 313 M | tr, en | no disponible | no disponible | Hugging Face |
| balbal-v1 | no disponible | tr, en | no disponible | no disponible | Hugging Face (modelo base) |

Comparativa de rendimiento en turco segun datos del autor: balbal-v2 obtiene 9,46 % WER / 18,44 % sigWER en Mu-Bench tr-TR y 5,22 % WER en FLEURS, frente a 11,93 % / 25,18 % y 6,54 % de balbal-v1 respectivamente. Para balbal-v2-manas no se han publicado resultados de benchmarks en la informacion disponible. No se dispone de datos de otros modelos abiertos de ASR turco en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo especializado en turco: el rendimiento en ingles es notablemente inferior (WER de 10,32 % en LibriSpeech clean y 31,52 % en AMI), por lo que no es adecuado como ASR principal en ingles.
- El audio se corta en fragmentos de 30 s; no gestiona contexto acustico mas alla de esa ventana.
- Riesgo de alucinacion y de errores de transcripcion, especialmente en audio ruidoso, solapamiento de hablantes o dominio distinto del telefonico; el sigWER de 18,44 % en Mu-Bench indica que casi una de cada cinco utterances contiene al menos un error que cambia el significado.
- Los resultados de benchmarks estan declarados por el autor y no verificados de forma independiente.
- La licencia balbal-community-license-1.1 no es una licencia de codigo abierto estandar; deben revisarse sus terminos antes de cualquier uso comercial. El codigo del repositorio se distribuye aparte bajo Apache 2.0.
- No se documentan sesgos especificos, composicion del dataset de entrenamiento ni cobertura de acentos o dialectos turcos, lo que limita la evaluacion de robustez.
- No se dispone de informacion sobre cuantizacion ni sobre despliegue en GPU, lo que puede condicionar integraciones en pipelines existentes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/erayyapagci/balbal-v2
- Modelo hermano balbal-v2-manas: https://huggingface.co/erayyapagci/balbal-v2-manas
- Modelo base balbal-v1: https://huggingface.co/erayyapagci/balbal-v1
- Codigo (Apache 2.0): https://github.com/erayyap/balbal
- Pagina del modelo, demo en navegador y app Android: https://erayy.com/balbal/
- Version en turco de la pagina: https://erayy.com/tr/balbal/
- Dataset Mu-Bench: https://huggingface.co/datasets/sierra-research/mu-bench
- Dataset FLEURS: https://huggingface.co/datasets/google/fleurs
- Dataset LibriSpeech: https://huggingface.co/datasets/librispeech_asr
- Dataset AMI: https://huggingface.co/datasets/edinburghcstr/ami
- Dataset Earnings-22: https://huggingface.co/datasets/revdotcom/earnings22
- Dataset Vox Populi: https://huggingface.co/datasets/facebook/voxpopuli
- Dataset GigaSpeech: https://huggingface.co/datasets/speechcolab/gigaspeech
- Dataset SPGI Speech: https://huggingface.co/datasets/kensho/spgispeech
- Dataset TED-LIUM 3: https://huggingface.co/datasets/LIUM/tedlium
