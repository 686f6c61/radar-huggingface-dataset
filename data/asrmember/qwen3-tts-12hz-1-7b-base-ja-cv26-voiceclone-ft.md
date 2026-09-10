# ASRmember/Qwen3-TTS-12Hz-1.7B-Base-ja-CV26-VoiceClone-FT

## Resumen

Este modelo es un ajuste completo de todos los parámetros del modelo Qwen3-TTS-12Hz-1.7B-Base, realizado por ASRmember, sobre el corpus Common Voice japonés (CV 26.0, solo muestras validadas). El objetivo es especializar el modelo base en la clonación de voz por aprendizaje en contexto (ICL) para japonés, usando el formato `(ref_audio, ref_text, text, output)`. El modelo base original de la familia Qwen3-TTS cubre 10 idiomas y permite clonar una voz a partir de 3 segundos de audio de referencia; el fine-tune añade 10.000 muestras de 6.198 hablantes japoneses, con la cuarta parte del corpus sometida a degradación de banda telefónica y anotaciones de lectura y acento en la mitad de los datos. La relevancia de esta adaptación reside en que ofrece una versión específica para voz japonesa con un corpus validado, aunque su despliegue exige seguir las advertencias de inferencia documentadas por el autor, en particular el uso obligatorio de `non_streaming_mode=True`.

La arquitectura es la de Qwen3-TTS: un modelo de lenguaje de códigos discretos multi-codebook que genera audio de extremo a extremo, sin depender de la combinación clásica de LM y DiT. El modelo resultante tiene 1.928.677.440 parámetros totales según el archivo safetensors, si bien el modelo base se denomina 1.7B. No se dispone de información sobre la longitud de contexto, los tipos de cuantización ni los requisitos de hardware específicos para este fine-tune.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LM de códigos discretos multi-codebook (Qwen3-TTS) |
| Parametros totales | 1.928.677.440 |
| Parametros activos | No aplica (arquitectura densa) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Japonés (fine-tune); modelo base: chino, inglés, japonés, coreano, alemán, francés, ruso, portugués, español, italiano |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

La arquitectura se basa en el tokenizador Qwen3-TTS-Tokenizer-12Hz, que codifica la señal de audio en códigos discretos a 12 Hz, y un modelo de lenguaje multi-codebook que genera la secuencia de códigos correspondiente. Este diseño end-to-end preserva información paralingüística y características acústicas ambientales, evitando los cuellos de botella y errores en cascada de los esquemas tradicionales LM más DiT. El modelo base admite generación tanto en streaming como en no-streaming gracias a una arquitectura híbrida de doble vía, aunque el autor de este fine-tune indica que en inferencia se debe fijar `non_streaming_mode=True`, ya que la disposición de secuencias del modo streaming por defecto difiere de la usada durante el entrenamiento. El modelo base de la variante empleada no tiene control por instrucciones, a diferencia de las variantes VoiceDesign y CustomVoice.

El entrenamiento se realizó durante 1 época con AdamW, gradiente clipping de 10, sin acumulación de gradientes y ajuste de todos los parámetros. La tasa de aprendizaje fue de 1e-6 para los pesos principales y 1e-4 para los tokens adicionales, con una fase de warmup, mantenimiento y decaimiento coseno en los últimos 1.000 pasos. El dataset de entrenamiento comprende 10.000 muestras, 6.198 hablantes y 10.000 oraciones únicas, de las cuales 2.500 fueron sometidas a degradación de banda telefónica. La model card detalla tres rutas de pesos en el repositorio: la raíz (run1 con tamaño de lote 4), `bs1/` (run2 con tamaño de lote 1) y `detailed/` (run3, continuación de run2, con anotaciones de lectura y acento en la mitad de los datos).

## Capacidades

- Clonación de voz japonesa por aprendizaje en contexto (ICL): el modelo sintetiza voz a partir de una referencia de audio y su transcripción, junto con el texto que se desea pronunciar.
- Adaptación del timbre y la prosodia a la muestra de referencia de audio, sin necesidad de entrenamiento adicional por hablante.
- Generación de voz en japonés con datos validados de Common Voice, lo que ofrece una base de voz natural para el idioma.
- La mitad de las muestras de entrenamiento incluyen anotaciones de lectura y acento, lo que puede mejorar la precisión de pronunciación en comparación con un ajuste sin estas anotaciones.
- El modelo base Qwen3-TTS es capaz de clonar una voz a partir de 3 segundos de audio de referencia; esta capacidad se mantiene en el fine-tune para el corpus japonés.
- El modelo base soporta generación de baja latencia en streaming (hasta 97 ms de latencia de extremo a extremo), pero este fine-tune debe utilizarse en modo no-streaming según la advertencia del autor.
- El modelo base de la familia Qwen3-TTS cubre 10 idiomas, aunque este fine-tune está entrenado específicamente para japonés.

## Casos de uso

- Asistentes de voz personalizados en japonés: un usuario graba una muestra breve de su voz y el modelo genera respuestas habladas con ese timbre, lo que resulta adecuado para interfaces conversacionales o aplicaciones de accesibilidad.
- Doblaje de contenidos audiovisuales: el modelo puede clonar la voz de un actor o narrador para generar automáticamente el doblaje de vídeos o series en japonés, manteniendo la coherencia vocal a partir de una referencia corta y el texto final.
- Narración de audiolibros y podcasts: producción de voz sintética con un timbre consistente a partir de una referencia de audio corta, ideal para generar largas secuencias habladas con la misma voz.
- Atención al cliente por telefonía (IVR): integración del modelo en sistemas de respuesta de voz interactiva para generar mensajes automatizados con la voz de una operadora o de un usuario autorizado.
- Creación de voces para personajes virtuales: en juegos, chatbots o avatares, el modelo permite generar una voz única para cada personaje usando una muestra de referencia.
- Corrección y práctica de pronunciación en japonés: gracias a las anotaciones de lectura y acento presentes en la mitad de las muestras de entrenamiento, el modelo puede usarse para generar ejemplos de pronunciación correcta y compararlos con la pronunciación del usuario.
- Audioguías turísticas: narración en japonés con la voz de un guía local, generada a partir de una muestra de voz real, para sistemas de guiado en museos o destinos turísticos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas objetivas de calidad de voz (MOS, WER, SIM) ni comparativas con otros modelos. La única cifra de rendimiento mencionada es la latencia de síntesis del modelo base Qwen3-TTS, de hasta 97 ms en streaming; esta latencia no aplica directamente al fine-tune, ya que el autor recomienda emplear `non_streaming_mode=True` en inferencia.

## Requisitos de hardware

- VRAM estimada: no se indican requisitos oficiales. Como referencia orientativa, un modelo de 1.928.677.440 parámetros en precisión FP16 ocupa aproximadamente 3,9 GB en memoria para los pesos, sin contar activaciones ni buffers; se recomienda al menos 8 GB de VRAM para inferencia con un margen razonable.
- GPU recomendadas: no se especifican. En función del tamaño, una RTX 3090, RTX 4090 o una A100 serían opciones adecuadas para inferencia sin cuantización.
- El modelo no cabe en GPUs de gama baja sin cuantización, pero no se proporcionan tipos de cuantización, por lo que no se puede aprovechar la compresión de pesos.
- Opciones de despliegue: la model card menciona la inferencia mediante vLLM y el paquete `qwen-tts`. No se mencionan llama.cpp ni Ollama.
- Latencia y throughput: no se dispone de datos medidos para este fine-tune. La advertencia de usar `non_streaming_mode=True` implica que no se puede aprovechar la generación en streaming del modelo base.

## Comparativa con modelos similares

| Modelo | Parametros totales | Idiomas | Control por instrucciones | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ASRmember/Qwen3-TTS-12Hz-1.7B-Base-ja-CV26-VoiceClone-FT (este) | 1.928.677.440 | Japonés (fine-tune) | No | Apache 2.0 | HuggingFace |
| Qwen3-TTS-12Hz-1.7B-Base | ~1.7B | 10 idiomas | No | No disponible | Descarga automática con qwen-tts o vLLM; ModelScope |
| Qwen3-TTS-12Hz-0.6B-Base | ~0.6B | 10 idiomas | No | No disponible | Descarga automática con qwen-tts o vLLM; ModelScope |

No se dispone de resultados de benchmarks comparativos entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- En inferencia es obligatorio especificar `non_streaming_mode=True`. Si se usa el valor por defecto (`False`), la disposición de secuencias difiere del entrenamiento y la salida puede ser incorrecta, o las anotaciones de lectura y acento pueden no tener efecto.
- El fine-tune está orientado al japonés (Common Voice CV 26.0 validado). Su rendimiento en otros idiomas es desconocido y probablemente bajo, a pesar de que el modelo base sea multilingüe.
- No se han publicado benchmarks ni métricas de evaluación para este fine-tune, por lo que la calidad objetiva debe comprobarse antes de cualquier uso productivo.
- El repositorio tiene un tamaño de 262,5 GB, lo que puede dificultar la descarga y el almacenamiento. Incluye varios directorios de pesos (raíz, `bs1/`, `detailed/`), correspondientes a distintas configuraciones de entrenamiento; es necesario seleccionar la ruta adecuada.
- La licencia declarada es Apache 2.0, que permite uso comercial y modificación. Sin embargo, no se proporciona información sobre la licencia del modelo base Qwen3-TTS original, por lo que conviene verificarla antes de un despliegue productivo.
- Los datos de Common Voice japonés validado pueden no representar todas las variantes dialectales o estilos de habla. No se ha documentado una evaluación de sesgos en el corpus ni en el modelo resultante.
- No se especifican la longitud de contexto ni los tipos de cuantización disponibles, lo que limita la planificación de memoria y las estrategias de despliegue.

## Enlaces

- HuggingFace: https://huggingface.co/ASRmember/Qwen3-TTS-12Hz-1.7B-Base-ja-CV26-VoiceClone-FT

La model card referencia un directorio `training/TRAINING.md` en el repositorio, pero no se dispone de más enlaces relevantes. La búsqueda web realizada no arrojó ningún enlace adicional relacionado con el modelo.
