# CodeWithAhsan/whisper-medium-urdu-ggml

## Resumen

El modelo `CodeWithAhsan/whisper-medium-urdu-ggml` es una conversión al formato GGML del fine-tune `Abdul145/whisper-medium-urdu-custom`, un modelo de reconocimiento automático del habla (ASR) basado en Whisper Medium de OpenAI, especializado en el idioma urdu. El repositorio reempaqueta los pesos del modelo original para que puedan cargarse directamente en herramientas basadas en whisper.cpp, como `whisper-cli` o la utilidad `ossclip`, sin necesidad de realizar una conversión previa en Python.

Este modelo resuelve el problema de la transcripción de audio en urdu con una solución ligera y portable, aprovechando la arquitectura robusta de Whisper Medium (un transformer encoder-decoder) adaptada a un idioma de bajos recursos como el urdu. Su relevancia radica en que facilita el despliegue de ASR en entornos de producción o en dispositivos con recursos limitados, gracias al formato GGML que permite ejecución en CPU y GPU con bajo consumo de memoria.

El repositorio contiene un único archivo `ggml-medium-urdu.bin` de aproximadamente 1,4 GB, con licencia Apache-2.0. El modelo está pensado para transcripción de audio en urdu, con soporte para subtitulado con marcas de tiempo y diseño RTL (derecha a izquierda) cuando se usa con la herramienta `ossclip`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper Medium) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (formato GGML sin especificar precisión) |
| Idiomas soportados | urdu (`ur`) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGML (binario, `ggml-medium-urdu.bin`) |

## Arquitectura y entrenamiento

El modelo es un fine-tune del checkpoint `Abdul145/whisper-medium-urdu-custom`, que a su vez se basa en Whisper Medium de OpenAI. Whisper Medium emplea una arquitectura transformer encoder-decoder con aproximadamente 769 millones de parámetros, aunque este dato no se especifica en la información proporcionada. El proceso de entrenamiento del fine-tune original no está documentado en la model card; solo se indica que es una adaptación para el reconocimiento de habla en urdu.

La conversión a GGML se realizó con el script `models/convert-h5-to-ggml.py` del repositorio whisper.cpp. No se detallan los datos de entrenamiento (número de tokens, composición del dataset, uso de RLHF o DPO) ni innovaciones técnicas adicionales más allá de la propia conversión de formato.

## Capacidades

- Transcripción de audio en urdu: el modelo convierte señales de habla en texto en idioma urdu.
- Compatibilidad con whisper.cpp: se puede ejecutar directamente con `whisper-cli` usando el flag `-l ur`.
- Integración con `ossclip`: permite generar subtítulos con marcas de tiempo y diseño RTL (derecha a izquierda) para vídeos, incluyendo la fuente Noto Nastaliq Urdu.
- Soporte de detección de idioma implícita: al ser un modelo específico de urdu, no requiere especificar el idioma en la invocación (aunque se recomienda indicarlo).
- No se documentan capacidades adicionales como tool calling, razonamiento multi-paso o procesamiento de vision/audio más allá del ASR.

## Casos de uso

- Transcripción de reuniones y entrevistas en urdu: el modelo puede convertir grabaciones de audio en texto, facilitando la generación de actas o la búsqueda de contenido. Su formato GGML permite ejecutarlo en servidores con CPU sin GPU dedicada.
- Subtitulado automático de vídeos en urdu: con `ossclip`, se pueden generar subtítulos con marcas de tiempo y alineación RTL, ideal para canales de YouTube o plataformas de vídeo en urdu.
- Archivado y búsqueda de contenido de audio: al transcribir archivos de audio históricos, se habilita la indexación y búsqueda por texto en urdu.
- Asistentes de voz en urdu: el modelo puede servir como backend de ASR para aplicaciones de voz a texto en dispositivos embebidos o de bajo consumo, gracias a la eficiencia de whisper.cpp.
- Accesibilidad para hablantes de urdu: transcripción de clases, conferencias o podcasts para personas con discapacidad auditiva.
- Análisis de llamadas de atención al cliente: transcripción de grabaciones de centros de contacto en urdu para su posterior análisis de sentimiento o cumplimiento normativo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El archivo del modelo pesa aproximadamente 1,4 GB, por lo que se requiere al menos 2 GB de memoria libre (RAM o VRAM) para cargarlo en memoria durante la inferencia.
- Puede ejecutarse en CPU con whisper.cpp, siendo adecuado para servidores sin GPU o para despliegues en edge.
- En GPU, una tarjeta con 2-4 GB de VRAM (por ejemplo, NVIDIA GTX 1650, RTX 2060 o superiores) es suficiente para una inferencia fluida.
- Opciones de despliegue: whisper.cpp (CLI), integración con `ossclip`, o cualquier herramienta compatible con modelos GGML.
- No se proporcionan datos de latencia o throughput específicos en la información disponible.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. Se podría considerar la comparación con el modelo base `Abdul145/whisper-medium-urdu-custom` (en formato PyTorch) o con otros modelos ASR para urdu, pero no hay datos concretos para establecer una tabla comparativa.

## Limitaciones y advertencias

- El modelo está especializado únicamente en urdu; no es adecuado para otros idiomas.
- No se documentan sesgos específicos, pero al ser un fine-tune de Whisper Medium, puede heredar limitaciones del modelo base, como dificultades con acentos muy marcados, ruido de fondo extremo o habla solapada.
- No se indica la precisión de cuantización del archivo GGML, por lo que podría haber una pérdida de calidad respecto al modelo original en float32.
- La licencia Apache-2.0 permite uso comercial, pero se debe atribuir al autor original del fine-tune (`Abdul145`) y al conversor (`CodeWithAhsan`).
- Para uso en producción, se recomienda validar la precisión en el dominio específico de audio antes de desplegar, ya que no hay benchmarks publicados.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/CodeWithAhsan/whisper-medium-urdu-ggml
- Modelo base (fine-tune original): https://huggingface.co/Abdul145/whisper-medium-urdu-custom
- Repositorio whisper.cpp: https://github.com/ggml-org/whisper.cpp
- Herramienta ossclip: https://github.com/CodeWithAhsan/ossclip
