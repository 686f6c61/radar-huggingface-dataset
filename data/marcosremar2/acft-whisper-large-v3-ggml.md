# marcosremar2/acft-whisper-large-v3-ggml

## Resumen

ACFT Whisper large-v3 para whisper.cpp es una conversión al formato ggml del checkpoint `MahmoudAshraf/acft-whisper-large-v3`, un ajuste fino de Whisper large-v3 realizado con la receta ACFT de FUTO para trabajar con contextos de audio cortos. El modelo lo publica el usuario `marcosremar2` y está pensado para subtitulado en directo en la plataforma ucast.me, no para transcripción de archivos largos en lote.

La relevancia práctica está en el formato: al estar en ggml, se ejecuta en whisper.cpp sin necesidad de GPU ni de Python, lo que permite desplegarlo en CPU y en entornos ligeros. Se ofrecen dos variantes, `q8_0` (1,7 GB, 8 bits) y f16 (3,1 GB), y el autor reporta que la cuantización de 8 bits mantiene la precisión del f16 en sus pruebas.

Es un modelo derivado, no un entrenamiento original: la ficha documenta la conversión y una evaluación acotada (cuatro charlas mTEDx de unos 5 minutos en portugués y francés, ejecución única en CPU). No hay datos publicados sobre arquitectura interna más allá de ser Whisper large-v3, ni sobre el proceso de ajuste fino más allá de la referencia a la receta ACFT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Whisper large-v3 (transformer encoder-decoder) ajustado con la receta ACFT de FUTO |
| Parametros totales | no disponible (heredados de Whisper large-v3; el autor no los declara) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (el autor indica que está pensado para contexto de audio corto y recomienda `--audio-context` menor, sin medirlo) |
| Tipos de cuantizacion | q8_0 (8 bits) y f16 |
| Idiomas soportados | multilingüe; evaluado explícitamente en portugués y francés |
| Licencia | Apache-2.0 |
| Formato de pesos | ggml (`.bin`) para whisper.cpp; no se publican safetensors en este repo |

## Arquitectura y entrenamiento

El modelo subyacente es Whisper large-v3, un transformer encoder-decoder para reconocimiento automático del habla, ajustado con la receta ACFT (Align and Confirm, Fine-Tune) de FUTO, cuyo objetivo es que el modelo funcione bien con ventanas de audio cortas, como las que se usan en subtitulado en vivo. El repositorio no documenta el número de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO; esa información correspondería al checkpoint original de Mahmoud Ashraf, no a esta conversión.

La aportación técnica de este repositorio es la conversión de formato: se usaron `models/convert-h5-to-ggml.py` y `whisper-quantize ... q8_0` de whisper.cpp en el commit `4da27c4`, partiendo del checkpoint tal como lo publicó su autor. No hay innovaciones de decodificación propias; de hecho, el autor advierte que la política AlignAtt del modelo streaming de referencia no está implementada en whisper.cpp, por lo que las cifras de streaming de ese otro modelo no son trasladables.

## Capacidades

- Transcripción de voz a texto multilingüe, con evaluación explícita en portugués y francés.
- Funcionamiento con contexto de audio corto, orientado a subtitulado en directo.
- Ejecución en CPU mediante whisper.cpp, sin dependencias de Python ni de CUDA.
- Cuantización q8_0 con precisión reportada equivalente al f16 en las pruebas del autor.
- No se documentan tool calling, function calling, capacidades de agente, visión, audio de entrada más allá del propio ASR, ni modo de razonamiento.

## Casos de uso

- Subtitulado en directo de charlas y eventos: es el caso para el que se creó (ucast.me); con `-mc 0` y ventanas de audio cortas, el modelo genera subtítulos en portugués o francés con una tasa de error de palabra en torno al 8 % en las pruebas del autor.
- Transcripción de reuniones y entrevistas en portugués y francés: al ejecutarse en CPU con whisper.cpp, se puede desplegar en servidores sin GPU y procesar audio por segmentos.
- Generación de subtítulos para vídeo bajo demanda en entornos con recursos limitados: la variante q8_0 de 1,7 GB cabe en máquinas modestas y mantiene la precisión del f16 según el autor.
- Prototipado e integración en pipelines locales: la CLI `whisper-cli` permite encadenar la transcripción con otros scripts sin infraestructura de serving.
- Procesamiento por lotes de charlas grabadas (formato TEDx, monólogo limpio): es el dominio exacto en el que se midió el WER, aunque el autor advierte que no se evaluaron ruido, distancia al micrófono ni conversación.
- Evaluación comparativa de recetas de ajuste fino para ASR: sirve como referencia reproducible de la receta ACFT frente a Whisper large-v3 estándar en whisper.cpp.

## Benchmarks y rendimiento

El autor publica tasas de error de palabra (WER) sobre cuatro charlas mTEDx de unos 5 minutos, archivo completo, en CPU, una ejecución por configuración, texto en minúsculas, números escritos con letras y puntuación eliminada. Portugués: 1.281 palabras; francés: 1.466 palabras.

| Configuracion whisper.cpp | pt | fr |
|---|---|---|
| q8_0, `-mc 0` | 8,2 % | 8,3 % |
| f16, `-mc 0` | 8,2 % | 7,9 % |
| q8_0, contexto por defecto | 18,1 % | 10,0 % |
| f16, contexto por defecto | 17,5 % | 10,6 % |

El autor detalla que, con la configuración por defecto, la peor charla en portugués perdió 142 de sus 638 palabras (WER 31 %); con `-mc 0`, perdió 24 (WER 11 %). No se han publicado resultados de MMLU, HumanEval, GSM8K ni de benchmarks estándar de ASR (LibriSpeech, Common Voice) en la información disponible.

## Requisitos de hardware

- VRAM estimada: no aplica en la configuración medida; el autor ejecutó todo en CPU con `-ng`. Como referencia de tamaño en memoria, los pesos ocupan 1,7 GB (q8_0) y 3,1 GB (f16).
- GPU recomendadas: no disponibles; el autor reporta que Metal abortó al arrancar en su build de whisper.cpp (commit `4da27c4`, Apple M-series, solo Command Line Tools), incluso con el `ggml-tiny.bin` oficial, por lo que los resultados en GPU son desconocidos.
- Cabe en CPU de consumo y en Apple Silicon; el rendimiento en GPU no está verificado.
- Opciones de despliegue: whisper.cpp (`whisper-cli`), con la variante q8_0 recomendada por el autor.
- Latencia y throughput: no disponibles; solo se publican cifras de precisión, no de velocidad.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Formato |
|---|---|---|---|---|---|
| acft-whisper-large-v3-ggml (este) | no disponible (base large-v3) | audio corto, sin medir | WER 8,2 % pt / 8,3 % fr (q8_0, `-mc 0`) | Apache-2.0 | ggml |
| MahmoudAshraf/acft-whisper-large-v3 | no disponible (base large-v3) | audio corto | no disponible en esta ficha | Apache-2.0 (según el repo derivado) | checkpoint original (H5/safetensors, no confirmado) |
| marcosremar2/whisper-large-v3-streaming-mlx | no disponible (base large-v3) | streaming palabra a palabra (~1 s) | cifras no trasladables a whisper.cpp según el autor | no disponible | MLX |
| Whisper large-v3 original | no disponible en esta ficha | 30 s por ventana (estándar) | no disponible en esta ficha | no disponible en esta ficha | múltiples |

## Limitaciones y advertencias

- No es un modelo de streaming palabra a palabra: la política AlignAtt de `whisper-large-v3-streaming-mlx` no existe en whisper.cpp, así que sus cifras de streaming no aplican.
- Es obligatorio pasar `-mc 0`; con el contexto de texto por defecto se pierden tramos largos de audio (hasta un WER del 31 % en la peor charla portuguesa medida).
- La evaluación es muy acotada: dos idiomas, charlas limpias, una sola ejecución por configuración; no se midieron ruido, distancia al micrófono ni conversación.
- Los resultados en GPU son desconocidos; el autor solo pudo medir en CPU porque Metal falló en su entorno.
- No se midió el comportamiento con un `--audio-context` reducido, que es el modo de uso previsto para audio corto.
- Riesgo de alucinación y sesgos: no documentados por el autor; son los heredados del ajuste fino sobre Whisper large-v3 y de sus datos, no descritos en este repositorio.
- Licencia Apache-2.0, que permite uso comercial; al ser una conversión de formato de un checkpoint de terceros, conviene verificar la licencia del modelo base original (`MahmoudAshraf/acft-whisper-large-v3`).
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay validación comunitaria independiente.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/marcosremar2/acft-whisper-large-v3-ggml
- Modelo base: https://huggingface.co/MahmoudAshraf/acft-whisper-large-v3
- Receta ACFT de FUTO: https://github.com/futo-org/whisper-acft
- whisper.cpp: https://github.com/ggml-org/whisper.cpp
- Modelo streaming de referencia del mismo autor: https://huggingface.co/marcosremar2/whisper-large-v3-streaming-mlx
- ucast.me (subtitulado en directo): https://ucast.me
