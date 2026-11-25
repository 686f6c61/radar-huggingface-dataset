# moonbox-dev/Qwen3-ASR-1.7B-GGUF

## Resumen

Qwen3-ASR-1.7B-GGUF es una compilacion en formato GGUF del modelo de reconocimiento automatico del habla Qwen3-ASR-1.7B, desarrollado originalmente por el equipo Qwen de Alibaba y convertido a GGUF por moonbox-dev para su uso con llama.cpp en dispositivos locales (Metal, CUDA, Vulkan y CPU). El repositorio incluye el decodificador de texto Qwen3 cuantizado en varias precisiones y un fichero `mmproj` en F16 que contiene el codificador de audio y su proyector, ambos necesarios para la inferencia.

El modelo resuelve la transcripcion de voz a texto multilingue: segun la model card original, la familia Qwen3-ASR cubre identificacion de idioma y reconocimiento de voz en 52 idiomas y dialectos (30 idiomas y 22 dialectos chinos), y el modelo se apoya en la capacidad de comprension de audio de Qwen3-Omni. Con 2.031.739.904 parametros totales, es un modelo compacto pensado para despliegue en hardware de consumo.

Su relevancia actual reside en que ofrece un ASR de calidad cercana al estado del arte en un paquete ligero y ejecutable localmente sin GPU de datacenter: la propia model card reporta un WER del 1,45 % en LibriSpeech test-clean y un CER del 1,52 % en AISHELL-1 para la version original en PyTorch, cifras que las cuantizaciones GGUF mantienen practicamente intactas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal audio-texto (decodificador de texto Qwen3 + codificador de audio con proyector `qwen3a`), derivada de Qwen3-Omni |
| Parametros totales | 2.031.739.904 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | F16, BF16, Q8_0, Q6_K, Q5_K_M, Q4_K_M; el codificador de audio (`mmproj`) siempre en F16 |
| Idiomas soportados | 52 idiomas y dialectos (30 idiomas y 22 dialectos chinos, segun la model card original); la ficha de HF no detalla la lista completa |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (safetensors para el modelo base original) |

## Arquitectura y entrenamiento

El modelo es un sistema multimodal de reconocimiento del habla que combina un codificador de audio con un decodificador de texto basado en Qwen3, heredando la capacidad de comprension de audio de Qwen3-Omni. En el repositorio GGUF, el decodificador se distribuye en un fichero por precision y el codificador de audio mas su proyector se empaquetan aparte en `mmproj-qwen3-asr-1-7b-F16.gguf` (641,8 MB), compartido por todas las precisiones. La conversion se realizo con llama.cpp `b12621` a partir de la revision `7278e1e70f` del modelo original, usando `convert_hf_to_gguf.py` y `llama-quantize` con sus mezclas estandar y sin matriz de importancia.

No se dispone de informacion detallada sobre el numero de tokens de entrenamiento, la composicion del dataset ni si hubo etapas de RLHF o DPO en la informacion proporcionada. La model card original menciona el uso de datos de habla a gran escala y las capacidades de audio de Qwen3-Omni, pero no cuantifica el corpus. Como innovacion practica, el modelo admite forzar el idioma mediante un prompt de asistente (`language English<asr_text>`) y decodificacion voraz, y la conversion GGUF preserva todos los tensores del checkpoint original con los mismos valores, verificado tensor a tensor antes de la subida.

## Capacidades

- Transcripcion de voz a texto (ASR) en 52 idiomas y dialectos, incluyendo 22 dialectos chinos.
- Identificacion automatica del idioma del audio.
- Reconocimiento de acentos del ingles de distintas regiones, segun la model card original.
- Entrada multimodal de audio mediante el proyector `qwen3a` de llama.cpp.
- Salida de transcripcion con parada automatica tras escribir el texto.
- Control explicito del idioma de salida mediante prompt estructurado (`language <idioma><asr_text>`).
- Compatibilidad con el endpoint `/v1/audio/transcriptions` de llama-server (API compatible con OpenAI).
- No se documentan en la informacion disponible capacidades de tool calling, agentes, vision ni modo de razonamiento extendido.

## Casos de uso

- Transcripcion de reuniones y notas de voz en local: el modelo puede procesar audio directamente en el portatil o estacion de trabajo sin enviar datos a la nube, usando la cuantizacion Q4_K_M (1,28 GB) o Q5_K_M (1,47 GB) para minimizar el consumo de memoria.
- Subtitulado automatico de contenido audiovisual: la deteccion de idioma integrada permite generar subtitulos en multiples idiomas sin un paso previo de clasificacion, y la salida con parada automatica simplifica el postprocesado.
- Asistentes de voz para aplicaciones de escritorio: al ejecutarse sobre llama.cpp con backend CPU, CUDA, Metal o Vulkan, puede integrarse en aplicaciones nativas que necesiten dictado o comandos por voz sin dependencia de servicios externos.
- Investigacion en ASR y evaluacion de cuantizaciones: el repositorio incluye hashes sha256 y resultados de WER/CER por precision, lo que permite reproducir experimentos y medir el impacto de la cuantizacion en la calidad de transcripcion.
- Procesamiento por lotes de archivos de audio en servidores modestos: el endpoint `/v1/audio/transcriptions` de llama-server permite desplegar un servicio HTTP de transcripcion en una unica GPU de consumo, con un RTF de aproximadamente 0,033-0,048 segun precision.
- Aplicaciones de accesibilidad: transcripcion en tiempo real de conversaciones para personas con dificultades auditivas, aprovechando el bajo coste computacional del modelo (RTF inferior a 0,05 en una RTX 3080 Laptop).
- Reconocimiento de voz en chino con dialectos: la cobertura de 22 dialectos chinos lo hace adecuado para aplicaciones dirigidas al mercado chino o para transcripcion de audio con variacion dialectal.

## Benchmarks y rendimiento

Resultados reportados por el autor de la conversion GGUF sobre su conjunto de evaluacion (400 enunciados de LibriSpeech test-clean y 200 de AISHELL-1 test, decodificacion voraz en llama-server con CUDA sobre RTX 3080 Laptop):

| Precision | Tamano | WER (ingles) | CER (chino) | Transcripciones identicas a BF16 (LibriSpeech / AISHELL) | RTF |
|---|---|---|---|---|---|
| F16 | 4,07 GB | 1,42 % | 1,45 % | 395/400 y 199/200 | 0,044 |
| BF16 | 4,07 GB | 1,45 % | 1,42 % | referencia | 0,043 |
| Q8_0 | 2,17 GB | 1,49 % | 1,45 % | 375/400 y 197/200 | 0,033 |
| Q6_K | 1,67 GB | 1,52 % | 1,49 % | 362/400 y 196/200 | 0,048 |
| Q5_K_M | 1,47 GB | 1,47 % | 1,52 % | 341/400 y 189/200 | 0,048 |
| Q4_K_M | 1,28 GB | 1,55 % | 1,62 % | 316/400 y 186/200 | 0,045 |

Referencia del modelo original en PyTorch fp32 sobre el mismo conjunto: WER 1,45 % y CER 1,52 %. El criterio de aceptacion del autor era no superar la tasa de error original en mas de un punto porcentual, condicion que cumplen todas las precisiones. No se han publicado en la informacion disponible resultados de benchmarks estandar como MMLU o HumanEval, que no aplican a un modelo ASR.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,9 GB con Q4_K_M (1,28 GB del modelo + 0,64 GB del `mmproj`), unos 2,1 GB con Q5_K_M, 2,3 GB con Q6_K, 2,8 GB con Q8_0 y 4,7 GB con F16/BF16.
- GPU recomendadas: cualquier GPU con al menos 3-5 GB de VRAM libre; el autor verifico el funcionamiento en una RTX 3080 Laptop (CUDA). Tambien funciona en Apple Silicon via Metal y en GPU AMD/Intel via Vulkan.
- Cabe en GPU de consumo: si, en practicamente todas las GPU modernas de consumo (RTX 3060 en adelante, e incluso modelos con 4 GB de VRAM usando Q4_K_M).
- Opciones de despliegue: llama.cpp (llama-server, llama-mtmd-cli) con version `b12621` o posterior; requiere el fichero `mmproj` junto al modelo. Compatible con el endpoint `/v1/audio/transcriptions` estilo OpenAI.
- Latencia y throughput: RTF entre 0,033 y 0,048 en RTX 3080 Laptop segun precision, es decir, aproximadamente 20-30 veces mas rapido que tiempo real en ese hardware. No se dispone de datos de latencia en CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Qwen3-ASR-1.7B-GGUF (este) | 2,03 mil millones | 52 idiomas y dialectos | no disponible | Apache-2.0 | GGUF | Conversion comunitaria para llama.cpp; WER 1,45 % / CER 1,42 % en el conjunto del autor |
| Qwen3-ASR-1.7B (original) | 2,03 mil millones | 52 idiomas y dialectos | no disponible | Apache-2.0 | safetensors | Modelo base en PyTorch; WER 1,45 % / CER 1,52 % en el mismo conjunto |
| Qwen3-ASR-0.6B | no disponible | 52 idiomas y dialectos | no disponible | Apache-2.0 | safetensors | Version mas pequena de la misma familia, orientada a menor coste computacional |
| Whisper large-v3 | 1,55 mil millones | ~99 idiomas | 30 s por ventana | MIT | safetensors, GGUF, etc. | Referencia clasica de ASR open source; no se dispone de comparacion directa en la informacion proporcionada |

La model card original afirma que la version de 1.7B alcanza rendimiento de estado del arte entre los modelos ASR open source y es competitiva con las APIs comerciales mas potentes, aunque no se incluyen en la informacion disponible las cifras concretas de esa comparacion.

## Limitaciones y advertencias

- Los sesgos concretos del modelo no se detallan en la informacion disponible; como todo sistema ASR entrenado con datos a gran escala, puede presentar sesgos de acento, dialecto y dominio.
- Riesgo de alucinacion en pasajes de audio con ruido, silencios o habla solapada; no se documentan mecanismos especificos de mitigacion.
- La longitud de contexto no esta especificada, por lo que se desconoce el limite maximo de audio procesable en una sola peticion.
- La lista completa de los 52 idiomas y dialectos no aparece en la ficha de Hugging Face consultada; solo se confirman 30 idiomas y 22 dialectos chinos.
- El rendimiento reportado se midio unicamente en ingles (LibriSpeech) y chino (AISHELL-1); no hay datos publicados para el resto de idiomas.
- Requiere llama.cpp `b12621` o posterior y el fichero `mmproj` adicional; no funciona con versiones anteriores ni sin el codificador de audio.
- La licencia Apache-2.0 permite uso comercial, pero el usuario debe cumplir los terminos del modelo original Qwen3-ASR-1.7B, del que estos ficheros son derivados.
- La conversion no uso matriz de importancia, por lo que las cuantizaciones bajas (Q4_K_M) pierden mas fidelidad que una cuantizacion optimizada; el propio autor reporta solo 316/400 transcripciones identicas a BF16 en Q4_K_M.
- El modelo esta disenado exclusivamente para ASR; no debe esperarse de el generacion de texto general, razonamiento o codigo.

## Enlaces

- Repositorio GGUF: https://huggingface.co/moonbox-dev/Qwen3-ASR-1.7B-GGUF
- Modelo base original: https://huggingface.co/Qwen/Qwen3-ASR-1.7B
- Repositorio de llama.cpp: https://github.com/ggml-org/llama.cpp
- Paper de referencia citado en los tags: arXiv:2601.21337
