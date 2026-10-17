# luzhengsong/vxtools-models

## Resumen

`luzhengsong/vxtools-models` no es un modelo único, sino un paquete de 11 archivos de pesos y vocabularios (unos 3,53 GB según la model card; 3,8 GB de repositorio) que constituyen el conjunto completo de modelos locales que necesita el cliente de escritorio «速记纪要» (EN) de HiPangWork para funcionar sin conexión. El paquete encadena varias piezas: un Qwen3-4B cuantizado en GGUF Q4_K_M para generación de actas y esquemas, un sistema ASR Fun-ASR-Nano en ONNX int8 (encoder + adaptador + decoder LLM con vocabulario Qwen3-0.6B), un SenseVoice int8 para transcripción en tiempo real, un extractor de embeddings de hablante ERes2Net de 3D-Speaker para diarización y un módulo GTCRN de mejora de voz.

Su relevancia es práctica: demuestra un patrón de despliegue de IA de voz totalmente offline sobre `onnxruntime` + `llama.cpp`, sin dependencia de APIs remotas, empaquetando ASR, diarización, denoising y un LLM pequeño en menos de 4 GB de disco. El repositorio se declara explícitamente como espejo de redistribución de pesos de terceros, sin titularidad sobre los modelos, y su licencia es `other` (`mixed-third-party-model-licenses`).

Los metadatos del repositorio declaran 4.022.468.096 parámetros totales, cifra coherente con el componente principal Qwen3-4B. Es un repositorio recién creado, sin descargas ni valoraciones, por lo que no existe validación comunitaria ni resultados de evaluación publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Paquete multi-modelo: Qwen3-4B (transformer decoder-only) en GGUF; Fun-ASR-Nano (encoder de audio + adaptador + decoder LLM, ONNX int8); SenseVoice (encoder ASR no autorregresivo, ONNX int8); 3D-Speaker ERes2Net-Base (embeddings de hablante); GTCRN (mejora de voz) |
| Parametros totales | 4.022.468.096 (según metadatos del repositorio); el desglose por componente no está documentado |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (el repositorio no documenta la ventana de contexto de ninguno de los componentes) |
| Tipos de cuantizacion | GGUF Q4_K_M (Qwen3-4B); ONNX int8 (Fun-ASR-Nano, SenseVoice) |
| Idiomas soportados | No disponible a nivel de repositorio. El nombre del archivo upstream de SenseVoice indica chino, inglés, japonés, coreano y cantonés; Fun-ASR-Nano y Qwen3-4B no están documentados en la model card |
| Licencia | `other` — `mixed-third-party-model-licenses` (cada archivo se rige por la licencia de su modelo upstream) |
| Formato de pesos | GGUF (`.gguf`), ONNX (`.onnx`), más `tokenizer.json`, `vocab.json`, `merges.txt`, `tokens.txt` y `sha256sums.txt` |

## Arquitectura y entrenamiento

El repositorio no entrena nada: es una agregación de pesos ya entrenados, organizada por carpetas. `qwen-4b/Qwen3-4B-Q4_K_M.gguf` (2.381,6 MB) es una cuantización comunitaria de `Qwen/Qwen3-4B` pensada para `llama.cpp`, y se usa para el resumen de reuniones y la generación de esquemas de presentaciones. `funasr-nano/` contiene un pipeline ASR en tres piezas ONNX int8 (encoder + adaptador de 226,8 MB, embeddings de 148,4 MB y decoder LLM de 572,5 MB) más el vocabulario BPE de Qwen3-0.6B, lo que sugiere un decoder de tipo LLM acoplado a un encoder de audio, orientado a transcripción precisa de audio largo. `sense-voice/model.int8.onnx` (228,2 MB) es la exportación int8 de SenseVoiceSmall vía sherpa-onnx para transcripción de baja latencia.

El resto de componentes cubren tareas auxiliares: `speaker-embedding/3dspeaker_speech_eres2net_base_sv_zh-cn_3dspeaker_16k.onnx` (37,8 MB) genera embeddings de voz a 16 kHz para agrupar segmentos por hablante (diarización), y `speech-denoise/gtcrn_simple.onnx` (0,5 MB) aplica mejora de voz GTCRN antes o después del ASR. La model card no aporta datos de entrenamiento (número de tokens, composición del dataset, RLHF/DPO) de ninguno de los componentes, y remite a las model cards upstream para esos detalles.

## Capacidades

- Transcripción de audio largo a texto con Fun-ASR-Nano (pipeline encoder-adaptador-decoder en ONNX int8).
- Transcripción en tiempo real o de baja latencia con SenseVoice, con cobertura declarada de chino, inglés, japonés, coreano y cantonés (según el identificador del export upstream).
- Diarización de hablantes por embeddings de voz (ERes2Net de 3D-Speaker) y agrupación posterior de segmentos.
- Mejora de voz y reducción de ruido a 16 kHz con GTCRN, aplicable como preprocesado del ASR.
- Generación de texto en local con Qwen3-4B Q4_K_M: resumen de reuniones, actas y esquemas de presentaciones.
- Inferencia completamente offline: el paquete no requiere ninguna interfaz de IA remota en tiempo de ejecución.
- Distribución verificable: `sha256sums.txt` permite comprobar la integridad de los 11 archivos.
- No se documentan en la información disponible capacidades de tool calling, agentes, visión ni audio nativo del LLM.

## Casos de uso

- Actas de reuniones offline: el cliente graba la reunión, transcribe con Fun-ASR-Nano y pasa el texto a Qwen3-4B Q4_K_M para generar el resumen y los puntos de acción, todo en la máquina del usuario y sin enviar audio a la nube.
- Subtitulado y transcripción de baja latencia: SenseVoice int8 (228 MB) permite transcripción en streaming con un coste de cómputo bajo, adecuado para dictado o subtítulos en directo donde no se necesita el pipeline largo.
- Diarización de conversaciones multiparticipante: los embeddings de 3D-Speaker permiten agrupar segmentos por voz y etiquetar «hablante 1», «hablante 2», etc., lo que hace legible un acta con intervenciones atribuidas.
- Preprocesado en entornos ruidosos: GTCRN (0,5 MB) actúa como etapa de denoising antes del ASR en grabaciones de móvil, salas compartidas u oficinas, reduciendo errores de transcripción sin coste apreciable de VRAM.
- Aplicaciones de escritorio con requisito de privacidad: al empaquetar los 11 archivos en `data/models` y ejecutarlos con `onnxruntime` + `llama.cpp`, se puede distribuir un cliente que cumpla requisitos de residencia de datos (sanidad, legal, administración pública) sin DPA con terceros.
- Generación de esquemas y borradores a partir de transcripciones: Qwen3-4B recibe el texto transcrito y produce la estructura de una presentación o un índice de contenidos, un caso de uso de generación de texto corto que un modelo de 4B cuantizado a 4 bits puede asumir con latencia aceptable en GPU consumer.
- Procesado por lotes de archivos de audio en pipelines de datos: los ONNX int8 se pueden ejecutar en CPU con `onnxruntime`, lo que permite transcribir carpetas enteras de grabaciones en servidores sin GPU.
- Verificación de integridad en despliegues: el uso de `sha256sums.txt` encaja en un pipeline de empaquetado que valide los pesos antes de firmar el instalador del cliente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de WER, MMLU ni de ningún otro conjunto de evaluación para ninguno de los componentes, y los resultados de la búsqueda web no aportan datos técnicos sobre este repositorio.

## Requisitos de hardware

- Disco: 3,8 GB de repositorio; 3,53 GB de pesos según la model card. Conviene reservar espacio adicional para la caché de `huggingface_hub`.
- Qwen3-4B Q4_K_M (2.381,6 MB): cabe en GPUs consumer de 8 GB (RTX 3060 Ti, 4060 Ti, 3070) con margen para contexto moderado; en 6 GB (RTX 2060, 3060 laptop) requiere reducir la ventana de contexto. Ejecutable también en CPU con `llama.cpp`, con latencia mucho mayor.
- Fun-ASR-Nano int8 (unos 948 MB sumando encoder, adaptador, embeddings y decoder): pensado para CPU con `onnxruntime`; también puede acelerarse en GPU con los execution providers de ONNX Runtime (CUDA, DirectML, CoreML).
- SenseVoice int8 (228,2 MB), embeddings de hablante (37,8 MB) y GTCRN (0,5 MB): ejecutables en CPU sin problema, perfil propio de un cliente de escritorio.
- Opciones de despliegue: `onnxruntime` (librería declarada), `llama.cpp` para el GGUF, `sherpa-onnx` para el stack ASR/diarización/denoising, y Ollama si se quiere servir el GGUF como endpoint local. vLLM y TGI no aplican a este empaquetado ONNX/GGUF int8.
- Latencia y throughput: no disponible. No hay cifras de RTF ni de tokens/s publicadas.

## Comparativa con modelos similares

| Alternativa | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `luzhengsong/vxtools-models` | Paquete ASR + diarización + LLM (ONNX/GGUF) | 4.022.468.096 declarados (conjunto) | No disponible | `other` (licencias upstream mixtas) | HuggingFace, espejo de terceros |
| `Qwen/Qwen3-4B` (upstream) | LLM decoder-only | 4 B (coherente con los metadatos del paquete) | No disponible en la información proporcionada | No disponible en la información proporcionada | HuggingFace, oficial |
| `sherpa-onnx-sense-voice-zh-en-ja-ko-yue-int8-2024-07-17` (upstream) | ASR (SenseVoiceSmall int8) | No disponible | No aplica (modelo de audio) | No disponible en la información proporcionada | Release de k2-fsa/sherpa-onnx |
| 3D-Speaker `speech_eres2net_base_sv_zh-cn_3dspeaker_16k` (upstream) | Embeddings de hablante | No disponible | No aplica | No disponible en la información proporcionada | ModelScope / GitHub de 3D-Speaker |

La comparación relevante no es de rendimiento sino de empaquetado: este repositorio ahorra al integrador la tarea de localizar, convertir a int8 y verificar cada uno de los cinco componentes, a cambio de depender de un espejo no oficial y de asumir la revisión manual de las licencias upstream. No hay datos de benchmarks que permitan comparar calidad frente a las versiones originales sin cuantizar.

## Limitaciones y advertencias

- Es un espejo de redistribución: el autor no tiene derechos sobre los pesos y cada archivo se rige por la licencia de su modelo upstream (Apache-2.0, MIT, CC o similares, según el caso). La model card advierte explícitamente de que hay que revisar los términos de redistribución antes de publicar o comercializar.
- Trazabilidad incompleta: no se indica la licencia concreta de cada componente, solo la cadena de procedencia (ModelScope, releases de sherpa-onnx, Qwen).
- Repositorio sin validación comunitaria: 0 descargas, 0 likes, creado y actualizado el mismo día (2026-10-17 según los metadatos). No hay informes de terceros sobre su funcionamiento.
- Sin datos de entrenamiento ni evaluación: no hay WER, ni métricas de resumen, ni comparación con los modelos originales en precisión fp32.
- Cuantización agresiva: Q4_K_M en el LLM y int8 en el ASR implican pérdida de calidad frente a los pesos originales; el impacto no está cuantificado.
- Riesgo de alucinación en el componente generativo: Qwen3-4B es un modelo de 4B cuantizado a 4 bits; en resúmenes de reuniones largas puede inventar acuerdos, nombres o cifras, por lo que conviene mantener el texto transcrito como referencia auditable.
- Limitaciones de idioma: SenseVoice cubre cinco idiomas según el identificador upstream; el rendimiento en castellano no está documentado en este paquete, y el resto de componentes no declara cobertura lingüística.
- Diarización dependiente de la calidad del audio y del número de hablantes: los embeddings de 3D-Speaker son un extractor, no un sistema de diarización completo; el agrupamiento y la umbralización corren a cargo del integrador.
- Dependencia de la ruta: la estructura de directorios (`data/models`, `funasr-nano/`, `sense-voice/`, etc.) está pensada para un cliente concreto; reutilizarla en otro producto exige adaptar las rutas.
- Sin soporte declarado de tool calling ni de modo agente para el LLM incluido.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/luzhengsong/vxtools-models
- Modelo upstream del LLM: https://huggingface.co/Qwen/Qwen3-4B
- Repositorio de referencia para el stack ASR/diarización/denoising: https://github.com/k2-fsa/sherpa-onnx
- Origen citado en la model card (ModelScope): `lu18851615825/fuyuan_sherpa_onnx_funasr_nano_int8_2025_12_30_mirror` — https://modelscope.cn/models/lu18851615825/fuyuan_sherpa_onnx_funasr_nano_int8_2025_12_30_mirror
- Export upstream de SenseVoice citado: `sherpa-onnx-sense-voice-zh-en-ja-ko-yue-int8-2024-07-17` (release `speech-enhancement-models` de k2-fsa/sherpa-onnx)
- Embeddings de hablante upstream citados: 3D-Speaker `speech_eres2net_base_sv_zh-cn_3dspeaker_16k`
- No se han encontrado papers, blogs ni demos adicionales en la búsqueda web realizada.
