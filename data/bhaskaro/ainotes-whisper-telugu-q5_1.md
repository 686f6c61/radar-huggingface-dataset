# bhaskaro/ainotes-whisper-telugu-q5_1

## Resumen

El modelo `bhaskaro/ainotes-whisper-telugu-q5_1` es una conversión cuantizada a formato GGML (q5_1) del modelo de reconocimiento automático de voz (ASR) `vasista22/whisper-telugu-small`, un fine-tuning de Whisper small de OpenAI especializado en telugu. El autor, bhaskaro, ha realizado la conversión para su uso con la biblioteca `whisper.cpp`, orientada a la ejecución en dispositivos con recursos limitados, como teléfonos móviles o sistemas embebidos. El repositorio ocupa 0,2 GB y el modelo resultante pesa 190 MB, lo que permite una inferencia más rápida que el tiempo real en hardware de gama media.

La relevancia de este modelo radica en que proporciona una opción ligera y funcional para transcripción de audio en telugu, un idioma con pocos recursos en el ecosistema ASR, sin necesidad de infraestructura GPU. La cuantización q5_1 reduce el tamaño y acelera la inferencia manteniendo una precisión similar a la versión en float16, según las mediciones del autor. Además, la model card documenta un hallazgo importante: es necesario desactivar la predicción de marcas temporales (`no_timestamps`) para evitar que el modelo genere texto fluido pero incorrecto, debido a que los tokens de timestamp no fueron entrenados durante el fine-tuning.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper small) |
| Parametros totales | no disponible (modelo base Whisper small, 244M sin confirmar) |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no disponible (estándar Whisper: ventanas de 30 segundos de audio) |
| Tipos de cuantizacion | q5_1 (GGML) |
| Idiomas soportados | telugu (te) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGML (whisper.cpp) |

## Arquitectura y entrenamiento

El modelo original `vasista22/whisper-telugu-small` es un fine-tuning de Whisper small de OpenAI, entrenado sobre corpus ASR públicos en telugu como parte del "Whisper fine-tuning sprint". Whisper small emplea una arquitectura Transformer encoder-decoder con aproximadamente 244 millones de parámetros, aunque este dato no se confirma en la información disponible. El fine-tuning se realizó sobre transcripciones planas, sin predicción de marcas temporales, lo que implica que los tokens de timestamp del modelo no están entrenados.

La conversión a GGML se realizó mediante el script `convert-h5-to-ggml.py` de whisper.cpp, pasando primero a float16 y luego cuantizando a q5_1. El autor verifica que la tabla de tokens coincide byte a byte con la publicada por ggerganov para `ggml-small`, evitando así errores silenciosos de vocabulario. Según las mediciones del autor, la versión q5_1 es 2,6 veces más pequeña, 1,34 veces más rápida y no menos precisa que la versión float16 (14,7% frente a 15,9% de WER en hindi con los mismos clips).

## Capacidades

- Reconocimiento automático de voz en telugu: transcripción de audio a texto.
- Inferencia en tiempo real en dispositivos sin GPU, gracias a la cuantización q5_1 y al formato GGML.
- Compatible con `whisper.cpp` y sus utilidades de línea de comandos (`whisper-cli`).
- Requiere el ajuste `no_timestamps` para funcionar correctamente; sin él, el modelo produce texto gramaticalmente correcto pero no relacionado con el audio.
- No incluye capacidades de tool calling, agentes ni razonamiento multi-paso; es un modelo puramente de ASR.

## Casos de uso

- Transcripción de notas de voz en telugu en aplicaciones móviles: el modelo puede ejecutarse localmente en un smartphone de gama media (por ejemplo, Snapdragon 720G) más rápido que en tiempo real, lo que permite convertir mensajes de voz a texto sin conexión.
- Subtitulado automático de vídeos en telugu: integración con herramientas de procesamiento de vídeo que utilicen whisper.cpp para generar subtítulos en lote, aprovechando el bajo peso del modelo.
- Asistentes de voz para dispositivos embebidos: el formato GGML y el tamaño reducido permiten desplegarlo en dispositivos IoT o Raspberry Pi para comandos de voz en telugu.
- Archivado y búsqueda de contenido de audio: transcripción de reuniones, entrevistas o podcasts en telugu para indexación y búsqueda posterior.
- Aplicaciones de accesibilidad: conversión de audio en telugu a texto para personas con discapacidad auditiva, funcionando completamente sin conexión.
- Evaluación y desarrollo de sistemas ASR: al ser un modelo ligero y de código abierto, sirve como referencia para probar pipelines de transcripción en telugu antes de usar modelos más grandes.

## Benchmarks y rendimiento

El autor proporciona mediciones propias realizadas con whisper.cpp sobre 24 clips del conjunto FLEURS `te_in`, usando las mismas condiciones de decodificación que la aplicación (greedy, `no_timestamps`). Los resultados se presentan a continuación:

| Metrica | Valor |
|---|---|
| Word error rate (WER) | 45,8% |
| Character error rate (CER) | 30,7% |

Además, se documenta el efecto de los timestamps en hindi (64 clips): con timestamps activados, el WER es del 47,5%, mientras que desactivándolos baja al 14,9%. También se compara la cuantización q5_1 con float16 en hindi: 14,7% frente a 15,9% de WER, respectivamente. No se han publicado resultados comparativos con otros modelos ASR en telugu en la información disponible.

## Requisitos de hardware

- Tamaño del modelo: 190 MB en disco (q5_1).
- Inferencia más rápida que tiempo real en un Snapdragon 720G con 4 hilos, según el autor.
- No requiere GPU; funciona en CPU de gama media o baja.
- RAM necesaria: no especificada, pero al ser un modelo pequeño, cabe en dispositivos con 1-2 GB de RAM libre.
- Opciones de despliegue: `whisper.cpp` (línea de comandos o integración en aplicaciones C/C++), así como cualquier herramienta compatible con modelos GGML de whisper.
- Latencia: no se proporciona un valor exacto, pero el autor indica que supera el tiempo real en el hardware mencionado.

## Comparativa con modelos similares

No se dispone de benchmarks comparativos con otras variantes de Whisper telugu en la información proporcionada. Sin embargo, el modelo base `vasista22/whisper-telugu-small` existe en versiones base y large-v2, aunque no se ofrecen métricas de rendimiento para estas. La única comparación interna es entre la cuantización q5_1 y la versión float16 del mismo modelo, ya citada. Se puede afirmar que este modelo es una opción ligera frente a las versiones más grandes, pero a costa de un mayor WER (45,8% en FLEURS te_in) que probablemente sería inferior en los modelos de mayor tamaño, aunque no hay datos que lo confirmen.

## Limitaciones y advertencias

- El WER medido en FLEURS te_in es alto (45,8%), lo que indica que el modelo puede cometer errores significativos en audio con ruido o acentos variados.
- Es imprescindible usar `no_timestamps`; si no, el modelo genera texto fluido pero completamente desligado del audio, lo que puede dar lugar a alucinaciones graves en producción.
- El modelo solo soporta telugu; no funciona con otros idiomas.
- La cuantización q5_1 introduce pérdida de precisión, aunque el autor afirma que es mínima en comparación con float16.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base deriva de Whisper (MIT) y el fine-tuning de vasista22, por lo que se deben respetar los términos de ambas fuentes.
- No se proporciona información sobre el dataset de entrenamiento del fine-tuning, por lo que pueden existir sesgos no documentados en el reconocimiento de ciertos dialectos o registros del telugu.

## Enlaces

- Repositorio del modelo: https://huggingface.co/bhaskaro/ainotes-whisper-telugu-q5_1
- Modelo base (fine-tune original): https://huggingface.co/vasista22/whisper-telugu-small
- whisper.cpp (biblioteca de inferencia): https://github.com/ggml-org/whisper.cpp
- Modelo base (variante base): https://huggingface.co/vasista22/whisper-telugu-base
- Modelo base (variante large-v2): https://huggingface.co/vasista22/whisper-telugu-large-v2
