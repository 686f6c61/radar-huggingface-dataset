# prithivMLmods/NVIDIA-Nemotron-3.5-Transcribe-30B-A4B-GGUF

## Resumen

NVIDIA-Nemotron-3.5-Transcribe-30B-A4B es un modelo abierto de reconocimiento y comprensión de audio desarrollado por NVIDIA, distribuido en formato GGUF por el usuario prithivMLmods. Se trata de un modelo de lenguaje de arquitectura híbrida Mamba-Transformer con mezcla de expertos (MoE) de 34B parámetros totales (4,3B activos según la model card, aunque los pesos en safetensors suman 32,91B), adaptado para tareas de voz mediante un transformer ASR de ~600M parámetros, un codificador de diarización de 99M y cabezas CTC. El modelo es relevante porque combina transcripción multilingüe en 40 idiomas, traducción de voz, atribución de hablantes y preguntas y respuestas sobre audio en un único modelo abierto, con resultados de estado del arte entre los pesos abiertos para ASR.

El modelo procesa hasta una hora de audio gracias a una ventana de contexto de 65K tokens, lo que lo sitúa en la categoría de modelos de audio de formato largo. Incorpora predicción multi-token nativa para decodificación especulativa, lo que reduce la latencia de generación en despliegues de producción.

Esta ficha describe la versión GGUF publicada por prithivMLmods, que ofrece cuantizaciones desde BF16 (65,9 GB) hasta Q3_K_M (20,7 GB), además del fichero de proyección multimodal mmproj necesario para las capacidades de audio. El modelo base es `nvidia/NVIDIA-Nemotron-3.5-Transcribe-30B-A4B` y se distribuye bajo licencia OpenMDW-1.1.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida Mamba-Transformer con mezcla de expertos (MoE), con transformer ASR (~600M), codificador de diarización (99M) y cabezas CTC |
| Parametros totales | 32.913.266.240 (32,91B) según safetensors; la model card indica 34B |
| Parametros activos | 4,3B |
| Longitud de contexto | 65K tokens (hasta una hora de audio) |
| Tipos de cuantizacion | BF16, MXFP4_MOE, Q3_K_L, Q3_K_M, Q4_K_M, Q5_K_M, Q6_K; fichero mmproj (1,47 GB) para audio |
| Idiomas soportados | 40 idiomas: cs, nl, en, fr, de, hi, it, ko, pl, pt, ru, sk, es, bg, hr, da, et, fi, hu, ja, lv, lt, ro, sl, sv, th, tr, uk, ar, bn, zh, el, he, id, mt, mr, tl, ta, te, vi |
| Licencia | OpenMDW-1.1 |
| Formato de pesos | GGUF (BF16, MXFP4_MOE, Q3_K_L, Q3_K_M, Q4_K_M, Q5_K_M, Q6_K) y mmproj |

## Arquitectura y entrenamiento

El modelo se basa en una arquitectura híbrida Mamba-Transformer con mezcla de expertos, con 32,91B parámetros totales y 4,3B activos por token. Sobre el LLM base se añaden componentes específicos de audio: un transformer ASR de aproximadamente 600M parámetros, un codificador de diarización de 99M parámetros y cabezas CTC para alineamiento temporal. Esta combinación permite transcribir, traducir, atribuir hablantes y generar marcas de tiempo de palabra en una sola pasada. La predicción multi-token nativa habilita decodificación especulativa, lo que acelera la inferencia sin necesidad de un modelo borrador externo.

El entrenamiento se realizó sobre 1,72 millones de horas únicas de audio (6,53 millones de horas de exposición total), con el dataset `nvidia/Granary-v2` como fuente declarada. La model card no detalla la composición exacta del dataset ni si se aplicaron fases de RLHF o DPO; esa información no está disponible. La evaluación no-ASR de comprensión de audio se limita al inglés según las limitaciones declaradas por el autor.

## Capacidades

- Transcripción de voz a texto multilingüe en 40 idiomas, incluidos checo, neerlandés, inglés, francés, alemán, hindi, italiano, coreano, polaco, portugués, ruso, eslovaco, español, búlgaro, croata, danés, estonio, finlandés, húngaro, japonés, letón, lituano, rumano, esloveno, sueco, tailandés, turco, ucraniano, árabe, bengalí, chino, griego, hebreo, indonesio, maltés, maratí, tagalo, tamil, telugu y vietnamita.
- Traducción de voz (speech translation) entre idiomas.
- Diarización de hablantes y atribución de turnos de palabra.
- Generación de marcas de tiempo a nivel de palabra.
- Procesamiento de audio de formato largo de hasta una hora por ventana de 65K tokens.
- Identificación de idioma (language identification) y manejo de code-switching.
- Preguntas y respuestas sobre audio (audio question answering).
- Seguimiento de instrucciones (instruction following) sobre entradas de audio.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la información proporcionada.
- Modo thinking explícito: no disponible en la información proporcionada.

## Casos de uso

- Transcripción de reuniones y actas: el modelo puede procesar hasta una hora de audio en una sola ventana de 65K tokens, generando transcripción con marcas de tiempo de palabra y atribución de hablantes, lo que permite construir actas con turnos identificados sin segmentación manual previa.
- Subtitulado automático multilingüe: gracias a las marcas de tiempo a nivel de palabra y a los 40 idiomas soportados, se puede generar ficheros de subtítulos alineados temporalmente para vídeo en producción, incluyendo traducción a otro idioma en la misma pasada.
- Atención al cliente y análisis de llamadas: la diarización y la transcripción permiten separar agente y cliente en grabaciones de call center, alimentar sistemas de control de calidad y extraer métricas sobre duración de turnos y contenido de la conversación.
- Archivado y búsqueda de contenido audiovisual: la transcripción de formato largo con identificación de idioma y code-switching facilita indexar podcasts, clases o archivos de radio para búsqueda textual posterior, incluso en grabaciones con cambios de idioma.
- Accesibilidad: generación de transcripciones y subtítulos para contenido educativo o institucional en los 40 idiomas soportados, con marcas temporales que permiten sincronizar la reproducción.
- Análisis de audio con preguntas: el soporte de audio question answering permite consultar el contenido de una grabación de forma conversacional, por ejemplo para localizar menciones concretas o resumir segmentos, aunque la evaluación de esta capacidad está limitada al inglés según el autor.
- Investigación en ASR multilingüe: al ser un modelo abierto con pesos GGUF y métricas publicadas de WER, sirve como línea base reproducible para experimentos de reconocimiento de voz en lenguas de bajos recursos dentro del conjunto soportado.

## Benchmarks y rendimiento

| Benchmark | Resultado |
|---|---|
| WER inglés | 4,71 |
| WER formato largo | 10,98 |
| WER multilingüe | 4,62 |
| cpWER multihablante | 15,80 |
| MMAU (comprensión de audio) | 73,40 % |
| MMLU-Pro | 74,14 % |

No se han publicado en la información disponible resultados comparativos frente a otros modelos concretos en estos benchmarks.

## Requisitos de hardware

- VRAM estimada para inferencia según cuantización: BF16 ~65,9 GB; Q6_K ~34,9 GB; Q5_K_M ~27 GB; Q4_K_M ~25,4 GB; Q3_K_L ~21,6 GB; Q3_K_M ~20,7 GB; MXFP4_MOE ~18,7 GB. Añadir ~1,47 GB para el fichero mmproj de audio.
- GPU recomendadas: una H100 de 80 GB ejecuta el modelo en BF16 según la model card, con vLLM 0.32.0 y NeMo Speech, Transformers o SGLang-Omni. La cuantización MXFP4_MOE está optimizada para hardware Blackwell (RTX Pro 6000, serie RTX 50, B200, B300) con aceleración nativa de Tensor Cores FP4.
- En GPU de consumo: las cuantizaciones Q3 y Q4 (20,7-25,4 GB) pueden caber en tarjetas con 24 GB de VRAM como la RTX 4090, aunque con margen ajustado al sumar el mmproj y el contexto; Q5_K_M y superiores requieren más de 24 GB o descarga parcial a RAM. La MXFP4_MOE (18,7 GB) es la opción más compacta para hardware Blackwell.
- Opciones de despliegue: llama.cpp (formato GGUF nativo), NeMo Speech, Transformers, vLLM 0.32.0 y SGLang-Omni; también el runtime nativo en C++ NeMo-Speech.cpp.
- Latencia y throughput: la model card indica que el despliegue abierto rinde aproximadamente la mitad de velocidad que el serving propietario NIM de NVIDIA; no se proporcionan cifras absolutas de tokens por segundo.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de modelos comparables de la misma categoría (ASR abierto de formato largo) con parámetros, contexto y rendimiento verificables.

## Limitaciones y advertencias

- WER elevado en noruego (63,76 %), griego (26,93 %) y hebreo (20,97 %), muy por encima de la media del modelo; el rendimiento en estos idiomas es limitado para producción.
- El razonamiento solo textual queda por detrás del LLM base sobre el que se construye, según el autor.
- La evaluación de audio no-ASR está limitada al inglés, por lo que las capacidades de comprensión de audio en otros idiomas no están verificadas.
- Riesgo de inyección de prompt (prompt injection) a través de entradas de audio o instrucciones.
- Riesgo de alucinación en la transcripción y en las respuestas sobre audio.
- Posibilidad de bucles de generación poco frecuentes (rare generation loops), que requieren mecanismos de corte en producción.
- Licencia OpenMDW-1.1: es necesario revisar sus términos para uso comercial antes de desplegar; la model card la etiqueta como "other" con nombre openmdw-1.1.
- El repositorio GGUF tiene un tamaño de 215,7 GB por incluir todas las cuantizaciones; conviene descargar solo el fichero necesario.
- No se dispone de información sobre sesgos específicos más allá de los riesgos generales indicados por el autor.

## Enlaces

- Repositorio GGUF: https://huggingface.co/prithivMLmods/NVIDIA-Nemotron-3.5-Transcribe-30B-A4B-GGUF
- Modelo base: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Transcribe-30B-A4B
- Licencia OpenMDW-1.1: https://openmdw.ai/license/1-1/
- Runtime NeMo-Speech.cpp: https://github.com/NVIDIA/NeMo-Speech.cpp
- Dataset Granary-v2: https://huggingface.co/datasets/nvidia/Granary-v2
