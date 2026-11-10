# Phsoft-ai/Notesoop-STT-Ko-v2

## Resumen

Notesoop-STT-Ko-v2 es un modelo de reconocimiento automático del habla (ASR) especializado en coreano, desarrollado por Phsoft-ai (bajo la marca Notesoop) como evolución de su predecesor Notesoop-STT-Ko-v1. El modelo resuelve el problema de la transcripción de voz en coreano en dispositivos de recursos limitados, priorizando la eficiencia energética y de memoria sobre la precisión absoluta de los grandes modelos generativos. Su propuesta diferencial es una arquitectura no autorregresiva de un solo paso que combina un codificador de audio congelado (EmbeddingGemma-2) con un lector acústico Conformer ligero y un decodificador CTC con beam search nativo en C++ y un modelo de lenguaje KenLM de 5-gramas.

La relevancia actual del modelo radica en su enfoque *on-device*: con solo 34,8M de parámetros entrenables y un consumo de memoria de aproximadamente 1,3-1,4 GB, es capaz de transcribir audio a velocidades de hasta 42,2x en tiempo real sobre Apple Silicon (MPS), lo que lo hace viable en portátiles de gama básica y entornos móviles. Frente a aproximaciones generativas como Whisper, el modelo sacrifica flexibilidad multitarea a cambio de latencia muy baja y huella de memoria reducida, un compromiso relevante para aplicaciones de productividad y toma de notas.

El modelo se entrenó sobre un corpus de 530 GB de audio en coreano (300 GB de clases magistrales y 230 GB de conversación libre), lo que amplía su cobertura desde el dominio académico de la v1 hacia habla espontánea, entrevistas y reuniones. La licencia Apache-2.0 y la publicación de los pesos y del motor de inferencia facilitan su integración comercial y su auditoría técnica.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Híbrida no autorregresiva: backbone de audio congelado EmbeddingGemma-2 + lector Conformer + cabeza CTC con coseno esférico + beam search C++17 + KenLM 5-gramas |
| Parámetros totales | 34,8M entrenables (34.808.195); backbone congelado de 576,6M adicionales |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (procesa audio por fragmentos con solapamiento y deduplicación) |
| Tipos de cuantización | No disponible (se distribuye checkpoint en PyTorch; inferencia en bfloat16 sobre MPS/CUDA) |
| Idiomas soportados | Coreano (ko) |
| Licencia | Apache-2.0 |
| Formato de pesos | PyTorch (`checkpoints/NoteSoop_stt_v2_best.pt`, 133 MB) |

## Arquitectura y entrenamiento

El modelo sigue un diseño no autorregresivo de un solo paso. La señal de audio se convierte en log-Mel de 128 bins (ventana de 20 ms, salto de 10 ms) a 16 kHz mono y se pasa por el backbone congelado `google/embeddinggemma-2`, del que se extraen representaciones MRL de 256 dimensiones normalizadas L2. Sobre esas representaciones actúa un lector Conformer ligero de 10 capas (d=384, 6 cabezas de atención, kernel de convolución 15) con 34,3M de parámetros, seguido de una cabeza CTC con coseno esférico y vocabulario BPE de 2.048 tokens (SentencePiece). La decodificación combina un beam search CTC nativo en C++17 con rolling-hash (menos de 1 ms por fragmento, con fallback en Python) y un modelo de lenguaje KenLM de 5-gramas entrenado sobre 3,2 millones de frases (80,2 MB). El pipeline incorpora deduplicación por solapamiento para producir transcripciones limpias.

El entrenamiento se realizó sobre un corpus de 530 GB de audio en coreano: 300 GB de clases magistrales (AI Hub) y 230 GB de conversación libre. La model card menciona un motor de entrenamiento propio con shaders Metal de Apple y un pipeline de streaming "Zero-Disk" para procesar el corpus sin almacenamiento intermedio, así como un informe técnico (`TECHNICAL_REPORT_v2.md`) con el análisis matemático. No se detalla en la información disponible la composición exacta del dataset, el número de tokens de audio ni si se aplicaron técnicas de RLHF o DPO (no aplicables de forma estándar en un sistema CTC).

## Capacidades

- Reconocimiento automático del habla en coreano para audio de 16 kHz mono.
- Transcripción de clases magistrales, presentaciones académicas, conversación espontánea, entrevistas y reuniones.
- Decodificación CTC no autorregresiva con beam search y rescoring mediante KenLM de 5-gramas.
- Inferencia en Apple Silicon (PyTorch MPS en bfloat16), NVIDIA CUDA (bfloat16) y CPU multinúcleo.
- Motor de beam search nativo en C++17 con builds para macOS, Linux y Windows, y fallback en Python.
- Procesamiento de audio largo mediante fragmentación con solapamiento y deduplicación.
- No se documenta soporte de tool calling, function calling, agentes, visión ni audio más allá del ASR.
- No se documenta un modo de razonamiento (*thinking mode*) ni capacidades multimodales.

## Casos de uso

- Toma de notas en clases y conferencias: el modelo transcribe audio largo en coreano a velocidades muy superiores al tiempo real (hasta 42,2x en M1 Pro), lo que permite generar actas o apuntes al finalizar la sesión sin esperas prolongadas.
- Aplicaciones móviles de productividad: con un consumo de 1,3-1,4 GB de RAM/VRAM, puede integrarse en apps de iOS y Android (Notesoop publica versiones en App Store y Google Play) para dictado y transcripción sin depender de la nube.
- Entrevistas y reuniones: el entrenamiento sobre 230 GB de conversación libre amplía la cobertura a habla espontánea, con KenLM que corrige secuencias plausibles en coreano coloquial.
- Subtitulado y accesibilidad: la baja latencia (RTF 0,0237) permite generar subtítulos casi en tiempo real en equipos de gama básica con 8-16 GB de RAM.
- Transcripción por lotes en servidores con CUDA: el soporte de bfloat16 en GPU NVIDIA permite procesar archivos de audio en pipelines de backend con throughput alto y huella de memoria reducida.
- Investigación en ASR eficiente: al publicarse pesos, motor de decodificación y arquitectura bajo Apache-2.0, sirve como base reproducible para experimentos con CTC, Conformer y decodificación con KenLM en coreano.
- Archivado y búsqueda de contenido audiovisual: la transcripción rápida de grandes volúmenes de audio coreano facilita indexación y búsqueda textual en bibliotecas de vídeo o pódcast.

## Benchmarks y rendimiento

Resultados publicados en la model card (medidos en Apple M1 Pro de 16 GB con PyTorch MPS):

| Benchmark | Métrica | Notesoop-STT-Ko-v2 | Referencia |
|---|---|---|---|
| Zeroth-Korean | CER | 10,47 % | 15,88 % (v1) |
| Zeroth-Korean | WER | 35,07 % | 45,28 % (v1) |
| Zeroth-Korean | Velocidad de inferencia | 28,5x | 20,3x (v1) |
| Zeroth-Korean | RAM del host | 1.405 MB | 2.639 MB (v1) |
| Prueba de campo (clase de 41 min 43 s) | Tiempo de proceso | 59,3 s (42,2x, RTF 0,0237) | Whisper-large-v3: 11,9x más lento |
| Prueba de campo (clase de 41 min 43 s) | CER | 21,19 % | Whisper-large-v3: 4,36 pp peor |
| Prueba de campo (clase de 41 min 43 s) | VRAM | 1,4 GB | Whisper-large-v3: 4,5x más |

No se han publicado en la información disponible resultados comparativos en otros benchmarks estándar (MMLU, HumanEval, GSM8K u otros), que además no aplican a un modelo ASR.

## Requisitos de hardware

- VRAM/RAM estimada: aproximadamente 1,3-1,4 GB para inferencia (dato de la model card).
- GPU recomendadas: Apple Silicon con MPS (medido en M1 Pro de 16 GB); GPU NVIDIA con CUDA en bfloat16; CPU multinúcleo como alternativa.
- Compatibilidad con GPU de consumo: sí, por su huella de memoria cabe en equipos con 8 GB de RAM unificada (MacBook básico) y en GPU de consumo con al menos 2 GB de VRAM libre.
- Opciones de despliegue: PyTorch con backend MPS, CUDA o CPU; motor de beam search C++17 con builds para macOS, Linux y Windows y fallback en Python; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (el modelo no es un LLM generativo).
- Latencia y throughput: RTF de 0,0237 y 42,2x de velocidad en tiempo real sobre M1 Pro en la prueba de campo; 28,5x en Zeroth-Korean; beam search nativo por debajo de 1 ms por fragmento.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto/audio | Idiomas | Licencia | Enfoque |
|---|---|---|---|---|---|
| Notesoop-STT-Ko-v2 | 34,8M entrenables + 576,6M congelados | Fragmentos con solapamiento; no especificado | Coreano | Apache-2.0 | ASR no autorregresivo on-device |
| Whisper-large-v3 | No disponible en la información proporcionada | No disponible en la información proporcionada | Multilingüe | No disponible en la información proporcionada | ASR generativo (referencia citada en la model card) |
| Notesoop-STT-Ko-v1 | No disponible en la información proporcionada | No disponible | Coreano | No disponible en la información proporcionada | ASR on-device especializado en clases |

La comparación con Whisper-large-v3 se limita a los datos de la prueba de campo publicados por el autor (velocidad, CER y VRAM); no se dispone de especificaciones completas de Whisper en la información proporcionada. No se han identificado otros modelos comparables en la información disponible.

## Limitaciones y advertencias

- El modelo solo soporta coreano; no se documenta cobertura multilingüe.
- El CER en la prueba de campo real es del 21,19 %, sensiblemente superior al 10,47 % de Zeroth-Korean, lo que indica degradación en audio no controlado.
- El WER en Zeroth-Korean es del 35,07 %, un valor alto que refleja dificultades con la segmentación de palabras en coreano y limita su uso en tareas que exijan alineación estricta por palabra.
- Al ser un sistema CTC con KenLM de 5-gramas, no dispone de razonamiento generativo ni de corrección contextual profunda; puede producir errores sistemáticos en nombres propios, terminología técnica y neologismos.
- No se documentan análisis de sesgos por género, acento, edad o dialecto; el corpus de entrenamiento (clases y conversación) puede infrarepresentar variedades regionales.
- Riesgo de alucinación limitado en comparación con modelos generativos, pero el rescoring KenLM puede introducir sustituciones plausibles no presentes en el audio.
- La licencia Apache-2.0 permite uso comercial, pero el backbone `google/embeddinggemma-2` congelado puede estar sujeto a sus propios términos; conviene verificar la licencia de ese componente antes de un despliegue comercial.
- El rendimiento medido corresponde a Apple M1 Pro; no se publican cifras de latencia para CUDA o CPU más allá de la disponibilidad de backend.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validación comunitaria independiente de los resultados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phsoft-ai/Notesoop-STT-Ko-v2
- Informe técnico: `TECHNICAL_REPORT_v2.md` (referenciado en la model card, dentro del repositorio)
- App Store (Notesoop): https://apps.apple.com/kr/app/notesoop/id6760303593
- Google Play (Notesoop): https://play.google.com/store/apps/details?id=com.phsoft.notesoop
