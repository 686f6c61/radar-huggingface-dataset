# fihriaLab/fihrIA-ASR-0.6B-GGUF

## Resumen

fihrIA-ASR-0.6B-GGUF es la versión cuantizada en formato GGUF del modelo de reconocimiento automático del habla (ASR) fihrIA-ASR-0.6B, desarrollado por fihriaLab. Está diseñado específicamente para transcribir dariya (árabe marroquí) y se distribuye empaquetado para llama.cpp mediante su pila multimodal (`mtmd`), lo que permite ejecutar la inferencia en CPU sin GPU dedicada. El modelo base parte de la arquitectura Qwen3-ASR y emplea un tokenizador compartido de 89k tokens especializado en dariya.

El modelo resuelve un problema concreto: la ausencia de sistemas ASR de pesos abiertos con calidad competitiva para dariya, un idioma de bajos recursos con abundante code-switching hacia francés e inglés. La familia se ofrece en dos tamaños (0.6B y 1.7B); esta ficha cubre el build de 0.6B en GGUF, orientado a despliegue en portátiles y dispositivos de borde con ejecución en tiempo real sobre CPU.

La relevancia de esta variante radica en su perfil de rendimiento: con cuantización Q4_K_M ocupa 342 MB (más 379 MB del proyector de audio) y alcanza 5,98× tiempo real en CPU de portátil, además de 255× tiempo real en una H100. Según el autor, supera a Mistral Voxtral Mini 4B en error semántico medio manteniendo un coste computacional muy inferior. La licencia es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal basada en Qwen3-ASR (codificador de audio + LM), empaquetada para llama.cpp `mtmd` |
| Parametros totales | 531.603.456 (0,53B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | hasta 8192 tokens (`-c 8192` documentado; reducible para menor uso de RAM) |
| Tipos de cuantizacion | Q4_K_M y BF16 (el proyector `mmproj` siempre en BF16) |
| Idiomas soportados | ar (árabe), ary (dariya marroquí); code-switching con francés e inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura multimodal compuesta por un codificador de audio (torre de audio) y un modelo de lenguaje basado en Qwen3-ASR, conectados mediante un proyector multimodal (`mmproj`). En el despliegue con llama.cpp se requieren obligatoriamente dos ficheros: el modelo de lenguaje (Q4_K_M o BF16) y su `mmproj` correspondiente en BF16. Los proyectores de audio de las variantes 0.6B y 1.7B no son intercambiables.

El entrenamiento se realizó sobre un tokenizador compartido de 89k tokens específico para dariya, y la familia se evaluó bajo un protocolo unificado. La model card no detalla el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO. La innovación principal declarada es la robustez ante code-switching natural (francés e inglés embebidos en dariya) y la salida nativa en escritura árabe optimizada para estructuras lingüísticas locales. Para GPU se recomienda usar los repositorios en safetensors BF16; estos builds GGUF son la ruta de CPU.

## Capacidades

- Transcripción de voz a texto en dariya (árabe marroquí) con salida en escritura árabe nativa.
- Manejo robusto de code-switching: transcribe frases mixtas con palabras en francés e inglés embebidas en dariya hablada.
- Procesamiento de audio mediante pila multimodal `mtmd` de llama.cpp (codificador de audio + proyector).
- Ejecución en tiempo real sobre CPU de portátil con cuantización Q4_K_M (5,98× tiempo real).
- Despliegue de alto rendimiento en GPU (255× tiempo real en H100 según el autor).
- Soporte de batching en GPU mediante vLLM con los pesos BF16 safetensors (no en esta variante GGUF).
- No se documentan capacidades de tool calling, agentes, visión, audio generativo ni modo de razonamiento explícito; el modelo es específicamente ASR.

## Casos de uso

- Subtitulado y transcripción en tiempo real en portátiles: con Q4_K_M y `-c 8192` el modelo consume ~1,6 GB de RAM y corre a 5,98× tiempo real en CPU, lo que permite transcribir reuniones o entrevistas en dariya sin GPU.
- Atención al cliente en centros de llamadas marroquíes: transcripción de conversaciones telefónicas con code-switching frecuente hacia francés (términos comerciales, nombres de productos) para generar actas y análisis de calidad.
- Generación de subtítulos para medios audiovisuales marroquíes: procesamiento por lotes de vídeo con salida directa en escritura árabe, evitando pasos de transliteración manual.
- Investigación lingüística sobre dariya: creación de corpus transcritos a partir de grabaciones de campo, aprovechando el tokenizador de 89k tokens especializado y la salida nativa en árabe.
- Despliegue en dispositivos de borde sin conectividad: el footprint de 721 MB (Q4 + mmproj) permite embeber el modelo en equipos con recursos limitados para transcripción offline.
- Pipelines de alto volumen en servidor: usando los pesos BF16 safetensors con vLLM sobre H100 se alcanzan 255× tiempo real, adecuado para procesar archivos de audio masivos en batch.
- Accesibilidad: transcripción de audio a texto en árabe para personas con discapacidad auditiva en contextos donde se habla dariya con mezcla de francés.

## Benchmarks y rendimiento

Datos publicados por el autor (builds Q4_K_M; menor es mejor en SER y CER, mayor es mejor en throughput):

| Metrica | fihrIA-ASR 0.6B | fihrIA-ASR 1.7B | Mistral Voxtral Mini 4B | MoulSot 1.7B |
|---|---|---|---|---|
| SER medio en held-out ↓ | 7,1% | 6,1% | 8,4% | 11,2% |
| DarijaCS CER ↓ (Prism / Probe, Q4) | 7,98 / 9,84% | 6,54 / 9,23% | 6,68 / 9,69% | 10,27 / 14,93% |
| Throughput en H100 ↑ | 255× tiempo real | 243× tiempo real | 34× | 147× |
| CPU de portátil, Q4 ↑ | 5,98× | no disponible | no disponible | 3,06× |
| Footprint BF16 / Q4 | 1.447 / 721 MB | 3.830 / 1.642 MB | no disponible | no disponible |

Los resultados en safetensors BF16 reportados son CER de 7,98 / 9,80% para el 0.6B y 6,24 / 8,71% para el 1.7B. Los números de held-out son la media de cuatro jueces LLM independientes sobre 508 clips; las cifras de DarijaCS de Voxtral son las publicadas por Mistral y el resto son reruns del autor sobre los mismos clips.

## Requisitos de hardware

- VRAM: no aplica para esta variante; es la ruta de CPU. Para GPU se recomienda usar los safetensors BF16.
- RAM estimada: ~1,6 GB con Q4_K_M y `-c 8192` (incluye ~900 MB de caché KV); ~2,4 GB con BF16 GGUF; reducir `-c` disminuye el consumo.
- Espacio en disco: 342 MB (Q4_K_M) + 379 MB (mmproj BF16) = 721 MB.
- GPU recomendadas (vía safetensors BF16): H100 para máximo throughput (255× tiempo real); no se documentan requisitos para otras GPU en esta variante.
- Cabe en cualquier portátil convencional: 5,98× tiempo real en CPU con Q4_K_M.
- Opciones de despliegue: llama.cpp build 9199 (`39cf5d619`, 2026-05-17) o superior, con `llama-server` y `llama-mtmd-cli`; vLLM solo con safetensors BF16.
- Advertencia de despliegue: builds antiguos de llama.cpp cargan los ficheros sin error pero producen palabras silenciosamente incorrectas.
- Latencia y throughput: 255× tiempo real en H100 (Q4), 5,98× tiempo real en CPU de portátil (Q4).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | SER medio ↓ | Throughput H100 ↑ | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| fihrIA-ASR 0.6B (esta ficha) | 0,53B | 8192 | 7,1% | 255× | Apache 2.0 | GGUF y safetensors |
| fihrIA-ASR 1.7B | 1,7B | no disponible | 6,1% | 243× | Apache 2.0 | GGUF y safetensors |
| Mistral Voxtral Mini 4B | 4B | no disponible | 8,4% | 34× | no disponible en la informacion | no disponible en la informacion |
| MoulSot 1.7B | 1,7B | no disponible | 11,2% | 147× | no disponible en la informacion | no disponible en la informacion |

El 0.6B ofrece el mejor equilibrio tamano/rendimiento de la comparativa: supera en SER a Voxtral Mini 4B (7,1% frente a 8,4%) con una séptima parte de los parámetros y 7,5× más throughput en H100, además de ser el único con ejecución validada en CPU de portátil.

## Limitaciones y advertencias

- Especializado exclusivamente en dariya y árabe; no es un modelo ASR multilingüe general.
- El code-switching cubierto se limita a francés e inglés embebidos; otros idiomas no están documentados.
- Riesgo de alucinación y de palabras incorrectas silenciosas si se usa un build de llama.cpp anterior al 9199.
- El `mmproj` debe ser siempre BF16 y emparejarse con su tamaño correspondiente; los proyectores de 0.6B y 1.7B no son intercambiables.
- Cuantizar el codificador de audio no está validado y apenas ahorra memoria.
- Los benchmarks son autoinformados por el autor; la evaluación held-out usa jueces LLM sobre 508 clips, no transcripción humana verificada de forma independiente.
- No se documentan sesgos específicos ni composición del dataset de entrenamiento, lo que dificulta evaluar coberturas dialectales dentro del propio dariya.
- Licencia Apache 2.0 permite uso comercial, pero conviene verificar las obligaciones de atribución del modelo base Qwen3-ASR.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta; madurez de ecosistema y soporte comunitario aún no demostrados.

## Enlaces

- Hugging Face (GGUF): https://huggingface.co/fihriaLab/fihrIA-ASR-0.6B-GGUF
- Modelo base (safetensors): https://huggingface.co/fihriaLab/fihrIA-ASR-0.6B
- Variante 1.7B (safetensors): https://huggingface.co/fihriaLab/fihrIA-ASR-1.7B
- Variante 1.7B (GGUF): https://huggingface.co/fihriaLab/fihrIA-ASR-1.7B-GGUF
- llama.cpp: https://github.com/ggml-org/llama.cpp
