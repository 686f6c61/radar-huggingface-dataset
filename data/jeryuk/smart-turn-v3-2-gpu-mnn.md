# Jeryuk/smart-turn-v3.2-gpu.mnn

## Resumen

Smart Turn v3.2 es un modelo de detección de turnos de habla (turn detection) diseñado para agentes de voz conversacionales. Desarrollado originalmente por el equipo de pipecat-ai, este modelo resuelve un problema crítico en sistemas de voz: decidir con precisión cuándo el usuario ha terminado de hablar y el agente debe responder. Es una solución open source y comunitaria, nativa de audio, que no requiere un paso intermedio de reconocimiento de voz (ASR) para funcionar.

La versión aquí descrita, `Jeryuk/smart-turn-v3.2-gpu.mnn`, es una conversión del modelo original al formato MNN (Mobile Neural Network) realizada por Jeryuk, con cuantización de pesos a 8 bits. La arquitectura combina el encoder de Whisper Tiny con un clasificador lineal, lo que lo hace ligero y adecuado para inferencia en tiempo real. El tamaño exacto del modelo y su longitud de contexto no están documentados en la información disponible, pero al estar basado en Whisper Tiny se espera un número de parámetros reducido (del orden de decenas de millones).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder de Whisper Tiny + clasificador lineal |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (procesa audio, no texto) |
| Tipos de cuantizacion | 8 bits (weightQuantBits 8, block 128) |
| Idiomas soportados | no disponible (detección de turnos independiente del idioma) |
| Licencia | Apache-2.0 |
| Formato de pesos | MNN (.mnn) |

## Arquitectura y entrenamiento

El modelo combina el encoder de Whisper Tiny, que extrae representaciones de audio, con un clasificador lineal que decide si el habla ha terminado. Esta arquitectura híbrida permite procesar audio directamente sin depender de transcripciones de texto, lo que reduce latencia y simplifica el pipeline. El entrenamiento se realizó con datos de conversaciones de voz, aunque no se han publicado detalles sobre el volumen de datos, la composición del dataset ni si se aplicaron técnicas como RLHF o DPO. La conversión a MNN se realizó a partir de un modelo ONNX, con cuantización de pesos a 8 bits para optimizar el rendimiento en GPU.

## Capacidades

- Detección de turnos de habla en tiempo real: clasifica si el usuario ha terminado de hablar.
- Procesamiento nativo de audio: no requiere ASR intermedio.
- Integración con el framework pipecat para agentes de voz.
- Ligero y eficiente: adecuado para despliegue en dispositivos con recursos limitados.
- No genera texto, no soporta tool calling ni razonamiento multi-paso.

## Casos de uso

- Agentes de atención al cliente por voz: el modelo decide cuándo el agente virtual debe intervenir, evitando interrupciones y silencios incómodos en conversaciones multi-turno.
- Asistentes de voz en tiempo real: integrado en un pipeline de voz, permite respuestas naturales al detectar el final de la intervención del usuario.
- Sistemas de dictado y transcripción interactiva: ayuda a segmentar el audio en turnos para su posterior procesamiento.
- Juegos y aplicaciones de entretenimiento con interacción por voz: mejora la fluidez de los diálogos con personajes virtuales.
- Accesibilidad: facilita la interacción por voz en aplicaciones para personas con movilidad reducida.
- Pruebas y simulación de conversaciones: en entornos de desarrollo, permite automatizar la evaluación de agentes de voz.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible, pero al estar basado en Whisper Tiny (aprox. 39M parámetros) y cuantizado a 8 bits, se espera que quepa en GPUs con menos de 1 GB de VRAM.
- GPU recomendadas: cualquier GPU moderna (NVIDIA GTX 10xx o superior, RTX, etc.) o incluso CPU con soporte MNN.
- Compatible con consumer GPUs: sí, dado su tamaño reducido.
- Opciones de despliegue: MNN runtime (para el archivo .mnn), también se puede usar el modelo ONNX original con frameworks como ONNX Runtime.
- Latencia y throughput: no disponibles, pero al ser un modelo pequeño se espera una latencia de pocos milisegundos en GPU.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables de detección de turnos en la documentación proporcionada. Alternativas en el ecosistema de voz podrían incluir modelos de endpointing basados en VAD (Voice Activity Detection) como Silero VAD, pero no hay datos suficientes para una comparación rigurosa.

## Limitaciones y advertencias

- Sesgos: no se han documentado sesgos específicos, pero al depender de datos de entrenamiento no publicados, podría haber sesgos en acentos o condiciones de audio.
- Riesgo de alucinación: no aplica, ya que el modelo no genera texto.
- Limitaciones de contexto: el modelo procesa audio en ventanas temporales; no se especifica la duración máxima de audio soportada.
- Restricciones de licencia: Apache-2.0 permite uso comercial sin restricciones, siempre que se mantenga el aviso de licencia.
- Caveat para producción: la conversión a MNN puede introducir diferencias de precisión respecto al modelo original; se recomienda validar el comportamiento en el entorno objetivo.

## Enlaces

- Modelo convertido (HuggingFace): https://huggingface.co/Jeryuk/smart-turn-v3.2-gpu.mnn
- Modelo original (HuggingFace): https://huggingface.co/pipecat-ai/smart-turn-v3
- Repositorio GitHub del proyecto: https://github.com/pipecat-ai/smart-turn
- Documentación adicional (DeepWiki): https://deepwiki.com/pipecat-ai/smart-turn/7.1-setup-and-dependencies
