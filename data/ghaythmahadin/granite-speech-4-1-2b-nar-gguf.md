# GhaythMahadin/granite-speech-4.1-2b-nar-gguf

## Resumen

Granite-speech-4.1-2b-nar es un modelo de reconocimiento automático del habla (ASR) no autorregresivo desarrollado originalmente por IBM Research dentro de la familia Granite Speech 4.1. A diferencia de los modelos ASR convencionales que generan tokens de forma secuencial, este modelo reformula la transcripción como una tarea de edición condicional: parte de una hipótesis CTC y la refina en una única pasada hacia delante mediante un LLM bidireccional. La versión aquí descrita es una conversión a formato GGUF realizada por GhaythMahadin para su uso con el runtime transcribe.cpp.

El modelo combina un codificador de audio Conformer (compartido con la familia autorregresiva Granite-Speech), un proyector MLP con atención y el LLM Granite-4.0-1b utilizado como editor bidireccional (máscara causal desactivada). Con 2.254.656.316 parámetros totales, ofrece transcripción multilingüe offline en inglés, francés, alemán, español y portugués. Su principal atractivo es la eficiencia: al eliminar el bucle token a token, reduce la latencia manteniendo una precisión competitiva (1,29 % WER en LibriSpeech test-clean).

La relevancia actual radica en su idoneidad para despliegues en hardware modesto: las cuantizaciones GGUF van desde 4,20 GB (BF16) hasta 1,45 GB (Q4_K_M), lo que permite ejecución en CPU, Metal o Vulkan con factores de tiempo real (RTF) muy favorables. La licencia Apache-2.0 facilita su adopción comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | NLE (Non-autoregressive LLM-based Editing): codificador Conformer + proyector MLP con atención + LLM Granite-4.0-1b bidireccional + decodificación CTC |
| Parametros totales | 2.254.656.316 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16, F16, Q8_0, Q6_K, Q5_K_M, Q4_K_M |
| Idiomas soportados | en, fr, de, es, pt |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (runtime transcribe.cpp); pesos originales del modelo base en safetensors |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura NLE (Non-autoregressive LLM-based Editing) descrita en el paper arXiv:2603.08397. El flujo de inferencia consta de tres etapas: (1) un codificador de audio Conformer, idéntico al de la familia autorregresiva Granite-Speech, extrae representaciones acústicas; (2) un proyector MLP con atención las alinea con el espacio del LLM; (3) el LLM Granite-4.0-1b, operando con máscara bidireccional (sin máscara causal), edita una hipótesis CTC inicial en una sola pasada hacia delante. La salida son logits sobre la transcripción completa, y la decodificación CTC produce el texto final. No existe bucle token a token, lo que constituye la innovación principal frente a los modelos ASR autorregresivos.

No se dispone de información detallada sobre el volumen de datos de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en la información proporcionada. La model card original referencia el paper NLE como fuente de la arquitectura, pero no detalla las recetas de entrenamiento. El modelo base fue portado desde el commit 99a4df9 de ibm-granite/granite-speech-4.1-2b-nar (fijado el 2026-05-24) y validado contra la referencia de Transformers en transcribe.cpp commit c53af2c.

## Capacidades

- Transcripción de voz a texto offline en una sola pasada no autorregresiva (sin bucle token a token).
- Reconocimiento multilingüe: inglés, francés, alemán, español y portugués.
- Entrada de audio: WAV mono a 16 kHz.
- Salida: transcripción de texto (sin puntuación ni mayúsculas garantizadas, a diferencia de la variante autorregresiva).
- Decodificación CTC sobre logits generados por el editor bidireccional.
- No soporta traducción (translate: false).
- No soporta detección de idioma (lang_detect: false).
- No soporta streaming (streaming: false).
- No genera marcas de tiempo (timestamps: none).
- No soporta tool calling ni function calling (es un modelo ASR, no un LLM conversacional).
- No soporta agentes ni razonamiento multi-paso.
- No dispone de modo thinking, visión ni audio generativo.

## Casos de uso

- Transcripción de reuniones y notas de voz: el modelo procesa audio de 16 kHz mono en una sola pasada, lo que reduce la latencia en comparación con modelos autorregresivos. Adecuado para entornos donde la precisión es suficiente y la velocidad es prioritaria.
- Subtitulado offline de contenido audiovisual en cinco idiomas europeos: se puede integrar en pipelines de postproducción que conviertan pistas de audio a WAV mono 16 kHz con ffmpeg y luego invoquen transcribe-cli.
- Despliegue en dispositivos de borde (edge computing): las cuantizaciones Q4_K_M (1,45 GB) y Q5_K_M (1,66 GB) permiten ejecución en CPU o GPU integrada con RTF de 1,5 en Ryzen 4750U (CPU) y 3,65 (Vulkan), lo que posibilita transcripción en tiempo real o superior en hardware de consumo.
- Procesamiento por lotes de archivos de audio en servidores sin GPU dedicada: con RTF de 5 en CPU de Apple M4 y 1,5 en Ryzen 4750U, se pueden transcribir horas de audio en minutos usando únicamente CPU.
- Aplicaciones de accesibilidad: transcripción de conversaciones presenciales o grabaciones para personas con discapacidad auditiva, ejecutándose localmente sin dependencia de servicios en la nube.
- Investigación en ASR no autorregresivo: el modelo sirve como referencia reproducible para estudiar la arquitectura NLE y comparar el rendimiento de la edición CTC frente a la decodificación autorregresiva.
- Integración en herramientas de escritorio (por ejemplo, dictado por voz): el tamaño reducido de las cuantizaciones y el soporte de Metal en Apple Silicon (RTF 18 en M4) permiten su inclusión en aplicaciones nativas.

## Benchmarks y rendimiento

| Benchmark | BF16 | F16 | Q8_0 | Q6_K | Q5_K_M | Q4_K_M |
|---|---|---|---|---|---|---|
| WER LibriSpeech test-clean (%) | 1,29 | 1,29 | 1,29 | 1,29 | 1,25 | 1,35 |

| Plataforma | Acelerador | RTF (M4 Max) | RTF (M4) | RTF (Ryzen 4750U) |
|---|---|---|---|---|
| Apple Silicon | Metal | 56 | 18 | no disponible |
| CPU | CPU | 5 | 4 | 1,5 |
| AMD Ryzen | Vulkan | no disponible | no disponible | 3,65 |

El WER se midió sobre la partición completa de LibriSpeech test-clean (2620 enunciados) con el normalizador de texto EnglishTextNormalizer de Whisper, el mismo que usa Open ASR Leaderboard. La referencia BF16 con transformers (model.transcribe, MPS) fue de 1,28 %, coincidiendo con el 1,29 % de la model card original dentro del ruido de muestreo. No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible, dado que se trata de un modelo ASR.

## Requisitos de hardware

- VRAM estimada para inferencia: entre 1,45 GB (Q4_K_M) y 4,21 GB (F16), incluyendo pesos; el consumo real de memoria dependerá del tamaño del audio de entrada y del búfer del decodificador CTC.
- GPU recomendadas: no se especifican modelos concretos de GPU en la información disponible; el modelo se ha validado en Apple Silicon (M4, M4 Max) con Metal y en AMD Ryzen 4750U con Vulkan.
- Cabe en GPU de consumo: sí, las cuantizaciones Q4_K_M (1,45 GB) y Q5_K_M (1,66 GB) caben holgadamente en GPUs con 4 GB o más de VRAM; la versión F16 (4,21 GB) requiere al menos 6 GB.
- Opciones de despliegue: transcribe.cpp (runtime nativo con soporte CLI); no se mencionan vLLM, llama.cpp, Ollama ni TGI en la información disponible.
- Latencia y throughput: RTF de 56 en M4 Max con Metal, 18 en M4 con Metal, 5 en M4 con CPU, 4 en M4 con CPU, 3,65 en Ryzen 4750U con Vulkan y 1,5 en Ryzen 4750U con CPU. Un RTF superior a 1 indica procesamiento más rápido que el tiempo real.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | WER LibriSpeech test-clean | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| granite-speech-4.1-2b-nar (este) | 2,25 B | no disponible | 1,29 % | Apache-2.0 | GGUF | No autorregresivo, sin puntuación ni timestamps |
| granite-speech-4.1-2b | no disponible | no disponible | no disponible | Apache-2.0 | no disponible | Autorregresivo, mayor precisión, soporta AST, keyword-biased y japonés |
| granite-speech-4.1-2b-plus | no disponible | no disponible | no disponible | no disponible | no disponible | Añade información de hablante y timestamps por palabra |
| Whisper large-v3 | 1,55 B | 30 s (ventana) | ~1,8 % (referencia pública) | MIT | safetensors, GGUF | Autorregresivo, multilingüe amplio, soporta timestamps |

La comparativa con Whisper large-v3 se incluye como referencia de la categoría, aunque los datos de WER de Whisper no provienen de la información proporcionada y pueden variar según la normalización. Los datos de las variantes granite-speech-4.1-2b y plus no están disponibles en la información proporcionada más allá de las notas cualitativas de la model card.

## Limitaciones y advertencias

- No genera puntuación ni mayúsculas de forma fiable; la variante autorregresiva granite-speech-4.1-2b está indicada para aplicaciones donde la precisión y el formato sean prioritarios.
- No soporta marcas de tiempo, detección de idioma ni traducción.
- No soporta streaming; el audio debe procesarse completo en una sola pasada.
- La entrada debe ser WAV mono a 16 kHz; es necesario convertir otros formatos con ffmpeg antes de la inferencia.
- Riesgo de alucinación inherente a los modelos de lenguaje: el editor bidireccional podría introducir texto no presente en el audio en condiciones acústicas adversas, aunque la decodificación CTC mitiga parcialmente este riesgo.
- Sesgos conocidos: no se documentan sesgos específicos en la información disponible; como modelo entrenado predominantemente con datos en inglés y lenguas europeas, el rendimiento en variedades dialectales o acentos no representados puede degradarse.
- Limitaciones de idioma: solo cinco idiomas (en, fr, de, es, pt); no cubre otras lenguas.
- Restricciones de licencia: Apache-2.0 permite uso comercial, modificación y redistribución, siempre que se conserve el aviso de licencia y la atribución correspondiente.
- Caveat para producción: el modelo se distribuye como conversión GGUF no oficial (repo de GhaythMahadin, 0 descargas y 0 likes en el momento de la consulta); para producción se recomienda validar contra la referencia oficial de IBM y considerar el modelo base en safetensors si se requiere la máxima fidelidad numérica.
- El runtime transcribe.cpp está en desarrollo activo; la validación se realizó en un commit concreto (c53af2c) y puede requerir actualizaciones.

## Enlaces

- Repositorio Hugging Face (GGUF): https://huggingface.co/GhaythMahadin/granite-speech-4.1-2b-nar-gguf
- Modelo base en Hugging Face: https://huggingface.co/ibm-granite/granite-speech-4.1-2b-nar
- Commit del modelo base utilizado: https://huggingface.co/ibm-granite/granite-speech-4.1-2b-nar/commit/99a4df9
- Repositorio transcribe.cpp: https://github.com/handy-computer/transcribe.cpp
- Commit de validación de transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/tree/c53af2c
- Documentación del modelo en transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/blob/main/docs/models/granite-speech-4.1-2b-nar.md
- Paper de la arquitectura NLE: https://arxiv.org/abs/2603.08397
- Variante autorregresiva granite-speech-4.1-2b: https://huggingface.co/ibm-granite/granite-speech-4.1-2b
- Referencias adicionales citadas en los tags (arXiv): 2505.08699, 2603.11243, 2604.12398, 2604.22817, 2604.11269
