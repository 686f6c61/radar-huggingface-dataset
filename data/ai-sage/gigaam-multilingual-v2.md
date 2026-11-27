# ai-sage/GigaAM-Multilingual-v2

## Resumen

GigaAM Multilingual-v2 es un modelo de reconocimiento automático del habla (ASR) desarrollado por ai-sage, la división de inteligencia artificial de Sber (grupo Salute). Se trata de la evolución multilingüe de la familia GigaAM, originalmente centrada en ruso, y amplía la cobertura a 21 idiomas, incluyendo lenguas de bajos recursos como bashkir, tártaro, kirguís, tayiko o turcomano. El modelo resuelve el problema de la transcripción precisa en escenarios multilingües reales, con un rendimiento notablemente superior al de alternativas mucho más grandes.

La arquitectura es un sistema RNN-T (Recurrent Neural Network Transducer) con dos cabezas de decodificación: una para transcripción "raw" (sin formatear) y otra "e2e" (con formato, puntuación y capitalización). El modelo completo tiene 776 millones de parámetros y se distribuye en dos revisiones: una base auto-supervisada (`ssl`) y una versión ASR entrenada (`rnnt`). Soporta inferencia de contexto completo y streaming con latencias de 160, 320 y 640 ms.

Su relevancia actual radica en que, con un tamaño moderado, supera en precisión media a modelos mucho mayores como Whisper large-v3 (1.55B), Qwen3-ASR (1.7B) o un LLM ómnimodal de 7B, especialmente en lenguas eslavas y túrquicas. La licencia MIT facilita su adopción comercial.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | RNN-T (transducer) con doble cabeza (raw y e2e), encoder/decoder con atención; revisión `ssl` como modelo base |
| Parámetros totales | 776.477.605 |
| Parámetros activos | No es MoE |
| Longitud de contexto | No disponible (modelo ASR; streaming con ventanas de 160/320/640 ms) |
| Tipos de cuantización | No disponible explícitamente; exportación a ONNX (fp16 en encoder opcional) |
| Idiomas soportados | 21: ru, en, kk, ky, uz, be, fr, es, ba, ka, hy, ro, tk, az, tg, de, it, nl, pl, pt, tt |
| Licencia | MIT |
| Formato de pesos | safetensors (transformers); exportación a ONNX |

## Arquitectura y entrenamiento

GigaAM Multilingual-v2 es un sistema RNN-T con dos cabezas de decodificación independientes que producen simultáneamente una transcripción sin formato (`raw`) y otra con formato end-to-end (`e2e`, con puntuación y capitalización). El modelo se preentrenó de forma auto-supervisada sobre 10 millones de horas de audio sin etiquetar y posteriormente se entrenó de forma supervisada con 155.000 horas de habla etiquetada. La revisión `rnnt` incorpora tokenizadores SentencePiece emparejados y admite condicionamiento opcional por idioma, incluyendo un modo `auto` que detecta la lengua.

Una innovación destacable es el soporte nativo de streaming con contexto futuro configurable (160, 320 y 640 ms), manteniendo estado entre fragmentos de audio. La exportación a ONNX permite tanto grafos de contexto completo como de streaming, lo que facilita el despliegue en producción. El modelo se carga mediante `trust_remote_code=True` y ofrece un método `transcribe` de alto nivel, además de una API de streaming con `transcribe_partial` y `flush`.

## Capacidades

- Reconocimiento automático del habla en 21 idiomas, con modo de detección automática de idioma (`auto`).
- Doble salida: transcripción cruda (`raw`) y transcripción formateada con puntuación y mayúsculas (`e2e`).
- Streaming en tiempo real con ventanas de 160, 320 y 640 ms y contexto futuro configurable.
- Condicionamiento explícito por idioma para mejorar la precisión cuando se conoce la lengua.
- Exportación a ONNX para grafos de contexto completo y de streaming.
- Inferencia en fp16 del encoder (`fp16_encoder=True`) para reducir uso de memoria.
- Modelo base `ssl` disponible para fine-tuning o extracción de representaciones (la pipeline se etiqueta también como `feature-extraction`).
- No incluye tool calling, agentes ni capacidades de visión o audio generativo: es un modelo puramente ASR.

## Casos de uso

- Transcripción de reuniones y actas corporativas: el modelo genera directamente una salida formateada (`e2e`) con puntuación y mayúsculas, lo que reduce el postprocesado necesario antes de almacenar o resumir la transcripción.
- Subtitulado en directo y streaming: con ventanas de 160 ms y la API de streaming con estado, es adecuado para subtítulos en tiempo real en videollamadas o retransmisiones, manteniendo baja latencia.
- Atención al cliente y centros de contacto: permite transcribir conversaciones multiidioma (ruso, inglés, español, alemán, etc.) y alimentar sistemas de análisis de calidad o búsqueda sobre el texto resultante.
- Aplicaciones de voz para lenguas de bajos recursos: cubre bashkir, tártaro, kirguís, tayiko, turcomano o uzbeko con WER entre el 2,7 % y el 6,9 %, frente a errores superiores al 100 % de Whisper large-v3 en varias de ellas; útil en administración pública o servicios regionales.
- Indexación y búsqueda de archivos de audio: transcribir grandes volúmenes de grabaciones (podcasts, archivos históricos, llamadas) para hacerlas buscables, aprovechando la exportación ONNX para despliegue eficiente en CPU o GPU.
- Dictado y asistentes de voz multilingües: integración en aplicaciones de productividad donde el usuario alterna entre idiomas, usando el modo `auto` o el condicionamiento por idioma.
- Investigación en ASR: la revisión `ssl` sirve como modelo base para fine-tuning en nuevas lenguas o dominios, y los resultados publicados permiten usarlo como referencia comparativa.

## Benchmarks y rendimiento

WER (%) en contexto completo y en streaming de 640 ms, con modo de idioma `auto`. Menor es mejor.

| Idioma | GigaAM (776M) | GigaAM (776M, 640 ms) | Omni LLM (7B) | Whisper large-v3 (1.55B) | Qwen3-ASR (1.7B) | Rumble-2-Flash (0.5B) | Parakeet Ultra (0.6B) |
| :-- | --: | --: | --: | --: | --: | --: | --: |
| Media | **3,96** | 5,58 | 14,10 | 44,09 | 59,80 | 52,77 | 55,64 |
| Ruso | **2,30** | 3,38 | 6,75 | 4,81 | 6,05 | 8,12 | 4,83 |
| Inglés | 5,42 | 7,48 | 7,86 | 11,04 | **4,55** | 6,23 | 5,62 |
| Alemán | **3,16** | 4,54 | 4,92 | 4,42 | 4,16 | 5,49 | 3,93 |
| Español | **3,06** | 3,80 | 3,73 | 3,55 | 3,49 | 3,91 | 3,21 |
| Francés | **5,36** | 7,11 | 7,13 | 7,80 | 6,04 | 7,97 | 5,70 |
| Italiano | **2,28** | 3,13 | 3,38 | 3,68 | 3,54 | 3,80 | 2,65 |
| Neerlandés | **2,72** | 4,23 | 4,63 | 4,54 | 5,64 | 5,00 | 4,69 |
| Polaco | **3,40** | 5,25 | 6,04 | 5,51 | 12,92 | 6,56 | 3,69 |
| Portugués | **4,32** | 5,75 | 6,09 | 5,24 | 5,49 | 5,43 | 5,75 |
| Rumano | **4,90** | 7,28 | 17,20 | 16,73 | 45,62 | 12,25 | 14,76 |
| Azerí | **5,31** | 8,14 | 24,85 | 26,58 | 80,15 | 17,64 | 100,51 |
| Bashkir | **2,74** | 4,58 | 12,83 | 96,49 | 107,49 | 108,88 | 101,80 |
| Bielorruso | **2,50** | 3,71 | 7,25 | 74,02 | 85,09 | 15,58 | 81,70 |
| Armenio | **3,06** | 3,96 | 7,97 | 47,86 | 114,44 | 122,29 | 105,97 |
| Georgiano | **4,52** | 6,04 | 10,34 | 68,64 | 127,93 | 136,58 | 113,51 |
| Kirguís | **4,32** | 5,71 | 17,51 | 87,32 | 107,44 | 107,04 | 103,25 |
| Kazajo | **3,95** | 5,75 | 14,20 | 35,82 | 105,95 | 107,72 | 101,27 |
| Tayiko | **4,98** | 6,05 | 29,82 | 111,82 | 106,55 | 106,69 | 102,65 |
| Turcomano | **6,85** | 10,18 | 30,97 | 108,65 | 108,65 | 106,96 | 101,98 |
| Tártaro | **4,31** | 6,08 | 50,72 | 96,66 | 106,94 | 107,15 | 103,49 |
| Uzbeko | **3,70** | 5,08 | 21,82 | 104,79 | 107,61 | 106,88 | 97,57 |

## Requisitos de hardware

- VRAM estimada: el modelo tiene 776M parámetros; en fp32 ocupa aproximadamente 3,1 GB de pesos, y en fp16 en torno a 1,6 GB. Con overhead de inferencia, cabe holgadamente en GPUs de consumo con 4-8 GB de VRAM.
- GPU recomendadas: cualquier GPU moderna con al menos 4 GB de VRAM para fp16; A100, H100 o L4 para despliegues de alto throughput; RTX 4090, RTX 3090 o RTX 4060 Ti para desarrollo y producción a pequeña escala.
- Cabe en GPU de consumo: sí, en tarjetas como RTX 3060, RTX 4060, RTX 4070 o superiores, e incluso en iGPU con cuantización o en CPU vía ONNX Runtime.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` (requiere `transformers<5`), exportación a ONNX y ejecución con ONNX Runtime (contexto completo o streaming), y fine-tuning mediante el repositorio de GitHub de GigaAM. No se documenta soporte nativo para vLLM, llama.cpp, Ollama ni TGI (son frameworks orientados a LLM, no a ASR).
- Latencia y throughput: no se publican cifras de throughput ni de RTF en la información disponible. El modo streaming admite ventanas de 160, 320 y 640 ms de contexto futuro, lo que acota la latencia de emisión de texto.

## Comparativa con modelos similares

| Modelo | Parámetros | Idiomas | WER medio (tabla) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GigaAM Multilingual-v2 | 776M | 21 | **3,96** | MIT | Hugging Face, ONNX |
| Whisper large-v3 | 1,55B | ~99 | 44,09 | MIT (según autor; verificar) | Hugging Face, múltiples runtimes |
| Qwen3-ASR | 1,7B | no disponible | 59,80 | no disponible | Hugging Face |
| Omni LLM (7B) | 7B | no disponible | 14,10 | no disponible | no disponible |
| Rumble-2-Flash | 0,5B | no disponible | 52,77 | no disponible | no disponible |
| Parakeet Ultra | 0,6B | no disponible | 55,64 | no disponible | no disponible |

Nota: los WER medios de la tabla corresponden al conjunto de 21 idiomas evaluado por el autor; no reflejan el rendimiento de cada modelo en todos sus idiomas soportados. En inglés, Qwen3-ASR (4,55) supera a GigaAM (5,42); en el resto de idiomas evaluados, GigaAM obtiene el mejor WER salvo en español, donde Parakeet Ultra (3,21) y Qwen3-ASR (3,49) quedan por delante de GigaAM (3,06) —en realidad GigaAM es el mejor en español—; conviene consultar la tabla completa por idioma antes de decidir.

## Limitaciones y advertencias

- El modelo está especializado en ASR: no genera texto libre, no razona, no ejecuta código ni soporta tool calling. No debe evaluarse como un LLM.
- El rendimiento es muy desigual por idioma: el WER va del 2,28 % en italiano al 6,85 % en turcomano en contexto completo, y empeora en streaming (hasta 10,18 % en turcomano con 640 ms).
- En inglés, alternativas como Qwen3-ASR o Parakeet Ultra obtienen mejor WER; para aplicaciones puramente anglófonas puede no ser la mejor opción.
- No se documentan sesgos específicos ni comportamiento ante acentos, ruido o audio de dominio lejano; es necesario validar con datos propios.
- Riesgo de alucinación y errores en audio con ruido, solapamiento de hablantes o vocabulario técnico no visto en entrenamiento; el decodificado RNN-T puede producir sustituciones o borrados.
- Requiere `trust_remote_code=True` y `transformers<5`, lo que implica ejecutar código personalizado del repositorio; conviene auditar el código antes de desplegar en producción.
- La licencia MIT permite uso comercial, pero debe verificarse la procedencia y licencia de los datos de entrenamiento (10M horas no etiquetadas y 155k horas supervisadas) para cumplir con normativas de privacidad y derechos de autor.
- No se publican cifras de latencia, throughput ni consumo de memoria en producción; es necesario medirlas en el hardware objetivo.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que la validación comunitaria es aún escasa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ai-sage/GigaAM-Multilingual-v2
- Repositorio GitHub de GigaAM (fine-tuning y uso avanzado): https://github.com/salute-developers/GigaAM
