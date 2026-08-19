# batiai/gemma-4-12B-it-GGUF

## Resumen

Gemma 4 12B-it es un modelo multimodal de Google DeepMind, lanzado el 3 de junio de 2026, que BatiAI ha cuantizado a formato GGUF para su uso local con llama.cpp y Ollama. Se trata de un modelo denso de 11,9 mil millones de parametros con una arquitectura encoder-free unificada (`gemma4_unified`), 48 capas y una ventana de contexto de 256K tokens. Su principal innovacion es que acepta texto, imagen, audio (hasta 30 segundos) y video (hasta 60 segundos) sin depender de encoders de vision o audio separados: los parches de imagen y las formas de onda de audio se proyectan directamente al LLM mediante capas lineales ligeras.

La relevancia de esta cuantizacion reside en que permite ejecutar un modelo de calidad comparable a un MoE de 26 mil millones de parametros con menos de la mitad de memoria, segun las notas de lanzamiento de Google. La version Q4_K_M ocupa unos 6,9 GB y corre en un Mac de 16 GB a aproximadamente 45 tokens por segundo en un M4 Max. El modelo se distribuye bajo licencia Apache 2.0, lo que lo hace apto para uso comercial, e incluye un archivo `mmproj` separado de unos 167 MB que aglutina los proyectores de vision y audio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `gemma4_unified` (transformer denso multimodal encoder-free) |
| Parametros totales | 11.907.350.576 (~11,9B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 256K tokens |
| Tipos de cuantizacion | Q2_K_S (~4,2 GB), IQ3_XXS (~4,6 GB), Q3_K_M (~5,7 GB), IQ4_XS (~6,2 GB), Q4_K_M (~6,9 GB), Q6_K (~9,2 GB) |
| Idiomas soportados | 140+ en el modelo base; la model card lista en, ko, ja, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp); el modelo original usa safetensors en BF16 |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura `gemma4_unified` de 48 capas y 12B parametros densos, con un diseno encoder-free para multimodalidad. En lugar de un vision encoder clasico (como CLIP o SigLIP), los parches de imagen sin procesar y las formas de onda de audio se proyectan directamente al espacio del LLM mediante capas lineales ligeras. Esto reduce drasticamente el tamano del proyector multimodal: el archivo `mmproj` en BF16 pesa unos 167 MB y funciona con cualquier cuantizacion del modelo principal. El modelo es de tipo razonamiento (reasoning model): emite un bloque de pensamiento intermedio antes de la respuesta final.

Los datos de entrenamiento (numero de tokens, composicion del dataset) y los metodos de alineacion (RLHF, DPO) no estan disponibles en la informacion proporcionada. La cuantizacion GGUF fue realizada por BatiAI con llama.cpp e imatrix para las variantes IQ, partiendo de los pesos oficiales BF16 de Google.

## Capacidades

- Generacion de texto y razonamiento multistep con modo thinking explicito (bloque `reasoning_content`).
- Vision multimodal: OCR, captioning y razonamiento visual, verificado localmente con OCR de capturas en coreano (~13 segundos por imagen en M4 Max).
- Audio nativo: comprension de habla de hasta 30 segundos, verificado experimentalmente con transcripcion de llamadas en coreano mediante `llama-server`.
- Video de hasta 60 segundos soportado por el modelo base, aunque llama.cpp aun no dispone de proyector de video para Gemma 4.
- Soporte de tool calling / function calling, verificado por BatiAI.
- Capacidades multilingues: 140+ idiomas en el modelo base.
- Compatible con Ollama para modo texto (comando `ollama pull batiai/gemma4-12b:q4`).

## Casos de uso

- OCR y digitalizacion de documentos: el modelo puede extraer texto de capturas y documentos escaneados con alta precision (DocVQA 94,9), lo que lo hace util para automatizar la entrada de datos en flujos de trabajo locales sin enviar informacion a la nube.
- Transcripcion y analisis de audio: con el proyector de audio y `llama-server`, puede transcribir llamadas o notas de voz de hasta 30 segundos, adecuado para asistentes personales o sistemas de documentacion medica en dispositivos locales.
- Asistente multimodal en Mac: con 6,9 GB de cuantizacion Q4_K_M cabe en un Mac de 16 GB y alcanza ~45 tok/s en M4 Max, permitiendo un asistente conversacional con entrada de imagen y audio en el dispositivo.
- Razonamiento visual en produccion: tareas de inspeccion visual, lectura de graficos y diagramas tecnicos, gracias a resultados como InfoVQA 88,4 y MMMU-Pro 69,1.
- Agentes con tool calling: su soporte verificado de function calling permite integrarlo en pipelines de automatizacion (por ejemplo, BatiFlow) para ejecutar acciones sobre el sistema operativo o APIs.
- Chat multilingue y soporte al cliente: con 140+ idiomas y contexto de 256K, puede gestionar conversaciones largas multi-turno en varios idiomas manteniendo el historial completo sin truncamiento.

## Benchmarks y rendimiento

Los siguientes resultados provienen de las notas de lanzamiento de Google citadas en la model card de BatiAI. No se dispone de comparativas independientes con otros modelos en la informacion proporcionada.

| Benchmark | Resultado |
|---|---|
| DocVQA | 94,9 |
| InfoVQA | 88,4 |
| MMMU-Pro | 69,1 |
| AIME 2026 | 77,5 |
| MATH-Vision | 79,7 |

Segun Google, el modelo de 12B se situa cerca del Gemma 4 26B MoE en benchmarks estandar, con menos de la mitad de requisitos de memoria. BatiAI no ha publicado mediciones propias de velocidad para esta cuantizacion concreta, aunque confirma ~45 tok/s en M4 Max con Q4_K_M y ~13 segundos por imagen en tareas de OCR.

## Requisitos de hardware

- VRAM estimada: desde ~4,2 GB (Q2_K_S) hasta ~9,2 GB (Q6_K), mas el proyector multimodal de ~167 MB.
- GPUs compatibles: Apple Silicon (M4 Max verificado), GPUs NVIDIA con CUDA (donde Q3 y Q4 rinden de forma equivalente).
- Macs de 8 GB: soportan Q2_K_S, IQ3_XXS y Q3_K_M (ajustado).
- Macs de 16 GB: Q4_K_M recomendado; tambien cabe Q6_K.
- Macs de 24 GB o mas: todas las cuantizaciones, incluida Q6_K.
- Despliegue: Ollama (solo texto), `llama-server` de llama.cpp master reciente para multimodal (requiere `--jinja`), compatible con endpoints estilo OpenAI (`/v1/chat/completions`).
- Nota de rendimiento en Apple Silicon: en otros modelos, Q3_K_M genera mas lento que Q4_K_M pese a ocupar menos; si Q4_K_M cabe, es preferible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multimodal | Licencia | Notas |
|---|---|---|---|---|---|
| Gemma 4 12B-it (este) | 11,9B denso | 256K | Texto, imagen, audio, video | Apache 2.0 | Calidad cercana al MoE de 26B |
| Gemma 4 26B MoE | ~26B (MoE) | 256K | Texto, imagen, audio, video | Apache 2.0 | Misma familia, mayor memoria |
| Qwen3.8-27B | ~27B | no disponible | no disponible | no disponible | Mencionado en la card como referencia de velocidad Q3/Q4 en Mac |
| Granite 4.1 | no disponible | no disponible | no disponible | no disponible | Mencionado en la card como referencia de velocidad Q3/Q4 en Mac |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada; las referencias a Qwen3.8-27B y Granite 4.1 aparecen unicamente en el contexto de mediciones de velocidad de cuantizacion en Apple Silicon.

## Limitaciones y advertencias

- Video no funcional en llama.cpp: el modelo base soporta video de hasta 60 segundos, pero llama.cpp aun no incluye el proyector de video para Gemma 4, por lo que localmente solo funcionan imagen y audio.
- Ollama limitado a texto: la version 0.20 de Ollama no reconoce los proyectores `gemma4uv`/`gemma4ua`, por lo que las capacidades de imagen y audio requieren `llama-server` compilado desde master reciente; builds antiguos fallan con `unknown projector type: gemma4uv`.
- Audio experimental: la transcripcion de audio funciona pero con calidad reducida al usar los flags `init_audio`.
- Modelo de razonamiento: las respuestas multimodales emiten 700+ tokens incluyendo el bloque de pensamiento; hay que configurar `max_tokens` suficientemente alto o se truncara la respuesta final.
- Sesgos y alucinaciones: no se han publicado evaluaciones de sesgos para esta cuantizacion; como modelo de razonamiento, puede generar confabulaciones plausibles en tareas de vision y audio.
- Rendimiento de Q3_K_M en Mac: BatiAI advierte que en Apple Silicon las cuantizaciones Q3_K_M tienden a ser mas lentas que Q4_K_M pese a ocupar menos, por limitaciones de dequantizacion en Metal; no medido aun en este modelo concreto.
- Idiomas verificados: la model card lista en, ko, ja, zh como idiomas principales; la cifra de 140+ proviene del modelo base de Google y no esta verificada en esta cuantizacion.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/batiai/gemma-4-12B-it-GGUF
- Modelo base: https://huggingface.co/google/gemma-4-12B-it
- Pagina de Ollama: https://ollama.com/batiai/gemma4-12b
- BatiFlow (automatizacion macOS): https://flow.bati.ai
- BatiAI: https://bati.ai
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
