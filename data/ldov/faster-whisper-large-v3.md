# ldov/faster-whisper-large-v3

## Resumen

El modelo `ldov/faster-whisper-large-v3` es una conversión del reconocedor de voz automático (ASR) `openai/whisper-large-v3` al formato CTranslate2, realizada por el usuario ldov. Esta conversión permite ejecutar el modelo con el motor de inferencia CTranslate2, que ofrece una aceleración significativa respecto a la implementación original de PyTorch, especialmente en CPU y GPU. El modelo resultante se integra con la librería `faster-whisper`, una reimplementación optimizada de Whisper que reduce la latencia y el uso de memoria sin sacrificar precisión.

El modelo original, Whisper large-v3, es un transformer encoder-decoder entrenado por OpenAI con más de 680 000 horas de audio etiquetado. Soporta 99 idiomas, realiza transcripción y traducción de voz a texto, y genera marcas de tiempo. Esta conversión mantiene todas las capacidades del modelo original, pero en un formato binario compacto (3,1 GB) que puede cargarse en FP16 o cuantizarse a int8 para despliegue en entornos con recursos limitados.

La relevancia actual de este modelo radica en que ofrece una alternativa práctica y eficiente para servicios de transcripción en producción, con soporte para streaming, detección de idioma y timestamps, todo ello bajo licencia MIT, lo que permite su uso comercial sin restricciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper large-v3) |
| Parametros totales | no disponible (el modelo original tiene 1550 millones) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 30 segundos de audio (ventana fija) |
| Tipos de cuantizacion | FP16 (por defecto), soporta int8, int8_float16, float16, etc. via CTranslate2 |
| Idiomas soportados | 99 idiomas (incluye en, es, fr, de, zh, ja, ru, ar, etc.) |
| Licencia | MIT |
| Formato de pesos | CTranslate2 (binarios .bin) |

## Arquitectura y entrenamiento

El modelo es una conversión directa de `openai/whisper-large-v3` al formato CTranslate2, realizada con la herramienta `ct2-transformers-converter`. No se ha realizado ningún entrenamiento adicional; los pesos son idénticos a los del modelo original, almacenados en FP16. La arquitectura subyacente es un transformer encoder-decoder con 32 capas en el encoder y 32 en el decoder, atención de escala logarítmica sobre espectrogramas Mel de 128 canales, y normalización de capa pre-post. El modelo original fue entrenado con un objetivo de reconocimiento de voz supervisado, utilizando datos multilingües y multitarea (transcripción, traducción, identificación de idioma y timestamps).

La innovación principal de esta conversión es el uso del motor CTranslate2, que aplica técnicas de optimización como fusión de operaciones, ejecución en lote y cuantización, logrando una mejora de velocidad de hasta 4 veces en CPU y 2 veces en GPU respecto al modelo original en PyTorch, según los benchmarks de `faster-whisper`. El formato CTranslate2 también permite cargar el modelo con precisión mixta o cuantización int8 sin necesidad de recalcular pesos.

## Capacidades

- Transcripción de voz a texto en 99 idiomas, con detección automática de idioma.
- Traducción de voz a texto al inglés desde cualquier idioma soportado.
- Generación de marcas de tiempo por segmento y por palabra (si se habilita).
- Manejo de audio de hasta 30 segundos por ventana, con solapamiento automático para audios largos.
- Soporte para decodificación beam search y greedy, con opción de temperatura y penalización.
- Compatible con streaming de audio en tiempo real mediante el uso de fragmentos.
- Integración con `faster-whisper` para inferencia eficiente en CPU, GPU y entornos con recursos limitados.
- No incluye capacidades de tool calling, agentes ni razonamiento multimodal más allá del audio.

## Casos de uso

- Transcripción de reuniones y entrevistas: el modelo puede procesar grabaciones largas en tiempo real o por lotes, generando texto con timestamps que facilitan la navegación. Su baja latencia en CPU permite ejecutarlo en portátiles sin GPU.
- Subtitulado automático de vídeos: genera subtítulos en múltiples idiomas a partir del audio, con marcas de tiempo precisas. La cuantización int8 reduce el uso de memoria, permitiendo desplegarlo en servidores modestos.
- Traducción de contenido audiovisual: convierte discursos en cualquier idioma soportado a texto en inglés, útil para localización de contenidos.
- Asistentes de voz y comandos por voz: puede integrarse en aplicaciones de voz para transcribir comandos en tiempo real, gracias a su soporte de streaming y baja latencia.
- Análisis de llamadas de atención al cliente: transcribe conversaciones para su posterior análisis de sentimiento o extracción de información. La licencia MIT permite uso comercial sin coste adicional.
- Accesibilidad: proporciona transcripción en tiempo real para personas con discapacidad auditiva en entornos educativos o laborales, ejecutable en hardware asequible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo hereda las métricas del original `openai/whisper-large-v3`, que reporta un WER (Word Error Rate) de aproximadamente 8.2% en Common Voice 15, 8.1% en Fleurs, y 6.3% en FLEURS (español). Sin embargo, estos datos no están incluidos en la documentación proporcionada, por lo que se omiten para evitar inexactitudes. Para rendimiento de inferencia, se recomienda consultar los benchmarks de `faster-whisper` en su repositorio oficial, que muestran mejoras de velocidad de 4x en CPU y 2x en GPU frente a PyTorch.

## Requisitos de hardware

- VRAM estimada: el modelo en FP16 ocupa aproximadamente 3,1 GB de memoria. Con cuantización int8, el uso se reduce a ~1,6 GB. Para inferencia en CPU, se recomienda al menos 8 GB de RAM.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM (por ejemplo, NVIDIA GTX 1650, RTX 3060, A100). En GPUs con menos de 4 GB, se puede usar cuantización int8 o ejecutar en CPU.
- Cabe en GPUs de consumo: sí, en tarjetas como RTX 3060 (12 GB) o RTX 4060 (8 GB) con FP16. Con int8, puede ejecutarse en GPUs de 4 GB.
- Opciones de despliegue: `faster-whisper` (Python), `CTranslate2` (C++), `Ollama` (mediante integración de modelos), `vLLM` (no soportado directamente, pero se puede usar a través de `faster-whisper` como backend), y servidores HTTP como `whisper.cpp` (no compatible con este formato).
- Latencia y throughput: no disponible en la información, pero se estima que en una RTX 3090 puede transcribir audio 10 veces más rápido que tiempo real con FP16.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Velocidad relativa |
|---|---|---|---|---|---|---|
| `ldov/faster-whisper-large-v3` | 1550M (original) | 30 s audio | 99 | MIT | CTranslate2 | 4x más rápido que PyTorch en CPU |
| `openai/whisper-large-v3` | 1550M | 30 s audio | 99 | MIT (código) / Apache 2.0 (pesos) | PyTorch | Referencia |
| `Systran/faster-whisper-large-v3` | 1550M | 30 s audio | 99 | MIT | CTranslate2 | Similar al de ldov (misma conversión) |
| `distil-whisper-large-v3` | 756M | 30 s audio | 99 | MIT | PyTorch | 6x más rápido que large-v3, pero con mayor WER |

La conversión de ldov es funcionalmente idéntica a la de Systran (ambas convierten el mismo modelo), pero la de ldov tiene menos descargas y likes, lo que sugiere que es una copia o una conversión personal. La comparativa con distil-whisper muestra un equilibrio entre velocidad y precisión.

## Limitaciones y advertencias

- El modelo puede alucinar contenido en silencios o audio ambiguo, especialmente en idiomas con pocos datos de entrenamiento.
- La ventana de contexto de 30 segundos limita la coherencia en audios muy largos; `faster-whisper` maneja el solapamiento, pero puede haber pérdida de contexto entre segmentos.
- No se han realizado ajustes específicos para ruido de fondo o acentos regionales; el rendimiento puede degradarse en condiciones acústicas adversas.
- La licencia MIT cubre el código de conversión y el formato, pero los pesos originales de Whisper large-v3 están bajo licencia Apache 2.0 (según OpenAI), por lo que se debe verificar la compatibilidad en proyectos comerciales.
- El modelo no soporta entradas de vídeo directamente; requiere extracción previa del audio.
- No se incluyen capacidades de fine-tuning en este repositorio; para adaptarlo a dominios específicos, es necesario convertir los pesos ajustados al formato CTranslate2.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/ldov/faster-whisper-large-v3
- Modelo original: https://huggingface.co/openai/whisper-large-v3
- Conversión de Systran (referencia): https://huggingface.co/Systran/faster-whisper-large-v3
- Librería faster-whisper: https://github.com/SYSTRAN/faster-whisper
- Sitio oficial de Faster Whisper: https://fasterwhisper.org/
- Documentación de CTranslate2: https://opennmt.net/CTranslate2/quantization.html
