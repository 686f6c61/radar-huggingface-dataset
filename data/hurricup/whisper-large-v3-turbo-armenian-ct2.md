# hurricup/whisper-large-v3-turbo-armenian-ct2

## Resumen

Este modelo es una conversión a CTranslate2 en precisión float16 del checkpoint `Chillarmo/whisper-large-v3-turbo-armenian`, un fine-tuning del modelo `openai/whisper-large-v3-turbo` especializado en reconocimiento de voz en armenio. La conversión la realizó el usuario `hurricup` mediante la herramienta `ct2-transformers-converter` sin ningún reentrenamiento adicional, por lo que conserva exactamente las mismas capacidades y pesos que el modelo original. El objetivo de esta conversión es permitir la inferencia optimizada con la librería `faster-whisper`, que aprovecha las optimizaciones de CTranslate2 para reducir la latencia y el uso de memoria en comparación con la implementación original de Whisper.

El modelo base `whisper-large-v3-turbo` es una versión optimizada de Whisper large-v3 que reduce el número de capas del decoder de 32 a 4, manteniendo una calidad de transcripción cercana a la versión completa pero con una velocidad de inferencia significativamente mayor. Al estar fine-tuneado para armenio, este checkpoint ofrece una precisión mejorada en ese idioma, aunque conserva la capacidad multilingüe del modelo original. Con un tamaño de repositorio de 1,6 GB, es adecuado para despliegues en entornos con recursos moderados, incluyendo GPUs de consumo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Whisper large-v3 turbo (encoder-decoder transformer) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (Whisper usa ventanas de audio de 30 segundos) |
| Tipos de cuantizacion | float16 (conversion CTranslate2) |
| Idiomas soportados | Armenio (hy) como idioma principal; conserva capacidades multilingues del modelo base |
| Licencia | Apache-2.0 |
| Formato de pesos | CTranslate2 (binarios propios de la libreria) |

## Arquitectura y entrenamiento

El modelo original `whisper-large-v3-turbo` es un transformer encoder-decoder con 4 capas en el decoder (en lugar de las 32 del large-v3 completo), lo que reduce el coste computacional y la latencia sin sacrificar demasiada precisión. El fine-tuning para armenio se realizó sobre el checkpoint turbo, ajustando los pesos para mejorar el reconocimiento de ese idioma. La conversión a CTranslate2 no modifica la arquitectura ni los pesos; simplemente transforma el formato a uno optimizado para inferencia con `faster-whisper`, que utiliza kernels específicos de CPU y GPU, así como cuantización dinámica y búsqueda por beam search optimizada.

No se dispone de información detallada sobre el dataset de fine-tuning ni sobre el número de tokens de entrenamiento. El proceso de conversión se realizó con el comando `ct2-transformers-converter --quantization float16`, lo que implica que los pesos se almacenan en precisión media para reducir el uso de memoria y acelerar la inferencia.

## Capacidades

- Reconocimiento de voz automatico (ASR) en armenio, con alta precision gracias al fine-tuning especifico.
- Transcripcion de audio a texto en tiempo real o por lotes, con soporte para segmentacion temporal.
- Capacidad multilingue heredada del modelo base, aunque con menor rendimiento en idiomas distintos del armenio.
- Soporte para deteccion de idioma y transcripcion con timestamp a nivel de segmento.
- Integracion con la libreria `faster-whisper`, que permite configurar parametros como beam size, temperatura y supresion de tokens.
- No incluye capacidades de tool calling, agentes ni razonamiento multi-paso, ya que es un modelo puramente de ASR.

## Casos de uso

- Transcripcion de reuniones y conferencias en armenio: el modelo puede procesar grabaciones de audio largas y generar transcripciones con marcas de tiempo, facilitando la generacion de actas o busquedas posteriores.
- Subtitulado automatico de videos en armenio: al integrarse con pipelines de procesamiento de video, permite generar subtitulos en tiempo real o de forma offline para plataformas de streaming o contenido educativo.
- Asistentes de voz para servicios de atencion al cliente: el modelo puede transcribir llamadas telefonicas en armenio, permitiendo analisis de sentimiento, extraccion de informacion o entrenamiento de modelos de clasificacion.
- Archivado y busqueda de contenido audiovisual: al transcribir archivos de audio o video, se habilita la busqueda por texto dentro de grandes colecciones de medios en armenio.
- Herramientas de accesibilidad para personas con discapacidad auditiva: la transcripcion en tiempo real puede alimentar sistemas de subtitulado en vivo para eventos o aplicaciones de comunicacion.
- Investigacion linguistica y procesamiento de corpus: el modelo permite transcribir grandes volumenes de audio en armenio para construir corpus textuales, analisis fonetico o estudios sociolinguisticos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Dado que es una conversion sin reentrenamiento, el rendimiento esperado es identico al del modelo `Chillarmo/whisper-large-v3-turbo-armenian`, pero no se dispone de metricas concretas (WER, CER, etc.) en la documentacion proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo en float16 ocupa aproximadamente 1,6 GB en disco, por lo que la VRAM necesaria para cargar los pesos es de al menos 2 GB, aunque se recomienda 4 GB para dejar margen a los buffers de audio y calculos intermedios.
- GPU recomendadas: cualquier GPU con soporte CUDA y al menos 4 GB de VRAM, como NVIDIA GTX 1650, RTX 3060, RTX 4090, o GPUs de datacenter como A10, A100 o H100. Tambien puede ejecutarse en CPU con `compute_type="int8"` o `"float32"`, aunque con mayor latencia.
- En consumer GPU: si, cabe en GPUs de gama media como RTX 3060 (12 GB) o RTX 4060 (8 GB) sin problemas.
- Opciones de despliegue: `faster-whisper` (recomendado), que soporta CUDA, CPU y entornos con memoria limitada. Tambien puede usarse con `ctranslate2` directamente o mediante servidores como `whisper.cpp` (aunque este ultimo requiere conversion adicional).
- Latencia y throughput: no se dispone de mediciones exactas, pero al ser una version turbo con 4 capas de decoder, la inferencia es aproximadamente 4 veces mas rapida que el large-v3 completo, con un throughput tipico de 10-20x tiempo real en GPUs modernas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Especializacion |
|---|---|---|---|---|---|
| `hurricup/whisper-large-v3-turbo-armenian-ct2` | no disponible (base: ~809M) | 30 s de audio | Apache-2.0 | CTranslate2 | Armenio |
| `openai/whisper-large-v3-turbo` | ~809M | 30 s de audio | MIT | PyTorch | Multilingue |
| `openai/whisper-large-v3` | ~1550M | 30 s de audio | MIT | PyTorch | Multilingue |
| `Chillarmo/whisper-large-v3-turbo-armenian` | ~809M | 30 s de audio | Apache-2.0 | PyTorch | Armenio |

La principal diferencia con el modelo base es la especializacion en armenio, que mejora el WER en ese idioma. Frente a whisper-large-v3, la version turbo sacrifica algo de precision a cambio de una latencia mucho menor. La conversion a CTranslate2 no altera el rendimiento, pero facilita el despliegue en produccion con `faster-whisper`.

## Limitaciones y advertencias

- El modelo esta fine-tuneado principalmente para armenio; su rendimiento en otros idiomas puede ser inferior al del modelo base multilingue.
- Al ser una conversion sin reentrenamiento, no se han corregido posibles sesgos presentes en el modelo original, como errores en acentos regionales o vocabulario tecnico especifico.
- Riesgo de alucinaciones en audio de baja calidad, con ruido de fondo o habla superpuesta, comun en todos los modelos Whisper.
- La licencia Apache-2.0 permite uso comercial, pero se debe atribuir correctamente al autor original del fine-tuning y a OpenAI por el modelo base.
- No se proporcionan garantias de precision para casos de uso medicos, legales o de seguridad; se recomienda validacion humana en aplicaciones criticas.
- El formato CTranslate2 es especifico de la libreria `ctranslate2`; para usar con otras herramientas (p.ej., `whisper.cpp`) se requiere una conversion adicional.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/hurricup/whisper-large-v3-turbo-armenian-ct2
- Modelo fuente (fine-tuning): https://huggingface.co/Chillarmo/whisper-large-v3-turbo-armenian
- Modelo base (OpenAI): https://huggingface.co/openai/whisper-large-v3-turbo
- Repositorio de faster-whisper: https://github.com/SYSTRAN/faster-whisper
- Discusion sobre el modelo turbo: https://github.com/openai/whisper/discussions/2363
