# 10X-Technologies/lyric-voice-v1-hi

## Resumen

Lyric-voice-v1-hi es un modelo de síntesis de voz (text-to-speech) especializado en hindi, desarrollado por 10X-Technologies como un ajuste fino (finetune) del modelo base kyutai/pocket-tts. Con 336 millones de parámetros, está diseñado para inferencia en dispositivo (on-device), lo que lo posiciona como una opción orientada a despliegues ligeros donde el tamaño y la latencia importan más que la expresividad máxima. Su propósito es convertir texto en hindi en audio inteligible con un coste computacional reducido.

El modelo se distribuye en formato safetensors dentro de un repositorio de 1,3 GB y está etiquetado con el pipeline `text-to-speech`. La arquitectura subyacente proviene de pocket-tts, un modelo de voz compacto de Kyutai pensado para ejecución local; este ajuste añade la capacidad específica de síntesis en hindi, un idioma con relativamente pocos modelos TTS abiertos de calidad y tamaño contenido.

Su relevancia actual radica en dos factores: por un lado, la escasez de modelos TTS abiertos centrados en hindi con un tamaño manejable para dispositivos de gama baja o entornos embebidos; por otro, su licencia comunitaria y el acceso restringido (gated) en Hugging Face, que condicionan su uso comercial y requieren aceptar términos antes de la descarga. No se han publicado datos de benchmarks ni métricas de calidad en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (derivada de kyutai/pocket-tts) |
| Parametros totales | 336.068.290 |
| Parametros activos | no disponible (no es MoE segun los datos disponibles) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | hindi (hi) |
| Licencia | lyric-community-license (licencia comunitaria, acceso gated) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo más allá de que deriva de kyutai/pocket-tts, un modelo de síntesis de voz compacto. El número de parámetros (336 millones) y el tamaño del repositorio (1,3 GB) son coherentes con un modelo TTS de tamaño pequeño-medio, orientado a inferencia en dispositivo. No se especifican el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO.

El modelo es un ajuste fino del checkpoint base pocket-tts sobre datos de voz en hindi. No se dispone de información sobre la metodología de ajuste (fine-tuning supervisado, adaptación de hablante, etc.), la duración o calidad del corpus de audio empleado, ni innovaciones técnicas destacables como decodificación especulativa o atención lineal. Cualquier afirmación adicional sobre el entrenamiento sería especulativa.

## Capacidades

- Síntesis de voz (text-to-speech) en hindi a partir de texto de entrada.
- Diseñado para inferencia en dispositivo (on-device), lo que sugiere un perfil de recursos contenido.
- Generación de audio orientada a aplicaciones de voz ligeras.
- No se ha documentado soporte de tool calling ni function calling.
- No se ha documentado soporte de agentes ni razonamiento multi-paso.
- No se ha documentado capacidad multilingüe más allá del hindi.
- No se ha documentado clonación de voz, control de emoción ni capacidades multimodales adicionales.

## Casos de uso

- Lectura de notificaciones y alertas en hindi: el modelo puede convertir mensajes cortos del sistema en audio en dispositivos con recursos limitados, aprovechando su tamaño reducido para ejecutarse localmente sin conexión.
- Interfaces de voz para aplicaciones móviles en hindi: integración en apps Android o iOS para locutar respuestas de asistentes o formularios, con la ventaja de que la inferencia on-device evita enviar texto a servidores externos.
- Accesibilidad para personas con discapacidad visual: lectura de contenido textual en hindi (artículos, mensajes, menús) en dispositivos de gama baja, donde modelos TTS más grandes no caben.
- Dispositivos IoT y asistentes embebidos: altavoces inteligentes o terminales de información en hindi que requieren síntesis local con latencia baja y sin dependencia de la nube.
- Audiolibros y contenido educativo ligero: generación de locuciones para material didáctico o narraciones cortas en hindi, siempre que la licencia comunitaria lo permita.
- Prototipado de productos de voz para el mercado hindi: evaluación rápida de la calidad de síntesis antes de invertir en modelos comerciales o en un corpus propio, dado el bajo coste de despliegue del modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: con 336 millones de parámetros en safetensors, los pesos ocupan aproximadamente 0,65 GB en fp16 y unos 1,3 GB en fp32; la VRAM total dependerá del runtime y de los buffers de audio, pero debería mantenerse por debajo de 2-3 GB en la mayoría de configuraciones.
- GPU recomendadas: no se especifican; por tamaño, cualquier GPU consumer moderna (RTX 3060 en adelante) debería ser suficiente, y el modelo está pensado para ejecución en CPU o dispositivos embebidos.
- Cabe en GPU consumer: sí, previsiblemente en cualquier GPU con 4 GB o más de VRAM; también es candidato a ejecución en CPU.
- Opciones de despliegue: no se documentan integraciones específicas con vLLM, llama.cpp, Ollama o TGI; al ser un modelo TTS, requeriría el runtime compatible con pocket-tts.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| lyric-voice-v1-hi | 336 M | no disponible | hindi | lyric-community-license (gated) | Hugging Face |
| kyutai/pocket-tts (base) | no disponible | no disponible | no disponible | no disponible | Hugging Face |
| Voice.ai (servicio comercial) | no disponible (API) | no disponible | 32 idiomas | propietaria | servicio en la nube |
| Alternativas TTS abiertas para hindi | no disponible | no disponible | hindi | variable | no disponible |

La comparación cuantitativa con alternativas no es posible con la información disponible; los servicios comerciales como Voice.ai operan como API y no publican parámetros ni pesos.

## Limitaciones y advertencias

- Acceso restringido: el repositorio es gated y requiere aceptar condiciones en Hugging Face antes de la descarga.
- Licencia comunitaria (lyric-community-license): no es una licencia de código abierto estándar; es imprescindible revisar los términos antes de cualquier uso comercial.
- Cobertura lingüística limitada al hindi; no se ha documentado soporte de otros idiomas ni de code-switching con inglés.
- Sin datos publicados de calidad (MOS, WER, inteligibilidad) ni de benchmarks, por lo que el rendimiento real es desconocido.
- Riesgo de artefactos y errores de pronunciación inherente a los modelos TTS pequeños, especialmente en nombres propios, números y texto mixto.
- Sin documentación sobre sesgos de voz (género, acento, registro) ni sobre el corpus de entrenamiento.
- No se han documentado capacidades de clonación de voz ni control emocional, lo que limita aplicaciones expresivas.
- Al ser un ajuste fino de un modelo base, puede heredar limitaciones del checkpoint original de pocket-tts.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/10X-Technologies/lyric-voice-v1-hi
- Modelo base: https://huggingface.co/kyutai/pocket-tts
- Voice.ai (referencia comparativa): https://i10x.ai/tools/voiceai
- Artículo comparativo de generadores de voz: https://visme.co/blog/best-ai-voice-generator/
