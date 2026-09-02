# bhaskaro/ainotes-whisper-hindi-q5_1

## Resumen

El modelo `bhaskaro/ainotes-whisper-hindi-q5_1` es una conversión al formato GGML del fine-tune `vasista22/whisper-hindi-small`, un modelo de reconocimiento automático del habla (ASR) basado en la arquitectura Whisper de OpenAI, especializado en hindi. El autor, `bhaskaro`, ha cuantizado el modelo a precisión q5_1 para permitir su ejecución eficiente en dispositivos con recursos limitados, como teléfonos móviles de gama media, utilizando la librería `whisper.cpp`. El resultado es un archivo de aproximadamente 190 MB que funciona más rápido que el tiempo real en un Snapdragon 720G con 4 hilos.

Este modelo resuelve el problema de transcripción de audio en hindi con un bajo coste computacional, manteniendo una tasa de error de palabra (WER) del 14,7 % en el conjunto de pruebas FLEURS `hi_in`. Es relevante para aplicaciones de ASR en entornos on-device, donde la privacidad, la latencia y el consumo de recursos son críticos. La licencia Apache 2.0 permite su uso comercial sin restricciones adicionales.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Whisper (small), encoder-decoder transformer |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (Whisper estándar usa ventanas de 30 segundos, no confirmado) |
| Tipos de cuantizacion | q5_1 (también disponible float16 en el proceso de conversión, no publicado) |
| Idiomas soportados | hindi (hi) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGML (binario de whisper.cpp) |

## Arquitectura y entrenamiento

El modelo original `vasista22/whisper-hindi-small` es un fine-tune de Whisper small (244M parámetros, aunque no confirmado en la información proporcionada) entrenado para transcripción de hindi. La arquitectura es un transformer encoder-decoder con atención, como en Whisper. El fine-tune se realizó sobre transcripciones planas, sin predicción de timestamps, lo que implica que los tokens de timestamp no están entrenados. Por ello, al usar el modelo con `whisper.cpp`, es imprescindible activar la opción `no_timestamps` (`-nt`) para evitar segmentaciones incorrectas y salidas alucinadas.

La conversión a GGML se hizo mediante el script `convert-h5-to-ggml.py` de whisper.cpp, pasando a float16 y luego cuantizando a q5_1. La tabla de tokens se verificó byte a byte contra la publicada por ggerganov para garantizar coherencia. La cuantización q5_1 reduce el tamaño 2,6 veces y acelera la inferencia 1,34 veces respecto a float16, sin pérdida significativa de precisión (14,7 % WER frente a 15,9 %).

## Capacidades

- Transcripción automática de voz en hindi a texto.
- Reconocimiento de habla en tiempo real en dispositivos con CPU limitada (demostrado en un Snapdragon 720G con 4 hilos).
- Soporte para inferencia con `whisper.cpp`, compatible con múltiples plataformas (móvil, escritorio, embebido).
- Funciona con configuraciones de decodificación greedy y sin timestamps.
- No requiere GPU, funciona únicamente con CPU.

## Casos de uso

- Transcripción de notas de voz en hindi en aplicaciones de mensajería: el modelo puede convertir mensajes de audio a texto directamente en el dispositivo, sin enviar datos a la nube, gracias a su bajo consumo de recursos y tamaño reducido.
- Subtitulado automático de vídeos en hindi para plataformas de contenido: la transcripción puede integrarse en pipelines de edición de vídeo, generando subtítulos con una precisión aceptable (WER 14,7 %).
- Asistentes de voz para hindi en dispositivos IoT: al ser un modelo pequeño y rápido, puede ejecutarse en dispositivos con poca memoria, permitiendo comandos de voz locales sin conexión.
- Accesibilidad para personas con discapacidad auditiva: convierte conferencias, reuniones o clases en hindi a texto en tiempo real, facilitando la inclusión.
- Análisis de llamadas de atención al cliente en hindi: las empresas pueden transcribir grabaciones de llamadas para extraer información o generar resúmenes, manteniendo la privacidad al procesarlo localmente.
- Herramientas de dictado para aplicaciones de productividad en hindi: permite escribir documentos o correos electrónicos mediante voz en hindi, con respuesta inmediata y sin depender de servicios externos.

## Benchmarks y rendimiento

El autor reporta mediciones propias sobre 64 clips de FLEURS `hi_in` usando whisper.cpp con decodificación greedy y `no_timestamps`:

| Metrica | Valor |
|---|---|
| Word error rate (WER) | 14,7 % |
| Character error rate (CER) | 7,2 % |

También se observó que con timestamps activados el WER sube al 47,5 %, mientras que desactivándolos baja al 14,9 %. No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- Tamaño del modelo: ~190 MB en q5_1.
- Inferencia en CPU: funciona en un Snapdragon 720G (4 hilos) más rápido que tiempo real, según el autor.
- No requiere GPU; puede ejecutarse en CPUs de gama baja, Raspberry Pi u otros dispositivos embebidos.
- VRAM: no aplica, es un modelo para CPU, aunque también podría ejecutarse en GPU si se convierte a otros formatos.
- Despliegue recomendado: usar `whisper.cpp` (CLI o biblioteca) con la opción `-nt` (no_timestamps) obligatoria.
- Alternativas de despliegue: no se mencionan otros runners (Ollama, vLLM, etc.), pero al ser GGML es compatible con cualquier frontend que soporte whisper.cpp.

## Comparativa con modelos similares

No se dispone de información comparativa con otros modelos ASR para hindi en la documentación proporcionada. Se recomienda evaluar otros fine-tunes de Whisper para hindi (por ejemplo, `vasista22/whisper-hindi-small` en float16) o modelos multilingües como Whisper large, aunque con mayor coste computacional.

## Limitaciones y advertencias

- Es imprescindible usar `no_timestamps`; si se activan los timestamps, el modelo produce texto fluido pero incorrecto (WER 47,5 %), debido a que los tokens de timestamp no están entrenados.
- Solo soporta hindi; no es multilingüe.
- El WER del 14,7 % puede ser elevado para transcripciones que requieran alta precisión, como documentos legales o médicos.
- El modelo puede alucinar contenido si el audio es ruidoso o de baja calidad, especialmente si no se respeta la configuración de decodificación recomendada.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base deriva de Whisper (MIT) y del fine-tune de `vasista22`, cuyos términos se mantienen.
- No se garantiza la disponibilidad de actualizaciones o soporte técnico por parte del autor.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/bhaskaro/ainotes-whisper-hindi-q5_1)
- [Modelo base: vasista22/whisper-hindi-small](https://huggingface.co/vasista22/whisper-hindi-small)
- [Repositorio whisper.cpp](https://github.com/ggml-org/whisper.cpp)
- [Proyecto relacionado: OpenAI Whisper ASR para hindi (GitHub)](https://github.com/2003HARSH/OpenAI-Whisper-Automated-Hindi-Speech-Recognition)
