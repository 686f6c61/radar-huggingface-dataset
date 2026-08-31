# EllaPriest45/Audio8-TTS-0.6B

## Resumen

Audio8 TTS Preview 0.6B es un modelo de síntesis de voz (text-to-speech) multilingüe de código abierto, desarrollado por Audio8 AI, que combina generación de habla en once idiomas con clonación de voz zero-shot. Con 601 millones de parámetros, ofrece una calidad de síntesis que sus autores califican como de clase SOTA en un tamaño compacto, lo que lo hace viable para despliegue en entornos con recursos limitados, incluida CPU mediante una variante ONNX INT4. El modelo se publica bajo licencia Apache 2.0 y se integra con el ecosistema Transformers de Hugging Face.

La arquitectura DualAR, inspirada en Fish Audio S2 Pro, utiliza dos transformadores autorregresivos: un modelo lento que predice tokens semánticos por cada frame de audio y un modelo rápido que predice los codebooks del códec neuronal condicionado por el estado oculto del primero. El códec integrado trabaja a 44,1 kHz y no requiere checkpoints adicionales. La ventana de contexto alcanza 2048 posiciones combinadas de texto y audio, y la versión actual es una vista previa con cobertura lingüística limitada a once idiomas recomendados, con planes de ampliación futura.

La relevancia de este modelo reside en su equilibrio entre tamaño reducido, capacidades multilingües y clonación de voz sin entrenamiento previo, lo que lo posiciona como una alternativa accesible para aplicaciones de voz sintética en producción, tanto en GPU como en CPU de bajos recursos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DualAR (slow AR + fast AR) |
| Parametros totales | 601.159.424 (excluyendo el codec) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2048 posiciones empaquetadas de texto/audio |
| Tipos de cuantizacion | INT4 (ONNX), FP16/BF16 (original) |
| Idiomas soportados | Cantonés, chino, neerlandés, inglés, francés, alemán, italiano, japonés, coreano, polaco, español |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (tambien disponible ONNX INT4) |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura DualAR compuesta por dos transformadores autorregresivos. El slow AR tiene 24 capas con anchura 896, 14 cabezas de atención y 2 cabezas KV, y predice un token semántico por cada frame de audio. El fast AR, con 4 capas de las mismas dimensiones, predice los 10 codebooks del códec neuronal (4096 entradas por codebook) condicionado por el estado oculto del slow AR y los codebooks anteriores. El códec integrado opera a 44,1 kHz con 2048 muestras por frame (~21,5 frames por segundo) y se encarga tanto de codificar el audio de referencia como de decodificar la forma de onda final.

No se han publicado detalles específicos sobre el dataset de entrenamiento, el número de tokens procesados ni si se aplicaron técnicas como RLHF o DPO. La inspiración declarada en Fish Audio S2 Pro sugiere un enfoque similar en el diseño, pero los datos concretos de entrenamiento no están disponibles en la información proporcionada. El modelo requiere `trust_remote_code=True` al cargarlo desde Transformers, lo que indica que incluye código personalizado para el procesador y la generación.

## Capacidades

- Generación de voz multilingüe en once idiomas: cantonés, chino mandarín, neerlandés, inglés, francés, alemán, italiano, japonés, coreano, polaco y español.
- Clonación de voz zero-shot: dado un audio de referencia y su transcripción exacta, el modelo replica la voz sin necesidad de fine-tuning.
- Síntesis sin referencia: permite generar habla con una voz por defecto si no se proporciona audio de referencia.
- Códec neuronal integrado a 44,1 kHz que gestiona la codificación y decodificación de audio sin dependencias externas.
- Despliegue en CPU mediante cuantización ONNX INT4, con un consumo de memoria de aproximadamente 1 GiB tras la carga.
- Compatibilidad con el ecosistema Transformers de Hugging Face, incluyendo procesador y modelo estándar.
- No se mencionan capacidades de tool calling, agentes ni razonamiento multimodal más allá del audio.

## Casos de uso

- Atención al cliente automatizada: el modelo puede generar respuestas de voz naturales en varios idiomas, integrado en sistemas IVR o asistentes virtuales, gracias a su baja latencia y soporte multilingüe.
- Audiolibros y contenido narrativo: permite sintetizar narraciones en once idiomas con clonación de voz para mantener una voz consistente en series largas, usando su contexto de 2048 posiciones para párrafos extensos.
- Asistentes de voz para personas con discapacidad: la clonación zero-shot posibilita crear voces personalizadas a partir de grabaciones breves, mejorando la accesibilidad en dispositivos de comunicación aumentativa.
- Doblaje y localización de vídeo: con la clonación de voz, se puede reutilizar la voz de un actor original en diferentes idiomas, reduciendo costes de producción en contenidos multilingües.
- Generación de contenido educativo: creación de lecciones de idiomas o material de pronunciación en múltiples lenguas, aprovechando la cobertura del modelo para practicar acentos y entonación.
- Despliegue en dispositivos edge: la variante ONNX INT4 permite ejecutar síntesis de voz en Raspberry Pi o portátiles sin GPU, ideal para asistentes offline o prototipos de hardware.
- Investigación en síntesis de voz: el checkpoint abierto y la arquitectura documentada facilitan experimentos de fine-tuning y comparación con otros modelos TTS en entornos académicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas como MOS (Mean Opinion Score), WER (Word Error Rate) ni comparaciones cuantitativas con otros modelos TTS. Los únicos datos de rendimiento mencionados son el consumo de memoria en CPU ONNX INT4 (~1 GiB) y la frecuencia de frames del códec (21,5 frames por segundo).

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo en BF16/FP16 ocupa aproximadamente 1,2 GB solo en pesos (601 M parámetros × 2 bytes), más overhead de activaciones y KV cache. En la práctica, una GPU con 4 GB de VRAM sería suficiente para inferencia básica.
- GPU recomendadas: cualquier GPU CUDA moderna con al menos 4 GB de VRAM (RTX 3050, RTX 4060, etc.). Para procesamiento por lotes o baja latencia, se recomienda RTX 4090 o A100, aunque no es imprescindible.
- En consumer GPU: sí, cabe en GPUs de gama media como RTX 3060 o superiores.
- Opciones de despliegue: Transformers con PyTorch en GPU, ONNX Runtime con CPUExecutionProvider para CPU, y soporte para CLI, servicio HTTP y streaming PCM según el repositorio GitHub.
- Latencia y throughput: no se proporcionan datos numéricos específicos. La arquitectura DualAR con solo 4 capas en el fast AR sugiere una generación razonablemente rápida, pero sin cifras oficiales no se puede cuantificar.

## Comparativa con modelos similares

No se dispone de datos suficientes para una comparativa cuantitativa fiable. Como referencia cualitativa, el modelo se inspira en Fish Audio S2 Pro (que usa una arquitectura similar pero con más parámetros) y compite con alternativas como XTTS v2 (467 M parámetros) o VITS (menor calidad pero más ligero). Sin embargo, al no haber benchmarks publicados de Audio8 TTS, no es posible realizar una comparación objetiva de rendimiento. La licencia Apache 2.0 es más permisiva que muchas alternativas comerciales, lo que favorece su adopción en proyectos propietarios.

## Limitaciones y advertencias

- Estado de vista previa: la cobertura lingüística está limitada a once idiomas recomendados; otros idiomas pueden producir resultados degradados. El modelo no soporta dialectos chinos adicionales en esta versión.
- Riesgo de alucinación en la transcripción: la clonación zero-shot requiere que la transcripción de referencia coincida exactamente con el audio; si no es así, la salida puede ser ininteligible.
- Sesgos potenciales: al ser un modelo entrenado con datos no especificados, puede reflejar sesgos de género, edad o acento presentes en el corpus de entrenamiento, aunque no se documentan explícitamente.
- Dependencia de código remoto: el uso de `trust_remote_code=True` implica ejecutar código arbitrario del repositorio, lo que conlleva riesgos de seguridad si se utiliza una copia no verificada (como el repositorio EllaPriest45 en lugar del oficial Audio8).
- Restricciones de uso comercial: la licencia Apache 2.0 permite uso comercial sin restricciones, pero se recomienda revisar los términos del repositorio original por si hubiera condiciones adicionales.
- Requisitos de hardware: aunque la versión ONNX INT4 funciona en CPU, la calidad puede degradarse respecto a la versión FP16 en GPU, y no se especifica el rendimiento en términos de velocidad de síntesis.

## Enlaces

- Repositorio HuggingFace oficial: https://huggingface.co/Audio8/Audio8-TTS-Preview-0.6b
- Repositorio HuggingFace del usuario EllaPriest45: https://huggingface.co/EllaPriest45/Audio8-TTS-0.6B
- GitHub del proyecto: https://github.com/Audio8-AI/Audio8_TTS
- Demo de escucha: https://audio8-ai.github.io/Audio8_TTS/
- Modelo ONNX INT4 para CPU: https://huggingface.co/Audio8/Audio8-TTS-Preview-0.6B-ONNX-INT4
