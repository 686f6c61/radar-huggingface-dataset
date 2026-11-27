# fihriaLab/fihrIA-ASR-1.7B-GGUF

## Resumen

fihrIA-ASR-1.7B-GGUF es la versión cuantizada para CPU del modelo de reconocimiento automático del habla (ASR) de 1.700 millones de parámetros desarrollado por fihriaLab, un laboratorio centrado en tecnologías del lenguaje para el árabe marroquí (dariya). El modelo está construido sobre la arquitectura Qwen3-ASR y se distribuye en formato GGUF para su ejecución mediante la pila multimodal (`mtmd`) de llama.cpp, lo que permite transcribir audio sin GPU. Su propósito es cubrir la transcripción de dariya en condiciones reales, incluyendo el cambio de código (code-switching) natural entre dariya, francés e inglés, y la salida directa en escritura árabe nativa.

La relevancia del modelo radica en que la dariya es una variedad de árabe con escasa representación en sistemas ASR comerciales y de código abierto, y en que el autor reporta resultados de estado del arte entre los modelos abiertos para esta lengua: 6,1 % de SER medio en retenido y 6,54 / 9,23 % de CER en DarijaCS (Prism / Probe) con la cuantización Q4_K_M, por delante de Mistral Voxtral Mini 4B (8,4 % SER) y MoulSot 1.7B (11,2 % SER). El modelo emplea un tokenizador compartido de 89.000 tokens específico para dariya y se publica bajo licencia Apache 2.0, lo que facilita su integración en productos.

El repositorio ocupa 9,0 GB e incluye tanto la cuantización Q4_K_M como una versión BF16 en GGUF, además del proyector de audio (`mmproj`) en BF16, que es obligatorio y no intercambiable con el del modelo de 0,6B. La versión de 1,7B se posiciona como el techo de precisión de la familia, mientras que la de 0,6B está optimizada para despliegue en CPU de portátil y tiempo real.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Qwen3-ASR (transformer multimodal con torre de audio y proyector `mmproj`), empaquetada para llama.cpp `mtmd` |
| Parámetros totales | 1.591.682.048 (1,7B) |
| Parámetros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible como valor nominal; la evaluación y los ejemplos usan `-c 8192` |
| Tipos de cuantización | Q4_K_M (1.000 MB) y BF16 (3.188 MB); el `mmproj` se mantiene siempre en BF16 |
| Idiomas soportados | ar (árabe), ary (dariya marroquí); con code-switching a francés e inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp); safetensors BF16 en el repositorio base `fihriaLab/fihrIA-ASR-1.7B` |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-ASR y se presenta como un sistema multimodal compuesto por dos piezas: el modelo de lenguaje y un proyector de audio (`mmproj`) que transforma las características acústicas en embeddings consumibles por el LLM. En llama.cpp se ejecuta a través de la pila `mtmd`, que gestiona entradas multimodales. La familia se entrenó con un tokenizador compartido de 89.000 tokens específico para dariya y se evaluó bajo un protocolo unificado entre los tamaños de 0,6B y 1,7B.

La información disponible no detalla el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron etapas de RLHF o DPO. Sí se destaca el diseño orientado al cambio de código: el modelo transcribe de forma robusta frases en las que aparecen palabras en francés e inglés insertadas en dariya hablada, y genera la salida directamente en escritura árabe. La evaluación publicada combina métricas automáticas (SER, CER) con un panel de cuatro jueces LLM independientes sobre 508 clips, lo que constituye la innovación metodológica más destacable del lanzamiento.

## Capacidades

- Transcripción de voz a texto en dariya marroquí con salida en escritura árabe nativa.
- Manejo robusto de code-switching dariya-francés-inglés en una misma frase.
- Procesamiento de audio a 16 kHz mono (el clip de ejemplo `sample.wav` es de 3,11 s a 16 kHz).
- Funcionamiento en CPU mediante llama.cpp, sin necesidad de GPU.
- Servicio cliente-servidor mediante `llama-server` y el script `transcribe.py` incluido (solo biblioteca estándar).
- Compatibilidad con endpoints (`endpoints_compatible` según los tags del repositorio).
- Soporte de dos niveles de precisión: Q4_K_M para CPU y BF16 para máxima calidad.
- No se documentan capacidades de diálogo conversacional, tool calling ni razonamiento multi-paso; el modelo es específicamente ASR.

## Casos de uso

- Transcripción de atención al cliente en dariya: el modelo convierte grabaciones de llamadas de soporte en texto en árabe, incluyendo las palabras en francés que los clientes intercalan de forma habitual en sectores como banca o telecomunicaciones, lo que evita perder información en el cambio de código.
- Subtitulado de contenido audiovisual marroquí: series, entrevistas y vídeos de redes sociales donde los hablantes alternan dariya y francés; la salida en escritura árabe simplifica la publicación de subtítulos.
- Despliegue en edge y portátiles: con la cuantización Q4_K_M y el `mmproj` el conjunto ocupa unos 1.642 MB y requiere aproximadamente 2,6 GB de RAM con `-c 8192`, por lo que puede ejecutarse en un portátil estándar sin GPU.
- Procesamiento por lotes en servidor: con la versión BF16 en safetensors y vLLM se puede aplicar batching para transcribir grandes volúmenes de audio; el autor reporta 243× tiempo real en una H100 con la variante Q4.
- Investigación lingüística sobre dariya: el tokenizador de 89.000 tokens y las métricas publicadas (SER y CER sobre DarijaCS) permiten usar el modelo como referencia en estudios de ASR de variedades árabes poco representadas.
- Integración en pipelines de accesibilidad: transcripción en tiempo casi real de conversaciones presenciales o reuniones en dariya mediante `llama-server` y el cliente `transcribe.py`, sin dependencia de servicios en la nube.
- Generación de corpus anotados: transcripción masiva de archivos de audio para construir datasets etiquetados de dariya con escritura árabe, reutilizables para ajuste fino de otros modelos.

## Benchmarks y rendimiento

Resultados publicados por el autor con la cuantización Q4_K_M (menor es mejor en SER y CER; mayor es mejor en throughput):

| Métrica | fihrIA-ASR 0.6B | fihrIA-ASR 1.7B | Mistral Voxtral Mini 4B | MoulSot 1.7B |
|---|---|---|---|---|
| SER medio en retenido ↓ | 7,1 % | 6,1 % | 8,4 % | 11,2 % |
| DarijaCS CER ↓ (Prism / Probe, Q4) | 7,98 / 9,84 % | 6,54 / 9,23 % | 6,68 / 9,69 % | 10,27 / 14,93 % |
| Throughput en H100 ↑ | 255× tiempo real | 243× tiempo real | 34× | 147× |
| CPU de portátil, Q4 ↑ | 5,98× | no disponible | no disponible | 3,06× |
| Huella, BF16 / Q4 | 1.447 / 721 MB | 3.830 / 1.642 MB | no disponible | no disponible |

En safetensors BF16 el autor reporta CER de 7,98 / 9,80 % (0,6B) y 6,24 / 8,71 % (1,7B). El SER en retenido es la media de cuatro jueces LLM independientes sobre 508 clips; las cifras de DarijaCS de Voxtral son las publicadas por Mistral y el resto son reruns del autor sobre los mismos clips.

## Requisitos de hardware

- VRAM: no aplica para la ruta GGUF; es una build orientada a CPU. Para GPU se recomienda el repositorio BF16 en safetensors.
- RAM en CPU: aproximadamente 2,6 GB con Q4_K_M y `-c 8192` (incluye unos 900 MB de caché KV); aproximadamente 4,7 GB con BF16 GGUF.
- Ficheros en disco: 1.000 MB (Q4_K_M) + 642 MB (`mmproj` BF16); 3.188 MB (BF16) + 642 MB (`mmproj`).
- GPU recomendadas: H100 para alto throughput con la ruta safetensors y vLLM (243× tiempo real reportado con Q4); no se especifican requisitos para GPUs de consumo.
- GPU de consumo: no se documenta soporte ni cifras para RTX 4090 u otras; la vía prevista para consumer es CPU con llama.cpp.
- Despliegue: llama.cpp build 9199 (`39cf5d619`, 2026-05-17) o superior, obligatoriamente; versiones anteriores cargan los ficheros sin error pero producen palabras silenciosamente incorrectas. También `llama-server` con `transcribe.py`, y vLLM o el backend `qwen-asr`/transformers para la ruta GPU.
- Latencia y throughput: 5,98× tiempo real en CPU de portátil con la variante 0,6B Q4; para el 1,7B en CPU no se publica cifra. En H100, 243× tiempo real con Q4.
- Restricción importante: el `mmproj` debe mantenerse en BF16 y debe ser el del mismo tamaño; los proyectores de 0,6B y 1,7B no son intercambiables.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | SER retenido | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| fihrIA-ASR-1.7B | 1,7B | no disponible (uso con `-c 8192`) | 6,1 % | Apache 2.0 | GGUF y safetensors en Hugging Face |
| fihrIA-ASR-0.6B | 0,6B | no disponible | 7,1 % | Apache 2.0 | GGUF y safetensors en Hugging Face |
| Mistral Voxtral Mini 4B | 4B | no disponible | 8,4 % | no disponible en la información proporcionada | no disponible en la información proporcionada |
| MoulSot 1.7B | 1,7B | no disponible | 11,2 % | no disponible en la información proporcionada | no disponible en la información proporcionada |

## Limitaciones y advertencias

- Ámbito lingüístico restringido: el modelo está especializado en dariya (ary) y árabe (ar); no se documenta rendimiento en otras lenguas ni en árabe estándar moderno.
- Riesgo de alucinación y de errores silenciosos: con builds de llama.cpp anteriores a la 9199 el modelo produce texto fluido pero con palabras incorrectas sin avisar; es imprescindible fijar la versión mínima.
- Dependencia del proyector de audio: usar un `mmproj` de otro tamaño o cuantizarlo degrada la calidad; el autor no ha validado encoders de audio cuantizados.
- Sesgos: no se documentan análisis de sesgos por género, dialecto regional o edad; al tratarse de un modelo entrenado sobre dariya, es previsible una menor cobertura de variedades regionales o de habla no nativa, aunque no se aportan datos.
- Evaluación limitada: las cifras de SER se basan en 508 clips juzgados por LLM, no en transcripción humana exhaustiva; la comparación con Voxtral mezcla cifras propias y publicadas por terceros.
- Sin datos de entrenamiento publicados: se desconoce el volumen y la composición del corpus, lo que dificulta evaluar cobertura y posibles contaminaciones.
- Uso comercial: la licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías ni documenta limitaciones de responsabilidad adicionales.
- No apto para tareas de diálogo: es un modelo ASR; no debe esperarse razonamiento, tool calling ni generación de texto libre.

## Enlaces

- Repositorio GGUF: https://huggingface.co/fihriaLab/fihrIA-ASR-1.7B-GGUF
- Modelo base en safetensors: https://huggingface.co/fihriaLab/fihrIA-ASR-1.7B
- Modelo 0.6B en safetensors: https://huggingface.co/fihriaLab/fihrIA-ASR-0.6B
- Modelo 0.6B en GGUF: https://huggingface.co/fihriaLab/fihrIA-ASR-0.6B-GGUF
- Demo en Space: https://huggingface.co/spaces/fihria/fihrIA-ASR-Demo
- llama.cpp: https://github.com/ggml-org/llama.cpp
