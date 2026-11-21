# mmahdi-sz/parakeet-tdt-1.1b-persian

## Resumen

Parakeet-TDT 1.1B Persian es un modelo de reconocimiento automático del habla (ASR) para farsi, desarrollado por el usuario de Hugging Face mmahdi-sz a partir del modelo base `nvidia/parakeet-tdt-1.1b` de NVIDIA. Emplea la arquitectura FastConformer (encoder) combinada con un decodificador Token-and-Duration Transducer (TDT), un esquema no autorregresivo que predice tanto el token como su duración, lo que elimina el bucle de decodificación autoregresiva típico de modelos como Whisper y reduce drásticamente las alucinaciones ante silencios, ruido o música de fondo.

El modelo se ha ajustado sobre aproximadamente 93 horas de audio en farsi, combinando voz de estudio de alta fidelidad y diálogo conversacional extraído y limpiado de películas. Incorpora un tokenizador SentencePiece propio de 1.024 piezas que preserva el Zero-Width Non-Joiner (ZWNJ) nativo del persa, un detalle relevante para la correcta tokenización de palabras compuestas y afijos.

Su interés práctico radica en el paquete de cuantización incluido: además de los pesos NeMo nativos, distribuye un paquete ONNX INT8 autónomo que funciona en CPU estándar con menos de 1,6 GB de RAM y latencia inferior al segundo, sin requerir Python, PyTorch ni CUDA. El repositorio incluye además una matriz de benchmarks sobre GPU Blackwell y CPU con AVX-512 VNNI.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastConformer (encoder) + Token-and-Duration Transducer (TDT, decoder) |
| Parametros totales | 1,1 B (heredados del modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP32, FP16, BF16, FP8, INT8, INT4, NVFP4; paquete ONNX INT8 |
| Idiomas soportados | farsi (fa) |
| Licencia | OpenMDW 1.1 |
| Formato de pesos | NeMo (.nemo), ONNX (INT8) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Parakeet-TDT de NVIDIA: un encoder FastConformer, variante eficiente del Conformer con atención por bloques y subsampling agresivo, acoplado a un decodificador Transducer que predice conjuntamente el token y su duración (Token-and-Duration Transducer). Este esquema permite saltos explícitos de duración y de token en blanco, lo que evita la generación de texto espurio en tramos sin habla y ofrece un factor de tiempo real muy alto en inferencia.

El ajuste se realizó en dos fases. La fase 1 ("Golden Studio") se entrenó sobre voz de estudio limpia y alcanza un 3,45 % de WER en habla limpia según la model card. La fase 2 incorpora diálogo conversacional de películas, con un total de 93 horas de audio, usando los conjuntos `mmahdi-sz/mana-tts-v2-persian`, `PerSets/filimo-persian-asr` y `google/fleurs` (este último presumiblemente para evaluación). No se detallan en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO (no aplicables de forma habitual en ASR). El tokenizador es un SentencePiece Unigram de 1.024 piezas entrenado específicamente para farsi, con el token #1 reservado al ZWNJ.

## Capacidades

- Reconocimiento de voz en farsi (farsi estándar) sobre audio de estudio y conversacional.
- Decodificación no autorregresiva con TDT, con inmunidad declarada a alucinaciones en silencios, ruido gaussiano y bucles de música de fondo.
- Preservación del ZWNJ en la salida, relevante para la ortografía correcta de compuestos y afijos persas.
- Inferencia en GPU con FP16, BF16, FP8, INT8, INT4 y NVFP4, y en CPU mediante ONNX INT8 con AVX-512 VNNI.
- Paquete ONNX autónomo ejecutable sin Python, PyTorch ni CUDA.
- No se documentan capacidades de traducción, diarización, timestamps por palabra ni detección de idioma.

## Casos de uso

- Subtitulado automático de contenido audiovisual en farsi: el modelo está ajustado específicamente sobre diálogo de películas (conjunto Filimo), por lo que maneja registro conversacional y solapamientos de habla mejor que un ASR genérico; el paquete ONNX INT8 permite procesar horas de vídeo en CPU sin GPU dedicada.
- Transcripción de reuniones y llamadas: la inmunidad a alucinaciones en silencios y ruido evita inserciones de texto fantasma en pausas, un problema frecuente en modelos autorregresivos como Whisper en audio de baja calidad.
- Atención al cliente y centros de contacto: el bajo coste de inferencia en CPU (menos de 1,6 GB de RAM) permite desplegar la transcripción en servidores sin acelerador, con latencia inferior al segundo por clip.
- Generación de corpus y datasets de voz en farsi: el modelo sirve para alinear y transcribir audio masivo destinado a entrenar otros sistemas (TTS, ASR, modelos de lenguaje) con el tokenizador ZWNJ-aware.
- Accesibilidad: subtitulado en tiempo casi real de retransmisiones o vídeos para usuarios sordos, apoyándose en el RTF de 317,7x en GPU Blackwell o de 16-21x en CPU con AVX-512.
- Búsqueda y análisis de archivos de audio: indexación de podcasts, archivos históricos o grabaciones judiciales en farsi mediante transcripción por lotes con el paquete ONNX.
- Integración en pipelines de vídeo bajo demanda: el paquete ONNX sin dependencias de CUDA simplifica el despliegue en contenedores ligeros o en el edge.

## Benchmarks y rendimiento

Matriz de cuantización en GPU (NVIDIA RTX PRO 6000 Blackwell, 96 GB, CUDA 13.2), 50 clips idénticos, 787,02 s de audio, N=30 ejecuciones por configuración:

| Formato | Tamano | Tiempo medio (s) | RTF medio | P95 latencia | VRAM pico | WER normalizado (%) | CER normalizado (%) |
|---|---|---|---|---|---|---|---|
| FP16 | 1,99 GB | 2,508 | 312,90x | 2,56 s | 2,88 GB | 116,96 | 87,82 |
| FP32 | 3,99 GB | 2,994 | 262,17x | 3,08 s | 5,74 GB | 116,88 | 87,79 |
| INT8 | 1,39 GB | 3,688 | 212,72x | 3,74 s | 3,14 GB | 116,96 | 87,81 |
| FP8 | 1,39 GB | 4,111 | 190,86x | 4,14 s | 3,14 GB | 117,11 | 87,84 |
| INT4 | 0,96 GB | 4,382 | 179,07x | 4,44 s | 3,14 GB | 116,09 | 87,56 |
| BF16 | 1,99 GB | 4,810 | 163,11x | 4,86 s | 2,88 GB | 116,80 | 87,81 |
| NVFP4 | 1,02 GB | 6,756 | 116,13x | 6,87 s | 2,76 GB | 117,11 | 88,10 |

Los valores de WER y CER normalizados superiores al 100 % y 87 % respectivamente no son comparables con un WER estándar: la model card no especifica la normalización aplicada, por lo que deben interpretarse únicamente como referencia interna entre cuantizaciones. La model card declara además un 3,45 % de WER en habla limpia para el modelo de fase 1 y una comparación frente a Whisper-Large-v3 en los ficheros `benchmark_formal_fleurs.json` y `benchmark_conversational_filimo.json`, cuyos valores numéricos no se incluyen en la información disponible. En CPU (AMD EPYC Genoa con AVX-512 VNNI) el RTF declarado es de 16,35x a 21,52x.

## Requisitos de hardware

- VRAM en GPU: 2,76 GB (NVFP4) a 5,74 GB (FP32) de pico según la matriz de benchmarks; el paquete FP16 ocupa 2,88 GB.
- GPU recomendadas: NVIDIA RTX PRO 6000 Blackwell (medido), cualquier GPU con soporte CUDA 13.x; para FP8 y NVFP4 se requiere hardware Blackwell.
- GPU de consumo: cabe holgadamente en cualquier GPU con 6 GB o más de VRAM (RTX 3060, RTX 4060, RTX 4090); no se han publicado medidas específicas en estas tarjetas.
- CPU: el paquete ONNX INT8 funciona con menos de 1,6 GB de RAM y requiere AVX-512 VNNI para el rendimiento declarado (16-21x RTF en EPYC Genoa).
- Despliegue: NeMo (librería nativa), ONNX Runtime para el paquete INT8; no se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI (no aplicables a ASR).
- Throughput: RTF de 312,90x en FP16 sobre Blackwell; 212,72x en INT8.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Parakeet-TDT 1.1B Persian | 1,1 B | no disponible | fa | OpenMDW 1.1 | NeMo, ONNX | Ajuste específico farsi, paquete INT8 CPU |
| nvidia/parakeet-tdt-1.1b | 1,1 B | no disponible | en (principal) | no disponible en la informacion | NeMo | Modelo base; sin ajuste a farsi |
| Whisper-Large-v3 | 1,55 B | 30 s (ventana) | multilingüe | MIT (según el proyecto OpenAI) | safetensors, GGUF, etc. | Autorregresivo; propenso a alucinaciones en silencio; comparado en los benchmarks del autor |
| Whisper-Large-v3-turbo | 0,81 B | 30 s | multilingüe | MIT | safetensors, GGUF | Variante destilada, menor coste, cobertura farsi limitada |

## Limitaciones y advertencias

- Solo soporta farsi; no se ha validado en otros idiomas ni en code-switching farsi-inglés.
- Los valores de WER/CER normalizados de la matriz de cuantización no son directamente interpretables; el 3,45 % de WER corresponde únicamente a habla limpia de estudio y no al conjunto conversacional.
- El modelo se ha ajustado sobre datos de estudio y diálogo de películas; el rendimiento en acentos regionales, habla infantil, audio telefónico de banda estrecha o ruido industrial no está documentado.
- La licencia OpenMDW 1.1 debe revisarse antes de uso comercial; la model card no aclara restricciones adicionales derivadas del modelo base de NVIDIA.
- El repositorio ocupa 120,6 GB, lo que incluye pesos en múltiples formatos y artefactos de benchmark; conviene descargar solo el subdirectorio necesario.
- El paquete ONNX INT8 depende de AVX-512 VNNI para el rendimiento declarado; en CPU sin esa extensión el throughput será considerablemente menor (no cuantificado en la información disponible).
- No se documentan sesgos demográficos ni evaluación de equidad; al ser un ajuste sobre corpus limitado (93 h), puede presentar peor precisión en vocabulario técnico, nombres propios o variantes dialectales.
- La fecha de creación del repositorio (2026-11-03) y el escaso número de descargas (996) y likes (1) sugieren un modelo reciente y poco validado por la comunidad; conviene evaluarlo en el dominio propio antes de producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mmahdi-sz/parakeet-tdt-1.1b-persian
- Documentación en farsi: https://huggingface.co/mmahdi-sz/parakeet-tdt-1.1b-persian/blob/main/README_FA.md
- Modelo base: https://huggingface.co/nvidia/parakeet-tdt-1.1b
- Licencia OpenMDW 1.1: https://openmdw.ai/license/1-1/
- Dataset de estudio: https://huggingface.co/datasets/mmahdi-sz/mana-tts-v2-persian
- Dataset conversacional: https://huggingface.co/datasets/PerSets/filimo-persian-asr
- Dataset de evaluación: https://huggingface.co/datasets/google/fleurs
