# Rin247/Qwen3-TTS-12Hz-1.7B-Base-FP8

## Resumen

Qwen3-TTS-12Hz-1.7B-Base-FP8 es una versión cuantizada en FP8 del modelo de síntesis de voz Qwen3-TTS-12Hz-1.7B-Base, desarrollado originalmente por el equipo Qwen de Alibaba. Este repositorio concreto, publicado por el usuario Rin247, distribuye los pesos en formato safetensors con cuantización FP8, lo que reduce el tamaño del modelo a 2,4 GB y facilita su despliegue en entornos con recursos limitados.

El modelo pertenece a la familia Qwen3-TTS, que introduce una arquitectura de lenguaje discreto multi-codebook (LM) con un tokenizador acústico propio, Qwen3-TTS-Tokenizer-12Hz, que comprime la señal de voz a 12 Hz. Esta arquitectura end-to-end evita los cuellos de botella de información y los errores en cascada típicos de los esquemas LM+DiT tradicionales. La variante Base está diseñada para clonación rápida de voz a partir de solo 3 segundos de audio de referencia y puede utilizarse como punto de partida para fine-tuning.

El modelo soporta 10 idiomas principales (chino, inglés, japonés, coreano, alemán, francés, ruso, portugués, español e italiano) y destaca por su generación en streaming de baja latencia, con una latencia extremo a extremo de hasta 97 ms, lo que lo hace adecuado para aplicaciones interactivas en tiempo real. La licencia Apache 2.0 permite uso comercial sin restricciones significativas.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LM discreto multi-codebook con tokenizador Qwen3-TTS-Tokenizer-12Hz |
| Parametros totales | 1.928.677.440 (1,7B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no aplica contexto de texto) |
| Tipos de cuantizacion | FP8 (según el nombre del repositorio) |
| Idiomas soportados | Chino, inglés, japonés, coreano, alemán, francés, ruso, portugués, español, italiano |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Qwen3-TTS-12Hz-1.7B-Base emplea una arquitectura de modelo de lenguaje discreto multi-codebook que modela la señal de voz de forma completamente end-to-end. El tokenizador Qwen3-TTS-Tokenizer-12Hz codifica la entrada de audio en códigos discretos a una frecuencia de 12 Hz, preservando información paralingüística (entonación, emoción, timbre) y características del entorno acústico. La síntesis se realiza mediante un decodificador ligero no basado en DiT, lo que permite una reconstrucción de alta fidelidad con baja latencia.

El modelo incorpora una arquitectura de generación híbrida Dual-Track que soporta tanto streaming como no-streaming con un único conjunto de pesos. En modo streaming, puede emitir el primer paquete de audio inmediatamente después de recibir un solo carácter de entrada, con una latencia extremo a extremo de 97 ms. El modelo Base no incluye control por instrucciones en lenguaje natural (a diferencia de las variantes VoiceDesign y CustomVoice), pero sí permite clonación de voz rápida a partir de 3 segundos de audio de referencia y es apto para fine-tuning.

No se han publicado detalles sobre el dataset de entrenamiento, el número de tokens utilizados ni el proceso de alineación (RLHF/DPO) en la información disponible.

## Capacidades

- Síntesis de voz de alta fidelidad en 10 idiomas principales, incluyendo español, con perfiles dialectales adicionales.
- Clonación de voz rápida: genera una voz personalizada a partir de una muestra de audio de 3 segundos.
- Generación en streaming y no-streaming con un único modelo, gracias a la arquitectura Dual-Track.
- Latencia extremo a extremo de hasta 97 ms, adecuada para interacción en tiempo real.
- Comprensión contextual del texto: ajusta tono, ritmo y expresión emocional según la semántica del contenido.
- Robustez mejorada frente a texto ruidoso o mal formateado.
- Capacidad de fine-tuning para crear voces personalizadas o adaptar el modelo a dominios específicos.
- No soporta control por instrucciones en lenguaje natural (esa capacidad está reservada a las variantes VoiceDesign y CustomVoice).

## Casos de uso

- Asistentes de voz en tiempo real: gracias a la latencia de 97 ms y al streaming, el modelo puede integrarse en asistentes conversacionales que requieren respuestas de audio inmediatas, como chatbots por voz o interfaces de atención al cliente.
- Clonación de voz para doblaje y localización: con solo 3 segundos de audio de referencia, se puede replicar la voz de un actor o locutor para doblar contenido audiovisual en los 10 idiomas soportados, reduciendo costes de grabación.
- Generación de audiolibros multilingües: el modelo puede sintetizar narraciones en varios idiomas con entonación natural, adaptando el ritmo y la emoción al contenido del texto.
- Accesibilidad y lectura de pantalla: integración en aplicaciones de lectura asistida para personas con discapacidad visual, con soporte multilingüe y baja latencia para una experiencia fluida.
- Agentes de atención al cliente automatizada: el modelo puede generar respuestas de voz en tiempo real dentro de sistemas IVR o chatbots telefónicos, manteniendo un tono natural y adaptándose al contexto de la conversación.
- Fine-tuning para voces de marca: empresas pueden ajustar el modelo con datos propios para crear una voz corporativa consistente en campañas publicitarias, tutoriales o contenido de formación.
- Generación de contenido educativo: síntesis de explicaciones, lecciones o ejercicios de idiomas con pronunciación correcta en los 10 idiomas soportados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card original no incluye métricas cuantitativas como MOS (Mean Opinion Score), WER (Word Error Rate) o comparativas con otros modelos TTS. Tampoco se dispone de datos de throughput o latencia medidos en entornos de producción.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo en FP8 ocupa aproximadamente 2,4 GB en disco, por lo que la VRAM necesaria para inferencia se estima entre 2,5 y 4 GB, dependiendo del tamaño de lote y la longitud de la secuencia de audio.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM, como NVIDIA RTX 3060, RTX 4060, o GPUs de datacenter como A10 o L4. Para despliegues de alta concurrencia, se recomienda A100 o H100.
- Compatibilidad con GPU de consumo: sí, cabe en GPUs consumer de gama media como RTX 3060 (12 GB) o RTX 4070, e incluso en tarjetas con 4-6 GB si se usa cuantización adicional o tamaños de lote reducidos.
- Opciones de despliegue: el modelo se puede servir mediante el paquete `qwen-tts` oficial, vLLM (que soporta carga automática de pesos), o mediante frameworks de inferencia TTS como Hugging Face Transformers si se adapta. También es posible usar llama.cpp si se convierte a GGUF, aunque no se menciona soporte oficial.
- Latencia y throughput: no se han publicado cifras concretas de throughput. La latencia de primera respuesta en streaming es de 97 ms según la documentación oficial, pero el throughput depende del hardware y la configuración.

## Comparativa con modelos similares

No se dispone de datos de benchmarks comparativos en la información proporcionada. Sin embargo, se puede contextualizar frente a alternativas TTS conocidas:

| Modelo | Parametros | Idiomas | Streaming | Clonacion de voz | Licencia |
|---|---|---|---|---|---|
| Qwen3-TTS-12Hz-1.7B-Base (FP8) | 1,7B | 10 | Sí (97 ms) | Sí (3 s de audio) | Apache 2.0 |
| VITS (single-speaker) | ~30M | 1-2 | No | No | MIT |
| Tacotron 2 + WaveGlow | ~100M | 1 | No | No | BSD |
| XTTS v2 (Coqui) | ~500M | 17 | Parcial | Sí (6 s) | CPML (no comercial) |

La comparativa es orientativa: Qwen3-TTS ofrece un número de parámetros mayor que los modelos clásicos, pero su arquitectura end-to-end y su soporte multilingüe con clonación de voz lo sitúan en una categoría superior. La licencia Apache 2.0 es más permisiva que la de XTTS v2, que restringe el uso comercial.

## Limitaciones y advertencias

- La versión FP8 puede introducir una ligera pérdida de calidad respecto al modelo original en BF16/FP16, especialmente en la reproducción de matices acústicos finos. Se recomienda evaluar la calidad subjetiva antes de desplegar en producción.
- El modelo Base no soporta control por instrucciones en lenguaje natural; para control fino de timbre, emoción o prosodia mediante texto, es necesario usar las variantes VoiceDesign o CustomVoice.
- No se han publicado datos sobre sesgos en la síntesis de voz (por ejemplo, acentos o pronunciación de nombres extranjeros). La robustez a texto ruidoso está mejorada, pero no es perfecta.
- La clonación de voz a partir de 3 segundos de audio puede no capturar completamente las características vocales en entornos con ruido de fondo o baja calidad de grabación.
- Aunque la licencia Apache 2.0 permite uso comercial, el usuario debe verificar que la cuantización FP8 de este repositorio concreto (Rin247) no introduzca modificaciones adicionales que afecten a la licencia o al comportamiento del modelo.
- No se dispone de información sobre el dataset de entrenamiento, por lo que no se pueden evaluar posibles sesgos lingüísticos o culturales en la pronunciación.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Rin247/Qwen3-TTS-12Hz-1.7B-Base-FP8
- Colección oficial Qwen3-TTS en HuggingFace: https://huggingface.co/collections/Qwen/qwen3-tts
- Modelo original en ModelScope: https://www.modelscope.cn/models/Qwen/Qwen3-TTS-12Hz-1.7B-Base
- Página del modelo en inferbase.ai: https://inferbase.ai/models/qwen3-tts-12hz-1-7b-base
- Ficha en aimodels.fyi: https://www.aimodels.fyi/models/huggingFace/qwen3-tts-12hz-1.7b-base-qwen
- Paper técnico (referencia arxiv:2601.15621): no disponible directamente, pero se cita en los tags del repositorio.
