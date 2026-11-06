# mydubber-org/whisper-small-ct2-int8

## Resumen

`mydubber-org/whisper-small-ct2-int8` es una conversión del modelo Whisper small de OpenAI al formato CTranslate2, cuantizado a int8 con activaciones en float16 (`int8_float16`), pensada para su uso con la librería faster-whisper. El proyecto myDubber la emplea como backend local y de servidor para reconocimiento automático de voz (ASR).

La particularidad de esta conversión es que reproduce exactamente el cálculo que faster-whisper realiza en cada carga con `compute_type="int8_float16"` —pesos lineales cuantizados a int8 (per-row absmax, método propio de CTranslate2) y activaciones en float16— pero hecho una sola vez, de modo que no hay coste de conversión en tiempo de ejecución. Las dos convoluciones del encoder se mantienen en float16, igual que hace CTranslate2 al cargar este tipo de modelos. No se ha entrenado nada: los pesos son los originales de OpenAI, solo reorganizados al layout de CTranslate2 y cuantizados.

Es relevante como ejemplo de despliegue eficiente de Whisper en local: con un tamaño de repo de apenas 0,2 GB (0,23 GB el `model.bin`), cabe cómodamente en GPUs de consumo e incluso en CPU, manteniendo el rendimiento del Whisper small original. La licencia es Apache-2.0, aunque los derechos de los pesos corresponden a OpenAI.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper) para reconocimiento de voz |
| Parametros totales | no disponible (Whisper small tiene ~244 M en su versión original, pero la ficha no lo confirma) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8 (pesos lineales, per-row absmax) con activaciones float16 (`int8_float16`); convoluciones del encoder en float16 |
| Idiomas soportados | no disponibles (hereda los del Whisper small original, que soporta ~99 idiomas, según la documentación de OpenAI) |
| Licencia | Apache-2.0 (copyright de los pesos: OpenAI) |
| Formato de pesos | `model.bin` de CTranslate2 (0,23 GB), junto con `tokenizer.json` y `preprocessor_config.json` |

## Arquitectura y entrenamiento

El modelo base es Whisper small de OpenAI, una arquitectura transformer encoder-decoder para reconocimiento automático de voz. Esta versión no es un reentrenamiento ni un fine-tuning: es una conversión de formato. Se partió del checkpoint `openai/whisper-small` en el commit `973afd24965f72e36ca33b3055d56a652f456b4d` y se usó el conversor de transformers de CTranslate2 con `quantization="int8_float16"` (ctranslate2 4.8.3, transformers 5.17.0).

El proceso consistió en cargar los pesos como float16 y cuantizar los pesos lineales a int8 con el esquema per-row absmax de CTranslate2, manteniendo las dos convoluciones del encoder en float16 (CTranslate2 nunca cuantiza convoluciones en este modo). El resultado replica exactamente el estado en memoria de faster-whisper al cargar una conversión float16 con `compute_type="int8_float16"`, pero precomputado, eliminando la latencia de conversión en cada arranque. No hubo datos de entrenamiento adicionales, RLHF ni DPO: los pesos son funcionalmente idénticos al original.

## Capacidades

- Reconocimiento automático de voz (transcripción de audio a texto), heredado del Whisper small original.
- Detección de idioma y transcripción multilingüe (según las capacidades del Whisper small original; la ficha no detalla idiomas).
- Traducción de voz a inglés (capacidad nativa de la familia Whisper; la ficha no lo confirma explícitamente para esta conversión).
- Marcas de tiempo por segmento, soportadas por faster-whisper (dependiente de la librería de inferencia, no del modelo en sí).
- Carga directa con faster-whisper indicando el repositorio como ruta del modelo.
- No soporta generación de texto general, razonamiento, código ni tool calling: es un modelo ASR puro.

## Casos de uso

- Transcripción local sin depender de APIs externas: con 0,23 GB de pesos, se puede ejecutar en portátiles o servidores modestos, garantizando privacidad del audio procesado.
- Backend de aplicaciones de subtitulado: faster-whisper permite obtener segmentos con marcas de tiempo para generar subtítulos sincronizados en vídeo.
- Atención al cliente con grabación de llamadas: transcripción en lote de llamadas para análisis posterior, con bajo coste de infraestructura por su pequeño tamaño.
- Procesamiento masivo de audio en servidores: la cuantización int8 reduce memoria y ancho de banda, aumentando el throughput por GPU en colas de transcripción.
- Aplicaciones con arranque frecuente del modelo: al venir ya cuantizado, se evita el coste de conversión en cada carga, útil en serverless o contenedores efímeros.
- Integración en pipelines de datos de voz: como paso de ASR previo a diarización, NLP o indexación de contenido multimedia.
- Uso en dispositivos con GPU de consumo o incluso solo CPU, gracias al bajo requisito de memoria.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La ficha del autor no incluye métricas de WER (word error rate) ni comparativas de velocidad; al no haberse reentrenado, la calidad teórica equivale al Whisper small original, pero no hay mediciones publicadas de esta conversión concreta.

## Requisitos de hardware

- VRAM estimada: alrededor de 0,3-0,5 GB para los pesos en int8/float16 (0,23 GB el `model.bin`), más overhead de activaciones y audio; no se publica una cifra exacta.
- GPU recomendadas: cualquier GPU moderna con soporte de int8 y float16; suficiente una RTX 3060 o superior. También funciona en CPU con CTranslate2 (con `compute_type` ajustable, p. ej. `int8`).
- Cabe sin problemas en GPUs de consumo: cualquier GPU con 2 GB de VRAM libres es más que suficiente; también es viable en equipos sin GPU dedicada.
- Despliegue: faster-whisper (uso principal, documentado en la ficha), CTranslate2 directamente, o servicios construidos sobre ellos. No es un modelo de transformers estándar cargable con `AutoModel`.
- Latencia y throughput: no disponibles; faster-whisper con int8_float16 en Whisper small se considera una configuración de baja latencia, pero no hay cifras publicadas para esta conversión.

## Comparativa con modelos similares

| Modelo | Tamano aprox. | Formato | Licencia | Notas |
|---|---|---|---|---|
| openai/whisper-small (original) | ~244 M parámetros | PyTorch/safetensors (fp32/fp16) | MIT | Pesos originales; requiere conversión a CTranslate2 en cada carga con faster-whisper |
| Systran/faster-whisper-small | ~244 M parámetros | CTranslate2 (float16) | MIT | Conversión oficial float16; esta ficha equivale a ella pero pre-cuantizada a int8 |
| openai/whisper-base | ~74 M parámetros | PyTorch | MIT | Más rápido y ligero, menor precisión de transcripción |

Todas las alternativas comparten la misma tarea (ASR) y familia arquitectónica; la diferencia principal de esta ficha es la cuantización int8 pre-aplicada y el tamaño reducido en disco.

## Limitaciones y advertencias

- Los derechos de los pesos pertenecen a OpenAI; la licencia Apache-2.0 aplica a la conversión según declara el autor. Conviene revisar los términos de uso de OpenAI para los pesos de Whisper en producción comercial.
- Al ser una conversión cuantizada (int8), puede existir una pérdida mínima de precisión respecto al float16 original; no hay evaluaciones publicadas que cuantifiquen esta degradación.
- Whisper small es un modelo de tamaño pequeño: mayor tasa de errores que medium o large, especialmente en audio con ruido, acentos marcados o idiomas de bajos recursos. Riesgo de alucinaciones típicas de Whisper en silencios o audio degradado.
- El repositorio tiene 0 descargas y 0 likes registrados: no hay validación comunitaria; verificar el hash SHA-256 publicado (`8d26a9e58c09fd26c70d33bbb20abcb90d7e089cc19e8a5123d9ef7ea2e82b86`) antes de usarlo.
- Solo es utilizable con CTranslate2/faster-whisper; no es compatible con la librería transformers de Hugging Face ni con llama.cpp.
- Idiomas soportados no documentados en la ficha; asumir los del Whisper small original y validar los idiomas objetivo antes de producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mydubber-org/whisper-small-ct2-int8
- Modelo base: https://huggingface.co/openai/whisper-small
- faster-whisper (GitHub): https://github.com/SYSTRAN/faster-whisper
- Script de conversión (model_builds/whisper.py): https://github.com/vladbehash/dubber/blob/main/tools/model-builds/src/model_builds/whisper.py
