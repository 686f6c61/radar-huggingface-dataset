# BleuCPU/wraith-voice-pack

## Resumen

Wraith voice pack es un repositorio que actúa como espejo de los modelos de voz utilizados por la aplicación Wraith (wraith.chat, iOS), un asistente conversacional que ejecuta síntesis de voz en el dispositivo. El paquete combina dos componentes de Neuphonic: NeuTTS-Air, un modelo de lenguaje de texto a voz, y NeuCodec, un codec neuronal de audio. El autor, BleuCPU, lo publica en Hugging Face para que la aplicación controle sus propias URLs de descarga, sin depender de fuentes externas.

El modelo principal es NeuTTS-Air en formato GGUF cuantizado a Q4_K_M, con aproximadamente 748 millones de parámetros, junto con los decodificadores y codificadores de NeuCodec en formato ONNX (int8). Todo el paquete se distribuye bajo licencia Apache-2.0, lo que permite uso comercial y modificación. Su relevancia radica en que ofrece una solución completa de TTS on-device con clonación de voz, pensada para aplicaciones móviles y entornos con recursos limitados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | NeuTTS-Air (modelo de lenguaje de texto a voz) + NeuCodec (codec neuronal de audio) |
| Parametros totales | 747.930.496 (safetensors, correspondiente al modelo NeuTTS-Air) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (GGUF) para NeuTTS-Air; int8 (ONNX) para NeuCodec |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (NeuTTS-Air), ONNX (NeuCodec encoder/decoder) |

## Arquitectura y entrenamiento

NeuTTS-Air es un modelo de lenguaje autoregresivo diseñado para síntesis de voz, que genera tokens de audio a partir de texto. Se distribuye en formato GGUF cuantizado a Q4_K_M, lo que permite su ejecución en dispositivos con memoria limitada. NeuCodec es un codec neuronal que comprime y reconstruye audio; en este paquete se incluyen dos variantes: un decodificador en ONNX int8 para reconstruir la señal de audio a partir de los tokens generados, y un codificador destilado (distill-NeuCodec) en ONNX para clonación de voz, que extrae características vocales de una muestra de referencia.

No se dispone de información detallada sobre el dataset de entrenamiento, el número de tokens procesados ni el uso de técnicas como RLHF o DPO. Los pesos originales provienen de Neuphonic (neuphonic/neutts-air y neuphonic/neucodec), y este repositorio es un mirror con conversiones a formatos optimizados para inferencia on-device.

## Capacidades

- Síntesis de voz de alta calidad a partir de texto (text-to-speech).
- Clonación de voz mediante el codificador distill-NeuCodec, que permite replicar una voz a partir de una muestra de audio.
- Inferencia en dispositivo (on-device), sin necesidad de conexión a servidores externos.
- Compatible con pipelines de Hugging Face (pipeline: text-to-speech).
- Formato GGUF permite ejecución con llama.cpp, Ollama u otros motores compatibles con cuantización.
- Formato ONNX facilita la integración con runtime de ONNX en plataformas móviles y de escritorio.
- Diseñado para aplicaciones conversacionales, como el asistente Wraith en iOS.

## Casos de uso

- Asistentes de voz en dispositivos móviles: el paquete está pensado para aplicaciones como Wraith, donde la síntesis de voz se ejecuta localmente, reduciendo latencia y preservando privacidad al no enviar audio a la nube.
- Clonación de voz personalizada: el codificador distill-NeuCodec permite crear voces personalizadas a partir de una grabación corta, útil para aplicaciones de accesibilidad o entretenimiento.
- Lectura de textos en aplicaciones de noticias o libros electrónicos: el modelo puede generar audio natural para artículos o capítulos, funcionando sin conexión.
- Sistemas de respuesta interactiva por voz (IVR): integrable en centralitas telefónicas o chatbots de voz que requieran respuestas generadas dinámicamente.
- Prototipado rápido de TTS en entornos de desarrollo: al estar en GGUF y ONNX, se puede probar en CPU o GPU modesta con herramientas como llama.cpp o ONNX Runtime.
- Aplicaciones de accesibilidad para personas con discapacidad visual: conversión de texto en pantalla a voz con baja latencia y sin dependencia de servicios externos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni métricas específicas de TTS como MOS (Mean Opinion Score) o latencia de inferencia.

## Requisitos de hardware

- VRAM estimada: no disponible oficialmente, pero al ser un modelo de ~748M parámetros cuantizado a Q4_K_M, el archivo GGUF ocupa aproximadamente 0,5-0,7 GB, por lo que puede ejecutarse en GPUs con 2 GB de VRAM o incluso en CPU.
- GPU recomendadas: cualquier GPU con soporte para CUDA o Metal (Apple Silicon) puede ejecutar el modelo; también funciona en CPU con llama.cpp.
- Compatibilidad con GPU de consumo: sí, cabe en tarjetas como GTX 1650, RTX 3060, RTX 4090, y en Apple Silicon (M1/M2/M3) gracias al formato GGUF.
- Opciones de despliegue: llama.cpp, Ollama (si se convierte a un formato compatible), ONNX Runtime para los componentes ONNX, y Hugging Face pipelines.
- Latencia y throughput: no disponibles. Al ser un modelo de lenguaje autoregresivo, la latencia depende de la longitud del texto y del hardware; en dispositivos móviles modernos se espera una generación en tiempo real o casi real, pero no hay cifras publicadas.

## Comparativa con modelos similares

No se dispone de datos comparativos publicados con otros modelos TTS. Como referencia general, alternativas en el mismo espacio de TTS on-device incluyen:

| Modelo | Parametros | Formato | Licencia | Notas |
|---|---|---|---|---|
| Wraith voice pack (NeuTTS-Air + NeuCodec) | ~748M | GGUF + ONNX | Apache-2.0 | Incluye clonación de voz, on-device |
| VITS | ~30-100M | PyTorch | MIT | TTS clásico, no incluye codec neuronal |
| Bark | ~1.2B | PyTorch | MIT | TTS con efectos, requiere más recursos |
| Piper | ~100-200M | ONNX | MIT | Optimizado para Raspberry Pi, sin clonación de voz |

La comparación es orientativa; no hay benchmarks comunes publicados que permitan una comparación cuantitativa rigurosa.

## Limitaciones y advertencias

- No se especifican los idiomas soportados; es probable que el modelo esté entrenado principalmente en inglés, pero no está confirmado.
- Riesgo de alucinación en la síntesis: como modelo de lenguaje, puede generar pronunciaciones incorrectas o artefactos en palabras poco comunes.
- La clonación de voz puede plantear problemas éticos y legales si se usa sin consentimiento de la persona cuya voz se replica.
- El repositorio es un mirror; los pesos originales provienen de Neuphonic, y aunque la licencia es Apache-2.0, conviene verificar las condiciones de uso de los modelos upstream.
- No hay documentación sobre latencia en dispositivos de gama baja; el rendimiento puede variar significativamente según el hardware.
- El formato ONNX int8 puede introducir pérdida de calidad en el audio reconstruido frente a la versión de precisión completa.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/BleuCPU/wraith-voice-pack
- Perfil del autor: https://huggingface.co/BleuCPU
- Modelo original NeuTTS-Air: https://huggingface.co/neuphonic/neutts-air
- Modelo original NeuCodec: https://huggingface.co/neuphonic/neucodec
- Conversión GGUF de NeuTTS-Air: https://huggingface.co/mradermacher/neutts-air-GGUF
- Codificador destilado NeuCodec: https://huggingface.co/neuphonic/distill-neucodec
