# shuko-tuto/npc-models

# npc-models

## Resumen

`npc-models` es un repositorio de HuggingFace creado por `shuko-tuto` que empaqueta un conjunto de modelos listos para ejecutar en local, en la máquina del jugador, con el objetivo de que un personaje de videojuego (NPC) pueda escuchar, entender y responder. No es un modelo único, sino una colección de cinco componentes integrados: Silero VAD para detección de actividad de voz, Whisper tiny y Whisper base para reconocimiento de voz multilingüe, GigaAM v3 CTC para reconocimiento de voz en ruso, y Qwen3-4B como modelo de lenguaje para generar respuestas. La arquitectura es heterogénea: redes recurrentes (Silero), transformers encoder-decoder (Whisper), conformers CTC (GigaAM) y transformers decoder-only (Qwen3). El modelo de lenguaje, Qwen3-4B, tiene aproximadamente 4.022.468.096 parámetros y se distribuye cuantizado en Q4_K_M, ocupando 2.5 GB. La longitud de contexto no se especifica en la documentación.

El problema que resuelve es la ejecución completa de un pipeline de voz a texto y generación de texto sin dependencia de servidores externos, lo que resulta crítico para aplicaciones de juego en las que la latencia y la privacidad importan. La relevancia actual radica en que empaqueta modelos de voz y lenguaje optimizados para dispositivos locales mediante formatos ncnn y GGUF, incluyendo además las licencias de cada componente junto a los archivos, para que un desarrollador pueda copiar una carpeta al lado de un juego sin preocuparse por los términos legales.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Múltiple: RNN (Silero VAD), transformer encoder-decoder (Whisper tiny/base), conformer CTC (GigaAM v3), transformer decoder-only (Qwen3-4B) |
| Parametros totales | 4.022.468.096 (corresponde a Qwen3-4B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (GGUF) para Qwen3-4B; half precision (float16) para GigaAM v3; no especificado para Whisper y Silero VAD |
| Idiomas soportados | no disponible en metadata; según el README: multilingüe (Whisper, Qwen3), ruso (GigaAM) |
| Licencia | MIT (repositorio); componentes individuales bajo MIT y Apache-2.0 |
| Formato de pesos | GGUF (Qwen3-4B), ncnn (param/bin) para Silero, Whisper y GigaAM, bin para frontend de GigaAM |

## Arquitectura y entrenamiento

El repositorio no contiene un modelo entrenado desde cero, sino una colección de modelos preentrenados convertidos a formatos de ejecución local. Silero VAD v6.2 se distribuye como un grafo ncnn de 512 muestras de 16 kHz mono, con estado recurrente entre ventanas, convertido desde el ONNX del paquete `silero-vad` 6.2.1. Whisper tiny y base se convierten con pnnx a seis grafos ncnn (fbank, encoder, embed_token, embed_position, decoder con cachés de atención, proj_out), con el encoder exportado para la ventana de 30 segundos de Whisper y el vocabulario de 50.257 tokens. GigaAM v3 CTC se convierte a un grafo ncnn de longitud agnóstica, con atención re-expresada en batch first para corregir el layout original, y las tablas rotatorias (cos/sin) como entradas al grafo. El frontend de GigaAM incluye una ventana de 320 puntos y un banco de 64 filtros mel. Qwen3-4B se incluye como un espejo byte a byte del archivo GGUF publicado por sus autores, con la cuantización Q4_K_M original.

No se proporcionan datos sobre el dataset ni el proceso de entrenamiento de los modelos originales, ya que los pesos provienen de publicaciones externas. Tampoco se menciona RLHF, DPO ni otras técnicas de alineación en la documentación del repositorio. Las innovaciones técnicas destacables son la corrección del layout de atención en GigaAM para evitar la pérdida de palabras cortas, el manejo de cachés de atención en el decoder de Whisper para decodificación token a token, y el empaquetado de cada modelo con su licencia correspondiente en un archivo `<model>.LICENSE`.

## Capacidades

- Pipeline completo de voz: Silero VAD detecta actividad de voz, Whisper transcribe el audio y Qwen3 genera una respuesta, todo en local.
- Reconocimiento de voz multilingüe con Whisper tiny y base, exportado para ventanas de 30 segundos.
- Reconocimiento de voz en ruso con GigaAM v3 CTC, de longitud agnóstica y 34 clases de salida.
- Generación de texto con Qwen3-4B: sigue su plantilla de chat, puede llamar herramientas (tool calling) y puede pensar antes de responder.
- Ejecución local en el dispositivo del usuario: ncnn para los modelos de voz y llama.cpp para el modelo de lenguaje, con soporte de GPU via Vulkan o CPU.
- Conversación multi-turno: Qwen3-4B mantiene el estado de la conversación y puede ejecutar acciones mediante herramientas.
- Soporte de agentes: el modelo puede razonar en varios pasos antes de responder, lo que permite planificar respuestas complejas.

## Casos de uso

- NPC de videojuego con interacción por voz: Silero VAD detecta cuándo el jugador habla, Whisper transcribe el audio y Qwen3 genera la respuesta del personaje, pudiendo llamar a herramientas para ejecutar acciones del juego. Todo corre en la máquina del jugador, sin latencia de red.
- Asistente de voz offline para aplicaciones de escritorio: el pipeline completo se ejecuta localmente, lo que garantiza privacidad y funcionamiento sin conexión, ideal para entornos con restricciones de red.
- Transcripción de notas de voz en local: Whisper tiny/base transcribe audio de hasta 30 segundos, permitiendo dictar texto sin enviar datos a servidores externos.
- Juego de rol con diálogos dinámicos: Qwen3-4B genera respuestas contextuales y planifica acciones mediante tool calling, enriqueciendo la interacción con personajes no jugadores.
- Simulaciones de entrenamiento en entornos aislados: al no requerir conexión, el paquete es adecuado para despliegues en redes restringidas o simulacros militares.
- Investigación en interacción persona-máquina: los componentes pueden combinarse para experimentar con pipelines de voz a texto y generación de respuestas en local, con la ventaja de poder inspeccionar cada etapa por separado.
- Aplicaciones educativas multilingües: Whisper transcribe en varios idiomas y Qwen3 genera explicaciones, todo en local, lo que facilita el despliegue en aulas sin conexión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El README incluye mediciones de fidelidad de conversión, no de calidad del modelo: Silero VAD se midió contra el ONNX original con un error de 3.6e-7; GigaAM v3 en half precision alcanza un error de 8.5e-3 en log-probabilidades, mientras que la versión full precision llega a 5.2e-5, con el mismo texto en todos los clips de prueba. Estos valores no constituyen benchmarks estándar de tareas como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- Qwen3-4B Q4_K_M: el archivo GGUF pesa 2.5 GB. La VRAM necesaria no se especifica, pero debería caber en GPUs de consumo con 6 GB o más, dependiendo del contexto y del backend.
- GigaAM v3 CTC: los pesos en half precision ocupan 441 MB, por lo que cabe en cualquier GPU moderna.
- Whisper tiny y base: los tamaños no se especifican en la documentación, pero son modelos pequeños adecuados para CPU o GPUs de gama baja.
- Silero VAD: muy ligero, puede ejecutarse en CPU sin problemas.
- GPU recomendadas: cualquier GPU compatible con Vulkan para ejecutar Qwen3-4B a través de llama.cpp; también se puede ejecutar en CPU.
- Opciones de despliegue: llama.cpp (GPU via Vulkan o CPU) para el modelo de lenguaje; ncnn para los modelos de voz (Silero, Whisper, GigaAM).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. Este repositorio no es un modelo único, sino un conjunto de modelos integrados para un pipeline de voz; la fuente no proporciona comparaciones con alternativas.

## Limitaciones y advertencias

- GigaAM v3 solo reconoce ruso, por lo que no es útil para otros idiomas.
- Whisper tiny y base tienen menor precisión que modelos más grandes; el error de conversión de GigaAM en half precision es 8.5e-3 en log-probabilidades, lo que puede afectar la exactitud del texto transcrito.
- Licencias mixtas: Whisper está publicado bajo MIT y Apache-2.0, y ambas licencias deben respetarse. El repositorio se etiqueta como MIT, pero los componentes individuales tienen licencias distintas.
- La metadata de HuggingFace no especifica idiomas, lo que puede dificultar la búsqueda del modelo.
- No se han publicado benchmarks de calidad, por lo que el rendimiento real en tareas no está validado.
- Qwen3-4B es un espejo del GGUF oficial sin cambios, por lo que las limitaciones del modelo original aplican.
- Ejecución local: el rendimiento depende del hardware del usuario; en CPUs sin aceleración, la latencia puede ser alta.
- No se incluye soporte de visión ni de salida de audio (TTS) en el paquete.

## Enlaces

- https://huggingface.co/shuko-tuto/npc-models
- https://huggingface.co/shuko-tuto
- https://huggingface.co/shuko-tuto/datasets
