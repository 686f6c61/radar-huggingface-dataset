# Rin247/Qwen3-TTS-12Hz-0.6B-CustomVoice-FP4

## Resumen

Qwen3-TTS-12Hz-0.6B-CustomVoice-FP4 es una versión cuantizada en precisión FP4 del modelo de síntesis de voz Qwen3-TTS-12Hz-0.6B-CustomVoice, desarrollado originalmente por el equipo Qwen. Esta variante específica ha sido publicada por el usuario Rin247 en Hugging Face y conserva todas las capacidades del modelo base: síntesis multilingüe en diez idiomas, control fino del estilo de voz mediante instrucciones en lenguaje natural y generación en streaming con baja latencia. La cuantización FP4 reduce el tamaño del modelo y los requisitos de memoria, lo que facilita su despliegue en entornos con recursos limitados.

El modelo pertenece a la serie Qwen3-TTS, que ofrece funcionalidades avanzadas como clonación de voz, diseño de voz y control emocional. Esta variante CustomVoice incluye nueve timbres de voz predefinidos y está optimizada para el tokenizador de audio a 12 Hz, alcanzando una latencia de síntesis de extremo a extremo de hasta 97 ms. Con aproximadamente 643 millones de parámetros, el modelo es compacto y adecuado para aplicaciones en tiempo real, como asistentes de voz o doblaje automático.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 643.120.384 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP4 (fp4_weight_only) |
| Idiomas soportados | chino, ingles, japones, coreano, aleman, frances, ruso, portugues, espanol, italiano |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (cuantizados FP4) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo. Se sabe que forma parte de la serie Qwen3-TTS y utiliza un tokenizador de audio a 12 Hz, disenado para generacion en streaming con baja latencia. El modelo base fue entrenado por el equipo Qwen, pero no se han publicado datos sobre el volumen de datos de entrenamiento, la composicion del dataset ni el uso de tecnicas como RLHF o DPO. La cuantizacion FP4 aplicada por Rin247 reduce el peso de cada parametro a 4 bits, lo que disminuye el uso de memoria a costa de una posible perdida menor de fidelidad en la salida de audio.

## Capacidades

- Sintesis de voz multilingue en diez idiomas: chino, ingles, japones, coreano, aleman, frances, ruso, portugues, espanol e italiano.
- Control fino del estilo de voz mediante instrucciones en lenguaje natural, como "habla con tono muy alegre" o "usa un ritmo lento y calmado".
- Nueve timbres de voz predefinidos (speakers) con caracteristicas distintas: Vivian, Serena, Uncle_Fu, Dylan, Eric, Ryan, Aiden, Ono_Anna y Sohee.
- Generacion en streaming con latencia de extremo a extremo de hasta 97 ms, adecuada para aplicaciones en tiempo real.
- Soporte para control de tono, ritmo y expresion emocional en la voz generada.
- No incluye capacidades de tool calling, agentes ni procesamiento de vision; es exclusivamente un modelo de texto a voz.

## Casos de uso

- Audiolibros multilingues: el modelo puede narrar libros en varios idiomas con control de emocion y ritmo, permitiendo crear experiencias de escucha inmersivas. Su baja latencia facilita la generacion por capitulos sin largas esperas.
- Asistentes de voz con respuesta emocional: integrado en un chatbot o asistente virtual, puede generar respuestas habladas con el tono adecuado segun el contexto de la conversacion, mejorando la naturalidad de la interaccion.
- Doblaje de videos y animaciones: los nueve timbres predefinidos permiten asignar voces distintas a personajes, y las instrucciones en lenguaje natural ajustan la interpretacion emocional de cada linea.
- Accesibilidad para personas con discapacidad visual: el modelo puede leer en voz alta contenido digital con control de velocidad y tono, adaptandose a las preferencias del usuario.
- Educacion de idiomas: genera ejemplos de pronunciacion nativa en diez idiomas con diferentes voces, util para aplicaciones de aprendizaje de lenguas.
- Locuciones publicitarias: permite crear anuncios con distintos estilos vocales (energico, sereno, juvenil) sin necesidad de actores de voz, reduciendo costes de produccion.
- Streaming en vivo: su baja latencia lo hace apto para subtitulado por voz en directo o para herramientas de traduccion simultanea hablada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 643 millones de parametros en FP4, el peso del modelo ocupa aproximadamente 321 MB (0.5 bytes por parametro). Sumando activaciones y overhead, se estima que cabe en GPUs con 2-4 GB de VRAM, aunque no hay datos oficiales.
- GPU recomendadas: cualquier GPU NVIDIA con soporte CUDA y al menos 4 GB de VRAM, como RTX 3050, RTX 3060 o superiores. Tambien puede ejecutarse en CPU, aunque con mayor latencia.
- Compatibilidad con GPUs de consumo: si, el modelo es lo suficientemente pequeno para ejecutarse en tarjetas graficas de gama media.
- Opciones de despliegue: se utiliza principalmente mediante la libreria `qwen-tts` (pip install -U qwen-tts), que carga el modelo con `transformers`. No se menciona soporte para vLLM, llama.cpp u Ollama, ya que es un modelo de audio, no de texto.
- Latencia y throughput: la latencia de sintesis de extremo a extremo es de hasta 97 ms en condiciones optimas, segun la documentacion del modelo base. El throughput no se ha especificado.

## Comparativa con modelos similares

No se dispone de informacion suficiente para comparar este modelo con alternativas de la misma categoria. Se puede mencionar que la serie Qwen3-TTS incluye otras variantes (por ejemplo, con tokenizadores de diferente frecuencia o tamano), pero no se han proporcionado datos concretos sobre ellas.

## Limitaciones y advertencias

- La cuantizacion FP4 puede introducir una degradacion sutil en la calidad del audio en comparacion con el modelo original en bfloat16, especialmente en voces con matices muy finos.
- Los timbres de voz estan limitados a los nueve speakers predefinidos; esta variante CustomVoice no incluye clonacion de voz, aunque la serie Qwen3-TTS si la soporta en otras versiones.
- El control emocional depende de la interpretacion de las instrucciones en lenguaje natural, que puede fallar con frases ambiguas o complejas.
- La licencia Apache-2.0 permite uso comercial, pero se recomienda revisar los terminos de los modelos base de Qwen y las posibles restricciones de uso en regiones especificas.
- Las voces predefinidas tienen acentos limitados (principalmente chino e ingles), lo que puede no cubrir todas las variedades dialectales de los idiomas soportados.
- Existe riesgo de alucinacion en el habla: el modelo puede pronunciar incorrectamente palabras poco comunes o nombres propios si el texto de entrada es ambiguo.

## Enlaces

- Modelo cuantizado FP4 (Rin247): https://huggingface.co/Rin247/Qwen3-TTS-12Hz-0.6B-CustomVoice-FP4
- Repositorio oficial de Qwen3-TTS: https://github.com/QwenLM/Qwen3-TTS
- Paper tecnico (arXiv:2601.15621): https://huggingface.co/papers/2601.15621
- Demo oficial en Hugging Face Spaces: https://huggingface.co/spaces/Qwen/Qwen3-TTS
- Re-upload del modelo base (Jinstudio): https://huggingface.co/Jinstudio/Qwen3-TTS-12Hz-0.6B-CustomVoice
- Re-upload del modelo base (Ademola265): https://huggingface.co/Ademola265/Qwen3-TTS-12Hz-0.6B-CustomVoice
