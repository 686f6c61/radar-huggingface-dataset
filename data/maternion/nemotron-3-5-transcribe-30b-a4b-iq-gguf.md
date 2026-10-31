# maternion/Nemotron-3.5-Transcribe-30B-A4B-IQ-GGUF

## Resumen

Nemotron 3.5 Transcribe 30B A4B es un modelo de transcripción de voz (ASR) de pesos abiertos desarrollado por NVIDIA, del que este repositorio ofrece una conversión a formato GGUF cuantizada por el usuario maternion. El modelo base combina un decodificador de texto híbrido de tipo mezcla de expertos (nemotron_h_moe) con 30B de parámetros totales y unos 4,3B activos (incluido el codificador de audio), junto a un codificador de voz NeMo que incorpora también un modelo de diarización de hablantes.

Su propuesta de valor es la transcripción offline multilingüe (40 idiomas) de grabaciones de hasta una hora, con atribución de hablantes y control por prompt del estilo de la transcripción, en una ventana de contexto de 65.536 tokens. Es relevante porque cubre un nicho poco atendido: modelos ASR grandes, con diarización integrada y ejecutables localmente vía llama.cpp, sin depender de servicios en la nube.

Esta cuantización concreta destaca por añadir los tipos IQ2_NL e IQ3_NL, niveles de 2 y 3 bits que encajan nativamente con las dimensiones de matriz del modelo (no divisibles por 256), permitiendo ejecutarlo en GPUs de 16 GB con calidad razonable, algo que ni Q2_0 (demasiado agresivo) ni IQ4_NL (demasiado grande) conseguían.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Nemotron-H MoE (nemotron_h_moe, 53 bloques incluido bloque MTP/NextN) + codificador de audio NeMo ParallelExpertEncoder |
| Parametros totales | 32.913.266.240 (~33B) |
| Parametros activos | ~4,3B (incluido el codificador de audio) |
| Longitud de contexto | 65.536 tokens |
| Tipos de cuantizacion | Q8_0, IQ4_NL, IQ3_NL, IQ2_NL, Q2_0 (texto); mmproj en F16, BF16 y Q8_0 |
| Idiomas soportados | 40 idiomas, incluidos español, inglés, francés, alemán, italiano, portugués, holandés, ruso, japonés, coreano, chino, árabe, hindi y otros |
| Licencia | OpenMDW-1.1 (other) |
| Formato de pesos | GGUF (requiere archivo mmproj aparte para el codificador de audio) |

## Arquitectura y entrenamiento

El modelo base es NVIDIA-Nemotron-3.5-Transcribe-30B-A4B, un sistema de transcripción de voz y audio con dos componentes: un decodificador de texto con arquitectura nemotron_h_moe de 53 bloques (incluyendo un bloque MTP/NextN de predicción multi-token) y un codificador de audio NeMo ParallelExpertEncoder que agrupa un transformador ASR y un modelo de diarización de hablantes en streaming. El codificador de audio se exporta como archivo mmproj independiente, necesario junto a cualquier cuantización del texto para transcribir.

Sobre los datos de entrenamiento, tokens y técnicas de alineamiento (RLHF/DPO u otras), no se han publicado detalles en la información disponible; puede consultarse el informe técnico de NVIDIA enlazado al final. En cuanto a la cuantización, los archivos IQ4_NL, IQ3_NL e IQ2_NL usan la matriz de importancia publicada por AtomicChat (calibración de texto, 1,5M de tokens, sin `--process-output` y sin MTP/NextN). Los tipos IQ2_NL e IQ3_NL proceden del PR #27983 de llama.cpp y emplean bloques de 32 elementos, lo que evita el fallback silencioso a Q5_0/Q8_0 que sufren los K-quants con las dimensiones de fila de este modelo (2688, 1856 y 3712).

## Capacidades

- Transcripción de voz a texto offline en 40 idiomas, con grabaciones de hasta una hora de duración.
- Diarización de hablantes: atribución de intervenciones a hablantes concretos dentro de la transcripción.
- Control del estilo de transcripción mediante contexto en el prompt.
- Soporte de contexto largo (65.536 tokens) para transcripciones extensas.
- Ejecución local mediante llama.cpp (rama parcheada), sin dependencia de servicios externos.
- No soportado (según la información disponible): timestamps por palabra y transcripción en streaming en la implementación actual de llama.cpp.

## Casos de uso

- Transcripción de reuniones y videollamadas: puede procesar grabaciones de hasta una hora con diarización, identificando quién dijo qué en actas de equipo generadas localmente.
- Subtitulado y accesibilidad: genera transcripciones multilingües de contenido audiovisual para generar subtítulos o textos accesibles, con control del estilo vía prompt.
- Archivado de contenido audiovisual: medios y productoras pueden indexar entrevistas y programas en 40 idiomas sin subir el material a la nube, importante por privacidad y derechos.
- Investigación cualitativa y periodismo: transcripción de entrevistas largas con atribución de hablante, útil para análisis de corpus y verificación de citas.
- Procesamiento de call centers por lotes: análisis offline de grabaciones de atención al cliente en múltiples idiomas, con diarización agente/cliente.
- Entornos con requisitos de soberanía de datos: hospitales, administraciones o despachos que necesitan transcripción local de audio sensible, aprovechando la ejecución en GPU propia.
- Transcripción en hardware de consumo: gracias a IQ3_NL (~14,7 GB), cabe en GPUs de 16 GB de VRAM, democratizando el uso del modelo fuera de datacenters.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible, salvo un dato concreto del PR #31471 de llama.cpp: la cuantización IQ4_NL obtiene un WER de 1,02 en LibriSpeech test-clean, frente a 1,03 de Q8_0, lo que indica pérdida prácticamente nula respecto a la cuantización casi lossless. Para evaluaciones completas del modelo base, puede consultarse el informe técnico de NVIDIA.

## Requisitos de hardware

- VRAM estimada según cuantización (solo pesos de texto, sin mmproj): Q2_0 ~9,7 GB; IQ2_NL 10,68 GB; IQ3_NL 14,69 GB; IQ4_NL 18,73 GB; Q8_0 35 GB. Añadir 1,47 GB si el mmproj se carga en F16 (o 782 MB con mmproj Q8_0).
- GPU recomendadas: para Q8_0, GPUs de 40-48 GB o más (A100, A6000, RTX A6000); para IQ4_NL, GPUs de 24 GB (RTX 3090/4090); para IQ3_NL, GPUs de 16 GB (RTX 4060 Ti 16 GB, RTX 4080); IQ2_NL/IQ2_0 pueden ejecutarse incluso en GPUs de 12 GB o parcialmente en CPU.
- Cabe en GPU de consumo: sí, con IQ3_NL en 16 GB e IQ4_NL en 24 GB son las opciones recomendadas; Q8_0 requiere hardware profesional o descarga parcial a CPU.
- Despliegue: exclusivamente mediante una build de llama.cpp compilada desde la rama `nemo-transcribe-iq23nl` del fork de maternion, que combina los PR #31471 y #27983. Las builds oficiales de llama.cpp, Ollama y LM Studio no pueden ejecutar la parte de audio ni los archivos IQ2_NL/IQ3_NL todavía.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Diarizacion | Licencia |
|---|---|---|---|---|---|
| Nemotron 3.5 Transcribe 30B A4B (este) | 33B (4,3B activos, MoE) | 65.536 tokens | 40 | Sí | OpenMDW-1.1 |
| Whisper large-v3 (OpenAI) | 1,55B (denso) | 30 s por ventana | ~99 | No (requiere pyannote u otro) | MIT |
| Canary-1B-v2 (NVIDIA) | ~1B (denso) | no disponible | ~25 | No | CC-BY-4.0 |

Frente a Whisper large-v3, este modelo ofrece ventanas mucho más largas (hasta una hora frente a 30 segundos) y diarización integrada, a costa de requisitos de hardware muy superiores. Frente a Canary-1B-v2, cubre más idiomas y añade diarización, pero es considerablemente más pesado. No se dispone de comparativas de WER directas en la información proporcionada.

## Limitaciones y advertencias

- La transcripción con IQ2_NL/IQ3_NL y la ruta de audio requieren una build no oficial de llama.cpp (rama `nemo-transcribe-iq23nl`); las builds oficiales, Ollama y LM Studio no funcionan con estos archivos todavía.
- Los timestamps por palabra y la transcripción en streaming no están soportados en la implementación actual de llama.cpp (fuera del alcance del PR #31471).
- El archivo mmproj es obligatorio junto a cualquier cuantización de texto; las variantes BF16 y Q8_0 del mmproj son no estándar y deben verificarse antes de usarlas en producción.
- Q2_0 usa un formato block-max sin matriz de importancia, por lo que se espera pérdida de calidad apreciable sobre un decodificador denso BF16.
- Los K-quants (Q4_K_M, Q6_K, IQ4_XS, Q3_K_M/S) no son adecuados para este modelo: por las dimensiones de sus matrices, la mayoría de pesos harían fallback silencioso a Q5_0/Q8_0, inflando el tamaño real.
- Sesgos, tasa de alucinación y rendimiento por idioma: no disponible en la información proporcionada; consultar el informe técnico de NVIDIA.
- La licencia es OpenMDW-1.1 (other), no una licencia estándar tipo Apache/MIT; revisar sus términos antes de uso comercial.
- Repositorio de muy reciente creación con 0 descargas registradas: la madurez y el soporte comunitario son aún limitados.

## Enlaces

- Repositorio de la cuantización GGUF: https://huggingface.co/maternion/Nemotron-3.5-Transcribe-30B-A4B-IQ-GGUF
- Modelo base de NVIDIA: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Transcribe-30B-A4B
- Informe técnico de NVIDIA: https://research.nvidia.com/labs/nemotron/files/NVIDIA-Nemotron-3.5-Transcribe-Technical-Report.pdf
- PR de llama.cpp con soporte del modelo (mtmd y convertidor): https://github.com/ggml-org/llama.cpp/pull/31471
- PR de llama.cpp con tipos IQ2_NL/IQ3_NL: https://github.com/ggml-org/llama.cpp/pull/27983
- Fork de llama.cpp con la rama necesaria: https://github.com/maternion/llama.cpp/tree/nemo-transcribe-iq23nl
- Matriz de importancia de AtomicChat: https://huggingface.co/AtomicChat/NVIDIA-Nemotron-3.5-Transcribe-30B-A4B-GGUF/blob/main/NVIDIA-Nemotron-3.5-Transcribe-30B-A4B-imatrix.gguf
- Licencia OpenMDW-1.1: https://openmdw.ai/license/1-1/
