# fihriaLab/fihrIA-ASR-1.7B

## Resumen

fihrIA-ASR-1.7B es un modelo de reconocimiento automático del habla (ASR) de pesos abiertos especializado en dariya, el árabe dialectal marroquí. Lo desarrolla fihriaLab como parte de una familia de dos tamaños (0.6B y 1.7B) construida sobre Qwen3-ASR de Alibaba. Este repositorio contiene los pesos BF16 sin cuantizar, la variante de mayor precisión de la familia, pensada para despliegue en GPU.

El modelo aborda un problema concreto y poco cubierto: la transcripción fiable de habla dariya con cambio de código natural (code-switching) entre árabe marroquí, francés e inglés, con salida directa en escritura árabe. Emplea un tokenizador compartido de 89.000 tokens específico para dariya y se distribuye con licencia Apache 2.0, lo que permite uso comercial sin restricciones adicionales.

Su relevancia actual radica en que sitúa el estado del arte entre los modelos ASR de dariya de pesos abiertos: alcanza un 6,1 % de SER medio en retenido, frente al 8,4 % de Voxtral Mini 4B de Mistral y el 11,2 % de MoulSot 1.7B, y lo hace con un coste computacional muy inferior (243× tiempo real en una H100 frente a 34× de Voxtral).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | qwen3_asr (encoder de audio + proyector multimodal + modelo de lenguaje), registrada en transformers |
| Parámetros totales | 1.909.159.552 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | BF16 (este repo); Q4_K_M disponible en el repo GGUF |
| Idiomas soportados | ar, ary (dariya); cambio de código con francés e inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16); GGUF en repositorio separado |

## Arquitectura y entrenamiento

El modelo es un fine-tuning de Qwen/Qwen3-ASR-1.7B, un sistema ASR multimodal compuesto por un encoder de audio, un proyector multimodal que alinea las representaciones acústicas con el espacio del modelo de lenguaje y un decodificador de lenguaje. La arquitectura `qwen3_asr` se registra en transformers al importar la librería `qwen-asr`, que ofrece backends tanto para transformers como para vLLM. Los pesos BF16 ocupan 3,82 GB e incluyen los tres componentes.

El entrenamiento se realizó con un tokenizador compartido de 89.000 tokens específico para dariya, común a toda la familia de modelos. La model card no detalla el volumen de datos de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. La evaluación se llevó a cabo bajo un protocolo unificado con 508 clips retenidos y cuatro jueces LLM independientes, midiendo SER (semantic error rate) y CER sobre los conjuntos DarijaCS Prism y Probe.

## Capacidades

- Transcripción de voz a texto en dariya con salida nativa en escritura árabe, optimizada para las estructuras lingüísticas locales.
- Manejo robusto de code-switching: transcribe con precisión frases mixtas que incorporan palabras en francés e inglés dentro del habla dariya.
- Procesamiento de audio a 16 kHz mono (según el clip de ejemplo incluido).
- Inferencia por lotes (batching) mediante el backend vLLM de `qwen-asr`.
- Despliegue en GPU con transformers o vLLM; despliegue en CPU mediante la build GGUF con llama.cpp.
- No se documentan en la información disponible capacidades de traducción, diarización de hablantes, timestamps por palabra ni tool calling.

## Casos de uso

- Subtitulado y transcripción de contenido audiovisual marroquí: el modelo transcribe directamente en escritura árabe diálogos con mezcla de francés e inglés, habitual en medios y redes sociales de Marruecos, sin necesidad de un paso de normalización posterior.
- Atención al cliente por voz: integrado en un pipeline de telefonía o chat de voz, permite transcribir consultas de usuarios en dariya para su posterior procesamiento por un LLM o un sistema de tickets, con la ventaja de un throughput de 243× tiempo real en H100 que absorbe picos de concurrencia.
- Generación de actas y notas de reuniones: transcripción de reuniones internas donde los participantes alternan dariya, francés e inglés, aprovechando la robustez frente a code-switching.
- Accesibilidad y dictado: conversión de voz a texto para usuarios marroquíes que se expresan en dariya, con despliegue en servidor GPU o, en la variante 0.6B, en CPU de portátil.
- Investigación lingüística y creación de corpus: generación de transcripciones a escala para construir datasets anotados de dariya, con un CER de 6,24 % en Prism y 8,71 % en Probe en BF16 que reduce la carga de corrección manual.
- Moderación y análisis de contenido de audio: transcripción masiva de audio generado por usuarios para clasificación y moderación, apoyándose en el batching de vLLM para procesar grandes volúmenes en una sola GPU.
- Sistemas de voz conversacionales (voice agents): como etapa ASR de un agente de voz en dariya, con latencia compatible con interacción en tiempo real gracias al alto throughput en GPU.

## Benchmarks y rendimiento

Datos publicados en la model card. SER y CER: menor es mejor; throughput: mayor es mejor.

| Métrica | fihrIA-ASR 0.6B | fihrIA-ASR 1.7B | Mistral Voxtral Mini 4B | MoulSot 1.7B |
|---|---|---|---|---|
| SER medio en retenido ↓ | 7,1 % | 6,1 % | 8,4 % | 11,2 % |
| DarijaCS CER Prism / Probe (BF16) ↓ | 7,98 / 9,80 % | 6,24 / 8,71 % | 6,68 / 9,69 % | 10,27 / 14,93 % |
| DarijaCS CER Prism / Probe (Q4) ↓ | 7,98 / 9,84 % | 6,54 / 9,23 % | no disponible | no disponible |
| Throughput en H100 ↑ | 255× tiempo real | 243× tiempo real | 34× tiempo real | 147× tiempo real |
| CPU de portátil, Q4 ↑ | 5,98× tiempo real | no disponible | no disponible | 3,06× tiempo real |
| Huella BF16 / Q4 | 1.447 / 721 MB | 3.830 / 1.642 MB | no disponible | no disponible |

Los valores de SER en retenido son la media de cuatro jueces LLM independientes sobre 508 clips. Las cifras DarijaCS de Voxtral son las publicadas por Mistral; el resto son reruns de fihriaLab sobre los mismos clips.

## Requisitos de hardware

- VRAM estimada: aproximadamente 8 GB en BF16 (3,82 GB de pesos más caché KV y activaciones). La variante 0.6B requiere unos 4 GB.
- GPU recomendadas: NVIDIA con CUDA compatible; el rendimiento medido en H100 alcanza 243× tiempo real. No se especifican otros modelos de GPU en la información disponible.
- GPU de consumo: no se confirma explícitamente compatibilidad con RTX 4090 u otras GPU de consumo, aunque los ~8 GB de VRAM en BF16 quedarían dentro de la memoria de tarjetas de 12 GB o más. La model card no lo verifica.
- Despliegue: `qwen-asr==0.0.6` con backend transformers, o `qwen-asr[vllm]==0.0.6` para batching y alto throughput. En CPU, build GGUF con llama.cpp (la inferencia BF16 en CPU es inviable según el autor).
- Almacenamiento: ~6 GB de disco para el entorno virtual (incluye PyTorch CUDA y dependencias); el repo pesa 7,6 GB.
- Latencia y throughput: 243× tiempo real en una H100 en BF16; la variante Q4 del 1.7B no tiene cifra de CPU publicada (solo el 0.6B, con 5,98× tiempo real en CPU de portátil).
- Entorno: Python 3.10–3.12, driver CUDA compatible (los wheels por defecto usan CUDA 13.2; para CUDA 12 hay que instalar el wheel de PyTorch correspondiente).

## Comparativa con modelos similares

| Modelo | Parámetros | Idiomas | SER retenido ↓ | Throughput H100 ↑ | Licencia |
|---|---|---|---|---|---|
| fihrIA-ASR-1.7B | 1,91B | ar, ary (+ code-switching fr/en) | 6,1 % | 243× | Apache 2.0 |
| Mistral Voxtral Mini 4B | 4B (según denominación) | no disponible en detalle | 8,4 % | 34× | no disponible |
| MoulSot 1.7B | 1,7B | dariya | 11,2 % | 147× | no disponible |
| fihrIA-ASR-0.6B | 0,6B | ar, ary (+ code-switching fr/en) | 7,1 % | 255× | Apache 2.0 |

El 1.7B ofrece el mejor SER de la comparativa con menos de la mitad de parámetros que Voxtral Mini 4B y un throughput 7,1× superior en H100. Frente a MoulSot 1.7B, mismo orden de tamaño, mejora el SER en 5,1 puntos y el throughput en 1,65×.

## Limitaciones y advertencias

- El modelo está especializado en dariya y árabe; no se documenta su comportamiento en otras lenguas más allá del code-switching con francés e inglés.
- No se detallan sesgos conocidos, tasas de alucinación ni comportamiento en dominios acústicos difíciles (ruido, acentos regionales) en la información disponible.
- La inferencia BF16 en CPU es inviable según el autor; para CPU es obligatorio usar la build GGUF.
- Las cifras de SER en retenido dependen de una evaluación con jueces LLM (cuatro jueces sobre 508 clips), no de una métrica WER/CER estándar única; conviene interpretarlas con cautela.
- La model card no especifica la longitud de contexto ni la duración máxima de audio procesable por segmento.
- Licencia Apache 2.0: permite uso comercial, modificación y redistribución con atribución; no se indican restricciones adicionales.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que la validación por parte de la comunidad es todavía inexistente.
- La librería `qwen-asr` fija versiones concretas (`transformers==4.57.6`, `vllm==0...` truncado en la información disponible); verificar compatibilidad antes de desplegar en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/fihriaLab/fihrIA-ASR-1.7B
- Modelo base: https://huggingface.co/Qwen/Qwen3-ASR-1.7B
- Variante 0.6B (safetensors): https://huggingface.co/fihriaLab/fihrIA-ASR-0.6B
- Variante 1.7B GGUF: https://huggingface.co/fihriaLab/fihrIA-ASR-1.7B-GGUF
- Variante 0.6B GGUF: https://huggingface.co/fihriaLab/fihrIA-ASR-0.6B-GGUF
- Repositorio de inferencia qwen-asr: https://github.com/QwenLM/Qwen3-ASR
- PyTorch (instalación de wheels CUDA): https://pytorch.org/get-started/locally/
