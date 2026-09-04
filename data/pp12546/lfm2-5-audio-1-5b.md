# PP12546/LFM2.5-Audio-1.5B

## Resumen

LFM2.5-Audio-1.5B es un modelo de lenguaje y audio desarrollado por Liquid AI, una empresa especializada en arquitecturas de modelos fundacionales. Combina un codificador de audio FastConformer con un backbone híbrido de atención y SSM (State Space Model), lo que le permite procesar y generar audio y texto de forma interleaved. Con 1.5B parámetros, se presenta como una opción ligera para tareas de voz, como síntesis de voz, reconocimiento de voz multilingüe y chat de voz. Su relevancia radica en ofrecer capacidades multimodales en un tamaño compacto, ideal para despliegues en entornos con recursos limitados o en GPU de consumo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: FastConformer (encoder de audio) + backbone de atención/SSM |
| Parametros totales | 1.5B |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 32,768 tokens (según una fuente; otra fuente indica 65,536) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Inglés (según la tabla; la descripción menciona "multilingüe") |
| Licencia | Open License v1.0 |
| Formato de pesos | No disponible (probablemente safetensors, pero no se especifica) |

## Arquitectura y entrenamiento

El modelo utiliza una arquitectura híbrida que combina un codificador de audio FastConformer con un backbone de atención y SSM. Esta combinación permite manejar señales de audio continuas de manera eficiente, tokenizando el audio a 24 kHz. El modelo es capaz de generar tanto texto como audio, lo que lo hace adecuado para tareas de voz. No se proporcionan detalles sobre los datos de entrenamiento, el número de tokens, ni si se utilizó RLHF o DPO.

## Capacidades

- Generación de texto y audio (síntesis de voz natural).
- Reconocimiento de voz multilingüe (aunque solo se especifica inglés en la tabla).
- Chat de voz interleaved (conversaciones donde se alternan texto y audio).
- Soporte de dos rutinas de generación: una para audio (diseñada para conversación en tiempo real) y otra para texto (adecuada para tareas como ASR o TTS).
- Posible soporte de tool calling (mencionado en el texto, aunque no se detalla).
- Soporte de agentes y razonamiento multi-paso (mencionado de forma general).

## Casos de uso

1. **Asistentes de voz en tiempo real**: el modelo puede mantener conversaciones de voz con baja latencia, gracias a su tamaño compacto y a su rutina de generación de audio optimizada para chat.
2. **Transcripción y traducción de audio**: su capacidad de reconocimiento de voz permite transcribir audio en texto, útil para subtitulado o análisis de llamadas.
3. **Síntesis de voz para aplicaciones de accesibilidad**: generar voz natural para lectores de pantalla o interfaces habladas.
4. **Chatbots multimodales**: combinar texto y audio en una misma interfaz, permitiendo respuestas habladas y escritas según el contexto.
5. **Aplicaciones de edge computing**: al ser un modelo de 1.5B, puede ejecutarse en GPU de consumo o incluso en CPU con cuantización, ideal para dispositivos locales.
6. **Generación de contenido de audio**: crear podcasts, narraciones o respuestas habladas en tiempo real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- **VRAM estimada**: no se proporcionan datos oficiales. Como referencia teórica, un modelo de 1.5B en FP16 ocupa aproximadamente 3 GB; con cuantización INT8 podría reducirse a ~1.5 GB.
- **GPU recomendadas**: RTX 3060, RTX 4090, A100, H100 (dependiendo de la precisión y la velocidad deseada).
- **GPU de consumo**: puede ejecutarse en RTX 3060 12GB o RTX 4090 24GB.
- **Opciones de despliegue**: vLLM, llama.cpp, Ollama, TGI (según el texto).
- **Latencia y throughput**: no disponible.

## Comparativa con modelos similares

No se proporcionan datos de comparación en la información disponible. Se podría comparar con otros modelos de audio-lenguaje como Qwen2-Audio o Whisper, pero no se dispone de datos concretos.

## Limitaciones y advertencias

- No se especifican sesgos conocidos.
- Riesgo de alucinación en la generación de texto y audio.
- Limitaciones de idioma: solo se menciona inglés, aunque se dice "multilingüe".
- Restricciones de licencia: Open License v1.0 puede tener condiciones para uso comercial; se debe revisar la licencia.
- Para producción, se debe validar el rendimiento con datos propios.

## Enlaces

- HuggingFace: https://huggingface.co/LiquidAI/LFM2.5-Audio-1.5B
- Documentación: https://docs.liquid.ai/
- Repositorio: https://github.com/LiquidAI/LFM2.5-Audio-1.5B
